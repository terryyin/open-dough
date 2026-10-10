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
Status: done
Accepted proof: `npx playwright test --config dashboard/playwright.config.ts
dashboard/tests/recently-done-progressive-added-project.spec.ts
dashboard/tests/recently-done-progressive-after-sessions.spec.ts` (4 passed;
both new tests failed before the fix, on "Reading sessions…" and on ten of
B's records read while the read was held), and the `recently-done-`,
`project-`, `system-settings` and "Reading sessions…" consumer specs (198
passed).
Learnings: the second test holds the read before aborting it, because an
outright abort passes on the unfixed code, which reads B's ten stories at
once either way. The gate compares the project list under which the latest
ended read was asked with the current list (`settledFor === projects`)
rather than ask numbers: an ask noted in the effect arrives one commit after
the list changes, and the stories would be read in that commit.
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
Status: done
Accepted proof: at 300 ms, with `this.announce();` reinstated after the
`onEntered()` try/catch of the `pastedChip` branch in
`dashboard/server/launchInstruction.ts`, the first test failed on the chip
label ("waiting for an answer" for "at the follow-up prompt") in 11 of 11
runs; on the current file `cursor-session-recovery.spec.ts --repeat-each 5`
passed (30), with `cursor-recover-submitted-chip.spec.ts` and
`cursor-recover-split-paint.spec.ts` (2).
Learnings: 150 ms failed the first test in only 2 of 5 runs (load average
15 to 21); 200 and 250 ms failed it 6 of 6, so 300 ms keeps a margin. The
literal pre-`97e0e442` file calls `screen.frameOpen()`, which
`KeptClientScreen` no longer has, so the removed announce was reinstated on
the current file instead. "Recover on the idle composer…" failed at every
delay down to 5 ms (34 of 34 runs).
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
Status: done
Accepted proof: `closeOwned` in `dashboard/tests/support/dashboardServer.ts`
withdraws the stop whoever owns the machine; `npx playwright test --config
dashboard/playwright.config.ts dashboard/tests/run-processes
dashboard/tests/agent-terminal-cursor-runner dashboard/tests/cursor-` (43
tests, exit 0) and the remaining Cursor-runner and fixture-machine specs (77
tests, exit 0).
Learnings: on a fixture's machine, a worker that dies after the server's
close and before the test's own `stopCursorRunner` now leaves the detached
runner running; the lingering stop used to cover that window.
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

## Story obligations

### G1. No assertion pins "Reading sessions…" after a removal
Reported: slice 1 — "Removal and "first list" are covered only by the existing project-remove and first-open specs passing; no new assertion pins "Reading sessions…" after a removal."
Story clause: "A developer who adds a project while the dashboard is open"
Disposition: no user cost "A developer who adds a project while the dashboard is open": a removal lies outside the goal; the one gate rule only withholds the column until the next sessions read ends, and the project-remove journeys pass.

### G2. Example 2 does not assert the column's sessions line
Reported: slice 1 — "In Example 2 the added project's column text after the failed read is not asserted"
Story clause: "the ten stories B shows without sessions are read"
Disposition: no user cost "has Recently done read that project's done stories as it reads": the goal and example 2 promise which stories are read, which the test observes; the sessions line is unchanged product wording.

### G3. Not run under load or with repeats
Reported: slice 1 — "Not checked under load or with repeats."
Story clause: "the loaded acceptance runs with"
Disposition: excluded "the loaded acceptance runs with"

### G4. The first test reproduces the race by timing
Reported: slice 2 — "Under heavier load that read may come later and a 300 ms delay could let the first test pass on old code."
Story clause: "fails on the chip label against"
Disposition: proved by slice 2: `dashboard/tests/cursor-session-recovery.spec.ts` "Recover on the idle composer…" failed on the chip label at every delay tried, 34 of 34 runs, and the first test in 11 of 11 at 300 ms.

### G5. The reproduction reinstates the removed announce on the current file
Reported: slice 2 — "The reproduction is the reinstated `announce()` line on the current file, not the literal old file."
Story clause: "fails on the chip label against"
Disposition: proved by slice 2: `dashboard/server/launchInstruction.ts` `evaluate`, `pastedChip` branch, with the `this.announce();` that 97e0e442 removed; the literal old file no longer runs against `KeptClientScreen`.

### G6. No direct observation of the at-exit set
Reported: slice 3 — "No direct observation of Example 4."
Story clause: "closed leaves no runner stop to run at process exit"
Disposition: proved by slice 3: `dashboard/tests/support/dashboardServer.ts` `closeOwned` calls `withdrawRunnerStopAtExit()` unconditionally, the withdrawal `endAtExit` returns (`dashboard/tests/support/processGroup.ts`); the set is module-private and the plan names inspection with the passing specs as the proof.

### G7. A runner kept past close has no at-exit stop
Reported: slice 3 — "On a fixture's machine, if the worker dies after `server.close()` but before the fixture's own `stopCursorRunner`, nothing stops the runner at exit any more."
Story clause: "withdraws its at-exit runner stop on every close, for a fixture's machine as for its own"
Disposition: no user cost "has Recently done read that project's done stories as it reads": the window is the scope's own consequence in test support, outside the goal; it is reported to the developer at completion.


## Execution complete

Product advice: no backlog change. The correction delivered its four key
examples and leaves SEED-129#bounded-cursor-launch-wait and
SEED-123#dashboard-suite-passes-loaded-acceptance as they are. One decision
stays with the developer: since slice 3, a Cursor runner a test keeps past
its server's close has no at-exit stop until the test's own
`stopCursorRunner` runs; accept that window, or give the fixtures that keep
a runner their own at-exit stop.
