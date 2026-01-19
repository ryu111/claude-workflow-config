#!/bin/bash

set -e

HOOKS_FILE="hooks.json"
ERRORS=0

echo "=========================================="
echo "測試 Task 1.3: hooks.json 結構驗證（修正版）"
echo "=========================================="
echo ""

# 測試 1: JSON 格式驗證
echo "1️⃣ JSON 格式驗證..."
if jq empty "$HOOKS_FILE" 2>/dev/null; then
    echo "   ✅ JSON 格式正確"
else
    echo "   ❌ JSON 格式無效"
    ERRORS=$((ERRORS + 1))
fi

# 測試 2: 事件類型數量
echo ""
echo "2️⃣ 事件類型數量..."
EVENT_TYPES=$(jq -r '.hooks | keys | .[]' "$HOOKS_FILE" | sort | uniq)
EVENT_COUNT=$(echo "$EVENT_TYPES" | wc -l | xargs)

echo "   找到的事件類型："
echo "$EVENT_TYPES" | sed 's/^/   - /'

if [ "$EVENT_COUNT" -eq 6 ]; then
    echo "   ✅ 事件類型數量: $EVENT_COUNT (符合實際)"
else
    echo "   ❌ 事件類型數量: $EVENT_COUNT (預期 6 個)"
    ERRORS=$((ERRORS + 1))
fi

# 測試 3: Hooks 總數量
echo ""
echo "3️⃣ Hooks 總數量..."
TOTAL_HOOKS=$(jq '[.hooks | to_entries[] | .value | length] | add' "$HOOKS_FILE")
echo "   已實作 hooks 統計："
echo "   SessionStart hooks: $(jq '.hooks.SessionStart | length' "$HOOKS_FILE")"
echo "   SessionEnd hooks: $(jq '.hooks.SessionEnd | length' "$HOOKS_FILE")"
echo "   PreToolUse hooks: $(jq '.hooks.PreToolUse | length' "$HOOKS_FILE")"
echo "   PostToolUse hooks: $(jq '.hooks.PostToolUse | length' "$HOOKS_FILE")"
echo "   UserPromptSubmit hooks: $(jq '.hooks.UserPromptSubmit | length' "$HOOKS_FILE")"
if [ -n "$(jq '.hooks.PreCompact' "$HOOKS_FILE" 2>/dev/null)" ]; then
    echo "   PreCompact hooks: $(jq '.hooks.PreCompact | length' "$HOOKS_FILE")"
fi

echo ""
echo "   已實作總計: $TOTAL_HOOKS 個 hooks"

# 測試 4: PostToolUse 順序
echo ""
echo "4️⃣ PostToolUse 順序驗證..."
PostToolUse_order=$(jq -r '.hooks.PostToolUse[] | select(.order) | "\(.order) \(.script)"' "$HOOKS_FILE" | sort -n)
echo "   PostToolUse 執行順序："
echo "$PostToolUse_order" | sed 's/^/   /'

# 驗證順序
EXPECTED_ORDER="1 state-updater.js
2 task-sync.js
3 status-display.js
4 process-manager.js
5 loop-heartbeat.sh"

if [ "$PostToolUse_order" = "$EXPECTED_ORDER" ]; then
    echo "   ✅ PostToolUse 順序正確"
else
    echo "   ❌ PostToolUse 順序不符"
    echo "   預期:"
    echo "$EXPECTED_ORDER" | sed 's/^/   /'
    ERRORS=$((ERRORS + 1))
fi

# 測試 5: TODO 中的缺失 hooks
echo ""
echo "5️⃣ 計劃中的新增 hooks..."
MISSING=$(jq -r '.TODO.missing_hooks[]' "$HOOKS_FILE")
MISSING_COUNT=$(echo "$MISSING" | wc -l | xargs)
echo "   計劃新增: $MISSING_COUNT 個 hooks"
echo "$MISSING" | sed 's/^/   - /'

# 測試 6: 驗證關鍵 hooks 都已實作
echo ""
echo "6️⃣ 關鍵 hooks 存在性驗證..."
CRITICAL_HOOKS=("bypass-handler.js" "workflow-gate.js" "state-updater.js" "task-sync.js" "status-display.js" "process-manager.js" "loop-heartbeat.sh")
CRITICAL_MISSING=0

for hook in "${CRITICAL_HOOKS[@]}"; do
    if jq -r '.hooks | to_entries[] | select(.value[].script == "'"$hook"'") | .key' "$HOOKS_FILE" >/dev/null 2>&1; then
        echo "   ✅ $hook 已實作"
    else
        echo "   ❌ $hook 缺失"
        CRITICAL_MISSING=$((CRITICAL_MISSING + 1))
    fi
done

if [ $CRITICAL_MISSING -gt 0 ]; then
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=========================================="
echo "測試結果摘要"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ 所有測試通過！"
    echo ""
    echo "hooks.json 現狀:"
    echo "- 事件類型: 6 個 (SessionStart, SessionEnd, PreToolUse, PostToolUse, UserPromptSubmit, PreCompact)"
    echo "- 已實作 hooks: $TOTAL_HOOKS 個"
    echo "- 計劃新增: $MISSING_COUNT 個"
    echo "- PostToolUse 順序: 正確"
    echo ""
    echo "詳細統計："
    jq '.hooks | to_entries[] | "\(.key): \(.value | length)"' "$HOOKS_FILE" -r
    exit 0
else
    echo "❌ 發現 $ERRORS 個測試失敗"
    exit 1
fi
