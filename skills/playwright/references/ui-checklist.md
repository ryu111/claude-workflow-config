# UI 驗證系統性 Checklist

當進行 UI 驗證時，使用此 Checklist 確保覆蓋所有重要面向。

## 驗證分類

### 1. 佈局驗證

檢查元素的位置、大小、間距、對齊。

| 檢查項目 | Playwright 方法 | 範例 |
|----------|-----------------|------|
| 容器寬度 | `evaluate()` 取得 clientWidth | 驗證 `max-width: 1280px` |
| 元素間距 | `evaluate()` 計算 gap | 驗證 card 之間 16px gap |
| 水平對齊 | `evaluate()` 比較 offsetLeft | 驗證左對齊一致 |
| 垂直對齊 | `evaluate()` 比較 offsetTop | 驗證標題與圖示垂直居中 |
| Padding | `evaluate()` 取得 computedStyle | 驗證 `padding: 24px` |
| Margin | `evaluate()` 取得 computedStyle | 驗證 section 之間 32px |

**範例：驗證容器最大寬度**

```javascript
// 1. 取得 snapshot 找到容器 ref
browser_snapshot()
// 找到 main container [ref=s1e5]

// 2. 驗證寬度
browser_evaluate(
  element: "main container",
  ref: "s1e5",
  function: "(element) => element.clientWidth"
)
// 預期：≤ 1280

// 3. 進階：驗證 computedStyle
browser_evaluate(
  element: "main container",
  ref: "s1e5",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      maxWidth: style.maxWidth,
      padding: style.padding
    };
  }`
)
// 預期：{ maxWidth: "1280px", padding: "24px" }
```

**範例：驗證元素間距**

```javascript
// 驗證兩個 card 之間的 gap
browser_evaluate(
  element: "cards container",
  ref: "s1e10",
  function: `(element) => {
    const cards = element.children;
    if (cards.length < 2) return null;
    const gap = cards[1].offsetTop - (cards[0].offsetTop + cards[0].offsetHeight);
    return gap;
  }`
)
// 預期：16
```

---

### 2. 視覺驗證

檢查顏色、字體、邊框、圓角、陰影等視覺屬性。

| 檢查項目 | Playwright 方法 | 範例 |
|----------|-----------------|------|
| 背景顏色 | `evaluate()` backgroundColor | 驗證 `--color-primary` |
| 文字顏色 | `evaluate()` color | 驗證 `--text-secondary` |
| 字體大小 | `evaluate()` fontSize | 驗證 `--text-lg` (20px) |
| 字體粗細 | `evaluate()` fontWeight | 驗證 `--font-semibold` (600) |
| 邊框 | `evaluate()` border | 驗證 `1px solid var(--border)` |
| 圓角 | `evaluate()` borderRadius | 驗證 `--radius-lg` (12px) |
| 陰影 | `evaluate()` boxShadow | 驗證 `--shadow-md` |

**範例：驗證主按鈕顏色**

```javascript
browser_evaluate(
  element: "Submit button",
  ref: "s1e15",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      borderRadius: style.borderRadius
    };
  }`
)
// 預期：
// {
//   background: "rgb(59, 130, 246)",  // blue-500
//   color: "rgb(255, 255, 255)",
//   borderRadius: "12px"
// }
```

**範例：驗證 Design Token 使用**

```javascript
// 驗證是否正確使用 CSS variable
browser_evaluate(
  element: "card",
  ref: "s1e20",
  function: `(element) => {
    // 取得實際值
    const computedStyle = window.getComputedStyle(element);
    // 取得 CSS variable
    const rootStyle = window.getComputedStyle(document.documentElement);

    return {
      actualBg: computedStyle.backgroundColor,
      tokenBg: rootStyle.getPropertyValue('--color-surface'),
      matches: computedStyle.backgroundColor === rootStyle.getPropertyValue('--color-surface')
    };
  }`
)
```

---

### 3. 狀態驗證

檢查載入、錯誤、空狀態、互動狀態（hover, focus, disabled）。

