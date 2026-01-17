# Cleanup Skill - 專案清理指南

> 工作流最後一步：清理專案、歸檔成果、釋放空間

## 觸發條件

當以下情況發生時使用此 skill：
- 工作流所有任務完成
- 用戶要求「清理」「整理」「歸檔」
- Session 結束前

---

## 1. 刪除規則（Delete Rules）

### 1.1 必刪項目（Always Delete）

| 類型 | 路徑模式 | 說明 |
|------|----------|------|
| Python 快取 | `__pycache__/` | 可重新生成 |
| 編譯檔案 | `*.pyc`, `*.pyo` | 可重新生成 |
| Pytest 快取 | `.pytest_cache/` | 測試快取 |
| 覆蓋率快取 | `.coverage`, `htmlcov/` | 可重新生成 |
| 瀏覽器截圖 | `.agent-browser/` | 臨時測試截圖 |
| Node 快取 | `node_modules/.cache/` | 依賴快取 |
| IDE 設定 | `.idea/`, `.vscode/` (部分) | 個人偏好 |
| 系統檔案 | `.DS_Store`, `Thumbs.db` | 系統垃圾 |
| 日誌檔案 | `*.log` (非重要) | 臨時日誌 |
| 暫存檔案 | `*.tmp`, `*.temp`, `*.swp` | 暫存 |

### 1.2 刪除命令

```bash
# Python 相關
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null
find . -type f -name ".coverage" -delete 2>/dev/null
rm -rf htmlcov/ 2>/dev/null

# 瀏覽器測試截圖
rm -rf .agent-browser/ 2>/dev/null

# 系統檔案
find . -type f -name ".DS_Store" -delete 2>/dev/null
find . -type f -name "Thumbs.db" -delete 2>/dev/null

# 暫存檔案
find . -type f -name "*.tmp" -delete 2>/dev/null
find . -type f -name "*.temp" -delete 2>/dev/null
find . -type f -name "*.swp" -delete 2>/dev/null
```

### 1.3 條件刪除（Conditional Delete）

| 類型 | 條件 | 刪除 | 保留 |
|------|------|------|------|
| `node_modules/` | 有 `package.json` 且可重裝 | 可刪 | 正在開發中保留 |
| `dist/`, `build/` | 有建置腳本 | 可刪 | 部署前保留 |
| `.env.local` | 敏感資訊 | 不刪 | 永遠保留 |
| `*.log` | 重要錯誤日誌 | 不刪 | 歸檔保留 |

---

## 2. 歸檔規則（Archive Rules）

### 2.1 歸檔分類

```
project/
├── docs/
│   └── archive/           # 文檔歸檔
│       ├── design/        # 舊設計文檔
│       ├── specs/         # 舊規格文檔
│       └── task-reports/  # 任務報告
├── openspec/
│   └── archive/           # 完成的變更
│       └── [change-id]/
├── reports/
│   └── archive/           # 報告歸檔
│       ├── backtest/      # 回測報告
│       ├── performance/   # 效能報告
│       └── test/          # 測試報告
└── logs/
    └── archive/           # 日誌歸檔（重要的）
        └── YYYY-MM/
```

### 2.2 歸檔類別對照表

| 檔案類型 | 歸檔位置 | 命名規則 |
|----------|----------|----------|
| **OpenSpec 變更** | `openspec/archive/` | `[change-id]/` |
| **任務報告** | `docs/archive/task-reports/` | `TASK_*_SUMMARY.md` |
| **測試報告** | `reports/archive/test/` | `TEST_REPORT_*.md` |
| **回測報告** | `reports/archive/backtest/` | `BACKTEST_*.md` |
| **效能報告** | `reports/archive/performance/` | `PERF_*.md` |
| **舊設計文檔** | `docs/archive/design/` | 原檔名 |
| **舊 README** | `docs/guides/` | 原檔名 |
| **重要日誌** | `logs/archive/YYYY-MM/` | 原檔名 |

### 2.3 歸檔命令

```bash
# 1. 建立歸檔目錄結構
mkdir -p docs/archive/{design,specs,task-reports}
mkdir -p reports/archive/{backtest,performance,test}
mkdir -p logs/archive/$(date +%Y-%m)

# 2. 歸檔 OpenSpec 變更
# openspec archive [change-id] --yes

# 3. 歸檔任務報告
mv TASK_*_SUMMARY.md docs/archive/task-reports/ 2>/dev/null

# 4. 歸檔測試報告
mv TEST_REPORT_*.md reports/archive/test/ 2>/dev/null

# 5. 歸檔回測報告
mv BACKTEST_*.md reports/archive/backtest/ 2>/dev/null
```

### 2.4 歸檔判斷流程

```
檔案發現
    ↓
是否為程式碼或配置？ ──是→ 保留（不歸檔）
    ↓ 否
是否為文檔？
    ├── 是：是否過時或被取代？
    │       ├── 是 → 歸檔到 docs/archive/
    │       └── 否 → 保留
    └── 否
是否為報告？
    ├── 是：是否已完成的工作流產出？
    │       ├── 是 → 歸檔到 reports/archive/
    │       └── 否 → 保留（正在使用）
    └── 否
是否為日誌？
    ├── 是：是否包含重要錯誤資訊？
    │       ├── 是 → 歸檔到 logs/archive/
    │       └── 否 → 刪除
    └── 否
其他 → 詢問用戶
```

