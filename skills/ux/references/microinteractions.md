# 微互動設計 Microinteractions

創造令人愉悅的細節體驗，透過小而精緻的互動提升整體使用者體驗。

---

## 什麼是微互動

> **微互動是產品中的小時刻，完成單一任務並提供回饋。**

### 常見例子

```
✓ 按讚動畫
✓ 下拉刷新
✓ 滑動刪除
✓ 密碼強度指示
✓ 表單驗證回饋
✓ 開關切換
✓ 載入動畫
✓ 通知提示
```

---

## 微互動四要素

### Dan Saffer 的微互動結構

```
┌─────────────────────────────────────────────┐
│                                             │
│   1. Trigger 觸發器                          │
│      ↓                                      │
│   2. Rules 規則                              │
│      ↓                                      │
│   3. Feedback 回饋                           │
│      ↓                                      │
│   4. Loops & Modes 循環與模式                │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 1. Trigger 觸發器

> **什麼啟動了微互動？**

### 觸發類型

| 類型 | 說明 | 範例 |
|------|------|------|
| 使用者觸發 | 使用者主動操作 | 點擊、滑動、打字 |
| 系統觸發 | 條件滿足自動觸發 | 收到訊息、電量低 |

### 使用者觸發

```
點擊 (Click/Tap)
├── 按鈕、連結、圖示
└── 最常見的觸發方式

懸停 (Hover)
├── 顯示更多資訊
└── 僅適用於桌面

長按 (Long Press)
├── 顯示選項選單
└── 進入編輯模式

滑動 (Swipe)
├── 刪除、收藏、換頁
└── 觸控裝置常見

拖曳 (Drag)
├── 排序、移動
└── 調整大小

捏合 (Pinch)
├── 縮放
└── 圖片、地圖

輸入 (Input)
├── 即時驗證
└── 搜尋建議
```

### 系統觸發

```
時間：
├── 定時提醒
└── 倒數計時結束

狀態：
├── 網路斷線
├── 電量低
└── 新訊息

位置：
├── 到達某地點
└── 進入/離開區域

資料：
├── 下載完成
└── 同步完成
```

---

## 2. Rules 規則

> **微互動發生時會怎樣？**

### 定義規則

```
什麼可以發生？
什麼不能發生？
順序是什麼？
持續多久？
```

### 範例：按讚規則

```
觸發：點擊愛心圖示

規則：
├── 如果未按讚 → 變成已按讚
│   ├── 圖示填滿
│   ├── 數字 +1
│   └── 播放動畫
│
└── 如果已按讚 → 變成未按讚
    ├── 圖示變空心
    ├── 數字 -1
    └── 無動畫
```

---

## 3. Feedback 回饋

> **使用者如何知道發生了什麼？**

### 回饋類型

| 類型 | 用途 | 範例 |
|------|------|------|
| 視覺 | 狀態變化 | 顏色、大小、位置 |
| 動態 | 過程指示 | 動畫、過渡 |
| 聽覺 | 引起注意 | 音效 |
| 觸覺 | 確認動作 | 震動 |

### 視覺回饋

```css
/* 狀態變化 */
.button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

/* 顏色變化 */
.like-button.active {
  color: #ff4757;
}

/* 圖示變化 */
.checkbox:checked::before {
  content: "✓";
}
```

### 動態回饋

```css
/* 平滑過渡 */
.element {
  transition: all 200ms ease-out;
}

/* 彈性動畫 */
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 載入旋轉 */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 聽覺回饋

```
適合場景：
✓ 重要通知
✓ 完成成就
✓ 錯誤警告
✓ 訊息接收

注意事項：
✗ 可靜音選項
✗ 音量適中
✗ 不要太頻繁
✗ 符合情境
```

### 觸覺回饋

```javascript
// iOS Haptic
if (window.navigator.vibrate) {
  navigator.vibrate(10); // 輕微震動
}

// 類型建議
輕觸確認：10ms
按鈕點擊：20ms
錯誤提示：[50, 30, 50] // 震-停-震
```

---

## 4. Loops & Modes 循環與模式

> **微互動如何隨時間變化？**

### 循環類型

```
開放循環：持續直到使用者停止
├── 音樂播放
└── 錄音中

封閉循環：特定次數後停止
├── 載入動畫（完成即停）
└── 新訊息提示（已讀即停）

長期循環：隨時間演變
├── 首次使用：詳細引導
└── 熟練後：簡化提示
```

### 模式

```
正常模式 vs 進階模式

範例：Caps Lock
├── 預設：正常輸入
├── 啟用：大寫模式
└── 指示：燈號/圖示提示
```

---

## 時間規範

### Duration 持續時間

```
即時回饋：< 100ms
├── 按鈕按下
├── 切換開關
└── Hover 效果

標準過渡：150-300ms
├── 頁面元素出現
├── Modal 開啟
└── 下拉選單

複雜動畫：300-500ms
├── 頁面轉場
├── 展開收合
└── 慶祝動畫

特殊效果：500-1000ms
├── 載入動畫
├── 引導動畫
└── 品牌動畫

⚠️ 超過 500ms 的動畫可能讓使用者感到等待
```

### 建議時間

| 類型 | 時間 |
|------|------|
| Hover 反應 | 50-100ms |
| 按鈕回饋 | 100-200ms |
| 選單展開 | 200-300ms |
| Modal 開啟 | 200-300ms |
| 頁面轉場 | 300-400ms |
| 載入動畫 | 循環直到完成 |

---

