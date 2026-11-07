# Restore default timeouts across automated tests

**Identity:** SEED-260#restore-default-test-timeouts
**Source:** [Restore default timeouts across automated tests](../../seeds/SEED-260-restore-default-test-timeouts.md#restore-default-test-timeouts)
**Source review:** [source-only review](source-review.md)

## Goal and scope

Developers get prompt, reliable test results at the runner's default case
timeout wherever possible. Finish the dashboard suite and its fixtures first,
then the remaining Node and shell checks. Keep the existing behavioral
protection, including the real watcher activation and recovery paths. The seed
owns the exception rule and deferred scope.

## Existing solutions and direction

- Reuse the normal runners, their timing artifacts and the pending optimization
  candidate list. Restore the case default wherever the measurements support it.
  Classify inherited runner timeouts, fixture allowances, assertion and command
  bounds, product deadlines under test, and CI job or suite safeguards before
  changing a setting. [Test automation rules](../../../AGENTS.md#test-automation),
  [Playwright timeouts](https://playwright.dev/docs/test-timeouts),
  [repository time budget](../../../tests/time-budget.md).
- Use the existing paused page clock and request observations for cadence, private
  launch origins and host signals for launch progress, and the watcher fixture's
  build gates and reported activations for deployment. Borrow the approach of
  a hardware-in-the-loop bench. The fake origin supplies controlled inputs, a
  build gate introduces a fault or holds a step, and the real watcher and
  preview produce the observed result. A substitute preview would lose proof
  of actual serving and process cleanup.
  Keep real build, preview and process ownership wherever they distinguish the
  preserved behavior. [Dashboard synchronization](../../../dashboard/tests/README.md#synchronization),
  [journey writing](../../../dashboard/tests/writing-journeys.md),
  [production watcher support](../../../dashboard/tests/support/productionWatcher.ts).
- Judge a strategy on preserved protection, per-case margin, shared setup and
  teardown cost, and time to a strict result under comparable load. The prior
  watcher and second-server decisions protect the unique integrated journeys.
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  [accepted necessary costs](../../TEST-OPTIMIZATION-CANDIDATES.md#accepted-necessary-costs).

## Decisive premises observed during preparation

| Consuming operation and profile | Observed result |
| --- | --- |
| Pinned Playwright 1.63.0 at `7df3068ab`, on an awake AC-powered Mac, `npm run --silent test:dashboard -- dashboard/backend-tests/review/story-review-completed.spec.ts --grep 'trunk completion isolates interleaved work' --workers=1 --reporter=json`. The second run temporarily removed `test.slow()` from that spec. | The same real-Git HTTP case passed in 6.426s with the marker and 5.902s at default. After restoring the edit, the same selection with the normal strict reporter and proof/times outputs passed in 6.436s with 10.763s runner elapsed. |
| Full hosted Playwright and repository CI at `ad49dffab`, run [42372706379](https://github.com/terryyin/open-dough/actions/runs/42372706379). Read all 12 Playwright reports and both suites' timing artifacts. The diff to the preparation base in the test and runner paths is limited to two dashboard test guides. | 2,119 dashboard passes and eight existing skips. The 51 slow cases took at most 14.139s. Eight other cases exceeded 30s and 25 reached 20s, including 82.112s for watcher policy/build recovery. Its serial file recorded a 28.646s `beforeAll` and 191.9s total. The slowest repository job recorded 49.0s. These costs identify work to measure before changing it. |
| Normal local selection at `7df3068ab`, `npm run --silent test:dashboard -- --list --reporter=json` and `OPEN_DOUGH_TEST_DIR=tests bash scripts/test-jobs.sh` with Homebrew Bash 5 first on `PATH`. | Both dashboard projects selected 2,127 cases in 761 specs across the three roots. The repository runner selected 419 Node jobs and 82 shell jobs. `npm test -- tests/support/dashboard-test-files.test.mjs tests/install-omits-internal.sh` passed with Bash 5. The system Bash 3 was refused by the runner's version check. |

Collect matched before and after measurements for each changed strategy within
its owning slice. Use the current selection and observations to assign other
flagged cases to the slice owning their dominant cost. Confirm current local
and hosted margins at the final gate.

## Outside-in proof and ownership

| Promise | Owner and observation |
| --- | --- |
| Playwright's 30-second default across integrated, frontend and backend tests and their fixtures | Slices 1–8. Inventory `slow`, timeout configuration and mutation, including fixture and nested-run settings. Compare selections and run affected checks through the normal Playwright command. Inspect hook and fixture registrations as well as case bodies. |
| Faster strategies preserve existing protected behavior under normal load | Slices 2–8 for dashboard costs and 9–10 for repository costs. Match existing purposes to the resulting assertions and record comparable timings including setup and cleanup. If a strategy changes the proof boundary, demonstrate that the retained check fails when the protected behavior is absent. |
| Any essential case exception is bounded, measured and traceable | Each owning slice writes the case-local allowance and its pending candidate together. Slice 10's final inventory accounts for each allowance against its measured cost, behavior, strategy trial and follow-up. [Pending candidates](../../TEST-OPTIMIZATION-CANDIDATES.md#pending-candidates). |
| Both full suites pass locally and in hosted CI with coverage preserved | Final gate after slice 10. Review test identities, verdicts and any existing platform skips against the baseline. Review assertion and fixture changes for equivalent behavioral protection. |

Local gates on an awake Mac on AC power use `caffeinate -s -i npm run
test:dashboard` and `caffeinate -s -i npm test` for the required full runs,
with Bash 5 or newer first on `PATH`. Run sequentially through the maintained
suite admission. Before a full run check power, load and available headroom.
Use the maintained battery and sleep-log procedure if applicable. [Machine
sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Every slice and repair handoff carries the [failing and flaky test
policy](../../../AGENTS.md#failing-and-flaky-tests).

At each slice boundary run the affected suite family and any additional
consumers, then use the ordinary commit and CI gates. For dashboard proof,
retain `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` with the strict reporter and
`OPEN_DOUGH_DASHBOARD_TIMES` for file and shared hook cost. For repository proof,
retain `OPEN_DOUGH_TEST_TIMES` and `OPEN_DOUGH_TEST_OUTCOMES`. Record revision,
command, selected cases, runner and worker count, elapsed time and load. Use
the hosted HTML reports for case and hook timing and the shard/share artifacts
for aggregate cost. [Dashboard proof record](../../../dashboard/tests/proof-record.md),
[CI workflow](../../../.github/workflows/ci.yml).

## Slices

### 1. Ordinary dashboard cases run at the default

Type: Behavior
Status: done
Proof: Starting with the Playwright case and fixture inventory, remove every
slow marker and the surplus overrides in cases or files with measured headroom.
Include the completed-story review and Intent comparison families. Run the
affected selections and their fixture consumers under default limits, comparing
case identities and observed verdicts. Assign the inherited allowances that
reach expensive setup or cases to the owning slices below.

Result: removed all 44 slow markers and 437 overrides (case, file, group,
`beforeAll` and the `launchJourney` worker fixture) where every covered case
and shared hook cost at most 15.0s in run 42372706379. Hosted case durations
exclude `beforeAll` time; hook steps were read separately. Proof at `2e09e83c0`
plus the change: list selection unchanged at 2,127 cases. The strict
`npm run --silent test:dashboard -- <327 changed and consumer specs>` run
selected 765 cases, 764 passed, 1 existing skip, 2 local workers, 1197s, load
about 6–9. The slowest de-overridden case was 15.6s. Local runs without
`--reporter` keep the proof and times files. Remaining allowances by owner (file:
CI cost):

- Slice 2: `shared-observer-check-reuse` 51.4s, `revision-stream` file 24.8s,
  `revision-stream-lost` file and case 24.1s, `auto-refresh-rate-limit` 25.2s,
  `cursor-runner-sessions-quiet-rate` 16.2s, `story-readiness-accessible` file
  17.1s (fixture publication).
- Slice 3: `intent-ci-comparison-adapter-gaps` file 27.5s.
- Slice 4: `agent-launch-second-server` 55.6s and `-orphan` 31.5s,
  `responsive-session-recovery` 27.8s/23.4s, `-recovery-restart` 22.3s,
  `-access` 20.1s, `-reconciliation` 17.4s, `-reconciliation-completed` 16.2s,
  `-reconciliation-kept` 16.0s, `agent-launch-preparation-codex` file 17.2s,
  `agent-launch-story-card-open-session` 16.0s, `agent-completion-recovery`
  22.8s, `cursor-runner-replacement` 17.0s.
- Slice 5: `cursor-sessions-sidebar-resize-lasting` 37.3s,
  `recently-done-sessions-sidebar-room` 30.1s, `cursor-sessions-sidebar-layout`
  27.9s, `session-attribution` 25.4s, `agent-launch-story-card-sessions` 25.2s,
  `story-review-touch` file 23.1s, `side-panel-width` file 19.1s,
  `cursor-sessions-sidebar-size-unkept` 16.6s, `session-management-touch`
  16.4s, `agent-launch-recent-sessions` file 15.7s, `agent-launch-recent-delete`
  file 15.6s.
- Slice 6: `production-watcher.spec.ts` `beforeAll` 24.1s and its chain cases,
  `productionUpdateJourney.ts` `beforeAll` 28.6s and case, the
  `production-watcher-updates` cases (37.1s max), `production-deployment` 32.1s,
  `productionUpdatePolicies.ts:26` 25.6s, `production-watcher-failures`
  `beforeAll` 15.9s, backend `production-publication-fixture` and
  `production-watcher-refusals`.
- Slice 7: `productionUpdatePolicies.ts:88` 82.1s, `production-watcher-failures`
  cases (28.0s max).
- Slice 8: `quiet-reporter` 10.6s, nested `hanging.proof.ts` and
  `ordered.proof.ts` `setTimeout(0)`, backend `run-processes` four cases (13.0s
  max), `proof-record-entry` 14.0s.

### 2. Dashboard observation completes on controlled events

Type: Behavior
Status: done
Proof: Exercise the observation and frontend cadence families with observable
request/revision progress or controlled clock advancement. Preserve shared
listings across tabs, hidden and revealed tab behavior, retry timing and
recovery. Start from `shared-observer-check-reuse.spec.ts` (51.378s in CI).
Its three 14.05s wall-clock waits cover expiration in the server while the
page clock is already controlled. Drive the server's reuse window through a
test-controlled clock and recheck the real requests across that boundary.
Measure the cases whose timeout or shared fixture changes.

Result: all eight overrides removed; one case-local allowance remains. A
test-only server clock (`dashboard/server/observationClock.ts`, opt-in
through the harness's `observationClock`) ends the shared reuse window
without real waiting. Local times at 2 workers, before → after:
`shared-observer-check-reuse` 44.1 → 1.7s. `revision-stream` seven pages
12.7 → 2.4s, now polling observed holders. `revision-stream-lost` 21.2 → 7.2s,
with `Retry-After` 6s still past the wrong-timer window.
`cursor-runner-sessions-quiet-rate` 14.5 → 1.7s, on stepped page time; the
runner's label answer keeps its real-time change bound.
`story-readiness-accessible` 5.6s with no strategy change. Mutation checks
failed each changed case at its intended assertion. The observation family and
its consumers ran 383 cases, 382 passed, 1 existing skip, in 236s. The
remaining `auto-refresh-rate-limit` allowance, 45s for 25.2s in CI, waits on
the request owner's real clock. It is recorded as the pending candidate
`auto-refresh-rate-limit-real-waits`; that clock is released payload code.

### 3. Intent comparison produces its actual endpoint verdict promptly

Type: Behavior
Status: done
Proof: In the Intent CI adapter, comparison and summary families, drive
availability or expiration through the observed request/clock boundary.
Preserve the successful verdict and the distinct unavailable or timed-out
endpoint reason. Measure the affected cases, including the Done adapter case
at 27.524s, at the default or with a recorded case exception.

Result: no Intent allowance remains. The Done adapter case waited out the
product's 20s adapter limit against a 25s fixture sleep. The dashboard's
adapter limit now reads `DOUGH_CI_ADAPTER_TIMEOUT_MS` through
`configuredLimit`, with the same default. The case lowers it to 2s against a
discovery that never answers, and still asserts each endpoint's distinct
timed-out reason. It went from 24.3s locally (27.5s in CI) to 6.6s. The slow
proof-read case now holds the read on an observable release: 5.3 → 1.0s. The
reason check failed when the limit did not reach the server. Runs: 7/7,
`--repeat-each 5` 35/35, the adapter family 24/24, and the two repository
adapter tests passed.

### 4. Launch and recovery checks follow host progress

Type: Behavior
Status: done
Proof: Use the launch and recovery families to observe one native session
through the second server, reload and project switch, and the interrupted
worker's recovery using the same claim. Measure the 55.583s second-server and
31.483s orphan examples and affected shared fixtures. Wait on observed host
and process transitions while retaining the same launch and cleanup proof.

Result: all twelve overrides removed; no allowance remains. The expensive
cases were waiting out the page's 15s read cadence and the server's 10s
slow-start threshold, not process startup. They now pause the page clock and
advance one check interval (`passCheckPace`) only after an observed host or
process transition. The second and restarted servers judge the still-running
start slow on first answer (`DOUGH_START_TIMEOUT_MS=1`). Real servers, the
installed start, the owner kill and the live worker are unchanged. Local
times, before → after: second-server 48.9 → 6.3s, orphan 29.0 → 6.8s,
recovery 22.0/18.7 → 6.6/4.9s, recovery-restart 20.0 → 7.6s, access
17.0 → 4.3s. Mutating the slow-start derivation or doubling either read
cadence failed the paced assertions. Runs: 18/18, `--repeat-each 4` at 4
workers 72/72, and the launches, sessions and observation family 572/572.
`agent-completion-recovery` has the thinnest unchanged margin, 22.8s and
17.8s in CI; its cost is real Git and installed-CLI work.

### 5. Session and layout checks observe geometry and restored state directly

Type: Behavior
Status: done
Proof: Run the affected session, sidebar and frontend layout families. Retain
geometry, scrolling, resize, keyboard and reload observations at the relevant
viewport branches. Measure the 37.256s restored split and 30.086s shared-room
examples and their setup. Reuse observable page state to remove elapsed waits.

Result: all eleven overrides removed, including four file-level ones; no
allowance remains. The costs were not elapsed waits. The control
reachability check now measures every control in one browser call, using the
same visibility and native scroll-if-needed rules (`controlReachability.ts`).
`session-attribution` builds its shared preparing origin in a `beforeAll`,
where the 8.9s hook cost stays visible. Local times, before → after: restored
split 12.3 → 3.2s, shared room 8.5 → 3.9s, layout 5.4 → 3.0s, attribution
case 15.3 → 6.4s. Setting the sidebar's overflow to hidden failed the
reachability assertion with the clipped controls listed. Runs: 14/14; 8
workers `--repeat-each 3` 42/42; the reachability consumers 78/78; the rest of
the families 56/56. `agent-launch-story-card-sessions` then timed out at 30s in CI run
42395811294. That runner was CPU-bound: 665 calls, 111 fake host processes,
plus tracing. The repair split it into two cases with every assertion kept,
checks the listing's static expectations together, and ends `launch`'s
dialog wait without a leftover poll. A local stand-in for hosted CI,
24 workers on 16 cores, measured 28.7s → 20.2s per case. The 59 consumer
specs ran 120/120.

### 6. Dashboard deployment proves pinned serving and clean replacement

Type: Behavior
Status: done
Proof: Profile the production fixture's copy, install, build, activation and
cleanup. Remove the hook overrides by reducing the setup cost or sharing only
read-only prerequisites, then run `production-deployment.spec.ts` and the
complete `production-watcher*.spec.ts` chains. Verify the real pinned build,
replacement at the same URL and retirement of the superseded checkout. Retain
hook and file timings, including when the success cases pass individually.

Result: all three hook overrides and this slice's case overrides removed. One
case-local allowance remains. The published-main fixture's first add uses one
pack (`core.bigFileThreshold=1`): `git add` under contention went from about
6s to 0.8s. The watcher and update hooks now only prepare; their first case
waits for and asserts the first activation. The held two-build update case
and the policy case became serial steps with every assertion kept: two tests
became five, changing three identities. Local hook times, before → after:
lifecycle 13.9 → 4.5s, updates 13.5 → 5.4s, failures 10.5 → 7.5s. Local file
times: 36.1 → 30.4s, 78.8 → 67.4s, 52.6 → 48.4s. The seven production specs
ran 31/31. Under six workers at load 14 the hooks stayed within 20.1s and
the owned cases within 19.0s. The deployment case keeps `test.setTimeout(45_000)`
(32.1s hosted before; 7.3s local after) as the pending candidate
`production-deployment-pinned-build`. Slice 10 reads its new hosted time and
removes the allowance when the margin supports it.

### 7. Watcher recovery retains the previous successful baseline

Type: Behavior
Status: done
Proof: Start with the measured 82.112s recovery case and its two types of
rejection. Use the existing watcher gates to drive rejection, repair and retry.
Measure repeated build and retry costs and try a cheaper path around those
operations while preserving the real boundary. Run the full watcher chains
and qualification checks. Observe the old preview serving on failure, the
repaired candidate activating, the next excluded range using the new baseline,
and process/checkout cleanup. If real integrated work still needs a longer case
budget, record the smallest justified allowance and the cost left to address.

Result: every override removed; no allowance remains. The recovery case
(27.0s locally, 82.1s in CI) spent its excess on two redundant real stagings:
R retried and S failing on the still-present fault. It became five serial
steps with every assertion kept. S is published while R prepares, and the
fault is removed only after asserting `Keeping q at`, the running Q preview
and MAIN P. Local times are 3.0/6.1/4.0/6.0/2.4s. Two failures cases became
steps: the failed preview and the post-hang-up restart. The largest owned
step under six-worker stress was 20.5s. Mutation checks failed the steps
twice: when the baseline advanced on a build failure, and when the comparison
base moved to the failed commit. The seven production specs ran 37/37, and
74/74 under stress.
In CI run 42399373902 the retried-build case then timed out at 30s. On the
hosted runner, one staging costs 11–15s, and that case paid for two while
its hook held a third. Its repair moves the first activation out of the hook
into the file's first case and splits the failed build from the retry, so
each test stages at most one deployment. Under eight workers with tracing,
the three cases took 15.0, 10.1 and 17.0s against 25.2s before. Skipping
the retry in the watcher failed the retry case.

### 8. Nested Playwright watchdog and reporter cases retain useful failure evidence

Type: Behavior
Status: done
Proof: Run `quiet-reporter.spec.ts` and the affected process/deadline proof
specs with their nested fixtures. Distinguish the deliberate nested run
deadline from the case timeout and exercise the intended failure trigger.
Check terminal verdict, completed and unfinished case evidence, retained trace
and process cleanup. Prefer a bounded fixture that observes the stop event.

Result: all eight overrides removed; no new allowance. The nested fixtures'
`test.setTimeout(0)` was inherited rather than a scenario input. Their stop
comes from the run's 8s `globalTimeout`, SIGINT or a group kill, and they are
now bounded by the nested default. The deadline cases now assert that no
nested case timeout fired. The interruption record expects the unfinished
attempt rather than an always-true status check. Forcing a 2s nested case
timeout failed both deadline cases at "Timed out waiting". The run-processes
config deadlines of 5s and 3s are expirations under test. Runs: 15/15, and
75/75 with the other reporter consumers at `--repeat-each 3`. The dashboard
inventory finds no slow marker, group, fixture or configuration timeout.
Two case-local allowances remain: `auto-refresh-rate-limit` and
`production-deployment`, 45s each. Fixed elapsed waits that do not approach
a case timeout, such as absence windows and short settle delays, are outside
this story's timeout scope. The execution report lists them.

### 9. Node checks use native defaults and deterministic progress

Type: Behavior
Status: done
Proof: Use the repository runner's Node selection, including `src/skills` and
`tests/support`, to audit options, helpers and nested invocations. Replace
case-budget workarounds and implicated elapsed waits with event or controlled
clock proof. Run each affected file through `npm test -- <path…>` and compare
the observed lifecycle or failure result and job cost. Preserve the runtime
deadlines the checks exercise and measure against the CI job budget separately.

Result: the Node selection has 419 jobs, and the runner passes no
`--test-timeout`. Twelve case `timeout` options in six execute-plan test
files were stall bounds below Node's infinite default, and each case keeps
finite assertion or fixture bounds; all twelve are removed.
`github-request-owner-start` reaches the real 30s owner start limit on
`t.mock.timers`, 30.7s → 0.4s: 25/25 sequential runs and 36/36 parallel
runs. `ci-github-diagnostic` asserts the recorded maximum of 8 concurrent
requests instead of watching a 300ms window. Raising the start limit or the
concurrency limit failed the changed checks. The seven jobs passed in 8.4s
of wall time (30.8s before). Product deadlines, command bounds and whole-run
safeguards are unchanged. Short negative windows remain, such as
`local-test-suite` `delay(150)`; they have no budget impact.

### 10. Shell checks surface deterministic results at their normal settings

Type: Behavior
Status: planned
Proof: Audit the repository runner's shell selection and sourced fixtures.
Drive the affected checks through their real wrappers with observable child
state and controlled expiration where needed. In the watchdog family, observe
termination, retained diagnostics, exit status and cleanup. Compare each
changed job under `npm test -- <path…>` and then run the final gate.

Progress: the shell audit found 82 jobs, with no case-budget workaround in
them or their fixtures. `native-setup.sh` and `ci-lint-setup.sh` now wait on
the child's process state through the shared `tests/helpers/process-state.bash`
instead of fixed sleeps. Removing the process-group kill failed both. The
watchdog family, including `native-run-timeout.sh`, is unchanged and passes
at normal settings. Hosted runs vary up to about 2× per case, with a p90 ratio
of 1.53 against the baseline. Nine dashboard journeys reached 22–28.5s hosted
without an allowance; they were split or had real costs removed, keeping
every assertion. Under a 24-worker or 16-worker traced stand-in:
one-shot refresh went from timing out to 26.5s at most, system settings
14.6 → 9.2s, and touch review 24.4 → 19.9s at most. The watcher-updates,
watcher and failed-preview steps each now stage at most one deployment.
Readiness gaps, attention and story-card Taken became separate cases.
The changed specs and helper consumers ran 52/52 at default limits.
Still near 22s hosted with no practical cut:
`productionUpdatePolicies` single-staging cases,
`responsive-session-reconciliation` and the story-card completion case. The
one-shot refresh split covers the empty-capture fallback only through
`story-review-one-shot-unavailable.spec.ts`. The final gate follows.

## Final gate and safe stops

Each completed slice keeps its affected checks green with the same proof and a
measured budget. If a case passes alone and fails under normal load, diagnose
and repair it through the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Where the evidence cannot show preserved coverage, keep the last proved
strategy and resolve the proof before delivering a change.

After slice 10, reconcile the dashboard and repository inventories with the
pending candidate list. Check every remaining case allowance for a measured
reason and confirm there are zero slow markers and zero inherited case-timeout
overrides. Run both full local suites under the local gate above. Compare the
completed records with the baseline and inspect the full hosted CI for the
delivered revision, including all dashboard shards and repository shares.
Report measured case margins and any setup, teardown or time-to-result change
separately.

## Concern evidence

Slice-plan refinement was unnecessary. The dashboard slices own separate
observations or cost sources, and the repository slices use the respective
runner boundaries. The production setup slice precedes the recovery case that
consumes it. The first slice provides a safe stopping point with the original
cases and default limits for measured low-cost work. The review found no
remaining blocking slice concern. Candidate strategy costs are measured in the
owning slices before accepting any change or exception.
