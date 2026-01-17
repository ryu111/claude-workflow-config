# Classic 經典風格群組

經典、專業、信任感的設計風格。適用於企業、金融、醫療等專業領域。

---

## 風格列表

| 風格 | 特徵 | 最佳用途 |
|------|------|----------|
| Corporate Clean | 專業、乾淨、信任 | 企業官網、B2B |
| Swiss/Grid | 網格系統、精準對齊 | 設計機構、排版 |
| Editorial | 雜誌風、閱讀體驗 | 新聞、部落格 |
| Art Deco | 幾何裝飾、金色 | 奢侈品、高端 |
| Japanese Minimal | 禪意、極簡、留白 | 高端品牌、藝廊 |
| Bauhaus | 功能主義、幾何 | 設計、建築 |
| Classic Luxury | 傳統奢華、優雅 | 珠寶、飯店 |
| Legal/Finance | 保守、權威 | 法律、銀行 |
| Academic | 學術、嚴謹 | 大學、研究 |
| Government | 無障礙、清晰 | 政府、公共服務 |
| Medical | 潔淨、專業 | 醫院、診所 |
| News/Media | 資訊層級、可掃描 | 新聞網站 |

---

## Corporate Clean 企業簡潔

### 特徵
- 專業、乾淨
- 中性色為主
- 清晰的結構
- 品牌一致性

### Token 調整

```css
:root {
  /* 企業色彩 */
  --color-primary: #1e40af;        /* 深藍：專業、信任 */
  --color-secondary: #64748b;      /* 灰：穩重 */
  --color-accent: #0284c7;         /* 亮藍：互動 */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;

  /* 保守圓角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* 微妙陰影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);

  /* 間距：規律 */
  --spacing-section: 64px;
  --spacing-card: 24px;
}

/* 企業按鈕 */
.corporate-button-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-weight: 500;
}

.corporate-button-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
}

/* 企業卡片 */
.corporate-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-card);
}
```

### 適用場景
- 企業官網
- B2B 軟體
- 專業服務
- 顧問公司
- 金融機構

### 不適用場景
- 年輕消費品牌
- 遊戲
- 創意機構
- 兒童產品

### 配色方案

| 產業 | 主色 | 說明 |
|------|------|------|
| 科技 | #1e40af | 深藍，創新但穩重 |
| 金融 | #0f172a | 深灰藍，權威 |
| 法律 | #1e3a5f | 海軍藍，信任 |
| 顧問 | #334155 | 中性灰，專業 |
| 醫療 | #0d9488 | 青綠，潔淨 |

### 字體推薦
- **標題**: Inter, SF Pro, Helvetica Neue
- **內文**: Inter, -apple-system, Segoe UI

---

## Swiss/Grid 瑞士網格

### 特徵
- 嚴格的網格系統
- 精準對齊
- 無襯線字體
- 功能性美學

### Token 調整

```css
:root {
  /* 網格系統 */
  --grid-columns: 12;
  --grid-gutter: 24px;
  --grid-margin: 48px;

  /* 瑞士色彩：黑白紅 */
  --color-black: #000000;
  --color-white: #ffffff;
  --color-red: #ff0000;
  --color-gray: #666666;

  /* 字體 */
  --font-display: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-body: 'Helvetica Neue', Helvetica, Arial, sans-serif;

  /* 字重 */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-bold: 700;

  /* 無圓角 */
  --radius: 0;

  /* 無陰影 */
  --shadow: none;
}

/* 網格容器 */
.swiss-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
  margin: 0 var(--grid-margin);
}

/* 瑞士標題 */
.swiss-heading {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

/* 瑞士分隔線 */
.swiss-divider {
  border: none;
  border-top: 2px solid var(--color-black);
  margin: 48px 0;
}
```

### 適用場景
- 設計機構
- 建築事務所
- 藝廊
- 排版設計
- 品牌識別

### 字體推薦
- **必用**: Helvetica Neue, Univers, Akzidenz Grotesk
- **替代**: Inter, Roboto, Work Sans

---

## Editorial 編輯風格

### 特徵
- 雜誌般的排版
- 優質閱讀體驗
- 圖文並茂
- 視覺敘事

### Token 調整

```css
:root {
  /* 編輯色彩 */
  --color-text: #1a1a1a;
  --color-text-muted: #666666;
  --color-background: #ffffff;
  --color-accent: #000000;
  --color-highlight: #fef3c7;

  /* 字體：Serif 標題 + Sans 內文 */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Source Sans Pro', -apple-system, sans-serif;

  /* 內容寬度 */
  --content-width: 720px;
  --wide-width: 1200px;

  /* 行高 */
  --line-height-heading: 1.2;
  --line-height-body: 1.7;
}

/* 文章標題 */
.editorial-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: var(--line-height-heading);
  letter-spacing: -0.02em;
}

/* 文章內文 */
.editorial-body {
  font-family: var(--font-body);
  font-size: 1.125rem;
  line-height: var(--line-height-body);
  max-width: var(--content-width);
  margin: 0 auto;
}

/* Drop cap */
.editorial-body > p:first-of-type::first-letter {
  font-family: var(--font-display);
  font-size: 4rem;
  float: left;
  line-height: 0.8;
  padding-right: 12px;
  padding-top: 8px;
}

/* 圖片說明 */
.editorial-caption {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 8px;
}

/* 引用 */
.editorial-quote {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-style: italic;
  border-left: 4px solid var(--color-accent);
  padding-left: 24px;
  margin: 48px 0;
}
```

