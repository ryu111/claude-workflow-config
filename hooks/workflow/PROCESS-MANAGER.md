# Process Manager 使用文檔

## 概述

`process-manager.js` 是工作流 2.0 的進程追蹤與清理模組，整合了：
- 進程追蹤（process-tracker）
- 進程記錄（process-recorder）
- 進程清理（process-cleanup）

## 功能

### 1. 命令偵測

檢測命令是否需要追蹤（是否會產生長期進程）。

```bash
node process-manager.js should-track "pytest tests/"
# 輸出: true

node process-manager.js should-track "ls -la"
# 輸出: false
```

**追蹤的命令模式**：
- `pytest` / `python -m pytest`
- `npm run/start/test` / `yarn run/start/test`
- `node` / `nodemon` / `ts-node`
- `playwright` / `cypress` / `puppeteer`
- `jest` / `vitest`
- `webpack serve` / `vite` / `next dev`

### 2. 進程記錄

記錄進程 PID、PGID、命令、狀態、任務 ID。

```bash
node process-manager.js record <pid> <command> <state> [taskId]
```

範例：
```bash
node process-manager.js record 12345 "pytest tests/" "TEST" "2.1"
# [process-manager] 記錄進程: PID=12345, PGID=12345, Command="pytest tests/"
```

**記錄結構**：
```json
{
  "processes": [
    {
      "pid": 12345,
      "pgid": 12345,
      "command": "pytest tests/",
      "state": "TEST",
      "taskId": "2.1",
      "startedAt": "2026-01-19T10:00:00Z"
    }
  ]
}
```

### 3. 進程清理

清理指定狀態或所有進程。

```bash
# 清理所有進程
node process-manager.js cleanup-all

# 清理指定狀態的進程
node process-manager.js cleanup TEST
```

**清理策略**：
1. 先發送 SIGTERM（優雅終止）
2. 等待 5 秒
3. 若進程仍存在，發送 SIGKILL（強制終止）
4. 驗證清理成功

**輸出範例**：
```json
{
  "total": 3,
  "cleaned": 3,
  "failed": 0,
  "remaining": 0
}
```

## 在 Hook 中使用

### PreToolUse (Bash) - 標記需追蹤的命令

```javascript
const { shouldTrackCommand } = require('./process-manager.js');

function onPreToolUse(tool, params) {
  if (tool === 'Bash') {
    const command = params.command;
    const needsTracking = shouldTrackCommand(command);

    // 將標記傳遞給 PostToolUse
    return { needsTracking };
  }
}
```

### PostToolUse (Bash) - 記錄進程

```javascript
const { recordProcess, readProcesses } = require('./process-manager.js');
const { readState } = require('./state-utils.js'); // 假設有此工具

function onPostToolUse(tool, params, result, context) {
  if (tool === 'Bash' && context.needsTracking) {
    // 從 Bash 輸出中提取 PID（假設命令使用 & 後台執行）
    const state = readState();
    const pid = extractPidFromOutput(result.output);

    if (pid) {
      recordProcess(
        pid,
        params.command,
        state.state,
        state.task.current
      );
    }
  }
}
```

### 狀態轉換時清理

```javascript
const { cleanupProcesses } = require('./process-manager.js');

async function onStateTransition(fromState, toState) {
  // 離開某個狀態時，清理該狀態啟動的進程
  if (fromState !== toState) {
    await cleanupProcesses(fromState);
  }
}
```

### SessionEnd 時清理所有

```javascript
const { cleanupAllProcesses } = require('./process-manager.js');

async function onSessionEnd() {
  console.log('Session 結束，清理所有進程...');
  const result = await cleanupAllProcesses();
  console.log(`清理完成: ${result.cleaned}/${result.total}`);
}
```

## 數據結構

### processes.json

位置：`~/.claude/workflow-state/processes.json`

```json
{
  "processes": [
    {
      "pid": 12345,
      "pgid": 12345,
      "command": "npm run test",
      "state": "TEST",
      "taskId": "2.1",
      "startedAt": "2026-01-19T10:00:00Z"
    },
    {
      "pid": 12346,
      "pgid": 12346,
      "command": "next dev",
      "state": "DEVELOP",
      "taskId": "2.2",
      "startedAt": "2026-01-19T10:05:00Z"
    }
  ]
}
```

## 錯誤處理

所有函數都包含錯誤處理：
- 進程可能已經不存在（正常情況）
- PGID 無法獲取時，使用 PID 作為 PGID
- 清理失敗會記錄警告，但不會中斷流程
- 檔案操作失敗會記錄錯誤並返回空陣列/預設值

## 平台兼容性

| 平台 | 檢查進程 | 終止進程 | 進程組 |
|------|----------|----------|--------|
| **macOS/Linux** | `ps -p <pid>` | `kill -TERM/-KILL` | 支援 PGID |
| **Windows** | `tasklist` | `taskkill` | 使用 `/T` 終止子進程 |

## 安全性

- 使用 `spawnSync` 代替 `exec`，避免命令注入風險
- 所有參數都經過驗證
- PID 必須是數字，命令不包含 shell 特殊字符

## 配置（來自 workflow-config.json）

```json
{
  "processes": {
    "cleanupOnStateChange": true,
    "cleanupOnTaskComplete": true,
    "cleanupOnSessionEnd": true,
    "gracefulTerminateTimeout": 5000,
    "trackedPatterns": [
      "pytest",
      "npm",
      "node",
      "playwright"
    ]
  }
}
```

## 測試

```bash
# 1. 測試命令偵測
node process-manager.js should-track "pytest tests/"
# 預期: true

# 2. 記錄假進程
node process-manager.js record 99999 "pytest tests/" "TEST" "2.1"
# 預期: [process-manager] 記錄進程: PID=99999...

# 3. 查看記錄
cat ~/.claude/workflow-state/processes.json

# 4. 清理進程
node process-manager.js cleanup
# 預期: {"total":1,"cleaned":1,"failed":0,"remaining":0}
```

## 規格來源

WORKFLOW-2.0-SPEC.md 第五章：進程追蹤與清理
