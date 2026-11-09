---
id: SEED-289
status: active
planted: 2026-11-09
planted_during: Product retrospective of SEED-285#trace-landed-proof-timing
trigger_when: Maintaining the pending landed-CI recovery integration proof
scope: story
---

# Consolidate the landed proof recovery journey

<a id="consolidate-landed-proof-recovery"></a>

### Maintain one complete pending landed-CI recovery integration journey

**Identity:** SEED-289#consolidate-landed-proof-recovery

```json dough-story-state
{
  "schemaVersion": 1,
  "refinement": "refined",
  "approach": "planned",
  "plan": "../slice-plans/560-consolidate-landed-proof-recovery/PLAN.md",
  "assessment": "ready",
  "reasons": [],
  "basis": {
    "document": "4bd3db88bd8c47571dfd0e13901a7fce060076886c3b66abc0e2e143bba71b3e",
    "plan": "40a1804dbc000cef61b8127b4f909ac5e9cba109babf7c734092af2523ff4d62"
  }
}
```

**Goal.** Maintainers have one complete integration journey for pending CI
recovery after a dashboard stop and launch-record expiry, reducing parallel
fixtures and assertion ownership while retaining every meaningful observation.

**Scope.** Strengthen the existing landed-history lifecycle journey with actual
retained validated summary, scoped readings and collection-OFF reader restart
proof before removing the duplicate pending/two-collector case. Preserve the
older journey's expired-capture exclusion, mixed ancestry order, exact public
wall-time answer, concurrency and development-server no-acquisition proof.
Keep both separate final-build backfill variants and all production behavior.
This is a bounded retrospective correction: no new feature, performance target,
profiling, unrelated suite optimization or replacement with injected-only proof.

**Key examples.** A running accepted landing survives stop and expired launch
records, then two collectors retain the recovered attempt and its actual proof once.
The same entry, folder and zero-file readings survive a reader-only restart
without acquisition. Initially expired captures stay excluded, and the prior
point, intervening no-build gap and recovered point retain their public order.

**Plan:** [Consolidate the landed proof recovery journey](../slice-plans/560-consolidate-landed-proof-recovery/PLAN.md)
