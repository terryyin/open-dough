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
[Commits comparison](../../dashboard/STORY-REVIEW-COMMITS.md) (Terry, 2026-10-08), so this
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

<a id="landing-capture-after-integration-conflict"></a>

### A conflicted Story Branch integration still records its landing

**Identity:** SEED-088#landing-capture-after-integration-conflict
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/293-landing-capture-after-integration-conflict/PLAN.md","assessment":"not-ready","reasons":["Slice 2's premise, that a second comparison after an accepted landing is refused before its push, was read in the code and not observed against the receiver."],"basis":{"document":"f62843df450577c6fa3e62658a987c271f7ad4aca6266d73a6aa34a838151b1a","plan":"524388f483413b137b49fbb141012c919638901a2cfec8ccdf7100ee8f86aa6b"}}
```
**Slice plan:** [A conflicted Story Branch integration still records its landing](../slice-plans/293-landing-capture-after-integration-conflict/PLAN.md).

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
