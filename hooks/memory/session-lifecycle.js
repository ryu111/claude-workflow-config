/**
 * Claude Code Session Lifecycle Hook (Unified)
 * Handles both session-start (memory retrieval) and session-end (consolidation)
 */

const fs = require('fs').promises;
const path = require('path');

// Import utilities
const { detectProjectContext } = require('../utilities/project-detector');
const { scoreMemoryRelevance, analyzeMemoryAgeDistribution, calculateAdaptiveGitWeight } = require('../utilities/memory-scorer');
const { formatMemoriesForContext, formatSessionConsolidation } = require('../utilities/context-formatter');
const { detectContextShift, extractCurrentContext, determineRefreshStrategy } = require('../utilities/context-shift-detector');
const { analyzeGitContext, buildGitContextQuery } = require('../utilities/git-analyzer');
const { MemoryClient } = require('../utilities/memory-client');
const { getVersionInfo, formatVersionDisplay } = require('../utilities/version-checker');
const { detectUserOverrides, logOverride } = require('../utilities/user-override-detector');

/**
 * Load hook configuration (shared by both handlers)
 */
async function loadConfig() {
    try {
        const configPath = path.join(__dirname, '../config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.warn('[Memory Hook] Using default configuration:', error.message);
        return {
            memoryService: {
                protocol: 'auto',
                preferredProtocol: 'http',
                fallbackEnabled: true,
                http: {
                    endpoint: 'http://127.0.0.1:8889',
                    apiKey: 'test-key-123',
                    healthCheckTimeout: 3000,
                    useDetailedHealthCheck: false
                },
                mcp: {
                    serverCommand: ['uv', 'run', 'memory', 'server'],
                    serverWorkingDir: null,
                    connectionTimeout: 5000,
                    toolCallTimeout: 10000
                },
                defaultTags: ['claude-code', 'auto-generated'],
                maxMemoriesPerSession: 8,
                injectAfterCompacting: false,
                enableSessionConsolidation: true
            },
            projectDetection: {
                gitRepository: true,
                packageFiles: ['package.json', 'pyproject.toml', 'Cargo.toml'],
                frameworkDetection: true,
                languageDetection: true
            },
            sessionAnalysis: {
                extractTopics: true,
                extractDecisions: true,
                extractInsights: true,
                extractCodeChanges: true,
                extractNextSteps: true,
                minSessionLength: 100
            },
            output: {
                verbose: true,
                showMemoryDetails: false,
                showProjectDetails: true,
                showScoringDetails: false,
                cleanMode: false
            }
        };
    }
}

// ANSI Colors
const CONSOLE_COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    BLUE: '\x1b[34m',
    YELLOW: '\x1b[33m',
    GRAY: '\x1b[90m',
    RED: '\x1b[31m'
};

// ============================================================================
// SESSION START IMPLEMENTATION (merged from session-start.js)
// ============================================================================

async function handleSessionStart(context) {
    const HOOK_TIMEOUT = 9500;
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Hook timeout - completing early')), HOOK_TIMEOUT);
    });

    try {
        return await Promise.race([
            executeSessionStart(context),
            timeoutPromise
        ]);
    } catch (error) {
        if (error.message.includes('Hook timeout')) {
            console.log(`${CONSOLE_COLORS.YELLOW}⏱️  Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.GRAY}Completed with timeout (normal for slow connections)${CONSOLE_COLORS.RESET}`);
            return;
        }
        throw error;
    }
}

