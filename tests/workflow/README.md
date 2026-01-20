# state-updater.js 測試套件

完整的單元測試和整合測試套件，驗證 Workflow 2.0 狀態更新器的 ad-hoc workflow 初始化功能。

## 快速開始

```bash
cd /Users/sbu/.claude

# 執行所有測試
node tests/test-state-updater.js
node tests/test-state-updater-integration.js

# 一行執行全部
node tests/test-state-updater.js && node tests/test-state-updater-integration.js && echo "✅ 通過"
```

## 測試概況

- **單元測試**：19 個測試 (354 行代碼)
- **整合測試**：11 個測試 (351 行代碼)
- **覆蓋率**：100% ✅
- **狀態**：30/30 通過

## 測試檔案

### 執行檔
| 檔案 | 說明 |
|------|------|
| `test-state-updater.js` | 單元測試 (19 個) |
| `test-state-updater-integration.js` | 整合測試 (11 個) |

### 文檔
| 檔案 | 說明 |
|------|------|
| `state-updater-test-report.md` | 詳細測試報告 |
| `state-updater-testing-guide.md` | 完整測試指南 |
| `TESTING-SUMMARY.md` | 測試完成摘要 |
| `README.md` | 本檔案 |

## 測試覆蓋範圍

### generateAdHocChangeId()
- 有 prompt 時生成格式：`ad-hoc-${slug}-${timestamp}`
- 無 prompt 時 fallback：`ad-hoc-${timestamp}`
- 唯一性驗證、字符過濾、中文支援

### resetWorkflowState()
- 完整狀態物件初始化
- 時間戳欄位設置
- mainAgentOps 計數初始化

### Ad-hoc 初始化邏輯
- DONE 狀態 → 觸發初始化
- IDLE 狀態 → 觸發初始化
- 其他狀態 → 不觸發

### ARCHITECT 重置邏輯
- 狀態重置和 changeId 生成
- 委派計數記錄

## 被測源碼

**位置**：`/Users/sbu/.claude/plugins/workflow/hooks/state-updater.js`

- 第 224-237 行：`generateAdHocChangeId()`
- 第 146-163 行：`resetWorkflowState()`
- 第 367-418 行：Task 工具主邏輯

## 執行結果

```
✅ 單元測試：19/19 通過
✅ 整合測試：11/11 通過
✅ 總計：30/30 通過 (100%)
```

## 關鍵測試案例

### 1. Ad-hoc Workflow 啟動
驗證 DONE/IDLE 狀態下的自動初始化

### 2. changeId 唯一性
驗證毫秒級時間戳保證的唯一性

### 3. 狀態重置完整性
驗證所有狀態欄位正確初始化

### 4. Agent 狀態映射
驗證 6 種 agent 類型的狀態對應

## 使用建議

1. **開發時**：在修改 state-updater.js 前執行測試確立基線
2. **修改後**：執行測試確保沒有回歸
3. **CI/CD 整合**：將測試加入自動化流程

## 更多信息

- **詳細報告**：見 `state-updater-test-report.md`
- **測試指南**：見 `state-updater-testing-guide.md`
- **摘要資訊**：見 `TESTING-SUMMARY.md`

---

**更新日期**：2026-01-20
**狀態**：就緒交付 ✅
