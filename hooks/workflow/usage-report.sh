#!/bin/bash
# SessionEnd Hook - 產生用量報告
# 在每次 session 結束時顯示簡要用量統計

USAGE_MONITOR="$HOME/.claude/hooks/utilities/usage-monitor.sh"

if [ -f "$USAGE_MONITOR" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    "$USAGE_MONITOR" today
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi
