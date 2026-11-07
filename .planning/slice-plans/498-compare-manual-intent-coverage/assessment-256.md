# Blinded assessment of SEED-256

## Case provenance

- Historical story and original plan at the detached checkpoint.
  [SEED-256#compare-ci-time-without-runner-waits](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/.planning/seeds/SEED-256-compare-ci-time-without-runner-waits.md#compare-ci-time-without-runner-waits) ·
  [Original plan](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/.planning/slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md)
- Base `c90e30dd1d1202de96facbc3f2bdb30e88051a7a`, checkpoint `6f6d27f0ad119fd1a645b787b28e1c41b066e86e`. The assessor was
  given these two revisions and the selected historical source paths.
- Scratch checkout `/tmp/dough-assessment-nov9z_5_`, report
  `/tmp/dough-assessment-nov9z_5_/.git/assessment-report.md`. The assessor was
  launched with `fork_turns: "none"` and received the common
  [assessment method](assessment-brief.md#method-supplied-to-every-assessor)
  and the case inputs listed here. The historical failure policy matched the
  current policy verbatim.
- The coordinator ran `git diff-tree --no-commit-id --name-only -r 10fa0a78c`, `git diff-tree --no-commit-id --name-only -r 8f92cfc2`, `git diff-tree --no-commit-id --name-only -r 6f6d27f0a`
  with exit 0 for each. These were the Plan 498 attribution inputs. The union
  of product, test and documentation paths supplied to the assessor follows.
  The original plan and seed were supplied separately.

```text
dashboard/GITHUB-REQUESTS.md
dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts
dashboard/server/baseCiGithubRevisionLookup.ts
dashboard/server/baseCiRevisionLookup.ts
dashboard/server/baseCiRevisionNearest.ts
dashboard/server/ciTimeWithoutRunnerWaits.ts
dashboard/server/ciWorkflowJobs.ts
dashboard/server/intentCiComparisonResolve.ts
dashboard/server/intentCiComparisonSlots.ts
dashboard/src/IntentCiComparison.tsx
dashboard/src/storyCiComparison.ts
dashboard/src/storyCiComparisonWording.ts
dashboard/tests/committedOrigin.ts
dashboard/tests/intent/intent-ci-comparison-entries.spec.ts
dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts
dashboard/tests/intent/intent-ci-comparison-gaps.spec.ts
dashboard/tests/intent/intent-ci-comparison-landing-gaps.spec.ts
dashboard/tests/intent/intent-ci-comparison-taken.spec.ts
dashboard/tests/intent/intent-ci-comparison.spec.ts
dashboard/tests/support/baseCiActions.ts
dashboard/tests/support/ghActionsRequest.ts
dashboard/tests/support/storyCiComparisonEarlierLanding.ts
dashboard/tests/support/storyCiComparisonEntryProofs.ts
dashboard/tests/support/storyCiComparisonFixture.ts
dashboard/tests/support/storyCiComparisonTakenFixture.ts
dashboard/tests/support/storyCiObservedJobs.ts
docs/dashboard-development-intent.md
```

## Store and restoration checks

The coordinator checked this new store before dispatch. The setup process
cleared `GIT_ALTERNATE_OBJECT_DIRECTORIES` from the environment of every Git
command. The execution-complete object `46d2ea4a40607fb9085ced0bb5087fe4066a0d03` was checked by the
coordinator only. The Git command outcomes were

```text
git init --quiet --template= -> exit 0
git fetch --no-tags --no-write-fetch-head --depth=1 file:///Users/terryyin/git/open-dough c90e30dd1d1202de96facbc3f2bdb30e88051a7a:refs/heads/case-base 6f6d27f0ad119fd1a645b787b28e1c41b066e86e:refs/heads/case-checkpoint -> exit 0
From file:///Users/terryyin/git/open-dough
 * [new ref]         c90e30dd1d1202de96facbc3f2bdb30e88051a7a -> case-base
 * [new ref]         6f6d27f0ad119fd1a645b787b28e1c41b066e86e -> case-checkpoint
git -c advice.detachedHead=false checkout --quiet --detach 6f6d27f0ad119fd1a645b787b28e1c41b066e86e -> exit 0
git cat-file -t c90e30dd1d1202de96facbc3f2bdb30e88051a7a -> exit 0
commit
git cat-file -t 6f6d27f0ad119fd1a645b787b28e1c41b066e86e -> exit 0
commit
git cat-file -t 6f6d27f0ad119fd1a645b787b28e1c41b066e86e:.planning/seeds/SEED-256-compare-ci-time-without-runner-waits.md -> exit 0
blob
git cat-file -t 6f6d27f0ad119fd1a645b787b28e1c41b066e86e:.planning/slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md -> exit 0
blob
git cat-file -t 46d2ea4a40607fb9085ced0bb5087fe4066a0d03 -> exit 128
fatal: git cat-file: could not get object info
git rev-parse --is-shallow-repository -> exit 0
true
git rev-list --count --all -> exit 0
2
git rev-parse HEAD -> exit 0
6f6d27f0ad119fd1a645b787b28e1c41b066e86e
test ! -e .git/objects/info/alternates -> exit 0
test ! -e .git/objects/info/http-alternates -> exit 0
test ! -e .git/FETCH_HEAD -> exit 0
git remote -v -> exit 0
git status --porcelain=v1 --untracked-files=no -> exit 0
```

The empty outputs for `git remote -v` and tracked status had exit 0.
The assessor restored its one scratch fault. After the assessor finished, the coordinator ran these checks from the scratch checkout before copying the report.

```text
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git rev-parse HEAD
6f6d27f0ad119fd1a645b787b28e1c41b066e86e
exit 0

env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git status --porcelain=v1 --untracked-files=no
exit 0

env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git diff --quiet
exit 0

env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git diff --cached --quiet
exit 0
```

## Effort

| Figure | Observation and basis |
| --- | --- |
| End-to-end wall clock | **Measured**, 464.105 s from 2026-11-07T13:12:01.605Z through the returned report at 2026-11-07T13:19:45.710Z. Includes attribution, Git setup, dispatch, tests and report writing. The absolute 600 s cutoff was 2026-11-07T13:22:01.605Z. |
| Attribution and Git setup | **Measured**, 1.834 s from the case start through successful checks and scratch limiter setup at 2026-11-07T13:12:03.439Z. Part of the end-to-end clock. |
| Launch to returned report | **Measured**, 388.141 s from the fresh assessor's task start at 2026-11-07T13:13:17.569Z to report receipt. Includes test, report and delivery time. |
| Assessor elapsed span | **Measured**, 364.423 s from task start to task completion at 2026-11-07T13:19:21.992Z. Includes tests and waits. |
| Test runtime | **Measured**, Node printed 4,453.941166 ms. Playwright printed 1.4 min for the comparison selection and 55.9 s for Summary compatibility. The deliberate failing test took 9.2 s. Typecheck runner duration is **unavailable** (s), with wrapper wall time recorded separately below. |
| Assessor tokens | **Measured**, 2,488,461 input tokens, including 2,395,904 cached input tokens, and 11,960 output tokens. Last case-specific Codex `total_token_usage`, row 213 of the assessor record below. |
| Active assessor effort and coordinator effort | **Unavailable** (s). The clocks do not separate active work, waits and overlapping work. |
| Human effort | **Unavailable** (s). Reading and verification are separate activities for the comparison. |

The case-only Codex record `rollout-2026-11-07T21-13-17-01a1b624-57b5-7431-bd6b-c728cf73e748.jsonl` supplies task start at row 2 and task completion at row 214. The scratch report's last modification was 2026-11-07T13:19:13.567Z. The returned-report boundary is the coordinator's report-ready notification at row 273 in `rollout-2026-11-07T21-09-51-01a1b621-33aa-73e1-80f5-d7d92270197d.jsonl`.
The coordinator observed AC, 16 CPUs at load 1.40/2.10/2.39, 69% free memory, and 116 GiB free on the scratch volume before starting the pair. Existing browser and Node jobs remained in place. At most two assessors ran concurrently.

Historical proof at the checkpoint. [Workflow selection at the chosen revision](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/dashboard/server/baseCiGithubRevisionLookup.ts#L107-L135) · [Clean landing setup and exact timing cells](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/dashboard/tests/intent/intent-ci-comparison.spec.ts#L72-L144) · [Focused estimator assertions](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts#L10-L77)

## Assessor report

### Historical test assessment — SEED-256#compare-ci-time-without-runner-waits

Checkpoint `6f6d27f0ad119fd1a645b787b28e1c41b066e86e`, base `c90e30dd1d1202de96facbc3f2bdb30e88051a7a`. I read the selected [seed](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/.planning/seeds/SEED-256-compare-ci-time-without-runner-waits.md#compare-ci-time-without-runner-waits) and [plan](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/.planning/slice-plans/492-compare-ci-time-without-runner-waits/PLAN.md) before reviewing the checkpoint and its existing focused tests. The checkpoint initially had no tracked changes. Scope is the selected story and its directly affected comparison consumers.

#### Production path

Selecting a story sends `intent=ci-comparison` through `dashboard/src/useIntentCiComparison.ts` and `authenticatedIntentCiComparisonRead.ts:14–27`. The read dispatches at `dashboard/server/performedRead.ts:152` to `intentCiComparisonRead.ts:37–64`. `intentCiComparisonResolve.ts:70–136,200–230` selects Done or Taken revisions, `baseCiRevisionLookup.ts:37–69,168–182` maps the selected build, and `intentCiComparisonSlots.ts:20–42,53–79` attaches timing for completed builds using the configured local project. `baseCiGithubRevisionLookup.ts:87–135` reads the selected attempt's paged jobs and its historical workflow, then runs `ciTimeWithoutRunnerWaits.ts:39–104` with `ciWorkflowJobs.ts:64–177`. The `storyCiComparison.ts:18–38` schema carries a number or reason to `IntentCiComparison.tsx:84–109,152–198` and `storyCiComparisonWording.ts:35–54`. The Playwright journeys use the built app and actual dashboard preview/API with committed local Git fixtures and fake GitHub at the `gh` boundary (`dashboard/playwright.config.ts:114–117`, `dashboard/tests/support/storyCiComparisonFixture.ts:140–181,224–229`).

#### Promise verdicts

Paths below are checkpoint-relative. Browser assertions quoted here are exact cell text unless stated otherwise.

| Promise | Verdict | Starting evidence and observing test |
| --- | --- | --- |
| Keep each shown completed build's wall time, from creation on attempt 1 or start on a rerun through completion, without a delta. | protected | `dashboard/server/baseCiRevisionNearest.ts:178–194` selects the timing bounds and `storyCiComparisonWording.ts:35–39` renders the elapsed wall duration. `dashboard/tests/support/storyCiObservedJobs.ts:92–156` separates Baseline creation `05:11:50` from start `05:11:52` and Landed attempt 2 start `10:05:19` from creation `10:05:20`. The three Done Story Branch variants check run identity/attempt, both column headers, and the exact wall array `4 min 59 s`, `13 min 27 s`, `5 min 19 s`. Any wall delta changes that array. `dashboard/tests/intent/intent-ci-comparison.spec.ts:72–144`. |
| Exclude runner waits, preserve required follow-on work, and compare signed whole-second estimates in the named rows. | protected | The 17-row Baseline and Branch fixtures include concurrent matrix instances and a follow-on `ci-proof`. Branch `dashboard (3/12)` waits over eight minutes before running for 273 s. The estimator test expects 295,000 ms and 287,000 ms, and the Done browser checks the same builds show `4 min 55 s`, `4 min 47 s -8 s`, `5 min 12 s +17 s` for a rerun Landed. This fixture would expose using wall time, a sum of all job durations, or the longest single job. Taken fixtures independently exercise Story Branch's provisional Branch and Trunk Mode's Provisional row, with exact negative and positive deltas after the branch head advances. `dashboard/tests/support/storyCiObservedJobs.ts:28–90,130–171`, `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts:10–20`, `dashboard/tests/intent/intent-ci-comparison.spec.ts:125–144`, `dashboard/tests/intent/intent-ci-comparison-taken.spec.ts:64–115,124–155`. |
| Carry forward the start-to-finish durations of earlier-attempt jobs in a rerun. | protected | The fake supplies `103/2`, with no equivalent attempt-one listing, and carries rows whose reported creation follows their earlier start/finish. The browser requires run `103 #2` with `5 min 12 s +17 s`. The direct estimator test lengthens only carried-over `dashboard (3/12)` while keeping it before attempt creation, then requires 337,000 ms instead of 312,000 ms, which exposes silently dropping it. `dashboard/tests/support/storyCiObservedJobs.ts:70–90,143–171`, `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts:23–40`, `dashboard/tests/intent/intent-ci-comparison.spec.ts:119–144`. |
| Source dependencies from the configured workflow path at each build's revision, with templated jobs matched to attempt rows. | protected and break-checked | The fake reports `.github/workflows/comparison.yml`, a committed copy of the project `ci.yml` with matrix display names and `needs: [test, dashboard]`. After constructing the build revisions, the journey commits `jobs: {}` at the local tip. Valid estimates and correct attempt links still have to render for the historical builds. The selective `HEAD` fault below broke exactly this observation. `dashboard/tests/support/storyCiComparisonFixture.ts:94–98,151–154,224–229`, `dashboard/tests/intent/intent-ci-comparison.spec.ts:72–144`, `dashboard/server/baseCiGithubRevisionLookup.ts:107–135`, `.github/workflows/ci.yml:75–76,135–136,225–226`. |
| Explain individual running, unavailable job listing, or missing/ambiguous workflow evidence and preserve the other rows' estimates and deltas. | protected | For Landed, the browser exercises an in-progress attempt, absent attempt-jobs response, a duplicate `lint` row, and removal of the workflow before the landing merge. Exact arrays require Baseline and Branch figures unchanged and Landed either `Unavailable while the build is running.` with a wall dash or the specific missing jobs, missing historical file, or ambiguous match reason alongside `5 min 19 s` wall time. The direct estimator also uses a missing end bound and two definitions with the same display name or no matching definition, and asserts the precise reasons. `dashboard/tests/intent/intent-ci-comparison-gaps.spec.ts:101–162`, `dashboard/tests/intent/intent-ci-comparison.spec.ts:82–85,131–144`, `dashboard/tests/support/storyCiObservedJobs.ts:143–171`, `dashboard/tests/support/storyCiComparisonEarlierLanding.ts:61–84`, `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts:43–77`. |
| Show an available estimate without a delta when Baseline's estimate is unavailable. | gap | `dashboard/src/storyCiComparisonWording.ts:50–54` implements this branch. The timing-gap journeys leave Baseline measured and only make Landed unavailable. They would not catch showing a delta against an invented zero Baseline while still rendering all existing examples correctly. |
| Display the framing and identify which single builds were compared. | protected | The Done journey's panel requires `observedNotAttributed` and identifies three specific run/attempt links. Removing the framing from this panel is caught. `dashboard/tests/intent/intent-ci-comparison.spec.ts:17,89–124`, `dashboard/src/IntentCiComparison.tsx:239–245`, `dashboard/src/storyCiComparisonWording.ts:57–58`. |
| Preserve the noncausal meaning of the observation wording. | gap | The assertion imports `observedNotAttributed` from production, so a shared-constant edit replacing observation with a causal claim would satisfy both sides. `dashboard/tests/intent/intent-ci-comparison.spec.ts:17,92`, `dashboard/src/storyCiComparisonWording.ts:57–58`. |
| Reuse completed job listings when a fresh Taken comparison still references one and when Branch and Landed share an attempt. | protected | The first Taken read observes exactly `101/1/1` and `102/1/1`. A synthetic push advances the story branch; jobs are then served only for `103/2`. The test waits for the new SHA and `5 min 12 s +17 s`, verifies Baseline remains measured, and requires exactly the original requests plus `103/2/1`. The fast-forward test identifies Branch and Landed as the same `402 #1` and asserts only `401/1/1`, `402/1/1`. `dashboard/tests/intent/intent-ci-comparison-taken.spec.ts:29–121`, `dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts:16–63`, `dashboard/tests/support/storyCiComparisonFixture.ts:102–112`, `dashboard/server/baseCiGithubRevisionLookup.ts:81–104`. |
| Keep two attempts of the same run distinct in the completed-jobs cache. | gap | The cache key includes repository, run and attempt in `dashboard/server/baseCiGithubRevisionLookup.ts:86–104`. The fresh Taken comparison changes both run and attempt (`102/1` to `103/2`), so removing attempt from the cache key could pass. Endpoint selection for attempt 2 is separately protected by the exact fixture route and timing. |
| Document request cost and preserve pagination of the shared reader. | protected | `dashboard/GITHUB-REQUESTS.md:65–71` states one jobs request per 100 jobs for a newly shown completed attempt with a readable workflow file, process reuse and failure retry. `docs/dashboard-development-intent.md:112–125` documents the user-facing comparison. The shared reader's observer fixture exposes a failure in job 120 and requires exactly two `runs/42/attempts/2/jobs?per_page=100&page=…` requests, corroborating the code and cost. The dashboard journey independently observes single pages for its smaller attempts. `src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs:32–81`, `src/skills/dough-execute-plan/scripts/ci-github-actions.mjs:198–211`. |
| Extend a chain through more than one dependency hop and fail closed on an unresolvable dependency graph. | gap | The successful estimator fixtures all use the same two-level workflow whose critical path is a dashboard shard followed by `ci-proof`. A computation that only adds each node's longest immediate predecessor can reproduce them. Unavailable fixtures use missing workflow files, jobs or names. I found no maintained assertion for transitive chain accumulation or an unresolved dependency ID/cycle at `dashboard/server/ciTimeWithoutRunnerWaits.ts:87–104`. |
| Count a skipped job after failure as zero when its bounds are absent, as specified in the plan. | gap | All four estimator tests pass `false` for the failed flag. The failed-landing journey verifies failure identity and the Branch wall time but does not supply skipped job rows or require an estimate for Landed. The special branch in `dashboard/server/ciTimeWithoutRunnerWaits.ts:25–35` can change without affecting those assertions. `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts:10–77`, `dashboard/tests/intent/intent-ci-comparison-landing-gaps.spec.ts:17–48`. |

The missing-bounds verdict uses the exact module assertion and common UI reason plumbing. The focused browser fixtures do not independently serve a row with a null start or completion. Deferred features (naming critical jobs or per-job waits, no-wait time on the separate Proof line, later visual cues) are unassessed. No full suite, live hosted exercise, cache-eviction/retry probe, or cross-tool verification was in scope. Current source shows no faster/slower cue in the comparison table; the numeric signed comparison is exercised.

#### Commands and results

`pmset -g batt` reported AC power before the guarded runs. The historical Node requirement matched `v24.21.0`; npm was `11.19.0`. Each command below used the supplied 60-second reporting reserve. Browser acquisition was directed into this checkout's `.git/assessment-browsers`; application tests used local fake GitHub. All reported command durations are measured wall times from the bound wrapper. Runner timings, where printed, are separately labeled.

##### Locked setup

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i python3 .git/assessment-bound.py 110 node scripts/setup-native.mjs npm
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-browsers" caffeinate -s -i python3 .git/assessment-bound.py 65 node scripts/setup-native.mjs browser
```

Both exited 0. Locked npm acquisition installed 179 packages in 1.351 s (wrapper) with an `fsevents` install-script allowlist warning. Browser acquisition installed the locked Chromium, headless shell and FFmpeg in 22.405 s (wrapper).

##### Direct revision-selection and shared acquisition checks

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i python3 .git/assessment-bound.py 65 node --test --test-concurrency=1 tests/support/dashboard-ci-revision-nearest.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs
```

Exit 0, **5 passed**. Node printed 4,453.941166 ms, with 4.524 s wrapper wall time. The direct fixture's cancelled latest attempt checks completed-attempt fallback, and its revision list checks the measured ancestor plus the exclusive story-start bound (`tests/support/dashboard-ci-revision-nearest.test.mjs:17–72`). The acquisition observer checks the exact API sequence and failure in job 120 described above, rate-limit suspension and subsequent coverage, and the repository's centralized GitHub request-source constraint.

##### Dashboard typecheck

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i python3 .git/assessment-bound.py 65 npm run --silent typecheck:dashboard
```

Exit 0. Silent compiler/typecheck gate with no runner count or printed runner duration, 6.154 s wrapper wall time.

##### Comparison browser and estimator checks

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-browsers" caffeinate -s -i python3 .git/assessment-bound.py 225 node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts --workers=1 --reporter=list dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts dashboard/tests/intent/intent-ci-comparison*.spec.ts
```

Exit 0, **23 passed** with one worker. Playwright printed 1.4 min, with 85.622 s wrapper wall time. The four estimator tests and 19 browser tests covered the setups and assertions in the verdict table. The six browser files selected two entry tests (expired/missing proof; no fabricated entry totals), two fast-forward tests (exact shared tip or preserved earlier merge), six gap tests (Trunk Mode, running Landed, ambiguous workflow, missing workflow, missing Landed, and unbuilt fast-forward), two failed/cancelled landing tests (no wrong trunk-side substitution), two Taken modes, and five main Done journeys (three merge variants, earlier landing, and unrecoverable history). The earlier-story and entry tests are compatibility evidence for existing selection and wall/entry consumers.

##### Selective workflow revision break check

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-browsers" caffeinate -s -i python3 .git/assessment-bound.py 75 node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts --workers=1 --reporter=list dashboard/tests/intent/intent-ci-comparison.spec.ts -g 'with clean landing'
```

Changed only `dashboard/server/baseCiGithubRevisionLookup.ts:121`, replacing ``git show `${revision}:${path}``` with ``git show `HEAD:${path}```. The clean-landing test had passed unmodified in 3.9 s. Its fixture installs a good historical workflow and then commits the deliberately incompatible `jobs: {}` at local HEAD. The altered run reached the timing-cell assertion at line 138 after passing the identities, links, headers and wall-cell assertions. The actual three timing cells all contained `Unavailable. The workflow's job definitions could not be read.` where the exact expected values were `4 min 55 s`, `4 min 47 s -8 s`, and `5 min 12 s +17 s`. This diagnostic is emitted only after the workflow contents and jobs have been read and the workflow parser rejects the content, confirming the fixture reached the changed path. Exit 1, one expected assertion failure, Playwright reported 9.2 s for the test, with 12.482 s wrapper wall time. An exit trap restored the one file as soon as the command ended. Both `git diff --exit-code -- dashboard/server/baseCiGithubRevisionLookup.ts` and clean `git status --short` verified restoration before later checks.

##### Summary comparison compatibility

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-browsers" caffeinate -s -i python3 .git/assessment-bound.py 110 node node_modules/playwright/cli.js test --config dashboard/playwright.config.ts --workers=1 --reporter=list dashboard/tests/intent/intent-summary-story-comparison*.spec.ts
```

Exit 0, **11 passed** with one worker. Playwright printed 55.9 s, with 56.254 s wrapper wall time. The three files select three file-Proof cases, five Summary gap/mode/selection cases, and three entry/folder cases. The published fixture supplies three named builds and per-file proof breakdowns, with Done merge variants, a Taken branch and a Done Trunk fixture for the applicable tests. The assertions check exact comparison row values, recovered revision identities and provisional/NA states, missing breakdown and running explanations, story switching, and separate file Purpose/Proof behavior. These are shared comparison-answer and endpoint-proof compatibility checks. They do not exercise the no-wait delta itself. `dashboard/tests/support/intentSummaryStoryComparisonFixture.ts:44–103`, `dashboard/tests/intent/intent-summary-story-comparison.spec.ts:34–121`, `dashboard/tests/intent/intent-summary-story-comparison-gaps.spec.ts:41–203`, `dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts:77–132,179–211`.

#### Effort and final state

39 existing focused tests passed at the unmodified checkpoint (34 Playwright, 5 Node), along with dashboard typecheck. There was no unmodified historical failure. The only failure was the intentional one-test break check. Test and check commands totaled 152.554 s of wrapper wall time by addition of their independent timings, excluding the 23.756 s for locked setup and 12.482 s for the break check. Individual operations overlapped in places, so these sums are command effort rather than session elapsed time. The first timestamped scratch check was 13:13:25 UTC and the last result was collected at approximately 13:18:48 UTC, about 5 min 23 s elapsed including source review and test waiting. Active human-equivalent review time and production CI timings were not independently measured. No product files or commits remain changed. The historical [failure policy](https://github.com/terryyin/open-dough/blob/6f6d27f0ad119fd1a645b787b28e1c41b066e86e/AGENTS.md#failing-and-flaky-tests) was applied within the read-only assessment scope.
