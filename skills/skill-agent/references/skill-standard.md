# Skill Standard - 嚴格規範

Claude Skills 的強制性品質標準。所有新建或更新的 skill 必須遵守這些規則。

---

## 🔴 MUST 規則（必須遵守）

### 1. Frontmatter 必須完整

```markdown
---
name: skill-name               # 必填
description: 功能描述 + 何時觸發此 skill   # 必填，包含觸發條件
---
```

**強制要求**：
- ✅ `name` 欄位必須存在
- ✅ `description` 欄位必須存在
- ✅ `description` **必須包含觸發條件說明**（這是唯一觸發機制）
- ✅ `name` 使用小寫，連字號分隔（例：`my-skill`）
- ✅ 不得包含其他非必要欄位（如 `version`, `author`）

**資料夾命名規則**：
- ✅ 資料夾名稱可以使用中文（例：`策略開發/`、`風險管理/`）
- ✅ Frontmatter 中的 `name` 欄位仍使用英文 kebab-case（例：`trading-strategy`）
- ✅ 資料夾名稱用於人類識別，`name` 欄位用於系統識別

**違規範例**：
```markdown
---
name: MySkill                  # ❌ 使用大寫
description: A useful skill    # ❌ 未說明何時觸發
version: 1.0                   # ❌ 不必要的欄位
---
```

**正確範例**：
```markdown
---
name: database-access
description: Database 操作專業知識。當需要查詢資料庫、設計 schema、或優化 SQL 時使用。
---
```

---

### 2. SKILL.md 必須精簡

```
┌────────────────────────────────────────────┐
│  SKILL.md 必須 < 500 行                     │
│                                            │
│  Context window 是共享資源                  │
│  只包含 AI 不知道的資訊                     │
└────────────────────────────────────────────┘
```

**強制要求**：
- ✅ 主檔案 `SKILL.md` 行數 < 500 行（不含 frontmatter）
- ✅ 超過部分必須移到 `references/`
- ✅ 每段內容必須自問：「Claude 真的需要這段嗎？」
- ✅ 禁止包含重複內容

**檢查方式**：
```bash
wc -l SKILL.md
# 輸出應 < 500
```

**違規範例**：
```markdown
# My Skill

## Introduction
Claude is an AI assistant... (200 行的 AI 介紹)

## How to use
This skill helps you... (冗長的使用說明)

## Advanced Topics
[詳細內容，總共 800 行]
```

**正確範例**：
```markdown
# Database Access

## Quick Reference
[核心操作，簡潔]

## Advanced
- 複雜查詢 → see `references/advanced-queries.md`
- 效能優化 → see `references/optimization.md`

[總共 250 行]
```

---

### 3. Progressive Disclosure 必須正確執行

**三層載入系統**：

| 層級 | 內容 | Token 消耗 | 何時載入 |
|------|------|-----------|----------|
| 1 | name + description | ~100 | 始終 |
| 2 | SKILL.md body | <5k | Skill 觸發時 |
| 3 | Bundled resources | 需要時 | 明確指向時 |

**強制要求**：
- ✅ SKILL.md 只包含高層指引和快速參考
- ✅ 深入內容必須放在 `references/`
- ✅ 從 SKILL.md 明確連結 references（使用 `see references/xxx.md`）
- ✅ References 檔案必須單層（SKILL.md → reference，禁止 A → B → C）

**違規範例**：
```markdown
# Database Skill

[SKILL.md 包含所有細節，5000 行]
```

**正確範例**：
```markdown
# Database Skill

## Quick Start
[基本操作]

## Advanced
- Schema design → see `references/schema-design.md`
- Query optimization → see `references/query-optimization.md`
```

---

### 4. References 必須單層連結

```
✅ 正確：
SKILL.md → references/file.md

❌ 錯誤：
SKILL.md → references/index.md → references/deep/file.md
```

**強制要求**：
- ✅ SKILL.md 可以引用 `references/*.md`
- ✅ Reference 檔案**不得**再引用其他 reference 檔案
- ✅ 所有 reference 檔案必須在 `references/` 根目錄（禁止子目錄）
- ✅ 使用描述性檔名（`api-reference.md` 而非 `ref.md`）

