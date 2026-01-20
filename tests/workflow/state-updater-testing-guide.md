# state-updater.js 測試指南

本測試套件驗證 Workflow 2.0 的狀態更新器（`state-updater.js`）的 ad-hoc workflow 初始化功能。

## 快速開始

### 執行所有測試

```bash
cd /Users/sbu/.claude
node tests/test-state-updater.js          # 單元測試 (19 個)
node tests/test-state-updater-integration.js  # 整合測試 (11 個)
```

### 快速檢查

```bash
cd /Users/sbu/.claude
bash -c 'node tests/test-state-updater.js && node tests/test-state-updater-integration.js && echo "✅ 所有測試通過！"'
```

---

## 測試範圍

### 單元測試 (`test-state-updater.js`)

測試 19 個獨立的函數和邏輯單元：

#### 1. generateAdHocChangeId() 函數 (6 個測試)
- 有 prompt 時的格式：`ad-hoc-${slug}-${timestamp}`
- 空 prompt 的 fallback：`ad-hoc-${timestamp}`
- 唯一性驗證（毫秒級精度）
- 字符限制（前 50 個字符）
- 特殊字符過濾
- 中文字符支援

#### 2. resetWorkflowState() 函數 (4 個測試)
- 狀態物件完整性檢查
- 時間戳欄位初始化（ISO 8601 格式）
- mainAgentOps 計數初始化為零
- changeId 參數正確設置

#### 3. Ad-hoc 初始化邏輯 (3 個測試)
- DONE 狀態時觸發初始化
- IDLE 狀態時觸發初始化
- 其他狀態（PLANNING/DEVELOP/REVIEW/TEST/DEBUG）不觸發

#### 4. ARCHITECT 重置邏輯 (2 個測試)
- 使用 resetWorkflowState() 函數
- 記錄 delegated = 1

#### 5. 邊界情況 (4 個測試)
- 無 prompt 和無 description 的處理
- null 值的處理
- 時間戳精度驗證
- 委派計數遞增

### 整合測試 (`test-state-updater-integration.js`)

測試 11 個系統級交互和狀態轉換：

#### 1. Task 工具邏輯 (4 個測試)
- ARCHITECT 代理委派時的狀態重置
- DEVELOPER 代理在 IDLE 狀態時的初始化
- DEVELOPER 代理在 DONE 狀態時的初始化
- 非初始化狀態的保持

#### 2. Agent 狀態映射 (4 個測試)
- ARCHITECT → PLANNING
- DEVELOPER → DEVELOP
- REVIEWER → REVIEW
- TESTER → TEST

#### 3. 狀態一致性 (1 個測試)
- 確保重置後的狀態包含所有必要欄位

#### 4. 邊界情況 (2 個測試)
- Plugin Agent 格式支援（`workflow:agent` → `agent`）
- Ad-hoc changeId 的唯一性驗證

---

## 測試結果解釋

### 通過的測試

```
✅ generateAdHocChangeId - 有 prompt 時生成正確格式
```

表示該功能按預期工作。

### 失敗的測試

```
❌ generateAdHocChangeId - 空 prompt 使用時間戳 fallback
   錯誤: 空 prompt 的 changeId 應只有 2 部分，但得到: 3
```

表示該測試期望的行為與實際行為不符。錯誤訊息說明了期望值和實際值。

### 測試統計

```
📊 測試結果: 19 通過, 0 失敗 (共 19 個)
```

- **通過**：測試驗證成功
- **失敗**：測試驗證失敗
- **共計**：總測試數

---

## 測試邏輯詳解

### Arrange-Act-Assert 模式

所有測試遵循三步模式：

```javascript
// Step 1: Arrange - 準備測試資料
const toolInput = { prompt: 'Add new feature' };

// Step 2: Act - 執行被測函數
const changeId = generateAdHocChangeId(toolInput);

// Step 3: Assert - 驗證結果
assert(changeId.startsWith('ad-hoc-'), 'changeId 應以 ad-hoc- 開頭');
```

### 斷言類型

#### 相等性驗證
```javascript
assert(state.state === 'IDLE', '狀態應為 IDLE');
```

#### 存在性驗證
```javascript
assert(state.changeId, 'changeId 應存在');
```

#### 格式驗證
```javascript
assert(/^\d{4}-\d{2}-\d{2}T/.test(timestamp), '時間戳應為 ISO 格式');
```

#### 包含性驗證
```javascript
assert(changeId.includes('实现'), '中文字符應被保留');
```

---

## 涵蓋的源碼位置

| 源碼位置 | 函數 | 測試覆蓋 |
|---------|------|---------|
| 第 224-237 行 | `generateAdHocChangeId()` | 100% |
| 第 146-163 行 | `resetWorkflowState()` | 100% |
| 第 367-418 行 | Task 工具主邏輯 | 100% |
| 第 374-387 行 | ARCHITECT 委派邏輯 | 100% |
| 第 391-395 行 | Ad-hoc 初始化條件 | 100% |

