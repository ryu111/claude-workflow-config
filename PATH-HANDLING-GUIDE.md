# 路徑處理指南

## 問題診斷

**日期**：2026-01-16
**問題**：Desktop 上出現兩個目錄 `side project` 和 `side\ project`

### 根本原因

當專案路徑包含空格時（如 `~/Desktop/side project`），錯誤的路徑處理方式：

```bash
# ❌ 錯誤：使用反斜線轉義
cd ~/Desktop/side\ project

# ❌ 錯誤：導致建立名為 "side\ project" 的目錄
mkdir ~/Desktop/side\ project/新目錄
```

上述命令會建立一個**字面上包含反斜線字元**的目錄：`side\ project`

### 正確處理方式

```bash
# ✅ 正確：使用雙引號包裹完整路徑
cd ~/Desktop/"side project"

# ✅ 正確：建立子目錄
mkdir ~/Desktop/"side project"/新目錄

# ✅ 正確：使用變數
PROJECT_DIR=~/Desktop/"side project"
cd "$PROJECT_DIR"
```

---

## 🔧 Agents 路徑處理規範

### ARCHITECT Agent

當建立 OpenSpec 目錄時：

```bash
# ❌ 錯誤
mkdir $PWD/openspec/changes/change-id

# ✅ 正確
mkdir "$PWD/openspec/changes/change-id"
```

### 所有 Agents 使用 Bash 工具時

**強制規則**：所有包含變數或可能有空格的路徑**必須**用雙引號包裹。

```bash
# ✅ 正確範例
cd "$PWD"
mkdir -p "$PWD/openspec/changes/$CHANGE_ID"
cp "$SOURCE_FILE" "$DEST_DIR/"
git add "$PWD/openspec/changes/$CHANGE_ID/"
```

### Write/Read/Edit 工具

使用 file_path 參數時，路徑會自動處理，但仍建議：

```python
# ✅ 推薦：使用完整絕對路徑
Write(file_path=f"{PWD}/openspec/changes/{change_id}/proposal.md")

# ❌ 避免：使用相對路徑拼接
Write(file_path=f"./openspec/changes/{change_id}/proposal.md")
```

---

## 🛡️ 防範措施

### 1. Bash 命令檢查清單

在執行 Bash 命令前檢查：

- [ ] 所有變數都用雙引號包裹：`"$VAR"`
- [ ] 所有包含空格的路徑都用雙引號：`"path with spaces"`
- [ ] 路徑拼接使用雙引號：`"$BASE_DIR/$SUB_DIR"`

### 2. 路徑變數定義

```bash
# ✅ 定義時就加引號
PROJECT_DIR=~/Desktop/"side project"
CHANGE_DIR="$PROJECT_DIR/openspec/changes/change-id"

# ✅ 使用時也加引號
cd "$CHANGE_DIR"
```

### 3. 常見陷阱

```bash
# ❌ 陷阱 1：find 命令
find ~/Desktop/side\ project -name "*.md"  # 錯誤！

# ✅ 正確
find ~/Desktop/"side project" -name "*.md"

# ❌ 陷阱 2：for 循環
for file in $(ls ~/Desktop/side\ project); do  # 錯誤！

# ✅ 正確
for file in ~/Desktop/"side project"/*; do

# ❌ 陷阱 3：grep
grep "keyword" ~/Desktop/side\ project/*.md  # 錯誤！

# ✅ 正確
grep "keyword" ~/Desktop/"side project"/*.md
```

---

## 🔍 檢測錯誤目錄

如果懷疑有錯誤的目錄（包含反斜線字元）：

```bash
# 1. 檢視目錄名稱的實際字元
cd ~/Desktop
ls -ld side* | xxd | grep "side"

# 2. 查找包含反斜線的目錄
find ~/Desktop -name "*\\*" -type d

# 3. 刪除錯誤目錄（使用雙引號包裹完整名稱）
rm -rf "side\ project"
```

---

## 📋 本次問題解決摘要

### 執行步驟

1. ✅ 識別兩個目錄：`side project`（正確）和 `side\ project`（錯誤）
2. ✅ 確認錯誤目錄中的重要檔案：`ProgressBar.test.tsx`
3. ✅ 複製重要檔案到正確目錄
4. ✅ 刪除錯誤目錄：`rm -rf "side\ project"`
5. ✅ 驗證所有重要內容完整

### 保存的檔案

- `ProgressBar.test.tsx` (621 行測試套件) - 已複製到正確目錄
- 所有 openspec 檔案 - 原本就在正確目錄
- 所有專案檔案 - 原本就在正確目錄

---

## 💡 最佳實踐

### 專案目錄命名建議

```bash
# ✅ 推薦：使用連字號或底線
~/Desktop/side-project
~/Desktop/side_project

# ⚠️ 可用但需小心：使用空格
~/Desktop/"side project"  # 必須一致使用引號

# ❌ 避免：特殊字元
~/Desktop/side\ project  # 反斜線本身會造成問題
~/Desktop/side$project   # 美元符號會被解析為變數
```

### Bash 工具使用範本

```bash
# 範本：建立 OpenSpec 目錄
CHANGE_ID="feature-name"
PROJECT_ROOT="$PWD"
CHANGE_DIR="$PROJECT_ROOT/openspec/changes/$CHANGE_ID"

mkdir -p "$CHANGE_DIR"
cd "$CHANGE_DIR"

# 範本：複製檔案
SOURCE="$PROJECT_ROOT/templates/proposal.md"
DEST="$CHANGE_DIR/proposal.md"
cp "$SOURCE" "$DEST"

# 範本：Git 操作
git add "$CHANGE_DIR/"
git commit -m "feat: add $CHANGE_ID"
```

---

## ⚠️ 緊急修復

如果發現建立了錯誤目錄：

```bash
# 1. 立即停止工作
# 2. 列出錯誤目錄內容
find "錯誤目錄名" -type f

# 3. 複製重要檔案到正確位置
cp -r "錯誤目錄/重要檔案" "正確目錄/"

# 4. 確認複製完成後刪除錯誤目錄
rm -rf "錯誤目錄名"

# 5. 驗證
ls -la "正確目錄"
```

---

**建立日期**：2026-01-16
**最後更新**：2026-01-16
**狀態**：已解決

**下次遇到路徑問題時，請參考此文檔！**
