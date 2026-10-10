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

<a id="review-uncommitted-changes"></a>

### Review only a story's uncommitted changes

**Identity:** SEED-088#review-uncommitted-changes
**Slice plan:** [The full story review can leave uncommitted changes out](../slice-plans/293-leave-uncommitted-changes-out-of-review/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/293-leave-uncommitted-changes-out-of-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"54a56c80859919b52df1c7ca3366355aa967b712bed620600bdb229bedd0138d","plan":"334d9b9906030c938b0641bfc2eefda944375084703759f669c530e8dba13a03"}}
```

**Goal:** A developer reviewing a Story Branch Mode story's worktree from the
dashboard can leave its uncommitted changes (staged, unstaged and untracked)
out of the full review, so they can read what the agent has committed apart
from the work still in progress.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md), whose snapshot
already combines commits with uncommitted files, and on the
[Commits comparison](../../dashboard/STORY-REVIEW-COMMITS.md), whose
Uncommitted changes item is already the uncommitted-only view of any
workspace the review reads (Terry, 2026-10-08). The user is the developer at
the dashboard on the machine that holds the story's worktree, checking an
agent's work while it is still being written.

Required:

- While All changes is shown and the snapshot holds uncommitted changes, the
  review offers a check, “Include uncommitted changes”, on at every opening.
  Turned off, the file browser, counts, total, diffs and file moves compare
  the baseline with the head's tree, the same snapshot's committed work, and
  the review says uncommitted changes are left out. Turning it on again shows
  the whole snapshot without reading anew.
- The check is one more comparison of the snapshot shown: it takes no new
  snapshot and fetches nothing. Refresh keeps its state while the new
  snapshot still holds uncommitted changes; switching to another comparison
  and back keeps it; closing and opening starts with it on.
- Without uncommitted changes there is nothing to leave out and no check, as
  Commits lists no Uncommitted changes item then. Once the agent commits and
  Refresh finds none, the check goes and All changes shows the whole snapshot.
- Mark reviewed still marks the whole snapshot, as it does in Commits, and the
  review says so while the check is off, so a developer does not take
  unseen work in progress for unmarked.

Deferred, not built or verified here:

- Marking only the committed work reviewed, and the check in Since the review
  or on a landed comparison.
- Remembering the check's state across openings or stories.
- A Trunk Mode story's uncommitted changes: its worktree is first named by
  the [sibling story](#review-trunk-mode-story-worktree), after which the
  Uncommitted changes item in Commits is expected to show them.

**Key examples:**

- A Story Branch Mode story's worktree holds three commits changing `a.ts` and
  `b.ts`, an unstaged edit to `b.ts`, and an untracked `c.ts` → the developer
  opens Review changes on All changes → three files are listed, the check
  “Include uncommitted changes” is on, and `b.ts` shows the committed and the
  unstaged edit together.
- The same review → the developer turns the check off → `a.ts` and `b.ts` are
  listed, `b.ts` with its committed lines only and the counts to match,
  `c.ts` is gone, the total reads two files, and the review says uncommitted
  changes are left out; the selection stays on `b.ts`. Had `c.ts` been
  selected, the first file is selected instead.
- The check is off and the agent has since committed `c.ts` and kept editing
  `b.ts` → Refresh → the check stays off and `a.ts`, `b.ts` and `c.ts` are
  listed as committed.
- The check is off and the agent has since committed everything → Refresh →
  no check is offered and All changes lists the whole snapshot.
- The worktree holds only uncommitted work, no story commit yet → the
  developer turns the check off → the review says nothing is committed yet
  and lists no files; the check stays to turn back on.
- The check is off → the developer activates Mark reviewed → the whole
  snapshot, `c.ts` and the unstaged edit included, is marked, and the review
  says so before and after.
- A clean worktree with commits → Review changes → All changes shows no check.

**UI:** The check belongs with the review's marking controls in its fixed top,
shown only for All changes. Its state is conveyed by the control itself and by
a line in words, not by a missing file alone, because a developer who forgets
it is off would otherwise read the committed work as everything.

**Architecture:** The committed work is one more comparison of the snapshot
shown, carried with it as the changes since the review are: the snapshot
answers the files from the baseline to the head's tree whenever that tree
differs from its own, and file diffs use the existing file read. Nothing new
is admitted and toggling reads nothing. Set aside: answering the check
through the range read, which would make each toggle a pending read, and
making the check the snapshot's extent, which would add an extent to the
snapshot request, the mark and the range list. No Accepted ADR applies.

<a id="review-trunk-mode-story-worktree"></a>

### A Trunk Mode story started outside the dashboard offers Review changes

**Identity:** SEED-088#review-trunk-mode-story-worktree
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer on the machine where a Trunk Mode story's agent works
can open the story review on that agent's worktree, although no dashboard
launch started it, so they can check its unpublished and uncommitted work in
progress.

**Scope:** The dashboard starts executions only in Story Branch Mode
(`mode: "story-branch"` in `dashboard/server/executionStart.ts` and the launch
record schema), and the review reads only a kept launch record's workspace
(`reviewWorkspaceOf`), so a story started with `--trunk` in a terminal offers
no Review changes. Once its worktree is named, the existing
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md) is expected to serve it
unchanged: the local branch sits on trunk after each publication, so All
changes is the unpublished commits plus the uncommitted files, and Uncommitted
changes in [Commits](../../dashboard/STORY-REVIEW-COMMITS.md) is the
uncommitted files alone. That expectation is a hypothesis; no Trunk Mode
worktree was available to observe. The direction to refine: resolve the
worktree from local Git, matching the agent the story's trunk profile names
with the worktree whose per-worktree author config names that agent
(`workspace-agent-authorship.mjs`), since a Trunk Mode launch from the
dashboard would not cover stories started in a terminal. The Proposed
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
keeps worktree locations in machine-local evidence and the Proposed
[ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md) describes
Trunk Mode's local branch; neither binds. Naming the worktree is also the
first need of [reviewing only the story's own changes](#review-trunk-mode-story-changes).

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

<a id="landing-capture-after-integration-conflict"></a>

### A conflicted Story Branch integration still records its landing

**Identity:** SEED-088#landing-capture-after-integration-conflict
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/294-landing-capture-after-integration-conflict/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fc18198d9e33344a26e99e729e6966413f29ed27a20041b1159a55de6a7b2fe8","plan":"472f44d749bb13fefb68ab79369f9fed384ad41565440486a379dc9ade137ab1"}}
```
**Slice plan:** [A conflicted Story Branch integration still records its landing](../slice-plans/294-landing-capture-after-integration-conflict/PLAN.md).

