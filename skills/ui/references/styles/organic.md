# Organic 有機風格群組

自然、柔和、手繪感的設計風格。適用於親和力品牌和自然主題產品。

---

## 風格列表

| 風格 | 特徵 | 最佳用途 |
|------|------|----------|
| Organic Shapes | 不規則曲線、自然形狀 | 生活品牌、健康 |
| Hand-drawn | 手繪線條、草圖感 | 兒童、教育 |
| Nature-inspired | 植物、大地色 | 環保、有機食品 |
| Watercolor | 水彩質感、透明層疊 | 藝術、美妝 |
| Botanical | 植物插畫、花卉 | 美妝、婚禮 |
| Earthy | 大地色系、質樸 | 咖啡、手工藝 |
| Soft Gradient | 柔和漸層、流體 | 冥想、健康 |
| Paper/Craft | 紙張質感、手作感 | DIY、禮品 |

---

## Organic Shapes 有機形狀

### 特徵
- 不規則的曲線邊緣
- blob 形狀
- 自然流動感
- 柔和、友善

### Token 調整

```css
:root {
  /* 色彩：柔和、自然 */
  --color-primary: #6b9080;
  --color-secondary: #a4c3b2;
  --color-accent: #f6bd60;
  --color-background: #f4f1de;
  --color-surface: #ffffff;
  --color-text: #3d405b;

  /* 圓角：大而不規則 */
  --radius-organic: 30% 70% 70% 30% / 30% 30% 70% 70%;
  --radius-blob: 60% 40% 30% 70% / 60% 30% 70% 40%;
  --radius-soft: 24px;

  /* 陰影：柔和 */
  --shadow-soft: 0 10px 40px rgba(107, 144, 128, 0.15);
}

/* Blob 形狀 */
.blob {
  border-radius: var(--radius-blob);
  background: var(--color-secondary);
}

/* 有機卡片 */
.organic-card {
  border-radius: var(--radius-soft);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

/* Blob 背景裝飾 */
.blob-bg {
  position: absolute;
  width: 300px;
  height: 300px;
  background: var(--color-secondary);
  border-radius: var(--radius-blob);
  filter: blur(60px);
  opacity: 0.5;
  z-index: -1;
}
```

### SVG Blob 生成

```html
<!-- 使用 SVG 創建有機形狀 -->
<svg viewBox="0 0 200 200">
  <path fill="#6b9080" d="M47.5,-57.2C59.9,-46.1,67.3,-29.5,70.1,-12.1C72.9,5.3,71.1,23.5,62.1,37.2C53.1,50.9,36.8,60.1,19.4,65.1C2,70.1,-16.5,71,-32.4,64.8C-48.3,58.6,-61.6,45.4,-69.1,29.1C-76.6,12.8,-78.3,-6.6,-72.3,-23.1C-66.3,-39.6,-52.6,-53.2,-37.5,-63.5C-22.4,-73.8,-5.9,-80.8,8.5,-80.5C22.9,-80.2,35.1,-68.3,47.5,-57.2Z" transform="translate(100 100)"/>
</svg>
```

### 適用場景
- 健康/養生 App
- 有機食品品牌
- 環保產品
- 生活風格
- 冥想/正念

### 不適用場景
- 企業軟體
- 金融產品
- 數據密集
- 高科技

### 配色方案

| 名稱 | 主色 | 配色 | 感覺 |
|------|------|------|------|
| 森林 | #6b9080 | #a4c3b2, #cce3de | 自然、平靜 |
| 日落 | #f6bd60 | #e8871e, #f4a261 | 溫暖、活力 |
| 大地 | #8d6346 | #c9ada7, #f2e9e4 | 質樸、穩重 |
| 海洋 | #219ebc | #8ecae6, #023047 | 清新、深邃 |

### 字體推薦
- **標題**: Fraunces, Lora, Cormorant
- **內文**: Nunito, Source Sans Pro, Lato

---

## Hand-drawn 手繪風格

### 特徵
- 手繪線條
- 不完美的美感
- 草圖質感
- 親切、人性化

### Token 調整

```css
:root {
  /* 色彩：鉛筆、墨水感 */
  --color-ink: #2d3436;
  --color-pencil: #636e72;
  --color-paper: #faf9f6;
  --color-highlight: #fdcb6e;

  /* 手繪字體 */
  --font-handwritten: 'Caveat', 'Kalam', cursive;
  --font-sketch: 'Architects Daughter', 'Patrick Hand', cursive;

  /* 邊框：手繪感 */
  --border-sketch: 2px solid var(--color-ink);
}

/* 手繪按鈕 */
.hand-drawn-button {
  font-family: var(--font-sketch);
  background: var(--color-highlight);
  border: var(--border-sketch);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  /* 不規則圓角模擬手繪 */
}

/* 手繪框 */
.sketch-box {
  border: 3px solid var(--color-ink);
  border-radius: 2px 15px 15px 2px / 15px 2px 2px 15px;
  box-shadow: 2px 2px 0 var(--color-pencil);
}

/* 底線裝飾 */
.hand-underline {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10'%3E%3Cpath d='M0,5 Q25,0 50,5 T100,5' stroke='%232d3436' stroke-width='2' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: 100% 10px;
  padding-bottom: 8px;
}
```

### 適用場景
- 兒童教育
- 創意工作坊
- 個人部落格
- 手工藝品
- 食譜網站

