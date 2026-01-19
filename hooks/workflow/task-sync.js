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
    const groupMatch = line.match(/^##\s+(\d+)\.\s+(.+?)\s*\(?(sequential|parallel)?\)?$/i);
    if (groupMatch) {
      currentGroup = groupMatch[2].trim();
      currentMode = groupMatch[3]?.toLowerCase() || 'sequential';
      continue;
    }

    // 解析任務項目
    const taskMatch = line.match(/^-\s+\[([ x])\]\s+(\d+(?:\.\d+)?)\s+(.+?)(?:\s*\|\s*files?:\s*(.+?))?(?:\s*\|\s*output:\s*(.+?))?$/i);
    if (taskMatch) {
      const completed = taskMatch[1] === 'x';
      const id = taskMatch[2];
      const title = taskMatch[3].trim();
      const files = taskMatch[4]?.split(',').map(f => f.trim()) || [];
      const output = taskMatch[5]?.trim() || null;

      tasks.push({
        id,
        content: title,
        status: completed ? 'completed' : 'pending',
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

    // 尋找並更新對應的 checkbox
    const pattern = new RegExp(
      `^(-\\s+\\[)[ x](\\]\\s+${taskId.replace('.', '\\.')}\\s+)`,
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
    return;
  }

  let hookInput;
  try {
    hookInput = JSON.parse(input);
  } catch (error) {
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

  // TESTER 通過 → 更新 tasks.md checkbox
  if (subagentType === 'tester') {
    const output = toolOutput.toLowerCase();
    const isPassed = output.includes('pass') || output.includes('通過') || output.includes('✅');

    if (isPassed && state.task?.current && state.taskSync?.tasksFile) {
      const updated = updateTasksMdCheckbox(
        state.taskSync.tasksFile,
        state.task.current,
        true
      );

      if (updated) {
        // 更新同步狀態
        state.taskSync.completed = (state.taskSync.completed || 0) + 1;
        state.taskSync.lastSyncAt = new Date().toISOString();
        saveState(state);

        console.log(`\n## ✅ tasks.md 已更新: Task ${state.task.current} 完成`);
      }
    }
  }
}

main();
