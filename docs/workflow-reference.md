# Workflow System Reference

> 建立日期：2026-01-24
> 版本：3.0
> 用途：系統現狀記錄，作為重建時的參考

---

## 1. 系統架構

### 1.1 目錄結構

```
~/.claude/
├── CLAUDE.md                    # 全域配置入口
├── settings.json                # Claude Code 設定
├── hooks/                       # Hook 腳本
├── scripts/                     # 工具腳本
│   └── init.sh                  # 零配置初始化
├── plugins/workflow/            # Workflow Plugin
│   ├── agents/                  # Agent 定義
│   ├── skills/                  # Skill 知識庫
│   └── scripts/                 # Plugin 腳本
└── docs/                        # 文件
```

### 1.2 核心概念

| 概念 | 說明 |
|------|------|
| **Agent** | 執行特定任務的子代理（Task tool） |
| **Skill** | 提供知識和指引的 Markdown 文件 |
| **Hook** | 在特定事件觸發的腳本 |
| **OpenSpec** | 規格驅動開發的目錄結構 |

---

## 2. Agents

### 2.1 Agent 列表

| Agent | 職責 | Model | Skills |
|-------|------|-------|--------|
| **ARCHITECT** | 需求分析、規格制定 | sonnet | core |
| **DESIGNER** | UI/UX 設計、設計規格 | sonnet | core, design |
| **DEVELOPER** | 程式碼實作 | sonnet | core, design, dev |
| **REVIEWER** | 程式碼審查 | sonnet | core, review |
| **TESTER** | 測試執行 | haiku | core, testing |
| **DEBUGGER** | 除錯排查 | sonnet | core, debugger |
| **WORKFLOW** | 工作流設計 | sonnet | core, workflow |

### 2.2 Agent 定義格式

```yaml
---
name: agent-name
description: Agent description
model: sonnet | haiku | opus
skills: core, skill1, skill2
---

[Agent 指令內容]
```

### 2.3 Agent 檔案位置

```
plugins/workflow/agents/
├── architect/architect.md
├── designer/designer.md
├── developer/developer.md
├── reviewer/reviewer.md
├── tester/tester.md
├── debugger/debugger.md
└── workflow/workflow.md
```

---

## 3. Skills

### 3.1 Skill 結構

```
skills/[skill-name]/
├── SKILL.md              # 入口（必須）
└── references/           # 詳細參考（可選）
    ├── topic-1.md
    └── topic-2.md
```

### 3.2 Skill 列表

#### 根目錄 Skills（常用）

| Skill | 用途 | 被誰使用 |
|-------|------|----------|
| **core** | 核心規則（D→R→T、禁止硬編碼） | 所有 Agents |
| **main** | Main Agent 調度規則 | Main Agent |
| **workflow** | 工作流知識 | WORKFLOW Agent |
| **design** | UI/UX 設計摘要 | DESIGNER, DEVELOPER |
| **dev** | 開發專業知識 | DEVELOPER |
| **review** | 審查專業知識 | REVIEWER |
| **testing** | 測試專業知識 | TESTER |
| **debugger** | 除錯專業知識 | DEBUGGER |

#### Optional Skills（詳細參考）

| Skill | 用途 | 備註 |
|-------|------|------|
| **optional/ui** | 完整 UI 規範 | design skill 引用 |
| **optional/ux** | 完整 UX 規範 | design skill 引用 |
| **optional/browser** | 瀏覽器自動化 | E2E 測試用 |
| **optional/refactor** | 重構技術 | 進階 |
| **optional/migration** | 遷移規劃 | 進階 |
| **optional/skill-agent** | Skill/Agent 建立指南 | 元層級 |
| **optional/hooks-guide** | Hooks 配置指南 | 元層級 |

### 3.3 Skill Frontmatter 格式

```yaml
---
name: skill-name
description: Skill description
triggers:          # 可選：觸發關鍵字
  - 關鍵字1
  - keyword2
load:              # 可選：依賴的其他 skills
  - workflow:core
---
```

