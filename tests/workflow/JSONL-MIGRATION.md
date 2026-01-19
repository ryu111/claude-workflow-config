# Workflow Tracker JSONL 遷移說明

## 背景

原本的 `workflow-violation-tracker.js` 使用 `workflow-state.json` 儲存狀態，存在以下問題：

1. **Race Condition**：多個 hooks 同時讀寫 state file 會資料覆蓋
2. **記憶體洩漏**：violations 陣列無限增長
3. **邏輯錯誤**：shift() 使用 FIFO 假設不正確

## 解決方案：Append-only JSONL

### 核心概念

```
❌ 原本：讀取整個 state → 修改 → 覆蓋寫入（有 race condition）
✅ 現在：只追加事件到 JSONL（無 race condition）
```

### 檔案結構

```
~/.claude/tests/workflow/results/
├── workflow-events.jsonl      # 事件追加日誌（新）
└── workflow-violations.jsonl  # 違規記錄（保留）
```

### 事件類型

```javascript
const EventType = {
    EDIT: 'edit',                          // Edit/Write 工具使用
    DEVELOPER_COMPLETE: 'developer_complete', // Task(developer) 完成
    REVIEWER_COMPLETE: 'reviewer_complete',   // Task(reviewer) 完成
    TESTER_COMPLETE: 'tester_complete'        // Task(tester) 完成
};
```

### 事件範例

```jsonl
{"type":"edit","tool":"Edit","file":"/src/file.py","executor":"main","timestamp":1768748830008,"iso_time":"2026-01-18T15:07:10.008Z"}
{"type":"developer_complete","description":"Implement feature","timestamp":1768748831000,"iso_time":"2026-01-18T15:07:11.000Z"}
{"type":"reviewer_complete","description":"Review code","timestamp":1768748832000,"iso_time":"2026-01-18T15:07:12.000Z"}
{"type":"tester_complete","description":"Test feature","timestamp":1768748833000,"iso_time":"2026-01-18T15:07:13.000Z"}
```

## 狀態計算

**不再儲存狀態變數，改為從事件日誌計算：**

```javascript
function computeCurrentState(events) {
    let pendingEdits = 0;
    let pendingDevelopers = 0;
    let pendingReviewers = 0;

    for (const event of events) {
        switch (event.type) {
            case 'edit':
                pendingEdits++;
                break;
            case 'developer_complete':
                pendingDevelopers++;
                break;
            case 'reviewer_complete':
                pendingDevelopers--;
                pendingReviewers++;
                pendingEdits = 0; // 審查通過，清除
                break;
            case 'tester_complete':
                pendingReviewers--;
                pendingEdits = 0; // D→R→T 完成
                break;
        }
    }

    return { pendingEdits, pendingDevelopers, pendingReviewers };
}
```

## 過期事件過濾

**只處理最近 1 小時內的事件：**

```javascript
function readRecentEvents() {
    const now = Date.now();
    const events = [];

    for (const line of allLines) {
        const event = JSON.parse(line);
        if (now - event.timestamp < CONFIG.STALE_TIMEOUT_MS) {
            events.push(event);
        }
    }

    return events;
}
```

## 日誌截斷

**自動截斷超過 1MB 的日誌：**

```javascript
function truncateIfNeeded(filePath) {
    const stats = fs.statSync(filePath);
    if (stats.size > CONFIG.MAX_LOG_SIZE) {
        // 保留最後 500 行
        const lines = fs.readFileSync(filePath, 'utf8').split('\n');
        const kept = lines.slice(-500).join('\n');
        fs.writeFileSync(filePath, kept);
    }
}
```

## 並行安全證明

### 測試 4: 並行安全

```javascript
// 同時執行 5 個 Edit hook
const promises = [];
for (let i = 0; i < 5; i++) {
    promises.push(runHook({
        tool_name: 'Edit',
        parameters: { file_path: `/test/file${i}.py` }
    }));
}

await Promise.all(promises);

const events = readJSONL(EVENTS_FILE);
// 結果: 5 個事件，無遺失，無覆蓋
```

**測試結果：✅ 並行安全: 5 個 hook 同時執行，記錄了 5 個事件**

## 優勢總結

| 問題 | 原方案 | 新方案 |
|------|--------|--------|
| Race Condition | 有（讀-改-寫） | 無（append-only） |
| 記憶體洩漏 | violations 陣列無限增長 | 不儲存在記憶體中 |
| 檔案大小 | 無限增長 | 自動截斷（1MB 限制） |
| 過期資料 | 手動清理 | 計算時自動過濾 |
| 邏輯正確性 | shift() 假設錯誤 | 事件驅動，清晰明確 |

## 向後相容

- `workflow-state.json` 已被移除
- `workflow-violations.jsonl` 保留，格式不變
- Hook 輸出（提醒訊息）完全不變

## 測試結果

```
✅ 測試 1: Edit 事件記錄
✅ 測試 2: D→R→T 工作流
✅ 測試 3: 違規檢測
✅ 測試 4: 並行安全

✅ 所有測試通過！
```

## 配置常數

```javascript
const CONFIG = {
    WARNING_THRESHOLD_EDITS: 1,      // 有 1 個未審查編輯就警告
    STALE_TIMEOUT_MS: 60 * 60 * 1000, // 1 小時
    MAX_LOG_SIZE: 1024 * 1024,        // 1MB
    MAX_EVENTS_TO_KEEP: 500           // 截斷時保留最後 500 行
};
```

## 使用方式

**完全透明，無需改變任何使用方式。**

Hook 會在 PostToolUse (Edit, Write, Task) 自動執行，產生事件日誌和違規記錄。
