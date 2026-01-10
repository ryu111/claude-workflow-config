# Mock 最佳實踐完整指南

## Mock 的目的

Mock（模擬）用於隔離被測程式碼，使測試：
- 更快（不需要真實 I/O）
- 更可靠（不依賴外部服務）
- 更可控（可以模擬各種情境）

---

## 什麼該 Mock

| 該 Mock | 不該 Mock |
|---------|-----------|
| 外部 API 呼叫 | 被測函數本身 |
| 資料庫操作 | 純邏輯函數 |
| 檔案系統 | 簡單的工具函數 |
| 時間 (Date.now) | 常數和設定 |
| 隨機數 | 內部私有方法 |
| 第三方服務 | 值物件 |

---

## Jest Mock 基礎

### 模擬函數

```typescript
// 建立 mock 函數
const mockFn = jest.fn();

// 設定回傳值
mockFn.mockReturnValue(42);
mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2);

// 設定 Promise 回傳
mockFn.mockResolvedValue({ id: 1 });
mockFn.mockRejectedValue(new Error('Failed'));

// 設定實作
mockFn.mockImplementation((x) => x * 2);

// 驗證呼叫
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);
```

### 模擬模組

```typescript
// 完全模擬模組
jest.mock('./emailService');

// 部分模擬
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  sendEmail: jest.fn(),
}));

// 模擬 node 模組
jest.mock('axios');
```

---

## 常見 Mock 場景

### 1. Mock 外部 API

```typescript
// api.service.ts
export async function fetchUser(id: string): Promise<User> {
  const response = await axios.get(`/api/users/${id}`);
  return response.data;
}

// api.service.test.ts
import axios from 'axios';
import { fetchUser } from './api.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('成功取得用戶', async () => {
    const mockUser = { id: '1', name: 'John' };
    mockedAxios.get.mockResolvedValue({ data: mockUser });

    const user = await fetchUser('1');

    expect(user).toEqual(mockUser);
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/1');
  });

  test('API 錯誤時拋出例外', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(fetchUser('1')).rejects.toThrow('Network error');
  });
});
```

### 2. Mock 資料庫

```typescript
// user.repository.ts
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}

// user.service.test.ts
describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    userService = new UserService(mockRepository);
  });

  test('找到用戶時回傳用戶', async () => {
    const mockUser = { id: '1', name: 'John' };
    mockRepository.findById.mockResolvedValue(mockUser);

    const user = await userService.getUser('1');

    expect(user).toEqual(mockUser);
  });

  test('找不到用戶時拋出例外', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(userService.getUser('999')).rejects.toThrow('User not found');
  });
});
```

### 3. Mock 時間

```typescript
describe('Token 過期檢查', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Token 過期', () => {
    const token = createToken({ expiresIn: '1h' });

    // 前進 2 小時
    jest.advanceTimersByTime(2 * 60 * 60 * 1000);

    expect(isTokenExpired(token)).toBe(true);
  });

  test('Token 未過期', () => {
    const token = createToken({ expiresIn: '1h' });

    // 前進 30 分鐘
    jest.advanceTimersByTime(30 * 60 * 1000);

    expect(isTokenExpired(token)).toBe(false);
  });

  test('設定特定時間', () => {
    jest.setSystemTime(new Date('2024-01-01'));

    const result = formatCurrentDate();

    expect(result).toBe('2024-01-01');
  });
});
```

### 4. Mock 環境變數

```typescript
describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('讀取 API_KEY', () => {
    process.env.API_KEY = 'test-key';

    const { getApiKey } = require('./config');

    expect(getApiKey()).toBe('test-key');
  });

  test('缺少 API_KEY 時拋出錯誤', () => {
    delete process.env.API_KEY;

    const { getApiKey } = require('./config');

    expect(() => getApiKey()).toThrow('API_KEY is required');
  });
});
```

### 5. Mock 隨機數

```typescript
describe('generateId', () => {
  test('產生唯一 ID', () => {
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.5);

    const id = generateId();

    expect(id).toBe('8000000000000000'); // 可預測的結果
    mockRandom.mockRestore();
  });
});

// 或使用 crypto
describe('generateSecureToken', () => {
  test('產生 token', () => {
    const mockRandomBytes = jest.spyOn(crypto, 'randomBytes');
    mockRandomBytes.mockImplementation(() => Buffer.from('1234567890123456'));

    const token = generateSecureToken();

    expect(token).toBe('31323334353637383930313233343536');
    mockRandomBytes.mockRestore();
  });
});
```

---

## Spy 使用

Spy 可以監視真實函數，不完全替換它。

```typescript
describe('Logger', () => {
  test('記錄錯誤', () => {
    const consoleSpy = jest.spyOn(console, 'error');

    logger.error('Test error');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test error')
    );

    consoleSpy.mockRestore();
  });
});

// Spy 並修改行為
describe('API with retry', () => {
  test('重試失敗後成功', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    fetchSpy
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: () => ({ data: 'success' }) });

    const result = await fetchWithRetry('/api/data');

    expect(result.data).toBe('success');
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    fetchSpy.mockRestore();
  });
});
```

---

## 避免 Over-Mocking

### 問題：Mock 太多

```typescript
// ❌ 過度 Mock，測試沒有意義
jest.mock('./utils');
jest.mock('./validation');
jest.mock('./transform');
jest.mock('./format');

test('processData', () => {
  // 幾乎所有東西都被 mock 了
  // 這測試到底在測什麼？
  expect(processData(input)).toBe(output);
});
```

### 解決方案

```typescript
// ✅ 只 mock 外部依賴
jest.mock('./externalApi');

test('processData', () => {
  // 真正的 utils, validation, transform, format 邏輯都有被測試
  // 只有外部 API 是假的
  mockApi.getData.mockResolvedValue(testData);

  const result = await processData(input);

  expect(result).toEqual(expectedOutput);
});
```

---

## Mock 清理

```typescript
describe('UserService', () => {
  beforeEach(() => {
    // 清除所有 mock 的呼叫記錄
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 重置所有 mock 到初始狀態
    jest.resetAllMocks();
  });

  afterAll(() => {
    // 恢復所有 mock 到原始實作
    jest.restoreAllMocks();
  });
});
```

| 方法 | 效果 |
|------|------|
| `clearAllMocks()` | 清除呼叫記錄，保留 mock 設定 |
| `resetAllMocks()` | 清除記錄和設定 |
| `restoreAllMocks()` | 完全恢復原始實作 |

---

## Mock 檢查清單

### 設置
- [ ] 只 mock 外部依賴
- [ ] 使用依賴注入便於測試
- [ ] Mock 設定在 beforeEach 中

### 驗證
- [ ] 驗證 mock 被呼叫
- [ ] 驗證呼叫參數
- [ ] 驗證呼叫次數

### 清理
- [ ] 每個測試後清理 mock
- [ ] 使用 mockRestore 恢復 spy
- [ ] 不要讓 mock 狀態洩漏到其他測試

### 避免
- [ ] 不要 mock 被測函數本身
- [ ] 不要 mock 純邏輯函數
- [ ] 不要過度 mock
