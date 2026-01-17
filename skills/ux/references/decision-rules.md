# 設計決策規則

100 條經過驗證的設計推理規則，協助做出正確決策。

---

## 使用方式

1. 在設計決策點查詢相關規則
2. 規則優先級：**安全 > 可用性 > 美觀**
3. 規則可能有例外，需結合情境
4. `PRIORITY: HIGH` = 必須遵守，`MEDIUM` = 建議遵守

---

## 一、色彩決策規則 (R01-R20)

### R01: 主色數量限制
```
IF 主色 > 3 種 THEN 減少至 2-3
PRIORITY: HIGH
REASON: 過多主色導致視覺混亂，品牌識別度下降
EXCEPTION: 多品牌入口頁、藝術類網站
```

### R02: CTA 色彩對比
```
IF CTA 與背景對比度 < 4.5:1 THEN 調整色彩
PRIORITY: HIGH
REASON: 低對比度的 CTA 轉換率下降 40%
NEVER: 使用灰色作為主要 CTA
```

### R03: 錯誤狀態用紅色
```
IF 表示錯誤/危險 THEN 使用紅色系 (#DC2626 - #EF4444)
PRIORITY: HIGH
REASON: 紅色是跨文化的警告色，辨識最快
MUST: 結合圖示，不只依賴顏色
```

### R04: 深色模式飽和度
```
IF 深色模式 THEN 降低飽和度 10-15%
PRIORITY: MEDIUM
REASON: 高飽和度在深色背景上刺眼
APPLY: 所有功能色（success, warning, error）
```

### R05: 品牌色與產業
```
IF 金融/醫療/企業 THEN 傾向藍色系
IF 環保/健康 THEN 傾向綠色系
IF 奢侈品 THEN 傾向黑/金
PRIORITY: MEDIUM
REASON: 符合用戶心理預期，建立信任
```

### R06: 60-30-10 法則
```
60% = 背景/大面積
30% = 結構/卡片/導航
10% = 強調/CTA/重點
PRIORITY: HIGH
REASON: 經典的色彩平衡法則
```

### R07: 不只依賴顏色
```
IF 傳達資訊 THEN 必須有非色彩的視覺提示
PRIORITY: HIGH
REASON: 色盲用戶（8% 男性）無法區分
MUST: 使用圖示、文字、形狀
```

### R08: 漸層使用
```
IF 使用漸層 THEN 使用相鄰色相
PRIORITY: MEDIUM
REASON: 跨色相漸層容易產生髒色
EXCEPTION: 極光/全息效果
```

### R09: 文字背景對比
```
IF 文字 THEN 對比度 ≥ 4.5:1 (AA)
IF 大文字 (18px+) THEN 對比度 ≥ 3:1
IF 政府/醫療 THEN 對比度 ≥ 7:1 (AAA)
PRIORITY: HIGH
```

### R10: 功能色一致性
```
成功 = 綠色
警告 = 黃色/橙色
錯誤 = 紅色
資訊 = 藍色
PRIORITY: HIGH
REASON: 用戶心智模型
```

---

## 二、排版決策規則 (R21-R40)

### R21: 內文最小字體
```
IF 內文字體 < 16px THEN 調整至 16px+
PRIORITY: HIGH
REASON: 小於 16px 在行動裝置上可讀性差
EXCEPTION: 輔助說明文字可用 14px
```

### R22: 行高設定
```
IF 內文 THEN line-height: 1.5-1.7
IF 標題 THEN line-height: 1.2-1.3
PRIORITY: HIGH
REASON: 適當行高提升閱讀舒適度
```

### R23: 字體配對原則
```
IF 需要配對 THEN 選擇對比性組合
  - Sans + Serif（最安全）
  - 現代 + 經典
  - 粗 + 細
AVOID: 兩個相似字體（會看起來像錯誤）
PRIORITY: MEDIUM
```

### R24: 中英混排
```
IF 中英混排 THEN 使用「思源黑體」或「Noto Sans TC」
PRIORITY: HIGH
REASON: 專為混排設計，比例和諧
FALLBACK: -apple-system, BlinkMacSystemFont
```

