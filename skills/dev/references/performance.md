# 效能優化完整指南

## 前端效能

### React 優化

#### 避免不必要的重新渲染

```tsx
// ❌ 每次渲染都建立新物件
function Parent() {
  return <Child style={{ color: 'red' }} />;
  // style 每次都是新物件，Child 總是重新渲染
}

// ✅ 使用 useMemo
function Parent() {
  const style = useMemo(() => ({ color: 'red' }), []);
  return <Child style={style} />;
}

// ✅ 或提取為常數
const style = { color: 'red' };
function Parent() {
  return <Child style={style} />;
}
```

#### useCallback 正確使用

```tsx
// ❌ 不必要的 useCallback
function Form() {
  // 如果 Form 不會頻繁重新渲染，這是多餘的
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    submit();
  }, []);
}

// ✅ 傳給 memoized 子元件時需要
const MemoizedChild = React.memo(Child);

function Parent() {
  // 必須用 useCallback，否則 MemoizedChild 的 memo 無效
  const handleClick = useCallback(() => {
    doSomething();
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}
```

#### React.memo 正確使用

```tsx
// ✅ 適合使用 memo 的情況
// - 純展示元件
// - 接收原始值 props
// - 父元件頻繁更新但 props 不變
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  return items.map(item => <ExpensiveItem key={item.id} {...item} />);
});

// ❌ 不需要 memo 的情況
// - 元件本身很簡單
// - props 經常變化
// - 只有很少的子元件
```

#### 虛擬化長列表

```tsx
import { FixedSizeList } from 'react-window';

// ❌ 渲染所有項目
function List({ items }) {
  return items.map(item => <Item key={item.id} {...item} />);
  // 1000 個項目 = 1000 個 DOM 節點
}

// ✅ 只渲染可見項目
function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Item {...items[index]} />
        </div>
      )}
    </FixedSizeList>
  );
  // 只渲染約 12 個可見項目
}
```

### 程式碼分割

```tsx
// ❌ 同步載入所有元件
import HeavyChart from './HeavyChart';
import HeavyTable from './HeavyTable';

// ✅ 延遲載入
const HeavyChart = lazy(() => import('./HeavyChart'));
const HeavyTable = lazy(() => import('./HeavyTable'));

function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyChart />
      <HeavyTable />
    </Suspense>
  );
}
```

### 圖片優化

```tsx
// ❌ 直接使用大圖
<img src="/photos/large-photo.jpg" />

// ✅ 使用 Next.js Image
import Image from 'next/image';

<Image
  src="/photos/photo.jpg"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL={blurHash}
  loading="lazy"
/>

// ✅ 響應式圖片
<Image
  src="/photos/photo.jpg"
  sizes="(max-width: 768px) 100vw, 50vw"
  fill
/>
```

---

## 後端效能

### N+1 查詢問題

```typescript
// ❌ N+1 問題
async function getOrdersWithItems() {
  const orders = await db.order.findMany();

  for (const order of orders) {
    order.items = await db.orderItem.findMany({
      where: { orderId: order.id }
    });
  }
  // 1 次查詢 orders + N 次查詢 items = N+1 次查詢
}

// ✅ 使用 include（Prisma）
async function getOrdersWithItems() {
  return db.order.findMany({
    include: { items: true }
  });
  // 1 次查詢搞定
}

// ✅ 手動批次查詢
async function getOrdersWithItems() {
  const orders = await db.order.findMany();
  const orderIds = orders.map(o => o.id);

  const items = await db.orderItem.findMany({
    where: { orderId: { in: orderIds } }
  });

  const itemsByOrder = groupBy(items, 'orderId');

  return orders.map(order => ({
    ...order,
    items: itemsByOrder[order.id] || []
  }));
  // 2 次查詢
}
```

### 資料庫索引

```sql
-- 經常查詢的欄位要建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 複合索引（查詢順序要匹配）
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 使用 EXPLAIN 分析查詢
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
```

