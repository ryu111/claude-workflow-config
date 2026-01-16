#!/bin/bash
# 監控和清理 Python 進程
#
# 用途：診斷 Python 進程堆積問題，自動清理孤兒進程
# 位置：utilities/monitor-python-processes.sh
# 執行：bash ~/.claude/hooks/utilities/monitor-python-processes.sh [--clean]

set -euo pipefail

# 日誌檔案
LOG_FILE="${HOME}/.claude/logs/python-monitor.log"
mkdir -p "$(dirname "$LOG_FILE")"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# 記錄函數
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# 獲取所有 Python 進程
get_python_processes() {
    ps -eo pid,ppid,lstart,rss,comm,args | grep -E "python|Python" | grep -v grep
}

# 檢查進程是否存在
process_exists() {
    ps -p "$1" > /dev/null 2>&1
}

# 獲取進程的啟動時間（epoch）
get_process_start_epoch() {
    local pid=$1
    local start_time=$(ps -o lstart= -p "$pid" 2>/dev/null | xargs)

    if [ -n "$start_time" ]; then
        # macOS date command format
        date -j -f "%a %b %d %H:%M:%S %Y" "$start_time" "+%s" 2>/dev/null || echo 0
    else
        echo 0
    fi
}

# 分類 Python 進程
categorize_process() {
    local cmd="$1"

    # MCP 服務
    if echo "$cmd" | grep -q "mcp.*server"; then
        echo "MCP Service"
        return
    fi

    # VSCode 相關
    if echo "$cmd" | grep -q "vscode\|pylance\|python-env-tools"; then
        echo "VSCode Extension"
        return
    fi

    # pytest / 測試
    if echo "$cmd" | grep -q "pytest\|test_"; then
        echo "Test Runner"
        return
    fi

    # MLX / LLM
    if echo "$cmd" | grep -q "mlx\|llm"; then
        echo "LLM Service"
        return
    fi

    # Jupyter / IPython
    if echo "$cmd" | grep -q "jupyter\|ipython"; then
        echo "Jupyter/IPython"
        return
    fi

    # 其他
    echo "Other"
}

