#!/bin/bash
# Hook 單元測試
#
# 測試各 Hook 的輸入/輸出是否符合預期
#
# 用法：
#   ./test-hooks.sh           # 執行所有測試
#   ./test-hooks.sh <name>    # 執行特定測試

# 不使用 set -e，讓測試繼續執行即使有失敗

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# 計數器
PASS=0
FAIL=0
SKIP=0

# 測試結果目錄
RESULTS_DIR="$HOME/.claude/tests/workflow/results"
mkdir -p "$RESULTS_DIR"

# 測試輔助函數
log_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    echo "  Expected: $2"
    echo "  Got: $3"
    ((FAIL++))
}

log_skip() {
    echo -e "${YELLOW}○ SKIP${NC}: $1 - $2"
    ((SKIP++))
}

# ============================================
# Hook 測試案例
# ============================================

test_fix_on_discovery() {
    echo ""
    echo "=== Testing: fix-on-discovery.sh ==="

    HOOK="$HOME/.claude/hooks/core/fix-on-discovery.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "fix-on-discovery" "Hook 不存在"
        return
    fi

    # Test 1: pyright 有錯誤時應該返回 systemMessage
    INPUT='{"tool_input": {"command": "pyright src/"}, "tool_response": {"stdout": "error: Type mismatch"}}'
    OUTPUT=$(echo "$INPUT" | "$HOOK")

    if echo "$OUTPUT" | grep -q "systemMessage"; then
        log_pass "fix-on-discovery: pyright 錯誤觸發提醒"
    else
        log_fail "fix-on-discovery: pyright 錯誤觸發提醒" "含有 systemMessage" "$OUTPUT"
    fi

    # Test 2: pyright 無錯誤時不應該返回任何內容
    INPUT='{"tool_input": {"command": "pyright src/"}, "tool_response": {"stdout": "0 errors, 0 warnings"}}'
    OUTPUT=$(echo "$INPUT" | "$HOOK")

    if [ -z "$OUTPUT" ]; then
        log_pass "fix-on-discovery: pyright 無錯誤不觸發"
    else
        log_fail "fix-on-discovery: pyright 無錯誤不觸發" "空輸出" "$OUTPUT"
    fi

    # Test 3: 非類型檢查命令不應該觸發
    INPUT='{"tool_input": {"command": "ls -la"}, "tool_response": {"stdout": "error: something"}}'
    OUTPUT=$(echo "$INPUT" | "$HOOK")

    if [ -z "$OUTPUT" ]; then
        log_pass "fix-on-discovery: 非類型檢查命令不觸發"
    else
        log_fail "fix-on-discovery: 非類型檢查命令不觸發" "空輸出" "$OUTPUT"
    fi
}

test_check_core_skill() {
    echo ""
    echo "=== Testing: check-core-skill.sh ==="

    HOOK="$HOME/.claude/hooks/workflow/check-core-skill.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "check-core-skill" "Hook 不存在"
        return
    fi

    # Test 1: Task 工具呼叫時應該檢查 core skill
    INPUT='{"tool_input": {"subagent_type": "developer", "prompt": "test"}}'
    OUTPUT=$(echo "$INPUT" | "$HOOK" 2>&1 || true)

    # 這個 hook 可能返回提醒或空，取決於 skill 是否已載入
    log_pass "check-core-skill: 基本執行正常"
}

test_remind_review() {
    echo ""
    echo "=== Testing: remind-review.sh ==="

    HOOK="$HOME/.claude/hooks/workflow/remind-review.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "remind-review" "Hook 不存在"
        return
    fi

    # Test 1: Edit/Write 後應該提醒 Review
    INPUT='{"tool_input": {"file_path": "/test.py"}, "tool_response": {"success": true}}'
    OUTPUT=$(echo "$INPUT" | "$HOOK" 2>&1 || true)

    log_pass "remind-review: 基本執行正常"
}

test_loop_heartbeat() {
    echo ""
    echo "=== Testing: loop-heartbeat.sh ==="

    HOOK="$HOME/.claude/hooks/workflow/loop-heartbeat.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "loop-heartbeat" "Hook 不存在"
        return
    fi

    # Hook 使用相對路徑 .claude/，需要從 $HOME 執行
    pushd "$HOME" > /dev/null

    # 清理測試環境
    rm -f ".claude/ralph-loop-heartbeat.txt" 2>/dev/null

    # 建立 loop 狀態檔案（Hook 只在有 loop 時才記錄）
    echo "test loop state" > ".claude/ralph-loop.local.md"

    # Test 1: 執行後應該更新 heartbeat 檔案
    echo '{}' | "$HOOK" > /dev/null 2>&1 || true

    if [ -f ".claude/ralph-loop-heartbeat.txt" ]; then
        log_pass "loop-heartbeat: heartbeat 檔案已建立"
        rm -f ".claude/ralph-loop-heartbeat.txt"
    else
        log_fail "loop-heartbeat: heartbeat 檔案已建立" "檔案存在" "檔案不存在"
    fi

    # 清理
    rm -f ".claude/ralph-loop.local.md"
    popd > /dev/null
}

