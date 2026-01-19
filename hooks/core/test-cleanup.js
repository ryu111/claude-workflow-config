#!/usr/bin/env node
/**
 * 測試自動清理機制（過期項目和數量限制）
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const STATE_FILE = path.join(os.homedir(), '.claude/tests/workflow/results/workflow-state.json');

// 建立測試狀態（11 筆 pendingEdits + 6 筆 pendingDeveloperTasks）
const testState = {
    pendingEdits: Array.from({ length: 11 }, (_, i) => ({
        tool: 'Edit',
        file: `test${i}.py`,
        timestamp: Date.now() - (i * 10 * 60 * 1000), // 每筆間隔 10 分鐘
        executor: 'main'
    })),
    pendingDeveloperTasks: Array.from({ length: 6 }, (_, i) => ({
        timestamp: Date.now() - (i * 5 * 60 * 1000), // 每筆間隔 5 分鐘
        description: `task${i}`
    })),
    pendingReviewerTasks: [],
    violations: []
};

// 加入一些過期項目（超過 1 小時）
testState.pendingEdits.push({
    tool: 'Edit',
    file: 'stale.py',
    timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 小時前
    executor: 'main'
});

console.log('📝 建立測試狀態');
console.log(`- pendingEdits: ${testState.pendingEdits.length} 筆（含 1 筆過期）`);
console.log(`- pendingDeveloperTasks: ${testState.pendingDeveloperTasks.length} 筆`);

// 寫入測試狀態
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
fs.writeFileSync(STATE_FILE, JSON.stringify(testState, null, 2));

// 執行 hook 觸發清理
const { spawn } = require('child_process');
const HOOK_PATH = path.join(__dirname, 'workflow-violation-tracker.js');

const child = spawn('node', [HOOK_PATH], {
    stdio: ['pipe', 'inherit', 'inherit']
});

const input = JSON.stringify({
    tool_name: 'Edit',
    parameters: { file_path: 'trigger_cleanup.py' }
});

child.stdin.write(input);
child.stdin.end();

child.on('close', () => {
    // 讀取清理後的狀態
    const cleaned = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

    console.log('\n🧹 清理後狀態');
    console.log(`- pendingEdits: ${cleaned.pendingEdits.length} 筆（應 ≤ 10）`);
    console.log(`- pendingDeveloperTasks: ${cleaned.pendingDeveloperTasks.length} 筆（應 ≤ 5）`);

    // 驗證
    let passed = true;

    if (cleaned.pendingEdits.length > 10) {
        console.log('❌ pendingEdits 超過限制');
        passed = false;
    } else {
        console.log('✅ pendingEdits 數量限制正確');
    }

    if (cleaned.pendingDeveloperTasks.length > 5) {
        console.log('❌ pendingDeveloperTasks 超過限制');
        passed = false;
    } else {
        console.log('✅ pendingDeveloperTasks 數量限制正確');
    }

    // 檢查是否移除過期項目
    const hasStale = cleaned.pendingEdits.some(e => e.file === 'stale.py');
    if (hasStale) {
        console.log('❌ 未移除過期項目');
        passed = false;
    } else {
        console.log('✅ 過期項目已移除');
    }

    console.log(passed ? '\n✅ 所有測試通過' : '\n❌ 部分測試失敗');
});
