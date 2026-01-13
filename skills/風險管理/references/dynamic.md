# 動態風控

> 自適應市場變化的風險控制方法

## 概述

```
動態風控 = 規則隨市場/帳戶狀態調整

優點：
- 適應市場變化
- 高波動時自動收緊
- 低波動時自動放寬

缺點：
- 複雜度較高
- 需要更多計算
- 參數調校較難
```

---

## ATR 動態止損

### 基本 ATR 止損

```python
def atr_stop_loss(
    entry_price: float,
    atr: float,
    multiplier: float,
    direction: str
) -> float:
    """
    ATR 動態止損

    止損距離 = ATR × 倍數

    Args:
        entry_price: 進場價格
        atr: 當前 ATR 值
        multiplier: ATR 倍數（通常 1.5-3.0）
        direction: 'long' 或 'short'

    Returns:
        止損價格
    """
    stop_distance = atr * multiplier

    if direction == 'long':
        return entry_price - stop_distance
    else:
        return entry_price + stop_distance
```

**ATR 倍數選擇：**
| 倍數 | 特性 | 適合策略 |
|------|------|----------|
| 1.0-1.5 | 緊止損 | 短線/高頻 |
| 1.5-2.5 | 標準 | 波段交易 |
| 2.5-4.0 | 寬止損 | 趨勢跟隨 |

---

### ATR 百分位止損

```python
def atr_percentile_stop(
    data: pd.DataFrame,
    entry_price: float,
    percentile: int = 80,
    lookback: int = 100,
    direction: str = 'long'
) -> float:
    """
    ATR 百分位止損

    根據歷史 ATR 分布動態調整

    高波動時期：止損較寬
    低波動時期：止損較窄
    """
    atr_series = calculate_atr(data, 14)
    recent_atr = atr_series.tail(lookback)

    # 取百分位 ATR
    atr_threshold = np.percentile(recent_atr, percentile)
    current_atr = atr_series.iloc[-1]

    # 使用較大者
    atr_used = max(current_atr, atr_threshold * 0.5)

    stop_distance = atr_used * 2.0

    if direction == 'long':
        return entry_price - stop_distance
    else:
        return entry_price + stop_distance
```

---

## 追蹤停損

### 固定追蹤

```python
class FixedTrailingStop:
    """
    固定距離追蹤停損

    止損跟隨最高價/最低價，保持固定距離
    """

    def __init__(self, trail_distance: float):
        self.trail_distance = trail_distance
        self.highest_since_entry = None
        self.lowest_since_entry = None

    def update(
        self,
        current_price: float,
        direction: str
    ) -> float:
        """
        更新追蹤停損

        Args:
            current_price: 當前價格
            direction: 'long' 或 'short'

        Returns:
            新的止損價格
        """
        if direction == 'long':
            if self.highest_since_entry is None:
                self.highest_since_entry = current_price
            else:
                self.highest_since_entry = max(
                    self.highest_since_entry,
                    current_price
                )
            return self.highest_since_entry - self.trail_distance

        else:  # short
            if self.lowest_since_entry is None:
                self.lowest_since_entry = current_price
            else:
                self.lowest_since_entry = min(
                    self.lowest_since_entry,
                    current_price
                )
            return self.lowest_since_entry + self.trail_distance
```

### ATR 追蹤停損

```python
class ATRTrailingStop:
    """
    ATR 動態追蹤停損

    追蹤距離隨 ATR 變化
    """

    def __init__(self, atr_multiplier: float = 2.0):
        self.atr_multiplier = atr_multiplier
        self.highest_since_entry = None
        self.lowest_since_entry = None

    def update(
        self,
        current_price: float,
        current_atr: float,
        direction: str
    ) -> float:
        """更新 ATR 追蹤停損"""
        trail_distance = current_atr * self.atr_multiplier

        if direction == 'long':
            if self.highest_since_entry is None:
                self.highest_since_entry = current_price
            else:
                self.highest_since_entry = max(
                    self.highest_since_entry,
                    current_price
                )
            return self.highest_since_entry - trail_distance

        else:
            if self.lowest_since_entry is None:
                self.lowest_since_entry = current_price
            else:
                self.lowest_since_entry = min(
                    self.lowest_since_entry,
                    current_price
                )
            return self.lowest_since_entry + trail_distance
```

