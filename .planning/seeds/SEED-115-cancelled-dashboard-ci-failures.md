---
id: SEED-115
status: active
planted: 2026-10-06
planted_during: Terry's request to investigate the unexplained cancelled dashboard CI run
trigger_when: Dashboard CI reports failures before cancellation without a demonstrated cause
scope: unknown
---

# SEED-115: Explain cancelled dashboard CI failures

## Why This Matters

A maintainer needs to distinguish a remaining defect from failures already
repaired when deciding whether dashboard CI needs further work. Run
37420000326, attempt 1, on `9baca4db8d9509dd20d6ba8869202eb641836c4b`
reported thirteen test failures before its six-minute job limit. The preceding
execution did not establish their cause. Its shard trace upload was skipped,
and later passing runs establish current proof without explaining this run.

## Story Decomposition

<a id="retain-cancelled-ci-evidence"></a>

### Retain actionable diagnostics when a dashboard CI shard times out

**Identity:** SEED-115#retain-cancelled-ci-evidence
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A maintainer deciding whether CI found a remaining defect needs
inspectable evidence from the tests that finished before a shard ran out of time.

**Goal:** Preserve completed dashboard failures' traces and error contexts when
CI reaches its execution deadline, while keeping the current bounded job.

**Expected behavior:** A deadline failure has an explicit cause and retrievable
completed-test diagnostics. A later green run does not silently clear a prior
unexplained failure.

**Observed behavior and evidence:** Run 37420000326, attempt 1, revision
`9baca4db8d9509dd20d6ba8869202eb641836c4b`, reached its six-minute job limit.
Its shard 1 log names traces and error contexts for thirteen completed failures,
but the artifact listing has only shards 2–9. The report upload is guarded by
`!cancelled()`. No superseding run explains the cancellation.

**Scope:** Establish a cancellation-safe retention design through the actual
workflow/runner boundary, then make the smallest demonstrated change. Verify
both retained evidence and the time bound. Do not assume `always()` alone can
upload after a hard job cancellation. Do not increase timeouts or tune worker
concurrency without new causal evidence.

**Key examples:** A shard with a completed failing test and then a deadline
keeps that failure's trace and error context and reports the deadline explicitly.
An ordinary assertion failure still keeps diagnostics. A passing shard remains
successful. A setup failure identifies missing prerequisites rather than claiming
browser evidence was created.

**Evaluation:** Observe the real timeout/retention path and confirm the artifact
is retrievable, the job remains bounded, and ordinary pass/failure paths retain
their meaning. Source inspection of an upload condition alone is insufficient.

**Remaining uncertainty:** All thirteen historical primary causes remain
unclassified. The six affected current specs passed during investigation. The
bounded cleanup repair addresses only a secondary teardown crash, not those
primary failures. Use the preserved per-case investigation evidence when a failure
recurs; first establish whether intended behavior is violated, then repair a
confirmed violation. Missing historical traces cannot be reconstructed by a
passing rerun.

**Evidence home:** The full investigation, including every primary failure and
its missing observation, is recoverable from
[investigation notes](https://github.com/terryyin/open-dough/blob/a53751f5468350c9033ba84c7f9ea48ae5837626/.planning/seeds/SEED-115-cancelled-dashboard-ci-failures.md#investigation-result--2026-10-06).
The [cancelled shard](https://github.com/terryyin/open-dough/actions/runs/37420000326/job/112127011368)
retains its log and annotations.

**Effort hypothesis:** M — design and provider timeout behavior need refinement;
this exceeds the bounded cleanup repair.

**Depends on:** None. This is separate from the completed cleanup repair and
preserves independent dashboard GitHub-read and rate-limit work.

**Safe stopping point:** Completed-test diagnostics remain available and the
job stays bounded even if later investigation of individual failures is deferred.

**Open decisions:** How the runner and workflow reserve time to retain evidence
before hard cancellation; whether recurring primary failures violate intended
behavior. Approach and readiness remain unselected.

## Breadcrumbs

- [Cancelled CI run](https://github.com/terryyin/open-dough/actions/runs/37420000326).
- [Closed execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
- Landed test-race repair `7da9f1533316187860cb318dcac81238a6a538b6`.
- [Cancelled shard and annotations](https://github.com/terryyin/open-dough/actions/runs/37420000326/job/112127011368).