async function executeSessionStart(context) {
    let memoryClient = null;

    try {
        const config = await loadConfig();
        const verbose = config.output?.verbose !== false;
        const cleanMode = config.output?.cleanMode === true;
        const showMemoryDetails = config.output?.showMemoryDetails === true;
        const showProjectDetails = config.output?.showProjectDetails !== false;

        const overrides = detectUserOverrides(context.userMessage);
        if (overrides.forceSkip) {
            logOverride('skip');
            return;
        }
        if (overrides.forceRemember && verbose && !cleanMode) {
            console.log(`${CONSOLE_COLORS.CYAN}💾 Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Force retrieval requested (#remember)`);
        }

        if (verbose && !cleanMode) {
            console.log(`${CONSOLE_COLORS.CYAN}🧠 Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Initializing session awareness...`);
        }

        // Check compacting event
        if (context.trigger === 'compacting' || context.event === 'memory-compacted') {
            if (!config.memoryService.injectAfterCompacting) {
                console.log(`${CONSOLE_COLORS.YELLOW}⏸️  Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Skipping injection after compacting`);
                return;
            }
            console.log(`${CONSOLE_COLORS.GREEN}▶️  Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Proceeding with injection after compacting`);
        }

        // Check context shift
        if (context.trigger !== 'session-start' && context.trigger !== 'start') {
            const currentContext = extractCurrentContext(context.conversationState || {}, context.workingDirectory);
            const previousContext = context.previousContext || context.conversationState?.previousContext;

            if (previousContext) {
                const shiftDetection = detectContextShift(currentContext, previousContext);

                if (!shiftDetection.shouldRefresh) {
                    console.log(`${CONSOLE_COLORS.GRAY}⏸️  Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.GRAY}No context shift detected, skipping${CONSOLE_COLORS.RESET}`);
                    return;
                }

                console.log(`${CONSOLE_COLORS.BLUE}🔄 Memory Hook${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Context shift: ${shiftDetection.description}`);
            }
        }

        // Detect project context
        const projectContext = await detectProjectContext(context.workingDirectory || process.cwd());
        if (verbose && showProjectDetails && !cleanMode) {
            const projectDisplay = `${CONSOLE_COLORS.BRIGHT}${projectContext.name}${CONSOLE_COLORS.RESET}`;
            const typeDisplay = projectContext.language !== 'Unknown' ? ` ${CONSOLE_COLORS.GRAY}(${projectContext.language})${CONSOLE_COLORS.RESET}` : '';
            console.log(`${CONSOLE_COLORS.BLUE}📂 Project Detector${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Analyzing ${projectDisplay}${typeDisplay}`);
        }

        // Memory client initialization and storage info
        const showStorageSource = config.memoryService?.showStorageSource !== false;
        let storageInfo = null;

        if (showStorageSource && verbose && !cleanMode) {
            try {
                memoryClient = new MemoryClient(config.memoryService);
                await memoryClient.connect();

                if (showMemoryDetails) {
                    const connectionInfo = memoryClient.getConnectionInfo();
                    if (connectionInfo?.activeProtocol) {
                        console.log(`${CONSOLE_COLORS.CYAN}🔗 Connection${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Using ${CONSOLE_COLORS.BRIGHT}${connectionInfo.activeProtocol.toUpperCase()}${CONSOLE_COLORS.RESET} protocol`);
                    }
                }

                const healthResult = await memoryClient.getHealthStatus();
                if (healthResult.success) {
                    storageInfo = parseHealthDataToStorageInfo(healthResult.data);
                    const memoryCount = storageInfo.health.totalMemories > 0 ? ` • ${storageInfo.health.totalMemories} memories` : '';
                    const sizeInfo = storageInfo.health.databaseSizeMB > 0 ? ` • ${storageInfo.health.databaseSizeMB}MB` : '';
                    console.log(`${CONSOLE_COLORS.CYAN}💾 Storage${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${storageInfo.icon} ${CONSOLE_COLORS.BRIGHT}${storageInfo.description}${CONSOLE_COLORS.RESET}${memoryCount}${sizeInfo}`);
                    console.log(`${CONSOLE_COLORS.CYAN}📍 Path${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.GRAY}${storageInfo.location}${CONSOLE_COLORS.RESET}`);
                }
            } catch (error) {
                if (verbose && showMemoryDetails) {
                    console.log(`${CONSOLE_COLORS.YELLOW}⚠️  Memory Connection${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.GRAY}${error.message}${CONSOLE_COLORS.RESET}`);
                }
            }
        }

        // Version check
        if (config.versionCheck?.enabled !== false && verbose && !cleanMode) {
            try {
                const versionInfo = await getVersionInfo(context.workingDirectory || process.cwd(), {
                    checkPyPI: config.versionCheck?.checkPyPI !== false,
                    timeout: config.versionCheck?.timeout || 2000
                });
                const versionDisplay = formatVersionDisplay(versionInfo, CONSOLE_COLORS);
                console.log(versionDisplay);
            } catch (error) {
                // Silent fail
            }
        }

        // Git analysis
        let gitContext = null;
        if (config.gitAnalysis?.enabled !== false) {
            if (verbose && !cleanMode) {
                console.log(`${CONSOLE_COLORS.CYAN}📊 Git Analysis${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Analyzing repository context...`);
            }

            gitContext = await analyzeGitContext(context.workingDirectory || process.cwd(), {
                commitLookback: config.gitAnalysis?.commitLookback || 14,
                maxCommits: config.gitAnalysis?.maxCommits || 20,
                includeChangelog: config.gitAnalysis?.includeChangelog !== false,
                verbose: showMemoryDetails && !cleanMode
            });

            if (gitContext && verbose && !cleanMode) {
                console.log(`${CONSOLE_COLORS.CYAN}📊 Git Context${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${gitContext.commits.length} commits, ${gitContext.changelogEntries?.length || 0} changelog entries`);
            }
        }

        // Connect memory client if not already connected
        if (!memoryClient) {
            try {
                memoryClient = new MemoryClient(config.memoryService);
                await Promise.race([
                    memoryClient.connect(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000))
                ]);
            } catch (error) {
                memoryClient = null;
            }
        }

        // Multi-phase memory retrieval
        const allMemories = [];
        const maxMemories = config.memoryService.maxMemoriesPerSession;

        if (memoryClient) {
            // Phase 0: Git-aware memories
            if (gitContext && gitContext.developmentKeywords.keywords.length > 0) {
                const maxGitMemories = 3;
                const gitQueries = buildGitContextQuery(projectContext, gitContext.developmentKeywords, context.userMessage);

                for (const gitQuery of gitQueries.slice(0, 1)) {
                    if (allMemories.length >= maxGitMemories) break;

                    const gitMemories = await queryMemoryService(memoryClient, {
                        semanticQuery: gitQuery.semanticQuery,
                        limit: Math.min(maxGitMemories - allMemories.length, 3),
                        timeFilter: 'last-2-weeks'
                    }, config);

                    if (gitMemories && gitMemories.length > 0) {
                        const markedMemories = gitMemories.map(mem => ({
                            ...mem,
                            _gitContextType: gitQuery.type,
                            _gitContextSource: gitQuery.source,
                            _gitContextWeight: config.gitAnalysis?.gitContextWeight || 1.2
                        }));

                        const newGitMemories = markedMemories.filter(newMem =>
                            !allMemories.some(existing =>
                                existing.content && newMem.content &&
                                existing.content.substring(0, 100) === newMem.content.substring(0, 100)
                            )
                        );

                        allMemories.push(...newGitMemories);
                    }
                }
            }

            // Phase 1: Recent memories
            const remainingSlots = Math.max(0, maxMemories - allMemories.length);
            if (remainingSlots > 0) {
                let recentQuery = context.userMessage ?
                    `recent ${projectContext.name} ${context.userMessage}` :
                    `recent ${projectContext.name} development decisions insights`;

                if (gitContext && gitContext.developmentKeywords.keywords.length > 0) {
                    const topKeywords = gitContext.developmentKeywords.keywords.slice(0, 3).join(' ');
                    recentQuery += ` ${topKeywords}`;
                }

                const recentMemories = await queryMemoryService(memoryClient, {
                    semanticQuery: recentQuery,
                    limit: Math.max(Math.floor(remainingSlots * 0.6), 2),
                    timeFilter: 'last-week'
                }, config);

                if (recentMemories && recentMemories.length > 0) {
                    const newRecentMemories = recentMemories.filter(newMem =>
                        !allMemories.some(existing =>
                            existing.content && newMem.content &&
                            existing.content.substring(0, 100) === newMem.content.substring(0, 100)
                        )
                    );
                    allMemories.push(...newRecentMemories);
                }
            }

            // Phase 2: Important tagged memories
            const stillRemaining = maxMemories - allMemories.length;
            if (stillRemaining > 0) {
                const importantTags = [
                    projectContext.name,
                    'key-decisions',
                    'architecture',
                    'claude-code-reference'
                ].filter(Boolean);

                const importantMemories = await memoryClient.queryMemoriesByTagsAndTime(
                    importantTags,
                    'last-2-weeks',
                    stillRemaining,
                    false
                );

                const newMemories = (importantMemories || []).filter(newMem =>
                    !allMemories.some(existing =>
                        existing.content && newMem.content &&
                        existing.content.substring(0, 100) === newMem.content.substring(0, 100)
                    )
                );

                allMemories.push(...newMemories);
            }
        }

        const memories = allMemories.slice(0, maxMemories);

        if (memories.length > 0) {
            const now = new Date();
            const recentCount = memories.filter(m => {
                if (!m.created_at_iso) return false;
                const memDate = new Date(m.created_at_iso);
                const daysDiff = (now - memDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            }).length;

            if (verbose && !cleanMode) {
                const recentText = recentCount > 0 ? ` ${CONSOLE_COLORS.GREEN}(${recentCount} recent)${CONSOLE_COLORS.RESET}` : '';
                console.log(`${CONSOLE_COLORS.GREEN}📚 Memory Search${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} Found ${CONSOLE_COLORS.BRIGHT}${memories.length}${CONSOLE_COLORS.RESET} relevant memories${recentText}`);
            }

            // Score and format memories
            const ageAnalysis = analyzeMemoryAgeDistribution(memories, { verbose: showMemoryDetails && !cleanMode });
            let scoredMemories = scoreMemoryRelevance(memories, projectContext, {
                verbose: showMemoryDetails,
                enhanceRecency: true,
                weights: config.memoryScoring?.weights || {},
                timeDecayRate: config.memoryScoring?.timeDecayRate || 0.1
            });

            // Apply git context weight boost
            scoredMemories = scoredMemories.map(memory => {
                if (memory._gitContextWeight && memory._gitContextWeight !== 1.0) {
                    const originalScore = memory.relevanceScore;
                    const boostedScore = Math.min(1.0, originalScore * memory._gitContextWeight);
                    return {
                        ...memory,
                        _originalScore: originalScore,
                        relevanceScore: boostedScore,
                        _wasBoosted: true
                    };
                }
                return memory;
            }).sort((a, b) => b.relevanceScore - a.relevanceScore);

            scoredMemories = scoredMemories.filter(m => m.relevanceScore > 0);

            const topMemories = scoredMemories.slice(0, maxMemories);

            const contextMessage = formatMemoriesForContext(topMemories, projectContext, {
                includeScore: false,
                groupByCategory: maxMemories > 3,
                maxMemories: maxMemories,
                includeTimestamp: true,
                maxContentLength: config.contextFormatting?.maxContentLength || 500,
                storageInfo: showStorageSource ? storageInfo : null,
                adaptiveTruncation: config.output?.adaptiveTruncation !== false
            });

            if (context.injectSystemMessage) {
                await context.injectSystemMessage(contextMessage);

                // Write log files
                try {
                    const os = require('os');
                    const logPath = path.join(os.homedir(), '.claude', 'last-session-context.txt');
                    const recencyPercent = maxMemories > 0 ? ((recentCount / maxMemories) * 100).toFixed(0) : 0;

                    let logContent = `Session Started: ${new Date().toISOString()}\n`;
                    logContent += `Session ID: ${context.sessionId || 'unknown'}\n\n`;
                    logContent += `=== Project Context ===\n`;
                    logContent += `Project: ${projectContext.name}\n`;
                    logContent += `Language: ${projectContext.language}\n`;
                    if (projectContext.frameworks && projectContext.frameworks.length > 0) {
                        logContent += `Frameworks: ${projectContext.frameworks.join(', ')}\n`;
                    }
                    if (storageInfo) {
                        logContent += `\n=== Storage Backend ===\n`;
                        logContent += `Backend: ${storageInfo.backend}\n`;
                        logContent += `Location: ${storageInfo.location}\n`;
                    }
                    logContent += `\n=== Memory Statistics ===\n`;
                    logContent += `Memories Loaded: ${maxMemories}\n`;
                    logContent += `Recent (last week): ${recentCount} (${recencyPercent}%)\n`;

                    await fs.writeFile(logPath, logContent, 'utf8');
                } catch (error) {
                    // Silent fail
                }
            }
        } else if (verbose && showMemoryDetails && !cleanMode) {
            console.log(`${CONSOLE_COLORS.YELLOW}📭 Memory Search${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.GRAY}No relevant memories found${CONSOLE_COLORS.RESET}`);
        }

    } catch (error) {
        console.error(`${CONSOLE_COLORS.RED}❌ Memory Hook Error${CONSOLE_COLORS.RESET} ${CONSOLE_COLORS.DIM}→${CONSOLE_COLORS.RESET} ${error.message}`);
    } finally {
        if (memoryClient && typeof memoryClient.disconnect === 'function') {
            await memoryClient.disconnect();
        }
    }
}

