#!/usr/bin/env node
/**
 * Loop Recovery Detector Hook
 *
 * 用途：在 SessionStart 時檢測是否有未完成的 Loop，提示用戶恢復
 *
 * 觸發時機：SessionStart
 *
 * 輸出格式：
 * - 若有未完成 Loop：輸出恢復提示（含 Loop ID、專案路徑、閒置時間）
 * - 若無或已完成：無輸出
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置
const CONFIG_PATH = path.join(os.homedir(), '.claude/hooks/config.json');
const STATE_FILE = path.join(os.homedir(), '.claude/loop-state/current.json');

// ⚠️ SECURITY: 如果未來需要寫入 STATE_FILE，必須使用原子操作（temp + rename）
// 範例：
//   const tempFile = `${STATE_FILE}.${process.pid}.tmp`;
//   fs.writeFileSync(tempFile, data);
//   fs.renameSync(tempFile, STATE_FILE);  // 原子操作

/**
 * 載入配置
 */
function loadConfig() {
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        const config = JSON.parse(configData);
        return config.loopPersistence || { enabled: false };
    } catch (error) {
        // 配置不存在或解析失敗，使用預設值
        return { enabled: false };
    }
}

/**
 * 載入 Loop 狀態
 */
function loadLoopState() {
    try {
        if (!fs.existsSync(STATE_FILE)) {
            return null;
        }
        const stateData = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(stateData);
    } catch (error) {
        console.error(`⚠️  無法讀取 Loop 狀態: ${error.message}`);
        return null;
    }
}

/**
 * 計算閒置時間（分鐘）
 */
function calculateIdleMinutes(lastHeartbeat) {
    try {
        const lastTime = new Date(lastHeartbeat);
        const now = new Date();

        // 驗證時間戳有效性
        if (isNaN(lastTime.getTime())) {
            return null;
        }

        // 防止未來時間
        if (lastTime > now) {
            return null;
        }

        const diffMs = now - lastTime;

        // 防止溢位：設定最大值為 30 天
        const MAX_IDLE_MS = 30 * 24 * 60 * 60 * 1000;
        if (diffMs > MAX_IDLE_MS) {
            return Math.floor(MAX_IDLE_MS / 60000);
        }

        return Math.floor(diffMs / 60000); // 轉換為分鐘
    } catch (error) {
        return null;
    }
}

/**
 * 格式化時間差
 */
function formatTimeDiff(minutes) {
    if (minutes < 60) {
        return `${minutes} 分鐘`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
        return mins > 0 ? `${hours} 小時 ${mins} 分鐘` : `${hours} 小時`;
    }
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return remainHours > 0 ? `${days} 天 ${remainHours} 小時` : `${days} 天`;
}

/**
 * 主函數
 */
function main() {
    const config = loadConfig();

    // 檢查功能是否啟用
    if (!config.enabled || !config.autoRecovery?.enabled) {
        return;
    }

    // 載入狀態
    const state = loadLoopState();
    if (!state) {
        return;
    }

    // 檢查狀態是否為未完成
    if (state.status === 'completed' || state.status === 'cancelled') {
        return;
    }

    // 計算閒置時間
    const idleMinutes = calculateIdleMinutes(state.lastHeartbeat);
    if (idleMinutes === null) {
        return;
    }

    // 檢查是否超過最大閒置時間（預設 30 分鐘）
    const maxIdleMinutes = config.autoRecovery.maxIdleMinutes || 30;
    if (idleMinutes > maxIdleMinutes && config.autoRecovery.promptOnSessionStart) {
        // 輸出恢復提示
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                  🔄 偵測到未完成的 Loop                        ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        console.log(`📋 Loop ID: ${state.loopId}`);
        console.log(`📁 專案路徑: ${state.projectPath}`);
        console.log(`⏰ 最後活動: ${state.lastHeartbeat}`);
        console.log(`⏳ 已閒置: ${formatTimeDiff(idleMinutes)}`);
        console.log(`📊 狀態: ${state.status}`);

        if (state.loopConfig?.stateFile) {
            console.log(`📄 狀態檔案: ${state.loopConfig.stateFile}`);
        }

        console.log('\n💡 建議操作：');
        console.log('   1. 若要繼續：輸入 "loop" 或 "繼續 loop"');
        console.log('   2. 若要放棄：輸入 "取消 loop" 或手動刪除狀態檔案');
        console.log('   3. 若要查看狀態：檢查專案中的 .claude/ralph-loop.local.md\n');
    }
}

// 執行
main();
