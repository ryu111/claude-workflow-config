#!/bin/bash

# Bypass Handler 獨立測試（不依賴其他 hooks）

HOOK_DIR="$HOME/.claude/hooks/workflow"
HANDLER="$HOOK_DIR/bypass-handler.js"
STATE_DIR="$HOME/.claude/workflow-state"
STATE_FILE="$STATE_DIR/current.json"

echo "🧪 Bypass Handler 獨立測試"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 清理並建立測試環境
echo ""
echo "1️⃣  準備測試環境..."
rm -rf "$STATE_DIR"
mkdir -p "$STATE_DIR"

# 手動建立測試狀態檔案（模擬正常工作流狀態）
cat > "$STATE_FILE" << 'EOF'
{
  "version": "2.0",
  "changeId": "test-change-001",
  "state": "REVIEW",
  "previousState": "DEV",
  "mainAgentOps": {
    "directCode": 0,
    "bypassed": 0
  },
  "timestamps": {
    "created": "2026-01-19T10:00:00Z",
    "lastActivity": "2026-01-19T10:30:00Z"
  },
  "metadata": {}
}
EOF

echo "✅ 測試狀態檔案建立完成"

# 2. 查看初始狀態
echo ""
echo "2️⃣  查看初始狀態..."
node "$HANDLER" status

# 3. 第一次 bypass
echo ""
echo "3️⃣  第一次 bypass..."
node "$HANDLER" bypass "緊急修復，已人工確認"
echo ""
cat "$STATE_FILE" | jq '.mainAgentOps.bypassed'

# 4. 第二次 bypass
echo ""
echo "4️⃣  第二次 bypass..."
node "$HANDLER" bypass "測試環境故障"

# 5. 第三次 bypass
echo ""
echo "5️⃣  第三次 bypass..."
node "$HANDLER" bypass "時間緊迫"

# 6. 嘗試第四次（應該失敗）
echo ""
echo "6️⃣  嘗試第四次 bypass（應該被拒絕）..."
if ! node "$HANDLER" bypass "這次應該失敗"; then
    echo "✅ 正確拒絕了第 4 次 bypass"
fi

# 7. 測試 COMPLETING 狀態不可 bypass
echo ""
echo "7️⃣  測試 COMPLETING 狀態（應該被拒絕）..."
# 修改狀態
jq '.state = "COMPLETING" | .mainAgentOps.bypassed = 0' "$STATE_FILE" > "$STATE_FILE.tmp"
mv "$STATE_FILE.tmp" "$STATE_FILE"

if ! node "$HANDLER" bypass "嘗試 bypass COMPLETING"; then
    echo "✅ 正確拒絕了 COMPLETING 狀態的 bypass"
fi

# 8. 重置並驗證
echo ""
echo "8️⃣  重置 bypass 記錄..."
node "$HANDLER" reset
node "$HANDLER" status

# 9. 驗證檔案結構
echo ""
echo "9️⃣  驗證檔案結構..."
echo ""
echo "=== current.json ==="
cat "$STATE_FILE" | jq '.' || cat "$STATE_FILE"
echo ""
echo "=== bypass-records.json ==="
cat "$STATE_DIR/bypass-records.json" | jq '.' || cat "$STATE_DIR/bypass-records.json"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 測試完成"
