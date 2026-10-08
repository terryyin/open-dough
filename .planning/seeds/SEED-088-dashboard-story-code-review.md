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

<a id="review-merged-one-shot-change"></a>

### Review a story's merged one-shot change

**Identity:** SEED-088#review-merged-one-shot-change
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/281-review-merged-one-shot-change/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d4ef30fd98b06fd06f14e8629e93e9526dbbda7072025f56f1bc4818c97020c9","plan":"786c5077bf4f091145f847a688aefacb6ded78eec5c5bb3b865759f47162eb3f"}}
```

**Goal:** A developer reviewing a story from the dashboard can review the
change of one of its one-shot runs, such as a one-shot refinement, after that
change has already merged to trunk, so they can check what the run did
without finding its commit among trunk's history. The review makes automatic
landing inspectable even after the run's worktree and branch have been retired.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md), reusing its file
browser, line counts, unified file diffs, file navigation, and side panel.
The review's current merge-base comparison cannot recover a landed run's
changes: a surviving clean workspace shows nothing after landing, and a
retired workspace cannot be read.

Required behavior:

- A story's **Review changes** offers its one-shot runs whose launch records
  this machine retains, including refinement and execution, with a choice of
  run. Each choice identifies the workflow, when it ran, and, when captured,
  its accepted revision and remote target. A later launch for the story does
  not hide earlier runs. The action remains usable for a captured landed run
  when its workspace and branch are gone, including from a recently done
  story's card while that card and the launch record remain available.
- A landing captures the confirmed result against the particular one-shot
  launch, project, and story identity: the accepted revision, authorized remote
  target, and the delivery base from which that run's owned changes were
  published. It uses the final base and candidate after any reconciliation,
  rather than the original starting revision or an earlier rejected candidate.
  Both automatic landing and landing a retained result on a later explicit
  request supply this evidence. Publication acceptance establishes the landed
  change even when a later refresh, CI observation, or cleanup has a problem.
- Selecting a captured run shows the combined tree-to-tree change from its
  delivery base to its accepted revision. The browser, line counts, and every
  file diff use that same comparison, including renames, binary files, and
  changes across several result commits. Other writers' trunk commits that
  arrived before landing stay out. The result includes content that the
  one-shot workflow took into its result from the default checkout, as that
  workflow already requires; the review does not claim to identify which
  lines the agent personally authored.
- The comparison is fixed to that delivery, even if trunk later advances,
  changes the same file, or reverts the result. Reading it uses the project's
  repository without requiring the retired workspace, survives a dashboard
  restart, and preserves the needed Git objects for as long as the associated
  launch record is retained. Refresh rereads available runs and their evidence;
  it keeps the selected run while it remains available and never replaces its
  accepted revision with today's trunk tip.
- A failed or uncertain push, a completion message, a session marked Done,
  or a matching commit subject is not evidence of landing. A retry or resumed
  landing records the accepted result once for the same launch. A recording
  failure leaves accepted Git publication accepted, explains the missing
  review evidence, and can be retried without publishing or landing again.
- A run with no retained landing comparison, including an older run recorded
  before this capability, explains that gap and lists no guessed files. A
  missing repository or unreadable captured object similarly explains why
  that run cannot be reviewed. An empty captured comparison says the landed
  run changed nothing. None of these states substitutes the live workspace's
  changes or all changes on trunk for the run's result.

Draft refinement defaults, open to change in planning: all retained runs are
offered newest first; the comparison is named **Landed one-shot runs** beside
the workspace comparisons, with the newest captured run selected initially.
An opening keeps the existing workspace comparison default when that workspace
can be read; otherwise it opens on the newest captured run. Choosing a landed
run hides the workspace's Mark reviewed control: marking individual runs is a
deferred promise, and selecting an old result does not replace the story's
existing workspace mark. A run without captured evidence remains identifiable
with its unavailable explanation. New landings supply evidence; recovery of
older runs from trunk history was considered and is deferred.

Deferred promises, not rejections: reconstructing older landings without
captured evidence; discovering runs launched on another machine or outside the
dashboard; retaining review history beyond the existing launch-record lifetime;
combining several runs into one diff; choosing a subset of a run's commits;
per-run review marks; and identifying arbitrary story work interwoven on trunk
([a Trunk Mode story's own changes](#review-trunk-mode-story-changes)) or a
landed ordinary Story Branch Mode branch
([merged story branch changes](#review-merged-story-branch-changes)). These
siblings are not prerequisites for reviewing one captured delivery.

Rejection constraints: the existing
[story review contract](../../dashboard/AGENT-LAUNCH-REVIEW.md) requires
requests to name the project, work identity, and admitted object IDs rather
than a filesystem path, and the review to leave the checkout's files and index
untouched. A run choice also names its retained launch; the server resolves
the associated repository and captured comparison. Reading the historical
comparison writes no ref; object preservation belongs to recording the delivery,
as preservation of a workspace review mark already belongs to marking it.
The publication contract's acceptance rule, not session activity or completion,
justifies refusing to describe an unconfirmed candidate as landed.

**Key examples:**

1. A one-shot refinement starts at A, commits its seed update as B, and
   automatically lands B; its workspace and branch are then retired → the
   developer opens Review changes on the queued story → that refinement is
   offered, and selecting it shows the seed update from A to B.
2. The run starts at A; another writer lands C; the run's two commits are
   rebased onto C and accepted as D → the developer selects that run → the
   combined comparison is C to D, includes both result commits and their
   reconciled content, and leaves the other writer's changes out. A rejected
   pre-rebase candidate is not offered as the delivered result.
3. Two one-shot refinements of the same story have landed, and a newer standard
   execution launch has a live workspace → Review changes offers both retained
   refinements as well as the current workspace review; selecting the earlier
   refinement shows only its own captured result. Switching back restores the
   workspace comparison and its existing mark.
4. A one-shot execution closes a queued story and lands its result, including
   earlier pending content the selected default checkout contributed → the
   developer reviews it from the recently done card → the combined delivered
   result, including that content and closure, is shown without needing the
   deleted seed, execution branch, or worktree.
5. A captured result changes a file; trunk later changes it again or reverts
   the result → opening or refreshing that run's review → the same original
   delivered change is shown. Restarting the dashboard also keeps it readable.
6. A push failed, or an older completed run has no captured comparison → the
   developer selects that run → the review says no landing comparison was
   retained and lists no files. A captured run whose repository or objects
   cannot be read instead names that problem; a valid empty comparison says
   the landed run changed nothing.
7. Trunk accepted D, but the default-checkout refresh or evidence recording
   failed → the landing reports those separate results; retrying evidence
   recording retains the same D and delivery base once, without another push,
   and makes the accepted run reviewable.

**UI:** The developer reaches this through the story card's existing Review
changes action and stays in the same side panel. Landed one-shot runs has a
keyboard-operable choice showing each run's workflow, time, accepted revision,
and target when known. The heading names the selected run and the two ends
being compared, so an earlier refinement cannot be mistaken for the live
workspace or today's trunk. A missing workspace does not prevent choosing a
captured run. Reading feedback, unavailable explanations, Hide/Show files,
Previous/Next file, maximize, resize, and Close retain their existing purposes;
choosing another run updates the files and diff together. Layout and component
choices remain execution's.

**Architecture:** The new responsibility is retaining and consuming one
delivery comparison tied to the launch, rather than inferring a run from trunk
history. Observed 2026-10-08: `dashboard/src/launchRecord.ts` keeps a one-shot
run's identity, workspace, target, and optional `startingRevision`, while
`dashboard/src/completionReport.ts` holds outcome and message but no delivery
revisions. The publication mechanism in
`src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs`
already returns the accepted `receipt.sha`, target, and final `suffixBase`;
the shared publication guidance also retains the candidate and its base before
pushing. That is the delivery fact to carry into retained launch evidence,
including Dough Land's later explicit landing, before retiring the workspace.
The existing file comparison and repository admission should serve historical
reviews as well as workspace snapshots; no separate diff implementation is
needed. Under
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
publication, completion, story membership, and review evidence stay distinct,
and one authoritative delivery fact serves the review. This feature's design
stays in its planning record under
[ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md).
No Accepted decision conflicts.

<a id="review-merged-story-branch-changes"></a>

### Review a Story Branch Mode story's changes after they merge

**Identity:** SEED-088#review-merged-story-branch-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story executed in Story Branch Mode can
review that story's combined changes after its branch has already merged to
trunk, so they can check the delivered work after landing.

**Scope:** Builds on the
[story review](../../dashboard/AGENT-LAUNCH-REVIEW.md) and
[Commits comparison](../../dashboard/STORY-REVIEW-COMMITS.md); the merge-base baseline shows
nothing once the story branch is on trunk. To be refined: how the dashboard
finds the merged branch's changes when the branch or worktree is gone, and
whether trunk changes integrated into the branch stay excluded.

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
