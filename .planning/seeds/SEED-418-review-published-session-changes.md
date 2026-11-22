---
id: SEED-418
status: active
planted: 2026-11-20
planted_during: Terry's review of cross-machine session attribution and follow-up context
trigger_when: selected from the product backlog
scope: six stories
---

# SEED-418 — Review published changes by session

A developer should be able to find what a session contributed from any machine with the project repository. Today a completed story can be reconstructed from published history, while session comparisons depend on local launch records. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state) places the published association in the repository.

The [unified Intent review seed](SEED-420-unified-intent-review.md) owns
the review destination, the Recent stories regression and the identity of
standalone Done work. This seed owns session attribution and selection.

<a id="attribute-every-workflow-session-record"></a>

### Attribute every workflow session’s published changes

**Identity:** SEED-418#attribute-every-workflow-session-record
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#attribute-every-workflow-session-record","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"Every workflow's record extends the published record format, its publication path and the Dashboard reader that the standalone story establishes; defining them twice would split one contract.","condition":"A standalone Land publishes the versioned session record on trunk and a second machine reviews it through the Dashboard's published-record reader.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. The earlier wait named the missing route: no real Land reached publishSessionClose. SEED-418#correct-published-session-review delivered it in eed84c8c4 (plan 746 slice 2): Dough Land's publisher choice sends ordinary reviewed work with the launch's Dashboard landing context to publishSessionClose under the launch reference, and 48b697b58 installed that guidance and its modules. At 107ac15cb, Distribution/tests/skills/dough-land/session-record-publication.test.mjs passed 4 cases, including a Dashboard-launched Land publishing the record of its accepted comparison to the remote under the launch reference, and e2e/sessions/recently-done-published-sessions.spec.ts reviews another machine's record through the Dashboard's published-record reader after trunk advances.\nCondition satisfied: A standalone Land publishes the versioned session record on trunk and a second machine reviews it through the Dashboard's published-record reader.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/747-attribute-every-workflow-session-record/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e0b09f810be8d6485aa85ce073ec2f712d154ad217fe7688e69ea2f240b70f33","plan":"6ed4f2a983012e516f11ce544a6b2c94601af87af098b6ed0df430f3378f7692"}}
```

Split on 2026-11-21 from `SEED-418#review-published-session-changes` at its
delivered slice boundary. That story keeps the standalone outcome and supplies
the published record contract and its Dashboard reader.

**Goal.** A developer on another machine can review what an individual
publishing session contributed. Its UUID identifies the same contribution
across repeated refinements, execution increments, and later story follow-ups.

**Scope.** Extend the standalone Land record to publishing sessions closed
through Land or Story Wrap-up, including refinement, execution, standalone
ad hoc work, and ad hoc story follow-ups. Use the launch UUID when supplied
and retain a session UUID for native starts. Publish one record with the
workflow, original close time, story identity when associated, and ordered
comparisons for that session's accepted work. Include earlier accepted trunk
and story-branch work when its comparison becomes reachable from trunk.
Exclude intervening contributions, unsuccessful push attempts, unpublished
edits, and the record's own publication. When shared-checkout evidence cannot
distinguish individual contributions, mark the affected ranges and show the
uncertainty in the review. A close retry keeps the original record and resumes
its first unfinished step.

Use the existing published-session review to open and inspect each range for
a UUID. Keep repository-backed records current until 30 days after close.
At expiry they leave current review, and the next authorized session-record
publication prunes their files from the current snapshot. Earlier Git
snapshots retain them. Story-card session selection, combined comparisons
across sessions, historical recovery, and passing a selected UUID into a
follow-up remain with their linked stories.

**Key examples.**

- An execution publishes two increments with a different writer's change in
  between, then wraps up. A developer using only another clone opens its
  UUID and can inspect both contributions. Neither comparison includes the
  intervening change. In Story Branch Mode, the developer can still read the
  original branch hashes after integration and retirement without reviewing
  the same contribution twice.
- A refinement lands, then an ad hoc follow-up to that story lands. Each
  UUID resolves its own changes and carries the same story identity. If
  another session was writing in the follow-up's checkout, the affected
  comparison discloses the overlap and omits changes received only by pull.
- Work reaches trunk but the record push fails or loses its response. A
  retry keeps the UUID, close time and accepted comparisons. The repository
  ends with one record and one publication of the work.
- Just before 30 days a record is available to review. At 30 days it leaves
  current review. The next authorized close removes its file while preserving
  live records and the expired record's earlier Git snapshot.

**Architecture.** [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
places durable attribution in the repository. Assemble records from accepted
publication evidence. Keep launch state, conversations, workspace paths and
native controls on the originating machine. The UUID and the published
repository are sufficient to review the comparisons.

<a id="select-a-story-session-for-review"></a>

### Choose a session in a story’s change review

**Identity:** SEED-418#select-a-story-session-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#select-a-story-session-for-review","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"The story picker reads published records through the same contract and reader rather than defining its own.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts (empty launch storage, trunk advanced) prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published records for every workflow with story association","rationale":"The story picker must resolve refinement, execution and follow-up contributions recorded by other machines.","condition":"Published session records identify individual contributions of refinement, execution and ad hoc story follow-ups and the associated story when present.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

In the shared Intent review, **Sessions** defaults to the whole story.
A developer can choose one completed session from the story's refinements,
execution and linked follow-ups, including follow-ups after story completion.
Name repeated refinements individually. With **All changes**, inspect the
chosen session's contribution. With **Landed runs**, show its recorded runs
under the same session and allow selection when it has several. A session
without a landing stays selected with an explanation. Source, diff and Proof
use that selection.

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

Use the same Sessions picker for one or several sessions and their runs.
Switching between All changes and Landed runs preserves the chosen sessions.
Proof names the measured revisions for that selection and offers per-range
evidence when the combined changes have no corresponding build.

<a id="recover-expired-session-reviews"></a>

### Recover expired session reviews from Git history

**Identity:** SEED-418#recover-expired-session-reviews
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#recover-expired-session-reviews","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"Historical recovery reads the same published record format and reviews it through the same reader.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Story association and 30-day expiry of published records","rationale":"Historical recovery needs records that carry their story association and actually age out of the current snapshot.","condition":"Session JSON records are published with stable UUIDs and story association, and their files age out of the current snapshot after 30 days.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

After the 30-day window removes a published session file from the current snapshot, a developer can find that session and review its contribution using the record in published Git history. Recover its original UUID, story association when present, and recorded comparison. Check from a second machine with no local launch history. This covers sessions for which the workflow previously published a record.
