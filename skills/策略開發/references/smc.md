# 聰明錢概念 (SMC)

> Smart Money Concepts：追蹤機構交易者的足跡

## 核心理念

```
散戶看的是：指標數值
聰明錢看的是：流動性在哪裡

SMC 核心：
1. 機構需要流動性來建倉/出貨
2. 價格會去「獵殺」流動性區域
3. 識別機構的足跡，順著他們交易
```

## SMC 核心概念

```
SMC 體系
├── 市場結構 (Market Structure)
│   ├── BOS (Break of Structure)
│   └── ChoCH (Change of Character)
├── 訂單區塊 (Order Block)
│   ├── Bullish OB
│   └── Bearish OB
├── 公平價值缺口 (Fair Value Gap)
│   ├── Bullish FVG
│   └── Bearish FVG
├── 流動性 (Liquidity)
│   ├── 買方流動性 (Buy-side)
│   └── 賣方流動性 (Sell-side)
└── 流動性獵殺 (Liquidity Sweep)
```

---

## 市場結構 (Market Structure)

### Higher High / Lower Low

```
上升趨勢：
       HH
      ↗
    HL
   ↗
  HH
 ↗
HL
↗
HH = Higher High（更高的高點）
HL = Higher Low（更高的低點）

下降趨勢：
LH
 ↘
  LL
   ↘
    LH
     ↘
      LL
LH = Lower High（更低的高點）
LL = Lower Low（更低的低點）
```

### BOS (Break of Structure)

```python
def detect_bos(data: DataFrame) -> Tuple[Series, Series]:
    """
    偵測 Break of Structure

    Bullish BOS：價格突破前一個 swing high
    Bearish BOS：價格跌破前一個 swing low
    """
    swing_highs = find_swing_highs(data['high'])
    swing_lows = find_swing_lows(data['low'])

    # 取得最近的 swing points
    recent_high = get_most_recent_swing(swing_highs, data['high'])
    recent_low = get_most_recent_swing(swing_lows, data['low'])

    # BOS 判斷
    bullish_bos = (data['close'] > recent_high) & \
                  (data['close'].shift(1) <= recent_high)

    bearish_bos = (data['close'] < recent_low) & \
                  (data['close'].shift(1) >= recent_low)

    return bullish_bos, bearish_bos
```

### ChoCH (Change of Character)

```python
def detect_choch(data: DataFrame) -> Tuple[Series, Series]:
    """
    偵測 Change of Character（趨勢轉變）

    Bullish ChoCH：下降趨勢中，首次突破前高
    Bearish ChoCH：上升趨勢中，首次跌破前低

    ChoCH 比 BOS 更重要，代表趨勢可能反轉！
    """
    # 判斷當前趨勢
    trend = detect_trend(data)  # 1=上升, -1=下降

    bullish_bos, bearish_bos = detect_bos(data)

    # ChoCH = 逆趨勢的 BOS
    bullish_choch = (trend.shift(1) == -1) & bullish_bos  # 下降趨勢中出現 bullish BOS
    bearish_choch = (trend.shift(1) == 1) & bearish_bos   # 上升趨勢中出現 bearish BOS

    return bullish_choch, bearish_choch
```

**BOS vs ChoCH：**
| 訊號 | 意義 | 交易方式 |
|------|------|----------|
| BOS | 趨勢延續 | 順勢回調進場 |
| ChoCH | 趨勢反轉 | 等待確認後反向 |

---

## 訂單區塊 (Order Block)

### 概念

```
訂單區塊 = 機構大單進場的區域

Bullish Order Block（看漲 OB）：
- 下跌過程中最後一根下跌 K 線
- 之後價格強勢上漲
- 機構在此買入建倉

        ↑↑↑
        ↑↑
       [OB]  ← Bullish OB（最後下跌 K 線）
        ↓
        ↓

Bearish Order Block（看跌 OB）：
- 上漲過程中最後一根上漲 K 線
- 之後價格強勢下跌
- 機構在此賣出

        ↑
        ↑
       [OB]  ← Bearish OB（最後上漲 K 線）
        ↓↓
        ↓↓↓
```

### Order Block 偵測

```python
def find_order_blocks(
    data: DataFrame,
    strength: int = 3  # OB 後至少 N 根 K 線確認
) -> Tuple[Series, Series]:
    """
    找出 Order Blocks

    Bullish OB：
    1. 該 K 線是下跌（close < open）
    2. 後面的 K 線強勢上漲
    3. 價格明顯脫離該區域

    Bearish OB：
    1. 該 K 線是上漲（close > open）
    2. 後面的 K 線強勢下跌
    3. 價格明顯脫離該區域
    """
    bullish_ob = pd.Series(False, index=data.index)
    bearish_ob = pd.Series(False, index=data.index)

    for i in range(len(data) - strength):
        current = data.iloc[i]

        # 檢查 Bullish OB
        if current['close'] < current['open']:  # 下跌 K 線
            # 檢查後面是否強勢上漲
            future = data.iloc[i+1:i+1+strength]
            if (future['close'] > current['high']).all():
                bullish_ob.iloc[i] = True

        # 檢查 Bearish OB
        if current['close'] > current['open']:  # 上漲 K 線
            # 檢查後面是否強勢下跌
            future = data.iloc[i+1:i+1+strength]
            if (future['close'] < current['low']).all():
                bearish_ob.iloc[i] = True

    return bullish_ob, bearish_ob
```

