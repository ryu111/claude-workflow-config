# Workflow Plugin 1.0 Proposal

## Summary

將現有的 workflow 系統（skills、agents、hooks）打包成獨立的 Claude Code Plugin，實現：
1. 模組化：workflow 系統成為可插拔的獨立單元
2. 可攜性：可在不同專案/機器之間輕鬆遷移
3. 版本控制：Plugin 有獨立版本號，便於升級管理

---

## Scope

### 要遷移的內容

#### Agents（7 個）

| Agent | 檔案 | 大小 | 說明 |
|-------|------|------|------|
| developer | `~/.claude/agents/developer.md` | ~280 lines | 開發專業 Agent |
| reviewer | `~/.claude/agents/reviewer.md` | ~180 lines | 審查專業 Agent |
| tester | `~/.claude/agents/tester.md` | ~220 lines | 測試專業 Agent |
| debugger | `~/.claude/agents/debugger.md` | ~200 lines | 除錯專業 Agent |
| architect | `~/.claude/agents/architect.md` | ~350 lines | 架構規劃 Agent |
| designer | `~/.claude/agents/designer.md` | ~300 lines | UI/UX 設計 Agent |
| workflow | `~/.claude/agents/workflow.md` | ~200 lines | 工作流驗證 Agent |

#### Skills（10 個）

| Skill | 檔案 | References | 說明 |
|-------|------|------------|------|
| core | `~/.claude/skills/core/` | 5 個 | 核心規則（D->R->T、禁止硬編碼等） |
| main | `~/.claude/skills/main/` | 2 個 | Main Agent 調度規則 |
| workflow | `~/.claude/skills/workflow/` | 1 個 | 工作流設計驗證 |
| dev | `~/.claude/skills/dev/` | 5 個 | 開發專業知識 |
| refactor | `~/.claude/skills/refactor/` | 4 個 | 重構專業知識 |
| review | `~/.claude/skills/review/` | 4 個 | 審查專業知識 |
| testing | `~/.claude/skills/testing/` | 4 個 | 測試專業知識 |
| browser | `~/.claude/skills/browser/` | 7 個 | 瀏覽器自動化 |
| ui | `~/.claude/skills/ui/` | 18 個 | UI 視覺設計 |
| ux | `~/.claude/skills/ux/` | 9 個 | UX 使用者體驗 |

#### Hooks（12 個）

**核心 Hooks（8 個）：**
| Hook | 檔案 | 觸發時機 | 功能 |
|------|------|----------|------|
| workflow-gate | `hooks/workflow/workflow-gate.js` | PreToolUse | 狀態機驗證、D->R->T 強制 |
| state-updater | `hooks/workflow/state-updater.js` | PostToolUse | 狀態轉換更新 |
| task-sync | `hooks/workflow/task-sync.js` | PostToolUse | tasks.md 同步 |
| status-display | `hooks/workflow/status-display.js` | PostToolUse | Agent 狀態顯示 |
| bypass-handler | `hooks/workflow/bypass-handler.js` | CLI | Escape Hatch 機制 |
| session-report | `hooks/workflow/session-report.js` | SessionEnd | 委派統計報告 |
| process-manager | `hooks/workflow/process-manager.js` | 多時機 | 進程追蹤清理 |
| violation-tracker | `hooks/core/workflow-violation-tracker.js` | PostToolUse | D->R->T 違規追蹤 |

**輔助 Hooks（4 個）：**
| Hook | 檔案 | 觸發時機 | 功能 |
|------|------|----------|------|
| fix-on-discovery | `hooks/core/fix-on-discovery.sh` | PostToolUse(Bash) | 類型錯誤提醒 |
| loop-heartbeat | `hooks/workflow/loop-heartbeat.sh` | PostToolUse | Loop 狀態持久化 |
| loop-continue-reminder | `hooks/workflow/loop-continue-reminder.sh` | UserPromptSubmit | Loop 插話提醒 |
| loop-recovery-detector | `hooks/core/loop-recovery-detector.js` | SessionStart | 未完成 Loop 檢測 |

