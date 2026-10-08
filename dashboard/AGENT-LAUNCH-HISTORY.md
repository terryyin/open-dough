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

Cards list all unclosed sessions for their project/story newest first. An open
session whose story appears in Backlog (including Preparing) or Taken appears
only inside that card across the columns, and follows the published story's
membership through reload. Such a session is excluded from Recently done,
including from a matching done-story card. Marking it done removes it from the
active card and retains it in Recently done, without changing the story's
published membership; successfully reopening it restores its active-card home.
Every other confirmed open session appears once as a local session entry in
Taken, after published Taken stories, newest launch first. This includes ad hoc
sessions and sessions whose saved story is in neither active list, even when a
matching done-story card is visible. The saved story reference, host-qualified
identity, attribution, reports and native terminal owner remain intact. A story
returning to an active list takes its open sessions back inside its card.
Adding, closing or reopening a local entry creates no published Take or story
completion.

Recently done combines published done stories by completion time and saved Done
sessions by launch time. A done-story card holds only its marked-done sessions,
newest first, with the same state and actions; later launches do not move the
card. Closed sessions without a shown done card remain standalone, including
those whose story is active. An expired published card releases its closed
sessions to standalone entries for their remaining local retention window.
Unread or failed done details retain closed-session access until regrouping.
Native Working, Needs input, Ready for review, unavailable or unknown activity,
and Mark as read, never choose a column. Existing operations recording or
clearing Done remain authoritative; refused marking or native reopening keeps
the existing placement, and native stop/rename problems remain visible beside
any observed Working despite saved Done.

<a id="recently-done-range"></a>

Recently done places its entries from the project's published done catalog,
`done/.catalog.json` beside the backlog, which the product backlog's completion
writes and its Git merge, rebase, and cherry-pick keep current; its
`catalog-done` rebuilds it after changes outside them. The catalog must agree
with the record files published at the shown revision; one that is missing,
stale, or unreadable is the column's stated gap,
never an empty list, naming its repair: run the product backlog's
`catalog-done` to rebuild it from the done records, then publish the rebuilt
catalog. A catalog read that fails says only that done stories could not be
read, and why. The list shows the latest ten top-level entries and reads
only the done records those show. **Show 10 of N older entries** (or **Show
the N older entries**) after them is the only way to show more: scrolling,
resizing, and column paging read nothing. While a batch reads, the entries
already shown stay usable and each unread story keeps its place under its
identity; a failed read says so and **Retry done stories** asks again for only
the failed records. While more than ten show, **Show latest 10** beside the
heading shows the latest ten again, reading nothing, brings the heading into
view with the keyboard at the start of Recently done, and supersedes any
pending reveal or journey. A journey ending on a done entry beyond those shown
-- Mark as done, closing a terminal or report, or a Sessions sidebar choice
resolving to a done entry, such as a Running Cursor sessions row -- extends the
list exactly through that entry, never shortening it, and lands there once
the entries through it are read; the developer's own move or another project
meanwhile wins. A refresh of the same project keeps the requested number of
entries in the new revision's order, showing the last revision's list until
the new catalog answers, and shows more only to keep the entry holding the
keyboard, or a journey's destination still being read, included; when that
entry is gone, the keyboard goes to the entry in its place. A record whose
unchanged text was read, or refused, keeps what it said; a changed or newly
shown one, or one still shown whose earlier read failed, is read at the new
revision, and an earlier revision's or another project's late answer changes
nothing shown. A reload or another project starts again at ten unless
a journey into it needs more. Opening or closing the sidebar or side panel,
resizing the panel, and narrowing the page keep the range.

Heading and edge counts use the same top-level entries: each story counts once,
each standalone session once, and nested sessions add nothing. Unread machine
records or done details leave counts explicitly incomplete and never establish
an empty combined column. Unresolved creation evidence stays reachable in its
recovery surface but is not a confirmed session count. Ad hoc labels collapse
whitespace, truncate at 40 characters with ellipsis, or use local launch time for
blank/control-character text. Only dashboard-recorded sessions appear and the
selected project's records alone determine its column entries.

An assigned session shows its original agent and human credit at the saved
allocation revision, beside its native host and requested model (or the model
recorded at that assignment). This session attribution remains after assignment
release and is separate from the story's current Preparing or Taken owner.
Later allocations, including reuse of the same agent name, cannot replace it.
Legacy records without allocation evidence and unreadable historical records
keep their known launch facts and explicitly show “Human developer unknown.”

Host adapters normalize native state for the shared cards, Recently done,
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
the card says so and shows no screen label. An unfinished recorded session the
runner does not hold says "The agent is not running." and offers Recover on the
session entry. A finished session the runner does not hold stays Activity
unknown: Cursor has no passive status for this session. Recover is absent for
held, done, and completed sessions. When resume exits because the chat could
not be loaded, Recover starts one replacement chat on that same launch record
and updates the stored session id before instructing it.

Working means active work. Typed native waits mean Needs input with a reason;
a completed reply means Ready for review, including ordinary prose questions.
Failure/interruption need attention. A blank has Awaiting first instruction.
An unloaded Codex conversation with retained history remains resumable. Confirmed
absence means Session unavailable; unreadable/unsupported data stays unknown.
Explicit unrecognized native state (a Claude Code state, or a Codex thread,
active-flag or latest-turn status) keeps its provenance, stays unsettled and
adds no attention, but entering its reading raises an alert. Unreadable metadata,
missing Codex active flags and failed latest-turn reads stay quiet.
Shared readings use the recorded host's unknown-observation wording and native
explanation; the alert loop consumes the adapter's meaning rather than checking
the host name. Startup baseline, deduplication, re-entry and done suppression
remain shared.
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
its actual session entry or containing active card, in Taken or Recently done,
until user navigation; reduced motion skips animation. Deleting a session
record moves the keyboard to the next entry in the same list (a card's
sessions, a done card's sessions, or either standalone column list), else the
previous one, else the done card or story card that held it,
else the containing column. Closing a terminal or report keeps its original
return control while usable, otherwise returns to the same session in its
current home. Membership movement alone never attaches or detaches its terminal.
