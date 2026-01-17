# 並行委派規則

**核心原則：無依賴的操作必須同時執行**

## 基本規則

| 操作類型 | 處理方式 | 範例 |
|----------|----------|------|
| 讀取多個不同檔案 | **並行** | 同時讀取 A.md, B.md, C.md |
| 搜尋多個不同模式 | **並行** | 同時搜尋 "TODO", "FIXME", "BUG" |
| 多個獨立 D→R→T | **並行啟動** | 同時啟動 3 個 Developer |
| Read → Edit 同一檔案 | 串行 | 先讀再改 |
| 有依賴的任務 | 串行 | Task A 完成後才能開始 Task B |

## 並行委派範例

### 正確：同時發送多個獨立任務

```python
# ✅ 正確：並行發送
Task(subagent_type: "developer", prompt: "Task 1.1...")  }
Task(subagent_type: "developer", prompt: "Task 1.2...")  } 同時發送
Task(subagent_type: "developer", prompt: "Task 2.1...")  }
```

### 錯誤：Main Agent 自己做

```python
# ❌ 錯誤：Main Agent 自己做，佔用對話
我來寫 Task 1.1 的程式碼...（長時間執行）
```

### 錯誤：連續發送 Read/Grep

```python
# ❌ 錯誤：連續發送多個 Read
Read(file_path: "A.md")
Read(file_path: "B.md")
Read(file_path: "C.md")

# ✅ 正確：合併為一次發送
# 在同一個訊息中同時呼叫三個 Read
```

## 依賴判斷

### 無依賴（可並行）

- 讀取不同檔案
- 搜尋不同模式
- 處理不同功能模組
- 獨立的 D→R→T 流程

### 有依賴（必須串行）

- 讀取後編輯同一檔案
- Task B 需要 Task A 的輸出
- Reviewer 需要 Developer 完成
- Tester 需要 Reviewer 通過

## 並行啟動格式

當同時啟動多個 Agent 時，使用以下格式顯示：

```markdown
## ⚡ 啟動 3 個 💻 DEVELOPER 並行處理：
- Task 1.1: 建立 UserService
- Task 1.2: 建立 AuthService
- Task 2.1: 建立 PaymentService
```

```markdown
## ⚡ 並行啟動：
- 💻 DEVELOPER: Task 1.1
- 🔍 REVIEWER: Task 2.1（已完成開發）
- 🧪 TESTER: Task 3.1（已通過審查）
```

## 紅線規則

觸發後必須**立即停止並調整**：

- 發現連續發送多個 Read/Grep → 停止，合併為一次發送

## 效能指標

Session Report 中追蹤並行效率：

```
═══ Session Report ═══
✅ D→R→T: X/X (100%)
⚡ 並行: Y/Y (100%)    ← 並行執行比例
📝 變更: Z files, ±N lines
═══════════════════════
```
