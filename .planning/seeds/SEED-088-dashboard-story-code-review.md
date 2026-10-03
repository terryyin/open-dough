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

<a id="dashboard-story-code-review"></a>

### Review all story worktree changes in one dashboard UI

**Identity:** SEED-088#dashboard-story-code-review
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/226-dashboard-story-code-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"34e411bab7d122e251c9b363cbef0415dc04913b10db418af4205eb6d7b8b244","plan":"b7be067bba34b2aeb599654ce79b67df4a37b9aea48da7802c858bcf13a19718"}}
```

**Goal:** A developer overseeing an agent's story can open, from the story in
the dashboard, one read-only review of what the story's worktree would add to
trunk right now, so they can understand and judge the story's combined result
without piecing together individual commits, session output, or the worktree in
another tool. This is the dashboard's equivalent of a pull request's changed
files view.

**Scope:**

- Open the review from the story in the dashboard. It targets the workspace of
  the story's most recent launch record and names that worktree, its branch,
  and the baseline commit it compares against.
- The review compares the worktree as it is now (story commits plus staged,
  unstaged, and new untracked files) with its merge-base against the freshly
  fetched trunk target. Comparing with the merge-base rather than trunk's tip
  keeps trunk changes merged into the story, and other stories' landed work,
  out of the review. Story changes that already landed on trunk drop out.
- The review is a snapshot taken when it opens. A Refresh action in the review
  recomputes it; the file list and diff do not change while the developer reads.
- A changed-file browser lists every changed file with its change kind (added,
  modified, deleted, renamed). The developer can hide or show it. Selecting a
  file shows that file's combined diff, with additions and removals, in the same
  review.
- A file with no textual diff, such as a binary file or a mode-only change,
  says so instead of showing an empty diff.
- The review explains when the worktree has no changes against the baseline,
  when the worktree is missing or retired, and when the story has no launch
  workspace to review.

**Architecture:**

This story starts a chain of review stories and is the dashboard's first read of
a story worktree's local Git state; published progress still comes from GitHub.
It is machine-local operational visibility in the sense of Proposed
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md#durable-project-state-and-local-operational-state):
it adds no project state and decides nothing about the story.

- **Concept: story review.** A fixed snapshot of one local workspace's change
  set against a review baseline: the workspace and branch, the baseline commit,
  the observed head, and each changed file with its change kind and old path for
  a rename. A file diff belongs to a snapshot. Every file diff the developer
  opens comes from the same observation as the file list, not from a later
  worktree state. Refresh makes a new snapshot.
- **Owner and admission.** The local launch boundary
  (`dashboard/server/agentLaunchPlugin.ts` with
  `dashboard/server/agentLaunchAdmission.ts`) owns review requests, because it
  already keeps the launch records that name each story's workspaces. A request
  names the configured project and the work identity. The server resolves the
  workspace, remote, and target from that story's most recent kept launch
  record. A request never supplies a filesystem path, and anything else is
  refused like other unadmitted requests. The browser runs no Git and imports
  no filesystem code.
- **Baseline.** The merge-base of the snapshot's head and the freshly fetched
  `<remote>/<target>` from that record. The review baseline is its own rule
  and is not shared with Dough Land's landing baseline, which also considers the
  accepted SHA and the starting revision.
- **One Git runner in the dashboard server.** Four server modules run Git
  through their own process helpers, each mapping failure differently:
  `defaultCheckoutChanges.ts`, `startGit.ts`, `preparationCleanup.ts`, and
  `projectAddition.ts`. The review reads Git through one shared runner, and
  those four move onto it, each keeping its own failure meaning.
- **One rule for the review workspace.** The page offers the review only
  when the server can resolve it. Both use one shared function that picks a
  story's most recent kept launch record naming a workspace.
- **Growth path.** The later review stories in this seed reuse the snapshot,
  file diff, and review view with another pair of revisions: a selected commit
  range, or the last reviewed snapshot against now. Build none of that here.

**Deferred promises:**

- Selecting a commit range to review its combined changes, as IntelliJ's
  history review allows.
- Reviewing only what changed since the last review, and review comments,
  annotations, or approvals.
- Choosing among a story's older or parallel worktrees.
- Showing whole-story history, including changes that already landed on trunk.
- Reviewing a pushed story branch without its local worktree.
- Live updates while the review is open, side-by-side layout, syntax
  highlighting, and per-file line counts.
- Acting from the review, such as editing files, keeping, or landing.

**Key examples:**

1. A story worktree has three commits, a trunk-integration merge that brought
   in another story's landed changes, a staged edit, an unstaged edit, and a new
   untracked file. Opening its review lists the story's files, including the new
   file as added, and none of the other story's files. Each selected file shows
   its combined change against the baseline.
2. One of the story's slices has already landed on trunk, and its remaining
   commits are not landed yet. Opening the review shows only the unlanded
   changes.
3. The developer selects a changed file and reads its diff, hides the file
   browser to give the code more room, then shows it again and selects another
   file.
4. The developer is reading the review while the agent commits a new edit. The
   review stays as it was. After Refresh, the review includes the new edit.
5. A file was renamed with small edits, another was deleted, and an image
   changed. The browser lists the rename with its old and new paths and the
   deletion, and selecting the image says it has no textual diff.
6. The latest launch's worktree has no changes against the baseline, or it has
   been retired. The review states the situation and names the worktree it
   looked for.

<a id="prove-landed-slices-leave-the-review"></a>

### Prove that a story's landed slices leave its review

**Identity:** SEED-088#prove-landed-slices-leave-the-review
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/228-prove-landed-slices-leave-the-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c956bdcc3a10dcb9018c1c8ef1c7fe9be49d9530b25025de7f0fcfdab96bf400","plan":"32aed28a31fac42e0b214cd41fe356d0b2be1f6c88e50b141325b1187b763ecd"}}
```

- **Goal:** A developer reviewing a story whose earlier slices already landed
  on trunk can rely on a page journey that proves the review shows only the
  unlanded changes. This corrects the delivered story
  [Review all story worktree changes in one dashboard UI](#dashboard-story-code-review)
  (reviewed commits `23eba318..6ff2c450`). Its key example 2 has no observing
  proof. It adds no feature promise.
- **Scope:**
  - Add one review journey in which a story commit is already on fetched
    trunk and a later story commit is not.
  - Assert that the review lists only the later commit's files and that the
    baseline is the landed commit.
  - Keep the merge-base baseline unchanged. A change is in scope only if the
    journey shows that the behavior differs from the story.
- **Plan:** [Plan 228](../slice-plans/228-prove-landed-slices-leave-the-review/PLAN.md)
  holds the findings, proof, and slice.

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
[story worktree review](#dashboard-story-code-review). To be refined: how the
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
[story worktree review](#dashboard-story-code-review). To be refined: what marks
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
