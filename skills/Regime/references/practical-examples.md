# 實戰案例

完整的市場狀態識別到策略選擇實例。

## 案例 1: BTC 永續合約完整流程

### 場景

在 UltimateLoop 中整合狀態識別，根據市場狀態動態選擇策略和調整參數。

### 實作步驟

#### 1. 建立 Regime Analyzer

```python
# src/regime/analyzer.py

from typing import Dict, Literal
import pandas as pd
from .hmm_detector import HMMRegimeDetector
from .statistical import StatisticalRegimeDetector

class RegimeAnalyzer:
    """整合多種狀態識別方法的分析器"""

    def __init__(
        self,
        method: Literal['hmm', 'statistical', 'ensemble'] = 'hmm',
        n_states: int = 3
    ):
        """
        Args:
            method: 識別方法
            n_states: HMM 狀態數（僅 HMM 使用）
        """
        self.method = method

        if method == 'hmm':
            self.detector = HMMRegimeDetector(n_states=n_states)
        elif method == 'statistical':
            self.detector = StatisticalRegimeDetector(method='advanced')
        elif method == 'ensemble':
            # 整合多種方法
            self.hmm = HMMRegimeDetector(n_states=3)
            self.stat = StatisticalRegimeDetector(method='simple')
        else:
            raise ValueError(f"Unknown method: {method}")

        self._is_fitted = False

    def fit(self, df: pd.DataFrame) -> None:
        """訓練模型（僅 HMM 需要）

        Args:
            df: 歷史 OHLCV 資料
        """
        if self.method == 'hmm':
            self.detector.fit(df)
            self._is_fitted = True
        elif self.method == 'ensemble':
            self.hmm.fit(df)
            self._is_fitted = True
        else:
            # Statistical 不需訓練
            self._is_fitted = True

    def detect(self, df: pd.DataFrame) -> Dict:
        """識別當前市場狀態

        Args:
            df: 最近的 OHLCV 資料（建議至少 100 根）

        Returns:
            {
                'state': str,          # 狀態標籤
                'probability': float,  # 信心度
                'confidence': str,     # high/medium/low
                'metadata': dict       # 額外資訊
            }
        """
        if not self._is_fitted:
            raise ValueError("請先呼叫 fit() 訓練模型")

        if self.method == 'ensemble':
            return self._ensemble_detect(df)
        else:
            return self.detector.detect(df)

    def _ensemble_detect(self, df: pd.DataFrame) -> Dict:
        """整合多種方法的檢測"""
        # HMM 結果
        hmm_result = self.hmm.detect(df)

        # Statistical 結果
        stat_regimes = self.stat.detect(df)
        stat_result = {
            'state': stat_regimes.iloc[-1],
            'probability': 1.0  # Statistical 無概率
        }

        # 投票
        if hmm_result['state'] == stat_result['state']:
            # 一致
            final_state = hmm_result['state']
            confidence = 'high'
            probability = hmm_result['probability']
        else:
            # 不一致，選擇 HMM（有概率）
            final_state = hmm_result['state']
            confidence = 'medium'
            probability = hmm_result['probability'] * 0.7  # 降低信心

        return {
            'state': final_state,
            'probability': probability,
            'confidence': confidence,
            'metadata': {
                'hmm': hmm_result,
                'statistical': stat_result
            }
        }

    def get_state_statistics(self, df: pd.DataFrame) -> pd.DataFrame:
        """取得各狀態的統計特性"""

        if self.method == 'statistical':
            regimes = self.detector.detect(df)
        else:
            # HMM
            obs = self.detector._prepare_observations(df)
            states = self.detector.model.predict(obs)
            regimes = pd.Series(
                [self.detector.state_labels[s] for s in states],
                index=df.index
            )

        stats = []
        for regime in regimes.unique():
            mask = regimes == regime
            regime_data = df[mask]

            returns = regime_data['close'].pct_change()

            stats.append({
                'regime': regime,
                'count': mask.sum(),
                'percentage': mask.sum() / len(df),
                'avg_return': returns.mean(),
                'volatility': returns.std(),
                'sharpe': returns.mean() / returns.std() if returns.std() > 0 else 0
            })

        return pd.DataFrame(stats)
```

#### 2. 整合到 UltimateLoop

