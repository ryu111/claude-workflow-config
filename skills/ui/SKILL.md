---
name: ui
description: UI 視覺設計規範。建立美觀、一致、專業的使用者介面。適用於需要設計或實作視覺元素時，包含色彩、字體、間距、元件樣式等視覺規範。
---

# UI 視覺設計規範

確保產出專業、一致且美觀的介面。

## 設計思維

開始前先釐清：

1. **目的**：解決什麼問題？
2. **受眾**：誰會使用？
3. **情境**：什麼環境？
4. **品牌**：什麼調性？

## 核心原則

| 原則 | 說明 |
|------|------|
| 主色 ≤ 3 種 | 避免視覺混亂 |
| 對比度 ≥ 4.5:1 | WCAG AA 標準 |
| 間距用 4px 倍數 | 保持一致 |
| 內文 ≥ 16px | 確保可讀性 |
| 觸控區 ≥ 44px | 方便點擊 |

---

## 60-30-10 色彩法則

```
┌─────────────────────────────────────┐
│     60% 主色（Dominant）             │
│     背景、大面積                     │
├─────────────────────────────────────┤
│  30% 次色（Secondary）               │
│  卡片、區塊、導航                    │
├───────────────────┬─────────────────┤
│ 10% 強調色        │  CTA、連結       │
│ (Accent)          │  重點元素        │
└───────────────────┴─────────────────┘
```