### 快取策略

```typescript
import Redis from 'ioredis';

const redis = new Redis();

// 簡單快取
async function getUser(id: string) {
  const cacheKey = `user:${id}`;

  // 先查快取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 查資料庫
  const user = await db.user.findUnique({ where: { id } });

  // 存入快取（1 小時過期）
  await redis.setex(cacheKey, 3600, JSON.stringify(user));

  return user;
}

// 快取失效
async function updateUser(id: string, data: Partial<User>) {
  const user = await db.user.update({ where: { id }, data });

  // 刪除快取
  await redis.del(`user:${id}`);

  return user;
}
```

### 分頁查詢

```typescript
// ❌ 載入所有資料
async function getAllUsers() {
  return db.user.findMany();
  // 百萬用戶會 OOM
}

// ✅ Offset 分頁（適合小資料集）
async function getUsers(page: number, pageSize: number = 20) {
  return db.user.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' }
  });
}

// ✅ Cursor 分頁（適合大資料集）
async function getUsers(cursor?: string, limit: number = 20) {
  return db.user.findMany({
    take: limit + 1, // 多取一個判斷是否有下一頁
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'asc' }
  });
}
```

---

## 通用優化

### 防抖與節流

```typescript
// 防抖：最後一次呼叫後延遲執行
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// 使用：搜尋輸入
const handleSearch = debounce((query: string) => {
  api.search(query);
}, 300);

// 節流：固定時間間隔執行一次
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn(...args);
      lastTime = now;
    }
  };
}

// 使用：滾動事件
const handleScroll = throttle(() => {
  checkScrollPosition();
}, 100);
```

### 並行處理

```typescript
// ❌ 串行處理
async function processItems(items) {
  for (const item of items) {
    await processItem(item);
  }
}

// ✅ 並行處理
async function processItems(items) {
  await Promise.all(items.map(item => processItem(item)));
}

// ✅ 控制並發數量
import pLimit from 'p-limit';

async function processItems(items) {
  const limit = pLimit(5); // 最多 5 個並行
  await Promise.all(
    items.map(item => limit(() => processItem(item)))
  );
}
```

### 避免阻塞

```typescript
// ❌ 阻塞主線程的大迴圈
function processLargeArray(items) {
  for (const item of items) {
    heavyComputation(item);
  }
}

// ✅ 分批處理，讓出控制權
async function processLargeArray(items, batchSize = 100) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    for (const item of batch) {
      heavyComputation(item);
    }

    // 讓出控制權
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// ✅ 使用 Web Worker（瀏覽器）
const worker = new Worker('./heavy-worker.js');
worker.postMessage({ items });
worker.onmessage = (e) => console.log('Done:', e.data);
```

---

## 效能監控

### 前端指標

```typescript
// Core Web Vitals
// LCP (Largest Contentful Paint) < 2.5s
// FID (First Input Delay) < 100ms
// CLS (Cumulative Layout Shift) < 0.1

// 使用 web-vitals 套件
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

### 後端指標

```typescript
// 請求處理時間
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    });

    // 警告慢請求
    if (duration > 1000) {
      logger.warn('Slow request', { path: req.path, duration });
    }
  });

  next();
});
```

---

## 效能檢查清單

### 前端
- [ ] 使用 React.memo / useMemo / useCallback 適當優化
- [ ] 長列表使用虛擬化
- [ ] 圖片使用 lazy loading
- [ ] 程式碼分割大型元件
- [ ] 使用 CDN

### 後端
- [ ] 消除 N+1 查詢
- [ ] 建立必要的資料庫索引
- [ ] 實作快取策略
- [ ] 使用分頁查詢
- [ ] 並行處理獨立任務

### 通用
- [ ] 使用防抖/節流控制頻繁操作
- [ ] 監控效能指標
- [ ] 設定效能預算