**違規範例**：
```
skill/
├── SKILL.md
└── references/
    ├── api/
    │   ├── v1.md      # ❌ 子目錄
    │   └── v2.md
    └── index.md       # ❌ index 再引用其他檔案
```

**正確範例**：
```
skill/
├── SKILL.md
└── references/
    ├── api-v1.md      # ✅ 扁平結構
    ├── api-v2.md
    └── patterns.md
```

---

### 5. 禁止硬編碼

**所有範例程式碼必須遵守「禁止硬編碼」規則**（繼承自 CLAUDE.md 核心規則）。

**強制要求**：
- ✅ 使用 Enum/const/Literal/TypedDict 定義常數
- ✅ 禁止裸字串（`"pending"`, `"status"`）
- ✅ 禁止 Magic Number（`7`, `100`）
- ✅ 新增型別前檢查是否已有類似定義

**違規範例**：
```python
# ❌ Skill 中的範例程式碼
def process(status: str):
    if status == "pending":  # 硬編碼
        ...
```

**正確範例**：
```python
# ✅ Skill 中的範例程式碼
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    COMPLETED = "completed"

def process(status: Status):
    if status == Status.PENDING:
        ...
```

---

## 🚫 MUST NOT 規則（禁止事項）

### 1. 禁止多層引用

```
❌ 絕對禁止：
references/a.md → references/b.md → references/c.md
```

**原因**：
- 增加認知負擔
- Token 消耗不可控
- 違反 Progressive Disclosure

**如何避免**：
- 重新組織內容，使所有 references 獨立
- 如果有共用內容，直接重複或建立單獨的 reference 檔案

---

### 2. 禁止過度文檔

```
┌────────────────────────────────────────────┐
│  References 數量 ≤ 10 個檔案                │
│                                            │
│  超過 10 個 = 重新思考結構                  │
└────────────────────────────────────────────┘
```

**強制要求**：
- ✅ `references/` 目錄檔案數 ≤ 10
- ✅ 超過時必須合併相關檔案或重新設計 skill 結構
- ✅ 每個 reference 檔案有明確主題

**違規範例**：
```
references/
├── intro.md
├── basic-1.md
├── basic-2.md
├── basic-3.md
├── advanced-1.md
├── advanced-2.md
├── examples-1.md
├── examples-2.md
├── faq-1.md
├── faq-2.md
├── tips-1.md        # ❌ 超過 10 個
└── tips-2.md
```

**正確範例**：
```
references/
├── basics.md        # ✅ 合併 basic-1/2/3
├── advanced.md      # ✅ 合併 advanced-1/2
├── examples.md
├── faq.md           # ✅ 合併所有 FAQ
└── best-practices.md  # ✅ 合併 tips
```

---

### 3. 禁止人類文檔

**Skill 只為 AI agent 服務，不需要人類輔助文檔。**

**絕對禁止建立的檔案**：
- ❌ `README.md` - 給人類的說明
- ❌ `INSTALLATION.md` - 安裝指南
- ❌ `CHANGELOG.md` - 版本紀錄
- ❌ `CONTRIBUTING.md` - 貢獻指南
- ❌ `LICENSE.md` - 授權協議
- ❌ 任何以人類為受眾的文檔

**原因**：
- 浪費 context window
- AI 不需要這些資訊
- 增加維護負擔

---

### 4. 禁止重複內容

**SKILL.md 和 references 之間不得有重複內容。**

**強制要求**：
- ✅ SKILL.md 只有高層摘要
- ✅ References 只有深入細節
- ✅ 同一資訊只出現一次

**違規範例**：
```markdown
# SKILL.md
## API Reference
[詳細 API 文檔 500 行]

# references/api.md
## API Reference
[相同的詳細 API 文檔 500 行]  # ❌ 重複
```

**正確範例**：
```markdown
# SKILL.md
## API Reference
基本使用：
[簡單範例 10 行]

詳細文檔 → see `references/api.md`

# references/api.md
[完整 API 文檔 500 行]  # ✅ 只在這裡
```

---

### 5. 禁止混淆 Bundled Resources 用途

**三種 bundled resources 有明確分工**：

| 類型 | 用途 | 是否載入 context |
|------|------|------------------|
| `scripts/` | 可執行腳本 | 是（需要時）|
| `references/` | 參考文檔 | 是（明確引用時）|
| `assets/` | 輸出資源 | **否**（只用於輸出）|

