---
name: migration
description: Migration planning expertise. Use when replacing tools/frameworks, upgrading versions, migrating databases, or planning transitions. Contains strategies, compatibility analysis methods, and rollback planning.
---

# Migration Planning

Safely transition systems from one state to another with minimal risk.

## Quick Reference

### Migration Strategies

| Strategy | Risk | Duration | Best For |
|----------|------|----------|----------|
| **Big Bang** | High | Short | Small scope, good tests |
| **Strangler Fig** | Low | Long | Large systems |
| **Branch by Abstraction** | Medium | Medium | Feature parity needed |
| **Parallel Run** | Low | Long | Data accuracy critical |

### Decision Matrix

```
                    Small Scope?
                    /          \
                  Yes           No
                  /              \
         Good Tests?        Strangler Fig
         /        \
       Yes        No
        |          |
   Big Bang    Branch by
              Abstraction
```

### Risk Levels

| Risk | Criteria | Rollback Window |
|------|----------|-----------------|
| **Low** | <10 files, tests pass | 1 week |
| **Medium** | 10-50 files, partial tests | 1 day |
| **High** | >50 files, limited tests | 1 hour |

For complete patterns -> read `references/patterns.md`

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Safety First** | Always have a tested rollback plan |
| **Incremental** | Prefer small steps over big bang |
| **Test Before** | Ensure coverage before migrating |
| **Document** | Record all decisions with rationale |
| **Monitor** | Track metrics during and after |

---

## Compatibility Analysis

### Feature Mapping Template

```markdown
## [Old Tool] -> [New Tool] Compatibility

### Feature Matrix
| Feature | Old | New | Gap | Mitigation |
|---------|-----|-----|-----|------------|
| [F1] | Yes | Yes | None | - |
| [F2] | Yes | Partial | Yes | [Workaround] |
| [F3] | Yes | No | Critical | [Alternative] |

### API Mapping
| Old API | New API | Notes |
|---------|---------|-------|
| old.method() | new.method() | Same behavior |
| old.config(x) | new.setup({x}) | Different signature |
| old.feature | N/A | Need workaround |

### Configuration Mapping
| Old Config | New Config | Transform |
|------------|------------|-----------|
| OLD_VAR=x | NEW_VAR=x | Direct copy |
| OLD_JSON | NEW_YAML | Format convert |
```

### Breaking Change Categories

| Category | Impact | Detection |
|----------|--------|-----------|
| **API Rename** | Low | Compile error |
| **Signature Change** | Medium | Type error |
| **Behavior Change** | High | Runtime error |
| **Removal** | Critical | Feature unavailable |

---

## Rollback Planning

### Rollback Triggers

```markdown
## Automatic Rollback If:
- [ ] Tests fail after migration
- [ ] Performance degrades > 20%
- [ ] Error rate increases > 5%
- [ ] Critical feature unavailable
```

### Rollback Strategies

| Type | When | Recovery Time |
|------|------|---------------|
| **Code Revert** | Git-based changes | Minutes |
| **Config Switch** | Feature flags | Seconds |
| **Data Restore** | Database migration | Hours |
| **Full Rollback** | Infrastructure change | Days |

### Rollback Plan Template

```markdown
## Rollback Plan: [Migration Name]

### Trigger Conditions
1. [Condition 1] -> Action: [...]
2. [Condition 2] -> Action: [...]

### Rollback Steps
1. [ ] [Step 1]
2. [ ] [Step 2]
3. [ ] [Verification]

### Estimated Recovery Time
- Best case: [X minutes]
- Worst case: [X hours]

### Owner
- Primary: [Person]
- Backup: [Person]
```

---

## Migration Phases

### Phase 1: Discovery

```bash
# Find usage of tool being replaced
grep -r "import.*[tool]" src/
grep -r "from.*[tool]" src/

# Find configuration
find . -name "*[tool]*" -type f

# Count affected files
git ls-files | xargs grep -l "[tool]" | wc -l
```

