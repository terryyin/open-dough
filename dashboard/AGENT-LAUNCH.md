# Dashboard agent launch

How the [story dashboard](README.md) starts a workflow on a queued story in a
Claude Code background session on this machine. Two workflows can be started:

| Workflow   | Action               | Skill it runs            |
| ---------- | -------------------- | ------------------------ |
| Execution  | **Start execution**  | `dough-execute-plan`     |
| Refinement | **Start refinement** | `dough-story-refinement` |

Every **Backlog** card offers **Start execution** and then **Start
refinement**; **Taken** cards offer neither. A card not marked **Ready for
execution** offers Start execution with the note "Not marked Ready for
execution", so the developer can still start it, for example with an
instruction to refine and plan it first. A card already showing **Preparing**
offers Start refinement with the note "Being prepared". Each action opens a
dialog, such as "Start refinement in Claude Code", naming the story and the
command the session starts with, with an optional instruction and a **Model**
choice; **Start** sends them, and **Cancel** or Escape sends nothing.

**Model** is in every launch dialog, the two card workflows and Start session
alike, after the instruction field. It offers Default ("Default (your Claude
Code setting)"), Fable, Opus, and Sonnet, in that order, and each dialog opens
on Default: nothing is remembered from an earlier launch, whether in the same
page or after a reload. The choices and their `--model` aliases are spelled
once, beside the workflows, in `src/agentLaunch.ts` (`launchModels`).
Choosing one adds `--model <alias>` (`--model opus`) to the same `claude --bg
--name ...` command, before the instruction; Default adds nothing, so Claude
Code's own setting applies. The request carries the alias as an optional
`model`, the boundary refuses one outside the table before any `claude` runs,
and the launch record keeps it. Nothing checks beforehand that the developer
can use the chosen model: Claude Code decides when it starts the session, and a
refusal explains itself naming the model, such as "Claude Code refused to start
a session in ~/git/open-dough with model Opus. Run `claude` in that folder once
to see why, then start again."

The page posts the request to a second local boundary beside the read one,
`/__agent-launch` (`server/agentLaunchPlugin.ts`, reached from the browser
through `src/agentLaunchClient.ts`), mounted by the same Vite configuration in
dev and preview and refusing other sites the same way. It admits only the
workflows above, and only Claude Code as the host. It runs
`claude --bg --name "<project> · <workflow> · <title>"` (for example
`Open Dough · Refinement · <title>`) in the project's folder on this machine (an execution's, in its workspace, below),
`~/git/<project id>` (for example `~/git/open-dough`), with the instruction
`/<skill> <identity>`, followed by a blank line and the developer's
instruction when there is one. It passes a model only when the developer chose
one (above), and never a permission or effort choice, so the developer's own
Claude Code settings apply to everything else. It confirms the
session in Claude Code's own listing, `claude agents --json --all`.

