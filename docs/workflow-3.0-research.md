# Workflow 3.0 研究筆記

> 狀態：**實作中**
> 建立日期：2026-01-24
> 最後更新：2026-01-24 (v3)

---

## 📊 功能進度總表

### 狀態說明
| 符號 | 意義 |
|------|------|
| ✅ | 已實作 |
| 🔧 | 已優化/精簡 |
| 🔍 | 已審查確認 |
| ⏳ | 待處理 |
| 🚫 | 已移除 |

---

### 原有功能

| # | 功能 | 包含內容 | 實現方式 | 狀態 |
|---|------|----------|----------|------|
| 1 | **D→R→T 工作流** | 強制流程、三種路徑、結果處理（APPROVE/REJECT/PASS/FAIL）、重試限制 | Hook + Steering | ✅ |
| 2 | **OpenSpec 規格驅動** | Kanban 三階段、tasks.md 格式、接手/恢復、完成檢測+歸檔 | Steering + Hook | ✅ |
| 3 | **專業 Agents 分工** | ARCHITECT、DESIGNER、DEVELOPER、REVIEWER、TESTER、DEBUGGER、SKILLS | Agent 定義 | ✅ |
| 4 | **Main Agent 調度** | 委派原則（監督者不執行者）、流程識別、Trigger Keywords | Steering + CLAUDE.md | ✅ |
| 5 | **並行執行** | 並行意圖偵測、建議並行數、無依賴操作同時執行 | ~~Hook~~ → CLAUDE.md | 🔧 |
| 6 | **狀態顯示** | Agent 啟動/結束顯示、Plugin 載入狀態 | ~~Hook~~ → CLAUDE.md | 🔧 |
| 7 | **Loop 模式** | 持續執行直到完成 | Trigger | 🚫 移除 |
| 8 | **核心原則** | 發現即修復、禁止硬編碼、誠實原則 | Steering | ✅ |
| 9 | **報告/追蹤** | 違規追蹤、Session Report（委派統計） | ~~Hook~~ → CLAUDE.md | 🔧 |

### 新增功能

| # | 功能 | 包含內容 | 實現方式 | 狀態 |
|---|------|----------|----------|------|
| 10 | **Steering Documents** | workflow.md、tech.md、structure.md | steering/ 目錄 | ✅ |
| 11 | **Plan-Act-Reflect** | DEVELOPER 自我反思機制 | 修改 Agent 定義 | ✅ |
| 12 | **零配置部署** | 自動偵測專案類型、一鍵初始化 | init.sh 腳本 | ⏳ |
| 13 | **LSP 整合** | 程式碼導航加速（50ms vs 45s） | 已有 plugins | ⏳ |

### Skills 精簡（14 → 8 核心）

| # | Skill | 說明 | 狀態 | 決定 |
|---|-------|------|------|------|
| 14 | core | 四大原則、D→R→T | ✅ | 保留 |
| 15 | main | 委派原則、並行化 | ✅ | 保留 |
| 16 | workflow | 流程指引、OpenSpec | ✅ | 保留 |
| 17 | dev | 開發專業知識（含 refactor 參考） | ✅ | 保留 |
| 18 | review | 審查專業知識 | ✅ | 保留 |
| 19 | testing | 測試專業知識 | ✅ | 保留 |
| 20 | debugger | 除錯專業知識 | ✅ | 保留（D→R→T 需要） |
| 21 | **design** | UI + UX 合併 | ✅ | **新建**（合併 ui + ux） |
| 22 | browser | 瀏覽器自動化 | 🔧 | → optional/ |
| 23 | migration | 遷移專業知識 | 🔧 | → optional/ |
| 24 | skill-agent | Skill/Agent 維護 | 🔧 | → optional/ |
| 25 | refactor | 重構專業知識 | 🔧 | → optional/（參考合併到 dev） |
| 26 | ui | UI 視覺設計 | 🔧 | → optional/（合併到 design） |
| 27 | ux | UX 使用者體驗 | 🔧 | → optional/（合併到 design） |
| 28 | hooks-guide | Hooks 配置指南 | 🔧 | → optional/ |

---

### 📈 統計

