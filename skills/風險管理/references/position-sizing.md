# 部位大小計算

> 決定每筆交易應該交易多少

## 核心公式

```
┌─────────────────────────────────────────────────────────┐
│  部位大小 = 風險金額 / 單位風險                         │
│                                                         │
│  風險金額 = 帳戶餘額 × 風險比例                         │
│  單位風險 = |進場價 - 止損價|                           │
└─────────────────────────────────────────────────────────┘
```

---

## 基礎方法

### 1. 固定風險法

```python
def fixed_risk_position_size(
    account_balance: float,
    risk_per_trade: float,
    entry_price: float,
    stop_loss: float
) -> float:
    """
    固定風險法

    每筆交易固定損失帳戶的 X%

    Args:
        account_balance: 帳戶餘額
        risk_per_trade: 單筆風險比例（如 0.02 = 2%）
        entry_price: 進場價格
        stop_loss: 止損價格

    Returns:
        部位大小（數量）
    """
    risk_amount = account_balance * risk_per_trade
    risk_per_unit = abs(entry_price - stop_loss)

    if risk_per_unit <= 0:
        return 0

    position_size = risk_amount / risk_per_unit
    return position_size
```

**範例：**
```
帳戶：$10,000
風險：2%
風險金額：$10,000 × 2% = $200

BTC 進場：$50,000
BTC 止損：$48,000
單位風險：$2,000

部位大小：$200 / $2,000 = 0.1 BTC
```

---

### 2. 固定金額法

```python
def fixed_value_position_size(
    fixed_value: float,
    entry_price: float
) -> float:
    """
    固定金額法

    每筆交易投入固定金額

    Args:
        fixed_value: 固定金額（如 $1,000）
        entry_price: 進場價格

    Returns:
        部位大小
    """
    return fixed_value / entry_price
```

---

### 3. 固定比例法

```python
def fixed_percentage_position_size(
    account_balance: float,
    percentage: float,
    entry_price: float
) -> float:
    """
    固定比例法

    每筆交易投入帳戶的 X%

    Args:
        account_balance: 帳戶餘額
        percentage: 投入比例（如 0.10 = 10%）
        entry_price: 進場價格

    Returns:
        部位大小
    """
    position_value = account_balance * percentage
    return position_value / entry_price
```

---

## 進階方法

### 4. 凱利準則 (Kelly Criterion)

```python
def kelly_position_size(
    account_balance: float,
    win_rate: float,
    avg_win: float,
    avg_loss: float,
    entry_price: float,
    kelly_fraction: float = 0.5  # 半凱利
) -> float:
    """
    凱利準則

    數學上最佳的部位大小，最大化長期複利成長

    公式：f* = (p × b - q) / b

    其中：
    - p = 勝率
    - q = 敗率 (1 - p)
    - b = 盈虧比 (avg_win / avg_loss)

    Args:
        account_balance: 帳戶餘額
        win_rate: 歷史勝率
        avg_win: 平均獲利
        avg_loss: 平均虧損
        entry_price: 進場價格
        kelly_fraction: 凱利比例（通常用半凱利 0.5）

    Returns:
        部位大小
    """
    p = win_rate
    q = 1 - win_rate
    b = avg_win / avg_loss if avg_loss > 0 else 0

    if b <= 0:
        return 0

    # 凱利公式
    kelly = (p * b - q) / b

    # 限制在 0 到 1 之間
    kelly = max(0, min(1, kelly))

    # 應用凱利比例（通常用半凱利避免過度槓桿）
    position_fraction = kelly * kelly_fraction

    position_value = account_balance * position_fraction
    return position_value / entry_price
```

**注意：**
- 全凱利波動極大，不建議使用
- 通常使用 1/4 到 1/2 凱利
- 需要足夠的歷史數據估算勝率和盈虧比

---

### 5. 波動度調整法

