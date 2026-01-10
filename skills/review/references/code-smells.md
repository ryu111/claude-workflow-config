# Code Smells 完整指南

## 什麼是 Code Smell？

Code Smell 是程式碼中的「壞味道」—— 表面上可能沒問題，但暗示著設計問題。它們不一定是 bug，但會讓程式碼難以維護和擴展。

---

## Bloaters（膨脹）

程式碼過度膨脹，難以處理。

### Long Method（過長函數）

**症狀**：函數超過 30 行

```typescript
// ❌ 過長函數
function processOrder(order: Order) {
  // 驗證訂單 (10 行)
  // 計算價格 (15 行)
  // 處理折扣 (10 行)
  // 扣減庫存 (10 行)
  // 建立發票 (15 行)
  // 發送通知 (10 行)
  // 總共 70+ 行
}

// ✅ 拆分成小函數
function processOrder(order: Order) {
  const validatedOrder = validateOrder(order);
  const pricedOrder = calculatePrice(validatedOrder);
  const discountedOrder = applyDiscounts(pricedOrder);

  updateInventory(discountedOrder);
  const invoice = createInvoice(discountedOrder);
  sendNotifications(discountedOrder);

  return invoice;
}
```

### Large Class（過大類別）

**症狀**：類別有太多職責

```typescript
// ❌ 上帝類別
class UserManager {
  createUser() { }
  updateUser() { }
  deleteUser() { }
  sendEmail() { }
  generateReport() { }
  processPayment() { }
  updateInventory() { }
}

// ✅ 拆分職責
class UserService {
  createUser() { }
  updateUser() { }
  deleteUser() { }
}

class EmailService { sendEmail() { } }
class ReportService { generateReport() { } }
class PaymentService { processPayment() { } }
```

### Long Parameter List（過長參數列）

**症狀**：函數參數超過 3 個

```typescript
// ❌ 太多參數
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) { }

// ✅ 使用物件參數
interface CreateUserInput {
  name: string;
  email: string;
  age: number;
  address?: string;
  phone?: string;
  role?: string;
}

function createUser(input: CreateUserInput) { }
```

### Primitive Obsession（原始型別迷戀）

**症狀**：過度使用原始型別代替小物件

```typescript
// ❌ 原始型別
function createOrder(
  customerId: string,
  amount: number,
  currency: string,
  country: string,
  city: string,
  zip: string
) { }

// ✅ 使用值物件
interface Money {
  amount: number;
  currency: Currency;
}

interface Address {
  country: string;
  city: string;
  zip: string;
}

function createOrder(
  customerId: CustomerId,
  total: Money,
  shippingAddress: Address
) { }
```

---

## Object-Orientation Abusers（物件導向濫用）

### Switch Statements

**症狀**：大量 switch/if-else 檢查型別

```typescript
// ❌ Switch 地獄
function calculateShipping(order: Order) {
  switch (order.type) {
    case 'standard':
      return order.weight * 5;
    case 'express':
      return order.weight * 10;
    case 'overnight':
      return order.weight * 20;
    // 每次新增類型都要改這裡
  }
}

// ✅ 多態替代
interface ShippingStrategy {
  calculate(weight: number): number;
}

class StandardShipping implements ShippingStrategy {
  calculate(weight: number) { return weight * 5; }
}

class ExpressShipping implements ShippingStrategy {
  calculate(weight: number) { return weight * 10; }
}

function calculateShipping(order: Order, strategy: ShippingStrategy) {
  return strategy.calculate(order.weight);
}
```

### Temporary Field（臨時欄位）

**症狀**：物件的欄位只在某些情況下使用

```typescript
// ❌ 臨時欄位
class Order {
  items: Item[];
  discount: number;      // 只在促銷時有值
  giftMessage: string;   // 只在禮物訂單時有值
  expressDelivery: boolean; // 只在快遞時有值
}

// ✅ 使用組合或子類別
class Order {
  items: Item[];
}

class PromotionalOrder extends Order {
  discount: number;
}

class GiftOrder extends Order {
  giftMessage: string;
}
```

---

## Change Preventers（變更阻礙）

讓修改變得困難的程式碼模式。

### Divergent Change（發散式變更）

**症狀**：一個類別因為多種原因被修改

```typescript
// ❌ 一個類別，多種變更原因
class Employee {
  calculatePay() { }    // 薪資規則變更
  saveToDatabase() { }  // 資料庫變更
  generateReport() { }  // 報表格式變更
}

// ✅ 分離關注點
class Employee { /* 純資料 */ }
class PayCalculator { calculatePay(employee: Employee) { } }
class EmployeeRepository { save(employee: Employee) { } }
class EmployeeReporter { generateReport(employee: Employee) { } }
```

### Shotgun Surgery（霰彈式修改）

**症狀**：一個修改需要改動多個類別

