# 深色模式設計

創造舒適、一致且無障礙的深色模式體驗。

---

## 深色模式原則

### 核心原則

```
1. 不只是反轉顏色
   深色背景 ≠ 簡單的 invert()

2. 保持層級關係
   前景/背景的相對關係一致

3. 降低對比度
   純白文字太刺眼，使用灰白色

4. 調整飽和度
   高飽和度在深色背景上需要降低

5. 重新設計陰影
   深色背景上陰影幾乎不可見
```

### 為什麼要深色模式

```
✓ 減少眼睛疲勞（低光環境）
✓ 節省電量（OLED 螢幕）
✓ 使用者偏好（系統級設定）
✓ 無障礙需求（光敏感使用者）
✓ 視覺美感（某些品牌調性）
```

---

## 色彩映射策略

### 表面層級系統

```
淺色模式：                    深色模式：
┌─────────────────────┐      ┌─────────────────────┐
│ Surface 0 (#ffffff) │      │ Surface 0 (#121212) │ ← 最深
├─────────────────────┤      ├─────────────────────┤
│ Surface 1 (#f8f9fa) │      │ Surface 1 (#1e1e1e) │
├─────────────────────┤      ├─────────────────────┤
│ Surface 2 (#e9ecef) │      │ Surface 2 (#2d2d2d) │
├─────────────────────┤      ├─────────────────────┤
│ Surface 3 (#dee2e6) │      │ Surface 3 (#3d3d3d) │ ← 最淺
└─────────────────────┘      └─────────────────────┘

注意：深色模式中「較高」的表面更亮
```

### CSS 變數實作

```css
:root {
  /* 淺色模式（預設） */
  --color-bg-base: #ffffff;
  --color-bg-subtle: #f8f9fa;
  --color-bg-muted: #e9ecef;

  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-muted: #9ca3af;

  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
}

[data-theme="dark"] {
  /* 深色模式 */
  --color-bg-base: #0f0f0f;
  --color-bg-subtle: #1a1a1a;
  --color-bg-muted: #262626;

  --color-text-primary: #f3f4f6;
  --color-text-secondary: #d1d5db;
  --color-text-muted: #9ca3af;

  --color-border: #2d2d2d;
  --color-border-strong: #404040;
}
```

### 語意化 Token

```css
:root {
  /* 使用語意化命名 */
  --surface-background: var(--color-bg-base);
  --surface-card: var(--color-bg-subtle);
  --surface-elevated: var(--color-bg-muted);

  --text-on-surface: var(--color-text-primary);
  --text-muted-on-surface: var(--color-text-secondary);

  --border-default: var(--color-border);
}
```

---

## 對比度調整

### 文字對比度

```
淺色模式：
背景 #ffffff + 文字 #111827 = 17.6:1 ✓

深色模式：
背景 #121212 + 文字 #ffffff = 18.3:1 (太高！)
背景 #121212 + 文字 #e5e7eb = 12.4:1 (適中) ✓
背景 #121212 + 文字 #d1d5db = 10.5:1 (舒適) ✓

建議：深色背景使用 #e5e7eb ~ #f3f4f6
避免純白 #ffffff（太刺眼）
```

### 品牌色調整

```css
:root {
  /* 淺色模式品牌色 */
  --color-primary: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

[data-theme="dark"] {
  /* 深色模式品牌色（提高亮度、降低飽和度） */
  --color-primary: #60a5fa;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}
```

### 飽和度調整原則

```
深色背景上的飽和色會更鮮豔
→ 需要降低飽和度或提高亮度

方法 1：使用更淺的色調（400 代替 600）
方法 2：降低飽和度 10-20%
方法 3：使用 OKLCH 調整 lightness
```

---

## 陰影與高度

### 深色模式陰影

```css
:root {
  /* 淺色模式：標準陰影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  /* 深色模式：更深的陰影或使用亮度替代 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

### 使用亮度表達高度

```
深色模式的替代方案：
使用較亮的背景色表示「懸浮」

