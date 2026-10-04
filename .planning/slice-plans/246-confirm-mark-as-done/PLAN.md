# Confirm Mark as done when the session's intended work is not complete

**Identity:** SEED-104#confirm-mark-as-done
**Source:** [refined story](../../seeds/SEED-104-confirm-mark-as-done.md#confirm-mark-as-done).
**Prepared:** 2026-10-05. Planning only, in the established preparation workspace.

## Goal and boundaries

A developer who clicks Mark as done on a session whose intended work is not
known to be complete is told the session's situation and decides, before
anything stops or leaves the page, whether to mark it done. A session known to
be complete is still marked done with one click.

Scope, wording, decisions, and key examples are those of the source story.
Material exclusions, as the story defers them:

- Detecting an instruction given after a `completed` report once its turn has
  ended without a newer report.
- Rereading native state at the click.
- A preference that turns the confirmation off, and any change to automatic
  Done on a quiet completion, alerts, Mark as read, or Delete record's own
  behavior.

## Direction and PFE

Established structure supports the work; no [North Star](../../NORTH-STAR.md)
topic governs session controls and none is added. The
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) applies to the
wording: the statements name recorded facts and the shown reading.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) applies:
“Mark as done”, “Keep open”, and the reading labels each keep one meaning in
code, wording, specs, and the dashboard documentation.
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and binds nothing.

PFE findings and choices:

- **The rule.** `src/sessionShown.ts` already derives every entry's reading
  from `sessionState`, `completion`, and `doneAt`, and
  `src/completionReport.ts` owns report facts. Add one pure fact beside them:
  whether a `LaunchWithState`'s intention is complete, and otherwise its one
  statement by the story's precedence. It reads `sessionState.activity`
  (`working`, `waiting`), a Cursor held-screen label
  (`src/cursorHeldLabel.ts`, carried as `{ kind: "unknown", label }`), and
  `completion.outcome`; the “reads <reading>” words come from `sessionShown`.
  Hosts and the server add nothing.
- **The question.** `DeleteRecord` in `src/sessionRecordActions.tsx` already
  owns an in-place question: asking step, keyboard on the safe choice, Escape,
  the keyboard returned to the control, withdrawal when the state changes.
  Generalise that interaction and have both Delete record and Mark as done use
  it. Add no dialog and no second copy.
- **The operation.** `markDone` (`src/launchRecordActions.ts`,
  `markSessionDone` in `src/pageSidePanel.ts`) and the server's done mark stay
  unchanged. The question sits in front of the page's request only.
- **Controls.** The card and the report panel share `useReportOrDoneMark`
  (`src/pageSessions.ts`); the terminal panel has its own `useMarking` use.
  The ask-first decision joins that shared hook so the three controls hold no
  rule of their own.
- **Current record in the panel.** A panel keeps the record it was opened
  with (`openTerminal` in `src/pageSidePanel.ts` keeps `current` for the same
  session). The panel's decision therefore takes the session's record from the
  page's current machine `records` (`PageFrame`), which cover every project,
  falling back to the opened record.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| Existing done, delete, Cursor-report, and unread-report journeys run locally (all slices) | `unset NODE_ENV; npm ci`; `npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-launch-card-done agent-terminal-delete agent-terminal-done.spec agent-completion-cursor session-unread-report` → 11 passed (15.3s). |
