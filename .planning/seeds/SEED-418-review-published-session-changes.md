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
owns story association at startup. This seed owns session attribution, session
scope in Intent, and session review status.

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

<a id="review-scope-dropdown"></a>

### Choose review scope from a compact dropdown

**Identity:** SEED-418#review-scope-dropdown
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#review-scope-dropdown","dependencies":[{"supplier":{"identity":"SEED-418#select-a-story-session-for-review","href":"seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review"},"implementation":"Single-session scope in Intent review","rationale":"Current Intent has no story-to-session selector or session-card entry into that review. Reusing the published listing alone would still require the consumer to build the supplier's scope and route, and concurrent selectors would duplicate ownership of the active comparison.","condition":"Intent review opens from story and session cards and can switch between the whole story and the available individual sessions using one scope that drives the comparison.","state":"satisfied","resolution":{"revision":"d60293a1adee86582e595aa450738616b4954f38","path":".planning/seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review","summary":"Satisfied. Intent opens from a Story card's Review changes at Whole story and from a Done card's Review session changes at that session, and its Sessions choice switches between Whole story and each retained or published session through one scope (useStorySessionScope) that drives the comparison, Proof and Follow up. Proof: dashboard/frontend-tests/intent/intent-session-review-opening.spec.ts, intent-story-compare-sessions.spec.ts, e2e/intent/intent-session-scope.spec.ts, e2e/sessions/recently-done-published-sessions.spec.ts. Known limits queued in SEED-418#keep-session-review-proof-after-retirement: reselecting a story after a session opening returns to that session; two sessions of one workflow closed in the same second share a label.\nCondition satisfied: Intent review opens from story and session cards and can switch between the whole story and the available individual sessions using one scope that drives the comparison.\nAccepted integration: 01894a4f377ddc94c51a171b6c23cd652eac0e9d on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/878-choose-review-scope-from-a-compact-dropdown/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6655adc07ea231e8f0f086b027c3a2eba0e7a5e4d3a9b1d50de46bc3bd500f09","plan":"6aa952490dcf54ef0236c99369e42baf8d2369beb8309d0cab6ccb82c3d3e40f"}}
```

**Goal.** A developer reviewing a story in Intent can identify the scope of
the evidence and switch to the intended session on a narrow screen, even
when several session titles are long.

**Scope.** Use a compact dropdown for the whole story and the individual
sessions available to the existing Intent review. Its closed state identifies
the current scope, including a scope set by opening review from a session
card. The open dropdown makes long titles readable and options reachable by
touch and keyboard. Moving through choices and dismissing the dropdown
preserves the selected comparison. Confirming a choice applies that scope
through the existing review and leaves the picker available for the next
choice. Show an ad hoc session's own title from its retained launch and
communicate its ad hoc identity through a simple icon with an accessible
name. When the title is unavailable, say so and show the published close
time if available so the reviewer can tell sessions apart.

Multi-session selection, ad hoc details on Intent Home, and saving
per-session review status belong to the following stories in this seed.

**Key examples.**

- On a narrow screen, a story opens at whole-story scope and lists several
  sessions with long titles. The developer opens the dropdown, reads the
  full title of the intended follow-up and chooses it. The dropdown closes
  within the available width and identifies the selected follow-up, and the
  review shows that session's comparison.
- A session card opens Intent with its session selected. The developer
  opens the dropdown with the keyboard, moves to another option, and
  presses Escape. Focus returns to the picker and the original scope and
  comparison still show. Reopening and choosing the whole story switches
  the label and comparison together.
- A published ad hoc session is available on a machine without its launch
  history. Opening the dropdown shows **Title unavailable**, the ad hoc
  icon, and the session's close time. Selecting that option keeps the
  session selected and shows its recorded comparison.

**Architecture.** Intent owns the selected story or session scope shared by
its review surfaces. Choose by the existing session identity so label
similarity or title availability cannot change the comparison.
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
defines the shared scope and the role of published and machine-local facts.
Read titles from the existing retained launch associated with the session.
Use the published close record for the session's workflow, close time, and
comparison. Titles remain machine-local.

<a id="show-selected-session-in-review-home"></a>

### Show the selected ad hoc session on Intent Home

**Identity:** SEED-418#show-selected-session-in-review-home
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-418#show-selected-session-in-review-home","dependencies":[{"supplier":{"identity":"SEED-418#select-a-story-session-for-review","href":"seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review"},"implementation":"Single-session review scope in Intent","rationale":"Intent currently selects a story only. This story adds information about a session already selected in Intent. It needs the supplier's session selection, including the Whole story reset and a selection that survives returning Home.","condition":"Intent can select an individually identifiable retained or published story session, keep that scope on Home, and return to Whole story.","state":"waiting","resolution":{"revision":"d60293a1adee86582e595aa450738616b4954f38","path":".planning/seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review","summary":"Still waiting. Delivered: Intent selects an individually identifiable retained or published session and returns to Whole story (intent-story-compare-sessions.spec.ts, intent-session-review-opening.spec.ts). Not verified: no observation shows the chosen scope kept when the reviewer goes to the story's Intent Home and back. Next action: observe that the session scope survives Home (supplier gap), or move that clause into this story's scope when it is prepared; SEED-418#keep-session-review-proof-after-retirement also changes when a session scope resets on reselection.\nCondition remains unresolved: Intent can select an individually identifiable retained or published story session, keep that scope on Home, and return to Whole story.\nAccepted integration: 01894a4f377ddc94c51a171b6c23cd652eac0e9d on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/877-show-selected-ad-hoc-session-on-intent-home/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ef0513b03d3fde6a1ed55d2c94b7413091a5102dc9ccb1c3b4c16588226f5e8f","plan":"413260afe0c544ccea7d402abd6a56de5cac0d7967bf88f37b8c85bd598d824b"}}
```

