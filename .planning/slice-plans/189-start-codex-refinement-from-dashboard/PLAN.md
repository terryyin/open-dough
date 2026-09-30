# Start Codex refinement from the dashboard

## Source, authority and execution context

- **Identity:** SEED-052#start-codex-refinement-from-dashboard; [refined first story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#start-codex-refinement-from-dashboard).
- **Authority:** Terry's 2026-09-30 `dough-execute-plan` authorizes Take, implementation, Story Branch delivery and necessary in-place refinement. Release/managed installation updates remain unauthorized.
- **Preparation:** Execution uses published first-story preparation on trunk; preserve the earlier split workspace's uncommitted draft and original identity.
- **Mode/identity:** Story Branch; publisher `codex-dashboard-refinement-189-20260930`; assigned agent `yilv-chan`; workspace authorship configured.
- **Origin/integration:** `/Users/terryyin/git/open-dough`, `main`.
- **Execution checkout:** `/Users/terryyin/git/open-dough/.worktrees/start-codex-refinement-from-dashboard`, branch `codex/start-codex-refinement-from-dashboard`.
- **Starting revision:** `3a8b7c886a514730a6ec456ed757e7c11f446101`.
- **Accepted Take/initial published base:** `a14fefc52826a6234745a88f61b2834c0f69f32e` on `origin/main` and execution branch; maintenance advanced; trunk claim CI unobserved.
- **Increment target:** `origin`, `refs/heads/codex/start-codex-refinement-from-dashboard`; latest accepted increment `05f3e4a9fa018eba5be122b729f5b78f0e4cce70` (slice1), observer reused; slice2 delivery follows it.
- **Checkout setup:** `npm ci --silent` and `npm run typecheck:dashboard` passed against this checkout's committed lockfile.
- **Hook:** At startup `core.hooksPath` unset, `.git/hooks/pre-commit` absent. During probe external config changed to `.githooks`; resolved `.githooks/pre-commit` absent here, so current hook contract remains absent.
- **Formatting/budget:** Prettier/ESLint/shfmt select owned paths; planning Markdown excluded. No numeric slice target/hard limit; retain necessary in-place planning authority.
- **CI:** GitHub Actions `ci.yml` push trigger and `terryyin/open-dough` execution-branch selector verified.
  Codex observer cell `13`, PTY session `60704`, directory `/tmp/dough-ci-501/watch-3JsVXN`, PID `28475`, bound to this checkout/branch; pending at startup.

## Goal and boundaries

Dashboard Codex starts selected-story refinement; ordinary CLI continues the same conversation for questions/configured approvals and a useful workspace draft.
Retain evidence across page/server restart, kept-preparation failure/retry and uncertain first input; never blindly create another conversation.

