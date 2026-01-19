#!/usr/bin/env node
/**
 * Status Display Hook (PostToolUse)
 *
 * 工作流 2.0 自動狀態顯示
 *
 * 功能：
 * 1. Task 啟動時顯示 Agent 資訊
 * 2. 並行 Task 時顯示「⚡ 並行啟動 N 個」
 *
 * 輸出格式（參考 WORKFLOW-2.0-SPEC.md 第七章）：
 * - 單一: ## 💻 DEVELOPER: Task 2.1 - 建立 UserService
 * - 並行: ## ⚡ 並行啟動 3 個 💻 DEVELOPER
 *
 * 觸發時機：PostToolUse (Task)
 */

const fs = require('fs');

// Agent Emoji 對應
const AGENT_EMOJI = {
  'architect': '🏗️',
  'designer': '🎨',
  'migration': '🔀',
  'developer': '💻',
  'skills-agents': '📚',
  'reviewer': '🔍',
  'tester': '🧪',
  'debugger': '🐛',
  'workflow': '🔄',
  'main': '🤖'
};

// Agent 中文名稱
const AGENT_NAMES = {
  'architect': 'ARCHITECT',
  'designer': 'DESIGNER',
  'migration': 'MIGRATION',
  'developer': 'DEVELOPER',
  'skills-agents': 'SKILLS',
  'reviewer': 'REVIEWER',
  'tester': 'TESTER',
  'debugger': 'DEBUGGER',
  'workflow': 'WORKFLOW',
  'main': 'MAIN'
};


/**
 * 輸出 systemMessage JSON（確保用戶看到）
 */
function outputSystemMessage(message) {
  const output = { systemMessage: message };
  console.log(JSON.stringify(output));
}

/**
 * 顯示 Task 完成訊息（大字格式）
 */
function displayTaskComplete(subagentType) {
  const emoji = AGENT_EMOJI[subagentType] || '🤖';
  const agentName = AGENT_NAMES[subagentType] || subagentType.toUpperCase();

  // 大字格式顯示 Agent 結束
  const separator = '━'.repeat(40);
  const message = `\n${separator}\n${emoji} ${agentName} 結束\n${separator}`;

  outputSystemMessage(message);
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
    console.error(`[status-display] ${error.message}`);
    return;
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
    console.error(`[status-display] ${error.message}`);
    return;
  }

  const toolName = hookInput.tool_name;
  const toolInput = hookInput.tool_input || {};

  // 只處理 Task 工具
  if (toolName !== 'Task') {
    return;
  }

  const rawSubagentType = toolInput.subagent_type?.toLowerCase();
  // 移除 "workflow:" 前綴以支援 plugin agent 格式
  const subagentType = rawSubagentType?.replace(/^workflow:/, '');

  if (!subagentType) {
    return;
  }

  // 顯示 Task 完成訊息
  displayTaskComplete(subagentType);
}

main();
