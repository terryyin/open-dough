# Find and return to any session from a toggleable sidebar

## Source and authority

- **Identity:** SEED-052#session-sidebar
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#session-sidebar),
  refined with Terry on 2026-09-29, including its **Architecture** section.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer with sessions in several projects opens one **Sessions** sidebar
(banner button or Command+B) that lists every unmarked session this dashboard
launched, from every catalog project, newest first, with the same state words
and attention as the cards and one attention count. Opening an entry shows its
project's stories, opens the session in the terminal panel, and scrolls to
its story's card, which says "Shown in terminal".

Key examples (from the story, abbreviated): toggle across views and reloads;
whole-dashboard attention (Doughnut Needs input, Pygardon Ready for review,
Open Dough Working → "2 sessions need attention"); jump across projects;
stable order under state changes; story in no list → its Recent sessions
entry; Command+B from the terminal; Mark as done removes the entry; an
unavailable session opens no terminal; narrow window overlay closes on pick.

Excluded (story): session actions on sidebar entries; done sessions in the
sidebar; replacing or removing Recent sessions; grouping, filtering, search,
resizing; sessions not launched here; notifications.

## Architecture

Follows the story's **Architecture** section and the North Star topic
[Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment),
bullet "Sessions are the machine's, not a project's", added with this plan.
Accepted ADR 0001 and ADR 0002 apply; no Accepted ADR conflicts. The concept
is **the machine's sessions**; slice and module names follow it.

PFE result (existing owners reused or changed, nothing parallel added):

| Responsibility | Existing owner | Outcome |
| --- | --- | --- |
| Kept records + host state | `server/agentLaunches.ts` `recordsOf(source)`, `GET ?source=` in `agentLaunchPlugin.ts` / `agentLaunchAdmission.ts` | **Change**: one machine read of every catalog project's records joined with one listing; the per-project read is removed |
| Page session state | `src/agentLaunches.ts` `useAgentLaunches(source)` (already a per-project map, reads only the selected project) | **Change**: one machine state, `undefined` until first read; `start` takes its project; per-project views derive |
| Which sessions a card lists | `cardSessionsOf(records, identity)` in `src/agentLaunch.ts` | **Change**: scoped by project and identity; the sidebar uses the same "not marked done" rule for all projects |
| State words and attention | `sessionShown`, `attentionSummary` in `src/sessionShown.ts` | **Reuse** unchanged for sidebar entries, heading, and button |
| Terminal, opener return, Mark as done | `TerminalSplit.tsx`, `terminalOpening.ts` (`SessionsOnPage`) | **Change**: the frame also places the sidebar and exposes the shown session |
| Project selection + URL history | `dashboardRoute.ts` (`selectProject` keeps the view; `backToStories` does not select) | **Change**: one "show this project's stories" step |
| Finding a card by identity | `workFocus.ts` (`data-work` marks, `returnFocusTo`) | **Change**: add revealing a card (scroll, reduced motion aware) |
| Page-wide shortcut exemptions | `projectKeyboardNavigation.ts` (`isInsideOpenDialog`, private) | **Modularize**: share the open-dialog rule with the Command+B shortcut |
| Sidebar entry presentation | `SessionEntry.tsx` is an article with inner controls | **Gap**: a sidebar entry is one activating control; a small component using `sessionShown` |
| Open/closed preference | none (no browser storage used yet) | **Gap**: a guarded storage read/write, falling back to closed |

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Claude Code's listing is machine-wide | `claude agents --json --all` from `~/git/open-dough` and from `~/git/pygardon` | Same 535 sessions from both (cwds across doughnut, pygardon, open-dough, terry-talks), 0.16 s each |
| The test fake lists machine-wide too | `tests/fixtures/fake-claude` reads one `agents.json` per server whatever its `cwd` | Holds; a listing's cwd changes only the logged `cwd` |
| Callers of the per-project read | `grep recordsOf\|source=` over `dashboard/` | `src/agentLaunchClient.ts`; helper `tests/agentLaunchBoundary.ts` `recordsOf` used by 9 launch/terminal specs; `tests/sessionStatePace.ts`; admission and plugin |
| A test pins the listing's cwd | `tests/agent-launch-session-listing.spec.ts:120`, `tests/agent-launch-boundary.spec.ts:85` | Both assert `cwd` = project folder; slice 1 updates them to the machine read's folder |
| The page reads no sessions while hidden and then claims none | Live dashboard 2026-09-29, tab hidden: Recent sessions said "No sessions launched from this dashboard are kept." while `GET ?source=open-dough` answered 16 records; `useAgentLaunches` skips reads while hidden and starts from an empty map | Holds; slice 2 shows "Reading sessions…" instead |
| Identities collide across projects only once state is machine-wide | `cardSessionsOf` filters by identity alone over the selected project's records | Holds; slice 1 scopes by project |
| Cards already carry an accent left edge | `src/stages.css:42` `border-left: 4px solid var(--accent)` | Holds; the shown mark is an outline plus "Shown in terminal" text |
| Opening a terminal focuses it | `src/TerminalPanel.tsx:106` `terminal.focus()` | Holds; a sidebar pick lands the keyboard in the terminal, and Close returns it to the sidebar entry through the existing opener rule |
| The fake attach shows a key the page passes through | `tests/fixtures/fake-claude` attach echoes typed keys and records each entered line in `attach.<pid>.lines` | Holds; Ctrl+B then Enter records a line holding `\u0002` |
| Multi-project UI journeys are supported | `tests/agent-launch-attention.spec.ts` uses `projectFolders: ["open-dough", "doughnut"]` and launches in both | Holds; sidebar specs reuse this setup and `launchJourney.ts` |

