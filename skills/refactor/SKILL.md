---
name: refactor
description: 重構專業知識。Code Smells 識別、70+ 重構技術、安全重構流程。適用於改善程式碼設計而不改變行為時使用。
---

# Refactor Skill

系統性重構程式碼，改善設計品質。

## Quick Reference

### 重構的定義

> "Refactoring is the process of changing a software system in a way that does not alter the external behavior of the code yet improves its internal structure."
> — Martin Fowler

### 何時重構？

| 情境 | 重構優先級 |
|------|------------|
| 加新功能前 | 高 - 先重構再加功能 |
| 修 Bug 後 | 中 - 順手清理 |
| Code Review 時 | 中 - 發現問題就改 |
| 理解程式碼時 | 低 - 讓程式碼自解釋 |

### 何時不重構？

- 程式碼太爛，重寫更快
- 緊迫的截止日期（但要記錄技術債）
- 沒有測試覆蓋（先補測試）

## 重構流程

```
1. 確認測試通過 ✅
      ↓
2. 識別 Code Smell 🔍
      ↓
3. 選擇適當重構技術 🛠️
      ↓
4. 小步驟執行 👣
      ↓
5. 每步後執行測試 ✅
      ↓
6. Commit（每個完整重構一個 commit）
```

### 安全重構原則

1. **小步驟**：每次只做一個小改變
2. **頻繁測試**：每步後執行測試
3. **版本控制**：每個重構一個 commit
4. **保持行為**：外部行為不變

## 常見 Code Smells

| Smell | 描述 | 建議重構 |
|-------|------|----------|
| Long Method | 方法超過 20 行 | Extract Method |
| Large Class | 類別職責過多 | Extract Class |
| Feature Envy | 方法過度使用其他類別 | Move Method |
| Data Clumps | 相同資料群組重複出現 | Extract Class |
| Primitive Obsession | 過度使用基本型別 | Replace Primitive with Object |
| Long Parameter List | 參數超過 3 個 | Introduce Parameter Object |
| Divergent Change | 一個類別因多種原因修改 | Extract Class |
| Shotgun Surgery | 一個改變影響多個類別 | Move Method, Inline Class |
| Duplicate Code | 重複程式碼 | Extract Method, Pull Up Method |
| Dead Code | 未使用的程式碼 | Remove Dead Code |

## 進階資源

| 文檔 | 內容 |
|------|------|
| **references/catalog.md** | 70+ 重構技術完整目錄 |
| **references/smells-to-refactoring.md** | Code Smell → 重構技術映射 |
| **references/safety.md** | 安全重構指南與檢查清單 |
| **references/patterns.md** | 重構到設計模式 |

## 與工作流整合

### DEVELOPER 使用

```
1. 收到任務後先識別 Code Smells
2. 使用 /refactor 查詢適當技術
3. 小步驟執行重構
4. 確保測試通過
```

### REVIEWER 使用

```
1. 檢查是否有未處理的 Code Smells
2. 確認重構是否保持行為
3. 驗證測試覆蓋率
```

## 參考資料

- Martin Fowler《Refactoring: Improving the Design of Existing Code》(2nd Edition)
- Refactoring.Guru (https://refactoring.guru)
- Joshua Kerievsky《Refactoring to Patterns》
