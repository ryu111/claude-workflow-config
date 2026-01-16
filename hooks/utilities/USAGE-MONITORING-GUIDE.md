# 用量監控與報告管理指南

## 🛡️ 用量報告系統

為了幫助你管理 Claude 20x 的額度，我建立了一套自動化的用量監控系統。

### 1. 自動報告 (SessionEnd)
每次 session 結束時，系統會自動在終端機顯示當前的用量統計。

### 2. 手動查詢指令
你可以隨時使用以下指令來查看更詳細的報告：

```bash
# 查看今日用量與優化建議
~/.claude/hooks/utilities/usage-monitor.sh today

# 查看本週使用趨勢
~/.claude/hooks/utilities/usage-monitor.sh week

# 產生完整報告（今日 + 本週）
~/.claude/hooks/utilities/usage-monitor.sh report
```

### 3. 估算邏輯
報告會根據 Agent 呼叫次數進行預估：
- **Opus**: ~5,000 tokens / 呼叫
- **Sonnet**: ~2,000 tokens / 呼叫
- **Haiku**: ~500 tokens / 呼叫

*(註：這僅為粗略估算，實際消耗視對話內容長度而定)*

## 💡 模型配置策略 (優化後)

| Agent | 模型 | 角色職責 |
|-------|------|----------|
| **ARCHITECT** | **Opus** | 核心架構設計與任務拆解 (一次到位) |
| **REVIEWER** | **Sonnet** | 嚴格代碼審查與品質把關 |
| **DEVELOPER** | **Sonnet** | 代碼實作與規範遵循 |
| **TESTER** | **Haiku** | 極速單元測試與回歸驗證 |

## 📈 用量節省預期
1. **REVIEWER 降級**: 節省約 80% 的每日 Opus 消耗。
2. **Memory 優化**: 減少每次啟動時約 30% 的上下文 Token。
3. **Verbose 模式關閉**: 減少約 10% 的冗餘日誌消耗。

---
**建立日期**: 2026-01-15  
**維護狀態**: 運作中
