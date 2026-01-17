# Workflow Modes

詳細的工作流模式說明。快速參考請見 SKILL.md。

## Mode 1: 規劃（新功能）

```
用戶: 規劃 [feature]
     ↓
ARCHITECT 執行：
1. 分析 codebase
2. 建立 openspec/specs/[change-id]/    ← 放到「待執行」
   ├── proposal.md
   ├── tasks.md ☐☐☐
   └── notes.md
3. 等待用戶審核
     ↓
用戶審核通過，準備執行：
mv openspec/specs/[change-id] openspec/changes/[change-id]
```

## Mode 1.5: ⚡ 並行任務分配

**規劃完成後，執行前必須分析任務依賴並分配並行批次！**

```
tasks.md 完成
     ↓
分析任務依賴關係
     ↓
分配 Phase Batches（可並行的任務群組）
     ↓
使用 TodoWrite 建立 phase todos
     ↓
開始執行
```

### 依賴分析規則

| 依賴類型 | 判斷依據 | 處理方式 |
|----------|----------|----------|
| **無依賴** | 不同檔案、不同模組 | ✅ 可並行 |
| **檔案依賴** | Task B 需要 Task A 產出的檔案 | 🔗 串行 |
| **介面依賴** | Task B 使用 Task A 定義的 API | 🔗 串行 |
| **測試依賴** | 測試需要對應功能完成 | 🔗 串行 |

### 分配範例

```markdown
# tasks.md 原始任務
- [ ] 1.1 建立 UserService | files: src/services/user.ts
- [ ] 1.2 建立 AuthService | files: src/services/auth.ts
- [ ] 1.3 建立 UserAPI | files: src/api/user.ts (依賴 1.1)
- [ ] 2.1 建立 PaymentService | files: src/services/payment.ts
- [ ] 2.2 建立 PaymentAPI | files: src/api/payment.ts (依賴 2.1)

# 分析後的 Phase Batches
Phase 1 (並行): [1.1, 1.2, 2.1]  ← 無依賴，可同時執行
Phase 2 (並行): [1.3, 2.2]       ← 依賴 Phase 1，可同時執行
```

### TodoWrite 格式

```python
TodoWrite([
    # Phase 1 - 並行執行
    {"content": "Phase 1: 基礎 Services (1.1, 1.2, 2.1)", "status": "pending"},
    {"content": "  └─ 1.1 UserService", "status": "pending"},
    {"content": "  └─ 1.2 AuthService", "status": "pending"},
    {"content": "  └─ 2.1 PaymentService", "status": "pending"},
    # Phase 2 - 依賴 Phase 1
    {"content": "Phase 2: API 層 (1.3, 2.2)", "status": "pending"},
    {"content": "  └─ 1.3 UserAPI", "status": "pending"},
    {"content": "  └─ 2.2 PaymentAPI", "status": "pending"},
])
```

### 並行執行方式

```python
# Phase 內的任務並行啟動多個 Task subagent
Task(subagent_type: "developer", prompt: "實作 Task 1.1...")  }
Task(subagent_type: "developer", prompt: "實作 Task 1.2...")  } 同時發送
Task(subagent_type: "developer", prompt: "實作 Task 2.1...")  }

# 等待所有 Phase 1 完成後
# 再並行啟動 Phase 2
Task(subagent_type: "developer", prompt: "實作 Task 1.3...")  }
Task(subagent_type: "developer", prompt: "實作 Task 2.2...")  } 同時發送
```

## Mode 2: 接手/工作流（恢復執行）

```
用戶: 接手 [change-id]  或  工作流 [change-id]
     ↓
Main Agent 執行：
1. 檢查位置：
   - 如果在 specs/  → 移動到 changes/（開始執行）
   - 如果在 changes/ → 繼續執行
2. 讀取 openspec/changes/[change-id]/tasks.md
3. 分析任務依賴，分配 Phase Batches
4. 使用 TodoWrite 建立 phase todos
5. 找到第一個未完成的 Phase
6. 並行執行 Phase 內所有任務的 D→R→T
7. Phase 完成後進入下一個 Phase
```

## 斷點恢復流程

當用戶說「接手 xxx」或「工作流 xxx」時：

```
1. 讀取 openspec/changes/[change-id]/tasks.md
2. 解析所有任務狀態
3. 找到第一個 `- [ ]` 未完成的任務
4. 顯示恢復資訊：

   📋 恢復工作流：[change-id]
   ✅ 已完成：3/8 任務
   ⏳ 接下來：Task 2.1 - Create user API

5. 從該任務開始 D→R→T 循環
6. 完成後更新 checkbox 並繼續下一個任務
```

---

## 歸檔流程（Archive）

**重要**：當所有任務完成後，必須執行歸檔！

```
┌────────────────────────────────────────────────────────────┐
│  ⚠️ 歸檔是工作流的最後一步，不能跳過！                      │
│  SessionEnd Hook 會自動檢查並提醒未歸檔的變更              │
└────────────────────────────────────────────────────────────┘
```

### 歸檔流程

```
所有任務完成 `- [x]`
     ↓
【強制】執行歸檔：
openspec archive [change-id] --yes
# 或手動：mv openspec/changes/[change-id] openspec/archive/[change-id]
     ↓
變更被移動到：
openspec/archive/[change-id]/
     ↓
Git commit: "chore: archive [change-id]"
     ↓
【然後才能】輸出 <promise>ALL TASKS COMPLETED</promise>
```

### 歸檔檢查清單

- [ ] 所有任務都已 `- [x]`
- [ ] 所有測試通過
- [ ] 程式碼已 commit
- [ ] **執行歸檔（必須在 promise 前完成）**
- [ ] 驗證 changes/ 目錄已清空

### 自動提醒機制

全域 Hook `~/.claude/hooks/check-archive.sh` 會在 SessionEnd 時：
1. 檢查 `openspec/changes/` 是否有未歸檔的變更
2. 如果有，輸出警告提醒

---

## 清理流程（Cleanup）

歸檔後執行清理，釋放空間。

For complete cleanup rules → read `cleanup.md`

### 完整結束流程

```
1. 所有任務完成 ✅
2. openspec archive [id] --yes
3. 執行清理（cleanup.md）
4. 檢查開發筆記（dev-notes.md）
5. 輸出 <promise>ALL TASKS COMPLETED</promise>
```

**順序很重要**：歸檔必須在 promise 輸出前完成！

---

## 開發筆記（Dev Notes）

執行過程中想到但不需當下處理的事項，記錄到 `openspec/changes/[change-id]/notes.md`。

工作流結束時會提醒用戶處理筆記內容。

For complete dev notes guide → read `dev-notes.md`
