# Repository test findings

Detailed active findings linked from [ProjectFindings.md](../../ProjectFindings.md).
The index owns prioritization; these records retain occurrences and follow-ups.

## Dashboard specs can lose a mouse press to a reflow (open, unqueued)

<a id="dd-278"></a>

### DD-278 — Two dashboard specs lost a mouse press to a reflow between press and release, on two CI runs in one day

A late read answer changed the page's height while Playwright's click was
between pointer press and release, so the press and release met different
elements and no click reached the control. Each spec then waited on a page
that had asked for nothing.

#### Occurrences

- Execution: `SEED-088#review-merged-story-branch-changes` / plan 292, first related implementation commit `3354d72b`
  - Timestamp: 2026-10-10T14:43Z (run 38060703770, story branch) and 2026-10-10T22:04Z (run 38089795734, `main` at `bf901b72`)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: modified; revision `8c54b825`; base 0.3.58
  - Evidence: run 38060703770 failed `story-review-commit-ranges.spec.ts:80` (the range answer changed the status height above the commit list; trace shows no fourth range request); run 38089795734 failed `session-workspace-retirement-claude.spec.ts:162` (the seed, plan and agent-profile reads shortened the page; trace shows no `POST /__agent-launch/done`). Both parents of `bf901b72` passed the workflow. Repairs: `57b2af6e` (`support/storyReviewCommitChoice.ts`) and the commit that adds “a Recently done entry's Mark as done stays where a settled page shows it”.
  - Observed effect: two failed CI runs on revisions whose code was sound, each costing a diagnosis and a repair commit before completion could proceed.
  - Inference: qualified. Each repair covers its own spec family. `openStoryStagesJourney` returns after the published-work read alone, and `markDone` treats “no mark noted” as answered, so any spec that mouse-presses before the page settles has the same roughly 30 ms exposure. The loaded-suite acceptance story is closed, so this exposure has no owner.

- Execution: `SEED-088#review-uncommitted-changes` / plan 293, first related implementation commit `5f539d6a`
  - Timestamp: 2026-10-10T22:33Z (run 38091599194, story branch at `5f539d6a`)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.58 installed in the execution checkout; provenance otherwise unknown
  - Evidence: run 38091599194 failed `session-workspace-retirement-claude.spec.ts:162` with the entry still offering Mark as done and no rename attempted, the lost press trunk had repaired in `8df6248b` 20 minutes earlier. The story branch was taken from `b4cb0cb9`, before that repair; it merged trunk at `2783ca92` and the repaired specs passed three times each locally.
  - Observed effect: one failed CI run on a slice whose code was sound, costing a diagnosis, a pause of the next slice's work, and a trunk merge.

## Dashboard suite runs

<a id="dd-336"></a>

### DD-336 — `dashboard-concurrent-runs.sh` failed once in a loaded whole-suite run on a missing `.last-run.json`

#### Occurrences

- Execution: `SEED-148#allocate-unused-story-identities` / plan 350, first implementation `3fba18f99c50843b0901ecc226db982ccaadfe1e`
  - Timestamp: 2026-10-23T11:1x+09:00 (whole `bash scripts/test.sh` before slice 4 commit `549675ab`)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: modified; revision `0d1fbf2c` plus slice 4 guidance edits; base 0.3.69
  - Evidence: the only failure was `FAIL: the first concurrent dashboard run printed: ERROR outside a test: Error: ENOENT: no such file or directory, open '<checkout>/dashboard/test-results/2026-10-23T02-11-20.956Z/.last-run.json'`; load average 31; the change touched no dashboard path; `bash scripts/test.sh tests/dashboard-concurrent-runs.sh` alone then passed.
  - Observed effect: one whole-suite failure outside the change, classified without repair.
  - Inference: unestablished cause. Each run writes `dashboard/test-results/<millisecond stamp>`; something removed or never created the first run's directory while it ran. A passing rerun is not a repair.

<a id="dd-295"></a>

### DD-295 — `limit-recovery-credit-history.spec.ts` saw an unrelated plan-history request after its recovery mark in one loaded whole-suite run

#### Occurrences

