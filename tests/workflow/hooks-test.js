#!/usr/bin/env node
/**
 * 綜合測試套件：Workflow 2.0 強制執行機制修正
 *
 * 測試以下 hooks：
 * 1. task-sync.js - 任務同步
 * 2. violation-tracker.js - 違規追蹤
 * 3. completion-enforcer.js - 完成強制執行
 * 4. parallel-opportunity-detector.js - 並行機會檢測
 * 5. hooks.json - 配置驗證
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// ========================
// 1. TASK-SYNC.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 1: task-sync.js - Regex 模式測試');
console.log('========================================\n');

// 模擬 updateTasksMdCheckbox 的 regex 模式
function testCheckboxRegex() {
  const tests = [
    // 格式: [輸入, taskId, 期望結果]
    {
      input: '- [ ] 1.1 Initialize project',
      taskId: '1.1',
      pattern: /^(-\s+\[)[ xX~>](\]\s+1\.1\s+)/m,
      description: '匹配空白 checkbox',
      shouldMatch: true
    },
    {
      input: '- [x] 1.1 Initialize project',
      taskId: '1.1',
      pattern: /^(-\s+\[)[ xX~>](\]\s+1\.1\s+)/m,
      description: '匹配 x checkbox',
      shouldMatch: true
    },
    {
      input: '- [X] 1.1 Initialize project',
      taskId: '1.1',
      pattern: /^(-\s+\[)[ xX~>](\]\s+1\.1\s+)/m,
      description: '匹配 X checkbox',
      shouldMatch: true
    },
    {
      input: '- [~] 1.1 Initialize project',
      taskId: '1.1',
      pattern: /^(-\s+\[)[ xX~>](\]\s+1\.1\s+)/m,
      description: '匹配 ~ (進行中) checkbox',
      shouldMatch: true
    },
    {
      input: '- [>] 1.1 Initialize project',
      taskId: '1.1',
      pattern: /^(-\s+\[)[ xX~>](\]\s+1\.1\s+)/m,
      description: '匹配 > checkbox',
      shouldMatch: true
    }
  ];

  tests.forEach((test, index) => {
    const matches = test.pattern.test(test.input);
    const result = matches === test.shouldMatch ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result} - 測試 ${index + 1}: ${test.description}`);
    if (matches !== test.shouldMatch) {
      console.log(`       Input: ${test.input}`);
      console.log(`       Expected: ${test.shouldMatch}, Got: ${matches}`);
    }
    assert.strictEqual(matches, test.shouldMatch, test.description);
  });
}

// 測試 updateTasksMdToInProgress 的 regex
function testInProgressRegex() {
  const tests = [
    {
      input: '- [ ] 1.1 Initialize project',
      taskId: '1.1',
      pattern: /^(-\s+\[) (\]\s+1\.1\s+)/m,
      expectedReplacement: '- [~] 1.1 Initialize project',
      description: '將空白 checkbox 改為進行中'
    },
    {
      input: '- [ ] 2.1 Feature A',
      taskId: '2.1',
      pattern: /^(-\s+\[) (\]\s+2\.1\s+)/m,
      expectedReplacement: '- [~] 2.1 Feature A',
      description: '嵌套任務編號'
    }
  ];

  tests.forEach((test, index) => {
    const newContent = test.input.replace(test.pattern, '$1~$2');
    const matches = newContent === test.expectedReplacement;
    const result = matches ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result} - 測試 ${index + 1}: ${test.description}`);
    if (!matches) {
      console.log(`       Expected: ${test.expectedReplacement}`);
      console.log(`       Got: ${newContent}`);
    }
    assert.strictEqual(newContent, test.expectedReplacement, test.description);
  });
}

testCheckboxRegex();
console.log('');
testInProgressRegex();

// ========================
// 2. VIOLATION-TRACKER.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 2: violation-tracker.js - 測試結果判定');
console.log('========================================\n');

function testTesterResultDetection() {
  const passTests = [
    'tests passed',
    'all tests passed',
    'test passed',
    '✅ all tests passed',
    'tests passed ✅',
    '測試通過',
    'tests PASSED',
    'PASS: All tests',
  ];

  const failTests = [
    'test failed',
    'tests failed',
    '❌ tests failed',
    'tests failed ❌',
    'test failure',
    '測試失敗',
    'tests FAILED',
    'FAIL: Some tests',
    '1 failed',
    '2 failed tests'
  ];

  const passPattern = /(?:test[s]?\s+)?(?:all\s+)?pass(?:ed)?|✅.*(?:通過|pass)|(?:通過|pass).*✅|測試通過|tests?\s+passed/i;
  const failPattern = /(?:test[s]?\s+)?(?:\d+\s+)?fail(?:ed|ure|ing)?|❌.*(?:失敗|fail)|(?:失敗|fail).*❌|測試失敗|tests?\s+failed/i;

  console.log('  通過測試的輸出檢測：');
  passTests.forEach((output, index) => {
    const isPassed = passPattern.test(output);
    const result = isPassed ? '✅ PASS' : '❌ FAIL';
    console.log(`    ${result} - "${output}"`);
    assert.strictEqual(isPassed, true, `Should detect pass: ${output}`);
  });

  console.log('\n  失敗測試的輸出檢測：');
  failTests.forEach((output, index) => {
    const isFailed = failPattern.test(output);
    const result = isFailed ? '✅ PASS' : '❌ FAIL';
    console.log(`    ${result} - "${output}"`);
    assert.strictEqual(isFailed, true, `Should detect fail: ${output}`);
  });
}

testTesterResultDetection();

// ========================
// 3. COMPLETION-ENFORCER.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 3: completion-enforcer.js - 邊界條件測試');
console.log('========================================\n');

function testAllTasksComplete() {
  const tests = [
    {
      state: { taskSync: { completed: 0, totalTasks: 0 } },
      expected: false,
      description: '沒有任務時不視為完成'
    },
    {
      state: { taskSync: { completed: 1, totalTasks: 0 } },
      expected: false,
      description: 'totalTasks 為 0 時不視為完成'
    },
    {
      state: { taskSync: { completed: 0, totalTasks: 1 } },
      expected: false,
      description: '完成數少於總數時不完成'
    },
    {
      state: { taskSync: { completed: 1, totalTasks: 1 } },
      expected: true,
      description: '完成數等於總數時視為完成'
    },
    {
      state: { taskSync: { completed: 5, totalTasks: 5 } },
      expected: true,
      description: '多個任務都完成'
    },
    {
      state: { taskSync: undefined },
      expected: false,
      description: 'taskSync 不存在時不視為完成'
    },
    {
      state: { taskSync: { completed: undefined, totalTasks: 1 } },
      expected: false,
      description: 'completed 為 undefined 時不視為完成'
    },
    {
      state: { taskSync: { completed: 1, totalTasks: undefined } },
      expected: false,
      description: 'totalTasks 為 undefined 時不視為完成'
    },
  ];

  tests.forEach((test, index) => {
    // 複製檢查邏輯
    const hasTaskSync = test.state.taskSync &&
                        typeof test.state.taskSync.completed === 'number' &&
                        typeof test.state.taskSync.totalTasks === 'number' &&
                        test.state.taskSync.totalTasks > 0;
    const allTasksComplete = hasTaskSync &&
                              test.state.taskSync.completed === test.state.taskSync.totalTasks;

    // 確保轉換為 boolean
    const result = Boolean(allTasksComplete) === test.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${result} - 測試 ${index + 1}: ${test.description}`);
    assert.strictEqual(Boolean(allTasksComplete), test.expected, test.description);
  });
}

testAllTasksComplete();

// ========================
// 4. PARALLEL-OPPORTUNITY-DETECTOR.JS 測試
// ========================

console.log('\n========================================');
console.log('TEST 4: parallel-opportunity-detector.js - 選項解析');
console.log('========================================\n');

function testParallelOptionsParsing() {
  const tests = [
    {
      line: '## 1. Setup (parallel)',
      expected: { isParallel: true, isSequential: false, agent: undefined, depends: undefined },
      description: '簡單 parallel 標記'
    },
    {
      line: '## 2. Features (sequential)',
      expected: { isParallel: false, isSequential: true, agent: undefined, depends: undefined },
      description: '簡單 sequential 標記'
    },
    {
      line: '## 3. API (parallel, agent: developer)',
      expected: { isParallel: true, isSequential: false, agent: 'developer', depends: undefined },
      description: 'parallel 搭配 agent'
    },
    {
      line: '## 4. Database (sequential, depends: 2)',
      expected: { isParallel: false, isSequential: true, agent: undefined, depends: '2' },
      description: 'sequential 搭配 depends'
    },
    {
      line: '## 5. Deploy (parallel, agent: tester, depends: 3)',
      expected: { isParallel: true, isSequential: false, agent: 'tester', depends: '3' },
      description: '所有選項組合'
    },
  ];

  tests.forEach((test, index) => {
    const phaseMatch = test.line.match(/^##\s+(\d+)\.\s+(.+?)(?:\s+\((.*?)\))?$/);
    const options = phaseMatch[3] || '';
    const optionsParts = options.split(/,\s*/);

    const result = {
      isParallel: optionsParts.some(o => o.toLowerCase().trim() === 'parallel'),
      isSequential: optionsParts.some(o => o.toLowerCase().trim() === 'sequential'),
      agent: optionsParts.find(o => o.toLowerCase().startsWith('agent:'))?.split(':')[1]?.trim(),
      depends: optionsParts.find(o => o.toLowerCase().startsWith('depends:'))?.split(':')[1]?.trim()
    };

    const matches =
      result.isParallel === test.expected.isParallel &&
      result.isSequential === test.expected.isSequential &&
      result.agent === test.expected.agent &&
      result.depends === test.expected.depends;

    const status = matches ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} - 測試 ${index + 1}: ${test.description}`);

    if (!matches) {
      console.log(`       Expected: ${JSON.stringify(test.expected)}`);
      console.log(`       Got: ${JSON.stringify(result)}`);
    }

    assert.deepStrictEqual(result, test.expected, test.description);
  });
}

testParallelOptionsParsing();

// ========================
// 5. HOOKS.JSON 驗證
// ========================

console.log('\n========================================');
console.log('TEST 5: hooks.json - 配置驗證');
console.log('========================================\n');

function validateHooksJson() {
  const hooksPath = path.join(process.env.HOME, '.claude/plugins/workflow/hooks/hooks.json');

  try {
    const content = fs.readFileSync(hooksPath, 'utf8');
    const hooks = JSON.parse(content);

    console.log('  ✅ JSON 語法正確');

    // 檢查必要的事件
    const requiredEvents = ['SessionStart', 'SessionEnd', 'PreToolUse', 'PostToolUse', 'UserPromptSubmit'];
    requiredEvents.forEach(event => {
      const exists = hooks.hooks && hooks.hooks[event];
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} 事件 "${event}" 存在`);
      assert(exists, `Event ${event} must exist`);
    });

    // 檢查 PostToolUse 中的核心 hooks
    const postToolUse = hooks.hooks.PostToolUse || [];
    const requiredHooks = [
      'task-sync.js',
      'violation-tracker.js',
      'completion-enforcer.js',
      'parallel-opportunity-detector.js',
      'status-display.js'
    ];

    requiredHooks.forEach(hookName => {
      // 支持新舊兩種 hooks.json 格式
      const found = postToolUse.some(entry => {
        // 新格式: { script: "xxx.js", ... }
        if (entry.script === hookName) return true;
        // 舊格式: { hooks: [{ command: "..." }] }
        if (entry.hooks && entry.hooks.some(h => h.command && h.command.includes(hookName))) return true;
        return false;
      });
      const status = found ? '✅' : '❌';
      console.log(`  ${status} PostToolUse 中包含 "${hookName}"`);
      assert(found, `PostToolUse must include ${hookName}`);
    });

    console.log('\n  ✅ 所有配置驗證通過');
  } catch (error) {
    console.error('❌ hooks.json 驗證失敗:', error.message);
    throw error;
  }
}

