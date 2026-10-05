# Read and mark attention messages read on the session entry

**Identity:** SEED-103#attention-message-on-story-card
**Source:** [refined story](../../seeds/SEED-103-attention-message-on-story-card.md#attention-message-on-story-card).
**Prepared:** 2026-10-05. Planning only, in the established preparation workspace.

## Goal and boundaries

A developer reads a session's attention message and marks it read on the
session's entry, on its story card or in Recent sessions, without a separate
panel, and reading a message never turns into an offer to mark the session
done.

Scope, decisions, and key examples are those of the source story. Material
exclusions:

- Any confirmation before Mark as done, which
  [SEED-104](../../seeds/SEED-104-confirm-mark-as-done.md#confirm-mark-as-done)
  owns.
- Codex's passive native final report: its panel, **Read final report**, its
  endpoint, and the panel's Mark as done stay.
- The unread wording, the card's unread-report line, the Sessions sidebar's
  mark, alerts, and the read-mark request and store, which stay as they are.
- Keeping a developer's chosen expansion across a reload.

## Direction and PFE

Established structure supports the work; no
[North Star](../../NORTH-STAR.md) topic governs it and none is added. The
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) row for card
sessions names “a retained report” among the side panel's items; slice 3
corrects that wording.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) applies:
“attention message”, “report”, “unread”, and “Mark as read” keep their one
meaning in code, wording, and the dashboard documents.

PFE findings and choices:

- **One entry.** `src/SessionEntry.tsx` is the only session entry; card
  (`CardSessions.tsx`) and Recent sessions (`RecentSessions.tsx`) both render
  it, and it already shows the message
  (`.session-attention-message`: completion label and text). The message part
  grows there, as one small component the entry renders for both places. Add
  no second message view.
- **One unread rule.** `reportUnread` (`src/completionReport.ts`) already says
  unread: a report, not marked done, whose receipt is not the one marked read.
  Expansion follows one rule: expanded while `reportUnread`, otherwise as the
  developer last chose for this receipt, starting collapsed. A newer receipt
  drops the choice. Local component state holds the choice; nothing is stored.
- **Disclosure.** Reuse the frame's disclosure button convention
  (`frame-controls.css`, a button with `aria-expanded` led by the turning
  chevron, as `WorkCard.tsx` and `StoryReviewSnapshotView.tsx` use). The
  heading is that button, named by `completionLabel`. While unread it reads
  expanded and does not collapse.
- **Marks.** `markRead` and `markDone` already come from `usePageSessions`,
  which every entry is inside, and `useMarking` already follows one control's
  mark. Mark as read moves to the message part with its own `useMarking`;
  `CardActions` keeps Mark as done alone. `useReportOrDoneMark`, which exists
  only to put the two in one place, loses its card caller in slice 1 and its
  last caller in slice 3, where it is deleted.
- **Panel.** `SessionResultPanel.tsx` serves both the attention message and
  Codex's native final report. Slice 3 leaves it the native read alone.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| Card and Recent sessions entries are one component (slices 1, 2) | `grep -rn "<SessionEntry" dashboard/src` → `CardSessions.tsx:33` and `RecentSessions.tsx:62` only. |
| A done session's report is not unread, so its Recent entry starts collapsed without a new rule (slice 1) | Read `reportUnread` in `src/completionReport.ts`: false when `doneAt` is set. |
| A reported session offers Mark as done on its card on every host (slice 1) | Read `marksRecordDone` in `src/sessionCapabilities.ts`: true when `record.completion` is defined. |
| An ad-hoc session with an instruction carries the reporting channel, so it can hold a message without a card (slice 1) | Read `server/reportingInstruction.ts:8` and `server/completionReporting.ts:26`: only an ad-hoc launch without an instruction is excluded. |
| The report fixture launches through the real boundary and reports through the launch's own reporting command, so it extends to an ad-hoc launch and a chosen message text (slices 1, 2) | Read `tests/support/reportedLaunch.ts`: `launch(dashboard, {workflow, …})`, command taken from the launch input, message written by the fixture. |
| With an attention message, **Read final report** shows the message, not a native read; without that branch the panel reads Codex's native report (slice 3) | Read `SessionResultPanel.tsx` (first branch of its effect) and `sessionAccess.ts` (first branch); `agent-completion-attention.spec.ts:214-216` asserts the message text in the panel. |
| A session that the side panel cannot open is left alone by sidebar and entry selection (slice 3) | Read `openSession` in `src/pageSidePanel.ts`: nothing happens when `sessionAccess` is undefined. |
| The existing message journeys run locally (all slices) | `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list session-unread-report agent-completion-attention agent-completion-cursor` → 5 passed (43.6s). |

## Outside-in proof

Proof is Playwright journeys in `dashboard/tests/` through the real launch
boundary, reporting command, and page. Each slice runs the specs it names and
`npm run typecheck:dashboard`, because the journeys do not type-check
unvisited code; slice 3 also runs `npm run lint`, which refuses unused
exports left by the removal. Hosted CI runs the whole suite after publication.

