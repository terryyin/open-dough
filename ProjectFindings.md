# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-10-03 against `99292557`. Frequency counts distinct
executions, not commands, retries, or repairs.

## Priority assessment

1. **Tests whose verdict depends on timing or machine load — first, not
   queued.** Four executions (plans 160, 186, 187, 189) with four failed CI
   runs, each stopping slices for a stash, diagnosis, repair, and publication
   cycle, plus local full-selection failures that cost a diagnosis without a
   cause. One failure (`agent-launch-start-taken.spec.ts:53`) is still
   unexplained.
   Shared test support now drains intercepted reads, settles the page, and
   orders the cross-server lock fault after its event, and the ad hoc Cursor
   start spec rereads its kept record until acceptance is saved (`aeb9c33d`;
   DD-195, DD-199).
2. **Checks whose result depends on where or how they are run — second,
   queued.** Seven executions (plans 140, 147, 157, 160, 185, 217, 228), the
   most frequent group. None reached CI: each cost a failed local run, a diagnosis,
   or a rerun. Four of the six share one cause, a repository root taken from
   the working directory (DD-168, DD-178, DD-194), and each fix is small.
   Story:
   [Run a check from any directory and get CI's result](.planning/seeds/SEED-093-local-checks-agree-with-ci.md#checks-run-from-any-directory)
   (DD-168, DD-178, DD-194). DD-220, a dashboard-launched session inheriting
   the deployment's `NODE_ENV` and tools, cost one reinstall; its fix belongs
   in the launch environment.
3. **Local proof that leaves out what another CI job checks — third, not
   queued.** Four executions (plans 146, 165, 190, 191) with five failed CI
   runs. DD-171 recurred in plan 191 with the same error in the same file as
   plan 146. CI history from 2026-09-29 to 2026-10-03 shows these causes in
   only about three of 122 failed runs (DD-171, DD-187, DD-197).
4. **Native host runs and observations routed through the developer — low,
   not queued.** Three executions with a cost (plans 139, 150, 191) and one
   where the agent found a free route itself (plan 152). The cost is a few
   developer round trips, and some of that friction is intended while paid
   native runs stay manual-only. DD-205 records a practice that removed the
   babysitting once the developer authorized the run.
5. **Native observation drivers that act without checking host state — low,
   not queued.** One execution (plan 192), two findings, both repaired in that
   run.
6. **Behavior audits that miss guidance-directed actions (DD-113) — low, not
   queued.** One execution; plan 121 (`178e0346`) corrected its missed merge,
   and no recurrence is recorded.
7. **Layout proof that checks arrangement but not usable content (DD-184) —
   low, not queued.** One execution, fixed one slice later.

Resolved and removed on 2026-10-03, each confirmed at `99292557`
(recovery: `99292557:ProjectFindings.md` and `99292557:DearDough.md`):

- DD-160 (a counterexample removed two signals at once) and DD-175 (a loosened
  assessor accepted on its old counterexamples): the counterexample helper
  refuses a case whose change spans two signals, and the remaining-gaps
  correction closed with all five slices done (story and plan recoverable from
  `b6a3ac18:.planning/seeds/SEED-055-trustworthy-project-proof.md` and
  `b6a3ac18:.planning/slice-plans/168-assessor-counterexample-gaps/PLAN.md`).
  No later execution records an assessor verdict that differed from what the
  native agent did.
- DD-204 (the Codex native harness's `--ephemeral` broke cases whose agent
  spawns a subagent; moved from DearDough.md in this review):
  `tests/support/native-codex.sh` no longer passes `--ephemeral` (`671b8ff4`).
- The lint half of DD-178 and DD-194 (a stray git-ignored `dist` build failed
  `npm run format`): `scripts/lint.mjs` lists files through
  `git ls-files --exclude-standard`, so ignored build output is not linted.
  Their working-directory half stays open below.

Earlier removals: DD-114, DD-164, DD-166 (2026-09-29, recovery
`d68fcde4:ProjectFindings.md`); DD-158 (2026-09-29, recovery
`3f0f1ad3:ProjectFindings.md`); DD-179 (2026-09-30, recovery
`34ceff06:ProjectFindings.md`). DD-155 and DD-159 were returned to
DearDough.md on 2026-09-29.

## Tests whose verdict depends on timing or machine load (first priority, not queued)

A test in this repository should give the same verdict on a loaded developer
machine, an idle one, and CI's runner. Each finding below is a test that
raced: it passed in ordinary local runs and failed under CI's load, or failed
locally under load and passed in isolation. Every identified race was repaired
in its own execution, so what stays open is the class. New races keep arriving
one failed CI run at a time, and test repairs of the same shape continued after
these records (`02cd7e86`, `c35ce6f8`, `1af1db40`).

CI history from 2026-09-29 to 2026-10-03 (122 failed runs of 600, 85 of them
in the `dashboard` job) agrees: five dashboard specs failed on three to five
unrelated branches each without failing on trunk, about 25 runs. DD-186's
mailbox race was repaired in the published `ci-mailbox-worker-process.mjs`,
so that half was a product defect; its test and the other findings here are
this repository's own.

### DD-186 — Two timing races passed every local run and failed only under CI's load, each on a trunk-merge revision

A CI mailbox completion confirmed shutdown while its exiting worker showed a
bare `[node]` command, and the dev-mode overview spec counted a second
`commits/main` lookup from StrictMode's aborted first read. Neither reproduced
in unthrottled local runs; each needed an in-run repair.

#### Occurrences

- Execution: `SEED-052#card-session-residue` / plan 160, first related implementation commit `26099a6a`
  - Timestamp: CI failures on `f5f4dce6` (2026-09-29T19:51:19+08:00) and `d83bb839` (2026-09-29T21:56:22+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: runs 36564344723 (`'unknown' !== 'dead'`, repaired in `4e0b2420`) and 36578884226 (`expectPinnedGhCalls` at `catalogProjectRecords.ts:107`, repaired in `bb5ee6a1`); red reproductions needed a stub `process.title` and CDP CPU throttling; 48 local runs under 16 `yes` processes passed.
  - Observed effect: two stash, diagnose, repair, publish, and restore cycles, with slices paused.
  - Inference: Qualified. Timing-sensitive proof here needs a deliberate slow-path reproduction; plain local load did not expose either race.

### DD-195 — Full-selection local runs flaked in existing specs that passed isolated and in CI

Across one execution, three large parallel Playwright selections each failed one existing spec that the change did not touch; each passed on isolated rerun and CI stayed green.

#### Occurrences

- Execution: `SEED-052#script-refinement-preparation` / plan 186, first related implementation commit `a94806d1`
  - Timestamp: unknown (session date 2026-09-30; slices 3, 6 and 7)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: unknown
  - Evidence: slice 3 selection (234 specs) failed `agent-launch-card-delete.spec.ts:51`, then passed 24 of 24 isolated repeats; slice 6 selection failed it again and passed with the preparation specs; slice 7 selection failed `agent-launch-start-taken.spec.ts:53` ("server could not be reached") and passed on rerun; CI runs `a3c3ea29`, `a9623112`, `d8d42ef6`, `38d53df9`, `7bf821a4`, `ac880042` succeeded.
  - Observed effect: each failure cost a bounded diagnosis (rerun, read of the spec's dependence on start code) without a cause found.
  - Inference: Qualified. A read-only review found neither spec using the new shared progress or kept-start code, so load on a machine running other workloads is plausible; not reproduced. Flakiness is a defect even when a rerun passes, so the cause stays open.
- Execution: `SEED-065#warning-free-lint` / plan 187, CI repair commit `6a8d3608`
  - Timestamp: 2026-09-30T20:09:39+08:00 (failing CI job's log time)
  - Tool: Claude Code (coordinator and delegated agent)
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.50
  - Evidence: CI run 36712853079, job "dashboard (1/2)", on `96838533` failed `agent-launch-card-delete.spec.ts:51` (`cardTop` expected 507.8125, received 586.71875). The run's Playwright trace shows `settled()` in `dashboard/tests/storyStagesPage.ts` passing right after `page.reload()`, before any card rendered, and preparation facts arriving after `before` was measured; a route delay reproduced the exact values. Repair `6a8d3608` makes `settled()` wait for a card first; `--repeat-each=10` and the 18 specs using the helper pass.
  - Observed effect: one failed CI job, one diagnosis, and one repair commit.
  - Inference: A cause is now evidenced for the `agent-launch-card-delete.spec.ts:51` failures above: a test-helper race that load widens, not product behavior. `agent-launch-start-taken.spec.ts:53` is not explained by it.
- Refinement check: `SEED-093#expose-timing-races-locally`
  - Timestamp: 2026-10-03
  - Evidence: a survey of 126 failed CI runs from 2026-09-29 to 2026-10-03 found no "server could not be reached" failure of `agent-launch-start-taken.spec.ts:53`; its one CI failure (run 36750057215) came from its branch's added `host` field.
  - Inference: The local failure has not recurred and its cause is left to recur here. It is outside that story's scope.
- Execution: `SEED-093#expose-timing-races-locally` / plan 233, first related implementation commit `7b6ddcce`
  - Timestamp: 2026-10-03, before commit `7b6ddcce` (2026-10-03T17:53:24+08:00)
  - Tool: Claude Code (coordinator and delegated agent)
  - Model: claude-opus-5-5
  - Evidence: one full `npm run test:dashboard` at load average about 72 gave 966 passed, 6 failed. The failures were `agent-completion-binding.spec.ts:30` (4 cases), `agent-completion-attention.spec.ts:20`, and `agent-completion-early-recovery.spec.ts:24`. Each was an `expect.poll` on `claudeLaunchCalls().length` that still saw 0 after the default 5 s, in the test body, among the run's first tests. The same 6 passed at load about 20.
  - Observed effect: one bounded diagnosis. The slice was accepted with these failures reported as outside its scope.
  - Inference: Qualified. Slowness under heavy load, not an ordering race found in the spec. Lengthening the wait is excluded by the race story's repair method, and a slow-path detector remains deferred, so the cause stays open here.

### DD-199 — Recovery failure setup used a deadline before establishing accepted input

Former branch-local code: DD-197; reassigned after concurrent trunk allocation of DD-197.

The lost-acknowledgment setup let a short launch deadline disconnect the native substitute without first observing that it accepted the input. An equality between two absent records could pass and conceal the missing precondition. This differs from ODF-067's fixture-computed Git refusal: the operation was attempted here, but its required intermediate event was unproved.

Proposal from the review: For a fault injected after a native event, observe that event before triggering the fault; keep negative-history and no-resend assertions. No guidance change is authorized by this review.

#### Occurrences

- Execution: `SEED-052#start-codex-refinement-from-dashboard` / plan 189, first related implementation commit `05f3e4a9fa018eba5be122b729f5b78f0e4cce70`
  - Timestamp: unknown (2026-10-01 resumed execution; CI run36790537801/attempt1)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: CI job110142132390 failed the negative-history test from `3dbb1f77`; fresh repair baseline with original100ms plus explicit `native.history.length === 1` failed expected1/received0. Repair agent `ci_recovery_setup_repair` terminal report/PTY80979 and published `3fdae6f201941ff239bc24a2788590bdf25e88d7` changed both100/250ms setups to await held input acceptance before disconnecting and assert durable uncertainty/ID. [Recovered slice5 proof](https://github.com/terryyin/open-dough/blob/719a5ef8525788bd7d9288cff8f97c76bf1f5b6b/.planning/slice-plans/189-start-codex-refinement-from-dashboard/PLAN.md) retains the exact command; production unchanged.
  - Observed effect: One owned repair commit and a pause in native acceptance; all five selected repair tests passed afterward. The original no-resend and history/status assertions remained.
  - Inference: Event-based setup supplies causal evidence that elapsed time alone did not. Cost beyond this repair is unmeasured; native pause also included a separate acceptance-wording correction.

### DD-222 — Two dashboard specs raced a page read under CI load, and launch-card waits miss under local load

`agent-launch-ad-hoc-cursor.spec.ts` assumed the auto-opened terminal panel joined the launch client within the detached idle watch's 203 ms, while the default fake Cursor looked idle at once. `responsive-session-reconciliation.spec.ts` moved the origin before the page's one fresh read after a stale snapshot. Both passed locally and failed in CI. Separately, launch-card specs wait the default 5 s for text that a real start or publish can take longer to produce under heavy local load.

#### Occurrences

- Execution: `SEED-091#dashboard-frame-renovation` / plan 230, first related implementation commit `fdcc45f6`
  - Timestamp: 2026-10-03T15:48:39+08:00 (first failing CI log line, run 37107532924)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION` at claim `bb9cda47`)
  - Evidence: CI runs 37107532924 and 37109262826 (`dashboard (5/9)`) failed `agent-launch-ad-hoc-cursor.spec.ts:138` with two attaches; an unchanged copy failed 13 of 25 under local load and a held page connection failed 5 of 5; repair `aeb9c33d` shares a working fake Cursor fixture. CI run 37111699644 (`dashboard (2/9)`) failed `responsive-session-reconciliation.spec.ts:135` with one extra compare; a probe forcing the CI order failed 4 of 4, also at `aeb9c33d`; repair `a25a762f`, re-fixed for main's paused-clock flow in merge `5f09513c`. The launch-card specs `agent-launch-cursor-model`, `agent-launch-preparation-{codex,cursor,kept}` and `agent-launch-start-{codex,cursor,taken}` failed 7 times in one full local run under load and 18 of 40 at `--repeat-each 4 --workers 16`, passing at `--workers 2`; not seen in CI.
  - Observed effect: three failed CI runs and two repair commits; the launch-card waits remain unrepaired.
  - Inference: Qualified. Both repaired races are DD-199's shape: a fault or state change triggered before a required page event was observed. The launch-card waits use the default expect timeout where the specs already allow a 30 s launch.

## Checks whose result depends on where or how they are run (second priority, queued)

This repository's checks should give CI's result however they are run
locally: directly or through `scripts/test.sh`, from any directory, and under
an agent's non-interactive shell. Each finding below is a local run whose
result or output depended on how it was started.

DD-168, DD-178, and DD-194 share one cause: a test takes the repository root
from `process.cwd()`. It is still present in
`ci-mailbox-complete-unresolved-cases.mjs`,
`ci-mailbox-complete-exit-cases.mjs`, `dashboard/tests/support/dashboardServer.ts`,
and `dashboard/tests/support/fixtureExecutable.ts`.

**Follow-up:** queued second:
[Run a check from any directory and get CI's result](.planning/seeds/SEED-093-local-checks-agree-with-ci.md#checks-run-from-any-directory) (DD-168,
DD-178, DD-194). DD-162 and DD-216 have other causes, so it leaves them open.

### DD-162 — A shell check run directly failed locally because its substitute host resolved macOS Bash 3.2

`tests/README.md` requires Bash 5 first on `PATH` and running checks through
`scripts/test.sh`, whose guard refuses Bash 3.2. A direct
`/opt/homebrew/bin/bash tests/git-publication-native.sh` bypassed that guard;
its substitute `claude` host (`#!/usr/bin/env bash`) resolved `/bin/bash` 3.2
and aborted on an empty-array expansion under `set -u`.

#### Occurrences

- Execution: `SEED-008#same-machine-merge-queue` / plan 140, first related implementation commit `9597bf61`
  - Timestamp: unknown (slice 1 return, before `9597bf61` at 2026-09-28T12:45:56+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 1 return reported `substitute claude one-shot-result exited 1 … stream-status: missing`, identical at claim `5a5087c6`; `native-agent-one-shot.sh` line 35 `named[@]: unbound variable` under `/bin/bash`; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh` passed.
  - Observed effect: one diagnosis agent (about 66k tokens) spent on a failure CI never had.
  - Inference: Qualified. The coordinator's delegation prompt prescribed the direct absolute-Bash run; later prompts named `scripts/test.sh` with Homebrew Bash first on `PATH` and saw no recurrence.

### DD-168 — A CI-mailbox test fails when run from `src/skills`, passing only from the repository root

`ci-mailbox-complete-unresolved-cases.mjs:180` ("unconfirmed shutdown names the
limitation…") builds its mailbox with `root: process.cwd()`, so running it from
another directory reports "CI mailbox belongs to another checkout".

#### Occurrences

- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559`
  - Timestamp: unknown (slice 1 refactor pass, before `cb066559` at 2026-09-29)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 1 refactor report: fails on every run from `src/skills`, 23/23 from the checkout root; slice 1's delegated proof command was phrased "from `src/skills`".
  - Observed effect: no delivery impact; a focused run from `src/skills` would show a false failure.
  - Inference: Qualified. Deriving the root from the test file's location would give the same result from any directory, as CI does.
- Execution: `SEED-052#card-session-residue` / plan 160, first related implementation commit `26099a6a`
  - Timestamp: unknown (CI repair refactor pass before `4e0b2420` at 2026-09-29T20:04:43+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: refactor report: `node --test ci-mailbox-complete.test.mjs` from `scripts/` fails an unresolved case with "belongs to another checkout"; the retrospective reviewer saw the same; both passed from the root.
  - Observed effect: no delivery impact; two agents spent a run confirming the directory dependence.

### DD-178 — The dashboard Playwright suite resolves its repository root from the working directory, and a run elsewhere leaves a build that breaks lint

`dashboard/tests/support/dashboardServer.ts:32` and
`support/fixtureExecutable.ts:12` take the repository root from
`process.cwd()`. A run from `dashboard/tests` fails with ENOENT on the fake
`gh`/`claude`, and its global setup has already built the app into
`dashboard/tests/dashboard/dist`, which `.gitignore` hides but `npm run format`
lints (4,779 `no-undef` errors).

#### Occurrences

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`
  - Timestamp: unknown (slice 2 implementation, before `08f217af` at 2026-09-29T17:35:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: slice 2 implementer's report ("runs from `dashboard/tests` fail with ENOENT"); the coordinator's formatter failed on `dashboard/tests/dashboard/dist/assets/index-D2jPgcZa.js` and passed after removing that directory.
  - Observed effect: one failed formatter run and a diagnosis; nothing published.
  - Inference: Qualified. Same class as DD-168; deriving the root from the file's location would make every directory behave like CI.

### DD-194 — A plan's literal focused proof command failed from its stated directory and left build output that broke the format gate

A plan wrote its focused Playwright command as `cd dashboard && npx playwright test tests/…`, but the dashboard fixtures copy `src/skills/…` relative to the current directory, so the command only works from the workspace root. Its first run also built `dashboard/dashboard/dist`, which the lint step then scanned.

#### Occurrences

- Execution: `SEED-061#select-refinement-options-from-dashboard` / plan 185, first related implementation commit `06c65127`
  - Timestamp: 2026-09-30T18:19:53+08:00 (slice 1, before commit `06c65127`)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.49
  - Evidence: plan 185 "Outside-in proof" focused run and the slice 1 delegation both gave `cd dashboard && npx playwright test tests/agent-launch-start.spec.ts …`; the slice 1 agent's report says it failed in test setup and reran from the workspace root; the coordinator's next `npm run format` then reported 4812 eslint errors, all in `dashboard/dashboard/dist/assets/index-*.js` (git-ignored, but linted), cleared by deleting `dashboard/dashboard`. Plan 185 "Decisive premises" lists nine observed premises and none is the focused command.
  - Observed effect: one failed proof run, one failed format run, and a diagnosis round before the first commit; later delegations carried the corrected root-based command.
  - Inference: Qualified. The plan's command was taken from earlier plans' form rather than run once when planned; a premise check of the literal proof command would have caught it. The lint scanning ignored build output is a separate repository quirk and is not attributed to guidance.

### DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

The plan's focused Playwright commands used the default reporter. Under the agents' shell, a passing run printed no summary, and two agents reran the same selection with `--reporter` just to report counts.

#### Occurrences

- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62`
  - Timestamp: unknown (slice 1 implementation and refactor, between the claim at 2026-10-02T16:31:54+08:00 and `7053bc62` at 16:42:11+08:00)
  - Tool: Cursor (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: plan 217 slice 1 proof is `env -u NO_COLOR npm run test:dashboard -- … --workers=2` with no reporter. The slice 1 implementer reported "The run exited 0 but printed no summary, so I'm rerunning with the list reporter" (41 passed). The slice 1 refactor agent reported "The test run exited 0 but printed no pass count, so I'm rerunning it with the line reporter" (30 passed). From slice 2 the coordinator added `--reporter=line` to delegated commands, and there were no further count reruns.
  - Observed effect: two extra Playwright runs of 30–41 tests each.
  - Inference: Qualified. Diagnosed at refinement on 2026-10-03: the dashboard's quiet reporter (`dashboard/playwright.config.ts`) and the Node runner print nothing on a passing run by design; the shell was not the cause.

### DD-220 — A session the dashboard launches inherits its deployment's `NODE_ENV=production` and tools, so checkout preparation installs no dev dependencies and still passes

An agent session the Open Dough dashboard launched inherited
`NODE_ENV=production`, and its `PATH` reached the dashboard deployment's
`node_modules/.bin`. In the execution worktree, `npm ci` exited 0 having
installed nothing ("audited 1 package"). `npm run typecheck:dashboard` then
passed anyway, using the deployment's `tsc`. The readiness gate's project
command therefore passed without the checkout's locked dev dependencies.

#### Occurrences

- Execution: `SEED-088#prove-landed-slices-leave-the-review` / plan 228, first related implementation commit `1967ed3f`
  - Timestamp: 2026-10-03T14:50:00+08:00 (checkout setup after Take `230e6b02` at 14:48:28+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.55 (this repository's installed copy)
  - Evidence: `echo $NODE_ENV` printed `production`; `npm config get omit` printed `dev`; `which tsc` resolved to `~/.open-dough/dashboard/deployments/28cf3da8bc53-d7306v/node_modules/.bin/tsc`; `node_modules/.bin/tsc` was absent from the worktree. `NODE_ENV=development npm ci --include=dev` installed the locked tools, and the checks passed from them.
  - Observed effect: the coordinator caught it only by checking for the worktree's own `tsc` after the cheap check passed, at a cost of one reinstall. Every later npm and npx command needed `NODE_ENV=development`.
  - Inference: Qualified. The dashboard deployment runs under `npm run preview:dashboard` (`dashboard/server/productionDeployment.mjs`), and its terminal spawns appear to pass no `env`, so a launched host inherits the server's environment. Proof run with the deployment's tool versions can differ from CI's. This sits close to ODF-087 (a readiness check passing on a substitute), but here the cause and fix are in the dashboard's launch environment.

## Local proof that leaves out what another CI job checks (third priority, not queued)

A change proved locally should not fail a CI job for a reason the local proof
never exercised. Each finding below passed its focused local proof and failed
a different CI job: the dashboard's type check of a skill test fixture, the
Linux `test` job's tools and Git build, and a pipeline that only the Ubuntu
runner lost to SIGPIPE.

DD-171's cause matches published ODF-003 and ODF-150, tracked in
[DearDough.md](DearDough.md); this group keeps its project facet, the
dashboard's typed import of a skill test fixture, which no local gate checks.
The pre-commit hook runs lint only.

### DD-171 — A Land test-fixture signature change failed only the dashboard's TypeScript check

`dashboard/tests/preparingJourney.ts` imports `landWorktree` from
`src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs`, so the
dashboard's `tsc --build` types that JavaScript fixture from its destructuring
defaults. Slice 1 added a required-looking `identity` parameter; the focused
Node suites passed and only CI's `dashboard` job failed.

#### Occurrences

- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`
  - Timestamp: 2026-09-29T09:20:42+08:00 (`aa4fd510`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: CI run `36507473752` job `dashboard (1/2)`: TS2345 at `preparingJourney.ts(88,38)`; repair `de81cb96` (`identity = undefined`), then `npm run typecheck:dashboard` and `backlog-preparing.spec.ts` passed.
  - Observed effect: one red CI run, a repair stash cycle, and one repair commit.
  - Inference: Qualified. A consumer search limited to `src/skills` misses the dashboard's typed imports; running `npm run typecheck:dashboard` when a shared fixture's signature changes would catch it locally.
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5`
  - Timestamp: 2026-10-01T03:16:46Z (CI run 36809768647)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Evidence: slice 5 changed `landWorktree`'s destructured parameters in `dough-land-test-fixtures.mjs`; its proof never ran `npm run typecheck:dashboard`, and `dashboard/tests/preparingJourney.ts` failed with TS2345 again; repair `716c933b`. Recorded in DearDough.md DD-191's plan 191 row, which keeps the delegation facet.
  - Observed effect: one red CI run and a stash-protocol repair cycle; the same file and error as plan 146.

### DD-197 — New tests that run tools and Git passed on macOS and failed on CI's Linux test job

Two of the four commits published for one execution failed CI's `test` job for environment reasons that macOS runs could not show; the plan named the Linux container proof only for its last slice.

#### Occurrences

- Execution: `SEED-065#pre-commit-lint-hook` / plan 190, first related implementation commit `42437c58` - Timestamp: 2026-09-30T22:03:00+08:00 (CI runs 36725631259 on `42437c58` and 36726848028 on `0e6e2bbe`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.51 - Evidence: `42437c58` failed `test (2/2)`: the clean-`.sh` hook test staged a shell file and `shfmt: spawnSync shfmt ENOENT` refused the commit, because only CI's `lint` job installs shellcheck and shfmt; repair `6be8fccc` (skip when either tool is absent). `0e6e2bbe` failed `test (2/2)` with `fatal: cannot use /dev/stdin as an exclude file`, Git on Linux rejecting the piped `--exclude-from=/dev/stdin` that slice 1's own `--staged` code introduced (slice 2 spread it to the ESLint list); repaired inside slice 3's commit `8a165806` after that slice's agent ran `scripts/ci-container.sh` and saw six hook tests fail. The plan's slice 1 and 2 proof commands were local `node --test` runs; `scripts/ci-container.sh` appears only in slice 3's proof. Slice 1's report said existing tests "don't skip either" for missing shell tools, which held for their `.mjs`-only fixtures but was not checked against the CI job's tools.
  - Observed effect: two failed CI runs, one dedicated repair commit and one repair folded into a slice commit, and one CI-repair stash of finished slice 2 work; the dedicated repair skipped its own refactor pass.
  - Inference: Qualified. Tests that spawn Git or lint tools depend on the runner's tools and Git build, and the plan only proved them under CI's conditions at its final slice. Running the container proof for any slice that adds such tests would have surfaced both failures before publication; this run's one container run took the agent a few minutes.

### DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE

The startup observer read `claim-owned` from `git log --format=%B … | grep -Fq`
in a suite run under `set -euo pipefail`. When `grep -q` matched and exited
while git was still writing, git died of SIGPIPE (141) and `pipefail` turned
the match into `claim-owned: false`. macOS usually let git finish first; the
Ubuntu runner did not.

#### Occurrences

- Execution: `SEED-055#assessor-counterexample-discipline` / plan 165, first related implementation commit `84b4f28f`
  - Timestamp: 2026-09-29T15:40:33Z (CI failure on `00cc1b62`)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: CI run 36591803631 `test (1/2)`: `FAIL: counterexample command-only (signal setup-marker) changes signals remote-claim, setup-marker (fields claim-owned, …)`; local `tests/git-publication-native.sh` passed. A repro with one extra commit under the claim gave `claim-owned: false` with `PIPESTATUS` `141 0`. Repaired in `66f96e34`; slice 7 (`abf2fc4f`) fixed three more observer derivations of the same shape.
  - Observed effect: one CI repair cycle (pause, stash, diagnosis agent, refactor pass, publication) during slice 6.
  - Inference: Qualified. A different mechanism from DD-186's load-dependent races. The new counterexample helper made the flip visible: it refuses a case whose change spans two signals, where the old primitive only checked the verdict. Other `producer | grep -q` pipelines under `pipefail` remain in `tests/support/product-backlog-native-use.sh` and `tests/helpers/product-backlog-payload-runtime.bash`.

## Native host runs and observations routed through the developer (low priority, not queued)

Paid native runs are manual-only in this repository (`tests/README.md`). Plans
and coordinators have then sent to the developer runs or observations the agent
could start itself, or whose approval did not reach the host's permission check.

### DD-161 — The developer's approval of paid runs did not let the coordinator start them

Paid native runs are manual-only and need the developer's go-ahead. On Claude
Code in auto mode, the host's permission check refused the coordinator's
native run after the developer approved all planned runs. The developer then
had to request the run explicitly.

#### Occurrences

- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (slice 2 start, after "approve all"); exact time unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: the coordinator conversation: "approve all" → `tests/git-publication-native.sh --native claude` refused by the host's auto-mode classifier as agent creation. Run 1 started once the developer sent the command as a message; run 2 on "run 2".
  - Observed effect: two extra developer round trips before paid runs started.
  - Inference: Qualified. The request for go-ahead could offer the exact command, or the permission rule, the developer can use, instead of assuming approval lets the coordinator launch it.

### DD-169 — A plan handed a read-only `claude attach` probe to the developer, who expected the agent to run it

Plan 150 slice 3 said to ask Terry to run `claude attach` on a finished
session. Asked, he replied "why cannot you just do it by yourself?". The
coordinator then tried it in a pseudo-terminal and auto mode denied it, so
Terry ran it after all.

#### Occurrences

- Execution: `SEED-052#revisit-dashboard-sessions` / plan 150, first related implementation commit `5933bb9178a503409b9574f9b87207cbf5f8fbb5`
  - Timestamp: unknown (slice 3 start, between `29174888` at 2026-09-29T11:30:06+08:00 and `f332b5dd` at 11:44:42+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Evidence: plan 150 slice 3 ("Ask Terry to run `claude attach <id>`"); two questions to Terry; auto-mode denial of the pty attempt; recorded answer in plan 150 slice 3 Accepted.
  - Observed effect: two question rounds and one denied command; no delivery impact, since the implementation kept the rule behind one predicate meanwhile.
  - Inference: Qualified. Planning did not say who may run an interactive native-host observation, or whether this session's permissions allow it.

### DD-173 — A plan left a "paid" probe to the developer that the agent could run at no cost

Plan 152 slice 1 said only Terry could run the PTY attach/rename probe because starting a session costs model usage. The executing agent started a background session with no prompt (`claude --bg -n …`, "idle — send a prompt to start"), which runs no model turn, and ran the whole probe itself.

#### Occurrences

- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, first related commit `e8553f8d`
  - Timestamp: 2026-09-29T12:49:01+08:00 (probe record `e8553f8d`)
  - Tool: Claude Code; Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd`
  - Evidence: plan 152 slice 1 as refined in `19c7e82b` versus its recorded observations in `e8553f8d`; the observation also found an unplanned fact (attaching a stopped session wakes it).
  - Observed effect: no developer wait for the probe; the busy-session rename, which does need a model turn, stayed unobserved and bounded by the plan's fallback.
  - Inference: Practice. Planning assumed a cost without checking a zero-cost route for the observation.

### DD-205 — Developer-requested paid native runs needed a detached one-command launcher

Former branch-local code: DD-202; reassigned after concurrent trunk allocation of DD-202.

Paid native acceptance takes minutes per case. The coordinator's first background launch was refused by the host's auto-mode classifier; the developer's `!` command stopped at the prompt's 120-second foreground limit and moved to a 30-minute background cap, and long command lines were hard to copy from the session window. A short script that detached the batch (`nohup … &`) and logged to one file, followed with a log monitor, ran 27 sessions without further intervention once the developer explicitly authorized the coordinator.

Proposal from the review: Practice worth keeping; no guidance change authorized.

#### Occurrences

- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5`
  - Timestamp: unknown (slice 3 probe after `d6301c9e` at 2026-10-01T10:20:17+08:00; slice 8 batch logged 05:2x–06:19:35Z)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `0d565a9e`; base 0.3.51
  - Evidence: the classifier denial ("Create Unsafe Agents") of the coordinator's backgrounded `tests/git-publication-native.sh --native claude` after the developer asked "could you please do it?"; the developer's reply "this window is weird. I cannot copy"; the `! bash …/probe.sh` run moved to background at 120s; after "I authorize you to do them", `probe8.sh` detached the 27-session batch and a `tail -F | grep` monitor reported each verdict.
  - Observed effect: one stopped background run, an extra developer round trip, and a second script; afterwards no polling or babysitting.
  - Inference: Qualified. Host permission behavior is outside Open Dough; the detached launcher plus monitor is the reusable part.

## Native observation drivers that act without checking host state (low priority, not queued)

Observation of a real host through this repository's dashboard fixtures sends
keys and starts servers on the developer's machine. Each finding below is a
driver step that assumed the host's state instead of reading it.

### DD-202 — Interrupted proof commands left preview servers outside the cleanup check

Manually stopped browser proof commands left their preview children alive. A process-name check for the disposable fixture missed them because their argv named the shared dashboard dist directory rather than that fixture.

Proposal from the review: Retain owned server process identities through cancellation and verify child exit; a matching-name absence does not establish resource cleanup. This review authorizes no guidance change.

#### Occurrences

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: unknown (2026-10-01 root proof acceptance after native waiting return)
  - Tool: Codex
  - Open Dough release: unknown; observation fixture installed real 0.3.51
  - Evidence: implementation return claimed no fixture server remained after interrupted commands. Root ps found PIDs28944/59938; lsof matched ports64224/64536 exactly to native harness server-start records. Root sent SIGTERM only to those owned preview servers and confirmed both absent with a finite local wait. Attachment PIDs29121/60036/77698 were also independently absent. [Cleanup account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/WAITING.md#command-outcomes-and-cleanup).
  - Observed effect: two orphan preview servers survived the returned cleanup check; root closed them before acceptance/disposal. Shared daemon and CI observer were untouched.
  - Inference: subprocess cancellation bypassed normal finally cleanup; the report's name-based process filter hid the remaining children. No general native PTY-exit claim follows from this server cleanup.

### DD-203 — An unconditional native UI Escape interrupted a restored question

Former branch-local code: DD-201 at `fff70ca7d0290331878353c7d371f1eecb0f1232:DearDough.md`; reassigned during integration to preserve the independently published DD-201.

The observation driver assumed Enter always opened the hook-review modal, then sent Escape without inspecting the active native view. On saved-session reconnect the pending question took the foreground, so Escape interrupted the real blocking tool.

Proposal from the review: Inspect the current native modal before sending state-changing keys, and verify all questions are answered before expecting completion. This review authorizes no guidance change.

#### Occurrences

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: 2026-10-01T06:55:55.870Z
  - Tool: Codex
  - Open Dough release: unknown; observation fixture installed real 0.3.51
  - Evidence: [native waiting account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/WAITING.md#actual-question-dashboard-state-and-answer); same-ID question screenshot at06:55:55.867Z, Escape immediately afterward, function_call_output aborted by user after79.1s and native turn01a0f63d-5eeb-7181-bc66-1d89a09d1771 interrupted. Corrected same-ID continuation01a0f640-5bd5-77e3-bcb3-acc785409cfa asked one tone question, received actual CLI answer and completed at06:57:19.411Z. Raw passing fixture was inspected before ADR0005 disposal; vendor history retained.
  - Observed effect: one additional substantive continuation was needed; the original input was not blindly replayed. Whole native thread reported77,035 tokens (63,104 cached input), not a measured charge or an isolated interruption cost.
  - Inference: the first assessor also expected completion after only one of two questions. Neither harness error establishes a product detach failure.

## Behavior audits that miss guidance-directed actions (low priority, not queued)

Open Dough's behavior is carried by both scripts and the skill guidance that
directs agents, so an audit of where a behavior happens has to cover both.

### DD-113 — The planning audit of commit paths missed commits made by following guidance

The planning audit listed only the scripts that create agent-authored commits. It missed the merge commit that guidance tells the agent to make in its owned workspace, so a scope promise went unplanned until the retrospective.

#### Occurrences

- Execution: `SEED-047#agent-and-developer-credit` / plan 119, first related implementation commit `01a3e2c`
  - Timestamp: 2026-09-27T07:47:40+08:00 (plan `e023a7f`)
  - Tool: Codex
  - Open Dough release: modified; revision 1b66466; base 0.3.41
  - Evidence: plan 119's PFE names the scripts that create commits (`--author` / `commit-tree`). `publish-the-candidate.md` "Preserve published history" and `product-backlog-git-merge.mjs` `commitAcceptedMerge` still make an agent-authored integration merge without the credit, as merge `199ae44` shows. Correction plan 121.
  - Observed effect: one follow-up correction story. Qualified inference: an audit that greps scripts for commit creation cannot see commits that guidance directs.

## Layout proof that checks arrangement but not usable content (low priority, not queued)

### DD-184 — A layout slice proved where columns sit but not that the page inside them stayed usable

Plan 164 slice 2 added a Sessions sidebar column beside the page and the
terminal. Its accepted proof asserted the columns' order, the sidebar's height
and scrolling, and the narrow overlay, but nothing about the page column's own
content. With the sidebar and terminal open on a 1280px window, the page column
was about 500px while the stages kept three columns (their `@media` rule reads
the window width), so cards were about 100px wide and over 2,000px tall. The
terminal-only split already had the same defect for windows between about 800
and 1,540px.

#### Occurrences

- Execution: `SEED-052#session-sidebar` / plan 164, first related implementation commit `0ebb635d`
  - Timestamp: 2026-09-29T21:19:00+08:00 (slice 2 delivered at `79e2eb9a`); found before slice 4's `fbf80b82` at 2026-09-29T22:01:19+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.47 (this repository's installed copy)
  - Evidence: slice 2's `session-sidebar.spec.ts` layout step (`expectSideBySideInOrder`, `elementFromPoint`); slice 4's implementation return noted the 100px cards while measuring a reveal; the fix made `.page-column` a CSS container (`@container page` in `stages.css`, `banner.css`) and added `expectStagesStacked`, which failed with the container removed.
  - Observed effect: a delivered slice broke card readability whenever both panels were open; it was found by chance one slice later, and fixed there within scope.
  - Inference: Qualified. Layout helpers in `pageLayout.ts` check arrangement and clipping, not whether content in a narrowed region keeps a usable layout; a region that changes width needs a check of what it contains.

## Retention

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
- Moved from `DearDough.md` at `d68fcde4` on 2026-09-29: DD-173, DD-175, and
  ODF-096's plans 142 and 146 occurrences as DD-179 (recovery:
  `d68fcde4:DearDough.md`).
- Moved from `DearDough.md` at `99292557` on 2026-10-03: DD-194, DD-195,
  DD-197, DD-199, DD-202, DD-203, DD-204, DD-205, DD-216 (recovery:
  `99292557:DearDough.md`). DD-204 was removed as resolved in the same review.
