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

<a id="review-trunk-mode-story-worktree"></a>

### A Trunk Mode story started outside the dashboard offers Review changes

**Identity:** SEED-088#review-trunk-mode-story-worktree
**Slice plan:** [A Trunk Mode story started outside the dashboard offers Review changes](../slice-plans/296-trunk-mode-worktree-review/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/296-trunk-mode-worktree-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6f377f5576392aeb662c622bf564a95343232bff52f2b5ac3bdb2e4422ef9d84","plan":"9451c762eebeb4a8ba0ab816e0150309cd6e75b795cd041e140891c4f0ff0507"}}
```

**Goal:** A developer on the machine where a Trunk Mode story's agent works
can open the story review on that agent's worktree, although no dashboard
launch started it, so they can check its unpublished and uncommitted work in
progress as they would a launched story's.

**Scope:** Builds on the [story review](../../dashboard/AGENT-LAUNCH-REVIEW.md),
which today offers Review changes only from a kept launch record's workspace
(`reviewWorkspaceOf`), and on the dashboard's local view of the project (its
Local path, [project configuration](../../dashboard/PROJECT-CONFIGURATION.md)).
The user is the developer at the dashboard on the machine that holds the
project's checkout, whose agent took the story with `--trunk` in a terminal:
the dashboard starts no Trunk Mode execution, so this machine keeps no launch
record for it, while the published Taken profile names the agent and records
Trunk Mode ([assignments](../../dashboard/AGENT-ASSIGNMENTS.md)). Terry's
direction (2026-10-10): resolve the worktree from local Git by the agent's
per-worktree authorship (`workspace-agent-authorship.mjs`), which every owned
execution or preparation worktree configures.

Required:

- A Taken card without a launch workspace on this machine offers Review
  changes when the project's local checkout lists a linked worktree whose
  per-worktree author config names the card's agent and that holds this
  story's claim. A worktree the same agent name left from an earlier story is
  not mistaken for this one. When this machine still cannot tell which of
  several worktrees is the story's, Review changes opens a review that says so
  and names them, listing no files, rather than guessing.
- The review opened there is the existing review, unchanged in what it shows
  and does: its snapshot, file diffs, Commits ranges, Refresh, Mark reviewed and
  Since the review all read the one resolved worktree, and the context line
  names its branch and worktree as it does for a launched workspace. The
  baseline is the merge-base of the worktree's head and freshly fetched
  `<remote>/<target>`. A Trunk Mode head sits on trunk after each publication,
  so All changes is the unpublished commits plus the uncommitted files, Commits
  lists the unpublished commits with Uncommitted changes above them, and the
  Uncommitted changes item alone is the uncommitted files.
- A story with a kept launch record naming a workspace keeps reading it as
  today; the local match serves stories without one.
- Without such a worktree on this machine, another machine's dashboard or one
  where the worktree is already retired, the card offers no Review changes, as
  a never-launched story offers none today, and its published progress and
  Inspect story detail stay as they are.

Deferred, not built or verified here:

- Reviewing only the story's own changes once they reached trunk, the
  [sibling story](#review-trunk-mode-story-changes); this story names the
  worktree that sibling also needs.
- Starting a Trunk Mode execution from the dashboard.
- A worktree that is not a linked worktree of the project's local checkout,
  such as one in a separate clone.
- A Story Branch Mode story taken in a terminal: the match reads no mode, so
  such a story is served the same way; this story verifies Trunk Mode only.

**Key examples:**

- Yui-chan holds `SEED-X#story` in Trunk Mode; the project's checkout lists
  `.worktrees/story` authored by Yui-chan, its head one commit past
  `origin/main` with an untracked `notes.md`; this machine has no launch record
  for the story → the Taken card offers Review changes → the review opens on
  All changes listing the commit's files and `notes.md`; Commits lists
  Uncommitted changes above the one commit; the context line names
  `exec/story` and `.worktrees/story`.
- The agent publishes that commit, so the head equals `origin/main`, and
  `notes.md` is still untracked → Refresh → All changes lists `notes.md`
  alone, and Commits offers Uncommitted changes with no commit beneath it.
- The developer activates Mark reviewed, the agent then edits `a.ts` → Refresh
  → Since the review lists `a.ts`, as for a launched workspace.
- The same story seen from another developer's machine, whose checkout lists no
  worktree authored by Yui-chan → the Taken card shows Yui-chan · Trunk Mode on
  Inspect story and no Review changes.
- The checkout also lists a worktree Yui-chan authored for a story closed last
  week, still on that story's claim → the review reads `.worktrees/story`
  alone.
- Two worktrees authored by Yui-chan both hold this story's claim → Review
  changes opens a review saying which worktrees qualify and that it cannot
  choose; no files are listed and nothing is marked.
- A story launched from the dashboard in Story Branch Mode whose agent also
  appears in author config → the review keeps reading the launch record's
  workspace.

**UI:** Nothing new on the card: Review changes appears where it does for a
launched story, and its review is the same panel. The ambiguous case is one
explanation in the review's feedback region naming the worktrees, in the
place an unreadable trunk is explained today.

**Architecture:** The dashboard gains one more machine-local reading beside
its kept launch records: the project's local checkout's worktree list and each
worktree's per-worktree author config, which the Proposed
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
places in the local operational view, never on origin. The resolution is one
shared rule on the local boundary, where the launch-record rule lives, so the
snapshot, file, range and mark requests all read the same worktree, and the
page learns a story's reviewable workspace from that boundary rather than from
kept launch records alone. Set aside: recording the worktree path in the
published profile (a machine path on origin, against that placement);
matching by the profile's branch, since a Trunk Mode profile records the
remote trunk (`origin/main`), not the local execution branch (observed
2026-10-11 on a fixture claim); and writing a launch record by hand for a
terminal start. No Accepted ADR applies.

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
