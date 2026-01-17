# D→R→T 工作流詳細規則

## 核心定義

```
D = Task(subagent_type: "developer")  → 寫程式碼
R = Task(subagent_type: "reviewer")   → 審查程式碼
T = Task(subagent_type: "tester")     → 測試程式碼
```

## 三種合法路徑

### 1. Main → R → T

**適用場景**：Main Agent 直接進行簡單修復

```
Main Agent 修復程式碼
    ↓
Task(subagent_type: "reviewer")
    ↓
Task(subagent_type: "tester")
```

### 2. Design → R → T

**適用場景**：UI/UX 任務，Designer 設計後實作

```
Task(subagent_type: "designer")
    ↓
實作設計規格
    ↓
Task(subagent_type: "reviewer")
    ↓
Task(subagent_type: "tester")
```

### 3. D → R → T

**適用場景**：一般開發任務

```
Task(subagent_type: "developer")
    ↓
Task(subagent_type: "reviewer")
    ↓
Task(subagent_type: "tester")
```

## 違規情況處理

### 發現違規時

觸發後必須**立即停止並調整**：

1. 發現自己正在直接寫程式碼 → 停止，改用 Task(developer)
2. 發現程式碼寫完沒有審查 → 停止，呼叫 Task(reviewer)
3. 發現審查完沒有測試 → 停止，呼叫 Task(tester)

### 常見藉口（不接受）

```
❌「這個改動很簡單」
❌「只是修個 typo」
❌「時間不夠」
❌「測試太複雜」
```

## Subagent 角色邊界

**D→R→T 規則是給 Main Agent 的，不是給 Subagent 的！**

| 被呼叫為 | 職責 | 禁止行為 |
|----------|------|----------|
| `developer` | 直接寫程式碼 | 再呼叫 Task(developer) |
| `reviewer` | 直接審查程式碼 | 再呼叫 Task(reviewer) |
| `tester` | 直接執行測試 | 再呼叫 Task(tester) |

### 錯誤示例

```python
# ❌ Developer 又呼叫 Developer
# 作為 developer 被呼叫
Task(subagent_type: "developer", prompt: "寫這個...")  # 錯誤！

# ✅ 正確：直接寫程式碼
Edit(file_path: "...", old_string: "...", new_string: "...")
```

## 工作流限制

| 參數 | 值 | 說明 |
|------|-----|------|
| max_iterations | 10 | 最大迭代次數 |
| max_retries | 3 | 最大重試次數 |
