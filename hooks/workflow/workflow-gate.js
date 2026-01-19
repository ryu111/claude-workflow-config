#!/usr/bin/env node
/**
 * Workflow Gate Hook (PreToolUse)
 *
 * 工作流 2.0 核心阻擋邏輯
 *
 * 功能：
 * 1. 狀態機轉換驗證
 * 2. Main Agent 程式碼編輯限制
 * 3. D→R→T 流程強制
 *
 * 觸發時機：PreToolUse
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置路徑
const STATE_FILE = path.join(os.homedir(), '.claude/workflow-state/current.json');
const CONFIG_FILE = path.join(os.homedir(), '.claude/workflow-config.json');

// 程式碼檔案副檔名（黑名單）
const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.go', '.rs',
  '.java', '.kt', '.kts',
  '.swift', '.m', '.mm',
  '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp',
  '.rb', '.php',
  '.sh', '.bash', '.zsh',
  '.sql',
  '.vue', '.svelte'
];

// 狀態常數
const STATES = {
  IDLE: 'IDLE',
  PLANNING: 'PLANNING',
  DESIGN: 'DESIGN',
  MIGRATION_PLANNING: 'MIGRATION_PLANNING',
  DEVELOP: 'DEVELOP',
  SKILL_CREATE: 'SKILL_CREATE',
  REVIEW: 'REVIEW',
  TEST: 'TEST',
  VALIDATE: 'VALIDATE',
  DEBUG: 'DEBUG',
  COMPLETING: 'COMPLETING',
  LOOP_PAUSED: 'LOOP_PAUSED',
  LOOP_COMPLETING: 'LOOP_COMPLETING',
  PAUSED: 'PAUSED',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE'
};

// Agent 類型常數
const AGENT_TYPES = {
  ARCHITECT: 'architect',
  DESIGNER: 'designer',
  MIGRATION: 'migration',
  DEVELOPER: 'developer',
  SKILLS_AGENTS: 'skills-agents',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
  DEBUGGER: 'debugger'
};

// 允許的狀態轉換
const VALID_TRANSITIONS = {
  [STATES.IDLE]: [STATES.PLANNING, STATES.DEVELOP, STATES.SKILL_CREATE, STATES.DESIGN, STATES.MIGRATION_PLANNING],
  [STATES.PLANNING]: [STATES.DESIGN, STATES.MIGRATION_PLANNING, STATES.DEVELOP, STATES.SKILL_CREATE, STATES.IDLE],
  [STATES.DESIGN]: [STATES.DEVELOP, STATES.IDLE],
  [STATES.MIGRATION_PLANNING]: [STATES.DEVELOP, STATES.IDLE],
  [STATES.DEVELOP]: [STATES.REVIEW],  // 強制必須經過 REVIEW
  [STATES.SKILL_CREATE]: [STATES.VALIDATE],
  [STATES.REVIEW]: [STATES.TEST, STATES.DEVELOP],  // APPROVE → TEST, REJECT → DEVELOP
  [STATES.TEST]: [STATES.COMPLETING, STATES.DEBUG, STATES.DEVELOP],  // PASS → COMPLETING, FAIL → DEBUG/DEVELOP
  [STATES.VALIDATE]: [STATES.COMPLETING, STATES.SKILL_CREATE],
  [STATES.DEBUG]: [STATES.DEVELOP, STATES.BLOCKED],
  [STATES.COMPLETING]: [STATES.DONE, STATES.IDLE],
  [STATES.LOOP_PAUSED]: [STATES.DEVELOP, STATES.REVIEW, STATES.TEST, STATES.DEBUG],  // 可恢復到之前狀態
  [STATES.LOOP_COMPLETING]: [STATES.COMPLETING],
  [STATES.PAUSED]: [STATES.IDLE, STATES.DEVELOP, STATES.REVIEW, STATES.TEST],
  [STATES.BLOCKED]: [STATES.IDLE],  // 只能重新開始
  [STATES.DONE]: [STATES.IDLE]
};

// Agent 類型對應
const AGENT_STATE_MAP = {
  [AGENT_TYPES.ARCHITECT]: STATES.PLANNING,
  [AGENT_TYPES.DESIGNER]: STATES.DESIGN,
  [AGENT_TYPES.MIGRATION]: STATES.MIGRATION_PLANNING,
  [AGENT_TYPES.DEVELOPER]: STATES.DEVELOP,
  [AGENT_TYPES.SKILLS_AGENTS]: STATES.SKILL_CREATE,
  [AGENT_TYPES.REVIEWER]: STATES.REVIEW,
  [AGENT_TYPES.TESTER]: STATES.TEST,
  [AGENT_TYPES.DEBUGGER]: STATES.DEBUG
};

/**
 * 載入狀態
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return { state: STATES.IDLE };
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (error) {
    console.error(`[workflow-gate] 載入狀態失敗: ${error.message}`);
    return { state: STATES.IDLE };
  }
}

/**
 * 載入配置
 */
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { mainAgentLimits: { enabled: false } };
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (error) {
    console.error(`[workflow-gate] 載入配置失敗: ${error.message}`);
    return { mainAgentLimits: { enabled: false } };
  }
}

