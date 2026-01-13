# 多週期分析 (MTF)

> Multi-Timeframe Analysis：用高時間框架定方向，低時間框架找進場

## 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│  HTF (Higher Time Frame) - 決定交易方向                     │
│  ─────────────────────────────────────────                  │
│  日線/4H：判斷整體趨勢，只在趨勢方向交易                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│  LTF (Lower Time Frame) - 尋找進場點                        │
│  ─────────────────────────────────────────                  │
│  1H/15M：找精確進場，減小止損距離                           │
└─────────────────────────────────────────────────────────────┘
```

## 時間框架階層

### 推薦配對

| 交易風格 | HTF（定方向） | LTF（找進場） |
|----------|---------------|---------------|
| 波段交易 | 日線 (1D) | 4 小時 (4H) |
| 日內交易 | 4 小時 (4H) | 1 小時 (1H) |
| 短線交易 | 1 小時 (1H) | 15 分鐘 (15M) |
| 極短線 | 15 分鐘 (15M) | 5 分鐘 (5M) |

### 比例法則

**HTF : LTF 比例建議 4:1 ~ 6:1**

```
1D → 4H (6:1)
4H → 1H (4:1)
1H → 15M (4:1)
```

---

## MTF 實作架構

### 資料準備

```python
def prepare_mtf_data(
    ltf_data: DataFrame,
    htf_timeframe: str
) -> DataFrame:
    """
    從 LTF 資料生成 HTF 資料

    Args:
        ltf_data: 低時間框架 OHLCV
        htf_timeframe: 高時間框架 ('4H', '1D', etc.)

    Returns:
        htf_data: 高時間框架 OHLCV
    """
    # 將 LTF 重採樣為 HTF
    htf_data = ltf_data.resample(htf_timeframe).agg({
        'open': 'first',
        'high': 'max',
        'low': 'min',
        'close': 'last',
        'volume': 'sum',
    })

    return htf_data.dropna()
```

### HTF 偏差對齊到 LTF

```python
def align_htf_to_ltf(
    htf_series: Series,
    ltf_index: DatetimeIndex
) -> Series:
    """
    將 HTF 訊號對齊到 LTF 時間軸

    原理：HTF 的值在該週期結束前是未知的
          必須用 forward-fill 避免未來資訊

    Args:
        htf_series: HTF 資料序列
        ltf_index: LTF 時間索引

    Returns:
        對齊後的序列（LTF 時間軸）
    """
    # reindex 並 forward-fill
    aligned = htf_series.reindex(ltf_index, method='ffill')

    return aligned
```

---

## MTF 策略實作

### 基本模式：HTF 趨勢 + LTF 進場

```python
class MTFTrendStrategy:
    """
    多週期趨勢策略

    邏輯：
    - HTF：MA200 判斷趨勢方向
    - LTF：RSI 超賣/超買找進場

    只在 HTF 趨勢方向交易！
    """

    def __init__(self, htf_timeframe: str = '4H'):
        self.htf_timeframe = htf_timeframe

    def generate_signals(self, ltf_data: DataFrame):
        # 準備 HTF 資料
        htf_data = prepare_mtf_data(ltf_data, self.htf_timeframe)

        # HTF 趨勢判斷
        htf_ma200 = htf_data['close'].rolling(200).mean()
        htf_uptrend = htf_data['close'] > htf_ma200
        htf_downtrend = htf_data['close'] < htf_ma200

        # 對齊到 LTF
        ltf_uptrend = align_htf_to_ltf(htf_uptrend, ltf_data.index)
        ltf_downtrend = align_htf_to_ltf(htf_downtrend, ltf_data.index)

        # LTF 進場訊號
        ltf_rsi = calculate_rsi(ltf_data['close'], 14)
        ltf_oversold = ltf_rsi < 30
        ltf_overbought = ltf_rsi > 70

        # 組合：HTF 方向 + LTF 進場
        long_entry = ltf_uptrend & ltf_oversold
        short_entry = ltf_downtrend & ltf_overbought

        return long_entry, short_entry
