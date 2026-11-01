# Bound local full-suite resource use

**Identity:** SEED-209#bound-local-test-resources
**Source:** [selected story](../../seeds/SEED-209-local-test-resources.md#bound-local-test-resources).

## Goal and scope

One local full repository or dashboard suite at a time across linked worktrees,
with two dashboard workers and four repository jobs by default. Keep CI defaults,
parallelism, selection and verdicts unchanged. Preserve explicit overrides,
focused checks, nested fixtures, exit status and interruption cleanup. No change
to dashboard proof-cost plan 432, test coverage, installed guidance or deployment.

## Existing solutions and decisions

PFE: `scripts/test.sh` already owns repository selection, process-group shutdown,
job overrides and CI environment normalization; extend that entry, not each job.
`dashboard/playwright.config.ts` is used by both npm and direct Playwright callers;
preserve that surface. `tests/helpers/copy-runner.bash` owns disposable runner
copies. Existing backlog/store locks guard short writes and do not coordinate
worktrees, track a whole process lifetime, or admit nested verification; they
cannot supply this gate. Add one narrowly scoped shared gate in `scripts/`.
The common Git directory supplies cross-worktree identity. Tests must use their
own repositories and never seize a production run's gate.

ADR 0010's [improvement policy](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires honest evaluation: prove admission and actual concurrency bounds; make
no unmeasured speedup or memory-saving claim. No product-wide architecture or
North Star decision changes. Existing global setup already builds once per run.

## Outside-in proof and workload choice

Use controlled short subprocess suites in real temporary linked worktrees to
observe entry order, release on success/failure/interruption/dead owner, focused
independence, nested ownership and independent repositories. Exercise both actual
repository and Playwright entry points. Observe actual default and explicit
concurrency; CI-mode runs bypass admission and retain CPU-derived defaults.
Test selection/listing and nested reporter fixtures must remain usable.

Local proof is focused runner regression checks, new admission tests, dashboard
runner/reporter fixtures, typecheck and the check-only staged lint hook. Full
1830-case browser runs are deferred to ordinary hosted CI: they do not improve
the controlled scheduling observation and would compete with neighboring work.
Changed synchronization requires three consecutive focused passes. No retries
to seek green; diagnose causal failures before rerunning.

## Ordered slices

### 1. Serialize local full suites and bound their default concurrency
Type: Behavior
Status: planned
Proof: Real linked-worktree subprocess runs observe mutually exclusive full
suites, independent focused checks, two/four defaults, explicit overrides,
nesting and lifecycle recovery, plus unchanged CI behavior; affected runner and
reporter regression families pass.

Behavior: A local full suite owns the repository-wide admission until all of its
work stops; another full suite waits without starting build/setup. Focused
commands and independent repositories remain usable. Nested suite fixtures
reuse the live outer admission. Success, failure and cancellation preserve their
status and free admission; a dead owner is recoverable. Apply the local worker
defaults while retaining existing CI policy. Keep ownership, detection and
lifecycle rules together and document the public commands and overrides.

## Current decisions

- Origin/integration: `/Users/terryyin/git/open-dough`; owned execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/local-test-resources`, created for this
  work on `codex/local-test-resources`, based on `c26577b5`.
- Story Branch Mode; origin main claim `82c0718eb037559040df7239d88f613725f2363d`;
  increments target `origin refs/heads/codex/local-test-resources`.
- One cohesive behavior slice; normal execution authority comes from the user's
  implementation request. Replanning remains allowed within that outcome.
- CI must not acquire the local gate. Focused/list-only invocations should not
  accidentally become full-suite owners. Existing nested fixtures need causal
  admission inheritance and must not deadlock or release the parent's gate.
- Do not narrow test coverage or alter production dashboard behavior.

## Learnings and preparation review

The source entry points and disposable-copy helper were inspected in the named
checkout's base. No remaining slice concern; refinement was unnecessary because
one proof loop covers the single local scheduling policy and its lifecycle.
