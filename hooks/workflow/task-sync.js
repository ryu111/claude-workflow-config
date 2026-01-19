#!/usr/bin/env node
/**
 * Task Sync Hook (PostToolUse)
 *
 * tasks.md ↔ TodoWrite 雙向同步
 *
 * 功能：
 * 1. ARCHITECT 完成後解析 tasks.md → 輸出 TodoWrite 格式
 * 2. 任務完成後更新 tasks.md 的 checkbox
 * 3. 追蹤同步狀態
 *
 * 觸發時機：PostToolUse (Task:architect, Task:tester)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 任務狀態常數
const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// 配置路徑
const STATE_FILE = path.join(os.homedir(), '.claude/workflow-state/current.json');

/**
 * 載入狀態
 */
function loadState() {
  try {
    if (!fs.existsSync(STATE_FILE)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (error) {
    console.error(`⚠️ 載入狀態失敗: ${error.message}`);
    return {};
  }
}

/**
 * 儲存狀態（原子操作）
 */
function saveState(state) {
  const tempFile = `${STATE_FILE}.${process.pid}.tmp`;
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
    fs.renameSync(tempFile, STATE_FILE);
  } catch (error) {
    console.error(`⚠️ 儲存狀態失敗: ${error.message}`);
    try { fs.unlinkSync(tempFile); } catch (e) { /* ignore */ }
  }
}

/**
 * 解析 tasks.md 檔案
 *
 * 格式範例：
 * ## 1. Setup (sequential)
 * - [ ] 1.1 Initialize project | files: package.json
 * - [x] 1.2 Configure ESLint | files: .eslintrc.js
 *
 * ## 2. Features (parallel)
 * - [ ] 2.1 User Dashboard | files: src/pages/dashboard.tsx | output: http://localhost:3000/dashboard
 */
function parseTasksMd(content) {
  const tasks = [];
  const lines = content.split('\n');

  let currentGroup = null;
  let currentMode = 'sequential';

  for (const line of lines) {
    // 解析 Group 標題
    const groupMatch = line.match(/^##\s+(?:(\d+)\.\s+)?(.+?)\s*\(?(sequential|parallel)?\)?$/i);
    if (groupMatch) {
      currentGroup = groupMatch[2].trim();
      currentMode = groupMatch[3]?.toLowerCase() || 'sequential';
      continue;
    }

    // 解析任務項目
    const taskMatch = line.match(/^-\s+\[([ xX~>])\]\s+(\d+(?:\.\d+)?)\s+(.+?)(?:\s*\|\s*files?:\s*(.+?))?(?:\s*\|\s*output:\s*(.+?))?$/i);
    if (taskMatch) {
      const checkboxMark = taskMatch[1];
      let status;
      if (checkboxMark === 'x' || checkboxMark === 'X') {
        status = TaskStatus.COMPLETED;
      } else if (checkboxMark === '~' || checkboxMark === '>') {
        status = TaskStatus.IN_PROGRESS;
      } else {
        status = TaskStatus.PENDING;
      }

      const id = taskMatch[2];
      const title = taskMatch[3].trim();
      const files = taskMatch[4]?.split(',').map(f => f.trim()) || [];
      const output = taskMatch[5]?.trim() || null;

      tasks.push({
        id,
        content: title,
        status,
        group: currentGroup,
        mode: currentMode,
        files,
        output
      });
    }
  }

  return tasks;
}

/**
 * 轉換為 TodoWrite 格式
 */
function convertToTodoWrite(tasks) {
  return tasks.map(task => ({
    content: `Task ${task.id}: ${task.content}`,
    status: task.status,
    activeForm: task.status === 'in_progress'
      ? `處理 Task ${task.id}`
      : task.status === 'completed'
        ? `Task ${task.id} 已完成`
        : `待處理 Task ${task.id}`
  }));
}

/**
 * 更新 tasks.md 中的 checkbox
 */
function updateTasksMdCheckbox(filePath, taskId, completed) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 尋找並更新對應的 checkbox（支援所有狀態：空格、x、X、~、>）
    const pattern = new RegExp(
      `^(-\\s+\\[)[ xX~>](\\]\\s+${taskId.replace('.', '\\.')}\\s+)`,
      'm'
    );

    const newMark = completed ? 'x' : ' ';
    const newContent = content.replace(pattern, `$1${newMark}$2`);

    if (newContent !== content) {
      // 原子寫入
      const tempFile = `${filePath}.${process.pid}.tmp`;
      fs.writeFileSync(tempFile, newContent);
      fs.renameSync(tempFile, filePath);
      return true;
    }

    return false;
  } catch (error) {
    const errorMsg = `無法更新 tasks.md: ${error.message}\n  File: ${filePath}\n  TaskId: ${taskId}`;
    console.error(`⚠️ ${errorMsg}`);
    if (process.env.DEBUG_HOOKS) {
      console.error(error.stack);
    }
    return false;
  }
}

