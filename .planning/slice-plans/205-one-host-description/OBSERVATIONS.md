# Host-description preparation observations

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

### Landing review against advanced trunk

The 2026-10-01 landing replayed only the unpublished readiness commit onto
`285bd213`, which already contains the earlier preparation and the delivered
launch-gate story. Reviewed the current seed's shared context and story, this
plan, and the integrated host-boundary/launch-gate changes. The selected outcome
and proof mappings still hold; preserve the new creation-evidence method as
noted above. Dashboard typecheck passed. The combined current-baseline selection
below passed **156 tests**, 19.1s; no product or test implementation changed.

```sh
env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-launch-model-entries.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-refusal.spec.ts dashboard/tests/launch-workspace.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-launch-done-stop.spec.ts dashboard/tests/agent-launch-done-codex.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/session-workspace-retirement-attach.spec.ts dashboard/tests/session-workspace-retirement-done.spec.ts
```

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


## Slice 1 accepted proof

One browser-safe description now supplies names, sigils, models/labels, recovery
hints, and explicit runtime lookup. Native operations remain private. Shared
schemas derive the known alias vocabulary while preserving legacy defaults.
Agent assignment names also read the same description; decorative marks stay separate.

- New public-client failure proof was observed before implementation: 4 passed.
  `agent-launch-client.spec.ts` substitutes fetch rejection or malformed JSON;
  exact uncertain answers assert each delivered host's hint, then restore fetch.
- Focused command: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-launch-client.spec.ts dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-launch-model-entries.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-refusal.spec.ts` — 97 passed.
  Browser/model/HTTP/native-fixture assertions observe ordered offerings, reset,
  Default omission, model argv/labels, forged refusal, own sigil, and Cursor
  refusal without either native vendor called. Fixtures supply native responses
  and published starting work, not these orchestration outcomes.
- Additional affected-consumer command: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/backlog-preparing.spec.ts dashboard/tests/agent-launch-preparation-kept.spec.ts dashboard/tests/agent-launch-codex-options.spec.ts dashboard/tests/start-store.spec.ts` — 11 passed.
  Profile assertions preserve all names/marks; kept preparation observes Opus;
  Codex forged-model test asserts empty native calls; predecessor start-store
  observes Claude compatibility and persisted Opus. An unusual known model
  under a different stored host retains its existing fallback by code review.
- Independent refactor removed the duplicate native Claude recovery hint.
  `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-launch-boundary.spec.ts` — 16 passed.
  HTTP timeout/unconfirmed assertions (lines 162–200) observe unchanged hint,
  termination, and no saved record; other accepted proof remained unchanged.
- `npm run typecheck:dashboard` and `git diff --check -- dashboard` passed.
  Playwright setup built the browser; description imports only the existing
  browser-safe profile vocabulary, with no native/Node imports.
- Selective formatting used Prettier directly on owned changed/new TypeScript
  files; the repository's general format script selects every tracked file.
  The check-only pre-commit hook remains the sole lint check.

Slice 1 published: `b6f2cb651d8a9d23fa632e77b79fa83e9c184259`, accepted on
`origin/refs/heads/codex/shared-dashboard-code-reads-one-host-description`.
Managed receipt: no reconciliation; maintenance not applicable;
CI `unobserved`, no observer started (`Codex yielded-cell bridge is unavailable`).
The installed managed CLI can start a detached mailbox but supplies no supported
stream-attachment command for that mailbox; the yielded adapter instead starts
its own worker. Delivery did not assert a live bridge without that binding or
add a second startup path. The pre-commit hook found a test-only require-await
issue; the fetch substitute now returns explicit promises. Repeated client
proof: same command selecting `agent-launch-client.spec.ts`, 4 passed.

## Slice 2 accepted proof

Browser attach/done availability now comes from the native registry's actual
optional methods, projected in the existing machine-sessions GET. The schema,
browser state and page context carry those facts to access, card, terminal,
final-report and ad-hoc controls. Unread facts grant no operations. Server
absence checks remain in admission, terminal attachment, and done operations;
native creation/recovery/result reads and workspace/session-state rules remain.

