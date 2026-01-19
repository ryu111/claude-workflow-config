---
name: testing
description: 測試專業知識。測試金字塔、測試策略、邊界測試、Mock 最佳實踐。適用於撰寫和執行測試。
---

# 測試專業知識

確保程式碼功能正確、防止回歸。

## 測試金字塔

```
        /\
       /  \
      / E2E \        少量：關鍵流程
     /--------\
    /Integration\    中量：API、服務互動
   /--------------\
  /   Unit Tests    \  大量：函數、元件
 /____________________\
```

| 層級 | 數量 | 速度 | 成本 |
|------|------|------|------|
| Unit | 70% | 快 | 低 |
| Integration | 20% | 中 | 中 |
| E2E | 10% | 慢 | 高 |

---

## 測試策略

### 什麼要測

| 優先級 | 測試項目 |
|--------|----------|
| 🔴 必測 | 核心業務邏輯 |
| 🔴 必測 | 金流、權限相關 |
| 🟡 應測 | API 端點 |
| 🟡 應測 | 資料驗證 |
| 🟢 可測 | UI 互動 |
| ⚪ 不測 | 第三方程式碼 |

### 什麼不要測

- ❌ 框架本身的功能
- ❌ 簡單的 getter/setter
- ❌ 私有方法（測公開介面）
- ❌ 實作細節

---

## 邊界測試方法

### 等價類別劃分

```typescript
// 年齡驗證: 18-65 有效
// 等價類別:
// - 無效: < 18
// - 有效: 18-65
// - 無效: > 65

test('年齡 17 應該無效', () => {
  expect(isValidAge(17)).toBe(false);
});

test('年齡 30 應該有效', () => {
  expect(isValidAge(30)).toBe(true);
});

test('年齡 70 應該無效', () => {
  expect(isValidAge(70)).toBe(false);
});
```

### 邊界值分析

```typescript
// 測試邊界點: 17, 18, 65, 66
test('邊界值 17 (剛好無效)', () => {
  expect(isValidAge(17)).toBe(false);
});

test('邊界值 18 (剛好有效)', () => {
  expect(isValidAge(18)).toBe(true);
});

test('邊界值 65 (最大有效)', () => {
  expect(isValidAge(65)).toBe(true);
});

test('邊界值 66 (剛好無效)', () => {
  expect(isValidAge(66)).toBe(false);
});
```

### 特殊值

```typescript
// 永遠要測試的特殊值
const specialValues = [
  null,
  undefined,
  '',
  0,
  -1,
  [],
  {},
  NaN,
  Infinity,
];
```

For complete edge cases → read `references/edge-cases.md`

---

## Mock 最佳實踐

### 什麼該 Mock

| 該 Mock | 不該 Mock |
|---------|-----------|
| 外部 API | 被測函數本身 |
| 資料庫 | 純邏輯函數 |
| 時間 (Date.now) | 簡單的工具函數 |
| 隨機數 | |
| 檔案系統 | |

### Mock 範例

```typescript
// Mock 外部服務
jest.mock('./emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

// Mock 時間
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01'));

// Mock 資料庫
const mockDb = {
  find: jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
  save: jest.fn().mockResolvedValue({ id: 1 }),
};
```

### 避免 Over-Mocking

```typescript
// ❌ Mock 太多，測試沒意義
jest.mock('./utils');
jest.mock('./validation');
jest.mock('./transform');
// 幾乎整個函數都被 mock 了

// ✅ 只 mock 外部依賴
jest.mock('./externalApi');
// 測試真正的業務邏輯
```

For complete mocking → read `references/mocking.md`

---

## 測試範本

### Unit Test 範本

```typescript
describe('calculateTotal', () => {
  // 正常情況
  it('should sum items correctly', () => {
    // Arrange
    const items = [{ price: 10 }, { price: 20 }];

    // Act
    const result = calculateTotal(items);

    // Assert
    expect(result).toBe(30);
  });

  // 邊界情況
  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  // 錯誤情況
  it('should throw for invalid input', () => {
    expect(() => calculateTotal(null)).toThrow();
  });
});
```

