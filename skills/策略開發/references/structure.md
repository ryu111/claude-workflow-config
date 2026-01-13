# 結構分析

> 支撐阻力、趨勢線、價格形態

## 概述

結構分析關注的是「價格在哪裡可能反應」，而非指標數值。

```
結構分析
├── 支撐阻力（水平）
│   ├── 固定水平
│   ├── Swing High/Low
│   └── Pivot Points
├── 趨勢線（斜線）
│   ├── 上升趨勢線
│   └── 下降趨勢線
└── 價格形態（形狀）
    ├── 反轉形態
    └── 延續形態
```

---

## 支撐阻力線

### 概念

```
阻力線：價格上漲時遇到賣壓的區域
        ┌─────────────────── 阻力
        │   ↗  ↘    ↗ ↘
        │  ↗    ↘  ↗   ↘
        └─────────────────── 支撐
支撐線：價格下跌時遇到買盤的區域
```

### Swing High / Swing Low

```python
def find_swing_highs(high: Series, left: int = 5, right: int = 5) -> Series:
    """
    找出 Swing High（局部高點）

    定義：比左邊 N 根和右邊 N 根 K 線都高的點

    Args:
        high: 最高價序列
        left: 左邊確認 K 線數
        right: 右邊確認 K 線數
    """
    swing_highs = pd.Series(False, index=high.index)

    for i in range(left, len(high) - right):
        is_high = True
        current = high.iloc[i]

        # 檢查左邊
        for j in range(1, left + 1):
            if high.iloc[i - j] >= current:
                is_high = False
                break

        # 檢查右邊
        if is_high:
            for j in range(1, right + 1):
                if high.iloc[i + j] >= current:
                    is_high = False
                    break

        swing_highs.iloc[i] = is_high

    return swing_highs


def find_swing_lows(low: Series, left: int = 5, right: int = 5) -> Series:
    """找出 Swing Low（局部低點）"""
    swing_lows = pd.Series(False, index=low.index)

    for i in range(left, len(low) - right):
        is_low = True
        current = low.iloc[i]

        for j in range(1, left + 1):
            if low.iloc[i - j] <= current:
                is_low = False
                break

        if is_low:
            for j in range(1, right + 1):
                if low.iloc[i + j] <= current:
                    is_low = False
                    break

        swing_lows.iloc[i] = is_low

    return swing_lows
```

### Pivot Points

```python
def pivot_points(high: float, low: float, close: float) -> dict:
    """
    計算 Pivot Points（經典公式）

    通常用前一日/週的 HLC 計算
    """
    pivot = (high + low + close) / 3

    r1 = 2 * pivot - low
    s1 = 2 * pivot - high

    r2 = pivot + (high - low)
    s2 = pivot - (high - low)

    r3 = high + 2 * (pivot - low)
    s3 = low - 2 * (high - pivot)

    return {
        'pivot': pivot,
        'r1': r1, 'r2': r2, 'r3': r3,
        's1': s1, 's2': s2, 's3': s3,
    }
```

### 支撐阻力區域

```python
def find_sr_zones(
    data: DataFrame,
    lookback: int = 100,
    zone_threshold: float = 0.005  # 0.5%
) -> List[dict]:
    """
    找出支撐阻力區域

    原理：價格多次在某區域反彈 = 重要水平
    """
    # 找出所有 swing points
    swing_highs = find_swing_highs(data['high'])
    swing_lows = find_swing_lows(data['low'])

    # 收集所有重要價位
    levels = []
    for i, is_high in swing_highs.items():
        if is_high:
            levels.append(data['high'].loc[i])
    for i, is_low in swing_lows.items():
        if is_low:
            levels.append(data['low'].loc[i])

    # 聚類相近的價位
    zones = cluster_levels(levels, threshold=zone_threshold)

    return zones
```

### 使用支撐阻力的策略