**Output**: Usage report with file list and dependency graph

### Phase 2: Analysis

| Item | Questions |
|------|-----------|
| **Scope** | How many files? Which modules? |
| **Tests** | Current coverage? Migration tests needed? |
| **Dependencies** | Direct? Transitive? External? |
| **Breaking** | API changes? Behavior changes? |

**Output**: Compatibility matrix and gap analysis

### Phase 3: Planning

```markdown
## Migration Tasks

### 1. Preparation
- Add new dependency
- Create abstraction layer (if needed)
- Write migration tests

### 2. Migration (per component)
- Migrate code
- Update tests
- Verify behavior

### 3. Cleanup
- Remove old dependency
- Remove abstraction layer
- Update documentation
```

**Output**: OpenSpec change with tasks.md

### Phase 4: Execution

```
For each component:
    D -> R -> T
    If fail: Debug -> Retry (max 3)
    If still fail: Rollback
```

**Output**: Migrated code with passing tests

### Phase 5: Verification

| Check | Method |
|-------|--------|
| **Functional** | Run full test suite |
| **Performance** | Compare benchmarks |
| **Compatibility** | Test integrations |
| **Monitoring** | Check error rates |

**Output**: Verification report

For complete checklist -> read `references/checklist.md`

---

## Common Migration Types

### Dependency Replacement

```
Old Package -> New Package

Steps:
1. Add new package to dependencies
2. Create adapter layer (if APIs differ)
3. Migrate imports module by module
4. Remove old package
5. Clean up adapter layer
```

### Framework Upgrade

```
Framework v1 -> Framework v2

Steps:
1. Read migration guide
2. Identify breaking changes
3. Update configuration first
4. Migrate deprecated APIs
5. Test extensively
6. Update documentation
```

### Database Migration

```
Schema v1 -> Schema v2

Steps:
1. Create migration script
2. Test on copy of production data
3. Plan downtime or online migration
4. Execute with rollback ready
5. Verify data integrity
6. Update application code
```

### API Version Migration

```
API v1 -> API v2

Steps:
1. Deploy v2 alongside v1
2. Migrate clients gradually
3. Monitor v1 usage
4. Deprecate v1 with timeline
5. Remove v1 after deadline
```

---

## OpenSpec Integration

### Migration Change Template

```
openspec/changes/migrate-[old]-to-[new]/
├── proposal.md      # Why, impact, rollback
├── tasks.md         # Phased implementation
├── design.md        # Strategy decisions
└── specs/
    └── migration/
        └── spec.md  # Requirements
```

### Task Naming Convention

```markdown
## 1. Preparation (sequential)
- [ ] 1.1 Add [new] dependency | files: package.json
- [ ] 1.2 Create adapter layer | files: src/adapters/

## 2. Migration (sequential)
- [ ] 2.1 Migrate [component] | files: src/[path]

## 3. Cleanup (depends: 2)
- [ ] 3.1 Remove [old] dependency | files: package.json
- [ ] 3.2 Remove adapter layer | files: src/adapters/
```

---

## Checklist Quick Reference

### Before Migration
- [ ] Test coverage sufficient
- [ ] Rollback plan ready
- [ ] Breaking changes documented
- [ ] Stakeholders informed

### During Migration
- [ ] One component at a time
- [ ] Tests passing after each step
- [ ] Metrics being monitored
- [ ] Rollback ready to execute

### After Migration
- [ ] All tests passing
- [ ] Performance within bounds
- [ ] Documentation updated
- [ ] Old code removed

For complete checklist -> read `references/checklist.md`

---

## Next Steps

### Deep Dive
- Complete patterns -> `references/patterns.md`
- Complete checklist -> `references/checklist.md`

### Examples
- Playwright -> agent-browser migration (recent project experience)
- Package upgrade patterns
- Database schema migration

---

**Remember**: A successful migration is one that can be rolled back. Plan for failure, execute for success.
