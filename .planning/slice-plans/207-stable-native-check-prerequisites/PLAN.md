# Stable native checks with reusable prerequisites

**Identity:** SEED-077#ci-independent-of-package-mirror-stalls
**Source:** [refined story](../../seeds/SEED-077-ci-independent-of-package-mirror-stalls.md#ci-independent-of-package-mirror-stalls)
**Authority:** Refinement and planning only. No implementation, Take, commit,
publication, or new hosted CI run is authorized by this preparation.
**Preparation:** Existing workspace
`/Users/terryyin/git/open-dough/.worktrees/keep-ci-checks-independent-of-package-mirror-sta`,
branch `codex/keep-ci-checks-independent-of-package-mirror-sta`, agent
`darren-chan`, remote `origin`, target `main`, published assignment
`c220e09df86e8ea336592be47cae574cb97c3a04`, integration checkout
`/Users/terryyin/git/open-dough`.

## Goal and scope

Provide fast, repeatable native CI and local checks with reusable compatible
prerequisites and bounded acquisition. Verify Ubuntu's existing browser
libraries, then eliminate routine apt installation in all dashboard shards.
Keep environments identifiable for debugging; native macOS and Ubuntu need not
be identical. Preserve current checks, chosen-check execution, isolation,
cleanup, shard membership/balance, and time budgets.

Do not introduce Docker/Colima, a prepared-image service, mandatory local
containers, test retries, new shard counts, larger budgets, or unrelated suite
optimization. Existing container diagnosis is not the chosen verification path;
only its existing workflow-consistency assertions need compatibility maintenance
if workflow commands or Node selection change. Do not remove that tool as an
unrequested cleanup.

## Existing solutions and constraints

PFE: change the existing workflow's browser installation and cache rather than
create an environment manager. `package-lock.json` already pins Playwright and
its browser revision; native dashboard guidance already installs only Chromium.
The test runner already isolates Git configuration, requires Bash 5, supports
chosen checks, and collects timings. Preserve those responsibilities in
`scripts/test-environment.bash`, `scripts/test.sh`, and `scripts/ci-test-times.sh`.
Native checks already keep installation separate from repeated execution.

Use one maintained Node version selection for contributor/CI verification,
plus the lockfile's dependency versions; make deliberate upgrades explicit.
Do not narrow the product installer's supported Node/Bash range. Do not attempt
to freeze all macOS or GitHub runner packages. Record actual Node, Git, Bash,
Playwright and runner image/host identity with proof so platform changes are
visible rather than claiming a permanently immutable hosted image.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports fast feedback and minimal machinery;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
preserves deterministic CI checks and bounded repeatable execution. No conflict
was found. `.planning/NORTH-STAR.md` has no environment-preparation topic that
constrains this local change; no new architectural direction record is needed.

## Decisive premises and observations

| Premise / consuming operation | Observation and result | Remaining proof owner |
| --- | --- | --- |
| Repeated system acquisition causes the observed cancellation; CI setup consumes test time | Read `.github/workflows/ci.yml`; each dashboard shard restores browser files then unconditionally runs `--with-deps`. `gh api repos/terryyin/open-dough/actions/runs/36884993415/attempts/1/jobs` shows four cancellations during installation; first-attempt shard 5 logs show `Ign:` Ubuntu font downloads. | Slice 1 re-establishes current healthy baseline and tests the remedy on the runner. |
| Native suite entry points already separate setup and execution | Read `package.json`, `dashboard/README.md`, `scripts/test.sh`, `dashboard/playwright.config.ts` and `dashboard/tests/support/globalSetup.ts`: browser tests build current app assets every run; test entry points do not install packages. | Slice 3 exercises repeated real native runs and dependency changes. |
| Workflow changes have a compatibility consumer outside CI | `rg -n 'with-deps\|ci.yml\|node-version\|playwright install' tests scripts dashboard/README.md` identified `scripts/ci-container.sh` and `tests/ci-container.sh`; reading the test shows exact workflow command/version assertions. `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/ci-container.sh` passed silently on 2026-10-02. | Slice 2 preserves the existing assertions without expanding container behavior. |
| Existing runner libraries are sufficient for the actual browser suite | Unobserved. Package inventories and successful browser launch alone are insufficient. Local host is macOS, Node v24.5.0, no `node_modules`, and configured Docker daemon unavailable. | Slice 1 is an early hosted probe; failure stops dependent browser changes. |
| Browser-only setup improves CI while preserving performance and coverage | Historical timing varies from 14 seconds to over six minutes, but this does not establish current healthy timing or remedy performance. | Slice 1 captures a comparable baseline; slice 2 checks cold/warm final CI. |

No hosted probe is run during planning. A runner observation needs a
state-changing branch publication/CI run, so it is explicitly deferred to the
authorized execution's first slice. A false premise changes this plan before
dependent implementation; missing libraries do not authorize containers or
silently restoring routine apt.

## Promise and proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| Full dashboard suite works without Ubuntu package installation | 1: all nine shares execute their actual assigned tests on Ubuntu 24.04, without `--with-deps` or apt refresh. |
| Cold/warm setup is bounded, compatible, and fails as infrastructure | 2: actual workflow runs with browser cache present/absent; deterministic stalled-source and mismatched-version setup cases show a named failure before tests, never a passing verdict. |
| Every current check, shard and time budget is preserved | 2: compare workflow/check inventory and dashboard shard test counts; all hosted jobs pass within unchanged limits; new focused checks use the existing runner. |
| Healthy CI performance does not regress | 1 supplies baseline; 2 compares equivalent cold/warm setup and execution timings including checkout/acquisition overhead, not just test time. |
| Native local checks provide stable, reusable setup without stale assets | 3: real warm repeat, cold setup and dependency-change cases on macOS; actual versions reported and current app built. |
| Real regressions still fail with diagnostics; isolation and cleanup remain | 2 setup failure checks; 3 existing runner regression proofs and a controlled failing native check, restored after observation. |

## Ordered slices

### 1. Establish that the native CI runner can execute every browser check without apt
Type: Behavior
Status: done
Proof: On the execution-owned branch, compare a healthy current-workflow run
with a browser-only run on the same source revision and selected runner/Node
versions. Execute all nine existing dashboard shares, inspect test counts and
failure reports, and retain run/attempt identities and setup/check timings.

Behavior: Given the locked browser and Ubuntu runner's existing system
libraries → run `npm ci`, `npx --no-install playwright install chromium`, and
each share's `npm run test:dashboard` with
`OPEN_DOUGH_DASHBOARD_SPLIT=<i>/9` → every assigned browser test runs and its
real verdict is observed without apt acquisition. Preserve the last-share
`npm run typecheck:dashboard` and app build behavior.

Bounded work: make the minimal browser-only workflow change and maintain its
existing command-consistency consumer in the same candidate so the probe does
not intentionally break other CI checks. The existing diagnostic image starts
from bare Ubuntu and still needs its own `--with-deps` bootstrap; do not remove
it merely to mirror browser-only CI. Update its test to distinguish prerequisite
bootstrap from the shared browser version and suite commands, preserving the
helper's existing behavior without making it the chosen path. Capture runner image identity from
job setup logs. Establish healthy cold/warm baseline from comparable current
CI evidence; unrelated source changes or mirror-stalled runs are not a healthy
baseline. Run another comparable pair only if noise prevents a conclusion.

If libraries/fonts are missing or assigned suite checks fail due to the
environment, identify the actual dependency and stop this path for native
solution reassessment. Do not ship a CI-breaking probe or count a launch smoke
test as full-suite proof. External CI wait is part of this probe's evidence;
there is no invented slice time limit.

Safe stopping point: a verified browser-only native CI path, or retained
evidence explaining why that path cannot yet deliver the story.

### 2. Keep native CI acquisition bounded and cache reuse compatible
Type: Behavior
Status: done
Proof: Execute the final workflow with compatible browser cache and with an
empty cache. Extend the existing native test boundary for any maintained setup
operation to cover unavailable/stalled sources and incompatible prerequisites.
Inspect assertions that tests never start after setup fails and diagnostics
identify the source/stage and recovery. Compare all final job results, shard
counts and setup/execution times with slice 1's healthy baseline.

Behavior: Given an available compatible browser cache, or a cold cache and
healthy sources → run CI → reuse or acquire the locked browser, skip Ubuntu
package refresh, execute every current check, and meet the existing budgets.
Given a stalled prerequisite source → run setup → fail within the explicit
setup bound with an infrastructure diagnosis, before the job timeout and
without reporting tests passed.

Bounded work: keep the workflow and existing cache as the owners. Use a
version/OS/architecture-compatible browser cache identity, with no unsafe
cross-version restore. Select a supported exact Node patch for verification
from one maintained project value after the probe baseline; use the same
selection locally. Bound npm/browser/tool acquisition actually used by this
workflow, including retry totals. Derive explicit setup limits from slice 1's
observed healthy acquisition times with headroom while reserving measured
suite time inside the fixed job limits. Record the chosen values and rationale
in Current decisions before accepting the slice. Do not merely rely on the
overall job timeout or add a second scheduler/setup framework.

Keep reports, timing artifacts and failure propagation. Run
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/ci-container.sh`
when its assertions are affected, along with focused new setup checks through
the runner and `npm run lint` for changed product files. For any added shell
test time, use `bash scripts/ci-test-times.sh <changed-check-path>` per
`tests/time-budget.md`; CI owns final budget acceptance.

Safe stopping point: native CI produces bounded setup diagnoses or full code
verdicts with compatible prerequisites and unchanged coverage/budgets.

### 3. Make repeated native local verification use an identifiable stable setup
Type: Behavior
Status: planned
Proof: On native macOS, follow maintained setup instructions from a clean
disposable checkout, run the affected native checks and full browser suite,
then repeat unchanged. Record actual versions plus separate setup/check times;
the repeat must not reinstall unchanged system packages or npm dependencies.
Exercise a lockfile/browser-version change and missing prerequisite to verify
the matching setup or useful recovery is selected. Never fabricate a version
upgrade that is unavailable; use an existing supported alternate lockfile or
an isolated incompatibility fixture for the error boundary.

Behavior: Given a setup matching the selected Node and locked npm/browser
versions → repeat native checks → run current code with reusable prerequisites,
normal diagnostics and fresh dashboard assets. Given changed dependencies or
missing tools → invoke the native setup/check path → require compatible setup
or stop naming what to install; never silently run a stale browser.

Bounded work: update existing contributor/test/dashboard guidance and only the
minimal native setup validation needed. Reuse npm's lockfile and Playwright's
browser/version validation. Avoid introducing an automatic `node_modules`
cache manager: ordinary `npm test` and `npm run test:dashboard` already avoid
`npm ci`; document reinstall-on-lockfile-change and measure before adding code.
Use explicit timeouts/retry bounds for documented acquisition commands, sharing
the maintained setup operation from slice 2 only when both consume the same
contract. Keep host/system prerequisites explicit rather than auto-updating
the operating system during checks.

Verify chosen-check/isolation and failure preservation with
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/test-runner-selection.sh tests/test-runner-bash.sh tests/test-runner-failure-report.sh`;
run `npm run typecheck:dashboard` and `npm run test:dashboard` for the real
browser path after bounded native setup. Observe a controlled failure through
the existing runner fixture, not by committing a deliberately failing test.
If setup validation changes, its focused error/lockfile-change checks must
exercise the actual entry point, not a copied implementation.

Safe stopping point: both environments provide stable native check entry
points; local repeatability has actual observed proof without a container.

## Current decisions and review

- Terry chose native environments, no Docker/Colima dependency, and full-suite
  validation before removing routine Ubuntu package installation.
- Compatible warm setup runs checks; unavailable cold setup fails clearly and
  promptly. No guarantee of fully offline cold bootstrap or every-source uptime.
- Local speed is measured as avoided repeated setup plus bounded cold setup;
  no numeric local total-time target is imposed. CI budgets remain unchanged.
- The common rule is to reuse prerequisites compatible with selected versions
  and keep acquisition separate from execution. OS-specific library supply
  remains explicit; it does not justify a second environment manager.
- Execute through the project's installed execution workflow if later
  authorized: independent post-change refactoring, focused acceptance, staged
  lint commit hook, delivery and CI ownership remain its duties. Planning
  imposes no additional full local suite gate. No numeric slice target or
  hard limit was supplied; each slice has one bounded observation loop.
- Reviewed slice boundaries and proof ownership: the early runner probe isolates
  the decisive environment risk; CI setup and native contributor use have
  distinct outside-in proof. No further plan-boundary concern was identified.
  Runner compatibility and numeric setup limits are bounded by slice 1 rather
  than asserted as facts.

## Learnings

Execution authorized by Terry's dough-execute-plan invocation on 2026-10-02.
Established execution: publisher `dashboard-mac.lan-open-dough`, agent `dbs-chan`,
Story Branch Mode, workspace and branch as above, integration checkout
`/Users/terryyin/git/open-dough`, `origin` trunk `main`. Claim/published base
`5c55714cbee1340ae40180c256038fb9cc6c6111`, starting revision
`e3f9e4b951818892b9f30db5ba7f4d2ae1dc2276`. Existing planning authority retained.
Locked `npm ci` and `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/ci-container.sh`
succeeded in this exact checkout before implementation.

Slice 1 baseline: workflow dispatch run `36942203715`, attempt 1, unchanged
claim revision, all 13 jobs passed. All nine browser cache restores hit;
healthy warm installation took 13–24 seconds. Node `v24.21.0`, Ubuntu runner
image `20260927.320.1`, locked Playwright `1.63.0`. Baseline logs/jobs:
`/tmp/open-dough-36942203715-baseline.log` and
`/tmp/open-dough-36942203715-baseline-jobs.json`.
Probe publication is explicitly authorized by slice 1; hosted suite proof
remains pending and slice 1 is not accepted as complete.

Probe focused proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/ci-container.sh`
passed. Its workflow comparison asserts browser-only locked install plus shared
suite commands; the separate image bootstrap assertion retains `--with-deps`.
Independent post-change refactoring preserved runtime/assertions, corrected
bootstrap documentation and moved diagnostic guidance into `tests/ci-container.md`.
No rerun was needed for those comment/document edits.

CI source: GitHub Actions `terryyin/open-dough`, verified selector `ci.yml`,
publication/observation target `codex/keep-ci-checks-independent-of-package-mirror-sta`.
Codex yielded observer: coordinator `/root`, cell `14`, session `97439`, PID
`47835`, directory `/tmp/dough-ci-501/watch-Mcfmhh`, exact execution checkout
above. Trunk claim coverage is unobserved; this observer covers branch increments.

### Slice 1 probe and owned CI repair

Published probe `e98441593f71e722b032ab08203c43b43a4c1d56` to the execution
branch; managed receipt reused the observer above. Run `36942598744`, attempt 1,
executed the same 746 tests, 745 passed and one synchronization assertion failed.
No library/font/browser-launch error occurred. Browser install 0–1 seconds,
setup through suite start 11–20 seconds, suites 51–78 seconds and dashboard jobs
66–100 seconds. Summary/report evidence:
`/tmp/open-dough-36942598744-probe-summary.json` and
`/tmp/open-dough-36942598744-reports/`.

Failure `dashboard/tests/agent-launch-attention.spec.ts:164` captured loading
preparation facts between a separate readiness assertion and snapshot call.
Repair polls and returns the same accepted snapshot. Disposable deterministic
DOM-transition diagnostic failed before the repair and passed after it; retained
at `/tmp/open-dough-attention-diagnostic.txt`, logs
`/tmp/open-dough-attention-{red,green-diagnostic,green-journey}.log`.
Focused original journey passed:
`PATH=/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-attention.spec.ts --workers=1`.
All six helper calls stay in this spec; no product behavior or retry changes.

Bounded comparable historical-run inspection found only warm cache hits. A
transient baseline variant will use a new isolated browser-cache key and the
original `--with-deps` setup on this branch, preserving all checks/budgets. It
will be restored to browser-only setup before slice 2; no shared cache deletion.
Cold baseline and full passing browser-only proof remain pending.
Repair stash receipt (clean, no saved changes):
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-HhDbp3/record.json`.

### Slice 1 accepted proof

Repaired browser-only publication `7ab0732b943c676b8933c92d47f40b31849bd110`
passed run `36943286746`, attempt 1, all 13 jobs and all 746 browser tests;
zero unexpected/flaky/skipped. Counts remain 58,69,112,96,66,54,88,83,120.
Warm install 0–1 seconds, dashboard totals 75–100 seconds versus the warm
baseline's 75–128 seconds. Actual Node/image/lock versions match the baseline.
`/tmp/open-dough-36943286746-probe-summary.json` and reports retain observations.

Temporary cold baseline publication `bb0aeae1e04310ac1f63f706eb833426c3191a33`
passed run `36943475674`, attempt 1, all 13 jobs and 746 tests. All nine isolated
cache keys missed. Original browser/system install 21–37 seconds, setup through
suite start 31–51 seconds, dashboard totals 90–118 seconds. Actual Node
`v24.21.0`, image `20260927.320.1`, Playwright `1.63.0`, Chromium build `1243`.
Evidence: `/tmp/open-dough-36943475674-baseline-summary.json` and corresponding
jobs/log/reports. No shared caches were deleted.

Restoration exactly matches passing browser-only workflow and assertions at
`7ab0732`; focused container consistency proof passed again. Independent
refactoring found no further candidates. Slice 1's runner-library premise is
accepted; no apt acquisition is needed for any assigned browser check. Slice 2
owns final compatible-key cold/warm performance comparison and acquisition bounds.
All publications reused the retained branch observer; clean repair receipt restored.

### Slice 2 acquisition decisions and focused proof

Selected verification Node `24.21.0` in `.node-version`: this is the patch
observed in every healthy baseline/probe and verified available from
[Node's official archive](https://nodejs.org/en/download/archive/v24.21.0).
The diagnostic helper reads the same value after its runtime refusals; installer
engine support remains unchanged. Native proof uses a checksum-verified temporary
archive under `/tmp/open-dough-native-node-24.21.0/`, rather than changing host tools.

CI acquisition receives one 180-second deadline before Node setup. Node/npm-cache
and browser-cache actions each have a 60-second bound. npm and Chromium stages
are each capped at 45 seconds and remaining aggregate time; npm fetch timeout is
20 seconds with zero retries. Browser connections are 20 seconds, with all
internal retries/processes stopped by the stage bound. Lint downloads have
5-second connection/20-second total curl bounds and zero retries; the step has
60 seconds and remaining aggregate time. Named failure steps preserve failure
and supply infrastructure recovery for action/tool acquisition.

The aggregate leaves 180 seconds in a six-minute dashboard job: the observed
83-second suite plus 97 seconds for checkout/typecheck/reports/overhead. Browser
45 seconds exceeds the cold baseline's 37-second maximum (which included apt);
final cold acquisition must confirm this headroom before acceptance. Exact browser
cache identity includes OS, architecture and lockfile, with no restore prefix.

Focused command passed:
`PATH=/tmp/open-dough-native-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH bash scripts/test.sh tests/ci-container.sh tests/native-setup.sh tests/ci-lint-setup.sh`.
`tests/native-setup.sh` exercises actual entrypoint failures, expired deadline,
metadata mismatches, real timed process termination and SIGINT/SIGTERM descendant
cleanup; success markers never appear after failed setup. Container consistency
assertions preserve every suite command and the separate image bootstrap.
The lint check extracts the actual workflow shell blocks; Linux GNU-timeout
unavailable/stalled/expired cases are explicitly unobserved on macOS and await CI.

Same-PATH `node scripts/setup-native.mjs npm` performed real locked installation
successfully in one second. Same-PATH
`bash scripts/ci-test-times.sh tests/ci-container.sh tests/native-setup.sh tests/ci-lint-setup.sh`
reported wide existing check/share headroom; both new checks require first-CI
budget acceptance. Final hosted cold/warm proof remains pending.

### Slice 2 accepted final hosted proof

Publication `79f10aed8067a4446a34c1cece7b7d93800c3171` passed cold push
run `36945401278` and warm dispatch run `36945682786`, both attempt 1,
all 13 jobs. All nine exact browser keys missed cold and hit warm. Both executed
746 expected browser tests with unchanged share counts and zero unexpected,
flaky or skipped tests. npm cache was warm in both; no fully cold npm-cache
performance claim is made. Node/image/locked browser match the baseline.

Cold npm acquisition took 2–4 seconds and browser acquisition 7–10 seconds,
leaving at least 41/35 seconds under stage bounds. Aggregate setup took 12–19
seconds. Warm browser setup took 0–1 seconds. Cold dashboard jobs took 77–104
seconds versus baseline 90–118; warm jobs took 79–97 seconds versus 75–128.
Cold first-job-start to last-job-complete span was 149→150 seconds: the critical
job executed 22 seconds faster but started 23 seconds later. Runner admission
variability prevents claiming cold overall elapsed improvement. Warm span was
129→97 seconds. These are observed single-run comparisons, not percentile claims.

Both runs passed 268 shell checks (90/89/89 shares) under unchanged 71-second
per-check and 470-second share budgets. Cold maxima 36.4/28.3/38.2 seconds and
aggregate 300.1/203.7/323.0; warm maxima 36.1/41.2/37.9 and aggregate
309.9/296.5/319.2. Linux unavailable/stalled/expired lint acquisition fixtures
passed (5.4 seconds); native setup fixtures passed (4.1 seconds). Live hosted
outages were not injected; controlled actual-entrypoint failures own that proof.

Evidence and exact timing accounting: `/tmp/ci-proof2-final-evidence.txt`,
`/tmp/ci-proof2-{36945401278,36945682786}-summary.json`, logs and reports.
Independent post-change refactoring and check-only commit hook passed. Managed
publication reused the retained observer. Slice 2 is accepted; native local
repeatability and missing-browser validation remain slice 3's responsibility.
