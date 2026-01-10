# 設計系統架構

建立可擴展、可維護的設計系統基礎架構。

---

## 設計系統概述

### 什麼是設計系統

```
設計系統 = 設計語言 + 元件庫 + 文件 + 流程

┌─────────────────────────────────────────────────┐
│                  設計系統                        │
├─────────────┬─────────────┬─────────────────────┤
│  設計原則    │  視覺語言   │  元件庫             │
│  品牌指南    │  Design     │  Components         │
│  Voice &    │  Tokens     │  Patterns           │
│  Tone       │             │  Templates          │
├─────────────┴─────────────┴─────────────────────┤
│                  文件 & 工具                     │
│       Storybook | Figma | 使用指南               │
└─────────────────────────────────────────────────┘
```

### 設計系統的好處

```
✓ 一致性：跨產品、跨團隊的視覺和行為一致
✓ 效率：減少重複工作，加速開發
✓ 可擴展：新功能可快速搭建
✓ 品質：經過驗證的元件，減少錯誤
✓ 協作：設計與開發使用同一語言
```

---

## Token 三層架構

### 架構概覽

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

### Layer 1: Primitive Tokens

```css
/* 原始值 - 純粹的設計屬性 */
:root {
  /* 色彩原始值 */
  --primitive-blue-50: #eff6ff;
  --primitive-blue-100: #dbeafe;
  --primitive-blue-500: #3b82f6;
  --primitive-blue-600: #2563eb;
  --primitive-blue-700: #1d4ed8;

  --primitive-gray-50: #f9fafb;
  --primitive-gray-100: #f3f4f6;
  --primitive-gray-500: #6b7280;
  --primitive-gray-900: #111827;

  /* 間距原始值 */
  --primitive-space-1: 0.25rem;
  --primitive-space-2: 0.5rem;
  --primitive-space-4: 1rem;
  --primitive-space-6: 1.5rem;

  /* 字體原始值 */
  --primitive-font-sm: 0.875rem;
  --primitive-font-base: 1rem;
  --primitive-font-lg: 1.125rem;

  /* 圓角原始值 */
  --primitive-radius-sm: 0.25rem;
  --primitive-radius-md: 0.375rem;
  --primitive-radius-lg: 0.5rem;
}
```

### Layer 2: Semantic Tokens

```css
/* 語意化 - 有意義的命名 */
:root {
  /* 品牌色 */
  --color-primary: var(--primitive-blue-600);
  --color-primary-hover: var(--primitive-blue-700);
  --color-primary-light: var(--primitive-blue-50);

  /* 表面 */
  --color-surface: #ffffff;
  --color-surface-raised: var(--primitive-gray-50);
  --color-surface-sunken: var(--primitive-gray-100);

  /* 文字 */
  --color-text: var(--primitive-gray-900);
  --color-text-secondary: var(--primitive-gray-500);
  --color-text-on-primary: #ffffff;

  /* 邊框 */
  --color-border: var(--primitive-gray-200);
  --color-border-strong: var(--primitive-gray-300);

  /* 功能色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

/* 深色模式覆蓋 */
[data-theme="dark"] {
  --color-surface: #121212;
  --color-surface-raised: #1e1e1e;
  --color-text: var(--primitive-gray-100);
  --color-text-secondary: var(--primitive-gray-400);
  --color-border: #2d2d2d;
}
```

### Layer 3: Component Tokens

