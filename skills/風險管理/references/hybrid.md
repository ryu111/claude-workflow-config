# 混合風控

> 結合靜態基礎與動態調整的風控模式

## 概述

```
混合風控 = 靜態基礎 + 動態調整

核心理念：
1. 靜態規則確保基本安全
2. 動態調整提升效率
3. 分層管理不同風險

優點：
- 有基礎保護（不會完全失控）
- 又能適應市場變化
- 可解釋性強

缺點：
- 需要設計兩套規則
- 參數較多
```

---

## 混合模式類型

### 模式 1：靜態基礎 + 動態收緊

```python
class StaticBaseDynamicTighten:
    """
    靜態基礎 + 動態收緊

    原理：
    - 基礎止損用固定規則
    - 市場劇烈時動態收緊
    - 永遠不會比基礎寬鬆
    """

    def __init__(
        self,
        base_stop_pct: float = 0.05,  # 基礎止損 5%
        atr_multiplier: float = 2.0,
    ):
        self.base_stop_pct = base_stop_pct
        self.atr_multiplier = atr_multiplier

    def calculate_stop_loss(
        self,
        entry_price: float,
        current_atr: float,
        direction: str
    ) -> float:
        """
        計算混合止損

        取「基礎止損」和「ATR 止損」中較緊的
        """
        # 基礎止損（靜態）
        if direction == 'long':
            base_stop = entry_price * (1 - self.base_stop_pct)
        else:
            base_stop = entry_price * (1 + self.base_stop_pct)

        # ATR 止損（動態）
        atr_distance = current_atr * self.atr_multiplier
        if direction == 'long':
            atr_stop = entry_price - atr_distance
        else:
            atr_stop = entry_price + atr_distance

        # 取較緊的止損
        if direction == 'long':
            return max(base_stop, atr_stop)  # 多單取較高的
        else:
            return min(base_stop, atr_stop)  # 空單取較低的
```

**適用場景：**
- 不想讓止損無限擴大
- 高波動時自動收緊保護

---

### 模式 2：靜態範圍 + 動態選擇

```python
class StaticRangeDynamicSelect:
    """
    靜態範圍 + 動態選擇

    原理：
    - 設定止損的上下限（靜態）
    - 在範圍內根據 ATR 動態選擇（動態）
    """

    def __init__(
        self,
        min_stop_pct: float = 0.01,  # 最小止損 1%
        max_stop_pct: float = 0.05,  # 最大止損 5%
        atr_multiplier: float = 2.0,
    ):
        self.min_stop_pct = min_stop_pct
        self.max_stop_pct = max_stop_pct
        self.atr_multiplier = atr_multiplier

    def calculate_stop_loss(
        self,
        entry_price: float,
        current_atr: float,
        direction: str
    ) -> float:
        """計算範圍內的動態止損"""

        # 計算 ATR 止損百分比
        atr_stop_pct = (current_atr * self.atr_multiplier) / entry_price

        # 限制在範圍內
        actual_stop_pct = max(
            self.min_stop_pct,
            min(self.max_stop_pct, atr_stop_pct)
        )

        # 計算止損價格
        if direction == 'long':
            return entry_price * (1 - actual_stop_pct)
        else:
            return entry_price * (1 + actual_stop_pct)
```

---

### 模式 3：分層混合