### R25: 標題層級數量
```
IF 標題層級 > 4 THEN 簡化
PRIORITY: MEDIUM
REASON: 過多層級讓用戶無法快速掃描
STANDARD: H1 > H2 > H3 > Body
```

### R26: 行長限制
```
IF 閱讀內容 THEN max-width: 65-75 字元
PRIORITY: HIGH
REASON: 超過會增加眼球移動，降低閱讀效率
CSS: max-width: 70ch
```

### R27: 字體數量
```
IF 字體數量 > 3 THEN 減少
PRIORITY: HIGH
REASON: 過多字體造成視覺混亂
STANDARD: 標題 + 內文 + 代碼（如需要）
```

### R28: 對齊方式
```
IF 長文 THEN 左對齊
IF 標題/CTA THEN 可置中
NEVER: 兩端對齊（造成不均勻間距）
PRIORITY: MEDIUM
```

### R29: 字距調整
```
IF 全大寫標題 THEN letter-spacing: 0.05-0.1em
IF 一般文字 THEN 使用預設
PRIORITY: MEDIUM
REASON: 大寫字母需要更多間距
```

### R30: 響應式字體
```
IF 響應式 THEN 使用 clamp() 或媒體查詢
EXAMPLE: font-size: clamp(1rem, 2vw, 1.5rem)
PRIORITY: MEDIUM
REASON: 確保各裝置可讀性
```

---

## 三、佈局決策規則 (R41-R60)

### R41: 觸控目標尺寸
```
IF 可點擊元素 THEN min-size: 44x44px
PRIORITY: HIGH
REASON: Apple HIG 和 WCAG 標準
CRITICAL: 行動裝置必須遵守
```

### R42: 元素間距
```
IF 相關元素 THEN spacing: 8-16px
IF 區塊分隔 THEN spacing: 24-48px
IF 頁面區段 THEN spacing: 64-96px
PRIORITY: HIGH
REASON: 間距傳達關係
```

### R43: 視覺層級數量
```
IF 視覺層級 > 4 THEN 簡化
PRIORITY: MEDIUM
REASON: 過多層級讓用戶無法快速掃描
```

### R44: 卡片內間距
```
IF 卡片設計 THEN padding: 16-24px
IF 資訊密度高 THEN padding: 12-16px
PRIORITY: MEDIUM
REASON: 間距影響內容感知品質
```

### R45: 網格系統
```
IF 桌面 THEN 12 欄網格
IF 行動 THEN 4 欄網格
PRIORITY: MEDIUM
REASON: 標準化系統便於維護
```

### R46: Z-Index 管理
```
背景: 0
內容: 10
卡片: 20
下拉選單: 30
Modal: 40
Tooltip: 50
PRIORITY: HIGH
REASON: 防止層級混亂
```

### R47: 固定元素
```
IF 導航 THEN 可固定在頂部
IF 行動裝置 CTA THEN 可固定在底部
MUST: 不遮擋主要內容
PRIORITY: MEDIUM
```

