# Shared dashboard code reads one host description

**Identity:** SEED-075#one-host-description
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#one-host-description)
**Authority:** Preparation only; no implementation or Take. One-shot refinement
commits the preparation result locally for review; publication is not selected.
**Preparation:** Established one-shot refinement in the default checkout
`/Users/terryyin/git/open-dough`, branch `main`, remote `origin`, target `main`,
landing `review`, starting revision
`11f748a9b0e58263351e18fb37053cb2d6378221`. No Preparing assignment.

## Execution context

Execution authorized by Terry's `dough-execute-plan SEED-075#one-host-description`
instruction on 2026-10-01; the preparation-only authority above describes
preparation history, not this execution.

- Execution and originating checkout: `/Users/terryyin/git/open-dough/.worktrees/shared-dashboard-code-reads-one-host-description`;
  existing owned linked worktree, branch `codex/shared-dashboard-code-reads-one-host-description`.
  No integration-checkout maintenance selected.
- Identity `SEED-075#one-host-description`, publisher `dashboard-mac.lan-open-dough`,
  agent `bastiaan-chan`, Story Branch Mode, remote `origin`, trunk `main`.
- Starting revision `28ffa54b97c31d9d6350aa5281b838b28bee60c4`;
  accepted claim/candidate `7f2ce02e41278fafed9df3674b187e822d6b48ed`, confirmed
  on remote main and the execution branch. Increments target the execution branch.
- Checkout setup: `npm ci --ignore-scripts --no-audit --no-fund` and
  `npm run typecheck:dashboard` passed against the current lockfile.
- Replanning retains existing planning authority; no new scope or hard limit.
- CI source: GitHub Actions, selected workflow `ci.yml`; claim's trunk CI
  is unobserved. Managed increment delivery owns observer establishment and registration.

## Goal and scope

A maintainer describes each host's shared facts once; shared server and browser
code consume them without host-name choices or borrowing another host's facts.
Claude and Codex keep their current choices, refusals, native input, and actions.

Included facts are display name, skill sigil, offered model aliases and labels,
untrustworthy-launch-answer hint, branch namespace, and availability of attach
and Mark as done. Shared helper and launch-choice interfaces require an explicit
host. Dispatch keeps unavailable hosts unavailable. Workspace collision checks
still include folders and Claude, Codex, and Cursor branch namespaces.

The dialog's initial Claude selection and boundary-level legacy defaults remain.
No new model offering, Cursor runtime, session-record variant, session-state
wording or alert policy, duplicate/creation gate, dynamic discovery, or external
host registration is promised. Existing specs retain every assertion and behavior
expectation; the three omitted-host workspace-test calls may add explicit
`"claude"` arguments under Terry's decision below.

<a id="current-decisions-and-remaining-concern"></a>

## Current decisions

- Reuse one browser-safe host description and the existing server `LaunchHost`
  boundary. Native commands, functions, and transport never enter the browser
  bundle. Derive request/model vocabulary from declared offerings; do not keep
  an independently maintained shared Claude model table.
- Capability presentation must have the same authority as the registered
  boundary's actual optional operations. Do not replace the current duplicate
  name-based booleans with independently maintained booleans and methods.
  Preserve the server's absence checks even when the UI hides an action.
- Delivered launch choices remain Claude and Codex. Known namespaces and
  delivered runtime operations are different facts: retain Cursor collision
  recognition without inventing a Cursor implementation.
- Equality used to qualify a session or match an installed definition is not
  host-specific dispatch. This plan removes comparisons for its listed facts,
  not all host comparisons throughout the product. Sibling stories retain
  ownership of their record, wording, alert, and launch-gate changes.
- Preserve the subsequently delivered workspace-retirement behavior: host
  capability does not alone grant terminal access. Keep workspace and session
  access checks, passive final-report fallback, and deliberate done intent.
  The host's existing `readResult` and terminal startup-failure contract stay
  native to that boundary; this story does not redesign them.
- Preserve the integrated all-host duplicate gate and host-owned creation
  evidence/recovery contract. Associating descriptions with the existing host
  boundaries keeps their native `creationEvidence` operation intact; no gate
  or recovery behavior changes are promised here.
