# 演化參數調校

如何設定 GP 演化參數以達到最佳效果。

## 核心參數

| 參數 | 預設值 | 範圍 | 影響 |
|------|--------|------|------|
| `population_size` | 50 | 20-200 | 搜尋廣度 |
| `generations` | 30 | 10-100 | 搜尋深度 |
| `cxpb` | 0.7 | 0.5-0.9 | 交叉機率 |
| `mutpb` | 0.2 | 0.1-0.3 | 變異機率 |
| `tournsize` | 3 | 2-7 | 選擇壓力 |
| `early_stopping` | 10 | 5-20 | 收斂條件 |

## 族群大小（Population Size）

**定義**: 每一代有多少個體（策略）。

### 影響

| 大小 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **小（20-30）** | 演化快速 | 多樣性低，易陷入局部最優 | 快速原型 |
| **中（50-100）** | 平衡 | - | **推薦（預設）** |
| **大（150-200）** | 多樣性高 | 計算量大，收斂慢 | 複雜問題 |

### 調校建議

```python
# 問題簡單（原語集小）
population_size = 30

# 一般場景
population_size = 50

# 問題複雜（原語集大、搜尋空間大）
population_size = 100
```

### 經驗法則

```
population_size ≈ 5-10 × sqrt(primitive_set_size)
```

**範例**:
- 原語集 10 個 → 族群 30-50
- 原語集 30 個 → 族群 50-100

## 演化代數（Generations）

**定義**: 演化迭代次數。

### 影響

| 代數 | 收斂速度 | 過擬合風險 | 計算量 |
|------|---------|-----------|--------|
| **少（10-20）** | 快 | 低 | 小 |
| **中（30-50）** | 中等 | 中等 | **推薦** |
| **多（100+）** | 慢 | 高 | 大 |

### 調校建議

```python
# 快速探索
generations = 20
early_stopping = 5

# 一般場景
generations = 30
early_stopping = 10

# 深度優化（需搭配嚴格驗證）
generations = 50
early_stopping = 15
```

### 監控收斂

```python
# 觀察 best_fitness_per_gen
if best_fitness 連續 10 代無改善 > 0.01:
    # 已收斂，增加代數無益
    print("Early stopping triggered")
```

**專案已實作**: `early_stopping` 自動停止。

## 交叉機率（cxpb）

**定義**: 兩個父代執行交叉的機率。

### 影響

| 機率 | 探索能力 | 利用能力 | 適用場景 |
|------|---------|---------|----------|
| **低（0.5）** | 低 | 高（保留優秀個體） | 已接近最優解 |
| **中（0.7）** | 平衡 | 平衡 | **推薦** |
| **高（0.9）** | 高（快速混合） | 低（破壞優秀個體） | 初期探索 |

### 調校建議

```python
# 一般推薦
cxpb = 0.7

# 保守（已有好策略，微調）
cxpb = 0.5

# 激進（全新問題，廣泛搜尋）
cxpb = 0.9
```

**經驗法則**: `cxpb + mutpb ≈ 0.9`（總變化機率）

## 變異機率（mutpb）

**定義**: 個體發生變異的機率。

### 影響

| 機率 | 多樣性 | 穩定性 | 適用場景 |
|------|--------|--------|----------|
| **低（0.1）** | 低 | 高 | 精煉階段 |
| **中（0.2）** | 平衡 | 平衡 | **推薦** |
| **高（0.3）** | 高 | 低（易破壞） | 初期探索 |

### 調校建議

```python
# 一般推薦
mutpb = 0.2

# 已接近最優（降低變異）
mutpb = 0.1

# 族群多樣性不足（增加變異）
mutpb = 0.3
```

## 錦標賽大小（Tournament Size）

**定義**: 選擇時隨機挑選幾個個體競爭。

### 影響

| 大小 | 選擇壓力 | 多樣性 | 收斂速度 |
|------|---------|--------|----------|
| **小（2）** | 低 | 高（弱個體也有機會） | 慢 |
| **中（3-5）** | 中等 | 中等 | **推薦** |
| **大（7+）** | 高（強者恆強） | 低 | 快（但易陷局部最優） |

### 調校建議

```python
# 平衡選擇
tournsize = 3

# 增加多樣性（避免過早收斂）
tournsize = 2

# 加速收斂（已找到好區域）
tournsize = 5
```

**專案預設**: `tournsize = 3`（DEAP 預設）

## 早停代數（Early Stopping）

**定義**: 連續多少代無進步則停止。

### 影響

| 代數 | 計算量 | 過擬合風險 |
|------|--------|-----------|
| **少（5）** | 低（早停） | 低 |
| **中（10）** | 中等 | **推薦** |
| **多（20）** | 高（晚停） | 高 |

### 調校建議

```python
# 快速測試
early_stopping = 5

# 一般場景
early_stopping = 10

# 確保充分演化
early_stopping = 15
```

**改善閾值**: 專案使用 `0.01`（適應度改善 > 0.01 視為進步）

## 適應度權重

**定義**: 多目標適應度的權重配置。

### 場景導向配置

```python
# 平衡型（預設）
fitness_weights = (1.0, 0.5, -0.3)
# Sharpe 主導，Return 次要，DrawDown 懲罰

# 高報酬型（探索階段）
fitness_weights = (0.5, 1.5, -0.2)
# 追求收益，容忍風險

# 穩健型（實盤前精煉）
fitness_weights = (1.2, 0.3, -0.8)
# 嚴格控制回撤
```

