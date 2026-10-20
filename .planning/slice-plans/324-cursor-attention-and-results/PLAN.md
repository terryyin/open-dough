# Receive Cursor attention alerts and read the result

**Identity:** SEED-052#cursor-attention-and-results
**Source:** [Receive Cursor attention alerts and read the result](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-attention-and-results)

## Goal and scope

A developer following dashboard-launched Cursor work notices when the session
needs an answer or review, finishes with attention, fails or is interrupted —
where evidence proves that state — and can read the question or result without
continually opening its terminal. Card, session entry, and desktop
notification agree; each actionable transition alerts once.

Included: honest mapping of the Cursor runner's held-screen evidence into the
shared normalized session reading; explicit completion reporting at the
plan-execution/review handoff; passive reading of a Cursor session's retained
explicit report and of the waiting question's text where the held screen shows
it; failure/interruption attention only where a supported signal proves it;
native Cursor verification, including ODF-154's retained CI identity-to-hook
check kept distinct from desktop alerts.

Excluded: a native Cursor final-answer reader from the local chat store or any
speculative Cursor API; new hook registration for dashboard attention; stopping
or renaming Cursor sessions (SEED-052#safe-cursor-session-stop); session-only
model scope (SEED-052#cursor-session-model-scope). An idle composer or process
exit alone never proves a successful outcome, and unknown/unavailable
observations never alert as activity.

## Current decisions and reuse

- Terry selected the hybrid route on 2026-10-20 during refinement: honest
  screen mapping + execution-handoff explicit reporting + retained-report
  reading, with an early paid native probe bounding the native premises. No
  native final-answer extraction and no new hooks.
- PFE / existing solutions: Claude's listing and Codex's sessions already
  normalize native state into the shared `available` activities, and Codex
  already reads a final report passively; shared presentation
  (`nativeSessionShown`, `sessionShown`) and alert selection (`alertReading`,
  `SessionAlerts`) already turn those activities into attention, counts, and
  one-shot notifications while suppressing `unknown`. Reuse that whole path:
  classify at the Cursor host boundary (`dashboard/server/hosts/cursor/`),
  keeping Cursor screen wording private to that host like other hosts' native
  wording. Do not add a second alert path, a Cursor-specific presentation, or
  a parallel state store. The Running Cursor sessions list keeps its existing
  held-screen labels; only the session observation changes.
- The explicit completion report stays independent of native activity and is
  the only route that proves a *result*: Cursor result reading reuses the
  retained report (as Claude's retained-report reader already does) instead of
  extracting a native final answer from `~/.cursor/chats/.../store.db`, whose
  blob format is not a supported dashboard source.
- Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  deterministic dashboard tests do not prove native Cursor behavior; slices 1
  and 6 own native evidence. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  is Proposed, binds nothing, and is not contradicted; no Accepted ADR
  conflicts with this scope and no North Star topic is warranted — the change
  follows the existing host-boundary pattern rather than setting new direction.
- Reporting guidance is written for the executing agent in its project
  (AGENTS.md runtime-audience rule): name the dashboard reporting context the
  launch already supplies, not Open Dough maintenance concepts.

## Outside-in proof ownership

| Source promise (seed key example) | Owner | Observable result |
| --- | --- | --- |
| 1. Question → *Needs input*, question text readable, one alert; resume re-arms | 2 (deterministic), 6 (native) | Fake-Cursor journey shows waiting reading/note and one notification; native probe/verification observes the real clarifying screen |
| 2. Finish to follow-up + execution-handoff attention report → *Ready for review*, report alerts once and is readable inline and in the final-report panel | 2, 3, 4 | Entry/card/panel read the report without opening the terminal; alert fires once |
| 3. Quiet completion stays quiet | 2, 4 | Completed-without-message report (and plain Land/Wrap-Up completion) yields no attention, no unread report, no notification |
| 4a. Proven failure/interruption → failed/stopped reading, explanation, one alert | 5, 6 | Only the signal slice 1 proved is mapped; its journey alerts once |
| 4b. Vanished client / process exit alone → honest unknown, no claim | 2, 5 | Reading stays unknown/agent-not-running; no success, failure, or review alert |
| 5. Runner not running/unreachable → existing wording, no attention/alert; Codex and Claude unchanged | 2 | Existing runner-state specs and other hosts' session/alert specs stay green |
| Retained verification: native notification/report journey + ODF-154 CI identity-to-hook, kept distinct | 1, 6 | Native evidence (or precise remaining gap) recorded; ODF-154 updated without rewriting pre-fix occurrences |

Proof boundaries: focused dashboard Playwright specs at the real page/server
boundary with the fake Cursor runner (`dashboard/tests/support/fakeCursor.ts`)
for deterministic slices, plus `npm run typecheck:dashboard`; guidance slices
use the existing execute-plan guidance tests. Whole-suite dashboard runs stay
CI's unless a changed shared fixture makes focused selection unrepresentative.

## Decisive premises and preparation observations

Named checkout: this preparation worktree,
`/Users/terryyin/git/open-dough/.worktrees/receive-cursor-attention-alerts-and-read-the-res`,
base `8fde19dfa255c011c9a633e96ce2cc75d48d615e`, 2026-10-20.

Settled by tracing the consuming operations in this checkout:

- Cursor observations can never alert today: `observeCursorSessions`
  (`dashboard/server/hosts/cursor/sessions.ts`) wraps every runner screen
  label as `{kind:"unknown", label}`, `nativeSessionShown` gives labeled
  unknowns `needsAttention:false`, and `alertReading` returns `undefined` for
  `unknown`; only unread explicit reports alert. This is the reported gap's
  mechanism, not a notification-delivery failure.
- The runner already holds each client's full screen text
  (`TerminalAttachments` held reads) and `cursorSessionLabel`
  (`idleScreen.ts`) collapses it to working / waiting-for-an-answer / at the
  follow-up prompt (a clarifying-question screen already reads as waiting and
  is excluded from the idle composer); `heldCursorSessions` joins held clients
  to launch records. No new observation transport is needed for those three.
- The Cursor boundary (`cursorHost.ts`) supplies no `readResult`, so the
  final-report request refuses Cursor; Claude's retained-report reader
  (`sessionAdmission.ts`) is Claude-gated even though a Cursor record retains
  the same `completion` report and a `continuation.workspace`. Explicit
  report text is already rendered inline for any host
  (`SessionAttentionMessage`).
- Launch reporting instructions (`reportingInstruction.ts`) describe reporting
  only for Dough Land or Story Wrap Up; `dough-execute-plan`'s
  finish-or-stop guidance does not require a report at the execution-complete
  handoff, and a completed report with no attention message is deliberately
  quiet (`completedWithoutAttention`).

Left to the early probe (slice 1), because only a paid native run reaches them:

- Which real Cursor screens distinguish a clarifying question, a finished
  turn at the follow-up prompt, a failure, and an interruption, and whether
  the question text is extractable from the held screen at dashboard scale.
- Whether any held screen proves failure/interruption at all; if none does,
  slice 5 narrows to its honest-unknown half and the limit is recorded.
- ODF-154's released CI identity-to-hook path in native Cursor (unverified
  since 0.3.57); installation alone proves nothing.

Local unpaid observations made: `cursor-agent --version` →
2026.10.19-6bbf2c4; `~/.cursor/chats/<hash>/<chat-id>/` holds `meta.json` plus
a SQLite `store.db` of opaque blobs (a supported reader is out of scope per
the selected route). No native session was launched during preparation.

## Ordered slices

### 1. Probe native Cursor attention screens and the CI hook path
Type: Behavior
Status: done
Proof: A bounded paid native run of a dashboard-launched Cursor session that
asks a clarifying question, resumes, and finishes to review — plus a failing
and an interrupted run — with the runner's held screen recorded at each state;
and one managed-delivery CI observation attempt through the released
identity-to-hook path. Results recorded in this plan's learnings; any state
no screen proves is named explicitly.

Behavior: Given a dashboard-launched Cursor session, when it waits for an
answer, resumes, finishes, fails, or is interrupted, the maintainer observes
which held screens (and question text) the runner actually shows, settling
what slices 2 and 5 may honestly map. Failure of a premise here stops the
dependent mapping and replans it; it does not block slices 3–4. Keep CI
observation evidence distinct from desktop-alert evidence, per ODF-154.

**Learnings — native probe, 2026-10-20 (cursor-agent 2026.10.19-6bbf2c4,
production runner on `127.0.0.1:49444`, dashboard at `127.0.0.1:4173`):**

Method: two bounded dashboard-style launches in empty scratch workspaces
(`/tmp/dough-probe324-a`, `/tmp/dough-probe324-b`, no files edited) through
the runner's own protocol — `POST /exec` `create-chat`, then `POST /keep`
with `cursor-agent --workspace <dir> --resume <id>` and one short
instruction, exactly as `launchCursor` does. Held state was read read-only
from `GET /sessions` (label + `workspaceTrust` only; full screen text is
not exposed there) and from the runner's `/attach` WebSocket replay, which
is the held screen a joining terminal receives. Both probe clients were
hung up afterwards; the runner again holds only the seven pre-existing
sessions. Session 1 (`94d9baa2…`): trust → working → waiting (clarifying
question) → answered via attach (`Space`, `Enter`) → working
(“You selected Red.”) → `at the follow-up prompt`. Session 2 (`1d048c24…`):
trust → instruction initially sat unsubmitted in the composer and needed
one manual `Enter` from the attach (launch-delivery observation, not a
screen state) → failing turn → queued `sleep 45` turn → `Ctrl-C`.

States proved by a held screen, with the observing signal:

- *Working*: spinner prose `Working`/`Running` plus `ctrl+c to stop`;
  `/sessions` label `working`. Also observed live for this execution's own
  coordinator session (`3edced0c…`, `working` throughout).
- *Waiting for an answer (clarifying question)*: label `waiting for an
  answer`, and the attach replay showed a boxed question screen whose
  header is the agent-chosen title (`Color preference`), then
  `Question 1 of 1`, `1. Which color do you prefer, Red or Blue?`,
  options `› [ ] Red` / `[ ] Blue` / `[ ] Other: (type to answer)`, and
  footer `↑/↓ option · ←/→ question · Space select · Enter next/submit ·
  Esc to skip`. Question text is therefore present in held screen text,
  but the literal marker `Clarifying Questions` never appears in the real
  screen (0 occurrences in the full capture) — that wording exists only
  in the fake fixture (`dashboard/tests/fixtures/fake-cursor-attach`).
  Slice 2 may carry `waitingFor` only under a structural extraction rule
  (e.g. a `Question N of M` line plus the `Space select · Enter
  next/submit` footer, taking the numbered question lines), never by
  searching for `Clarifying Questions`; without that rule it may not
  carry question text. The premise as phrased around that marker fails.
- *Finished to review*: after the answer the session worked, then the
  screen settled to `→ Add a follow-up` with no `ctrl+c to stop`; label
  `at the follow-up prompt` (held from 02:04:10Z until hangup).
- *Workspace trust*: a fresh workspace first shows `Workspace Trust
  Required` / `Do you trust the contents of this directory?` /
  `[a] Trust this workspace`. Its `/sessions` label is also
  `waiting for an answer`; only the separate `workspaceTrust: true` field
  distinguishes it, and `heldCursorSessions` does not carry that field.
  Slice 2 must not read a trust screen as *Needs input*.
- *Failure*: no failure screen exists in this evidence. The failing turn
  ran `$ false exit 1 • 184ms` as an ordinary tool line, the agent
  replied “The exit code was 1.”, and the turn finished toward the
  follow-up prompt. A failing command inside a turn proves nothing at
  session level.
- *Interruption*: `Ctrl-C` during `sleep 45` left `$ sleep 45
  Cancelled • 3.7s` in history, a `→ Add a follow-up` composer, and
  `Press Ctrl+C again to exit`; no closing agent prose followed. That is
  visually an ordinary follow-up screen, and `/sessions` kept reporting
  `working` for minutes afterwards — the viewport history line
  `Running false to check its exit code.` contains the `Running` working
  marker, so substring classification can pin a finished/interrupted
  screen to `working`. No held screen proves failure or interruption.
  Slice 5 therefore narrows to its honest-unknown half (plus the explicit
  unfinished-report route from slice 4); mapping `Cancelled`/`exit N`
  history lines would guess, since a successful turn can quote the same
  lines.

Unproved / named gaps: no distinct failure screen and no distinct
interruption screen were observed (above); a process exit or vanished
client was not separately probed and remains unproved by design (seed
example 4b). The fake fixture's waiting screen does not match the native
one, so deterministic journeys alone cannot settle extraction wording.

CI identity-to-hook (ODF-154), kept distinct from all desktop-alert
evidence above: `CURSOR_CONVERSATION_ID` is set in this coordinator
session's environment (36 chars; it is not one of the runner's held
session ids, which are `create-chat` ids). The installed execute-plan
scripts resolve a Cursor coordinator from that variable:
`ci-host-bridge.mjs` `hostIdentity.cursor.variable` and
`resolveHostSession` (`src/skills/dough-execute-plan/scripts/ci-host-bridge.mjs:31-46`,
same in the installed `.claude/skills/` copy), consumed by
`execution-increment-observation.mjs:155,184`. This is installation and
identity availability only: no managed delivery was run by this probe
(the coordinator owns delivery), so the identity-to-hook path is **not**
verified. The observation attempt is the coordinator's first slice
delivery in this execution; until its delivery receipt exists, ODF-154
stays unverified and no watch start is inferred.

### 2. Read held Cursor sessions as waiting, review, or working
Type: Behavior
Status: done
Proof: Fake-Cursor Playwright journeys (held-screen session states, card
counts, session alerts) show a waiting screen reading *Needs input* with the
question note where slice 1 proved it extractable, a follow-up screen after
confirmed first instruction reading *Ready for review*, a working screen
reading *Working*, each actionable entry alerting exactly once and re-arming
after work resumes; runner-down and vanished-client cases keep today's honest
wording with no alert. Existing Codex/Claude session and alert specs stay green.

Behavior: Pre-condition → trigger → result per seed key examples 1, 2 (native
half), 3 (native half), 4b, and 5: `observeCursorSessions` returns normalized
`available` activities for held clients instead of labeled unknowns, guarding
review to sessions whose first instruction was confirmed delivered, and
carrying the waiting question text as `waitingFor` only where slice 1 proved
the screen yields it. Presentation, attention counts, and notifications agree
because they already share the normalized reading.

Refined by slice 1's probe: the runner's `/sessions` read must also carry the
evidence classification needs — the `workspaceTrust` flag (a trust screen
labels `waiting for an answer` but must not read as *Needs input*) and the
held screen text for waiting screens, so the Cursor boundary can extract the
question under slice 1's structural rule (`Question N of M` plus the
`Space select · Enter next/submit` footer; the literal `Clarifying Questions`
never appears natively and the existing `showsFollowUpLine` exclusion based
on it must be revisited). Working classification must not be pinned by
`Running`/`Working` substrings in scrollback history (slice 1 observed a
finished screen mislabeled `working` for minutes); classification needs the
live working markers (`ctrl+c to stop` / current spinner line), not any
historical occurrence.