/**
 * 檢查是否為程式碼檔案
 */
function isCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CODE_EXTENSIONS.includes(ext);
}

/**
 * 檢查 Main Agent 編輯限制
 */
function checkMainAgentLimit(toolName, toolInput, state, config) {
  // 功能未啟用
  if (!config.mainAgentLimits?.enabled) {
    return { allowed: true };
  }

  // 測試模式
  if (config.mainAgentLimits?.testMode) {
    return { allowed: true };
  }

  // 只檢查 Edit 和 Write
  if (toolName !== 'Edit' && toolName !== 'Write') {
    return { allowed: true };
  }

  // 如果在 Sub Agent 內執行（透過 Task），不限制
  // 改用狀態檔案的 activeSubagent 判斷
  if (state.activeSubagent) {
    return { allowed: true };
  }

  const filePath = toolInput.file_path;
  if (!filePath) {
    return { allowed: true };
  }

  // 檢查是否為程式碼檔案
  if (isCodeFile(filePath)) {
    return {
      allowed: false,
      reason: `Main Agent 不能直接編輯程式碼檔案 (${path.extname(filePath)})。請使用 Task(developer) 委派。`
    };
  }

  return { allowed: true };
}

/**
 * 檢查測試失敗狀態
 */
function checkTestFailedBlock(subagentType, state) {
  // 當測試失敗且未經過 debugger 修復時
  if (state.task?.testFailed === true) {
    // 只允許 debugger 執行
    if (subagentType === AGENT_TYPES.DEBUGGER) {
      return { allowed: true };
    }

    // 阻擋開始新任務
    if (subagentType === AGENT_TYPES.ARCHITECT) {
      return {
        allowed: false,
        reason: '❌ 測試失敗尚未修復！不能開始新任務。\n\n' +
                `當前任務 Task ${state.task.current} 測試失敗。\n` +
                '必須先呼叫 Task(debugger) 修復後才能繼續。'
      };
    }

    // 阻擋開發新任務
    if (subagentType === AGENT_TYPES.DEVELOPER) {
      return {
        allowed: false,
        reason: '❌ 測試失敗尚未修復！不能繼續開發。\n\n' +
                `Task ${state.task.current} 測試失敗。\n` +
                '必須先呼叫 Task(debugger) 進行除錯。'
      };
    }
  }

  return { allowed: true };
}

/**
 * 檢查 REVIEWER 通過後必須 TESTER
 */
function checkReviewerApprovedBlock(subagentType, state) {
  // 當 REVIEWER 已通過但還沒測試時
  if (state.task?.reviewed === true && !state.task?.tested) {
    // 只允許 tester 執行
    if (subagentType === AGENT_TYPES.TESTER) {
      return { allowed: true };
    }

    // 阻擋其他 Task
    if ([AGENT_TYPES.DEVELOPER, AGENT_TYPES.ARCHITECT, AGENT_TYPES.DESIGNER].includes(subagentType)) {
      return {
        allowed: false,
        reason: '❌ REVIEWER 已通過，必須先執行 TESTER！\n\n' +
                'D→R→T 流程：REVIEWER APPROVE 後，下一步必須是 Task(tester)。\n' +
                '不能跳過測試直接開始其他工作。'
      };
    }
  }

  return { allowed: true };
}

/**
 * 檢查狀態轉換
 */
