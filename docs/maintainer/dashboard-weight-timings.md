# Dashboard timing-weight experiment

Measured on 2026-10-29 for SEED-173. Refreshing timing weights through the
existing allocator did not improve overall CI in the two candidate runs.
Fresh baselines took 229s and 216s; the identical candidate took 245s and 242s.
The means are 222.5s versus 243.5s: 21s (9.4%) slower in this sample.
The candidate remains on `codex/dashboard-ci-balance`; it is not on main.
It is unsuitable for production delivery as a CI speed improvement.

## Experiment and preserved proof

Baseline `15f35ac010da59083d254ca8dabcf5ebe7dd2f8b` adds preparation metadata
to the runtime of `d57a83b2bc6d6f9e84814c34de2b6a6dbdfa1763`.
Candidate `874ef52c0e99857feefde9b4058673c83029d875` changes only the four
dashboard duration lists and planning evidence. No allocator, workflow, test
body, assertion, fixture, isolation, retry, timeout or dependency changes.

The existing `scripts/test-shares.mjs refresh` consumes all 36 timing artifacts
from the two fresh baselines below and supporting main run
[40834521203](https://github.com/terryyin/open-dough/actions/runs/40834521203)
at `d57a83b2`. Existing aggregation takes the maximum observed duration per
spec, including each executed beforeAll/afterAll hook once. Every output
weight was checked against the input maxima. The four indexed parts retain
their ownership/includes: 519 existing weights change, 51 remain unchanged,
10 previously unrecorded specs gain weights, and none is removed.

All 580 discovered specs have one weight and one owning shard. Public before
and after listings preserve all 1,741 full test identities and their native
ordinary/deployment project partition. The refresh moves 522 specs containing
1,575 cases. Unsplit local selection is identical. Weight changes affect the
split assignment, not the native serial deployment scheduling.

Every measured full run passes all 16 jobs, with twelve dashboard shards and
four actual workers per shard. Each selects the same 1,741 identities in 580
files: 1,737 expected passes, the same four Ubuntu platform skips, zero extra
attempts. HTML-report identity/verdict comparison finds no additions, losses
or changed outcomes. Existing real integration tests and private fixture,
process and repository lifetimes run unchanged; listing alone would not
establish that execution proof.

## Hosted observations

All runs use the same `ci.yml` commands on `ubuntu-24.04`. The four measured
runs are sequential, with no competing owned CI measurement. Both baselines
use the same complete revision; both candidates use the same complete revision.
The supporting main run trains the weights but is excluded from baseline means.

| Run | Trigger | Max dashboard job | Max browser suite | Full CI | First queue / job-start spread |
| --- | --- | ---: | ---: | ---: | ---: |
| Baseline [40839078106](https://github.com/terryyin/open-dough/actions/runs/40839078106) | manual | 226s | 202.59s | 229s | 3s / 1s |
| Same baseline [40839642385](https://github.com/terryyin/open-dough/actions/runs/40839642385) | manual | 213s | 187.37s | 216s | 3s / 0s |
| Candidate [40843580744](https://github.com/terryyin/open-dough/actions/runs/40843580744) | push | 242s | 200.94s | 245s | 3s / 1s |
| Same candidate [40844264135](https://github.com/terryyin/open-dough/actions/runs/40844264135) | manual | 239s | 196.87s | 242s | 3s / 0s |

Full CI is workflow creation to the last job's completion, including queue.
Job duration includes setup, browser command, artifacts and teardown. Browser
suite is reporter elapsed. The maxima can belong to different shards. The
dashboard is the final job in every run; queue is not the observed regression.

The refreshed preview predicts 678.3–678.5 accumulated spec-seconds per shard.
Those sums are neither elapsed nor CPU seconds. Actual reporter elapsed is:

| Run | Shortest suite | Longest suite | Suite spread | Final job |
| --- | ---: | ---: | ---: | --- |
| Baseline 1 | 131.48s | 202.59s | 71.11s | dashboard 8 |
| Baseline 2 | 121.73s | 187.37s | 65.64s | dashboard 11 |
| Candidate 1 | 121.19s | 200.94s | 79.75s | dashboard 12 |
| Candidate 2 | 123.86s | 196.87s | 73.00s | dashboard 12 |

The browser-suite maximum is not reliably shorter, and its spread widens in
both candidates. Equal accumulated weights did not equalize elapsed work
across four workers and native scheduling. The fixed per-job work is also
outside this weight model.

In both candidates dashboard 12 finishes last. Its unchanged type-check step
takes 17s and 16s before the browser command. In the baselines that step takes
12s and 9s, while dashboard 12 finishes before the slowest shard. It was
already present; the new assignment exposes it on the critical path.

Candidate 1's shard-12 browser suite is 200.94s. Candidate 2's shard-12 suite
is 193.00s, while shard 9 has the longest suite, 196.87s. Nevertheless shard
12's total job is 239s versus shard 9's 220s. This demonstrates why browser
maxima alone do not identify the complete workflow bottleneck. Type-checking
does not explain all overhead or prove the whole 21s mean regression.

The baselines themselves differ by 13s, and candidate shard times vary too.
Hosted runner/cache and parallel-work contention limit causal precision.
Two runs per revision cannot establish a population effect size. They do
establish that this candidate has not demonstrated a useful CI speedup.
Moving type-checking alone is not a measured saving and need not recover 16–17s
from overall CI, because another shard may become the critical path.

## Local verification and limitations

The same ordinary allocation command passes before and after, terminal zero,
wall 1.28s each:

```sh
env -u NO_COLOR PATH="/opt/homebrew/bin:$PATH" npm test -- \
  tests/support/dashboard-test-files.test.mjs \
  tests/support/duration-list.test.mjs tests/support/test-shares.test.mjs
```

Both shared-allocator test files also pass, wall 0.29s. Public Playwright
listing commands succeed for unsplit mode and all twelve splits, before and
after. The normal unsplit feedback path does not use the weights, so no
local speedup is expected or claimed.

Eight real subprocess cases for scheduling, shared-hook timings and proof
entry pass in 16.98s with command-only `--workers=1`. This does not alter CI's
four workers. An earlier sandboxed attempt timed out and was stopped,
terminal 137; unchanged process observation failed with `ps` EPERM there and
succeeded outside the sandbox. The identical command then passed with that
precondition restored. No source, test or timeout was changed. Failed logs
remain separate; the recorded failed processes and runner children are gone.
The first allocation invocation also rejected system Bash 3.2 before tests;
the documented Homebrew PATH supplies the required Bash 5.

## Decision boundary and evidence

Do not land the measured weight-only allocation as a speed improvement.
The next credible experiment must model elapsed worker scheduling and account
for fixed per-job overhead, or explicitly reconsider where the existing
type-check runs. Preserve every test, isolation, twelve shards and four
workers. No such allocator or workflow change has been implemented; it extends
the current weight-only plan and needs its scope settled first.

The full candidate, source review and unfinished plan remain on the execution
branch for review. Raw profiles, 48 complete HTML/timing artifact pairs for
the four measured runs, parsed identity/verdict comparisons, local commands,
refresh inputs and consumer dispositions are temporarily retained under
`/private/tmp/dashboard-ci-balance-173` on the measurement host. Supporting
main contributes twelve additional timing inputs. Raw profiles are not
committed. Named revisions and run links identify the reproducible workload;
hosted artifacts remain subject to retention limits.