### 3.4 Progressive Disclosure 模式

```
設計原則：先載入摘要，需要時再讀詳細

design skill (摘要)
    ↓ 引用
optional/ui/ (完整 UI 規範)
optional/ux/ (完整 UX 規範)
```

---

## 4. 工作流程

### 4.1 D→R→T 流程

```
DEVELOPER → REVIEWER → TESTER
    ↓           ↓          ↓
  實作        審查       測試
    ↓           ↓          ↓
 變更摘要   PASS/REJECT  PASS/FAIL
```

**強制規則**：
- 寫完程式碼必須經過 R→T
- REVIEWER 可以 REJECT 並退回 DEVELOPER
- TESTER 必須先跑回歸測試

### 4.2 Plan-Act-Reflect（DEVELOPER 內部）

```
Sense → Plan → Act → Verify → Reflect → Output
  ↓       ↓      ↓      ↓        ↓        ↓
理解    規劃   實作   驗證     反思     摘要
```

### 4.3 OpenSpec 流程

```
openspec/
├── specs/      # Backlog - 待處理
├── changes/    # WIP - 進行中
│   └── [change-id]/
│       ├── proposal.md
│       ├── tasks.md
│       └── ui-specs/
└── archive/    # Done - 已完成
```

---

## 5. 觸發關鍵字

### 5.1 工作流觸發

| 關鍵字 | 動作 |
|--------|------|
| `規劃 [feature]` | ARCHITECT 建立 OpenSpec |
| `接手 [change-id]` | 從斷點恢復執行 |
| `loop` | 持續執行直到完成 |

### 5.2 單一 Agent 觸發

| 關鍵字 | Agent |
|--------|-------|
| 規劃, plan, 架構 | ARCHITECT |
| 設計, design, UI, UX | DESIGNER |
| 實作, implement, 開發 | DEVELOPER |
| 審查, review | REVIEWER |
| 測試, test | TESTER |
| debug, 除錯 | DEBUGGER |

---

## 6. 核心規則

### 6.1 禁止硬編碼

```python
# ❌ 禁止
if status == "pending":
    ...
result = {"status": "pending", "code": 200}

# ✅ 正確
class Status(Enum):
    PENDING = "pending"

if status == Status.PENDING:
    ...
```

### 6.2 回歸測試必做

```bash
# 每次測試 = 回歸 + 功能
pytest                    # 1. 先跑全部
pytest tests/test_new.py  # 2. 再跑新功能
```

### 6.3 紅線規則

| 違規 | 處理 |
|------|------|
| 寫完程式碼沒有 R→T | 停止，呼叫 reviewer/tester |
| 連續發送多個 Read/Grep | 停止，合併為一次 |
| Main Agent 長時間寫程式碼 | 停止，改用 Task(developer) |

---

## 7. 路徑規範

### 7.1 變數

| 變數 | 值 |
|------|-----|
| `${CLAUDE_PLUGIN_ROOT}` | `~/.claude/plugins/workflow` |

### 7.2 正確路徑格式

```
# 根目錄 skills
${CLAUDE_PLUGIN_ROOT}/skills/core/SKILL.md
${CLAUDE_PLUGIN_ROOT}/skills/design/SKILL.md

# Optional skills
${CLAUDE_PLUGIN_ROOT}/skills/optional/ui/SKILL.md
${CLAUDE_PLUGIN_ROOT}/skills/optional/ux/SKILL.md
${CLAUDE_PLUGIN_ROOT}/skills/optional/browser/SKILL.md
```

---

## 8. Agent 輸入/輸出契約

### 8.1 DEVELOPER 輸出格式

```markdown
## 變更摘要

### 修改檔案
- src/xxx.py

### 變更類型
[新功能/Bug修復/重構/優化]

### 關鍵變更
1. [變更 1]

### 🔄 自我反思結果
- 程式碼品質：✅
- 安全性：✅
- 效能：✅
- 完整性：✅
- 發現並修正：[問題或「無」]

### 測試建議
- [建議項目]
```

