---
name: workflow
description: 自動化多代理工作流系統。當用戶提到「規劃」、「接手」或「工作流」時啟動。包含 ARCHITECT、DESIGNER、DEVELOPER、REVIEWER、TESTER、DEBUGGER 六大專業代理的協作流程，使用 OpenSpec 進行規格驅動開發。
---

# Automated Multi-Agent Workflow

完整的自動化開發工作流，使用 OpenSpec 進行規格驅動開發。

## Quick Start

```
USER INPUT → MAIN AGENT → SUB-AGENT → result → MAIN decides next
```

## Trigger Keywords

**適用於任何模式（包括 plan mode），不受對話模式限制**

| 關鍵字 | 動作 | 說明 |
|--------|------|------|
| `規劃 [feature]` | ARCHITECT 建立新的 OpenSpec | 從頭開始規劃，建立 proposal + tasks |
| `接手 [change-id]` | 讀取現有 OpenSpec 繼續執行 | 從斷點恢復，繼續未完成的任務 |
| `工作流 [change-id]` | 同上，讀取現有 OpenSpec | 恢復並執行 D→R→T 循環 |
| `loop` | 持續執行直到完成 | 配合上述關鍵字使用 |

### 使用範例

```bash
# 新功能 - 從頭規劃
規劃 用戶登入功能

# 接手現有任務
接手 add-user-auth

# 工作流執行
工作流 add-user-auth loop

# 規劃後立即執行
規劃 購物車功能 loop
```

## OpenSpec 目錄結構（Kanban 三階段）

**重要**：所有規格檔案存放在**專案目錄**內，不是全域目錄。

```
project/
└── openspec/
    ├── project.md              # 專案慣例
    ├── specs/                  # 待執行（Backlog）
    │   └── [change-id]/
    │       ├── proposal.md     # 完整規劃
    │       ├── tasks.md ☐☐☐    # 任務清單（未開始）
    │       └── notes.md        # 規劃筆記
    ├── changes/                # 進行中（WIP）
    │   └── [change-id]/
    │       ├── proposal.md
    │       ├── tasks.md ☑☐☐    # 任務清單（部分完成）
    │       └── notes.md
    └── archive/                # 已完成（Done）
        └── [change-id]/
            ├── proposal.md
            ├── tasks.md ☑☑☑    # 任務清單（全部完成）
            └── notes.md
```

### 階段轉換

| 轉換 | 時機 | 指令 |
|------|------|------|
| 規劃 → 待執行 | 規劃完成 | 建立在 `specs/[id]/` |
| 待執行 → 進行中 | 開始執行 | `mv openspec/specs/[id] openspec/changes/[id]` |
| 進行中 → 已完成 | 全部完成 | `openspec archive [id] --yes` |

### Kanban 看板視圖

```
specs/          →      changes/       →      archive/
────────────────────────────────────────────────────────
待執行 (Backlog)      進行中 (WIP)         已完成 (Done)

• 企劃 A            • 企劃 C             • 企劃 X
• 企劃 B            • 企劃 D             • 企劃 Y
```

## Six Agents

| Agent | Keywords | Role |
|-------|----------|------|
| ARCHITECT | 規劃, plan | 建立 OpenSpec proposal + tasks |
| DESIGNER | 設計, design, UI, UX, 介面 | UI/UX 規格 |
| DEVELOPER | 實作, implement | 寫程式碼 |
| REVIEWER | 審查, review | 程式碼審查 |
| TESTER | 測試, test | 執行測試 |
| DEBUGGER | debug, 除錯 | 修復錯誤 |

For detailed agent specifications, read `references/agents.md`.

## Available Flows

系統支援多種工作流程，根據任務類型選擇適當的流程。

| 流程 | 用途 | 觸發 |
|------|------|------|
| **D→R→T** | 標準開發流程 | 一般程式碼開發 |
| **S→W** | Skill 建立流程 | 建立新 skill |
| **M→S→W→D→R→T** | 遷移流程 | 工具/框架遷移 |

### Flow Index

