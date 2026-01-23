---
name: claude-create-tools
description: Claude Code 工具建立完整指南。當需要建立 plugin、agent、hook、skill，或使用 task tool 時使用。包含所有工具的規範、使用方法和模板。
---

# Claude Code Tools Creation Guide

Claude Code 所有工具的建立指南、規範和模板。

## Quick Reference

### 工具概覽

| 工具 | 用途 | 觸發方式 | 配置位置 |
|------|------|----------|----------|
| **Skills** | 知識和指導 | Claude 自主判斷 | `~/.claude/skills/` |
| **Agents** | 專業執行角色 | Task tool | `~/.claude/agents/` |
| **Hooks** | 驗證和自動化 | 系統事件 | `settings.json` |
| **Plugins** | 打包分發 | 安裝啟用 | `.claude-plugin/` |
| **Tasks** | 並行執行 | 手動調用 | Task tool |

### Plugin 三層架構

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  能力層     │→ │  執行層     │→ │  控制層     │
│  (Skills)   │  │  (Tools)    │  │  (Hooks)    │
│  定義       │  │  Claude     │  │  驗證       │
│  「做什麼」 │  │  調用工具   │  │  「做得對」 │
└─────────────┘  └─────────────┘  └─────────────┘
```

### 建立決策樹

```
需要什麼？
    │
    ├── 教 Claude 如何做某事 ─────→ Skill
    ├── 專業執行角色 ────────────→ Agent
    ├── 自動驗證/格式化/阻止 ────→ Hook
    ├── 打包分發多個功能 ────────→ Plugin
    └── 並行/背景執行任務 ───────→ Task tool
```

### Skills vs Hooks 對比

| 面向 | Skills | Hooks |
|------|--------|-------|
| 觸發 | Claude 自主判斷 | 系統事件自動觸發 |
| 目的 | 提供知識和指導 | 執行驗證和自動化 |
| 控制 | 無法直接阻止操作 | 可透過 exit code 阻止 |
| 格式 | Markdown 文件 | JSON + Shell 腳本 |

---

## 各工具快速建立

### Skill 快速建立

```bash
# 1. 建立目錄
mkdir -p ~/.claude/skills/my-skill

# 2. 建立 SKILL.md（使用模板）
cat templates/SKILL.md.template > ~/.claude/skills/my-skill/SKILL.md

# 3. 編輯填入內容

# 4. 驗證
scripts/validate-skill.sh ~/.claude/skills/my-skill
```

**必要結構**：
```
my-skill/
├── SKILL.md          # 必要
├── references/       # 可選
└── templates/        # 可選
```

**Frontmatter 必填**：
```yaml
---
name: my-skill
description: 功能描述。當 xxx 時使用。
---
```

### Agent 快速建立

```bash
# 1. 建立 agent 檔案（使用模板）
cat templates/agent.md.template > ~/.claude/agents/my-agent.md

# 2. 編輯填入內容

# 3. 驗證
scripts/validate-agent.sh ~/.claude/agents/my-agent.md
```

**Frontmatter 必填**：
```yaml
---
name: my-agent
description: 角色描述
model: sonnet
skills: core
---
```

### Hook 快速設定

```bash
# 1. 複製模板到 settings.json
# 使用 templates/hooks.json.template

# 2. 驗證
scripts/validate-hooks.sh ~/.claude/settings.json
```

**基本結構**：
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/script.sh"
          }
        ]
      }
    ]
  }
}
```

### Plugin 快速建立

```bash
# 1. 建立目錄結構（參考 templates/plugin-structure.template）
mkdir -p my-plugin/.claude-plugin

# 2. 建立 plugin.json（使用 templates/plugin.json.template）

# 3. 驗證
scripts/validate-plugin.sh ./my-plugin
```

**必要結構**：
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json    # 必須
├── skills/            # 可選
├── agents/            # 可選
└── hooks/             # 可選
```

### Task 使用

```python
# Task tool 參數
Task(
    description="任務描述",
    prompt="完整指令",
    subagent_type="Explore|Plan|general-purpose|custom-agent",
    model="sonnet|opus|haiku",
    run_in_background=True,
    resume="agent-id"
)
```

---

## 詳細規範

- Plugins 完整規範 → see `references/plugins.md`
- Agents 完整規範 → see `references/agents.md`
- Hooks 完整規範 → see `references/hooks.md`
- Skills 完整規範 → see `references/skills.md`
- Tasks 使用指南 → see `references/tasks.md`

---

## 模板

| 模板 | 用途 |
|------|------|
| `templates/SKILL.md.template` | 建立新 Skill |
| `templates/agent.md.template` | 建立新 Agent |
| `templates/hooks.json.template` | 設定 Hooks |
| `templates/plugin.json.template` | Plugin manifest |
| `templates/plugin-structure.template` | Plugin 目錄結構 |

---

## 驗證腳本

| 腳本 | 用途 |
|------|------|
| `scripts/validate-skill.sh` | 驗證 Skill 結構和 frontmatter |
| `scripts/validate-agent.sh` | 驗證 Agent 格式和欄位 |
| `scripts/validate-plugin.sh` | 驗證 Plugin 結構和 manifest |
| `scripts/validate-hooks.sh` | 驗證 Hooks JSON 配置 |
| `scripts/validate-all.sh` | 統一驗證入口 |

**用法**：
```bash
# 驗證 Skill
scripts/validate-skill.sh ~/.claude/skills/my-skill

# 使用統一入口
scripts/validate-all.sh skill ~/.claude/skills/my-skill
scripts/validate-all.sh agent ~/.claude/agents/my-agent.md
scripts/validate-all.sh plugin ./my-plugin
scripts/validate-all.sh hooks ~/.claude/settings.json
```

---

## 常見問題

### Q: Skill 還是 Hook？

- **Skill**：教 Claude「如何做」，無法阻止操作
- **Hook**：驗證和自動化，可以阻止危險操作

### Q: Skill 還是 Agent？

- **Skill**：知識庫，被動載入
- **Agent**：執行角色，主動執行，可修改檔案

### Q: 單獨 Skill 還是 Plugin？

- **單獨 Skill**：個人使用，快速迭代
- **Plugin**：需要分享、版本控制、整合多個功能

---

## Checklist

### 建立 Skill

- [ ] Frontmatter 有 `name` 和 `description`
- [ ] `description` 包含觸發條件
- [ ] SKILL.md < 500 行
- [ ] References ≤ 10 個
- [ ] 執行 `validate-skill.sh` 通過

### 建立 Agent

- [ ] Frontmatter 有 `name` 和 `description`
- [ ] `name` 小寫連字號格式
- [ ] 檔名與 `name` 一致
- [ ] 執行 `validate-agent.sh` 通過

### 建立 Plugin

- [ ] `.claude-plugin/plugin.json` 存在
- [ ] JSON 格式有效
- [ ] `name` 欄位存在
- [ ] 引用的目錄存在
- [ ] 執行 `validate-plugin.sh` 通過

### 設定 Hooks

- [ ] JSON 格式有效
- [ ] 事件類型正確
- [ ] 腳本有執行權限
- [ ] 執行 `validate-hooks.sh` 通過
