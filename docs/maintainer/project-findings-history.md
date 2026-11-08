# Project findings review and recovery history

Historical classification, resolution and source recovery for
[ProjectFindings.md](../../ProjectFindings.md).

## Review and recovery

Classification and resolution review, 2026-10-12. Full input evidence is
recoverable at `11d48b956607e3485f5771c59509b111be3626b8:ProjectFindings.md`
and `11d48b956607e3485f5771c59509b111be3626b8:DearDough.md`.
Moved DD-275 from DearDough.md into the active project record. DD-283 and
DD-290 also belong to repository tooling, but their concrete failures are
already repaired, so they enter only the resolution notes below. Returned
DD-288 to [DearDough.md](../../DearDough.md#dd-288):
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
  ([dashboard tests guide](../../dashboard/tests/README.md)). DD-257's silent
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

<a id="dd-378"></a>

Resolved and removed on 2026-11-07 (recovery:
`8e2ec1089abbb24c603889966ddb1bcace54ad93:docs/maintainer/project-maintenance-findings.md#dd-378`
and `b1fa3b50:DearDough.md`): DD-378 (a prepared plan treating pre-existing
failures as exclusions from completion, SEED-199#mobile-session-screen,
`f601fcbd:.planning/slice-plans/425-mobile-session-screen/PLAN.md`,
2026-10-31). Repair: `482b644e90076052a2f36b9df7977b6f46ce7e89` (merged to
`main` at `bc72a379b` and released in `v0.3.80`) added `AGENTS.md` "Failing and
flaky tests" and aligned `executable-proof.md` and `execution-decisions.md` so
reproducing a failure on base is attribution, not an exemption from repair.
Outcome: `SEED-229#reduce-remote-sessions-traffic`
(`e49035d31:.planning/slice-plans/462-reduce-remote-sessions-traffic/PLAN.md`,
2026-11-04) attributed four full-suite failures in untouched tests to base
`e69e74cf7` and repaired all four in the same execution, satisfying the stated
observation criterion. Supported retirement of the plan-exclusion finding;
DD-374's separate delegation-brief wording check remains open.

Resolved and removed on 2026-11-03 (recovery:
`b108395049f91f0ed7d3e713a8ca8362b17d1295:ProjectFindings.md`, section "Hosted
CI npm install stalls at its acquisition deadline"): DD-376
(`setup-native.mjs npm` exceeded its 45 s deadline on hosted runners during
`npm audit`; runs 41188326936 and 41191328229, SEED-202#bounded-dashboard-refresh,
2026-10-31). Repair: trunk `7b9777c7` sets `NPM_CONFIG_AUDIT=false
NPM_CONFIG_FUND=false` (story-branch `d4190ce4` used `--no-audit --no-fund`;
the integration kept trunk's form), keeping the 45 s stall bound. Outcome: the
last failed `Install npm dependencies` step is run 41195930489 (#3358,
2026-10-31T11:12:58Z); all 68 completed runs #3359–#3426, 19 on `main`, with
1,088 install steps had none fail (SEED-208#trustworthy-ci-completion,
2026-11-01). Supported retirement of the hosted audit stall, not proof that
setup cannot fail; a later install failure is examined for a repository cause
before an infrastructure disposition.

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

<a id="dd-452"></a>

## DD-452 — A shell check gained a browser its CI job did not install

Execution-branch code DD-450 at `1121f82c05f397ae08fe78cc3626ec11cf6da142:DearDough.md`.

The concurrent dashboard shell check switched to a Playwright browser case.
The local check had Chromium available. The hosted shell job installed npm
dependencies, while the separate dashboard job installed Chromium.

### Occurrences
- Execution: SEED-262#prepare-artifacts-on-demand (plan 513-prepare-dashboard-artifacts-on-demand; first related implementation commit `019b0e25014c2e6fbee8138e90503279a77191a6`)
  - Timestamp: unknown (2026-11-08, CI attempt 42441494702/1)
  - Tool: Codex
  - Open Dough release: 0.3.90 (installed `.agents/skills/dough-update/VERSION` at the claim)
  - Evidence: [CI test shard](https://github.com/terryyin/open-dough/actions/runs/42441494702/job/128611486924) reported missing Chromium in both selected cases. An empty `PLAYWRIGHT_BROWSERS_PATH` reproduced the failure, then passed with the browser-free real preview selection in `6b9bd99fbe5530ca273dafb1cdbde8c152538464`.
  - Observed effect: one failed CI run, one repair publication, and a pause, stash and restore of the next slice.
  - Inference: qualified. Comparing the new selection's prerequisites with the hosted job, then checking with the same relevant optional dependencies, could catch this kind of cross-suite change before publication.

**Disposition:** The browser-free preview selection passed under the hosted shell job’s dependency boundary in `6b9bd99fbe5530ca273dafb1cdbde8c152538464`. The original occurrence remains above.

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

**Maintenance assessment (2026-11-07):** No new project story. DD-378 is retired after `SEED-229#reduce-remote-sessions-traffic` (`e49035d31:.planning/slice-plans/462-reduce-remote-sessions-traffic/PLAN.md`, 2026-11-04) attributed four full-suite failures to base `e69e74cf7` and repaired all four in the execution ([history](project-findings-history.md#dd-378)). DD-412 records `SEED-241#load-intent-without-disruption-or-bulk-source-transfer` (plan 477, 2026-11-05) running the full dashboard suite under `caffeinate -s -i` (2,044 passed, 1 skipped), while its two settling observations remain open. DD-420, DD-421, DD-428, DD-429 and DD-430 moved here from DearDough.md (`8e2ec1089abbb24c603889966ddb1bcace54ad93:DearDough.md`) as repaired dashboard, fake-Cursor harness and server-bundle observations alongside DD-432 and DD-433; the misplaced `SEED-232#reduce-running-cursor-session-requests` occurrence under DD-414 (`2d80ac1fc`, shifted in merge `bd1b1afbd6`) is restored to ODF-367 in DearDough.md. DD-419/DD-432 (local suite admission across focused and container runs) and DD-426/DD-433 (6-minute job caps on slow runners and upload stalls) remain open pending design and budget decisions.

**Maintenance assessment (2026-11-03):** No new project story. DD-376 is retired after 68 post-repair runs without an install failure ([history](project-findings-history.md#earlier-reviews)). DD-406's local facet is already repaired in project documentation and awaits a re-profile. DD-411's slow-setup shard breach is runner speed on a story branch, recorded under DD-279 without counting against its allocator criterion. DD-347's third row-pressure exposure keeps it open; its remedy reshapes shared guidance reads and is not selected here. DD-374 and DD-378's responses are on `main` and released in `v0.3.80`; their observations remain open.

**Maintenance assessment (2026-10-25):** Select one new project response: SEED-151#balance-test-shares (since implemented and closed; story recoverable at `8dd20d66:.planning/seeds/SEED-151-test-share-reliability.md#balance-test-shares`), queued at the time, not resolved, for DD-279's renewed allocation failure in plan 350. This demonstrated CI failure outranks the strongest alternative, DD-336's one loaded-run missing-result failure whose cause remains unknown. The browser-restart and mouse-press repairs have no established post-fix recurrence; DD-320 still awaits a qualifying paid replay and is not duplicated. Direction and existing work remain unchanged. No new occurrence is created by this review.

**Maintenance assessment (2026-10-21):** DD-309's measured repository-tooling response first ships in `v0.3.67`; later usage remains unobserved. DD-297's source-directory race was repaired at `059cda6920e0934f4288641d2f4cfa8927d6726b`, while its separate loaded child-start observation remains qualified. The selected response to DD-320's extra paid run and inconclusive replay is implemented at `fba97e9fbb90c4f97909a5e2ab899a0031c58308`: the [maintained pre-launch comparison](../../tests/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch) advances useful learning before spending another native run; its native outcome remains unobserved. The strongest alternative is the older browser-restart race (DD-296): its concrete failing callers were repaired, and the remaining related exposure has no new observed failure. Preserve that residual and other open findings without another implementation commitment. Existing repaired responses remain historical; incomplete exposure does not establish retirement. No new occurrence is added by this review.
