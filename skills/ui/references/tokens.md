# Design Tokens

完整的設計 token 系統，包含色彩、字體、間距、圓角、陰影。

## 色彩系統

```css
:root {
  /* 主色 */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;

  /* 語意色彩 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;

  /* 背景與前景 */
  --color-background: #ffffff;
  --color-foreground: #111827;
}
```

### 色彩原則

| 規則 | 說明 |
|------|------|
| 主色 ≤ 3 種 | 避免視覺混亂 |
| 對比度 ≥ 4.5:1 | WCAG AA 標準 |
| 語意一致 | 紅=錯誤、綠=成功 |

### Dark Mode

```css
[data-theme="dark"] {
  --color-background: #111827;
  --color-foreground: #f9fafb;
  --color-gray-50: #1f2937;
  --color-gray-900: #f9fafb;
}
```

---

## 字體系統

```css
:root {
  /* 字體家族 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* 字體大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* 行高 */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* 字重 */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### 字體原則

| 規則 | 說明 |
|------|------|
| 內文 ≥ 16px | 確保可讀性 |
| 標題層級清晰 | h1 > h2 > h3 |
| 行高：內文 1.5 | 標題 1.25 |

---

## 間距系統

```css
:root {
  /* 基於 4px 的間距系統 */
  --space-0: 0;
  --space-px: 1px;
  --space-0.5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1.5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2.5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3.5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-11: 2.75rem;    /* 44px */
  --space-12: 3rem;       /* 48px */
  --space-14: 3.5rem;     /* 56px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
}
```

### 間距原則

| 規則 | 說明 |
|------|------|
| 使用 4px 倍數 | 保持一致性 |
| 相關元素近 | 群組化 |
| 留白是設計 | 不要填滿 |

---

## 圓角系統

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-default: 0.25rem; /* 4px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-3xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}
```

---

## 陰影系統

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --shadow-none: 0 0 #0000;
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
```

### Media Queries

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 動畫 Tokens

```css
:root {
  /* Duration */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  /* Easing */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Z-Index 層級

```css
:root {
  --z-0: 0;
  --z-10: 10;      /* 基本提升 */
  --z-20: 20;      /* Dropdown */
  --z-30: 30;      /* Sticky */
  --z-40: 40;      /* Fixed */
  --z-50: 50;      /* Modal backdrop */
  --z-60: 60;      /* Modal */
  --z-70: 70;      /* Popover */
  --z-80: 80;      /* Toast */
  --z-90: 90;      /* Tooltip */
  --z-auto: auto;
}
```
