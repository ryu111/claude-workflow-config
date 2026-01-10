# 進階字體排版

專業的字體系統設計，創造清晰、優雅且高可讀性的文字排版。

---

## 字體配對原則

### 配對策略

```
策略 1：對比配對
標題：Serif（襯線）
內文：Sans-serif（無襯線）

策略 2：同家族配對
標題：Roboto Bold
內文：Roboto Regular

策略 3：相似結構配對
兩種都是幾何無襯線體
結構相似但細節不同
```

### 經典配對推薦

```
高端/傳統：
├── 標題：Playfair Display (Serif)
└── 內文：Lato (Sans-serif)

現代/科技：
├── 標題：Inter (Sans-serif)
└── 內文：Inter (Sans-serif)
└── 程式碼：JetBrains Mono (Mono)

友善/人文：
├── 標題：Merriweather (Serif)
└── 內文：Open Sans (Sans-serif)

簡潔/企業：
├── 標題：Montserrat (Sans-serif)
└── 內文：Source Sans Pro (Sans-serif)

中文配對：
├── 標題：Noto Serif TC
└── 內文：Noto Sans TC
└── 英數：Inter 或 Roboto
```

### 配對原則

```
1. 最多 2-3 種字體
   └── 過多字體造成視覺混亂

2. 確保對比
   └── 如果太相似，不如用同一種

3. 考慮 x-height
   └── x 高度相近的字體更協調

4. 相似結構
   └── 字母形狀風格接近

5. 測試中英混排
   └── 確保基線對齊、比例和諧
```

---

## 模組化縮放 Modular Scale

### 什麼是模組化縮放

```
基於比例的字體大小系統
每一級是前一級乘以固定比例

常用比例：
├── 1.125 (Major Second) - 保守
├── 1.200 (Minor Third) - 常用
├── 1.250 (Major Third) - 常用
├── 1.333 (Perfect Fourth) - 明顯
├── 1.414 (Augmented Fourth) - 強烈
└── 1.618 (Golden Ratio) - 經典
```

### 計算範例

```
基準：16px
比例：1.25 (Major Third)

計算：
16 × 1.25⁰ = 16px   (base)
16 × 1.25¹ = 20px   (lg)
16 × 1.25² = 25px   (xl)
16 × 1.25³ = 31px   (2xl)
16 × 1.25⁴ = 39px   (3xl)
16 × 1.25⁵ = 49px   (4xl)

向下：
16 × 1.25⁻¹ = 12.8px (sm)
16 × 1.25⁻² = 10.2px (xs)
```

### CSS 實作

```css
:root {
  --scale-ratio: 1.25;
  --text-base: 1rem;

  /* 向上縮放 */
  --text-lg: calc(var(--text-base) * var(--scale-ratio));
  --text-xl: calc(var(--text-lg) * var(--scale-ratio));
  --text-2xl: calc(var(--text-xl) * var(--scale-ratio));
  --text-3xl: calc(var(--text-2xl) * var(--scale-ratio));
  --text-4xl: calc(var(--text-3xl) * var(--scale-ratio));

  /* 向下縮放 */
  --text-sm: calc(var(--text-base) / var(--scale-ratio));
  --text-xs: calc(var(--text-sm) / var(--scale-ratio));
}
```

### 預設值系統

```css
:root {
  /* 固定值（更可預測） */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
}
```

---

## 垂直韻律 Vertical Rhythm

### 概念

```
所有元素的高度和間距都是基線網格的倍數
創造視覺上的和諧與秩序

基線網格 = line-height 的基準單位
通常是 4px 或 8px
```

### 實作

```css
:root {
  --baseline: 4px;
  --line-height-base: 1.5;  /* 16px × 1.5 = 24px = 6 × baseline */
}

/* 確保 line-height 是 baseline 的倍數 */
body {
  font-size: 16px;
  line-height: 1.5;  /* 24px */
}

h1 {
  font-size: 2.25rem;  /* 36px */
  line-height: 1.2;    /* 43.2px ≈ 44px = 11 × baseline */
  margin-bottom: calc(var(--baseline) * 6);  /* 24px */
}

p {
  margin-bottom: calc(var(--baseline) * 4);  /* 16px */
}
```

### 元素對齊

