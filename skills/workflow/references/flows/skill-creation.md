# S→W Flow: Skill Creation and Validation

Skill 建立流程的完整定義，確保所有新建立的 skills 符合品質標準。

## 流程概覽

```
┌──────────────────────────────────────────────────────────────┐
│                     S→W Flow                                  │
│                                                              │
│  ┌─────────────────┐      ┌─────────────────┐               │
│  │  Skills Agent   │ ───→ │ Workflow Agent  │               │
│  │  (建立 skill)   │      │  (驗證 skill)   │               │
│  └─────────────────┘      └────────┬────────┘               │
│                                    │                         │
│                           ┌────────┴────────┐               │
│                           │                 │               │
│                         PASS              FAIL               │
│                           │                 │               │
│                           ▼                 ▼               │
│                      ┌────────┐      ┌───────────┐          │
│                      │ 完成 ✅ │      │ 返回 S    │          │
│                      └────────┘      │ 修正後重試│          │
│                                      └───────────┘          │
└──────────────────────────────────────────────────────────────┘
```

## 觸發條件

| 觸發方式 | 範例 |
|----------|------|
| 明確請求 | "建立 XXX skill" |
| 關鍵字 | `建立 skill`, `新增 skill`, `skill 研究` |
| 流程連結 | M→S→W→D→R→T 中的 S 階段 |

## 詳細步驟

### Step 1: Skills Agent 建立 Skill

**輸入**：用戶需求或研究結果

**執行**：
1. 研究工具/框架（使用 context7、WebSearch）
2. 評估 skill 價值
3. 規劃結構
4. 建立 SKILL.md 和 references/
5. 提交給 Workflow Agent 驗證

**輸出**：完整的 skill 目錄結構

```
~/.claude/skills/[skill-name]/
├── SKILL.md
├── references/
│   └── [reference-files].md
└── templates/  (可選)
    └── [template-files]
```

### Step 2: Workflow Agent 驗證 Skill

**輸入**：Skills Agent 建立的 skill 目錄

**驗證清單**：

#### 2.1 結構驗證

| 項目 | 檢查內容 | 通過標準 |
|------|----------|----------|
| SKILL.md | 檔案存在 | 必須存在 |
| SKILL.md 長度 | 行數 | < 500 行 |
| references/ | 目錄存在 | 如果有深度內容，必須存在 |
| 無冗餘檔案 | README, CHANGELOG | 不應存在 |

#### 2.2 Frontmatter 驗證

```yaml
---
name: skill-name          # 必須：小寫，連字號分隔
description: 描述 + 觸發條件  # 必須：包含何時使用
---
```

| 項目 | 檢查內容 | 通過標準 |
|------|----------|----------|
| name | 格式正確 | 小寫，連字號分隔 |
| description | 內容完整 | 包含功能描述 **和** 觸發條件 |

#### 2.3 Progressive Disclosure 驗證

| 項目 | 檢查內容 | 通過標準 |
|------|----------|----------|
| 分層 | SKILL.md 為速查表 | 核心內容在 SKILL.md，深度在 references/ |
| 連結 | 單層連結 | SKILL.md → reference（無 A → B → C） |
| Token 效率 | 必要性 | 只包含 AI 不知道的資訊 |

#### 2.4 Bundled Resources 驗證

| 項目 | 檢查內容 | 通過標準 |
|------|----------|----------|
| 外部依賴 | 連結目標 | 所有連結指向 skill 目錄內的檔案 |
| 完整性 | 參考檔案 | 所有 references/ 中的檔案都存在 |

#### 2.5 內容品質驗證

| 項目 | 檢查內容 | 通過標準 |
|------|----------|----------|
| 觸發條件 | description | 明確說明何時觸發 |
| 核心原則 | SKILL.md | 有清晰的核心原則（≤ 5 條） |
| 速查表 | SKILL.md | 有可快速參考的表格或列表 |
| 導航 | Next Steps | 有指向 references/ 的導航 |

**輸出**：驗證報告

### Step 3: 決策點

```
驗證結果
    │
    ├─ PASS（全部通過）
    │   └─ 輸出成功報告
    │   └─ 流程完成 ✅
    │
    └─ FAIL（任一失敗）
        └─ 輸出問題列表
        └─ 返回 Skills Agent 修正
        └─ 重新執行 Step 1-2
```

## 驗證輸出格式

### 通過時

```markdown
## ✅ Skill 驗證通過：[skill-name]

### 驗證摘要
| 項目 | 狀態 |
|------|------|
| 結構 | ✅ 通過 |
| Frontmatter | ✅ 通過 |
| Progressive Disclosure | ✅ 通過 |
| Bundled Resources | ✅ 通過 |
| 內容品質 | ✅ 通過 |

### 詳細結果
- SKILL.md：X 行（< 500）
- References：Y 個檔案
- 觸發條件：[description 中的觸發描述]

### 建議（可選）
- [任何優化建議，不影響通過]

### 狀態
流程完成。Skill 可以使用。
```

### 失敗時

```markdown
## ❌ Skill 驗證失敗：[skill-name]

### 問題列表

#### 1. [問題類別]
- **問題**：[具體描述]
- **位置**：[檔案/行號]
- **修正建議**：[具體建議]

#### 2. [問題類別]
- **問題**：[具體描述]
- **位置**：[檔案/行號]
- **修正建議**：[具體建議]

### 狀態
返回 Skills Agent 修正。修正完成後重新提交驗證。
```

## 重試機制

| 參數 | 值 |
|------|-----|
| max_retries | 3 |
| 超過限制 | 停止流程，報告失敗原因 |

```
Retry 1 → FAIL → Retry 2 → FAIL → Retry 3 → FAIL → 停止
                                                    │
                                                    ▼
                                            輸出最終失敗報告
                                            建議人工介入
```

## 常見問題和修正

### 問題 1: Description 缺少觸發條件

**錯誤**：
```yaml
description: 處理 PDF 文件的操作
```

**正確**：
```yaml
description: 處理 PDF 文件的操作。當需要旋轉、合併、提取 PDF 頁面時使用。
```

### 問題 2: SKILL.md 過長

**錯誤**：500+ 行的 SKILL.md，包含所有詳細內容

**正確**：
- SKILL.md 只放速查表和核心原則
- 詳細內容移到 references/

### 問題 3: 多層連結

**錯誤**：
```
SKILL.md → references/overview.md → references/details.md
```

**正確**：
```
SKILL.md → references/topic-a.md
SKILL.md → references/topic-b.md
```

### 問題 4: 外部依賴

**錯誤**：
```markdown
For more details → see `/path/to/external/file.md`
```

**正確**：
```markdown
For more details → see `references/details.md`
```

## 與其他流程的關係

### 作為獨立流程

```
用戶: 建立 XXX skill
    ↓
S→W 獨立執行
    ↓
完成
```

### 作為 M→S→W→D→R→T 的一部分

```
M→S→W→D→R→T
    │
    └─ S→W 是其中的 S 和 W 步驟
       完成後繼續 D→R→T
```

## Checklist

執行 S→W 流程時確認：

- [ ] Skills Agent 完成 skill 建立
- [ ] Workflow Agent 執行完整驗證
- [ ] 所有 5 個驗證類別都通過
- [ ] 輸出驗證報告
- [ ] 如失敗，問題列表清楚具體
- [ ] 重試不超過 3 次
