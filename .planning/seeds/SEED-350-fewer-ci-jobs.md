---
id: SEED-350
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-350 — Fewer CI jobs at the same wall time

<a id="run-ci-on-fewer-jobs"></a>

### Run CI on as few jobs as its wall time allows

**Identity:** SEED-350#run-ci-on-fewer-jobs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/620-fewer-ci-jobs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4937c0d3774785f71d56e8761587ddd9c0ec1f78e86de760888209c5d1d9bcf9","plan":"d56a8c83feaf14e38909fdaed407e0fb9f1251c87de64a69e0e206d519488664"}}
```

#### Goal

A developer pushing to `main` or a Story Branch receives CI's complete verdict
without a longer wait, while each run occupies as few runner jobs as measured
evidence supports. Leave capacity for overlapping pushes and stop job counts
growing merely because an individual job became shorter.

#### Scope

- Reduce runner jobs across the whole workflow. Every Distribution share count,
  every browser group's shard count, lint placement, proof-summary placement,
  and job/run time limits are open. There is no target floor of 19 or 18.
- Compare candidates with a fixed current-layout baseline on the same test
  workload, both alone and overlapping another run. Use matched concurrent
  comparisons and repeated samples to distinguish layout effects from runner
  noise. State the comparison and sampling rule before measuring.
- Wall time runs from workflow creation to the last required job's completion,
  including setup, runner queues, lint and `ci-proof`. Report initial parallel
  jobs and total runner jobs separately. A shorter queue-free dependency chain
  is a diagnostic, not the acceptance measure.
- Keep a reduction only with evidence of no worse wall time in **both** contexts.
  Improved overlap does not buy a slower solo verdict. Inconclusive evidence
  does not establish a pass. Retain passing reductions and record rejected or
  inconclusive candidates with their measurements and comparison limits.
- Finish on the smallest job count that passed the measured comparison. Make
  the search and its exclusions visible; do not claim a mathematical global
  minimum from a few layouts. Consider combined reductions and packing work
  together, rather than stopping at the first one-share reduction.
- Keep every test and its CI proof: selected files/cases, outcomes, producer
  identities and units, missing-part reporting, timing evidence, and artifacts.
  This restriction protects the confidence the developer receives with the
  verdict. A passing smaller matrix with omitted tests or proof is rejected.
- Document the rule in `AGENTS.md`,
  [browser shard sizing](../../dashboard/tests/shards.md), and
  [Distribution share sizing](../../Distribution/tests/test-shares.md): add a
  runner job only when measured whole-run wall time, including queueing under
  the account limit, shows a benefit. Update sizing and budget guidance with
  the chosen layout. Reviewed budget changes may accommodate repacking;
  increasing a timeout alone does not establish an improvement.

**Deferred promises:** speeding up or removing tests, changing the account's
runner allowance or buying different runners, dashboard presentation changes,
and an automatic layout optimizer. The existing allocation mechanism may
naturally support other counts; this story adds no count rejection rule.

#### Key examples

1. The baseline has four Distribution shares → three shares finish all the
   same checks and proof with no worse complete-run time in solo and overlap
   comparisons → keep the reduction and continue looking for fewer jobs.
2. A smaller browser matrix finishes its tests before the old slowest shard,
   but its proof job queues and the complete verdict arrives later → reject
   that candidate despite the shorter test job or dependency-chain estimate.
3. A combined layout improves two-run throughput but delays a solo verdict →
   reject it under this story's existing no-worse requirement.
4. A two-share layout breaches the old per-share aggregate budget solely
   because the same checks were repacked → assess a reviewed budget/layout
   change and measure whole-run time; neither silently omit checks nor treat
   that old packing's budget as a permanent minimum share count.
5. The smaller layout passes all jobs but leaves a proof part missing, changes
   case/file units, or loses cases → reject it and repair the coverage defect.
6. Repeated matched comparisons cannot distinguish a candidate from runner
   noise → retain the incumbent, record uncertainty, and make no speed claim.

#### Evidence and investigation

Read-only GitHub Actions observation on 2026-11-14, using workflow creation to
last job completion throughout:

| Run / revision | Initial / total jobs | Wall seconds | Runner seconds | Longest job | Largest job queue |
| --- | --- | --- | --- | --- | --- |
| [43552321296](https://github.com/terryyin/open-dough/actions/runs/43552321296), `3069e8b` | 21 / 22 | 350 | 3,487 | integrated 5/5, 258 s | 77 s |
| [43532089843](https://github.com/terryyin/open-dough/actions/runs/43532089843), `7fb4234` | 17 / 18 | 295 | 3,513 | dashboard 2/13, 273 s | 3 s |

The first run's `test (1/4)` waited 77 s; `ci-proof` was created at
03:38:41 UTC and started at 03:39:55 UTC, a further 74 s queue. These two
main runs succeeded. The older run used the former combined browser layout,
so their difference is exploratory evidence, not a controlled estimate of the
fourth share's effect. The original 349 / 294 s figures omitted the first
second before job creation; the table uses workflow creation consistently.

Runs [43552606318](https://github.com/terryyin/open-dough/actions/runs/43552606318)
and [43553608245](https://github.com/terryyin/open-dough/actions/runs/43553608245)
had queues up to 70 / 79 s, but also failed a test job. They demonstrate
queueing, not eligible passing speed comparisons. The account's 20-job limit
is supplied context; these reads do not independently establish the account
entitlement or all competing repositories' activity.

At preparation revision `01ef3a5ec`, the real allocation preview discovers 644
Distribution checks, with predicted share totals of about 500 / 667 / 1,000 /
2,000 job-seconds for 4 / 3 / 2 / 1 shares. Three fits the current 694
aggregate ceiling narrowly; two and one require reconsidering that packing's
budget. Browser previews also reach the real groups: E2E 303 spec files,
integrated 269, frontend 57, backend 432. Their duration lists have 12 / 15 /
19 / 58 unrecorded files respectively. Predicted work is not elapsed wall
time; refresh or explicitly account for stale timing before ranking layouts.

**Still hypotheses:** which smaller layout meets both wall-time comparisons,
whether co-hosting groups/lint saves useful setup time, and the minimum passing
count. Settle these through execution's bounded real-CI experiments. No new
CI run or implementation was performed during refinement.

#### Alternatives, challenge, and architecture

| Candidate | Benefit against this goal | Consequence / limit |
| --- | --- | --- |
| Document the rule and stop | Cheapest useful interim result | Leaves today's runner demand unchanged; insufficient as the default full outcome |
| Reduce shares/shards using the existing deal | Small reversible changes; same test and proof owners | More work per runner may move the bottleneck; recommended first experiments |
| Pack groups or lint onto fewer runners | Can reclaim setup and unused time beyond count-only changes | Must retain distinct selections, settings and proof producers; independent steps must still report failures |
| Change runner capacity or test execution speed | Could shorten the bottleneck | Different cost or test-optimization scope; deferred rather than silently substituted |

Borrow the balancing mechanism of a production line: the bottleneck's cycle
time is the available envelope, tests are work, and runner jobs are stations.
Pack work into fewer stations while keeping that envelope. The analogy breaks
when shared CPUs, cache variation and account-wide queues make durations
non-additive, so predictions select experiments and never certify a layout.

The strongest doubt is that fewer jobs can satisfy the title yet delay the
developer's verdict. Historical runs are confounded, and concurrent A/B arms
also compete for the same runners. The whole-workflow metric, separate solo
and overlap conditions, fixed workload, and repeated comparisons address this
without weakening the goal or promising an unobserved speedup.

The existing share dealer, per-group browser workflow and proof fragment /
summary actions remain the starting owners. Physical runner placement may
change; test-group meaning and proof responsibility must survive it. Reuse
existing repeat/run-ID handling where suitable rather than build another CI
scheduler. This is repository CI design, with no dashboard service or new
product-wide architecture decision.

Accepted [ADR 0002 — lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports reuse and one representation per responsibility;
[ADR 0008 — dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps maintained proof distinct from particular observed results;
[ADR 0010 — definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires a stated baseline and worthwhile observed gain. No conflict was found.
No current North Star topic needs changing for these local workflow choices.

**Safe stopping point:** the documented rule with one measured reduction or
measured no-change is useful interim value. It does not silently cancel the
remaining search. Open human decisions: none; the seed already specifies the
beneficiary, whole-workflow scope and no-worse requirement.
