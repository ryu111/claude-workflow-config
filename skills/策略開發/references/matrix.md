# 策略生成矩陣

> 系統化組合所有元素，產生最大策略變化

## 組合維度

```
策略 = 進場維度 × 出場維度 × 風控維度 × 週期維度

每個維度有多個選項，組合起來產生大量策略變體
```

---

## 維度 1：進場訊號

### 進場元素庫

| 類別 | 元素 | 代碼 |
|------|------|------|
| **趨勢指標** | MA 交叉 | E-T1 |
| | MACD 交叉 | E-T2 |
| | ADX 趨勢確認 | E-T3 |
| **動量指標** | RSI 超賣/超買 | E-M1 |
| | Stochastic 交叉 | E-M2 |
| | CCI 超買超賣 | E-M3 |
| **波動指標** | BB 觸軌 | E-V1 |
| | KC 突破 | E-V2 |
| | ATR 突破 | E-V3 |
| **結構** | 支撐阻力反彈 | E-S1 |
| | 趨勢線突破 | E-S2 |
| | 形態完成 | E-S3 |
| **SMC** | Order Block | E-C1 |
| | FVG 回補 | E-C2 |
| | Liquidity Sweep | E-C3 |
| | ChoCH/BOS | E-C4 |

### 進場組合邏輯

```python
# 單一進場
entry = E_M1  # 只用 RSI

# AND 組合（過濾器）
entry = E_T1 & E_M1  # MA 交叉 且 RSI 超賣

# OR 組合（多訊號源）
entry = E_M1 | E_S1  # RSI 超賣 或 支撐反彈

# 確認序列
entry = E_S1.shift(1) & E_M1  # 先到支撐，再 RSI 確認
```

---

## 維度 2：出場訊號

### 出場元素庫

| 類別 | 元素 | 代碼 |
|------|------|------|
| **反向訊號** | 進場反向 | X-R1 |
| | 指標反轉 | X-R2 |
| **目標** | 固定風報比 | X-T1 |
| | 結構目標 | X-T2 |
| | ATR 目標 | X-T3 |
| **停損** | 固定% | X-S1 |
| | ATR 倍數 | X-S2 |
| | 結構止損 | X-S3 |
| **追蹤** | 固定追蹤 | X-L1 |
| | ATR 追蹤 | X-L2 |
| | 結構追蹤 | X-L3 |
| **時間** | 固定持有期 | X-I1 |
| | 收盤出場 | X-I2 |

### 出場組合邏輯

```python
# 止盈 + 止損
exit = X_T1 | X_S2  # 達到目標 或 觸及止損

# 追蹤停損（動態）
exit = X_L2  # ATR 追蹤停損

# 混合出場
exit = X_R1 | X_T1 | X_S2  # 反向訊號/目標/止損 任一觸發
```

---

## 維度 3：風控模式

### 風控元素庫

| 類別 | 元素 | 代碼 |
|------|------|------|
| **部位大小** | 固定風險% | R-P1 |
| | 波動度調整 | R-P2 |
| | 凱利準則 | R-P3 |
| | 權益曲線縮放 | R-P4 |
| **止損類型** | 靜態 | R-S1 |
| | 動態 ATR | R-S2 |
| | 結構 | R-S3 |
| **槓桿** | 固定 | R-L1 |
| | 波動度反向 | R-L2 |
| | 分階段 | R-L3 |
| **帳戶保護** | 日損失上限 | R-A1 |
| | 最大回撤熔斷 | R-A2 |
| | 連虧縮減 | R-A3 |

---

## 維度 4：時間週期

### 週期組合

| 模式 | HTF | LTF | 代碼 |
|------|-----|-----|------|
| 單週期 | - | 1H | T-1 |
| 雙週期 | 4H | 1H | T-2 |
| 三週期 | 1D | 4H | T-3 |
| 極短線 | 1H | 15M | T-4 |
| 波段 | 1D | 4H | T-5 |

---

## 策略生成矩陣

### 完整公式

```
策略變體 = Σ(Entry組合) × Σ(Exit組合) × Σ(Risk模式) × Σ(Time週期)
```

### 變體數量估算

```
進場組合：15個元素，取2-3個 ≈ 100+ 種
出場組合：11個元素，取2-3個 ≈ 50+ 種
風控模式：12個元素，取2-3個 ≈ 30+ 種
時間週期：5 種

總變體：100 × 50 × 30 × 5 = 750,000+ 種理論組合
```

### 有效組合過濾

並非所有組合都有意義，需過濾：

```python
def is_valid_combination(entry, exit, risk, time):
    """
    過濾無效組合

    規則：
    1. 進場和出場邏輯一致（趨勢配趨勢）
    2. 風控與波動度匹配
    3. 時間週期與策略類型匹配
    """
    # 趨勢進場配追蹤出場
    if entry.type == 'trend' and exit.type == 'fixed_target':
        return False  # 趨勢策略不該用固定目標

    # 均值回歸配固定目標
    if entry.type == 'mean_reversion' and exit.type == 'trailing':
        return False  # 均值回歸不該用追蹤停損

    return True
```

---

## 策略模板庫

### 模板 1：基礎趨勢

```python
TREND_BASIC = {
    'entry': ['E-T1'],           # MA 交叉
    'exit': ['X-R1', 'X-S2'],    # 反向訊號 + ATR 止損
    'risk': ['R-P1', 'R-S2'],    # 固定風險 + ATR 止損
    'time': 'T-1',               # 單週期
}
```

### 模板 2：MTF 動量