```
視覺對齊：
┌─────────────────────────────────────┐ ← baseline
│ Heading                             │
├─────────────────────────────────────┤ ← baseline
│                                     │
│ Body text that spans multiple       │
│ lines should align to the grid.     │
│                                     │
├─────────────────────────────────────┤ ← baseline
│ Another paragraph                   │
└─────────────────────────────────────┘ ← baseline
```

---

## 流體字體 Fluid Typography

### CSS clamp() 方法

```css
/* clamp(最小值, 偏好值, 最大值) */
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  /* 最小 32px，隨視窗縮放，最大 64px */
}

/* 完整系統 */
:root {
  --text-base: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
  --text-lg: clamp(1.125rem, 1vw + 0.875rem, 1.5rem);
  --text-xl: clamp(1.25rem, 2vw + 0.75rem, 2rem);
  --text-2xl: clamp(1.5rem, 3vw + 0.5rem, 3rem);
  --text-3xl: clamp(1.875rem, 4vw + 0.25rem, 4rem);
}
```

### 計算公式

```
font-size: clamp(min, preferred, max)

preferred = slope × viewport + intercept

slope = (max - min) / (max-vw - min-vw)
intercept = min - slope × min-vw

範例：
min: 16px at 320px viewport
max: 24px at 1280px viewport

slope = (24 - 16) / (1280 - 320) = 0.00833
intercept = 16 - 0.00833 × 320 = 13.33px

font-size: clamp(16px, 0.833vw + 13.33px, 24px)
font-size: clamp(1rem, 0.833vw + 0.833rem, 1.5rem)
```

### 工具

```
線上計算器：
├── Utopia (utopia.fyi)
├── Fluid Type Scale (fluid-type-scale.com)
└── Modern Fluid Typography (modern-fluid-typography.vercel.app)
```

---

## 行長與可讀性

### 最佳行長

```
英文：45-75 字元（理想 66）
中文：25-35 字（理想 30）

行長過短：眼睛頻繁換行，影響閱讀節奏
行長過長：難以找到下一行起點
```

### CSS 控制

```css
/* 使用 ch 單位控制行長 */
.content {
  max-width: 65ch;  /* 約 65 個字元 */
}

/* 中文內容 */
.content-zh {
  max-width: 35em;  /* 約 35 個中文字 */
}

/* 或使用固定寬度 */
.content {
  max-width: 680px;  /* 常見文章寬度 */
}
```

### 響應式行長

```css
.article {
  /* 手機：全寬但有邊距 */
  padding: 0 1rem;

  /* 平板以上：限制最大寬度 */
  max-width: 65ch;
  margin: 0 auto;
}
```

---

## 字體效能優化

### 載入策略

```html
<!-- 預載入關鍵字體 -->
<link rel="preload" href="/fonts/inter-var.woff2"
      as="font" type="font/woff2" crossorigin>

<!-- 字體 CSS -->
<link rel="stylesheet" href="/fonts/fonts.css">
```

### font-display 屬性

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  /* swap: 先顯示備用字體，載入後替換 */
  /* optional: 如果已快取就用，否則用備用 */
  /* fallback: 短暫隱藏後顯示備用 */
}
```

### 子集化

```css
/* 只載入需要的字元 */
@font-face {
  font-family: 'Noto Sans TC';
  src: url('/fonts/noto-sans-tc-subset.woff2') format('woff2');
  unicode-range: U+4E00-9FFF;  /* CJK 漢字 */
}

/* 工具：Google Fonts、subfont、glyphhanger */
```

### 可變字體

```css
/* 單一檔案包含多種粗細 */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-var.woff2') format('woff2-variations');
  font-weight: 100 900;  /* 支援範圍 */
  font-stretch: 75% 125%;
}

/* 使用 */
.text-light { font-weight: 300; }
.text-regular { font-weight: 400; }
.text-medium { font-weight: 500; }
.text-bold { font-weight: 700; }

/* 動態調整 */
.text {
  font-variation-settings: 'wght' 450;
}
```

---

## 多語言處理

### 字體堆疊

```css
:root {
  /* 中英混排 */
  --font-sans: 'Inter', 'Noto Sans TC', -apple-system,
               BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* 日文 */
  --font-sans-jp: 'Inter', 'Noto Sans JP', 'Hiragino Sans',
                  'Meiryo', sans-serif;

  /* 韓文 */
  --font-sans-kr: 'Inter', 'Noto Sans KR', 'Malgun Gothic',
                  sans-serif;
}
```

### CJK 特殊處理

```css
/* 中日韓字體調整 */
:lang(zh),
:lang(ja),
:lang(ko) {
  /* CJK 字體通常需要更大的行高 */
  line-height: 1.7;

  /* 適當的字間距 */
  letter-spacing: 0.05em;
}

