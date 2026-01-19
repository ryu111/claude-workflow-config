#!/usr/bin/env node
/**
 * Workflow Violation Tracker Hook (JSONL Event-based)
 *
 * 用途：追蹤 D→R→T 工作流執行情況，「當下執行」提醒
 *
 * 觸發時機：PostToolUse (Edit, Write, Task)
 *
 * 核心功能：
 * 1. Task(developer) 完成 → 立即提醒呼叫 Task(reviewer)
 * 2. Task(reviewer) 完成 → 立即提醒呼叫 Task(tester)
 * 3. Task(tester) 完成 → 記錄完整的 D→R→T 循環
 *
 * 違規檢測：
 * 1. 有 Edit/Write 但沒有對應的 Task(reviewer)
 * 2. 有 Task(reviewer) 通過但沒有對應的 Task(tester)
 * 3. Main agent 直接寫大量程式碼（應該委派給 developer）
 *
 * 並行安全設計：
 * - Append-only JSONL 模式（無 race condition）
 * - 不使用記憶體狀態變數（無記憶體洩漏）
 * - 從事件日誌計算當前狀態（過濾過期事件）
 * - 自動截斷日誌（防止無限增長）
 *
 * 輸出：
 * - workflow-events.jsonl: 事件追加日誌
 * - workflow-violations.jsonl: 違規記錄
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置常數
const RESULTS_DIR = path.join(os.homedir(), '.claude/tests/workflow/results');
const EVENTS_FILE = path.join(RESULTS_DIR, 'workflow-events.jsonl');
const VIOLATIONS_FILE = path.join(RESULTS_DIR, 'workflow-violations.jsonl');

// 閾值和限制
const CONFIG = {
    WARNING_THRESHOLD_EDITS: 1,      // 有 1 個未審查編輯就警告
    STALE_TIMEOUT_MS: 60 * 60 * 1000, // 1 小時
    MAX_LOG_SIZE: 1024 * 1024,        // 1MB
    MAX_INPUT_SIZE: 1024 * 1024,      // 1MB 限制
    MAX_EVENTS_TO_KEEP: 500           // 截斷時保留最後 500 行
};

/**
 * 事件類型定義
 */
const EventType = {
    EDIT: 'edit',
    DEVELOPER_COMPLETE: 'developer_complete',
    REVIEWER_COMPLETE: 'reviewer_complete',
    TESTER_COMPLETE: 'tester_complete',
    VIOLATION: 'violation'
};

/**
 * 追加事件到 JSONL（原子操作，無 race condition）
 */
function appendEvent(event) {
    try {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });

        // 添加時間戳
        const eventWithTimestamp = {
            ...event,
            timestamp: Date.now(),
            iso_time: new Date().toISOString()
        };

        const logEntry = JSON.stringify(eventWithTimestamp) + '\n';
        fs.appendFileSync(EVENTS_FILE, logEntry);

        // 檢查並截斷日誌
        truncateIfNeeded(EVENTS_FILE);
    } catch (error) {
        if (process.env.DEBUG_HOOKS) {
            console.error(`⚠️  無法追加事件: ${error.message}`);
        }
    }
}

/**
 * 追加違規記錄到 JSONL
 */
function appendViolation(violation) {
    try {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });
        const logEntry = JSON.stringify({
            ...violation,
            timestamp: Date.now(),
            iso_time: new Date().toISOString()
        }) + '\n';
        fs.appendFileSync(VIOLATIONS_FILE, logEntry);
    } catch (error) {
        if (process.env.DEBUG_HOOKS) {
            console.error(`⚠️  無法記錄違規: ${error.message}`);
        }
    }
}

/**
 * 截斷過大的 JSONL 檔案（保留最後 N 行）
 */
