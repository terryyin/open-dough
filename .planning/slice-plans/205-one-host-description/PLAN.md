# Shared dashboard code reads one host description

**Identity:** SEED-075#one-host-description
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#one-host-description)
**Authority:** Preparation only; no implementation or Take. One-shot refinement
commits the preparation result locally for review; publication is not selected.
**Preparation:** Established one-shot refinement in the default checkout
`/Users/terryyin/git/open-dough`, branch `main`, remote `origin`, target `main`,
landing `review`, starting revision
`11f748a9b0e58263351e18fb37053cb2d6378221`. No Preparing assignment.

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
host registration is promised. Existing specs retain their behavior expectations;
the source's stronger "specs unchanged" wording has the decision below.

## Current decisions and remaining concern

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
- **Blocking decision for slice 3:** `launch-workspace.spec.ts` calls
  `launchWorkspace` three times without a host. Its existing tests rely on the
  very default this story removes, and the dashboard typecheck includes tests.
  The source also requires every spec to pass unchanged. The human must decide
  whether adding explicit `"claude"` arguments while preserving all assertions
  is allowed. The question is pending. Do not implement this conflicting path,
  weaken the required-host contract, or silently amend the source. Slices 1–2
  are independently understood; the whole plan is not ready while this remains.

## Architecture and PFE

