# Minimalist 極簡風格群組

簡潔、留白、功能導向的設計風格。適用於工具類產品和通用場景。

---

## 風格列表

| 風格 | 特徵 | 最佳用途 |
|------|------|----------|
| Clean Minimal | 純淨、無裝飾 | SaaS、工具 |
| Soft Minimal | 柔和圓角、淺色 | 生活、健康 App |
| Bold Minimal | 大膽排版、高對比 | 品牌、Landing |
| Monochromatic | 單色調、層次感 | 作品集、編輯 |
| Whitespace Heavy | 大量留白、聚焦 | 奢侈品、藝廊 |
| Flat Design | 扁平、無陰影 | 圖示、插畫風 |
| Line Art | 線條、描邊 | 技術、藍圖風 |
| Grid System | 網格、對齊 | 數據、儀表板 |
| Typography-led | 字體主導 | 編輯、雜誌 |
| Functional | 功能至上 | 後台、管理 |

---

## Clean Minimal 純淨極簡

### 特徵
- 無多餘裝飾
- 中性色為主
- 清晰視覺層級
- 大量留白

### Token 調整

```css
:root {
  /* 色彩：中性、低飽和 */
  --color-primary: #2563eb;
  --color-surface: #ffffff;
  --color-background: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;

  /* 形狀：微圓角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* 陰影：微妙 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);

  /* 間距：寬鬆 */
  --spacing-section: 80px;
  --spacing-card: 24px;
}
```

### 適用場景
- SaaS 儀表板
- 工具類 App
- 專業服務網站
- 企業官網

### 不適用場景
- 兒童產品
- 遊戲
- 需要強烈情感的品牌

### 字體推薦
- **標題**: Inter, SF Pro, Helvetica Neue
- **內文**: Inter, -apple-system

### 配色建議

| 組合 | Primary | Background | 適用 |
|------|---------|------------|------|
| 藍色系 | #2563eb | #f8fafc | 通用、科技 |
| 綠色系 | #059669 | #f0fdf4 | 金融、健康 |
| 紫色系 | #7c3aed | #faf5ff | 創意、SaaS |
| 中性 | #18181b | #fafafa | 極簡、作品集 |

---

## Soft Minimal 柔和極簡

### 特徵
- 柔和圓角（12-16px）
- 淺色調、低對比
- 溫暖感
- 親和力

### Token 調整

```css
:root {
  /* 色彩：柔和、溫暖 */
  --color-primary: #8b5cf6;
  --color-surface: #ffffff;
  --color-background: #faf5ff;
  --color-text: #3f3f46;
  --color-text-muted: #71717a;

  /* 形狀：大圓角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* 陰影：柔和擴散 */
  --shadow-sm: 0 2px 8px rgba(139, 92, 246, 0.08);
  --shadow-md: 0 8px 24px rgba(139, 92, 246, 0.12);
}
```

### 適用場景
- 生活類 App
- 健康/冥想
- 女性向產品
- 兒童友善

### 不適用場景
- 企業 B2B
- 金融專業
- 遊戲

### 字體推薦
- **標題**: Outfit, DM Sans, Nunito
- **內文**: DM Sans, Nunito Sans

---

## Bold Minimal 大膽極簡

### 特徵
- 大字體標題
- 高對比黑白
- 強烈視覺衝擊
- 少量強調色

### Token 調整

```css
:root {
  /* 色彩：高對比 */
  --color-primary: #000000;
  --color-accent: #ff3366;
  --color-surface: #ffffff;
  --color-background: #ffffff;
  --color-text: #000000;

  /* 形狀：直角或全圓 */
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-full: 9999px;

  /* 字體：超大 */
  --text-hero: clamp(3rem, 10vw, 8rem);
  --text-heading: clamp(2rem, 5vw, 4rem);
  --font-weight-heading: 800;

  /* 無陰影 */
  --shadow-sm: none;
  --shadow-md: none;
}
```

### 適用場景
- 品牌 Landing Page
- 創意機構
- 作品集
- 時尚品牌

### 不適用場景
- 資訊密集產品
- 表單重的應用
- 老年用戶

### 字體推薦
- **標題**: Bebas Neue, Oswald, Anton
- **內文**: Inter, Work Sans

---

## Monochromatic 單色調

### 特徵
- 單一色相
- 透過明度變化創造層次
- 優雅統一
- 專注內容

### Token 調整

```css
:root {
  /* 以藍色為例 */
  --color-50: #eff6ff;
  --color-100: #dbeafe;
  --color-200: #bfdbfe;
  --color-300: #93c5fd;
  --color-400: #60a5fa;
  --color-500: #3b82f6;
  --color-600: #2563eb;
  --color-700: #1d4ed8;
  --color-800: #1e40af;
  --color-900: #1e3a8f;

  --color-primary: var(--color-600);
  --color-surface: var(--color-50);
  --color-background: #ffffff;
  --color-text: var(--color-900);
  --color-text-muted: var(--color-600);
  --color-border: var(--color-200);
}
```

### 適用場景
- 企業官網
- 品牌一致性強
- 作品集
- 報告/文件

### 不適用場景
- 需要區分多種狀態
- 數據視覺化複雜
- 電商多品類

---

## Whitespace Heavy 留白主導

### 特徵
- 極大留白
- 少量元素
- 聚焦核心內容
- 呼吸感

### Token 調整

```css
:root {
  /* 間距：超大 */
  --spacing-section: 160px;
  --spacing-card: 48px;
  --spacing-element: 32px;

  /* 內容寬度：限制 */
  --content-max-width: 800px;
  --hero-max-width: 600px;

  /* 色彩：極簡 */
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  --color-accent: #000000;
}
```

### 適用場景
- 奢侈品牌
- 藝廊/展覽
- 高端地產
- 攝影作品

### 不適用場景
- 資訊密集
- 電商列表
- 管理後台

---

## 最佳實踐

### Do

- ✅ 保持一致的間距系統
- ✅ 限制色彩數量（2-3 種）
- ✅ 使用視覺層級引導注意力
- ✅ 讓留白有意義

### Don't

- ❌ 過度裝飾
- ❌ 使用太多字體
- ❌ 忽略對比度
- ❌ 為極簡而極簡（犧牲功能）

---

## 參考資源

- [tokens.md](../tokens.md) - 完整 Token 定義
- [typography-advanced.md](../typography-advanced.md) - 字體系統
- [industry.md](industry.md) - 產業映射
