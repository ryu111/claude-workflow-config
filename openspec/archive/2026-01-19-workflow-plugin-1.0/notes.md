# Workflow Plugin 1.0 - File Review Notes

詳細記錄每個檔案的檢查結果、需要精簡/優化的地方、潛在問題和風險。

---

## Agents Review

### developer.md
**檔案大小**: ~280 lines
**檢查結果**:
- 內容完整，定義了 DEVELOPER Agent 的職責
- 引用 `dev` 和 `refactor` skills
- 包含程式碼範本和最佳實踐

**需要優化**:
- [ ] 移除 `bundled_resources` 區塊（改用 skill references）
- [ ] 精簡「禁止硬編碼」區塊（與 dev skill 重複）
- [ ] 精簡「多進程清理」區塊（與 dev skill 重複）

**風險**: 無

---

### reviewer.md
**檔案大小**: ~180 lines
**檢查結果**:
- 定義了 REVIEWER Agent 的審查流程
- 引用 `review` skill
- 包含審查優先順序和 checklist

**需要優化**:
- [ ] 精簡 Code Smells 表格（與 review skill 重複）
- [ ] 移除硬編碼審查區塊（與 review skill 重複）

**風險**: 無

---

### tester.md
**檔案大小**: ~220 lines
**檢查結果**:
- 定義了 TESTER Agent 的測試策略
- 引用 `testing` skill
- 包含測試金字塔和 mock 最佳實踐

**需要優化**:
- [ ] 精簡測試範本（與 testing skill 重複）
- [ ] 精簡多進程測試規範（與 testing skill 重複）

**風險**: 無

---

### debugger.md
**檔案大小**: ~200 lines
**檢查結果**:
- 定義了 DEBUGGER Agent 的除錯流程
- 包含 5W1H 和科學方法除錯
- 使用 browser skill 進行 UI 除錯

**需要優化**:
- [ ] 精簡瀏覽器除錯區塊（與 browser skill 重複）

**風險**: 無

---

### architect.md
**檔案大小**: ~350 lines
**檢查結果**:
- 定義了 ARCHITECT Agent 的規劃流程
- 包含 OpenSpec 結構和 tasks.md 格式
- 較為獨立，無明顯重複

**需要優化**:
- [ ] 考慮將 OpenSpec 模板移至單獨 reference 檔案

**風險**: 無

---

### designer.md
**檔案大小**: ~300 lines
**檢查結果**:
- 定義了 DESIGNER Agent 的設計流程
- 引用 `ui` 和 `ux` skills
- 包含設計 checklist 和交付物格式

**需要優化**:
- [ ] 精簡風格選擇區塊（與 ui skill 重複）
- [ ] 精簡 60-30-10 法則（與 ui skill 重複）

**風險**: 無

---

### workflow.md
**檔案大小**: ~200 lines
**檢查結果**:
- 定義了 WORKFLOW Agent 的驗證流程
- 用於驗證 skills 和 agents 的正確性

**需要優化**:
- [ ] 無明顯需要精簡的內容

**風險**: 無

---

## Skills Review

### core/SKILL.md
**檔案大小**: ~120 lines
**References**: 5 個（drt-rules, fix-on-discovery, no-hardcoding, regression, status-display）

**檢查結果**:
- 定義三大原則（D->R->T、發現即修復、禁止硬編碼）
- 是所有 Agent 的基礎規則
- 內容精煉，無重複

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### main/SKILL.md
**檔案大小**: ~200 lines
**References**: 2 個（delegation, parallelization）

**檢查結果**:
- 定義 Main Agent 的調度規則
- 包含委派原則和並行化策略
- 內容精煉

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### workflow/SKILL.md
**檔案大小**: ~150 lines
**References**: 1 個（flows）

**檢查結果**:
- 定義工作流驗證規則
- 內容較精簡

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### dev/SKILL.md
**檔案大小**: ~500 lines
**References**: 5 個（clean-code, patterns, performance, security, templates）

**檢查結果**:
- 內容豐富，涵蓋開發各面向
- 包含命名規範、設計模式、安全實踐、效能優化
- 禁止硬編碼區塊與 core skill 重複

**需要優化**:
- [ ] 移除「禁止硬編碼」區塊（改為引用 core skill）
- [ ] 移除「多進程清理規範」（過於具體，考慮移至 reference）

