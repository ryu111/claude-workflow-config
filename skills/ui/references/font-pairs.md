# 字體配對庫

57+ 精選字體配對，含 Google Fonts 連結和 CSS 配置。

---

## 使用方式

1. 根據風格/用途選擇配對
2. 複製 CSS import 或 link 標籤
3. 套用 Tailwind/CSS 配置
4. 根據需要調整字重

---

## 現代 / 通用

### Inter + Inter

最安全的選擇，適用於任何專業產品。

```css
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-heading: 'Inter', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}
```

| 用途 | 字重 | 大小 |
|------|------|------|
| H1 | 700 | 48px |
| H2 | 600 | 36px |
| Body | 400 | 16px |
| Small | 400 | 14px |

**適用**：SaaS、工具、企業

---

### Outfit + DM Sans

現代、友善、圓潤。

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

:root {
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

**適用**：App、生活服務、年輕品牌

---

### Space Grotesk + Work Sans

幾何、現代、科技感。

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Work+Sans:wght@400;500&display=swap');

:root {
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Work Sans', sans-serif;
}
```

**適用**：科技、新創、Neubrutalism

---

### Poppins + Open Sans

經典組合，高可讀性。

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Open+Sans:wght@400;500&display=swap');

:root {
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Open Sans', sans-serif;
}
```

**適用**：通用、電商、企業

---

### Plus Jakarta Sans + Plus Jakarta Sans

現代幾何，專業但友善。

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

**適用**：SaaS、Dashboard、現代 App

---

## 優雅 / 高端

### Playfair Display + Source Sans Pro

經典 Serif + Sans 組合，編輯風格。

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+Pro:wght@400;600&display=swap');

:root {
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Source Sans Pro', sans-serif;
}
```

**適用**：雜誌、部落格、奢侈品

---

### Cormorant + Montserrat

高端、精緻、時尚。

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600;700&family=Montserrat:wght@400;500&display=swap');

:root {
  --font-heading: 'Cormorant', serif;
  --font-body: 'Montserrat', sans-serif;
}
```

**適用**：時尚、珠寶、婚禮

---

### Lora + Nunito

溫暖優雅，適合閱讀。

```css
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Nunito:wght@400;600&display=swap');

:root {
  --font-heading: 'Lora', serif;
  --font-body: 'Nunito', sans-serif;
}
```

**適用**：部落格、書籍、養生

---

### Fraunces + Commissioner

復古現代，獨特個性。

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=Commissioner:wght@400;500&display=swap');

:root {
  --font-heading: 'Fraunces', serif;
  --font-body: 'Commissioner', sans-serif;
}
```

**適用**：品牌、咖啡店、手工藝

---

## 大膽 / 創意

### Bebas Neue + Roboto

大膽標題，專業內文。

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;500&display=swap');

:root {
  --font-heading: 'Bebas Neue', sans-serif;
  --font-body: 'Roboto', sans-serif;
}
```

**適用**：運動、活動、Bold Minimal

---

### Anton + Work Sans

極度大膽，視覺衝擊。

```css
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Work+Sans:wght@400;500&display=swap');

:root {
  --font-heading: 'Anton', sans-serif;
  --font-body: 'Work Sans', sans-serif;
}
```

**適用**：品牌 Landing、時尚、海報

---

### Archivo Black + Archivo

統一家族，粗細對比。

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500&display=swap');

:root {
  --font-heading: 'Archivo Black', sans-serif;
  --font-body: 'Archivo', sans-serif;
}
```

**適用**：品牌、Neubrutalism

---

### Oswald + Lato

壓縮標題，經典內文。

```css
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Lato:wght@400;700&display=swap');

:root {
  --font-heading: 'Oswald', sans-serif;
  --font-body: 'Lato', sans-serif;
}
```

**適用**：運動、新聞、活動

---

## 科技 / 未來

### Orbitron + Exo 2

科幻、未來感。

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Exo+2:wght@400;500&display=swap');

:root {
  --font-heading: 'Orbitron', sans-serif;
  --font-body: 'Exo 2', sans-serif;
}
```

**適用**：遊戲、科幻、太空

---

### Rajdhani + Share Tech

幾何科技感。

```css
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech:wght@400&display=swap');

:root {
  --font-heading: 'Rajdhani', sans-serif;
  --font-body: 'Share Tech', sans-serif;
}
```

**適用**：科技、AI、機器人

---

### JetBrains Mono + Inter

程式碼友善，開發者工具。

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500&display=swap');

:root {
  --font-heading: 'JetBrains Mono', monospace;
  --font-body: 'Inter', sans-serif;
  --font-code: 'JetBrains Mono', monospace;
}
```

**適用**：開發者工具、技術文件

---

### Fira Code + Fira Sans

統一家族，程式碼連字。

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Fira+Sans:wght@400;500&display=swap');

:root {
  --font-heading: 'Fira Sans', sans-serif;
  --font-body: 'Fira Sans', sans-serif;
  --font-code: 'Fira Code', monospace;
}
```

**適用**：IDE、終端機、文件

---

## 手寫 / 有機

### Caveat + Nunito

手寫標題，清晰內文。

```css
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Nunito:wght@400;600&display=swap');

:root {
  --font-heading: 'Caveat', cursive;
  --font-body: 'Nunito', sans-serif;
}
```

**適用**：手工藝、部落格、兒童

---

### Kalam + Open Sans

友善手寫，專業內文。

```css
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Open+Sans:wght@400;600&display=swap');

:root {
  --font-heading: 'Kalam', cursive;
  --font-body: 'Open Sans', sans-serif;
}
```

**適用**：教育、食譜、筆記

---

### Patrick Hand + Source Sans Pro

童趣手寫。

```css
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Source+Sans+Pro:wght@400;600&display=swap');

:root {
  --font-heading: 'Patrick Hand', cursive;
  --font-body: 'Source Sans Pro', sans-serif;
}
```

**適用**：兒童教育、遊戲

---

## 中文字體

### 思源黑體 + Inter

最佳中英混排。

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Inter:wght@400;500;700&display=swap');

:root {
  --font-heading: 'Noto Sans TC', 'Inter', sans-serif;
  --font-body: 'Noto Sans TC', 'Inter', sans-serif;
}
```

**適用**：任何中文產品

---

### 思源宋體 + 思源黑體

中文 Serif + Sans 組合。

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@400;500&display=swap');

:root {
  --font-heading: 'Noto Serif TC', serif;
  --font-body: 'Noto Sans TC', sans-serif;
}
```

**適用**：雜誌、部落格、文學

---

### LXGW WenKai

書法感手寫體（需自行載入）。

```css
/* 需要自行下載或使用 CDN */
@font-face {
  font-family: 'LXGW WenKai';
  src: url('LXGWWenKai-Regular.ttf') format('truetype');
}

:root {
  --font-display: 'LXGW WenKai', serif;
  --font-body: 'Noto Sans TC', sans-serif;
}
```

**適用**：文化、藝術、傳統

---

## 多語言

### Atkinson Hyperlegible

專為視覺障礙設計，高可讀性。

```css
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');

:root {
  --font-accessible: 'Atkinson Hyperlegible', sans-serif;
}
```

**適用**：無障礙、政府、長者

---

### Noto Sans 系列

支援所有語言的統一外觀。

```css
/* 按需載入語言 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');

:root {
  --font-universal: 'Noto Sans', 'Noto Sans JP', 'Noto Sans KR', sans-serif;
}
```

**適用**：多語言產品、國際化

---

## Tailwind 配置

```js
// tailwind.config.js
module.exports = {
  theme: {
    fontFamily: {
      'heading': ['Outfit', 'sans-serif'],
      'body': ['DM Sans', 'sans-serif'],
      'mono': ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.2' }],
      '6xl': ['3.75rem', { lineHeight: '1.1' }],
    },
  },
}
```

---

## 選擇指南

| 場景 | 推薦配對 |
|------|----------|
| 通用/SaaS | Inter + Inter |
| 現代 App | Outfit + DM Sans |
| 奢侈品 | Cormorant + Montserrat |
| 新聞/編輯 | Playfair Display + Source Sans Pro |
| 科技/遊戲 | Orbitron + Exo 2 |
| 開發者 | JetBrains Mono + Inter |
| 兒童 | Patrick Hand + Source Sans Pro |
| 中文產品 | Noto Sans TC + Inter |
| 無障礙 | Atkinson Hyperlegible |

---

## 效能建議

```html
<!-- 預載重要字體 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

<!-- font-display: swap -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
/* 子集化 */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  unicode-range: U+0000-00FF; /* 只載入拉丁字元 */
}
```
