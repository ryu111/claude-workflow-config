# Hidden Markov Models for Regime Detection

詳細說明如何使用 HMM 進行市場狀態識別。

## 核心概念

### 什麼是 HMM？

Hidden Markov Model（隱馬可夫模型）假設：
- 市場存在「隱藏狀態」（Bull / Bear / Neutral）
- 狀態本身不可觀察，只能透過「觀察值」（價格、報酬率）推斷
- 狀態之間會隨時間「轉換」（Transition）

**關鍵假設**：
1. **Markov Property**：未來狀態只依賴當前狀態，與歷史無關
2. **Hidden States**：真實狀態無法直接觀察
3. **Emission Probability**：每個狀態產生觀察值的概率分佈

### HMM vs 簡單分類

| 特點 | 簡單分類（if-else） | HMM |
|------|---------------------|-----|
| **狀態判斷** | 硬分類（是/否） | 概率分佈 |
| **狀態切換** | 即時切換 | 漸進式轉換 |
| **不確定性** | 無法表達 | 輸出概率 |
| **訓練** | 規則制定 | 自動學習 |
| **穩定性** | 容易震盪 | 較平滑 |

## HMM 三大問題

| 問題 | 說明 | 演算法 |
|------|------|--------|
| **Evaluation** | 給定模型，計算觀察序列概率 | Forward-Backward |
| **Decoding** | 給定觀察，推斷最可能的狀態序列 | Viterbi |
| **Learning** | 從資料學習模型參數 | Baum-Welch (EM) |

**交易中主要使用**：Learning（訓練）+ Decoding（預測）

## 模型架構

### 1. 狀態數量選擇

| 狀態數 | 解釋 | 適用場景 |
|--------|------|----------|
| **2 狀態** | Bull / Bear | 簡單趨勢判斷 |
| **3 狀態** | Bull / Bear / Neutral | **最常見**，平衡複雜度 |
| **4+ 狀態** | 細分波動/趨勢 | 容易過擬合，不建議 |

**建議**：從 3 狀態開始，除非有明確理由增加複雜度。

### 2. 觀察變數選擇

| 變數類型 | 範例 | 優缺點 |
|----------|------|--------|
| **報酬率** | 日報酬率 | 簡單，但忽略波動 |
| **報酬率 + 波動** | (return, volatility) | 更完整，常用 |
| **多指標** | (return, volume, ATR) | 資訊豐富，但維度詛咒 |

**建議**：報酬率 + 波動率（2D）最常見且效果好。

### 3. 分佈類型

| 分佈 | 適用 | 實作 |
|------|------|------|
| **Gaussian** | 報酬率近似常態 | `GaussianHMM` |
| **Mixture** | 複雜分佈 | `GMMHMM` |
| **Student-t** | 厚尾分佈（金融常見） | 需自訂 |

**建議**：先用 Gaussian，若效果不佳再考慮 Mixture。

## Python 實作

### 基本範例（hmmlearn）

```python
import numpy as np
from hmmlearn import hmm
import pandas as pd

# 1. 準備資料
def prepare_data(df):
    """準備 HMM 輸入資料"""
    # 計算報酬率
    returns = df['close'].pct_change().fillna(0)

    # 計算波動率（滾動標準差）
    volatility = returns.rolling(window=20).std().fillna(0)

    # 組合為觀察序列 (N, 2)
    observations = np.column_stack([returns, volatility])

    return observations

# 2. 建立和訓練模型
def train_hmm(observations, n_states=3):
    """訓練 HMM 模型"""

    # 建立 Gaussian HMM
    model = hmm.GaussianHMM(
        n_components=n_states,      # 狀態數量
        covariance_type="full",      # 完整協方差矩陣
        n_iter=100,                  # EM 迭代次數
        random_state=42
    )

    # 訓練模型
    model.fit(observations)

    return model

# 3. 預測狀態
def predict_regime(model, observations):
    """預測市場狀態"""

    # Viterbi 解碼：找最可能的狀態序列
    states = model.predict(observations)

    # 狀態概率
    state_probs = model.predict_proba(observations)

    return states, state_probs

# 4. 完整流程
df = pd.read_csv('btc_data.csv')
observations = prepare_data(df)

# 訓練
model = train_hmm(observations, n_states=3)

# 預測
states, probs = predict_regime(model, observations)

# 加回 DataFrame
df['regime'] = states
df['regime_prob'] = probs.max(axis=1)  # 最高概率

print(df[['close', 'regime', 'regime_prob']].tail())
```

