#!/bin/bash
# Loop Continue Reminder Hook
#
# 用途：當用戶在 Loop 運行中輸入訊息時，
#       提醒 AI 這是「插話」而非「取消」，應該繼續 Loop。
#
# 觸發時機：UserPromptSubmit

LOOP_STATE=".claude/ralph-loop.local.md"

# 檢查 Loop 是否運行中
if [ -f "$LOOP_STATE" ]; then
    # 讀取用戶輸入（從 stdin）
    INPUT=$(cat)
    USER_MESSAGE=$(echo "$INPUT" | jq -r '.user_message // ""' 2>/dev/null || echo "")

    # 檢查是否是取消指令（用戶說只用指令取消）
    # 常見取消指令：/ralph-loop:cancel-ralph, /cancel, stop loop 等
    if echo "$USER_MESSAGE" | grep -qiE "(cancel|取消|停止|stop).*loop|/ralph-loop:cancel"; then
        # 這是取消指令，不提醒
        exit 0
    fi

    # 這是插話，輸出提醒
    cat << 'EOF'
{
  "systemMessage": "📢 Loop 運行中 - 用戶插話。處理完用戶訊息後，請繼續執行 Loop 中的待處理任務。"
}
EOF
fi
