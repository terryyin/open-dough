# Start an ad hoc session in a project from the dashboard

## Source and authority

- **Identity:** SEED-052#start-ad-hoc-project-session
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#start-ad-hoc-project-session)
  (Goal, Scope, Key examples, UI, and Terry's design record of 2026-09-30:
  the project actions row, an optional prompt with the terminal opening at
  once, and "Ad hoc" plus the prompt's opening as the name).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

A developer looking at a project presses "Start session" on the project
actions row, optionally types what to talk about, presses Start, and is in
Claude Code's terminal for a new background session in that project's folder,
with no story or skill. The session stays findable in Recent sessions and the
Sessions sidebar; no card lists it and no story fact changes.

Excluded (from the story): choosing a model (SEED-052#choose-session-model),
a skill or tool, attaching the session to a story later, renaming it,
starting one from a card, any session the dashboard did not start.
Considered and excluded here: a keyboard shortcut for Start session; a
dashboard-kept "unused session" state (see decision 3); scrolling the page on
launch; a label the browser computes (decision 1).

Direction followed: the [North Star](../../../docs/dashboard-ux-ui-north-star.md)
launch row and [Agent launch](../../../dashboard/AGENT-LAUNCH.md): local
evidence stays local, quiet controls, no motion, meaning never by color
alone, origin decides every story fact. No Accepted ADR constrains this
(0008, the dashboard's, stays Proposed). The North Star and Agent launch
change in the last slice; no new North Star topic is warranted.

## PFE: what is reused

- **Dialog mechanics:** `dashboard/src/StartLaunch.tsx` (`StartLaunchDialog`:
  modal `<dialog>`, focus on the field, Escape/Cancel, "Starting…", the
  4,000-character limit, keyboard back to the launcher). Its words come from
  a story and a workflow; slice 3 extracts the mechanics so the ad hoc dialog
  is the same component with other words, not a copy.
- **Launch path:** `agentLaunchClient.ts` `requestAgentLaunch`,
  `useAgentLaunches().start` (attempt state, record appended), the plugin's
  POST route, `admitted`/`launchRequest` in `agentLaunchAdmission.ts`,
  `claudeLaunch.ts` (name, instruction, `--bg` output, failure categories,
  confirmation in the listing), `agentLaunches.ts` `launch` (folder check,
  wait, `keepRecord`). Ad hoc is a second request kind on the same route and
  the same failure vocabulary, not a second mechanism.
- **Terminal and keyboard:** `usePageSessions().openTerminal` and
  `TerminalSplit`'s `returning` (Close returns the keyboard to the control
  that opened the panel), `TerminalPanel`'s toolbar (title, `<name> session`,
  id).
- **Lists:** `openSessionsOf`, `projectSessionsOf`, `SessionEntry`,
  `RecentSessions`, `SidebarEntry`, `TerminalSplit.goToSession`. A session
  whose story is in no list already reaches its Recent sessions entry
  (`workCard(...) ?? recentSessionsEntry(...)`); ad hoc is that case with no
  identity.
- **Store:** `launchRecordStore.ts` keeps `launchRecordSchema` records; no
  change to the file, its location, or its retention.

## Current findings

1. Every consumer of a record's identity and workflow was found by search
   (`launchWorkflows[...]` in `SessionEntry.tsx`, `SidebarEntry.tsx`,
   `TerminalPanel.tsx`, `StartLaunch.tsx`, `CardLaunches.tsx`,
   `agentLaunchAdmission.ts`; `request.identity` in `TerminalSplit.tsx` and
   `cardSessionsOf`). `launchWorkflowNames` also decides which actions a
   card offers, so ad hoc must not join `launchWorkflows`.
2. `startClaudeInBackground` always passes an instruction argument
   (`["--bg","--name",name,instruction]`, `claudeCode.ts:55`); a launch
   with no text must omit it.
3. The launch time in a record is taken after the launch
   (`agentLaunches.ts`); the label's time fallback uses the time the launch
   began, to the minute.
4. Plans 166 and 171 have landed on trunk since this plan was first written
   (session-record deletion, Mark as done residue). The delete added one
   consumer of a record's identity, `deletedEntryHome(control, identity)` in
   `pageSessions.ts`, called from `TerminalSplit.tsx`; ad hoc entries only ever
   sit in Recent sessions, where it does not use the identity. Re-read the
   session files at each slice's start rather than trusting this plan's line
   references.

## Current decisions

1. **The server derives the label.** The page sends `{source, workflow:
   "ad-hoc", host, instruction?}`; the server builds the label and the name
   and keeps the label as the record's `title`, so entries read it as they
   read a story title. This puts the naming rule where raw-HTTP proof reaches
   every case cheaply, and the page holds no second copy. The rule: the text
   with whitespace runs (including line breaks) collapsed to single spaces,
   trimmed, cut at 40 characters with an ellipsis; when the text is empty or
   blank, or still holds a control character after collapsing, the launch
   time as "30 Sep, 14:32". The instruction sent is the text exactly as
   typed; a blank text sends none.
2. **A request union, not a widened workflow.** `agentLaunchRequestSchema`
   becomes a discriminated union on `workflow`: the existing story request,
   and the ad hoc request with no `identity`. Observed with zod 4.6.5 (the
   repository's version): records in the current shape still parse, an ad
   hoc request parses, and an ad hoc request naming an identity is refused.
   Records already kept therefore stay answerable.
3. **An unused empty session shows "Needs input" like any blocked
   session.** Observed live on 2026-09-30 (Claude Code 2.1.285): a session
   started with no prompt lists `{"status":"idle","state":"blocked"}` with
   no `waitingFor` and no turn count, exactly what a session blocked on a
   question lists; a working session between steps is `status: "idle"` too.
   Nothing the dashboard reads tells them apart, and a kept "used" flag would
   miss input typed in another terminal. The story's own fallback applies:
   keep the existing reading, say so in the documents, add no session state.
   This falls short of the intent Terry accepted on 2026-09-30 (an unused
   session not counting as needing attention); it is reported as a decision
   for Terry, and changing it later needs a new signal, not a rework here.
4. **Blank text is no text.** As story launches do, the page sends trimmed
   text and omits it when empty; the server also treats a blank instruction
   as none.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| `claude --bg` with no prompt starts a session and lists it `blocked` | `claude --bg --name probe-adhoc-noprompt` in `~/git/open-dough` printed "backgrounded … (idle — send a prompt to start)"; `claude agents --json --all` listed `state: blocked`; stopped with `claude stop` | Holds |
| That listing carries nothing separating unused from waiting | A second probe's full listing entry: `pid,id,cwd,kind,startedAt,sessionId,name,status:"idle",state:"blocked"`, no `waitingFor`; `claude logs` shows only the empty prompt | Holds; decision 3 |
| The fake `claude` launches with any argv and lists the session | `tests/fixtures/fake-claude:171-216` reads only `--name` from argv, lists `state: working`, prints the `backgrounded` line | Holds |
| The fake needs a scenario to list a session `blocked` | `claudeSessionBecomes` is used by `agent-launch-attention.spec.ts`; `dashboardTest.ts` exposes `claudeScenario`, `claudeLaunchCalls` | Holds |
| Old records parse under a union | `node -e` with zod 4.6.5: story shape true, ad hoc true, ad hoc with `identity` false | Holds |
| Only the listed files read identity or workflow | `grep -rn "launchWorkflows\|request\.identity\|request\.title\|\.workflow\b" dashboard/src dashboard/server` (findings 1), rerun after rebasing onto trunk's delete-record work: adds `TerminalSplit.tsx` `deletedEntryHome(control, record.request.identity)` | Holds, with that one addition |
| The terminal opens for a fresh record | `openTerminal({record, control})` needs only a record with a listed state and a control; `attachOpens` is true for any listed or unknown state | Holds |
| Nothing but Playwright proves the dashboard | `dashboard/` has no unit runner; `npm run test:dashboard` is the suite, `npm run typecheck:dashboard` the types | Holds; boundary cases go in raw-HTTP specs |
| Plan numbering | `origin/main` and every workspace end at 171 | 172 |

## Proof ownership

Local gates for every slice: the focused specs named, plus `npm run
typecheck:dashboard` (the request type changes in slices 1 to 2, the page
uses it after). Nothing broader is required locally; CI runs the suite.

| Promise | Slice | Observation |
| --- | --- | --- |
| Entries, sidebar, terminal toolbar, and the go-to-session lookup read a record through one place; nothing visible changes | 1 | existing specs unchanged and green |
| Ad hoc request starts `claude --bg --name "<Project> · Ad hoc · <label>"` in the project folder with the text exactly as typed, or no instruction when blank | 2 | `agent-launch-ad-hoc-boundary.spec.ts` |
| Label rule: opening, collapsed whitespace, cut at 40 with an ellipsis, launch time when blank or holding a control character | 2 | same spec |
| Record keeps the label as its title, no identity; stories' records still answered | 2 | same spec, `agent-launch-records.spec.ts` |
| Refusals before any `claude` (other site, unknown project, other host, identity on an ad hoc request, over-long text) | 2 | same spec |
| Story-launch dialogs behave as before | 3 | `agent-launch-card.spec.ts`, `agent-launch-card-problems.spec.ts` |
| "Start session in <Project>" on the actions row, for the selected project, also while the published read failed | 4 | `agent-launch-ad-hoc.spec.ts` |
| Dialog words and mechanics; Escape and Cancel send nothing and return the keyboard | 4 | same spec |
| Launch with and without text lists the session in Recent sessions and the sidebar, no card, no story fact changed | 4 | same spec |
| Terminal opens at once, keyboard in it, "Ad hoc session started" said, Close returns the keyboard to the button, nothing scrolls | 5 | `agent-launch-ad-hoc-terminal.spec.ts` |
| Failed and uncertain launches said beside the button, dialog closed, keyboard back, no entry | 6 | `agent-launch-ad-hoc-problems.spec.ts` |
| Sidebar entry goes to the project, terminal and Recent entry; Mark as done and reopening; reload keeps it; a blocked listing reads "Needs input" | 7 | `agent-launch-ad-hoc-sessions.spec.ts` |
| North Star, Agent launch, README and tests guide state it in the delivered words | 8 | string check below |

## Slices

### 1. One place says how a launch record reads
Type: Structure
Status: done
Proof: unchanged behavior. `agent-launch-card-sessions.spec.ts`,
`agent-launch-recent-sessions.spec.ts`, `session-sidebar.spec.ts`,
`session-sidebar-navigation.spec.ts`, and `agent-terminal.spec.ts` pass
unedited, and `npm run typecheck:dashboard` is clean.

Internal change: a `launchSubject(request)` beside `launchWorkflows` in
`agentLaunch.ts` answers what a consumer needs of a request: its title, its
identity (or none), the kind's name, and the "<name> started in Claude Code"
words. `SessionEntry`, `SidebarEntry`, `TerminalPanel`, and
`TerminalSplit.goToSession` and its delete path (`deletedEntryHome`) read
through it instead of indexing `launchWorkflows` or reading
`request.identity`; both look a card up only when there is an identity. Enables slice 2: ad hoc becomes one more
branch of that function, and no consumer changes again.

### 2. The launch boundary starts an ad hoc session
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-ad-hoc-boundary.spec.ts`, beside
`agent-launch-boundary.spec.ts`, over raw HTTP in dev and preview with the
synthetic `claude` (helpers in `agentLaunchBoundary.ts`), asserting
`claudeLaunchCalls`, the answered record, and the machine's sessions.
- Text "why is the CI slow on main?" → argv `["--bg", "--name",
  "Open Dough · Ad hoc · why is the CI slow on main?", "why is the CI slow on
  main?"]` in the Open Dough folder; the answer is `launched` with a record
  whose request has `workflow: "ad-hoc"`, that label as `title`, and no
  `identity`; `GET` lists it.
- No text, and only spaces → argv exactly `["--bg", "--name", "Open Dough ·
  Ad hoc · <30 Sep, 14:32 shape>"]` with no fourth element.
- Text of 60 characters with a line break and tabs → the label is the first
  40 characters of the whitespace-collapsed text plus an ellipsis; the
  instruction is the text exactly as typed. Text holding U+0007 → the label
  is the launch time.
- Refused before any `claude`: other site 403, unknown project 404, host not
  Claude Code 400, an ad hoc request naming an `identity` 400, text over the
  limit 400; `claudeCalls` empty each time.
- A story launch is unchanged (`agent-launch-boundary.spec.ts`) and records in
  the earlier shape are still answered (`agent-launch-records.spec.ts`), both
  passing unedited.

Behavior: recorded project folder, ad hoc request → session started, confirmed
in Claude Code's listing, record kept with its label. Adds the union to
`agentLaunchRequestSchema` and the record's request, the ad hoc branch of
`launchSubject`, `admitted`/`launchRequest`, the label and name in
`claudeLaunch.ts`, and an optional instruction in `startClaudeInBackground`.

### 3. The launch dialog's mechanics are one component
Type: Structure
Status: done
Proof: unchanged behavior. `agent-launch-card.spec.ts` (dialogs name the
story and command, focus the field, Escape and Cancel send nothing, an
abandoned instruction is gone on reopening) and
`agent-launch-card-problems.spec.ts` pass unedited.

Internal change: `StartLaunchDialog`'s dialog, focus, textarea, Start/Cancel,
"Starting…" and keyboard return move into a `LaunchDialog` that takes the
heading, the descriptive text, the field's label and hint, and the launcher
it returns the keyboard to; `StartLaunch` supplies the story's words. Enables
slice 4: the ad hoc dialog is that component with its own words.

### 4. A developer starts an ad hoc session from the project actions row
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-ad-hoc.spec.ts` (fake origin journey as
`agent-launch-card.spec.ts`: `launchJourney.ts`, `dashboardPage.ts`, project
folders `open-dough` and `pygardon`).
- The project actions row, under the banner and at the opposite end from
  Near-future direction beside the ? help, offers "Start session" named
  "Start session in Open Dough"; choosing Pygardon renames it "Start session
  in Pygardon". It is offered while the published read is reading and after it
  failed (the read-failure journey's way of failing it), and hidden with the
  agent roster as the direction row is.
- It opens a dialog headed "Start a session in Open Dough in Claude Code" that
  says Claude Code starts a background session on this machine, in this
  project's folder, with no story or skill; its field "What would you like to
  talk about? (optional)" is focused and empty, and Start is enabled empty.
  Escape and Cancel send nothing (`claudeCalls` empty), return the keyboard to
  the button, and a reopened dialog is empty.
- With "why is the CI slow on main?" → argv as slice 2 in the Open Dough
  folder; with the field empty or only spaces → no instruction. On Pygardon
  the folder is Pygardon's.
- The session then reads in Recent sessions as an entry titled with its
  label, "Ad hoc session started in Claude Code" with its launch time, its
  session id, "Local: launched from this dashboard on this machine." and Open
  terminal, with no identity line, and in the Sessions sidebar as an entry
  "Open Dough · Ad hoc". No Backlog or Taken card lists it or changes
  (`expectMembership`), and the cards' Start actions are unchanged.

Behavior: project shown → Start session → dialog → Start → session listed in
Recent sessions and the sidebar. Adds `StartSession` on the actions row in
`App.tsx`, the ad hoc `start` on `useAgentLaunches` and
`requestAgentLaunch`, the ad hoc branch of `SessionEntry`/`SidebarEntry`
words, and the row's CSS. The terminal opening, the status, and launch
problems are slices 5 and 6; until then a launch leaves the keyboard on the
button and a problem shows nowhere (interim, replaced by slice 6).

### 5. The started session opens in the terminal at once
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts`, beside
`agent-terminal.spec.ts` (the synthetic `claude` echoes typed input). Start
with text, and start with an empty field → the terminal panel opens on the
new session with the keyboard in it; its toolbar names the label, "Ad hoc
session" and the session id; what is typed reaches the session; the polite
status says "Ad hoc session started"; the entry says "Shown in terminal" and
the sidebar entry is current; the page's scroll position is unchanged. Close
detaches, returns the keyboard to "Start session", and the session keeps
running and is still offered Open terminal.

Behavior: confirmed ad hoc launch → terminal shown on it, keyboard there,
status announced. Adds the `openTerminal` call with the Start session
button as the control, and the row's status region.

### 6. A launch that did not start says so beside the button
Type: Behavior
Status: done
Proof: `dashboard/tests/agent-launch-ad-hoc-problems.spec.ts`, as
`agent-launch-card-problems.spec.ts`. Scenario `refused`, `untrusted`, and
`hang` with a short launch wait: the row says "Launch failed" with why (the
folder not trusted, refused) or "Launch uncertain" with the advice to check
`claude agents`, beside a "Start session" that stays enabled; the dialog is
closed, the keyboard is on the button, no entry appears, no terminal opens,
and no card shows the answer. A later start in a working scenario launches
and clears the answer.

Behavior: failed or uncertain ad hoc launch → answer beside its own action,
recoverable by starting again. Adds the ad hoc attempt state and its
rendering in `StartSession`; reuses `LaunchProblem` and the `claude agents`
advice unchanged.

### 7. An ad hoc session is findable, doneable and reopenable like any other
Type: Behavior
Status: planned
Proof: `dashboard/tests/agent-launch-ad-hoc-sessions.spec.ts`. An ad hoc
session with its terminal closed, another project selected: its sidebar entry
("Open Dough · Ad hoc") opens → Open Dough's stories show, the terminal opens
on the session, and its Recent sessions entry is scrolled into view (no card
exists to scroll to). Mark as done from the terminal panel → the entry leaves
the sidebar, its Recent sessions entry reads "Done" with "Named
done-<name>", and Open terminal reopens it back into the sidebar. After a
reload the entry is still there. With the synthetic listing making the
session `blocked`, its entries read "Needs input" and the sidebar counts one
session needing attention, as for a story session. With the listing
unreadable, its Recent sessions entry offers "Delete record…", and deleting
it removes it from Recent sessions and the sidebar with the keyboard on the
next Recent sessions entry.

Behavior: the existing session mechanisms hold for a record with no story.
Proof-mostly on slices 1 and 4; new code only if the proof finds a consumer
still assuming an identity.

### 8. The enduring documents state the ad hoc session
Type: Behavior
Status: planned
Proof: after slices 1 to 7 the delivered strings are the ones in the specs.
Check: each of "Start session", "Start a session in", "What would you like to
talk about? (optional)", "Ad hoc session started in Claude Code", "Ad hoc
session started" appears in `docs/dashboard-ux-ui-north-star.md` and
`dashboard/AGENT-LAUNCH.md` (`grep -c` each at least 1) and in a spec; the
North Star still reads as one row per its own table.

Behavior: a reader of the North Star and Agent launch finds the ad hoc
session as delivered. **North Star:** in the launch-actions row, state the
project actions row and its "Start session", the dialog, the terminal opening
at once, that the session lists only in Recent sessions and the sidebar (no
card), the name, and that an unused empty session reads "Needs input" as any
blocked session does; update the date and reason line per the guide's
revision rule. **Agent launch:** an "Ad hoc session" section (the request
kind on the same POST, the label rule, the arguments, the record without an
identity, entries, and the unused-session reading), and its intro's table
gains no row (it is not a card workflow). **README** (`dashboard/README.md`):
one sentence beside its launch line. **Tests guide:** name the five new
specs in `dashboard/tests/README.md` with the launch specs. Reducing the
seed's story to Goal and Scope happens at wrap-up, not here.

## Accepted trade-offs and refinement

Slice-plan refinement was not run: no concern that refinement could resolve
was identified. Two trade-offs are accepted knowingly, not open concerns:

- **Slice 4 is the largest slice.** It has one outcome and one proof loop, so
  it passes the Behavior gate; if it overruns, split it as the sizing note
  below says.
- **A failed launch shows nothing until slice 6.** Slices 4 and 5 leave that
  interim state; slice 6 replaces it. Between them the failure is only visible
  in the developer's Claude Code listing.

## Sizing and stopping points

Eight slices, each one outcome and one spec or the existing specs. Every stop
is safe: after 1 and 3 nothing changed for the developer; after 2 the
boundary starts ad hoc sessions but no page offers it; after 4 a developer can
start one and find it (the terminal is opened with Open terminal, problems
are silent until 6); after 5 the intended journey works; 6 and 7 finish
failure and continuity; 8 finishes the documents. Slice 4 is the largest
(row, dialog, request, entries); if it overruns, split at the entries' words
and keep the button, dialog and launch first.

## Learnings

- Slice 1 accepted: the five named specs plus `agent-terminal-delete.spec.ts` (covers the `deletedEntryHome` path) pass unedited and `npm run typecheck:dashboard` is clean. `claudeLaunch.ts` builds the session name from the workflow name and `request.title` (line ~43); slice 2 decides whether that reads through `launchSubject`.
- Slice 2 accepted: `agent-launch-ad-hoc-boundary.spec.ts` (22 tests, dev and preview) plus the story boundary, records, refusal and listing specs pass (88), and all `agent-launch`/`agent-terminal` specs pass (171). The label lives in `claudeLaunch.ts` (`recordedRequest`); the record's request is `recordedLaunchRequestSchema` (ad hoc carries the label as `title`); `launchSubject` reads a `RecordedLaunchRequest`.
- Slice 3 accepted: `LaunchDialog` and `useLaunchDialogLauncher` in `dashboard/src/LaunchDialog.tsx` (props: heading, description, note?, fieldLabel, fieldHint?, starting, onStart, onClose(launched)); the dialog classes are now `launch-dialog` and `launch-dialog-actions`. The card, card-problems, attention-clearing, card-delete-problems and recent-session-states specs pass (14) and typecheck is clean.
- Slice 4 accepted: `StartSession.tsx` on the always-rendered `project-actions` row (Start session then ?), `startAdHoc`/`adHocAttemptOf` on `useAgentLaunches` (attempt kept per project for slice 6), `agent-launch-ad-hoc.spec.ts` (8 tests) plus the card, card-problems, keyboard-order and recent-delete specs pass (19); `accessible-overview-keyboard.spec.ts` and `dashboardPage.ts` count the new button. `launchSubject.startedWords` now reads "Ad hoc session started in Claude Code".
- Recent sessions renders only when the project has published work (as for story sessions), so a session started while the published read failed or on a project with no work shows only in the Sessions sidebar. Not widened here; slice 7 or a decision for Terry.
- `agent-launch-recent-delete.spec.ts` "State unknown" fails under parallel `--repeat-each` load (4 of 8 at the slice 3 baseline `aeeafc3a`, expecting "Working" within 5 s), and passes serially. It predates this work; the failure is at line 109 of the spec.
- Slice 5 accepted: `StartSession` opens the terminal on the launched record with the button as control and keeps its own `role="status"` line ("Ad hoc session started", cleared when the dialog opens again; App's `notice` is the published-read announcement and stays separate). `agent-launch-ad-hoc-terminal.spec.ts` (2 tests) and the ad hoc, terminal, sidebar and card specs pass (74 and 73).
- Opening the modal itself resets `window.scrollY` (40 to 0) in the empty-field case, for story launches too; the spec measures scroll from the open dialog, so it proves the launch does not move the page, not the whole gesture. A `LaunchDialog` follow-up if that must hold too.
- CI repair of slice 5 (run 36660072699): the always-rendered `role="status"` announcement made `getByRole('status')` (and the shared `[aria-live='polite']` notice locator in `dashboardPage.ts`/`accessibleReading.ts`) match two elements in six existing specs. The ad hoc announcement is now a `role="log"` (implicitly polite, always rendered), located by that role in `agent-launch-ad-hoc-terminal.spec.ts`. Slice 5's local proof had not run the whole suite; from slice 6 on the whole dashboard suite runs before delivery.
- Slice 6 accepted: `LaunchProblemAnswer.tsx` (extracted from `StartLaunch.tsx`, shared by the card action and Start session) renders "Launch failed"/"Launch uncertain" beside the button; `StartSession` takes the attempt and describes the button by the answer. `agent-launch-ad-hoc-problems.spec.ts` (3 tests) passes with the whole dashboard suite (351). The failure texts are `claudeLaunch.ts`'s ("Claude Code does not trust ~/git/open-dough yet…", "…refused to start a session in…"), so the documents in slice 8 follow those words.
