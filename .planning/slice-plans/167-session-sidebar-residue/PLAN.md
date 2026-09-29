# Keep the Sessions sidebar's reads and reveals honest

## Source and authority

- **Identity:** SEED-052#session-sidebar-residue
- **Source:** [correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#session-sidebar-residue),
  from the execution retrospective of SEED-052#session-sidebar on 2026-09-29
  (plan at `df01b778:.planning/slice-plans/164-session-sidebar/PLAN.md`).
- **Provenance:** reviewed commits `0ebb635d`, `79e2eb9a`, `e63f5be2`,
  `fbf80b82`, and the CI repair `2e72ee16` on `claude/session-sidebar`, after
  the Take `b3f7b861`; the merge of trunk `749dcc12` is excluded.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

The sidebar, cards, and Recent sessions show every kept session's state from
a Claude Code listing whose folder is known to answer all of them; a list
never looks complete before the machine's sessions are first read; and a
reveal the developer left behind never scrolls the page later.

Preserved: every promise of SEED-052#session-sidebar and its accepted proof
(`df01b778:.planning/slice-plans/164-session-sidebar/PLAN.md`), now in
`dashboard/AGENT-LAUNCH.md` and the sidebar specs; a launched session still shows on its card at once with the
keyboard on its entry; `sessionShown` and `attentionSummary` stay the one
reading of state and attention. Excluded: highlighting a Session unavailable
entry's card (the story's example says "highlights" while its Scope derives
the mark from the terminal's session — Terry's wording decision, not this
correction); how a card taller than the window is centered; naming and
duplication cleanup that SEED-052#card-session-residue's module rename
(`terminalOpening.ts` to `pageSessions.ts`) will touch when the two
integrate.

## Current findings

1. `dashboard/server/projectFolders.ts` `machineFolder()` is the home folder,
   where `dashboard/server/agentLaunches.ts` `machineSessions()` runs
   `claude agents --json --all`. The plan 164 premise observed the listing
   only from `~/git/open-dough` and `~/git/pygardon`; the fake `claude`
   ignores its folder, and Claude Code treats folders differently elsewhere
   (`folder-not-trusted` is a launch failure). If home answers differently,
   every surface shows State unknown and attention disappears. `stateOf`
   still lists in the record's project folder: two folder rules for one
   machine-wide listing.
2. `dashboard/src/TerminalSplit.tsx` keeps the target of `goToSession`
   (`going`) until it is revealed. Picking an entry for project P and then
   showing Q's stories before P's answer leaves it pending; showing P later
   scrolls the page to that card unasked, against the comment "until the
   developer … goes elsewhere".
3. `dashboard/src/agentLaunches.ts` `start` adds a launched record to
   `current ?? []`, so a launch answered before the first successful read
   makes the sidebar and Recent sessions list only that session, as if
   complete, until the next read (up to 15 seconds).
4. `dashboard/tests/README.md` lists the sidebar specs that use
   `projectFolders` without `session-sidebar-navigation.spec.ts` and
   `session-sidebar-navigation-cases.spec.ts`; the North Star launch row says
   Close returns the keyboard to the entry without the narrow-window case
   (to Sessions) that `dashboard/AGENT-LAUNCH.md` states.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The home-folder listing answers the same sessions as a project folder's | Terry ran `claude agents --json --all \| jq length` on 2026-09-29 from `~` and from the story worktree `~/git/open-dough/.worktrees/session-sidebar` | Holds: 546 from both, no error or prompt |
| Held reads can stage a pick whose project is left before it answers | `dashboard/tests/sessionNavigationJourney.ts` holds Pygardon's stories (`holdPygardonStories`) and records reveals (`recordReveals`, `revealsOf`) | Holds |
| A held first sessions read can be answered after a launch | `dashboard/tests/sessionStatePace.ts` `holdSessionReads` holds GETs only; launches are POSTs | Holds |

## Slices

### 1. The machine read lists from a folder that answers every session
Type: Structure
Status: done
Result: the probe held (546 sessions from both folders), so nothing changes.
Proof: Terry runs, unpaid, `claude agents --json --all | jq length` from
`~` and from `~/git/open-dough`, and reports both counts and any error or
prompt. Equal counts with no error: record them here and change nothing.
Otherwise: `machineSessions()` lists in an existing catalog project's
folder, `machineFolder` is removed, and
`dashboard/tests/agent-launch-session-listing.spec.ts` "answers every
project's records, each naming its project, from one listing" asserts that
folder; `npm run test:dashboard -- 'tests/agent-launch-.*\.spec\.ts'` and
`npm run typecheck:dashboard`.

Internal change only when the probe differs; enables trusting slices 2–3's
states. Update the read paragraph of `dashboard/AGENT-LAUNCH.md` with the
folder.

### 2. A reveal the developer left behind never scrolls the page
Type: Behavior
Status: done
Result: `TerminalSplit` drops a pending pick once `stories.selected` (the
project the developer chose, read or not) differs from the pick's project.
Accepted proof: `npm run typecheck:dashboard`; `npm run test:dashboard --
'tests/session-sidebar.*\.spec\.ts'` (10 passed; the new step failed first
with one reveal); `npm run test:dashboard -- 'tests/agent-launch-.*\.spec\.ts'`
(93 passed). The North Star launch row lives in
`docs/dashboard-ux-ui-north-star.md`.
Proof: a step in `dashboard/tests/session-sidebar-navigation-cases.spec.ts`
(or a new spec if it would pass 250 lines): with Pygardon's backlog read
held, the developer opens the Pygardon entry, then chooses Doughnut; the read
is released; choosing Pygardon again records no reveal (`revealsOf`) and
leaves the page at the top.

Behavior: a pick waiting for its project's stories → the developer shows
another project's stories → the pick is dropped; the terminal it opened
stays. Update `dashboard/tests/README.md`'s spec list and the North Star
launch row's keyboard return for the narrow window.

### 3. A launch before the first read keeps the lists reading
Type: Behavior
Status: done
Result: `useAgentLaunches` keeps launches in `known` with a `read` flag;
`records` is undefined until a read answers, and cards use `launched`.
Accepted proof: `npm run typecheck:dashboard`; `npm run test:dashboard --
'tests/session-sidebar.*\.spec\.ts'` (11 passed; the new step failed first,
the sidebar listing only the launch); `npm run test:dashboard --
'tests/agent-launch-.*\.spec\.ts'` (93 passed).
Proof: a step in `dashboard/tests/session-sidebar-reading.spec.ts`: with the
first sessions read held, a launch from a card shows on that card with the
keyboard on its entry, while the sidebar and Recent sessions still say
"Reading sessions…"; once the read answers, both list every kept session,
the launch included.

Behavior: the machine's sessions stay not yet read until a read answers; a
launch answered earlier is kept for its card and joins the first read's
answer.

## Proof ownership

| Finding | Slice |
| --- | --- |
| 1. Listing folder | 1 |
| 2. Pending reveal | 2 |
| 4. Test guide and North Star keyboard return | 2 |
| 3. Launch before the first read | 3 |

## Delivery checks

Each slice: its named spec, `npm run typecheck:dashboard`, and the
neighbouring `tests/session-sidebar*.spec.ts` and `tests/agent-launch-*.spec.ts`
specs it touches. No paid native host run; slice 1's listing is Terry's
unpaid, read-only observation.

## Execution complete

Product advice: no change. The retrospective found no residue or correction;
the remaining SEED-052 stories are unaffected and keep their priorities.
