---
name: skill-agent
description: Skills 與 Agents 建立維護專業知識。當需要建立新 skill、新 agent、更新現有定義、了解結構規範時使用。包含 bundled resources、progressive disclosure 模式、frontmatter 規範。
---

# Skills & Agents Management

建立、維護和優化 Claude Skills 與 Agents 的完整指南。

## Quick Reference

### 核心原則

| 原則 | 適用 | 說明 |
|------|------|------|
| **Progressive Disclosure** | Skills | 分層載入，避免 token 浪費 |
| **Bundled Resources** | Skills | scripts/references/assets 分離 |
| **精簡至上** | Both | 只包含 AI 不知道的資訊 |
| **單層連結** | Skills | SKILL.md → reference（不要 A → B → C） |
| **適當自由度** | Both | 指引 vs pseudocode vs 腳本 |
| **Frontmatter 必填** | Both | name + description 必要 |

### 何時建立

| 情境 | 動作 |
|------|------|
| 重複提供相同知識 | 建立 **Skill** |
| 需要特定領域規範 | Skill + references/ |
| 需要執行角色定義 | 建立 **Agent** |
| 需要工作流協作角色 | 建立 **Agent** |

### 基本流程

```
1. 理解需求 → 收集具體範例
2. 規劃結構 → 識別可重用資源
3. 建立目錄 → skill-name/
4. 編輯檔案 → SKILL.md + resources
5. 測試使用 → 實際任務驗證
6. 迭代改進 → 根據使用調整
```

---

## Skill 結構

```
skill-name/
├── SKILL.md              # 必要 - 主要指引（<500行）
├── scripts/              # 可選 - 可執行腳本
├── references/           # 可選 - 參考文檔
└── assets/               # 可選 - 輸出資源（模板、圖片等）
```

### SKILL.md 規範

**必要元素**：

```markdown
---
name: my-skill               # 小寫，連字號分隔
description: 功能描述 + 何時觸發此 skill（觸發機制！）
---

# Skill Name

[Quick Reference - 核心內容]

## 核心概念
[必要知識]

## 進階內容
- 詳細規範 → see `references/xxx.md`
- API 文檔 → see `references/api.md`
```

**Frontmatter 規則**：

| 欄位 | 必要 | 說明 |
|------|------|------|
| `name` | ✅ | 小寫，用連字號分隔 |
| `description` | ✅ | 描述功能 **+ 何時觸發**（這是唯一觸發機制！） |

**重要**：Claude 只讀 `description` 來決定是否載入 skill。必須清楚描述使用場景。

---

## Progressive Disclosure（漸進式揭露）

<!-- 以下範例中的 references/ 路徑為教學示範，非實際檔案引用 -->

### 三層載入系統

| 層級 | 內容 | Token | 何時載入 |
|------|------|-------|----------|
| 1 | name + description | ~100 | 始終 |
| 2 | SKILL.md body | <5k | Skill 觸發時 |
| 3 | Bundled resources | 需要時 | 明確指向時 |

### 模式 1: 高層指引 + 參考

```markdown
# Database Access

## Quick Start
基本 CRUD 操作：
[簡單範例]

## Advanced
- 複雜查詢 → see `references/advanced-queries.md`
- 效能優化 → see `references/optimization.md`
- Schema → see `references/schema.md`
```

**適用**：需要深入文檔，但不是每次都用到。

### 模式 2: 領域分類

```
analytics-skill/
├── SKILL.md
└── references/
    ├── finance.md
    ├── sales.md
    └── product.md
```

**適用**：不同用戶關注不同領域，避免載入全部。

### 模式 3: 條件載入

```markdown
## Basic Usage
直接使用標準 API

## Advanced
- 特殊情況 → see `references/edge-cases.md`
- 內部結構 → see `references/internals.md`
```

**適用**：多數情況簡單，少數需要深入。

---

## Bundled Resources

### scripts/（可執行程式碼）

**何時使用**：
- 相同程式碼重複撰寫
- 需要確定性可靠度
- 操作脆弱，不允許變化

**範例**：
```
scripts/
├── rotate_pdf.py
├── merge_documents.sh
└── extract_data.py
```

### references/（參考文檔）

**何時使用**：
- Database schemas
- API 完整文檔
- 領域知識（法規、標準）
- 公司政策

**最佳實踐**：
- 檔案 > 10k 字時，在 SKILL.md 提供搜尋模式
- 保持單層連結（SKILL.md → reference，不要 A → B → C）
- 使用描述性檔名（`api-reference.md` 而非 `ref.md`）

**範例**：
```
references/
├── api-reference.md      # API 完整文檔
├── schema.md             # Database schema
├── patterns.md           # 設計模式
└── best-practices.md     # 最佳實踐
```

### assets/（輸出用資源）

**何時使用**：
- 模板檔案
- 圖片、圖示、字型
- Boilerplate 程式碼
- 配置範例

