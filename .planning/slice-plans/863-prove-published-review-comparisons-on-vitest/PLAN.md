# Prove published Review comparisons in Node Vitest

**Source:** [Prove published Review comparisons in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-review-comparisons-via-vitest)

**Identity:** SEED-413#published-review-comparisons-via-vitest

## Goal and scope

Give developers fast regression feedback that a published Review answer and
its file reads stay bound to the selected story or retained run and the
admitted comparison, including refusals and unavailable evidence. Convert the
remaining proof to Node Vitest, preserving actual Git, local persistence,
HTTP wire and browser observations where they make a difference. Landing
capture, changes to how Board and Review share refresh, and backend runner
removal belong to their respective stories.

## Current decisions

- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  puts published facts in origin history and retained launch records and
  Review marks in local operational state. A checkout cannot supply a
  missing published comparison. Follow
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  by using the same typed comparison and file reads as the Dashboard.
- [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  Exercise the current Review repository, ref verification and shared fetch
  owner. Plan 856 delivered verified Board trunk reads in
  [accepted proof at `e4faafbdb`](https://github.com/terryyin/open-dough/blob/e4faafbdbde434438d5c7d0d76f1fe9137dc00c5/.planning/slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md#execution-complete).
  Its maintained backend witnesses are `verified-origin-trunk.spec.ts`,
  `shared-verified-origin-trunk.spec.ts` and
  `verified-origin-trunk-deadline.spec.ts`.
  [Plan 888](../888-share-one-refresh-across-board-and-review/PLAN.md) owns
  ending stalled remote transfers and coalescing Board with Review. This
  plan keeps the existing same-Review overlap, actual Git child close and
  ref mutation witnesses. If 888 lands first, run its successor at the new
  boundary and verify the same assertions before replacing a witness.
- [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  The existing production seam is
  [`storyReview`](../../../dashboard/server/storyReview.ts) over an
  admitted read, with
  [`publishedStoryReview`](../../../dashboard/server/storyReviewPublished.ts)
  owning published comparison construction and
  [`reviewedFileDiff` and `reviewedFileText`](../../../dashboard/server/storyReviewFileResponse.ts)
  owning exact file reads. `storyReviewInput` supplies the configured
  source and local or fetched evidence as the route requires. Reuse them and
  the existing MakeMe repository materializer and retained-record builders.
  The Board's verified-backlog read does not build a comparison, the Intent
  result answer reads one named tree, and Follow up consumes file admission
  for its own launch. Keep each operation at its current boundary. Keep the
  Review state store with its production owner. Add zero test-support
  wrappers and remove a wrapper only after its final affected caller moves.
- [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Move the Node-capable proofs in place with the current backend selector.
  Use loopback HTTP where the promise is a wire response. Browser gestures
  and visible state continue in the named E2E journeys.

## Premises and baseline

At `dc0c260c2`, `groupFiles(backendGroup)` selected 85 Review specs, 54
Vitest and 31 Playwright. The 33 Playwright paths in the
[campaign inventory](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
at `43b6506e7` were this family's original 21 and the
[12 landing-capture specs](../864-prove-landing-capture-evidence-on-vitest/PLAN.md).
The latter have a separate owner. Commit `8d2725305` moved the result
answer and tree admission to Vitest and removed the landed-result route
fixture from the inherited selection. The remaining 19 specs select 55
Chromium cases. Paths below are relative to `dashboard/backend-tests/review/`
unless indicated. Observations used Node v24.21.0 and Apple Git 2.50.1 on
macOS on AC, one worker, and the default case timeout.

| Consuming operation | Observation at `dc0c260c2` | Consequence |
| --- | --- | --- |
| Review open, literal diff/text and refusals, kept record selection, marks, and actual Git mutation | On 2026-11-27 all 55 Chromium cases in the 19-spec selection passed on the first attempt with the configured proof reporter. Wall time was 292.04 s, summed case time 283.11 s, and median 4.57 s. 53 cases exceeded 100 ms. macOS one-minute load was 19.24 at start and 36.69 at finish. | Slices 1–8 preserve the observed answers and native boundaries. The prior passing run with the line reporter took 248.46 s wall, so compare under measured load. |
| Compare a branch completion and its widened rename through typed reads | `story-review-completed-contribution.spec.ts` passed both cases in Node Vitest. Incoming text was admitted only on the widened pair and the rename refused an unrelated old path. The real two-parent merge-side contrast also passed. | Slices 4–5 reuse the production operations and real Git histories. |
| Read inventory and text at a named result tree | The nine Node cases in `story-review-result-{tree,admission}.spec.ts` passed in 10 ms summed case time. They observed location selection, settings recovery, literal text, absence, unavailable reads, list failure, selection of the Done/Taken/landed revision and refusal of a different tree or out-of-tree path. | These own the answer and admission rules from both historical result specs. Slice 5 owns the remaining consumer contrasts. |
| Choose and read the result of a retained landing with advancing trunk | At `fba07a143` on 2026-11-28, `e2e/intent/intent-done-default-answer-selection.spec.ts` passed its complete journey in 5.5 s at one worker: the selected landing's inventory and text at the accepted revision after trunk advanced, then the next story's published default and final file text. | Slice 5 owns both the historical-source journey and still-distinct contrasts from the removed Git route cases. |
| Read from two Git worktrees and end an aborted mutation | Both Chromium cases passed. The ref hook recorded one mutation with two waiters reading the new ref. The aborted child did not settle until the hold was released. The three typed fetch ownership cases and 15 verified Board trunk cases also passed in Node. | Reuse the real process and ref-transaction gates for slice 8. Plan 823 owns the later transport and cross-reader behavior. |

Use the maintained backend command on the exact spec names under the slices
for the one-worker baseline and on their maintained owners for the final
selection. Use `--workers=1` with the configured reporter and set
`OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` and
`OPEN_DOUGH_DASHBOARD_BACKEND_TIMES` to record per-case durations and
engine. Record wall time as well as summed case time. The same commands use
the installed Playwright Chromium for legacy specs and the Node environment
for Vitest. Run both from the same checked-out profile and comparable load.
Record fresh measurements if an intervening change affects a consuming path.
The companion Node selection passed all 40 cases in 62.17 s wall time and
41.62 s summed case time. It covered the eight Review files in the table and
the ten receiving Follow up cases in
`agent-launch-follow-up-{file,file-admission,landed-comparison-admission}.spec.ts`
in `dashboard/backend-tests/launches/`.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'review/(story-review-completed-(contribution|merge-side)|story-review-result-(tree|admission)|git-target-fetch|shared-verified-origin-trunk|verified-origin-trunk(-deadline)?)\.spec\.ts$' \
  'launches/agent-launch-follow-up-(file(-admission)?|landed-comparison-admission)\.spec\.ts$' \
  --workers=1
```

## Ordered slices

In each slice keep the old assertions reachable until their replacements
run. Record an owner for each old case, including loops with multiple
assertions. Discriminate the replacement with the smallest relevant held,
refused or contrasting result. Run the retained browser journeys when
their production contract changes. The estimate is 15 active minutes or
less per slice, with time in commands excluded.

### 1. Reopen the published completion from the admitted sync

Type: Behavior
Status: done

Behavior. A Done open names its immutable published comparison in either
execution mode. Later and interleaved work, a later fast-forward integration,
dirty competing worktrees, and moving the execution checkout leave its
comparison and file results fixed. An offline reopen names the failed sync
and uses the last readable comparison, or discloses cold unavailability.
A subsequent exact file read has no origin requests and rejects a completion
beyond the local sync. The execution checkout's tracking ref and working
state are preserved.

Proof. Use `storyReview` and `reviewedFileDiff` over admitted Done and
file inputs, a real bare origin, real Git refs and a controlled local remote.
Retain branch and trunk cases for fixed endpoints and capture each origin
request during the file reads. Replace `story-review-completed.spec.ts`,
`story-review-completed-offline.spec.ts` and the competing-dirty-worktree
case of `story-review-completed-gaps.spec.ts`. Keep
`e2e/review/story-review-completed.spec.ts` for opening the fixed result
from a Done card after the checkout moves.

Accepted. `story-review-completed.spec.ts` now holds 10 Node cases over
`configuredFixtureProject`, replacing 12 Chromium cases. The two offline
cases are merged, and the competing-dirty-worktree case moved out of the
gaps spec. At one worker, the 12 old cases summed 30.81 s; after refactor,
the 10 new cases ran in 9.87 s (load 5.2). The cost of the cases above
100 ms comes from real Git clones, the Review sync fetch, pushes and
merges. In Vitest, HOME is the fixture directory itself, so the Review
repository is at `homeReviewRepository(realpath(fixture))`. No production
contract changed, so the E2E journey was not rerun.

### 2. Recover a published execution owner and explain missing claim evidence

Type: Behavior
Status: done

Behavior. A historical Done record without an agent recovers a unique
published execution claim and admits its fixed files. A later claim or
preparation cannot acquire that completed comparison. Missing, shallow or
conflicting claim history returns its reason without a partial file list.

Proof. Give `publishedStoryReview` and the exact file reader a configured
source and real published Done, Take, return and preparation histories.
Replace `story-review-completed-agent-recovery.spec.ts` and the missing
claim, recovered branch claim and historical-owner assertions in
`story-review-completed-gaps.spec.ts`. Slice 6 owns the prior landing or
missing-capture selection in that same file. Keep `storyPublishedEndpoints`
as the common claim source for Review and CI. Run affected CI comparison
readers if that seam changes.

Accepted. `story-review-completed-agent-recovery.spec.ts` now holds 8 Node
cases and replaces 7 Chromium cases from it and the gaps spec. The old cases
summed 8.72 s and the new ones 9.08 s, at load 6.2 old and 8.5 new. The new
spec adds two recovery histories, each with a later claim and preparation,
and real Git fixture work makes up most of the cost. The production seams
did not change. `renderAgentProfile` accepts only known agent names. An
agent-named shallow completion explains a missing "complete claim" rather
than saying "shallow".

### 3. Attribute the published story's contribution

Type: Behavior
Status: done

Behavior. An attributable completion includes each historical owner's
contribution after a takeover. Foreign resolutions do not hide owned edits.
An inseparable trunk rewrite identifies its mixed baseline and refuses an
unlisted baseline. Foreign octopus history leaves a readable comparison,
and an owning octopus merge gives an attribution gap.

Proof. Drive `publishedStoryReview` or `publishedStoryComparison` with the
same real takeover, foreign-merge, inseparable-file and octopus histories
as `story-review-completed-attribution.spec.ts`. Assert ordered exact
endpoints, listed paths and accepted/refused baselines through
`reviewedFileDiff`. The slice proves who contributes. Slice 4 proves what
an attributed merge contributes from its actual and automatic trees.

Accepted. The 5 Chromium cases in `story-review-completed-attribution.spec.ts`
map one-to-one onto 5 Node cases. At one worker the old cases summed 24.8 s
and the new ones 8.3 s. Load fell from 17.2 to 9.7 during the comparison.
`includesTrunkFrom` names the claim revision's tree. The backend runner
rejects `-t`, so select by spec path.

### 4. Read owning merge edits and explain missing merge trees

Type: Behavior
Status: planned

Behavior. A completion or integration merge retains the story's own merge
edits and identifies inseparable conflict files and their readable bases.
Restored trunk files stay out and a non-owning resolution preserves the
story comparison in both modes. Git driver chatter preserves the answer.
A Git without merge-tree support or with an unreadable edit object yields
its explanation without a partial comparison.

Proof. Drive the production comparison and literal diff against real
merge and rename histories. Keep an actual driver with clean, edited and
conflicted merge output and inject the failing Git executable or missing
object only for its distinct case. Replace
`story-review-completed-conflicts.spec.ts`,
`story-review-completed-driver.spec.ts`,
`story-review-completed-merge-tree.spec.ts` and
`story-review-completed-own-conflict-gap.spec.ts`. Retain
`story-review-completed-merge-side.spec.ts` for the two-parents ownership
contrast and `e2e/review/story-review-completed-merge-edits.spec.ts` for
the visible mixed and attributed file rows and their diff.

### 5. Serve only the selected comparison's file or result tree

Type: Behavior
Status: planned

Behavior. A named Done or landed comparison admits only its project,
story, endpoints and listed paths. A rename uses both literal paths.
Printed diff and text agree on the admitted pair. Additions and deletions
have an absent side, binary is unavailable, and textual bytes retain their
newlines. Malformed or foreign requests fail at the existing boundary
without Git or local writes.

Proof. Drive `reviewedFileDiff` and `reviewedFileText` over typed reads
with real Git objects and `fileDiffRequest` and `fileTextRequest` over
the production URLs used to create those reads.
Use the existing route/parser chain where method, origin, status, or no
side effect is the observation. Replace
`story-review-completed-file-admission.spec.ts`,
`story-review-file-text-admission.spec.ts` and `story-review-refusal.spec.ts`.
Keep the existing Node contribution, result answer and tree admission
owners. Restore the retired-landing result's foreign-story refusal and
empty and binary Git result contrasts through the admitted result read.
Keep the literal inventory and source at the old named Taken head after
the branch advances. The existing Taken file read observes the older
pair's literal diff/text, while the result reader covers the whole named
tree and its Intent settings. Reuse the production result reader and Git
adapter. Run the named Intent journey and affected file Follow up readers
if sharing or admission changes.

### 6. Keep the chosen landing through replacement, deletion and expiry

Type: Behavior
Status: planned

Behavior. A captured comparison is keyed to a launch even when its native
session is replaced. Retention and deletion advance the preferred choice
to the next capture, then the legacy evidence gap. Historical default
opens preserve the published completion independently of a retained
capture (missing repository, wrong target, completed base, shallow result).
A prior exact landing remains independently readable from origin when
admitted.

Proof. Use `keptRecords`, `reviewedLandedRuns`, `storyReview` and
real temporary stores and Git histories. Declare retained records and times
with MakeMe, keep actual replacement/deletion and the expiry boundary, and
read the preferred and explicit choices. Replace
`story-review-stored-retention.spec.ts`,
`story-review-stored-runs.spec.ts`,
`story-review-completed-capture-fallback.spec.ts` and the capture/run
assertions in `story-review-completed-gaps.spec.ts`. Keep
`e2e/review/story-review-one-shot-choice-refresh.spec.ts` for the visible
selection through refresh after deletion, expiry and replacement.

### 7. Persist review marks by project, story and session

Type: Behavior
Status: planned

Behavior. An explicit session unreview persists beneath a covering story
mark until the next story-wide change clears it. Malformed or foreign
requests leave state untouched. An unreadable document reads empty, and
the next valid save preserves the unreadable bytes beside the replacement.

Proof. Keep `answerStoryReviewStates` as the wire adapter and use the
existing read and change operations against a temporary machine JSON store.
Expose those operations or pass the existing typed store input only as
needed under the same production owner. Preserve wire verbs, origin,
status and cache header through the existing boundary on loopback in
Node. Replace `story-review-state-admission.spec.ts`. Keep the displayed
mark and restart proof in
`e2e/stories/recently-done-review-state-persistence.spec.ts`.

### 8. Share a verified fetch through its Git mutation lifetime

Type: Behavior
Status: planned

Behavior. Two concurrent Done opens share one fetch of the same ref.
Ref readers in sibling worktrees observe one actual mutation of their
common Git directory. Aborting a ref mutation whose child stays alive
leaves its operation outstanding until child close.

Proof. Drive two typed Done opens through the same
`syncedReviewRepository` and observe the actual held remote request and
both comparisons. Move the existing loopback child and ref-transaction
cases to Node Vitest using their existing gates, through
`runGitUntilClosed` and `fetchGitTarget`. These are the receiving process
and repository proofs for the shared-fetch lifetime. Replace
`story-review-completed-shared-fetch.spec.ts`,
`git-target-fetch-process.spec.ts` and `git-target-fetch-worktrees.spec.ts`.
Keep `git-target-fetch.spec.ts` for waiter cancellation, repository
independence and retry after failure. Preserve Board's separate verified
trunk proof and the stated ownership boundary with plan 823.

## Proof and local gate

Apply the [campaign comparison requirements](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
Keep default timeouts. Use awake macOS on AC under `caffeinate -s -i` for
long local checks per [AGENTS.md](../../../AGENTS.md). Follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run the focused backend selection at each slice and Dashboard typecheck
for affected production and test types. Trace shared reader and fixture consumers
under [executable proof](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
before removing a legacy proof or changing a seam. At delivery, require zero
legacy cases in this family's maintained selection. Compare counts, per-case,
summed, and wall times. Record the cost and the Git, process, or browser
observation behind any case that still needs substantially more than the
campaign's roughly 100 ms guide. Name and measure any receiving E2E proof.

## Plan review

Eight slices keep one proof loop apiece: published pin and fallback, claim
evidence, attributed comparison, merge trees, literal admission, retained
choice, local marks, and shared Git fetch lifetime. The existing published
comparison is the common input to file and result admission. Its ownership,
merged trees, retention and resource lifetime stay with their current
production owners. Slice-plan refinement was unnecessary after separating
claim recovery from attribution and mapping the current surviving witnesses.

The retained browser journeys were observed at `fba07a143` on 2026-11-28,
one worker, with the configured proof reporter. All three passed on the
first attempt: Intent default selection in 5.5 s, Done Review after the
checkout moves, including the Landed run cue, in 5.2 s, and merge edits,
including the rendered integration edit diff, in 4.2 s. The macOS
one-minute load was 8.0 at start and 7.6 at finish. Main CI passed at
`1e7dd2db0`, `b7d3c47be` and `f60cc8dd8`. The intervening commits since
`dc0c260c2` do not touch the Review read path. The failures at
`dc0c260c2` occurred at a one-minute load of 54.59 on 16 logical CPUs. Each
slice that changes a journey's production contract reruns that journey
under the default limits.

```sh
caffeinate -s -i npm run test:e2e -- \
  e2e/intent/intent-done-default-answer-selection.spec.ts \
  e2e/review/story-review-completed.spec.ts \
  e2e/review/story-review-completed-merge-edits.spec.ts --workers=1
```
