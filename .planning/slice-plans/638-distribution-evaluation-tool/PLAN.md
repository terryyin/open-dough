# Maintain native evaluations as a Distribution tool

**Source:** [selected story](../../seeds/SEED-371-distribution-evaluation-tool.md#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool

## Goal and scope

A maintainer finds and runs native acceptance and A/B evaluation tooling from `Distribution/evaluation/`, and checks that tool independently with `npm run test:evaluation`. Ordinary CI still proves both test sets under Distribution Tests. Preserve the existing explicit native options, supported hosts, isolation, outcomes, retention, replay and historical evidence.

The seed owns the six key examples. No new host, qualification, experiment, performance claim, release, client-payload change or separate Intent entry is included. No paid session is required or authorized by this preparation. The queued [comparison corrections](../621-close-native-comparison-harness-gaps/PLAN.md) keep their behavior and proof; this story only aligns their location references.

## Existing solution and direction

Reuse the existing [family layers](../../../Distribution/tests/native-harness/native-family-layers.md), sole reader/replay corpus, supervision, identity/retention and comparison catalog/pair/baseline/recovery owners. Add no parallel runner, reader, registry or scheduler. [Original PFE and layout evidence](preparation-evidence.md#original-selected-solution-and-direction) remains valid.

Runtime belongs in src, scenarios/fixtures/assessors in cases, tool checks and test-only substitutes/counterexamples/replay inputs in tests. Classify actual responsibility/imports. Keep MakeMe/repository/install builders canonical and follow their real closure. The existing scripts/test.sh remains the one scheduler, preserving selection, admission, deadlines, reports and split allocation.

[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) authorizes the home/shared group, [0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md) keeps installation payload-declared, and [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) separates controlled checks from native acceptance/paid comparisons. No new North Star topic is needed.

## Proof ownership

| Final promise / key example | Owner and observable proof |
| --- | --- |
| Existing acceptance cases run from the tool home; example 3 | 4: migrated entry and real setup/observer/assessor/retention exercised with controlled hosts; replay, isolation, timeout and failure checks retain their verdicts. |
| Same comparison selection, outcomes and limits; example 4 | 5: catalog filters, substitute pairs, refusal and incomplete-run checks through the new comparison entry. |
| Earlier evidence remains recoverable; example 5 | 5: both original `20261114T045440-*.txt` records recover basis `9c20a8086fe48e2bd60f283f478607440a057216`; recovery prints original bytes. Frozen-baseline checks reassess after raw cleanup without changing archive integrity. |
| Focused checks and explicit native invocation; examples 1, 3 | 8: focused command runs only evaluation checks; disabled assessor fails it; a real-host launch tripwire is untouched. Controlled host substitutes stay allowed. |
| Combined Intent/CI proof, once per check; example 2 | 9: combined discovery equals the union of both roots across all shares; actual shell/file and Node-case outcomes from both roots reach the single Distribution proof summary. |
| Installed guidance and unrelated content unchanged; example 6 | 1–10: declared-payload enumeration and installed-byte checks remain green, including install-omits-internal and payload-declaration-links; final diff contains no installed-guidance or payload-declaration changes. |
| Callers, discovery and maintained instructions use the new home | Each moving slice: consumer trace and relevant consumers; 9: README commands and final stale-live-path search. Historical evidence keeps its paths. |

## Preparation evidence

[Original decisive premises, commands and observations](preparation-evidence.md) remain applicable except for the sizing assumption corrected below.

## Ordered slices

### 1. Relocate the shared host-stream reader
Type: Structure
Status: done
Proof: [Six unchanged reader/session modules in src; imports, identity and replay](slice-1-evidence.md).

### 2. Invoke ADR acceptance from the evaluation home
Type: Behavior
Status: done
Proof: [ADR native options/lifecycle, payload and 21 unchanged fixtures in cases](slice-2-evidence.md).

### 3. Relocate remaining shared native execution
Type: Structure
Status: done
Proof: [Runtime, acceptance, supervision, identity and existing one-shot groups](slice-3-evidence.md).

### 4. Invoke remaining acceptance families from their home
Type: Behavior
Status: done
Proof: [Families, copied imports, controlled journeys, identity/lifecycle and payload](slice-4-evidence.md).

### 5. Run comparisons and recover earlier evidence
Type: Behavior
Status: done
Proof: [Comparison checks, original record recovery and frozen-byte observations](slice-5-evidence.md).

### 6. Separate tool checks from operational cases
Type: Structure
Status: done
Proof: [Preserved generic extraction and actual observations](slice-6-evidence.md).

Reuse the parked 27-module/44-function extraction and five tool defaults.
Keep signals/reusable helpers in cases, check bodies/bootstrap in tests; native
paths load no check-only helpers. Restore exact compatible work, settle every
consumer purpose and missing continuation, and repair only reached paths.
Observe actual native-entry invocation/identity as well as sourced helpers.
[Attempt6](attempt-6.md) retains15 active minutes; remaining proof/correction
is bounded to that candidate (target8 active minutes), never a repeated move.

### 7. Separate guidance defaults at shared native fixture seams
Type: Structure
Status: done
Proof: [Nine guidance defaults, actual CLI continuations and identity/lifecycle](slice-7-evidence.md).

Extract seven ADR defaults and backlog/installation guidance checks into their
current routine test homes. Preserve shared native fixture/preflight/assessment
seams and canonical builders, without copying check bodies into operational
wrappers. Keep credential-free defaults and native options; update native
callers to actual entries and prove newly factored closure/identity together.
G8/G11 remain open until final tool-test relocation in slice8.

### 8. Run the relocated tool checks independently
Type: Behavior
Status: done
Proof: [Actual focused70, real fault controls, ownership and guarded current consumers](slice-8-evidence.md).

Reuse the exact156-owner/246-corpus candidate and completed observations in
[attempt8](attempt-8.md). Finish the reached support assembly and supplier-watch
failures, preserve actual check-only ownership, and settle transitive consumers.
Keep the implemented single discovery/deal, Node/Intent sources, duration labels
and locked Chromium CI setup coherent. No repeated bulk move; remaining repair
and focused proof target8 active minutes after the original15-minute attempt.

### 9. Maintain the documented tool with combined CI proof
Type: Behavior
Status: planned
Proof: maintained navigation and commands, same-group mixed-root file/Node-case
pass/fail summary, three-share union, installation limits and final default suite.

Complete README prerequisites, native options/evidence limits and live navigation
from the retained candidate. Extend real CI proof and discovery regressions:
guidance plus tool checks once under Distribution Tests, executable sources only,
preserved named/substitute/admission/deadline/reporting behavior. Run the final
`npm test` and3-share preview; retain all historical bytes and canonical builders.
The independent focus and combined-maintenance gates no longer share one budget.

### 10. Settle named one-shot aggregate execution
Type: Behavior
Status: planned
Proof: the selected aggregate retains every scenario, reports under the chosen
contract and completes within unchanged job deadlines under supported load.

G7 correction preserves one job per named file unless the human selects the
pending three-group reporting change. A causal cost repair under the existing
contract remains authorized. [Prior measurements and limits](attempt-3.md)
retain failed and passing observations; a passing retry is no repair.

Splitting in-progress8 yields ten slices under the execution-only exception.
[Attempt8](attempt-8.md) reassesses the story boundary, exact park, retained proof
and failed sizing assumption; completed1–7 and the selected outcome are unchanged.

## Frozen case evidence

`cases/delivery-evidence/fixtures/terminal-precomputed.json` is 711 lines on base and after movement. Preserve it unchanged: SHA256 `7bce429d7778db821f051f695c99adced54babd114f03b412e886d7f0a56dbf1` is referenced by retained 20261020 terminal native records. Case-input/historical-evidence preservation authorizes this one frozen-data exception to 250 lines; never split/reformat or extend that exception to maintained code.

## Execution gates and current decisions

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written, including local/CI differences and failures predating this work.
- Apply AGENTS.md's test conventions and timeout rules. Use controlled hosts
  only at the external boundary; exercise real setup, Git, readers, assessors,
  retention, discovery and proof reporting. No browser behavior changes.
- Generate the installed consumer trace from each actual movement diff,
  including indirect shell sources, generated fixture scripts, import closure,
  corpus guards, hash inputs and historical recovery. Dispose of every listed
  consumer through proof or an evidenced exclusion. Follow transitive callers
  regardless of whether their filenames contain `native`.
- Local gate: focused affected checks; final `npm test` and3-share preview for
  the cross-family/runtime/discovery migration. Preserve duration values and
  required hooks/typecheck when JavaScript reaches dashboard consumers.
  Follow the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  fully awake on AC under `caffeinate -s -i`; on battery plug in, or lid open
  under `caffeinate -i` then inspect sleep logs. Respect shared full-suite
  admission and current headroom; no idle prerequisite.
- Recheck trunk/overlap. Preserve silent supplier wait `ef93db6c` and findings;
  no harness change there. Plan 621 remains separate, location-only alignment.
  Shared filenames alone need no blocking supplier agreement.
- Each slice has one capability/proof loop and 15 active minutes excluding
  commands. Use existing seams; broader redesign triggers reassessment,
  never silently absorb the separate harness corrections.
- Cumulative design: one execution/observation/assessment implementation serves
  both acceptance and comparison; one scheduler serves focused and combined
  checks. Interim acceptance/comparison checks stay at their old test locations
  until slice 8, with imports updated in each moving slice; slice 8 removes
  that temporary layout. Every delivered boundary must pass CI.
- Earlier sizing attempts and compatible proof remain in linked attempt1/2/3/6
  evidence. Current in-progress8 refinement preserves all delivered value and
  every source promise; only the named aggregate reporting change waits for a human.

## Execution context

[Established identity, publication and observer](attempt-3.md#retained-execution-context).

## Story obligations

### G1. Admission fixture path after relocation
Reported: slice 1 — "admission reuse fixture copies the old background CI native probe path"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 4: slice-4-evidence.md renewed admission/identity proof; copied case closure includes the actual CI probe and admission compare produces current identity, replay pass and complete input correspondence.

### G2. Counterexample assessor paths after relocation
Reported: slice 1 — "owned-context and one-shot counterexamples resolve assessors beside old support"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 4: slice-4-evidence.md publication owned-context and all three one-shot group suites; dynamic counterexamples load actual relocated assessor modules and reject each deliberately altered observation.

### G3. Browser selection after relocation
Reported: slice 1 — "browser-group-shards reports zero selected actual specs for every browser group"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 1: slice-1-evidence.md command 1; browser-group-shards.test.mjs enumerates actual specs and observes each exactly once plus new-spec preview

### G4. Standalone comparison sourcing after relocation
Reported: slice 1 — "native-codex-owned-proof passes but prints missing paths because standalone comparison sourcing has no source_dir"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 3: slice-3-evidence.md initial nine passing checks; standalone native-codex-owned-proof.test.mjs sources comparison without caller source_dir and observes current/forked/failed/unknown ownership with silent runner output

### G5. Executable shim owners
Reported: slice 1 — "publication fixture shim discovery scans only old support, missing moved executable owners"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 3: slice-3-evidence.md five-check publication renewal; native harness counterexamples observe real login-shell shim resolution and reject each deliberately missing shim

### G6. Deleted tracked snapshot inputs
Reported: slice 1 — "admission snapshot enumeration attempts deleted old runtime paths"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 1: slice-1-evidence.md command 1; native-admission-reuse.test.mjs exercises complete copied Git/input closure through current evaluation sources without deleted tracked paths

### G7. One-shot safety deadline
Reported: slice 1 — "one-shot aggregate hit the existing 180-second safety deadline during the broad selected gate"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 10

### G8. Mixed default-check bodies in moved ADR entries
Reported: slice 2 — "Routine test entries remain at old paths and currently dispatch mixed default branches in the moved cases (interim extraction needed in slice 6)."
Story clause: "Give the tool one home under `Distribution/evaluation/`, with `src/` for implementation, `cases/` for reusable scenarios and their assessors, `tests/` for automated checks of the tool, and a maintainer `README.md`."
Disposition: proved by slice 8: slice-8-evidence.md actual157-owner test-home mapping, nine guidance defaults retained, full focused70 and controlled CLI/identity/replay observations; no check-only loader on native paths.

### G9. Delivery identity omits the actual native entry
Reported: slice 3 — "native_result_journey_input_hash_lines hashes the thin routine delivery wrapper instead of the moved native entry; current listed-input mutation tests miss that omission."
Story clause: "preserve case selection, host support, outcome and failure semantics, supervision, retention and evidence identity during the move."
Disposition: proved by slice 3: slice-3-evidence.md red expectation followed by six-check renewal; actual selected native entry is listed and byte mutation changes its evidence digest

### G10. Operational retained-attempt and publication replay closure
Reported: slice 3 — "Operational admission reuse imports a shared retained-attempt reader and family-owned publication stream/replay helpers from tests/support."
Story clause: "Give the tool one home under `Distribution/evaluation/`, with `src/` for implementation, `cases/` for reusable scenarios and their assessors, `tests/` for automated checks of the tool, and a maintainer `README.md`."
Disposition: proved by slice 4: slice-4-evidence.md renewed operational admission/replay and inspection; dynamic assessment imports actual case-owned fields/replay, observes pass and unavailable-assessor states, and preserves retained artifact bytes.

### G11. Remaining-family check bodies and dependencies in cases
Reported: slice 4 — "Native entries retain default automated branches behind old thin wrappers; CI, closure and one-shot run modules also still source test-only counterexamples."
Story clause: "Give the tool one home under `Distribution/evaluation/`, with `src/` for implementation, `cases/` for reusable scenarios and their assessors, `tests/` for automated checks of the tool, and a maintainer `README.md`."
Disposition: proved by slice 8: slice-8-evidence.md all generic check bodies/defaults/counterexamples assembled only in tool tests, native fixture/preflight responsibilities retained; actual focused70 and publication assembly renewal pass.

### G12. Current baseline consumer purposes after supplier placement
Reported: slice 5 — "Acceptance found that six baseline consumer observations precede the final supplier shared-input path change; fresh-pair setup alone does not observe their current archive reuse, refusal and provenance purposes."
Story clause: "preserve case selection, host support, outcome and failure semantics, supervision, retention and evidence identity during the move."
Disposition: proved by slice 8: slice-8-evidence.md full focused70 renews all six baseline purposes after current test placement and default-dispatch hash changes: archive raw-cleanup/source integrity, conditions/usage, readers, reuse/fresh/failure, misses and unavailable/truncated evidence. Earlier slice-5-evidence.md observations retain their original boundary; frozen records remain unchanged.
Commitment: C17

### G13. Stream guard omits evaluation Git enumeration
Reported: slice 6 — "Closure inspection found that native-stream-guard.mjs scannedRoots includes evaluation, but its listFiles Git pathspecs still enumerate only Distribution/tests and scripts."
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 8: slice-8-evidence.md old Git guard red for evaluation stray, current Git pathspec/writer/corpus closure and actual stray/stale-writer replay negatives pass in three-file gate and full70; no filesystem fallback.
Commitment: C31

### G14. Recovered CI and default-suite failures
Reported: slice 8 — "Retained registered CI attempts fail six drift cases at the retired fixture path and the Linux public entry scratch guard; final default suite also rejects the now-valid second Chromium cache."
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: proved by slice 8: slice-8-evidence.md owned CI repair; six real replay cases, every-cache guard controls and Linux public-entry red/green preserve strict scratch and retained evidence semantics.

### G15. Publication identity omits the host runner
Reported: slice 8 — "Actual public CLI retained publication record omits changed git-publication-native-host.sh; existing identity membership expectations miss it."
Story clause: "preserve case selection, host support, outcome and failure semantics, supervision, retention and evidence identity during the move."
Disposition: proved by slice 8: slice-8-evidence.md owned CI repair; actual public CLI record matches current dispatcher SHA, all six derived profiles observe membership/content changes, and admission reuse consumers pass.