Sequencing constraint: SEED-052#card-session-residue (Taken, plan 160) is
changing `terminalOpening.ts`'s request shape and the card specs. Start slice 1
from a trunk that contains its landing, or reconcile with it first; do not
redo its changes here.

## Execution context

- Story Branch Mode; integration `/Users/terryyin/git/open-dough`. Owned
  workspace `/Users/terryyin/git/open-dough/.worktrees/session-sidebar`,
  branch `claude/session-sidebar`, created at starting revision
  `726b1c8ce57bf86133463de9b64ccac7f7b6a161`.
- Publisher `claude-session-sidebar`; agent Maki-chan. Claim accepted on
  `origin/main`: `b3f7b861f4fed83b54a765c09294e9834502b8db`. Increments
  target `origin/claude/session-sidebar`. Claim's trunk CI unobserved.
- Setup passed in the workspace: `npm ci` and `npm run typecheck:dashboard`.
  No commit hook; `npm run format` formats.
- Default planning authority (in-scope plan refinement); no slice limit.
- Sequencing: SEED-052#card-session-residue had not landed at the claim (its
  slice 2, the `terminalOpening.ts` request shape, still planned). Slices 1–3
  do not depend on it; merge trunk before slice 4 and reconcile with its
  landing then.

## Slices

### 1. The page reads the machine's sessions once
Type: Structure
Status: done
Proof: existing launch, card, Recent sessions, attention, terminal, and done
specs green (`npm run test:dashboard -- tests/agent-launch-*.spec.ts
tests/agent-terminal*.spec.ts`), plus `npm run typecheck:dashboard`.

Internal change: `GET /__agent-launch` (no `source`) answers every catalog
project's kept records joined with one `claude agents --json --all`, run in
the machine's home folder, and not run at all when nothing is kept; the
`?source=` read is removed from admission, plugin, client, and the
`recordsOf` test helper (which now filters the machine answer by project).
The browser holds one machine session state read on the existing pace and
visibility rules; `start` names its project; cards, Recent sessions, and a
card's attention derive by project and identity. External behavior is
unchanged, except the listing's logged folder in the two boundary specs that
pin it. Enables slice 2's cross-project list. Update the boundary paragraph of
[Agent launch](../../../dashboard/AGENT-LAUNCH.md) that describes the read.

Accepted proof (2026-09-29): `npm run typecheck:dashboard` passed;
`npm run test:dashboard -- 'tests/agent-launch-.*\.spec\.ts' 'tests/agent-terminal.*\.spec\.ts'`
132 passed after refactor (full suite 289/289 before it). Observations:
`agent-launch-session-listing.spec.ts` "answers every project's records,
each naming its project, from one listing" (one `agents --json --all`, cwd
`machineFolder(server)`), "answers each session as Claude Code lists it…"
(listing cwd = home), "answers no records and runs no claude while none are
kept". Learnings: `agent-launch-boundary.spec.ts:85` pins the launch's own
confirmation listing, which stays in the project folder (premise corrected);
selecting a project no longer reads, the steady pace and a revealed page do;
a failed first read leaves the state not yet read, so slice 2 decides what
"Reading sessions…" becomes when the server never answers. `RecentSessions`
now takes the machine records and its project id. `App.tsx` is at 249 lines.

### 2. The Sessions sidebar lists every open session and what needs attention
Type: Behavior
Status: done
Proof: new `dashboard/tests/session-sidebar.spec.ts` (two-project setup as
the attention spec), plus the Recent sessions spec for its reading state.

Behavior: sessions launched in Doughnut and Pygardon, and two in Open Dough →
with Open Dough selected the developer presses **Sessions** in the banner →
a sidebar column opens left of the page (overlaying on a narrow window)
listing every unmarked session of every project newest first, each with
title, project, workflow, launch time, and state words; Needs input and
Ready for review entries have the heavier edge; the heading says "2 sessions
need attention"; a state change updates an entry in place; a session marked
done leaves the list. Before the first read answers, both the sidebar and
Recent sessions say "Reading sessions…" (a page loaded hidden no longer
claims none are kept); with none, "No sessions launched from this dashboard
are kept." With the sidebar closed, the button shows the count as text.
Update [Agent launch](../../../dashboard/AGENT-LAUNCH.md) and the UX North
Star's launch row.

