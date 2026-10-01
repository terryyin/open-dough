# Execution state and native observations

Part of [plan 192](PLAN.md); retains active execution proof and recovery context.

## Slice 1 accepted native observations — 2026-10-01

One disposable fixture/thread was observed under the accepted execution claim.
The coordinator inspected the driver, exact request/result chronology, CLI
outputs, installation result and actual report before accepting the decisive
feasibility proof. Structured waiting remains separately pending as below. Recovered plan 189's native
evidence was assessed first: its same-ID CLI/useful draft and launch-client loss
remain useful, but all-client closure and blank durability were outside it.
SEED-067's stable-home daemon repair is present; no daemon restart/update or
settings change was performed. ADR 0005 owns separate native acceptance;
ADR 0003/0004 require the real released installation used here.

Preparation/coverage was bounded to one fixture and one conversation, 15-second
RPC deadlines and 60-second short-turn observation deadlines, no automatic
retry. Breadth covered blank/first input, PTY interaction, passive reads,
all-client loss and done/reopen; depth focused continuity and targeted stop;
final confirmation/cleanup was reserved. This operation budget is not a project
slice-size exception. No production code or permanent test was added.

- Fixture root: `/Users/terryyin/git/open-dough/.worktrees/complete-codex-dashboard-sessions/.native192-iVtIux`;
  native workspace: its `fixture` directory. Setup commands, from the execution
  checkout: `git init -q <fixture>` and `bash install.sh --target <fixture> --source /Users/terryyin/git/open-dough --platform codex`.
  Installer succeeded with actual tagged v0.3.51 in the supported native layouts;
  hook registration is real. Managed copies were not hand-synchronized.
- `codex --version` and `codex app-server daemon version` both report 0.159.3.
  Saved existing endpoint: `unix:///Users/terryyin/.codex/app-server-control/app-server-control.sock`.
  `thread/start` supplied only `{cwd:<fixture>}`; response retained configured
  `gpt-6.1-sol`, high reasoning, `never`, `dangerFullAccess`, `ephemeral:false`.
  No model, approval, sandbox, authentication or trust override was supplied.
- Disposable driver: `node .native192-iVtIux/probe.mjs`, outer PTY 68217.
  It uses the existing installed `ws` and `@lydell/node-pty`, captures literal
  RPC/PTY operations and responses in `protocol.jsonl`, and captures four
  ordinary CLI attachments in `cli-1.log` through `cli-4.log`.
  The coordinator inspected `identity.json`, `install.log`, native generated
  schema, fixture report and transcripts. Passing disposable artifacts were
  then removed under ADR 0005; the judged operations/results remain here and
  native history is retained.

