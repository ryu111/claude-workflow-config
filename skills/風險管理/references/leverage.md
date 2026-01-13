# 槓桿管理

> 永續合約槓桿控制與強平風險

## 槓桿基礎

```
┌─────────────────────────────────────────────────────────┐
│  槓桿 = 部位價值 / 帳戶保證金                           │
│                                                         │
│  3x 槓桿 = 用 $1,000 控制 $3,000 的部位                 │
│  10x 槓桿 = 用 $1,000 控制 $10,000 的部位               │
└─────────────────────────────────────────────────────────┘
```

### 槓桿計算

```python
def calculate_leverage(
    position_size: float,
    entry_price: float,
    account_balance: float
) -> float:
    """
    計算槓桿倍數

    Args:
        position_size: 部位數量
        entry_price: 進場價格
        account_balance: 帳戶餘額

    Returns:
        槓桿倍數
    """
    position_value = position_size * entry_price
    leverage = position_value / account_balance
    return leverage
```

---

## 強平機制

### 強平價格計算

```python
def calculate_liquidation_price(
    entry_price: float,
    leverage: float,
    maintenance_margin: float,  # 通常 0.5% - 1%
    direction: str
) -> float:
    """
    計算強平價格

    強平發生在：保證金 <= 維持保證金

    公式（簡化）：
    多單：Liq = Entry × (1 - 1/Leverage + MM)
    空單：Liq = Entry × (1 + 1/Leverage - MM)

    Args:
        entry_price: 進場價格
        leverage: 槓桿倍數
        maintenance_margin: 維持保證金率
        direction: 'long' 或 'short'

    Returns:
        強平價格
    """
    if direction == 'long':
        # 多單：價格下跌到強平
        liq_price = entry_price * (1 - 1/leverage + maintenance_margin)
    else:
        # 空單：價格上漲到強平
        liq_price = entry_price * (1 + 1/leverage - maintenance_margin)

    return liq_price
```

**範例：**
```
BTC 進場：$50,000
槓桿：10x
維持保證金：0.5%

多單強平價：$50,000 × (1 - 0.1 + 0.005) = $45,250
→ 跌 9.5% 就強平

空單強平價：$50,000 × (1 + 0.1 - 0.005) = $54,750
→ 漲 9.5% 就強平
```

---

### 強平距離

```python
def liquidation_distance(
    entry_price: float,
    liquidation_price: float,
    direction: str
) -> float:
    """
    計算強平距離（百分比）

    Args:
        entry_price: 進場價格
        liquidation_price: 強平價格
        direction: 'long' 或 'short'

    Returns:
        強平距離（百分比）
    """
    if direction == 'long':
        distance = (entry_price - liquidation_price) / entry_price
    else:
        distance = (liquidation_price - entry_price) / entry_price

    return distance
```

---

## 槓桿限制

### 基於波動度的槓桿限制

```python
def volatility_based_max_leverage(
    daily_volatility: float,
    target_liq_distance: float = 0.15  # 目標強平距離 15%
) -> float:
    """
    基於波動度計算最大槓桿

    原理：確保正常波動不會觸發強平

    Args:
        daily_volatility: 日波動率
        target_liq_distance: 目標強平距離

    Returns:
        建議最大槓桿
    """
    # 假設最大波動 = 日波動 × 3（3 sigma）
    max_expected_move = daily_volatility * 3

    # 強平距離應該大於最大預期波動
    if max_expected_move >= target_liq_distance:
        return 1.0  # 不建議使用槓桿

    # 槓桿 ≈ 1 / 強平距離
    max_leverage = 1 / target_liq_distance

    return max_leverage
```

**範例：**
```
BTC 日波動：3%
3 sigma 波動：9%
目標強平距離：15%

最大槓桿：1 / 0.15 = 6.67x
```

---

### 基於 ATR 的槓桿限制

