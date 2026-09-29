# Guard Mark as done's edges and trim the terminal work's residue

## Source and authority

- **Identity:** SEED-052#terminal-residue, a correction.
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#terminal-residue),
  written by the execution retrospective of SEED-052#interact-with-claude-terminal
  (plan 152; commits `e8553f8d`, `549e2d5a`, `91b8e3b9`, `e73c64d2`,
  `6ddfb0b0`, `ee35dd55`, `815844e4`; its closed plan is at
  `3c8cef8f:.planning/slice-plans/152-interact-with-claude-terminal/PLAN.md`).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer who marks a session done keeps keyboard focus in a sensible place
and sees marking as progress. A published story title can never inject keys
into a session. Maintainers change the terminal and launch boundary through
cohesive modules, one proof per concern, and current test documentation.

Key examples:

1. A story titled with an ESC character is launched and marked done with its
   terminal open → nothing is typed into the attach process, and the `done-`
   name is the record's only.
2. Recent sessions for a marked session reads Done when it is stopped, its
   running label when it runs again, and "Session unavailable" or "State
   unknown" when Claude Code no longer lists it or cannot be read.
3. The boundary refuses a done request → the panel says "The session could not
   be marked done." and stays open.
4. The developer marks a session opened from a card's Started done → focus
   lands on that session's Recent sessions entry, not the page body. Marking
   done while another session has replaced the panel does not pull focus from
   the new terminal.
5. While marking, "Marking as done…" shows in the page's ordinary quiet style,
   not the problem colour.

Preserved promises: everything plan 152 delivered and proved, including the
rejection constraint (only `claude attach` or `claude stop` of a recorded
session, a fixed rename string, never a shell) and the refusals. Test changes
keep the named surviving coverage below.

Excluded: whether Mark as done keeps typing `/rename` into the attached
terminal at all (retrospective finding F1: the keys can reach a permission
prompt or the agent view). That is Terry's decision and a separate change.

Open decisions homed here, outside this correction's scope, for Terry:

- **Mark as done's rename** (F1 above): a guarded in-terminal rename, or the
  `done-` name kept only in the dashboard record, which the story allows when
  the rename cannot be done reliably.
- **State unknown** still offers Open terminal, as it offered the copyable
  command before (`attachOpens` in `src/agentLaunch.ts`).
- **Loading under keyboard focus:** at narrow widths, preparation facts
  arriving after a focus scroll can move the focused control past the window
  edge when scroll anchoring loses its node. `dashboard-header.spec.ts` waits
  for "Reading preparation…" to clear; no product change is recommended.

## Findings (retrospective, reconciled at `815844e4`)

- **F2 guards:** the title schema excludes only `\r` and `\n`
  (`src/agentLaunch.ts` `oneLine`); the control-character guard in
  `server/doneMarks.ts` is the only defence and is untested. The Done-label
  variants (`RecentSessions.tsx`) and the page's could-not-mark state
  (`TerminalPanel.tsx`) are untested.
- **F3 residue:** `server/claudeCode.ts` is 271 lines (240 before plan 152).
  Its launch-outcome classification (`claudeInstruction`, `claudeSessionName`,
  `printedShortId`, `timedOut`, `unconfirmed`, `failedLaunch`, `expired`,
  `launchClaude`) is one concept; the host commands (`execClaude`,
  `attachClaude`, `stopClaude`, `claudeSessions`) are another. `stopClaude`'s
  boolean result is ignored by its only caller (`doneMarks.ts`). The
  recorded-session check for a done request resolves in
  `agentLaunchPlugin.ts` (`markedDone`) while the upgrade's resolves in
  `agentLaunchAdmission.ts`, whose header claims both.
- **F4 overlap:** `agent-terminal-boundary.spec.ts` (256 lines) re-proves
  `verifyLocalOrigin`'s detail matrix (no Origin, `Sec-Fetch-Site`, foreign
  Host) owned by `agent-launch-refusal.spec.ts` and
  `authenticated-read-refusal.spec.ts`, and asserts the fake's own Ctrl+U
  editing. `agent-terminal-close.spec.ts`'s end-to-end server-close case cannot
  detect missing cleanup (plan 152 slice 2's accepted-proof note, at
  `3c8cef8f`); its ended-code case overlaps
  the lifetime journey's Ctrl+Z step. `agent-terminal.spec.ts`'s unavailable
  step duplicates `agent-launch-recent-session-states.spec.ts`.
  `agent-terminal-done.spec.ts` re-asserts fake-level calls owned by
  `agent-launch-done.spec.ts`. `agent-launch-card.spec.ts` repeats the
  page-wide `claude attach` absence check owned by `agent-terminal.spec.ts`.
- **F5:** `TerminalSplit.tsx` `closeTerminal` focuses the opener while
  connected; a card's Started button disappears once the session stops, and a
  replaced panel's opener steals focus. `.terminal-status` uses `--problem`
  for "Marking as done…".
- **F6:** `dashboard/tests/README.md` describes only the slice-2 fake and two
  terminal specs.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The findings hold at the reviewed revision. | Read `stopClaude` callers, `oneLine`, `closeTerminal`, `.terminal-status`, `markedDone`, `tests/README.md`; `wc -l` at `815844e4`. | As described above: 271 and 256 lines; the stop result is awaited and dropped; `--problem` colours the status. |
| The surviving coverage exists. | The retrospective's read of `agent-launch-refusal.spec.ts:50-60`, `agent-launch-recent-session-states.spec.ts:44-62,188`, `agent-launch-done.spec.ts:67-139`, `agent-terminal-lifetime.spec.ts:157-168`, and the close spec's hook test. | Each owns the concern named in Proof ownership. |