| Requirement | Literal native operation and observed result |
| --- | --- |
| Blank durability and absence of fabricated input | Initialized WebSocket; `thread/start {cwd:<fixture>}` created `01a0f54a-8c0b-7792-a2b1-440c5a0d4081`, idle, turns `[]`. Closed sole creating WebSocket. Fresh passive `thread/read {threadId,includeTurns:false}` retained same ID/CWD, idle, no turn. Blank CLI attachment/reconnection retained that ID and composer. No `turn/start` was sent by the driver. Before the first CLI resume, `thread/read(includeTurns:true)` and `thread/turns/list` both refused with `{code:-32601,message:"list_turns is not supported yet"}`. After native CLI resume, `thread/turns/list {threadId,limit:1,sortDirection:"desc",itemsView:"notLoaded"}` returned `data:[]`. Unreadable empty history must therefore remain distinct from confirmed absence, including this fresh blank variant. |
| Ordinary CLI readiness, input/output/resize | Each attachment spawned `codex resume --remote <saved endpoint> --cd <fixture> --no-alt-screen 01a0f54a-8c0b-7792-a2b1-440c5a0d4081` with `TERM=xterm-256color`, initial 100x30 PTY. Spawn initially displayed `Resuming session…` and the installed hook-review modal, so spawn alone is not successful native readiness. Selected read-only `Review hooks`, then Esc closed its view: Active 0/Review 1 remained, with no Trust/Trust all/Continue without trusting/bypass choice. Composer/transcript replay and later input acknowledgment established actual attachment. PTY resize to 72x22, 80x25 and 120x36 repainted output. |
| Useful first input and passive active/completed reads | Typed exactly `Create REPORT.md summarizing the installed local Open Dough skills that suit story refinement and execution. Read their local instructions, keep the report brief, and do not invoke a workflow or publish anything.` then a separate Enter after paste settled. Passive metadata became `{type:"active",activeFlags:[]}`; paged summary contained that exact user message once in turn `01a0f54c-6ed6-7970-9c53-f5ae1dc899a6`, `inProgress`. CLI showed native local skill reads and report creation; actual REPORT.md contains a useful linked refinement/execution summary. After 42.250 seconds, passive metadata was idle and latest turn completed with the matching final answer. This is useful native file work, not proof that a workflow skill was invoked. |
| All fixture clients lost while active, same-ID/history recovery | Typed `Run a local sleep 25 command, then append one brief sentence to REPORT.md explaining the distinction between a completed assistant reply and completing a story. Do not invoke a workflow or publish anything.` then Enter. Saved target metadata was active; latest turn `01a0f54d-7b82-7e01-9ac8-7cf3b473ff0d` was inProgress. At 10:31:39.614 Singapore, closed the sole passive WebSocket; at 10:31:39.615 sent CLI SIGHUP. Native PTY exit signal 1 and `ps -p 57939 -o pid=,command=` returning exit1/no output proved the fixture CLI ended. No remaining driver WebSocket or CLI existed. At 10:31:53.092, fresh passive connection still returned the original saved ID/CWD and same inProgress turn. CLI reattached with the exact saved arguments, replayed original prompt/report and second prompt, then displayed successful native `sleep 25` and file append. Same turn completed in 46.382 seconds and the actual paragraph exists. No input was resent, thread fork requested, turn interrupted or daemon stopped for detachment. |
| Targeted native rename and explicit active interruption | Third CLI prompt: `Run a local sleep 45 command, then reply briefly that the wait finished. Do not change files, invoke a workflow, or publish anything.` Observed active target/latest inProgress turn `01a0f54e-fb26-7931-a408-2f199602c1c5`. Separate control connection issued `thread/name/set {threadId:"01a0f54a-8c0b-7792-a2b1-440c5a0d4081",name:"Done · Native lifecycle fixture"}`; `{}` acknowledgment and passive read retained exact name while active. Then `turn/interrupt {threadId:"01a0f54a-8c0b-7792-a2b1-440c5a0d4081",turnId:"01a0f54e-fb26-7931-a408-2f199602c1c5"}` returned `{}`; passive metadata became idle and that exact turn became interrupted after 25.377 seconds. No slash command, archive/history deletion, or shared-daemon operation was used. |
| Reopen retains original history and accepts a fresh turn | Closed control/passive connections and detached CLI with SIGHUP. Fresh passive read retained saved ID/CWD/name; paged history showed completed/completed/interrupted turns. Fourth CLI attachment used the original saved ID/args and replayed those turns; a native notLoaded→idle notification occurred during its resume. Typed `Read the final paragraph of REPORT.md, summarize its meaning briefly, then ask whether I want to change it. Do not edit files or invoke a workflow.` then Enter. Turn `01a0f550-574a-77e0-8b5c-b9987b4dc116` completed in 12.345 seconds, with idle metadata, final message ending `Would you like to change it?` and `questions:null`. Ordinary prose questions therefore do not establish typed waiting. |
| Passive reads do not acquire interactive control | The `passive` connection sent only initialize/initialized, thread/read and thread/turns/list; it never sent resume/start/name/interrupt/ownership operations. The ordinary CLI accepted first and later instructions while it was connected. Read-only metadata and limit1/notLoaded turn reads were sufficient for active/completed/interrupted observations; complete history was read only for final continuity confirmation. |
| Unloaded retained conversation remains readable | After final completion, closed passive and sent CLI SIGHUP, then let the native runtime unload while recording evidence. A fresh initialized passive connection returned original ID/CWD/name with `{type:"notLoaded"}`; `thread/turns/list {threadId,limit:1,sortDirection:"desc",itemsView:"notLoaded"}` still returned the final completed turn. No resume was sent. The read did not change notLoaded to active or require interaction. |

