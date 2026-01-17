#!/bin/bash
# Loop Heartbeat Hook
#
# 用途：定期更新 Loop 狀態檔案的時間戳，
#       即使 session 突然斷線，也能知道最後活動時間。
#
# 觸發時機：PostToolUse (Edit, Write, Bash)

LOOP_STATE=".claude/ralph-loop.local.md"
HEARTBEAT_FILE=".claude/ralph-loop-heartbeat.txt"

# 只在有 Loop 運行時才記錄
if [ -f "$LOOP_STATE" ]; then
    # 更新 heartbeat 時間戳
    echo "$(date '+%Y-%m-%d %H:%M:%S')" > "$HEARTBEAT_FILE"
fi
