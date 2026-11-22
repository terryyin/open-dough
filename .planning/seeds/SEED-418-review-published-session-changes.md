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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/766-disclose-shared-checkout-overlap/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"46001d5a4d830442936680a8332eb85ac4ed0a6519ff941810b044f9612a8205","plan":"332fd5f1a16345250d2a85cf84703f7294c66daabf6794a04226314d8d0808f3"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#disclose-shared-checkout-overlap","dependencies":[{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published session records with ordered accepted comparisons for every publishing workflow","rationale":"Overlap disclosure marks ranges in the records that every workflow's close publishes; until those records and their shared publisher are on trunk there are no ranges to mark.","condition":"Every publishing workflow publishes one session record with its ordered accepted comparisons on trunk, and another machine reviews each range in the published-session review.","state":"satisfied","resolution":{"revision":"c546ff771b47b42f549a153cbbef4604bb89560d","path":".planning/seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record","summary":"Satisfied: every publishing workflow (refinement, Trunk and Story Branch execution, Dashboard-launched ad hoc Land and ad hoc story follow-ups) publishes one record with ordered accepted comparisons through the shared sealed-session-record publisher, and another clone reviews each range. A native ad hoc Land without a retained session identity still writes no record (recorded product advice). Delivered at before-cleanup c546ff771 and integrated on main at 3dbaff36c. Proof: Land closes (Distribution/tests/skills/dough-land/session-record-publication.test.mjs, session-close-resume.test.mjs), Trunk Mode wrap-up (dough-story-wrap-up/trunk-closure-session-record*.test.mjs read from a default-branch-only clone), Story Branch wrap-up (story-branch-session-record.test.mjs), refinement and ad hoc follow-up Lands (dough-story-refinement/preparation-*session-record-land.test.mjs), and another machine reviewing each range (e2e/sessions/recently-done-published-sessions.spec.ts).\nCondition satisfied: Every publishing workflow publishes one session record with its ordered accepted comparisons on trunk, and another machine reviews each range in the published-session review.\nAccepted integration: 3dbaff36c0b21730ff23ba5948b5199522b0f103 on origin/refs/heads/main."}}]}
```

Split on 2026-11-22 from `SEED-418#attribute-every-workflow-session-record`
at its delivered slice 7. That story publishes every workflow session's
record and its accepted comparisons.

**Goal.** A developer reviewing a published session from another machine can
see when one of its comparisons may include another session's work from the
same checkout, so they do not attribute that work to the wrong session.
An agent can also resume an interrupted Land close from local per-session
state and follow concise guidance for publication and recovery.

**Scope.**

- The Dashboard already knows when two of its launched sessions are open in
  the same checkout ([`checkoutSharedMeanwhile`](../../dashboard/server/sessionCheckoutShared.ts),
  which Done capture uses). Overlap can begin after a session launches, when
  another session later opens in its checkout. Whenever that happens, the
  Dashboard keeps, beside each affected open session's landing context, when
  the overlap began. The publisher cannot read local launch records, so this
  note is its only overlap evidence.
- At close, the publisher marks each published range accepted at or after the
  overlap start with an optional `uncertainty: "shared-checkout"`. Records and
  ranges without it stay readable and show no warning.
- The published-session review shows the marked range with the existing Done
  warning: "Another session was open in the same checkout during that time, so
  the comparison may include that session's work."
- Only that uncertainty is published; launch records stay local under
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
- A published range is the accepted pair from the trunk the session built on
  to its landed commit, so changes received only by pull and unpublished edits
  already stay outside it; this story keeps that and adds nothing for it.
- Scope limits: a close without a Dashboard landing context (a native
  session, or a Default main launch that establishes no session) has no
  overlap evidence and publishes no mark; installations that predate the note
  publish unmarked records. Identifying which session made which change in a shared checkout is
  not attempted.
- Land keeps the close's recovery state locally by session, even when several
  sessions share a checkout. Simplify the affected Land and wrap-up references,
  including older passages that describe script internals.

**Key examples.**

- Two Dashboard sessions work in the Default main checkout at the same time;
  one lands a story follow-up. From another clone, its published range shows
  the shared-checkout warning, and a commit the checkout received only by pull
  before the work is absent from the comparison.
- A session launches alone in the Default main checkout; a second session
  opens there later, before the first lands. The first session's landed range
  still shows the warning.
- A follow-up in its own worktree, or a Default main session that closed
  before another one opened there, shows no warning.
- Two closes share a checkout. After an unanswered push, each resumes its own
  close without reconstructing the range or pushing accepted work again.

<a id="prune-expired-records-after-a-retried-record-commit"></a>

### Keep the expired-record prune when a record commit is retried

**Identity:** SEED-418#prune-expired-records-after-a-retried-record-commit
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/769-prune-expired-records-after-a-retried-record-commit/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"34e9dc1e71b75b410ff6acac243d8d51f2f6b494d0fa7bce9faa03c22df3d43b","plan":"6ebb4d90d3f8a49990ab46c5c2273b82ce3dbb679069ee1a55a85948f0d04743"}}
```

Correction found by the execution retrospective of
Expire published session records after 30 days (`16cebb43ec9588615183f7286427a62a3ee85a55:.planning/seeds/SEED-418-review-published-session-changes.md#expire-published-session-records`).

