# Claude Code Workflow Configuration

自動化多代理工作流系統，用於 [Claude Code](https://claude.ai/code)。

## Overview

這是一個完整的 Claude Code 全域配置，包含：

- **6 個專業 Agent** - 架構師、設計師、開發者、審查者、測試者、除錯者
- **5 個 Skills** - workflow、ui、ux、skill-creator、hooks-guide
- **自動注入 Hook** - 啟動時自動載入 skills

## Quick Start

### 安裝

```bash
# Clone 到 ~/.claude/
git clone https://github.com/ryu111/claude-workflow-config.git ~/.claude-workflow

# 複製檔案到 ~/.claude/
cp -r ~/.claude-workflow/* ~/.claude/

# 或建立 symlinks
ln -sf ~/.claude-workflow/agents ~/.claude/agents
ln -sf ~/.claude-workflow/skills ~/.claude/skills
ln -sf ~/.claude-workflow/hooks ~/.claude/hooks
```

### 合併 settings.json

將 `settings.json` 中的 hooks 配置合併到你現有的 `~/.claude/settings.json`。

## Usage

### Trigger Keywords

| 關鍵字 | 動作 |
|--------|------|
| `規劃` | 啟動 ARCHITECT → tasks.md |
| `loop` | 持續執行直到完成 |
| `規劃 + loop` | 規劃後 Loop 執行所有任務 |

### Single Agent Mode

| 關鍵字 | Agent |
|--------|-------|
| 規劃, plan, design | ARCHITECT |
| UI, UX, 介面 | DESIGNER |
| 實作, implement | DEVELOPER |
| 審查, review | REVIEWER |
| 測試, test | TESTER |
| debug, 除錯 | DEBUGGER |

### Full Workflow Mode

```
規劃 [功能] loop
```

執行完整的 D→R→T 循環（DEVELOPER → REVIEWER → TESTER）。

## Directory Structure

```
~/.claude/
├── CLAUDE.md           # 全域配置說明
├── WORKFLOW.md         # 完整工作流文檔
├── settings.json       # Hooks 配置
├── agents/             # 6 個專業 Agent
│   ├── architect.md
│   ├── designer.md
│   ├── developer.md
│   ├── reviewer.md
│   ├── tester.md
│   └── debugger.md
├── skills/             # Skills
│   ├── workflow/       # 工作流 skill
│   ├── ui/             # UI 設計規範
│   ├── ux/             # UX 設計規範
│   ├── skill-creator/  # Skill 建立指南
│   └── hooks-guide/    # Hooks 配置指南
└── hooks/
    └── inject-skills.sh  # 自動注入腳本
```

## Agent Workflow

```
USER INPUT
    ↓
MAIN AGENT (Coordinator)
    ↓
┌───────────────────────────────────────┐
│  「規劃」 → ARCHITECT → tasks.md       │
│  「loop」 → D→R→T Cycle               │
└───────────────────────────────────────┘
    ↓
Per-Task Cycle:
    DEVELOPER → REVIEWER → TESTER
         │
    ┌────┴────┐
  REJECT    APPROVE
    ↓         ↓
 DEVELOPER  TESTER
 (retry)      │
         ┌────┴────┐
       FAIL      PASS
         ↓         ↓
     DEBUGGER   Mark ✓
```

## Skills

### /workflow
完整工作流說明，包含 agent 協作流程。

### /ui
UI 視覺設計規範，包含 Design Tokens 和元件規格。

### /ux
UX 使用者體驗規範，包含互動模式和無障礙設計。

### /skill-creator
建立自訂 Skills 的指南。

### /hooks-guide
Claude Code Hooks 配置指南。

## Limits

| Parameter | Value |
|-----------|-------|
| max_iterations | 10 |
| max_retries | 3 |

## License

MIT
