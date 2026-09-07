# Retain evidence for a representative update and fresh use

Status: complete — 2026-09-07. Leaves 1–3 remain applicable.
`npm test` and `npm run lint` passed once. Continue to
[plan 21](../021-trust-native-verdicts/PLAN.md) for
[SEED-007 Story 2](../../seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts).
This plan completes [SEED-007 Story 1](../../seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks)
cheap checks; Story 3 owns outstanding native evidence.

Order: **20 → 22 → 21**. Plan 20's checkpoint is complete.

## Scope

Complete [SEED-007 Story 1](../../seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks)
under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
Reuse [plan 20](../020-select-and-retain-native-checks/PLAN.md)'s runner and
retention. Keep completed stream checks. Add one combined update→fresh-use
journey, available through each tool's existing delivery wrapper.

Use `--case delivery/updated-use` for that journey: inspected bootstrap, real
newer tagged fixture update, then a fresh session on the updated target. Omit
the unrelated native legacy-refusal session. If update fails, retain its evidence
and leave use unrun/pending. Keep legacy-refusal product checks in the existing
cheap suite; plan 21 owns their assessment changes.

Keep existing no-argument checks and full native journey entry points. Do not
implement separate ordinary-update/refusal selectors; leave them explicitly
unavailable and identify that in listing/usage. Reconcile selection tests with
this reduced interface. Do not add dependency attempt IDs, saved-workspace
restoration, offline reassessment, automatic reuse, or a review workflow.

No installer/skill changes, new product cases, native runs, or releases.

## Evidence contract

- Reuse distinct attempt directories. Save candidate and tool/runtime identity,
  relevant inputs, raw streams/stdout/stderr, response, and execution status/reason.
- Keep update and use artifacts as stages of one journey. Save enough observed
  state to verify the real transition, the same target, and preserved source,
  companion guidance, and other tool roots. Do not infer an update from final
  bytes alone.
- Apply existing bounds and failure retention to each native stage. Reuse the
  supervisor; do not repeat its full failure matrix for every stage and tool.
- Require complete successful execution before assessment. Retain missing,
  truncated, or unknown completion evidence as nonpassing. Execution completion
  alone does not establish behavior; plan 21 owns that decision.
- Keep host differences in command/event adapters. Preserve failures through
  cleanup and report the result path. Never retry automatically.

## Ordered slices

### 1. Retain incomplete context execution without promoting it

Type: Behavior
Status: done

Recorded proof: `tests/native-stream-completeness.sh` exercises per-host complete,
truncated, missing-terminal, and unknown streams through selected context runs.
Incomplete exit-0 streams retain raw artifacts and remain nonpassing. Complete
streams remain eligible only for the existing limited-wording assessment.
Timeout and launch-failure statuses remain unchanged.

Keep `tests/support/native-run-stream.sh` and this evidence. Do not expand unknown
vendor event shapes to invent successful completion.

### 2. Retain the combined update and use journey

Type: Behavior
Status: done

Recorded proof: `tests/native-delivery-updated-use.sh` runs Codex
`--native --case delivery/updated-use` through the real wrapper. A PATH
substitute applies the genuine local fixture installer, then emits recorded use
evidence. Both stages remain under one `codex/delivery/updated-use/<attempt>/`
directory after scratch cleanup. Failed update starts no use; failed use retains
the successful update. The invocation log has no legacy refusal or retry.
`--deadline`/`--grace` are accepted on both supervised stages.
`tests/native-case-selection.sh` keeps `delivery/legacy-refusal` and
`delivery/ordinary-update` unavailable. `tests/README.md` documents the current
wrapper interface and retained evidence fields, not plan-leaf history.

Shared helpers: `tests/support/dough-adr-awareness-updated-use.sh` and
`tests/support/native-result-retain-journey.sh`.

### 3. Connect Cursor and Claude Code to the same journey

Type: Behavior
Status: done

Recorded proof: `tests/native-delivery-updated-use-adapters.sh` runs Cursor and
Claude Code `--native --case delivery/updated-use` through the shared journey
and each host's `native_run_context_command` adapter. Each successful attempt
records Agent/`claude --version` identity, stream-json launches, decoded
`type:result` responses, and retained stage artifacts. A truncated stream-json
update stays `execution-status: incomplete` and starts no use. Shared
transition and product-failure proofs remain in
`tests/native-delivery-updated-use.sh`.

## Completion and native evidence

2026-09-07: `npm test` passed once, including
`tests/native-delivery-updated-use.sh`,
`tests/native-delivery-updated-use-adapters.sh`,
`tests/native-case-selection.sh`, and
`tests/native-stream-completeness.sh`. `npm run lint` passed once.

Hand retained context/journey evidence to
[plan 21](../021-trust-native-verdicts/PLAN.md).

| Platform | Cheap evidence | Native evidence |
| --- | --- | --- |
| Codex | Context stream completeness; combined journey and retained stages. | Pending Story 3 review. |
| Cursor | Context stream completeness and Agent identity; journey adapter and truncated stream-json. | Pending Story 3 review. |
| Claude Code | Context stream completeness; journey adapter and truncated stream-json. | Pending Story 3 review. |

Substitutes establish our harness contracts only. Story 3 records representative
native discovery, activation, behavior, affected install/update/coexistence, and
justified reuse per tool. Do not write `.planning/STATE.md` as resume state.

## Learnings

- `tests/README.md` documents the current wrapper interface, proof scripts, and
  retained evidence a reviewer would inspect. Do not use it as plan-leaf history.
