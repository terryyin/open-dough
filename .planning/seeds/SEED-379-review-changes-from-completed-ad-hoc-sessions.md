---
id: SEED-379
status: active
planted: 2026-11-16
planted_during: Investigation of missing Review changes on completed ad hoc sessions
trigger_when: selected from the product backlog
scope: three stories
---

# SEED-379 — Review changes from completed ad hoc sessions

## Parent goal

A developer can open **Review changes** from a completed ad hoc card in
**Recently done** and see the changes belonging to that session, whether the
session worked directly on trunk, left work on a feature branch, or integrated
a branch into trunk, through Dough or manually.

## Evidence, order and decisions

Observed on 2026-11-16 in the 132 ad hoc launch records kept on the
maintainer's machine, across six projects:

- 66 hold a retained landing, and every one of those pairs is still readable
  in its saved repository. Only the card's action is missing.
- 52 are default launches (Default main · Wait for review). They hold no
  starting point and no landing context. Of the 33 started with Claude Code,
  about 15 delivered with a plain `git push`, about 11 through the installed
  publication command, and 7 delivered nothing.
- 14 established a session and hold no landing; most of these pushed manually.
- At most 16 of the 84 sessions that worked in a default checkout overlapped
  another such session of the same project, measured to their Done time.
- A checkout's local Git log records the commits made in it apart from trunk
  work pulled or merged in.

Terry decided on 2026-11-16:

- **Three stories, in this order.** Show the evidence already retained; then
  keep the changes of sessions working in the shared Default main checkout,
  the largest group without evidence; then keep the results of sessions
  working on their own branch.
- **Attribution in a shared checkout.** A session's commits are the commits
  made in that checkout while the session was open, read from the checkout's
  local Git log. When another session was open in the same checkout at the
  same time, the review still opens and says it may include that session's
  work.

Considered and set aside for attribution: showing an overlapping session's
comparison as unavailable; marking each session's commits through its
environment, which Git honours locally, including across a rebase, while each
host's passing of that environment to its Git commands is unverified; and
reading each host's transcript, which needs a reader per host.

<a id="review-changes-from-completed-ad-hoc-sessions"></a>

### Review changes from completed ad hoc sessions

