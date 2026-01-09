---
name: workflow
description: 自動化多代理工作流系統。當用戶提到「規劃」或「loop」時啟動。包含 ARCHITECT、DESIGNER、DEVELOPER、REVIEWER、TESTER、DEBUGGER 六大專業代理的協作流程。
---

# Automated Multi-Agent Workflow

完整的自動化開發工作流，用戶只需說一次，Main Agent 協調一切。

## Quick Start

```
USER INPUT → MAIN AGENT → SUB-AGENT → result → MAIN decides next
```

## Trigger Keywords

**適用於任何模式（包括 plan mode），不受對話模式限制**

| 關鍵字 | 動作 |
|--------|------|
| `規劃` | ARCHITECT → tasks.md |
| `loop` | 持續執行直到完成（max 10） |
| `規劃 + loop` | 規劃後 Loop 執行所有任務 |

## Six Agents

| Agent | Keywords | Role |
|-------|----------|------|
| ARCHITECT | 規劃, plan, design | 建立 SDD 藍圖 |
| DESIGNER | UI, UX, 介面 | UI/UX 規格 |
| DEVELOPER | 實作, implement | 寫程式碼 |
| REVIEWER | 審查, review | 程式碼審查 |
| TESTER | 測試, test | 執行測試 |
| DEBUGGER | debug, 除錯 | 修復錯誤 |

For detailed agent specifications, read `agents.md`.

## Task Workflow

### Per-Task Cycle (D→R→T)

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
```

For detailed phase rules, read `phases.md`.

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
✅ Task 2.1 完成，commit: feat(task-2.1): implement AuthService
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

## Next Steps

- For agent details → read `agents.md`
- For phase execution rules → read `phases.md`
- For task templates → see `templates/`
