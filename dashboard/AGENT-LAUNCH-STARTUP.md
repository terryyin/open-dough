# Dashboard startup handoff and reconciliation


Start sends the exact request to `POST /__agent-launch/accept`. The service
(`server/launchAttemptOwner.ts`) saves it as an attempt in
`~/.open-dough/dashboard/launch-attempts.json` before any start or native call
and answers with the attempt; a request it cannot save starts nothing. The
attempt runs without its caller and keeps its publication receipt and outcome
for `GET /__agent-launch`; `GET /__agent-launch/changed` waits for an owned
attempt to change so pages reread without polling hosts. On another server a
running attempt waits the same bounded interval before rereading machine facts. While a story's attempt
is unresolved (running, or in need of reconciliation as below), another request
for that story, from any workflow, is refused, and only that attempt's
continuation resumes it; the page protects the story by the same rule
(`unresolvedAttempt` in `src/launchOutcome.ts`). While a story already has an
open launch record on this machine (any host, not marked done), another
request for that story is refused with reason `session-open` until the
session is marked done or its record deleted; a continuation is refused the
same way unless every open record of the story is that attempt's own launch
(`sameLaunch`) or its launched session. An
unreadable attempt file or launch-record file refuses every story launch.

Before effects, the attempt records this preparing server as its worker. At spawn
it records the script pid beside the server pid, retaining both across the
script's exit and the server's result handling; then the native step records
the server as worker again. It records the step (`start` for the installed script,
`launch` for the server performing the native launch), and when it was noted.
Each answering server observes that process on this machine: an unsettled
attempt is running while owned here or either recorded process is alive; permission
refusal to signal it also counts as alive. Ownership remains this server's right
to run and change the attempt. Settlement clears the worker and slow warning.
A live worker keeps the card progressing after reload, project switch, or server
restart, with no Recheck or Continue. Its recorded step supplies the phase on a
non-owning server. Past `DOUGH_START_TIMEOUT_MS` (default two minutes), the
warning names the elapsed minutes, kept workspace and branch. If the original
server died before noting the warning, the answering server derives it from the
attempt's acceptance time and that threshold. Age never ends a worker or settles
an attempt. Once its worker dies without an outcome, it is interrupted and needs
manual recovery; restarting the dashboard never automatically continues it.
The slow-start warning follows the phase sentence in the card's status. Startup
announcements announces it once across rereads, elapsed-minute changes and reloads.

From submission, the dialog says “Starting…” with Cancel, Start and every choice
unavailable, ignores Escape, and says “Startup is underway and can no longer be
cancelled here.” Acceptance closes it; a refusal stays beside the action, and a
lost answer is uncertain, never accepted. Until the start reconciles, the
story's whole card frame is protected wherever origin lists it: no action
button runs, including alternate launches, Inspect story and card session
actions, while facts and source links stay readable and other cards,
navigation, the Sessions sidebar and the terminal work. Its dashed edge joins
the selection and “Shown in terminal” marks. Its status says the start phase
(“Preparing execution…” / “Preparing refinement…”, then “Starting execution
in <host>…” / “Starting refinement in <host>…”, using the actual running
start’s host) and “Local startup in progress; this story's actions are
unavailable until it settles.”, then “Waiting for published story state” once
the outcome settled. Only that progress shows an indicator, which moves unless
reduced motion is requested. Local startup never moves the story or shows Taken,
Preparing or an owner. When neither local progress nor a worker step reports a phase, the installed skill's
start-establishment capability determines Preparing versus Starting; Starting
names the recorded host for execution and refinement. These sentences come
directly from workflow and host facts. Story Starts stay unavailable until the
page first reads this machine's attempts.

A publishing start reconciles when the shown revision is its accepted
publication or, by the authenticated comparison in
[GitHub requests](GITHUB-REQUESTS.md), contains it, and its native outcome has
settled, whether or not the shown snapshot still lists its story. A refusal
that published nothing, or a start that publishes nothing, waits for a
published read asked after its outcome. An older or unrelated snapshot never
clears protection. A published start whose session was refused reconciles to
its Taken card with the kept start's continuation. A reconciled start stays so
on this machine: the page notes it with its attempt through
`POST /__agent-launch/reconciled`, which refuses an attempt that is unsettled or
needs reconciliation, so later pages, reloads, project switches and restarts
show the story's actions, and no recovery item, without asking GitHub again.

