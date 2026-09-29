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

The pending premise-verification work belongs to the
[Cursor](SEED-053-native-guidance-acceptance.md#native-acceptance-cursor)
story. The original cases, setup, constraints and Claude Code reference
are retained in their [shared acceptance context](SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases).
This anchor remains a navigation reference, not a separate active story.

## Story Decomposition

<a id="name-the-feature-that-runs-moved-seeding"></a>

### Name the feature that runs moved seeding

**Identity:** SEED-044#name-the-feature-that-runs-moved-seeding
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A maintainer accepting premise-verification guidance needs a Cursor plan that moves seeding to prove that move with a feature that actually runs the seeding script. On 2026-09-29, guidance `0.3.46` planned Pygardon `SEED-047#story-tfdc-dead-behavior-removal` at the parent of `b2ad7c394` and moved `gate_baseline_genome` under tests, then proved it with pytest. `e2e_test/features/live_strategies.feature` was in that checkout, and its steps run `e2e_test/support/seed_named_genome_live_strategy_pair.py`. The written plan never named that feature or script.
- **Evaluation:** The same disposable Pygardon setup, one Cursor planning-only run of that story → the written plan names a feature that runs the seeding script, such as `live_strategies.feature`, and records that observation. A plan that proves the move only with unit tests, or only with `strategy_verify.feature`, does not pass.
- **Value / learning:** The recorded miss is enough to change the guidance. Another run of the same guidance is not new evidence.
- **Effort hypothesis:** Unestimated. This repository has no S/M/L definitions. The assumption is that the change is in the planning guidance the Cursor run already installed, not a new harness.
- **Depends on:** none. The Cursor acceptance story keeps its recorded fail and re-runs premise cases only after this guidance change.
- **Safe stopping point:** The guidance change is useful on its own. Cancelling a later acceptance re-run leaves the correction in place.

## Ordering and Scope Reduction

This is the only candidate. It comes before another Cursor premise-acceptance claim for the Pygardon case. Dropping it leaves that case a recorded fail.

## Open Decisions

None for selection. How the guidance should say this stays with refinement and planning.

## Breadcrumbs

- Cursor premise run on 2026-09-29. The written plan is recoverable at `aed19fbc:native-results/cursor-premise/plans/pygardon-208.md`.
- [Shared premise cases](SEED-053-native-guidance-acceptance.md#shared-premise-verification-cases).