**Start (execution).** Before `claude --bg`, an execution launch runs the
project's own installed start command, `node
.claude/skills/dough-execute-plan/scripts/execution-start.mjs start`, as a
subprocess (`server/executionStart.ts`, the only place its arguments are
spelled; `server/startResult.ts` is the only reader of its one-line JSON result). It passes the project's folder
as `--integration`, the workspace, the branch, the launch's identity, one
stable publisher ID for this machine and project, `--mode story-branch`,
`--remote origin`, `--target` the project's trunk, `--push-authorized` and
`--workspace-authorized`, `--host claude`, and `--model <alias>` only when the
developer chose a model, so the published Take names the agent with host
`claude` and that model, and nothing on Default. The host chooses the
workspace (`server/claudeWorkspace.ts`): `<project folder>/.worktrees/<slug>`
on the branch `claude/<slug>`, the slug the story title in lowercase hyphenated
words (at most 48 characters), numbered (`-2`, `-3`) when a folder or
`claude/` branch already has it. The session then starts with that workspace
as its folder and, as its instruction, `/<skill> <identity>`, a blank line, the
established start as the installed skill's own formatter
(`scripts/established-start.mjs`) writes it, and the developer's instruction
after another blank line. The launch record keeps the established start
(`start`: identity, publisher ID, workspace, branch, mode, remote, target,
`publishedSha`, agent, and the start and candidate SHAs when reported).
Refinement and Start session run no start.

The page says what Start does, for a project whose installed skill establishes
a start (ships the start command and the formatter; `establishesStart` in
`server/executionStart.ts`). The machine's sessions answer carries the ids of
those projects as `establishing`, read on every read. Only then does the
execution dialog add a sentence to its description: "Start also publishes this
story's Take to the project's trunk on origin and creates a workspace under the
project folder's .worktrees/; pressing Start authorizes that push." and only
then does the card read "Preparing execution…" while the launch request is
pending. Any other project, and every project until the first read answers,
gets no sentence and "Starting execution in Claude Code…" (a refinement's reads
"Starting refinement in Claude Code…"). The pending words are local progress,
so the card stays in **Backlog** and shows no Taken or agent until origin does.
The words are in `launchWorkflows` (`pending`, `establishes`). A session whose
launch record keeps a start says "Workspace
~/git/<project id>/.worktrees/<slug>" in its entry, on a card or in Recent
sessions (`workspaceWords`); one launched without a start says none.

The start runs only when the project's installed skill establishes a start;
otherwise the launch is exactly as before: `claude --bg` in the project's
folder with `/<skill> <identity>` and the developer's instruction only, no Take
and no workspace. It is refused, with nothing launched
("Launch failed:"), when the project folder's `origin` is not the catalog
repository the Take would be published to, or when the command stops or gives
no readable result. One reason table in `server/startResult.ts` words each
command `status` (another agent holds the story, not queued in Backlog, the
workspace could not be set up, and the rest); "Taken by <Agent>" names the
owner read from origin's Taken profiles, and a stop that reports its workspace
and branch names them.

A start is kept (`server/startStore.ts`, `~/.open-dough/dashboard/execution-starts.json`,
beside the launch records, one per project and story identity). It is written
before the script runs (publisher ID, workspace, branch, the model chosen,
when), then updated with what the script reports: the established start when
it published the Take, or the start and candidate SHAs a stop's `recovery`
carries. The next execution launch of the same story resumes the kept start:
the same publisher ID, workspace, branch and model, and the SHAs when a stop
kept them (`--starting-revision`, `--candidate-sha`), so the command answers
`existing` or `resumed` and never publishes a second claim or makes a second
workspace. The start is never aborted: when it has not finished within its wait
(two minutes; `DOUGH_START_TIMEOUT_MS` shortens it for tests) the launch answers
uncertain, naming the workspace and branch, "The start was kept and goes on in
workspace <folder> on branch <branch>; pressing Start again resumes it." The
command goes on, so the story may already be Taken, and its result is recorded
in the kept start when it ends. A stop that may have left a claim published or
committed (`unpublished`, `claim-failed`, or no readable result) is refused
with "The start was kept; pressing Start again resumes it." Any other refusal
removes the kept start, since nothing was published to resume. A launch whose
session started removes the kept start (the launch record keeps it); a
`claude` launch that fails after the start was established keeps it, and its
"Launch failed:" answer adds the Take's owner and the workspace after Claude
Code's own reason: "Taken by <Agent>; no session started. Workspace <folder>."
(`Taken` alone when the start named no Agent).

The machine's sessions answer carries `keptStarts`: each start kept without a
session (`AgentLaunches.keptStarts`, from `keptStartsByProject`), naming its
project, story identity, workspace as the page shows folders, and the Agent its
claim named. A Taken card whose story has a kept start offers **Start
execution** (never refinement) with the note "Started here, no session yet", and
no other Taken card offers one (`CardLaunches`, `keptStartOf`). Its dialog says
the session opens in that workspace and that the Take is already published, so
Start publishes no second one. Start there is an ordinary execution launch
that resumes the kept start: the same workspace and branch, the script's
`existing` answer, one claim on origin. When the session starts the offer
goes, the record keeps the start, and the kept start is removed. A kept start
with no result, from an uncertain or stopped start, is offered the same way
once origin shows the story Taken.

A start lost with the server (a kept start with no result and no `recovery`,
and not among the starts this server process is running, `StartProgress`) is
resumed from its kept workspace: when it is on the kept branch, Start again passes the script
its HEAD as `--candidate-sha` and HEAD's parent as `--starting-revision`
(`lostStartArguments`), which the script validates against the claim commit. The
answer is then `resumed`, one claim on origin, the session in the same
workspace. A workspace that is not the isolated claim stops with the script's
own reason ("The workspace could not be set up: retained candidate or
workspace is not the isolated owned claim.") and launches nothing; that stop
removes the kept start.

Every page shows a running start's phase. `AgentLaunches` owns the starts this
server is running in memory (`server/startProgress.ts`), each by project and
story: `preparing` from before the script runs until it ends, then `launching`
once it established the start, until the session launch ends; a start that stops,
whose wait expired, or whose session launch ended leaves it. The machine's
sessions answer carries them as `starts` (`source`, `identity`, `phase`), read on
every read; a page reads it on load, on the steady check, and when seen again,
and a card of that story, on whichever page and whoever asked, says the phase
words `startPhaseWords` takes from `launchWorkflows` ("Preparing execution…",
then "Starting execution in Claude Code…") in place of the launching page's own
pending words, and its Start waits. The card stays where origin puts the story
(Backlog until origin shows it Taken). A start kept in the store with no running
process is never running: it is in `keptStarts` (offered as above once Taken),
and a start that is running is not in `keptStarts`. The launching page clears
the phase when its launch answers.

A story this server is already starting is not started twice. The check and the
`preparing` entry are one synchronous step in `beginStart`, before any await,
so of two launches of one story, whether sent apart or at once, exactly one
goes on. The other is answered before any process runs (no script, no `claude`)
as failed with reason `already-starting`: "This story is already starting on
this machine, so a second start was not made. Wait for the running start to end;
its card shows its progress. Nothing was launched." Origin holds one claim and
the project one workspace. A story Taken by another agent is still the
"Taken by <Agent>" refusal above.

A confirmed launch lists its session on the story's card, beside the Start
actions, which stay with their notes whatever sessions are listed, and the
keyboard lands on the new entry. Each entry shows its session the way Recent
sessions does (below), without the story title and identity the card already
names: its state, its workflow, such as "Refinement started in Claude Code",
when it was launched, the session id, "Model: <Name> (requested)" when a
model was chosen (below), and **Open terminal**, which shows the session in
the page's terminal (below). Two launches, even of one workflow,
are two entries, newest first. A failed launch (the project folder or
`claude` not found, a folder Claude Code does not trust yet, or a refusal)
says why, and nothing was launched. An uncertain one (no answer within the
launch wait, or no session to confirm) advises checking `claude agents`
before starting again. Either answer stays beside its own action.

A card lists every launch record of its story that has not been marked done,
in whatever stage origin shows the story: **Backlog**, whether or not it shows
**Preparing**, or **Taken**. A Taken card lists its sessions and offers no
Start action. A refinement launched on a card already Preparing is listed
there at once. Its story's stage, its session finishing, stopping, or no
longer being listed, Claude Code's listing becoming unreadable, and the
passing of time never remove a session from its card; only marking it done
does (below). Reloading
the page, selecting another project and back, or restarting the dashboard
keeps the listing: the page reads the machine's sessions from the local
server in one request (`GET /__agent-launch`), which answers every catalog
project's kept launch records, each naming its project, and holds one session
state for the machine apart from the selected project; a card and Recent
sessions show the selected project's records from it, by project and
identity, since an identity is unique only within a project. A
listed session is local evidence from this machine, not a story fact: origin
alone places the story, and a story that leaves every list keeps its sessions
only under Recent sessions.

**Ad hoc session.** The project actions row, under the banner, offers **Start
session** for the selected project (`src/StartSession.tsx`), also while the
published read failed. It opens a dialog headed "Start a session in <project>
in Claude Code" that says Claude Code starts a background session on this
machine, in the project's folder, with no story or skill; its field,
"What would you like to talk about? (optional)", is focused and empty, and
**Start** is enabled with nothing typed. **Start** sends it, and **Cancel** or Escape
sends nothing and returns the keyboard to the button. It is not a card
workflow, so the table above has no row for it.

It is a second request kind on the same POST: `{ "source": "<project id>",
"workflow": "ad-hoc", "host": "claude", "instruction": "<text>" }`, with the
instruction omitted when the text is blank, and no identity or title; a request
naming an identity, another host, an unknown project, or an instruction over
4,000 characters is refused before any `claude` runs. The server derives the
label (`server/claudeLaunch.ts`): the text with each run of whitespace,
including line breaks, collapsed to one space and trimmed, cut at 40
characters with an ellipsis; when there is no text, or it holds a control
character, the time the launch began, as "30 Sep, 14:32". It runs
`claude --bg --name "<project> · Ad hoc · <label>"` in the project's folder
with the text exactly as typed as the only instruction, or with none, and the
chosen model as above, and confirms the session in the same listing as any launch, with the same failure
and uncertainty answers, shown beside Start session, which stays enabled. The
record keeps the label as its title and has no identity, so no card looks it
up. A confirmed launch opens its session in the terminal at once, the keyboard
in it, and a polite `role="log"` line says "Ad hoc session started"; Close
returns the keyboard to the button.

Its entries are Recent sessions' and the sidebar's, never a card's: an entry
titled with the label reads "Ad hoc session started in Claude Code" with its
launch time, session id, and Open terminal, without a story identity, and the
sidebar names it "<project> · Ad hoc". Going to it from the sidebar shows the
project's stories and scrolls to its Recent sessions entry. Mark as done,
reopening, and Delete record work as for any session, and it changes no story
fact. Recent sessions renders only for a project with published work, so a
session started while the published read failed shows in the sidebar alone.
Its state is read like any other: Claude Code 2.1.285 lists a session started
with no first message as `blocked` with nothing separating it from one waiting
on a question, so an unused session shows **Needs input** and counts as needing
attention until the developer talks to it or marks it done.

**Recent sessions**, below the stages, lists every launch record the page
reads for the selected project, newest first, whatever origin now shows of its
story. Each entry names the story's title and identity (an ad hoc session's
entry has neither), its workflow, when it was launched, the session id, and the same **Open terminal** as a card's
entry, marked "Local: launched from this dashboard on this machine." An
entry stays when the story is prepared, taken, or leaves every list, and when
its session is marked done, and two launches of one story are two entries.
Another project's launches are listed only under that project, and sessions
this dashboard did not launch are not listed. Until the page first reads the
machine's sessions it says "Reading sessions…"; with no records it says that
no sessions launched from this dashboard are kept.

**Model line.** An entry of a launch that chose a model, on a card, in Recent
sessions, and in the Sessions sidebar, reads "Model: Opus (requested)" (the
model's name). It states what was asked, not what the session runs, since
Claude Code's own listing does not say; a launch on Default shows no model
line. It is read from the launch record, so a reload keeps it.

The **Sessions** sidebar (`src/SessionSidebar.tsx`) lists the sessions still
open in every catalog project, whichever project is selected: every launch
record not marked done, exactly the sessions the cards keep, including one
whose story is in no list. The **Sessions** icon button at the start of the pinned
banner, before the project name, opens and closes it (`aria-expanded`,
controlling the sidebar), and Command+B does the same page-wide, also while
the keyboard is in the terminal, where Ctrl+B still goes to the session. An
open dialog, as the launch dialog or the badge legend, keeps Command+B;
elsewhere the page takes it from the browser. Toggling leaves the keyboard
where it is, except that closing the sidebar while the keyboard is inside it
returns the keyboard to the Sessions button. It starts closed, and stays open
or closed as left across project switches, the agent roster, the terminal, and
reloads, kept in this browser's storage; without that storage it starts
closed. On a wide window the sidebar is a fixed-width column left of the page,
as tall as the window and scrolling on its own, with the terminal panel still
on the right: sidebar, page, terminal. On a narrow window, where the terminal
stacks above the page, it lies over the page from the left, below the banner.
Sessions that need the developer, by the card's rule, come first, earliest
launch first; every other session follows, newest launch first. A state change
moves an entry between the two groups, and a new launch leads the others.
Each entry is one line: its story's title, cut with an ellipsis when it is
long, and at the end how long ago its session was launched, by the largest
whole unit ("<1m" under a minute, then "5m", "2h", "3d"), advancing every 30
seconds. Its state shows by its left border (solid thick red needing input,
solid thick green ready for review, dashed red failed or stopped, thin blue
working, thin grey done, dotted grey unknown, unlisted, or not recognized),
with the state's label visually hidden for assistive technology. The state in
the words a card entry uses, the project and workflow, such as
"Pygardon · Refinement", the model asked for, and when it was launched are the
entry's tooltip. The Sessions button, an icon named
"Sessions", carries a red badge holding only the number of sessions that need
attention, counted across every project by the card's rule, open or closed and
absent when none do; its name says "1 session needs attention" or "<N> sessions
need attention". The sidebar itself has no attention sentence.
Before the machine's sessions are first read it says "Reading sessions…"; with
none kept, "No sessions launched from this dashboard are kept."; and with all
of them marked done, "No sessions launched from this dashboard are open." A
session marked done leaves it, as it leaves its card.

Each sidebar entry is one control named by its story's title. Opening it (`src/TerminalSplit.tsx`) shows that project's stories,
from the agent roster too, as one history entry that browser Back undoes;
opens its session in the terminal as Open terminal does, keyboard included,
where the entry offers it, without attaching a shown session again; and, once
those stories are read, scrolls the story's card, or else its Recent sessions
entry, into view (at once under reduced motion) until the developer scrolls,
points, or types (`src/workFocus.ts`). The session the terminal shows, as the
page frame says, marks every entry of it: its card and Recent sessions entry
are outlined and its entries there say "Shown in terminal", and its sidebar
entry is current (`aria-current`) and outlined. Close clears the marks and
returns the keyboard to the entry, or to the Sessions button on a narrow
window, where opening an entry closes the sidebar lying over the page. Opening
or closing the sidebar, or opening an entry, changes no story fact, stage,
card position, or session state or mark.

Each entry, in Recent sessions and on a card, also shows its session's state,
read from one `claude agents --json --all` run in the machine's home folder
(Claude Code lists every session on the machine wherever it runs) whenever the
records are read, and never kept, and whether the developer is needed there. One
reading (`src/sessionShown.ts`) decides both from Claude Code's `state` alone;
whether the process runs or is idle does not. A session not marked done needs
attention while Claude Code lists it `blocked`, shown **Needs input** with what
it waits for when Claude Code reports `waitingFor` (for a question, Claude Code
2.1.284 reports only "input needed"); `done`, shown **Ready for review**
whether its process still runs or has exited; `failed`, shown **Session
failed**; or `stopped`, shown **Session stopped**. Such an entry has a solid,
heavier edge beside those words. A `working` session shows **Working**, busy or
idle between steps, and needs no attention; a state this reading does not know
shows **State not recognized** with the state Claude Code lists, and no
attention. Opening or closing a session's terminal leaves its attention as it
is; the next listing that no longer asks for the developer, or a successful
Mark as done, clears it. A session marked done (below) needs no attention while
it stays marked: it shows **Working** while Claude Code lists it working and
**Done** otherwise; opening its terminal here reopens it (below). A session
Claude Code no longer lists shows **Session unavailable** (**Done** once marked
done) without Open terminal. An entry Claude Code lists without a short id or
state, such as an interactive session running in a terminal, is passed over and
leaves the rest of the listing readable. If the listing cannot be read, every entry shows
**State unknown** with "Claude Code's session list could not be read", no
attention, and keeps Open terminal and offers Delete record (below), as
**Session unavailable** does. While the page
is visible it reads the records again every 15 seconds, the pace of its
revision checks, so a state change shows without a reload. With no records
kept for any project, `claude` is not run.

A card whose listed sessions include any that need attention says so above
them, by the same reading: "1 session needs attention", or "<N> sessions need
attention" for more; with none, it says nothing. Each entry still names its
own reason, so one working session never hides another that needs the
developer, and an unavailable or unknown session is not counted. The count is
worked out from the card's listed sessions whenever the records are read,
never kept, so a later listing, a Mark as done, a reload, or a return from
another project shows it afresh, and another project's sessions never count.
It never changes the card's stage, position, or published facts. A story that
leaves every list keeps each affected session, with its reason and Open
terminal, under Recent sessions.

While the dashboard server runs, it also watches the machine's sessions itself
(`server/sessionAlerts.ts`), with or without a page open, and raises one macOS
notification with the sound Glass when a session not marked done enters any
reading other than **Working** (`alertReading` in `src/sessionShown.ts`, so
also **Session unavailable** and **State not recognized**, which the attention
count leaves out, but never **State unknown**). Its title is the project and the
session's title, and its message the reading, then ": <what it waits for>"
when Claude Code says. It reads the sessions every 15 seconds
(`DOUGH_ALERT_CHECK_MS` shortens it for tests) and remembers each session's
last reading for that server run only: the first read only sets that baseline,
a session first seen later counts as having been working, and a session alerts
again only after a reading that does not alert, so it does not repeat while
the reading stays, across a page reload, or when a server restart finds it
there, and a changed reason alone is no new alert. The text is passed to
`osascript` as arguments, never spliced into its script; where `osascript`
is missing or refuses, nothing is raised and the watcher goes on. Its
availability is the latest `osascript` outcome (a probe, `osascript -e 'return
0'`, at start, then each notification), which the machine sessions answer
carries as `alerts`. While it is unavailable, the open Sessions sidebar says
"Alerts unavailable:" with one of two reasons, "osascript was not found on this
machine, so alerts need macOS" or "macOS did not accept the notification", and
the note goes after the next read of the sessions that follows a working
notification. A closed sidebar shows no note. Two dashboard servers on one
machine would each alert.

