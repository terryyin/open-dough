---
id: SEED-115
status: active
planted: 2026-10-06
planted_during: Terry's request to investigate the unexplained cancelled dashboard CI run
trigger_when: Dashboard CI reports failures before cancellation without a demonstrated cause
scope: M
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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/265-retain-cancelled-ci-evidence/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"07c3becca555de0c8ca95a761c764fab1790538b0275a494d3ccd117e3e8abcd","plan":"4a42e3f858f1cdbb2ef07f6269a83ceacf985475d20d58c20b024d2619f12f7a"}}
```

**For / why:** A maintainer deciding whether CI found a remaining defect needs
inspectable evidence from the tests that finished before a shard ran out of time.
Today a dashboard shard that reaches the job's six-minute limit is cancelled by
the runner, its `Keep the Playwright report` step is skipped under
`!cancelled()`, and the traces and error contexts its log names are lost with
the job. The maintainer is left with a cancellation and no retrievable evidence.

**Goal:** When a dashboard CI shard runs out of time, the maintainer can
retrieve the diagnostics of every test that completed before the deadline,
and the shard's verdict states the deadline as its cause, while each shard
job stays within its current bound.

**Scope:**

Required behavior:

- A dashboard shard that cannot finish its browser suite within its time bound
  ends as a failed job, not a cancelled one. Its console output states that the
  run reached its deadline, and the retained HTML report shows which tests
  passed, failed, or did not finish.
- The `dashboard-playwright-report-<shard>` artifact for that shard is
  retrievable from the run and contains the trace and error context of every
  test that failed before the deadline.
- The suite reaches that deadline reliably before the runner's own
  `timeout-minutes` cancellation, with room for the report upload, under the
  slowest prerequisite setup observed so far (about 63 seconds before the
  browser suite in the cancelled shard).
- The job's `timeout-minutes` stays at its current value. The repository's
  time budget is a reviewed ceiling (`tests/time-budget.md`): a slow suite is
  fixed, not given more time.

Deferred promises, not commitments of this delivery:

- Classifying or repairing the thirteen historical primary failures. Their
  per-case evidence stays in the evidence home below for whichever failure
  recurs first, now with retrievable diagnostics.
- Changing worker concurrency or balancing shards. Nothing observed so far
  attributes the cancelled run to concurrency, and the time budget treats
  tuning as a reviewed change on its own evidence.
- Changing how the CI observer in `dough-execute-plan` or a maintainer treats
  an earlier failed run once a later run is green. A deadline-ended shard now
  fails explicitly, so existing failure handling applies to it unchanged.

Boundary assumptions:

- The runner's cancellation on `timeout-minutes` is a hard stop that the
  workflow cannot rely on for cleanup: no step condition, `always()` included,
  is assumed to upload after it. The design keeps the job out of that path by
  ending the suite first, and only a real CI observation of the deadline path
  proves the upload.
- An ordinary assertion failure, a passing shard, and a setup failure keep
  their current meaning and reporting; the deadline path is added beside them.
- A local run without `CI` is not held to the deadline, matching how the
  shell suite's time budget applies only on CI's runner.

**Key examples:**

- A shard's browser suite has one test fail with a retained trace, then the
  remaining tests are still running when the suite's deadline arrives. The
  suite stops, the job fails with console output naming the deadline, the
  shard's report artifact is listed on the run, and it contains the failed
  test's trace and error context plus the report marking the unfinished tests.
- A shard finishes all its tests within the bound; one fails on an assertion.
  The job fails with that test's error and trace, exactly as today.
- A shard finishes all its tests within the bound and all pass. The job
  succeeds, the console stays silent, and the report artifact records the
  tests it executed, exactly as today.
- Global setup cannot build the dashboard or a test's preview server fails to
  start. The failure names the missing prerequisite or startup error; no
  browser trace is claimed for a test that never ran.
- Prerequisite setup is slow (Node, npm, Chromium acquisition near their own
  bounds) and the suite then runs to its deadline. The job still ends through
  the suite's deadline and uploads, before the runner's six-minute limit.

**Architecture:** The shell suite already owns a deadline below the job bound:
`tests/time-budget` with `scripts/test-budget.sh` fails the split job itself
with an `OVER BUDGET` report instead of letting the runner cancel it. The
dashboard suite has no such own deadline; it relies on the job's
`timeout-minutes` alone, which is the cancellation that discards its evidence.
This story gives the browser suite the same shape: a suite-level deadline the
run enforces itself (Playwright's run-wide timeout, surfaced through the
existing quiet reporter, which already prints why a run ended `timedout`) so
the job fails normally and the existing `!cancelled()` upload runs. Keep one
owner per concern: the suite ends the run and reports the deadline; the
workflow keeps uploading on any non-cancelled end. Do not add a second upload
step or a second reporter.

**Evaluation:** Observe the real deadline path on CI: a pushed revision whose
dashboard suite is forced past its deadline must show the job failing with
the deadline named, the shard's report artifact retrievable with a completed
failure's trace inside it, and the job ending within `timeout-minutes`. Source
inspection of an upload condition alone is insufficient. The ordinary
pass, assertion-failure, and setup-failure paths are then confirmed on an
unforced run.

**Evidence home:** The full investigation, including every primary failure and
its missing observation, is recoverable from
[investigation notes](https://github.com/terryyin/open-dough/blob/a53751f5468350c9033ba84c7f9ea48ae5837626/.planning/seeds/SEED-115-cancelled-dashboard-ci-failures.md#investigation-result--2026-10-06).
The [cancelled shard](https://github.com/terryyin/open-dough/actions/runs/37420000326/job/112127011368)
retains its log and annotations.

**Effort hypothesis:** M — the suite-side deadline is small, but proving the
deadline path needs a forced CI observation and the deadline value must be
set against the real setup and upload times.

**Depends on:** None. This is separate from the completed cleanup repair and
preserves independent dashboard GitHub-read and rate-limit work.

**Safe stopping point:** Completed-test diagnostics remain available and the
job stays bounded even if later investigation of individual failures is deferred.

## Breadcrumbs

- [Cancelled CI run](https://github.com/terryyin/open-dough/actions/runs/37420000326).
- [Closed execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
- Landed test-race repair `7da9f1533316187860cb318dcac81238a6a538b6`.
- [Cancelled shard and annotations](https://github.com/terryyin/open-dough/actions/runs/37420000326/job/112127011368).
