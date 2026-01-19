#!/usr/bin/env node
/**
 * Parallel Opportunity Detector Hook
 *
 * 解析 tasks.md 的依賴關係，檢測並行執行機會並輸出提醒
 *
 * 觸發：PostToolUse (Task: architect)
 */

const fs = require('fs');
const path = require('path');

// 常數配置
const CONFIG = {
    STATE_FILE: path.join(process.env.HOME, '.claude', 'workflow-state', 'current.json'),
    MAX_INPUT_SIZE: 64 * 1024
};

/**
 * 讀取工作流狀態
 */
function loadState() {
    try {
        if (fs.existsSync(CONFIG.STATE_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
        }
    } catch (error) {
        // 忽略錯誤
    }
    return {};
}

/**
 * 解析 tasks.md 中的任務和依賴
 */
function parseTasksForParallel(content) {
    const tasks = [];
    const lines = content.split('\n');

    let currentPhase = null;
    let phaseInfo = {};

    for (const line of lines) {
        // 檢測 Phase 標題（## 數字. 標題）
        const phaseMatch = line.match(/^##\s+(\d+)\.\s+(.+?)(?:\s+\((.*?)\))?$/);
        if (phaseMatch) {
            currentPhase = phaseMatch[1];
            const options = phaseMatch[3] || '';
            // 分割選項以正確解析多個選項組合（如 "parallel, agent: developer"）
            const optionsParts = options.split(/,\s*/);
            phaseInfo[currentPhase] = {
                name: phaseMatch[2],
                isParallel: optionsParts.some(o => o.toLowerCase().trim() === 'parallel'),
                isSequential: optionsParts.some(o => o.toLowerCase().trim() === 'sequential'),
                agent: optionsParts.find(o => o.toLowerCase().startsWith('agent:'))?.split(':')[1]?.trim(),
                depends: optionsParts.find(o => o.toLowerCase().startsWith('depends:'))?.split(':')[1]?.trim()
            };
            continue;
        }

        // 檢測任務項目
        const taskMatch = line.match(/^-\s+\[([ x~])\]\s+(\d+\.\d+)\s+(.+?)(?:\s+\|.*)?$/);
        if (taskMatch && currentPhase) {
            tasks.push({
                phase: currentPhase,
                id: taskMatch[2],
                name: taskMatch[3],
                status: taskMatch[1] === 'x' ? 'completed' : taskMatch[1] === '~' ? 'in_progress' : 'pending',
                phaseInfo: phaseInfo[currentPhase]
            });
        }
    }

    return { tasks, phaseInfo };
}

/**
 * 分析並行執行機會
 */
function analyzeParallelOpportunities(tasks, phaseInfo) {
    const opportunities = [];

    // 按 Phase 分組
    const tasksByPhase = {};
    for (const task of tasks) {
        if (!tasksByPhase[task.phase]) {
            tasksByPhase[task.phase] = [];
        }
        tasksByPhase[task.phase].push(task);
    }

    // 找出可並行的 Phase
    const phases = Object.keys(phaseInfo);
    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const info = phaseInfo[phase];

        // 明確標記為 parallel 的 Phase
        if (info.isParallel && tasksByPhase[phase]) {
            const pendingTasks = tasksByPhase[phase].filter(t => t.status === 'pending');
            if (pendingTasks.length > 1) {
                opportunities.push({
                    type: 'explicit_parallel',
                    phase: phase,
                    phaseName: info.name,
                    tasks: pendingTasks.map(t => t.id),
                    message: `Phase ${phase} (${info.name}) 標記為並行執行`
                });
            }
        }

        // 檢查相同 agent 且無依賴的任務
        if (info.agent && !info.depends) {
            const siblingPhases = phases.filter(p =>
                phaseInfo[p].agent === info.agent &&
                !phaseInfo[p].depends &&
                p !== phase
            );

            if (siblingPhases.length > 0) {
                opportunities.push({
                    type: 'same_agent_parallel',
                    phases: [phase, ...siblingPhases],
                    agent: info.agent,
                    message: `Phase ${phase} 和 ${siblingPhases.join(', ')} 可由 ${info.agent} 並行執行`
                });
            }
        }
    }

    return opportunities;
}

/**
 * 輸出並行機會提醒
 */
function outputParallelOpportunities(opportunities) {
    if (opportunities.length === 0) {
        return;
    }

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           ⚡ 偵測到並行執行機會                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    opportunities.forEach((opp, index) => {
        console.log(`### ${index + 1}. ${opp.message}`);

        if (opp.type === 'explicit_parallel' && opp.tasks) {
            console.log(`   可並行的任務: ${opp.tasks.join(', ')}`);
            console.log('');
            console.log('   建議：同時啟動多個 Task agent');
            console.log('   ```');
            opp.tasks.slice(0, 3).forEach(taskId => {
                console.log(`   Task(subagent_type: developer, prompt: "Task ${taskId}...")`);
            });
            console.log('   ```');
        }

        console.log('');
    });

    console.log('---');
    console.log('💡 **提示**: 使用單一訊息發送多個 Task 工具呼叫以實現真正的並行執行');
    console.log('');
}

/**
 * 主函數
 */
function main() {
    // 讀取 stdin
    let input = '';
    try {
        input = fs.readFileSync(0, 'utf8');
    } catch (error) {
        return;
    }

    let hookInput;
    try {
        hookInput = JSON.parse(input);
    } catch (error) {
        return;
    }

    const toolName = hookInput.tool_name;
    const toolInput = hookInput.tool_input || {};

    // 只處理 Task(architect) 完成後
    if (toolName !== 'Task') {
        return;
    }

    const subagentType = (toolInput.subagent_type || '').toLowerCase();
    if (subagentType !== 'architect' && !subagentType.includes('architect')) {
        return;
    }

    // 讀取狀態取得 tasks.md 路徑
    const state = loadState();
    const tasksFile = state.taskSync?.tasksFile;

    if (!tasksFile || !fs.existsSync(tasksFile)) {
        return;
    }

    // 解析 tasks.md
    const content = fs.readFileSync(tasksFile, 'utf8');
    const { tasks, phaseInfo } = parseTasksForParallel(content);

    // 分析並行機會
    const opportunities = analyzeParallelOpportunities(tasks, phaseInfo);

    // 輸出提醒
    outputParallelOpportunities(opportunities);
}

main();
