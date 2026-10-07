# A terminal the developer closed while its session starts stays closed

**Identity:** SEED-112#closed-terminal-stays-closed
**Source:** [refined story](../../seeds/SEED-112-terminal-stays-closed-during-startup.md#closed-terminal-stays-closed).
**Prepared:** 2026-10-07. Planning only, in the story's preparation workspace
on `claude/a-terminal-the-developer-closed-while-its-sessio`.

## Goal and boundaries

Start session presents its session's terminal once the launch finishes, as
today, unless the developer has already opened that session's terminal
themselves on this page. A terminal the developer opened and closed during
the startup stays closed when the launch finishes; the "Ad hoc session
started" announcement still appears, the keyboard stays where Close returned
it, and Open terminal still opens the launched session afterwards. A terminal
the developer opened and left open, or reopened, stays as it is.

Include the story's four key examples and its boundary: only Start session
presents a terminal on launch, so a story's Start on a card changes nothing.

Excluded, as the story defers it: a different session's terminal the
developer opened during the startup. Today the finishing launch replaces it;
this plan does not change that, and the rule below leaves it as it is because
that session is not the launched one. Considered and excluded here: a fake
`claude` scenario that holds the launched outcome after listing the session.
The server's own write order already produces the window (below), and a
page-side rewrite of the read reproduces it without a new fixture branch.

## Base this plan is written against

Trunk at `7fa4e4a6486fa58ac3d99ed5b8d5740d3d8d4f77`, fetched 2026-10-07. No
queued or taken plan touches `pageSidePanel.ts`, `pageSessions.ts`, or
`StartSession.tsx`.

## Existing solutions and current decisions

PFE over the dashboard page found the owners this plan reuses; no new module
or state is added.

- **The window is real and lives on the server.** `launchRun`
  (`dashboard/server/launchRun.ts:149-151`) keeps the session's record, then
  returns; `settleAttempt` (`launchAttemptSettlement.ts:63-66`) notes the
  attempt's `launched` outcome in a second write afterwards. A read between
  the two lists the record, with its entry offering Open terminal, while the
  attempt is still starting. CI run 37383633842's trace saw exactly this: the
  Cursor test opened the entry's terminal, closed it, and the next read's
  launched outcome reopened it about 80 ms later.
- **One place presents a launch's terminal.** `useAskedLaunches`
  (`dashboard/src/askedLaunches.ts:53-71`) calls the asking action's
  `onLaunched` on the first read whose attempt outcome is `launched` and
  whose records list the session; `StartSession.tsx:108-121` is the only
  `onLaunched` that opens a terminal, through `PageSessions.openTerminal`.
  `CardLaunches.tsx:125-128` only moves the keyboard. Decision: the rule is
  applied where the presentation is asked, not in `useAskedLaunches`, which
  stays host- and action-neutral.
- **The side panel owns the developer's panel choices.** `usePageSidePanel`
  (`dashboard/src/pageSidePanel.ts`) owns selection, close, and keyboard
  return; every developer-initiated terminal open reaches its `openTerminal`
  through `sessions.openSession` (`LaunchSession.tsx:63-70` Open terminal,
  `PageFrame.tsx:88-98` sidebar entries). `PageSessions.openTerminal` has one
  consumer: Start session's presentation. Decision: the panel remembers the
  session keys whose terminal the developer opened themselves, in a ref that
  `openTerminal` fills, and `PageSessions` renames `openTerminal` to
  `presentTerminal`: it opens the terminal unless the developer already
  opened that session's terminal on this page, in which case it changes
  nothing and moves no keyboard. One operation gains the rule; no new state
  type, record field, or server change.
- **Why "opened by the developer", not "closed".** The developer's own open
  covers every example: closed (example 1) and reopened and left open
  (example 4) both began with the developer opening it, and a presentation
  after their own open adds nothing they did not already decide. A close
  memory would need resetting on reopen and a second rule for an open that
  is still open. The deferred case (another session's terminal) is untouched:
  its key is not the launched session's.
- **Keyboard.** When the presentation is skipped, nothing moves: the keyboard
  stays where Close returned it (the entry's Open terminal, per
  `pageSidePanel.ts:126-140`) or wherever the developer put it. When it is
  not skipped, today's `takesKeyboard` rule stands.
- **Reproduction seam.** `page.route("**/__agent-launch")` on the GET of the
  machine's sessions (as `agent-launch-options-exclusive.spec.ts:185-188`
  already does) rewrites the JSON while the test withholds: every attempt
  loses `outcome` and `settledAt`, which `attemptObservationSchema` declares
  optional (`launchOutcome.ts:140-141`) and `useAskedLaunches` reads as still
  starting (`askedLaunches.ts:58`). The record stays listed, so the entry
  offers Open terminal while Start session still says "Starting a session…".
  Releasing the rewrite lets the next read present. Decision: the helper
  lives in the spec that uses it.
- **Proof entry point.** `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts`
  already proves Start session's presentation, keyboard, and Close on the
  fake `claude` (`./fixtures/fake-claude`, `launched` scenario) and asserts
  `claudeAttaches()`. Decision: the new cases live there; the Cursor spec
  keeps waiting for the start, as it does today.
- **Documentation home.** `dashboard/AGENT-LAUNCH.md:204-206` says a settled
  launch presents its session in the terminal for Start session and moves the
  keyboard only while it rests where handoff left it. Decision: that sentence
  gains the exception; `StartSession.tsx`'s header comment says the same.

No North Star topic is needed. ADR 0008 keeps launches and terminals as local
operational state the page derives presentation from; ADR 0002's high
cohesion is why the panel's one presentation operation gains the rule rather
than a second path. No Accepted decision conflicts.

## Decisive premises and observations

Observations are readings in this workspace at the base above unless noted.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| The record is readable before the attempt's launched outcome. | The reproduction and the rule's trigger. | `launchRun.ts:149` `keepRecord` then return; `launchAttemptOwner.ts:227` `void settleAttempt(...)`; `launchAttemptSettlement.ts:55-66` awaits the run, then notes `outcome`. Two writes, read between them possible. CI run 37383633842 trace, as the seed records. |
| The page presents on the first read seeing both the launched outcome and the record, through `onLaunched`. | The rule's placement. | `askedLaunches.ts:53-71`: `outcome.kind !== "launched"` → problem; record not found → continue; else `page.onLaunched(record)`. |
| Only Start session's `onLaunched` opens a terminal. | Boundary: cards unchanged. | `grep onLaunched\|OnLaunched dashboard/src`: `StartSession.tsx:108-121` calls `openTerminal`; `CardLaunches.tsx:125-128` calls `setLaunchedHere` only. |
| Every developer-initiated terminal open passes through `usePageSidePanel.openTerminal`. | The remembered set is complete. | `pageSidePanel.ts:188-193` `sessions.openSession` → `openTerminal`; consumers `LaunchSession.tsx:66` and `PageFrame.tsx:96` (`panel.openSession`). `grep openTerminal dashboard/src`: `pageSidePanel.ts`, `pageSessions.ts`, `StartSession.tsx` only. |
| Opening the same session again keeps the current panel. | Example 4 (no detach). | `pageSidePanel.ts:93-101`: same `sessionKey` → `current`. |
| A missing `outcome` on an attempt is valid and reads as starting. | The route-rewrite seam. | `launchOutcome.ts:140-141` `.optional()`; `askedLaunches.ts:58` `if (outcome === undefined) continue;`; `StartSession.tsx` `attempt?.kind === "starting"` shows the progress text. |
| The entry offers Open terminal for a listed ad hoc session the attempt has not settled. | Example 1's first step. | Access derives from the record and host operations (`sessionAccess`, `LaunchSession.tsx:60-72`), not from attempts; `agent-launch-ad-hoc-terminal.spec.ts:97-99` clicks it after Close on the same record. |
| The page reads again without developer action after the rewrite is released. | Example 1's "launch finishes" step. | `agentLaunches.ts:180` schedules a read every `checkIntervalMs` (15 s, `revisionCheckSchedule.ts:29`); the Cursor spec waits up to 20 s for `adHocStarted`. |
| The route seam reproduces the reopen before the change. | Slice 1 starts red. | Settled by the readings above; the slice's first step runs the new case against unchanged code and expects the panel to reopen. If it does not reopen, stop and reassess the mechanism before changing the panel. |
| Dependencies are not installed in this workspace. | Every proof run. | `ls node_modules/.bin/playwright`: no such file; `NODE_ENV=production` in this session. Execution runs `env -u NODE_ENV npm ci --ignore-scripts --offline` first, as plans 267 and 268 recorded. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Closed during startup stays closed; announcement appears; keyboard unmoved; Open terminal offered (example 1) | 1 | `agent-launch-ad-hoc-terminal.spec.ts` new case: withhold outcomes, Start, click the entry's Open terminal, `panel` count 1, Close, `panel` count 0, Open terminal focused; release; `adHocStarted` visible (20 s); `panel` count 0 held for one more read (`expect(panel).toHaveCount(0)` after `adHocStarted`, plus a `toHaveCount(0)` poll of ~2 s); Open terminal still focused; `claudeAttaches()` length 1 |
| Open terminal afterwards opens the launched session (example 2) | 1 | Same case continues: click Open terminal, `rows` contain `attached <id>`, typed text echoed, `claudeAttaches()` length 2 |
| Untouched start presents as today (example 3) | 1 | Existing two cases in the same spec green |
| Reopened and left open stays open, no detach (example 4) | 1 | Second new case: withhold, open, Close, open again; release; `adHocStarted` visible; `panel` count 1, same `rows` content, `claudeAttaches()` length 2 after the read |
| Story Start on a card unchanged | 1 | `agent-launch-card.spec.ts` and `agent-launch-card-done.spec.ts` green; no code there changes |
| Sidebar and entry opens still show the terminal | 1 | `agent-launch-ad-hoc-sessions.spec.ts`, `session-sidebar-navigation-cases.spec.ts`, `agent-terminal-done.spec.ts` green |
| Docs describe the exception | 1 | `AGENT-LAUNCH.md` sentence read |

## Ordered slices

### 1. A launch presents its terminal only while the developer has not opened it themselves
Type: Behavior
Status: done
Proof: `agent-launch-ad-hoc-terminal.spec.ts` with the two new cases, run red against unchanged code first, then green; `agent-launch-ad-hoc-sessions.spec.ts`, `session-sidebar-navigation-cases.spec.ts`, `agent-terminal-done.spec.ts`, `agent-launch-card.spec.ts`, `agent-launch-card-done.spec.ts` green; lint and `npm run typecheck:dashboard`.

Behavior: the developer starts an ad hoc session, the record is listed while
the attempt is still starting, they open the entry's terminal and close it →
the launch finishes → the panel stays closed, "Ad hoc session started" is
announced, the keyboard stays on Open terminal, and Open terminal then opens
the launched session. The same start with the terminal reopened and left open
keeps that terminal. An untouched start presents its terminal as today.

Includes: the withholding route helper in the spec; the remembered set of
developer-opened session keys in `usePageSidePanel` and the `presentTerminal`
rule replacing `PageSessions.openTerminal`; `StartSession.tsx` calling it and
its header comment; the `AGENT-LAUNCH.md` sentence.

## Current decisions

- The slice runs its named specs, lint, and the dashboard typecheck before
  its commit; the whole suite runs through CI after publication.
- The rule keys on the session the developer opened, never on closes, and
  never touches a panel showing another session.
- `useAskedLaunches` is not changed.

## Accepted proof (slice 1)

- Red first: the example 1 case failed on unchanged code at
  `expect(panel).toHaveCount(0)` after "Ad hoc session started" (received 1);
  rechecked by forcing `presentTerminal` to always open.
- `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts --repeat-each=4`:
  16 passed. Cases "a terminal the developer closed while its session started
  stays closed…" (examples 1 and 2) and "a terminal the developer reopened
  while its session started stays open…" (example 4); the two existing cases
  (example 3). Setup: `withholdLaunchOutcomes` and `openWhileStarting` in the
  same spec.
- `agent-launch-ad-hoc-sessions`, `session-sidebar-navigation-cases`,
  `agent-terminal-done`, `agent-launch-card`, `agent-launch-card-done`,
  `agent-launch-card-sessions`, `agent-launch-open-session`,
  `agent-launch-card-open-session` specs green; `npm run typecheck:dashboard`
  and `npm run format` clean.

## Learnings

- The proof table's exact `claudeAttaches()` counts were flaky (1 in 12): the
  server may keep an attach across Close and reuse it on reopen. The cases
  assert the count is unchanged across the release and every attach names
  the launched session instead.
- No separate hold poll after the announcement: the announcement and any
  presentation come from the same `onLaunched` call, which `useAskedLaunches`
  makes once, so the panel check right after the announcement observes it.
- The withholding route's `route.fetch` must restate
  `sec-fetch-site: same-origin`, or the server answers 403.

## Execution complete

Product advice: no change. The story's deferred case — a different session's
terminal open when the launch finishes is replaced — stays deferred; no
evidence from this execution asks to revisit it.
