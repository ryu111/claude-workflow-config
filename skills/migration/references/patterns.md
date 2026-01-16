# Migration Patterns

Comprehensive guide to migration strategies and patterns.

---

## Strategy Overview

### Big Bang Migration

**Definition**: Replace entire system at once.

```
┌──────────────┐         ┌──────────────┐
│   Old System │  ────>  │   New System │
│              │  (cut)  │              │
└──────────────┘         └──────────────┘
```

**When to Use**:
- Small scope (<10 files)
- High test coverage (>80%)
- Simple dependencies
- Tight deadline

**Risks**:
- All-or-nothing failure
- Difficult rollback
- Hidden issues surface at once

**Mitigation**:
- Comprehensive test suite
- Feature freeze during migration
- Short rollback window
- Intensive monitoring

**Example - Package Replacement**:
```bash
# Step 1: Replace dependency
npm uninstall old-package
npm install new-package

# Step 2: Update all imports (single commit)
sed -i '' 's/old-package/new-package/g' $(find src -name "*.ts")

# Step 3: Fix API differences
# ... manual fixes ...

# Step 4: Run all tests
npm test
```

---

### Strangler Fig Pattern

**Definition**: Gradually replace old system by routing traffic to new system piece by piece.

```
┌──────────────────────────────────┐
│           Facade/Router          │
└──────────────────────────────────┘
         │                   │
         ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Old System   │    │ New System   │
│ (shrinking)  │    │ (growing)    │
└──────────────┘    └──────────────┘
```

**When to Use**:
- Large systems (>50 files)
- Long-running migration
- Need continuous operation
- Risk-averse environment

**Benefits**:
- Incremental progress
- Easy rollback per component
- Continuous delivery
- Learn as you go

**Implementation Steps**:

```markdown
## Phase 1: Create Facade
- Build routing layer that delegates to old system
- All traffic goes through facade

## Phase 2: Migrate Component by Component
For each component:
  1. Implement in new system
  2. Route traffic to new implementation
  3. Verify behavior matches
  4. Mark old component for deletion

## Phase 3: Remove Old System
- Delete old components
- Remove facade if no longer needed
```

**Example - API Migration**:
```typescript
// Facade/Router
class ApiRouter {
  async handleRequest(endpoint: string, params: any) {
    const NEW_ENDPOINTS = ['users', 'products'];

    if (NEW_ENDPOINTS.includes(endpoint)) {
      return this.newApi.handle(endpoint, params);
    }
    return this.oldApi.handle(endpoint, params);
  }
}
```

---

### Branch by Abstraction

**Definition**: Introduce abstraction layer, implement new version behind it, switch over.

```
Phase 1: Extract Interface
┌──────────────┐
│    Client    │
└──────┬───────┘
       │ direct call
       ▼
┌──────────────┐
│ Old Implement│
└──────────────┘

Phase 2: Add Abstraction
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Interface   │ (abstraction)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Old Implement│
└──────────────┘

Phase 3: Implement New
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│      Interface       │
└────┬────────────┬────┘
     │            │
     ▼            ▼
┌────────┐  ┌────────┐
│  Old   │  │  New   │ (parallel)
└────────┘  └────────┘

Phase 4: Switch & Remove
┌──────────────┐
│    Client    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Interface   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ New Implement│
└──────────────┘
```

**When to Use**:
- Need feature parity verification
- Want to keep both implementations temporarily
- Complex business logic
- Need A/B testing

**Implementation Example**:

```typescript
// Step 1: Define interface
interface DataStore {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

// Step 2: Wrap old implementation
class OldDataStore implements DataStore {
  private legacy: LegacyDatabase;

  async get(key: string) {
    return this.legacy.fetch(key);
  }
  // ...
}

// Step 3: Implement new
class NewDataStore implements DataStore {
  private modern: ModernDatabase;

  async get(key: string) {
    return this.modern.read(key);
  }
  // ...
}

// Step 4: Feature flag switch
class DataStoreFactory {
  static create(): DataStore {
    if (FeatureFlags.USE_NEW_DATASTORE) {
      return new NewDataStore();
    }
    return new OldDataStore();
  }
}
```

