# 工作流 1.0 完整規格

> 用於與工作流 2.0 比較的完整細節清單

---

## 一、D→R→T 流程變體

### 1.1 三種合法路徑

| # | 路徑 | 適用場景 | 說明 |
|---|------|----------|------|
| 1 | **D → R → T** | 一般功能開發 | Developer 實作 → Reviewer 審查 → Tester 測試 |
| 2 | **Main → R → T** | 簡單 bug 修復 | Main Agent 直接修復 → 必須經過 R→T |
| 3 | **Design → D → R → T** | UI 相關任務 | Designer 設計 → Developer 實作 → R→T |

**共同點**：所有路徑都必須經過 R→T

### 1.2 完整流程變體

| # | 流程 | 觸發條件 | 說明 |
|---|------|----------|------|
| 1 | **D→R→T** | 一般開發 | 標準三階段 |
| 2 | **S→W** | 建立 skill | Skills Agent → Workflow Agent 驗證 |
| 3 | **M→S→W→D→R→T** | 遷移任務 | Migration → Skills → Workflow → D→R→T |
| 4 | **M→W→D→R→T** | 簡單遷移 | 無需新 skill 的遷移 |
| 5 | **M→D→R→T** | 微小遷移 | 小版本升級等 |

### 1.3 D→R→T 內部循環

```
D (Developer)
  ↓
R (Reviewer)
  ├─ APPROVE → T (Tester)
  └─ REJECT  → D (retry++)  [max: 3]
                  ↓
T (Tester)
  ├─ PASS → ✅ 完成
  └─ FAIL → Debugger → D → R → T
                        [max: 3]
```

### 1.4 Debugger 升級機制

| 失敗次數 | 動作 |
|----------|------|
| 1 | `Task(debugger)` - sonnet 模型 |
| 2 | `Task(debugger, model: "opus")` - 升級 |
| 3 | 暫停，詢問用戶 |

---

## 二、Agent Start/End 狀態顯示

### 2.1 啟動時格式

```markdown
## 🏗️ ARCHITECT 開始規劃 [任務描述]
## 💻 DEVELOPER 開始實作 [Task X.X - 任務名稱]
## 🔍 REVIEWER 開始審查 [檔案/模組名稱]
## 🧪 TESTER 開始測試 [測試範圍]
## 🐛 DEBUGGER 開始除錯 [問題描述]
## 🎨 DESIGNER 開始設計 [UI/UX 範圍]
## 📚 SKILLS 開始處理 [skill/agent 任務]
## 🔄 WORKFLOW 開始驗證 [工作流名稱]
## 🔀 MIGRATION 開始規劃 [遷移任務]
```

### 2.2 增強版啟動格式（大字提醒）

```markdown
# ═══════════════════════════════════════════════════════════
# ⚡ 啟動 💻 DEVELOPER 開始實作 [Task X.X - 任務名稱]
# ═══════════════════════════════════════════════════════════
```

### 2.3 結束時格式

**成功：**
```markdown
## ✅ 💻 DEVELOPER 完成 Task 1.1。啟動 🔍 R → 🧪 T
## ✅ 🔍 REVIEWER 通過審查。啟動 🧪 TESTER
## ✅ 🧪 TESTER 通過 (15/15 tests)。Task 1.1 完成
```

**失敗：**
```markdown
## ❌ 🔍 REVIEWER 發現 2 個問題。返回 💻 DEVELOPER 修復
## ❌ 🧪 TESTER 失敗 (3/15 tests)。啟動 🐛 DEBUGGER
```

### 2.4 並行啟動格式

```markdown
## ⚡ 啟動 3 個 💻 DEVELOPER 並行處理：
- Task 1.1: 建立 UserService
- Task 1.2: 建立 AuthService
- Task 2.1: 建立 PaymentService
```

```markdown
## ⚡ 並行啟動：
- 💻 DEVELOPER: Task 1.1
- 🔍 REVIEWER: Task 2.1（已完成開發）
- 🧪 TESTER: Task 3.1（已通過審查）
```

