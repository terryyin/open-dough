# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

Reviewed on 2026-10-12 against `11d48b956607e3485f5771c59509b111be3626b8`.
Frequency counts distinct executions, not commands, retries, or repairs.
Grouping related symptoms does not establish a shared cause or duplicate an
execution. A repaired individual race does not resolve every suite failure.

## Priority assessment

1. **Local suite disk use — queued, not resolved.** [DD-287](#dd-287) has
   one execution with a lost 15-minute run and a full shared disk. The 134 GB
   cache affected the machine, but the share attributable to any one run is
   unknown. This highest-impact unresolved problem ranks ahead of more frequent
   minor friction. [Bound the dashboard suite's own compile-cache disk use](.planning/seeds/SEED-131-repository-test-feedback.md#bound-suite-compile-cache)
   is first in the backlog; its scope is this repository's test launch and
   fixtures, with no deletion of another session's cache.
2. **Proof-selection visibility — queued, not resolved.** [DD-216/DD-243](#dd-216)
   repeats across five executions (plans 217, 261, 263, 264, 297), costing
   extra listings or reruns. [Read a dashboard proof selection without rerunning it or weakening its verdict](.planning/seeds/SEED-131-repository-test-feedback.md#retain-strict-proof-selection)
   is second. Preserve silent passes and the configured reporter's failure
   policy. The general acceptance mistake of overriding that policy remains
   DD-262 in DearDough.md; it is not another project occurrence.
3. **Browser journey stability — open, unqueued.** [DD-278](#dd-278)
   records three CI failures across two executions. Both concrete spec families
   were repaired; plan 293 ran a branch predating the repair, so it is not
   recurrence after the fix. Shared interaction helpers still allow a click
   before all page reads settle. Retain that qualified residual, not a claim
   that the repaired specs still fail.
4. **Suite timing and diagnosis — open, unqueued.** [DD-279](#dd-279)
   records two shard deadlines in one execution; a refreshed duration list and
   twelve shares repair those runs, while duration ordering still ages without
   a refresh step. [DD-275](#dd-275) records one separate execution whose
   within-run load was unobserved. These are related diagnostic/margin concerns,
   not one demonstrated cause. The repaired individual timeout DD-280 and
   shell budget breach DD-283 are removed below.
5. **Shell observation reliability — open, unqueued.** [DD-187](#dd-187)
   records one Linux SIGPIPE repair cycle. The named observer was fixed;
   early-exit pipelines remain in two repository test helpers. Those are
   residual risks, not additional observed failures.
6. **Paid native-run permission handoff — low, unqueued.** [DD-161](#dd-161)
   records one execution's two permission round trips. The boundary is the
   host's; no change to released Open Dough behavior is justified by it.

Both selected stories help parallel contributors obtain reliable local proof.
Neither changes published skills, shared workflow rules, or the dashboard's
runtime contract. No existing queued or Taken story owns either outcome.
The existing native-observation queue item and Taken CI-monitoring story stay
unchanged. Earlier suite repairs remain completed; new or residual causes
above are not evidence that every earlier fix failed.

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
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `8c54b825`; base 0.3.58
  - Evidence: run 38060703770 failed `story-review-commit-ranges.spec.ts:80` (the range answer changed the status height above the commit list; trace shows no fourth range request); run 38089795734 failed `session-workspace-retirement-claude.spec.ts:162` (the seed, plan and agent-profile reads shortened the page; trace shows no `POST /__agent-launch/done`). Both parents of `bf901b72` passed the workflow. Repairs: `57b2af6e` (`support/storyReviewCommitChoice.ts`) and the commit that adds “a Recently done entry's Mark as done stays where a settled page shows it”.
  - Observed effect: two failed CI runs on revisions whose code was sound, each costing a diagnosis and a repair commit before completion could proceed.
  - Inference: qualified. Each repair covers its own spec family. `openStoryStagesJourney` returns after the published-work read alone, and `markDone` treats “no mark noted” as answered, so any spec that mouse-presses before the page settles has the same roughly 30 ms exposure. The loaded-suite acceptance story is closed, so this exposure has no owner.

- Execution: `SEED-088#review-uncommitted-changes` / plan 293, first related implementation commit `5f539d6a`
  - Timestamp: 2026-10-10T22:33Z (run 38091599194, story branch at `5f539d6a`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.58 installed in the execution checkout; provenance otherwise unknown
  - Evidence: run 38091599194 failed `session-workspace-retirement-claude.spec.ts:162` with the entry still offering Mark as done and no rename attempted, the lost press trunk had repaired in `8df6248b` 20 minutes earlier. The story branch was taken from `b4cb0cb9`, before that repair; it merged trunk at `2783ca92` and the repaired specs passed three times each locally.
  - Observed effect: one failed CI run on a slice whose code was sound, costing a diagnosis, a pause of the next slice's work, and a trunk merge.

## Dashboard shards run at their time ceiling (open, unqueued)

<a id="dd-279"></a>

### DD-279 — A dashboard shard reached its 320-second deadline after one spec file was added

#### Occurrences

- Execution: `SEED-088#review-merged-story-branch-changes` / plan 292, first related implementation commit `3354d72b`
  - Timestamp: 2026-10-10T22:24Z (run 38091252477, `main` at `8df6248b`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `8c54b825`; base 0.3.58
  - Evidence: shard 2/9 failed with “Timed out waiting 305.392s for the test suite to run”. Its job took 310 s on the passing run 38089450687 and 270 s to 306 s across shards of run 38089179190. `longest-first` dated from 2026-10-01 and listed 163 of 443 specs; the per-spec durations in run 38089179190's nine reports put 965 test-seconds in share 1 and 582 in share 6. The refreshed list (200 specs) predicts 786 and 669.
  - Observed effect: a records-and-tests repair commit failed CI on time alone, costing a third diagnosis during one wrap-up.
  - Inference: qualified. The story added six spec files and the repair one more; the stale order, not any single spec, put two shares within 10 s of the deadline. The list has no refresh step, so the margin erodes again as specs are added.
  - Later evidence: the refreshed order's first run (38091885152, `main` at `3b2b446a`) ended share 6/9 at the deadline with all 147 tests passed; its 49 specs summed to 1,019 test-seconds against 719 in the reference run, about 1.4 times slower across unrelated specs, while other shares took 176 s to 285 s. Nine shares left no room for that runner variance, so the matrix now deals twelve (predicted 463 to 605 test-seconds a share).

## Quiet passing checks obscure the selected proof (queued, not resolved)

**Follow-up:** [Read a dashboard proof selection without rerunning it or weakening its verdict](.planning/seeds/SEED-131-repository-test-feedback.md#retain-strict-proof-selection) — queued, not resolved. The current reporter preserves the strict silent-pass contract but retains no passing selection/count. The story changes this repository’s proof tooling only.

<a id="dd-216"></a>

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

<a id="dd-243"></a>

**Same finding, later reports: DD-243.** Retained under DD-216 rather than
counted as a second cause. Plans 261, 263, 264, and 297 are four additional
executions; repeated agents within each execution count once.

`npm run test:dashboard` prints nothing on a pass, so a delegated agent cannot see which or how many tests its filtered command selected, which proof acceptance asks it to report. Agents reran passing commands with `--reporter=line`, `--reporter=list`, or `--reporter=dot` to obtain the count.

#### Additional occurrences

- Execution: `SEED-113#share-repeated-observer-reads` / plan 261, first related implementation commit `a1c593a9`
  - Timestamp: unknown (slice 3 and slice 4 refactor returns, 2026-10-06, before `74f6904b` and `572faa6f`)
  - Tool: Claude Code (delegated refactor agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: slice 3's refactor return: "The first run of this command without `--reporter=line` cut off its output before the result, so I ran it again"; slice 4's refactor return: "The default reporter printed nothing on a pass, so I added `--reporter=list` to see the counts"; slice 4's implementation reported its whole-suite count from a `--reporter=dot` run.
  - Observed effect: at least two repeated focused runs (seconds to tens of seconds each); counts were reported for acceptance.
  - Inference: Qualified. The silence is the project's chosen contract for passing journeys; the cost is small but recurs per agent. Stating in the delegation which reporter yields a selection count would avoid the rerun.
- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db`
  - Timestamp: unknown (2026-10-07, before commit `11ddc3db`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: coordinator conversation: the plan's focused command `npm run test:dashboard -- <12 specs> --workers=2`, piped to `tail -8`, showed only the npm header; the coordinator reran it as `npx playwright test ... --reporter=line` to see `53 passed`.
  - Observed effect: one repeated focused run (about 15 seconds).
  - Inference: Qualified. The plan's literal proof command has the same gap as the delegation; naming a counting reporter in the plan's Proof section would avoid it.
- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde`
  - Timestamp: unknown (refactor returns of slices 1, 3, 5, and 7, 2026-10-07)
  - Tool: Claude Code (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 at claim `0edabd1c`; 0.3.57 after the merge at `fefab16d`
  - Evidence: slice 1's refactor return: "the default reporter printed no summary", rerun with `--reporter=line`; slices 3, 5, and 7's refactor returns invoked `npx playwright test ... --reporter=line|list` directly "because the default reporter's output did not show".
  - Observed effect: repeated or reshaped focused runs to obtain counts; counts were reported for acceptance.
  - Inference: Qualified; the same recurring cost, unchanged by the release.
- Execution: `SEED-088#review-trunk-mode-story-changes` / plan 297 (spent plan recoverable at `6fef8b6869a532a7a127d755fb3326b6dddd8ebd:.planning/slice-plans/297-trunk-mode-own-changes-review/PLAN.md`), first related implementation commit `0b6138cc`
  - Timestamp: unknown (implementation returns of slices 1 to 4, 2026-10-11, between the claim `99898cd7` and `1c8329e4` at 11:57:40+09:00)
  - Tool: Claude Code (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.59 (installed guidance at `7b941f04`)
  - Evidence: slice 1's return: "The reporter prints nothing on a pass, so I could not read the 92-test count"; slices 2, 3 and 4's returns each obtained their selection from a separate `npx playwright test --config dashboard/playwright.config.ts <paths> --list --reporter=list` or a `--reporter=list` rerun; the slice 1 and slice 4 refactor returns reported exit 0 alone for the suite.
  - Observed effect: one listing or rerun per implementation return (seconds each); the coordinator reran the 90 to 100 test suite itself after each refactor to hold a final-state exit code.
  - Inference: Qualified; the same recurring cost. From slice 2 the delegation named the `--list --reporter=list` listing, which replaced a second full run with a listing.

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
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
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
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 0466e5ba
  - Evidence: the coordinator conversation: "approve all" → `tests/git-publication-native.sh --native claude` refused by the host's auto-mode classifier as agent creation. Run 1 started once the developer sent the command as a message; run 2 on "run 2".
  - Observed effect: two extra developer round trips before paid runs started.
  - Inference: Qualified. The request for go-ahead could offer the exact command, or the permission rule, the developer can use, instead of assuming approval lets the coordinator launch it.

## Node's compile cache fills the disk under the dashboard suite (queued, not resolved)

**Follow-up:** [Bound the dashboard suite's own compile-cache disk use](.planning/seeds/SEED-131-repository-test-feedback.md#bound-suite-compile-cache) — queued, not resolved. Current repository launch/setup code supplies no cache isolation or lifecycle policy. Locked Vite and Rolldown launchers enable Node's compile cache; this supports investigating suite ownership, not attributing the full 134 GB to a single run.

<a id="dd-287"></a>

### DD-287 — A wide dashboard run failed with ENOSPC while `$TMPDIR/node-compile-cache` held 134 GB

#### Occurrences

- Execution: `SEED-066#unattached-session-options` / plan 298, first related implementation commit `0601f38b`
  - Timestamp: unknown (2026-10-11, about 15:05+09:00, slice 4 refactor verification)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: the refactor return reported `ENOSPC` at about test 678 of 801 with 132 MiB free; `du` showed `node-compile-cache` at 134,421 MB, of it 120,374 MB and 244,880 files under `v24.21.0-arm64-…` and 14,045 MB under `v24.5.0-…`; after deleting entries older than three hours, 37,531 MB remained and 98 GiB were free.
  - Observed effect: one 15-minute wide run was lost and rerun; the refactor pass could not report completion until the coordinator cleared the cache.
  - Inference: qualified. About 37 GB was written within three hours while this execution and other sessions ran dashboard suites, yet one measured wide run afterwards added about 1 GiB; which runs write the bulk is not established. Scratch fixture projects under new temp paths would give each run new cache keys.

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
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `29b9c41c`; base 0.3.58
  - Evidence: plan 289 slice 6 Learnings (second series); `scripts/dashboard-repeat.sh` `load_average` before and after only; the diagnosis estimated the load at the failure as 25 by interpolation and about 70 from the five- and fifteen-minute averages.
  - Observed effect: the load at the failure stayed an estimate, so the choice between "record and repeat" and "fix" rested on the trace alone. From the third series on, the coordinator logged `uptime` every 30 s beside the script; the third series' failure was then placed at load 33 directly. Another session's work took the load to 141 during the diagnosis repeats.
  - Inference: sixteen burners plus eight workers reach several times the core count on their own, so every loaded full run meets the story's exception as written unless the load is sampled through the run.

## Review and recovery

Classification and resolution review, 2026-10-12. Full input evidence is
recoverable at `11d48b956607e3485f5771c59509b111be3626b8:ProjectFindings.md`
and `11d48b956607e3485f5771c59509b111be3626b8:DearDough.md`.
Moved DD-275 from DearDough.md into the active project record. DD-283 and
DD-290 also belong to repository tooling, but their concrete failures are
already repaired, so they enter only the resolution notes below. Returned
DD-288 to [DearDough.md](DearDough.md#dd-288):
its missing release prerequisite is a general planning error. Its existing
SEED-066 native-observation story stays queued; no duplicate is added.

Confirmed repaired and removed from the active project findings:

- **DD-162:** the retained occurrence records the correct guarded runner
  passing and later delegations using it without recurrence. Current
  `scripts/test-environment.bash` checks the Bash actually resolved on PATH
  before `scripts/test.sh` starts a check; `tests/README.md` documents that
  exact route. The unsupported direct invocation was the recorded failure.
- **DD-259 (project viewport finding):** `e1058c67` repaired both named
  Linux font/scroll assertions. Current `dashboard-columns-height.spec.ts`
  keeps the 600 px viewport; `agent-launch-ad-hoc-terminal.spec.ts` uses
  1280×480 and asserts positive scroll. The old 7 px margin conjecture about
  another spec is not an observed unresolved defect. DearDough's different
  DD-259 whole-text consumer finding is unchanged.
- **DD-280:** `cb4d46c9` keeps 60 seconds for the dev-mode authenticated
  overview, whose retained CPU-throttled reproduction failed at 30 seconds
  before and passed after the repair. Current source retains that budget.
  Other cases' possible timeout proximity is not another demonstrated failure.
- **DD-283 (from DearDough):** `0ff0e242` recalibrated `tests/time-budget`
  from the recorded slow runner and ten trunk runs: the 470.2 job-second
  breach now fits 710; the largest 49.3-second job fits 74. Current values
  preserve at least the reviewed 1.5× measured headroom. No later breach of
  this replacement budget is supplied.
- **DD-290 (from DearDough):** the plan-298 scratch landing tests started two
  real-repository observers (PIDs 53113 and 54616), which the agent stopped.
  `eabbe51c` replaced that fixture path with the shared publication API;
  `dashboard/tests/support/startSessionLandingContext.ts` still calls it
  from `land` and explicitly limits managed `deliver` to Codex. The accepted
  landing specs exercise those paths. The failure was fixture isolation,
  not evidence that the public delivery command should stop observing CI.
- **DD-291:** `f9ef7368` gave the leaking native harness and published-main
  fixture private request owners. `tests/test-runner-github-requests.sh`
  permanently proves an ownerless check fails before asking fake GitHub and
  an owned check passes. `scripts/test.sh` and dashboard global teardown
  retain the guard; the retained first guarded suite caught two more leaks.
  The documented runner is the supported route; a bare unguarded Node call
  is not evidence that this repair failed.

Current-source recheck also retains the quiet reporter's silent output and
passing-directory removal, the two DD-187 pipeline helpers, the DD-278
unsettled-click exposure, DD-279's static `longest-first` plus twelve-share
matrix, and DD-275's endpoint-only load samples. No current post-repair failure
is invented from those residuals. General premise, delegation, refactor,
acceptance and CI-repair lessons (including DD-258, DD-262, DD-264, DD-266/267,
DD-271, DD-274 and DD-276) remain in DearDough.md even when their example is a
repository test. The two new backlog stories own only repository test behavior.


Moved from DearDough.md on 2026-10-09: DD-243, DD-246, DD-247, DD-252.
Recovery for both input files:
`36ac46f63786fe8b814627e81bba63851e71009d:DearDough.md` and
`36ac46f63786fe8b814627e81bba63851e71009d:ProjectFindings.md`.
At that review DD-243's occurrence evidence joined DD-216 and DD-246 stayed open.
The second classification pass moves ODF-209 / former DD-221’s plan-264
collision occurrence into DD-246 without allocating a new identity. Recovery:
`2677ad0d:DearDough.md`. At that review the six-execution suite group was first and already had a
queued story. Those suite findings were subsequently removed as resolved below;
that historical priority does not describe the current queue.

Resolved and removed from the active findings on 2026-10-11 (recovery:
`3a0086f3b73b542b276cc53a5076e461c6db0e91:ProjectFindings.md`):

- **DD-240, DD-257, DD-260:** the dashboard suite passed a fresh, a warm and
  a loaded full run in order on unchanged code. A journey's checks now start
  their bound after the answer they depend on, and the runs named and removed
  three further suite causes
  ([dashboard tests guide](dashboard/tests/README.md)). DD-257's silent
  20-second Vite start was reached by no run.

Resolved and removed from the active findings on 2026-10-10 (recovery:
`b78500a4e0753e4560f255ff917144d0e4340350:ProjectFindings.md`):

<a id="dd-171"></a>

- **DD-171:** a Land test-fixture signature change failed only the
  dashboard's TypeScript check, in two executions (plans 146 and 191), each
  with a red CI `dashboard` job and a repair cycle after focused Node proof
  passed. Delivered check: the `.githooks/pre-commit` typecheck step, which
  runs `npm run typecheck:dashboard` after the staged lint passes whenever a
  commit stages a JavaScript or TypeScript file. Implementation revision
  `b78500a4e0753e4560f255ff917144d0e4340350`
  (`SEED-124#check-dashboard-fixture-consumers-locally`, plan 286).
  Red, on that revision with a clean checkout: removing the default from
  `landWorktree`'s `identity` parameter in
  `src/skills/dough-story-refinement/scripts/dough-land-test-fixtures.mjs`,
  staging that file, and running `git commit` was refused with exit 1 and
  HEAD unchanged; after the passing lint lines the hook printed:

  ```text
  dashboard/tests/preparingJourney.ts(101,38): error TS2345: Argument of type '{ worktree: string; branch: string; defaultCheckout: string; message: string; beforePush: undefined; }' is not assignable to parameter of type '{ worktree: any; branch: any; defaultCheckout: any; remote?: string | undefined; target?: string | undefined; identity: any; createdForWork?: boolean | undefined; message?: string | undefined; beforePush: any; onFetchedTarget?: undefined; }'.
    Property 'identity' is missing in type '{ worktree: string; branch: string; defaultCheckout: string; message: string; beforePush: undefined; }' but required in type '{ worktree: any; branch: any; defaultCheckout: any; remote?: string | undefined; target?: string | undefined; identity: any; createdForWork?: boolean | undefined; message?: string | undefined; beforePush: any; onFetchedTarget?: undefined; }'.
  ```

  Green: with the default restored, `npm run typecheck:dashboard` exits 0;
  the implementation revision's own commit staged script files and passed
  the gate; and CI run `38025090499` on that revision completed the
  `dashboard (9/9)` job's "Type-check the dashboard" step with success. The
  general obligation to select consumer proof stays with ODF-150 in
  DearDough.md.

Resolved entries removed on 2026-10-10 (recovery: `054fc914:ProjectFindings.md`):

- **DD-224, DD-246:** each suite run writes into its own
  `dashboard/test-results/<start time>/`; a failed run keeps `report.txt`
  and its traces there and a later run removes only its own directory
  (`210b335d`).
- **DD-226:** each suite run builds the app into its own temporary directory
  and leaves `dashboard/dist` alone; `tests/dashboard-concurrent-runs.sh`
  proves two concurrent runs (`8e5533ea`).

Resolved or mitigated entries removed from the active findings on 2026-10-09:

- **DD-247:** the named watcher/pace and completion waits were repaired in
  `7d8319bc` and `0b2613f4`; the supposedly unfixed `expectSettledPage`
  agent-profile-read race was subsequently fixed in `823c1eda`, and the
  current helper awaits `untilPageReadsAnswered`. These concrete repairs
  remove this entry's remaining causes.
- **DD-252:** `62b21604` replaces whole-card visibility with the reachable
  card-end control and waits for settled geometry. Its retained plan-271
  acceptance records eight repeats at four workers plus the related height,
  paging, and sidebar specs passing. Current source keeps the correction.
- **DD-249:** the temporary CI probe was corrected in `2afb6ab1`; run
  `37553839091` retained the deliberately completed failure's trace and error
  context. Plan 265 records the actual alphabetic ordering, and `8958faf1`
  removes the temporary probe. No unfinished correction remains.
- **DD-250:** plan 258's retained checkout setup at `c1875574` records a
  checksum-verified Node 24.21.0 with successful npm, browser, and check
  stages. That selected runtime is still available and reports v24.21.0.
  This resolves the recorded machine's missing prerequisite, without
  removing the legitimate pinned-runtime requirement or ODF-087's separate
  preparation-gate problem.
- **DD-205:** the recorded explicitly authorized detached batch completed
  27 native sessions without further babysitting. Retain its launch practice
  in Git; DD-161 still records the separate host permission limitation.

**Classification cross-check:** These active findings require changes only
to repository test configuration, helpers, local checks, or native-run setup.
DD-238/239/240 (the DearDough occurrence, not project DD-240), DD-241/242,
DD-245/248/251/253/254/255 and the ODF entries stay in DearDough.md: their
reported mechanism concerns published planning, delegation, proof acceptance,
format-result handling, CI repair, or delivery, even when the example uses
dashboard code. In particular, DD-253's delivery command is a published
runtime, and DD-251's masked formatter exit is the shared ODF-100 class.
Neither is a project-only backlog candidate.

### Earlier reviews

Moved from DearDough.md on 2026-10-05 (recovery: `a5c0ded1:DearDough.md`):
DD-220's plan 233 and 240 occurrences, which used the same code for the same
cause seen from the readiness check, merged into DD-220; DD-224; and
DD-229, removed below as resolved. Returned to DearDough.md: DD-169 and DD-173,
whose cause is a planning premise left to the developer (the ODF-074 class).

Resolved and removed on 2026-10-08 (recovery: `49ca78ce:ProjectFindings.md`):
DD-220 (sessions the dashboard launched inherited its `NODE_ENV=production`,
`npm_*` variables and deployment `node_modules/.bin`, so `npm ci` installed no
dev dependencies). Every session the dashboard starts now runs in the
developer's shell environment (`dashboard/server/developerShellEnvironment.ts`,
described in `dashboard/AGENT-LAUNCH-HOSTS.md`). The readiness check that
still passed on another checkout's tools stays with ODF-087 in DearDough.md.

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

### Earlier moves

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