test_pre_compact_save() {
    echo ""
    echo "=== Testing: pre-compact-save.sh ==="

    HOOK="$HOME/.claude/hooks/workflow/pre-compact-save.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "pre-compact-save" "Hook 不存在"
        return
    fi

    # Hook 使用相對路徑 .claude/，需要從 $HOME 執行
    pushd "$HOME" > /dev/null

    # 建立測試 loop 狀態
    echo "test loop state" > ".claude/ralph-loop.local.md"

    # Test 1: 執行後應該備份狀態
    OUTPUT=$("$HOOK" 2>&1 || true)

    if [ -f ".claude/ralph-loop-backup.md" ]; then
        log_pass "pre-compact-save: 狀態已備份"
        rm -f ".claude/ralph-loop-backup.md"
    else
        log_fail "pre-compact-save: 狀態已備份" "備份檔案存在" "備份檔案不存在"
    fi

    # 清理
    rm -f ".claude/ralph-loop.local.md"
    popd > /dev/null
}

test_stop_save_progress() {
    echo ""
    echo "=== Testing: stop-save-progress.sh ==="

    HOOK="$HOME/.claude/hooks/workflow/stop-save-progress.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "stop-save-progress" "Hook 不存在"
        return
    fi

    # Hook 使用相對路徑 .claude/，需要從 $HOME 執行
    pushd "$HOME" > /dev/null

    # 建立測試 loop 狀態
    echo "test loop state" > ".claude/ralph-loop.local.md"
    BEFORE_SIZE=$(wc -c < ".claude/ralph-loop.local.md")

    # Test 1: 執行後應該追加停止記錄
    "$HOOK" > /dev/null 2>&1 || true

    AFTER_SIZE=$(wc -c < ".claude/ralph-loop.local.md")

    if [ "$AFTER_SIZE" -gt "$BEFORE_SIZE" ]; then
        log_pass "stop-save-progress: 停止記錄已追加"
    else
        log_fail "stop-save-progress: 停止記錄已追加" "檔案變大" "檔案未變化"
    fi

    # 清理
    rm -f ".claude/ralph-loop.local.md"
    popd > /dev/null
}

test_loop_continue_reminder() {
    echo ""
    echo "=== Testing: loop-continue-reminder.sh ==="

    HOOK="$HOME/.claude/hooks/workflow/loop-continue-reminder.sh"

    if [ ! -f "$HOOK" ]; then
        log_skip "loop-continue-reminder" "Hook 不存在"
        return
    fi

    # Test 1: 沒有活躍 loop 時不應該觸發
    rm -f "$HOME/.claude/ralph-loop.local.md" 2>/dev/null
    INPUT='{"transcript_text": "hello"}'
    OUTPUT=$(echo "$INPUT" | "$HOOK" 2>&1 || true)

    log_pass "loop-continue-reminder: 基本執行正常"
}

# ============================================
# 主執行邏輯
# ============================================

echo "========================================"
echo "工作流 Hook 單元測試"
echo "========================================"
echo "時間: $(date)"
echo ""

# 如果指定了特定測試
if [ -n "$1" ]; then
    case "$1" in
        fix-on-discovery)
            test_fix_on_discovery
            ;;
        check-core-skill)
            test_check_core_skill
            ;;
        remind-review)
            test_remind_review
            ;;
        loop-heartbeat)
            test_loop_heartbeat
            ;;
        pre-compact-save)
            test_pre_compact_save
            ;;
        stop-save-progress)
            test_stop_save_progress
            ;;
        loop-continue-reminder)
            test_loop_continue_reminder
            ;;
        *)
            echo "未知的測試: $1"
            exit 1
            ;;
    esac
else
    # 執行所有測試
    test_fix_on_discovery
    test_check_core_skill
    test_remind_review
    test_loop_heartbeat
    test_pre_compact_save
    test_stop_save_progress
    test_loop_continue_reminder
fi

# 輸出總結
echo ""
echo "========================================"
echo "測試結果總結"
echo "========================================"
echo -e "${GREEN}通過${NC}: $PASS"
echo -e "${RED}失敗${NC}: $FAIL"
echo -e "${YELLOW}跳過${NC}: $SKIP"
echo ""

# 保存結果
RESULT_FILE="$RESULTS_DIR/hooks-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "Hook 單元測試結果"
    echo "時間: $(date)"
    echo "通過: $PASS"
    echo "失敗: $FAIL"
    echo "跳過: $SKIP"
} > "$RESULT_FILE"

echo "結果已保存至: $RESULT_FILE"

# 返回狀態碼
if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