/**
 * 更新 tasks.md 中的 checkbox 為進行中狀態
 */
function updateTasksMdToInProgress(filePath, taskId) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 將 [ ] 改為 [~]
    const pattern = new RegExp(
      `^(-\\s+\\[) (\\]\\s+${taskId.replace('.', '\\.')}\\s+)`,
      'm'
    );

    const newContent = content.replace(pattern, '$1~$2');

    if (newContent !== content) {
      const tempFile = `${filePath}.${process.pid}.tmp`;
      fs.writeFileSync(tempFile, newContent);
      fs.renameSync(tempFile, filePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`⚠️ 無法更新 tasks.md: ${error.message}`);
    return false;
  }
}

/**
 * 尋找專案中的 tasks.md
 */
function findTasksFile(projectPath) {
  // 搜尋可能的位置
  const searchDirs = [
    path.join(projectPath, 'openspec'),
    path.join(projectPath, '.claude'),
    projectPath
  ];

  for (const dir of searchDirs) {
    try {
      if (fs.existsSync(dir)) {
        const tasksPath = path.join(dir, 'tasks.md');
        if (fs.existsSync(tasksPath)) {
          return tasksPath;
        }

        // 搜尋子目錄
        if (dir.includes('openspec')) {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const subPath = path.join(dir, entry.name, 'tasks.md');
              if (fs.existsSync(subPath)) {
                return subPath;
              }
            }
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

/**
 * 主函數
 */
function main() {
  // 從 stdin 讀取輸入
  let input = '';
  try {
    input = fs.readFileSync(0, 'utf8');
  } catch (error) {
    console.error(`⚠️ 讀取輸入失敗: ${error.message}`);
    return;
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
    console.error(`⚠️ 解析 JSON 失敗: ${error.message}`);
    return;
  }

  const toolName = hookInput.tool_name;
  const toolInput = hookInput.tool_input || {};
  const toolOutput = hookInput.tool_output || '';

  // 只處理 Task 工具
  if (toolName !== 'Task') {
    return;
  }

  const subagentType = toolInput.subagent_type?.toLowerCase();
  const state = loadState();

  // ARCHITECT 完成 → 解析 tasks.md 並輸出
  if (subagentType === 'architect') {
    // 嘗試從輸出中找到 tasks.md 路徑
    const tasksPathMatch = toolOutput.match(/tasks\.md[:\s]+([^\s\n]+)/i);
    let tasksFile = null;

    if (tasksPathMatch && tasksPathMatch[1]) {
      tasksFile = tasksPathMatch[1];
    } else if (state.projectPath) {
      tasksFile = findTasksFile(state.projectPath);
    } else {
      // 使用當前目錄
      tasksFile = findTasksFile(process.cwd());
    }

    if (tasksFile && fs.existsSync(tasksFile)) {
      const content = fs.readFileSync(tasksFile, 'utf8');
      const tasks = parseTasksMd(content);
      const todoItems = convertToTodoWrite(tasks);

      // 更新狀態
      state.taskSync = {
        lastSyncAt: new Date().toISOString(),
        tasksFile: tasksFile,
        totalTasks: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length
      };
      saveState(state);

      // 輸出同步資訊
      console.log(`\n## 📋 任務同步: 發現 ${tasks.length} 個任務`);
      console.log(`\n<!-- TODOWRITE_SYNC`);
      console.log(JSON.stringify(todoItems, null, 2));
      console.log(`TODOWRITE_SYNC -->\n`);
    }
  }

  // DEBUGGER 完成 → 清除測試失敗狀態
  if (subagentType === 'debugger' || subagentType?.includes('debugger')) {
    if (state.task?.testFailed) {
      // 清除測試失敗狀態，允許重新測試
      delete state.task.testFailed;
      delete state.task.failedAt;
      state.task.debugged = true;
      state.task.debuggedAt = new Date().toISOString();
      state.taskSync = state.taskSync || {};
      state.taskSync.lastSyncAt = new Date().toISOString();
      saveState(state);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔧 Task ${state.task.current} Debug 完成`);
      console.log('   現在可以重新呼叫 Task(tester) 進行測試');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  }

  // DEVELOPER 開始 → 標記任務為進行中（但檢查是否有未解決的測試失敗）
  if (subagentType === 'developer' || subagentType?.includes('developer')) {
    // 檢查是否有未解決的測試失敗
    if (state.task?.testFailed) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚫 無法開始新任務！Task ${state.task.current} 測試失敗尚未修復`);
      console.log('   必須先呼叫 Task(debugger) 進行除錯');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    // 從 prompt 中提取任務編號
    const prompt = toolInput.prompt || '';
    const taskMatch = prompt.match(/Task\s+(\d+(?:\.\d+)?)/i);

    if (taskMatch && state.taskSync?.tasksFile) {
      const taskId = taskMatch[1];
      const updated = updateTasksMdToInProgress(state.taskSync.tasksFile, taskId);

      if (updated) {
        // 更新狀態
        state.task = { current: taskId };
        state.taskSync.inProgress = (state.taskSync.inProgress || 0) + 1;
        state.taskSync.lastSyncAt = new Date().toISOString();
        saveState(state);

        console.log(`\n## 🔄 tasks.md 已更新: Task ${taskId} 進行中`);
      }
    }
  }

  // REVIEWER 通過 → 記錄已審查（但不標記完成）
  if (subagentType === 'reviewer' || subagentType?.includes('reviewer')) {
    const output = (toolOutput || '').toLowerCase();
    const isApproved = output.includes('approved') || output.includes('通過') ||
                       output.includes('lgtm') || output.includes('✅') ||
                       !output.includes('request changes') && !output.includes('reject');

    if (isApproved && state.task?.current) {
      // 記錄已通過審查
      state.task.reviewed = true;
      state.task.reviewedAt = new Date().toISOString();
      state.taskSync.lastSyncAt = new Date().toISOString();
      saveState(state);

      console.log(`\n## 🔍 Task ${state.task.current} 審查通過，等待測試`);
    }
  }

  // TESTER 處理 → 更新 tasks.md checkbox（必須先經過 REVIEWER）
  if (subagentType === 'tester' || subagentType?.includes('tester')) {
    const output = (toolOutput || '').toLowerCase();
    const isPassed = output.includes('pass') || output.includes('通過') || output.includes('✅');
    const hasFailed = output.includes('fail') || output.includes('失敗') || output.includes('❌');

    // 從 prompt 中提取任務編號（優先）或從狀態讀取
    const prompt = toolInput.prompt || '';
    const taskMatch = prompt.match(/Task\s+(\d+(?:\.\d+)?)/i);
    const taskId = taskMatch?.[1] || state.task?.current;

    // 測試失敗 → 記錄失敗狀態，強制必須經過 DEBUGGER
    if (hasFailed && taskId) {
      state.task = state.task || { current: taskId };
      state.task.testFailed = true;
      state.task.failedAt = new Date().toISOString();
      state.taskSync = state.taskSync || {};
      state.taskSync.lastSyncAt = new Date().toISOString();
      saveState(state);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔴 Task ${taskId} 測試失敗！`);
      console.log('   必須呼叫 Task(debugger) 修復後才能繼續');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    if (isPassed && taskId && state.taskSync?.tasksFile) {
      // 檢查是否經過 REVIEWER（強制 R→T 流程）
      const hasBeenReviewed = state.task?.reviewed === true;

      if (!hasBeenReviewed) {
        // 沒有經過 REVIEWER，輸出警告但不標記完成
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`⚠️ Task ${taskId} 測試通過，但尚未經過 REVIEWER 審查！`);
        console.log('   必須先呼叫 Task(reviewer) 後才能標記完成');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return;
      }

      const updated = updateTasksMdCheckbox(state.taskSync.tasksFile, taskId, true);

      if (updated) {
        state.taskSync.completed = (state.taskSync.completed || 0) + 1;
        state.taskSync.inProgress = Math.max(0, (state.taskSync.inProgress || 1) - 1);
        state.taskSync.lastSyncAt = new Date().toISOString();
        delete state.task;  // 清除當前任務（包含 reviewed 狀態）
        saveState(state);

        console.log(`\n## ✅ tasks.md 已更新: Task ${taskId} 完成（R→T 流程驗證通過）`);
      }
    }
  }
}

main();
