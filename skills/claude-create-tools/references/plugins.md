# Plugins 完整規範

Claude Code Plugin 是打包和分發功能的機制。

## Plugin 結構

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json                 # 必須：插件清單
├── commands/                       # 快捷命令
│   └── deploy.md
├── agents/                         # 自定義 agents
│   └── reviewer.md
├── skills/                         # Skills
│   └── code-review/
│       └── SKILL.md
├── hooks/
│   └── hooks.json                  # Hook 配置
├── scripts/                        # 腳本
│   └── validate.sh
├── .mcp.json                       # MCP 配置（可選）
├── .lsp.json                       # LSP 配置（可選）
└── README.md                       # 說明文檔
```

## Manifest (plugin.json)

### 必填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `name` | string | 唯一標識符（kebab-case） |

### 選填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `version` | string | 語義版本（X.Y.Z） |
| `description` | string | 簡短說明 |
| `author` | object | `{name, email, url}` |
| `homepage` | string | 文檔 URL |
| `repository` | string | 源代碼 URL |
| `license` | string | 許可證標識符 |
| `keywords` | array | 發現標籤 |
| `commands` | string\|array | 命令文件路徑 |
| `agents` | string\|array | Agent 文件路徑 |
| `skills` | string\|array | Skill 目錄路徑 |
| `hooks` | string\|object | Hooks 配置或文件路徑 |
| `mcpServers` | string\|object | MCP 配置 |
| `lspServers` | string\|object | LSP 配置 |

### 完整範例

```json
{
  "name": "deployment-tools",
  "version": "2.1.0",
  "description": "Deployment automation and infrastructure tools",
  "author": {
    "name": "Dev Team",
    "email": "dev@company.com",
    "url": "https://github.com/company"
  },
  "homepage": "https://docs.example.com/deployment-tools",
  "repository": "https://github.com/company/deployment-tools",
  "license": "MIT",
  "keywords": ["deployment", "ci-cd", "infrastructure"],
  "commands": "./commands/",
  "agents": "./agents/",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

---

## MCP 配置

### 外部檔案 (.mcp.json)

```json
{
  "mcpServers": {
    "custom-db": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
    }
  }
}
```

### 內嵌在 plugin.json

```json
{
  "name": "my-plugin",
  "mcpServers": {
    "custom-db": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server"
    }
  }
}
```

---

## LSP 配置

```json
{
  "go": {
    "command": "gopls",
    "args": ["serve"],
    "extensionToLanguage": {
      ".go": "go"
    }
  }
}
```

---

## 環境變數

| 變數 | 說明 |
|------|------|
| `${CLAUDE_PLUGIN_ROOT}` | Plugin 目錄的絕對路徑 |

**使用範例**：
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 開發工作流

### 1. 建立目錄結構

```bash
mkdir -p my-plugin/.claude-plugin
mkdir -p my-plugin/{commands,agents,skills,hooks,scripts}
```

### 2. 建立 plugin.json

```json
{
  "name": "my-plugin",
  "description": "My awesome plugin",
  "version": "1.0.0",
  "author": { "name": "Your Name" }
}
```

### 3. 新增功能

- **Skills**: `skills/my-skill/SKILL.md`
- **Agents**: `agents/my-agent.md`
- **Hooks**: `hooks/hooks.json`
- **Commands**: `commands/my-command.md`

### 4. 本地測試

```bash
# 開發模式載入
claude --plugin-dir ./my-plugin

# 多個 plugin
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

---

## 安裝和管理

```bash
# 從市場安裝
claude plugin install formatter@my-marketplace

# 安裝到項目作用域
claude plugin install formatter@my-marketplace --scope project

# 列出已安裝的插件
claude /plugin

# 啟用/禁用
claude plugin enable my-plugin
claude plugin disable my-plugin

# 更新
claude plugin update my-plugin

# 卸載
claude plugin uninstall my-plugin
```

---

## 命名規範

| 類型 | 規則 | 範例 |
|------|------|------|
| Plugin name | kebab-case | `deployment-tools` |
| Skill 引用 | `/plugin-name:skill-name` | `/my-plugin:hello` |
| Agent 引用 | `plugin-name:agent-name` | `my-plugin:reviewer` |

---

## 注意事項

### Plugin 緩存

- Claude Code 複製 plugin 到緩存目錄
- Plugin 不能引用複製目錄外的檔案
- 路徑遍歷（如 `../shared-utils`）在安裝後不起作用

### 解決方案

1. 使用符號鏈接
2. 重構結構，將所有檔案放在 plugin 目錄內

---

## Checklist

- [ ] `.claude-plugin/plugin.json` 存在
- [ ] `name` 欄位存在且為 kebab-case
- [ ] JSON 格式有效
- [ ] 引用的目錄存在
- [ ] 使用 `${CLAUDE_PLUGIN_ROOT}` 而非相對路徑
- [ ] 本地測試通過
