# 機器學習方法比較

除了 HMM，還有多種 ML 方法可用於市場狀態識別。

## 方法概覽

| 方法 | 類型 | 優勢 | 劣勢 | 適用場景 |
|------|------|------|------|----------|
| **Random Forest** | 監督式 | 可解釋、穩健 | 需要標籤 | 有歷史標註資料 |
| **Gaussian Mixture** | 非監督式 | 自動分群 | 需調整分群數 | 無標籤資料 |
| **K-Means** | 非監督式 | 簡單快速 | 假設球形分佈 | 快速原型 |
| **LSTM** | 深度學習 | 捕捉長期依賴 | 資料需求大、黑箱 | 大量資料、高頻 |
| **HMM** | 概率模型 | 時序建模、概率輸出 | 參數敏感 | 中等資料量 |

## Random Forest 方法

### 核心思想

使用歷史特徵（技術指標 + 宏觀數據）訓練分類器，預測當前市場狀態。

### 優勢

- **高可解釋性**：可查看特徵重要性
- **穩健性**：不易過擬合（相對深度學習）
- **處理非線性**：自動捕捉複雜關係
- **容忍缺失值**：部分特徵缺失也能工作

### 實作範例

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit

class RFRegimeDetector:
    """Random Forest 狀態識別器"""

    def __init__(self, n_estimators=100):
        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=10,
            random_state=42
        )
        self.feature_names = []

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """特徵工程"""
        features = pd.DataFrame(index=df.index)

        # 1. 趨勢特徵
        features['sma_20'] = df['close'].rolling(20).mean()
        features['sma_50'] = df['close'].rolling(50).mean()
        features['price_to_sma20'] = df['close'] / features['sma_20']
        features['sma_cross'] = (features['sma_20'] > features['sma_50']).astype(int)

        # 2. 動量特徵
        features['rsi'] = self._calculate_rsi(df['close'])
        features['macd'] = self._calculate_macd(df['close'])

        # 3. 波動特徵
        features['atr'] = self._calculate_atr(df)
        features['bb_width'] = self._calculate_bb_width(df['close'])

        # 4. 成交量特徵
        features['volume_sma'] = df['volume'].rolling(20).mean()
        features['volume_ratio'] = df['volume'] / features['volume_sma']

        # 5. 市場結構
        features['higher_high'] = self._detect_higher_high(df['high'])
        features['lower_low'] = self._detect_lower_low(df['low'])

        self.feature_names = features.columns.tolist()
        return features.fillna(0)

    def create_labels(self, df: pd.DataFrame, method='volatility_trend') -> pd.Series:
        """建立訓練標籤

        Args:
            method: 'volatility_trend' | 'future_return' | 'adx_based'
        """
        if method == 'volatility_trend':
            # 基於波動率和趨勢的標籤
            returns = df['close'].pct_change()
            volatility = returns.rolling(20).std()

            # ADX 計算
            adx = self._calculate_adx(df)

            labels = pd.Series(index=df.index, dtype='object')

            # 規則
            high_vol = volatility > volatility.rolling(100).quantile(0.7)
            strong_trend = adx > 25
            uptrend = returns.rolling(20).mean() > 0

            labels[high_vol] = 'high_volatility'
            labels[strong_trend & uptrend] = 'bull_trend'
            labels[strong_trend & ~uptrend] = 'bear_trend'
            labels[~strong_trend & ~high_vol] = 'sideways'

            return labels.fillna('sideways')

        elif method == 'future_return':
            # 基於未來報酬的標籤（前瞻偏差！僅用於分析）
            future_returns = df['close'].pct_change(20).shift(-20)

            labels = pd.Series(index=df.index, dtype='object')
            labels[future_returns > 0.05] = 'bull'
            labels[future_returns < -0.05] = 'bear'
            labels[(future_returns >= -0.05) & (future_returns <= 0.05)] = 'neutral'

            return labels

    def fit(self, df: pd.DataFrame):
        """訓練模型"""
        # 特徵工程
        X = self.engineer_features(df)

        # 建立標籤
        y = self.create_labels(df)

        # 移除 NaN
        valid_idx = ~(X.isna().any(axis=1) | y.isna())
        X_clean = X[valid_idx]
        y_clean = y[valid_idx]

        # 訓練
        self.model.fit(X_clean, y_clean)

        # 輸出特徵重要性
        self._print_feature_importance()

    def predict(self, df: pd.DataFrame) -> str:
        """預測當前狀態"""
        X = self.engineer_features(df)
        X_clean = X.fillna(0)

        # 預測
        regime = self.model.predict(X_clean.tail(1))[0]

        # 預測概率
        probs = self.model.predict_proba(X_clean.tail(1))[0]
        prob_dict = dict(zip(self.model.classes_, probs))

        return {
            'state': regime,
            'probabilities': prob_dict,
            'confidence': max(probs)
        }

    def _print_feature_importance(self):
        """輸出特徵重要性"""
        importances = self.model.feature_importances_
        feature_imp = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False)

        print("Top 10 重要特徵:")
        print(feature_imp.head(10))

    # 輔助函數
    def _calculate_rsi(self, prices, period=14):
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        return 100 - (100 / (1 + rs))

    def _calculate_atr(self, df, period=14):
        high = df['high']
        low = df['low']
        close = df['close']
        tr = pd.concat([
            high - low,
            (high - close.shift()).abs(),
            (low - close.shift()).abs()
        ], axis=1).max(axis=1)
        return tr.rolling(period).mean()

    # ... 其他指標計算
