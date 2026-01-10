# 設計模式詳解

## Creational Patterns（建立型）

### Factory Pattern

**使用時機**：需要建立不同類型但有共同介面的物件。

```typescript
// 定義介面
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
}

// 具體實作
class CreditCardProcessor implements PaymentProcessor {
  async process(amount: number) {
    // 信用卡處理邏輯
  }
}

class PayPalProcessor implements PaymentProcessor {
  async process(amount: number) {
    // PayPal 處理邏輯
  }
}

// Factory
class PaymentFactory {
  static create(type: 'credit' | 'paypal'): PaymentProcessor {
    switch (type) {
      case 'credit':
        return new CreditCardProcessor();
      case 'paypal':
        return new PayPalProcessor();
      default:
        throw new Error(`Unknown payment type: ${type}`);
    }
  }
}

// 使用
const processor = PaymentFactory.create('credit');
await processor.process(100);
```

### Builder Pattern

**使用時機**：建立複雜物件，需要多個步驟或可選參數。

```typescript
class QueryBuilder {
  private query: Partial<Query> = {};

  select(fields: string[]): this {
    this.query.fields = fields;
    return this;
  }

  from(table: string): this {
    this.query.table = table;
    return this;
  }

  where(condition: Condition): this {
    this.query.conditions = [...(this.query.conditions || []), condition];
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy = { field, direction };
    return this;
  }

  limit(count: number): this {
    this.query.limit = count;
    return this;
  }

  build(): Query {
    if (!this.query.table) {
      throw new Error('Table is required');
    }
    return this.query as Query;
  }
}

// 使用
const query = new QueryBuilder()
  .select(['id', 'name', 'email'])
  .from('users')
  .where({ field: 'age', op: '>', value: 18 })
  .orderBy('name')
  .limit(10)
  .build();
```

### Singleton Pattern

**使用時機**：需要全域唯一實例（如 Logger、Config）。

```typescript
class Logger {
  private static instance: Logger;

  private constructor() {
    // 私有建構子防止直接 new
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

// 使用
const logger = Logger.getInstance();
logger.log('Hello');
```

**TypeScript 更簡單的寫法**：

```typescript
// 直接 export 實例
export const logger = {
  log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
};
```

---

## Structural Patterns（結構型）

### Adapter Pattern

**使用時機**：整合不相容的介面（如第三方 API）。

```typescript
// 第三方 API 的格式
interface ThirdPartyUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
}

// 我們的格式
interface User {
  name: string;
  email: string;
}

// Adapter
class UserAdapter {
  static fromThirdParty(tpUser: ThirdPartyUser): User {
    return {
      name: `${tpUser.firstName} ${tpUser.lastName}`,
      email: tpUser.emailAddress,
    };
  }

  static toThirdParty(user: User): ThirdPartyUser {
    const [firstName, ...rest] = user.name.split(' ');
    return {
      firstName,
      lastName: rest.join(' '),
      emailAddress: user.email,
    };
  }
}

// 使用
const thirdPartyData = await fetchFromThirdParty();
const user = UserAdapter.fromThirdParty(thirdPartyData);
```

### Decorator Pattern

**使用時機**：動態添加功能而不修改原始類別。

```typescript
// 基礎介面
interface HttpClient {
  get(url: string): Promise<Response>;
}

// 基礎實作
class BasicHttpClient implements HttpClient {
  async get(url: string): Promise<Response> {
    return fetch(url);
  }
}

// Logging Decorator
class LoggingHttpClient implements HttpClient {
  constructor(private client: HttpClient) {}

  async get(url: string): Promise<Response> {
    console.log(`GET ${url}`);
    const start = Date.now();
    const response = await this.client.get(url);
    console.log(`GET ${url} completed in ${Date.now() - start}ms`);
    return response;
  }
}

// Caching Decorator
class CachingHttpClient implements HttpClient {
  private cache = new Map<string, Response>();

  constructor(private client: HttpClient) {}

  async get(url: string): Promise<Response> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone();
    }
    const response = await this.client.get(url);
    this.cache.set(url, response.clone());
    return response;
  }
}

// 組合使用
const client = new CachingHttpClient(
  new LoggingHttpClient(
    new BasicHttpClient()
  )
);
```

