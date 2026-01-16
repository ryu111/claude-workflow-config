---
name: dev
description: 開發專業知識。Clean Code、設計模式、安全實踐、效能優化。適用於撰寫生產級程式碼。
---

# 開發專業知識

確保程式碼品質達到生產標準。

## 命名規範

### 變數命名

| 類型 | 規則 | 範例 |
|------|------|------|
| Boolean | is/has/can 開頭 | `isLoading`, `hasError`, `canEdit` |
| 陣列 | 複數形式 | `users`, `items`, `orderIds` |
| 計數 | count/num 結尾 | `userCount`, `itemNum` |
| 處理函數 | handle/on 開頭 | `handleClick`, `onSubmit` |

### 函數命名

```typescript
// 動詞開頭，描述行為
getUserById(id)      // get + 名詞
validateEmail(email) // 動詞 + 名詞
isValidUser(user)    // is + 形容詞（回傳 boolean）
```

### 常見反模式

```typescript
// 不好的命名
const data = fetch('/users');     // 太模糊
const temp = calculate();         // 無意義
const flag = user.age > 18;       // 不描述意義

// 好的命名
const users = fetch('/users');    // 說明是什麼
const totalPrice = calculate();   // 說明結果
const isAdult = user.age >= 18;   // 說明含義
```

For complete naming conventions → read `references/clean-code.md`

---

## 設計模式速查

### Creational（建立型）

| 模式 | 使用時機 | 範例 |
|------|----------|------|
| **Factory** | 建立不同類型物件 | 建立不同支付方式 |
| **Builder** | 複雜物件逐步建立 | 組建 SQL 查詢 |
| **Singleton** | 全域唯一實例 | Logger, Config |

### Structural（結構型）

| 模式 | 使用時機 | 範例 |
|------|----------|------|
| **Adapter** | 轉換介面 | 整合第三方 API |
| **Decorator** | 動態添加功能 | 加入 logging, caching |
| **Facade** | 簡化複雜系統 | 統一 API 入口 |

### Behavioral（行為型）

| 模式 | 使用時機 | 範例 |
|------|----------|------|
| **Observer** | 事件通知 | 訂閱/發布 |
| **Strategy** | 可替換算法 | 不同排序方式 |
| **Command** | 封裝請求 | Undo/Redo |

For complete patterns → read `references/patterns.md`

---

## 安全實踐

### SQL Injection 防護

```typescript
// 危險：字串拼接
db.query(`SELECT * FROM users WHERE id = ${id}`);

// 安全：參數化查詢
db.query('SELECT * FROM users WHERE id = ?', [id]);
```

### XSS 防護

```typescript
// 危險：直接插入 HTML
element.innerHTML = userInput;

// 安全：使用 textContent 或轉義
element.textContent = userInput;
// 或使用 DOMPurify
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 敏感資料處理

```typescript
// 絕對不要
const API_KEY = 'sk-1234567890';  // 硬編碼密鑰

// 正確做法
const API_KEY = process.env.API_KEY;
```

For complete security practices → read `references/security.md`

---

## 效能優化

### 避免不必要的重新渲染

```typescript
// React 範例
// 不好：每次都建立新 object
<Component style={{ color: 'red' }} />

// 好：使用 useMemo 或提取常數
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

### 避免 N+1 查詢

```typescript
// 不好：N+1 查詢
const users = await getUsers();
for (const user of users) {
  user.orders = await getOrders(user.id); // N 次查詢
}

// 好：批次查詢
const users = await getUsers();
const orders = await getOrdersByUserIds(users.map(u => u.id));
const ordersByUser = groupBy(orders, 'userId');
users.forEach(u => u.orders = ordersByUser[u.id] || []);
```

### 延遲載入

```typescript
// 動態 import
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 使用時
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

For complete optimization → read `references/performance.md`

---

## 🚫 禁止硬編碼（核心規則）

**硬編碼 = 隱藏的 bug 來源，必須使用語言特性定義常數。**

### 為什麼禁止

| 問題 | 後果 |
|------|------|
| Typo 無法被捕捉 | `"stauts"` vs `"status"` → runtime error |
| 無法重構 | 改名時到處漏改 |
| 無自動完成 | 每次都要查文件 |
| 無型別檢查 | 傳錯值沒有警告 |

### Python 範例

```python
# ❌ 硬編碼
def process(status: str):
    if status == "pending":    # typo 風險
        ...
    elif status == "completed":
        ...

result = {"status": "pending", "code": 200}  # 結構不明確

# ✅ 使用 Enum + TypedDict
from enum import Enum
from typing import TypedDict