// ============================================================================
// SESSION END IMPLEMENTATION (merged from session-end.js)
// ============================================================================

async function handleSessionEnd(context) {
    try {
        let lastUserMessage = null;
        if (context.conversation && context.conversation.messages) {
            const userMessages = context.conversation.messages.filter(msg => msg.role === 'user');
            if (userMessages.length > 0) {
                lastUserMessage = userMessages[userMessages.length - 1].content || '';
            }
        }

        const overrides = detectUserOverrides(lastUserMessage);
        if (overrides.forceSkip) {
            logOverride('skip');
            console.log('[Memory Hook] Session consolidation skipped by user override (#skip)');
            return;
        }

        console.log('[Memory Hook] Session ending - consolidating outcomes...');

        const config = await loadConfig();

        if (!config.memoryService.enableSessionConsolidation) {
            console.log('[Memory Hook] Session consolidation disabled in config');
            return;
        }

        // Check session length
        if (!overrides.forceRemember && context.conversation && context.conversation.messages) {
            const totalLength = context.conversation.messages
                .map(msg => (msg.content || '').length)
                .reduce((sum, len) => sum + len, 0);

            if (totalLength < config.sessionAnalysis.minSessionLength) {
                console.log('[Memory Hook] Session too short for consolidation');
                return;
            }
        }

        if (overrides.forceRemember) {
            logOverride('remember');
            console.log('[Memory Hook] Force consolidation requested (#remember)');
        }

        const projectContext = await detectProjectContext(context.workingDirectory || process.cwd());
        console.log(`[Memory Hook] Consolidating session for project: ${projectContext.name}`);

        const analysis = analyzeConversation(context.conversation);

        if (!overrides.forceRemember && analysis.confidence < 0.1) {
            console.log('[Memory Hook] Session analysis confidence too low, skipping consolidation');
            return;
        }

        console.log(`[Memory Hook] Session analysis: ${analysis.topics.length} topics, ${analysis.decisions.length} decisions, confidence: ${(analysis.confidence * 100).toFixed(1)}%`);

        const consolidation = formatSessionConsolidation(analysis, projectContext);

        // Use MemoryClient for storing
        const memoryClient = new MemoryClient(config.memoryService);
        await memoryClient.connect();

        const tags = [
            'claude-code-session',
            'session-consolidation',
            projectContext.name,
            `language:${projectContext.language}`,
            ...analysis.topics.slice(0, 3),
            ...projectContext.frameworks.slice(0, 2),
            `confidence:${Math.round(analysis.confidence * 100)}`
        ].filter(Boolean);

        const metadata = {
            session_analysis: {
                topics: analysis.topics,
                decisions_count: analysis.decisions.length,
                insights_count: analysis.insights.length,
                code_changes_count: analysis.codeChanges.length,
                next_steps_count: analysis.nextSteps.length,
                session_length: analysis.sessionLength,
                confidence: analysis.confidence
            },
            project_context: {
                name: projectContext.name,
                language: projectContext.language,
                frameworks: projectContext.frameworks
            },
            generated_by: 'claude-code-session-lifecycle-hook',
            generated_at: new Date().toISOString()
        };

        const result = await memoryClient.storeMemory(consolidation, tags, metadata, 'session-summary');

        if (result.success || result.content_hash) {
            console.log(`[Memory Hook] Session consolidation stored successfully`);
            if (result.content_hash) {
                console.log(`[Memory Hook] Memory hash: ${result.content_hash.substring(0, 8)}...`);

                // 等待質量評估完成再斷開連線
                try {
                    const evalResult = await memoryClient.triggerQualityEvaluation(result.content_hash);
                    if (evalResult.success) {
                        console.log(`[Memory Hook] Quality evaluated: ${evalResult.quality_score?.toFixed(3)} (${evalResult.quality_provider})`);
                    }
                } catch (err) {
                    console.warn('[Memory Hook] Quality evaluation skipped:', err.message);
                }
            }
        } else {
            console.warn('[Memory Hook] Failed to store session consolidation:', result.error || 'Unknown error');
        }

        await memoryClient.disconnect();

    } catch (error) {
        console.error('[Memory Hook] Error in session end:', error.message);
    }
}

