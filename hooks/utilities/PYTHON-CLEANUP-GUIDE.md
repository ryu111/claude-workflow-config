# Python 進程管理解決方案

## 🎯 問題描述

在執行任務時，Python 進程可能沒有正確關閉，導致殘留進程堆積，造成 RAM 洩漏。

## ✅ 已實施的解決方案

### 1. 自動清理機制（SessionEnd Hook）

**檔案**：`~/.claude/hooks/workflow/cleanup-python.sh`

**功能**：
- 在每次 session 結束時自動執行
- 清理運行超過 10 分鐘的 Python 進程
- 先嘗試優雅終止（SIGTERM），再強制終止（SIGKILL）

**執行時機**：
- 每次 Claude Code session 結束時
- 自動執行，無需手動介入

### 2. 監控工具（手動使用）

**檔案**：`~/.claude/hooks/utilities/python-monitor.sh`

**功能**：
- 列出當前 Python 進程
- 顯示記憶體使用情況
- 互動式清理殘留進程
- 即時監控模式

**使用方式**：

```bash
# 查看當前 Python 進程狀態
~/.claude/hooks/utilities/python-monitor.sh list

# 清理殘留進程（互動式）
~/.claude/hooks/utilities/python-monitor.sh clean

# 即時監控模式（每 5 秒更新）
~/.claude/hooks/utilities/python-monitor.sh monitor

# 自動清理（無互動，適合 cron）
~/.claude/hooks/utilities/python-monitor.sh auto-clean
```

**簡短指令**：
```bash
# 使用別名更方便
alias pymon='~/.claude/hooks/utilities/python-monitor.sh'

# 然後可以這樣用
pymon list
pymon clean
pymon monitor
```

## 🔍 診斷步驟

如果懷疑有 Python 進程洩漏：

### 1. 檢查當前狀態
```bash
pymon list
```

### 2. 查看詳細資訊
```bash
ps aux | grep python | grep -v grep
```

### 3. 手動清理
```bash
pymon clean
```

### 4. 持續監控
```bash
pymon monitor
```

## 🛡️ 預防措施

### 已啟用的自動防護

1. **SessionEnd Hook** ✅
   - 每次 session 結束自動清理
   - 已註冊到 `~/.claude/settings.json`

2. **超時保護** ✅
   - `session-start.js` 有 9.5 秒超時限制
   - Python 執行有 5 秒超時限制

### 建議的額外措施

1. **定期監控**（可選）
   ```bash
   # 添加到 crontab，每小時自動清理
   0 * * * * ~/.claude/hooks/utilities/python-monitor.sh auto-clean
   ```

2. **系統監控**
   ```bash
   # 使用 Activity Monitor 監控 Python 進程
   # 或使用命令列
   watch -n 5 'ps aux | grep python | grep -v grep'
   ```

## 📊 Hook 執行順序

```
SessionEnd:
1. session-end.js      (儲存 session 洞察)
2. check-archive.sh    (檢查未歸檔的 OpenSpec)
3. cleanup-python.sh   (清理殘留 Python 進程) ← 新增
```

## 🔧 故障排除

### 問題：清理後還是有殘留進程

**解決方案**：
```bash
# 手動強制終止所有 Python 進程
pkill -9 python
pkill -9 python3
```

### 問題：想要保留某些 Python 進程

**解決方案**：
修改 `cleanup-python.sh`，調整時間閾值：
```bash
# 從 10 分鐘改為 30 分鐘
if (time[1] >= 30) print $1
```

### 問題：想要更積極的清理

**解決方案**：
添加 PostToolUse Hook，在每次執行 Python 後立即檢查：
```json
{
  "matchers": ["Bash"],
  "hooks": [{
    "type": "command",
    "command": "/Users/sbu/.claude/hooks/workflow/cleanup-python.sh",
    "timeout": 2
  }]
}
```

## 📝 相關檔案

| 檔案 | 用途 | 類型 |
|------|------|------|
| `workflow/cleanup-python.sh` | 自動清理 Hook | 自動執行 |
| `utilities/python-monitor.sh` | 監控工具 | 手動執行 |
| `core/session-start.js` | Session 啟動（可能啟動 Python） | 自動執行 |
| `settings.json` | Hook 註冊配置 | 配置檔 |
| `HOOKS-REGISTRY.md` | Hook 文檔 | 文檔 |

## 🎯 快速參考

```bash
# 檢查狀態
~/.claude/hooks/utilities/python-monitor.sh list

# 清理殘留
~/.claude/hooks/utilities/python-monitor.sh clean

# 即時監控
~/.claude/hooks/utilities/python-monitor.sh monitor

# 查看所有 Python 進程
ps aux | grep python | grep -v grep

# 強制終止所有 Python
pkill -9 python3
```

## ✅ 驗證

要驗證解決方案是否正常運作：

1. 開始一個新的 Claude Code session
2. 執行一些會啟動 Python 的任務
3. 結束 session
4. 檢查是否有殘留進程：
   ```bash
   pymon list
   ```
5. 應該看到「沒有運行中的 Python 進程」

---

**建立日期**：2026-01-15  
**最後更新**：2026-01-15  
**狀態**：已部署並測試
