# 核心策略組合

> 任何策略的基本組成元素

## 策略三要素

```
┌─────────────────────────────────────────────────────────┐
│                    交易策略                              │
├─────────────────────────────────────────────────────────┤
│  1. 進場條件 (Entry)                                    │
│     - 何時買入/賣出？                                   │
│     - 需要滿足什麼條件？                                 │
├─────────────────────────────────────────────────────────┤
│  2. 出場條件 (Exit)                                     │
│     - 何時平倉？                                        │
│     - 止損/止盈/追蹤停損                                │
├─────────────────────────────────────────────────────────┤
│  3. 風險管理 (Risk)                                     │
│     - 每筆交易風險多少？                                 │
│     - 部位大小如何計算？                                 │
└─────────────────────────────────────────────────────────┘
```

## 進場條件設計

### 進場訊號類型

| 類型 | 說明 | 範例 |
|------|------|------|
| **交叉訊號** | 兩條線交叉 | 金叉（快線上穿慢線） |
| **閾值訊號** | 超過/低於某值 | RSI < 30（超賣） |
| **突破訊號** | 價格突破水平 | 突破阻力線 |
| **形態訊號** | 特定K線形態 | 吞噬形態 |
| **結構訊號** | 價格結構變化 | ChoCH（趨勢轉變） |

### 進場組合邏輯

```python
# AND 邏輯：所有條件都滿足
entry = condition_A & condition_B & condition_C

# OR 邏輯：任一條件滿足
entry = condition_A | condition_B

# 過濾器模式：主訊號 + 過濾條件
entry = main_signal & filter_1 & filter_2

# 確認模式：訊號 + 確認
entry = signal & (confirmation_1 | confirmation_2)
```

### 常用過濾器

| 過濾器 | 目的 | 實作方式 |
|--------|------|----------|
| **趨勢過濾** | 只在趨勢方向交易 | close > MA200 做多 |
| **波動度過濾** | 避免低波動期 | ATR > threshold |
| **時間過濾** | 避開特定時段 | 非亞盤時段 |
| **成交量過濾** | 確認量能配合 | volume > avg_volume |

## 出場條件設計

### 出場類型

| 類型 | 說明 | 優點 | 缺點 |
|------|------|------|------|
| **反向訊號** | 出現相反進場訊號 | 抓完整波段 | 可能吐回獲利 |
| **固定止盈** | 達到目標價 | 鎖定利潤 | 可能錯過大行情 |
| **追蹤停損** | 隨價格移動止損 | 兼顧兩者 | 參數敏感 |
| **時間止損** | 持倉超過時間 | 資金效率 | 可能錯過延遲行情 |

### 止損設計

```python
# 固定百分比
stop_loss = entry_price * (1 - stop_pct)  # 多單
stop_loss = entry_price * (1 + stop_pct)  # 空單

# ATR 倍數（推薦）
stop_loss = entry_price - atr * multiplier  # 多單
stop_loss = entry_price + atr * multiplier  # 空單

# 結構止損
stop_loss = recent_swing_low  # 多單
stop_loss = recent_swing_high  # 空單
```

### 止盈設計

```python
# 固定風報比
take_profit = entry_price + (entry_price - stop_loss) * rr_ratio

# 結構目標
take_profit = next_resistance  # 多單
take_profit = next_support     # 空單

# 動態目標
take_profit = entry_price + atr * multiplier
```

### 追蹤停損

```python
# 固定追蹤
trailing_stop = highest_since_entry - trail_distance

# ATR 追蹤
trailing_stop = highest_since_entry - atr * multiplier

# 結構追蹤（swing low 跟隨）
trailing_stop = most_recent_swing_low
```

## 風險管理

### 部位大小計算

```python
def calculate_position_size(
    account_balance: float,
    risk_per_trade: float,    # 例如 0.02 = 2%
    entry_price: float,
    stop_loss: float
) -> float:
    """
    基於風險計算部位大小

    公式：部位大小 = 風險金額 / 每單位風險
    """
    risk_amount = account_balance * risk_per_trade
    risk_per_unit = abs(entry_price - stop_loss)

    position_size = risk_amount / risk_per_unit
    return position_size
```

### 槓桿計算

```python
def calculate_leverage(
    position_size: float,
    entry_price: float,
    account_balance: float
) -> float:
    """
    計算所需槓桿
    """
    position_value = position_size * entry_price
    leverage = position_value / account_balance
    return leverage
```

### 風險參數建議

| 參數 | 保守 | 適中 | 積極 |
|------|------|------|------|
| 單筆風險 | 0.5-1% | 1-2% | 2-3% |
| 最大槓桿 | 3x | 5x | 10x |
| 最大持倉 | 3 筆 | 5 筆 | 7 筆 |
| 日損失上限 | 2% | 5% | 10% |

## 訊號產生模式

### 模式 1：布林訊號（Boolean）

```python
def generate_signals(data):
    """產生布林訊號"""
    long_entry = (fast_ma > slow_ma) & (fast_ma.shift(1) <= slow_ma.shift(1))
    long_exit = (fast_ma < slow_ma) & (fast_ma.shift(1) >= slow_ma.shift(1))
    short_entry = long_exit
    short_exit = long_entry

    return long_entry, long_exit, short_entry, short_exit
```

### 模式 2：分數訊號（Scoring）

```python
def generate_score(data):
    """產生評分訊號"""
    score = 0

    # 趨勢得分
    if close > ma200:
        score += 2

    # 動量得分
    if rsi < 30:
        score += 3
    elif rsi < 40:
        score += 1

    # 結構得分
    if near_support:
        score += 2

    return score  # 總分決定進場強度
```

### 模式 3：狀態機（State Machine）

```python
class TradingStateMachine:
    """狀態機模式"""

    states = ['WAITING', 'SETUP', 'ENTRY', 'IN_POSITION', 'EXIT']

    def update(self, data):
        if self.state == 'WAITING':
            if setup_condition(data):
                self.state = 'SETUP'

        elif self.state == 'SETUP':
            if entry_condition(data):
                self.state = 'ENTRY'
            elif invalidation(data):
                self.state = 'WAITING'

        elif self.state == 'IN_POSITION':
            if exit_condition(data):
                self.state = 'EXIT'
```

## 策略參數化

### 參數類型

| 類型 | 範例 | 優化方式 |
|------|------|----------|
| **週期參數** | MA period = 20 | 網格搜尋 |
| **閾值參數** | RSI oversold = 30 | 範圍搜尋 |
| **倍數參數** | ATR multiplier = 2.0 | 連續優化 |
| **布林參數** | use_filter = True | 組合測試 |

### 參數空間定義

```python
param_space = {
    'fast_period': {
        'type': 'int',
        'low': 5,
        'high': 20,
    },
    'slow_period': {
        'type': 'int',
        'low': 20,
        'high': 60,
    },
    'atr_multiplier': {
        'type': 'float',
        'low': 1.0,
        'high': 4.0,
    },
    'use_trend_filter': {
        'type': 'categorical',
        'choices': [True, False],
    },
}
```

## 策略驗證清單

設計完策略後，確認以下項目：

- [ ] **進場條件明確**：知道何時進場
- [ ] **出場條件明確**：知道何時離場
- [ ] **止損已設定**：知道最大損失
- [ ] **部位大小計算**：知道交易多少
- [ ] **參數可優化**：參數已參數化
- [ ] **過濾器合理**：不會過度過濾
- [ ] **邏輯可解釋**：能說明為何有效