| Many existing journeys click Mark as done and will meet the question (slices 1–3) | `grep -rn "Mark as done" dashboard/tests --include="*.ts"` names 30 spec files and 3 support files; 20 lines click it directly, others through local helpers such as `markDone` in `agent-launch-card-done.spec.ts`. No shared support step exists. |
| The first card-done journey marks a never-reported, unavailable session, so it will be asked (slice 2) | Read `agent-launch-card-done.spec.ts`: “Session unavailable” then `markDone(onCard("Execution"))`. |
| The dashboard has no unit-test runner; proof is Playwright journeys | `find dashboard scripts -name "*.test.*" -not -path "*/node_modules/*"` → nothing; `package.json` scripts hold only `test:dashboard` for the dashboard. |
| Fixtures can show a report and then a new reading on one Claude session (slice 2) | `session-unread-report.spec.ts` step 2: after a report, a new instruction reads Working; it passed in the run above. `claudeSessionBecomes` offers `working`, `blocked`, `done-live`, `failed`, `stopped`, `forgotten` (`dashboard/tests/README.md`). |
| A Codex terminal-panel journey can set a waiting observation (slice 3) | `agent-terminal-done-codex-page.spec.ts` sets `native.observations.set(native.threadId, …)` directly before Mark as done in the panel; `agent-launch-codex-observation.spec.ts` shows Needs input from the same fake. |
| A Cursor reported session offers Mark as done as local Done (slice 2) | `agent-completion-cursor.spec.ts` line 103 clicks Mark as done on the card after Mark as read; passed in the run above. |
| The terminal panel's record is the one it was opened with (slice 3) | Read `src/pageSidePanel.ts` (`openTerminal`, `markSessionDone`) and `src/PageFrame.tsx`: `TerminalPanel` receives `terminal` from panel state; `records` reach `PageFrame` for the sidebar only. |
| A panel can show a session whose project the page does not show (slice 3) | `agent-terminal-done.spec.ts:133` “Mark as done from the panel while another project is shown, where the session has no entry” passed in the run above. |
| Cursor readings arrive as labelled unknown state (slices 2, 4) | Read `server/hosts/cursor/sessions.ts` (`labeledUnknown`) and `src/cursorHeldLabel.ts`. |
| Next free plan number | `ls .planning/slice-plans` and every remote branch's `.planning/slice-plans/` end at `245-review-changes-since-last-review`. Allocated 246; the path was free. |

## Outside-in proof

Proof is Playwright journeys in `dashboard/tests/`, run as
`npx playwright test --config dashboard/playwright.config.ts <spec>` with
`NODE_ENV` unset. Each slice also runs every spec it edits, `npm run lint`,
and `npm run typecheck:dashboard`, because the journeys do not typecheck the
sources. Each slice updates the dashboard documentation for the behavior it
lands.

| Story promise | Slice |
| --- | --- |
| A session whose latest report is `completed` and that is neither working nor waiting is marked done at once, on every host | 2 (card, Claude and Cursor), 3 (panel) |
| Every other situation asks first, naming the most pressing situation in the story's order and wording | 2 |
| A `completed` report does not skip the question while the session works or waits | 2 |
| The question is in place, offers Mark as done and Keep open, starts on Keep open, Escape keeps open, and the keyboard returns to the control | 2 (card), 3 (panel) |
| The question is announced to assistive technology | 2 (card), 3 (panel) |
| Confirming runs the existing operation unchanged; declining leaves session, attachments, read state, and reading untouched | 2 (card), 3 (panel) |
| Every place that offers Mark as done asks by the same rule; the terminal stays visible while the panel asks | 3 |
| The open question follows the current reading and goes away when the session becomes complete | 4 |
| Delete record's question behaves as before | 2 |
| Documentation describes the confirmation | 2, 3, 4 |

## Ordered slices

### 1. Existing journeys mark sessions done through one support step
Type: Structure
Status: planned
Proof: Every spec and support file the `grep` above names still passes,
unchanged in what it asserts:
`npx playwright test --config dashboard/playwright.config.ts $(grep -rl "Mark as done" dashboard/tests --include="*.spec.ts" | xargs -n1 basename)`.

Add `dashboard/tests/support/markDone.ts` with two steps that today both click
the scope's Mark as done control: `markDone(scope)` for a session the story's
rule reads complete, and `markDoneAnyway(scope)` for one it will ask about.
Route every existing click through one of them, classifying each call by the
rule (latest report `completed`, neither working nor waiting). A call made
from a terminal or report panel on a session the rule will ask about stays on
`markDone` with a comment naming slice 3. Assertions that only check the
control's presence or absence stay as they are. This enables slice 2: turning
the question on then changes one support step instead of thirty specs.

