# 技術指標整合

如何使用現有指標庫進行市場狀態識別。

## 核心指標組合

### 最小可行組合（3 指標）

| 指標 | 用途 | 閾值範例 |
|------|------|----------|
| **ADX** | 趨勢強度 | > 25 = 趨勢，< 20 = 震盪 |
| **ATR** | 波動率 | 相對均值判斷高低波 |
| **MA 斜率** | 趨勢方向 | > 0 = 上漲，< 0 = 下跌 |

**實作**：
```python
from src.indicators.trend import ADX
from src.indicators.volatility import ATR

def simple_regime_detection(df):
    """使用 3 指標的簡單狀態識別"""

    # 計算指標
    adx = ADX(df, period=14)
    atr = ATR(df, period=14)
    sma = df['close'].rolling(50).mean()
    sma_slope = sma.diff(10)  # 10 期斜率

    # 波動率相對位置
    atr_ma = atr.rolling(100).mean()
    high_vol = atr > atr_ma * 1.5

    # 狀態判斷
    regime = pd.Series(index=df.index, dtype='object')

    # 高波動
    regime[high_vol] = 'high_volatility'

    # 趨勢市（未被高波覆蓋的）
    regime[(adx > 25) & (sma_slope > 0) & ~high_vol] = 'bull_trend'
    regime[(adx > 25) & (sma_slope < 0) & ~high_vol] = 'bear_trend'

    # 震盪市
    regime[(adx < 20) & ~high_vol] = 'sideways'

    # 預設為 neutral
    regime.fillna('neutral', inplace=True)

    return regime
```

### 進階組合（6-8 指標）

| 類別 | 指標 | 權重 |
|------|------|------|
| **趨勢** | ADX, +DI/-DI, MA Cross | 30% |
| **動量** | RSI, MACD | 20% |
| **波動** | ATR, Bollinger Width | 30% |
| **成交量** | Volume SMA, OBV | 10% |
| **價格結構** | Support/Resistance | 10% |

```python
def advanced_regime_detection(df):
    """使用多指標的進階識別"""

    # 1. 趨勢分數
    trend_score = calculate_trend_score(df)
    # ADX + DI + MA Cross → 0-100

    # 2. 波動分數
    volatility_score = calculate_volatility_score(df)
    # ATR + BB Width → 0-100

    # 3. 動量分數
    momentum_score = calculate_momentum_score(df)
    # RSI + MACD → 0-100

    # 組合規則
    regime = pd.Series(index=df.index, dtype='object')

    # 強趨勢 + 中低波動 = 趨勢市
    regime[(trend_score > 70) & (volatility_score < 50)] = 'strong_trend'

    # 弱趨勢 + 低波動 = 震盪市
    regime[(trend_score < 30) & (volatility_score < 40)] = 'sideways'

    # 高波動
    regime[volatility_score > 70] = 'high_volatility'

    # 中等狀態
    regime.fillna('neutral', inplace=True)

    return regime

def calculate_trend_score(df):
    """計算趨勢分數（0-100）"""
    from src.indicators.trend import ADX, DI_Plus, DI_Minus

    adx = ADX(df, period=14)
    di_plus = DI_Plus(df, period=14)
    di_minus = DI_Minus(df, period=14)

    # ADX 標準化到 0-100
    adx_norm = np.clip(adx, 0, 50) * 2  # 假設 50 為極強趨勢

    # DI 方向性
    di_direction = (di_plus - di_minus).clip(-50, 50) + 50  # 轉為 0-100

    # MA Cross
    sma_short = df['close'].rolling(20).mean()
    sma_long = df['close'].rolling(50).mean()
    ma_cross = ((sma_short > sma_long).astype(int) * 100)  # 0 or 100

    # 加權平均
    score = (adx_norm * 0.5 + di_direction * 0.3 + ma_cross * 0.2)

    return score

def calculate_volatility_score(df):
    """計算波動分數（0-100）"""
    from src.indicators.volatility import ATR, BollingerBands

    atr = ATR(df, period=14)
    bb = BollingerBands(df, period=20)

    # ATR 相對位置
    atr_percentile = atr.rolling(100).apply(
        lambda x: (x.iloc[-1] <= x).sum() / len(x) * 100
    )

    # BB Width 相對位置
    bb_width = (bb['upper'] - bb['lower']) / bb['middle']
    bb_percentile = bb_width.rolling(100).apply(
        lambda x: (x.iloc[-1] <= x).sum() / len(x) * 100
    )

    # 加權平均
    score = (atr_percentile * 0.6 + bb_percentile * 0.4)

    return score

def calculate_momentum_score(df):
    """計算動量分數（0-100）"""
    from src.indicators.momentum import RSI, MACD

    rsi = RSI(df['close'], period=14)
    macd = MACD(df['close'])

    # RSI 已經是 0-100
    rsi_score = rsi

    # MACD 標準化
    macd_diff = macd['macd'] - macd['signal']
    macd_percentile = macd_diff.rolling(100).apply(
        lambda x: (x.iloc[-1] <= x).sum() / len(x) * 100
    )

    # 加權
    score = (rsi_score * 0.5 + macd_percentile * 0.5)

    return score
```

