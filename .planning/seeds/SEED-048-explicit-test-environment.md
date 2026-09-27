---
id: SEED-048
status: active
planted: 2026-09-27
planted_during: Maintainer review after SEED-037's wrap-up (plan 107)
trigger_when: A check behaves differently locally and on CI because of the shell, Git, or operating system it runs on
scope: 1 story
---

# SEED-048: Give the suite one explicit test environment

## Why This Matters

Developers and agents run the suite on macOS with whatever Bash and Git a
machine has, while CI runs Ubuntu 24.04 with a newer Git. Checks that depend
on something they never state (global Git config, background maintenance,
tool message text, process listings) pass on one side and fail on the other,
usually only on CI, where a failure is slow to see and slow to reproduce. In
SEED-037 alone this caused about six separate diagnosis cycles, the worst
costing roughly two hours and blocking an integration.

## Alternatives and Decision

Make the environment each check needs explicit where checks start, rather
than making every machine identical. Running every check in a container,
adding a macOS CI runner, or pinning CI's Git would each cost speed or CI time
for problems the explicit environment already removes. Keep one scripted
CI-matching Linux run for diagnosis only.

Refinement on 2026-09-27 narrowed the proposal. The acute Git-maintenance
flake is already repaired in the automated suite (`bfdf893`), and main's
twenty CI runs before refinement held no Git, Git-version, or Bash failure;
two failures were the dashboard's 320 px checks under CI's fonts, which only
a CI-matching run reproduces. The recurring cost was slow diagnosis once a
CI-only failure appeared. So the story invests in one place every check
starts from and in the reproduction command. It drops a Bash prelude in every
check and a suite-wide "assert behavior, not wording" sweep.

## Stories

<a id="test-environment-correction"></a>

### Keep product guards provable and the CI-platform command faithful

**Identity:** SEED-048#test-environment-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/127-test-environment-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"28f3a38dfdf850c1efe0ef2e9f38b67296a7f18746da46c35e573a6aa430c02b","plan":"05bfa801099db93433499aedf0caa91fdddd7f0363879e8879a843a3217a8e07"}}
```

**Goal:** A maintainer or agent can trust that a passing local check still
proves the product's own safeguards, and that `scripts/ci-container.sh` runs
chosen checks and the dashboard suite as CI does or says clearly why it
cannot, without the test documentation growing past what readers can use.

**Scope:** The bounded retrospective correction of
plan 120 (recoverable at
`8de2d7f:.planning/slice-plans/120-explicit-test-environment/PLAN.md`) described in
[its correction plan](../slice-plans/127-test-environment-correction/PLAN.md).
It adds no feature promise.

## When to Surface

Now: first in the product backlog, per the maintainer on 2026-09-27.

## Breadcrumbs

- SEED-037's measurements and repairs are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`; the
  auto-maintenance repair is `bfdf893`.
- Finding ODF-061 in `DearDough.md` (Bash 3.2 passing a failing assertion).
- SEED-046 (the next CI verdict round) relies on this story for CI/local
  parity.