```python
def sr_bounce_strategy(data: DataFrame, sr_levels: List[float]):
    """
    支撐阻力反彈策略

    - 多單：價格接近支撐 + 反彈確認
    - 空單：價格接近阻力 + 回落確認
    """
    close = data['close']

    # 判斷接近支撐
    near_support = False
    for level in sr_levels:
        distance = (close - level) / level
        if 0 < distance < 0.01:  # 在支撐上方 1% 內
            near_support = True
            break

    # 確認反彈（收盤 > 開盤，且有下影線）
    bounce_confirm = (
        (close > data['open']) &
        (data['low'] < close * 0.995)
    )

    long_entry = near_support & bounce_confirm

    return long_entry
```

---

## 趨勢線

### 概念

```
上升趨勢線：連接兩個以上的 Swing Low
             ↗
           ↗
         ↗
       ↗___________  趨勢線
     ↗

下降趨勢線：連接兩個以上的 Swing High
     ↘___________  趨勢線
       ↘
         ↘
           ↘
             ↘
```

### 趨勢線計算

```python
def calculate_trendline(
    points: List[Tuple[int, float]]
) -> Tuple[float, float]:
    """
    計算趨勢線斜率和截距

    使用線性回歸擬合

    Args:
        points: [(index, price), ...]

    Returns:
        (slope, intercept)
    """
    x = np.array([p[0] for p in points])
    y = np.array([p[1] for p in points])

    # 線性回歸
    slope, intercept = np.polyfit(x, y, 1)

    return slope, intercept


def get_trendline_value(
    slope: float,
    intercept: float,
    index: int
) -> float:
    """取得趨勢線在某位置的值"""
    return slope * index + intercept
```

### 自動趨勢線偵測

```python
def auto_detect_trendline(
    data: DataFrame,
    direction: str = 'up',  # 'up' or 'down'
    min_touches: int = 2
) -> Optional[Tuple[float, float]]:
    """
    自動偵測趨勢線

    上升趨勢：連接 swing lows
    下降趨勢：連接 swing highs
    """
    if direction == 'up':
        points = find_swing_lows(data['low'])
        prices = data['low']
    else:
        points = find_swing_highs(data['high'])
        prices = data['high']

    # 收集 swing points
    swing_points = [
        (i, prices.iloc[i])
        for i, is_swing in enumerate(points)
        if is_swing
    ]

    if len(swing_points) < min_touches:
        return None

    # 嘗試不同組合，找最佳趨勢線
    best_line = None
    best_touches = 0

    for i in range(len(swing_points)):
        for j in range(i + 1, len(swing_points)):
            slope, intercept = calculate_trendline(
                [swing_points[i], swing_points[j]]
            )

            # 計算有多少點接近這條線
            touches = count_touches(
                swing_points, slope, intercept,
                tolerance=0.01
            )

            if touches > best_touches:
                best_touches = touches
                best_line = (slope, intercept)

    return best_line
```

### 趨勢線突破策略

```python
def trendline_break_strategy(
    data: DataFrame,
    trendline: Tuple[float, float],
    direction: str = 'up'
):
    """
    趨勢線突破策略

    - 上升趨勢線被下破 = 看空
    - 下降趨勢線被上破 = 看多
    """
    slope, intercept = trendline

    # 計算趨勢線值
    trendline_values = pd.Series(
        [slope * i + intercept for i in range(len(data))],
        index=data.index
    )

    close = data['close']

    if direction == 'up':
        # 上升趨勢線被下破 = 空單訊號
        break_down = (close < trendline_values) & \
                     (close.shift(1) >= trendline_values.shift(1))
        return break_down
    else:
        # 下降趨勢線被上破 = 多單訊號
        break_up = (close > trendline_values) & \
                   (close.shift(1) <= trendline_values.shift(1))
        return break_up
```

---

## 價格形態

### 反轉形態

| 形態 | 出現位置 | 意義 |
|------|----------|------|
| **頭肩頂** | 上升趨勢末端 | 看跌反轉 |
| **頭肩底** | 下降趨勢末端 | 看漲反轉 |
| **雙頂** | 上升趨勢末端 | 看跌反轉 |
| **雙底** | 下降趨勢末端 | 看漲反轉 |

### 雙底偵測

