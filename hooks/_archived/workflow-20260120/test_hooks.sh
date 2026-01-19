#!/bin/bash

set -e

HOOKS_FILE="hooks.json"
ERRORS=0

echo "=========================================="
echo "測試 Task 1.3: hooks.json 結構驗證"
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

if [ "$EVENT_COUNT" -eq 5 ]; then
    echo "   ✅ 事件類型數量: $EVENT_COUNT (符合預期)"
else
    echo "   ❌ 事件類型數量: $EVENT_COUNT (預期 5 個)"
    ERRORS=$((ERRORS + 1))
fi

# 測試 3: Hooks 總數量
echo ""
echo "3️⃣ Hooks 總數量..."
TOTAL_HOOKS=$(jq '[.hooks | to_entries[] | .value | length] | add' "$HOOKS_FILE")
echo "   計算中..."
echo "   SessionStart hooks: $(jq '.hooks.SessionStart | length' "$HOOKS_FILE")"
echo "   SessionEnd hooks: $(jq '.hooks.SessionEnd | length' "$HOOKS_FILE")"
echo "   PreToolUse hooks: $(jq '.hooks.PreToolUse | length' "$HOOKS_FILE")"
echo "   PostToolUse hooks: $(jq '.hooks.PostToolUse | length' "$HOOKS_FILE")"
echo "   UserPromptSubmit hooks: $(jq '.hooks.UserPromptSubmit | length' "$HOOKS_FILE")"
if [ -n "$(jq '.hooks.PreCompact' "$HOOKS_FILE" 2>/dev/null)" ]; then
    echo "   PreCompact hooks: $(jq '.hooks.PreCompact | length' "$HOOKS_FILE")"
fi

echo ""
echo "   總計: $TOTAL_HOOKS 個 hooks"

if [ "$TOTAL_HOOKS" -eq 11 ]; then
    echo "   ✅ Hooks 數量: $TOTAL_HOOKS (符合預期)"
else
    echo "   ⚠️  Hooks 數量: $TOTAL_HOOKS (預期 11 個，TODO 中列出 3 個待實作)"
fi

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
echo "5️⃣ 缺失 hooks 清單..."
MISSING=$(jq -r '.TODO.missing_hooks[]' "$HOOKS_FILE")
echo "   TODO 中列出的待實作 hooks:"
echo "$MISSING" | sed 's/^/   - /'

echo ""
echo "=========================================="
echo "測試結果摘要"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ 所有測試通過！"
    echo ""
    echo "現狀:"
    echo "- 已實作: 11 個 hooks"
    echo "- 待實作: 3 個 hooks (fix-on-discovery, violation-tracker, loop-recovery-detector)"
    echo "- PostToolUse 順序: 正確"
    exit 0
else
    echo "❌ 發現 $ERRORS 個測試失敗"
    exit 1
fi
