# 重構技術目錄

基於 Martin Fowler《Refactoring》第二版，共 70+ 技術。

## 1. 基礎重構 (Basic)

### Extract Function
將程式碼片段提取成獨立函數。

**Before:**
```python
def print_owing(invoice):
    # print banner
    print("*" * 20)
    print("Customer Owes")
    print("*" * 20)

    # calculate outstanding
    outstanding = sum(o.amount for o in invoice.orders)

    # print details
    print(f"name: {invoice.customer}")
    print(f"amount: {outstanding}")
```

**After:**
```python
def print_owing(invoice):
    print_banner()
    outstanding = calculate_outstanding(invoice)
    print_details(invoice, outstanding)

def print_banner():
    print("*" * 20)
    print("Customer Owes")
    print("*" * 20)

def calculate_outstanding(invoice):
    return sum(o.amount for o in invoice.orders)

def print_details(invoice, outstanding):
    print(f"name: {invoice.customer}")
    print(f"amount: {outstanding}")
```

### Inline Function
將函數內容直接放到調用處（Extract Function 的反向）。

**使用時機:** 函數內容和名稱一樣清晰。

### Extract Variable
將表達式提取成有意義的變數。

**Before:**
```python
return order.quantity * order.item_price - \
       max(0, order.quantity - 500) * order.item_price * 0.05 + \
       min(order.quantity * order.item_price * 0.1, 100)
```

**After:**
```python
base_price = order.quantity * order.item_price
quantity_discount = max(0, order.quantity - 500) * order.item_price * 0.05
shipping = min(base_price * 0.1, 100)
return base_price - quantity_discount + shipping
```

### Inline Variable
將變數替換為表達式（Extract Variable 的反向）。

### Change Function Declaration
重新命名函數或修改參數列表。

### Encapsulate Variable
將變數存取封裝在函數中。

**Before:**
```python
default_owner = {"first_name": "Martin", "last_name": "Fowler"}
```

**After:**
```python
_default_owner = {"first_name": "Martin", "last_name": "Fowler"}

def get_default_owner():
    return _default_owner.copy()

def set_default_owner(owner):
    global _default_owner
    _default_owner = owner
```

### Rename Variable
給變數更好的名稱。

### Introduce Parameter Object
將相關參數群組成物件。

**Before:**
```python
def amount_invoiced(start_date, end_date): ...
def amount_received(start_date, end_date): ...
def amount_overdue(start_date, end_date): ...
```

**After:**
```python
class DateRange:
    def __init__(self, start, end):
        self.start = start
        self.end = end

def amount_invoiced(date_range): ...
def amount_received(date_range): ...
def amount_overdue(date_range): ...
```

### Combine Functions into Class
將相關函數組合成類別。

### Combine Functions into Transform
將相關轉換函數組合成單一轉換。

### Split Phase
將處理不同事物的程式碼分成獨立階段。

---

## 2. 封裝 (Encapsulation)

### Encapsulate Record
將 dict/tuple 轉換為類別。

**Before:**
```python
organization = {"name": "Acme", "country": "US"}
```

**After:**
```python
class Organization:
    def __init__(self, data):
        self._name = data["name"]
        self._country = data["country"]

    @property
    def name(self):
        return self._name

    @property
    def country(self):
        return self._country
```

### Encapsulate Collection
封裝集合的存取，避免直接暴露。

### Replace Primitive with Object
將基本型別替換為有意義的類別。

**Before:**
```python
order.priority = "high"  # 字串
```

**After:**
```python
class Priority:
    def __init__(self, value):
        if value not in ["low", "normal", "high", "rush"]:
            raise ValueError(f"Invalid priority: {value}")
        self._value = value

    def higher_than(self, other):
        priorities = ["low", "normal", "high", "rush"]
        return priorities.index(self._value) > priorities.index(other._value)

order.priority = Priority("high")
```

### Replace Temp with Query
將臨時變數替換為方法調用。

### Extract Class
從一個類別中提取部分職責到新類別。

### Inline Class
將一個類別合併到另一個類別（Extract Class 反向）。

### Hide Delegate
隱藏委託關係。

**Before:**
```python
manager = person.department.manager
```

**After:**
```python
# Person 類別
def get_manager(self):
    return self.department.manager

manager = person.get_manager()
```

### Remove Middle Man
移除不必要的中介（Hide Delegate 反向）。

### Substitute Algorithm
替換整個演算法。

---

## 3. 移動功能 (Moving Features)

### Move Function
將函數移動到更適合的類別/模組。

### Move Field
將欄位移動到更適合的類別。

### Move Statements into Function
將重複的語句移入函數。

### Move Statements to Callers
將語句從函數移出到調用處。

### Replace Inline Code with Function Call
將內聯程式碼替換為函數調用。

### Slide Statements
將相關語句移動到一起。

### Split Loop
將做多件事的迴圈拆分。

**Before:**
```python
total_salary = 0
youngest_age = float('inf')
for p in people:
    total_salary += p.salary
    if p.age < youngest_age:
        youngest_age = p.age
```

**After:**
```python
total_salary = sum(p.salary for p in people)
youngest_age = min(p.age for p in people)
```

### Replace Loop with Pipeline
用函數式操作替換迴圈。

**Before:**
```python
result = []
for p in people:
    if p.job == "engineer":
        result.append(p.name)
```

**After:**
```python
result = [p.name for p in people if p.job == "engineer"]
```

### Remove Dead Code
移除未使用的程式碼。

---

## 4. 組織資料 (Organizing Data)