```css
/* 元件專用 - 具體應用 */
:root {
  /* Button */
  --button-bg: var(--color-primary);
  --button-bg-hover: var(--color-primary-hover);
  --button-text: var(--color-text-on-primary);
  --button-radius: var(--primitive-radius-md);
  --button-padding-x: var(--primitive-space-4);
  --button-padding-y: var(--primitive-space-2);

  /* Card */
  --card-bg: var(--color-surface);
  --card-border: var(--color-border);
  --card-radius: var(--primitive-radius-lg);
  --card-padding: var(--primitive-space-6);
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  /* Input */
  --input-bg: var(--color-surface);
  --input-border: var(--color-border);
  --input-border-focus: var(--color-primary);
  --input-text: var(--color-text);
  --input-placeholder: var(--color-text-secondary);
  --input-radius: var(--primitive-radius-md);
}
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

## Figma Variables 結構

### Collection 組織

```
Figma Variables:
├── Primitives (Collection)
│   ├── Color
│   │   ├── blue/50, blue/100, ..., blue/900
│   │   ├── gray/50, gray/100, ..., gray/900
│   │   └── ...
│   ├── Spacing
│   │   └── 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
│   ├── Typography
│   │   └── xs, sm, base, lg, xl, 2xl, 3xl
│   └── Radius
│       └── none, sm, md, lg, xl, full
│
├── Semantic (Collection)
│   ├── Color
│   │   ├── primary, primary-hover, primary-light
│   │   ├── surface, surface-raised, surface-sunken
│   │   ├── text, text-secondary, text-muted
│   │   └── border, border-strong
│   └── ...
│
└── Components (Collection)
    ├── Button
    │   └── bg, text, radius, padding-x, padding-y
    ├── Card
    │   └── bg, border, radius, padding
    └── Input
        └── bg, border, text, placeholder, radius
```

### Mode 支援

```
Semantic Collection:
├── Mode: Light
│   └── surface = #ffffff
│   └── text = gray/900
│
└── Mode: Dark
    └── surface = #121212
    └── text = gray/100

切換 Mode 即可切換整個主題
```

### 命名規範

```
推薦格式：
category/property/variant

範例：
color/primary/default
color/primary/hover
color/text/secondary
spacing/component/button-x
radius/component/card
```

---

## Design-to-Code 工作流程

### 流程概覽

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Figma   │───→│  Token   │───→│  Code    │
│ Variables│    │ Transform│    │ (CSS/JS) │
└──────────┘    └──────────┘    └──────────┘
       ↓               ↓               ↓
  設計師定義      自動轉換        開發者使用
```

### Token 匯出格式 (DTCG)

```json
{
  "color": {
    "primary": {
      "$value": "#2563eb",
      "$type": "color",
      "$description": "Primary brand color"
    },
    "primary-hover": {
      "$value": "#1d4ed8",
      "$type": "color"
    }
  },
  "spacing": {
    "4": {
      "$value": "1rem",
      "$type": "dimension"
    }
  }
}
```

### Style Dictionary 配置

```javascript
// style-dictionary.config.js
module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    },
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/scss/',
      files: [{
        destination: '_variables.scss',
        format: 'scss/variables'
      }]
    }
  }
};
```

### 產出範例

```css
/* dist/css/variables.css */
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --spacing-4: 1rem;
  /* ... */
}
```

```javascript
// dist/js/tokens.js
export const colorPrimary = '#2563eb';
export const colorPrimaryHover = '#1d4ed8';
export const spacing4 = '1rem';
```

---

## 多品牌支援

### 架構

```
tokens/
├── core/                    # 共用基礎
│   ├── primitives.json      # 原始值
│   └── semantic.json        # 語意化（預設）
│
├── brands/
│   ├── brand-a/
│   │   └── overrides.json   # Brand A 覆蓋
│   └── brand-b/
│       └── overrides.json   # Brand B 覆蓋
│
└── themes/
    ├── light.json           # 淺色主題
    └── dark.json            # 深色主題
```

### 覆蓋機制

```json
// core/semantic.json
{
  "color": {
    "primary": { "$value": "{color.blue.600}" }
  }
}

// brands/brand-a/overrides.json
{
  "color": {
    "primary": { "$value": "{color.green.600}" }
  }
}

// 合併後 Brand A 使用綠色作為主色
```

### 建置流程

