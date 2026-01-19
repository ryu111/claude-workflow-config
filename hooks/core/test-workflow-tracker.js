#!/usr/bin/env node
/**
 * 測試 workflow-violation-tracker.js 的 D→R→T 提醒功能
 */

const { spawn } = require('child_process');
const path = require('path');

const HOOK_PATH = path.join(__dirname, 'workflow-violation-tracker.js');

function testHook(toolName, params) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [HOOK_PATH], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        const input = JSON.stringify({
            tool_name: toolName,
            parameters: params
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });

        child.stdin.write(input);
        child.stdin.end();
    });
}

async function runTests() {
    console.log('🧪 測試 D→R→T 當下提醒機制\n');

    // 測試 1: Task(developer) → 應該提醒呼叫 reviewer
    console.log('Test 1: Task(developer) 完成');
    const result1 = await testHook('Task', {
        subagent_type: 'developer',
        task: '實作登入功能'
    });
    console.log('Output:', result1.stdout);
    if (result1.stdout.includes('Task(reviewer)')) {
        console.log('✅ 正確提醒呼叫 Task(reviewer)\n');
    } else {
        console.log('❌ 未提醒呼叫 Task(reviewer)\n');
    }

    // 測試 2: Task(reviewer) → 應該提醒呼叫 tester
    console.log('Test 2: Task(reviewer) 完成');
    const result2 = await testHook('Task', {
        subagent_type: 'reviewer',
        task: '審查登入功能'
    });
    console.log('Output:', result2.stdout);
    if (result2.stdout.includes('Task(tester)')) {
        console.log('✅ 正確提醒呼叫 Task(tester)\n');
    } else {
        console.log('❌ 未提醒呼叫 Task(tester)\n');
    }

    // 測試 3: Task(tester) → 不應該提醒（循環完成）
    console.log('Test 3: Task(tester) 完成');
    const result3 = await testHook('Task', {
        subagent_type: 'tester',
        task: '測試登入功能'
    });
    console.log('Output:', result3.stdout);
    if (result3.stdout.trim() === '') {
        console.log('✅ 正確完成循環，無提醒\n');
    } else {
        console.log('⚠️  有輸出:', result3.stdout, '\n');
    }
}

runTests().catch(console.error);