```

### 特徵選擇建議

| 特徵類型 | 範例 | 重要性 |
|----------|------|--------|
| **趨勢** | MA cross, ADX | ⭐⭐⭐ |
| **動量** | RSI, MACD | ⭐⭐⭐ |
| **波動** | ATR, BB width | ⭐⭐⭐ |
| **成交量** | Volume ratio | ⭐⭐ |
| **宏觀** | VIX, CPI（如可得） | ⭐⭐ |

### Walk-Forward 驗證

```python
from sklearn.model_selection import TimeSeriesSplit

def walk_forward_rf(df, n_splits=5):
    """時間序列交叉驗證"""

    detector = RFRegimeDetector()
    tscv = TimeSeriesSplit(n_splits=n_splits)

    scores = []

    for train_idx, test_idx in tscv.split(df):
        train = df.iloc[train_idx]
        test = df.iloc[test_idx]

        # 訓練
        detector.fit(train)

        # 測試
        X_test = detector.engineer_features(test)
        y_test = detector.create_labels(test)

        # 評估
        y_pred = detector.model.predict(X_test.fillna(0))
        accuracy = (y_pred == y_test).mean()

        scores.append(accuracy)
        print(f"Fold Accuracy: {accuracy:.2%}")

    print(f"\n平均準確率: {np.mean(scores):.2%}")
    return scores
```

## Gaussian Mixture Models（GMM）

### 核心思想

假設市場狀態對應不同的高斯分佈，自動從資料中找出這些分佈。

### 優勢

- **無需標籤**：完全非監督
- **概率輸出**：軟分類
- **適合金融**：報酬率常近似常態分佈

### 實作範例

```python
from sklearn.mixture import GaussianMixture

class GMMRegimeDetector:
    """Gaussian Mixture 狀態識別器"""

    def __init__(self, n_components=3):
        self.model = GaussianMixture(
            n_components=n_components,
            covariance_type='full',
            random_state=42
        )
        self.regime_labels = {}

    def fit(self, df: pd.DataFrame):
        """訓練 GMM"""
        # 準備特徵（報酬 + 波動）
        returns = df['close'].pct_change().fillna(0)
        volatility = returns.rolling(20).std().fillna(0)

        X = np.column_stack([returns, volatility])

        # 訓練
        self.model.fit(X)

        # 預測並標記
        clusters = self.model.predict(X)
        self._label_clusters(X, clusters)

    def predict(self, df: pd.DataFrame):
        """預測狀態"""
        returns = df['close'].pct_change().fillna(0)
        volatility = returns.rolling(20).std().fillna(0)
        X = np.column_stack([returns, volatility])

        cluster = self.model.predict(X[-1].reshape(1, -1))[0]
        probs = self.model.predict_proba(X[-1].reshape(1, -1))[0]

        return {
            'state': self.regime_labels[cluster],
            'probability': probs[cluster],
            'all_probs': dict(zip(
                [self.regime_labels[i] for i in range(len(probs))],
                probs
            ))
        }

    def _label_clusters(self, X, clusters):
        """根據統計特性標記群集"""
        for c in range(self.model.n_components):
            mask = clusters == c
            mean_return = X[mask, 0].mean()
            mean_vol = X[mask, 1].mean()

            if mean_return > 0.001 and mean_vol < 0.02:
                self.regime_labels[c] = 'bull'
            elif mean_return < -0.001 and mean_vol > 0.02:
                self.regime_labels[c] = 'bear'
            else:
                self.regime_labels[c] = 'neutral'
```

### 選擇分群數

```python
from sklearn.metrics import silhouette_score

def select_n_components(df, max_n=6):
    """使用 BIC/AIC 選擇最佳分群數"""
    returns = df['close'].pct_change().fillna(0)
    volatility = returns.rolling(20).std().fillna(0)
    X = np.column_stack([returns, volatility])

    bic_scores = []
    silhouette_scores = []

    for n in range(2, max_n + 1):
        gmm = GaussianMixture(n_components=n, random_state=42)
        gmm.fit(X)

        bic = gmm.bic(X)
        labels = gmm.predict(X)
        silhouette = silhouette_score(X, labels)

        bic_scores.append(bic)
        silhouette_scores.append(silhouette)

        print(f"n={n}: BIC={bic:.2f}, Silhouette={silhouette:.3f}")

    # BIC 越小越好
    best_n = np.argmin(bic_scores) + 2
    print(f"\n建議使用 {best_n} 個分群")
    return best_n
