# 設計規格驗證流程

當任務包含設計規格（ui-specs/*.md）時，必須執行此完整驗證流程。

## 總覽

```
設計規格 (ui-specs/*.md)
    ↓
1. 讀取規格（Tokens, Layout, States）
    ↓
2. 建立驗證計畫（提取驗證點）
    ↓
3. 執行視覺驗證（顏色、字體、間距）
    ↓
4. 執行互動驗證（Hover, Focus, Loading）
    ↓
5. 執行響應式驗證（各斷點）
    ↓
6. 產出驗證報告（通過/失敗項目）
```

---

## Step 1: 讀取設計規格

### 1.1 必讀檔案

```bash
# 全域規範
~/.claude/skills/ui/references/tokens.md          # Design Tokens
~/.claude/skills/ui/references/components.md      # 元件規格

# 專案規格
openspec/changes/[change-id]/ui-specs/[component].md  # 元件設計規格
```

### 1.2 提取關鍵資訊

從設計規格中提取：

| 資訊類型 | 範例 | 用於驗證 |
|----------|------|----------|
| **Layout** | max-width: 1280px, padding: 24px | 佈局驗證 |
| **Colors** | background: --color-surface | 視覺驗證 |
| **Typography** | title: --text-2xl, --font-semibold | 視覺驗證 |
| **Spacing** | gap: --spacing-md (16px) | 佈局驗證 |
| **States** | Loading, Error, Empty | 狀態驗證 |
| **Breakpoints** | Mobile: single column | 響應式驗證 |

**範例：從 validation-page.md 提取**

```markdown
# 驗證頁面設計規格

## Layout
- Container: max-width 1280px, padding 24px
- Grid: 2 columns (md+), 1 column (mobile)
- Gap: 24px

## Visual
- Title: --text-2xl, --font-semibold, --text-primary
- Card bg: --color-surface
- Border: --border, --radius-lg

## States
- Loading: spinner + disabled buttons
- Error: red border + error message
- Empty: placeholder text + icon
```

**提取驗證點**：

```javascript
const validationPlan = {
  layout: [
    { check: "Container max-width", expected: "1280px" },
    { check: "Container padding", expected: "24px" },
    { check: "Grid columns (desktop)", expected: 2 },
    { check: "Grid columns (mobile)", expected: 1 },
    { check: "Grid gap", expected: "24px" }
  ],
  visual: [
    { check: "Title font-size", expected: "31.25px", token: "--text-2xl" },
    { check: "Title font-weight", expected: "600", token: "--font-semibold" },
    { check: "Card background", token: "--color-surface" },
    { check: "Card border-radius", expected: "12px", token: "--radius-lg" }
  ],
  states: [
    { check: "Loading spinner visible", state: "loading" },
    { check: "Error border red", state: "error" },
    { check: "Empty state message", state: "empty" }
  ],
  responsive: [
    { breakpoint: "mobile", width: 375, checks: ["Grid: 1 column"] },
    { breakpoint: "desktop", width: 1280, checks: ["Grid: 2 columns"] }
  ]
};
```

---

## Step 2: 建立驗證計畫

### 2.1 驗證計畫範本

```markdown
# [元件名稱] 驗證計畫

**設計規格**：openspec/changes/xxx/ui-specs/[component].md
**頁面 URL**：http://localhost:3000/[path]

## 驗證範圍

### 佈局驗證
- [ ] Container max-width 1280px
- [ ] Container padding 24px
- [ ] Grid 2 columns (desktop)
- [ ] Grid 1 column (mobile)
- [ ] Grid gap 24px

### 視覺驗證
- [ ] Title --text-2xl (31.25px)
- [ ] Title --font-semibold (600)
- [ ] Card background --color-surface
- [ ] Card border-radius --radius-lg (12px)
- [ ] Border color --border

### 狀態驗證
- [ ] Loading: spinner + disabled
- [ ] Error: red border + message
- [ ] Empty: placeholder visible

### 響應式驗證
- [ ] Mobile (375px): 1 column
- [ ] Desktop (1280px): 2 columns

## 優先級
- P0 (Critical): 佈局、狀態
- P1 (Important): 視覺、響應式
```

### 2.2 驗證順序

```
1. 佈局驗證（最先，影響其他驗證）
2. 視覺驗證（顏色、字體、間距）
3. 狀態驗證（Loading, Error, Empty）
4. 互動驗證（Hover, Focus）
5. 響應式驗證（各斷點）
```

---

## Step 3: 執行視覺驗證

### 3.1 驗證 Design Tokens 使用

**目標**：確保使用 CSS Variables，而非 hardcode。

```javascript
// 1. 導航到頁面
browser_navigate(url: "http://localhost:3000/validation")
browser_snapshot()

// 2. 驗證 Title 使用 token
browser_evaluate(
  element: "page title",
  ref: "s1e2",
  function: `(element) => {
    const computed = window.getComputedStyle(element);
    const root = window.getComputedStyle(document.documentElement);

    return {
      // 字體大小
      fontSize: computed.fontSize,
      tokenTextXl: root.getPropertyValue('--text-2xl').trim(),
      fontSizeMatches: computed.fontSize === root.getPropertyValue('--text-2xl').trim(),

      // 字體粗細
      fontWeight: computed.fontWeight,
      tokenSemibold: root.getPropertyValue('--font-semibold').trim(),
      fontWeightMatches: computed.fontWeight === root.getPropertyValue('--font-semibold').trim(),

      // 檢查是否使用 var()
      usesVariables: {
        fontSize: computed.getPropertyValue('font-size').includes('var('),
        fontWeight: computed.getPropertyValue('font-weight').includes('var(')
      }
    };
  }`
)

// 預期結果：
// ✅ {
//   fontSize: "31.25px",
//   fontSizeMatches: true,
//   fontWeight: "600",
//   fontWeightMatches: true,
//   usesVariables: { fontSize: false, fontWeight: false }
//   // Note: usesVariables 可能是 false，因為瀏覽器會解析 computed value
// }
```

**更準確的 Token 檢測**：

```javascript
browser_evaluate(
  element: "card",
  ref: "s1e5",
  function: `(element) => {
    // 方法 1：檢查 inline style（如果元件直接設定）
    const inlineStyle = element.style.backgroundColor;

    // 方法 2：檢查 stylesheet 規則（更準確）
    const sheets = Array.from(document.styleSheets);
    let usesToken = false;

    for (const sheet of sheets) {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        for (const rule of rules) {
          if (rule.style && rule.selectorText) {
            // 檢查選擇器是否匹配此元素
            if (element.matches(rule.selectorText)) {
              const bg = rule.style.backgroundColor;
              if (bg && bg.includes('var(')) {
                usesToken = true;
                break;
              }
            }
          }
        }
      } catch (e) {
        // CORS 問題，跳過
      }
    }

    // 方法 3：檢查 computed value 是否符合 token
    const computed = window.getComputedStyle(element);
    const root = window.getComputedStyle(document.documentElement);
    const tokenValue = root.getPropertyValue('--color-surface').trim();

    return {
      computedBg: computed.backgroundColor,
      tokenValue: tokenValue,
      valuesMatch: computed.backgroundColor === tokenValue,
      usesToken: usesToken
    };
  }`
)
```

### 3.2 驗證顏色

```javascript
// 驗證所有主按鈕使用 --color-primary
browser_evaluate(
  element: "page container",
  ref: "s1e1",
  function: `(element) => {
    const root = window.getComputedStyle(document.documentElement);
    const primaryColor = root.getPropertyValue('--color-primary').trim();

    const buttons = Array.from(element.querySelectorAll('button.primary'));

    const results = buttons.map(btn => {
      const bg = window.getComputedStyle(btn).backgroundColor;
      return {
        text: btn.textContent.trim(),
        bg: bg,
        matchesToken: bg === primaryColor
      };
    });

    return {
      expectedColor: primaryColor,
      buttons: results,
      allMatch: results.every(r => r.matchesToken)
    };
  }`
)

// ✅ 預期：{ allMatch: true }
// ❌ Bug：{ allMatch: false, buttons: [...] }
```

### 3.3 驗證字體

```javascript
// 驗證所有 h1 使用正確字體規格
browser_evaluate(
  element: "page container",
  ref: "s1e1",
  function: `(element) => {
    const root = window.getComputedStyle(document.documentElement);
    const expectedSize = root.getPropertyValue('--text-2xl').trim();
    const expectedWeight = root.getPropertyValue('--font-semibold').trim();

    const headings = Array.from(element.querySelectorAll('h1'));

    const results = headings.map(h => {
      const style = window.getComputedStyle(h);
      return {
        text: h.textContent.slice(0, 30),
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        sizeCorrect: style.fontSize === expectedSize,
        weightCorrect: style.fontWeight === expectedWeight
      };
    });

    return {
      expected: { size: expectedSize, weight: expectedWeight },
      headings: results,
      allCorrect: results.every(r => r.sizeCorrect && r.weightCorrect)
    };
  }`
)
```

### 3.4 驗證間距

```javascript
// 驗證 Grid gap 使用 --spacing-lg (24px)
browser_evaluate(
  element: "grid container",
  ref: "s1e10",
  function: `(element) => {
    const root = window.getComputedStyle(document.documentElement);
    const expectedGap = root.getPropertyValue('--spacing-lg').trim();

    const style = window.getComputedStyle(element);
    const actualGap = style.gap || style.gridGap;

    return {
      expectedGap: expectedGap,
      actualGap: actualGap,
      matches: actualGap === expectedGap
    };
  }`
)

// ✅ 預期：{ matches: true }
```

---

## Step 4: 執行互動驗證

### 4.1 驗證 Hover 狀態

**從設計規格提取**：

```markdown
## Interactive States
- Button Hover: background lightness -10%
- Card Hover: shadow --shadow-lg
```

**驗證腳本**：

```javascript
// 1. 記錄初始狀態
browser_snapshot()
browser_evaluate(
  element: "primary button",
  ref: "s1e15",
  function: "(element) => window.getComputedStyle(element).backgroundColor"
)
// 初始：rgb(59, 130, 246)

// 2. Hover
browser_hover(element: "primary button", ref: "s1e15")

// 3. 驗證變化
browser_evaluate(
  element: "primary button",
  ref: "s1e15",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    const bg = style.backgroundColor;

    // 驗證顏色是否變深
    const [r, g, b] = bg.match(/\\d+/g).map(Number);
    const isDarker = (r < 59 || g < 130 || b < 246);

    return {
      hoverBg: bg,
      isDarker: isDarker
    };
  }`
)

// ✅ 預期：{ isDarker: true }
```

### 4.2 驗證 Focus 狀態

**從設計規格提取**：

```markdown
## Focus States
- Input Focus: outline 2px solid --color-primary, offset 2px
```

**驗證腳本**：

```javascript
browser_click(element: "email input", ref: "s1e8")

browser_evaluate(
  element: "email input",
  ref: "s1e8",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    const root = window.getComputedStyle(document.documentElement);

    return {
      outline: style.outline,
      outlineWidth: style.outlineWidth,
      outlineOffset: style.outlineOffset,
      outlineColor: style.outlineColor,
      expectedColor: root.getPropertyValue('--color-primary').trim(),
      isFocused: document.activeElement === element,
      meetsSpec: style.outlineWidth === '2px' && style.outlineOffset === '2px'
    };
  }`
)

// ✅ 預期：{ meetsSpec: true, isFocused: true }
```

### 4.3 驗證 Loading 狀態

**從設計規格提取**：

```markdown
## Loading State
- Show spinner (--color-primary)
- Disable all buttons
- Display "Loading..." text
```

**驗證腳本**：

```javascript
// 1. 觸發 loading
browser_click(element: "submit button", ref: "s1e15")

// 2. 立即驗證
browser_wait_for(text: "Loading")

browser_snapshot()
// 應該看到：
// - spinner [ref=s2e1]
// - button "Loading..." [aria-busy=true, disabled, ref=s2e2]

// 3. 驗證按鈕狀態
browser_evaluate(
  element: "submit button",
  ref: "s2e2",
  function: `(element) => {
    return {
      disabled: element.disabled,
      ariaBusy: element.getAttribute('aria-busy'),
      textContent: element.textContent.trim()
    };
  }`
)

// ✅ 預期：
// {
//   disabled: true,
//   ariaBusy: "true",
//   textContent: "Loading..."
// }
```

### 4.4 驗證 Error 狀態

**從設計規格提取**：

```markdown
## Error State
- Input: red border (--color-error)
- Show error message below input
- Set aria-invalid="true"
```

**驗證腳本**：

```javascript
// 1. 提交無效資料
browser_type(element: "email input", ref: "s1e8", text: "invalid")
browser_click(element: "submit button", ref: "s1e15")

// 2. 等待錯誤訊息
browser_wait_for(text: "Invalid email format")

// 3. 驗證視覺和無障礙
browser_snapshot()
// 應該看到：
// - textbox "Email" [aria-invalid=true, ref=s2e8]
// - text "Invalid email format" [role=alert, ref=s2e9]

browser_evaluate(
  element: "email input",
  ref: "s2e8",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    const root = window.getComputedStyle(document.documentElement);
    const errorColor = root.getPropertyValue('--color-error').trim();

    return {
      borderColor: style.borderColor,
      expectedColor: errorColor,
      ariaInvalid: element.getAttribute('aria-invalid'),
      ariaDescribedBy: element.getAttribute('aria-describedby'),
      meetsSpec: element.getAttribute('aria-invalid') === 'true'
    };
  }`
)

// ✅ 預期：
// {
//   ariaInvalid: "true",
//   meetsSpec: true
// }
```

---

## Step 5: 執行響應式驗證

### 5.1 驗證各斷點佈局

**從設計規格提取**：

```markdown
## Responsive
- Mobile (< 768px): 1 column, stack navigation
- Desktop (≥ 768px): 2 columns, horizontal navigation
```

**驗證腳本**：

```javascript
// ========== Mobile 驗證 ==========
browser_resize(width: 375, height: 667)
browser_snapshot()

// 驗證單欄佈局
browser_evaluate(
  element: "grid container",
  ref: "s1e10",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    const columns = style.gridTemplateColumns;
    const columnCount = columns.split(' ').filter(c => c.includes('fr') || c.includes('px')).length;

    return {
      gridTemplateColumns: columns,
      columnCount: columnCount,
      isSingleColumn: columnCount === 1
    };
  }`
)

// ✅ 預期：{ isSingleColumn: true }

// 驗證導航堆疊
browser_snapshot()
// 應該看到：
// - button "Menu" [ref=s1e1] (漢堡選單)

// ========== Desktop 驗證 ==========
browser_resize(width: 1280, height: 800)
browser_snapshot()

// 驗證雙欄佈局
browser_evaluate(
  element: "grid container",
  ref: "s2e10",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    const columns = style.gridTemplateColumns;
    const columnCount = columns.split(' ').filter(c => c.includes('fr') || c.includes('px')).length;

    return {
      gridTemplateColumns: columns,
      columnCount: columnCount,
      isTwoColumns: columnCount === 2
    };
  }`
)

// ✅ 預期：{ isTwoColumns: true }

// 驗證水平導航
browser_snapshot()
// 應該看到：
// - navigation [ref=s2e1]
//   - link "Home"
//   - link "About"
//   ...
```

### 5.2 驗證無水平捲軸

```javascript
const breakpoints = [
  { name: 'mobile', width: 375 },
  { name: 'tablet', width: 768 },
  { name: 'desktop', width: 1280 }
];

for (const bp of breakpoints) {
  browser_resize(width: bp.width, height: 800);

  browser_evaluate(
    element: "body",
    ref: "s1e0",
    function: `() => {
      return {
        bodyScrollWidth: document.body.scrollWidth,
        windowWidth: window.innerWidth,
        hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
      };
    }`
  );

  // ✅ 所有斷點：{ hasHorizontalScroll: false }
}
```

---

## Step 6: 產出驗證報告

### 6.1 報告範本

```markdown
# [元件名稱] 設計驗證報告

**日期**：2024-01-12
**驗證者**：TESTER
**設計規格**：openspec/changes/xxx/ui-specs/[component].md
**頁面 URL**：http://localhost:3000/[path]

---

## 執行摘要

- **總驗證項目**：24
- **通過**：22 ✅
- **失敗**：2 ❌
- **通過率**：91.7%

---

## 詳細結果

### 1. 佈局驗證 (5/5 ✅)

| 檢查項目 | 預期 | 實際 | 結果 |
|----------|------|------|------|
| Container max-width | 1280px | 1280px | ✅ |
| Container padding | 24px | 24px | ✅ |
| Grid columns (desktop) | 2 | 2 | ✅ |
| Grid columns (mobile) | 1 | 1 | ✅ |
| Grid gap | 24px | 24px | ✅ |

### 2. 視覺驗證 (7/9 ✅)

| 檢查項目 | Token | 預期 | 實際 | 結果 |
|----------|-------|------|------|------|
| Title font-size | --text-2xl | 31.25px | 31.25px | ✅ |
| Title font-weight | --font-semibold | 600 | 600 | ✅ |
| Card background | --color-surface | rgb(255,255,255) | rgb(255,255,255) | ✅ |
| Card border-radius | --radius-lg | 12px | 12px | ✅ |
| Card border-color | --border | rgb(229,231,235) | rgb(229,231,235) | ✅ |
| Button background | --color-primary | rgb(59,130,246) | rgb(59,130,246) | ✅ |
| Button hover bg | (darker) | rgb(37,99,235) | rgb(59,130,246) | ❌ |
| Input focus outline | 2px --color-primary | 2px rgb(59,130,246) | 2px rgb(59,130,246) | ✅ |
| Input focus offset | 2px | 2px | 0px | ❌ |

**失敗項目**：

1. **Button hover bg**
   - 問題：Hover 時背景顏色沒有變化
   - 預期：rgb(37, 99, 235) (更深的藍)
   - 實際：rgb(59, 130, 246) (不變)
   - 截圖：`screenshots/button-hover-fail.png`
   - 修復建議：加入 `&:hover { background: var(--color-primary-dark); }`

2. **Input focus offset**
   - 問題：Focus outline-offset 為 0
   - 預期：2px
   - 實際：0px
   - 截圖：`screenshots/input-focus-fail.png`
   - 修復建議：加入 `outline-offset: 2px;`

### 3. 狀態驗證 (6/6 ✅)

| 狀態 | 檢查項目 | 結果 |
|------|----------|------|
| Loading | Spinner 顯示 | ✅ |
| Loading | 按鈕 disabled | ✅ |
| Loading | 文字 "Loading..." | ✅ |
| Error | Input 紅色邊框 | ✅ |
| Error | 錯誤訊息顯示 | ✅ |
| Error | aria-invalid="true" | ✅ |

### 4. 響應式驗證 (4/4 ✅)

| 斷點 | 寬度 | 檢查項目 | 結果 |
|------|------|----------|------|
| Mobile | 375px | 1 column | ✅ |
| Mobile | 375px | 無水平捲軸 | ✅ |
| Desktop | 1280px | 2 columns | ✅ |
| Desktop | 1280px | 無水平捲軸 | ✅ |

---

## 待修復問題

### P1 - 重要

1. **Button Hover 狀態缺失**
   - 檔案：`components/Button.tsx`
   - 行數：第 25 行
   - 修復：加入 hover 樣式

2. **Input Focus Offset 錯誤**
   - 檔案：`components/Input.tsx`
   - 行數：第 18 行
   - 修復：設定 `outline-offset: 2px`

---

## 截圖存證

- `screenshots/button-hover-fail.png` - Button hover 狀態問題
- `screenshots/input-focus-fail.png` - Input focus offset 問題

---

## 結論

整體實作符合設計規格 **91.7%**，有 2 處小問題需要修復。

**建議**：
1. 修復 Button hover 狀態
2. 修復 Input focus offset
3. 修復後重新執行驗證

---

**驗證完成時間**：2024-01-12 14:30
**下次驗證**：修復後
```

### 6.2 截圖存證

當發現問題時，必須截圖存證：

```javascript
// 截圖失敗的 hover 狀態
browser_hover(element: "primary button", ref: "s1e15")
browser_take_screenshot(
  element: "primary button",
  ref: "s1e15",
  filename: "screenshots/button-hover-fail.png"
)

// 截圖整個頁面
browser_take_screenshot(
  filename: "screenshots/validation-page-overview.png",
  fullPage: true
)
```

---

## 完整驗證範例

以「登入表單」為例的完整流程：

```javascript
// ========== Step 1: 讀取設計規格 ==========
// (手動讀取 ui-specs/login-form.md)

// ========== Step 2: 建立驗證計畫 ==========
// (建立 checklist)

// ========== Step 3: 執行視覺驗證 ==========
browser_navigate(url: "http://localhost:3000/login")
browser_snapshot()

// 驗證容器
browser_evaluate(
  element: "login container",
  ref: "s1e1",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      maxWidth: style.maxWidth,
      padding: style.padding
    };
  }`
)
// ✅ { maxWidth: "400px", padding: "32px" }

// 驗證標題
browser_evaluate(
  element: "Login heading",
  ref: "s1e2",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    };
  }`
)
// ✅ { fontSize: "31.25px", fontWeight: "600" }

// ========== Step 4: 執行互動驗證 ==========
// Focus 狀態
browser_click(element: "Email input", ref: "s1e3")
browser_evaluate(
  element: "Email input",
  ref: "s1e3",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      outline: style.outline,
      outlineOffset: style.outlineOffset
    };
  }`
)
// ❌ { outlineOffset: "0px" } (應為 "2px")

// Error 狀態
browser_type(element: "Email input", ref: "s1e3", text: "invalid")
browser_click(element: "Login button", ref: "s1e5")
browser_wait_for(text: "Invalid email")
browser_snapshot()
// ✅ textbox "Email" [aria-invalid=true]

// ========== Step 5: 執行響應式驗證 ==========
browser_resize(width: 375, height: 667)
browser_evaluate(
  element: "login container",
  ref: "s1e1",
  function: `(element) => {
    return {
      width: element.clientWidth,
      padding: window.getComputedStyle(element).padding
    };
  }`
)
// ✅ { width: 375, padding: "16px" } (mobile 較小 padding)

// ========== Step 6: 產出報告 ==========
// (產出上方的驗證報告)
```

---

## Checklist

驗證流程完成確認：

- [ ] 已讀取設計規格 (ui-specs/*.md)
- [ ] 已讀取 Design Tokens (tokens.md)
- [ ] 已建立驗證計畫
- [ ] 已執行佈局驗證
- [ ] 已執行視覺驗證
- [ ] 已驗證 Design Token 使用
- [ ] 已執行狀態驗證 (Loading, Error)
- [ ] 已執行互動驗證 (Hover, Focus)
- [ ] 已執行響應式驗證
- [ ] 已截圖存證（失敗項目）
- [ ] 已產出驗證報告
- [ ] 已標記待修復問題

---

## 總結

**設計驗證 = 確保實作符合設計規格的系統性流程**

關鍵：
1. **讀取規格** → 提取驗證點
2. **執行驗證** → 使用 Playwright 檢測
3. **產出報告** → 記錄通過/失敗
4. **截圖存證** → 方便修復

記住：**所有包含設計規格的任務都必須執行此流程！**
