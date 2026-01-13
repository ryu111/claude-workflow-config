# 重構到設計模式

基於 Joshua Kerievsky《Refactoring to Patterns》，將程式碼重構到適當的設計模式。

## 核心理念

> 不要一開始就使用設計模式，而是透過重構**演化**到設計模式。

```
簡單程式碼
    ↓
識別 Code Smell
    ↓
選擇適當重構
    ↓
重構可能導向設計模式
    ↓
但只在需要時才引入模式
```

---

## Creation（創建型）

### Replace Constructor with Factory Method

**Code Smell:** 建構子邏輯複雜或需要根據條件建立不同類型。

**Before:**
```python
class Loan:
    def __init__(self, notional, outstanding, customer, rate, expiry, maturity, risk_rating):
        # 複雜的初始化邏輯
        if expiry and maturity:
            self.type = "TERM"
        elif expiry:
            self.type = "REVOLVER"
        else:
            self.type = "COMMITTED"
        # ...
```

**After:**
```python
class Loan:
    @classmethod
    def create_term_loan(cls, notional, outstanding, customer, rate, expiry, maturity):
        loan = cls()
        loan.type = "TERM"
        # ...
        return loan

    @classmethod
    def create_revolver(cls, notional, outstanding, customer, rate, expiry):
        loan = cls()
        loan.type = "REVOLVER"
        # ...
        return loan
```

### Move Creation to Factory

**Code Smell:** 客戶端程式碼決定要建立哪個子類別。

**步驟:**
1. 建立工廠類別
2. 將建立邏輯移到工廠
3. 客戶端使用工廠

### Encapsulate Classes with Factory

**Code Smell:** 客戶端直接依賴具體類別。

**Before:**
```python
# 客戶端
descriptors = [
    AttributeDescriptor("name"),
    ReferenceDescriptor("parent"),
]
```

**After:**
```python
# 工廠
class DescriptorFactory:
    @staticmethod
    def create_attribute(name):
        return AttributeDescriptor(name)

    @staticmethod
    def create_reference(name):
        return ReferenceDescriptor(name)

# 客戶端
descriptors = [
    DescriptorFactory.create_attribute("name"),
    DescriptorFactory.create_reference("parent"),
]
```

---

## Simplification（簡化型）

### Replace Conditional with Strategy

**Code Smell:** 複雜的條件邏輯決定演算法。

**Before:**
```python
class Loan:
    def capital(self):
        if self.expiry is None and self.maturity is not None:
            return self._term_loan_capital()
        if self.expiry is not None and self.maturity is None:
            if self.commitment_percentage is not None:
                return self._revolver_capital_with_commitment()
            return self._revolver_capital()
        return self._committed_capital()
```

**After:**
```python
class Loan:
    def __init__(self, capital_strategy):
        self.capital_strategy = capital_strategy

    def capital(self):
        return self.capital_strategy.calculate(self)

class TermLoanCapital:
    def calculate(self, loan):
        return loan.commitment * loan.duration * loan.risk_factor

class RevolverCapital:
    def calculate(self, loan):
        return loan.commitment * loan.risk_factor
```

### Replace State-Altering with State

**Code Smell:** 方法行為根據物件狀態而大幅改變。

**Before:**
```python
class Permission:
    def __init__(self):
        self.state = "REQUESTED"

    def claimed_by(self, user):
        if self.state == "REQUESTED":
            self.state = "CLAIMED"
            self.claimed_by = user
        elif self.state == "CLAIMED":
            if self.claimed_by == user:
                pass  # 已經是這個人的
            else:
                raise PermissionError("Already claimed")
        # 更多狀態...
```

**After:**
```python
class Permission:
    def __init__(self):
        self.state = PermissionRequested()

    def claimed_by(self, user):
        self.state = self.state.claimed_by(self, user)

class PermissionRequested:
    def claimed_by(self, permission, user):
        permission.claimed_by = user
        return PermissionClaimed()

class PermissionClaimed:
    def claimed_by(self, permission, user):
        if permission.claimed_by == user:
            return self
        raise PermissionError("Already claimed")
```

### Replace Conditional Dispatcher with Command

**Code Smell:** 用條件來分派到不同動作。

**Before:**
```python
def execute(action, data):
    if action == "create":
        return create_record(data)
    elif action == "update":
        return update_record(data)
    elif action == "delete":
        return delete_record(data)
```

**After:**
```python
class Command:
    def execute(self, data):
        raise NotImplementedError

class CreateCommand(Command):
    def execute(self, data):
        return create_record(data)

class UpdateCommand(Command):
    def execute(self, data):
        return update_record(data)

commands = {
    "create": CreateCommand(),
    "update": UpdateCommand(),
    "delete": DeleteCommand(),
}

def execute(action, data):
    return commands[action].execute(data)
```

---

## Generalization（泛化型）

### Form Template Method

**Code Smell:** 子類別有相似的演算法，只有部分步驟不同。

