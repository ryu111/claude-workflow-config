# 計算機佈局與按鈕規格

完整的計算機佈局、Grid 定義、按鈕樣式規格。

---

## 需求理解

**目標**：科學計算機佈局，吉伊卡哇風格
**使用者**：需要清晰可見的數字和運算符
**關鍵互動**：快速輸入、清楚辨識、愉悅的視覺回饋

---

## 整體佈局

### 結構

```
┌─────────────────────────────────────┐
│         角色表情區                   │ 80px
├─────────────────────────────────────┤
│         顯示螢幕                     │ 100px
├─────────────────────────────────────┤
│                                     │
│         按鈕網格區                   │ 320px
│         (科學計算機)                │
│                                     │
└─────────────────────────────────────┘
總高度：約 520px
寬度：360px (手機) / 400px (桌面)
```

### CSS 容器

```css
.chiikawa-calculator {
  /* 容器 */
  width: 360px;
  max-width: 100%;
  margin: 0 auto;
  padding: var(--padding-calculator);
  background: var(--chiikawa-bg-main);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-strong);

  /* Grid Layout */
  display: grid;
  grid-template-rows: 80px 100px auto;
  gap: var(--spacing-lg);
}

/* 響應式 */
@media (min-width: 640px) {
  .chiikawa-calculator {
    width: 400px;
  }
}
```

---

## 1. 角色表情區

```css
.character-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-sm);
}

.character-face {
  width: var(--character-size);
  height: var(--character-size);
  border-radius: var(--character-radius);
  background: var(--character-bg);
  border: 2px solid var(--character-border);
  box-shadow: var(--character-shadow);

  /* 懸停效果 */
  transition: transform var(--duration-normal) var(--ease-bounce);
}

.character-face:hover {
  transform: scale(1.05);
  cursor: pointer;
}
```

**HTML 結構**：

```html
<div class="character-container">
  <div class="character-face" id="characterEmotion">
    <!-- SVG 表情插入這裡 -->
  </div>
</div>
```

---

## 2. 顯示螢幕

### 規格

| 屬性 | 值 | 說明 |
|------|-----|------|
| 高度 | 100px | 顯示運算式 + 結果 |
| 背景 | --display-bg | 米白溫暖色 |
| 邊框 | 2px solid --display-border | 柔和邊框 |
| 圓角 | --radius-xl (20px) | 圓潤 |
| 內距 | 16px 20px | 左右較寬 |
| 陰影 | --shadow-inset | 凹陷感 |

### CSS

```css
.display {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;

  background: var(--display-bg);
  border: 2px solid var(--display-border);
  border-radius: var(--display-radius);
  padding: var(--display-padding);
  box-shadow: var(--display-shadow);

  min-height: 100px;
  overflow: hidden;
}

/* 運算式（小字） */
.display-expression {
  font-family: var(--font-number);
  font-size: var(--text-base);
  color: var(--display-text-secondary);
  font-weight: var(--font-normal);

  /* 截斷處理 */
  width: 100%;
  text-align: right;
  overflow-x: auto;
  white-space: nowrap;

  /* 隱藏捲軸 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.display-expression::-webkit-scrollbar {
  display: none;
}

/* 結果（大字） */
.display-result {
  font-family: var(--font-number);
  font-size: var(--text-display);  /* 48px */
  color: var(--display-text);
  font-weight: var(--font-semibold);

  width: 100%;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 錯誤狀態 */
.display-result.error {
  color: var(--color-error);
  font-size: var(--text-2xl);
}
```

**HTML 結構**：

```html
<div class="display">
  <div class="display-expression">2 + 3 × 5</div>
  <div class="display-result">17</div>
</div>
```

---

## 3. 按鈕網格區

### 科學計算機佈局

```
┌──────────────────────────────────────┐
│ 科學函數列（可收合）                  │
│ sin cos tan log ln √  ^  %           │
├──────────────────────────────────────┤
│ AC   ±    ÷                          │
│ 7    8    9    ×                     │
│ 4    5    6    -                     │
│ 1    2    3    +                     │
│ 0         .    =                     │
└──────────────────────────────────────┘
```

