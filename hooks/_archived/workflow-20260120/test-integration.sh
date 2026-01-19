#!/bin/bash

# Workflow Hooks 整合測試
# 測試所有 hooks 之間的協作是否正常

HOOK_DIR="$HOME/.claude/hooks/workflow"
STATE_DIR="$HOME/.claude/workflow-state"

echo "🧪 Workflow Hooks 整合測試"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 清理測試環境
echo ""
echo "🧹 清理測試環境..."
rm -rf "$STATE_DIR"
mkdir -p "$STATE_DIR"

# 1. 測試狀態初始化
echo ""
echo "1️⃣  測試狀態初始化（state-updater.js）..."
node "$HOOK_DIR/state-updater.js" init "test-change-001"
if [ $? -eq 0 ]; then
    echo "✅ 狀態初始化成功"
else
    echo "❌ 狀態初始化失敗"
    exit 1
fi

# 2. 測試狀態顯示
echo ""
echo "2️⃣  測試狀態顯示（status-display.js）..."
node "$HOOK_DIR/status-display.js" "DESIGN" "開始設計"
if [ $? -eq 0 ]; then
    echo "✅ 狀態顯示成功"
else
    echo "❌ 狀態顯示失敗"
fi

# 3. 測試工作流閘門（正常情況）
echo ""
echo "3️⃣  測試工作流閘門 - 正常情況（workflow-gate.js）..."
node "$HOOK_DIR/workflow-gate.js" check "DESIGN"
if [ $? -eq 0 ]; then
    echo "✅ 閘門檢查通過"
else
    echo "❌ 閘門檢查失敗"
    exit 1
fi

# 4. 測試狀態轉換
echo ""
echo "4️⃣  測試狀態轉換（state-updater.js）..."
node "$HOOK_DIR/state-updater.js" transition "DEV"
if [ $? -eq 0 ]; then
    echo "✅ 狀態轉換成功"
else
    echo "❌ 狀態轉換失敗"
    exit 1
fi

# 5. 測試 Task 同步
echo ""
echo "5️⃣  測試 Task 同步（task-sync.js）..."
node "$HOOK_DIR/task-sync.js" start "developer" "Task 1.1 - 實作功能"
if [ $? -eq 0 ]; then
    echo "✅ Task 同步成功"
else
    echo "❌ Task 同步失敗"
fi

# 6. 完成 Task
echo ""
echo "6️⃣  完成 Task..."
node "$HOOK_DIR/task-sync.js" complete "developer" "success"
if [ $? -eq 0 ]; then
    echo "✅ Task 完成記錄成功"
else
    echo "❌ Task 完成記錄失敗"
fi

# 7. 測試 Bypass 功能
echo ""
echo "7️⃣  測試 Bypass 功能（bypass-handler.js）..."
node "$HOOK_DIR/state-updater.js" transition "REVIEW"
node "$HOOK_DIR/bypass-handler.js" bypass "整合測試"
if [ $? -eq 0 ]; then
    echo "✅ Bypass 記錄成功"
else
    echo "❌ Bypass 記錄失敗"
fi

# 8. 測試進程管理
echo ""
echo "8️⃣  測試進程管理（process-manager.js）..."
node "$HOOK_DIR/process-manager.js" register "$$" "integration-test"
if [ $? -eq 0 ]; then
    echo "✅ 進程註冊成功"
else
    echo "❌ 進程註冊失敗"
fi

# 9. 查看最終狀態
echo ""
echo "9️⃣  查看最終狀態..."
echo ""
echo "--- current.json ---"
cat "$STATE_DIR/current.json" | jq '.' 2>/dev/null || cat "$STATE_DIR/current.json"
echo ""
echo "--- bypass-records.json ---"
cat "$STATE_DIR/bypass-records.json" | jq '.' 2>/dev/null || cat "$STATE_DIR/bypass-records.json"
echo ""

# 10. 測試 Session Report
echo ""
echo "🔟 生成 Session Report（session-report.js）..."
node "$HOOK_DIR/session-report.js"
if [ $? -eq 0 ]; then
    echo "✅ Session Report 生成成功"
else
    echo "⚠️  Session Report 生成失敗（可能是資料不足）"
fi

# 11. 清理測試進程
echo ""
echo "1️⃣1️⃣  清理測試進程..."
node "$HOOK_DIR/process-manager.js" unregister "$$"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 整合測試完成"
echo ""
echo "生成的檔案："
ls -lh "$STATE_DIR"
