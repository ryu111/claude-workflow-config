# Bold 大膽風格群組

大膽、對比強烈、富有表達力的設計風格。適用於創意品牌和年輕受眾。

---

## 風格列表

| 風格 | 特徵 | 最佳用途 |
|------|------|----------|
| Neubrutalism | 粗邊框、高對比、不對稱 | 創意機構、新創 |
| Memphis | 幾何圖形、鮮豔色彩 | 兒童、娛樂 |
| Maximalist | 豐富、裝飾、層疊 | 藝術、時尚 |
| Retro/Vintage | 復古配色、老式字體 | 品牌、咖啡店 |
| Punk/Grunge | 破碎、紋理、反叛 | 音樂、次文化 |
| Pop Art | 漫畫、半色調、對話泡 | 娛樂、行銷 |
| Geometric | 幾何形狀、銳利 | 科技、建築 |
| Collage | 拼貼、混搭 | 雜誌、創意 |
| Brutalist Web | 原始、功能暴露 | 藝術、實驗 |
| Anti-Design | 打破規則、挑釁 | 前衛、藝術 |

---

## Neubrutalism 新野獸派

### 特徵
- 粗黑邊框（2-4px）
- 硬陰影（無模糊）
- 高對比色彩
- 不對稱佈局
- 原始、直接的美感

### Token 調整

```css
:root {
  /* 色彩：高飽和、高對比 */
  --color-primary: #ff6b6b;
  --color-secondary: #4ecdc4;
  --color-accent: #ffe66d;
  --color-background: #f7fff7;
  --color-surface: #ffffff;
  --color-text: #1a1a2e;

  /* 邊框：粗黑 */
  --border-width: 3px;
  --border-color: #1a1a2e;
  --border-style: solid;

  /* 陰影：硬陰影 */
  --shadow-brutal: 4px 4px 0 var(--border-color);
  --shadow-brutal-hover: 6px 6px 0 var(--border-color);

  /* 圓角：無或極小 */
  --radius-sm: 0px;
  --radius-md: 4px;
  --radius-lg: 8px;

  /* 字體：粗體 */
  --font-weight-heading: 800;
  --font-weight-body: 500;
}

/* Brutal 按鈕 */
.brutal-button {
  background: var(--color-primary);
  border: var(--border-width) var(--border-style) var(--border-color);
  box-shadow: var(--shadow-brutal);
  border-radius: var(--radius-md);
  font-weight: 700;
  text-transform: uppercase;
  transition: transform 100ms, box-shadow 100ms;
}

.brutal-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-brutal-hover);
}

.brutal-button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--border-color);
}

/* Brutal 卡片 */
.brutal-card {
  background: var(--color-surface);
  border: var(--border-width) var(--border-style) var(--border-color);
  box-shadow: var(--shadow-brutal);
}
```

### 適用場景
- 創意機構網站
- 新創 Landing Page
- 設計作品集
- 獨立品牌
- 活動頁面

### 不適用場景
- 銀行/金融
- 醫療健康
- 法律事務所
- 企業 B2B
- 老年用戶

### 配色方案

| 名稱 | Primary | Secondary | Accent | 風格 |
|------|---------|-----------|--------|------|
| 珊瑚青 | #ff6b6b | #4ecdc4 | #ffe66d | 活力 |
| 紫橙 | #9b5de5 | #f15bb5 | #fee440 | 創意 |
| 藍綠 | #00b4d8 | #90e0ef | #caf0f8 | 清新 |
| 黑白紅 | #000000 | #ffffff | #ff0000 | 經典 |
| 螢光 | #39ff14 | #ff00ff | #00ffff | 賽博 |

### 字體推薦
- **標題**: Space Grotesk, Archivo Black, Bebas Neue
- **內文**: Space Grotesk, Work Sans, IBM Plex Sans

---

## Memphis 孟菲斯

### 特徵
- 幾何圖形（圓、三角、波浪）
- 鮮豔、不協調的色彩
- 圖案和紋理
- 80 年代復古感
- 玩味、不嚴肅

### Token 調整

```css
:root {
  /* 色彩：鮮豔、高飽和 */
  --color-pink: #ff69b4;
  --color-yellow: #ffde00;
  --color-cyan: #00ffff;
  --color-red: #ff0000;
  --color-blue: #0000ff;
  --color-green: #00ff00;
  --color-black: #000000;
  --color-background: #ffffff;

  /* 邊框 */
  --border-width: 3px;
  --border-color: var(--color-black);

  /* 圖案 */
  --pattern-dots: radial-gradient(circle, #000 1px, transparent 1px);
  --pattern-lines: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    #000 10px,
    #000 11px
  );
}

/* Memphis 裝飾元素 */
.memphis-circle {
  width: 100px;
  height: 100px;
  background: var(--color-pink);
  border: var(--border-width) solid var(--color-black);
  border-radius: 50%;
}

.memphis-triangle {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 86px solid var(--color-yellow);
}

.memphis-squiggle {
  /* SVG 波浪線 */
}
```

