# SOLID 原則完整指南

SOLID 是五個物件導向設計原則的縮寫，幫助開發者寫出可維護、可擴展的程式碼。

---

## S - Single Responsibility Principle（單一職責原則）

> 一個類別應該只有一個改變的理由。

### 違反範例

```typescript
// ❌ 違反 SRP：類別有多個職責
class UserService {
  async createUser(data: CreateUserInput) {
    // 驗證資料
    if (!data.email.includes('@')) {
      throw new Error('Invalid email');
    }

    // 雜湊密碼
    const hash = await bcrypt.hash(data.password, 12);

    // 儲存到資料庫
    const user = await db.user.create({
      data: { ...data, password: hash }
    });

    // 發送歡迎信
    await sendEmail(user.email, 'Welcome!', 'Thanks for joining.');

    // 記錄日誌
    console.log(`User created: ${user.id}`);

    return user;
  }
}
```

### 正確範例

```typescript
// ✅ 遵循 SRP：每個類別單一職責
class UserValidator {
  validate(data: CreateUserInput): ValidationResult {
    const errors: string[] = [];
    if (!data.email.includes('@')) errors.push('Invalid email');
    if (data.password.length < 12) errors.push('Password too short');
    return { valid: errors.length === 0, errors };
  }
}

class PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

class UserRepository {
  async create(data: CreateUserData): Promise<User> {
    return db.user.create({ data });
  }
}

class WelcomeEmailSender {
  async send(email: string): Promise<void> {
    await sendEmail(email, 'Welcome!', 'Thanks for joining.');
  }
}

// 協調者
class UserService {
  constructor(
    private validator: UserValidator,
    private hasher: PasswordHasher,
    private repository: UserRepository,
    private emailSender: WelcomeEmailSender
  ) {}

  async createUser(data: CreateUserInput): Promise<User> {
    const validation = this.validator.validate(data);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const hash = await this.hasher.hash(data.password);
    const user = await this.repository.create({ ...data, password: hash });
    await this.emailSender.send(user.email);

    return user;
  }
}
```

---

## O - Open/Closed Principle（開放封閉原則）

> 軟體應該對擴展開放，對修改封閉。

### 違反範例

```typescript
// ❌ 違反 OCP：每次新增折扣類型都要修改函數
function calculateDiscount(price: number, type: string): number {
  if (type === 'student') {
    return price * 0.1;
  } else if (type === 'senior') {
    return price * 0.15;
  } else if (type === 'vip') {
    return price * 0.2;
  } else if (type === 'employee') {
    // 新增類型需要修改這個函數
    return price * 0.3;
  }
  return 0;
}
```

### 正確範例

```typescript
// ✅ 遵循 OCP：透過擴展新增類型
interface DiscountStrategy {
  calculate(price: number): number;
}

class StudentDiscount implements DiscountStrategy {
  calculate(price: number): number {
    return price * 0.1;
  }
}

class SeniorDiscount implements DiscountStrategy {
  calculate(price: number): number {
    return price * 0.15;
  }
}

class VipDiscount implements DiscountStrategy {
  calculate(price: number): number {
    return price * 0.2;
  }
}

// 新增折扣類型不需要修改現有程式碼
class EmployeeDiscount implements DiscountStrategy {
  calculate(price: number): number {
    return price * 0.3;
  }
}

// 使用
function calculateDiscount(price: number, strategy: DiscountStrategy): number {
  return strategy.calculate(price);
}

const discount = calculateDiscount(100, new StudentDiscount());
```

---

## L - Liskov Substitution Principle（里氏替換原則）

> 子類別應該可以替換父類別而不破壞程式。

### 違反範例

```typescript
// ❌ 違反 LSP：Square 改變了 Rectangle 的行為
class Rectangle {
  protected width: number;
  protected height: number;

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  // 違反：改變了父類別的行為
  setWidth(width: number): void {
    this.width = width;
    this.height = width; // 強制相等
  }

  setHeight(height: number): void {
    this.width = height;
    this.height = height; // 強制相等
  }
}

// 問題：使用 Square 替換 Rectangle 會產生意外行為
function testRectangle(rect: Rectangle) {
  rect.setWidth(5);
  rect.setHeight(4);
  // 期望面積 = 20
  console.log(rect.getArea());
  // Rectangle: 20 ✅
  // Square: 16 ❌（因為高度設為 4 也改變了寬度）
}
```

### 正確範例

