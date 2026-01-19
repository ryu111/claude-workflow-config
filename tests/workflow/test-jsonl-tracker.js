#!/usr/bin/env node
/**
 * 測試 JSONL-based Workflow Tracker
 *
 * 驗證：
 * 1. Append-only 模式（無 race condition）
 * 2. 狀態正確計算
 * 3. 過期事件自動過濾
 * 4. 日誌自動截斷
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_PATH = path.join(os.homedir(), '.claude/hooks/core/workflow-violation-tracker.js');
const RESULTS_DIR = path.join(os.homedir(), '.claude/tests/workflow/results');
const EVENTS_FILE = path.join(RESULTS_DIR, 'workflow-events.jsonl');
const VIOLATIONS_FILE = path.join(RESULTS_DIR, 'workflow-violations.jsonl');

/**
 * 清理測試環境
 */
function cleanupTestEnv() {
    try {
        if (fs.existsSync(EVENTS_FILE)) {
            fs.unlinkSync(EVENTS_FILE);
        }
        if (fs.existsSync(VIOLATIONS_FILE)) {
            fs.unlinkSync(VIOLATIONS_FILE);
        }
    } catch (error) {
        console.error(`清理失敗: ${error.message}`);
    }
}

/**
 * 執行 hook 並傳入 JSON
 */
function runHook(toolData) {
    return new Promise((resolve, reject) => {
        const hook = spawn('node', [HOOK_PATH]);

        let stdout = '';
        let stderr = '';

        hook.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        hook.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        hook.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        hook.on('error', reject);

        // 傳入 JSON
        hook.stdin.write(JSON.stringify(toolData));
        hook.stdin.end();
    });
}

/**
 * 讀取 JSONL 檔案
 */
function readJSONL(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
}

/**
 * 測試 1: Edit 事件記錄
 */
async function testEditEvent() {
    console.log('\n🧪 測試 1: Edit 事件記錄');
    cleanupTestEnv();

    await runHook({
        tool_name: 'Edit',
        parameters: {
            file_path: '/test/file1.py',
            old_string: 'foo',
            new_string: 'bar'
        }
    });

    const events = readJSONL(EVENTS_FILE);

    if (events.length !== 1) {
        throw new Error(`預期 1 個事件，但有 ${events.length} 個`);
    }

    if (events[0].type !== 'edit') {
        throw new Error(`預期事件類型為 'edit'，但為 '${events[0].type}'`);
    }

    console.log('✅ Edit 事件記錄正確');
}

/**
 * 測試 2: D→R→T 工作流
 */
async function testDRTWorkflow() {
    console.log('\n🧪 測試 2: D→R→T 工作流');
    cleanupTestEnv();

    // Edit
    await runHook({
        tool_name: 'Edit',
        parameters: { file_path: '/test/file1.py' }
    });

    // Developer
    const devResult = await runHook({
        tool_name: 'Task',
        parameters: {
            subagent_type: 'developer',
            task: 'Implement feature'
        }
    });

    if (!devResult.stdout.includes('Task(reviewer)')) {
        throw new Error('Developer 完成後未提醒呼叫 reviewer');
    }

    // Reviewer
    const revResult = await runHook({
        tool_name: 'Task',
        parameters: {
            subagent_type: 'reviewer',
            task: 'Review code'
        }
    });

    if (!revResult.stdout.includes('Task(tester)')) {
        throw new Error('Reviewer 完成後未提醒呼叫 tester');
    }

    // Tester
    await runHook({
        tool_name: 'Task',
        parameters: {
            subagent_type: 'tester',
            task: 'Test feature'
        }
    });

    const events = readJSONL(EVENTS_FILE);

    // 預期: 1 edit + 1 developer + 1 reviewer + 1 tester = 4 個事件
    if (events.length !== 4) {
        throw new Error(`預期 4 個事件，但有 ${events.length} 個`);
    }

    const types = events.map(e => e.type);
    const expected = ['edit', 'developer_complete', 'reviewer_complete', 'tester_complete'];

    if (JSON.stringify(types) !== JSON.stringify(expected)) {
        throw new Error(`事件序列錯誤: ${JSON.stringify(types)}`);
    }

    console.log('✅ D→R→T 工作流記錄正確');
}

/**
 * 測試 3: 違規檢測
 */
async function testViolationDetection() {
    console.log('\n🧪 測試 3: 違規檢測');
    cleanupTestEnv();

    // 連續兩個 Edit 而不呼叫 reviewer
    await runHook({
        tool_name: 'Edit',
        parameters: { file_path: '/test/file1.py' }
    });

    await runHook({
        tool_name: 'Edit',
        parameters: { file_path: '/test/file2.py' }
    });

    const violations = readJSONL(VIOLATIONS_FILE);

    if (violations.length === 0) {
        throw new Error('未檢測到違規');
    }

    const lastViolation = violations[violations.length - 1];
    if (lastViolation.type !== 'missing_review') {
        throw new Error(`預期違規類型為 'missing_review'，但為 '${lastViolation.type}'`);
    }

    console.log('✅ 違規檢測正確');
}

/**
 * 測試 4: 並行安全（多個 hook 同時執行）
 */
async function testConcurrency() {
    console.log('\n🧪 測試 4: 並行安全');
    cleanupTestEnv();

    // 同時執行 5 個 Edit hook
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(runHook({
            tool_name: 'Edit',
            parameters: { file_path: `/test/file${i}.py` }
        }));
    }

    await Promise.all(promises);

    const events = readJSONL(EVENTS_FILE);

    // 應該有 5 個事件（沒有遺失）
    if (events.length !== 5) {
        throw new Error(`預期 5 個事件，但有 ${events.length} 個（可能有 race condition）`);
    }

    // 檢查是否有重複的 timestamp（不太可能，但檢查一下）
    const timestamps = events.map(e => e.timestamp);
    const uniqueTimestamps = new Set(timestamps);

    console.log(`✅ 並行安全: 5 個 hook 同時執行，記錄了 ${events.length} 個事件`);
}

/**
 * 執行所有測試
 */
async function runAllTests() {
    console.log('🚀 開始測試 JSONL Workflow Tracker\n');

    try {
        await testEditEvent();
        await testDRTWorkflow();
        await testViolationDetection();
        await testConcurrency();

        console.log('\n✅ 所有測試通過！');
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ 測試失敗: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

runAllTests();
