#!/bin/bash

# Bypass Handler 測試腳本

HOOK_DIR="$HOME/.claude/hooks/workflow"
HANDLER="$HOOK_DIR/bypass-handler.js"
STATE_DIR="$HOME/.claude/workflow-state"
STATE_FILE="$STATE_DIR/current.json"

echo "🧪 測試 Bypass Handler"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 清理舊資料
echo ""
echo "1️⃣  清理測試環境..."
rm -rf "$STATE_DIR"
mkdir -p "$STATE_DIR"

# 2. 建立測試狀態檔案
echo ""
echo "2️⃣  建立測試狀態檔案..."
cat > "$STATE_FILE" << 'EOF'
{
  "changeId": "test-001",
  "state": "REVIEW",
  "mainAgentOps": {
    "directCode": 0,
    "bypassed": 0
  },
  "metadata": {}
}
EOF
echo "✅ 狀態檔案建立完成"

# 3. 查看初始狀態
echo ""
echo "3️⃣  查看初始狀態..."
node "$HANDLER" status

# 4. 測試第一次 bypass
echo ""
echo "4️⃣  測試第一次 bypass..."
node "$HANDLER" bypass "緊急修復，已人工確認"

# 5. 查看更新後狀態
echo ""
echo "5️⃣  查看更新後狀態..."
node "$HANDLER" status

# 6. 測試第二次 bypass
echo ""
echo "6️⃣  測試第二次 bypass..."
node "$HANDLER" bypass "測試環境無法運行完整測試"

# 7. 測試第三次 bypass
echo ""
echo "7️⃣  測試第三次 bypass..."
node "$HANDLER" bypass "時間緊迫，先上線"

# 8. 測試超過限制
echo ""
echo "8️⃣  測試超過限制（應該失敗）..."
node "$HANDLER" bypass "這次應該被拒絕" || echo "✅ 正確拒絕了第 4 次 bypass"

# 9. 測試不可 bypass 的狀態
echo ""
echo "9️⃣  測試 COMPLETING 狀態（應該失敗）..."
# 修改狀態為 COMPLETING
cat > "$STATE_FILE" << 'EOF'
{
  "changeId": "test-001",
  "state": "COMPLETING",
  "mainAgentOps": {
    "directCode": 0,
    "bypassed": 0
  },
  "metadata": {}
}
EOF
node "$HANDLER" bypass "試圖 bypass COMPLETING" || echo "✅ 正確拒絕了 COMPLETING 狀態的 bypass"

# 10. 測試重置功能
echo ""
echo "🔟 測試重置功能..."
node "$HANDLER" reset
node "$HANDLER" status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 測試完成"
