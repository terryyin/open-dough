# Diagnosis: direction disclosure count

Identity: `SEED-413#github-request-lifetime-and-evidence-via-vitest`

## Failure

- Signature: `e2e/stories/direction-disclosure.spec.ts:219` `toHaveCount(0)` on `getByRole('region', { name: 'Near-future direction' })` received 1 for 5 seconds, after `chooseProject(page, "Doughnut")` in "changing projects removes previous direction while reading and starts each observation collapsed".
- CI: repo `terryyin/open-dough`, run `46043952030`, attempt 1, job `140658404365` (`e2e / shard 2/6`), SHA `98f31733eaf295a5d88a5e8184f9b69d284d06f0`, https://github.com/terryyin/open-dough/actions/runs/46043952030
- Reproduction: the one local run in Round 2 did not match this signature. Rate locally 0/1. The CI failure remains. A local pass does not erase it.

## Attribution

`2950e48ddd61bfbe9fde0a130028b414651b1a6e` passed CI. The only product change after it, through `98f31733`, is `dashboard/backend-tests/observation/authenticated-read-diagnostics-admission-node.spec.ts`. That spec is not in the e2e shard. `dee41091` is plan text only. This story does not change `direction-disclosure.spec.ts` or the direction UI.

## Hypotheses

1. The region stays because the in-progress read has not cleared the previous project's direction. Experiment: read the spec and the direction component and name the condition that removes the region. Do not rerun the shard yet. Stopping count for any later focused run: one, after that condition is named.

## Ruled out

A failure on every local run of this one test, under the Round 2 conditions, is ruled out by that single pass. The CI failure is not ruled out.

## Round

Round 1 paused overrun. The clock settled 38 active minutes. The reader did not return a condition that removes the region, and no local run was started. Reproduction rate is still unknown. No hypothesis was confirmed or refuted. Cumulative active minutes 38. The owed repair remains. The next experiment has to be a different kind: one focused local run of `e2e/stories/direction-disclosure.spec.ts` after the removal condition is named. This round did not name it.

## Authorization

On 2026-11-28 the developer said "try again". That authorizes the next diagnosis round. The authorized total stays 3.

## Round 2 hypothesis

The one test fails locally with the same signature when choosing Doughnut leaves the previous project's Near-future direction region on screen. Name the condition that removes that region from `e2e/stories/direction-disclosure.spec.ts` and the direction UI, then run that one test once. Stopping count: one. Do not rerun the shard and do not rerun CI.

## Round 2

Removal condition: the Near-future direction region is absent while published `work` is undefined.

`NearFutureDirection` always renders `<section className="direction" aria-labelledby="direction-heading">`. An empty `direction` string does not remove that section; it still shows "No near-future direction is recorded." `ProjectActions` mounts it only inside `{work && <NearFutureDirection key={source.id} direction={work.direction} />}`. The parent `.project-actions` also has `hidden={!showsBoard}`, which keeps the section out of the accessibility tree when the board is hidden. The assertion at `e2e/stories/direction-disclosure.spec.ts:219` stays on the board, so the removal it requires is `work === undefined`.

`chooseProject` (`dashboard/test-support/projectChoice.ts`) does not clear the region. It checks the project radio, or clicks the compact option, and waits until that control names the chosen project. The radio `onChange` in `ProjectSelect` calls `onSelect`, which is `selectProject` in `useDashboardRoute`. When the chosen id differs from the current source, `selectProject` calls `selectSource(next)`.

`selectSource` in `usePublishedObservation` (`dashboard/src/publishedObservation.ts`) returns immediately when `next?.id === source?.id`. Otherwise it asks a fresh read, restarts the attempt, and calls `clear()`. `clear()` in `useSnapshotRetrieval` (`dashboard/src/snapshotRetrieval.ts`) is the removal: it sets retrieval to `noRetrieval`, whose `work` is `undefined`, with the comment "Selecting another project shows nothing of the previous one." While that read is in progress, "Reading published work…" is visible and the Near-future direction section is not mounted, so `getByRole('region', { name: 'Near-future direction' })` has count 0. `key={source.id}` only remounts the disclosure closed once a later `work` arrives; it does not remove the region.

Stopping count for the focused run: one. That run completed. It did not match the CI signature.

