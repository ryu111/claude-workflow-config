# 疑難排解

GP 演化常見問題與解決方案。

## 問題 1: 演化無進步（Fitness 停滯）

### 症狀

```
Generation 0: Best Fitness = 1.2
Generation 5: Best Fitness = 1.25
Generation 10: Best Fitness = 1.26
Generation 30: Best Fitness = 1.27
```

**特徵**: Fitness 幾乎不變，或早期就觸發 early stopping。

### 可能原因

| 原因 | 診斷方法 | 解決方案 |
|------|---------|---------|
| **族群多樣性不足** | 檢查初始策略是否類似 | 增大 `population_size` 或 `mutpb` |
| **適應度函數設計不當** | 所有策略 fitness 都接近 | 重新設計適應度函數 |
| **原語集過小** | 生成的策略結構單一 | 使用 `primitive_set='standard'` |
| **局部最優** | Best fitness 很早就不變 | 增加 `mutpb`，減小 `tournsize` |
| **資料問題** | 回測結果異常（如都虧損） | 檢查資料品質 |

### 解決步驟

```python
# 1. 檢查多樣性
print("Checking diversity...")
for ind in population[:10]:
    print(converter.to_python(ind))

# 如果 10 個策略都很相似 → 多樣性不足

# 2. 增加多樣性
config.population_size = 100  # 從 50 增加到 100
config.mutpb = 0.3  # 從 0.2 增加到 0.3
config.tournsize = 2  # 從 3 減小到 2

# 3. 檢查適應度分佈
fitnesses = [ind.fitness.values[0] for ind in population]
print(f"Min: {min(fitnesses)}, Max: {max(fitnesses)}, Std: {np.std(fitnesses)}")

# 如果 Std 很小（如 < 0.1）→ 適應度函數區分度不足

# 4. 重新演化
result = gp_loop.run(data)
```

## 問題 2: 過早收斂（Premature Convergence）

### 症狀

```
Generation 0: Diversity = 0.95, Best = 1.0
Generation 5: Diversity = 0.30, Best = 1.8
Generation 10: Diversity = 0.10, Best = 1.82
```

**特徵**: 多樣性快速下降，族群過早趨同。

### 可能原因

| 原因 | 解決方案 |
|------|---------|
| **選擇壓力過大** | 減小 `tournsize`（3 → 2） |
| **交叉率過高** | 降低 `cxpb`（0.7 → 0.5） |
| **變異率過低** | 增加 `mutpb`（0.2 → 0.3） |
| **族群過小** | 增大 `population_size`（50 → 100） |

### 解決方案

```python
# 配置：增加多樣性維持
config = GPLoopConfig(
    population_size=100,  # 增大族群
    tournsize=2,          # 降低選擇壓力
    cxpb=0.5,            # 降低交叉
    mutpb=0.3,           # 增加變異
)
```

## 問題 3: 演化速度過慢

### 症狀

```
演化 30 代需要 > 2 小時
```

### 可能原因

| 原因 | 解決方案 |
|------|---------|
| **族群過大** | 減小 `population_size`（100 → 50） |
| **資料量過大** | 減少回測資料量（5000 → 1000 筆） |
| **回測引擎慢** | 使用 Metal Engine（專案已預設） |
| **原語集過大** | 使用 `primitive_set='minimal'` |
| **策略過度複雜** | 限制樹深度（`max_depth=4`） |

### 解決方案

```python
# 快速配置（測試用）
config = GPLoopConfig(
    population_size=30,
    generations=20,
    primitive_set='minimal'
)

# 使用資料子集
data_subset = data[-1000:]  # 只用最近 1000 筆
result = gp_loop.run(data_subset)
```

**注意**: 減少資料量會增加過擬合風險，僅適合原型測試。

## 問題 4: 策略過度複雜（Bloat）

### 症狀

```python
# 生成的策略
and_(
    or_(
        and_(gt(rsi(14), 50), lt(ma(20), close)),
        and_(gt(ema(10), open), lt(atr(14), 1.5))
    ),
    or_(
        gt(volume, 1000000),
        and_(lt(bbands_lower, close), gt(macd, signal))
    )
)
```

