# 常見 UI Bug 類型與檢測

這份文檔列出開發中最常出現的 UI Bug，以及如何用 agent-browser 檢測。

## Bug 分類

### 1. 佈局問題

#### 1.1 內容溢出 (Overflow)

**症狀**：
- 文字超出容器邊界
- 水平捲軸意外出現
- 元素被截斷

**檢測方法**：

```bash
# 檢查是否有溢出
browser evaluate "@card-container" \
  '(element) => {
    return {
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      hasOverflow: element.scrollWidth > element.clientWidth,
      overflowX: window.getComputedStyle(element).overflowX
    };
  }'
# ❌ Bug: { scrollWidth: 1320, clientWidth: 1280, hasOverflow: true }
# ✅ 正確: { scrollWidth: 1280, clientWidth: 1280, hasOverflow: false }
```

**常見原因**：
- 忘記設定 `overflow: hidden` 或 `overflow-wrap: break-word`
- 固定寬度元素在小螢幕上
- Flexbox/Grid 子元素沒有 `min-width: 0`

---

#### 1.2 元素重疊 (Overlap)

**症狀**：
- 兩個元素疊在一起
- 文字互相覆蓋
- z-index 問題

**檢測方法**：

```bash
# 檢查兩個元素是否重疊
browser evaluate "@container" \
  '(element) => {
    const elem1 = element.querySelector(".card-1");
    const elem2 = element.querySelector(".card-2");

    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();

    const overlap = !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );

    return {
      card1: { top: rect1.top, left: rect1.left, width: rect1.width, height: rect1.height },
      card2: { top: rect2.top, left: rect2.left, width: rect2.width, height: rect2.height },
      hasOverlap: overlap
    };
  }'
# ❌ Bug: { hasOverlap: true }
```

**常見原因**：
- Position absolute/fixed 沒有正確定位
- Negative margin 過大
- Flexbox/Grid gap 設為 0 或負數

---

#### 1.3 對齊錯誤 (Misalignment)

**症狀**：
- 元素沒有對齊基線
- 垂直/水平居中失敗
- Grid/Flexbox 子元素位置錯誤

**檢測方法**：

```bash
# 檢查多個元素的左對齊
browser evaluate "@list-container" \
  '(element) => {
    const items = Array.from(element.children);
    const leftPositions = items.map(item => item.getBoundingClientRect().left);
    const firstLeft = leftPositions[0];
    const allAligned = leftPositions.every(left => left === firstLeft);

    return {
      positions: leftPositions,
      allAligned: allAligned,
      maxDiff: Math.max(...leftPositions) - Math.min(...leftPositions)
    };
  }'
# ❌ Bug: { allAligned: false, maxDiff: 8 }
# ✅ 正確: { allAligned: true, maxDiff: 0 }
```

**常見原因**：
- 沒有使用 Flexbox/Grid 對齊屬性
- Margin/padding 不一致
- Text-align 設定錯誤

---

### 2. 顏色問題

#### 2.1 色彩不一致 (Inconsistent Colors)

**症狀**：
- 同類型元素顏色不同
- Hardcode 顏色而非使用 Design Token
- 深色模式顏色錯誤

**檢測方法**：

```bash
# 檢查所有主按鈕顏色一致
browser evaluate "@page-container" \
  '(element) => {
    const buttons = Array.from(element.querySelectorAll("button.primary"));
    const colors = buttons.map(btn => {
      const style = window.getComputedStyle(btn);
      return {
        bg: style.backgroundColor,
        color: style.color
      };
    });

    const firstBg = colors[0].bg;
    const allSame = colors.every(c => c.bg === firstBg);

    return {
      colors: colors,
      allConsistent: allSame
    };
  }'
# ❌ Bug: 有的按鈕 rgb(59, 130, 246)，有的 #3b82f6
```

**常見原因**：
- 沒有使用 CSS Variables
- Hardcode 顏色值
- 沒有從 Design Tokens 引用

**如何檢測 CSS Variable 使用**：

