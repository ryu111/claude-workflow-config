# agent-browser CLI 使用場景範例

各種實際使用情境的完整範例。

---

## TESTER - E2E 測試

### 登入功能測試

```bash
# Step 1: 導航到登入頁
agent-browser open http://localhost:3000/login

# Step 2: 取得頁面結構和 ref
agent-browser snapshot -i
# 回傳：
# @e1: heading "Login"
# @e2: textbox "Email"
# @e3: textbox "Password"
# @e4: button "Sign In"
# @e5: link "Forgot Password?"

# Step 3: 填寫表單（使用 Step 2 的 ref）
agent-browser fill @e2 "test@example.com"
agent-browser fill @e3 "password123"

# Step 4: 點擊登入按鈕
agent-browser click @e4

# Step 5: 等待頁面跳轉
agent-browser wait "Dashboard"

# Step 6: 驗證登入成功
agent-browser snapshot -i
# 回傳：
# @e1: heading "Dashboard"
# @e2: text "Welcome, test@example.com"
# @e3: navigation

# Step 7: 檢查是否有錯誤
agent-browser eval "console.error.toString()"
# 應該回傳空白或無錯誤訊息
```

### 表單驗證測試

```bash
# Step 1: 導航
agent-browser open http://localhost:3000/register

# Step 2: 取得結構
agent-browser snapshot -i
# @e1: textbox "Email"
# @e2: textbox "Password"
# @e3: button "Register"

# Step 3: 提交空表單（測試驗證）
agent-browser click @e3

# Step 4: 檢查錯誤訊息
agent-browser snapshot -i
# @e1: textbox "Email"
# @e4: text "Email is required"  ← 驗證訊息出現
# @e2: textbox "Password"
# @e5: text "Password is required"

# Step 5: 輸入無效 email
agent-browser fill @e1 "invalid-email"
agent-browser click @e3

# Step 6: 檢查 email 格式錯誤
agent-browser snapshot -i
# @e6: text "Please enter a valid email"
```

### API 整合測試

```bash
# Step 1: 導航到商品列表
agent-browser open http://localhost:3000/products

# Step 2: 等待資料載入（等待 Loading 訊息消失）
agent-browser wait --gone "Loading..."

# Step 3: 驗證商品顯示
agent-browser snapshot -i
# @e1: heading "Products"
# @e2: listitem "Product A - $29.99"
# @e3: listitem "Product B - $49.99"

# Step 4: 點擊商品查看詳情
agent-browser click @e2

# Step 5: 等待詳情頁載入
agent-browser wait --time 1000
agent-browser snapshot -i
# 驗證詳情頁內容已正確載入
```

---

## DEBUGGER - Bug 調查

### 調查「按鈕沒反應」問題

```bash
# Step 1: 導航到問題頁面
agent-browser open http://localhost:3000/checkout

# Step 2: 第一時間檢查 console 錯誤
agent-browser eval "
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args.join(' '));
  errors.length > 0 ? errors[0] : 'No errors'
"
# 回傳：["Uncaught TypeError: handleSubmit is not a function at form.js:42"]
# → 找到錯誤！handleSubmit 未定義

# Step 3: 檢查頁面狀態
agent-browser snapshot -i
# @e1: form
# @e2: button "Submit"

# Step 4: 檢查按鈕狀態
agent-browser eval "
  const btn = document.querySelector('button[type=submit]');
  JSON.stringify({disabled: btn.disabled, hasOnclick: !!btn.onclick})
"
# 回傳：{disabled: false, hasOnclick: false}
# → onclick 未綁定，事件沒綁定

# 結論：handleSubmit 函數未定義，檢查 import/export
```

### 調查「頁面空白」問題

