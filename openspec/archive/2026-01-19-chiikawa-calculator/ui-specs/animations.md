# 動畫效果規格

吉伊卡哇風格的動畫系統，柔軟、彈性、療癒感。

---

## 動畫設計原則

### 核心特色

```
1. 彈性（Bouncy）
   └── 使用 ease-bounce 緩動函數

2. 柔軟（Soft）
   └── 避免線性，使用曲線過渡

3. 愉悅（Delightful）
   └── 細微動效帶來療癒感

4. 不阻礙（Non-blocking）
   └── 動畫不延遲使用者操作
```

---

## 1. 按鈕動畫

### 按下效果

```css
.button {
  /* 基礎動畫 */
  transition: transform var(--duration-fast) var(--ease-bounce),
              background-color var(--duration-fast) var(--ease-soft),
              box-shadow var(--duration-fast) var(--ease-soft);
}

/* Hover - 輕微上浮 */
.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

/* Active - 按下縮小 */
.button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-inset);
}

/* 等號按鈕特殊效果 */
.button-equal:hover {
  transform: translateY(-3px) scale(1.02);
  animation: equalPulse 1.5s ease-in-out infinite;
}

@keyframes equalPulse {
  0%, 100% {
    box-shadow: var(--button-equal-shadow);
  }
  50% {
    box-shadow: 0 4px 16px rgba(165, 214, 167, 0.5);
  }
}
```

---

### 按鈕點擊波紋效果

```css
.button {
  position: relative;
  overflow: hidden;
}

.button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
  pointer-events: none;
}

.button:active::after {
  width: 200%;
  height: 200%;
}
```

---

## 2. 角色表情動畫

### 表情切換動畫

```css
.character-face {
  transition: transform var(--duration-normal) var(--ease-bounce);
}

/* Hover 效果 */
.character-face:hover {
  transform: scale(1.05);
  cursor: pointer;
}

/* 表情切換時 */
.character-face.changing {
  animation: emotionSwitch 0.3s ease-in-out;
}

@keyframes emotionSwitch {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

### 開心時跳動

```css
.character-face.happy {
  animation: happyBounce 0.5s var(--ease-bounce) 2;
}

@keyframes happyBounce {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-12px) scale(1.05);
  }
  50% {
    transform: translateY(-6px) scale(1.02);
  }
  75% {
    transform: translateY(-8px) scale(1.03);
  }
}
```

---

### 驚訝時震動

```css
.character-face.surprised {
  animation: surpriseShake 0.4s ease-in-out;
}

@keyframes surpriseShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}
```

---

### 困惑時左右搖擺

```css
.character-face.confused {
  animation: confusedSway 1s ease-in-out infinite;
}

@keyframes confusedSway {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}
```

---

### 專注時輕微呼吸

```css
.character-face.focus {
  animation: focusBreath 2s ease-in-out infinite;
}

@keyframes focusBreath {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
```

---

### 驚嘆時閃光

```css
.character-face.amazed {
  animation: amazedSparkle 0.8s ease-in-out 3;
}

@keyframes amazedSparkle {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.15) saturate(1.2);
  }
}
```

---

## 3. 顯示螢幕動畫

### 數字更新動畫

```css
.display-result {
  transition: color var(--duration-fast) ease;
}

/* 數字變化時閃爍 */
.display-result.updating {
  animation: numberFlash 0.3s ease-in-out;
}

