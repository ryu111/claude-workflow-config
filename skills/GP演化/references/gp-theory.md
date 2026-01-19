# GP 演化理論

遺傳規劃（Genetic Programming）的核心理論與機制。

## 什麼是遺傳規劃？

遺傳規劃是演化計算（Evolutionary Computation）的一個分支，使用**達爾文演化論**的概念來自動生成程式碼。

### 與遺傳演算法（GA）的區別

| 特性 | 遺傳演算法（GA） | 遺傳規劃（GP） |
|------|----------------|---------------|
| **編碼** | 固定長度向量 | 可變長度樹結構 |
| **優化對象** | 參數 | 程式結構 |
| **適用場景** | 參數優化 | 策略生成 |
| **範例** | `[0.5, 0.3, 10, 20]` | `and(gt(rsi(14), 50), lt(ma(20), close))` |

**專案使用**: GP（生成策略邏輯） + Bayesian（優化參數）

## 表達式樹（Expression Tree）

GP 個體以樹狀結構表示：

```
        and
       /   \
      gt    lt
     / \   / \
   rsi 50 ma close
    |      |
   14     20
```

**對應表達式**: `and(gt(rsi(14), 50), lt(ma(20), close))`

**對應策略邏輯**: RSI(14) > 50 且 MA(20) < Close

### 節點類型

| 類型 | 說明 | 範例 |
|------|------|------|
| **函數節點（Function）** | 有子節點，執行操作 | `and`, `gt`, `rsi` |
| **終端節點（Terminal）** | 無子節點，提供值 | `close`, `50`, `14` |

## 演化運算子

### 1. 選擇（Selection）

**目的**: 選出優秀個體作為父代。

#### 專案使用：Tournament Selection（錦標賽選擇）

```
隨機選 K 個個體（tournsize=3）
    ↓
選出適應度最高的 1 個
    ↓
重複 N 次（N=族群大小）
```

**優點**:
- 計算效率高（O(K)，不需排序整個族群）
- 多樣性保留（弱個體仍有機會被選中）
- 選擇壓力可調（K 越大壓力越大）

### 2. 交叉（Crossover）

**目的**: 結合兩個父代的特徵生成子代。

#### 專案使用：單點交叉（cxOnePoint）

```
父代 1: and(gt(rsi(14), 50), lt(ma(20), close))
父代 2: or(lt(rsi(7), 30), gt(volume, avg_volume))

         ↓ 隨機選擇交叉點

子代 1: and(gt(rsi(14), 50), gt(volume, avg_volume))
子代 2: or(lt(rsi(7), 30), lt(ma(20), close))
```

**機率**: `cxpb=0.7`（70% 機率執行交叉）

### 3. 變異（Mutation）

**目的**: 引入隨機變化，增加多樣性。

#### 專案使用：均勻變異（mutUniform）

```
原個體: and(gt(rsi(14), 50), lt(ma(20), close))

         ↓ 隨機選擇變異點（如 lt）

新個體: and(gt(rsi(14), 50), gt(ma(20), close))
                              ^^
                          lt 變為 gt
```

**機率**: `mutpb=0.2`（20% 機率執行變異）

**變異方式**:
- 替換節點（`lt` → `gt`）
- 替換子樹（整段邏輯替換）
- 調整參數（`14` → `21`）

## 演化循環

```python
# 1. 初始化族群
population = toolbox.population(n=50)

for gen in range(30):
    # 2. 評估適應度
    for ind in population:
        ind.fitness.values = evaluate(ind)

    # 3. 選擇父代
    offspring = toolbox.select(population, len(population))

    # 4. 複製（避免修改原族群）
    offspring = list(map(toolbox.clone, offspring))

    # 5. 交叉
    for child1, child2 in zip(offspring[::2], offspring[1::2]):
        if random() < 0.7:  # cxpb
            toolbox.mate(child1, child2)
            del child1.fitness.values
            del child2.fitness.values

    # 6. 變異
    for mutant in offspring:
        if random() < 0.2:  # mutpb
            toolbox.mutate(mutant)
            del mutant.fitness.values

    # 7. 評估新個體
    invalid_ind = [ind for ind in offspring if not ind.fitness.valid]
    for ind in invalid_ind:
        ind.fitness.values = evaluate(ind)

    # 8. 替換族群
    population[:] = offspring

    # 9. 更新名人堂
    hall_of_fame.update(population)

    # 10. 檢查終止條件
    if no_improvement_for_10_gens:
        break
```