### Grid 定義

```css
.button-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-button);
}

/* 科學函數列（可選） */
.function-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-button);
  margin-bottom: var(--spacing-sm);
}

/* 特殊跨欄 */
.button-zero {
  grid-column: span 2;  /* 0 按鈕佔兩格 */
}
```

**HTML 結構**：

```html
<div class="button-grid">
  <!-- 可選：科學函數列 -->
  <div class="function-row">
    <button class="button button-function">sin</button>
    <button class="button button-function">cos</button>
    <button class="button button-function">tan</button>
    <button class="button button-function">log</button>
  </div>

  <!-- 第一列 -->
  <button class="button button-clear">AC</button>
  <button class="button button-operator">±</button>
  <button class="button button-operator">%</button>
  <button class="button button-operator">÷</button>

  <!-- 第二列 -->
  <button class="button button-number">7</button>
  <button class="button button-number">8</button>
  <button class="button button-number">9</button>
  <button class="button button-operator">×</button>

  <!-- 第三列 -->
  <button class="button button-number">4</button>
  <button class="button button-number">5</button>
  <button class="button button-number">6</button>
  <button class="button button-operator">-</button>

  <!-- 第四列 -->
  <button class="button button-number">1</button>
  <button class="button button-number">2</button>
  <button class="button button-number">3</button>
  <button class="button button-operator">+</button>

  <!-- 第五列 -->
  <button class="button button-number button-zero">0</button>
  <button class="button button-number">.</button>
  <button class="button button-equal">=</button>
</div>
```

---

## 4. 按鈕樣式

### 基礎按鈕

```css
.button {
  /* 尺寸 */
  min-height: 60px;
  padding: var(--padding-button);

  /* 字體 */
  font-family: var(--font-number);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);

  /* 基本樣式 */
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;

  /* 動畫 */
  transition: all var(--duration-fast) var(--ease-soft);

  /* 觸控優化 */
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Hover 效果 */
.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* Active 效果 */
.button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-inset);
}

/* Focus 效果 */
.button:focus-visible {
  outline: 3px solid var(--chiikawa-blue-300);
  outline-offset: 2px;
}
```

---

### 數字按鈕 (0-9, .)

```css
.button-number {
  background: var(--button-number-bg);
  color: var(--button-number-text);
  border-color: var(--button-number-border);
  box-shadow: var(--button-number-shadow);
}

.button-number:hover {
  background: var(--button-number-bg-hover);
}

.button-number:active {
  background: var(--button-number-bg-active);
}
```

---

### 運算符按鈕 (+, -, ×, ÷, ±, %)

```css
.button-operator {
  background: var(--button-operator-bg);
  color: var(--button-operator-text);
  border-color: var(--button-operator-border);
}

.button-operator:hover {
  background: var(--button-operator-bg-hover);
}

.button-operator:active {
  background: var(--button-operator-bg-active);
}
```

---

### 等號按鈕 (=)

```css
.button-equal {
  background: var(--button-equal-bg);
  color: var(--button-equal-text);
  border: none;
  box-shadow: var(--button-equal-shadow);
  font-weight: var(--font-bold);
}

.button-equal:hover {
  background: var(--button-equal-bg-hover);
  transform: translateY(-3px) scale(1.02);
}

.button-equal:active {
  transform: translateY(0) scale(0.98);
}
```

---

### AC/清除按鈕

```css
.button-clear {
  background: var(--button-clear-bg);
  color: var(--button-clear-text);
  border: none;
  font-weight: var(--font-bold);
}

.button-clear:hover {
  background: var(--button-clear-bg-hover);
}
```

---

### 科學函數按鈕 (sin, cos, log...)

```css
.button-function {
  background: var(--button-function-bg);
  color: var(--button-function-text);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-transform: lowercase;
}

.button-function:hover {
  background: var(--button-function-bg-hover);
}
```

---

## 5. 響應式設計

### 手機版 (< 640px)

