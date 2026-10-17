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

<a id="dd-295"></a>

### DD-295 — `limit-recovery-credit-history.spec.ts` saw an unrelated plan-history request after its recovery mark in one loaded whole-suite run

#### Occurrences

- Execution: `SEED-135#read-direction-after-phone-session-start` / plan 302, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: 2026-10-13T11:23Z (local whole dashboard suite on the slice's final state)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.60)
  - Evidence: `npm run test:dashboard -- --reporter=list` ended 1607 passed, 1 failed in 14.4 min. `askedSince` at `dashboard/tests/limit-recovery-credit-history.spec.ts:35` received `commit-list .planning/slice-plans/091-time-unread/PLAN.md@c3c3…` beside the three expected requests. The same spec passed in the whole-suite run an hour earlier (1607 passed) and 20 of 20 alone with `--repeat-each=20` (16.8 s).
  - Observed effect: a whole-suite acceptance run failed on a spec that measures GitHub request traffic, in an execution that changed only a stylesheet, a README paragraph and a new spec.
  - Inference: qualified. Either the unreadable plan time's history request was still in flight when `openedWithYumaWithheld` took its `asked` mark, or the page asked it again after recovery although the spec's comment says it stays terminal. The run did not distinguish them, and the trace was not kept. Not repaired in this execution.

<a id="dd-296"></a>

### DD-296 — A spec that restarted its server on the fixture's closed port failed CI with "Port … is already in use"

#### Occurrences

- Execution: `SEED-135#read-direction-after-phone-session-start`, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: 2026-10-13T11:54Z (run 38393464333 attempt 1, story branch at `f3cce19e`, shard 8/12)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.60)
  - Evidence: `agent-launch-start-session-landing-retained.spec.ts` closed the fixture server and started its own on the same port; the start failed with "Port 46725 is already in use" through `dashboard/tests/support/viteAddress.ts` and `dashboard/server/chosenPort.mjs`, which never retries a named port. Holding that port after the close reproduced the same failure and stack locally.
  - Observed effect: a records-only closure commit failed CI and held a story's integration.
  - Inference: qualified. Which process took the port in CI is unknown. Three specs that never needed the same address now bind any free port. Seven callers still restart on a closed server's port because an open page or an embedded origin needs it (`responsiveRecovery.ts`, `support/launchDashboard.ts` `restartPreview`, `agent-launch-start-session-recovery`, `agent-launch-ad-hoc-codex-recovery`, `agent-launch-second-server-orphan`, `agent-completion-recovery`, `agent-completion-superseded`); the same race is latent there and needs a way to hold the address across the restart.

<a id="dd-297"></a>

### DD-297 — A test writing into the source scripts directory and a five-second child-start poll each failed once in loaded whole-suite runs

#### Occurrences

- Execution: `SEED-135#read-direction-after-phone-session-start`, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: 2026-10-13T14:08Z to 14:31Z (local whole-suite runs on the CI repair, load average 4 at the start and 22 at the end)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.60)
  - Evidence: `npm test` failed `ci-mailbox-removed-worktree.test.mjs` with `ENOENT … src/skills/dough-execute-plan/scripts/landing-<uuid>.json` inside `cpSync` of that directory (`ci-installed-checkouts-test-fixtures.mjs` `deployRuntime`); `dashboard-landing.test.mjs` writes and removes `landing-<delivery>.json` in the same source directory. `project-add-boundary.spec.ts:91` timed out its 5 s `expect.poll` for the `gh` child's pid. Alone, the first check passes and the second passed 60 of 60.
  - Observed effect: two whole-suite acceptance runs each ended with one failure unrelated to the change under proof.
  - Inference: qualified. The first is a race between two tests sharing the source directory, whatever the load; the second is a wait bound the loaded machine exceeded. Neither was repaired in this execution.

## Quiet passing checks obscure the selected proof (opt-in verified locally)

**Follow-up:** [Opt-in selection records](../../dashboard/tests/README.md)
provide locally verified opt-in evidence through the same strict reporter. The
caller still chooses an unused absolute path, reads the record after the run,
checks its attribution/completeness alongside the command exit, and owns its
retention. Opt-out runs retain the original silent behavior. This response
changes repository proof tooling only; historical occurrences below remain.

<a id="dd-216"></a>

### DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

The plan's focused Playwright commands used the default reporter. Under the agents' shell, a passing run printed no summary, and two agents reran the same selection with `--reporter` just to report counts.

#### Same-run evidence evaluation (2026-10-12)

In the execution checkout based on `a0886605`, Node 24.21.0 and locked
Playwright 1.63.0 ran the normal strict configuration with two workers:

