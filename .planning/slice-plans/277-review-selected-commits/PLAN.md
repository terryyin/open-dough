# Review the combined changes of selected story commits

**Identity:** SEED-088#review-selected-commits
**Source:** [refined story](../../seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits).
**Prepared:** 2026-10-08, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/review-the-combined-changes-of-selected-story-co`
on `claude/review-the-combined-changes-of-selected-story-co`, under the
preparation assignment for `juacompe-chan`. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

A developer reviewing a story in the dashboard chooses a stretch of the
story's own commits by its two ends and sees their combined changes in the
review's file browser and diff view, with the trunk changes integrated
meanwhile left out, so one part of a long story can be examined without the
rest of the diff.

Include the story's required behavior: the snapshot's first-parent commit
list with Uncommitted changes on top while there are any; the **Commits**
comparison beside Since the review and All changes; a contiguous range by two
ends, one item being a range of one; the restatement of the range's _from_
tree across a trunk integration, with inseparable files flagged; the file
browser, counts, diffs, moves, and Hide files on the range; Refresh keeping a
range both of whose ends are still listed; the empty-range message; the
older-Git limit; and Mark reviewed marking the whole snapshot whichever
comparison is shown. The draft defaults from refinement are taken as written:
the newest item alone is the default range, the heading names the range's
count and ends, and merge commits stay listed.

Keep the story's exclusions: a non-contiguous set of commits (Terry deferred
it on 2026-10-08), per-commit diffs within a range, authors and bodies,
remembering a range across openings, relating commits to slices, commits
already on trunk, and the Trunk Mode uncommitted-only view and the full
review's check, which stay with the sibling stories.

## Planning context

The [planning background and evidence](CONTEXT.md) retain the published
baseline, existing-solution findings, decisive observations, and preparation
review supporting this plan.

## Current decisions

- **Points, not commits, cross the boundary.** The range request names two
  `{tree, baseline}` points the snapshot's list supplied, so the server's
  comparison is the restatement's own contract and the Uncommitted changes
  item is simply the point `{snapshot.tree, snapshot.baseline}` with the head's
  tree as its _from_. The server never recomputes what the list said.
- **The range answer is a `ReviewComparison`** (`from`, `files` with
  `includesTrunkFrom`) plus the _to_ tree and whether trunk was integrated
  within the range (`fromBaseline !== baseline`), read through `useReviewRead`
  like the snapshot; a new read for each range, keyed by its points, and a
  read still pending for an earlier range never answers a later one.
- **Choosing ends.** Activating an item while a range of one is shown
  extends the range to it, in either direction; activating an item while a
  range of two or more is shown starts a new range of one at it. Each item is
  a button that says whether it is in the range; the heading names the
  range: how many commits, and its oldest and newest ends by short revision
  and subject, or Uncommitted changes.
- **Empty and unavailable ranges.** No file listed says “The chosen commits
  changed nothing.”; a range the older Git cannot restate across an
  integration says so in the feedback region and lists no files, with the
  wording of the existing `not-restated` statement adapted to the range.
- **The merge-driver fix** (slice 2) reads the tree as the first field that
  parses as an object ID after splitting on NUL and newline, on exit 0 and
  exit 1 alike, and still treats any other exit as not restated.
- **Documentation** follows each Behavior slice in `AGENT-LAUNCH-REVIEW.md`,
  with the request shape in `storyReviewAdmission.ts`'s header comment.

## Outside-in proof ownership

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| 1. Commits lists the first-parent line newest first; the newest item alone is the default range; its files and heading | 1 | New `story-review-commits.spec.ts` on `storyWorktree` |
| 9. No commit and nothing uncommitted: Commits not offered, “No changes” as today | 1 | `unchangedWorktree` case in the same spec |
| Merge-driver output no longer fails or misreports a restatement | 2 | `story-review-since-trunk.spec.ts` case with a printing driver configured on the fixture's `src/a.ts` |
| Since-the-review unchanged after the restatement takes two points | 3 | `story-review-since*.spec.ts`, `story-review-mark.spec.ts`, `story-review-comparison*.spec.ts` green |
| 2. Two ends give three commits diffed from the oldest's parent tree | 4 | `story-review-commits.spec.ts`: files and one diff |
| 3. A range across the merge lists only the story's files, says trunk was integrated, flags an inseparable file | 4 | `markedWorktree` + `integrateTrunk(…, "c story and trunk")` without a mark, range from the first commit to the merge |
| 4. The merge alone: changed nothing, or only the resolved file flagged | 4 | Same spec, the merge as a range of one in both fixtures |
| 6. Older Git: a range across the integration says why and lists none; one below it shows | 4 | The older-Git `pathPrefix` fixture |
| 8. Uncommitted changes on top; alone it lists the staged, unstaged, and untracked files; with the oldest commit it equals All changes | 5 | `storyWorktree`'s three uncommitted files |
| 5. Refresh keeps a range both of whose ends are listed; otherwise the default | 5 | Commit in the worktree, Refresh; then commit the uncommitted files while Uncommitted changes is an end |
| 7. A marked story opens on Since the review, offers Commits, and Mark reviewed there marks the whole snapshot | 5 | `markStoryReview`, switch to Commits, mark, reopen |
| Documentation describes the list, the range, and the request | 1, 4, 5 | `AGENT-LAUNCH-REVIEW.md` wording |

## Ordered slices

### 1. Commits lists the story's commits and shows one commit's changes
Type: Behavior
Status: done
Proof: Add `story-review-commits.spec.ts` on `storyWorktree`: Commits
offered, the list's rows, the default range, its files, and one file diff;
`unchangedWorktree` offers no Commits. Keep `story-review.spec.ts`,
`story-review-mark.spec.ts`, and `story-review-comparison.spec.ts` green.

Behavior: A story's review opens on a snapshot with commits after the
baseline → the developer chooses Commits → the first-parent commits are listed
newest first, each by short revision, subject, and time, the merge saying it
integrated trunk; the newest commit is the range, the heading names it, and
the browser lists the files changed from its parent tree to its tree, each
diff read from those trees. A snapshot with no commit and nothing uncommitted
offers no Commits.

Add the list to the snapshot answer with each item's _to_ and _from_ points;
add the range request and its admission; compare the two points directly
when their baselines are equal, which every single non-merge commit's range
is. The switch is offered to an unmarked story. Uncommitted changes is not
listed yet, and the merge chosen alone is not yet meaningful; both are
slice 5's and slice 4's.

Interim behavior: a range whose points have different baselines is not yet
offered; the list allows only a range of one until slice 4.

Safe stopping point: a developer can read any one commit of a story in the
review.

### 2. A restatement is read even when a merge driver prints
Type: Behavior
Status: done
Proof: Add to `story-review-since-trunk.spec.ts` a case whose fixture
configures a merge driver that prints a line for `src/a.ts` (git config in
the project plus a `.gitattributes` entry) before `integrateTrunk`; the
changes since the review are listed as in the existing case, on the clean and
on the conflicted merge.

Behavior: A marked story merged trunk, and a merge driver configured for a
file both sides changed prints to standard output → the review opens on the
changes since the review as usual; nothing says the earlier review cannot be
compared, and the review is not failed.

Read the tree as the first field that parses as an object ID after splitting
on NUL and newline, on exit 0 and 1; the conflicted names still follow it up
to the empty field. This corrects today's behavior in any project with the
product-backlog merge driver, this one included.

Safe stopping point: since-the-review is reliable where the backlog driver
runs.

### 3. The restatement compares any two points
Type: Structure
Status: done
Proof: `story-review-since*.spec.ts`, `story-review-mark.spec.ts`,
`story-review-comparison*.spec.ts`, and slice 1's spec stay green;
`env -u NODE_ENV npm run typecheck:dashboard`.

Internal change: `changesSinceReview` becomes a comparison of a _from_ point
with a _to_ point (tree and baseline each), restating the _from_ tree on the
_to_ baseline when they differ and flagging inseparable files from the _from_
tree or the _to_ baseline; the mark and the snapshot call it as one pair, and
`markUncomparable` keeps its meaning for the mark. `changedFrom` takes the
_to_ tree instead of closing over the snapshot's. Enables slice 4 without a
second restatement.

### 4. A range by two ends, across a trunk integration, leaves trunk out
Type: Behavior
Status: planned
Proof: Extend `story-review-commits.spec.ts`: a three-commit range's files
and a diff; on `markedWorktree` with `integrateTrunk(…, "c story and trunk")`
and no mark, the range from the first commit to the merge; the merge alone on
both fixtures; the older-Git fixture for a range across the integration and
one below it. Keep slice 1's cases green.

Behavior: The list is shown → the developer activates an item while a range
of one is shown → the range extends to it, in either direction, and the
heading names its count and ends; activating an item while a range of two or
more is shown starts a range of one there. A range whose ends have different
baselines → the oldest item's parent tree is restated on the newest item's
baseline; only the story's files are listed, the heading says trunk was
integrated within the range, and a file both changed inseparably is flagged
and diffed from the parent tree. The merge alone → “The chosen commits
changed nothing.”, or only the file whose conflict it resolved, flagged. An
older Git → a range across the integration says this machine's Git cannot
leave trunk's changes out across it and lists no files; a range below it
shows.

Safe stopping point: the story's promise is delivered for committed work.

### 5. Uncommitted changes is the newest item; Refresh and the mark fit the range
Type: Behavior
Status: planned
Proof: Extend `story-review-commits.spec.ts` on `storyWorktree`: Uncommitted
changes alone and with the oldest commit; a commit in the worktree then
Refresh; committing the uncommitted files while Uncommitted changes is an
end, then Refresh; `markStoryReview`, Commits, Mark reviewed, reopen. Keep
`story-review-refresh.spec.ts` and `story-review-mark.spec.ts` green.

Behavior: The snapshot's tree differs from the head's → Uncommitted changes
is listed above the commits; alone, it lists the staged, unstaged, and
untracked files from the head's tree to the snapshot's; with the oldest
commit, it lists what All changes lists. The agent commits → Refresh lists the
new commit on top and keeps the chosen range; an end no longer listed →
Refresh shows the default range. A marked story → opens on Since the review,
offers Commits with the other two, and Mark reviewed while Commits is shown
marks the whole snapshot, which the next opening compares with.

Safe stopping point: the list accounts for the whole snapshot, and the story
is complete.

## Verification, delivery and sizing

Use the [verification commands, affected consumers, and sizing context](CONTEXT.md#verification-delivery-and-sizing).

## Execution context

- Established execution: `SEED-088#review-selected-commits`, publisher
  `dashboard-territory.local-open-dough`, agent `mrsn-chan`, Story Branch Mode.