| 項目 | 之前 | 現在 | 變化 |
|------|------|------|------|
| Hooks | 26 | 7 | -73% |
| CLAUDE.md | 112 行 | 69 行 | -38% |
| 程式碼 | 2658 行 | 708 行 | -73% |
| Skills | 14 | 8 核心 + 7 optional | -43% 核心 |

| 類別 | 數量 | 狀態 |
|------|------|------|
| 原有功能 | 9 | 5✅ 3🔧 1🚫 |
| 新增功能 | 4 | 2✅ 2⏳ |
| Skills | 14 → 8 | 8✅ 核心，7🔧 optional |

---

## 🔴 重要發現：「LLM 自然遵循」不可靠

根據搜尋結果，**純靠文檔引導確實不可靠**：

| 來源 | 問題描述 |
|------|----------|
| [GitHub Issue #18660](https://github.com/anthropics/claude-code/issues/18660) | "CLAUDE.md instructions are read but **not reliably followed** - need enforcement mechanism" |
| [GitHub Issue #5055](https://github.com/anthropics/claude-code/issues/5055) | "Claude Code **repeatedly violates** user-defined rules in CLAUDE.md despite acknowledging them" |
| [DEV Community](https://dev.to/siddhantkcode/an-easy-way-to-stop-claude-code-from-forgetting-the-rules-h36) | "As instruction count increases, instruction-following quality **decreases uniformly**" |
| [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) | "CLAUDE.md files should be refined like any frequently used prompt" |

### 結論

- CLAUDE.md = **"should-do"** 建議（可能被忽略）
- Hooks = **"must-do"** 強制（確定執行）
- 兩者是**互補**的，不是替代關係

### 專家建議

> "Use hooks to enforce state validation at commit time (**block-at-submit**), not block-at-write"
> — [Medium: Claude Code Hooks](https://medium.com/@lakshminp/claude-code-hooks-the-feature-youre-ignoring-while-babysitting-your-ai-789d39b46f6c)

---

## 📋 功能清單 A：我們目前的核心功能

### 1. D→R→T 工作流

| 功能 | 說明 | 實現方式 | 保留? |
|------|------|----------|-------|
| **D→R→T 強制** | 程式碼修改必須經過 Review → Test | Hook: `workflow-gate.js` | |
| **三種合法路徑** | Main→R→T / Design→R→T / D→R→T | Skill: `core/SKILL.md` | |
| **結果處理** | APPROVE→TESTER / REJECT→DEVELOPER / PASS→完成 / FAIL→DEBUGGER | Skill: `workflow/SKILL.md` | |
| **重試限制** | max_retries=3，超過詢問用戶 | Skill 定義 | |

### 2. OpenSpec 規格驅動

| 功能 | 說明 | 實現方式 | 保留? |
|------|------|----------|-------|
| **Kanban 三階段** | specs/(待執行) → changes/(進行中) → archive/(完成) | 目錄結構 | |
| **tasks.md 格式** | Checkbox 格式 + agent/files/output 元資料 | Skill: `workflow/SKILL.md` | |
| **接手/恢復流程** | 讀取 tasks.md，從第一個 `[ ]` 繼續 | Trigger: `接手 [change-id]` | |
| **完成檢測** | 所有 `[x]` 後觸發歸檔流程 | Hook: `openspec-complete-detector.js` | |

### 3. 專業 Agents 分工

| Agent | 職責 | Trigger | 保留? |
|-------|------|---------|-------|
| 🏗️ ARCHITECT | 規劃 OpenSpec | `規劃`, `plan` | |
| 🎨 DESIGNER | UI/UX 設計 | `設計`, `UI` | |
| 💻 DEVELOPER | 寫程式碼 | `實作`, `開發` | |
| 🔍 REVIEWER | 審查程式碼 | `審查`, `review` | |
| 🧪 TESTER | 測試程式碼 | `測試`, `test` | |
| 🐛 DEBUGGER | 除錯 | `debug`, `除錯` | |
| 📚 SKILLS | Skill/Agent 維護 | `skill`, `agent` | |

### 4. Main Agent 調度

| 功能 | 說明 | 實現方式 | 保留? |
|------|------|----------|-------|
| **委派原則** | Main = 監督者，不是執行者 | Skill: `main/SKILL.md` | |
| **並行委派** | 無依賴的操作同時執行 | Skill 定義 + Hook 提醒 | |
| **流程識別** | 根據關鍵字選擇 Agent | Trigger Keywords 表 | |
| **Session Report** | 任務結束輸出執行報告 | Skill: `main/SKILL.md` | |

### 5. 並行執行提醒

| 功能 | 說明 | 實現方式 | 保留? |
|------|------|----------|-------|
| **並行意圖偵測** | 偵測可並行的操作 | Hook: `parallel-opportunity-detector.js` | |
| **建議並行數** | CPU 核心 × 75% | Hook 計算 | |

### 6. 狀態顯示

| 功能 | 說明 | 實現方式 | 保留? |
|------|------|----------|-------|
| **Agent 啟動顯示** | `## 🏗️ ARCHITECT 開始規劃 [任務]` | Hook: `agent-start-display.js` | |
| **Agent 結束顯示** | `## ✅ 💻 DEVELOPER 完成。啟動 R→T` | Skill 定義 | |
| **Plugin 載入狀態** | 顯示 Agents/Skills/Hooks 數量 | Hook: `plugin-status-display.js` | |

### 7. 其他功能

| 功能 | 說明 | 實現方式 | 保留? |
|------|------|----------|-------|
| **Loop 模式** | 持續執行直到完成 | Trigger: `loop` | |
| **發現即修復** | 發現問題立即修復，不分範圍 | Skill: `core/SKILL.md` 四大原則 | |
| **禁止硬編碼** | 使用語言特性定義常數 | Skill: `core/SKILL.md` | |
| **違規追蹤** | 記錄 D→R→T 違規 | Hook: `violation-tracker.js` | |
| **Session Report** | 委派統計、違規事項 | Hook: `session-report.js` | |

---

## 📋 功能清單 B：其他專案的功能（附出處）

### 1. claude-code-spec-workflow

> 來源：https://github.com/Pimzino/claude-code-spec-workflow

| 功能 | 說明 | 我們有嗎 | 採用? |
|------|------|----------|-------|
| **Steering Documents** | `steering/` 目錄持久化專案上下文（product.md, tech.md, structure.md） | ❌ 沒有 | |
| **60-80% Token 減少** | 專用命令獲取上下文，避免冗餘 | ❌ 沒有 | |
| **一鍵觸發流程** | `/spec-create feature-name` 啟動整個流程 | ⚠️ 類似（接手） | |
| **四階段明確分離** | Requirements → Design → Tasks → Implementation | ⚠️ 類似（OpenSpec） | |
| **驗證代理** | spec-requirements-validator, spec-design-validator, spec-task-validator | ❌ 沒有 | |
| **Bug 修復工作流** | `/bug-create` → `/bug-analyze` → `/bug-fix` → `/bug-verify` | ❌ 沒有 | |
| **零配置部署** | 自動檢測專案類型 | ❌ 沒有 | |

### 2. OneRedOak/claude-code-workflows

> 來源：https://github.com/OneRedOak/claude-code-workflows

| 功能 | 說明 | 我們有嗎 | 採用? |
|------|------|----------|-------|
| **Dual-Loop 架構** | 手動 Slash Commands + 自動 GitHub Actions | ❌ 沒有 GitHub Actions | |
| **Security Review** | OWASP Top 10、洩密檢測、攻擊向量分析 | ⚠️ 部分（REVIEWER） | |
| **Design Review** | 用 Playwright 進行 UI/UX 一致性檢查 | ⚠️ 類似（browser skill） | |
| **任務分工哲學** | "AI 處理常規工作，人類專注架構對齊" | ✅ 類似 | |

### 3. claude-code-showcase

> 來源：https://github.com/ChrisWiles/claude-code-showcase

| 功能 | 說明 | 我們有嗎 | 採用? |
|------|------|----------|-------|
| **Skills 自動啟用** | YAML frontmatter 的 description 驅動匹配 | ✅ 有 | |
| **Hook 精簡原則** | 只在關鍵點（commit time）阻擋 | ⚠️ 我們太多 hooks | |
| **MCP Servers 整合** | 連接 JIRA、GitHub、Slack、資料庫 | ❌ 沒有 | |
| **GitHub Actions 整合** | PR 自動 review、每週品質掃描、每月文檔同步 | ❌ 沒有 | |
| **LSP 支援** | 實時型別檢查提高生成準確度 | ❌ 沒有 | |

### 4. shinpr/claude-code-workflows

> 來源：https://github.com/shinpr/claude-code-workflows

| 功能 | 說明 | 我們有嗎 | 採用? |
|------|------|----------|-------|
| **Quality-Fixer Agent** | 自動修復問題，不只報告 | ⚠️ 類似（DEBUGGER） | |
| **雙外掛架構** | dev-workflows + dev-workflows-frontend 分離 | ❌ 沒有 | |
| **共享代理機制** | investigator、verifier、solver 等共用 | ⚠️ 部分 | |

### 5. 其他框架的通用模式

| 功能 | 來源 | 我們有嗎 | 採用? |
|------|------|----------|-------|
| **Generator-Critic Pattern** | [Google ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/) | ✅ D→R 類似 | |
| **Maker-Checker Loop** | [Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns) | ✅ D→R→T 類似 | |
| **認知分離原則** | [Qodo](https://www.qodo.ai/blog/the-multi-agent-revolution-why-software-engineering-principles-must-govern-ai-systems/) | ✅ Agent 分工 | |
| **Technical Design Spec Pattern** | [Arguing with Algorithms](https://www.arguingwithalgorithms.com/posts/technical-design-spec-pattern.html) | ✅ OpenSpec | |
| **Plan-Act-Reflect** | [Medium](https://medium.com/@elisheba.t.anderson/building-with-ai-coding-agents-best-practices-for-agent-workflows-be1d7095901b) | ⚠️ 部分 | |

---

## 🎯 用戶確認想要的功能

### 1. Plan-Act-Reflect ✅ 想要

> 來源：[ByteByteGo](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns), [MachineLearningMastery](https://machinelearningmastery.com/7-must-know-agentic-ai-design-patterns/)

```
Sense → Plan → Act → Reflect → (循環)
  ↓       ↓      ↓       ↓
觀察    規劃   執行    評估
```

**核心概念**：
> "After producing an output, the agent **critiques it**, records reflections, and **revises**—first described in Reflexion (Shinn et al., 2023)"

**對應我們的系統**：

| 階段 | 對應 | 狀態 |
|------|------|------|
| Sense | 讀取需求/程式碼 | ✅ 有 |
| Plan | ARCHITECT | ✅ 有 |
| Act | DEVELOPER | ✅ 有 |
| Reflect | REVIEWER + TESTER | ⚠️ 缺少「自我反思」 |

**需要補強**：目前 REVIEWER 是獨立 agent，不是同一個 agent 自我反思。可考慮加入「Reflect」階段讓 agent 自我評估。

**實現建議**：
- 在 DEVELOPER 完成後，先讓它自我檢查（Reflect）
- 然後再送給 REVIEWER 做獨立審查
- 形成「自我反思 + 外部審查」雙重保障

---

### 2. Steering Documents ✅ 想要

> 來源：[claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow)

```
steering/
├── product.md   - 願景、目標用戶、成功指標
├── tech.md      - 技術棧、開發工具、約束條件
└── structure.md - 檔案組織、命名約定、導入模式
```

**效益**：
- 60-80% Token 減少
- 避免每次重複說明專案上下文
- 持久化專案知識

**實現方式**：
- 在 `.claude/steering/` 目錄放置這些文件
- CLAUDE.md 引用這些文件
- 或用專用命令按需載入

---

### 3. 零配置部署 ✅ 想要

> 來源：[ZCF](https://github.com/UfoMiao/zcf), [Meridian](https://github.com/markmdev/meridian)

**現有工具**：

| 工具 | 安裝方式 | 特點 |
|------|----------|------|
| **ZCF** | `npx zcf i` | 自動檢測專案類型，一鍵初始化 |
| **Meridian** | `curl \| bash` | hooks 自動啟用，MCP 自動連接 |
| **Claude Code 原生** | `/config` | 可請 Claude 分析專案生成配置 |

**我們的實現方式**：
- 寫一個 `init.sh` 腳本
- 自動偵測專案類型（package.json → Node, pyproject.toml → Python 等）
- 根據類型設定適當的 skills/agents/hooks

---

### 4. LSP 支援 ✅ 想要

> 來源：[Claude Code 2.0.74](https://www.aifreeapi.com/en/posts/claude-code-lsp), [Hacker News](https://news.ycombinator.com/item?id=46355165)

**好消息：Claude Code 已經內建 LSP 支援！**

**安裝方式**：
```bash
# 在 /plugin Discover 搜尋 "lsp" 安裝
```

**支援語言**：Python, TypeScript, Go, Rust, Java, C/C++, C#, PHP, Kotlin, Ruby, HTML/CSS

**效益**：
- 50ms vs 45秒 的程式碼導航
- 即時 diagnostics（錯誤/警告）
- go-to-definition、find-references

**注意事項**：
> José Valim：「LSP APIs 對 agentic 使用不太友好，需要 file:line:column」

**我們的行動**：
- [ ] 安裝 LSP plugins
- [ ] 測試效果
- [ ] 整合到工作流中

---

### 5. Hook 精簡 ✅ 想要

**問題核心**：是「LLM 不可靠」所以需要 hooks，還是「我們寫太多」？

**答案：兩者皆是，但我們確實寫太多了。**

#### 目前 16 個 Hooks 分類

| 類型 | Hooks | 數量 | 必要性 |
|------|-------|------|--------|
| **強制類** | workflow-gate, drt-completion-checker, subagent-validator | 3 | ✅ 必要 |
| **顯示類** | agent-start-display, plugin-status-display, status-display | 3 | ⚠️ 可選 |
| **提醒類** | parallel-opportunity-detector, prompt-router | 2 | ⚠️ 可選 |
| **追蹤類** | violation-tracker, session-report, state-updater, task-sync | 4 | ❓ 過度 |
| **流程類** | loop-manager, loop-recovery-detector, openspec-complete-detector, completion-enforcer | 4 | ❓ 部分過度 |

#### 專家建議

> "Use hooks to enforce state validation at **commit time** (block-at-submit), not block-at-write"
> — [Medium](https://medium.com/@lakshminp/claude-code-hooks-the-feature-youre-ignoring-while-babysitting-your-ai-789d39b46f6c)

> "Experts intentionally **do not use** 'block-at-write' hooks. Blocking an agent mid-plan confuses it."

#### 建議精簡方案

**保留（3-4 個）**：

| Hook | 用途 | 觸發點 |
|------|------|--------|
| `workflow-gate` | D→R→T 強制 | PreToolUse (Task) |
| `openspec-complete-detector` | 完成檢測 | PreCompact |
| `session-report` | 結束報告 | SessionEnd |
| `plugin-status-display` | 啟動顯示 | SessionStart |

**移除或合併**：
- 顯示類 → 合併成 1 個，或改用 CLAUDE.md
- 追蹤類 → 改用 CLAUDE.md 的 Session Report 格式
- 流程類 → 大部分改用 Skill 引導

---

## 🎯 差距分析：我們缺少什麼

| 優先度 | 功能 | 來源 | 效益 | 採用? |
|--------|------|------|------|-------|
| ⭐⭐⭐ | **Steering Documents** | spec-workflow | 減少 token、持久化上下文 | |
| ⭐⭐⭐ | **Hook 精簡** | showcase | 減少延遲、避免衝突 | |
| ⭐⭐ | **GitHub Actions 整合** | OneRedOak, showcase | Dual-loop 自動化 | |
| ⭐⭐ | **Slash Commands 系統** | spec-workflow | 明確流程入口 | |
| ⭐⭐ | **驗證代理** | spec-workflow | 自動驗證規格品質 | |
| ⭐ | **Bug 修復工作流** | spec-workflow | 專門的除錯流程 | |
| ⭐ | **MCP 整合** | showcase | 連接外部工具 | |

---

## 📝 討論記錄

### 2026-01-24 (Round 5) - Plan-Act-Reflect 實作

**已完成**：
1. ✅ 修改 DEVELOPER agent，加入 Plan-Act-Reflect 工作流
2. ✅ 加入「Reflect」自我反思階段
3. ✅ 更新輸出格式，包含反思結果
4. ✅ 更新 skill 引用（ui → design）
5. ✅ 修改 REVIEWER agent，加入「輸入預期」（參考自我反思結果）
6. ✅ 修改 TESTER agent，加入「輸入預期」（參考測試建議）+ 修正 browser 路徑

**Plan-Act-Reflect 流程**：
```
Sense → Plan → Act → Verify → Reflect → Output
  ↓       ↓      ↓      ↓        ↓        ↓
理解    規劃   實作   驗證     反思     摘要
```

**D→R→T 整合**：
```
DEVELOPER (含 Reflect) → REVIEWER → TESTER
     自我反思              參考結果    參考建議
     ↓                    獨立審查    回歸優先
     輸出摘要
```

**Reflect 檢查清單**：
- 程式碼品質（命名、單一職責、無硬編碼）
- 安全性（無注入、無洩露）
- 效能（無 N+1、無不必要計算）
- 完整性（邊界處理、錯誤處理）

### 2026-01-24 (Round 4) - Skills 精簡

**已完成**：
1. ✅ 分析 8 個待決定 Skills
2. ✅ 建立 design skill（合併 ui + ux）
3. ✅ 更新 dev skill（加入 refactor 參考）
4. ✅ 移動 7 個 skills 到 optional/
   - browser, migration, skill-agent, refactor, ui, ux, hooks-guide

**Skills 結構**：
- 核心 Skills：8 個（core, main, workflow, dev, review, testing, debugger, design）
- Optional Skills：7 個（需要時載入）

### 2026-01-24 (Round 3) - 實作階段

**已完成**：
1. ✅ 建立 workflow-3.0 分支
2. ✅ Hooks 精簡：26 → 7（刪除 19 個）
3. ✅ CLAUDE.md 精簡：112 → 69 行
4. ✅ 建立 steering/ 目錄（workflow.md, tech.md, structure.md）
5. ✅ 刪除 memory hooks（改用 MCP memory-service）
6. ✅ 更新 plugin hooks.json

**統計**：
- 刪除 2658 行舊代碼
- 新增 708 行
- 淨減少 ~1950 行

### 2026-01-24 (Round 2)

**用戶確認想要的功能**：
1. ✅ Plan-Act-Reflect - 需要補強「自我反思」機制
2. ✅ Steering Documents - 持久化上下文
3. ✅ 零配置部署 - 寫 init.sh 腳本
4. ✅ LSP 支援 - Claude Code 已內建，需安裝 plugins
5. ✅ Hook 精簡 - 從 26 個減到 7 個

**Hook 精簡結論**：
- 是「LLM 不可靠」+ 「我們寫太多」兩個原因
- 專家建議：只在 commit time 阻擋，不要 block-at-write
- 顯示/提醒類可改用 CLAUDE.md

### 2026-01-24 (Round 1)

1. **初始研究** - 搜尋並分析 8+ 個相關專案
2. **關鍵發現** - LLM 不會自然遵循指令，需要 Hooks 強制
3. **功能清單** - 整理我們的功能 + 其他專案的功能

### 實作進度

- [x] 新功能：Plan-Act-Reflect、Steering Documents、零配置、LSP、Hook 精簡
- [x] Hook 精簡策略：26 → 7 個核心 hooks ✅ 已完成
- [x] 新架構的目錄結構 ✅ 已完成
- [x] Steering Documents 建立 ✅ 已完成
- [x] CLAUDE.md 精簡（112 → 69 行）✅ 已完成
- [x] Skills 精簡：14 → 8 核心 + 7 optional ✅ 已完成
  - 合併 ui + ux → design
  - refactor 參考合併到 dev
  - 7 個移到 optional/（browser, migration, skill-agent, refactor, ui, ux, hooks-guide）
- [x] 推送到 GitHub ✅
- [x] 建立 PR: https://github.com/ryu111/claude-workflow-config/pull/2 ✅（已關閉）
- [x] Plan-Act-Reflect 實作 ✅ 已完成
  - 修改 DEVELOPER agent 加入 Reflect 階段
  - 自我反思檢查清單（品質、安全、效能、完整性）
  - 輸出格式包含反思結果
- [ ] 零配置部署腳本

---

## 🏗️ 實際架構（已實作）

```
.claude/
├── CLAUDE.md                    ← 精簡入口（69 行）✅
├── steering/                    ← 持久化上下文 ✅
│   ├── workflow.md              - D→R→T 規則、Agent 調度
│   ├── tech.md                  - 技術棧、開發工具
│   └── structure.md             - 目錄結構、命名慣例
├── plugins/workflow/            ← 工作流 plugin
│   ├── hooks/                   - 7 個核心 hooks ✅
│   │   ├── workflow-gate.js     - D→R→T 強制
│   │   ├── drt-completion-checker.js
│   │   ├── subagent-validator.js
│   │   ├── openspec-complete-detector.js
│   │   └── plugin-status-display.js
│   ├── skills/                  - 8 核心 + 7 optional ✅
│   │   ├── core/                - 四大原則
│   │   ├── main/                - Main Agent 調度
│   │   ├── workflow/            - OpenSpec 流程
│   │   ├── dev/                 - 開發（含 refactor）
│   │   ├── review/              - 審查
│   │   ├── testing/             - 測試
│   │   ├── debugger/            - 除錯
│   │   ├── design/              - UI + UX（新）
│   │   └── optional/            - 非必要 skills
│   │       ├── browser/
│   │       ├── migration/
│   │       ├── skill-agent/
│   │       ├── refactor/
│   │       ├── ui/
│   │       ├── ux/
│   │       └── hooks-guide/
│   └── agents/                  - 7 個
├── hooks/                       ← 通用 hooks
│   ├── llm/                     - LLM 服務檢查
│   ├── ui/                      - statusline
│   └── utilities/               - 清理工具
└── settings.json                ← 7 個 hooks ✅
```

### Hooks 清單（7 個）

| Hook | 觸發點 | 用途 |
|------|--------|------|
| plugin-status-display | SessionStart | 啟動顯示 |
| check-llm-service | SessionStart | LLM 檢查 |
| session-start-cleanup | SessionStart | 清理實例 |
| workflow-gate | PreToolUse | D→R→T 強制 |
| subagent-validator | SubagentStop | 輸出驗證 |
| drt-completion-checker | Stop | 完成檢查 |
| openspec-complete-detector | PreCompact | OpenSpec 完成 |

---

## 📚 參考資料

### 官方文檔
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code LSP Guide](https://www.aifreeapi.com/en/posts/claude-code-lsp)

### 社群專案
- [claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow)
- [OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)
- [claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [shinpr/claude-code-workflows](https://github.com/shinpr/claude-code-workflows)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [ZCF (Zero-Config Claude-Code Flow)](https://github.com/UfoMiao/zcf)
- [Meridian](https://github.com/markmdev/meridian)

### 設計模式
- [Google ADK Multi-Agent Patterns](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Microsoft Azure AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Technical Design Spec Pattern](https://www.arguingwithalgorithms.com/posts/technical-design-spec-pattern.html)
- [ByteByteGo: Top AI Agentic Workflow Patterns](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns)
- [MachineLearningMastery: 7 Agentic AI Design Patterns](https://machinelearningmastery.com/7-must-know-agentic-ai-design-patterns/)

### GitHub Issues（LLM 遵循問題）
- [#18660: CLAUDE.md instructions not reliably followed](https://github.com/anthropics/claude-code/issues/18660)
- [#5055: Claude repeatedly violates user-defined rules](https://github.com/anthropics/claude-code/issues/5055)

### Hooks 最佳實踐
- [Medium: Claude Code Hooks](https://medium.com/@lakshminp/claude-code-hooks-the-feature-youre-ignoring-while-babysitting-your-ai-789d39b46f6c)
- [Hacker News: Claude Code LSP](https://news.ycombinator.com/item?id=46355165)
