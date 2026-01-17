# Tech 科技風格群組

科技、未來、發光效果的設計風格。適用於科技產品、遊戲和前沿品牌。

---

## 風格列表

| 風格 | 特徵 | 最佳用途 |
|------|------|----------|
| Dark Mode Native | 原生深色、高對比 | 開發工具、IDE |
| Cyberpunk | 霓虹、故障效果 | 遊戲、科幻 |
| Neon Glow | 發光效果、深色背景 | 夜店、娛樂 |
| Matrix/Data | 數據流、終端風 | 資安、駭客 |
| Holographic | 全息漸層、iridescent | Web3、未來 |
| Futuristic | 幾何、科技線條 | 科技公司 |
| Terminal | 終端機、monospace | 開發者工具 |
| Sci-Fi | 科幻介面、HUD | 遊戲、VR |
| Glitch | 故障、破碎 | 音樂、藝術 |
| Liquid Metal | 金屬漸層、流體 | 高端科技 |

---

## Dark Mode Native 原生深色

### 特徵
- 深色背景為主
- 高對比文字
- 減少眼睛疲勞
- 專業、專注

### Token 調整

```css
:root {
  /* 深色層級系統 */
  --color-bg-0: #0a0a0a;     /* 最深 - 背景 */
  --color-bg-1: #141414;     /* 卡片 */
  --color-bg-2: #1f1f1f;     /* 提升元素 */
  --color-bg-3: #292929;     /* 選中/Hover */
  --color-bg-4: #333333;     /* 邊框 */

  /* 文字層級 */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa;
  --color-text-tertiary: #71717a;

  /* 強調色 */
  --color-primary: #3b82f6;
  --color-primary-glow: rgba(59, 130, 246, 0.4);

  /* 功能色（略微降飽和） */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* 邊框 */
  --border-subtle: 1px solid var(--color-bg-4);

  /* 陰影（深色模式用發光） */
  --shadow-glow: 0 0 20px var(--color-primary-glow);
}

/* 深色卡片 */
.dark-card {
  background: var(--color-bg-1);
  border: var(--border-subtle);
  border-radius: 8px;
}

/* 發光按鈕 */
.glow-button {
  background: var(--color-primary);
  box-shadow: var(--shadow-glow);
  border: none;
  transition: box-shadow 200ms;
}

.glow-button:hover {
  box-shadow: 0 0 30px var(--color-primary-glow);
}
```

### 適用場景
- 開發者工具
- IDE/程式編輯器
- 影音串流
- 專業軟體
- 夜間模式 App

### 不適用場景
- 兒童產品
- 日間閱讀為主
- 需要列印

### 配色方案

| 名稱 | 背景 | 主色 | 適用 |
|------|------|------|------|
| GitHub Dark | #0d1117 | #58a6ff | 開發工具 |
| VS Code | #1e1e1e | #569cd6 | IDE |
| Discord | #36393f | #5865f2 | 社群 |
| Spotify | #121212 | #1db954 | 媒體 |
| Netflix | #141414 | #e50914 | 串流 |

---

## Cyberpunk 賽博龐克

### 特徵
- 霓虹色彩（粉、青、紫）
- 故障/Glitch 效果
- 深色背景
- 未來都市感

### Token 調整

```css
:root {
  /* 賽博龐克色彩 */
  --color-neon-pink: #ff00ff;
  --color-neon-cyan: #00ffff;
  --color-neon-purple: #9d00ff;
  --color-neon-yellow: #ffff00;
  --color-bg: #0a0a0f;
  --color-surface: #12121a;

  /* 霓虹發光 */
  --glow-pink: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff;
  --glow-cyan: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff;

  /* 文字陰影發光 */
  --text-glow: 0 0 10px currentColor;
}

/* 霓虹文字 */
.neon-text {
  color: var(--color-neon-pink);
  text-shadow: var(--text-glow);
}

/* 霓虹邊框 */
.neon-border {
  border: 2px solid var(--color-neon-cyan);
  box-shadow: var(--glow-cyan), inset var(--glow-cyan);
}

/* Glitch 效果 */
.glitch {
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 var(--color-neon-pink);
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-1 2s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 var(--color-neon-cyan);
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim-2 2s infinite linear alternate-reverse;
}

@keyframes glitch-anim-1 {
  0%, 100% { clip: rect(42px, 9999px, 44px, 0); }
  25% { clip: rect(12px, 9999px, 95px, 0); }
  50% { clip: rect(78px, 9999px, 82px, 0); }
  75% { clip: rect(24px, 9999px, 67px, 0); }
}
```

### 適用場景
- 遊戲
- 電子音樂
- 科幻主題
- 夜店/活動
- NFT/Web3

### 不適用場景
- 企業軟體
- 銀行/金融
- 醫療
- 兒童

### 字體推薦
- **標題**: Orbitron, Audiowide, Rajdhani
- **內文**: Exo 2, Roboto Mono, Share Tech Mono

---

## Neon Glow 霓虹發光

### 特徵
- 強烈的發光效果
- 深色背景
- 聚焦效果
- 夜晚氛圍

### Token 調整

