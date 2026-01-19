#!/bin/bash
# Remind to call REVIEWER and TESTER after code changes
# This hook is triggered after Edit/Write operations

# 常數
STATE_FILE="$HOME/.claude/logs/workflow/workflow-state.json"
WARNING_THRESHOLD_HEAVY=3
WARNING_THRESHOLD_LIGHT=1

# 讀取當前狀態
PENDING_EDITS="0"

if [ -f "$STATE_FILE" ]; then
    # 確保 pendingEdits 是陣列，才取長度
    PENDING_EDITS=$(jq -r 'if (.pendingEdits | type) == "array" then .pendingEdits | length else "0" end' "$STATE_FILE" 2>/dev/null || echo "0")
fi

# 驗證是否為數字（額外安全檢查）
if ! [[ "$PENDING_EDITS" =~ ^[0-9]+$ ]]; then
    PENDING_EDITS=0
fi

# 根據待審查數量調整提醒強度
if [ "$PENDING_EDITS" -ge "$WARNING_THRESHOLD_HEAVY" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚨 D→R→T 違規警告：已有 ${PENDING_EDITS} 個編輯未經審查！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⛔ 立即執行："
    echo "   1. Task(reviewer) 審查程式碼"
    echo "   2. Task(tester) 執行測試"
    echo ""
elif [ "$PENDING_EDITS" -ge "$WARNING_THRESHOLD_LIGHT" ]; then
    echo ""
    echo "⚠️  D→R→T 提醒：已有 ${PENDING_EDITS} 個編輯待審查，記得執行 R→T"
    echo ""
fi
