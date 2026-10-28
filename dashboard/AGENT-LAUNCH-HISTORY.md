# Dashboard session history, observation and navigation

The [agent launch contract](AGENT-LAUNCH.md#history-observation-and-navigation)
links here for local records, native-state observation, alerts and the Sessions
sidebar.

Machine records live outside repositories in
`~/.open-dough/dashboard/agent-launches.json`. Dev/preview servers read the file
afresh and serialize the complete read-and-replace operation across dashboard
processes, so concurrent launches and done marks preserve both updates.
Replacement is atomic. Unclosed records remain indefinitely; done records expire after 30 days. Unreadable files are preserved on reads and moved
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
Adding, closing or reopening a local entry creates no published Take or completion.

Recently done combines published done stories by completion time and saved Done
sessions by launch time. A done-story card holds only its marked-done sessions,
newest first, with the same state and actions; later launches do not move the
card. Closed sessions without a shown done card remain standalone, including
those whose story is active. An expired published card releases its closed
sessions to standalone entries for their remaining local retention window.
Unread or failed done details retain closed-session access until regrouping.
Each done-story card offers [Review changes](STORY-REVIEW-LANDED-RUNS.md)
from the full retained launch read, including an open session listed in Taken:
a landed run, one-shot or a claimed Story Branch Mode launch's trunk
integration, stays reviewable there after its workspace and branches are retired.
Its review uses the catalog identity and that identity as the title until its
done record supplies the title. Native availability, completion attention and
the removed seed or plan do not decide whether review is offered. The review
action and nested sessions add nothing to heading or Column paging counts.
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
only the done records those show. The saved sessions decide which stories those
entries hold, so no done record is read before the page's first read of the
sessions ends; until then the stories show as reading, and a sessions read
that ends unanswered lets the stories shown without them be read. **Show 10 of N older entries** (or **Show
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

Heading and Column paging counts use the same top-level entries:
each story or standalone session counts once; nested sessions add nothing. Unread machine
records or done details leave counts explicitly incomplete and never establish
an empty combined column. Unresolved creation evidence stays reachable in its
recovery surface but is not a confirmed session count. Ad hoc labels collapse
whitespace, truncate at 40 characters with ellipsis, or use local launch time for
blank/control-character text. A session the feedback maintenance check started
reads **Feedback maintenance** instead of its instruction, and Open Dough's
project row says beside Start session while feedback maintenance runs or stays
due ([Feedback maintenance](FEEDBACK-MAINTENANCE.md#where-it-stands)). Only dashboard-recorded sessions appear and the
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
turn, without resume, subscription or interactive ownership. At most four status
reads run per endpoint across overlapping page and alert observations; each slot
covers metadata and latest-turn history. Remaining targets queue within the same
observation deadline. Cancellation or the deadline discards queued reads as
unknown and releases active capacity; failures also release capacity without
losing individual results. Endpoint failures leave independent healthy records
readable. Cursor reads the screen of each
client its runner already holds, without starting that runner or an agent.
On a card or session entry, a held screen reads by the shared normalized
activities: a proved clarifying-question screen reads Needs input with its
question text, the follow-up prompt after a confirmed first instruction reads
Ready for review, and a working screen reads Working; a workspace-trust
screen or any other unproved held screen keeps the runner's screen label
("at the follow-up prompt", "working", or "waiting for an answer") as an
unknown reading that never alerts. Those labels are what the Running Cursor
sessions list shows. Held screens prove only working, a waiting question, or
the follow-up prompt: no held screen proves failure or interruption — a
failed command inside a turn and a cancelled turn settle to ordinary
screens — so for Cursor those states come only from an explicit unfinished
report the session submits. When the runner is not running, or cannot be
reached, the card says so and shows no screen label. An unfinished recorded
session the runner does not hold says "The agent is not running." and offers
Recover on the session entry, with no success, failure, or review claim. A
finished session the runner does not hold stays Activity unknown: Cursor has
no passive status for this session. Recover is absent for
held, done, and completed sessions. When resume exits because the chat could
not be loaded, Recover starts one replacement chat on that same launch record
and updates the stored session id before instructing it.

Working means active work. Typed native waits mean Needs input with a reason;
a completed reply means Ready for review, including ordinary prose questions.
An explicitly completed refinement whose recorded preparation workspace is
confirmed missing instead reads Completed with attention when its report has a
message, or Completed without one. Its card, sidebar, attention count and alerts
share that reading even after Mark as read. Native Working still takes priority;
unknown or existing workspace availability and other workflows retain their
native reading. This completion describes the refinement session, not the story.
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
first read quietly baselines existing waits and reviews. Each host-qualified session's
input and ready-for-review alerts stay handled across unknown, unreadable, incomplete, unrecognized,
unavailable and omitted observations, including changed summaries. Only observed
available working allows its next input alert, even with identical wording.
Review alerts rearm when confirmed known activity changes the displayed review
meaning; unavailable or unknown activity cannot establish that change.
An answer/work/new-question cycle missed entirely between successful reads may
stay quiet. Alert history is local to the server run and never replaces the
current observation shown on the page. Unknown never alerts;
unavailable/unrecognized may. Each server has its own alert baseline.

Open Dough's notification sender shows its icon and name. Explicitly prepare it
with `npm run setup-notifier:dashboard` at
`~/.open-dough/dashboard/notifier/Open Dough.app`, outside checkouts/deployments;
see [Dashboard commands](COMMANDS.md). It copies separately installed
`terminal-notifier` 3.1 or newer (tested 3.1.0, Homebrew, macOS 26.6.2) and needs
its own permission: **System Settings → Notifications → Open Dough**.
`npm run setup-notifier:dashboard -- --test` makes macOS ask; the dashboard never
prepares the sender or asks for permission. At startup and before retrying after
failure, harmless sender version/permission diagnostics post and request nothing.
Old or unrecognized copies are unavailable even if an executable exists or an
unknown option exits zero. Missing setup, unsupported copies, and denied,
not-yet-requested or refused notifications produce fixed explanations naming the
setup command/settings entry in the open Sessions sidebar; raw stderr is hidden.
Restart after setup/refresh. Observation continues; a successful notification clears a refusal.

Title/message are literal argument data with the tested helper's one-leading-
backslash escape; the sound remains Glass. `-execute` stores a fixed inline
browser callback using `/usr/bin/osascript` and a safely quoted HTTP URL argument.
Clicks need no checkout file, Node process or dashboard response. The URL origin
uses the server's actual listening loopback address and bound port, including a
dynamic port; before listening or without a usable local address, no invented
destination is sent. The shared URL contract is
`/?project=<encoded-project-id>&story=<encoded-complete-identity>`; the complete
identity includes its `#` fragment as query data. A changed title does not
change the target. Ad hoc sessions keep their notifications with only the
project parameter. No new target registry is persisted.

Receipt/dismissal do not navigate. After the sending process exits, a click
uses the current default Safari or Google Chrome, reusing a root dashboard tab
at this origin and selecting/foregrounding its window. Other ports and API or
asset pages are preserved. With no matching tab it creates one in an existing
window, or opens a window if needed. Allow browser control through the first
click's macOS prompt, or enable your default Safari or Google Chrome browser
under **System Settings → Privacy & Security → Automation → Open Dough**.
A refused inspection shows recovery instead of opening an extra tab. Open the
dashboard manually; after granting access, future notifications can reuse it.
This click permission is separate from notification-delivery availability above.
The page selects the project and stories view, waits for published membership,
then reveals/focuses the card without starting/resuming work or attaching a terminal.
Unknown projects, missing stories and failed reads have distinct destination
explanations; a later user navigation supersedes a pending reveal. A stopped
dashboard produces the browser's connection failure, not successful navigation.
Closing the server aborts every owned helper operation (startup diagnostics and
in-flight delivery); shutdown is not recorded as a notification refusal.

Sessions sidebar lists unclosed records across projects (attention first oldest first, others
newest first); badge counts attention only. Rows show ellipsized title and largest elapsed unit
(30s), state border, accessible label/tooltip. Open rows use launch age; Done rows in Recently
done sessions use completion age and say so in details/tooltip. Command+B toggles it except in
an open dialog; Ctrl+B still reaches the terminal. Sidebar state survives reload; closing while
focused there restores Sessions. Wide: sidebar/page/Side panel; narrow: sidebar overlays below
the banner, Side panel above the page. Opening a row changes project/history and reveals its
session entry or active card in Taken or Recently done until user navigation; reduced motion
skips animation. Deleting moves keyboard within the same list, else previous, else done/story
card, else column. Closing a terminal or report keeps its return control while usable, else the
session in its current home. Membership movement alone never attaches or detaches its terminal.
**Recently done sessions** and **Running Cursor sessions** sit below the open list, each
collapsed on load. Recently done lists retained Done across projects/hosts by newest completion
(identity breaks ties), initially newest 20 or all when fewer; reading and empty stay distinct.
Scrolling that list alone reveals older batches of up to 20; end of history is inert. Refresh
reconciles by identity/completion, keeping reached older sessions and admitting new ones; focused
removed rows return nearby or to the section header. Collapse, hide and project changes keep the
page range; reload starts at 20. Board Recently done keeps its own range and story-detail reads;
this section does not eagerly read older Board done-story details. Expanded optional sections share
one room owner with the open list (disposable preferred heights, independent scroll, short-window reach, page-lasting expansion/reached range; preferred sizes only across reload). Successful native reopen removes a Done row; failed reopen keeps feedback and membership.

The Side panel also holds [Review changes](AGENT-LAUNCH-REVIEW.md). On phone and tablet, Close and Maximize/Restore stay reachable beside the story identity; file browser, diff and context scroll independently; rotation keeps comparison/file/reading context; Close returns focus to the origin.
