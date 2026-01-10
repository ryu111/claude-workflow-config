# OWASP Top 10 完整指南

## 什麼是 OWASP Top 10？

OWASP（Open Web Application Security Project）每隔幾年發布最常見的 Web 應用程式安全風險排名。

---

## A01:2021 - Broken Access Control（存取控制失效）

### 風險說明
使用者能夠存取超出其權限的資料或功能。

### 常見漏洞

```typescript
// ❌ 危險：未驗證擁有權
app.get('/api/documents/:id', async (req, res) => {
  const doc = await db.document.findById(req.params.id);
  res.json(doc);
  // 任何人都可以透過猜測 ID 讀取任何文件！
});

// ✅ 安全：驗證擁有權
app.get('/api/documents/:id', async (req, res) => {
  const doc = await db.document.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id  // 確認是擁有者
    }
  });

  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(doc);
});
```

### 防護措施
- [ ] 預設拒絕所有存取，只允許明確授權
- [ ] 實作所有權檢查
- [ ] 使用 RBAC（角色型存取控制）
- [ ] 記錄存取控制失敗並警報
- [ ] 限制 API 請求頻率

---

## A02:2021 - Cryptographic Failures（加密失效）

### 風險說明
敏感資料未加密或使用弱加密。

### 常見漏洞

```typescript
// ❌ 危險：明文儲存密碼
await db.user.create({
  data: { password: plainPassword }
});

// ❌ 危險：使用弱雜湊
const hash = crypto.createHash('md5').update(password).digest('hex');

// ✅ 安全：使用 bcrypt
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);

// ✅ 安全：驗證密碼
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### 防護措施
- [ ] 識別敏感資料並分類
- [ ] 傳輸中使用 TLS 1.2+
- [ ] 使用強加密算法（AES-256, RSA-2048+）
- [ ] 密碼使用 bcrypt/scrypt/argon2
- [ ] 不要自己實作加密

---

## A03:2021 - Injection（注入攻擊）

### 風險說明
不受信任的資料被當作命令或查詢的一部分執行。

### SQL Injection

```typescript
// ❌ 危險：字串拼接
const query = `SELECT * FROM users WHERE email = '${email}'`;
// 攻擊：' OR '1'='1' --

// ✅ 安全：參數化查詢
const users = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [email]
);

// ✅ 安全：使用 ORM
const user = await prisma.user.findUnique({ where: { email } });
```

### NoSQL Injection

```typescript
// ❌ 危險：直接使用物件
const user = await collection.findOne({
  email: req.body.email,
  password: req.body.password
});
// 攻擊：{ "password": { "$ne": "" } }

// ✅ 安全：強制轉型
const user = await collection.findOne({
  email: String(req.body.email),
  password: String(req.body.password)
});
```

### 防護措施
- [ ] 使用參數化查詢或 ORM
- [ ] 輸入驗證（白名單優先）
- [ ] 轉義特殊字元
- [ ] 使用 LIMIT 防止大量資料洩露

---

## A04:2021 - Insecure Design（不安全設計）

### 風險說明
設計階段的安全缺陷。

### 常見問題

```typescript
// ❌ 不安全設計：無限重試
async function resetPassword(email: string) {
  const code = generateCode();
  await sendEmail(email, code);
  // 攻擊者可以無限嘗試驗證碼
}

// ✅ 安全設計：限制嘗試
async function resetPassword(email: string) {
  // 檢查請求頻率
  const recentRequests = await getRecentRequests(email);
  if (recentRequests > 3) {
    throw new Error('Too many requests');
  }

  const code = generateSecureCode(); // 6位數字不夠安全
  const expiry = Date.now() + 15 * 60 * 1000; // 15 分鐘過期

  await saveResetCode(email, { code, expiry, attempts: 0 });
  await sendEmail(email, code);
}

async function verifyResetCode(email: string, code: string) {
  const reset = await getResetCode(email);

  if (reset.attempts > 5) {
    throw new Error('Too many attempts');
  }

  if (Date.now() > reset.expiry) {
    throw new Error('Code expired');
  }

  await incrementAttempts(email);

  if (reset.code !== code) {
    throw new Error('Invalid code');
  }
}
```

### 防護措施
- [ ] 建立安全開發生命週期
- [ ] 使用威脅建模
- [ ] 設計時考慮攻擊情境
- [ ] 限制資源消耗

---

## A05:2021 - Security Misconfiguration（安全配置錯誤）

### 常見問題

```typescript
// ❌ 危險：暴露錯誤詳情
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // 暴露內部資訊！
  });
});

