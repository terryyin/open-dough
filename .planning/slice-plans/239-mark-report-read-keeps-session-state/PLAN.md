# Acknowledge a session report without ending the session's state

**Identity:** SEED-052#mark-report-read-keeps-session-state
**Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#mark-report-read-keeps-session-state)

## Goal and scope

A launch whose report is unread offers **Mark as read** on its card entry and
its report panel. It records durably that this report was read, clears the
unread-report marker and its card count, and leaves the session open with its
live native reading. Once read, **Mark as done** closes a reported session the
way it closes one without a report. Hosts with no native stop (Cursor) still
record only local Done. The terminal panel's Mark as done behaves the same way.

Excluded, as the story bounds it: report delivery and retention are unchanged.
A new instruction does not mark a report read, and quiet completion still
records local Done on arrival. Records already marked done stay done, with no
migration.

**Prerequisite:** the unread-report marker is on trunk: `sessionShown`
(`dashboard/src/sessionShown.ts`) reads the native state and adds
`unreadReport` for a report while `doneAt` is unset. This plan changes that
unread rule. The story's recorded dependency on it is satisfied.

**Common rule:** the record keeps `reportRead`, the receipt of the report the
developer read. A report is unread while the record is not marked done and
`reportRead` differs from the report's receipt. A newer
report, which arrives with a new receipt, is unread again without any extra
rule. Mark as read writes nothing else: it leaves `doneAt`, `doneProblem`, and
`dispositionChangedAt` alone, so quiet-completion auto-Done
(`server/completionDelivery.ts:68-78`) is unchanged. There is no new
architectural concern; no ADR or North Star topic applies.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The unread rule exists: `sessionShown` returns `unreadReport` only from `completion` and `doneAt`, the report carries a uuid `receipt` for `reportRead` to keep, and `session-unread-report.spec.ts` drives a Claude report through the real reporting command | Slice 1 | Read `dashboard/src/sessionShown.ts:51-64` and `src/completionReport.ts:7` on trunk at `da0d17c1`; `unset NODE_ENV; npm run test:dashboard -- --grep "an unread report is its own mark" --reporter=line` | Confirmed: 1 passed; its step 4 (`:162-176`) chooses the card's Mark as done |
| A reported session's Mark as done only sets local `doneAt`, with no rename, detach, or stop | Slice 2 | Read `dashboard/server/doneMarks.ts:20-29` | Confirmed |
| Admission accepts Mark as done for a host without native stop only when the record has a report, so read Cursor sessions keep a local Done | Slice 2 | Read `dashboard/server/agentLaunchAdmission.ts:100-111` and `src/sessionCapabilities.ts:37-45` (`marksRecordDone`) | Confirmed |
| Mark as done is offered by three controls: the card (`CardActions`, `marksRecordDone`), the report panel (`SessionResultPanel`, `marksRecordDone` with `doneAt` unset), and the terminal panel (`TerminalPanel`, host `stop` only); all three call `pageSessionPanel.markSessionDone` → `POST` done → `markSessionDone` | Slices 1 and 2 | Read `src/sessionRecordActions.tsx:17-40`, `src/SessionResultPanel.tsx:103-116`, `src/TerminalPanel.tsx:151-160`, `src/TerminalSplit.tsx:108,121`, `src/pageSessionPanel.ts:72-81`, `server/launchBoundaryAnswer.ts:33-45,167` | Confirmed |
| Rebinding a native session rebuilds the record from the incoming one and carries over named kept fields (`completion`, `dispositionChangedAt`, `doneProblem`, `doneAt`), so a new kept field is lost unless it is carried over too | Slice 1 | Read `server/launchRecordBinding.ts:45-74` | Confirmed: `reportRead` must be carried over the same way |
| Record setters change one session's record by `replaceRecords` and set `dispositionChangedAt` for Done | Slice 1 | Read `server/launchRecordStore.ts:74-120` (`setRecordDoneAt`) | Confirmed: the read setter follows the same pattern without touching `dispositionChangedAt` |
| A page journey can launch and report (Claude, Cursor), and observe Claude `stop` and rename calls through the synthetic host | Proof of both slices | `unset NODE_ENV; npm run test:dashboard -- --grep "Cursor installed report offers local Done\|Mark as done on a card's session Claude Code no longer lists\|Claude early attention report binds through normal launch" --reporter=line`; `dashboard.claudeCalls()` filtering `stop` in `tests/agent-launch-card-done.spec.ts:69-91` | 3 passed (re-run with the unread-report journey on `da0d17c1`: 4 passed, 11.0s) |
| Existing specs that rely on a report's Mark as done being local-only | Slice 2 consumers | `grep -n "Mark as done" dashboard/tests/agent-completion-*.spec.ts` | `agent-completion-cursor.spec.ts:92` (card, Cursor), `agent-completion-attention.spec.ts:112` (button visible on an unread report) and `:213-235` (Codex report panel: Done, then no `turn/interrupt` or `thread/name/set`). The last changes: the read session's Mark as done now renames and interrupts |
| Product docs describe a report's Mark as done as local-only acknowledgment | Slices 1 and 2 cleanup | Read `dashboard/AGENT-LAUNCH-COMPLETION.md:25-28` and `dashboard/AGENT-LAUNCH-TERMINALS.md:122-130` | Confirmed: restate as Mark as read, then Mark as done as for any session |

## Key examples and proof

Proof extends the page journey `dashboard/tests/session-unread-report.spec.ts`
(Claude via the synthetic `claude` and the real reporting command) and
`agent-completion-cursor.spec.ts`.

