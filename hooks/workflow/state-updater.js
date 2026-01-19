#!/usr/bin/env node
/**
 * State Updater Hook (PostToolUse)
 *
 * 工作流 2.0 狀態轉換更新
 *
 * 功能：
 * 1. Task 完成後更新狀態
 * 2. 追蹤 Main Agent 操作統計
 * 3. 自動輸出狀態顯示
 *
 * 觸發時機：PostToolUse
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置路徑
const STATE_FILE = path.join(os.homedir(), '.claude/workflow-state/current.json');

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

// Agent Emoji 對應
const AGENT_EMOJI = {
  'architect': '🏗️',
  'designer': '🎨',
  'migration': '🔀',
  'developer': '💻',
  'skills-agents': '📚',
  'reviewer': '🔍',
  'tester': '🧪',
  'debugger': '🐛'
};

// 程式碼檔案副檔名
const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw', '.go', '.rs', '.java', '.kt',
  '.swift', '.c', '.cpp', '.h', '.rb', '.php',
  '.sh', '.bash', '.sql', '.vue', '.svelte'
];

/**
 * 載入狀態
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return createInitialState();
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (error) {
    return createInitialState();
  }
}

/**
 * 建立初始狀態
 */
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

/**
 * 儲存狀態（原子操作）
 */
function saveState(state) {
  state.timestamps.lastActivity = new Date().toISOString();

  const tempFile = `${STATE_FILE}.${process.pid}.tmp`;
  try {
    // 確保目錄存在
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
    fs.renameSync(tempFile, STATE_FILE);
  } catch (error) {
    // 清理臨時檔案
    try { fs.unlinkSync(tempFile); } catch (e) { /* ignore */ }
    console.error(`⚠️ 無法儲存狀態: ${error.message}`);
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
 * 更新狀態
 */
function updateState(state, newStateName) {
  state.previousState = state.state;
  state.state = newStateName;
  state.timestamps.stateChanged = new Date().toISOString();

  if (state.state !== 'IDLE' && !state.timestamps.workflowStarted) {
    state.timestamps.workflowStarted = new Date().toISOString();
  }
}

/**
 * 分析 Task 結果判斷下一個狀態
 */
function analyzeTaskResult(subagentType, toolOutput) {
  const output = toolOutput?.toLowerCase() || '';

  switch (subagentType) {
    case 'reviewer':
      // APPROVE → 可以進入 TEST
      // REJECT → 回到 DEVELOP
      if (output.includes('approve') || output.includes('通過') || output.includes('✅')) {
        return { nextState: 'TEST', status: 'APPROVE' };
      }
      if (output.includes('reject') || output.includes('拒絕') || output.includes('❌') || output.includes('問題')) {
        return { nextState: 'DEVELOP', status: 'REJECT' };
      }
      return { nextState: null, status: 'PENDING' };

    case 'tester':
      // PASS → 完成當前任務
      // FAIL → 進入 DEBUG 或回到 DEVELOP
      if (output.includes('pass') || output.includes('通過') || output.includes('✅') || output.includes('100%')) {
        return { nextState: 'COMPLETING', status: 'PASS' };
      }
      if (output.includes('fail') || output.includes('失敗') || output.includes('❌')) {
        return { nextState: 'DEBUG', status: 'FAIL' };
      }
      return { nextState: null, status: 'PENDING' };

    case 'debugger':
      // 修復完成 → 回到 DEVELOP
      return { nextState: 'DEVELOP', status: 'FIXED' };

    default:
      return { nextState: null, status: 'UNKNOWN' };
  }
}

/**
 * 輸出狀態顯示
 */
function displayStateChange(oldState, newState, subagentType, status) {
  const emoji = AGENT_EMOJI[subagentType] || '🤖';
  const agentName = subagentType?.toUpperCase() || 'AGENT';

  if (status === 'APPROVE') {
    console.log(`\n## ✅ ${emoji} ${agentName} 審查通過 → 進入 TEST`);
  } else if (status === 'REJECT') {
    console.log(`\n## ❌ ${emoji} ${agentName} 發現問題 → 返回 DEVELOP 修復`);
  } else if (status === 'PASS') {
    console.log(`\n## ✅ ${emoji} ${agentName} 測試通過 → 任務完成`);
  } else if (status === 'FAIL') {
    console.log(`\n## ❌ ${emoji} ${agentName} 測試失敗 → 進入 DEBUG`);
  } else if (oldState !== newState) {
    console.log(`\n## ${emoji} ${agentName}: ${oldState} → ${newState}`);
  }
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
    return;
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
    return;
  }

  const toolName = hookInput.tool_name;
  const toolInput = hookInput.tool_input || {};
  const toolOutput = hookInput.tool_output || '';

  // 載入狀態
  const state = loadState();
  const oldState = state.state;

  // 處理 Task 工具（Sub Agent）
  if (toolName === 'Task') {
    const subagentType = toolInput.subagent_type?.toLowerCase();
    const targetState = AGENT_STATE_MAP[subagentType];

    if (targetState) {
      // 記錄委派
      state.mainAgentOps = state.mainAgentOps || { directEdits: 0, delegated: 0, blocked: 0, bypassed: 0 };
      state.mainAgentOps.delegated++;

      // 分析結果判斷下一個狀態
      const result = analyzeTaskResult(subagentType, toolOutput);

      if (result.nextState) {
        updateState(state, result.nextState);
        displayStateChange(oldState, state.state, subagentType, result.status);
      } else {
        // 沒有明確結果，保持目標狀態
        if (state.state !== targetState) {
          updateState(state, targetState);
          displayStateChange(oldState, state.state, subagentType, null);
        }
      }

      saveState(state);
    }
  }

  // 處理 Edit/Write 工具（Main Agent 直接操作）
  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = toolInput.file_path;

    // 只統計非程式碼檔案（程式碼檔案會被 gate 阻擋）
    if (filePath && !isCodeFile(filePath)) {
      state.mainAgentOps = state.mainAgentOps || { directEdits: 0, delegated: 0, blocked: 0, bypassed: 0 };
      state.mainAgentOps.directEdits++;
      saveState(state);
    }
  }
}

main();