## Easing 緩動函數

### 常用 Easing

```
linear        ─────────────  勻速（避免使用）
ease-out      ▓▓▓▒▒░░░░░░░  快開始慢結束（推薦進入）
ease-in       ░░░░░░░▒▒▓▓▓  慢開始快結束（推薦離開）
ease-in-out   ░░▒▓▓▓▓▓▒░░░  兩端慢中間快（一般過渡）
```

### CSS Easing 值

```css
/* 標準 easing */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 彈性效果 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-elastic: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* 推薦組合 */
進入動畫：ease-out
離開動畫：ease-in
狀態變化：ease-in-out
```

### 選擇原則

```
物件進入畫面 → ease-out (減速進入)
物件離開畫面 → ease-in (加速離開)
位置移動 → ease-in-out (自然運動)
Hover 效果 → ease-out (快速回應)
```

---

## 常見微互動模式

### 1. 按鈕狀態

```css
.button {
  transition: all 150ms ease-out;
}

.button:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.button.loading {
  pointer-events: none;
  opacity: 0.7;
}
```

### 2. Toggle 開關

```css
.toggle {
  width: 48px;
  height: 24px;
  background: var(--gray-300);
  border-radius: 12px;
  transition: background 200ms ease-out;
}

.toggle::before {
  content: "";
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transform: translateX(2px);
  transition: transform 200ms ease-out;
}

.toggle.active {
  background: var(--primary);
}

.toggle.active::before {
  transform: translateX(26px);
}
```

### 3. 按讚動畫

```css
@keyframes like-pop {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.like-button.animating {
  animation: like-pop 400ms ease-out;
}

.like-button.active svg {
  fill: #ff4757;
}
```

### 4. 下拉刷新

```
狀態流程：
1. 下拉中 (Pulling)
   └── 顯示進度，圖示旋轉

2. 觸發點 (Triggered)
   └── 提示「放開刷新」

3. 刷新中 (Refreshing)
   └── 載入動畫

4. 完成 (Complete)
   └── 收起，顯示更新時間
```

### 5. 滑動刪除

```
┌───────────────────────────────────┐
│ 項目內容                 [刪除]  │
└───────────────────────────────────┘

滑動過程：
1. 滑動距離 < 25% → 彈回
2. 滑動距離 25-75% → 顯示刪除按鈕
3. 滑動距離 > 75% → 自動刪除
4. 刪除動畫 → 高度縮減至 0
```

### 6. Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 7. Toast 通知

```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.toast {
  animation: slideIn 300ms ease-out;
}

.toast.exiting {
  animation: slideOut 200ms ease-in forwards;
}
```

### 8. 表單驗證

```
即時驗證回饋：

輸入中：
[Email ________________]

驗證成功：
[Email ________________ ✓] (綠色勾)

驗證失敗：
[Email ________________ ✗] (紅色叉)
  ↳ 請輸入有效的 Email 地址
```

---

## 無障礙考量

### prefers-reduced-motion

```css
/* 預設有動畫 */
.element {
  transition: transform 300ms ease-out;
}

/* 使用者偏好減少動畫 */
@media (prefers-reduced-motion: reduce) {
  .element {
    transition: none;
  }

  .animated {
    animation: none;
  }
}
```

### 替代方案

```
有動畫版本：
[❤️] → 彈跳動畫 + 顏色變化

減少動畫版本：
[❤️] → 即時顏色變化（無動畫）

兩者都提供清楚的狀態回饋
```

### 注意事項

```
✓ 動畫可關閉
✓ 不依賴動畫傳達資訊
✓ 避免閃爍效果
✓ 提供足夠的對比度
✓ 循環動畫可停止
```

---

## 效能優化

### 優先使用的屬性

```css
/* 高效能（GPU 加速） */
transform: translate(), scale(), rotate()
opacity

/* 中效能 */
background-color
color
box-shadow

/* 低效能（觸發重排） */
width, height
margin, padding
top, left, right, bottom
```

### 最佳實踐

```css
/* 啟用 GPU 加速 */
.animated {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 動畫結束後移除 will-change */
.animated.done {
  will-change: auto;
}
```

### 避免的做法

```css
/* ❌ 動畫寬度 */
.bad {
  transition: width 300ms;
}

/* ✅ 使用 transform */
.good {
  transition: transform 300ms;
}
```

---

## Quick Reference

| 微互動 | 時間 | Easing |
|--------|------|--------|
| Hover 效果 | 150ms | ease-out |
| 按鈕點擊 | 100ms | ease-out |
| Toggle 切換 | 200ms | ease-out |
| Modal 開啟 | 200-300ms | ease-out |
| Modal 關閉 | 150-200ms | ease-in |
| 下拉選單 | 200ms | ease-out |
| Toast 進入 | 300ms | ease-out |
| Toast 離開 | 200ms | ease-in |
| 頁面轉場 | 300-400ms | ease-in-out |

---

## Checklist

### 基本要求
- [ ] 每個互動都有回饋
- [ ] 時間在建議範圍內
- [ ] 使用適當的 easing

### 品質要求
- [ ] 動畫流暢 (60fps)
- [ ] 目的明確（非裝飾）
- [ ] 符合品牌調性

### 無障礙
- [ ] 支援 prefers-reduced-motion
- [ ] 不依賴動畫傳達資訊
- [ ] 可停止循環動畫

### 效能
- [ ] 使用 transform/opacity
- [ ] 避免觸發重排的屬性
- [ ] 適當使用 will-change
