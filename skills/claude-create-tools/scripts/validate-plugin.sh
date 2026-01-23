#!/bin/bash
# validate-plugin.sh - 驗證 Plugin 結構
# 用法: validate-plugin.sh <plugin-directory>

PLUGIN_DIR="$1"

if [ -z "$PLUGIN_DIR" ]; then
    echo "用法: validate-plugin.sh <plugin-directory>"
    exit 1
fi

echo "🔍 驗證 Plugin: $PLUGIN_DIR"
ERRORS=0
WARNINGS=0

# 1. 檢查 plugin.json 存在
MANIFEST="$PLUGIN_DIR/.claude-plugin/plugin.json"
if [ ! -f "$MANIFEST" ]; then
    echo "❌ 缺少 .claude-plugin/plugin.json"
    ERRORS=$((ERRORS + 1))
    echo ""
    echo "❌ Plugin 驗證失敗：$ERRORS 個錯誤"
    exit 1
fi

echo "✓ 找到 plugin.json"

# 2. 檢查 JSON 格式有效
if ! jq empty "$MANIFEST" 2>/dev/null; then
    echo "❌ plugin.json 不是有效的 JSON"
    ERRORS=$((ERRORS + 1))
    echo ""
    echo "❌ Plugin 驗證失敗：$ERRORS 個錯誤"
    exit 1
fi

echo "✓ JSON 格式有效"

# 3. 檢查必要欄位 name
NAME=$(jq -r '.name // empty' "$MANIFEST")
if [ -z "$NAME" ]; then
    echo "❌ plugin.json 缺少 name 欄位"
    ERRORS=$((ERRORS + 1))
else
    echo "✓ name: $NAME"

    # 檢查 name 格式
    if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
        echo "⚠️  name 格式可能不符合規範: '$NAME'（建議使用 kebab-case）"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 4. 檢查 version 格式（如果有）
VERSION=$(jq -r '.version // empty' "$MANIFEST")
if [ -n "$VERSION" ]; then
    if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✓ version: $VERSION"
    else
        echo "⚠️  version 格式可能不符合語義版本: '$VERSION'（建議: X.Y.Z）"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 5. 檢查 description（如果有）
DESC=$(jq -r '.description // empty' "$MANIFEST")
if [ -n "$DESC" ]; then
    echo "✓ description: ${DESC:0:50}..."
else
    echo "⚠️  建議加入 description 欄位"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. 檢查引用的目錄存在
for dir in "commands" "agents" "skills"; do
    REF=$(jq -r ".$dir // empty" "$MANIFEST")
    if [ -n "$REF" ]; then
        FULL_PATH="$PLUGIN_DIR/${REF#./}"
        if [ -d "$FULL_PATH" ]; then
            COUNT=$(find "$FULL_PATH" -type f | wc -l | tr -d ' ')
            echo "✓ $dir: $REF ($COUNT 個檔案)"
        else
            echo "⚠️  引用的目錄不存在: $REF"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

# 7. 檢查 hooks 檔案存在
HOOKS_REF=$(jq -r '.hooks // empty' "$MANIFEST")
if [ -n "$HOOKS_REF" ]; then
    HOOKS_PATH="$PLUGIN_DIR/${HOOKS_REF#./}"
    if [ -f "$HOOKS_PATH" ]; then
        echo "✓ hooks: $HOOKS_REF"

        # 驗證 hooks JSON 格式
        if ! jq empty "$HOOKS_PATH" 2>/dev/null; then
            echo "⚠️  hooks 檔案不是有效的 JSON"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "⚠️  引用的 hooks 檔案不存在: $HOOKS_REF"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 8. 檢查 MCP 配置
MCP_REF=$(jq -r '.mcpServers // empty' "$MANIFEST")
if [ -n "$MCP_REF" ] && [ "$MCP_REF" != "null" ]; then
    if [[ "$MCP_REF" == "./"* ]] || [[ "$MCP_REF" == *".json" ]]; then
        MCP_PATH="$PLUGIN_DIR/${MCP_REF#./}"
        if [ -f "$MCP_PATH" ]; then
            echo "✓ mcpServers: $MCP_REF"
        else
            echo "⚠️  引用的 MCP 配置不存在: $MCP_REF"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "✓ mcpServers: (inline config)"
    fi
fi

# 9. 總結
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Plugin 驗證通過"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Plugin 驗證通過，但有 $WARNINGS 個警告"
    exit 0
else
    echo "❌ Plugin 驗證失敗：$ERRORS 個錯誤，$WARNINGS 個警告"
    exit 1
fi
