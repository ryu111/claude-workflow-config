#!/bin/bash
# Claude 用量監控工具
# 追蹤 Agent 使用情況和預估 token 消耗

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 配置
USAGE_LOG_DIR="$HOME/.claude/usage-logs"
TODAY=$(date '+%Y-%m-%d')
USAGE_LOG="$USAGE_LOG_DIR/usage-$TODAY.log"

# 確保日誌目錄存在
mkdir -p "$USAGE_LOG_DIR"

# 函數：記錄 Agent 使用
log_agent_usage() {
    local agent_name="$1"
    local model="$2"
    local task_id="${3:-unknown}"
    
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "$timestamp|$agent_name|$model|$task_id" >> "$USAGE_LOG"
}

# 函數：顯示今日統計
show_today_stats() {
    echo -e "${BLUE}📊 Claude 用量報告 ($TODAY)${NC}"
    echo "================================"
    
    if [ ! -f "$USAGE_LOG" ]; then
        echo -e "${YELLOW}今日尚無使用記錄${NC}"
        return
    fi
    
    echo -e "\n${CYAN}🤖 Agent 使用統計：${NC}"
    
    # 統計各 Agent 使用次數
    echo -e "${GREEN}Opus 模型：${NC}"
    grep "|opus|" "$USAGE_LOG" 2>/dev/null | awk -F'|' '{print "  - " $2}' | sort | uniq -c | sort -rn || echo "  無使用記錄"
    
    echo -e "\n${YELLOW}Sonnet 模型：${NC}"
    grep "|sonnet|" "$USAGE_LOG" 2>/dev/null | awk -F'|' '{print "  - " $2}' | sort | uniq -c | sort -rn || echo "  無使用記錄"
    
    echo -e "\n${CYAN}Haiku 模型：${NC}"
    grep "|haiku|" "$USAGE_LOG" 2>/dev/null | awk -F'|' '{print "  - " $2}' | sort | uniq -c | sort -rn || echo "  無使用記錄"
    
    # 總計
    echo -e "\n${MAGENTA}💰 模型使用總計：${NC}"
    local opus_count=$(grep -c "|opus|" "$USAGE_LOG" 2>/dev/null || echo "0")
    local sonnet_count=$(grep -c "|sonnet|" "$USAGE_LOG" 2>/dev/null || echo "0")
    local haiku_count=$(grep -c "|haiku|" "$USAGE_LOG" 2>/dev/null || echo "0")
    
    echo "  Opus:   $opus_count 次"
    echo "  Sonnet: $sonnet_count 次"
    echo "  Haiku:  $haiku_count 次"
    
    # 預估 token（粗略估算）
    echo -e "\n${BLUE}📈 預估 Token 使用：${NC}"
    local opus_tokens=$((opus_count * 5000))
    local sonnet_tokens=$((sonnet_count * 2000))
    local haiku_tokens=$((haiku_count * 500))
    local total_tokens=$((opus_tokens + sonnet_tokens + haiku_tokens))
    
    echo "  Opus:   ~$opus_tokens tokens"
    echo "  Sonnet: ~$sonnet_tokens tokens"
    echo "  Haiku:  ~$haiku_tokens tokens"
    echo "  ${GREEN}總計:   ~$total_tokens tokens${NC}"
}