- **Test-call decision for slice 3:** Terry allowed adding explicit `"claude"`
  arguments to the three `launchWorkspace` calls in `launch-workspace.spec.ts`
  on 2026-10-01. Preserve every assertion and expected behavior. The seed now
  records this distinction: the helper contract requires a host, and these
  test callers supply their existing intended host explicitly. No pending
  decision remains; this does not authorize weakening the required-host
  contract or implementing the story during preparation.

## Architecture and PFE

Reuse the existing `LaunchHost` boundary, browser-safe agent identities,
workspace allocator, and installed offer/start flow under the
[recorded architecture and existing-solution findings](OBSERVATIONS.md#architecture-and-pfe).
Accepted ADRs 0001, 0002 (§4–5), and 0005 govern vocabulary, one coherent
representation, and honest native-proof limits. No conflict was identified.

## Observed premises

[Preparation observations and literal baseline commands](OBSERVATIONS.md)
record the preserved launch, installed-start, terminal/done, compatibility,
collision, and public-client premises. The landing review observed 156 passing
tests and dashboard typecheck against integrated launch gates. Execution setup
above matches this checkout's current locked dependencies.

## Proof ownership

| Final promise | Slice | Observable proof |
| --- | --- | --- |
| One description supplies names, skill sigils, model offerings and labels, and uncertainty hints | 1 | Existing model UI/boundary/entry and Codex journey specs; new public-client failure spec; review all consumers against the same description. |
| Claude model order, Codex Default only, reset on switch, omitted Default, forged model refusal, retained requested label | 1 | `agent-launch-model`, `agent-launch-model-boundary`, `agent-launch-model-entries`, `agent-launch-codex` specs. |
| Only the matching delivered runtime is dispatched; Cursor stays unavailable | 1 | `agent-launch-refusal` checks neither vendor is called for Cursor; explicit registry lookup review. |
| UI attach/done availability agrees with real optional operations, with no borrowed operation | 2 | Existing terminal, Codex terminal, Claude done-stop, Codex done, and host-identity specs; workspace-retirement attach/done specs preserve access and passive-report behavior; review one capability authority and retained absent-method refusal checks. |
| Required explicit host throughout helper/launch-choice contracts and preserved initial Claude selection | 3 | Dashboard typecheck including tests; caller review; existing Claude and Codex start/preparation/options journeys. Execution will update the three workspace-test callers to explicitly supply Claude under the recorded decision. |
| Branch prefixes and cross-host/folder collision checks remain unchanged | 3 | `launch-workspace.spec.ts` using actual Git branches and folders, plus installed start journey branch assertions. |
| Legacy records/actions and valid stored model aliases retain their meaning | 3 (final verification), with model preservation in 1 | `agent-launch-host-identity`, `start-store`, kept/resume specs, full dashboard suite; inspect schema/default diff for unintended compatibility changes. |
| Every existing dashboard assertion and behavior expectation stays green | 3 (final verification) | `npm run test:dashboard` and `npm run typecheck:dashboard`; preserve every assertion when adding the three authorized explicit-host arguments. |

## Slices

### 1. Launch choices and answers use the selected host's description

Type: Behavior
Status: done
Accepted proof: [slice 1 delivery](OBSERVATIONS.md#slice-1-accepted-proof).
Proof: Existing model, retained-label, Codex-choice, and refusal specs above,
plus a focused `agent-launch-client.spec.ts` at the public request-client boundary.

Behavior: Given a Claude launch dialog, choosing Opus sends `--model opus`
and retains its label. Switching to Codex resets to Default, offers only
Default, uses `$` for the skill, and starts without a model. An unoffered
model is refused before any vendor process starts. An untrustworthy answer
keeps the selected host's own recovery hint. Unavailable runtime lookup never
selects another host.

Create the minimal browser-safe description, connect the existing server host
registry, and replace shared name/sigil/model/hint choices. Update all model
consumers, including `StartEffects`, `launchSubject`, request/result/start-store
schemas and Claude's own refusal-label reader; preserve existing aliases and
stored shapes. Add the missing client regression proof before changing that
branch (fetch rejection and malformed answer for both delivered hosts). Keep
native vendor operations private. Do not alter sibling pending/session wording.

Safe stop: existing launch journeys remain green; remaining capability and
explicit-host work is unfinished but no new host or behavior is offered.

### 2. Session controls follow the host's actual operations

Type: Behavior
Status: planned
Proof: `agent-terminal.spec.ts`, `agent-terminal-codex.spec.ts`,
`agent-launch-done-stop.spec.ts`, `agent-launch-done-codex.spec.ts`, and
`agent-launch-host-identity.spec.ts`, `session-workspace-retirement-attach.spec.ts`,
and `session-workspace-retirement-done.spec.ts`, plus capability-authority review.

Behavior: Given a recorded Claude or Codex session, its existing session-state
rules still offer Open terminal and Mark as done, and invoking them reaches
that host's own operation. No missing operation is supplied by another host.

Extend the same description/registry solution so browser capability facts and
server operations cannot drift through independently authored declarations.
Replace shared name-based capability predicates and align all consumers:
`sessionAccess`, `LaunchSession`, `TerminalSplit`, `TerminalPanel`,
`sessionRecordActions`, and `StartSession`. Preserve admission, done, terminal
lifecycle, and workspace-retirement access/final-report semantics.
Prove current available operations at real action boundaries; inspect absent
operation guards without introducing a hypothetical vendor adapter or test-only
host framework. Do not change alerts, continuation labels, or record variants.

Safe stop: the existing controls and native-operation boundaries remain green;
no runtime model or legacy interpretation changes.

### 3. Starts and helper calls carry the host explicitly

Type: Behavior
Status: planned
Proof: Workspace rules; Claude/Codex installed execution and preparation
journeys; options UI/boundary specs; host-identity and start-store compatibility;
typecheck and final full dashboard suite.

Behavior: Given the chosen host and occupied host branches/folders, starting a
story uses that host's installation, formatter, and branch namespace, avoids
every occupied slug, and retains the established start as today. Missing host
arguments are not accepted by shared helper interfaces; old external data keeps
its existing compatibility interpretation. New dialogs still select Claude.

Require host in `LaunchChoices`, `LaunchDialog`,
`LaunchOffers`, `StartWorkflow.establishes`, workspace, definition, options,
execution/preparation capability and formatter interfaces, and update their
actual callers, including adding explicit `"claude"` arguments to the three
workspace-test calls while preserving all assertions. Remove
`choices.host ?? "claude"` in launch attempts. Preserve
the explicit UI initial selection and legacy wire/store defaults. Keep installed
start scripts and their handoff protocol; do not rebuild those workflows.

Use the shared namespace facts for branch selection and occupied-slug collection;
retain Cursor collision handling even though Cursor has no runtime. Update the
host-description facts in `dashboard/AGENT-LAUNCH.md` and `LAUNCH-START.md`,
leaving their descriptions of still-undelivered sibling work accurate.

Safe stop: the whole selected story is satisfied only after this slice's
mapped proof and full regression verification are complete.

## Verification and delivery boundaries

Run each slice's named focused specs with
`npx playwright test --config dashboard/playwright.config.ts <files>`, after
the execution workflow's post-change refactor pass. Re-run dashboard typecheck
for changed shared interfaces. Final `npm run test:dashboard` is justified by
the story's explicit all-specs preservation promise and the description/model
contracts reaching launch and session presentations across the dashboard.
`npm run build:dashboard` is exercised by Playwright global setup; inspect the
browser dependency graph to ensure native code is not bundled.

The repository commit gate is `.githooks/pre-commit`:
`npm run --silent lint -- --staged` (check-only). Future execution follows the
installed `dough-execute-plan` refactor, delivery, and asynchronous CI ownership
rules; this preparation does not invoke them. No shell-suite change is planned;
if implementation reaches released skill scripts or shared test fixtures outside
the dashboard, reassess proof instead of assuming that suite is unaffected.

## Sequence assessment

Three Behavior slices own launch selection/answers, session actions, and explicit
start context respectively. They evolve one description and existing registry;
there is no preparatory framework slice or per-example adapter. Each has one
cohesive responsibility and preserves its external boundary. No numeric slice
target or hard limit was supplied; sizing includes implementation, focused proof,
and cleanup, with no invented timing gate.

The unchanged-spec conflict is resolved by Terry's 2026-10-01 test-call decision.
The current seed and plan agree, the three slices remain bounded with mapped
proof, and the decisive current-behavior premises have been observed. No blocking
concern remains. Readiness is recorded through the canonical story-state
recorder; execution still requires a separate instruction.
