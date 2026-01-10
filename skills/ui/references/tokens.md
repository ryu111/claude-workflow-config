# Design Tokens

完整的設計 token 系統，包含三層架構、語意化命名、以及與 CSS/Tailwind 的整合。

---

## Token 三層架構

```
┌─────────────────────────────────────────────────┐
│  Layer 3: Component Tokens                       │
│  按鈕背景、卡片邊框、輸入框文字...               │
├─────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens                        │
│  primary、surface、text-muted、border...         │
├─────────────────────────────────────────────────┤
│  Layer 1: Primitive Tokens                       │
│  blue-500、gray-100、space-4、font-md...         │
└─────────────────────────────────────────────────┘

    Primitive → Semantic → Component
    (原始值)    (語意化)   (元件專用)
```

### 為什麼需要三層架構

```
1. 可維護性
   修改 --primitive-blue-600 → 所有使用的地方更新

2. 可擴展性
   新增元件時，引用語意 token，不用記原始值

3. 主題切換
   只需覆蓋 semantic/component 層，primitive 保持不變

4. 清晰的職責
   Primitive: 是什麼值
   Semantic: 用在哪裡
   Component: 具體元件
```

---

## Layer 1: Primitive Tokens

### 色彩原始值

```css
:root {
  /* Blue Scale */
  --primitive-blue-50: #eff6ff;
  --primitive-blue-100: #dbeafe;
  --primitive-blue-200: #bfdbfe;
  --primitive-blue-300: #93c5fd;
  --primitive-blue-400: #60a5fa;
  --primitive-blue-500: #3b82f6;
  --primitive-blue-600: #2563eb;
  --primitive-blue-700: #1d4ed8;
  --primitive-blue-800: #1e40af;
  --primitive-blue-900: #1e3a8a;
  --primitive-blue-950: #172554;

  /* Gray Scale */
  --primitive-gray-50: #f9fafb;
  --primitive-gray-100: #f3f4f6;
  --primitive-gray-200: #e5e7eb;
  --primitive-gray-300: #d1d5db;
  --primitive-gray-400: #9ca3af;
  --primitive-gray-500: #6b7280;
  --primitive-gray-600: #4b5563;
  --primitive-gray-700: #374151;
  --primitive-gray-800: #1f2937;
  --primitive-gray-900: #111827;
  --primitive-gray-950: #030712;

  /* Red Scale (Error) */
  --primitive-red-50: #fef2f2;
  --primitive-red-100: #fee2e2;
  --primitive-red-500: #ef4444;
  --primitive-red-600: #dc2626;
  --primitive-red-700: #b91c1c;

  /* Green Scale (Success) */
  --primitive-green-50: #f0fdf4;
  --primitive-green-100: #dcfce7;
  --primitive-green-500: #22c55e;
  --primitive-green-600: #16a34a;
  --primitive-green-700: #15803d;

  /* Yellow Scale (Warning) */
  --primitive-yellow-50: #fefce8;
  --primitive-yellow-100: #fef9c3;
  --primitive-yellow-500: #eab308;
  --primitive-yellow-600: #ca8a04;
  --primitive-yellow-700: #a16207;
}
```

### 間距原始值

```css
:root {
  /* 基於 4px 的間距系統 */
  --primitive-space-0: 0;
  --primitive-space-px: 1px;
  --primitive-space-0-5: 0.125rem;  /* 2px */
  --primitive-space-1: 0.25rem;     /* 4px */
  --primitive-space-1-5: 0.375rem;  /* 6px */
  --primitive-space-2: 0.5rem;      /* 8px */
  --primitive-space-2-5: 0.625rem;  /* 10px */
  --primitive-space-3: 0.75rem;     /* 12px */
  --primitive-space-3-5: 0.875rem;  /* 14px */
  --primitive-space-4: 1rem;        /* 16px */
  --primitive-space-5: 1.25rem;     /* 20px */
  --primitive-space-6: 1.5rem;      /* 24px */
  --primitive-space-8: 2rem;        /* 32px */
  --primitive-space-10: 2.5rem;     /* 40px */
  --primitive-space-12: 3rem;       /* 48px */
  --primitive-space-16: 4rem;       /* 64px */
  --primitive-space-20: 5rem;       /* 80px */
  --primitive-space-24: 6rem;       /* 96px */
}
```

### 字體原始值

