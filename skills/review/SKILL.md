---
name: review
description: 程式碼審查專業知識。Code smells、OWASP 安全漏洞、SOLID 原則、審查檢查清單。
---

# 程式碼審查專業知識

確保程式碼品質達到生產標準。

## 審查優先順序

```
1. 🔴 安全漏洞（必須修復）
2. 🔴 正確性錯誤（必須修復）
3. 🟡 效能問題（應該修復）
4. 🟡 可維護性（應該修復）
5. 🟢 程式碼風格（建議修復）
```

---

## Code Smells 速查

### 🔴 嚴重（必須拒絕）

| Smell | 症狀 | 解決 |
|-------|------|------|
| **重複程式碼** | 相同邏輯出現多處 | 提取函數/類別 |
| **過長函數** | > 30 行 | 拆分成小函數 |
| **過長參數列** | > 3 個參數 | 使用物件參數 |
| **上帝類別** | 做太多事的類別 | 拆分職責 |
| **深層巢狀** | > 3 層 if/for | Early return |

### 🟡 中等（應該修復）

| Smell | 症狀 | 解決 |
|-------|------|------|
| **魔術數字** | 裸露的數字 | 提取常數 |
| **註解過多** | 解釋 what 不是 why | 改善命名 |
| **死碼** | 永不執行的程式碼 | 刪除 |
| **Feature Envy** | 過度使用其他類別 | 搬移方法 |

### 快速檢測腳本概念

```bash
# 檢查函數長度
grep -n "function\|=>" file.ts | # 找函數位置

# 檢查巢狀深度
grep -P "^\s{12,}" file.ts | # 找深層縮排

# 檢查重複
# 使用 jscpd 或類似工具
```

For complete code smells → read `references/code-smells.md`

---

## OWASP Top 10 速查

### 1. Injection (注入)

```typescript
// ❌ SQL Injection
db.query(`SELECT * FROM users WHERE id = ${id}`);

// ✅ 參數化
db.query('SELECT * FROM users WHERE id = ?', [id]);
```

### 2. Broken Authentication

```typescript
// ❌ 弱密碼驗證
if (password.length > 0) { ... }

// ✅ 強密碼規則
if (password.length >= 12 && /[A-Z]/.test(password) && ...) { ... }
```

### 3. XSS (跨站腳本)

```typescript
// ❌ 直接插入
innerHTML = userInput;

// ✅ 轉義或使用安全 API
textContent = userInput;
```

### 4. Insecure Direct Object Reference

```typescript
// ❌ 直接使用用戶 ID
const doc = await getDocument(req.params.docId);

// ✅ 驗證擁有權
const doc = await getDocument(req.params.docId, req.user.id);
```

### 5. Security Misconfiguration

```typescript
// ❌ 暴露錯誤詳情
res.status(500).json({ error: err.stack });

// ✅ 通用錯誤訊息
res.status(500).json({ error: 'Internal server error' });
```

For complete OWASP → read `references/owasp.md`

---

## SOLID 原則速查

### S - Single Responsibility

```typescript
// ❌ 做太多事
class UserService {
  createUser() {}
  sendEmail() {}
  generateReport() {}
}

// ✅ 單一職責
class UserService { createUser() {} }
class EmailService { sendEmail() {} }
class ReportService { generateReport() {} }
```

### O - Open/Closed

```typescript
// ❌ 修改既有程式碼
function getDiscount(type) {
  if (type === 'student') return 0.1;
  if (type === 'senior') return 0.15;
  // 每次新增都要改這裡
}

// ✅ 擴展而非修改
interface DiscountStrategy {
  calculate(): number;
}
class StudentDiscount implements DiscountStrategy { ... }
class SeniorDiscount implements DiscountStrategy { ... }
```

### L - Liskov Substitution

```typescript
// ❌ 子類別改變行為
class Rectangle { setWidth(w) { this.width = w; } }
class Square extends Rectangle {
  setWidth(w) { this.width = w; this.height = w; } // 違反
}
```

### I - Interface Segregation

```typescript
// ❌ 胖介面
interface Worker {
  work(): void;
  eat(): void; // 機器人不需要
}

// ✅ 精簡介面
interface Workable { work(): void; }
interface Eatable { eat(): void; }
```

### D - Dependency Inversion

```typescript
// ❌ 依賴具體實作
class UserService {
  private db = new MySQLDatabase();
}

// ✅ 依賴抽象
class UserService {
  constructor(private db: Database) {}
}
```

For complete SOLID → read `references/solid.md`

---

## 審查檢查清單

### 安全性
- [ ] 無 SQL/NoSQL Injection
- [ ] 無 XSS 漏洞
- [ ] 輸入有驗證
- [ ] 無 hardcode 密鑰
- [ ] 權限有檢查

### 正確性
- [ ] 邏輯正確
- [ ] 邊界情況處理
- [ ] 錯誤處理完整
- [ ] 型別正確

### 可維護性
- [ ] 命名清楚
- [ ] 無重複程式碼
- [ ] 函數短小
- [ ] 無深層巢狀

### 效能
- [ ] 無 N+1 查詢
- [ ] 無不必要迴圈
- [ ] 適當快取

---

## 審查回饋範本

```markdown
## 🔴 Critical

**[Issue]**
- File: `path/to/file.ts:123`
- Problem: SQL Injection 風險
- Fix: 使用參數化查詢

## 🟡 Important

**[Issue]**
- File: `path/to/file.ts:456`
- Problem: 函數過長 (50 行)
- Suggestion: 拆分成 validateUser, saveUser, notifyUser

## 🟢 Minor

**[Issue]**
- File: `path/to/file.ts:789`
- Note: 建議將 7 改為常數 MAX_RETRY
```

---

## 深度參考

| 主題 | 文件 |
|------|------|
| Code Smells 完整 | `references/code-smells.md` |
| OWASP Top 10 | `references/owasp.md` |
| SOLID 原則 | `references/solid.md` |
| 審查範本 | `references/templates.md` |