- Execution checkout: `/Users/terryyin/git/open-dough/.worktrees/review-the-combined-changes-of-selected-story-co`;
  branch `codex/review-the-combined-changes-of-selected-story-co`, reused.
  Integration checkout: `/Users/terryyin/git/open-dough` (not mutated).
- Starting revision: `5fe225227beb27133884ae6eead899d4d603bc47`.
  Accepted claim: `ed43663be7597ee94709edbbf6f8a0de31eee8fe` on `origin/main`
  and the remote execution branch; first delivery uses this published base.
- Increment target: `origin/refs/heads/codex/review-the-combined-changes-of-selected-story-co`.
- Setup: `env -u NODE_ENV npm ci` and
  `env -u NODE_ENV npm run typecheck:dashboard` passed in this checkout
  with its current lockfile. Check-only staged lint hook; selective formatting
  uses local Prettier on owned changed script/JSON paths. No generation trigger.
- Replanning: existing in-place plan authority retained; no overrun override.
  No numeric slice target or hard limit; boundedness follows the planned
  Behavior/Structure outcome and focused proof.
- Codex CI observer: GitHub Actions, verified `ci.yml` push selector;
  repository `terryyin/open-dough`, target execution branch above, coordinator
  root, checkout above; yielded cell `8`, session `81005`, directory
  `/tmp/dough-ci-501/watch-XlowzV`, PID `35771`. Claim CI on trunk is unobserved;
  this stream covers execution-branch increments.

## Accepted execution evidence

See [accepted proof and deliveries](CONTEXT.md#accepted-execution-evidence).
