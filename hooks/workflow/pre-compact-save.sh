#!/bin/bash
# PreCompact Hook - Context 壓縮前保存 Loop 狀態
#
# 用途：當 Claude Code 進行 context compaction 時，
#       自動備份 ralph-loop 狀態檔案，確保 loop 進度不會丟失。

LOOP_STATE=".claude/ralph-loop.local.md"
BACKUP=".claude/ralph-loop-backup.md"

# 只在有 Loop 運行時才執行備份
if [ -f "$LOOP_STATE" ]; then
    # 備份當前狀態
    cp "$LOOP_STATE" "$BACKUP"

    # 輸出 systemMessage 讓 AI 知道狀態已備份
    cat << 'EOF'
{
  "systemMessage": "⚠️ Context 壓縮中 - Ralph-Loop 狀態已備份到 ralph-loop-backup.md。恢復時請先檢查此檔案。"
}
EOF
fi
