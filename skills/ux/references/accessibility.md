# Accessibility (A11y) 無障礙設計

基於 WCAG 2.2 標準的無障礙設計完整指南。

---

## WCAG 2.2 概述

### 四大原則 (POUR)

```
┌─────────────────────────────────────────────────┐
│  Perceivable    可感知                          │
│  ↓                                              │
│  Operable       可操作                          │
│  ↓                                              │
│  Understandable 可理解                          │
│  ↓                                              │
│  Robust         健壯性                          │
└─────────────────────────────────────────────────┘
```

### 等級說明

| 等級 | 說明 | 要求 |
|------|------|------|
| A | 基本 | 必須達成 |
| AA | 標準 | 建議達成（法規要求） |
| AAA | 進階 | 理想目標 |

### 2025 法規更新

```
歐盟：
├── European Accessibility Act (EAA)
├── 2025/6/28 起強制執行
└── 要求 WCAG 2.2 AA

美國：
├── ADA 持續執法
├── Section 508 更新中
└── 訴訟案件持續增加

ISO：
├── ISO/IEC 40500:2025
└── 與 WCAG 2.2 同步
```

---

## WCAG 2.2 新增標準

### 9 個新成功標準

#### Level A (1 個)

**3.2.6 Consistent Help 一致的幫助**
```
如果網頁提供幫助機制，它們必須在所有頁面的
相對位置保持一致。

幫助機制包括：
├── 人工聯繫方式（電話、Email）
├── 自動聯繫機制（聊天機器人）
├── 自助選項（FAQ）
└── 完全自動化機制

✅ 幫助連結永遠在頁尾相同位置
❌ 幫助連結有時在 Header、有時在 Footer
```

#### Level AA (5 個)

**2.4.11 Focus Not Obscured (Minimum) 焦點不被遮擋（最低）**
```
當元素獲得鍵盤焦點時，至少部分元素不能被
作者提供的內容遮擋。

常見問題：
├── 固定底部的 Cookie 通知
├── 浮動的聊天按鈕
├── 固定的 Header/Footer
└── Modal backdrop

✅ 確保焦點元素至少部分可見
✅ 自動捲動顯示焦點元素
```

**2.4.12 Focus Not Obscured (Enhanced) 焦點不被遮擋（增強）**
```
Level AAA：焦點元素必須完全可見，不被遮擋。
```

**2.5.7 Dragging Movements 拖曳動作**
```
任何需要拖曳的功能必須提供替代方式
（單點操作）。

✅ 提供方式
├── 上/下按鈕重新排序
├── 輸入數值代替滑桿
├── 下拉選單選擇位置
└── 鍵盤操作支援

❌ 只能用拖曳排序清單
✅ 可拖曳 + 提供上/下按鈕
```

**2.5.8 Target Size (Minimum) 目標尺寸（最低）**
```
互動目標至少 24x24 CSS 像素

例外情況：
├── 行內連結（段落中的文字連結）
├── 使用者自訂的元件
├── 由 User Agent 決定的元件
├── 特定呈現是必要的
└── 有足夠間距（24px 不重疊）

推薦：44x44px 以上
```

**3.3.7 Redundant Entry 冗餘輸入**
```
如果之前輸入過的資訊在後續步驟需要，必須：
├── 自動填入，或
├── 提供選擇選項

✅ 結帳流程
步驟 1: 輸入地址
步驟 2: 確認地址 [☑ 同收件地址]

❌ 每個步驟都要重新輸入相同資訊
```

**3.3.8 Accessible Authentication (Minimum) 無障礙驗證（最低）**
```
認知功能測試（如記憶、解謎）不能是認證的
唯一方式，除非：

允許的替代方式：
├── 物件識別（從圖片中選擇物件）
├── 個人識別內容（選擇自己上傳的圖片）
├── 密碼管理器支援（可貼上密碼）
├── 複製貼上驗證碼
└── 設備驗證（指紋、Face ID）

❌ 必須手動輸入驗證碼（禁止貼上）
✅ 允許貼上驗證碼 + 支援 Passkey
```

**3.3.9 Accessible Authentication (Enhanced) 無障礙驗證（增強）**
```
Level AAA：完全不依賴認知功能測試。
```

---

## 色彩對比度

### 標準要求

| 類型 | AA 標準 | AAA 標準 |
|------|---------|----------|
| 一般文字 | 4.5:1 | 7:1 |
| 大文字 (18px+ / 14px bold) | 3:1 | 4.5:1 |
| UI 元件/圖形 | 3:1 | - |
| Focus 指示器 | 3:1 | - |

### 計算公式

```
對比度 = (L1 + 0.05) / (L2 + 0.05)

L1 = 較亮顏色的相對亮度
L2 = 較暗顏色的相對亮度
```

### 常見問題

