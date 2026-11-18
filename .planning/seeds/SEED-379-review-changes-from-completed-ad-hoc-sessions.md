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

Terry decided on 2026-11-18, refining the Default main story:

- **One comparison per run.** Where pulled trunk work interrupts a session's
  commits, each uninterrupted run is its own exact comparison. Replaying the
  commits into one combined view was set aside: it writes new commits, and a
  commit that edits lines the pulled work introduced cannot be separated.
- **Commits only.** Uncommitted changes left in the shared checkout are no
  part of the review.
- **No separate landing capture for default launches.** The session's
  commits in the checkout cover a landing published from it.

Considered and set aside for attribution: showing an overlapping session's
comparison as unavailable; marking each session's commits through its
environment, which Git honours locally, including across a rebase, while each
host's passing of that environment to its Git commands is unverified; and
reading each host's transcript, which needs a reader per host.

## Shared review concepts for later stories

A review's subject is a story or an ad hoc session. A story review names its
project and story identity; an ad hoc review names its project and the
session. One admission path covers either; no request supplies a repository or
workspace path. A file read names the retained pair and one of its literal
changed paths, including a rename's old path.

A launch record's retained comparisons are its change evidence. Today that is
its one landing. Later stories add the Default main session's attributed
commits and the own-branch result as further retained comparisons of the same
record, read by the same
[landed-run](../../dashboard/STORY-REVIEW-LANDED-RUNS.md) reader and shown in
the same panel; the Comparison switch returns when a session holds more than
one. Observation only: the review reads the saved common Git repository,
fetches nothing, and writes no ref, index or checkout content.

Standalone ad hoc Done entries in Recently done already offer **Review
changes** for that landing (or explain absent, unreadable and empty
evidence). Linked ad hoc rows still open their published Done story.

<a id="keep-default-main-session-changes-for-review"></a>

### Keep Default main ad hoc session changes for review