| Promise (story key example or constraint) | Slice | Observation |
| --- | --- | --- |
| Unread message expanded on the card under its label, Mark as read beside Mark as done | 1 | `session-unread-report.spec.ts` |
| Mark as read collapses, session stays open, Mark as done where it was | 1 | `session-unread-report.spec.ts` |
| Heading of a read message expands and collapses it, without Mark as read | 1 | `session-unread-report.spec.ts` |
| A newer report is unread again and expanded | 1 | `session-unread-report.spec.ts` |
| Ad-hoc session's Recent entry: expanded with Mark as read | 1 | `session-unread-report.spec.ts`, new test |
| Done session's Recent entry: collapsed, expandable, no Mark as read | 1 | `session-unread-report.spec.ts` |
| No message, no message part | 1 | existing `agent-completion-quiet.spec.ts`, unchanged |
| Rejection constraint: nothing appearing through Mark as read marks done | 1 (entry), 3 (panel) | `session-unread-report.spec.ts` |
| Long message scrolls inside the part; Mark as read and entry lines in view | 2 | `session-unread-report.spec.ts`, new test |
| Codex session without workspace: message on the entry, native final report in the panel | 3 | `agent-completion-attention.spec.ts` |
| No Read attention message; an attention message opens no panel | 3 | `agent-completion-cursor.spec.ts`, `session-unread-report.spec.ts` |
| Documents describe the entry-only behavior | 1, 3 | read the three documents against the story |

## Ordered slices

### 1. Read and mark read in the entry's message part
Type: Behavior
Status: done
Proof: `session-unread-report.spec.ts`, its first journey reworked and one test
added. (a) A reported session's card entry shows the message expanded under
its completion label, with Mark as read in the message part and Mark as done
still offered by the entry. (b) Mark as read: the part collapses to its
heading, which has the keyboard; the session keeps its native reading; Mark
as done is the same control as before; the entry holds no Mark as read.
(c) The heading expands the read message with the same text and no Mark as
read, and collapses it again, by click and by keyboard. (d) A second report
for the session is expanded with Mark as read again. (e) A refused read mark
leaves the part expanded and says so in the entry's status line. (f) New
test: an ad-hoc session launched with an instruction reports; its Recent
sessions entry shows the message expanded with Mark as read, and marking
collapses it. (g) After Mark as done, the Recent entry shows the heading
collapsed, expands to the text, and offers no Mark as read. (h) The guard:
after Mark as read on an entry, every button in that entry that was absent
before the mark is collected, and none is named Mark as done.
`agent-completion-attention.spec.ts`, `agent-completion-cursor.spec.ts`, and
`support/completionRecoveryIntent.ts` stay green, expanding a read or done
message before reading its text where they do.

Behavior: a session holds an attention message → the developer views its entry
on the card or in Recent sessions → the message part is expanded with Mark as
read while unread, collapsed and re-expandable once read or done, and Mark as
done stays the entry's own control throughout.

- Add the message part to `SessionEntry.tsx` under the expansion rule and
  disclosure convention above. Mark as read lives in it wherever the report is
  unread; a failed mark reports through the entry's status line, which
  `CardActions` and `RecentActions` already own, so the entry passes it one
  way for both.
- `CardActions` offers Mark as done only, whenever `marksRecordDone` allows.
- Extend `support/reportedLaunch.ts` for an ad-hoc launch and for a second
  report.
- Update
  [explicit completion and retained attention messages](../../../dashboard/AGENT-LAUNCH-COMPLETION.md)
  for the message part, both places, and the separate Mark as done.
- Interim: the side panel still shows the message with its Mark as read
  turning into Mark as done. Slice 3 removes it.

### 2. Keep a long message inside its message part
Type: Behavior
Status: done
Proof: New test in `session-unread-report-message.spec.ts`: a report of several
thousand characters is unread on a card. The message text's box is shorter
than its content and scrolls; Mark as read and the entry's Mark as done are
in the viewport without scrolling the text; the text's last line is reachable
by scrolling the part; a short message's part has no scrolling.

Behavior: an unread message longer than the part's height limit → the
developer views the entry → the whole text is readable by scrolling inside
the part, with Mark as read and the rest of the entry in view.

- Limit the text's height in `agent-launch.css` and let it scroll, keyboard
  reachable. Mark as read sits outside the scrolling text.
- Let the fixture's message text be chosen by the test.

