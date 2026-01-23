# Tech Stack

技術棧和開發工具約束。

## 這個專案

```
類型：Claude Code 工作流配置
語言：JavaScript/TypeScript (hooks), Markdown (docs)
工具：Claude Code CLI
```

## 通用約束

### 禁止硬編碼

```
❌ 禁止
"status", "pending", 7 (magic number), "user"

✅ 正確
enum Status { PENDING, ACTIVE }
const MAX_RETRIES = 3
type Role = "admin" | "user"
```

### 程式碼風格

- 使用語言特性定義常數（enum, const, Literal）
- 錯誤訊息要有上下文
- 函數要有明確的輸入輸出類型

## Hooks 開發

### 檔案位置

```
.claude/hooks/           # 通用 hooks
.claude/plugins/workflow/hooks/  # 工作流 hooks
```

### Hook 類型

| 事件 | 用途 |
|------|------|
| SessionStart | 初始化、載入狀態 |
| PreToolUse | 阻擋/驗證操作 |
| PostToolUse | 記錄/更新狀態 |
| SubagentStop | 驗證 Sub-Agent 輸出 |
| Stop | 結束前檢查 |
| PreCompact | Context 壓縮前檢查 |

### Hook 輸出格式

```javascript
// 阻擋
console.log(JSON.stringify({
  result: "block",
  reason: "說明原因"
}));

// 通過（帶訊息）
console.log(JSON.stringify({
  result: "continue",
  message: "顯示訊息"
}));

// 靜默通過
process.exit(0);
```