Local result: exit code 0. The quiet reporter prints nothing when the selected test passes and writes no output, and it removes that run's output directory. The log contains only npm's script line. There is no `FAIL` line and no `toHaveCount` mismatch. `e2e/test-results` was empty after the run. CI expected count 1 for the whole 5000ms; this run did not.

Command, from the run record:

`caffeinate -s -i npm run test:e2e -- e2e/stories/direction-disclosure.spec.ts -g 'changing projects removes previous direction while reading'`

The `-g` value is the one argument `changing projects removes previous direction while reading`. It selects only "changing projects removes previous direction while reading and starts each observation collapsed". The other three tests in the file were not selected.

Revision `a6777a85a2d556bb495852d2e1d49b2b533339c4`. `git diff 98f31733 --` the direction spec, `NearFutureDirection.tsx`, `ProjectActions.tsx`, `publishedObservation.ts`, `snapshotRetrieval.ts`, `ProjectSelect.tsx`, `dashboardRoute.ts`, `configuredDashboardContent.tsx`, and `projectChoice.ts` is empty. Commits after the failing SHA are plan and evidence text. `uncommittedChanges` was true because this diagnosis file was already dirty.

Conditions: macOS, AC power, 16 logical CPUs, load 4.47 4.42 4.29 just before launch. The run lasted 14479ms and did not time out. Expensive-proof decision held. No second copy.

Clock at the end of the run: round 2 of 3, state running, elapsedMinutes 3.1, remainingMinutes 11.9, cumulativeMinutes 41.1, overrun false. A later status read, after the run, reported elapsedMinutes 4, remainingMinutes 11, cumulativeMinutes 42, overrun false. The round was not paused.

Evidence:

- log: `/Users/terryyin/git/open-dough/.git/worktrees/prove-github-request-lifetime-and-failure-eviden/open-dough/evidence/direction-disclosure-round-2.log`
- exit file: `.../direction-disclosure-round-2.exit` (`0`)
- run record: `.../direction-disclosure-round-2.log.run.json`

The cause is not confirmed. Confirmation needs a reproduction that fails before a fix. This pass does not supply that, and it does not repair the CI failure.

Round 2 made progress: it named the removal condition and captured one local pass (rate 0/1). It ruled out a failure on every local run. It did not reproduce the CI signature, so the next experiment has to be a different kind.

The coordinator paused the clock after the return. The pause report is round 2 of 3, state paused, elapsedMinutes 6.8, remainingMinutes 8.2, cumulativeMinutes 44.7, overrun false.

## Round 3 hypothesis

A `show` of the previous project's snapshot lands after `selectSource` calls `clear()`, so `work` is defined again for the whole held Doughnut read and the Near-future direction region stays mounted. `selectSource` asks the next read, restarts the attempt, then calls `clear()`. A snapshot `show` from the read that was already in flight can run after that `clear`.

Experiment: one injection that lets that previous snapshot arrive after `clear()` and before the assertion at `e2e/stories/direction-disclosure.spec.ts:219`. Prefer the existing hold/release seam. Stopping count: one injected run. Do not rerun the uninstrumented test, the shard, or CI. Revert temporary injection edits before returning, and list them in the record. A matching failure confirms the cause for a later fix clock. This round does not fix the product.

## Round 3

The existing hold/release seam cannot by itself place the previous snapshot after `clear()`. `chooseProject` returns only after the click's effect cleanup has aborted the previous read, and `acceptProgress` / the detail `show` both return without calling retrieval `show` once `signal.aborted` is set. Releasing a held previous answer after that is ignored. The one injection therefore kept that read abortable only after 20 seconds, and used the hold seam to release the previous project's in-flight settings read after `clear()`.

Injection, reverted after the run:

- `dashboard/src/publishedObservation.ts`: the read effect's cleanup called `setTimeout(unbind, 20_000)` instead of aborting immediately. `selectSource` set `window.__doughCleared` and reset `window.__doughShowsAfterClear` after `clear()`. The effect's `show` callback, once that flag was set, incremented `__doughShowsAfterClear` and stored `next.source.id` on `__doughWorkAfterClear`.
- `e2e/stories/direction-disclosure.spec.ts`, only "changing projects removes previous direction while reading and starts each observation collapsed": revision A also published `.planning/open-dough.json` as `{}\n`, so that content read can be held. `origin.hold(".planning/open-dough.json")` ran before `page.goto("/")`. The test polled until that content request was observed, then `doughnut.hold("main")`, `chooseProject(page, "Doughnut")`, and `releasePrevious()`. It polled until `__doughShowsAfterClear` was greater than 0, logged `round3-after-clear`, then ran the existing `toHaveCount(0)` assertion.