## 與指標庫整合

### 專案指標庫位置

```
src/indicators/
├── trend.py           # ADX, DI, MA
├── momentum.py        # RSI, MACD, Stochastic
├── volatility.py      # ATR, Bollinger Bands
└── volume.py          # OBV, Volume SMA
```

### 統一介面

```python
# src/regime/statistical.py

from src.indicators.trend import ADX, DI_Plus, DI_Minus
from src.indicators.volatility import ATR, BollingerBands
from src.indicators.momentum import RSI, MACD

class StatisticalRegimeDetector:
    """基於技術指標的統計方法"""

    def __init__(self, method='simple'):
        """
        Args:
            method: 'simple' | 'advanced' | 'custom'
        """
        self.method = method

    def detect(self, df: pd.DataFrame) -> pd.Series:
        """識別市場狀態

        Args:
            df: 包含 OHLCV 的 DataFrame

        Returns:
            Series of regime labels
        """
        if self.method == 'simple':
            return self._simple_detection(df)
        elif self.method == 'advanced':
            return self._advanced_detection(df)
        else:
            raise ValueError(f"Unknown method: {self.method}")

    def _simple_detection(self, df):
        """簡單 3 指標方法"""
        adx = ADX(df, period=14)
        atr = ATR(df, period=14)
        sma = df['close'].rolling(50).mean()
        sma_slope = sma.diff(10)

        atr_ma = atr.rolling(100).mean()
        high_vol = atr > atr_ma * 1.5

        regime = pd.Series(index=df.index, dtype='object')
        regime[high_vol] = 'high_volatility'
        regime[(adx > 25) & (sma_slope > 0) & ~high_vol] = 'bull_trend'
        regime[(adx > 25) & (sma_slope < 0) & ~high_vol] = 'bear_trend'
        regime[(adx < 20) & ~high_vol] = 'sideways'
        regime.fillna('neutral', inplace=True)

        return regime

    def _advanced_detection(self, df):
        """進階多指標方法"""
        # 使用前面定義的 calculate_*_score 函數
        trend_score = self._calculate_trend_score(df)
        volatility_score = self._calculate_volatility_score(df)

        regime = pd.Series(index=df.index, dtype='object')
        regime[(trend_score > 70) & (volatility_score < 50)] = 'strong_trend'
        regime[(trend_score < 30) & (volatility_score < 40)] = 'sideways'
        regime[volatility_score > 70] = 'high_volatility'
        regime.fillna('neutral', inplace=True)

        return regime

    def _calculate_trend_score(self, df):
        """趨勢分數計算（使用專案指標庫）"""
        adx = ADX(df, period=14)
        di_plus = DI_Plus(df, period=14)
        di_minus = DI_Minus(df, period=14)

        adx_norm = np.clip(adx, 0, 50) * 2
        di_direction = (di_plus - di_minus).clip(-50, 50) + 50

        sma_short = df['close'].rolling(20).mean()
        sma_long = df['close'].rolling(50).mean()
        ma_cross = ((sma_short > sma_long).astype(int) * 100)

        return (adx_norm * 0.5 + di_direction * 0.3 + ma_cross * 0.2)

    def _calculate_volatility_score(self, df):
        """波動分數計算"""
        atr = ATR(df, period=14)
        bb = BollingerBands(df, period=20)

        atr_percentile = atr.rolling(100).apply(
            lambda x: (x.iloc[-1] <= x).sum() / len(x) * 100
        )

        bb_width = (bb['upper'] - bb['lower']) / bb['middle']
        bb_percentile = bb_width.rolling(100).apply(
            lambda x: (x.iloc[-1] <= x).sum() / len(x) * 100
        )

        return (atr_percentile * 0.6 + bb_percentile * 0.4)
```