**Identity:** SEED-379#review-changes-from-completed-ad-hoc-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/659-review-changes-from-completed-ad-hoc-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d19deb00ff183371eecdd06c7bdc8ac5d3697abac61ce5a5385164bf26c42a68","plan":"02ec29cab5eae6e32e01d0b77813eb9c09c301c2da01bc9c3a59fb18818cb1ba"}}
```

#### Goal

A developer who marked an ad hoc session done can open **Review changes** from
its card in **Recently done** and read the change that session's landing
delivered to trunk, using the evidence the dashboard already retains. This
makes half of today's completed ad hoc sessions reviewable and gives the later
stories the action their evidence appears under.

#### Scope

- Every standalone ad hoc session entry in **Recently done** offers **Review
  changes**, named and drawn as on a done story's card. A session whose launch
  established no place for a landing offers it too, so an absent comparison is
  explained where the developer looks for it.
- The review opens in the page's one side panel with the existing file
  browser, counts, rename detection, binary explanation, file moves, context
  expansion, Refresh, Maximize/Restore, Hide files/Show files and Close. Its
  header names the session by its label. Its context line reads as a landed
  run's: the launch time, the authorized remote target, and the exact captured
  base and accepted revision.
- The comparison is the launch record's retained landing: the fetched trunk
  tip the publication was accepted onto and the accepted revision. It stays
  fixed when trunk advances or reverts the result, and after the session's
  worktree and branch are removed, for as long as the launch record is kept.
- The review is read-only and holds one comparison: it shows no Comparison
  switch and no Mark reviewed.
- Opening the review clears the selected story, as showing a session attached
  to no story does. Close, or Command+Shift+Escape, returns the keyboard to
  the entry's **Review changes**, or to the session's entry when that control
  is no longer shown, and keeps Recently done's shown range and entry counts.
- Sessions completed before this story with a retained landing are reviewable
  the same way; nothing is captured anew.
- Scope limits: an ad hoc row linked to a published Done story keeps opening
  that story, whose card holds its review; an open ad hoc session's entry
  gains no review action; Follow up from a file or line of an ad hoc review is
  deferred, and the entry's own Follow up stays as it is.

#### Key examples

- A session launched with Isolated workspace · Automatically land landed
  through Dough and was marked done; its worktree is gone and trunk has
  advanced → **Review changes** on its Recently done entry → the side panel
  lists the files between the captured base and the accepted revision, and
  each diff reads as it did at landing.
- A session completed weeks before this story holds a readable retained
  landing → **Review changes** → the same comparison.
- A default launch pushed its work with plain Git and holds no landing →
  **Review changes** → the panel says that this session's changes were not
  captured and lists no files.
- A session holds a retained landing whose saved repository or objects can no
  longer be read → **Review changes** → the panel explains why the comparison
  is unavailable and lists no substitute files.
- A retained landing whose base and accepted revision hold the same content →
  **Review changes** → the panel says this session's delivered comparison is
  empty.
- An ad hoc row that uniquely establishes a published Done story → choosing
  it reveals that story's card, as before.

#### Architecture

This story is the first of three that give an ad hoc session reviewable
change evidence, so it names the concepts the later ones grow.

- **Reviewed work.** A review's subject is a story or an ad hoc session. A
  story review names its project and story identity; an ad hoc review names
  its project and the session, as the dashboard's other session requests do. The review boundary admits
  either through one admission path, and no request supplies a repository or
  workspace path. A file read names the retained pair and one of its literal
  changed paths, including a rename's old path.
- **Session change evidence.** A launch record's retained comparisons are its
  change evidence. Today that is its one landing. The Default main story adds
  the session's attributed commits and the own-branch story adds its branch
  result, each as another retained comparison of the same record, read by the
  same comparison reader and shown in the same panel; the Comparison switch
  returns when a session holds more than one. This story builds none of that.
- **One reader and one panel.** The ad hoc review reuses the
  [landed run](../../dashboard/STORY-REVIEW-LANDED-RUNS.md) comparison reader
  and the story review's panel, generalizing the panel's subject from a story
  to reviewed work.
- **Observation only.**
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
  keeps a launch record as machine-local evidence. The review reads the saved
  common Git repository, fetches nothing, and writes no ref, index or
  checkout content. It states what this launch's landing delivered and claims
  nothing about other work the session may have done.

<a id="keep-default-main-session-changes-for-review"></a>

### Keep Default main ad hoc session changes for review

**Identity:** SEED-379#keep-default-main-session-changes-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-379#keep-default-main-session-changes-for-review","dependencies":[{"supplier":{"identity":"SEED-379#review-changes-from-completed-ad-hoc-sessions","href":"seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions"},"implementation":"The supplier adds Review changes to a completed ad hoc session entry and admits a review that names the session.","rationale":"This story's retained evidence is observable only through that action and admission; shared direction alone would have this story build the supplier's outcome.","condition":"A completed standalone ad hoc session entry in Recently done opens its retained comparison through Review changes.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can review what a future ad hoc session working in the shared
Default main checkout changed, including a default launch and a session that
pushed with plain Git, with other people's and other sessions' trunk work left
out.

#### Scope

- A future ad hoc session working in the Default main checkout, default
  launches included, retains its starting point at launch.
- Its commits are those made in that checkout while the session was open,
  read from the checkout's local Git log and followed through a rebase. Trunk
  work pulled or merged in is left out, including where it changed another
  part of a file the session changed.
- When another session was open in the same checkout during that time, the
  review opens and says it may include that session's work.
- A default launch that lands through Dough retains that landing as an
  established session does.
- The evidence is captured while it exists and is kept with the launch
  record, so it stays readable as trunk advances.
- Sessions completed before this story without evidence keep the
  not-captured explanation.

#### Key examples

- A default launch commits twice on trunk and pushes with plain Git while a
  story's landing is pulled into the checkout between those commits; the
  session is marked done → **Review changes** → the session's two commits'
  changes, without the story's.
- Two default launches are open in one checkout at the same time and both
  commit → **Review changes** on either → the commits made in that window,
  with the note that it may include the other session's work.
- A default launch lands through Dough → **Review changes** → that landing's
  fixed comparison.

#### Open for refinement

- Whether changes a session leaves uncommitted in the shared checkout belong
  to its review.
- When the evidence is captured: at the session's completion report, at Done,
  or as commits appear.

<a id="keep-own-branch-session-results-for-review"></a>

### Keep own-branch ad hoc session results for review

**Identity:** SEED-379#keep-own-branch-session-results-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-379#keep-own-branch-session-results-for-review","dependencies":[{"supplier":{"identity":"SEED-379#review-changes-from-completed-ad-hoc-sessions","href":"seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions"},"implementation":"The supplier adds Review changes to a completed ad hoc session entry and admits a review that names the session.","rationale":"This story's retained evidence is observable only through that action and admission; shared direction alone would have this story build the supplier's outcome.","condition":"A completed standalone ad hoc session entry in Recently done opens its retained comparison through Review changes.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can review what a future ad hoc session working on its own branch
left or delivered, when it waited for review or was integrated into trunk
manually.

#### Scope

- A session that leaves its result on its branch retains that result against
  its starting point, including working-tree changes that are part of what it
  leaves for review. Earlier branch work and changes brought in from trunk are
  left out.
- A session whose branch is integrated into trunk manually retains the change
  delivered to trunk, including edits made during the merge.
- The evidence stays readable after a later trunk advance or the worktree's
  removal, while the launch record is kept.

#### Key examples

- A session launched with Isolated workspace · Wait for review commits on its
  branch, leaves one file edited and uncommitted, and is marked done →
  **Review changes** → its commits and that edit against its starting point.
- That branch is then merged into trunk by hand with one conflict resolved,
  and the worktree is removed → **Review changes** → the change delivered to
  trunk, with the resolution.

#### Open for refinement

- Whether a session that started in the Default main checkout and created
  its own branch or worktree is covered here.