---

## Target Structure

```
~/.claude/plugins/workflow/
├── .claude-plugin/
│   └── plugin.json              # Plugin 元資料
├── skills/
│   ├── core/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── main/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── workflow/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── dev/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── refactor/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── review/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── testing/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── browser/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── ui/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   ├── styles/
│   │   ├── templates/
│   │   └── demo/
│   └── ux/
│       ├── SKILL.md
│       └── references/
├── agents/
│   ├── developer.md
│   ├── reviewer.md
│   ├── tester.md
│   ├── debugger.md
│   ├── architect.md
│   ├── designer.md
│   └── workflow.md
└── hooks/
    ├── hooks.json               # Hooks 配置
    ├── workflow-gate.js
    ├── state-updater.js
    ├── task-sync.js
    ├── status-display.js
    ├── bypass-handler.js
    ├── session-report.js
    ├── process-manager.js
    ├── violation-tracker.js
    ├── fix-on-discovery.sh
    ├── loop-heartbeat.sh
    ├── loop-continue-reminder.sh
    └── loop-recovery-detector.js
```

---

## Migration After Cleanup

遷移後需刪除的全域檔案：

### Agents
```
~/.claude/agents/developer.md
~/.claude/agents/reviewer.md
~/.claude/agents/tester.md
~/.claude/agents/debugger.md
~/.claude/agents/architect.md
~/.claude/agents/designer.md
~/.claude/agents/workflow.md
```

### Skills
```
~/.claude/skills/core/
~/.claude/skills/main/
~/.claude/skills/workflow/
~/.claude/skills/dev/
~/.claude/skills/refactor/
~/.claude/skills/review/
~/.claude/skills/testing/
~/.claude/skills/browser/
~/.claude/skills/ui/
~/.claude/skills/ux/
```

### Hooks
```
~/.claude/hooks/workflow/         # 整個目錄
~/.claude/hooks/core/workflow-violation-tracker.js
~/.claude/hooks/core/fix-on-discovery.sh
~/.claude/hooks/core/loop-recovery-detector.js
```

### 保留的全域檔案
```
~/.claude/hooks/config.json       # 保留（含其他 hook 配置）
~/.claude/skills/hooks-guide/     # 保留（通用 hooks 指南）
~/.claude/skills/skill-agent/     # 保留（skill/agent 建立指南）
~/.claude/skills/migration/       # 保留（遷移指南）
```

---

## Risk Assessment

### Low Risk
- Skills 遷移：純文檔，無副作用
- Agents 遷移：純配置，無副作用

### Medium Risk
- Hooks 遷移：需確保路徑引用正確
- 需更新 CLAUDE.md 中的 skills 路徑引用

### High Risk
- hooks.json 整合：需合併現有配置
- Loop 相關 Hooks：有檔案系統依賴

### Rollback Plan
1. 保留原檔案副本直到驗證完成
2. Plugin 安裝後測試基本工作流
3. 如失敗，刪除 Plugin、恢復原檔案

---

## Success Criteria

1. Plugin 可獨立安裝和卸載
2. 所有 Skills 正常載入和觸發
3. 所有 Agents 正常委派和執行
4. D->R->T 工作流正常運作
5. Hook 觸發和狀態追蹤正常
6. Loop 功能正常運作

---

## Estimated Effort

| Phase | Tasks | Estimated Cycles |
|-------|-------|------------------|
| 1. Plugin 基礎結構 | 3 | 1 D->R->T |
| 2. Skills 遷移 | 10 | 3-4 D->R->T |
| 3. Agents 遷移 | 7 | 1-2 D->R->T |
| 4. Hooks 遷移 | 12 | 2-3 D->R->T |
| 5. 清理全域檔案 | 3 | 1 D->R->T |
| 6. 整合驗證 | 5 | 1-2 D->R->T |
| **Total** | **40** | **9-13 D->R->T** |

---

## Dependencies

- Claude Code Plugin 規格
- settings.json 中的 Plugins 配置格式
- Hooks 配置格式（hooks.json）