# 函數：顯示本週統計
show_week_stats() {
    echo -e "${BLUE}📊 本週用量報告${NC}"
    echo "================================"
    
    local week_start=$(date -v-7d '+%Y-%m-%d' 2>/dev/null || date -d '7 days ago' '+%Y-%m-%d')
    
    echo -e "\n${CYAN}📅 統計期間：$week_start ~ $TODAY${NC}\n"
    
    # 合併本週所有日誌
    local temp_file=$(mktemp)
    find "$USAGE_LOG_DIR" -name "usage-*.log" -newermt "$week_start" -exec cat {} \; > "$temp_file" 2>/dev/null
    
    if [ ! -s "$temp_file" ]; then
        echo -e "${YELLOW}本週尚無使用記錄${NC}"
        rm "$temp_file"
        return
    fi
    
    # 每日使用趨勢
    echo -e "${CYAN}📈 每日使用趨勢：${NC}"
    awk -F'|' '{print $1}' "$temp_file" | awk '{print $1}' | sort | uniq -c | while read count date; do
        echo "  $date: $count 次"
    done
    
    # 模型使用統計
    echo -e "\n${MAGENTA}💰 本週模型使用：${NC}"
    local opus_count=$(grep -c "|opus|" "$temp_file" 2>/dev/null || echo "0")
    local sonnet_count=$(grep -c "|sonnet|" "$temp_file" 2>/dev/null || echo "0")
    local haiku_count=$(grep -c "|haiku|" "$temp_file" 2>/dev/null || echo "0")
    
    echo "  Opus:   $opus_count 次"
    echo "  Sonnet: $sonnet_count 次"
    echo "  Haiku:  $haiku_count 次"
    
    # 最常用的 Agent
    echo -e "\n${YELLOW}🏆 最常用 Agent：${NC}"
    awk -F'|' '{print $2}' "$temp_file" | sort | uniq -c | sort -rn | head -5 | while read count agent; do
        echo "  $agent: $count 次"
    done
    
    rm "$temp_file"
}

# 函數：優化建議
show_optimization_tips() {
    echo -e "\n${BLUE}💡 優化建議${NC}"
    echo "================================"
    
    if [ ! -f "$USAGE_LOG" ]; then
        return
    fi
    
    local opus_count=$(grep -c "|opus|" "$USAGE_LOG" 2>/dev/null || echo "0")
    local reviewer_opus=$(grep "|REVIEWER|opus|" "$USAGE_LOG" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$opus_count" -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Opus 使用較多 ($opus_count 次)${NC}"
        
        if [ "$reviewer_opus" -gt 0 ]; then
            echo -e "${RED}❌ 發現 REVIEWER 使用 opus！${NC}"
            echo "   建議：將 REVIEWER 改為 sonnet 可節省大量用量"
        fi
    else
        echo -e "${GREEN}✅ Opus 使用控制良好 ($opus_count 次)${NC}"
    fi
    
    # 檢查是否有異常高頻使用
    local total_count=$(wc -l < "$USAGE_LOG" 2>/dev/null || echo "0")
    if [ "$total_count" -gt 100 ]; then
        echo -e "${YELLOW}⚠️  今日使用頻率較高 ($total_count 次)${NC}"
        echo "   建議：檢查是否有重複執行的任務"
    fi
}

# 函數：清理舊日誌
cleanup_old_logs() {
    echo -e "${YELLOW}🧹 清理 30 天前的日誌...${NC}"
    find "$USAGE_LOG_DIR" -name "usage-*.log" -mtime +30 -delete
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 主選單
case "${1:-}" in
    log)
        # 記錄使用（由其他腳本呼叫）
        log_agent_usage "$2" "$3" "$4"
        ;;
    today|t)
        show_today_stats
        show_optimization_tips
        ;;
    week|w)
        show_week_stats
        ;;
    clean)
        cleanup_old_logs
        ;;
    report|r)
        show_today_stats
        show_optimization_tips
        echo ""
        show_week_stats
        ;;
    *)
        echo "用法: $0 {today|week|report|clean}"
        echo ""
        echo "指令："
        echo "  today (t)   - 顯示今日用量統計"
        echo "  week (w)    - 顯示本週用量統計"
        echo "  report (r)  - 完整報告（今日+本週）"
        echo "  clean       - 清理 30 天前的日誌"
        echo ""
        echo "範例："
        echo "  $0 today    # 查看今日用量"
        echo "  $0 week     # 查看本週趨勢"
        echo "  $0 report   # 完整報告"
        exit 1
        ;;
esac
