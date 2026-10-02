# Codex startup evidence

Supporting context and retained proof for [the executable plan](PLAN.md).
The preparation observations use the story workspace recorded in that plan;
the completed native probe uses its separately recorded disposable workspace.

## Observed premises and proof boundaries

Observed on 2026-10-02 at preparation revision
`f7d1140011044be2536b0c7aa09f4be7b35b82fc`; the only tracked
changes were this story's preparation records.

| Premise and consuming operation | Observation and result |
| --- | --- |
| The installed host supplies varying supported pairs; picker and admission consume them. | Through existing `CodexRpc.initialize`, `model/list` with `{limit:100, includeHidden:false}` returned eight entries, effort descriptions, varying effort sets and `nextCursor:null` on Codex 0.159.3. See the seed's native evidence. Follow pagination when returned; the single observed page is not a limit. |
| Configured defaults differ from catalog suggestions; startup must preserve that distinction. | `config/read` for the story workspace returned Astra/high while the catalog recommended Sol/low. Ephemeral `thread/start` with no overrides returned Astra/high, model-only returned Sol/high, and model plus `config.model_reasoning_effort=low` returned Sol/low. These creation responses consumed the configuration, but no initial model turn was run. Slice 1 bounds that remaining premise. |
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

## Slice 1 native probe protocol

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

## Native feasibility evidence — 2026-10-02

Executed against `codex-cli 0.159.3` using the installed dashboard `CodexRpc`
and `daemonEndpoint`, without modifying their implementation. Commands:

```sh
node --experimental-transform-types /tmp/open-dough-seed081-probe/probe.ts
node --experimental-transform-types /tmp/open-dough-seed081-probe/model-only.ts
```