```python
def volatility_adjusted_position_size(
    account_balance: float,
    target_volatility: float,
    current_volatility: float,
    entry_price: float,
    max_leverage: float = 3.0
) -> float:
    """
    波動度調整法

    目標：讓每筆交易的「波動風險」相同

    高波動 → 小部位
    低波動 → 大部位

    Args:
        account_balance: 帳戶餘額
        target_volatility: 目標波動（如 0.02 = 2%/日）
        current_volatility: 當前波動
        entry_price: 進場價格
        max_leverage: 最大槓桿

    Returns:
        部位大小
    """
    if current_volatility <= 0:
        return 0

    # 計算部位價值
    position_value = (
        account_balance * target_volatility / current_volatility
    )

    # 限制最大槓桿
    max_value = account_balance * max_leverage
    position_value = min(position_value, max_value)

    return position_value / entry_price
```

---

### 6. ATR 調整法

```python
def atr_adjusted_position_size(
    account_balance: float,
    risk_per_trade: float,
    entry_price: float,
    current_atr: float,
    atr_multiplier: float = 2.0
) -> float:
    """
    ATR 調整法

    用 ATR 決定止損距離，再計算部位

    Args:
        account_balance: 帳戶餘額
        risk_per_trade: 單筆風險比例
        entry_price: 進場價格
        current_atr: 當前 ATR
        atr_multiplier: ATR 倍數

    Returns:
        部位大小
    """
    risk_amount = account_balance * risk_per_trade
    stop_distance = current_atr * atr_multiplier

    if stop_distance <= 0:
        return 0

    position_size = risk_amount / stop_distance
    return position_size
```

---

## 組合部位管理

### 相關性調整

```python
def correlation_adjusted_position(
    base_position: float,
    existing_positions: List[dict],
    new_symbol: str,
    correlation_matrix: pd.DataFrame
) -> float:
    """
    相關性調整部位

    當新部位與現有部位高度相關時，減小部位

    Args:
        base_position: 基礎部位大小
        existing_positions: 現有部位列表
        new_symbol: 新標的
        correlation_matrix: 相關性矩陣

    Returns:
        調整後部位大小
    """
    if not existing_positions:
        return base_position

    # 計算與現有部位的相關性
    max_correlation = 0
    for pos in existing_positions:
        if pos['symbol'] in correlation_matrix.columns:
            corr = correlation_matrix.loc[new_symbol, pos['symbol']]
            max_correlation = max(max_correlation, abs(corr))

    # 相關性越高，部位越小
    # corr = 0 → scale = 1.0
    # corr = 0.5 → scale = 0.75
    # corr = 1.0 → scale = 0.5
    scale = 1 - (max_correlation * 0.5)

    return base_position * scale
```

---

### 總曝險限制

```python
class PortfolioPositionManager:
    """
    組合部位管理器

    管理總體曝險和單一標的限制
    """

    def __init__(
        self,
        account_balance: float,
        max_total_exposure: float = 1.0,      # 總曝險 100%
        max_single_exposure: float = 0.20,    # 單一標的 20%
        max_positions: int = 5
    ):
        self.account_balance = account_balance
        self.max_total_exposure = max_total_exposure
        self.max_single_exposure = max_single_exposure
        self.max_positions = max_positions

        self.positions = []

    def get_current_exposure(self) -> float:
        """計算當前總曝險"""
        total_value = sum(
            p['size'] * p['current_price']
            for p in self.positions
        )
        return total_value / self.account_balance

    def can_add_position(self, proposed_size: float, entry_price: float) -> tuple[bool, float]:
        """
        檢查是否可以新增部位

        Returns:
            (can_add, adjusted_size)
        """
        # 檢查持倉數
        if len(self.positions) >= self.max_positions:
            return False, 0

        proposed_value = proposed_size * entry_price
        proposed_exposure = proposed_value / self.account_balance

        # 檢查單一標的限制
        if proposed_exposure > self.max_single_exposure:
            proposed_exposure = self.max_single_exposure
            proposed_size = (
                self.account_balance * proposed_exposure / entry_price
            )

        # 檢查總曝險限制
        current_exposure = self.get_current_exposure()
        remaining_exposure = self.max_total_exposure - current_exposure

        if proposed_exposure > remaining_exposure:
            proposed_exposure = remaining_exposure
            proposed_size = (
                self.account_balance * proposed_exposure / entry_price
            )

        if proposed_size <= 0:
            return False, 0

        return True, proposed_size
```