```python
# src/automation/ultimate_loop.py

from src.regime.analyzer import RegimeAnalyzer

class UltimateLoop:
    def __init__(self, config):
        # ... 現有初始化 ...

        # 新增：Regime Analyzer
        self.regime_analyzer = RegimeAnalyzer(
            method=config.get('regime_method', 'hmm'),
            n_states=3
        )

        self._regime_trained = False

    def run(self, iterations: int):
        """主循環"""

        # 載入歷史資料訓練 Regime Analyzer
        if not self._regime_trained:
            self._train_regime_analyzer()

        for i in range(iterations):
            print(f"\n=== Iteration {i+1}/{iterations} ===")

            # 1. 識別當前市場狀態
            current_regime = self._detect_current_regime()
            print(f"當前市場狀態: {current_regime['state']} (信心度: {current_regime['confidence']})")

            # 2. 根據狀態選擇策略
            strategy = self._select_strategy_by_regime(current_regime)
            print(f"選擇策略: {strategy.name}")

            # 3. 根據狀態調整參數
            params = self._adjust_params_by_regime(strategy, current_regime)

            # 4. 執行回測
            result = self._run_backtest(strategy, params)

            # 5. 驗證
            validation = self._validate_strategy(strategy, params)

            # 6. 記錄（包含狀態資訊）
            self._record_with_regime(result, validation, current_regime)

            # 7. 更新策略評級
            self._update_ratings(result, validation)

    def _train_regime_analyzer(self):
        """訓練 Regime Analyzer"""
        print("正在訓練 Regime Analyzer...")

        # 載入足夠的歷史資料（建議 1000+ 根）
        from src.data.binance_api import BinanceAPI

        api = BinanceAPI()
        df_train = api.fetch_ohlcv(
            symbol='BTC/USDT',
            timeframe='4h',
            limit=2000
        )

        # 訓練
        self.regime_analyzer.fit(df_train)
        self._regime_trained = True

        # 輸出狀態統計
        stats = self.regime_analyzer.get_state_statistics(df_train)
        print("\n市場狀態統計:")
        print(stats)

    def _detect_current_regime(self) -> Dict:
        """識別當前市場狀態"""
        from src.data.binance_api import BinanceAPI

        api = BinanceAPI()
        df_recent = api.fetch_ohlcv(
            symbol='BTC/USDT',
            timeframe='4h',
            limit=200  # 最近 200 根用於判斷
        )

        regime = self.regime_analyzer.detect(df_recent)

        return regime

    def _select_strategy_by_regime(self, regime: Dict) -> Strategy:
        """根據市場狀態選擇策略

        Args:
            regime: 狀態檢測結果

        Returns:
            選擇的策略實例
        """
        state = regime['state']

        # 定義狀態到策略類型的映射
        regime_strategy_weights = {
            'bull_trend': {
                'trend_following': 0.6,
                'breakout': 0.3,
                'mean_reversion': 0.1
            },
            'bear_trend': {
                'trend_following': 0.5,  # Short bias
                'mean_reversion': 0.3,
                'breakout': 0.2
            },
            'sideways': {
                'mean_reversion': 0.6,
                'range_trading': 0.3,
                'trend_following': 0.1
            },
            'high_volatility': {
                'scalping': 0.5,
                'breakout': 0.3,
                'mean_reversion': 0.2
            },
            'neutral': {
                'trend_following': 0.4,
                'mean_reversion': 0.4,
                'breakout': 0.2
            }
        }

        # 取得對應的權重
        weights = regime_strategy_weights.get(state, regime_strategy_weights['neutral'])

        # 根據權重隨機選擇（80% exploit / 20% explore）
        if np.random.rand() < 0.8:
            # Exploit: 使用狀態建議的權重
            strategy_type = np.random.choice(
                list(weights.keys()),
                p=list(weights.values())
            )
        else:
            # Explore: 隨機選擇
            strategy_type = np.random.choice(list(self.strategy_pool.keys()))

        # 從池中取得策略
        strategy = self.strategy_pool[strategy_type]

        return strategy

    def _adjust_params_by_regime(self, strategy: Strategy, regime: Dict) -> Dict:
        """根據市場狀態調整策略參數

        Args:
            strategy: 選定的策略
            regime: 狀態檢測結果

        Returns:
            調整後的參數
        """
        state = regime['state']
        confidence = regime['probability']

        # 基礎參數（Bayesian 優化產生）
        base_params = self.optimizer.suggest_params(strategy)

        # 根據狀態調整
        adjusted_params = base_params.copy()

        if state == 'high_volatility':
            # 高波動：降低槓桿、緊止損
            adjusted_params['leverage'] = min(base_params.get('leverage', 10), 5)
            adjusted_params['stop_loss_pct'] = base_params.get('stop_loss_pct', 0.02) * 0.7

        elif state in ['bull_trend', 'bear_trend']:
            # 趨勢市：放寬止損、提高槓桿
            adjusted_params['leverage'] = min(base_params.get('leverage', 10), 15)
            adjusted_params['stop_loss_pct'] = base_params.get('stop_loss_pct', 0.02) * 1.3

        elif state == 'sideways':
            # 震盪市：緊止損、快速獲利了結
            adjusted_params['stop_loss_pct'] = base_params.get('stop_loss_pct', 0.02) * 0.8
            adjusted_params['take_profit_pct'] = base_params.get('take_profit_pct', 0.04) * 0.8

        # 根據信心度調整部位大小
        if confidence < 0.5:
            # 低信心：減少部位
            adjusted_params['position_size'] = base_params.get('position_size', 1.0) * 0.7

        return adjusted_params

    def _record_with_regime(self, result, validation, regime):
        """記錄實驗結果（包含狀態資訊）"""

        from src.learning.recorder import ExperimentRecorder

        recorder = ExperimentRecorder()

        # 原有記錄欄位 + 狀態資訊
        record = {
            **result,
            **validation,
            'regime_state': regime['state'],
            'regime_confidence': regime['probability'],
            'regime_metadata': regime.get('metadata', {})
        }

        recorder.record(record)

        # 判斷是否記錄洞察
        if self._should_record_insight(result, regime):
            self._record_regime_insight(result, regime)

    def _should_record_insight(self, result, regime) -> bool:
        """判斷是否值得記錄狀態相關洞察"""

        # 狀態預測準確的情況
        if regime['state'] == 'bull_trend' and result['sharpe'] > 1.5:
            return True

        # 狀態預測不準的情況（學習教訓）
        if regime['state'] == 'bull_trend' and result['sharpe'] < 0.5:
            return True

        # 高波動狀態的特殊發現
        if regime['state'] == 'high_volatility' and result['max_drawdown'] < 0.15:
            return True

        return False

    def _record_regime_insight(self, result, regime):
        """記錄狀態相關洞察到 learning/insights.md"""

        from src.learning.memory import store_insight

        insight = f"""
#### Regime-Based Strategy: {result['strategy_name']}
- **市場狀態**: {regime['state']} (信心度: {regime['probability']:.2%})
- **績效**: Sharpe {result['sharpe']:.2f}, Return {result['total_return']:.2%}, MaxDD {result['max_drawdown']:.2%}
- **洞察**: {'狀態判斷準確，策略表現符合預期' if result['sharpe'] > 1.0 else '狀態判斷可能有誤或策略不適配'}
- **日期**: {datetime.now().strftime('%Y-%m-%d')}
        """.strip()

        # 寫入 insights.md
        store_insight(
            content=insight,
            tags=f"regime,{regime['state']},{result['strategy_name']}"
        )
```

