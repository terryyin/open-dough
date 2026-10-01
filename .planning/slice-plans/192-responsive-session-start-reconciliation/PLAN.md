# Responsive session startup and reconciliation

**Identity:** SEED-072#responsive-session-start-reconciliation
**Source:** [refined story](../../seeds/SEED-072-responsive-session-start-reconciliation.md#responsive-session-start-reconciliation)
**Authority:** Planning only; no Take, implementation, commit, or publication.
**Preparation:** Existing workspace `/Users/terryyin/git/open-dough/.worktrees/keep-the-dashboard-responsive-while-session-star`, branch `codex/keep-the-dashboard-responsive-while-session-star`, remote `origin`, target `main`, agent `ealden-chan`, published assignment `87990a4a4bfb66d1a797714a04298acfd4d97301`, integration checkout `/Users/terryyin/git/open-dough`.

## Goal and scope

A developer gets immediate feedback on Start and can use the dashboard again
once a recoverable launch has been handed to the local service. The affected
story's action buttons stay disabled until local startup and authoritative
published state reconcile. This ends at startup settlement, not agent completion.

Cover refinement, execution, retained-start continuation, and unattached sessions
for Claude Code and Codex. Preserve instructions/options/model, pre-launch
warnings and authorization, native identities, workspace and assignment recovery,
existing session presentation, and ordinary terminal/sidebar controls.

Terry selected recovery outside the protected frame on 2026-10-01: stop animation
when progress is not known, retain disabled card actions, and offer safe recheck
or verified continuation in local project/session feedback. Continuing must use
the saved attempt under existing recovery rules, never silently replace it.

Deferred: session cancellation, durable story lifecycle changes, SEED-066's new
session choices, terminal redesign, a cross-machine queue, a generic job system,
and a numeric startup-time SLA. No skill/runtime payload change is assumed.

## Architecture and PFE decisions

Use [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
for feature-local design ownership and
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for distinct domain facts and published derivation. Relevant Accepted constraints
were checked during refinement and remain applicable; no conflict or exception
was found. ADRs 0008 and 0009 are Proposed and bind nothing.

The [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md), launch-actions
and claim/workspace topics, guides existing session placement and published/local
separation. The selected story replaces modal waiting and temporary protection
behavior only; final feature documentation must align those topics with delivery.
No new product-wide direction or ADR is needed.

| Existing responsibility and inspected evidence | Decision |
| --- | --- |
| `AgentLaunches`, `launchRun`, native adapters: detached callers already allow native evidence to finish | Extend this launch owner with durable acceptance and observable attempt outcome; do not create a second background job platform. Catch deferred failure, preserve recovery, and dispose resources through this owner. |
| `startStore`, `machineJsonStore`, `launchRecordStore`: machine-local atomic evidence and retained starts | Reuse atomic storage and existing start/native references. Fill the gap for an exact accepted request before side effects, including refusal/no-assignment/ad hoc paths; do not use repository story state as a job store or duplicate native evidence. |
| Installed `execution-start` and `preparation-assignment`; `startWorkflows`, `launchStart` | Reuse assignment/workspace/publication/continuation semantics. Store accepted publication receipts and distinguish absent publication from unknown publication. |
| `LaunchDialog`, `useLaunchDialogLauncher`, `launchAttempts`, `useAgentLaunches`, `CardLaunches`, `WorkStages` | Change one common launch interaction and observation model. Derive frame protection by project/story, not a separate boolean for each button or host. |
| `usePublishedObservation`, pinned reads, authenticated read boundary and bounded `ghRead`/`trackedGh` | Keep remote facts with this reader. Add a narrowly validated containment observation for accepted publication versus displayed revision; there is no existing ancestry operation here. Reuse failure/rate-limit handling and catalog-origin guards. |
| Workflow progress is currently keyed by workflow; native duplicates are only partly guarded | Strengthen story-wide admission while the attempt is unresolved, including alternate workflow requests. Reuse installed guards for remote ownership; no new cross-machine scheduler. |

One model keeps acceptance, current operation, native outcome, publication receipt,
and reconciliation distinct. Derive active versus needs-reconciliation presentation
from those facts. A receipt without a session is not launch success; a missing
running phase is not proof of refusal. Attempts are identified independently of
card mounting, with story keys scoped to project and native IDs scoped to host.

## Observed premises and proof limits

Inspected at workspace HEAD `87990a4a4bfb66d1a797714a04298acfd4d97301` with the
retained refinement draft. Observations use temporary fake machine state, local
bare Git origin, synthetic GitHub and native-host protocols; no real launch,
GitHub access, assignment publication, or paid model call was made.

| Premise / consuming operation | Literal observation and result |
| --- | --- |
| Dialog currently waits for full launch outcome; browser callback returns a confirmed session, not admission. Slices 1–2 must change both callers. | Read `LaunchDialog.tsx` form submission through `onStart(...).then(...close())`, `launchAttempts.ts` through `requestAgentLaunch`, and `agentLaunchPlugin.ts` launch answer through `await launches.launch`. Read `StartSession.tsx` terminal opening and `CardLaunches.tsx` session focus callbacks. Safe early acceptance is an explicit gap, not existing behavior. |
| Machine evidence and installed starts are real usable seams, with publication held independently of native launch. Slices 1–4 reuse them. | Read `startOrigin.ts` installation/copy and Git URL rewrite, `agentLaunchBoundary.ts` HTTP helpers, preparation phases and duplicate assertions. Run baseline A below: passed, observing real installed publication and one claim/workspace/session under duplicate execution. It does not prove cross-workflow exclusion. |
| Codex detached work still records acceptance and connection failure; slice 1 must preserve cleanup ownership. | Read `agent-launch-codex-lifetime.spec.ts` detached fetch, persisted acknowledgment, connection failure, zero-socket assertions and deletion race. Baseline A passed. This proves current native-owner behavior, not new service admission or remote reconciliation. |
| Existing ad hoc and retained execution consumers preserve their native identity/context. Slices 2 and 4 must preserve their incompatible purposes. | Read `StartSession.tsx`, `CardLaunches.tsx`, Codex start assertions and ad hoc recovery assertions. Baseline B passed, including original blank intent and uncertain-input restart recovery without resubmission. |
| Published snapshots expose pinned revision and partial enrichment; slice 3 must await needed facts rather than any snapshot. | Read `publishedWork.ts`, `publishedObservation.ts` accepted-membership/progress callbacks, `publishedWorkRead.ts`, `ghRevision.ts`, `authenticatedRead.ts`, and `ghRequest.ts`. Ref resolution/pinned contents exist; ancestry comparison does not. Fake GitHub can hold answers through `RepositoryAnswerer`, but its request parser needs compare support if that operation is selected. No assumption of existing containment proof. |
| Frame protection includes more than Start; slice 2 must cover all card buttons while preserving source readability. | Read `WorkStages.tsx` article/detail/owner/source rendering and `CardLaunches.tsx` alternate workflow, creation and session controls. Search callers with `rg -n 'AgentLaunches|requestAgentLaunch|useLaunchAttempts|runningStarts|keptStarts' dashboard src tests scripts`: HTTP, page, session actions, alert owner and boundary helpers are consumers. No exported function relocation is prescribed. |

Baseline A (passed, exit 0):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-duplicate.spec.ts dashboard/tests/agent-launch-preparation-phases.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts --workers=2
```

Baseline B (passed, exit 0):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-ad-hoc.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-recovery.spec.ts --workers=2
```

The first run failed to spawn worktree-local Vite. `npm ci --ignore-scripts`
installed locked dependencies. A subsequent run reached the assertions but the
quiet reporter rejected conflicting color-environment warnings; the commands
above removed both variables and passed. These baselines establish existing
seams only. The new final journey remains proof to build, not a completed test.
Native-host doubles prove dashboard contracts, not real agent skill execution.

## Proof ownership and execution gates

| Story promise / examples | Owning slice and observable boundary |
| --- | --- |
| Recoverable safe handoff, exact request, no duplicates, detached lifetime | 1: real service HTTP acceptance/status plus local store and held workflow/native fixture |
| Immediate Cancel/Start cutoff, Escape suppression, dialog release, all card buttons disabled, unrelated controls operable; examples 1–2 and 9 | 2: real page journey with accepted work held before publication/native completion |
| Local/published distinction, stale/out-of-order read protection, stage moves, current eligible actions while agent remains active; examples 3–6 and 8 | 3: page plus real local-origin publication and authenticated pinned/containment read |
| Lost acknowledgment, failed refresh, interrupted publication, restart/reload/project switch, static recovery and verified continuation, absent story; examples 5–9 | 4: page/service restart against same fake machine store, original IDs/workspace and call counts |
| Reduced motion, truthful visual/accessible status, polite announcements, useful focus without delayed focus theft; example 10 | 5: keyboard/reduced-motion page assertions and inspection of rendered status/animation rules |
| Pre-launch authorization/options/model, native blank ad hoc intent, sidebar/terminal behavior and no story mutation from local actions | 1–2 preserve request/admission; 3 preserves published truth; 4 preserves continuation; focused existing host/ad hoc/terminal regression checks at affected caller boundaries |

Use one new cohesive browser journey, proposed as
`dashboard/tests/responsive-session-start.spec.ts`, extended by slices rather
than parallel host/workflow implementations. Separate focused service/containment
and recovery specs where the browser cannot observe ownership or cleanup. Use
real handlers and installed commands with controlled bare origin/native fixtures;
do not supply the product's admission, publication, or reconciliation through mocks.
GitHub/native responses are controlled external answers, not claims of native use.

Each slice adds outside-in proof and its implementation/cleanup together. Run the
focused new journey and impacted existing owners after edits. Type checking is
appropriate for changed TS schemas and asynchronous API consumers:
`npm run typecheck:dashboard`. A browser run builds the app through global setup.
No full repository suite is a routine local gate for this dashboard-only change.
If shared installed scripts become necessary, stop to reassess affected consumers
and payload gates; do not hand-edit managed installed copies.

Execution follows the installed execute-plan acceptance/refactoring/delivery
contract, including independent post-change refactoring before commit and CI-safe
increments. The actual local commit hook is `.githooks/pre-commit`, which runs
`npm run --silent lint -- --staged`, check-only. Preserve selective formatting and
agent commit tooling; publication and execution require their own authorization.
No numeric slice target/hard limit was supplied. Bound each slice by one outcome
and focused proof loop, including cleanup. If implementation reveals hidden
preparation or independent outcomes, revise remaining slices before extending
work; preserve completed proof and use the installed overrun/escalation rules.

## Ordered slices

### 1. Recoverable launch acceptance survives the requesting connection
Type: Behavior
Status: planned
Proof: Extend service boundary/lifetime specs; hold publication or native startup,
observe accepted request/status before releasing the hold, detach the HTTP caller,
and observe later outcome and owner cleanup. Store-write refusal causes no side
effects. Concurrent same-story requests across workflows make no second start.

Behavior: Given a valid request, acceptance persists its exact intent and recovery
reference before side effects, then hands work to the existing service owner.
An accepted attempt has a stable observable identity and outcome independent of
its caller. Deferred failures are observed and retained by that owner. Shutdown
leaves conservative recovery and disposes owned connections without stopping
native work. Preserve current admission/security and installed workflow rules.

Change the shared transport/callers and affected boundary helpers coherently.
If retaining a full-result compatibility route is needed during rollout, both
routes delegate to the same owner; slice 2 removes obsolete browser waiting.
Do not treat any transport compatibility layer as another launch authority.
Safe stop: service acceptance/status is independently usable and existing page
behavior stays green until slice 2; no intentional failing tests are delivered.

### 2. Start releases the dashboard while protecting its story
Type: Behavior
Status: planned
Proof: The new page journey submits each launch mode through the real service
while work is held. Assert immediate disabled Cancel/Start, Escape suppression,
immutable submitted choices, modal closure after observed acceptance, all frame
buttons disabled, readable source links, and working unrelated cards/navigation.
Verify pre-submit Cancel/Escape sends nothing. Include both host request contexts.

Behavior: Submission immediately commits the request and protects the entire
story frame. Accepted handoff closes the modal before slow preparation/native
completion; missing acknowledgment shows uncertainty, not accepted success.
Ad hoc feedback stays local to its project/attempt and invents no card or story.
Render from the shared attempt observation rather than per-button flags.

Safe stop: keep protection conservatively until slice 3 proves reconciliation;
known unresolved outcomes must show a static explanation and existing Refresh/
native recovery direction, not an indefinitely animated card.

### 3. Reconciled publication restores the current story actions
Type: Behavior
Status: planned
Proof: Extend the page journey with held/out-of-order published reads. Publish
Take/Preparing through the real installed command on bare origin, then deliver
an older snapshot, an unrelated revision, the accepted revision and a descendant.
Only containment plus settled native outcome clears protection. Cover no expected
publication, definitive no-effects refusal, superseded assignment, removal,
partial fact enrichment, and still-working native session. Observe current valid
actions and local/published labels rather than only an internal settled flag.

Behavior: For a publishing attempt, reconcile its accepted receipt against the
current pinned remote observation and current facts. Equality or proved containment
establishes publication; changed SHA alone does not. For a definitive refusal or
no-publication mode, require a fresh read requested after established outcome.
Uncertain publication stays protected pending workflow-owned verification.
Protection follows project/story identity through Backlog/Taken movement.

Add containment through the authenticated catalog-scoped bounded read responsibility,
with failure/rate-limit proof and no arbitrary repository/shell inputs. Reuse
existing Git publication containment evidence where suitable; browser SHA guesses
are insufficient. Test actual containment against the local Git history and its
external compare answer adapter. This new operation is part of this slice's
proof, not an unobserved existing capability or a reason for broad infrastructure.
Safe stop: resolved starts unlock correctly; interrupted outcomes remain protected
with existing safe recovery instructions until slice 4 supplies the selected UI.

### 4. Interrupted startup can be safely reconciled outside the card
Type: Behavior
Status: planned
Proof: Extend recovery specs/page journey for lost acceptance/native/publication
acknowledgment, failed remote read, server restart on the same machine, page reload,
project switch, and a second page. Assert static needs-reconciliation explanation,
disabled normal card buttons, accessible outside-card recheck/continuation, original
workspace/native identity and unchanged creation/input counts. Observe refresh
recovery and published-assignment/native-refusal continuation. If a story disappears,
its recovery feedback remains discoverable outside the frame.

Behavior: Retained evidence restores unresolved protection before offering launches.
An active operation may show progress; absent liveness evidence gives a static
explanation. Recheck observes saved/native/remote evidence. Continuation invokes
existing verified recovery for that exact attempt; refusal or mismatched ownership
keeps evidence and explanation rather than creating replacement work. An unreadable
store or unavailable service does not imply no launch. Local recovery creates no
published story facts. Blank ad hoc intent retains its existing no-input contract.
Safe stop: all startup outcomes have truthful progress or a recoverable static
explanation, without waiting for the whole agent session.

### 5. Startup status and focus remain usable without motion
Type: Behavior
Status: planned
Proof: New page journey with reduced motion and keyboard submission asserts
perceivable disabled-action reasons, status text distinct from stage/selection,
polite transition announcements without poll repetition, and enabled focus target
after modal closure. Navigate to another task before settlement; completion must
not take its focus. Inspect active/static indicator behavior and coexistence with
selection/Shown-in-terminal marks; preserve existing terminal/sidebar journeys.

Behavior: Pending frames remain legible without color or motion. Animation means
known progressing work; uncertainty is static. Handoff restores meaningful focus
outside disabled controls. Later native/remote results preserve session presentation
without interrupting work begun after handoff. Update maintained launch/start docs
and the North Star's affected interaction topics to describe the delivered contract.
Safe stop: the full story is usable by keyboard and under reduced motion, with
all earlier proof still mapped and green.

## Current decisions and review

- Safe reconciliation outside the protected card is selected, not an open scope question.
- The same owner handles acceptance, deferred outcome and recovery across launch modes;
  hosts translate native operations rather than own alternate startup policy.
- All card action buttons are protected, including inspection/session actions.
  Source links stay readable; terminal/sidebar controls keep their separate contracts.
- No fixed retry count or timing policy is invented; existing bounded waits and
  rate-limit directions apply. Timer expiry establishes uncertainty, not absence.
- Cumulative review: five capability slices extend one evidence model. Each has
  a distinct externally observable proof loop and safe conservative interim behavior;
  none is split by file, layer, host, or test activity. No slice-specific concern
  was found in this review. New admission and containment are explicit work with
  owned proof, rather than presumed existing mechanisms. Final proof is not yet run.
