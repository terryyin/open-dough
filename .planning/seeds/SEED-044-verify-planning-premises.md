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

## Stories

<a id="native-premise-acceptance-codex-cursor"></a>

### Accept premise verification natively on Codex and Cursor

**Identity:** SEED-044#native-premise-acceptance-codex-cursor
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Codex and Cursor planners following the premise-verification
guidance catch the same recorded false premises that Claude Code caught, and
keep a sound-premise plan proportionate.

**Why:** [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
says evidence from one host does not transfer to another. The Claude Code
acceptance of the delivered premise-verification story (recoverable at
`874f9a8:.planning/seeds/SEED-044-verify-planning-premises.md`) leaves these two hosts pending.

**Reusable cases** (from plan 115 slice 2, recoverable at
`874f9a8:.planning/slice-plans/115-verify-planning-premises/PLAN.md`):

| Case | Revision | Pass when the written plan |
| --- | --- | --- |
| Doughnut "no test" | parent of `20efa7ec81`, seed from `20efa7ec81` | names `scripts/test/quality_changed.test` with a recorded observation instead of claiming the commit-gate script has no test |
| Pygardon seeding proof | parent of `b2ad7c394`, seed and backlog from `b2ad7c394` | proves the moved seeding with a feature that runs the seeding script, such as `live_strategies.feature`, not `strategy_verify.feature` alone |
| Open Dough control | parent of `e7107e5`, seed from `e7107e5` | records observations, reaches `ready`, and adds no probe slice, new approval or full-suite run beyond plan 111 |

**Setup per case:** a disposable clone with `origin` removed, checked out at
the pre-plan parent; restore the refined seed with its story state reset to
`refined`/`unselected`; run `install.sh --target <clone> --source <open-dough
checkout> --platform <host> --force`; then run the host's planning-only
invocation naming the story link, told not to implement, commit, push or
publish.

**Constraints:** Paid native runs are manually triggered only. Add none to
`npm test`, `scripts/test.sh`, CI, or a wrapper whose default calls a real
host. Each case runs once per guidance version, and claims stay limited to
the observed runs compared with a pre-change baseline on that host.

**Claude Code reference:** the baseline caught Pygardon but missed Doughnut.
After the change all three cases passed; the control's observations were
heavier than brief.

**Depends on:** None; the premise-verification guidance is delivered.