```python
def atr_based_max_leverage(
    entry_price: float,
    current_atr: float,
    atr_multiplier: float = 5.0,  # 強平距離至少 5 ATR
    maintenance_margin: float = 0.005
) -> float:
    """
    基於 ATR 計算最大槓桿

    原理：強平距離應該至少是 N 倍 ATR

    Args:
        entry_price: 進場價格
        current_atr: 當前 ATR
        atr_multiplier: ATR 倍數
        maintenance_margin: 維持保證金率

    Returns:
        建議最大槓桿
    """
    # 目標強平距離
    target_distance = current_atr * atr_multiplier
    target_distance_pct = target_distance / entry_price

    # 反推槓桿
    # Liq Distance ≈ 1/Leverage - MM
    # 1/Leverage ≈ Liq Distance + MM
    # Leverage ≈ 1 / (Liq Distance + MM)
    max_leverage = 1 / (target_distance_pct + maintenance_margin)

    return max_leverage
```

---

## 槓桿策略

### 固定槓桿

```python
class FixedLeverageManager:
    """
    固定槓桿管理

    始終使用相同槓桿
    """

    def __init__(self, fixed_leverage: float = 3.0):
        self.fixed_leverage = fixed_leverage

    def calculate_position_size(
        self,
        account_balance: float,
        entry_price: float
    ) -> float:
        """計算部位大小"""
        position_value = account_balance * self.fixed_leverage
        return position_value / entry_price
```

---

### 動態槓桿

```python
class DynamicLeverageManager:
    """
    動態槓桿管理

    根據市場狀況調整槓桿
    """

    def __init__(
        self,
        min_leverage: float = 1.0,
        max_leverage: float = 5.0,
        target_volatility: float = 0.02
    ):
        self.min_leverage = min_leverage
        self.max_leverage = max_leverage
        self.target_volatility = target_volatility

    def calculate_leverage(
        self,
        current_volatility: float,
        adx: float = None
    ) -> float:
        """
        計算動態槓桿

        低波動 → 高槓桿
        高波動 → 低槓桿
        強趨勢 → 可適度增加
        """
        # 基礎：波動度反向
        if current_volatility <= 0:
            return self.min_leverage

        base_leverage = self.target_volatility / current_volatility

        # 趨勢調整（可選）
        if adx is not None and adx > 30:
            # 強趨勢可以稍微增加槓桿
            base_leverage *= 1.2

        # 限制範圍
        leverage = max(self.min_leverage, min(self.max_leverage, base_leverage))

        return leverage

    def calculate_position_size(
        self,
        account_balance: float,
        entry_price: float,
        current_volatility: float
    ) -> float:
        """計算部位大小"""
        leverage = self.calculate_leverage(current_volatility)
        position_value = account_balance * leverage
        return position_value / entry_price
```

---

### 分階段槓桿

```python
class TieredLeverageManager:
    """
    分階段槓桿管理

    根據帳戶狀態調整槓桿上限
    """

    tiers = [
        {'drawdown': 0.0, 'max_leverage': 5.0},   # 正常
        {'drawdown': 0.05, 'max_leverage': 4.0},  # 輕微回撤
        {'drawdown': 0.10, 'max_leverage': 3.0},  # 中度回撤
        {'drawdown': 0.15, 'max_leverage': 2.0},  # 較大回撤
        {'drawdown': 0.20, 'max_leverage': 1.0},  # 嚴重回撤
    ]

    def __init__(self, initial_balance: float):
        self.initial_balance = initial_balance
        self.peak_balance = initial_balance

    def get_max_leverage(self, current_balance: float) -> float:
        """取得當前允許的最大槓桿"""
        # 更新峰值
        if current_balance > self.peak_balance:
            self.peak_balance = current_balance

        # 計算回撤
        drawdown = (self.peak_balance - current_balance) / self.peak_balance

        # 找對應層級
        for tier in reversed(self.tiers):
            if drawdown >= tier['drawdown']:
                return tier['max_leverage']

        return self.tiers[0]['max_leverage']
```