```typescript
// ✅ 遵循 LSP：使用介面而非繼承
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number
  ) {}

  getArea(): number {
    return this.width * this.height;
  }
}

class Square implements Shape {
  constructor(private side: number) {}

  getArea(): number {
    return this.side * this.side;
  }
}

// 兩者都可以正確用作 Shape
function printArea(shape: Shape) {
  console.log(shape.getArea());
}
```

---

## I - Interface Segregation Principle（介面隔離原則）

> 不應該強迫客戶端依賴它們不使用的方法。

### 違反範例

```typescript
// ❌ 違反 ISP：胖介面
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  recharge(): void;
}

// 人類工人
class HumanWorker implements Worker {
  work(): void { console.log('Working...'); }
  eat(): void { console.log('Eating...'); }
  sleep(): void { console.log('Sleeping...'); }
  recharge(): void {
    throw new Error('Humans cannot recharge!'); // 不適用！
  }
}

// 機器人工人
class RobotWorker implements Worker {
  work(): void { console.log('Working...'); }
  eat(): void {
    throw new Error('Robots cannot eat!'); // 不適用！
  }
  sleep(): void {
    throw new Error('Robots cannot sleep!'); // 不適用！
  }
  recharge(): void { console.log('Recharging...'); }
}
```

### 正確範例

```typescript
// ✅ 遵循 ISP：精簡介面
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

interface Rechargeable {
  recharge(): void;
}

// 人類工人只實作需要的介面
class HumanWorker implements Workable, Eatable, Sleepable {
  work(): void { console.log('Working...'); }
  eat(): void { console.log('Eating...'); }
  sleep(): void { console.log('Sleeping...'); }
}

// 機器人工人只實作需要的介面
class RobotWorker implements Workable, Rechargeable {
  work(): void { console.log('Working...'); }
  recharge(): void { console.log('Recharging...'); }
}
```

---

## D - Dependency Inversion Principle（依賴反轉原則）

> 高層模組不應該依賴低層模組，兩者都應該依賴抽象。

### 違反範例

```typescript
// ❌ 違反 DIP：直接依賴具體實作
class MySQLDatabase {
  save(data: any): void {
    console.log('Saving to MySQL...');
  }
}

class UserService {
  private database = new MySQLDatabase(); // 直接依賴 MySQL

  createUser(data: CreateUserInput): void {
    this.database.save(data);
  }
}

// 問題：想換成 PostgreSQL 需要修改 UserService
```

### 正確範例

```typescript
// ✅ 遵循 DIP：依賴抽象
interface Database {
  save(data: any): Promise<void>;
}

class MySQLDatabase implements Database {
  async save(data: any): Promise<void> {
    console.log('Saving to MySQL...');
  }
}

class PostgreSQLDatabase implements Database {
  async save(data: any): Promise<void> {
    console.log('Saving to PostgreSQL...');
  }
}

class MongoDatabase implements Database {
  async save(data: any): Promise<void> {
    console.log('Saving to MongoDB...');
  }
}

class UserService {
  constructor(private database: Database) {} // 依賴介面

  async createUser(data: CreateUserInput): Promise<void> {
    await this.database.save(data);
  }
}

// 使用時注入依賴
const mysqlService = new UserService(new MySQLDatabase());
const postgresService = new UserService(new PostgreSQLDatabase());
const mongoService = new UserService(new MongoDatabase());
```

---

## SOLID 快速參考

| 原則 | 核心概念 | 違反徵兆 |
|------|----------|----------|
| **S** | 一個改變理由 | 類別太大、多種職責 |
| **O** | 擴展開放、修改封閉 | 常修改 switch/if-else |
| **L** | 子類別可替換父類別 | 子類別拋出不支援例外 |
| **I** | 精簡介面 | 實作空方法或拋例外 |
| **D** | 依賴抽象 | 直接 new 具體類別 |

---

## 審查時的 SOLID 檢查

```markdown
## SOLID 檢查

### Single Responsibility
- [ ] 類別是否只有一個職責？
- [ ] 函數是否只做一件事？

### Open/Closed
- [ ] 新增功能是否需要修改現有程式碼？
- [ ] 是否可以透過擴展實現？

### Liskov Substitution
- [ ] 子類別是否可安全替換父類別？
- [ ] 繼承關係是否合理？

### Interface Segregation
- [ ] 介面是否精簡？
- [ ] 實作者是否使用所有方法？

### Dependency Inversion
- [ ] 是否依賴抽象而非具體？
- [ ] 依賴是否可注入？
```
