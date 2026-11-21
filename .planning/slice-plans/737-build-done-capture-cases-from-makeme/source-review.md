# Source review: SEED-413#fold-done-capture-launches-into-makeme

Launched 2026-11-21 by the execution coordinator as a fresh general-purpose
agent with no conversation inheritance. Input: the seed section's Goal, Scope,
Key examples, Evaluation and Effort hypothesis text only, with instructions to
read no other files and to number independently observable promises.

Unnumbered context: fifth of the Done capture import-list stories; the four
supplier stories own the production seam changes; runtime optimization has its
own story; the gain follows ADR 0010; effort M, one plan of eight slices. The
reviewer kept the four presets of 2 under one id because the source states them
as one move.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | One scenario value carries the checkout, its launch record or records, and the timeline, so a maintainer can see which work occurred during each launch, and can read a Done capture case from its MakeMe setup through the production entry and assertions. (Goal) | slice 8 | |
| 2 | The established Default main, blank Default main, isolated and declaring launch presets are moved onto the existing launch builder. (Scope 1) | slice 8 | |
| 3 | The repository builder is given the shared pre-launch history. (Scope 1) | slice 1 | observed: Distribution/tests/support/repositoryTestData.mjs withBaseBeforeEveryLaunch (dated 2019 base), default history of doneCaptureCaseBuilder.ts aDoneCaptureCase; s1b-specs run 40/40 |
| 4 | The real checkout fixture materializes named worktrees. (Scope 1; Key example 2) | slice 3 | observed: aDoneCaptureCase().withWorkspace(name) materializes worktrees through the repository fixture, paths read as Git registers them (doneCaptureCasePlaces.ts placesOf); ad-hoc-session-branch-entry "two declared sessions each capture their own branch", branch-entry-proposal refusal with worktrees.other; s3-final 45/45 |
| 5 | The real checkout fixture materializes an origin where the case publishes; only cases that publish. (Scope 1) | slice 6 | observed: declared-blank-launch-publication, declared-worktree-publication, ad-hoc-prepared-landing-done, ad-hoc-session-comparisons each declare aDoneCaptureCase().withOrigin() and publish to it (publishInstalled / git push origin); cases that do not publish (e.g. branch-entry, cursor recovery) build without origin; s6-all |
| 6 | Launch and Done times are stated at the call site; a Default main case names its launch and Done times in MakeMe. (Scope 1; Key example 1) | slice 1 | observed: slice-1 specs state { launched, done } in aDoneCaptureCase().withDefaultMainLaunch/withEstablishedSession or .launchedAt/.markedDoneAt at each call site (e.g. done-kept-session-shared-checkout.spec.ts earlier 70/15 vs this 60/10) |
| 7 | The distinction between case work and the action under test is kept. (Scope 1) | slice 2 | observed: aDoneCaptureCase().withWork(...) arranges dated work and records (refinements name its commits); capture/Done/deletion/expiry/refusals stay in test bodies of done-kept-session-commits, done-kept-commit-refs-release, kept-commits-release, ad-hoc-session-commits-pending-done; slice2-r2 33/33 |
| 8 | The declared publisher branch is composed from those same builders. (Scope 2) | slice 6 | observed: declared-*-publication.spec.ts compose the declared publisher branch with aDoneCaptureCase().withOrigin().withWorkspace(branch).withDeclaringLaunch(..., refine); entry assertions toMatchObject({branch, repository: checkout.gitDirectory, committedTip: base, trunk}); declaredPublisherBranch.ts deleted; s6-all |
| 9 | The reported isolated branch is composed from those same builders. (Scope 2) | slice 6 | observed: ad-hoc-session-comparisons.spec.ts composes the reported isolated branch with withIsolatedLaunch(..., launch => launch.reportingThrough(reporting)), landing authority/attempt via makeMe; reportedIsolatedBranch.ts deleted; s6-all |
| 10 | The delivered Done, branch-entry and landing-report values are reused. (Scope 2) | slice 6 | observed: branch entry from makeMe ofDeclaringDefaultMainLaunch (enteredBranch), Done branchResult {base: entryTree, revision} in ad-hoc-prepared-landing-done, landing report via makeMe.anAcceptedAttempt/aLandingAuthority/writeLandingContext; s6-all |
| 11 | Cases that exercise persistence, a race, or the installed publisher keep the real operation and its independent observations. (Scope 2) | slice 8 | |
| 12 | Arrangements and redundant verbs are removed from `doneCaptureCase.ts`, `declaredPublisherBranch.ts`, `reportedIsolatedBranch.ts`, `reportedDoneCase.ts` and the specs. (Scope 3) | slice 8 | |
| 13 | A module is retired once its last caller moves. (Scope 3) | slice 8 | |
| 14 | Any remaining effect stays in its existing owner. (Scope 3) | slice 8 | |
| 15 | No support wrappers are added. (Scope 3) | slice 8 | |
| 16 | For a Default main case, real work before, within and after the launch and Done times keeps the existing inclusion and exclusion assertions, including a shared checkout with overlapping sessions. (Key example 1) | slice 1 | observed: done-kept-session-{commit-runs,commit-rewrites,rebased-runs,shared-checkout,unavailable}, published-session-{listing,review}, ad-hoc-review-request, default-launch-start-facts: assertions unchanged (setup-only diff), s1b-specs 9 files 40/40 |
| 17 | The branch-entry spec declares its launch facts in MakeMe. (Key example 2) | slice 3 | observed: ad-hoc-session-branch-entry.spec.ts builds every case through aDoneCaptureCase() (withDeclaringLaunch, withWork(at => ...), kept()); s3-final |
| 18 | A dirty entry still preserves its first tree and the Default main tip. (Key example 2) | slice 3 | observed: ad-hoc-session-branch-entry "a declared branch keeps its entry state" (real uncommitted edit, pins, re-entry toEqual after main moves); branch-entry-proposal "an open launch proposes" (dirty.txt in recorded tree); s3-final |
| 19 | Review still reads the separate comparisons. (Key example 2) | slice 3 | observed: ad-hoc-session-branch-entry "Done saves the entry-time Default main run" and "two declared sessions" retainedBranchPairFiles; ad-hoc-branch-entry-attribution test 1 diffs; s3-final |
| 20 | Foreign or conflicting places are still refused. (Key example 2) | slice 3 | observed: branch-entry-proposal "a proposal refuses a foreign clone, a wrong branch and a second place" (real git clone --local, second named workspace); ad-hoc-branch-entry-attribution attributionGap; s3-final |
| 21 | The branch-entry spec has no local setup helpers. (Key example 2) | slice 3 | observed: ad-hoc-session-branch-entry.spec.ts has no local setup function; one shared builder chain aDraftBeforeEntry, entry and later work in each test body |
| 22 | In the branch-entry spec, any remaining import from `doneCaptureCase.ts` is limited to one case builder. (Key example 2) | slice 3 | observed: ad-hoc-session-branch-entry.spec.ts imports nothing from doneCaptureCase.ts; only aDoneCaptureCase from doneCaptureCaseBuilder.ts (line 15) |
| 23 | A publisher case starts from the matching launch, attempt and context. (Key example 3) | slice 6 | observed: declared-worktree-publication context-reference check, attempt keyed by the record session, the two 409 refusals (other launch, wrong tip), saved.landing.reference; s6-all |
| 24 | A publisher case keeps the distinct branch and delivered comparisons, including across retirement and exact retry. (Key example 3) | slice 6 | observed: ad-hoc-session-comparisons / declared-worktree-publication: delivery and branch pairs in reviewedFileText after retireAdHocBranch, retryInstalledLanding equals landing.receipt, pin release after deleteRecord; s6-all, s6-consumers 76/76 |
| 25 | An evaluation compares support imports and named bindings per affected spec, and lines in the affected specs and support, including builders that receive moved setup, rebased on the delivered supplier state. (Evaluation) | slice 8 | |
| 26 | The result shows fewer support verbs and visible scenario facts with every assertion preserved; any added lines are counted in the trade-off. (Evaluation) | slice 8 | |