**潛在問題**:
- 「禁止硬編碼」在 core、dev、review 三處重複

**風險**: 低

---

### refactor/SKILL.md
**檔案大小**: ~100 lines
**References**: 4 個（catalog, smells-to-refactoring, safety, patterns）

**檢查結果**:
- 定義重構流程和 Code Smells
- 內容精煉，與 review skill 互補

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### review/SKILL.md
**檔案大小**: ~280 lines
**References**: 4 個（code-smells, owasp, solid, templates）

**檢查結果**:
- 定義審查優先順序和 checklist
- 包含 Code Smells、OWASP、SOLID
- 硬編碼審查區塊與 core skill 重複

**需要優化**:
- [ ] 精簡「硬編碼」區塊（改為引用 core skill）

**潛在問題**:
- Code Smells 在 review 和 refactor 都有，但角度不同（審查 vs 重構）

**風險**: 低

---

### testing/SKILL.md
**檔案大小**: ~360 lines
**References**: 4 個（edge-cases, mocking, strategies, templates）

**檢查結果**:
- 定義測試策略和最佳實踐
- 內容完整，無重複

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### browser/SKILL.md
**檔案大小**: ~200 lines
**References**: 7 個（commands, design-validation, faq, scenarios, ui-bugs, ui-checklist, workflow-integration）

**檢查結果**:
- 定義 agent-browser CLI 使用指南
- References 內容豐富
- 無重複內容

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### ui/SKILL.md
**檔案大小**: ~330 lines
**References**: 18 個（含 styles/、templates/、demo/）

**檢查結果**:
- 內容最豐富的 skill
- 包含完整的 UI 設計系統
- 有 HTML demo 檔案

**需要優化**:
- [ ] 考慮將 demo/ 移至獨立位置（非必要）

**注意事項**:
- styles/ 目錄有 8 個風格定義檔
- templates/ 有提案模板
- demo/ 有可視化預覽 HTML

**風險**: 低（結構複雜需仔細處理）

---

### ux/SKILL.md
**檔案大小**: ~170 lines
**References**: 9 個（含 decision-rules）

**檢查結果**:
- 定義 UX 設計規範
- 包含心理學法則和情感設計
- 無重複內容

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

## Hooks Review

### workflow-gate.js
**檔案大小**: ~320 lines
**觸發時機**: PreToolUse

**檢查結果**:
- 工作流 2.0 核心阻擋邏輯
- 包含狀態機驗證、D->R->T 強制

**需要優化**:
- [ ] 常數定義與 state-updater.js 重複（STATES, AGENT_TYPES）
- [ ] 考慮提取共用常數模組

**潛在問題**:
- 路徑硬編碼：`STATE_FILE`, `CONFIG_FILE`
- `CODE_EXTENSIONS` 與 state-updater.js 重複

**風險**: 中（需處理常數重複）

---

### state-updater.js
**檔案大小**: ~350 lines
**觸發時機**: PostToolUse

**檢查結果**:
- 狀態轉換更新邏輯
- 包含系統通知功能

**需要優化**:
- [ ] 常數定義與 workflow-gate.js 重複
- [ ] 考慮提取共用常數模組

**潛在問題**:
- 路徑硬編碼
- `CODE_EXTENSIONS` 重複

**風險**: 中（需處理常數重複）

---

### task-sync.js
**檔案大小**: ~310 lines
**觸發時機**: PostToolUse

**檢查結果**:
- tasks.md 與 TodoWrite 雙向同步
- 功能完整

**需要優化**:
- [ ] 無明顯需要優化

**風險**: 低

---

### status-display.js
**檔案大小**: ~210 lines
**觸發時機**: PostToolUse

**檢查結果**:
- Agent 狀態顯示
- 包含並行任務檢測

**需要優化**:
- [ ] `AGENT_EMOJI`, `AGENT_NAMES` 與其他 hooks 重複
- [ ] 考慮提取共用常數

**風險**: 低

---

### bypass-handler.js
**檔案大小**: ~390 lines
**觸發時機**: CLI

**檢查結果**:
- Escape Hatch 機制
- 功能完整，有良好的錯誤處理

**需要優化**:
- [ ] 無明顯需要優化

**風險**: 低

---

### session-report.js
**檔案大小**: ~245 lines
**觸發時機**: SessionEnd

**檢查結果**:
- 委派統計報告生成
- 讀取 violations 記錄

