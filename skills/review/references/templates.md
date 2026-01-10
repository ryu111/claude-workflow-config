# 程式碼審查範本

## 審查回饋格式

### 標準格式

```markdown
# Code Review: [描述變更內容]

## Verdict: [✅ APPROVED | 🔄 REQUEST CHANGES | ❌ REJECTED]

## 摘要
[1-2 句話總結變更內容和審查結果]

---

## 🔴 Critical（必須修復）

### 1. [問題標題]
- **位置**: `path/to/file.ts:123`
- **問題**: [清楚描述問題]
- **風險**: [說明可能造成的影響]
- **修復**: [具體的修復建議]

---

## 🟡 Important（應該修復）

### 1. [問題標題]
- **位置**: `path/to/file.ts:456`
- **問題**: [描述問題]
- **建議**: [改善建議]

---

## 🟢 Minor（建議修復）

### 1. [問題標題]
- **位置**: `path/to/file.ts:789`
- **備註**: [說明建議]

---

## ✨ 優點

- [正面回饋 1]
- [正面回饋 2]

---

## 後續行動

| 項目 | 優先級 | 負責人 |
|------|--------|--------|
| 修復 Critical #1 | 🔴 高 | @developer |
| 修復 Important #1 | 🟡 中 | @developer |

---

## 審查者資訊
- 審查者: @reviewer
- 審查日期: 2024-01-15
```

---

## 常見問題範本

### SQL Injection

```markdown
### 1. SQL Injection 風險
- **位置**: `src/api/users.ts:45`
- **問題**: 使用字串拼接建立 SQL 查詢
- **風險**: 攻擊者可以注入惡意 SQL 語句，存取或刪除資料
- **修復**: 使用參數化查詢或 ORM

// ❌ 目前
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 建議
const query = 'SELECT * FROM users WHERE id = ?';
await db.query(query, [userId]);
```

### XSS 漏洞

```markdown
### 2. XSS 漏洞
- **位置**: `src/components/Comment.tsx:28`
- **問題**: 直接將用戶輸入渲染為 HTML
- **風險**: 攻擊者可以注入惡意腳本
- **修復**: 使用 textContent 或 DOMPurify 清理

// ❌ 危險做法：直接插入 HTML
// ✅ 安全做法：使用 textContent 或 DOMPurify
```

### 硬編碼密鑰

```markdown
### 3. 硬編碼敏感資訊
- **位置**: `src/config/api.ts:5`
- **問題**: API 密鑰直接寫在程式碼中
- **風險**: 密鑰可能洩露到版本控制系統
- **修復**: 使用環境變數

// ❌ 目前
const API_KEY = 'sk-1234567890abcdef';

// ✅ 建議
const API_KEY = process.env.API_KEY;
```

### 過長函數

```markdown
### 4. 過長函數
- **位置**: `src/services/order.ts:100-200`
- **問題**: 函數超過 100 行，包含多個職責
- **影響**: 難以理解、測試和維護
- **建議**: 拆分成多個小函數

// 目前：一個 100 行的 processOrder 函數

// 建議拆分成：
function validateOrder(order) { }
function calculatePrice(order) { }
function applyDiscounts(order) { }
function processPayment(order) { }
function sendNotification(order) { }
```

### N+1 查詢

```markdown
### 5. N+1 查詢問題
- **位置**: `src/services/user.ts:50-60`
- **問題**: 在迴圈中執行資料庫查詢
- **影響**: 效能問題，100 個用戶 = 101 次查詢
- **修復**: 使用 include 或批次查詢

// ❌ 目前
const users = await db.user.findMany();
for (const user of users) {
  user.orders = await db.order.findMany({ where: { userId: user.id } });
}

// ✅ 建議
const users = await db.user.findMany({
  include: { orders: true }
});
```

### 缺少錯誤處理

```markdown
### 6. 缺少錯誤處理
- **位置**: `src/api/payment.ts:30`
- **問題**: 沒有處理 API 呼叫失敗的情況
- **影響**: 可能導致程式崩潰或資料不一致
- **修復**: 加入 try-catch 和適當的錯誤處理

// ❌ 目前
const result = await paymentApi.charge(amount);

// ✅ 建議
try {
  const result = await paymentApi.charge(amount);
  return { success: true, result };
} catch (error) {
  logger.error('Payment failed', { error, amount });
  return { success: false, error: 'Payment failed' };
}
```

---

## 審查檢查清單範本

```markdown
## 審查檢查清單

### 安全性
- [ ] 無 SQL/NoSQL Injection
- [ ] 無 XSS 漏洞
- [ ] 輸入有驗證
- [ ] 無硬編碼密鑰
- [ ] 權限有檢查

### 正確性
- [ ] 邏輯正確
- [ ] 邊界情況處理
- [ ] 錯誤處理完整
- [ ] 型別正確

### 效能
- [ ] 無 N+1 查詢
- [ ] 無不必要迴圈
- [ ] 適當快取

### 可維護性
- [ ] 命名清楚
- [ ] 無重複程式碼
- [ ] 函數短小
- [ ] 無深層巢狀

### SOLID
- [ ] 單一職責
- [ ] 開放封閉
- [ ] 依賴抽象
```

---

## 正面回饋範本

```markdown
## ✨ 優點

### 程式碼品質
- 命名清晰易懂，如 `calculateTotalWithTax` 和 `isValidEmail`
- 函數保持簡短，平均 15-20 行
- 適當使用 TypeScript 類型

### 設計
- 良好的關注點分離
- 正確使用依賴注入
- 遵循現有的專案模式

### 安全性
- 輸入驗證完整
- 正確使用參數化查詢
- 敏感資料處理得當

### 測試
- 測試覆蓋了主要路徑
- 邊界條件有測試
- 測試命名清楚
```

---

## 最終決定範本

### APPROVED

```markdown
## Verdict: ✅ APPROVED

程式碼品質良好，安全性無疑慮，可以合併。

### 審查重點
- 安全性: ✅ 通過
- 正確性: ✅ 通過
- 可維護性: ✅ 通過
- 效能: ✅ 通過
```

### REQUEST CHANGES

```markdown
## Verdict: 🔄 REQUEST CHANGES

發現 2 個 Critical 和 3 個 Important 問題需要修復。

### 需要修復
1. 🔴 SQL Injection 風險 - `src/api/users.ts:45`
2. 🔴 硬編碼密鑰 - `src/config/api.ts:5`
3. 🟡 缺少錯誤處理 - `src/api/payment.ts:30`
4. 🟡 過長函數 - `src/services/order.ts:100`
5. 🟡 N+1 查詢 - `src/services/user.ts:50`

請修復後重新請求審查。
```

### REJECTED

```markdown
## Verdict: ❌ REJECTED

發現嚴重的架構問題，需要重新設計。

### 原因
1. 違反單一職責原則 - `OrderService` 包含 10+ 種職責
2. 大量重複程式碼 - 相同邏輯出現在 5 個檔案
3. 缺少抽象層 - 直接依賴具體實作

### 建議
建議與架構師討論重新設計方案後再實作。
```
