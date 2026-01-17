# Dimensional 立體風格群組

強調深度、層次和立體感的設計風格。適用於現代 App 和高端產品。

---

## 風格列表

| 風格 | 特徵 | 最佳用途 |
|------|------|----------|
| Glassmorphism | 玻璃效果、模糊 | 儀表板、天氣 App |
| Neumorphism | 內凹外凸、柔和陰影 | 音樂播放器、計算機 |
| Claymorphism | 黏土質感、圓潤 | 3D 產品、遊戲 |
| Layered Cards | 層疊卡片、深度 | 內容展示、作品集 |
| 3D Illustrated | 3D 元素插畫 | Landing Page |
| Floating Elements | 浮動元素、陰影 | 行銷頁面 |
| Depth Shadows | 深度陰影層次 | 電商、App |
| Aurora | 極光漸層背景 | AI 產品、創意 |

---

## Glassmorphism 玻璃擬態

### 特徵
- 半透明背景 + 模糊效果
- 微妙的邊框
- 漸層色彩背景
- 浮動層次感

### Token 調整

```css
:root {
  /* 背景漸層 */
  --gradient-bg: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

  /* 玻璃效果 */
  --glass-bg: rgba(255, 255, 255, 0.15);
  --glass-bg-hover: rgba(255, 255, 255, 0.25);
  --glass-border: 1px solid rgba(255, 255, 255, 0.2);
  --glass-blur: blur(12px);
  --glass-saturate: saturate(180%);

  /* 陰影 */
  --shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15);

  /* 圓角 */
  --radius-md: 16px;
  --radius-lg: 24px;

  /* 文字 */
  --color-text: #ffffff;
  --color-text-muted: rgba(255, 255, 255, 0.7);
}

/* 玻璃卡片 */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur) var(--glass-saturate);
  -webkit-backdrop-filter: var(--glass-blur) var(--glass-saturate);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
}
```

### 適用場景
- 儀表板、數據展示
- 天氣/音樂 App
- 現代 SaaS Landing
- AI 產品
- VisionOS 風格

### 不適用場景
- 資訊密集表格
- 需要高對比度（無障礙）
- 低端裝置（效能）
- 企業傳統系統

### 效能考量

```css
/* 效能優化：限制 blur 範圍 */
.glass-card {
  contain: paint;
  will-change: backdrop-filter;
}

/* 回退方案 */
@supports not (backdrop-filter: blur(12px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.9);
  }
}
```

### 配色建議

| 組合 | 漸層色 | 適用 |
|------|--------|------|
| 紫藍 | #667eea → #764ba2 | AI、科技 |
| 青紫 | #4facfe → #00f2fe | 天氣、清新 |
| 橙粉 | #fa709a → #fee140 | 活力、年輕 |
| 深邃 | #0f0c29 → #302b63 → #24243e | 專業、深色 |

### 字體推薦
- **標題**: SF Pro Display, Inter
- **內文**: SF Pro Text, Inter

---

## Neumorphism 新擬態

### 特徵
- 柔和的凸起/凹陷效果
- 相同色系的雙色陰影
- 接近背景的元素色
- 微妙的 3D 感

### Token 調整

```css
:root {
  /* 基礎色 */
  --color-bg: #e0e5ec;
  --color-surface: #e0e5ec;

  /* 新擬態陰影 */
  --shadow-light: #ffffff;
  --shadow-dark: #a3b1c6;

  /* 凸起效果 */
  --neu-raised:
    6px 6px 12px var(--shadow-dark),
    -6px -6px 12px var(--shadow-light);

  /* 凹陷效果 */
  --neu-inset:
    inset 4px 4px 8px var(--shadow-dark),
    inset -4px -4px 8px var(--shadow-light);

  /* 圓角 */
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 50%;
}

/* 凸起按鈕 */
.neu-button {
  background: var(--color-surface);
  box-shadow: var(--neu-raised);
  border: none;
  border-radius: var(--radius-md);
}

.neu-button:active {
  box-shadow: var(--neu-inset);
}

/* 凹陷輸入框 */
.neu-input {
  background: var(--color-surface);
  box-shadow: var(--neu-inset);
  border: none;
}
```

### 適用場景
- 音樂播放器
- 計算機 App
- 控制面板
- 智慧家居界面

### 不適用場景
- 文字密集內容
- 需要高對比度
- 複雜的資料表格
- 多色彩需求

### 無障礙警告

⚠️ **Neumorphism 對比度低，需特別注意：**
- 文字對比度可能不足 4.5:1
- 按鈕邊界不明顯
- 建議僅用於裝飾性元素
- 核心功能應保持足夠對比