### 結構追蹤停損

```python
class StructureTrailingStop:
    """
    結構追蹤停損

    止損跟隨最近的 swing low/high
    """

    def __init__(self, swing_lookback: int = 5):
        self.swing_lookback = swing_lookback

    def update(
        self,
        data: pd.DataFrame,
        direction: str
    ) -> float:
        """
        更新結構追蹤停損

        多單：跟隨最近的 swing low
        空單：跟隨最近的 swing high
        """
        if direction == 'long':
            swing_lows = find_swing_lows(
                data['low'],
                left=self.swing_lookback,
                right=self.swing_lookback
            )
            recent_swing = data.loc[swing_lows, 'low'].iloc[-1]
            return recent_swing * 0.998  # 留一點緩衝

        else:
            swing_highs = find_swing_highs(
                data['high'],
                left=self.swing_lookback,
                right=self.swing_lookback
            )
            recent_swing = data.loc[swing_highs, 'high'].iloc[-1]
            return recent_swing * 1.002
```

---

## 波動度調整部位

### 反波動度部位

```python
class InverseVolatilityPosition:
    """
    反波動度部位大小

    原理：波動大時減小部位，波動小時增大部位
    目標：讓每筆交易的「波動風險」相同
    """

    def __init__(
        self,
        target_volatility: float = 0.02,  # 目標每日波動 2%
        max_position: float = 1.0
    ):
        self.target_volatility = target_volatility
        self.max_position = max_position

    def calculate_position_size(
        self,
        account_balance: float,
        current_volatility: float,
        entry_price: float
    ) -> float:
        """
        計算部位大小

        公式：部位 = (帳戶 × 目標波動) / (價格 × 當前波動)
        """
        if current_volatility <= 0:
            return 0

        # 基礎部位
        position_value = (
            account_balance * self.target_volatility /
            current_volatility
        )

        position_size = position_value / entry_price

        # 限制最大部位
        max_size = (account_balance * self.max_position) / entry_price
        position_size = min(position_size, max_size)

        return position_size
```

**範例：**
```
帳戶：$10,000
目標波動：2%

低波動期（日波動 1%）：
部位 = $10,000 × 2% / 1% = $20,000（2x 槓桿）

高波動期（日波動 4%）：
部位 = $10,000 × 2% / 4% = $5,000（0.5x 槓桿）
```

---

### ATR 調整部位

```python
class ATRAdjustedPosition:
    """
    ATR 調整部位

    用 ATR 來標準化不同標的的風險
    """

    def __init__(self, risk_per_trade: float = 0.02):
        self.risk_per_trade = risk_per_trade

    def calculate_position_size(
        self,
        account_balance: float,
        entry_price: float,
        current_atr: float,
        atr_multiplier: float = 2.0
    ) -> float:
        """
        ATR 調整部位計算

        止損距離 = ATR × 倍數
        部位 = 風險金額 / 止損距離
        """
        risk_amount = account_balance * self.risk_per_trade
        stop_distance = current_atr * atr_multiplier

        position_size = risk_amount / stop_distance

        return position_size
```

---

## 權益曲線風控

### 權益曲線過濾

```python
class EquityCurveFilter:
    """
    權益曲線風控

    當帳戶表現不佳時，減少或暫停交易
    """

    def __init__(
        self,
        lookback: int = 20,
        threshold: float = 0.0
    ):
        """
        Args:
            lookback: 回顧期
            threshold: 過濾閾值（0 = 均線，負數 = 更嚴格）
        """
        self.lookback = lookback
        self.threshold = threshold
        self.equity_history = []

    def update(self, current_equity: float):
        """更新權益記錄"""
        self.equity_history.append(current_equity)

    def can_trade(self) -> bool:
        """
        判斷是否可以交易

        當權益低於移動平均時，暫停交易
        """
        if len(self.equity_history) < self.lookback:
            return True

        recent = self.equity_history[-self.lookback:]
        equity_ma = np.mean(recent)
        current = self.equity_history[-1]

        return current >= equity_ma * (1 + self.threshold)

    def get_position_multiplier(self) -> float:
        """
        取得部位乘數

        權益越低於均線，部位越小
        """
        if len(self.equity_history) < self.lookback:
            return 1.0

        recent = self.equity_history[-self.lookback:]
        equity_ma = np.mean(recent)
        current = self.equity_history[-1]

        ratio = current / equity_ma

        if ratio >= 1.0:
            return 1.0
        elif ratio >= 0.95:
            return 0.75
        elif ratio >= 0.90:
            return 0.5
        else:
            return 0.0  # 暫停交易
```

