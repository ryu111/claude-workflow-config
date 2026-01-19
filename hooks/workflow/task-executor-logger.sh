#!/bin/bash
# Task Executor Logger Hook
#
# 用途：記錄所有 Task 工具呼叫的詳細資訊
#
# 觸發時機：PreToolUse (Task)
#
# 輸出：追加到 ~/.claude/logs/workflow/task-execution.jsonl

LOG_FILE="$HOME/.claude/logs/workflow/task-execution.jsonl"
mkdir -p "$(dirname "$LOG_FILE")"

# 常數定義（防止 Magic Number）
PROMPT_PREVIEW_LENGTH=200
STDIN_TIMEOUT_SECONDS=2

# 讀取 stdin（跨平台實現，支援 macOS 和 Linux）
# 使用 perl 實現 timeout，相比 timeout 命令更便攜
INPUT=$(perl -e '
    use IO::Select;
    my $sel = IO::Select->new(\*STDIN);
    if ($sel->can_read('$STDIN_TIMEOUT_SECONDS')) {
        my $line;
        while (<>) {
            $line .= $_;
        }
        print $line;
    }
' 2>/dev/null || echo "")

# 若無輸入則提前退出
if [ -z "$INPUT" ]; then
    exit 0
fi

# 提取資訊
TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)
SUBAGENT_TYPE=$(echo "$INPUT" | grep -oE '"subagent_type"\s*:\s*"[^"]*"' | sed 's/.*"subagent_type"[[:space:]]*:[[:space:]]*"//;s/"$//')
PROMPT=$(echo "$INPUT" | grep -oE '"prompt"\s*:\s*"[^"]*"' | sed 's/.*"prompt"[[:space:]]*:[[:space:]]*"//;s/"$//' | head -c "$PROMPT_PREVIEW_LENGTH")

# 判斷執行者（Main 或 Subagent）
# 簡化版本：如果有 $CLAUDE_AGENT_TYPE 環境變數則為 subagent
if [ -n "$CLAUDE_AGENT_TYPE" ]; then
    # 數值驗證：確保 CLAUDE_AGENT_TYPE 不包含特殊字元
    SAFE_AGENT_TYPE=$(echo "$CLAUDE_AGENT_TYPE" | tr -cd '[:alnum:]_-')
    EXECUTOR="subagent:$SAFE_AGENT_TYPE"
else
    EXECUTOR="main"
fi

# 記錄到 JSONL
if [ -n "$SUBAGENT_TYPE" ]; then
    # 使用 jq 建立 JSON（如果有的話）
    if command -v jq &> /dev/null; then
        jq -n \
            --arg timestamp "$TIMESTAMP" \
            --arg executor "$EXECUTOR" \
            --arg subagent "$SUBAGENT_TYPE" \
            --arg prompt "$PROMPT" \
            '{
                timestamp: $timestamp,
                executor: $executor,
                subagent_type: $subagent,
                prompt_preview: $prompt
            }' >> "$LOG_FILE"
    else
        # 簡易版本
        echo "{\"timestamp\": \"$TIMESTAMP\", \"executor\": \"$EXECUTOR\", \"subagent_type\": \"$SUBAGENT_TYPE\", \"prompt_preview\": \"$PROMPT...\"}" >> "$LOG_FILE"
    fi
fi
