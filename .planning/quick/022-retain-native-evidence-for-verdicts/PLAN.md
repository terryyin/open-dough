# Retain evidence for a representative update and fresh use

Status: in-progress; leaf 1 done, leaves 2–3 planned.
Order: **20 → 22 → 21**. Finish plan 20's checkpoint before continuing here.

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
Status: planned

Implement shared journey retention through the Codex wrapper using the existing
`delivery/updated-use` selector. Reuse genuine bootstrap/update fixtures, verify
the update, and start fresh use on that target. Keep both stages in one attempt.
Update usage and selection tests in the same leaf.

Proof: Through the real wrapper, substitutes perform a real local fixture update
and emit recorded use evidence. Verify retained stage artifacts and state after
cleanup. Failed update starts no use; failed use retains the successful update
and use failure. The invocation log contains no legacy refusal or retry. Confirm
existing supervisor bounds are wired into both stages without a new failure matrix.

### 3. Connect Cursor and Claude Code to the same journey

Type: Behavior
Status: planned

Use the shared journey with each host's command/event adapter. Record Cursor
Agent identity and structured streams for both tools. Document the saved evidence
needed for a manual applicability review; no reassessment command is required.

Proof: One recorded successful journey per adapter verifies command routing,
runtime identity, stream decoding, and retained artifacts. Use a small adapter
failure/completeness check where decoding differs. Reuse shared transition and
failure proofs from leaf 2; do not repeat all product scenarios per tool.

## Completion and native evidence

Run focused cheap checks with each changed leaf, then `npm test` and
`npm run lint` once at completion. Record results here. Complete Story 1 and
hand the retained context/journey evidence to
[plan 21](../021-trust-native-verdicts/PLAN.md).

| Platform | Existing cheap evidence | Remaining cheap proof | Native evidence |
| --- | --- | --- | --- |
| Codex | Context stream completeness, leaf 1. | Shared journey and retained stages, leaf 2. | Pending Story 3 review. |
| Cursor | Context stream completeness and Agent identity. | Journey adapter, leaf 3. | Pending Story 3 review. |
| Claude Code | Context stream completeness, leaf 1. | Journey adapter, leaf 3. | Pending Story 3 review. |

Substitutes establish our harness contracts only. Story 3 records representative
native discovery, activation, behavior, affected install/update/coexistence, and
justified reuse per tool. Do not write `.planning/STATE.md` as resume state.
