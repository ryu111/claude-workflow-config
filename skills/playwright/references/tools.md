# Playwright MCP Tools 詳解

每個 tool 的完整參數說明與使用範例。

## 導航與頁面

### browser_navigate

導航到指定 URL。

```
browser_navigate(url: "http://localhost:3000/login")
```

### browser_snapshot

取得頁面的 accessibility snapshot。**比截圖更有用**，因為：
- 回傳頁面結構（DOM tree）
- 包含元素的 `ref`，可用於後續操作
- 可以看到隱藏元素
- 純文字，context 佔用少

```
browser_snapshot()

# 回傳範例：
- navigation [ref=s1e1]
  - link "Home" [ref=s1e2]
  - link "About" [ref=s1e3]
- main [ref=s1e4]
  - heading "Welcome" [ref=s1e5]
  - textbox "Email" [ref=s1e6]
  - textbox "Password" [ref=s1e7]
  - button "Login" [ref=s1e8]
```

### browser_take_screenshot

截圖存檔。適合設計驗證、存證。

```
# 視窗截圖
browser_take_screenshot(filename: "screenshot.png")

# 整頁截圖（包含滾動區域）
browser_take_screenshot(filename: "full-page.png", fullPage: true)

# 特定元素截圖
browser_take_screenshot(
  element: "Login form",
  ref: "s1e4",
  filename: "login-form.png"
)

# JPEG 格式（較小檔案）
browser_take_screenshot(filename: "photo.jpeg", type: "jpeg")
```

### browser_resize

調整視窗大小。用於測試響應式設計。

```
# 常用尺寸

# Mobile iPhone SE
browser_resize(width: 375, height: 667)

# Mobile iPhone 14
browser_resize(width: 390, height: 844)

# Tablet iPad
browser_resize(width: 768, height: 1024)

# Laptop
browser_resize(width: 1366, height: 768)

# Desktop
browser_resize(width: 1920, height: 1080)
```

---

## 元素操作

### browser_click

點擊元素。需要 `element`（描述）和 `ref`（從 snapshot 取得）。

```
# 基本點擊
browser_click(
  element: "Submit button",
  ref: "s1e8"
)

# 雙擊
browser_click(
  element: "Item to edit",
  ref: "s1e12",
  doubleClick: true
)

# 右鍵（開啟 context menu）
browser_click(
  element: "File item",
  ref: "s1e15",
  button: "right"
)

# 帶修飾鍵的點擊
browser_click(
  element: "Link",
  ref: "s1e20",
  modifiers: ["Control"]  # Ctrl+Click 在新分頁開啟
)
```

### browser_type

在元素中輸入文字。

```
# 基本輸入
browser_type(
  element: "Email input",
  ref: "s1e6",
  text: "test@example.com"
)

# 輸入後按 Enter（提交搜尋）
browser_type(
  element: "Search box",
  ref: "s1e10",
  text: "query keyword",
  submit: true
)

# 慢速輸入（觸發每個按鍵的事件）
browser_type(
  element: "Autocomplete input",
  ref: "s1e11",
  text: "react",
  slowly: true
)
```

### browser_fill_form

一次填寫多個表單欄位。**推薦用於表單**。

```
browser_fill_form(fields: [
  {
    name: "Email",
    type: "textbox",
    ref: "s1e6",
    value: "test@example.com"
  },
  {
    name: "Password",
    type: "textbox",
    ref: "s1e7",
    value: "password123"
  },
  {
    name: "Remember me",
    type: "checkbox",
    ref: "s1e9",
    value: "true"
  },
  {
    name: "Country",
    type: "combobox",
    ref: "s1e10",
    value: "Taiwan"
  }
])
```

**Field types**:
- `textbox` - 文字輸入框
- `checkbox` - 核取方塊（value: "true" 或 "false"）
- `radio` - 單選按鈕
- `combobox` - 下拉選單（value 為選項文字）
- `slider` - 滑桿

### browser_hover

滑鼠懸停在元素上。用於觸發 hover 效果。

```
browser_hover(
  element: "Navigation menu",
  ref: "s1e3"
)

# 然後可以截圖 hover 狀態
browser_take_screenshot(filename: "menu-hover.png")
```

### browser_select_option

選擇下拉選單的選項。

```
# 單選
browser_select_option(
  element: "Country dropdown",
  ref: "s1e10",
  values: ["Taiwan"]
)

# 多選（如果下拉支援）
browser_select_option(
  element: "Tags",
  ref: "s1e15",
  values: ["JavaScript", "React", "TypeScript"]
)
```

