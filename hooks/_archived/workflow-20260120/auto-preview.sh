#!/usr/bin/env bash
# auto-preview.sh
# PostToolUse (Task) Hook - 自動開啟 TESTER 成果預覽
#
# 功能：
# - 當 TESTER 返回 PASS 時，自動開啟 output URL/檔案
# - 支援跨平台（macOS、Linux、Windows）
# - 根據檔案類型選擇適當的應用程式
#
# 輸入：從 stdin 接收 JSON 格式的 hook input
# {
#   "tool_name": "Task",
#   "tool_input": { "subagent_type": "tester" },
#   "tool_output": "... pass ... output: http://localhost:3000/dashboard ..."
# }

set -euo pipefail

# ===== 常數定義 =====
readonly SUPPORTED_EXTENSIONS="html|md|pdf"
readonly DEFAULT_DELAY_SEC=1
readonly MAX_PATH_LENGTH=1024
readonly MAX_FILE_SIZE=$((100 * 1024 * 1024))  # 100MB DoS 防護
readonly FORBIDDEN_DIRS="^/(etc|bin|sbin|usr|var|root|lib|lib64|boot|proc|sys|dev|System|private|opt|tmp)"

# ===== 讀取配置 =====
CONFIG_FILE="${HOME}/.claude/workflow-config.json"
AUTO_OPEN=$(jq -r '.preview.autoOpenOnTaskComplete // true' "$CONFIG_FILE" 2>/dev/null || echo "true")
DELAY_MS=$(jq -r '.preview.delayMs // 1000' "$CONFIG_FILE" 2>/dev/null || echo "1000")

# 如果未啟用自動預覽，直接退出
if [[ "$AUTO_OPEN" != "true" ]]; then
  exit 0
fi

# 從 stdin 讀取 hook input
HOOK_INPUT=$(cat)

# 檢查是否為 Task 工具
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""')
if [[ "$TOOL_NAME" != "Task" ]]; then
  exit 0
fi

# 檢查是否為 tester agent
SUBAGENT_TYPE=$(echo "$HOOK_INPUT" | jq -r '.tool_input.subagent_type // ""')
if [[ "$SUBAGENT_TYPE" != "tester" ]]; then
  exit 0
fi

# 獲取 tool output
TOOL_OUTPUT=$(echo "$HOOK_INPUT" | jq -r '.tool_output // ""')

# 檢查是否包含 "pass" (不區分大小寫)
if ! echo "$TOOL_OUTPUT" | grep -qi "pass"; then
  exit 0
fi

# 從輸出中提取 output URL/路徑
# 支援的模式：
# - "output: <path>"
# - "Output: <path>"
# - "preview: <path>"
# - "url: <path>"
OUTPUT=$(echo "$TOOL_OUTPUT" | grep -oiE "(output|preview|url):\s*\S+" | head -n1 | sed -E 's/(output|preview|url):\s*//i' | xargs)

# 如果沒有找到 output，嘗試提取 http/https URL
if [[ -z "$OUTPUT" ]]; then
  OUTPUT=$(echo "$TOOL_OUTPUT" | grep -oE 'https?://[^\s]+' | head -n1)
fi

# 如果仍然沒有找到，嘗試提取檔案路徑（.html, .md, .pdf）
if [[ -z "$OUTPUT" ]]; then
  OUTPUT=$(echo "$TOOL_OUTPUT" | grep -oE '/[^\s]+\.(html|md|pdf)' | head -n1)
fi

