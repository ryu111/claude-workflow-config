# auto-preview.sh 安全性修復報告

## 變更摘要

- **修改檔案**: `~/.claude/hooks/workflow/auto-preview.sh`
- **變更類型**: 安全性修復 + 穩定性改善
- **影響範圍**: `sanitize_path()`, `open_file()`, 延遲計算邏輯
- **審查狀態**: 等待 REVIEWER 二次驗證

---

## 🔴 Critical 修復

### 1. 路徑注入防護（Path Injection）

**問題**：
```bash
# 攻擊範例
OUTPUT="/etc/../../../etc/passwd"  # 路徑遍歷
OUTPUT="$(rm -rf /)"               # 命令注入
```

**修復**：
```bash
sanitize_path() {
  # 1. 長度檢查（防 DoS）
  if [[ ${#path} -gt $MAX_PATH_LENGTH ]]; then
    return 1
  fi

  # 2. URL 白名單驗證
  local url_pattern='^https?://[a-zA-Z0-9._~:/?#@!$&()*+,=-]+$'
  if [[ "$path" =~ $url_pattern ]]; then
    echo "$path"
    return 0
  fi

  # 3. 移除路徑遍歷字元
  local cleaned_path="${path//\.\./_}"  # .. → _

  # 4. 檔案路徑格式驗證
  if [[ ! "$cleaned_path" =~ ^[/.a-zA-Z0-9_-]+\.($SUPPORTED_EXTENSIONS)$ ]]; then
    return 1
  fi

  echo "$cleaned_path"
}
```

**測試驗證**：
```bash
# 輸入：/etc/../tmp/evil.html
# 輸出：/etc/_/tmp/evil.html（無害化）

# 輸入：/very/long/path... (1025+ 字元)
# 輸出：拒絕（路徑過長）
```

---

### 2. 移除 bc 依賴（穩定性）

**問題**：
```bash
# bc 可能未安裝，導致腳本失敗
DELAY_SEC=$(echo "scale=3; $DELAY_MS / 1000" | bc 2>/dev/null || echo "1")
```

**修復**：
```bash
# 使用純 bash 算術
DELAY_SEC=$((DELAY_MS / 1000))
if [[ $DELAY_SEC -lt 1 ]]; then
  DELAY_SEC=$DEFAULT_DELAY_SEC
fi
```

---

### 3. Windows 命令注入防護

**問題**：
```bash
# 錯誤：檔名可能包含特殊字元觸發命令注入
start "$file" 2>/dev/null
```

**修復**：
```bash
# 正確：使用 cmd.exe /c 並加引號
cmd.exe /c start "" "$file" 2>/dev/null
```

**原理**：
- `start ""` 第一個參數是視窗標題（防止檔名被當作標題）
- `"$file"` 確保路徑被正確引號包裹

---

## 🟡 Important 改善

### 4. 提取常數（可維護性）

**新增常數定義**：
```bash
readonly SUPPORTED_EXTENSIONS="html|md|pdf"
readonly DEFAULT_DELAY_SEC=1
readonly MAX_PATH_LENGTH=1024
```

**優點**：
- 單一來源管理配置
- 避免 magic number
- 方便未來擴展

---

### 5. 改善錯誤處理

**改善前**：
```bash
open_file "$OUTPUT" || echo "⚠️ 無法開啟 URL: $OUTPUT" >&2
```

**改善後**：
```bash
# 1. 函數內部處理錯誤
open_file() {
  open "$file" || {
    echo "⚠️ macOS open 命令失敗: $file" >&2
    return 1
  }
}

# 2. 主邏輯加入更詳細提示
if [[ -f "$OUTPUT" ]]; then
  open_file "$OUTPUT"
else
  echo "⚠️ HTML 檔案不存在: $OUTPUT" >&2
  echo "   檢查路徑是否正確或是否為相對路徑" >&2
fi
```

**優點**：
- 平台特定錯誤訊息
- 檔案不存在時提供除錯建議
- 錯誤訊息一致性

---

## 測試建議（給 TESTER）

### 安全性測試

```bash
# 1. 路徑遍歷攻擊
echo '{"tool_name":"Task","tool_input":{"subagent_type":"tester"},"tool_output":"pass. output: /etc/../tmp/evil.html"}' | ./auto-preview.sh

# 2. 過長路徑（1025 字元）
echo '{"tool_name":"Task","tool_input":{"subagent_type":"tester"},"tool_output":"pass. output: /'"$(printf 'a%.0s' {1..1025})"'.html"}' | ./auto-preview.sh

# 3. 命令注入嘗試
echo '{"tool_name":"Task","tool_input":{"subagent_type":"tester"},"tool_output":"pass. output: test.html; rm -rf /"}' | ./auto-preview.sh
```

### 功能測試

```bash
# 4. 正常 URL
echo '{"tool_name":"Task","tool_input":{"subagent_type":"tester"},"tool_output":"pass. output: https://example.com"}' | ./auto-preview.sh

# 5. 正常檔案路徑
echo '{"tool_name":"Task","tool_input":{"subagent_type":"tester"},"tool_output":"pass. output: /tmp/test.html"}' | ./auto-preview.sh

# 6. 不存在的檔案（錯誤處理）
echo '{"tool_name":"Task","tool_input":{"subagent_type":"tester"},"tool_output":"pass. output: /nonexistent/file.html"}' | ./auto-preview.sh
```

### 跨平台測試

- [ ] macOS: `open` 命令
- [ ] Linux: `xdg-open` 命令
- [ ] Windows: `cmd.exe /c start ""` 命令

---

## Checklist

- [x] 路徑注入防護（`..` 替換、格式驗證）
- [x] 移除 bc 依賴（純 bash 實作）
- [x] Windows 命令注入防護（`cmd.exe /c start ""`）
- [x] 提取常數（`SUPPORTED_EXTENSIONS`, `MAX_PATH_LENGTH`）
- [x] 改善錯誤處理（平台特定訊息、除錯建議）
- [x] 語法檢查通過（`bash -n`）
- [x] 基本功能測試（URL、路徑注入攻擊）
- [ ] **REVIEWER 二次審查**
- [ ] **TESTER 完整測試**（安全性 + 功能 + 跨平台）

---

## 預期影響

### 安全性
- ✅ 防止路徑遍歷攻擊
- ✅ 防止命令注入（Windows）
- ✅ 防止 DoS（路徑長度限制）

### 穩定性
- ✅ 移除外部依賴（bc）
- ✅ 更詳細的錯誤訊息
- ✅ 跨平台相容性改善

### 可維護性
- ✅ 常數集中管理
- ✅ 函數職責更清晰
- ✅ 程式碼結構改善（區塊註解）

---

## 後續建議

1. **單元測試框架**（可選）
   - 使用 `bats-core` 或 `shunit2`
   - 自動化安全性測試

2. **配置擴展**（未來）
   ```json
   {
     "preview": {
       "maxPathLength": 1024,
       "allowedExtensions": ["html", "md", "pdf", "txt"],
       "trustedDomains": ["localhost", "127.0.0.1"]
     }
   }
   ```

3. **日誌記錄**（可選）
   - 記錄所有開啟的檔案/URL
   - 方便審計和除錯