## 多時間框架整合

### 概念

不同時間框架可能處於不同狀態，結合判斷更穩健。

```
5m:  震盪市
15m: 震盪市
1h:  牛市趨勢  ← 主要趨勢
4h:  牛市趨勢
1d:  牛市趨勢

→ 整體判斷：牛市趨勢（長週期優先）
```

### 實作

```python
def multi_timeframe_regime(df, timeframes=['1h', '4h', '1d']):
    """多時間框架狀態識別

    Args:
        df: 最小時間框架的資料（如 5m）
        timeframes: 要分析的時間框架

    Returns:
        Dict of regime per timeframe + final decision
    """
    from src.data.resample import resample_ohlcv

    detector = StatisticalRegimeDetector(method='simple')
    results = {}

    # 對每個時間框架識別
    for tf in timeframes:
        df_tf = resample_ohlcv(df, tf)
        regime_tf = detector.detect(df_tf)
        results[tf] = regime_tf.iloc[-1]  # 最新狀態

    # 決策邏輯：長週期優先
    if '1d' in results:
        final = results['1d']
    elif '4h' in results:
        final = results['4h']
    else:
        final = results[timeframes[0]]

    # 檢查一致性
    agreement = sum(1 for r in results.values() if r == final) / len(results)

    return {
        'timeframes': results,
        'final_regime': final,
        'agreement': agreement  # 0-1，越高越一致
    }
```

### 一致性策略

```python
def regime_with_consistency_filter(df):
    """要求多時框一致才確認狀態"""

    mtf_result = multi_timeframe_regime(df, ['15m', '1h', '4h'])

    # 只有 2/3 以上一致才確認
    if mtf_result['agreement'] >= 0.67:
        return mtf_result['final_regime']
    else:
        # 不一致時保持 neutral，避免誤判
        return 'neutral'
```

## 實戰優化技巧

### 1. 動態閾值

固定閾值（如 ADX > 25）在不同市場可能不適用。

```python
def adaptive_threshold(indicator, percentile=70):
    """自適應閾值"""
    # 使用滾動百分位作為閾值
    threshold = indicator.rolling(100).quantile(percentile / 100)
    return threshold

# 使用
adx = ADX(df, period=14)
adx_threshold = adaptive_threshold(adx, percentile=70)

strong_trend = adx > adx_threshold  # 動態判斷
```

### 2. 平滑狀態切換

避免頻繁切換導致過度交易。

```python
def smooth_regime_transitions(regimes, min_duration=5):
    """平滑狀態轉換

    Args:
        regimes: Series of regime labels
        min_duration: 最小持續週期

    Returns:
        Smoothed regime series
    """
    smoothed = regimes.copy()

    i = 0
    while i < len(regimes):
        current = regimes.iloc[i]

        # 找到下一個不同狀態
        j = i + 1
        while j < len(regimes) and regimes.iloc[j] == current:
            j += 1

        # 持續期太短，改為前一個狀態
        if (j - i) < min_duration and i > 0:
            smoothed.iloc[i:j] = regimes.iloc[i - 1]

        i = j

    return smoothed
```

### 3. 狀態轉換過濾

只在高信心度時切換狀態。

