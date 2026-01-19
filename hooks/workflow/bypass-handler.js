#!/usr/bin/env node

/**
 * Workflow Bypass Handler (Escape Hatch Mechanism)
 *
 * 處理工作流階段跳過請求，允許緊急情況下繞過某些階段。
 * 規格來源：WORKFLOW-2.0-SPEC.md 第六章
 *
 * 功能：
 * 1. 處理 `/workflow bypass "原因"` 命令
 * 2. 記錄 bypass 到狀態檔案
 * 3. 增加 mainAgentOps.bypassed 計數
 * 4. 檢查限制（最多 3 次、不可 bypass COMPLETING）
 *
 * 使用方式：
 * node bypass-handler.js bypass "緊急修復，已人工確認"
 * node bypass-handler.js status
 * node bypass-handler.js reset
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================================================
// 常數定義
// ============================================================================

const STATE_FILE = path.join(os.homedir(), '.claude/workflow-state/current.json');
const BYPASS_LOG = path.join(os.homedir(), '.claude/workflow-state/bypass-records.json');
const MAX_BYPASS_COUNT = 3;
const NON_BYPASSABLE_STATES = ['COMPLETING', 'DONE'];

// ============================================================================
// 檔案操作函數
// ============================================================================

/**
 * 確保目錄存在
 * @param {string} filePath - 檔案路徑
 */
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 載入當前工作流狀態
 * @returns {Object|null} 狀態物件，失敗返回 null
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      console.error('❌ 找不到工作流狀態檔案');
      return null;
    }
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(content);

    // 驗證 JSON 結構
    if (!state.state || typeof state.state !== 'string') {
      console.error('❌ 狀態檔案格式錯誤：缺少 state 欄位');
      return null;
    }

    return state;
  } catch (error) {
    console.error('❌ 載入狀態檔案失敗:', error.message);
    return null;
  }
}

/**
 * 儲存工作流狀態
 * @param {Object} state - 狀態物件
 * @returns {boolean} 成功返回 true
 */
function saveState(state) {
  try {
    ensureDir(STATE_FILE);
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ 儲存狀態檔案失敗:', error.message);
    return false;
  }
}

/**
 * 載入 bypass 記錄
 * @returns {Object} 記錄物件
 */