### 8.2 REVIEWER 輸出格式

```markdown
# Code Review: [scope]

## Verdict: ✅ APPROVED / 🔄 REQUEST CHANGES / ❌ REJECTED

## Issues Found
### 🔴 Critical
### 🟡 Important
### 🟢 Minor

## Action Required
```

### 8.3 TESTER 輸出格式

```markdown
## 🧪 測試結果

### 回歸測試
- 總數：XXX
- 通過：XXX ✅
- 失敗：XXX ❌

### 功能測試
- [結果]

### 結論
✅ PASS / ❌ FAIL
```

---

## 9. 已知問題與修正記錄

### 9.1 2026-01-24 修正

| 問題 | 修正 |
|------|------|
| Designer skills 引用錯誤 | `ui, ux, browser` → `design` |
| Designer 路徑錯誤 | `skills/ui/` → `skills/optional/ui/` |
| Debugger skills 引用錯誤 | `browser` → `debugger` |
| 重複的 skill 目錄 | 刪除 `~/.claude/skills/` 下的重複項 |

### 9.2 設計決策

| 決策 | 結論 |
|------|------|
| Skill 引用規則 | Agents 引用根目錄整合版，詳細內容讀 optional/ |
| 路徑格式 | 統一使用 `${CLAUDE_PLUGIN_ROOT}/skills/optional/...` |
| Frontmatter | 可觸發 skills 需要 triggers，內部引用不需要 |

---

## 10. 快速參考

### 10.1 常用指令

```bash
# 初始化新專案
~/.claude/scripts/init.sh [project-path]

# 觸發工作流
「規劃 [feature]」  # 開始新功能
「接手 [id]」       # 恢復進度
```

### 10.2 檔案速查

| 需求 | 檔案 |
|------|------|
| 全域配置 | `~/.claude/CLAUDE.md` |
| Agent 定義 | `plugins/workflow/agents/[name]/[name].md` |
| Skill 知識 | `plugins/workflow/skills/[name]/SKILL.md` |
| 設計 Tokens | `plugins/workflow/skills/optional/ui/references/tokens.md` |
| 元件規格 | `plugins/workflow/skills/optional/ui/references/components.md` |

---

---

## 11. 希望功能（重建目標）

### 11.1 更完整的文件系統

| 文件類型 | 目的 | 狀態 |
|----------|------|------|
| **API Reference** | 每個 Skill/Agent 的完整規格 | 待建立 |
| **Quick Start Guide** | 新用戶快速上手 | 待建立 |
| **Workflow Guide** | 工作流程詳細說明 | 待建立 |
| **Troubleshooting** | 常見問題解決 | 待建立 |

### 11.2 文件結構設計

```
~/.claude/docs/
├── README.md              # 入口，導覽所有文件
├── quick-start.md         # 快速上手
├── workflow-guide.md      # 工作流程
├── api/
│   ├── agents.md          # Agent API 參考
│   └── skills.md          # Skill API 參考
└── reference/
    ├── triggers.md        # 觸發詞完整列表
    ├── rules.md           # 核心規則
    └── troubleshooting.md # 問題排解
```

### 11.3 每個功能的文件要求

```markdown
## [功能名稱]

### 概述
[一句話說明這是什麼]

### 使用方式
[如何觸發/使用]

### 範例
[具體使用範例]

### 相關
[相關功能連結]
```

---

## 附錄：探索結果摘要

### A. Skills 結構分析

- 共 15 個 SKILL.md
- 根目錄 8 個：core, main, workflow, design, dev, review, testing, debugger
- Optional 7 個：ui, ux, browser, refactor, migration, skill-agent, hooks-guide

### B. Agents 結構分析

- 共 7 個 Agent
- 全部使用 `core` skill
- DESIGNER 使用 `design`（整合 ui+ux）
- DEVELOPER 使用 `design, dev`

### C. 路徑一致性

- 所有 optional skills 路徑已統一為 `skills/optional/...`
- Agent frontmatter 中的 skills 引用已修正
