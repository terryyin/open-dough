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

<a id="review-merged-story-branch-changes"></a>

### Review a Story Branch Mode story's changes after they merge

**Identity:** SEED-088#review-merged-story-branch-changes
**Slice plan:** [A Story Branch Mode story's changes stay reviewable after they merge](../slice-plans/292-landed-story-branch-review/PLAN.md).
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/292-landed-story-branch-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9f5d17745aa8886f164f8c04286e9ed9ee51da56d15b1184ae739d8c2c21a2ca","plan":"8ca8ec3bf77fd4ef4242602d303d9558bed46dcc61f6fe8146b019a4898d2f94"}}
```

**Goal:** A developer reviewing a story executed in Story Branch Mode from the
dashboard can review that story's combined delivered changes after its branch
has merged to trunk and its worktree and branches are retired, so they can
check the delivered work after landing in the same review the dashboard
already gives a landed one-shot run.

**Scope:** Builds on the [story review](../../dashboard/AGENT-LAUNCH-REVIEW.md)
and the [landed one-shot review](../../dashboard/STORY-REVIEW-ONE-SHOT.md),
whose fixed delivered pair (the trunk tip a publication was accepted onto and
the accepted revision) is captured by the publication handoff described in
[explicit completion](../../dashboard/AGENT-LAUNCH-COMPLETION.md). Today the
dashboard prepares that capture only for one-shot launches; a claimed Story
Branch Mode execution launch gets none, so after wrap-up retires its worktree
the review can only say the worktree is missing, and before retirement the
merge-base baseline shows nothing once the branch is on trunk.

Required:

- A claimed Story Branch Mode execution launch started from the dashboard
  carries the same landing capture as a one-shot launch: a landing context
  naming the project, launch, work identity, remote and trunk target, with the
  workspace's common repository retained as the capture authority.
- Wrap-up's Story Branch trunk integration passes that context through the
  history-preserving candidate sequence, so that once remote trunk accepts the
  integrated SHA the handoff records the pair: base is the fetched trunk tip
  the integration was published onto, revision is the accepted integrated SHA.
  Trunk changes merged into the branch during execution are therefore not part
  of the comparison. Recording happens before retirement and follows the
  existing capture rules: one fixed landing fact per launch, a receipt or a
  reporting-only retry, and Git acceptance kept when recording fails.
- Progress publication to the remote story branch captures nothing; only
  publication to the trunk target is the landing.
- The review lists that integration among the story's retained runs, from the
  active card and from the Recently done card, under the existing opening
  rule: a readable workspace opens first, otherwise the newest captured
  comparison; the selector and context wording name both one-shot runs and
  story-branch integrations with one term per fact.
- Guidance that today says the handoff is for one-shot launches (Dough Land's
  dashboard completion reference and the launch instruction's reporting text)
  describes the general rule for the executing agent.

Rejected:

- Reconstructing an uncaptured landing from today's trunk. The landed review
  never guesses a baseline or lists substitute files
  ([landed one-shot review](../../dashboard/STORY-REVIEW-ONE-SHOT.md)); a story
  landed before this capability keeps its evidence-gap explanation.

Deferred, not built or verified here:

- Durability beyond the launch record's retention (30 days after Done) and
  across machines. A repository ref beside the review mark's would be the
  natural home if wanted later.
- A Story Branch integration run outside the launch's session (a wrap-up
  started without the execution launch's landing context) captures nothing and
  shows the evidence gap, as a one-shot landing does today.
- Opening on the landed comparison while an integrated workspace is still
  present (retirement held): the workspace review opens as today, with the
  integration offered in the Comparison switch.
- Trunk Mode, which lands many increments per launch, is the
  [sibling story](#review-trunk-mode-story-changes).

**Key examples:**

- A Story Branch Mode story executed from the dashboard was wrapped up: its
  branch was merged onto fetched trunk tip T and accepted as integrated SHA S,
  then its worktree and branches were retired and the story sits in Recently
  done → the developer activates Review changes on its done card → the review
  opens on the landed comparison from T to S in the usual file browser and
  diff; the context names the landed run, its launch time, the authorized
  remote target, and the exact base and accepted revision. Mark reviewed is not
  offered there.
- Trunk advanced three times during that execution and each time was merged
  into the branch; a file only trunk changed and a file both changed →
  the same review → the trunk-only file is not listed; the file both changed
  shows the story's merged version against trunk's at T.
- The branch already contained fetched trunk, so integration was a fast-forward
  to the branch tip B → the same review → the comparison is from T to B, the
  same files the workspace review showed before landing.
- Others landed after S, or S was reverted on trunk → Refresh, or a later
  opening → the same fixed pair and files; nothing is read from today's trunk.
- The story had a one-shot refinement run earlier and then this execution →
  the Comparison switch's landed runs list both, newest first, each by
  workflow, launch time and accepted revision.
- A Story Branch Mode story landed before this capability, its worktree gone →
  Review changes → the review explains that this run's delivered comparison
  was not captured and cannot be reconstructed from today's trunk, and lists
  no files.
- Wrap-up's integration push was accepted but the dashboard refused the
  landing record → the wrap-up reports the reporting-only retry, Git acceptance
  and retirement proceed, and the review shows the comparison once the retry
  is acknowledged.

**Architecture:** The delivered one-shot landing specialised a general fact,
a dashboard-started launch's accepted trunk landing, to its single case: the
dashboard writes the landing context only for a one-shot established context
(`dashboard/server/completionReporting.ts`), the review's retained-run list
admits only one-shot launches (`reviewOneShotRunsOf` in
`dashboard/src/storyReviewOneShot.ts`), and the schemas, selector and heading
carry “one-shot” in their names and words. This story generalises that into
one concept, the landing captured for a launch, owned by the same modules:
the capture authority is established for every launch whose established
context names a trunk target, the handoff captures at the publication whose
target is trunk (`history-preserving-publication.mjs` for the Story Branch
integration, as `execution-increment-publication.mjs` already does for a
one-shot suffix), and the review lists launches with a captured landing
whatever their tracking. A launch keeps one fixed landing fact; Trunk Mode's
many increments per launch would need a list, which the sibling story owns.
No Accepted ADR constrains the choice; [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
applies to the guidance change, and the Proposed
[ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md) informs the
distinction between story-branch progress and trunk integration without binding
it.

<a id="landing-capture-after-integration-conflict"></a>

### A conflicted Story Branch integration still records its landing

**Identity:** SEED-088#landing-capture-after-integration-conflict
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/293-landing-capture-after-integration-conflict/PLAN.md","assessment":"not-ready","reasons":["Slice 2's premise, that a second comparison after an accepted landing is refused before its push, was read in the code and not observed against the receiver."],"basis":{"document":"63e3ad8b825f20f6cd5bad414c5bb474b36a7071a3377a502ffe334dde370e90","plan":"0308e1a2ddda0bb0108420a81900373f4deab1a2a55200dbcf1dd21bc22fb67a"}}
```
**Slice plan:** [A conflicted Story Branch integration still records its landing](../slice-plans/293-landing-capture-after-integration-conflict/PLAN.md).

**Goal:** A developer reviewing a Story Branch Mode story whose trunk
integration met a merge conflict, or whose launch published to trunk again
after integrating, still gets the landed review that
[the reviewed story](#review-merged-story-branch-changes) delivers, so
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
