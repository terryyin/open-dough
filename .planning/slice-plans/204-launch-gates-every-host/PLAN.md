# Launch gates apply to every host

**Identity:** SEED-075#launch-gates-every-host
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#launch-gates-every-host)
**Authority:** Execution authorized by Terry on 2026-10-01; this plan was previously prepared under refinement/planning authority.
**Preparation:** Reuse the established workspace
`/Users/terryyin/git/open-dough/.worktrees/launch-gates-apply-to-every-host`,
branch `codex/launch-gates-apply-to-every-host`, agent `joseph-chan`, published
assignment `a04edf85d0af3abb39f1734401305e008cc5b81b`, remote `origin`, target
`main`, integration checkout `/Users/terryyin/git/open-dough`.
**Dependency:** SEED-075#session-record-per-host. Before implementation,
incorporate its delivered record variants and re-read the host boundary supplied
by SEED-075#one-host-description. SEED-072's active startup-lifetime work also
reaches `AgentLaunches`; recheck that the gate lasts until the launch attempt
settles, independent of when its HTTP response finishes. Adapt this same plan
if those changes invalidate an observed premise; retain the confirmed scope.

## Goal, scope, and decisions

Prevent accidental overlapping submissions of the same launch on every delivered
host, and apply unresolved-creation protection according to the host's declared
evidence requirement. Native recovery arguments belong to the host.

Terry confirmed Claude's change: refuse matching in-flight launches, including
ad hoc and start-less workflows, while preserving Claude admission when saved
launch evidence is unreadable. Startup completion releases the in-flight gate;
an agent continuing to work does not itself hold it. Existing assignment,
installed-start, and retained-evidence admission rules remain authoritative.

Preserve `sameLaunch`: project, host, workflow, and story identity, or instruction
for ad hoc sessions. Model/options/policy/title changes do not distinguish story
retries. Caller detachment does not release the gate. Distinct matching subjects
remain independent; this is no cross-host story lock.

Codex still records creation before native `thread/start`, keeps unresolved
creation across restart, and refuses another creation from unreadable evidence.
Both the launch response and the unresolved-creation entry name the record's
host and show its own safely quoted history inspection arguments. Existing Codex
creation records containing workspace/endpoint but no session ID stay usable.
Known-session first-input reconciliation is preserved, including refusal to
blindly resend uncertain input.

**Deferred:** Cursor delivery; creation recording for Claude; automatic native
reconciliation; new recovery UI; inter-server or inter-machine launch locking;
a limit on active sessions after startup; stored-record migration.

## Architecture and PFE

