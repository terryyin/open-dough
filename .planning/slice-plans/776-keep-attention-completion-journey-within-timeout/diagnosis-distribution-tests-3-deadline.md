# Diagnosis: distribution-tests-3-deadline

Identity: `SEED-341#keep-attention-completion-journey-within-timeout`
Round: 1 of 3 authorized. Cumulative active minutes: 7.9.
Clock state at the end of the round: paused. `overrun: false`. Remaining on this round's budget: 7.1 minutes.

## Failure signature

Distribution Tests (3/3), job `137264401117`, attempt 1 of run `45040743516`, step "Run Distribution Tests", revision `f5af47e7a9519126705fb3e6d90bc730e56e4d12`.

```
RUN DEADLINE: exhausted absolute cutoff (OPEN_DOUGH_TEST_DEADLINE_MS=1795363119000).
unfinished running: Distribution/tests/test-runner/dashboard-concurrent-runs.sh
TIMEOUT: Distribution/tests/test-runner/dashboard-concurrent-runs.sh (exhausted run deadline; after 17.2s)
```

The diagnostic inventory marked this job `no-recognized-failure` and `inventory.complete: false` because its extractor kept only the step tail. The full job log contains the signature above. There is no `not started:` line, no `FAIL:` line, and no captured output after the `TIMEOUT` line.

Reproduction of the signature: matched once, in this CI log. Local repeats: 0. Stopping count for local full-suite reruns was 0, and none was started. The CI log was the discriminating experiment.

## Conditions

- Platform: GitHub-hosted `ubuntu-24.04`, runner image `20261116.376.1`, westus2. Job `timeout-minutes: 6`.
- Share: `OPEN_DOUGH_TEST_SPLIT=3/3`. One job per CPU inside the distribution runner. Passing checks stay silent.
- Load: this job only. No local suite was running for this diagnosis.
- Current checkout: clean at `8ae3781d40170eacec5fdee4df180c8f01523aca`, a records-only descendant of `f5af47e7` (`PLAN.md` only). That HEAD was not the failing SHA.

## Cause

Infrastructure. The share's absolute run cutoff expired on the epoch CI armed at job start, and it stopped `Distribution/tests/test-runner/dashboard-concurrent-runs.sh` after 17.2s. That wording is the runner's run-deadline path (`scripts/test-job-deadline.bash`: `exhausted run deadline`). The per-check safety deadline is 180s and would have been reported as `safety deadline 180s`.

The summary lists that script under `unfinished running` and prints no `not started:` line, so the runner had admitted it. About 15.4s of the absolute budget remained at admission. The armed epoch arrived 17.2s into the script. Its 180s safety budget was still intact. The step printed no assertion output from the script.

This story did not cause that stop. The files changed from `1e264c5ea463caf4872b3a740989b794904e690e` to `f5af47e7a9519126705fb3e6d90bc730e56e4d12` are:

- `M` `.planning/seeds/SEED-341-simplify-session-tests.md`
- `M` `.planning/slice-plans/776-keep-attention-completion-journey-within-timeout/PLAN.md`
- `A` `.planning/slice-plans/776-keep-attention-completion-journey-within-timeout/source-review.md`
- `A` `dashboard/test-support/support/composedAttentionPage.ts`
- `A` `dashboard/test-support/support/composedAttentionRecord.ts`
- `A` `e2e/sessions/agent-completion-attention-page.spec.ts`
- `M` `e2e/sessions/agent-completion-attention.spec.ts`

`dashboard-concurrent-runs.sh` is unchanged. It launches two local dashboard-backend runs of `dashboard/backend-tests/runtime/serving-modes.spec.ts`, grepped to the declared-icon case. `composedAttentionPage.ts` and `composedAttentionRecord.ts` are imported only by `e2e/sessions/agent-completion-attention-page.spec.ts`. Those e2e specs belong to the e2e browser group (`e2e/sessions/agent-*` on e2e shard 2), which this job does not run.

## Evidence

Saved job log: `.git/worktrees/keep-the-attention-completion-journey-within-its/open-dough/evidence/diagnosis-distribution-tests-3-deadline-job.log` (528 lines). Epoch arithmetic: `diagnosis-distribution-tests-3-deadline-epoch.log`. Diff: `diagnosis-distribution-tests-3-deadline-attribution.log`.

| Event | Time (UTC) | Source |
| --- | --- | --- |
| Runner process starts | 2026-11-22T15:53:12.526Z | job log line 1 |
| Deadline step arms `started + 320000` | 2026-11-22T15:53:19.459Z | job log lines 278–285 |
| `OPEN_DOUGH_TEST_DEADLINE_MS=1795363119000` visible | 2026-11-22T15:53:19.475Z | job log line 292 |
| Armed `started` (`deadline - 320000`) | 2026-11-22T15:53:19.000Z | epoch log |
| Armed cutoff epoch | 2026-11-22T15:58:39.000Z | epoch log |
| npm cache hit, Playwright cache hit, npm install "added 216 packages in 4s", browser acquisition complete | 15:53:23.262Z through 15:53:37.287Z | job log lines 313–380 |
| "Run Distribution Tests" / `exec npm run test` | 2026-11-22T15:53:37.395Z | job log lines 381–393 |
| npm banner `exec bash scripts/test.sh` | 2026-11-22T15:53:37.500Z | job log lines 394–397 |
| Next test-step line is the cutoff | 2026-11-22T15:58:40.798Z | job log line 398 |
| `TIMEOUT: ... (exhausted run deadline; after 17.2s)` | 2026-11-22T15:58:40.828Z | job log line 400 |
| Step exits 1 | 2026-11-22T15:58:41.216Z | job log line 401 |