class Status(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Result(TypedDict):
    status: Status
    code: int

def process(status: Status):  # IDE 自動完成
    if status == Status.PENDING:  # typo 會報錯
        ...

result: Result = {"status": Status.PENDING, "code": 200}
```

### TypeScript 範例

```typescript
// ❌ 硬編碼
function process(status: string) {
    if (status === "pending") { ... }
}

const result = { status: "pending", code: 200 };

// ✅ 使用 enum + interface
enum Status {
    Pending = "pending",
    Completed = "completed",
    Failed = "failed"
}

interface Result {
    status: Status;
    code: number;
}

function process(status: Status) {
    if (status === Status.Pending) { ... }
}

const result: Result = { status: Status.Pending, code: 200 };
```

### Magic Number 規則

```python
# ❌ Magic Number
if retries > 7:
    raise Error("Too many retries")

time.sleep(30)

# ✅ 命名常數
MAX_RETRIES = 7
RETRY_DELAY_SECONDS = 30

if retries > MAX_RETRIES:
    raise Error("Too many retries")

time.sleep(RETRY_DELAY_SECONDS)
```

### ⚠️ 防範重複定義

**禁止硬編碼 ≠ 到處建立新的 Enum/TypedDict**

```python
# ❌ 錯誤：每個檔案都定義自己的
# file1.py
class Status(Enum):
    PENDING = "pending"

# file2.py
class Status(Enum):  # 重複定義！
    PENDING = "pending"

# ✅ 正確：集中定義，全專案 import
# types/enums.py
class Status(Enum):
    PENDING = "pending"
    COMPLETED = "completed"

# file1.py, file2.py
from types.enums import Status
```

### 新增型別前的檢查

| 步驟 | 動作 |
|------|------|
| 1 | 搜尋 `types/` 或 `constants/` 是否已有類似定義 |
| 2 | 檢查現有定義能否擴展（加欄位/加值） |
| 3 | 若真的需要新型別，放在共用模組 |

### 檢查清單

- [ ] 所有狀態值使用 Enum
- [ ] 所有結構化資料使用 TypedDict/dataclass/interface
- [ ] 所有數字常數有命名
- [ ] 所有字串 key 有型別定義
- [ ] **新型別放在集中位置（types/），不重複定義**

---

## 資料契約（型別定義）

**跨模組資料傳遞必須使用明確型別定義，禁止裸 dict。**

### 為什麼需要

```python
# ❌ 問題：裸 dict 容易打錯 key、遺漏欄位
result = {
    'sharpe': 1.5,
    'strategy_name': 'ma_cross',  # 有時候忘記加
}
# 讀取時：result['stratgy_name']  # typo，沒有警告

# ✅ 解法：使用 dataclass 或 TypedDict
@dataclass
class OptimizationResult:
    sharpe: float
    strategy_name: str
    total_return: float
    # IDE 會提醒遺漏的欄位，typo 會報錯
```

### 規則

| 情境 | 要求 |
|------|------|
| 模組間資料傳遞 | **必須**使用 dataclass/TypedDict |
| 函數回傳值（複雜結構） | **必須**定義型別 |
| 臨時內部計算 | 可用 dict，但不傳出模組 |

### 專案結構建議

```
src/types/
├── __init__.py       # 匯出所有型別
├── results.py        # 回測/優化結果型別
├── configs.py        # 配置型別
└── strategies.py     # 策略相關型別
```

### 範例

```python
# src/types/results.py
from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class BacktestResult:
    sharpe_ratio: float
    total_return: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    params: Dict[str, Any]
    strategy_name: str
    symbol: str
    timeframe: str

@dataclass
class ValidationResult:
    grade: str  # A/B/C/D/F
    passed_stages: list[int]
    details: Optional[Dict[str, Any]] = None
```

---

## 程式碼範本

### API Handler (TypeScript)

```typescript
export async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // 1. 驗證輸入
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // 2. 業務邏輯
    const result = await service.process(id);

    // 3. 回傳結果
    return res.status(200).json({ data: result });
  } catch (error) {
    logger.error('Handler failed', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### React Component

```typescript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function MyComponent({ title, onSubmit, isLoading = false }: Props) {
  const [data, setData] = useState<FormData>(initialData);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  }, [data, onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      <h1>{title}</h1>
      {/* ... */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
}
```

For more templates → read `references/templates.md`

---

## 深度參考

| 主題 | 文件 |
|------|------|
| Clean Code 完整 | `references/clean-code.md` |
| 設計模式詳解 | `references/patterns.md` |
| 安全實踐 | `references/security.md` |
| 效能優化 | `references/performance.md` |
| 程式碼範本 | `references/templates.md` |
