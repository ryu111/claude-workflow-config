# Phase Execution Rules

任務 Phase 的執行規則與策略。

## Phase 類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `sequential` | 依序執行 | 基礎建設、有依賴的任務 |
| `parallel` | 同時執行 | 獨立功能、無衝突檔案 |
| `depends: N` | 等待 Phase N | 整合任務 |

## Phase 格式

```markdown
## 1. Foundation (sequential)
- [ ] 1.1 Task A | files: path/to/a.ts
- [ ] 1.2 Task B | files: path/to/b.ts

## 2. Features (parallel)
- [ ] 2.1 Feature X | files: src/x.ts
- [ ] 2.2 Feature Y | files: src/y.ts
- [ ] 2.3 Feature Z | files: src/z.ts

## 3. Integration (sequential, depends: 2)
- [ ] 3.1 Integrate all | files: src/index.ts
```

## 執行規則

### Sequential Phase

```
Task 1.1 → Task 1.2 → Task 1.3
   ↓
必須按順序完成
```

**適用情境**：
- 後續任務依賴前面任務的結果
- 修改同一個檔案
- 基礎建設任務

### Parallel Phase

```
Task 2.1 ─┐
Task 2.2 ─┼→ 同時執行
Task 2.3 ─┘
```

**適用情境**：
- 獨立的功能模組
- 不同檔案
- 無相互依賴

---

## Parallel 執行方式

### 如何實際並行執行

**重要**：要並行執行任務，必須在**同一訊息**中發送多個 Task 工具調用。

**正確做法** ✅ - 同一訊息發送多個 Task：

```
# 三個 DEVELOPER subagent 同時執行
Task(subagent_type: "developer", prompt: "Task 2.1 - User API...", description: "實作 User API")
Task(subagent_type: "developer", prompt: "Task 2.2 - Cart API...", description: "實作 Cart API")
Task(subagent_type: "developer", prompt: "Task 2.3 - Order API...", description: "實作 Order API")
```

**錯誤做法** ❌ - 分開訊息發送（變成 sequential）：

```
Task(...Task 2.1...) → 等待結果 → Task(...Task 2.2...) → 等待結果
```

---

## 任務依賴性判斷

### 判斷標準

在決定任務是否可以並行之前，必須檢查以下依賴性：

| 依賴類型 | 說明 | 範例 |
|----------|------|------|
| **檔案依賴** | 任務 B 需要任務 A 產生的檔案 | B 要 import A 建立的模組 |
| **資料依賴** | 任務 B 需要任務 A 的輸出結果 | B 需要 A 的 API response 格式 |
| **順序依賴** | 邏輯上必須先做 A 再做 B | 先建 DB schema 再寫 query |
| **檔案衝突** | 多個任務修改同一檔案 | 都要改 index.ts |

### 依賴性檢查流程

```
對於每個 Phase 中的任務：

1. 列出任務要修改/建立的檔案
2. 列出任務需要讀取/依賴的檔案
3. 檢查是否有交集

有交集 → Sequential
無交集 → 可以 Parallel
```

### 範例分析

**可以並行** ✅：

```markdown
## 2. APIs (parallel)
- [ ] 2.1 User API | creates: src/api/user.ts | depends: none
- [ ] 2.2 Cart API | creates: src/api/cart.ts | depends: none
- [ ] 2.3 Order API | creates: src/api/order.ts | depends: none
```

→ 各自獨立，無交集

**不能並行** ❌：

```markdown
## 2. Order Feature (should be sequential)
- [ ] 2.1 Order Model | creates: src/models/order.ts
- [ ] 2.2 Order Service | creates: src/services/order.ts | depends: src/models/order.ts
- [ ] 2.3 Order API | creates: src/api/order.ts | depends: src/services/order.ts
```

→ 存在依賴鏈，必須 sequential

### 混合模式

同一功能可能同時包含可並行和需依序的任務：