**Goal.** A developer reviewing an ad hoc contribution can identify the
selected session and read what it was asked to do before interpreting its
evidence in Intent.

**Scope.**

- At the top of the story's Intent Home, above the CI comparison, show the
  selected session's title, its **Ad hoc** workflow and session identifier,
  and the original instruction from its retained launch, when available.
  Keep the CI comparison accessible on the same page.
- Resolve the details from the current review scope. If the selection is a
  published ad hoc session without a retained launch, identify it by its
  published session ID and indicate that its title and instruction are
  unavailable. If a retained launch has no instruction text, show its
  available title and identity and say the instruction is unavailable.
- Whole story and other workflows use the usual story Home. Returning to
  Home from a file shows the details for the scope still selected.

**Scope limits.** Use the existing single-session review scope and existing
launch and published session records. The compact picker, publication of
launch metadata, review status and comparison changes are outside this story.

**Key examples.**

- Two follow-ups have different titles and instructions. Choose the first
  and open Home. Its title, Ad hoc workflow, session identifier and
  instruction appear above CI. Switch to the second and only its details
  appear. Choose **Whole story** and the usual story Home returns.
- Choose a published ad hoc session on a machine with no retained launch.
  Its published ID identifies it, the title and instruction are shown as
  unavailable, and the CI comparison is still accessible.
- Choose a retained ad hoc session with no instruction text. Home shows its
  title and identity and explains that the instruction is unavailable.

<a id="track-review-state-per-session"></a>

### Track review status for each session

