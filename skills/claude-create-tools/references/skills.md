# Skills 完整規範

Skill 是 Claude 的知識庫，提供專業領域的指導。

## 檔案位置

| 位置 | 路徑 | 作用域 |
|------|------|--------|
| 個人 | `~/.claude/skills/` | 所有專案 |
| 專案 | `.claude/skills/` | 此專案 |
| Plugin | `<plugin>/skills/` | Plugin 啟用時 |

---

## Skill 結構

```
skill-name/
├── SKILL.md              # 必要 - 主要指引（<500行）
├── references/           # 可選 - 參考文檔
│   ├── api-reference.md
│   └── patterns.md
├── templates/            # 可選 - 模板檔案
│   └── config.template
├── scripts/              # 可選 - 可執行腳本
│   └── validate.sh
└── assets/               # 可選 - 輸出資源（不載入 context）
    └── logo.svg
```

---

## Frontmatter 規範

### 必填欄位

| 欄位 | 說明 |
|------|------|
| `name` | 小寫，連字號分隔 |
| `description` | 功能描述 **+ 觸發條件** |

### 正確範例

```yaml
---
name: database-access
description: Database 操作專業知識。當需要查詢資料庫、設計 schema、或優化 SQL 時使用。
---
```

### 錯誤範例

```yaml
---
name: MySkill                  # ❌ 使用大寫
description: A useful skill    # ❌ 未說明何時觸發
version: 1.0                   # ❌ 不必要的欄位
---
```

---

## Progressive Disclosure（三層載入）

| 層級 | 內容 | Token | 載入時機 |
|------|------|-------|----------|
| L1 | name + description | ~100 | 始終 |
| L2 | SKILL.md body | <5k | Skill 觸發時 |
| L3 | references/ | 需要時 | 明確指向時 |

### 使用模式

```markdown
# My Skill

## Quick Reference
[核心內容，高頻使用]

## Advanced
- 複雜查詢 → see `references/queries.md`
- 效能優化 → see `references/optimization.md`
```

---

## 品質標準

### MUST（必須）

- [x] SKILL.md < 500 行
- [x] Frontmatter 有 `name` 和 `description`
- [x] `description` 包含觸發條件
- [x] References 單層結構（禁止子目錄）
- [x] References ≤ 10 個檔案

### MUST NOT（禁止）

- [ ] 多層引用（A → B → C）
- [ ] 人類文檔（README, CHANGELOG）
- [ ] 重複內容（SKILL.md vs references）
- [ ] 硬編碼（範例程式碼使用 Enum/const）

---

## Bundled Resources

### references/（參考文檔）

- 載入到 context
- 用於深入內容
- 單層結構

### scripts/（可執行腳本）

- 載入到 context
- 用於確定性操作
- 需要執行權限

### templates/（模板）

- 載入到 context
- 用於輸出範本

### assets/（輸出資源）

- **不載入 context**
- 用於輸出用資源
- 圖片、圖示、配置範例

---

## 連結語法

```markdown
# 推薦格式
- 詳細說明 → see `references/detail.md`
- 完整範例 → read `references/examples.md`

# 避免
- 點擊這裡查看更多
- [連結文字](references/file.md)
```

---

## Token 預算

| 位置 | 預算 |
|------|------|
| description | ~100 |
| SKILL.md | <5k |
| 單個 reference | <10k |

---

## 範例

### 簡單 Skill

```markdown
---
name: api-conventions
description: API 設計規範。建立 API endpoint 時使用。
---

# API Design Conventions

## 命名規範
- 使用 resource-based 命名
- 使用 HTTP verbs

## 錯誤格式
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```
```

### 帶 References 的 Skill

```markdown
---
name: database-access
description: Database 操作專業知識。查詢、設計 schema、優化 SQL 時使用。
---

# Database Access

## Quick Start
基本 CRUD 操作...

## Advanced
- 複雜查詢 → see `references/queries.md`
- 效能優化 → see `references/optimization.md`
- Schema 設計 → see `references/schema.md`
```

---

## Checklist

- [ ] Frontmatter 有 `name` 和 `description`
- [ ] `description` 包含觸發條件
- [ ] `name` 小寫連字號格式
- [ ] SKILL.md < 500 行
- [ ] References ≤ 10 個
- [ ] References 單層結構
- [ ] 無 README.md, CHANGELOG.md
- [ ] 使用 `see references/xxx.md` 連結