Both exited 0. Disposable observation workspace:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/open-dough-seed081-workspace-hLhuLv`.
The scripts and literal request/reply trace remain at
`/tmp/open-dough-seed081-probe/`; `evidence.json` retains the native notifications
and turn-context record. Only model/effort fields from `config/read` were retained,
not raw configuration.

Literal RPC sequence after `CodexRpc.initialize()` (which sends `initialize`
and `initialized`):

```json
{"method":"config/read","params":{"cwd":"<disposable observation workspace>","includeLayers":false}}
{"method":"model/list","params":{"limit":100,"includeHidden":false}}
{"method":"thread/start","params":{"cwd":"<disposable observation workspace>","ephemeral":true}}
{"method":"thread/unsubscribe","params":{"threadId":"<preceding ephemeral thread>"}}
{"method":"thread/start","params":{"cwd":"<disposable observation workspace>","ephemeral":true,"model":"gpt-6.1-sol"}}
{"method":"thread/unsubscribe","params":{"threadId":"<preceding ephemeral thread>"}}
{"method":"thread/start","params":{"cwd":"<disposable observation workspace>","ephemeral":true,"config":{"model_reasoning_effort":"low"}}}
{"method":"thread/unsubscribe","params":{"threadId":"<preceding ephemeral thread>"}}
{"method":"thread/start","params":{"cwd":"<disposable observation workspace>","model":"gpt-6.1-sol","config":{"model_reasoning_effort":"low"}}}
{"method":"turn/start","params":{"threadId":"01a0fa57-159c-7532-a9d4-9335804d4537","input":[{"type":"text","text":"Reply with exactly OK. Do not use tools or modify files.","text_elements":[]}]}}
{"method":"thread/archive","params":{"threadId":"01a0fa57-159c-7532-a9d4-9335804d4537"}}
```

The separate unpaid model-only check reinitialized a connection, sent
`thread/start` with the same `cwd`, `ephemeral:true` and `model:"gpt-6-astra"`,
then unsubscribed its returned thread `01a0fa57-b806-7703-8d92-e33182ec488f`.
No turn was submitted to any ephemeral thread.

| Requested creation settings | Native effective response |
| --- | --- |
| Neither override | `gpt-6.1-sol` / `medium` |
| Model only: `gpt-6.1-sol` | `gpt-6.1-sol` / `medium` |
| Model only: `gpt-6-astra` | `gpt-6-astra` / `medium` |
| Effort only: `low` | `gpt-6.1-sol` / `low` |
| Explicit pair: `gpt-6.1-sol` / `low` | `gpt-6.1-sol` / `low` |

`config/read` in that workspace established Sol/medium; the catalog returned
all eight entries and `nextCursor:null`. These defaults differ from the
previous story-workspace Astra/high observation. This confirms the requirement
to describe delegation before the actual startup workspace is established;
parent-folder values cannot be labeled as that future workspace's settings.

Exactly one initial turn ran, using the explicit-pair thread and **no**
`turn/start` model/effort overrides. Native `turn/completed` reported
`status:"completed"`, `error:null` and turn ID
`01a0fa57-15f3-7f60-a87e-578dc3d99534`. The native rollout `turn_context` for
that ID records `model:"gpt-6.1-sol"`, `effort:"low"` and matching
`collaboration_mode.settings.model` / `reasoning_effort`. This is native
per-turn evidence, independent of the model's response. No tool-use item was
reported; the sole response was `OK`.

`thread/archive` succeeded with `{}`. The archived native evidence is
`/Users/terryyin/.codex/archived_sessions/rollout-2026-10-02T10-00-06-01a0fa57-159c-7532-a9d4-9335804d4537.jsonl`.
Existing no-input blank-creation proof above remains valid; no resume,
attachment or artificial blank-start prompt was exercised.

**Established startup rule:** Supply an explicit model only as `thread/start.model`
and explicit effort only as `thread/start.config.model_reasoning_effort`;
omit each delegated setting independently. On this installed host, a new
conversation's first turn inherits the effective creation settings without
additional turn overrides. Verify explicit creation values before submitting
input. The native feasibility prerequisite for dependent slices is satisfied;
production UI/payload/storage proof still belongs to slices 2–3.

## Slice 2 accepted proof

Implemented shared model discovery/selection across all three new-session origins,
registered host catalog pagination, explicit admission/native creation, requested
model persistence and safe labels. Native mismatch retains identity and the original
request but never saves sendable input or submits a turn. Claude alias admission and
predecessor records are preserved. No resume controls or config writes were added.

All commands completed with exit 0 in the execution checkout:

```sh
npm run typecheck:dashboard
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/agent-launch-codex-model-boundary.spec.ts dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-model-boundary.spec.ts dashboard/tests/agent-launch-model-entries.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-codex-options.spec.ts dashboard/tests/responsive-session-start-codex.spec.ts dashboard/tests/session-result-codex.spec.ts dashboard/tests/session-result-admission.spec.ts --workers=2
npm run format
```

The model browser spec and imported `codexModelCatalogCases.ts` observe exact
creation payloads, real installed preparation/profile/store writes, blank no-input
startup, focus/retry/reset/cancel, stale host/project replies, vanished choices and
safe former-ID rendering. The boundary spec observes same-origin/project/folder/
method guards, every catalog page, failure/503/retry, durable identity before input,
independent model omission and blank/nonblank mismatch evidence. `codexStart` and
`startOrigin` supply installed start scripts and real Git origins; `fakeCodex` supplies
only native protocol replies. Shared fixture consumers and passive result reads
passed their regression assertions. Slice 1 native proof remains unchanged.

Independent refactoring extracted model admission, bounded passive-read lifetime,
native fixture catalog/creation replies and catalog UI cases. Async response reads
remain awaited inside refusal mapping. Final mechanical host-method binding fixes
preserve the same boundary; typechecking and formatter/lint passed afterward.
Earlier failures were missing-file/creation-entry polling races, unavailable catalog
fixture setup and single-JSON parsing of multi-call daemon JSONL; each repaired
observation retains the intended assertion. No product failure was waived.

Published slice 1: `bcaabd99c5f24bcffc9393f53c203c74589f2b7e` on the execution
branch. Managed delivery reported `pendingCi: unobserved`, reason
`Codex yielded-cell bridge is unavailable`; no observer was created. Local proof
is accepted without claiming hosted CI coverage. The published claim on main is
also unobserved. The next increment uses that slice 1 SHA as its published base.

## Slice 3 accepted proof

Optional effort extends the same request, start-store and native-creation contract.
Compatible choices survive model changes; incompatible choices remain visibly
unresolved. Actual-workspace configuration resolves effort-only validation;
explicit pairs do not depend on configuration reads. Native effective settings
are checked before saving sendable input evidence. Custom configured defaults
remain usable. Effort adds no assignment fact, config write or resume setting.

Final post-refactor commands completed with exit 0:

```sh
npm run typecheck:dashboard
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/agent-launch-codex-model-boundary.spec.ts dashboard/tests/agent-launch-model.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-dialog-layout.spec.ts dashboard/tests/agent-launch-default-checkout-warning.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-codex-creation.spec.ts dashboard/tests/agent-launch-codex-confirmation.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts --workers=2
npm run format
```

The original two Codex model specs import `codexEffortBoundaryCases.ts`,
`codexEffortDialogCases.ts` and `codexEffortWorkspaceCases.ts`. Their assertions
observe independent pair/effort/neither and prior model-only payloads, actual
native config cwd, first-input durable ordering, blank no-turn behavior, mismatch
identity without sendable evidence, custom/unset/default configuration, read
failure versus explicit-pair independence, model compatibility, linked feedback,
Tab order, narrow/200% viewport, reset, stale choices/default retry and Back/Continue
confirmation. All three UI origins assert the pair in native creation and real
request/start stores. Existing `codexStart`/`codexLaunch` infrastructure supplies
real server/store/installed commands; the native fixture supplies only replies.

Independent refactoring extracted the settings hook and native input fixture,
renamed settings admission and the shared scalar grammar, and split workspace
journeys while retaining original test registration. The combined 12-spec command
renewed moved UI/admission/schema/fixture proof (terminal session 71291); native
slice 1 proof remains unchanged. An earlier run's stale one-option expectation
was corrected to exact native choices. Interrupted session 16152 had no recovered
terminal result and is not claimed; replacement terminal proof covers its additions.

Slice 2 was accepted as `0a701c84b0a1ecbe9c3a2e7ed0f8b2d5ac6782c2` on the
execution branch with the same explicit unobserved-CI receipt. This is slice 3's
previously published base. No observer exists; hosted success is not asserted.

## Retrospective and recovered observation

Manifest: `bcaabd99` owns native feasibility, `0a701c84` owns model selection,
and `9c0d6bb4` owns effort selection. Claim `20580ea2` and source preparation
are provenance; the aggregate range contains no interleaved implementation.
Original plan/seed promises remain unchanged. Shared startup state, native-host
ownership and operational records fit the North Star and Accepted ADRs;
no product correction or queue reprioritization was identified by local review.
Process review uses retained coordinator/tool reports; deeper raw agent history
is unavailable. DD-201's prior successful startup route corrected the initial
coverage assumption; no guidance change is authorized by this review.

All three slice publications initially had unobserved CI. Before completion,
one documented yielded stream was armed: GitHub Actions `ci.yml` (verified
push selector), repository `terryyin/open-dough`, execution branch above,
coordinator `bas-chan`, this checkout; cell 19, session 35356,
`/tmp/dough-ci-501/watch-x4nPTj`, PID 69697. Managed resume recovered that owner
and accepted `9c0d6bb4` without another push. Its delivered run 36962208003,
attempt 1, failed only dashboard (1/9): retained-preparation retry assertions
mistook new catalog reads for conversation creation. The repair keeps the exact
prior call prefix, permits only discovery in the appended calls, and retains
Git/store/profile/no-new-input guarantees. Minimal workspace red: session 45347,
exit 1. All ten retry, two continuation and one recovery cases passed after repair:
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-preparation-codex-retry.spec.ts dashboard/tests/agent-launch-preparation-codex-continuation.spec.ts dashboard/tests/agent-launch-preparation-codex-recovery.spec.ts --workers=2`
Terminal session 33356, exit 0. Production unchanged; hosted verdict pending.