### 進階：狀態解釋

```python
def interpret_states(model, observations, states):
    """解釋每個狀態的特性"""

    n_states = model.n_components

    for state in range(n_states):
        # 找出該狀態的資料點
        state_mask = (states == state)
        state_obs = observations[state_mask]

        # 計算該狀態的統計特徵
        mean_return = state_obs[:, 0].mean()
        mean_vol = state_obs[:, 1].mean()

        # 分類狀態
        if mean_return > 0.001 and mean_vol < 0.02:
            label = "Bull (低波上漲)"
        elif mean_return < -0.001 and mean_vol > 0.02:
            label = "Bear (高波下跌)"
        else:
            label = "Neutral (橫盤)"

        print(f"State {state}: {label}")
        print(f"  平均報酬: {mean_return:.4f}")
        print(f"  平均波動: {mean_vol:.4f}")
        print(f"  佔比: {state_mask.sum() / len(states):.2%}\n")
```

### 狀態轉換機率

```python
def analyze_transitions(model):
    """分析狀態轉換機率"""

    # 轉換矩陣 (n_states, n_states)
    trans_mat = model.transmat_

    print("狀態轉換機率矩陣：")
    print(pd.DataFrame(
        trans_mat,
        columns=[f'State {i}' for i in range(len(trans_mat))],
        index=[f'State {i}' for i in range(len(trans_mat))]
    ))

    # 分析穩定性
    for i in range(len(trans_mat)):
        # 對角線 = 保持在同一狀態的機率
        stability = trans_mat[i, i]
        print(f"State {i} 穩定性: {stability:.2%}")
```

## 專案整合

### src/regime/hmm_detector.py

