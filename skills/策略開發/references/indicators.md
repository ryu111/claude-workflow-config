# 技術指標庫

> 常用技術指標的定義、計算、用法

## 指標分類

```
技術指標
├── 趨勢指標（判斷方向）
│   ├── MA, EMA, SMA
│   ├── MACD
│   └── ADX
├── 動量指標（判斷強弱）
│   ├── RSI
│   ├── Stochastic
│   ├── CCI
│   └── Williams %R
├── 波動度指標（判斷範圍）
│   ├── ATR
│   ├── Bollinger Bands
│   └── Keltner Channel
└── 成交量指標（判斷量能）
    ├── OBV
    ├── VWAP
    └── MFI
```

---

## 趨勢指標

### SMA（簡單移動平均）

```python
def sma(close: Series, period: int) -> Series:
    """
    Simple Moving Average

    公式：SMA = (P1 + P2 + ... + Pn) / n
    """
    return close.rolling(window=period).mean()
```

**用法：**
- 判斷趨勢方向：close > SMA = 上升趨勢
- 動態支撐阻力：價格常在 MA 附近反彈
- 交叉訊號：快線上穿慢線 = 金叉

**常用週期：**
| 週期 | 用途 |
|------|------|
| 20 | 短期趨勢 |
| 50 | 中期趨勢 |
| 200 | 長期趨勢 |

---

### EMA（指數移動平均）

```python
def ema(close: Series, period: int) -> Series:
    """
    Exponential Moving Average

    對近期價格給予更高權重
    """
    return close.ewm(span=period, adjust=False).mean()
```

**vs SMA：**
- EMA 對近期價格更敏感
- EMA 反應更快，但更容易假訊號
- 短期交易偏好 EMA，長期偏好 SMA

---

### MACD

```python
def macd(close: Series, fast=12, slow=26, signal=9):
    """
    Moving Average Convergence Divergence

    MACD Line = EMA(12) - EMA(26)
    Signal Line = EMA(MACD Line, 9)
    Histogram = MACD Line - Signal Line
    """
    ema_fast = close.ewm(span=fast).mean()
    ema_slow = close.ewm(span=slow).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal).mean()
    histogram = macd_line - signal_line

    return macd_line, signal_line, histogram
```

**訊號：**
| 訊號 | 意義 |
|------|------|
| MACD 上穿 Signal | 金叉，看多 |
| MACD 下穿 Signal | 死叉，看空 |
| Histogram 由負轉正 | 動能轉強 |
| MACD 背離價格 | 潛在反轉 |

---

### ADX（平均方向指數）

```python
def adx(high, low, close, period=14):
    """
    Average Directional Index

    衡量趨勢強度（不判斷方向）
    """
    # 計算 +DM, -DM
    plus_dm = high.diff()
    minus_dm = -low.diff()

    plus_dm = plus_dm.where((plus_dm > minus_dm) & (plus_dm > 0), 0)
    minus_dm = minus_dm.where((minus_dm > plus_dm) & (minus_dm > 0), 0)

    # 計算 ATR
    tr = calculate_tr(high, low, close)
    atr = tr.rolling(period).mean()

    # 計算 +DI, -DI
    plus_di = 100 * (plus_dm.rolling(period).mean() / atr)
    minus_di = 100 * (minus_dm.rolling(period).mean() / atr)

    # 計算 ADX
    dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
    adx = dx.rolling(period).mean()

    return adx, plus_di, minus_di
```

**解讀：**
| ADX 值 | 趨勢強度 |
|--------|----------|
| < 20 | 無趨勢/區間 |
| 20-40 | 趨勢發展中 |
| > 40 | 強趨勢 |
| > 60 | 極強趨勢 |

---

## 動量指標

### RSI（相對強弱指數）

```python
def rsi(close: Series, period: int = 14) -> Series:
    """
    Relative Strength Index

    RSI = 100 - 100 / (1 + RS)
    RS = 平均漲幅 / 平均跌幅
    """
    delta = close.diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    return rsi
```

**訊號：**
| RSI 值 | 狀態 | 策略 |
|--------|------|------|
| < 30 | 超賣 | 考慮做多 |
| > 70 | 超買 | 考慮做空 |
| 50 附近 | 中性 | 觀望 |

**背離：**
- 價格新高 + RSI 未新高 = 看跌背離
- 價格新低 + RSI 未新低 = 看漲背離

---

### Stochastic（隨機指標）

```python
def stochastic(high, low, close, k_period=14, d_period=3):
    """
    Stochastic Oscillator

    %K = (C - L14) / (H14 - L14) * 100
    %D = SMA(%K, 3)
    """
    lowest_low = low.rolling(window=k_period).min()
    highest_high = high.rolling(window=k_period).max()

    k = 100 * (close - lowest_low) / (highest_high - lowest_low)
    d = k.rolling(window=d_period).mean()

    return k, d
```

