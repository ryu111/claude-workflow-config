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

// 狀態常數
const WorkflowStates = {
  IDLE: 'IDLE',
  PLANNING: 'PLANNING',
  DESIGN: 'DESIGN',
  DEVELOP: 'DEVELOP',
  REVIEW: 'REVIEW',
  TEST: 'TEST',
  DEBUG: 'DEBUG',
  COMPLETING: 'COMPLETING',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED',
  VALIDATE: 'VALIDATE',
  SKILL_CREATE: 'SKILL_CREATE',
  MIGRATION_PLANNING: 'MIGRATION_PLANNING'
};

// Agent 類型常數
const AgentTypes = {
  ARCHITECT: 'architect',
  DESIGNER: 'designer',
  MIGRATION: 'migration',
  DEVELOPER: 'developer',
  SKILLS: 'skills-agents',
  REVIEWER: 'reviewer',
  TESTER: 'tester',
  DEBUGGER: 'debugger',
  WORKFLOW: 'workflow'
};

// 任務狀態常數
const TaskStatus = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  PASS: 'PASS',
  FAIL: 'FAIL',
  FIXED: 'FIXED',
  PENDING: 'PENDING',
  UNKNOWN: 'UNKNOWN'
};

// 審查關鍵字
const ReviewKeywords = {
  APPROVE: ['approve', 'approved', '通過', 'pass', '✅'],
  REJECT: ['reject', 'rejected', '拒絕', 'failed', '❌', '問題', 'issue']
};

// Agent 類型對應狀態
const AGENT_STATE_MAP = {
  [AgentTypes.ARCHITECT]: WorkflowStates.PLANNING,
  [AgentTypes.DESIGNER]: WorkflowStates.DESIGN,
  [AgentTypes.MIGRATION]: WorkflowStates.MIGRATION_PLANNING,
  [AgentTypes.DEVELOPER]: WorkflowStates.DEVELOP,
  [AgentTypes.SKILLS]: WorkflowStates.SKILL_CREATE,
  [AgentTypes.REVIEWER]: WorkflowStates.REVIEW,
  [AgentTypes.TESTER]: WorkflowStates.TEST,
  [AgentTypes.DEBUGGER]: WorkflowStates.DEBUG,
  [AgentTypes.WORKFLOW]: WorkflowStates.VALIDATE
};

// Agent Emoji 對應
const AGENT_EMOJI = {
  [AgentTypes.ARCHITECT]: '🏗️',
  [AgentTypes.DESIGNER]: '🎨',
  [AgentTypes.MIGRATION]: '🔀',
  [AgentTypes.DEVELOPER]: '💻',
  [AgentTypes.SKILLS]: '📚',
  [AgentTypes.REVIEWER]: '🔍',
  [AgentTypes.TESTER]: '🧪',
  [AgentTypes.DEBUGGER]: '🐛',
  [AgentTypes.WORKFLOW]: '🔄'
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
    console.error(`[state-updater] 載入狀態失敗: ${error.message}`);
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
 * 檢查文字是否包含任何關鍵字
 */
function containsAny(text, keywords) {
  return keywords.some(kw => text.includes(kw));
}

/**
 * 分析 Task 結果判斷下一個狀態
 */
function analyzeTaskResult(subagentType, toolOutput) {
  const output = toolOutput?.toLowerCase() || '';

  switch (subagentType) {
    case AgentTypes.REVIEWER:
      // APPROVE → 可以進入 TEST
      // REJECT → 回到 DEVELOP
      if (containsAny(output, ReviewKeywords.APPROVE)) {
        return { nextState: WorkflowStates.TEST, status: TaskStatus.APPROVE };
      }
      if (containsAny(output, ReviewKeywords.REJECT)) {
        return { nextState: WorkflowStates.DEVELOP, status: TaskStatus.REJECT };
      }
      return { nextState: null, status: TaskStatus.PENDING };

    case AgentTypes.TESTER:
      // PASS → 完成當前任務
      // FAIL → 進入 DEBUG 或回到 DEVELOP
      if (containsAny(output, ReviewKeywords.APPROVE)) {
        return { nextState: WorkflowStates.COMPLETING, status: TaskStatus.PASS };
      }
      if (containsAny(output, ReviewKeywords.REJECT)) {
        return { nextState: WorkflowStates.DEBUG, status: TaskStatus.FAIL };
      }
      return { nextState: null, status: TaskStatus.PENDING };

    case AgentTypes.DEBUGGER:
      // 修復完成 → 回到 DEVELOP
      return { nextState: WorkflowStates.DEVELOP, status: TaskStatus.FIXED };

    default:
      return { nextState: null, status: TaskStatus.UNKNOWN };
  }
}

/**
 * 轉義 AppleScript 字串中的特殊字符，防止命令注入
 */
function escapeAppleScript(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * 發送系統通知（跨平台，使用 execFileSync 避免命令注入）
 */
function sendNotification(title, message) {
  const { execFileSync } = require('child_process');
  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      // macOS: 使用 osascript（轉義特殊字符避免注入）
      const script = `display notification "${escapeAppleScript(message)}" with title "${escapeAppleScript(title)}" sound name "Glass"`;
      execFileSync('osascript', ['-e', script], { stdio: 'ignore' });
    } else if (platform === 'linux') {
      // Linux: 使用 notify-send
      execFileSync('notify-send', [title, message], { stdio: 'ignore' });
    }
    // Windows 通知較複雜，暫不實作
  } catch (error) {
    // 通知失敗不影響主流程
  }
}

