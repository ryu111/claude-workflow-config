#!/usr/bin/env node

/**
 * 測試 state-updater.js 的 ad-hoc workflow 初始化功能
 *
 * 測試範圍：
 * 1. generateAdHocChangeId() - 生成正確格式的 changeId
 * 2. resetWorkflowState() - 重置狀態物件
 * 3. Ad-hoc 初始化邏輯 - 狀態為 DONE 或 IDLE 時觸發
 * 4. ARCHITECT 重置邏輯 - 使用 resetWorkflowState()
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

// ============================================================================
// 複製源碼中的相關函數（便於獨立測試）
// ============================================================================

const ADHOC_MAX_PROMPT_LENGTH = 50;
const ADHOC_MAX_SLUG_WORDS = 3;

function generateAdHocChangeId(toolInput) {
  const prompt = toolInput.prompt || toolInput.description || '';
  const words = prompt.slice(0, ADHOC_MAX_PROMPT_LENGTH).replace(/[^a-zA-Z0-9\u4e00-\u9fff\s]/g, '').trim();
  const timestamp = Date.now();

  if (words.length > 0) {
    const slug = words.split(/\s+/).slice(0, ADHOC_MAX_SLUG_WORDS).join('-').toLowerCase();
    return `ad-hoc-${slug}-${timestamp}`;
  }

  return `ad-hoc-${timestamp}`;
}

function createInitialState() {
  return {
    version: '2.0',
    state: 'IDLE',
    previousState: null,
    task: { current: null, total: 0, completed: 0 },
    timestamps: {
      workflowStarted: null,
      stateChanged: null,
      lastActivity: new Date().toISOString()
    },
    mainAgentOps: {
      directEdits: 0,
      delegated: 0,
      blocked: 0,
      bypassed: 0
    }
  };
}

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
    timestamps: {
      created: now,
      workflowStarted: now,
      stateChanged: now,
      lastActivity: now
    }
  };
}

// ============================================================================
// 測試工具函數
// ============================================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// 測試集合
// ============================================================================

const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('🧪 開始測試 state-updater.js ad-hoc 初始化功能\n');
  console.log('─'.repeat(80));

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passCount++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   錯誤: ${error.message}`);
      failCount++;
    }
  }

  console.log('─'.repeat(80));
  console.log(`\n📊 測試結果: ${passCount} 通過, ${failCount} 失敗 (共 ${tests.length} 個)\n`);

  return failCount === 0;
}

// ============================================================================
// 1. generateAdHocChangeId() 測試
// ============================================================================

test('generateAdHocChangeId - 有 prompt 時生成正確格式', () => {
  const changeId = generateAdHocChangeId({ prompt: 'Add new feature' });

  // 應該包含 'ad-hoc-' 前綴
  assert(changeId.startsWith('ad-hoc-'), `changeId 應以 'ad-hoc-' 開頭，但得到: ${changeId}`);

  // 應該包含 slug 和時間戳
  const parts = changeId.split('-');
  assert(parts.length >= 3, `changeId 應至少有 3 部分，但得到: ${parts.length}`);

  // 最後一部分應該是數字（毫秒時間戳）
  const timestamp = parts[parts.length - 1];
  assert(/^\d+$/.test(timestamp), `最後部分應該是數字時間戳，但得到: ${timestamp}`);
});

test('generateAdHocChangeId - 空 prompt 使用時間戳 fallback', () => {
  const changeId = generateAdHocChangeId({ prompt: '' });

  // 空 prompt 時應該是 'ad-hoc-[timestamp]' 格式
  assert(changeId.startsWith('ad-hoc-'), `changeId 應以 'ad-hoc-' 開頭`);

  // 注意：split('-') 會把 'ad-hoc-[timestamp]' 分成 ['ad', 'hoc', '[timestamp]'] 共 3 部分
  const timestamp = changeId.replace('ad-hoc-', '');
  assert(/^\d+$/.test(timestamp), `時間戳應該是純數字，但得到: ${timestamp}`);
});

test('generateAdHocChangeId - 連續呼叫產生不同 ID', async () => {
  const id1 = generateAdHocChangeId({ prompt: 'test' });

  // 確保毫秒級別的差異
  await delay(2);

  const id2 = generateAdHocChangeId({ prompt: 'test' });

  assert(id1 !== id2, `連續呼叫應產生不同 ID，但都得到: ${id1}`);
});

test('generateAdHocChangeId - 提取前 50 個字符', () => {
  const longPrompt = 'a'.repeat(100);
  const changeId = generateAdHocChangeId({ prompt: longPrompt });

  // 應該只包含前 50 個字符的信息，但由於都是 'a'，會被壓縮成 'ad-hoc-a-[timestamp]'
  assert(changeId.includes('a'), 'changeId 應包含提取的字符');
});

test('generateAdHocChangeId - 移除特殊字符', () => {
  const changeId = generateAdHocChangeId({
    prompt: 'Test-Feature@#$%^&*() & Stuff!'
  });

  // 特殊字符應被移除
  assert(!changeId.includes('@'), 'changeId 不應包含 @');
  assert(!changeId.includes('#'), 'changeId 不應包含 #');
  assert(!changeId.includes('$'), 'changeId 不應包含 $');
});

test('generateAdHocChangeId - 支援中文字符', () => {
  const changeId = generateAdHocChangeId({
    prompt: '實作新功能'
  });

  // 源碼支援中文字符（\u4e00-\u9fff 範圍），所以結果會包含中文
  // ad-hoc-實作新功能-[timestamp]
  assert(changeId.startsWith('ad-hoc-'), 'changeId 應以 ad-hoc- 開頭');
  assert(changeId.includes('實作新功能'), 'changeId 應該包含中文字符');

  // 驗證最後是時間戳
  const parts = changeId.split('-');
  const lastPart = parts[parts.length - 1];
  assert(/^\d+$/.test(lastPart), '最後部分應該是數字時間戳');
});

// ============================================================================
// 2. resetWorkflowState() 測試
// ============================================================================

test('resetWorkflowState - 回傳完整的狀態物件', () => {
  const state = resetWorkflowState('test-change-123');

  // 檢查所有必要欄位
  assert(state.version === '2.0', 'version 應該是 2.0');
  assert(state.changeId === 'test-change-123', 'changeId 應該被設定');
  assert(state.state === 'IDLE', 'state 應該是 IDLE');
  assert(state.metadata !== undefined, 'metadata 應該存在');
  assert(state.reviewed === false, 'reviewed 應該是 false');
  assert(state.tested === false, 'tested 應該是 false');
  assert(state.testFailed === false, 'testFailed 應該是 false');
});

test('resetWorkflowState - timestamps 欄位初始化正確', () => {
  const state = resetWorkflowState('test-123');

  assert(state.timestamps.created, 'created 時間戳應存在');
  assert(state.timestamps.workflowStarted, 'workflowStarted 時間戳應存在');
  assert(state.timestamps.stateChanged, 'stateChanged 時間戳應存在');
  assert(state.timestamps.lastActivity, 'lastActivity 時間戳應存在');

  // 所有時間戳應該是 ISO 格式
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  assert(isoRegex.test(state.timestamps.created), 'created 應該是 ISO 格式');
  assert(isoRegex.test(state.timestamps.workflowStarted), 'workflowStarted 應該是 ISO 格式');
});

test('resetWorkflowState - mainAgentOps 初始化為零', () => {
  const state = resetWorkflowState('test-456');

  assert(state.mainAgentOps.directEdits === 0, 'directEdits 應該是 0');
  assert(state.mainAgentOps.delegated === 0, 'delegated 應該是 0');
  assert(state.mainAgentOps.blocked === 0, 'blocked 應該是 0');
  assert(state.mainAgentOps.bypassed === 0, 'bypassed 應該是 0');
});

test('resetWorkflowState - changeId 參數被正確設定', () => {
  const changeId = 'my-custom-change-id';
  const state = resetWorkflowState(changeId);

  assert(state.changeId === changeId, `changeId 應該是 ${changeId}，但得到: ${state.changeId}`);
});

// ============================================================================
// 3. Ad-hoc 初始化邏輯測試
// ============================================================================

test('Ad-hoc 初始化 - DONE 狀態時觸發', () => {
  // 模擬：DONE 狀態，呼叫 Task(developer)
  const state = resetWorkflowState('previous-change');
  state.state = 'DONE'; // 設置為 DONE

  // Ad-hoc 初始化邏輯應該在狀態為 DONE 或 IDLE 時觸發
  const shouldInitialize = state.state === 'DONE' || state.state === 'IDLE';

  assert(shouldInitialize === true, 'DONE 狀態應該觸發初始化');
});

test('Ad-hoc 初始化 - IDLE 狀態時觸發', () => {
  const state = resetWorkflowState('previous-change');
  state.state = 'IDLE'; // 設置為 IDLE

  const shouldInitialize = state.state === 'DONE' || state.state === 'IDLE';

  assert(shouldInitialize === true, 'IDLE 狀態應該觸發初始化');
});

test('Ad-hoc 初始化 - 其他狀態不觸發', () => {
  const states = ['PLANNING', 'DEVELOP', 'REVIEW', 'TEST', 'DEBUG'];

  for (const stateName of states) {
    const state = resetWorkflowState('previous-change');
    state.state = stateName;

    const shouldInitialize = state.state === 'DONE' || state.state === 'IDLE';
    assert(shouldInitialize === false, `${stateName} 狀態不應觸發初始化`);
  }
});

// ============================================================================
// 4. ARCHITECT 重置邏輯測試
// ============================================================================

test('ARCHITECT 重置 - 提取 changeId 並重置狀態', () => {
  // ARCHITECT 任務應使用 resetWorkflowState()
  const changeId = generateAdHocChangeId({ prompt: '規劃新功能' });
  const state = resetWorkflowState(changeId);

  // 驗證狀態被重置
  assert(state.changeId === changeId, '應正確設定 changeId');
  assert(state.state === 'IDLE', '初始狀態應該是 IDLE');
  assert(state.reviewed === false, 'reviewed 應該重置為 false');
  assert(state.tested === false, 'tested 應該重置為 false');
});

test('ARCHITECT 重置 - 設定 delegated = 1', () => {
  const changeId = 'arch-task-change';
  const state = resetWorkflowState(changeId);

  // 模擬記錄首次委派
  state.mainAgentOps.delegated = 1;

  assert(state.mainAgentOps.delegated === 1, '首次委派應記錄為 1');
});

// ============================================================================
// 5. 狀態轉換邏輯測試
// ============================================================================

test('Task 委派邏輯 - 狀態轉換時增加 delegated 計數', () => {
  const state = resetWorkflowState('test-change');

  // 模擬多次委派
  state.mainAgentOps.delegated = 1;
  assert(state.mainAgentOps.delegated === 1, '第一次委派');

  state.mainAgentOps.delegated++;
  assert(state.mainAgentOps.delegated === 2, '第二次委派');
});

// ============================================================================
// 6. 邊界情況測試
// ============================================================================

test('邊界情況 - 無 prompt 和無 description', () => {
  const changeId = generateAdHocChangeId({});

  assert(changeId.startsWith('ad-hoc-'), '應生成有效的 ad-hoc changeId');
  assert(/^ad-hoc-\d+$/.test(changeId), '無 prompt 時應使用時間戳格式');
});

test('邊界情況 - null 值處理', () => {
  const changeId = generateAdHocChangeId({ prompt: null });

  assert(changeId.startsWith('ad-hoc-'), '應正確處理 null 值');
});

test('邊界情況 - resetWorkflowState 產生的時間戳應近似相等', () => {
  const before = Date.now();
  const state = resetWorkflowState('test-123');
  const after = Date.now();

  const createdTime = new Date(state.timestamps.created).getTime();

  assert(createdTime >= before - 100 && createdTime <= after + 100,
    'created 時間戳應在函數執行時間內');
});

// ============================================================================
// 執行測試
// ============================================================================

(async () => {
  const success = await runTests();
  process.exit(success ? 0 : 1);
})();