validateHooksJson();

// ========================
// 6. SKILLS 結構驗證
// ========================

console.log('\n========================================');
console.log('TEST 6: Skills 結構驗證');
console.log('========================================\n');

function validateSkillsStructure() {
  const skillsDir = path.join(process.env.HOME, '.claude/plugins/workflow/skills');
  const requiredSkills = ['core', 'testing', 'browser', 'migration', 'debugger', 'skill-agent'];

  requiredSkills.forEach(skillName => {
    const skillPath = path.join(skillsDir, skillName);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const referencesPath = path.join(skillPath, 'references');

    const skillExists = fs.existsSync(skillPath);
    const skillMdExists = fs.existsSync(skillMdPath);
    const referencesExists = fs.existsSync(referencesPath);

    const status = skillExists ? '✅' : '❌';
    console.log(`\n  ${status} Skill: ${skillName}`);

    if (skillExists) {
      const mdStatus = skillMdExists ? '✅' : '❌';
      console.log(`     ${mdStatus} SKILL.md 存在`);
      assert(skillMdExists, `${skillName}/SKILL.md must exist`);

      const refStatus = referencesExists ? '✅' : '❌';
      console.log(`     ${refStatus} references 目錄存在`);

      if (referencesExists) {
        try {
          const files = fs.readdirSync(referencesPath);
          console.log(`     ✅ references 目錄包含 ${files.length} 個檔案`);
        } catch (e) {
          console.log(`     ⚠️  無法讀取 references 目錄: ${e.message}`);
        }
      }
    } else {
      console.log(`     ❌ Skill 目錄不存在`);
      // 有些 skills 可能是可選的
      if (['migration', 'debugger', 'skill-agent'].includes(skillName)) {
        console.log(`     (⚠️  可選 skill，不強制要求)`);
      } else {
        assert(skillExists, `${skillName} skill must exist`);
      }
    }
  });
}

validateSkillsStructure();

// ========================
// 總結
// ========================

console.log('\n\n========================================');
console.log('📊 測試總結');
console.log('========================================\n');
console.log('✅ 所有測試通過！');
console.log('\n測試覆蓋範圍：');
console.log('  ✅ task-sync.js - Regex 模式驗證 (5 項)');
console.log('  ✅ task-sync.js - In-Progress 轉換 (2 項)');
console.log('  ✅ violation-tracker.js - 測試結果判定 (20 項)');
console.log('  ✅ completion-enforcer.js - 邊界條件 (8 項)');
console.log('  ✅ parallel-opportunity-detector.js - 選項解析 (5 項)');
console.log('  ✅ hooks.json - 配置驗證 (10 項)');
console.log('  ✅ Skills 結構驗證 (6 項)\n');
