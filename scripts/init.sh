#!/bin/bash
#
# Workflow 3.0 - Zero-Config Initialization Script
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/ryu111/claude-workflow-config/workflow-3.0/scripts/init.sh | bash
#   or
#   ~/.claude/scripts/init.sh [project-path]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
WORKFLOW_VERSION="3.0"
CLAUDE_HOME="${HOME}/.claude"
PROJECT_PATH="${1:-.}"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Workflow ${WORKFLOW_VERSION} - Zero-Config Initialization              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# =============================================================================
# Step 1: Detect Project Type
# =============================================================================

detect_project_type() {
    local path="$1"

    if [[ -f "${path}/package.json" ]]; then
        if grep -q '"typescript"' "${path}/package.json" 2>/dev/null; then
            echo "typescript"
        else
            echo "javascript"
        fi
    elif [[ -f "${path}/pyproject.toml" ]] || [[ -f "${path}/setup.py" ]] || [[ -f "${path}/requirements.txt" ]]; then
        echo "python"
    elif [[ -f "${path}/go.mod" ]]; then
        echo "go"
    elif [[ -f "${path}/Cargo.toml" ]]; then
        echo "rust"
    elif [[ -f "${path}/pom.xml" ]] || [[ -f "${path}/build.gradle" ]]; then
        echo "java"
    else
        echo "unknown"
    fi
}

PROJECT_TYPE=$(detect_project_type "$PROJECT_PATH")
echo -e "${GREEN}[1/4]${NC} Detected project type: ${YELLOW}${PROJECT_TYPE}${NC}"

# =============================================================================
# Step 2: Check Prerequisites
# =============================================================================

echo -e "${GREEN}[2/4]${NC} Checking prerequisites..."

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 (not found)"
        return 1
    fi
}

PREREQS_OK=true

# Core
check_command "git" || PREREQS_OK=false
check_command "node" || PREREQS_OK=false

# Project-specific
case "$PROJECT_TYPE" in
    python)
        check_command "python3" || PREREQS_OK=false
        check_command "pytest" || echo -e "  ${YELLOW}!${NC} pytest (optional, for testing)"
        ;;
    typescript|javascript)
        check_command "npm" || PREREQS_OK=false
        ;;
    go)
        check_command "go" || PREREQS_OK=false
        ;;
    rust)
        check_command "cargo" || PREREQS_OK=false
        ;;
esac

if [[ "$PREREQS_OK" != "true" ]]; then
    echo -e "${RED}Error: Missing prerequisites. Please install required tools.${NC}"
    exit 1
fi

# =============================================================================
# Step 3: Create Project .claude Directory
# =============================================================================

echo -e "${GREEN}[3/4]${NC} Setting up project configuration..."

PROJECT_CLAUDE_DIR="${PROJECT_PATH}/.claude"
mkdir -p "${PROJECT_CLAUDE_DIR}"

# Create project CLAUDE.md
cat > "${PROJECT_CLAUDE_DIR}/CLAUDE.md" << 'CLAUDEMD'
# Project Configuration

## Tech Stack

```
Type: [Auto-detected]
Language: [Auto-detected]
Framework: [Edit this]
```

## Project-Specific Rules

<!-- Add project-specific rules here -->

## D→R→T Workflow

This project uses the D→R→T workflow (Developer → Reviewer → Tester).
All code changes must pass through this flow.

## Trigger Keywords

| Keyword | Agent |
|---------|-------|
| 規劃, plan | ARCHITECT |
| 設計, design | DESIGNER |
| 實作, implement | DEVELOPER |
| 審查, review | REVIEWER |
| 測試, test | TESTER |
| debug, 除錯 | DEBUGGER |
CLAUDEMD

# Update tech stack in CLAUDE.md
case "$PROJECT_TYPE" in
    typescript)
        sed -i.bak "s/\[Auto-detected\]/TypeScript/g" "${PROJECT_CLAUDE_DIR}/CLAUDE.md"
        rm -f "${PROJECT_CLAUDE_DIR}/CLAUDE.md.bak"
        ;;
    javascript)
        sed -i.bak "s/\[Auto-detected\]/JavaScript/g" "${PROJECT_CLAUDE_DIR}/CLAUDE.md"
        rm -f "${PROJECT_CLAUDE_DIR}/CLAUDE.md.bak"
        ;;
    python)
        sed -i.bak "s/\[Auto-detected\]/Python/g" "${PROJECT_CLAUDE_DIR}/CLAUDE.md"
        rm -f "${PROJECT_CLAUDE_DIR}/CLAUDE.md.bak"
        ;;
    go)
        sed -i.bak "s/\[Auto-detected\]/Go/g" "${PROJECT_CLAUDE_DIR}/CLAUDE.md"
        rm -f "${PROJECT_CLAUDE_DIR}/CLAUDE.md.bak"
        ;;
    rust)
        sed -i.bak "s/\[Auto-detected\]/Rust/g" "${PROJECT_CLAUDE_DIR}/CLAUDE.md"
        rm -f "${PROJECT_CLAUDE_DIR}/CLAUDE.md.bak"
        ;;
esac

# Create .gitignore for .claude if not exists
if [[ ! -f "${PROJECT_CLAUDE_DIR}/.gitignore" ]]; then
    cat > "${PROJECT_CLAUDE_DIR}/.gitignore" << 'GITIGNORE'
# Local settings (not tracked)
settings.local.json

# Temporary files
*.tmp
*.log
GITIGNORE
fi

echo -e "  ${GREEN}✓${NC} Created ${PROJECT_CLAUDE_DIR}/CLAUDE.md"

# =============================================================================
# Step 4: Create OpenSpec Directory Structure
# =============================================================================

echo -e "${GREEN}[4/4]${NC} Creating OpenSpec directory structure..."

mkdir -p "${PROJECT_PATH}/openspec/specs"
mkdir -p "${PROJECT_PATH}/openspec/changes"
mkdir -p "${PROJECT_PATH}/openspec/archive"

# Create README for openspec
cat > "${PROJECT_PATH}/openspec/README.md" << 'OPENSPECMD'
# OpenSpec Directory

Spec-driven development with Kanban stages.

## Structure

```
openspec/
├── specs/      # Backlog - Specs waiting to be worked on
├── changes/    # WIP - Currently in progress
└── archive/    # Done - Completed specs
```

## Workflow

1. **ARCHITECT** creates spec in `specs/[id]/`
2. Move to `changes/[id]/` when starting
3. Move to `archive/[id]/` when completed

## Spec Structure

```
[change-id]/
├── proposal.md     # Change proposal
├── tasks.md        # Task checklist
└── notes.md        # Development notes (optional)
```
OPENSPECMD

echo -e "  ${GREEN}✓${NC} Created openspec/ directory structure"

# =============================================================================
# Summary
# =============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Initialization Complete!                               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Project type: ${YELLOW}${PROJECT_TYPE}${NC}"
echo ""
echo "Created:"
echo -e "  ${BLUE}${PROJECT_CLAUDE_DIR}/CLAUDE.md${NC} - Project configuration"
echo -e "  ${BLUE}${PROJECT_PATH}/openspec/${NC} - Spec-driven development"
echo ""
echo "Next steps:"
echo "  1. Edit ${PROJECT_CLAUDE_DIR}/CLAUDE.md to add project-specific rules"
echo "  2. Use '規劃 [feature]' to start planning with ARCHITECT"
echo "  3. Use '接手 [change-id]' to resume work on a spec"
echo ""