### 3. Leave the side panel to the native final report
Type: Behavior
Status: done
Proof: (a) `agent-completion-cursor.spec.ts` and
`session-unread-report.spec.ts`: an entry with a message offers no Read
attention message; a session whose only side-panel content was its message
offers no Read final report, and choosing its Sessions sidebar entry opens no
panel. (b) `agent-completion-attention.spec.ts`: for the Codex session whose
workspace is gone, the entry shows the message and Read final report shows
the fake native final report, not the message; the panel has no Mark as
read; Mark as read happens on the entry and Mark as done from the panel
still closes the session. (c) The guard of slice 1 extended: with the panel
open on a session, Mark as read on its entry adds no control to the panel.
(d) `session-workspace-retirement*.spec.ts`, `story-panel-replacement.spec.ts`,
`agent-completion-quiet.spec.ts`, and
`agent-launch-codex-observation-boundary.spec.ts` stay green.
(e) `npm run lint` and `npm run typecheck:dashboard` pass, and
`grep -rn "Read attention message\|useReportOrDoneMark" dashboard docs`
finds nothing.

Behavior: a session holds an attention message → the developer looks for it in
the side panel → no control opens it there; the panel opens only for a
terminal or Codex's native final report, with its ordinary Mark as done.

- Remove Read attention message from `LaunchSession.tsx`, the message branch
  of `sessionAccess`, the message branch and Mark as read of
  `SessionResultPanel.tsx`, the panel update in `markSessionRead`
  (`pageSidePanel.ts`), and `useReportOrDoneMark` with its wording. Remove
  whatever then has no caller, including styles and test helpers.
- Move the panel steps of `support/completionRecoveryIntent.ts` and the specs
  above to the entry.
- Update [terminal and record actions](../../../dashboard/AGENT-LAUNCH-TERMINALS.md),
  the remaining panel passages of `AGENT-LAUNCH-COMPLETION.md`, the side
  panel's items in the
  [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md), and
  `dashboard/tests/README.md` where it describes these journeys.

## Current decisions

- The panel stays for Codex's native final report only (Terry, 2026-10-05).
- A long message scrolls inside a height-limited message part (Terry,
  2026-10-05).
- Mark as read is offered on every entry holding an unread message, Recent
  sessions included (Terry, 2026-10-05).
- Slice 1 precedes slice 3 so a session without a card can always be marked
  read; the panel's swap is the named interim.

## Learnings

- Slice 1 accepted proof (2026-10-05): `unset NODE_ENV; npx playwright test
  --config dashboard/playwright.config.ts --reporter=list session-unread-report
  agent-completion-attention agent-completion-cursor agent-completion-quiet`
  → 10 passed; `npm run typecheck:dashboard` clean. The message part is
  `SessionAttentionMessage.tsx` (styles in `session-attention-message.css`).
  Its card and ad-hoc Recent behaviors are in
  `session-unread-report-message.spec.ts`, with helpers in
  `support/sessionMessagePart.ts` and `support/unreadReportPage.ts`; the
  journey in `session-unread-report.spec.ts` keeps the read effects, the
  newer report, and the done Recent entry; the terminal-panel Mark as done
  test moved to `session-unread-report-terminal.spec.ts`.
- `CardActions` and `RecentActions` no longer exist: the card's Mark as done
  is `MarkDone`, `DeleteRecord` is exported, and `SessionEntry` renders the
  entry's one status line. Read the slices below with those names.
- The entry's status line shows what its latest mark or delete said; a
  delete's words no longer take precedence over a refused Mark as done.
- Slice 2 accepted proof (2026-10-05): the same focused command without
  `agent-completion-quiet` → 8 passed; the long-message test passed 24 of 24
  under `--repeat-each 24`. The text is a focusable region named “Attention
  message”, height-limited to 12em in `session-attention-message.css`. One
  keyboard scroll press can be dropped under parallel load, so the test
  repeats it inside `toPass`. Mark as done sits below the fold at first load
  on a 1280×720 viewport; brought into view, the entry shows the text,
  Mark as read, and Mark as done together.
- Older specs still find the text by `.session-attention-message pre`
  (`agent-completion-attention.spec.ts`, `agent-completion-cursor.spec.ts`,
  `support/completionRecoveryIntent.ts`); slice 3 touches them and can move
  them to `messagePartOf`.
- Slice 3 accepted proof (2026-10-05): `unset NODE_ENV; npx playwright test
  --config dashboard/playwright.config.ts --reporter=list
  session-unread-report agent-completion session-workspace-retirement
  story-panel agent-launch-codex-observation-boundary session-result
  session-alerts-unread-report session-unread-rule side-panel` → 54 passed;
  after the refactor, the Mark as read journeys → 27 passed; lint and
  typecheck pass; the grep finds nothing.
- The server's result endpoint held a third message branch, and its
  admission let a reported record through on a host without a native
  reader; both went, so Read final report reads only the native report.
- `story-panel-replacement` used a Claude attention message as its “final
  report”; its Story B is now a Codex record whose workspace is gone, with a
  native final report.
- A terminal that finds its workspace unavailable on a host without a native
  reader opens the final report panel, which says it could not be read, as
  for a session without a message; that path is untested.