Follow [North Star: agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
and [workspace choice](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session).
Existing direction already covers this work; no new North Star topic is needed.
Accepted [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
preserves host-qualified session meaning; [ADR 0002, §4–5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports one representation and the smallest cohesive solution.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps native validation distinct from substitute-process proof. These slices
change dashboard orchestration, not a vendor integration mechanism; the named
fixtures establish our behavior, not native skill acceptance. ADR 0008 remains
Proposed. No Accepted-ADR conflict was identified.

| Existing solution and observation | Decision |
| --- | --- |
| `server/launchHosts.ts`, `claudeHost.ts`, `codexHost.ts`: optional native methods and installed skill lookup already own each runtime | Reuse the boundary; change dispatch to explicit lookup and associate each boundary with its description. No second native adapter. |
| `src/sessionCapabilities.ts`, `launchWorkflow.ts`, `LaunchHostModel.tsx`, `StartEffects.tsx`, and `launchSubject` duplicate names, offerings, or model labels | Extract browser-safe description data; these consumers and request/start-store schemas read the same offerings. Preserve valid stored aliases and Default omission. |
| `src/agentLaunchClient.ts` owns the public uncertain answer; native refusal messages stay in host launch modules | Reuse its result contract and supply the selected description's hint. Do not change native refusal or sibling session wording. |
| `server/launchWorkspace.ts` and `startGit.ts` already share slug allocation and collision collection | Keep both algorithms; obtain namespace facts without repeating a vendor-name list. |
| `agentHosts` in the product-backlog agent profile defines valid host identities across tools, including Cursor | Reuse those identities; do not move dashboard runtime facts into the released skill payload or assume every identity has a delivered runtime. |
| `launchCatalog.ts`, `startWorkflows.ts`, `launchOffers.ts`, `optionsOffer.ts` already carry host-qualified installed offers | Require explicit host propagation through the current flow. Keep external legacy interpretation at its existing boundary. |

Product-wide searches covered `dashboard`, `scripts`, `tests`, and the existing
agent-profile contract. Other host-hook installer choices serve another purpose
and are not changed. No cross-product generic host framework is needed.

## Observed premises

Observations are at `8dfd2bf1` with the refinement draft, on 2026-10-01.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| Host/model UI, request validation, retained labels, dispatch refusal, session actions, and installed Codex starts work today | Slices 1–3 preserve these external journeys | Baseline A below: **116 passed**, 16.6s. It reaches the dialog, HTTP boundary, stored result, terminal/done operations, installed commands, and Git origin; it does not establish future descriptor structure. |
| Claude installed execution/preparation and option selection work today | Explicit-host propagation in slice 3 | Baseline B below: **36 passed**, 6.9s. These journeys run the installed scripts against isolated bare origins rather than supplying an established start as their input. |
| All included TypeScript and tests currently typecheck | Required-host interface proof | `npm run typecheck:dashboard`: exit 0. `tsconfig.node.json` includes `server` and `tests`. |
| Missing-host helper calls exist in test consumers | Slice 3 constraint decision and caller updates | `rg -n 'launchWorkspace\(|takenSlugs\(|readDefinition\(|optionsOfferOf\(' dashboard scripts tests`: `launch-workspace.spec.ts` has three omitted-host calls; production workspace/definition consumers already pass hosts. Separate reads of `startWorkflows.ts` and `launchOffers.ts` found optional-host signatures/defaults. |
| Collision lookup really consumes Cursor branches and workspace folders | Slice 3 namespace preservation | `launch-workspace.spec.ts` creates real `codex/fix-it`, `claude/fix-it-2`, `cursor/fix-it-3`, and `.worktrees/fix-it-4`; `takenSlugs` feeds `launchWorkspace`, which returns `codex/fix-it-5`. Passed in Baseline A. |
| The public launch client, not the native launch error, supplies the two "no trusted answer" hints | Slice 1 failure proof | Client observation below: both hosts return `uncertain` with their own hint after a synthetic fetch failure. Searching `requestAgentLaunch`, its error text, and test routes found no existing dedicated proof for this client failure branch. Add that missing proof before changing it. |
| Browser action checks and server admission currently duplicate knowledge of the same operations | Slice 2 removes duplicate authority | Read `sessionCapabilities.ts`, `agentLaunchAdmission.ts`, `claudeHost.ts`, and `codexHost.ts`: both hosts expose `attach`/`stop`; server admission refuses an absent method. Baseline A proves own-host actions and the unavailable-Cursor launch refusal. |

The first Baseline A attempt found no local `node_modules/.bin/vite` and could
not start the servers (four pure workspace tests passed). `npm ci
--ignore-scripts --no-audit --no-fund` installed the locked dependencies in this
owned worktree. The fresh run below then passed; no product code was changed.

### Current preparation review

Rechecked on 2026-10-01 at `11f748a9` in the default checkout. The description,
model, uncertainty-hint, workspace, and explicit-host helper premises remain
as observed above. Since the original review, the host boundary gained native
result reads and workspace-aware terminal startup failure; browser terminal
access now passes through `sessionAccess`. These are existing behavior to
preserve, not additional host facts or a reason to change the story's scope.

- Baseline A, using the exact command below: **116 passed**, 15.2s. Current
  model choices, own-host actions, legacy host identity, installed Codex starts,
  refusal, and collision journeys still hold.
- `npm run typecheck:dashboard`: exit 0, including the current test callers.
- Baseline B plus the two workspace-retirement checks below: **40 passed**,
  10.1s. The installed Claude starts/options still work; actual attachment loss
  opens the passive final report without clearing done intent, and deliberate
  marking remains distinct from report observation.

```sh
env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/session-workspace-retirement-attach.spec.ts dashboard/tests/session-workspace-retirement-done.spec.ts
```

The setup and assertions in the workspace-retirement attach/done specs reach
the real dashboard HTTP/WS and page access decisions using the existing native
protocol fixture. They preserve shared orchestration behavior; they do not
claim new vendor acceptance. No product or test implementation was changed.

### Baseline A

```sh
env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-launch-model-entries.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-refusal.spec.ts dashboard/tests/launch-workspace.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-launch-done-stop.spec.ts dashboard/tests/agent-launch-done-codex.spec.ts
```

### Baseline B

```sh
env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options.spec.ts
```

### Public client observation

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { requestAgentLaunch } from './dashboard/src/agentLaunchClient.ts';
const savedFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => { throw new Error('synthetic offline'); };
  for (const [host, hint] of [['claude', 'Check `claude agents`'], ['codex', 'Check the dashboard history and native Codex conversations']]) {
    const answer = await requestAgentLaunch({ source:'open-dough', workflow:'ad-hoc', host });
    assert.equal(answer.kind, 'uncertain');
    assert.ok(answer.explanation.includes(hint));
    console.log(`${host}: public launch client preserves its own uncertainty hint`);
  }
} finally {
  globalThis.fetch = savedFetch;
}
JS
```

Result: both assertions passed. An earlier attempt to import the native host
registry with Node's strip-only loader hit unsupported TypeScript parameter
properties; it did not observe host behavior. Native boundary proof is instead
the passing Playwright journeys above.

## Proof ownership

| Final promise | Slice | Observable proof |
| --- | --- | --- |
| One description supplies names, skill sigils, model offerings and labels, and uncertainty hints | 1 | Existing model UI/boundary/entry and Codex journey specs; new public-client failure spec; review all consumers against the same description. |
| Claude model order, Codex Default only, reset on switch, omitted Default, forged model refusal, retained requested label | 1 | `agent-launch-model`, `agent-launch-model-boundary`, `agent-launch-model-entries`, `agent-launch-codex` specs. |
| Only the matching delivered runtime is dispatched; Cursor stays unavailable | 1 | `agent-launch-refusal` checks neither vendor is called for Cursor; explicit registry lookup review. |
| UI attach/done availability agrees with real optional operations, with no borrowed operation | 2 | Existing terminal, Codex terminal, Claude done-stop, Codex done, and host-identity specs; workspace-retirement attach/done specs preserve access and passive-report behavior; review one capability authority and retained absent-method refusal checks. |
| Required explicit host throughout helper/launch-choice contracts and preserved initial Claude selection | 3 | Dashboard typecheck including tests; caller review; existing Claude and Codex start/preparation/options journeys. Subject to the pending source decision. |
| Branch prefixes and cross-host/folder collision checks remain unchanged | 3 | `launch-workspace.spec.ts` using actual Git branches and folders, plus installed start journey branch assertions. |
| Legacy records/actions and valid stored model aliases retain their meaning | 3 (final verification), with model preservation in 1 | `agent-launch-host-identity`, `start-store`, kept/resume specs, full dashboard suite; inspect schema/default diff for unintended compatibility changes. |
| Every existing dashboard behavior expectation stays green | 3 (final verification) | `npm run test:dashboard` and `npm run typecheck:dashboard`; test-file call changes remain undecided. |

## Slices

### 1. Launch choices and answers use the selected host's description

Type: Behavior
Status: planned
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

First resolve the blocking test-call decision above and align the seed with the
human's answer. No implementation of the conflicting required-host path begins
before that decision. Then require host in `LaunchChoices`, `LaunchDialog`,
`LaunchOffers`, `StartWorkflow.establishes`, workspace, definition, options,
execution/preparation capability and formatter interfaces, and update their
actual callers. Remove `choices.host ?? "claude"` in launch attempts. Preserve
the explicit UI initial selection and legacy wire/store defaults. Keep installed
start scripts and their handoff protocol; do not rebuild those workflows.

Use the shared namespace facts for branch selection and occupied-slug collection;
retain Cursor collision handling even though Cursor has no runtime. Update the
host-description facts in `dashboard/AGENT-LAUNCH.md` and `LAUNCH-START.md`,
leaving their descriptions of still-undelivered sibling work accurate.

Safe stop: the whole selected story is satisfied only after this slice's source
decision, mapped proof, and full regression verification are complete.

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

The only identified remaining concern is the source's unchanged-spec requirement
versus required-host calls in slice 3. It requires human clarification, not a
slice-plan-refinement rewrite. Overall readiness remains not-ready until resolved.