### 2.5 Session Report 格式

```
═══ Session Report ═══
✅ D→R→T: X/X (100%)
⚡ 並行: Y/Y (100%)
📝 變更: Z files, ±N lines
═══════════════════════
```

### 2.6 任務執行報告格式

```markdown
## 📊 任務執行報告

| 階段 | Agent | 狀態 | 說明 |
|------|-------|------|------|
| 規劃 | 🏗️ ARCHITECT | ✅ | 設計系統架構 |
| 開發 | 💻 DEVELOPER | ✅ | 建立核心類別 |
| 審查 | 🔍 REVIEWER | ✅ | 發現 3 個問題 |
| 修復 | 💻 DEVELOPER | ❌ Main 自己做 | ⚠️ 違反 D→R→T |
| 測試 | 🧪 TESTER | ❌ 未執行 | ⚠️ 缺少測試 |

**D→R→T 合規率**: 3/5 (60%) ⚠️
```

---

## 三、並行與串行處理

### 3.1 Phase 類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `sequential` | 依序執行 | 基礎建設、有依賴的任務 |
| `parallel` | 同時執行 | 獨立功能、無衝突檔案 |
| `depends: N` | 等待 Phase N | 整合任務 |

### 3.2 依賴判斷標準

| 依賴類型 | 判斷依據 | 處理方式 |
|----------|----------|----------|
| **檔案依賴** | Task B 需要 Task A 產出的檔案 | 串行 |
| **資料依賴** | Task B 需要 Task A 的輸出結果 | 串行 |
| **順序依賴** | 邏輯上必須先做 A 再做 B | 串行 |
| **檔案衝突** | 多個任務修改同一檔案 | 串行 |
| **無依賴** | 不同檔案、不同模組 | 可並行 |

### 3.3 並行執行方式

**方式 1：完全並行（小任務）**
```
Task 2.1: D → R → T ─┐
Task 2.2: D → R → T ─┼→ 全部完成
Task 2.3: D → R → T ─┘
```

**方式 2：階段並行（大任務）**
```
Step 1 - 並行 DEVELOPER：
  Task(developer, "Task 2.1...")
  Task(developer, "Task 2.2...")
  Task(developer, "Task 2.3...")

Step 2 - 統一 REVIEWER：
  Task(reviewer, "審查 Task 2.1, 2.2, 2.3...")

Step 3 - 並行 TESTER：
  Task(tester, "測試 Task 2.1...")
  Task(tester, "測試 Task 2.2...")
  Task(tester, "測試 Task 2.3...")
```

### 3.4 並行錯誤處理

| 情況 | 處理方式 |
|------|----------|
| REVIEWER REJECT 其中一個 | 只重試該任務，其他繼續 |
| TESTER FAIL 其中一個 | 呼叫 DEBUGGER 修復該任務 |
| 多個任務失敗 | 依序處理每個失敗的任務 |

### 3.5 tasks.md Phase 格式

```markdown
## Progress
- Total: 8 tasks
- Completed: 3
- Status: IN_PROGRESS

---

## 1. Foundation (sequential)
- [x] 1.1 Setup database | files: src/db/index.ts
- [x] 1.2 Create models | files: src/models/
- [ ] 1.3 Setup auth | files: src/auth/

## 2. Features (parallel)
- [ ] 2.1 User API | files: src/api/user.ts
- [ ] 2.2 Cart API | files: src/api/cart.ts

## 3. Integration (sequential, depends: 2)
- [ ] 3.1 Export all APIs | files: src/api/index.ts
```

---

## 四、Loop 模式機制

### 4.1 觸發方式

| 關鍵字 | 動作 |
|--------|------|
| `規劃 [feature] loop` | ARCHITECT → OpenSpec → ralph-loop |
| `[任務] loop` | 使用 `/ralph-loop:ralph-loop` 持續執行 |
| `工作流 [change-id] loop` | 恢復 + loop |

### 4.2 Loop 狀態檔案

