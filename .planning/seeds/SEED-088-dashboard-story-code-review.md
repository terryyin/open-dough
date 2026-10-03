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

<a id="review-files-as-folder-tree"></a>

### Browse a review's changed files as a collapsible folder tree

**Identity:** SEED-088#review-files-as-folder-tree
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story sees its changed files organized in
their folder structure rather than as a flat list, and can collapse and expand
folders to focus on one area of a large change. Each file's change kind is
visible at a glance without spending width on words.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review). Folders start
expanded. Added, modified, and deleted files (and renames, if shown) are told
apart by styling, not by status wording; deleted files are distinguishable from
the rest. To be refined: whether single-child folder chains are compacted, and
the exact style per change kind.

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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer who already reviewed a story while its agent kept working
can review only the changes made since that review, so repeated reviews of a
long-running story take less time.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH.md#story-review). To be refined: what marks
a snapshot as reviewed, where that mark is kept on this machine, and how trunk
integration between the two snapshots is shown.

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
- Terry's 2026-10-04 request: capture at the top of the backlog a folder-tree
  view of the review's changed files, expanded by default, with change kind
  (including deletion) shown by style rather than wording to save space.