| 狀態類型 | 檢查方法 | 範例 |
|----------|----------|------|
| Loading | 驗證 spinner 存在 + aria-busy | 提交表單時 |
| Error | 驗證錯誤訊息 + 紅色邊框 | 驗證失敗時 |
| Empty | 驗證空狀態文字 + 圖示 | 無資料時 |
| Hover | 驗證背景變化 | 滑鼠懸停按鈕 |
| Focus | 驗證 focus ring | Tab 聚焦輸入框 |
| Disabled | 驗證 opacity + cursor | 已停用按鈕 |

**範例：驗證 Loading 狀態**

```javascript
// 1. 觸發載入
browser_click(element: "Submit", ref: "s1e15")

// 2. 立即 snapshot 檢查
browser_snapshot()
// 應該看到：
// - spinner [ref=s2e1]
// - button "Loading..." [aria-busy=true, ref=s2e2]

// 3. 驗證按鈕被停用
browser_evaluate(
  element: "Submit button",
  ref: "s2e2",
  function: "(element) => element.disabled"
)
// 預期：true
```

**範例：驗證 Error 狀態**

```javascript
// 1. 提交無效資料
browser_type(element: "Email", ref: "s1e2", text: "invalid")
browser_click(element: "Submit", ref: "s1e15")

// 2. 等待錯誤訊息
browser_wait_for(text: "Invalid email format")

// 3. 驗證視覺樣式
browser_snapshot()
// 找到 textbox "Email" [aria-invalid=true, ref=s2e5]

browser_evaluate(
  element: "Email input",
  ref: "s2e5",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      borderColor: style.borderColor,
      hasError: element.getAttribute('aria-invalid') === 'true'
    };
  }`
)
// 預期：{ borderColor: "rgb(239, 68, 68)", hasError: true }
```

**範例：驗證 Hover 狀態**

```javascript
// 1. Snapshot 取得初始狀態
browser_snapshot()
// button "Save" [ref=s1e10]

browser_evaluate(
  element: "Save button",
  ref: "s1e10",
  function: "(element) => window.getComputedStyle(element).backgroundColor"
)
// 初始：rgb(59, 130, 246)

// 2. Hover
browser_hover(element: "Save button", ref: "s1e10")

// 3. 驗證變化
browser_evaluate(
  element: "Save button",
  ref: "s1e10",
  function: "(element) => window.getComputedStyle(element).backgroundColor"
)
// Hover：rgb(37, 99, 235) (更深的藍色)
```

**範例：驗證 Focus 狀態**

```javascript
// 1. 聚焦輸入框
browser_click(element: "Email input", ref: "s1e2")

// 2. 驗證 focus ring
browser_evaluate(
  element: "Email input",
  ref: "s1e2",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      outline: style.outline,
      outlineOffset: style.outlineOffset,
      isFocused: document.activeElement === element
    };
  }`
)
// 預期：
// {
//   outline: "2px solid rgb(59, 130, 246)",
//   outlineOffset: "2px",
//   isFocused: true
// }
```

---

### 4. 響應式驗證

檢查不同斷點下的佈局變化。

| 斷點 | 寬度 | 檢查重點 |
|------|------|----------|
| Mobile | 375px | 單欄佈局、漢堡選單 |
| Tablet | 768px | 兩欄佈局、收合側邊欄 |
| Desktop | 1280px | 多欄佈局、展開導航 |

**範例：驗證響應式佈局**

```javascript
// 1. 測試 Mobile (375px)
browser_resize(width: 375, height: 667)
browser_snapshot()

browser_evaluate(
  element: "main grid",
  ref: "s1e5",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      gridTemplateColumns: style.gridTemplateColumns,
      columns: style.gridTemplateColumns.split(' ').length
    };
  }`
)
// 預期：{ gridTemplateColumns: "1fr", columns: 1 }

// 2. 測試 Tablet (768px)
browser_resize(width: 768, height: 1024)
browser_snapshot()

browser_evaluate(
  element: "main grid",
  ref: "s2e5",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return style.gridTemplateColumns.split(' ').length;
  }`
)
// 預期：2 (兩欄)

// 3. 測試 Desktop (1280px)
browser_resize(width: 1280, height: 800)
browser_snapshot()

browser_evaluate(
  element: "main grid",
  ref: "s3e5",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return style.gridTemplateColumns.split(' ').length;
  }`
)
// 預期：3 (三欄)
```

**範例：驗證導航列響應式**

```javascript
// Mobile - 應該顯示漢堡選單
browser_resize(width: 375, height: 667)
browser_snapshot()
// 應該看到：button "Menu" [ref=s1e1] (漢堡選單)

