# Choose Codex model and effort at session startup

**Identity:** SEED-081#codex-session-model-and-effort
**Source:** [refined story](../../seeds/SEED-081-codex-session-model-and-effort.md#codex-session-model-and-effort).
**Authority:** Terry requested a slice plan after explicitly excluding resume.
This is preparation only; no implementation, Take or publication is authorized.
**Preparation:** Reuse workspace
`/Users/terryyin/git/open-dough/.worktrees/choose-codex-model-and-effort-when-starting-a-da`,
branch `codex/choose-codex-model-and-effort-when-starting-a-da`, starting revision
`f7d1140011044be2536b0c7aa09f4be7b35b82fc`, agent `terry-chan`.
Remote target: `origin/main`. Integration checkout: `/Users/terryyin/git/open-dough`.
Keep the existing Preparing assignment and retain this uncommitted draft for review.

## Goal and boundaries

A developer chooses Codex's model and reasoning effort when starting a new
session from Start session, Start execution or Start refinement, and native
startup uses the selection. A blank start creates the configured conversation
without an artificial prompt. A nonblank start uses the choice for its initial
instruction. Model/effort discovery reflects the installed host; explicit
choices are never silently replaced.

Each setting independently supports “Use Codex setting”. New dialogs and host
changes use that path; choices are not remembered across launches and do not
edit Codex configuration. Discovery failure explains unavailable choices,
offers retry and permits deliberate configured-default startup. Catalog
recommendations are not asserted to be effective configured values.

Resume, reopening, terminal attachment, existing-conversation recovery and
changing a running session are outside delivery and acceptance. The selector
is only for creation of a new conversation. A retained mechanical preparation
with no conversation yet is still a new-conversation launch; do not mistake
`StartLaunch`'s `resumes` prop, which carries that preparation, for native
conversation resume. Existing resume actions do not acquire new controls or
new assignments of model/effort.

Also exclude other-host effort controls, preference storage, model recommendation
or price comparison, config editing, custom model-ID entry, a live model
monitor and repair of the observed native `list_turns` failure.

## Existing solutions and constraints

PFE searched `dashboard/`, `src/` and `scripts/` for model offerings, reasoning
settings, native discovery, schemas and callers. Reuse and extend:

- `LaunchDialog` / `LaunchHostModel`, shared by `StartSession` and `StartLaunch`,
  for one interaction across all delivered launch actions.
- The existing loopback/same-origin boundary, known project lookup and registered
  `LaunchHost` for a bounded host-options read. Native `model/list` and config
  interpretation belong behind `codexHost`; the browser receives only picker
  data, never raw configuration or credentials. The catalog is transient host
  information, not a published story fact or new persistent registry.
- `launchRequest`, recorded requests, `startStore` and kept-start projection for
  requested model identity. Replace the Claude-only alias assumption coherently
  where these existing contracts carry a Codex model; retain host-specific
  admission so broadening stored IDs does not admit arbitrary Claude aliases.
  Preserve predecessor records. Existing agent profiles already accept nonempty
  model text; no new profile grammar or effort-assignment fact is needed.
- `launchCodex` and its existing durable identity-before-input sequence for
  creation and initial submission. The native startup probe below determines
  where overrides must be supplied. Do not send configuration writes or modify
  continuation arguments to achieve startup selection.
- Existing requested-model wording through `launchSubject` / `launchModelName`:
  a dynamic or formerly available ID must render safely, without requiring a
  live catalog or claiming it is the currently running model. Do not build a
  second launch record or persistent model catalog.

This follows [North Star: requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
and [workspace before session](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session).
Keep the [launch interaction hierarchy](../../../docs/dashboard-ux-ui-north-star.md#launch-dialog-information-hierarchy),
including accessible labels, instruction-first focus and reachable Start on
narrow/zoomed screens. No new North Star topic is needed.

The ADR index classifies 0000–0006 Accepted, 0007–0009 Proposed; none relevant
here is superseded. [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
keeps feature-local design here; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favors extending the existing domain solution; [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
distinguishes deterministic adapter proof from native evidence. No conflict or
exception was identified. No cross-host native competence claim is made.

## Observed premises and proof boundaries

Observed on 2026-10-02 at the preparation revision above; the only tracked
changes were this story's preparation records.

| Premise and consuming operation | Observation and result |
| --- | --- |
| The installed host supplies varying supported pairs; picker and admission consume them. | Through existing `CodexRpc.initialize`, `model/list` with `{limit:100, includeHidden:false}` returned eight entries, effort descriptions, varying effort sets and `nextCursor:null` on Codex 0.159.3. See the seed's native evidence. Follow pagination when returned; the single observed page is not a limit. |
| Configured defaults differ from catalog suggestions; startup must preserve that distinction. | `config/read` for this workspace returned Astra/high while the catalog recommended Sol/low. Ephemeral `thread/start` with no overrides returned Astra/high, model-only returned Sol/high, and model plus `config.model_reasoning_effort=low` returned Sol/low. These creation responses consumed the configuration, but no initial model turn was run. Slice 1 bounds that remaining premise. |
| Both new-session UI origins reach the same model state and request contract. | Reading `StartSession.tsx`, `StartLaunch.tsx`, `LaunchDialog.tsx` and `LaunchHostModel.tsx` traced both callers through request submission. The browser model baseline below exercised the dialog, real server and synthetic CLI for execution, refinement and ad hoc. |
| Codex IDs must survive admission, mechanical preparation, storage and rendering. | `rg -n 'LaunchModel|launchModelAliases|request\.model|modelWords' dashboard src scripts` found the enum in request, kept-start and start-store schemas, static host admission, and requested-model rendering. Reads of `startLaunch`, `preparationCommand`, `startRecording` and profile `agentReportError` show model text already reaches the installed commands and profiles; broadening only the picker would fail at earlier consumers. Installed-start baseline specs below exercised both workflow paths with defaults. |
| The HTTP/native fixture measures startup requests rather than supplying dashboard records. | `agent-launch-ad-hoc-codex-input.spec.ts` sends actual HTTP requests and asserts `thread/start`, `turn/start` and persisted first-input evidence; `support/fakeCodex.ts` supplies only native replies. The successful baseline reaches these assertions for text and blank input. New assertions must inspect model/effort payloads and creation responses; a mock cannot prove vendor inference. |

Baseline command:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts --workers=2
```

Result: passed, exit 0. The first smaller run failed before behavior because
`node_modules/.bin/vite` was missing in this worktree. After
`npm ci --ignore-scripts --no-audit --no-fund`, the command above passed.
No product fix was required. A second focused baseline also passed (exit 0):

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-dialog-layout.spec.ts dashboard/tests/agent-launch-default-checkout-warning.spec.ts --workers=2
```

Its actual browser assertions exercise instruction-first focus, narrow/200%
layout and confirmation that resubmits the same choices. Inspection of
`LaunchExistingChanges.tsx` confirms that the pending `LaunchChoices` object
owns that resubmission. Slice 3 adds the new effort to that existing contract.
These are baseline observations, not proof of unimplemented selections. Existing specs containing recovery are reused only
for their startup assertions; no new resume acceptance is introduced.

## Ordered slices

### 1. Establish native settings on a new conversation's first turn
Type: Behavior
Status: planned
Proof: A bounded native probe consumes explicit model/effort at creation and
on an initial nonblank turn; inspect native effective configuration and
per-turn metadata, never the model's self-report.

Behavior: With authenticated installed Codex and one currently offered pair,
create one disposable conversation using the chosen model and
`config.model_reasoning_effort`, then submit one minimal instruction through
`turn/start` using the same native path as dashboard startup. Inspect the
creation response and native turn configuration/evidence for the actual model
and effort. If the native API requires explicit turn overrides, exercise those
and record the single resulting startup rule. Also retain the already observed
blank creation/no-input proof; do not attach or resume a conversation.

Use the actual disposable startup workspace for `config/read` and creation;
include unpaid no-override and single-override creation checks there to settle
context/default behavior before the broader UI work. Configuration discovery
before an eventual story worktree exists must use delegation wording, not
assert the parent folder's values as the worktree's.

This probe runs only during authorized execution; the initial turn may incur
model usage and has not run during planning. Use a disposable local workspace,
no repository-changing instruction, at most one initial turn, and archive its
conversation afterward. If the host cannot expose trustworthy per-turn
settings, or changes an explicit value, stop dependent slices and revise the
startup approach based on the observed result. Do not diagnose resume, run a
skill execution, or use a vendor SDK/model API as a substitute for installed
Codex. Record the literal command/RPC sequence, version, observation location,
requested/effective values and outcome here when completed.

Safe stopping point: the actual startup contract is established, with no
product behavior changed. This is a feasibility probe, not another feature.

### 2. Choose a discovered model when starting any new Codex session
Type: Behavior
Status: planned
Proof: From each real launch dialog, choose a native catalog model and observe
that exact ID at native creation and in the production launch record. Observe
configured-default startup, unavailable discovery, and a model that disappears
before launch without silently substituting another value.

Behavior: Opening a new launch with Codex selected reads the host's available
models and offers them alongside “Use Codex setting”. Selecting a model starts
that model in the actual workspace, including blank ad hoc startup. The model
reaches execution/refinement's installed preparation command and existing
record/projection contracts. No override sends no explicit model. Discovery
failure leaves an explained, retryable state and permits the default path;
a stale explicit selection requires correction or deliberate return to default.

Extend the existing host boundary and request/store contracts identified above
as one coherent change, including requested-model labels and predecessor
records. Use the existing local boundary's project/origin checks in dev and
preview. Read all returned catalog pages; stale replies for another host or
project must not replace current options. Cancel sends no launch; a fresh
opening or host change starts at configured defaults. Loading must not steal
instruction focus. A creation response contradicting the explicit selection
must not receive the initial instruction or be reported as matching.

Extend the native fixture with catalog and effective-creation replies. Add
focused `agent-launch-codex-model.spec.ts` browser cases and
`agent-launch-codex-model-boundary.spec.ts` HTTP cases; these names are planned
files, not existing proof. Cover all three UI actions with the same interaction,
and use the installed-start fixtures for execution/refinement so selection is
not injected after preparation. Keep assertions at native requests and actual
stores, not only browser request mocks. Cover blank creation without using
terminal output as proof. Include safe model-label rendering after the catalog
changes, and existing record loading without a model.

Run:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/agent-launch-codex-model-boundary.spec.ts dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-launch-model-entries.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts --workers=2
```

Update `AGENT-LAUNCH.md` and `AGENT-LAUNCH-HOSTS.md` with delivered model
behavior in this slice. Effort remains inherited from Codex until slice 3.

Safe stopping point: useful model selection works across startup workflows;
there is no effort selector and no new conversation-resume behavior.

### 3. Choose an effort compatible with the new session's model
Type: Behavior
Status: planned
Proof: The same UI-to-native boundary proves an explicit supported pair,
model-only, effort-only and neither override, and proves incompatible explicit
pairs cannot be submitted or silently replaced.

Behavior: Codex's new-session settings now include “Reasoning effort” and the
host's descriptions. Available efforts follow the selected or established
configured model. Changing models retains a supported explicit effort; an
incompatible effort stays visibly unresolved until the developer chooses a
supported value or “Use Codex setting”. Host change and fresh dialog opening
reset both settings. Selecting only one override delegates the other to Codex.

Extend the same startup settings contract, records and launch payload from
slice 2; apply the native rule established by slice 1 to creation and initial
input. Keep effort local to session startup, without extending agent assignment
facts. For “Use Codex setting”, resolve only through native configuration in
the relevant project/established workspace. If an effective value is not known,
state delegation rather than presenting the catalog recommendation as fact.
Do not block an untouched configured custom model merely because it is absent
from the picker. Explicit effort must be validated against the applicable model
when known and checked against native effective creation before initial input;
unverifiable or refused explicit settings are explained rather than substituted.

Extend the new browser/boundary specs with the source examples: model change
from an `ultra`-capable model to one without it, compatible preservation,
independent overrides, stale/unavailable choices and deliberate return to
defaults. Assert exact startup payloads and first-input ordering for nonblank
and blank creation. Check that workspace confirmation carries the selections,
and that slow discovery neither changes the chosen host nor takes focus.
Check keyboard reading order, linked feedback, narrow viewport and 200% zoom
using the existing launch-dialog test conventions. Do not add live-session
settings or exercise attachment/resume as acceptance.

Run:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/agent-launch-codex-model-boundary.spec.ts dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-dialog-layout.spec.ts dashboard/tests/agent-launch-default-checkout-warning.spec.ts --workers=2
```

Reuse slice 2 proof where its boundary is unchanged; update `AGENT-LAUNCH.md`
and `AGENT-LAUNCH-HOSTS.md` for effort semantics in this same slice.

Safe stopping point: the selected story is delivered across new-session
startup, subject to its recorded proof. Resume remains outside scope.

## Promise ownership

| Final-state promise | Owner and observation |
| --- | --- |
| Native selected pair applies to creation and initial turn | Slice 1 native feasibility; slices 2–3 production UI/HTTP/native payload proof. |
| All three startup actions, blank included | Slice 2 browser and installed-start fixtures; slice 3 pair/blank payload assertions. |
| Independent configured settings; no preference/config writes | Slice 2 model/default and reopen proof; slice 3 effort-only/neither proof in real launch requests. |
| Host-supplied model/effort descriptions and supported combinations | Slice 2 catalog/pagination; slice 3 model-dependent choices and mismatch recovery. |
| No silent substitution, including stale choices | Slice 2 stale model/native mismatch; slice 3 effort mismatch and first-input ordering. |
| Discovery unavailable/loading, retry and usable default path | Slice 2 read failures/stale replies; slice 3 preserves explicit effort until deliberate correction. |
| Host switch, focus, cancel, confirmation, narrow/zoomed access | Slice 2 existing shared interaction; slice 3 effort/confirmation/accessibility scenarios. |
| Existing model records and labels stay readable | Slice 2 recorded request/start projection round trips and model-entry regression. |
| Startup-only selection | Slices 2–3 attach controls only to new-session creation; review existing-conversation action callers for absence of new setters. No resume functional proof is required. |

## Execution and review

No numeric slice target/hard limit is configured for this work. Each slice has
one learning or user outcome, includes its implementation, focused proof and
cleanup, and can stop safely. The cumulative model is one optional host-specific
startup selection; slice 3 extends slice 2 rather than inventing another dialog,
store, catalog or native lifecycle. No preparatory Structure slice is justified.

Use the installed execution workflow only when execution is requested. It owns
independent post-change refactoring before commit, selective formatting,
publication and CI follow-up; see
[its delivery gates](../../../.agents/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change).
Run `npm run typecheck:dashboard` for changed TypeScript contracts, the focused
Playwright selections above, and selective `npm run format` before delivery.
The test command builds the dashboard through global setup. Broaden tests only
when changed consumers or failures warrant it; hosted CI alone does not require
a full local suite. If the shared native fixture changes a contract used by
other specs, inspect those consumers and run affected assertions as regression,
without adding resume outcomes to this story.

No remaining slice-boundary, cumulative-design or proof-ownership concern was
identified in this review. Native initial-turn behavior is deliberately bounded
by slice 1 and blocks dependent implementation if disproved. The native resume
failure is excluded by the human's scope decision, not represented as fixed.
Readiness is assessed separately on the current seed and this plan; it grants
no Take or execution authority.
