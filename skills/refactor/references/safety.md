# 安全重構指南

確保重構不破壞現有功能的完整指南。

## 核心原則

### 1. 重構的定義

> 重構是在**不改變外部行為**的前提下，改善程式碼的內部結構。

**這意味著：**
- ✅ 改變結構（類別、方法、變數）
- ✅ 改變內部實作
- ❌ 不能改變功能
- ❌ 不能改變 API（除非有計劃地）

### 2. 小步驟原則

```
每次只做一個小改變
      ↓
執行測試
      ↓
通過 → 繼續下一步
失敗 → 撤銷，重新思考
```

**「小」的定義：**
- 重新命名一個變數
- 提取一個方法
- 移動一個欄位
- 內聯一個臨時變數

**不是「小」：**
- 同時重新命名和移動
- 提取並修改邏輯
- 改變多個類別

### 3. 版本控制紀律

```bash
# 每個完整重構一個 commit
git add -A
git commit -m "refactor: Extract calculateTotal method from Order"

# 如果出錯，可以輕鬆回滾
git revert HEAD
```

---

## 重構前檢查清單

### ✅ 必要條件

```
□ 有測試覆蓋要修改的程式碼
  - 單元測試覆蓋核心邏輯
  - 整合測試覆蓋關鍵路徑
  - 如果沒有，先補測試！

□ 所有測試通過
  - 執行完整測試套件
  - 不要在測試失敗時開始重構

□ 程式碼已提交
  - 沒有未提交的變更
  - 有乾淨的回滾點

□ 理解程式碼
  - 知道程式碼做什麼
  - 知道為什麼這樣寫
  - 如果不懂，先研究
```

### 🔍 評估風險

| 風險因素 | 低風險 | 高風險 |
|----------|--------|--------|
| 測試覆蓋 | >80% | <50% |
| 程式碼年齡 | <1年 | >3年 |
| 作者是否在 | 是 | 已離職 |
| 文檔 | 完整 | 無 |
| 依賴數量 | <5 | >20 |

**高風險時：**
1. 先補測試
2. 更小的步驟
3. 更頻繁的提交
4. 考慮結對程式設計

---

## 重構中紀律

### 執行流程

```
1. 選擇要執行的重構
      ↓
2. 記住當前測試狀態（應該全過）
      ↓
3. 執行單一重構步驟
      ↓
4. 編譯（如果適用）
      ↓
5. 執行測試
      │
      ├── 通過 → 提交 → 繼續
      │
      └── 失敗 → 撤銷 → 分析原因
```

### 🚫 重構時不要做

1. **不要同時修 Bug**
   ```
   # 錯誤
   重構 + 修 Bug → 不知道是重構還是修 Bug 導致測試變化

   # 正確
   先修 Bug → 提交 → 再重構
   ```

2. **不要同時加功能**
   ```
   # 錯誤
   重構 + 新功能 → 混淆變更原因

   # 正確
   先重構 → 提交 → 再加功能
   ```

3. **不要優化效能**
   ```
   # 錯誤
   重構時順便優化 → 可能改變行為

   # 正確
   先重構 → 確認行為 → 再優化
   ```

### 常見陷阱

| 陷阱 | 結果 | 避免方法 |
|------|------|----------|
| 步驟太大 | 失敗時不知道哪裡錯 | 一次一個小改變 |
| 不執行測試 | 不知道是否破壞功能 | 每步都測試 |
| 不提交 | 出錯時難以回滾 | 每個重構都提交 |
| 邊重構邊改功能 | 混淆變更原因 | 分開做 |
| 重構沒測試的程式碼 | 不知道是否破壞功能 | 先補測試 |

---

## 具體重構的安全步驟

### Extract Function 安全步驟

```python
# 原始碼
def print_owing(invoice):
    outstanding = 0

    # print banner
    print("*" * 20)
    print("Customer Owes")
    print("*" * 20)

    # calculate outstanding
    for o in invoice.orders:
        outstanding += o.amount

    # print details
    print(f"name: {invoice.customer}")
    print(f"amount: {outstanding}")
```

**步驟：**

1. **識別要提取的程式碼**
   - 標記 "print banner" 區塊

2. **建立新函數，複製程式碼**
   ```python
   def print_banner():
       print("*" * 20)
       print("Customer Owes")
       print("*" * 20)
   ```

3. **檢查變數**
   - 這個區塊不使用外部變數 ✓
   - 不修改任何變數 ✓

4. **替換原始碼**
   ```python
   def print_owing(invoice):
       outstanding = 0

       print_banner()  # 替換

       # calculate outstanding
       ...
   ```

5. **執行測試** ✅

6. **提交**
   ```bash
   git commit -m "refactor: Extract print_banner from print_owing"
   ```

### Move Function 安全步驟

```python
# 原始碼
class Account:
    def overdraft_charge(self):
        if self.account_type.is_premium:
            base = 10
            if self.days_overdrawn > 7:
                return base + (self.days_overdrawn - 7) * 0.85
            return base
        return self.days_overdrawn * 1.75
```

**步驟：**

1. **複製方法到目標類別**
   ```python
   class AccountType:
       def overdraft_charge(self, days_overdrawn):  # 加參數
           if self.is_premium:
               base = 10
               if days_overdrawn > 7:
                   return base + (days_overdrawn - 7) * 0.85
               return base
           return days_overdrawn * 1.75
   ```

2. **修改原方法為委託**
   ```python
   class Account:
       def overdraft_charge(self):
           return self.account_type.overdraft_charge(self.days_overdrawn)
   ```

3. **執行測試** ✅

4. **找到所有呼叫者，改為使用新位置**

5. **考慮是否移除原方法**

6. **執行測試** ✅

7. **提交**

---

## 重構後驗證

### 必做檢查

```
□ 所有測試通過
□ 手動測試關鍵功能
□ Code Review（如果有）
□ 程式碼比之前更清晰
```

### 品質指標

| 指標 | 重構前 | 重構後 | 應該 |
|------|--------|--------|------|
| 測試覆蓋率 | X% | Y% | Y >= X |
| 方法長度 | 50行 | 15行 | 更短 |
| 類別長度 | 500行 | 200行 | 更短 |
| 圈複雜度 | 15 | 5 | 更低 |

---

## 緊急回滾程序

### 發現問題時

```bash
# 1. 確認問題
git log --oneline -5  # 查看最近提交

# 2. 回滾最後一個提交
git revert HEAD

# 3. 如果需要回滾多個
git revert HEAD~2..HEAD

# 4. 或者完全重置（小心！）
git reset --hard HEAD~1
```

### 生產環境問題

1. **立即回滾**
2. **通知團隊**
3. **分析原因**
4. **補充測試**
5. **重新嘗試**

---

## 檢查清單模板

```markdown
## 重構：[描述]

### 重構前
- [ ] 測試全部通過
- [ ] 程式碼已提交
- [ ] 理解要重構的程式碼
- [ ] 識別了 Code Smell

### 重構中
- [ ] 每步都執行測試
- [ ] 沒有同時修 Bug
- [ ] 沒有同時加功能
- [ ] 每個重構都提交

### 重構後
- [ ] 測試全部通過
- [ ] 程式碼更清晰
- [ ] Code Review 完成
- [ ] 文檔更新（如需要）
```
