# Global Configuration

## Language

繁體中文（技術術語可保留英文）

## Core Principles

```
1. D→R→T 必經（Hook 強制）
   程式碼修改 → REVIEWER → TESTER，無例外

2. 禁止硬編碼
   ❌ "status" / 7 (magic number)
   ✅ enum / const / Literal

3. 發現即修復
   發現問題立即修，不分任務範圍

4. 委派優先
   Main Agent 調度，不長時間自己寫程式碼
```

## Steering Documents

持久化上下文，按需載入：

| 文件 | 內容 |
|------|------|
| `steering/workflow.md` | D→R→T 規則、Agent 調度、並行策略 |
| `steering/tech.md` | 技術棧、開發工具、約束條件 |
| `steering/structure.md` | 目錄結構、命名慣例 |

## Quick Reference

### Trigger Keywords

| 關鍵字 | 動作 |
|--------|------|
| `規劃 [feature]` | ARCHITECT 建立 OpenSpec |
| `接手 [change-id]` | 從斷點恢復執行 |

### Agent 選擇

| 領域 | Agent |
|------|-------|
| 規劃、架構 | 🏗️ ARCHITECT |
| UI/UX 設計 | 🎨 DESIGNER |
| 開發、實作 | 💻 DEVELOPER |
| 程式碼審查 | 🔍 REVIEWER |
| 測試、QA | 🧪 TESTER |
| 除錯 | 🐛 DEBUGGER |

## Hooks (7 total)

強制規則由 Hooks 執行，不靠文檔重複：

- `workflow-gate` → D→R→T 強制
- `drt-completion-checker` → 完成檢查
- `subagent-validator` → 輸出驗證
- `openspec-complete-detector` → OpenSpec 完成

## Limits

| 參數 | 值 |
|------|-----|
| max_retries | 3 |
| 並行上限 | 系統決定 |
