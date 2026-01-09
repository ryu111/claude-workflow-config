---
name: playwright
description: Playwright MCP Tools 完整指南。使用瀏覽器自動化進行 E2E 測試、UI 調試、設計驗證。適用於需要實際操作瀏覽器的場景。
---

# Playwright MCP Tools Guide

使用 Playwright plugin 進行瀏覽器自動化操作。

## Quick Reference

| Tool | 用途 |
|------|------|
| `browser_navigate` | 導航到 URL |
| `browser_snapshot` | 取得頁面結構（含 ref） |
| `browser_click` | 點擊元素 |
| `browser_type` | 輸入文字 |
| `browser_fill_form` | 填寫表單（推薦） |
| `browser_hover` | 滑鼠懸停 |
| `browser_select_option` | 選擇下拉選項 |
| `browser_press_key` | 按鍵盤按鍵 |
| `browser_evaluate` | 執行 JavaScript |
| `browser_console_messages` | 取得 console 訊息 |
| `browser_network_requests` | 取得網路請求 |
| `browser_take_screenshot` | 截圖存檔 |
| `browser_resize` | 調整視窗大小 |
| `browser_wait_for` | 等待文字/時間 |
| `browser_tabs` | 分頁管理 |
| `browser_close` | 關閉瀏覽器 |

## 核心概念：ref

**ref** 是 Playwright MCP 中識別元素的關鍵。

```
# 1. 先執行 snapshot 取得 ref
browser_snapshot()

# 回傳範例：
- heading "Login" [ref=s1e1]
- textbox "Email" [ref=s1e2]
- button "Submit" [ref=s1e3]

# 2. 使用 ref 操作元素
browser_click(element: "Submit", ref: "s1e3")
browser_type(element: "Email", ref: "s1e2", text: "test@example.com")
```

**重要**：每次頁面變化後，ref 會改變，需要重新 snapshot！

## 基本操作流程

```
browser_navigate(url: "...")   # 1. 導航
      ↓
browser_snapshot()             # 2. 取得結構和 ref
      ↓
browser_click/type/fill_form   # 3. 操作（使用 ref）
      ↓
browser_snapshot()             # 4. 驗證結果
      ↓
browser_console_messages()     # 5. 檢查錯誤
```

## 進階資源

- **Tools 詳解** → `references/tools.md`
- **使用場景範例** → `references/scenarios.md`
- **常見問題** → `references/faq.md`