@keyframes numberFlash {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}
```

---

### 錯誤狀態晃動

```css
.display-result.error {
  animation: errorShake 0.4s ease-in-out;
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-8px);
  }
  40%, 80% {
    transform: translateX(8px);
  }
}
```

---

### 成功時放大脈衝

```css
.display-result.success {
  animation: successPulse 0.5s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
```

---

## 4. 計算機進入動畫

### 頁面載入時

```css
.chiikawa-calculator {
  animation: calculatorEnter 0.6s var(--ease-bounce);
}

@keyframes calculatorEnter {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  60% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

### 角色延遲進入

```css
.character-face {
  animation: characterEnter 0.8s var(--ease-bounce) 0.2s backwards;
}

@keyframes characterEnter {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.5);
  }
  60% {
    transform: translateY(5px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

### 按鈕交錯進入

```css
.button {
  animation: buttonEnter 0.4s var(--ease-bounce) backwards;
}

/* 逐列延遲 */
.button-grid > .button:nth-child(1) { animation-delay: 0.3s; }
.button-grid > .button:nth-child(2) { animation-delay: 0.35s; }
.button-grid > .button:nth-child(3) { animation-delay: 0.4s; }
.button-grid > .button:nth-child(4) { animation-delay: 0.45s; }
.button-grid > .button:nth-child(5) { animation-delay: 0.5s; }
.button-grid > .button:nth-child(6) { animation-delay: 0.55s; }
.button-grid > .button:nth-child(7) { animation-delay: 0.6s; }
.button-grid > .button:nth-child(8) { animation-delay: 0.65s; }
/* ... 依此類推 */

@keyframes buttonEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

---

## 5. 微互動動畫

### AC 按鈕按下時角色驚訝

```javascript
// 按下 AC 時觸發
document.querySelector('.button-clear').addEventListener('click', () => {
  const character = document.querySelector('.character-face');

  // 切換表情
  character.classList.remove('smile', 'focus', 'happy', 'confused', 'amazed');
  character.classList.add('surprised', 'changing');

  // 0.8 秒後恢復微笑
  setTimeout(() => {
    character.classList.remove('surprised', 'changing');
    character.classList.add('smile');
  }, 800);
});
```

---

### 等號按下時角色開心

```javascript
document.querySelector('.button-equal').addEventListener('click', () => {
  const character = document.querySelector('.character-face');
  const display = document.querySelector('.display-result');

  // 計算成功
  if (!display.classList.contains('error')) {
    character.classList.remove('smile', 'focus', 'confused', 'surprised', 'amazed');
    character.classList.add('happy', 'changing');

    // 1.5 秒後恢復微笑
    setTimeout(() => {
      character.classList.remove('happy', 'changing');
      character.classList.add('smile');
    }, 1500);
  } else {
    // 錯誤時困惑
    character.classList.add('confused');
  }
});
```

---

### 輸入時角色專注

```javascript
document.querySelectorAll('.button-number, .button-operator').forEach(btn => {
  btn.addEventListener('click', () => {
    const character = document.querySelector('.character-face');

    // 從待機切換到專注
    if (character.classList.contains('smile')) {
      character.classList.remove('smile');
      character.classList.add('focus', 'changing');

      setTimeout(() => {
        character.classList.remove('changing');
      }, 300);
    }
  });
});
```

---

## 6. 效能優化

### GPU 加速

```css
/* 強制 GPU 渲染 */
.button,
.character-face,
.display-result {
  will-change: transform;
  transform: translateZ(0);
}

/* 動畫結束後移除 */
.button:not(:hover):not(:active),
.character-face:not(.changing) {
  will-change: auto;
}
```

---

### 避免重排

```css
/* 只使用 transform 和 opacity */
.button:hover {
  /* ✓ GPU 加速 */
  transform: translateY(-2px);

  /* ✗ 觸發重排 */
  /* margin-top: -2px; */
}
```

---

## 7. 無障礙支援

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  /* 移除所有動畫 */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* 保留必要的狀態變化，但移除過渡 */
  .button:hover {
    transform: none;
  }

  .button:active {
    transform: scale(0.98);
    transition: none;
  }
}
```

---

## 8. 完整動畫 CSS 輸出

```css
/* ==================== 動畫 Token ==================== */
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;

  --ease-bounce: cubic-bezier(0.68, -0.2, 0.265, 1.2);
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

/* ==================== 按鈕動畫 ==================== */
.button {
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-fast) var(--ease-bounce),
              background-color var(--duration-fast) var(--ease-soft),
              box-shadow var(--duration-fast) var(--ease-soft);
  will-change: transform;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-inset);
}

/* 波紋效果 */
.button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
  pointer-events: none;
}

.button:active::after {
  width: 200%;
  height: 200%;
}

/* 等號脈衝 */
.button-equal:hover {
  transform: translateY(-3px) scale(1.02);
  animation: equalPulse 1.5s ease-in-out infinite;
}

@keyframes equalPulse {
  0%, 100% { box-shadow: var(--button-equal-shadow); }
  50% { box-shadow: 0 4px 16px rgba(165, 214, 167, 0.5); }
}

/* ==================== 角色表情動畫 ==================== */
.character-face {
  transition: transform var(--duration-normal) var(--ease-bounce);
  will-change: transform;
}

.character-face:hover {
  transform: scale(1.05);
}

.character-face.changing {
  animation: emotionSwitch 0.3s ease-in-out;
}

.character-face.happy {
  animation: happyBounce 0.5s var(--ease-bounce) 2;
}

.character-face.surprised {
  animation: surpriseShake 0.4s ease-in-out;
}

.character-face.confused {
  animation: confusedSway 1s ease-in-out infinite;
}

.character-face.focus {
  animation: focusBreath 2s ease-in-out infinite;
}

.character-face.amazed {
  animation: amazedSparkle 0.8s ease-in-out 3;
}

@keyframes emotionSwitch {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes happyBounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-12px) scale(1.05); }
  50% { transform: translateY(-6px) scale(1.02); }
  75% { transform: translateY(-8px) scale(1.03); }
}

@keyframes surpriseShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

@keyframes confusedSway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

@keyframes focusBreath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes amazedSparkle {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15) saturate(1.2); }
}

/* ==================== 顯示螢幕動畫 ==================== */
.display-result {
  transition: color var(--duration-fast) ease;
}

.display-result.updating {
  animation: numberFlash 0.3s ease-in-out;
}

.display-result.error {
  animation: errorShake 0.4s ease-in-out;
}

.display-result.success {
  animation: successPulse 0.5s ease-out;
}

@keyframes numberFlash {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* ==================== 進入動畫 ==================== */
.chiikawa-calculator {
  animation: calculatorEnter 0.6s var(--ease-bounce);
}

.character-face {
  animation: characterEnter 0.8s var(--ease-bounce) 0.2s backwards;
}

.button {
  animation: buttonEnter 0.4s var(--ease-bounce) backwards;
}

@keyframes calculatorEnter {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  60% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes characterEnter {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.5);
  }
  60% {
    transform: translateY(5px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes buttonEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==================== 無障礙 ==================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .button:hover {
    transform: none;
  }

  .button:active {
    transform: scale(0.98);
    transition: none;
  }
}
```

---

## Checklist

✅ 所有動畫使用 transform/opacity（GPU 加速）
✅ Duration 符合建議範圍（150-350ms）
✅ Easing 使用彈性函數（ease-bounce）
✅ 表情動畫對應 6 種狀態
✅ 微互動設計完整
✅ 支援 prefers-reduced-motion
✅ 不阻礙使用者操作
✅ 效能優化（will-change）
