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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story can choose a range of the story's commits
in the review and see their combined changes in the same review UI, as
IntelliJ's history review allows. This lets them examine one part of a long
story without the rest of the diff.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review). To be refined: how the
developer selects the range, and how trunk-integration merge commits in the
story's history are handled.

<a id="review-changes-since-last-review"></a>

### Review only what changed since the last review

**Identity:** SEED-088#review-changes-since-last-review
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/245-review-changes-since-last-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e063f91b09a80daa9b2f7f375faea769c1c16c63ae91639aff29eb96fbf67527","plan":"f367a441fbe803e69b5226bdc99a7f98a3e3975036e836a458e9af66e9b869f0"}}
```

**Goal:** A developer who already reviewed a story while its agent kept working
can review only the changes made since that review, so repeated reviews of a
long-running story take less time. The developer decides when a review counts;
the review never hides a change they have not marked as seen.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review).

- **Mark reviewed.** The review offers **Mark reviewed**, which marks the
  snapshot shown, whether it shows all changes or the changes since an earlier
  mark. What the agent wrote after that snapshot was taken stays unmarked.
  Opening, closing, refreshing, or replacing the review marks nothing. A story
  has one mark; marking again replaces it. The review then says the snapshot
  is marked and when.
- **Since the review.** With a mark, Review changes opens on the changes from
  the marked snapshot to a fresh one, headed by what it compares and when the
  mark was made, in the same file browser and diff view. The developer can
  switch to all changes against trunk and back within one snapshot; every
  opening starts on since-the-review. Refresh keeps the comparison shown.
  Without a mark, the review opens as it does today.
- **Nothing since.** When the fresh snapshot equals the marked one, the review
  says nothing changed since the review and still offers all changes.
- **Trunk integrated in between.** When trunk was merged into the story after
  the mark, changes that came only from trunk stay out, as they do in the full
  review. A file that both trunk and the story changed in a way that cannot be
  separated is listed and flagged as including trunk's changes; its diff runs
  from the marked snapshot to the current one, so no story change is hidden.
  The review says when trunk was integrated since the mark.
- **Where the mark lives.** The mark belongs to the project and story on this
  machine, in the dashboard's local records, and outlives a dashboard restart
  and Git's housekeeping while the story's repository exists. It stays out of
  the repository's tracked files, the workspace's index and status, and other
  machines. When the marked snapshot can no longer be read, the review says so
  and shows all changes.

Deferred: per-file viewed marks; clearing a mark without replacing it; showing
on the story's card that changes are waiting since the review; a history of
earlier marks; sharing a mark between developers or machines.

**Key examples:**

- A story's review shows 12 changed files → the developer chooses Mark
  reviewed → the agent changes 2 of them and adds 1 → Review changes opens on
  3 files, headed as changes since the review at its time, each diff showing
  only what changed after the mark.
- The agent writes a file after the snapshot was taken, and the developer
  marks that snapshot without Refresh → the next review lists that file.
- The developer opens the review, reads half, and closes it → the next opening
  shows what it showed before; nothing was marked.
- Since-the-review shows 3 files → the developer switches to all changes →
  the same snapshot lists all 13 → switching back shows the 3 again.
- A marked story with no later change → Review changes says nothing changed
  since the review and offers all changes.
- After the mark, the agent merges trunk, which changed `README.md` and
  `src/a.ts`; the story then changed `src/b.ts` → since-the-review lists only
  `src/b.ts` and says trunk was integrated since the mark.
- After the mark, trunk and the story both changed the same lines of
  `src/c.ts` → `src/c.ts` is listed, flagged as including trunk's changes, and
  its diff runs from the marked snapshot to now.
- The marked snapshot cannot be read, for example the project was cloned anew
  → the review says the earlier review cannot be compared and shows all
  changes; Mark reviewed starts again from there.
- The developer marks in since-the-review → the mark is the whole current
  snapshot, and the next review compares with it.

<a id="review-uncommitted-changes"></a>

### Review only a story's uncommitted changes

**Identity:** SEED-088#review-uncommitted-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer on the machine where a story's agent works can review
only the changes still uncommitted in its work tree (staged, unstaged and
untracked), so they can check work in progress before it is committed,
whether the story runs in Trunk Mode or Story Branch Mode. In Story Branch
Mode, the full review also offers a check to include or leave out the work
tree's uncommitted changes.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md), whose snapshot
already combines commits with uncommitted files. To be refined: how the
developer chooses the uncommitted-only view, the check's default, and which
work tree a Trunk Mode story names.

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
with reviewing only what changed since the last review.

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
