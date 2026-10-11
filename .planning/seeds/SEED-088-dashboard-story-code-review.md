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

<a id="resolved-integration-survives-reruns"></a>

### A resolved integration survives a failed or early rerun

**Identity:** SEED-088#resolved-integration-survives-reruns
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/295-resolved-integration-survives-reruns/PLAN.md","assessment":"not-ready","reasons":["Slice 3's decision to take only a trunk-first merge narrows what plan 294 delivered; the developer has not confirmed it.","Slice 1's receiver journey assumes a spec can close and restart the real receiver on the same launch record; that restart was not run in story-branch-landing-conflict.spec.ts's fixtures."],"basis":{"document":"b1defacb96aa5c7b63f1f88dacab5001460956599c4f007310b36ac6a69fa12a","plan":"1328c55bbb03f9b700f68ec2bf5f376226a8e1e89c9d98ecc75d14edb0c78246"}}
```
**Slice plan:** [A resolved integration survives a failed or early rerun](../slice-plans/295-resolved-integration-survives-reruns/PLAN.md).

**Goal:** An agent that resolved a conflicted Story Branch integration by hand
keeps that resolution when the integration command is run again early or
fails before its push, so the story still lands with its landed review. A
bounded correction from the execution retrospective of
`SEED-088#landing-capture-after-integration-conflict`; it adds no feature
promise.

**Scope:** The `integrate` command keeps a resolved merge in the workspace
when landing retention fails, reports an uncommitted merge as a preserved
result, and takes only the merge it stopped, trunk first; the guidance names
those states; the conflict proof's duplicated fault seam and repeated
assertions go.

<a id="found-worktree-matches-published-agent"></a>

### A found worktree is reviewed only for the agent trunk publishes

**Identity:** SEED-088#found-worktree-matches-published-agent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/297-found-worktree-matches-published-agent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7fbb4649fd07956eb922d4ce8eed74ad3bba4726eaf44296f2a752eebbe1efcb","plan":"d2b3be0d99807cf53466c17677abd4ff4bcf5cb3ab30743bff845daefd2e570a"}}
```
**Slice plan:** [A found worktree is reviewed only for the agent trunk publishes](../slice-plans/297-found-worktree-matches-published-agent/PLAN.md).

**Goal:** A developer reviewing a story that another agent held earlier on
this machine gets the review of the worktree of the agent that holds it now,
although the earlier agent's worktree is still listed at its old claim. A
bounded correction from the execution retrospective of
`SEED-088#review-trunk-mode-story-worktree`; it adds no feature promise.

**Scope:** The local worktree scan counts a worktree for a story only while
trunk, as the project's checkout last fetched it, publishes that worktree's
author as the story's agent; the workspace doc states it; the two-agent
wording of the ambiguity, which nothing then reaches, goes.

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
- 2026-10-11 refinement of the Trunk Mode worktree story: a fixture Trunk
  Mode claim showed the owned worktree listed by `git worktree list` from the
  integration checkout with its local execution branch, its per-worktree
  `author.name` set to the agent, its profile's `branch` recording
  `origin/main`, and its head equal to `origin/main` right after
  publication, so the merge-base baseline leaves only unpublished commits and
  uncommitted files in All changes. Chosen: resolve the worktree on the local
  boundary by agent authorship and the story's claim, offer Review changes only
  where a worktree is found, and explain rather than guess between several.
