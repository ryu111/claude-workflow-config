# 過擬合防範

GP 演化最大風險：樣本內完美，樣本外崩潰。

## 什麼是過擬合？

**定義**: 策略學到訓練資料的**雜訊**而非**規律**。

**症狀**:
```
訓練集: Sharpe 3.5, Return 200%
驗證集: Sharpe 0.3, Return -15%
```

**原因**: GP 演化的搜尋空間極大，容易找到「運氣好」的策略。

## 過擬合來源

### 1. 資料窺探（Data Snooping）

**定義**: 在同一資料上重複優化。

```
演化 100 代 → 評估 5000 個策略 → 總有一個「看起來很好」
```

**類比**: 擲骰子 1000 次，總會出現連續 5 個 6。

### 2. 參數過度優化

```python
# 過擬合範例
if rsi(14.3782) > 67.2491 and ma(19.8374) < close * 1.0234:
    buy()
```

**問題**: 參數精確到小數點後 4 位，必然是過擬合（市場沒那麼精準）。

### 3. 策略過度複雜

```python
# 臃腫策略（Bloat）
if (rsi(14) > 50 and ma(20) < close) or \
   (rsi(7) < 30 and ema(10) > open) or \
   (volume > avg_volume * 2 and atr(14) < 1.5) or \
   (bbands_upper - close < 0.01 and macd > signal):
    buy()
```

**問題**: 條件太多，每個條件可能只匹配歷史某個特定時段。

### 4. 訓練資料不足

```
資料量 < 100 筆 → 隨機性主導
```

**統計學要求**: 至少 100-200 筆資料點才有意義。

## 檢測方法

### 1. 樣本外測試（Out-of-Sample, OOS）

```python
# 資料分割
train = data[:int(len(data) * 0.7)]  # 70% 訓練
test = data[int(len(data) * 0.7):]   # 30% 測試

# 在訓練集演化
result = gp_loop.run(train)

# 在測試集驗證
oos_performance = backtest(result.best_strategy, test)

# 比較
if oos_performance.sharpe < train_sharpe * 0.7:
    print("過擬合警告！")
```

**判斷標準**:
```
OOS Sharpe ≥ IS Sharpe * 0.7  → 合格
OOS Sharpe < IS Sharpe * 0.5  → 嚴重過擬合
```

### 2. Monte Carlo 模擬

**原理**: 隨機打亂交易順序，測試策略是否依賴特定時序。

```python
# 1000 次隨機模擬
mc_sharpes = []
for _ in range(1000):
    shuffled_trades = shuffle(original_trades)
    mc_sharpe = calculate_sharpe(shuffled_trades)
    mc_sharpes.append(mc_sharpe)

# 計算 p-value
p_value = (sum(mc_sharpe >= original_sharpe for mc_sharpe in mc_sharpes) / 1000)

if p_value > 0.05:
    print("策略無統計顯著性，可能過擬合")
```

**專案整合**: 在 5 階段驗證中自動執行。

### 3. Walk-Forward 分析

**原理**: 滾動訓練和測試。

```
訓練期 1 → 測試期 1
         訓練期 2 → 測試期 2
                  訓練期 3 → 測試期 3
```

**專案實作**: `src/automation/walk_forward.py`

### 4. 穩健性測試

**參數擾動**:
```python
# 測試參數敏感度
for delta in [-2, -1, 0, 1, 2]:
    perturbed_strategy = replace_param(strategy, 'rsi_period', 14 + delta)
    sharpe = backtest(perturbed_strategy, data).sharpe

    if abs(sharpe - original_sharpe) > 0.5:
        print("參數敏感度過高，可能過擬合")
```

**專案整合**: 5 階段驗證的 Robustness 測試。

## 防範策略

### 1. 資料分割

**三分法**（專案採用）:
```
Training (50%)  → 訓練 GP
Validation (25%) → 早期驗證（調整權重）
Testing (25%)    → 最終測試（不可修改策略）
```

