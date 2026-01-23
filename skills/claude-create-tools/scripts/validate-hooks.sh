#!/bin/bash
# validate-hooks.sh - 驗證 Hooks 配置
# 用法: validate-hooks.sh <settings.json 或 hooks.json>

HOOKS_FILE="$1"

if [ -z "$HOOKS_FILE" ]; then
    echo "用法: validate-hooks.sh <settings.json 或 hooks.json>"
    exit 1
fi

echo "🔍 驗證 Hooks: $HOOKS_FILE"
ERRORS=0
WARNINGS=0

# 1. 檢查檔案存在
if [ ! -f "$HOOKS_FILE" ]; then
    echo "❌ 檔案不存在: $HOOKS_FILE"
    exit 1
fi

# 2. 檢查 JSON 格式有效
if ! jq empty "$HOOKS_FILE" 2>/dev/null; then
    echo "❌ 不是有效的 JSON"
    ERRORS=$((ERRORS + 1))
    echo ""
    echo "❌ Hooks 驗證失敗：$ERRORS 個錯誤"
    exit 1
fi

echo "✓ JSON 格式有效"

# 3. 檢查 hooks 物件存在
if ! jq -e '.hooks' "$HOOKS_FILE" > /dev/null 2>&1; then
    echo "⚠️  未找到 hooks 物件（可能是空配置或其他配置文件）"
    echo ""
    echo "✅ 驗證完成（無 hooks 配置）"
    exit 0
fi

# 4. 驗證事件類型
VALID_EVENTS="PreToolUse PostToolUse PermissionRequest UserPromptSubmit SessionStart SessionEnd Stop SubagentStop PreCompact Setup Notification"

EVENTS=$(jq -r '.hooks | keys[]' "$HOOKS_FILE" 2>/dev/null)
for event in $EVENTS; do
    if echo "$VALID_EVENTS" | grep -qw "$event"; then
        echo "✓ 事件類型: $event"
    else
        echo "⚠️  未知的事件類型: $event"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# 5. 檢查每個 hook 配置
while IFS= read -r line; do
    if [ -n "$line" ]; then
        echo "$line"
        if [[ "$line" == "❌"* ]]; then
            ERRORS=$((ERRORS + 1))
        fi
    fi
done < <(jq -r '.hooks | to_entries[] | .key as $event | .value[] |
    if .hooks then
        .hooks[] |
        if .type == "command" and (.command == null or .command == "") then
            "❌ \($event): command hook 缺少 command"
        elif .type == "prompt" and (.prompt == null or .prompt == "") then
            "❌ \($event): prompt hook 缺少 prompt"
        elif .type == "command" then
            "✓ \($event): command hook"
        elif .type == "prompt" then
            "✓ \($event): prompt hook"
        else
            "⚠️ \($event): 未知的 hook type: \(.type)"
        end
    else
        empty
    end
' "$HOOKS_FILE" 2>/dev/null)

# 6. 檢查 matcher 格式
while IFS= read -r line; do
    if [ -n "$line" ]; then
        echo "$line"
        if [[ "$line" == "❌"* ]]; then
            ERRORS=$((ERRORS + 1))
        fi
    fi
done < <(jq -r '.hooks | to_entries[] | .key as $event | .value[] |
    if .matcher then
        if (.matcher | type) != "string" then
            "❌ \($event): matcher 必須是字串，但得到 \(.matcher | type)"
        else
            "✓ \($event): matcher = \(.matcher)"
        end
    else
        empty
    end
' "$HOOKS_FILE" 2>/dev/null)

# 7. 檢查腳本是否存在（如果是本地路徑）
while IFS= read -r cmd; do
    if [ -n "$cmd" ]; then
        # 展開 ~ 和 $HOME
        EXPANDED_CMD=$(echo "$cmd" | sed "s|~|$HOME|g" | sed "s|\$HOME|$HOME|g")

        # 只檢查絕對路徑或相對路徑的腳本
        if [[ "$EXPANDED_CMD" == /* ]] || [[ "$EXPANDED_CMD" == ./* ]]; then
            if [ ! -f "$EXPANDED_CMD" ]; then
                echo "⚠️  腳本可能不存在: $cmd"
                WARNINGS=$((WARNINGS + 1))
            elif [ ! -x "$EXPANDED_CMD" ]; then
                echo "⚠️  腳本可能沒有執行權限: $cmd"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    fi
done < <(jq -r '.hooks | .[][] | .hooks[]? | select(.type == "command") | .command' "$HOOKS_FILE" 2>/dev/null)

# 8. 總結
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Hooks 驗證通過"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Hooks 驗證通過，但有 $WARNINGS 個警告"
    exit 0
else
    echo "❌ Hooks 驗證失敗：$ERRORS 個錯誤，$WARNINGS 個警告"
    exit 1
fi
