#!/bin/bash
# Fix-on-Discovery Hook
#
# 用途：檢測類型檢查/lint 工具的錯誤輸出，強制提醒「發現即修復」規則
#
# 觸發時機：PostToolUse (Bash)
#
# 原理：
# - 讀取 stdin 中的 JSON（包含 tool_input 和 tool_response）
# - 檢測是否為類型檢查/lint 工具
# - 如果有錯誤輸出，發送 systemMessage 提醒修復

# 讀取 stdin
INPUT=$(cat)

# 提取 tool_input.command（處理有無空格的 JSON 格式）
COMMAND=$(echo "$INPUT" | grep -oE '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"//;s/"$//')

# 檢測是否為類型檢查/lint 工具
if echo "$COMMAND" | grep -qE "(pyright|mypy|tsc|eslint|biome|ruff)"; then
    # 提取 tool_response.stdout（處理有無空格的 JSON 格式）
    STDOUT=$(echo "$INPUT" | grep -oE '"stdout"\s*:\s*"[^"]*"' | sed 's/.*"stdout"[[:space:]]*:[[:space:]]*"//;s/"$//' | sed 's/\\n/\n/g')

    # 檢測是否有真正的錯誤（排除 "0 errors" 這種情況）
    # 匹配模式：
    # - "error:" 或 "Error:" (pyright/tsc 格式)
    # - "✗" 或 "✖" (一些工具的失敗標記)
    # - "[1-9][0-9]* error" (有數字的錯誤計數，排除 0)
    if echo "$STDOUT" | grep -qE "(error:|Error:|✗|✖|[1-9][0-9]* error)"; then
        # 計算錯誤數量
        ERROR_COUNT=$(echo "$STDOUT" | grep -cE "(error:|Error:)" || echo "?")

        # 發送提醒
        cat << EOF
{
  "systemMessage": "⚠️ 發現 ${ERROR_COUNT} 個類型/lint 錯誤。\n\n🔴 Core Rule #2: 發現問題即修復，不分任務範圍\n❌「不是我的 bug」 ❌「預存在問題」 ❌「不在範圍」\n\n請立即修復這些錯誤，不要跳過。"
}
EOF
    fi
fi