#### 3. 配置檔案

```yaml
# config/ultimate_loop.yaml

regime_detection:
  enabled: true
  method: "hmm"  # hmm | statistical | ensemble
  n_states: 3

  # 狀態到策略的映射（覆蓋預設）
  strategy_weights:
    bull_trend:
      trend_following: 0.6
      breakout: 0.3
      mean_reversion: 0.1

    bear_trend:
      trend_following: 0.5
      mean_reversion: 0.3
      breakout: 0.2

    sideways:
      mean_reversion: 0.6
      range_trading: 0.3
      trend_following: 0.1

    high_volatility:
      scalping: 0.5
      breakout: 0.3
      mean_reversion: 0.2

  # 參數調整規則
  param_adjustments:
    high_volatility:
      leverage: 0.5  # 乘數
      stop_loss_pct: 0.7

    trend:
      leverage: 1.2
      stop_loss_pct: 1.3

    sideways:
      stop_loss_pct: 0.8
      take_profit_pct: 0.8
```

#### 4. 執行範例

```bash
# 啟動 Ultimate Loop（自動整合 Regime Detection）
python run_ultimate_loop.py 100 --monitor

# 監控 Dashboard 會顯示當前市場狀態
```

**Dashboard 輸出範例**：

```
=== Iteration 42/100 ===

當前市場狀態: bull_trend (信心度: high)
  - HMM 概率: Bull 78%, Neutral 15%, Bear 7%
  - 統計指標: ADX 32, ATR Percentile 45

選擇策略: MA Cross Trend Following v2.1
  - 基於狀態調整: 槓桿 10→12, 止損 2%→2.6%

回測中...
  ✓ Sharpe: 1.85
  ✓ Return: 23.4%
  ✓ MaxDD: 12.3%

5 階段驗證中...
  ✓ Out-of-Sample: Pass
  ✓ Monte Carlo: 85% 通過率
  ✓ Walk-Forward: 一致性 0.78
  ✓ Stress Test: Pass
  ✓ Regime Stability: Pass

記錄洞察: Bull 趨勢狀態下 Trend Following 策略表現優異
```