---

### 回撤控制

```python
class DrawdownController:
    """
    回撤控制器

    監控並控制最大回撤
    """

    def __init__(
        self,
        max_drawdown: float = 0.20,  # 最大回撤 20%
        recovery_threshold: float = 0.10  # 恢復閾值 10%
    ):
        self.max_drawdown = max_drawdown
        self.recovery_threshold = recovery_threshold

        self.peak_equity = 0
        self.is_in_drawdown = False
        self.drawdown_start_equity = 0

    def update(self, current_equity: float) -> dict:
        """
        更新回撤狀態

        Returns:
            {
                'current_drawdown': float,
                'can_trade': bool,
                'position_scale': float,
            }
        """
        # 更新峰值
        if current_equity > self.peak_equity:
            self.peak_equity = current_equity
            self.is_in_drawdown = False

        # 計算當前回撤
        current_drawdown = (
            (self.peak_equity - current_equity) / self.peak_equity
        )

        # 判斷是否進入回撤保護
        if current_drawdown >= self.max_drawdown:
            self.is_in_drawdown = True
            self.drawdown_start_equity = current_equity

        # 判斷是否恢復
        if self.is_in_drawdown:
            recovery = (
                (current_equity - self.drawdown_start_equity) /
                self.drawdown_start_equity
            )
            if recovery >= self.recovery_threshold:
                self.is_in_drawdown = False

        # 計算部位縮放
        if current_drawdown < 0.10:
            position_scale = 1.0
        elif current_drawdown < 0.15:
            position_scale = 0.75
        elif current_drawdown < 0.20:
            position_scale = 0.5
        else:
            position_scale = 0.0  # 暫停交易

        return {
            'current_drawdown': current_drawdown,
            'can_trade': not self.is_in_drawdown,
            'position_scale': position_scale,
        }
```

---

## 動態風控完整系統

```python
class DynamicRiskManager:
    """
    完整動態風控系統

    整合所有動態風控元素
    """

    def __init__(self, account_balance: float):
        self.account_balance = account_balance

        # 子系統
        self.trailing_stop = ATRTrailingStop(atr_multiplier=2.0)
        self.position_sizer = InverseVolatilityPosition()
        self.equity_filter = EquityCurveFilter()
        self.drawdown_ctrl = DrawdownController()

    def calculate_order(
        self,
        data: pd.DataFrame,
        entry_price: float,
        direction: str
    ) -> dict:
        """計算動態調整的訂單參數"""

        # 更新帳戶狀態
        self.equity_filter.update(self.account_balance)
        dd_status = self.drawdown_ctrl.update(self.account_balance)

        # 檢查是否可以交易
        if not self.equity_filter.can_trade() or not dd_status['can_trade']:
            return {'can_trade': False}

        # 計算動態參數
        current_atr = calculate_atr(data).iloc[-1]
        current_volatility = calculate_volatility(data).iloc[-1]

        # ATR 止損
        stop_loss = atr_stop_loss(
            entry_price, current_atr, 2.0, direction
        )

        # 波動度調整部位
        base_position = self.position_sizer.calculate_position_size(
            self.account_balance,
            current_volatility,
            entry_price
        )

        # 應用縮放
        position_scale = dd_status['position_scale']
        equity_scale = self.equity_filter.get_position_multiplier()
        final_position = base_position * position_scale * equity_scale

        return {
            'can_trade': True,
            'position_size': final_position,
            'stop_loss': stop_loss,
            'trailing_stop_enabled': True,
        }
```