```css
:root {
  /* 字體家族 */
  --primitive-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --primitive-font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* 字體大小 */
  --primitive-text-xs: 0.75rem;    /* 12px */
  --primitive-text-sm: 0.875rem;   /* 14px */
  --primitive-text-base: 1rem;     /* 16px */
  --primitive-text-lg: 1.125rem;   /* 18px */
  --primitive-text-xl: 1.25rem;    /* 20px */
  --primitive-text-2xl: 1.5rem;    /* 24px */
  --primitive-text-3xl: 1.875rem;  /* 30px */
  --primitive-text-4xl: 2.25rem;   /* 36px */
  --primitive-text-5xl: 3rem;      /* 48px */

  /* 行高 */
  --primitive-leading-none: 1;
  --primitive-leading-tight: 1.25;
  --primitive-leading-snug: 1.375;
  --primitive-leading-normal: 1.5;
  --primitive-leading-relaxed: 1.625;
  --primitive-leading-loose: 2;

  /* 字重 */
  --primitive-font-normal: 400;
  --primitive-font-medium: 500;
  --primitive-font-semibold: 600;
  --primitive-font-bold: 700;

  /* 圓角 */
  --primitive-radius-none: 0;
  --primitive-radius-sm: 0.125rem;  /* 2px */
  --primitive-radius-default: 0.25rem; /* 4px */
  --primitive-radius-md: 0.375rem;  /* 6px */
  --primitive-radius-lg: 0.5rem;    /* 8px */
  --primitive-radius-xl: 0.75rem;   /* 12px */
  --primitive-radius-2xl: 1rem;     /* 16px */
  --primitive-radius-full: 9999px;
}
```

---

## Layer 2: Semantic Tokens

### 語意化色彩

```css
:root {
  /* 品牌色 */
  --color-primary: var(--primitive-blue-600);
  --color-primary-hover: var(--primitive-blue-700);
  --color-primary-active: var(--primitive-blue-800);
  --color-primary-light: var(--primitive-blue-50);
  --color-primary-muted: var(--primitive-blue-100);

  /* 表面 (背景) */
  --color-surface: #ffffff;
  --color-surface-raised: var(--primitive-gray-50);
  --color-surface-sunken: var(--primitive-gray-100);
  --color-surface-overlay: rgba(0, 0, 0, 0.5);

  /* 文字 */
  --color-text: var(--primitive-gray-900);
  --color-text-secondary: var(--primitive-gray-600);
  --color-text-muted: var(--primitive-gray-500);
  --color-text-placeholder: var(--primitive-gray-400);
  --color-text-on-primary: #ffffff;
  --color-text-inverse: #ffffff;

  /* 邊框 */
  --color-border: var(--primitive-gray-200);
  --color-border-strong: var(--primitive-gray-300);
  --color-border-muted: var(--primitive-gray-100);
  --color-border-focus: var(--primitive-blue-500);

  /* 功能色 */
  --color-success: var(--primitive-green-500);
  --color-success-light: var(--primitive-green-50);
  --color-success-dark: var(--primitive-green-700);

  --color-warning: var(--primitive-yellow-500);
  --color-warning-light: var(--primitive-yellow-50);
  --color-warning-dark: var(--primitive-yellow-700);

  --color-error: var(--primitive-red-500);
  --color-error-light: var(--primitive-red-50);
  --color-error-dark: var(--primitive-red-700);

  --color-info: var(--primitive-blue-500);
  --color-info-light: var(--primitive-blue-50);
  --color-info-dark: var(--primitive-blue-700);
}
```

### 語意化間距

```css
:root {
  /* 內容間距 */
  --spacing-xs: var(--primitive-space-1);   /* 4px - 緊湊 */
  --spacing-sm: var(--primitive-space-2);   /* 8px - 小 */
  --spacing-md: var(--primitive-space-4);   /* 16px - 中 */
  --spacing-lg: var(--primitive-space-6);   /* 24px - 大 */
  --spacing-xl: var(--primitive-space-8);   /* 32px - 特大 */
  --spacing-2xl: var(--primitive-space-12); /* 48px - 區塊 */

  /* 元件內部間距 */
  --padding-button: var(--primitive-space-2) var(--primitive-space-4);
  --padding-input: var(--primitive-space-2) var(--primitive-space-3);
  --padding-card: var(--primitive-space-6);
  --padding-section: var(--primitive-space-8);

  /* 元件間間距 */
  --gap-inline: var(--primitive-space-2);   /* 水平間距 */
  --gap-block: var(--primitive-space-4);    /* 垂直間距 */
  --gap-section: var(--primitive-space-12); /* 區塊間距 */
}
```

