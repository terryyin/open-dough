---
id: SEED-379
status: active
planted: 2026-11-16
planted_during: Investigation of missing Review changes on completed ad hoc sessions
trigger_when: selected from the product backlog
scope: story
---

# SEED-379 — Review changes from completed ad hoc sessions

<a id="review-changes-from-completed-ad-hoc-sessions"></a>

### Review changes from completed ad hoc sessions

**Identity:** SEED-379#review-changes-from-completed-ad-hoc-sessions

#### Goal

A developer can open **Review changes** from a completed ad hoc card in
**Recently done** and see the changes belonging to that session. Future
dashboard-launched ad hoc sessions, including default launches, retain the
evidence needed for review whether they work directly on trunk, leave work on
a feature branch, or integrate a branch into trunk.

#### Key examples

- A new session edits code directly on trunk. After it is marked done,
  the card opens its changes. Earlier work and unrelated commits interleaved
  on shared trunk are excluded from the comparison.
- A new session leaves changes on a feature branch. After it is marked done,
  the card opens the session's result against its starting point. The
  comparison excludes earlier branch work and unrelated changes brought in
  from trunk. Preserve the session's working-tree changes when they are part
  of the result it leaves for review.
- A new session integrates its feature branch into trunk. Whether the
  integration goes through Dough or is performed manually, the completed card
  opens the verified change delivered to trunk, including edits made during
  the merge. A later trunk advance or worktree removal leaves that comparison
  readable while the session record is retained.
- An older completed card with a retained, readable landing opens that
  comparison. An older card with insufficient evidence may show the
  comparison as unavailable. A verified empty comparison reads as no changes.

#### Starting evidence

- **Recently done** renders standalone ad hoc records as session entries.
  The published Done card's review action resolves by story identity. The
  [existing ad hoc association](../../dashboard/AGENT-LAUNCH-REVIEW.md)
  can locate a uniquely evidenced published Done story and leaves standalone
  sessions without a review action of their own.
- The [landing handoff](../../dashboard/AGENT-LAUNCH-COMPLETION.md)
  already retains the publication base and accepted revision by launch
  reference for an established ad hoc session that lands through Dough. Start
  with exposing that fixed comparison through the existing diff panel.
- The [default ad hoc launch path](../../dashboard/src/unattachedSession.ts)
  skips the Git setup that supplies the starting revision. For future launches,
  capture a trustworthy starting point and result while they are available.
  On shared trunk or after a manual integration, require evidence tying the
  commits or delivery range to the session. A before-and-after read of a moving
  trunk can include other work.
- [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
  treats session evidence as local and remote Git as the authority for
  published integration.
