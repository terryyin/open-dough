# Find recent dashboard-launched sessions after leaving the story

## Source and authority

- **Identity:** SEED-052#revisit-dashboard-sessions.
- **Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#revisit-dashboard-sessions),
  refined on 2026-09-29. Terry accepted the recommended retention (a local
  file managed by Open Dough outside every repository, 30 days), Started
  settlement, per-project placement, and unavailable-session answers. He left
  open what `claude attach` does for a finished session.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.
- **Preparation workspace:** `.worktrees/revisit-dashboard-sessions` (branch
  `claude/refine-revisit-dashboard-sessions`). This preparation created it at
  `7c041ab3` and announced itself as agent Rina-chan at `3be65c73`.

## Execution

- **Mode:** Story Branch Mode. Execution checkout
  `.worktrees/revisit-dashboard-sessions`, branch
  `claude/revisit-dashboard-sessions`, agent Rina-chan. Taken on `main` at
  `59fb10cd` (starting revision `d995aef3`). Increments publish to
  `origin/claude/revisit-dashboard-sessions`.

## Outcome and boundaries

A developer who started work from the dashboard can find the conversation
again after navigating away, reloading, restarting the dashboard, or after the
story leaves the Backlog. A Recent sessions section for the selected project
names each session's story, workflow, launch time, session id, and Claude Code
state, and gives the command that opens it.

Key examples (from the story):

1. Start execution, switch project and back, or reload → Recent sessions lists
   the launch with title, identity, "Execution", time, session id, a working
   state, and `claude attach <id>`.
2. Restart the dashboard server while the session runs and the story is still
   in the Backlog → the entry and the card's Execution started both remain.
3. The story is taken, then completed out of every list → the entry remains.
4. Two launches of one story → two entries, told apart by workflow, time, and
   session id.
5. Refinement launched on a card already Preparing → no Started on the card,
   but the session is listed in Recent sessions.
6. An execution session exits before its Take → the Started ends, Start
   execution is offered again, and the entry shows finished or stopped.
7. Claude Code no longer lists a recorded session → the entry says it is
   unavailable, with no open command. The story's published state is unchanged.
8. A launch recorded more than 30 days ago is not listed.

Preserved promises: launch records are local evidence and never change a
story fact read from origin. Only dashboard-launched sessions are listed.
Failed and uncertain launches keep their current answers. The launch boundary
keeps its same-origin refusals.

