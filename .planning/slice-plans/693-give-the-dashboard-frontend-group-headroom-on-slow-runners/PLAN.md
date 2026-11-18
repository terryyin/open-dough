# Give the Dashboard Frontend group headroom on slow runners

**Identity:** SEED-382#give-the-frontend-group-headroom-on-slow-runners
**Source:** [Give the Dashboard Frontend group headroom on slow runners](../../seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#give-the-frontend-group-headroom-on-slow-runners)
**Source review:** [source review](source-review.md)

## Goal and scope

Contributors get a Dashboard Frontend result on an ordinary slow GitHub runner:
the `dashboard-frontend` group runs as two CI shards, each well inside the
450 s deadline. The story records the sizing decision and its timings.

Excluded: the deadline and job bound, the group's tests and workers, the other
groups' shards, and any spec speedup.

## Existing solution and direction

The declared-shard mechanism already carries everything
([the split](../../../dashboard/tests/shards.md#the-split)): `ci.yml` declares
`shards` and `specs`, the group's configuration selects by them, and
`browser-test-group.yml` names jobs, times artifacts and proof fragments per
shard. The change is declaration and record only; no code or workflow step
changes. No ADR or North Star topic is implicated.

## Premises

Observed 2026-11-18 in this plan's worktree at `3b642e167`, Node 24.21.0, as
one scratch application of slice 1's `ci.yml` change, reverted afterwards.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The declaration below is accepted and every frontend spec runs in exactly one shard | the group's configuration under `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT=i/2` | `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT=<i>/2 npm run --silent test:dashboard:frontend -- --list --reporter=list` for i = 1, 2, and unset | 326 tests in 142 files, 326 in 135, and 652 in 277 unset |
| The split shares recent test-seconds evenly | `node scripts/ci-shard-balance.mjs dashboard-frontend` (5 `main` runs to 2026-11-18T00:51Z) | run on the scratch declaration | shard 1 553 s, shard 2 537 s of an even 545 s; balanced, no slow file |
| Only `ci.yml`'s shard declaration and `ci-proof` `expect` need to change for the maintained checks | `bash scripts/test.sh` on the checks named under local gates | run with `shards`/`specs` changed only, then with `frontend-tests=2:case` too | first: `ci-proof-declaration.test.mjs` fails expecting `2:case`; second: all pass |
| A two-shard group produces per-shard jobs, artifacts and a counted proof entry in CI | `browser-test-group.yml` and `ci-proof-summary` | read: `dashboard-backend` (3 shards) and `e2e` (6) run through the same workflow and action on every `main` run | settled by those groups; the frontend proof report reads the summary, not fragments (`ci-proof-frontend-report.test.mjs` passed on the scratch declaration) |

Expected job time, from the six `main` runs read at refinement: about 20–30 s
of setup plus half of a 275–367 s test step, about 170–215 s a shard, 280 s at
1.3×. This is an estimate; slice 1's CI observation is its check.

## Outside-in proof and local gates

Local, each a few seconds:

```sh
bash scripts/test.sh Distribution/tests/support/ci-browser-groups.test.mjs Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/support/ci-proof-declaration.test.mjs Distribution/tests/support/dashboard-declared-shards.test.mjs Distribution/tests/support/ci-proof-frontend-report.test.mjs Distribution/tests/ci/ci-container-workflow.sh
npm run lint
```

No local browser run is a gate: no spec, configuration code or workflow step
changes, and the group's local command runs every spec with the split unset.
Should one be run, the local gate (awake macOS on AC power) follows
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
under `caffeinate -s -i`.

Hosted: the publication's CI run is the outside-in proof (slice 1). Failures
and flakes follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. The frontend group runs as two shards

Status: done
Type: Behavior

Behavior: a CI run of this revision → `dashboard-frontend / shard 1/2` and
`shard 2/2` both pass, every frontend spec file runs in exactly one of them,
each finishes far enough inside 450 s for a 1.3× slower runner, and the CI
proof summary counts the entry's two shards.

- `.github/workflows/ci.yml`, `dashboard-frontend` job:

  ```yaml
      shards: "[1, 2]"
      specs: |
        1: dashboard/frontend-tests/intent/** dashboard/frontend-tests/navigation/** dashboard/frontend-tests/review/**
  ```

  and `ci-proof`'s `expect`: `dashboard/frontend-tests=2:case`.
- `dashboard/tests/shards.md`: the producers table's frontend row (2), the job
  totals beside it stated from the jobs a run starts (18 after this change:
  13 browser, three Distribution, `lint`, proof; 17 at once), and a dated
  decision under [the job count](../../../dashboard/tests/shards.md#the-job-count)
  naming the deadline-ended run 44200560069, the runs read, and why neither a
  pattern move nor a faster spec restored the headroom (the story's decision
  paragraph). Correct the earlier decisions' job totals to the same count
  basis where they disagree with it.
- Any other maintained text that states the frontend job as one shard follows.

Proof: the local gates pass; in the publication's CI run both frontend shard
jobs pass, `ci-proof` passes, and each frontend job's start-to-test-end time is
at most 346 s (450 / 1.3). After the run, `bash scripts/ci-job-times.sh` and
`node scripts/ci-shard-balance.mjs dashboard-frontend` read it once it is a
successful `main` run; record the two shard times in Learnings. A shard above
346 s, or shards apart by more than the balance script's proposal threshold,
changes the patterns through the balance script's proposal before the story
closes.

## Execution complete

Product advice: no change. The following `main` runs' frontend job times
(`bash scripts/ci-job-times.sh`) are the check the story names. Branch run
44218814549 read 238 s and 165 s for the two shards.

## Current decisions

- Trunk or Story Branch Mode as the executor chooses; one slice.
- The first shard takes `intent/**`, `navigation/**` and `review/**`; top-level
  spec files and new folders fall to the last shard.

## Plan review

Refinement was not needed: one slice, one declaration change with its record.
This review identified no remaining slice-specific concern.

## Learnings

- Slice 1, local (2026-11-18, on `3d4487126` plus the change): the frontend
  listing is 337 tests in 147 files for shard 1, 326 in 135 for shard 2 and
  663 in 282 unset, with no file in both; the Premises counts were read on an
  older tree, 11 tests and 5 files short in shard 1's folders. The balance
  script on the new declaration reads shard 1 580 s and shard 2 537 s of an
  even 558 s over 5 `main` runs to 2026-11-18T01:12Z: balanced, no proposal.
- `dashboard/backend-tests/runtime/runner-ownership.spec.ts` reads the
  frontend job's shards through `splitExcluding`; its 5 tests pass on the
  change (`npm run --silent test:dashboard:backend -- backend-tests/runtime/runner-ownership.spec.ts`).
- The 2026-11-15 (18) and 2026-11-16 (19) job totals in `shards.md` were
  right when written, with integrated at four shards; the new decision states
  the fall to 17 since, so they stay as written.
- `.github/workflows/ci.yml` is at the 250-line file-size limit after this
  change.
- Slice 1, hosted: run 44218814549 (attempt 1) on story-branch revision
  `389b28dfc8380a49cd134c7d67d1ad8861f4a157` succeeded with 18 jobs.
  `dashboard-frontend / shard 1/2` took 238 s and `shard 2/2` 165 s from job
  start to the end of the test step, against the 346 s bound; `ci-proof`
  passed, and `dashboard-backend / shard 1/3` (with
  `runtime/runner-ownership.spec.ts`) passed. The `main`-run reading by
  `bash scripts/ci-job-times.sh` and
  `node scripts/ci-shard-balance.mjs dashboard-frontend` follows integration
  (source-review P1 and P2, owner target CI).