**專案內檔案**：`.claude/ralph-loop.local.md`
```markdown
# Loop ID: task-add-user-auth
Status: running
Started: 2024-01-19 10:00:00
```

**全域持久化檔案**：`~/.claude/loop-state/current.json`
```json
{
  "loopId": "task-add-user-auth",
  "status": "running",
  "startedAt": "2024-01-19 10:00:00",
  "lastHeartbeat": "2024-01-19 10:30:00",
  "projectPath": "/path/to/project",
  "loopConfig": {
    "stateFile": ".claude/ralph-loop.local.md"
  }
}
```

### 4.3 Heartbeat 機制

**觸發時機**：PostToolUse (Edit, Write, Bash, Task)

**動作**：
1. 更新 `.claude/ralph-loop-heartbeat.txt` 時間戳
2. 更新 `~/.claude/loop-state/current.json` 完整狀態

### 4.4 Loop 恢復檢測

**觸發時機**：SessionStart

**條件**：
- 存在 `current.json`
- 狀態不是 completed/cancelled
- 閒置超過 `maxIdleMinutes`（預設 30 分鐘）

**輸出**：
```
╔════════════════════════════════════════════════════════════════╗
║                  🔄 偵測到未完成的 Loop                        ║
╚════════════════════════════════════════════════════════════════╝

📋 Loop ID: task-add-user-auth
📁 專案路徑: /path/to/project
⏰ 最後活動: 2024-01-19 10:30:00
⏳ 已閒置: 2 小時 30 分鐘
📊 狀態: running

💡 建議操作：
   1. 若要繼續：輸入 "loop" 或 "繼續 loop"
   2. 若要放棄：輸入 "取消 loop"
```

### 4.5 Loop 結束流程

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

---

## 五、狀態追蹤機制

### 5.1 雙軌同步

| 軌道 | 用途 | 格式 |
|------|------|------|
| `tasks.md` | 斷點恢復 | `- [ ]` / `- [x]` / `- [!]` |
| `TodoWrite` | 用戶即時查看 | JSON 格式 |

### 5.2 tasks.md Status 值

| Status | 說明 |
|--------|------|
| `NOT_STARTED` | 尚未開始 |
| `IN_PROGRESS` | 進行中 |
| `COMPLETED` | 全部完成 |
| `BLOCKED` | 被阻擋（需要協助）|

### 5.3 進度保存規則

**每個任務完成後必須執行**：
```bash
1. 更新 tasks.md checkbox ✅
2. git add . && git commit -m "progress: Task X.X completed"
```

### 5.4 斷點恢復流程

```
用戶：接手 [change-id] 或 工作流 [change-id]
     ↓
1. 讀取 openspec/changes/[change-id]/tasks.md
2. 分析任務依賴，分配 Phase Batches
3. 使用 TodoWrite 建立 phase todos
4. 找到第一個未完成的 Phase
5. 並行執行 Phase 內所有任務的 D→R→T
6. Phase 完成後進入下一個 Phase
```

---

## 六、工作流模式

### 6.1 Mode 1: 規劃（新功能）

```
用戶: 規劃 [feature]
     ↓
ARCHITECT：
1. 分析 codebase
2. 建立 openspec/specs/[change-id]/
   ├── proposal.md
   ├── tasks.md ☐☐☐
   └── notes.md
3. 等待用戶審核
     ↓
用戶審核通過：
mv openspec/specs/[id] openspec/changes/[id]
```

### 6.2 Mode 1.5: 並行任務分配

**規劃完成後，執行前必須：**
1. 分析任務依賴關係
2. 分配 Phase Batches
3. 使用 TodoWrite 建立 phase todos

### 6.3 Mode 2: 接手/工作流（恢復執行）

```
用戶: 接手 [change-id]
     ↓
Main Agent：
1. 檢查位置（specs/ → changes/）
2. 讀取 tasks.md
3. 分析依賴，分配 Phase
4. 執行 D→R→T
```

### 6.4 Mode 3: 歸檔

**觸發條件**：所有任務完成