```bash
browser evaluate "@primary-button" \
  '(element) => {
    // 取得實際背景色
    const computed = window.getComputedStyle(element);
    const actualBg = computed.backgroundColor;

    // 取得 CSS variable 值
    const rootStyle = window.getComputedStyle(document.documentElement);
    const tokenBg = rootStyle.getPropertyValue("--color-primary").trim();

    // 如果 token 是 hex，需轉 rgb 比較
    // 這裡假設 token 已經是 rgb 或頁面有做轉換

    return {
      actual: actualBg,
      token: tokenBg,
      usesToken: computed.getPropertyValue("background-color").includes("var(")
    };
  }'
# ✅ 正確: { usesToken: true }
# ❌ Bug: { usesToken: false } (hardcode)
```

---

#### 2.2 對比度不足 (Poor Contrast)

**症狀**：
- 文字顏色太淡，難以閱讀
- 未達 WCAG AA 標準 (4.5:1)
- 深色模式下對比度問題

**檢測方法**：

```bash
# 計算對比度
browser evaluate "@text-on-background" \
  '(element) => {
    // 簡化版對比度計算（實際應使用完整公式）
    function getLuminance(rgb) {
      const [r, g, b] = rgb.match(/\d+/g).map(Number);
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    const style = window.getComputedStyle(element);
    const textColor = style.color;
    const bgColor = style.backgroundColor;

    const textLum = getLuminance(textColor);
    const bgLum = getLuminance(bgColor);

    const ratio = (Math.max(textLum, bgLum) + 0.05) / (Math.min(textLum, bgLum) + 0.05);

    return {
      textColor: textColor,
      bgColor: bgColor,
      contrastRatio: ratio.toFixed(2),
      meetsAA: ratio >= 4.5,
      meetsAAA: ratio >= 7
    };
  }'
# ❌ Bug: { contrastRatio: "3.2", meetsAA: false }
# ✅ 正確: { contrastRatio: "6.8", meetsAA: true }
```

**常見原因**：
- 灰色文字在白色背景
- 深色模式顏色沒調整
- 自訂顏色未測試對比度

---

### 3. 字體問題

#### 3.1 字體大小錯誤

**症狀**：
- 字體太小（< 16px 內文）
- 字體大小不一致
- 沒有使用 Design Token

**檢測方法**：

```bash
# 檢查內文字體大小
browser evaluate "@body-text" \
  '(element) => {
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);

    return {
      fontSize: fontSize,
      fontSizeRem: (fontSize / 16).toFixed(2) + "rem",
      tooSmall: fontSize < 16
    };
  }'
# ❌ Bug: { fontSize: 14, tooSmall: true }
# ✅ 正確: { fontSize: 16, tooSmall: false }
```

---

#### 3.2 字體粗細錯誤

**症狀**：
- 標題不夠粗（應 600-700）
- 內文太粗（應 400）
- 沒有使用 Design Token

**檢測方法**：

```bash
browser evaluate "@heading" \
  '(element) => {
    const style = window.getComputedStyle(element);
    return {
      fontWeight: style.fontWeight,
      shouldBeSemibold: parseInt(style.fontWeight) >= 600
    };
  }'
# ❌ Bug: { fontWeight: "400", shouldBeSemibold: false }
# ✅ 正確: { fontWeight: "600", shouldBeSemibold: true }
```

---

### 4. 間距問題

#### 4.1 Padding/Margin 錯誤

**症狀**：
- 間距不是 4px 倍數
- 間距不一致
- 沒有使用 Spacing Token

**檢測方法**：

```bash
browser evaluate "@card" \
  '(element) => {
    const style = window.getComputedStyle(element);
    const padding = parseFloat(style.paddingTop);

    return {
      padding: padding,
      isMultipleOf4: padding % 4 === 0,
      usesToken: style.getPropertyValue("padding").includes("var(")
    };
  }'
# ❌ Bug: { padding: 18, isMultipleOf4: false }
# ✅ 正確: { padding: 16, isMultipleOf4: true }
```

---

#### 4.2 元素間距不一致

**症狀**：
- 同層級元素間距不同
- Gap 設定錯誤

**檢測方法**：

