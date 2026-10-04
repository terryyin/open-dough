# Dashboard session history, observation and navigation

The [agent launch contract](AGENT-LAUNCH.md#history-observation-and-navigation)
links here for local records, native-state observation, alerts and the Sessions
sidebar.

Machine records live outside repositories in
`~/.open-dough/dashboard/agent-launches.json`. Dev/preview servers read the file
afresh and serialize the complete read-and-replace operation across dashboard
processes, so concurrent launches and done marks preserve both updates.
Replacement is atomic. Unclosed records remain indefinitely; done
records expire after 30 days. Unreadable files are preserved on reads and moved
to `.unreadable` (with timestamp suffix for an existing copy) on the next write.
Page/server restarts preserve native identity, workspace, options and evidence.

Cards list all unclosed sessions for their project/story newest first. Recent
sessions list every selected-project record newest first, including done or
stories absent from published lists; it appears only with readable published
work. Ad hoc labels collapse whitespace, truncate at 40 characters with ellipsis,
or use local launch time for blank/control-character text; no card lists them.
Reading sessions is distinguished from none kept. A session still navigates
when its story changes stage or disappears. Only dashboard-recorded sessions
appear; another project's records never count on a card.

Host adapters normalize native state for the shared cards, Recent sessions,
sidebar/counts and alerts; observations are never persisted. Host descriptions
supply unknown-reading wording, and adapters distinguish explicit unfamiliar
native states from incomplete reads for shared alerting. Claude reads one machine
listing. Codex groups
recorded targets by saved endpoint, reads metadata and only the latest needed
turn, without resume, subscription or interactive ownership. Endpoint failures
leave independent healthy records readable. Cursor reads the screen of each
client its runner already holds, without starting that runner or an agent.
The card shows that screen's label: "at the follow-up prompt", "working", or
"waiting for an answer". When the runner is not running, or cannot be reached,
the card says so and shows no screen label. A recorded session the runner does
not hold stays Activity unknown: Cursor has no passive status for this session.

Working means active work. Typed native waits mean Needs input with a reason;
a completed reply means Ready for review, including ordinary prose questions.
Failure/interruption need attention. A blank has Awaiting first instruction.
An unloaded Codex conversation with retained history remains resumable. Confirmed
absence means Session unavailable; unreadable/unsupported data stays unknown.
Explicit unrecognized native state keeps its provenance, stays unsettled and
adds no attention, but entering its reading raises an alert. Unreadable metadata,
missing active flags and failed latest-turn reads stay quiet.
A done mark suppresses attention, showing Working while working, Done otherwise.
Native structured waiting must be supplied by the configured tool/policy; a
never-policy run does not establish approval parity.

The page reads machine records on load, while visible every 15 seconds, and
when visible again. Attention counts share each entry's reading. The server
also watches independently every 15 seconds, notifying macOS with Glass when an
unmarked session enters an alerting native reading, and once, as “Unread report:
<completion label>”, when its report arrives, whatever the native reading; its
first read establishes baseline, changed reason alone never repeats, and
returning through working allows a new alert. Unknown never alerts;
unavailable/unrecognized may. `osascript` receives argument text, never
interpolated script; absence/refusal is reported in the open sidebar, and the
watcher continues. Each server has its own alert baseline.

Sessions sidebar lists unclosed records across projects: attention first oldest
first, others newest first. Sessions button badge counts attention only. Rows
show ellipsized title and largest elapsed unit, updated every 30 seconds, with
state border plus accessible label and tooltip. Command+B toggles it except in
an open dialog; Ctrl+B still reaches the terminal. Sidebar state survives reload
in browser storage. Closing while focused there restores the Sessions button.
Wide layout is sidebar/page/terminal; narrow sidebar overlays below the banner,
terminal stacks above page. Opening a row changes project/history and reveals
its card or Recent entry until user navigation; reduced motion skips animation.
