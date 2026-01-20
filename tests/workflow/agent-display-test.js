#!/usr/bin/env node
/**
 * 測試 Agent 開始/結束顯示功能
 *
 * 測試範圍：
 * 1. agent-start-display.js (PreToolUse)
 * 2. status-display.js (PostToolUse)
 * 3. hooks.json 配置驗證
 *
 * 運行：node tests/workflow/agent-display-test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ========================
// 工具函數
// ========================

/**
 * 執行 hook 腳本並返回 stdout
 */
function executeHook(hookPath, input) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [hookPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0 && stderr) {
        reject(new Error(`Hook failed: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    process.on('error', (error) => {
      reject(error);
    });

    // 寫入 stdin
    process.stdin.write(JSON.stringify(input));
    process.stdin.end();
  });
}

/**
 * 生成測試用的 Task 工具輸入
 */
function createTaskInput(subagentType, description = '') {
  return {
    tool_name: 'Task',
    tool_input: {
      subagent_type: subagentType,
      description: description
    }
  };
}

// ========================
// 測試 1: agent-start-display.js
// ========================

console.log('\n========================================');
console.log('TEST 1: agent-start-display.js');
console.log('========================================\n');

async function testAgentStartDisplay() {
  const hookPath = path.join(process.env.HOME, '.claude/plugins/workflow/hooks/agent-start-display.js');

  if (!fs.existsSync(hookPath)) {
    console.error(`❌ 找不到 hook 檔案: ${hookPath}`);
    return false;
  }

  const tests = [
    {
      name: '正常的 developer agent',
      input: createTaskInput('developer', '開始實作功能'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('💻') &&
                 parsed.systemMessage.includes('DEVELOPER') &&
                 parsed.systemMessage.includes('開始') &&
                 parsed.systemMessage.includes('━');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: '小寫 developer agent',
      input: createTaskInput('DEVELOPER', '開始實作功能'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('💻') &&
                 parsed.systemMessage.includes('DEVELOPER');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: 'workflow: 前綴格式',
      input: createTaskInput('workflow:developer', '開始實作功能'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('💻') &&
                 parsed.systemMessage.includes('DEVELOPER');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: 'Tester agent',
      input: createTaskInput('tester', '開始測試'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('🧪') &&
                 parsed.systemMessage.includes('TESTER');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: 'Reviewer agent',
      input: createTaskInput('reviewer', '開始審查'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('🔍') &&
                 parsed.systemMessage.includes('REVIEWER');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: '非 Task 工具應該無輸出',
      input: { tool_name: 'Edit', tool_input: {} },
      validate: (output) => {
        // 應該沒有輸出或輸出為空
        return output.trim() === '' || !output.includes('systemMessage');
      }
    },
    {
      name: '分隔線長度應為 40',
      input: createTaskInput('developer'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          const message = parsed.systemMessage;
          // 檢查是否有連續 40 個 ━
          return /━{40}/.test(message);
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: '長描述應被截短為 50 字',
      input: createTaskInput('developer', 'a'.repeat(100)),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          const message = parsed.systemMessage;
          // 應包含 50 個 a 加上 "..."
          return message.includes('a'.repeat(50) + '...');
        } catch (e) {
          return false;
        }
      }
    },
  ];

  let passCount = 0;
  for (const test of tests) {
    try {
      const output = await executeHook(hookPath, test.input);
      const result = test.validate(output);
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} - ${test.name}`);
      if (!result) {
        console.log(`       輸出: ${output}`);
      }
      if (result) passCount++;
    } catch (error) {
      console.log(`  ❌ FAIL - ${test.name}`);
      console.log(`       錯誤: ${error.message}`);
    }
  }

  console.log(`\n  結果: ${passCount}/${tests.length} 通過`);
  return passCount === tests.length;
}

// ========================
// 測試 2: status-display.js
// ========================

console.log('\n========================================');
console.log('TEST 2: status-display.js');
console.log('========================================\n');

