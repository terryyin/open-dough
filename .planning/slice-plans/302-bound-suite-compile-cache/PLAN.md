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

## Ordered slices

### 1. Dashboard proof leaves no descendant compile cache to reclaim
Type: Behavior
Status: planned
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

## Review and execution gates

Slice-plan refinement is not needed: one common policy owns one cohesive
outcome, all final promises have proof, and the observed premises support its
location and approach. No remaining slice-specific concern was identified.
Concurrency, forced termination and full-suite effectiveness are implementation
acceptance work, not claimed preparation results.

When execution is authorized, use the normal independent post-change refactor,
focused proof, commit and delivery gates from the installed execution workflow.
Normal commit hooks remain mandatory. This preparation itself changes only
records: check their links, recorder output, and whitespace; do not implement,
Take, or report DD-287 resolved during planning.
