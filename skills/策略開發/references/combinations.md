# 策略組合模式

> 如何將多個元素組合成完整策略

## 組合層次

```
策略組合金字塔
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Level 4: 聰明錢 (SMC)
        ┃
        ┃  Order Block, FVG, Liquidity
━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━
    Level 3: 結構分析
        ┃
        ┃  支撐阻力, 趨勢線, 形態
━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━
    Level 2: 多週期 (MTF)
        ┃
        ┃  HTF 定方向, LTF 找進場
━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━
    Level 1: 基礎指標
        ┃
        ┃  MA, RSI, ATR, MACD...
━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━

越高層次，越接近機構思維
可以單獨使用，也可以組合使用
```

---

## 組合模式

### 模式 1：層疊過濾器

```python
"""
層疊過濾器：每層過濾掉不符合條件的訊號

優點：高勝率
缺點：訊號較少
"""

class LayeredFilterStrategy:
    """
    範例：趨勢 + 結構 + 動量 三層過濾
    """

    def generate_signals(self, data):
        # Layer 1: 趨勢過濾
        ma200 = data['close'].rolling(200).mean()
        uptrend = data['close'] > ma200
        downtrend = data['close'] < ma200

        # Layer 2: 結構過濾
        sr_levels = find_sr_zones(data)
        near_support = is_near_support(data['close'], sr_levels)
        near_resistance = is_near_resistance(data['close'], sr_levels)

        # Layer 3: 動量過濾
        rsi = calculate_rsi(data['close'])
        oversold = rsi < 30
        overbought = rsi > 70

        # 組合：所有層都通過
        long_entry = uptrend & near_support & oversold
        short_entry = downtrend & near_resistance & overbought

        return long_entry, short_entry
```

### 模式 2：權重評分

```python
"""
權重評分：每個條件給分，總分超過閾值進場

優點：靈活，不會因單一條件錯失機會
缺點：參數多，需要調校
"""

class ScoringStrategy:
    """
    範例：多因子評分策略
    """

    weights = {
        'trend': 3,      # 趨勢權重高
        'structure': 2,
        'momentum': 2,
        'volume': 1,
    }

    threshold = 5  # 總分 >= 5 進場

    def generate_signals(self, data):
        score = pd.Series(0, index=data.index)

        # 趨勢得分
        ma200 = data['close'].rolling(200).mean()
        score += (data['close'] > ma200).astype(int) * self.weights['trend']

        # 結構得分
        near_support = self.check_near_support(data)
        score += near_support.astype(int) * self.weights['structure']

        # 動量得分
        rsi = calculate_rsi(data['close'])
        score += (rsi < 40).astype(int) * self.weights['momentum']

        # 成交量得分
        volume_surge = data['volume'] > data['volume'].rolling(20).mean()
        score += volume_surge.astype(int) * self.weights['volume']

        # 進場：總分超過閾值
        long_entry = score >= self.threshold

        return long_entry
```

### 模式 3：狀態機

```python
"""
狀態機：根據市場狀態切換策略

優點：適應不同市場環境
缺點：狀態判斷複雜
"""

class StateMachineStrategy:
    """
    範例：根據市場狀態切換策略
    """

    def get_market_state(self, data):
        """判斷市場狀態"""
        adx = calculate_adx(data)

        if adx.iloc[-1] > 25:
            return 'trending'
        else:
            return 'ranging'

    def generate_signals(self, data):
        state = self.get_market_state(data)

        if state == 'trending':
            # 趨勢市場：使用趨勢跟隨策略
            return self.trend_following_signals(data)
        else:
            # 區間市場：使用均值回歸策略
            return self.mean_reversion_signals(data)

    def trend_following_signals(self, data):
        """趨勢跟隨：順勢進場"""
        ma_fast = data['close'].rolling(10).mean()
        ma_slow = data['close'].rolling(30).mean()

        long_entry = (ma_fast > ma_slow) & (ma_fast.shift(1) <= ma_slow.shift(1))
        short_entry = (ma_fast < ma_slow) & (ma_fast.shift(1) >= ma_slow.shift(1))

        return long_entry, short_entry

    def mean_reversion_signals(self, data):
        """均值回歸：超買超賣進場"""
        rsi = calculate_rsi(data['close'])

        long_entry = rsi < 30
        short_entry = rsi > 70

        return long_entry, short_entry
```

### 模式 4：確認序列

```python
"""
確認序列：訊號出現後，等待確認再進場

優點：避免假訊號
缺點：進場較晚
"""

class ConfirmationStrategy:
    """
    範例：訊號 + 確認 K 線
    """

    def generate_signals(self, data):
        # 初始訊號：RSI 超賣
        rsi = calculate_rsi(data['close'])
        initial_signal = rsi < 30

        # 確認：下一根 K 線收漲
        confirmation = data['close'] > data['open']

        # 組合：初始訊號後的確認
        long_entry = initial_signal.shift(1) & confirmation

        return long_entry
```

---

## 經典組合範例

