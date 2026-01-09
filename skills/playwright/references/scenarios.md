# Playwright 使用場景範例

各種實際使用情境的完整範例。

---

## TESTER - E2E 測試

### 登入功能測試

```
# Step 1: 導航到登入頁
browser_navigate(url: "http://localhost:3000/login")

# Step 2: 取得頁面結構和 ref
browser_snapshot()
# 回傳：
# - heading "Login" [ref=s1e1]
# - textbox "Email" [ref=s1e2]
# - textbox "Password" [ref=s1e3]
# - button "Sign In" [ref=s1e4]
# - link "Forgot Password?" [ref=s1e5]

# Step 3: 填寫表單（使用 Step 2 的 ref）
browser_fill_form(fields: [
  {name: "Email", type: "textbox", ref: "s1e2", value: "test@example.com"},
  {name: "Password", type: "textbox", ref: "s1e3", value: "password123"}
])

# Step 4: 點擊登入按鈕
browser_click(element: "Sign In button", ref: "s1e4")

# Step 5: 等待頁面跳轉
browser_wait_for(text: "Dashboard")

# Step 6: 驗證登入成功
browser_snapshot()
# 回傳：
# - heading "Dashboard" [ref=s2e1]
# - text "Welcome, test@example.com" [ref=s2e2]
# - navigation [ref=s2e3]

# Step 7: 檢查是否有錯誤
browser_console_messages(level: "error")
# 回傳：[] (空陣列 = 測試通過)
```

### 表單驗證測試

```
# Step 1: 導航
browser_navigate(url: "http://localhost:3000/register")

# Step 2: 取得結構
browser_snapshot()
# - textbox "Email" [ref=s1e1]
# - textbox "Password" [ref=s1e2]
# - button "Register" [ref=s1e3]

# Step 3: 提交空表單（測試驗證）
browser_click(element: "Register button", ref: "s1e3")

# Step 4: 檢查錯誤訊息
browser_snapshot()
# - textbox "Email" [ref=s1e1]
# - text "Email is required" [ref=s1e4]  ← 驗證訊息出現
# - textbox "Password" [ref=s1e2]
# - text "Password is required" [ref=s1e5]

# Step 5: 輸入無效 email
browser_type(element: "Email", ref: "s1e1", text: "invalid-email")
browser_click(element: "Register button", ref: "s1e3")

# Step 6: 檢查 email 格式錯誤
browser_snapshot()
# - text "Please enter a valid email" [ref=s1e6]
```

### API 整合測試

```
# Step 1: 導航到商品列表
browser_navigate(url: "http://localhost:3000/products")

# Step 2: 等待資料載入
browser_wait_for(textGone: "Loading...")

# Step 3: 檢查 API 請求
browser_network_requests()
# - GET /api/products → 200 OK

# Step 4: 驗證商品顯示
browser_snapshot()
# - heading "Products" [ref=s1e1]
# - listitem "Product A - $29.99" [ref=s1e2]
# - listitem "Product B - $49.99" [ref=s1e3]

# Step 5: 點擊商品查看詳情
browser_click(element: "Product A", ref: "s1e2")

# Step 6: 檢查詳情頁 API
browser_network_requests()
# - GET /api/products/1 → 200 OK
```

---

## DEBUGGER - Bug 調查

### 調查「按鈕沒反應」問題

```
# Step 1: 導航到問題頁面
browser_navigate(url: "http://localhost:3000/checkout")

# Step 2: 第一時間檢查 console 錯誤
browser_console_messages(level: "error")
# 回傳：["Uncaught TypeError: handleSubmit is not a function at form.js:42"]
# → 找到錯誤！handleSubmit 未定義

# Step 3: 檢查頁面狀態
browser_snapshot()
# - form [ref=s1e1]
# - button "Submit" [ref=s1e2]

# Step 4: 檢查按鈕狀態
browser_evaluate(
  element: "Submit button",
  ref: "s1e2",
  function: "(el) => ({ disabled: el.disabled, onclick: typeof el.onclick })"
)
# 回傳：{disabled: false, onclick: "undefined"}
# → onclick 是 undefined，事件沒綁定

# 結論：handleSubmit 函數未定義，檢查 import/export
```

### 調查「頁面空白」問題

```
# Step 1: 導航
browser_navigate(url: "http://localhost:3000/dashboard")

# Step 2: 檢查 console 錯誤
browser_console_messages(level: "error")
# 回傳：["Error: Cannot read property 'name' of null at User.jsx:15"]

# Step 3: 檢查 API 請求
browser_network_requests()
# - GET /api/user/profile → 401 Unauthorized  ← 問題在這裡！

# Step 4: 檢查 localStorage
browser_evaluate(function: "() => localStorage.getItem('authToken')")
# 回傳：null
# → Token 不存在或已過期

# 結論：用戶未登入或 token 過期，API 返回 401，前端 crash
```

### 調查「資料不更新」問題

