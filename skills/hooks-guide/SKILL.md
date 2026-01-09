---
name: hooks-guide
description: Claude Code Hooks 配置指南。當需要建立、配置或除錯 hooks 時使用。包含所有 hook 事件類型、matcher 語法、JSON 結構範例。
---

# Claude Code Hooks Guide

Hooks 讓你在 Claude 執行特定動作時運行自訂腳本。

## 配置位置

| 位置 | 路徑 | 用途 |
|------|------|------|
| User | `~/.claude/settings.json` | 所有專案 |
| Project | `.claude/settings.json` | 單一專案（可分享） |
| Local | `.claude/settings.local.json` | 個人（不 commit） |

## JSON 結構

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/script.sh",
            "timeout": 60000
          }
        ]
      }
    ]
  }
}
```

## 八大 Hook 事件

| Event | 觸發時機 | 用途 |
|-------|----------|------|
| **PreToolUse** | 工具執行前 | 驗證/阻擋危險指令 |
| **PostToolUse** | 工具完成後 | 格式化、logging |
| **PermissionRequest** | 權限對話前 | 自動批准安全操作 |
| **UserPromptSubmit** | 用戶提交 prompt | 注入 context |
| **SessionStart** | Session 開始 | 注入 git status |
| **Stop** | Claude 完成回應 | 驗證任務完成 |
| **SubagentStop** | Subagent 完成 | 驗證 subagent 輸出 |
| **PreCompact** | Context 壓縮前 | 備份 transcripts |

## Matcher 語法

```
"Write"           → 精確匹配 Write 工具
"Write|Edit"      → 匹配 Write 或 Edit
".*"              → 匹配所有（regex）
"*"               → 匹配所有
""                → 匹配所有（空字串）
"Bash(npm test*)" → 匹配特定指令參數
"mcp__memory__.*" → MCP 工具模式
```

**注意**：matcher 區分大小寫，`"bash"` 不會匹配 `Bash` 工具。

## Hook 類型

### Command Hook

```json
{
  "type": "command",
  "command": "~/.claude/hooks/my-script.sh",
  "timeout": 60000
}
```

### Prompt Hook (LLM 評估)

```json
{
  "type": "prompt",
  "prompt": "Verify this operation is safe"
}
```

## 輸入與輸出

### 輸入 (stdin)

Hook 透過 stdin 接收 JSON：

```json
{
  "session_id": "...",
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" }
}
```

### 輸出控制

```json
{
  "decision": "approve|block|allow|deny",
  "reason": "給 Claude 的解釋",
  "continue": true,
  "updatedInput": "修改後的參數"
}
```

### Exit Codes

| Code | 效果 |
|------|------|
| 0 | 成功，stdout 處理為 JSON 或 context |
| 2 | 阻擋，stderr 顯示，動作被阻止 |

## PreToolUse 控制

```json
// 允許（跳過權限）
{ "permissionDecision": "allow" }

// 拒絕
{ "permissionDecision": "deny", "reason": "不安全操作" }

// 詢問用戶
{ "permissionDecision": "ask" }
```

### 修改工具輸入 (v2.0.10+)

```json
{
  "decision": "approve",
  "updatedInput": {
    "command": "npm test --silent"
  }
}
```

## PostToolUse 回饋

```json
{
  "decision": "block",
  "reason": "Tests failed, please fix"
}
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `$CLAUDE_PROJECT_DIR` | 專案根目錄 |

## 範例：阻擋危險指令

```bash
#!/bin/bash
# ~/.claude/hooks/block-dangerous.sh

read -r input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

if [[ "$command" =~ "rm -rf" ]]; then
  echo '{"permissionDecision": "deny", "reason": "Blocked dangerous rm -rf"}'
  exit 0
fi

echo '{"permissionDecision": "allow"}'
```

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/block-dangerous.sh"
          }
        ]
      }
    ]
  }
}
```

## 範例：PostToolUse Logging

```bash
#!/bin/bash
# ~/.claude/hooks/log-tools.sh

read -r input
tool=$(echo "$input" | jq -r '.tool_name')
echo "[$(date)] Tool used: $tool" >> ~/.claude/tool.log
```

## 範例：SessionStart 注入 Context

```bash
#!/bin/bash
# ~/.claude/hooks/inject-context.sh

git_status=$(git status --short 2>/dev/null || echo "Not a git repo")
jq -n --arg status "$git_status" '{
  "systemMessage": ("Git Status:\n" + $status)
}'
```

## Troubleshooting

### Hook 不觸發

1. 確認 matcher 大小寫正確
2. 確認腳本有執行權限 (`chmod +x`)
3. 確認路徑正確（建議用絕對路徑）

### 格式錯誤

```
❌ "matcher": {}        → 物件錯誤
✅ "matcher": ".*"      → 字串正確

❌ "matcher": "bash"    → 大小寫錯誤
✅ "matcher": "Bash"    → 正確
```

## 常用 Matcher

| 用途 | Matcher |
|------|---------|
| 所有工具 | `".*"` |
| 檔案操作 | `"Write\|Edit\|Read"` |
| Shell 指令 | `"Bash"` |
| Subagents | `"Task"` |
| MCP 工具 | `"mcp__.*"` |

## Ready-to-Use Scripts

本 skill 包含可直接使用的腳本範例：

| 腳本 | 用途 |
|------|------|
| `scripts/block-dangerous.sh` | 阻擋危險 shell 指令 |
| `scripts/inject-context.sh` | Session 開始時注入 git context |
| `scripts/log-tools.sh` | 記錄工具使用日誌 |

複製到 `~/.claude/hooks/` 使用：
```bash
cp ~/.claude/skills/hooks-guide/scripts/*.sh ~/.claude/hooks/
```