Refinement is the first acceptance example, not an admission restriction. Extend the shared dialog/workflow/start owners;
no `workflow === refinement` gate, second flow, Codex options grammar or machine-session registry. Naturally supported other
workflows may use the integration; their full proof belongs to the [remaining Codex story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#use-codex-from-dashboard).
Deferred: live state/attention/alerts, embedded terminal/reconnect, done/reopen, external discovery, other workflows' acceptance,
model selection, authentication/install UI and desktop linkage. Expose simple delivered capabilities; deferral cannot forbid supported launch. Page closure must not stop refinement. Native termination need not automatically
resume an in-flight turn, but saved conversation/workspace must retain recovery information.

Assume configured project, authenticated native Codex and existing settings. **Never override model, approvals, sandbox/trust
or authentication to pass proof.** Observe approvals only when the configured policy requests them; record policy/behavior.

## Shared design and existing-solution decisions

Follow North Star [requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment) and
[claim/workspace before session](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session).
One public module per delivered host owns native details; common orchestration imports that boundary. Claude helpers remain
private. No speculative host/plugin framework; Cursor remains undelivered. Native Codex daemon is vendor runtime infrastructure,
not a new dashboard daemon/database. No North Star change is warranted.

| Responsibility | Existing common owner and required extension |
| --- | --- |
| Workflow/start | `src/agentLaunch.ts` table; `server/startWorkflows.ts`, `startLaunch.ts`, `preparationStart.ts`, `executionStart.ts`; host supplies installed paths/invocation; installed script/formatter owns preparation/handoff |
| Workspace | Generalize `claudeWorkspace.ts`, used by `startLaunch.ts`/`startGit.ts`; shared `.worktrees/<slug>` collision rule, `codex/` or existing `claude/` branch; no vendor-managed layout |
| Options | `server/launchOptions.ts`, shared `commandOptions.ts`, existing dialog; selected project's host installation; offers/capabilities keyed source + host + workflow, reread on host switch and validate at admission |
| Launch lifetime | `AgentLaunches` progress/gating; host starts/confirms native input and supplies identity/continuation; browser owns no execution process |
| Evidence | `launchRecordStore.ts`, `startStore.ts`, atomic machine JSON helper; opaque native identity/necessary endpoint, no additional store |
| History/actions | Shared cards, Recent sessions/sidebar, admission/terminal/done/delete; dispatch by record host; unsupported capability is honest, never Claude fallback for Codex |

Minimal host contract: installed paths, models (Codex Default), native instruction/evidence/continuation and supported observations/operations; add consumed members only.
Keep admission/workflow/options/workspace/publication/persistence common; move shared `EstablishedLaunch` out of Claude.
Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)/[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
require one domain model/useful increments; [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)/[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
govern released installation; [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) requires native feasibility before
dependent implementation and truthful acceptance before release. No Accepted ADR conflict/exception; Proposed 0008/0009 add no constraints.

### Native transport and durable evidence

Selected native shared app-server daemon: `codex app-server daemon start`, returned `socketPath`, WebSocket-over-Unix;
persist actual `thread.id`, endpoint and workspace. Runtime `0.159.2`, CLI `0.157.0`, proved active CLI continuation:
`codex resume --remote <endpoint> --cd <recorded workspace> <thread.id>`; no turn termination/handover is required.
Implement observed initialization/thread/turn/server-request handling only; approvals must neither auto-approve nor silently
time out. `never` produced no request. Do not ship alternatives: preliminary proxy JSONL was unusable. Version discovery alone
cannot prove configured-model usability; preserve native failures. Local server owns communication, later child/connection
errors and durable evidence; native runtime owns execution. HTTP/browser detach cannot cancel a turn. Server shutdown follows
proved native lifetime and leaves recovery evidence. Spawn cannot prove survival; native idle cannot prove story completion.

- Keep existing machine locations; old Claude records retain native identity; old confirmed records decode as confirmed.
  Missing host in predecessor kept starts/action requests means Claude; new starts retain host/requested model, including retry.
- Identity is host + opaque conversation ID; one helper serves page keys/merge/focus, stores and action lookup. Keep actual ID for
  commands; no fabricated Claude `shortId` or substitution of app-server `sessionId`. Prove equal IDs across hosts remain distinct.
- First-input acceptance confirms launch; thread creation alone does not. Persist identity before submission and acceptance afterward;
  distinguish awaiting/confirmed/uncertain facts from live native/story state. Host awaits common durable write before first input.
- Keep preparation until durable launch record carries established facts; uncertainty retains recovery. Pre-submission store failure
  prevents input and reports known conversation/recovery; no separate retry registry or unawaited identity notification.
- Known-ID recovery inspects/resumes that conversation. Lost acknowledgment/timeout cannot justify resend; resubmit only when native
  evidence proves input unaccepted. Unknown creation without ID requires reconciliation, never automatic second creation.
- Generate correctly quoted continuation from native arguments/recorded workspace/endpoint; never execute a browser shell string.
  No observation means unavailable, not missing. Origin owns story stage; no fabricated working/waiting/done state or alerts.

### Planning premises and release readiness

Preparation observations (2026-09-30, `7e3b212b..2b09d444`, retained seed/backlog draft) created no native turn.
`env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-preparation-kept.spec.ts dashboard/tests/agent-launch-options-exclusive.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts`
passed quietly with linked root dependencies (then removed); prior `vite ENOENT` was checkout setup failure.
`dashboard/tests/support/startOrigin.ts`/start/kept specs run candidate `.claude/skills` against bare Git: publication/CWD/handoff/retries prove real preparation, not released/native behavior; generalize host root.
`rg -n 'installedSkillPath|claudeWorkspace|branchPrefix|shownWorkspace|session\.sessionId|session\.shortId' dashboard scripts tests`
plus launches/admission/starts/Git/options/actions/store/page reads found common Claude coupling, aliases/root/admission,
source/workflow offers, hostless kept starts and post-confirmation records: change identity/dispatch/options/collisions/persistence coherently.
Reuse options correction `2ffe539a`: stale/not-offered selection, unavailable reason, pure-rule cost and skill-group wording;
host switch follows its visible selection rule, never silently drops flags. Recheck callers; spent correction plan is Git-recoverable.

Release reassessment on 2026-09-30: `v0.3.51` installer declares `.agents/skills/dough-story-refinement`'s
`scripts/established-preparation.mjs`, `references/established-preparation.md`, `references/refinement-options.json`;
installed main files match tagged bytes. `optionsDefinitionSchema` parses summaries; installed formatter produces representative
workspace/agent/published-SHA handoff. Dependency satisfied; seed/plan readiness **ready**, not implementation/native acceptance. Slices1–2 proof accepted; slices3–6 pending.

## Outside-in proof ownership

Drive real dashboard page/HTTP server and shared start fixtures. Vendor substitute supplies protocol only: it must not prewrite
records, worktrees or origin assignments. Inspect actual process/RPC input and persisted/published output. Reuse server/start-origin
support, not a parallel harness; prove common options once, host/installation differences separately. Assess skill activation and result separately.

| Promise | Slice / observable boundary |
| --- | --- |
| Defaults, same native read/respond/approve, useful write | 1 feasibility/6 acceptance: real CLI, policy, native interaction and worktree diff |
| Existing Claude records/starts/controls | 2/4: predecessor machine files, valid-store decoding without quarantine, Claude launch/start/terminal/done journeys |
| Shared Codex choice, own options, visible selection/fallback | 3: conflicting `.agents`/`.claude` definitions, host-switch reread, request/record/native content, invalid flag refused before native process |
| Confirmed input, exact continuation, durable mixed history | 3: real endpoint write/restart read; exact ID/workspace command; equal IDs remain distinct |
| Page detach and later failures | 3 substitute/6 native: active caller disconnect, lifecycle-owned failure/recovery/disposal; close/reopen native page during wait |
| Preparing, shared workspace, single handoff | 4: real candidate publishes Codex profile/worktree/branch; formatter output once from established CWD |
| Kept failure/retry | 4: restart preserves host/model/assignment/workspace, one publication/workspace and successful instruction |
| Lost acknowledgment | 5: persistent uncertainty/restart, same-ID read/resume, no duplicate conversation/input |
| Honest capabilities/shared admission | 3/5: cards/Recent/sidebar unavailable; forged attach/done never invokes Claude; deletion selects host; no per-refinement eligibility |

First-story slices1/6 own native proof. Before separate closure link pending acceptance promises under ADR0005; functional proof is not native acceptance, which must precede release.

## Ordered slices

### 1. Prove a usable native Codex refinement conversation

Type: Behavior (feasibility)
Status: done
Accepted: [Native feasibility on runtime 0.159.2](#accepted-slice-1-native-proof-2026-09-30), limited to the recorded promises.

- **Trigger:** Authenticated existing configuration, isolated ordinary project/worktree, released installed skill and bounded
  undecided story needing one clarification; never supply expected answer.
Proof: Accepted first input, active-turn same-conversation ordinary CLI continuation, developer answer/configured approval
  and real useful draft; inspect identity/lifetime/commands/version/settings/interaction/diff. Native interface only, no model API/replay.
  One conversation per viable candidate; investigate failure before alternatives; no usable candidate stops dependent slices.
  Plain refinement settles transport; positive handoff/options needs released installation. Failed proof authorizes no widening or code.
- **Safe stop:** Justified transport or concrete failed feasibility; no speculative integration committed. Accepted detail retained below.

### 2. Put native launch ownership behind the host boundary

Type: Structure
Status: done
- **Change/enables:** One public Claude boundary, private unchanged runtime/instructions; move common launch facts, minimal host dispatch,
  installed paths and session references; align admission/machine reads/terminal/done/delete/stores/page consumers for slice 3.
  Workspace/start generalization remains slice 4; remove common orchestration's direct Claude coupling.
Proof: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-boundary.spec.ts dashboard/tests/agent-launch-records.spec.ts dashboard/tests/agent-launch-session-listing.spec.ts dashboard/tests/agent-launch-ad-hoc-boundary.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-terminal-boundary.spec.ts dashboard/tests/agent-terminal-lifetime.spec.ts dashboard/tests/agent-launch-done.spec.ts dashboard/tests/agent-launch-delete.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options-groups.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-card-sessions.spec.ts dashboard/tests/agent-launch-recent-sessions.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-launch-card-done.spec.ts dashboard/tests/agent-launch-recent-delete.spec.ts dashboard/tests/session-sidebar-navigation-cases.spec.ts` passed exit0/empty output (PTY37235); `npm run typecheck:dashboard` exit0 after final typing repairs.
Accepted: Coordinator inspected native argv/CWD/options/model, old store/restart/retention, state joins, terminal/rename/stop, publication/workspace/handoff and page navigation; mixed-host spec proves equal IDs/no alias/no fallback/no quarantine/selective action.
  Independent refactor renamed DOM-key parameters only; typing/receiver/curly lint repairs preserve proof. Selective ESLint/Prettier and diff check pass; changed files ≤250 lines.
- **Safe stop:** Claude works with common boundary ready for Codex.

### 3. Start and revisit Codex through the shared launch dialog

Type: Behavior
Status: planned
- **Trigger:** Project lacks new preparation capability; choose Codex/Start, reopen page/restart server.
- **Result/work:** Own installed skill/options/optional instruction reach one default-configured native conversation; persist ID before
  submission/acceptance afterward, pending/uncertain recovery without blind retry; exact continuation/workspace survives reload/restart.
  Add selected transport, picker/Default model, host-aware offers/admission/instruction; mixed histories/honest capabilities coexist.
Proof: Existing server fixture's observed-protocol Codex substitute plus `agent-launch-codex.spec.ts` page/HTTP journey:
  actual first-input content/no model or approval overrides, real record/restart read; conflicting host definitions and host reread,
  unavailable options without selection versus rejected selected flag; equal IDs, cards/Recent/sidebar and host-specific action lookup.
  Forged unsupported terminal/done invokes no Claude; preserve common deletion. Disconnect active caller, emit background error,
  assert lifecycle owner retains recovery/disposes failed connection. Document `dashboard/AGENT-LAUNCH.md`.
- **Safe stop:** Ordinary Codex start/continuation works; preparation is capability-dependent, not host-forbidden.

### 4. Establish and resume Codex preparation in the shared workspace

Type: Behavior
Status: planned
- **Trigger:** `.agents` supports script/formatter; choose Codex/options/Start; native refusal, restart, resolve/retry.
- **Result/work:** One published Codex Preparing assignment/shared `.worktrees` workspace on `codex/<slug>` supplies CWD/handoff;
  retained host/model/assignment/workspace/branch survives restart. Retry resumes preparation, hands off once; durable launch record
  carries established facts before kept start removal. Missing predecessor host means Claude. Generalize workspace/collision/start
  callers, pass native/retained host to installed script, consume selected formatter; backward-compatible store/capability/retry schema.
Proof: Reuse `agent-launch-preparation-kept.spec.ts` real-origin page journey with candidate `.agents` and Codex substitute;
  assert profile/assignment/workspace/native-call counts, branch/CWD/options/handoff across refusal/restart/retry. Extend direct spec only
  beyond page reach; decode predecessor starts and preserve interrupted/slow preparation via `agent-launch-preparation-resume.spec.ts`.
  Run `agent-launch-preparation-start.spec.ts`, `agent-launch-preparation-kept.spec.ts`, `agent-launch-preparation-resume.spec.ts`,
  `agent-launch-start.spec.ts`, `agent-launch-start-resume.spec.ts` (Claude refinement/execution share contract); preserve/adapt
  `claude-workspace.spec.ts` slug collisions including `codex/`. Source fixture is candidate proof only; document recovery in guide.
- **Safe stop:** Success/recovery share one start model; retry creates no extra preparation or implicit host change.

### 5. Recover uncertain first input against the known conversation

Type: Behavior
Status: planned
- **Trigger:** ID returned, first-input acknowledgment lost/server disconnected; restart/recover.
- **Result/work:** Persistent same-conversation/workspace uncertainty; inspect/resume before retry, never duplicate accepted input.
  Unknown creation without ID stays uncertain/reconciliation-required. Complete shared evidence/native read/resume recovery.
Proof: `agent-launch-codex.spec.ts` page/HTTP fixture accepts input then loses acknowledgment; restart/recover asserts one conversation/input.
  Contrast explicit pre-acceptance refusal with uncertainty; cover persistence failure before submission (no input, known ID explained)
  and interrupted-runtime recovery. Prepared/plain fallback share one rule, no workflow-specific recovery.
- **Safe stop:** Truthful history/recovery at first-turn boundary.

### 6. Accept the native dashboard-to-draft journey

Type: Behavior (native acceptance)
Status: planned
- **Trigger:** Delivered dashboard, normal released preparation/options
  installation; choose Codex and start isolated queued story through real dashboard. Never hand-sync managed copies.
Proof: Preparing names Codex; shown CLI continues exact native conversation, real clarification/configured approval answered,
  useful draft in established worktree without second announcement. Close/reopen page during interaction, restart dashboard after
  confirmation; same continuation remains. Inspect native input/interaction, publication/worktree diff, activation separately from skill
  behavior; no expected prose, exit-0 or self-report acceptance. Record release/dashboard revision/native version/policy/result here.
- **Gate/safe stop:** First story owns complete proof; missing release/failed native proof stays pending, linked acceptance story required
  before separate closure (ADR 0005). No release authority. Monitoring/workflow parity remains in existing story.

## Verification and delivery

Deterministic slices: `npx playwright test --config dashboard/playwright.config.ts <named specs>` (paths under `dashboard/tests/`).
Quiet-run contract: remove conflicting `NO_COLOR`/`FORCE_COLOR`; resolve checkout dependencies first.
Run `npm run typecheck:dashboard` for shared request/session/host changes; after common test-support edits run affected
launch/start/terminal/history together once. No repeated pure options rules/unrelated installer suite; CI adds no local gate.
[Delivery](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change): independent refactor/affected proof,
selective format, staged review, hook-owned lint, commit/publication and asynchronous CI repair; no independent hook-lint rerun.
Necessary guidance changes use `src/skills` plus AGENTS behavior review, never installed-copy synchronization.
Six slices: preparation success/retry combined in4; old6/7 became5/6; no completed slice replaced/resplit/sizing exception. No numeric budget; bound native scenario and return broader requirements to story. Slice1 records only; no implementation/final acceptance/closure.

## Accepted slice 1 native proof (2026-09-30)

Fixture `/Users/terryyin/.codex/tmp/dough189-native-g8omnmqu/fixture`, actual `v0.3.51` installer, undecided reading-progress
representation/finish seed; baseline supplied no expected answer/draft. `codex --version`: `0.157.0`; `codex login status`: ChatGPT.
`codex app-server daemon start` discovered/started shared endpoint `unix:///Users/terryyin/.codex/app-server-control/app-server-control.sock`;
initial runtime `0.157.1`, PID `53621`/parent `1`; preliminary `codex app-server proxy` JSONL gave no response/conversation.
`node /Users/terryyin/.codex/tmp/dough189-native-g8omnmqu/rpc-probe.mjs /Users/terryyin/.codex/tmp/dough189-native-g8omnmqu`
sent `thread/start` with fixture `cwd` only: effective `gpt-6.1-sol/high`, `never`, `dangerFullAccess`, no model/approval/sandbox/auth/trust overrides.
Thread `01a0f2a3-18cf-75d0-bb35-d4bcc5354179`; `turn/start` sent
`$dough-story-refinement .planning/seeds/SEED-001-reading-progress.md#let-me-record-reading-progress` plus native skill input naming released installed `SKILL.md`.
Initial turn `01a0f2a3-6434-7e93-b573-8f9e1df31d38` accepted/active then failed after 1771ms: HTTP400 configured model unsupported
for ChatGPT, `willRetry:false`; read preserved ID/cwd/instruction, fixture status/diff empty: failure, not useful refinement. Initial CLI showed hook review; no trust choice, owned CLI terminated after Ctrl-C could not leave modal; no other session stopped.
Daemon independently updated to `0.159.2`, PID `16791`; probe invoked no update/restart/install. `model/list` now offered configured
default/high; `thread/read(includeTurns:true)` retained failed conversation. This changed catalog justified same-conversation reassessment.
`thread/resume` with only `threadId` retained defaults/auth/cwd; one contextual continuation of explicit failure, no duplicate first skill input/new thread.
While turn `01a0f2ab-79f9-7383-98c1-b6105a562711` was active, ordinary CLI attached with this exact command:

```text
TERM=xterm-256color script -q /Users/terryyin/.codex/tmp/dough189-native-g8omnmqu/cli-current.log codex resume --remote unix:///Users/terryyin/.codex/app-server-control/app-server-control.sock --cd /Users/terryyin/.codex/tmp/dough189-native-g8omnmqu/fixture --no-alt-screen 01a0f2a3-18cf-75d0-bb35-d4bcc5354179
```

TERM affected presentation only. CLI showed active instruction/commentary/skill reads. Read-only `Review hooks`, Esc closure enabled
composer with no Trust/Trust all/Continue without trusting/disable/bypass or persisted trust. Guard matched `v0.3.51`; Active0/Review1.
Native `native-protocol.jsonl` lines193/197 showed real progress-format/finish-preservation questions/completed turn; CLI answer chose paper/audio marker, preservation on finish and reading-status independence. Lines199–202 showed exact
answer and same-thread active turn `01a0f2ad-771e-7a52-98ca-bf3c2d39e6f4`. Initiating RPC WebSocket closed during answer/draft;
daemon/CLI continued, installed skill wrote afterward. `draft.diff`/actual fixture diff: 42 additions/1 removal, Goal/Scope/Key examples/
Open decisions recording those choices. Native rollout `task_complete` `2026-09-30T14:19:21.924Z`, CLI final and completed turn agreed;
`CommandExecution` reads/`apply_patch` proved activation/write separately from self-report. No approval requested under `never`.
Coordinator inspected actual RPC inputs, initial protocol lines7/18/20–22/26–27, fixture AGENTS/seed/unchanged baseline, then
questions/answer/installed reads/diff/final completion. Temporary `REPORT.md`, `native-protocol.jsonl`, `draft.diff` and rollout locations
were inspected and removed from `/Users/terryyin/.codex/tmp/dough189-native-g8omnmqu` under ADR0005; distilled proof remains here.
**Accepted:** defaults, active same-thread CLI, question/answer, useful draft and initiating-connection lifetime; not every client closure, structured-state completion or dashboard/preparation acceptance (slice6).
**Separate skill limitation:** unqueued fixture recorder used `seeds/...`, not `.planning/seeds/...`, without backlog home; failed
honestly/no state block. Draft/transport remain evidenced; slice6 must assess queued/published canonical preparation and skill behavior separately.
Owned CLI/proxy/WebSockets closed after completion; shared daemon/history remain. No product code, final acceptance, retrospective or story closure claimed. Selected transport/settings/identity/lifetime constraints govern slices2–6.
