# Hooks 完整規範

Hooks 是在 Claude Code 生命週期中自動執行的腳本。

## 配置位置

| 位置 | 路徑 | 用途 |
|------|------|------|
| User | `~/.claude/settings.json` | 所有專案 |
| Project | `.claude/settings.json` | 單一專案（可分享） |
| Local | `.claude/settings.local.json` | 個人（不 commit） |
| Plugin | `<plugin>/hooks/hooks.json` | Plugin 啟用時 |

---

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

---

## 11 種事件類型

| Event | 觸發時機 | Matcher |
|-------|----------|---------|
| **PreToolUse** | 工具執行前 | 工具名稱 |
| **PostToolUse** | 工具完成後 | 工具名稱 |
| **PermissionRequest** | 權限對話前 | 工具名稱 |
| **UserPromptSubmit** | 用戶提交 prompt | 無 |
| **SessionStart** | Session 開始 | `startup`, `resume`, `clear`, `compact` |
| **SessionEnd** | Session 結束 | `clear`, `logout`, `prompt_input_exit`, `other` |
| **Stop** | Claude 完成回應 | 無 |
| **SubagentStop** | Subagent 完成 | 無 |
| **PreCompact** | Context 壓縮前 | `manual`, `auto` |
| **Setup** | 初始化時 | 無 |
| **Notification** | 通知時 | `permission_prompt`, `idle_prompt`, `auth_success` |

---

## Matcher 語法

```
"Write"           → 精確匹配 Write 工具
"Write|Edit"      → 正則匹配 Write 或 Edit
".*"              → 匹配所有（正則）
"*"               → 匹配所有
""                → 匹配所有（空字串）
"Bash(npm test*)" → 匹配特定指令參數
"mcp__memory__.*" → MCP 工具模式
```

**注意**：Matcher 區分大小寫！`"bash"` 不會匹配 `Bash` 工具。

---

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

---

## 輸入 (stdin)

Hook 透過 stdin 接收 JSON：

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/dir",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test",
    "description": "Run tests"
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

---

## 輸出控制

### Exit Codes

| Code | 效果 |
|------|------|
| 0 | 成功，stdout 作為 JSON 或 context |
| 2 | 阻擋，stderr 顯示，動作被阻止 |
| 其他 | 非阻擋錯誤，stderr 在 debug 模式顯示 |

### JSON 輸出

```json
{
  "decision": "approve|block|allow|deny",
  "reason": "給 Claude 的解釋",
  "continue": true,
  "updatedInput": { "field": "new_value" }
}
```

---

## PreToolUse 控制

### 允許（跳過權限）

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "permissionDecisionReason": "Auto-approved"
  }
}
```

### 拒絕

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Dangerous operation blocked"
  }
}
```

### 修改工具輸入

```json
{
  "decision": "approve",
  "updatedInput": {
    "command": "npm test --silent"
  }
}
```

---

## PostToolUse 回饋

```json
{
  "decision": "block",
  "reason": "Tests failed, please fix"
}
```

---

## 環境變數

| 變數 | 說明 |
|------|------|
| `$CLAUDE_PROJECT_DIR` | 專案根目錄 |
| `$CLAUDE_ENV_FILE` | 環境變數檔案（SessionStart, Setup） |
| `$CLAUDE_CODE_REMOTE` | `"true"` (web) 或空 (CLI) |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin 目錄（Plugin hooks） |

---

## 常用 Matcher

| 用途 | Matcher |
|------|---------|
| 所有工具 | `".*"` |
| 檔案操作 | `"Write\|Edit\|Read"` |
| Shell 指令 | `"Bash"` |
| Subagents | `"Task"` |
| MCP 工具 | `"mcp__.*"` |

---

## 範例

### 阻擋危險指令

```bash
#!/bin/bash
read -r input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

if [[ "$command" =~ "rm -rf" ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Blocked dangerous rm -rf"}}'
  exit 0
fi

echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
```

### 自動格式化

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$(jq -r '.tool_input.file_path')\"",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

### 注入 Context

```bash
#!/bin/bash
git_status=$(git status --short 2>/dev/null || echo "Not a git repo")
jq -n --arg status "$git_status" '{
  "systemMessage": ("Git Status:\n" + $status)
}'
```

---

## Troubleshooting

### Hook 不觸發

1. 確認 matcher 大小寫正確
2. 確認腳本有執行權限 (`chmod +x`)
3. 確認路徑正確（建議用絕對路徑）

### 常見錯誤

```
❌ "matcher": {}        → 物件錯誤
✅ "matcher": ".*"      → 字串正確

❌ "matcher": "bash"    → 大小寫錯誤
✅ "matcher": "Bash"    → 正確
```

---

## Checklist

- [ ] JSON 格式有效
- [ ] 事件類型正確
- [ ] Matcher 大小寫正確
- [ ] 腳本有執行權限
- [ ] 使用絕對路徑
- [ ] 有適當的 timeout