/**
 * 輸出狀態顯示
 */
function displayStateChange(oldState, newState, subagentType, status) {
  const emoji = AGENT_EMOJI[subagentType] || '🤖';
  const agentName = subagentType?.toUpperCase() || 'AGENT';

  // 狀態訊息映射表
  const statusMessages = {
    [TaskStatus.APPROVE]: `✅ ${emoji} ${agentName} 審查通過 → 進入 TEST`,
    [TaskStatus.REJECT]: `❌ ${emoji} ${agentName} 發現問題 → 返回 DEVELOP 修復`,
    [TaskStatus.PASS]: `✅ ${emoji} ${agentName} 測試通過 → 任務完成`,
    [TaskStatus.FAIL]: `❌ ${emoji} ${agentName} 測試失敗 → 進入 DEBUG`
  };

  if (statusMessages[status]) {
    console.log(`\n## ${statusMessages[status]}`);
  } else if (oldState !== newState) {
    console.log(`\n## ${emoji} ${agentName}: ${oldState} → ${newState}`);
  }

  // 完成通知：當進入 COMPLETING 或 DONE 狀態時發送系統通知
  if (newState === WorkflowStates.COMPLETING || newState === WorkflowStates.DONE) {
    const notifyTitle = 'Claude Code 任務完成';
    const notifyMessage = status === TaskStatus.PASS
      ? '測試通過，任務已完成！'
      : `工作流已進入 ${newState} 狀態`;
    sendNotification(notifyTitle, notifyMessage);
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
    console.error(`[state-updater] 讀取 stdin 失敗: ${error.message}`);
    return;
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
    console.error(`[state-updater] 解析 JSON 失敗: ${error.message}`);
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
    const rawSubagentType = toolInput.subagent_type?.toLowerCase();
    // 移除 "workflow:" 前綴以支援 plugin agent 格式
    const subagentType = rawSubagentType?.replace(/^workflow:/, '');
    const targetState = AGENT_STATE_MAP[subagentType];

    // ARCHITECT 任務：重置工作流狀態（新任務開始）
    if (subagentType === AgentTypes.ARCHITECT) {
      // 從任務描述提取 change-id
      const taskPrompt = toolInput.prompt || '';
      // 支援更多前綴：規劃、plan、建立、設計、實作、開發、add、create、implement
      const changeIdMatch = taskPrompt.match(/(?:規劃|plan|建立|設計|實作|開發|add|create|implement)\s*[：:]*\s*(.+?)(?:\s|$)/i);
      const newChangeId = changeIdMatch ? changeIdMatch[1].trim().toLowerCase().replace(/\s+/g, '-') : `task-${Date.now()}`;

      // 重置狀態
      state.changeId = newChangeId;
      state.mainAgentOps = { directEdits: 0, delegated: 1, blocked: 0, bypassed: 0 };
      state.timestamps.workflowStarted = new Date().toISOString();
      updateState(state, WorkflowStates.PLANNING);
      saveState(state);
      return;
    }

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
