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

<a id="attribute-every-workflow-session-record"></a>

### Attribute every workflow session’s published changes

**Identity:** SEED-418#attribute-every-workflow-session-record
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#attribute-every-workflow-session-record","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"Every workflow's record extends the published record format, its publication path and the Dashboard reader that the standalone story establishes; defining them twice would split one contract.","condition":"A standalone Land publishes the versioned session record on trunk and a second machine reviews it through the Dashboard's published-record reader.","state":"waiting","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Still waiting. The record contract, publishSessionClose and the Dashboard published-record reader are delivered and proved by E2E with a real publishSessionClose record, but the retrospective found that no real Land reaches publishSessionClose: native starts have no session UUID source and the Dashboard-launched route never names it. Next action: deliver SEED-418#correct-published-session-review (plan 746) slice 2, then re-judge on the next visit.\nCondition remains unresolved: A standalone Land publishes the versioned session record on trunk and a second machine reviews it through the Dashboard's published-record reader.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/747-attribute-every-workflow-session-record/PLAN.md","assessment":"not-ready","reasons":["Awaiting story refinement after the 2026-11-21 resplit from SEED-418#review-published-session-changes; plan 747 holds provisional slices only."],"basis":{"document":"11d676856e1669611abb2cac1d8ccf56bee8ff1e000537359b8fed7f7597e5f2","plan":"3a25c8e126548175674560106fc4964ce3912928262bee13f7f32ba749d0ed01"}}
```

Split on 2026-11-21 from `SEED-418#review-published-session-changes` at its
delivered slice boundary. That story keeps the standalone outcome and supplies
the published record contract and its Dashboard reader.

**Goal.** Every publishing session, not just a standalone Land, leaves a
faithful published record of what it contributed. A stable UUID lets later
story reviews and follow-ups refer to the same published contribution.

**Scope.** When Land or Story Wrap-up closes a refinement, execution or ad hoc
story follow-up session, publish its record in the published contract. Record
the story identity when associated, and the commits or exact comparison ranges
attributable to its published work, including earlier publications on trunk or
a story branch. A retry preserves the UUID and original close time. Record
multiple ranges when intervening work makes an enclosing range inaccurate.
Mark the affected ranges when a shared checkout makes attribution uncertain.
Use accepted Git evidence so work left locally and unsuccessful push attempts
stay outside the published comparison.

Keep records current for 30 days from close. The current review stops offering
the entry at expiry, and the next authorized session-record publication
removes expired files from the current snapshot.

**Key examples.**

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

**Architecture.** Follow the
original story’s architecture (`2d82175d5:.planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes`): records
come from accepted publication evidence, launch state stays on the originating
machine, and a UUID with readable Git endpoints remains sufficient after
workspace retirement.

<a id="select-a-story-session-for-review"></a>

### Choose a session in a story’s change review

**Identity:** SEED-418#select-a-story-session-for-review
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#select-a-story-session-for-review","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"The story picker reads published records through the same contract and reader rather than defining its own.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts (empty launch storage, trunk advanced) prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Published records for every workflow with story association","rationale":"The story picker must resolve refinement, execution and follow-up contributions recorded by other machines.","condition":"Published session records identify individual contributions of refinement, execution and ad hoc story follow-ups and the associated story when present.","state":"waiting"}]}
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
{"schemaVersion":1,"identity":"SEED-418#recover-expired-session-reviews","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session record contract and Dashboard reader","rationale":"Historical recovery reads the same published record format and reviews it through the same reader.","condition":"A published session record can be read and reviewed by UUID from a machine without local launch history.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Satisfied. A published record is read by UUID at the configured project's fetched trunk and reviewed through the review routes without local launch history: backend published-session-review specs and the E2E e2e/sessions/recently-done-published-session-second-machine.spec.ts prove it. Its dependency on SEED-418#attribute-every-workflow-session-record still blocks it.\nCondition satisfied: A published session record can be read and reviewed by UUID from a machine without local launch history.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-418#attribute-every-workflow-session-record","href":"seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record"},"implementation":"Story association and 30-day expiry of published records","rationale":"Historical recovery needs records that carry their story association and actually age out of the current snapshot.","condition":"Session JSON records are published with stable UUIDs and story association, and their files age out of the current snapshot after 30 days.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

After the 30-day window removes a published session file from the current snapshot, a developer can find that session and review its contribution using the record in published Git history. Recover its original UUID, story association when present, and recorded comparison. Check from a second machine with no local launch history. This covers sessions for which the workflow previously published a record.

<a id="name-unavailable-published-session-review"></a>

### Name an unavailable published-session review as published changes

**Identity:** SEED-418#name-unavailable-published-session-review
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/750-name-unavailable-published-session-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c11c970164f752d18735e71e651adf80e6aa9af9045fcc5d4f82701c781f7a6a","plan":"c3f2188e5ec3f5575b7be298beb381a6bd05a928353c0371bc5a42daecf0a700"}}
```

Correction from the outcome review of
SEED-418#correct-published-session-review
(`6302d70889f6b798df1fd8d8a5381e71d729f3ae:.planning/slice-plans/746-correct-published-session-review/PLAN.md`,
range `126fabd26..576150249`). Plan 746's promises stay as written.

**Goal.** A developer who opens a published session whose recorded commits
this machine lacks still sees a published-session gap: the review chrome
names published changes, not kept session commits.

**Scope.** Replace the published review's reuse of
`unavailableSessionCommitsReview` so an unavailable published answer carries
a published-session comparison and the page's published-session naming.
Kept-session unavailable gaps stay unchanged. Plan:
[750](../slice-plans/750-name-unavailable-published-session-review/PLAN.md).