- Required command: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-launch-done-stop.spec.ts dashboard/tests/agent-launch-done-codex.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/session-workspace-retirement-attach.spec.ts dashboard/tests/session-workspace-retirement-done.spec.ts` — 21 passed.
  Existing isolated machines/native protocol/CLI substitutes supply external
  responses and starting records. HTTP/WS/page assertions observe own-host
  terminal input/resize, detach, done rename/interrupt/intent, legacy equal-ID
  distinction, missing/unknown workspace passive fallback, report retries,
  deliberate marking, store preservation and focus return.
- Additional consumer command: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-launch-card-done.spec.ts dashboard/tests/agent-terminal-done.spec.ts dashboard/tests/agent-terminal-done-codex-page.spec.ts dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts` — 14 passed.
  Card/terminal toolbar assertions preserve marking and refusal, matching
  identity/Recent updates, reload/reopen and focus; ad-hoc Claude/Codex starts
  open the actual terminal with input echo. Fixtures do not supply these UI outcomes.
- `npm run typecheck:dashboard` and `git diff --check -- dashboard` passed;
  Playwright built the browser. Dependency review found no server imports
  in browser capability modules; absence guards were source-reviewed as planned.
- Independent refactor: none — already clean; no edits/tests required.
  Accepted proof unchanged. Selective Prettier formatting only.

Slice 2 published: `4e623e37bec504e386d0d5fd4f903126d7154164`, accepted on
`origin/refs/heads/codex/shared-dashboard-code-reads-one-host-description`.
Managed receipt: no reconciliation; maintenance not applicable; CI unobserved,
no observer, same retained Codex bridge limitation.

## Slice 3 accepted proof

Shared launch choices and workspace/definition/options/start-capability/formatter
helpers now require explicit hosts. Legacy wire/store/action defaults and explicit
initial Claude selection remain. The catalog's previously omitted helper host
now comes from its existing Claude-only compatibility projection. Description
namespaces supply allocation and collision collection for all three identities.
Only the three authorized workspace-test arguments changed; every assertion remains.

- Focused command: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/launch-workspace.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/start-store.spec.ts` — 49 passed.
  Collision test creates real host branches/folders and observes `codex/fix-it-5`.
  Installed scripts operate against isolated origins; assertions observe claim
  profiles, native CWD/host input, formatter handoff, retained SHAs, selected
  offers/refusals and compatibility. Native substitutes supply external answers.
- Additional consumer command: `env -u FORCE_COLOR -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=dot dashboard/tests/agent-launch-start-resume.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts dashboard/tests/agent-launch-preparation-kept.spec.ts dashboard/tests/agent-launch-start-card.spec.ts dashboard/tests/agent-launch-preparation-codex-retry.spec.ts dashboard/tests/agent-launch-ad-hoc.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts` — 36 passed.
  Held/refused native and publication preconditions exercise real resume paths;
  assertions observe original workspace/branch/profile/SHAs, safe refusal without
  replacement, kept Opus and ad-hoc chosen/initial host and dialog dismissal.
- Independent refactor found production coherent; extracted unchanged history,
  observation/navigation prose into `AGENT-LAUNCH-HISTORY.md`, retaining main
  anchor/link and verifying relative references. No runtime proof invalidated.
- Final command: `env -u FORCE_COLOR -u NO_COLOR npm run test:dashboard -- --reporter=dot` — **704 passed (2.3m)**.
  All dashboard specs, including preserved legacy identity/stores and kept/resume
  journeys, passed. `npm run typecheck:dashboard` passed; includes server/tests.
  Playwright built the production browser. No native acceptance is claimed.
- Selective Prettier formatting completed, followed by check-only commit gate.

Slice 3 published: `09d5d98a2a031fbc932a46aff7c0ebb5694fe012`, accepted on
`origin/refs/heads/codex/shared-dashboard-code-reads-one-host-description`;
no reconciliation, maintenance not applicable, initially unobserved CI.

Retrospective manifest: claim `7f2ce02e` is provenance; related implementation
is exactly `b6f2cb65`, `4e623e37`, `09d5d98a`. Reviewed aggregate source,
original story/plan, compatibility, all current consumers and suite cost/coverage;
no product corrections or Accepted-ADR conflicts found. New client tests preceded
failure-branch edits; existing integrated journeys preserve their assertions.
Process review updated the existing DD-201 with this execution's bridge gap and
recovered yielded startup route. No backlog changes or new correction plan.