**需要優化**:
- [ ] 路徑硬編碼

**潛在問題**:
- `VIOLATIONS_LOG` 路徑指向 tests 目錄（可能需要調整）

**風險**: 低

---

### process-manager.js
**檔案大小**: ~425 lines
**觸發時機**: 多時機

**檢查結果**:
- 進程追蹤和清理
- 功能完整

**需要優化**:
- [ ] 無明顯需要優化

**風險**: 低

---

### violation-tracker.js
**檔案大小**: ~415 lines
**觸發時機**: PostToolUse

**檢查結果**:
- D->R->T 違規追蹤
- 使用 JSONL 格式記錄

**需要優化**:
- [ ] 無明顯需要優化

**潛在問題**:
- 路徑指向 tests 目錄

**風險**: 低

---

### fix-on-discovery.sh
**檔案大小**: ~40 lines
**觸發時機**: PostToolUse(Bash)

**檢查結果**:
- 類型錯誤提醒
- 簡單有效

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### loop-heartbeat.sh
**檔案大小**: ~135 lines
**觸發時機**: PostToolUse

**檢查結果**:
- Loop 狀態持久化
- 使用 jq 處理 JSON

**需要優化**:
- [ ] 無需優化

**潛在問題**:
- 依賴 jq 工具

**風險**: 低

---

### loop-continue-reminder.sh
**檔案大小**: ~45 lines
**觸發時機**: UserPromptSubmit

**檢查結果**:
- Loop 插話提醒
- 簡單有效

**需要優化**:
- [ ] 無需優化

**風險**: 無

---

### loop-recovery-detector.js
**檔案大小**: ~160 lines
**觸發時機**: SessionStart

**檢查結果**:
- 未完成 Loop 檢測
- 功能完整

**需要優化**:
- [ ] 無需優化

**風險**: 低

---

## 常數重複問題總結

以下常數在多個 Hooks 中重複定義：

| 常數 | 出現在 |
|------|--------|
| `STATES` | workflow-gate.js, state-updater.js |
| `AGENT_TYPES` | workflow-gate.js, state-updater.js |
| `AGENT_STATE_MAP` | workflow-gate.js, state-updater.js |
| `AGENT_EMOJI` | state-updater.js, status-display.js |
| `AGENT_NAMES` | status-display.js |
| `CODE_EXTENSIONS` | workflow-gate.js, state-updater.js |
| `STATE_FILE` | 多個 hooks |

**建議**: 建立 `constants.js` 共用模組

---

## 路徑硬編碼問題總結

以下路徑在 Hooks 中硬編碼：

| 路徑 | 用途 | 建議 |
|------|------|------|
| `~/.claude/workflow-state/` | 狀態檔案 | 保持（全域狀態） |
| `~/.claude/hooks/config.json` | 配置檔案 | 保持 |
| `~/.claude/tests/workflow/results/` | 測試結果 | 考慮改為相對路徑 |
| `.claude/ralph-loop.local.md` | Loop 狀態 | 保持（專案相對） |

---

## 內容重複問題總結

| 內容 | 出現在 | 建議 |
|------|--------|------|
| 禁止硬編碼 | core, dev, review, developer.md, reviewer.md | 只在 core 保留完整版，其他引用 |
| Code Smells | review, refactor | 保持（角度不同） |
| 多進程規範 | dev, testing, developer.md, tester.md | 只在 dev 保留，其他引用 |
| 60-30-10 法則 | ui, designer.md | 只在 ui 保留，agent 引用 |

---

## 潛在風險總結

| 風險 | 等級 | 緩解措施 |
|------|------|----------|
| 常數重複導致不一致 | 中 | 建立共用模組 |
| 路徑硬編碼 | 低 | 遷移時統一處理 |
| hooks.json 合併 | 中 | 仔細規劃配置結構 |
| ui skill 結構複雜 | 低 | 保持原有子目錄結構 |

---

## 遷移優先級

1. **高優先級**: core, main（基礎規則）
2. **中優先級**: dev, review, testing, refactor（Agent 依賴）
3. **中優先級**: workflow, browser（工具支援）
4. **低優先級**: ui, ux（設計相關）

---

## 下一步行動

1. 建立 `constants.js` 共用模組
2. 精簡 Skills 中的重複內容
3. 精簡 Agents 中的重複內容
4. 開始 Phase 1 遷移