## 適應度函數

**定義**: `fitness = f(individual) → 單一數值（越高越好）`

### 專案實作

```python
def evaluate(individual, data):
    # 1. 轉換表達式樹為策略
    strategy = compile(individual)

    # 2. 生成訊號
    signals = strategy.generate_signals(data)

    # 3. 回測
    result = backtest(signals, data)

    # 4. 計算適應度
    fitness = (
        1.0 * result.sharpe_ratio +
        0.5 * result.total_return -
        0.3 * result.max_drawdown
    )

    return (fitness,)  # DEAP 要求 tuple
```

**關鍵設計** → see `fitness-design.md`

## 名人堂（Hall of Fame）

**目的**: 保留歷史最佳個體，防止優秀解被淘汰。

```python
hall_of_fame = tools.HallOfFame(maxsize=5)

for gen in range(30):
    # 演化...

    # 每代更新名人堂
    hall_of_fame.update(population)

# 最終輸出前 5 名
best_individuals = hall_of_fame.items
```

**特性**:
- 不參與演化（只記錄，不交叉變異）
- 按適應度排序
- 去重（相同個體只保留一個）

## 早停機制

**目的**: 避免無意義的計算（收斂後繼續演化無益）。

```python
no_improvement_gens = 0
best_fitness = -inf

for gen in range(30):
    current_best = max(ind.fitness.values[0] for ind in population)

    if current_best > best_fitness + 0.01:  # 顯著改善
        best_fitness = current_best
        no_improvement_gens = 0
    else:
        no_improvement_gens += 1

    if no_improvement_gens >= 10:  # early_stopping
        print(f"Early stopping at generation {gen}")
        break
```

## DEAP 函式庫

專案使用 DEAP（Distributed Evolutionary Algorithms in Python）實作 GP。

### 核心元件

| DEAP 元件 | 功能 | 專案對應 |
|----------|------|----------|
| `PrimitiveSetTyped` | 定義原語集 | `src/gp/primitives.py` |
| `creator.create()` | 建立適應度類型 | `src/gp/fitness.py` |
| `Toolbox` | 註冊演化運算子 | `src/gp/engine.py` |
| `algorithms.eaSimple()` | 簡單演化演算法 | 已封裝在 GPEngine |
| `HallOfFame` | 名人堂 | `result.hall_of_fame` |

### 強型別 GP（Strongly-Typed GP）

**專案使用**: `PrimitiveSetTyped`（而非 `PrimitiveSet`）

**優點**:
- 避免型別錯誤（如 `and(close, 50)` 不合法）
- 生成的表達式語意正確
- 減少無效個體

**範例**:
```python
pset = gp.PrimitiveSetTyped("main", [DataFrame], Signal)

# 定義函數（輸入/輸出型別必須匹配）
pset.addPrimitive(rsi, [DataFrame, int], Indicator)
pset.addPrimitive(gt, [Indicator, float], Signal)
```

## 研究文獻重點

### 2025-2026 最新研究

根據網路搜尋結果：

1. **Strongly-Typed GP + Sentiment Analysis**
   - 結合技術分析與情緒分析
   - 使用強型別 GP 避免無效策略
   - 顯著優於單一數據源

2. **Vectorial GP（VGP）**
   - 支援複數運算
   - 7 年以上資料驗證仍有盈利
   - 適合長期策略

3. **Multi-Objective GP**
   - 同時優化多個目標（Return、Risk、Drawdown）
   - 避免單一指標過度優化
   - 使用 NSGA-II、SPEA2 等演算法

**專案採用**: Multi-Objective 思想（fitness 整合多指標）

## 參考資源

- [DEAP Documentation](https://deap.readthedocs.io/)
- [Evolving Trading Strategies with GP](https://fabian-kostadinov.github.io/2014/09/01/evolving-trading-strategies-with-genetic-programming-an-overview/)
- [DEAP GitHub](https://github.com/DEAP/deap)
- [Strongly-Typed GP for Algorithmic Trading](https://www.sciencedirect.com/science/article/pii/S0950705125001017)
