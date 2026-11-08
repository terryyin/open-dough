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

## Dashboard shards run at their time ceiling (response implemented, hosted outcome unobserved)

<a id="dd-279"></a>

### DD-279 — A dashboard shard reached its 320-second deadline after one spec file was added

**Follow-up (2026-10-25):** Keep test-file changes from unexpectedly exhausting CI share budgets — SEED-151#balance-test-shares, implemented below and closed (story recoverable at `8dd20d66:.planning/seeds/SEED-151-test-share-reliability.md#balance-test-shares`), not resolved. The second distinct execution (plan 350) demonstrates the same stale-allocation mechanism after a refresh. No deadline or coverage reduction is selected.

**Response (2026-10-25):** One allocator, `scripts/share-deal.mjs` with its command surface `scripts/test-shares.mjs`, deals both suites' shares by recorded duration: each recorded job (a Node runner job, or a dashboard spec file) goes, longest first, to the share with the smallest predicted total, ties to the lower share; unrecorded jobs follow in bytewise order at the median of the recorded seconds, so a file-set change moves predicted time by at most that job's duration. `tests/longest-first` and `dashboard/tests/longest-first` carry seconds (`<seconds><TAB><label>`, every recorded job, no 3 s cutoff); `scripts/test-jobs.sh` and `dashboard/tests/support/testFiles.mjs` consume the allocator instead of their positional copies; `node scripts/test-shares.mjs preview` shows each share's predicted total and the unrecorded jobs before a push (the Node suite with headroom to `tests/time-budget`, the dashboard without a ceiling), and each dashboard shard keeps its per-spec seconds as artifact `dashboard-times-<shard>`, so both lists are refreshed by one documented command ([tests/test-shares.md](../../tests/test-shares.md), [dashboard/tests/shards.md](../../dashboard/tests/shards.md)). A list line without seconds fails the run or the configuration naming it before any check runs. No deadline, ceiling or share count changed; refresh stays manual, and the preview's unrecorded count is the staleness signal. Revision: `61d16b66` (the allocator and the Node shares), `34f3192f` (the dashboard per-spec artifact), and the following slice 3 commit, which deals the dashboard shards and records this response, completes it.

**Measured allocation:** Branch CI run 40185201080 (`61d16b66`): Node shares under the duration deal, predicted 498.5 job-seconds each, measured 643.6 / 399.1 / 536.0; the per-share median ratio of each job's seconds to the list was 1.24 / 0.76 / 1.13, so the spread is runner speed, the story's deferred item, not allocation. Run 40187124945 (`34f3192f`): Node shares measured 562.5 / 522.6 / 539.9; the dashboard shards, still positional, measured 581.9 / 601.0 / 686.4 / 462.5 / 674.5 / 555.1 / 608.1 / 549.2 / 515.8 / 595.0 / 615.2 / 667.2 test-seconds. The dashboard list refreshed from that run's twelve artifacts records all 549 current spec files and predicts 582.4 / 582.3 ×10 / 582.2 test-seconds a shard, a spread of 0.2 s against the positional 462.5 to 686.4. Limit of those artifacts: six of their 555 labels are case modules (`support/productionUpdatePolicies.ts` and five Codex case modules) to which the slice 2 reporter attributed the tests they register, so the three specs importing them were recorded 124.3 s short and the deal ignores the six labels; the slice 3 commit's reporter attributes a test to the spec file Playwright ran (`dashboard/tests/support/specTimes.ts`), and the list is refreshed again from the landed revision's run. That run, 40189712361 on the slice 3 commit `065d6655`, passed: Node shares predicted 498.5 job-seconds each measured 655.8 / 612.1 / 401.3, per-share median job ratios 1.26 / 1.13 / 0.81 to the list; dashboard shards predicted 582.3 test-seconds each measured 614.5 / 627.8 / 497.9 / 503.3 / 694.2 / 676.2 / 525.9 / 595.6 / 458.0 / 479.1 / 590.5 / 606.5, per-shard median ratios 0.74 to 1.18, every shard job finishing in 159 to 240 s of its 320-second deadline. The remaining spread is runner speed, not allocation: each share's or shard's predicted total from the list is equal to within one job. The completing commit refreshes both lists from that run's artifacts (427 Node jobs and 549 spec files recorded, the case-module labels gone), predicting 556.4 Node job-seconds for each share and 572.5 dashboard test-seconds for each shard.

