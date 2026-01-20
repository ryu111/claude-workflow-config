#!/usr/bin/env node

/**
 * Claude Code PermissionRequest Hook
 * 自動核准非破壞性 MCP 工具
 *
 * 此 Hook 攔截權限請求，自動核准唯讀操作
 * （具有 readOnlyHint 或沒有 destructiveHint 的工具），
 * 減少安全操作的手動確認需求。
 *
 * 更新：2026-01-09 - 配置載入、模式匹配修正
 * 建立：2026-01-08
 * 相關：MCP Tool Annotations (readOnlyHint, destructiveHint)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 預設破壞性模式（總是需要確認）
const DEFAULT_DESTRUCTIVE_PATTERNS = [
    'delete',      // 刪除
    'remove',      // 移除
    'destroy',     // 銷毀
    'drop',        // 丟棄
    'clear',       // 清除
    'wipe',        // 抹除
    'purge',       // 清理
    'forget',      // 遺忘
    'erase',       // 擦除
    'reset',       // 重置
    'update',      // 更新（可能具破壞性）
    'modify',      // 修改
    'edit',        // 編輯
    'change',      // 變更
    'write',       // 寫入（可能覆蓋）
    'create',      // 建立（可能建立不需要的資源）
    'deploy',      // 部署
    'publish',     // 發布
    'execute',     // 執行（程式碼執行可能危險）
    'run',         // 執行
    'eval',        // 評估
    'consolidate'  // 合併（修改記憶）
];

// 預設安全唯讀模式（可自動核准）
const DEFAULT_SAFE_PATTERNS = [
    'get',            // 取得
    'list',           // 列出
    'read',           // 讀取
    'retrieve',       // 擷取
    'fetch',          // 獲取
    'search',         // 搜尋
    'find',           // 尋找
    'query',          // 查詢
    'recall',         // 回憶
    'check',          // 檢查
    'status',         // 狀態
    'health',         // 健康檢查
    'stats',          // 統計
    'analyze',        // 分析
    'view',           // 檢視
    'show',           // 顯示
    'describe',       // 描述
    'inspect',        // 檢查
    'store',          // 儲存（僅新增，不刪除）
    'remember',       // 記住（僅新增）
    'ingest',         // 匯入文件（新增性質）
    'rate',           // 評分記憶（非破壞性）
    'proactive',      // 主動式上下文（類似讀取）
    'context',        // 上下文擷取
    'summary',        // 摘要擷取
    'recommendations' // 建議（唯讀）
];

// 配置狀態（啟動時載入）
let config = {
    enabled: true,
    autoApprove: true,
    logDecisions: false,
    destructivePatterns: DEFAULT_DESTRUCTIVE_PATTERNS,
    safePatterns: DEFAULT_SAFE_PATTERNS
};

/**
 * 從 ~/.claude/hooks/config.json 載入配置
 * 將自訂模式與內建預設合併
 */
function loadConfiguration() {
    try {
        const configPath = path.join(os.homedir(), '.claude', 'hooks', 'config.json');

        if (!fs.existsSync(configPath)) {
            // 沒有配置檔案，使用預設值
            return;
        }

        const configData = fs.readFileSync(configPath, 'utf8');
        const fullConfig = JSON.parse(configData);

        if (!fullConfig.permissionRequest) {
            // 沒有 permissionRequest 區段，使用預設值
            return;
        }

        const hookConfig = fullConfig.permissionRequest;

        // 載入旗標（帶預設值）
        config.enabled = hookConfig.enabled !== undefined ? hookConfig.enabled : true;
        config.autoApprove = hookConfig.autoApprove !== undefined ? hookConfig.autoApprove : true;
        config.logDecisions = hookConfig.logDecisions !== undefined ? hookConfig.logDecisions : false;

        // 將自訂模式與預設合併
        if (hookConfig.customSafePatterns && Array.isArray(hookConfig.customSafePatterns)) {
            config.safePatterns = [...DEFAULT_SAFE_PATTERNS, ...hookConfig.customSafePatterns];
        }

        if (hookConfig.customDestructivePatterns && Array.isArray(hookConfig.customDestructivePatterns)) {
            config.destructivePatterns = [...DEFAULT_DESTRUCTIVE_PATTERNS, ...hookConfig.customDestructivePatterns];
        }

        if (config.logDecisions) {
            console.error('[PermissionRequest] 配置載入成功');
            console.error(`  - 啟用: ${config.enabled}`);
            console.error(`  - 自動核准: ${config.autoApprove}`);
            console.error(`  - 安全模式數: ${config.safePatterns.length}`);
            console.error(`  - 破壞性模式數: ${config.destructivePatterns.length}`);
        }

    } catch (error) {
        // 發生錯誤時，回退到預設值
        console.error(`[PermissionRequest] 載入配置失敗: ${error.message}`);
        console.error('[PermissionRequest] 使用預設模式');
    }
}

// 模組初始化時載入配置
loadConfiguration();

/**
 * Hook 主進入點
 * 透過 stdin 接收 JSON，處理權限請求，回傳決定
 */
