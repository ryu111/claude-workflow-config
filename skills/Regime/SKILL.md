---
name: regime
description: 市場狀態識別（Market Regime Detection）。當需要識別趨勢/震盪/高低波動市場狀態、選擇適合的策略類型、或分析市場條件變化時使用。適用於策略選擇、風險管理、參數調整。
---

# Market Regime Detection（市場狀態識別）

識別市場當前處於何種狀態，以選擇適合的交易策略和風控參數。

## 核心原則

| 原則 | 說明 |
|------|------|
| **狀態優先於策略** | 先識別市場狀態，再選擇策略類型 |
| **動態調整** | 根據狀態變化調整參數和曝險 |
| **概率框架** | 使用概率模型而非硬分類 |
| **多時間框架** | 結合短中長期狀態判斷 |
| **避免過度擬合** | 狀態數量不宜過多（2-4 個） |

## 市場狀態類型

### 基本分類

| 狀態 | 特徵 | 適用策略 | 風控重點 |
|------|------|----------|----------|
| **趨勢市** | 持續單向移動，低波動 | Trend Following, Breakout | 跟隨趨勢，止損寬鬆 |
| **震盪市** | 橫向整理，價格區間內 | Mean Reversion, Range Trading | 反向操作，快速止損 |
| **高波動** | 大幅波動，不確定性高 | Scalping, Volatility Arbitrage | 降低槓桿，緊止損 |
| **低波動** | 波動極低，交易清淡 | Long-term Hold, Gradual Trend | 降低頻率，等待突破 |

### 進階分類（3 狀態模型）

| 狀態 | 市場情緒 | 波動特性 | 策略建議 |
|------|----------|----------|----------|
| **Bull（牛市）** | 樂觀、上漲趨勢 | 中低波動 | Long Bias, Momentum |
| **Bear（熊市）** | 悲觀、下跌趨勢 | 中高波動 | Short Bias, Defensive |
| **Neutral（中性）** | 不明確、橫盤 | 低波動 | Mean Reversion, Range |

## 識別方法

### 1. 統計方法（快速簡單）

| 方法 | 指標 | 實作 |
|------|------|------|
| **波動率** | ATR, 標準差 | `regime_volatility()` |
| **趨勢強度** | ADX, 線性迴歸斜率 | `regime_trend_strength()` |
| **價格位置** | 價格相對 MA | `regime_price_position()` |
| **多時框一致** | 多週期趨勢方向 | `regime_multi_timeframe()` |

**範例**：
```python
# 基於波動率和趨勢的簡單分類
if atr > atr_ma * 1.5:
    regime = "high_volatility"
elif adx > 25 and price > sma_200:
    regime = "bull_trend"
elif adx < 20:
    regime = "sideways"
else:
    regime = "neutral"
```

### 2. Hidden Markov Models（HMM）

**核心概念**：假設市場狀態是隱藏的，只能透過觀察到的價格/成交量推斷。

| 特點 | 說明 |
|------|------|
| **概率框架** | 輸出每個狀態的概率 |
| **自動學習** | 從歷史資料自動識別狀態 |
| **動態切換** | 捕捉狀態轉換時機 |
| **3 狀態常見** | Bull / Bear / Neutral |

**實作位置**：`src/regime/hmm_detector.py`

詳細說明 → `references/hmm-models.md`

### 3. 機器學習方法

| 方法 | 輸入特徵 | 優勢 |
|------|----------|------|
| **Random Forest** | 技術指標 + 宏觀數據 | 可解釋性高 |
| **Mixture Models** | 價格分佈特徵 | 自動分群 |
| **LSTM** | 時序價格資料 | 捕捉長期依賴 |

詳細比較 → `references/ml-approaches.md`

## 專案整合

### 檔案位置

```
src/regime/
├── analyzer.py          # 主分析器（多種方法整合）
├── hmm_detector.py      # HMM 實作
├── statistical.py       # 統計方法
└── features.py          # 特徵計算
```

### 使用流程

