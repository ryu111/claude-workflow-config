#!/bin/bash
# Session End Hook - 清理殘留的 Python 進程
# 在每次 session 結束時自動執行
#
# 安全機制：
# - 白名單保護重要服務（LLM、MCP、Jupyter 等）
# - 只清理明確的孤立進程

# 白名單：這些進程不會被清理
# 使用 grep -E 的正則表達式格式
PROTECTED_PATTERNS="mcp|MCP|llm|LLM|memory[-_]service|jupyter|notebook|pytest|ipython|uvicorn|fastapi|flask|gunicorn|celery|streamlit|gradio|ray|dask|airflow"

# 找出運行超過 10 分鐘的 Python 進程（排除白名單）
ORPHANED=$(ps -eo pid,etime,args 2>/dev/null | \
    grep -E "[pP]ython" | \
    grep -v grep | \
    grep -v -iE "$PROTECTED_PATTERNS" | \
    awk '
        $2 ~ /-/ { print $1 }  # 運行超過 1 天
        $2 ~ /[0-9]{2}:[0-9]{2}:[0-9]{2}/ {
            split($2, time, ":")
            if (time[1] >= 10) print $1  # 運行超過 10 分鐘
        }
    ' || true)

if [ -n "$ORPHANED" ]; then
    echo "🧹 清理殘留 Python 進程（已排除白名單服務）..."
    CLEANED=0
    for pid in $ORPHANED; do
        # 先嘗試優雅終止
        if kill -15 "$pid" 2>/dev/null; then
            sleep 0.5
            # 如果還在運行，強制終止
            kill -9 "$pid" 2>/dev/null || true
            ((CLEANED++)) || true
        fi
    done
    if [ $CLEANED -gt 0 ]; then
        echo "✅ 已清理 $CLEANED 個殘留進程"
    fi
fi