Excluded (the story's deferrals): resuming an unavailable session, a list
covering all projects, configurable retention, embedded interaction (story 3),
Recently done links, other hosts, and attention or completion indicators.
Also excluded: discovering sessions this dashboard did not record, and
migrating records from the in-memory store, which a restart already loses.

## Existing solutions (PFE)

- **Launch records already exist, kept in memory only.** `AgentLaunches`
  (`dashboard/server/agentLaunches.ts:28-76`) keeps one `LaunchRecord` list
  per project and answers it through `GET /__agent-launch?source=`
  (`agentLaunchPlugin.ts:136-141`). Slice 1 replaces that map with a file store
  behind the same class. The record shape (`src/agentLaunch.ts:104-111`), the
  endpoint, and the page's reader (`src/agentLaunches.ts:72-95`) stay.
- **Claude Code's own listing is already read.** `claudeCode.ts:84-110` parses
  `claude agents --json` with a loose zod schema to confirm a launch. Slice 3
  adds `--all`, `state`, and `status` to the same parser rather than adding a
  second host reader.
- **The Started rule already lives in one place.** `launchAwaitsPublication`
  (`src/agentLaunch.ts:137-150`) is applied once in `WorkStages.tsx:172-174`
  before the Backlog's `CardLaunches`. Slice 4 adds the session's running state
  to that one filter.
- **The attach command and copy button already exist** in `LaunchStarted.tsx`.
  Slice 2 moves that part into a component that both Started and a Recent
  sessions entry use, so the copy behavior and its wording have one home.
- **Machine-local paths already follow `HOME`.** `projectFolders.ts` resolves
  `~/git/<id>` through `homedir()`, and the test harness sets a temporary
  `HOME` (`tests/support/fakeClaude.ts:73-90`). The store resolves its file the
  same way, so every test server gets its own store.
- **A steady pace already exists.** `checkIntervalMs` (15 s,
  `src/revisionCheckSchedule.ts:28`) and page visibility
  (`src/pageVisibility.ts`) pace origin checks. Slice 3 re-reads launch
  records at that pace while the page is visible, adding no second clock.

The [project visibility requirements](../../../docs/project-visibility-requirements.md#limited-machine-local-state)
allow machine-local state that need not be committed and leave its storage
open. ADR 0008 (Proposed) keeps local evidence separate from published facts,
and this plan follows that. The storage choice is feature-local, so no North
Star topic or ADR change is warranted. The dashboard UX North Star gets rows
for the new wording (slices 2–4), as its launch wording already has.

## Current decisions

- **Store location:** `~/.open-dough/dashboard/agent-launches.json`, one JSON
  document keyed by catalog project id and holding each project's
  `LaunchRecord`s. It sits outside every repository and is resolved through
  `homedir()`.
- **One store for every server on this machine.** Each read and write reads
  the file afresh, so a dev and a preview server both see every launch. A
  write re-reads, appends, drops records older than 30 days, and replaces the
  file atomically (temporary file plus rename). Two launches at the same
  instant can still race. That is accepted and reported, not locked against.
- **Missing or unreadable store:** a missing file means no records. A file
  that does not parse means no records, and the server does not overwrite it
  until the next launch. That launch starts a new document and moves the
  unreadable file aside as `agent-launches.json.unreadable`, so nothing is
  silently lost.
- **Session state is read, never stored.** Each records answer joins Claude
  Code's current listing by `sessionId`. One of three results goes with each
  record: `listed` with `state` and whether its process runs (`status`
  present), `unlisted`, or `unknown` when the listing could not be read. With
  no kept records, the server runs no `claude` process.
- **Wording** (for the North Star and the specs; adjust only for consistency
  with existing rows). The section heading is "Recent sessions". Entry states
  are "Working" (running, busy), "Idle" (running, idle), "Finished" (not
  running, done), "Stopped", "Session unavailable", and "State unknown". The
  last carries the note "Claude Code's session list could not be read".
- **`claude attach` offering:** offered for every session Claude Code still
  lists, unless slice 3's manual observation shows it does not open a finished
  session. In that case it is offered only while the session runs, and the
  story's promise to offer it "only where it opens" holds either way.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| `claude agents --json --all` lists finished background sessions with `state` and `status`, and `status` appears only while the process runs. | `claude agents --json --all`, summarized with Python on 2026-09-29 (read-only). | 459 sessions back to 2026-08-29. `(status, state)` counts: `(None, done)` 449, `(idle, done)` 4, `(None, stopped)` 3, `(busy, working)` 3. Keys: `cwd id kind name pid sessionId startedAt state status`. |
| Without `--all`, finished sessions whose process has exited are omitted. | `claude agents --json` the same day. | 7 entries, all with `status` present. So `--all` is required for Finished and Stopped. |
| The fake `claude` does not model this. | Read `dashboard/tests/fixtures/fake-claude`. | It ignores `--all`, writes `status: "running"` and `kind: "bg"`, and has no way to end or forget a session. Slice 3 changes it to the observed shape and adds controls. |
| The harness removes a server's `HOME` and fake-`claude` state on close, so it cannot restart on the same machine state. | Read `tests/support/dashboardServer.ts` (`closeOwned`, `rmSync(tempRoot)`) and `fakeClaude.ts:69-90`. | Confirmed. Slice 1 adds a caller-owned machine directory that holds `HOME` and the fake's state and outlives the server. |
| Page load currently runs no `claude` process, and several specs assert exact `claudeCalls()`. | `grep -n "claudeCalls()" dashboard/tests/*.ts`. | `agent-launch-card.spec.ts:115,167,212,238`, `agent-launch-card-problems.spec.ts:52,76,108`, `agent-launch-boundary.spec.ts:74,244`, and length checks in `agent-launch-refusal.spec.ts` and the boundary spec. The no-records rule above keeps the `[]` assertions valid. Assertions made after a launch compare the launch calls and ignore listing calls, which slice 3 introduces. |
| The page reads launch records only when a project is selected. | Read `src/agentLaunches.ts:77-95`. | Confirmed: a single effect on `source.id`. State changes need slice 3's re-read. |
| Started is filtered once, before the Backlog's cards. | Read `WorkStages.tsx:172-181` and `CardLaunches.tsx:28-31`. | Confirmed. No other caller of `launchAwaitsPublication`. |
| What `claude attach` does for a listed session that has finished. | Not observed. Terry left it open, and attaching is interactive and may restart the session. | Left to slice 3's manual observation (see Current decisions). |

## Slices

### 1. Launch records survive a dashboard restart and age out after 30 days
Type: Behavior
Status: done
Proof: boundary spec restarts a server on the same machine state; retention spec seeds aged records.

Behavior: a confirmed launch has been recorded → the dashboard server
restarts on the same machine → `GET /__agent-launch?source=open-dough` still
answers that record, and the card still shows Execution started once reloaded
(example 2). A record launched more than 30 days before the read is not
answered (example 8). A second server running on the same machine answers
records the first one launched.

Replace the in-memory map in `AgentLaunches` with the file store under Current
decisions. Keep `recordsOf` and `launch` as the plugin's only entry points.
Add a caller-owned `machine` option to `startDashboardServer` that places
`HOME` and the fake's state inside it and leaves them in place on close.
Update the module comments that say records are kept only in memory
(`server/agentLaunches.ts`, `src/agentLaunch.ts`, `src/agentLaunches.ts`),
plus `AGENT-LAUNCH.md`'s final paragraph and the matching North Star
sentence.

Proof: in `agent-launch-records.spec.ts`, launch, close, start a new server
on the same machine directory, and expect the same record. Seed the store in
a fresh machine directory with records 31 and 29 days old, and expect only
the 29-day one. Expect the unreadable-file case to answer no records and keep
the file. The existing boundary, refusal, card, and settlement specs stay
green.

Accepted: `dashboard/server/launchRecordStore.ts` holds the store.
`agent-launch-records.spec.ts` ("launch records kept on this machine") answers
a dev launch from a preview server and from a restarted dev server, drops a
31-day record and keeps a 29-day one, and answers none from an unreadable file
until a launch moves it to `.unreadable`. The five launch specs plus it pass
(76 before the refactor split them), and typecheck is clean. Learnings: a
second unreadable move overwrites an earlier `.unreadable` file, and a store
write failure after a started session answers 500. Both are untested edges
left as they are.

### 2. Recent sessions lists the project's kept launches, independent of story cards
Type: Behavior
Status: done
Proof: page spec over the settlement journey; existing Started specs stay green.

Behavior: the selected project has kept launches → the developer views the
project, including after a reload or project switch → a "Recent sessions"
section lists one entry per launch, newest first. Each entry shows the story
title, identity, workflow, launch time, session id, the local-evidence
marking, and a copyable `claude attach <id>`. The entry stays when the story
is taken and then completed out of every list (examples 1, 3). Two launches of
one story are two entries (example 4). A refinement launched on a card
already Preparing shows no Started but is listed (example 5). Another
project's launches are not listed.

Render the section from `ProjectLaunches.records`, the same records Started
reads, without the Backlog filter. Move the attach command and its copy
button out of `LaunchStarted` into a shared component. Add the section to
`AGENT-LAUNCH.md`, `dashboard/README.md`'s surface list, and a North Star row.

Proof: a new `agent-launch-recent-sessions.spec.ts` drives the existing
settlement journey (`tests/launchJourney.ts`, `publishSettlementJourney`):
launch Story B twice (refinement, then execution), launch Story C, advance
origin to preparing, taken, and completed. At each step, assert the section's
entries and order through accessible names. Also launch refinement on the
already-Preparing card and assert it is listed with no Started. Run the new
spec with `agent-launch-card.spec.ts` and `agent-launch-settlement.spec.ts`.

Accepted: `RecentSessions.tsx` renders a "Recent sessions" region below the
work stages from the same records Started reads, newest first; each entry is
an article named "<Workflow> session for <title>". `LaunchSession.tsx` holds
the session id, `claude attach`, and copy for both Started and an entry.
`agent-launch-recent-sessions.spec.ts` walks the settlement journey through
Preparing, Taken, and Completed with reloads and a Doughnut switch; it and the
card, settlement, and records specs pass (10), with typecheck clean. The
Started paragraph's `claude agents` advice for a refinement on a Preparing
card moved to Recent sessions here, ahead of slice 4. `launchRetentionDays`
in `src/agentLaunch.ts` is the one home of the 30 days. Learnings: region
names must avoid "started", which the settlement spec's Started locator
matches; page-wide "story is gone" checks need scoping to the stages; the
README and North Star are at the 250-line limit.

### 3. Each entry shows Claude Code's state, and a session Claude Code no longer lists is unavailable
Type: Behavior
Status: done
Proof: boundary spec for the joined state; Recent sessions spec for labels and pacing; one manual `claude attach` observation.

Behavior: a kept launch's session is working, idle, finished, stopped, or no
longer listed, or the listing fails → the page shows the project or re-reads
at the steady pace while visible → the entry shows "Working", "Idle",
"Finished", "Stopped", "Session unavailable" with no attach command (example
7), or "State unknown" with its note. A state change appears within one
pace without a reload. No story fact changes (example 7).

Extend `claudeCode.ts`'s listing parser with `--all`, `state`, and `status`,
and export one listing read that both launch confirmation and the records
answer use. Confirmation keeps matching by short id. Join the listing by
`sessionId` into the records answer, adding the session-state field to the
shared schema in `agentLaunch.ts`. Run the listing only when records exist.
Re-read records at `checkIntervalMs` while the page is visible, keeping the
existing late-answer merge in `replaced`. Change the fake `claude` to the
observed shape: `status` busy or idle while running, and `--all` needed for
exited sessions. Add controls to end a session (state done or stopped, no
status), forget it, and fail the listing. Update the post-launch
`claudeCalls()` assertions to compare launch calls only.

Start this slice with a probe. Ask Terry to run `claude attach <id>` in a
terminal on a finished session Claude Code still lists, then record here
whether it opens. If it does not, offer the command only while the session
runs, and assert that in the spec.

Proof: `agent-launch-boundary.spec.ts` checks that the records answer carries
`listed` with state and running, `unlisted`, and `unknown` from fake controls,
and that no `claude` runs when there are no records.
`agent-launch-recent-sessions.spec.ts` checks each label and the attach
command's presence, and that ending a session updates its entry without a
reload. Run the boundary, refusal, card, card-problems, settlement, and
recent-sessions specs, since the listing change reaches each one's
`claudeCalls()` assertions.

Accepted: Terry ran `claude attach` on a finished session Claude Code still
lists (2026-09-29) and it opened, so `attachOpens` in `src/agentLaunch.ts`
keeps the current rule: attach for every listed session and for State
unknown, none for Session unavailable. `claudeSessions` in `claudeCode.ts` is
the one listing read; `recordsOf` joins it as `LaunchWithState` and runs no
`claude` without records. `agent-launch-session-listing.spec.ts` observes
listed, unlisted, and unknown answers and no `claude` without records.
`agent-launch-recent-session-states.spec.ts` observes each label, the attach
table, and one records read exactly at `checkIntervalMs` without a reload.
The nine launch specs pass (81), 43 pace-sensitive specs pass, and typecheck
is clean. Mapping choices: a listed session with a status is Working or Idle
by that status; with no status it is Finished when done, otherwise Stopped.
Gaps: no spec asserts the hidden-page pause, and a missing project folder
shows State unknown.

### 4. A card's Started ends once its session no longer runs
Type: Behavior
Status: planned
Proof: settlement spec extended with ended, forgotten, and unknown sessions.

Behavior: a Backlog card shows Execution started → its session exits before
the Take (finished or stopped), or Claude Code no longer lists it → the card
offers Start execution again, with its note, and Recent sessions keeps the
entry with its state (example 6). While the listing is unknown, Started
stays. Today's origin rules still end Started as before.

Add the session's running state to the one Started filter in `WorkStages.tsx`
through `launchAwaitsPublication` or its caller. Update the Started paragraph
in `AGENT-LAUNCH.md` and the North Star row, removing the advice to check
`claude agents` for a refinement launched on a Preparing card, which Recent
sessions now covers.

Proof: extend `agent-launch-settlement.spec.ts`. End one launched session,
forget another, and fail the listing for a third. Assert the card actions and
that the Recent sessions entries remain. The existing settlement test stays
green.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Records survive a restart; card Started remains (example 2) | 1: restart on same machine directory, boundary answer; card derives from the same answer (existing reload spec) |
| Records older than 30 days are not listed (example 8) | 1: seeded aged records |
| Records live outside every repository, one store per machine | 1: store under the server's `HOME`; two servers share it |
| Unreadable store loses nothing silently | 1: unreadable-file case |
| Recent sessions lists title, identity, workflow, time, session id, attach (example 1) | 2: recent-sessions spec |
| Entry stays after the story leaves every list (example 3) | 2: settlement journey through completed |
| Multiple sessions per story are distinguishable (example 4) | 2: two launches of Story B |
| Refinement on a Preparing card is reachable (example 5) | 2: launch on the Preparing card |
| Only this project's dashboard launches are listed | 2: other project's launch absent; nothing but recorded launches listed |
| Claude Code's state per entry, refreshed at pace | 3: labels and live update |
| Unlisted session is unavailable, no attach, story unchanged (example 7) | 3: forgotten session |
| Attach offered only where it opens a session | 3: manual attach observation and resulting assertion |
| Started ends when its session no longer runs (example 6) | 4: settlement spec |
| Launch records never change story facts | 2–4: every spec asserts story placement from origin alone |

## Delivery checks

Run each slice's focused Playwright specs through
`npm run test:dashboard -- <spec files>` and `npm run typecheck:dashboard`.
The whole dashboard suite is not a local gate: slice 3's listing change
reaches the launch specs it names, and no other spec runs `claude`. Hosted CI
runs the rest. No payload or skill file changes, so payload checks are not
needed. Use independent post-change refactoring and ordinary managed delivery.
Keep dashboard wording consistent with the UX North Star.

## Concern review

Cumulative design: one file store replaces the in-memory map behind the same
boundary. Claude Code's listing is read by one parser and joined per record.
Both Started and Recent sessions read the same records, and Started is one
filter over them. Each slice adds one outcome with its own proof loop:
persistence, the list, state, and settlement. Slice 3 is the largest: the
listing parser, fake, pacing, and labels together make one observable outcome
and split no further without an unobservable intermediate. Its only open
premise, the attach observation, changes one condition and its assertion. No
blocking slice-specific concern was identified in this review.