**應用**：
- 60%：背景色 (#ffffff / #121212)
- 30%：區塊、卡片、導航
- 10%：主要按鈕、連結、重點

For complete color theory → read `references/color-theory.md`

---

## Token 三層架構

```
Primitive → Semantic → Component
(原始值)    (語意化)   (元件專用)

範例：
--primitive-blue-600
    ↓
--color-primary
    ↓
--button-primary-bg
```

**為什麼分層**：
- 可維護：改一處，全部更新
- 可擴展：新元件引用語意 token
- 主題切換：覆蓋 semantic 層即可

For complete tokens → read `references/tokens.md`

---

## 動效設計速查

### Duration（持續時間）

| 類型 | 時間 | 用途 |
|------|------|------|
| 即時 | 50-100ms | Hover、Toggle |
| 標準 | 150-300ms | Modal、選單 |
| 複雜 | 300-500ms | 頁面轉場 |

### Easing（緩動函數）

| 類型 | 用途 |
|------|------|
| ease-out | 進入動畫（減速進入） |
| ease-in | 離開動畫（加速離開） |
| ease-in-out | 狀態變化 |

### 關鍵原則

```css
/* 高效能屬性（優先使用） */
transform: translate(), scale(), rotate()
opacity

/* 避免動畫的屬性（會觸發重排） */
width, height, margin, padding
```

For complete motion design → read `references/motion-design.md`

---

## 深色模式速查

### 表面層級

```
Level 0: #121212 (最底層背景)
Level 1: #1e1e1e (卡片、導航)
Level 2: #252525 (懸浮、選中)
Level 3: #2d2d2d (輸入框、下拉)
Level 4: #383838 (Tooltip)
```

### 色彩調整

```css
/* 深色模式調整 */
--color-primary: 降低飽和度 10%
--color-text: 使用 gray-100 而非 #ffffff
--shadow: 使用邊框代替或降低不透明度
```

For complete dark mode → read `references/dark-mode.md`

---

## 字體排版速查

### 模組化縮放

```css
/* 1.25 比例 (Major Third) */
--text-xs: 0.64rem;   /* 10.24px */
--text-sm: 0.8rem;    /* 12.8px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.25rem;   /* 20px */
--text-xl: 1.563rem;  /* 25px */
--text-2xl: 1.953rem; /* 31.25px */
```

### 流體字體

```css
/* 自動縮放 */
font-size: clamp(1rem, 0.5rem + 1vw, 1.5rem);
```

For complete typography → read `references/typography-advanced.md`

---

## 元件狀態

每個互動元件需定義：

| 狀態 | 視覺 |
|------|------|
| Default | 基本樣式 |
| Hover | 亮度變化 |
| Focus | Focus ring |
| Active | 按下效果 |
| Disabled | 50% 透明度 |
| Loading | Spinner |
| Error | 紅色邊框 |

For component specs → read `references/components.md`

---

## 響應式斷點

```css
sm: 640px   /* 手機橫向 */
md: 768px   /* 平板 */
lg: 1024px  /* 小桌面 */
xl: 1280px  /* 大桌面 */
```

**Mobile First**：從小螢幕開始設計。

---

## 無障礙要點

### 對比度

- 一般文字：4.5:1（AA）
- 大文字（18px+）：3:1
- UI 元件：3:1

### 其他

- 不只依賴顏色傳達資訊
- Focus 狀態清晰可見
- 支援 `prefers-reduced-motion`
- 觸控目標 ≥ 44×44px

---

## 風格選擇速查

### 風格系統總覽

```
產品類型 → industry.md → 主推風格
              ↓
         風格群組.md → Token 調整
              ↓
         palettes.md → 配色方案
              ↓
         font-pairs.md → 字體配對
```

### 6 大風格群組

| 群組 | 特徵 | 適用 | 檔案 |
|------|------|------|------|
| **Minimalist** | 簡潔、留白、功能性 | SaaS、工具 | `styles/minimalist.md` |
| **Dimensional** | 玻璃、深度、光影 | 現代 App | `styles/dimensional.md` |
| **Bold** | 大膽、撞色、醒目 | 創意、年輕 | `styles/bold.md` |
| **Organic** | 自然、柔和、手繪 | 健康、環保 | `styles/organic.md` |
| **Tech** | 科技、霓虹、深色 | 遊戲、科技 | `styles/tech.md` |
| **Classic** | 專業、網格、傳統 | 企業、金融 | `styles/classic.md` |

### 產業快速匹配

| 產業 | 首選風格 | 次選 |
|------|----------|------|
| SaaS/工具 | Clean Minimal | Glassmorphism |
| 金融/銀行 | Corporate Clean | Swiss Grid |
| 醫療/健康 | Soft Minimal | Nature-inspired |
| 電商/時尚 | Editorial | Bold Minimal |
| 遊戲/娛樂 | Cyberpunk | Neon Glow |
| 創意/設計 | Neubrutalism | Maximalist |

完整產業映射 → `references/styles/industry.md`

### 多風格提案

當需要提供多個設計選項時：

1. 查閱 `styles/industry.md` → 匹配產業主推風格
2. 讀取對應 `styles/[group].md` → 獲取 Token 調整
3. 選擇 `palettes.md` → 配色方案
4. 選擇 `font-pairs.md` → 字體配對
5. 使用 `templates/multi-style-proposal.md` → 輸出格式

### 風格資源

| 資源 | 檔案 |
|------|------|
| **可視化預覽** | `demo/style-preview.html` |
| 風格總覽 | `references/styles/index.md` |
| 產業映射 | `references/styles/industry.md` |
| 配色方案 | `references/palettes.md` |
| 字體配對 | `references/font-pairs.md` |
| 提案模板 | `templates/multi-style-proposal.md` |

### 使用 Demo 預覽

在瀏覽器打開 `demo/style-preview.html` 可以：
- 即時切換 8 種風格（Clean、Dark、Terminal、Glass 等）
- 預覽按鈕、卡片、表單、表格等元件
- 查看配色方案
- 一鍵複製 CSS Variables

---

## Checklist

- [ ] 色彩對比度符合標準
- [ ] 遵循 60-30-10 色彩法則
- [ ] Token 三層架構正確使用
- [ ] 所有互動元素有 hover/focus
- [ ] 動效時間在建議範圍內
- [ ] 支援深色模式
- [ ] 響應式正常顯示
- [ ] 載入/錯誤狀態處理

---

## Next Steps

### 基礎
- Design tokens 完整規格 → `references/tokens.md`
- Component specifications → `references/components.md`

### 進階
- 進階色彩理論 → `references/color-theory.md`
- 動效設計系統 → `references/motion-design.md`
- 深色模式設計 → `references/dark-mode.md`
- 進階字體排版 → `references/typography-advanced.md`
- 設計系統架構 → `references/design-system-arch.md`