**特徵**: 策略邏輯冗長，層數過深。

### 可能原因

| 原因 | 解決方案 |
|------|---------|
| **無樹深度限制** | 限制 `max_depth=4` |
| **無複雜度懲罰** | 加入 Parsimony Pressure |
| **演化代數過多** | 減少 `generations` 或使用 `early_stopping` |

### 解決方案

#### 方法 1: 限制樹深度

```python
import operator
from deap import gp

# 初始化時限制
toolbox.register("expr", gp.genHalfAndHalf, pset=pset, min_=1, max_=3)

# 變異時限制
toolbox.decorate("mutate", gp.staticLimit(key=operator.attrgetter('height'), max_value=4))
```

#### 方法 2: 複雜度懲罰

```python
def evaluate_with_parsimony(individual, data):
    # 基本適應度
    base_fitness = evaluate(individual, data)

    # 樹深度懲罰
    tree_depth = individual.height
    complexity_penalty = 0.05 * tree_depth

    return (base_fitness - complexity_penalty,)
```

## 問題 5: 策略無統計顯著性

### 症狀

```
Monte Carlo p-value = 0.35 (> 0.05)
→ 策略表現可能是隨機結果
```

### 可能原因

| 原因 | 解決方案 |
|------|---------|
| **資料量不足** | 增加訓練資料（> 500 筆） |
| **適應度過擬合** | 使用多目標適應度（Sharpe + Return - DD） |
| **交易次數過少** | 檢查策略是否過於保守 |
| **本質上無效策略** | 重新演化，調整適應度權重 |

### 解決方案

```python
# 1. 增加資料量
data = fetcher.fetch_ohlcv(symbol, timeframe, limit=5000)

# 2. 檢查交易次數
result = backtest(strategy, data)
if result.num_trades < 30:
    print("交易次數過少，無法判斷統計顯著性")

# 3. 重新演化（調整適應度）
config.fitness_weights = (1.0, 0.5, -0.3)  # 平衡型
```

## 問題 6: OOS 表現遠低於 IS

### 症狀

```
IS Sharpe: 2.5
OOS Sharpe: 0.8
```

**特徵**: 嚴重過擬合。

### 診斷

```python
# 檢查 OOS/IS 比率
oos_is_ratio = result.oos_sharpe / result.is_sharpe

if oos_is_ratio < 0.7:
    print("過擬合警告！")

    # 檢查訓練資料量
    if len(train_data) < 200:
        print("訓練資料過少")

    # 檢查策略複雜度
    if strategy.height > 5:
        print("策略過度複雜")
```

### 解決方案

詳細防範 → see `overfitting.md`

**快速修復**:
```python
# 1. 增加訓練資料
train_data = data[:int(len(data) * 0.8)]  # 80% 訓練

# 2. 限制複雜度
config.max_depth = 3

# 3. 使用早停
config.early_stopping = 5

# 4. 重新演化
result = gp_loop.run(train_data)

# 5. 驗證
oos_result = backtest(result.best_strategy, test_data)
print(f"OOS Sharpe: {oos_result.sharpe}")
```

## 問題 7: 演化產生無效策略

### 症狀

```python
# 生成的策略
and_(gt(close, close), lt(open, open))
# → 永遠 False
```

**特徵**: 策略邏輯無意義。

### 可能原因

| 原因 | 解決方案 |
|------|---------|
| **原語集設計不當** | 檢查函數/終端是否合理 |
| **強型別未啟用** | 使用 `PrimitiveSetTyped` |
| **適應度函數未捕捉異常** | 在 `evaluate()` 加入異常處理 |

### 解決方案

```python
# 1. 使用強型別
pset = gp.PrimitiveSetTyped("main", [DataFrame], Signal)

# 2. 適應度函數驗證
def evaluate(individual, data):
    try:
        strategy = compile(individual)
        signals = strategy.generate_signals(data)

        # 檢查訊號有效性
        if signals.sum() == 0:  # 無交易訊號
            return (-999.0,)  # 懲罰

        result = backtest(signals, data)
        return (result.sharpe,)

    except Exception as e:
        # 無效策略
        return (-999.0,)
```