async function testStatusDisplay() {
  const hookPath = path.join(process.env.HOME, '.claude/plugins/workflow/hooks/status-display.js');

  if (!fs.existsSync(hookPath)) {
    console.error(`❌ 找不到 hook 檔案: ${hookPath}`);
    return false;
  }

  const tests = [
    {
      name: '正常的 developer agent',
      input: createTaskInput('developer'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('💻') &&
                 parsed.systemMessage.includes('DEVELOPER') &&
                 parsed.systemMessage.includes('結束') &&
                 parsed.systemMessage.includes('━');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: 'Tester agent',
      input: createTaskInput('tester'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('🧪') &&
                 parsed.systemMessage.includes('TESTER') &&
                 parsed.systemMessage.includes('結束');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: 'workflow: 前綴應被移除',
      input: createTaskInput('workflow:developer'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return parsed.systemMessage &&
                 parsed.systemMessage.includes('DEVELOPER') &&
                 !parsed.systemMessage.includes('workflow:');
        } catch (e) {
          return false;
        }
      }
    },
    {
      name: '非 Task 工具應該無輸出',
      input: { tool_name: 'Bash', tool_input: {} },
      validate: (output) => {
        return output.trim() === '' || !output.includes('systemMessage');
      }
    },
    {
      name: '輸出應為有效 JSON',
      input: createTaskInput('developer'),
      validate: (output) => {
        try {
          const parsed = JSON.parse(output);
          return typeof parsed === 'object' && 'systemMessage' in parsed;
        } catch (e) {
          return false;
        }
      }
    },
  ];

  let passCount = 0;
  for (const test of tests) {
    try {
      const output = await executeHook(hookPath, test.input);
      const result = test.validate(output);
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} - ${test.name}`);
      if (!result) {
        console.log(`       輸出: ${output}`);
      }
      if (result) passCount++;
    } catch (error) {
      console.log(`  ❌ FAIL - ${test.name}`);
      console.log(`       錯誤: ${error.message}`);
    }
  }

  console.log(`\n  結果: ${passCount}/${tests.length} 通過`);
  return passCount === tests.length;
}

// ========================
// 測試 3: hooks.json 配置
// ========================

console.log('\n========================================');
console.log('TEST 3: hooks.json 配置驗證');
console.log('========================================\n');

function testHooksConfiguration() {
  const hooksPath = path.join(process.env.HOME, '.claude/plugins/workflow/hooks/hooks.json');

  if (!fs.existsSync(hooksPath)) {
    console.error(`❌ 找不到 hooks.json: ${hooksPath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(hooksPath, 'utf8');
    const hooks = JSON.parse(content);

    let passCount = 0;
    const tests = [
      {
        name: '包含 PreToolUse 事件',
        validate: () => hooks.hooks?.PreToolUse !== undefined
      },
      {
        name: '包含 PostToolUse 事件',
        validate: () => hooks.hooks?.PostToolUse !== undefined
      },
      {
        name: 'agent-start-display.js 在 PreToolUse 中',
        validate: () => {
          const preToolUse = hooks.hooks.PreToolUse || [];
          return preToolUse.some(entry => entry.script === 'agent-start-display.js');
        }
      },
      {
        name: 'agent-start-display.js order = 1',
        validate: () => {
          const preToolUse = hooks.hooks.PreToolUse || [];
          const entry = preToolUse.find(e => e.script === 'agent-start-display.js');
          return entry && entry.order === 1;
        }
      },
      {
        name: 'status-display.js 在 PostToolUse 中',
        validate: () => {
          const postToolUse = hooks.hooks.PostToolUse || [];
          return postToolUse.some(entry => entry.script === 'status-display.js');
        }
      },
      {
        name: 'status-display.js order = 3',
        validate: () => {
          const postToolUse = hooks.hooks.PostToolUse || [];
          const entry = postToolUse.find(e => e.script === 'status-display.js');
          return entry && entry.order === 3;
        }
      },
      {
        name: 'PreToolUse order 1 在 order 2 之前執行',
        validate: () => {
          const preToolUse = hooks.hooks.PreToolUse || [];
          const order1 = preToolUse.find(e => e.order === 1);
          const order2 = preToolUse.find(e => e.order === 2);
          return order1 && order2 && order1.order < order2.order;
        }
      },
      {
        name: 'agent-start-display matcher 針對 Task',
        validate: () => {
          const preToolUse = hooks.hooks.PreToolUse || [];
          const entry = preToolUse.find(e => e.script === 'agent-start-display.js');
          return entry && entry.matcher === "tool.name == 'Task'";
        }
      },
      {
        name: 'status-display matcher 針對 Task',
        validate: () => {
          const postToolUse = hooks.hooks.PostToolUse || [];
          const entry = postToolUse.find(e => e.script === 'status-display.js');
          return entry && entry.matcher === "tool.name == 'Task'";
        }
      },
    ];

    tests.forEach(test => {
      const result = test.validate();
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} - ${test.name}`);
      if (result) passCount++;
    });

    console.log(`\n  結果: ${passCount}/${tests.length} 通過`);
    return passCount === tests.length;
  } catch (error) {
    console.error(`❌ 驗證失敗: ${error.message}`);
    return false;
  }
}

// ========================
// 主函數
// ========================

async function main() {
  console.log('\n\n╔════════════════════════════════════════╗');
  console.log('║   Agent Display Hook 測試套件        ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = [];

  // 執行所有測試
  results.push({ name: 'agent-start-display.js', result: await testAgentStartDisplay() });
  results.push({ name: 'status-display.js', result: await testStatusDisplay() });
  results.push({ name: 'hooks.json 配置', result: testHooksConfiguration() });

  // 總結
  console.log('\n\n========================================');
  console.log('📊 測試總結');
  console.log('========================================\n');

  const allPassed = results.every(r => r.result);
  let passCount = results.filter(r => r.result).length;

  results.forEach(r => {
    const status = r.result ? '✅' : '❌';
    console.log(`  ${status} ${r.name}`);
  });

  console.log(`\n總體結果: ${passCount}/${results.length} 組測試通過\n`);

  if (allPassed) {
    console.log('✅ 所有測試通過！');
    process.exit(0);
  } else {
    console.log('❌ 有測試失敗');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});
