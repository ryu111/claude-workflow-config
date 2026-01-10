# 邊界測試方法完整指南

## 為什麼要測試邊界？

大多數 bug 發生在邊界值附近：
- 陣列的第一個和最後一個元素
- 迴圈的開始和結束
- 數值的最大和最小值
- 字串的空值和長度限制

---

## 等價類別劃分（Equivalence Partitioning）

將輸入範圍劃分成「等價類別」，每個類別中的任何值行為相同。

### 基本概念

```
年齡驗證：18-65 有效

無效區間 1    有效區間    無效區間 2
    <18       18-65         >65
 [-∞, 17]   [18, 65]     [66, +∞]
```

### 實作範例

```typescript
// 測試對象
function isValidAge(age: number): boolean {
  return age >= 18 && age <= 65;
}

describe('isValidAge - 等價類別劃分', () => {
  // 無效區間 1：< 18
  test('年齡 10 (無效區間 1 的代表值)', () => {
    expect(isValidAge(10)).toBe(false);
  });

  // 有效區間：18-65
  test('年齡 40 (有效區間的代表值)', () => {
    expect(isValidAge(40)).toBe(true);
  });

  // 無效區間 2：> 65
  test('年齡 80 (無效區間 2 的代表值)', () => {
    expect(isValidAge(80)).toBe(false);
  });
});
```

---

## 邊界值分析（Boundary Value Analysis）

測試邊界點和其相鄰值。

### 基本概念

```
年齡驗證：18-65 有效

測試點：17, 18, 65, 66
       ↓   ↓       ↓   ↓
      無效 有效    有效 無效
```

### 實作範例

```typescript
describe('isValidAge - 邊界值分析', () => {
  // 下邊界
  test('17 (剛好無效)', () => {
    expect(isValidAge(17)).toBe(false);
  });

  test('18 (剛好有效 - 最小值)', () => {
    expect(isValidAge(18)).toBe(true);
  });

  // 上邊界
  test('65 (剛好有效 - 最大值)', () => {
    expect(isValidAge(65)).toBe(true);
  });

  test('66 (剛好無效)', () => {
    expect(isValidAge(66)).toBe(false);
  });
});
```

---

## 特殊值測試

### 數值特殊值

```typescript
const numericEdgeCases = [
  0,           // 零
  -1,          // 負一
  -0,          // 負零
  1,           // 正一
  Number.MAX_SAFE_INTEGER,  // 最大安全整數
  Number.MIN_SAFE_INTEGER,  // 最小安全整數
  Number.MAX_VALUE,         // 最大值
  Number.MIN_VALUE,         // 最小正值
  Infinity,                 // 正無限
  -Infinity,                // 負無限
  NaN,                      // 非數字
];

describe('calculateTotal - 數值邊界', () => {
  test.each([
    [0, 0],
    [-1, 0],  // 負數視為 0
    [Infinity, Infinity],
  ])('calculateTotal(%d) = %d', (input, expected) => {
    expect(calculateTotal([{ price: input }])).toBe(expected);
  });

  test('處理 NaN', () => {
    expect(calculateTotal([{ price: NaN }])).toBeNaN();
    // 或
    expect(() => calculateTotal([{ price: NaN }])).toThrow();
  });
});
```

### 字串特殊值

```typescript
const stringEdgeCases = [
  '',           // 空字串
  ' ',          // 單個空白
  '   ',        // 多個空白
  '\t',         // Tab
  '\n',         // 換行
  '\r\n',       // Windows 換行
  'a',          // 單字元
  'a'.repeat(1000000),  // 超長字串
  '中文',       // Unicode
  '🎉',         // Emoji
  '<script>',   // HTML 標籤
  "O'Brien",    // 特殊字元
  'null',       // 字串 "null"
  'undefined',  // 字串 "undefined"
];

describe('validateEmail - 字串邊界', () => {
  test.each([
    ['', false],
    [' ', false],
    ['a@b.c', true],
    ['test@example.com', true],
    ['invalid', false],
    ['@example.com', false],
    ['test@', false],
  ])('validateEmail("%s") = %s', (input, expected) => {
    expect(validateEmail(input)).toBe(expected);
  });
});
```

### 陣列特殊值