async function main() {
    try {
        // 檢查 Hook 是否啟用
        if (!config.enabled) {
            if (config.logDecisions) {
                console.error('[PermissionRequest] Hook 已停用，提示用戶');
            }
            outputDecision('prompt');
            return;
        }

        // 讀取 stdin 輸入
        const input = await readStdin();
        const payload = JSON.parse(input);

        // 檢查是否為 MCP 工具呼叫
        if (isMCPToolCall(payload)) {
            const toolName = extractToolName(payload);

            // 檢查自動核准是否停用
            if (!config.autoApprove) {
                if (config.logDecisions) {
                    console.error('[PermissionRequest] 自動核准已停用，提示用戶');
                }
                outputDecision('prompt');
                return;
            }

            // 檢查工具是否安全（非破壞性）
            if (isSafeTool(toolName)) {
                // 自動核准安全工具
                if (config.logDecisions) {
                    console.error(`[PermissionRequest] 自動核准: ${toolName}`);
                }
                outputDecision('allow', {
                    reason: `自動核准安全工具: ${toolName}`,
                    auto_approved: true,
                    server: payload.server_name,
                    tool_name: toolName
                });
            } else {
                // 潛在破壞性工具需要確認
                if (config.logDecisions) {
                    console.error(`[PermissionRequest] 提示確認: ${toolName}`);
                }
                outputDecision('prompt');
            }
        } else {
            // 非 MCP 工具呼叫，顯示一般對話框
            outputDecision('prompt');
        }
    } catch (error) {
        // 發生錯誤時，回退到提示用戶
        console.error('[PermissionRequest Hook] 錯誤:', error.message);
        outputDecision('prompt');
    }
}

/**
 * 檢查 payload 是否為 MCP 工具呼叫
 */
function isMCPToolCall(payload) {
    return payload && (
        payload.hook_event_name === 'PermissionRequest' ||
        payload.type === 'mcp_tool_call' ||
        (payload.tool_name && payload.server_name)
    );
}

/**
 * 從 payload 提取乾淨的工具名稱（移除 mcp__ 前綴）
 * 保留大小寫以供 isSafeTool() 中的 camelCase 偵測
 */
function extractToolName(payload) {
    let toolName = payload.tool_name || '';

    // 移除 mcp__servername__ 前綴（如果存在）
    // 範例：mcp__memory__retrieve_memory -> retrieve_memory
    //       mcp__shodh-cloudflare__recall -> recall
    //       mcp__my_custom_server__get_data -> get_data
    // 使用非貪婪匹配處理包含底線的伺服器名稱
    const mcpPrefix = /^mcp__.+?__/;
    toolName = toolName.replace(mcpPrefix, '');

    return toolName; // 保留大小寫以供 camelCase 偵測
}

/**
 * 根據命名模式檢查工具是否安全（非破壞性）
 * 使用字詞邊界正則防止誤匹配
 * 處理底線、連字號和 camelCase 作為字詞分隔符
 * 範例：
 *   - "get_updated_records" → ["get", "updated", "records"]
 *   - "statusCheck" → ["status", "check"]
 *   - "GetData" → ["get", "data"]
 */
function isSafeTool(toolName) {
    if (!toolName) {
        return false;
    }

    // 依底線、連字號和 camelCase 邊界分割工具名稱
    // 先在大寫字母前插入分隔符，再分割
    const withSeparators = toolName.replace(/([a-z])([A-Z])/g, '$1_$2');
    const parts = withSeparators.toLowerCase().split(/[_-]/);

    // 第一次檢查：是否有任何部分完全匹配破壞性模式？
    for (const pattern of config.destructivePatterns) {
        if (parts.includes(pattern)) {
            return false; // 破壞性 - 需要確認
        }
    }

    // 第二次檢查：是否有任何部分完全匹配安全模式？
    for (const pattern of config.safePatterns) {
        if (parts.includes(pattern)) {
            return true; // 安全 - 自動核准
        }
    }

    // 未知模式 - 需要確認（較安全的預設值）
    return false;
}

/**
 * 以 Claude Code Hook 格式輸出決定
 */
function outputDecision(behavior, metadata = {}) {
    const decision = {
        hookSpecificOutput: {
            hookEventName: 'PermissionRequest',
            decision: {
                behavior: behavior  // 'allow'、'deny' 或 'prompt'
            }
        }
    };

    // 如有提供 metadata 則加入（用於記錄/除錯）
    if (Object.keys(metadata).length > 0 && behavior !== 'prompt') {
        decision.hookSpecificOutput.metadata = metadata;
    }

    console.log(JSON.stringify(decision));
}

/**
 * 從 stdin 讀取所有資料
 */
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';

        process.stdin.setEncoding('utf8');

        process.stdin.on('readable', () => {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                data += chunk;
            }
        });

        process.stdin.on('end', () => {
            resolve(data);
        });

        process.stdin.on('error', (error) => {
            reject(error);
        });

        // 1 秒後逾時
        setTimeout(() => {
            if (data.length === 0) {
                reject(new Error('讀取 stdin 逾時'));
            }
        }, 1000);
    });
}

// 執行主函數
main().catch(error => {
    console.error('[PermissionRequest Hook] 致命錯誤:', error);
    outputDecision('prompt');
    process.exit(1);
});
