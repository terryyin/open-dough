# Alert the developer on Mac when a session needs human attention

## Source and authority

- **Identity:** SEED-052#mac-human-attention-alert
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#mac-human-attention-alert)
  (Goal, Scope, Key examples, and Terry's choices of 2026-09-30: a macOS
  notification with a sound fired by the dashboard server, once per entry into
  a reading, every reading other than Working, an "Alerts unavailable" note,
  no on/off control).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

While the dashboard server runs on a Mac, a session this dashboard recorded
that is not marked done raises one macOS notification with a sound when it
enters any reading other than Working (Needs input, Ready for review, Session
failed, Session stopped, Session unavailable, State unknown, State not
recognized), naming its project, its title, and what it needs. It does not
repeat while the reading stays, across page reloads, or across a server
restart that finds it there. Where the server cannot notify, the Sessions
sidebar says "Alerts unavailable" with why.

Excluded (from the story): an on/off control, click-to-open, reminders,
browser notifications, `terminal-notifier`, other operating systems, sessions
the dashboard did not start, telling an idle unused session or a finished turn
apart from a question. Considered and excluded here: a platform check (the
missing `osascript` already says "not a Mac", decision 4); combining the
notifications of one poll into one (the story's open question, left as
proposed); an alert-time record on disk (memory is per server run, decision 3).

## Direction followed

No Accepted ADR constrains it (ADR 0008 is Proposed) and no North Star topic
covers alerts. The plan adds no topic. It follows the existing boundary shape
(`docs/dashboard-ux-ui-north-star.md` names none for this): the launch
boundary owns everything about local sessions, so the watcher lives beside
`AgentLaunches` and is started and stopped by the same plugin lifecycle; the
one reading of a session's state stays `sessionShown`, which the alert reads
instead of a second table.

## PFE: what is reused

- **Sessions and their state:** `AgentLaunches.machineSessions()`
  (`server/agentLaunches.ts`) already answers every catalog project's recorded
  sessions joined with one `claude agents --json --all` listing, answering
  `unknown` when it cannot be read and running no `claude` when there are no
  records. The watcher calls it; it adds no second listing.
- **The reading:** `sessionShown` (`src/sessionShown.ts`), pure, importing only
  a type; the server already imports from `src` (`agentLaunchPlugin.ts`).
- **Lifecycle:** `localBoundaryPlugin`'s install/close pair, through which
  `installAgentLaunchMiddleware` already stops terminals and launches.
- **Environment overrides for tests:** the `DOUGH_LAUNCH_TIMEOUT_MS` /
  `DOUGH_DONE_RENAME_WAIT_MS` pattern (`server/agentLaunches.ts`,
  `server/doneMarks.ts`, `tests/support/fakeClaude.ts`).
- **Proof harness:** `installFakeClaude` and its controls
  (`claudeSessionBecomes`, `claudeListingFails`, `claudeCalls`, the `machine`
  option that outlives a server), `installFixtureExecutable`, raw-HTTP helpers
  in `tests/agentLaunchBoundary.ts`.
- **Gap:** nothing in the product notifies anything (`grep -rIn -i
  "osascript\|Notification\|notify" dashboard/src dashboard/server
  dashboard/tests` finds no match), so the notifier and its fake are new.

## Current decisions

1. **One watcher, in the launch boundary.** A `SessionAlerts` module
   (`server/sessionAlerts.ts`) owns a sequential loop (one poll settles before
   the next is scheduled, never overlapping), started by
   `installAgentLaunchMiddleware` and stopped by its returned cleanup, which
   also aborts an in-flight `osascript`. Each poll calls
   `machineSessions()`. The interval is 15 seconds (the page's own
   `checkIntervalMs`), overridable by `DOUGH_ALERT_CHECK_MS` for tests. A poll
   that throws is contained: the loop keeps going.
2. **The alert reading is the entry's reading.** `sessionShown.ts` gains one
   exported function that answers the reading's label when the developer
   should be told (session not marked done and label not "Working"), else
   nothing. Entries' `needsAttention` and cards' counts are unchanged and are
   not the alert rule (card counts exclude unknown and unavailable; alerts
   include them, by the story).
3. **Memory is the last reading per session id, per server run.** The first
   poll of a run only sets the baseline, silently. A session that appears in
   a later poll is treated as having been Working (a just-launched session
   starts working). A session alerts when its reading is one that alerts and
   differs from its last reading; a reading that does not alert (Working, or
   marked done) still becomes its last reading, which re-arms the alert. A
   changed `waitingFor` under the same label is the same reading, so no repeat.
   A restart forgets everything and baselines again, which is exactly "no alert
   on restart".