```typescript
const arrayEdgeCases = [
  [],                      // 空陣列
  [1],                     // 單元素
  [1, 2],                  // 兩元素
  Array(1000).fill(0),     // 大量元素
  [null],                  // 含 null
  [undefined],             // 含 undefined
  [1, null, 2],            // 混合
  [[1], [2]],              // 巢狀陣列
];

describe('sum - 陣列邊界', () => {
  test('空陣列回傳 0', () => {
    expect(sum([])).toBe(0);
  });

  test('單元素陣列', () => {
    expect(sum([5])).toBe(5);
  });

  test('大量元素', () => {
    const largeArray = Array(10000).fill(1);
    expect(sum(largeArray)).toBe(10000);
  });

  test('處理 null 元素', () => {
    expect(() => sum([1, null, 2])).toThrow();
    // 或
    expect(sum([1, null, 2])).toBe(3); // 忽略 null
  });
});
```

### 物件特殊值

```typescript
const objectEdgeCases = [
  null,
  undefined,
  {},                      // 空物件
  { a: 1 },               // 單屬性
  { a: null },            // 屬性為 null
  { a: undefined },       // 屬性為 undefined
  { a: { b: 1 } },        // 巢狀物件
  Object.freeze({ a: 1 }),// 凍結物件
];

describe('getProperty - 物件邊界', () => {
  test('null 物件', () => {
    expect(() => getProperty(null, 'a')).toThrow();
  });

  test('undefined 物件', () => {
    expect(() => getProperty(undefined, 'a')).toThrow();
  });

  test('空物件', () => {
    expect(getProperty({}, 'a')).toBeUndefined();
  });

  test('屬性為 null', () => {
    expect(getProperty({ a: null }, 'a')).toBeNull();
  });
});
```

---

## 日期時間邊界

```typescript
const dateEdgeCases = [
  new Date('1970-01-01'),         // Unix 紀元
  new Date('1969-12-31'),         // 紀元前一天
  new Date('2000-01-01'),         // Y2K
  new Date('2038-01-19'),         // Unix 時間戳問題
  new Date('9999-12-31'),         // 遠未來
  new Date('2024-02-29'),         // 閏年
  new Date('2023-02-29'),         // 非閏年（無效日期）
  new Date('Invalid'),            // 無效日期
];

describe('formatDate - 日期邊界', () => {
  test('Unix 紀元', () => {
    expect(formatDate(new Date('1970-01-01'))).toBe('1970-01-01');
  });

  test('閏年 2 月 29 日', () => {
    expect(formatDate(new Date('2024-02-29'))).toBe('2024-02-29');
  });

  test('無效日期', () => {
    expect(() => formatDate(new Date('Invalid'))).toThrow();
  });

  // 時區邊界
  test('午夜', () => {
    expect(formatTime(new Date('2024-01-01T00:00:00'))).toBe('00:00');
  });

  test('午夜前一秒', () => {
    expect(formatTime(new Date('2024-01-01T23:59:59'))).toBe('23:59');
  });
});
```

---

## 分頁邊界

```typescript
describe('paginate - 分頁邊界', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 頁碼邊界
  test('第一頁', () => {
    expect(paginate(items, 1, 3)).toEqual([1, 2, 3]);
  });

  test('最後一頁', () => {
    expect(paginate(items, 4, 3)).toEqual([10]);
  });

  test('超出頁碼', () => {
    expect(paginate(items, 100, 3)).toEqual([]);
  });

  test('頁碼 0', () => {
    expect(() => paginate(items, 0, 3)).toThrow();
  });

  test('負數頁碼', () => {
    expect(() => paginate(items, -1, 3)).toThrow();
  });

  // 每頁數量邊界
  test('每頁 0 個', () => {
    expect(() => paginate(items, 1, 0)).toThrow();
  });

  test('每頁超過總數', () => {
    expect(paginate(items, 1, 100)).toEqual(items);
  });

  // 空陣列
  test('空陣列', () => {
    expect(paginate([], 1, 10)).toEqual([]);
  });
});
```

---

## 邊界測試檢查清單

### 數值
- [ ] 零值 (0)
- [ ] 負值 (-1)
- [ ] 最大值 / 最小值
- [ ] 邊界值 ± 1
- [ ] NaN, Infinity

### 字串
- [ ] 空字串
- [ ] 只有空白
- [ ] 單字元
- [ ] 超長字串
- [ ] 特殊字元
- [ ] Unicode / Emoji

### 陣列
- [ ] 空陣列
- [ ] 單元素
- [ ] 大量元素
- [ ] 含 null/undefined

### 物件
- [ ] null
- [ ] undefined
- [ ] 空物件
- [ ] 屬性為 null/undefined

### 日期
- [ ] 閏年
- [ ] 時區邊界
- [ ] 無效日期

### 業務邏輯
- [ ] 最小有效值
- [ ] 最大有效值
- [ ] 剛好無效的值
