# 安全實踐完整指南

## 安全性原則

### 最小權限原則
只給予完成任務所需的最小權限。

### 縱深防禦
多層防護，不依賴單一安全措施。

### 輸入永不可信
所有外部輸入都必須驗證和清理。

---

## OWASP Top 10 防護

### 1. Injection（注入攻擊）

#### SQL Injection 防護

```typescript
// ❌ 危險：字串拼接
const query = `SELECT * FROM users WHERE email = '${email}'`;
// 攻擊者可輸入: ' OR '1'='1

// ✅ 安全：參數化查詢
const query = 'SELECT * FROM users WHERE email = ?';
await db.query(query, [email]);

// ✅ 使用 ORM（自動處理）
const user = await prisma.user.findUnique({
  where: { email }
});
```

#### NoSQL Injection 防護

```typescript
// ❌ 危險：直接使用物件
const user = await collection.findOne({
  email: req.body.email,
  password: req.body.password
});
// 攻擊者可發送: { "password": { "$ne": "" } }

// ✅ 安全：強制轉型
const email = String(req.body.email);
const password = String(req.body.password);
```

#### 命令執行安全

```typescript
// ✅ 安全原則：
// 1. 使用參數陣列而非字串拼接
// 2. 使用 execFile 類 API 而非 shell 執行
// 3. 白名單驗證允許的命令

const allowedCommands = ['ping', 'dig', 'nslookup'];
if (!allowedCommands.includes(command)) {
  throw new Error('Invalid command');
}
```

---

### 2. Broken Authentication

#### 密碼安全

```typescript
import bcrypt from 'bcrypt';

// 密碼驗證規則
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) errors.push('至少 12 字元');
  if (!/[A-Z]/.test(password)) errors.push('需要大寫字母');
  if (!/[a-z]/.test(password)) errors.push('需要小寫字母');
  if (!/[0-9]/.test(password)) errors.push('需要數字');
  if (!/[!@#$%^&*]/.test(password)) errors.push('需要特殊符號');

  return { valid: errors.length === 0, errors };
}

// 密碼雜湊
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// 密碼驗證
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

#### Session 安全

```typescript
// 安全的 session 配置
{
  name: 'sessionId',      // 自訂名稱
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,         // 只在 HTTPS 傳輸
    httpOnly: true,       // JS 無法讀取
    sameSite: 'strict',   // 防止 CSRF
    maxAge: 3600000       // 1 小時過期
  }
}
```

---

### 3. XSS（跨站腳本攻擊）

#### DOM 安全

```typescript
// ❌ 危險做法
// 直接將用戶輸入插入 HTML

// ✅ 安全做法
// 1. 使用 textContent 而非 innerHTML
element.textContent = userInput;

// 2. 需要 HTML 時使用 DOMPurify
import DOMPurify from 'dompurify';
const safeHtml = DOMPurify.sanitize(userInput);

// 3. React 預設會自動轉義
// 直接使用 {userInput} 是安全的
// 避免使用可繞過轉義的 API
```

#### Content Security Policy

```typescript
// 設置 CSP 標頭
res.setHeader('Content-Security-Policy', [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "frame-ancestors 'none'"
].join('; '));
```

---

### 4. IDOR（不安全的直接物件引用）

```typescript
// ❌ 危險：只用 ID 查詢
const doc = await db.document.findById(req.params.id);
// 任何人都可以透過猜測 ID 讀取任何文件！

// ✅ 安全：驗證擁有權
const doc = await db.document.findFirst({
  where: {
    id: req.params.id,
    userId: req.user.id  // 確認是擁有者
  }
});

if (!doc) {
  return res.status(404).json({ error: 'Not found' });
}
```

---

### 5. Security Misconfiguration

#### 錯誤處理

```typescript
// ❌ 危險：暴露詳細錯誤
res.status(500).json({
  error: err.message,
  stack: err.stack  // 暴露內部資訊！
});

// ✅ 安全：通用錯誤訊息
logger.error('Request failed', { error: err, path: req.path });

res.status(500).json({
  error: 'Internal server error',
  requestId: req.id  // 供客戶支援查詢
});
```

#### 使用安全中間件

```typescript
import helmet from 'helmet';

app.use(helmet());
// 自動設置多個安全相關 HTTP 標頭
```

---

## 敏感資料保護

### 環境變數

```typescript
// ❌ 危險：硬編碼
const API_KEY = 'sk-1234567890abcdef';

// ✅ 安全：環境變數
const API_KEY = process.env.API_KEY;

// 啟動時驗證
const required = ['API_KEY', 'DB_PASSWORD', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}
```

### .gitignore

```gitignore
# 必須忽略
.env
.env.local
.env.*.local
*.pem
*.key
credentials.json
secrets/
```

### 日誌安全

```typescript
// ❌ 危險：記錄敏感資料
logger.info('Login', { email, password }); // 絕對不要！

// ✅ 安全：遮蔽敏感資料
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

logger.info('Login', { email: maskEmail(email) });
```

---

## 函數式程式設計增強安全性

FP 的特性有助於提高程式碼安全性：

### 1. 純函數 - 可預測行為

```typescript
// ❌ 有副作用 - 難以追蹤
let state = { count: 0 };
function increment() {
  state.count++;  // 修改外部狀態
  return state.count;
}

// ✅ 純函數 - 可預測、可測試
function increment(state: State): State {
  return { ...state, count: state.count + 1 };
}
```

### 2. 不可變性 - 防止意外修改

```typescript
// ❌ 直接修改
function addItem(cart: Cart, item: Item): Cart {
  cart.items.push(item);  // 修改原陣列
  return cart;
}

// ✅ 不可變
function addItem(cart: Cart, item: Item): Cart {
  return {
    ...cart,
    items: [...cart.items, item]
  };
}
```

### 3. 組合與管道 - 可驗證的小單元

```typescript
// 每個函數都小而可驗證
const sanitize = (input: string) => input.trim();
const validate = (input: string) => input.length > 0 ? input : null;
const normalize = (input: string) => input.toLowerCase();

// 組合成管道
const processInput = pipe(sanitize, validate, normalize);
```

### 4. Result 類型 - 強制錯誤處理

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function findUser(id: string): Result<User, NotFoundError> {
  // ...
}

const result = findUser(id);
if (result.ok) {
  result.value.name;  // 型別安全
} else {
  handleError(result.error);
}
```

---

## 輸入驗證

### 使用 Zod

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  age: z.number().int().min(0).max(150),
});

const result = UserSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({
    error: 'Validation failed',
    issues: result.error.issues
  });
}

// result.data 是已驗證的安全資料
```

---

## 安全檢查清單

### 認證
- [ ] 使用強密碼規則（12+ 字元，混合類型）
- [ ] 使用 bcrypt 存儲密碼（rounds >= 12）
- [ ] 實作帳號鎖定機制
- [ ] 使用安全的 session 設定

### 授權
- [ ] 每個 API 都檢查權限
- [ ] 驗證資源擁有權
- [ ] 使用最小權限原則

### 輸入處理
- [ ] 所有輸入都驗證類型和格式
- [ ] 使用參數化查詢
- [ ] 清理 HTML 輸入

### 輸出處理
- [ ] 設置正確的 Content-Type
- [ ] 使用 CSP 標頭
- [ ] 錯誤訊息不暴露內部資訊

### 敏感資料
- [ ] 密鑰只存在環境變數
- [ ] 敏感檔案加入 .gitignore
- [ ] 日誌不記錄敏感資訊
