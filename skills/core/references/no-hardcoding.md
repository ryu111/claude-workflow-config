# 禁止硬編碼指南

## 為什麼禁止硬編碼？

```
┌────────────────────────────────────────────────────────────┐
│  硬編碼 = 隱藏的 bug 來源                                   │
│                                                            │
│  問題：                                                     │
│  • Typo 無法被編譯器/IDE 捕捉                              │
│  • 重構時容易遺漏                                          │
│  • 無法獲得自動完成                                        │
└────────────────────────────────────────────────────────────┘
```

## 正確做法

| 語言 | 硬編碼 ❌ | 正確做法 ✅ |
|------|----------|------------|
| Python | `"pending"` | `Status.PENDING` (Enum) |
| Python | `{"status": ...}` | `StatusDict` (TypedDict) |
| TypeScript | `"success"` | `Status.Success` (enum) |
| TypeScript | `{status: string}` | `interface Result` |
| 任何語言 | `7` (magic number) | `MAX_RETRIES = 7` |

## Python 範例

### 字串常數

```python
# ❌ 硬編碼
if status == "pending":
    pass

# ✅ 使用 Enum
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

if status == Status.PENDING:
    pass
```

### 字典結構

```python
# ❌ 硬編碼
result = {"status": "success", "data": [...]}

# ✅ 使用 TypedDict
from typing import TypedDict

class ResultDict(TypedDict):
    status: str
    data: list

result: ResultDict = {"status": "success", "data": [...]}
```

## TypeScript 範例

### 字串常數

```typescript
// ❌ 硬編碼
if (status === "pending") { }

// ✅ 使用 enum
enum Status {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed"
}

if (status === Status.Pending) { }
```

### 物件結構

```typescript
// ❌ 硬編碼
const result = { status: "success", data: [] };

// ✅ 使用 interface
interface Result {
  status: string;
  data: any[];
}

const result: Result = { status: "success", data: [] };
```

## 防範重複定義

```
┌────────────────────────────────────────────────────────────┐
│  禁止硬編碼 ≠ 到處建立新的 Enum/TypedDict                  │
│                                                            │
│  ❌ 錯誤：每個檔案都定義自己的 Status enum                 │
│  ✅ 正確：集中定義在 types/，全專案 import 使用            │
└────────────────────────────────────────────────────────────┘
```

### 新增型別前必須檢查

1. `types/` 或 `constants/` 是否已有類似定義？
2. 現有定義能否擴展？
3. 是否應該放在共用模組？

### 目錄結構建議

```
src/
├── types/
│   ├── status.py       # Status enum
│   ├── result.py       # Result TypedDict
│   └── __init__.py     # 統一 export
├── constants/
│   ├── limits.py       # MAX_RETRIES = 7
│   └── __init__.py
└── ...
```

## Magic Numbers

### 常見 Magic Numbers

| 數值 | 應該定義為 |
|------|-----------|
| `7` | `MAX_RETRIES` |
| `3600` | `SECONDS_PER_HOUR` |
| `1024` | `BYTES_PER_KB` |
| `0.05` | `DEFAULT_FEE_RATE` |

### 範例

```python
# ❌ Magic number
for i in range(7):
    retry()

# ✅ 有意義的常數
MAX_RETRIES = 7

for i in range(MAX_RETRIES):
    retry()
```
