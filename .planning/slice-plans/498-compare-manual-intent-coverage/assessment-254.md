# Blinded assessment of SEED-254

## Case provenance

- Historical story and original plan at the detached checkpoint.
  [SEED-254#use-later-ci-proof-for-cancelled-landings](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-later-ci-proof-for-cancelled-landings) ·
  [Original plan](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md)
- Base `93fe559deda21cb9004608e5026a6a9b9247ac82`, checkpoint `1359d6fb76b8ff2b4295e2b4febe0e467ec72be1`. The assessor was
  given these two revisions and the selected historical source paths.
- Scratch checkout `/tmp/dough-assessment-p647xmaa`, report
  `/tmp/dough-assessment-p647xmaa/.git/assessment-report.md`. The assessor was
  launched with `fork_turns: "none"` and received the common
  [assessment method](assessment-brief.md#method-supplied-to-every-assessor)
  and the case inputs listed here. The historical failure policy matched the
  current policy verbatim.
- The coordinator ran `git diff-tree --no-commit-id --name-only -r 85946790e`, `git diff-tree --no-commit-id --name-only -r 1359d6fb7`
  with exit 0 for each. These were the Plan 498 attribution inputs. The union
  of product, test and documentation paths supplied to the assessor follows.
  The original plan and seed were supplied separately.

```text
dashboard/GITHUB-REQUESTS.md
dashboard/server/baseCiAdapterRevisionLookup.ts
dashboard/server/baseCiRevisionAttempt.ts
dashboard/server/baseCiRevisionLookup.ts
dashboard/server/baseCiRevisionLookupSource.ts
dashboard/server/baseCiRevisionNearest.ts
dashboard/server/exactSkippedEquivalent.ts
dashboard/server/intentCiComparisonAnswers.ts
dashboard/server/intentCiComparisonResolve.ts
dashboard/server/intentCiComparisonSlots.ts
dashboard/server/laterTrunkBuild.ts
dashboard/server/revisionBuildSlot.ts
dashboard/src/IntentCiComparison.tsx
dashboard/src/ciProofAbsenceWording.ts
dashboard/src/storyCiComparison.ts
dashboard/src/storyCiComparisonCountsWords.ts
dashboard/src/storyCiComparisonWording.ts
dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts
dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts
dashboard/tests/intent/intent-ci-comparison-landing-gaps.spec.ts
dashboard/tests/support/storyCiComparisonCancelledLanding.ts
dashboard/tests/support/storyCiComparisonEarlierLanding.ts
dashboard/tests/support/storyCiComparisonFastForward.ts
dashboard/tests/support/storyCiComparisonLandedOutcome.ts
docs/dashboard-development-intent.md
tests/support/dashboard-ci-adapter-revision-lookup.test.mjs
tests/support/dashboard-ci-revision-nearest.test.mjs
tests/support/dashboard-later-trunk-build.test.mjs
tests/support/dashboard-later-trunk-fixture.mjs
tests/support/dashboard-later-trunk-landed.test.mjs
tests/support/intent-scope-comparison-wording.test.mjs
```

## Store and restoration checks

The coordinator checked this new store before dispatch. The setup process
cleared `GIT_ALTERNATE_OBJECT_DIRECTORIES` from the environment of every Git
command. The execution-complete object `068d13a02892fb5aede5b6f3b427d3414a3492bc` was checked by the
coordinator only. The Git command outcomes were

```text
git init --quiet --template= -> exit 0
git fetch --no-tags --no-write-fetch-head --depth=1 file:///Users/terryyin/git/open-dough 93fe559deda21cb9004608e5026a6a9b9247ac82:refs/heads/case-base 1359d6fb76b8ff2b4295e2b4febe0e467ec72be1:refs/heads/case-checkpoint -> exit 0
From file:///Users/terryyin/git/open-dough
 * [new ref]         93fe559deda21cb9004608e5026a6a9b9247ac82 -> case-base
 * [new ref]         1359d6fb76b8ff2b4295e2b4febe0e467ec72be1 -> case-checkpoint
git -c advice.detachedHead=false checkout --quiet --detach 1359d6fb76b8ff2b4295e2b4febe0e467ec72be1 -> exit 0
git cat-file -t 93fe559deda21cb9004608e5026a6a9b9247ac82 -> exit 0
commit
git cat-file -t 1359d6fb76b8ff2b4295e2b4febe0e467ec72be1 -> exit 0
commit
git cat-file -t 1359d6fb76b8ff2b4295e2b4febe0e467ec72be1:.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md -> exit 0
blob
git cat-file -t 1359d6fb76b8ff2b4295e2b4febe0e467ec72be1:.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md -> exit 0
blob
git cat-file -t 068d13a02892fb5aede5b6f3b427d3414a3492bc -> exit 128
fatal: git cat-file: could not get object info
git rev-parse --is-shallow-repository -> exit 0
true
git rev-list --count --all -> exit 0
2
git rev-parse HEAD -> exit 0
1359d6fb76b8ff2b4295e2b4febe0e467ec72be1
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
1359d6fb76b8ff2b4295e2b4febe0e467ec72be1
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
| End-to-end wall clock | **Measured**, 422.023 s from 2026-11-07T13:12:01.605Z through the returned report at 2026-11-07T13:19:03.628Z. Includes attribution, Git setup, dispatch, tests and report writing. The absolute 600 s cutoff was 2026-11-07T13:22:01.605Z. |
| Attribution and Git setup | **Measured**, 1.854 s from the case start through successful checks and scratch limiter setup at 2026-11-07T13:12:03.459Z. Part of the end-to-end clock. |
| Launch to returned report | **Measured**, 376.800 s from the fresh assessor's task start at 2026-11-07T13:12:46.828Z to report receipt. Includes test, report and delivery time. |
| Assessor elapsed span | **Measured**, 379.959 s from task start to task completion at 2026-11-07T13:19:06.787Z. Includes tests and waits. |
| Test runtime | **Measured**, Playwright reported 42.5 s and 37.3 s for two unmodified selections, 10.8 s for the deliberate failing test, and 10.3 s for the restored pass. The five-file shell runner was silent. Its runner duration is **unavailable** (s), with wrapper wall time recorded separately below. |
| Assessor tokens | **Measured**, 2,387,005 input tokens, including 2,278,400 cached input tokens, and 13,523 output tokens. Last case-specific Codex `total_token_usage`, row 198 of the assessor record below. |
| Active assessor effort and coordinator effort | **Unavailable** (s). The clocks do not separate active work, waits and overlapping work. |
| Human effort | **Unavailable** (s). Reading and verification are separate activities for the comparison. |

The case-only Codex record `rollout-2026-11-07T21-12-46-01a1b623-dfb2-7811-a887-064c84d536f3.jsonl` supplies task start at row 2 and task completion at row 199. The scratch report's last modification was 2026-11-07T13:18:57.887Z. The returned-report boundary is the coordinator's report-ready notification at row 247 in `rollout-2026-11-07T21-09-51-01a1b621-33aa-73e1-80f5-d7d92270197d.jsonl`.
The coordinator observed AC, 16 CPUs at load 1.40/2.10/2.39, 69% free memory, and 116 GiB free on the scratch volume before starting the pair. Existing browser and Node jobs remained in place. At most two assessors ran concurrently.

Historical proof at the checkpoint. [Forward walk and stop assertions](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/tests/support/dashboard-later-trunk-build.test.mjs#L35-L120) · [Cancelled landing reread setup and assertion](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts#L85-L115) · [Comparison cache predicate](https://github.com/terryyin/open-dough/blob/1359d6fb76b8ff2b4295e2b4febe0e467ec72be1/dashboard/server/intentCiComparisonAnswers.ts#L24-L42)

## Assessor report

### Historical test protection assessment

`SEED-254#use-later-ci-proof-for-cancelled-landings` at checkpoint `1359d6fb76b8ff2b4295e2b4febe0e467ec72be1`, attributed base `93fe559deda21cb9004608e5026a6a9b9247ac82`. I used the selected section of `.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md` and original plan 496 for the promises, and the full checkpoint for production and maintained tests. Local proof used locked Node 24.21.0, Playwright 1.63.0 and Chromium. The Playwright fixtures use real synthetic Git histories and a fake GitHub service. Test citations below are to files at the checkpoint.

#### Verdicts

| Promise | Verdict and evidence |
| --- | --- |
| A cancelled Story Branch landing merge uses the nearest qualifying later trunk build, and a fast-forward uses the same rule at the story tip. Landed preserves the requested Cancelled identity and displays source revision, run, attempt, result, included revision count and figures. | **protected** for source selection and the displayed identity and wall time. `dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts:31` creates an owning merge before separate completion, serves cancelled run 303 and matching later summary for run 304, and checks Cancelled at the merge, the later SHA, `run 304 #1`, passed, one included revision, 4 min, and later listings `[1,0,0]`. At `:75` two cancelled successors lead to +3 with run 399 and 5 min. At `:160` a story-first merge fast-forwarded to trunk, cancelled tip 402, and proofed successor 403 produce Cancelled at the tip, successor SHA, `#1`, +1, and 7 min. Those journeys exclude the tempting trunk-side run. A later attempt other than `#1` and rendered later-summary entry/count values are **gaps**. The journey asserts build wall time and selected artifact listing, while `dashboard/src/useIntentCiComparisonEntries.ts` makes the later proof read that supplies entries. |
| First-parent containment, nearest-first order, and passing cancelled, unbuilt and proofless revisions. | **protected**. The module fixture `tests/support/dashboard-later-trunk-fixture.mjs:30` uses a real Git merge with a side commit, so `dashboard-later-trunk-build.test.mjs:21` distinguishes first-parent order and excludes the side branch. At `:35`, +1 is cancelled, +2 unbuilt, +3 timed with `none`, +4 usable. The test checks run 14 at +4, exact listed order, checked runs `[13,14]`, and no side listing. The browser chain independently observes `[1,1,1]`, and only run 399 gets an artifact listing. |
| Expired, unreadable, invalid and mismatched summaries are unusable and the forward walk continues. | **gap** in forward-path proof for the full reason matrix. The walk test injects `expired` before a running build and checks advancement, and supplies `unreadable` as a farther reason in the nearest-gap example (`dashboard-later-trunk-build.test.mjs:89`). The shared real artifact reader is separately exercised by `dashboard/tests/intent/intent-ci-proof-reasons.spec.ts:35` with expired listing, HTTP 403, invalid summary, wrong attempt and wrong revision. It observes the reason, no proof rows and unchanged judgment, but does not select a cancelled landing. There is no maintained cancelled-Landed journey here that distinguishes all those inputs from a usable proof or checks their Landed-specific wording. |
| A failed later build with usable proof can win. | **protected**. `dashboard-later-trunk-build.test.mjs:67` offers failed run 21 at +1 and checks failed, `later`, count 1 and a single listing. The browser fixture at `intent-ci-comparison-cancelled-landing.spec.ts:129` serves failed 304 with a matching summary and asserts the later SHA, failed label, 6 min and Cancelled at the original merge. |
| A usable exact landing build, including a rerun, takes precedence. | **protected** for choosing a timed exact build over later runs. `tests/support/dashboard-later-trunk-landed.test.mjs:112` puts a successful attempt 2 on the landing and a later successful run; it checks the exact run ID and no later listing. `dashboard-ci-revision-nearest.test.mjs:15` checks an older same-run timed attempt wins over a cancelled latest attempt. **gap** for proof-sensitive precedence when that earlier exact attempt has no usable artifact. The rerun fixture provides no proof artifact and never tests the cancelled-latest combination. Production `baseCiRevisionNearest.ts:119–151` recovers a timed prior attempt, and `baseCiRevisionLookup.ts:152–185` disables the proof gate for exact lookup and returns any such build before considering the cancelled latest. That combination can therefore retain the exact timed attempt even when it has no usable proof. |
| Stop at a running build, the read trunk head, and the bound. A capped answer is final. | **protected** for stop behavior and distinction between head and bound. `dashboard-later-trunk-build.test.mjs:89` puts a usable candidate beyond a running candidate and asserts only the earlier and running revisions were listed. It also checks empty head, artificial bound 2 and head reached exactly at a bound of 4. `dashboard-later-trunk-landed.test.mjs:90` builds one extra revision beyond the default bound, with proofless runs, and checks the nearest-gap text and immutable answer. **gap** for the literal 30 and cutoff at that exact position. The long fixture is built from `baselineAncestorLimit + 1`, so changing the constant would also change its starting history. The assertions do not independently distinguish a proofed candidate at +30 from one at +31. The production constant is 30 (`dashboard/server/exactSkippedEquivalent.ts:22`). |
| No later usable proof leaves a Cancelled explanation, identifies why and omits Landed figures. | **protected** for missing, running and head outcomes. In `dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts:32` only +3 has a timed run and its artifact is absent. The test checks run 399's SHA/attempt and absence wording, no 5 min, all three listings, and the helper at `dashboard/tests/support/storyCiComparisonCancelledLanding.ts:79` checks the Landed wall dash, active Baseline versus Branch and the matching unused reason. At `:55` next run 403 is in progress; at `:85` no successor exists. The same helper checks the running and head explanations. The module fixture offers two proofless builds and asserts the nearer one and its `none` reason (`dashboard-later-trunk-build.test.mjs:122`). **gap** for the specific no-finished-build wording when all revisions inside the bound are cancelled or unbuilt, and the Landed wording for other artifact errors noted above. |
| A waiting answer is read again. | **protected and break-checked** for the head gap. The browser fixture at `intent-ci-comparison-cancelled-landing-gaps.spec.ts:85` opens the story while the cancelled fast-forward tip is head, pushes a new trunk commit, serves passing 403 and matching proof, then opens the same story again and observes run 403, +1 and 7 min. `dashboard-later-trunk-landed.test.mjs:54` and `:70` check non-immutability at head and at a running build; `:90` checks immutability at the cap. Running-to-completed and proofless-at-head-to-new-proof browser transitions were unassessed. |
| Timed-out landings stay exact. Trunk Mode Landed, Baseline and Branch keep their ancestor rules. | **protected** for the tested distinctions. `dashboard-later-trunk-landed.test.mjs:136` puts a success after a timed-out landing and asserts the timeout explanation and no later listing. `intent-ci-comparison-gaps.spec.ts:36` puts a Trunk Mode build at implementation and none at completion and asserts Branch N/A and Landed ancestor SHA. `intent-ci-comparison-skipped.spec.ts:87` offers a proofless Baseline parent before a proofed grandparent and asserts grandparent 100, count 2 and 3 min. `intent-ci-comparison.spec.ts:177` checks the Branch story-side ancestor 302 and exact merge Landed 303 despite builds at completion, the trunk-side parent and later trunk. The failed exact landing regression at `intent-ci-comparison-landing-gaps.spec.ts:16` keeps the failed merge and excludes later and trunk-side runs. |
| The forward feature applies to GitHub Actions, and confirmed skips retain equivalent-build behavior. | **protected** for the skip boundary by `intent-ci-comparison-skipped.spec.ts:144,169,191`: planning-only landing takes run 201 and equivalent proof, or stops at that equivalent if proof is missing, while a code landing with no run says No build and shows a wall dash. **gap** for the precise adapter exclusion guard. `baseCiRevisionLookup.ts:181–183` excludes adapter attempts from the cancelled/timed-out branch. The passing adapter module cases exercise actual command discovery, ordering, same-check/context retry and timeout, but never send a cancelled adapter attempt through that guard to observe the absence of a forward walk. |
| Document the forward request pattern. | **protected** for one listing per walked later SHA and skipping artifact listings for cancelled later builds, observed at `intent-ci-comparison-cancelled-landing.spec.ts:67,120`. `dashboard/GITHUB-REQUESTS.md:67–89` and `docs/dashboard-development-intent.md:124–139` document the new selection and stop behavior. **gap** in direct forward coverage for archive request counts after downstream proof consumption. The tests filter the artifact listing records and do not wait for rendered later-proof entry data before checking calls. Also, the request doc calls these push runs, while `dashboard/server/baseCiGithubRevisionLookup.ts:122–152` queries by SHA without an event/ref filter and `baseCiNearest.ts:130–148` chooses by SHA and time. The comparison fixtures label all SHA-listing runs as main pushes (`dashboard/tests/support/storyCiComparisonFixture.ts:156–161`, `baseCiActions.ts:41–54`), so a competing same-SHA run from a manual dispatch or another ref is untested. |

#### Production route

Selecting Story A in Recently done and opening Intent's CI status uses the real comparison request (`dashboard/tests/support/selectDoneStoryForCiComparison.ts:10`, `dashboard/src/authenticatedIntentCiComparisonRead.ts:14`, `dashboard/server/performedRead.ts:153`). `intentCiComparisonRead.ts:37–64` reads or retains the answer per repository and story identity. `storyPublishedEndpoints.ts:84–110` fetches and verifies the configured trunk ref, then `intentCiComparisonResolve.ts:70–141` sends only Story Branch Landed to the exact lookup with `origin/<ref>`. `baseCiRevisionLookup.ts:146–218` selects exact outcomes, reaches the forward path for a cancelled GitHub result, and uses `walkingProofAbsence` at `:48–68` for shared artifact usability. `laterTrunkBuild.ts:28–104,137–171` walks the Git chain, selects proof and builds the gap or result slot. `intentCiComparisonSlots.ts:35–63` carries the slot into the answer. `IntentCiComparisonEndpoints.tsx:34–109` and `storyCiComparisonWording.ts:39–84` render the separate status and later build identity. `intentCiComparisonAnswers.ts:24–42` declines to retain an answer with an `awaitingLaterBuild` gap.

#### Focused runs

Observed AC power for setup and tests and used `caffeinate -s -i`. Locked setup `python3 .git/assessment-bound.py 90 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm ci` exited 0 in 2.191 s bounded wall time. `python3 .git/assessment-bound.py 90 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i node scripts/setup-native.mjs browser` exited 0 in 0.253 s, reporting browser acquisition complete without a download line.

```sh
python3 .git/assessment-bound.py 120 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_TEST_JOBS=1 PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash scripts/test.sh tests/support/dashboard-later-trunk-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs tests/support/intent-scope-comparison-wording.test.mjs
```

Exit 0, silent maintained runner, 3.187 s bounded wall time. Five selected files contain 15 test cases (4 forward walk, 2 exact/gap selection, 3 revision selection, 3 adapter lookup, 3 wording). The wording tests assert before/after count and duration text, nonzero-baseline percentage and partial totals, with no later-build proof claim. The initial invocation below exited 1 before any test, in 0.019 s. The runner's child Bash resolved to `/bin/bash` 3.2. I put Homebrew Bash first on `PATH` as the runner diagnostic and historical plan specify.

```sh
python3 .git/assessment-bound.py 120 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i /opt/homebrew/bin/bash scripts/test.sh tests/support/dashboard-later-trunk-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/dashboard-ci-adapter-revision-lookup.test.mjs tests/support/intent-scope-comparison-wording.test.mjs
```

```sh
python3 .git/assessment-bound.py 220 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard -- --workers=1 --reporter=list 'intent-ci-comparison-cancelled-landing(\-gaps)?\.spec\.ts'
```

Seven selected, seven passed, exit 0, runner 42.5 s and bounded wall time 43.242 s. The four source-selection and three gap journeys and their assertions are recorded above. The list reporter exposes names and durations.

```sh
python3 .git/assessment-bound.py 160 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard -- --workers=1 --reporter=list 'intent-ci-comparison(-gaps|-landing-gaps|-skipped)?\.spec\.ts' 'intent-ci-proof-reasons\.spec\.ts' --grep 'Trunk Mode done story marks Branch|failed landing merge build is labelled|code landed before completion uses the merge branch-side ancestor|Baseline walks past a proofless parent|Landed names No build for a code landing|Landed names Skipped|each proof that cannot be shown'
```

Eight selected, eight passed, exit 0, runner 37.3 s and bounded wall time 37.653 s. These are the Trunk Mode, failed exact, earlier merge exact/Branch ancestor, Baseline proofless parent, confirmed skip with and without equivalent proof, unexplained no-run code landing and shared artifact reason journeys cited above.

```sh
python3 .git/assessment-bound.py 70 env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:dashboard -- --workers=1 --reporter=list 'intent-ci-comparison-cancelled-landing-gaps\.spec\.ts' --grep 'at the read trunk head waits'
```

The single deliberate break replaced the `isImmutableCiComparisonAnswer` slot predicate `slot.kind !== "running" && !(slot.kind === "none" && slot.awaitingLaterBuild === true)` with `slot.kind !== "running"` in `dashboard/server/intentCiComparisonAnswers.ts:38–42`. One test selected, exit 1 as expected. It reached the assertion after the initial waiting view, push, fixture check that the new SHA was the only successor, serving run 403 and its proof, and a second comparison request. The retained test trace shows two HTTP 200 comparison requests. At line 112 the actual second Landed cell still said `The CI build at the landed story revision was cancelled. No later trunk build has finished yet.` instead of `Cancelled at <tip>.` The selected failing test printed 10.8 s and the bounded command 14.317 s. I restored the one file immediately, verified it matched its backup and had an empty Git diff, then ran the identical command. One test passed, exit 0, runner 10.3 s and bounded wall time 10.668 s. The original checkpoint had no focused test assertion failures.

Bounded commands total 111.530 s of summed process wall time, including setup, the shell prerequisite retry and the deliberate break/restored run. Some execution overlapped with source reading and with another focused command. The observed interval from the first captured UTC timestamp to the completed report draft was 5 min 38 s (13:13:00–13:18:38 UTC), including test execution and writing. Active reading and analysis time was not separately instrumented. Hosted examples and live request behavior, the full comparison family, and the two deferred features (substituting for unexplained no-run landings and identifying ignored later revisions) were unassessed. The code-landing regression checks the current No build boundary only.
