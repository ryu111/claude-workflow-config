# 動效設計系統

有目的性的動態效果，提升使用者體驗和介面品質。

---

## 動效設計原則

### 核心原則

```
1. 目的性 (Purposeful)
   └── 每個動效都有存在的理由

2. 自然性 (Natural)
   └── 模擬真實世界的物理運動

3. 一致性 (Consistent)
   └── 相同類型動效行為一致

4. 快速性 (Swift)
   └── 不阻礙使用者操作
```

### 動效用途

| 用途 | 說明 | 範例 |
|------|------|------|
| 回饋 | 確認使用者動作 | 按鈕點擊、開關切換 |
| 引導 | 導引注意力 | 新功能提示、錯誤指示 |
| 連續性 | 表達元素關係 | 頁面轉場、展開收合 |
| 狀態 | 顯示系統狀態 | 載入動畫、進度指示 |
| 品牌 | 強化品牌識別 | 歡迎動畫、Logo 動態 |
| 愉悅 | 創造正面情緒 | 完成慶祝、按讚動畫 |

---

## Duration 持續時間

### 時間指南

```
瞬間回饋：50-100ms
├── Hover 狀態
├── 按鈕按下
└── 焦點變化

快速動作：150-200ms
├── Toggle 開關
├── Checkbox/Radio
└── 小元素出現

標準過渡：200-300ms
├── Modal/Drawer 開啟
├── Dropdown 展開
├── Toast 通知
└── Tab 切換

複雜動畫：300-500ms
├── 頁面轉場
├── 大型展開收合
├── 列表重新排序
└── 骨架載入

特殊效果：500ms+
├── 歡迎動畫
├── 載入動畫（循環）
├── 慶祝效果
└── 品牌動畫
```

### CSS 變數

```css
:root {
  /* Duration tokens */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

---

## Easing 緩動函數

### 常用 Easing

```
Linear
────────────────────
勻速，機械感，通常避免使用

Ease-out
▓▓▓▓▒▒░░░░░░░░░░░░░░
快開始慢結束
推薦：進入動畫、回饋動畫

Ease-in
░░░░░░░░░░░░░░░▒▒▓▓▓▓
慢開始快結束
推薦：離開動畫、消失動畫

Ease-in-out
░░░▒▒▓▓▓▓▓▓▓▓▒▒░░░
兩端慢中間快
推薦：持續移動、轉場動畫
```

### Cubic Bezier 值

```css
:root {
  /* 標準 easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* 強調 easing */
  --ease-in-strong: cubic-bezier(0.7, 0, 1, 1);
  --ease-out-strong: cubic-bezier(0, 0, 0.1, 1);

  /* 彈性 easing */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);

  /* 材質設計 */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
}
```

### 選擇原則

```
元素進入畫面 → ease-out（減速進入）
元素離開畫面 → ease-in（加速離開）
位置移動 → ease-in-out（自然運動）
形狀/大小變化 → ease-out（舒適過渡）
Hover 效果 → ease-out（快速回應）
按鈕/彈性效果 → ease-bounce
```

---

## 常見動效模式

### 1. 進入/離開動畫

```css
/* Fade */
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  transition: opacity 200ms ease-out;
}
.fade-exit {
  opacity: 1;
}
.fade-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-in;
}

/* Slide Up */
.slide-up-enter {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease-out;
}

/* Scale */
.scale-enter {
  opacity: 0;
  transform: scale(0.95);
}
.scale-enter-active {
  opacity: 1;
  transform: scale(1);
  transition: all 200ms ease-out;
}
```

### 2. Modal/Dialog

```css
/* Backdrop */
.modal-backdrop {
  opacity: 0;
  transition: opacity 200ms ease-out;
}
.modal-backdrop.open {
  opacity: 1;
}

/* Modal Content */
.modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
  transition: all 200ms ease-out;
}
.modal-content.open {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 離開時更快 */
.modal-content.closing {
  transition: all 150ms ease-in;
}
```

### 3. Dropdown/Select

```css
.dropdown-menu {
  opacity: 0;
  transform: translateY(-8px);
  transform-origin: top center;
  transition: all 150ms ease-out;
  pointer-events: none;
}

.dropdown-menu.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

### 4. Toast/Notification

```css
/* 從右側滑入 */
.toast {
  transform: translateX(100%);
  transition: transform 300ms ease-out;
}
.toast.show {
  transform: translateX(0);
}
.toast.hide {
  transform: translateX(100%);
  transition: transform 200ms ease-in;
}

/* 從下方滑入（手機） */
.toast-mobile {
  transform: translateY(100%);
  transition: transform 300ms ease-out;
}
```

### 5. Accordion/Collapse

```css
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms ease-out;
}
.accordion-content.open {
  grid-template-rows: 1fr;
}
.accordion-content > div {
  overflow: hidden;
}
```

### 6. 列表動畫

```css
/* 交錯進入 */
.list-item {
  opacity: 0;
  transform: translateY(20px);
}

.list-item.show {
  animation: fadeSlideIn 300ms ease-out forwards;
}

/* 每個項目延遲 */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
/* ... */

@keyframes fadeSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 7. Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 50%,
    #e5e7eb 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 8. Spinner

```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 頁面轉場

### SPA 轉場

```css
/* 淡入淡出 */
.page-transition-fade {
  opacity: 0;
  transition: opacity 300ms ease-out;
}
.page-transition-fade.active {
  opacity: 1;
}

/* 滑動 */
.page-transition-slide-left {
  transform: translateX(100%);
  transition: transform 300ms ease-out;
}
.page-transition-slide-left.active {
  transform: translateX(0);
}

/* 縮放 */
.page-transition-scale {
  opacity: 0;
  transform: scale(0.95);
  transition: all 300ms ease-out;
}
.page-transition-scale.active {
  opacity: 1;
  transform: scale(1);
}
```

### View Transitions API

```css
/* 原生頁面轉場 */
::view-transition-old(root) {
  animation: fade-out 150ms ease-in;
}

::view-transition-new(root) {
  animation: fade-in 150ms ease-out;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

---

## 效能優化

### 高效能屬性

```
GPU 加速（推薦）：
✓ transform: translate(), scale(), rotate()
✓ opacity

中等效能：
△ background-color
△ color
△ box-shadow

低效能（觸發重排）：
✗ width, height
✗ margin, padding
✗ top, left, right, bottom
✗ font-size
```

### 最佳實踐

```css
/* 啟用 GPU 加速 */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* 強制 GPU 層 */
}