**違規範例**：
```markdown
# SKILL.md
詳細配置 → see `assets/config.yaml`  # ❌ assets 不載入
```

**正確範例**：
```markdown
# SKILL.md
配置範例：使用 `assets/config.yaml` 作為輸出範本  # ✅ 明確說明用途
```

---

## ✅ 驗證檢查清單

**建立或更新 skill 後，必須完成以下檢查**：

### Frontmatter 檢查
- [ ] `name` 欄位存在且為小寫連字號格式
- [ ] `description` 欄位存在
- [ ] `description` 包含觸發條件說明（何時使用此 skill）
- [ ] 無多餘欄位（只保留 `name` 和 `description`）

### 結構檢查
- [ ] SKILL.md 行數 < 500（執行 `wc -l SKILL.md` 驗證）
- [ ] References 檔案數 ≤ 10（執行 `ls references/ | wc -l` 驗證）
- [ ] References 單層結構（無子目錄）
- [ ] 無人類文檔（README, CHANGELOG, etc.）

### Progressive Disclosure 檢查
- [ ] SKILL.md 只包含高層指引和快速參考
- [ ] 深入內容放在 references/
- [ ] 使用 `see references/xxx.md` 明確連結
- [ ] Reference 檔案不再引用其他 references

### 內容品質檢查
- [ ] 無重複內容（SKILL.md vs references）
- [ ] 無硬編碼（範例程式碼使用 Enum/const）
- [ ] Bundled resources 分類正確
- [ ] 檔名描述性強（非 `ref.md` 或 `temp.md`）

### 範例程式碼檢查
- [ ] 所有範例遵守「禁止硬編碼」規則
- [ ] 使用 Enum/const/TypedDict 定義常數
- [ ] 無 Magic Number
- [ ] 型別定義集中管理

---

## 🔧 違規範例與修正

### 範例 1: Description 不完整

**違規**：
```markdown
---
name: pdf-processing
description: PDF processing utilities
---
```

**問題**：未說明何時觸發此 skill。

**修正**：
```markdown
---
name: pdf-processing
description: PDF 處理工具。當需要旋轉、合併、提取文字、填寫表單時使用。
---
```

---

### 範例 2: SKILL.md 過長

**違規**：
```markdown
# Database Access

## Basic Operations
[200 行詳細說明]

## Advanced Queries
[300 行詳細說明]

## Optimization
[400 行詳細說明]

# 總共 900 行 ❌
```

**修正**：
```markdown
# Database Access

## Quick Reference
[50 行核心操作]

## Advanced
- 進階查詢 → see `references/advanced-queries.md`
- 效能優化 → see `references/optimization.md`
- Schema 設計 → see `references/schema.md`

# 總共 100 行 ✅
```

---

### 範例 3: 多層引用

**違規**：
```
SKILL.md → references/index.md → references/api/endpoints.md
```

**修正**：
```
SKILL.md → references/api-endpoints.md
（扁平化結構，移除 index.md 中間層）
```

---

### 範例 4: 過度文檔

**違規**：
```
references/
├── intro.md
├── tutorial-1.md
├── tutorial-2.md
├── tutorial-3.md
├── api-auth.md
├── api-users.md
├── api-posts.md
├── examples-basic.md
├── examples-advanced.md
├── faq.md
├── troubleshooting.md
└── glossary.md     # 12 個檔案 ❌
```

**修正**：
```
references/
├── getting-started.md    # 合併 intro + tutorial-1/2/3
├── api-reference.md      # 合併所有 api-* 檔案
├── examples.md           # 合併 examples-basic/advanced
├── faq.md
└── troubleshooting.md    # 5 個檔案 ✅
```

---

### 範例 5: 硬編碼

**違規**：
```python
# SKILL.md 中的範例
def check_status(status: str):
    if status == "pending":      # ❌ 硬編碼
        return "等待中"
    elif status == "completed":  # ❌ 硬編碼
        return "已完成"
```

**修正**：
```python
# SKILL.md 中的範例
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    COMPLETED = "completed"

def check_status(status: Status):
    if status == Status.PENDING:      # ✅ 使用 Enum
        return "等待中"
    elif status == Status.COMPLETED:  # ✅ 使用 Enum
        return "已完成"
```