function checkStateTransition(toolName, toolInput, state) {
  const currentState = state.state || STATES.IDLE;

  // Task 工具 - 檢查 sub agent 類型
  if (toolName === 'Task') {
    const rawSubagentType = toolInput.subagent_type?.toLowerCase();
    // 移除 "workflow:" 前綴以支援 plugin agent 格式
    const subagentType = rawSubagentType?.replace(/^workflow:/, '');
    const targetState = AGENT_STATE_MAP[subagentType];

    if (!targetState) {
      return { allowed: true };  // 非工作流 agent
    }

    // 🔴 新增：測試失敗阻擋
    const testFailedCheck = checkTestFailedBlock(subagentType, state);
    if (!testFailedCheck.allowed) {
      return testFailedCheck;
    }

    // 🔴 新增：REVIEWER 通過後強制 TESTER
    const reviewerCheck = checkReviewerApprovedBlock(subagentType, state);
    if (!reviewerCheck.allowed) {
      return reviewerCheck;
    }

    // 檢查 D→R→T 強制規則
    // 1. DEVELOP 不能直接跳到 TEST
    if (currentState === STATES.DEVELOP && subagentType === AGENT_TYPES.TESTER) {
      return {
        allowed: false,
        reason: '❌ 違反 D→R→T：開發完成後必須先經過 REVIEW，不能直接跳到 TEST。請先使用 Task(reviewer)。'
      };
    }

    // 2. REVIEW 只能從 DEVELOP 來
    if (targetState === STATES.REVIEW && currentState !== STATES.DEVELOP && currentState !== STATES.IDLE) {
      return {
        allowed: false,
        reason: `❌ 違反 D→R→T：REVIEW 只能從 DEVELOP 狀態啟動（當前：${currentState}）。`
      };
    }

    // 3. TEST 只能從 REVIEW 來
    if (targetState === STATES.TEST && currentState !== STATES.REVIEW && currentState !== STATES.IDLE) {
      return {
        allowed: false,
        reason: `❌ 違反 D→R→T：TEST 只能從 REVIEW 狀態啟動（當前：${currentState}）。`
      };
    }

    // 檢查是否允許啟動該 agent
    const validTargets = VALID_TRANSITIONS[currentState] || [];
    if (targetState && !validTargets.includes(targetState)) {
      return {
        allowed: false,
        reason: `當前狀態 ${currentState} 不允許轉換到 ${targetState}。允許的目標：${validTargets.join(', ')}`
      };
    }
  }

  // Edit/Write 工具 - 檢查當前狀態是否允許
  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = toolInput.file_path;

    // 只檢查程式碼檔案
    if (filePath && isCodeFile(filePath)) {
      // REVIEW 階段不能修改程式碼
      if (currentState === STATES.REVIEW) {
        return {
          allowed: false,
          reason: '❌ REVIEW 階段不能修改程式碼。如需修改，請先完成審查（REJECT 回到 DEVELOP）。'
        };
      }

      // TEST 階段不能修改程式碼
      if (currentState === STATES.TEST) {
        return {
          allowed: false,
          reason: '❌ TEST 階段不能修改程式碼。如需修改，請等測試結果後回到 DEVELOP。'
        };
      }
    }
  }

  // COMPLETING 狀態 - 檢查收尾動作是否完成
  if (currentState === STATES.COMPLETING) {
    // 只阻擋 Task 操作（開始新工作）
    if (toolName === 'Task') {
      // 檢查收尾狀態
      const completionDone = state.completion?.allRequiredDone;

      if (!completionDone) {
        return {
          allowed: false,
          reason: '❌ COMPLETING 階段必須先完成收尾動作！\n\n' +
                  '必須執行：\n' +
                  '1. git add . && git commit -m "..." (提交變更)\n' +
                  '2. mv openspec/changes/[id] openspec/archive/ (歸檔 OpenSpec)\n\n' +
                  '完成後才能開始新任務。'
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * 主函數
 */
function main() {
  // 從 stdin 讀取輸入
  let input = '';

  try {
    input = fs.readFileSync(0, 'utf8');
  } catch (error) {
    // 無輸入時允許通過
    console.log(JSON.stringify({ decision: 'allow' }));
    return;
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
    console.log(JSON.stringify({ decision: 'allow' }));
    return;
  }

  const toolName = hookInput.tool_name;
  const toolInput = hookInput.tool_input || {};

  // 載入狀態和配置
  const state = loadState();
  const config = loadConfig();

  // 檢查 Main Agent 編輯限制
  const mainLimit = checkMainAgentLimit(toolName, toolInput, state, config);
  if (!mainLimit.allowed) {
    // 記錄被阻擋
    try {
      const updatedState = loadState();
      updatedState.mainAgentOps = updatedState.mainAgentOps || { directEdits: 0, delegated: 0, blocked: 0, bypassed: 0 };
      updatedState.mainAgentOps.blocked++;
      fs.writeFileSync(STATE_FILE, JSON.stringify(updatedState, null, 2));
    } catch (e) {
      // 忽略寫入錯誤
    }

    console.log(JSON.stringify({
      decision: 'block',
      reason: mainLimit.reason
    }));
    return;
  }

  // 檢查狀態轉換
  const transition = checkStateTransition(toolName, toolInput, state);
  if (!transition.allowed) {
    console.log(JSON.stringify({
      decision: 'block',
      reason: transition.reason
    }));
    return;
  }

  // 通過所有檢查
  console.log(JSON.stringify({ decision: 'allow' }));
}

main();
