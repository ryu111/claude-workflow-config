# 靜態風控

> 固定規則的風險控制方法

## 概述

```
靜態風控 = 規則固定，不隨市場變化

優點：
- 簡單明確
- 容易執行
- 容易回測

缺點：
- 不適應市場變化
- 可能在高波動時過於寬鬆
- 可能在低波動時過於嚴格
```

---

## 固定止損

### 固定百分比止損

```python
def fixed_percentage_stop(
    entry_price: float,
    stop_pct: float,
    direction: str
) -> float:
    """
    固定百分比止損

    Args:
        entry_price: 進場價格
        stop_pct: 止損百分比（如 0.02 = 2%）
        direction: 'long' 或 'short'

    Returns:
        止損價格
    """
    if direction == 'long':
        return entry_price * (1 - stop_pct)
    else:
        return entry_price * (1 + stop_pct)
```

**使用場景：**
- 適合波動穩定的市場
- 新手入門

**常用設定：**
| 風格 | 止損% | 說明 |
|------|-------|------|
| 短線 | 1-2% | 緊止損，快進快出 |
| 波段 | 3-5% | 給予波動空間 |
| 長線 | 5-10% | 容忍大波動 |

---

### 固定點數止損

```python
def fixed_points_stop(
    entry_price: float,
    stop_points: float,
    direction: str
) -> float:
    """
    固定點數止損

    適合期貨/合約交易

    Args:
        entry_price: 進場價格
        stop_points: 止損點數（如 BTC 500 點）
        direction: 'long' 或 'short'
    """
    if direction == 'long':
        return entry_price - stop_points
    else:
        return entry_price + stop_points
```

---

## 固定風險比例

### 固定帳戶風險

```python
class FixedRiskManager:
    """
    固定風險比例管理

    每筆交易固定損失帳戶的 X%
    """

    def __init__(self, risk_per_trade: float = 0.02):
        """
        Args:
            risk_per_trade: 單筆風險比例（如 0.02 = 2%）
        """
        self.risk_per_trade = risk_per_trade

    def calculate_position_size(
        self,
        account_balance: float,
        entry_price: float,
        stop_loss: float
    ) -> float:
        """
        計算部位大小

        公式：部位 = 風險金額 / 單位風險
        """
        risk_amount = account_balance * self.risk_per_trade
        risk_per_unit = abs(entry_price - stop_loss)

        position_size = risk_amount / risk_per_unit

        return position_size
```

**範例計算：**
```
帳戶：$10,000
單筆風險：2%
風險金額：$10,000 × 2% = $200

進場價：$50,000（BTC）
止損價：$49,000
單位風險：$1,000

部位大小：$200 / $1,000 = 0.2 BTC
```

---

## 固定部位大小

### 固定數量

```python
class FixedPositionSize:
    """
    固定部位大小

    每筆交易都用相同數量
    """

    def __init__(self, fixed_size: float):
        """
        Args:
            fixed_size: 固定部位大小（如 0.1 BTC）
        """
        self.fixed_size = fixed_size

    def get_position_size(self, **kwargs) -> float:
        """不管什麼情況都返回固定大小"""
        return self.fixed_size
```

**適用場景：**
- 測試策略（固定變數）
- 小帳戶（簡化管理）

**缺點：**
- 不考慮風險
- 不適應帳戶變化

---

### 固定金額

```python
class FixedValuePosition:
    """
    固定金額部位

    每筆交易投入相同金額
    """

    def __init__(self, fixed_value: float):
        """
        Args:
            fixed_value: 固定金額（如 $1,000）
        """
        self.fixed_value = fixed_value

    def calculate_position_size(self, entry_price: float) -> float:
        """
        計算部位大小

        部位 = 固定金額 / 進場價格
        """
        return self.fixed_value / entry_price
```

---

## 固定止盈

### 固定風報比

```python
def fixed_risk_reward_target(
    entry_price: float,
    stop_loss: float,
    rr_ratio: float,
    direction: str
) -> float:
    """
    固定風報比止盈

    Args:
        entry_price: 進場價格
        stop_loss: 止損價格
        rr_ratio: 風報比（如 2.0 = 2:1）
        direction: 'long' 或 'short'

    Returns:
        止盈價格
    """
    risk = abs(entry_price - stop_loss)
    reward = risk * rr_ratio

    if direction == 'long':
        return entry_price + reward
    else:
        return entry_price - reward
```

**常用風報比：**
| 風報比 | 盈虧平衡勝率 | 適合策略 |
|--------|--------------|----------|
| 1:1 | 50% | 高頻/日內 |
| 2:1 | 33% | 波段交易 |
| 3:1 | 25% | 趨勢跟隨 |

---

## 固定規則組合

### 完整靜態風控系統

```python
class StaticRiskManager:
    """
    完整靜態風控系統

    所有參數固定，不隨市場變化
    """

    params = {
        'risk_per_trade': 0.02,      # 單筆風險 2%
        'stop_loss_pct': 0.03,       # 止損 3%
        'risk_reward_ratio': 2.0,    # 風報比 2:1
        'max_positions': 5,          # 最大持倉數
        'max_daily_loss': 0.05,      # 日損失上限 5%
    }

    def __init__(self, account_balance: float):
        self.account_balance = account_balance
        self.daily_loss = 0

    def can_open_position(self) -> bool:
        """檢查是否可以開倉"""
        # 檢查日損失
        if self.daily_loss >= self.params['max_daily_loss']:
            return False
        return True

    def calculate_order(
        self,
        entry_price: float,
        direction: str
    ) -> dict:
        """
        計算訂單參數

        Returns:
            {
                'position_size': float,
                'stop_loss': float,
                'take_profit': float,
            }
        """
        # 止損價格
        stop_loss = fixed_percentage_stop(
            entry_price,
            self.params['stop_loss_pct'],
            direction
        )

        # 部位大小
        risk_amount = self.account_balance * self.params['risk_per_trade']
        risk_per_unit = abs(entry_price - stop_loss)
        position_size = risk_amount / risk_per_unit

        # 止盈價格
        take_profit = fixed_risk_reward_target(
            entry_price,
            stop_loss,
            self.params['risk_reward_ratio'],
            direction
        )

        return {
            'position_size': position_size,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
        }
```

---

## 靜態風控的限制

### 問題 1：不適應波動變化

```
低波動時期：
- 止損 3% 可能太寬
- 很少觸及止損
- 但獲利也小

高波動時期：
- 止損 3% 可能太窄
- 經常被掃止損
- 錯過後續行情
```

### 問題 2：不適應帳戶變化

```
帳戶成長時：
- 固定金額部位相對變小
- 沒有充分利用複利

帳戶縮水時：
- 固定金額部位相對變大
- 風險反而增加
```

### 何時使用靜態風控？

| 適合 | 不適合 |
|------|--------|
| 新手學習 | 專業交易 |
| 策略測試 | 高波動市場 |
| 簡單策略 | 複雜組合 |
| 穩定市場 | 劇烈變動市場 |