### 語意化字體

```css
:root {
  /* 標題 */
  --font-heading-1: var(--primitive-font-bold) var(--primitive-text-4xl)/var(--primitive-leading-tight) var(--primitive-font-sans);
  --font-heading-2: var(--primitive-font-semibold) var(--primitive-text-3xl)/var(--primitive-leading-tight) var(--primitive-font-sans);
  --font-heading-3: var(--primitive-font-semibold) var(--primitive-text-2xl)/var(--primitive-leading-snug) var(--primitive-font-sans);
  --font-heading-4: var(--primitive-font-semibold) var(--primitive-text-xl)/var(--primitive-leading-snug) var(--primitive-font-sans);

  /* 內文 */
  --font-body-lg: var(--primitive-font-normal) var(--primitive-text-lg)/var(--primitive-leading-relaxed) var(--primitive-font-sans);
  --font-body: var(--primitive-font-normal) var(--primitive-text-base)/var(--primitive-leading-normal) var(--primitive-font-sans);
  --font-body-sm: var(--primitive-font-normal) var(--primitive-text-sm)/var(--primitive-leading-normal) var(--primitive-font-sans);

  /* 輔助文字 */
  --font-caption: var(--primitive-font-normal) var(--primitive-text-xs)/var(--primitive-leading-normal) var(--primitive-font-sans);
  --font-label: var(--primitive-font-medium) var(--primitive-text-sm)/var(--primitive-leading-normal) var(--primitive-font-sans);
  --font-code: var(--primitive-font-normal) var(--primitive-text-sm)/var(--primitive-leading-normal) var(--primitive-font-mono);
}
```

---

## Layer 3: Component Tokens

### 按鈕 Token

```css
:root {
  /* Primary Button */
  --button-primary-bg: var(--color-primary);
  --button-primary-bg-hover: var(--color-primary-hover);
  --button-primary-bg-active: var(--color-primary-active);
  --button-primary-text: var(--color-text-on-primary);
  --button-primary-border: transparent;

  /* Secondary Button */
  --button-secondary-bg: transparent;
  --button-secondary-bg-hover: var(--color-surface-raised);
  --button-secondary-text: var(--color-text);
  --button-secondary-border: var(--color-border);

  /* Ghost Button */
  --button-ghost-bg: transparent;
  --button-ghost-bg-hover: var(--color-surface-raised);
  --button-ghost-text: var(--color-text);

  /* 共用 */
  --button-radius: var(--primitive-radius-md);
  --button-padding: var(--primitive-space-2) var(--primitive-space-4);
  --button-font: var(--font-label);
  --button-min-height: 40px;
  --button-focus-ring: 0 0 0 3px var(--primitive-blue-200);
}
```

### 輸入框 Token

```css
:root {
  --input-bg: var(--color-surface);
  --input-bg-hover: var(--color-surface);
  --input-bg-disabled: var(--color-surface-sunken);
  --input-border: var(--color-border);
  --input-border-hover: var(--color-border-strong);
  --input-border-focus: var(--color-border-focus);
  --input-border-error: var(--color-error);
  --input-text: var(--color-text);
  --input-placeholder: var(--color-text-placeholder);
  --input-radius: var(--primitive-radius-md);
  --input-padding: var(--primitive-space-2) var(--primitive-space-3);
  --input-min-height: 40px;
  --input-focus-ring: 0 0 0 3px var(--primitive-blue-200);
}
```

### 卡片 Token

