# Production-watcher policy test measurements

Measured on 2026-10-29. Consolidating overlapping policy checks removes two
successful full-app activations while preserving real watcher orchestration.
The normal local family improves; these hosted observations do not establish
an overall CI speedup.

## Coverage and workload

Baseline `80678d4a7be69459952dcf533b8d3486d57566ea` has the runtime of
`b8ad020a2ec8d12b26a5ef6db6ed3308833dc2f5`. Dashboard changes are published
at `90ea771039c36761b5973ab728e73ddcbce19935`. The repaired candidate
`f84ddb572a990a40d18ab5e8f4aa5957e9c48754` adds only a CI test-fixture
registration handshake and plan evidence; its dashboard code is identical.

The original seven-case production update journey remains. Its successful
policy activations fall from five (E/F/H/Q/S) to three (E/Q/S), and successful
watcher builds across the journey fall from eight to six. Each version also
has one held shutdown build and the suite's global Vite build. Failed R/S
preparation attempts remain real and may repeat; there is no exact total
attempt-count claim.

The published policy change joins E's accumulated application range. The
original F/H extra/documentation policy variation moves to an added real-Git
qualification case, including a conflicting dirty local workflow and exact
mixed, excluded, qualifying and accumulated path results. Each fixture retains
its private repository and process state. The actual watcher still proves:

- Excluded ranges do no install, build or restart, with live PID and page.
- Published policy wins over local edits; accumulated changes activate once
  at the latest selected commit, with real replacement and gate-prefix checks.
- Unsupported-policy and failed-build recovery remain distinct. The repaired
  policy ignores workflow/docs changes, so recovery requires retained
  application paths rather than a conveniently qualifying repair file.
- Only successful activation advances the baseline; the next excluded range
  skips without work. Serving, shared records/configuration and cleanup remain.

The [original-observation ledger](https://github.com/terryyin/open-dough/blob/90ea771039c36761b5973ab728e73ddcbce19935/.planning/slice-plans/373-production-policy-ci-time/coverage-map.md)
records the surviving/replacement assertions. New qualification proof passed
before narrowing the expensive journey. Deliberately reading the wrong
published policy and dropping qualifying application paths each failed their
observing assertion; those diagnostic faults were fully restored.

## Normal local feedback

Same command, filters, dependencies, relevant environment and default worker
configuration before and after:

```sh
env -u NO_COLOR npm run test:dashboard -- \
  production-watcher-updates.spec.ts production-qualification.spec.ts
```

| Revision | Selected | Wall | Reporter elapsed |
| --- | ---: | ---: | ---: |
| Baseline | 10 | 74.68s | 74.315s |
| Candidate, pass 1 | 11 | 67.53s | 67.091s |
| Candidate, pass 2 | 11 | 67.75s | 67.356s |
| Candidate, pass 3 | 11 | 67.30s | 66.895s |

All commands reached terminal zero with strict passes, no skips or retries.
All ten original case identities remain, plus the new real-Git case. Replacement
and setup costs are included. Wall time is 9.3–9.9% lower in these observations.
The host has 16 logical CPUs and 48 GiB RAM; default configured capacity is
eight workers, not a claim that both owning specs use eight active workers.
Load/free memory varied and unrelated machine work is unknown. One baseline
limits precision. The broader normal production watcher/deployment/qualification
selection passed all 27 cases in 84.83s. All five implementation proof runs
ended without surviving processes or retained output directories.

## Hosted CI

All runs use the same `ci.yml` commands on `ubuntu-24.04`, twelve dashboard
shards and four observed workers per shard. Baseline selects 1,740 cases in
580 owning files: 1,736 pass and four existing platform skips remain. Each
candidate selects 1,741: all original identities and verdicts remain exactly,
plus the passing real-Git case. There are no extra attempts. No worker, shard,
weight, retry, clock or second-server setting changes.

| Revision | Run | Verdict | Max dashboard job | Max suite | Full CI | First queue / start spread |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Baseline `80678d4a` | [40825747965](https://github.com/terryyin/open-dough/actions/runs/40825747965) | 16 jobs pass | 217s | 191.42s | 221s | 3s / 1s |
| Candidate `90ea7710` | [40830010312](https://github.com/terryyin/open-dough/actions/runs/40830010312) | Node job fails* | 227s | 194.69s | 229s* | 2s / 1s |
| Repaired `f84ddb57` | [40832680173](https://github.com/terryyin/open-dough/actions/runs/40832680173) | 16 jobs pass | 225s | 194.34s | 228s | 3s / 0s |
| Same `f84ddb57` | [40833205738](https://github.com/terryyin/open-dough/actions/runs/40833205738) | 16 jobs pass | 226s | 203.70s | 230s | 3s / 1s |

*All twelve dashboard jobs passed, but an unchanged custom-provider test
expected confirmed observer shutdown and received retained shutdown. A
deterministic slow-registration diagnostic reproduced an unread startup D
failure: the fixture's hold/release functions were no-ops. The runtime correctly
retained that failure. The fixture repair waits for public `register-push`
before returning discovery, matching the existing GitHub fixture contract.
Shutdown, acknowledgment and liveness assertions remain intact. Three complete
six-case passes and six downstream/safety files (53 top-level plus four nested
cases) passed before the green repaired CI. The failed run's 229s is time to a
failed result, not time to green CI.

Dashboard-job seconds include setup, suite and artifact handling. Suite seconds
are reporter elapsed. Full CI runs from workflow creation to the last job's
completion, including queues. Maximum job and suite can belong to different
shards. Baseline and the final repeat are manually dispatched; candidate/repair are
push-triggered. Runs are sequential. The two repaired runs use the identical
complete revision; the repair differs from the first candidate.

| Run | Range/published-policy case | Recovery case | Update chain, including shared hooks | Qualification cases |
| --- | ---: | ---: | ---: | ---: |
| Baseline | 27.959s | 40.978s | 129.923s | 2.206s |
| Candidate | 15.474s | 39.110s | 116.837s | 2.526s |
| Repaired | 14.346s | 42.254s | 120.714s | 2.785s |
| Same repaired revision | 21.274s | 78.809s | 194.809s | 2.114s |

The first policy case is 24–49% shorter across all three candidate dashboard
observations. The complete update chain varies from 116.84s to 194.81s around
the 129.92s baseline, so there is no established chain-elapsed improvement.
Unchanged recovery varies from 39.11s to 78.81s; ordinary update and shared-hook
costs also rise in the repeat. Two fewer activations do not guarantee a shorter
critical path. Passing full CI is 228s/230s versus 221s, and longest dashboard
jobs 225s/226s versus 217s: this sample is slower overall, not a CI speedup.

Unchanged dashboard-fixture accumulated spans vary from 1,115.13s to
1,305.19s/1,302.27s/1,203.54s, while origin spans are 84.07s versus
85.72s/83.44s/88.19s. These nested accumulated spans are not elapsed CI seconds
and must not be added together. Shared runner headroom, cache state, startup
and other long-case variability limit causal attribution.

## Evidence

Strict local records, literal commands, discrimination observations, quiescence,
complete HTML reports and parsed selection/timing comparisons are temporarily
retained under `/private/tmp/production-policy-ci-time-171` on the measurement
host. GitHub run links and named revisions identify the reproducible workload;
workflow artifacts remain subject to retention limits. The change is retained
for cheaper equivalent policy proof and consistently faster normal local
feedback. Overall elapsed CI improvement remains unproven in this sample.