The launch boundary also attaches a terminal to a session it launched. A
same-origin WebSocket to
`/__agent-terminal?source=<project id>&session=<session id>`
(`server/agentTerminals.ts`, contract in `src/agentTerminal.ts`) runs
`claude attach <short id>` in the project's folder through a pseudo-terminal,
and nothing else: never a shell or another command. The server sends the
session's terminal output as text frames. The page sends only
`{ "input": "<text>" }`, typed into the session, or
`{ "resize": { "cols": <n>, "rows": <n> } }`; anything else closes the
socket. Closing the socket from either side, or stopping the server, ends
that attach process, which detaches only: the session keeps running. An
attach process that exits on its own, as Claude Code does on Ctrl+Z, closes
the socket with code 4000 (`terminalEndedCode`), so the page can tell an ended
terminal from a lost connection. The
upgrade is refused with an HTTP error and no socket, before any `claude
attach`, when it comes from another site or host (403), names an unknown
project (404), names a session this dashboard did not record for that project
(404, without running `claude` at all), finds the project folder missing
(404), or names a session Claude Code no longer lists (410). As for Open
terminal, a stopped session and one whose state is unknown still attach. An
admitted attach to a session marked done clears the record's done time once
`claude attach` has started, before any of its output reaches the socket; a
refused upgrade, or an attach that could not start, leaves the mark.