```bash
browser evaluate "@list-container" \
  '(element) => {
    const items = Array.from(element.children);
    const gaps = [];

    for (let i = 0; i < items.length - 1; i++) {
      const rect1 = items[i].getBoundingClientRect();
      const rect2 = items[i + 1].getBoundingClientRect();
      const gap = rect2.top - rect1.bottom;
      gaps.push(gap);
    }

    const firstGap = gaps[0];
    const allSame = gaps.every(g => Math.abs(g - firstGap) < 1);

    return {
      gaps: gaps,
      allConsistent: allSame
    };
  }'
# ❌ Bug: { gaps: [16, 12, 16, 14], allConsistent: false }
# ✅ 正確: { gaps: [16, 16, 16, 16], allConsistent: true }
```

---

### 5. 響應式問題

#### 5.1 斷點行為錯誤

**症狀**：
- Mobile 顯示 Desktop 佈局
- 元素在小螢幕上被截斷
- Media Query 沒生效

**檢測方法**：

```bash
# Mobile 測試
browser resize 375 667
browser snapshot

browser evaluate "@navigation" \
  '(element) => {
    const style = window.getComputedStyle(element);
    return {
      display: style.display,
      flexDirection: style.flexDirection,
      isMobileLayout: style.flexDirection === "column"
    };
  }'
# ❌ Bug: { flexDirection: "row", isMobileLayout: false } (應該是 column)
```

---

#### 5.2 固定寬度問題

**症狀**：
- 小螢幕出現水平捲軸
- 元素寬度超過 viewport

**檢測方法**：

```bash
browser resize 375 667

browser evaluate "@body" \
  '() => {
    return {
      bodyScrollWidth: document.body.scrollWidth,
      windowWidth: window.innerWidth,
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
    };
  }'
# ❌ Bug: { bodyScrollWidth: 500, windowWidth: 375, hasHorizontalScroll: true }
```

---

### 6. 狀態問題

#### 6.1 Hover 狀態缺失

**症狀**：
- 按鈕 hover 沒有變化
- 連結 hover 沒有顏色變化

**檢測方法**：

```bash
# 1. 記錄初始狀態
browser snapshot
browser evaluate "@button" \
  '(element) => window.getComputedStyle(element).backgroundColor'
# 初始: rgb(59, 130, 246)

# 2. Hover
browser hover "@button"

# 3. 檢查變化
browser evaluate "@button" \
  '(element) => window.getComputedStyle(element).backgroundColor'
# ❌ Bug: rgb(59, 130, 246) (沒變化)
# ✅ 正確: rgb(37, 99, 235) (變深)
```

---

#### 6.2 Focus Ring 缺失

**症狀**：
- Tab 聚焦時沒有 outline
- 無障礙問題

**檢測方法**：

```bash
browser click "@input"

browser evaluate "@input" \
  '(element) => {
    const style = window.getComputedStyle(element);
    return {
      outline: style.outline,
      outlineWidth: style.outlineWidth,
      hasFocusRing: style.outlineWidth !== "0px" && style.outline !== "none"
    };
  }'
# ❌ Bug: { outline: "none", hasFocusRing: false }
# ✅ 正確: { outline: "2px solid rgb(59, 130, 246)", hasFocusRing: true }
```

---

#### 6.3 Disabled 狀態不明顯

**症狀**：
- Disabled 按鈕看起來可點擊
- Opacity 不足

**檢測方法**：

```bash
browser evaluate "@disabled-button" \
  '(element) => {
    const style = window.getComputedStyle(element);
    return {
      opacity: style.opacity,
      cursor: style.cursor,
      disabled: element.disabled,
      visuallyDisabled: parseFloat(style.opacity) <= 0.6 && style.cursor === "not-allowed"
    };
  }'
# ❌ Bug: { opacity: "1", cursor: "pointer", visuallyDisabled: false }
# ✅ 正確: { opacity: "0.6", cursor: "not-allowed", visuallyDisabled: true }
```

---

### 7. 圖表問題

#### 7.1 圖表顏色錯誤

**症狀**：
- 使用錯誤的顏色方案
- 顏色對比度不足
- 沒有使用 Design Token 顏色

**檢測方法**：

```bash
browser evaluate "@chart-container" \
  '(element) => {
    const chart = echarts.getInstanceByDom(element);
    const option = chart.getOption();

    const expectedColors = [
      "rgb(59, 130, 246)",   // --color-primary
      "rgb(16, 185, 129)",   // --color-success
      "rgb(249, 115, 22)"    // --color-warning
    ];

    const actualColors = option.color;

    return {
      expected: expectedColors,
      actual: actualColors,
      matches: JSON.stringify(expectedColors) === JSON.stringify(actualColors)
    };
  }'
# ❌ Bug: { matches: false }
```

