# 測試策略完整指南

## 測試金字塔

```
        /\
       /  \
      / E2E \           5-10%: 關鍵使用者流程
     /--------\
    /Integration\       15-25%: API、服務互動
   /--------------\
  /   Unit Tests    \   65-80%: 函數、元件
 /____________________\
```

| 層級 | 比例 | 速度 | 成本 | 信心度 |
|------|------|------|------|--------|
| Unit | 65-80% | 毫秒 | 低 | 中 |
| Integration | 15-25% | 秒 | 中 | 高 |
| E2E | 5-10% | 分鐘 | 高 | 很高 |

---

## 什麼要測試

### 🔴 必測（高優先級）

| 類別 | 說明 | 範例 |
|------|------|------|
| 核心業務邏輯 | 最重要的功能 | 訂單計算、權限檢查 |
| 金流相關 | 涉及金錢 | 支付、退款、帳單 |
| 安全相關 | 防止攻擊 | 認證、授權、輸入驗證 |
| 資料完整性 | 防止資料損壞 | 資料庫操作、資料轉換 |

### 🟡 應測（中優先級）

| 類別 | 說明 | 範例 |
|------|------|------|
| API 端點 | 對外介面 | REST/GraphQL 端點 |
| 表單驗證 | 用戶輸入 | 註冊、登入表單 |
| 狀態管理 | 應用狀態 | Redux actions/reducers |
| 錯誤處理 | 異常情況 | 網路錯誤、逾時 |

### 🟢 可測（低優先級）

| 類別 | 說明 | 範例 |
|------|------|------|
| UI 互動 | 用戶介面 | 按鈕點擊、表單提交 |
| 樣式 | 視覺效果 | 響應式佈局 |
| 效能 | 速度相關 | 載入時間、渲染效能 |

### ⚪ 不測

| 類別 | 原因 |
|------|------|
| 框架本身 | 框架已經測過 |
| 第三方函式庫 | 函式庫作者測過 |
| 簡單的 getter/setter | 太簡單，沒有邏輯 |
| 私有方法 | 透過公開介面測試 |
| 實作細節 | 測行為，不測實作 |

---

## 測試類型策略

### Unit Test（單元測試）

**目標**：測試單一函數或元件的邏輯

```typescript
// 純函數 - 最容易測試
function calculateDiscount(price: number, discountRate: number): number {
  if (discountRate < 0 || discountRate > 1) {
    throw new Error('Invalid discount rate');
  }
  return price * (1 - discountRate);
}

describe('calculateDiscount', () => {
  // Happy path
  test('計算 20% 折扣', () => {
    expect(calculateDiscount(100, 0.2)).toBe(80);
  });

  // 邊界
  test('0% 折扣', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  test('100% 折扣', () => {
    expect(calculateDiscount(100, 1)).toBe(0);
  });

  // 錯誤情況
  test('負數折扣率拋出錯誤', () => {
    expect(() => calculateDiscount(100, -0.1)).toThrow();
  });

  test('超過 100% 折扣率拋出錯誤', () => {
    expect(() => calculateDiscount(100, 1.5)).toThrow();
  });
});
```

### Integration Test（整合測試）

**目標**：測試多個元件如何協同工作

```typescript
// API 整合測試
describe('POST /api/users', () => {
  let app: Express;
  let db: Database;

  beforeAll(async () => {
    db = await createTestDatabase();
    app = createApp({ db });
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clear();
  });

  test('成功建立用戶', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: 'securePassword123!'
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'John',
      email: 'john@example.com'
    });
    expect(response.body.password).toBeUndefined();

    // 驗證資料庫
    const user = await db.users.findById(response.body.id);
    expect(user).toBeTruthy();
    expect(user.name).toBe('John');
  });

  test('重複 email 回傳 409', async () => {
    await db.users.create({
      name: 'Existing',
      email: 'john@example.com',
      password: 'hashedPassword'
    });

    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: 'securePassword123!'
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('email');
  });
});
```

### E2E Test（端對端測試）

**目標**：從用戶角度測試完整流程

```typescript
// Playwright E2E 測試
test.describe('購買流程', () => {
  test('用戶可以完成結帳', async ({ page }) => {
    // 1. 登入
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 2. 瀏覽商品
    await page.goto('/products');
    await page.click('[data-testid="product-1"]');

    // 3. 加入購物車
    await page.click('[data-testid="add-to-cart"]');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // 4. 結帳
    await page.click('[data-testid="checkout-button"]');
    await page.fill('[name="card"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');
    await page.click('[data-testid="pay-button"]');

    // 5. 確認成功
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('h1')).toContainText('Thank you');
  });
});
```

---

## 測試命名規範

### 描述行為

```typescript
// Pattern: should [行為] when [條件]
describe('UserService', () => {
  test('should return null when user not found', () => {});
  test('should throw error when email is invalid', () => {});
  test('should update password when current password is correct', () => {});
});
```

### Given-When-Then

```typescript
describe('購物車', () => {
  describe('given 空購物車', () => {
    describe('when 加入商品', () => {
      test('then 商品數量為 1', () => {});
      test('then 總價為商品價格', () => {});
    });
  });

  describe('given 購物車有商品', () => {
    describe('when 移除商品', () => {
      test('then 商品數量減少', () => {});
    });
  });
});
```

---

## 測試覆蓋率策略

### 覆蓋率目標

| 專案類型 | Line | Branch | Function |
|----------|------|--------|----------|
| 高風險（金融、醫療）| 90%+ | 85%+ | 95%+ |
| 一般應用 | 80%+ | 75%+ | 85%+ |
| 內部工具 | 70%+ | 65%+ | 75%+ |
| 原型/POC | 不設定 | 不設定 | 不設定 |

### 覆蓋率配置

```json
// jest.config.js
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

### 覆蓋率不是一切

高覆蓋率 ≠ 高品質測試

```typescript
// 100% 覆蓋率但沒用的測試
test('calculateTotal', () => {
  const result = calculateTotal([{ price: 10 }]);
  expect(result).toBeDefined(); // 沒有驗證值！
});

// 有意義的測試
test('calculateTotal 正確加總', () => {
  expect(calculateTotal([{ price: 10 }, { price: 20 }])).toBe(30);
});
```

---

## 測試環境策略

### 隔離環境

```typescript
// 每個測試檔案獨立資料庫
beforeAll(async () => {
  testDb = await createTestDatabase(`test_${process.env.JEST_WORKER_ID}`);
});

afterAll(async () => {
  await testDb.drop();
});
```

### 測試資料管理

```typescript
// 使用 Factory
const userFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    ...overrides
  }),

  create: async (overrides = {}) => {
    const data = userFactory.build(overrides);
    return db.users.create(data);
  }
};

// 使用
test('更新用戶', async () => {
  const user = await userFactory.create({ name: 'Original' });

  await userService.updateName(user.id, 'Updated');

  const updated = await db.users.findById(user.id);
  expect(updated.name).toBe('Updated');
});
```

---

## 測試策略檢查清單

### 專案開始時
- [ ] 決定測試金字塔比例
- [ ] 設定覆蓋率目標
- [ ] 選擇測試框架
- [ ] 配置 CI/CD 測試流程

### 每個功能
- [ ] 識別核心邏輯 → Unit Test
- [ ] 識別整合點 → Integration Test
- [ ] 識別關鍵流程 → E2E Test

### 定期維護
- [ ] 移除 flaky tests
- [ ] 更新過時測試
- [ ] 檢視覆蓋率報告
- [ ] 識別測試缺口
