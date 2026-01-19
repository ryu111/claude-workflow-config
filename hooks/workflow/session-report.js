#!/usr/bin/env node
/**
 * Session Report Hook (SessionEnd / COMPLETING)
 *
 * 工作流 2.0 自動委派統計報告
 *
 * 功能：
 * 1. 讀取 workflow-state/current.json 的 mainAgentOps
 * 2. 讀取違規記錄（workflow-violations.jsonl）
 * 3. 生成格式化的委派統計報告
 *
 * 輸出格式（參考 WORKFLOW-2.0-SPEC.md 第 12.6 節）：
 * ```
 * 📋 委派統計
 * ───────────────────────────────────────────────────────────────
 * Main 直接操作: 2 (文檔/配置)
 * 委派至 Sub Agent: 15
 * 嘗試違規被阻擋: 1
 *   - src/utils.ts → 改用 Task(developer)
 * 委派率: 15/17 (88%)
 * ```
 *
 * 觸發時機：
 * - SessionEnd hook（stdin 接收 session 結束資訊）
 * - 或在 COMPLETING 狀態時由 state-updater 觸發
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ==================== 常數定義 ====================

const STATE_FILE = path.join(os.homedir(), '.claude/workflow-state/current.json');
const VIOLATIONS_LOG = path.join(os.homedir(), '.claude/tests/workflow/results/workflow-violations.jsonl');

// 顯示格式常數
const SEPARATOR_LENGTH = 63;
const MAX_BLOCKED_DISPLAY = 5;
const MAX_PATH_LENGTH = 50;
const SEPARATOR_LINE = '─'.repeat(SEPARATOR_LENGTH);

// 違規類型定義
const VIOLATION_TYPES = {
  // MISSING_REVIEW: 'missing_review',  // 預留給未來擴充：審查缺失檢測
  MAIN_AGENT_CODE_EDIT: 'main_agent_code_edit',
  BLOCKED_EDIT: 'blocked_edit'
};

// ==================== 狀態載入 ====================

/**
 * 載入工作流狀態
 * @returns {{mainAgentOps: {directEdits: number, delegated: number, blocked: number, bypassed: number}} | null}
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      console.error('[session-report] 狀態檔案不存在:', STATE_FILE);
      return null;
    }

    const content = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(content);

    // 驗證結構
    if (!state.mainAgentOps) {
      console.error('[session-report] 狀態檔案缺少 mainAgentOps 欄位');
      return null;
    }

    return state;
  } catch (error) {
    console.error('[session-report] 載入狀態失敗:', error.message);
    return null;
  }
}

// ==================== 違規記錄載入 ====================

/**
 * 載入違規記錄
 * @returns {Array<{type: string, message: string, files?: string[], timestamp: number}>}
 */
function loadViolations() {
  try {
    if (!fs.existsSync(VIOLATIONS_LOG)) {
      return [];
    }

    const content = fs.readFileSync(VIOLATIONS_LOG, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);

    return lines.map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.error(`[session-report] 無法解析違規記錄（第 ${index + 1} 行）: ${error.message}`);
        return null;
      }
    }).filter(record => record !== null);
  } catch (error) {
    console.error('[session-report] 載入違規記錄失敗:', error.message);
    return [];
  }
}

/**
 * 篩選被阻擋的編輯嘗試
 * @param {Array} violations - 所有違規記錄
 * @returns {Array<{file: string, reason: string}>}
 */
function filterBlockedEdits(violations) {
  const blocked = [];

  for (const violation of violations) {
    if (violation.type === VIOLATION_TYPES.MAIN_AGENT_CODE_EDIT ||
        violation.type === VIOLATION_TYPES.BLOCKED_EDIT) {

      // 提取檔案和原因
      const files = violation.files || [];
      const reason = violation.reason || '改用 Task(developer)';

      files.forEach(file => {
        blocked.push({ file, reason });
      });
    }
  }

  // 去重（相同檔案只顯示一次）
  const uniqueBlocked = [];
  const seen = new Set();

  for (const item of blocked) {
    if (!seen.has(item.file)) {
      seen.add(item.file);
      uniqueBlocked.push(item);
    }
  }

  return uniqueBlocked;
}