```

### 進階模式：HTF 結構 + LTF 確認

```python
class MTFStructureStrategy:
    """
    多週期結構策略

    邏輯：
    - HTF：找支撐阻力區域
    - LTF：在結構區域找反轉確認
    """

    def generate_signals(self, ltf_data: DataFrame):
        htf_data = prepare_mtf_data(ltf_data, '4H')

        # HTF 支撐阻力
        htf_sr_levels = find_sr_zones(htf_data)

        # 對齊到 LTF
        close = ltf_data['close']

        # 判斷是否接近 HTF 結構
        near_htf_support = is_near_level(
            close, htf_sr_levels, 'support', tolerance=0.005
        )
        near_htf_resistance = is_near_level(
            close, htf_sr_levels, 'resistance', tolerance=0.005
        )

        # LTF 反轉確認（吞噬 K 線）
        ltf_bullish_engulf = detect_bullish_engulfing(ltf_data)
        ltf_bearish_engulf = detect_bearish_engulfing(ltf_data)

        # 組合
        long_entry = near_htf_support & ltf_bullish_engulf
        short_entry = near_htf_resistance & ltf_bearish_engulf

        return long_entry, short_entry
```

---

## MTF 分析類型

### 1. 趨勢對齊

```python
def mtf_trend_alignment(
    ltf_data: DataFrame,
    htf_timeframe: str
) -> Series:
    """
    檢查 MTF 趨勢是否對齊

    Returns:
        Series: 1=對齊上漲, -1=對齊下跌, 0=不對齊
    """
    htf_data = prepare_mtf_data(ltf_data, htf_timeframe)

    # HTF 趨勢
    htf_ma = htf_data['close'].rolling(20).mean()
    htf_trend = np.sign(htf_data['close'] - htf_ma)

    # LTF 趨勢
    ltf_ma = ltf_data['close'].rolling(20).mean()
    ltf_trend = np.sign(ltf_data['close'] - ltf_ma)

    # 對齊
    htf_aligned = align_htf_to_ltf(htf_trend, ltf_data.index)

    # 檢查是否對齊
    alignment = pd.Series(0, index=ltf_data.index)
    alignment[(htf_aligned == 1) & (ltf_trend == 1)] = 1   # 對齊上漲
    alignment[(htf_aligned == -1) & (ltf_trend == -1)] = -1  # 對齊下跌

    return alignment
```

### 2. 背離偵測

```python
def mtf_divergence(
    ltf_data: DataFrame,
    htf_timeframe: str
) -> Series:
    """
    偵測 MTF 背離

    當 HTF 和 LTF 方向相反時，可能是：
    - HTF 趨勢的回調（順勢交易機會）
    - 趨勢即將反轉（需要更多確認）
    """
    htf_data = prepare_mtf_data(ltf_data, htf_timeframe)

    # 計算趨勢
    htf_trend = calculate_trend(htf_data)
    ltf_trend = calculate_trend(ltf_data)

    htf_aligned = align_htf_to_ltf(htf_trend, ltf_data.index)

    # 背離：HTF 上漲但 LTF 下跌 → 可能是回調買點
    bullish_divergence = (htf_aligned == 1) & (ltf_trend == -1)
    bearish_divergence = (htf_aligned == -1) & (ltf_trend == 1)

    return bullish_divergence, bearish_divergence
```

### 3. 結構映射

```python
def map_htf_structure_to_ltf(
    ltf_data: DataFrame,
    htf_timeframe: str
) -> Dict[str, List[float]]:
    """
    將 HTF 結構映射到 LTF

    在 LTF 圖表上標記 HTF 的重要位置
    """
    htf_data = prepare_mtf_data(ltf_data, htf_timeframe)

    # HTF 結構
    htf_swing_highs = find_swing_highs(htf_data['high'])
    htf_swing_lows = find_swing_lows(htf_data['low'])

    # 收集重要價位
    resistance_levels = htf_data.loc[htf_swing_highs, 'high'].tolist()
    support_levels = htf_data.loc[htf_swing_lows, 'low'].tolist()

    return {
        'resistance': resistance_levels,
        'support': support_levels,
    }
