#!/bin/bash
# OpenSpec 清理提醒 - SessionEnd Hook

# 檢查是否有未歸檔的 OpenSpec
OPENSPEC_DIR="$HOME/.claude/openspec/changes"

if [ -d "$OPENSPEC_DIR" ]; then
    # 檢查 changes/ 下是否有非 archive 的目錄
    ACTIVE_SPECS=$(find "$OPENSPEC_DIR" -maxdepth 1 -type d ! -name "changes" ! -name "archive" 2>/dev/null | wc -l)

    if [ "$ACTIVE_SPECS" -gt 0 ]; then
        echo "⚠️ 發現 $ACTIVE_SPECS 個未歸檔的 OpenSpec"
        echo "   請確認是否需要歸檔到 archive/"
    fi
fi

# 檢查 ~/.claude 是否有測試報告等臨時檔案
TEMP_FILES=$(ls -1 "$HOME/.claude"/*.log "$HOME/.claude"/TEST_REPORT*.md "$HOME/.claude"/MIGRATION*.md 2>/dev/null | wc -l)

if [ "$TEMP_FILES" -gt 0 ]; then
    echo "⚠️ 根目錄有 $TEMP_FILES 個臨時檔案待清理"
fi