Measured intervals:

- Test step began 18.500s after the armed `started` epoch, so setup left about 301.5s of the 320s share.
- The cutoff line is 1.798s after `2026-11-22T15:58:39.000Z` and 321.339s after the deadline step's log line. That is the armed epoch, plus report delay.
- The test step was silent for 303.298s between the npm banner and the cutoff line. Passing distribution checks print nothing.
- `dashboard-concurrent-runs.sh` started at about `2026-11-22T15:58:23.598Z` (17.2s before the TIMEOUT line), about 15.4s before the armed epoch.
- The outer 6-minute job cancellation, counted from 15:53:12Z, would fall near 15:59:12Z. The runner stopped itself at 15:58:40Z.
- `test-times-3` uploaded (artifact `14761672737`, 3727 bytes) and `ci-proof-fragments-distribution-tests-3-attempt-1` uploaded (artifact `14761837313`). This round did not download them. The job log already names the stop reason.

Searches of the 528-line job log found no `e2e/`, `dashboard/test-support`, `composedAttention`, `agent-completion-attention`, `not started`, `FAIL:`, `safety deadline`, or `INTERRUPTED:`.

## Hypotheses

1. The shard's absolute deadline stopped `dashboard-concurrent-runs.sh` after 17.2s, rather than that script hanging through its own 180s budget. Experiment: one inspection of job `137264401117`'s log, with zero local suite reruns. Result: confirmed. The TIMEOUT line uses the run-deadline wording, the epoch matches `started + 320000` from 15:53:19Z, and the script's recorded runtime is 17.2s.

2. This story's files are on that failing path and made the share miss the cutoff. Experiment: the same log, plus `git diff --name-status 1e264c5e f5af47e7`, plus import search. Result: refuted. The story diff does not contain the failing script. The new modules are imported only by the e2e page spec. The job log never names them.

## Environments ruled out

- Per-check 180s safety deadline. Count: the only TIMEOUT line says `exhausted run deadline; after 17.2s`.
- GitHub's six-minute job cancellation. Count: the stop is 321s after the deadline was armed, and the log text is the runner's `RUN DEADLINE` line.
- Slow prerequisite acquisition eating the share. Count: caches hit; the test step started 18.5s after the deadline epoch was armed.
- An assertion failure inside the killed script or in this story's specs. Count: no `FAIL:` line and no captured script output. The story's paths do not appear in the job log.
- Local reproduction under another load. Count: 0 attempts. Not required after the log showed this story's files off the failing path.

## Repair disposition

No code repair is owed for this story. No product or test file was edited. A green rerun would not be a fix.

The published job did fail. The failure is the distribution share reaching the cutoff CI configures in `.github/workflows/ci.yml` (`OPEN_DOUGH_TEST_DEADLINE_MS=$(( started + 320000 ))`), on a check this story does not compile, import, or select.

## Record fields

- Base versus candidate: `1e264c5e` to `f5af47e7` does not touch the failing code. `f5af47e7` to current `8ae3781d` changes only this plan's `PLAN.md`.
- CI: run `45040743516`, attempt 1, job `137264401117`, https://github.com/terryyin/open-dough/actions/runs/45040743516/job/137264401117
- Reproduction command: `gh run view 45040743516 --repo terryyin/open-dough --job 137264401117 --log`, run through the slice clock. No suite command.
- Instrument: none.
- Temporary diagnostic edits to revert: none.
- Parked changes in the tested tree: none. The checkout was clean. This round adds this record only.
- Unrelated defects found: none.
- Leading hypothesis: the one confirmed above. The cause is no longer unknown.
- Next discriminating experiment: none. Another suite run or a workflow rerun would repeat a cutoff this story's files do not affect.
- Round count: 1. Cumulative active minutes: 7.9. `overrun: false`.

## Clock

Pause result:

```json
{"command":"pause","identity":"SEED-341#keep-attention-completion-journey-within-timeout","diagnosis":"distribution-tests-3-deadline","round":1,"roundsAuthorized":3,"cumulativeMinutes":7.9,"state":"paused","elapsedMinutes":7.9,"remainingMinutes":7.1,"limitMinutes":15,"overrun":false,"storyOverruns":5}
```

## Accepted repair

The developer chose to move checks between shares. `fa069ef75dce5b7566f69b9a53d8f365222e3a86` adds `Distribution/tests/skills/dough-story-refinement/preparation-*` to distribution share 1. CI run `45082436184` for that revision succeeded. The deadline and the shard count were left as they were.