```python
class TieredHybridRisk:
    """
    分層混合風控

    Layer 1（單筆）：動態調整
    Layer 2（每日）：靜態上限
    Layer 3（帳戶）：靜態熔斷
    """

    params = {
        # Layer 1: 單筆風控（動態）
        'atr_multiplier': 2.0,
        'volatility_target': 0.02,

        # Layer 2: 每日風控（靜態）
        'max_daily_loss': 0.05,       # 日損失上限 5%
        'max_daily_positions': 5,

        # Layer 3: 帳戶風控（靜態）
        'max_drawdown': 0.20,         # 最大回撤 20%
        'kill_switch_loss': 0.30,     # 熔斷 30%
    }

    def __init__(self, initial_balance: float):
        self.initial_balance = initial_balance
        self.current_balance = initial_balance
        self.peak_balance = initial_balance
        self.daily_loss = 0
        self.daily_positions = 0

    def reset_daily(self):
        """每日重置"""
        self.daily_loss = 0
        self.daily_positions = 0

    def can_open_position(self) -> tuple[bool, str]:
        """
        檢查是否可以開倉

        Returns:
            (can_trade, reason)
        """
        # Layer 3: 帳戶熔斷
        total_loss = (
            (self.initial_balance - self.current_balance) /
            self.initial_balance
        )
        if total_loss >= self.params['kill_switch_loss']:
            return False, "帳戶熔斷"

        # Layer 3: 最大回撤
        drawdown = (
            (self.peak_balance - self.current_balance) /
            self.peak_balance
        )
        if drawdown >= self.params['max_drawdown']:
            return False, "超過最大回撤"

        # Layer 2: 日損失上限
        if self.daily_loss >= self.params['max_daily_loss']:
            return False, "超過日損失上限"

        # Layer 2: 日持倉上限
        if self.daily_positions >= self.params['max_daily_positions']:
            return False, "超過日持倉上限"

        return True, "OK"

    def calculate_position(
        self,
        entry_price: float,
        current_atr: float,
        current_volatility: float
    ) -> float:
        """
        計算部位大小（Layer 1 動態）
        """
        # 波動度調整
        base_position_value = (
            self.current_balance *
            self.params['volatility_target'] /
            current_volatility
        )

        position_size = base_position_value / entry_price

        return position_size

    def calculate_stop_loss(
        self,
        entry_price: float,
        current_atr: float,
        direction: str
    ) -> float:
        """
        計算止損（Layer 1 動態）
        """
        atr_distance = current_atr * self.params['atr_multiplier']

        if direction == 'long':
            return entry_price - atr_distance
        else:
            return entry_price + atr_distance

    def record_loss(self, loss_pct: float):
        """記錄損失"""
        self.daily_loss += loss_pct
        self.current_balance *= (1 - loss_pct)

        # 更新峰值
        if self.current_balance > self.peak_balance:
            self.peak_balance = self.current_balance
```

---

## 情境切換風控

### 市場狀態切換

```python
class MarketStateRisk:
    """
    根據市場狀態切換風控模式

    趨勢市場：寬止損 + 追蹤停損
    區間市場：緊止損 + 固定目標
    高波動市場：減小部位 + 寬止損
    """

    def __init__(self):
        self.market_state = 'normal'

    def detect_market_state(self, data: pd.DataFrame) -> str:
        """偵測市場狀態"""
        adx = calculate_adx(data).iloc[-1]
        volatility = calculate_volatility(data).iloc[-1]
        avg_volatility = calculate_volatility(data).rolling(50).mean().iloc[-1]

        if volatility > avg_volatility * 1.5:
            return 'high_volatility'
        elif adx > 25:
            return 'trending'
        else:
            return 'ranging'

    def get_risk_params(self, market_state: str) -> dict:
        """根據市場狀態取得風控參數"""

        if market_state == 'trending':
            return {
                'stop_multiplier': 3.0,    # 寬止損
                'use_trailing': True,       # 追蹤停損
                'position_scale': 1.0,      # 正常部位
                'rr_ratio': 3.0,           # 高風報比
            }
        elif market_state == 'ranging':
            return {
                'stop_multiplier': 1.5,    # 緊止損
                'use_trailing': False,      # 固定止損
                'position_scale': 1.0,      # 正常部位
                'rr_ratio': 1.5,           # 低風報比
            }
        elif market_state == 'high_volatility':
            return {
                'stop_multiplier': 2.5,    # 中等止損
                'use_trailing': True,       # 追蹤停損
                'position_scale': 0.5,      # 減小部位
                'rr_ratio': 2.0,           # 中等風報比
            }

    def calculate_order(
        self,
        data: pd.DataFrame,
        entry_price: float,
        direction: str
    ) -> dict:
        """計算訂單參數"""
        # 偵測市場狀態
        state = self.detect_market_state(data)
        params = self.get_risk_params(state)

        # 計算 ATR
        current_atr = calculate_atr(data).iloc[-1]

        # 止損
        stop_distance = current_atr * params['stop_multiplier']
        if direction == 'long':
            stop_loss = entry_price - stop_distance
        else:
            stop_loss = entry_price + stop_distance

        # 止盈
        reward_distance = stop_distance * params['rr_ratio']
        if direction == 'long':
            take_profit = entry_price + reward_distance
        else:
            take_profit = entry_price - reward_distance

        return {
            'market_state': state,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'use_trailing': params['use_trailing'],
            'position_scale': params['position_scale'],
        }
```

