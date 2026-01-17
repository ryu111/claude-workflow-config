# agent-browser 完整命令參考

## 導航命令

### open

導航到指定 URL。

```bash
agent-browser open URL [options]
```

| 參數 | 說明 |
|------|------|
| URL | 目標網址 |
| `--headed` | 顯示瀏覽器視窗（預設 headless） |
| `--session NAME` | 使用指定 session |

```bash
# 基本使用
agent-browser open https://example.com

# 顯示瀏覽器
agent-browser open https://example.com --headed

# 使用獨立 session
agent-browser --session test open https://example.com
```

**Playwright MCP 對應**：`browser_navigate(url: "...")`

### back / forward / reload

瀏覽器導航操作。

```bash
agent-browser back      # 上一頁
agent-browser forward   # 下一頁
agent-browser reload    # 重新載入
```

**Playwright MCP 對應**：`browser_navigate_back()`

---

## 資訊取得

### snapshot

取得頁面可訪問性樹（Accessibility Tree）。

```bash
agent-browser snapshot [options]
```

| 選項 | 說明 |
|------|------|
| `-i` | 只顯示互動元素（推薦） |
| `-c` | 緊湊模式 |
| `-d N` | 限制深度 |
| `-s selector` | 限定 CSS 選擇器範圍 |

```bash
# 推薦：只看互動元素
agent-browser snapshot -i

# 限定某區域
agent-browser snapshot -s "#login-form" -i

# 緊湊模式，深度 3
agent-browser snapshot -c -d 3
```

**回傳範例**：
```
@e1: button "Submit"
@e2: textbox "Email"
@e3: textbox "Password"
@e4: link "Forgot password?"
```

**Playwright MCP 對應**：`browser_snapshot()`

### get text / html / value / attr

取得元素資訊。

```bash
agent-browser get text @ref          # 取得文字內容
agent-browser get html @ref          # 取得 HTML
agent-browser get value @ref         # 取得輸入值
agent-browser get attr @ref name     # 取得屬性值
```

```bash
# 取得按鈕文字
agent-browser get text @e1

# 取得輸入框的值
agent-browser get value @e2

# 取得 href 屬性
agent-browser get attr @e4 href
```

---

## 互動命令

### click / dblclick

點擊元素。

```bash
agent-browser click @ref
agent-browser dblclick @ref
```

```bash
# 點擊按鈕
agent-browser click @e1

# 雙擊
agent-browser dblclick @e1
```

**Playwright MCP 對應**：`browser_click(element: "...", ref: "e1")`

### type / fill

輸入文字。

```bash
agent-browser type @ref "text"    # 追加輸入
agent-browser fill @ref "text"    # 清除後輸入（推薦）
```

```bash
# 清除欄位後輸入（推薦用於表單）
agent-browser fill @e2 "user@example.com"

# 追加輸入
agent-browser type @e2 " additional text"
```

**Playwright MCP 對應**：`browser_fill_form([{ref: "e2", value: "..."}])`

### hover

滑鼠懸停。

```bash
agent-browser hover @ref
```

```bash
# 懸停查看 tooltip
agent-browser hover @e1
agent-browser snapshot -i  # 查看懸停後的狀態
```

**Playwright MCP 對應**：`browser_hover(element: "...", ref: "e1")`

### select

選擇下拉選項。

```bash
agent-browser select @ref "value"
```

```bash
# 選擇選項
agent-browser select @e5 "option-value"
```

**Playwright MCP 對應**：`browser_select_option(element: "...", ref: "e5", value: "...")`

### check / uncheck

勾選/取消勾選 checkbox。

```bash
agent-browser check @ref
agent-browser uncheck @ref
```

### focus

聚焦元素。

```bash
agent-browser focus @ref
```

### scroll

捲動頁面。

```bash
agent-browser scroll down 500    # 向下 500px
agent-browser scroll up 500      # 向上 500px
agent-browser scroll @ref        # 捲動到元素可見
```

### drag

拖曳元素。

```bash
agent-browser drag @source @target
```

**Playwright MCP 對應**：`browser_drag(startRef: "e1", endRef: "e2")`

---

## 鍵盤操作

### press

按鍵盤按鍵。

```bash
agent-browser press Key
```

常用按鍵：
- `Enter`, `Tab`, `Escape`
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`
- `Backspace`, `Delete`
- `Control+a`, `Control+c`, `Control+v`

```bash
# 按 Enter 送出表單
agent-browser press Enter

# 按 Tab 切換欄位
agent-browser press Tab

