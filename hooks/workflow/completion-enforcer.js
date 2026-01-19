#!/usr/bin/env node
/**
 * Completion Enforcer Hook
 *
 * 工作流完成時強制執行收尾動作
 *
 * 功能：
 * 1. 檢測收尾動作完成狀態（git commit, archive）
 * 2. 追蹤收尾進度到 state
 * 3. 阻止未完成收尾就標記 DONE（透過設定 blocking flag）
 *
 * 觸發：PostToolUse (Task, Bash)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// 常數配置
const CONFIG = {
    STATE_FILE: path.join(process.env.HOME, '.claude', 'workflow-state', 'current.json'),
    OPENSPEC_CHANGES: path.join(process.env.HOME, '.claude', 'openspec', 'changes'),
    OPENSPEC_ARCHIVE: path.join(process.env.HOME, '.claude', 'openspec', 'archive'),
    MAX_INPUT_SIZE: 64 * 1024
};

// 收尾動作清單（動態生成，因為 open_deliverable 需要條件判斷）
function getCompletionChecklist(state) {
    const checklist = [
        {
            id: 'git_commit',
            description: '提交程式碼變更',
            command: 'git add . && git commit -m "..."',
            required: true,
            detect: detectGitCommit
        },
        {
            id: 'archive_openspec',
            description: '歸檔 OpenSpec 變更目錄',
            command: 'mv openspec/changes/[change-id] openspec/archive/',
            required: true,
            detect: detectOpenSpecArchive
        },
        {
            id: 'cleanup_temp',
            description: '清理臨時檔案（如有）',
            command: 'rm -rf __pycache__ .pytest_cache node_modules/.cache',
            required: false,
            detect: null  // 不強制檢查
        }
    ];

    // 檢測是否有 UI 產出
    const uiInfo = detectHasUIDeliverable(state);
    if (uiInfo.hasUI) {
        checklist.push({
            id: 'open_deliverable',
            description: '開啟 UI 成品讓用戶驗收',
            command: `open ${uiInfo.deliverablePath}`,
            required: true,  // 有 UI 就是強制
            detect: () => detectDeliverableOpened(state),
            deliverablePath: uiInfo.deliverablePath
        });
    }

    return checklist;
}

/**
 * 檢測 git commit 是否已執行
 * 檢查：working tree 是否乾淨（沒有未提交的變更）
 */