**重要**: Testing Set 只用一次，**絕對不可用於調整**。

### 2. 複雜度控制

#### 方法 A: 限制樹深度

```python
# GPLoopConfig
max_tree_depth = 4  # 最多 4 層
```

**效果**: 防止策略過於複雜。

#### 方法 B: Parsimony Pressure（簡約壓力）

```python
fitness = performance - 0.1 * tree_depth
```

**效果**: 相同表現下，偏好簡單策略。

**專案未實作**: DEAP Tournament Selection 已隱含簡單性偏好。

### 3. 正則化（Regularization）

```python
# 懲罰過度交易
fitness = sharpe - 0.05 * (trades_per_day - 1)

# 懲罰低勝率
fitness = sharpe - 0.2 * (1 - win_rate)
```

**專案實作位置**: 可在 `src/gp/fitness.py` 的 `evaluate()` 加入。

### 4. 增加訓練資料

```python
# 使用多個標的
symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
combined_data = concat([fetch(s) for s in symbols])

# 訓練通用策略
result = gp_loop.run(combined_data)
```

**優點**: 策略學到「跨標的」規律，而非單一標的雜訊。

**缺點**: 可能犧牲單一標的最佳表現。

### 5. Ensemble（集成）

```python
# 演化多個策略
strategies = []
for _ in range(10):
    result = gp_loop.run(data)
    strategies.append(result.best_strategy)

# 投票決策
def ensemble_signal(data):
    votes = [s.generate_signals(data) for s in strategies]
    return majority_vote(votes)
```

**優點**: 降低單一策略過擬合風險。

**專案未實作**: 可作為未來增強。

### 6. 早停機制

```python
# GPLoopConfig
early_stopping = 10  # 10 代無進步則停止
```

**原理**: 持續演化 → 持續優化訓練集 → 過擬合加劇。

**專案已實作**: 預設啟用。

## 專案整合：5 階段驗證

專案使用 `StageValidator`（見 `策略驗證` skill）自動執行：

| 階段 | 測試內容 | 過擬合檢測 |
|------|----------|-----------|
| **IS** | 樣本內表現 | 基準線 |
| **OOS** | 樣本外表現 | OOS/IS 比率 |
| **Monte Carlo** | 隨機模擬 | p-value |
| **Walk-Forward** | 滾動測試 | 動態適應性 |
| **Stress Test** | 極端情況 | 穩健性 |

**通過標準**:
```python
result.quality_score >= 0.7  # 綜合評分
result.overfit_probability < 0.3  # 過擬合機率
```

## 判斷清單

演化後檢查：

- [ ] OOS Sharpe ≥ IS Sharpe * 0.7
- [ ] Monte Carlo p-value < 0.05
- [ ] Walk-Forward 所有階段都盈利
- [ ] 參數擾動 ±2 後 Sharpe 不劇變
- [ ] 策略邏輯可解釋（不是隨機湊數）
- [ ] 交易次數合理（非過度交易）
- [ ] 樹深度 ≤ 5 層

## 研究文獻重點

> "One of the biggest difficulties GP evolved strategies face is over-fitting; while solutions perform well in the training dataset, their performance is seriously degraded once tested out-of-sample."

**關鍵建議**:
1. 使用 robust fitness function（多市場條件）
2. 應用 parsimony pressure（簡約壓力）
3. 多階段驗證（不只 train/test）
4. 領域知識整合（避免無意義策略）

## 參考資源

- [GP Evolved Trading Rules](https://www.researchgate.net/publication/2480900_GP-evolved_Technical_Trading_Rules_Can_Outperform_Buy_and_Hold)
- [Overfitting in GP](https://fabian-kostadinov.github.io/2014/12/22/evolving-trading-strategies-with-genetic-programming-fitness-functions/)
- 專案實作: `src/validation/stage_validator.py`
