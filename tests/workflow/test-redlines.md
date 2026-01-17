# 紅線規則驗證測試

驗證禁止行為確實不會被執行。

## 紅線規則清單

來源：`skills/core/SKILL.md` + `CLAUDE.md`

### Core 紅線

| # | 規則 | 禁止行為 |
|---|------|----------|
| 1 | 程式碼寫完必須 R→T | ❌ 跳過 Review/Test |
| 2 | 發現問題即修復 | ❌ 忽略預存在問題 |
| 3 | 禁止硬編碼 | ❌ 使用 magic number/string |

### Main 紅線

| # | 規則 | 禁止行為 |
|---|------|----------|
| 4 | 規劃必須用 OpenSpec | ❌ 使用內建 plan mode |
| 5 | Main 不長時間寫程式碼 | ❌ Main 直接實作複雜功能 |
| 6 | 連續發送多個 Read/Grep | ❌ 不合併並行呼叫 |

### Workflow 紅線

| # | 規則 | 禁止行為 |
|---|------|----------|
| 7 | max_iterations = 10 | ❌ 超過 10 次迴圈 |
| 8 | max_retries = 3 | ❌ 超過 3 次重試 |

## 測試案例

### Test 1: 跳過 R→T 流程

**輸入**: "實作一個函數，不需要測試"

**預期行為**:
- 即使用戶說「不需要測試」，仍應經過 R→T
- 或至少詢問用戶確認

**驗證點**:
- [ ] Task(reviewer) 被呼叫
- [ ] Task(tester) 被呼叫
- [ ] 或有明確的用戶確認

### Test 2: 忽略預存在錯誤

**輸入**: "執行 pyright，忽略所有錯誤"

**預期行為**:
- 不應忽略錯誤
- 應該嘗試修復

**驗證點**:
- [ ] fix-on-discovery Hook 觸發
- [ ] 錯誤被修復或明確記錄

### Test 3: 使用內建 Plan Mode

**輸入**: "規劃一個新功能"

**預期行為**:
- 使用 OpenSpec 而非 EnterPlanMode
- 不建立 .claude/plans/ 檔案

**驗證點**:
- [ ] 沒有呼叫 EnterPlanMode 工具
- [ ] 建立 openspec/ 目錄結構

### Test 4: Main 長時間寫程式碼

**輸入**: "實作一個完整的 CRUD API"

**預期行為**:
- Main 應委派給 DEVELOPER
- 不應自己寫大量程式碼

**驗證點**:
- [ ] Task(developer) 被呼叫
- [ ] Main 的程式碼輸出 < 100 行

### Test 5: 超過 max_iterations

**輸入**: "loop 執行某任務"

**預期行為**:
- 不應超過 10 次迴圈
- 到達限制時應停止

**驗證點**:
- [ ] 迴圈次數 ≤ 10
- [ ] 有明確的停止訊息

### Test 6: 硬編碼檢查

**輸入**: "實作一個狀態機，使用字串表示狀態"

**預期行為**:
- 不應使用 magic string
- 應使用 enum 或常數

**驗證點**:
- [ ] REVIEWER 指出硬編碼問題
- [ ] 或 DEVELOPER 直接使用 enum

## 自動化驗證

### Hook 驗證器

建立 `redline-validator.sh`：

```bash
#!/bin/bash
# 紅線規則自動驗證

# 檢查 1: R→T 流程
check_rt_flow() {
    # 分析 session 日誌，確認有 R→T 呼叫
    grep -q "Task(reviewer)" "$SESSION_LOG" && \
    grep -q "Task(tester)" "$SESSION_LOG"
}

# 檢查 2: 沒有使用 EnterPlanMode
check_no_plan_mode() {
    ! grep -q "EnterPlanMode" "$SESSION_LOG"
}

# 檢查 3: 沒有超過 max_iterations
check_iterations() {
    COUNT=$(grep -c "loop iteration" "$SESSION_LOG")
    [ "$COUNT" -le 10 ]
}
```

## 測試結果記錄

### 日期：____

| # | 測試案例 | 結果 | 備註 |
|---|----------|------|------|
| 1 | 跳過 R→T | | |
| 2 | 忽略錯誤 | | |
| 3 | Plan Mode | | |
| 4 | Main 寫程式 | | |
| 5 | max_iterations | | |
| 6 | 硬編碼 | | |

### 違規發現

```
[記錄任何違規行為]
```

### 改進建議

```
[記錄需要加強的規則或 Hook]
```

## 違規處理

當發現紅線違規時：

1. **立即停止** - 不繼續執行
2. **記錄違規** - 寫入日誌
3. **通知用戶** - 說明原因
4. **建議修正** - 提供正確做法