## 問題 8: 記憶體不足

### 症狀

```
MemoryError: Unable to allocate array
```

### 可能原因

| 原因 | 解決方案 |
|------|---------|
| **族群過大** | 減小 `population_size` |
| **資料量過大** | 減少回測資料量 |
| **名人堂過大** | 減小 `top_n`（預設 5） |
| **未釋放資源** | 使用 `with GPLoop()` context manager |

### 解決方案

```python
# 減小規模
config = GPLoopConfig(
    population_size=30,
    top_n=3
)

# 使用 context manager（自動清理）
with GPLoop(config) as loop:
    result = loop.run(data)

# 或手動清理
loop._cleanup()
```

## 問題 9: DEAP 型別錯誤

### 症狀

```
TypeError: <lambda>() takes 1 positional argument but 2 were given
```

### 可能原因

函數簽名與原語集定義不一致。

### 解決方案

```python
# ❌ 錯誤：參數數量不匹配
def rsi(data, period):  # 2 個參數
    ...

pset.addPrimitive(rsi, [DataFrame], Indicator)  # 只定義 1 個輸入
                                                 # ^^^ 缺少 period

# ✅ 正確
pset.addPrimitive(rsi, [DataFrame, int], Indicator)
                               # ^^^ 加入 period 型別
```

## 診斷流程

```
1. 檢查日誌輸出
   ├── 是否有錯誤訊息？
   ├── Best fitness 是否改善？
   └── 是否觸發 early stopping？

2. 檢查演化統計
   ├── best_fitness_per_gen（是否上升）
   ├── avg_fitness_per_gen（是否上升）
   └── diversity_per_gen（是否合理）

3. 檢查策略邏輯
   ├── 印出表達式（converter.to_python）
   ├── 檢查是否過度複雜
   └── 檢查是否有意義

4. 檢查驗證結果
   ├── OOS/IS 比率（> 0.7？）
   ├── Monte Carlo p-value（< 0.05？）
   └── Walk-Forward 是否通過

5. 調整配置
   ├── 參數調校（見 parameter-tuning.md）
   ├── 適應度調整（見 fitness-design.md）
   └── 過擬合防範（見 overfitting.md）
```

## 常用除錯技巧

### 1. 印出中間結果

```python
# 印出初始族群
for i, ind in enumerate(population[:5]):
    print(f"Individual {i}: {converter.to_python(ind)}")

# 印出每代最佳個體
for gen in range(generations):
    # 演化...

    best = max(population, key=lambda x: x.fitness.values[0])
    print(f"Gen {gen}: {best.fitness.values[0]:.4f}")
    print(f"  Expression: {converter.to_python(best)}")
```

### 2. 單步除錯

```python
# 測試單一個體
test_individual = population[0]

# 轉換
strategy = compile(test_individual)

# 生成訊號
signals = strategy.generate_signals(data)
print(f"Signals: {signals.sum()}")

# 回測
result = backtest(signals, data)
print(f"Sharpe: {result.sharpe}")
```

### 3. 視覺化演化過程

```python
import matplotlib.pyplot as plt

# 繪製 fitness 曲線
plt.plot(result.fitness_history, label='Best Fitness')
plt.plot(result.avg_fitness_history, label='Avg Fitness')
plt.xlabel('Generation')
plt.ylabel('Fitness')
plt.legend()
plt.show()
```

## 求助清單

在尋求協助前，準備以下資訊：

- [ ] GPLoopConfig 配置
- [ ] 演化統計（best_fitness_per_gen, avg_fitness_per_gen）
- [ ] 錯誤訊息（如果有）
- [ ] 最佳策略表達式
- [ ] 資料量和時間範圍
- [ ] 已嘗試的解決方案

## 參考資源

- `src/automation/gp_loop.py` - 主要實作
- `src/gp/engine.py` - 演化引擎
- [DEAP FAQ](https://deap.readthedocs.io/en/master/faq.html)
- [DEAP Google Group](https://groups.google.com/g/deap-users)