**Open terminal** on a card's entry or a Recent sessions entry opens that
session in the page's one terminal (`src/TerminalPanel.tsx`, an xterm.js
terminal on that socket). The page splits into two columns: the page stays on
the left, and the terminal panel takes the right, above the page on a narrow window. Its
toolbar names the story title, the workflow, and the session id, and holds
**Close**. The terminal shows the session's conversation, what the developer
types there goes to the session, and its size follows the panel. Opening
another session closes the first one's socket, which detaches it while it
keeps running, and shows the other in the same panel. An entry whose story is
in no list opens the same way. **Close** removes the panel and detaches only:
the session keeps running, and its Open terminal is offered again. The
keyboard returns to the Open terminal that opened the panel while it is still
on the page. The open
terminal is page state, so switching projects keeps it attached to the same
session, and a reload starts without one. When the connection drops, as when
the dashboard server restarts, the panel says "Disconnected from the session"
and offers **Reconnect**; when the attached CLI exits on its own, it says "The
terminal ended" and offers **Open again**. Either attaches to the same session
anew, and Close stays available.

**Mark as done**, beside Close and on every session a card lists, ends the
session for the dashboard. Both go through the same page operation. The page
posts `{ "source": "<project id>", "session": "<session id>" }` to
`/__agent-launch/done` (`server/doneMarks.ts`). The boundary
(`server/agentLaunchAdmission.ts`) refuses another site (403), an unknown
project (404), a session this dashboard did not record for that project
(404), or a missing project folder (404) before running `claude`. While the
page's terminal is attached to the session, the boundary types Claude Code's
own rename into it: Ctrl+U to clear any draft, then `/rename done-<name>`
built only from the recorded launch name (for example
`done-Open Dough · Execution · <title>`), then Enter. It waits up to five
seconds for `claude agents --json --all` to list the new name. A launch name
with a control character is never typed. A busy session queues the command
until its turn ends, so the wait can expire; then, as with no terminal
attached or an untyped name, the `done-` name is only the dashboard's. Either
way the boundary keeps the done time on the launch record and ends the
terminal's attach process. It runs `claude stop <short id>` in the project's
folder only while `claude agents --json --all` still lists the session, or
cannot be read; a session Claude Code no longer lists is only marked. A panel
showing the session closes. The panel or card entry says "The session could
not be marked done." if the boundary refused the mark or no answer came.
The session leaves its card, and the keyboard returns to the control that
opened the panel while it is on the page. Its Recent sessions
entry shows **Done** and "Named done-<name>", even for a session Claude Code
no longer lists, and still offers Open terminal while Claude Code keeps the
conversation. Opening it there reopens the session: once the terminal shows
its output, the page reads the session's record again, so the session returns
to its card with its current state and its entry no longer shows Done, through
reloads and restarts. It is kept like any unclosed session until Mark as done
marks it again. A done mark is local evidence, like the launch record, and
never changes where origin places the story.