---

## 完整混合風控系統

```python
class HybridRiskManager:
    """
    完整混合風控系統

    整合所有混合風控元素
    """

    # 靜態參數（硬上限）
    static_params = {
        'max_stop_pct': 0.05,         # 最大止損 5%
        'max_position_pct': 0.20,     # 最大單筆部位 20%
        'max_daily_loss': 0.05,       # 日損失上限 5%
        'max_drawdown': 0.20,         # 最大回撤 20%
    }

    # 動態參數
    dynamic_params = {
        'atr_multiplier': 2.0,
        'volatility_target': 0.02,
    }

    def __init__(self, account_balance: float):
        self.account_balance = account_balance
        self.peak_balance = account_balance
        self.daily_loss = 0

        self.market_state_risk = MarketStateRisk()

    def calculate_order(
        self,
        data: pd.DataFrame,
        entry_price: float,
        direction: str
    ) -> dict:
        """計算完整訂單參數"""

        # 1. 檢查靜態限制
        can_trade, reason = self._check_static_limits()
        if not can_trade:
            return {'can_trade': False, 'reason': reason}

        # 2. 取得市場狀態風控參數
        market_order = self.market_state_risk.calculate_order(
            data, entry_price, direction
        )

        # 3. 計算動態部位
        current_volatility = calculate_volatility(data).iloc[-1]
        dynamic_position = self._calculate_dynamic_position(
            entry_price, current_volatility
        )

        # 4. 應用靜態上限
        max_position = (
            self.account_balance *
            self.static_params['max_position_pct'] /
            entry_price
        )
        final_position = min(
            dynamic_position * market_order['position_scale'],
            max_position
        )

        # 5. 計算止損（動態，但有靜態上限）
        current_atr = calculate_atr(data).iloc[-1]
        dynamic_stop = self._calculate_dynamic_stop(
            entry_price, current_atr, direction
        )
        static_stop = self._calculate_static_stop(entry_price, direction)

        # 取較緊的止損
        if direction == 'long':
            final_stop = max(dynamic_stop, static_stop)
        else:
            final_stop = min(dynamic_stop, static_stop)

        return {
            'can_trade': True,
            'position_size': final_position,
            'stop_loss': final_stop,
            'take_profit': market_order['take_profit'],
            'use_trailing': market_order['use_trailing'],
            'market_state': market_order['market_state'],
        }

    def _check_static_limits(self) -> tuple[bool, str]:
        """檢查靜態限制"""
        if self.daily_loss >= self.static_params['max_daily_loss']:
            return False, "日損失上限"

        drawdown = (self.peak_balance - self.account_balance) / self.peak_balance
        if drawdown >= self.static_params['max_drawdown']:
            return False, "最大回撤"

        return True, "OK"

    def _calculate_dynamic_position(
        self,
        entry_price: float,
        volatility: float
    ) -> float:
        """計算動態部位"""
        position_value = (
            self.account_balance *
            self.dynamic_params['volatility_target'] /
            volatility
        )
        return position_value / entry_price

    def _calculate_dynamic_stop(
        self,
        entry_price: float,
        atr: float,
        direction: str
    ) -> float:
        """計算動態止損"""
        distance = atr * self.dynamic_params['atr_multiplier']
        if direction == 'long':
            return entry_price - distance
        else:
            return entry_price + distance

    def _calculate_static_stop(
        self,
        entry_price: float,
        direction: str
    ) -> float:
        """計算靜態止損（硬上限）"""
        if direction == 'long':
            return entry_price * (1 - self.static_params['max_stop_pct'])
        else:
            return entry_price * (1 + self.static_params['max_stop_pct'])
```

---

## 混合風控選擇指南

| 交易者類型 | 推薦模式 | 原因 |
|------------|----------|------|
| 新手 | 靜態基礎 + 動態收緊 | 有保護，不會太複雜 |
| 中級 | 分層混合 | 多層保護，可學習 |
| 專業 | 情境切換 | 最大化效率 |

| 市場狀態 | 推薦模式 | 原因 |
|----------|----------|------|
| 穩定 | 任何模式 | 差異不大 |
| 趨勢 | 動態為主 | 需要靈活追蹤 |
| 高波動 | 靜態為主 | 需要硬性保護 |