### 配色建議

| 基底色 | Light Shadow | Dark Shadow | 適用 |
|--------|--------------|-------------|------|
| #e0e5ec | #ffffff | #a3b1c6 | 經典淺灰 |
| #1a1a2e | #2a2a4e | #0a0a1e | 深色版本 |
| #d4e7ed | #ffffff | #9fbbc7 | 冷色調 |

---

## Claymorphism 黏土擬態

### 特徵
- 圓潤、膨脹的外觀
- 柔和的外陰影
- 內部漸層營造 3D
- 可愛、友善

### Token 調整

```css
:root {
  /* 基礎 */
  --color-bg: #f0f0f3;

  /* 黏土效果 */
  --clay-shadow:
    0 35px 68px rgba(0, 0, 0, 0.15),
    inset 0 -8px 16px rgba(0, 0, 0, 0.05);

  --clay-highlight:
    inset 0 8px 16px rgba(255, 255, 255, 0.5);

  /* 大圓角 */
  --radius-clay: 32px;
}

.clay-card {
  background: linear-gradient(145deg, #ffffff 0%, #e6e6e6 100%);
  box-shadow: var(--clay-shadow), var(--clay-highlight);
  border-radius: var(--radius-clay);
  border: none;
}
```

### 適用場景
- 3D 產品展示
- 遊戲 UI
- 兒童 App
- NFT/數位藝術

### 不適用場景
- 企業軟體
- 金融產品
- 專業工具

---

## Layered Cards 層疊卡片

### 特徵
- 多層卡片堆疊
- 偏移的陰影
- 清晰的深度層次
- 互動時的抬升效果

### Token 調整

```css
:root {
  /* 層次系統 */
  --elevation-0: 0px;
  --elevation-1: 0 2px 4px rgba(0, 0, 0, 0.05);
  --elevation-2: 0 4px 8px rgba(0, 0, 0, 0.08);
  --elevation-3: 0 8px 16px rgba(0, 0, 0, 0.1);
  --elevation-4: 0 16px 32px rgba(0, 0, 0, 0.12);

  /* Hover 提升 */
  --elevation-hover: 0 20px 40px rgba(0, 0, 0, 0.15);
  --transform-hover: translateY(-8px);
}

.layered-card {
  box-shadow: var(--elevation-2);
  transition:
    box-shadow 200ms ease-out,
    transform 200ms ease-out;
}

.layered-card:hover {
  box-shadow: var(--elevation-hover);
  transform: var(--transform-hover);
}

/* 堆疊效果 */
.card-stack {
  position: relative;
}

.card-stack::before,
.card-stack::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  background: inherit;
}

.card-stack::before {
  inset: 8px -4px -8px 4px;
  opacity: 0.6;
  z-index: -1;
}

.card-stack::after {
  inset: 16px -8px -16px 8px;
  opacity: 0.3;
  z-index: -2;
}
```

### 適用場景
- 作品集展示
- 產品卡片
- 內容列表
- 電商商品

---

## Aurora 極光風格

### 特徵
- 流動的漸層背景
- 柔和的色彩過渡
- 動態效果
- 夢幻感

### Token 調整

```css
:root {
  /* 極光漸層 */
  --aurora-gradient:
    radial-gradient(ellipse at 0% 0%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 0%, rgba(74, 222, 128, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);

  --color-bg: #0a0a0a;
}

.aurora-bg {
  background: var(--color-bg);
  position: relative;
}

.aurora-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--aurora-gradient);
  filter: blur(60px);
  animation: aurora 15s ease-in-out infinite;
}

@keyframes aurora {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}
```

### 適用場景
- AI/ML 產品
- 創意工具
- 音樂串流
- 品牌 Landing

---

## 最佳實踐

### 效能優先

```css
/* 限制 blur 影響範圍 */
.glass-element {
  contain: paint;
}

/* GPU 加速 */
.dimensional-card {
  transform: translateZ(0);
  will-change: transform;
}

/* 減少動畫元素 */
@media (prefers-reduced-motion: reduce) {
  .aurora-bg::before {
    animation: none;
  }
}
```

### 層級管理

```css
/* z-index 系統 */
--z-background: 0;
--z-surface: 10;
--z-card: 20;
--z-dropdown: 30;
--z-modal: 40;
--z-tooltip: 50;
```

### Do

- ✅ 保持層次清晰
- ✅ 提供非 blur 回退
- ✅ 測試低端裝置效能
- ✅ 確保足夠對比度

### Don't

- ❌ 過度使用 blur（效能殺手）
- ❌ 忽略無障礙需求
- ❌ 層數過多造成混亂
- ❌ 動效過於複雜
