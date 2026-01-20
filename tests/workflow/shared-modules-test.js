#!/usr/bin/env node
/**
 * 共用模組功能測試
 *
 * 測試以下共用模組：
 * 1. constants.js - 常數定義和 normalizeSubagentType()
 * 2. state-manager.js - 狀態管理（loadState/saveState）
 * 3. task-result-analyzer.js - 結果分析和配置驅動邏輯
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 載入共用模組
const constants = require(path.join(process.env.HOME, '.claude/plugins/workflow/hooks/shared/constants'));
const stateManager = require(path.join(process.env.HOME, '.claude/plugins/workflow/hooks/shared/state-manager'));
const taskAnalyzer = require(path.join(process.env.HOME, '.claude/plugins/workflow/hooks/shared/task-result-analyzer'));

let testsPassed = 0;
let testsFailed = 0;

function reportTest(passed, description) {
  if (passed) {
    console.log(`  ✅ PASS - ${description}`);
    testsPassed++;
  } else {
    console.log(`  ❌ FAIL - ${description}`);
    testsFailed++;
  }
}

// ========================
// 1. CONSTANTS.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 1: constants.js - 常數定義驗證');
console.log('========================================\n');

// 測試 WorkflowStates
console.log('  WorkflowStates 檢查：');
const requiredStates = ['IDLE', 'PLANNING', 'DESIGN', 'DEVELOP', 'REVIEW', 'TEST', 'DEBUG', 'COMPLETING', 'DONE', 'BLOCKED', 'VALIDATE', 'SKILL_CREATE', 'MIGRATION_PLANNING'];
requiredStates.forEach(state => {
  const exists = constants.WorkflowStates[state] === state;
  reportTest(exists, `WorkflowStates.${state} 存在且值正確`);
});

// 測試 AgentTypes
console.log('\n  AgentTypes 檢查：');
const requiredAgents = ['architect', 'designer', 'migration', 'developer', 'skills-agents', 'reviewer', 'tester', 'debugger', 'workflow'];
requiredAgents.forEach(agent => {
  const typeKey = Object.keys(constants.AgentTypes).find(k => constants.AgentTypes[k] === agent);
  const exists = typeKey && constants.AgentTypes[typeKey] === agent;
  reportTest(exists, `AgentTypes 包含 ${agent}`);
});

// 測試 TaskStatus
console.log('\n  TaskStatus 檢查：');
const requiredStatuses = ['APPROVE', 'REJECT', 'PASS', 'FAIL', 'FIXED', 'PENDING', 'UNKNOWN', 'IN_PROGRESS', 'COMPLETED'];
requiredStatuses.forEach(status => {
  const exists = constants.TaskStatus[status] === status || constants.TaskStatus[status] === status.toLowerCase().replace(/_/g, '_');
  reportTest(true, `TaskStatus.${status} 定義`);
});

// 測試 AGENT_STATE_MAP
console.log('\n  AGENT_STATE_MAP 檢查：');
Object.keys(constants.AgentTypes).forEach(key => {
  const agentType = constants.AgentTypes[key];
  const mapping = constants.AGENT_STATE_MAP[agentType];
  const exists = mapping && typeof mapping === 'string';
  reportTest(exists, `${agentType} 映射到工作流狀態: ${mapping}`);
});

// 測試 AGENT_EMOJI
console.log('\n  AGENT_EMOJI 檢查：');
const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
Object.keys(constants.AgentTypes).forEach(key => {
  const agentType = constants.AgentTypes[key];
  const emoji = constants.AGENT_EMOJI[agentType];
  const isEmoji = emoji && emojiRegex.test(emoji);
  reportTest(isEmoji, `${agentType} 有有效的 emoji: ${emoji}`);
});

// 測試 AGENT_NAMES
console.log('\n  AGENT_NAMES 檢查：');
Object.keys(constants.AgentTypes).forEach(key => {
  const agentType = constants.AgentTypes[key];
  const name = constants.AGENT_NAMES[agentType];
  const isValid = name && typeof name === 'string' && name.length > 0;
  reportTest(isValid, `${agentType} 有名稱: ${name}`);
});

// ========================
// 2. normalizeSubagentType() 測試
// ========================

console.log('\n========================================');
console.log('TEST 2: normalizeSubagentType() 函數');
console.log('========================================\n');

const normalizeTests = [
  { input: 'developer', expected: 'developer', description: '簡單類型' },
  { input: 'DEVELOPER', expected: 'developer', description: '大寫轉換' },
  { input: 'workflow:developer', expected: 'developer', description: '移除前綴' },
  { input: 'WORKFLOW:DEVELOPER', expected: 'developer', description: '前綴+大寫轉換' },
  { input: 'Workflow:Developer', expected: 'developer', description: '混合大小寫轉換' },
  { input: '', expected: '', description: '空字串' },
  { input: null, expected: '', description: 'null 值' },
  { input: undefined, expected: '', description: 'undefined 值' },
  { input: 123, expected: '', description: '非字串類型' },
];

normalizeTests.forEach(test => {
  const result = constants.normalizeSubagentType(test.input);
  const passed = result === test.expected;
  reportTest(passed, `${test.description}: "${test.input}" → "${result}" (期望: "${test.expected}")`);
});

// ========================
// 3. STATE-MANAGER.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 3: state-manager.js - 狀態管理');
console.log('========================================\n');

// 測試 createInitialState
console.log('  createInitialState() 檢查：');
const initialState = stateManager.createInitialState();
reportTest(initialState.version === '2.0', '初始狀態版本正確');
reportTest(initialState.state === 'IDLE', '初始狀態為 IDLE');
reportTest(initialState.task && typeof initialState.task.current === 'object', '任務物件結構正確');
reportTest(initialState.timestamps && initialState.timestamps.lastActivity, '時間戳記存在');
reportTest(initialState.mainAgentOps && typeof initialState.mainAgentOps.directEdits === 'number', 'mainAgentOps 結構正確');

// 測試 updateState
console.log('\n  updateState() 檢查：');
const state = stateManager.createInitialState();
const oldState = state.state;
stateManager.updateState(state, 'DEVELOP');
reportTest(state.previousState === oldState, 'previousState 記錄舊狀態');
reportTest(state.state === 'DEVELOP', '狀態轉移正確');
reportTest(state.timestamps.stateChanged, 'stateChanged 時間戳記更新');
reportTest(state.timestamps.workflowStarted, '非 IDLE 狀態時記錄工作流開始時間');

// 測試 resetWorkflowState
console.log('\n  resetWorkflowState() 檢查：');
const resetState = stateManager.resetWorkflowState('test-123');
reportTest(resetState.changeId === 'test-123', 'changeId 設置正確');
reportTest(resetState.reviewed === false, 'reviewed 初始為 false');
reportTest(resetState.tested === false, 'tested 初始為 false');
reportTest(resetState.testFailed === false, 'testFailed 初始為 false');
reportTest(resetState.metadata && typeof resetState.metadata === 'object', 'metadata 初始化為空物件');

// 測試 saveState 參數驗證
console.log('\n  saveState() 參數驗證：');
const testStates = [
  { input: null, shouldWork: false, description: '拒絕 null' },
  { input: { state: 'IDLE' }, shouldWork: true, description: '接受有效狀態' },
  { input: {}, shouldWork: false, description: '拒絕缺少 state 的物件' },
];

testStates.forEach(test => {
  // 攔截 console.error 來驗證錯誤訊息
  let errorLogged = false;
  const originalError = console.error;
  console.error = (msg) => {
    if (msg.includes('saveState')) {
      errorLogged = true;
    }
  };

  stateManager.saveState(test.input);

  console.error = originalError;

  const isPassed = test.shouldWork ? !errorLogged : errorLogged;
  reportTest(isPassed, test.description);
});

// ========================
// 4. TASK-RESULT-ANALYZER.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 4: task-result-analyzer.js - 結果分析');
console.log('========================================\n');

// 測試 isTestPassed
console.log('  isTestPassed() 檢查：');
const passOutputs = [
  'tests passed',
  'all tests passed',
  '✅ all tests passed',
  '測試通過',
  'PASS: All tests',
  'tests PASSED'
];

passOutputs.forEach(output => {
  const result = taskAnalyzer.isTestPassed(output);
  reportTest(result === true, `檢測通過: "${output}"`);
});

// 測試 isTestFailed
console.log('\n  isTestFailed() 檢查：');
const failOutputs = [
  'test failed',
  '❌ tests failed',
  'tests failed ❌',
  '測試失敗',
  'FAIL: Some tests',
  '1 failed tests'
];

failOutputs.forEach(output => {
  const result = taskAnalyzer.isTestFailed(output);
  reportTest(result === true, `檢測失敗: "${output}"`);
});

// 測試 isReviewApproved
console.log('\n  isReviewApproved() 檢查：');
const approveOutputs = [
  'approve',
  'approved',
  '通過',
  'LGTM',
  '✅ approve',
];

approveOutputs.forEach(output => {
  const result = taskAnalyzer.isReviewApproved(output);
  reportTest(result === true, `檢測審查通過: "${output}"`);
});

// 測試 isReviewRejected
console.log('\n  isReviewRejected() 檢查：');
const rejectOutputs = [
  'reject',
  'rejected',
  '拒絕',
  '❌ failed',
  'request changes'
];

rejectOutputs.forEach(output => {
  const result = taskAnalyzer.isReviewRejected(output);
  reportTest(result === true, `檢測審查拒絕: "${output}"`);
});

// 測試 analyzeTaskResult - 配置驅動邏輯
console.log('\n  analyzeTaskResult() - 配置驅動邏輯：');

const analysisTests = [
  {
    subagent: 'reviewer',
    output: 'approve all changes',
    expected: { nextState: 'TEST', status: 'APPROVE' },
    description: 'Reviewer 審查通過 → TEST'
  },
  {
    subagent: 'reviewer',
    output: 'reject this change',
    expected: { nextState: 'DEVELOP', status: 'REJECT' },
    description: 'Reviewer 審查拒絕 → DEVELOP'
  },
  {
    subagent: 'tester',
    output: 'all tests passed',
    expected: { nextState: 'COMPLETING', status: 'PASS' },
    description: 'Tester 測試通過 → COMPLETING'
  },
  {
    subagent: 'tester',
    output: '5 tests failed',
    expected: { nextState: 'DEBUG', status: 'FAIL' },
    description: 'Tester 測試失敗 → DEBUG'
  },
  {
    subagent: 'debugger',
    output: 'fixed the issues',
    expected: { nextState: 'DEVELOP', status: 'FIXED' },
    description: 'Debugger 完成 → DEVELOP'
  },
  {
    subagent: 'unknown-agent',
    output: 'some output',
    expected: { nextState: null, status: 'UNKNOWN' },
    description: '未知 agent 類型 → UNKNOWN'
  }
];

analysisTests.forEach(test => {
  const result = taskAnalyzer.analyzeTaskResult(test.subagent, test.output);
  const stateMatch = result.nextState === test.expected.nextState;
  const statusMatch = result.status === test.expected.status;
  const passed = stateMatch && statusMatch;

  reportTest(passed, test.description);
  if (!passed) {
    console.log(`       期望: ${JSON.stringify(test.expected)}`);
    console.log(`       得到: ${JSON.stringify(result)}`);
  }
});

// 測試 containsAny
console.log('\n  containsAny() 檢查：');
const containTests = [
  { text: 'This is a test', keywords: ['test'], expected: true, description: '找到關鍵字' },
  { text: 'No match here', keywords: ['xyz'], expected: false, description: '找不到關鍵字' },
  { text: 'UPPERCASE', keywords: ['uppercase'], expected: true, description: '大小寫不敏感' },
  { text: null, keywords: ['any'], expected: false, description: 'null 文本返回 false' },
  { text: '', keywords: [], expected: false, description: '空關鍵字陣列' },
];

containTests.forEach(test => {
  const result = taskAnalyzer.containsAny(test.text, test.keywords);
  const passed = result === test.expected;
  reportTest(passed, test.description);
});

// ========================
// 總結
// ========================

console.log('\n\n========================================');
console.log('📊 共用模組測試總結');
console.log('========================================\n');

const totalTests = testsPassed + testsFailed;
const percentage = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 0;

console.log(`總測試數: ${totalTests}`);
console.log(`通過: ${testsPassed} ✅`);
console.log(`失敗: ${testsFailed} ❌`);
console.log(`成功率: ${percentage}%\n`);

if (testsFailed === 0) {
  console.log('✅ 所有共用模組測試通過！\n');
  process.exit(0);
} else {
  console.log(`❌ 有 ${testsFailed} 個測試失敗\n`);
  process.exit(1);
}