```javascript
// 為每個品牌生成 CSS
const brands = ['brand-a', 'brand-b'];

brands.forEach(brand => {
  StyleDictionary.extend({
    source: [
      'tokens/core/**/*.json',
      `tokens/brands/${brand}/**/*.json`
    ],
    platforms: {
      css: {
        buildPath: `dist/${brand}/`,
        files: [{ destination: 'variables.css', format: 'css/variables' }]
      }
    }
  }).buildAllPlatforms();
});
```

---

## 元件庫架構

### 資料夾結構

```
components/
├── primitives/              # 基礎元件
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   └── ...
│
├── composed/                # 組合元件
│   ├── SearchInput/         # Input + Button
│   ├── FormField/           # Label + Input + Error
│   └── ...
│
├── patterns/                # 模式/範本
│   ├── LoginForm/
│   ├── DataTable/
│   └── ...
│
└── index.ts                 # 統一匯出
```

### 元件 API 設計原則

```typescript
// 一致的 Props 介面
interface ButtonProps {
  // 變體
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';

  // 狀態
  disabled?: boolean;
  loading?: boolean;

  // 事件
  onClick?: () => void;

  // 子元素
  children: React.ReactNode;

  // 擴展
  className?: string;
}
```

### Compound Components 模式

```tsx
// 複雜元件使用組合模式
<Card>
  <Card.Header>
    <Card.Title>標題</Card.Title>
    <Card.Description>描述</Card.Description>
  </Card.Header>
  <Card.Content>
    內容
  </Card.Content>
  <Card.Footer>
    <Button>確認</Button>
  </Card.Footer>
</Card>
```

---

## 版本控制與發布

### 語意化版本

```
MAJOR.MINOR.PATCH

MAJOR: 破壞性變更（需要遷移）
MINOR: 新增功能（向後相容）
PATCH: Bug 修復

範例：
1.0.0 → 1.1.0  新增 Tooltip 元件
1.1.0 → 1.1.1  修復 Button disabled 樣式
1.1.1 → 2.0.0  Button API 重構（破壞性）
```

### Changelog 維護

```markdown
# Changelog

## [2.0.0] - 2025-01-10

### Breaking Changes
- Button: 移除 `type` prop，改用 `variant`

### Added
- 新增 Tooltip 元件
- 新增 Toast 元件

### Fixed
- 修復 Input focus 樣式在 Safari 的問題

### Deprecated
- Card: `elevation` prop 將在 3.0 移除
```

### 發布流程

```
1. 開發分支完成功能
2. PR 審查
3. 合併到 main
4. CI/CD 自動：
   - 執行測試
   - 建置 tokens
   - 建置元件庫
   - 更新文件
   - 發布到 npm
   - 更新 Changelog
```

---

## 文件化

### 必要文件

```
docs/
├── getting-started.md       # 快速開始
├── design-principles.md     # 設計原則
├── tokens/
│   ├── color.md             # 色彩系統
│   ├── typography.md        # 字體系統
│   ├── spacing.md           # 間距系統
│   └── ...
├── components/
│   ├── button.md            # 元件文件
│   └── ...
├── patterns/
│   └── forms.md             # 模式指南
└── migration/
    └── v1-to-v2.md          # 遷移指南
```

### Storybook 整合

```tsx
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    }
  }
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Button'
  }
};

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: '8px' }}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
  </div>
);
```

---

## Checklist

### Token 架構
- [ ] 三層架構（Primitive → Semantic → Component）
- [ ] 語意化命名
- [ ] 支援深淺主題
- [ ] 匯出多種格式

### 元件庫
- [ ] 一致的 API 設計
- [ ] 完整的狀態處理
- [ ] 無障礙支援
- [ ] 響應式設計

### 工作流程
- [ ] Design-to-Code 自動化
- [ ] 版本控制策略
- [ ] CI/CD 流程
- [ ] 文件同步更新

### 維護
- [ ] Changelog 維護
- [ ] 遷移指南
- [ ] 團隊培訓
- [ ] 回饋收集機制
