#!/bin/bash
# Loop Heartbeat Hook
#
# 用途：定期更新 Loop 狀態檔案的時間戳，並持久化完整狀態到 JSON
#       即使 session 突然斷線，也能知道最後活動時間和恢復資訊。
#
# 觸發時機：PostToolUse (Edit, Write, Bash, Task)

# 常數定義
LOOP_STATE=".claude/ralph-loop.local.md"
HEARTBEAT_FILE=".claude/ralph-loop-heartbeat.txt"
PERSIST_FILE="$HOME/.claude/loop-state/current.json"
DEFAULT_STATUS="running"
DEFAULT_LOOP_ID="unknown"

# 路徑驗證：防止 Path Traversal
if [[ "$LOOP_STATE" == *".."* ]] || [[ ! "$LOOP_STATE" =~ ^\.claude/ ]]; then
    exit 0
fi

# 只在有 Loop 運行時才記錄
if [ -f "$LOOP_STATE" ]; then
    # 更新 heartbeat 時間戳
    NOW=$(date '+%Y-%m-%d %H:%M:%S')
    echo "$NOW" > "$HEARTBEAT_FILE"

    # 持久化完整狀態到 JSON
    # 提取 Loop ID 和狀態資訊（防止 Command Injection）
    LOOP_ID=$(grep -E "^# Loop ID:" "$LOOP_STATE" 2>/dev/null | sed 's/^# Loop ID: //' | head -n1 | tr -d '\n\r' 2>/dev/null || echo "$DEFAULT_LOOP_ID")

    # 數值驗證：確保 LOOP_ID 不為空
    if [ -z "$LOOP_ID" ]; then
        LOOP_ID="$DEFAULT_LOOP_ID"
    fi

    # 驗證 LOOP_ID 格式（只允許字母數字、底線、連字號）
    if ! [[ "$LOOP_ID" =~ ^[a-zA-Z0-9_-]+$ ]] && [ "$LOOP_ID" != "$DEFAULT_LOOP_ID" ]; then
        LOOP_ID="$DEFAULT_LOOP_ID"
    fi

    STATUS=$(grep -E "^Status:" "$LOOP_STATE" 2>/dev/null | sed 's/^Status: //' | head -n1 | tr -d '\n\r' 2>/dev/null || echo "$DEFAULT_STATUS")

    # 數值驗證：確保 STATUS 不為空
    if [ -z "$STATUS" ]; then
        STATUS="$DEFAULT_STATUS"
    fi

    STARTED_AT=$(grep -E "^Started:" "$LOOP_STATE" 2>/dev/null | sed 's/^Started: //' | head -n1 | tr -d '\n\r' 2>/dev/null || echo "$NOW")

    # 數值驗證：確保 STARTED_AT 不為空
    if [ -z "$STARTED_AT" ]; then
        STARTED_AT="$NOW"
    fi

    # 使用 jq 建立 JSON（如果有的話），否則用簡單字串拼接
    # 建立臨時檔案以確保原子性操作（防止 Race Condition）
    TEMP_FILE=$(mktemp "${PERSIST_FILE}.XXXXXX") || exit 0

    if command -v jq &> /dev/null; then
        if jq -n \
            --arg loopId "$LOOP_ID" \
            --arg status "$STATUS" \
            --arg startedAt "$STARTED_AT" \
            --arg lastHeartbeat "$NOW" \
            --arg projectPath "$(pwd)" \
            --arg loopStateFile "$LOOP_STATE" \
            '{
                loopId: $loopId,
                status: $status,
                startedAt: $startedAt,
                lastHeartbeat: $lastHeartbeat,
                projectPath: $projectPath,
                loopConfig: {
                    stateFile: $loopStateFile
                },
                workflowState: {
                    lastActivity: $lastHeartbeat
                }
            }' > "$TEMP_FILE" 2>/dev/null; then
            # jq 成功，原子性移動檔案
            mv "$TEMP_FILE" "$PERSIST_FILE"
        else
            # jq 失敗，使用簡易版本
            cat > "$TEMP_FILE" << EOF
{
  "loopId": "$LOOP_ID",
  "status": "$STATUS",
  "startedAt": "$STARTED_AT",
  "lastHeartbeat": "$NOW",
  "projectPath": "$(pwd)",
  "loopConfig": {
    "stateFile": "$LOOP_STATE"
  },
  "workflowState": {
    "lastActivity": "$NOW"
  }
}
EOF
            mv "$TEMP_FILE" "$PERSIST_FILE"
        fi
    else
        # 簡易版本（無 jq）
        cat > "$TEMP_FILE" << EOF
{
  "loopId": "$LOOP_ID",
  "status": "$STATUS",
  "startedAt": "$STARTED_AT",
  "lastHeartbeat": "$NOW",
  "projectPath": "$(pwd)",
  "loopConfig": {
    "stateFile": "$LOOP_STATE"
  },
  "workflowState": {
    "lastActivity": "$NOW"
  }
}
EOF
        mv "$TEMP_FILE" "$PERSIST_FILE"
    fi

    # 清理可能殘留的臨時檔案
    rm -f "${PERSIST_FILE}".?????? 2>/dev/null || true
else
    # 沒有運行中的 Loop，清理持久化檔案
    if [ -f "$PERSIST_FILE" ]; then
        # 檢查是否應該標記為完成而非直接刪除
        if [ -s "$PERSIST_FILE" ]; then
            # 將狀態標記為 completed
            if command -v jq &> /dev/null; then
                jq '.status = "completed" | .completedAt = "'$(date '+%Y-%m-%d %H:%M:%S')'"' \
                    "$PERSIST_FILE" > "$PERSIST_FILE.tmp" && mv "$PERSIST_FILE.tmp" "$PERSIST_FILE"
            fi
        fi
    fi
fi