```python
"""
HMM-based Regime Detector
"""
import numpy as np
import pandas as pd
from hmmlearn import hmm
from typing import Dict, Tuple

class HMMRegimeDetector:
    """使用 HMM 進行市場狀態識別"""

    def __init__(self, n_states: int = 3, lookback: int = 20):
        """
        Args:
            n_states: 隱藏狀態數量（建議 2-3）
            lookback: 波動率計算窗口
        """
        self.n_states = n_states
        self.lookback = lookback
        self.model = None
        self.state_labels = {}  # 狀態標籤映射

    def fit(self, df: pd.DataFrame) -> None:
        """訓練 HMM 模型

        Args:
            df: 包含 'close' 欄位的價格資料
        """
        # 準備觀察序列
        observations = self._prepare_observations(df)

        # 建立模型
        self.model = hmm.GaussianHMM(
            n_components=self.n_states,
            covariance_type="full",
            n_iter=100,
            random_state=42
        )

        # 訓練
        self.model.fit(observations)

        # 自動標記狀態
        states = self.model.predict(observations)
        self.state_labels = self._label_states(observations, states)

    def detect(self, df: pd.DataFrame) -> Dict[str, any]:
        """識別當前市場狀態

        Args:
            df: 最近的價格資料

        Returns:
            {
                'state': 'bull' | 'bear' | 'neutral',
                'probability': float,  # 該狀態的概率
                'confidence': 'high' | 'medium' | 'low'
            }
        """
        if self.model is None:
            raise ValueError("模型尚未訓練，請先呼叫 fit()")

        # 準備觀察序列
        observations = self._prepare_observations(df)

        # 預測狀態
        state_num = self.model.predict(observations)[-1]
        probs = self.model.predict_proba(observations)[-1]

        # 取得標籤
        state_label = self.state_labels[state_num]
        prob = probs[state_num]

        # 判斷信心度
        if prob > 0.7:
            confidence = 'high'
        elif prob > 0.5:
            confidence = 'medium'
        else:
            confidence = 'low'

        return {
            'state': state_label,
            'probability': prob,
            'confidence': confidence,
            'all_probs': {
                self.state_labels[i]: p
                for i, p in enumerate(probs)
            }
        }

    def _prepare_observations(self, df: pd.DataFrame) -> np.ndarray:
        """準備 HMM 觀察序列"""
        # 報酬率
        returns = df['close'].pct_change().fillna(0)

        # 波動率
        volatility = returns.rolling(window=self.lookback).std().fillna(0)

        # 組合
        return np.column_stack([returns, volatility])

    def _label_states(self, observations: np.ndarray, states: np.ndarray) -> Dict[int, str]:
        """根據統計特徵自動標記狀態"""
        labels = {}

        for state in range(self.n_states):
            mask = (states == state)
            obs = observations[mask]

            mean_return = obs[:, 0].mean()
            mean_vol = obs[:, 1].mean()

            # 分類邏輯
            if mean_return > 0.001:
                labels[state] = 'bull'
            elif mean_return < -0.001:
                labels[state] = 'bear'
            else:
                labels[state] = 'neutral'

        return labels

    def get_transition_matrix(self) -> pd.DataFrame:
        """取得狀態轉換矩陣"""
        if self.model is None:
            raise ValueError("模型尚未訓練")

        return pd.DataFrame(
            self.model.transmat_,
            columns=[self.state_labels[i] for i in range(self.n_states)],
            index=[self.state_labels[i] for i in range(self.n_states)]
        )
```

### 使用範例

```python
from src.regime.hmm_detector import HMMRegimeDetector
import pandas as pd

# 載入歷史資料
df_train = pd.read_csv('data/btc_historical.csv')
df_recent = df_train.tail(100)  # 最近 100 根 K 線

# 建立檢測器
detector = HMMRegimeDetector(n_states=3)

# 訓練
detector.fit(df_train)

# 檢測當前狀態
regime = detector.detect(df_recent)

print(f"當前狀態: {regime['state']}")
print(f"概率: {regime['probability']:.2%}")
print(f"信心度: {regime['confidence']}")
print(f"所有狀態概率: {regime['all_probs']}")

# 查看狀態轉換矩陣
print("\n狀態轉換機率:")
print(detector.get_transition_matrix())
```

## 調參建議

### 1. 狀態數量

```python
# 使用 BIC/AIC 選擇最佳狀態數
from sklearn.metrics import silhouette_score

def select_n_states(observations, max_states=5):
    """選擇最佳狀態數量"""
    scores = []

    for n in range(2, max_states + 1):
        model = hmm.GaussianHMM(n_components=n, n_iter=100)
        model.fit(observations)

        # 計算 BIC（越小越好）
        log_likelihood = model.score(observations)
        n_params = n * (n + 2)  # 簡化計算
        bic = -2 * log_likelihood + n_params * np.log(len(observations))

        scores.append({'n_states': n, 'bic': bic})

    # 選擇 BIC 最小的
    best = min(scores, key=lambda x: x['bic'])
    return best['n_states']
```

### 2. 協方差類型

| 類型 | 參數數量 | 適用 |
|------|----------|------|
| `spherical` | 少 | 簡單、資料少 |
| `diag` | 中 | **建議**，平衡 |
| `full` | 多 | 複雜、資料多 |

### 3. 訓練窗口

- **太短**（< 500 根）：過擬合，狀態不穩定
- **太長**（> 5000 根）：無法適應市場變化
- **建議**：1000-2000 根 K 線

### 4. Walk-Forward 重訓練

