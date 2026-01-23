#!/bin/bash
# validate-agent.sh - 驗證 Agent 檔案
# 用法: validate-agent.sh <agent-file.md>

AGENT_FILE="$1"

if [ -z "$AGENT_FILE" ]; then
    echo "用法: validate-agent.sh <agent-file.md>"
    exit 1
fi

echo "🔍 驗證 Agent: $AGENT_FILE"
ERRORS=0
WARNINGS=0

# 1. 檢查檔案存在
if [ ! -f "$AGENT_FILE" ]; then
    echo "❌ 檔案不存在: $AGENT_FILE"
    exit 1
fi

# 2. 檢查 frontmatter 開始
if ! head -1 "$AGENT_FILE" | grep -q "^---"; then
    echo "❌ 缺少 frontmatter（檔案應以 --- 開始）"
    ERRORS=$((ERRORS + 1))
fi

# 3. 檢查 name 欄位
if ! grep -q "^name:" "$AGENT_FILE"; then
    echo "❌ Frontmatter 缺少 name 欄位"
    ERRORS=$((ERRORS + 1))
else
    NAME=$(grep -m 1 "^name:" "$AGENT_FILE" | sed 's/name: *//' | tr -d '\r')

    # 檢查 name 格式
    if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
        echo "❌ name 格式錯誤: '$NAME'（應為小寫連字號格式）"
        ERRORS=$((ERRORS + 1))
    else
        echo "✓ name: $NAME"
    fi

    # 4. 檢查檔名與 name 一致
    BASENAME=$(basename "$AGENT_FILE" .md)
    if [ "$BASENAME" != "$NAME" ]; then
        echo "⚠️  檔名 '$BASENAME' 與 name '$NAME' 不一致"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 5. 檢查 description 欄位
if ! grep -q "^description:" "$AGENT_FILE"; then
    echo "❌ Frontmatter 缺少 description 欄位"
    ERRORS=$((ERRORS + 1))
else
    DESC=$(grep "^description:" "$AGENT_FILE" | sed 's/description: *//')
    echo "✓ description: ${DESC:0:50}..."
fi

# 6. 檢查 model 值（如果有）
if grep -q "^model:" "$AGENT_FILE"; then
    MODEL=$(grep "^model:" "$AGENT_FILE" | sed 's/model: *//')
    if [[ "$MODEL" =~ ^(sonnet|opus|haiku|inherit)$ ]]; then
        echo "✓ model: $MODEL"
    else
        echo "⚠️  model 值可能無效: '$MODEL'（建議: sonnet, opus, haiku, inherit）"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 7. 檢查 skills 欄位（如果有）
if grep -q "^skills:" "$AGENT_FILE"; then
    SKILLS=$(grep "^skills:" "$AGENT_FILE" | sed 's/skills: *//')
    echo "✓ skills: $SKILLS"

    # 檢查是否包含 core（如果使用 workflow）
    if [[ ! "$SKILLS" =~ "core" ]]; then
        echo "⚠️  skills 未包含 'core'（如果使用 workflow 建議加入）"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# 8. 檢查是否有角色定義（支援中英文格式）
if ! grep -qi "角色\|role\|職責\|你是\|You are" "$AGENT_FILE"; then
    echo "⚠️  未找到明確的角色定義（建議加入 'You are...' 或 '你是...'）"
    WARNINGS=$((WARNINGS + 1))
fi

# 9. 總結
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Agent 驗證通過"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Agent 驗證通過，但有 $WARNINGS 個警告"
    exit 0
else
    echo "❌ Agent 驗證失敗：$ERRORS 個錯誤，$WARNINGS 個警告"
    exit 1
fi
