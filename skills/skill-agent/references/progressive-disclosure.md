# Progressive Disclosure Pattern

漸進式揭露：按需載入內容，最大化 token 效率。

## 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│  Context Window = 共享資源                                   │
│                                                             │
│  目標：最小化載入，最大化效用                                 │
│  方法：分層載入，按需揭露                                     │
└─────────────────────────────────────────────────────────────┘
```

## 三層載入系統

| 層級 | 內容 | Token | 載入時機 |
|------|------|-------|----------|
| **L1** | name + description | ~100 | 始終載入 |
| **L2** | SKILL.md body | <5k | Skill 觸發時 |
| **L3** | references/ | 需要時 | 明確指向時 |

### L1: Description（始終載入）

```yaml
---
name: database
description: Database 操作專業知識。當需要查詢、設計 schema、優化 SQL 時使用。
---
```

**規則**：
- 必須包含觸發條件（Claude 唯一的觸發依據）
- 簡短（1-2 句）
- 包含關鍵字以便觸發

### L2: SKILL.md Body（觸發時載入）

```markdown
# Database

## Quick Reference
[核心操作速查表]

## 常用模式
[3-5 個最常用模式]

## Advanced
- 複雜查詢 → see `references/queries.md`
- 效能優化 → see `references/performance.md`
```

**規則**：
- < 500 行
- 只包含高頻使用內容
- 深入內容指向 references/

### L3: References（按需載入）

```
references/
├── queries.md         # 複雜查詢詳解
├── performance.md     # 效能優化
└── schema-design.md   # Schema 設計
```

**規則**：
- 每個檔案獨立完整
- 只在明確需要時載入
- 單層結構（禁止子目錄）

## 設計模式

### 模式 1: 高層指引 + 參考

**適用**：需要深入文檔，但不是每次都用

```markdown
# API Integration

## Quick Start
基本 CRUD：
- GET: `fetch(url)`
- POST: `fetch(url, {method: 'POST'})`

## Advanced
- 認證處理 → see `references/auth.md`
- 錯誤處理 → see `references/errors.md`
- 速率限制 → see `references/rate-limit.md`
```

### 模式 2: 領域分類

**適用**：不同用戶關注不同領域

```
analytics/
├── SKILL.md
└── references/
    ├── finance.md      # 財務報表
    ├── sales.md        # 銷售分析
    └── product.md      # 產品數據
```

用戶問財務 → 只載入 finance.md

### 模式 3: 條件載入

**適用**：多數情況簡單，少數需要深入

```markdown
## Basic
直接使用標準 API

## Edge Cases
- 特殊情況 → see `references/edge-cases.md`
- 內部結構 → see `references/internals.md`
```

### 模式 4: 大檔案處理

**適用**：Reference > 10k 字元

```markdown
## Schema Reference

超過 10k 字元時，提供搜尋模式：

### 快速定位
```bash
# 搜尋表格定義
grep -n "CREATE TABLE" references/schema.md

# 搜尋欄位
grep -n "column_name" references/schema.md
```

### 目錄
- users 表 (L10)
- orders 表 (L50)
- products 表 (L100)
```

## 反模式（禁止）

### ❌ 全部塞在 SKILL.md

```markdown
# My Skill

[5000 行的詳細內容]
```

**問題**：每次觸發都載入全部，浪費 token

### ❌ 多層引用

```
SKILL.md → references/index.md → references/detail.md
```

**問題**：增加認知負擔，難以維護

### ❌ 過度分割

```
references/
├── intro-part1.md
├── intro-part2.md
├── intro-part3.md
└── ...（20 個小檔案）
```

**問題**：增加導航成本，反而降低效率

## 最佳實踐

### 1. 問自己

每段內容寫入前：
- Claude 真的需要這個嗎？
- 這是高頻還是低頻使用？
- 能否放到 reference？

### 2. 80/20 法則

```
SKILL.md: 20% 內容，覆蓋 80% 使用場景
references/: 80% 內容，覆蓋 20% 特殊場景
```

### 3. Token 預算

| 位置 | 預算 | 說明 |
|------|------|------|
| description | ~100 | 觸發描述 |
| SKILL.md | <5k | 核心內容 |
| 單個 reference | <10k | 深入內容 |

### 4. 連結語法

```markdown
# 推薦格式
- 詳細說明 → see `references/detail.md`
- 完整範例 → read `references/examples.md`

# 避免
- 點擊這裡查看更多
- [連結文字](references/file.md)
```

## 驗證清單

建立或更新 skill 時確認：

- [ ] SKILL.md < 500 行
- [ ] 高頻內容在 SKILL.md
- [ ] 低頻內容在 references/
- [ ] references/ 單層結構
- [ ] 大檔案有目錄或搜尋模式
- [ ] 連結使用 `see` 或 `read` 語法

## 範例：完整結構

```
pdf-processing/
├── SKILL.md                    # L2: ~200 行
│   ├── Quick Reference
│   ├── 常用操作
│   └── Advanced → references/
│
└── references/                 # L3: 按需載入
    ├── forms.md               # 表單處理 (~500 行)
    ├── ocr.md                 # OCR 操作 (~300 行)
    └── encryption.md          # 加密處理 (~400 行)
```

**載入流程**：
1. 用戶問 PDF 問題 → 觸發 pdf-processing
2. 載入 SKILL.md (~200 行)
3. 用戶問表單 → 載入 forms.md (~500 行)
4. 總計：~700 行（而非全部 1400 行）