```markdown
## 2. User Feature (mixed)

### 2.a Independent (parallel)
- [ ] 2.1 User Types | files: src/types/user.ts
- [ ] 2.2 User Utils | files: src/utils/user.ts

### 2.b Dependent (sequential, depends: 2.a)
- [ ] 2.3 User Service | files: src/services/user.ts | needs: 2.1, 2.2
- [ ] 2.4 User API | files: src/api/user.ts | needs: 2.3
```

---

## Parallel 中的 D→R→T

### 方式 1：完全並行（推薦用於小任務）

每個任務獨立執行完整 D→R→T：

```
Task 2.1: D → R → T ─┐
Task 2.2: D → R → T ─┼→ 全部完成後進入下一 Phase
Task 2.3: D → R → T ─┘
```

### 方式 2：階段並行（推薦用於大任務）

先並行 DEVELOPER，再統一 REVIEW：

```
Step 1 - 並行 DEVELOPER：
  Task(developer, "Task 2.1...")
  Task(developer, "Task 2.2...")
  Task(developer, "Task 2.3...")

Step 2 - 統一 REVIEWER：
  Task(reviewer, "審查 Task 2.1, 2.2, 2.3 的所有程式碼...")

Step 3 - 並行 TESTER：
  Task(tester, "測試 Task 2.1...")
  Task(tester, "測試 Task 2.2...")
  Task(tester, "測試 Task 2.3...")
```

---

## Parallel 錯誤處理

當並行任務中有一個失敗時：

| 情況 | 處理方式 |
|------|----------|
| REVIEWER REJECT 其中一個 | 只重試該任務，其他繼續 |
| TESTER FAIL 其中一個 | 呼叫 DEBUGGER 修復該任務 |
| 多個任務失敗 | 依序處理每個失敗的任務 |

```
並行執行 Task 2.1, 2.2, 2.3
     ↓
結果：2.1 ✅, 2.2 ❌, 2.3 ✅
     ↓
只重新處理 Task 2.2 的 D→R→T
     ↓
全部完成 → 進入下一 Phase
```

### Depends Phase

```
Phase 1 ─→ Phase 2 ─→ Phase 3
                         ↑
                    depends: 2
```

## Parallel 檔案衝突檢查

**重要**：Parallel phase 中的任務不能修改相同檔案。

### 正確範例 ✅

```markdown
## 2. APIs (parallel)
- [ ] 2.1 User API | files: src/api/user.ts
- [ ] 2.2 Cart API | files: src/api/cart.ts
- [ ] 2.3 Order API | files: src/api/order.ts
```

每個任務有獨立檔案。

### 錯誤範例 ❌

```markdown
## 2. APIs (parallel)
- [ ] 2.1 Add user endpoint | files: src/api/index.ts  ← 衝突
- [ ] 2.2 Add cart endpoint | files: src/api/index.ts  ← 衝突
```

多個任務修改同一檔案。

### 解決方案

**方案 1**：改為 sequential
```markdown
## 2. APIs (sequential)
- [ ] 2.1 Add user endpoint | files: src/api/index.ts
- [ ] 2.2 Add cart endpoint | files: src/api/index.ts
```

**方案 2**：拆分成獨立檔案
```markdown
## 2. APIs (parallel)
- [ ] 2.1 User API | files: src/api/user.ts
- [ ] 2.2 Cart API | files: src/api/cart.ts

## 3. Integration (sequential, depends: 2)
- [ ] 3.1 Export all APIs | files: src/api/index.ts
```

## 任務狀態

| 狀態 | 說明 |
|------|------|
| `- [ ]` | 待執行 |
| `- [x]` | 已完成 |
| `- [!]` | 失敗（需重新規劃） |

## D→R→T 循環

每個任務執行：

```
DEVELOPER → REVIEWER
                │
         ┌──────┴──────┐
      REJECT        APPROVE
         │              │
         ↓              ↓
     DEVELOPER       TESTER
     (retry++)          │
                 ┌──────┴──────┐
               FAIL         PASS
                 │             │
                 ↓             ↓
             DEBUGGER    Mark [x] ✓
                 │
                 ↓
             DEVELOPER
```

