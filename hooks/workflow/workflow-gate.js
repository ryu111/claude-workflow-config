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

// 允許的狀態轉換
const VALID_TRANSITIONS = {
  'IDLE': ['PLANNING', 'DEVELOP', 'SKILL_CREATE'],
  'PLANNING': ['DESIGN', 'MIGRATION_PLANNING', 'DEVELOP', 'SKILL_CREATE', 'IDLE'],
  'DESIGN': ['DEVELOP', 'IDLE'],
  'MIGRATION_PLANNING': ['DEVELOP', 'IDLE'],
  'DEVELOP': ['REVIEW'],  // 強制必須經過 REVIEW
  'SKILL_CREATE': ['VALIDATE'],
  'REVIEW': ['TEST', 'DEVELOP'],  // APPROVE → TEST, REJECT → DEVELOP
  'TEST': ['COMPLETING', 'DEBUG', 'DEVELOP'],  // PASS → COMPLETING, FAIL → DEBUG/DEVELOP
  'VALIDATE': ['COMPLETING', 'SKILL_CREATE'],
  'DEBUG': ['DEVELOP', 'BLOCKED'],
  'COMPLETING': ['DONE', 'IDLE'],
  'LOOP_PAUSED': ['DEVELOP', 'REVIEW', 'TEST', 'DEBUG'],  // 可恢復到之前狀態
  'LOOP_COMPLETING': ['COMPLETING'],
  'PAUSED': ['IDLE', 'DEVELOP', 'REVIEW', 'TEST'],
  'BLOCKED': ['IDLE'],  // 只能重新開始
  'DONE': ['IDLE']
};

// Agent 類型對應
const AGENT_STATE_MAP = {
  'architect': 'PLANNING',
  'designer': 'DESIGN',
  'migration': 'MIGRATION_PLANNING',
  'developer': 'DEVELOP',
  'skills-agents': 'SKILL_CREATE',
  'reviewer': 'REVIEW',
  'tester': 'TEST',
  'debugger': 'DEBUG'
};

/**
 * 載入狀態
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return { state: 'IDLE' };
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (error) {
    return { state: 'IDLE' };
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
function checkMainAgentLimit(toolName, toolInput, _state, config) {
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
  // 這需要從環境變數或其他機制判斷
  if (process.env.CLAUDE_IN_SUBAGENT === 'true') {
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
 * 檢查狀態轉換
 */
function checkStateTransition(toolName, toolInput, state) {
  const currentState = state.state || 'IDLE';

  // Task 工具 - 檢查 sub agent 類型
  if (toolName === 'Task') {
    const subagentType = toolInput.subagent_type?.toLowerCase();
    const targetState = AGENT_STATE_MAP[subagentType];

    if (!targetState) {
      return { allowed: true };  // 非工作流 agent
    }

    // 檢查 D→R→T 強制規則
    if (currentState === 'DEVELOP' && subagentType === 'tester') {
      return {
        allowed: false,
        reason: '❌ 違反 D→R→T：開發完成後必須先經過 REVIEW，不能直接跳到 TEST。請先使用 Task(reviewer)。'
      };
    }

    // 檢查是否允許啟動該 agent
    const validTargets = VALID_TRANSITIONS[currentState] || [];
    if (targetState && !validTargets.includes(targetState) && currentState !== 'IDLE') {
      // IDLE 狀態允許較寬鬆的轉換
      if (currentState !== 'IDLE') {
        return {
          allowed: false,
          reason: `當前狀態 ${currentState} 不允許轉換到 ${targetState}。允許的目標：${validTargets.join(', ')}`
        };
      }
    }
  }

  // Edit/Write 工具 - 檢查當前狀態是否允許
  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = toolInput.file_path;

    // 只檢查程式碼檔案
    if (filePath && isCodeFile(filePath)) {
      // REVIEW 階段不能修改程式碼
      if (currentState === 'REVIEW') {
        return {
          allowed: false,
          reason: '❌ REVIEW 階段不能修改程式碼。如需修改，請先完成審查（REJECT 回到 DEVELOP）。'
        };
      }

      // TEST 階段不能修改程式碼
      if (currentState === 'TEST') {
        return {
          allowed: false,
          reason: '❌ TEST 階段不能修改程式碼。如需修改，請等測試結果後回到 DEVELOP。'
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