```bash
# Step 1: 導航
agent-browser open http://localhost:3000/dashboard

# Step 2: 檢查 console 錯誤
agent-browser eval "
  const errors = [];
  window.addEventListener('error', (e) => errors.push(e.message));
  setTimeout(() => {}, 100);
  errors.length > 0 ? errors[0] : 'No JS errors'
"
# 回傳："Cannot read property 'name' of null at User.jsx:15"

# Step 3: 檢查 API 狀態（透過 Network API 模擬）
# 或檢查頁面內容
agent-browser snapshot -i
# 檢查是否有內容被渲染

# Step 4: 檢查 localStorage
agent-browser eval "localStorage.getItem('authToken')"
# 回傳：null
# → Token 不存在或已過期

# 結論：用戶未登入或 token 過期，API 返回 401，前端 crash
```

### 調查「資料不更新」問題

```bash
# Step 1: 導航到問題頁面
agent-browser open http://localhost:3000/cart

# Step 2: 取得初始狀態
agent-browser snapshot -i
# @e1: text "Total: $100"
# @e2: button "Add Item"

# Step 3: 執行操作
agent-browser click @e2

# Step 4: 等待並檢查
agent-browser wait --time 1000
agent-browser snapshot -i
# @e2_new: text "Total: $100"  ← 還是 $100，沒更新

# Step 5: 檢查 JS 狀態
agent-browser eval "
  if (window.__STORE__) {
    JSON.stringify(window.__STORE__.getState().cart);
  } else {
    'Store not found'
  }
"
# 回傳：{items: [{...}, {...}], total: 150}
# → Store 裡是 150，但 UI 顯示 100

# Step 6: 檢查 console 警告
agent-browser eval "
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  warnings.length > 0 ? warnings[0] : 'No warnings'
"
# 回傳："Cannot update a component from inside the function body of a different component"

# 結論：React 狀態更新有問題，可能是不正確的 setState 調用
```

---

## DESIGNER - 設計驗證

### 響應式設計驗證

```bash
# Step 1: 導航到頁面
agent-browser open http://localhost:3000

# Step 2: Desktop (1920x1080)
agent-browser set viewport 1920 1080
agent-browser snapshot -i
# @e1: navigation
# @e2: grid (3-column layout)
agent-browser screenshot home-desktop.png

# Step 3: Tablet (768x1024)
agent-browser set viewport 768 1024
agent-browser snapshot -i
# @e1: navigation  ← 還是水平
# @e2: grid (2-column layout)  ← 變成 2 欄
agent-browser screenshot home-tablet.png

# Step 4: Mobile (375x667)
agent-browser set viewport 375 667
agent-browser snapshot -i
# @e1: button "Menu"  ← 漢堡選單出現
# @e2: grid (1-column layout)  ← 變成 1 欄
agent-browser screenshot home-mobile.png
```

### 互動狀態驗證

```bash
# Step 1: 導航
agent-browser open http://localhost:3000
agent-browser snapshot -i
# @e1: button "Get Started"

# Step 2: Default 狀態截圖
agent-browser screenshot button-default.png

# Step 3: Hover 狀態
agent-browser hover @e1
agent-browser screenshot button-hover.png

# Step 4: Focus 狀態
agent-browser focus @e1
agent-browser screenshot button-focus.png
```

### 暗色模式驗證

```bash
# Step 1: 導航
agent-browser open http://localhost:3000
agent-browser snapshot -i
# @e1: button "Toggle Dark Mode"

# Step 2: Light mode 截圖
agent-browser screenshot theme-light.png

# Step 3: 切換到暗色模式
agent-browser click @e1
agent-browser wait --time 500  # 等待動畫

# Step 4: Dark mode 截圖
agent-browser screenshot theme-dark.png

# Step 5: 驗證 CSS 變數
agent-browser eval "
  getComputedStyle(document.body)
    .getPropertyValue('--background-color')
    .trim()
"
# 回傳："#1a1a1a" (暗色背景)
```

---

## 進階場景

### 需要登入的測試

```bash
# Step 1: 先登入
agent-browser open http://localhost:3000/login
agent-browser snapshot -i
# @e1: textbox "Email"
# @e2: textbox "Password"
# @e3: button "Login"

agent-browser fill @e1 "admin@example.com"
agent-browser fill @e2 "admin123"
agent-browser click @e3
agent-browser wait "Dashboard"

# Step 2: 現在可以訪問受保護頁面（瀏覽器保持登入狀態）
agent-browser open http://localhost:3000/admin/users
agent-browser snapshot -i
# @e1: heading "User Management"
# @e2: table
```