```

---

## MTF 策略設計指南

### Do's ✅

1. **從 HTF 開始**：先確定大方向，再找小時間框架進場
2. **順勢交易**：只在 HTF 趨勢方向交易
3. **等待對齊**：HTF + LTF 對齊時勝率更高
4. **HTF 定止損**：止損可以參考 HTF 結構

### Don'ts ❌

1. **逆勢搶反彈**：不要在 HTF 下跌時只因 LTF 超賣就做多
2. **過度分析**：不要用太多時間框架（2-3 個足夠）
3. **忽略對齊**：不要在 HTF/LTF 衝突時強行交易
4. **時間框架跳躍**：不要直接從日線跳到 5 分鐘

---

## MTF 完整策略範例

```python
class CompleteMTFStrategy:
    """
    完整 MTF 策略實作

    時間框架：4H (HTF) + 1H (LTF)

    邏輯：
    1. 4H 趨勢過濾（MA50 > MA200）
    2. 4H 結構區域
    3. 1H RSI 進場訊號
    4. 1H ATR 止損
    """

    params = {
        'htf': '4H',
        'trend_fast': 50,
        'trend_slow': 200,
        'rsi_period': 14,
        'rsi_oversold': 30,
        'rsi_overbought': 70,
        'atr_multiplier': 2.0,
    }

    def generate_signals(self, ltf_data: DataFrame):
        p = self.params

        # 準備 HTF 資料
        htf_data = prepare_mtf_data(ltf_data, p['htf'])

        # ===== HTF 分析 =====
        # 趨勢過濾
        htf_ma_fast = htf_data['close'].rolling(p['trend_fast']).mean()
        htf_ma_slow = htf_data['close'].rolling(p['trend_slow']).mean()
        htf_uptrend = htf_ma_fast > htf_ma_slow
        htf_downtrend = htf_ma_fast < htf_ma_slow

        # 對齊到 LTF
        ltf_uptrend = align_htf_to_ltf(htf_uptrend, ltf_data.index)
        ltf_downtrend = align_htf_to_ltf(htf_downtrend, ltf_data.index)

        # ===== LTF 分析 =====
        # RSI 進場訊號
        ltf_rsi = calculate_rsi(ltf_data['close'], p['rsi_period'])
        ltf_oversold = ltf_rsi < p['rsi_oversold']
        ltf_overbought = ltf_rsi > p['rsi_overbought']

        # ===== 組合訊號 =====
        long_entry = ltf_uptrend & ltf_oversold
        short_entry = ltf_downtrend & ltf_overbought

        # 出場
        long_exit = ltf_overbought | ltf_downtrend
        short_exit = ltf_oversold | ltf_uptrend

        return long_entry, long_exit, short_entry, short_exit

    def calculate_stop_loss(self, ltf_data: DataFrame, entry_price: float, direction: str):
        """使用 LTF ATR 計算止損"""
        atr = calculate_atr(ltf_data, 14).iloc[-1]

        if direction == 'long':
            return entry_price - atr * self.params['atr_multiplier']
        else:
            return entry_price + atr * self.params['atr_multiplier']
```

---

## MTF 回測注意事項

### 避免未來資訊洩漏

```python
# ❌ 錯誤：直接使用 HTF 收盤價（包含未來資訊）
htf_close = htf_data['close']
ltf_aligned = htf_close.reindex(ltf_index, method='ffill')

# ✅ 正確：使用 shift 確保只用已完成的 K 線
htf_close = htf_data['close'].shift(1)  # 使用前一根完成的 K 線
ltf_aligned = htf_close.reindex(ltf_index, method='ffill')
```

### 資料對齊驗證

```python
def validate_mtf_alignment(htf_data, ltf_data):
    """驗證 MTF 資料對齊是否正確"""
    # 確保 HTF 每根 K 線對應正確數量的 LTF K 線
    expected_ratio = calculate_timeframe_ratio(htf_data, ltf_data)

    # 檢查邊界對齊
    assert htf_data.index[0] <= ltf_data.index[0]
    assert htf_data.index[-1] >= ltf_data.index[-1]
```