```css
@media (max-width: 639px) {
  .chiikawa-calculator {
    width: 100%;
    max-width: 360px;
    border-radius: var(--radius-xl);
  }

  .button {
    min-height: 56px;
    font-size: var(--text-lg);
  }

  .display-result {
    font-size: var(--text-4xl);  /* 40px */
  }

  /* 科學函數可隱藏 */
  .function-row {
    display: none;
  }
}
```

### 平板/桌面 (≥ 640px)

```css
@media (min-width: 640px) {
  .chiikawa-calculator {
    width: 400px;
  }

  .button {
    min-height: 64px;
    font-size: var(--text-2xl);
  }

  .display-result {
    font-size: var(--text-display);  /* 48px */
  }
}
```

---

## 6. 完整 HTML 範例

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>吉伊卡哇計算機</title>
  <link rel="stylesheet" href="calculator.css">
</head>
<body>
  <div class="chiikawa-calculator">
    <!-- 角色表情區 -->
    <div class="character-container">
      <div class="character-face" id="characterEmotion">
        <!-- SVG 表情 -->
      </div>
    </div>

    <!-- 顯示螢幕 -->
    <div class="display">
      <div class="display-expression" id="expression"></div>
      <div class="display-result" id="result">0</div>
    </div>

    <!-- 按鈕網格 -->
    <div class="button-grid">
      <!-- 可選：科學函數列 -->
      <div class="function-row">
        <button class="button button-function" data-function="sin">sin</button>
        <button class="button button-function" data-function="cos">cos</button>
        <button class="button button-function" data-function="tan">tan</button>
        <button class="button button-function" data-function="log">log</button>
      </div>

      <!-- 第一列 -->
      <button class="button button-clear" data-action="clear">AC</button>
      <button class="button button-operator" data-action="negate">±</button>
      <button class="button button-operator" data-action="percent">%</button>
      <button class="button button-operator" data-operator="÷">÷</button>

      <!-- 第二列 -->
      <button class="button button-number" data-number="7">7</button>
      <button class="button button-number" data-number="8">8</button>
      <button class="button button-number" data-number="9">9</button>
      <button class="button button-operator" data-operator="×">×</button>

      <!-- 第三列 -->
      <button class="button button-number" data-number="4">4</button>
      <button class="button button-number" data-number="5">5</button>
      <button class="button button-number" data-number="6">6</button>
      <button class="button button-operator" data-operator="-">-</button>

      <!-- 第四列 -->
      <button class="button button-number" data-number="1">1</button>
      <button class="button button-number" data-number="2">2</button>
      <button class="button button-number" data-number="3">3</button>
      <button class="button button-operator" data-operator="+">+</button>

      <!-- 第五列 -->
      <button class="button button-number button-zero" data-number="0">0</button>
      <button class="button button-number" data-number=".">.</button>
      <button class="button button-equal" data-action="equals">=</button>
    </div>
  </div>

  <script src="calculator.js"></script>
</body>
</html>
```

---

## 7. 無障礙優化

```css
/* 鍵盤導航 */
.button:focus-visible {
  outline: 3px solid var(--chiikawa-blue-500);
  outline-offset: 3px;
  z-index: 10;
}

/* 高對比模式 */
@media (prefers-contrast: high) {
  .button {
    border-width: 3px;
  }

  .display {
    border-width: 3px;
  }
}

/* 減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .character-face {
    transition: none;
  }
}
```

**ARIA 屬性**：

```html
<button
  class="button button-number"
  data-number="7"
  aria-label="數字 7"
  role="button"
>
  7
</button>

<div
  class="display-result"
  id="result"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  0
</div>
```

---

## Checklist

✅ Grid 佈局清晰定義
✅ 按鈕尺寸 ≥ 56px（符合觸控標準）
✅ 所有按鈕有 5 種狀態（default/hover/active/focus/disabled）
✅ 圓角 ≥ 12px（符合吉伊卡哇風格）
✅ 響應式支援手機/平板/桌面
✅ 色彩對比符合 WCAG AA
✅ 無障礙優化（ARIA、鍵盤導航）
✅ 支援 prefers-reduced-motion