| # | Story example | Observable signal | Owner |
| --- | --- | --- | --- |
| 1 | Unread report, native working → Mark as read on the card | The marker, tooltip line and “1 unread report” are gone. The entry still reads “Working” with the working edge, stays on the card and in the sidebar, and no Claude `stop` call is made. The record's `reportRead` equals the report's receipt and `doneAt` stays unset | Slice 1 |
| 2 | That read session then blocks | “Needs input”, needs-input edge, attention group, badge “1 session needs attention” | Slice 1 |
| 3 | Open the read session's report | The report panel shows the retained message and offers Mark as done, not Mark as read | Slice 1 |
| — | A newer report arrives after read | The marker returns (new receipt) | Slice 1 (focused unit on the unread rule) |
| 4 | Mark as done on the read Claude session | Named with the `done-` prefix, a Claude `stop` call, the entry leaves the card and sidebar, and Recent sessions shows Done | Slice 2 |
| 5 | Cursor: Mark as read, then Mark as done | The entry stays open after read. Done records local Done with no Cursor calls and the entry leaves the card | Slice 2 |
| 6 | Record marked done before this change | Stays Done in Recent sessions; no Mark as read offered | Slice 1 (unit on the unread rule: `doneAt` set ⇒ not unread) |
| — | Terminal panel Mark as done on a reported, unread Claude session | Closes as example 4 | Slice 2 |

Each slice also runs its consumers: the specs that read report and done state,
`unset NODE_ENV; npm run test:dashboard -- --grep "completion|attention|unread|Mark as done|done|Sessions sidebar|alert"`
from the repository root, and `npm run typecheck:dashboard` and
`npm run lint`, as the repository's commit hooks require.

## Ordered slices

### 1. Mark as read acknowledges a report and leaves the session open
Type: Behavior
Status: done
Proof: examples 1–3 added to `session-unread-report.spec.ts`; focused
unit checks of the unread rule (newer receipt, done record); and the consumer
specs above. `agent-completion-attention.spec.ts:112` now expects
“Mark as read” on the unread report, and step 4 in
`session-unread-report.spec.ts` (Mark as done clears the marker) chooses
Mark as read from the card instead, since the card no longer offers
Mark as done while a report is unread.

Behavior: a launched session with an unread report → the developer chooses
Mark as read on its card entry or report panel → the record keeps the report's
receipt as read. The marker and card count clear. The entry keeps its native
reading and place, and its later native readings show and alert as any open
session's do. The controls then offer Mark as done where they did before.

Changes:

- Schema and store: `launchRecord.ts` gains optional `reportRead` (uuid).
  `launchRecordStore.ts` gains a read setter, and
  `launchRecordBinding.ts` carries `reportRead` over.
- Boundary: a `read` request kind in `sessionAdmission.ts` and
  `agentLaunchAdmission.ts`, accepted only for a record whose report is
  unread, answered in `launchBoundaryAnswer.ts` with the record and its state.
- Page: `pageSessions`/`pageSessionPanel` gain `markRead`, which leaves the
  panel open.
- Reading: `sessionShown`'s unread rule reads `reportRead`.
- Controls: `CardActions` and `SessionResultPanel` show Mark as read while
  the report is unread, and Mark as done otherwise.
- Docs: `AGENT-LAUNCH-COMPLETION.md` (“remain open until Mark as done”) is
  restated.

Interim behavior until slice 2: after Mark as read, a reported session's
Mark as done still records only local Done.

Accepted proof: `unset NODE_ENV; npm run test:dashboard -- --grep "unread" --reporter=line`
(28 passed: `session-unread-report.spec.ts` steps 4, 6 and 7, and
`session-unread-rule.spec.ts`), and the consumer grep with `--workers 4`
(145 passed). Typecheck clean.

Learnings:

- `updateRecord` in `launchRecordStore.ts` rebuilds a record on lifecycle
  updates as binding does, so it carries `reportRead` over too.
- The read request names only the session; the server writes the receipt it
  admitted, so a report arriving in between stays unread.
- Under heavy machine load (load average 35–44 from other work), the consumer
  grep at default workers timed out on the 5s wait for the synthetic Claude
  launch call, before any changed code ran; the same specs passed alone,
  repeated 8 times, and the full grep passed at `--workers 4`. Run the
  consumer grep with `--workers 4` while the machine is loaded.

### 2. Mark as done closes a reported session as it closes any session
Type: Behavior
Status: planned
Proof: example 4 in `session-unread-report.spec.ts`, and the terminal-panel
case in the same journey. Example 5 goes in `agent-completion-cursor.spec.ts`,
whose `:92` step becomes Mark as read, then Mark as done.
`agent-completion-attention.spec.ts:213-235` becomes Mark as read, then
Mark as done, and expects the Codex rename and interrupt of an observed
in-progress turn, as `agent-terminal-done-codex-page.spec.ts` does. The
consumer specs above also run.

Behavior: a reported session, read or not, on a host with native stop → the
developer chooses Mark as done on its card, report panel, or terminal panel
→ local Done, native rename, attachments closed, and native stop unless
unavailable, with the same `doneProblem` diagnostics as an unreported session.
On a host without native stop, it records local Done only, as today.

Changes:

- `doneMarks.ts`: the completion branch applies only to a host without
  `stop`.
- `AGENT-LAUNCH-TERMINALS.md`: “Explicit reports and local Done” becomes one
  short paragraph on Mark as read and Mark as done, and the
  “unreported sessions” qualifiers in its Mark as done paragraph go.
- `AGENT-LAUNCH-COMPLETION.md`: the Done sentence is restated to match.
