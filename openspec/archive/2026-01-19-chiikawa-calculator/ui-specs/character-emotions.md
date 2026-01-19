# 吉伊卡哇角色表情 SVG

6 種表情對應計算機不同狀態，完整內聯 SVG 程式碼。

---

## 表情系統設計

### 視覺規格

```css
/* 統一規格 */
.character-face {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--chiikawa-bg-light);
  border: 2px solid var(--color-border-soft);
  box-shadow: var(--shadow-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 角色特徵

- **頭部**：圓形 80×80px
- **眼睛**：橢圓形，黑色填充
- **嘴巴**：弧線，stroke-width: 3px
- **臉紅**：淡粉紅色圓形，低透明度

---

## 1. Smile（微笑 - 待機）

**觸發時機**：計算機閒置、未操作

```html
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圓 -->
  <circle cx="40" cy="40" r="38" fill="#faf8f3" stroke="#e8dfd5" stroke-width="2"/>

  <!-- 左眼 -->
  <ellipse cx="28" cy="35" rx="4" ry="6" fill="#4a4238"/>

  <!-- 右眼 -->
  <ellipse cx="52" cy="35" rx="4" ry="6" fill="#4a4238"/>

  <!-- 微笑嘴巴 -->
  <path d="M 28 48 Q 40 54 52 48" stroke="#4a4238" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- 左臉紅 -->
  <circle cx="18" cy="45" r="6" fill="#f8bbd0" opacity="0.4"/>

  <!-- 右臉紅 -->
  <circle cx="62" cy="45" r="6" fill="#f8bbd0" opacity="0.4"/>
</svg>
```

---

## 2. Focus（專注 - 輸入中）

**觸發時機**：使用者正在輸入數字或運算式

```html
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圓 -->
  <circle cx="40" cy="40" r="38" fill="#faf8f3" stroke="#e8dfd5" stroke-width="2"/>

  <!-- 左眼（瞇起） -->
  <ellipse cx="28" cy="35" rx="3" ry="5" fill="#4a4238"/>

  <!-- 右眼（瞇起） -->
  <ellipse cx="52" cy="35" rx="3" ry="5" fill="#4a4238"/>

  <!-- 專注小嘴 -->
  <circle cx="40" cy="48" r="2.5" fill="#4a4238"/>

  <!-- 眉毛（專注） -->
  <path d="M 24 28 L 32 26" stroke="#4a4238" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 48 26 L 56 28" stroke="#4a4238" stroke-width="2.5" stroke-linecap="round"/>
</svg>
```

---

## 3. Happy（開心 - 計算成功）

**觸發時機**：按下 = 顯示結果

```html
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圓 -->
  <circle cx="40" cy="40" r="38" fill="#faf8f3" stroke="#e8dfd5" stroke-width="2"/>

  <!-- 左眼（閉眼笑） -->
  <path d="M 24 35 Q 28 37 32 35" stroke="#4a4238" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- 右眼（閉眼笑） -->
  <path d="M 48 35 Q 52 37 56 35" stroke="#4a4238" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- 大笑嘴巴（張開） -->
  <path d="M 26 46 Q 40 56 54 46" stroke="#4a4238" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M 28 48 Q 40 54 52 48" fill="#fff" opacity="0.8"/>

  <!-- 左臉紅（更明顯） -->
  <circle cx="16" cy="45" r="7" fill="#f8bbd0" opacity="0.5"/>

  <!-- 右臉紅 -->
  <circle cx="64" cy="45" r="7" fill="#f8bbd0" opacity="0.5"/>

  <!-- 開心閃光 -->
  <circle cx="25" cy="22" r="2" fill="#ffb74d" opacity="0.7"/>
  <circle cx="55" cy="20" r="2.5" fill="#ffb74d" opacity="0.7"/>
</svg>
```

---

## 4. Confused（困惑 - 錯誤）

**觸發時機**：輸入錯誤、除以零、語法錯誤

```html
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圓 -->
  <circle cx="40" cy="40" r="38" fill="#faf8f3" stroke="#e8dfd5" stroke-width="2"/>

  <!-- 左眼（圓點） -->
  <circle cx="28" cy="35" r="3" fill="#4a4238"/>

  <!-- 右眼（圓點） -->
  <circle cx="52" cy="35" r="3" fill="#4a4238"/>

  <!-- 困惑嘴巴（歪斜） -->
  <path d="M 28 50 Q 35 48 40 50 Q 45 52 52 50" stroke="#4a4238" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- 困惑符號（問號輔助） -->
  <text x="68" y="25" font-family="Arial" font-size="16" fill="#f48fb1" opacity="0.6">?</text>

  <!-- 汗滴 -->
  <ellipse cx="62" cy="30" rx="3" ry="4" fill="#90caf9" opacity="0.5"/>
