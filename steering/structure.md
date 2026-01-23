# Directory Structure

目錄結構和命名慣例。

## .claude/ 結構

```
.claude/
├── CLAUDE.md              # 入口（< 100 行）
├── steering/              # 持久化上下文
│   ├── workflow.md        # 工作流規則
│   ├── tech.md            # 技術棧
│   └── structure.md       # 目錄結構（本檔案）
├── hooks/                 # 通用 hooks
│   ├── llm/               # LLM 相關
│   ├── ui/                # UI 相關（statusline）
│   └── utilities/         # 工具類
├── plugins/               # 本地 plugins
│   └── workflow/          # 工作流 plugin
│       ├── agents/        # Agent 定義
│       ├── skills/        # Skill 定義
│       └── hooks/         # 工作流 hooks
├── docs/                  # 文檔
└── settings.json          # 設定（hooks、plugins）
```

## 專案 OpenSpec 結構

```
project/
├── openspec/
│   ├── specs/[id]/        # 待執行（Backlog）
│   ├── changes/[id]/      # 進行中（WIP）
│   └── archive/[id]/      # 已完成（Done）
└── ...
```

### OpenSpec 內容

```
[change-id]/
├── proposal.md     # 變更提案
├── tasks.md        # 任務清單
└── notes.md        # 開發筆記（可選）
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| Hook 檔案 | kebab-case | `workflow-gate.js` |
| Skill 目錄 | kebab-case | `skill-agent/` |
| Agent 目錄 | kebab-case | `architect/` |
| OpenSpec ID | kebab-case | `add-user-auth` |

## tasks.md 格式

```markdown
## Progress
- Total: N tasks
- Completed: M
- Status: IN_PROGRESS

---

## 1. Phase Name (parallel|sequential)
- [ ] 1.1 Task | agent: DEVELOPER | files: src/a.ts
- [x] 1.2 Task | agent: DESIGNER | output: ui-specs/

## 2. Phase Name (depends: 1)
- [ ] 2.1 Task | needs: 1.1, 1.2
```

### 標記說明

| 標記 | 狀態 |
|------|------|
| `[ ]` | 待處理 |
| `[x]` | 已完成 |
| `[~]` | 進行中 |
