# 委派決策測試

驗證 Main Agent 是否正確識別關鍵字並委派給對應 Agent。

## 測試方法

由於委派決策涉及 LLM，無法用純腳本測試。改用以下方法：

1. **Prompt 測試**：手動輸入測試 prompt，觀察委派行為
2. **Hook 記錄**：透過 Hook 記錄實際的 Task 呼叫
3. **日誌分析**：分析 session 日誌中的委派模式

## 測試案例

### 1. ARCHITECT 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "規劃一個新功能" | ARCHITECT | 建立 OpenSpec |
| "plan the authentication system" | ARCHITECT | 建立 OpenSpec |
| "分析這個需求" | ARCHITECT | 分析並規劃 |

### 2. DEVELOPER 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "實作登入功能" | DEVELOPER | 寫程式碼 |
| "implement the API endpoint" | DEVELOPER | 寫程式碼 |
| "新增一個按鈕" | DEVELOPER | 寫程式碼 |

### 3. REVIEWER 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "審查這段程式碼" | REVIEWER | 程式碼審查 |
| "review the changes" | REVIEWER | 程式碼審查 |
| "檢查程式碼品質" | REVIEWER | 程式碼審查 |

### 4. TESTER 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "測試這個功能" | TESTER | 執行測試 |
| "run the tests" | TESTER | 執行測試 |
| "驗證 QA" | TESTER | 執行測試 |

### 5. DEBUGGER 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "debug 這個錯誤" | DEBUGGER | 除錯 |
| "修復這個 bug" | DEBUGGER | 除錯 |
| "找出問題原因" | DEBUGGER | 除錯 |

### 6. DESIGNER 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "設計登入頁面" | DESIGNER | UI/UX 設計 |
| "design the dashboard" | DESIGNER | UI/UX 設計 |
| "改善使用者體驗" | DESIGNER | UX 設計 |

### 7. SKILLS 委派測試

| 輸入 Prompt | 預期 Agent | 預期行為 |
|-------------|------------|----------|
| "建立新 skill" | SKILLS | 建立 skill |
| "更新 agent 定義" | SKILLS | 維護 agent |
| "檢查 skill 規範" | SKILLS | 檢查規範 |

## 紅線測試（不應委派的情況）

| 輸入 Prompt | 預期行為 | 原因 |
|-------------|----------|------|
| "fix the typo" | Main 直接處理 | 簡單任務 |
| "what is this file?" | Main 直接處理 | 資訊查詢 |
| "commit changes" | 使用 Skill 工具 | Slash command |

## 執行方式

### 手動測試

1. 開啟新 Claude Code session
2. 輸入測試 prompt
3. 觀察是否正確委派
4. 記錄到下方結果表

### 自動化記錄

使用 `delegation-logger.sh` Hook（待建立）記錄所有 Task 呼叫：

```bash
# 輸出格式
{
  "timestamp": "2026-01-17T21:00:00",
  "prompt_keywords": ["實作", "功能"],
  "delegated_to": "developer",
  "expected": "developer",
  "match": true
}
```

## 測試結果

### 日期：____

| # | Prompt | 預期 | 實際 | 結果 |
|---|--------|------|------|------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### 總結

- 通過：__
- 失敗：__
- 需要調整的規則：
