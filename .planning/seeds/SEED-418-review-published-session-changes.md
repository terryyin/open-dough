---
id: SEED-418
status: active
planted: 2026-11-20
planted_during: Terry's review of cross-machine session attribution and follow-up context
trigger_when: selected from the product backlog
scope: published session attribution and Intent review
---

# SEED-418 — Review published changes by session

A developer should be able to find what a session contributed from any machine with the project repository. Today a completed story can be reconstructed from published history, while session comparisons depend on local launch records. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state) places the published association in the repository.

The [unified Intent review seed](https://github.com/terryyin/open-dough/blob/683bdd7d57da7559f695373d3f8424fc70dbb4a4/.planning/seeds/SEED-420-unified-intent-review.md) owns
the review destination and the Recent stories regression.
[Ad hoc story admission](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/seeds/SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions)
owns story association at startup. This seed owns session attribution and session
scope in Intent.

<a id="keep-session-review-proof-after-retirement"></a>

### Keep Intent's session review and its proof whole after the retirement

**Identity:** SEED-418#keep-session-review-proof-after-retirement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/883-keep-session-review-proof-after-retirement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f602919ef9b7fe5c66379feace0e565dcb70489878a8a031bb0e82f8ef8f6e54","plan":"0168badd9a01c6193f7d70758e9df99f3f989c801477004f9751a33c80183b8e"}}
```

**Goal.** A developer reviewing a story in Intent gets the scope the story
promised, and its maintainers keep the proof the retired Side panel review
used to carry, so Intent's diff and session review cannot regress silently.

**Scope.** Correct what the retrospective of
[Open session changes in Intent and retire the Side panel review](https://github.com/terryyin/open-dough/blob/d60293a1adee86582e595aa450738616b4954f38/.planning/seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review)
found: a story selected again after **Review session changes** returns to
that session instead of **Whole story**; Proof measures the whole story
while a chosen session is first read; the retirement deleted the only proof
of most of Intent's diff context expansion rules and of published sessions
kept across a refresh; the story's session list lives in Follow up's module; and some
test support and one E2E case are left over or redundant.
[Plan](../slice-plans/883-keep-session-review-proof-after-retirement/PLAN.md).

<a id="prove-or-retire-held-read-race-step"></a>

### Retire the held-read race step that cannot fail

**Identity:** SEED-418#prove-or-retire-held-read-race-step
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/890-prove-or-retire-held-read-race-step/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6ef6275af72f4a92172c9fb2314a2342885fdcea2f532b5e1b3d356b64c342f8","plan":"56e08a54f0a0f0cfbd70b7a13a742676bc08f7a747c79a2d5e4a5ce044ad1163"}}
```

**Goal.** Maintainers of Intent's session review keep only proof that can
fail: the Side panel journey stops paying for a step that no break of the
held-read race fails, while the stale-read guard it seemed to own stays
proved where the race can happen.

**Scope.** Correct what the retrospective of
[Keep Intent's session review and its proof whole after the retirement](#keep-session-review-proof-after-retirement)
found: the step "a held read never answers a later session's changes" in
`e2e/navigation/side-panel-content-replacement.spec.ts` was never shown to
fail. Remove that step and the setup only it uses, keeping the journey's
final-report frame. `useReviewRead.ts` and its staleness checks stay.
[Plan](../slice-plans/890-prove-or-retire-held-read-race-step/PLAN.md).

<a id="review-selected-sessions-together"></a>

### Review the combined changes of selected sessions

**Identity:** SEED-418#review-selected-sessions-together
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#review-selected-sessions-together","dependencies":[{"supplier":{"identity":"SEED-418#select-a-story-session-for-review","href":"seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review"},"implementation":"Individual session selection in story review","rationale":"A reviewer needs to identify the available story sessions and their individual comparisons before choosing a subset.","condition":"The story review offers individually identifiable sessions with their recorded comparisons.","state":"satisfied","resolution":{"revision":"d60293a1adee86582e595aa450738616b4954f38","path":".planning/seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review","summary":"Satisfied. Intent's Sessions choice lists each completed session of the story once, named by workflow and launch or close time, and each chosen session reads its own recorded comparison and ranges by published UUID (or says it published none). Proof: intent-story-compare-sessions.spec.ts, intent-story-compare-session-runs.spec.ts, e2e/intent/intent-session-scope.spec.ts, e2e/sessions/recently-done-published-sessions.spec.ts. Known limit: two sessions of one workflow closed in the same second share a label.\nCondition satisfied: The story review offers individually identifiable sessions with their recorded comparisons.\nAccepted integration: 01894a4f377ddc94c51a171b6c23cd652eac0e9d on origin/refs/heads/main."}}]}
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

Known limit to weigh when refining: the Recently done sessions sidebar reads
published records only for the project whose work is shown, so a row from
another project judges its review status from the local `doneAt` rather than
the published `closedAt` until that project is shown.

Also weigh when refining, from the retrospective of
SEED-418#keep-session-review-proof-after-retirement:
- Intent's `StorySummary` carries both `sessionChosen` and `session` from one
  chosen-session key. Choosing several sessions should make that one value.
- The Review scope dropdown is disabled while a read is pending, and choosing
  several sessions may mean several reads.

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
