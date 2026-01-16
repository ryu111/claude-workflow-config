# Hooks Registry - 全域 Hooks 統整說明

## 目錄結構

```
~/.claude/hooks/
├── core/                  # 核心生命週期 hooks（Memory 系統）
│   ├── session-start.js   # Session 開始時載入記憶
│   ├── session-end.js     # Session 結束時儲存洞察
│   ├── mid-conversation.js # 對話中分析
│   ├── permission-request.js # MCP 權限自動化
│   ├── auto-capture-hook.js  # 自動捕獲重要操作
│   ├── memory-retrieval.js   # 記憶檢索
│   └── topic-change.js       # 主題變更偵測
│
├── workflow/              # 工作流相關 hooks
│   ├── check-archive.sh   # 檢查未歸檔的 OpenSpec 變更
│   ├── remind-review.sh   # 提醒呼叫 REVIEWER 和 TESTER
│   └── tech-debt-reminder.sh # 技術債提醒
│
├── memory/                # Memory 工具
│   └── memory-mode-controller.js # 記憶模式控制命令列工具
│
├── skills/                # Skills 相關
│   └── inject-skills.sh   # 注入 Skills 到 subagent context
│
├── ui/                    # UI 相關
│   └── statusline.sh      # 狀態列顯示 memory/git 資訊
│
├── utilities/             # 工具函數庫
│   ├── memory-client.js
│   ├── project-detector.js
│   ├── git-analyzer.js
│   └── ...（16 個工具模組）
│
├── tests/                 # 測試檔案
│   ├── integration-test.js
│   └── test-*.js
│
├── config.json            # Memory hooks 配置
├── README.md              # Memory Awareness Hooks 說明
└── HOOKS-REGISTRY.md      # 本文件
```

---

## 已註冊 Hooks（settings.json）

### SessionStart

| Hook | 路徑 | 功能 | Timeout |
|------|------|------|---------|
| inject-skills | `skills/inject-skills.sh` | 注入 Skills 到 subagent context | - |
| session-start | `core/session-start.js` | 載入相關記憶、初始化 session | 10s |

**執行順序**：inject-skills → session-start

### SessionEnd

| Hook | 路徑 | 功能 | Timeout |
|------|------|------|---------|
| session-end | `core/session-end.js` | 儲存 session 洞察到 Memory | 15s |
| check-archive | `workflow/check-archive.sh` | 檢查未歸檔的 OpenSpec 變更 | 3s |
| cleanup-python | `workflow/cleanup-python.sh` | 清理殘留的 Python 進程 | 2s |

**執行順序**：session-end → check-archive → cleanup-python

### PreToolUse

| Hook | Matcher | 路徑 | 功能 | Timeout |
|------|---------|------|------|---------|
| permission-request | `mcp__` | `core/permission-request.js` | MCP 工具權限自動化 | 5s |

### UserPromptSubmit

| Hook | 路徑 | 功能 | Timeout |
|------|------|------|---------|
| mid-conversation | `core/mid-conversation.js` | 對話中間分析、上下文切換偵測 | 8s |

### PostToolUse

| Hook | Matchers | 路徑 | 功能 | Timeout |
|------|----------|------|------|---------|
| auto-capture | Edit, Write, Bash | `core/auto-capture-hook.js` | 自動捕獲重要操作到 Memory | 5s |
| remind-review | Edit, Write | `workflow/remind-review.sh` | 提醒 D→R→T + 回歸測試 | 2s |
| tech-debt-reminder | Read, Grep | `workflow/tech-debt-reminder.sh` | 技術債提醒（發現問題即修復） | 2s |

---

## 邏輯關係分析

### 協作關係

```
┌─────────────────────────────────────────────────────────────────┐
│                        Memory 系統                               │
│  session-start → mid-conversation → auto-capture → session-end  │
│       ↓                   ↓               ↓             ↓       │
│    載入記憶          分析對話        捕獲操作       儲存洞察    │
└─────────────────────────────────────────────────────────────────┘
                              +
┌─────────────────────────────────────────────────────────────────┐
│                      Workflow 提醒系統                           │
│  remind-review ──→ 提醒 D→R→T 規則                              │
│  tech-debt-reminder ──→ 提醒修復問題                             │
│  check-archive ──→ 提醒歸檔 OpenSpec                            │
└─────────────────────────────────────────────────────────────────┘
                              +
┌─────────────────────────────────────────────────────────────────┐
│                       Skills 注入                                │
│  inject-skills ──→ 載入專業知識到 subagent                      │
└─────────────────────────────────────────────────────────────────┘
```

### 潛在重複（可優化）

| Hook | CLAUDE.md 規則 | 狀態 | 建議 |
|------|----------------|------|------|
| `remind-review.sh` | D→R→T 核心規則 | 輕微重複 | 可保留，強化提醒效果 |
| `tech-debt-reminder.sh` | 發現問題即修復 | 輕微重複 | 可保留，強化提醒效果 |

### 無衝突確認

- ✅ Memory hooks 之間無衝突（設計為協作）
- ✅ Workflow hooks 之間無衝突（獨立功能）
- ✅ Memory + Workflow 無衝突（不同關注點）

---

## StatusLine（狀態列）

| 設定 | 路徑 | 功能 |
|------|------|------|
| statusLine | `ui/statusline.sh` | 在底部狀態列顯示 Memory 和 Git 資訊 |

**顯示範例**：
```
🧠 8 (5 recent) memories | 📊 12 commits
```

---

## 未註冊工具

這些工具未在 settings.json 中註冊，需手動使用：

### Memory 工具

#### `memory/memory-mode-controller.js` - 效能模式控制