Follow the existing [Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
direction: common lifetime and evidence, native operations behind `LaunchHost`,
and host facts supplied by the host. Accepted
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
and [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) support
one representation per concept and sufficient proof for affected boundaries.
The index and in-file statuses agree; no relevant conflict or exception was found.
Proposed dashboard ADR 0008 does not supply binding constraints.

| Existing solution and evidence | Decision |
| --- | --- |
| `src/launchRequest.ts` `sameLaunch`, used by the running set and the creation/session store | Reuse this matching rule; do not create another request key or model-sensitive identity. |
| `server/agentLaunches.ts` adds a controller before awaiting and removes it in `finally` | Change this existing gate to cover all hosts; preserve its ownership across caller detachment and errors. |
| `server/startLaunch.ts` refuses a running installed start; installed workflow scripts enforce assignments | Keep these narrower protections. They own workspace/assignment startup, not ad hoc native launch lifetime. |
| `LaunchHost` already represents optional native operations; `codexHost.ts` and `claudeHost.ts` expose the delivered boundaries | Add the creation-evidence declaration and recovery operation here, using the established host description for names. Do not introduce a parallel registry. |
| `launchRecording.ts`, `launchRecordStore.ts`, `launchRecordDocument.ts`, and `machineJsonStore.ts` hold one machine-local evidence document | Keep its store, atomic writes, lock, retention, and unreadable-file preservation. No new creation store. |
| `launchCreation.ts` and `CreationEntry.tsx` format recovery; `shellCommand` already quotes argument vectors | Move the Codex argument construction to its host module; common display formats host-produced data. Derive predecessor recovery from saved endpoint/workspace through that same host operation. |

## Observed premises

Observed on 2026-10-01 at `a04edf85`; implementation must recheck after the
named dependency and other overlapping work land.

| Premise | Consuming operation | Literal observation and result |
| --- | --- | --- |
| The current gate is Codex-only, but its running set already covers the entire attempt | Universal duplicate admission | Read `AgentLaunches.launch` and `attempt` in `dashboard/server/agentLaunches.ts`: host comparison surrounds only the duplicate check; controller registration is synchronous; removal is in `finally`. |
| Matching ignores story choices and distinguishes hosts/workflows/projects; ad hoc matches instruction | Duplicate lookup and retained creation lookup | Read `sameLaunch` in `dashboard/src/launchRequest.ts`. `rg -n 'sameLaunch' dashboard` finds callers in `agentLaunches.ts` and `launchRecordStore.ts`, with no other matching implementation. |
| Lower-level installed-start refusals currently own the Claude duplicate response | Slice 1's changed expectations and preserved start protection | Read `dashboard/tests/agent-launch-start-duplicate.spec.ts`: both cases require `failed/already-starting`, one claim/workspace/session. The baseline command below passed both. The earlier universal gate will instead use the current Codex `uncertain/unconfirmed` answer. |
| Creation recording is currently used only by Codex before native creation | Host declaration and required evidence gate | `rg -n 'creationCommand|creationRecovery|\.creating\(|creationSchema|launchRecording\(' dashboard` traces the only `creating` call to `hosts/codex/launch.ts`, before `thread/start`. Schemas are consumed by the physical store and GET-response parser; response recovery is in `AgentLaunches`, browser recovery in `CreationEntry`. |
| Unreadable evidence leaves the original file untouched on reads, and Claude can launch and move it aside on write | Preserve Claude admission and predecessor artifacts | Read `machineJsonStore.ts` and `creationOf` in `launchRecordStore.ts`; the unreadable-store journey in `agent-launch-records.spec.ts` passed against its isolated real filesystem. |
| Saved Codex creation works across server restart and yields an executable native history picker; known-session recovery avoids duplicate input | Slice 2's compatibility proof | Baseline `agent-launch-codex-creation.spec.ts` passes stored workspace/endpoint, restart refusal, page display, shell-executed fake CLI arguments, and native call counts. `agent-launch-preparation-codex-recovery.spec.ts` passes preserved assignment, original intent, one thread and one turn. |
| Existing fixtures can hold native launch without simulating the common admission rule | New HTTP duplicate proof | Read `dashboard/tests/fixtures/fake-claude` and `support/fakeClaude.ts`: `held` records the call before waiting for `releaseHeldClaude`; `support/codexLaunch.ts` provides the held Codex protocol. `agentLaunchBoundary.ts` submits raw HTTP through the real middleware. |

Baseline command (unchanged product, synthetic hosts and isolated local origins):

```sh
env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=line --workers=4 dashboard/tests/agent-launch-start-duplicate.spec.ts dashboard/tests/agent-launch-codex-creation.spec.ts dashboard/tests/agent-launch-records.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts
```

Result: **9 passed (8.4s)**. `npm run typecheck:dashboard` passed. The first
baseline attempt failed before the journeys because worktree-local Vite was
missing; `npm ci --ignore-scripts --no-audit --no-fund` installed the pinned
local dependencies, and the rerun above settled the premise. These are baseline
observations, not proof that the planned changes are implemented or passing.

## Proof ownership

| Checkable promise | Owning slice | Observable proof |
| --- | --- | --- |
| One overlapping native launch for Claude and Codex, including blank ad hoc and start-less workflows | 1 | New `agent-launch-duplicate.spec.ts`: raw HTTP, held native launch, second refusal, one native launch/input and one saved session after release. |
| Story retry choice changes cannot bypass the gate; distinct subjects remain independent | 1 | Focused `sameLaunch` cases plus representative HTTP overlapping/different-subject requests in the new duplicate spec. Preserve admission rules when selecting valid examples. |
| Detachment leaves the first attempt protected, and completion/failure releases the gate | 1 | Abort the first HTTP caller while the fake remains held; second request still refused. Release or fail the first; retry reaches native launch. Existing Codex lifetime spec protects detached durable acknowledgment and cleanup. |
| No duplicate workflow start, claim, workspace, or input | 1 | Update `agent-launch-start-duplicate.spec.ts` only for the earlier gate's answer; keep its origin/workspace/session assertions. Preserve the Codex preparation-recovery test. |
| Creation gating follows declaration, with unreadable Claude admission and unreadable Codex refusal | 2 | New `agent-launch-creation-gates.spec.ts`: seed corrupt evidence before HTTP POST, assert Codex makes no `thread/start`, Claude reaches native launch and preserves unreadable evidence as today. Focused helper proof uses a declared stand-in host without adding a product host. |
| Host-supplied name/arguments in response and page; absent recovery never borrows another host's command | 2 | Focused recovery contract cases plus HTTP/page assertions through `CreationEntry`; exercise an arbitrary stand-in argument vector and absent operation. Shell argument boundaries use `shellCommand`. |
| Existing Codex creation records still block and offer the same saved history picker across restart | 2 | Existing `agent-launch-codex-creation.spec.ts` unchanged in its saved-record and native-call assertions. Retain a predecessor record with only workspace/endpoint. |
| Known-session first-input reconciliation and no blind resend remain intact | 2 | Existing `agent-launch-codex-reconciliation.spec.ts`, `agent-launch-preparation-codex-recovery.spec.ts`, and `agent-launch-ad-hoc-codex-recovery.spec.ts`. |
| Shared gates/display contain no Codex name test or native argument construction | 2 | Review all production consumers found by the search above and the diff; native arguments remain within the Codex module. Typecheck covers the server response and browser reader together. |

## Slices

### 1. One in-flight launch per matching request for every host

Type: Behavior
Status: done
Proof: The new duplicate boundary spec and the existing start-duplicate,
preparation-Codex-recovery, and Codex-lifetime specs pass; dashboard typecheck passes.

Behavior: Given a matching launch attempt still starting or reconciling, when
another page or HTTP caller submits it, then it receives the existing
`uncertain/unconfirmed` duplicate answer and no second start, session, or input
is made, for either delivered host. A different matching subject remains
independent. Detachment preserves protection; settling the attempt releases it.

Extend the existing running-set gate, using `sameLaunch` unchanged. Add proof
first through the real launch route with held native fixtures; do not replace
`AgentLaunches` with a fake. Retain the installed-start gate for starts that
continue after the outer wait ends. Update the two installed-start duplicate
response assertions intentionally, preserving their cardinality proof. Document
the in-flight scope and release boundary in `dashboard/AGENT-LAUNCH.md`.

Safe stopping point: Claude gains accidental-duplicate protection; existing
Codex creation safety and recovery remain as delivered. This slice needs no
new creation contract. Sizing: one common admission rule and its lifecycle proof
loop, including focused verification and slice-local refactoring.

### 2. A host's evidence requirement controls creation safety and recovery

Type: Behavior
Status: done
Proof: The new creation-gate and focused recovery contract cases, existing
creation/records/reconciliation/preparation/ad-hoc recovery specs, and dashboard
typecheck pass; shared consumers no longer construct native Codex recovery.

Behavior: Given a host that requires durable creation evidence, when a launch
encounters unreadable evidence, then no native creation occurs and its response
names the host's reconciliation advice. When it encounters a saved unresolved
creation, no new creation occurs and the response/page show that host's recovery
arguments from the saved facts. Unreadable evidence supplies no fabricated
endpoint or command. A host without that requirement can still launch from
unreadable evidence. Predecessor Codex records keep their history inspection;
known-session recovery never creates or blindly resends input.

Use one optional creation-evidence operation on the existing host boundary as
the declaration and the owner of native recovery arguments/unreadable advice.
Codex provides it; Claude leaves it absent. Shared orchestration asks that
operation before workflow/native start. Preserve Codex's awaited durable writer.

Move `codex resume --remote ... --cd ... --include-non-interactive` construction
into the Codex module. The response projection carries the resulting inspection
arguments to common display; `shellCommand` only formats them. Resolve legacy
workspace/endpoint records through the same host operation on read, leaving
their physical store unchanged. Keep the stored evidence and returned view
explicit in the types/parsers so recovery data survives the GET parser. Missing
support yields unavailable recovery, not a Codex fallback. Extend the existing
entry rather than adding a second recovery interface. Update the feature's
maintained documentation with declaration-driven admission and compatibility.

Safe stopping point: Both story promises are complete; Cursor can later supply
its own native contract without changing common gates. Sizing: one creation
safety/recovery journey across the boundary, response, and browser. Keep these
representations in the same slice because a gate without usable recovery would
leave its refusal incomplete; no preparatory framework slice is warranted.

## Verification and execution gates

At each slice, run its named focused specs using
`env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --workers=4 <files>`
and `npm run typecheck:dashboard`. Slice 2's shared creation contract reaches the
stored document, response parser, and UI; its listed compatibility journeys cover
those different purposes. Broaden checks if changed fixtures introduce further
consumers; a full dashboard suite is not a local gate merely because CI runs it.

Apply the installed post-change refactor workflow to implicated concepts before
delivery. For slice 2, creation recovery necessarily spans the host boundary,
common evidence/response orchestration, and browser formatting: keep that concept
coherent across these named representations while preserving stored records.
Execution owns independent refactor review, commit, publication, and asynchronous
CI repair under its installed workflow. The repository's check-only
`.githooks/pre-commit` runs staged lint; no such delivery happens in this
planning-only session.

## Preparation review

Two Behavior slices, two independent proof loops: matching launch lifetime and
evidence-dependent creation recovery. Slice 1 leaves useful safety without the
creation contract; slice 2 keeps gate, native command ownership, predecessor
compatibility, and page display together. No numeric timing policy was supplied;
none is invented. No slice-specific concern remained in this construction
review, so a separate slice-plan-refinement pass was unnecessary. Dependencies
and baseline revision are explicit; recheck overlapping delivered changes at
execution startup. Readiness is recorded in the canonical story by the shared
preparation recorder, not inferred from this prose.

## Execution context and accepted proof

Story-branch execution authorized 2026-10-01, identity `SEED-075#launch-gates-every-host`, publisher `dashboard-mac.lan-open-dough`, agent `ebacky-chan`.
Workspace `/Users/terryyin/git/open-dough/.worktrees/launch-gates-apply-to-every-host`; branch `codex/launch-gates-apply-to-every-host`; remote `origin`, trunk `main`.
Established claim `dbc55abe03c6e8b997721cd196250185313bd772`; starting revision `6428a5c1ffb33d26d5ea15c4a9042447c23d2a14`.
Session-record dependency landed at `da3afd04` and was incorporated before implementation. Host-description boundary reread; existing `LaunchHost` remains. Startup-lifetime sibling is unlanded; current synchronous running registration and `finally` release span the whole attempt despite HTTP detachment.
Checkout-local `npm ci --ignore-scripts --no-audit --no-fund` and dashboard typecheck passed; locked metadata unchanged. Existing planning authority retained; no numeric slice limit supplied.
CI: GitHub Actions `ci.yml`, execution branch on `terryyin/open-dough`; Codex observer `ebacky-chan`, `/tmp/dough-ci-501/watch-n8GCrg`, cell `18`, session `73631`, PID `23822`, bound to this checkout/branch. Claim trunk CI unobserved; managed delivery covers branch increments.
Slice 1 published `1dd48501ec3a43cc9dcbbfca937653182fe77b95`, accepted on `refs/heads/codex/launch-gates-apply-to-every-host`; observation reused. Slice 2 uses that previously published base.

### Slice 1

Prechange real-route proof failed: second held blank Claude launch timed out instead of receiving `uncertain/unconfirmed`.
```sh
env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --workers=4 dashboard/tests/agent-launch-duplicate.spec.ts --grep 'claude: overlapping blank' --timeout=45000
```
Accepted terminal exit 0:
```sh
env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --workers=4 dashboard/tests/agent-launch-duplicate.spec.ts dashboard/tests/agent-launch-matching-rules.spec.ts dashboard/tests/agent-launch-start-duplicate.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts
npm run typecheck:dashboard
```
Duplicate HTTP observations cover both hosts' instructed/blank ad hoc and start-less story counts/refusal, original intent under changed choices, detachment, settlement/refusal release and distinct subjects. Matching rules cover project/host/workflow/subject and story-choice invariance. Existing claim/workspace/session cardinality, preparation recovery and Codex lifetime proof remain.
Setup: real preview/HTTP from `dashboardTest.ts`/`agentLaunchBoundary.ts`; only vendor answers are synthetic (`support/codexLaunch.ts`, Claude fixture). New `holdCreation` defaults false and holds only native blank creation.
Coordinator inspected assertions/setup/admission. Independent refactor: `none — already clean`, `## REFACTOR COMPLETE`; proof unchanged. Formatting passed; it was repeated after the first call's completion handle was lost.

### Slice 2

Prechange saved-creation GET proof failed because parsed host recovery was absent:
```sh
env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --workers=4 dashboard/tests/agent-launch-creation-gates.spec.ts --grep 'saved creation'
```
Accepted terminal exit 0:
```sh
env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --workers=4 dashboard/tests/agent-launch-creation-gates.spec.ts dashboard/tests/agent-launch-creation-recovery.spec.ts dashboard/tests/agent-launch-codex-creation.spec.ts dashboard/tests/agent-launch-records.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-recovery.spec.ts
npm run typecheck:dashboard
```
New gate assertions observe real HTTP unreadable Codex refusal (`thread/start` zero), unchanged corrupt evidence, Claude native admission and preserved unreadable artifact; saved unsupported recovery passes actual GET/page without borrowed commands. Stand-in host facts exercise common projection, refusal, GET parser, page display and harmless shell argument echo; declared evidence without arguments still gates with unavailable recovery.
Existing creation journey checks predecessor workspace/endpoint-only disk data, restart refusal, shell-executed picker arguments and native counts; existing records/known-session/preparation/ad-hoc recovery observations remain unchanged. Stand-in browser proof replaces only returned native facts, not the GET parser or UI; delivered hosts use real middleware and isolated machine evidence.
Reviewed current consumers: physical store/document/recording, host operation, common gate/response, GET schema, App/CardLaunches/RecentSessions/CreationEntry. No stored migration or native first-input edit. Shared production gate/display search contains no Codex test or native argument construction.
Coordinator inspected mapped boundaries/assertions/setup. Independent refactor: `none — already clean`, `## REFACTOR COMPLETE`; no invalidated proof. Formatting passed after mechanical JSON-response type annotation; runtime observations unchanged.