---

### Parallel Run

**Definition**: Run both old and new systems simultaneously, compare outputs.

```
        ┌──────────────┐
        │    Input     │
        └──────┬───────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│  Old System  │ │  New System  │
└──────┬───────┘ └──────┬───────┘
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│ Old Output   │ │ New Output   │
└──────┬───────┘ └──────┬───────┘
       │               │
       └───────┬───────┘
               │
               ▼
        ┌──────────────┐
        │   Compare    │
        │  & Validate  │
        └──────────────┘
```

**When to Use**:
- Data accuracy is critical
- Financial or compliance systems
- Complex calculations
- Need statistical confidence

**Benefits**:
- Verify correctness before switch
- Build confidence in new system
- Catch edge cases
- Quantify differences

**Implementation**:

```python
from dataclasses import dataclass
from typing import Any, Optional

@dataclass
class ComparisonResult:
    match: bool
    old_result: Any
    new_result: Any
    difference: Optional[str] = None

class ParallelRunner:
    def __init__(self, old_system, new_system):
        self.old = old_system
        self.new = new_system
        self.results: list[ComparisonResult] = []

    def run_and_compare(self, input_data) -> ComparisonResult:
        old_result = self.old.process(input_data)
        new_result = self.new.process(input_data)

        result = ComparisonResult(
            match=old_result == new_result,
            old_result=old_result,
            new_result=new_result,
            difference=self._diff(old_result, new_result)
        )

        self.results.append(result)
        return result

    def report(self) -> dict:
        total = len(self.results)
        matches = sum(1 for r in self.results if r.match)
        return {
            "total": total,
            "matches": matches,
            "mismatches": total - matches,
            "accuracy": matches / total * 100
        }
```

---

## Database Migration Patterns

### Expand-Contract Pattern

**Definition**: Add new schema alongside old, migrate data, remove old schema.

```
Phase 1: Expand
┌─────────────────────────────┐
│        users table          │
├──────────┬──────────────────┤
│ name     │ full_name (NEW)  │
│ (old)    │                  │
└──────────┴──────────────────┘

Phase 2: Migrate
┌─────────────────────────────┐
│        users table          │
├──────────┬──────────────────┤
│ name     │ full_name        │
│ "John"   │ "John" (copied)  │
└──────────┴──────────────────┘

Phase 3: Contract
┌─────────────────────────────┐
│        users table          │
├─────────────────────────────┤
│ full_name                   │
│ "John"                      │
└─────────────────────────────┘
```

**Migration Script Example**:

```sql
-- Phase 1: Expand (add new column)
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Phase 2: Migrate (copy data)
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Phase 3: Contract (remove old column)
-- After verifying all code uses new column
ALTER TABLE users DROP COLUMN name;
```

### Shadow Write Pattern

**Definition**: Write to both old and new schemas, switch reads gradually.

```
Write Path:
┌──────────────┐
│    Write     │
└──────┬───────┘
       │
       ├────────────────┐
       │                │
       ▼                ▼
┌──────────────┐ ┌──────────────┐
│  Old Schema  │ │  New Schema  │
└──────────────┘ └──────────────┘

Read Path (gradually switch):
┌──────────────┐
│    Read      │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│   Feature Flag       │
│ (old vs new schema)  │
└──────────────────────┘
```

---

## API Version Migration Patterns

### URL Versioning

```
/api/v1/users  ->  /api/v2/users

Migration Steps:
1. Deploy v2 endpoints
2. Update clients to use v2
3. Deprecate v1 (add warning headers)
4. Remove v1 after deadline
```

### Header Versioning

```
Accept: application/vnd.api+json;version=1
Accept: application/vnd.api+json;version=2

Migration Steps:
1. Add version handling to server
2. Implement v2 handlers
3. Default to v2 for new clients
4. Deprecate v1
```

### Deprecation Strategy