```sh
env -u NO_COLOR NODE_DISABLE_COMPILE_CACHE=1 OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/dough-proof-selection-Z5M7mc/final-proof.json npm run test:dashboard -- quiet-reporter.spec.ts proof-record.spec.ts proof-record-storage.spec.ts proof-record-verdict.spec.ts proof-record-interruption.spec.ts proof-record-entry.spec.ts --workers=2
```

The command exited 0. Reading the same invocation's record, without a listing
or second counting execution, found 24 distinct selections and 24 passed
attempts in six spec files, `phase: "completed"`, raw and strict passed
verdicts, and duration 21,998.901 ms. The run ID was
`d82b923a-f386-4aec-804d-e69e5caed6ba`; its config/checkout attribution matched
this invocation. The reporter printed no output and its output directory had
been removed while the requested file survived.

The [capability journeys](../../dashboard/tests/proof-record.spec.ts) compare a
filtered selection with a fixture's actual execution log and distinguish
repetitions, retries, skips and listing. The normal npm/direct-config entry
journeys selected one outer reporter test each; their inner Playwright runs
did not replace the outer evidence. Verdict journeys observed passed
assertions/raw runner status alongside strict failure for unexpected test and
setup output. Deadline and SIGINT proof retained a completed first assertion
separately from stopped work; SIGKILL after persisted selection left a running
snapshot without a terminal verdict. Storage journeys verified separate
overlapping records, byte-preserving destination refusal, canonical rejection
of an output-directory alias, invalid/unwritable paths, and a controlled
snapshot collision leaving incomplete evidence with the original passing exit.
All six existing reporter specs, including the HTML deadline companion and
literal final `Kept:` behavior, passed in that same selection.

Discrimination: temporarily omitting the serialized `terminal.strictStatus`
made `proof-record.spec.ts --grep 'a filtered quiet run' --workers=1` exit 1
at its completed strict-success assertion. The source was restored before
the passing complete invocation above. Dashboard typecheck and the actual
twelve-share spec-discovery check also passed.

The repeated counting execution is avoidable when callers opt in. Fresh-path
selection and one file read remain manual; no automatic archive or universal
adoption is claimed. Missing, malformed, listed or running evidence is not
completed executed proof, and valid records do not replace the command exit.
The [test guide](../../dashboard/tests/README.md) documents these decisions.

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

## Observer journeys wait on a judgement that can predate the test's provider change (repaired, unqueued)

<a id="dd-302"></a>

### DD-302 — An integrated-state journey's wait accepted a stale judgement and failed only in CI

#### Occurrences

- Execution: `SEED-008#coalesced-ci-validation` / plan 307, first implementation `d1eda2ced0a71b56edb3e6086651ad7403ef45ba`
  - Timestamp: unknown (2026-10-14; CI run 38567064129 on `d1eda2ce`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision b9a2c783; base 0.3.62
  - Evidence: CI `test (3/3)`: `ci-integrated-state-journey.test.mjs:130` expected `incomplete`, got `undiscovered`. The wait predicate `revision.integrated?.state === "unresolved"` was already satisfied by a `no_candidate` judgement recorded before the test listed B's cancelled run. The repair at `d4913f71` reproduced it by re-arming the fixture's request hold, and tightened the wait to the asserted state. Later delegations had to state "wait predicates must require the exact state the test then asserts", and later refactors tightened five more waits.
  - Observed effect: one failed CI run and one repair cycle with a stash/restore of unrelated in-progress work.
  - Inference: qualified. Observer journeys poll a record that the observer rewrites asynchronously. A wait on any field the observer may already hold passes before the change under test is observed. No shared helper enforces waiting for the asserted state.

## Installer declarations sit at the line limit beside a single-entry anchor convention (open, unqueued)

<a id="dd-303"></a>

### DD-303 — Joining `install.sh` lines to stay at 250 broke a test that treats single-entry lines as anchors

#### Occurrences

- Execution: `SEED-008#coalesced-ci-validation` / plan 307, slices 4–5 (`f1582623`, `d429430a`)
  - Timestamp: unknown (2026-10-15)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision b9a2c783; base 0.3.62
  - Evidence: each new runtime module needed a `managed_files` entry in `install.sh`, which sat at the 250-line limit, so entries were joined onto existing lines. In slice 5, the refactor's first join put a module on `ci-github-diagnostic.mjs`'s line. `ci-github-acquisition.test.mjs` "no installed file asks gh outside the one request source…" matches single-entry lines (`/^ {2}(dough-[\w./-]+)$/gm`) and failed until the entry moved. In slice 4, the refactor added two lines (252) and left the coordinator to rejoin them.
  - Observed effect: two extra fix-and-rerun rounds around installer declarations.
  - Inference: qualified. The file-length rule and a test's reliance on line shape conflict as the payload grows. The anchor convention is undocumented beside the list.