### 適用場景
- 兒童產品
- 娛樂/活動
- 時尚品牌
- 音樂節
- 遊戲

### 不適用場景
- 企業軟體
- 金融產品
- 醫療
- 法律
- 高端奢侈品

---

## Maximalist 極繁主義

### 特徵
- 豐富的視覺元素
- 層疊的圖像和紋理
- 裝飾性細節
- 更多就是更多
- 感官刺激

### Token 調整

```css
:root {
  /* 多色彩 */
  --color-1: #9b5de5;
  --color-2: #f15bb5;
  --color-3: #fee440;
  --color-4: #00bbf9;
  --color-5: #00f5d4;

  /* 漸層背景 */
  --gradient-max: linear-gradient(
    135deg,
    var(--color-1) 0%,
    var(--color-2) 25%,
    var(--color-3) 50%,
    var(--color-4) 75%,
    var(--color-5) 100%
  );

  /* 豐富陰影 */
  --shadow-layered:
    0 2px 4px rgba(0,0,0,0.1),
    0 4px 8px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.1),
    0 16px 32px rgba(0,0,0,0.1);

  /* 裝飾邊框 */
  --border-decorative: 4px double var(--color-1);
}
```

### 適用場景
- 藝術展覽
- 時尚雜誌
- 奢侈品牌
- 婚禮策劃
- 餐廳/酒吧

### 不適用場景
- 工具類產品
- 資訊密集
- 快速操作

---

## Retro/Vintage 復古懷舊

### 特徵
- 復古配色（米黃、棕、橙）
- 老式字體
- 紋理和顆粒
- 圓角和軟邊
- 懷舊感

### Token 調整

```css
:root {
  /* 復古色彩 */
  --color-cream: #f5f0e1;
  --color-brown: #8b4513;
  --color-orange: #ff6f00;
  --color-teal: #008080;
  --color-rust: #a0522d;

  /* 紋理 */
  --texture-paper: url('/textures/paper.png');
  --texture-noise: url('/textures/noise.png');

  /* 圓角 */
  --radius-retro: 8px;

  /* 字體 */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Libre Baskerville', serif;
}

.retro-card {
  background:
    var(--texture-paper),
    var(--color-cream);
  border-radius: var(--radius-retro);
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.2);
}
```

### 適用場景
- 咖啡店/餐廳
- 手工藝品
- 古董店
- 復古品牌
- 老字號

### 配色方案

| 年代 | 主色 | 配色 | 感覺 |
|------|------|------|------|
| 50s | 粉紅、薄荷 | #ffb6c1, #98ff98 | 甜美 |
| 60s | 橙、棕、綠 | #ff6f00, #8b4513 | 嬉皮 |
| 70s | 橙、棕、米 | #d2691e, #f5deb3 | 溫暖 |
| 80s | 霓虹、紫 | #ff00ff, #00ffff | 迪斯可 |

---

## Brutalist Web 網頁野獸派

### 特徵
- 系統字體
- 原始 HTML 美感
- 功能暴露
- 反設計
- 極度誠實

### Token 調整

```css
:root {
  /* 系統字體 */
  --font-system: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                 Roboto, Oxygen, Ubuntu, sans-serif;
  --font-mono: 'Courier New', Courier, monospace;

  /* 無裝飾 */
  --radius: 0;
  --shadow: none;
  --border: 1px solid #000;

  /* 基礎色 */
  --color-bg: #ffffff;
  --color-text: #000000;
  --color-link: #0000ff;
  --color-visited: #800080;
}

/* 原始連結 */
a {
  color: var(--color-link);
  text-decoration: underline;
}

a:visited {
  color: var(--color-visited);
}

/* 原始按鈕 */
button {
  font: inherit;
  background: #c0c0c0;
  border: 2px outset #c0c0c0;
  cursor: pointer;
}
```

### 適用場景
- 藝術家網站
- 實驗性專案
- 開發者部落格
- 學術研究
- 前衛展覽

---

## 最佳實踐

### 平衡原則

```
大膽 ≠ 混亂

即使是大膽風格也需要：
- 清晰的視覺層級
- 一致的元素系統
- 可預測的互動
- 足夠的對比度
```

### 響應式考量

```css
/* 在小螢幕上減少裝飾 */
@media (max-width: 768px) {
  .decorative-element {
    display: none;
  }

  .brutal-shadow {
    --shadow-brutal: 2px 2px 0 var(--border-color);
  }
}
```

### Do

- ✅ 保持品牌一致性
- ✅ 確保核心功能可用
- ✅ 測試不同螢幕尺寸
- ✅ 考慮目標受眾接受度

### Don't

- ❌ 為大膽而大膽
- ❌ 忽略可讀性
- ❌ 過度使用動效
- ❌ 在專業場景誤用