```
┌─────────────────────────────────────────────────────────────┐
│  D→R→T (基本)                                               │
│  Developer → Reviewer → Tester                              │
│  適用：一般開發任務                                          │
├─────────────────────────────────────────────────────────────┤
│  S→W (Skill 建立)                                           │
│  Skills Agent → Workflow Agent (驗證)                       │
│  適用：建立新的 Claude Skill                                 │
│  詳細 → references/flows/skill-creation.md                  │
├─────────────────────────────────────────────────────────────┤
│  M→S→W→D→R→T (遷移)                                         │
│  Migration → Skills → Workflow → D→R→T                      │
│  適用：工具/框架遷移、版本升級                               │
│  詳細 → references/flows/migration.md                       │
└─────────────────────────────────────────────────────────────┘
```

### Flow Selection

Main Agent 根據任務類型自動選擇流程：

```
任務分析
    │
    ├─ "建立 skill" / "新增 skill"
    │   └─ S→W 流程
    │
    ├─ "遷移" / "替換" / "升級" / "migrate"
    │   └─ M→S→W→D→R→T 流程
    │
    └─ 其他開發任務
        └─ D→R→T 流程
```

For S→W flow details → read `references/flows/skill-creation.md`
For migration flow details → read `references/flows/migration.md`

## Workflow Modes

### Mode 1: 規劃（新功能）

```
用戶: 規劃 [feature]
     ↓
ARCHITECT 執行：
1. 分析 codebase
2. 建立 openspec/specs/[change-id]/    ← 放到「待執行」
   ├── proposal.md
   ├── tasks.md ☐☐☐
   └── notes.md
3. 等待用戶審核
     ↓
用戶審核通過，準備執行：
mv openspec/specs/[change-id] openspec/changes/[change-id]
```

### Mode 1.5: ⚡ 並行任務分配（規劃後、執行前）

**規劃完成後，執行前必須分析任務依賴並分配並行批次！**

```
tasks.md 完成
     ↓
分析任務依賴關係
     ↓
分配 Phase Batches（可並行的任務群組）
     ↓
使用 TodoWrite 建立 phase todos
     ↓
開始執行
```

#### 依賴分析規則

| 依賴類型 | 判斷依據 | 處理方式 |
|----------|----------|----------|
| **無依賴** | 不同檔案、不同模組 | ✅ 可並行 |
| **檔案依賴** | Task B 需要 Task A 產出的檔案 | 🔗 串行 |
| **介面依賴** | Task B 使用 Task A 定義的 API | 🔗 串行 |
| **測試依賴** | 測試需要對應功能完成 | 🔗 串行 |

#### 分配範例

```markdown
# tasks.md 原始任務
- [ ] 1.1 建立 UserService | files: src/services/user.ts
- [ ] 1.2 建立 AuthService | files: src/services/auth.ts
- [ ] 1.3 建立 UserAPI | files: src/api/user.ts (依賴 1.1)
- [ ] 2.1 建立 PaymentService | files: src/services/payment.ts
- [ ] 2.2 建立 PaymentAPI | files: src/api/payment.ts (依賴 2.1)

# 分析後的 Phase Batches
Phase 1 (並行): [1.1, 1.2, 2.1]  ← 無依賴，可同時執行
Phase 2 (並行): [1.3, 2.2]       ← 依賴 Phase 1，可同時執行
```

#### TodoWrite 格式

```python
TodoWrite([
    # Phase 1 - 並行執行
    {"content": "Phase 1: 基礎 Services (1.1, 1.2, 2.1)", "status": "pending"},
    {"content": "  └─ 1.1 UserService", "status": "pending"},
    {"content": "  └─ 1.2 AuthService", "status": "pending"},
    {"content": "  └─ 2.1 PaymentService", "status": "pending"},
    # Phase 2 - 依賴 Phase 1
    {"content": "Phase 2: API 層 (1.3, 2.2)", "status": "pending"},
    {"content": "  └─ 1.3 UserAPI", "status": "pending"},
    {"content": "  └─ 2.2 PaymentAPI", "status": "pending"},
])
```

#### 並行執行方式

```python
# Phase 內的任務並行啟動多個 Task subagent
Task(subagent_type: "developer", prompt: "實作 Task 1.1...")  }
Task(subagent_type: "developer", prompt: "實作 Task 1.2...")  } 同時發送
Task(subagent_type: "developer", prompt: "實作 Task 2.1...")  }

# 等待所有 Phase 1 完成後
# 再並行啟動 Phase 2
Task(subagent_type: "developer", prompt: "實作 Task 1.3...")  }
Task(subagent_type: "developer", prompt: "實作 Task 2.2...")  } 同時發送
```

### Mode 2: 接手/工作流（恢復執行）