```python
MTF_MOMENTUM = {
    'entry': ['E-T3', 'E-M1'],   # ADX 趨勢 + RSI
    'exit': ['X-L2', 'X-S2'],    # ATR 追蹤
    'risk': ['R-P2', 'R-S2'],    # 波動度調整
    'time': 'T-2',               # 雙週期 4H/1H
}
```

### 模板 3：結構交易

```python
STRUCTURE = {
    'entry': ['E-S1', 'E-M1'],   # 支撐 + RSI 確認
    'exit': ['X-T2', 'X-S3'],    # 結構目標 + 結構止損
    'risk': ['R-P1', 'R-S3'],    # 固定風險 + 結構止損
    'time': 'T-2',               # 雙週期
}
```

### 模板 4：SMC 策略

```python
SMC_STRATEGY = {
    'entry': ['E-C4', 'E-C1', 'E-C3'],  # ChoCH + OB + Sweep
    'exit': ['X-T2', 'X-S3'],           # 結構目標/止損
    'risk': ['R-P2', 'R-L2'],           # 波動度調整
    'time': 'T-2',                      # 雙週期
}
```

### 模板 5：全方位

```python
COMPREHENSIVE = {
    'entry': ['E-T3', 'E-S1', 'E-C1', 'E-M1'],  # 趨勢+結構+OB+動量
    'exit': ['X-L2', 'X-T2', 'X-S3'],           # 追蹤+結構
    'risk': ['R-P2', 'R-S2', 'R-A2'],           # 波動度+回撤保護
    'time': 'T-3',                              # 三週期
}
```

---

## 策略變體生成器

```python
class StrategyGenerator:
    """
    策略變體生成器

    系統化產生策略組合
    """

    def __init__(self):
        self.entry_elements = ['E-T1', 'E-T2', 'E-M1', 'E-S1', 'E-C1', ...]
        self.exit_elements = ['X-R1', 'X-T1', 'X-S2', 'X-L2', ...]
        self.risk_elements = ['R-P1', 'R-P2', 'R-S2', 'R-L2', ...]
        self.time_modes = ['T-1', 'T-2', 'T-3']

    def generate_variants(
        self,
        base_template: dict,
        variations: dict
    ) -> list:
        """
        基於模板生成變體

        Args:
            base_template: 基礎模板
            variations: 要變化的維度

        Returns:
            list of strategy variants
        """
        variants = []

        # 例：變化進場指標
        if 'entry' in variations:
            for alt_entry in variations['entry']:
                variant = base_template.copy()
                variant['entry'] = alt_entry
                variants.append(variant)

        return variants

    def generate_grid(self) -> list:
        """
        生成網格搜索的策略組合

        用於系統性測試
        """
        from itertools import product, combinations

        # 每個維度取代表性元素
        entry_options = [
            ['E-T1'],           # 純趨勢
            ['E-M1'],           # 純動量
            ['E-S1'],           # 純結構
            ['E-T1', 'E-M1'],   # 趨勢+動量
            ['E-S1', 'E-C1'],   # 結構+SMC
        ]

        exit_options = [
            ['X-R1', 'X-S2'],   # 反向+止損
            ['X-L2', 'X-S2'],   # 追蹤+止損
            ['X-T1', 'X-S2'],   # 固定目標+止損
        ]

        risk_options = [
            ['R-P1', 'R-S1'],   # 靜態
            ['R-P2', 'R-S2'],   # 動態
            ['R-P1', 'R-S2'],   # 混合
        ]

        # 生成所有組合
        all_combinations = product(
            entry_options,
            exit_options,
            risk_options,
            self.time_modes
        )

        strategies = []
        for entry, exit, risk, time in all_combinations:
            strategies.append({
                'entry': entry,
                'exit': exit,
                'risk': risk,
                'time': time,
            })

        return strategies  # 5 × 3 × 3 × 3 = 135 種組合
```

---

## 變體探索流程

```
1. 選擇基礎模板（5 種）
     ↓
2. 選擇變化維度
   ├── 進場變體：替換/增加進場元素
   ├── 出場變體：調整出場邏輯
   ├── 風控變體：切換風控模式
   └── 週期變體：調整時間框架
     ↓
3. 生成策略組合
     ↓
4. 回測篩選
     ↓
5. 驗證最佳組合
```

---

## 實用組合建議

### 初學者路徑

```
Week 1: 單一進場 + 固定出場 + 靜態風控
        E-M1 + (X-T1, X-S1) + R-P1 + T-1

Week 2: 加入趨勢過濾
        (E-T3, E-M1) + (X-T1, X-S1) + R-P1 + T-1

Week 3: 升級動態風控
        (E-T3, E-M1) + (X-L2, X-S2) + R-P2 + T-1

Week 4: 加入多週期
        (E-T3, E-M1) + (X-L2, X-S2) + R-P2 + T-2
```

### 進階探索

```
基礎策略穩定後：

1. 探索結構進場
   替換 E-M1 → E-S1, E-C1

2. 探索 SMC 進場
   添加 E-C1, E-C2, E-C3, E-C4

3. 探索混合風控
   R-P1 + R-S2 + R-A2（靜態基礎+動態調整+帳戶保護）

4. 探索三週期
   T-2 → T-3
```

---

## 組合效果矩陣

| 進場類型 | 最佳出場 | 最佳風控 | 最佳週期 |
|----------|----------|----------|----------|
| 趨勢 | 追蹤停損 | 波動度調整 | 雙週期+ |
| 動量 | 固定目標 | 固定風險 | 單/雙週期 |
| 結構 | 結構目標 | 結構止損 | 雙週期 |
| SMC | 結構目標 | 動態混合 | 雙週期 |

這個矩陣幫助快速找到合理的組合起點。
