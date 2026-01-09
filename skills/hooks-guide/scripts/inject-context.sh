#!/bin/bash
# SessionStart Hook: Inject project context
#
# Usage in settings.json:
# {
#   "hooks": {
#     "SessionStart": [{
#       "matcher": ".*",
#       "hooks": [{"type": "command", "command": "~/.claude/hooks/inject-context.sh"}]
#     }]
#   }
# }

set -euo pipefail

# Collect context information
context=""

# Git status
if git rev-parse --is-inside-work-tree &>/dev/null; then
  branch=$(git branch --show-current 2>/dev/null || echo "unknown")
  status=$(git status --short 2>/dev/null | head -10)
  context+="## Git Status\n"
  context+="Branch: $branch\n"
  if [[ -n "$status" ]]; then
    context+="\`\`\`\n$status\n\`\`\`\n"
  else
    context+="Working tree clean\n"
  fi
  context+="\n"
fi

# Recent commits
if git rev-parse --is-inside-work-tree &>/dev/null; then
  commits=$(git log --oneline -5 2>/dev/null || echo "")
  if [[ -n "$commits" ]]; then
    context+="## Recent Commits\n"
    context+="\`\`\`\n$commits\n\`\`\`\n"
    context+="\n"
  fi
fi

# TODO items from codebase
todos=$(grep -r "TODO:" --include="*.ts" --include="*.tsx" --include="*.js" . 2>/dev/null | head -5 || echo "")
if [[ -n "$todos" ]]; then
  context+="## TODO Items\n"
  context+="\`\`\`\n$todos\n\`\`\`\n"
fi

# Output as JSON
if [[ -n "$context" ]]; then
  jq -n --arg ctx "$context" '{"systemMessage": $ctx}'
fi
