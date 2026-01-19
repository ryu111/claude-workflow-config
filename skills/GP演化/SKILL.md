---
name: gp-evolution
description: 遺傳規劃（Genetic Programming）策略演化知識。當需要演化新策略、理解 GP 演化流程、設計適應度函數、分析演化結果時觸發。關鍵字：演化、GP、Genetic Programming、遺傳規劃、策略生成
---

# GP 演化（Genetic Programming Evolution）

使用遺傳規劃（GP）自動演化交易策略的完整指南。

## 核心概念

| 概念 | 說明 | 專案對應 |
|------|------|----------|
| **個體（Individual）** | 單一策略的表達式樹 | DEAP Individual |
| **族群（Population）** | 一代中所有個體的集合 | `population_size=50` |
| **適應度（Fitness）** | 個體表現的評分（越高越好） | Sharpe Ratio + Return - DrawDown |
| **選擇（Selection）** | 選出優秀個體作為父代 | Tournament Selection |
| **交叉（Crossover）** | 交換兩個父代的子樹生成子代 | `cxOnePoint` |
| **變異（Mutation）** | 隨機修改個體的節點 | `mutUniform` |
| **名人堂（Hall of Fame）** | 保留歷史最佳個體 | `top_n=5` |

## 演化流程

```
初始化族群（隨機生成 N 個策略）
    ↓
評估適應度（回測每個策略）
    ↓
選擇（選出表現好的策略）
    ↓
交叉 + 變異（生成新策略）
    ↓
替換（新策略取代舊族群）
    ↓
是否達到終止條件？
    ├── 否 → 返回「評估適應度」
    └── 是 → 輸出最佳策略
```

**終止條件**：
- 達到最大代數（`generations=30`）
- 早停（`early_stopping=10` 代無進步）

## 快速參考

### 專案實作位置

| 元件 | 檔案 | 功能 |
|------|------|------|
| **GP 引擎** | `src/gp/engine.py` | 演化核心（DEAP 封裝） |
| **原語集** | `src/gp/primitives.py` | 定義可用的函數和終端 |
| **適應度** | `src/gp/fitness.py` | 評估策略表現 |
| **表達式轉換** | `src/gp/converter.py` | GP 樹 → Python 策略 |
| **GP Loop** | `src/automation/gp_loop.py` | 完整演化循環 |
| **GP 整合** | `src/automation/gp_integration.py` | UltimateLoop 整合介面 |

### 使用範例

#### 方式 1：使用 GPLoop（獨立演化）

```python
from src.automation.gp_loop import GPLoop, GPLoopConfig

config = GPLoopConfig(
    symbol='BTCUSDT',
    timeframe='4h',
    population_size=50,
    generations=30,
    generate_top_n=5
)

with GPLoop(config) as loop:
    result = loop.run()

    # 生成策略檔案
    loop.generate_strategies()

    print(f"最佳適應度: {result.best_fitness:.4f}")
    print(f"演化代數: {result.generations_run}")
```

#### 方式 2：使用 GPExplorer（整合到 UltimateLoop）

```python
from src.automation.gp_integration import (
    GPExplorer,
    GPExplorationRequest
)

explorer = GPExplorer()

request = GPExplorationRequest(
    symbol='BTCUSDT',
    timeframe='4h',
    population_size=100,
    generations=50,
    top_n=3
)

result = explorer.explore(request, data=ohlcv_df)

if result.success:
    for strategy_info in result.strategies:
        print(f"{strategy_info.name}: {strategy_info.fitness:.4f}")
        print(f"  Expression: {strategy_info.expression}")
```

### 關鍵參數

| 參數 | 建議值 | 說明 |
|------|--------|------|
| `population_size` | 50-100 | 太小收斂慢，太大計算量大 |
| `generations` | 30-50 | 通常 30 代已足夠收斂 |
| `early_stopping` | 10 | 10 代無進步則停止 |
| `top_n` | 3-5 | 保留最佳策略數量 |
| `fitness_weights` | (1.0, 0.5, -0.3) | (Sharpe, Return, DrawDown) |

## 進階主題

For **GP 詳細原理** → see `references/gp-theory.md`
For **適應度函數設計** → see `references/fitness-design.md`
For **原語集設計** → see `references/primitive-design.md`
For **演化參數調校** → see `references/parameter-tuning.md`
For **過擬合防範** → see `references/overfitting.md`

## 常見問題

### Q1: 演化的策略表現不佳？

**可能原因**：
- 適應度函數設計不當（過度優化單一指標）
- 資料不足或品質差
- 原語集過於簡單或複雜
- 族群多樣性不足

**解決方案** → see `references/troubleshooting.md`

### Q2: 演化時間過長？

**優化方法**：
- 減少 `population_size` 或 `generations`
- 使用 `early_stopping`
- 減少回測資料量（但需注意過擬合）
- 使用更簡單的原語集（`primitive_set='minimal'`）

### Q3: 如何避免過擬合？

**最佳實踐** → see `references/overfitting.md`

## 演化監控

### 判斷演化是否成功

| 指標 | 理想狀態 | 警訊 |
|------|----------|------|
| **Best Fitness** | 逐代上升 | 停滯或下降 |
| **Avg Fitness** | 逐代上升 | 無變化 |
| **Diversity** | 早期高，後期降低 | 過早收斂（早期就很低） |

### 演化統計（evolution_stats）

```python
result.evolution_stats = {
    'best_fitness_per_gen': [1.2, 1.5, 1.8, 2.1, 2.3],
    'avg_fitness_per_gen': [0.8, 1.0, 1.2, 1.4, 1.5],
    'diversity_per_gen': [0.95, 0.90, 0.85, 0.80, 0.75],
    'total_evaluations': 250,
    'stopped_early': False
}
```

**解讀**：
- `best_fitness_per_gen`: 每代最佳適應度（應該上升）
- `avg_fitness_per_gen`: 每代平均適應度（族群整體改善）
- `diversity_per_gen`: 多樣性（早期高、後期降低為正常）
- `stopped_early`: 是否早停（True=收斂，False=跑完全部代數）

## 與其他 Skills 的整合

| 相關 Skill | 關係 |
|-----------|------|
| **策略開發** | GP 生成的策略需要策略開發知識驗證 |
| **參數優化** | GP 產出無參數策略，不需參數優化 |
| **策略驗證** | GP 策略必須通過 5 階段驗證 |
| **回測核心** | GP 使用回測引擎評估適應度 |
| **學習系統** | 演化結果記錄到 insights.md |

## Checklist

演化前檢查：
- [ ] 資料品質已驗證（≥ 100 筆資料點）
- [ ] 適應度函數設計合理（多目標平衡）
- [ ] 族群大小與代數設定適當
- [ ] 早停機制已啟用

演化後檢查：
- [ ] Best fitness 有明顯提升
- [ ] 最佳策略已通過回測驗證
- [ ] 策略複雜度合理（不過度複雜）
- [ ] 演化結果已記錄到學習系統
