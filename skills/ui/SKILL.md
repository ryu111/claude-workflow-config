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

## Design Tokens 摘要

```css
/* 主色 */
--color-primary: #2563eb;

/* 語意 */
--color-success: #10b981;
--color-error: #ef4444;

/* 間距（4px 基準） */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */

/* 圓角 */
--radius-md: 0.375rem;
--radius-lg: 0.5rem;

/* 陰影 */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
```

For complete tokens → read `references/tokens.md`

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

## 響應式斷點

```css
sm: 640px   /* 手機橫向 */
md: 768px   /* 平板 */
lg: 1024px  /* 小桌面 */
xl: 1280px  /* 大桌面 */
```

**Mobile First**：從小螢幕開始設計。

## Checklist

- [ ] 色彩對比度符合標準
- [ ] 所有互動元素有 hover/focus
- [ ] 間距使用一致系統
- [ ] 響應式正常顯示
- [ ] 載入/錯誤狀態處理

## Next Steps

- Complete design tokens → `references/tokens.md`
- Component specifications → `references/components.md`