/**
 * Analyze conversation to extract key information
 */
function analyzeConversation(conversationData) {
    try {
        const analysis = {
            topics: [],
            decisions: [],
            insights: [],
            codeChanges: [],
            nextSteps: [],
            sessionLength: 0,
            confidence: 0
        };

        if (!conversationData || !conversationData.messages) {
            return analysis;
        }

        const messages = conversationData.messages;
        const conversationText = messages.map(msg => msg.content || '').join('\n').toLowerCase();
        analysis.sessionLength = conversationText.length;

        // Extract topics
        const topicKeywords = {
            'implementation': /implement|implementing|implementation|build|building|create|creating/g,
            'debugging': /debug|debugging|bug|error|fix|fixing|issue|problem/g,
            'architecture': /architecture|design|structure|pattern|framework|system/g,
            'performance': /performance|optimization|speed|memory|efficient|faster/g,
            'testing': /test|testing|unit test|integration|coverage|spec/g,
            'deployment': /deploy|deployment|production|staging|release/g,
            'configuration': /config|configuration|setup|environment|settings/g,
            'database': /database|db|sql|query|schema|migration/g,
            'api': /api|endpoint|rest|graphql|service|interface/g,
            'ui': /ui|interface|frontend|component|styling|css|html/g
        };

        Object.entries(topicKeywords).forEach(([topic, regex]) => {
            if (conversationText.match(regex)) {
                analysis.topics.push(topic);
            }
        });

        // Extract decisions, insights, code changes, next steps
        // (using same patterns as session-end.js)
        const decisionPatterns = [
            /decided to|decision to|chose to|choosing|will use|going with/g,
            /better to|prefer|recommend|should use|opt for/g,
            /concluded that|determined that|agreed to/g
        ];

        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            decisionPatterns.forEach(pattern => {
                if (content.match(pattern)) {
                    const sentences = msg.content.split(/[.!?]+/);
                    sentences.forEach(sentence => {
                        if (pattern.test(sentence.toLowerCase()) && sentence.length > 20) {
                            analysis.decisions.push(sentence.trim());
                        }
                    });
                }
            });
        });

        // Calculate confidence
        const totalExtracted = analysis.topics.length + analysis.decisions.length +
                              analysis.insights.length + analysis.codeChanges.length +
                              analysis.nextSteps.length;
        analysis.confidence = Math.min(1.0, totalExtracted / 10);

        // Limit arrays
        analysis.decisions = analysis.decisions.slice(0, 3);
        analysis.insights = analysis.insights.slice(0, 3);
        analysis.codeChanges = analysis.codeChanges.slice(0, 4);
        analysis.nextSteps = analysis.nextSteps.slice(0, 4);

        return analysis;

    } catch (error) {
        console.error('[Memory Hook] Error analyzing conversation:', error.message);
        return {
            topics: [],
            decisions: [],
            insights: [],
            codeChanges: [],
            nextSteps: [],
            sessionLength: 0,
            confidence: 0,
            error: error.message
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseHealthDataToStorageInfo(healthData) {
    try {
        if (healthData.content && Array.isArray(healthData.content)) {
            const textContent = healthData.content.find(c => c.type === 'text')?.text;
            if (textContent) {
                try {
                    const parsedData = JSON.parse(textContent.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false').replace(/None/g, 'null'));
                    return parseHealthDataToStorageInfo(parsedData);
                } catch (parseError) {
                    return getUnknownStorageInfo();
                }
            }
        }

        const storage = healthData.storage || healthData || {};
        const statistics = healthData.statistics || healthData.stats || {};

        let icon = '💾';
        switch (storage.backend?.toLowerCase()) {
            case 'sqlite-vec':
            case 'sqlite_vec':
                icon = '🪶';
                break;
            case 'chromadb':
            case 'chroma':
                icon = '📦';
                break;
            case 'cloudflare':
                icon = '☁️';
                break;
        }

        const backendName = storage.backend ? storage.backend.replace('_', '-') : 'Unknown';
        const statusText = storage.status || 'Unknown';
        const description = `${backendName} (${statusText})`;

        let location = storage.database_path || storage.location || process.cwd();
        if (location.length > 50) {
            location = '...' + location.substring(location.length - 47);
        }

        return {
            backend: storage.backend || 'unknown',
            type: storage.backend === 'cloudflare' ? 'cloud' : 'local',
            location: location,
            description: description,
            icon: icon,
            health: {
                status: storage.status,
                totalMemories: statistics.total_memories || storage.total_memories || 0,
                databaseSizeMB: statistics.database_size_mb || storage.database_size_mb || 0,
                uniqueTags: statistics.unique_tags || storage.unique_tags || 0,
                embeddingModel: storage.embedding_model || 'Unknown'
            }
        };

    } catch (error) {
        return getUnknownStorageInfo();
    }
}

function getUnknownStorageInfo() {
    return {
        backend: 'unknown',
        type: 'unknown',
        location: 'Unknown',
        description: 'Unknown Storage',
        icon: '❓',
        health: { status: 'error', totalMemories: 0 }
    };
}

async function queryMemoryService(memoryClient, query, config) {
    try {
        const fallbackToMCP = config?.codeExecution?.fallbackToMCP !== false;

        if (fallbackToMCP && memoryClient) {
            const queryTimeout = new Promise((resolve) =>
                setTimeout(() => resolve([]), 2000)
            );

            const queryPromise = query.timeFilter ?
                memoryClient.queryMemoriesByTime(query.timeFilter, query.limit, query.semanticQuery) :
                memoryClient.queryMemories(query.semanticQuery, query.limit);

            const memories = await Promise.race([queryPromise, queryTimeout]);
            return memories || [];
        }

        return [];
    } catch (error) {
        console.warn('[Memory Hook] Memory query error:', error.message);
        return [];
    }
}

/**
 * Parse JSONL transcript file
 */
async function parseTranscript(transcriptPath) {
    try {
        const content = await fs.readFile(transcriptPath, 'utf8');
        const lines = content.trim().split('\n');
        const messages = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const entry = JSON.parse(line);

                if (entry.type === 'user' || entry.type === 'assistant') {
                    const msg = entry.message;
                    if (msg && msg.role && msg.content) {
                        let contentText = '';
                        if (typeof msg.content === 'string') {
                            contentText = msg.content;
                        } else if (Array.isArray(msg.content)) {
                            contentText = msg.content
                                .filter(block => block.type === 'text')
                                .map(block => block.text)
                                .join('\n');
                        }

                        if (contentText) {
                            messages.push({
                                role: msg.role,
                                content: contentText
                            });
                        }
                    }
                }
            } catch (parseError) {
                continue;
            }
        }

        return { messages };
    } catch (error) {
        console.error('[Memory Hook] Failed to parse transcript:', error.message);
        return { messages: [] };
    }
}

/**
 * Read stdin context
 */
async function readStdinContext() {
    return new Promise((resolve, reject) => {
        let data = '';

        const timeout = setTimeout(() => {
            resolve(null);
        }, 100);

        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                data += chunk;
            }
        });

        process.stdin.on('end', () => {
            clearTimeout(timeout);
            if (data.trim()) {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });

        process.stdin.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

// ============================================================================
// EXPORTS AND DIRECT EXECUTION
// ============================================================================

module.exports = {
    handleSessionStart,
    handleSessionEnd,
    _internal: {
        parseTranscript,
        analyzeConversation,
        loadConfig,
        parseHealthDataToStorageInfo
    }
};

// Direct execution support
if (require.main === module) {
    const args = process.argv.slice(2);
    const mode = args[0];

    if (mode === 'start') {
        const mockContext = {
            workingDirectory: process.cwd(),
            sessionId: 'test-session',
            injectSystemMessage: async (message) => {
                console.log(message);
            }
        };

        handleSessionStart(mockContext)
            .then(() => process.exit(0))
            .catch(error => {
                console.error(`${CONSOLE_COLORS.RED}❌ Hook test failed:${CONSOLE_COLORS.RESET} ${error.message}`);
                process.exit(1);
            });
    } else if (mode === 'end') {
        (async () => {
            try {
                const stdinContext = await readStdinContext();

                let context;

                if (stdinContext && stdinContext.transcript_path) {
                    console.log(`[Memory Hook] Reading transcript: ${stdinContext.transcript_path}`);
                    const conversation = await parseTranscript(stdinContext.transcript_path);

                    context = {
                        workingDirectory: stdinContext.cwd || process.cwd(),
                        sessionId: stdinContext.session_id || 'unknown',
                        reason: stdinContext.reason,
                        conversation: conversation
                    };

                    console.log(`[Memory Hook] Parsed ${conversation.messages.length} messages from transcript`);
                } else {
                    console.log('[Memory Hook] No stdin context - using mock data for testing');
                    context = {
                        workingDirectory: process.cwd(),
                        sessionId: 'test-session',
                        conversation: {
                            messages: [
                                { role: 'user', content: 'Test user message' },
                                { role: 'assistant', content: 'Test assistant response' }
                            ]
                        }
                    };
                }

                await handleSessionEnd(context);
                console.log('Session end hook completed');

            } catch (error) {
                console.error('Session end hook failed:', error);
                process.exit(1);
            }
        })();
    } else {
        console.error('Usage: node session-lifecycle.js [start|end]');
        process.exit(1);
    }
}
