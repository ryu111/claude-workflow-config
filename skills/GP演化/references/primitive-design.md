# 原語集設計

定義 GP 可用的「積木」：函數（Functions）和終端（Terminals）。

## 什麼是原語集？

原語集（Primitive Set）定義了 GP 演化可以使用的：
- **函數節點**: 操作（如 `and`, `gt`, `rsi`）
- **終端節點**: 輸入值（如 `close`, `50`, `14`）

**類比**: 原語集 = 樂高積木，GP 演化 = 用積木拼出不同模型。

## 專案實作

檔案: `src/gp/primitives.py`

### 兩種預設原語集

| 類型 | 函數數量 | 終端數量 | 適用場景 |
|------|---------|---------|----------|
| **Standard** | ~20 | ~15 | 一般使用（預設） |
| **Minimal** | ~10 | ~8 | 快速測試、資源受限 |

### Standard 原語集範例

```python
class PrimitiveSetFactory:
    def create_standard_set(self):
        pset = gp.PrimitiveSetTyped("main", [DataFrame], Signal)

        # === 技術指標 ===
        pset.addPrimitive(rsi, [DataFrame, int], Indicator)
        pset.addPrimitive(ma, [DataFrame, int], Indicator)
        pset.addPrimitive(ema, [DataFrame, int], Indicator)
        pset.addPrimitive(bbands, [DataFrame, int], BBands)

        # === 比較運算 ===
        pset.addPrimitive(gt, [Indicator, float], Signal)
        pset.addPrimitive(lt, [Indicator, float], Signal)

        # === 邏輯運算 ===
        pset.addPrimitive(and_, [Signal, Signal], Signal)
        pset.addPrimitive(or_, [Signal, Signal], Signal)

        # === 終端 ===
        pset.addEphemeralConstant("rand_int", lambda: random.randint(5, 50), int)
        pset.addEphemeralConstant("rand_float", lambda: random.uniform(0.0, 100.0), float)

        return pset
```

## 強型別系統

專案使用 `PrimitiveSetTyped`（強型別），而非 `PrimitiveSet`（弱型別）。

### 型別定義

```python
from typing import TypeVar

DataFrame = TypeVar('DataFrame')  # OHLCV 資料
Indicator = TypeVar('Indicator')  # 指標值（Series）
BBands = TypeVar('BBands')        # 布林通道（3 條線）
Signal = TypeVar('Signal')        # 交易訊號（買/賣/持有）
```

### 型別約束範例

```python
# ✅ 合法：型別匹配
and_(gt(rsi(data, 14), 50), lt(ma(data, 20), close))

# ❌ 不合法：rsi 輸出 Indicator，and_ 需要 Signal
and_(rsi(data, 14), ma(data, 20))

# ❌ 不合法：gt 第二參數需要 float，不能是 Indicator
gt(rsi(data, 14), ma(data, 20))
```

**優點**:
- 自動過濾無效表達式
- 減少無意義評估
- 生成的策略語意正確

## 函數節點設計

### 1. 技術指標

| 函數 | 簽名 | 說明 |
|------|------|------|
| `rsi` | `(DataFrame, int) → Indicator` | 相對強弱指標 |
| `ma` | `(DataFrame, int) → Indicator` | 移動平均 |
| `ema` | `(DataFrame, int) → Indicator` | 指數移動平均 |
| `bbands` | `(DataFrame, int) → BBands` | 布林通道 |
| `atr` | `(DataFrame, int) → Indicator` | 真實波幅 |
| `volume` | `(DataFrame) → Indicator` | 成交量 |

**設計原則**:
- 參數化（如週期 `int`）→ GP 可演化最佳參數
- 返回型別統一（`Indicator`）→ 可組合使用

### 2. 價格取值

| 函數 | 簽名 | 說明 |
|------|------|------|
| `close` | `(DataFrame) → Indicator` | 收盤價 |
| `open` | `(DataFrame) → Indicator` | 開盤價 |
| `high` | `(DataFrame) → Indicator` | 最高價 |
| `low` | `(DataFrame) → Indicator` | 最低價 |

### 3. 比較運算

| 函數 | 簽名 | 說明 |
|------|------|------|
| `gt` | `(Indicator, float) → Signal` | 大於 |
| `lt` | `(Indicator, float) → Signal` | 小於 |
| `between` | `(Indicator, float, float) → Signal` | 介於區間 |

### 4. 邏輯運算

| 函數 | 簽名 | 說明 |
|------|------|------|
| `and_` | `(Signal, Signal) → Signal` | 且 |
| `or_` | `(Signal, Signal) → Signal` | 或 |
| `not_` | `(Signal) → Signal` | 非 |

### 5. 進階運算（Minimal 未包含）

| 函數 | 簽名 | 說明 |
|------|------|------|
| `cross_above` | `(Indicator, Indicator) → Signal` | 黃金交叉 |
| `cross_below` | `(Indicator, Indicator) → Signal` | 死亡交叉 |
| `highest` | `(Indicator, int) → float` | N 日最高 |
| `lowest` | `(Indicator, int) → float` | N 日最低 |

## 終端節點設計

### 1. 臨時常數（Ephemeral Constants）

