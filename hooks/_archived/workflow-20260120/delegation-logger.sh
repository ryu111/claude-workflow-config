#!/bin/bash
# Delegation Logger Hook
#
# 用途：記錄所有 Task 工具呼叫，用於分析委派決策
#
# 觸發時機：PreToolUse (Task)
#
# 輸出：追加到 ~/.claude/logs/workflow/delegation.log

# 常數定義
LOG_FILE="$HOME/.claude/logs/workflow/delegation.log"
PROMPT_PREVIEW_LENGTH=100

mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || exit 0

# 讀取 stdin（帶錯誤處理）
INPUT=$(cat 2>/dev/null || echo "{}")

# 數值驗證：確保 INPUT 不為空
if [ -z "$INPUT" ]; then
    exit 0
fi

# 提取資訊
TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S 2>/dev/null || echo "unknown")
SUBAGENT_TYPE=$(echo "$INPUT" | grep -oE '"subagent_type"\s*:\s*"[^"]*"' 2>/dev/null | sed 's/.*"subagent_type"[[:space:]]*:[[:space:]]*"//;s/"$//' || echo "")
PROMPT=$(echo "$INPUT" | grep -oE '"prompt"\s*:\s*"[^"]*"' 2>/dev/null | sed 's/.*"prompt"[[:space:]]*:[[:space:]]*"//;s/"$//' | head -c "$PROMPT_PREVIEW_LENGTH" || echo "")

# 數值驗證
if [ -z "$SUBAGENT_TYPE" ]; then
    exit 0
fi

# 記錄到日誌（帶錯誤處理）
if [ -n "$SUBAGENT_TYPE" ]; then
    echo "{\"timestamp\": \"$TIMESTAMP\", \"agent\": \"$SUBAGENT_TYPE\", \"prompt_preview\": \"$PROMPT...\"}" >> "$LOG_FILE" 2>/dev/null || true
fi