/* 標點擠壓 */
.chinese-text {
  font-feature-settings: "palt" 1;
}
```

### 數字與標點

```css
/* 等寬數字（表格用） */
.tabular-nums {
  font-feature-settings: "tnum" 1;
}

/* 比例數字（一般用） */
.proportional-nums {
  font-feature-settings: "pnum" 1;
}

/* 舊式數字 */
.oldstyle-nums {
  font-feature-settings: "onum" 1;
}
```

---

## OpenType 特性

### 常用特性

```css
/* 連字 */
.ligatures {
  font-feature-settings: "liga" 1, "clig" 1;
  /* fi, fl, ff 等會連接 */
}

/* 小型大寫字母 */
.small-caps {
  font-feature-settings: "smcp" 1;
  /* 或 */
  font-variant-caps: small-caps;
}

/* 上標/下標 */
.superscript {
  font-feature-settings: "sups" 1;
}
.subscript {
  font-feature-settings: "subs" 1;
}

/* 斜線零 */
.slashed-zero {
  font-feature-settings: "zero" 1;
}
```

### 字距調整

```css
/* 字偶間距（kerning） */
.kerning {
  font-kerning: normal;
  /* 或 */
  font-feature-settings: "kern" 1;
}

/* 手動字間距 */
.tight { letter-spacing: -0.025em; }
.normal { letter-spacing: 0; }
.wide { letter-spacing: 0.025em; }
.wider { letter-spacing: 0.05em; }
```

---

## 標題層級系統

### 層級設計

```css
:root {
  /* 字體大小 */
  --heading-1: 2.5rem;    /* 40px */
  --heading-2: 2rem;      /* 32px */
  --heading-3: 1.5rem;    /* 24px */
  --heading-4: 1.25rem;   /* 20px */
  --heading-5: 1.125rem;  /* 18px */
  --heading-6: 1rem;      /* 16px */

  /* 行高（標題較緊密） */
  --heading-line-height: 1.2;

  /* 字重 */
  --heading-weight: 600;
}

h1 {
  font-size: var(--heading-1);
  line-height: var(--heading-line-height);
  font-weight: var(--heading-weight);
  margin-bottom: 1.5rem;
}

h2 {
  font-size: var(--heading-2);
  line-height: var(--heading-line-height);
  font-weight: var(--heading-weight);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

/* ... */
```

### 標題間距規則

```
標題上方間距 > 標題下方間距

這樣標題會更靠近它所屬的內容

h2 {
  margin-top: 2.5rem;    /* 與上方內容分離 */
  margin-bottom: 1rem;   /* 靠近下方內容 */
}
```

---

## Quick Reference

### 字體大小

| Token | Size | 用途 |
|-------|------|------|
| xs | 12px | 輔助文字、標籤 |
| sm | 14px | 次要文字、表單 |
| base | 16px | 內文 |
| lg | 18px | 大內文 |
| xl | 20px | 小標題、引言 |
| 2xl | 24px | H4 |
| 3xl | 30px | H3 |
| 4xl | 36px | H2 |
| 5xl | 48px | H1 |

### 行高

| 類型 | 行高 |
|------|------|
| 標題 | 1.2 - 1.3 |
| 內文 | 1.5 - 1.6 |
| 中文 | 1.7 - 1.8 |
| 緊密 | 1.25 |
| 寬鬆 | 2 |

### 字重

| 名稱 | 值 | 用途 |
|------|-----|------|
| Light | 300 | 裝飾 |
| Regular | 400 | 內文 |
| Medium | 500 | 強調 |
| Semibold | 600 | 標題 |
| Bold | 700 | 重點 |

---

## Checklist

### 字體選擇
- [ ] 最多 2-3 種字體
- [ ] 字體配對和諧
- [ ] 支援所需語言
- [ ] 授權合規

### 縮放系統
- [ ] 使用一致的縮放比例
- [ ] 標題層級清晰
- [ ] 響應式調整

### 可讀性
- [ ] 內文 ≥ 16px
- [ ] 行長 45-75 字元
- [ ] 行高適當
- [ ] 對比度足夠

### 效能
- [ ] 字體預載入
- [ ] 適當的 font-display
- [ ] 考慮子集化
- [ ] 使用可變字體
