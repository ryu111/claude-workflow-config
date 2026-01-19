# auto-preview.sh 第二輪安全性修復報告

## 修復日期
2026-01-19

## 修復概述
根據 REVIEWER 第二輪審查結果，修復了三個 🔴 Critical 等級的安全性問題。

---

## 🔴 問題 1：URL Regex 允許危險字元

### 問題描述
- **位置**: Line 87-88 `url_pattern`
- **問題**: URL 正則表達式允許 `$()*+` 等可能被 shell 解釋的危險字元
- **風險**: 命令注入攻擊

### 修復前
```bash
local url_pattern='^https?://[a-zA-Z0-9._~:/?#@!$&()*+,=-]+$'
```

### 修復後
```bash
# 移除危險字元 $ ( ) * +
local url_pattern='^https?://[a-zA-Z0-9._~:/?#@!&,=-]+$'
```

### 測試驗證
```bash
✅ http://localhost:3000/dashboard → 通過
✅ https://example.com/report.html → 通過
✅ http://example.com/$(whoami) → **已拒絕**
✅ http://example.com/* → **已拒絕**
✅ http://example.com/test+ → **已拒絕**
```

---

## 🔴 問題 2：路徑遍歷只替換不拒絕

### 問題描述
- **位置**: Line 95 `${path//\.\./\_}`
- **問題**: 將 `..` 替換為 `_`，而非直接拒絕
- **風險**: 攻擊者可能利用替換後的路徑訪問其他目錄

### 修復前
```bash
local cleaned_path="${path//\.\./_}"  # 替換 .. 為 _
```

### 修復後
```bash
# 1. 拒絕包含路徑遍歷的路徑（直接拒絕，不替換）
if [[ "$path" == *".."* ]]; then
  echo "⚠️  路徑遍歷攻擊被阻擋: $path" >&2
  return 1
fi
```

### 測試驗證
```bash
✅ /tmp/../etc/passwd.html → **已拒絕**
✅ /home/user/../../etc/shadow.html → **已拒絕**
✅ /tmp/report.html → 通過
```

---

## 🔴 問題 3：允許訪問任意系統目錄

### 問題描述
- **位置**: `sanitize_path()` 函數
- **問題**: 可以訪問 `/etc/passwd.html`、`/bin/bash.html` 等敏感系統目錄
- **風險**: 資訊洩露、潛在系統破壞

### 修復措施
新增 FORBIDDEN_DIRS 常數並在 sanitize_path() 中檢查：

```bash
# 1. 新增常數定義（Line 23）
readonly FORBIDDEN_DIRS="^/(etc|bin|sbin|usr|var|root|lib|lib64|boot|proc|sys|dev)"

# 2. 在 sanitize_path() 中加入檢查（Line 114-118）
# 4. 禁止訪問系統敏感目錄
if [[ "$cleaned_path" =~ $FORBIDDEN_DIRS ]]; then
  echo "⚠️  禁止訪問系統目錄: $path" >&2
  return 1
fi
```

### 測試驗證
```bash
✅ /etc/passwd.html → **已拒絕**
✅ /bin/bash.html → **已拒絕**
✅ /usr/bin/python.html → **已拒絕**
✅ /root/secret.html → **已拒絕**
✅ /var/log/system.html → **已拒絕**
✅ /home/user/report.html → 通過（允許用戶目錄）
✅ /tmp/test.html → 通過（允許臨時目錄）
```

---

## 完整安全性檢查清單

### ✅ 已修復

| 檢查項目 | 狀態 | 說明 |
|---------|------|------|
| **URL 安全字元驗證** | ✅ | 移除 `$()*+` 等危險字元 |
| **路徑遍歷攻擊防護** | ✅ | 直接拒絕包含 `..` 的路徑 |
| **系統目錄訪問控制** | ✅ | 禁止訪問 `/etc`、`/bin` 等 11 個系統目錄 |
| **路徑長度檢查** | ✅ | 限制 1024 字元（第一輪已修復） |
| **空路徑檢查** | ✅ | 防禦性檢查（第一輪已修復） |
| **命令注入防護** | ✅ | Windows 路徑引號保護（第一輪已修復） |
| **檔案類型限制** | ✅ | 只允許 `.html`、`.md`、`.pdf` |

---

## 安全性層級

`sanitize_path()` 函數現在包含 **5 層防護**：

1. **路徑長度檢查** → 防止緩衝區溢出攻擊
2. **URL 安全字元驗證** → 防止命令注入（URL 類型）
3. **路徑遍歷攻擊檢查** → 直接拒絕 `..`
4. **安全字元驗證** → 只允許 `[/.a-zA-Z0-9_-]` + 副檔名
5. **系統目錄禁止訪問** → 阻擋對 11 個敏感目錄的訪問

---

## 測試結果

執行 `auto-preview-security-test.sh`：

```
## 測試統計
- URL 安全性測試: 5/5 通過
- 路徑遍歷測試: 3/3 通過
- 系統目錄測試: 7/7 通過
- 路徑長度測試: 1/1 通過
- 檔案類型測試: 4/4 通過

## 總計: 20/20 ✅
```

---

## 修改檔案

| 檔案 | 變更類型 | 說明 |
|------|---------|------|
| `~/.claude/hooks/workflow/auto-preview.sh` | **修復** | 修復三個 Critical 安全性問題 |
| `~/.claude/hooks/workflow/auto-preview-security-test.sh` | **新增** | 完整的安全性測試套件 |
| `~/.claude/hooks/workflow/auto-preview-security-fixes-round2.md` | **新增** | 本修復報告 |

---

## 下一步

建議：
1. ✅ 所有 Critical 問題已修復
2. ✅ 測試套件已建立並通過
3. 可以請 REVIEWER 進行第三輪審查（如有需要）
4. 如無問題，可以標記為「生產就緒」

---

## Reviewer Sign-off

- [ ] 第二輪修復驗證
- [ ] 測試覆蓋度確認
- [ ] 批准部署到生產環境
