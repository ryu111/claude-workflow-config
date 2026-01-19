#!/bin/bash
# Task Report Generator
#
# 用途：產出格式化的任務執行報告
#
# 使用方式：
#   ./task-report-generator.sh              # 輸出人類可讀格式
#   ./task-report-generator.sh --json       # 輸出 JSON 格式
#
# 輸出：
# - Task 呼叫統計
# - D→R→T 合規率
# - 執行者分佈（Main vs Subagent）
# - 違規記錄摘要

RESULTS_DIR="$HOME/.claude/logs/workflow"
TASK_LOG="$RESULTS_DIR/task-execution.jsonl"
VIOLATIONS_LOG="$RESULTS_DIR/workflow-violations.jsonl"
DELEGATION_LOG="$RESULTS_DIR/delegation.log"

# 解析參數
OUTPUT_JSON=false
if [ "$1" = "--json" ]; then
    OUTPUT_JSON=true
fi

# 檢查檔案是否存在
if [ ! -f "$TASK_LOG" ]; then
    if [ "$OUTPUT_JSON" = true ]; then
        echo '{"error": "No task execution data found"}'
    else
        echo "❌ 找不到任務執行記錄: $TASK_LOG"
    fi
    exit 1
fi

# 統計任務呼叫
total_tasks=$(wc -l < "$TASK_LOG" | tr -d ' ')
developer_tasks=$(grep -c '"subagent_type": "developer"' "$TASK_LOG" 2>/dev/null || echo 0)
reviewer_tasks=$(grep -c '"subagent_type": "reviewer"' "$TASK_LOG" 2>/dev/null || echo 0)
tester_tasks=$(grep -c '"subagent_type": "tester"' "$TASK_LOG" 2>/dev/null || echo 0)
main_executor=$(grep -c '"executor": "main"' "$TASK_LOG" 2>/dev/null || echo 0)

# 統計違規
violations_count=0
if [ -f "$VIOLATIONS_LOG" ]; then
    violations_count=$(wc -l < "$VIOLATIONS_LOG" | tr -d ' ')
fi

# 計算合規率（簡化版本：reviewer_tasks 應該接近 developer_tasks）
if [ "$developer_tasks" -gt 0 ]; then
    compliance_rate=$(awk "BEGIN {printf \"%.1f\", ($reviewer_tasks / $developer_tasks) * 100}")
else
    compliance_rate="N/A"
fi

# 輸出報告
if [ "$OUTPUT_JSON" = true ]; then
    # JSON 格式
    cat << EOF
{
  "summary": {
    "total_tasks": $total_tasks,
    "developer_tasks": $developer_tasks,
    "reviewer_tasks": $reviewer_tasks,
    "tester_tasks": $tester_tasks,
    "violations": $violations_count
  },
  "executor_distribution": {
    "main": $main_executor,
    "subagents": $((total_tasks - main_executor))
  },
  "compliance": {
    "rate": "$compliance_rate%",
    "status": "$([ "$reviewer_tasks" -ge "$developer_tasks" ] && echo "good" || echo "needs_improvement")"
  }
}
EOF
else
    # 人類可讀格式
    cat << EOF

╔═══════════════════════════════════════════════════════════════╗
║              📊 任務執行報告                                   ║
╚═══════════════════════════════════════════════════════════════╝

📈 任務統計
───────────────────────────────────────────────────────────────
  總任務數:        $total_tasks
  Developer:       $developer_tasks
  Reviewer:        $reviewer_tasks
  Tester:          $tester_tasks

👥 執行者分佈
───────────────────────────────────────────────────────────────
  Main Agent:      $main_executor
  Subagents:       $((total_tasks - main_executor))

✅ D→R→T 合規性
───────────────────────────────────────────────────────────────
  審查覆蓋率:      $compliance_rate%
  違規記錄:        $violations_count 筆

EOF

    # 若有違規，顯示最近幾筆
    if [ "$violations_count" -gt 0 ]; then
        echo "⚠️  最近違規記錄："
        echo "───────────────────────────────────────────────────────────────"
        tail -n 3 "$VIOLATIONS_LOG" | while IFS= read -r line; do
            violation_type=$(echo "$line" | grep -oE '"type"\s*:\s*"[^"]*"' | sed 's/.*"type"[[:space:]]*:[[:space:]]*"//;s/"$//')
            violation_msg=$(echo "$line" | grep -oE '"message"\s*:\s*"[^"]*"' | sed 's/.*"message"[[:space:]]*:[[:space:]]*"//;s/"$//')
            echo "  [$violation_type] $violation_msg"
        done
        echo ""
    fi

    echo "💡 建議："
    if [ "$reviewer_tasks" -lt "$developer_tasks" ]; then
        echo "   - 部分開發任務可能未經審查，建議補充 Task(reviewer)"
    fi
    if [ "$tester_tasks" -lt "$reviewer_tasks" ]; then
        echo "   - 部分審查後未進行測試，建議補充 Task(tester)"
    fi
    if [ "$violations_count" -gt 5 ]; then
        echo "   - 違規記錄較多，建議檢視工作流程"
    fi
    if [ "$reviewer_tasks" -ge "$developer_tasks" ] && [ "$tester_tasks" -ge "$reviewer_tasks" ]; then
        echo "   ✨ D→R→T 工作流執行良好！"
    fi
    echo ""
fi