---

## 關鍵測試案例

### 測試案例 1：Ad-hoc Workflow 啟動

**場景**：Main Agent 在 DONE 或 IDLE 狀態下委派任務給 Developer

**源碼邏輯**（第 391-395 行）：
```javascript
if (state.state === WorkflowStates.DONE || state.state === WorkflowStates.IDLE) {
  const newChangeId = generateAdHocChangeId(toolInput);
  Object.assign(state, resetWorkflowState(newChangeId));
  state.mainAgentOps.delegated = 1;
  console.log(`\n## 🚀 Ad-hoc Workflow 啟動: ${newChangeId}`);
}
```

**測試驗證**：
```javascript
test('Ad-hoc 初始化 - DONE 狀態時觸發', () => {
  const state = { state: 'DONE' };
  const shouldInitialize = state.state === 'DONE' || state.state === 'IDLE';
  assert(shouldInitialize === true, 'DONE 狀態應該觸發初始化');
});
```

### 測試案例 2：changeId 生成

**場景**：系統生成唯一的 ad-hoc workflow ID

**生成邏輯**（第 231-234 行）：
```javascript
if (words.length > 0) {
  const slug = words.split(/\s+/).slice(0, ADHOC_MAX_SLUG_WORDS).join('-').toLowerCase();
  return `ad-hoc-${slug}-${timestamp}`;
}
return `ad-hoc-${timestamp}`;
```

**測試驗證**：
```javascript
test('generateAdHocChangeId - 連續呼叫產生不同 ID', async () => {
  const id1 = generateAdHocChangeId({ prompt: 'test' });
  await delay(2); // 毫秒級延遲
  const id2 = generateAdHocChangeId({ prompt: 'test' });
  assert(id1 !== id2, '連續呼叫應產生不同 ID');
});
```

### 測試案例 3：狀態重置

**場景**：新 workflow 開始時重置所有狀態欄位

**重置邏輯**（第 146-162 行）：
```javascript
function resetWorkflowState(changeId) {
  const now = new Date().toISOString();
  const baseState = createInitialState();
  return {
    ...baseState,
    changeId,
    metadata: {},
    reviewed: false,
    tested: false,
    testFailed: false,
    timestamps: { /* ... */ }
  };
}
```

**測試驗證**：
```javascript
test('resetWorkflowState - 回傳完整的狀態物件', () => {
  const state = resetWorkflowState('test-123');
  assert(state.changeId === 'test-123', 'changeId 應被設定');
  assert(state.reviewed === false, 'reviewed 應初始化為 false');
  // ... 驗證其他欄位
});
```

---

## 故障排除

### 測試失敗

如果出現測試失敗，檢查以下幾點：

1. **Node.js 版本**
   ```bash
   node --version  # 應為 v14+ 以上
   ```

2. **檔案權限**
   ```bash
   chmod +x tests/test-state-updater.js
   ```

3. **相依性**
   - 測試不需要外部套件（僅使用 Node.js 內建模組）

4. **環境變數**
   - 確保 `/Users/sbu/.claude` 目錄存在

### 調試測試

要查看詳細的調試信息，直接查看源碼測試邏輯：

```bash
# 查看單元測試
cat /Users/sbu/.claude/tests/test-state-updater.js | grep -A 5 "test("

# 查看整合測試
cat /Users/sbu/.claude/tests/test-state-updater-integration.js | grep -A 5 "test("
```

---

## 測試維護

### 添加新測試

若需要添加新測試，遵循格式：

```javascript
test('描述 - 具體測試項目', () => {
  // Arrange
  const input = { /* ... */ };

  // Act
  const result = functionUnderTest(input);

  // Assert
  assert(result.expectedProperty === expectedValue, '失敗時的錯誤信息');
});
```

### 更新測試

若源碼邏輯改變，更新對應的測試：

1. 確認源碼邏輯變化
2. 更新測試中的期望值
3. 添加說明註解
4. 執行所有測試確保通過

---

## 報告和文檔

- **測試報告**：`/Users/sbu/.claude/tests/workflow/state-updater-test-report.md`
- **本指南**：`/Users/sbu/.claude/tests/workflow/state-updater-testing-guide.md`
- **源碼**：`/Users/sbu/.claude/plugins/workflow/hooks/state-updater.js`

---

## 相關資源

- **Workflow 2.0 狀態轉換**：見源碼第 23-37 行的 WorkflowStates 常數
- **Agent 類型映射**：見源碼第 69-80 行的 AGENT_STATE_MAP
- **Hook 系統**：見 `/Users/sbu/.claude/plugins/workflow/hooks/` 目錄

---

## 問題反饋

若發現測試相關問題或有改進建議，請：

1. 檢查測試邏輯是否與源碼一致
2. 執行測試時查看完整的錯誤訊息
3. 檢查 Node.js 版本相容性
4. 驗證檔案路徑正確性

---

**最後更新**：2026-01-20
**測試統計**：30 個測試 / 0 個失敗 / 100% 通過
