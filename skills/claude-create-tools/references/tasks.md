# Tasks 使用指南

Task tool 用於調用 Subagents 執行專業任務。

## Task Tool 參數

| 參數 | 必須 | 說明 |
|------|------|------|
| `description` | ✅ | 3-5 字的任務描述 |
| `prompt` | ✅ | 完整的任務指令 |
| `subagent_type` | ✅ | Agent 類型 |
| `model` | ❌ | `sonnet`, `opus`, `haiku` |
| `run_in_background` | ❌ | 是否背景執行 |
| `resume` | ❌ | Agent ID（恢復執行） |
| `max_turns` | ❌ | 最大回合數 |

---

## 內建 Subagent 類型

| 類型 | 模型 | 工具 | 用途 |
|------|------|------|------|
| `Explore` | Haiku | Read-only | 代碼搜索、分析、探索 |
| `Plan` | 繼承 | Read-only | 規劃和設計 |
| `general-purpose` | 繼承 | All | 複雜多步驟任務 |
| `Bash` | 繼承 | Bash | 終端命令執行 |

---

## 使用範例

### 基本調用

```python
Task(
    description="搜索 API endpoints",
    prompt="找出所有處理 user authentication 的 API endpoints",
    subagent_type="Explore"
)
```

### 指定模型

```python
Task(
    description="代碼審查",
    prompt="審查這個 PR 的代碼品質和安全性",
    subagent_type="code-reviewer",
    model="opus"  # 更強大的模型
)
```

### 背景執行

```python
Task(
    description="運行測試",
    prompt="執行完整的測試套件",
    subagent_type="Bash",
    run_in_background=True
)
```

### 恢復執行

```python
Task(
    description="繼續搜索",
    prompt="繼續搜索相關的 error handling 邏輯",
    subagent_type="Explore",
    resume="agent-id-123"  # 從之前的 agent 恢復
)
```

---

## Background Tasks

### 何時使用

- 獨立任務，不需要即時反饋
- 長時間操作
- 可以並行執行的任務

### 限制

- 繼承父級權限
- 不允許的操作會失敗
- MCP 工具不可用
- 需要權限提示時會失敗

### 操作

```bash
# 按 Ctrl+B 將當前任務移到背景
Ctrl+B

# 禁用所有背景任務
export CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1
```

---

## TaskOutput

檢查背景任務輸出：

```python
TaskOutput(
    task_id="task-id-123",
    block=True,      # 等待完成
    timeout=30000    # 最大等待時間（ms）
)
```

---

## Resume 機制

### 保存 Agent ID

每次 Task 完成後會返回 `agentId`，可用於後續恢復。

### 恢復執行

```python
# 第一次調用
result = Task(
    description="分析代碼",
    prompt="分析專案結構",
    subagent_type="Explore"
)
# result 包含 agentId

# 後續恢復
Task(
    description="繼續分析",
    prompt="找出最複雜的模組",
    subagent_type="Explore",
    resume="agentId-from-first-call"
)
```

---

## 並行執行

### 獨立任務並行

```python
# 在同一訊息中調用多個 Task
Task(description="搜索 A", prompt="...", subagent_type="Explore")
Task(description="搜索 B", prompt="...", subagent_type="Explore")
Task(description="搜索 C", prompt="...", subagent_type="Explore")
```

### 依賴任務順序執行

```python
# 先執行 A
result_a = Task(...)

# 使用 A 的結果執行 B
result_b = Task(prompt=f"基於 {result_a} 執行...", ...)
```

---

## 何時使用 Task

| 場景 | 使用 Task? |
|------|-----------|
| 開放式代碼探索 | ✅ 使用 Explore |
| 複雜多步驟任務 | ✅ 使用 general-purpose |
| 讀取特定檔案 | ❌ 直接使用 Read |
| 搜索特定類別定義 | ❌ 直接使用 Glob |
| 並行執行獨立任務 | ✅ 多個 Task |

---

## 最佳實踐

### 清晰的 prompt

```python
# ✅ 好
Task(
    description="搜索錯誤處理",
    prompt="找出所有處理 database connection error 的代碼，包括 retry 邏輯",
    subagent_type="Explore"
)

# ❌ 不好
Task(
    description="搜索",
    prompt="搜索代碼",
    subagent_type="Explore"
)
```

### 選擇適當的模型

| 任務類型 | 建議模型 |
|----------|---------|
| 簡單搜索 | `haiku` |
| 複雜分析 | `sonnet` |
| 安全審查 | `opus` |

### 適當使用背景執行

```python
# ✅ 適合背景執行
Task(description="運行測試", ..., run_in_background=True)

# ❌ 不適合背景執行（需要交互）
Task(description="編輯文件", ..., run_in_background=True)
```

---

## Checklist

- [ ] `description` 清晰簡潔（3-5 字）
- [ ] `prompt` 詳細具體
- [ ] 選擇適當的 `subagent_type`
- [ ] 考慮是否需要背景執行
- [ ] 保存 `agentId` 以便後續恢復