**重要**：Assets **不載入 context**，只用於輸出/參考。

**範例**：
```
assets/
├── component-template.tsx
├── config-example.yaml
└── logo.svg
```

---

## 適當的自由度

| 自由度 | 使用情境 | 格式 | 範例 |
|--------|----------|------|------|
| **高** | 多種方法都可行 | 文字指引 | "使用合適的設計模式" |
| **中** | 有偏好模式但允許變化 | Pseudocode | "通常使用 Factory，但可依情況調整" |
| **低** | 操作脆弱、一致性重要 | 具體腳本 | PDF 旋轉、合併操作 |

**原則**：給 AI 足夠自由度發揮能力，只在必要時限制。

---

## 精簡至上

**Context window 是共享資源。預設：Claude 已經很聰明，只加入它不知道的。**

### 每段內容問自己

1. Claude 真的需要這個解釋嗎？
2. 這段值得它的 token 成本嗎？
3. 這資訊是否重複？

### 不要建立的檔案

❌ README.md（給人類的說明）
❌ INSTALLATION_GUIDE.md（安裝指南）
❌ CHANGELOG.md（版本紀錄）
❌ 用戶文檔

**Skill 只為 AI agent 服務，不需要人類輔助文檔。**

---

## 建立流程

### 1. 理解需求
- 收集具體使用範例
- 識別重複模式
- 確認觸發條件

### 2. 規劃結構
- 需要哪些 resources？
- 如何分層揭露？
- 需要多少自由度？

### 3. 初始化目錄
```bash
mkdir -p ~/.claude/skills/skill-name/{scripts,references,assets}
```

### 4. 編輯檔案
- 先寫 SKILL.md（<500行）
- 再建立 bundled resources
- 從 SKILL.md 明確連結

### 5. 測試使用
- 在實際任務中觸發
- 觀察是否正確載入
- 檢查 token 使用

### 6. 迭代改進
- 根據使用經驗調整
- 補充遺漏內容
- 移除不必要部分

---

## 範例：完整 Skill 結構

```
pdf-processing/
├── SKILL.md
│   ├── Frontmatter (name + description)
│   ├── Quick Start（基本操作）
│   └── 引用 references/
│
├── scripts/
│   ├── rotate.py          # 確定性操作
│   └── merge.py
│
├── references/
│   ├── forms.md           # 表單處理詳解
│   ├── api-reference.md   # 完整 API
│   └── best-practices.md  # 最佳實踐
│
└── assets/
    ├── form-template.pdf  # 輸出用模板
    └── example.yaml       # 配置範例
```

---

## Checklist

建立或更新 skill 時確認：

- [ ] Frontmatter 有 `name` 和 `description`
- [ ] `description` 包含何時使用（觸發條件）
- [ ] SKILL.md < 500 行
- [ ] References 單層連結（SKILL.md → reference）
- [ ] 長檔案（>10k）有目錄或搜尋模式
- [ ] 沒有多餘的人類文檔（README, CHANGELOG）
- [ ] Progressive disclosure 適當分層
- [ ] 給予適當的自由度
- [ ] Scripts 用於確定性操作
- [ ] Assets 不載入 context

---

## Agent 結構

```
~/.claude/agents/
└── agent-name.md          # 單一檔案定義
```

### Agent 檔案規範

```markdown
---
name: agent-name           # 小寫，連字號分隔
description: 角色描述       # 簡短說明角色職責
model: sonnet              # 可選：sonnet, opus, haiku
skills: skill1, skill2     # 可選：自動載入的 skills
---

# Agent Title

[角色定義和工作流程]
```

**Frontmatter 規則**：

| 欄位 | 必要 | 說明 |
|------|------|------|
| `name` | ✅ | 小寫，用連字號分隔 |
| `description` | ✅ | 角色職責描述 |
| `model` | ❌ | 預設 sonnet |
| `skills` | ❌ | 自動載入的 skills |

### Agent vs Skill 選擇

| 需求 | 選擇 | 原因 |
|------|------|------|
| 知識庫 | Skill | 被動載入，提供參考 |
| 執行角色 | Agent | 主動執行，可修改檔案 |
| 工作流節點 | Agent | 在 D→R→T 中扮演角色 |

---

## 進階主題

### 詳細規範
- Skill Standard → `references/skill-standard.md`
- Agent Standard → `references/agent-standard.md`
- Progressive Disclosure → `references/progressive-disclosure.md`

### 範本使用
- SKILL.md 範本 → `templates/SKILL.md.template`
- AGENT.md 範本 → `templates/AGENT.md.template`

### 實際範例
- Skills：`~/.claude/skills/` → dev, ui, workflow
- Agents：`~/.claude/agents/` → developer, reviewer, tester

---

**建立新 Skill 或 Agent 時，從這裡開始。**
