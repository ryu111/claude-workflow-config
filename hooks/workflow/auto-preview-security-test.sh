#!/usr/bin/env bash
# auto-preview-security-test.sh
# 測試 auto-preview.sh 的安全性修復

set -euo pipefail

echo "## 🧪 測試 auto-preview.sh 安全性修復"
echo ""

# 測試用的 sanitize_path 函數（複製自 auto-preview.sh）
readonly SUPPORTED_EXTENSIONS="html|md|pdf"
readonly MAX_PATH_LENGTH=1024
readonly FORBIDDEN_DIRS="^/(etc|bin|sbin|usr|var|root|lib|lib64|boot|proc|sys|dev)"

sanitize_path() {
  local path="$1"

  # 檢查路徑長度
  if [[ ${#path} -gt $MAX_PATH_LENGTH ]]; then
    echo "⚠️  路徑過長（超過 $MAX_PATH_LENGTH 字元），可能是攻擊行為" >&2
    return 1
  fi

  # 如果是 URL，允許（基本驗證）
  # 移除危險字元，只允許 URL 安全字元
  local url_pattern='^https?://[a-zA-Z0-9._~:/?#@!&,=-]+$'
  if [[ "$path" =~ $url_pattern ]]; then
    echo "$path"
    return 0
  fi

  # 如果是檔案路徑
  # 1. 拒絕包含路徑遍歷的路徑（直接拒絕，不替換）
  if [[ "$path" == *".."* ]]; then
    echo "⚠️  路徑遍歷攻擊被阻擋: $path" >&2
    return 1
  fi

  local cleaned_path="$path"

  # 2. 只允許安全的檔案路徑字元
  if [[ ! "$cleaned_path" =~ ^[/.a-zA-Z0-9_-]+\.($SUPPORTED_EXTENSIONS)$ ]]; then
    echo "⚠️  不安全的路徑格式: $path" >&2
    return 1
  fi

  # 3. 轉換為絕對路徑（如果是相對路徑）
  if [[ ! "$cleaned_path" =~ ^/ ]]; then
    cleaned_path="$(pwd)/$cleaned_path"
  fi

  # 4. 禁止訪問系統敏感目錄
  if [[ "$cleaned_path" =~ $FORBIDDEN_DIRS ]]; then
    echo "⚠️  禁止訪問系統目錄: $path" >&2
    return 1
  fi

  echo "$cleaned_path"
  return 0
}

# 測試案例
test_case() {
  local name="$1"
  local input="$2"
  local expected_result="$3"

  echo "### 測試: $name"
  echo "輸入: $input"

  local result
  if result=$(sanitize_path "$input" 2>&1); then
    if [[ "$expected_result" == "PASS" ]]; then
      echo "✅ 通過 - 返回: $result"
    else
      echo "❌ 失敗 - 應該拒絕但通過了"
    fi
  else
    if [[ "$expected_result" == "REJECT" ]]; then
      echo "✅ 通過 - 已拒絕"
    else
      echo "❌ 失敗 - 應該通過但被拒絕了"
    fi
  fi
  echo ""
}

echo "## 1. URL 安全性測試"
echo ""

test_case "正常 HTTP URL" "http://localhost:3000/dashboard" "PASS"
test_case "正常 HTTPS URL" "https://example.com/report.html" "PASS"
test_case "包含危險字元 \$" "http://example.com/\$(whoami)" "REJECT"
test_case "包含危險字元 *" "http://example.com/*" "REJECT"
test_case "包含危險字元 +" "http://example.com/test+" "REJECT"

echo "## 2. 路徑遍歷攻擊測試"
echo ""

test_case "路徑遍歷 - 基本" "/tmp/../etc/passwd.html" "REJECT"
test_case "路徑遍歷 - 多層" "/home/user/../../etc/shadow.html" "REJECT"
test_case "正常路徑" "/tmp/report.html" "PASS"

echo "## 3. 系統目錄訪問測試"
echo ""

test_case "訪問 /etc" "/etc/passwd.html" "REJECT"
test_case "訪問 /bin" "/bin/bash.html" "REJECT"
test_case "訪問 /usr" "/usr/bin/python.html" "REJECT"
test_case "訪問 /root" "/root/secret.html" "REJECT"
test_case "訪問 /var" "/var/log/system.html" "REJECT"
test_case "訪問 /home（允許）" "/home/user/report.html" "PASS"
test_case "訪問 /tmp（允許）" "/tmp/test.html" "PASS"

echo "## 4. 路徑長度測試"
echo ""

# 產生超長路徑
LONG_PATH=$(printf '/tmp/%0.s' {1..300})report.html
test_case "超長路徑" "$LONG_PATH" "REJECT"

echo "## 5. 檔案類型測試"
echo ""

test_case "HTML 檔案" "/tmp/report.html" "PASS"
test_case "Markdown 檔案" "/tmp/README.md" "PASS"
test_case "PDF 檔案" "/tmp/document.pdf" "PASS"
test_case "不支援的類型" "/tmp/script.sh" "REJECT"

echo "## ✅ 測試完成"