A lost answer, an unsettled attempt whose worker is no longer running, or an outcome whose session or
publication may or may not exist says “Startup needs reconciliation” statically
on the card, which stays protected, and in the Startup recovery region beside the
project's actions, which also says when this machine's attempts could not be
read. Recheck reads this machine's evidence and the published state again. For a
story attempt whose launch is uncertain after its start settled
(publication known), and whose host boundary offers a session listing
(`hostOperations.launchedSessions`), Recheck first posts to `POST /__agent-launch/verify`,
which first reads this machine's launch records (`server/launchVerification.ts`).
A record of the same project, story and workflow launched since the attempt
was accepted confirms its session: the latest such record settles the attempt
as launched without reading a session listing or writing another launch record,
even if the kept start is gone or the session is no longer listed. Otherwise
verification reads `claude agents` once. Exactly one listed session with the
launch's name (`<project> · <kind> · <title>`), started in its start folder (the
project folder or the kept start's workspace) at or after the attempt was
accepted, and held by no other launch record, is recorded as the attempt's
launched session, with a launch record as confirmation keeps one; a readable
listing with no such session settles it as not launched (`not-listed`). Either
outcome is kept with the attempt, so it is no longer unresolved. An unreadable
listing or more than one such session leaves it unresolved and the answer says
why; Continue stays available. Recheck never launches a session. Starts whose
host offers no listing (including Codex) and ad hoc starts reread evidence and
published state without native verification. Continue posts to
`POST /__agent-launch/continue`. For a story, its latest own launch record
(same workflow, identity and source, launched since acceptance) first settles
the attempt as launched with that session; no start script or native launch runs.
A conversation whose first input remains unconfirmed retains its existing native
recovery instead. Otherwise Continue runs the same kept request under the same
attempt and the existing [start recovery](LAUNCH-START.md#mechanical-start-and-recovery)
and native rules, or answers why not; it never creates a replacement attempt.
A launch answer is shown there as it was formed, beside the card's Start or Start
session too: it says what is known and what to check, and leaves the action to
the control beside it, so an unresolved attempt's answer never directs to Start.
Restart, reload, project switch and a second page recover from that file; a
removed story keeps its recovery there. An ad hoc start shows its progress
beside Start session and its recovery in the same region, never a card. A
Start session whose start outlasted its wait says there, and beside Start
session, the workspace and branch that kept start goes on in and that it
publishes nothing; Continue resumes that workspace and branch under the
[session's kept start](LAUNCH-START.md#start-session), never a second workspace.

A failed publication-receipt recording stop stays protected and offers Continue
under Startup recovery even though publication is known. Its failed answer
appears beside Start, including after reload on the owning server, and the
recovery entry says the known publication stopped before a session. It offers
no native-check advice because no native launch occurred. After repairing the
attempt file, Continue retains the receipt before launching.

Where Continue is eligible, other story and ad hoc recovery use their host description's
optional native-check advice. Claude Code says “Check `claude agents` before
continuing: continuing starts its session again unless its kept evidence resumes
it.” Codex says “Check the dashboard history and native Codex conversations before
continuing; a recorded conversation is resumed, never submitted again.” Inline
commands retain code formatting. Without advice, the paragraph and Continue's
advice description reference are absent; the entry and its eligible controls
remain. Advice presence does not establish a launch or continuation capability.

At handoff the keyboard goes to what says the startup: the story's card, which
its status describes, or Start session's progress, never the unavailable action.
Every unavailable card action is described by the card's status; a Start waiting
for this machine's first read is described by why. A settled launch presents its
session on the card, or in the terminal for Start session, and moves the
keyboard there only while it still rests where handoff left it. Start session
leaves a terminal the developer opened during its startup as they left it,
closed or open, and moves no keyboard. A polite “Startup announcements” log says
each story's move to in progress, waiting, needs reconciliation and reconciled
once, however many reads find it unchanged.