```
所有任務 [x]
     ↓
openspec archive [change-id] --yes
     ↓
移動到 openspec/archive/[change-id]/
     ↓
Git commit: "chore: archive [change-id]"
```

---

## 七、限制參數

| 參數 | 值 | 來源 |
|------|-----|------|
| max_iterations | 10 | ralph-loop |
| max_retries | 3 | per task |
| STALE_TIMEOUT_MS | 30 分鐘 | loop-recovery |
| max_log_size | 1MB | hooks |
| MAX_EVENTS_TO_KEEP | 500 | workflow-tracker |

---

## 八、Git Commit 策略

```bash
# 格式
git commit -m "<type>(task-X.X): description"

# 類型
feat     - 新功能
fix      - Bug 修復
refactor - 重構
test     - 測試
docs     - 文檔
chore    - 雜項（歸檔等）

# 範例
git commit -m "feat(task-2.1): implement user authentication"
git commit -m "progress: Task 2.1 completed"
git commit -m "chore: archive add-user-auth"
```

---

## 九、Emoji 速查表

| Emoji | Agent | 用途 |
|-------|-------|------|
| 🤖 | MAIN | Main Agent 動作 |
| 🏗️ | ARCHITECT | 規劃、架構設計 |
| 💻 | DEVELOPER | 程式碼實作 |
| 🔍 | REVIEWER | 程式碼審查 |
| 🧪 | TESTER | 測試驗證 |
| 🐛 | DEBUGGER | 除錯排查 |
| 🎨 | DESIGNER | UI/UX 設計 |
| 📚 | SKILLS | Skill/Agent 維護 |
| 🔄 | WORKFLOW | 工作流驗證 |
| 🔀 | MIGRATION | 遷移規劃 |
| ⚡ | - | 並行操作 |
| ✅ | - | 成功完成 |
| ❌ | - | 失敗/問題 |
| ⚠️ | - | 警告/需協助 |

---

## 十、紅線規則（1.0 版本）

觸發後必須**立即停止並調整**：

1. **程式碼寫完沒有 R→T**
   → 停止，呼叫 reviewer/tester

2. **連續發送多個 Read/Grep**
   → 停止，合併為一次發送

3. **Main Agent 長時間寫程式碼**
   → 停止，改用 Task(developer)

---

## 十一、現有 Hook 機制

### 11.1 提醒型 Hooks

| Hook | 事件 | 功能 |
|------|------|------|
| `remind-review.sh` | PostToolUse (Edit/Write) | 提醒審查 |
| `workflow-violation-tracker.js` | PostToolUse | 追蹤違規 |
| `loop-continue-reminder.sh` | UserPromptSubmit | Loop 繼續提醒 |
| `tech-debt-reminder.sh` | PostToolUse (Read/Grep) | 技術債提醒 |

### 11.2 追蹤型 Hooks

| Hook | 事件 | 功能 |
|------|------|------|
| `delegation-logger.sh` | PreToolUse (Task) | 記錄委派 |
| `loop-heartbeat.sh` | PostToolUse | 更新 Loop 狀態 |
| `auto-capture-hook.js` | PostToolUse | 自動捕獲記憶 |

### 11.3 生命週期 Hooks

| Hook | 事件 | 功能 |
|------|------|------|
| `session-start.js` | SessionStart | 初始化 |
| `session-end.js` | SessionEnd | 清理、報告 |
| `loop-recovery-detector.js` | SessionStart | 恢復檢測 |
| `check-archive.sh` | SessionEnd | 歸檔檢查 |

---

## 十二、執行保障總結（1.0）

| 機制 | 約束力 | 說明 |
|------|--------|------|
| CLAUDE.md 規則 | ~60-80% | 依賴 LLM 記得遵守 |
| Skills 知識 | 參考用 | 專業知識指導 |
| Hooks 提醒 | ~70-80% | 每次觸發提醒 |
| 紅線規則 | ~60-70% | 文字強調 |

**總結**：1.0 版本的工作流主要依賴「軟性約束」，沒有強制阻擋機制。