```css
:root {
  /* 發光系統 */
  --glow-sm: 0 0 5px currentColor, 0 0 10px currentColor;
  --glow-md: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
  --glow-lg: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;

  /* 動畫發光 */
  --glow-pulse: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

/* 發光按鈕 */
.neon-button {
  background: transparent;
  border: 2px solid var(--color-neon-pink);
  color: var(--color-neon-pink);
  box-shadow: var(--glow-md);
  animation: var(--glow-pulse);
}

/* 發光圖示 */
.neon-icon {
  filter: drop-shadow(var(--glow-sm));
}
```

### 適用場景
- 夜店/酒吧
- 音樂活動
- 娛樂產業
- 遊戲

---

## Matrix/Data 矩陣數據

### 特徵
- 終端機美學
- 數據流動畫
- 綠色/黑色
- 駭客感

### Token 調整

```css
:root {
  /* 矩陣色彩 */
  --color-matrix-green: #00ff41;
  --color-matrix-dark: #003b00;
  --color-bg: #000000;
  --color-text: var(--color-matrix-green);

  /* 字體 */
  --font-matrix: 'Courier New', 'Fira Code', monospace;
}

/* 矩陣文字 */
.matrix-text {
  font-family: var(--font-matrix);
  color: var(--color-matrix-green);
  text-shadow: 0 0 5px var(--color-matrix-green);
}

/* 數據雨效果（Canvas 或 CSS） */
.data-rain {
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--color-matrix-green) 50%,
    transparent 100%
  );
  animation: rain 1s linear infinite;
}

/* 終端機框 */
.terminal-box {
  background: var(--color-bg);
  border: 1px solid var(--color-matrix-green);
  font-family: var(--font-matrix);
  padding: 16px;
}

.terminal-box::before {
  content: '> ';
  color: var(--color-matrix-green);
}
```

### 適用場景
- 資安產品
- 開發者工具
- 駭客主題
- 數據分析

---

## Holographic 全息風格

### 特徵
- 彩虹漸層
- 金屬質感
- 光澤變化
- 未來感

### Token 調整

```css
:root {
  /* 全息漸層 */
  --gradient-holographic: linear-gradient(
    135deg,
    #ff0080 0%,
    #ff8c00 14%,
    #40e0d0 28%,
    #7fff00 42%,
    #00bfff 56%,
    #8a2be2 70%,
    #ff0080 84%,
    #ff0080 100%
  );

  /* iridescent 效果 */
  --gradient-iridescent: linear-gradient(
    45deg,
    #f0f0f0 0%,
    #e0e0ff 25%,
    #ffe0f0 50%,
    #e0fff0 75%,
    #f0f0f0 100%
  );
}

/* 全息卡片 */
.holographic-card {
  background: var(--gradient-holographic);
  background-size: 400% 400%;
  animation: holographic-shift 10s ease infinite;
  border-radius: 16px;
}

@keyframes holographic-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 全息文字 */
.holographic-text {
  background: var(--gradient-holographic);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 200% 200%;
  animation: holographic-shift 3s ease infinite;
}
```

### 適用場景
- NFT/Web3
- 創意產品
- 時尚品牌
- 音樂產業
- VisionOS

---

## Futuristic 未來主義

### 特徵
- 幾何線條
- 科技感裝飾
- HUD 元素
- 直線與角度

### Token 調整

```css
:root {
  /* 未來色彩 */
  --color-primary: #00d4ff;
  --color-secondary: #7b2ff7;
  --color-bg: #0c0c0c;
  --color-line: rgba(0, 212, 255, 0.3);

  /* 幾何裝飾 */
  --line-tech: 1px solid var(--color-line);
}

/* 科技線條背景 */
.tech-grid {
  background-image:
    linear-gradient(var(--color-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-line) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* HUD 角落 */
.hud-corner {
  position: relative;
}

.hud-corner::before,
.hud-corner::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primary);
}

.hud-corner::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.hud-corner::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

/* 掃描線效果 */
.scan-line {
  position: relative;
  overflow: hidden;
}

.scan-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-primary),
    transparent
  );
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}
```

### 適用場景
- 科技公司
- 汽車/航空
- 遊戲 HUD
- 智慧城市

---

## 最佳實踐

### 效能與動畫

```css
/* 發光效果使用 GPU */
.glow-element {
  will-change: filter, box-shadow;
  transform: translateZ(0);
}

/* 限制動畫元素 */
@media (prefers-reduced-motion: reduce) {
  .neon-animation,
  .glitch,
  .holographic-shift {
    animation: none;
  }
}

/* 低電量模式 */
@media (prefers-reduced-motion: reduce) {
  .glow-effect {
    box-shadow: none;
    border: 2px solid currentColor;
  }
}
```

### 可讀性

```css
/* 確保發光文字可讀 */
.neon-text {
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* 背景上的文字 */
.text-on-tech-bg {
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 16px;
  border-radius: 4px;
}
```

### Do

- ✅ 控制發光效果數量
- ✅ 提供非動畫回退
- ✅ 測試不同螢幕亮度
- ✅ 確保對比度足夠

### Don't

- ❌ 過度使用動畫
- ❌ 忽略效能影響
- ❌ 讓發光影響閱讀
- ❌ 在不適合的場景使用
