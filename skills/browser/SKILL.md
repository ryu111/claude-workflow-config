---
name: browser
description: agent-browser CLI 瀏覽器自動化指南。E2E 測試、UI 調試、設計驗證。適用於需要實際操作瀏覽器的場景。
---

# agent-browser CLI Guide

使用 agent-browser CLI 進行瀏覽器自動化操作。

## 安裝

```bash
npm install -g agent-browser
agent-browser install  # 下載 Chromium
```

## Quick Reference

### 基本命令

| 命令 | 用途 |
|------|------|
| `open URL` | 導航到 URL |
| `snapshot -i` | 取得互動元素（含 @ref） |
| `click @ref` | 點擊元素 |
| `fill @ref "text"` | 填寫欄位 |
| `hover @ref` | 滑鼠懸停 |
| `select @ref "value"` | 選擇下拉選項 |
| `press Key` | 按鍵盤按鍵 |
| `eval "js"` | 執行 JavaScript |
| `screenshot file.png` | 截圖存檔 |
| `set viewport W H` | 調整視窗大小 |
| `wait "text"` | 等待文字出現 |
| `close` | 關閉瀏覽器 |

### 進階命令

| 命令 | 用途 |
|------|------|
| `network route <url>` | 攔截/阻擋/模擬請求 |
| `cookies` / `storage local` | 管理 Cookies / Storage |
| `dialog accept/dismiss` | 處理對話框 |
| `set device "iPhone 14"` | 裝置模擬 |
| `set media dark/light` | 深色/淺色模式 |
| `set geo <lat> <lng>` | 地理位置 |
| `set offline on/off` | 離線模式 |
| `tab new/close` | 多分頁管理 |
| `frame <selector>` | 切換 iframe |
| `trace start/stop` | 效能追蹤 |
| `upload @ref <file>` | 檔案上傳 |
| `console` / `errors` | 除錯訊息 |
| `state save/load` | 儲存/載入狀態 |

### 進階資源

| 文檔 | 用途 |
|------|------|
| **commands.md** | 完整命令參考（含所有參數） |
| **scenarios.md** | TESTER/DEBUGGER/DESIGNER 使用範例 |
| **ui-checklist.md** | 系統性 UI 驗證 Checklist |
| **ui-bugs.md** | 常見 UI Bug 類型與檢測方法 |
| **design-validation.md** | 設計規格驗證完整流程 |
| **workflow-integration.md** | 與 D→R→T 工作流整合指南 |

## 核心概念：@ref

**@ref** 是識別元素的關鍵。

```bash
# 1. 先執行 snapshot 取得 @refs
agent-browser snapshot -i

# 回傳範例：
# @e1: button "Submit"
# @e2: textbox "Email"
# @e3: textbox "Password"

# 2. 使用 @ref 操作元素
agent-browser fill @e2 "test@example.com"
agent-browser fill @e3 "password123"
agent-browser click @e1
```

**注意**：頁面變化後 @ref 會失效，需要重新執行 `snapshot -i`。

## 基本操作流程

```bash
# 1. 導航
agent-browser open https://example.com

# 2. 取得頁面結構和 @refs
agent-browser snapshot -i

# 3. 操作（使用 @ref）
agent-browser fill @e2 "user@test.com"
agent-browser fill @e3 "password"
agent-browser click @e1

# 4. 驗證結果
agent-browser snapshot -i
agent-browser eval "document.querySelector('.success')?.textContent"

# 5. 關閉
agent-browser close
```

## Snapshot 過濾選項

| 選項 | 用途 |
|------|------|
| `-i` | 只顯示互動元素（推薦） |
| `-c` | 緊湊模式 |
| `-d N` | 限制深度 |
| `-s selector` | 限定範圍 |

```bash
# 只看互動元素
agent-browser snapshot -i

# 限定某個區域
agent-browser snapshot -s "#login-form"
```

## 語義選擇器

除了 @ref，還可以用語義方式選擇元素：

```bash
# 按角色選擇
agent-browser find role button click --name "Submit"

# 按標籤選擇
agent-browser find label "Email" fill "test@test.com"

# 按文字選擇
agent-browser find text "Login" click
```

## Sessions（隔離瀏覽器實例）

```bash
# 使用獨立 session
agent-browser --session test1 open https://site-a.com
agent-browser --session test2 open https://site-b.com

# 各 session 有獨立的 cookies、localStorage
```

## 常用視窗尺寸

```bash
# Desktop
agent-browser set viewport 1920 1080

# Laptop
agent-browser set viewport 1366 768

# Tablet
agent-browser set viewport 768 1024

# Mobile
agent-browser set viewport 375 667
```

## 資源清理

```bash
# 關閉瀏覽器
agent-browser close

# 如有殘留進程
pkill -f "chromium|chrome" || true
```

---

## Next Steps

**完整命令參考**：
→ read `references/commands.md`

**使用場景範例**：
→ read `references/scenarios.md`

**UI 驗證 Checklist**：
→ read `references/ui-checklist.md`

**設計規格驗證**：
→ read `references/design-validation.md`

**與工作流整合**：
→ read `references/workflow-integration.md`