**Observation criterion:** Over the next ten `main` runs that add, remove or rename a test or spec file, no Node share ends over its 710 job-second ceiling and no dashboard shard reaches its 320-second deadline for a cause the allocation owns, that is with a list the preview showed as fresh. A breach with a stale list is a missed refresh, repaired by the documented command; a breach with balanced predictions points at runner speed, the deferred item, and is recorded as a new occurrence, not as a failure of this response. Ten such runs without a breach resolve the finding.

#### Occurrences

- Execution: `SEED-088#review-merged-story-branch-changes` / plan 292, first related implementation commit `3354d72b`
  - Timestamp: 2026-10-10T22:24Z (run 38091252477, `main` at `8df6248b`)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: modified; revision `8c54b825`; base 0.3.58
  - Evidence: shard 2/9 failed with “Timed out waiting 305.392s for the test suite to run”. Its job took 310 s on the passing run 38089450687 and 270 s to 306 s across shards of run 38089179190. `longest-first` dated from 2026-10-01 and listed 163 of 443 specs; the per-spec durations in run 38089179190's nine reports put 965 test-seconds in share 1 and 582 in share 6. The refreshed list (200 specs) predicts 786 and 669.
  - Observed effect: a records-and-tests repair commit failed CI on time alone, costing a third diagnosis during one wrap-up.
  - Inference: qualified. The story added six spec files and the repair one more; the stale order, not any single spec, put two shares within 10 s of the deadline. The list has no refresh step, so the margin erodes again as specs are added.
  - Later evidence: the refreshed order's first run (38091885152, `main` at `3b2b446a`) ended share 6/9 at the deadline with all 147 tests passed; its 49 specs summed to 1,019 test-seconds against 719 in the reference run, about 1.4 times slower across unrelated specs, while other shares took 176 s to 285 s. Nine shares left no room for that runner variance, so the matrix now deals twelve (predicted 463 to 605 test-seconds a share).
- Execution: `SEED-148#allocate-unused-story-identities` / plan 350, first implementation `3fba18f99c50843b0901ecc226db982ccaadfe1e`
  - Timestamp: 2026-10-23 (CI run 39883782226 on `3fba18f9`; exact failure time not retained)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: modified; revision `3fba18f9`; base 0.3.69
  - Evidence: Node suite job "test (3/3)" failed only with `OVER BUDGET: all jobs took 711.1 job-seconds; the total ceiling is 710`. The slice added one 1.0 s test file; `tests/longest-first` listed 81 labels, so the bytewise round-robin moved about 31 jobs between shares and share 3 went from 683.3 (main run 39875064344) to 711.1 while common jobs ran at the same speed (1788.0 vs 1794.3 s). `bash scripts/ci-test-times.sh` already showed share 3 at 706.6 of 710 on main (headroom 3.4, "thin"). Plan 350 named no time-budget baseline although `tests/time-budget.md` asks a slice adding test time to. Repair `9b762292` refreshed the list by its documented procedure (165 labels; projected 612.9 / 588.6 / 593.8).
  - Observed effect: one CI failure on sound code, costing a parked-work stash, a repair agent, a refactor agent, and a repair publication.
  - Inference: qualified. Same mechanism in the Node suite's budget rather than the dashboard deadline: a partly stale `longest-first` leaves the bytewise remainder to decide shares, so any added or renamed test file reshuffles them; the refresh holds only until the file set drifts. Dealing known-time jobs to the least-loaded share would remove the dependence on order; not selected.
