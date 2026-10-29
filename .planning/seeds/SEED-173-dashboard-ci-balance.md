---
id: SEED-173
---

# Dashboard CI workload balance

<a id="dashboard-ci-balance"></a>

### Refresh dashboard timing weights and rebalance CI

**Identity:** SEED-173#dashboard-ci-balance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/375-dashboard-ci-balance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1c5a631a61b4c6f41d8e85a5febaf92a1a65371acf7dff41b4604a851a1dbea3","plan":"ba2e51831d0f1876c6329729ef1fcda6b4c14ef018609549e0f0e5434ac4cd46"}}
```

**Goal:** Refresh dashboard timing weights and rebalance the existing workload,
keeping all tests and isolation, twelve shards and four workers per shard
unchanged, and measure the effect on overall CI time.

**Scope:** Use representative recent post-optimization timing reports and the
existing duration-list refresh/deal mechanism first. Preserve every discovered
spec and full test identity exactly once, existing platform skips, strict
verdicts, retry policy, serial deployment scheduling, real integration proof
and per-test fixture/process/repository isolation. Record the data source and
aggregation, compare predicted and actual balance, and retain reproducible
whole-CI measurements rather than claiming speedup from summed test seconds.

**Examples:** Ordinary and deployment projects remain complementary. Every
selected spec appears in one of twelve shards. A moved case keeps its full
identity and verdict. All existing tests still run with four observed workers
per CI shard. An unsplit local invocation keeps the same selection.

**Evaluation:** Obtain fresh complete baseline and candidate CI on named
revisions, with repeated sequential observations to expose runner variation.
Compare overall workflow time, queue, job/suite time, shard spread and original
case/verdict accounting. No numeric speed target is promised. Report supported
improvement, inconclusive or negative results honestly. Normal local feedback
is not expected to improve because the unsplit mode does not use timing weights;
run suitable local allocation/selection proof before and after instead.

**Excluded:** Removing, skipping, weakening or retrying tests; shared mutable
fixtures; changing isolation, worker/shard counts, test bodies, application
behavior, timeout contracts, clocks, dependencies, releases or guidance.