```
# Step 1: 導航到問題頁面
browser_navigate(url: "http://localhost:3000/cart")

# Step 2: 取得初始狀態
browser_snapshot()
# - text "Total: $100" [ref=s1e1]
# - button "Add Item" [ref=s1e2]

# Step 3: 執行操作
browser_click(element: "Add Item", ref: "s1e2")

# Step 4: 等待並檢查
browser_wait_for(time: 1)
browser_snapshot()
# - text "Total: $100" [ref=s2e1]  ← 還是 $100，沒更新

# Step 5: 檢查 JS 狀態
browser_evaluate(function: "() => window.__STORE__.getState().cart")
# 回傳：{items: [{...}, {...}], total: 150}
# → Store 裡是 150，但 UI 顯示 100

# Step 6: 檢查 console
browser_console_messages(level: "warning")
# 回傳：["Warning: Cannot update a component from inside the function body of a different component"]

# 結論：React 狀態更新有問題，可能是不正確的 setState 調用
```

---

## DESIGNER - 設計驗證

### 響應式設計驗證

```
# Step 1: 導航到頁面
browser_navigate(url: "http://localhost:3000")

# Step 2: Desktop (1920x1080)
browser_resize(width: 1920, height: 1080)
browser_snapshot()
# - navigation horizontal [ref=s1e1]
# - grid 3-column layout [ref=s1e2]
browser_take_screenshot(filename: "home-desktop.png")

# Step 3: Tablet (768x1024)
browser_resize(width: 768, height: 1024)
browser_snapshot()
# - navigation horizontal [ref=s2e1]  ← 還是水平
# - grid 2-column layout [ref=s2e2]   ← 變成 2 欄
browser_take_screenshot(filename: "home-tablet.png")

# Step 4: Mobile (375x667)
browser_resize(width: 375, height: 667)
browser_snapshot()
# - button "Menu" [ref=s3e1]           ← 漢堡選單出現
# - grid 1-column layout [ref=s3e2]    ← 變成 1 欄
browser_take_screenshot(filename: "home-mobile.png")
```

### 互動狀態驗證

```
# Step 1: 導航
browser_navigate(url: "http://localhost:3000")
browser_snapshot()
# - button "Get Started" [ref=s1e1]

# Step 2: Default 狀態截圖
browser_take_screenshot(filename: "button-default.png")

# Step 3: Hover 狀態
browser_hover(element: "Get Started button", ref: "s1e1")
browser_take_screenshot(filename: "button-hover.png")

# Step 4: Focus 狀態
browser_click(element: "Get Started button", ref: "s1e1")
# 如果按鈕不會跳轉，可以截圖 focus 狀態
browser_take_screenshot(filename: "button-focus.png")
```

### 暗色模式驗證

```
# Step 1: 導航
browser_navigate(url: "http://localhost:3000")
browser_snapshot()
# - button "Toggle Dark Mode" [ref=s1e1]

# Step 2: Light mode 截圖
browser_take_screenshot(filename: "theme-light.png")

# Step 3: 切換到暗色模式
browser_click(element: "Toggle Dark Mode", ref: "s1e1")
browser_wait_for(time: 0.5)  # 等待動畫

# Step 4: Dark mode 截圖
browser_take_screenshot(filename: "theme-dark.png")

# Step 5: 驗證 CSS 變數
browser_evaluate(function: "() => getComputedStyle(document.body).getPropertyValue('--background-color')")
# 回傳："#1a1a1a" (暗色背景)
```

---

## 進階場景

### 需要登入的測試

```
# Step 1: 先登入
browser_navigate(url: "http://localhost:3000/login")
browser_snapshot()
# - textbox "Email" [ref=s1e1]
# - textbox "Password" [ref=s1e2]
# - button "Login" [ref=s1e3]

browser_fill_form(fields: [
  {name: "Email", type: "textbox", ref: "s1e1", value: "admin@example.com"},
  {name: "Password", type: "textbox", ref: "s1e2", value: "admin123"}
])
browser_click(element: "Login", ref: "s1e3")
browser_wait_for(text: "Dashboard")

# Step 2: 現在可以訪問受保護頁面（瀏覽器保持登入狀態）
browser_navigate(url: "http://localhost:3000/admin/users")
browser_snapshot()
# - heading "User Management" [ref=s2e1]
# - table [ref=s2e2]
```

### 檔案上傳測試

```
# Step 1: 導航到上傳頁
browser_navigate(url: "http://localhost:3000/upload")
browser_snapshot()
# - button "Choose File" [ref=s1e1]
# - button "Upload" disabled [ref=s1e2]

# Step 2: 點擊選擇檔案（會觸發 file input）
browser_click(element: "Choose File", ref: "s1e1")

# Step 3: 上傳檔案
browser_file_upload(paths: ["/tmp/test-image.png"])

# Step 4: 驗證檔案已選擇
browser_snapshot()
# - text "test-image.png" [ref=s2e1]  ← 顯示檔名
# - button "Upload" [ref=s2e2]         ← 按鈕變可用

# Step 5: 點擊上傳
browser_click(element: "Upload", ref: "s2e2")
browser_wait_for(text: "Upload successful")
```

### 處理對話框

```
# Step 1: 導航
browser_navigate(url: "http://localhost:3000/settings")
browser_snapshot()
# - button "Delete Account" [ref=s1e1]

# Step 2: 點擊刪除（會彈出 confirm）
browser_click(element: "Delete Account", ref: "s1e1")

# Step 3: 處理 confirm 對話框
browser_handle_dialog(accept: false)  # 點擊「取消」

# Step 4: 驗證帳號還在
browser_snapshot()
# - text "Account Settings" [ref=s2e1]  ← 還在設定頁
```
