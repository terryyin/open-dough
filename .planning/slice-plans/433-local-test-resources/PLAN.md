# Bound local full-suite resource use

**Identity:** SEED-209#bound-local-test-resources
**Source:** [selected story](../../seeds/SEED-209-local-test-resources.md#bound-local-test-resources).
**Source review:** [independent commitments](source-review.md).

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
Status: done
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

## Execution complete

Product advice: no change. Existing dashboard proof-cost plan 432 owns the
separate reduction of redundant test work. The requested local defaults and
admission are implemented; subsequent real use can inform tuning, with no
unmeasured elapsed-time or memory-saving claim.

Retrospective: original instruction, source commitments, aggregate implementation
`4aaad6fda20b5d7d879bfcdcf70c457d6d3f8639`, current code and maintained guides agree.
Claim/preparation commits are provenance, not implementation; neighboring
stories' commits are excluded. Whole-concept review found no residual correction
or new product decision. Available coordinator/delegation history was reviewed;
mechanical lint/whitespace repairs and preparation recovery were settled, with
no new supported process response requiring a finding. Planning is unchanged.
Hosted CI for the implementation remains pending until the completion receipt.

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

## Accepted proof

The implementation owner observed terminal exit 0 for three consecutive final
`PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/local-test-suite.test.mjs`
runs (11 scenarios each; `/tmp/dough-local-suite-final-{1,2,3}.log`). The real
temporary Git worktrees and observing assertions cover all source-review rows,
including predecessor liveness at entry, simultaneous reclaimers, killed
reclaimers, queued cancellation and nested runs in different timezones.

Eight existing runner consumers passed:
`PATH=/opt/homebrew/bin:$PATH npm test -- tests/test-runner-selection.sh tests/test-runner-ci-environment.sh tests/test-runner-interrupt.sh tests/test-runner-bash.sh tests/test-runner-failure-report.sh tests/test-runner-split.sh tests/test-runner-budget.sh tests/test-runner-github-requests.sh`.
Log: `/tmp/dough-local-runner-regression.log`.

`PATH=/opt/homebrew/bin:$PATH env -u CI -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-local-dashboard-reporters-proof.json npm run --silent test:dashboard -- quiet-reporter.spec.ts boundary/proof-record-entry.spec.ts boundary/dashboard-scheduling.spec.ts boundary/spec-times.spec.ts --workers=2`
passed strict 14/14, zero skipped: 6 quiet-reporter, 2 actual config/npm entry,
1 scheduling and 5 spec-times cases. Coordinator inspected selected tests,
setup and attempts in that JSON and relevant source. The same environment with
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-local-dashboard-lifetime-proof.json npm run --silent test:dashboard -- boundary/run-processes.spec.ts --workers=2`
passed strict 4/4 for actual global setup/teardown, timeouts and survivor cleanup.
Consumer traces and individual dispositions are retained outside Git in
`/tmp/dough-local-test-consumer-trace.md` and its `-workers.md` companion.

No full suite was launched locally. Linux gate execution remains a hosted-CI
observation; the local Docker daemon is unavailable, and the implementation uses
the existing dashboard `/proc` pattern. Actual local admission and concurrency
were observed; elapsed-time and memory improvement remain unmeasured.

Independent refactoring extracted process observation, dashboard selection,
controlled fixture construction and lifecycle scenarios without changing their
bodies, and gave the resource policy one maintained document. The final command
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- tests/support/local-test-suite.test.mjs tests/support/local-test-suite-lifecycle.test.mjs tests/test-runner-bash.sh`
passed all 11 preserved scenarios and the actual copied-runner consumer;
`/tmp/dough-local-refactor-final-proof.log` retains its quiet output. The source
comparison and observing locations above remain valid, with lifecycle cases now
in their separate file. `git diff --check` passed. Refactor consumer dispositions:
`/tmp/dough-local-refactor-consumer-trace.md`.

The first hosted run `41262408074/1` failed five dashboard shards on obsolete
project-radio selectors: ad-hoc sessions, workspace retirement, terminal Done,
terminal lifetime and sidebar navigation. The unchanged failing source and
published repair `62defee536b8154291ac114f5b266f8ade35631d` establish the existing
UI-control transition as the cause; no local admission executes in CI. The repair
was already on main under another owner, so this execution preserved it by
merging published main at `0d0a20a249a81925ba6969fcf3e6e4cb9023a929`, with no
duplicate test repair. All 13 cases in those five files passed strict verification:
`PATH=/opt/homebrew/bin:$PATH env -u CI -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-local-upstream-repair-proof.json npm run --silent test:dashboard -- agent-launch-ad-hoc-sessions.spec.ts session-workspace-retirement.spec.ts agent-terminal-done-question.spec.ts agent-terminal-lifetime.spec.ts sessions-sidebar-navigation-cases.spec.ts --workers=2`.
The resource implementation and its accepted proof remain unchanged. Hosted
validation continues on the merged revision rather than rerunning the old code.
