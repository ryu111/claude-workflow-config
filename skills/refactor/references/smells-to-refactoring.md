# Code Smell → 重構技術映射

根據 Code Smell 類型選擇適當的重構技術。

## Bloaters（膨脹類）

程式碼變得過大難以處理。

### Long Method（過長方法）
**徵兆:** 方法超過 20 行，需要滾動才能看完。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Function** | 可以識別出獨立的程式碼片段 |
| Replace Temp with Query | 臨時變數阻礙提取 |
| Introduce Parameter Object | 參數太多 |
| Preserve Whole Object | 傳遞多個物件屬性 |
| Replace Function with Command | 需要更複雜的分解 |
| Decompose Conditional | 條件邏輯複雜 |

### Large Class（過大類別）
**徵兆:** 類別有太多欄位/方法，職責過多。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Class** | 部分功能可以獨立 |
| Extract Superclass | 兩個類別有共同功能 |
| Replace Type Code with Subclasses | 使用型別代碼區分行為 |

### Primitive Obsession（基本型別偏執）
**徵兆:** 過度使用 string, int 而非小型物件。

| 重構技術 | 使用時機 |
|----------|----------|
| **Replace Primitive with Object** | 資料有專屬行為 |
| Replace Type Code with Subclasses | 型別影響行為 |
| Replace Conditional with Polymorphism | 基於型別的條件 |
| Extract Class | 多個基本型別關聯 |
| Introduce Parameter Object | 參數群組重複 |

### Long Parameter List（過長參數列表）
**徵兆:** 方法有超過 3-4 個參數。

| 重構技術 | 使用時機 |
|----------|----------|
| **Introduce Parameter Object** | 參數群組重複出現 |
| Preserve Whole Object | 從物件取多個值 |
| Replace Parameter with Query | 可以從其他參數推導 |
| Remove Flag Argument | 有布林控制參數 |

### Data Clumps（資料群組）
**徵兆:** 相同的資料群組在多處出現。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Class** | 資料形成邏輯單位 |
| Introduce Parameter Object | 在參數中重複 |
| Preserve Whole Object | 作為物件屬性傳遞 |

---

## Object-Orientation Abusers（物件導向濫用）

物件導向原則應用不當。

### Switch Statements（Switch 語句）
**徵兆:** 基於型別的 switch/if-else 鏈。

| 重構技術 | 使用時機 |
|----------|----------|
| **Replace Conditional with Polymorphism** | 主要選擇 |
| Replace Type Code with Subclasses | 先建立子類別 |
| Replace Parameter with Query | 簡化參數 |
| Introduce Special Case | 處理特殊值 |

### Temporary Field（臨時欄位）
**徵兆:** 欄位只在特定情況下有值。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Class** | 提取欄位和相關方法 |
| Introduce Special Case | 處理 null 情況 |
| Replace Function with Command | 複雜算法 |

### Refused Bequest（拒絕繼承）
**徵兆:** 子類別只使用父類別部分功能。

| 重構技術 | 使用時機 |
|----------|----------|
| **Replace Superclass with Delegate** | 繼承不適當 |
| Replace Subclass with Delegate | 子類別不需要 |
| Push Down Method/Field | 只有部分子類別需要 |

### Alternative Classes with Different Interfaces（介面不同的替代類別）
**徵兆:** 兩個類別做相似的事但介面不同。

| 重構技術 | 使用時機 |
|----------|----------|
| **Change Function Declaration** | 統一方法簽名 |
| Move Function | 移動到一致位置 |
| Extract Superclass | 提取共同介面 |

---

## Change Preventers（變更障礙）

修改一處需要在多處修改。

### Divergent Change（發散式變更）
**徵兆:** 一個類別因不同原因而修改。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Class** | 分離不同變更原因 |
| Split Phase | 分離處理階段 |
| Move Function | 將函數移到適當類別 |

### Shotgun Surgery（霰彈式修改）
**徵兆:** 一個變更需要修改多個類別。

| 重構技術 | 使用時機 |
|----------|----------|
| **Move Function** | 集中相關功能 |
| Move Field | 集中相關資料 |
| Combine Functions into Class | 組合相關函數 |
| Inline Function/Class | 消除過度分散 |

### Parallel Inheritance Hierarchies（平行繼承層級）
**徵兆:** 建立一個子類別時必須建立另一個。

