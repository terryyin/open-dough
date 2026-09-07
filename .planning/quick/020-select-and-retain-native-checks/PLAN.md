# Run one needed native check without replaying or losing the others

Status: executing; leaves 1–5 done, final checkpoint pending.
Order: **20 → 22 → 21**. This plan does not depend on plan 22.

## Scope

Follow [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
Deliver the context runner portion of
[SEED-007 Story 1](../../seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks):
selection, durable evidence, bounded execution, and retained failures.
Keep completed safeguards and their focused tests. Do not rebuild them.

[Plan 22](../022-retain-native-evidence-for-verdicts/PLAN.md) completes Story 1
with stream completeness and a representative update→fresh-use journey.
[Plan 21](../021-trust-native-verdicts/PLAN.md) then repairs assessment.
Do not require selected execution of every delivery stage, dependency attempt
IDs, or an offline reassessment interface to complete this plan.

Keep native opt-in, existing default checks, platform isolation, and shared
helpers. This plan changes internal test tooling only. Native acceptance remains
in SEED-007 Story 3; do not run native agents or certify old evidence here.

## Ordered slices

Completed leaves below retain their original proof scope.

### 1. Inspect the available check before spending a native call

Type: Behavior
Status: done
Proof: Selection tests list the fixed inventory and dependencies for all three
hosts; installed sentinel agent commands record zero calls. Invalid input exits
nonzero before fixture creation. Existing default checks still pass.

Behavior: Existing wrappers → request listing or invalid selection → get the
case/host/purpose/setup and prior-result references, or an actionable usage error,
without native execution. Add brief usage alongside the options.

Sizing: approximately five minutes, medium confidence; keep inventory static.

### 2. Keep a selected context attempt after scratch cleanup

Type: Behavior
Status: done
Proof: Invoke each existing host/scenario path with a successful substitute;
check only the selected session ran, scratch is gone, and record plus required
artifacts remain readable under `DIR/<host>/<case>/<attempt-id>/` so listing
reports them as unreviewed prior-evidence. A second attempt gets a distinct
path. An unwritable result destination launches nothing. Check Cursor Agent
runtime identification.

Behavior: Selected context case and writable result destination → run the case
→ receive a durable, identified attempt usable after cleanup. Listing can now
show that saved attempt as prior evidence, explicitly unreviewed for reuse.

Sizing: five–ten minutes, medium confidence; reuse existing structured streams
and snapshot functions. If record wiring needs separable beats, split at the
first host's complete retained attempt before expanding adapters.

### 3. Bound an owned context command without changing successful runs

Type: Structure
Status: done
Proof: `bash tests/native-result-retention.sh` and
`bash tests/native-case-selection.sh` still pass. Selected context runs accept
a deadline and termination grace, defaulting high enough that recorded-success
substitutes are unchanged. No hang fixture yet.

Internal change: the selected context runner owns the native command's process
group and can enforce a deadline plus finite grace, including on Ubuntu without
`sandbox-exec`. Do not replace Codex symlink isolation or add new OS support.
Immediate next Behavior: leaf 4's hung-attempt timeout.

Sizing: approximately five minutes, medium confidence after split; wire only
what leaf 4 needs.

### 4. Stop a hung context attempt and keep partial evidence

Type: Behavior
Status: done
Proof: A substitute starts a child, emits partial output, and ignores normal
termination. With a short deadline, the wrapper returns nonpassing within
deadline plus grace; neither owned process remains alive; partial evidence is
retained; a previously completed attempt is byte-identical; the invocation log
shows no retry. Focused test: `tests/native-run-timeout.sh`.

Behavior: Running selected context attempt hangs → configured deadline expires →
runner terminates owned work, reports timeout, and finalizes retained evidence.

Sizing: approximately five minutes, medium confidence; uses leaf 3's supervisor
and leaf 2's result layout. Bound the proof to owned processes.

### 5. Preserve why a selected attempt could not execute

Type: Behavior
Status: done
Proof: Missing executable, nonzero launch, and explicit denied-operation fixtures
produce nonpassing records with available stderr/reason and no retry. Previous
success remains byte-identical; cleanup cannot mask the original failure.

Behavior: Selected context attempt cannot run successfully → launch/failure is
observed → return a retained failure instead of losing it through `set -e` or
an exit trap. Unknown runtime is recorded when no version can be obtained.

Sizing: approximately five minutes, medium confidence; use leaf 2's finalizer.

### 6. Close the context runner checkpoint

Type: Verification
Status: planned

Verify the delivered selection, context retention, timeout, and launch-failure
interfaces. Run `npm test` and `npm run lint` once and record their results.
Check that test usage matches implemented options. Keep unimplemented delivery
selectors explicitly unavailable; do not expand them to complete this checkpoint.

Complete plan 20 when these checks pass. Continue to plan 22 for the remaining
Story 1 work. Do not wait for plan 22 or mark all of Story 1 complete here.

## Retained implementation evidence

These are prior recorded cheap checks, not newly executed or native proof.

| Completed work | Recorded evidence |
| --- | --- |
| Listing and invalid selection | `tests/native-case-selection.sh`; listing makes no agent/version calls and labels saved attempts unreviewed. |
| Context retention | `tests/native-result-retention.sh`; keeps record, events, response, and observations after scratch cleanup; rejects unwritable destinations before launch. |
| Deadline and process ownership | Selection and retention tests; `--deadline` defaults to 3600, `--grace` to 15; owned groups use `setsid` or `perl setpgrp`. |
| Hung execution | `tests/native-run-timeout.sh`; exit 124, owned processes stopped, partial evidence retained, no retry, prior attempt unchanged. |
| Launch failures | `tests/native-runner-failures.sh`; missing/nonzero/denied execution retained with reason, `assessment-status: not-run`, and reported result path. |

| Platform | Retained adapter observations | Native acceptance |
| --- | --- | --- |
| Codex | Recorded-command context checks; native symlink isolation retained, substitutes skip `sandbox-exec`. | Pending review in Story 3. |
| Cursor | Recorded-command context checks; runtime uses `cursor agent --version`, unavailable values stay unknown. | Pending review in Story 3. |
| Claude Code | Recorded-command context checks through its adapter. | Pending review in Story 3. |

Keep test helpers under `tests/support/` so the test runner does not execute
them independently. Keep shared selection logic small; do not add a framework.
The former delivery and reassessment leaf lists are replaced by the reduced
plan 22. Completed evidence above remains applicable only to its recorded scope.
