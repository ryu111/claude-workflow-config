#!/bin/bash
# Python 進程監控和清理工具
# 用途：監控和清理殘留的 Python 進程，防止 RAM 洩漏

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Python 進程監控工具${NC}"
echo "================================"

# 函數：列出所有 Python 進程
list_python_processes() {
    echo -e "\n${YELLOW}📊 當前 Python 進程：${NC}"
    ps aux | grep -E "python|Python" | grep -v grep | grep -v "$0" || echo "  ✅ 沒有運行中的 Python 進程"
}

# 函數：顯示記憶體使用情況
show_memory_usage() {
    echo -e "\n${YELLOW}💾 Python 進程記憶體使用：${NC}"
    ps aux | grep -E "python|Python" | grep -v grep | grep -v "$0" | awk '{print "  PID: "$2" | RAM: "$4"% | CMD: "$11" "$12" "$13}' || echo "  ✅ 無 Python 進程"
}

# 函數：清理殘留進程
cleanup_orphaned() {
    echo -e "\n${YELLOW}🧹 檢查殘留進程...${NC}"
    
    # 找出運行超過 5 分鐘的 Python 進程（可能是殘留）
    ORPHANED=$(ps -eo pid,etime,comm | grep -E "python|Python" | awk '$2 ~ /-/ || $2 ~ /[0-9]{2}:[0-9]{2}:[0-9]{2}/ {print $1}' || true)
    
    if [ -z "$ORPHANED" ]; then
        echo -e "  ${GREEN}✅ 沒有發現殘留進程${NC}"
        return 0
    fi
    
    echo -e "  ${RED}⚠️  發現可能的殘留進程：${NC}"
    ps -p $ORPHANED -o pid,etime,rss,comm 2>/dev/null || true
    
    echo -e "\n${YELLOW}是否要終止這些進程？ (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        for pid in $ORPHANED; do
            echo -e "  ${YELLOW}終止 PID $pid...${NC}"
            kill -15 $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
        done
        echo -e "  ${GREEN}✅ 清理完成${NC}"
    else
        echo -e "  ${BLUE}ℹ️  已取消${NC}"
    fi
}

# 函數：監控模式
monitor_mode() {
    echo -e "\n${BLUE}📡 進入監控模式（每 5 秒更新，Ctrl+C 退出）${NC}"
    echo "================================"
    
    while true; do
        clear
        echo -e "${BLUE}🔍 Python 進程即時監控${NC}"
        echo "================================"
        echo -e "時間: $(date '+%Y-%m-%d %H:%M:%S')"
        
        list_python_processes
        show_memory_usage
        
        echo -e "\n${YELLOW}總 RAM 使用：${NC}"
        vm_stat | grep "Pages active" | awk '{printf "  活躍記憶體: %.2f GB\n", $3 * 4096 / 1024 / 1024 / 1024}'
        
        sleep 5
    done
}

# 主選單
case "${1:-}" in
    list|l)
        list_python_processes
        show_memory_usage
        ;;
    clean|c)
        cleanup_orphaned
        ;;
    monitor|m)
        monitor_mode
        ;;
    auto-clean)
        # 自動清理模式（用於 cron 或定期執行）
        ORPHANED=$(ps -eo pid,etime,comm | grep -E "python|Python" | awk '$2 ~ /-/ || $2 ~ /[0-9]{2}:[0-9]{2}:[0-9]{2}/ {print $1}' || true)
        if [ -n "$ORPHANED" ]; then
            echo -e "${YELLOW}自動清理殘留 Python 進程...${NC}"
            for pid in $ORPHANED; do
                kill -15 $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
            done
            echo -e "${GREEN}✅ 清理完成${NC}"
        fi
        ;;
    *)
        echo "用法: $0 {list|clean|monitor|auto-clean}"
        echo ""
        echo "指令："
        echo "  list (l)       - 列出當前 Python 進程"
        echo "  clean (c)      - 清理殘留進程（互動式）"
        echo "  monitor (m)    - 即時監控模式"
        echo "  auto-clean     - 自動清理（無互動）"
        echo ""
        echo "範例："
        echo "  $0 list        # 查看當前狀態"
        echo "  $0 clean       # 清理殘留進程"
        echo "  $0 monitor     # 開始監控"
        exit 1
        ;;
esac