- Execution: `SEED-192#inspect-hierarchical-proof-cost` / plan 452, first implementation `f310f5739a8de2c1a09116d0c32d230ea80dd1b7` (moved here once from DearDough DD-411, whose shared diagnostic-inventory facet stays there)
  - Timestamp: 2026-11-02T14:44:14Z (run 41463759771 attempt 1 completion, `CI_INCOMPLETE`, push to story branch `claude/find-expensive-proof-in-the-test-hierarchy` at `a04e6e12a`, a revision later on `main`)
  - Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.83 (repository VERSION at claim `5260f2bc4`)
  - Evidence: job "dashboard (10/12)" ended `cancelled` after "Run the dashboard browser suite" failed with "Timed out waiting 276.021s for the test suite to run"; the deadline counts from job start (`.github/workflows/ci.yml` "browser suite (320 seconds) deadlines"), and that job's "Set up job" took 42 s against 1 s and setup-node 30 s against 5–6 s on sibling shards, whose eleven jobs finished in 168 to 259 s. The revision added one spec file (`intent-summary-slowest.spec.ts`), dealt unrecorded.
  - Observed effect: an incomplete run on sound code; a stash of slice 3 work and a repair agent (about 455 s, 101k tokens) that concluded runner degradation.
  - Inference: qualified. Runner/setup speed, the response's deferred item, not allocation: the slow shard lost its time in pre-suite setup. A story-branch run is not one of the criterion's `main` runs, and this is not a failure of SEED-151's allocator.

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

## Paid native-run permission handoff (low priority, unqueued)

**Follow-up:** open, unqueued. This is the repository’s paid native harness
meeting a host permission boundary; no public guidance defect or supported
product repair is established. Keep the observation without claiming resolution.

<a id="dd-161"></a>

### DD-161 — The developer's approval of paid runs did not let the coordinator start them

Paid native runs are manual-only and need the developer's go-ahead. On Claude
Code in auto mode, the host's permission check refused the coordinator's
native run after the developer approved all planned runs. The developer then
had to request the run explicitly.

#### Occurrences

- Execution: `SEED-028#native-one-shot-escalation` / plan 139, first related implementation commit `23663a21`
  - Timestamp: 2026-09-28 (slice 2 start, after "approve all"); exact time unknown
  - Tool: Claude Code · Model: claude-opus-5-5[1m] · Open Dough release: modified; revision 0466e5ba
  - Evidence: the coordinator conversation: "approve all" → `tests/git-publication-native.sh --native claude` refused by the host's auto-mode classifier as agent creation. Run 1 started once the developer sent the command as a message; run 2 on "run 2".
  - Observed effect: two extra developer round trips before paid runs started.
  - Inference: Qualified. The request for go-ahead could offer the exact command, or the permission rule, the developer can use, instead of assuming approval lets the coordinator launch it.

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

<a id="dd-390"></a>

## DD-390 — Journey-only order-dependence can miss fixture option binding

Real second-file journeys that do not need a shared fixture option still pass
under module-level `test.use` order dependence. Option-value probes at
`--workers=1` were the reliable signal that defaults failed to reach the
second-loaded file.

### Occurrences
- Execution: SEED-208#declare-fixture-defaults-on-fixtures (plan 436; first related implementation commit `9b4f8a8c`)
  - Timestamp: unknown (2026-11-01 implementation; before-order probes `tmp/order-probe-cursor2/proof.json` `startedAt` 2026-11-01T06:33:44.496Z and `tmp/order-probe-unread/proof.json` `startedAt` 2026-11-01T06:35:00.785Z)
  - Tool: Cursor · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.79)
  - Evidence: plan 436 Current decisions Learning; coordinator history that real second-file journeys still passed without the option; before probes titled “missing defaults” vs after “keeps fixture defaults” in those proof records
  - Observed effect: order-dependence was proved and fixed via option-value probes rather than failing journeys; consumer suite later passed strict
  - Inference: Qualified practice. For fixture option defaults, assert the option values across file order instead of relying on journeys that may not exercise those options