---

### 範例 6: Assets 誤用

**違規**：
```markdown
# SKILL.md
詳細配置說明 → see `assets/detailed-config.md`  # ❌ assets 不載入
```

**修正**：
```markdown
# SKILL.md
詳細配置 → see `references/configuration.md`

配置範本檔案位於 `assets/config-template.yaml`（用於輸出）
```

---

## 📊 檢查工具（自動驗證）

### 快速驗證腳本

```bash
#!/bin/bash
# skill-check.sh - 驗證 skill 是否符合規範

SKILL_DIR="$1"

echo "檢查 $SKILL_DIR..."

# 1. 檢查 SKILL.md 行數
LINES=$(wc -l < "$SKILL_DIR/SKILL.md")
if [ "$LINES" -ge 500 ]; then
    echo "❌ SKILL.md 超過 500 行 ($LINES 行)"
else
    echo "✅ SKILL.md 行數符合規範 ($LINES 行)"
fi

# 2. 檢查 frontmatter
if ! grep -q "^name:" "$SKILL_DIR/SKILL.md"; then
    echo "❌ 缺少 name 欄位"
else
    echo "✅ name 欄位存在"
fi

if ! grep -q "^description:" "$SKILL_DIR/SKILL.md"; then
    echo "❌ 缺少 description 欄位"
else
    echo "✅ description 欄位存在"
fi

# 3. 檢查 references 數量
if [ -d "$SKILL_DIR/references" ]; then
    REF_COUNT=$(ls "$SKILL_DIR/references"/*.md 2>/dev/null | wc -l)
    if [ "$REF_COUNT" -gt 10 ]; then
        echo "❌ References 超過 10 個 ($REF_COUNT 個)"
    else
        echo "✅ References 數量符合規範 ($REF_COUNT 個)"
    fi
fi

# 4. 檢查禁止的檔案
FORBIDDEN=("README.md" "CHANGELOG.md" "INSTALLATION.md")
for file in "${FORBIDDEN[@]}"; do
    if [ -f "$SKILL_DIR/$file" ]; then
        echo "❌ 發現禁止的檔案: $file"
    fi
done

echo "檢查完成"
```

**使用方式**：
```bash
chmod +x skill-check.sh
./skill-check.sh ~/.claude/skills/my-skill
```

---

## 🎯 S→W 流程驗證點

**當 Workflow Agent 驗證 Skills Agent 產出時，必須檢查：**

### Phase 1: 自動化檢查（可腳本化）
- [ ] Frontmatter 完整（name + description）
- [ ] Description 包含觸發條件
- [ ] SKILL.md < 500 行
- [ ] References ≤ 10 個檔案
- [ ] References 單層結構（無子目錄）
- [ ] 無禁止的檔案（README, CHANGELOG, etc.）

### Phase 2: 內容檢查（需人工判斷）
- [ ] Progressive Disclosure 正確執行
- [ ] 無重複內容
- [ ] 範例程式碼無硬編碼
- [ ] Bundled resources 分類正確
- [ ] 檔名描述性強

### 驗證結果
```markdown
## S→W 驗證報告

✅ PASS: 所有檢查通過
❌ FAIL: 發現 3 個問題
  - SKILL.md 超過 500 行 (650 行)
  - Description 未包含觸發條件
  - 發現硬編碼：references/example.md line 42

返回 Skills Agent 修正
```

---

## 🔄 迭代改進流程

**Skill 建立後的持續優化**：

### 1. 使用反饋
```
使用 skill → 觀察 token 消耗 → 調整 Progressive Disclosure
```

### 2. 精簡內容
```
每次更新 → 問自己「這段真的需要嗎？」 → 移除冗餘
```

### 3. 重構 references
```
發現重複 → 合併檔案 → 保持 ≤ 10 個
```

### 4. 更新觸發條件
```
發現新用途 → 更新 description → 確保正確觸發
```

---

## 📚 相關文檔

- SKILL.md 範本 → `../templates/SKILL.md.template`
- Reference 範本 → `../templates/reference.md.template`
- Progressive Disclosure 深入 → `progressive-disclosure.md`（待建立）

---

**這份規範是 Skill 品質的最後防線。嚴格遵守，確保一致性和可維護性。**
