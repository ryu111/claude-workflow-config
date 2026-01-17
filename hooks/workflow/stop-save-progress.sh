#!/bin/bash
# Stop Hook - Session 停止時記錄狀態
#
# 用途：當 session 被停止時（無論是正常結束還是異常），
#       記錄停止時間到 loop 狀態檔案，方便追蹤和恢復。

LOOP_STATE=".claude/ralph-loop.local.md"

# 只在有 Loop 運行時才記錄
if [ -f "$LOOP_STATE" ]; then
    # 追加停止記錄
    echo "" >> "$LOOP_STATE"
    echo "## Stop Event" >> "$LOOP_STATE"
    echo "- Time: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOOP_STATE"

    # 輸出 systemMessage
    cat << 'EOF'
{
  "systemMessage": "📊 Session 結束 - Loop 進度已記錄"
}
EOF
fi
