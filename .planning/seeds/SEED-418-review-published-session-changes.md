---
id: SEED-418
status: active
planted: 2026-11-20
planted_during: Terry's review of cross-machine session attribution and follow-up context
trigger_when: selected from the product backlog
scope: seven stories
---

# SEED-418 — Review published changes by session

A developer should be able to find what a session contributed from any machine with the project repository. Today a completed story can be reconstructed from published history, while session comparisons depend on local launch records. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state) places the published association in the repository.

The [unified Intent review seed](SEED-420-unified-intent-review.md) owns
the review destination, the Recent stories regression and the identity of
standalone Done work. This seed owns session attribution and selection.

<a id="disclose-shared-checkout-overlap"></a>

### Disclose shared-checkout overlap in published session records

**Identity:** SEED-418#disclose-shared-checkout-overlap
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/766-disclose-shared-checkout-overlap/PLAN.md","assessment":"not-ready","reasons":["Split from SEED-418#attribute-every-workflow-session-record at delivered slice 7; awaiting story refinement of goal, scope and examples and realignment of provisional plan 766, including the cross-component overlap design (the publisher cannot read the Dashboard's local launch records) and its split into at least two slices."],"basis":{"document":"410f52a8c710b872317557a39e771fd03036ab190f10f141951062af3ab7b621","plan":"ea3d1335d7c7fa5c3072f733684e53ef965e736f6503064f27aeff250335becc"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#disclose-shared-checkout-overlap","dependencies":[{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published session records with ordered accepted comparisons for every publishing workflow","rationale":"Overlap disclosure marks ranges in the records that every workflow's close publishes; until those records and their shared publisher are on trunk there are no ranges to mark.","condition":"Every publishing workflow publishes one session record with its ordered accepted comparisons on trunk, and another machine reviews each range in the published-session review.","state":"waiting"}]}
```

Split on 2026-11-22 from `SEED-418#attribute-every-workflow-session-record`
at its delivered slice 7. That story publishes every workflow session's
record and its accepted comparisons.

**Goal.** A developer reviewing a published session from another machine can
see when one of its comparisons may include another session's work from the
same checkout.

**Scope.** When shared-checkout evidence cannot distinguish individual
contributions, mark the affected ranges in the published record and show the
uncertainty in the published-session review. Changes received only by pull
and unpublished edits stay outside the record. A session in an isolated
checkout, or one that did not overlap another, shows no warning.

**Key examples.**

- An ad hoc story follow-up lands while another session was writing in its
  checkout. Its published comparison discloses the overlap and omits changes
  received only by pull. A follow-up in its own worktree shows no warning.

**Design finding.** Execution of the original story found that the
Dashboard's overlap rule `checkoutSharedMeanwhile`
([`sessionCheckoutShared.ts`](../../dashboard/server/sessionCheckoutShared.ts)),
which Done capture uses, reads local launch records that the Distribution
publisher cannot see. Recommended for refinement: the Dashboard evaluates
overlap at launch and writes a shared-checkout note beside each open
session's landing context. The publisher marks ranges accepted at or after the
overlap start with an optional per-range `uncertainty: "shared-checkout"`. The
published review reuses the Done shared-checkout warning wording. This is too
large for one slice; split it into the note and range marking, then the review
display end to end.

<a id="expire-published-session-records"></a>

### Expire published session records after 30 days

**Identity:** SEED-418#expire-published-session-records
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/767-expire-published-session-records/PLAN.md","assessment":"not-ready","reasons":["Split from SEED-418#attribute-every-workflow-session-record at delivered slice 7; awaiting story refinement and realignment of provisional plan 767 against the delivered shared record publication; pruning on publication retry is unobserved."],"basis":{"document":"7a9d3598e72bf4a372a3ade297d64e9bef2b95964ef7907476a87fce17f4e492","plan":"2f3727c84afdd2d3c8a951b35e9050d786646ab3d04803b467d248c536395198"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#expire-published-session-records","dependencies":[{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published session records with original close time and their shared record publication","rationale":"Expiry reads each record's original close time, and pruning runs in the session-record publication every workflow's close shares; both arrive with that story's integrated outcome.","condition":"Every publishing workflow publishes one session record with its original close time on trunk through the shared session-record publication.","state":"waiting"}]}
```

Split on 2026-11-22 from `SEED-418#attribute-every-workflow-session-record`
at its delivered slice 7. That story publishes every workflow session's
record with its original close time.

**Goal.** The current repository snapshot and published-session review offer
only recent session records, while Git history keeps the older ones.

**Scope.** Keep repository-backed records current until 30 days after close.
At expiry they leave current review, and the UUID route reports them
unavailable even when the file still exists at the fetched revision. The next
authorized session-record publication prunes expired files from the current
snapshot while preserving live records, including one a concurrent writer
publishes. Earlier Git snapshots retain them. Recovering an expired session
from history remains with
[Recover expired session reviews from Git history](#recover-expired-session-reviews).

**Key examples.**

- Just before 30 days a record is available to review. At 30 days it leaves
  current review. The next authorized close removes its file while preserving
  live records and the expired record's earlier Git snapshot.

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
{"schemaVersion":1,"identity":"SEED-418#recover-expired-session-reviews","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"Historical recovery reads the same published record format and reviews it through the same reader.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Story association of published records","rationale":"Historical recovery needs records that carry their stable UUID and story association.","condition":"Session JSON records are published with stable UUIDs and story association.","state":"waiting"},{"supplier":{"identity":"SEED-418#expire-published-session-records","href":"seeds/SEED-418-review-published-session-changes.md#expire-published-session-records"},"implementation":"30-day expiry and pruning of published records","rationale":"Historical recovery applies only once records actually age out of the current snapshot.","condition":"Published session records leave current review 30 days after close, and an authorized session-record publication prunes their files from the current snapshot.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

After the 30-day window removes a published session file from the current snapshot, a developer can find that session and review its contribution using the record in published Git history. Recover its original UUID, story association when present, and recorded comparison. Check from a second machine with no local launch history. This covers sessions for which the workflow previously published a record.
