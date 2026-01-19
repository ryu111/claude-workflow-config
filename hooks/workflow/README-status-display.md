# Status Display Hook

## 功能

自動顯示工作流狀態，符合 WORKFLOW-2.0-SPEC.md 第七章規範。

## 觸發時機

- **PostToolUse: Task**

## 輸出格式

### 1. 單一 Task 啟動

```markdown
## 💻 DEVELOPER: Task 2.1 - 建立 UserService
```

### 2. 並行 Task 啟動

當短時間內（5 秒）啟動 ≥2 個相同類型的 Agent：

```markdown
## ⚡ 並行啟動 3 個 💻 DEVELOPER
- Task 2.1: 建立 UserService
- Task 2.2: 建立 AuthService
- Task 2.3: 建立 PaymentService
```

### 3. 狀態轉換

由 `state-updater.js` 負責輸出：

```markdown
## ✅ DEVELOP → REVIEW: Task 2.1 開發完成
## ❌ REVIEW → DEVELOP: 發現 2 個問題，需要修復
## ✅ TEST PASS: Task 2.1 完成 (15/15 tests)
```

## 並行檢測機制

### 原理

- 在 `workflow-state/parallel-tasks.json` 追蹤最近 5 秒內的 Task 啟動
- 當檢測到 ≥2 個相同類型的 Agent 時，輸出並行訊息
- 5 秒後自動清理過期記錄

### 資料結構

```json
{
  "pending": [
    {
      "type": "developer",
      "task": "Task 2.1: 建立 UserService",
      "timestamp": 1737278400000
    }
  ],
  "started": []
}
```

## Agent Emoji 對應

| Agent | Emoji |
|-------|-------|
| architect | 🏗️ |
| designer | 🎨 |
| migration | 🔀 |
| developer | 💻 |
| skills-agents | 📚 |
| reviewer | 🔍 |
| tester | 🧪 |
| debugger | 🐛 |
| workflow | 🔄 |

## Task 描述解析

從 `task_instructions` 提取：

```
"Task 2.1: 建立 UserService" → { taskId: "2.1", description: "建立 UserService" }
"Task 2.1 - 建立 UserService" → { taskId: "2.1", description: "建立 UserService" }
"建立 UserService（無 Task ID）" → { taskId: null, description: "建立 UserService" }
```

## 測試

```bash
# 測試單一 Task
echo '{"tool_name":"Task","tool_input":{"subagent_type":"developer","task_instructions":"Task 2.1: 建立 UserService"}}' | \
  node ~/.claude/hooks/workflow/status-display.js

# 測試並行 Task（需要短時間內執行多次）
for i in 1 2 3; do
  echo "{\"tool_name\":\"Task\",\"tool_input\":{\"subagent_type\":\"developer\",\"task_instructions\":\"Task 2.$i: Service $i\"}}" | \
    node ~/.claude/hooks/workflow/status-display.js
  sleep 0.1
done
```

## 與 state-updater.js 協作

| Hook | 職責 |
|------|------|
| **status-display.js** | 顯示 Task 啟動訊息、並行檢測 |
| **state-updater.js** | 更新狀態、輸出狀態轉換訊息 |

兩者都註冊在 `PostToolUse: Task`，依序執行：
1. `status-display.js` 先執行（顯示啟動）
2. `state-updater.js` 後執行（更新狀態並顯示轉換）

## 配置

在 `settings.json` 的 `PostToolUse` 中：

```json
{
  "matchers": ["Task"],
  "hooks": [
    {
      "type": "command",
      "command": "node \"/Users/sbu/.claude/hooks/workflow/status-display.js\"",
      "timeout": 2
    },
    {
      "type": "command",
      "command": "node \"/Users/sbu/.claude/hooks/workflow/task-sync.js\"",
      "timeout": 3
    }
  ]
}
```

## 故障排除

### 並行訊息沒有顯示

- 檢查 Task 啟動時間間隔是否 < 5 秒
- 檢查 `workflow-state/parallel-tasks.json` 權限
- 確認 `subagent_type` 相同

### Task ID 解析失敗

- 確認 `task_instructions` 格式：
  - ✅ `Task 2.1: 描述`
  - ✅ `Task 2.1 - 描述`
  - ❌ `2.1 描述`（缺少 "Task" 關鍵字）
