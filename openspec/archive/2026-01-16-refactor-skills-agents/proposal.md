# Refactor Skills & Agents Management

## Summary

整合 skills 與 agents 管理，統一由一個 skill 和一個 agent 負責。

## Changes

### 1. 刪除 skill-creator skill

- 刪除 `~/.claude/skills/skill-creator/` 目錄
- 內容已整合到 skills skill

### 2. 重新命名 skills skill → skill-agent

```
~/.claude/skills/skills/     →  ~/.claude/skills/skill-agent/
```

更新內容：
- `name: skills` → `name: skill-agent`
- `description` 加入 agent 管理職責
- 新增 `references/agent-standard.md`
- 新增 `templates/AGENT.md.template`

### 3. 重新命名 agents/skills.md → skills-agents.md

```
~/.claude/agents/skills.md   →  ~/.claude/agents/skills-agents.md
```

更新內容：
- `name: skills` → `name: skills-agents`
- `skills: skills, skill-creator` → `skills: skill-agent`
- 更新描述反映新職責

### 4. 更新相關引用

- CLAUDE.md 中的 skill 名稱引用
- 任何引用 skill-creator 或 skills 的地方

## File Changes

| Action | Path |
|--------|------|
| DELETE | `skills/skill-creator/` |
| RENAME | `skills/skills/` → `skills/skill-agent/` |
| UPDATE | `skills/skill-agent/SKILL.md` |
| CREATE | `skills/skill-agent/references/agent-standard.md` |
| CREATE | `skills/skill-agent/templates/AGENT.md.template` |
| RENAME | `agents/skills.md` → `agents/skills-agents.md` |
| UPDATE | `agents/skills-agents.md` |
| UPDATE | `CLAUDE.md` (如有引用) |

## Risks

- 低風險：主要是重新命名和整合
- 需確保所有引用都更新

## Verification

1. Agent 解析無錯誤
2. Skill 可正常載入
3. 無遺漏的舊引用