### 不適用場景
- 企業專業
- 金融
- 醫療
- 法律

### 字體推薦
- **標題**: Caveat, Architects Daughter, Patrick Hand
- **內文**: Nunito, Open Sans（保持可讀性）

---

## Nature-inspired 自然啟發

### 特徵
- 植物元素
- 大地色系
- 自然紋理
- 環保意識

### Token 調整

```css
:root {
  /* 自然色彩 */
  --color-leaf: #2d6a4f;
  --color-forest: #1b4332;
  --color-moss: #40916c;
  --color-sand: #d4a373;
  --color-earth: #bc6c25;
  --color-sky: #90e0ef;
  --color-stone: #ced4da;
  --color-cream: #faedcd;

  /* 自然漸層 */
  --gradient-sunset: linear-gradient(180deg, #fad0c4 0%, #ffd1ff 100%);
  --gradient-forest: linear-gradient(180deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%);
  --gradient-ocean: linear-gradient(180deg, #023047 0%, #219ebc 50%, #8ecae6 100%);

  /* 紋理 */
  --texture-grain: url('/textures/grain.png');
  --texture-paper: url('/textures/recycled-paper.png');
}

/* 自然風卡片 */
.nature-card {
  background:
    var(--texture-paper),
    var(--color-cream);
  border: 1px solid var(--color-sand);
  border-radius: 12px;
}

/* 葉子裝飾 */
.leaf-decoration {
  background-image: url('/images/leaf-pattern.svg');
  background-repeat: no-repeat;
  background-position: top right;
  background-size: 200px;
}
```

### 適用場景
- 環保品牌
- 有機食品
- 戶外運動
- 農場/園藝
- 永續發展

### 配色方案

| 主題 | 色彩 | 感覺 |
|------|------|------|
| 森林 | #1b4332, #2d6a4f, #40916c | 穩重、信任 |
| 沙漠 | #d4a373, #bc6c25, #dda15e | 溫暖、質樸 |
| 海洋 | #023047, #219ebc, #8ecae6 | 清新、深邃 |
| 花園 | #606c38, #283618, #fefae0 | 生機、和諧 |

---

## Watercolor 水彩風格

### 特徵
- 水彩質感
- 透明層疊
- 柔和邊緣
- 藝術感

### Token 調整

```css
:root {
  /* 水彩色 */
  --watercolor-pink: rgba(255, 182, 193, 0.6);
  --watercolor-blue: rgba(173, 216, 230, 0.6);
  --watercolor-green: rgba(152, 251, 152, 0.5);
  --watercolor-yellow: rgba(255, 255, 224, 0.7);
  --watercolor-purple: rgba(216, 191, 216, 0.5);

  /* 背景 */
  --color-paper: #fffef9;
}

/* 水彩效果 */
.watercolor-blob {
  background: var(--watercolor-pink);
  filter: blur(20px);
  border-radius: 50%;
  mix-blend-mode: multiply;
}

/* 水彩邊框 */
.watercolor-border {
  border-image: url('/images/watercolor-border.png') 30 round;
}

/* 水彩文字背景 */
.watercolor-highlight {
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--watercolor-yellow) 10%,
    var(--watercolor-yellow) 90%,
    transparent 100%
  );
  padding: 0 8px;
}
```

### 適用場景
- 藝術作品集
- 婚禮邀請
- 美妝品牌
- 花店
- 文具品牌

---

## Botanical 植物風格

### 特徵
- 植物插畫
- 花卉圖案
- 優雅細緻
- 女性化

### Token 調整

```css
:root {
  /* 植物色 */
  --color-sage: #9caf88;
  --color-olive: #6b705c;
  --color-rose: #d4a5a5;
  --color-cream: #efe9e1;
  --color-gold: #c9a227;

  /* 圓角 */
  --radius-soft: 16px;
}

/* 植物裝飾容器 */
.botanical-container {
  background: var(--color-cream);
  border: 1px solid var(--color-sage);
  position: relative;
}

.botanical-container::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background-image: url('/images/botanical-corner.svg');
  background-size: contain;
}

/* 金邊效果 */
.gold-accent {
  border: 1px solid var(--color-gold);
  box-shadow: 0 0 0 1px var(--color-gold);
}
```

### 適用場景
- 美妝品牌
- 婚禮策劃
- 花店
- 高端 Spa
- 香氛品牌

---

## 最佳實踐

### 平衡裝飾與功能

```css
/* 裝飾元素不應影響互動 */
.decorative {
  pointer-events: none;
  z-index: -1;
}

/* 確保文字可讀 */
.text-on-organic {
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
  border-radius: 8px;
}
```

### 效能考量

```css
/* 避免過多 blur */
.organic-element {
  /* 使用預製的模糊圖片而非 CSS blur */
  background-image: url('/images/blurred-blob.png');
}

/* 限制動畫元素數量 */
@media (prefers-reduced-motion: reduce) {
  .floating-element {
    animation: none;
  }
}
```

### Do

- ✅ 保持配色和諧
- ✅ 使用高品質的插畫/紋理
- ✅ 確保文字對比度
- ✅ 響應式調整裝飾元素

### Don't

- ❌ 過度使用裝飾
- ❌ 讓裝飾干擾功能
- ❌ 使用低解析度圖像
- ❌ 忽略載入效能
