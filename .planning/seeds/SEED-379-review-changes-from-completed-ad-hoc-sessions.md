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
  (Terry, 2026-11-18). The [own-branch review](../../dashboard/AGENT-LAUNCH-COMPLETION.md#identify-a-branch-taken-up-from-default-main)
  covers landings from a worktree the session identified.
- One combined view of interrupted runs (Terry, 2026-11-18: one comparison
  per run).

#### Open for refinement

- Whether any of these is still wanted: each was set aside for the stated
  reason, and none has a way forward or an example yet.
