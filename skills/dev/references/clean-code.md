# Clean Code 完整指南

## 命名的藝術

### 變數命名原則

#### 1. 使用有意義的名稱

```typescript
// ❌ 不好
const d = new Date();
const x = users.filter(u => u.age > 18);

// ✅ 好
const currentDate = new Date();
const adultUsers = users.filter(user => user.age >= 18);
```

#### 2. 使用可發音的名稱

```typescript
// ❌ 難以討論
const yyyymmddhhmm = '2024-01-15 10:30';
const cstmrLst = [];

// ✅ 容易溝通
const formattedDateTime = '2024-01-15 10:30';
const customerList = [];
```

#### 3. 使用可搜尋的名稱

```typescript
// ❌ 魔術數字
if (user.status === 1) { ... }
setTimeout(fn, 86400000);

// ✅ 具名常數
const USER_STATUS_ACTIVE = 1;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (user.status === USER_STATUS_ACTIVE) { ... }
setTimeout(fn, ONE_DAY_MS);
```

### 函數命名規則

| 操作類型 | 前綴 | 範例 |
|----------|------|------|
| 取得資料 | get, fetch, find, retrieve | `getUserById()` |
| 設定資料 | set, update, save | `setUserName()` |
| 布林判斷 | is, has, can, should | `isValid()` |
| 事件處理 | handle, on | `handleClick()` |
| 轉換資料 | to, convert, parse | `toJSON()` |
| 建立物件 | create, build, make | `createUser()` |
| 刪除資料 | delete, remove, clear | `deleteUser()` |

### 類別命名規則

```typescript
// 名詞或名詞片語
class UserService { }
class OrderRepository { }
class PaymentProcessor { }

// 介面：描述能力
interface Comparable { }
interface Serializable { }
interface Cacheable { }
```

---

## 函數設計原則

### 1. 單一職責

```typescript
// ❌ 做太多事
function processUser(user) {
  validateUser(user);
  saveToDatabase(user);
  sendWelcomeEmail(user);
  logActivity(user);
}

// ✅ 拆分職責
function createUser(user) {
  validateUser(user);
  return saveToDatabase(user);
}

function onUserCreated(user) {
  sendWelcomeEmail(user);
  logActivity(user);
}
```

### 2. 保持簡短

```typescript
// 理想長度：5-20 行
// 最大長度：30 行
// 超過就該拆分
```

### 3. 減少參數

```typescript
// ❌ 太多參數
function createUser(name, email, age, address, phone, role) { }

// ✅ 使用物件
function createUser(userData: CreateUserDto) { }

// ✅ 或使用 Builder
const user = new UserBuilder()
  .setName('John')
  .setEmail('john@example.com')
  .setRole('admin')
  .build();
```

### 4. 避免副作用

```typescript
// ❌ 有副作用的函數
let globalCounter = 0;
function processItem(item) {
  globalCounter++;  // 副作用！
  return transform(item);
}

// ✅ 純函數
function processItem(item, counter) {
  return {
    result: transform(item),
    newCounter: counter + 1
  };
}
```

### 5. Early Return

```typescript
// ❌ 深層巢狀
function processOrder(order) {
  if (order) {
    if (order.items.length > 0) {
      if (order.status === 'pending') {
        // 處理訂單
      }
    }
  }
}

// ✅ 提早返回
function processOrder(order) {
  if (!order) return;
  if (order.items.length === 0) return;
  if (order.status !== 'pending') return;

  // 處理訂單
}
```

---

## 註解原則

### 好的註解

```typescript
// 解釋「為什麼」，不是「什麼」
// 歷史原因：舊版 API 不支援批次請求
for (const item of items) {
  await api.send(item);
}

// 警告後果
// WARNING: 修改此正則表達式可能導致效能問題
const emailRegex = /complex-pattern/;

// 法律或授權資訊
// Copyright 2024 Company. MIT License.

// TODO 有追蹤
// TODO(#123): 重構為使用新的 API
```

### 不好的註解

```typescript
// ❌ 註解顯而易見的事
i++; // 增加 i

// ❌ 註解應該是變數名
const d = 5; // 天數

// ❌ 過時的註解
// 發送 email 給用戶
function sendSMS(user) { } // 實際上發 SMS

// ❌ 註解掉的程式碼
// function oldMethod() { ... }
```

---

## 錯誤處理

### 使用例外而非錯誤碼

```typescript
// ❌ 錯誤碼
function getUser(id) {
  if (!id) return { error: 'INVALID_ID' };
  const user = db.find(id);
  if (!user) return { error: 'NOT_FOUND' };
  return { data: user };
}

// ✅ 例外
function getUser(id: string): User {
  if (!id) throw new InvalidIdError(id);
  const user = db.find(id);
  if (!user) throw new NotFoundError('User', id);
  return user;
}
```

### 定義例外類別

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### 不要忽略例外

```typescript
// ❌ 空的 catch
try {
  doSomething();
} catch (e) {
  // 忽略錯誤
}

// ✅ 至少記錄
try {
  doSomething();
} catch (error) {
  logger.error('doSomething failed', { error });
  // 決定是否重新拋出
}
```

---

## 程式碼組織

### 檔案結構

```
src/
├── components/     # UI 元件
├── hooks/          # React hooks
├── services/       # 業務邏輯
├── utils/          # 工具函數
├── types/          # TypeScript 型別
├── constants/      # 常數定義
└── api/            # API 呼叫
```

### 相關程式碼放在一起

```typescript
// ❌ 分散的相關程式碼
const MAX_RETRIES = 3;
// ... 100 行其他程式碼 ...
function retry() { /* 使用 MAX_RETRIES */ }

// ✅ 相關程式碼在一起
const MAX_RETRIES = 3;

function retry() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    // ...
  }
}
```

### Import 順序

```typescript
// 1. 內建模組
import path from 'path';
import fs from 'fs';

// 2. 第三方套件
import express from 'express';
import lodash from 'lodash';

// 3. 內部模組（絕對路徑）
import { UserService } from '@/services/user';
import { logger } from '@/utils/logger';

// 4. 相對路徑
import { Button } from './Button';
import { styles } from './styles';
```