### Facade Pattern

**使用時機**：簡化複雜系統的介面。

```typescript
// 複雜的子系統
class AuthService {
  login(credentials: Credentials): Token { }
  logout(token: Token): void { }
}

class UserService {
  getProfile(userId: string): User { }
  updateProfile(userId: string, data: Partial<User>): User { }
}

class NotificationService {
  sendEmail(to: string, subject: string, body: string): void { }
}

// Facade 提供簡單介面
class AccountFacade {
  constructor(
    private auth: AuthService,
    private user: UserService,
    private notification: NotificationService
  ) {}

  async register(data: RegistrationData): Promise<User> {
    // 1. 建立帳號
    const user = await this.user.createUser(data);

    // 2. 自動登入
    const token = await this.auth.login({
      email: data.email,
      password: data.password
    });

    // 3. 發送歡迎信
    await this.notification.sendEmail(
      data.email,
      'Welcome!',
      'Thanks for registering.'
    );

    return user;
  }
}
```

---

## Behavioral Patterns（行為型）

### Observer Pattern

**使用時機**：事件驅動、訂閱/發布。

```typescript
type Listener<T> = (data: T) => void;

class EventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // 返回取消訂閱函數
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(listener => listener(data));
  }
}

// 定義事件類型
interface CartEvents {
  itemAdded: { item: Product; quantity: number };
  itemRemoved: { itemId: string };
  checkout: { total: number };
}

// 使用
const cartEvents = new EventEmitter<CartEvents>();

const unsubscribe = cartEvents.on('itemAdded', ({ item, quantity }) => {
  console.log(`Added ${quantity}x ${item.name}`);
});

cartEvents.emit('itemAdded', { item: product, quantity: 2 });
```

### Strategy Pattern

**使用時機**：需要在運行時切換算法。

```typescript
// 策略介面
interface SortStrategy<T> {
  sort(items: T[]): T[];
}

// 具體策略
class QuickSort<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    // Quick sort 實作
    return [...items].sort();
  }
}

class MergeSort<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    // Merge sort 實作
    return [...items].sort();
  }
}

// 使用策略的類別
class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(items: T[]): T[] {
    return this.strategy.sort(items);
  }
}

// 使用
const sorter = new Sorter(new QuickSort());
sorter.sort([3, 1, 4, 1, 5]);

// 動態切換策略
sorter.setStrategy(new MergeSort());
sorter.sort([3, 1, 4, 1, 5]);
```

### Command Pattern

**使用時機**：需要撤銷/重做功能。

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class AddTextCommand implements Command {
  constructor(
    private document: Document,
    private text: string,
    private position: number
  ) {}

  execute(): void {
    this.document.insertAt(this.position, this.text);
  }

  undo(): void {
    this.document.deleteAt(this.position, this.text.length);
  }
}

class CommandHistory {
  private history: Command[] = [];
  private position = -1;

  execute(command: Command): void {
    // 移除 redo 歷史
    this.history = this.history.slice(0, this.position + 1);

    command.execute();
    this.history.push(command);
    this.position++;
  }

  undo(): void {
    if (this.position < 0) return;

    this.history[this.position].undo();
    this.position--;
  }

  redo(): void {
    if (this.position >= this.history.length - 1) return;

    this.position++;
    this.history[this.position].execute();
  }
}
```

---

## 何時使用哪個模式

| 需求 | 推薦模式 |
|------|----------|
| 建立多種類型物件 | Factory |
| 複雜物件逐步建立 | Builder |
| 全域唯一實例 | Singleton |
| 整合第三方 API | Adapter |
| 動態添加功能 | Decorator |
| 簡化複雜系統 | Facade |
| 事件通知 | Observer |
| 可替換算法 | Strategy |
| 撤銷/重做 | Command |