┌─────────────────────────┐
│ Modal (#2d2d2d)         │ ← 較亮 = 較高
│                         │
│  ┌───────────────────┐  │
│  │ Card (#252525)    │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
│ Background (#121212)    │ ← 較暗 = 較低
```

### Material Design 高度系統

```
高度 dp    淺色模式    深色模式
0dp       #ffffff    #121212
1dp       shadow     #1d1d1d
2dp       shadow     #222222
3dp       shadow     #252525
4dp       shadow     #272727
6dp       shadow     #2c2c2c
8dp       shadow     #2d2d2d
12dp      shadow     #323232
16dp      shadow     #353535
24dp      shadow     #373737
```

---

## 圖片與圖標處理

### 圖片處理

```css
/* 方法 1：降低亮度 */
[data-theme="dark"] img:not([data-no-filter]) {
  filter: brightness(0.9);
}

/* 方法 2：圖片容器加深色邊框 */
[data-theme="dark"] .image-container {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

/* 方法 3：提供深色版圖片 */
<picture>
  <source srcset="hero-dark.jpg" media="(prefers-color-scheme: dark)">
  <img src="hero-light.jpg" alt="Hero">
</picture>
```

### 圖標處理

```css
/* SVG 圖標使用 currentColor */
.icon {
  color: var(--color-text-primary);
}

/* 或使用 CSS 變數 */
.icon {
  fill: var(--icon-color);
}

:root {
  --icon-color: #374151;
}

[data-theme="dark"] {
  --icon-color: #d1d5db;
}
```

### Logo 處理

```html
<!-- 提供兩個版本 -->
<img
  src="logo-light.svg"
  alt="Logo"
  class="logo-light"
/>
<img
  src="logo-dark.svg"
  alt="Logo"
  class="logo-dark"
/>
```

```css
.logo-dark { display: none; }

[data-theme="dark"] {
  .logo-light { display: none; }
  .logo-dark { display: block; }
}
```

---

## 系統偏好偵測

### CSS Media Query

```css
/* 自動跟隨系統設定 */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #121212;
    --color-text-primary: #f3f4f6;
    /* ... */
  }
}
```

### JavaScript 偵測

```javascript
// 檢查系統偏好
const prefersDark = window.matchMedia(
  '(prefers-color-scheme: dark)'
).matches;

// 監聽變化
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  });
```

### 三態切換

```javascript
// 支援：跟隨系統 / 淺色 / 深色
const THEMES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
};

function setTheme(theme) {
  if (theme === THEMES.SYSTEM) {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem('theme', theme);
}

// 初始化
const savedTheme = localStorage.getItem('theme') || THEMES.SYSTEM;
setTheme(savedTheme);
```

---

## 切換實作

### 無閃爍載入

```html
<!-- 在 <head> 中同步執行，避免閃爍 -->
<script>
  (function() {
    const saved = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (saved === 'dark' || (!saved && systemDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
</script>
```

### 切換動畫

```css
/* 平滑過渡 */
:root {
  transition: background-color 200ms ease-out, color 200ms ease-out;
}

/* 或使用 View Transitions API */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 200ms;
}
```

### React 實作範例

```tsx
const ThemeContext = createContext<{
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}>({ theme: 'system', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as typeof theme;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## 常見問題

### 表單元件

```css
/* 原生表單元件需要額外處理 */
[data-theme="dark"] {
  color-scheme: dark;
}

/* 或個別處理 */
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
```

### 滾動條

```css
[data-theme="dark"] {
  scrollbar-color: var(--color-bg-muted) var(--color-bg-base);
}

/* Webkit 瀏覽器 */
[data-theme="dark"]::-webkit-scrollbar {
  width: 8px;
}
[data-theme="dark"]::-webkit-scrollbar-track {
  background: var(--color-bg-base);
}
[data-theme="dark"]::-webkit-scrollbar-thumb {
  background: var(--color-bg-muted);
  border-radius: 4px;
}
```

### 程式碼區塊

```css
/* 使用對應的語法高亮主題 */
[data-theme="dark"] pre,
[data-theme="dark"] code {
  background: var(--color-bg-subtle);
}

/* 或使用專用的程式碼主題 */
[data-theme="dark"] .hljs {
  /* 載入深色語法高亮 CSS */
}
```

### 嵌入內容

```css
/* iframe 等嵌入內容無法控制 */
[data-theme="dark"] iframe {
  /* 可以加邊框區隔 */
  border: 1px solid var(--color-border);
  border-radius: 8px;
}
```

---

## 測試清單

### 功能測試

```
□ 手動切換正常運作
□ 系統偏好偵測正常
□ 偏好設定持久化
□ 頁面重載無閃爍
□ 跨頁面狀態一致
```

### 視覺測試

```
□ 所有文字可讀
□ 對比度符合 WCAG
□ 品牌色調適當
□ 圖片圖標正常
□ 陰影/高度表達清楚
□ 表單元件樣式一致
```

### 邊界情況

```
□ 空狀態頁面
□ 錯誤頁面
□ Modal/Dialog
□ Toast/Notification
□ 下拉選單
□ 日期選擇器
□ 第三方元件
```

---

## Checklist

### 色彩
- [ ] 使用語意化 token
- [ ] 調整對比度（降低刺眼感）
- [ ] 調整飽和度（品牌色）
- [ ] 文字不使用純白

### 層級
- [ ] 表面層級一致
- [ ] 陰影或亮度表達高度
- [ ] 邊框可見性

### 圖像
- [ ] 圖片亮度適當
- [ ] 圖標顏色正確
- [ ] Logo 有深色版本

### 實作
- [ ] 支援系統偏好
- [ ] 支援手動切換
- [ ] 設定持久化
- [ ] 無閃爍載入

### 測試
- [ ] WCAG 對比度測試
- [ ] 各種元件狀態
- [ ] 跨瀏覽器測試
- [ ] 低光環境測試
