# Playwright 常見問題

---

## 基本概念

### Q: snapshot vs screenshot？

**browser_snapshot**（推薦）：
- 回傳頁面結構（accessibility tree）
- 包含元素的 `ref`，可用於後續操作
- 純文字，context 佔用少
- 可以看到元素的狀態（disabled, checked 等）

**browser_take_screenshot**：
- 視覺圖片
- 適合設計驗證、存證
- 檔案較大
- 無法用於操作

**建議**：操作用 snapshot，存證用 screenshot。

---

### Q: 如何取得元素的 ref？

1. 執行 `browser_snapshot()`
2. 從回傳結果找到目標元素
3. 使用該元素的 `[ref=X]` 值

```
browser_snapshot()
# 回傳：
# - button "Submit" [ref=s1e5]
#                        ↑ 這是 ref

browser_click(element: "Submit", ref: "s1e5")
```

---

### Q: ref 會變嗎？

**會！** 每次頁面內容變化，ref 都會重新計算。

```
# 頁面 A
browser_snapshot()
# - button "Next" [ref=s1e3]

browser_click(element: "Next", ref: "s1e3")

# 頁面變了，舊的 ref 失效
browser_snapshot()  # 必須重新取得
# - button "Back" [ref=s2e1]  ← 新的 ref
```

**最佳實踐**：每次操作後都 snapshot，確保 ref 是最新的。

---

## 操作問題

### Q: 元素找不到怎麼辦？

1. **確認元素存在**：執行 `browser_snapshot()` 檢查
2. **等待載入**：`browser_wait_for(text: "...")` 或 `browser_wait_for(textGone: "Loading...")`
3. **滾動到可見**：Playwright 會自動滾動，通常不需手動處理
4. **檢查 iframe**：Playwright MCP 目前不支援 iframe 內的操作

---

### Q: 如何處理動態內容？

使用 `browser_wait_for` 等待內容出現：

```
# 等待資料載入完成
browser_navigate(url: "/products")
browser_wait_for(textGone: "Loading...")
browser_wait_for(text: "Product")
browser_snapshot()
```

---

### Q: 如何輸入特殊字元？

使用 `browser_press_key`：

```
# Tab 鍵
browser_press_key(key: "Tab")

# Enter 鍵
browser_press_key(key: "Enter")

# Escape 鍵
browser_press_key(key: "Escape")

# 方向鍵
browser_press_key(key: "ArrowDown")
browser_press_key(key: "ArrowUp")

# 組合鍵
browser_press_key(key: "Control+a")  # 全選
browser_press_key(key: "Control+c")  # 複製
browser_press_key(key: "Control+v")  # 貼上
```

---

### Q: 如何處理需要登入的頁面？

瀏覽器會保持 session，登入一次後就可以訪問受保護頁面：

```
# 1. 登入
browser_navigate(url: "/login")
browser_fill_form(fields: [...])
browser_click(element: "Login", ref: "...")
browser_wait_for(text: "Dashboard")

# 2. 現在可以訪問受保護頁面
browser_navigate(url: "/admin/settings")
# 不會被 redirect 到登入頁
```

---

### Q: 如何處理彈出視窗？

使用 `browser_handle_dialog`：

```
# 接受 alert
browser_handle_dialog(accept: true)

# 拒絕 confirm
browser_handle_dialog(accept: false)

# 回應 prompt
browser_handle_dialog(accept: true, promptText: "my input")
```

**注意**：需要在觸發對話框的操作**之前**設定。

---

## 偵錯技巧

### Q: 頁面載入失敗怎麼排查？

```
# 1. 檢查 console 錯誤
browser_console_messages(level: "error")

# 2. 檢查網路請求
browser_network_requests()

# 3. 檢查頁面內容
browser_snapshot()
```

---

### Q: API 請求失敗怎麼排查？

```
browser_network_requests()
# 回傳：
# - GET /api/data → 500 Internal Server Error
# - POST /api/submit → 401 Unauthorized
```

根據 status code 判斷問題：
- 401/403 → 認證/授權問題
- 404 → API endpoint 錯誤
- 500 → 後端錯誤
- CORS error → 跨域問題

---

### Q: JavaScript 執行結果怎麼看？

使用 `browser_evaluate`：

```
# 檢查全域變數
browser_evaluate(function: "() => window.myApp.state")

# 檢查 localStorage
browser_evaluate(function: "() => JSON.parse(localStorage.getItem('user'))")

# 檢查 DOM
browser_evaluate(function: "() => document.querySelectorAll('.item').length")
```

---

## 效能與最佳實踐

### Q: 測試太慢怎麼辦？

1. **減少不必要的 wait**：用 `browser_wait_for(text: ...)` 取代 `browser_wait_for(time: ...)`
2. **合併操作**：用 `browser_fill_form` 一次填多個欄位
3. **只截必要的圖**：screenshot 較慢，只在需要時使用

---

### Q: 測試完成後要做什麼？

```
# 關閉瀏覽器，釋放資源
browser_close()
```

---

### Q: 瀏覽器未安裝怎麼辦？

如果出現 "browser not installed" 錯誤：

```
browser_install()
```

這會安裝 Chromium 瀏覽器。

---

## 限制

### Q: 有什麼做不到的？

1. **iframe 內操作**：目前不支援
2. **多視窗**：只能操作當前視窗
3. **原生對話框**：如系統檔案選擇器，需用 `browser_file_upload`
4. **瀏覽器擴充功能**：不支援

---

### Q: 支援哪些瀏覽器？

目前只支援 Chromium。
