#!/bin/bash
# validate-skill.sh - 驗證 Skill 是否符合規範
# 用法: validate-skill.sh <skill-directory>

SKILL_DIR="$1"

if [ -z "$SKILL_DIR" ]; then
    echo "用法: validate-skill.sh <skill-directory>"
    exit 1
fi

echo "🔍 驗證 Skill: $SKILL_DIR"
ERRORS=0
WARNINGS=0

# 1. 檢查 SKILL.md 存在
if [ ! -f "$SKILL_DIR/SKILL.md" ]; then
    echo "❌ 缺少 SKILL.md"
    ERRORS=$((ERRORS + 1))
else
    # 2. 檢查 frontmatter 存在
    if ! head -1 "$SKILL_DIR/SKILL.md" | grep -q "^---"; then
        echo "❌ 缺少 frontmatter（檔案應以 --- 開始）"
        ERRORS=$((ERRORS + 1))
    fi

    # 3. 檢查 name 欄位
    if ! grep -q "^name:" "$SKILL_DIR/SKILL.md"; then
        echo "❌ Frontmatter 缺少 name 欄位"
        ERRORS=$((ERRORS + 1))
    else
        # 檢查 name 格式（小寫連字號）- 只取第一個匹配
        NAME=$(grep -m 1 "^name:" "$SKILL_DIR/SKILL.md" | sed 's/name: *//' | tr -d '\r')
        if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
            echo "❌ name 格式錯誤: '$NAME'（應為小寫連字號格式）"
            ERRORS=$((ERRORS + 1))
        else
            echo "✓ name: $NAME"
        fi
    fi

    # 4. 檢查 description 欄位
    if ! grep -q "^description:" "$SKILL_DIR/SKILL.md"; then
        echo "❌ Frontmatter 缺少 description 欄位"
        ERRORS=$((ERRORS + 1))
    else
        DESC=$(grep "^description:" "$SKILL_DIR/SKILL.md" | sed 's/description: *//')
        echo "✓ description: ${DESC:0:50}..."
    fi

    # 5. 檢查 SKILL.md 行數
    LINES=$(wc -l < "$SKILL_DIR/SKILL.md" | tr -d ' ')
    if [ "$LINES" -ge 500 ]; then
        echo "⚠️  SKILL.md 超過 500 行 ($LINES 行)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✓ SKILL.md 行數: $LINES 行"
    fi
fi

# 6. 檢查 references 數量（只計算直接檔案，允許子目錄組織）
if [ -d "$SKILL_DIR/references" ]; then
    # 只計算 references/ 下的直接檔案（不含子目錄）
    DIRECT_REF_COUNT=$(find "$SKILL_DIR/references" -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    # 計算所有檔案（含子目錄）
    TOTAL_REF_COUNT=$(find "$SKILL_DIR/references" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

    if [ "$DIRECT_REF_COUNT" -gt 10 ]; then
        echo "⚠️  直接 References 超過 10 個 ($DIRECT_REF_COUNT 個)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "✓ References 數量: $DIRECT_REF_COUNT 個直接檔案"
    fi

    # 檢查是否有子目錄（僅提示，不計警告）
    SUBDIRS=$(find "$SKILL_DIR/references" -mindepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
    if [ "$SUBDIRS" -gt 0 ]; then
        SUBDIR_FILES=$((TOTAL_REF_COUNT - DIRECT_REF_COUNT))
        echo "ℹ️  包含 $SUBDIRS 個子目錄（額外 $SUBDIR_FILES 個檔案）"
    fi
fi

# 7. 檢查禁止的檔案
FORBIDDEN=("README.md" "CHANGELOG.md" "INSTALLATION.md" "CONTRIBUTING.md")
for file in "${FORBIDDEN[@]}"; do
    if [ -f "$SKILL_DIR/$file" ]; then
        echo "⚠️  發現不建議的檔案: $file"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# 8. 總結
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Skill 驗證通過"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Skill 驗證通過，但有 $WARNINGS 個警告"
    exit 0
else
    echo "❌ Skill 驗證失敗：$ERRORS 個錯誤，$WARNINGS 個警告"
    exit 1
fi