**Identity:** SEED-418#track-review-state-per-session
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/882-track-review-status-for-each-session/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"05dc14488f5768ea5e00d0077eaad360f4e5908deab6acd049196610b25a3393","plan":"bf76f2554b8578b6705d329ffbaacb384958f622ef32716f19fb56a22872ad33"}}
```

**Goal.** A developer can record, on this machine, which of a story's
completed sessions they have reviewed, see that status on each session, and
see whether those sessions are all, partly, or not yet reviewed. Marking the
story reviewed covers the sessions that are reviewable now. A session
completed after that mark still asks for review.

**Scope.**

A reviewable session is a completed session of the story shown for review: a
retained completed session or follow-up, or a published session with no
retained launch. A retained session and its published record count once. A
completed session with nothing to compare is still reviewable. An open
session is not.

Each reviewable session entry offers **Mark as reviewed** while it is
unreviewed, and **Reviewed** once it is. **Reviewed** asks "Unreview this
session?" before clearing that session; cancelling leaves it reviewed. The
entry shows that session's saved status. In Recently done, **Needs review**
follows the session: it shows only while that session is unreviewed, and it
names the session rather than the story. A reviewed session in a partly
reviewed story does not show it.

The story card derives its status from the current reviewable sessions:

- When none are reviewed, it offers **Mark as reviewed** and shows no
  reviewed badge.
- When some are reviewed, it shows **Partially reviewed**. **Mark as
  reviewed** marks every current reviewable session reviewed.
- When all are reviewed, it offers **Reviewed**. Confirming "Unreview this
  story?" clears every current reviewable session.

A story with no reviewable session keeps today's control. **Mark as
reviewed** saves that the story was reviewed; **Reviewed** clears that mark.

Marks stay on this machine, survive reload and a dashboard restart, and are
not written into the repository. A save that fails leaves the last saved
statuses and says the review state could not be saved. Marking or unreviewing
does not change the selected story or the Side panel.

A story saved as reviewed at a time T is reviewed for every reviewable
session completed at or before T, including one this machine learns about
later. A session completed after T starts unreviewed. **Mark as reviewed**
saves that time, whether or not any session is reviewable yet. Marking or
unreviewing one session replaces that credit for that session only.
Unreviewing the story removes the saved mark, so a session learned afterwards
does not become reviewed from it.

**Scope limits.** Intent's review, the scope dropdown, and Intent Home do not
show or change this status. Combined review of several sessions, a separate
status per landed run, and recovery of expired records belong to the other
stories in this seed. Open sessions are not marked. Review marks are not
shared with another machine: they are this developer's judgment on the
machine serving the dashboard, the same local operational evidence
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
already keeps out of published project facts.

**Key examples.**

- A story has two completed sessions. Mark the first reviewed. Its entry
  shows **Reviewed** and no **Needs review** cue; the second still offers
  **Mark as reviewed** and shows **Needs review**. The story shows
  **Partially reviewed**. **Mark as reviewed** on the story marks both, and
  the story shows **Reviewed**.
- Unreview the second session. The story returns to **Partially reviewed**
  and that session shows **Needs review**. The first stays **Reviewed**.
- Both sessions are reviewed. A follow-up then completes. The follow-up is
  unreviewed, and the story shows **Partially reviewed**.
- The story was marked reviewed before this change, when both sessions were
  already complete. After the change both are reviewed. A follow-up that
  completed after that mark is unreviewed, and the story shows **Partially
  reviewed**.
- A published session from another machine closed before that same mark.
  This machine has no launch for it. Its entry is reviewed. A published
  session that closed after the mark is unreviewed.
- Unreview the story. Both current sessions are unreviewed, and a published
  session from before the old mark that this machine loads afterwards is
  unreviewed too.
- The story has no completed session. **Mark as reviewed** shows
  **Reviewed**. A session that completes afterwards is unreviewed, and the
  story offers **Mark as reviewed**.
- Saving fails. The entries stay as last saved and say the review state
  could not be saved. A later successful mark is kept after reload and a
  dashboard restart, and the repository is unchanged.

**Architecture.** Review status stays machine-local, keyed by one session
identity: the published session id when the session has one, so a retained
launch and its published record share the mark; otherwise the retained host
and session id. The story card's none, partial, and all status is derived
from the current reviewable sessions and any credit inherited from a saved
story mark. It is not a second published fact.

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
