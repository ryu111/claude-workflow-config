#!/bin/bash
# PreToolUse Hook (matcher: Task) - 檢查目標 agent 是否有 core skill
#
# 當 Main Agent 使用 Task 工具呼叫 subagent 時：
# 1. 從 stdin 讀取 tool_input
# 2. 取得 subagent_type
# 3. 檢查對應的 agent 檔案是否有 skills: core
# 4. 如果沒有，發出警告（不阻擋）

set -euo pipefail

AGENTS_DIR="${HOME}/.claude/agents"

# 讀取 stdin 的 JSON 輸入
read -r input

# 取得 subagent_type
subagent_type=$(echo "$input" | jq -r '.tool_input.subagent_type // empty')

# 如果沒有 subagent_type，直接通過
if [[ -z "$subagent_type" ]]; then
  exit 0
fi

# 對應的 agent 檔案（處理 skills-agents 的特殊情況）
if [[ "$subagent_type" == "skills-agents" ]]; then
  agent_file="${AGENTS_DIR}/skills-agents.md"
else
  agent_file="${AGENTS_DIR}/${subagent_type}.md"
fi

# 如果檔案不存在，直接通過（可能是內建 agent）
if [[ ! -f "$agent_file" ]]; then
  exit 0
fi

# 檢查是否有 skills:.*core
if ! grep -q "^skills:.*core" "$agent_file"; then
  # 發出警告訊息，但不阻擋執行
  jq -n '{
    "systemMessage": "⚠️ 警告：Agent '"$subagent_type"' 未包含 core skill，核心規則可能未載入。請檢查 agent frontmatter。"
  }'
else
  # 有 core skill，靜默通過
  exit 0
fi