Native rollout path from thread/start is
`/Users/terryyin/.codex/sessions/2026/10/01/rollout-2026-10-01T10-28-19-01a0f54a-8c0b-7792-a2b1-440c5a0d4081.jsonl`;
its persisted session metadata matches the saved ID. Native thread/history are
retained. The daemon still reports running 0.159.3 after targeted stop.
The final passive connection was closed and disposable driver PTY 68217 exited
0; all four fixture CLIs had exited after owned SIGHUP. No native client or
model work remains running in this probe. Passing temporary files were removed after coordinator acceptance; no shared
daemon or native conversation history was removed.

Pending coverage: native approval/request-user-input structured waiting was not
supplied under the existing `never` policy; it is unexercised, not passed.
Native failure-state semantics remain the earlier failed-model history evidence,
not a new fabricated failure. Desktop-app handoff/ownership remains SEED-067,
outside this CLI lifecycle proof. Browser/WS/readiness/done marks and skill
execution/ad hoc acceptance remain later slices; this probe does not pass them.

## Retained execution identity

- Authority: Terry invoked dough-execute-plan 192 on 2026-10-01. Story Branch Mode;
  identity SEED-052#use-codex-from-dashboard, publisher codex-plan-192-20261001,
  assigned agent joey-chan. No numeric project slice target/limit supplied.
  No new overrun-replanning grant was supplied; preserve existing planning
  authority and stop on a changed outcome.
- Created owned execution checkout:
  /Users/terryyin/git/open-dough/.worktrees/complete-codex-dashboard-sessions,
  branch codex/complete-codex-dashboard-sessions. Originating/integration checkout:
  /Users/terryyin/git/open-dough. Starting revision
  d69ccb4e2b57087f0064f5a637a79562cc2ebd00.
- Accepted claim d0d3a12d9f220b3d6eaa3789c0b53e9bdcb5e6be published on
  origin/main; execution branch published at that claim. Default checkout advanced.
  Claim CI on trunk is unobserved, distinct from the execution branch observer.
- Exact-checkout setup: npm ci then npm run typecheck:dashboard passed.
  Project selective formatter: npm run format; check-only pre-commit hook owns
  npm run --silent lint -- --staged.
- Product code is unchanged from planning's reviewed
  3ec2602fd891712c036f498b06a89d92ca75ac78 through the claim; existing PFE and
  deterministic baseline evidence is retained. SEED-067's preparation allocation
  has landed; no product fix from that work is present at this starting revision.
- Publication target for increments: origin refs/heads/codex/complete-codex-dashboard-sessions.
  Slice 1 accepted delivery: 22ff91b009fb90311cf71230e63f760e0fefdedb, same target.
  Previously published base for slice 2 delivery: 22ff91b009fb90311cf71230e63f760e0fefdedb.
- CI_OBSERVER: GitHub Actions terryyin/open-dough, verified selector ci.yml,
  target codex/complete-codex-dashboard-sessions, coordinator codex-plan-192-20261001,
  same execution checkout. Directory /tmp/dough-ci-501/watch-kaShmz, PID 3443,
  stream session 4531, yielded cell 19. Retain this exact observer through delivery.

## Consequential native learning for remaining work

- An unreadable fresh blank turn history is unknown, distinct from missing
  conversation; metadata is readable. After ordinary native attachment, empty
  history is readable. Bounded passive observation must preserve this distinction.
- Native CLI spawn is insufficient readiness. Hook review can precede composer;
  provide the normal native UI and preserve configured hook/trust choices. Clear
  local done intent only after an evidenced successful attachment.
- Native notLoaded metadata with readable completed history is resumable. A final
  assistant question with questions:null is reviewable, not typed waiting.
