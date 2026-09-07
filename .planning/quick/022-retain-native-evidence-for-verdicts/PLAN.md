# Retain the native evidence needed for trustworthy verdicts

Status: planned. Extracted from Quick Plan 20 so its result boundary can be
delivered independently. No native execution is part of this plan.

## Source

- Extracted from the former leaves 6–16 of
  [Quick Plan 20](../020-select-and-retain-native-checks/PLAN.md), within
  [SEED-007 Story 1](../../seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks).
- Direct prerequisite for
  [Quick Plan 21](../021-trust-native-verdicts/PLAN.md), which must consume this
  retained-artifact and reassessment interface rather than duplicate it.
- Quick Plan 20 leaves 1–5 already provide the fixed case inventory, selected
  context result layout, process ownership, timeout evidence, and retained
  launch failures. Recheck those observable interfaces before implementation;
  if absent or incompatible, stop and wait rather than rebuilding them.
- [Accepted ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  governs retained evidence, tested adapters, incomplete outcomes, and separate
  native qualification. [Accepted ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
  preserves human decision ownership. No conflict, exception, release, or ADR
  status change is involved.

## Goal and scope

Give Quick Plan 21 one stable, credential-free result boundary containing
complete retained context and delivery evidence plus offline reassessment. A
maintainer can run one existing selected case, preserve what execution and state
actually showed, and reassess that saved attempt without another native call.

Implement only terminal-completeness classification for retained context
attempts; selected legacy-refusal, ordinary-update, and updated-use delivery
journeys for Codex, Cursor, and Claude Code; and append-only offline
reassessment. Reuse Quick Plan 20's delivered inventory, context result layout,
supervisor, fixtures, and exact update-to-use relationship.

Exclude Quick Plan 20's missing/nonzero/denied launch matrix and timeout design,
Quick Plan 21's activation and semantic verdict rules, new cases, native
qualification, automatic retry/reuse, installer or skill changes, old-result
migration, a review UI, and releases.

## Execution context and decisions

- Use the fixed five cases per host: `context/clear`, `context/conflict`,
  `delivery/legacy-refusal`, `delivery/ordinary-update`, and
  `delivery/updated-use`.
- Preserve distinct attempt paths, raw events/stdout/stderr, derived response,
  execution status and reason, before/after state observations, input/runtime
  identity, assessor identity, decisive artifact references, and dependency IDs.
- Require a complete successful terminal stream before a fresh attempt can have
  a behavioral assessment. Missing, truncated, or unknown completion evidence
  is nonpassing and retained; this plan does not decide semantic correctness.
- Ordinary update uses inspected bootstrap plus a real newer tagged fixture.
  Updated use must consume that verified update's target and record its attempt
  ID; a failed update leaves use pending and launches no use session.
- Fresh and offline paths expose the same saved observations. Reassessment
  appends a derived result with its assessor and applicability rationale without
  changing the original attempt. Changed or missing relevant inputs remain
  pending. Reassessment starts no agent, version probe, retry, or setup.
- Keep host variation in native command/event adapters. Shared retention,
  dependency, and reassessment behavior stays in one implementation.

## Outside-in proof

Drive the real selected-case and offline entry points with credential-free
substitutes and reviewed recorded streams. Substitutes log every invocation.
Use the real local installer and tagged fixtures for state/provenance proof;
printing a success response is insufficient. Synthetic streams prove adapter
contracts, not that native runtimes emit those forms.

| Promise / observable proof | Owning leaves |
| --- | --- |
| Complete versus truncated/missing terminal evidence is retained and classified without semantic promotion | 1 |
| Codex selected refusal, genuine update, and update-to-use dependency | 2–4 |
| Cursor equivalents with Agent runtime and stream JSON | 5–7 |
| Claude Code equivalents with success/failure stream retention | 8–10 |
| Offline reassessment preserves originals, records applicability, and makes zero native calls | 11 |
| Shared result boundary and unchanged default/full journeys | Every owning leaf; full cheap suite at completion |
| Native discovery, invocation/application, intended behavior, install/update/coexistence | Pending independently in SEED-007 Story 3 |

## Ordered slices

Each leaf is a credential-free Behavior with one focused proof loop. The first
delivery case establishes only shared mechanics needed by the immediately
following cases; no preparatory framework slice is permitted.

### 1. Retain incomplete context execution without promoting it
Type: Behavior
Status: planned
Proof: Per-host complete, truncated, and missing-terminal recorded streams pass
through the selected context entry point. Complete execution remains eligible
for later assessment; incomplete evidence with exit 0 is retained as nonpassing
with a reason and raw artifacts.

Behavior: Selected context command exits → inspect host terminal evidence →
retain complete execution or an explicit incomplete result without deciding the
case's semantic verdict.

Sizing: approximately five minutes, medium confidence; unknown event shapes
stay incomplete rather than expanding the adapter contract.

### 2. Retain only a selected Codex legacy refusal
Type: Behavior
Status: planned
Proof: The Codex wrapper runs only `delivery/legacy-refusal`, retains its attempt,
and omits update/use calls. Default deterministic and full native journey entry
points keep their behavior; shared setup cleanup does not delete the result.

Behavior: Selected Codex legacy-refusal → set up its genuine legacy fixture and
run the existing isolation path → retain that case alone.

Sizing: five–ten minutes, medium confidence; keep shared mechanics inside this
first concrete delivery case.

### 3. Retain a genuine selected Codex ordinary update
Type: Behavior
Status: planned
Proof: The selected update runs inspected bootstrap and a real tagged fixture
update, retains exact provenance/state, and omits refusal and use sessions.

Behavior: Selected Codex ordinary-update → execute only its prerequisites and
update → retain the verified transition.

Sizing: approximately five minutes, medium confidence; reuse leaf 2's path.

### 4. Tie selected Codex updated use to its verified update
Type: Behavior
Status: planned
Proof: Updated use runs after the verified update on the same target and records
its dependency attempt ID. Failed update launches no use and retains pending use.

Behavior: Selected Codex updated-use → verified update then fresh use of that
installation, or pending use when the update fails.

Sizing: approximately five minutes, medium confidence.

### 5. Retain only a selected Cursor legacy refusal
Type: Behavior
Status: planned
Proof: Cursor runs only the refusal case, retains stream JSON and response,
records `cursor agent --version`, and leaves other tool roots unchanged.

Behavior: Selected Cursor legacy-refusal → shared journey plus Cursor adapter →
retain that attempt alone.

Sizing: approximately five minutes, medium confidence; reuse context capture.

### 6. Retain a genuine selected Cursor ordinary update
Type: Behavior
Status: planned
Proof: Cursor runs only inspected bootstrap plus the genuine fixture update and
retains Agent runtime, stream, exact state, and provenance.

Behavior: Selected Cursor ordinary-update → verified update without a native
refusal session → retain the transition.

Sizing: approximately five minutes, medium confidence.

### 7. Tie selected Cursor updated use to its verified update
Type: Behavior
Status: planned
Proof: Cursor updated use records the verified update dependency and same target;
failed update launches no use. Incomplete output uses leaf 1's gate.

Behavior: Selected Cursor updated-use → verified update then fresh use on that
target, or pending use after failure.

Sizing: approximately five minutes, medium confidence.

### 8. Retain only a selected Claude Code legacy refusal
Type: Behavior
Status: planned
Proof: Claude Code runs only refusal, retains stream JSON and response on success
and failure, and preserves existing deterministic refusal assertions.

Behavior: Selected Claude Code legacy-refusal → shared journey plus Claude
adapter → retain the attempt on either outcome.

Sizing: approximately five minutes, medium confidence.

### 9. Retain a genuine selected Claude Code ordinary update
Type: Behavior
Status: planned
Proof: Claude Code runs only inspected bootstrap plus genuine fixture update and
retains stream, exact state, and provenance on success and failure.

Behavior: Selected Claude Code ordinary-update → verified update without a
native refusal session → retain the transition.

Sizing: approximately five minutes, medium confidence.

### 10. Tie selected Claude Code updated use to its verified update
Type: Behavior
Status: planned
Proof: Claude updated use records the verified update dependency and same target;
failed update launches no use, and other tool roots remain unchanged.

Behavior: Selected Claude Code updated-use → verified update then fresh use on
that target, or pending use after failure.

Sizing: approximately five minutes, medium confidence.

### 11. Reassess a retained attempt without native execution
Type: Behavior
Status: planned
Proof: Saved good/bad attempts, revised assessor fixtures, applicability records,
changed inputs/runtime, and missing artifacts drive the offline entry point.
Sentinels prove zero agent/version/setup calls. Original attempts remain
byte-identical and the appended assessment names its inputs and reason.

Behavior: Maintainer supplies a saved attempt and applicability judgment → run
the current case assessment over retained observations → append a supported
reassessment or a pending result identifying stale/missing evidence.

Sizing: five–ten minutes, medium confidence; no cache policy or migration.

## Completion and native evidence ownership

Run each focused credential-free proof at its leaf boundary. At completion run
`npm test` and `npm run lint` once. Record per-host selected-case, stream,
dependency, and offline parity evidence in this plan. Do not run `--native` or
claim native qualification. Quick Plan 21 may start only after every leaf here is
done and the retained interface is still applicable.

## Learnings and readiness

Extracted before implementation from Quick Plan 20's refined leaves 6–16. Quick
Plan 20 leaves 1–5 were already committed at extraction time. No implementation
learning yet. The leaves retain the prior refined proof loops and are ready for
direct execution.
