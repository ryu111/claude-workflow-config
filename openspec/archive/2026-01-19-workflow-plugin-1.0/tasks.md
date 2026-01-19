# Workflow Plugin 1.0 Implementation Tasks

## Progress
- Total: 6 phases
- Completed: 6
- Status: COMPLETED
- Archived: 2026-01-19

---

## Phase 1: Plugin 基礎結構 (sequential)

- [x] 1.1 建立 Plugin 目錄結構 | files: ~/.claude/plugins/workflow/
- [x] 1.2 建立 plugin.json 元資料 | files: ~/.claude/plugins/workflow/.claude-plugin/plugin.json
- [x] 1.3 建立 hooks.json 配置 | files: ~/.claude/plugins/workflow/hooks/hooks.json

---

## Phase 2: Skills 遷移 (sequential)

### 2.1 Core Skill
- [ ] 2.1.1 檢查 core skill 內容，識別重複/過時內容 | files: ~/.claude/skills/core/
- [ ] 2.1.2 精簡並優化 core skill | files: ~/.claude/skills/core/SKILL.md
- [ ] 2.1.3 遷移 core skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/core/

### 2.2 Main Skill
- [ ] 2.2.1 檢查 main skill 內容 | files: ~/.claude/skills/main/
- [ ] 2.2.2 精簡並優化 main skill | files: ~/.claude/skills/main/SKILL.md
- [ ] 2.2.3 遷移 main skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/main/

### 2.3 Workflow Skill
- [ ] 2.3.1 檢查 workflow skill 內容 | files: ~/.claude/skills/workflow/
- [ ] 2.3.2 精簡並優化 workflow skill | files: ~/.claude/skills/workflow/SKILL.md
- [ ] 2.3.3 遷移 workflow skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/workflow/

### 2.4 Dev Skill
- [ ] 2.4.1 檢查 dev skill 內容 | files: ~/.claude/skills/dev/
- [ ] 2.4.2 精簡並優化 dev skill | files: ~/.claude/skills/dev/SKILL.md
- [ ] 2.4.3 遷移 dev skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/dev/

### 2.5 Refactor Skill
- [ ] 2.5.1 檢查 refactor skill 內容 | files: ~/.claude/skills/refactor/
- [ ] 2.5.2 精簡並優化 refactor skill | files: ~/.claude/skills/refactor/SKILL.md
- [ ] 2.5.3 遷移 refactor skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/refactor/

### 2.6 Review Skill
- [ ] 2.6.1 檢查 review skill 內容 | files: ~/.claude/skills/review/
- [ ] 2.6.2 精簡並優化 review skill | files: ~/.claude/skills/review/SKILL.md
- [ ] 2.6.3 遷移 review skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/review/

### 2.7 Testing Skill
- [ ] 2.7.1 檢查 testing skill 內容 | files: ~/.claude/skills/testing/
- [ ] 2.7.2 精簡並優化 testing skill | files: ~/.claude/skills/testing/SKILL.md
- [ ] 2.7.3 遷移 testing skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/testing/

### 2.8 Browser Skill
- [ ] 2.8.1 檢查 browser skill 內容 | files: ~/.claude/skills/browser/
- [ ] 2.8.2 精簡並優化 browser skill | files: ~/.claude/skills/browser/SKILL.md
- [ ] 2.8.3 遷移 browser skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/browser/

### 2.9 UI Skill
- [ ] 2.9.1 檢查 ui skill 內容（含 styles/templates/demo） | files: ~/.claude/skills/ui/
- [ ] 2.9.2 精簡並優化 ui skill | files: ~/.claude/skills/ui/SKILL.md
- [ ] 2.9.3 遷移 ui skill 到 Plugin（含子目錄） | files: ~/.claude/plugins/workflow/skills/ui/

### 2.10 UX Skill
- [ ] 2.10.1 檢查 ux skill 內容 | files: ~/.claude/skills/ux/
- [ ] 2.10.2 精簡並優化 ux skill | files: ~/.claude/skills/ux/SKILL.md
- [ ] 2.10.3 遷移 ux skill 到 Plugin | files: ~/.claude/plugins/workflow/skills/ux/

---

## Phase 3: Agents 遷移 (sequential)