---

## 3. 保留規則（Keep Rules）

### 3.1 永遠保留

| 類型 | 說明 |
|------|------|
| `src/` | 核心程式碼 |
| `tests/` | 測試程式碼 |
| `docs/` (非 archive) | 當前文檔 |
| `*.py`, `*.ts`, `*.js` | 原始碼 |
| `requirements.txt`, `package.json` | 依賴定義 |
| `pyproject.toml`, `setup.py` | 專案配置 |
| `.env`, `.env.local` | 環境配置 |
| `.gitignore` | Git 配置 |
| `README.md`, `CHANGELOG.md` | 專案文檔 |
| `openspec/specs/` | 待執行規劃（Backlog） |

### 3.2 條件保留

| 類型 | 保留條件 |
|------|----------|
| `openspec/changes/[id]/` | 未完成的工作流 |
| 報告檔案 | 最近 7 天內生成 |
| 截圖 | 用戶明確要求保留 |
| 日誌 | 包含重要錯誤資訊 |

---

## 4. 執行流程

### 4.1 清理檢查清單

```
□ 1. 確認所有任務已完成
□ 2. 確認無未提交的程式碼變更
□ 3. 執行刪除操作（快取、臨時檔案）
□ 4. 執行歸檔操作（報告、文檔）
□ 5. 使用 openspec archive 歸檔變更
□ 6. 驗證專案仍可正常運行
□ 7. 輸出清理報告
```

### 4.2 清理報告格式

```
🧹 清理報告
═══════════════════════════════════════════════════════════

【刪除項目】
  🗑️ __pycache__/: XX 個目錄
  🗑️ .pytest_cache/: X 個目錄
  🗑️ .agent-browser/: XX 張截圖
  🗑️ *.pyc: X 個檔案
  🗑️ .coverage: 1 個檔案

【歸檔項目】
  📦 openspec/changes/[change-id]/ → openspec/archive/[change-id]/
  📦 TASK_*_SUMMARY.md → docs/archive/task-reports/ (X 個)
  📦 TEST_REPORT_*.md → reports/archive/test/ (X 個)

【保留項目】
  ✅ src/ (核心程式碼)
  ✅ tests/ (測試程式碼)
  ✅ docs/ (當前文檔)
  ✅ openspec/specs/ (待執行規劃)

【空間統計】
  - 刪除釋放：約 XX MB
  - 歸檔移動：約 XX MB
  - 根目錄項目：XX → XX (減少 XX 項)

═══════════════════════════════════════════════════════════
✅ 清理完成
```

---

## 5. 安全規則

### 5.1 禁止刪除

- **永遠不刪除** `.git/` 目錄
- **永遠不刪除** `.env` 檔案
- **永遠不刪除** 未提交的程式碼變更
- **永遠不刪除** 用戶明確要求保留的檔案

### 5.2 刪除前確認

對於以下情況，必須詢問用戶：
- 超過 100MB 的目錄
- 包含敏感關鍵字的檔案（password, secret, key）
- 最近 24 小時內修改的非快取檔案
- 無法識別的檔案類型

### 5.3 回滾機制

- 歸檔操作使用 `mv` 而非 `rm`
- 重要刪除前建立備份
- 記錄所有操作以便追蹤

---

## 6. 快速命令

### 一鍵清理（基本）

```bash
# 僅刪除快取和臨時檔案
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null; \
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null; \
find . -type f -name "*.pyc" -delete 2>/dev/null; \
find . -type f -name ".coverage" -delete 2>/dev/null; \
rm -rf .agent-browser/ htmlcov/ 2>/dev/null; \
find . -type f -name ".DS_Store" -delete 2>/dev/null
```

### 完整清理流程

```bash
# 1. 清理快取
# [執行上方一鍵清理命令]

# 2. 歸檔 OpenSpec（如果有完成的變更）
# openspec archive [change-id] --yes

# 3. 歸檔報告（如果有）
mkdir -p docs/archive/task-reports reports/archive/test
mv TASK_*_SUMMARY.md docs/archive/task-reports/ 2>/dev/null
mv TEST_REPORT_*.md reports/archive/test/ 2>/dev/null

# 4. 統計結果
echo "🧹 清理完成"
ls -la | wc -l | xargs -I {} echo "根目錄項目數：{}"
```

---

## 7. 與工作流整合

此 skill 應在以下時機自動執行：

1. **工作流結束時**（所有 tasks.md 任務完成後）
2. **用戶要求時**（「清理」「整理」關鍵字）
3. **Session 結束前**（可選）

### 工作流結束檢查清單

```
✅ 所有任務完成
✅ openspec archive [change-id] --yes
✅ /cleanup（使用此 skill）
✅ /ralph-loop:cancel-ralph
✅ 輸出「工作流完成，專案已清理」
```