function loadBypassRecords() {
  try {
    if (!fs.existsSync(BYPASS_LOG)) {
      return { records: [] };
    }
    const content = fs.readFileSync(BYPASS_LOG, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('⚠️  載入 bypass 記錄失敗，使用空記錄:', error.message);
    return { records: [] };
  }
}

/**
 * 儲存 bypass 記錄
 * @param {Object} records - 記錄物件
 * @returns {boolean} 成功返回 true
 */
function saveBypassRecords(records) {
  try {
    ensureDir(BYPASS_LOG);
    fs.writeFileSync(BYPASS_LOG, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('❌ 儲存 bypass 記錄失敗:', error.message);
    return false;
  }
}

// ============================================================================
// 核心功能函數
// ============================================================================

/**
 * 初始化 mainAgentOps 和 metadata
 * @param {Object} state - 狀態物件
 * @returns {Object} 初始化後的狀態
 */
function initMainAgentOps(state) {
  if (!state.mainAgentOps) {
    state.mainAgentOps = { directCode: 0, bypassed: 0 };
  }
  if (!state.metadata) {
    state.metadata = {};
  }
  return state;
}

/**
 * 請求 bypass 當前階段
 * @param {string} reason - bypass 原因
 * @returns {Object} 結果物件 { success: boolean, message: string, remaining?: number }
 */
function requestBypass(reason) {
  // 0. 驗證輸入
  if (!reason || typeof reason !== 'string') {
    return { success: false, message: '❌ 請提供有效的 bypass 原因' };
  }

  const MAX_REASON_LENGTH = 500;
  if (reason.length > MAX_REASON_LENGTH) {
    return {
      success: false,
      message: `❌ 原因長度不可超過 ${MAX_REASON_LENGTH} 字元`
    };
  }

  // 1. 載入當前狀態
  const state = loadState();
  if (!state) {
    return { success: false, message: '無法載入工作流狀態' };
  }

  const currentState = state.state;

  // 2. 檢查當前狀態是否可 bypass
  if (NON_BYPASSABLE_STATES.includes(currentState)) {
    return {
      success: false,
      message: `❌ Bypass 失敗：${currentState} 階段不可跳過`
    };
  }

  // 3. 載入 bypass 記錄，檢查是否超過限制
  const bypassRecords = loadBypassRecords();
  const currentCount = state.mainAgentOps?.bypassed || 0;

  if (currentCount >= MAX_BYPASS_COUNT) {
    return {
      success: false,
      message: `❌ Bypass 失敗：已達最大次數限制 (${currentCount}/${MAX_BYPASS_COUNT})`
    };
  }

  // 4. 修正：bypass 是跳過當前階段，而不是下一個階段
  const skippedState = currentState;

  // 5. 記錄 bypass
  const bypassRecord = {
    state: currentState,
    skippedState: skippedState,
    reason: reason,
    timestamp: new Date().toISOString()
  };
  bypassRecords.records.push(bypassRecord);

  // 6. 更新狀態檔案（使用提取的函數）
  initMainAgentOps(state);
  state.mainAgentOps.bypassed = (state.mainAgentOps.bypassed || 0) + 1;
  state.metadata.lastBypass = bypassRecord;

  // 7. 儲存
  if (!saveBypassRecords(bypassRecords)) {
    return { success: false, message: '儲存 bypass 記錄失敗' };
  }
  if (!saveState(state)) {
    return { success: false, message: '更新狀態檔案失敗' };
  }

  // 8. 返回成功
  const remaining = MAX_BYPASS_COUNT - state.mainAgentOps.bypassed;
  return {
    success: true,
    message: `✅ Bypass 成功：跳過 ${skippedState} 階段`,
    reason: reason,
    remaining: remaining
  };
}

/**
 * 獲取當前 bypass 狀態
 * @returns {Object} 狀態資訊
 */
function getBypassStatus() {
  const state = loadState();
  if (!state) {
    return { success: false, message: '無法載入工作流狀態' };
  }

  const currentCount = state.mainAgentOps?.bypassed || 0;
  const remaining = MAX_BYPASS_COUNT - currentCount;
  const bypassRecords = loadBypassRecords();

  return {
    success: true,
    currentCount: currentCount,
    remaining: remaining,
    maxCount: MAX_BYPASS_COUNT,
    records: bypassRecords.records,
    currentState: state.state
  };
}

/**
 * 重置 bypass 記錄（新工作流開始時）
 * @returns {Object} 結果
 */
function resetBypassRecords() {
  try {
    const emptyRecords = { records: [] };
    if (!saveBypassRecords(emptyRecords)) {
      return { success: false, message: '重置記錄失敗' };
    }

    // 同時重置狀態檔案中的計數
    const state = loadState();
    if (state) {
      initMainAgentOps(state);
      state.mainAgentOps.bypassed = 0;
      if (state.metadata?.lastBypass) {
        delete state.metadata.lastBypass;
      }
      saveState(state);
    }

    return { success: true, message: '✅ Bypass 記錄已重置' };
  } catch (error) {
    console.error('❌ 重置失敗:', error.message);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// CLI 介面
// ============================================================================

function printUsage() {
  console.log(`
Workflow Bypass Handler - Escape Hatch Mechanism

使用方式：
  node bypass-handler.js bypass "原因"    # 請求 bypass 當前階段
  node bypass-handler.js status           # 查看當前狀態
  node bypass-handler.js reset            # 重置記錄（新工作流）
  node bypass-handler.js help             # 顯示此說明

範例：
  node bypass-handler.js bypass "緊急修復，已人工確認"
  node bypass-handler.js status
`);
}

function formatBypassStatus(status) {
  if (!status.success) {
    console.log(`❌ ${status.message}`);
    return;
  }

  console.log(`
📊 Bypass 狀態
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
當前階段：${status.currentState}
已使用次數：${status.currentCount}/${status.maxCount}
剩餘次數：${status.remaining}

歷史記錄：
${status.records.length === 0 ? '  (無)' : ''}
${status.records.map((r, i) => `
  ${i + 1}. ${r.state} → 跳過 ${r.skippedState}
     原因：${r.reason}
     時間：${new Date(r.timestamp).toLocaleString('zh-TW')}
`).join('')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'bypass': {
      const reason = args[1];
      // 輸入驗證已移至 requestBypass 函數內
      const result = requestBypass(reason);
      if (result.success) {
        console.log(result.message);
        console.log(`原因：${result.reason}`);
        console.log(`剩餘次數：${result.remaining}/${MAX_BYPASS_COUNT}`);
      } else {
        console.error(result.message);
        process.exit(1);
      }
      break;
    }

    case 'status': {
      const status = getBypassStatus();
      formatBypassStatus(status);
      break;
    }

    case 'reset': {
      const result = resetBypassRecords();
      console.log(result.message);
      if (!result.success) {
        process.exit(1);
      }
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    case undefined: {
      printUsage();
      break;
    }

    default: {
      console.error(`❌ 未知命令：${command}`);
      printUsage();
      process.exit(1);
    }
  }
}

// ============================================================================
// 執行
// ============================================================================

if (require.main === module) {
  main();
}

// 匯出函數供其他模組使用
module.exports = {
  requestBypass,
  getBypassStatus,
  resetBypassRecords,
  loadState,
  saveState,
  loadBypassRecords,
  saveBypassRecords,
  ensureDir,
  initMainAgentOps
};