### ⚠️ 重要：必須使用 Task 工具產生 Subagent

**正確做法** - 使用 Task 工具：

```
# DEVELOPER 階段
Task(
  subagent_type: "developer",
  prompt: "實作 Task 2.1 - 建立 AuthService...",
  description: "實作 AuthService"
)

# REVIEWER 階段
Task(
  subagent_type: "reviewer",
  prompt: "審查 Task 2.1 的 AuthService 程式碼，檢查：安全性、效能、程式碼品質...",
  description: "審查 AuthService"
)

# TESTER 階段
Task(
  subagent_type: "tester",
  prompt: "測試 Task 2.1 的 AuthService，執行單元測試...",
  description: "測試 AuthService"
)
```

**錯誤做法** - 只顯示 emoji 不產生 subagent：

```
💻 DEVELOPER: 實作 Task 2.1...
（直接執行程式碼，沒有使用 Task 工具）

這樣做無法獲得專業 subagent 的完整能力！
```

### Subagent 結果處理

1. **REVIEWER 結果**：
   - 包含 "APPROVE" → 進入 TESTER
   - 包含 "REJECT" → 回到 DEVELOPER（retry++）

2. **TESTER 結果**：
   - 包含 "PASS" → 標記任務完成
   - 包含 "FAIL" → 呼叫 DEBUGGER

---

## ⚠️ 同步更新 tasks.md（關鍵！）

**每個任務完成後必須立即更新 `tasks.md` 中的 checkbox！**

這是為了：
1. 追蹤進度
2. 支援斷點恢復（新 AI 可以接手）
3. 避免重複執行已完成的任務

### 更新流程

```
任務完成（TESTER PASS）
     ↓
立即更新 openspec/changes/[change-id]/tasks.md：
- [ ] 2.1 Create user API  →  - [x] 2.1 Create user API
     ↓
更新 Progress 區塊
     ↓
Git commit
```

### tasks.md Progress 區塊

每次更新任務狀態時，同時更新 Progress：

```markdown
## Progress
- Total: 8 tasks
- Completed: 3        ← 更新這裡
- Status: IN_PROGRESS ← 更新這裡

---

## 1. Foundation (sequential)
- [x] 1.1 Setup database | files: src/db/index.ts
- [x] 1.2 Create models | files: src/models/
- [x] 1.3 Setup auth | files: src/auth/

## 2. Core Features (parallel)
- [ ] 2.1 User API | files: src/api/user.ts  ← 下一個任務
- [ ] 2.2 Cart API | files: src/api/cart.ts
```

### Status 值

| Status | 說明 |
|--------|------|
| `NOT_STARTED` | 尚未開始 |
| `IN_PROGRESS` | 進行中 |
| `COMPLETED` | 全部完成 |
| `BLOCKED` | 被阻擋（需要協助） |

### 斷點恢復

當新 AI 接手時（`接手 [change-id]` 或 `工作流 [change-id]`）：

```
1. 讀取 tasks.md
2. 解析 Progress 區塊了解整體狀態
3. 掃描找到第一個 `- [ ]` 未完成任務
4. 從該任務繼續執行 D→R→T
```

---

## 重試限制

| 參數 | 值 | 說明 |
|------|-----|------|
| max_retries | 3 | 單任務最大重試次數 |

**重試 3 次仍失敗**：
1. 標記任務為 `[!]`
2. 回報給 ARCHITECT
3. 重新規劃任務

## Git Commit 策略

任務完成後立即 commit：

```bash
# 格式
git commit -m "<type>(task-X.X): description"

# 類型
feat     - 新功能
fix      - Bug 修復
refactor - 重構
test     - 測試
docs     - 文檔
```

範例：
```bash
git commit -m "feat(task-2.1): implement user authentication"
git commit -m "fix(task-3.2): resolve race condition in cart"
```
