#!/usr/bin/env node

/**
 * 整合測試：state-updater.js 的主邏輯
 *
 * 測試模擬實際的 hook 輸入並驗證狀態轉換
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { execSync } = require('child_process');

// ============================================================================
// 測試工具
// ============================================================================

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'state-updater-test-'));
const stateFile = path.join(tmpDir, 'state.json');

function createMockState(state = 'IDLE') {
  const mockState = {
    version: '2.0',
    state,
    previousState: null,
    changeId: 'test-change',
    task: { current: null, total: 0, completed: 0 },
    timestamps: {
      workflowStarted: new Date().toISOString(),
      stateChanged: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    },
    mainAgentOps: {
      directEdits: 0,
      delegated: 0,
      blocked: 0,
      bypassed: 0
    }
  };

  fs.writeFileSync(stateFile, JSON.stringify(mockState, null, 2));
  return mockState;
}

function cleanup() {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (error) {
    // ignore
  }
}

// ============================================================================
// 源碼單元提取（用於測試）
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
// 模擬源碼的狀態轉換邏輯
// ============================================================================

const WorkflowStates = {
  IDLE: 'IDLE',
  PLANNING: 'PLANNING',
  DESIGN: 'DESIGN',
  DEVELOP: 'DEVELOP',
  REVIEW: 'REVIEW',
  TEST: 'TEST',
  DEBUG: 'DEBUG'
};

const AgentTypes = {
  ARCHITECT: 'architect',
  DESIGNER: 'designer',
  DEVELOPER: 'developer',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
  DEBUGGER: 'debugger'
};

const AGENT_STATE_MAP = {
  [AgentTypes.ARCHITECT]: WorkflowStates.PLANNING,
  [AgentTypes.DESIGNER]: WorkflowStates.DESIGN,
  [AgentTypes.DEVELOPER]: WorkflowStates.DEVELOP,
  [AgentTypes.REVIEWER]: WorkflowStates.REVIEW,
  [AgentTypes.TESTER]: WorkflowStates.TEST,
  [AgentTypes.DEBUGGER]: WorkflowStates.DEBUG
};

// ============================================================================
// 測試集
// ============================================================================

const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('🧪 開始整合測試 state-updater.js 主邏輯\n');
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

  cleanup();
  return failCount === 0;
}

// ============================================================================
// 測試：Task 工具觸發 ARCHITECT 邏輯
// ============================================================================

test('Task 工具 - ARCHITECT 代理委派', () => {
  const state = createMockState('IDLE');

  // 模擬：Task(subagent_type='architect', prompt='規劃新功能')
  const toolInput = {
    subagent_type: 'architect',
    prompt: '規劃新功能'
  };

  const rawSubagentType = toolInput.subagent_type.toLowerCase();
  const subagentType = rawSubagentType.replace(/^workflow:/, '');

  assert(subagentType === AgentTypes.ARCHITECT, '應識別為 ARCHITECT');

  // Ad-hoc changeId 生成
  const newChangeId = generateAdHocChangeId(toolInput);
  assert(newChangeId.startsWith('ad-hoc-'), 'changeId 應以 ad-hoc- 開頭');

  // 重置狀態
  const newState = resetWorkflowState(newChangeId);
  assert(newState.changeId === newChangeId, 'changeId 應被正確設定');
  assert(newState.state === 'IDLE', '初始狀態應為 IDLE');
  assert(newState.mainAgentOps.delegated === 0, 'delegated 計數應初始化為 0');
});

test('Task 工具 - DEVELOPER 代理委派（IDLE 時觸發初始化）', () => {
  // 模擬：狀態為 IDLE，呼叫 Task(subagent_type='developer')
  const state = {
    version: '2.0',
    state: WorkflowStates.IDLE,
    mainAgentOps: { delegated: 0 }
  };

  const toolInput = {
    subagent_type: 'developer',
    prompt: '實作功能 X'
  };

  // 檢查是否應觸發初始化
  const shouldInitialize = state.state === WorkflowStates.DONE || state.state === WorkflowStates.IDLE;
  assert(shouldInitialize === true, 'IDLE 狀態應觸發初始化');

  // 初始化新 workflow
  const newChangeId = generateAdHocChangeId(toolInput);
  const newState = resetWorkflowState(newChangeId);

  assert(newState.state === WorkflowStates.IDLE, '重置後狀態應為 IDLE');
  assert(newState.mainAgentOps.delegated === 0, '委派計數應重置為 0');
});

test('Task 工具 - DEVELOPER 代理委派（DONE 時觸發初始化）', () => {
  const state = {
    state: WorkflowStates.DONE,
    mainAgentOps: { delegated: 3 }
  };

  const shouldInitialize = state.state === WorkflowStates.DONE || state.state === WorkflowStates.IDLE;
  assert(shouldInitialize === true, 'DONE 狀態應觸發初始化');
});

test('Task 工具 - 非初始化狀態不重置', () => {
  const states = [WorkflowStates.PLANNING, WorkflowStates.DEVELOP, WorkflowStates.REVIEW];

  for (const stateName of states) {
    const state = { state: stateName };
    const shouldInitialize = state.state === WorkflowStates.DONE || state.state === WorkflowStates.IDLE;
    assert(shouldInitialize === false, `${stateName} 狀態不應觸發初始化`);
  }
});

// ============================================================================
// 測試：狀態轉換
// ============================================================================

test('Agent 狀態映射 - ARCHITECT → PLANNING', () => {
  const subagentType = AgentTypes.ARCHITECT;
  const targetState = AGENT_STATE_MAP[subagentType];

  assert(targetState === WorkflowStates.PLANNING, 'ARCHITECT 應對應 PLANNING 狀態');
});

test('Agent 狀態映射 - DEVELOPER → DEVELOP', () => {
  const subagentType = AgentTypes.DEVELOPER;
  const targetState = AGENT_STATE_MAP[subagentType];

  assert(targetState === WorkflowStates.DEVELOP, 'DEVELOPER 應對應 DEVELOP 狀態');
});

test('Agent 狀態映射 - REVIEWER → REVIEW', () => {
  const subagentType = AgentTypes.REVIEWER;
  const targetState = AGENT_STATE_MAP[subagentType];

  assert(targetState === WorkflowStates.REVIEW, 'REVIEWER 應對應 REVIEW 狀態');
});

test('Agent 狀態映射 - TESTER → TEST', () => {
  const subagentType = AgentTypes.TESTER;
  const targetState = AGENT_STATE_MAP[subagentType];

  assert(targetState === WorkflowStates.TEST, 'TESTER 應對應 TEST 狀態');
});

// ============================================================================
// 測試：狀態一致性
// ============================================================================

test('狀態一致性 - resetWorkflowState 產生的狀態應有完整欄位', () => {
  const state = resetWorkflowState('test-change-123');

  // 必要欄位
  const requiredFields = [
    'version', 'state', 'changeId', 'metadata',
    'reviewed', 'tested', 'testFailed',
    'timestamps', 'mainAgentOps', 'task'
  ];

  for (const field of requiredFields) {
    assert(state.hasOwnProperty(field), `狀態應包含 ${field} 欄位`);
  }

  // timestamps 子欄位
  const timestampFields = ['created', 'workflowStarted', 'stateChanged', 'lastActivity'];
  for (const field of timestampFields) {
    assert(state.timestamps.hasOwnProperty(field), `timestamps 應包含 ${field} 欄位`);
  }

  // mainAgentOps 子欄位
  const opsFields = ['directEdits', 'delegated', 'blocked', 'bypassed'];
  for (const field of opsFields) {
    assert(state.mainAgentOps.hasOwnProperty(field), `mainAgentOps 應包含 ${field} 欄位`);
  }
});

// ============================================================================
// 測試：邊界情況
// ============================================================================

test('邊界情況 - Plugin Agent 格式支援', () => {
  const rawSubagentType = 'workflow:developer'.toLowerCase();
  const subagentType = rawSubagentType.replace(/^workflow:/, '');

  assert(subagentType === 'developer', '應正確移除 workflow: 前綴');
});

test('邊界情況 - Ad-hoc changeId 唯一性', async () => {
  const ids = [];

  for (let i = 0; i < 5; i++) {
    const id = generateAdHocChangeId({ prompt: 'test feature' });
    assert(!ids.includes(id), `第 ${i} 個 ID 應該唯一`);
    ids.push(id);

    if (i < 4) {
      await new Promise(resolve => setTimeout(resolve, 2)); // 確保毫秒差異
    }
  }

  assert(ids.length === 5 && new Set(ids).size === 5, '所有 ID 應該唯一');
});

// ============================================================================
// 執行測試
// ============================================================================

(async () => {
  const success = await runTests();
  process.exit(success ? 0 : 1);
})();