# 全選
agent-browser press Control+a
```

**Playwright MCP 對應**：`browser_press_key(key: "Enter")`

---

## 狀態檢查

### is visible / enabled / checked

檢查元素狀態。

```bash
agent-browser is visible @ref    # 是否可見
agent-browser is enabled @ref    # 是否啟用
agent-browser is checked @ref    # 是否勾選
```

---

## JavaScript 執行

### eval

執行 JavaScript 程式碼。

```bash
agent-browser eval "JavaScript code"
```

```bash
# 取得頁面標題
agent-browser eval "document.title"

# 取得 CSS 變數
agent-browser eval "getComputedStyle(document.documentElement).getPropertyValue('--color-primary')"

# 檢查元素樣式
agent-browser eval "getComputedStyle(document.querySelector('.btn')).backgroundColor"

# 取得 localStorage
agent-browser eval "localStorage.getItem('token')"

# 執行自訂邏輯
agent-browser eval "document.querySelectorAll('.item').length"
```

**Playwright MCP 對應**：`browser_evaluate(function: "() => ...")`

---

## 視窗與截圖

### set viewport

調整視窗大小。

```bash
agent-browser set viewport WIDTH HEIGHT
```

常用尺寸：
| 裝置 | 尺寸 |
|------|------|
| Desktop | 1920 1080 |
| Laptop | 1366 768 |
| Tablet | 768 1024 |
| Mobile | 375 667 |

```bash
# Desktop
agent-browser set viewport 1920 1080

# Mobile
agent-browser set viewport 375 667
```

**Playwright MCP 對應**：`browser_resize(width: 1920, height: 1080)`

### screenshot

截圖存檔。

```bash
agent-browser screenshot filename.png
```

```bash
# 截圖
agent-browser screenshot login-page.png

# 響應式測試截圖
agent-browser set viewport 1920 1080
agent-browser screenshot desktop.png
agent-browser set viewport 375 667
agent-browser screenshot mobile.png
```

**Playwright MCP 對應**：`browser_take_screenshot(filename: "...")`

### pdf

儲存為 PDF。

```bash
agent-browser pdf filename.pdf
```

---

## 等待

### wait

等待條件滿足。

```bash
agent-browser wait "text"           # 等待文字出現
agent-browser wait --gone "text"    # 等待文字消失
agent-browser wait --time 3000      # 等待 3 秒
```

```bash
# 等待載入完成
agent-browser wait "Welcome"

# 等待 loading 消失
agent-browser wait --gone "Loading..."

# 等待 3 秒
agent-browser wait --time 3000
```

**Playwright MCP 對應**：`browser_wait_for(text: "...", textGone: "...")`

---

## 語義選擇器

### find

使用語義方式選擇元素。

```bash
agent-browser find role ROLE [action] [options]
agent-browser find text "TEXT" [action]
agent-browser find label "LABEL" [action]
agent-browser find placeholder "TEXT" [action]
agent-browser find alt "TEXT" [action]
```

```bash
# 按角色找按鈕並點擊
agent-browser find role button click --name "Submit"

# 按標籤找輸入框並填寫
agent-browser find label "Email" fill "test@test.com"

# 按文字找連結並點擊
agent-browser find text "Login" click

# 按 placeholder 找輸入框
agent-browser find placeholder "Enter your email" fill "user@test.com"
```

---

## Session 管理

使用 `--session` 隔離瀏覽器實例，各 session 有獨立的：
- Cookies
- localStorage
- sessionStorage
- 瀏覽歷史

```bash
# 建立獨立 session
agent-browser --session user1 open https://app.com
agent-browser --session user2 open https://app.com

# 在不同 session 執行操作
agent-browser --session user1 fill @e1 "user1@test.com"
agent-browser --session user2 fill @e1 "user2@test.com"
```

---

## 網路控制

### 請求攔截

```bash
# 設定 HTTP headers
agent-browser --headers '{"Authorization": "Bearer token"}' open https://api.com

# 環境變數設定
AGENT_BROWSER_HEADERS='{"X-Custom": "value"}' agent-browser open https://example.com
```

---

## 關閉

### close

關閉瀏覽器。

```bash
agent-browser close
```

**Playwright MCP 對應**：`browser_close()`

---

## 全域選項

| 選項 | 說明 |
|------|------|
| `--session NAME` | 使用指定 session |
| `--headed` | 顯示瀏覽器視窗 |
| `--json` | 輸出 JSON 格式（機器可讀） |
| `--debug` | 除錯模式 |
| `--executable-path PATH` | 使用自訂瀏覽器 |

---

## 環境變數

| 變數 | 說明 |
|------|------|
| `AGENT_BROWSER_SESSION` | 預設 session 名稱 |
| `AGENT_BROWSER_EXECUTABLE_PATH` | 自訂瀏覽器路徑 |
| `AGENT_BROWSER_STREAM_PORT` | 串流預覽端口 |