- Execution: `SEED-135#read-direction-after-phone-session-start` / plan 302, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: 2026-10-13T11:23Z (local whole dashboard suite on the slice's final state)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: unknown (checkout VERSION 0.3.60)
  - Evidence: `npm run test:dashboard -- --reporter=list` ended 1607 passed, 1 failed in 14.4 min. `askedSince` at `dashboard/tests/limit-recovery-credit-history.spec.ts:35` received `commit-list .planning/slice-plans/091-time-unread/PLAN.md@c3c3…` beside the three expected requests. The same spec passed in the whole-suite run an hour earlier (1607 passed) and 20 of 20 alone with `--repeat-each=20` (16.8 s).
  - Observed effect: a whole-suite acceptance run failed on a spec that measures GitHub request traffic, in an execution that changed only a stylesheet, a README paragraph and a new spec.
  - Inference: qualified. Either the unreadable plan time's history request was still in flight when `openedWithYumaWithheld` took its `asked` mark, or the page asked it again after recovery although the spec's comment says it stays terminal. The run did not distinguish them, and the trace was not kept. Not repaired in this execution.

<a id="dd-296"></a>

### DD-296 — A spec that restarted its server on the fixture's closed port failed CI with "Port … is already in use"

#### Occurrences

- Execution: `SEED-135#read-direction-after-phone-session-start`, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: 2026-10-13T11:54Z (run 38393464333 attempt 1, story branch at `f3cce19e`, shard 8/12)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: unknown (checkout VERSION 0.3.60)
  - Evidence: `agent-launch-start-session-landing-retained.spec.ts` closed the fixture server and started its own on the same port; the start failed with "Port 46725 is already in use" through `dashboard/tests/support/viteAddress.ts` and `dashboard/server/chosenPort.mjs`, which never retries a named port. Holding that port after the close reproduced the same failure and stack locally.
  - Observed effect: a records-only closure commit failed CI and held a story's integration.
  - Inference: qualified. Which process took the port in CI is unknown. Three specs that never needed the same address now bind any free port. Seven callers still restart on a closed server's port because an open page or an embedded origin needs it (`responsiveRecovery.ts`, `support/launchDashboard.ts` `restartPreview`, `agent-launch-start-session-recovery`, `agent-launch-ad-hoc-codex-recovery`, `agent-launch-second-server-orphan`, `agent-completion-recovery`, `agent-completion-superseded`); the same race is latent there and needs a way to hold the address across the restart.

<a id="dd-297"></a>

### DD-297 — A test writing into the source scripts directory and a five-second child-start poll each failed once in loaded whole-suite runs

#### Occurrences

- Execution: `SEED-135#read-direction-after-phone-session-start`, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: 2026-10-13T14:08Z to 14:31Z (local whole-suite runs on the CI repair, load average 4 at the start and 22 at the end)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: unknown (checkout VERSION 0.3.60)
  - Evidence: `npm test` failed `ci-mailbox-removed-worktree.test.mjs` with `ENOENT … src/skills/dough-execute-plan/scripts/landing-<uuid>.json` inside `cpSync` of that directory (`ci-installed-checkouts-test-fixtures.mjs` `deployRuntime`); `dashboard-landing.test.mjs` writes and removes `landing-<delivery>.json` in the same source directory. `project-add-boundary.spec.ts:91` timed out its 5 s `expect.poll` for the `gh` child's pid. Alone, the first check passes and the second passed 60 of 60.
  - Observed effect: two whole-suite acceptance runs each ended with one failure unrelated to the change under proof.
  - Inference: qualified. The first is a race between two tests sharing the source directory, whatever the load; the second is a wait bound the loaded machine exceeded. Neither was repaired in this execution.

**Current assessment (2026-10-21):** The source-directory race is repaired at `059cda6920e0934f4288641d2f4cfa8927d6726b`: the landing test passes its own `landing-retained-*` directory, and `reportLanding` writes there instead of the shared source scripts directory. This establishes adoption of the concrete repair, without a new exposure claim. The separate child-start poll remains in `dashboard/tests/boundary/project-add-boundary.spec.ts`; no later loaded-run outcome was supplied. Retain that qualified remainder rather than claiming both failures remain unrepaired.

<a id="dd-330"></a>

[DD-330 — Delegated focused proof ran `node --test` directly, so it missed both the runner's Git environment and its quiet-pass rule](project-maintenance-findings.md#dd-330).

<a id="dd-216"></a>
<a id="dd-243"></a>

### DD-216 / DD-243 — Quiet passing checks obscure the selected proof

[Opt-in proof records](../../dashboard/tests/README.md) supplied the selection
and strict verdict of one 24-test run without a counting rerun. Choosing and
reading a fresh path remain manual. [The five historical executions and
evaluation](project-findings-history.md#dd-216) are retained together.

## Shell observations can invert a result on Linux (open, unqueued)

**Follow-up:** open, unqueued. Current `producer | grep -q` sites remain in
`tests/support/product-backlog-native-use.sh` (unresolved-index and driver
checks) and `tests/helpers/product-backlog-payload-runtime.bash` (status
checks). They are repository test helpers, outside the published payload.
Do not claim these residual sites have failed without an observed occurrence.

<a id="dd-187"></a>

### DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE

The startup observer read `claim-owned` from `git log --format=%B … | grep -Fq`
in a suite run under `set -euo pipefail`. When `grep -q` matched and exited
while git was still writing, git died of SIGPIPE (141) and `pipefail` turned
the match into `claim-owned: false`. macOS usually let git finish first; the
Ubuntu runner did not.

#### Occurrences

- Execution: `SEED-055#assessor-counterexample-discipline` / plan 165, first related implementation commit `84b4f28f`
  - Timestamp: 2026-09-29T15:40:33Z (CI failure on `00cc1b62`)
  - Tool: Claude Code · Model: claude-opus-5-5[1m]
  - Evidence: CI run 36591803631 `test (1/2)`: `FAIL: counterexample command-only (signal setup-marker) changes signals remote-claim, setup-marker (fields claim-owned, …)`; local `tests/git-publication-native.sh` passed. A repro with one extra commit under the claim gave `claim-owned: false` with `PIPESTATUS` `141 0`. Repaired in `66f96e34`; slice 7 (`abf2fc4f`) fixed three more observer derivations of the same shape.
  - Observed effect: one CI repair cycle (pause, stash, diagnosis agent, refactor pass, publication) during slice 6.
  - Inference: Qualified. A different mechanism from DD-186's load-dependent races. The new counterexample helper made the flip visible: it refuses a case whose change spans two signals, where the old primitive only checked the verdict. Other `producer | grep -q` pipelines under `pipefail` remain in `tests/support/product-backlog-native-use.sh` and `tests/helpers/product-backlog-payload-runtime.bash`.

## Loaded-suite evidence lacks within-run load (open, unqueued)

**Follow-up:** open, unqueued. `scripts/dashboard-repeat.sh` still samples
`load_average` only before and after `run_in`; it cannot locate a failure
against the actual load then. This is repository diagnostic tooling, not a
request to change published proof-acceptance guidance.

<a id="dd-275"></a>

### DD-275 — Acceptance runs recorded machine load only at their start and end, so a failure could not be placed against the story's load bound

The story treats a failure "while the load was several times the core count"
differently from a defect, and the repeat script prints the one-minute load
before and after each run. A loaded run of 826 s failed one test 148 s in,
with load 16 at the start and 65 at the end.

#### Occurrences
- Execution: SEED-123#dashboard-suite-passes-loaded-acceptance (plan 289, first implementation commit 065bf393)
  - Timestamp: 2026-10-10T21:39:08+09:00 (end of the failing loaded run)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: modified; revision `29b9c41c`; base 0.3.58
  - Evidence: plan 289 slice 6 Learnings (second series); `scripts/dashboard-repeat.sh` `load_average` before and after only; the diagnosis estimated the load at the failure as 25 by interpolation and about 70 from the five- and fifteen-minute averages.
  - Observed effect: the load at the failure stayed an estimate, so the choice between "record and repeat" and "fix" rested on the trace alone. From the third series on, the coordinator logged `uptime` every 30 s beside the script; the third series' failure was then placed at load 33 directly. Another session's work took the load to 141 during the diagnosis repeats.
  - Inference: sixteen burners plus eight workers reach several times the core count on their own, so every loaded full run meets the story's exception as written unless the load is sampled through the run.

## Observer journeys wait on a judgement that can predate the test's provider change (repaired, unqueued)

<a id="dd-302"></a>

### DD-302 — An integrated-state journey's wait accepted a stale judgement and failed only in CI

#### Occurrences

- Execution: `SEED-008#coalesced-ci-validation` / plan 307, first implementation `d1eda2ced0a71b56edb3e6086651ad7403ef45ba`
  - Timestamp: unknown (2026-10-14; CI run 38567064129 on `d1eda2ce`)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: modified; revision b9a2c783; base 0.3.62
  - Evidence: CI `test (3/3)`: `ci-integrated-state-journey.test.mjs:130` expected `incomplete`, got `undiscovered`. The wait predicate `revision.integrated?.state === "unresolved"` was already satisfied by a `no_candidate` judgement recorded before the test listed B's cancelled run. The repair at `d4913f71` reproduced it by re-arming the fixture's request hold, and tightened the wait to the asserted state. Later delegations had to state "wait predicates must require the exact state the test then asserts", and later refactors tightened five more waits.
  - Observed effect: one failed CI run and one repair cycle with a stash/restore of unrelated in-progress work.
  - Inference: qualified. Observer journeys poll a record that the observer rewrites asynchronously. A wait on any field the observer may already hold passes before the change under test is observed. No shared helper enforces waiting for the asserted state.

<a id="dd-303"></a>

[DD-303 — Joining `install.sh` lines to stay at 250 broke a test that treats single-entry lines as anchors](project-maintenance-findings.md#dd-303).

<a id="dd-309"></a>

[DD-309 — The per-slice formatter rewrites the whole repository](project-maintenance-findings.md#dd-309).

## Worker fixture populations split hosted workers (repaired)

<a id="dd-312"></a>

### DD-312 — A worker-scoped fixture declared in a subset of specs split the hosted worker population, invisible to local proof
Adding a worker-scoped fixture to one fixture module while other specs extend only the base made Playwright hash the two populations apart and restart the four workers at every switch on every shard; the slice's local proof and whole runs were green and faster, and the cost showed only in hosted report artifacts.

#### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-18T0x:xx+09:00 (slice 7 published 1aec32a1 at about 04:1x+09:00; found by the hosted analysis about 04:3x+09:00; fixed in slice 9)
  - Tool: Claude Code · Model: claude-fable-5-1 · Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: plan 310 slice 9 "Worker restarts" and the Learnings entry on hosted measurement: 68 worker starts per hosted run against 21 before (83 s of restart gaps, 134 s of slot imbalance across twelve shards); the fix moved the fixture to `support/pageTest.ts` and gave the voice files one `launchOptions` object (local experiment 13 → 8 workers).
  - Observed effect: one hosted run's overhead rose while its per-test seconds fell; found only because the coordinator commissioned a per-test comparison of report artifacts.
  - Inference: qualified. A slice that changes test infrastructure has a hosted cost its local proof cannot see; reading the published run's report artifact (worker count, gaps) as part of the next slice's acceptance would catch it in one revision. Playwright's rule is now in the fixture's comment.

**Responsibility and current assessment (2026-10-20):** The concrete fixture population was repository-owned and repaired in the same execution, with the reported local 13-to-8 worker comparison retained above. This is historical evidence, not a new recurrence or implementation commitment. The general lesson to inspect hosted costs remains qualified; no shared platform defect is established. Recovery: `dae40ae3ed427d6827828b43c4fecc794d60cd85:DearDough.md#dd-312`.

<a id="dd-412"></a>

## DD-412 — The plan's sleep guard let Maintenance Sleep break two whole-suite runs

The plan prescribed `caffeinate -i` for the full local gates. On AC power the
machine still entered system Maintenance Sleep repeatedly, freezing all
Playwright workers at once, so two whole dashboard suite runs failed with
scattered, non-overlapping tests and were discarded.

### Occurrences
- Execution: SEED-224#unify-story-selection (plan 454; first implementation commit `041f863a`)
  - Timestamp: unknown (2026-11-03, about 12:00–17:00 +07:00 per the slice 2 agent's `pmset -g log` reading)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: unknown (installed `.claude/skills` at 1e743f54; checkout VERSION 0.3.83)
  - Evidence: `1c8898b23ac6:.planning/slice-plans/454-unify-story-selection/PLAN.md` Outside-in proof "Local gates" (`caffeinate -i`) and Learnings; slice 2 implementation return (runs of 95 and 52 failures, about 60 sleeps totalling about 4 h; final run under `caffeinate -s -i` 1945/1945)
  - Observed effect: about 3.4 h of slice 2's wall time went to two invalid whole-suite runs and their attribution checks (a base worktree comparison)
  - Inference: `-i` prevents idle sleep only; `-s` is needed on AC. The planner copied the guard from local memory, so the gap is in the local practice, not Open Dough guidance

**Responsibility and disposition (2026-11-04):** The repository's plan
chose the local macOS sleep guard. The successful AC-powered retry established
a usable guard for that machine; the repository's local test instructions
still give future planners no durable guidance for this case. Original source
is recoverable at `d5b59b92b:DearDough.md`. The process execution release remains
unknown.

**Follow-up:** `b52c1d3bdad7369fc1042a5f2744e9ebedadecbe` (2026-11-04)
delivered the instructions in
[Machine sleep on macOS](../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
In `SEED-241#load-intent-without-disruption-or-bulk-source-transfer`
(`plan 477-load-intent-without-disruption`, 2026-11-05, see DD-432 below),
the main-merge dashboard suite ran under `caffeinate -s -i` and reported
2,044 passed, 1 skipped. Two settling observations remain
open: whether `caffeinate -s` keeps a run going that starts inside the
sleep/dark-wake cycle, and the next sleep-attributed failure after adoption.
If such a failure recurs, the considered responses are an automatic guard,
`caffeinate -s -i -w <pid>` started by `acquireLocalSuite` in
`scripts/local-test-suite.mjs` when a full run takes admission on macOS
(proved with a substitute guard command), and a failing full run printing the
sleep entries inside its own window. The fuller analysis is recoverable from
`b52c1d3bdad7369fc1042a5f2744e9ebedadecbe:.planning/seeds/SEED-227-protect-long-local-proof-from-maintenance-sleep.md`.

<a id="dd-420"></a>

## DD-420 — Lowered revision-stream pace listed origin twice before open answers settled

With `DOUGH_REVISION_STREAM_MS` lowered, `SourceRevisionStream` scheduled its pace timer while the first open demand was still settling, so two streams of one source could each start a `matching-refs` before sharing one listing. Local focused boundary proof had passed; hosted CI failed the one-listing assertion; the fix starts the pace only after the open demand settles.

### Occurrences
- Execution: SEED-232#see-published-changes-over-sse (before-cleanup `1b37ad486dba725c8e08dceed5af56c9e6848da1:.planning/slice-plans/469-see-published-changes-over-sse/PLAN.md`; first implementation commit `fe83d250eb95a2e02edc3e8b02eccb8d01f92f27`)
  - Timestamp: 2026-11-04T16:22:39Z (CI failure on `fe83d250eb`)
  - Tool: Cursor · Model: auto · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: observer `/tmp/dough-ci-501/watch-6tNnon` `CI_FAILURE` run 41865901313 (`dashboard (4/12)`); proof fragment `passed:287,failed:1`; report `authenticated-read-revision-stream.spec.ts` expected `matchingRefsSince` 1 received 2 at open; coordinator later called it an open-vs-pace race and fixed it before publishing stream page work (`1e79d44b9` / before-cleanup plan learning (slice 4): pace starts only after first open demand settles); tip coverage `40eb66ce` success / `a5307e4e` not_required.
  - Observed effect: published slice 2 failed hosted CI on the stream's core sharing promise; later slice repaired the race and the applicable tip validated.
  - Inference: a lowered-pace boundary proof that only asserts after both opens can miss a race where the pace timer overlaps the first demand; deferring pace start until open settles made the one-listing rule hold under CI timing.
- Execution: SEED-259#scan-intent-ci-summaries (plan 499-scan-intent-ci-summaries, first implementation commit 0ffcc27cbb64b570e0bc5dbd8ddc9e5bd83dee03)
  - Timestamp: unknown (2026-11-07, run 42379612785 attempt 1 on `d146a05d9`; test results stamped 2026-11-07T14:02Z)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.88 (installed `.claude/skills`)
  - Evidence: job `dashboard (11/12)` failed the same `authenticated-read-revision-stream.spec.ts:60` assertion (`matchingRefsSince` expected 1, received 2) on a story that changed no stream code. The repair agent found the pace still starts per subscriber: the `moved` stream's open settles first and arms the 80 ms test pace while the `watching` stream's open still waits on a backlog `gh` read, so a slow read lets a tick list again; reproduced by holding that read, then made the spec hold matching-refs answers in turn (`heldInTurn`), 140 passed at `--repeat-each=20`; repair `68e5f52b3`.
  - Observed effect: an unrelated story's CI failed on this check and paid a repair inside its stash/repair/restore cycle.
  - Inference: the earlier fix settled pace per open demand, not per source, so `sourceRevisionStream.ts`'s comment that a lowered pace cannot list again before open answers are observed still overstates the product; with production paces of minutes the residual race is harmless, and the spec no longer depends on it.

**Responsibility and disposition (2026-11-07):** Project-owned dashboard implementation and boundary-test timing (`SourceRevisionStream`), repaired in the same execution (`1e79d44b9`). Moved from `DearDough.md` (recovery `8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md#dd-420`); no new local story.

<a id="dd-432"></a>

## DD-432 — A container run took a live host run's local-suite admission

`scripts/ci-container.sh` mounts the common Git directory, so its
`scripts/test.sh` shares `refs/dough/local-test-suite` with host runs. Inside
the container, the host owner's pid is not visible, so `living()` judged the
host's running dashboard suite dead and replaced the owner. The host run's
global teardown then failed to release its admission and exited 1 after every
test had passed.

### Occurrences
- Execution: SEED-241#load-intent-without-disruption-or-bulk-source-transfer (plan 477-load-intent-without-disruption; first related implementation commit `fa9fd1a0249d41a5c590a0cbf66f40ff0728e028`)
  - Timestamp: 2026-11-05T23:12:28+07:00 (the replacing owner's `started` field, 16:12:28 UTC)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.86 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: the dashboard suite run for the main-merge of the story branch (22:54–23:26 +07:00, `caffeinate -s -i`) reported 2044 passed, 1 skipped, then global teardown threw "Could not release local test-suite admission." (`scripts/local-test-suite.mjs` `release`); `refs/dough/local-test-suite` afterwards held `{"pid":22,"started":"Thu Nov  5 16:12:28 2026",…}`; no host pid 22 and no container running afterwards
  - Observed effect: an otherwise green whole-suite gate exited 1; admission did not keep the two suites from running concurrently
  - Inference: qualified — the replacing owner's pid and UTC start match a container started by another session; the exact command is unknown. Either container runs take no host admission (or a separate ref), or owners record a pid namespace so a foreign-namespace owner is never judged dead; tolerating a taken ref at teardown alone would hide the concurrent run

**Assessment (2026-11-15):** The non-browser container path still mounts the
common Git directory and invokes `scripts/test.sh`. The admission owner is
identified by PID and process start time in the caller's namespace. The
exact historical container command remains unknown.

**Follow-up:**
[SEED-375](../../.planning/seeds/SEED-375-keep-container-diagnostics-from-replacing-host-suite-admission.md#keep-container-diagnostics-from-replacing-host-suite-admission)
is queued to prevent owner replacement across that boundary and preserve host
full-suite serialization.

<a id="dd-433"></a>

## DD-433 — An artifact upload stall cancelled two passing dashboard shards at the job cap

The dashboard job's `timeout-minutes: 6` leaves about half a minute beyond
setup and the 320-second suite deadline. When an upload step stalls, GitHub
cancels the job after its tests passed, and the run reads as incomplete.

### Occurrences
- Execution: SEED-241#load-intent-without-disruption-or-bulk-source-transfer (plan 477-load-intent-without-disruption; first related implementation commit `fa9fd1a0249d41a5c590a0cbf66f40ff0728e028`)
  - Timestamp: 2026-11-05T16:42:59Z (`dashboard (1/12)` cancelled; `dashboard (7/12)` at 16:43:45Z)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.86 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: run 42066203283 on `main` at `c9a142ac3` (the story's integration): every test step succeeded; "Keep the CI proof fragments" took 125 s and 110 s in shards 1 and 7 against 1–4 s in the other ten, then the 6-minute job cap cancelled them (6 min 19 s each); the other 15 jobs passed. The coordinator reran only the cancelled jobs for coverage
  - Observed effect: the integration's completion wait ended unresolved with `basis.state: incomplete`; one extra CI attempt
  - Inference: the stall is GitHub artifact service latency; the repository exposure is a job cap with no headroom for upload steps. A per-step timeout on uploads, or a job cap above setup plus suite plus uploads, would keep a passing suite from reading as cancelled

**Follow-up:** open, unqueued.

<a id="dd-445"></a>

## DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance

Overrides were removed when one hosted run showed a case at or under 15s, but
the same unchanged cases ran up to about 2x slower in later hosted runs, so
two removals timed out on CI and a hardening pass followed.

### Occurrences
- Execution: SEED-260#restore-default-test-timeouts (plan 502-restore-default-test-timeouts; first related implementation commit `6e6d16cef09551a1bd589ba1ec8be6c5cc970f1c`)
  - Timestamp: 2026-11-08T01:20:03+08:00 (commit time of slice 8 revision `1f9d12446`; its hosted run 42395811294 timed out afterwards)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.88 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1 margin rule used run 42372706379 only; runs 42395811294 (`agent-launch-story-card-sessions`, 25.2s before) and 42399373902 (`production-watcher-failures.spec.ts:84`) hit 30s; comparing 2,122 matched cases, median ratio 1.02 but p90 1.53, and `story-review-one-shot-choice-refresh` 13.8s → 26.5s unchanged
  - Observed effect: two CI repairs (`acfe0ca9e`, `665c28053`) with stash and pause cycles, then a nine-journey hardening pass (`aad804b57`); 13 hosted cases still at 20–25s
  - Inference: hosted shard co-scheduling and CPU contention dominate; a margin judged across several hosted runs, or against a loaded stand-in such as 16–24 traced local workers, would have found these before publication

<a id="dd-529"></a>

## DD-529 — Browser groups reached their hosted deadline after conversions

- SEED-357#keep-usage-history-within-a-small-disk-budget (plan 631, first implementation `a23dcc3014807378a3d518461e7e8a00f72c8d2b`), 2026-11-15T05:37:27Z, Claude Code / claude-fable-5-2, 0.3.99 at Take `5a97baeb3`, 0.3.100 at merge `f74ff9a76`. Run 43681477553 attempt 1 cut off e2e shard 2/5. Conversions added about 25%, with about 1,100 list-seconds per shard and earlier 287–288 s passes against a 320 s cutoff. Runs 43679953950 and 43678012127 and the shard instructions at `80e759cfc` supported the comparison. Per-spec times were 1.42–1.94× slower than comparable runs, while other shards were faster. The developer moved a shard from Integrated UI to E2E. Run 43688468922 passed the resulting six shards in 173–240 s.
- SEED-334#finish-dissolving-integrated-ui-test (plan 632, first implementation `9b535b53d`), 2026-11-15T11:51:12Z, Cursor, 0.3.101 from the installed marker. The frontend shard on `26161888d` in run 43710473022 hit a 163.975 s suite timeout and teardown timeout after conversions grew the group. The next tip `219d69bef` passed with only an ownership-example retarget. The available outcome does not establish a frontend capacity repair or the effect of an earlier margin check.

This record retains the local headroom evidence and the E2E
adjustment. The diagnostic gap is [ODF-506](findings/ODF-506.md).
