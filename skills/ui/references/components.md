# Component Specifications

UI 元件的詳細規格與實作指南。

## 元件狀態系統

每個互動元件都需要定義以下狀態：

| 狀態 | 說明 | 視覺表現 |
|------|------|----------|
| Default | 預設狀態 | 基本樣式 |
| Hover | 滑鼠懸停 | 輕微變化（亮度、陰影） |
| Focus | 鍵盤聚焦 | 明顯的 focus ring |
| Active | 點擊中 | 按下效果 |
| Disabled | 禁用 | 降低透明度、禁用游標 |
| Loading | 載入中 | 載入指示器 |
| Error | 錯誤 | 紅色邊框/文字 |

---

## Button

### Variants

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
```

| Variant | 背景 | 文字 | 用途 |
|---------|------|------|------|
| primary | primary | white | 主要動作 |
| secondary | gray-100 | gray-900 | 次要動作 |
| outline | transparent | primary | 替代選項 |
| ghost | transparent | gray-600 | 低調動作 |
| destructive | red-500 | white | 危險操作 |

### Sizes

```tsx
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
  icon: 'h-10 w-10',
};
```

### States CSS

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 150ms ease;
}

.button:hover {
  filter: brightness(0.95);
}

.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:active {
  transform: scale(0.98);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## Input

### Specifications

| 屬性 | 值 |
|------|-----|
| 高度 | 40px (與按鈕一致) |
| 邊框 | 1px solid gray-300 |
| 圓角 | radius-md |
| 內距 | 0 12px |
| 字體 | text-base |

### States

```css
.input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 150ms ease;
}

.input:hover {
  border-color: var(--color-gray-400);
}

.input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input:disabled {
  background: var(--color-gray-100);
  cursor: not-allowed;
}

.input[aria-invalid="true"] {
  border-color: var(--color-error);
}
```

### Input with Label

```html
<div class="field">
  <label for="email">Email *</label>
  <input type="email" id="email" placeholder="you@example.com" />
  <span class="helper">We'll never share your email.</span>
</div>
```

---

## Select

```css
.select {
  height: 40px;
  padding: 0 36px 0 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  background: white url('chevron-down.svg') no-repeat right 12px center;
  appearance: none;
}
```

---

## Checkbox & Radio

```css
.checkbox,
.radio {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-gray-400);
  cursor: pointer;
}

.checkbox {
  border-radius: var(--radius-sm);
}

.radio {
  border-radius: var(--radius-full);
}

.checkbox:checked,
.radio:checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
```

---

## Card

### Specifications

| 屬性 | 值 |
|------|-----|
| 背景 | white |
| 圓角 | radius-lg 或 radius-xl |
| 陰影 | shadow-sm 或 shadow-md |
| 內距 | 16px - 24px |

### Structure

```html
<div class="card">
  <div class="card-header">
    <h3>Title</h3>
    <p class="card-description">Description</p>
  </div>
  <div class="card-content">
    <!-- Content -->
  </div>
  <div class="card-footer">
    <!-- Actions -->
  </div>
</div>
```

```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 0;
}

.card-content {
  padding: 24px;
}

.card-footer {
  padding: 0 24px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

---

## Modal / Dialog

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-50);
}

.modal {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  z-index: var(--z-60);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

---

## Toast / Notification

```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-80);
  animation: slide-in 200ms ease;
}

.toast-success {
  background: var(--color-success);
  color: white;
}

.toast-error {
  background: var(--color-error);
  color: white;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## Tooltip

```css
.tooltip {
  position: absolute;
  padding: 6px 10px;
  background: var(--color-gray-900);
  color: white;
  font-size: var(--text-sm);
  border-radius: var(--radius-md);
  z-index: var(--z-90);
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  border: 4px solid transparent;
  border-top-color: var(--color-gray-900);
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
}
```

---

## Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
}

.badge-default {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.badge-primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## Loading States

### Spinner

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Skeleton

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
