---
name: skill-creator
description: 建立 Claude Skills 的完整指南。當需要建立新 skill、更新現有 skill、或了解 skill 結構時使用。包含 SKILL.md 格式、bundled resources 用法、progressive disclosure 模式。
---

# Skill Creator Guide

建立有效 Skills 的完整指南。

## Skill 結構

```
skill-name/
├── SKILL.md              # 必要 - 主要指引
├── scripts/              # 可選 - 可執行腳本
├── references/           # 可選 - 參考文檔
└── assets/               # 可選 - 輸出資源（模板、圖片等）
```

## SKILL.md 格式

```markdown
---
name: my-skill
description: 清楚描述功能與何時使用。這是觸發機制，必須完整。
---

# Skill Name

[指引內容]
```

### Frontmatter 規則

| 欄位 | 必要 | 說明 |
|------|------|------|
| `name` | ✅ | 小寫，用連字號分隔 |
| `description` | ✅ | 描述功能 + 何時觸發 |

**重要**：`description` 是唯一的觸發機制。Claude 只讀這個來決定是否使用 skill。

## Bundled Resources

### scripts/
可執行程式碼（Python/Bash）

```
何時使用：
- 相同程式碼重複撰寫
- 需要確定性可靠度
```

### references/
參考文檔，需要時載入

```
何時使用：
- Database schemas
- API 文檔
- 領域知識
- 公司政策
```

**最佳實踐**：
- 檔案 > 10k 字時，在 SKILL.md 提供 grep 搜尋模式
- 保持單層連結（SKILL.md → reference，不要 A → B → C）

### assets/
輸出用資源，不載入 context

```
何時使用：
- 模板檔案
- 圖片、圖示
- 字型
- Boilerplate 程式碼
```

## Progressive Disclosure

三層載入系統：

| 層級 | 內容 | Token |
|------|------|-------|
| 1 | name + description | ~100 |
| 2 | SKILL.md body | <5k |
| 3 | Bundled resources | 需要時 |

### 模式 1: 高層指引 + 參考

```markdown
# PDF Processing

## Quick start
[基本範例]

## Advanced
- Form filling → see `forms.md`
- API reference → see `reference.md`
```

### 模式 2: 領域分類

```
bigquery-skill/
├── SKILL.md
└── references/
    ├── finance.md
    ├── sales.md
    └── product.md
```

用戶問 sales → 只讀 sales.md

### 模式 3: 條件載入

```markdown
## Basic
直接修改 XML

## Advanced
- Tracked changes → see `redlining.md`
- OOXML details → see `ooxml.md`
```

## 核心原則

### 1. 精簡至上

Context window 是共享資源。

**預設**：Claude 已經很聰明，只加入它不知道的。

每段內容問自己：
- Claude 真的需要這個解釋嗎？
- 這段值得它的 token 成本嗎？

### 2. 適當的自由度

| 自由度 | 使用情境 | 格式 |
|--------|----------|------|
| 高 | 多種方法都可行 | 文字指引 |
| 中 | 有偏好模式但允許變化 | Pseudocode |
| 低 | 操作脆弱、一致性重要 | 具體腳本 |

### 3. 不要建立的檔案

❌ README.md
❌ INSTALLATION_GUIDE.md
❌ CHANGELOG.md
❌ 用戶文檔

Skill 只為 AI agent 服務，不需要人類輔助文檔。

## 建立流程

1. **理解** - 收集具體使用範例
2. **規劃** - 識別可重用資源
3. **初始化** - 建立目錄結構
4. **編輯** - 實作 SKILL.md + resources
5. **測試** - 實際使用
6. **迭代** - 根據使用改進

## 範例：建立 PDF Skill

```
pdf/
├── SKILL.md
│   ├── name: pdf
│   ├── description: PDF 處理...
│   └── Quick start + 引用其他檔案
├── scripts/
│   └── rotate_pdf.py
├── references/
│   ├── forms.md
│   └── reference.md
└── assets/
    └── (無)
```

## Checklist

建立新 skill 時確認：

- [ ] Frontmatter 有 name 和 description
- [ ] Description 包含何時使用
- [ ] SKILL.md < 500 行
- [ ] References 單層連結
- [ ] 長檔案有目錄
- [ ] 沒有多餘文檔