### 2. Mark as done on a card asks first unless the session's intention is complete
Type: Behavior
Status: planned
Proof: New `agent-launch-done-question.spec.ts`, on Claude card sessions:
(a) reported `completed` with a reminder, read, Ready for review → one click,
gone from the card, Done in Recent sessions. (b) Working, no report → the
question reads “This session is still working. Marking it done asks it to
stop. Mark it done anyway?”, focus is on Keep open, the question is in a live
region or labelled group that a role query finds; Keep open → entry, state,
and no `claude stop` call; focus on Mark as done. (c) Reported `completed`,
then Working → asks, still working. (d) Blocked (Needs input) → “waiting for
your input”; confirming renames and stops exactly as
`agent-launch-done.spec.ts` asserts today. (e) Ready for review, never
reported → “has not reported its work complete. It reads Ready for review.”
(f) Reported `unfinished`, read, Ready for review → “reported unfinished
work”; Keep open leaves the report read. (g) Session unavailable, never
reported → asks with that reading. (h) Escape on an open question → closed,
untouched, focus on Mark as done. Added to `agent-completion-cursor.spec.ts`:
a Cursor session with a read `completed` report and an unreachable runner is
local Done in one click. Delete record's journeys
(`agent-terminal-delete`, `agent-launch-card-delete`,
`agent-launch-recent-delete`) pass unchanged. All specs slice 1 touched pass
with `markDoneAnyway` now answering the question on a card.

Behavior: a card entry offers Mark as done → the developer clicks it → a
session whose intention is complete is marked done at once; any other session
shows the in-place question with its one statement, and only its Mark as done
runs the existing operation, while Keep open or Escape leaves everything as it
was and returns the keyboard.

Includes the pure intention fact, the generalised in-place question that
Delete record now also uses, the ask-first decision in `useReportOrDoneMark`,
and the Mark as done description in
`dashboard/AGENT-LAUNCH-TERMINALS.md` and
`dashboard/AGENT-LAUNCH-COMPLETION.md`. Interim behavior: the terminal panel,
and the report panel if it still exists, mark done without asking until
slice 3.

### 3. Mark as done in a panel asks by the same rule
Type: Behavior
Status: planned
Proof: Added to `agent-terminal-done.spec.ts`: a Working Claude session's
terminal panel → Mark as done → the panel shows the question with focus on
Keep open while the terminal rows stay visible; Keep open → panel open, still
attached, no stop; Mark as done in the question → the existing closing
journey. A session opened while Ready for review that then reads Working is
asked about working, proving the current record is used. The
other-project journey at line 133 asks and completes. Added to
`agent-terminal-done-codex-page.spec.ts`: a waiting Codex observation → the
panel asks “waiting for your input”; confirming renames and interrupts as
that spec asserts today. A session with a read `completed` report, Ready for
review, is marked done from the panel in one click. All panel callers left on
`markDone` in slice 1 move to `markDoneAnyway` and pass.

Behavior: a terminal panel, or a report panel while one exists, offers Mark as
done → the developer clicks it → the same rule and question apply, decided
from the session's current record, shown within the panel with the terminal
still visible; confirming runs the existing operation and closes the panel as
today.

Includes the panel passage of `dashboard/AGENT-LAUNCH-TERMINALS.md` and
`docs/dashboard-session-troubleshooting.md` where it describes Mark as done.

### 4. An open question follows the session's current reading
Type: Behavior
Status: planned
Proof: Added to `agent-launch-done-question.spec.ts`: (a) the question is open
on a Working session; the session becomes blocked and the page reads again →
the statement reads “waiting for your input” with the question still open.
(b) The question is open on a Working session with a read `completed` report;
the session becomes `done-live` and the page reads again → the question is
gone and Mark as done is back; one click then marks it done. The same pair
once in the terminal panel, in `agent-terminal-done.spec.ts`.

Behavior: the question is open → a later reading changes the session's
situation → the statement follows it, and a session that became complete loses
the question and gets its Mark as done control back, as Delete record's
question does when its state becomes known.

## Current decisions

- The rule and its statement are one client-side fact over the shown record;
  the done endpoint neither refuses nor asks.
- The question's confirming button is named Mark as done, like the control it
  replaces. Where the panel keeps its header control visible, the question is
  its own labelled group so each is addressable; the header control is
  disabled while the question is open.
- The question is announced through the group's label or the entry's existing
  status role; no new announcement mechanism is added.
- If [attention messages on the story card](../../seeds/SEED-103-attention-message-on-story-card.md#attention-message-on-story-card)
  lands first, the report panel is gone and slice 3 covers the terminal panel
  only. Mark as done then stands beside an unread message; the rule is
  unchanged and an unread report alone does not ask.
- A confirmed mark that the boundary refuses says the existing “could not be
  marked done” words; the next click asks again.

## Learnings

None yet.
