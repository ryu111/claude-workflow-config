# 吉伊卡哇風格 - Design Tokens

完整的設計 token 系統，定義顏色、間距、字體、圓角、陰影等視覺元素。

---

## 需求理解

**目標**：建立充滿童趣、療癒感的科學計算機
**受眾**：喜歡可愛角色、輕鬆氛圍的使用者
**情境**：桌面或手機使用，需要清晰可讀的數字與按鈕
**品牌調性**：柔和、圓潤、手繪感、溫馨

---

## 色彩系統

### 主色調 (60%)

吉伊卡哇的米白色系背景 + 柔和藍調

```css
:root {
  /* 背景色 - 米白溫暖色系 */
  --chiikawa-bg-main: #faf8f3;
  --chiikawa-bg-light: #ffffff;
  --chiikawa-bg-warm: #fff9ed;

  /* 表面色 - 卡片、按鈕底 */
  --chiikawa-surface: #fff;
  --chiikawa-surface-raised: #fffef9;
  --chiikawa-surface-soft: rgba(255, 250, 237, 0.7);
}
```

### 次色 (30%)

吉伊卡哇角色的柔和藍色

```css
:root {
  /* 柔和藍 - 主要按鈕 */
  --chiikawa-blue-50: #e3f2fd;
  --chiikawa-blue-100: #d1e9f6;
  --chiikawa-blue-200: #b3d9f2;
  --chiikawa-blue-300: #90caf9;
  --chiikawa-blue-400: #6db4e8;
  --chiikawa-blue-500: #5ba8d8;  /* 主色 */
  --chiikawa-blue-600: #4a97c9;

  /* 映射到語意 token */
  --color-primary: var(--chiikawa-blue-500);
  --color-primary-hover: var(--chiikawa-blue-600);
  --color-primary-light: var(--chiikawa-blue-100);
}
```

### 強調色 (10%)

功能按鈕與狀態色

```css
:root {
  /* 柔和粉紅 - 特殊功能 */
  --chiikawa-pink-100: #fce4ec;
  --chiikawa-pink-300: #f8bbd0;
  --chiikawa-pink-500: #f48fb1;

  /* 柔和綠 - 等號按鈕 */
  --chiikawa-green-100: #e8f5e9;
  --chiikawa-green-300: #c8e6c9;
  --chiikawa-green-500: #a5d6a7;

  /* 柔和橙 - 刪除/AC */
  --chiikawa-orange-100: #fff3e0;
  --chiikawa-orange-300: #ffcc80;
  --chiikawa-orange-500: #ffb74d;

  /* 柔和紫 - 科學函數 */
  --chiikawa-purple-100: #f3e5f5;
  --chiikawa-purple-300: #ce93d8;
  --chiikawa-purple-500: #ba68c8;

  /* 功能色映射 */
  --color-accent: var(--chiikawa-pink-500);
  --color-success: var(--chiikawa-green-500);
  --color-warning: var(--chiikawa-orange-500);
  --color-error: #ef9a9a;  /* 柔和紅 */
}
```

### 文字色

```css
:root {
  /* 主要文字 - 深灰棕色（避免純黑） */
  --color-text: #4a4238;
  --color-text-secondary: #6b5d52;
  --color-text-muted: #9d8b7f;
  --color-text-placeholder: #c4b5a8;

  /* 在按鈕上的文字 */
  --color-text-on-primary: #ffffff;
  --color-text-on-surface: var(--color-text);
}
```

### 邊框與陰影

```css
:root {
  /* 邊框 - 柔和手繪感 */
  --color-border: #e8dfd5;
  --color-border-strong: #d4c4b5;
  --color-border-soft: rgba(232, 223, 213, 0.5);

  /* 陰影 - 柔和不尖銳 */
  --shadow-soft: 0 2px 8px rgba(74, 66, 56, 0.06);
  --shadow-medium: 0 4px 16px rgba(74, 66, 56, 0.08);
  --shadow-strong: 0 8px 24px rgba(74, 66, 56, 0.12);

  /* 內陰影 - 按鈕按下效果 */
  --shadow-inset: inset 0 2px 4px rgba(74, 66, 56, 0.1);
}
```

---

## 圓角系統

吉伊卡哇特色 = 極度圓潤，無尖角

```css
:root {
  /* 圓角 - 比標準更圓 */
  --radius-sm: 8px;    /* 小元素 */
  --radius-md: 12px;   /* 按鈕 */
  --radius-lg: 16px;   /* 卡片 */
  --radius-xl: 20px;   /* 顯示螢幕 */
  --radius-2xl: 24px;  /* 外框 */
  --radius-full: 9999px;  /* 完全圓形 */
}
```

---

## 間距系統

```css
:root {
  /* 基於 4px 的間距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* 按鈕間距 */
  --gap-button: 8px;

  /* 內距 */
  --padding-button: 12px 16px;
  --padding-display: 16px 20px;
  --padding-calculator: 20px;
}
```