**Responsibility and disposition (2026-11-02):** Project-owned fixture-proof
practice, rather than a defect established in shared Open Dough guidance.
The execution's option-value probes detected the defect and its strict consumer
suite subsequently passed. Preserve this as a useful test-design observation;
no further implementation story is justified by this evidence alone. Original
source and provenance are recoverable at `a47f4814:DearDough.md`.

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
[Machine sleep on macOS](../../tests/local-test-resources.md#machine-sleep-on-macos).
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

<a id="dd-421"></a>

## DD-421 — Revision-stream rate-limit reopen via page-clock timer stranded under paused clocks

Slice 5 first deferred stream open after a rate-limit wait only through `scheduleOpenAfter` on the page clock. Journey clocks stay paused, so the reopen never fired, focused stream journeys failed, and the page kept the effect-level `limitedUntil` guard that opens at T without relying on that timer alone.

### Occurrences
- Execution: SEED-232#see-published-changes-over-sse (before-cleanup `1b37ad486dba725c8e08dceed5af56c9e6848da1:.planning/slice-plans/469-see-published-changes-over-sse/PLAN.md`; first implementation commit `fe83d250eb95a2e02edc3e8b02eccb8d01f92f27`)
  - Timestamp: unknown (2026-11-05, focused slice 5 proof before `40eb66ce52`)
  - Tool: Cursor · Model: auto · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator return: focused proof 40 passed / 2 stream journeys failed; before-cleanup plan learning and slice 5 proof: keep effect-level rate-limit guard; do not defer open via page-clock `scheduleOpenAfter` alone; `revision-stream-lost.spec.ts` rate-limit journey then passed in the 42-focused run; published at `40eb66ce52`.
  - Observed effect: lost-freshness / rate-limit stream work blocked until the open path matched how check journeys pause the page clock.
  - Inference: stream delivery that must reopen while tests pause `page.clock` cannot treat a page-clock timeout as the only gate for a standing limit; wall-clock or effect re-entry is required for those journeys (and matches production when the limit ends without a clock advance).

**Responsibility and disposition (2026-11-07):** Project-owned dashboard stream reopen and Playwright paused-clock interaction, repaired in the same slice (`40eb66ce52`). Moved from `DearDough.md` (recovery `8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md#dd-421`); no new local story.

<a id="dd-428"></a>

## DD-428 — Kept CI answer journeys needed settle-before-hold and mismatch-before-remember

Adding the process-local kept CI status answer and per-attempt proof memory left existing Check-again journeys wrong until pre-landing and host CI failed: mismatched adapter summaries were remembered as if valid, and a freshness hold placed before the remount's fresh keep settled showed unread as previously retrieved.

### Occurrences
- Execution: SEED-239#show-ci-status-on-intent-home (before-cleanup `6581c406d0edf71e4d8a3d210e5b4d7769a624af:.planning/slice-plans/476-show-ci-status-on-intent-home/PLAN.md`; first related implementation commit `bb9b7128e`)
  - Timestamp: 2026-11-05T19:05:05+07:00 (host CI run 42032615133 tip after repairs `e4058a7c7`)
  - Tool: Cursor · Open Dough release: 0.3.86 (installed `.claude/skills`; VERSION file)
  - Evidence: pre-landing `npm run test:dashboard` failed `intent-ci-proof-adapter-reasons` (remembered `someone/else` / valid attempt-2 summary blocked Check again) and `intent-ci-proof-ancestor` (asserted actions-runs before fresh settle); host CI run 42027284312 failed `intent-ci-status-freshness` at the held main Check again with `.intent-ci-state` `Could not be read` while Previously retrieved + spinner showed; repairs `420ac5e1c` (mismatch before remember) and `e4058a7c7` (settle Passed before hold; unread not labelled previously retrieved).
  - Observed effect: two repair publications after slice 5's keep/memory before the story tip was green; local focused freshness passed while shard 1/12 failed.
  - Inference: when a slice adds process keep or dual kept+fresh reads, re-read every journey that reconfigures the adapter on Check again or holds a fixture across a remount, and wait for Checked at before holding.

**Responsibility and disposition (2026-11-07):** Project-owned dashboard Intent CI-status keep/memory and journey synchronization, repaired in the same execution (`420ac5e1c`, `e4058a7c7`). Moved from `DearDough.md` (recovery `8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md#dd-428`); no new local story.

<a id="dd-429"></a>

## DD-429 — Fake-Cursor attach pid equated to runner pid made correct revive look failed

Slice 2 journey assertions compared fake-Cursor attach `pid` (the agent PTY) to the Cursor runner address `pid`. Product revive was already selecting and resuming last-held candidates while those polls timed out waiting for a held count matched by runner pid.

### Occurrences
- Execution: SEED-242#revive-cursor-sessions-when-the-runner-restarts (before-cleanup `a07048254e182fef347a6c91739f41da5b743f82`; first related implementation commit `5de83a6202e6c4ed330660bf43f4c049c1ddda02`)
  - Timestamp: 2026-11-05T21:47+07:00 (coordinator noted three focused revive proofs timed out; diagnosis in slice-2 agent return)
  - Tool: Cursor · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.86)
  - Evidence: coordinator transcript `0e775890-01a7-485a-90e6-db26302038ef` (~21:47–21:53+07:00): replacement, controls, and restart journeys timed out on held-count waits; debug showed revive selected the prior last-held candidate and logged `done`, with resume attaches present; slice-2 agent `894a78d4-5fc2-45f1-81a2-611e132e72fc` stated attach PIDs were being compared to the runner PID and fixed assertions; before-cleanup plan Current decisions at `.planning/slice-plans/479-revive-cursor-sessions-on-runner-restart/PLAN.md` record that fake-Cursor attach `pid` is the agent PTY
  - Observed effect: several failed proof rounds and debug instrumentation while the revive path already worked; final proofs passed after assertion identity was corrected (no product keep/revive change for that failure class)
  - Inference: under fake-Cursor, treat runner address pid and agent attach pid as distinct identities; assert held/resume by session id (or attach presence), not by equating those pids

