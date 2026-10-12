# Bound the dashboard suite's compile-cache growth

**Identity:** SEED-131#bound-suite-compile-cache
**Source:** [selected story](../../seeds/SEED-131-repository-test-feedback.md#bound-suite-compile-cache)

## Goal and scope

Contributors can repeat dashboard proof with fresh fixture paths, including
overlapping runs, without the suite's descendant processes accumulating Node
compile-cache files. Disable caching at the dashboard test configuration
boundary, before global setup and workers launch children. Keep public dashboard
commands outside the test runner unchanged. Record effectiveness and measured
cost in [DD-287](../../../ProjectFindings.md#dd-287) at completion.

Preserve strict reporting, assertions, exit status, existing deadlines and
process cleanup. No shared-cache deletion, cache migration, machine-wide quota,
runtime or CI policy change, installed skill change, or proof-selection feature.
The policy covers suite-created descendants, not an explicitly enabled caller's
Node startup cache before the configuration loads. Existing non-cache cleanup
limitations after a hard kill remain; do not promise universal fixture recovery.

## Existing solutions and current decisions

PFE found the appropriate owner in
[playwright.config.ts](../../../dashboard/playwright.config.ts): npm and direct
Playwright invocations already share this entry. Its environment reaches
[global setup](../../../dashboard/tests/support/globalSetup.ts), the
[build helper](../../../dashboard/tests/support/dashboardBuild.ts),
[Vite servers](../../../dashboard/tests/support/viteAddress.ts),
[dashboard commands](../../../dashboard/tests/support/dashboardCommand.ts), and
[published fixture environments](../../../dashboard/tests/support/publishedMainFixture.ts).
Use that inheritance instead of adding per-launch patches or changing production
process code. Existing per-run build deletion and process-group shutdown own
different resources; neither is a compile-cache lifecycle. The shell runner and
repeat helper contain no reusable cache policy.

Select `NODE_DISABLE_COMPILE_CACHE=1` in the test configuration. Node's
[module documentation](https://nodejs.org/download/release/v24.15.0/docs/api/module.html)
describes its effect on `enableCompileCache`; the local observations below
exercise Node v24.21.0 with locked Vite 8.3.0. The installed Vite and Rolldown
CLI launchers call `enableCompileCache`. This is no proof that a separate
Rolldown CLI runs during every test. Inheriting one policy avoids maintaining
a guessed list of cache-producing executables.

Compared alternative: allocate a unique per-run cache and remove it at teardown.
The baseline below measures caching into an isolated directory. It shows no
useful speed advantage in these selections; allocation and deletion would also
need failed-setup and hard-interruption recovery. Disable writes instead of
adding that lifecycle. No global cleanup or extra runner is needed.

[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports reusing the existing responsibility and the smallest measured solution.
[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this test-local
design with its feature documentation. The ADR index and
[North Star](../../NORTH-STAR.md) establish no additional cache policy; no new
architectural direction or exception is needed. Follow [AGENTS.md](../../../AGENTS.md).

## Decisive premises and preparation observations

Observed on 2026-10-12 in
`/Users/terryyin/git/open-dough/.worktrees/bound-the-dashboard-suite-s-own-compile-cache-di`,
revision `326ba9738a799f6701de867213435e2e54475750`, macOS, Node v24.21.0,
after `npm ci --no-audit --no-fund`. Every counted run used the configured strict
reporter, no retries, one worker, captured empty output, and exit 0.

Literal consuming commands, with `TMPDIR` pointing at a new owned directory and
`NODE_COMPILE_CACHE`, `NODE_DISABLE_COMPILE_CACHE`, `NO_COLOR`, and `FORCE_COLOR`
removed from the parent environment:

```sh
npm run --silent test:dashboard -- production-deployment.spec.ts --grep 'deployment installs' --workers=1
npm run --silent test:dashboard -- authenticated-project-overview.spec.ts --workers=1
```

For each disabled observation only, prepend the scratch line
`process.env["NODE_DISABLE_COMPILE_CACHE"] = "1";` to the actual configuration.
Measure elapsed monotonic time and sum file sizes/counts under
`$TMPDIR/node-compile-cache` after each command exits. Retain that directory
between runs within each comparison. Restore the exact configuration afterwards;
all scratch source edits were reverted before writing preparation records.

| Consuming observation | Seconds | Cache files / bytes after exit | Result |
| --- | ---: | ---: | --- |
| Fresh deployment, baseline first run | 8.413 | 867 / 10,784,756 | Existing journey passes; writes reproduced |
| Fresh deployment, baseline second run | 8.106 | 1,030 / 18,839,696 | New fixture paths add 8,054,940 bytes |
| Fresh deployment, scratch policy first run | 7.696 | 1,030 / 18,839,696 | Journey passes, no added files or bytes |
| Fresh deployment, scratch policy second run | 8.102 | 1,030 / 18,839,696 | Journey passes, no added files or bytes |
| Dev and preview page journeys, baseline | 10.022 | 257 / 10,475,684 | Both modes pass and write cache |
| Dev and preview page journeys, scratch policy | 9.914 | 257 / 10,475,684 | Both modes pass; every cache file's SHA-256 and an unrelated sentinel stay unchanged |

These results settle three premises: the selected real journeys reproduce
growth; configuration-time environment inheritance reaches global build,
fresh fixture install/build/preview, and dev/preview page reads; disabling that
caching preserves their strict verdicts. The no-growth observation discriminates:
the original configuration grows the directory, the scratch policy does not.
It is not a pre-existing automated cache regression test.

Two excluded setup attempts explain the observation conditions. The first
deployment attempt failed the strict reporter on inherited `NO_COLOR` versus
`FORCE_COLOR`; removing both from the probe parent resolved that conflict. The
first page attempt used a long workspace-local `TMPDIR`; its error context said
the request-owner socket path was too long. Repeating the baseline and scratch
comparison with a short `/tmp/dcc-*` directory reached the complete page journeys.
Keep future measurement paths short. Neither failed attempt counts as accepted
behavioral proof or a reason to weaken reporting.

This is a small approach-selection sample, not full-suite acceptance, a speedup
claim, or attribution of the historical 134 GB. Supported Node versions without
this cache API need no new cache implementation; regression helpers must respect
the repository's existing Node engine range. Do not depend on a cache layout or
fixed byte count as a public Node contract.

## Outside-in proof ownership

All promises belong to slice 1 and one rule: suite descendants never enable
persistent compile caching. Failure and overlap are boundaries of that rule,
not separate implementations.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Repeated fresh-fixture runs do not accumulate cache | Repeat the real deployment selection above with isolated cache observation; compare directory entries/bytes after process exit. Cover npm and the documented direct Playwright config entry. |
| Global build, worker children, dev and preview inherit the rule | Real build/deployment and dev/preview selections above plus a durable regression that consumes the real suite configuration; removing the policy must make its no-cache assertion fail. Do not inject the disable setting from the fixture being used to prove inheritance. |
| Two concurrent runs remain independent | Overlap two configured runs with fresh fixture roots and attributable cache observations; both strict verdicts pass, and each leaves the other's files intact. Use unique run outputs and owned short temp paths. |
| Failure/interruption requires no cache recovery | Force a controlled child failure and interrupt an owned test process after its child is known to be running. Exercise explicit cache enable/flush attempts before termination, wait for exit, and observe no new cache entries; retain the intended nonzero/signal verdict. Follow with a successful run. Do not count an early kill before any cache opportunity as proof. |
| Existing and unrelated cache is preserved | Hash seeded unrelated entries before and after success, failure and overlap, including a child given `NODE_COMPILE_CACHE`; observe no deletion or replacement. Keep parent startup caching distinct from child writes. |
| Ordinary commands and test verdicts retain their meaning | A control child outside the suite with the same Node/cache capability still writes to its owned cache; existing strict reporter/assertion checks and affected dashboard journeys keep their verdicts. No production command patch. |
| Cost and effectiveness are evaluated | Record revision, Node version, selection, workers, run conditions, elapsed time, bytes/files and outcomes before/after in DD-287. Keep historical evidence and qualify any remaining limits. |

## Execution context

Execution uses Story Branch Mode in
`/Users/terryyin/git/open-dough/.worktrees/bound-the-dashboard-suite-s-own-compile-cache-di`
on `codex/bound-the-dashboard-suite-s-own-compile-cache-di`, reused from the
established start. Publisher: `dashboard-territory.local-open-dough`; assigned
agent: `stanly-chan`. Claim accepted on `origin/main` at
`48ccb61606d5fb614ca3e5129e2857f8eecc062d`; starting revision:
`a54368f58f0f4cdd9f267db80a45f82e700132ac`. This claim is not covered by the
story-branch observer. The first increment's previously published base is the
claim SHA. No new claim or workspace is required. Replanning retains existing
planning authority; no numeric slice budget was supplied.

Checkout setup: locked `npm ci --no-audit --no-fund`, then
`npm run typecheck:dashboard`, both passed on 2026-10-12. The check-only
`.githooks/pre-commit` owns staged lint and script-triggered dashboard typecheck.
No generator is triggered by the planned configuration/test/documentation edits.

CI: GitHub Actions `terryyin/open-dough`, verified selector `ci.yml` (name `CI`),
target `codex/bound-the-dashboard-suite-s-own-compile-cache-di`. Codex yielded
observer: coordinator `stanly-chan-seed131`, directory
`/tmp/dough-ci-501/watch-UyPB8W`, PID `70101`, session `41830`, cell `7`;
runtime is this checkout's `.agents/skills/dough-execute-plan`. Managed delivery
must reuse this coordinator and directory. Dashboard landing context remains
`/Users/terryyin/.open-dough/dashboard/reporting/08331263-6cd3-4850-9b83-39a8f63da5f1/landing-context.json`
for the first later trunk landing.

## Ordered slices

### 1. Dashboard proof leaves no descendant compile cache to reclaim
Type: Behavior
Status: done
Proof: all mapped observations above, a discriminating automated regression,
the affected strict dashboard suite, and the resulting DD-287 evaluation.

Behavior: given a normal documented dashboard test launch and arbitrary fresh
fixture paths, including concurrent launches and an owned failed/interrupted
run, running the suite disables persistent compilation caching in its
descendants. Existing cache stays intact, successful tests remain silent, and
failure keeps its original verdict. Ordinary commands outside the suite retain
their current policy.

Implement the policy in the existing configuration before setup/worker child
creation. Add the smallest regression at the suite boundary, using existing
test/process support; it must observe real cache effects rather than only the
presence of an environment variable. Include controlled flush/failure and
overlap cases without adding a general measurement framework. Keep existing
cleanup responsible for processes and other fixtures. Document the policy and
interruption consequence in `dashboard/tests/README.md`, then evaluate DD-287.

The focused loop is the new regression plus the two observed selections above.
Before delivering the slice, run `npm run test:dashboard` with the strict
reporter and `npm run typecheck:dashboard`: the shared configuration reaches
every spec, including launch-environment and production-watcher consumers, so
the broad suite is justified here by that reach, not merely by CI's existence.
If the full run cannot finish or a failure remains, preserve its evidence and
the incomplete promise; do not replace its verdict with a weaker reporter.
Measure disk use on that final run as well, with an owned short temporary root.

Safe stop: the configuration, regression, documentation and evaluation form one
delivered outcome; no deferred cleanup slice or Structure slice is needed.
Scope is one small policy with a longer shared-suite verification loop. No
project-specific numeric slice target or hard limit was supplied.

## Accepted slice proof

On 2026-10-12, the coordinator inspected the configuration policy, regression's
fresh modules/control seed, `unchanged()` entry/hash comparisons, completed
exit-17 and SIGTERM assertions, and simultaneous live children's compiled
markers. Setup never injects disable into suite probes. Inspected global setup,
build/server/fixture consumers and `/tmp/dcc-qwzrq3gf` orchestration and snapshots
establish the real-run inheritance, overlapping fresh roots, runner failure and
interruption after flush, later success, and preserved explicit/default caches.
Removing the policy in an isolated archive makes the regression fail its first
no-growth assertion. The DD-287 evaluation retains the baseline and measured cost.

Passing literal commands: `npm run --silent test:dashboard -- compile-cache.spec.ts --workers=1`;
`npm run --silent test:dashboard -- production-deployment.spec.ts --grep 'deployment installs' --workers=1` (twice);
`node_modules/.bin/playwright test --config dashboard/playwright.config.ts production-deployment.spec.ts --grep 'deployment installs' --workers=1`;
`npm run --silent test:dashboard -- authenticated-project-overview.spec.ts --workers=1` (dev and preview);
`python3 /tmp/dcc-qwzrq3gf/boundaries.py`; `python3 /tmp/dcc-qwzrq3gf/failure-interruption.py`;
`npm run test:dashboard` (strict exit 0, 1,551 selected / 484 files, eight workers,
750.830 seconds, unchanged 94 files / 306,427 bytes and every SHA-256);
`npm run typecheck:dashboard`; `git diff --check`. Independent refactor preserved
configuration/spec bytes and all runtime proof; it extracted documentation only,
preserving finding anchors/evidence and checking local links. No generator applies.

## Story obligations

### G1. Caller startup writes before configuration
Reported: slice 1 — "The first fresh npm caller launch added 93 files / 306,396 bytes before configuration loading."
Story clause: "A caller explicitly enabling Node caching before Playwright loads its configuration may still cache that runner's startup"
Disposition: excluded "the promise concerns the suite-created descendants and fresh fixture growth, not changing the calling shell's policy"

### G2. Version and timing measurement limits
Reported: slice 1 — "Other Node versions were not executed; timing samples establish no stable speedup or full-suite penalty."
Story clause: "Measure actual disk effects and elapsed proof time against the current launch"
Disposition: proved by slice 1: DD-287's qualified current-Node baseline/candidate evaluation; feature detection and typecheck preserve the existing engine range without claiming a version matrix or speedup.

### G3. Historical cache attribution
Reported: slice 1 — "The historical 134 GB attribution remains unknown."
Story clause: "without those test subprocesses accumulating Node compile cache on the shared machine"
Disposition: no user cost "without those test subprocesses accumulating Node compile cache on the shared machine": the verified prevention outcome does not require attributing historical writes; the original uncertainty is preserved in DD-287.

### G4. Individual full-run pass and skip counts
Reported: slice 1 — "Individual full-run pass/skip counts are unavailable from that reporter."
Story clause: "the sibling proof-selection story are outside this delivery"
Disposition: excluded "the sibling proof-selection story are outside this delivery"

### G5. Non-cache recovery after hard kill
Reported: slice 1 — "A hard kill retains existing non-cache cleanup limitations."
Story clause: "This does not promise that a forcibly killed worker cleans up all its other resources."
Disposition: excluded "This does not promise that a forcibly killed worker cleans up all its other resources."

## Execution complete

Product advice: No new product work or correction is warranted. The existing
proof-selection story remains the next queued priority. Retrospective of published
increment `acf617d7297a124130dc8ed71828e812ad0f5e26` found no implementation or
process correction; Accepted ADRs 0000/0002 and current direction remain aligned.
Process review used coordinator history and agent returns; private subagent tool
histories were unavailable. Conclusions remain conditional on applicable CI.