### Split Variable
將一個變數拆成多個（各有單一用途）。

### Rename Field
給欄位更好的名稱。

### Replace Derived Variable with Query
用計算替換衍生變數。

### Change Reference to Value
將引用轉換為值物件。

### Change Value to Reference
將值物件轉換為引用。

---

## 5. 簡化條件 (Simplifying Conditional Logic)

### Decompose Conditional
分解複雜條件。

**Before:**
```python
if date.before(SUMMER_START) or date.after(SUMMER_END):
    charge = quantity * winter_rate + winter_service_charge
else:
    charge = quantity * summer_rate
```

**After:**
```python
if is_summer(date):
    charge = summer_charge(quantity)
else:
    charge = winter_charge(quantity)

def is_summer(date):
    return not (date.before(SUMMER_START) or date.after(SUMMER_END))

def summer_charge(quantity):
    return quantity * summer_rate

def winter_charge(quantity):
    return quantity * winter_rate + winter_service_charge
```

### Consolidate Conditional Expression
合併條件表達式。

**Before:**
```python
def disability_amount(employee):
    if employee.seniority < 2:
        return 0
    if employee.months_disabled > 12:
        return 0
    if employee.is_part_time:
        return 0
    # compute disability amount
```

**After:**
```python
def disability_amount(employee):
    if is_not_eligible_for_disability(employee):
        return 0
    # compute disability amount

def is_not_eligible_for_disability(employee):
    return (employee.seniority < 2 or
            employee.months_disabled > 12 or
            employee.is_part_time)
```

### Replace Nested Conditional with Guard Clauses
用衛語句替換巢狀條件。

**Before:**
```python
def get_payment_amount(employee):
    if employee.is_separated:
        result = separated_amount()
    else:
        if employee.is_retired:
            result = retired_amount()
        else:
            result = normal_pay_amount()
    return result
```

**After:**
```python
def get_payment_amount(employee):
    if employee.is_separated:
        return separated_amount()
    if employee.is_retired:
        return retired_amount()
    return normal_pay_amount()
```

### Replace Conditional with Polymorphism
用多型替換條件。

**Before:**
```python
def get_speed(bird):
    if bird.type == "european":
        return get_base_speed()
    elif bird.type == "african":
        return get_base_speed() - get_load_factor() * bird.number_of_coconuts
    elif bird.type == "norwegian_blue":
        return 0 if bird.is_nailed else get_base_speed(bird.voltage)
```

**After:**
```python
class Bird:
    def get_speed(self):
        raise NotImplementedError

class EuropeanSwallow(Bird):
    def get_speed(self):
        return get_base_speed()

class AfricanSwallow(Bird):
    def get_speed(self):
        return get_base_speed() - get_load_factor() * self.number_of_coconuts

class NorwegianBlueParrot(Bird):
    def get_speed(self):
        return 0 if self.is_nailed else get_base_speed(self.voltage)
```

### Introduce Special Case
引入特殊情況類別（如 Null Object）。

### Introduce Assertion
加入斷言表達假設。

---

## 6. 重構 API (Refactoring APIs)

### Separate Query from Modifier
將查詢與修改分開。

**Before:**
```python
def get_total_and_send_bill():
    total = calculate_total()
    send_bill(total)
    return total
```

**After:**
```python
def get_total():
    return calculate_total()

def send_bill():
    send_bill(get_total())
```

### Parameterize Function
將相似函數合併為帶參數的函數。

### Remove Flag Argument
移除布林旗標參數。

**Before:**
```python
def set_dimension(name, value, is_height):
    if is_height:
        self._height = value
    else:
        self._width = value
```

**After:**
```python
def set_height(value):
    self._height = value

def set_width(value):
    self._width = value
```

### Preserve Whole Object
傳遞整個物件而非多個屬性。

### Replace Parameter with Query
用方法查詢替換參數。

### Replace Query with Parameter
用參數替換方法查詢（反向）。

### Remove Setting Method
移除不需要的 setter。

### Replace Constructor with Factory Function
用工廠函數替換建構子。

### Replace Function with Command
將函數轉換為命令物件。

### Replace Command with Function
將命令物件轉換回函數（反向）。

---

## 7. 處理繼承 (Dealing with Inheritance)

### Pull Up Method
將子類別方法上移到父類別。

### Pull Up Field
將子類別欄位上移到父類別。

### Pull Up Constructor Body
將子類別建構子共同部分上移。

### Push Down Method
將父類別方法下移到子類別。

### Push Down Field
將父類別欄位下移到子類別。

### Replace Type Code with Subclasses
用子類別替換型別代碼。

### Remove Subclass
移除不需要的子類別。

### Extract Superclass
提取共同功能到父類別。

### Collapse Hierarchy
合併不需要的層級。

### Replace Subclass with Delegate
用委託替換子類別。

### Replace Superclass with Delegate
用委託替換父類別。

---

## 快速查詢表

| 問題 | 推薦重構 |
|------|----------|
| 方法太長 | Extract Function |
| 類別太大 | Extract Class |
| 參數太多 | Introduce Parameter Object |
| 重複程式碼 | Extract Function, Pull Up Method |
| 複雜條件 | Decompose Conditional, Replace with Polymorphism |
| 巢狀條件 | Replace Nested Conditional with Guard Clauses |
| 魔術數字 | Replace Primitive with Object |
| 資料群組 | Introduce Parameter Object, Extract Class |
| Feature Envy | Move Function |
| 中介人 | Remove Middle Man |