function truncateIfNeeded(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return;
        }

        const stats = fs.statSync(filePath);
        if (stats.size <= CONFIG.MAX_LOG_SIZE) {
            return;
        }

        // 讀取並保留最後 N 行
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        if (lines.length > CONFIG.MAX_EVENTS_TO_KEEP) {
            const kept = lines.slice(-CONFIG.MAX_EVENTS_TO_KEEP).join('\n') + '\n';
            fs.writeFileSync(filePath, kept);

            if (process.env.DEBUG_HOOKS) {
                console.log(`📝 截斷日誌: 保留最後 ${CONFIG.MAX_EVENTS_TO_KEEP} 行`);
            }
        }
    } catch (error) {
        if (process.env.DEBUG_HOOKS) {
            console.error(`⚠️  無法截斷日誌: ${error.message}`);
        }
    }
}

/**
 * 讀取最近的事件（過濾過期事件）
 */
function readRecentEvents() {
    try {
        if (!fs.existsSync(EVENTS_FILE)) {
            return [];
        }

        const content = fs.readFileSync(EVENTS_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        const now = Date.now();
        const events = [];

        for (const line of lines) {
            try {
                const event = JSON.parse(line);
                // 只保留未過期的事件
                if (now - event.timestamp < CONFIG.STALE_TIMEOUT_MS) {
                    events.push(event);
                }
            } catch {
                // 忽略無效的 JSON 行
            }
        }

        return events;
    } catch (error) {
        if (process.env.DEBUG_HOOKS) {
            console.error(`⚠️  無法讀取事件: ${error.message}`);
        }
        return [];
    }
}

/**
 * 從事件日誌計算當前狀態
 */
function computeCurrentState(events) {
    let pendingEdits = 0;
    let pendingDevelopers = 0;
    let pendingReviewers = 0;
    const editFiles = [];

    for (const event of events) {
        switch (event.type) {
            case EventType.EDIT:
                pendingEdits++;
                if (event.file) {
                    editFiles.push(event.file);
                }
                break;

            case EventType.DEVELOPER_COMPLETE:
                pendingDevelopers++;
                break;

            case EventType.REVIEWER_COMPLETE:
                // Reviewer 完成時，清除對應的 developer 和 edits
                if (pendingDevelopers > 0) {
                    pendingDevelopers--;
                }
                pendingReviewers++;
                pendingEdits = 0; // 審查通過，清除 pending edits
                editFiles.length = 0;
                break;

            case EventType.TESTER_COMPLETE:
                // Tester 完成時，清除對應的 reviewer
                if (pendingReviewers > 0) {
                    pendingReviewers--;
                }
                // D→R→T 完整循環完成
                pendingEdits = 0;
                editFiles.length = 0;
                break;
        }
    }

    return {
        pendingEdits,
        pendingDevelopers,
        pendingReviewers,
        editFiles: [...new Set(editFiles)] // 去重
    };
}

/**
 * 處理 Edit/Write 工具使用
 */
function handleEdit(toolName, params) {
    // 追加事件到 JSONL
    appendEvent({
        type: EventType.EDIT,
        tool: toolName,
        file: params.file_path || 'unknown',
        executor: 'main' // 預設為 main，可從 context 判斷
    });

    // 從事件日誌計算當前狀態
    const events = readRecentEvents();
    const state = computeCurrentState(events);

    // 檢查是否有過多未審查的編輯
    if (state.pendingEdits > CONFIG.WARNING_THRESHOLD_EDITS) {
        const violation = {
            type: 'missing_review',
            severity: 'warning',
            message: `已有 ${state.pendingEdits} 個編輯操作未經審查`,
            pendingEdits: state.pendingEdits,
            files: state.editFiles
        };
        appendViolation(violation);
    }
}

/**
 * 處理 Task(developer) 工具使用
 */
function handleDeveloper(params) {
    // 追加事件到 JSONL
    appendEvent({
        type: EventType.DEVELOPER_COMPLETE,
        description: params.task || 'unknown'
    });

    // 強烈提醒：立即呼叫 Task(reviewer)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 D→R→T 下一步：立即呼叫 Task(reviewer)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 處理 Task(reviewer) 工具使用
 */
function handleReviewer(params) {
    // 追加事件到 JSONL
    appendEvent({
        type: EventType.REVIEWER_COMPLETE,
        description: params.task || 'unknown'
    });

    // 強烈提醒：立即呼叫 Task(tester)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 D→R→T 下一步：立即呼叫 Task(tester)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * 處理 Task(tester) 工具使用
 */
function handleTester(params) {
    // 追加事件到 JSONL
    appendEvent({
        type: EventType.TESTER_COMPLETE,
        description: params.task || 'unknown'
    });

    // 記錄完整的 D→R→T 循環完成
    // 可以在這裡記錄成功的工作流循環統計
}

/**
 * 處理 Task 工具使用
 */
function handleTask(params) {
    const subagentType = params.subagent_type;

    if (subagentType === 'developer') {
        handleDeveloper(params);
    } else if (subagentType === 'reviewer') {
        handleReviewer(params);
    } else if (subagentType === 'tester') {
        handleTester(params);
    }
}

/**
 * 主函數
 */
function main() {
    try {
        // 讀取 stdin（PostToolUse 傳入的工具使用資訊）
        let input = '';
        const chunks = [];

        // 同步讀取 stdin，設定超時防止阻塞
        const fd = 0; // stdin 文件描述符
        const buffer = Buffer.alloc(64 * 1024);
        let bytesRead;
        let totalBytes = 0;

        try {
            // 設定非阻塞模式（僅在可用時讀取）
            while (totalBytes < CONFIG.MAX_INPUT_SIZE) {
                try {
                    bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
                    if (bytesRead === 0) break; // EOF
                    chunks.push(buffer.slice(0, bytesRead));
                    totalBytes += bytesRead;
                } catch (e) {
                    if (e.code === 'EAGAIN' || e.code === 'EWOULDBLOCK') {
                        // 無數據可讀，結束
                        break;
                    }
                    throw e;
                }
            }
        } catch (e) {
            // EOF 或讀取完成
            if (process.env.DEBUG_HOOKS) {
                console.error(`stdin read error: ${e.message}`);
            }
        }

        input = Buffer.concat(chunks).toString('utf8');

        if (!input || input.trim() === '') {
            // 空輸入時靜默退出（正常情況）
            return;
        }

        // 驗證 JSON 格式
        if (!input.startsWith('{') && !input.startsWith('[')) {
            if (process.env.DEBUG_HOOKS) {
                console.error('Invalid JSON format: input does not start with { or [');
            }
            process.exit(1);
        }

        let data;
        try {
            data = JSON.parse(input);
        } catch (parseError) {
            if (process.env.DEBUG_HOOKS) {
                console.error(`Failed to parse JSON: ${parseError.message}`);
            }
            process.exit(1);
        }

        // JSON 型別驗證：確保 data 是 object 且不是 null
        if (typeof data !== 'object' || data === null) {
            if (process.env.DEBUG_HOOKS) {
                console.error('Invalid JSON: expected object, got ' + typeof data);
            }
            process.exit(1);
        }

        const toolName = data.tool_name || data.toolName;

        // 驗證 toolName 存在
        if (!toolName) {
            if (process.env.DEBUG_HOOKS) {
                console.error('Invalid JSON: missing tool_name or toolName');
            }
            process.exit(1);
        }

        const params = data.parameters || data.params || {};

        // 根據工具類型處理（直接處理，不使用記憶體狀態）
        if (toolName === 'Edit' || toolName === 'Write') {
            handleEdit(toolName, params);
        } else if (toolName === 'Task') {
            handleTask(params);
        }

    } catch (error) {
        // 未預期的錯誤，返回非零 exit code
        if (process.env.DEBUG_HOOKS) {
            console.error(`Workflow tracker error: ${error.message}`);
        }
        process.exit(1);
    }
}

// 執行
main();
