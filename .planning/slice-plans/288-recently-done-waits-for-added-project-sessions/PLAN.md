# Recently done waits for an added project's sessions

**Identity:** SEED-123#recently-done-waits-for-added-project-sessions
**Source:** [correction story](../../seeds/SEED-123-dashboard-suite-stable-under-load.md#recently-done-waits-for-added-project-sessions),
from the execution retrospective of plan 282
(`324375f4..83d75f3e`; slice 4 at `f01ea795`; recovery:
`1b365ce0:.planning/slice-plans/282-dashboard-suite-stable-under-load/PLAN.md`).
**Prepared:** 2026-10-10 by the plan 282 retrospective; refined 2026-10-10
by preparation `mrsn-chan` in
`/Users/terryyin/git/open-dough/.worktrees/recently-done-waits-for-an-added-project-s-sessi`
on `claude/recently-done-waits-for-an-added-project-s-sessi` at `84e3e34f`.
Publication target: `origin/main`.

## Goal and scope

Recently done reads a project's done stories only once a sessions read asked
after the latest change of the project list has ended, so a project added
while the page is open is read as the first project is: nothing until its
sessions are known, then only the stories among its first ten entries. A
read that ends unanswered still lets the stories shown without sessions be
read. Two suite tightenings from the same review come with it: the Cursor
recovery spec's 1 s paint delay shrinks to the smallest that still
reproduces the chip race, and the dashboard server fixture withdraws its
at-exit runner stop on every close.

Out of this correction: when sessions are read (unchanged); the unbounded
Cursor keep wait after a submitted chip (SEED-129#bounded-cursor-launch-wait,
plan 283 on trunk); the loaded acceptance
(SEED-123#dashboard-suite-passes-loaded-acceptance). Not added: any change
to which entries the column places, or to the first open's behaviour, which
slice 1 must keep green.

## Findings (current at 84e3e34f)

- `dashboard/src/DashboardColumns.tsx:47` passes
  `sessionsSettled: launches.attemptEvidence !== "unread"`;
  `dashboard/src/agentLaunches.ts:122-127` derives that from `readAnswered`,
  which never resets, and `readsSettled`, which only grows. The effect at
  `agentLaunches.ts:166-185` asks a new read whenever `projects` changes
  (reference comparison, `lastProjects`), and abandons an in-flight read's
  answer without counting it settled (`if (!current) return`).
- `dashboard/server/agentLaunches.ts:72-78` answers sessions only for
  `configuredProjects()`; `dashboard/server/projectConfiguration.ts:102-129`
  replaces that list when a project is appended, so the read asked after an
  addition is the first that can hold the added project's sessions.
- `dashboard/src/doneDetails.ts:86-101` reads needed records only while
  `readable`, never twice, and abandons every read under way when the
  project or revision changes.
- `dashboard/src/columnSessions.ts:12-26` and `SessionEntry.tsx:197-205`:
  the column says "Reading sessions…" only while `records` is `undefined`,
  the page's state before its first read ever answered. For an added
  project the records are `[]` once filtered, so today the column reads as
  settled with no sessions while its stories are read without them.
- `dashboard/tests/cursor-session-recovery.spec.ts:35`
  `test.use({ cursorSubmitPaintMs: 1_000 })` delays every paste submission
  in the file by 1 s (six tests). The fake Cursor repaints without the chip
  after `FAKE_CURSOR_SUBMIT_PAINT_MS` (`tests/fixtures/fake-cursor-attach:129-148`);
  the fix it guards (`97e0e442`) settles on a later screen without the chip,
  and `cursor-recover-submitted-chip.spec.ts` holds the deterministic proof.
- `dashboard/tests/support/dashboardServer.ts:158-175` registers the at-exit
  runner stop (`endAtExit`, `processGroup.ts:72-77`, which returns the
  withdrawal) for every server but withdraws it on close only when it owns
  the machine (`ownsMachine`, line 96).

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Adding a project in the page replaces the project list with a new array and asks a new sessions read | Slice 1's gate keys on "the read asked after the latest project change" | `projectList.tsx:92` (`replaceProjects: setProjects`), `AddProject.tsx:40`, `agentLaunches.ts:171-176` | Holds |
| The read asked after the addition answers the added project's sessions | Slice 1 key example 1 | `projectConfiguration.ts:102-129`, `server/agentLaunches.ts:72-78`; `project-restored-session.spec.ts` observes an added project's retained session shown after Add | Holds |
| Today the added project's stories are read before that read answers | Slice 1's spec must fail before its fix | `agentLaunches.ts:122-127` with `DashboardColumns.tsx:47`: evidence is `read` from the first project's answer onward | Holds by reading; the slice's spec reproduces it before the fix |
| A gate that closes on the project change and reopens later reads exactly the shown stories once | Slice 1 design | `doneDetails.ts:86-101`: reads only while `readable`, keys never asked twice, project change abandons the previous project's reads | Holds |
| The proof can add a project on a page whose fake GitHub and synthetic `claude` hold the added project's done list and sessions | Slice 1 proof setup | `projectAddMachine.ts:46-72` starts a preview `DashboardServer` with its own fake GitHub; `fakeGitHub.ts:109` answers a repository served by name before `everyRepository`; `publishedWithCatalog` is project-agnostic; `keepProgressiveSessions` hardcodes `source: "open-dough"` and `cwd: dashboard.home` (`recentlyDoneProgressive.ts:147-200`); `addProjectOnPage` waits for the post-add sessions answer before returning (`projectAddPage.ts:7-20`); `holdSessionReads` holds every GET (`sessionStatePace.ts:107-125`) | Holds; the spec needs the source parameter and the dialog steps without that wait, named in slice 1 |
| A delay shorter than 1 s still reproduces the chip race on the pre-`97e0e442` code | Slice 2 | `97e0e442` diff: the old code announced right after Enter, so any repaint delivered after that read reproduces; the fake paints the repaint on a timer | Settled by slice 2's own run; its failure to reproduce at a chosen delay only raises the delay, not the plan |
| Withdrawing the runner stop on every close changes no spec outcome | Slice 3 | `dashboardServer.ts:158-175`: the stop only signals a runner the fixture's own `stopCursorRunner` already ends (`cursorRunnerLifetime.ts:51-58`, `cursorStart.ts`) | Holds |

## Outside-in proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Example 1: an added project's records wait for the read asked after its addition, then only its shown stories are read | 1 | New spec beside `recently-done-progressive-after-sessions.spec.ts` |
| Example 2: that read fails, the ten stories shown without sessions are read | 1 | Same spec, second test |
| Preserved: first-open gating and its two specs | 1 | `recently-done-progressive-after-sessions.spec.ts` and the `recently-done-` group pass |
| Example 3: the shorter delay still reproduces the chip race | 2 | `cursor-session-recovery.spec.ts` against the pre-`97e0e442` `launchInstruction.ts`, then five repeats on the current one |
| Example 4: a server on a fixture's machine leaves no runner stop at exit | 3 | `dashboardServer.ts` withdraws on every close; `run-processes`, `agent-terminal-cursor-runner`, `cursor-` specs pass |

## Ordered slices

### 1. An added project's done records wait for its sessions
Type: Behavior
Status: planned
Proof: A new Recently done journey on `pageTest` with `projectAddMachine`
serves project A's progressive list on `repository` and project B's on
`addedRepository` (14 entries, sessions at 2, 7 and 11, kept for source
`sample-app` under the fixture's home), opens the page on A, holds the
sessions GETs before the Add dialog's steps run, and adds B: the page
selects B, the column says "Reading sessions…", and no `done=bodies` request
for B leaves (`recordsAsked` on the fixture's GitHub, `settle`); on answer,
the first ten entries show and exactly their eight stories are read, with
nothing more after `settle`. A second test aborts the GETs instead
(`connectionrefused`, as the existing failed-read test): B's ten stories
shown without sessions are read. Both fail on the current code. The existing
after-sessions spec and the `recently-done-` group pass.

Behavior: The project list changes → Recently done treats the current
project's sessions as unknown, showing "Reading sessions…", until a
sessions read asked after that change ends, answered or not → then the
shown stories are read, once. In `agentLaunches.ts`, note the ask that
followed the latest project change and the latest settled ask, and expose
"sessions known for the current projects" on `MachineSessions`;
`DashboardColumns` passes that as the column's `sessionsSettled` and leaves
the records undefined while it is false. `attemptEvidence` keeps its other
consumers (`launchAttempts.ts`, `startupRecoveries.ts`). Test support:
`keepProgressiveSessions` takes the source and the checkout it lists
sessions under, and `addProjectOnPage` offers its dialog steps without the
post-add sessions wait, so the first-open specs keep their calls.

### 2. The Cursor recovery spec keeps the shortest delay that reproduces the chip race
Type: Structure
Status: planned
Proof: With `cursorSubmitPaintMs` lowered (start at 150 ms), temporarily
restoring the pre-`97e0e442` `dashboard/server/launchInstruction.ts` still
fails the first test of `cursor-session-recovery.spec.ts` on the chip label;
raise the delay only if it does not. With the current file restored, the
spec passes `--repeat-each 5`.

Structure: The file-wide delay shrinks from 1 s to the smallest value that
still delivers the chip screen and its repaint as separate writes, removing
about 1 s from each of six tests while the race it guards stays reproduced.
It owns the retrospective finding directly; no behaviour changes.

### 3. The server fixture withdraws its runner stop on every close
Type: Structure
Status: planned
Proof: `dashboardServer.ts` withdraws the at-exit runner stop on close for
a fixture's machine as for its own; `run-processes`,
`agent-terminal-cursor-runner`, and `cursor-` specs pass.

Structure: A closed server leaves no at-exit hook that would signal a
runner its fixture already stopped, so the at-exit set holds only live
servers' stops. Owns the retrospective finding directly; no behaviour
changes.

## Current decisions

- The gate is one rule for every project list change, including the first
  list and a removal: "known" means a read asked after the latest change
  has ended. No special case for additions.
- An added project's column shows the same "Reading sessions…" state as a
  first open while its sessions are unknown, rather than a settled empty
  list, so the page's wording stays consistent across both paths.
