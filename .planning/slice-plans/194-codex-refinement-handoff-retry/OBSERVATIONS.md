# Preparation and decisive observations

## Source and preparation context

- Identity: SEED-067#resolve-codex-refinement-launch-failures.
- Source: [refined story](../../seeds/SEED-067-codex-refinement-launch-reliability.md#resolve-codex-refinement-launch-failures), including Terry's desktop refusal and duplicate Preparing screenshots.
- Authority: Terry requested refinement and planning on 2026-10-01. This plan authorizes neither implementation nor publication of the draft.
- Owned preparation workspace: `/Users/terryyin/git/open-dough/.worktrees/refine-codex-handoff-retry`, branch `codex/refine-codex-handoff-retry`, created for this identity from fetched `aeac68d810a07c5df97789f1edaebcdc751a4e66`.
- Originating/integration checkout: `/Users/terryyin/git/open-dough`. Separate publication target: `origin/main`, only after an explicit keep for this preparation.
- Published preparation: dbs-chan, allocation `d69ccb4e2b57087f0064f5a637a79562cc2ebd00`; planning's start returned `continued`. The story remains queued. The result stays uncommitted in this workspace for review.
- Highest plan allocation was 193 in both the owned checkout and fetched trunk; candidate 194 was checked immediately before writing.

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

## Execution observations

On 2026-10-01 computer use refused Codex desktop access. Terry then explicitly
authorized preparing and running the disposable native probe and will observe
the desktop part. Fixture `/tmp/dough-194-native-2UViTC/refinement` was installed
by the actual v0.3.51 installer, release commit
`3bf0011c80be5e2a7834e2a294ed9d96348b3f85`; payload comparison passed.
Preparation Yui-chan, allocation `269478c57f9b76c999d396d11288e5853b0b5a3a`,
was announced solely on its disposable local bare origin. CLI/shared daemon
are 0.159.3; configured model/policy and existing daemon remain unchanged.
Probe exercises production launchCodex/input/RPC/conversation with an
attempt-local durable writer; HTTP/browser and machine store are omitted.
Native launch is held until slice 2 delivery. Setup evidence and owned harness
are in `/tmp/dough-194-native-2UViTC`; incomplete native evidence remains active.

## Slice 2 accepted proof

The pre-change browser/HTTP command `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-preparation-codex.spec.ts --workers=2 --grep 'workspace-and-branch'` exited 1: retry after fixture worktree/branch removal added Akiho-chan beside original Yui-chan. Real installed scripts/Git supplied the defect; native substitution supplied RPC only.

The implemented retry uses explicit installed `continue`, verifies the retained
workspace/branch and exact published allocation, preserves saved-start bytes
when refused, and never falls through to a new owner. Unsupported/missing
installation and inconsistent saved facts also refuse safely. Only verified
nonacceptance permits a new start; that disposition is cleared before the next
attempt. Native reconciliation retains precedence.

Independent post-change refactoring preserved behavior and the public exports,
split cohesive preparation/announcement/test/document seams, and declared the
new runtime helper in install.sh. Coordinator inspected the changed owners,
setup and assertions and accepted these terminal results after refactoring:

- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-preparation-codex-retry.spec.ts dashboard/tests/agent-launch-preparation-codex-continuation.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts dashboard/tests/agent-launch-preparation-kept.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/preparation-start-result.spec.ts dashboard/tests/agent-launch-preparation-stops.spec.ts --workers=2` — exit 0. Real origin/candidate installed-script/browser/HTTP proof observes repeated refused retries preserving start bytes, allocation/profile/tip/workspaces/branches/native calls, intact restart and Claude retry, independent Story B, lost-result/legacy continuation, and native recovery despite missing preparation ref.
- `node --test src/skills/dough-story-refinement/scripts/preparation-assignment-continuation.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-reuse.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-lost-workspace.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-stops.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-owned-context.test.mjs` — exit 0, 17 tests. Real CLI/Git asserts exact owner/branch/allocation, unchanged draft/profile/ref on refused or unconfirmed continuation, missing-workspace preservation, successor-safe release/abandon and owned-context startup.
- `npm run typecheck:dashboard` — exit 0.
- `PATH=/opt/homebrew/bin:$PATH npm test -- tests/install-public-payload.sh tests/payload-declaration-links.sh` — exit 0; actual installer verifies runtime payload bytes in native roots. Default Bash 3 refusal was resolved with existing Homebrew Bash 5.
- `git diff --check` — exit 0. Selective installed Prettier plus shfmt formatting succeeded before staging; check-only staged lint belongs to commit.

Existing start/release/abandon and execution's default start subprocess are
unchanged; reviewed preparingJourney/launchJourney, one-shot fixtures and
native owned-context consumers retain those commands. This CLI continuation
operation does not change skill discovery/invocation/native activation.
Slice 1/3 native desktop acceptance remains separate and pending.
