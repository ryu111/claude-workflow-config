# agent-browser CLI 常見問題

---

## 基本概念

### Q: snapshot vs screenshot？

**agent-browser snapshot -i**（推薦）：
- 回傳頁面結構（accessibility tree）
- 包含元素的 ref，可用於後續操作
- 純文字，context 佔用少
- 可以看到元素的狀態（disabled, checked 等）

**agent-browser screenshot**：
- 視覺圖片
- 適合設計驗證、存證
- 檔案較大
- 無法用於操作

**建議**：操作用 snapshot，存證用 screenshot。

---

### Q: 如何取得元素的 ref？

1. 執行 `agent-browser snapshot -i`
2. 從回傳結果找到目標元素
3. 使用該元素的 `[ref=X]` 值

```
agent-browser snapshot -i
# 回傳：
# - button "Submit" [ref=s1e5]
#                        ↑ 這是 ref

agent-browser click @s1e5
```

---

### Q: ref 會變嗎？

**會！** 每次頁面內容變化，ref 都會重新計算。

```
# 頁面 A
agent-browser snapshot -i
# - button "Next" [ref=s1e3]

agent-browser click @s1e3

# 頁面變了，舊的 ref 失效
agent-browser snapshot -i  # 必須重新取得
# - button "Back" [ref=s2e1]  ← 新的 ref
```

**最佳實踐**：每次操作後都 snapshot，確保 ref 是最新的。

---

## 操作問題

### Q: 元素找不到怎麼辦？

1. **確認元素存在**：執行 `agent-browser snapshot -i` 檢查
2. **等待載入**：`agent-browser wait "text"` 或使用 `--gone` 選項
3. **滾動到可見**：agent-browser 會自動滾動，通常不需手動處理
4. **檢查 iframe**：agent-browser 目前不支援 iframe 內的操作

---

### Q: 如何處理動態內容？

使用 `agent-browser wait` 等待內容出現：

```
# 等待資料載入完成
agent-browser open /products
agent-browser wait "Loading..." --gone
agent-browser wait "Product"
agent-browser snapshot -i
```

---

### Q: 如何輸入特殊字元？

使用 `agent-browser key`：

```
# Tab 鍵
agent-browser key Tab

# Enter 鍵
agent-browser key Enter

# Escape 鍵
agent-browser key Escape

# 方向鍵
agent-browser key ArrowDown
agent-browser key ArrowUp

# 組合鍵
agent-browser key Control+a  # 全選
agent-browser key Control+c  # 複製
agent-browser key Control+v  # 貼上
```

---

### Q: 如何處理需要登入的頁面？

瀏覽器會保持 session，登入一次後就可以訪問受保護頁面：

```
# 1. 登入
agent-browser open /login
agent-browser fill @ref1 "username"
agent-browser fill @ref2 "password"
agent-browser click @ref3
agent-browser wait "Dashboard"

# 2. 現在可以訪問受保護頁面
agent-browser open /admin/settings
# 不會被 redirect 到登入頁
```

---

### Q: 如何處理彈出視窗？

使用對話框操作：

```
# 接受 alert
agent-browser dialog accept

# 拒絕 confirm
agent-browser dialog dismiss

# 回應 prompt
agent-browser dialog respond "my input"
```

**注意**：需要在觸發對話框的操作**之前**設定。

---

## 偵錯技巧

### Q: 頁面載入失敗怎麼排查？

```
# 1. 檢查 console 錯誤
agent-browser console --level error

# 2. 檢查網路請求
agent-browser network list

# 3. 檢查頁面內容
agent-browser snapshot -i
```

---

### Q: API 請求失敗怎麼排查？

```
agent-browser network list
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

使用 `agent-browser eval`：

```
# 檢查全域變數
agent-browser eval "window.myApp.state"

# 檢查 localStorage
agent-browser eval "JSON.parse(localStorage.getItem('user'))"

# 檢查 DOM
agent-browser eval "document.querySelectorAll('.item').length"
```

---

## 效能與最佳實踐

### Q: 測試太慢怎麼辦？

1. **減少不必要的 wait**：用 `agent-browser wait "text"` 取代固定延遲
2. **合併操作**：用 `agent-browser fill` 逐個填欄位（或使用編程界面）
3. **只截必要的圖**：screenshot 較慢，只在需要時使用

---

### Q: 測試完成後要做什麼？

```
# 關閉瀏覽器，釋放資源
agent-browser close
```

---

### Q: 瀏覽器未安裝怎麼辦？

如果出現 "browser not installed" 錯誤：

```
agent-browser install
```

這會安裝 Chromium 瀏覽器。

---

## 限制

### Q: 有什麼做不到的？

1. **iframe 內操作**：目前不支援
2. **多視窗**：只能操作當前視窗
3. **原生對話框**：如系統檔案選擇器，需用 `agent-browser upload`
4. **瀏覽器擴充功能**：不支援

---

### Q: 支援哪些瀏覽器？

目前只支援 Chromium。
