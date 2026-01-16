#!/bin/bash
# 檢查並清理重複的 Claude 實例
#
# 用途：在 SessionStart 時檢查是否有舊的 Claude 實例未正確關閉
# 位置：utilities/check-duplicate-instances.sh
# 觸發：SessionStart Hook

set -euo pipefail

# 日誌檔案
LOG_FILE="${HOME}/.claude/logs/instance-cleanup.log"
mkdir -p "$(dirname "$LOG_FILE")"

# 記錄函數
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# 獲取所有 Claude 主進程（排除 grep）
get_claude_instances() {
    ps aux | grep "claude.*--output-format stream-json" | grep -v grep | awk '{print $2}'
}

# 獲取進程的啟動時間
get_start_time() {
    local pid=$1
    ps -o lstart= -p "$pid" 2>/dev/null | xargs
}

# 獲取進程的記憶體使用
get_memory() {
    local pid=$1
    ps -o rss= -p "$pid" 2>/dev/null | awk '{printf "%.1f", $1/1024}'
}

# 獲取進程的所有子進程（遞迴）
get_all_children() {
    local pid=$1
    local children=$(pgrep -P "$pid" 2>/dev/null || true)

    echo "$children"
    for child in $children; do
        get_all_children "$child"
    done
}

# 清理指定的進程樹
cleanup_process_tree() {
    local pid=$1
    local reason=$2

    log "🧹 清理進程樹 PID $pid ($reason)"

    # 獲取所有子進程
    local all_children=$(get_all_children "$pid")

    # 顯示將要清理的進程
    if [ -n "$all_children" ]; then
        log "   └─ 子進程: $(echo $all_children | tr '\n' ' ')"
    fi

    # 先嘗試優雅關閉（SIGTERM）
    if [ -n "$all_children" ]; then
        for child in $all_children; do
            if ps -p "$child" > /dev/null 2>&1; then
                kill -TERM "$child" 2>/dev/null || true
            fi
        done
    fi

    # 關閉主進程
    if ps -p "$pid" > /dev/null 2>&1; then
        kill -TERM "$pid" 2>/dev/null || true
    fi

    # 等待 2 秒
    sleep 2

    # 強制關閉仍存在的進程（SIGKILL）
    if [ -n "$all_children" ]; then
        for child in $all_children; do
            if ps -p "$child" > /dev/null 2>&1; then
                log "   ⚠️  強制關閉子進程 $child"
                kill -KILL "$child" 2>/dev/null || true
            fi
        done
    fi

    if ps -p "$pid" > /dev/null 2>&1; then
        log "   ⚠️  強制關閉主進程 $pid"
        kill -KILL "$pid" 2>/dev/null || true
    fi

    log "   ✅ 清理完成"
}

# 主邏輯
main() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "🔍 檢查重複的 Claude 實例"

    # 獲取所有 Claude 實例
    local instances=$(get_claude_instances)
    local count=$(echo "$instances" | grep -v "^$" | wc -l | xargs)

    if [ "$count" -eq 0 ]; then
        log "✅ 沒有發現 Claude 實例（異常狀態）"
        return 0
    fi

    if [ "$count" -eq 1 ]; then
        log "✅ 只有一個 Claude 實例運行（正常）"
        return 0
    fi

    # 有多個實例 - 需要清理
    log "⚠️  發現 $count 個 Claude 實例"
    echo ""

    # 按啟動時間排序，找出最新的實例
    declare -A instance_info
    local newest_pid=""
    local newest_time=0

    for pid in $instances; do
        local start_time=$(get_start_time "$pid")
        local memory=$(get_memory "$pid")
        local epoch=$(date -j -f "%a %b %d %H:%M:%S %Y" "$start_time" "+%s" 2>/dev/null || echo 0)

        instance_info[$pid]="$start_time|$memory|$epoch"

        if [ "$epoch" -gt "$newest_time" ]; then
            newest_time=$epoch
            newest_pid=$pid
        fi

        log "   PID $pid | 啟動: $start_time | 記憶體: ${memory} MB"
    done

    echo ""
    log "📌 最新實例: PID $newest_pid"
    log "🗑️  將清理舊實例:"

    # 清理所有舊實例
    for pid in $instances; do
        if [ "$pid" != "$newest_pid" ]; then
            IFS='|' read -r start_time memory epoch <<< "${instance_info[$pid]}"
            local age=$((newest_time - epoch))
            log "   PID $pid (啟動於 ${age}秒前)"
            cleanup_process_tree "$pid" "舊實例"
        fi
    done

    # 統計節省的記憶體
    local saved_memory=0
    for pid in $instances; do
        if [ "$pid" != "$newest_pid" ]; then
            IFS='|' read -r start_time memory epoch <<< "${instance_info[$pid]}"
            saved_memory=$(echo "$saved_memory + $memory" | bc)
        fi
    done

    echo ""
    log "✅ 清理完成，節省記憶體: ${saved_memory} MB"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 輸出給用戶的訊息
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "🧹 自動清理完成"
    echo "───────────────────────────────────────────────────"
    echo "清理了 $((count - 1)) 個舊的 Claude 實例"
    echo "節省記憶體: ${saved_memory} MB"
    echo "詳細日誌: $LOG_FILE"
    echo "═══════════════════════════════════════════════════"
    echo ""
}

# 執行
main
