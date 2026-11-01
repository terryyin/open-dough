---
id: SEED-208
status: active
planted: 2026-11-01
planted_during: Terry Yin's value-first review of test optimization candidates
scope: story
---

# Worthwhile dashboard proof at lower cost

<a id="declare-fixture-defaults-on-fixtures"></a>

### Declare dashboard fixture defaults on their fixtures

**Identity:** SEED-208#declare-fixture-defaults-on-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/436-declare-fixture-defaults-on-fixtures/PLAN.md"}
```

**Goal:** Every dashboard journey that uses a shared start fixture receives
that fixture's project folder and launch wait, whichever spec file a test
worker loads first.

**Beneficiary:** Developers running and moving dashboard journeys.

**Scope:** Correction found by the
reduce-dashboard-proof-cost retrospective (story and plan recoverable at
`40e1d2f9:.planning/seeds/SEED-208-dashboard-proof-cost.md#reduce-dashboard-proof-cost`
and `40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md`; first implementation commit `332c1327`). Its slice 9 found that a module-level `test.use` in a shared
support module applies only to the first spec file a worker loads it for, and
replaced the one in `dashboard/tests/support/codexStart.ts` with fixture
overrides. The same pattern remains in `dashboard/tests/support/cursorStart.ts`
and `dashboard/tests/support/unreadReportPage.ts`. Declare those defaults on
the fixtures the same way; a spec's own `test.use` still wins. Test support
only; product behavior unchanged.

**Key examples:**

- A worker that first loads another `cursorStart` consumer still gives a later
  Cursor journey file the `open-dough` project folder and launch wait.
- The unread-report journeys keep their folder and 30 s launch wait in any
  file order.

**Evaluation:** All consumers of both modules pass strict, plus one
file-order reproduction per module at `--workers=1` that observes the default
in the second-loaded file.

**Boundaries:** No other fixture redesign; no change to option values.
[Plan](../slice-plans/436-declare-fixture-defaults-on-fixtures/PLAN.md).