// ==================== 報告生成 ====================

/**
 * 縮短過長檔案路徑
 * @param {string} filePath - 原始檔案路徑
 * @returns {string} - 縮短後的路徑
 */
function shortenPath(filePath) {
  if (!filePath || filePath.length <= MAX_PATH_LENGTH) {
    return filePath || '(未知檔案)';
  }
  return '...' + filePath.slice(-(MAX_PATH_LENGTH - 3));
}

/**
 * 計算委派率
 * @param {number} delegated - 委派次數
 * @param {number} directEdits - 直接編輯次數
 * @returns {string}
 */
function calculateDelegationRate(delegated, directEdits) {
  const total = delegated + directEdits;
  if (total === 0) {
    return '0/0 (N/A)';
  }

  const percentage = Math.round((delegated / total) * 100);
  return `${delegated}/${total} (${percentage}%)`;
}

/**
 * 輸出 systemMessage JSON（確保用戶看到）
 */
function outputSystemMessage(message) {
  const output = { systemMessage: message };
  console.log(JSON.stringify(output));
}

/**
 * 生成委派統計報告
 * @param {Object} state - 工作流狀態
 * @param {Array} blockedEdits - 被阻擋的編輯
 */
function generateReport(state, blockedEdits) {
  const { mainAgentOps } = state;
  const { directEdits, delegated, blocked, bypassed } = mainAgentOps;

  // 驗證 blocked 計數與實際記錄一致性
  if (blocked > 0 && blockedEdits.length === 0) {
    console.error(`[session-report] 警告：blocked 計數為 ${blocked} 但無違規細節記錄`);
  }

  // 構建報告內容
  const lines = [
    '## 📋 委派統計',
    SEPARATOR_LINE,
    `Main 直接操作: ${directEdits} (允許的檔案)`,
    `委派至 Sub Agent: ${delegated}`
  ];

  if (blocked > 0) {
    lines.push(`嘗試違規被阻擋: ${blocked}`);

    // 顯示被阻擋的檔案（最多 MAX_BLOCKED_DISPLAY 個）
    const displayCount = Math.min(blockedEdits.length, MAX_BLOCKED_DISPLAY);
    for (let i = 0; i < displayCount; i++) {
      const { file, reason } = blockedEdits[i];
      const shortPath = shortenPath(file);
      lines.push(`  - ${shortPath} → ${reason}`);
    }

    if (blockedEdits.length > MAX_BLOCKED_DISPLAY) {
      lines.push(`  - ... 還有 ${blockedEdits.length - MAX_BLOCKED_DISPLAY} 個被阻擋的嘗試`);
    }
  } else {
    lines.push('嘗試違規被阻擋: 0');
  }

  if (bypassed > 0) {
    lines.push(`Bypass 使用: ${bypassed}`);
  }

  const delegationRate = calculateDelegationRate(delegated, directEdits);
  lines.push(`委派率: ${delegationRate}`);
  lines.push(SEPARATOR_LINE);

  // 輸出為 systemMessage（確保用戶看到）
  outputSystemMessage(lines.join('\n'));
}

// ==================== 主函數 ====================

/**
 * 主函數
 */
function main() {
  // 1. 載入狀態
  const state = loadState();
  if (!state) {
    console.error('[session-report] 無法載入狀態，跳過報告生成');
    return;
  }

  // 2. 載入違規記錄
  const violations = loadViolations();

  // 3. 篩選被阻擋的編輯
  const blockedEdits = filterBlockedEdits(violations);

  // 4. 生成報告
  generateReport(state, blockedEdits);
}

// 執行
main();