```python
# 1. 建立分析器
from src.regime.analyzer import RegimeAnalyzer

analyzer = RegimeAnalyzer(method='hmm', n_states=3)

# 2. 訓練模型（僅 HMM/ML 需要）
analyzer.fit(historical_data)

# 3. 識別當前狀態
current_regime = analyzer.detect(recent_data)
# 輸出: {"state": "bull", "probability": 0.78, "confidence": "high"}

# 4. 根據狀態選擇策略
if current_regime['state'] == 'bull':
    strategy = TrendFollowingStrategy()
elif current_regime['state'] == 'sideways':
    strategy = MeanReversionStrategy()
```

### 與策略選擇整合

```python
# src/automation/ultimate_loop.py

def select_strategy_with_regime(self):
    """根據市場狀態選擇策略"""

    # 識別當前狀態
    regime = self.regime_analyzer.detect(self.recent_data)

    # 根據狀態調整策略選擇概率
    if regime['state'] == 'bull_trend':
        # 趨勢市：優先趨勢策略
        weights = {'trend': 0.6, 'mean_reversion': 0.2, 'breakout': 0.2}
    elif regime['state'] == 'sideways':
        # 震盪市：優先均值回歸
        weights = {'trend': 0.1, 'mean_reversion': 0.7, 'breakout': 0.2}
    elif regime['state'] == 'high_volatility':
        # 高波動：降低曝險，短線策略
        weights = {'trend': 0.3, 'mean_reversion': 0.3, 'scalping': 0.4}

    return self.sample_strategy(weights)
```

## 績效提升證據

根據研究文獻：

| 指標 | 改善幅度 | 來源 |
|------|----------|------|
| 風險調整回報 | +10-30% | 多項研究 |
| 最大回撤 | -10-30% | 狀態調整策略 |
| Sharpe Ratio | +1.7 (HMM) | QS 研究 |
| 年化報酬 | +36% (HMM intraday) | Top 10 stocks |

## 常見陷阱

| 陷阱 | 說明 | 解決方案 |
|------|------|----------|
| **狀態過多** | 4+ 狀態容易過擬合 | 限制 2-3 個狀態 |
| **頻繁切換** | 狀態頻繁變化導致過度交易 | 加入切換成本、設定最小持續期 |
| **樣本外失效** | 訓練期表現好，實盤失效 | Walk-forward 驗證 |
| **忽略轉換成本** | 狀態切換時調整部位的成本 | 計入滑價和手續費 |
| **過度依賴** | 盲目信任狀態判斷 | 結合其他風控機制 |

## 驗證方法

```python
# 1. Walk-Forward 驗證
for train, test in walk_forward_splits(data):
    analyzer.fit(train)
    regime_predictions = analyzer.detect(test)

    # 檢查狀態切換是否合理
    check_regime_stability(regime_predictions)

    # 比較有無狀態識別的績效差異
    perf_with_regime = backtest_with_regime(test, regime_predictions)
    perf_without = backtest_baseline(test)

    assert perf_with_regime.sharpe > perf_without.sharpe

# 2. Monte Carlo 穩健性測試
for _ in range(1000):
    synthetic_data = bootstrap_sample(data)
    regime = analyzer.detect(synthetic_data)

    # 狀態識別應該穩定
    check_regime_consistency(regime)
```

## 學習記錄整合

**每次發現狀態相關洞察時，自動更新 `learning/insights.md`**：

```markdown
#### Regime Detection Insights

- **發現**：BTC 在高波動狀態（ATR > 5%）時，Trend Following Sharpe 從 1.2 降至 0.3
- **應對**：高波動時切換至 Mean Reversion 或降低槓桿
- **日期**：2026-01-18
```

## Next Steps

### 深入理解 HMM
For Hidden Markov Models 詳細原理、實作和調參 → `references/hmm-models.md`

### 機器學習方法比較
For Random Forest / Mixture Models / LSTM 比較 → `references/ml-approaches.md`

### 技術指標整合
For 如何結合現有指標庫進行狀態識別 → `references/technical-indicators.md`

### 實戰案例
For 完整的狀態識別到策略選擇範例 → `references/practical-examples.md`

---

**使用建議**：從簡單統計方法開始（波動率 + 趨勢強度），驗證有效後再考慮 HMM 或 ML 方法。