詳細設計 → see `fitness-design.md`

## 樹深度限制

**定義**: 個體表達式樹的最大層數。

### 影響

| 深度 | 策略複雜度 | 過擬合風險 | 計算量 |
|------|-----------|-----------|--------|
| **淺（2-3）** | 低 | 低 | 小 |
| **中（4-5）** | 中等 | 中等 | **推薦** |
| **深（6+）** | 高 | 高 | 大 |

### 調校建議

```python
# 初始化深度範圍
toolbox.register("expr", gp.genHalfAndHalf, pset=pset, min_=1, max_=4)

# 變異深度限制
toolbox.decorate("mutate", gp.staticLimit(key=operator.attrgetter('height'), max_value=5))
```

**專案預設**: `max_=4`（DEAP 預設）

## 調校流程

### 1. 基線測試

```python
# 使用預設值
config = GPLoopConfig(
    population_size=50,
    generations=30,
    early_stopping=10
)

result = gp_loop.run(data)
baseline_fitness = result.best_fitness
```

### 2. 參數掃描

```python
# 測試不同 population_size
for pop_size in [30, 50, 100]:
    config.population_size = pop_size
    result = gp_loop.run(data)
    print(f"pop={pop_size}, fitness={result.best_fitness}")
```

### 3. 監控指標

| 指標 | 理想狀態 | 調整方向 |
|------|---------|---------|
| **Best Fitness** | 逐代上升 | - |
| **Avg Fitness** | 逐代上升 | - |
| **Diversity** | 早期高、後期降低 | - |
| **Premature Convergence** | 無（early_stopping > 5） | 增加 population_size 或 mutpb |
| **Slow Convergence** | 無（< 30 代收斂） | 減小 population_size 或增加 tournsize |

### 4. 迭代調整

```
觀察問題 → 調整參數 → 重新演化 → 比較結果 → 迭代
```

## 常見場景配置

### 場景 1：快速原型（< 5 分鐘）

```python
config = GPLoopConfig(
    population_size=30,
    generations=20,
    early_stopping=5,
    primitive_set='minimal'  # 使用簡化原語集
)
```

### 場景 2：一般開發（10-30 分鐘）

```python
config = GPLoopConfig(
    population_size=50,
    generations=30,
    early_stopping=10,
    primitive_set='standard'
)
```

### 場景 3：深度探索（1-3 小時）

```python
config = GPLoopConfig(
    population_size=100,
    generations=50,
    early_stopping=15,
    primitive_set='standard'
)
```

### 場景 4：多標的通用策略

```python
# 增加資料多樣性 → 需要更大族群
config = GPLoopConfig(
    population_size=150,
    generations=50,
    early_stopping=20
)

# 使用多標的資料
data = combine(['BTCUSDT', 'ETHUSDT', 'BNBUSDT'])
result = gp_loop.run(data)
```

## 進階技巧

### 1. 漸進式調參

```python
# 階段 1: 廣泛探索
config_1 = GPLoopConfig(
    population_size=100,
    cxpb=0.9,
    mutpb=0.3,
    generations=20
)

# 階段 2: 精煉優化（使用階段 1 最佳個體初始化）
config_2 = GPLoopConfig(
    population_size=50,
    cxpb=0.5,
    mutpb=0.1,
    generations=20
)
```

**專案未實作**: 可作為未來增強。

### 2. 自適應參數

```python
# 根據多樣性動態調整變異率
if diversity < 0.3:  # 多樣性過低
    mutpb = 0.3  # 增加變異
else:
    mutpb = 0.2
```

**專案未實作**: DEAP 支援，可擴展。

### 3. 島嶼模型（Island Model）

```python
# 多個獨立族群並行演化，定期交換個體
islands = [
    GPLoop(config_1),  # 激進配置
    GPLoop(config_2),  # 保守配置
    GPLoop(config_3),  # 平衡配置
]

# 每 10 代交換最佳個體
for gen in range(50):
    for island in islands:
        island.evolve_one_gen()

    if gen % 10 == 0:
        exchange_best(islands)
```

**專案未實作**: 複雜度高，未來可考慮。

## 效能優化

### 1. 減少評估次數

```python
# 使用較小的回測資料集（但需注意過擬合）
data_subset = data[-1000:]  # 只用最近 1000 筆
```

### 2. 並行化（DEAP 支援）

```python
from multiprocessing import Pool

# 並行評估適應度
pool = Pool(processes=4)
toolbox.register("map", pool.map)
```

**專案未實作**: Metal Engine 已優化，暫不需要。

## 檢查清單

調參前：
- [ ] 基線效能已測試
- [ ] 監控指標已準備（best_fitness, avg_fitness, diversity）
- [ ] 驗證資料已分割（避免過擬合）

調參中：
- [ ] 記錄每次實驗配置和結果
- [ ] 觀察收斂曲線（是否過早/過晚收斂）
- [ ] 檢查多樣性（是否過早趨同）

調參後：
- [ ] 最佳配置已文檔化
- [ ] 樣本外驗證通過
- [ ] 策略邏輯可解釋

## 參考資源

- [DEAP Parameters Guide](https://deap.readthedocs.io/en/master/tutorials/basic/part1.html)
- [GP Parameter Tuning Best Practices](https://fabian-kostadinov.github.io/)
- 專案實作: `src/automation/gp_loop.py` → `GPLoopConfig`
