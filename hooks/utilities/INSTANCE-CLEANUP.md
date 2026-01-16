# Claude 實例自動清理機制

## 問題背景

當 Claude Code session resume 時，會啟動新的 Claude 實例，但**舊實例可能沒有正確關閉**，導致：

- **記憶體洩漏**：舊實例及其所有 MCP 子進程持續佔用記憶體
- **重複服務**：每個 MCP 服務有多個實例運行
- **資源浪費**：典型案例浪費 **800+ MB** 記憶體

## 解決方案

### 自動清理 Hook

位置：`~/.claude/hooks/core/session-start-cleanup.js`

**功能**：
- 每次 session start 自動執行
- 檢測所有 Claude 實例
- 保留最新實例，清理所有舊實例
- 清理所有子進程（MCP 服務）

**執行流程**：
1. 獲取所有 Claude 進程（`--output-format stream-json`）
2. 按啟動時間排序
3. 保留最新實例
4. 優雅關閉舊實例（SIGTERM → 等待 2s → SIGKILL）
5. 遞迴清理所有子進程

### 手動清理腳本

位置：`~/.claude/hooks/utilities/check-duplicate-instances.sh`

**用途**：手動診斷和清理

```bash
bash ~/.claude/hooks/utilities/check-duplicate-instances.sh
```

## 實測效果

### 案例 1：2026-01-16 首次清理

**清理前**：
- local_llm_mcp: 2 實例 (28 MB)
- mcp_memory_service: 2 實例 (541 MB)
- context7-mcp: 4 實例 (258 MB)
- playwright: 2 實例 (153 MB)
- claude binary: 2 實例 (1,423 MB)
- **總計：2,545 MB**

**清理後**：
- local_llm_mcp: 1 實例 (14 MB)
- mcp_memory_service: 1 實例 (297 MB)
- context7-mcp: 2 實例 (126 MB) ← 父子架構，正常
- playwright: 1 實例 (94 MB)
- claude binary: 1 實例 (1,147 MB)
- **總計：1,749 MB**

**節省：796 MB (31.3%)**

## 正常的「重複」進程

某些 MCP 服務使用**父子進程架構**，這是正常的：

### context7-mcp（2 個實例）

```
PID 14837: exec @upstash/context7-mcp   (父進程)
PID 15497: /usr/.../context7-mcp        (子進程 - 實際工作)
```

**判斷依據**：
- 父進程（PPID = Claude PID）
- 子進程（PPID = 父進程 PID）
- 只有一對父子，不是重複

## 配置

### Hook 優先級

```javascript
config: {
    priority: 'highest' // 在其他 session-start hooks 之前執行
}
```

**原因**：確保清理完成後，memory hook 等其他 hook 看到的是乾淨的環境。

### Timeout

```javascript
timeout: 5000 // 5 秒
```

**考量**：
- 清理操作通常 1-2 秒完成
- 5 秒緩衝足夠處理多個實例
- 不會顯著延遲 session 啟動

## 日誌

### 位置

```
~/.claude/logs/instance-cleanup.log
```

### 格式

```
[2026-01-16T15:48:00.000Z] Cleaning PID 11436 with 5 children
[2026-01-16T15:48:02.123Z] Cleaning PID 12345 with 3 children
```

## 安全性

### 進程識別

只清理符合以下條件的進程：
- 命令包含 `claude`
- 參數包含 `--output-format stream-json`

**不會誤殺**：
- 其他 Node.js 進程
- 用戶的其他應用
- 系統進程

### 優雅關閉

1. **SIGTERM**（優雅關閉）
   - 允許進程清理資源
   - 關閉網絡連接
   - 保存狀態

2. **等待 2 秒**
   - 給進程時間完成清理

3. **SIGKILL**（強制終止）
   - 只用於無回應的進程
   - 確保清理完成

## 維護

### 定期檢查

```bash
# 查看清理日誌
tail -20 ~/.claude/logs/instance-cleanup.log

# 手動診斷
bash ~/.claude/hooks/utilities/check-duplicate-instances.sh
```

### 禁用自動清理

如果需要暫時禁用：

```bash
# 重命名 Hook（暫時禁用）
mv ~/.claude/hooks/core/session-start-cleanup.js \
   ~/.claude/hooks/core/session-start-cleanup.js.disabled

# 恢復
mv ~/.claude/hooks/core/session-start-cleanup.js.disabled \
   ~/.claude/hooks/core/session-start-cleanup.js
```

## 故障排除

### Hook 沒有執行

檢查 Hook 是否正確註冊：

```bash
# 檢查檔案存在
ls -lh ~/.claude/hooks/core/session-start-cleanup.js

# 測試 Hook
node ~/.claude/hooks/core/session-start-cleanup.js
```

### 清理失敗

查看日誌：

```bash
tail -50 ~/.claude/logs/instance-cleanup.log
```

可能原因：
- 權限不足（無法殺死進程）
- 進程已經結束（競爭條件）
- Timeout（5 秒內無法完成）

### 仍有重複實例

1. 確認是否為父子架構（正常）
2. 檢查是否有其他來源啟動 Claude
3. 查看 Hook 執行日誌

## 未來改進

### 可選功能

- [ ] 設定記憶體閾值（只在超過才清理）
- [ ] 保留最近 N 個實例（而非只保留最新）
- [ ] Slack/Email 通知（清理超過閾值時）
- [ ] 統計報告（每日/每週清理摘要）

### 與其他工具整合

- [ ] 與 `top` / `htop` 整合，即時監控
- [ ] 與 cron 整合，定期清理（非 session-start）
- [ ] 與 Prometheus 整合，記錄指標

---

**建立日期**：2026-01-16
**最後更新**：2026-01-16
**維護者**：Claude Workflow System
