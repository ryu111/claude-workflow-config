# Agents 完整規範

Agent 是專業執行角色，透過 Task tool 調用。

## 檔案位置

| 位置 | 路徑 | 作用域 |
|------|------|--------|
| 個人 | `~/.claude/agents/` | 所有專案 |
| 專案 | `.claude/agents/` | 此專案 |
| Plugin | `<plugin>/agents/` | Plugin 啟用時 |

---

## 檔案格式

```markdown
---
name: agent-name
description: 角色描述
model: sonnet
skills: core, dev
---

# Agent Title

> 一句話角色定義

## 角色定義

你是 [角色名稱]，負責 [職責描述]。

## 工作流程

### Phase 1: [階段名稱]
[步驟描述]

### Phase 2: [階段名稱]
[步驟描述]

## 輸出格式

[預期輸出說明]
```

---

## Frontmatter 欄位

### 必填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `name` | string | 小寫，連字號分隔 |
| `description` | string | 角色職責描述 |

### 選填欄位

| 欄位 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `model` | string | inherit | `sonnet`, `opus`, `haiku` |
| `skills` | string | - | 預載入的 skills（逗號分隔） |
| `tools` | string | - | 可用工具（逗號分隔） |
| `disallowedTools` | string | - | 禁止的工具 |
| `permissionMode` | string | default | 權限模式 |
| `hooks` | object | - | 生命週期 hooks |

---

## 內建 Subagent 類型

| 名稱 | 模型 | 工具 | 用途 |
|------|------|------|------|
| `Explore` | Haiku | Read-only | 代碼搜索和分析 |
| `Plan` | 繼承 | Read-only | 規劃模式中的研究 |
| `general-purpose` | 繼承 | All | 複雜多步驟任務 |
| `Bash` | 繼承 | Bash | 終端命令執行 |

---

## Permission Modes

| 模式 | 行為 |
|------|------|
| `default` | 標準權限檢查 |
| `acceptEdits` | 自動接受文件編輯 |
| `dontAsk` | 自動拒絕權限提示 |
| `bypassPermissions` | 跳過所有權限檢查 |
| `plan` | 規劃模式（只讀） |

---

## 工具限制

### 指定可用工具

```yaml
---
name: safe-reader
description: 只讀探索代碼
tools: Read, Grep, Glob
---
```

### 禁止特定工具

```yaml
---
name: reviewer
description: 審查但不修改
disallowedTools: Write, Edit
---
```

### 常見工具組合

| 用例 | tools |
|------|-------|
| 只讀分析 | `Read, Grep, Glob` |
| 測試執行 | `Bash, Read, Grep` |
| 代碼修改 | `Read, Edit, Write, Grep, Glob` |
| 完全訪問 | （省略 = 繼承所有） |

---

## Agent Hooks

```yaml
---
name: code-reviewer
description: 審查代碼
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

---

## 範例

### 代碼審查 Agent

```markdown
---
name: code-reviewer
description: 程式碼審查專家。審查代碼品質和安全性。
tools: Read, Grep, Glob
model: sonnet
---

# Code Reviewer

> 專注於代碼品質和安全性的審查專家

## 角色定義

你是資深代碼審查員，負責確保代碼品質和安全。

## 審查流程

### Phase 1: 理解
- 閱讀相關代碼
- 理解變更目的

### Phase 2: 審查
- 代碼清晰度
- 安全漏洞
- 效能問題
- 最佳實踐

## 輸出格式

```markdown
## 審查結果

### 問題（必須修復）
- 問題 1

### 警告（建議修復）
- 警告 1

### 建議（考慮改進）
- 建議 1
```
```

### 開發者 Agent

```markdown
---
name: developer
description: 開發專家。負責撰寫高品質程式碼。
model: sonnet
skills: core, dev
---

# Developer

> 撰寫乾淨、高效、可維護的程式碼

## 角色定義

你是開發專家，負責實現功能和修復 bug。

## 工作流程

### Phase 1: 理解需求
- 閱讀相關代碼
- 確認需求範圍

### Phase 2: 實現
- 撰寫程式碼
- 遵循 Clean Code 原則
- 處理錯誤情況

### Phase 3: 驗證
- 確認功能正確
- 檢查邊界情況
```

---

## 命名規範

| 類型 | 規則 | 範例 |
|------|------|------|
| 檔案名 | `{name}.md` | `developer.md` |
| name 欄位 | 小寫，連字號 | `developer` |
| 複合名稱 | 連字號連接 | `skills-agents` |

---

## Agent vs Skill

| 面向 | Agent | Skill |
|------|-------|-------|
| 用途 | 執行角色 | 知識庫 |
| 能力 | 可修改檔案 | 只能被參考 |
| 呼叫方式 | `Task(subagent_type)` | 載入到 context |
| 檔案位置 | `~/.claude/agents/` | `~/.claude/skills/` |

---

## Checklist

- [ ] Frontmatter 有 `name` 和 `description`
- [ ] `name` 使用小寫和連字號
- [ ] 檔案名稱與 `name` 一致
- [ ] 有明確的角色定義
- [ ] 有工作流程說明
- [ ] `skills` 包含 `core`（如果使用 workflow）
