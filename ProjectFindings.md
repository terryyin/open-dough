# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-10-05 against `a5c0ded1`. Frequency counts distinct
executions, not commands, retries, or repairs.

## Priority assessment

1. **Checks whose result depends on where or how they are run — first,
   queued.** Eight executions or sessions. The most frequent single cause is
   DD-220: four sessions the dashboard launched (plans 228, 233, 240, and the
   2026-10-05 findings review) inherited `NODE_ENV=production`, installed no
   dev dependencies, and still passed their readiness check on another
   checkout's tools. Each cost little only because someone noticed; when nobody
   does, the proof runs on tool versions CI does not use. The fix is in the
   dashboard's session launch.
   Story: [A session the dashboard launches prepares its checkout as a developer shell would](.planning/seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment)
   (DD-220).
   Also open: a direct shell run under macOS Bash 3.2 (DD-162), a passing run that
   prints no count (DD-216), and Playwright runs in one checkout that share
   fixed output directories (DD-224, DD-226).
2. **Local proof that leaves out what another CI job checks — second, not
   queued.** Two open findings. DD-171 recurred in plan 191 with the same
   error in the same file as plan 146, and no local gate yet types the
   dashboard's import of a skill test fixture. DD-187 leaves
   `producer | grep -q` pipelines under `pipefail` in two test helpers.
3. **Native host runs routed through the developer — low, not queued.**
   Two findings in two executions (plans 139, 191), both about starting paid native
   runs that are manual-only in this repository. DD-205 records a practice that
   removed the babysitting once the developer authorized the run.

Moved from DearDough.md on 2026-10-05 (recovery: `a5c0ded1:DearDough.md`):
DD-220's plan 233 and 240 occurrences, which used the same code for the same
cause seen from the readiness check, merged into DD-220 below; DD-224; and
DD-229, removed below as resolved. Returned to DearDough.md: DD-169 and DD-173,
whose cause is a planning premise left to the developer (the ODF-074 class).

Resolved and removed on 2026-10-05 (recovery: `941cf860:ProjectFindings.md`):
DD-232 (dashboard specs failing CI on revisions that changed no code). Its
open causes were repaired in the product with forced-order specs (`3589f469`,
`759f9134`, `06dfb716`), and 20 repeated CI runs on `06dfb716` all passed.
`scripts/ci-repeat.sh` repeats that on demand. This answers CI's runners only;
a loaded developer machine stays with DD-224 and DD-226. Two later occurrences from
plan 245 (repairs `97728d3f`, `866d5a31`) are recoverable at
`b40ba186:ProjectFindings.md`.

Resolved and removed on 2026-10-05 (recovery: `a5c0ded1:ProjectFindings.md`,
and `a5c0ded1:DearDough.md` for DD-229):

- DD-186, DD-195, DD-199, and DD-222 (named timing races and launch-card
  waits): each race was repaired in its execution (`4e0b2420`, `bb5ee6a1`,
  `2929df75`, `aeb9c33d`, `a25a762f`, `85cb7d44`), and the launch-card specs
  now wait as long as a start may (`4f0d2cc4`, closed in `0123c307`), which
  also covers DD-195's unexplained `agent-launch-start-taken.spec.ts:53`. The
  class recurred after these repairs and is recorded as DD-232.