// Desktop - 應該顯示完整導航
browser_resize(width: 1280, height: 800)
browser_snapshot()
// 應該看到：navigation [ref=s2e1] 內有多個 link
```

---

### 5. 元件驗證

檢查常見 UI 元件的正確性。

#### 按鈕 (Button)

| 檢查項目 | 方法 |
|----------|------|
| 最小高度 44px | `evaluate()` offsetHeight |
| Padding 合理 | `evaluate()` padding |
| Hover 狀態 | `hover()` + `evaluate()` |
| Disabled 樣式 | `evaluate()` opacity, cursor |
| 載入狀態 | 檢查 spinner + disabled |

**範例**：

```javascript
browser_evaluate(
  element: "Primary button",
  ref: "s1e10",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      height: element.offsetHeight,
      padding: style.padding,
      minHeight: style.minHeight
    };
  }`
)
// 預期：{ height: 44, padding: "12px 24px", minHeight: "44px" }
```

#### 輸入框 (Input)

| 檢查項目 | 方法 |
|----------|------|
| Label 關聯 | 檢查 `for` 屬性 |
| Placeholder | snapshot 顯示 |
| Error 狀態 | aria-invalid + 紅色邊框 |
| Focus ring | `click()` + `evaluate()` outline |

**範例**：

```javascript
// 檢查 label 關聯
browser_snapshot()
// 應該看到：
// label "Email" [for=email]
// textbox "Email" [id=email, ref=s1e2]

// 檢查 error 狀態
browser_evaluate(
  element: "Email input",
  ref: "s1e2",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      ariaInvalid: element.getAttribute('aria-invalid'),
      borderColor: style.borderColor
    };
  }`
)
```

#### 下拉選單 (Select/Dropdown)

| 檢查項目 | 方法 |
|----------|------|
| 選項正確 | snapshot 查看所有選項 |
| 選中狀態 | `evaluate()` value |
| 下拉動畫 | `click()` + `wait_for()` |

**範例**：

```javascript
// 1. 點擊開啟下拉
browser_click(element: "Status dropdown", ref: "s1e5")

// 2. 等待選項出現
browser_wait_for(text: "Active")

// 3. Snapshot 查看選項
browser_snapshot()
// 應該看到：
// option "Active" [ref=s2e1]
// option "Inactive" [ref=s2e2]
// option "Pending" [ref=s2e3]
```

---

### 6. 圖表驗證

檢查圖表元件的正確性（適用於 ECharts, Chart.js 等）。

| 檢查項目 | 方法 |
|----------|------|
| 圖表顏色 | `evaluate()` 取得 series 顏色 |
| 座標軸標籤 | `evaluate()` 檢查 xAxis/yAxis |
| Tooltip 內容 | `hover()` + snapshot |
| 圖例正確 | snapshot 檢查 legend |
| 資料點數量 | `evaluate()` 計算 data.length |

**範例：驗證 ECharts 圖表**

```javascript
// 1. Snapshot 找到圖表容器
browser_snapshot()
// chart container [ref=s1e10]

// 2. 驗證圖表配置
browser_evaluate(
  element: "chart container",
  ref: "s1e10",
  function: `(element) => {
    // 假設使用 ECharts
    const chart = echarts.getInstanceByDom(element);
    if (!chart) return { error: 'No chart instance' };

    const option = chart.getOption();
    return {
      seriesCount: option.series.length,
      colors: option.color,
      xAxisType: option.xAxis[0]?.type,
      yAxisType: option.yAxis[0]?.type
    };
  }`
)
// 預期：
// {
//   seriesCount: 2,
//   colors: ["#3b82f6", "#10b981"],
//   xAxisType: "category",
//   yAxisType: "value"
// }
```

**範例：驗證 Tooltip**

```javascript
// 1. Hover 到資料點
browser_hover(element: "first data point", ref: "s1e15")

// 2. 等待 tooltip 出現
browser_wait_for(text: "2024-01-01")

// 3. Snapshot 檢查 tooltip 內容
browser_snapshot()
// 應該看到：
// tooltip [ref=s2e1]
//   - text "Date: 2024-01-01"
//   - text "Value: 1234"
```

---

## 完整驗證流程範例

以登入頁面為例：

```javascript
// ========== 1. 佈局驗證 ==========
browser_navigate(url: "http://localhost:3000/login")
browser_snapshot()