# 主診斷邏輯
diagnose() {
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "🔍 Python 進程診斷報告"

    # 收集所有 Python 進程
    local all_processes=$(get_python_processes 2>/dev/null || true)

    if [ -z "$all_processes" ]; then
        echo -e "${GREEN}✅ 沒有發現 Python 進程${NC}"
        log "沒有發現 Python 進程"
        return
    fi

    # 統計資訊
    local total_count=0
    local orphan_count=0
    local mcp_count=0
    local vscode_count=0
    local other_count=0
    local total_memory=0

    declare -A category_memory
    declare -A category_count

    echo ""
    echo -e "${CYAN}📊 Python 進程列表${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    while IFS= read -r line; do
        local pid=$(echo "$line" | awk '{print $1}')
        local ppid=$(echo "$line" | awk '{print $2}')
        local rss=$(echo "$line" | awk '{print $8}')
        local mem_mb=$(echo "scale=1; $rss/1024" | bc)
        local cmd=$(echo "$line" | awk '{$1=$2=$3=$4=$5=$6=$7=$8=$9=""; print $0}' | xargs)

        total_count=$((total_count + 1))
        total_memory=$(echo "$total_memory + $mem_mb" | bc)

        # 分類進程
        local category=$(categorize_process "$cmd")
        category_count[$category]=$((${category_count[$category]:-0} + 1))
        category_memory[$category]=$(echo "${category_memory[$category]:-0} + $mem_mb" | bc)

        # 檢查是否為孤兒進程
        local status="${GREEN}✓${NC}"
        local parent_status="正常"

        if ! process_exists "$ppid"; then
            status="${RED}✗${NC}"
            parent_status="${RED}孤兒${NC}"
            orphan_count=$((orphan_count + 1))
        fi

        # 截斷命令顯示
        local short_cmd=$(echo "$cmd" | cut -c1-60)
        if [ ${#cmd} -gt 60 ]; then
            short_cmd="${short_cmd}..."
        fi

        echo -e "${status} PID ${BLUE}${pid}${NC} (PPID ${GRAY}${ppid}${NC}) | ${YELLOW}${mem_mb} MB${NC} | ${CYAN}${category}${NC} | ${parent_status}"
        echo -e "   ${GRAY}${short_cmd}${NC}"

    done <<< "$all_processes"

    echo ""
    echo -e "${CYAN}📈 統計摘要${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "總進程數: ${BLUE}${total_count}${NC}"
    echo -e "總記憶體: ${YELLOW}${total_memory} MB${NC}"

    if [ $orphan_count -gt 0 ]; then
        echo -e "孤兒進程: ${RED}${orphan_count}${NC} ⚠️"
    else
        echo -e "孤兒進程: ${GREEN}0${NC} ✓"
    fi

    echo ""
    echo -e "${CYAN}🏷️  按類別統計${NC}"
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    for category in "${!category_count[@]}"; do
        local count=${category_count[$category]}
        local memory=${category_memory[$category]}
        printf "%-20s: %2d 個 | %8.1f MB\n" "$category" "$count" "$memory"
    done

    log "診斷完成 - 總計: $total_count 個進程, $total_memory MB, $orphan_count 個孤兒"

    # 返回孤兒數量
    return $orphan_count
}

# 清理孤兒進程
clean_orphans() {
    log "🧹 開始清理孤兒 Python 進程"

    local cleaned_count=0
    local saved_memory=0

    local all_processes=$(get_python_processes 2>/dev/null || true)

    while IFS= read -r line; do
        local pid=$(echo "$line" | awk '{print $1}')
        local ppid=$(echo "$line" | awk '{print $2}')
        local rss=$(echo "$line" | awk '{print $8}')
        local mem_mb=$(echo "scale=1; $rss/1024" | bc)
        local cmd=$(echo "$line" | awk '{$1=$2=$3=$4=$5=$6=$7=$8=$9=""; print $0}' | xargs)

        # 檢查是否為孤兒
        if ! process_exists "$ppid"; then
            echo -e "${YELLOW}清理孤兒進程 PID ${pid}${NC}"
            log "清理孤兒進程 PID $pid (PPID $ppid, ${mem_mb}MB): $cmd"

            # 嘗試優雅關閉
            kill -TERM "$pid" 2>/dev/null || true
            sleep 1

            # 檢查是否仍存在
            if process_exists "$pid"; then
                echo -e "${RED}強制關閉 PID ${pid}${NC}"
                kill -KILL "$pid" 2>/dev/null || true
            fi

            cleaned_count=$((cleaned_count + 1))
            saved_memory=$(echo "$saved_memory + $mem_mb" | bc)
        fi

    done <<< "$all_processes"

    if [ $cleaned_count -gt 0 ]; then
        echo ""
        echo -e "${GREEN}✅ 清理完成${NC}"
        echo -e "清理了 ${BLUE}${cleaned_count}${NC} 個孤兒進程"
        echo -e "節省記憶體: ${YELLOW}${saved_memory} MB${NC}"
        log "清理完成 - $cleaned_count 個進程, 節省 ${saved_memory} MB"
    else
        echo -e "${GREEN}✅ 沒有孤兒進程需要清理${NC}"
    fi
}

# 主程式
main() {
    if [ "${1:-}" == "--clean" ]; then
        diagnose || orphan_count=$?

        if [ $orphan_count -gt 0 ]; then
            echo ""
            read -p "發現 $orphan_count 個孤兒進程，是否清理？(y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                clean_orphans
            fi
        fi
    elif [ "${1:-}" == "--auto-clean" ]; then
        # 自動清理（不詢問）
        diagnose > /dev/null 2>&1 || true
        clean_orphans
    else
        # 只診斷
        diagnose
    fi
}

# 執行
main "$@"
