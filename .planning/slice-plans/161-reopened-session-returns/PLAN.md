# Keep a reopened session on its story's card

## Source and authority

- **Identity:** SEED-052#reopened-session-returns
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#reopened-session-returns),
  refined with Terry on 2026-09-29 after a session marked done was reopened,
  took its story, and stayed off the card.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A session marked done whose terminal the developer opens again loses its done
mark, returns to its story's card with its current state, and is kept like any
unclosed session. Marking it done again closes it as before.

Key examples (from the story):

1. Mark a card's Execution session done, then Open terminal on its Recent
   sessions entry: once the terminal attaches, the card lists the session
   again and Recent sessions no longer shows Done.
2. After a dashboard restart, the reopened session is still on its card.
3. Mark it done again: it leaves the card, shows Done, kept 30 days from this
   mark.
4. A done session Claude Code no longer lists is refused (410); it stays done
   and off the card.

Constraint (story): session facts stay local evidence and never move a story.
Excluded (story): renaming the session back from its `done-` name; sessions
this dashboard did not launch.

## Current decisions

- **The attach is the reopening.** The terminal boundary clears the record's
  done time only once `claude attach` has started for an admitted upgrade
  (`server/agentTerminals.ts` `connect`, after `attachClaude` succeeds). A
  refused upgrade (`server/agentLaunchAdmission.ts` `admittedAttach`) or an
  attach that could not start leaves the record unchanged. Reading records
  never changes them.
- **One done-time write.** Clearing goes through the same store write as
  marking (`server/launchRecordStore.ts` `markRecordDone`/`replaceRecords`):
  one operation sets or clears a kept session's done time, not a parallel
  "reopen" store path. Retention already follows the done time
  (`withinRetention`), so a cleared record is kept like any unclosed one.
- **The page follows the store.** Membership stays `cardSessionsOf` (records
  without `doneAt`); nothing new decides it. After its terminal attaches to a
  session the page holds as done, the page replaces that record from the
  boundary's answer (re-reading the project's records, as `useAgentLaunches`
  already does), without waiting for the steady-pace read or a reload.
- The Recent sessions entry's Done state and "Named done-…" line already key
  off `doneAt` (`src/SessionEntry.tsx`); no wording change is needed.
- `sessionShown` (`src/sessionShown.ts`) gives a session marked done no
  attention; a cleared mark restores it with no extra rule. Keep one
  membership and one attention rule.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| A done session Claude Code still lists is admitted to attach; an unlisted one is refused. | `src/agentLaunch.ts` `attachOpens` (`kind !== "unlisted"`), used by `admittedAttach`; `agent-terminal-boundary.spec.ts` "attaches to a stopped session Claude Code still lists" and "refuses an upgrade for a session Claude Code no longer lists". | Yes. Examples 1 and 4 run through today's admission. |
| The terminal boundary has one place where an attach has actually started. | `server/agentTerminals.ts` `connect`: `attachClaude` in a try, then `this.attached.set`. `TerminalSession` carries `sessionId`, `shortId`, `folder`, not the source id. | Yes. The source id must reach `connect` (through `TerminalSession` or the admit callback). |
| Marking writes the done time through one store function. | `server/launchRecordStore.ts` `markRecordDone` over `replaceRecords`. | Yes. It generalizes to setting or clearing. |
| The page's done view is a pure function of `doneAt`. | `src/agentLaunch.ts` `cardSessionsOf`; `src/SessionEntry.tsx` `markedDone = record.doneAt !== undefined`. | Yes. |
| A page journey already reaches a done session with Open terminal. | `agent-terminal-done.spec.ts:77`: after marking, the Recent sessions entry shows Done and offers Open terminal, through a reload. | Yes. Example 1 extends it. |
| The focused specs run locally. | From the main checkout at `fabea78d`: `npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/agent-terminal-done.spec.ts dashboard/tests/agent-terminal-boundary.spec.ts`. | 36 passed (7.5 s). |

## Slices

### 1. Opening a done session's terminal puts it back on its card
Type: Behavior
Status: planned
Proof:
- `agent-terminal-boundary.spec.ts`: an attach to a done, listed session
  answers the record from `recordsOf` without `doneAt`, also after a server
  restart; a refused attach to a done, unlisted session keeps its `doneAt`.
- `agent-terminal-done.spec.ts`, continuing the Mark as done journey: Open
  terminal on the Done Recent sessions entry attaches; the card lists the
  session again (`cardSessions` count 1, state not Done); the Recent sessions
  entry no longer shows Done or "Named done-…"; a reload keeps it; Mark as
  done again removes it from the card and shows Done. Membership unchanged
  (`expectMembership`).
- `npm run typecheck:dashboard`; the whole dashboard suite before delivery
  (it runs in under a minute, and page-wide specs have caught page changes
  only in CI, DD-177).

Behavior: see the key examples. Update `dashboard/AGENT-LAUNCH.md` (the Mark
as done paragraph's closing sentences, and the terminal boundary paragraph:
an admitted attach clears a done mark) and the North Star row "Launch actions
/ Card sessions / Recent sessions" in `docs/dashboard-ux-ui-north-star.md`
(keep it at 250 lines or fewer).

## Proof ownership

| Promise | Owner |
| --- | --- |
| Admitted attach clears the mark; restart keeps it cleared | 1: boundary spec |
| Refused attach keeps the mark (example 4) | 1: boundary spec |
| Card and Recent sessions follow the cleared mark without reload (example 1) | 1: `agent-terminal-done.spec.ts` |
| Mark again closes it (example 3) | 1: `agent-terminal-done.spec.ts`; retention from the done time stays `agent-launch-records.spec.ts` |
| Session facts never move a story | 1: `expectMembership` in the journey |

## Delivery checks

Focused specs above, `npm run typecheck:dashboard`, and the whole dashboard
suite before delivery. Gate commit and delivery on `npm run format`
succeeding. Run the `dough-post-change-refactor` pass before the commit.

## Concern review

One Behavior slice: the boundary clearing and the page reflecting it are one
postcondition (the session is back on its card) with one proof loop, and
neither is observable alone. The design adds no rule: membership and
retention already follow `doneAt`, and the one store write gains the clear
case. No concern remains.
