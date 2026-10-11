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
**Slice plan:** [Review only a Trunk Mode story's own changes](../slice-plans/297-trunk-mode-own-changes-review/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/297-trunk-mode-own-changes-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fdf4af3242064982d06b0d8a208b4e95ea2a094a62634b42104f91b93295f25c","plan":"368e2a0a9b7a0862aeb71d3164253ed000e7b786ea0e48350059e220a1a9fe87"}}
```

**Goal:** A developer reviewing a Trunk Mode story, whose agent publishes each
increment onto `origin` trunk where other people's commits interleave with it,
sees the story's own changes, published, unpublished and uncommitted, in one
review, so a Trunk Mode story is reviewed as completely as a Story Branch Mode
story whose work is still on its branch.

**Scope:** Builds on the [story review](../../dashboard/AGENT-LAUNCH-REVIEW.md)
and on the [sibling story](#review-trunk-mode-story-worktree), which finds a
Trunk Mode story's worktree on this machine by the agent's per-worktree
authorship and the story's claim. The user is the developer at the dashboard
on that machine, reviewing a Taken Trunk Mode story whose agent has already
published some of its commits. Today the baseline is the merge-base of the
worktree's head and fetched trunk, which in Trunk Mode is trunk itself after
each publication, so All changes shows only what is not yet published and
Since the review counts story work that reached trunk after the mark as
trunk's. Observed 2026-10-11: Trunk Mode publication rebases the owned suffix
onto fetched trunk and pushes it there, so a story's published commits are
ordinary linear commits authored by the agent (per-worktree `author.name` and
`author.email`, the human staying committer), and every commit's tree carries
the agent's profile (`.planning/agents/<agent>.json`) naming the story from
the claim until the closure commit removes it.

Required:

- The story's published commits are recognized on freshly fetched trunk
  without any change to how they are published: the commits reachable from
  `<remote>/<target>` but not from the story's claim, authored by the card's
  agent, whose tree's profile for that agent, or the parent's tree's for the
  commit that removes it, names this story. The claim itself, the preparation
  agent's commits for this story, and the same agent name's commits for an
  earlier or later story are not the story's changes, as in a Story Branch
  review whose baseline sits at the claim.
- All changes compares the worktree snapshot with trunk less the story's
  published commits, so it lists the published, unpublished and uncommitted
  changes together and leaves out every other commit on trunk, even one that
  changed another part of a file the story also changed. A file whose story
  change and trunk change Git cannot separate is listed flagged “includes
  trunk's changes”, diffed from trunk as it was before the story's first
  change to that file, as Since the review flags such a file today. Include
  uncommitted changes, counts, totals, file moves and Mark reviewed act on
  this comparison as they do today.
- The context line names the baseline as the fetched trunk revision with the
  story's published commits taken out; its one-line form says how many, and
  activating the line reads the full form.
- Since the review restates the marked snapshot on the current baseline as
  today, so a story commit published after the mark is listed among the
  changes since the review instead of being counted as trunk's, and an
  otherwise empty review no longer says nothing changed beyond what trunk now
  holds when the story itself reached trunk. The mark keeps the marked
  snapshot's baseline tree readable alongside the marked tree, since that
  baseline is no longer a commit trunk holds.
- A story with no published commit yet, or a Story Branch Mode story, whose
  agent's commits reach trunk only at wrap-up, is reviewed exactly as today:
  with nothing to take out, the baseline is the merge-base of head and trunk.
- When this machine's Git cannot take the story's commits out of trunk (it
  needs Git 2.45 or later, as restating the mark does), the review shows the
  unpublished and uncommitted changes against trunk as today and its feedback
  says the story's published commits could not be taken out of trunk and why,
  rather than failing or listing files against a guessed baseline.

Deferred, not built or verified here:

- Commits listing the story's published commits, alone or in a range, beside
  the worktree's unpublished commits and Uncommitted changes; Commits stays
  the worktree's commits, and the goal is met by All changes and Since the
  review.
- Reviewing a completed Trunk Mode story from its Recently done card after its
  worktree is retired, where trunk's history and the done record's agent would
  suffice without a worktree.
- A merge commit the agent published, which Trunk Mode's rebase does not
  produce; such a commit counts as trunk's, and only linear publications are
  verified.
- Separating the story's and trunk's lines within one file Git flags as
  inseparable; the flag and the included trunk changes stay as today.
- A review from another machine, or of a worktree the sibling story does not
  find.

**Key examples:**

- Yui-chan holds `SEED-X#story` in Trunk Mode in `.worktrees/story`. After
  the claim she published `s1`, changing the first function of `a.ts`, and
  `s2`, adding `d.md`; between them Ken-chan published `o1`, changing `b.ts`,
  and Terry pushed `o2`, changing the last function of `a.ts`; the head equals
  `origin/main` and `notes.md` is untracked → Review changes → All changes
  lists `a.ts`, `d.md` and `notes.md` and not `b.ts`; the diff of `a.ts`
  shows the first function's change alone; the context line names
  `exec/story`, the trunk revision less 2 story commits, and `.worktrees/story`.
- Ken-chan's `o3` then rewrites the very line `s2` changed in `c.ts` →
  Refresh → `c.ts` is listed flagged “includes trunk's changes”, its diff
  running from trunk before `s2` to the snapshot, so the line's net change by
  both is shown rather than hidden; `a.ts`, `d.md` and `notes.md` stay as
  before.
- The developer activates Mark reviewed; Yui-chan publishes `s3`, changing
  `e.ts`, and Ken-chan publishes `o4`, changing `f.ts` → Refresh → Since the
  review, headed “Trunk was integrated since the mark”, lists `e.ts` alone;
  All changes lists `a.ts`, `d.md`, `e.ts` and `notes.md`.
- Yui-chan also has an unpublished commit `u1`, changing `g.ts` → All changes
  lists `g.ts` with the rest; Commits lists Uncommitted changes above `u1`
  and no published commit; with Include uncommitted changes off, the files
  from `s1`, `s2` and `u1` remain.
- Last week Yui-chan closed `SEED-Y#old`, whose commits are still on trunk,
  and Mina-chan announced, refined and planned `SEED-X#story` → none of those
  commits' files are listed.
- Yui-chan has published nothing since the claim → the review is today's:
  All changes lists the unpublished commits' files and the uncommitted files
  against the merge-base baseline, and the context line reads as today.
- Stanly-chan holds `SEED-Z#branch` in Story Branch Mode on the same machine,
  with trunk merged into the branch twice → the review is unchanged.
- The machine's Git is 2.44 → All changes lists the unpublished and
  uncommitted changes against trunk, and the feedback says the story's 2
  published commits could not be taken out of trunk because this Git cannot
  restate trees.

**UI:** Nothing new on the card or in the panel's controls: the same review,
comparisons and marking. The context line's baseline value gains the count of
commits taken out, shortened with the rest when the line is tight; its full
form, read on activation, names the fetched trunk revision and that the
story's published commits were taken out. The flagged file keeps today's
words, row, name and heading. The older-Git explanation sits in the feedback
region, in the place the uncomparable mark is explained today.

**Architecture:** The local boundary gains one more reading of the project's
Git history beside the sibling's worktree resolution: which commits on fetched
trunk are the story's, decided by the same facts the sibling already reads,
the agent's authorship and the agent's profile naming the story at a revision,
so the two share one rule for “this agent's profile at this revision names
this story”. The review's baseline generalizes from a commit on trunk to a
review point, a tree: trunk with the story's published commits taken out,
built by reverse-applying each story commit, newest first, with
`git merge-tree --write-tree --merge-base=<commit> <tree so far> <commit's first parent>`,
the restatement Since the review already uses, so no new Git mechanism, Git
version requirement, or index or ref write enters (observed 2026-10-11 on Git
2.50.1 in a scratch repository: two interleaved story commits reverse-applied
from the tip left exactly the story's hunks, and a line both changed came out
as a conflict). The snapshot keeps the merge-base commit for listing the
worktree's commits and for the Uncommitted changes points, and uses the review
point for `files`, `committed`, `since` and the context line; the file and
mark requests already name trees, never paths. The mark's ref keeps the
baseline tree reachable beside the marked tree. Set aside: a commit trailer
naming the story on every Trunk Mode publication (changes publication and
history for the review's sake, when author and profile already identify the
commits); capturing each publication's accepted pair as a landed run (only a
dashboard launch carries reporting context, and a per-publication list is not
one combined review); replaying the story's commits forward onto pre-story
trunk (the snapshot side would then be synthetic, so the content read would
not be the worktree's); comparing from the claim commit (includes everyone's
changes since). The Proposed [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
and [ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md) inform
this and bind nothing; no Accepted ADR applies.

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
- 2026-10-11 refinement of the Trunk Mode own-changes story (UX/UI and
  architecture focus): trunk's history shows every published commit authored
  by the agent with the profile naming the story in its tree, so the story's
  commits are recognized without changing publication; a scratch Git
  experiment showed `merge-tree --write-tree --merge-base` reverse-applying
  interleaved story commits from the tip leaves exactly the story's changes
  and flags a line both changed. Chosen: All changes compares the snapshot
  with trunk less the story's published commits, keeping the worktree's real
  content on the snapshot side; Since the review follows from the same
  baseline. Deferred: listing published commits in Commits, and reviewing a
  completed Trunk Mode story after retirement.
