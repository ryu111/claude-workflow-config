# 流程識別與調度規則

Main Agent 遇到任務時，先識別應使用的流程，然後調度對應的 Agent。

## 流程識別

### 流程對應表

| 任務類型 | 流程 | Agent 順序 |
|----------|------|------------|
| 建立 skill | S→W | Skills → Workflow |
| 遷移工具/框架 | M→S→W→D→R→T | Migration → Skills → Workflow → D→R→T |
| 一般開發 | D→R→T | Developer → Reviewer → Tester |
| UI 設計 | Design→D→R→T | Designer → Developer → Reviewer → Tester |
| 規劃功能 | ARCHITECT | Architect（建立 OpenSpec） |

### 流程選擇規則

1. **識別關鍵字**：查看用戶輸入是否包含特定關鍵字
2. **調度對應 Agent**：使用 Task tool 呼叫專門 agent
3. **監督而非執行**：Main Agent 負責調度，不親力親為

## 流程詳細定義

### D→R→T 流程（標準開發）

```
Task(subagent_type: "developer")
    ↓
Task(subagent_type: "reviewer")
    ↓
Task(subagent_type: "tester")
```

參考：`workflow` skill

### S→W 流程（Skill 建立與驗證）

```
Task(subagent_type: "skills-agents")
    ↓
Task(subagent_type: "workflow")  # 驗證
```

參考：`workflow/references/flows/skill-creation.md`

### M→S→W→D→R→T 流程（遷移）

```
Task(subagent_type: "migration")   # 規劃
    ↓
Task(subagent_type: "skills-agents")  # 建立相關 skill
    ↓
Task(subagent_type: "workflow")    # 驗證流程
    ↓
D → R → T                          # 實作
```

參考：`workflow/references/flows/migration.md`

## Agent 選擇原則

**根據任務涉及的領域決定，而非只看動詞。**

### 範例

| 用戶輸入 | 關鍵分析 | 選擇 |
|----------|----------|------|
| 「檢查 skills 規範」 | 涉及 skills 領域 | 📚 SKILLS |
| 「檢查程式碼品質」 | 涉及程式碼審查 | 🔍 REVIEWER |
| 「修復登入 bug」 | 涉及除錯 | 🐛 DEBUGGER |
| 「新增登入功能」 | 涉及開發 | 💻 DEVELOPER |
| 「設計登入頁面」 | 涉及 UI 設計 | 🎨 DESIGNER |

## 關鍵字對應表

| 關鍵字 | Agent | 說明 |
|--------|-------|------|
| 規劃, plan, 架構, 分析需求 | 🏗️ ARCHITECT | 建立 OpenSpec |
| skill 相關（建立/維護/檢查/研究） | 📚 SKILLS | Skill 管理 |
| agent 相關（建立/維護/檢查/研究） | 📚 SKILLS | Agent 管理 |
| 設計流程, 新增工作流, 驗證 skill | 🔄 WORKFLOW | 工作流驗證 |
| 遷移, 替換, 升級, migrate | 🔀 MIGRATION | 遷移規劃 |
| 設計, design, UI, UX, 介面, 樣式, 佈局 | 🎨 DESIGNER | UI/UX 設計 |
| 實作, implement, 開發, 寫程式, 新增功能 | 💻 DEVELOPER | 程式碼實作 |
| 審查, review, 程式碼品質 | 🔍 REVIEWER | 程式碼審查 |
| 測試, test, 驗證, QA | 🧪 TESTER | 測試驗證 |
| debug, 除錯, 修復 bug, 錯誤排查 | 🐛 DEBUGGER | 除錯排查 |

## OpenSpec 與規劃

### 禁用內建 Plan Mode

```
❌ 禁止使用 EnterPlanMode 工具
❌ 禁止建立 .claude/plans/ 檔案
✅ 使用 OpenSpec + AskUserQuestion + TodoWrite
```

### OpenSpec Kanban 三階段

| 階段 | 目錄 | 說明 |
|------|------|------|
| 待執行 | `openspec/specs/[id]/` | 規劃完成，等待開始 |
| 進行中 | `openspec/changes/[id]/` | 正在執行 |
| 已完成 | `openspec/archive/[id]/` | 歸檔歷史 |

### 規劃流程

```
用戶：規劃 [功能名稱]
    ↓
🏗️ ARCHITECT 執行：
    1. AskUserQuestion → 補充問題
    2. TodoWrite → 建立任務追蹤
    3. 建立 openspec/specs/[change-id]/
       ├── proposal.md
       ├── tasks.md ☐☐☐
       └── notes.md
    4. 等待用戶審核
    ↓
用戶審核通過，開始執行：
    mv openspec/specs/[id] openspec/changes/[id]
```
