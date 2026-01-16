#!/bin/bash
# 檢查是否有未歸檔的 OpenSpec 變更
# 用於工作流結束時提醒歸檔

# 獲取當前工作目錄
CWD="${CLAUDE_WORKING_DIRECTORY:-$(pwd)}"

# 檢查 openspec/changes 目錄是否存在
CHANGES_DIR="$CWD/openspec/changes"

if [ ! -d "$CHANGES_DIR" ]; then
    exit 0  # 沒有 openspec 目錄，不需要檢查
fi

# 找出未歸檔的變更（排除 archive 目錄）
UNARCHIVED=$(find "$CHANGES_DIR" -maxdepth 1 -type d ! -name "changes" ! -name "archive" ! -name ".*" 2>/dev/null | wc -l | tr -d ' ')

if [ "$UNARCHIVED" -gt 0 ]; then
    # 列出未歸檔的變更
    CHANGE_IDS=$(find "$CHANGES_DIR" -maxdepth 1 -type d ! -name "changes" ! -name "archive" ! -name ".*" -exec basename {} \; 2>/dev/null | tr '\n' ', ' | sed 's/,$//')

    echo ""
    echo "┌────────────────────────────────────────────────────────────┐"
    echo "│  ⚠️  發現 $UNARCHIVED 個未歸檔的 OpenSpec 變更！              │"
    echo "├────────────────────────────────────────────────────────────┤"
    echo "│  變更 ID: $CHANGE_IDS"
    echo "│                                                            │"
    echo "│  請在結束前執行歸檔：                                      │"
    echo "│  mv openspec/changes/[id] openspec/changes/archive/        │"
    echo "└────────────────────────────────────────────────────────────┘"
    echo ""
fi

exit 0
