#!/bin/bash
# LLM Service 自動啟動 + 狀態檢查 Hook
# 在 Session 開始時自動啟動 Menu Bar App（包含 Service + GUI + Terminal Dashboard）

LLM_SERVICE_URL="http://127.0.0.1:8765"
PROJECT_PATH="/Users/sbu/Desktop/side project/local-llm-mcp"
LOG_FILE="$HOME/.local-llm-mcp/service.log"
APP_LOG_FILE="$HOME/.local-llm-mcp/app.log"

# 確保目錄存在
mkdir -p "$HOME/.local-llm-mcp"

# 嘗試連接 LLM Service
response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "${LLM_SERVICE_URL}/health" 2>/dev/null)

if [ "$response" = "200" ]; then
    # Service 已運行，檢查模型狀態
    status=$(curl -s --connect-timeout 2 "${LLM_SERVICE_URL}/status" 2>/dev/null)
    model_loaded=$(echo "$status" | grep -o '"model_loaded":[^,}]*' | cut -d: -f2 | tr -d ' ')

    if [ "$model_loaded" = "true" ]; then
        echo -e "\033[32m📂 LLM Service\033[0m \033[2m→\033[0m 🟢 \033[1m模型已就緒\033[0m"
    else
        echo -e "\033[33m📂 LLM Service\033[0m \033[2m→\033[0m 🔴 \033[1m待命中\033[0m \033[90m(點擊 Menu Bar 載入模型)\033[0m"
    fi
else
    # Service 未運行，檢查 Menu Bar App 是否已在運行
    if pgrep -f "local_llm_mcp.menubar_app" > /dev/null 2>&1; then
        echo -e "\033[33m📂 LLM Service\033[0m \033[2m→\033[0m 🟡 \033[1mMenu Bar App 運行中\033[0m \033[90m(Service 啟動中...)\033[0m"
    else
        # 啟動 Menu Bar App（會自動啟動 Service）
        echo -e "\033[34m📂 LLM Service\033[0m \033[2m→\033[0m 🔄 \033[1m啟動 Menu Bar App...\033[0m"

        # 使用 osascript 在背景啟動 Python GUI App
        osascript -e "do shell script \"cd '${PROJECT_PATH}' && PYTHONPATH='${PROJECT_PATH}/src' python3 -m local_llm_mcp.menubar_app >> '${APP_LOG_FILE}' 2>&1 &\"" > /dev/null 2>&1

        # 等待 Service 啟動（最多 8 秒）
        for i in {1..16}; do
            sleep 0.5
            check=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 "${LLM_SERVICE_URL}/health" 2>/dev/null)
            if [ "$check" = "200" ]; then
                echo -e "\033[32m📂 LLM Service\033[0m \033[2m→\033[0m 🔴 \033[1m已啟動\033[0m \033[90m(Menu Bar 已就緒，模型待載入)\033[0m"
                exit 0
            fi
        done

        # 如果 Service 沒啟動，但 App 可能啟動了
        if pgrep -f "local_llm_mcp.menubar_app" > /dev/null 2>&1; then
            echo -e "\033[33m📂 LLM Service\033[0m \033[2m→\033[0m 🟡 \033[1mMenu Bar App 已啟動\033[0m \033[90m(請從 Menu Bar 啟動 Service)\033[0m"
        else
            echo -e "\033[31m📂 LLM Service\033[0m \033[2m→\033[0m ❌ \033[1m啟動失敗\033[0m \033[90m(查看 $APP_LOG_FILE)\033[0m"
        fi
    fi
fi