```python
def walk_forward_hmm(df, train_window=1000, test_window=100):
    """Walk-Forward 方式訓練和測試 HMM"""

    detector = HMMRegimeDetector(n_states=3)
    results = []

    for i in range(train_window, len(df), test_window):
        # 訓練窗口
        train_data = df.iloc[i - train_window:i]
        detector.fit(train_data)

        # 測試窗口
        test_data = df.iloc[i:i + test_window]
        for j in range(len(test_data)):
            regime = detector.detect(test_data.iloc[:j+1])
            results.append({
                'date': test_data.index[j],
                'regime': regime['state'],
                'prob': regime['probability']
            })

    return pd.DataFrame(results)
```

## 常見問題

### Q1: HMM 狀態切換頻繁怎麼辦？

**原因**：狀態轉換機率設定不當，或雜訊過多。

**解決方案**：
```python
# 1. 加入最小持續期限制
def smooth_regime_changes(states, min_duration=5):
    """平滑狀態切換"""
    smoothed = states.copy()

    i = 0
    while i < len(states):
        current = states[i]
        # 找到下一個不同狀態
        j = i + 1
        while j < len(states) and states[j] == current:
            j += 1

        # 如果持續期太短，改為前一個狀態
        if (j - i) < min_duration and i > 0:
            smoothed[i:j] = states[i-1]

        i = j

    return smoothed

# 2. 使用後處理濾波
from scipy.signal import medfilt

states_filtered = medfilt(states, kernel_size=5)
```

### Q2: 如何驗證 HMM 有效性？

```python
def validate_hmm(df, detector):
    """驗證 HMM 是否改善策略表現"""

    # 識別狀態
    detector.fit(df)
    states = detector.model.predict(detector._prepare_observations(df))
    df['regime'] = [detector.state_labels[s] for s in states]

    # 比較不同狀態的策略表現
    for regime in df['regime'].unique():
        regime_data = df[df['regime'] == regime]

        # 簡單趨勢策略
        returns = regime_data['close'].pct_change()
        sharpe = returns.mean() / returns.std() * np.sqrt(365)

        print(f"{regime} - Sharpe: {sharpe:.2f}")

    # 應該看到不同狀態有明顯差異
```

### Q3: HMM vs 簡單規則，何時選擇？

| 情境 | 建議 |
|------|------|
| 資料量 < 500 根 | 簡單規則 |
| 需要即時反應 | 簡單規則 |
| 資料充足，追求穩定 | HMM |
| 需要概率判斷 | HMM |
| 需要可解釋性 | 簡單規則 |

## 效能考量

### 訓練時間

| 資料量 | 狀態數 | 訓練時間 |
|--------|--------|----------|
| 1000 筆 | 3 | ~1 秒 |
| 5000 筆 | 3 | ~5 秒 |
| 10000 筆 | 4 | ~20 秒 |

**建議**：離線訓練，定期更新（每日/每週）。

### 預測時間

預測非常快（< 0.1 秒），可即時使用。

## 總結

### 何時使用 HMM？

✅ **適合**：
- 需要概率框架
- 資料充足（> 1000 筆）
- 追求穩定的狀態判斷
- 願意接受黑箱模型

❌ **不適合**：
- 資料太少
- 需要即時反應市場變化
- 需要完全可解釋
- 計算資源有限

### 實戰建議

1. **從 3 狀態開始**：Bull / Bear / Neutral
2. **使用報酬 + 波動**：作為觀察變數
3. **Walk-Forward 驗證**：避免過擬合
4. **結合簡單規則**：HMM 作為輔助，不單獨依賴
5. **定期重訓練**：每週或每月更新模型

---

**參考資料**：
- [QuantStart - HMM for Regime Detection](https://www.quantstart.com/articles/market-regime-detection-using-hidden-markov-models-in-qstrader/)
- hmmlearn 官方文檔
- 論文: "Regime-Switching Factor Investing with Hidden Markov Models"
