---
id: SEED-088
status: active
planted: 2026-10-03
planted_during: Terry's request to capture consolidated story code review in the dashboard
trigger_when: A developer wants to review all changes in a story's worktree from the dashboard
scope: unestimated
---

# SEED-088: Dashboard story code review

## Why This Matters

A developer reviewing a story needs to see its combined result across the
worktree. One dashboard review UI makes the complete change understandable
without piecing together individual commits or session outputs.

## Story

<a id="review-selected-commits"></a>

### Review the combined changes of selected story commits

**Identity:** SEED-088#review-selected-commits
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/277-review-selected-commits/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d051e59114a0ba03695ad3f14e083a1563dcb82eec9c2fe27e64cf1e30df3639","plan":"b0cd7e078cd41f6866ad589bc522c25e7dbbf3a076b892a6c17a52a38e87e1f5"}}
```

**Goal:** A developer reviewing a story in the dashboard can choose a stretch
of the story's own commits, from one commit to another along the story branch,
and see their combined changes in the review's file browser and diff view, with
the trunk changes integrated meanwhile left out. They can examine one part of a
long story, such as the commits of one slice, without the rest of the diff.
The business goal is the same as the review's: a developer understands what an
agent changed before it lands, in less time than reading commits one by one.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md), whose snapshot,
baseline, file browser, diff view, Refresh, and Mark reviewed stay as they are.

Required behavior:

- The snapshot lists the story's commits: the first-parent line from the
  baseline to the workspace's head, newest first, each by its short revision,
  its subject, and when it was committed. A merge commit on that line, by
  which trunk was integrated into the story, is listed and said to integrate
  trunk; the commits on the merge's other side are trunk's and are not listed.
  When the snapshot's tree differs from the head's, **Uncommitted changes**,
  the staged, unstaged, and untracked files, is the newest listed item, so
  the range from the oldest commit to it equals All changes (Terry,
  2026-10-08).
- Whenever the snapshot lists at least one item, the review's Comparison
  offers **Commits** beside Since the review and All changes; an unmarked
  story's review, which today offers no switch, offers Commits and All
  changes.
- The developer chooses a contiguous range of the listed items by its two
  ends; one item alone is a range of one, and a non-contiguous set is not
  offered (Terry, 2026-10-08). The combined changes are what the
  story changed from the state before the range's oldest item to the state at
  its newest item: the diff from the oldest item's first-parent tree to the
  newest item's tree. When the two have different baselines, trunk was
  integrated within the range, and the oldest item's parent tree is restated
  on the newest item's baseline, the merge-base of that commit and the fetched
  `<remote>/<target>`, exactly as the changes since the review restate the
  marked tree. Trunk's changes then stay out; a file trunk and the story both
  changed inseparably is listed and flagged as including trunk's changes, and
  the heading says trunk was integrated within the range.
- The file browser, line counts, diff view, Previous and Next file, and Hide
  and Show files show the range's comparison as they show the other two; each
  file's diff runs from the range's _from_ tree to its _to_ tree, the chosen
  newest commit's tree, or the snapshot's when Uncommitted changes is the
  newest end.
- Refresh keeps the chosen range while the new snapshot still lists both of
  its ends, and otherwise shows the default range. Switching to another
  comparison and back keeps the chosen range.
- A range whose combined changes are empty, such as a clean trunk-integration
  merge alone, says that the chosen commits changed nothing.
- When this machine's Git cannot restate (before 2.45), a range spanning a
  trunk integration says the review cannot leave trunk's changes out across
  it and lists no files; a range that spans none needs no restating and shows
  as usual.
- Mark reviewed marks the whole snapshot shown whichever comparison is shown,
  as it does today, and every opening still starts on the changes since the
  review for a marked story.

Draft refinement defaults, open to change in planning: the default range when
Commits is first shown is the newest listed item alone; a range's heading names
how many commits it holds and its two ends; and merge commits stay in the list
so the developer sees where trunk came in.

Deferred promises, not rejections: choosing a non-contiguous set of commits;
per-commit diffs within a range; commit authors and bodies; remembering the
chosen range across openings; relating listed commits to slices or plans;
listing a Trunk Mode story's commits already on trunk
([Trunk Mode story's own changes](#review-trunk-mode-story-changes)); the
uncommitted-only view of a Trunk Mode story and the full review's check
([uncommitted changes](#review-uncommitted-changes)).

Rejection constraints, each justified by an existing review requirement in
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md): trunk's changes are
never listed as the story's; requests name the project, the work identity,
and object IDs, never a filesystem path; the review reads only, touching no
index, worktree, or ref.

Boundary assumptions: the list starts at the baseline, so the story's commits
already on trunk are not listed. Story Branch Mode integrates trunk by merge
([Proposed ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md),
Dough Land's practice), so integrations appear as first-parent merge commits;
Trunk Mode rebases, so its unlanded line is linear and needs no restating.

**Key examples:**

1. A story branch holds six commits after the baseline, none a merge, and
   nothing uncommitted → the developer chooses Commits → the six are listed
   newest first; the newest is the range, its files fill the browser, and the
   heading names that one commit.
2. The same list → the developer chooses the second-oldest commit, then the
   fourth → the range holds three commits; the files, counts, and every diff
   run from the oldest chosen commit's parent tree to the fourth commit's
   tree.
3. The line reads A, then a merge M that integrated trunk, then B → the
   developer chooses A and B → A's parent tree is restated on B's baseline and
   compared with B's tree, so only the story's changes are listed; the heading
   says trunk was integrated within the range; a file trunk and the story both
   changed inseparably is listed from A's parent tree and flagged as including
   trunk's changes.
4. The developer chooses M alone → a clean integration says the chosen
   commits changed nothing; one that resolved a conflict lists only the
   resolved file, flagged.
5. The agent commits while the range is shown → Refresh lists the new commit
   on top and keeps the chosen range. The oldest chosen commit is no longer
   listed, say because it reached trunk → Refresh shows the default range.
6. Git on this machine is older than 2.45 → a range spanning M says the
   review cannot leave trunk's changes out across the integration and lists
   no files; a range wholly below M shows as usual.
7. A marked story's review → opens on Since the review and offers Commits;
   Mark reviewed while Commits is shown marks the whole snapshot; the next
   opening starts on Since the review again.
8. The branch holds three commits and the agent has edited two files
   without committing → Uncommitted changes is listed above the three;
   chosen alone it lists those two files from the head's tree to the
   snapshot's; chosen with the oldest commit it lists what All changes
   lists.
9. A snapshot with no commit after the baseline and nothing uncommitted →
   Commits is not offered, and the review shows “No changes” as today.

**UI:** The user is the developer who opened Review changes from a story's
card, usually to check an agent's work before it lands; in a long story, they
want one slice's commits, or the commits since they last looked, without the
whole diff. What they see: with Commits chosen, the story's commits listed
newest first, each with its short revision, subject, and time, a merge saying
it integrated trunk, Uncommitted changes on top while there are any, and the
range's two ends shown as chosen with the items between them. They choose a range by activating one item and then another, by
pointer or keyboard; activating one item alone shows that commit, and the
heading above the diff names the range so a range chosen by mistake is
visible at once. The feedback the review already gives, reading, refreshing,
problem messages, and the trunk-was-integrated heading, applies to the range.
Where the interaction could confuse: a range whose newest end is not the
snapshot shows fewer changes than All changes, which the heading's named ends
explain; a merge commit chosen alone usually shows nothing, which the
“changed nothing” message explains. No layout, component, or technology is
chosen; where the list sits relative to the file browser is execution's.

**Decisions (Terry, 2026-10-08):** the range is chosen by two ends on the
first-parent line, with any set of commits deferred, because two ends give one
definite tree-to-tree comparison that reuses the restatement, while a set would
replay non-adjacent commits with conflicts and no tree Git already holds; and
Uncommitted changes is the newest listed item, since it costs no new read and
lets the list account for the whole snapshot. The second gives Story Branch
Mode the uncommitted-only view, so
[Review only a story's uncommitted changes](#review-uncommitted-changes) now
keeps only the Trunk Mode work tree and the full review's check.

**Borrowed mechanism:** Video editing's in and out points on a timeline:
the editor marks an in point and an out point on an ordered sequence of
frames and gets the clip between them, and the playhead stands at the current
frame. The frames map to the first-parent commits, the playhead to the
snapshot, the in and out points to the range's two ends, the clip to the
combined changes, and a named marker on the timeline to the review mark. The
adaptation: two activations choose the range, one activation is a range of
one, and either end can be moved. The analogy breaks consequentially at the
merges: a timeline has one composited track, so a clip holds every layer
between its points, while here trunk's integrations are a second source
interleaved into the line whose content must be left out, which the
restatement does and the analogy says nothing about; and a clip is the
frames themselves, while the combined changes are the difference between the
states at the two ends, which is why a merge commit alone shows nothing. The
analogy is a candidate, not evidence that the interaction suits reviewing.

**Architecture:** The story adds two responsibilities to the review and moves
none. The snapshot carries the first-parent commit list, read once with the
snapshot (`git log --first-parent` from the baseline to the head) so the list
and the files come from one observation. A range comparison request names the
project, the work identity, and the two ends' commit object IDs, admitted
like a file diff's object IDs
(`dashboard/server/storyReviewAdmission.ts`); the server resolves each end's
tree and baseline and restates the _from_ tree when the baselines differ. The
restatement in `dashboard/server/storyReviewSince.ts` is this same operation
with the mark as its _from_ point, a tree and the baseline it was compared
with, and the snapshot as its _to_ point, so planning should generalize the
_from_ and _to_ points rather than write a second restatement; the file diff
request already names arbitrary _from_ and _to_ trees. Observed 2026-10-08 on
this repository's merge `b5b7de82` (Git 2.50.1): restating the story side's
tree with its merge-base onto the trunk side and diffing against the merge's
tree left one file, `DearDough.md`, whose conflict the merge resolved, while
the plain diff from the story side listed 118 files. The same observation
found a hazard the plan must handle: a merge driver configured for
`.planning/PRODUCT-BACKLOG.md` prints its message to standard output, where
`merge-tree` prints its tree, so the first field was not an object ID; the
existing parser then answers `not-restated`, as if Git were too old. The range
comparison, and the since-the-review restatement it shares, must find the tree
object ID among the fields rather than require it first. Qualities depended
on: one bounded snapshot read, Git 2.45 or later for restating, and the
read-only review. This is feature design kept here under
[ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md);
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one cohesive comparison mechanism over a parallel one, and no
Accepted decision conflicts. Proposed
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
and [ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md) inform
the boundary assumptions above and bind nothing.

<a id="review-uncommitted-changes"></a>

### Review only a story's uncommitted changes

**Identity:** SEED-088#review-uncommitted-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer on the machine where a Trunk Mode story's agent works
can review only the changes still uncommitted in its work tree (staged,
unstaged and untracked), so they can check work in progress before it is
committed. In Story Branch Mode, the full review also offers a check to
include or leave out the work tree's uncommitted changes.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md), whose snapshot
already combines commits with uncommitted files. Story Branch Mode's
uncommitted-only view is the Uncommitted changes item of
[selected commits](#review-selected-commits) (Terry, 2026-10-08), so this
story keeps the Trunk Mode view and the check. To be refined: which work tree
a Trunk Mode story names, how its uncommitted-only view is chosen, and the
check's default.

<a id="review-trunk-mode-story-changes"></a>

### Review only a Trunk Mode story's own changes

**Identity:** SEED-088#review-trunk-mode-story-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story executed in Trunk Mode, whose commits
are continuously merged or rebased onto `origin` trunk, can review only the
changes that story's agent made, even when its commits are interwoven with
other people's commits on trunk.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md); the merge-base
baseline shows nothing once the story's commits are on trunk. To be refined:
how the story's commits are recognized on trunk, whether only its changes can
be highlighted when other commits touch the same files, and how this combines
with reviewing only what changed since the last review. Today
since-the-review treats everything between the marked baseline and the
current one as trunk's, so story work that reaches trunk after the mark is
left out and an otherwise empty review says nothing changed beyond what trunk
now holds; recognizing the story's own commits there would let it list them.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture this story at the top of the backlog;
  consolidate all worktree changes into one dashboard code review with a
  toggleable changed-file browser and a code diff view.
- 2026-10-03 refinement: Terry asked for the narrowest scope that delivers the
  review. The model is GitHub's pull request changed files view and
  IntelliJ's combined review of several commits. Terry chose the unlanded-vs-trunk
  baseline, a snapshot with Refresh, and the latest launch's worktree.
- [Dough Land](../../src/skills/dough-land/SKILL.md) computes a landing baseline
  from the accepted SHA, the starting revision, or the merge-base. The review
  uses only the merge-base, because trunk merges into a published story branch
  would make a starting-revision baseline show trunk changes as story changes.
- `dashboard/server/defaultCheckoutChanges.ts` already reads the default
  checkout's changed paths with `git status`.
- Terry's 2026-10-05 request: queue reviewing a story's uncommitted
  changes (with a Story Branch Mode check to include them) at priority three,
  and reviewing only a Trunk Mode story's own changes at priority four.
- 2026-10-05 refinement of since-the-last-review: Terry chose an explicit Mark
  reviewed, opening on since-the-review with a switch to all changes, and
  listing a file that trunk and the story both changed with a flag. Leaving
  trunk's changes out borrows finance's constant-currency comparison: restate
  the earlier figure at today's rate, then compare. Here the marked snapshot
  is restated on today's baseline and compared with the current snapshot.
  Observed on Git 2.50.1: `git merge-tree --write-tree --merge-base=<marked
  baseline> <marked tree> <current baseline>` gives that restated tree, exits
  1 and names the files it could not merge, and a ref can hold a bare tree
  through `git gc --prune=now`. Unlike a currency rate, a restatement can
  conflict, which is why an overlapping file is flagged instead of separated.
- 2026-10-08 refinement of selected commits: the range is the first-parent
  line's two ends, restated across trunk integrations as since-the-review
  restates the mark. Observed on merge `b5b7de82`: the restated-side diff
  left one conflict-resolved file where the plain diff listed 118. The
  product-backlog merge driver prints to standard output inside
  `merge-tree`'s output, which the existing restatement misreads as
  `not-restated`. Terry chose two-ended ranges and Uncommitted changes as a
  listed item, narrowing the uncommitted-changes story to Trunk Mode and the
  check.
