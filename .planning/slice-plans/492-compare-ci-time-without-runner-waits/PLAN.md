# Compare CI time without runner waits

**Identity:** SEED-256#compare-ci-time-without-runner-waits
**Source:** [Compare CI time without runner waits](../../seeds/SEED-256-compare-ci-time-without-runner-waits.md#compare-ci-time-without-runner-waits)

**Source review:** [Independent source review](source-review.md)

## Execution context

- Story Branch Mode in the linked worktree `/Users/terryyin/git/open-dough/.worktrees/compare-ci-time-without-runner-waits` on `codex/compare-ci-time-without-runner-waits`. Default checkout: `/Users/terryyin/git/open-dough`. Established Take by DavidKo-chan for publisher `dashboard-territory.local-open-dough`, starting revision `c90e30dd1d1202de96facbc3f2bdb30e88051a7a`, accepted claim `2ca01b59800c4fecd262da91c11dc6a26feae39a` on `origin/main` and the story branch. The claim's trunk CI is unobserved by this execution.
- GitHub Actions `terryyin/open-dough`, selector `ci.yml` (CI), observing the story branch from this checkout. Codex coordinator `DavidKo-chan-492`, mailbox `/tmp/dough-ci-501/watch-BBvPeM`, PID 29311, stream session 98623, cell `g2:7`. Managed delivery registers increments against that stream.
- Locked npm install, dashboard typecheck and Chromium setup succeeded in this checkout under the AC sleep guard.
- Slice 1 published and registered at `10fa0a78c0f048002423198e1ad83d885445e2df` on the story branch, extending the claim. Full lint and the check-only commit hook passed.
- Slice 2 published and registered at `8f92cfc24c9acddee28cb6d7636206dc838bf31d` on the story branch, extending slice 1. The selective formatter and commit hook passed.
- Slice 3 published and registered at `6f6d27f0ad119fd1a645b787b28e1c41b066e86e` on the story branch, extending slice 2. The final full lint and commit hook passed.

## Goal and scope

A developer reviewing a story's **CI timing changes** in Intent sees each
Baseline, Branch, Provisional and Landed build's CI wall time as context, and
compares the builds by **CI time without runner waits**: the longest chain of
dependent jobs in the shown attempt, each job counted by its own
start-to-finish duration.

Included:

- Each completed GitHub Actions comparison build's attempt jobs, read through
  the existing `attemptJobs` reader in
  `src/skills/dough-execute-plan/scripts/ci-github-actions.mjs`.
- Job dependencies from the selected workflow's `path` (the workflow lookup
  already answers it) at the build's revision, read with `git show` in the
  project folder the comparison already uses for subjects
  (`dashboard/server/baseCiGithubRevisionLookup.ts`), through a narrow,
  dependency-free reader of `jobs.<id>.name` and `jobs.<id>.needs` that fails
  closed on anything it does not understand.
- Matching reported job names to job definitions: a job without `name` matches
  its id, or its id followed by ` (` … `)` for a matrix; a templated `name`
  matches by its literal text around each `${{ … }}`. A reported job matching
  zero or several definitions makes the estimate unavailable.
- The comparison table keeps **CI wall time** without a difference and adds
  **CI time without runner waits** with the signed whole-second difference from
  Baseline (`wholeSecondDifferenceWords`), or the reason it is unavailable.
- Completed attempts' job listings remembered for the dashboard process, and
  the added request cost in `dashboard/GITHUB-REQUESTS.md`; the comparison
  description in `docs/dashboard-development-intent.md`.