/* 動畫結束後移除 will-change */
.animated-element.done {
  will-change: auto;
}

/* 使用 transform 代替位置屬性 */
.bad { left: 100px; }        /* ✗ 觸發重排 */
.good { transform: translateX(100px); } /* ✓ GPU 加速 */

/* 避免同時動畫太多屬性 */
.bad { transition: all 200ms; }
.good { transition: transform 200ms, opacity 200ms; }
```

### 減少繪製

```css
/* 固定尺寸減少重繪 */
.modal {
  width: 500px;  /* 固定而非 auto */
  height: 400px;
}

/* 使用 contain 優化 */
.card {
  contain: layout style;
}

/* 避免昂貴的屬性 */
.avoid {
  box-shadow: 0 0 50px rgba(0,0,0,0.5);  /* 昂貴 */
  filter: blur(10px);                     /* 昂貴 */
}
```

---

## 無障礙考量

### prefers-reduced-motion

```css
/* 預設有動畫 */
.element {
  transition: transform 300ms ease-out;
}

/* 尊重使用者偏好 */
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
  }

  /* 或使用更短的動畫 */
  .element {
    transition: transform 100ms ease-out;
  }
}

/* 完全禁用所有動畫 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### JavaScript 檢測

```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // 使用簡化動畫或禁用
}

// 監聽變化
window.matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', (e) => {
    if (e.matches) {
      // 禁用動畫
    } else {
      // 啟用動畫
    }
  });
```

### 其他考量

```
✓ 動畫可停止/暫停
✓ 不使用閃爍 (< 3 次/秒)
✓ 提供替代的狀態指示
✓ 不阻礙互動（動畫期間可操作）
✓ 載入動畫有超時處理
```

---

## 動效工具庫

### CSS 動畫庫

```
Animate.css
├── 即用型動畫類別
└── 簡單但缺乏客製化

CSS Animations
├── 原生 CSS
└── 效能最佳
```

### JavaScript 動畫庫

```
GSAP (GreenSock)
├── 功能最強大
├── 時間線控制
├── 複雜序列動畫
└── 商業授權注意

Framer Motion (React)
├── 聲明式 API
├── 手勢支援
└── React 專用

Motion One
├── 輕量
├── Web Animations API
└── 現代瀏覽器
```

### Lottie 動畫

```
用途：複雜向量動畫
來源：After Effects 匯出
優點：高品質、可縮放
缺點：檔案較大

適合：
├── Logo 動畫
├── 插圖動畫
├── 空狀態動畫
└── 載入動畫
```

---

## Quick Reference

| 動效類型 | Duration | Easing |
|----------|----------|--------|
| Hover | 150ms | ease-out |
| 按鈕點擊 | 100ms | ease-out |
| Toggle 開關 | 200ms | ease-out |
| Modal 開啟 | 200-250ms | ease-out |
| Modal 關閉 | 150-200ms | ease-in |
| Dropdown | 150ms | ease-out |
| Toast 進入 | 300ms | ease-out |
| Toast 離開 | 200ms | ease-in |
| 頁面轉場 | 300-400ms | ease-in-out |
| 列表交錯 | 300ms + 50ms 延遲 | ease-out |
| Skeleton | 1500ms | ease-in-out |
| Spinner | 600ms | linear |

---

## Checklist

### 設計
- [ ] 動效有明確目的
- [ ] 時間在建議範圍
- [ ] Easing 選擇正確
- [ ] 進入/離開配對

### 效能
- [ ] 使用 transform/opacity
- [ ] 避免觸發重排屬性
- [ ] 適當使用 will-change
- [ ] 測試低階裝置

### 無障礙
- [ ] 支援 prefers-reduced-motion
- [ ] 無過度閃爍
- [ ] 動畫可停止
- [ ] 不阻礙互動

### 一致性
- [ ] 相同動效行為一致
- [ ] 使用統一的 token
- [ ] 品牌調性符合