```python
def detect_double_bottom(
    data: DataFrame,
    tolerance: float = 0.02  # 兩個底的價差容許 2%
) -> pd.Series:
    """
    偵測雙底形態

    條件：
    1. 兩個相近的 swing low
    2. 中間有一個反彈（swing high）
    3. 第二個底不破第一個底
    """
    swing_lows = find_swing_lows(data['low'])
    swing_highs = find_swing_highs(data['high'])

    double_bottom = pd.Series(False, index=data.index)

    low_indices = swing_lows[swing_lows].index.tolist()
    high_indices = swing_highs[swing_highs].index.tolist()

    for i in range(len(low_indices) - 1):
        first_low_idx = low_indices[i]
        second_low_idx = low_indices[i + 1]

        first_low = data['low'].loc[first_low_idx]
        second_low = data['low'].loc[second_low_idx]

        # 檢查價差
        price_diff = abs(first_low - second_low) / first_low
        if price_diff > tolerance:
            continue

        # 檢查中間是否有 swing high
        middle_highs = [
            h for h in high_indices
            if first_low_idx < h < second_low_idx
        ]

        if middle_highs:
            double_bottom.loc[second_low_idx] = True

    return double_bottom
```

### 延續形態

| 形態 | 說明 | 交易方式 |
|------|------|----------|
| **旗形** | 趨勢中的休息 | 突破旗形邊界 |
| **三角形** | 收斂整理 | 突破三角形 |
| **矩形** | 區間整理 | 突破區間 |

### 三角形偵測

```python
def detect_triangle(
    data: DataFrame,
    lookback: int = 20
) -> Optional[str]:
    """
    偵測三角形整理

    Returns:
        'ascending': 上升三角（高點水平，低點上升）
        'descending': 下降三角（低點水平，高點下降）
        'symmetric': 對稱三角（高點下降，低點上升）
        None: 無三角形
    """
    recent = data.tail(lookback)

    swing_highs = find_swing_highs(recent['high'])
    swing_lows = find_swing_lows(recent['low'])

    # 計算高點趨勢
    high_points = recent.loc[swing_highs, 'high']
    high_slope = calculate_slope(high_points)

    # 計算低點趨勢
    low_points = recent.loc[swing_lows, 'low']
    low_slope = calculate_slope(low_points)

    # 判斷三角形類型
    if abs(high_slope) < 0.001 and low_slope > 0.001:
        return 'ascending'
    elif high_slope < -0.001 and abs(low_slope) < 0.001:
        return 'descending'
    elif high_slope < -0.001 and low_slope > 0.001:
        return 'symmetric'

    return None
```

---

## 結構分析策略範例

### 支撐阻力 + 動量

```python
class SRMomentumStrategy:
    """
    支撐阻力 + RSI 組合策略

    進場：
    - 多單：接近支撐 + RSI 超賣
    - 空單：接近阻力 + RSI 超買
    """

    def generate_signals(self, data):
        # 計算支撐阻力
        sr_levels = find_sr_zones(data)

        # 計算 RSI
        rsi = calculate_rsi(data['close'])

        # 判斷接近支撐/阻力
        near_support = is_near_support(data['close'], sr_levels)
        near_resistance = is_near_resistance(data['close'], sr_levels)

        # 組合訊號
        long_entry = near_support & (rsi < 30)
        short_entry = near_resistance & (rsi > 70)

        return long_entry, short_entry
```

### 趨勢線突破 + 確認

```python
class TrendlineBreakStrategy:
    """
    趨勢線突破策略

    進場：趨勢線突破 + 成交量確認
    出場：反向趨勢線形成
    """

    def generate_signals(self, data):
        # 偵測趨勢線
        up_trendline = auto_detect_trendline(data, 'up')
        down_trendline = auto_detect_trendline(data, 'down')

        # 偵測突破
        break_up = trendline_break_strategy(data, down_trendline, 'down')
        break_down = trendline_break_strategy(data, up_trendline, 'up')

        # 成交量確認
        volume_surge = data['volume'] > data['volume'].rolling(20).mean() * 1.5

        long_entry = break_up & volume_surge
        short_entry = break_down & volume_surge

        return long_entry, short_entry
```
