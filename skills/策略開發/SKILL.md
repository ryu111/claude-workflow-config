# 策略開發 Skill

> 交易策略設計、開發、組合的完整知識體系

## 適用情境

- 設計新的交易策略
- 組合多個指標/方法形成策略
- 理解各種技術分析方法
- 選擇適合的策略類型

## 知識架構

```
策略知識體系
├── 核心組合 (core.md)
│   ├── 進場條件
│   ├── 出場條件
│   └── 風險管理
├── 技術指標 (indicators.md)
│   ├── 趨勢指標（MA, MACD, ADX...）
│   ├── 動量指標（RSI, Stochastic, CCI...）
│   ├── 波動度指標（ATR, BB, KC...）
│   └── 成交量指標（OBV, VWAP, MFI...）
├── 結構分析 (structure.md)
│   ├── 支撐阻力線
│   ├── 趨勢線
│   └── 價格形態
├── 多週期分析 (mtf.md)
│   ├── 時間框架階層
│   └── HTF/LTF 協調
├── 聰明錢概念 (smc.md)
│   ├── Order Block
│   ├── Fair Value Gap
│   ├── Liquidity Sweep
│   └── ChoCH / BOS
└── 組合模式 (combinations.md)
    ├── 過濾器模式
    ├── 評分模式
    └── 狀態機模式
```

## 策略設計流程

```
1. 選擇策略類型（趨勢/均值回歸/突破...）
     ↓
2. 選擇核心指標（主要進場訊號來源）
     ↓
3. 添加過濾器（趨勢過濾、波動度過濾...）
     ↓
4. 設計出場邏輯（反向訊號/目標價/追蹤停損）
     ↓
5. 加入風險管理（止損、部位大小）
     ↓
6. 參數化設計（可優化的參數）
```

## 專案策略架構

```python
# 策略繼承體系
BaseStrategy              # 所有策略的基類
├── TrendStrategy         # 趨勢策略基類
│   ├── MACrossStrategy   # 雙均線交叉
│   └── TrendlineBreak    # 趨勢線突破
├── MomentumStrategy      # 動量策略基類
│   ├── RSIStrategy       # RSI 均值回歸
│   └── MACDStrategy      # MACD 動量
└── StructureStrategy     # 結構策略基類（進階）
    ├── SRStrategy        # 支撐阻力策略
    └── SMCStrategy       # 聰明錢策略
```

## 參考資料

| 文件 | 內容 | 使用時機 |
|------|------|----------|
| `references/core.md` | 核心組合元素 | 設計任何策略 |
| `references/indicators.md` | 技術指標庫 | 選擇指標時 |
| `references/structure.md` | 支撐阻力/趨勢線 | 結構分析策略 |
| `references/mtf.md` | 多週期分析 | MTF 策略 |
| `references/smc.md` | 聰明錢概念 | SMC 策略 |
| `references/combinations.md` | 組合模式 | 設計組合邏輯 |
| `references/matrix.md` | **策略生成矩陣** | 系統化生成策略變體 |

## 相關 Skills

| Skill | 用途 |
|-------|------|
| **風險管理** | 止損/止盈設計、部位大小計算、槓桿控制、強平保護 |
| **回測核心** | 回測引擎、績效計算 |
| **策略驗證** | 5 階段驗證、過擬合檢測 |
| **參數優化** | Bayesian 優化、Walk-Forward |

> 策略開發 + 風險管理 = 完整的交易系統

## Quick Reference

### 策略類型選擇

| 市場狀態 | 推薦策略類型 | 原因 |
|----------|--------------|------|
| 強趨勢 | 趨勢跟隨 | 順勢交易 |
| 區間震盪 | 均值回歸 | 高低買賣 |
| 波動突破 | 突破策略 | 捕捉新趨勢 |
| 高流動性 | 結構/SMC | 機構行為明顯 |

### 常用組合模板

```python
# 模板 1：趨勢 + 動量
entry = trend_condition & momentum_condition
exit = opposite_signal | trailing_stop

# 模板 2：結構 + 確認
entry = structure_level & confirmation_candle
exit = opposite_structure | target_level

# 模板 3：MTF 協調
htf_bias = determine_trend(htf_data)
ltf_entry = find_entry(ltf_data, bias=htf_bias)
```