```

## LSTM 深度學習方法

### 核心思想

使用 LSTM 網路從時序價格資料中學習狀態特徵。

### 優勢

- **捕捉長期依賴**：記憶過去資訊
- **端到端學習**：自動特徵提取
- **適合高頻**：處理大量時序資料

### 劣勢

- **資料需求大**：需要數萬筆資料
- **訓練慢**：需要 GPU
- **黑箱**：難以解釋
- **容易過擬合**：需要正則化

### 簡化範例

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

class LSTMRegimeClassifier(nn.Module):
    """LSTM 狀態分類器"""

    def __init__(self, input_size=5, hidden_size=64, num_classes=3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)
        self.softmax = nn.Softmax(dim=1)

    def forward(self, x):
        # x: (batch, seq_len, input_size)
        lstm_out, _ = self.lstm(x)
        # 取最後時間步
        last_out = lstm_out[:, -1, :]
        logits = self.fc(last_out)
        return self.softmax(logits)

# 訓練流程（簡化）
def train_lstm_regime(df, seq_len=50, epochs=20):
    """訓練 LSTM 模型"""

    # 準備資料（省略細節）
    X_train, y_train = prepare_sequences(df, seq_len)

    model = LSTMRegimeClassifier()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters())

    # 訓練循環
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()

        if epoch % 5 == 0:
            print(f"Epoch {epoch}, Loss: {loss.item():.4f}")

    return model
```

**建議**：除非有大量資料（> 10萬筆）和 GPU，否則先用 HMM 或 Random Forest。

## 方法選擇決策樹

```
資料量 < 1000？
  ├─ Yes → 簡單規則（ADX + 波動率）
  └─ No
      │
      是否有標籤資料？
      ├─ Yes → Random Forest
      │    ├─ 可解釋性重要？ → Random Forest
      │    └─ 追求極致效能？ → XGBoost
      │
      └─ No（無標籤）
          │
          需要概率輸出？
          ├─ Yes → HMM 或 GMM
          │    ├─ 時序建模重要？ → HMM
          │    └─ 只需分群？ → GMM
          │
          └─ 資料量 > 10萬 且有 GPU？
              ├─ Yes → LSTM
              └─ No → HMM
```

## 整合建議

### 混合方法

```python
class EnsembleRegimeDetector:
    """整合多種方法的檢測器"""

    def __init__(self):
        self.hmm = HMMRegimeDetector(n_states=3)
        self.rf = RFRegimeDetector()
        self.gmm = GMMRegimeDetector(n_components=3)

    def fit(self, df):
        """訓練所有模型"""
        self.hmm.fit(df)
        self.rf.fit(df)
        self.gmm.fit(df)

    def predict(self, df):
        """投票機制"""
        hmm_result = self.hmm.detect(df)
        rf_result = self.rf.predict(df)
        gmm_result = self.gmm.predict(df)

        # 收集所有預測
        votes = [
            hmm_result['state'],
            rf_result['state'],
            gmm_result['state']
        ]

        # 多數決
        from collections import Counter
        final_state = Counter(votes).most_common(1)[0][0]

        # 計算一致性
        agreement = votes.count(final_state) / len(votes)

        return {
            'state': final_state,
            'agreement': agreement,
            'individual_results': {
                'hmm': hmm_result,
                'rf': rf_result,
                'gmm': gmm_result
            }
        }
```

## 效能比較（參考）

| 方法 | 訓練時間 | 預測時間 | 準確率 | 可解釋性 |
|------|----------|----------|--------|----------|
| Random Forest | ⭐⭐⭐ | ⭐⭐⭐ | 65-75% | ⭐⭐⭐ |
| HMM | ⭐⭐ | ⭐⭐⭐ | 60-70% | ⭐⭐ |
| GMM | ⭐⭐⭐ | ⭐⭐⭐ | 55-65% | ⭐⭐ |
| LSTM | ⭐ | ⭐⭐ | 70-80%* | ⭐ |

*需大量資料，否則可能更差

## 總結建議

| 情境 | 推薦方法 | 原因 |
|------|----------|------|
| **一般場景** | HMM (3 狀態) | 平衡效果和複雜度 |
| **需要可解釋** | Random Forest | 特徵重要性明確 |
| **無標籤資料** | GMM 或 HMM | 非監督學習 |
| **大量資料 + GPU** | LSTM | 深度學習優勢 |
| **追求穩健** | Ensemble | 降低單一模型風險 |

**實戰建議**：
1. 從 HMM 開始（實作簡單、效果不錯）
2. 若需解釋性，換 Random Forest
3. 整合多種方法提升穩健性
4. 避免過度複雜（LSTM 非必要）

---

**參考資料**：
- [State Street - Decoding Market Regimes with Machine Learning (2025)](https://www.ssga.com/library-content/assets/pdf/global/pc/2025/decoding-market-regimes-with-machine-learning.pdf)
- [Medium - Market Regime Detection using ML](https://medium.com/lseg-developer-community/market-regime-detection-using-statistical-and-ml-based-approaches-b4c27e7efc8b)
- scikit-learn 官方文檔