Stopping count: one injected run. It completed. No second injection, no uninstrumented rerun, no shard, no CI.

The count signature matched. `getByRole('region', { name: 'Near-future direction' })` `toHaveCount(0)` received 1 for the whole 5000ms (14 times the locator resolved to 1). Exit code 1. Work was defined again after `clear()`: the log line is `round3-after-clear {"shows":9,"work":"doughnut"}`.

The mounted work at that sample was the Doughnut project's snapshot, not Open Dough's. The failure page shows Doughnut selected, "Published work read at revision 41a5594", the direction region, "Start session in Doughnut", and Checked/Refresh. That is a settled read, not "Reading published work…" while Doughnut's ref stayed held. The previous project's settings release and the delayed abort did let shows land after `clear()`, and the last of those nine shows was `doughnut`.

Command, from the run record:

`caffeinate -s -i npm run test:e2e -- e2e/stories/direction-disclosure.spec.ts -g 'changing projects removes previous direction while reading'`

The `-g` value is the one argument `changing projects removes previous direction while reading`. Revision `a6777a85a2d556bb495852d2e1d49b2b533339c4`. `uncommittedChanges` was true because this diagnosis file was already dirty. The run lasted 10489ms and did not time out.

Conditions: macOS, AC power, 16 logical CPUs, load 3.47 4.03 4.36 just before launch. Expensive-proof decision held. No second copy.

Clock at the end of the run: round 3 of 3, state running, elapsedMinutes 10.1, remainingMinutes 4.9, cumulativeMinutes 54.9, overrun false. A later status read, after the run and the revert, reported elapsedMinutes 12.1, remainingMinutes 2.9, cumulativeMinutes 56.8, overrun false. The round was not paused.

Evidence:

- log: `/Users/terryyin/git/open-dough/.git/worktrees/prove-github-request-lifetime-and-failure-eviden/open-dough/evidence/direction-disclosure-round-3.log`
- exit file: `.../direction-disclosure-round-3.exit` (`1`)
- run record: `.../direction-disclosure-round-3.log.run.json`
- failure page: `.../direction-disclosure-round-3-error-context.md`
- report: `.../direction-disclosure-round-3-report.md`

Temporary injection edits were reverted with `git checkout -- dashboard/src/publishedObservation.ts e2e/stories/direction-disclosure.spec.ts`. A search for `__doughCleared`, `Round-3 diagnosis`, and `releasePrevious` found nothing. This diagnosis file was left in place.

This round does not fix the product. The owed repair remains. The count signature and "work defined again after clear" are reproduced. The page at failure was Doughnut's settled snapshot, so the previous-project hypothesis is not confirmed.

The coordinator paused the clock after the return. The pause report is round 3 of 3, state paused, elapsedMinutes 12.6, remainingMinutes 2.4, cumulativeMinutes 57.4, overrun false.

## Authorization

On 2026-11-28 the developer approved another round and said trunk has solved some of the CI problem. Take those trunk changes, and remove on this branch what trunk removed. The authorized total rises to 4. Absorb trunk before another injection.

Trunk `39fbba2cd` holds the Doughnut read with `holdAuthenticatedReadsWhere` instead of `doughnut.hold("main")`. After merging `origin/main`, one local run of that test exited 0. Trunk `42afce853` deleted `dashboard/server/revisionChecks.ts` and the GitHub revision-check listing. The listing cases in the lifetime, bound, and close specs were removed with it. The pinned-read cases passed again: lifetime 2, bound 2, close 4, and both owner specs. Round 4 was not started. The CI failure on `98f31733` remains the old revision's result until the merged branch is published.

## Stop

Three rounds were used before that approval. The cause was not confirmed then. Round 3 reproduced count 1 only by delaying the previous read's abort 20 seconds and releasing a held settings read. The failure page had left "Reading published work…". The mounted work was Doughnut's settled snapshot. The uninstrumented local run passed while `doughnut.hold("main")` was in place. A fix needs a reproduction that fails for the CI reason. The next experiment, if more rounds are authorized, is one observation of whether that hold still leaves the attempt reading for the whole `toHaveCount` wait, and which source id is mounted if the region is present. It does not delay abort and it does not release a previous project's read.
