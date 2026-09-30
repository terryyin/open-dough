# Delete a session whose state is unknown from the dashboard

## Source and authority

- **Identity:** SEED-052#delete-unknown-state-session
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#delete-unknown-state-session)
  (Goal, Scope, Key examples, UI, and Terry's design record of 2026-09-30).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer whose story card or Recent sessions lists a session showing
"State unknown" presses "Delete record…", confirms, and the dashboard's kept
launch record is gone: the entry leaves the card, Recent sessions and the
Sessions sidebar. The server, not the page's last reading, decides: it reads
Claude Code's listing again and deletes only while the state is still unknown.
Only the record file changes: no `claude stop`, rename or done mark, and the
conversation, Claude Code's listing and any running session are untouched.

Excluded (from the story): deleting a "Session unavailable" record, several
records at once, undo, any delete from the Sessions sidebar. Considered and
excluded: an "undo" toast, and a page-side "unknown for N reads" delay, since
the server re-read already answers the transient-failure risk.

Direction followed: the [North Star](../../../docs/dashboard-ux-ui-north-star.md)
launch row and [Agent launch](../../../dashboard/AGENT-LAUNCH.md): local
evidence stays local, quiet controls, no modal, meaning never by color alone,
origin decides every story fact. No Accepted ADR constrains this; the
dashboard ADR 0008 stays Proposed. The North Star needs a change and is a
slice below, not a new topic.

## PFE: what is reused

- **Request shape and admission:** `dashboard/src/doneMark.ts` (endpoint,
  `{source, session}` request, answer schema) and `admitted`/`recordedSession`
  in `dashboard/server/agentLaunchAdmission.ts` (403 other site, 404 unknown
  project, unrecorded session or missing folder, before any `claude`), plus
  the plugin's route list in `dashboard/server/agentLaunchPlugin.ts`. Delete
  is a sibling of Mark as done, not a new mechanism.
- **State reading:** `AgentLaunches.stateOf` (the join Mark as done and the
  terminal attach already use), so the guard follows the folder rule of
  SEED-052#session-sidebar-residue's plan 167 whichever way it lands.
- **Store:** `launchRecordStore.ts` `replaceRecords` (atomic replace, retention
  drop, unreadable-file aside). It has no removal: add one function beside
  `setRecordDoneAt`.
- **Page:** `pageSessions.ts` (`SessionsOnPage` operations, `SessionRequest`),
  `TerminalSplit.tsx` (`markSessionDone`, `closeTerminal`, `returning`
  keyboard), `useAgentLaunches` (`records`, `replaceRecord`), `SessionEntry.tsx`
  (`MarkDone`, `useMarking`). Delete follows Mark as done's page operation and
  its keyboard return. No structure needs extracting first.

## Current findings

1. A read asked before a deletion and answered after it carries the deleted
   record: `useAgentLaunches` `replaced(kept, known, askedAt)` takes the
   server's `kept` as the truth, so the entry would reappear until the next
   read (up to 15 s). The page must drop a deleted session from reads asked
   before the deletion.
2. `agentLaunchPlugin.ts` `answer` maps only `RefusedRequest` to JSON; any
   other error goes to `next`. A record file that cannot be written must be
   answered as a JSON refusal the entry can show.
3. A session's state on the page comes from the machine listing, while
   `stateOf` lists in the project folder; both fail together only when
   Claude Code itself fails, so the refusal "This session's state is now
   known" is a real, reachable answer (one listing recovering between the
   page's read and the delete).

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| A test can make the listing fail and recover | `claudeListingFails(true|false)` is used by `agent-launch-attention.spec.ts:151`, `agent-launch-done.spec.ts:212`, `agent-terminal-boundary.spec.ts:127` | Holds |
| `claudeSessions` answers undefined, hence State unknown, when the listing fails | `dashboard/server/claudeCode.ts:143-151` (`listing.error \|\| signal.aborted` → undefined); `withStates` maps undefined to `unknown` | Holds |
| The store has no removal, and a write that cannot happen throws | `launchRecordStore.ts` exports `keepRecord` and `setRecordDoneAt` only; on this machine (uid 501) `writeFileSync` into a `chmod 500` directory throws EACCES | Holds; the write failure is testable with a read-only `~/.open-dough/dashboard` in the test machine directory |
| Removing the record from `records` removes it from card, Recent and sidebar | `cardSessionsOf`, `projectSessionsOf` and `openSessionsOf` all derive from `records`; `useSessionSidebar(records)` | Holds |
| A held read can be answered after a page action | `dashboard/tests/sessionStatePace.ts` `holdSessionReads` holds GETs only | Holds |
| No spec treats a unknown session's actions as exhaustive | `grep "State unknown" tests/*`: `agent-launch-attention-clearing`, `agent-launch-card-session-states`, `agent-launch-recent-session-states` assert words and Open terminal only | Holds; adding a button changes none of their assertions |

## Proof ownership

| Promise | Slice | Observation |
| --- | --- | --- |
| Deletes only the record; no stop, rename or done mark | 1 | `claudeCalls` shows no `stop`; the record file holds the other records unchanged |
| Server re-reads and refuses when state is known | 1 | boundary answer `state-known`, record kept |
| Other site, unknown project, unrecorded session refused before `claude` | 1 | refusal statuses, `claudeCalls` empty |
| Unwritable record file answered with why | 1 | JSON error, record kept |
| Card entry: button only while State unknown; two-step confirm; leaves card, Recent, sidebar; status; keyboard | 2 | `agent-launch-card-delete.spec.ts` |
| Keep and Escape change nothing | 2 | same spec |
| Question goes away when the state becomes known; refusal and failure said in the entry; stale read does not bring it back | 3 | `agent-launch-card-delete-problems.spec.ts` |
| Recent sessions entry (story in no list, marked done) offers it and returns the keyboard; sidebar offers none | 4 | `agent-launch-recent-delete.spec.ts` |
| Terminal showing the session closes; a listed session is not stopped | 5 | `agent-terminal-delete.spec.ts` |
| North Star, Agent launch, dashboard test guide state it in the delivered words | 6 | string check below |

## Slices

### 1. The launch boundary deletes a record whose state is still unknown
Type: Behavior
Status: done
Accepted proof: `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-delete.spec.ts dashboard/tests/agent-launch-done.spec.ts dashboard/tests/agent-launch-done-refusal.spec.ts`
(15 passed; the six delete tests observe every listed assertion). Delivered
shapes: `dashboard/src/deleteRecord.ts` (endpoint, request, `deleted` /
`state-known` answers); an unwritable record file answers HTTP 500
`{"error":"The session record could not be deleted: <reason>"}`.
Proof: `dashboard/tests/agent-launch-delete.spec.ts`, beside
`agent-launch-done.spec.ts`, through `agentLaunchBoundary.ts` against a
preview server with the synthetic `claude`. Asserts:
listing fails → POST `/__agent-launch/delete` `{source, session}` answers
`{"kind":"deleted"}`, the next GET lacks that record and keeps the project's
other records, `claudeCalls` holds no `stop`, and the record file's other
entries are unchanged; a session `claudeSessionBecomes` working, or
forgotten, → the same POST answers `{"kind":"state-known","record":<with its
state>}` and the record stays; another site 403, unknown project 404,
unrecorded session 404 with `claudeCalls` empty; an unwritable record file →
a JSON error saying the record could not be deleted, record kept.

Behavior: recorded session, listing unreadable → delete request → record
removed, nothing stopped; state readable → refused as known, record kept.
Adds `deleteRecord` to `launchRecordStore.ts`, `agentDeleteEndpoint` and the
request/answer schemas beside `doneMark.ts`, an admitted `delete` kind, and
the plugin route.

### 2. A card's session entry deletes its record while its state is unknown
Type: Behavior
Status: done
Accepted proof: `npx playwright test --config dashboard/playwright.config.ts`
with `agent-launch-card-delete`, `agent-launch-card-done`,
`agent-launch-card-session-states`, `agent-launch-card-sessions`,
`agent-launch-attention-clearing`, `agent-launch-recent-session-states`,
`agent-terminal-done` and `session-sidebar` specs (all passed). The
attention count is asserted absent only (no session can need attention while
the listing fails).
Proof: `dashboard/tests/agent-launch-card-delete.spec.ts` (fake origin
journey as `agent-launch-card-done.spec.ts`; `launchJourney.ts`,
`dashboardPage.ts`). Two launched sessions on one card, listing fails:
each entry says "State unknown" and offers "Delete record…"; a Working,
Needs input and Session unavailable entry offers none. Press it on one: the
entry asks "Delete this session's dashboard record? The conversation stays in
Claude Code; a running session keeps running." with "Delete record" and
"Keep", the keyboard on Keep, its words and Open terminal still there, no
shift of the card. "Keep", and Escape, restore the button with the keyboard
on it and delete nothing. "Delete record" → the entry is gone from the card,
Recent sessions and the sidebar; the other session, the card's stage and
the attention count are unchanged; the status "Session record deleted" is
announced; the keyboard is on the next entry, or on the card when none is
left. The record file no longer holds the session.

Behavior: entry State unknown → Delete record… → confirm → record deleted
through the boundary and the entry leaves every list. Adds
`requestDeleteRecord` in `agentLaunchClient.ts`, `deleteRecord` in
`useAgentLaunches` and a `deleteRecord` page operation beside `markDone` in
`pageSessions.ts`/`TerminalSplit.tsx`, and the control in `SessionEntry.tsx`
with its CSS. Failure and refusal wording is slice 3; until then a refusal
leaves the entry as it was.

### 3. A delete that is refused, fails, or is overtaken says so and never resurrects the entry
Type: Behavior
Status: done
Accepted proof: `npx playwright test --config dashboard/playwright.config.ts`
on `agent-launch-card-delete-problems` (four tests), `agent-launch-card-delete`,
`agent-launch-delete`, the attention, recent, done, terminal, sidebar,
`accessible-overview-keyboard` and card-session-state specs (33 passed).
Proof: `dashboard/tests/agent-launch-card-delete-problems.spec.ts`. With the
question open, the listing recovers and the next 15-second read lists the
session → the question and "Delete record…" go, the entry shows its known
state, nothing is deleted. The page still shows State unknown but the listing
recovered before the click on "Delete record" → the entry says "This session's
state is now known" beside its state, the record stays. The record file
unwritable → "The session record could not be deleted." with the boundary's
reason in the entry's status line, buttons unchanged, the keyboard unmoved,
and a retry after the file is writable deletes it. A sessions read held by
`holdSessionReads` before the click and released after the delete → the
deleted entry does not reappear.

Behavior: refused, failed, or overtaken deletions leave a truthful entry, and
a deleted session stays deleted against an earlier read. Adds the entry's
delete-state (no question unless still State unknown), the
`state-known` answer applied to `records`, and dropping a deleted session
from reads asked before the deletion in `useAgentLaunches`.

### 4. A Recent sessions entry deletes too, and the sidebar offers none
Type: Behavior
Status: done
Accepted proof: `npx playwright test --config dashboard/playwright.config.ts
--reporter=line` on `agent-launch-recent-delete` (one test) with the card
delete, delete-problems, recent-session, sidebar, `accessible-overview-keyboard`
and `agent-launch-card-done` specs (16 passed), rerun after the refactor.
Proof: `dashboard/tests/agent-launch-recent-delete.spec.ts`. A session whose
story is in no list, and one marked done, both State unknown: each Recent
sessions entry offers "Delete record…"; deleting one removes it from Recent
sessions and the sidebar, and the keyboard goes to the next Recent sessions
entry, or to the Recent sessions section when none is left. The Sessions
sidebar's entries in State unknown contain no delete control (each stays one
control), and a Recent entry in any other state offers none.

