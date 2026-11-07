# Blinded assessment of SEED-257

## Case provenance

- Historical story and original plan at the detached checkpoint.
  [SEED-257#compare-story-ci-through-adapters](https://github.com/terryyin/open-dough/blob/47190ebc009ceedfe4f7a882c941b2645f0a309e/.planning/seeds/SEED-257-compare-story-ci-through-adapters.md#compare-story-ci-through-adapters) ·
  [Original plan](https://github.com/terryyin/open-dough/blob/47190ebc009ceedfe4f7a882c941b2645f0a309e/.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md)
- Base `577b9e62135166386212d9041af1953e2eaf5f28`, checkpoint `47190ebc009ceedfe4f7a882c941b2645f0a309e`. The assessor was
  given these two revisions and the selected historical source paths.
- Scratch checkout `/tmp/dough-assessment-gks2djtp`, report
  `/tmp/dough-assessment-gks2djtp/.git/assessment-report.md`. The assessor was
  launched with `fork_turns: "none"` and received the common
  [assessment method](assessment-brief.md#method-supplied-to-every-assessor)
  and the case inputs listed here. The historical failure policy matched the
  current policy verbatim.
- The coordinator ran `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git diff-tree --no-commit-id --name-only -r 8dcf704f6`, `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git diff-tree --no-commit-id --name-only -r c7432cf14`, `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git diff-tree --no-commit-id --name-only -r ef486f0ff`
  with exit 0 for each. These were the Plan 498 attribution inputs. The union
  of product, test and documentation paths supplied to the assessor follows.
  The original plan and seed were supplied separately.

```text
dashboard/GITHUB-REQUESTS.md
dashboard/server/baseCiAdapterAttempts.ts
dashboard/server/baseCiAdapterRevisionLookup.ts
dashboard/server/baseCiGithubRevisionLookup.ts
dashboard/server/baseCiJudgment.ts
dashboard/server/baseCiNearest.ts
dashboard/server/baseCiRevisionGit.ts
dashboard/server/baseCiRevisionLookup.ts
dashboard/server/baseCiRevisionNearest.ts
dashboard/server/ciAdapterProof.ts
dashboard/server/intentCiComparisonResolve.ts
dashboard/server/intentCiComparisonSlots.ts
dashboard/server/storyPublishedEndpointDerived.ts
dashboard/server/storyPublishedEndpoints.ts
dashboard/server/takenStoryEndpoints.ts
dashboard/src/IntentCiComparison.tsx
dashboard/src/storyCiComparison.ts
dashboard/src/storyCiComparisonEntries.ts
dashboard/src/storyCiComparisonWording.ts
dashboard/src/useIntentCiComparisonEntries.ts
dashboard/tests/intent/intent-ci-comparison-adapter-gaps.spec.ts
dashboard/tests/intent/intent-ci-comparison-adapter-taken.spec.ts
dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts
dashboard/tests/intentCiAdapterProofProject.ts
docs/dashboard-development-intent.md
src/skills/dough-execute-plan/manuals/custom-ci-proof.md
src/skills/dough-execute-plan/manuals/custom-ci.md
src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs
src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs
tests/support/dashboard-ci-adapter-proof.test.mjs
tests/support/dashboard-ci-adapter-revision-lookup.test.mjs
```

## Store and restoration checks

The coordinator checked this new store before dispatch. The setup process
cleared `GIT_ALTERNATE_OBJECT_DIRECTORIES` from the environment of every Git
command. The execution-complete object `76565b1c29fa2370a868fbe7c97e46bfbd4d95cf` was checked by the
coordinator only. The Git command outcomes were

```text
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git init --quiet --template= -> exit 0
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git fetch --no-tags --no-write-fetch-head --depth=1 file:///Users/terryyin/git/open-dough 577b9e62135166386212d9041af1953e2eaf5f28:refs/heads/case-base 47190ebc009ceedfe4f7a882c941b2645f0a309e:refs/heads/case-checkpoint -> exit 0
From file:///Users/terryyin/git/open-dough
 * [new ref]         577b9e62135166386212d9041af1953e2eaf5f28 -> case-base
 * [new ref]         47190ebc009ceedfe4f7a882c941b2645f0a309e -> case-checkpoint
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git -c advice.detachedHead=false checkout --quiet --detach 47190ebc009ceedfe4f7a882c941b2645f0a309e -> exit 0
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git cat-file -t 577b9e62135166386212d9041af1953e2eaf5f28 -> exit 0
commit
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git cat-file -t 47190ebc009ceedfe4f7a882c941b2645f0a309e -> exit 0
commit
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git cat-file -t 47190ebc009ceedfe4f7a882c941b2645f0a309e:.planning/seeds/SEED-257-compare-story-ci-through-adapters.md -> exit 0
blob
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git cat-file -t 47190ebc009ceedfe4f7a882c941b2645f0a309e:.planning/slice-plans/495-compare-story-ci-through-adapters/PLAN.md -> exit 0
blob
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git cat-file -t 76565b1c29fa2370a868fbe7c97e46bfbd4d95cf -> exit 128
fatal: git cat-file: could not get object info
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git rev-parse --is-shallow-repository -> exit 0
true
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git rev-list --count --all -> exit 0
2
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git rev-parse HEAD -> exit 0
47190ebc009ceedfe4f7a882c941b2645f0a309e
test ! -e .git/objects/info/alternates -> exit 0
test ! -e .git/objects/info/http-alternates -> exit 0
test ! -e .git/FETCH_HEAD -> exit 0
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git remote -v -> exit 0
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git status --porcelain=v1 --untracked-files=no -> exit 0
```

The empty outputs for `git remote -v` and tracked status had exit 0.
The assessor restored its one scratch fault. After the assessor finished, the coordinator ran these checks from the scratch checkout before copying the report.

```text
env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git rev-parse HEAD
47190ebc009ceedfe4f7a882c941b2645f0a309e
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
| End-to-end wall clock | **Measured**, 376.442 s from 2026-11-07T13:19:15.589Z through the returned report at 2026-11-07T13:25:32.031Z. Includes attribution, Git setup, dispatch, tests and report writing. The absolute 600 s cutoff was 2026-11-07T13:29:15.589Z. |
| Attribution and Git setup | **Measured**, 1.583 s from the case start through successful checks and scratch limiter setup at 2026-11-07T13:19:17.172Z. Part of the end-to-end clock. |
| Launch to returned report | **Measured**, 346.289 s from the fresh assessor's task start at 2026-11-07T13:19:45.742Z to report receipt. Includes test, report and delivery time. |
| Assessor elapsed span | **Measured**, 350.553 s from task start to task completion at 2026-11-07T13:25:36.295Z. Includes tests and waits. |
| Test runtime | **Measured**, Playwright printed 3.4 min for the focused selection and 3.7 s for the deliberate failing test. The six module jobs reported 0.5, 0.4, 0.1, 1.5, 0.1 and 0.1 s. Wrapper wall times are recorded separately below. |
| Assessor tokens | **Measured**, 2,451,094 input tokens, including 2,353,920 cached input tokens, and 11,577 output tokens. Last case-specific Codex `total_token_usage`, row 203 of the assessor record below. |
| Active assessor effort and coordinator effort | **Unavailable** (s). The clocks do not separate active work, waits and overlapping work. |
| Human effort | **Unavailable** (s). Reading and verification are separate activities for the comparison. |

The case-only Codex record `rollout-2026-11-07T21-19-45-01a1b62a-4403-7671-8817-fa1c939025f8.jsonl` supplies task start at row 2 and task completion at row 204. The scratch report's last modification was 2026-11-07T13:25:28.118Z. The returned-report boundary is the coordinator's report-ready notification at row 418 in `rollout-2026-11-07T21-09-51-01a1b621-33aa-73e1-80f5-d7d92270197d.jsonl`.
Before starting this case, the coordinator observed AC, 16 CPUs at load 3.39/2.76/2.55, 69% free memory, and 115 GiB free on the scratch volume. One prior assessor had finished. Existing browser and Node jobs remained in place.

Historical proof at the checkpoint. [Listing-branch normalization](https://github.com/terryyin/open-dough/blob/47190ebc009ceedfe4f7a882c941b2645f0a309e/dashboard/server/baseCiAdapterAttempts.ts#L59-L103) · [Adapter fixture, Branch identity and proof requests](https://github.com/terryyin/open-dough/blob/47190ebc009ceedfe4f7a882c941b2645f0a309e/dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts#L64-L245) · [Endpoint gap and discovery checks](https://github.com/terryyin/open-dough/blob/47190ebc009ceedfe4f7a882c941b2645f0a309e/dashboard/tests/intent/intent-ci-comparison-adapter-gaps.spec.ts#L20-L127)

## Assessor report

### Maintained-test assessment for SEED-257

Scope is `SEED-257#compare-story-ci-through-adapters`, its original plan 495, and the full checkpoint `47190ebc009ceedfe4f7a882c941b2645f0a309e` (supplied base `577b9e62135166386212d9041af1953e2eaf5f28`). The story's historical acceptance records were context. Verdicts below use the checkpoint's maintained checks and their actual observing assertions. This assessment did not use the live Pygardon service.

#### Production path and fixture boundary

`dashboard/server/performedRead.ts:152` dispatches the authenticated `intent=ci-comparison` read to `intentCiComparisonRead.ts:37`. `intentCiComparisonResolve.ts:26,149` derives Done facts from published completion and claim history and Taken facts from the live claim and tip. Done recovery identifies the merge, its story-side parent, or the fast-forward tip in `storyPublishedEndpointDerived.ts:135`. The Taken adapter branch reads the published tip from Git origin in `takenStoryEndpoints.ts:85–110`. `baseCiRevisionLookup.ts:152` chooses adapter or Actions from project configuration, and `baseCiRevisionGit.ts:3–16` provides the shared first-parent walk. The adapter invokes the configured command for the target and known story branch, keeps the branch each answer came from, and indexes the returned full SHAs in `baseCiAdapterAttempts.ts:59–103` and `baseCiAdapterRevisionLookup.ts:15–61`. `intentCiComparisonSlots.ts:20–54` maps adapter IDs to text in the answer. `IntentCiComparison.tsx:43–110` renders the endpoint rows.

The browser fixture in `dashboard/tests/intentCiAdapterProofProject.ts:48–107` writes a project `ciAdapter` configuration pointing to a Node subprocess. The subprocess reads real JSON requests from stdin and records them before answering by the requested discovery branch or proof attempt. Browser journeys publish real temporary Git history and use the dashboard's authenticated read, production build and rendered Intent panel. GitHub responses and adapter replies come from fixtures.

#### Promise verdicts

In the table, **Done**, **Gaps** and **Taken** refer to `dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts`, `intent-ci-comparison-adapter-gaps.spec.ts` and `intent-ci-comparison-adapter-taken.spec.ts` respectively.

| Promise | Verdict | Fixture and observing signal |
| --- | --- | --- |
| Discover on the target and known story branch, match full SHA even if validated for another branch, retain the listing branch | protected and break-checked for listing-branch identity | Done:64–110 puts the branch attempt at an uppercase SHA, reports `ci/another-branch` as the validating branch, and returns it only for the known story branch. Done:167–210 asserts the actual subject, short SHA, link and the JSON full normalized SHA, exact listing branch and string IDs. The request log has exactly the target and story branch discoveries. Taken:66–91 independently checks one discovery for trunk or two for Story Branch and zero GitHub calls for the comparison read. |
| Done Baseline and Branch use the nearest eligible first-parent ancestor. Story Branch Landed uses the exact landing, including a fast-forward | protected | Done:62–110 starts from the real merge fixture, with a built pre-claim Baseline, built story-side parent of a planning-only tip, built landing merge and a separate later completion build. Done:128–200 asserts the specific Baseline and Branch ancestors and exact landing merge, distinguishing that merge from the later completion. The fast-forward case asserts Branch and Landed both select its exact tip. `dashboard-ci-revision-nearest.test.mjs:39–66` checks ancestor labeling, skipped count and the exclusive start bound with an older build present. The existing Actions fast-forward gap case supplies a built second parent as a decoy and asserts neither Branch nor Landed uses it. |
| Done Trunk Mode uses the completion walk for Landed | protected | Gaps:66–98 publishes a real Trunk Mode completion after the implementation commit, returns a build only at that commit, and checks Branch is inapplicable and Landed is the implementation SHA labeled ancestor. The shared resolver selects completion with the story-start bound in `intentCiComparisonResolve.ts:93–129`. |
| Pending attempt means running. Taken Branch or Provisional can show a completed ancestor, with Landed unsettled | protected | Taken:27–91 adds and pushes a new live tip after a completed commit, initially answers only a pending attempt and asserts HTTP 200 with the exact pending tip, `kind: "running"` and the pending adapter IDs. Taken:93–113 adds the earlier success and observes the correct Branch or Provisional row, its earlier SHA, ancestor, later running wording, and Landed not yet. |
| Choose the newest retry by time and prefer completed success or failure over newer incomplete of the same check and context | protected | Gaps:33–62 gives a 09:00 failure and 09:20 success at the same SHA in newest-first order and asserts both Branch and Landed show the 09:20 attempt and passed. `tests/support/dashboard-ci-adapter-revision-lookup.test.mjs:31–77` runs real discovery into `listRunsAt`, then checks the chosen attempt ID. Newer successes in a different check or context cannot replace the latest incomplete. The expected same-group fallback is success when available, failure when that is the only completion, and the incomplete attempt when neither is available. |
| A build identifies revision, subject, exact or ancestor selection, optional link, text run and attempt IDs and outcome | protected | Done:128–200 asserts the rendered identity and exact link href and reads the full JSON build identity. It exercises opaque separator characters and numeric provider IDs converted to text. Taken:72–80 covers the running state. The shared Actions failed-landing journey checks failed rendering and the adapter selection module proves a failed completed attempt can be selected. There is no dedicated adapter browser fixture for a selected failure or for identity without a URL. |
| Report measured wall time from both attempt bounds and give no figure or difference for unrecorded time | protected | Done:128–194 asserts literal wall cells `2 min`, `3 min 20 s`, and `4 min` or `3 min 20 s`, and both JSON timestamps. Taken:101–110 asserts `6 min 30 s` and a separate exact `Not recorded` cell. Gaps:60–62 checks `Not recorded` on each surviving build whose adapter supplied only ordering time. The time cell is formatted by `storyCiComparisonWording.ts:39–44`. A one-sided timestamp is not independently exercised by these fixtures. |
| Completed endpoints read proof with run ID, attempt ID, full revision and listing branch | protected | Done:212–245 starts with separate valid Baseline and Branch replies and Landed unavailable. The three logged proof requests must match the exact four identity fields and listing branches, with exact count. The Branch provider validation branch deliberately differs from its listing branch. The route is `useIntentCiComparisonEntries.ts:36–73,108–144` to `intentCiProofRead.ts:115–135`, then `ciAdapterProof.ts:97–140` and the command protocol in `ci-command-adapter.mjs:174–203`. |
| Adapter proof counts and `durationMs` flow into the existing comparison table | protected | Done:114–120,212–221 gives matching summaries with 5 and 8 passing tests and 3,000 and 5,000 ms. It observes `5 → 8 +3 tests`, `3 s`, and `5 s +2 s`. `tests/support/dashboard-ci-comparison-entries.test.mjs:33–77,132–145` checks shared three-endpoint count/time rendering and the absence of invented zeros or baseline deltas when duration is missing. The adapter journeys never supply a valid Landed summary or a valid Taken Provisional summary, so those successful end-to-end cells have only shared-layer protection. |
| Missing, invalid or ambiguous proof preserves build identity and gives the reason. Ambiguous identities do not trigger a proof read | protected | Done merge independently asserts the Landed identity and wall time and the adapter's missing-summary message in its proof cell. Done fast-forward supplies an older response with the same textual attempt ID at the same full revision, and an invalid-schema Baseline. It checks the invalid reason, both Branch and Landed ambiguity reasons, surviving build identities and exactly one proof request for Baseline. The CI status reason spec independently exercises repository, attempt and revision mismatch validation via the shared reader. |
| Uncovered or expired revision keeps its named endpoint gap and the other builds | protected | Gaps:20–62 puts the sole old Baseline build outside the maintained 30-commit bound, and the UI shows the exact Baseline gap with both recent results and no fabricated time. Shared Actions fixtures at `intent-ci-comparison-gaps.spec.ts:165–229` check missing Branch/Landed and the lack of fallback to a built second parent. The adapter fixtures do not independently exercise a missing exact landing with a retained build on an otherwise tempting landing ancestor. |
| Failed or timed-out discovery preserves the reason at the endpoints | protected | Gaps:101–127 publishes a Done story and starts a real adapter subprocess that exits 2 with stderr, or delays 25 s past the production 20 s deadline. It observes three endpoint reason cells and no proof request. `dashboard-ci-adapter-revision-lookup.test.mjs:80–103` supplies an earlier comparison deadline and observes `state: "unread"` plus the distinct deadline message from the production resolver. |
| Preserve GitHub Actions comparisons and CI status behavior | protected | Six existing comparison files exercise Actions merge and fast-forward endpoints, Trunk and Taken/refresh paths, failed/cancelled/running and missing results, timing and proof entries. Existing adapter CI status browser cases exercise judgment, opaque and ambiguous proof identities, retries and refresh, proof reason wording, slow proof, and unrecorded wall time. The six `dashboard-story-branch-ci-adapter.test.mjs` tests cover both listing branches, nearer failed or running results, one trunk discovery, concurrent discoveries, prompt failure, and separate adapter identity. Done:247–249 asserts zero Actions API calls and Taken:82 checks zero GitHub calls on the isolated adapter comparison read. |
| Remember a settled Done comparison so a later expired attempt keeps its prior build and displays the proof reason | gap | `intentCiComparisonRead.ts:42–64` uses the existing Done cache and `intentCiComparisonAnswers.ts:24–40` admits settled Done answers. `ciAdapterProof.ts:106–139` re-asks unavailable proof but remembers a valid summary. The merge fixture's proof is missing on the initial read. No maintained adapter journey found removes discovery retention between reads of the same settled Done answer and observes the old build beside the newly unavailable proof. |
| A non-default configured target branch is used in discovery | gap | `baseCiAdapterAttempts.ts:67–76` takes `source.ref` and the optional distinct story branch. The adapter browser journeys and focused revision-lookup module fixture all use `main` as target. A comparison hardwired to discover `main` would satisfy these observations. |

Docs `docs/dashboard-development-intent.md:122–128`, `dashboard/GITHUB-REQUESTS.md:65–70`, `src/skills/dough-execute-plan/manuals/custom-ci.md:82–85` and `custom-ci-proof.md:62–71` describe the behavior exercised above. They were read for consistency. Documentation-specific lint and release checks were outside this focused selection.

The original live Pygardon acceptance example is **unknown** for this reassessment. The historical plan records a live observation, and the maintained fixture models its endpoint shapes. Current hosted retention, summaries, wall time, and service configuration were not assessed. A new history operation, runner-wait estimation, ancestor proof for skipped builds, the separate comparison-cue story and Pygardon's timestamp rollout are deferred promises outside this story.

#### Focused runs

Node `v24.21.0` matches `.node-version`. Every run observed AC power in `pmset -g batt` and used the repository's macOS `caffeinate -s -i` guard. Dependency installation and the locked Chromium download used isolated paths in this scratch checkout. No full suite or hosted service run.

```sh
pmset -g batt && python3 .git/assessment-bound.py 60 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i env npm_config_cache="$PWD/.git/assessment-npm-cache" node scripts/setup-native.mjs npm
pmset -g batt && python3 .git/assessment-bound.py 60 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i env PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-playwright" node scripts/setup-native.mjs browser
```

Both setup stages exited 0. The bounded elapsed times were 2.524 s for npm (179 packages) and 26.836 s for browser setup (locked Chromium v1243).

```sh
pmset -g batt && python3 .git/assessment-bound.py 90 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES="$PWD/.git/assessment-module-times" OPEN_DOUGH_TEST_OUTCOMES="$PWD/.git/assessment-module-outcomes" bash scripts/test.sh tests/support/dashboard-ci-adapter-proof.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/dashboard-story-branch-ci-adapter.test.mjs tests/support/dashboard-ci-comparison-parse.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs
```

Six selected module jobs passed with terminal exit 0 and 2.905 s bounded elapsed. The runner's job times were 0.5 s (proof), 0.4 s (adapter revision lookup), 0.1 s (nearest), 1.5 s (branch judgment), 0.1 s (query parsing) and 0.1 s (entry comparisons). Proof module cases use sleeping or invalid-JSON commands and exact unavailable reasons, and a command returning per-identity valid summaries to detect cache-key collisions. Comparison parsing checks the exact parsed story identity and rejects malformed queries. The other module fixtures and assertions appear in the verdict table.

```sh
pmset -g batt && python3 .git/assessment-bound.py 330 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i env PATH="/opt/homebrew/bin:$PATH" PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-playwright" ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --workers=1 --reporter=list 'intent/intent-ci-comparison[^/]*\.spec\.ts$' 'intent/intent-ci-proof-adapter[^/]*\.spec\.ts$' 'intent/intent-ci-status-wall-time\.spec\.ts$' 'intent/intent-summary-story-comparison[^/]*\.spec\.ts$'
```

Playwright selected 46 Chromium cases with one worker. All 46 passed, terminal exit 0, runner duration 3.4 min and bounded elapsed 201.929 s. The selection comprised 8 adapter comparison cases, 20 Actions comparison cases, 6 adapter CI status proof cases, 3 CI status wall-time cases and 9 Summary compatibility cases. The adapter cases ran for 3.0–4.3 s each except the real discovery timeout case at 23.6 s. The Summary fixtures navigate actual selected stories through the shared comparison view and assert its file, folder and entry timing rows, explanatory gaps, or replacement when selection changes.

#### Selective break check

Temporarily replaced exactly one production property in `dashboard/server/baseCiAdapterAttempts.ts:87`. The normalized listing retained `branch: (run as DiscoveredAttempt & { headBranch: string }).headBranch` in place of `branch: listedBranch`. That substitutes the adapter's validated branch for the branch whose discovery returned the attempt. A preliminary edit guard found two matching property lines and stopped before applying any change or starting a test. The contextual edit uniquely selected the intended property.

```sh
pmset -g batt
python3 .git/assessment-bound.py 65 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i env PATH="/opt/homebrew/bin:$PATH" PLAYWRIGHT_BROWSERS_PATH="$PWD/.git/assessment-playwright" ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --workers=1 --reporter=list 'intent/intent-ci-comparison-adapter\.spec\.ts$' --grep 'after a merge landing'
```

The single existing merge journey ran with one worker and failed at its JSON match in `intent-ci-comparison-adapter.spec.ts:185`, exit 1, runner case duration 3.7 s, bounded elapsed 7.372 s. The assertion had already observed the Branch build's subject, SHA, link and wall time. The received JSON identified the exact passing ancestor as run `402`, attempt `2`, while its `runBranch` was `ci/another-branch` instead of `claude/another-agent`. This is the deliberate fault on the fixture's mismatched-branch path, so the break-check credit applies to listing-branch identity. The unmodified journey passed in the main run (4.3 s). The EXIT handler restored the file immediately and the Git diff was empty. The intentionally failing run did not exercise the downstream proof-request log assertion.

#### Effort and disposition

The UTC-clock interval from initial seed and plan read to report completion was about 5.5 minutes of elapsed assessor time, including dependency acquisition, test waits, source tracing and writing. The bounded commands above provide measured individual run times. Separate active analyst time, original authoring or test maintenance effort, and any hosted exercise time are unavailable. Baseline focused runs were green under this repository's historical `AGENTS.md#failing-and-flaky-tests` policy. The deliberate break was the only test failure.
