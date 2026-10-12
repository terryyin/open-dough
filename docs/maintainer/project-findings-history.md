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