### 3. Read a Cursor session's retained report and waiting question passively
Type: Behavior
Status: done
Proof: Session-result journeys show a Cursor session with an attention report
reading that report's text in the final-report panel (receipt-bound, as other
hosts) without opening or resuming the terminal; a Cursor session with no
report message gets the honest unavailable explanation naming that Cursor
provides no native final report here; a read report or marked-done session
behaves as it does for other hosts.

Behavior: Given a kept Cursor session, when the developer opens its final
report, the retained explicit report answers where one exists (extending the
retained-report reader past its Claude gate, using the record's saved
workspace), and otherwise the panel says plainly that no retained final report
is available and the saved conversation is unchanged. Reading never takes
interactive control, resumes, or marks the session done.

### 4. Report attention at the execution-complete handoff
Type: Behavior
Status: done
Proof: Execute-plan guidance tests show the finish path instructing a
dashboard-launched execution that finishes with attention needed (review
reminder or unfinished work) before Land/Wrap Up to submit that outcome with
its message through the supplied reporting command and await its receipt,
while quiet success sends nothing there and still completes plainly at
Land/Wrap Up; dashboard specs show such a handoff report alerting once and
reading as *Ready for review*/unfinished apart from native activity.

Behavior: Given a dashboard reporting context and execution completing before
Land/Wrap Up, when the result needs the developer (finished with a reminder,
or unfinished), the agent submits `completed`/`unfinished` with the exact
attention message at that handoff; when nothing requires attention it submits
nothing, preserving intentionally quiet closure. This extends the existing
report channel; it does not stop the session or declare the story complete.

