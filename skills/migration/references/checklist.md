# Migration Checklist

Comprehensive checklists for each migration phase.

---

## Pre-Migration Checklist

### Discovery

- [ ] **Usage Analysis**
  - [ ] Identified all files using the old tool/system
  - [ ] Listed all import statements and their locations
  - [ ] Documented configuration files affected
  - [ ] Mapped environment variables used

- [ ] **Dependency Mapping**
  - [ ] Direct dependencies identified
  - [ ] Transitive dependencies checked
  - [ ] External service dependencies noted
  - [ ] Build/CI dependencies reviewed

- [ ] **Feature Inventory**
  - [ ] Listed all features used from old system
  - [ ] Marked features as: Critical / Important / Nice-to-have
  - [ ] Identified unused features (can skip migration)

### Compatibility Analysis

- [ ] **Feature Parity**
  - [ ] Compared old vs new feature sets
  - [ ] Documented feature gaps
  - [ ] Identified workarounds for missing features
  - [ ] Marked blocking gaps (if any)

- [ ] **API Mapping**
  - [ ] Mapped old API to new API
  - [ ] Documented signature changes
  - [ ] Noted behavioral differences
  - [ ] Identified deprecated methods

- [ ] **Breaking Changes**
  - [ ] Listed all breaking changes
  - [ ] Assessed impact of each
  - [ ] Planned mitigation for each
  - [ ] Documented in proposal

### Test Coverage

- [ ] **Current Coverage**
  - [ ] Measured test coverage for affected code
  - [ ] Coverage meets minimum threshold (>70%)
  - [ ] Critical paths have tests

- [ ] **Migration Tests**
  - [ ] Planned tests for migration correctness
  - [ ] Planned tests for behavior parity
  - [ ] Planned rollback tests

### Rollback Planning

- [ ] **Rollback Strategy**
  - [ ] Rollback method documented
  - [ ] Rollback tested (dry run)
  - [ ] Rollback window defined
  - [ ] Owner assigned for rollback decision

- [ ] **Rollback Triggers**
  - [ ] Defined failure conditions
  - [ ] Set threshold metrics
  - [ ] Established monitoring alerts

### Stakeholder Communication

- [ ] **Notifications**
  - [ ] Team informed of migration plan
  - [ ] Timeline communicated
  - [ ] Breaking changes highlighted
  - [ ] Support plan established

---

## During-Migration Checklist

### Per Component Migration

- [ ] **Before Each Component**
  - [ ] Tests for this component pass (baseline)
  - [ ] Related components stable
  - [ ] Rollback ready for this component

- [ ] **Migration Execution**
  - [ ] Code changes applied
  - [ ] Configuration updated
  - [ ] Tests updated (if needed)
  - [ ] All tests pass

- [ ] **Verification**
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Manual smoke test (if applicable)
  - [ ] No new warnings/errors in logs

- [ ] **Commit**
  - [ ] Changes committed with clear message
  - [ ] D->R->T cycle completed
  - [ ] tasks.md updated

### Monitoring

- [ ] **Metrics**
  - [ ] Error rates being monitored
  - [ ] Performance metrics collected
  - [ ] Resource usage tracked

- [ ] **Alerts**
  - [ ] Alerts configured for anomalies
  - [ ] On-call aware of migration
  - [ ] Escalation path clear

### Documentation

- [ ] **Progress Tracking**
  - [ ] tasks.md updated after each task
  - [ ] Blockers documented immediately
  - [ ] Decisions recorded with rationale

---

## Post-Migration Checklist

### Verification

- [ ] **Test Suite**
  - [ ] All unit tests pass
  - [ ] All integration tests pass
  - [ ] All E2E tests pass
  - [ ] No flaky tests introduced

- [ ] **Performance**
  - [ ] Performance within acceptable bounds
  - [ ] No memory leaks detected
  - [ ] Response times stable
  - [ ] Resource usage normal

- [ ] **Functionality**
  - [ ] All migrated features working
  - [ ] Edge cases verified
  - [ ] Error handling correct
  - [ ] Logging appropriate

### Cleanup

- [ ] **Old Code Removal**
  - [ ] Old dependencies removed
  - [ ] Old configuration removed
  - [ ] Adapter layers removed (if used)
  - [ ] Dead code eliminated

- [ ] **Documentation Update**
  - [ ] README updated
  - [ ] API documentation updated
  - [ ] Configuration docs updated
  - [ ] Migration notes archived

### Stability Period

- [ ] **Monitoring (1 week)**
  - [ ] Error rates stable
  - [ ] Performance stable
  - [ ] No regressions reported
  - [ ] User feedback positive

- [ ] **Rollback Decision**
  - [ ] After stability period: confirm no rollback needed
  - [ ] Archive rollback plan
  - [ ] Close migration change

---

## Rollback Decision Matrix

### When to Rollback

