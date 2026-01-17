# 工作流測試套件

驗證 Claude Code 工作流系統的正確性。

## 測試層次

| 層次 | 檔案 | 說明 |
|------|------|------|
| Hook 單元測試 | `test-hooks.sh` | 測試各 Hook 的輸入/輸出 |
| 委派決策測試 | `test-delegation.md` | 驗證關鍵字→Agent 映射 |
| E2E 流程測試 | `test-e2e-scenarios.md` | 完整 D→R→T 流程 |
| 紅線規則測試 | `test-redlines.md` | 禁止行為不執行 |

## 執行方式

### Hook 單元測試（自動化）

```bash
# 執行所有 Hook 單元測試
~/.claude/tests/workflow/test-hooks.sh

# 執行特定測試
~/.claude/tests/workflow/test-hooks.sh fix-on-discovery
```

### 委派決策測試（手動 + 自動記錄）

1. 開啟新 session
2. 輸入 `test-delegation.md` 中的測試 prompt
3. 觀察委派行為
4. 查看自動記錄：`~/.claude/tests/workflow/results/delegation.log`

### E2E 測試（手動）

1. 建立測試專案
2. 執行 `test-e2e-scenarios.md` 中的場景
3. 記錄結果

### 紅線測試（手動）

1. 執行 `test-redlines.md` 中的測試案例
2. 驗證禁止行為是否被阻止

## 測試結果

測試結果會輸出到 `~/.claude/tests/workflow/results/`

| 檔案 | 內容 |
|------|------|
| `hooks-*.txt` | Hook 單元測試結果 |
| `delegation.log` | Task 委派記錄（JSON） |
| `e2e-trace.log` | E2E 流程追蹤 |

## 自動化監控

`delegation-logger.sh` Hook 會自動記錄所有 Task 呼叫：

```json
{"timestamp": "2026-01-17T21:00:00", "agent": "developer", "prompt_preview": "實作..."}
```