| 重構技術 | 使用時機 |
|----------|----------|
| **Move Function** | 消除重複 |
| Move Field | 統一資料位置 |
| Replace Superclass with Delegate | 改用委託 |

---

## Dispensables（冗餘類）

移除後程式碼更乾淨。

### Comments（過多註解）
**徵兆:** 程式碼需要大量註解才能理解。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Function** | 讓程式碼自解釋 |
| Rename Variable/Function | 用名稱取代註解 |
| Introduce Assertion | 表達假設 |

### Duplicate Code（重複程式碼）
**徵兆:** 相同或相似程式碼在多處出現。

| 重構技術 | 使用時機 |
|----------|----------|
| **Extract Function** | 同一類別內重複 |
| Pull Up Method | 子類別間重複 |
| Extract Class | 不相關類別間重複 |
| Slide Statements | 準備提取 |
| Replace Inline Code with Function Call | 呼叫現有函數 |

### Lazy Class（冗餘類別）
**徵兆:** 類別做的事太少，不值得存在。

| 重構技術 | 使用時機 |
|----------|----------|
| **Inline Class** | 合併到其他類別 |
| Collapse Hierarchy | 移除不需要的層級 |

### Data Class（純資料類別）
**徵兆:** 類別只有欄位和 getter/setter。

| 重構技術 | 使用時機 |
|----------|----------|
| **Move Function** | 將行為移入 |
| Encapsulate Record | 加入封裝 |
| Remove Setting Method | 限制修改 |

### Dead Code（死亡程式碼）
**徵兆:** 程式碼不會被執行到。

| 重構技術 | 使用時機 |
|----------|----------|
| **Remove Dead Code** | 唯一選擇 |

### Speculative Generality（過度設計）
**徵兆:** 為「未來可能需要」而預先設計。

| 重構技術 | 使用時機 |
|----------|----------|
| **Collapse Hierarchy** | 不需要的繼承 |
| Inline Function/Class | 不需要的抽象 |
| Remove Dead Code | 未使用的參數/方法 |
| Change Function Declaration | 移除未用參數 |

---

## Couplers（耦合類）

類別間耦合過緊。

### Feature Envy（依戀情結）
**徵兆:** 方法過度使用其他類別的資料。

| 重構技術 | 使用時機 |
|----------|----------|
| **Move Function** | 移到資料所在類別 |
| Extract Function | 先分離關心的部分 |

### Inappropriate Intimacy（親密關係）
**徵兆:** 兩個類別過度了解彼此內部。

| 重構技術 | 使用時機 |
|----------|----------|
| **Move Function** | 減少依賴 |
| Move Field | 統一資料位置 |
| Hide Delegate | 隱藏內部 |
| Replace Superclass/Subclass with Delegate | 改用委託 |
| Extract Class | 提取共用部分 |

### Message Chains（訊息鏈）
**徵兆:** `a.b().c().d().e()`

| 重構技術 | 使用時機 |
|----------|----------|
| **Hide Delegate** | 隱藏中間物件 |
| Extract Function | 封裝鏈 |
| Move Function | 移動到適當位置 |

### Middle Man（中介人）
**徵兆:** 類別只是委託給另一個類別。

| 重構技術 | 使用時機 |
|----------|----------|
| **Remove Middle Man** | 直接使用被委託者 |
| Inline Function | 消除簡單委託 |
| Replace Superclass with Delegate | 改變關係 |

---

## 快速診斷表

| 症狀 | 可能的 Smell | 首選重構 |
|------|--------------|----------|
| 方法超過 20 行 | Long Method | Extract Function |
| 類別超過 200 行 | Large Class | Extract Class |
| 參數超過 3 個 | Long Parameter List | Introduce Parameter Object |
| 相同程式碼出現 2+ 次 | Duplicate Code | Extract Function |
| switch/if-else 鏈 | Switch Statements | Replace Conditional with Polymorphism |
| 改一處動多處 | Shotgun Surgery | Move Function |
| 一個類別多種原因修改 | Divergent Change | Extract Class |
| 方法用別人的資料 | Feature Envy | Move Function |
| 只有資料沒有行為 | Data Class | Move Function |
| 註解解釋程式碼 | Comments | Extract Function + Rename |
