# Planning context and acceptance contract

Supporting context for [plan 192](PLAN.md). Preparation facts and the
planning assessment below record the pre-execution baseline; current slice
statuses live in PLAN.md and current execution facts in [EXECUTION.md](EXECUTION.md).

## Original source and preparation context

- Identity: SEED-052#use-codex-from-dashboard; [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#use-codex-from-dashboard).
- Authority: Terry's 2026-10-01 architecture review, remainder refinement and slice-planning request. This draft grants no execution or release authority.
- Owned preparation workspace: /Users/terryyin/git/open-dough/.worktrees/split-codex-dashboard-stories, branch codex/split-codex-dashboard-stories. Reused mrsn-chan's published preparation allocation 2b09d444baad6a19a45006d1cb63d86715e4afe3; start returned continued for both refinement and planning.
- Integration checkout: /Users/terryyin/git/open-dough; authorized publication target remains origin/main when this preparation receives an explicit keep. Current draft is unpublished.
- Reviewed implementation: 3ec2602fd891712c036f498b06a89d92ca75ac78. Fresh fetched 0578bf8d adds SEED-068/queue priority, without changing the reviewed dashboard or this source story. No queue movement is included.
- Numbering: highest active allocation 191; candidate 192 checked before writing. At preparation completion, every slice was todo.

## Outcome and boundaries

Complete the established Codex dashboard session journey: observe when to return,
answer through the embedded native CLI, detach/reconnect without losing or
forking the conversation, explicitly mark done/reopen, and accept execution and
ad hoc starts, including a blank first instruction. Preserve first-story
refinement, configured defaults, preparation reuse, uncertain-input safeguards
and direct CLI continuation.

Native conversation identity/existence, current activity, local done intent and
published story completion have different owners. State never establishes story
completion. A completed assistant reply may be ready for review even when it
asks an ordinary prose question; Needs input requires native waiting evidence.
An unloaded conversation with retained history is resumable. Unreadable native
data is unknown, distinct from confirmed absence.

Excluded additions: desktop-app connection, external conversation discovery,
Cursor integration, model/authentication UI, a new daemon/database/event broker,
composable session policy implementation and CI event delivery. This exclusion
does not impose workflow gates. SEED-067 owns existing launch/desktop-handoff
repair; SEED-066/plan 191 owns session policy. Reuse changes from those stories
when delivered and recheck affected contracts, without appropriating their work.
Consume saved actual workspace/context; do not infer an assignment from a
conversation. No native settings override or shared-daemon restart is authorized
as a proof workaround.

## Architecture review and PFE decisions