```python
# 隨機整數（5-50）
pset.addEphemeralConstant("rand_int", lambda: random.randint(5, 50), int)

# 隨機浮點數（0.0-100.0）
pset.addEphemeralConstant("rand_float", lambda: random.uniform(0.0, 100.0), float)
```

**特性**:
- 每次初始化時生成**不同值**
- 演化過程中值**固定**（不再變化）
- 用於參數探索（如 RSI 週期）

**範例**:
```
個體 A: rsi(data, 14)  → rand_int() 生成 14
個體 B: rsi(data, 21)  → rand_int() 生成 21
```

### 2. 固定常數

```python
# 常用閾值
pset.addTerminal(30, float, "threshold_30")
pset.addTerminal(70, float, "threshold_70")
pset.addTerminal(50, float, "threshold_50")
```

**適用**: 已知有意義的值（如 RSI 超買/超賣線 30/70）。

## 設計原則

### 1. 最小但完備（Minimal but Complete）

**目標**: 用最少的原語，生成最多樣的策略。

| 原語集大小 | 優點 | 缺點 |
|-----------|------|------|
| **過小** | 演化快速 | 策略多樣性低 |
| **過大** | 策略多樣性高 | 搜尋空間爆炸、演化緩慢 |
| **適中** | 平衡 | 需要領域知識設計 |

**經驗法則**: 10-20 個函數 + 8-15 個終端。

### 2. 封閉性（Closure）

**定義**: 任意函數的輸出，都可作為其他函數的輸入。

```python
# ✅ 封閉性良好
gt(rsi(data, 14), 50)  # rsi 輸出 → gt 輸入

# ❌ 封閉性破壞（若 rsi 返回 tuple）
gt(rsi(data, 14), 50)  # 型別不匹配
```

**強型別 GP** 自動保證封閉性。

### 3. 充分性（Sufficiency）

**定義**: 原語集足以表達目標策略。

**檢查**:
- 缺少關鍵指標？（如無 RSI 但需要動量策略）
- 缺少邏輯運算？（如無 `and` 無法組合條件）

**專案範例**: Standard 原語集涵蓋趨勢、動量、波動、成交量。

### 4. 可解釋性

**偏好**: 使用領域熟悉的運算（`rsi`, `ma`），而非抽象數學（`sin`, `cos`）。

```python
# ✅ 可解釋
and_(gt(rsi(14), 70), lt(ma(20), close))
# → "RSI 超買且價格在均線上方"

# ❌ 難解釋
sin(add(mul(close, 0.5), 100))
# → "???"
```

## Standard vs Minimal 比較

| 特性 | Standard | Minimal |
|------|----------|---------|
| **指標** | RSI, MA, EMA, BBands, ATR, Volume | RSI, MA |
| **邏輯** | AND, OR, NOT | AND, OR |
| **比較** | GT, LT, Between | GT, LT |
| **進階** | Cross Above/Below, Highest/Lowest | 無 |
| **演化速度** | 中等 | 快 |
| **策略多樣性** | 高 | 中等 |
| **適用場景** | 生產環境 | 快速原型、除錯 |

## 自定義原語集

### 範例：趨勢專用原語集

```python
def create_trend_set():
    pset = gp.PrimitiveSetTyped("trend", [DataFrame], Signal)

    # 趨勢指標
    pset.addPrimitive(ma, [DataFrame, int], Indicator)
    pset.addPrimitive(ema, [DataFrame, int], Indicator)
    pset.addPrimitive(macd, [DataFrame], MACD)
    pset.addPrimitive(adx, [DataFrame, int], Indicator)

    # 趨勢專用邏輯
    pset.addPrimitive(cross_above, [Indicator, Indicator], Signal)
    pset.addPrimitive(cross_below, [Indicator, Indicator], Signal)

    # 終端
    pset.addEphemeralConstant("period", lambda: random.randint(10, 100), int)

    return pset
```

**適用**: 已知策略類型時，縮小搜尋空間。

## 常見問題

### Q1: 如何避免過度複雜的策略？

**方法 1**: 限制樹深度

```python
toolbox.register("expr", gp.genHalfAndHalf, pset=pset, min_=1, max_=3)
# max_=3 → 最多 3 層深
```

**方法 2**: 複雜度懲罰（見 `fitness-design.md`）

### Q2: 如何新增自定義指標？

```python
def custom_indicator(data: DataFrame, period: int) -> Indicator:
    """自定義指標"""
    # 計算邏輯...
    return result

# 註冊到原語集
pset.addPrimitive(custom_indicator, [DataFrame, int], Indicator)
```

### Q3: 為什麼演化的策略都很相似？

**原因**: 原語集過小，搜尋空間不足。

**解決**: 增加原語（但不要過多）。

## 實務建議

1. **初期**: 使用 Minimal 快速驗證
2. **開發**: 使用 Standard 完整探索
3. **優化**: 根據結果調整原語集（移除無用、新增需要）
4. **生產**: 鎖定有效原語集，避免頻繁變動

## 參考資源

- `src/gp/primitives.py` - 專案實作
- [DEAP Primitives Documentation](https://deap.readthedocs.io/en/master/tutorials/advanced/gp.html)
- [Strongly-Typed GP for Trading](https://www.sciencedirect.com/science/article/pii/S0950705125001017)