---

#### 7.2 圖例錯誤

**症狀**：
- 圖例文字與資料不符
- 圖例顏色與圖表不符

**檢測方法**：

```bash
browser snapshot
# 檢查 legend 是否存在且正確
# legend [@chart-legend]
#   - "BTC" (blue)
#   - "ETH" (green)

browser evaluate "@chart-container" \
  '(element) => {
    const chart = echarts.getInstanceByDom(element);
    const option = chart.getOption();

    return {
      legendData: option.legend[0].data,
      seriesNames: option.series.map(s => s.name)
    };
  }'
# ✅ 正確: legendData 應該等於 seriesNames
```

---

#### 7.3 Tooltip 內容錯誤

**症狀**：
- Tooltip 顯示錯誤資料
- 格式不正確（日期、數字）

**檢測方法**：

```bash
# 1. Hover 到資料點
browser hover "@first-data-point"

# 2. 等待 tooltip
browser wait --text "2024-01-01"

# 3. Snapshot 檢查
browser snapshot
# ❌ Bug: tooltip 顯示 "01/01/2024"（格式錯誤）
# ✅ 正確: tooltip 顯示 "2024-01-01"

# 4. 驗證數字格式
browser wait --text "1,234.56"
# ❌ Bug: 顯示 "1234.56"（缺少千分位）
```

---

## Bug 檢測優先級

### P0 - 嚴重（阻止使用）
- 內容溢出導致資訊遺失
- 元素重疊導致無法點擊
- 對比度不足導致無法閱讀
- 響應式完全失效

### P1 - 重要（影響體驗）
- 對齊錯誤
- 顏色不一致
- 間距明顯錯誤
- Focus ring 缺失（無障礙）

### P2 - 次要（小瑕疵）
- 字體粗細略有差異
- 間距差異 < 4px
- Hover 狀態不夠明顯
- 圖表顏色非最佳

---

## 自動化檢測腳本範例

完整的 UI Bug 掃描：

```bash
# ========== 佈局檢測 ==========
echo "1. 檢測溢出問題..."
browser evaluate "@body" \
  '() => {
    const allElements = document.querySelectorAll("*");
    const overflowElements = Array.from(allElements).filter(el => {
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    });

    return {
      total: allElements.length,
      overflowCount: overflowElements.length,
      overflowElements: overflowElements.slice(0, 5).map(el => ({
        tag: el.tagName,
        class: el.className,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
      }))
    };
  }'

# ========== 顏色檢測 ==========
echo "2. 檢測對比度..."
browser evaluate "@body" \
  '() => {
    // ... 對比度檢測邏輯（見上方）
  }'

# ========== 字體檢測 ==========
echo "3. 檢測字體大小..."
browser evaluate "@body" \
  '() => {
    const textElements = document.querySelectorAll("p, span, div, a, label");
    const smallText = Array.from(textElements).filter(el => {
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
      return fontSize < 16 && el.textContent.trim().length > 0;
    });

    return {
      smallTextCount: smallText.length,
      examples: smallText.slice(0, 5).map(el => ({
        text: el.textContent.slice(0, 30),
        fontSize: window.getComputedStyle(el).fontSize
      }))
    };
  }'

# ========== 響應式檢測 ==========
echo "4. 檢測響應式..."
browser resize 375 800
browser evaluate "@body" \
  '() => {
    return {
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
    };
  }'

browser resize 768 800
browser evaluate "@body" \
  '() => {
    return {
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
    };
  }'

browser resize 1280 800
browser evaluate "@body" \
  '() => {
    return {
      hasHorizontalScroll: document.body.scrollWidth > window.innerWidth
    };
  }'
```

---

## 總結

使用這份清單在 REVIEWER 和 TESTER 階段系統性檢查 UI：

1. **開發完成後（REVIEWER）**：快速掃描 P0/P1 問題
2. **測試階段（TESTER）**：完整檢測所有分類
3. **回歸測試**：執行自動化腳本
4. **發現問題**：截圖 + 記錄到驗證報告

記住：**所有 UI 變更都應該執行至少 P0/P1 檢測！**
