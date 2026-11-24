# Read published reviews from the Review repository

**Source:** [Read published reviews from the Review repository](../../seeds/SEED-428-read-reviews-from-the-review-repository.md#read-reviews-from-the-review-repository)

**Identity:** SEED-428#read-reviews-from-the-review-repository

## Goal and scope

A developer reviewing published work in Intent's **Review changes** gets the same
published comparison from a dashboard-managed Review repository. The execution
checkout can be missing, moved, or on another branch, and origin can be
unreachable for a comparison synced earlier. File switching reads local Git only.

Included: Done story completions, Taken story branch and trunk comparisons,
accepted landing pairs, and recorded published session ranges, with their file
lists, diffs, file text, and source, Proof, notes, and follow-up context. Concurrent
opens share one fetch. File admission uses fixed endpoints. A sync notice appears
when a sync fails. Replaced checkout review access is retired.

Excluded (seed scope limits): CI comparisons, Board and Side panel reads, Intent
location trees, the repository inventory shown when **Changes only** is off, and a
shared refresh coordinator all stay with
[SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git).
Review repository clean-up on project removal is also excluded, as is any expiry of
a synced comparison.

Assumption: only fetches from the configured project's authorized origin write
to the Review repository.

## Direction

- [North Star: Read published comparisons from the Review repository](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository).
  Slices 2–5 implement it as written. Wrap-up removes the topic.
- [North Star: Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  names this story's repository and fetch as its base. Slice 2's module owns the
  fetch and the sync record that SEED-430 grows into the coordinator. No
  coordinator, observer, or cross-reader status is built here.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  defines the Review repository. Its durable-state section says a published
  reader must not need a developer's clone, and that fetching or caching remote
  Git data is compatible. No conflict.
- PFE: reuse `GitTargetFetches` in `dashboard/server/gitTargetFetch.ts` for
  shared fetches, keyed by the Review repository. Reuse the existing comparison
  builders (`storyCompletionEndpoints`, `publishedStoryComparison`,
  `retainedCommitPairFiles`, `publishedSessionReview`). They change only the
  repository they read. Change existing helpers instead of copying them. Helpers
  shared with CI (`publishedStoryEndpoints`, `takenStoryClaim`,
  `publishedTakenBranchTip`) take the repository as a parameter, and CI passes
  its execution checkout until SEED-430.

## Current decisions

- One bare Review repository per configured project, under the machine dashboard
  home through `machineDashboardPath`. One module owns its creation, origin URL
  `https://github.com/<repository>.git`, fetch, and sync record. The sync record
  holds the last successful sync time and the last failure. Readers receive its
  path as a typed input. They never call `executionCheckout(source)` or check a
  Git root.
- Fetch transport: `GIT_TERMINAL_PROMPT=0` with the credential helper set to
  `!gh auth git-credential`, as observed in the premise table. The repository
  has no object alternates.
- Fetch into `refs/remotes/origin/*`. Fetch Taken story branches by their exact
  ref. Live endpoints resolve from those refs after the attempted sync. File
  reads never fetch: they validate the named endpoints against the last synced
  refs and the comparison's file list.
- Fixtures substitute origin through `url.<local origin>.insteadOf` in the
  fixture HOME's `.gitconfig` (slice 1).
- Trunk Mode or Story Branch Mode is the developer's choice at Take. No slice
  acts from trunk.

## Decisive premises and preparation observations

Observed on 2026-11-24 at `39b11aeaa17f54de649b9dbc4e1d5e7caad2ca5f` in the owned
preparation workspace. Node 24.21.0, Git 2.50.1 (Apple Git-155), load average
about 22.

| Consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| A bare repository fetches the configured `https://github.com/<repository>.git` from a fixture origin through the fixture HOME | In job scratch: fixture `origin.git` with one commit; `home/.gitconfig` held `url.<origin>.insteadOf=https://github.com/terryyin/open-dough.git`; `HOME=<home> GIT_CONFIG_NOSYSTEM=1 GIT_TERMINAL_PROMPT=0 git -C review.git -c credential.helper= -c 'credential.helper=!gh auth git-credential' fetch --quiet --no-tags https://github.com/terryyin/open-dough.git '+refs/heads/main:refs/remotes/origin/main'` fetched the origin commit `075e9187…`, and no credential prompt appeared. The dashboard calls the same `git` binary through `execFile`. `runGit` inherits `process.env`, and the backend specs stub `HOME` with `vi.stubEnv`, so config resolution is identical. The E2E fixtures already own a per-test HOME (`startOrigin`, `publishedMainFixture`). | None |
| The real GitHub origin fetches into a fresh bare repository through `gh auth git-credential` | Retained: [plan 802 preparation, 2026-11-24 at 785e2da6](https://github.com/terryyin/open-dough/blob/78dea441a/.planning/slice-plans/802-review-published-changes/PLAN.md#decisive-premises-and-preparation-observations) fetched `main` of this project into a fresh bare repository with that helper and read a diff there. The transport is unchanged since. | None |
| Existing review readers resolve in the execution checkout, fetch into it, and turn a failed fetch into an unavailable review | Read at this revision: `storyPublishedEndpoints.ts:27-76`, `storyReviewPublishedTaken.ts:37-47`, `storyReviewPublishedLanding.ts:30-35`, `publishedSessionReview.ts:44-118`, and `storyReviewHistoricalFileAdmission.ts:140-209`. Each Taken file admission calls `publishedTakenReview`, which runs `takenStoryClaim` → `fetchGitTarget` and `publishedTakenBranchTip` → `ls-remote` and fetch (`storyReviewAdmission.ts:51`). | Each slice's proof makes origin unreachable or renames the checkout. A test against today's readers would fail, so the new proofs discriminate by construction. |
| The proof routes run in this workspace | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- dashboard/backend-tests/review/story-review-published-taken.spec.ts dashboard/backend-tests/review/story-review-published-landing.spec.ts dashboard/backend-tests/review/published-session-review.spec.ts dashboard/backend-tests/review/story-review-completed-file-admission.spec.ts dashboard/backend-tests/review/git-target-fetch.spec.ts` exited 0 with 12 Vitest cases passing. `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- e2e/review/story-review-completed.spec.ts e2e/sessions/recently-done-published-sessions.spec.ts e2e/review/story-review-trunk-own-changes.spec.ts --workers=2` exited 0. | None |

## Outside-in proof map

| Promise (seed example) | Owning slice | Observation |
| --- | --- | --- |
| Checkout gone: same Done endpoints, paths, diff, and Proof context; checkout refs untouched | 2 | E2E `story-review-completed.spec.ts` case with the execution checkout renamed before opening; backend completion and file-admission case asserting the checkout's `origin/main` did not advance |
| Concurrent opens share one fetch | 2 | Backend: two concurrent review opens for one project with a counting `git` wrapper on `PATH` record one `fetch` into the Review repository |
| Taken branch and trunk comparisons, with and without **Include merged changes** | 3 | Backend `story-review-published-taken.spec.ts` cases rerun with the checkout absent; E2E `story-review-trunk-own-changes.spec.ts` |
| File reads make no remote request; a path or head outside the comparison is refused without a fetch | 3 | Backend: after one open, origin is moved away. Three admitted file diffs read correctly. A path outside the list and a head beyond the last synced branch are refused, and the wrapper counts no `fetch` or `ls-remote`. |
| Accepted landing pairs and recorded session ranges after trunk advances and the worktree is retired | 4 | Backend `story-review-published-landing.spec.ts` and `published-session-review.spec.ts` with the checkout absent; E2E `recently-done-published-sessions.spec.ts` and `story-review-story-branch-landed.spec.ts` |
| Offline reopen with sync notice; cold offline unavailable; Refresh keeps comparison and selection on failure and advances after recovery | 5 | New E2E `e2e/review/story-review-offline.spec.ts` through `reviewChangesPage.ts`; backend sync-record cases |
| Replaced checkout review access retired | 2–4 | Each slice's consumer trace finds no review caller of `executionCheckout` or the Git-root explanation. CI callers stay. |

## Ordered slices

### 1. Route fixture origins through the fixture HOME's Git config
Type: Structure
Status: done
Proof: The review backend specs and E2E journeys named in the premise table stay green.

Change: `startOrigin`, `publishedMainFixture`, and the backend review reader
setups write `url.<fixture origin>.insteadOf=https://github.com/<repository>.git`
to their fixture HOME. One test-support step does this for each fixture, not one
inline per spec. Clones stop carrying their own `insteadOf`. Enables slice 2,
whose Review repository fetches the configured repository URL.

Accepted proof (uncommitted candidate on 773efc16c, load 11–19): the named
backend and E2E specs, plus `launches/start-origin-isolation`,
`launches/agent-launch-start`, `runtime/production-publication-fixture`,
`runtime/production-deployment`, `story-review-story-branch-landed` and
`sessions/agent-completion-execution`, and typecheck, all exited 0.

Learnings for later slices:
- `routeOriginThroughHome` (`dashboard/test-support/support/fixtureOriginRoute.ts`)
  is the one route writer. Backend review cases call `stubFixtureHome` and
  configure `fixtureRepository` (`dashboard/backend-tests/support/fixtureHome.ts`).
  The `startOrigin` clone includes the machine HOME's `.gitconfig`, because
  fixture git commands in it run under the real HOME.
- `published-session-review.spec.ts` has no fixture origin or HOME yet. Slice 4
  gives it `withOrigin()` and `stubFixtureHome`.
- `story-review-published-taken.spec.ts` timed out under load at 17–19, at base
  too. Its first case per history pays the repository template build, and each
  read re-fetches origin. The reader clone now disables auto-maintenance, and
  the literal-file case reuses the cached history. The literal-file case still
  runs 2.3–3.6s at load 14. That remaining cost is the product's per-read fetch,
  which slice 3 removes, so slice 3 re-measures it.

### 2. Open a Done story's review from the Review repository
Type: Behavior
Status: done
Proof: E2E `e2e/review/story-review-completed.spec.ts` with the checkout renamed; backend completion and file-admission cases; concurrent-open fetch count; `dashboard/backend-tests/intent/ci-comparison-taken.spec.ts` and the story CI comparison specs stay green.

Behavior: a Done story's completion is published and the configured execution
checkout is renamed → the developer opens **Review changes** → the same
completion endpoints, changed paths, literal diff, and Proof context appear.
The checkout's refs are unchanged. Two concurrent opens share one fetch.

Adds the Review repository module and moves Done completion resolution and its
historical file admission onto it. `publishedStoryEndpoints` takes its
repository, and CI keeps passing the checkout. Removes the review-only Git-root
check from this path.

Accepted proof (uncommitted candidate on a7448680, load 17–22): the new rename
and shared-fetch cases failed first at a7448680, then passed. Also passing:
typecheck, backend `story-review-completed*`, `intent/ci-comparison*`,
`intent-ci-comparison*` and `landed-ci*`, E2E `story-review-completed`, and the
Done-review E2E consumers `story-review-completed-merge-edits`,
`story-review-follow-up`, `story-review-story-branch-landed`,
`story-review-diff-add-note`, `recently-done-published-sessions`,
`intent-done-completion-provenance`, `intent-story-becomes-done` and
`recently-done-follow-up`.

Learnings for later slices:
- `dashboard/server/reviewRepository.ts` fetches trunk by exact refspec,
  without a wildcard or `--prune`. Its `refspec(ref)` takes slice 3's Taken
  branch refs. `GitTargetFetches` shares fetches by repository and ref. The
  sync record lives at `<repository>/open-dough-sync.json`.
- `checkoutStoryEndpoints` keeps the checkout path for CI and, until slice 4,
  for `storyReviewPublishedLanding.ts`. Landed-run file admission also still
  reads the checkout. Slice 4 moves both.
- `dashboard/test-support/support/reviewRepositoryFixture.ts` renames the
  checkout and plants history gaps in the Review repository. The
  shared-fetch spec counts fetches through a `git` wrapper on PATH. Slice 3's
  no-remote-request proof reuses that wrapper.
- The "checkout's tracked trunk is unchanged" promise has its own backend
  case, in which the checkout stays in place while origin advances. A
  checkout-fetch mutation broke only that case. A renamed checkout cannot
  observe it.
- CI repair (run 45377940516, attempt 1): six E2E journeys broke because
  they cut history only in the checkout, or configured a project with no
  routed origin. The configured project was the seeded Doughnut project,
  which fetched from real GitHub until the 60s read bound. History-cutting
  setups now use `shallowPublishedHistory` or `completePublishedHistory`.
  `dashboardServer` start routes every other GitHub URL to a missing local
  path through `routeUnroutedGitHubAway`. Later slices that move a reader
  search E2E for journeys expecting an unavailable historical review and for
  inline `--depth`/`--unshallow` cuts.
- A first sync now fetches the full trunk history of the configured
  repository. On GitHub, terryyin/open-dough is about 150 MB and
  nerds-odd-e/doughnut about 175 MB. A first open on a slow link could reach
  the 60s review bound. Slice 5's sync-failure notice must name that outcome.
- Slice 4: `reviewRepositoryHolding` repeats `fetchUnlessCommitPresent`
  (`gitTargetFetch.ts`, used by `sessionBranchAttribution.ts`). Merge them
  when session ranges move. They differ in the recheck after fetch and in the
  failure wording.

### 3. Move Taken story comparisons and fix file reads to their endpoints
Type: Behavior
Status: done
Proof: backend `dashboard/backend-tests/review/story-review-published-taken.spec.ts` with the checkout absent, plus the origin-moved file-read case; E2E `e2e/review/story-review-trunk-own-changes.spec.ts`; `dashboard/backend-tests/intent/ci-comparison-taken.spec.ts` stays green.

Behavior: a Story Branch Mode or Trunk Mode story is Taken with published work,
including merged trunk → the developer opens it with **Include merged changes**
off and on → the same attributed comparisons appear. File reads admit only
paths in the comparison at the named head within the last synced published
branch or trunk. They make no remote request, so they keep working after origin
becomes unreachable.

Accepted proof (uncommitted candidate on d354fbc6, load 7–27): all six
checkout-absent Taken cases failed first and then passed. Two new cases cover
reads after origin moves away: three admitted reads, plus refusal of an
outside path and a head beyond the sync, with no `fetch` or `ls-remote`. The
taken spec passed 3 runs back to back. Typecheck passed. Backend
`ci-comparison-taken`, `-taken-range`, `-endpoints`, `-published-endpoints`,
`story-review-refusal` and the Done review specs passed. Thirty Taken-review
and CI E2E journeys passed, including `story-review-trunk-own-changes`.

Learnings for later slices:
- A live Taken open syncs trunk, then the story branch by exact ref. Concurrent
  opens share each fetch.
- Built Taken comparisons are kept in-process, keyed by repository, identity,
  head and the synced ref listing. A file switch reuses its comparison instead
  of rebuilding it, which cost about 0.6s.
- `takenStoryClaim` no longer fetches. CI's `takenStoryEndpoints` fetches trunk
  into its checkout first. `publishedTakenBranchTip` is gone.
- The Trunk Mode case is still slow: the `trunkModeStory` template build alone
  takes about 1.9s, and the case reached 4.3s at load 16. A fixture repair
  before slice 4 trims that history across its five consumers.

### 4. Move accepted landing pairs and recorded session ranges
Type: Behavior
Status: done
Proof: backend `dashboard/backend-tests/review/story-review-published-landing.spec.ts` and `dashboard/backend-tests/review/published-session-review.spec.ts` with the checkout absent; E2E `e2e/sessions/recently-done-published-sessions.spec.ts` and `e2e/review/story-review-story-branch-landed.spec.ts`.

Behavior: trunk has advanced and the worktree is retired → the developer opens a
landed run or a Recently done published session → its exact recorded pair,
notes, and file diffs appear from the Review repository. After this slice no
review reader calls `executionCheckout`. Remove the remaining review Git-root
explanations and any support code left without a caller.

Accepted proof (uncommitted candidate on 9531fa77, external load 22–39): the
landing and published-session specs pass with the checkout retired. Typecheck
passes. Backend review, follow-up launch, landed-CI and intent branch specs
pass across 66 files. Frontend `published-session-subject` passes. Fifteen
E2E specs pass, including `recently-done-published-sessions`,
`story-review-story-branch-landed` and `story-review-one-shot-choice-races`.

Learnings for slice 5 and wrap-up:
- No review reader calls `executionCheckout`. `checkoutStoryEndpoints` remains
  for CI only. Published-session explanations now say "synced" and name the
  Review repository.
- `commitPresentOrFetched` (`gitTargetFetch.ts`) backs both
  `fetchUnlessCommitPresent` and `reviewRepositoryHolding`.
- Backend specs that build a fixture history the first time in a case pay that
  template build within the case's 5s budget. `prepareRepository`
  (`Distribution/tests/support/repository-fixture.mjs`) builds it earlier in a
  `beforeAll` at the default hook timeout, as
  `story-review-published-taken.spec.ts` does.

### 5. Keep a synced review readable when origin is unreachable
Type: Behavior
Status: done
Proof: new E2E `e2e/review/story-review-offline.spec.ts` through `dashboard/test-support/reviewChangesPage.ts`, which alone knows where the notice and Refresh live; backend sync-record cases.

Behavior:
- A Taken story was opened earlier and origin is moved away → reopen → the last
  synced comparison appears with a notice naming the problem and the last sync
  time. Switching files shows exact diffs.
- A story never synced is opened offline → the review is unavailable and names
  the failed sync.
- With `src/a.ts` selected, a failed Refresh keeps the comparison and the
  selection, and shows the notice.
- After origin returns and the agent publishes again, Refresh advances the
  comparison and keeps `src/a.ts` selected.

The notice wording stays consistent with the existing "Refreshing the review…"
and "Review refreshed" lines in `StoryReviewFeedback.tsx`.

Accepted proof (uncommitted candidate on a5117778): new Taken, Done and landed
offline backend cases failed at a5117778, then passed. The full backend
review folder, the frontend review specs and typecheck pass. E2E
`story-review-offline` covers the four behaviors.
`story-review-completed` covers a Done reopen with origin unreachable. Also
passing: `story-review-story-branch-landed`, `recently-done-published-sessions`
and `story-review-trunk-own-changes`.

Learnings for wrap-up:
- `reviewRepositoryRead` serves Done, landed and recorded-landing readers.
  When a later sync fails, it answers from the last synced refs with
  `syncFailure`. When the project never synced, it fails with "The review
  could not sync from origin…". Taken keeps its two-ref sync, so a branch
  origin lacks stays "not published on origin" (G1).
- The notice renders the last sync time through `Moment`, the shared way to
  show a recorded instant.
- Named follow-up from the refactor pass: the Done offline reopen was appended
  to the existing `e2e/review/story-review-completed.spec.ts` journey, and that
  test's title was widened. A new promise should have its own test. Split it
  into its own E2E test. Removing it is not enough, because no backend case
  covers the Done offline file diff.

## Execution complete

Product advice: keep SEED-430 next and do not reorder it otherwise.
- Queue the correction
  [Read review files without fetching](../../seeds/SEED-428-read-reviews-from-the-review-repository.md#read-review-files-without-fetching)
  ([plan 816](../816-read-review-files-without-fetching/PLAN.md)) ahead of SEED-430.
  SEED-430 grows its coordinator on this Review repository module. The
  correction fixes the read-without-fetch contract that SEED-430 depends on:
  - landed, recorded-landing and Done file reads stop syncing;
  - session sync failures are named;
  - a hanging origin answers from the last sync;
  - the CI Git-root guard regains its test.
- Carry two findings into SEED-430 refinement:
  - A branch deleted on origin is still read from its stale exact ref.
  - The one sync record is shared across refs and is not written atomically.
- Process review is deferred into wrap-up with the Intent Coverage check.
- Not done in this story: shared fixture history building in
  `Distribution/tests/support/repository-history.mjs` (`buildRepository`, one
  add, commit and push per revision) dominates load-sensitive backend case
  time. A test-optimization story would cut it.

## Story obligations

### G1. A failed Taken branch sync reads as an unpublished branch
Reported: slice 3 — "A failed live branch sync (network or deleted branch) reports \"The recorded story branch X is not published on origin.\""
Story clause: "A cold review with no readable comparison stays unavailable and names the failed sync."
Disposition: proved by slice 5: dashboard/backend-tests/review/story-review-offline-sync.spec.ts "a never synced Taken review opened offline is unavailable and names the failed sync" asserts the failed-sync wording without "not published"; story-review-published-taken.spec.ts "a Taken story's unpublished branch leaves a review gap" keeps "not published on origin"; e2e/review/story-review-offline.spec.ts cold journey shows it in Intent

## Concern evidence

Slice-plan refinement was not needed. The slices follow one model: each moves
one reader family to the same repository input, and the slice 1 Structure
precedes the first Behavior it enables. Five slices are within the limit. Slice 2
carries the new module plus the first reader, which is the largest of the five.
It may need a split at the module/reader boundary if it overruns, and the
execution overrun rule covers that. This review found no other slice-specific
concern.

## Local gate

Run focused proof through
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <spec paths>`
and `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- <spec paths>`
with the default strict reporter. Before landing, run the dashboard backend,
dashboard frontend, and E2E suites that read the moved review paths. Follow the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
For long local checks on macOS, start awake on AC power under `caffeinate -s -i`.
Follow the [machine sleep guidance](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
for battery runs.
