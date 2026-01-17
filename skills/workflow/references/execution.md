# Workflow Execution Rules

詳細的工作流執行規則。快速參考請見 CLAUDE.md。

## 關鍵字觸發機制

| 關鍵字模式 | 執行動作 |
|-----------|----------|
| `規劃 [feature]` | ARCHITECT 建立 OpenSpec（proposal + tasks） |
| `接手 [change-id]` | 讀取 tasks.md，從斷點繼續 |
| `工作流 [change-id]` | 同上，恢復工作流執行 D→R→T |
| `[任務] loop` | 使用 `/ralph-loop:ralph-loop` 持續執行 |
| `規劃 [feature] loop` | ARCHITECT → OpenSpec → ralph-loop |

## 斷點恢復流程

```
1. 讀取 openspec/changes/[change-id]/tasks.md
2. 分析任務依賴，分配 Phase Batches
3. 使用 TodoWrite 建立 phase todos
4. 找到第一個未完成的 Phase
5. 並行執行 Phase 內所有任務的 D→R→T
6. Phase 完成後進入下一個 Phase
```

## 任務執行循環

### 三種合法路徑

| 路徑 | 說明 | 使用情境 |
|------|------|----------|
| Main → R → T | Main agent 直接修復 | 簡單 bug 修復 |
| Design → R → T | Designer 產出設計後實作 | UI/設計相關 |
| D → R → T | Developer 開發 | 功能開發 |

**核心原則：所有產出都需要 R→T**

### Per-Task Cycle（完整版）

```
0. 🎨 DESIGNER (如果是 UI 任務)
   │  - 讀取 tokens.md 和 components.md
   │  - 產出設計規格
   │  - 存到：openspec/changes/[change-id]/ui-specs/[component].md
   ↓
1. 💻 DEVELOPER (Task tool → subagent_type: developer)
   │  - 讀取設計規格（如有）
   │  - 根據需求實作
   ↓
2. 🔍 REVIEWER (Task tool → subagent_type: reviewer)
   │
   ├── REJECT → 回到 DEVELOPER (retry++)
   │            max_retries: 3
   │
   └── APPROVE → 進入 TESTER
                 ↓
3. 🧪 TESTER (Task tool → subagent_type: tester)
   │
   ├── FAIL → DEBUGGER → 修復後回到 TESTER
   │
   └── PASS → ✅ 標記任務完成 → 更新 tasks.md checkbox

## 測試層級要求

**TESTER 必須驗證三個層級，不只單元測試：**

| 層級 | 說明 | 驗證內容 |
|------|------|----------|
| 單元測試 | 單一函數/類別 | 輸入輸出正確 |
| 整合測試 | 模組間互動 | 資料流完整傳遞 |
| 端到端測試 | 完整流程 | 從入口到輸出都正確 |

### 整合測試檢查清單

```
□ 資料從模組 A 傳到模組 B，欄位是否完整？
□ 型別是否一致（沒有 _strategy_name vs strategy_name 問題）？
□ 可選欄位是否有適當的預設值？
□ 錯誤是否正確傳播和處理？
```

### 常見問題範例

| 問題 | 單元測試結果 | 整合測試結果 |
|------|-------------|-------------|
| 屬性名稱不一致 | ✅ PASS | ❌ FAIL |
| 欄位遺漏 | ✅ PASS | ❌ FAIL |
| 型別轉換錯誤 | ✅ PASS | ❌ FAIL |

**單元測試 PASS 不代表整合正確，TESTER 必須驗證資料流。**
```

## 同步更新 tasks.md

**每個任務完成後必須立即更新 checkbox！**

```markdown
# Before
- [ ] 2.1 Create user API | files: src/api/user.ts

# After (任務完成)
- [x] 2.1 Create user API | files: src/api/user.ts
```

**雙軌同步：**
- `tasks.md` checkbox → 支援斷點恢復
- `TodoWrite` 工具 → 用戶即時查看進度

## Task Tool 使用範例

```python
# 正確：使用 Task 工具產生 subagent
Task(subagent_type: "developer", prompt: "實作 Task 2.1...")
Task(subagent_type: "reviewer", prompt: "審查程式碼...")
Task(subagent_type: "tester", prompt: "執行測試...")

# 錯誤：只顯示 emoji 標示
💻 DEVELOPER: 實作 Task 2.1...（直接執行，未使用 Task 工具）
```

## Ralph-Loop 整合

```bash
/ralph-loop:ralph-loop 執行所有待處理任務 \
  --completion-promise 'ALL TASKS COMPLETED' \
  --max-iterations 30
```

## DEBUGGER 動態升級

| 失敗次數 | 動作 |
|----------|------|
| 1 | `Task(subagent_type: "debugger")` 預設 sonnet |
| 2 | `Task(subagent_type: "debugger", model: "opus")` 升級 |
| 3 | 暫停，詢問用戶是否繼續 |

## 失敗智能分析

| 失敗次數 | 分析 | 動作 |
|----------|------|------|
| 1 | - | 正常重試 |
| 2 | 比較錯誤是否相同 | 相同 → 升級；不同 → 可能 flaky |
| 3 | 判斷是否架構問題 | 相同 → 通知 ARCHITECT；不同 → 暫停 |

## Agent 工作標示

**重要**：切換 agent 時，Main Agent 必須輸出標示讓用戶知道當前狀態。

格式：
```
🏗️ ARCHITECT: [任務描述]
🎨 DESIGNER: [任務描述]
💻 DEVELOPER: [任務描述]
🔍 REVIEWER: [任務描述]
🧪 TESTER: [任務描述]
🐛 DEBUGGER: [任務描述]
```

範例：
```
🏗️ ARCHITECT: 規劃登入功能架構
💻 DEVELOPER: 實作 Task 2.1 - 建立 AuthService
🔍 REVIEWER: 審查 AuthService 程式碼
🧪 TESTER: 執行 AuthService 單元測試
✅ Task 2.1 完成，更新 tasks.md
```

## 工作流結束流程

```
所有任務完成 ✅
     ↓
1. 📦 歸檔：openspec archive [change-id] --yes
     ↓
2. 🧹 清理快取
     ↓
3. 📝 檢查 notes.md（有則提醒）
     ↓
4. 📊 輸出 Session Report
     ↓
5. 🔒 關閉 Loop：/ralph-loop:cancel-ralph
     ↓
✅ 工作流完成
```