### R48: 響應式斷點
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
PRIORITY: HIGH
STANDARD: Tailwind CSS 標準
```

### R49: 最大內容寬度
```
IF 閱讀內容 THEN max-width: 720px
IF 儀表板 THEN max-width: 1440px
IF 著陸頁 THEN max-width: 1200px
PRIORITY: MEDIUM
```

### R50: 空白區域
```
IF 重要內容 THEN 周圍需要留白
PRIORITY: MEDIUM
REASON: 留白提升重要性感知
RATIO: 與元素重要性成正比
```

---

## 四、互動決策規則 (R61-R80)

### R61: 回饋時間
```
IF 動作後 > 100ms 無回饋 THEN 加入視覺回饋
IF 等待 > 1s THEN 顯示 loading 狀態
IF 等待 > 10s THEN 顯示進度 + 可取消
PRIORITY: HIGH
```

### R62: Modal vs Drawer vs Inline
```
IF 需要用戶專注決策 THEN Modal
IF 顯示詳細資訊/設定 THEN Drawer
IF 快速編輯 THEN Inline
PRIORITY: MEDIUM
```

### R63: 確認對話框
```
IF 破壞性操作 THEN 必須確認
INCLUDE: 操作後果說明
BUTTON: 使用具體動詞（刪除/保留）而非（是/否）
PRIORITY: HIGH
```

### R64: 表單驗證時機
```
IF 格式驗證 THEN onBlur（離開欄位時）
IF 即時反饋需求 THEN onChange + debounce
NEVER: 只在 submit 時驗證所有欄位
PRIORITY: HIGH
```

### R65: 錯誤訊息
```
MUST: 說明什麼錯了
MUST: 說明如何修正
SHOULD: 靠近錯誤欄位
NEVER: 只顯示「錯誤」
PRIORITY: HIGH
```

### R66: 成功回饋
```
IF 操作成功 THEN 顯示確認
DURATION: 3-5 秒自動消失
OPTION: 可手動關閉
PRIORITY: MEDIUM
```

### R67: Hover 效果
```
IF 可互動 THEN 必須有 Hover 效果
CHANGE: 顏色、陰影、或縮放
DURATION: 150ms
PRIORITY: HIGH
REASON: 指示可互動性
```

### R68: Focus 狀態
```
IF 可 focus 元素 THEN 必須有明顯 focus ring
PRIORITY: HIGH
REASON: 鍵盤導航必需
STYLE: outline: 2px solid #2563eb; outline-offset: 2px;
```

### R69: Loading 狀態
```
IF 按鈕載入中 THEN 顯示 spinner + 禁用
IF 內容載入中 THEN 使用 skeleton
IF 整頁載入 THEN 進度指示器
PRIORITY: HIGH
```

### R70: 動畫時長
```
Hover 效果: 150ms
按鈕點擊: 100-200ms
Modal 開關: 200-300ms
頁面轉場: 300-400ms
PRIORITY: MEDIUM
```

### R71: 可逆操作
```
IF 用戶操作 THEN 盡可能提供 Undo
PRIORITY: MEDIUM
REASON: 減少用戶焦慮
EXAMPLE: Gmail 撤銷發送
```

### R72: 預設值
```
IF 常見選項 THEN 設為預設
PRIORITY: MEDIUM
REASON: 減少用戶操作
EXCEPTION: 涉及金錢/隱私的選項
```

### R73: 空狀態
```
IF 無內容 THEN 顯示有意義的空狀態
INCLUDE: 說明 + 行動建議
NEVER: 只顯示空白
PRIORITY: HIGH
```

### R74: 分頁 vs 無限滾動
```
IF 需要跳轉特定位置 THEN 分頁
IF 探索瀏覽 THEN 無限滾動
IF 電商產品列表 THEN 分頁（SEO）
PRIORITY: MEDIUM
```

### R75: 自動儲存
```
IF 編輯內容 THEN 考慮自動儲存
FEEDBACK: 顯示「已儲存」狀態
PRIORITY: MEDIUM
```

---

## 五、風格決策規則 (R81-R100)

### R81: 風格與品牌一致性
```
IF 品牌已有視覺識別 THEN 延續而非革新
IF 全新品牌 THEN 根據定位選擇風格
PRIORITY: HIGH
RULE: 一致性 > 時尚感
```

### R82: Glassmorphism 使用
```
IF 背景有漸層/圖片 THEN 適合
IF 資訊密度高 THEN 不適合
IF 需要高無障礙 THEN 不適合
PRIORITY: MEDIUM
PERFORMANCE: 注意 blur 在低端裝置的效能
```

### R83: Neubrutalism 使用
```
IF 目標是年輕/創意受眾 THEN 適合
IF 目標是保守/企業受眾 THEN 不適合
PRIORITY: MEDIUM
CHARACTERISTIC: 粗邊框、高對比、不對稱
```

### R84: 深色 vs 淺色模式
```
IF 主要晚間使用 THEN 預設深色
IF 內容為主（閱讀） THEN 預設淺色
IF 媒體為主（影片/圖片） THEN 預設深色
ALWAYS: 提供切換選項
PRIORITY: MEDIUM
```

### R85: 動效程度
```
IF 工具型產品 THEN 最小動效（快速）
IF 品牌型產品 THEN 適度動效（印象）
IF 遊戲/娛樂 THEN 豐富動效（體驗）
PRIORITY: MEDIUM
ACCESSIBILITY: 尊重 prefers-reduced-motion
```

### R86: 圓角選擇
```
IF 友善/現代 THEN 大圓角 (12-16px)
IF 專業/傳統 THEN 小圓角 (4-6px)
IF Neubrutalism THEN 無圓角 (0px)
PRIORITY: MEDIUM
CONSISTENCY: 全站統一
```

### R87: 陰影使用
```
IF 需要層次感 THEN 使用陰影
IF 深色模式 THEN 減少或改用邊框
IF Flat 風格 THEN 不使用
PRIORITY: MEDIUM
```

### R88: 裝飾元素
```
IF 品牌頁面 THEN 可使用裝飾
IF 功能頁面 THEN 最小化裝飾
MUST: 不干擾功能操作
PRIORITY: MEDIUM
```

### R89: 產業風格禁忌
```
金融 ≠ Neubrutalism（不夠專業）
醫療 ≠ Cyberpunk（不夠信任）
法律 ≠ Playful（不夠嚴肅）
兒童 ≠ Dark Mode（不夠友善）
PRIORITY: HIGH
```

### R90: 響應式風格
```
IF 複雜風格效果 THEN 在行動版簡化
PRIORITY: MEDIUM
REASON: 效能和可用性
```

### R91: 圖片風格
```
IF 使用圖片 THEN 風格需一致
PRIORITY: MEDIUM
OPTIONS: 全攝影、全插畫、全圖示
AVOID: 混搭不同風格
```

### R92: 圖示風格
```
IF 使用圖示 THEN 全站統一風格
OPTIONS: Outline / Filled / Duotone
PRIORITY: HIGH
CONSISTENCY: 大小和粗細一致
```

### R93: 漸層 vs 純色
```
IF 現代/創意 THEN 可用漸層
IF 專業/傳統 THEN 使用純色
PRIORITY: MEDIUM
```

### R94: 動畫類型
```
IF 進入畫面 THEN fade-in + slide-up
IF 離開畫面 THEN fade-out（無 slide）
IF 狀態變化 THEN ease-in-out
PRIORITY: MEDIUM
```

### R95: 微互動一致性
```
IF 相同類型元素 THEN 相同微互動
PRIORITY: HIGH
EXAMPLE: 所有卡片 Hover 效果一致
```

### R96: 品牌色使用量
```
品牌色 = CTA + 重點強調
NEVER: 大面積使用高飽和品牌色
PRIORITY: MEDIUM
```

### R97: 對比度優先於美觀
```
IF 對比度不足 THEN 調整色彩
NEVER: 為了美觀犧牲可讀性
PRIORITY: HIGH
```

### R98: 無障礙永遠優先
```
IF 風格與無障礙衝突 THEN 調整風格
PRIORITY: HIGH
REASON: 法規要求 + 道德責任
```

### R99: 測試在真實環境
```
MUST: 在真實裝置測試
MUST: 在不同光線測試
MUST: 請真實用戶測試
PRIORITY: HIGH
```

### R100: 持續迭代
```
設計 ≠ 一次完成
PRIORITY: HIGH
PROCESS: 設計 → 測試 → 數據 → 改進
```

---

## 快速查詢

| 主題 | 規則編號 |
|------|----------|
| 色彩 | R01-R10 |
| 排版 | R21-R30 |
| 佈局 | R41-R50 |
| 互動 | R61-R75 |
| 風格 | R81-R100 |
| 無障礙 | R02, R07, R09, R21, R41, R68, R98 |
| 效能 | R82, R85, R90 |