**Goal:** A developer reviewing a Story Branch Mode story whose trunk
integration met a merge conflict, or whose launch published to trunk again
after integrating, still gets the landed review that
the reviewed story (`SEED-088#review-merged-story-branch-changes`, at
`1d2de5da4b38eb379caa25da45e9254c42949795:.planning/seeds/SEED-088-dashboard-story-code-review.md`) delivers, so
contended stories do not land with an evidence gap. A bounded correction from
that story's execution retrospective; it adds no feature promise.

**Scope:** The `integrate` command publishes a merge the agent resolved by
hand and reports a conflict as a preserved result; the launch instruction and
landing handoff say that a launch's later trunk publications take no landing
context; the removed-worktree gap keeps one inexpensive spec; the landed-run
document and shared test support carry the general name.

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
- Terry's 2026-10-08 request: queue reviewing a story's one-shot change
  (such as a refinement) after it merged to trunk at priority four, and
  reviewing a Story Branch Mode story's changes after they merged at priority
  five.
- 2026-10-10 refinement of the merged Story Branch review: the landed
  one-shot review already captures a fixed delivered pair at publication, but
  only for one-shot launches; Story Branch wrap-up merges the published tip onto
  fetched trunk and retires worktree and branches, so trunk's first-parent line
  becomes the branch's and the pair cannot be reconstructed reliably from history.
  Chosen: capture the integration pair through the same handoff and list it among
  the story's landed runs. Considered and set aside: reconstructing the pair from
  trunk commit messages (fragile, misattributes silently), keeping the branch
  (the baseline, not the branch, is what vanishes), and a repository ref for
  durability beyond launch retention (deferred). The borrowed shape is a
  shipping manifest fixed at hand-over: the record of what was delivered outlives
  the vehicle; the analogy breaks where the manifest exists only on the sending
  machine, so the review stays local launch evidence.
- 2026-10-10 refinement of the uncommitted-changes review (UX/UI and
  architecture focus): the Commits comparison delivered since this story was
  queued already gives the uncommitted-only view, and the dashboard starts no
  Trunk Mode execution, so a Trunk Mode story has no worktree for the review
  to read. Terry agreed to move the Trunk Mode half to its own story, naming a
  Trunk Mode story's worktree, ahead of the Trunk Mode sibling, and to keep
  this story as the Story Branch Mode check: a view of All changes, included
  by default. Set aside: making the check the snapshot's extent, which would
  allow marking committed work alone but would show a mark's uncommitted work
  as removed in Since the review while the check is off.