**Before:**
```python
class CapitalStrategy:
    pass

class TermLoanCapital(CapitalStrategy):
    def calculate(self, loan):
        return loan.commitment * loan.unused_percentage * self.duration(loan) * self.risk_factor(loan)

    def duration(self, loan):
        # Term loan 特定計算
        return years_between(loan.start, loan.maturity)

    def risk_factor(self, loan):
        return RiskFactors.get_factor(loan.risk_rating)

class RevolverCapital(CapitalStrategy):
    def calculate(self, loan):
        return loan.commitment * loan.unused_percentage * self.duration(loan) * self.risk_factor(loan)

    def duration(self, loan):
        # Revolver 特定計算
        return years_between(loan.start, loan.expiry)

    def risk_factor(self, loan):
        return RiskFactors.get_factor(loan.risk_rating)
```

**After:**
```python
class CapitalStrategy:
    def calculate(self, loan):
        # Template Method
        return loan.commitment * loan.unused_percentage * self.duration(loan) * self.risk_factor(loan)

    def duration(self, loan):
        raise NotImplementedError  # 抽象方法

    def risk_factor(self, loan):
        return RiskFactors.get_factor(loan.risk_rating)  # 共同實作

class TermLoanCapital(CapitalStrategy):
    def duration(self, loan):
        return years_between(loan.start, loan.maturity)

class RevolverCapital(CapitalStrategy):
    def duration(self, loan):
        return years_between(loan.start, loan.expiry)
```

### Extract Composite

**Code Smell:** 處理單一物件和集合物件的邏輯重複。

**After:**
```python
class Component:
    def operation(self):
        raise NotImplementedError

class Leaf(Component):
    def operation(self):
        return self.value

class Composite(Component):
    def __init__(self):
        self.children = []

    def add(self, component):
        self.children.append(component)

    def operation(self):
        return sum(child.operation() for child in self.children)
```

### Replace One/Many with Composite

**Code Smell:** 單一物件和集合物件需要不同處理。

**Before:**
```python
def process_spec(spec):
    if isinstance(spec, list):
        return all(s.is_satisfied_by(product) for s in spec)
    return spec.is_satisfied_by(product)
```

**After:**
```python
class Spec:
    def is_satisfied_by(self, product):
        raise NotImplementedError

class CompositeSpec(Spec):
    def __init__(self, specs):
        self.specs = specs

    def is_satisfied_by(self, product):
        return all(s.is_satisfied_by(product) for s in self.specs)

# 使用時永遠用同樣方式
spec.is_satisfied_by(product)
```

---

## Protection（保護型）

### Replace Hard-Coded with Null Object

**Code Smell:** 到處都在檢查 null。

**Before:**
```python
def get_plan(customer):
    if customer is None:
        return BasicPlan()
    return customer.plan

def get_payment(customer):
    if customer is None:
        return 0
    return customer.payment
```

**After:**
```python
class NullCustomer:
    def __init__(self):
        self.plan = BasicPlan()
        self.payment = 0

# 不再需要 null 檢查
def get_plan(customer):
    return customer.plan

def get_payment(customer):
    return customer.payment
```

### Introduce Null Object

**Code Smell:** 多處檢查物件是否為 null。

**步驟:**
1. 建立 Null Object 類別
2. 實作預設行為
3. 返回 Null Object 而非 None
4. 移除 null 檢查

---

## Accumulation（累積型）

### Move Accumulation to Visitor

**Code Smell:** 對集合做累積操作，邏輯散落各處。

**Before:**
```python
def total_price(nodes):
    total = 0
    for node in nodes:
        if isinstance(node, ProductNode):
            total += node.price
        elif isinstance(node, DiscountNode):
            total -= node.discount
    return total
```

**After:**
```python
class PriceVisitor:
    def __init__(self):
        self.total = 0

    def visit_product(self, node):
        self.total += node.price

    def visit_discount(self, node):
        self.total -= node.discount

def total_price(nodes):
    visitor = PriceVisitor()
    for node in nodes:
        node.accept(visitor)
    return visitor.total
```

---

## 選擇指南

| Code Smell | 考慮的模式 |
|------------|-----------|
| 複雜建構邏輯 | Factory Method |
| 演算法選擇 | Strategy |
| 狀態轉換 | State |
| 動作分派 | Command |
| 相似演算法 | Template Method |
| 樹狀結構 | Composite |
| Null 檢查 | Null Object |
| 集合遍歷累積 | Visitor |

---

## 重要提醒

### 何時使用模式

✅ **使用模式：**
- 程式碼已經演化出需要模式的結構
- 有明確的變化點
- 模式讓程式碼更簡單

❌ **不使用模式：**
- 只是為了「用設計模式」
- 程式碼沒有那麼複雜
- 增加不必要的抽象

### 重構到模式 vs 直接用模式

```
錯誤方式：
需求 → 「我應該用什麼模式？」→ 套用模式 → 過度設計

正確方式：
需求 → 簡單實作 → 發現 Smell → 重構 → 自然演化出模式
```