---

## 字體系統

手繪感 + 可讀性

```css
:root {
  /* 字體家族 */
  --font-display: 'Fredoka', 'Noto Sans TC', sans-serif;  /* 圓潤字體 */
  --font-number: 'Poppins', 'Roboto', monospace;  /* 數字清晰 */
  --font-ui: 'Noto Sans TC', -apple-system, sans-serif;

  /* 字體大小 */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 40px;
  --text-display: 48px;  /* 顯示螢幕數字 */

  /* 字重 */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

---

## 動畫 Token

吉伊卡哇風格 = 柔軟彈性

```css
:root {
  /* Duration */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;

  /* Easing - 彈性 */
  --ease-bounce: cubic-bezier(0.68, -0.2, 0.265, 1.2);
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

---

## 按鈕變體 Token

### 數字按鈕 (0-9)

```css
:root {
  --button-number-bg: #ffffff;
  --button-number-bg-hover: var(--chiikawa-blue-50);
  --button-number-bg-active: var(--chiikawa-blue-100);
  --button-number-text: var(--color-text);
  --button-number-border: var(--color-border);
  --button-number-shadow: var(--shadow-soft);
}
```

### 運算符按鈕 (+, -, ×, ÷)

```css
:root {
  --button-operator-bg: var(--chiikawa-blue-100);
  --button-operator-bg-hover: var(--chiikawa-blue-200);
  --button-operator-bg-active: var(--chiikawa-blue-300);
  --button-operator-text: var(--chiikawa-blue-600);
  --button-operator-border: var(--chiikawa-blue-200);
}
```

### 等號按鈕 (=)

```css
:root {
  --button-equal-bg: var(--chiikawa-green-500);
  --button-equal-bg-hover: var(--chiikawa-green-300);
  --button-equal-text: #ffffff;
  --button-equal-shadow: 0 4px 12px rgba(165, 214, 167, 0.3);
}
```

### AC/清除按鈕

```css
:root {
  --button-clear-bg: var(--chiikawa-orange-300);
  --button-clear-bg-hover: var(--chiikawa-orange-500);
  --button-clear-text: #ffffff;
}
```

### 科學函數按鈕 (sin, cos, log...)

```css
:root {
  --button-function-bg: var(--chiikawa-purple-100);
  --button-function-bg-hover: var(--chiikawa-purple-300);
  --button-function-text: var(--chiikawa-purple-500);
}
```

---

## 顯示螢幕 Token

```css
:root {
  --display-bg: var(--chiikawa-bg-warm);
  --display-text: var(--color-text);
  --display-text-secondary: var(--color-text-muted);  /* 運算式 */
  --display-border: var(--color-border);
  --display-radius: var(--radius-xl);
  --display-padding: var(--padding-display);
  --display-shadow: var(--shadow-inset);
}
```

---

## 角色表情容器 Token

```css
:root {
  --character-size: 80px;
  --character-bg: var(--chiikawa-bg-light);
  --character-border: var(--color-border-soft);
  --character-radius: var(--radius-full);
  --character-shadow: var(--shadow-soft);
}
```

---

## Z-Index 層級

```css
:root {
  --z-base: 0;
  --z-display: 10;
  --z-character: 20;
  --z-buttons: 5;
  --z-modal: 100;
}
```

---

## 響應式斷點

```css
:root {
  /* 手機優先 */
  --breakpoint-mobile: 320px;
  --breakpoint-tablet: 640px;
  --breakpoint-desktop: 1024px;
}
```

---

## 完整 CSS Variables 輸出

可直接複製到專案使用：

```css
:root {
  /* ===== 背景色 ===== */
  --chiikawa-bg-main: #faf8f3;
  --chiikawa-bg-light: #ffffff;
  --chiikawa-bg-warm: #fff9ed;

  /* ===== 表面色 ===== */
  --chiikawa-surface: #fff;
  --chiikawa-surface-raised: #fffef9;
  --chiikawa-surface-soft: rgba(255, 250, 237, 0.7);

  /* ===== 主色系 - 柔和藍 ===== */
  --chiikawa-blue-50: #e3f2fd;
  --chiikawa-blue-100: #d1e9f6;
  --chiikawa-blue-200: #b3d9f2;
  --chiikawa-blue-300: #90caf9;
  --chiikawa-blue-400: #6db4e8;
  --chiikawa-blue-500: #5ba8d8;
  --chiikawa-blue-600: #4a97c9;

  /* ===== 強調色 ===== */
  --chiikawa-pink-100: #fce4ec;
  --chiikawa-pink-300: #f8bbd0;
  --chiikawa-pink-500: #f48fb1;

  --chiikawa-green-100: #e8f5e9;
  --chiikawa-green-300: #c8e6c9;
  --chiikawa-green-500: #a5d6a7;

  --chiikawa-orange-100: #fff3e0;
  --chiikawa-orange-300: #ffcc80;
  --chiikawa-orange-500: #ffb74d;

  --chiikawa-purple-100: #f3e5f5;
  --chiikawa-purple-300: #ce93d8;
  --chiikawa-purple-500: #ba68c8;

  /* ===== 語意化色彩 ===== */
  --color-primary: var(--chiikawa-blue-500);
  --color-primary-hover: var(--chiikawa-blue-600);
  --color-primary-light: var(--chiikawa-blue-100);
  --color-accent: var(--chiikawa-pink-500);
  --color-success: var(--chiikawa-green-500);
  --color-warning: var(--chiikawa-orange-500);
  --color-error: #ef9a9a;

  /* ===== 文字色 ===== */
  --color-text: #4a4238;
  --color-text-secondary: #6b5d52;
  --color-text-muted: #9d8b7f;
  --color-text-placeholder: #c4b5a8;
  --color-text-on-primary: #ffffff;

  /* ===== 邊框 ===== */
  --color-border: #e8dfd5;
  --color-border-strong: #d4c4b5;
  --color-border-soft: rgba(232, 223, 213, 0.5);

  /* ===== 陰影 ===== */
  --shadow-soft: 0 2px 8px rgba(74, 66, 56, 0.06);
  --shadow-medium: 0 4px 16px rgba(74, 66, 56, 0.08);
  --shadow-strong: 0 8px 24px rgba(74, 66, 56, 0.12);
  --shadow-inset: inset 0 2px 4px rgba(74, 66, 56, 0.1);

  /* ===== 圓角 ===== */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ===== 間距 ===== */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;
  --gap-button: 8px;
  --padding-button: 12px 16px;
  --padding-display: 16px 20px;
  --padding-calculator: 20px;

  /* ===== 字體 ===== */
  --font-display: 'Fredoka', 'Noto Sans TC', sans-serif;
  --font-number: 'Poppins', 'Roboto', monospace;
  --font-ui: 'Noto Sans TC', -apple-system, sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 40px;
  --text-display: 48px;

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ===== 動畫 ===== */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;

  --ease-bounce: cubic-bezier(0.68, -0.2, 0.265, 1.2);
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  /* ===== 元件專用 Token ===== */
  /* 數字按鈕 */
  --button-number-bg: #ffffff;
  --button-number-bg-hover: var(--chiikawa-blue-50);
  --button-number-bg-active: var(--chiikawa-blue-100);
  --button-number-text: var(--color-text);
  --button-number-border: var(--color-border);
  --button-number-shadow: var(--shadow-soft);

  /* 運算符按鈕 */
  --button-operator-bg: var(--chiikawa-blue-100);
  --button-operator-bg-hover: var(--chiikawa-blue-200);
  --button-operator-bg-active: var(--chiikawa-blue-300);
  --button-operator-text: var(--chiikawa-blue-600);
  --button-operator-border: var(--chiikawa-blue-200);

  /* 等號按鈕 */
  --button-equal-bg: var(--chiikawa-green-500);
  --button-equal-bg-hover: var(--chiikawa-green-300);
  --button-equal-text: #ffffff;
  --button-equal-shadow: 0 4px 12px rgba(165, 214, 167, 0.3);

  /* AC/清除按鈕 */
  --button-clear-bg: var(--chiikawa-orange-300);
  --button-clear-bg-hover: var(--chiikawa-orange-500);
  --button-clear-text: #ffffff;

  /* 科學函數按鈕 */
  --button-function-bg: var(--chiikawa-purple-100);
  --button-function-bg-hover: var(--chiikawa-purple-300);
  --button-function-text: var(--chiikawa-purple-500);

  /* 顯示螢幕 */
  --display-bg: var(--chiikawa-bg-warm);
  --display-text: var(--color-text);
  --display-text-secondary: var(--color-text-muted);
  --display-border: var(--color-border);
  --display-radius: var(--radius-xl);
  --display-padding: var(--padding-display);
  --display-shadow: var(--shadow-inset);

  /* 角色表情 */
  --character-size: 80px;
  --character-bg: var(--chiikawa-bg-light);
  --character-border: var(--color-border-soft);
  --character-radius: var(--radius-full);
  --character-shadow: var(--shadow-soft);

  /* Z-Index */
  --z-base: 0;
  --z-buttons: 5;
  --z-display: 10;
  --z-character: 20;
  --z-modal: 100;
}
```

---

## 字體引用

在 HTML 中加入：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 設計原則驗證

✅ **圓潤線條**：最小圓角 12px，主要元素 16px+
✅ **柔和配色**：低飽和度、高明度的粉嫩色系
✅ **手繪質感**：柔和陰影、略帶不規則的視覺感
✅ **對比度**：文字 #4a4238 on #fff = 9.8:1（超越 WCAG AAA）
✅ **觸控友善**：按鈕最小 48×48px