- [ ] 3.1 檢查並優化 developer agent | files: ~/.claude/agents/developer.md
- [ ] 3.2 檢查並優化 reviewer agent | files: ~/.claude/agents/reviewer.md
- [ ] 3.3 檢查並優化 tester agent | files: ~/.claude/agents/tester.md
- [ ] 3.4 檢查並優化 debugger agent | files: ~/.claude/agents/debugger.md
- [ ] 3.5 檢查並優化 architect agent | files: ~/.claude/agents/architect.md
- [ ] 3.6 檢查並優化 designer agent | files: ~/.claude/agents/designer.md
- [ ] 3.7 檢查並優化 workflow agent | files: ~/.claude/agents/workflow.md
- [ ] 3.8 遷移所有 agents 到 Plugin | files: ~/.claude/plugins/workflow/agents/

---

## Phase 4: Hooks 遷移 (sequential)

### 4.1 核心 Hooks
- [ ] 4.1.1 檢查並優化 workflow-gate.js | files: ~/.claude/hooks/workflow/workflow-gate.js
- [ ] 4.1.2 檢查並優化 state-updater.js | files: ~/.claude/hooks/workflow/state-updater.js
- [ ] 4.1.3 檢查並優化 task-sync.js | files: ~/.claude/hooks/workflow/task-sync.js
- [ ] 4.1.4 檢查並優化 status-display.js | files: ~/.claude/hooks/workflow/status-display.js
- [ ] 4.1.5 檢查並優化 bypass-handler.js | files: ~/.claude/hooks/workflow/bypass-handler.js
- [ ] 4.1.6 檢查並優化 session-report.js | files: ~/.claude/hooks/workflow/session-report.js
- [ ] 4.1.7 檢查並優化 process-manager.js | files: ~/.claude/hooks/workflow/process-manager.js
- [ ] 4.1.8 檢查並優化 violation-tracker.js | files: ~/.claude/hooks/core/workflow-violation-tracker.js

### 4.2 輔助 Hooks
- [ ] 4.2.1 檢查並優化 fix-on-discovery.sh | files: ~/.claude/hooks/core/fix-on-discovery.sh
- [ ] 4.2.2 檢查並優化 loop-heartbeat.sh | files: ~/.claude/hooks/workflow/loop-heartbeat.sh
- [ ] 4.2.3 檢查並優化 loop-continue-reminder.sh | files: ~/.claude/hooks/workflow/loop-continue-reminder.sh
- [ ] 4.2.4 檢查並優化 loop-recovery-detector.js | files: ~/.claude/hooks/core/loop-recovery-detector.js

### 4.3 Hooks 整合
- [ ] 4.3.1 遷移所有 hooks 到 Plugin | files: ~/.claude/plugins/workflow/hooks/
- [ ] 4.3.2 更新 hooks.json 路徑引用 | files: ~/.claude/plugins/workflow/hooks/hooks.json
- [ ] 4.3.3 測試 hooks 觸發機制 | output: test results

---

## Phase 5: 清理全域檔案 (sequential, depends: Phase 2-4)

- [ ] 5.1 刪除全域 skills 目錄（已遷移的） | files: ~/.claude/skills/core, main, workflow, dev, refactor, review, testing, browser, ui, ux
- [ ] 5.2 刪除全域 agents 檔案 | files: ~/.claude/agents/*.md
- [ ] 5.3 刪除全域 hooks 檔案 | files: ~/.claude/hooks/workflow/, ~/.claude/hooks/core/相關檔案
- [ ] 5.4 更新 CLAUDE.md 中的路徑引用 | files: ~/.claude/CLAUDE.md

---

## Phase 6: 整合驗證 (sequential, depends: Phase 5)

- [ ] 6.1 驗證 Plugin 載入 | output: Plugin 正常載入
- [ ] 6.2 測試 skill 觸發 | output: 所有 skills 正常觸發
- [ ] 6.3 測試 agent 委派 | output: D->R->T 流程正常
- [ ] 6.4 測試 hooks 執行 | output: hooks 正常觸發
- [ ] 6.5 測試 Loop 功能 | output: Loop 正常運作

---

## Notes

### 每個 Skill 檢查清單
1. SKILL.md 是否有過時內容？
2. references/ 是否有重複或可合併的檔案？
3. 路徑引用是否需要更新？
4. frontmatter 是否正確？

### 每個 Agent 檢查清單
1. Agent 定義是否與 skill 重複？
2. 技術棧引用是否需要更新？
3. 觸發關鍵字是否正確？

### 每個 Hook 檢查清單
1. 路徑引用是否硬編碼？
2. 狀態檔案路徑是否需要更新？
3. 常數是否重複定義？
4. 錯誤處理是否完整？
