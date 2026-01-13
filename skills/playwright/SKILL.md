---
name: playwright
description: Playwright MCP Tools 完整指南。使用瀏覽器自動化進行 E2E 測試、UI 調試、設計驗證。適用於需要實際操作瀏覽器的場景。
---

# Playwright MCP Tools Guide

使用 Playwright plugin 進行瀏覽器自動化操作。

## Quick Reference

### Tools 列表

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

### UI 驗證資源

| 文檔 | 用途 |
|------|------|
| **ui-checklist.md** | 系統性 UI 驗證 Checklist（佈局、視覺、狀態、響應式） |
| **ui-bugs.md** | 常見 UI Bug 類型與 Playwright 檢測方法 |
| **design-validation.md** | 設計規格驗證完整流程（對照 ui-specs/*.md） |
| **workflow-integration.md** | 與 D→R→T 工作流整合（REVIEWER/TESTER 使用指南） |

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
      ↓
browser_close()                # 6. 測試完成後關閉（重要！）
```

## ⚡ 資源清理最佳實踐

### 瀏覽器管理

**測試完成後必須關閉瀏覽器**，避免殘留視窗：

```
# 測試結束時
browser_close()
```

### 應用程式啟動（如 Streamlit）

**啟動前先 kill 舊進程**，避免重複開啟：

```bash
# 啟動 Streamlit 前
pkill -f "streamlit run" 2>/dev/null
streamlit run app.py --server.port 8501 --server.headless true &
```

### 完整測試流程範例

```
# 1. 清理舊進程並啟動應用
Bash: pkill -f "streamlit run"; streamlit run ui/Home.py --server.headless true &

# 2. 等待應用啟動
Bash: sleep 3 && curl -s -o /dev/null -w "%{http_code}" http://localhost:8501

# 3. 執行測試
browser_navigate(url: "http://localhost:8501")
browser_snapshot()
# ... 測試操作 ...

# 4. 測試完成，關閉瀏覽器（重要！）
browser_close()
```

### 為什麼這很重要？

| 問題 | 原因 | 解決方案 |
|------|------|----------|
| 瀏覽器視窗不斷堆積 | 沒有呼叫 `browser_close()` | 測試完成後一定要關閉 |
| 應用重複啟動 | 沒有 kill 舊進程 | 啟動前先 `pkill` |
| Port 被佔用 | 舊應用還在運行 | 使用 `pkill` 清理 |
| 用戶被打擾 | 自動開啟太多視窗 | 使用 headless 模式 |

## 進階資源

### 基礎使用
- **Tools 詳解** → `references/tools.md`
- **使用場景範例** → `references/scenarios.md`
- **常見問題** → `references/faq.md`

### UI 驗證（必讀）
- **UI 驗證 Checklist** → `references/ui-checklist.md`
  - 佈局驗證（容器、間距、對齊）
  - 視覺驗證（顏色、字體、Design Token 使用）
  - 狀態驗證（Loading, Error, Hover, Focus）
  - 響應式驗證（各斷點）
  - 元件驗證（按鈕、輸入框、下拉選單）
  - 圖表驗證（ECharts, Chart.js）

- **常見 UI Bug 與檢測** → `references/ui-bugs.md`
  - 佈局問題（溢出、重疊、對齊錯誤）
  - 顏色問題（不一致、對比度不足）
  - 字體問題（大小、粗細錯誤）
  - 間距問題（padding/margin 錯誤）
  - 響應式問題（斷點行為錯誤）
  - 狀態問題（Hover, Focus, Disabled）
  - 圖表問題（顏色、圖例、Tooltip）

- **設計規格驗證流程** → `references/design-validation.md`
  - 讀取設計規格（ui-specs/*.md, tokens.md）
  - 建立驗證計畫（提取驗證點）
  - 執行視覺驗證（Design Token 使用）
  - 執行互動驗證（Hover, Focus, Loading, Error）
  - 執行響應式驗證（Mobile, Desktop）
  - 產出驗證報告（通過/失敗項目）

- **工作流整合指南** → `references/workflow-integration.md`
  - REVIEWER 如何使用 Playwright
  - TESTER 如何使用 Playwright
  - 強制規則（UI 變更必須驗證）
  - 截圖存證要求
  - 完整 D→R→T 範例