### Order Block 區域

```python
def get_ob_zones(data: DataFrame, bullish_ob: Series, bearish_ob: Series) -> List[dict]:
    """
    取得 OB 區域（用於回測）

    OB 區域 = OB K 線的高低點範圍
    """
    zones = []

    for i, is_ob in bullish_ob.items():
        if is_ob:
            zones.append({
                'type': 'bullish',
                'high': data.loc[i, 'high'],
                'low': data.loc[i, 'low'],
                'created_at': i,
            })

    for i, is_ob in bearish_ob.items():
        if is_ob:
            zones.append({
                'type': 'bearish',
                'high': data.loc[i, 'high'],
                'low': data.loc[i, 'low'],
                'created_at': i,
            })

    return zones
```

---

## 公平價值缺口 (FVG)

### 概念

```
FVG = Fair Value Gap = 價格效率不平衡區域

Bullish FVG（看漲缺口）：
     K3 ━━━━━━━━
         ↑
         │  ← FVG 區域（K1.high 到 K3.low）
         │
     K2 ━━━━━━
         ↑
     K1 ━━━━━━━━

條件：K3.low > K1.high
意義：買盤強勁，價格跳空上漲，未來可能回補

Bearish FVG（看跌缺口）：
     K1 ━━━━━━━━
         ↓
         │  ← FVG 區域（K3.high 到 K1.low）
         │
     K2 ━━━━━━
         ↓
     K3 ━━━━━━━━

條件：K3.high < K1.low
意義：賣盤強勁，價格跳空下跌，未來可能回補
```

### FVG 偵測

```python
def find_fvg(data: DataFrame) -> Tuple[List[dict], List[dict]]:
    """
    找出 Fair Value Gaps

    Bullish FVG: candle3.low > candle1.high
    Bearish FVG: candle3.high < candle1.low
    """
    bullish_fvg = []
    bearish_fvg = []

    for i in range(2, len(data)):
        k1 = data.iloc[i-2]  # 第一根
        k2 = data.iloc[i-1]  # 中間
        k3 = data.iloc[i]    # 第三根

        # Bullish FVG
        if k3['low'] > k1['high']:
            bullish_fvg.append({
                'high': k3['low'],
                'low': k1['high'],
                'created_at': data.index[i],
            })

        # Bearish FVG
        if k3['high'] < k1['low']:
            bearish_fvg.append({
                'high': k1['low'],
                'low': k3['high'],
                'created_at': data.index[i],
            })

    return bullish_fvg, bearish_fvg
```

### FVG 交易邏輯

```python
def fvg_entry_signal(
    data: DataFrame,
    fvg_zones: List[dict],
    fvg_type: str = 'bullish'
) -> Series:
    """
    FVG 進場訊號

    策略：當價格回到 FVG 區域時進場
    """
    signal = pd.Series(False, index=data.index)

    for fvg in fvg_zones:
        # 價格進入 FVG 區域
        in_zone = (data['low'] <= fvg['high']) & (data['high'] >= fvg['low'])

        # 只在 FVG 創建之後有效
        valid_time = data.index > fvg['created_at']

        if fvg_type == 'bullish':
            # Bullish FVG：價格回落到 FVG 後做多
            signal = signal | (in_zone & valid_time)
        else:
            # Bearish FVG：價格反彈到 FVG 後做空
            signal = signal | (in_zone & valid_time)

    return signal
```

---

## 流動性 (Liquidity)

### 概念

```
流動性 = 停損單聚集的地方

買方流動性（Buy-side Liquidity）：
- 位於前高點上方
- 空單的停損 + 突破買單
- 機構會「獵殺」這些流動性

      BSL ← 買方流動性（前高上方）
    ━━━━━
   ↗
  ↗
 ↗

賣方流動性（Sell-side Liquidity）：
- 位於前低點下方
- 多單的停損 + 突破賣單
- 機構會「獵殺」這些流動性

 ↘
  ↘
   ↘
    ━━━━━
      SSL ← 賣方流動性（前低下方）
```

### 流動性區域偵測

