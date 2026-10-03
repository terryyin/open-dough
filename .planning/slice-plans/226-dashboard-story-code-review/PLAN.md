# Dashboard story code review

**Identity:** SEED-088#dashboard-story-code-review
**Source:** [refined story](../../seeds/SEED-088-dashboard-story-code-review.md#dashboard-story-code-review).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace.

## Goal and boundaries

From a story's card, a developer opens one read-only review of what the
story's latest launch worktree would add to trunk now. The review compares the
worktree's commits plus staged, unstaged, and new untracked files against the
merge-base with freshly fetched trunk. It has a file browser the developer can
hide or show, a diff for the selected file, and a Refresh action. It also
explains the cases where there is nothing to show.

Scope, Architecture, and key examples are those of the source story. Material
exclusions are the story's deferred promises:

- Selecting a commit range.
- Reviewing only what changed since the last review.
- Comments and approvals.
- Choosing among worktrees.
- Whole-story history.
- Reviewing a branch without its worktree.
- Live updates.
- Side-by-side layout and syntax highlighting.
- Per-file line counts.
- Acting from the review.

## Direction and PFE

There is no North Star topic for local workspace reads, and this plan adds none.
The story's Architecture section carries the direction. Proposed ADR 0008's
local operational visibility informs it but binds nothing. Accepted ADRs apply
as follows:

- [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md): one name
  and owner for the story review, its snapshot, and its baseline.
- [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  direct domain mapping and small verified increments.

PFE findings and choices:

- **Diff computation.** Git computes the change set, rename detection, and
  binary detection itself. Add no diff library: the server returns Git's
  unified diff, and one pure parser in `dashboard/src/` turns it into hunks
  and lines for rendering.
- **Fixed snapshot.** Write the worktree into a tree object through a
  temporary index (`GIT_INDEX_FILE`, `read-tree HEAD`, `add -A`,
  `write-tree`). Diff `baseline..tree`. The tree is immutable, so every file
  diff opened later comes from the same observation. The worktree's real index
  and status stay untouched, and ignored files stay out.
- **Git runner.** Four server helpers run Git (see the Architecture section).
  Slice 1 gives them one runner before the review adds a fifth caller.
- **Admission.** Follow the launch boundary's GET pattern for
  `sessionResultEndpoint` in `dashboard/server/agentLaunchAdmission.ts`. A
  request names the project (`source`) and the work identity. A file diff
  request also names the snapshot's baseline and tree object IDs and the
  path. Object IDs must be hexadecimal, and Git receives paths only after
  `--`. No request carries a filesystem path.
- **Review workspace rule.** Add one pure function in `dashboard/src/` that
  picks the most recent kept launch record for the identity, by `launchedAt`,
  whose `start` or `preparation` names a workspace. The card uses it with the
  machine sessions it already reads (`MachineSessions.records`,
  `launchSubject`). The server uses it with `keptRecords`.
- **Page.** The review opens from the story's card, beside its launches
  (`dashboard/src/CardLaunches.tsx`), whenever the rule finds a workspace,
  whatever the session state. Follow the UX/UI North Star: text carries
  additions and removals, code lines scroll inside their own region with no
  page-wide horizontal scroll, keyboard reaches every control, and focus
  returns to the card when the review closes. Execution chooses the layout.
- **Fixtures.** Page journeys write a launch record whose `start` names a real
  worktree into the machine store, as `tests/support/sharedLaunchRecord.ts`
  does. The worktree hangs off a real bare origin, like
  `tests/support/startOrigin.ts`. The record is a precondition the product does
  not promise to create.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The temporary-index snapshot covers staged, unstaged, and untracked changes, leaves out ignored files, detects a rename and a binary change, and leaves the real index and status unchanged. Merge-base with fetched trunk leaves out trunk changes merged into the story and later trunk commits. | Slices 2–3 | Scratch repository under the job tmp directory: bare origin, linked worktree `story` with a rename commit, a delete commit, a `--no-ff` merge of trunk carrying `other.txt`, then a later trunk commit `other2.txt`. Added a staged and an unstaged edit, a binary change, untracked `notes/new.txt`, and ignored `tmp/x`. Ran `git fetch origin main`, `git merge-base HEAD origin/main`, the temporary-index `write-tree`, and `git diff --name-status -M -z $base $tree`. | Base was the `other` merge point. Output `D del.txt`, `M img.png`, `M keep.txt`, `R082 old.txt new.txt`, `A notes/new.txt`, with no `other*` and no `tmp/x`. Status hash identical before and after. `git diff -- img.png` printed `Binary files … differ`. |
| `git fetch <remote> <target>` works from a linked worktree. | Slice 2 | Same scratch run. | It fetched. |
| Launch records name the identity (`request`), the workspace, branch, remote, and target (`start` or `preparation`), and `launchedAt`, and the page already has them. | Slices 2, 5 | Read `dashboard/src/launchRecord.ts` (schemas at lines 74–171), `dashboard/src/agentLaunch.ts` `cardSessionsOf`, and `dashboard/src/agentLaunches.ts` `MachineSessions.records`. | Confirmed. One-shot default-checkout records name the project folder as the workspace, which the same rule reviews. |
| Page journeys run locally with a real bare origin and records in the machine store. | Every slice | `npm ci --include=dev`, then `npm run test:dashboard -- agent-launch-default-checkout-warning.spec.ts`. | Exit 0. |
| The slice 1 callers each have a spec that reaches them. | Slice 1 | Searched `dashboard/tests` and server imports. | `defaultCheckoutChanges.ts` → `agent-launch-default-checkout-warning.spec.ts`. `startGit.ts` `takenSlugs` → `launch-workspace.spec.ts` (“Codex shares collisions…”). `preparationCleanup.ts` → `agent-launch-preparation-stops.spec.ts` (worktree removal, lines 77–94). `projectAddition.ts` → `project-add-validation.spec.ts` (local path refusals). |

## Proof ownership

| Promise (story example) | Slice | Proof |
| --- | --- | --- |
| Opening names the worktree, branch, and baseline and lists the story's files with kinds, without trunk files (1, 2, 5) | 2 | Page journey |
| Selecting a file shows its combined diff; hide or show the browser (1, 3) | 3 | Page journey |
| A rename shows old and new paths; a deletion shows; a binary file says it has no textual diff (5) | 3 | Page journey and focused parser proof |
| The snapshot does not change while read; Refresh includes the new edit (4) | 4 | Page journey |
| No changes, worktree missing or retired, no launch workspace, trunk not fetchable (6) | 5 | Page journey and focused rule proof |
| Requests outside admission are refused | 2 | Launch boundary spec |

## Slices

### 1. One Git runner for the dashboard server
Type: Structure
Status: done
Proof: `npm run test:dashboard -- agent-launch-default-checkout-warning.spec.ts launch-workspace.spec.ts agent-launch-preparation-stops.spec.ts project-add-validation.spec.ts` stays green, and `npm run typecheck:dashboard` passes.

Internal change: add one server module that runs Git in a checkout, taking
arguments, an optional environment, an optional abort signal, and an output
limit. Move `defaultCheckoutChanges.ts`, `startGit.ts`, `preparationCleanup.ts`,
and `projectAddition.ts` onto it. Each caller keeps its own failure meaning
(empty text, ok/text, or a thrown problem) and behaves as before. Enables
slice 2, which needs the environment option for the temporary index.

Accepted proof: `npm run typecheck:dashboard` passes, and the four named specs
plus `execution-start-result.spec.ts` (a `startGit` consumer) pass, 26 tests.
Learning: `runGit` (`dashboard/server/gitRunner.ts`) rejects with `GitFailure`,
which carries `stdout` and `stderr`. Node's `ExecException` type is not an
`Error` to the linter.

### 2. Open a story's review and see its changed files
Type: Behavior
Status: done
Proof: a new page journey (for example `story-review.spec.ts`) and a boundary
case in it for refusals.

Behavior: a project has a story with a kept launch record whose `start` names a
real worktree. That worktree has two commits (including a rename), a `--no-ff`
merge of trunk carrying another story's file, a later trunk commit, a staged
edit, an unstaged edit, an untracked file, and an ignored file. The developer
uses the card's review action. The review names the worktree, its branch, and
the baseline commit, and lists each story file with its change kind: the
untracked file as added, the rename with both paths. Neither trunk file nor the
ignored file appears. A request with an unknown project, a malformed identity,
or a path parameter is refused, and nothing runs.

Builds the review workspace rule, the snapshot (fetch, merge-base,
temporary-index tree, name-status), the review endpoint, and the review view
with its file browser.

Accepted proof: `npm run test:dashboard -- story-review.spec.ts` passes. With
the card, admission, and session-result specs, 28 tests pass.
Learnings for slices 3–5:
- The rule is `reviewWorkspaceOf` in `dashboard/src/storyReview.ts`.
- The snapshot is in `dashboard/server/storyReviewSnapshot.ts`. Its
  `unavailable` answer covers a failed fetch or Git step. A missing worktree
  currently reads as Node's "spawn git ENOENT", which slice 5 replaces.
- GET admission is shared through `exactReads` and `requireExactQuery`, and
  `dashboard/server/storyReviewAdmission.ts` holds the review's admission.
- The action and dialog are `dashboard/src/StoryReviewAction.tsx`. It is not
  named `StoryReview.tsx` because ESLint fails on a case-only clash with
  `storyReview.ts`. Slice 3 moved the view into `StoryReviewSnapshotView.tsx`,
  `StoryReviewFileDiff.tsx`, and `useReviewRead.ts`.
- Not yet tested: a record that names only `preparation`, and the 405
  refusal.

### 3. Read a selected file's diff and make room for it
Type: Behavior
Status: done
Proof: extend the slice 2 journey. Add a focused unit proof of the unified diff
parser (hunks, additions, removals, no-newline marker, binary notice).

Behavior: in the slice 2 review, the developer selects a modified file and sees
its additions and removals marked in text. They hide the file browser and the
diff keeps its place with more room, then show the browser and select the
rename (diff against its old path), the deleted file (all lines removed), and a
changed binary file, which states it has no textual diff. A file diff request
with a malformed object ID is refused.

Accepted proof: `npm run test:dashboard -- story-review.spec.ts
story-review-diff.spec.ts session-result-admission.spec.ts
agent-launch-boundary.spec.ts agent-launch-card-sessions.spec.ts` passes, 22
tests. The journey fixture is `dashboard/tests/support/storyReviewWorktree.ts`.
Learnings for slices 4–5:
- `useReviewRead` keeps its last answer when its query changes, so Refresh must
  reset it or remount the view.
- A mode-only change is proven only by the parser spec.

### 4. The review stays fixed until Refresh
Type: Behavior
Status: done
Proof: extend the slice 2 journey.

Behavior: with the review open on a file, the test commits a further edit to
that file and adds a new file in the worktree. The file list and the open diff
stay as they were, including when another file is selected and the first is
reopened. After Refresh, the list includes the new file and the diff includes
the edit. Refresh does not move focus, and its completion is announced.

Accepted proof: `dashboard/tests/story-review-refresh.spec.ts` passes. With the
review, diff, and admission specs, 23 tests pass. Refresh is always offered in
the dialog header. A failed or `unavailable` Refresh replaces the earlier list
with its explanation.

### 5. Explain why there is nothing to review
Type: Behavior
Status: done
Proof: page journey cases, plus a focused proof of the review workspace rule:
most recent by `launchedAt`, preparation and start alike, and records without a
workspace skipped.

Behavior:
- A story whose latest launch worktree matches its baseline shows that there
  are no changes against the named baseline.
- A story whose worktree folder was removed says the worktree is missing and
  names the path it looked for.
- A story with no kept launch record that names a workspace offers no review
  action.
- When trunk cannot be fetched, the review names the remote and target it
  could not fetch and offers Refresh. It never shows a list against an
  unfetched baseline.

Accepted proof: `dashboard/tests/story-review-nothing.spec.ts` and
`story-review-workspace.spec.ts` pass. With the other review, admission,
boundary, card, and workspace-retirement specs, 40 tests pass. The missing
worktree is checked through `directoryState` in
`dashboard/server/sessionWorkspace.ts` before any Git runs. Learning: the file
diff endpoint reports Git's own failure when the worktree disappears after a
snapshot. No story promise covers that case.

## Execution complete

Product advice:
- Execute the bounded correction
  [SEED-088#prove-landed-slices-leave-the-review](../../seeds/SEED-088-dashboard-story-code-review.md#prove-landed-slices-leave-the-review)
  (plan 228). It adds a page journey for key example 2, which has no observing
  proof yet.
- Then take the next review story in this seed (`review-selected-commits` or
  `review-changes-since-last-review`). Both can reuse the snapshot, the
  stateless file diff, and the `exactReads` route.
- A file diff opened after its worktree disappears reports Git's own failure.
  Consider it when refining the next review story.

## Considered and excluded

- **A diff rendering library** (diff2html, Monaco). Git's output plus a small
  parser covers the promised view. Highlighting and side-by-side are deferred.
- **Holding snapshots in server memory.** Immutable tree IDs make the file diff
  request stateless.
- **Reusing the default checkout warning's porcelain parsing.** The review
  needs a tree-to-tree diff, so only the Git runner is shared.
- **Comparing with trunk's tip or the starting revision.** Both put trunk
  changes in the review; see the story's Architecture section.

## Current decisions

- The review baseline is the merge-base with freshly fetched
  `<remote>/<target>` from the selected record.
- The snapshot is a tree object written through a temporary index. Its loose
  objects are ordinary unreachable objects in the workspace's repository.