// 驗證容器寬度
browser_evaluate(
  element: "login container",
  ref: "s1e1",
  function: "(element) => element.clientWidth"
)
// ✅ 預期：≤ 400

// ========== 2. 視覺驗證 ==========
// 驗證主標題樣式
browser_evaluate(
  element: "Login heading",
  ref: "s1e2",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      color: style.color
    };
  }`
)
// ✅ 預期：{ fontSize: "31.25px", fontWeight: "600", color: "rgb(17, 24, 39)" }

// ========== 3. 互動狀態驗證 ==========
// 驗證 Focus 狀態
browser_click(element: "Email input", ref: "s1e3")
browser_evaluate(
  element: "Email input",
  ref: "s1e3",
  function: `(element) => {
    const style = window.getComputedStyle(element);
    return {
      outline: style.outline,
      isFocused: document.activeElement === element
    };
  }`
)
// ✅ 預期：outline 包含 "2px solid"

// 驗證 Error 狀態
browser_type(element: "Email input", ref: "s1e3", text: "invalid")
browser_click(element: "Login button", ref: "s1e5")
browser_wait_for(text: "Invalid email")
browser_snapshot()
// ✅ 應該看到 textbox "Email" [aria-invalid=true]

// 驗證 Loading 狀態
browser_type(element: "Email input", ref: "s1e3", text: "valid@example.com")
browser_click(element: "Login button", ref: "s1e5")
browser_snapshot()
// ✅ 應該看到 button "Logging in..." [aria-busy=true, disabled]

// ========== 4. 響應式驗證 ==========
browser_resize(width: 375, height: 667)
browser_snapshot()
// ✅ 驗證 mobile 佈局正確

// ========== 5. 無障礙驗證 ==========
browser_snapshot()
// ✅ 檢查所有 input 都有 label
// ✅ 檢查按鈕有明確文字
// ✅ 檢查 error 有 aria-invalid
```

---

## 驗證報告範本

```markdown
# UI 驗證報告 - [元件名稱]

**日期**：2024-01-12
**頁面**：/login
**設計規格**：openspec/changes/xxx/ui-specs/login-form.md

## 佈局驗證
- ✅ 容器最大寬度 400px
- ✅ 內部 padding 32px
- ✅ 元素間距 16px
- ❌ **問題**：標題與表單間距只有 12px（應為 24px）

## 視覺驗證
- ✅ 主標題 --text-2xl (31.25px)
- ✅ 主標題 --font-semibold (600)
- ✅ 主按鈕背景 --color-primary
- ✅ 主按鈕圓角 --radius-lg (12px)

## 狀態驗證
- ✅ Focus ring 正確顯示
- ✅ Error 狀態紅色邊框
- ✅ Loading 狀態顯示 spinner
- ❌ **問題**：Disabled 按鈕 opacity 為 0.5（應為 0.6）

## 響應式驗證
- ✅ Mobile (375px) 單欄佈局
- ✅ Desktop (1280px) 置中顯示

## 總結
- **通過**：10/12
- **失敗**：2/12
- **待修復**：標題間距、Disabled opacity
```

---

## Checklist 快速檢查表

開始驗證前，確認以下項目：

- [ ] 已讀取設計規格 (ui-specs/*.md)
- [ ] 已讀取 Design Tokens (tokens.md)
- [ ] 已讀取元件規格 (components.md)
- [ ] 準備截圖存證工具
- [ ] 準備驗證報告範本

驗證時：

- [ ] 佈局：容器寬度、間距、對齊
- [ ] 視覺：顏色、字體、邊框、圓角
- [ ] 狀態：Loading、Error、Hover、Focus、Disabled
- [ ] 響應式：Mobile、Tablet、Desktop
- [ ] 元件：按鈕、輸入框、下拉選單
- [ ] 圖表：顏色、標籤、Tooltip（如適用）
- [ ] 無障礙：Label、ARIA、對比度

驗證後：

- [ ] 產出驗證報告
- [ ] 截圖存證（失敗項目）
- [ ] 標記待修復問題
- [ ] 更新任務狀態
