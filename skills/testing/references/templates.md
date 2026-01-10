# 測試範本

## Jest/Vitest 單元測試範本

### 基本結構

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
// 或 Jest 直接使用全域

import { functionUnderTest } from './module';

describe('functionUnderTest', () => {
  // 設置
  beforeEach(() => {
    // 每個測試前執行
  });

  afterEach(() => {
    // 每個測試後清理
  });

  // Happy path
  describe('正常情況', () => {
    test('should return expected result with valid input', () => {
      // Arrange
      const input = { /* ... */ };
      const expected = { /* ... */ };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  // Edge cases
  describe('邊界情況', () => {
    test('should handle empty input', () => {
      expect(functionUnderTest([])).toEqual([]);
    });

    test('should handle null input', () => {
      expect(() => functionUnderTest(null)).toThrow();
    });
  });

  // Error cases
  describe('錯誤情況', () => {
    test('should throw error with invalid input', () => {
      expect(() => functionUnderTest('invalid')).toThrow('Invalid input');
    });
  });
});
```

### Async 測試

```typescript
describe('asyncFunction', () => {
  test('should resolve with data', async () => {
    const result = await asyncFunction();
    expect(result).toEqual({ data: 'value' });
  });

  test('should reject with error', async () => {
    await expect(asyncFunction('invalid')).rejects.toThrow('Error message');
  });

  test('should handle timeout', async () => {
    jest.useFakeTimers();

    const promise = asyncFunctionWithTimeout();
    jest.advanceTimersByTime(5000);

    await expect(promise).rejects.toThrow('Timeout');

    jest.useRealTimers();
  });
});
```

---

## React Component 測試範本

### React Testing Library

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  // 渲染測試
  test('renders correctly', () => {
    render(<MyComponent title="Hello" />);

    expect(screen.getByRole('heading')).toHaveTextContent('Hello');
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  // 互動測試
  test('handles click event', async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // 表單測試
  test('submits form with input value', async () => {
    const handleSubmit = jest.fn();
    render(<MyForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });

  // 非同步測試
  test('loads and displays data', async () => {
    render(<DataLoader />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
    });
  });
});
```

### Hook 測試

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  test('初始值為 0', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  test('increment 增加計數', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  test('使用自訂初始值', () => {
    const { result } = renderHook(() => useCounter(10));

    expect(result.current.count).toBe(10);
  });
});
```

---

## API 測試範本

### Express/Fastify

```typescript
import request from 'supertest';
import { createApp } from './app';

describe('Users API', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp({ testing: true });
  });

  describe('GET /api/users/:id', () => {
    test('回傳用戶資料', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: '1',
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    test('用戶不存在時回傳 404', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    test('未認證時回傳 401', async () => {
      const response = await request(app).get('/api/users/1');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/users', () => {
    test('建立新用戶', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123!',
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.password).toBeUndefined(); // 不回傳密碼
    });

    test('無效 email 回傳 400', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John',
          email: 'invalid-email',
          password: 'password',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });
  });
});
```

---

## Playwright E2E 測試範本

```typescript
import { test, expect, Page } from '@playwright/test';

test.describe('登入流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('成功登入', async ({ page }) => {
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('顯示錯誤訊息當密碼錯誤', async ({ page }) => {
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });

  test('表單驗證', async ({ page }) => {
    // 不填任何欄位直接提交
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-error="email"]')).toBeVisible();
    await expect(page.locator('[data-error="password"]')).toBeVisible();
  });
});

test.describe('結帳流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登入
    await loginAsUser(page);

    // 加入商品到購物車
    await page.goto('/products/1');
    await page.click('[data-testid="add-to-cart"]');
  });

  test('完成購買', async ({ page }) => {
    await page.click('[data-testid="checkout-button"]');

    // 填寫付款資訊
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');

    await page.click('[data-testid="pay-button"]');

    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});

// 輔助函數
async function loginAsUser(page: Page) {
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

---

## 測試資料 Factory 範本

```typescript
import { faker } from '@faker-js/faker';

// User Factory
export const userFactory = {
  build: (overrides: Partial<User> = {}): User => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.past(),
    ...overrides,
  }),

  buildList: (count: number, overrides: Partial<User> = {}): User[] => {
    return Array.from({ length: count }, () => userFactory.build(overrides));
  },

  create: async (overrides: Partial<User> = {}): Promise<User> => {
    const user = userFactory.build(overrides);
    return db.users.create(user);
  },
};

// Order Factory
export const orderFactory = {
  build: (overrides: Partial<Order> = {}): Order => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    items: [
      {
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price()),
      },
    ],
    total: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    status: 'pending',
    createdAt: faker.date.recent(),
    ...overrides,
  }),
};

// 使用範例
describe('OrderService', () => {
  test('計算訂單總價', () => {
    const order = orderFactory.build({
      items: [
        { productId: '1', quantity: 2, price: 10 },
        { productId: '2', quantity: 1, price: 20 },
      ],
    });

    const total = calculateOrderTotal(order);

    expect(total).toBe(40);
  });
});
```

---

## 測試腳本 (package.json)

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:ci": "vitest --run --coverage && playwright test"
  }
}
```