**Identity:** SEED-379#keep-default-main-session-changes-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-379#keep-default-main-session-changes-for-review","dependencies":[{"supplier":{"identity":"SEED-379#review-changes-from-completed-ad-hoc-sessions","href":"seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions"},"implementation":"The supplier adds Review changes to a completed ad hoc session entry and admits a review that names the session.","rationale":"This story's retained evidence is observable only through that action and admission; shared direction alone would have this story build the supplier's outcome.","condition":"A completed standalone ad hoc session entry in Recently done opens its retained comparison through Review changes.","state":"satisfied","resolution":{"revision":"7bf273f3951c4e03d74f851b8166c6944adb0f87","path":".planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions","summary":"Directly satisfied: standalone ad hoc Recently done entries offer Review changes and open the retained landing (or explain absent, unreadable, and empty comparisons) through session-subject admission; proof in recently-done-ad-hoc-review.spec.ts and ad-hoc-review.spec.ts at the supplier before-cleanup revision.\nCondition satisfied: A completed standalone ad hoc session entry in Recently done opens its retained comparison through Review changes.\nAccepted integration: 4796a7876b91b32231b6b90ff81e7bbb93c1a055 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/693-keep-default-main-session-changes-for-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6416411a048bbec34cfb309c998f4f725379423111e5b01f81a4ee49ba86d6a3","plan":"b6b76dc23fd0ffeb4ca1b44b327fcf2a53ea8c09946613a0fc27f6d01b081f80"}}
```

#### Goal

A developer can review what a future ad hoc session working in the shared
Default main checkout changed, including a blank default launch and a session
that pushed with plain Git, with other people's and other sessions' trunk work
left out. The developer is the person who launched the session and later reads
its card in **Recently done**, after trunk has moved on.

#### Scope

Required behavior:

- A future ad hoc session working in the Default main checkout, default
  launches and blank ones included, retains its starting point at launch.
- When the session is marked done, by the developer or automatically, its
  commits are kept with its launch record: the commits made in that checkout
  from its launch to Done, read from the checkout's local Git log. A commit
  that was amended or rebased is kept in its final form. Trunk work pulled or
  merged in is left out, including where it changed another part of a file the
  session changed.
- Each uninterrupted run of those commits is one retained comparison, from
  the commit before the run to its last commit. A session whose commits were
  not interrupted by pulled work opens as one comparison; otherwise the
  Comparison switch lists the runs, oldest first, and the review opens on the
  first.
- The review's context names the comparison as commits made in the Default
  main checkout while the session was open, with its exact two revisions.
  When another session was open in the same checkout during that time, the
  context also says the comparison may include that session's work.
- A session that made no commits there says so, apart from the not-captured
  explanation.
- The comparisons stay readable as trunk advances and after the commits leave
  every branch, for as long as the launch record is kept, and are released
  with it.

Scope limits:

- Sessions completed before this story, and a session whose checkout log
  cannot be read at Done, keep the not-captured explanation.
- The review is offered where it is today: on the Done session's entry in
  Recently done.

Deferred promises:

- Changes a session leaves uncommitted in the shared checkout. They cannot be
  told apart from a person's or another session's edits (Terry, 2026-11-18).
- A separately captured Dough landing for a default launch. A landing
  published from the checkout is already among the session's commits there
  (Terry, 2026-11-18); a landing from a worktree the session created belongs
  to the [own-branch story](#keep-own-branch-session-results-for-review).
- One combined view of interrupted runs (Terry, 2026-11-18: one comparison
  per run).

#### Key examples

- A default launch commits once on trunk and pushes with plain Git; the
  session is marked done and trunk advances → **Review changes** → that
  commit's changes, with no Comparison switch.
- A default launch commits, a story's landing is pulled into the checkout,
  and the session commits again; the session is marked done → **Review
  changes** → the first commit's changes, with the Comparison switch offering
  the second; neither holds the story's changes.
- A default launch commits twice, the second amended, then rebases both onto
  pulled trunk before pushing → **Review changes** → one comparison holding
  both commits as pushed, without the pulled work.
- Two default launches are open in one checkout at the same time and both
  commit → **Review changes** on either → the commits made while it was open,
  with the note that the comparison may include the other session's work.
- A default launch lands through Dough from the checkout → **Review
  changes** → the commits that landing made there.
- A blank default launch edits files, commits nothing, and is marked done →
  **Review changes** → this session made no commits in the Default main
  checkout.
- A default launch marked done before this story → **Review changes** → its
  changes were not captured.

#### UI

The panel, file browser and Comparison switch are those of the landed-run
review. The context heading names session commits, not a landed run, and
carries the shared-checkout note as its own sentence beside the two
revisions, so it is read before the files. The switch names each run by its
commit count and last commit's subject and time.

#### Architecture

Capture moves from the publishing agent to the dashboard: at Done the server
reads the Default main checkout's local Git log, which needs no cooperation
from the session, so blank launches, every host and plain pushes are covered.
This is machine-local evidence under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
it supplements the published view, and a time window cannot establish which
session made a commit, which the shared-checkout note states. Each run is a
fixed pair kept as the landing pair is, so the landed-run reader and its
observation-only read are unchanged; the launch record holds several
comparisons where it held one landing. Capture is the only write, and only of
the references that keep each pair's commits.

<a id="keep-own-branch-session-results-for-review"></a>

### Keep own-branch ad hoc session results for review

**Identity:** SEED-379#keep-own-branch-session-results-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-379#keep-own-branch-session-results-for-review","dependencies":[{"supplier":{"identity":"SEED-379#review-changes-from-completed-ad-hoc-sessions","href":"seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions"},"implementation":"The supplier adds Review changes to a completed ad hoc session entry and admits a review that names the session.","rationale":"This story's retained evidence is observable only through that action and admission; shared direction alone would have this story build the supplier's outcome.","condition":"A completed standalone ad hoc session entry in Recently done opens its retained comparison through Review changes.","state":"satisfied","resolution":{"revision":"7bf273f3951c4e03d74f851b8166c6944adb0f87","path":".planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md#review-changes-from-completed-ad-hoc-sessions","summary":"Directly satisfied: standalone ad hoc Recently done entries offer Review changes and open the retained landing (or explain absent, unreadable, and empty comparisons) through session-subject admission; proof in recently-done-ad-hoc-review.spec.ts and ad-hoc-review.spec.ts at the supplier before-cleanup revision.\nCondition satisfied: A completed standalone ad hoc session entry in Recently done opens its retained comparison through Review changes.\nAccepted integration: 4796a7876b91b32231b6b90ff81e7bbb93c1a055 on origin/refs/heads/main."}}]}
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
  its own branch or worktree is covered here, including its landing through
  Dough from that worktree.