Follow the updated North Star [agent launch](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment),
[shared start](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session)
and [session policy](../../NORTH-STAR.md#composable-session-policy-and-workflow-owned-start).
The existing one-public-module-per-host direction fits. Revise the Claude-shaped
observation contract where Codex needs saved record targets; no second service
or universal vendor plugin framework is needed.

| Responsibility | Existing solution and assessed decision |
| --- | --- |
| Workflow admission, installed skill and setup | Reuse src/agentLaunch.ts, server/startWorkflows.ts, executionStart.ts, preparationStart.ts and launchWorkspace.ts. Native input consumes the installed formatter. Do not copy claim/workspace logic into Codex. |
| Native identity, durable first input and recovery | Extend private server/hosts/codex helpers behind codexHost.ts. Reuse launchRecording/launchRecordStore, saved thread ID, workspace, endpoint and continuation. The native thread ID is the conversation target; a session-tree root is not an attach target. |
| Machine session read | Change LaunchHost/withStates to receive recorded targets and return observations for those targets. Claude can still join one machine-wide listing. Codex can group reads by saved endpoint; one failing host/endpoint must not erase independent observations. No global native-session discovery. |
| Activity and presentation | Normalize native activity at each host into one shared semantic observation, preserving native provenance for unknown states. Extend sessionShown once; cards, Recent sessions, sidebar/counts and SessionAlerts consume it. Do not store live state as durable truth or parse assistant wording to infer waits. |
| Read-only monitoring | Reuse existing machineSessions/stateOf and nonoverlapping 15-second alert polling. Codex reads metadata and only the latest needed turn, bounded by the existing observation deadline. Read without resume/subscription ownership; do not load all history each poll. A native unsupported/unreadable response remains honest unknown. |
| Embedded interaction | Reuse AgentTerminals, terminal protocol, TerminalSplit and native CLI over PTY. Codex attach uses the saved endpoint/workspace/ID. Add an attachment-readiness seam only if the early probe shows spawn does not establish successful native attachment. Detachment is distinct from interruption. |
| Done/reopen | Change existing doneMarks/terminal lifecycle coherently; native rename and active-turn interruption stay in Codex's private helpers. Preserve local mark versus native outcome and clear it only on a successful reopen. Never stop the shared daemon, archive/delete history, or inject a slash command into a busy Codex prompt to rename. |

Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
owns vocabulary; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports the smallest coherent model and evidence before generalization;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires native feasibility and separately tracked acceptance.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
govern any installed-payload dependency: use a real released installation, never
hand-synchronize managed copies. No guidance edit or new ADR is planned.
The index still marks ADRs 0007–0009 Proposed; they are not binding substitutes.
No Accepted ADR conflict was identified.

## Decisive premises and observations

Observations below were made on 2026-10-01. Native read-only checks created no
thread, resumed no conversation, submitted no turn and changed no vendor policy.

| Premise / consuming work | Literal observation and result |
| --- | --- |
| Refinement launch/recovery are reusable, not lifecycle proof (all slices) | Recovered plan 189 at 719a5ef8525788bd7d9288cff8f97c76bf1f5b6b and traced maintained dashboard/AGENT-LAUNCH.md. Real released v0.3.51 installation, configured model/policy, original-thread CLI answers and useful prepared-workspace draft were accepted. First launch-client loss while another CLI remained alive passed; all-client closure and embedded/done/state were explicitly outside proof. Terry now confirms delivery works. |
| Existing cheap journeys establish shared startup and lifecycle baselines (2–7) | Ran env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-terminal-lifetime.spec.ts dashboard/tests/session-alerts.spec.ts. Quiet run passed; dashboard/test-results/.last-run.json reports passed, no failed tests. Native Codex protocol/process substitutes prove our boundaries, not vendor behavior. |
| Existing done/reopen, blank/text ad hoc and retained execution start are preserved outcomes (2,4–7) | Ran the same quiet Playwright command with dashboard/tests/agent-launch-done.spec.ts, agent-launch-done-stop.spec.ts, agent-terminal-done-reopen.spec.ts, agent-launch-ad-hoc-terminal.spec.ts and agent-launch-start-taken.spec.ts. Quiet run passed; .last-run.json reports passed, no failed tests. Their actual page/HTTP/WS/Git journeys establish the current Claude/common outcomes; they do not establish native Codex parity. |
| Current host interface cannot observe saved native targets (2–3) | Read launchHosts.ts, launchStates.ts and codexHost.ts; traced both machineSessions and stateOf. sessions takes folder/signal without records, Codex has no implementation, and shared joins infer unlisted from a missing listing entry. Observation requires changing that common seam rather than privately discovering arbitrary threads. |
| Presentation/controls contain Claude-specific assumptions (2–5) | Read sessionShown.ts, sessionCapabilities.ts, agentLaunchAdmission.ts, doneMarks.ts and AgentTerminals. State labels interpret Claude strings; capabilities allow only Claude; done mark precedes stop; PTY spawn clears done before native readiness and socket closure sends SIGHUP. Consumers found in LaunchSession, TerminalSplit, sessionRecordActions, cards/sidebar/alerts and corresponding HTTP/WS plugin routes. Preserve those callers' purposes and prove changed semantics at their external boundaries. |
| Current native protocol supports read-only persisted observation (3) | codex --version and codex app-server daemon version report matching CLI/daemon 0.159.3 and the existing shared Unix endpoint. Generated experimental JSON schema confirms thread/read, thread/turns/list, turn/interrupt and thread/name/set methods. Read-only initialized CodexRpc issued thread/read(includeTurns:false) then thread/turns/list(limit:1,sortDirection:desc,itemsView:notLoaded) for the historical accepted thread 01a0f4a2-d21b-7312-95d1-cd8741a4d0bd. ID matched; status was notLoaded, saved workspace was retained, latest turn status completed and returned items empty. Neither history readability nor this completed example settles active/blocked semantics. |
| Execution's mechanical formatter exists in the selected Codex layout (6) | executionStart.ts resolves execution-start.mjs and established-start.mjs using the selected host's installed path. Imported the installed .agents formatter and called formatEstablishedStart with representative read-only facts: output retained workspace and publisher ID. This does not prove native consumption or publish a claim. |
| Remaining workflow/PTY/done proof is missing, not implied by dispatch (1,4–8) | Searched dashboard/tests by Codex references and by start/ad-hoc/done/terminal/alert behavior, then inspected representative setups/assertions. Current Codex page spec explicitly expects no embedded/done controls and unavailable live observation. Existing ad-hoc blank/text, done/reopen and start journeys use Claude substitutes. No native Codex parity pass is claimed. |
| New native lifecycle and blank-conversation durability work (dependent slices) | Cheap CLI help/protocol/schema and historical reads establish available boundaries only. Actual PTY detach/reconnect, structured waiting/active state, blank-thread durability, rename/interrupt and ownership require state-changing/authenticated observations. Slice 1 owns them and stops dependent implementation on failure. |

The [official app-server documentation](https://learn.chatgpt.com/docs/app-server#threads)
confirms that thread/read and paged turn reads do not resume or subscribe.
It distinguishes runtime status from retained history. The observed local native
results above, rather than documentation alone, establish the completed/unloaded
case. Keep active and interactive behavior probe-bounded.

## Executable proof ownership

| Final promise | Owning slices and observable proof |
| --- | --- |
| Original refinement, saved IDs/defaults, installed preparation/retry and first-input uncertainty remain usable | 2–7 preserve existing Codex launch/preparation/recovery/host-identity specs; reuse first-story native activation only where unchanged. 8 checks an affected actual released installation. |
| Native working/waiting/review/failed/interrupted state; unloaded/missing/unreadable distinctions | 1 native semantics probe; 3 browser/HTTP/native-substitute journeys plus focused mapping/error checks; 8 observes representative real transitions. |
| Same meaning across cards/history/sidebar/counts; existing alerts baseline/dedup and unknown silence | 3 extends existing session state and SessionAlerts page/SSE journeys. Assert visible transition, count and one alert, not merely a mapper result. |
| Read/answer/resize/detach/reconnect, page/server closure retains original context without another input/fork | 1 proves native lifetime; 4 page/WS/PTY journey, background loss and failed attachment; 8 real embedded continuation. |
| Done-prefix/local mark, targeted active-turn stop, successful reopen, honest failure | 1 native rename/interrupt probe; 5 page/HTTP/WS journey and refusal/race boundaries; 8 real done/reopen in original history. |
| Planned execution uses established claim/workspace once and native skill performs useful work | 6 real fixture Git/start plus native-substitute browser journey; 8 actual native execution skill outcome. |
| Ad hoc text once and blank awaiting instruction, both embedded/session lifecycle | 1 blank durability probe; 7 browser/HTTP/native-substitute blank/text/restart journeys; 8 native blank then first instruction. |
| Predecessor records, host-qualified equal IDs, independent failures, direct CLI and record deletion without native deletion/resurrection | 3–5/7 extend history/refusal/lifetime journeys, use predecessor records loaded through actual store. 8 retains native identity/history. |

## Native acceptance story

For a developer using Codex, actual dashboard launch and embedded interaction
must preserve a usable native conversation through the full lifecycle.
This unqueued acceptance story is linked inside this feature plan under
ADR 0005; it adds no backlog item or independent implementation promise.

- Required tool: native Codex with observed CLI/daemon versions, existing model,
  approval/trust policy and a fresh isolated target project installed from a
  real release. No shared-daemon restart, policy override or existing user's
  conversation is used for state-changing proof.
- Representative journey: start a small planned execution; inspect its actual
  established claim/workspace; observe native activity, open the embedded CLI,
  read/answer, detach all fixture clients during work and reconnect after a
  dashboard restart. Judge useful skill-produced changes and absence of repeated
  setup, not self-report. Mark done, observe targeted interruption when active,
  reopen and verify original native identity/history. Reuse the early probe
  for unchanged low-level lifetime/rename mechanics.
- Different activation case: ad hoc blank opens and survives before first
  input; the first instruction and one response use the same native thread.
  Text-first activation may reuse this mechanism plus deterministic exact-input
  proof if slice 1/7 evidence establishes equivalence.
- Native waiting: use structured input/approval waiting actually supported and
  encountered under configured policy, or matching reusable evidence. If the
  policy prevents that case, report its coverage pending; don't declare broad
  approval parity from a never-policy run. Completed prose question/review
  behavior is a separate observable case.
- Completion: all mapped affected native requirements passed or justified
  reusable evidence, with candidate, release, tool/runtime/policy, observed IDs
  and decisive outputs recorded in this active plan. Missing proof remains
  active; no required native result is synthesized by a substitute. Assess now
  and delete passing disposable artifacts under ADR 0005.

## Verification, sizing and planning assessment

Use the installed execution workflow when execution is authorized. Its
post-change refactoring, affected proof, selective formatting, staged review,
hook-owned lint and asynchronous CI repair stay in force. Planning does not
install/update guidance, Take work or run paid native acceptance.

For dashboard proof use the quiet-run command above with affected spec paths.
Run npm run typecheck:dashboard after changes to shared server/page contracts.
Common fixture/host-interface changes require their affected launch, history,
terminal, done and alert journeys together once because those consumers share
the changed fixture/contract. After that, broaden/repeat only for a new change,
failure or unresolved concern. Hosted CI's configuration alone adds no local
full-suite gate. Native probe and acceptance have distinct observations and
must retain their existing authority requirements.

Construction review: eight cohesive slices, one structural boundary immediately
before its enabled behavior. State display and attention/alerts stay together:
they are one notice-when-to-return result. Finish and reopen share one reversible
lifecycle proof; execution and ad hoc have different startup/outcome proof and
remain separate. Final native acceptance isolates release assurance from
deterministic implementation, reusing rather than repeating early feasibility.
The cumulative design has one record/observation/interaction model and native
host semantics, without a parallel session service or workflow-specific gates.

No project numeric slice target, hard limit or S/M/L definitions were supplied.
No sizing exception is invented. The largest integration risk is slice 1's
all-client continuity/ownership and blank persistence; slice 5's active-turn
races are bounded by its per-conversation lifecycle. Eight slices do not warrant
automatic resplitting. If native feasibility reveals a different outcome or
substantial extra integration, stop dependent work and reassess the story;
do not drop lifecycle promises to keep the count small.

No unresolved product question or remaining slice-boundary concern was found
in this review. Fixable construction concerns were resolved while writing;
a separate slice-plan-refinement rewrite was not needed. Decisive cheap premises
were observed and remaining native premises are bounded by slice 1. Record
ready on the current story/plan digests. This is planning readiness, not passed
native acceptance or authorization to implement. All statuses were todo at preparation completion; PLAN.md owns current status.