- Active client detachment survives SIGHUP; explicit stop targets the observed
  threadId/turnId only. Rename uses thread/name/set, never typing into a busy prompt.
- Slice 1's decisive lifecycle mechanism is accepted. Structured native waits remain
  pending under never; deterministic shapes do not close that native requirement.

## Slice 2 accepted proof — recorded-target observation seam

The canonical current observation is available (loaded/retained plus semantic
activity), unavailable (confirmed absence), or unknown (failed/unsupported/omitted
read). Saved launch records are unchanged. Claude's private listing normalizes
activity and still confirms launch/rename; Codex observation/capabilities remain
unimplemented. Shared withStates forwards actual saved targets, isolates thrown
host errors and bounds unsettled reads by the existing 10-second deadline.

Coordinator inspection: LaunchHost/SessionObservation, launchStates, Claude
normalizer/listing consumers, launchRecord schema/eligibility, sessionShown,
SessionAlerts and doneMarks; observing setups/assertions in launch-observations,
session-listing, host-identity, delete, card/recent-state, alerts and terminal
boundary/done-reopen specs. Setup uses actual store/server/HTTP/page/WS/PTY with
native/osascript substitutes; host-object substitutes only cover seam isolation,
not native Codex parity. Relevant current callers include machineSessions/stateOf,
launch/done/delete responses, schema/client reads, cards/sidebar/counts/alerts,
LaunchSession, TerminalSplit, sessionRecordActions, terminal admission,
AgentTerminals, private launch/rename confirmation and real test-support callers.

Literal affected combined proof command:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/launch-observations.spec.ts dashboard/tests/agent-launch-session-listing.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-records.spec.ts dashboard/tests/agent-launch-card-session-states.spec.ts dashboard/tests/agent-launch-recent-session-states.spec.ts dashboard/tests/agent-launch-attention.spec.ts dashboard/tests/agent-launch-attention-clearing.spec.ts dashboard/tests/session-sidebar-state-edge.spec.ts dashboard/tests/session-sidebar-reading.spec.ts dashboard/tests/session-alerts.spec.ts dashboard/tests/session-alerts-unavailable.spec.ts dashboard/tests/agent-launch-done.spec.ts dashboard/tests/agent-launch-done-stop.spec.ts dashboard/tests/agent-launch-done-refusal.spec.ts dashboard/tests/agent-launch-delete.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-boundary.spec.ts dashboard/tests/agent-terminal-lifetime.spec.ts dashboard/tests/agent-terminal-close.spec.ts dashboard/tests/agent-terminal-done.spec.ts dashboard/tests/agent-terminal-reopen.spec.ts dashboard/tests/agent-terminal-done-reopen.spec.ts dashboard/tests/agent-launch-card-done.spec.ts dashboard/tests/agent-launch-card-delete.spec.ts dashboard/tests/agent-launch-recent-delete.spec.ts dashboard/tests/agent-launch-ad-hoc-sessions.spec.ts dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts dashboard/tests/agent-launch-codex-recovery.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/agent-launch-start-taken.spec.ts
```

Terminal exit 1 had one migrated expectation error: delete's partial working
state expected retained while live Claude correctly returned loaded. The other
selected specs passed; serial successors in that delete file were skipped.
Only the expectation changed, then the complete failed file passed:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-delete.spec.ts
npm run typecheck:dashboard
```

Both terminal exit 0. Quiet Playwright last-run.json: passed, failedTests [].
The initial successful typecheck and final typecheck cover server/page/test
contracts; no native result is implied. Shared seam assertions observe saved
context forwarding, equal host IDs, independent throw, omitted-target unknown
and true deadline abort. HTTP observation asserts every normalized Claude state,
one listing for all projects and byte-identical durable store. Page assertions
retain labels/reasons/attention; alerts retain baseline/dedup/unreadable silence;
terminal/done/reopen and Codex recovery retain their existing external outcomes.

Independent refactor: none — already clean; all 19 changed paths inspected, no
edits or invalidated proof, tests skipped, git diff --check passed. No readiness
renewal. Slice 3 is next; native adapter, typed waits and later lifecycle/start
acceptance remain outstanding.