```css
:root {
  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --card-radius: var(--primitive-radius-lg);
  --card-padding: var(--primitive-space-6);
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --card-shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Modal Token

```css
:root {
  --modal-bg: var(--color-surface);
  --modal-backdrop: var(--color-surface-overlay);
  --modal-radius: var(--primitive-radius-xl);
  --modal-padding: var(--primitive-space-6);
  --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --modal-max-width: 500px;
}
```

---

## Dark Mode 覆蓋

```css
[data-theme="dark"] {
  /* 表面 */
  --color-surface: #121212;
  --color-surface-raised: #1e1e1e;
  --color-surface-sunken: #0a0a0a;

  /* 文字 */
  --color-text: var(--primitive-gray-100);
  --color-text-secondary: var(--primitive-gray-400);
  --color-text-muted: var(--primitive-gray-500);
  --color-text-placeholder: var(--primitive-gray-600);

  /* 邊框 */
  --color-border: #2d2d2d;
  --color-border-strong: #404040;
  --color-border-muted: #1f1f1f;

  /* 調整功能色亮度 */
  --color-success: var(--primitive-green-400);
  --color-warning: var(--primitive-yellow-400);
  --color-error: var(--primitive-red-400);
  --color-info: var(--primitive-blue-400);

  /* 元件覆蓋 */
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --button-focus-ring: 0 0 0 3px var(--primitive-blue-900);
  --input-focus-ring: 0 0 0 3px var(--primitive-blue-900);
}
```

---

## 動畫 Token

```css
:root {
  /* Duration */
  --duration-instant: 50ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* 常用組合 */
  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-normal: var(--duration-normal) var(--ease-out);
  --transition-slow: var(--duration-slow) var(--ease-in-out);
}
```

---

## Z-Index 層級

```css
:root {
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-toast: 70;
  --z-tooltip: 80;
  --z-max: 9999;
}
```

---

## 響應式斷點

```css
:root {
  --breakpoint-sm: 640px;   /* 手機橫向 */
  --breakpoint-md: 768px;   /* 平板 */
  --breakpoint-lg: 1024px;  /* 小桌面 */
  --breakpoint-xl: 1280px;  /* 大桌面 */
  --breakpoint-2xl: 1536px; /* 超大螢幕 */
}

/* Media Queries (Mobile First) */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 命名規範

### 格式

```
--{layer}-{category}-{property}-{variant}

Layer: primitive | color | spacing | (component name)
Category: primary | surface | text | border | button | input
Property: bg | text | border | radius | padding
Variant: hover | active | focus | disabled | light | dark
```

### 範例

```css
/* Primitive */
--primitive-blue-500
--primitive-space-4

/* Semantic */
--color-primary
--color-text-secondary
--spacing-md

/* Component */
--button-primary-bg-hover
--input-border-focus
--card-shadow
```

---

## Tailwind CSS 整合

### tailwind.config.js

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          sunken: 'var(--color-surface-sunken)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      spacing: {
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
      },
      borderRadius: {
        'sm': 'var(--primitive-radius-sm)',
        'md': 'var(--primitive-radius-md)',
        'lg': 'var(--primitive-radius-lg)',
        'xl': 'var(--primitive-radius-xl)',
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
      },
    },
  },
};
```

### 使用範例

```html
<!-- 使用 Tailwind + CSS Variables -->
<button class="bg-primary text-white hover:bg-primary-hover rounded-md px-md py-sm">
  Button
</button>

<div class="bg-surface-raised border-border rounded-lg p-lg shadow-card">
  Card content
</div>
```

---

## CSS Variables 最佳實踐

### 1. 使用 CSS 自訂屬性

```css
/* 定義在 :root */
:root {
  --color-primary: #2563eb;
}

/* 使用時 */
.button {
  background: var(--color-primary);
}
```

### 2. 提供 Fallback

```css
.button {
  background: var(--color-primary, #2563eb);
}
```

### 3. 動態計算

```css
:root {
  --space-unit: 4px;
}

.element {
  padding: calc(var(--space-unit) * 4); /* 16px */
  margin: calc(var(--space-unit) * 2); /* 8px */
}
```

### 4. 主題切換

```javascript
// JavaScript 切換主題
document.documentElement.setAttribute('data-theme', 'dark');

// 或使用 CSS 系統偏好
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #121212;
  }
}
```

---

## Checklist

### Token 定義
- [ ] Primitive tokens 完整定義
- [ ] Semantic tokens 正確引用 primitive
- [ ] Component tokens 正確引用 semantic
- [ ] 命名遵循一致規範

### 主題支援
- [ ] Light mode 完整定義
- [ ] Dark mode 完整覆蓋
- [ ] 系統偏好支援 (prefers-color-scheme)
- [ ] 切換機制正常運作

### 整合
- [ ] CSS Variables 正確匯出
- [ ] Tailwind config 正確對應
- [ ] 元件正確使用 token
- [ ] 避免 hardcode 數值

### 維護
- [ ] Token 變更同步更新
- [ ] 文件保持最新
- [ ] 版本控制
