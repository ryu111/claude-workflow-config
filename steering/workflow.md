# Workflow Rules

工作流詳細規則。CLAUDE.md 只放核心原則，詳細規則在此。

## D→R→T 工作流

```
程式碼修改 → REVIEWER → TESTER
    ↑           │          │
    │        REJECT      FAIL
    │           │          │
    └───────────┘          ↓
                       DEBUGGER
                           │
                           ↓
                   回到 DEVELOPER
```

### 三種合法路徑

| 路徑 | 說明 |
|------|------|
| Main → R → T | Main 直接修復小問題 |
| Design → R → T | DESIGNER 設計後實作 |
| D → R → T | 一般開發流程 |

**共同點：都必須經過 R → T**

### 結果處理

| Agent | 結果 | 下一步 |
|-------|------|--------|
| REVIEWER | APPROVE | → TESTER |
| REVIEWER | REJECT | → DEVELOPER（重試） |
| TESTER | PASS | → 任務完成 |
| TESTER | FAIL | → DEBUGGER → DEVELOPER |

## Agent 調度

### Main Agent 職責

```
Main Agent = 監督者 + 調度者，不是執行者

應該做：
✓ 委派任務給 Sub Agents
✓ 監督工作流是否失效
✓ 處理未被歸類的臨時任務

不應該做：
✗ 長時間執行程式碼撰寫
✗ 獨佔對話導致無法回應用戶
```

### Agent 選擇

| 任務類型 | Agent |
|----------|-------|
| 規劃、架構、分析需求 | workflow:architect |
| UI/UX 設計 | workflow:designer |
| 開發、實作 | workflow:developer |
| 程式碼審查 | workflow:reviewer |
| 測試、QA | workflow:tester |
| 除錯、修復 bug | workflow:debugger |

## 並行策略

### 原則

```
無依賴 → 並行
有依賴 → 串行
```

### 判斷方式

| 操作 | 處理 |
|------|------|
| 讀取多個不同檔案 | 並行 |
| 搜尋多個不同模式 | 並行 |
| 多個獨立的 D→R→T | 並行啟動 |
| Read → Edit 同一檔案 | 串行 |
| Task A 的輸出是 Task B 的輸入 | 串行 |

### OpenSpec tasks.md 依賴標記

```markdown
## Phase 1 (parallel)
- [ ] 1.1 Task A | files: src/a.ts
- [ ] 1.2 Task B | files: src/b.ts

## Phase 2 (sequential, depends: 1)
- [ ] 2.1 Task C | files: src/c.ts | needs: 1.1
```

## 重試限制

| 參數 | 值 |
|------|-----|
| max_retries | 3 |
| 超過限制 | 暫停，詢問用戶 |
