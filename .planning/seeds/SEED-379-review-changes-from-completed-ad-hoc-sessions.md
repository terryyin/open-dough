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

A launch record's retained comparisons are its change evidence: its landing,
or the runs of commits a Default main session made in its checkout. A later
story adds the own-branch result as a further retained comparison of the same
record, read by the same
[landed-run](../../dashboard/STORY-REVIEW-LANDED-RUNS.md) reader and shown in
the same panel; the Comparison switch returns when a session holds more than
one. Observation only: the review reads the saved common Git repository,
fetches nothing, and writes no ref, index or checkout content.

Standalone ad hoc Done entries in Recently done already offer **Review
changes** for that landing (or explain absent, unreadable and empty
evidence). Linked ad hoc rows still open their published Done story.

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

<a id="state-only-what-the-checkout-log-shows"></a>

### State only what the checkout's log shows in a session's review

**Identity:** SEED-379#state-only-what-the-checkout-log-shows
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/700-state-only-what-the-checkout-log-shows/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6e288fa1975fd8eae61599e842be5eae4f530c26fee9666561acfafbaeeebed6","plan":"1c4d5344b99eb8af294fcbab433765f6cabba8d84a4d5d781a59ece3d0195296"}}
```

Correction of Keep Default main ad hoc session changes for review, recoverable at
`6d9e4c3988b0ab41b5c07aa577976f29e6bca451:.planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md` (section `keep-default-main-session-changes-for-review`),
planned in [plan 700](../slice-plans/700-state-only-what-the-checkout-log-shows/PLAN.md).

#### Goal

A developer reading **Review changes** on a done Default main session can
trust it: the review holds the session's commits up to the Done it names,
leaves merged trunk work out, says the changes were not captured wherever the
checkout's log does not settle what the session committed, and describes
itself in session words. The maintainer of this review finds its references,
tests and guides without residue from its first delivery.

#### Scope

- A later automatic Done keeps the commits made up to that Done.
- A merge commit is never a session commit, amended or not.
- A continued cherry-pick and a rebase's fixup or squash of session commits
  are kept in their final form; a log entry that wrote a commit the capture
  cannot place, or session commits that all left the checkout's `HEAD`, keep
  the not-captured explanation.
- A record's session-commit references are released whatever capture the
  record still holds.
- A session's unavailable review is described as a session's, and the two
  guides state the delivered behavior.
- The review's page objects, spec support and overlapping cases are
  reorganized with the reviewed promises and their proof preserved.

The reviewed story's promises, scope limits and deferred promises stay as
they are.

<a id="bound-capture-to-done"></a>

### Bound a session's kept commits to its Done

**Identity:** SEED-379#bound-capture-to-done
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/703-bound-session-capture-to-done/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"aa131fe4b056e49743a03aa67b24b5194805b3a88f08795d9806bae375be0e1e","plan":"fff6fa0ab818d6f50f884fdcd8c842f84091a98f49feddaa804bfe2b132ca751"}}
```

Correction of [State only what the checkout's log shows in a session's
review](#state-only-what-the-checkout-log-shows), planned in
[plan 703](../slice-plans/703-bound-session-capture-to-done/PLAN.md).

#### Goal

A developer opening a Default main session's review sees only the
commits through the Done shown there, even when the checkout read starts
later or waits for another read.

#### Scope

Use the Done being captured to bound which checkout evidence can contribute
to its comparison. Another commit made after that Done belongs to a later
capture. When the available checkout evidence cannot settle this boundary,
retain the existing not-captured explanation. Keep the completion receipt,
native Done handling, immutable retry rules, and existing comparison and
reference lifecycles.

<a id="review-deferred-default-main-session-changes"></a>

### Review what Default main session reviews left deferred

**Identity:** SEED-379#review-deferred-default-main-session-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reviewing a done ad hoc session that worked in the shared Default
main checkout can also see what its review of session commits leaves out.

#### Scope

The promises deferred when session commits became reviewable, each with the
decision recorded then:

- Changes a session leaves uncommitted in the shared checkout. They cannot be
  told apart from a person's or another session's edits (Terry, 2026-11-18).
- A separately captured Dough landing for a default launch. A landing
  published from the checkout is already among the session's commits there
  (Terry, 2026-11-18); a landing from a worktree the session created belongs
  to the [own-branch story](#keep-own-branch-session-results-for-review).
- One combined view of interrupted runs (Terry, 2026-11-18: one comparison
  per run).

#### Open for refinement

- Whether any of these is still wanted: each was set aside for the stated
  reason, and none has a way forward or an example yet.