4. **The notifier is `osascript` with the text passed as arguments**, never
   spliced into script text, so a title holding quotes or backslashes cannot
   break or inject into the script:
   `osascript -e 'on run argv' -e 'display notification (item 1 of argv) with
   title (item 2 of argv) sound name "Glass"' -e 'end run' -- <message> <title>`.
   Title `<Project> · <session title>` (`PublishedSource.label` and the
   record's `request.title`, as entries read them); message the label, then
   `: <waitingFor>` when there is one. No platform check: on another system
   `osascript` is not found, which is the same "cannot alert" as a Mac that
   refuses. Raw stderr is never kept or forwarded (the boundary's rule).
5. **Availability is the latest `osascript` outcome.** At start the watcher
   runs one probe (`osascript -e 'return 0'`); every notification updates the
   outcome; the reason is one of two fixed sentences ("osascript was not found
   on this machine, so alerts need macOS", "macOS did not accept the
   notification"). The machine sessions answer carries it as `alerts`, and the
   client schema reads it (slice 2). Slice 1 contains the failure without
   recording it.
6. **The note lives in the Sessions sidebar** and is hidden with it when the
   sidebar is closed (the story says "near the Sessions list"); the banner
   Sessions button is not changed.
7. **Tests never reach a real `osascript`.** The harness always puts a fake
   `osascript` first on PATH beside the fake `claude`, so no existing or new
   test raises a real notification on a Mac; `osascript: "absent"`, `"failing"` and `"hang"` are the other
   modes. One dashboard server per machine is
   assumed: two servers watching the same records would each alert.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| `machineSessions()` answers every recorded session with `unknown` on a failed listing and runs no `claude` with no records | Read `server/agentLaunches.ts` `withStates`, `machineSessions` | Holds |
| `sessionShown` is pure and importable from the server | Read `src/sessionShown.ts` (type-only import); `agentLaunchPlugin.ts` imports `../src/agentLaunch.ts` | Holds |
| The harness can change a session's state, fail the listing, keep state across a server restart, and log calls | Read `tests/support/fakeClaude.ts` (`claudeSessionBecomes`, `claudeListingFails`, `machine`, `claudeCalls`) and `fixtures/fake-claude` (`agents` branch) | Holds |
| An env-configured interval fits the existing pattern | `DOUGH_LAUNCH_TIMEOUT_MS` in `agentLaunches.ts` and `fakeClaude.ts` | Holds |
| `osascript` with argv form notifies with a sound and survives quotes and a backslash | Ran the command of decision 4 on this Mac (macOS 26.6.2) with message `Needs input: "quoted" \ back`; sound `Glass` exists in `/System/Library/Sounds` | Exit 0 (whether the banner showed depends on Notification settings; not observable here) |
| CI never has a real `osascript` | `.github/workflows/ci.yml` jobs run on `ubuntu-24.04` | Holds; decision 7 keeps Mac developers' runs equally quiet |
| The dashboard suite runs with the named command | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-session-listing.spec.ts` in the main checkout | Exit 0, no output (quiet reporter) |
| The ad hoc story (in flight) does not change what slice 1 reads | `grep -rn launchSubject dashboard/src` in this workspace's base finds nothing; the ad hoc plan adds `launchSubject` and a request union | Slice 1 reads `request.title` on trunk. If the ad hoc story has landed by execution, read the title through its `launchSubject` instead; one line, no replan |
| Plan numbering | `origin/main` plans end at 173 | 174 |

## Proof ownership

Local gates for every slice: the focused specs named, plus
`npm run typecheck:dashboard` and `npm run lint`. Nothing broader locally; CI
runs the suite.

| Promise | Slice | Observation |
| --- | --- | --- |
| A session entering Needs input raises one notification naming project, title and what it waits for, with a sound | 1 | `session-alerts.spec.ts`, fake `osascript` calls |
| It does not repeat while the reading stays, after a page reload, or after a server restart on the same machine | 1 | same spec |
| Working then blocked again alerts again; a changed `waitingFor` alone does not | 1 | same spec |
| Ready for review, failed, stopped, unavailable, State unknown and unrecognized readings each alert once; a session marked done never alerts; sessions already in a reading when the server starts do not | 1 | same spec |
| A title with quotes and a backslash notifies unchanged | 1 | same spec (argv equals the text) |
| Closing the server stops the watcher and any `osascript` it started | 1 | same spec, on the pattern of `agent-terminal-lifetime.spec.ts` |
| Existing behavior and cards' attention counts are unchanged | 1 | `agent-launch-attention.spec.ts`, `agent-launch-session-listing.spec.ts` unedited and green |
| With no `osascript`, or one that fails, the Sessions sidebar says "Alerts unavailable" with the fixed reason; with a working one it says nothing; it recovers when a later notification works | 2 | `session-alerts-unavailable.spec.ts` |
| The delivered behavior is documented once | 1, 2 | string check under each slice |

## Slices

### 1. A session that starts needing the developer raises one macOS notification
Type: Behavior
Status: done
Proof: `dashboard/tests/session-alerts.spec.ts` with a dashboard server whose
harness has `DOUGH_ALERT_CHECK_MS` small, the fake `osascript`, and sessions
launched through raw HTTP (`agentLaunchBoundary.ts`); no page is needed except
for the reload example. "Nothing more" is asserted only after the fake
`claude` has logged at least two further `agents` listings since the change
(a deterministic wait on `claudeCalls()`, never a sleep), and "an alert" is
awaited by polling the fake's recorded notifications.
- A working session becomes `blocked` with `waitingFor` "Which database?" →
  one `osascript` call whose argv carries the title
  "Open Dough · <session title>" and message "Needs input: Which database?",
  and the sound `Glass`.
- It stays blocked for several listings and the page reloads → still one call.
- Working then blocked again → a second call; `waitingFor` changing while
  blocked → no new call.
- `done-live` → "Ready for review"; `failed`; `stopped`; `forgotten` →
  "Session unavailable"; `claudeListingFails(true)` on a working session →
  "State unknown"; each one call.
- A session marked done, then stopped (its process ends) → no call.
- A session already blocked before the server starts, then the server started on
  the same machine (`machine` option) → no call; it later leaving and
  re-entering → a call.
- A launch after the server started → no call while it works; blocked → a call.
- A title containing `"` and `\` → the argv title equals it exactly.
- Server closed while the fake `osascript` holds a notification open (a `hang`
  mode reporting its pid and the signal that ended it, as the fake `claude`'s
  does for a held launch) → that `osascript` is ended, no further `agents`
  listings run, and no process is left
  (`authenticated-read-subprocess-lifecycle.spec.ts` pattern, `processAlive`).

Behavior: recorded sessions, watcher running → a session's reading changes to
one that needs the developer → macOS notified once, without the page. Adds
`server/sessionAlerts.ts` (loop, memory of decision 3, the notifier of
decision 4 contained on failure), the exported alert reading in
`src/sessionShown.ts`, the wiring in `agentLaunchPlugin.ts`, the fake
`fixtures/fake-osascript` and its always-on installation and controls in
`tests/support/fakeClaude.ts` (the file's header updated), and the
`DOUGH_ALERT_CHECK_MS` override. Documents the alert in
`dashboard/AGENT-LAUNCH.md`.

Accepted proof: `npx playwright test --config dashboard/playwright.config.ts
dashboard/tests/session-alerts.spec.ts dashboard/tests/agent-launch-attention.spec.ts
dashboard/tests/agent-launch-session-listing.spec.ts
dashboard/tests/agent-terminal-lifetime.spec.ts
dashboard/tests/agent-launch-boundary.spec.ts
dashboard/tests/agent-launch-done.spec.ts` exit 0, with `npm run typecheck:dashboard`
and `npm run lint`. Learnings: the harness defaults `DOUGH_ALERT_CHECK_MS` to
one hour so existing specs' exact `claudeCalls()` counts hold (the watcher polls
once at start); "no `agents` listings after close" is not asserted directly
(absence cannot be awaited); the notification message is the label plus
`waitingFor` only, so State unknown carries no note.

### 2. The Sessions sidebar says when alerts cannot be raised
Type: Behavior
Status: done
Proof: `dashboard/tests/session-alerts-unavailable.spec.ts` on the page, with
the fake `osascript` in each mode.
- Fake `osascript` working → the open sidebar has no alerts note.
- `osascript` absent from PATH → the sidebar shows "Alerts unavailable" with
  "osascript was not found on this machine, so alerts need macOS", and every
  other sidebar and card behavior is as before.
- `osascript` failing at start → "Alerts unavailable" with "macOS did not accept
  the notification"; then working again and a session blocks → the note goes
  after the next read of the machine's sessions.
- The sidebar closed → the note is not on the page; the Sessions button is
  unchanged.

Behavior: watcher's latest `osascript` outcome unavailable → the sidebar tells
the developer once it is open. Adds the start probe and recorded outcome to
`SessionAlerts`, the `alerts` field of the machine sessions answer
(`server/agentLaunchPlugin.ts`) and its schema (`src/agentLaunchClient.ts`,
`src/agentLaunches.ts`), the note in `src/SessionSidebar.tsx`, the `absent` and
`failing` `osascript` modes in the harness, and the sidebar and alert
paragraph in `dashboard/AGENT-LAUNCH.md` and the sidebar comment.

Accepted proof: `npx playwright test --config dashboard/playwright.config.ts
dashboard/tests/session-alerts-unavailable.spec.ts dashboard/tests/session-alerts.spec.ts
dashboard/tests/agent-launch-attention.spec.ts dashboard/tests/agent-launch-session-listing.spec.ts
dashboard/tests/session-sidebar.spec.ts dashboard/tests/session-sidebar-reading.spec.ts
dashboard/tests/agent-terminal-lifetime.spec.ts dashboard/tests/agent-launch-boundary.spec.ts
dashboard/tests/agent-launch-done.spec.ts` exit 0, with `npm run typecheck:dashboard` and
`npm run lint`. Learnings: a harness that removes a binary from PATH must also drop the
inherited system PATH, or a Mac reaches the real one (fixed in `fakeClaude.ts` for
`osascript: "absent"`); the page's own poll clearing the note is exercised only through
a reload.
