# Workflow Violation Tracker 更新日誌

## 2026-01-18 - 實現「當下執行 D→R→T」機制

### 核心改進

從「事後提醒」改為「當下執行」：

```
❌ 事後：Developer 完成 → ... → 用戶提醒 → 才呼叫 Reviewer
✅ 當下：Developer 完成 → 立即提醒 → Main 呼叫 Reviewer
```

### 新增功能

#### 1. Task(developer) 追蹤

```javascript
handleDeveloper(params, state) {
    // 記錄到 pendingDeveloperTasks
    // 輸出強烈提醒：「立即呼叫 Task(reviewer)」
}
```

**輸出格式**：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 D→R→T 下一步：立即呼叫 Task(reviewer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 2. Task(reviewer) 追蹤

```javascript
handleReviewer(params, state) {
    // 清除 pendingDeveloperTasks
    // 記錄到 pendingReviewerTasks
    // 輸出強烈提醒：「立即呼叫 Task(tester)」
}
```

**輸出格式**：
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 D→R→T 下一步：立即呼叫 Task(tester)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 3. Task(tester) 追蹤

```javascript
handleTester(params, state) {
    // 清除 pendingReviewerTasks
    // 記錄完整的 D→R→T 循環完成
}
```

### RAM/線程安全改進

#### 1. 狀態大小限制

```javascript
const CONFIG = {
    MAX_PENDING_EDITS: 10,
    MAX_PENDING_TASKS: 5,
    STALE_TIMEOUT_MS: 60 * 60 * 1000 // 1 小時
};
```

#### 2. 自動清理機制

```javascript
function cleanStaleItems(items, maxCount) {
    // 移除超過 1 小時的項目
    // 限制數量到 maxCount
}
```

在 `loadState()` 時自動執行：
- `pendingEdits` 保留最新 10 筆
- `pendingDeveloperTasks` 保留最新 5 筆
- `pendingReviewerTasks` 保留最新 5 筆

#### 3. 原子操作

保留原有的 tempFile + rename 機制：

```javascript
function saveState(state) {
    const tempFile = `${STATE_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
    fs.renameSync(tempFile, STATE_FILE); // 原子操作
}
```

### 狀態結構變更

#### 舊結構
```json
{
  "pendingEdits": [...],
  "pendingReviews": [...],
  "violations": [...]
}
```

#### 新結構
```json
{
  "pendingEdits": [...],
  "pendingDeveloperTasks": [...],
  "pendingReviewerTasks": [...],
  "violations": [...]
}
```

### 常數提取

所有 magic number 提取到 `CONFIG` 物件：

```javascript
const CONFIG = {
    WARNING_THRESHOLD_EDITS: 1,
    MAX_PENDING_EDITS: 10,
    MAX_PENDING_TASKS: 5,
    STALE_TIMEOUT_MS: 60 * 60 * 1000,
    MAX_INPUT_SIZE: 1024 * 1024
};
```

### 測試驗證

#### 測試 1：D→R→T 提醒功能

檔案：`test-workflow-tracker.js`

```bash
$ node test-workflow-tracker.js
✅ 正確提醒呼叫 Task(reviewer)
✅ 正確提醒呼叫 Task(tester)
✅ 正確完成循環，無提醒
```

#### 測試 2：自動清理機制

檔案：`test-cleanup.js`

```bash
$ node test-cleanup.js
✅ pendingEdits 數量限制正確（≤ 10）
✅ pendingDeveloperTasks 數量限制正確（≤ 5）
✅ 過期項目已移除（> 1 小時）
```

### 向後相容性

- 舊的 `pendingReviews` 欄位不再使用，但不會導致錯誤
- `loadState()` 會自動初始化缺少的欄位
- 所有舊的違規記錄保持不變

### 使用範例

**典型工作流**：

```
1. Main: Task(developer, "實作登入功能")
   → Hook 輸出：🔄 D→R→T 下一步：立即呼叫 Task(reviewer)

2. Main: Task(reviewer, "審查登入功能")
   → Hook 輸出：🔄 D→R→T 下一步：立即呼叫 Task(tester)

3. Main: Task(tester, "測試登入功能")
   → Hook: 記錄完整循環，無輸出
```

### 效果對比

#### 之前
```
Developer 完成
  ↓
（沒有提醒）
  ↓
用戶等了 5 輪對話
  ↓
用戶提醒：「請呼叫 reviewer」
  ↓
Main 才呼叫 Task(reviewer)
```

#### 之後
```
Developer 完成
  ↓
Hook 立即輸出：「立即呼叫 Task(reviewer)」
  ↓
Main 看到提醒，立即執行
  ↓
工作流順暢進行
```

### 檔案清單

| 檔案 | 用途 |
|------|------|
| `workflow-violation-tracker.js` | 主程式（已修改） |
| `test-workflow-tracker.js` | D→R→T 提醒測試 |
| `test-cleanup.js` | 自動清理測試 |
| `WORKFLOW_TRACKER_CHANGELOG.md` | 本文件 |

### 未來改進方向

1. **統計功能**：記錄完整的 D→R→T 循環次數
2. **視覺化**：產生工作流圖表
3. **警報升級**：多次忽略提醒時增強警告
4. **整合到 CI**：自動檢查 PR 是否遵守 D→R→T

### 相關文件

- Core Skill: `~/.claude/skills/core/references/drt-rules.md`
- Main Skill: `~/.claude/skills/main/references/delegation.md`
- Hook 配置: `~/.claude/hooks/hooks.json`
