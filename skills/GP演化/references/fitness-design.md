# 適應度函數設計

GP 演化的核心：如何評估一個策略的「好壞」。

## 適應度函數的重要性

> "At the core of every GP strategy is the fitness function, which specifies what the whole evolutionary process is looking for."

**影響**:
- 演化方向（優化什麼）
- 最終策略特性（高報酬 vs 低風險）
- 過擬合風險（單一指標易過擬合）

## 專案實作

```python
def evaluate(individual, data, config):
    """
    評估個體適應度

    Args:
        individual: GP 個體（表達式樹）
        data: OHLCV DataFrame
        config: FitnessConfig

    Returns:
        tuple: (fitness,)  # DEAP 要求 tuple 格式
    """
    # 1. 轉換為策略
    strategy = compile(individual)

    # 2. 生成訊號
    signals = strategy.generate_signals(data)

    # 3. 回測
    result = backtest(signals, data, config)

    # 4. 計算適應度
    fitness = calculate_fitness(result, config.weights)

    return (fitness,)
```

### 多目標適應度

專案使用**加權多目標**（Weighted Multi-Objective）:

```python
fitness = (
    w_sharpe * sharpe_ratio +
    w_return * total_return -
    w_drawdown * max_drawdown
)
```

**預設權重**:
```python
fitness_weights = (1.0, 0.5, -0.3)
# (Sharpe, Return, DrawDown)
```

**設計原則**:
- Sharpe Ratio（權重 1.0）: 風險調整後報酬，最重要
- Total Return（權重 0.5）: 絕對報酬，次要
- Max DrawDown（權重 -0.3）: 最大回撤，懲罰風險

## 常見適應度指標

### 單一目標

| 指標 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **淨利潤** | 直觀易懂 | 忽略風險 | 不建議 |
| **總報酬率** | 標準化百分比 | 忽略風險 | 初步測試 |
| **Sharpe Ratio** | 風險調整 | 需要足夠樣本 | **推薦** |
| **Calmar Ratio** | Return/MaxDD | 對回撤敏感 | 保守策略 |
| **Sortino Ratio** | 只懲罰下行風險 | 計算複雜 | 進階使用 |

### 多目標組合

#### 方式 1：加權求和（專案使用）

```python
fitness = w1*f1 + w2*f2 + w3*f3
```

**優點**:
- 單一數值，易於排序
- DEAP 原生支援
- 權重可調整偏好

**缺點**:
- 權重選擇主觀
- 可能遺漏 Pareto 最優解

#### 方式 2：Pareto 前緣（研究方向）

```python
# NSGA-II, SPEA2
fitness = (sharpe, return, -drawdown)  # 多個目標
```

**優點**:
- 找出所有 Pareto 最優解
- 不需預設權重

**缺點**:
- 實作複雜（需要 NSGA-II 等演算法）
- 最終仍需選擇一個策略

**專案未採用原因**: 加權求和已足夠，實作簡單。

## 適應度權重調校

### 場景導向權重

| 目標 | Sharpe | Return | DrawDown | 說明 |
|------|--------|--------|----------|------|
| **平衡型** | 1.0 | 0.5 | -0.3 | 預設，風險報酬平衡 |
| **高報酬** | 0.5 | 1.5 | -0.2 | 追求收益，容忍風險 |
| **保守型** | 1.2 | 0.3 | -0.8 | 避免回撤，穩健優先 |
| **純風險調整** | 1.0 | 0.0 | 0.0 | 只看 Sharpe Ratio |

### 調校步驟

1. **初始設定**: 使用預設權重 `(1.0, 0.5, -0.3)`
2. **觀察結果**: 分析演化出的策略特性
3. **調整權重**:
   - 策略過於激進 → 增加 DrawDown 懲罰
   - 報酬過低 → 增加 Return 權重
   - 波動太大 → 增加 Sharpe 權重
4. **重新演化**: 使用新權重
5. **迭代**: 直到滿意

## 過擬合風險

### 常見陷阱

