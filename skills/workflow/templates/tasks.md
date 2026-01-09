# Tasks Template

專案任務計畫模板。由 ARCHITECT 產生，Main Agent 執行。

---

# [Feature Name] - Implementation Tasks

## Overview

- **Feature**: [簡短描述]
- **Created**: [日期]
- **Status**: In Progress

---

## 1. Foundation (sequential)

基礎建設任務，必須按順序完成。

- [ ] 1.1 [任務描述] | files: path/to/file.ts
- [ ] 1.2 [任務描述] | files: path/to/file.ts
- [ ] 1.3 [任務描述] | files: path/to/file.ts

---

## 2. Core Features (parallel)

核心功能，可同時執行（確保無檔案衝突）。

- [ ] 2.1 [功能 A] | files: src/features/a.ts
- [ ] 2.2 [功能 B] | files: src/features/b.ts
- [ ] 2.3 [功能 C] | files: src/features/c.ts

---

## 3. Integration (sequential, depends: 2)

整合任務，等待 Phase 2 完成後執行。

- [ ] 3.1 [整合描述] | files: src/index.ts
- [ ] 3.2 [測試整合] | files: src/__tests__/integration.test.ts

---

## 4. Polish (sequential, depends: 3)

收尾任務。

- [ ] 4.1 [文檔更新] | files: docs/feature.md
- [ ] 4.2 [最終測試] | files: src/__tests__/e2e.test.ts

---

## Notes

- Phase 執行規則：
  - `sequential` - 依序執行
  - `parallel` - 同時執行
  - `depends: N` - 等待 Phase N 完成

- 任務狀態：
  - `[ ]` - 待執行
  - `[x]` - 已完成
  - `[!]` - 失敗

---

## Progress Log

| Task | Status | Commit | Notes |
|------|--------|--------|-------|
| 1.1 | ⏳ | - | - |
| 1.2 | ⏳ | - | - |
