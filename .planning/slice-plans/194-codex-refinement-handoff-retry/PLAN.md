# Reliable Codex refinement handoff and retry

## Source and preparation context

- Identity: SEED-067#resolve-codex-refinement-launch-failures.
- Source: [refined story](../../seeds/SEED-067-codex-refinement-launch-reliability.md#resolve-codex-refinement-launch-failures), including Terry's desktop refusal and duplicate Preparing screenshots.
- Authority: Terry requested refinement and planning on 2026-10-01. This plan authorizes neither implementation nor publication of the draft.
- Owned preparation workspace: `/Users/terryyin/git/open-dough/.worktrees/refine-codex-handoff-retry`, branch `codex/refine-codex-handoff-retry`, created for this identity from fetched `aeac68d810a07c5df97789f1edaebcdc751a4e66`.
- Originating/integration checkout: `/Users/terryyin/git/open-dough`. Separate publication target: `origin/main`, only after an explicit keep for this preparation.
- Published preparation: dbs-chan, allocation `d69ccb4e2b57087f0064f5a637a79562cc2ebd00`; planning's start returned `continued`. The story remains queued. The result stays uncommitted in this workspace for review.
- Highest plan allocation was 193 in both the owned checkout and fetched trunk; candidate 194 was checked immediately before writing.

## Outcome and boundaries

Terry can continue a dashboard-started refinement in its original Codex desktop
conversation without a fork. A failed launch's retry keeps one established
preparation; if its workspace/ownership evidence cannot be verified, retry
preserves the saved start and reports the reconciliation needed instead of
announcing a replacement owner. Native turn/history and exact first-input
evidence survive any handoff.

Desktop handoff's cause remains a native premise, not an established diagnosis.
Observe it before changing connection lifetime. Codex's native constraints on
input during an active turn remain in force. A completed question must be
answerable in that original conversation; a prose question is not assumed to
be a structured native wait.

Preserve the delivered daemon startup repair at `f68730d3`, configured model,
trust and approval settings, host-qualified IDs, existing conservative recovery,
and unrelated launches. No automatic shared-daemon restart, policy override,
user-thread interruption, profile release or workspace recreation is a remedy.
The real reported chats, fork and preparation assignments are evidence, not
disposable test fixtures.

Live observation, embedded terminal, done/reopen, general execution/ad hoc Codex
support and external discovery remain in [plan 192](../192-complete-codex-dashboard-sessions/PLAN.md).
Session policy remains in [plan 191](../191-composable-lightweight-session-options/PLAN.md);
CI monitoring remains in SEED-063. No new retry button, assignment registry,
native daemon, generic lifecycle framework or automatic orphan cleanup is planned.

## Existing solutions and architectural constraints

PFE found one coherent start/record/host model across dashboard and installed
guidance; change its existing owners rather than duplicate their meaning:

| Responsibility | Existing solution and selected use |
| --- | --- |
| Retained preparation retry | `server/preparationStart.ts` reads `startStore.ts`, reuses `startLaunch.ts:startChoice`, and runs the installed script. Change this retained-start boundary to refuse unsafe replacement while preserving the start. Let the installed script continue to establish/verify assignments. |
| Exact preparation ownership | `src/skills/dough-story-refinement/scripts/preparation-assignment-ownership.mjs` records the allocation in a worktree-local ref. An agent name/story match is insufficient. Existing `preparation-lost-workspace.md` and `abandon --profile --allocation --confirmed-abandoned` own explicit release. Reuse that reconciliation instruction; the retry does not perform it. |
| Native first input and recovery | `hosts/codex/launch.ts`, `recovery.ts`, `conversation.ts` and `rpc.ts` already share a transport and durable `launchRecording.ts`. Preserve write-before-submit and exact-input reconciliation; put a proven handoff remedy in this private native lifetime owner. |
| Session acceptance and start removal | `launchRun.ts` awaits the host result and durable writer before removing the established start. A refused unsafe retry must stay outside native launch and must not take the successful-removal path. |
| User explanation | Existing kept-start dialog and launch-problem/card surfaces already show recovery context. Extend their current refusal text; preserve unknown live state and the external continuation command. |
| Outside-in test support | `support/preparationPage.ts` / `startOrigin.ts` run actual candidate installed scripts with a disposable bare origin. `fakeCodex.ts` substitutes native transport only. Extend these journeys; do not manufacture assignment/ref effects in a stub. |

Follow [North Star: agent launch](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
and [established start](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session):
published profiles own assignment facts; machine-local start evidence owns retry;
the installed workflow owns preparation; native host code owns its conversation.
The read-only monitoring direction in plan 192 does not justify resuming or
stealing control here. No new North Star topic is needed.

Relevant current Accepted decisions: [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
keeps domain identities and concepts coherent; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires bounded user value and empiricism; [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
separates deterministic functional proof from actual native acceptance. The ADR
index and in-file statuses agree; 0008/0009 are Proposed, not adopted constraints.
No conflict or architectural exception was found.

## Decisive premises and observations

Observed against starting revision `aeac68d8` (the announcement adds only our
profile). Concurrent published preparation/planning changes are not assumed to
have implemented this repair; recheck affected code before execution.

| Premise and consumer | Literal observation and result |
| --- | --- |
| Normal retained preparation can be continued by the actual installed command (slice 2). | Isolated `createPreparationTrunk` fixture: production `startPreparation(..., --branch codex/missing-prep --host codex)` returned `announced` / Yui-chan, then `continued` for the same workspace. |
| Loss of that workspace can create another preparation, not just an error (slice 2). | In the same disposable fixture: `git worktree remove <fixture workspace>` and safe `git branch -d codex/missing-prep`, then the identical start. It returned `announced` / Akiho-chan; `remoteProfileNames` showed both yui-chan.json and akiho-chan.json. This reconstructed condition matches the reported defect class; it does not establish how Terry's real branch disappeared. |
| The dashboard consumer reaches that defect (slice 2). | `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/codex-missing-preparation-probe.spec.ts --workers=1` passed the disposable observation spec: HTTP launch with native creation refusal kept one preparation/start; removing only the fixture worktree/branch and retrying returned `launched`, left two profiles for the same queued identity, emitted two total `thread/start` calls (one refused), and one `turn/start`. The native fixture supplies no preparation. The temporary spec was assessed, then deleted. |
| Existing intact-workspace retry, uncertain-input recovery and lifetime races have reusable external proof (slices 2–3). | `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts --workers=2` exited 0, six tests. Inspected setup/assertions: real origin/installed-script publication, browser retry after server restart, exact retained preparation/input, and HTTP/protocol lifetime/deleted-record behavior. Initial run lacked the worktree-local Vite executable; linking existing dependencies made the actual run succeed. This is substitute protocol proof, not desktop ownership proof. |
| The ownership record can be lost separately from the published assignment (slice 2). | Read `preparation-assignment-start.mjs:announce`, `preparation-assignment-ownership.mjs:workspaceAssignment` and `preparation-assignment-trunk.mjs:selectPreparationWorkspace`: a newly created workspace has no local allocation ref; only its own recorded allocation identifies a continuing owner. Read the existing lost-workspace test, which requires explicit allocation confirmation before release. No new unique-story rule for all preparation is inferred. |
| Native connection lifetime is shared by creation and reconciliation (slices 1/3). | Read/search `launchCodex`, `recoverCodex`, `observe` and `closeCodexConnections` across dashboard. `codexHost.ts` exposes them; `launchRun.ts` invokes launch/recover; both retain `conversation.ts` observation until completion/failure. `rpc.ts` sends initialize/start and closes only the client; that implementation comment is not proof that active native work survives final-client detachment. |
| Current native desktop ownership, final-client detachment and waiting behavior permit the desired handoff (slice 3). | Not settled by inexpensive protocol tests or the later successful user attempt. Slice 1 must observe the actual desktop and runtime using an owned fresh fixture conversation, preserving configured policy. No paid/native state-changing probe ran during planning. |

## Proof ownership

| Promise / key example | Owning slice and observable proof |
| --- | --- |
| Original desktop task can be read/answered without a fork, repeated first instruction or forced server shutdown; turn/history survive | 1 establishes native feasibility and causality; 3 implements a supported remedy and accepts that native journey. |
| Refused native creation preserves useful bounded evidence and exactly one established preparation through retry/restart | 2 extends the real Git + browser/HTTP preparation journey, retaining native refusal assertions. |
| Missing/inconsistent workspace ownership stops retry without replacement artifacts; repeated retry remains safe | 2 inspects saved start bytes, origin profile/allocation bytes, worktrees/branches and native call log before/after each attempt. |
| Unknown native acceptance reconciles original identity/input without blind replay | 3 preserves preparation-codex-recovery, creation-reconciliation and uncertain-input tests; 2 preserves precedence of native recovery over a new preparation. |
| No interruption/daemon stop/policy override, no deleted-record resurrection, cleanup after background failure/shutdown | 3 deterministic lifetime/race proof plus slice 1/3 native continuity. |
| Other stories and existing non-Codex preparation remain usable | 2 independent-story and existing Claude retained-start journey; 3 native proof scoped to one owned conversation plus existing common launch/host-identity proof. |

## Ordered slices

### 1. Establish how the original desktop conversation becomes usable

Type: Behavior

Status: planned

Behavior: in a fresh isolated target project with released installed guidance,
start a small native dashboard refinement under the current configured policy.
Open its actual original task in Codex desktop while the first turn is active,
then when it presents a question/completes. Observe desktop read/input behavior,
native thread/turn IDs, accepted input and history. Record versions and whether
the original refusal is reproduced.

Use an attempt-owned native client to compare observation held versus safely
detached/unsubscribed on that fixture conversation, if the actual runtime offers
that mechanism. Observe remaining native work, history and desktop input after
the final launch client detaches; do not infer survival from a comment or a fake
server. Distinguish ordinary completed prose questions from structured native
approval/input requests encountered under the configured policy. Do not turn
off approval or synthesize a policy case that did not occur.

Proof: linked native acceptance below, with a minimal causal comparison when
the refusal occurs. A later operable thread alone does not establish initial
handoff. A passing remedy spec before a reproduced violation does not count
as a repair. If the current runtime already satisfies the examples, record
matching native evidence and make no speculative lifetime change in slice 3.

Safe stop: preserve the original feature and fixture history; record the
supported native behavior. If detachment interrupts work, ownership cannot be
transferred safely, or desktop proof is unavailable, stop dependent slice 3 and
revise the approach/ask for the specific product decision. Independent slice 2
may proceed under later execution authority. The probe carries existing native
credential/owner/state-change requirements; planning readiness grants none.

### 2. Keep a failed refinement retry attached to its original preparation

Type: Behavior

Status: planned

Precondition: native creation failed after the dashboard retained an established
preparation. Trigger: retry, including after server restart.

Postconditions: intact verified ownership continues the same agent/workspace and
submits one first input only after native creation succeeds. Missing or
inconsistent workspace ownership stops before an unsafe preparation announcement
or native call, preserves the existing start/profile/allocation, and shows the
known agent/workspace with a useful reconciliation explanation. Repeating it
does not create a replacement worktree/branch or second owner. A stopped attempt
does not silently delete its saved start or invoke successful-session cleanup.

Change the existing retained-start boundary in `preparationStart.ts` and its
current result/presentation path as necessary. Reuse exact ownership evidence
and the installed continuation contract; checking a saved published preparation
must not recreate its missing workspace by treating it as a new start. Preserve
unconfirmed-announcement handling and legacy starts that lack a returned
publication SHA: uncertainty must be retained, not guessed into new ownership.
Do not make every independently requested preparation globally unique or add a
new assignment parser. If shared script changes prove necessary, edit the source
under `src/skills/`, never managed installed copies, and recheck its consumers.

Proof: extend `agent-launch-preparation-codex.spec.ts` through the real browser,
HTTP/store, candidate installed command and bare origin. Reproduce the observed
lost-workspace/branch defect before remedy, then assert a truthful refusal and
unchanged original profile/allocation/start, no new worktree/branch and no native
creation/input. Add the missing/mismatched local ownership case at the same
boundary. Retain the existing intact-workspace/server-restart success. Exercise
an unrelated queued identity after this refusal and preserve the existing Claude
preparation resume journey. Native substitutes may supply refusal/success only.

Safe stop: retries no longer multiply ownership; any already-published duplicate
in Terry's environment remains unchanged and explicitly needs reconciliation.

### 3. Complete the supported handoff without losing the native conversation

Type: Behavior

Status: planned

Precondition: slice 1 establishes the supported native mechanism and any
dashboard-caused violation. Trigger: accepted initial launch or reconciliation,
followed by desktop continuation of the original thread.

Postconditions: original identity, first-input evidence, workspace and configured
policy survive; native work/history persist; questions can be answered through
the desktop without a fork or forced server shutdown. The launch/recovery client
releases control as the observed native contract requires, with background
failure and resource cleanup accounted for. Do not equate native turn completion
with story completion or advertise live observation/terminal/done capabilities.

For a confirmed violation, change the existing `conversation.ts`/RPC lifetime
and both launch/recovery callers as a single responsibility. Do not prescribe
closing immediately after acknowledgment until slice 1 proves its effects.
If no violation is reproduced and current behavior fulfills the source, reuse
that accepted evidence and document the actual handoff without speculative code.
If a supported remedy needs a changed outcome or a new broad desktop lifecycle,
stop and revise with Terry rather than appropriate plan 192.

Proof: extend the existing HTTP/protocol lifetime and reconciliation tests for
the proven native contract. Cover accepted input, caller detachment, completion
or failure racing durable confirmation, server closure, and deleted records
remaining deleted after later failure. Keep first-input intent persisted before
submission and matching history recovery without replay. Assert no
`turn/interrupt`, daemon shutdown, replacement thread or settings override.
Inspect every launch/recovery consumer of a changed shared lifetime; existing
Codex options/creation/reconciliation and host-identity proof supplies unchanged
common semantics, not new execution/ad hoc parity. Finish native acceptance
below and update `dashboard/AGENT-LAUNCH.md` with only realized behavior.

Safe stop: handoff passed on the actual candidate, or its exact missing native
requirement remains open; deterministic green alone does not close it.

## Linked native acceptance

Under ADR 0005, this acceptance belongs inside this feature plan and adds no
independent backlog item. Outcome: a dashboard refinement can be continued in
the original desktop thread and its work survives the supported handoff.

- Required tools: actual Codex desktop, current native CLI/daemon, credentials
  and configured model/policy; a fresh attempt-owned target project installed
  from a real release. Do not restart the shared daemon or use Terry's original
  thread/fork/assignments for state-changing proof.
- Representative cases: initial active turn followed by a completed refinement
  question answered in the same desktop conversation; one controlled ownership
  comparison if the refusal occurs; native work/history continuity across the
  chosen detachment mechanism. If a structured native wait is encountered, it
  must remain answerable through the supported handoff. Reuse evidence only for
  matching policy/runtime/mechanism. Record unobserved wait variants honestly;
  do not add an exhaustive approval-policy matrix to this story.
- Reuse: story 189's prior released installation/refinement evidence remains
  historical input, not proof of this active-turn handoff. The later successful
  task and daemon repair do not settle ownership timing. Slice 1's matching
  observations may satisfy slice 3 after a no-change result; a lifetime change
  requires fresh affected acceptance against the candidate.
- Completion: record candidate, installation release, runtime/policy, observed
  native IDs and decisive results in this active plan; judge useful original
  conversation continuation rather than model self-report. Missing/failed native
  proof remains active before release/closure. Assess and remove passing
  disposable artifacts under ADR 0005, preserving failed/inconclusive context
  until judged. All three tools need no new native activation matrix for a
  dashboard-only guard; changed shared skill mechanisms invalidate and require
  the affected native evidence explicitly.

## Verification, sizing and construction review

Future execution uses the installed dough-execute-plan workflow, including its
post-change refactor, focused proof, hook-owned lint, commit/delivery and CI repair.
Planning runs no implementation, Take or native paid acceptance. For dashboard
proof use `env -u NO_COLOR npm run test:dashboard -- <affected specs> --workers=2`.
Run `npm run typecheck:dashboard` if server/page contracts change. When shared
preparation scripts change, also run affected `node --test` preparation command
tests, including reuse and exact-allocation lost-workspace release; their actual
CLI consumers were found across `preparingJourney.ts`, `launchJourney.ts`, native
owned-context support, and execution's one-shot fixtures. Recheck affected
consumers instead of assuming dashboard-only semantics. Hosted CI alone does not
make the full repository suite a local gate.

Three cohesive slices: a native feasibility probe isolates the unknown handoff,
one retry-ownership result is independently useful, and one proven native handoff
result follows the probe. Each keeps implementation, proof and cleanup together.
There is no speculative Structure slice or separate file/test/documentation
slice. The cumulative rule is continuity of an established identity: a retry or
handoff never silently converts uncertainty into a new owner or conversation.
Preparation identity and native identity retain their separate existing owners.

No project numeric slice target/hard limit was supplied for this planned work;
the old repair's ten-minute planless limit is not inherited. Each slice has one
proof loop and a safe stop. If native feasibility disproves the approach, retain
the independent retry correction and revise the dependent work before expanding.

Construction review found no remaining slice-boundary, cumulative-design or
proof-ownership concern. Concerns were resolved during construction, so a
separate slice-plan-refinement rewrite was not needed. Cheap decisive premises
were observed; the owner-held/native premise is bounded by slice 1. Assess the
current source/plan as ready for execution planning purposes, without claiming
native acceptance or granting execution. All slices remain planned.