```python
class RegimeWithTransitionFilter:
    """帶轉換過濾的狀態識別器"""

    def __init__(self, base_detector, transition_threshold=0.7):
        """
        Args:
            base_detector: 基礎檢測器（HMM/RF/等）
            transition_threshold: 切換所需的最低信心度
        """
        self.detector = base_detector
        self.threshold = transition_threshold
        self.current_regime = None

    def detect(self, df):
        """檢測狀態，但只在高信心度時切換"""

        # 取得基礎檢測結果
        result = self.detector.detect(df)
        new_regime = result['state']
        confidence = result.get('probability', 1.0)

        # 初始化
        if self.current_regime is None:
            self.current_regime = new_regime
            return result

        # 如果與當前不同，檢查信心度
        if new_regime != self.current_regime:
            if confidence >= self.threshold:
                # 信心度夠高，切換
                self.current_regime = new_regime
            else:
                # 信心度不足，保持原狀態
                result['state'] = self.current_regime
                result['filtered'] = True

        return result
```

## 回測驗證

### 驗證指標有效性

```python
def validate_indicator_effectiveness(df, indicator_func, regime_col='regime'):
    """驗證指標對狀態識別的有效性

    Args:
        df: 包含價格和已標記狀態的 DataFrame
        indicator_func: 計算指標的函數
        regime_col: 狀態欄位名稱

    Returns:
        Effectiveness score (0-1)
    """
    indicator = indicator_func(df)

    # 計算不同狀態下的指標分佈差異
    regimes = df[regime_col].unique()
    distributions = {}

    for regime in regimes:
        regime_mask = df[regime_col] == regime
        distributions[regime] = indicator[regime_mask].describe()

    # 計算分佈重疊度（簡化）
    # 理想情況：不同狀態的指標值分佈應該分離

    # 這裡簡化為計算均值差異
    means = [distributions[r]['mean'] for r in regimes]
    mean_range = max(means) - min(means)
    std_avg = np.mean([distributions[r]['std'] for r in regimes])

    # 分離度 = 均值範圍 / 標準差
    separation = mean_range / std_avg if std_avg > 0 else 0

    # 標準化到 0-1（分離度 > 2 視為很好）
    effectiveness = min(separation / 2, 1.0)

    return effectiveness
```

### 完整回測

```python
def backtest_regime_based_strategy(df, regime_detector):
    """回測基於狀態的策略選擇"""

    # 識別狀態
    regimes = regime_detector.detect(df)
    df['regime'] = regimes

    # 根據狀態選擇策略
    returns = []

    for i in range(len(df)):
        regime = df['regime'].iloc[i]

        if regime == 'bull_trend':
            # 趨勢跟隨
            position = 1  # Long
        elif regime == 'bear_trend':
            position = -1  # Short
        elif regime == 'sideways':
            # 均值回歸（簡化）
            position = 0  # 不交易或反向
        elif regime == 'high_volatility':
            # 降低曝險
            position = 0.5  # 減半部位
        else:
            position = 0

        ret = df['close'].pct_change().iloc[i] * position
        returns.append(ret)

    df['strategy_returns'] = returns

    # 計算績效
    total_return = (1 + df['strategy_returns']).prod() - 1
    sharpe = df['strategy_returns'].mean() / df['strategy_returns'].std() * np.sqrt(365)

    print(f"Total Return: {total_return:.2%}")
    print(f"Sharpe Ratio: {sharpe:.2f}")

    return df
```

## 總結

### 推薦組合

| 場景 | 指標組合 | 實作 |
|------|----------|------|
| **快速原型** | ADX + ATR | `simple_regime_detection` |
| **生產環境** | 多指標分數系統 | `advanced_regime_detection` |
| **高頻交易** | 多時間框架 | `multi_timeframe_regime` |
| **穩健性優先** | 帶過濾器的檢測 | `RegimeWithTransitionFilter` |

### 實作步驟

1. **從簡單開始**：ADX + ATR + MA 斜率
2. **回測驗證**：確認狀態識別有改善績效
3. **漸進增強**：加入更多指標，觀察邊際效益
4. **多時框確認**：避免短期雜訊
5. **加入過濾**：減少誤切換

---

**與專案整合範例**：

```python
# src/regime/analyzer.py 的 statistical 部分

from src.regime.statistical import StatisticalRegimeDetector

# 在 UltimateLoop 中使用
detector = StatisticalRegimeDetector(method='advanced')
current_regime = detector.detect(recent_data).iloc[-1]

if current_regime == 'bull_trend':
    strategy = select_strategy(bias='trend_following')
elif current_regime == 'sideways':
    strategy = select_strategy(bias='mean_reversion')
```
