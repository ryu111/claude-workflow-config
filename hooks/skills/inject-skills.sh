#!/bin/bash

# SessionStart Hook: Inject PROJECT-LEVEL skills only
# Global skills are handled by Claude Code's built-in system + agent skills: field
#
# Only loads SKILL.md files (not references/)
# References are loaded on-demand via Progressive Disclosure pattern
#
# Safeguards:
# - MAX_SKILLS: 10 (prevent context overflow)
# - MAX_SKILL_SIZE: 10KB per file
# - MAX_TOTAL_SIZE: 50KB total

set -euo pipefail

# Only scan project-level skills (global handled by Claude Code)
PROJECT_SKILLS_DIR=".claude/skills"

MAX_SKILLS=10
MAX_SKILL_SIZE=10240      # 10KB per file
MAX_TOTAL_SIZE=51200      # 50KB total

# Collect skill files from both locations
SKILL_FILES=""
LOADED_NAMES=""

# Function to get skill name from file path
# If file is SKILL.md, use parent directory name; otherwise use filename
get_skill_name() {
  local file="$1"
  local filename=$(basename "$file" .md)
  if [[ "$filename" == "SKILL" ]]; then
    # Use parent directory name
    basename "$(dirname "$file")"
  else
    echo "$filename"
  fi
}

# Function to add SKILL.md files only (not references/)
add_skills_from_dir() {
  local dir="$1"
  if [[ -d "$dir" ]]; then
    # Only find SKILL.md files, max 2 levels deep (skills/name/SKILL.md)
    local files=$(find "$dir" -maxdepth 2 -name "SKILL.md" -type f 2>/dev/null || true)
    for file in $files; do
      local name=$(get_skill_name "$file")
      # Skip if already loaded
      if [[ ! "$LOADED_NAMES" =~ ":${name}:" ]]; then
        SKILL_FILES+="$file"$'\n'
        LOADED_NAMES+=":${name}:"
      fi
    done
  fi
}

# Only load project-level skills (global skills handled by Claude Code built-in)
add_skills_from_dir "$PROJECT_SKILLS_DIR"

# Limit to MAX_SKILLS
SKILL_FILES=$(echo "$SKILL_FILES" | head -n "$MAX_SKILLS")

if [[ -z "$SKILL_FILES" ]]; then
  exit 0
fi

# Build skills content with size limits
SKILLS_CONTENT=""
TOTAL_SIZE=0
LOADED_COUNT=0
SKIPPED_FILES=""

while IFS= read -r skill_file; do
  [[ -z "$skill_file" ]] && continue

  skill_name=$(get_skill_name "$skill_file")
  file_size=$(stat -f%z "$skill_file" 2>/dev/null || stat -c%s "$skill_file" 2>/dev/null || echo "0")

  # Skip if file too large
  if [[ "$file_size" -gt "$MAX_SKILL_SIZE" ]]; then
    SKIPPED_FILES+="  - $skill_name (${file_size}B > ${MAX_SKILL_SIZE}B limit)\n"
    continue
  fi

  # Check total size limit
  NEW_TOTAL=$((TOTAL_SIZE + file_size))
  if [[ "$NEW_TOTAL" -gt "$MAX_TOTAL_SIZE" ]]; then
    SKIPPED_FILES+="  - $skill_name (would exceed total ${MAX_TOTAL_SIZE}B limit)\n"
    continue
  fi

  skill_body=$(cat "$skill_file")
  TOTAL_SIZE=$NEW_TOTAL
  LOADED_COUNT=$((LOADED_COUNT + 1))

  SKILLS_CONTENT+="
<skill name=\"$skill_name\">
$skill_body
</skill>
"
done <<< "$SKILL_FILES"

# Build status message
STATUS_MSG="📦 Project Skills: $LOADED_COUNT"

if [[ -n "$SKIPPED_FILES" ]]; then
  STATUS_MSG+="\n⚠️  Skipped (size limits):\n$SKIPPED_FILES"
fi

# Output JSON to inject into subagent context
if [[ -n "$SKILLS_CONTENT" ]]; then
  jq -n \
    --arg content "$SKILLS_CONTENT" \
    --arg status "$STATUS_MSG" \
    '{
      "systemMessage": ($status + "\n" + $content)
    }'
fi
