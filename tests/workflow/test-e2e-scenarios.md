# 端到端流程測試

驗證完整的 D→R→T 工作流程。

## 測試目標

確保：
1. DEVELOPER 完成後自動觸發 REVIEWER
2. REVIEWER 完成後自動觸發 TESTER
3. REVIEWER 發現問題時返回 DEVELOPER
4. TESTER 失敗時返回修復流程
5. 整個流程有正確的狀態顯示

## 測試場景

### Scenario 1: 簡單功能實作（Happy Path）

**輸入**: "實作一個計算兩數相加的函數"

**預期流程**:
```
Main Agent
  → Task(developer): 實作函數
  → Task(reviewer): 審查程式碼
  → Task(tester): 執行測試
  → 完成
```

**驗證點**:
- [ ] DEVELOPER 產生程式碼
- [ ] REVIEWER 被自動呼叫
- [ ] TESTER 被自動呼叫
- [ ] 測試通過
- [ ] 每個階段有正確的狀態顯示

### Scenario 2: 審查發現問題

**輸入**: "實作一個有明顯問題的函數（測試用）"

**預期流程**:
```
Main Agent
  → Task(developer): 實作函數（故意有問題）
  → Task(reviewer): 審查發現問題
  → Task(developer): 修復問題
  → Task(reviewer): 再次審查
  → Task(tester): 執行測試
  → 完成
```

**驗證點**:
- [ ] REVIEWER 正確識別問題
- [ ] 問題被回報給 DEVELOPER
- [ ] DEVELOPER 修復後再次觸發 REVIEWER
- [ ] 最終流程完成

### Scenario 3: 測試失敗

**輸入**: "實作一個函數，但故意讓測試失敗"

**預期流程**:
```
Main Agent
  → Task(developer): 實作函數
  → Task(reviewer): 審查通過
  → Task(tester): 測試失敗
  → Task(developer): 修復
  → Task(tester): 重新測試
  → 完成
```

**驗證點**:
- [ ] TESTER 正確報告失敗
- [ ] 失敗資訊傳遞給 DEVELOPER
- [ ] 修復後重新測試

### Scenario 4: Main 直接修復（簡單任務）

**輸入**: "修正這個 typo: functoin → function"

**預期流程**:
```
Main Agent
  → 直接修改（不委派 DEVELOPER）
  → Task(reviewer): 審查
  → Task(tester): 測試
  → 完成
```

**驗證點**:
- [ ] Main 不委派 DEVELOPER（簡單任務）
- [ ] 但仍然經過 R→T 流程

### Scenario 5: 設計→實作流程

**輸入**: "設計並實作一個登入表單"

**預期流程**:
```
Main Agent
  → Task(designer): 設計 UI/UX
  → Task(developer): 實作設計
  → Task(reviewer): 審查
  → Task(tester): 測試
  → 完成
```

**驗證點**:
- [ ] DESIGNER 先被呼叫
- [ ] 設計結果傳遞給 DEVELOPER
- [ ] 完整 R→T 流程

## 執行方式

### 手動測試

1. 開啟新 Claude Code session
2. 建立測試專案目錄
3. 輸入測試 prompt
4. 觀察完整流程
5. 記錄每個階段的行為

### 自動化監控

建立 `e2e-monitor.sh` Hook 記錄流程：

```bash
# 在每個 Task 呼叫時記錄
echo "[$(date)] Task: $SUBAGENT_TYPE" >> ~/.claude/tests/workflow/results/e2e-trace.log
```

## 測試結果模板

### Scenario: ____

**日期**: ____

**實際流程**:
```
[記錄實際的 agent 呼叫順序]
```

**驗證結果**:
- [ ] 符合預期流程
- [ ] 狀態顯示正確
- [ ] 無異常行為

**問題發現**:
```
[記錄任何問題]
```

## 常見問題

### Q: D→R→T 沒有自動觸發

**可能原因**:
1. main skill 沒有載入
2. Hook 沒有正確配置
3. Agent 沒有返回正確的狀態

**排查步驟**:
1. 檢查 `~/.claude/skills/main/SKILL.md` 是否存在
2. 檢查 `settings.json` 中的 Hook 配置
3. 檢查 Agent 定義中的結束格式

### Q: 流程卡在某個階段

**可能原因**:
1. Hook timeout
2. Agent 執行錯誤
3. 無限迴圈

**排查步驟**:
1. 檢查 Hook 日誌
2. 檢查 Agent 輸出
3. 檢查是否有循環委派