## 案例 2: 狀態切換警報系統

### 場景

實時監控市場狀態，當狀態切換時發送警報並建議調整。

### 實作

```python
# src/regime/monitor.py

import time
from datetime import datetime
from typing import Optional
import pandas as pd

class RegimeMonitor:
    """市場狀態監控系統"""

    def __init__(self, analyzer: RegimeAnalyzer, check_interval: int = 3600):
        """
        Args:
            analyzer: 訓練好的 RegimeAnalyzer
            check_interval: 檢查間隔（秒）
        """
        self.analyzer = analyzer
        self.interval = check_interval
        self.current_state = None
        self.state_history = []

    def start(self, symbol: str = 'BTC/USDT', timeframe: str = '4h'):
        """啟動監控"""
        print(f"開始監控 {symbol} 市場狀態（間隔 {self.interval}秒）...")

        from src.data.binance_api import BinanceAPI
        api = BinanceAPI()

        while True:
            try:
                # 取得最新資料
                df = api.fetch_ohlcv(symbol, timeframe, limit=200)

                # 識別狀態
                regime = self.analyzer.detect(df)

                # 檢查是否切換
                if self._state_changed(regime):
                    self._on_state_change(regime)

                # 記錄
                self.state_history.append({
                    'timestamp': datetime.now(),
                    'state': regime['state'],
                    'probability': regime['probability']
                })

                # 等待
                time.sleep(self.interval)

            except Exception as e:
                print(f"監控錯誤: {e}")
                time.sleep(60)  # 錯誤後短暫等待

    def _state_changed(self, new_regime: Dict) -> bool:
        """檢查狀態是否切換"""
        if self.current_state is None:
            self.current_state = new_regime
            return True  # 初始化視為切換

        return new_regime['state'] != self.current_state['state']

    def _on_state_change(self, new_regime: Dict):
        """狀態切換處理"""
        old_state = self.current_state['state'] if self.current_state else 'Unknown'
        new_state = new_regime['state']

        print(f"\n🚨 市場狀態切換！")
        print(f"  {old_state} → {new_state}")
        print(f"  信心度: {new_regime['probability']:.2%}")
        print(f"  時間: {datetime.now()}")

        # 建議調整
        suggestions = self._get_suggestions(new_state)
        print(f"\n建議:")
        for s in suggestions:
            print(f"  - {s}")

        # 發送通知（可選）
        # self._send_notification(old_state, new_state)

        # 更新當前狀態
        self.current_state = new_regime

    def _get_suggestions(self, state: str) -> list:
        """根據狀態給出建議"""
        suggestions = {
            'bull_trend': [
                "切換至 Trend Following 策略",
                "提高槓桿至 10-15x",
                "放寬止損至 2.5-3%",
                "考慮加大部位"
            ],
            'bear_trend': [
                "考慮做空或退出",
                "降低槓桿至 5-10x",
                "緊縮止損至 1.5-2%",
                "減少倉位或觀望"
            ],
            'sideways': [
                "切換至 Mean Reversion 策略",
                "降低槓桿至 5x",
                "緊縮止損至 1-1.5%",
                "快速獲利了結"
            ],
            'high_volatility': [
                "⚠️ 高波動警告！",
                "大幅降低槓桿至 3-5x",
                "緊縮止損至 1%",
                "考慮暫停交易或減倉",
                "啟用尾隨止損"
            ]
        }

        return suggestions.get(state, ["未知狀態，保持謹慎"])

    def get_state_duration(self) -> Optional[float]:
        """取得當前狀態持續時間（小時）"""
        if len(self.state_history) < 2:
            return None

        # 找到最近的狀態切換點
        current_state = self.current_state['state']
        duration_records = []

        for record in reversed(self.state_history):
            if record['state'] == current_state:
                duration_records.append(record)
            else:
                break

        if len(duration_records) < 2:
            return None

        start = duration_records[-1]['timestamp']
        end = duration_records[0]['timestamp']

        return (end - start).total_seconds() / 3600  # 小時

# 使用範例
if __name__ == '__main__':
    # 建立並訓練分析器
    analyzer = RegimeAnalyzer(method='hmm', n_states=3)

    from src.data.binance_api import BinanceAPI
    api = BinanceAPI()
    df_train = api.fetch_ohlcv('BTC/USDT', '4h', limit=2000)
    analyzer.fit(df_train)

    # 啟動監控
    monitor = RegimeMonitor(analyzer, check_interval=3600)  # 每小時
    monitor.start('BTC/USDT', '4h')
```

