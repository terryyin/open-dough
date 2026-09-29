---
id: SEED-044
status: active
planted: 2026-09-26
planted_during: Maintainer review of retrospective finding priorities
trigger_when: A plan's readiness depends on claims about existing code or executable proof
scope: unknown
---

# SEED-044: Start execution from verified planning premises

## Why This Matters

Developers and execution coordinators need a ready plan whose decisive claims
about existing code, fixtures, environment and proof paths hold in the target
project. Discovering an invalid premise during execution causes avoidable scope
changes, failed paid runs, replanning and missing CI evidence. This serves the
low coordination cost and empirical improvement goals of
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Pending native acceptance

<a id="native-premise-acceptance-codex-cursor"></a>

The Cursor premise miss is the story below. The original cases, setup,
constraints and Claude Code reference are retained in their
[shared acceptance context](SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases).
This anchor remains a navigation reference, not a separate active story.

## Story Decomposition

<a id="name-the-feature-that-runs-moved-seeding"></a>

### Name the feature that runs moved seeding

**Identity:** SEED-044#name-the-feature-that-runs-moved-seeding
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/153-name-the-feature-that-runs-moved-seeding/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f0582e3046790d442e23ecd1bd1ef201e75807bb96fc29b7d2239d424b7029cb","plan":"6ff6d187763d306ce4900382695d498427973ed7bc65e5efade45b55484940ed"}}
```

**Goal:** A maintainer accepting premise-verification guidance gets one Cursor
planning-only plan, for the recorded Pygardon seeding move, that names a
feature which actually runs the seeding script and records that observation.
The 2026-09-29 miss under guidance `0.3.46` is enough reason to change the
guidance; another run of that same guidance is not new evidence.

**Scope:**

- **Name the feature that runs the script.** Change the planning guidance that
  produced plan 208 so a plan which moves seeding proves that move by naming a
  feature that runs the seeding script and recording the observation that it
  does. Unit tests of the moved function are not that proof.
  `strategy_verify.feature` is not that proof when it does not run the script.
  The guidance wording itself stays with planning.
- **One Cursor check of the changed guidance.** Use the shared Pygardon
  premise setup: a disposable clone at the parent of `b2ad7c394`, with the
  seed and backlog restored from `b2ad7c394`. One planning-only run of
  `SEED-047#story-tfdc-dead-behavior-removal`, manually triggered, and not
  added to `npm test`, `scripts/test.sh`, CI, or a wrapper whose default
  calls a real host.
- **Depends on none.** The guidance change is useful on its own.
- **Deferred.** Re-running the Doughnut and Open Dough control cases, a new
  three-case Cursor premise-acceptance claim, and any Claude Code or Codex
  re-run. Effort is unestimated; this repository has no S/M/L definitions.
  The assumption is that the change is in the installed planning guidance,
  not a new harness.

**Key examples:**

- Pygardon at the parent of `b2ad7c394`, with
  `e2e_test/features/live_strategies.feature` present and its steps running
  `e2e_test/support/seed_named_genome_live_strategy_pair.py` → one Cursor
  planning-only run of `SEED-047#story-tfdc-dead-behavior-removal` under the
  changed guidance → the written plan names that feature, or another feature
  that runs that script, and records the observation → pass.
- Same setup → the written plan moves `gate_baseline_genome` under tests and
  proves it only with pytest, never naming the feature or the script → fail.
  That is plan 208 under guidance `0.3.46`.
- Same setup → the written plan cites only `strategy_verify.feature`, which
  does not run the seeding script → fail.

## Ordering and Scope Reduction

This is the only candidate. It comes before another Cursor premise-acceptance claim for the Pygardon case. Dropping it leaves that case a recorded fail.

## Open Decisions

None. The promise is the examples above. How the guidance is worded stays with planning.

## Breadcrumbs

- Cursor premise run on 2026-09-29. The written plan is recoverable at `aed19fbc:native-results/cursor-premise/plans/pygardon-208.md`.
- [Shared premise cases](SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases).