### 組合 1：MTF + 指標

```python
class MTFIndicatorStrategy:
    """
    高週期定方向 + 低週期指標進場

    HTF (4H): MA50 > MA200 = 上升趨勢
    LTF (1H): RSI < 30 = 進場
    """

    def generate_signals(self, data_1h):
        # HTF 趨勢
        data_4h = resample_to_4h(data_1h)
        htf_uptrend = data_4h['close'].rolling(50).mean() > \
                      data_4h['close'].rolling(200).mean()

        # 對齊到 LTF
        ltf_uptrend = align_to_ltf(htf_uptrend, data_1h.index)

        # LTF 進場
        rsi = calculate_rsi(data_1h['close'])

        long_entry = ltf_uptrend & (rsi < 30)

        return long_entry
```

### 組合 2：結構 + SMC

```python
class StructureSMCStrategy:
    """
    傳統支撐阻力 + 聰明錢概念

    1. 找到重要支撐阻力區
    2. 在該區域找 Order Block
    3. 等待流動性獵殺確認
    """

    def generate_signals(self, data):
        # 傳統結構
        sr_levels = find_sr_zones(data)

        # SMC
        bullish_ob, bearish_ob = find_order_blocks(data)
        liquidity = find_liquidity_zones(data)
        bullish_sweep, _ = detect_liquidity_sweep(data, liquidity)

        # 組合：SR 區域內的 OB + Liquidity Sweep
        near_sr = is_near_sr(data['close'], sr_levels)
        has_ob = bullish_ob.rolling(5).max() > 0

        long_entry = near_sr & has_ob & bullish_sweep

        return long_entry
```

### 組合 3：指標 + 形態

```python
class IndicatorPatternStrategy:
    """
    指標超賣 + K 線形態確認

    1. RSI 超賣
    2. 出現吞噬形態
    3. 進場
    """

    def generate_signals(self, data):
        # 指標
        rsi = calculate_rsi(data['close'])
        oversold = rsi < 30

        # 形態
        bullish_engulf = detect_bullish_engulfing(data)

        # 組合
        long_entry = oversold & bullish_engulf

        return long_entry
```

### 組合 4：全方位策略

```python
class ComprehensiveStrategy:
    """
    全方位組合：MTF + 結構 + SMC + 指標

    1. HTF 趨勢過濾
    2. HTF 結構區域
    3. LTF Order Block
    4. LTF 動量確認
    """

    def generate_signals(self, data_15m):
        # ===== HTF (4H) =====
        data_4h = resample(data_15m, '4H')

        # 趨勢
        htf_uptrend = data_4h['close'] > data_4h['close'].rolling(200).mean()

        # 結構
        htf_sr = find_sr_zones(data_4h)

        # ===== LTF (15M) =====
        # Order Block
        bullish_ob, _ = find_order_blocks(data_15m)

        # 動量
        rsi = calculate_rsi(data_15m['close'])

        # ===== 對齊 =====
        ltf_uptrend = align_to_ltf(htf_uptrend, data_15m.index)
        near_htf_support = is_near_sr(data_15m['close'], htf_sr, 'support')

        # ===== 組合 =====
        long_entry = (
            ltf_uptrend &                    # HTF 上升趨勢
            near_htf_support &               # 接近 HTF 支撐
            bullish_ob.rolling(3).max() > 0 &  # 有 Bullish OB
            (rsi < 40)                       # 動量超賣
        )

        return long_entry
```

---

## 組合設計指南

### 選擇原則

| 市場類型 | 推薦組合 |
|----------|----------|
| 強趨勢 | MTF + 趨勢指標 |
| 區間震盪 | 結構 + 動量指標 |
| 高流動性 | SMC + 結構 |
| 低波動 | 指標 + 形態確認 |

### 組合複雜度

```
簡單（2 元素）
├── 趨勢 + 動量
├── 結構 + 確認
└── MTF + 指標

中等（3 元素）
├── MTF + 結構 + 動量
├── 趨勢 + SMC + 確認
└── 結構 + 指標 + 形態

複雜（4+ 元素）
├── MTF + 結構 + SMC + 動量
└── 全方位策略

建議：從簡單開始，逐步增加
```

### 過度組合警告 ⚠️

```
❌ 過度組合的徵兆：
- 訊號極少（每月 < 5 次）
- 參數超過 10 個
- 邏輯難以解釋
- 回測完美但實盤差

✅ 良好組合的特徵：
- 訊號合理頻率
- 每個元素有明確作用
- 邏輯可解釋
- 穩健性測試通過
```

---

## 組合驗證清單

設計組合策略後，確認：

- [ ] **每個元素有明確作用**：能說明為何需要
- [ ] **沒有冗餘**：沒有重複功能的元素
- [ ] **邏輯合理**：AND/OR 邏輯正確
- [ ] **訊號頻率適當**：不會太多或太少
- [ ] **可參數化**：關鍵參數可優化
- [ ] **可解釋**：能向他人解釋策略邏輯