# ===== 路徑安全性驗證函數 =====
sanitize_path() {
  local path="$1"

  # 1. 檢查路徑長度
  if [[ ${#path} -gt $MAX_PATH_LENGTH ]]; then
    echo "⚠️  路徑過長（超過 $MAX_PATH_LENGTH 字元）" >&2
    return 1
  fi

  # 2. 如果是 URL（嚴格驗證，移除 & 和 ! 等危險字元）
  local url_pattern='^https?://[a-zA-Z0-9._~:/?#@,=-]+$'
  if [[ "$path" =~ $url_pattern ]]; then
    echo "$path"
    return 0
  fi

  # 3. 路徑遍歷攻擊檢查（包含 URL 編碼變體）
  if [[ "$path" =~ \.\. ]] || [[ "$path" =~ %2e%2e ]] || [[ "$path" =~ %2E%2E ]]; then
    echo "⚠️  路徑遍歷攻擊被阻擋: $path" >&2
    return 1
  fi

  # 4. 禁止危險字元（允許空格和其他安全字元）
  if [[ "$path" =~ [\;\&\|\`\$\(\)\<\>] ]]; then
    echo "⚠️  路徑包含危險字元: $path" >&2
    return 1
  fi

  # 5. 檢查副檔名
  if [[ ! "$path" =~ \.($SUPPORTED_EXTENSIONS)$ ]]; then
    echo "⚠️  不支援的檔案類型: $path" >&2
    return 1
  fi

  # 6. 規範化路徑（使用 realpath，相容不同版本）
  local normalized_path
  if ! normalized_path=$(realpath -m "$path" 2>/dev/null || realpath "$path" 2>/dev/null); then
    echo "⚠️  路徑無法規範化: $path" >&2
    return 1
  fi

  # 7. 確保路徑在使用者目錄內
  if [[ ! "$normalized_path" =~ ^"$HOME" ]]; then
    echo "⚠️  路徑必須在使用者目錄內: $path" >&2
    return 1
  fi

  # 8. 禁止訪問系統敏感目錄（雙重檢查）
  if [[ "$normalized_path" =~ $FORBIDDEN_DIRS ]]; then
    echo "⚠️  禁止訪問系統目錄: $path" >&2
    return 1
  fi

  echo "$normalized_path"
  return 0
}

# 如果沒有找到任何 output，靜默退出
if [[ -z "$OUTPUT" ]]; then
  exit 0
fi

# ===== 路徑安全性驗證 =====
OUTPUT=$(sanitize_path "$OUTPUT")
if [[ $? -ne 0 ]] || [[ -z "$OUTPUT" ]]; then
  echo "⚠️  路徑驗證失敗，放棄開啟預覽" >&2
  exit 0
fi

# ===== 延遲（使用純 bash，移除 bc 依賴）=====
DELAY_SEC=$((DELAY_MS / 1000))
if [[ $DELAY_SEC -lt 1 ]]; then
  DELAY_SEC=$DEFAULT_DELAY_SEC
fi
sleep "$DELAY_SEC"

# ===== 跨平台開啟命令 =====
open_file() {
  local file="$1"

  # 空路徑檢查（防禦性編程）
  if [[ -z "$file" ]]; then
    echo "⚠️  無法開啟：路徑為空" >&2
    return 1
  fi

  case "$(uname)" in
    Darwin)
      open "$file" || {
        echo "⚠️  macOS open 命令失敗: $file" >&2
        return 1
      }
      ;;
    Linux)
      xdg-open "$file" 2>/dev/null || {
        echo "⚠️  Linux xdg-open 命令失敗: $file" >&2
        return 1
      }
      ;;
    MINGW*|CYGWIN*|MSYS*)
      # Windows 路徑字元驗證（嚴格白名單）
      if [[ ! "$file" =~ ^https?:// ]] && [[ "$file" =~ [^a-zA-Z0-9:/\\_.-] ]]; then
        echo "⚠️  Windows 不支援此路徑格式: $file" >&2
        return 1
      fi
      # Windows 命令注入防護：使用 cmd.exe /c start "" 並正確引號
      cmd.exe /c start "" "$file" 2>/dev/null || {
        echo "⚠️  Windows start 命令失敗: $file" >&2
        return 1
      }
      ;;
    *)
      # 未知平台，嘗試常見命令
      if command -v xdg-open &>/dev/null; then
        xdg-open "$file" || {
          echo "⚠️  xdg-open 命令失敗: $file" >&2
          return 1
        }
      elif command -v open &>/dev/null; then
        open "$file" || {
          echo "⚠️  open 命令失敗: $file" >&2
          return 1
        }
      else
        echo "⚠️  無法自動開啟預覽：未找到適當的開啟命令（xdg-open/open）" >&2
        return 1
      fi
      ;;
  esac
}

# ===== 安全性檢查函數 =====
check_file_safety() {
  local file="$1"

  # Symlink 檢查：確保不指向禁止目錄
  if [[ -L "$file" ]]; then
    local target
    target=$(readlink -f "$file" 2>/dev/null || realpath "$file" 2>/dev/null || echo "")
    if [[ -n "$target" ]] && [[ "$target" =~ $FORBIDDEN_DIRS ]]; then
      echo "⚠️  符號連結指向禁止目錄: $file -> $target" >&2
      return 1
    fi
  fi

  # 檔案大小檢查（DoS 防護）
  if [[ -f "$file" ]]; then
    local file_size
    file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [[ -z "$file_size" ]]; then
      echo "⚠️  無法取得檔案大小: $file" >&2
      return 1
    fi
    if [[ $file_size -gt $MAX_FILE_SIZE ]]; then
      echo "⚠️  檔案過大（$(( file_size / 1024 / 1024 ))MB），拒絕開啟" >&2
      return 1
    fi
  fi

  return 0
}

# ===== 判斷 output 類型並開啟 =====
if [[ "$OUTPUT" =~ ^https?:// ]]; then
  # HTTP/HTTPS URL（不需要 check_file_safety，因為是遠端資源而非本地檔案）
  echo "## 🖥️ 開啟預覽: $OUTPUT"
  open_file "$OUTPUT"

elif [[ "$OUTPUT" =~ \.html$ ]]; then
  # HTML 檔案
  if [[ -f "$OUTPUT" ]]; then
    if check_file_safety "$OUTPUT"; then
      echo "## 🖥️ 開啟預覽: $OUTPUT"
      open_file "$OUTPUT"
    fi
  else
    echo "⚠️  HTML 檔案不存在: $OUTPUT" >&2
  fi

elif [[ "$OUTPUT" =~ \.md$ ]]; then
  # Markdown 檔案
  if [[ -f "$OUTPUT" ]]; then
    if check_file_safety "$OUTPUT"; then
      echo "## 📄 開啟預覽: $OUTPUT"
      open_file "$OUTPUT"
    fi
  else
    echo "⚠️  Markdown 檔案不存在: $OUTPUT" >&2
  fi

elif [[ "$OUTPUT" =~ \.pdf$ ]]; then
  # PDF 檔案
  if [[ -f "$OUTPUT" ]]; then
    if check_file_safety "$OUTPUT"; then
      echo "## 📕 開啟預覽: $OUTPUT"
      open_file "$OUTPUT"
    fi
  else
    echo "⚠️  PDF 檔案不存在: $OUTPUT" >&2
  fi

else
  # 其他類型（sanitize_path 應該已經過濾掉不安全的類型）
  if [[ -e "$OUTPUT" ]]; then
    if check_file_safety "$OUTPUT"; then
      echo "## 📂 開啟: $OUTPUT"
      open_file "$OUTPUT"
    fi
  else
    echo "⚠️  檔案或目錄不存在: $OUTPUT" >&2
  fi
fi

exit 0
