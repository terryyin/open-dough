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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/705-keep-own-branch-session-results-for-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7915d0d7c2e2d6fd854037e64fa3d7da335c4b245c3c906fdb9ef068404121af","plan":"e08f6784643acf2b5ac7431d27d4eca5fa980a308f4d744626d7016526478714"}}
```

#### Goal

A developer opening **Review changes** on a standalone Recently done entry can
see what the session left for review on its branch and, when it lands, what
actually reached trunk. A merge resolution can make those two answers different.

#### Scope

- Keep the branch result at Done for future isolated ad hoc launches and for a
  Default main session that identifies a branch or worktree it has taken up.
  That handoff associates this launch with the checkout and its starting state.
  A successful capture includes the session's commits and the working-tree
  changes it leaves for review. Exclude earlier branch work and changes brought
  in from trunk. Keep any evidenced Default main commit runs available.
- Keep a verified delivery to the authorized remote trunk, including the
  actual merge resolution. This covers manual integration and Dough Land
  from a session-identified worktree. A delivery discovered after Done can
  add to the same review while the launch record is kept.
- In **Recently done → Review changes**, show what the branch held at Done
  and what reached trunk as distinct comparisons when both exist. Keep their
  file lists and diffs readable across later trunk advances, dashboard restart
  and worktree removal. The launch record's deletion or expiry releases its
  evidence.
- When the session association or exact delivered change cannot be established,
  explain the gap and keep any captured branch result usable. A verified empty
  comparison says there were no changes. A reviewer identifying a rewritten
  delivery, automatic guessing of workspace ownership, and retroactive capture
  for older launches are outside this increment.

#### Key examples

- An isolated session commits a file, incorporates a trunk-only file and leaves
  a further edit uncommitted. At Done the review shows the committed work and
  the edit as left. The trunk-only file stays out of the list and file diffs.
- A Default main session identifies its own branch or linked worktree at entry.
  A pre-existing branch file and another session's similarly named worktree
  stay out of its branch result. When it subsequently uses Dough Land, its own
  Recently done entry can show the verified landing.
- After Done a reviewer merges the committed branch by hand, resolves a conflict
  differently, pushes to trunk and removes the worktree. After a later trunk
  advance the delivered comparison shows the resolution against its trunk
  parent. The reviewer can still select the branch result with its uncommitted
  edit. A squash with matching files but no link to the session leaves the
  branch result available with an explanation of the missing delivery evidence.

#### Architecture

The launch record owns local session evidence. The authorized remote target
establishes delivery. Capture retains the branch's starting state, its result
at Done and the evidence of a later integration as each becomes available.
Historical review reads the selected fixed comparison and its literal changed
paths from the saved repository. Terry selected session identification at
branch entry and automatic verified delivery on 2026-11-18.
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)

<a id="bound-capture-to-done"></a>

### Bound a session's kept commits to its Done

**Identity:** SEED-379#bound-capture-to-done
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/703-bound-session-capture-to-done/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"daa2e142eb8382dbc69c0c289bc85a9525f486ea0728766f4965cb39960f4488","plan":"fff6fa0ab818d6f50f884fdcd8c842f84091a98f49feddaa804bfe2b132ca751"}}
```

Correction of State only what the checkout's log shows in a session's review.
Its source is recoverable at
`9585267d1731891222ba2bc881bf1806b4c5608c:.planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md`
(section `state-only-what-the-checkout-log-shows`). The correction is planned in
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