</svg>
```

---

## 5. Surprised（驚訝 - 按 AC）

**觸發時機**：按下 AC 清除所有內容

```html
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圓 -->
  <circle cx="40" cy="40" r="38" fill="#faf8f3" stroke="#e8dfd5" stroke-width="2"/>

  <!-- 左眼（睜大） -->
  <circle cx="28" cy="35" r="5" fill="#4a4238"/>
  <circle cx="28" cy="33" r="1.5" fill="#ffffff"/>

  <!-- 右眼（睜大） -->
  <circle cx="52" cy="35" r="5" fill="#4a4238"/>
  <circle cx="52" cy="33" r="1.5" fill="#ffffff"/>

  <!-- O 型嘴 -->
  <circle cx="40" cy="50" r="6" fill="none" stroke="#4a4238" stroke-width="3"/>

  <!-- 驚訝線條 -->
  <path d="M 10 25 L 12 22" stroke="#ffb74d" stroke-width="2" stroke-linecap="round"/>
  <path d="M 15 20 L 18 18" stroke="#ffb74d" stroke-width="2" stroke-linecap="round"/>
  <path d="M 65 20 L 68 18" stroke="#ffb74d" stroke-width="2" stroke-linecap="round"/>
  <path d="M 70 25 L 72 22" stroke="#ffb74d" stroke-width="2" stroke-linecap="round"/>
</svg>
```

---

## 6. Amazed（驚嘆 - 大數字）

**觸發時機**：結果 > 1,000,000 或科學記號

```html
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圓 -->
  <circle cx="40" cy="40" r="38" fill="#faf8f3" stroke="#e8dfd5" stroke-width="2"/>

  <!-- 左眼（星星眼） -->
  <g transform="translate(28, 35)">
    <polygon points="0,-6 1.5,-2 6,-2 2,1 3,5 0,3 -3,5 -2,1 -6,-2 -1.5,-2" fill="#f48fb1"/>
  </g>

  <!-- 右眼（星星眼） -->
  <g transform="translate(52, 35)">
    <polygon points="0,-6 1.5,-2 6,-2 2,1 3,5 0,3 -3,5 -2,1 -6,-2 -1.5,-2" fill="#f48fb1"/>
  </g>

  <!-- 大笑嘴巴 -->
  <path d="M 26 48 Q 40 58 54 48" stroke="#4a4238" stroke-width="3" stroke-linecap="round" fill="none"/>

  <!-- 閃光特效 -->
  <circle cx="20" cy="20" r="3" fill="#ffb74d" opacity="0.8"/>
  <circle cx="60" cy="18" r="3.5" fill="#ffb74d" opacity="0.8"/>
  <circle cx="15" cy="30" r="2" fill="#f48fb1" opacity="0.6"/>
  <circle cx="65" cy="28" r="2" fill="#f48fb1" opacity="0.6"/>

  <!-- 臉紅（興奮） -->
  <circle cx="16" cy="48" r="8" fill="#f8bbd0" opacity="0.6"/>
  <circle cx="64" cy="48" r="8" fill="#f8bbd0" opacity="0.6"/>
</svg>
```

---

## 狀態對應邏輯

```javascript
const emotionStates = {
  idle: 'smile',          // 待機
  typing: 'focus',        // 輸入中
  success: 'happy',       // 計算成功
  error: 'confused',      // 錯誤
  clear: 'surprised',     // AC 清除
  largeNumber: 'amazed'   // 大數字/科學記號
};

// 使用範例
function updateCharacterEmotion(state) {
  const emotionMap = {
    'idle': SmileSVG,
    'typing': FocusSVG,
    'success': HappySVG,
    'error': ConfusedSVG,
    'clear': SurprisedSVG,
    'largeNumber': AmazedSVG
  };

  return emotionMap[state] || SmileSVG;
}
```

---

## 觸發條件詳細說明

| 表情 | 條件 | Duration |
|------|------|----------|
| **Smile** | 無操作 > 2 秒 | 持續 |
| **Focus** | 輸入中 (keypress) | 持續到下一狀態 |
| **Happy** | 按下 = 且無錯誤 | 1.5 秒後回 Smile |
| **Confused** | Error / NaN / Infinity | 持續到修正 |
| **Surprised** | 按下 AC 按鈕 | 0.8 秒後回 Smile |
| **Amazed** | abs(result) > 1,000,000 | 2 秒後回 Smile |

---

## 動畫效果建議

```css
.character-face {
  transition: transform var(--duration-normal) var(--ease-bounce);
}

.character-face:hover {
  transform: scale(1.05);
}

/* 表情切換動畫 */
.character-face.changing {
  animation: emotionChange 0.3s ease-in-out;
}

@keyframes emotionChange {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 開心時跳動 */
.character-face.happy {
  animation: bounce 0.5s ease-in-out 2;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

---

## 實作範例

```tsx
import React from 'react';

const CharacterEmotion = ({ emotion }) => {
  const emotions = {
    smile: <SmileSVG />,
    focus: <FocusSVG />,
    happy: <HappySVG />,
    confused: <ConfusedSVG />,
    surprised: <SurprisedSVG />,
    amazed: <AmazedSVG />
  };

  return (
    <div className={`character-face ${emotion}`}>
      {emotions[emotion] || emotions.smile}
    </div>
  );
};
```

---

## Checklist

✅ 6 種表情完整定義
✅ SVG 內聯可直接使用
✅ 統一尺寸 80×80px
✅ 視覺風格一致（圓潤、柔和）
✅ 觸發條件明確
✅ 動畫效果建議