**功能**：命令列工具，切換 Memory hooks 的效能配置

**使用時機**：需要調整 Memory 系統效能時（如減少延遲或獲得更多記憶）

**使用方式**：
```bash
node ~/.claude/hooks/memory/memory-mode-controller.js --profile fast   # 快速模式
node ~/.claude/hooks/memory/memory-mode-controller.js --profile full   # 完整模式
node ~/.claude/hooks/memory/memory-mode-controller.js --status         # 查看狀態
```

### 測試工具

| 檔案 | 功能 | 使用時機 |
|------|------|----------|
| `tests/integration-test.js` | Memory hooks 整合測試 | 驗證 hooks 系統是否正常運作 |
| `tests/debug-pattern-test.js` | 除錯模式測試 | 開發/除錯 hooks 時使用 |
| `tests/test-dual-protocol-hook.js` | 雙協議測試 | 測試 HTTP/HTTPS 相容性 |
| `tests/test-mcp-hook.js` | MCP 連接測試 | 測試 Memory MCP 服務連接 |
| `tests/test-natural-triggers.js` | 自然觸發測試 | 測試記憶觸發邏輯 |

**使用方式**：
```bash
# 驗證 hooks 系統
cd ~/.claude/hooks && node tests/integration-test.js

# 測試 MCP 連接
node ~/.claude/hooks/tests/test-mcp-hook.js
```

---

## 配置參考

### settings.json 路徑

```json
{
  "hooks": {
    "SessionStart": [
      {"command": "/Users/sbu/.claude/hooks/skills/inject-skills.sh"},
      {"command": "node \"/Users/sbu/.claude/hooks/core/session-start.js\""}
    ],
    "SessionEnd": [
      {"command": "node \"/Users/sbu/.claude/hooks/core/session-end.js\""},
      {"command": "/Users/sbu/.claude/hooks/workflow/check-archive.sh"}
    ],
    "PreToolUse": [
      {"matcher": "mcp__", "command": "node \"/Users/sbu/.claude/hooks/core/permission-request.js\""}
    ],
    "UserPromptSubmit": [
      {"command": "node \"/Users/sbu/.claude/hooks/core/mid-conversation.js\""}
    ],
    "PostToolUse": [
      {"matchers": ["Edit", "Write", "Bash"], "command": "node \"/Users/sbu/.claude/hooks/core/auto-capture-hook.js\""},
      {"matchers": ["Edit", "Write"], "command": "/Users/sbu/.claude/hooks/workflow/remind-review.sh"},
      {"matchers": ["Read", "Grep"], "command": "/Users/sbu/.claude/hooks/workflow/tech-debt-reminder.sh"}
    ]
  }
}
```

### config.json（Memory 配置）

詳見 `config.json` 和 `README.md`。

---

## 新增 Hook 指南

### 1. 選擇分類

| 分類 | 用途 | 目錄 |
|------|------|------|
| 核心生命週期 | Memory、權限、Session | `core/` |
| 工作流提醒 | D→R→T、歸檔、技術債 | `workflow/` |
| Memory 工具 | 記憶管理命令列 | `memory/` |
| Skills 相關 | Skills 注入、管理 | `skills/` |
| UI 相關 | 狀態列、顯示 | `ui/` |
| 測試 | 單元測試、整合測試 | `tests/` |

### 2. 建立腳本

```bash
# Shell script
#!/bin/bash
echo "提醒訊息"

# Node.js
#!/usr/bin/env node
console.log(JSON.stringify({ /* hook output */ }));
```

### 3. 註冊到 settings.json

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matchers": ["Edit"],
        "hooks": [
          {
            "type": "command",
            "command": "/Users/sbu/.claude/hooks/workflow/my-new-hook.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

---

## 維護規則

```
┌────────────────────────────────────────────────────────────┐
│  ⚠️ 每次新建或修改 hook 都必須更新本文件！                   │
│                                                            │
│  更新項目：                                                 │
│  1. 目錄結構（如有新增檔案）                                │
│  2. 已註冊 Hooks 表格（如有新增/修改註冊）                  │
│  3. 未註冊工具（如有新增工具）                              │
│  4. 維護日誌（記錄變更）                                    │
└────────────────────────────────────────────────────────────┘
```

### 更新檢查清單

新增 hook 時：
- [ ] 檔案放到正確分類目錄
- [ ] 更新「目錄結構」區塊
- [ ] 如註冊到 settings.json，更新「已註冊 Hooks」表格
- [ ] 如未註冊，更新「未註冊工具」區塊
- [ ] 更新「維護日誌」

修改 hook 時：
- [ ] 更新相關說明
- [ ] 更新「維護日誌」

---

## 維護日誌

| 日期 | 變更 |
|------|------|
| 2026-01-14 | 整理目錄結構，建立 HOOKS-REGISTRY.md |
| 2026-01-14 | 新增 `workflow/check-archive.sh` - OpenSpec 歸檔檢查 |
| 2026-01-14 | 新增 `workflow/remind-review.sh` - D→R→T 提醒 |
| 2026-01-14 | 新增 `workflow/tech-debt-reminder.sh` - 技術債提醒 |
| 2026-01-14 | 移動檔案到分類目錄，更新 settings.json 路徑 |
| 2026-01-14 | 新增未註冊工具詳細說明和維護規則 |
| 2026-01-14 | 註冊 `ui/statusline.sh` 到 statusLine 設定 |
| 2026-01-14 | 更新 `remind-review.sh` 加入回歸測試提醒 |
| 2026-01-15 | 新增 `workflow/cleanup-python.sh` - Python 進程清理 |
| 2026-01-15 | 新增 `utilities/python-monitor.sh` - Python 進程監控工具 |