### 適用場景
- 新聞網站
- 部落格
- 雜誌
- 長文閱讀
- 作品集

### 字體推薦
- **標題**: Playfair Display, Merriweather, Lora
- **內文**: Source Sans Pro, Libre Franklin, PT Sans

---

## Japanese Minimal 日式極簡

### 特徵
- 極致留白
- 禪意美學
- 不對稱平衡
- 自然材質感

### Token 調整

```css
:root {
  /* 日式色彩 */
  --color-sumi: #1a1a1a;         /* 墨色 */
  --color-shiro: #fafafa;        /* 白 */
  --color-hai: #9ca3af;          /* 灰 */
  --color-aka: #dc2626;          /* 赤 */
  --color-washi: #f5f5f0;        /* 和紙色 */

  /* 極大留白 */
  --spacing-massive: 160px;
  --spacing-large: 80px;
  --spacing-medium: 40px;

  /* 微妙細節 */
  --border-subtle: 1px solid rgba(0, 0, 0, 0.08);

  /* 無圓角 */
  --radius: 0;
}

/* 日式容器 */
.zen-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-massive) var(--spacing-medium);
}

/* 日式標題 */
.zen-heading {
  font-weight: 300;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-large);
}

/* 日式分隔 */
.zen-divider {
  width: 40px;
  height: 1px;
  background: var(--color-sumi);
  margin: var(--spacing-large) auto;
}

/* 強調點（赤） */
.zen-accent {
  color: var(--color-aka);
}
```

### 適用場景
- 高端品牌
- 藝廊
- 建築事務所
- 日本料理
- 精品飯店

### 字體推薦
- **英文**: Cormorant, Didot, Bodoni
- **日文**: Noto Sans JP, Noto Serif JP
- **中文**: Noto Sans TC (思源黑體)

---

## Art Deco 裝飾藝術

### 特徵
- 幾何圖案
- 金色裝飾
- 對稱構圖
- 1920s 奢華

### Token 調整

```css
:root {
  /* Art Deco 色彩 */
  --color-gold: #d4af37;
  --color-black: #1a1a1a;
  --color-cream: #f5f0e1;
  --color-teal: #008080;
  --color-burgundy: #722f37;

  /* 金色漸層 */
  --gradient-gold: linear-gradient(
    135deg,
    #bf953f 0%,
    #fcf6ba 50%,
    #b38728 100%
  );

  /* 幾何邊框 */
  --border-deco: 2px solid var(--color-gold);
}

/* Art Deco 框架 */
.deco-frame {
  border: var(--border-deco);
  padding: 24px;
  position: relative;
}

.deco-frame::before {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid var(--color-gold);
}

/* Art Deco 標題 */
.deco-heading {
  font-family: 'Poiret One', cursive;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* 扇形裝飾 */
.deco-fan {
  background: repeating-conic-gradient(
    from 0deg,
    var(--color-gold) 0deg 10deg,
    transparent 10deg 20deg
  );
  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
}
```

### 適用場景
- 奢侈品牌
- 高端飯店
- 珠寶
- 雞尾酒吧
- 復古活動

### 字體推薦
- **標題**: Poiret One, Broadway, Josefin Sans
- **內文**: Libre Baskerville, EB Garamond

---

## Legal/Finance 法律金融

### 特徵
- 極度保守
- 高信任感
- 清晰資訊
- 無華麗裝飾

### Token 調整

```css
:root {
  /* 保守色彩 */
  --color-navy: #1e3a5f;
  --color-dark-gray: #374151;
  --color-light-gray: #f3f4f6;
  --color-white: #ffffff;
  --color-gold-accent: #b8860b;  /* 金色點綴 */

  /* 正式字體 */
  --font-heading: Georgia, 'Times New Roman', serif;
  --font-body: -apple-system, BlinkMacSystemFont, sans-serif;

  /* 保守圓角 */
  --radius: 4px;

  /* 微妙陰影 */
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 法律/金融卡片 */
.formal-card {
  background: var(--color-white);
  border: 1px solid #e5e7eb;
  border-top: 3px solid var(--color-navy);
  padding: 24px;
}

/* 數據表格 */
.formal-table {
  border-collapse: collapse;
  width: 100%;
}

.formal-table th {
  background: var(--color-navy);
  color: white;
  padding: 12px;
  text-align: left;
}

.formal-table td {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
}
```

### 適用場景
- 律師事務所
- 銀行
- 保險公司
- 會計事務所
- 投資機構

---

## 最佳實踐

### 建立信任

```
專業感 = 一致性 + 清晰度 + 品質

1. 一致的間距系統
2. 規律的視覺節奏
3. 高品質的圖像
4. 清晰的資訊層級
```

### 無障礙優先

```css
/* 政府/醫療必須 WCAG AAA */
:root {
  --color-text: #1a1a1a;           /* 對比度 > 7:1 */
  --font-size-body: 18px;          /* 更大字體 */
  --line-height-body: 1.8;         /* 更大行高 */
}

/* Focus 狀態明顯 */
:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
```

### Do

- ✅ 保持視覺一致性
- ✅ 使用品牌色系統
- ✅ 確保高對比度
- ✅ 提供清晰的導航

### Don't

- ❌ 過度裝飾
- ❌ 使用花俏動效
- ❌ 忽略無障礙
- ❌ 跟隨短期趨勢
