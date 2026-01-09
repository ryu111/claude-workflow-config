# Accessibility (A11y)

無障礙設計指南與檢查清單。

## 基本要求

- [ ] 可純鍵盤操作
- [ ] 圖片有 alt 文字
- [ ] 表單有 label 關聯
- [ ] 顏色不是唯一識別方式
- [ ] 動畫可關閉
- [ ] 支援螢幕閱讀器

---

## WCAG 2.1 等級

| 等級 | 說明 | 要求 |
|------|------|------|
| A | 基本 | 必須達成 |
| AA | 標準 | 建議達成 |
| AAA | 進階 | 理想目標 |

---

## 色彩對比度

| 類型 | AA 標準 | AAA 標準 |
|------|---------|----------|
| 一般文字 | 4.5:1 | 7:1 |
| 大文字 (18px+) | 3:1 | 4.5:1 |
| UI 元件 | 3:1 | - |

### 檢查工具

- Chrome DevTools → Accessibility
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 鍵盤導航

### Focus 順序

```html
<!-- 使用語意化 HTML，自然順序 -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>
```

### Focus 可見性

```css
/* 永遠保持 focus 可見 */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 只在鍵盤導航時顯示 */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Link

```html
<a href="#main" class="skip-link">跳到主要內容</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
}
.skip-link:focus {
  top: 0;
}
```

---

## ARIA 屬性

### 常用屬性

| 屬性 | 用途 | 範例 |
|------|------|------|
| `aria-label` | 提供標籤 | `<button aria-label="關閉">X</button>` |
| `aria-labelledby` | 參考其他元素 | `<div aria-labelledby="title">` |
| `aria-describedby` | 額外描述 | `<input aria-describedby="hint">` |
| `aria-hidden` | 隱藏於輔助技術 | `<span aria-hidden="true">👍</span>` |
| `aria-expanded` | 展開狀態 | `<button aria-expanded="false">` |
| `aria-current` | 當前項目 | `<a aria-current="page">` |

### Role 屬性

```html
<div role="alert">錯誤訊息</div>
<div role="status">載入中...</div>
<nav role="navigation">...</nav>
<main role="main">...</main>
```

---

## 表單無障礙

### 正確關聯

```html
<!-- 使用 for/id -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- 或包裹 -->
<label>
  Email
  <input type="email">
</label>
```

### 錯誤處理

```html
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<span id="email-error" role="alert">
  請輸入有效的 email 地址
</span>
```

### 必填欄位

```html
<label for="name">
  姓名 <span aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true">
```

---

## 圖片無障礙

### Alt 文字原則

| 類型 | 處理 |
|------|------|
| 有意義的圖片 | 描述內容 |
| 裝飾性圖片 | `alt=""` 或 CSS |
| 功能性圖片 | 描述功能 |
| 複雜圖表 | 提供詳細描述 |

```html
<!-- 有意義 -->
<img src="dog.jpg" alt="一隻棕色拉布拉多犬在公園奔跑">

<!-- 裝飾性 -->
<img src="divider.png" alt="">

<!-- 功能性 -->
<a href="/home">
  <img src="logo.png" alt="回到首頁">
</a>
```

---

## 動態內容

### Live Region

```html
<!-- 重要通知 -->
<div aria-live="assertive">
  您的購物車已更新
</div>

<!-- 一般更新 -->
<div aria-live="polite">
  搜尋結果已更新
</div>
```

### 載入狀態

```html
<button aria-busy="true" aria-label="載入中">
  <span class="spinner"></span>
</button>
```

---

## 媒體無障礙

### 影片

- 提供字幕
- 提供音訊描述
- 播放控制鍵盤可用

### 音訊

- 提供文字稿
- 音量控制

---

## 測試工具

| 工具 | 用途 |
|------|------|
| axe DevTools | 自動化檢測 |
| WAVE | 視覺化問題 |
| Lighthouse | 綜合評分 |
| VoiceOver (Mac) | 螢幕閱讀器測試 |
| NVDA (Windows) | 螢幕閱讀器測試 |

---

## Quick Checklist

### 感知

- [ ] 圖片有替代文字
- [ ] 影片有字幕
- [ ] 對比度足夠
- [ ] 不只用顏色傳達資訊

### 操作

- [ ] 鍵盤可完全操作
- [ ] Focus 順序合理
- [ ] Focus 狀態可見
- [ ] 有足夠時間完成任務

### 理解

- [ ] 語言有標示
- [ ] 錯誤訊息清楚
- [ ] 表單有標籤
- [ ] 介面一致

### 健壯

- [ ] HTML 語意正確
- [ ] ARIA 使用正確
- [ ] 跨瀏覽器相容