```
用戶: 接手 [change-id]  或  工作流 [change-id]
     ↓
Main Agent 執行：
1. 檢查位置：
   - 如果在 specs/  → 移動到 changes/（開始執行）
   - 如果在 changes/ → 繼續執行
2. 讀取 openspec/changes/[change-id]/tasks.md
3. 分析任務依賴，分配 Phase Batches
4. 使用 TodoWrite 建立 phase todos
5. 找到第一個未完成的 Phase
6. 並行執行 Phase 內所有任務的 D→R→T
7. Phase 完成後進入下一個 Phase
```

## Task Workflow (D→R→T)

```
DEVELOPER → REVIEWER → TESTER
     │           │          │
     │      REJECT → retry  │
     │                 FAIL → DEBUGGER
     └─────────────────────→ PASS → ✅ Update tasks.md
```

**核心規則：**
- 每個 D→R→T 必須使用 `Task(subagent_type: "xxx")` 產生 subagent
- 禁止只顯示 emoji 而不產生 subagent
- 任務完成後立即更新 `tasks.md` checkbox

For detailed execution rules → read `references/execution.md`
For phase rules → read `references/phases.md`

## Agent 工作標示

**重要**：切換 agent 時，Main Agent 必須輸出標示讓用戶知道當前狀態。

格式：
```
🏗️ ARCHITECT: [任務描述]
🎨 DESIGNER: [任務描述]
💻 DEVELOPER: [任務描述]
🔍 REVIEWER: [任務描述]
🧪 TESTER: [任務描述]
🐛 DEBUGGER: [任務描述]
```

範例：
```
🏗️ ARCHITECT: 規劃登入功能架構
💻 DEVELOPER: 實作 Task 2.1 - 建立 AuthService
🔍 REVIEWER: 審查 AuthService 程式碼
🧪 TESTER: 執行 AuthService 單元測試
✅ Task 2.1 完成，更新 tasks.md
```

## Limits

| Parameter | Value |
|-----------|-------|
| max_iterations | 10 |
| max_retries | 3 |

## Git Commit

Task 完成後：
```bash
git commit -m "feat(task-X.X): description"
```

Format: `feat|fix|refactor|test(task-X.X): description`

## 歸檔流程（Archive）

**重要**：當所有任務完成後，必須執行歸檔！

```
┌────────────────────────────────────────────────────────────┐
│  ⚠️ 歸檔是工作流的最後一步，不能跳過！                      │
│  SessionEnd Hook 會自動檢查並提醒未歸檔的變更              │
└────────────────────────────────────────────────────────────┘
```

### 歸檔流程

```
所有任務完成 `- [x]`
     ↓
【強制】執行歸檔：
openspec archive [change-id] --yes
# 或手動：mv openspec/changes/[change-id] openspec/archive/[change-id]
     ↓
變更被移動到：
openspec/archive/[change-id]/
     ↓
Git commit: "chore: archive [change-id]"
     ↓
【然後才能】輸出 <promise>ALL TASKS COMPLETED</promise>
```

### 歸檔檢查清單

- [ ] 所有任務都已 `- [x]`
- [ ] 所有測試通過
- [ ] 程式碼已 commit
- [ ] **執行歸檔（必須在 promise 前完成）**
- [ ] 驗證 changes/ 目錄已清空

### 自動提醒機制

全域 Hook `~/.claude/hooks/check-archive.sh` 會在 SessionEnd 時：
1. 檢查 `openspec/changes/` 是否有未歸檔的變更
2. 如果有，輸出警告提醒

## 🧹 清理流程（Cleanup）

**歸檔後必須執行清理**，釋放空間並整理專案結構。

### 快速清理命令

```bash
# 刪除快取和臨時檔案
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null; \
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null; \
find . -type f -name "*.pyc" -delete 2>/dev/null; \
rm -rf .playwright-mcp/ htmlcov/ .coverage 2>/dev/null
```

### 清理分類

| 類型 | 處理 | 範例 |
|------|------|------|
| **刪除** | 快取、臨時檔 | `__pycache__/`, `.pytest_cache/`, `*.pyc` |
| **歸檔** | 報告、舊文檔 | `TASK_*.md` → `docs/archive/task-reports/` |
| **保留** | 原始碼、配置 | `src/`, `tests/`, `*.py` |

For complete cleanup rules → read `references/cleanup.md`

