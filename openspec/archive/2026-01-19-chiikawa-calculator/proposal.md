# Proposal: 吉伊卡哇風格科學計算機

## Why

建立一個以吉伊卡哇（Chiikawa）為主題的科學計算機網頁應用，結合可愛療癒的視覺風格與實用的科學計算功能，為使用者帶來愉悅的計算體驗。

## What Changes

### 新增功能
- **科學計算機核心**：四則運算、三角函數、對數、次方、括號支援
- **吉伊卡哇視覺主題**：
  - 角色表情反饋系統（開心、困惑、驚訝等）
  - 靜態裝飾元素（角色圖案背景/邊框）
  - 按鍵動畫互動效果
- **響應式設計**：支援桌面與行動裝置

### 視覺特色
- 圓潤線條（border-radius: 20px+）
- 柔和粉嫩配色（淺藍、淺粉、米色）
- 手繪風格邊框
- 角色表情 SVG 動畫

## Impact

- **Affected specs**: 新建 `chiikawa-calculator` capability
- **Affected code**: 新建 `~/Desktop/chiikawa-calculator/` 專案目錄
- **Dependencies**: 無外部依賴，純 HTML/CSS/JS

## Technical Decisions

### 技術選型
| 項目 | 選擇 | 理由 |
|------|------|------|
| 框架 | 原生 HTML/CSS/JS | 輕量、無需建置工具 |
| 角色圖案 | 內嵌 SVG | 可縮放、可動畫、無需外部資源 |
| 動畫 | CSS Animations + JS | 平滑、高效能 |
| 計算引擎 | 自製 Expression Parser | 支援括號與運算優先級 |

### 設計理念

**吉伊卡哇風格特徵**：
1. **圓潤感**：所有元素使用大圓角，避免尖銳邊角
2. **柔和色調**：使用低飽和度的粉嫩色系
3. **手繪質感**：不規則邊框、略帶手繪感的線條
4. **表情互動**：角色根據計算結果展現不同情緒
5. **療癒氛圍**：整體設計傳達溫暖、可愛的感覺

### 表情反饋邏輯
| 情境 | 表情 | 觸發條件 |
|------|------|----------|
| 待機 | 微笑 | 預設狀態 |
| 輸入中 | 專注 | 正在輸入數字或運算符 |
| 計算成功 | 開心 | 運算完成且結果正確 |
| 錯誤 | 困惑 | 除以零、無效輸入等 |
| 清除 | 驚訝 | 按下 AC 清除所有內容 |
| 大數字 | 驚嘆 | 結果超過 1000000 |

## Data Contracts

### Calculator State
```typescript
interface CalculatorState {
  expression: string;      // 完整運算式
  displayValue: string;    // 顯示值
  currentEmotion: Emotion; // 當前表情
  isError: boolean;        // 錯誤狀態
  memory: number;          // 記憶值
}

type Emotion = 'smile' | 'focus' | 'happy' | 'confused' | 'surprised' | 'amazed';
```

### Expression Token
```typescript
interface Token {
  type: 'number' | 'operator' | 'function' | 'parenthesis';
  value: string;
}
```

## Success Criteria

- [ ] 所有科學計算功能正確運作
- [ ] 角色表情正確反映計算狀態
- [ ] 動畫流暢（60fps）
- [ ] 響應式設計在手機上正常顯示
- [ ] 無 console 錯誤