- DD-197 (hook tests needing CI's shell tools and Linux Git): repaired in
  `6be8fccc` and `8a165806`; no recurrence in the `test` job.
- DD-227 (one-line layout check fitted to macOS fonts): repaired in
  `138f693c` with `expectOnOneLineWhenRoom`.
- DD-229 (terminal width proof read visible rows whose count depended on
  resize coalescing): repaired in `d02ade82`.
- DD-202 and DD-203 (native observation drivers that assumed host state):
  both repaired in plan 192; the drivers have not been used since.
- DD-113 (planning audit missed a guidance-directed merge commit): corrected
  by plan 121 (`178e0346`); no recurrence.
- DD-184 (layout proof missed a narrowed page column's content): fixed one
  slice later with the `@container page` rule and `expectStagesStacked`.

Earlier removals: DD-160, DD-175, DD-204, and the lint half of DD-178 and
DD-194 (2026-10-03, recovery `99292557:ProjectFindings.md`); DD-168, DD-178,
and DD-194 (2026-10-03, recovery `7fa7e3f7:ProjectFindings.md`); DD-114,
DD-164, DD-166 (2026-09-29, recovery `d68fcde4:ProjectFindings.md`); DD-158
(2026-09-29, recovery `3f0f1ad3:ProjectFindings.md`); DD-179 (2026-09-30,
recovery `34ceff06:ProjectFindings.md`). DD-155 and DD-159 were returned to
DearDough.md on 2026-09-29.

## Checks whose result depends on where or how they are run (first priority, queued)

This repository's checks should give CI's result however they are run
locally: directly or through `scripts/test.sh`, from any directory, in a session
the dashboard launched, and alongside or after another run in the same checkout.
Each finding below is a local run whose result or output depended on how it was
started.

**Follow-up:** queued second: [A session the dashboard launches prepares its checkout as a developer shell would](.planning/seeds/SEED-100-project-checks-trustworthy.md#launched-session-development-environment) (DD-220). DD-162, DD-216, DD-224, DD-226, and DD-240 have other causes and stay open.

### DD-220 — A session the dashboard launches inherits its deployment's `NODE_ENV=production` and tools, so checkout preparation installs no dev dependencies and still passes

An agent session the Open Dough dashboard launched inherited
`NODE_ENV=production`, and its `PATH` reached the dashboard deployment's
`node_modules/.bin`. In the execution worktree, `npm ci` exited 0 having
installed nothing ("audited 1 package"). The readiness gate's project command
then passed anyway, using the deployment's tools or the parent checkout's
`node_modules`. The proof therefore ran without the checkout's locked dev
dependencies. `dashboard/server/hosts/cursor/runnerProcess.ts` still passes
`env: process.env` to the launched host, and the Claude, Codex, and terminal
spawns under `dashboard/server` pass no `env` of their own.

DearDough.md's DD-220 recorded plans 233 and 240 under the same code, from the
readiness check's side. Those rows merged here on 2026-10-05.

#### Occurrences

- Execution: `SEED-088#prove-landed-slices-leave-the-review` / plan 228, first related implementation commit `1967ed3f`
  - Timestamp: 2026-10-03T14:50:00+08:00 (checkout setup after Take `230e6b02` at 14:48:28+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.55 (this repository's installed copy)
  - Evidence: `echo $NODE_ENV` printed `production`; `npm config get omit` printed `dev`; `which tsc` resolved to `~/.open-dough/dashboard/deployments/28cf3da8bc53-d7306v/node_modules/.bin/tsc`; `node_modules/.bin/tsc` was absent from the worktree. `NODE_ENV=development npm ci --include=dev` installed the locked tools, and the checks passed from them.
  - Observed effect: the coordinator caught it only by checking for the worktree's own `tsc` after the cheap check passed, at a cost of one reinstall. Every later npm and npx command needed `NODE_ENV=development`.
  - Inference: Qualified. The dashboard deployment runs under `npm run preview:dashboard` (`dashboard/server/productionDeployment.mjs`), and its terminal spawns appear to pass no `env`, so a launched host inherits the server's environment. Proof run with the deployment's tool versions can differ from CI's. This sits close to ODF-087 (a readiness check passing on a substitute), but here the cause and fix are in the dashboard's launch environment.
- Execution: `SEED-093#expose-timing-races-locally` / plan 233, first related implementation commit `7b6ddcce`
  - Timestamp: 2026-10-03T17:25:25+08:00 (`node_modules/.package-lock.json` write time of the first `npm ci`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: the first `npm ci` printed "audited 1 package", and the worktree's `node_modules` had 14 empty scope directories and no `.bin`; `npm config get omit` returned `dev` with `NODE_ENV=production`; `../../node_modules/.bin/eslint` exists. `npm ci --include=dev` then installed the locked dev tools, and lint and `npx playwright --version` ran from the worktree.
  - Observed effect: the readiness gate passed on its first command. The coordinator caught the problem only because the install output looked odd, before delegating; four tool calls.
  - Inference: Qualified. A nested worktree hides a missing local install whenever the parent checkout has one.
- Execution: `SEED-091#review-and-terminal-share-side-panel` / plan 240, first related implementation commit `2c64ac94`
  - Timestamp: unknown (readiness check at execution start, before `2c64ac94` committed 2026-10-03T23:09:50+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 240 "Decisive premises" recorded `npm ci --include=dev --ignore-scripts` in this workspace for an earlier `codex/` branch name; the coordinator reused it and ran `env -u NODE_ENV npm run typecheck:dashboard`, which exited 0. The slice 1 agent then found the worktree's `node_modules` empty, no `./node_modules/.bin/playwright`, and that the typecheck had used the parent checkout's `tsc`; it ran `npm ci --include=dev --ignore-scripts` itself.
  - Observed effect: the readiness gate passed without a local install; the implementation agent absorbed the setup, so the cost was small.
  - Inference: Qualified. Planning-time install evidence that names the workspace does not prove the install is still there at execution.
- Execution: ad hoc findings review (dashboard launch `bc0a59af-2abd-4f5c-a6e2-2ca07dde7871`), one-shot workspace `.worktrees/project-findings-triage`
  - Timestamp: 2026-10-05 (checkout setup; exact time not recorded)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: `echo $NODE_ENV` printed `production`, and `which tsc` resolved to `~/.open-dough/dashboard/deployments/14e9fc236d8a-XuQot9/node_modules/.bin/tsc`. Setup ran `unset NODE_ENV; npm ci` because a recorded developer reminder said to.
  - Observed effect: no wrong proof, only because the reminder was applied.

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

### DD-226 — Concurrent Playwright runs in one checkout rebuild the shared `dashboard/dist` under each other

The dashboard suite builds production assets into `dashboard/dist` once per run (`dashboard/tests/support/globalSetup.ts`). A second run started from the same checkout rebuilds that directory while the first is still serving it.

#### Occurrences

- Execution: `SEED-091#story-card-information-radiator` / plan 231, first related implementation commit `c58dc07d`
  - Timestamp: unknown (slice 1 implementation, before `c58dc07d` committed 2026-10-03T21:36:52+08:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: the slice 1 agent's full dashboard run gave 1002 passed and 1 failed, `agent-launch-claude-verification.spec.ts` "Recheck records the one session…" (Taken membership heading mismatch), while its other Playwright runs in the same checkout rebuilt `dashboard/dist`; the spec passed 3 of 3 alone and again in a later isolated run.
  - Observed effect: one unexplained full-run failure and later delegations carrying a "never run two Playwright invocations at once" rule.
  - Inference: Qualified. The rebuild is the likely cause, but the failing run was not kept and the cause is not reproduced. A per-run output directory or a lock would make overlapping runs safe. DD-224 lost a failure to the same kind of fixed location, `dashboard/test-results`.

### DD-224 — A delegated rerun overwrote the only output of an unexplained test failure

A refactor agent's rerun of a combined Playwright command replaced the output of an earlier run in which one spec failed, so the failure's assertion and trace were lost. The coordinator could then only try to reproduce it, and the cause stayed unknown.

#### Occurrences

- Execution: `SEED-052#unread-report-apart-from-engagement` / plan 238, first related implementation commit `f1221461`
  - Timestamp: unknown (slice 2 refactor pass, before `88357912` committed 2026-10-03T20:03:40+08:00)
  - Tool: Claude Code (delegated refactor agent and coordinator)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: the slice 2 refactor report says one run of its alert command failed `session-unread-report.spec.ts` (13 passed, 3.1m, load about 40) and that "the rerun overwrote its output"; the coordinator then ran that spec `--repeat-each 6 --workers 6` and the full command `--repeat-each 3` (48 passes at load about 42–44); plan 238 slice 2 records the failure as an open observation.
  - Observed effect: two extra reproduction runs (about one minute) and a flaky-test question left without a cause.
  - Inference: Qualified. The failure may have been load alone, but nothing retained can show it; keeping a failed run's report or `test-results` before rerunning would have answered it. One sample.

### DD-240 — Claude completion and kept-start specs failed early in one full dashboard run and passed alone and in the next full run

In one full local dashboard run, seven tests failed with a poll timeout or a
start that "did not finish within the wait". They were every Claude
early-binding variant in `agent-completion-binding.spec.ts`, plus
`agent-completion-attention.spec.ts`, `agent-completion-early-recovery.spec.ts`
and `agent-launch-preparation-resume.spec.ts:128`. All seven failed among the
first tests the 8 workers ran. The same files passed when run alone (10 tests),
and the next full run passed every test. The cause is unknown.

#### Occurrences

- Execution: `SEED-107#recently-done-correction` / plan 257, first related implementation commit `5cb0984a`
  - Timestamp: unknown (slice 3 implementation, between `1d2724d6` committed 2026-10-06T12:31:18+09:00 and `ee0b21b7` committed 2026-10-06T13:07:51+09:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts --reporter=dot` reported 1091 passed and 7 failed in 9.0 min; the failures were in the dot line's first 20 marks. Rerunning the four files alone gave 10 passed, and a second full run gave 1098 passed in 6.5 min. Slice 3 changed the server's listed-record reads and the fake GitHub listings, not the completion or launch code. The job-local logs are not retained in the repository. No load average was recorded.
  - Observed effect: a second full run of about 6.5 minutes. The failure question is left without a cause.
  - Inference: Qualified. The longer first run and the early position point to contention at suite start (load, or the concurrent `dashboard/dist` rebuild of DD-226), but nothing retained shows which. One sample.

## Local proof that leaves out what another CI job checks (second priority, not queued)

A change proved locally should not fail a CI job for a reason the local proof
never exercised. Each finding below passed its focused local proof and failed
a different CI job: the dashboard's type check of a skill test fixture, and a
pipeline that only the Ubuntu runner lost to SIGPIPE.

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

### DD-250 — `tests/native-setup.sh` cannot run on a machine without the exact `.node-version` Node

`.node-version` pins Node 24.21.0, and `tests/native-setup.sh` refuses any
other Node with "Node prerequisite mismatch". This machine has only Node 24.5.0,
so a change that reaches `ci.yml` leaves that consumer to CI. Its `ci.yml` text
assertions can be checked by hand; its setup-script behavior cannot.

#### Occurrences

- Execution: `SEED-115#retain-cancelled-ci-evidence` / plan 265, first related implementation commit `a68d3211`
  - Timestamp: unknown (slice 1 implementation, before `a68d3211` committed 2026-10-07T09:37:19+09:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: the slice 1 return said `tests/native-setup.sh` failed with "Node prerequisite mismatch: selected 24.21.0, actual 24.5.0". The coordinator reran the test's `ci.yml` assertions (lines 124–134) by `grep`, and they held. `node --version` printed v24.5.0. No nvm, fnm, mise, volta or n was installed.
  - Observed effect: one known consumer of the change was proved only in part locally, and the rest was left for CI.
  - Inference: Qualified. Any change that reaches `ci.yml` or `scripts/setup-native.mjs` will meet this until the machine has the pinned Node. That matches this group's goal that local checks give CI's result.

## Probe design for CI-only paths (not queued)

### DD-249 — A CI probe assumed `longest-first` sets the order a shard runs its files

Slice 2 of plan 265 needed one shard to complete a deliberate failure before
the forced deadline. The probe listed its spec first in
`dashboard/tests/longest-first`. That file only assigns specs to shards. Under
`fullyParallel: true`, Playwright schedules a shard's files alphabetically, so
`deadline-probe.spec.ts` queued behind `agent-launch-*` specs that were still
running at the deadline, and it never started.

#### Occurrences

- Execution: `SEED-115#retain-cancelled-ci-evidence` / plan 265, first related implementation commit `a68d3211`
  - Timestamp: 2026-10-07T09:39:25+09:00 (probe commit `631484ee`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: run 37553117469 at `631484ee`. Shard 1's artifact held only three interrupted `agent-launch-preparation-*` tests' results. Run 37553839091, after the rename to `aaa-deadline-probe.spec.ts` in `2afb6ab1`, kept the probe's `trace.zip` and `error-context.md`. `dashboard/playwright.config.ts` sets `fullyParallel: true`. Plan: `6f0f4f78:.planning/slice-plans/265-retain-cancelled-ci-evidence/PLAN.md` (slice 2).
  - Observed effect: one extra probe commit and CI run, about 8 minutes from push to verdict.
  - Inference: Qualified. A local `--list` or `--workers=1` dry run of the shard would have shown the order before the push. The plan's probe recipe named the failing spec's placement but not how to make it run first.

## Native host runs routed through the developer (low priority, not queued)

Paid native runs are manual-only in this repository (`tests/README.md`). Each finding below is a paid run
whose start depended on how the developer's approval reached the host.

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

## Retention

- Moved from `DearDough.md` at `7ebcb07c`: ODF-060, DD-113, DD-114.
- Recovery: `7ebcb07c:DearDough.md` (ODF-060 before its resolved removal).
- Moved from `DearDough.md` at `d68fcde4` on 2026-09-29: DD-173, DD-175, and
  ODF-096's plans 142 and 146 occurrences as DD-179 (recovery:
  `d68fcde4:DearDough.md`).
- Moved from `DearDough.md` at `99292557` on 2026-10-03: DD-194, DD-195,
  DD-197, DD-199, DD-202, DD-203, DD-204, DD-205, DD-216 (recovery:
  `99292557:DearDough.md`). DD-204 was removed as resolved in the same review.
- Moved from `DearDough.md` at `a5c0ded1` on 2026-10-05: DD-220 (plans 233
  and 240, merged), DD-224, DD-229 (removed as resolved in the same review).
  Returned to `DearDough.md`: DD-169, DD-173 (recovery:
  `a5c0ded1:ProjectFindings.md`).
