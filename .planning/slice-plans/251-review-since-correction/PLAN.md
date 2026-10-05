# Correct the changes since the review across trunk

**Identity:** SEED-088#review-since-correction
**Source:** [correction story](../../seeds/SEED-088-dashboard-story-code-review.md#review-since-correction),
a bounded retrospective correction of
[SEED-088#review-changes-since-last-review](../../seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review)
([plan 245](../245-review-changes-since-last-review/PLAN.md)), reviewed
commits `d754256c`, `e5eee449`, `a0103d66`, `97728d3f`, `0ebcbf0c`, and
`f11d8bd0`.
**Prepared:** 2026-10-05. Planning only, in the story's execution worktree.

## Goal and boundaries

A marked story's review stays whole and truthful after trunk was integrated
since the mark: a Git that cannot restate the mark degrades to all changes
instead of failing the review, a conflicted file the story kept as marked
stays listed, and an empty since-the-review says so relative to trunk. The
review's comments, documentation, and specs say what it does.

Preserved: every promise and key example of the original story, including
(d) that a story slice landed on trunk after the mark is not listed. One
snapshot routine; `/__agent-launch/review/file` unchanged. ADR 0001's “mark”,
“marked snapshot”, and “since the review” keep their meanings.

Material exclusions:

- Recognizing the story's own commits that reached trunk after the mark, so
  they are listed rather than treated as trunk's. That is
  [SEED-088#review-trunk-mode-story-changes](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-changes);
  this correction changes only the wording that overclaims.
- Clearing a mark without replacing it (still deferred by the story); slice 1
  makes it unnecessary for recovery on older Git.

## Current findings

Each was observed against the current code before planning.

1. **Older Git fails every review after trunk.** `server/storyReviewSince.ts`
   `restatedMark` always runs `git merge-tree --write-tree
   --merge-base=<mark.baseline> <mark.tree> <baseline>` and tolerates only
   exit 1. Git before 2.45 rejects a tree there (plan 245's learning; 2.40–2.44
   say the tree is not a commit and exit 128). The failure reaches the outer
   `catch` in `server/storyReviewSnapshot.ts`, answering “The workspace's
   changes could not be read”: all changes are lost too, and the unavailable
   review renders no Mark reviewed (`src/StoryReviewPanel.tsx:91`, the mark
   controls render only for a `snapshot`), so the developer cannot recover.
2. **A conflicted file kept as marked disappears.** `changesSinceReview`
   diffs Git's conflicted names from `mark.tree`; when the story resolved one
   back to its marked content, that diff is empty and the file is dropped,
   hiding that the story discarded trunk's change. With no other change the
   view says “Nothing changed since the review.”
3. **Nothing-changed overclaims after trunk.** `src/StoryReviewSnapshotView.tsx:102`
   says “Nothing changed since the review.” whatever the baselines; after
   trunk was integrated, story work that reached trunk after the mark is
   treated as trunk's, so the claim is only true relative to trunk.
4. **Stale descriptions.** `src/storyReview.ts:134-136` says every file diff of
   the snapshot compares `baseline` with its tree;
   `server/storyReviewAdmission.ts:3-6` says a file diff names the snapshot's
   baseline; `AGENT-LAUNCH-REVIEW.md:30` says the heading's total stays the
   snapshot's. Each now depends on the comparison shown (its *from* tree, its
   file count).
5. **Duplicated journeys.** `tests/story-review-since.spec.ts:91` and
   `tests/story-review-comparison.spec.ts:155` both open a marked story with
   no later change; `story-review-since.spec.ts:182` and
   `story-review-comparison.spec.ts:177` both open an unmarked story.

## Direction

Established structure supports the work; no North Star topic applies and none
is added. Reuse throughout (PFE): the one restatement in
`server/storyReviewSince.ts`, the one snapshot answer, the client's
per-file *from* tree (`includesTrunkFrom ?? comparison.from`), and the
existing mark statement (`MarkStatement` in `src/StoryReviewMark.tsx`).

- **Unchanged baseline needs no restatement.** When `mark.baseline ===
  baseline`, the *from* tree is `mark.tree` and nothing is flagged, without
  running `merge-tree`. Plan 245 proved and this plan re-observed that
  restating on the same baseline yields the marked tree.
- **A restatement that fails is not a conflict.** Only exit 1 whose first
  field is an object ID is a conflicted result. Any other failure answers
  the mark as not comparable across trunk, the way an unreadable mark is
  answered: `since` absent, all changes shown, no switch, Mark reviewed
  offered. A call aborted by the response signal still rejects. The answer's
  `markUnreadable: true` becomes one field naming why the earlier review
  cannot be compared, `markUncomparable: "unreadable" | "not-restated"`, so
  the client keeps one rule for “all changes, no switch”.
- **A conflicted file kept as marked runs from the baseline.** A conflicted
  name whose diff from `mark.tree` is empty is listed from `baseline`: its
  kind from `baseline` to the snapshot, `includesTrunkFrom: baseline`, so it
  is flagged and its diff shows what the story's version does to trunk's
  change. The file endpoint already diffs any two trees.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| A non-conflict restatement failure fails the whole review and leaves no Mark reviewed (slice 1) | Read `storyReviewSince.ts` (`exitedOne` tolerates only code 1, else rethrows), `storyReviewSnapshot.ts:151-177` (`changesSinceReview` inside the `try` whose `catch` answers `unavailable`), `StoryReviewPanel.tsx:91,177` (mark controls only for `kind === "snapshot"`). |
| A `git` wrapper on the dashboard server's PATH replaces Git for the server's calls and can fail only `merge-tree` (slice 1) | Throwaway: a `bin/git` shell script exiting 128 with “fatal: <tree> is not a commit” for `merge-tree` and `exec /usr/bin/git "$@"` otherwise; `PATH=bin:$PATH node -e 'execFile("git", …)'` → code 128 with that message for `merge-tree`, “git version 2.50.1” for `--version`. `server/gitRunner.ts` calls `execFile("git", …)` with the server's environment. |
| The story-review specs can put a directory first on the server's PATH (slice 1) | `tests/support/dashboardServer.ts` `startDashboardServer({ pathPrefix })` puts it ahead of the harness binaries; `tests/dashboardTest.ts` exposes `pathPrefix` as an option, but `tests/support/preparationPage.ts`'s `dashboard` fixture, which the story-review specs use, does not pass it — slice 1 passes it through. `merge-tree` is called nowhere else in `dashboard/server` (search). |
| Restating on an unchanged baseline yields the marked tree (slice 1 shortcut) | Throwaway, Git 2.50.1: tree `T` with an added file over commit `B`; `git merge-tree --write-tree --name-only -z --merge-base=B T B` printed `T`. |
| A conflicted file the story resolved back to its marked content is named conflicted, has no diff from the marked tree, and differs from the current baseline (slice 2) | Throwaway, Git 2.50.1: story changes `c.ts` line 2 to `c story` (marked tree `MT`), trunk to `c trunk`; the story merges trunk keeping `c story`. `merge-tree … --merge-base=B0 MT B` named `c.ts` conflicted; `git diff --name-status MT <snapshot> -- c.ts` printed nothing; `git diff <baseline> <snapshot> -- c.ts` printed `-c trunk` / `+c story`. |
| The since, since-trunk, and comparison journeys run locally (all slices) | `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=line story-review-since story-review-comparison` → 13 passed (11.6s). |
| Next free plan number | `.planning/slice-plans/` and `git log --all --diff-filter=A --name-only -- '.planning/slice-plans/*/PLAN.md'` end at 250 (246 is not allocated in any ref or worktree); 251 was free. |

## Outside-in proof

Playwright journeys in `dashboard/tests/` against real worktrees, run as
`npx playwright test --config dashboard/playwright.config.ts <spec>` with
`NODE_ENV` unset. Each slice also runs `story-review` (all `story-review*`
specs) and `npm run typecheck:dashboard`, as plan 245 did, because the
journeys do not typecheck the sources. Each behavior slice updates
`dashboard/AGENT-LAUNCH-REVIEW.md` for what it changes.

| Correction outcome | Slice |
| --- | --- |
| Git that cannot restate: review still opens on all changes, says why, and marking recovers | 1 |
| Unchanged baseline compares without restating | 1 |
| Conflicted file kept as marked stays listed and flagged, diffed from the baseline | 2 |
| Empty since-the-review after trunk says so relative to trunk; landed slice still not listed | 3 |
| Stale descriptions corrected; duplicated journeys merged with their assertions kept | 4 |

## Ordered slices

### 1. Keep the review whole when Git cannot restate the mark
Type: Behavior
Status: done
Accepted proof: `story-review-since-trunk.spec.ts` "a Git that cannot
restate the mark shows all changes, says why, and marking starts again"
(`olderGit` wrapper failing only `merge-tree`), the unreadable assertion in
`story-review-since.spec.ts`, all `story-review` specs (41), three other
`preparationPage` users (17), and `typecheck:dashboard`. Run under the
original story's claim on its branch: admission refused this workspace.
Proof: In `story-review-since-trunk.spec.ts`, a test whose dashboard has a
`git` wrapper first on its PATH that fails `merge-tree` as Git before 2.45
does (exit 128, “is not a commit”) and passes every other call to the real
Git (`preparationPage.ts`'s `dashboard` fixture passes `pathPrefix`). (a)
Mark, integrate trunk, change `src/b.ts`, reopen: the answer is a snapshot
with `markUncomparable: "not-restated"` and no `since`; the review lists all
changes, says the earlier review cannot be compared across trunk's changes
on this Git, offers no Comparison switch, and offers Mark reviewed. (b) Mark
reviewed, change `src/b.ts` again, reopen under the same wrapper:
since-the-review lists only `src/b.ts`, proving the unchanged-baseline path
runs no `merge-tree`. The existing unreadable-mark test asserts
`markUncomparable: "unreadable"`. Story-review specs and typecheck green.

Behavior: A marked story integrated trunk and this machine's Git cannot
restate the mark → Review changes → all changes are shown with why the
earlier review cannot be compared, and Mark reviewed starts again from there;
with an unchanged baseline, since-the-review needs no restatement.

### 2. Keep a conflicted file the story kept as marked
Type: Behavior
Status: done
Accepted proof: `story-review-since-trunk.spec.ts` "a conflicted file the
story kept as marked is flagged and diffed from the baseline" (failed against
the previous `storyReviewSince.ts`), all `story-review` specs (42), and
`typecheck:dashboard`. The trunk fixture lives in
`tests/support/storyReviewTrunk.ts`.
Proof: In `story-review-since-trunk.spec.ts`, the story resolves `src/c.ts`'s
conflict back to its marked content (`c story`) and changes nothing else:
since-the-review lists `src/c.ts` flagged as including trunk's changes, with
`includesTrunkFrom` equal to the snapshot's baseline; its diff shows
`-c trunk` / `+c story`; the review does not say nothing changed. The
existing trunk test (`src/c.ts` diffed from the marked snapshot) stays green.
Story-review specs and typecheck green.

Behavior: Trunk and the story changed the same lines and the story kept its
marked version → Review changes → the file is listed, flagged, and its diff
shows the story's version against trunk's.

### 3. Say nothing changed relative to trunk after trunk was integrated
Type: Behavior
Status: done
Accepted proof: `story-review-since-trunk.spec.ts` "after trunk was
integrated with nothing else, nothing changed since the review beyond what
trunk holds" (failed without the view change), all `story-review` specs
(43), and `typecheck:dashboard`. The message is "Nothing changed since the
review beyond what trunk now holds."; `trunkIntegratedSince` in
`src/storyReview.ts` is the one client rule for a trunk integration.
Proof: In `story-review-since-trunk.spec.ts`, mark; trunk takes the landed
slice and changes `README.md` only; the story merges trunk without conflict
and changes nothing else: since-the-review lists no file (not
`landed.txt`, key example (d)), says trunk was integrated, and its empty
message qualifies the claim by what trunk now holds instead of the bare
“Nothing changed since the review.” The unchanged-baseline nothing-changed
journey keeps the bare message. Story-review specs and typecheck green.

Behavior: Trunk was integrated since the mark and nothing else differs →
Review changes → the review says nothing changed since the review beyond
what trunk now holds.

### 4. Bring the review's descriptions and journeys in line
Type: Structure
Status: done
Accepted proof: `story-review-since`, `-since-trunk`, and `-comparison`
went from 16 to 14 tests, all passing; all `story-review` specs (41) and
`typecheck:dashboard` green. Both merged journeys live in
`story-review-comparison.spec.ts`. The file-diff query keeps the name
`baseline` for the *from* tree, documented rather than renamed.
Proof: The four `story-review-since*`/`story-review-comparison` specs pass
with two fewer tests; the merged nothing-changed test still asserts empty
`since.files`, the since-the-review heading, the nothing-changed text, no
changed-file list, the switch to all 12 files, and “This snapshot is marked
reviewed,”; the merged unmarked test still asserts no `since`, 12 files, no
“since the review” text, no `<time>`, and no switch or radio. Typecheck green.

Correction: the stale descriptions of finding 4 mislead maintainers about
which tree a file diff compares from and what the heading counts; rewrite
them to the comparison shown. The duplicated journeys of finding 5 cost two
dashboard starts for no extra coverage; keep one of each pair with the union
of their assertions and update both spec headers. No behavior changes.

## Current decisions

- The not-restated degradation is the unreadable mark's degradation with its
  own reason; neither changes what Mark reviewed stores.
- A conflicted file's `includesTrunkFrom` is its *from* tree: the marked
  tree, or the baseline when the story kept its marked content.
- Final user-facing wording for slices 1 and 3 is the executor's within the
  ADR 0001 vocabulary; the proofs assert it exactly once chosen.