```
❌ 問題組合
├── 淺灰文字在白底：#999 on #fff (2.85:1)
├── 灰色佔位文字：#ccc on #fff (1.61:1)
└── 淺色連結：#6cf on #fff (2.44:1)

✅ 修正建議
├── 文字：#595959 on #fff (7:1 AAA)
├── 佔位文字：#767676 on #fff (4.54:1 AA)
└── 連結：#0066cc on #fff (5.91:1 AA)
```

### 檢查工具

```
瀏覽器：
├── Chrome DevTools → Accessibility
├── Firefox → Accessibility Inspector
└── Safari → Accessibility Inspector

線上工具：
├── WebAIM Contrast Checker
├── Contrast Ratio (Lea Verou)
└── Color.review

擴充功能：
├── axe DevTools
├── WAVE
└── Stark
```

---

## 鍵盤導航

### Focus 管理

```html
<!-- 語意化 HTML 自動可 focus -->
<button>按鈕</button>
<a href="#">連結</a>
<input type="text">

<!-- 自訂元件加 tabindex -->
<div role="button" tabindex="0">自訂按鈕</div>

<!-- 管理 tab 順序 -->
tabindex="0"  → 自然順序
tabindex="-1" → 程式控制 focus，不在 tab 順序
tabindex="1+" → ❌ 避免使用
```

### Focus 可見性

```css
/* 確保 focus 始終可見 */
:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 僅鍵盤導航時顯示 */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Focus 不被遮擋 (WCAG 2.2) */
.fixed-footer {
  /* 確保不會遮擋焦點元素 */
}
[tabindex]:focus {
  scroll-margin-bottom: 100px; /* 預留空間 */
}
```

### Skip Link

```html
<body>
  <a href="#main" class="skip-link">跳到主要內容</a>
  <header>...</header>
  <nav>...</nav>
  <main id="main" tabindex="-1">...</main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### 鍵盤操作

| 元件 | 鍵盤操作 |
|------|----------|
| 按鈕 | Enter, Space |
| 連結 | Enter |
| Checkbox | Space |
| Radio | 方向鍵 |
| 下拉選單 | Enter 開啟, 方向鍵選擇, Esc 關閉 |
| Modal | Esc 關閉, Tab 循環 |
| Tab 面板 | 方向鍵切換 |
| 選單 | 方向鍵導航, Enter 選擇 |

---

## ARIA 屬性

### 使用原則

```
1. 優先使用原生 HTML
   <button> 優於 <div role="button">

2. 不要改變原生語意
   ❌ <button role="heading">
   ✅ <h1><button>...</button></h1>

3. 所有互動元素可鍵盤操作
   role="button" → 必須支援 Enter/Space

4. 不隱藏可 focus 元素
   ❌ <button aria-hidden="true">

5. 所有互動元素有可訪問名稱
   ✅ <button aria-label="關閉">X</button>
```

### 常用 ARIA

```html
<!-- 標籤 -->
<button aria-label="關閉選單">X</button>
<input aria-labelledby="label-id">
<input aria-describedby="hint-id">

<!-- 狀態 -->
<button aria-expanded="false">展開</button>
<button aria-pressed="true">已啟用</button>
<div aria-busy="true">載入中</div>
<input aria-invalid="true">

<!-- 隱藏 -->
<span aria-hidden="true">🎉</span>

<!-- 即時區域 -->
<div aria-live="polite">搜尋結果已更新</div>
<div aria-live="assertive" role="alert">錯誤訊息</div>
```

### Role 屬性

```html
<!-- 地標 -->
<header role="banner">
<nav role="navigation">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">

<!-- 互動元件 -->
<div role="button" tabindex="0">
<div role="checkbox" aria-checked="false">
<div role="dialog" aria-modal="true">
<ul role="menu">
<div role="tablist">

<!-- 狀態 -->
<div role="alert">錯誤訊息</div>
<div role="status">狀態更新</div>
<div role="progressbar" aria-valuenow="50">
```

---

## 表單無障礙

### 標籤關聯

```html
<!-- 方式 1: for/id -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- 方式 2: 包裹 -->
<label>
  Email
  <input type="email">
</label>

<!-- 方式 3: aria-labelledby -->
<span id="email-label">Email</span>
<input aria-labelledby="email-label" type="email">
```

### 錯誤處理

```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<span id="email-error" role="alert">
  請輸入有效的 Email 地址
</span>
```

### 必填欄位

```html
<label for="name">
  姓名
  <span aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true">
```

### 群組化

```html
<fieldset>
  <legend>聯絡方式</legend>
  <label><input type="radio" name="contact" value="email"> Email</label>
  <label><input type="radio" name="contact" value="phone"> 電話</label>
</fieldset>
```

### 自動完成 (WCAG 2.2)

```html
<!-- 支援密碼管理器 -->
<input type="email" autocomplete="email">
<input type="password" autocomplete="current-password">
<input type="text" autocomplete="one-time-code">