Excluded (the seed's deferred promises): naming the critical jobs or per-job
waits; the measure on the judged run's **Proof** line; faster/slower colour
cues (a later story uses this measure for them). A `ciAdapter` project already
gets no story comparison (`baseCiRevisionLookup.ts`), so it needs nothing here.

## Existing solution and decisions

- PFE: reuse `createGitHubActions().attemptJobs` (paged attempt jobs) and the
  comparison's revision lookup and local Git call; follow the fail-closed,
  dependency-free precedent of `ci-workflow-path-policy.mjs` for workflow
  reading, but tolerate `#` comments and `${{ }}` in `name` values, which the
  jobs section of this repository's `ci.yml` contains. No YAML dependency.
- The estimate is computed on the server into the comparison slot (a
  milliseconds value or an unavailable reason) and worded in
  `dashboard/src/storyCiComparisonWording.ts`; the client does no GitHub or
  graph work.
- Durations: a job's `completed_at − started_at`; a skipped job with equal or
  absent bounds after a failure counts 0 only when GitHub reports it
  `skipped`; any other job missing a bound makes the estimate unavailable.
- Done answers are already remembered per process
  (`intentCiComparisonAnswers.ts`); Taken answers are re-read, so the
  completed-attempt jobs memo is what keeps a Taken re-read from listing jobs
  again.
- Follows [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  derived from GitHub observations, rebuilt on read, missing evidence explained
  rather than shown as a time. No ADR conflict; no North Star topic needed.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| GitHub's attempt jobs listing (`runs/{id}/attempts/{n}/jobs`, the `attemptJobs` form) gives each job's start and completion, enough to reproduce the seed's numbers | 2026-11-07 `gh api repos/terryyin/open-dough/actions/runs/{42341688832,42346356441}/jobs` and `…/runs/42196943419/attempts/2/jobs` | Baseline: `dashboard (9/12)` 4:42 + `ci-proof` 0:13 = 4:55, wall 05:11:50→05:16:49 = 4:59. Branch: `dashboard (3/12)` 4:33 + `ci-proof` 0:14 = 4:47, wall 13:27. Attempt 2 lists all 17 jobs; 16 carried over keep attempt-1 start/completion with `created_at` after `started_at`; `dashboard (12/12)` 4:55 + `ci-proof` 0:17 = 5:12, wall (run_started_at→updated_at) 5:19. |
| The build's workflow file is readable locally at its revision, and the lookup answers its `path` | 2026-11-07 `git cat-file -e` and `git show <sha>:.github/workflows/ci.yml` in `/Users/terryyin/git/open-dough` for `811b9a1` and `1815ab8`; `gh api repos/terryyin/open-dough/actions/workflows/ci.yml --jq .path` | Both present; jobs `lint`, `test` (`name: test (${{ matrix.share }}/${{ strategy.job-total }})`), `dashboard` (`name: dashboard (${{ matrix.shard }}/…)`), `ci-proof` (`needs: [test, dashboard]`); path `.github/workflows/ci.yml`. Literal-text matching maps all 17 reported names uniquely. Fixture repositories must commit a workflow file and the fake must answer `path` and attempt jobs (slice 1 adds both). |
| A `ciAdapter` project never reaches the comparison | `dashboard/server/baseCiRevisionLookup.ts:166-177` returns the "does not list builds by revision" gap | No adapter path to handle. |
| The comparison specs and dashboard typecheck pass at the starting revision in this worktree | 2026-11-07 at `923f5abc2`: `npm run --silent typecheck:dashboard`, then `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts --reporter=list` on the six `intent-ci-comparison*.spec.ts` files, after `node scripts/setup-native.mjs npm` and `browser` | Typecheck passed; 17 passed in 53.1 s (load average 1.5–4.5). |

## Outside-in proof and ownership

| Promise | Owner | Proof |
| --- | --- | --- |
| Wall time stays, without a difference | 1 | `intent-ci-comparison.spec.ts` wall cells show times only |
| Time without runner waits and signed difference from Baseline (example 1) | 1 | `intent-ci-comparison.spec.ts` with the source-review timings: `4 min 55 s`, `4 min 47 s -8 s`; wall `4 min 59 s`, `13 min 27 s` |
| Longest dependent chain, carried-over re-run jobs (example 2) | 1 | `dashboard/backend-tests/intent/` module test of the estimate on the observed job rows and the `ci.yml` text |
| Unavailable with reason, others keep differences (example 3) | 2 | `intent-ci-comparison-gaps.spec.ts`: Landed workflow ambiguous / unreadable; running build; module test for missing bounds and zero/several matches |
| Taken provisional rows compare on the same measure | 2 | `intent-ci-comparison-taken.spec.ts` |
| Completed-attempt jobs not listed again; documented cost | 3 | Taken re-read request count in `intent-ci-comparison-taken.spec.ts`; `dashboard/GITHUB-REQUESTS.md` |

Consumers of the changed wall cell (`.intent-ci-comparison-wall`, which today
carries `+20 s`-style differences): `intent-ci-comparison.spec.ts`,
`-fast-forward`, `-taken`, `-landing-gaps`, `-entries`, `-gaps`. Run the
consumer-trace script on each slice's diff and give every listed consumer a
disposition.

**Local gates:** `npm run lint`, `npm run --silent typecheck:dashboard`, the
focused module tests, and the six `dashboard/tests/intent/intent-ci-comparison*.spec.ts`
files through `npx playwright test --config dashboard/playwright.config.ts
--reporter=list` (with `env -u NO_COLOR -u FORCE_COLOR -u
GIT_ALTERNATE_OBJECT_DIRECTORIES`), under the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on observed AC with `caffeinate -s -i`, or the lid-open
`caffeinate -i` procedure on battery with sleep-log inspection). No full suite
locally: the change stays within Intent's comparison read and view; hosted CI
runs the rest.

**Failure policy:** [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Ordered slices

### 1. Compare done-story builds by CI time without runner waits
Type: Behavior
Status: done
Proof: module test of the estimate (example 1 rows and example 2 carried-over
rows against this repository's `ci.yml` text); `intent-ci-comparison.spec.ts`
with the source-review timings; the other five comparison specs updated for
the wall cell; typecheck and lint.

Behavior: A done Story Branch story whose baseline attempt ran `lint`, three
`test` shares, twelve `dashboard` shards and `ci-proof` with the source-review
timings, and whose branch attempt queued shards for up to eight minutes →
selecting it in Intent shows Baseline wall `4 min 59 s` and time without runner
waits `4 min 55 s`, Branch wall `13 min 27 s` and `4 min 47 s -8 s`, with no
wall-time difference. A build whose jobs cannot be read says so in the new
column and shows no difference. Adds the fake's `actions-attempt-jobs`
request kind and workflow `path`, and a committed workflow file in the
comparison fixtures.

Accepted proof: the guarded typecheck and the six comparison specs, three
Summary comparison specs, and the timing module passed all 30 tests after
independent refactoring. The guarded direct revision-selection test passed
both cases. The comparison proves the configured historical workflow path,
exact source-review and rerun timings, and the missing jobs response. The
timing module also lengthens a carried-over shard so its duration must
contribute. The consumer trace checks all six old wall-cell consumers with
exact wall text and the three Summary consumers with their entry, folder,
and file assertions. Shard preview assigns the new module to 6 of 12.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES zsh -c 'npm run --silent typecheck:dashboard && npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent/intent-ci-comparison*.spec.ts dashboard/tests/intent/intent-summary-story-comparison*.spec.ts dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts'
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --test tests/support/dashboard-ci-revision-nearest.test.mjs
```

### 2. Explain each unavailable estimate and keep the others' differences
Type: Behavior
Status: done
Proof: `intent-ci-comparison-gaps.spec.ts` and
`intent-ci-comparison-taken.spec.ts`; module tests for a job without bounds,
a name matching no definition and one matching two.

Behavior: The Landed build's workflow names a job matching two reported jobs,
or has no readable workflow file at its revision; or a build is still running →
that row shows its wall time (or running state) and the specific reason its
time without runner waits is unavailable, with no difference; Baseline and
Branch keep theirs. A Taken story's Branch or Provisional row compares on the
same measure.

Accepted proof: the guarded dashboard typecheck and 34 focused tests passed.
The gaps spec covers a running build, duplicate reported job names, and a
workflow removed before the landing merge. Exact cell assertions preserve
Landed wall time and the other rows' timings, with a reason in place of the
unavailable Landed estimate and delta. The module exercises missing bounds
and zero or several matching definitions. The Taken spec covers the signed
difference in both modes. The consumer trace covered the six wall-cell
specs and all three Summary comparison specs. Independent refactoring shared
the observed fixture inputs. The guarded typecheck and all 19 comparison
tests passed again with the module and Summary proof unaffected.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES zsh -c 'npm run --silent typecheck:dashboard && npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts dashboard/tests/intent/intent-ci-comparison*.spec.ts dashboard/tests/intent/intent-summary-story-comparison*.spec.ts'
```

### 3. Remember completed attempts' jobs and document the cost
Type: Behavior
Status: done
Proof: `intent-ci-comparison-taken.spec.ts` counts one attempt-jobs request
per completed attempt across two reads of the same Taken comparison;
`dashboard/GITHUB-REQUESTS.md` and `docs/dashboard-development-intent.md`
updated.

Behavior: A Taken story's comparison is read, then read again on a new branch
head whose Baseline attempt is unchanged → the second read lists no jobs for
the Baseline attempt; the request documentation names one jobs listing per
newly shown completed attempt (per 100 jobs).

Accepted proof: the guarded typecheck and all 34 focused tests passed. The
Taken branch-head update lists only new attempt 103/2, leaving Baseline 101/1
and the earlier branch 102/1 each at one jobs page, and shows the new estimate
with its signed difference. Branch and Landed share one listing when they
name the same fast-forward attempt. The GitHub acquisition test passed all
three checks, including the existing reader's two-page request sequence.
The consumer trace dispositioned shared transport, fixtures, and docs.

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES zsh -c 'npm run --silent typecheck:dashboard && npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts dashboard/tests/intent/intent-ci-comparison*.spec.ts dashboard/tests/intent/intent-summary-story-comparison*.spec.ts'
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --test src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs
```

## Execution complete

Product advice: no change. Intent now compares the observed builds by their
dependency-chain durations and distinguishes missing observations, consistent
with [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The related proof-cue and custom-adapter stories already own their respective
next outcomes.

The retrospective reviewed the original seed and plan at the Take
`2ca01b598`, then the attributable published changes `10fa0a78c` (measure),
`8f92cfc2` (gap and provisional proof), and `6f6d27f0` (request reuse).
Concurrent trunk stories were outside this manifest. The server reuses the
authenticated GitHub reader and the dashboard's disposable cache. Browser
journeys cover endpoint selection and displayed outcomes, and focused
module cases cover job evidence. The process review used the execution's
conversation, agent returns, and publication receipts. It produced no new
finding. Branch CI was pending at the review boundary.

## Plan concerns

Slice-plan refinement was not needed: three slices, each one proof loop on
one boundary, with no fragmented or combined outcome. This review identified
no remaining slice-specific concern.