function detectGitCommit(state) {
    try {
        const status = execFileSync('git', ['status', '--porcelain'], {
            encoding: 'utf8',
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        // 如果 status 為空，表示已提交
        return status === '';
    } catch (error) {
        // git 不可用或不是 repo，視為已完成
        return true;
    }
}

/**
 * 檢測 OpenSpec 是否已歸檔
 * 檢查：changes 目錄下是否還有 change-id 對應的目錄
 */
function detectOpenSpecArchive(state) {
    const changeId = state?.changeId;
    if (!changeId) {
        return true;  // 沒有 changeId，視為已完成
    }

    const changePath = path.join(CONFIG.OPENSPEC_CHANGES, changeId);

    // 如果 changes 目錄下的 changeId 目錄不存在，視為已歸檔
    return !fs.existsSync(changePath);
}

/**
 * 檢測是否有 UI 產出需要開啟
 * 從 proposal.md 或 tasks.md 中檢測
 */
function detectHasUIDeliverable(state) {
    const changeId = state?.changeId;
    if (!changeId) {
        return { hasUI: false, deliverablePath: null };
    }

    const proposalPath = path.join(CONFIG.OPENSPEC_CHANGES, changeId, 'proposal.md');
    const tasksPath = path.join(CONFIG.OPENSPEC_CHANGES, changeId, 'tasks.md');

    // UI 相關關鍵字
    const uiKeywords = [
        'index.html', '.html', 'UI', 'ui', '介面', '界面',
        '前端', 'frontend', 'web app', 'webapp', '網頁',
        'calculator', '計算機', 'dashboard', '儀表板'
    ];

    // 檔案路徑模式
    const filePathPattern = /files?:\s*(~?\/[^\s|]+\.html)/i;

    let content = '';
    try {
        if (fs.existsSync(proposalPath)) {
            content += fs.readFileSync(proposalPath, 'utf8');
        }
        if (fs.existsSync(tasksPath)) {
            content += fs.readFileSync(tasksPath, 'utf8');
        }
    } catch (error) {
        return { hasUI: false, deliverablePath: null };
    }

    // 檢查是否包含 UI 關鍵字
    const hasUIKeyword = uiKeywords.some(kw => content.includes(kw));

    // 嘗試提取可交付物路徑
    const pathMatch = content.match(filePathPattern);
    const deliverablePath = pathMatch ? pathMatch[1].replace('~', process.env.HOME) : null;

    return {
        hasUI: hasUIKeyword && deliverablePath !== null,
        deliverablePath
    };
}

/**
 * 檢測成品是否已開啟（透過狀態追蹤）
 */
function detectDeliverableOpened(state) {
    // 如果沒有 UI 產出，視為已完成
    const uiInfo = detectHasUIDeliverable(state);
    if (!uiInfo.hasUI) {
        return true;
    }

    // 檢查狀態中是否記錄已開啟
    return state.completion?.deliverableOpened === true;
}

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
    return null;
}

/**
 * 儲存工作流狀態（原子操作）
 */
function saveState(state) {
    const tempFile = `${CONFIG.STATE_FILE}.${process.pid}.tmp`;
    try {
        const dir = path.dirname(CONFIG.STATE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
        fs.renameSync(tempFile, CONFIG.STATE_FILE);
    } catch (error) {
        try { fs.unlinkSync(tempFile); } catch (e) { /* ignore */ }
    }
}

/**
 * 檢查所有必要收尾動作的完成狀態
 */
function checkCompletionStatus(state) {
    const checklist = getCompletionChecklist(state);
    const results = {};
    let allRequiredDone = true;

    for (const item of checklist) {
        if (item.detect) {
            const done = item.detect(state);
            results[item.id] = done;

            if (item.required && !done) {
                allRequiredDone = false;
            }
        } else {
            // 沒有檢測函數的項目視為完成
            results[item.id] = true;
        }
    }

    return { results, allRequiredDone, checklist };
}

/**
 * 更新收尾狀態到 state
 */
function updateCompletionState(state, completionStatus) {
    state.completion = state.completion || {};
    state.completion.checklist = completionStatus.results;
    state.completion.allRequiredDone = completionStatus.allRequiredDone;
    state.completion.lastCheckedAt = new Date().toISOString();
    saveState(state);
}

/**
 * 🔴 自動執行收尾動作（完全自動化）
 */
function autoExecuteCompletionActions(state, completionStatus) {
    const changeId = state.changeId || 'unknown';
    const { results, checklist } = completionStatus;
    let actionsExecuted = [];

    // 1. 自動 Git Commit
    if (!results.git_commit) {
        try {
            console.log('\n🔄 自動執行：Git Commit...');

            // 先 git add
            execFileSync('git', ['add', '.'], {
                encoding: 'utf8',
                timeout: 30000,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // 再 git commit
            const commitMessage = `feat(${changeId}): 完成實作\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`;
            execFileSync('git', ['commit', '-m', commitMessage], {
                encoding: 'utf8',
                timeout: 30000,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            console.log('✅ Git Commit 完成');
            actionsExecuted.push('git_commit');
            results.git_commit = true;
        } catch (error) {
            // 可能是沒有變更需要提交
            if (error.message.includes('nothing to commit')) {
                console.log('ℹ️ 沒有變更需要提交');
                results.git_commit = true;
            } else {
                console.log(`⚠️ Git Commit 失敗: ${error.message}`);
            }
        }
    }

    // 2. 自動歸檔 OpenSpec（需要 git commit 先完成）
    if (results.git_commit && !results.archive_openspec && changeId !== 'unknown') {
        try {
            console.log('\n🔄 自動執行：歸檔 OpenSpec...');

            const sourcePath = path.join(CONFIG.OPENSPEC_CHANGES, changeId);
            const today = new Date().toISOString().slice(0, 10);
            const archivePath = path.join(CONFIG.OPENSPEC_ARCHIVE, `${today}-${changeId}`);

            if (fs.existsSync(sourcePath)) {
                // 確保 archive 目錄存在
                if (!fs.existsSync(CONFIG.OPENSPEC_ARCHIVE)) {
                    fs.mkdirSync(CONFIG.OPENSPEC_ARCHIVE, { recursive: true });
                }

                // 移動目錄
                fs.renameSync(sourcePath, archivePath);

                console.log(`✅ OpenSpec 已歸檔到 ${archivePath}`);
                actionsExecuted.push('archive_openspec');
                results.archive_openspec = true;
            }
        } catch (error) {
            console.log(`⚠️ 歸檔失敗: ${error.message}`);
        }
    }

    // 3. 自動開啟 UI 成品
    if (!results.open_deliverable) {
        const uiItem = checklist.find(i => i.id === 'open_deliverable');
        if (uiItem && uiItem.deliverablePath) {
            try {
                console.log('\n🔄 自動執行：開啟 UI 成品...');

                execFileSync('open', [uiItem.deliverablePath], {
                    timeout: 5000,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                console.log(`✅ 已開啟 ${uiItem.deliverablePath}`);

                // 記錄已開啟
                state.completion = state.completion || {};
                state.completion.deliverableOpened = true;
                state.completion.deliverableOpenedAt = new Date().toISOString();

                actionsExecuted.push('open_deliverable');
                results.open_deliverable = true;
            } catch (error) {
                console.log(`⚠️ 開啟 UI 失敗: ${error.message}`);
            }
        }
    }

    // 4. 自動清理臨時檔案（可選）
    if (!results.cleanup_temp) {
        try {
            const cleanupPaths = ['__pycache__', '.pytest_cache', 'node_modules/.cache'];
            for (const p of cleanupPaths) {
                const fullPath = path.join(process.cwd(), p);
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                }
            }
            results.cleanup_temp = true;
        } catch (error) {
            // 忽略清理錯誤
        }
    }

    return { actionsExecuted, results };
}

/**
 * 輸出收尾提醒（含狀態檢查）
 */
function outputCompletionReminder(state, completionStatus) {
    const changeId = state.changeId || 'unknown';
    const { results, allRequiredDone, checklist } = completionStatus;

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (allRequiredDone) {
        console.log('✅ 收尾動作已完成 - 可以標記為 DONE');
    } else {
        console.log('🚫 收尾動作未完成 - 正在自動執行...');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Change ID: ${changeId}`);
    console.log('');

    checklist.forEach((item, index) => {
        const done = results[item.id];
        const statusIcon = done ? '✅' : (item.required ? '🔴' : '🟡');
        const statusText = done ? '已完成' : '待執行';

        console.log(`${statusIcon} ${index + 1}. ${item.description} [${statusText}]`);
    });

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n');
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
    const toolOutput = hookInput.tool_output || '';

    // 只在 Task 或 Bash 完成後檢查
    // Bash：可能是執行 git commit 或 mv 指令
    if (toolName !== 'Task' && toolName !== 'Bash') {
        return;
    }

    // 檢查工作流狀態
    const state = loadState();
    if (!state) {
        return;
    }

    // 檢測是否進入 COMPLETING 狀態
    // 1. 狀態本身就是 COMPLETING
    // 2. 或者 TESTER 剛通過最後一個任務
    const isCompleting = state.state === 'COMPLETING';
    const testerJustPassed = toolOutput.toLowerCase().includes('pass') ||
                             toolOutput.includes('通過') ||
                             toolOutput.includes('✅');

    // 檢查是否所有任務都完成（確保值存在且大於 0）
    const hasTaskSync = state.taskSync &&
                        typeof state.taskSync.completed === 'number' &&
                        typeof state.taskSync.totalTasks === 'number' &&
                        state.taskSync.totalTasks > 0;
    const allTasksComplete = hasTaskSync &&
                              state.taskSync.completed === state.taskSync.totalTasks;

    // 當在 COMPLETING 狀態或任務完成時，檢查收尾動作
    if (isCompleting || (testerJustPassed && allTasksComplete)) {
        // 檢查收尾動作完成狀態
        let completionStatus = checkCompletionStatus(state);

        // 🔴 完全自動化：自動執行未完成的收尾動作
        if (!completionStatus.allRequiredDone) {
            const { actionsExecuted, results } = autoExecuteCompletionActions(state, completionStatus);

            // 更新結果
            completionStatus.results = results;
            completionStatus.allRequiredDone = Object.entries(results)
                .filter(([id, _]) => completionStatus.checklist.find(c => c.id === id)?.required)
                .every(([_, done]) => done);

            if (actionsExecuted.length > 0) {
                console.log(`\n🎉 自動執行了 ${actionsExecuted.length} 個收尾動作`);
            }
        }

        // 更新狀態
        updateCompletionState(state, completionStatus);

        // 輸出最終狀態
        outputCompletionReminder(state, completionStatus);

        // 如果全部完成，自動轉換到 DONE
        if (completionStatus.allRequiredDone && state.state === 'COMPLETING') {
            state.previousState = state.state;
            state.state = 'DONE';
            state.timestamps = state.timestamps || {};
            state.timestamps.completedAt = new Date().toISOString();
            saveState(state);
            console.log('\n✅ 工作流已自動完成，狀態轉換為 DONE\n');
        }
    }

    // Bash 執行後重新檢查（可能是 git commit、mv 或 open）
    if (toolName === 'Bash') {
        const toolInput = hookInput.tool_input || {};
        const command = toolInput.command || '';

        // 檢測 open 命令
        if (command.startsWith('open ') || command.includes(' open ')) {
            // 檢查是否開啟了 UI 成品
            const uiInfo = detectHasUIDeliverable(state);
            if (uiInfo.hasUI && command.includes(uiInfo.deliverablePath)) {
                // 記錄已開啟
                state.completion = state.completion || {};
                state.completion.deliverableOpened = true;
                state.completion.deliverableOpenedAt = new Date().toISOString();
                saveState(state);

                console.log('\n✅ UI 成品已開啟，等待用戶驗收\n');
            }
        }

        // 在 COMPLETING 狀態時重新檢查
        if (state.state === 'COMPLETING') {
            const completionStatus = checkCompletionStatus(state);
            updateCompletionState(state, completionStatus);

            if (completionStatus.allRequiredDone) {
                console.log('\n✅ 所有收尾動作已完成！可以標記為 DONE\n');
            }
        }
    }
}

main();