// ✅ 安全：通用錯誤訊息
app.use((err, req, res, next) => {
  logger.error('Error', { err, path: req.path });

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

### 防護措施
- [ ] 移除不需要的功能和框架
- [ ] 使用安全標頭（Helmet）
- [ ] 關閉詳細錯誤訊息
- [ ] 更新所有軟體
- [ ] 最小權限原則

---

## A06:2021 - Vulnerable Components（易受攻擊元件）

### 防護措施

```bash
# 檢查 npm 套件漏洞
npm audit

# 修復漏洞
npm audit fix

# 更新過時套件
npm outdated
npm update
```

- [ ] 定期檢查依賴漏洞
- [ ] 只使用可信來源的套件
- [ ] 監控 CVE 資料庫
- [ ] 自動化依賴更新（Dependabot）

---

## A07:2021 - Identification and Authentication Failures

### 常見漏洞

```typescript
// ❌ 弱密碼規則
if (password.length > 0) { }

// ✅ 強密碼規則
function validatePassword(password: string) {
  if (password.length < 12) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
}

// ❌ 無登入限制
async function login(email, password) {
  const user = await findUser(email);
  if (user && await bcrypt.compare(password, user.password)) {
    return createSession(user);
  }
  throw new Error('Invalid credentials');
}

// ✅ 有登入限制
async function login(email, password) {
  // 檢查失敗次數
  const attempts = await getLoginAttempts(email);
  if (attempts > 5) {
    const lockoutEnd = await getLockoutEnd(email);
    if (Date.now() < lockoutEnd) {
      throw new Error('Account locked');
    }
  }

  const user = await findUser(email);
  if (user && await bcrypt.compare(password, user.password)) {
    await clearLoginAttempts(email);
    return createSession(user);
  }

  await incrementLoginAttempts(email);
  throw new Error('Invalid credentials');
}
```

### 防護措施
- [ ] 實作多因素認證
- [ ] 不使用預設密碼
- [ ] 限制登入嘗試
- [ ] 安全的密碼重設流程
- [ ] Session 安全配置

---

## A08:2021 - Software and Data Integrity Failures

### 防護措施
- [ ] 使用數位簽章驗證軟體
- [ ] 使用可信的 CI/CD 管道
- [ ] 驗證依賴完整性（lockfile）
- [ ] 序列化資料時驗證來源

---

## A09:2021 - Security Logging and Monitoring Failures

### 正確的安全日誌

```typescript
// ✅ 記錄安全事件
async function login(email, password) {
  try {
    const user = await authenticate(email, password);

    logger.info('Login successful', {
      userId: user.id,
      email: maskEmail(email),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    return createSession(user);
  } catch (error) {
    logger.warn('Login failed', {
      email: maskEmail(email),
      ip: req.ip,
      reason: error.message
    });

    throw error;
  }
}
```

### 防護措施
- [ ] 記錄登入、存取控制、伺服器錯誤
- [ ] 結構化日誌（JSON）
- [ ] 日誌集中管理
- [ ] 設定警報閾值
- [ ] 不記錄敏感資料

---

## A10:2021 - Server-Side Request Forgery (SSRF)

### 常見漏洞

```typescript
// ❌ 危險：未驗證 URL
app.get('/fetch', async (req, res) => {
  const response = await fetch(req.query.url);
  res.send(await response.text());
  // 攻擊者可以存取內部服務！
});

// ✅ 安全：白名單驗證
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];

app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);

  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }

  const response = await fetch(url);
  res.send(await response.text());
});
```

### 防護措施
- [ ] 驗證並清理所有使用者提供的 URL
- [ ] 使用白名單允許的目標
- [ ] 禁止存取內部 IP 範圍
- [ ] 使用防火牆規則

---

## OWASP 審查清單

| 類別 | 檢查項目 | 優先級 |
|------|----------|--------|
| A01 | 所有端點驗證權限 | 🔴 |
| A02 | 密碼使用 bcrypt | 🔴 |
| A03 | 使用參數化查詢 | 🔴 |
| A05 | 不暴露錯誤詳情 | 🔴 |
| A07 | 限制登入嘗試 | 🟡 |
| A09 | 記錄安全事件 | 🟡 |
| A06 | 無已知漏洞套件 | 🟡 |