---

## 強平保護

### 止損在強平之前

```python
def ensure_stop_before_liquidation(
    entry_price: float,
    stop_loss: float,
    leverage: float,
    maintenance_margin: float,
    direction: str,
    buffer: float = 0.02  # 2% 緩衝
) -> float:
    """
    確保止損在強平之前

    Args:
        entry_price: 進場價格
        stop_loss: 原始止損
        leverage: 槓桿倍數
        maintenance_margin: 維持保證金率
        direction: 'long' 或 'short'
        buffer: 緩衝距離

    Returns:
        調整後止損
    """
    # 計算強平價格
    liq_price = calculate_liquidation_price(
        entry_price, leverage, maintenance_margin, direction
    )

    if direction == 'long':
        # 止損必須高於強平價格
        min_stop = liq_price * (1 + buffer)
        return max(stop_loss, min_stop)
    else:
        # 止損必須低於強平價格
        max_stop = liq_price * (1 - buffer)
        return min(stop_loss, max_stop)
```

---

### 自動降槓

```python
class AutoDeleverager:
    """
    自動降槓機制

    當價格接近強平時，部分平倉降低槓桿
    """

    def __init__(
        self,
        warning_threshold: float = 0.5,  # 強平距離剩 50% 時警告
        action_threshold: float = 0.3,   # 強平距離剩 30% 時行動
    ):
        self.warning_threshold = warning_threshold
        self.action_threshold = action_threshold

    def check_position(
        self,
        current_price: float,
        entry_price: float,
        liquidation_price: float,
        direction: str
    ) -> dict:
        """
        檢查部位狀態

        Returns:
            {
                'status': 'safe' | 'warning' | 'danger',
                'distance_pct': float,
                'suggested_action': str,
            }
        """
        # 計算到強平的剩餘距離
        if direction == 'long':
            total_distance = entry_price - liquidation_price
            remaining_distance = current_price - liquidation_price
        else:
            total_distance = liquidation_price - entry_price
            remaining_distance = liquidation_price - current_price

        distance_ratio = remaining_distance / total_distance

        if distance_ratio <= self.action_threshold:
            return {
                'status': 'danger',
                'distance_pct': remaining_distance / current_price,
                'suggested_action': '立即平倉 50% 降低風險',
            }
        elif distance_ratio <= self.warning_threshold:
            return {
                'status': 'warning',
                'distance_pct': remaining_distance / current_price,
                'suggested_action': '考慮縮減部位',
            }
        else:
            return {
                'status': 'safe',
                'distance_pct': remaining_distance / current_price,
                'suggested_action': None,
            }
```

---

## 槓桿建議

| 交易風格 | 建議槓桿 | 說明 |
|----------|----------|------|
| 新手 | 1-2x | 學習階段，控制風險 |
| 保守 | 2-3x | 穩健收益 |
| 適中 | 3-5x | 平衡風險報酬 |
| 積極 | 5-10x | 高風險高報酬 |
| 極端 | >10x | 不建議，容易爆倉 |

| 市場狀態 | 建議槓桿 | 說明 |
|----------|----------|------|
| 低波動 | 可提高 | 波動小，強平距離足夠 |
| 正常 | 標準 | 使用預設槓桿 |
| 高波動 | 降低 | 價格劇烈波動，增加緩衝 |
| 極端 | 最低/不開倉 | 黑天鵝風險高 |

---

## 槓桿檢查清單

開倉前確認：

- [ ] **槓桿合理**：不超過自己能承受的範圍
- [ ] **強平距離足夠**：至少是預期波動的 2-3 倍
- [ ] **止損在強平之前**：確保止損會先觸發
- [ ] **波動度已考慮**：高波動時降低槓桿
- [ ] **帳戶狀態正常**：沒有處於回撤保護中