### browser_press_key

按鍵盤按鍵。

```
# 單鍵
browser_press_key(key: "Enter")
browser_press_key(key: "Escape")
browser_press_key(key: "Tab")
browser_press_key(key: "ArrowDown")

# 組合鍵用 + 連接
browser_press_key(key: "Control+a")  # 全選
browser_press_key(key: "Control+c")  # 複製
browser_press_key(key: "Control+v")  # 貼上
browser_press_key(key: "Control+Shift+p")  # VSCode command palette
```

### browser_drag

拖放元素。

```
browser_drag(
  startElement: "Draggable item",
  startRef: "s1e20",
  endElement: "Drop zone",
  endRef: "s1e25"
)
```

---

## 偵錯工具

### browser_console_messages

取得瀏覽器 console 訊息。**Debug 必備！**

```
# 只看錯誤（最常用）
browser_console_messages(level: "error")

# 包含警告
browser_console_messages(level: "warning")

# 包含 info
browser_console_messages(level: "info")

# 所有訊息（包含 console.log）
browser_console_messages(level: "debug")
```

**Level 階層**：error < warning < info < debug
選擇較高層級會包含更嚴重的訊息。

### browser_network_requests

檢查網路請求。用於 debug API 問題。

```
# 只看 API 請求（預設）
browser_network_requests()

# 包含靜態資源（圖片、CSS、JS 等）
browser_network_requests(includeStatic: true)
```

**回傳範例**：
```
- GET http://localhost:3000/api/users → 200 OK
- POST http://localhost:3000/api/login → 401 Unauthorized
- GET http://localhost:3000/api/products/999 → 404 Not Found
```

### browser_evaluate

在頁面中執行 JavaScript。用於檢查變數狀態或執行自訂邏輯。

```
# 取得全域變數
browser_evaluate(function: "() => window.appState")

# 取得 localStorage
browser_evaluate(function: "() => localStorage.getItem('token')")

# 檢查元素屬性
browser_evaluate(function: "() => document.querySelector('.btn').disabled")

# 在特定元素上執行
browser_evaluate(
  element: "Submit button",
  ref: "s1e8",
  function: "(el) => el.getAttribute('data-loading')"
)

# 複雜邏輯
browser_evaluate(function: "() => { const items = document.querySelectorAll('.item'); return items.length; }")
```

---

## 等待與同步

### browser_wait_for

等待條件滿足。避免 race condition。

```
# 等待文字出現
browser_wait_for(text: "Welcome back!")

# 等待文字消失（例如 loading 結束）
browser_wait_for(textGone: "Loading...")

# 等待固定時間（秒）- 盡量避免，改用文字條件
browser_wait_for(time: 2)
```

---

## 分頁與對話框

### browser_tabs

分頁管理。

```
# 列出所有分頁
browser_tabs(action: "list")

# 新增分頁
browser_tabs(action: "new")

# 切換到特定分頁（index 從 0 開始）
browser_tabs(action: "select", index: 1)

# 關閉特定分頁
browser_tabs(action: "close", index: 2)

# 關閉當前分頁
browser_tabs(action: "close")
```

### browser_handle_dialog

處理 JavaScript 對話框（alert, confirm, prompt）。

```
# 接受 alert/confirm
browser_handle_dialog(accept: true)

# 拒絕 confirm
browser_handle_dialog(accept: false)

# 回應 prompt
browser_handle_dialog(accept: true, promptText: "My input text")
```

### browser_file_upload

上傳檔案。

```
# 單個檔案
browser_file_upload(paths: ["/Users/me/photo.png"])

# 多個檔案
browser_file_upload(paths: [
  "/Users/me/photo1.png",
  "/Users/me/photo2.png"
])

# 取消上傳
browser_file_upload()
```

---

## 其他

### browser_close

關閉瀏覽器。測試完成後應該關閉。

```
browser_close()
```

### browser_install

安裝瀏覽器。如果出現瀏覽器未安裝的錯誤，執行此命令。

```
browser_install()
```

### browser_navigate_back

返回上一頁。

```
browser_navigate_back()
```

### browser_run_code

執行自訂 Playwright 程式碼。進階使用。

```
browser_run_code(code: "async (page) => { await page.waitForTimeout(1000); return await page.title(); }")
```
