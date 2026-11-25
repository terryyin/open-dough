# Prove Story Notes and follow-up delivery in Node Vitest

**Identity:** SEED-413#finish-backend-vitest-renovation-after-launch-attachments

**Source:** [Prove Story Notes and follow-up delivery in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-backend-vitest-renovation-after-launch-attachments)

## Goal and scope

Give developers fast typed feedback on which note versions reach a
follow-up, when they are marked sent, and what happens when the user edits a
note before confirmation. Move the three
`launches/agent-launch-follow-up-notes*.spec.ts` files off backend Playwright.
Account for their 12 existing cases. Use an explicit private notes file in
the two-spec Story Notes pilot selection, preserving its 29 Node cases.
The browser continues to prove the visible sent state and E2E owns the
existing Cursor runner's uncertain-to-confirmed transition.

General launch choices, startup and session recovery, published comparison
admission, attachments, and the backend runner stay with their respective
[stories](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [acting as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  for the Cursor journey. Use [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  for direct mapping, [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  for machine-local notes, and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision)
  for comparing cost and proof.
- Reuse [Story Notes](../../../dashboard/server/storyNotes.ts) over
  the existing [machine JSON store](../../../dashboard/server/machineJsonStore.ts).
  Bind the notes file at production composition and give the tests their own
  path. Keep one schema, one version rule, and the unreadable-file policy.
  The [configuration route](../../../dashboard/server/projectConfigurationBoundary.ts)
  keeps its current request admission and response.
- Reuse [wire launch admission](../../../dashboard/server/agentLaunchAdmission.ts)
  and the shared launch and follow-up schemas for input. Use the existing
  [follow-up resolver](../../../dashboard/server/followUpAdmission.ts)
  and [message assembly](../../../dashboard/server/storyFollowUpMessage.ts)
  for valid starts. Give the resolver only the typed collaborators needed to
  arrange notes and retained evidence without a server. Keep published-story
  validation with its [existing read owner](../../../dashboard/server/followUpStory.ts).
  Keep request matching with [launch identity](../../../dashboard/src/launchRequest.ts)
  and the [acceptance path](../../../dashboard/server/agentLaunchAccept.ts).
- Keep first-input transition detection with the
  [record writer](../../../dashboard/server/launchRecordDocument.ts) and
  version matching with the notes store. Reuse
  [Story Note delivery](../../../dashboard/server/storyNoteDelivery.ts) on
  that transition. Both the Dashboard and the
  [Cursor runner](../../../dashboard/server/hosts/cursor/runnerMain.ts)
  install delivery. Preserve the distinction between an accepted launch, a
  confirmed first input, and a successful notes write. An uncertain input
  or a failed notes write must remain recoverable without a second launch.
- The backend specs select [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md).
  Use its existing project, story, note, follow-up request, and record
  builders. Use a private real file for persistence and a typed host
  observation for input and refusal. The E2E move selects MakeMe and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md).
  Keep invalid wire fields visible in refusal cases. Add zero test-support
  wrappers and remove note-only setup after its last consumer moves.

## Decisive premises

Observed at `1e0e1f876` on 25 November 2026 in the owned macOS
preparation checkout on AC power with Node 24.21.0, one worker, and
lock-identical dependencies from the integration checkout.

| Premise | Consuming operation and result |
| --- | --- |
| The backend command covers the legacy note cohort and the existing pilot | The baseline below selected 41 cases and passed all on the first attempt. Proof records classified 12 as Chromium and 29 as Node. The launch cases took 510–10,904 ms each and 24.499 s summed. All 29 pilot cases met 100 ms. The full selection took 30.76 s wall and 24.672 s summed. A launch-only confirmation run passed all 12 on the first attempt in 30.14 s wall. |
| A retained launch and a delivered note are distinct outcomes | The existing backend selection confirmed that a retry kept the input text and admitted version after an edit. The Cursor case reached the actual runner's uncertain kept record, observed the note still waiting, released terminal paint, and observed the confirmed record and the matching delivered version. The locked notes-file case reached a launched result while leaving the note waiting. |
| The existing browser proof detects a missing delivery installation at the Dashboard adapter | The E2E command below passed. Removing `installStoryNoteDelivery()` from the Dashboard launch mount in a scratch edit caused the case to fail on the missing “Sent to follow-up” entry after reload. Restoring the source byte-for-byte returned the case to passing. Baseline and restoration took 8.67 s and 6.55 s wall respectively. This covers the Dashboard installation. The Cursor installation has its own process proof in slice 5. |

## Ordered slices

Execution continues in Story Branch Mode on
`origin/codex/prove-story-notes-and-follow-up-delivery-in-node` from Take
`dd22b9e1c0e9025ae4eeb18f6ebbfb7f488fba30`, with `origin/main` for
integration. The plan and seed agreed at execution start. The recorded
readiness review predates changes to the source.

### 1. Persist and read notes from an isolated file

Type: Behavior
Status: done
Estimate: 8–12 active minutes.
Proof: Both selected Story Notes pilot specs pass under Node Vitest.

Given a private notes file, add, edit, delete, and read the intended
project's notes through the typed production handler. Reopening the file
preserves contexts, edits, and isolation. A refused operation leaves the
file unchanged. Give the handler, waiting-note reader, and delivered-note
writer the same file input with the existing machine location bound by
production callers. Remove the pilot's `HOME` override and prove the
unchanged notes request admission alongside it.

All 29 Node pilot cases passed with the private file, with a maximum of
63.86 ms. The 12 retained launch cases passed, including the production notes
route and Cursor confirmation. The browser sent-state check and Dashboard
typecheck passed. The full backend selection took 62.30 s on the shared Mac.

### 2. Refuse page fields that cannot select notes

Type: Behavior
Status: planned
Estimate: 8–12 active minutes.
Proof: Typed admission returns the current 400 answer for each refused
shape and does not start work.

Given an incoming Start value naming notes on a session, or supplying
resolved note text or attached versions, call the value admission used
by the HTTP adapter before host, story, or file work begins. Check the
existing status and reason with a valid opted-in request as the contrast
case. Keep origin, method, request read, and response framing with the
wire adapter. The typed refusal checks run on the existing engine until
slice 3 replaces the last mounted case in this file and selects Vitest.

### 3. Send the requested waiting notes with their context

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.
Proof: The typed Start path yields the first-input message and attached
versions and the selected specs run on Vitest once migrated.

Given one waiting line note, one waiting general note, and one sent note,
compose the real follow-up message with the held story and real notes
file. Verify the waiting text, saved line context, and versions at the
receiving-input boundary. When Attach is clear or the notes file is
unreadable, required story and instruction content remains intact and no
notes are attached. Complete the admission spec transition here. Keep
the retained-start observations in their legacy spec until slice 4 moves
it to Vitest with the new selection checks.

### 4. Reuse the chosen notes when the same start is retried

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.
Proof: A typed launch acceptance or continuation answers with the retained
attempt and its original first input. Both the selection and retry variants
run through the maintained Node backend selection.

Given the same instruction with and without Attach, keep distinct starts.
Given an unchanged Attach choice, retry the retained attempt after a note
edit and observe the first input and attached version kept at admission.
Use MakeMe to arrange the kept attempt and native record directly. Assert
the chosen identity, old message and version at their receiving handoff
and absence of a replacement attempt. Complete conversion of the legacy
content and retry spec.

### 5. Observe Cursor's later confirmation in E2E

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.
Proof: E2E sees the kept uncertain input and waiting note together, then
the real Cursor runner confirms that same input and the stored note is sent.

Move the existing scenario with its synthetic native terminal control to
a focused E2E journey. Reuse the existing Cursor and Story Notes page
objects and fixtures. Arrange a requesting follow-up with a saved note,
hold the native confirmation signal, observe the waiting state, release
the signal and observe the same attempt's confirmation and the note's
sent state. Keep the original case until the E2E case observes both sides
of the transition. Preserve a failure signal if Cursor omits notes
delivery after confirming. The remaining delivery cases stay in backend
Playwright until slice 6.

### 6. Mark only the confirmed version in the real notes store

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.
Proof: The last delivery spec runs on Node Vitest and reads the private
notes file. The Dashboard and Cursor E2E checks retain their installation
and native lifecycle proof.

Given a refused input and then a confirmed kept first input, go through
the record-delivery operation and observe the matching version move from
waiting to sent only after confirmation. Given a newer edit, that version
stays waiting. Given a refused notes write, the kept confirmation remains
valid and the note stays waiting. Use the existing write refusal semantics
with an immediate filesystem refusal or at the notes-write input, and
keep real files for the version outcomes. Remove the last Playwright
fixture from the cohort and retire its now-unused arrangement code.

## Proof ownership and local gate

| Existing observation | Maintained owner |
| --- | --- |
| Project/story isolation, add/edit/delete and edit version, corrupt bytes and refused writes, and the notes request contract | Slice 1 and the existing pilot. |
| Session-source option, page-composed context and page-supplied versions | Slice 2 through shared value admission and its 400 answer. |
| Waiting versus sent, line context, no opt-in and continuing with an unreadable notes file | Slice 3 at the admitted first-input message and version list. |
| Same choice resumes one attempt, different choice starts separately, originally attached text survives intervening edit | Slice 4 observes retained first input and attempt identity. |
| Actual Cursor process confirms after the initial uncertain result | Slice 5 E2E observes both record and notes state. |
| Confirmed input marks only the admitted version, earlier refusal or newer edit leaves it waiting, and notes write refusal preserves the launch | Slice 6 at record delivery and real notes persistence. The [existing E2E](../../../e2e/stories/recently-done-follow-up.spec.ts) proves the integration through the Dashboard and visible sent state. |

Use a fresh absolute output path for each baseline and candidate proof
record. Run from the repository root, with one worker for comparable timing.

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- 'launches/agent-launch-follow-up-notes(-admission|-delivery)?\.spec\.ts$' 'review/story-notes(-request)?\.spec\.ts$' --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/stories/recently-done-follow-up\.spec\.ts$' --grep 'starting a follow-up with attached notes' --workers=1
```

Run the new Cursor E2E selection by its exact file and title alongside the
retained browser proof. Check Dashboard types with
`npm run typecheck:dashboard` because the new typed inputs reach live
adapters and test callers. Trace all changed consumers and select additional
existing proof only where its boundary changes. In the final proof record,
account for all 12 legacy cases and the existing 29 pilot cases. Report
all selected engines, case count, individual duration against roughly
100 ms, summed case time, whole-selection wall time, and the separately
measured cost of the moved Cursor E2E case.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to the plan and all repair handoffs. Use the default test timeout.

## Plan review

Refinement was unnecessary after the six slices were sized around separate
observable results. The only retained mixed-runner intervals are the existing
checks whose replacement slices are named above. No slice-specific concern
remains from this review.