### Integration Test 範本

**整合測試重點：驗證資料流完整性**

```
模組 A ──資料──▶ 模組 B ──資料──▶ 模組 C
         ↑              ↑
    檢查點 1       檢查點 2

必須驗證：
□ 欄位名稱一致（沒有 _name vs name 問題）
□ 必要欄位都有傳遞（沒有遺漏）
□ 型別正確（沒有 string vs number 問題）
```

```typescript
describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.clear();
  });

  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();

    // 驗證資料庫
    const user = await db.users.findById(response.body.id);
    expect(user.name).toBe('Test');
  });

  it('should return 400 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });
});
```

### E2E Test 範本 (Playwright)

```typescript
test('user can complete checkout', async ({ page }) => {
  // Navigate
  await page.goto('/products');

  // Add to cart
  await page.click('[data-testid="add-to-cart"]');

  // Go to checkout
  await page.click('[data-testid="checkout-button"]');

  // Fill form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="card"]', '4242424242424242');

  // Submit
  await page.click('[type="submit"]');

  // Verify
  await expect(page).toHaveURL('/order-confirmation');
  await expect(page.locator('h1')).toContainText('Thank you');
});
```

---

## 測試檢查清單

### 覆蓋範圍
- [ ] Happy path 測試
- [ ] 錯誤情況測試
- [ ] 邊界值測試
- [ ] Null/undefined 處理

### 測試品質
- [ ] 測試獨立（不互相依賴）
- [ ] 測試可重複
- [ ] 測試快速
- [ ] 命名清楚（should...when...）

### 避免
- [ ] 無 assertion 的測試
- [ ] 測試多件事
- [ ] Flaky tests
- [ ] 測試實作細節

---

## 多進程測試規範

### 🔴 問題：測試殘留進程

測試涉及 `ProcessPoolExecutor` 或 `multiprocessing` 時，**測試失敗或中斷會產生孤兒進程**。

### pytest fixture 正確寫法

```python
import pytest
from concurrent.futures import ProcessPoolExecutor
import multiprocessing as mp

@pytest.fixture
def executor():
    """確保測試結束後清理執行器"""
    mp_context = mp.get_context('spawn')
    exec = ProcessPoolExecutor(max_workers=2, mp_context=mp_context)
    yield exec
    # teardown：無論測試成功或失敗都會執行
    exec.shutdown(wait=True, cancel_futures=True)


def test_parallel_processing(executor):
    futures = [executor.submit(work, i) for i in range(10)]
    results = [f.result() for f in futures]
    assert len(results) == 10
```

### 測試多進程系統的技巧

```python
@pytest.fixture(scope="module")
def hyperloop_controller():
    """模組級 fixture：整個測試檔案共用一個 controller"""
    controller = HyperLoopController(config)
    yield controller
    controller.cleanup()  # 確保清理


@pytest.fixture(autouse=True)
def cleanup_orphans():
    """自動清理孤兒進程（每個測試後執行）"""
    yield
    # teardown
    import psutil
    current = psutil.Process()
    for child in current.children(recursive=True):
        if 'multiprocessing' in child.name():
            child.terminate()
```

### 檢查清單

- [ ] 使用 fixture 管理 executor 生命週期
- [ ] 在 yield 後確保 shutdown
- [ ] 考慮 `scope="module"` 減少重複創建
- [ ] 添加 `autouse=True` 清理 fixture
- [ ] 使用 `spawn` 模式避免 fork 問題

---

## 深度參考

| 主題 | 文件 |
|------|------|
| 邊界測試方法 | `references/edge-cases.md` |
| Mock 最佳實踐 | `references/mocking.md` |
| 測試範本 | `references/templates.md` |
| 測試策略 | `references/strategies.md` |
