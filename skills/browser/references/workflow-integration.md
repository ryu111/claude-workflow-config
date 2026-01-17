# Agent-Browser 與 D→R→T 工作流整合

說明 REVIEWER 和 TESTER 如何使用 agent-browser 驗證 UI。

## 核心原則

```
┌────────────────────────────────────────────────────────────┐
│  UI 程式碼變更 = 必須用 agent-browser 驗證                │
│  有設計規格 = 必須對照驗證                                 │
│  發現 UI Bug = 必須截圖存證                                │
└────────────────────────────────────────────────────────────┘
```

---

## REVIEWER 使用 Agent-Browser

### 使用時機

REVIEWER 在以下情況**必須**使用 agent-browser：

| 情況 | 驗證內容 | 優先級 |
|------|----------|--------|
| **UI 元件變更** | 視覺樣式、佈局、互動狀態 | P0 |
| **CSS 修改** | 是否影響其他元素、佈局破壞 | P0 |
| **Design Token 使用** | 是否正確使用 CSS Variables | P1 |
| **響應式調整** | 各斷點是否正常顯示 | P1 |
| **設計規格實作** | 是否完全符合 ui-specs/*.md | P0 |

### REVIEWER 驗證流程

```
1. 讀取 DEVELOPER 的變更（git diff）
    ↓
2. 識別 UI 變更（CSS, Component, Layout）
    ↓
3. 讀取設計規格（如有）
    ↓
4. 使用 agent-browser 快速驗證
    ↓
5. 發現問題 → REJECT + 截圖存證
6. 通過 → APPROVE（進入 TESTER）
```

### 範例：審查按鈕樣式變更

**情境**：DEVELOPER 修改了 `Button.tsx`，加入新的 `primary` 樣式。

```bash
# ========== Step 1: 讀取變更 ==========
# (讀取 git diff)
# + background: var(--color-primary);
# + color: var(--color-white);
# + &:hover { background: var(--color-primary-dark); }

# ========== Step 2: 識別需要驗證的點 ==========
# - 背景顏色使用 token ✓
# - Hover 狀態存在 ✓
# - 需要驗證：實際顯示效果

# ========== Step 3: 使用 agent-browser 驗證 ==========
agent-browser navigate http://localhost:3000/components/button
agent-browser screenshot

# 驗證背景顏色
agent-browser evaluate "Primary button" @ref s1e5 << 'EOF'
(element) => {
  const style = window.getComputedStyle(element);
  const root = window.getComputedStyle(document.documentElement);

  return {
    bg: style.backgroundColor,
    expectedBg: root.getPropertyValue('--color-primary').trim(),
    matches: style.backgroundColor === root.getPropertyValue('--color-primary').trim()
  };
}
EOF
# ✅ { matches: true }

# 驗證 Hover 狀態
agent-browser hover "Primary button" @ref s1e5
agent-browser evaluate "Primary button" @ref s1e5 << 'EOF'
(element) => {
  const hoverBg = window.getComputedStyle(element).backgroundColor;
  const root = window.getComputedStyle(document.documentElement);
  const expectedHoverBg = root.getPropertyValue('--color-primary-dark').trim();

  return {
    hoverBg: hoverBg,
    expectedHoverBg: expectedHoverBg,
    matches: hoverBg === expectedHoverBg
  };
}
EOF
# ❌ { matches: false } → REJECT

# ========== Step 4: 截圖存證 + 回報 ==========
agent-browser screenshot -e "Primary button" @ref s1e5 -o review/button-hover-issue.png
```

**REVIEWER 回報**：

```markdown
## 審查結果：REJECT

### 問題
Button hover 狀態顏色不符合 Design Token。

**預期**：使用 `--color-primary-dark` (rgb(37, 99, 235))
**實際**：使用 `--color-primary` (rgb(59, 130, 246)) (沒變化)

**截圖**：review/button-hover-issue.png

**修復建議**：
檢查 CSS，確保 `&:hover` 樣式正確應用。

### 其他檢查
- ✅ 背景顏色使用正確 token
- ✅ 文字顏色正確
- ❌ Hover 狀態顏色錯誤

**決定**：REJECT，待 DEVELOPER 修復後重新審查。
```

---

### 範例：審查 CSS 變更影響

**情境**：DEVELOPER 修改了全域 CSS，調整了 `--spacing-md`。

```bash
# ========== 驗證是否影響現有佈局 ==========
agent-browser navigate http://localhost:3000
agent-browser screenshot

# 檢查卡片間距
agent-browser evaluate "card grid" @ref s1e10 << 'EOF'
(element) => {
  const cards = Array.from(element.children);
  const gaps = [];

  for (let i = 0; i < cards.length - 1; i++) {
    const rect1 = cards[i].getBoundingClientRect();
    const rect2 = cards[i + 1].getBoundingClientRect();
    const gap = rect2.top - rect1.bottom;
    gaps.push(gap);
  }

  return {
    gaps: gaps,
    allSame: gaps.every(g => Math.abs(g - gaps[0]) < 1),
    expectedGap: 16  // --spacing-md 的新值
  };
}
EOF

# 檢查多個頁面
for page in "/" "/about" "/contact"; do
  agent-browser navigate "http://localhost:3000$page"
  agent-browser screenshot
  # ... 檢查佈局
done
```

**REVIEWER 決策**：
- 如果所有頁面佈局正常 → APPROVE
- 如果有頁面佈局破壞 → REJECT + 截圖

---

### REVIEWER 快速驗證 Checklist

當審查 UI 程式碼時：

- [ ] 是否修改了 CSS 或 Component？
- [ ] 是否有對應的設計規格？（ui-specs/*.md）
- [ ] 啟動 dev server (`npm run dev`)
- [ ] 使用 agent-browser 驗證視覺效果
- [ ] 檢查 Design Token 使用
- [ ] 檢查互動狀態（Hover, Focus）
- [ ] 檢查是否影響其他頁面
- [ ] 發現問題 → 截圖 + REJECT
- [ ] 全部通過 → APPROVE

---

## TESTER 使用 Agent-Browser

### 使用時機

TESTER 在以下情況**必須**使用 agent-browser：

| 測試類型 | Agent-Browser 用途 | 優先級 |
|----------|-----------------|--------|
| **E2E 測試** | 完整流程測試 + UI 驗證 | P0 |
| **功能測試** | 功能正確性 + UI 狀態驗證 | P0 |
| **回歸測試** | 確保新變更不破壞舊功能 + 視覺比對 | P1 |
| **設計規格驗證** | 完整對照 ui-specs/*.md | P0 |

### TESTER 驗證流程

```
1. 讀取任務需求 + 設計規格
    ↓
2. 建立測試計畫（功能 + UI）
    ↓
3. 執行功能測試（agent-browser 操作）
    ↓
4. 執行 UI 驗證（design-validation.md 流程）
    ↓
5. 執行回歸測試（確保無破壞）
    ↓
6. 產出測試報告
    ↓
7. PASS → 標記完成
8. FAIL → 呼叫 DEBUGGER
```

### 範例：測試登入流程 + UI 驗證

**任務**：驗證登入功能實作
**設計規格**：`openspec/changes/xxx/ui-specs/login-form.md`

```bash
# ========== 功能測試 ==========
echo "1. 測試登入流程..."

agent-browser navigate http://localhost:3000/login
agent-browser screenshot

# 1.1 測試成功登入
agent-browser type "Email input" @ref s1e3 "user@example.com"
agent-browser type "Password input" @ref s1e4 "password123"
agent-browser click "Login button" @ref s1e5

agent-browser wait-for text "Dashboard"
agent-browser screenshot
# ✅ 成功導向 /dashboard

# 1.2 測試錯誤登入
agent-browser navigate http://localhost:3000/login
agent-browser type "Email input" @ref s1e3 "wrong@example.com"
agent-browser type "Password input" @ref s1e4 "wrong"
agent-browser click "Login button" @ref s1e5

agent-browser wait-for text "Invalid credentials"
# ✅ 顯示錯誤訊息

# ========== UI 驗證 ==========
echo "2. 驗證 UI 符合設計規格..."

# 2.1 佈局驗證
agent-browser navigate http://localhost:3000/login
agent-browser screenshot

agent-browser evaluate "login container" @ref s1e1 << 'EOF'
(element) => {
  const style = window.getComputedStyle(element);
  return {
    maxWidth: style.maxWidth,
    padding: style.padding
  };
}
EOF
# ✅ { maxWidth: "400px", padding: "32px" }

# 2.2 視覺驗證
agent-browser evaluate "Login heading" @ref s1e2 << 'EOF'
(element) => {
  const style = window.getComputedStyle(element);
  const root = window.getComputedStyle(document.documentElement);

  return {
    fontSize: style.fontSize,
    expectedSize: root.getPropertyValue('--text-2xl').trim(),
    fontWeight: style.fontWeight,
    expectedWeight: root.getPropertyValue('--font-semibold').trim(),
    sizeCorrect: style.fontSize === root.getPropertyValue('--text-2xl').trim(),
    weightCorrect: style.fontWeight === root.getPropertyValue('--font-semibold').trim()
  };
}
EOF
# ✅ { sizeCorrect: true, weightCorrect: true }

# 2.3 狀態驗證 - Loading
agent-browser navigate http://localhost:3000/login
agent-browser type "Email input" @ref s1e3 "user@example.com"
agent-browser type "Password input" @ref s1e4 "password123"
agent-browser click "Login button" @ref s1e5

agent-browser screenshot
# 應該看到：
# - spinner [ref=s2e1]
# - button "Logging in..." [disabled, aria-busy=true]

# ✅ Loading 狀態正確

# 2.4 狀態驗證 - Error
agent-browser navigate http://localhost:3000/login
agent-browser type "Email input" @ref s1e3 "invalid"
agent-browser click "Login button" @ref s1e5

agent-browser wait-for text "Invalid email format"
agent-browser screenshot
# 應該看到：
# - textbox "Email" [aria-invalid=true, ref=s2e3]
# - text "Invalid email format" [role=alert]

agent-browser evaluate "Email input" @ref s2e3 << 'EOF'
(element) => {
  const style = window.getComputedStyle(element);
  return {
    borderColor: style.borderColor,
    ariaInvalid: element.getAttribute('aria-invalid')
  };
}
EOF
# ✅ { ariaInvalid: "true" }

# 2.5 響應式驗證
agent-browser viewport 375 667
agent-browser screenshot

agent-browser evaluate "login container" @ref s1e1 << 'EOF'
(element) => {
  return {
    width: element.clientWidth,
    padding: window.getComputedStyle(element).padding
  };
}
EOF
# ✅ Mobile padding 調整正確

# ========== 回歸測試 ==========
echo "3. 回歸測試..."

# 檢查其他頁面是否被影響
for page in "/" "/about" "/contact"; do
  agent-browser navigate "http://localhost:3000$page"
  agent-browser screenshot

  # 檢查是否有 console error
  agent-browser console-logs error
  # ✅ 無錯誤
done
```

**TESTER 測試報告**：

```markdown
# 登入功能測試報告

**日期**：2024-01-12
**測試者**：TESTER
**任務**：實作登入功能
**設計規格**：openspec/changes/xxx/ui-specs/login-form.md

---

## 執行摘要

- **功能測試**：PASS ✅
- **UI 驗證**：PASS ✅
- **回歸測試**：PASS ✅
- **總結**：PASS

---

## 功能測試

### 1. 成功登入
- ✅ 輸入正確帳密
- ✅ 點擊登入
- ✅ 導向 /dashboard

### 2. 錯誤登入
- ✅ 輸入錯誤帳密
- ✅ 顯示錯誤訊息
- ✅ 保持在登入頁

### 3. 表單驗證
- ✅ 空白 email 顯示錯誤
- ✅ 無效 email 格式顯示錯誤
- ✅ 空白密碼顯示錯誤

---

## UI 驗證

### 佈局
- ✅ Container max-width 400px
- ✅ Padding 32px
- ✅ 元素對齊正確

### 視覺
- ✅ 標題 --text-2xl (31.25px)
- ✅ 標題 --font-semibold (600)
- ✅ 按鈕背景 --color-primary
- ✅ 按鈕圓角 --radius-lg

### 狀態
- ✅ Loading: spinner + disabled
- ✅ Error: 紅色邊框 + aria-invalid
- ✅ Focus: outline 正確

### 響應式
- ✅ Mobile (375px): 單欄佈局
- ✅ Desktop (1280px): 置中顯示

---

## 回歸測試

- ✅ 首頁正常顯示
- ✅ 關於頁正常顯示
- ✅ 聯絡頁正常顯示
- ✅ 無 console 錯誤

---

## 結論

**測試結果：PASS ✅**

所有功能和 UI 驗證通過，符合設計規格，無回歸問題。

**建議**：
- 任務標記為完成
- 更新 tasks.md checkbox
```

---

### TESTER 完整驗證 Checklist

執行測試前：

- [ ] 讀取任務需求
- [ ] 讀取設計規格（ui-specs/*.md）
- [ ] 讀取 Design Tokens (tokens.md)
- [ ] 建立測試計畫（功能 + UI）
- [ ] 啟動 dev server

執行測試時：

- [ ] 功能測試：正常流程
- [ ] 功能測試：錯誤處理
- [ ] 功能測試：邊界條件
- [ ] UI 驗證：佈局
- [ ] UI 驗證：視覺（顏色、字體、間距）
- [ ] UI 驗證：狀態（Loading, Error, Empty）
- [ ] UI 驗證：互動（Hover, Focus）
- [ ] UI 驗證：響應式（各斷點）
- [ ] 回歸測試：其他頁面無破壞
- [ ] 無障礙測試：ARIA, 對比度

測試後：

- [ ] 產出測試報告
- [ ] 截圖存證（如有失敗）
- [ ] PASS → 標記完成
- [ ] FAIL → 呼叫 DEBUGGER + 提供報告

---

## 強制規則

### 1. UI 變更必須用 agent-browser 驗證

```
┌────────────────────────────────────────────────────────────┐
│  變更 CSS/Component = 必須 agent-browser 驗證             │
│  沒有例外！                                                │
└────────────────────────────────────────────────────────────┘
```

**觸發條件**：

- 修改 `.css` 或 `.scss` 檔案
- 修改 Component 的 JSX/TSX（含樣式）
- 修改 Design Tokens
- 修改全域樣式
- 新增 UI 元件

**如何檢查**：

```bash
# 檢查 git diff
git diff --name-only

# 如果包含以下檔案類型 → 必須驗證
*.css
*.scss
*.tsx (Component 檔案)
*.jsx
tokens.css
globals.css
```

---

### 2. 有設計規格必須對照驗證

```
┌────────────────────────────────────────────────────────────┐
│  存在 ui-specs/*.md = 必須執行 design-validation.md 流程  │
│  沒有例外！                                                │
└────────────────────────────────────────────────────────────┘
```

**檢查方式**：

```bash
# 檢查是否有設計規格
ls openspec/changes/[change-id]/ui-specs/

# 如果有檔案 → 必須對照驗證
```

**驗證流程**：
1. 讀取設計規格
2. 提取驗證點
3. 執行完整驗證（design-validation.md）
4. 產出驗證報告

---

### 3. 發現問題必須截圖存證

```
┌────────────────────────────────────────────────────────────┐
│  UI Bug = 必須截圖存證                                     │
│  方便 DEVELOPER 修復                                       │
└────────────────────────────────────────────────────────────┘
```

**截圖時機**：

- REVIEWER 發現問題 → 截圖 + REJECT
- TESTER 發現問題 → 截圖 + 記錄到報告
- DEBUGGER 修復前 → 截圖 Bug 狀態
- DEBUGGER 修復後 → 截圖修復結果

**截圖命名**：

```
screenshots/
├── review/
│   ├── button-hover-issue.png
│   └── layout-overflow.png
├── test/
│   ├── login-error-state.png
│   └── mobile-layout-fail.png
└── debug/
    ├── before-fix.png
    └── after-fix.png
```

---

## 工作流整合範例

完整的 D→R→T 流程，包含 agent-browser 驗證：

```
========== DEVELOPER ==========
Task(subagent_type: "developer")
- 實作登入表單
- 根據 ui-specs/login-form.md
- 使用 Design Tokens
- 完成

========== REVIEWER ==========
Task(subagent_type: "reviewer")

# 1. 讀取程式碼變更
git diff

# 2. 發現 UI 變更
- 新增 LoginForm.tsx
- 修改 login.css

# 3. 讀取設計規格
Read: openspec/changes/xxx/ui-specs/login-form.md

# 4. 使用 agent-browser 快速驗證
agent-browser navigate ...
agent-browser screenshot
agent-browser evaluate ...
# 發現：Button hover 狀態缺失

# 5. 截圖 + REJECT
agent-browser screenshot -e "Primary button" @ref s1e5 -o review/button-hover-issue.png

決定：REJECT
原因：Button hover 狀態不符合設計規格
截圖：review/button-hover-issue.png

========== DEVELOPER (重試) ==========
Task(subagent_type: "developer")
- 修復 Button hover 狀態
- 完成

========== REVIEWER (重新審查) ==========
Task(subagent_type: "reviewer")
- 驗證 hover 狀態
- ✅ 通過

決定：APPROVE

========== TESTER ==========
Task(subagent_type: "tester")

# 1. 讀取任務 + 設計規格
Read: tasks.md
Read: openspec/changes/xxx/ui-specs/login-form.md
Read: ~/.claude/skills/ui/references/tokens.md

# 2. 執行功能測試 + UI 驗證
agent-browser navigate ...
agent-browser screenshot

# 功能測試
agent-browser type ...
agent-browser click ...
agent-browser wait-for ...
# ✅ 登入功能正常

# UI 驗證（design-validation.md 流程）
agent-browser evaluate ...
# ✅ 佈局正確
# ✅ 視覺符合規格
# ✅ 狀態正確
# ✅ 響應式正常

# 3. 產出測試報告
測試結果：PASS ✅

========== 完成 ==========
更新 tasks.md checkbox
標記任務完成
```

---

## Session 結束檢查

每次 session 結束時，確認 agent-browser 使用：

```
📋 Agent-Browser 使用報告

【REVIEWER】
- UI 變更任務：X 個
- 使用 agent-browser 驗證：X 個
- 未驗證的 UI 變更：0 個 ✅

【TESTER】
- 測試任務：X 個
- UI 相關任務：X 個
- 使用 agent-browser 驗證：X 個
- 未驗證的 UI 任務：0 個 ✅

【截圖存證】
- 發現問題：X 個
- 截圖存證：X 個
- 未截圖的問題：0 個 ✅
```

---

## 總結

**Agent-Browser 在工作流中的角色**：

| Agent | 使用時機 | 目的 |
|-------|----------|------|
| **REVIEWER** | 審查 UI 變更 | 快速驗證、發現問題 |
| **TESTER** | 測試功能 + UI | 完整驗證、確保品質 |
| **DEBUGGER** | 修復 UI Bug | 比對修復前後 |

**記住三個強制規則**：
1. UI 變更 = 必須 agent-browser 驗證
2. 有設計規格 = 必須對照驗證
3. 發現問題 = 必須截圖存證

**相關文檔**：
- UI 驗證 Checklist → `ui-checklist.md`
- 常見 UI Bug → `ui-bugs.md`
- 設計驗證流程 → `design-validation.md`