### 完整結束流程

```
1. 所有任務完成 ✅
2. 【必須】執行歸檔：
   openspec archive [id] --yes
3. 🧹 執行清理（參考 references/cleanup.md）
4. 📝 檢查開發筆記（參考 references/dev-notes.md）
5. 輸出最終報告（含筆記提醒）
6. 【最後】輸出 <promise>ALL TASKS COMPLETED</promise>
```

**順序很重要**：歸檔必須在 promise 輸出前完成！Hook 會在 session 結束時檢查。

## 📝 開發筆記（Dev Notes）

**執行過程中想到但不需當下處理的事項，統一記錄到專案筆記本！**

### 筆記本位置

```
project/
└── openspec/
    └── changes/
        └── [change-id]/
            └── notes.md    ← 開發筆記本
```

### 記錄時機

| 情況 | 範例 | 處理 |
|------|------|------|
| 發現可優化但非必要 | 「這個函數可以重構」 | 📝 記錄 |
| 想到相關功能 | 「未來可以加入 X 功能」 | 📝 記錄 |
| 技術債 | 「這裡用 workaround，之後要改」 | 📝 記錄 |
| 文檔待補 | 「需要補充 API 文檔」 | 📝 記錄 |
| 測試待加 | 「邊界情況需要更多測試」 | 📝 記錄 |

### 記錄格式

```markdown
# 開發筆記 - [change-id]

## 優化建議
- [ ] src/api/user.ts:45 - 可以用 memoization 優化
- [ ] src/services/auth.ts - 錯誤處理可以更細緻

## 未來功能
- [ ] 加入批次處理 API
- [ ] 支援多語言

## 技術債
- [ ] src/utils/helper.ts - 臨時解法，需要重構

## 文檔待補
- [ ] API 文檔需要範例
- [ ] 部署流程文檔
```

### 結束時提醒

工作流結束時，必須：
1. 讀取 `notes.md`
2. 在最終報告中列出所有筆記
3. 詢問用戶是否要處理或保留

For complete dev notes guide → read `references/dev-notes.md`

## Change ID 命名規則

**重要**：Change ID 必須使用**英文 kebab-case**

```
✅ 正確：
add-user-auth
update-payment-flow
remove-legacy-api
refactor-database-schema

❌ 錯誤：
用戶登入功能          # 不能用中文
addUserAuth           # 不能用 camelCase
add_user_auth         # 不能用底線
```

**命名格式**：`[動詞]-[功能描述]`

| 動詞 | 用途 |
|------|------|
| `add-` | 新增功能 |
| `update-` | 修改現有功能 |
| `remove-` | 移除功能 |
| `refactor-` | 重構 |
| `fix-` | 修復 bug |

### 中文說明

雖然 change-id 必須用英文，但 `proposal.md` 和 `tasks.md` 內容可以用中文：

```markdown
# add-user-auth Implementation Tasks

## 1. 基礎設施 (sequential)
- [ ] 1.1 建立用戶資料表 | files: src/db/users.ts
- [ ] 1.2 設定 JWT 密鑰 | files: src/config/auth.ts
```

## 斷點恢復流程

當用戶說「接手 xxx」或「工作流 xxx」時：

```
1. 讀取 openspec/changes/[change-id]/tasks.md
2. 解析所有任務狀態
3. 找到第一個 `- [ ]` 未完成的任務
4. 顯示恢復資訊：

   📋 恢復工作流：[change-id]
   ✅ 已完成：3/8 任務
   ⏳ 接下來：Task 2.1 - Create user API

5. 從該任務開始 D→R→T 循環
6. 完成後更新 checkbox 並繼續下一個任務
```

## Next Steps

### Flow Definitions
- For S→W (skill creation) flow → read `references/flows/skill-creation.md`
- For M→S→W→D→R→T (migration) flow → read `references/flows/migration.md`

### Detailed Rules (from CLAUDE.md refactor)
- For execution rules → read `references/execution.md`
- For enforcement rules → read `references/enforcement.md`
- For parallelization → read `references/parallelization.md`
- Tech debt → see CLAUDE.md 核心規則 + Hook 提醒

### Other References
- For agent details → read `references/agents.md`
- For phase execution rules → read `references/phases.md`
- For cleanup rules → read `references/cleanup.md`
- For dev notes guide → read `references/dev-notes.md`
- For task templates → see `templates/`