```markdown
## API v1 Deprecation Timeline

### Phase 1: Announcement (Week 1)
- Add `Deprecation` header to v1 responses
- Document migration guide
- Notify API consumers

### Phase 2: Warning (Week 2-4)
- Add `Sunset` header with removal date
- Monitor v1 usage
- Support migration questions

### Phase 3: Soft Removal (Week 5)
- Return 410 Gone for v1
- Keep data compatible
- Allow quick restore

### Phase 4: Hard Removal (Week 8)
- Remove v1 code completely
- Archive documentation
```

---

## Framework Upgrade Patterns

### Incremental Upgrade

```
v1.0 -> v1.1 -> v1.2 -> v2.0

Benefits:
- Smaller changes per step
- Easier to debug issues
- Can stop at any point
```

### Direct Upgrade with Compatibility Layer

```
v1.0 -> v2.0 (with shim)

// Compatibility shim
const legacyApi = {
  oldMethod(...args) {
    console.warn('oldMethod is deprecated, use newMethod');
    return newApi.newMethod(...args);
  }
};
```

---

## Dependency Replacement Patterns

### Adapter Pattern

**Use when APIs differ significantly**:

```typescript
// Old package API
const oldCache = {
  fetch: (key: string) => Promise<any>,
  store: (key: string, value: any, ttl: number) => void
};

// New package API
const newCache = {
  get: (key: string) => Promise<any>,
  set: (key: string, value: any, options: {ttl: number}) => Promise<void>
};

// Adapter
class CacheAdapter {
  constructor(private impl: 'old' | 'new') {}

  async get(key: string): Promise<any> {
    if (this.impl === 'old') {
      return oldCache.fetch(key);
    }
    return newCache.get(key);
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    if (this.impl === 'old') {
      oldCache.store(key, value, ttl);
    } else {
      await newCache.set(key, value, {ttl});
    }
  }
}
```

### Direct Replacement

**Use when APIs are similar**:

```bash
# 1. Install new package
npm install new-package

# 2. Update imports (automated)
find src -name "*.ts" -exec sed -i '' 's/old-package/new-package/g' {} \;

# 3. Fix type errors (manual)
# ... review and fix ...

# 4. Remove old package
npm uninstall old-package
```

---

## Risk Mitigation Patterns

### Feature Flags

```typescript
const FEATURE_FLAGS = {
  USE_NEW_DATABASE: process.env.USE_NEW_DATABASE === 'true',
  USE_NEW_CACHE: process.env.USE_NEW_CACHE === 'true'
};

function getDatabase(): Database {
  if (FEATURE_FLAGS.USE_NEW_DATABASE) {
    return new PostgresDatabase();
  }
  return new MySQLDatabase();
}
```

### Circuit Breaker

```typescript
class MigrationCircuitBreaker {
  private failures = 0;
  private readonly threshold = 5;

  async execute<T>(newFn: () => Promise<T>, fallbackFn: () => Promise<T>): Promise<T> {
    if (this.failures >= this.threshold) {
      console.warn('Circuit open, using fallback');
      return fallbackFn();
    }

    try {
      return await newFn();
    } catch (error) {
      this.failures++;
      console.error('New system failed, using fallback');
      return fallbackFn();
    }
  }
}
```

### Canary Deployment

```markdown
## Canary Rollout

### Stage 1: 1% traffic
- Duration: 1 hour
- Success criteria: Error rate < 0.1%

### Stage 2: 10% traffic
- Duration: 4 hours
- Success criteria: Error rate < 0.1%, latency < baseline + 10%

### Stage 3: 50% traffic
- Duration: 24 hours
- Success criteria: All metrics within bounds

### Stage 4: 100% traffic
- Full rollout
- Monitor for 1 week
```

---

## Pattern Selection Guide

| Scenario | Recommended Pattern |
|----------|---------------------|
| Simple package replacement | Direct Replacement or Big Bang |
| Complex system replacement | Strangler Fig |
| Need feature parity proof | Branch by Abstraction |
| Financial/critical data | Parallel Run |
| Database schema change | Expand-Contract |
| API version upgrade | URL Versioning + Deprecation |
| Framework major upgrade | Incremental if possible |
| Risk-averse environment | Strangler Fig + Feature Flags |

---

**Key Takeaway**: Choose the pattern that balances your risk tolerance, timeline, and system complexity. When in doubt, go slower and more incremental.