Formatter found 11 mechanical ESLint findings before staging. Repair clarified
standalone sessions callbacks with a function-valued property, used explicit null/undefined checks
and promise-based test stubs with context assertions. Production semantics and
other proof stayed unchanged. Post-repair npm run typecheck:dashboard and
`env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/launch-observations.spec.ts`
both terminal exit 0; the two selected seam tests still observe rejection
isolation, saved routing, omitted-target unknown and deadline abort.
The repository lint rule rejects this:void parameter syntax; the equivalent
function-valued property type replaced it without emitted runtime changes.
Post-adjustment npm run typecheck:dashboard passed; prior runtime proof remains
applicable.

## Slice 3 accepted proof — passive Codex observation

Saved endpoints supply one read-only connection per endpoint, metadata without
loading/resuming and the latest needed turn only. Each endpoint settles within
9 seconds before the common 10-second bound, preserving independent healthy
results. Available states retain loaded/retained meaning, typed native waits,
review/failure/interruption, blank awaiting input and Codex unknown provenance.
Unrecognized or unreadable Codex states raise no guessed alert; Claude's prior
unrecognized-state alerts remain intact. No observation is persisted.

Confirmed absence requires thread/read code -32600 and exact message
`thread not loaded: <requested ID>`. Native read-only missing-ID checks and
[version-matched source](https://github.com/openai/codex/blob/rust-v0.159.3/codex-rs/app-server/src/request_processors/thread_processor.rs)
show this follows both stored and loaded absence; retained notLoaded metadata
and other refusal/history failures do not establish absence.

Coordinator inspected sessions/RPC, the public host callback, sessionShown and
continuation note; actual predecessor store/HTTP/page, polling and notification
setups/assertions in the four Codex observation specs and supporting fixture.
Page cards/Recent/sidebar observe labels, reload and six-to-seven attention
counts. HTTP observes endpoint independence including a silent endpoint,
exact absence counterexamples, retained history and deletion during a held read.
Alerts observe baseline, typed-wait transition, dedup, unknown silence and review.
Every observation journey asserts passive-only native requests; page proof also
observes no daemon discovery command. Real policy-supplied waiting remains
pending under slices 1/8; schema substitutes do not claim native parity.

Independent refactor extracted passive fixture replies and public fixture types,
preserving compatibility exports, and separated status/error proof from endpoint
integrity proof. Product behavior stayed unchanged. The replacement selected
command passed after inspecting those moved setups/assertions:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-codex-observation.spec.ts dashboard/tests/agent-launch-codex-observation-boundary.spec.ts dashboard/tests/agent-launch-codex-observation-status.spec.ts dashboard/tests/agent-launch-codex-observation-alerts.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts dashboard/tests/agent-launch-codex-recovery.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-codex-confirmation.spec.ts dashboard/tests/agent-launch-codex-creation.spec.ts dashboard/tests/agent-launch-codex-options.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/session-alerts.spec.ts dashboard/tests/session-alerts-unavailable.spec.ts dashboard/tests/agent-launch-start-taken.spec.ts
npm run typecheck:dashboard
git diff --check
```

All terminal exit 0. Changed fixture consumers include launch/lifetime/recovery,
reconciliation/confirmation/creation/options, preparation/recovery and Taken;
Claude alerts retain their existing outcomes. Initial failures were old test
assumptions: recovery counts now select includeTurns:true; deletion requires an
unreadable precondition; sidebar expects actual Codex Working. Corrected
assertions preserve the original recovery/deletion/view contracts.

Formatter found three mechanical issues: unused callback context, an unnecessary
optional chain and a statement ternary. After equivalent repairs, dashboard
typecheck and the four observation specs passed again:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-codex-observation.spec.ts dashboard/tests/agent-launch-codex-observation-boundary.spec.ts dashboard/tests/agent-launch-codex-observation-status.spec.ts dashboard/tests/agent-launch-codex-observation-alerts.spec.ts
```

Final npm run format passed. Every changed file is at
most 250 lines. No readiness renewal; slice 4 is next.
