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

| 關鍵字 | 動作 |
|--------|------|
| `規劃 [feature]` | ARCHITECT 建立新的 OpenSpec |
| `接手 [change-id]` | 讀取現有 OpenSpec 繼續執行 |
| `工作流 [change-id]` | 同上，恢復 D→R→T 循環 |
| `loop` | 持續執行直到完成 |

**範例：** `規劃 用戶登入功能` / `接手 add-user-auth` / `工作流 add-user-auth loop`

## OpenSpec 目錄結構（Kanban 三階段）

**重要**：所有規格檔案存放在**專案目錄**內。

```
project/openspec/
├── project.md              # 專案慣例
├── specs/[change-id]/      # 待執行（Backlog）
├── changes/[change-id]/    # 進行中（WIP）
└── archive/[change-id]/    # 已完成（Done）
```

| 轉換 | 時機 | 指令 |
|------|------|------|
| 待執行 → 進行中 | 開始執行 | `mv openspec/specs/[id] openspec/changes/[id]` |
| 進行中 → 已完成 | 全部完成 | `openspec archive [id] --yes` |

## Six Agents

| Agent | Keywords | Role |
|-------|----------|------|
| ARCHITECT | 規劃, plan | 建立 OpenSpec |
| DESIGNER | 設計, UI, UX | UI/UX 規格 |
| DEVELOPER | 實作, implement | 寫程式碼 |
| REVIEWER | 審查, review | 程式碼審查 |
| TESTER | 測試, test | 執行測試 |
| DEBUGGER | debug, 除錯 | 修復錯誤 |

## Available Flows

| 流程 | 用途 | 詳細 |
|------|------|------|
| **D→R→T** | 標準開發流程 | `references/execution.md` |
| **S→W** | Skill 建立 | `references/flows/skill-creation.md` |
| **M→S→W→D→R→T** | 遷移流程 | `references/flows/migration.md` |

## Task Workflow (D→R→T)

```
DEVELOPER → REVIEWER → TESTER
     │           │          │
     │      REJECT → retry  │
     │                 FAIL → DEBUGGER
     └─────────────────────→ PASS → ✅
```

**核心規則**：每個 D→R→T 必須使用 `Task(subagent_type: "xxx")` 產生 subagent

## Limits

| Parameter | Value |
|-----------|-------|
| max_iterations | 10 |
| max_retries | 3 |

## Change ID 命名規則

**必須使用英文 kebab-case**

```
✅ add-user-auth, update-payment-flow, fix-login-bug
❌ 用戶登入功能, addUserAuth, add_user_auth
```

## Git Commit

```bash
git commit -m "feat|fix|refactor|test(task-X.X): description"
```

---

## Next Steps

**工作流模式**（規劃/接手/歸檔）：
→ read `references/modes.md`

**執行規則**（D→R→T 詳細流程）：
→ read `references/execution.md`

**強制規則**：
→ read `references/enforcement.md`

**並行化規則**：
→ read `references/parallelization.md`

**Agent 詳細職責**：
→ read `references/agents.md`

**Phase 執行規則**：
→ read `references/phases.md`

**清理規則**：
→ read `references/cleanup.md`