```python
def find_liquidity_zones(data: DataFrame, lookback: int = 20) -> dict:
    """
    找出流動性區域

    流動性通常在明顯的 swing high/low 處
    """
    swing_highs = find_swing_highs(data['high'])
    swing_lows = find_swing_lows(data['low'])

    # 買方流動性（前高上方）
    buy_side = []
    for i, is_high in swing_highs.tail(lookback).items():
        if is_high:
            buy_side.append({
                'level': data.loc[i, 'high'],
                'created_at': i,
            })

    # 賣方流動性（前低下方）
    sell_side = []
    for i, is_low in swing_lows.tail(lookback).items():
        if is_low:
            sell_side.append({
                'level': data.loc[i, 'low'],
                'created_at': i,
            })

    return {
        'buy_side': buy_side,
        'sell_side': sell_side,
    }
```

### 流動性獵殺 (Liquidity Sweep)

```python
def detect_liquidity_sweep(
    data: DataFrame,
    liquidity_zones: dict,
    tolerance: float = 0.001  # 0.1%
) -> Tuple[Series, Series]:
    """
    偵測流動性獵殺

    流動性獵殺 = 價格突破流動性區域後快速反轉

    Bullish Sweep（看漲獵殺）：
    - 價格跌破賣方流動性（前低）
    - 但收盤回到上方
    - 假突破，反轉上漲訊號

    Bearish Sweep（看跌獵殺）：
    - 價格突破買方流動性（前高）
    - 但收盤回到下方
    - 假突破，反轉下跌訊號
    """
    bullish_sweep = pd.Series(False, index=data.index)
    bearish_sweep = pd.Series(False, index=data.index)

    for zone in liquidity_zones['sell_side']:
        level = zone['level']

        # 低點跌破 level，但收盤回到上方
        sweep = (data['low'] < level * (1 - tolerance)) & \
                (data['close'] > level)

        bullish_sweep = bullish_sweep | sweep

    for zone in liquidity_zones['buy_side']:
        level = zone['level']

        # 高點突破 level，但收盤回到下方
        sweep = (data['high'] > level * (1 + tolerance)) & \
                (data['close'] < level)

        bearish_sweep = bearish_sweep | sweep

    return bullish_sweep, bearish_sweep
```

---

## SMC 完整策略範例

```python
class SMCStrategy:
    """
    聰明錢策略

    邏輯：
    1. 識別市場結構（BOS/ChoCH）
    2. 找出 Order Block 和 FVG
    3. 等待價格回到這些區域
    4. 搭配流動性獵殺確認進場
    """

    def generate_signals(self, data: DataFrame):
        # ===== 市場結構 =====
        bullish_bos, bearish_bos = detect_bos(data)
        bullish_choch, bearish_choch = detect_choch(data)

        # ===== Order Blocks =====
        bullish_ob, bearish_ob = find_order_blocks(data)
        ob_zones = get_ob_zones(data, bullish_ob, bearish_ob)

        # ===== Fair Value Gaps =====
        bullish_fvg, bearish_fvg = find_fvg(data)

        # ===== 流動性 =====
        liquidity = find_liquidity_zones(data)
        bullish_sweep, bearish_sweep = detect_liquidity_sweep(data, liquidity)

        # ===== 組合訊號 =====
        # 多單：ChoCH 轉多 + 回到 Bullish OB/FVG + Liquidity Sweep
        long_setup = bullish_choch.rolling(10).max() > 0  # 近期有 ChoCH
        long_ob = is_in_zone(data['close'], ob_zones, 'bullish')
        long_fvg = is_in_fvg(data['close'], bullish_fvg)

        long_entry = long_setup & (long_ob | long_fvg) & bullish_sweep

        # 空單：ChoCH 轉空 + 回到 Bearish OB/FVG + Liquidity Sweep
        short_setup = bearish_choch.rolling(10).max() > 0
        short_ob = is_in_zone(data['close'], ob_zones, 'bearish')
        short_fvg = is_in_fvg(data['close'], bearish_fvg)

        short_entry = short_setup & (short_ob | short_fvg) & bearish_sweep

        return long_entry, short_entry

    def calculate_stop_loss(self, data, entry_idx, direction):
        """止損設在 OB/FVG 區域外"""
        if direction == 'long':
            # 止損在 OB low 下方
            return self.current_ob['low'] * 0.998
        else:
            return self.current_ob['high'] * 1.002
```

---

## SMC 交易清單

### 多單條件 ✅
- [ ] Bullish ChoCH（趨勢轉多）
- [ ] 價格回到 Bullish OB 或 FVG
- [ ] 出現 Bullish Liquidity Sweep
- [ ] 止損設在 OB 下方

### 空單條件 ✅
- [ ] Bearish ChoCH（趨勢轉空）
- [ ] 價格回到 Bearish OB 或 FVG
- [ ] 出現 Bearish Liquidity Sweep
- [ ] 止損設在 OB 上方