| Condition | Severity | Action |
|-----------|----------|--------|
| Tests failing | Medium | Debug first, rollback if can't fix in 1 hour |
| Error rate > 5% | High | Immediate rollback |
| Performance -50% | High | Immediate rollback |
| Critical feature broken | Critical | Immediate rollback |
| Data corruption | Critical | Immediate rollback + incident |

### When NOT to Rollback

| Condition | Severity | Action |
|-----------|----------|--------|
| Minor test flake | Low | Investigate, fix test |
| Performance -10% | Low | Optimize, monitor |
| Non-critical bug | Low | Fix forward |
| Expected behavior change | None | Document, communicate |

### Rollback Procedure

```markdown
## Rollback Execution

### 1. Announce
- [ ] Notify team of rollback decision
- [ ] Document reason

### 2. Execute
- [ ] Revert commits (or switch feature flag)
- [ ] Deploy reverted code
- [ ] Verify old system working

### 3. Verify
- [ ] All tests pass
- [ ] Error rates normalized
- [ ] Performance restored

### 4. Post-Mortem
- [ ] Document what went wrong
- [ ] Identify prevention measures
- [ ] Plan retry (if applicable)
```

---

## Risk Assessment Checklist

### Low Risk Migration

All of these must be true:
- [ ] Scope: <10 files affected
- [ ] Test coverage: >80%
- [ ] Feature parity: 100%
- [ ] Breaking changes: None
- [ ] Rollback: Git revert sufficient

### Medium Risk Migration

Some of these are true:
- [ ] Scope: 10-50 files affected
- [ ] Test coverage: 50-80%
- [ ] Feature parity: >90%
- [ ] Breaking changes: Minor
- [ ] Rollback: Configuration change needed

### High Risk Migration

Any of these are true:
- [ ] Scope: >50 files affected
- [ ] Test coverage: <50%
- [ ] Feature parity: <90%
- [ ] Breaking changes: Major
- [ ] Rollback: Data migration needed

---

## Special Checklists

### Database Migration

- [ ] **Before**
  - [ ] Backup taken
  - [ ] Backup restore tested
  - [ ] Migration script tested on copy
  - [ ] Downtime window scheduled (if needed)

- [ ] **During**
  - [ ] Lock tables (if needed)
  - [ ] Run migration script
  - [ ] Verify data integrity
  - [ ] Update application code

- [ ] **After**
  - [ ] All data correct
  - [ ] Indexes performing
  - [ ] Queries optimized
  - [ ] Old schema removed (after stabilization)

### API Migration

- [ ] **Before**
  - [ ] New API deployed (parallel)
  - [ ] Client migration guide ready
  - [ ] Deprecation timeline communicated

- [ ] **During**
  - [ ] Clients migrating on schedule
  - [ ] Support available for questions
  - [ ] Usage metrics tracked

- [ ] **After**
  - [ ] All clients migrated
  - [ ] Old API deprecated
  - [ ] Old API removed (after deadline)

### Framework Upgrade

- [ ] **Before**
  - [ ] Read official migration guide
  - [ ] Check breaking changes list
  - [ ] Review changelog for new features
  - [ ] Test upgrade on branch

- [ ] **During**
  - [ ] Update dependencies first
  - [ ] Fix deprecation warnings
  - [ ] Update configuration
  - [ ] Migrate API usage

- [ ] **After**
  - [ ] All tests pass
  - [ ] No deprecation warnings
  - [ ] New features adopted (where beneficial)
  - [ ] Documentation updated

---

## Emergency Rollback Checklist

For critical situations requiring immediate rollback:

### Immediate Actions (< 5 minutes)

- [ ] Confirm rollback decision with owner
- [ ] Execute rollback command/switch feature flag
- [ ] Verify rollback successful
- [ ] Notify team

### Short-term Actions (< 1 hour)

- [ ] Document incident
- [ ] Identify root cause
- [ ] Assess data impact
- [ ] Plan remediation

### Follow-up Actions (< 1 day)

- [ ] Write post-mortem
- [ ] Update migration plan
- [ ] Improve tests/monitoring
- [ ] Schedule retry (if applicable)

---

## Template: Migration Status Report

```markdown
## Migration Status: [Old] -> [New]

### Overview
- **Started**: [Date]
- **Current Phase**: [Preparation / Migration / Cleanup]
- **Overall Progress**: [X]%

### Tasks
- Total: [X]
- Completed: [Y]
- In Progress: [Z]
- Blocked: [W]

### Metrics
| Metric | Before | Current | Target |
|--------|--------|---------|--------|
| Test Coverage | X% | Y% | Z% |
| Error Rate | X% | Y% | <Z% |
| Performance | Xms | Yms | <Zms |

### Blockers
1. [Blocker 1] - Status: [...]
2. [Blocker 2] - Status: [...]

### Next Steps
1. [Next task 1]
2. [Next task 2]

### Risk Assessment
- Current Risk Level: [Low / Medium / High]
- Rollback Ready: [Yes / No]
```

---

**Remember**: A checklist is only useful if followed. Take time to review each item rather than checking boxes automatically.
