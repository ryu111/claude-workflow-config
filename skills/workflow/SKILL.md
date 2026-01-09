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

## OpenSpec 目錄結構

**重要**：所有規格檔案存放在**專案目錄**內，不是全域目錄。

```
project/
└── openspec/
    ├── project.md              # 專案慣例
    ├── specs/                  # 當前狀態（已實作的功能）
    │   └── [capability]/
    │       └── spec.md
    └── changes/                # 變更提議（待實作）
        ├── [change-id]/
        │   ├── proposal.md     # 為什麼、改什麼
        │   ├── tasks.md        # 實作清單（帶 checkbox）
        │   ├── design.md       # 技術決策（可選）
        │   └── specs/          # Delta 變更
        └── archive/            # 已完成的變更
```

## Six Agents

| Agent | Keywords | Role |
|-------|----------|------|
| ARCHITECT | 規劃, plan, design | 建立 OpenSpec proposal + tasks |
| DESIGNER | UI, UX, 介面 | UI/UX 規格 |
| DEVELOPER | 實作, implement | 寫程式碼 |
| REVIEWER | 審查, review | 程式碼審查 |
| TESTER | 測試, test | 執行測試 |
| DEBUGGER | debug, 除錯 | 修復錯誤 |

For detailed agent specifications, read `references/agents.md`.

## Workflow Modes

### Mode 1: 規劃（新功能）

```
用戶: 規劃 [feature]
     ↓
ARCHITECT 執行：
1. 分析 codebase
2. 建立 openspec/changes/[change-id]/
   ├── proposal.md
   ├── tasks.md
   └── specs/
3. 等待用戶審核
```

### Mode 2: 接手/工作流（恢復執行）

```
用戶: 接手 [change-id]  或  工作流 [change-id]
     ↓
Main Agent 執行：
1. 讀取 openspec/changes/[change-id]/tasks.md
2. 找到第一個未完成的任務 `- [ ]`
3. 從該任務繼續 D→R→T 循環
4. 完成後更新 `- [ ]` → `- [x]`
```

## Task Workflow (D→R→T)

### Per-Task Cycle

```
DEVELOPER → REVIEWER → TESTER
               │
        ┌──────┴──────┐
     REJECT        APPROVE
        ↓             ↓
    DEVELOPER      TESTER
    (retry++)         │
               ┌──────┴──────┐
             FAIL         PASS
               ↓            ↓
           DEBUGGER    Mark [x] ✓
                          ↓
                    Update tasks.md
```

### 同步更新 tasks.md

**重要**：每個任務完成後**立即**更新 `tasks.md`：

```markdown
# Before
- [ ] 2.1 Create user API | files: src/api/user.ts

# After (任務完成)
- [x] 2.1 Create user API | files: src/api/user.ts
```

這樣如果中途斷掉，新的 AI 可以：
1. 讀取 `tasks.md`
2. 找到第一個 `- [ ]` 未完成的任務
3. 從該任務繼續執行

### ⚠️ 必須使用 Task 工具產生 Subagent

每個 D→R→T 階段**必須**使用 Task 工具：

```
Task(subagent_type: "developer", prompt: "...")
Task(subagent_type: "reviewer", prompt: "...")
Task(subagent_type: "tester", prompt: "...")
```

**禁止**：只顯示 emoji 標示而不產生 subagent！

For detailed phase rules, read `references/phases.md`.

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
所有任務完成 `- [x]`
     ↓
執行歸檔命令：
openspec archive [change-id] --yes
     ↓
變更被移動到：
openspec/changes/archive/YYYY-MM-DD-[change-id]/
     ↓
specs/ 自動更新（如有 delta）
     ↓
Git commit: "chore: archive [change-id]"
```

### 歸檔檢查清單

- [ ] 所有任務都已 `- [x]`
- [ ] 所有測試通過
- [ ] 程式碼已 commit
- [ ] 執行 `openspec archive [change-id] --yes`
- [ ] 驗證 specs/ 已更新

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

- For agent details → read `references/agents.md`
- For phase execution rules → read `references/phases.md`
- For task templates → see `templates/`