Accepted proof (2026-09-29): `npm run typecheck:dashboard`;
`npm run test:dashboard -- tests/session-sidebar.spec.ts 'tests/agent-launch-.*\.spec\.ts' 'tests/agent-terminal.*\.spec\.ts'`
134 passed; full suite 290 passed. Observations: `session-sidebar.spec.ts`
"lists every project's open sessions newest first…" (entries order and
content via `expectEntries`, edge via `expectSessionShown`, heading and
closed-button counts, stable order, new launch first, marked done leaves,
wide order via `expectSideBySideInOrder`, 700px overlay via
`elementFromPoint`) and "says it is reading until…, then that none are kept,
then none open" (held GET via `holdSessionReads`); Recent sessions step "a
page whose first read of the sessions has not answered says it is reading
them, then lists them". Decisions: at 600px or narrower the Sessions button
starts the banner's second row (still first in reading and Tab order); the
two-line title clamp is the story's explicit ask, with the full title in the
DOM and `title` (a future whole-page layout check with the sidebar open will
meet `notReadWhole`); with every kept session marked done the sidebar says
"No sessions launched from this dashboard are open." A failed first read
keeps "Reading sessions…". Shared pieces: `shownSession` and `SessionList`
in `SessionEntry.tsx`; the frame holds the open state (`SidebarOnPage`).
`docs/dashboard-navigation.md`'s banner paragraph is left to slice 3.

### 3. The sidebar stays as left and answers Command+B
Type: Behavior
Status: done
Proof: new `dashboard/tests/session-sidebar-keyboard.spec.ts`.

Behavior: sidebar open → switching project, opening the roster and going
back, opening and closing the terminal, and reloading → it is still open
(storage unavailable → it starts closed without error); Command+B toggles it
from the page and from inside the terminal without moving the keyboard, and
closing it with the keyboard inside returns the keyboard to **Sessions**;
Ctrl+B in the terminal reaches the session (the fake attach records it in the entered line); with the
launch dialog or badge legend open, Command+B does nothing to the sidebar and
its browser default is suppressed elsewhere. The open-dialog rule is shared
with project arrow navigation, whose keyboard spec stays green. Update the
navigation guidance's banner paragraph.

Accepted proof (2026-09-29): `npm run typecheck:dashboard`; `npm run
test:dashboard -- tests/session-sidebar-keyboard.spec.ts
tests/session-sidebar.spec.ts 'tests/project-keyboard.*\.spec\.ts'
'tests/agent-terminal.*\.spec\.ts'` 53 passed; full suite 294 passed; after
the refactor's spec split, the four `tests/session-sidebar*.spec.ts` files
passed (6). Observations: `session-sidebar-stays-as-left.spec.ts` "starts
closed, and once open stays open across a project switch, the roster and
back, the terminal, and reloads" and "starts closed without error, and still
toggles, when browser storage cannot be used"; `session-sidebar-keyboard.spec.ts`
"Command+B toggles from the page and from the terminal…" (focus unchanged,
default prevented, fake attach line `x\u0002y`) and "an open launch dialog or
badge legend keeps Command+B…". The open-dialog rule lives in
`src/pageShortcuts.ts`. Deferred to slice 4: proof that closing with the
keyboard inside the sidebar returns it to Sessions (implemented in
`useSessionSidebar`'s `toggle`; the sidebar holds no focusable control until
entries become controls). Learning: a spec that reloads after opening the
sidebar sees it open again.

### 4. Opening a sidebar entry goes to its story and its session
Type: Behavior
Status: planned
Proof: new `dashboard/tests/session-sidebar-navigation.spec.ts`.

Behavior: on Open Dough's roster, the developer opens the Pygardon entry →
the page shows Pygardon's stories (one history entry; Back returns), the
terminal opens that session with the keyboard in it, its card scrolls into
view outlined with "Shown in terminal", and the entry is current; opening an
Open Dough entry replaces the terminal session and moves both marks; opening
the entry already shown does not reattach; a story in no list reveals and
marks its Recent sessions entry; a Session unavailable entry reveals its card
and opens no terminal; closing the panel clears both marks and returns the
keyboard to the sidebar entry; on a narrow window the pick also closes the
overlay; under reduced motion the scroll is instant; nothing changes a story
fact or session mark. Update [Agent launch](../../../dashboard/AGENT-LAUNCH.md)
and the UX North Star's launch row.

## Proof ownership

| Promise (story scope) | Slice |
| --- | --- |
| One machine read; per-project read removed; views scoped by project | 1 |
| Toggle button, layout (wide column, narrow overlay), list content and order, state words, attention edge, heading and button counts, reading and empty states, Recent sessions reading state, marked done leaves | 2 |
| Remembered open state, Command+B rules, focus return, modal exemption | 3 |
| Go to project stories, open terminal, reveal and "Shown in terminal", `aria-current`, no-list and unavailable cases, narrow pick closes, reduced motion, changes nothing | 4 |

## Delivery checks

Each slice: its named spec(s), the neighbouring launch/terminal specs it
touches, and `npm run typecheck:dashboard`. CI runs the sharded dashboard
suite; no paid native host is involved.

## Concern review

No remaining slice-specific concerns identified in this review. Slice 1 is
the largest (server, client, and nine spec helpers through one helper); its
sizing rests on the helper absorbing the read change.