**Responsibility and disposition (2026-11-07):** Project-owned `fake-Cursor` test-harness identity convention, corrected in the same slice (`5de83a620`). Moved from `DearDough.md` (recovery `8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md#dd-429`); no new local story.

<a id="dd-430"></a>

## DD-430 — Dynamic import to avoid ensure nesting broke the dashboard server bundle

To keep accepting-port revive from nesting `ensureCurrentCursorRunner`, slice 2 first tried a dynamic import of the revive path. That broke the dashboard server bundle; the durable fix was extracting accepting-port keep/hangup/sessions into `runnerWire.ts` with a static revive import after the start lock released.

### Occurrences
- Execution: SEED-242#revive-cursor-sessions-when-the-runner-restarts (before-cleanup `a07048254e182fef347a6c91739f41da5b743f82`; first related implementation commit `5de83a6202e6c4ed330660bf43f4c049c1ddda02`)
  - Timestamp: 2026-11-05T21:46+07:00 (coordinator noted format/lint/typecheck green after the wire split)
  - Tool: Cursor · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.86)
  - Evidence: slice-2 agent `894a78d4-5fc2-45f1-81a2-611e132e72fc` recorded that dynamic import broke the server bundle and extracted keep-at-port; before-cleanup plan Current decisions name accepting-port keep in `runnerWire.ts` to avoid ensure deadlock and import cycles; delivered surfaces `runnerWire.ts` / `runnerRevive.ts` / post-settle revive in `runnerCurrent.ts`
  - Observed effect: one mid-slice structural correction before focused revive proofs could run cleanly; final shape matches the plan's settled re-entrancy constraint without dynamic import
  - Inference: for dashboard server modules that share the ensure lock, prefer a static seam (wire/keep-at-port module) over dynamic import when breaking a keep→ensure cycle

**Responsibility and disposition (2026-11-07):** Project-owned dashboard server bundling seam, repaired in the same slice (`runnerWire.ts`). Moved from `DearDough.md` (recovery `8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md#dd-430`); no new local story.

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

**Follow-up:** open, unqueued; the remedy needs a decision on how container
runs share admission.

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