### 5. Read proven Cursor failure and interruption honestly
Type: Behavior
Status: done
Proof: For each failure/interruption signal slice 1 proved, a fake-Cursor (or
recorded-screen) journey shows the failed/stopped reading, a usable
explanation, and exactly one alert; for every unproven vanishing (client no
longer held, process exit alone) the reading stays unknown/agent-not-running
with no success, failure, or review claim. If slice 1 proved no signal, this
slice delivers only that honest-unknown proof and records the limit in the
dashboard's maintained host documentation.

Behavior: Per seed key example 4: a held screen (or explicit unfinished
report, already covered by slice 4) that proves failure or interruption reads
as failed/stopped with its explanation; anything weaker stays unsettled. Stop
and rename remain story 2's work; nothing here claims native termination.

Refined by slice 1's probe: no held screen proved failure or interruption
(a failing command is an ordinary tool line; a Ctrl-C interruption settles
to an ordinary follow-up screen), so this slice delivers only its
honest-unknown half — vanished/unproven states stay unknown with no claim —
plus the limit recorded in the dashboard's maintained host documentation,
and its fake-Cursor journey proving no failure/review alert fires for them.
The explicit unfinished-report route remains slice 4's.

### 6. Verify the Cursor journey natively and settle ODF-154's retained check
Type: Behavior
Status: done
Proof: A native Cursor run through the dashboard — launch, clarifying
question (alert + readable question), resume, finish to review with handoff
report (alert + readable result), quiet completion (no alert), and the
failure/interruption behavior slice 5 proved — each observed on the real
dashboard with notifications enabled; ODF-154's CI identity-to-hook delivery
observed or its precise remaining gap recorded. ODF-154 is updated with this
evidence (or gap) after delivery without rewriting its pre-fix occurrences.

