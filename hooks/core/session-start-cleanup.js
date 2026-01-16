/**
 * Claude Code Session Start Cleanup Hook
 * Automatically detect and clean up duplicate Claude instances to prevent memory leaks
 */

const { execFileSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// ANSI Colors for console output
const COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    GRAY: '\x1b[90m'
};

/**
 * Get all Claude process PIDs
 */
function getClaudeProcesses() {
    try {
        const output = execFileSync('ps', ['aux'], {
            encoding: 'utf8'
        });

        const lines = output.split('\n');
        const processes = [];

        for (const line of lines) {
            if (line.includes('claude') && line.includes('--output-format stream-json')) {
                const parts = line.trim().split(/\s+/);
                if (parts.length < 11) continue;

                const pid = parseInt(parts[1], 10);
                const rssMB = parseFloat(parts[5]) / 1024; // Convert KB to MB
                const startTime = parts.slice(8, 13).join(' ');

                // Parse start time to epoch for comparison
                const epochMatch = line.match(/(\w+)\s+(\w+)\s+(\d+)\s+([\d:]+)\s+(\d{4})/);
                let epoch = 0;
                if (epochMatch) {
                    const dateStr = `${epochMatch[2]} ${epochMatch[3]} ${epochMatch[4]} ${epochMatch[5]}`;
                    epoch = new Date(dateStr).getTime();
                }

                processes.push({
                    pid,
                    memory: rssMB,
                    startTime,
                    epoch
                });
            }
        }

        return processes;
    } catch (error) {
        return [];
    }
}

/**
 * Get all child processes of a given PID (recursive)
 */
function getAllChildren(pid) {
    try {
        const output = execFileSync('pgrep', ['-P', pid.toString()], {
            encoding: 'utf8'
        });

        const children = output.trim().split('\n')
            .filter(Boolean)
            .map(p => parseInt(p, 10));

        // Recursively get grandchildren
        const allDescendants = [...children];
        for (const child of children) {
            allDescendants.push(...getAllChildren(child));
        }

        return allDescendants;
    } catch (error) {
        // pgrep returns non-zero if no children found
        return [];
    }
}

/**
 * Kill a process tree (parent + all children)
 */
async function killProcessTree(pid, graceful = true) {
    const LOG_FILE = path.join(process.env.HOME, '.claude/logs/instance-cleanup.log');

    try {
        // Ensure log directory exists
        await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });

        // Get all children before killing
        const children = getAllChildren(pid);

        // Log the cleanup
        const logEntry = `[${new Date().toISOString()}] Cleaning PID ${pid} with ${children.length} children\n`;
        await fs.appendFile(LOG_FILE, logEntry);

        // Kill children first (SIGTERM)
        if (graceful) {
            for (const child of children) {
                try {
                    process.kill(child, 'SIGTERM');
                } catch (error) {
                    // Process already dead, ignore
                }
            }

            // Kill parent (SIGTERM)
            try {
                process.kill(pid, 'SIGTERM');
            } catch (error) {
                // Process already dead, ignore
            }

            // Wait 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Force kill any remaining processes (SIGKILL)
        for (const child of children) {
            try {
                process.kill(child, 'SIGKILL');
            } catch (error) {
                // Already dead, ignore
            }
        }

        try {
            process.kill(pid, 'SIGKILL');
        } catch (error) {
            // Already dead, ignore
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Perform cleanup of duplicate instances
 */
async function performCleanup() {
    const processes = getClaudeProcesses();

    if (processes.length <= 1) {
        return {
            success: true,
            cleanedCount: 0,
            savedMemory: 0
        };
    }

    // Sort by epoch (newest first)
    processes.sort((a, b) => b.epoch - a.epoch);

    // Keep the newest instance (index 0), clean up the rest
    const oldProcesses = processes.slice(1);

    let savedMemory = 0;
    let cleanedCount = 0;

    // Kill old processes
    for (const proc of oldProcesses) {
        const success = await killProcessTree(proc.pid);
        if (success) {
            cleanedCount++;
            savedMemory += proc.memory;
        }
    }

    return {
        success: true,
        cleanedCount,
        savedMemory
    };
}

/**
 * Main session start cleanup hook
 */
async function onSessionStartCleanup(context) {
    try {
        // Quick check - only run on actual session start
        if (context.trigger !== 'session-start' && context.trigger !== 'start') {
            return;
        }

        // Perform cleanup
        const result = await performCleanup();

        if (result.success && result.cleanedCount > 0) {
            // Show cleanup results to user
            console.log(`${COLORS.GREEN}🧹 Instance Cleanup${COLORS.RESET} ${COLORS.DIM}→${COLORS.RESET} Cleaned ${result.cleanedCount} duplicate instances, freed ${result.savedMemory.toFixed(1)} MB`);
        }
        // If no duplicates, stay quiet (don't clutter output)

    } catch (error) {
        // Fail gracefully - don't prevent session from starting
        console.log(`${COLORS.YELLOW}⚠️  Instance Cleanup${COLORS.RESET} ${COLORS.DIM}→${COLORS.RESET} ${COLORS.GRAY}Error: ${error.message}${COLORS.RESET}`);
    }
}

/**
 * Hook metadata for Claude Code
 */
module.exports = {
    name: 'instance-cleanup-session-start',
    version: '1.0.0',
    description: 'Automatically detect and clean up duplicate Claude instances to prevent memory leaks',
    trigger: 'session-start',
    handler: onSessionStartCleanup,
    config: {
        async: true,
        timeout: 5000, // 5 second timeout for cleanup
        priority: 'highest' // Run before other session-start hooks
    }
};

// Direct execution support for testing
if (require.main === module) {
    const mockContext = {
        trigger: 'session-start'
    };

    onSessionStartCleanup(mockContext)
        .then(() => {
            console.log('Cleanup hook test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Cleanup hook test failed:', error);
            process.exit(1);
        });
}