```typescript
// ❌ 分散的相關邏輯
class Order { validate() { if (amount > 10000) { } } }
class Invoice { validate() { if (amount > 10000) { } } }
class Payment { validate() { if (amount > 10000) { } } }
// 當限額改變，要改三個地方

// ✅ 集中邏輯
const LARGE_AMOUNT_THRESHOLD = 10000;

class AmountValidator {
  isLargeAmount(amount: number) {
    return amount > LARGE_AMOUNT_THRESHOLD;
  }
}
```

---

## Dispensables（可移除）

### Comments（過多註解）

**症狀**：需要大量註解解釋程式碼

```typescript
// ❌ 需要註解解釋
// 檢查用戶是否成年且有付費會員資格
if (u.a >= 18 && u.m === 'P') { }

// ✅ 自我解釋的程式碼
const isAdult = user.age >= LEGAL_AGE;
const isPremiumMember = user.membershipType === MembershipType.Premium;

if (isAdult && isPremiumMember) { }
```

### Duplicate Code（重複程式碼）

**症狀**：相同邏輯出現多處

```typescript
// ❌ 重複邏輯
class OrderController {
  create() {
    const tax = amount * 0.1;
    const total = amount + tax;
    // ...
  }
}

class InvoiceController {
  generate() {
    const tax = amount * 0.1;
    const total = amount + tax;
    // ...
  }
}

// ✅ 提取共用函數
function calculateTotalWithTax(amount: number, taxRate = 0.1): number {
  const tax = amount * taxRate;
  return amount + tax;
}
```

### Dead Code（死碼）

**症狀**：永不執行的程式碼

```typescript
// ❌ 死碼
function process(type: 'A' | 'B') {
  if (type === 'A') {
    return handleA();
  } else if (type === 'B') {
    return handleB();
  } else {
    // 永遠不會執行，因為 type 只能是 'A' | 'B'
    return handleC();
  }
}

// ✅ 移除死碼
function process(type: 'A' | 'B') {
  return type === 'A' ? handleA() : handleB();
}
```

### Lazy Class（懶惰類別）

**症狀**：類別做的事情太少，不值得存在

```typescript
// ❌ 懶惰類別
class EmailValidator {
  validate(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ✅ 直接用函數或合併
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 或合併到相關類別
class Validator {
  isValidEmail(email: string): boolean { }
  isValidPhone(phone: string): boolean { }
  isValidUrl(url: string): boolean { }
}
```

---

## Couplers（耦合）

### Feature Envy（特性依戀）

**症狀**：方法過度使用其他類別的資料

```typescript
// ❌ Feature Envy
class OrderPrinter {
  print(order: Order) {
    console.log(`Customer: ${order.customer.name}`);
    console.log(`Address: ${order.customer.address.street}`);
    console.log(`City: ${order.customer.address.city}`);
    console.log(`Items: ${order.items.length}`);
    console.log(`Total: ${order.items.reduce((s, i) => s + i.price, 0)}`);
  }
}

// ✅ 搬移方法到資料所在類別
class Order {
  getFormattedAddress(): string {
    return this.customer.getFormattedAddress();
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  print() {
    console.log(`Customer: ${this.customer.name}`);
    console.log(`Address: ${this.getFormattedAddress()}`);
    console.log(`Items: ${this.items.length}`);
    console.log(`Total: ${this.getTotal()}`);
  }
}
```

### Inappropriate Intimacy（不當親密）

**症狀**：類別過度存取另一個類別的私有細節

```typescript
// ❌ 不當親密
class Order {
  items: Item[];
}

class OrderProcessor {
  process(order: Order) {
    // 直接操作內部陣列
    for (const item of order.items) {
      item.status = 'processed';
    }
  }
}

// ✅ 透過公開介面
class Order {
  private items: Item[];

  processItems() {
    this.items.forEach(item => item.markAsProcessed());
  }
}

class OrderProcessor {
  process(order: Order) {
    order.processItems();
  }
}
```

### Message Chains（訊息鏈）

**症狀**：a.getB().getC().getD().doSomething()

```typescript
// ❌ 訊息鏈
const street = order.getCustomer().getAddress().getStreet();

// ✅ 使用委託方法
class Order {
  getShippingStreet(): string {
    return this.customer.getShippingStreet();
  }
}

class Customer {
  getShippingStreet(): string {
    return this.address.street;
  }
}

const street = order.getShippingStreet();
```

---

## Code Smell 檢測清單

| Smell | 徵兆 | 優先級 |
|-------|------|--------|
| Long Method | > 30 行 | 🔴 高 |
| Large Class | > 10 個方法或 > 200 行 | 🔴 高 |
| Duplicate Code | 相同邏輯 > 2 處 | 🔴 高 |
| Long Parameter List | > 3 個參數 | 🟡 中 |
| Feature Envy | 大量存取其他類別 | 🟡 中 |
| Dead Code | 永不執行 | 🟡 中 |
| Comments | 需要解釋 what | 🟢 低 |
| Magic Numbers | 裸數字 | 🟢 低 |
