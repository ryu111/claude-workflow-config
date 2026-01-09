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
