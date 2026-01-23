#!/bin/bash
# validate-all.sh - 統一驗證入口
# 用法: validate-all.sh [skill|agent|plugin|hooks] <path>

TYPE="$1"
PATH_ARG="$2"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

show_help() {
    echo "Claude Code 工具驗證腳本"
    echo ""
    echo "用法: validate-all.sh [type] <path>"
    echo ""
    echo "類型:"
    echo "  skill   驗證 Skill 目錄結構和內容"
    echo "  agent   驗證 Agent 檔案格式"
    echo "  plugin  驗證 Plugin 結構和 manifest"
    echo "  hooks   驗證 Hooks JSON 配置"
    echo ""
    echo "範例:"
    echo "  validate-all.sh skill ~/.claude/skills/my-skill"
    echo "  validate-all.sh agent ~/.claude/agents/my-agent.md"
    echo "  validate-all.sh plugin ./my-plugin"
    echo "  validate-all.sh hooks ~/.claude/settings.json"
    echo ""
    echo "也可以直接使用單獨的腳本:"
    echo "  validate-skill.sh <skill-directory>"
    echo "  validate-agent.sh <agent-file.md>"
    echo "  validate-plugin.sh <plugin-directory>"
    echo "  validate-hooks.sh <settings.json>"
}

case "$TYPE" in
    skill)
        if [ -z "$PATH_ARG" ]; then
            echo "錯誤: 請提供 skill 目錄路徑"
            echo ""
            show_help
            exit 1
        fi
        "$SCRIPT_DIR/validate-skill.sh" "$PATH_ARG"
        ;;
    agent)
        if [ -z "$PATH_ARG" ]; then
            echo "錯誤: 請提供 agent 檔案路徑"
            echo ""
            show_help
            exit 1
        fi
        "$SCRIPT_DIR/validate-agent.sh" "$PATH_ARG"
        ;;
    plugin)
        if [ -z "$PATH_ARG" ]; then
            echo "錯誤: 請提供 plugin 目錄路徑"
            echo ""
            show_help
            exit 1
        fi
        "$SCRIPT_DIR/validate-plugin.sh" "$PATH_ARG"
        ;;
    hooks)
        if [ -z "$PATH_ARG" ]; then
            echo "錯誤: 請提供 hooks 配置檔案路徑"
            echo ""
            show_help
            exit 1
        fi
        "$SCRIPT_DIR/validate-hooks.sh" "$PATH_ARG"
        ;;
    -h|--help|help)
        show_help
        exit 0
        ;;
    *)
        if [ -z "$TYPE" ]; then
            show_help
        else
            echo "錯誤: 未知的類型 '$TYPE'"
            echo ""
            show_help
        fi
        exit 1
        ;;
esac
