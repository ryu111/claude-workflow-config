#!/bin/bash
# PostToolUse Hook: Log tool usage
#
# Usage in settings.json:
# {
#   "hooks": {
#     "PostToolUse": [{
#       "matcher": ".*",
#       "hooks": [{"type": "command", "command": "~/.claude/hooks/log-tools.sh"}]
#     }]
#   }
# }

set -euo pipefail

LOG_FILE="${HOME}/.claude/tool-usage.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Read input from stdin
read -r input

# Extract tool information
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
session_id=$(echo "$input" | jq -r '.session_id // "unknown"')
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

# Log the tool usage
echo "[$timestamp] Session: $session_id | Tool: $tool_name" >> "$LOG_FILE"

# Optional: Keep log file from growing too large (keep last 1000 lines)
if [[ -f "$LOG_FILE" ]]; then
  tail -1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

# No output needed - this is just for logging