**Goal.** A developer whose session close resumes after its record commit
failed gets the same record commit a first attempt would have made: its own
record plus the removal of the expired records, with no deletion left staged
in the workspace.

**Scope.** The record commit's selection and commit of expired record files in
the shared sealed-record publisher, when that commit is retried after a
failure. Plan: [769](../slice-plans/769-prune-expired-records-after-a-retried-record-commit/PLAN.md).

<a id="select-a-story-session-for-review"></a>

### Choose a session in a story’s change review

**Identity:** SEED-418#select-a-story-session-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#select-a-story-session-for-review","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"The story picker reads published records through the same contract and reader rather than defining its own.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts (empty launch storage, trunk advanced) prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published records for every workflow with story association","rationale":"The story picker must resolve refinement, execution and follow-up contributions recorded by other machines.","condition":"Published session records identify individual contributions of refinement, execution and ad hoc story follow-ups and the associated story when present.","state":"satisfied","resolution":{"revision":"c546ff771b47b42f549a153cbbef4604bb89560d","path":".planning/seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record","summary":"Satisfied: refinement, execution and ad hoc story follow-up records each identify their own contribution under a distinct UUID and carry the associated story identity. Delivered at before-cleanup c546ff771 and integrated on main at 3dbaff36c. Proof: Land closes (Distribution/tests/skills/dough-land/session-record-publication.test.mjs, session-close-resume.test.mjs), Trunk Mode wrap-up (dough-story-wrap-up/trunk-closure-session-record*.test.mjs read from a default-branch-only clone), Story Branch wrap-up (story-branch-session-record.test.mjs), refinement and ad hoc follow-up Lands (dough-story-refinement/preparation-*session-record-land.test.mjs), and another machine reviewing each range (e2e/sessions/recently-done-published-sessions.spec.ts).\nCondition satisfied: Published session records identify individual contributions of refinement, execution and ad hoc story follow-ups and the associated story when present.\nAccepted integration: 3dbaff36c0b21730ff23ba5948b5199522b0f103 on origin/refs/heads/main."}}]}
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
{"schemaVersion":1,"identity":"SEED-418#recover-expired-session-reviews","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"Historical recovery reads the same published record format and reviews it through the same reader.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Story association of published records","rationale":"Historical recovery needs records that carry their stable UUID and story association.","condition":"Session JSON records are published with stable UUIDs and story association.","state":"satisfied","resolution":{"revision":"c546ff771b47b42f549a153cbbef4604bb89560d","path":".planning/seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record","summary":"Satisfied: records are published under stable launch or retained native UUIDs and carry story association when present. Delivered at before-cleanup c546ff771 and integrated on main at 3dbaff36c. Proof: Land closes (Distribution/tests/skills/dough-land/session-record-publication.test.mjs, session-close-resume.test.mjs), Trunk Mode wrap-up (dough-story-wrap-up/trunk-closure-session-record*.test.mjs read from a default-branch-only clone), Story Branch wrap-up (story-branch-session-record.test.mjs), refinement and ad hoc follow-up Lands (dough-story-refinement/preparation-*session-record-land.test.mjs), and another machine reviewing each range (e2e/sessions/recently-done-published-sessions.spec.ts).\nCondition satisfied: Session JSON records are published with stable UUIDs and story association.\nAccepted integration: 3dbaff36c0b21730ff23ba5948b5199522b0f103 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#expire-published-session-records","href":"seeds/SEED-418-review-published-session-changes.md#expire-published-session-records"},"implementation":"30-day expiry and pruning of published records","rationale":"Historical recovery applies only once records actually age out of the current snapshot.","condition":"Published session records leave current review 30 days after close, and an authorized session-record publication prunes their files from the current snapshot.","state":"satisfied","resolution":{"revision":"16cebb43ec9588615183f7286427a62a3ee85a55","path":".planning/seeds/SEED-418-review-published-session-changes.md#expire-published-session-records","summary":"Satisfied: a published record past 30 days from its sealed closedAt answers 404 'This project published no such session.' for UUID review and file reads (dashboard/backend-tests/review/published-session-expiry.spec.ts) and leaves Recently done (dashboard/frontend-tests/sessions/recently-done-expired-published-sessions.spec.ts), by the shared isCurrentSessionRecord rule. Every session-record commit through sealed-session-record.mjs removes expired record files in the same commit, keeps live and unreadable ones, earlier snapshots keep them, and a concurrent writer's prune rebases cleanly (Distribution/tests/skills/dough-land/session-record-pruning.test.mjs). Plan 767 at the before-cleanup revision. A retried record commit after a failure can leave a prune staged; correction SEED-418#prune-expired-records-after-a-retried-record-commit is queued.\nCondition satisfied: Published session records leave current review 30 days after close, and an authorized session-record publication prunes their files from the current snapshot.\nAccepted integration: 894d3f45a9990676cd95e4bcfdbbcc8e952af171 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

After the 30-day window removes a published session file from the current snapshot, a developer can find that session and review its contribution using the record in published Git history. Recover its original UUID, story association when present, and recorded comparison. Check from a second machine with no local launch history. This covers sessions for which the workflow previously published a record.