### 檔案上傳測試

```bash
# Step 1: 導航到上傳頁
agent-browser open http://localhost:3000/upload
agent-browser snapshot -i
# @e1: button "Choose File"
# @e2: button "Upload" (disabled)

# Step 2: 點擊選擇檔案
agent-browser click @e1

# Step 3: 使用 eval 模擬檔案輸入（或透過檔案選擇對話框）
# 注意：實際檔案上傳可能需要特殊處理
agent-browser eval "
  const input = document.querySelector('input[type=file]');
  // 模擬檔案選擇
  const file = new File(['test'], 'test-image.png', {type: 'image/png'});
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', {bubbles: true}));
"

# Step 4: 驗證檔案已選擇
agent-browser snapshot -i
# @e3: text "test-image.png"  ← 顯示檔名
# @e2: button "Upload"  ← 按鈕變可用

# Step 5: 點擊上傳
agent-browser click @e2
agent-browser wait "Upload successful"
```

### 處理對話框（Confirm/Alert）

```bash
# Step 1: 導航
agent-browser open http://localhost:3000/settings
agent-browser snapshot -i
# @e1: button "Delete Account"

# Step 2: 點擊刪除（會彈出 confirm）
# 注意：agent-browser 可透過 eval 處理對話框
agent-browser eval "
  window.confirmResult = null;
  const origConfirm = window.confirm;
  window.confirm = function(msg) {
    window.confirmResult = false;  // 點擊「取消」
    return false;
  };
"

agent-browser click @e1

# Step 3: 驗證帳號還在
agent-browser snapshot -i
# @e1: text "Account Settings"  ← 還在設定頁
```

### 下拉選單操作

```bash
# Step 1: 導航
agent-browser open http://localhost:3000/filters

# Step 2: 取得元素
agent-browser snapshot -i
# @e1: select "Category"
# @e2: button "Apply"

# Step 3: 點擊開啟下拉
agent-browser click @e1
agent-browser snapshot -i
# 檢查選項是否出現

# Step 4: 選擇選項
agent-browser select @e1 "electronics"

# Step 5: 驗證選擇
agent-browser get value @e1
# 回傳："electronics"
```

### 複雜表單填寫

```bash
# Step 1: 導航
agent-browser open http://localhost:3000/checkout

# Step 2: 取得表單元素
agent-browser snapshot -i
# @e1: textbox "Full Name"
# @e2: textbox "Email"
# @e3: textbox "Address"
# @e4: select "Country"
# @e5: checkbox "Subscribe"
# @e6: button "Place Order"

# Step 3: 依序填寫
agent-browser fill @e1 "John Doe"
agent-browser fill @e2 "john@example.com"
agent-browser fill @e3 "123 Main St, City, State"
agent-browser select @e4 "US"

# Step 4: 勾選選項
agent-browser check @e5

# Step 5: 提交
agent-browser click @e6
agent-browser wait "Order confirmed"
```

### 動態內容載入

```bash
# Step 1: 導航
agent-browser open http://localhost:3000/infinite-scroll

# Step 2: 初始快照
agent-browser snapshot -i
# @e1 - @e20: 前 20 項

# Step 3: 捲動載入更多
agent-browser scroll down 500
agent-browser wait --time 1000

# Step 4: 驗證新項目已載入
agent-browser snapshot -i
# @e1 - @e40: 現在有 40 項
```

### 鍵盤互動

```bash
# Step 1: 導航到搜尋
agent-browser open http://localhost:3000/search

# Step 2: 聚焦搜尋框
agent-browser snapshot -i
# @e1: textbox "Search"
agent-browser focus @e1

# Step 3: 輸入文字
agent-browser type @e1 "laptop"

# Step 4: 按 Enter 搜尋
agent-browser press Enter

# Step 5: 等待結果
agent-browser wait "Results"
agent-browser snapshot -i
```

