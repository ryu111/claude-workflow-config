#!/bin/bash
# PreToolUse Hook: Block dangerous commands
#
# Usage in settings.json:
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "Bash",
#       "hooks": [{"type": "command", "command": "~/.claude/hooks/block-dangerous.sh"}]
#     }]
#   }
# }

set -euo pipefail

# Read input from stdin
read -r input

# Extract command from tool input
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# Dangerous patterns to block
dangerous_patterns=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \*"
  "mkfs"
  "dd if="
  ":(){:|:&};:"
  "chmod -R 777 /"
  "chown -R"
)

# Check for dangerous patterns
for pattern in "${dangerous_patterns[@]}"; do
  if [[ "$command" == *"$pattern"* ]]; then
    echo "{\"permissionDecision\": \"deny\", \"reason\": \"Blocked dangerous command: $pattern\"}"
    exit 0
  fi
done

# Allow safe commands
echo '{"permissionDecision": "allow"}'
