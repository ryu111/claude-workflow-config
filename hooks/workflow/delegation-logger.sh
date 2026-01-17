#!/bin/bash
# Delegation Logger Hook
#
# 用途：記錄所有 Task 工具呼叫，用於分析委派決策
#
# 觸發時機：PreToolUse (Task)
#
# 輸出：追加到 ~/.claude/tests/workflow/results/delegation.log

LOG_FILE="$HOME/.claude/tests/workflow/results/delegation.log"
mkdir -p "$(dirname "$LOG_FILE")"

# 讀取 stdin
INPUT=$(cat)

# 提取資訊
TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)
SUBAGENT_TYPE=$(echo "$INPUT" | grep -oE '"subagent_type"\s*:\s*"[^"]*"' | sed 's/.*"subagent_type"[[:space:]]*:[[:space:]]*"//;s/"$//')
PROMPT=$(echo "$INPUT" | grep -oE '"prompt"\s*:\s*"[^"]*"' | sed 's/.*"prompt"[[:space:]]*:[[:space:]]*"//;s/"$//' | head -c 100)

# 記錄到日誌
if [ -n "$SUBAGENT_TYPE" ]; then
    echo "{\"timestamp\": \"$TIMESTAMP\", \"agent\": \"$SUBAGENT_TYPE\", \"prompt_preview\": \"$PROMPT...\"}" >> "$LOG_FILE"
fi
