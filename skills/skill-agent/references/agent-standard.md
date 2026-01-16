# Agent Standard

Agent 檔案格式與建立規範。

## 檔案位置

```
~/.claude/agents/
├── architect.md
├── developer.md
├── reviewer.md
├── tester.md
└── ...
```

## Frontmatter 規範

### 必要欄位

```yaml
---
name: agent-name
description: 角色職責描述
---
```

| 欄位 | 規則 | 範例 |
|------|------|------|
| `name` | 小寫，連字號分隔 | `developer`, `skills-agents` |
| `description` | 簡短說明職責 | "開發專家，負責撰寫程式碼" |

### 可選欄位

```yaml
---
name: agent-name
description: 描述
model: sonnet          # 預設 sonnet
skills: dev, testing   # 自動載入的 skills
---
```

| 欄位 | 預設值 | 說明 |
|------|--------|------|
| `model` | sonnet | 可選：sonnet, opus, haiku |
| `skills` | (無) | 逗號分隔的 skill 名稱 |

## 內容結構

### 基本結構

```markdown
---
name: my-agent
description: 角色描述
---

# Agent Title

> 一句話角色定義

## 角色定義

你是 [角色名稱]，負責 [職責描述]。

## 工作流程

### 階段 1: [階段名稱]
[步驟描述]

### 階段 2: [階段名稱]
[步驟描述]

## 輸出格式

[預期輸出的格式說明]
```

### 進階結構（含 Skills）

```markdown
---
name: developer
description: 開發專家
model: sonnet
skills: dev, testing
---

# DEVELOPER Agent

## 角色定義
...

## 使用 Skills

### dev skill
- Clean Code 原則
- 設計模式

### testing skill
- 測試策略
- Mock 最佳實踐

## 工作流程
...
```

## 命名規範

| 類型 | 規則 | 範例 |
|------|------|------|
| 檔案名 | `{name}.md` | `developer.md` |
| name 欄位 | 小寫，連字號 | `developer` |
| 複合名稱 | 連字號連接 | `skills-agents` |

## Agent vs Skill

| 面向 | Agent | Skill |
|------|-------|-------|
| 用途 | 執行角色 | 知識庫 |
| 能力 | 可修改檔案 | 只能被參考 |
| 呼叫方式 | `Task(subagent_type)` | 載入到 context |
| 檔案位置 | `~/.claude/agents/` | `~/.claude/skills/` |

## 常見模式

### 1. 工作流角色

```yaml
---
name: developer
description: 開發專家，負責撰寫程式碼
skills: dev
---
```

用於 D→R→T 等工作流。

### 2. 專業領域

```yaml
---
name: migration
description: 遷移規劃專家
skills: migration
---
```

處理特定領域任務。

### 3. 複合職責

```yaml
---
name: skills-agents
description: 管理 Skills 和 Agents 的建立與維護
skills: skill-agent
---
```

整合多個職責。

## Checklist

建立 Agent 時確認：

- [ ] Frontmatter 有 `name` 和 `description`
- [ ] `name` 使用小寫和連字號
- [ ] `description` 清楚說明職責
- [ ] 檔案名稱與 `name` 一致
- [ ] 有明確的角色定義
- [ ] 有工作流程說明
- [ ] 指定需要的 skills（如有）

## 錯誤範例

❌ 缺少 frontmatter
```markdown
# My Agent
...
```

❌ 缺少 name
```markdown
---
description: 描述
---
```

❌ name 格式錯誤
```markdown
---
name: MyAgent      # 應該是 my-agent
---
```
