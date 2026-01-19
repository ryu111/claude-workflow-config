#!/bin/bash
# Loop Continue Reminder Hook
#
# 用途：當用戶在 Loop 運行中輸入訊息時，
#       提醒 AI 這是「插話」而非「取消」，應該繼續 Loop。
#
# 觸發時機：UserPromptSubmit

# 常數定義
LOOP_STATE=".claude/ralph-loop.local.md"
CANCEL_PATTERN="(cancel|取消|停止|stop).*loop|/ralph-loop:cancel"

# 檢查 Loop 是否運行中
if [ -f "$LOOP_STATE" ]; then
    # 讀取用戶輸入（從 stdin，帶錯誤處理）
    INPUT=$(cat 2>/dev/null || echo "{}")

    # 數值驗證：確保 INPUT 不為空
    if [ -z "$INPUT" ]; then
        INPUT="{}"
    fi

    USER_MESSAGE=$(echo "$INPUT" | jq -r '.user_message // ""' 2>/dev/null || echo "")

    # 數值驗證：確保 USER_MESSAGE 被提取成功
    if [ -z "$USER_MESSAGE" ]; then
        USER_MESSAGE=""
    fi

    # 檢查是否是取消指令（使用常數模式）
    if echo "$USER_MESSAGE" | grep -qiE "$CANCEL_PATTERN" 2>/dev/null; then
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
