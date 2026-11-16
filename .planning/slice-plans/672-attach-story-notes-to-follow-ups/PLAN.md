# Attach story notes to follow-ups and show which are waiting

**Identity:** SEED-348#attach-story-notes-to-follow-ups
**Source:** [Attach story notes to follow-ups and show which are waiting](../../seeds/SEED-348-collect-notes-for-story-follow-ups.md#attach-story-notes-to-follow-ups)

## Goal and scope

A Done story's follow-up starts with the story's waiting notes and their
context. Each note shows whether it is waiting or sent, and the card shows how
many are waiting. The story section owns the scope, the scope limits and the
key examples; this plan adds none.

Terry settled two boundaries on 2026-11-17. Only waiting notes are attached.
Notes on a Taken story wait until a Done follow-up sends them.

Dependency: this story starts only after
[Capture and edit story notes](../../seeds/SEED-348-collect-notes-for-story-follow-ups.md#collect-notes-for-story-follow-ups)
([plan 671](../671-capture-and-edit-story-notes-in-the-dashboard/PLAN.md))
has delivered. This plan builds on that plan's decided shapes: the note
`{ id, text, savedAt, editedAt?, context? }`, `server/storyNotes.ts` with
`unreadable: "preserve"`, the `/__project-configuration/story-notes` endpoint,
the page owner modeled on `src/storyReviewStates.ts`, the **Story notes**
dialog, and `dashboard/STORY-NOTES.md`. If the delivered names or shapes
differ, use the delivered ones. The rules below do not change.

Preparation authorizes no implementation.

## Existing solution and direction

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
delivery is machine-local evidence about a machine-local note, kept in the same
store, and never a published fact. Follow
[ADR 0002's one representation](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution):
a note carries the version that was delivered, and one shared function decides
whether the note is waiting, for the store, the wire and the page. No North
Star topic or new ADR is needed.

PFE findings and choices:

- **Version and waiting.** A note's version is `editedAt ?? savedAt`, both
  assigned by the server. The note gains `delivered?: string`, the version a
  session received. A note is waiting when `delivered` differs from its
  version. Editing a note keeps `delivered`, so the edited note waits again.
- **Request.** `followUpStorySchema` in `src/followUpRequest.ts` gains
  `notes: true` when the page asks to attach notes, and `followUpSourceKey`
  includes it. The attach choice therefore becomes part of the launch
  identity, as **Workspace** is, and the same choice resumes the same kept
  start. Admission (`server/followUpAdmission.ts`) reads the waiting notes from
  the notes store, never from the page. It adds them to the resolved
  `context` text as their own section and keeps `notes: [{ id, version }]`
  beside `context` on the resolved follow-up. A pending first input, a
  recovery or a retried start reuses the saved follow-up, as it already does.
- **Text sent.** `src/followUpContext.ts` already composes the one context
  that the dialog lists and that `server/unattachedInput.ts` sends on Claude,
  Codex and Cursor. Notes become one more section after the story's and
  sessions' sections. It is headed as the developer's story notes, and its
  context is described as what the dashboard showed when the note was taken.
  Put the note section's composition in its own module, because
  `followUpContext.ts` is at 201 lines.
- **Confirmation seam.** `server/launchRecordDocument.ts` is the only writer of
  the launch-record file: `launchStore()` is used only by its read and by
  `replaceRecords`. Every host path that records or later confirms a first
  input goes through it: `launchRecording.session`, `launchRun.ts`,
  `launchVerification.ts`, Cursor's `runnerKeep.ts`, and Codex's recovery.
  That file already has a listener for records dropped by retention
  (`onRecordsDroppedByRetention`). Add one listener the same way for records
  that become delivered in a write. A record is delivered when its
  `firstInput` is absent (Claude: the prompt is the `claude --bg` argument,
  and a record is kept only once the session is confirmed) or its state is
  `confirmed`. The new `server/storyNoteDelivery.ts` registers the listener.
  For each newly delivered ad hoc record whose follow-up carries `notes`, it
  sets `delivered` on each note whose current version still equals the
  attached version. That way, a late confirmation of an older version never
  marks newer text as sent. It runs after the launch-record write, and a
  failure is ignored: notes then stay waiting.
- **Dialog.** `src/StartSession.tsx` (222 lines) mounts the follow-up dialog
  for the card, the file header and the line menu (`src/FollowUp.tsx`). Add an
  `AttachStoryNotes` component for a story follow-up. It reads the page's
  notes owner, and `StartSession` passes its choice into the request.
  `src/LaunchDialog.tsx` (225 lines) is not edited.
- **Card and Story notes.** These are the owners that plan 671 adds. The
  waiting count reads with **Notes** and is not a separate control.

Expected edits to files near the 250-line check:

| File | Lines | Decision |
| --- | --- | --- |
| `dashboard/src/StartSession.tsx` | 222 | Mounts `AttachStoryNotes` and passes its choice; the rest lives in the new component. |
| `dashboard/server/launchRecordDocument.ts` | 208 | Adds a second listener next to the retention one, about ten lines. |
| `dashboard/src/followUpContext.ts` | 201 | Adds an optional `notes` section field; the section's text comes from a new module. |
| `dashboard/src/agentLaunch.ts` | 242 | Not edited; the follow-up schema is in `followUpRequest.ts` (105). |

The notes added to a first input are not bounded. That is no new kind of
length: the same context already carries every retained session's completion
report, each up to 16,000 characters (`src/completionReport.ts`), on all three
hosts.

## Current decisions

- Only waiting notes are attached. When none are waiting, **Attach story
  notes** is unavailable.
- Delivery means the first input was confirmed: `firstInput` absent or
  `confirmed`. `uncertain` and `awaiting` leave notes waiting until a later
  write confirms them.
- Delivery is recorded only for a note whose current version is the one that
  was attached.
- Words: **Attach story notes**, **Waiting for follow-up**, **Sent to
  follow-up**, “<n> notes waiting” / “1 note waiting” on the card, the detail
  “<w> waiting of <n> notes”, “No waiting notes”, and “The notes could not be
  read.” in the dialog.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| New notes are waiting; a note with a delivered version shows **Sent to follow-up**; editing it puts it back to waiting; the card counts the waiting notes and shows nothing when none are | 1: `dashboard/frontend-tests/stories/story-notes.spec.ts` (from plan 671) with the notes substitute answering waiting and delivered notes; `dashboard/backend-tests/review/story-notes-admission.spec.ts` — an edit of a note with `delivered` keeps it and returns a new version |
| A story follow-up asking for notes sends the waiting notes, with text and context, after the story's context and outside the 4,000-character request; sent notes are not sent; a follow-up without notes sends none; a session follow-up cannot ask for notes; a page cannot send note text | 2: new `dashboard/backend-tests/launches/agent-launch-follow-up-notes.spec.ts` (boundary server, fake Claude, as `agent-launch-follow-up-story.spec.ts`) — first input layout via `expectFollowUpInput`; refusals of `notes` on a session source and of any note text in the request |
| The attach choice is part of the launch identity; a retried start sends the saved notes | 2: same spec — the same request resumes the kept start and its saved notes after a note was edited; the opposite choice starts elsewhere (as `agent-launch-follow-up-identity.spec.ts`) |
| The follow-up dialog from the card, file header and line menu offers **Attach story notes**, checked with counts when notes wait, unavailable when none wait or the story has none, and says when notes could not be read; unchecking or cancelling sends none | 3: new `dashboard/frontend-tests/launches/follow-up-attach-notes.spec.ts` with the notes substitute and the recorded request; consumers `e2e/stories/recently-done-follow-up.spec.ts`, `e2e/review/story-review-follow-up.spec.ts`, `e2e/review/story-review-diff-line-follow-up.spec.ts`, `e2e/intent/intent-story-follow-up.spec.ts` |
| Confirmed first input marks the attached versions sent; refused or unconfirmed leaves them waiting; a later confirmation marks them; a note edited during the launch stays waiting | 4: new `dashboard/backend-tests/launches/agent-launch-follow-up-notes-delivery.spec.ts` — fake Claude launched; fake Cursor `holdPaint` then ready (as `agent-terminal-cursor-launch-wait.spec.ts`); a refused Claude start; an edit between admission and confirmation. Each reads `story-notes.json` through GET |
| Start a follow-up with notes from the card; the card stops showing notes waiting and **Story notes** shows them sent, still editable | 4: extend `e2e/stories/recently-done-follow-up.spec.ts` with saved notes |
| Maintained words | 1–4 extend `dashboard/STORY-NOTES.md`; 2 and 3 update `dashboard/LAUNCH-FOLLOW-UP.md` where it lists the context and the dialog |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Every confirmed first input reaches the launch-record file through `replaceRecords` | Slice 4's listener | 2026-11-17, read at `2a206edf7`: `launchStore()` in `server/launchRecordDocument.ts` is used only by `readStoredRecords` and `replaceRecords`; the confirming writers (`launchRecording.ts`, `launchRun.ts:224`, `launchVerification.ts:140`, `hosts/cursor/runnerKeep.ts:28`, `hosts/codex/recovery.ts`) call `keepRecord`, `updateRecord` or `replaceKeptSession`, which write through it. A single writer is a structural fact, so the read settles it; slice 4's spec observes the behavior. |
| Claude's record means delivered input | Slice 4's delivered rule | 2026-11-17, read at `2a206edf7`: `AGENT-LAUNCH-HOSTS.md` says Claude's prompt is the `claude --bg` argument, confirmed through `claude agents --json --all`, and that Claude records "remain confirmed"; `hosts/claude/` records no `firstInput`. |
| The resolved follow-up context reaches each host's first input, and a later Cursor ready screen confirms it | Slices 2 and 4 | 2026-11-17, this workspace at `2a206edf7` with the integration checkout's `node_modules` linked: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts --reporter=list terminals/agent-terminal-cursor-launch-wait launches/agent-launch-follow-up-cursor` → 5 passed, including “a later ready screen accepts the instruction” and a recorded context sent after its source is gone. |
| The notes store, endpoint and page owner exist with plan 671's shapes | Every slice | Supplied by the dependency; its plan's Current decisions record the shapes. They cannot be observed before that story is delivered. The dependency's condition covers this, and the Dependency paragraph above says what to do if the shapes differ. |

## Concerns

Slice-plan refinement was not needed. The four Behavior slices exercise one
rule: a note waits until its current version is delivered. That rule has one
field, one admission read and one confirmation listener. Later slices add an
entry point and a recording, not a parallel representation. This review found
no remaining slice-specific concern.

Accepted interim behavior: after slice 2, the server accepts `notes` before
the dialog offers it (slice 3). After slice 3, attached notes stay waiting
until slice 4 records delivery.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Notes show whether they are waiting or sent
Type: Behavior
Status: planned
Proof: `story-notes.spec.ts` and `story-notes-admission.spec.ts` (slice 1
rows); `npm run typecheck:dashboard`; `npm run lint`.

Behavior: a story with notes → **Story notes** shows each note as **Waiting
for follow-up** or **Sent to follow-up**. The card says how many are waiting
while any are, and shows nothing about waiting once none are. Editing a sent
note shows it waiting again.

- `delivered` in the note contract, and the shared waiting rule; the store
  keeps `delivered` on edit.

### 2. A story follow-up can send the waiting notes
Type: Behavior
Status: planned
Proof: `agent-launch-follow-up-notes.spec.ts`; consumers
`dashboard/backend-tests/launches/agent-launch-follow-up-*.spec.ts`; typecheck
and lint.

Behavior: a Done story with waiting and sent notes → a follow-up request with
`notes: true` starts a session whose first input holds the waiting notes, each
with text and context, after the story's context. A request without it holds
none. A session follow-up naming notes is refused, and so is a page sending
note text.

- `notes` in `followUpStorySchema` and `followUpSourceKey`; admission reads the
  store and saves `notes: [{ id, version }]` with `context`.

### 3. The follow-up dialog offers Attach story notes
Type: Behavior
Status: planned
Proof: `follow-up-attach-notes.spec.ts`; consumers named in the slice 3 row;
typecheck and lint.

Behavior: a Done story's **Follow up** from its card, a file header or a line
menu → **Attach story notes** is checked and gives the waiting and total
counts when notes wait. It is unavailable, saying “No waiting notes”, when
none wait or the story has none. It is unavailable with “The notes could not
be read.” when the notes could not be read. Starting while it is checked
names `notes: true`. Unchecking it or cancelling the dialog names none.

### 4. A confirmed follow-up marks its notes sent
Type: Behavior
Status: planned
Proof: `agent-launch-follow-up-notes-delivery.spec.ts` and the extended
`e2e/stories/recently-done-follow-up.spec.ts`; consumers
`dashboard/backend-tests/terminals/agent-terminal-cursor-launch*.spec.ts`
and `dashboard/backend-tests/launches/`; typecheck and lint.

Behavior: a follow-up with attached notes → once its first input is
confirmed, those versions are delivered. The card stops counting them and
**Story notes** shows them sent and still editable. A refused or unconfirmed
start leaves them waiting until a later confirmation. A note edited before
confirmation stays waiting.

- `server/storyNoteDelivery.ts` and the listener in `launchRecordDocument.ts`.

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`, naming the config: `dashboard/frontend.playwright.config.ts`,
`dashboard/backend.playwright.config.ts` or `e2e/playwright.config.ts`.
Following [AGENTS.md](../../../AGENTS.md), keep the default timeouts, never use
`test.slow()`, and apply MakeMe and page-object selection before editing tests.
Each slice's named specs and consumers are its local gate. Slice 4 changes the
launch-record writer that every launch spec passes through, which is why it
runs `dashboard/backend-tests/launches/` in full. Hosted CI runs the full
suites. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake, and on AC power wrap long or full runs in `caffeinate -s -i`.

## Learnings

None yet.
