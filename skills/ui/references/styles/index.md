# UI 風格系統

58 種現代 UI 風格，分為 6 大群組，按需選用。

---

## 風格群組總覽

| 群組 | 風格數量 | 核心特徵 | 適用場景 |
|------|----------|----------|----------|
| [Minimalist](minimalist.md) | 10 | 簡潔、留白、功能導向 | 工具類、通用 |
| [Dimensional](dimensional.md) | 8 | 深度、層次、立體感 | 現代 App、高端 |
| [Bold](bold.md) | 10 | 大膽、對比、表達力 | 創意、年輕品牌 |
| [Organic](organic.md) | 8 | 自然、柔和、手繪感 | 親和、自然品牌 |
| [Tech](tech.md) | 10 | 科技、未來、發光效果 | 科技、遊戲 |
| [Classic](classic.md) | 12 | 經典、專業、信任感 | 企業、金融、醫療 |

---

## 快速選擇指南

### 按產品類型

```
需要信任感 → Classic（Corporate, Swiss）
需要現代感 → Dimensional（Glassmorphism）
需要差異化 → Bold（Neubrutalism, Memphis）
需要親和力 → Organic（Hand-drawn, Nature）
需要科技感 → Tech（Cyberpunk, Neon）
通用/工具  → Minimalist（Clean, Soft）
```

### 按目標受眾

| 受眾特徵 | 推薦群組 | 原因 |
|----------|----------|------|
| 企業決策者 | Classic | 專業、信任 |
| 年輕消費者（18-30） | Bold, Tech | 大膽、新穎 |
| 專業人士 | Minimalist | 功能優先 |
| 家庭/兒童 | Organic | 溫暖、友善 |
| 設計師/創意人 | Bold, Dimensional | 視覺表達 |
| 科技愛好者 | Tech | 前沿感 |

### 按品牌調性

| 調性關鍵字 | 推薦風格 |
|------------|----------|
| 專業、可靠 | Corporate Clean, Swiss Grid |
| 現代、創新 | Glassmorphism, Clean Minimal |
| 大膽、獨特 | Neubrutalism, Memphis |
| 溫暖、親切 | Organic Shapes, Hand-drawn |
| 前沿、酷炫 | Cyberpunk, Neon Glow |
| 高端、精緻 | Japanese Minimal, Art Deco |

---

## 風格選擇流程

```
1. 確定產品類型
   └── Read: industry.md（產業映射）

2. 選擇風格群組
   └── Read: [group].md（群組詳情）

3. 選擇配色
   └── Read: ../palettes.md

4. 選擇字體
   └── Read: ../font-pairs.md

5. 驗證決策
   └── Read: ../../ux/references/decision-rules.md
```

---

## 風格組合原則

### 可組合

- **Minimalist + Dimensional**：Clean Minimal + Glassmorphism 點綴
- **Classic + Minimalist**：Corporate + 簡潔佈局
- **Tech + Dimensional**：Cyberpunk + 玻璃效果

### 避免組合

- **Bold + Classic**：風格衝突
- **Organic + Tech**：調性矛盾
- **多於 2 種風格**：視覺混亂

---

## 與 Token 系統整合

每個風格都可以通過覆蓋 Semantic Token 來實現：

```css
/* 基礎（tokens.md） */
--color-primary: #2563eb;
--radius-md: 6px;

/* 風格覆蓋（例如 Glassmorphism） */
--color-surface: rgba(255, 255, 255, 0.15);
--card-blur: blur(10px);

/* 風格覆蓋（例如 Neubrutalism） */
--radius-md: 0px;
--border-width: 3px;
--shadow-brutal: 4px 4px 0 #000;
```

詳見各風格檔案中的「Token 調整」章節。

---

## 多風格提案

需要輸出多個風格方案供選擇時：

```
使用模板: ~/.claude/skills/ui/templates/multi-style-proposal.md
```

---

## 相關資源

| 資源 | 用途 |
|------|------|
| [industry.md](industry.md) | 產業 × 風格映射 |
| [../palettes.md](../palettes.md) | 96+ 配色方案 |
| [../font-pairs.md](../font-pairs.md) | 57+ 字體配對 |
| [../tokens.md](../tokens.md) | Token 三層架構 |