Behavior: Given the delivered dashboard on a real machine, when the journeys
above run in native Cursor, the developer-visible indicators, notifications,
and readable texts match the seed's key examples, and deterministic-test
evidence is not substituted for this native proof (ADR 0005). Missing native
proof stays pending and named; it is not marked passed by this slice's
deterministic companions.

**Learnings — native verification, 2026-10-20 (cursor-agent
2026.10.19-6bbf2c4, this worktree's dashboard build):**

Method and isolation tradeoff: the delivered dashboard was built from this
worktree (`npm run build:dashboard`) and previewed on `127.0.0.1:4174`
(production 4173 untouched) with an isolated `HOME`
(`/tmp/dough324-s6-home`), so its project list, launch records, alert loop,
and Cursor runner (isolated runner on `127.0.0.1:65228`, pid 25999) were its
own and the production runner (`127.0.0.1:49444`, pid 1980) and the
coordinator's sessions were never touched. Auth was reached through links
into that home (`.cursor`, `.config`, the login keychain), so the agent was
the real signed-in `cursor-agent`; a logging shim on the server's `PATH`
recorded every `terminal-notifier` invocation and then exec'd the real
Homebrew `terminal-notifier` 3.1.0, and the server reported
`alerts: {available: true}` throughout. Evidence files are retained under
`/tmp/dough324-s6-evidence/` (numbered below). One scratch project
(`scratch324`, workspace `/tmp/dough324-s6-proj`, a throwaway git repo with
this repo's installed `dough-execute-plan` skill copied in for the reporting
command) was configured; no real project was launched against. Two new
Cursor conversations were created: session A consumed no model turn (below),
session B ran the whole journey; both probe clients were hung up and both
records deleted afterwards, the isolated server and runner were stopped,
and the production runner still held its 7 sessions at the end.

Session A (`97fee5cc…`, unpaid, no turn ran): the first launch sat at
Cursor's `Press any key to log in...` screen because the isolated home
could not reach the login keychain; the dashboard read it as
`{kind:"unknown", label:"waiting for an answer"}` (the held runner label)
and sent no notification. After the keychain link, its client was hung up
through the runner: the dashboard then read
`{kind:"unknown", label:"The agent is not running."}` with no completion
and no notification (`02-a-vanished-unknown.json`, notifier log) — the
honest-unknown half of slice 5 observed natively. A dashboard Recover
attempt then honestly refused at the fresh workspace's trust screen
("Workspace trust is required. No agent was left running…",
`03-recover-a.json`); the same conversation was re-kept through the runner,
trusted with `a` via the runner's `/attach` socket, and hung up, which
pre-trusted the scratch workspace. While the trust screen was held, the
dashboard again read labeled unknown and alerted nothing.

Session B (`ca909019…`, the paid journey), all observed on the real
dashboard at `http://127.0.0.1:4174/?project=scratch324`:

- *Working*: runner label `working`; dashboard
  `{kind:"available", activity:"working"}`, first input `confirmed`
  (03:10:57Z, `06-poll-b-waiting.txt`).
- *Clarifying question*: by 03:11:02Z the runner labeled it
  `waiting for an answer` with the held question screen, and the dashboard
  read `{activity:"waiting", waitingFor:"1. Which color do you prefer, Red
  or Blue? … │"}` (`07-b-waiting.json`). The page's Taken card read "Needs
  input: 1. Which color do you prefer, Red or Blue? │" and the Sessions
  button badged "1 session needs attention". Exactly one desktop alert was
  sent at 03:11:01Z: title `Scratch324 · PROBE324-B…`, message
  `Needs input: 1. Which color do you prefer, Red or Blue? … │`
  (`notifier.log`). Named imperfections: the extracted `waitingFor` kept
  trailing box padding and the `│` border character — fixed in this slice's
  delivery (extraction now strips trailing box border/padding, proved by the
  native-shape classification case) — and the native screen
  never showed the fake fixture's `Clarifying Questions` marker (the
  terminal replay instead showed Cursor's own `AskQuestion Clarifying
  Questions (1)` history line only after answering).
- *Resume/answer*: Red was selected through the runner `/attach` socket
  (`Space`, `Enter`, slice 1's technique; `08-answer-attach.txt`); the
  reading returned to `working`, re-arming alerting, with no extra send.
- *Finish to review with handoff report*: the agent wrote only
  `handoff-b.txt` in the scratch workspace and submitted the supplied
  reporting command; at 03:12:33Z the dashboard held completion
  `{outcome:"completed", message:"RESULT-324-B: You selected Red. Ready
  for your review.", receipt:"c011bdf1…"}` with activity `review`
  (`09-b-review.json`). The card read "Ready for review" plus "Unread
  report: Completed with attention" with the exact message in its
  Attention message region. Two sends fired for this combined transition,
  each alertable once: `Unread report: Completed with attention`
  (03:12:34Z) and `Ready for review` (03:12:37Z). The final-report read the
  panel performs (`GET /__agent-launch/result?source=scratch324&host=
  cursor&session=ca909019…`) answered `{kind:"available", receipt:
  "c011bdf1…", text:"RESULT-324-B: You selected Red. Ready for your
  review."}` (`10-b-result-panel.json`).
- *Quiet completion*: a follow-up typed into the same session asked for a
  quiet handoff report; at 03:14:30Z a second completion arrived with
  `outcome:"completed"` and an empty message (`12-poll-quiet.txt`). No
  further notification was sent (send count stayed 3 over 45+ seconds of
  3-second alert polls), the card settled to "Done" under the quiet
  automatic-completion rule, and the Sessions attention badge cleared.
- *Vanished client, again*: hanging B's client up through the runner left
  `{kind:"unknown"}` with the quiet completion retained and still no new
  send — no success, failure, or review claim was added.

Unproved / named gaps: (1) Actual macOS banner *display* cannot be observed
from this harness; what is proved is that the real `terminal-notifier`
binary accepted exactly the sends above (the shim exec'd it, and the
server's availability stayed `available:true`, which a refusal would have
cleared). (2) The final-report *panel widget* was not clicked through: for
a still-attachable Cursor session the card offers Open terminal rather
than Read final report, so panel proof here is the panel's own result
endpoint answering with receipt and text, plus the inline card reading;
panel-widget clicking remains deterministic-test evidence only.
(3) No distinct failure or interruption screen exists (slice 1), so none
was mapped or alerted: the interrupted/failing-turn half stays at its
honest-unknown limit, observed above only as vanished-client unknown.
(4) ODF-154's retained CI check is settled separately in that finding:
this execution's five managed deliveries each reused the mailbox
`watch-w1fH6s` whose `owner` claim recomputes exactly from the
coordinator's `CURSOR_CONVERSATION_ID` conversation, with no manual
observer start — distinct from every desktop-alert observation above;
the coordinator's own CI completion wait is still pending and is not
claimed here.

## Current decisions

- Classification lives in the Cursor host boundary; shared presentation and
  alert code are not given Cursor-specific branches.
- Review requires a held follow-up screen on a session whose first instruction
  was confirmed delivered; slice 1's screens may tighten this guard.
- The retained explicit report is Cursor's result source; no chat-store or
  speculative-API reader is built, and the panel says so when no report exists.
- Failure/interruption mapping is capped at what slice 1 proves; the
  honest-unknown fallback is a deliverable, not a failure of the story.
- Slices 3 and 4 are independent of the probe and may proceed if slice 1's
  native evidence is delayed; slices 2 and 5 consume its recorded learnings.