**訊號：**
- %K 上穿 %D 且 < 20 = 買入
- %K 下穿 %D 且 > 80 = 賣出

---

### CCI（商品通道指數）

```python
def cci(high, low, close, period=20):
    """
    Commodity Channel Index

    CCI = (TP - SMA(TP)) / (0.015 * MAD)
    TP = (High + Low + Close) / 3
    """
    tp = (high + low + close) / 3
    sma_tp = tp.rolling(period).mean()
    mad = tp.rolling(period).apply(lambda x: np.abs(x - x.mean()).mean())

    cci = (tp - sma_tp) / (0.015 * mad)
    return cci
```

**解讀：**
| CCI 值 | 狀態 |
|--------|------|
| > +100 | 超買 |
| < -100 | 超賣 |
| 0 附近 | 中性 |

---

## 波動度指標

### ATR（平均真實波幅）

```python
def atr(high, low, close, period=14):
    """
    Average True Range

    TR = max(H-L, |H-C.prev|, |L-C.prev|)
    ATR = SMA(TR, period)
    """
    tr1 = high - low
    tr2 = abs(high - close.shift(1))
    tr3 = abs(low - close.shift(1))

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()

    return atr
```

**用法：**
- 止損設定：entry ± ATR * multiplier
- 波動度過濾：ATR > threshold
- 部位大小：風險 / ATR = 部位

---

### Bollinger Bands（布林通道）

```python
def bollinger_bands(close, period=20, std_dev=2):
    """
    Bollinger Bands

    Middle = SMA(close, 20)
    Upper = Middle + 2 * STD
    Lower = Middle - 2 * STD
    """
    middle = close.rolling(period).mean()
    std = close.rolling(period).std()

    upper = middle + std_dev * std
    lower = middle - std_dev * std

    return upper, middle, lower
```

**訊號：**
- 價格觸及下軌 = 可能反彈
- 價格觸及上軌 = 可能回落
- 通道收窄 = 即將突破

**%B 指標：**
```python
percent_b = (close - lower) / (upper - lower)
# %B < 0 = 超賣
# %B > 1 = 超買
```

---

### Keltner Channel（肯特納通道）

```python
def keltner_channel(high, low, close, ema_period=20, atr_period=10, atr_mult=2):
    """
    Keltner Channel

    Middle = EMA(close, 20)
    Upper = Middle + 2 * ATR
    Lower = Middle - 2 * ATR
    """
    middle = close.ewm(span=ema_period).mean()
    atr_val = atr(high, low, close, atr_period)

    upper = middle + atr_mult * atr_val
    lower = middle - atr_mult * atr_val

    return upper, middle, lower
```

**與 BB 比較：**
- BB 用標準差，對極端值更敏感
- KC 用 ATR，更穩定
- 兩者結合可判斷 squeeze

---

## 成交量指標

### OBV（能量潮）

```python
def obv(close, volume):
    """
    On-Balance Volume

    價漲：OBV += Volume
    價跌：OBV -= Volume
    """
    direction = np.sign(close.diff())
    obv = (volume * direction).cumsum()
    return obv
```

**訊號：**
- OBV 創新高 + 價格未新高 = 看漲
- OBV 創新低 + 價格未新低 = 看跌

---

### VWAP（成交量加權平均價）

```python
def vwap(high, low, close, volume):
    """
    Volume Weighted Average Price

    VWAP = Σ(TP * Volume) / Σ(Volume)
    """
    tp = (high + low + close) / 3
    vwap = (tp * volume).cumsum() / volume.cumsum()
    return vwap
```

**用法：**
- 機構常用參考價位
- 價格 > VWAP = 買方強勢
- 價格 < VWAP = 賣方強勢

---

## 指標選擇指南

### 依策略類型

| 策略類型 | 推薦指標 |
|----------|----------|
| 趨勢跟隨 | MA, MACD, ADX |
| 均值回歸 | RSI, BB, Stochastic |
| 突破 | ATR, KC, BB Squeeze |
| 量價分析 | OBV, VWAP, MFI |

### 避免重複

同類型指標選一個即可：
- ❌ RSI + Stochastic + CCI（都是動量）
- ✅ RSI + ATR + MA（動量+波動+趨勢）

### 指標組合建議

```python
# 經典組合 1：趨勢 + 動量
indicators = ['MA200', 'RSI']

# 經典組合 2：趨勢 + 波動
indicators = ['MA_cross', 'ATR']

# 經典組合 3：動量 + 波動
indicators = ['RSI', 'BB']
```