Behavior: the same delete from Recent sessions, with its keyboard rule.
Proof-mostly on the shared entry control from slice 2; the new code is the
keyboard home for Recent entries in `pageSessions.ts`
(`sessionKeyboardHome`'s neighbour) and the not-offered-in-sidebar check.

### 5. Deleting the session the terminal shows closes the terminal
Type: Behavior
Status: planned
Proof: `dashboard/tests/agent-terminal-delete.spec.ts`, beside
`agent-terminal-done.spec.ts`. The terminal shows a State unknown session
(Open terminal stays offered while unknown) → its entry's delete confirmed →
the panel closes, no "Shown in terminal" mark remains, `claudeAttaches` shows
the attach detached, `claudeCalls` no `stop` and the session still listed
once the listing recovers, and the keyboard follows slice 2's rule.

Behavior: the operation closes the panel showing the deleted session, as Mark
as done does. Adds the close to `deleteRecord` in `TerminalSplit.tsx`; interim
behavior before this slice (slice 2 to 4): the panel stays until closed,
replaced here.

### 6. The enduring documents state the delete
Type: Behavior
Status: planned
Proof: after slices 1 to 5 the delivered strings are the ones in the
specs. Check: each of "Delete record…", "Delete record", "Keep",
"Delete this session's dashboard record? The conversation stays in Claude
Code; a running session keeps running.", "Session record deleted", "The
session record could not be deleted.", "This session's state is now known"
appears in `docs/dashboard-ux-ui-north-star.md` and `dashboard/AGENT-LAUNCH.md`
(`grep -c` each ≥ 1) and in a spec; the North Star still reads as one row
per its own table.

Behavior: a reader of the North Star and Agent launch finds the delete as
delivered. **North Star:** in the launch-actions table row, state that a
session showing "State unknown" on a card or in Recent sessions entry (not
the sidebar) offers a quiet "Delete record…", asks the confirmation with
"Delete record" and "Keep", deletes only the dashboard's record, that the
server re-reads and refuses with "This session's state is now known", the
keyboard and status rules, and that the terminal closes; adjust its
"Mark as done" sentence only if it now reads as the only way to clear an
unknown entry; update its date and reason line per the guide's revision rule.
**Agent launch:** a "Delete record" paragraph beside Mark as done (endpoint
`/__agent-launch/delete`, request and answers, the guard, records file
effect, no stop or rename, what is refused and before what), and the
State-unknown sentence gains the delete. **Tests guide:** name the four new
specs in `dashboard/tests/README.md` with the existing launch specs.
Also reduce the seed's story to Goal and Scope afterward, at wrap-up, not here.

## Sizing and stopping points

Six slices, each with one outcome and one spec; every stop is a safe stopping
point: after 1 the boundary is usable; after 2 a card deletes (refusals leave
the entry unchanged, the terminal stays until closed); after 3 and 4 it is
complete for entries; 5 and 6 finish the terminal and the documents. Slice 2
is the largest (client request, hook, page operation, control, focus); split
it at the control if it overruns, keeping `requestDeleteRecord` and
`deleteRecord` in the first half.

## Learnings

- Slice 1: the chmod-based unwritable-file test cannot fail as intended when
  run as root; CI and this machine run unprivileged.
- Slice 2: the "Session record deleted" polite region mounts on the first
  deletion, because a second always-present `role="status"` or
  `aria-live="polite"` breaks the single-region locators in
  `accessible-overview-keyboard.spec.ts` and `dashboardPage.ts`; some
  assistive technology may miss that first announcement. Routing the message
  into App's `notice` region would fix it but touches `App.tsx` and those
  locators, so it is a decision for slice 3 or a later story.
- Slice 3: `holdSessionReads` holds a GET before the server sees it, so its
  released answer already reflects a deletion; the stale-read proof uses
  `holdSessionAnswers` (server answers first, the page's copy is held). Mark
  as done and Delete record share one `role="status"` line on an entry
  (`CardActions`), since a second one breaks the single-status locator in
  `agent-launch-card-done.spec.ts`.
- Slice 4: every Recent entry now renders its own `role="status"` line (as a
  card entry does); a page-wide single-status locator would need to scope to a
  region. The Sessions sidebar omits done sessions, so deleting a done Recent
  entry leaves the sidebar count unchanged. `SessionEntry.tsx` (~300 lines) and
  `TerminalSplit.tsx` (~268) are size candidates for later cleanup.