## 案例 3: 狀態穩定性驗證

### 場景

驗證識別的狀態是否穩定、可靠，避免誤判。

### 實作

```python
# src/regime/validator.py

class RegimeValidator:
    """狀態識別穩定性驗證"""

    @staticmethod
    def validate_regime_stability(
        df: pd.DataFrame,
        analyzer: RegimeAnalyzer,
        window_size: int = 50,
        consistency_threshold: float = 0.7
    ) -> Dict:
        """驗證狀態識別的穩定性

        Args:
            df: 歷史資料
            analyzer: 訓練好的分析器
            window_size: 滾動窗口大小
            consistency_threshold: 一致性閾值

        Returns:
            {
                'is_stable': bool,
                'consistency_score': float,
                'flip_count': int,
                'details': dict
            }
        """
        regimes = []

        # 滾動窗口識別
        for i in range(len(df) - window_size):
            window_df = df.iloc[i:i + window_size]
            regime = analyzer.detect(window_df)
            regimes.append(regime['state'])

        regimes = pd.Series(regimes)

        # 計算一致性
        mode_regime = regimes.mode()[0]
        consistency = (regimes == mode_regime).sum() / len(regimes)

        # 計算狀態翻轉次數
        flip_count = (regimes != regimes.shift()).sum()

        # 判斷穩定性
        is_stable = (
            consistency >= consistency_threshold and
            flip_count < len(regimes) * 0.3  # 翻轉不超過 30%
        )

        return {
            'is_stable': is_stable,
            'consistency_score': consistency,
            'flip_count': flip_count,
            'mode_regime': mode_regime,
            'regime_distribution': regimes.value_counts().to_dict()
        }

    @staticmethod
    def compare_regime_methods(
        df: pd.DataFrame,
        methods: list = ['hmm', 'statistical']
    ) -> pd.DataFrame:
        """比較不同方法的識別結果"""

        results = []

        for method in methods:
            analyzer = RegimeAnalyzer(method=method)

            # 訓練（如需要）
            if method == 'hmm':
                analyzer.fit(df[:1000])  # 用前 1000 筆訓練

            # 識別
            if method == 'statistical':
                regimes = analyzer.detector.detect(df)
            else:
                obs = analyzer.detector._prepare_observations(df)
                states = analyzer.detector.model.predict(obs)
                regimes = pd.Series([
                    analyzer.detector.state_labels[s] for s in states
                ])

            # 統計
            for regime in regimes.unique():
                mask = regimes == regime
                regime_data = df[mask]
                returns = regime_data['close'].pct_change()

                results.append({
                    'method': method,
                    'regime': regime,
                    'count': mask.sum(),
                    'avg_return': returns.mean(),
                    'volatility': returns.std(),
                    'sharpe': returns.mean() / returns.std() if returns.std() > 0 else 0
                })

        return pd.DataFrame(results)
```

## 總結

### 整合檢查清單

- [ ] 建立 `RegimeAnalyzer` 類別（`src/regime/analyzer.py`）
- [ ] 整合到 `UltimateLoop`（訓練、檢測、策略選擇）
- [ ] 根據狀態調整參數（槓桿、止損、部位）
- [ ] 記錄狀態資訊到實驗記錄
- [ ] 判斷並記錄狀態相關洞察
- [ ] 配置狀態到策略的映射（YAML）
- [ ] 實作狀態監控系統（可選）
- [ ] 驗證穩定性（Walk-Forward）

### 預期效果

根據文獻和研究：
- 風險調整回報提升 **10-30%**
- 最大回撤降低 **10-30%**
- Sharpe Ratio 提升（HMM 案例: **+1.7**）

### 下一步

1. 實作 `RegimeAnalyzer` 基礎版本
2. 在 100 次 Loop 中測試效果
3. 分析哪些狀態判斷準確、哪些不準
4. 迭代改進狀態定義和策略映射

---

**實作優先級**：
1. **高**：整合基本 HMM 識別到 Loop
2. **中**：根據狀態調整參數
3. **低**：實時監控系統（實盤階段再做）
