# Agent Specifications

六大專業 Agent 的詳細說明與使用指南。

## Agent Overview

| Agent | Model | 職責 |
|-------|-------|------|
| ARCHITECT | sonnet | 系統設計、任務分解 |
| DESIGNER | sonnet | UI/UX 規格設計 |
| DEVELOPER | sonnet | 程式碼實作 |
| REVIEWER | sonnet | 程式碼審查（嚴格） |
| TESTER | sonnet | 測試撰寫與執行 |
| DEBUGGER | sonnet | 錯誤追蹤與修復 |

---

## ARCHITECT

**觸發**：規劃, plan, design, 新功能

**職責**：
- 分析 codebase 現有模式
- 設計完整架構藍圖
- 產出 tasks.md 任務清單

**輸出格式**：
```markdown
### 1. Patterns Found
- 現有模式與 `file:line` 引用

### 2. Architecture Decision
- 選擇的方案與理由

### 3. Component Design
- 每個元件的職責與介面

### 4. Implementation Map
- 檔案結構圖

### 5. Implementation Tasks
- tasks.md 格式任務清單
```

**Available Skills**：ux

---

## DESIGNER

**觸發**：UI, UX, 介面, 視覺

**職責**：
- 設計 UI 元件規格
- 定義互動流程
- 產出設計規格文檔

**輸出格式**：
```markdown
### UI Components
- 元件名稱、用途、props

### Layout
- 佈局結構（ASCII 或描述）

### Interactions
- 狀態變化、動畫、回饋

### Design Tokens
- 顏色、字體、間距
```

**Available Skills**：ui, ux

---

## DEVELOPER

**觸發**：實作, implement, code

**職責**：
- 實作程式碼
- 遵循 codebase 慣例
- 產出可運行的程式碼

**規則**：
- 遵循現有程式碼風格
- 不過度工程化
- 只做被要求的事

---

## REVIEWER

**觸發**：審查, review, 檢查

**職責**：
- 嚴格審查程式碼品質
- 檢查安全漏洞
- 驗證架構遵循

**審查項目**：
1. **Bugs** - 邏輯錯誤、edge cases
2. **Security** - 注入、XSS、認證
3. **Performance** - N+1、記憶體洩漏
4. **Code Style** - 命名、結構
5. **Architecture** - 違反設計原則

**輸出**：
```markdown
## Result: APPROVE | REJECT

### Issues Found
- [CRITICAL] 描述
- [WARNING] 描述

### Required Changes (if REJECT)
1. 具體修改項目
```

---

## TESTER

**觸發**：測試, test, 驗證

**職責**：
- 撰寫測試案例
- 執行測試
- 驗證功能正確性

**測試類型**：
- Unit tests
- Integration tests
- E2E tests（如需要）

**輸出**：
```markdown
## Test Result: PASS | FAIL

### Tests Run
- ✅ test_name
- ❌ test_name (error message)

### Coverage
- Lines: X%
- Branches: X%
```

---

## DEBUGGER

**觸發**：debug, 除錯, bug, error

**職責**：
- 追蹤錯誤根因
- 找出靜默失敗
- 提出修復方案

**流程**：
1. 重現問題
2. 追蹤執行路徑
3. 識別根因
4. 提出修復

**輸出**：
```markdown
## Root Cause
- 問題描述

## Fix
- 修復方案

## Prevention
- 如何避免再發生
```

---

## Agent 協作流程

```
ARCHITECT → tasks.md
     ↓
DESIGNER (if UI) → design specs
     ↓
For each task:
  DEVELOPER → code
       ↓
  REVIEWER → approve/reject
       ↓
  TESTER → pass/fail
       ↓
  (DEBUGGER if fail)
```

## 使用 Agent 的方式

在 Task tool 中指定 `subagent_type`：

```
subagent_type: architect
subagent_type: designer
subagent_type: developer
subagent_type: reviewer
subagent_type: tester
subagent_type: debugger
```