| 陷阱 | 原因 | 症狀 |
|------|------|------|
| **單一指標優化** | 只看 Return | 樣本內高報酬，樣本外崩潰 |
| **過度懲罰風險** | DrawDown 權重過高 | 策略過於保守，幾乎不交易 |
| **忽略交易成本** | 未計入手續費 | 高頻策略在實盤失效 |
| **訓練資料過少** | < 100 筆資料 | 隨機性主導，無統計意義 |

### 防範方法

#### 1. 多階段驗證

```
Training (50%) → Validation (25%) → Testing (25%)
```

專案使用 **5 階段驗證**（見 `策略驗證` skill）:
- IS（訓練）
- OOS（驗證）
- Monte Carlo（穩健性）
- Walk-Forward（動態適應）
- Stress Test（極端情況）

#### 2. 複雜度懲罰（Parsimony Pressure）

```python
fitness = (
    performance_score -
    complexity_penalty * tree_depth
)
```

**目的**: 避免過度複雜的策略（越簡單越好）。

**專案未實作原因**: DEAP 的 `selTournament` 已隱含簡單性偏好。

#### 3. 適應度平滑

```python
# 使用移動平均而非單次回測結果
fitness = moving_average(returns, window=20)
```

**目的**: 減少隨機波動影響。

## 實務建議

### 1. 分階段優化

| 階段 | 目標 | 權重 |
|------|------|------|
| **探索期** | 找出高報酬策略 | `(0.5, 1.5, -0.2)` |
| **精煉期** | 降低風險 | `(1.2, 0.5, -0.8)` |
| **驗證期** | 平衡測試 | `(1.0, 0.5, -0.3)` |

### 2. 動態適應度

根據市場狀態調整適應度函數：

```python
if market_volatility > 0.3:
    # 高波動市場：更重視風險控制
    weights = (1.2, 0.3, -0.8)
else:
    # 低波動市場：可追求報酬
    weights = (0.8, 1.0, -0.3)
```

**專案未實作**: 暫時使用固定權重，未來可擴展。

### 3. 領域知識整合

```python
def evaluate_with_domain_knowledge(individual, data, config):
    # 1. 基本適應度
    base_fitness = evaluate(individual, data, config)

    # 2. 領域規則檢查
    penalties = 0

    # 懲罰過度交易（日均交易 > 10 次）
    if daily_trades > 10:
        penalties += 0.5

    # 懲罰持倉過長（> 30 天）
    if avg_holding_days > 30:
        penalties += 0.3

    # 獎勵合理風險報酬比（RR > 2）
    if risk_reward_ratio > 2:
        base_fitness += 0.2

    return (base_fitness - penalties,)
```

## 典型配置範例

### 配置 1：預設平衡型

```python
config = FitnessConfig(
    sharpe_weight=1.0,
    return_weight=0.5,
    drawdown_weight=-0.3
)
```

**適用**: 一般場景，首選。

### 配置 2：高報酬探索

```python
config = FitnessConfig(
    sharpe_weight=0.5,
    return_weight=1.5,
    drawdown_weight=-0.2
)
```

**適用**: 初期探索，尋找高潛力策略。

### 配置 3：穩健型

```python
config = FitnessConfig(
    sharpe_weight=1.2,
    return_weight=0.3,
    drawdown_weight=-0.8
)
```

**適用**: 實盤前精煉，降低風險。

## 研究文獻重點

### Multi-Objective Fitness Functions

> "Multi-objective fitness functions can lead to superior results compared with single-objective ones."

**關鍵發現**:
- 單目標易陷入局部最優
- 多目標提供更穩健的解
- Pareto 前緣揭示報酬風險權衡

### Parsimony Pressure

> "Parsimony pressure is probably the most important and yet least understood concept when creating trading strategies with GP."

**重要性**:
- 防止「臃腫」程式碼（bloat）
- 提升策略可解釋性
- 減少過擬合風險

**實作**: 限制樹深度、節點數，或直接懲罰複雜度。

## 參考資源

- [Fitness Functions - Fabian Kostadinov](https://fabian-kostadinov.github.io/2014/12/22/evolving-trading-strategies-with-genetic-programming-fitness-functions/)
- [Robust Technical Trading Strategies using GP](https://www.sciencedirect.com/science/article/abs/pii/S0957417415007447)
- [Multi-objective GP for Algorithmic Trading](https://link.springer.com/article/10.1007/s10462-025-11390-9)
