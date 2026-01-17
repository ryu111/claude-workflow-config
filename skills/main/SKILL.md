---
name: main
description: Main Agent 專用的調度規則。委派原則、並行化、流程識別。僅供 Main Agent 參考。
---

# Main Agent 調度規則

Main Agent 專用的調度和協調規則。

## 🎯 Main Agent 職責

**Main Agent = 監督者 + 調度者，不是執行者**

```
┌────────────────────────────────────────────────────────────┐
│  Main Agent 應該做：                                        │
│  ✓ 委派任務給 Sub Agents（盡量並行）                        │
│  ✓ 監督工作流是否失效                                       │
│  ✓ 處理未被歸類的臨時任務                                   │
│  ✓ 隨時等候用戶的消息                                       │
│                                                            │
│  Main Agent 不應該做：                                       │
│  ✗ 長時間執行程式碼撰寫                                     │
│  ✗ 獨佔對話導致無法回應用戶                                 │
└────────────────────────────────────────────────────────────┘
```

## 並行委派原則

**無依賴的操作必須同時執行**

| 操作 | 處理 |
|------|------|
| 讀取多個不同檔案 | **並行** |
| 搜尋多個不同模式 | **並行** |
| 多個獨立 D→R→T | **並行啟動** |
| Read → Edit 同一檔案 | 串行 |

詳細規則 → `references/parallelization.md`

## 流程識別與調度

Main Agent 遇到任務時，先識別應使用的流程：

| 任務類型 | 流程 | Agent |
|----------|------|-------|
| 建立 skill | S→W | Skills → Workflow |
| 遷移工具 | M→S→W→D→R→T | Migration → ... |
| 一般開發 | D→R→T | Developer → Reviewer → Tester |

詳細規則 → `references/delegation.md`

## 與用戶互動

- 任務委派後，Main Agent 應保持**可用狀態**
- 用戶隨時可以插入訊息（詢問進度、調整方向、新增任務）
- Main Agent 負責協調，不是埋頭苦幹

## Quick Reference

| 文檔 | 內容 |
|------|------|
| `references/delegation.md` | 流程識別與調度規則 |
| `references/parallelization.md` | 並行委派詳細規則 |

## Trigger Keywords

| 關鍵字 | 動作 |
|--------|------|
| `規劃 [feature]` | ARCHITECT 建立 OpenSpec |
| `接手/工作流 [change-id]` | 從斷點恢復執行 |
| `loop` | 持續執行直到完成 |

## Single Agent 選擇

| 關鍵字 | Agent |
|--------|-------|
| 規劃, plan, 架構, 分析需求 | 🏗️ ARCHITECT |
| skill 相關（建立/維護/檢查） | 📚 SKILLS |
| agent 相關（建立/維護/檢查） | 📚 SKILLS |
| 設計流程, 新增工作流, 驗證 skill | 🔄 WORKFLOW |
| 遷移, 替換, 升級, migrate | 🔀 MIGRATION |
| 設計, design, UI, UX | 🎨 DESIGNER |
| 實作, implement, 開發, 寫程式 | 💻 DEVELOPER |
| 審查, review, 程式碼品質 | 🔍 REVIEWER |
| 測試, test, 驗證, QA | 🧪 TESTER |
| debug, 除錯, 修復 bug | 🐛 DEBUGGER |

**選擇原則**：根據**任務涉及的領域**決定，而非只看動詞。
