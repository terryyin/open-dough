---
id: SEED-418
status: active
planted: 2026-11-20
planted_during: Terry's review of cross-machine session attribution and follow-up context
trigger_when: selected from the product backlog
scope: four stories
---

# SEED-418 — Review published changes by session

A developer should be able to find what a session contributed from any machine with the project repository. Today a completed story can be reconstructed from published history, while session comparisons depend on local launch records. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state) places the published association in the repository.

<a id="review-published-session-changes"></a>

### Review a session’s published changes from another machine

**Identity:** SEED-418#review-published-session-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/739-review-published-session-changes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"05912cc0ffb2acaf645b3dbc9e6987d17c668eb9bf2b8956e4f1d5149c16d28a","plan":"949d9ec0dbae3344395512b0b5700e0210878ad0583fd1dc952c088998aba261"}}
```

**Goal.** A developer can open **Review changes** for a standalone Done
session on another machine and see what it contributed to the project. A
stable UUID also lets later story reviews and follow-ups refer to the same
published contribution.

**Scope.** When Land or Story Wrap-up closes a publishing session, publish
one JSON record in the project repository. Record the session UUID, workflow,
close time, story identity when associated, and the commits or exact comparison
ranges attributable to its published work. This covers refinement, execution,
standalone ad hoc work, and ad hoc story follow-ups, including earlier
publications on trunk or a story branch. A retry preserves the UUID and original
close time. Record multiple ranges when intervening work makes an enclosing
range inaccurate. Mark the affected ranges when a shared checkout makes
attribution uncertain. Use accepted Git evidence so work left locally and
unsuccessful push attempts stay outside the published comparison.

The existing standalone Done entry offers **Review changes** on a machine with
the published repository and no local launch history. Keep records current for
30 days from close. The current review stops offering the entry at expiry, and
the next authorized session-record publication removes expired files from the
current snapshot. Story-session selection, combined comparisons, recovery of
expired reviews from Git history, and carrying the UUID in a follow-up message
belong to their linked stories.

**Key examples.**

- A standalone session lands a file edit. A developer with a fresh clone opens
  its Done entry, selects **Review changes**, and reads the file diff even
  after the original workspace is retired and trunk has advanced.
- An execution publishes twice with another session's trunk change in between.
  At wrap-up, its UUID resolves both contributions while excluding the
  intervening change. An earlier story-branch publication still resolves after
  history-preserving integration and branch retirement. A refinement and a
  later ad hoc story follow-up each have their own UUID and the associated story
  identity.
- Two sessions share a checkout. When one closes, its record identifies which
  published comparison may contain the other session's work. Retrying a close
  after an interrupted response yields the same record, with its initial close
  time and attributable comparisons.
- At 30 days from close, a repository-backed entry leaves the current review.
  A later authorized session-record publication prunes its file, and the
  earlier Git snapshot still holds the original record.

**Architecture.** [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
places attribution in the published repository. The workflow assembles the
record from accepted publication evidence and the Dashboard reads that record
through the configured project. Keep launch state, conversations, workspace
paths, and native session controls on the originating machine. A UUID and
readable Git endpoints must remain sufficient after workspace retirement.

<a id="select-a-story-session-for-review"></a>

### Choose a session in a story’s change review

**Identity:** SEED-418#select-a-story-session-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#select-a-story-session-for-review","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session UUID and attributable changes","rationale":"The story picker must resolve contributions recorded by other machines.","condition":"Published session records identify individual contributions and the associated story when present.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

In a story’s **Review changes**, a developer can choose one completed session and inspect its contribution. Offer refinements, execution, and linked ad hoc follow-ups, including follow-ups published after story completion. Identify repeated refinements individually and explain a missing comparison for the selected session.

Given two refinements, execution, and a follow-up on another machine, selecting the second refinement shows the changes attributed to that refinement. The whole-story comparison remains available.

<a id="review-selected-sessions-together"></a>

### Review the combined changes of selected sessions

**Identity:** SEED-418#review-selected-sessions-together
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#review-selected-sessions-together","dependencies":[{"supplier":{"identity":"SEED-418#select-a-story-session-for-review","href":"seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review"},"implementation":"Individual session selection in story review","rationale":"A reviewer needs to identify the available story sessions and their individual comparisons before choosing a subset.","condition":"The story review offers individually identifiable sessions with their recorded comparisons.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer can select several sessions in the story review and see their net effect. For example, selecting execution and a subsequent fix shows the final version of the corrected line once. Preserve each session’s identity so the reviewer can inspect its contribution.

A skipped session or an unrelated trunk change can fall between two selections. Exclude that work from the combined result. Where a selected edit depends on an excluded change and the net result cannot be separated faithfully, explain the gap and offer the selected comparisons individually.

<a id="recover-expired-session-reviews"></a>

### Recover expired session reviews from Git history

**Identity:** SEED-418#recover-expired-session-reviews
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#recover-expired-session-reviews","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session UUID and attributable changes","rationale":"Historical recovery needs an actual published record format and its expiry behavior.","condition":"Session JSON records are published with stable UUIDs and their files age out of the current snapshot after 30 days.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

After the 30-day window removes a published session file from the current snapshot, a developer can find that session and review its contribution using the record in published Git history. Recover its original UUID, story association when present, and recorded comparison. Check from a second machine with no local launch history. This covers sessions for which the workflow previously published a record.