**Delete record**, offered on a card entry or a Recent sessions entry only
while its session shows **State unknown** or **Session unavailable**, never in
the sidebar or on a **Done** entry, forgets the
dashboard's record of that session. The entry shows a quiet "Delete record…";
it asks in place,
"Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.",
with **Delete record** and **Keep**, the keyboard on Keep. Keep or Escape keeps the record and returns
the keyboard to "Delete record…". The page posts
`{ "source": "<project id>", "session": "<session id>" }` to
`/__agent-launch/delete` (`src/deleteRecord.ts`, `server/agentLaunchPlugin.ts`).
The boundary refuses another site (403), a malformed request (400), an unknown
project (404), a session this dashboard did not record for that project (404),
or a missing project folder (404) before running `claude`. It then reads the
session's state again with `claude agents --json --all`; when the state is now
known (listed, or unlisted and marked done) it keeps the record, answers `{ "kind": "state-known", "record": … }`,
and the entry says "This session's state is now known". Otherwise it removes
only that record from `~/.open-dough/dashboard/agent-launches.json` and
answers `{ "kind": "deleted" }`. It never runs `claude stop`, never renames the
session, and never marks it done; the conversation stays in Claude Code and a
running session keeps running. A record file that cannot be written answers 500
and the entry says "The session record could not be deleted." with why, keeping
the question and the keyboard where they were. A deleted record leaves the
card and Recent sessions, and a read of the sessions asked before cannot bring
it back; a polite status says "Session record deleted", and the keyboard goes
to the next entry in the list the control was in, else to its card or Recent
sessions. A terminal showing the session closes. Mark as done is not the only
way to clear an unknown or unavailable entry: Delete record forgets it without a
done mark.

Launch records are kept on this machine, outside every repository, in
`~/.open-dough/dashboard/agent-launches.json`. Restarting `npm run
dev:dashboard` or `npm run preview:dashboard` keeps them, and a dev and a
preview server on the same machine answer the same records. A record whose
session is not marked done is kept however long ago it was launched; one marked
done more than 30 days ago is no longer answered. If that file cannot be read,
the dashboard answers no records and leaves the file alone; the next launch
moves it aside as `agent-launches.json.unreadable` and starts a new one. If an
earlier copy already has that name, the later one is moved aside as
`agent-launches.json.unreadable-<move time>` instead, so every copy is kept.
Origin still shows the story truthfully, because nothing about the story
itself was ever kept here.