Plan 151 (SEED-052#recent-sessions-residue) landed on `main` in parallel and
added shared page helpers `recentSessionName` and `sessionNamedBy` in
`dashboard/tests/dashboardPage.ts`; slice 3 reuses them in the terminal specs
instead of their own session-id selectors. Its changes to the states spec keep
the label table this plan extends.

## Slices

### 1. Mark as done keeps focus and shows progress, and its guards are proved
Type: Behavior
Status: done
Proof: `agent-launch-done.spec.ts` (control character), `agent-launch-recent-session-states.spec.ts` (Done variants), `agent-terminal-done.spec.ts` (could-not-mark, focus, status style).

Accepted proof: `npm run test:dashboard -- $(ls dashboard/tests/agent-*.spec.ts)`
(140 passed) and `npm run typecheck:dashboard`. Observations: the done spec's
control-character test (no attach lines, one stop, listing name unchanged);
the states spec's "a session marked done reads Done…" step; the done page
spec's main test (quiet `--quiet` colour while the request is held, then the
entry's Open terminal focused), "a refused mark keeps the panel open…" (the
project folder moved aside), and "a mark answered after another session
replaced the panel…". Reverting `TerminalSplit.tsx`/`TerminalPanel.tsx` or the
guard failed the corresponding tests.

Learnings: focus returns in a layout effect after the panel's removal, which
relies on the marked record and the close rendering in one commit; a session
whose entry offers no Open terminal (Session unavailable) leaves focus on the
body. The refactor made the fake's `claudeLaunchCalls()` return only `--bg`
launches; stops are read from `claudeCalls()`.

Behavior: examples 1–5. When the opener is gone, closing after Mark as done
focuses that session's Recent sessions entry control; closing a panel that is
no longer the open one moves no focus. The marking status uses the quiet
style; the ended and disconnected states keep the problem colour. Add a
`doneAt` dimension to the states spec's label table. Give the fake a
refused-done scenario or use an unrecorded session to reach the could-not-mark
state through the page. Update `AGENT-LAUNCH.md` only if wording changes.

### 2. The Claude Code host module and admission each hold one concept
Type: Structure
Status: done
Proof: unchanged behavior under `npm run test:dashboard -- $(ls dashboard/tests/agent-*.spec.ts)` and `npm run typecheck:dashboard`.

Accepted proof: that command, 140 passed (the same as before the slice), and a
clean typecheck. `claudeLaunch.ts` (150 lines) holds the launch and its
outcome; `claudeCode.ts` (132) keeps the host commands. `stopClaude` returns
nothing. The admission module's private `recordedSession(launches, source,
id)` resolves the recorded session for both the done request and the
upgrade.

Move the launch-outcome classification into its own module beside
`claudeCode.ts`, which keeps the host commands; both end under 250 lines.
Drop `stopClaude`'s unused result. Move the done request's recorded-session
resolution into `agentLaunchAdmission.ts` so both requests resolve there.

### 3. One proof per terminal concern, with current test documentation
Type: Structure
Status: done
Accepted proof: `npm run test:dashboard -- $(ls dashboard/tests/agent-*.spec.ts)`
130 passed (ten redundant tests removed: the boundary spec's no-Origin,
`Sec-Fetch-Site`, and foreign-Host upgrades and the close spec's end-to-end
and ended-code cases, in both modes), `authenticated-read-refusal.spec.ts` 19
passed, and a clean typecheck. Each removal's owner was read at HEAD first.
The refused-mark test keeps its "no `stop`" check, since no other test covers
a done request refused for a missing folder. Foreign-Host refusal is proved
only in preview mode, because Vite answers it first in dev.
Proof: the trimmed specs pass with `npm run test:dashboard -- $(ls dashboard/tests/agent-*.spec.ts)`; each removed assertion's surviving owner is named below and still passes.

Trim the boundary spec's origin matrix to one cross-site refusal per mode and
drop the fake-editing assertion; keep the close spec's hook test and drop its
end-to-end server-close case and the ended-code case that the lifetime journey
covers (or keep one mode's socket-level ended-code case). Drop the terminal
journey's unavailable step, the done page spec's fake-level assertions, and
the card spec's absence check. Update `dashboard/tests/README.md` for the fake's
Ctrl+U, `/rename`, and `stop`, and for the lifetime, close, and done specs.

## Proof ownership

| Promise | Owner |
| --- | --- |
| No key injection from a title | 1: control-character case in `agent-launch-done.spec.ts` |
| Done-label variants | 1: states spec with `doneAt` |
| Could-not-mark, focus, status style | 1: `agent-terminal-done.spec.ts` |
| Origin refusal details | `agent-launch-refusal.spec.ts`, `authenticated-read-refusal.spec.ts`; wiring: one case per mode in the boundary spec |
| Server close ends attach processes | close spec hook test |
| Ended terminal | lifetime journey Ctrl+Z step |
| Unavailable session has no open action | `agent-launch-recent-session-states.spec.ts` |
| Rename and stop calls | `agent-launch-done.spec.ts` |
| No copyable attach command | `agent-terminal.spec.ts` |

## Delivery checks

Focused Playwright specs per slice plus `npm run typecheck:dashboard`; check
`npm run format`'s exit status directly (this repository has no commit hook).
The whole dashboard suite is not a local gate. No payload or skill changes.

## Concern review

Three slices, one outcome each: user-visible guards and fixes, then module
structure, then test consolidation. Slice 2 follows slice 1 so the done flow's
proof is settled before the admission move. No slice-specific concern was
identified in this review.