---

## 部位縮放

### 權益曲線縮放

```python
def equity_curve_scaling(
    base_position: float,
    equity_history: List[float],
    lookback: int = 20
) -> float:
    """
    權益曲線縮放

    帳戶表現好 → 增加部位
    帳戶表現差 → 減少部位

    Args:
        base_position: 基礎部位
        equity_history: 權益歷史
        lookback: 回顧期

    Returns:
        縮放後部位
    """
    if len(equity_history) < lookback:
        return base_position

    recent = equity_history[-lookback:]
    ma = np.mean(recent)
    current = equity_history[-1]

    # 計算縮放比例
    ratio = current / ma

    if ratio >= 1.1:
        scale = 1.2  # 表現好，增加 20%
    elif ratio >= 1.0:
        scale = 1.0  # 表現正常
    elif ratio >= 0.95:
        scale = 0.75  # 輕微縮水，減少 25%
    elif ratio >= 0.90:
        scale = 0.5   # 明顯縮水，減少 50%
    else:
        scale = 0.25  # 嚴重縮水，減少 75%

    return base_position * scale
```

---

### 連續虧損縮放

```python
def losing_streak_scaling(
    base_position: float,
    recent_trades: List[dict],
    max_losing_streak: int = 3
) -> float:
    """
    連續虧損縮放

    連續虧損時減小部位

    Args:
        base_position: 基礎部位
        recent_trades: 最近交易記錄
        max_losing_streak: 最大容忍連虧次數

    Returns:
        縮放後部位
    """
    # 計算連續虧損次數
    losing_streak = 0
    for trade in reversed(recent_trades):
        if trade['pnl'] < 0:
            losing_streak += 1
        else:
            break

    # 縮放
    if losing_streak == 0:
        return base_position
    elif losing_streak == 1:
        return base_position * 0.75
    elif losing_streak == 2:
        return base_position * 0.5
    elif losing_streak >= max_losing_streak:
        return base_position * 0.25

    return base_position
```

---

## 部位計算流程

```python
class PositionCalculator:
    """
    完整部位計算器

    整合所有計算方法
    """

    def calculate(
        self,
        account_balance: float,
        entry_price: float,
        stop_loss: float,
        current_atr: float,
        current_volatility: float,
        existing_positions: List[dict],
        equity_history: List[float]
    ) -> dict:
        """
        完整部位計算流程

        1. 基礎計算（固定風險）
        2. 波動度調整
        3. 相關性調整
        4. 權益曲線縮放
        5. 限制檢查
        """
        # 1. 基礎計算
        base_position = fixed_risk_position_size(
            account_balance,
            risk_per_trade=0.02,
            entry_price=entry_price,
            stop_loss=stop_loss
        )

        # 2. 波動度調整（可選）
        vol_adjusted = volatility_adjusted_position_size(
            account_balance,
            target_volatility=0.02,
            current_volatility=current_volatility,
            entry_price=entry_price
        )

        # 取較小者
        position = min(base_position, vol_adjusted)

        # 3. 相關性調整（如果有現有部位）
        # position = correlation_adjusted_position(...)

        # 4. 權益曲線縮放
        position = equity_curve_scaling(
            position,
            equity_history
        )

        # 5. 限制檢查
        max_position = account_balance * 0.20 / entry_price
        position = min(position, max_position)

        # 計算相關數值
        position_value = position * entry_price
        leverage = position_value / account_balance

        return {
            'position_size': position,
            'position_value': position_value,
            'leverage': leverage,
            'risk_amount': abs(entry_price - stop_loss) * position,
            'risk_pct': abs(entry_price - stop_loss) * position / account_balance,
        }
```