<!-- 地址自動填入 -->
<input autocomplete="street-address">
<input autocomplete="address-level1"> <!-- 縣市 -->
<input autocomplete="postal-code">
```

---

## 圖片與媒體

### Alt 文字原則

| 類型 | 處理方式 |
|------|----------|
| 資訊性圖片 | 描述內容和目的 |
| 裝飾性圖片 | `alt=""` 或用 CSS |
| 功能性圖片 | 描述功能/目的地 |
| 複雜圖表 | 提供詳細描述 |
| 文字圖片 | 完整文字內容 |

```html
<!-- 資訊性 -->
<img src="chart.png" alt="2024 年銷售成長 30%">

<!-- 裝飾性 -->
<img src="divider.png" alt="">

<!-- 功能性 -->
<a href="/home">
  <img src="logo.png" alt="回到首頁">
</a>

<!-- 複雜圖表 -->
<figure>
  <img src="data-chart.png" alt="2024 年各季營收" aria-describedby="chart-desc">
  <figcaption id="chart-desc">
    Q1: $100M, Q2: $120M, Q3: $150M, Q4: $180M
  </figcaption>
</figure>
```

### 影片無障礙

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="zh-TW" label="繁體中文">
  <track kind="descriptions" src="descriptions.vtt" srclang="zh-TW" label="語音描述">
</video>
```

要求：
- 字幕 (Captions) - AA
- 音訊描述 (Audio Description) - AA
- 播放控制鍵盤可用
- 不自動播放（或可停止）

---

## 動態內容

### Live Region

```html
<!-- 重要更新（立即宣讀） -->
<div role="alert" aria-live="assertive">
  錯誤：請檢查您的輸入
</div>

<!-- 一般更新（等待空檔宣讀） -->
<div aria-live="polite">
  搜尋結果已更新，共 15 筆
</div>

<!-- 狀態訊息 -->
<div role="status">
  檔案上傳完成
</div>
```

### 動態更新

```javascript
// 更新後通知螢幕閱讀器
function updateResults(count) {
  const status = document.getElementById('status');
  status.textContent = `找到 ${count} 筆結果`;
}
```

```html
<div id="status" role="status" aria-live="polite"></div>
```

### 動畫考量

```css
/* 尊重使用者偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* 或提供開關 */
.reduced-motion * {
  animation: none !important;
  transition: none !important;
}
```

---

## 測試工具

### 自動化測試

| 工具 | 類型 | 用途 |
|------|------|------|
| axe DevTools | 瀏覽器擴充 | 全面掃描 |
| WAVE | 瀏覽器擴充 | 視覺化問題 |
| Lighthouse | Chrome 內建 | 綜合評分 |
| Pa11y | CLI | CI/CD 整合 |
| jest-axe | 測試套件 | 單元測試 |

### 手動測試

```
鍵盤測試：
├── 只用鍵盤完成所有任務
├── Tab 順序是否合理
├── Focus 是否可見
├── 無鍵盤陷阱
└── Modal 正確管理焦點

螢幕閱讀器測試：
├── VoiceOver (Mac)
├── NVDA (Windows)
├── JAWS (Windows)
├── TalkBack (Android)
└── VoiceOver (iOS)

其他測試：
├── 200% 縮放
├── 高對比模式
├── 關閉 CSS
├── 關閉圖片
└── 只使用觸控
```

### 螢幕閱讀器快速鍵

```
VoiceOver (Mac):
├── VO = Control + Option
├── VO + U → 開啟轉輪
├── VO + 方向鍵 → 導航
└── VO + Space → 啟動

NVDA (Windows):
├── Insert + 方向鍵 → 導航
├── H → 跳到標題
├── D → 跳到地標
└── Tab → 跳到互動元素
```

---

## Quick Checklist

### Perceivable 可感知

- [ ] 圖片有替代文字
- [ ] 影片有字幕
- [ ] 色彩對比度 ≥ 4.5:1
- [ ] 不只用顏色傳達資訊
- [ ] 文字可放大到 200%

### Operable 可操作

- [ ] 完全鍵盤可操作
- [ ] Focus 順序合理
- [ ] Focus 可見且不被遮擋
- [ ] 無閃爍內容 (< 3 次/秒)
- [ ] 拖曳有替代操作
- [ ] 目標尺寸 ≥ 24px

### Understandable 可理解

- [ ] 語言有標示 (`lang`)
- [ ] 導航一致
- [ ] 錯誤訊息清楚
- [ ] 表單有標籤
- [ ] 幫助位置一致
- [ ] 不要求重複輸入

### Robust 健壯性

- [ ] HTML 語意正確
- [ ] ARIA 使用正確
- [ ] 狀態變化有通知
- [ ] 支援輔助技術

### Authentication 驗證

- [ ] 允許貼上密碼
- [ ] 提供認知測試替代方案
- [ ] 支援密碼管理器
- [ ] 支援 Passkey/指紋

---

## 資源

### 官方文件
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)

### 工具
- [axe DevTools](https://www.deque.com/axe/)
- [WAVE](https://wave.webaim.org/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
