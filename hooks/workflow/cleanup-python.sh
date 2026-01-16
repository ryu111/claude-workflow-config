#!/bin/bash
# Session End Hook - 清理殘留的 Python 進程
# 在每次 session 結束時自動執行

# 找出運行超過 10 分鐘的 Python 進程
ORPHANED=$(ps -eo pid,etime,comm | grep -E "python|Python" | grep -v grep | awk '
    $2 ~ /-/ { print $1 }  # 運行超過 1 天
    $2 ~ /[0-9]{2}:[0-9]{2}:[0-9]{2}/ { 
        split($2, time, ":")
        if (time[1] >= 10) print $1  # 運行超過 10 分鐘
    }
' || true)

if [ -n "$ORPHANED" ]; then
    echo "🧹 清理殘留 Python 進程..."
    for pid in $ORPHANED; do
        # 先嘗試優雅終止
        kill -15 $pid 2>/dev/null || true
        sleep 0.5
        # 如果還在運行，強制終止
        kill -9 $pid 2>/dev/null || true
    done
    echo "✅ 已清理 $(echo $ORPHANED | wc -w | tr -d ' ') 個殘留進程"
fi
