# Preserve recurring process findings in DearDough.md

## Source and outcome

[SEED-010 Story 1](../../seeds/SEED-010-learn-from-execution-retrospectives.md#turn-retrospectives-into-learning-loop)
is source complete as of 2026-09-10. Proposed skill:
[`dough-execution-retrospective`](../../../src/skills/dough-execution-retrospective/SKILL.md).
Behavior evidence:
[`RECOGNITION.md`](../../../src/skills/dough-execution-retrospective/RECOGNITION.md)
and [evidence/](evidence/). Story 2 owns release and adoption.

A developer receives one readable local process log with stable issue and
execution identities. Rereview does not inflate occurrence rows, distinct
supported recurrence does, and uncertain matches remain separate.

**Excluded:** cross-tool testing and acceptance, release/adoption, consumers,
remote exchange, automatic guidance edits, token measurement, migration,
pruning, locking infrastructure, causal inference engines, automatic issue
merging, and near-future direction changes.

The source-only change follows
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
No conflict, supersession issue, or exception was found.

## Ordered slices

### 1. Preserve a first supported process finding locally
Type: Behavior
Status: done
Proof: Default and explicitly overridden destinations received one readable
issue occurrence. Process skip, no findings, missing context, an existing-log
interim refusal, and failed write produced no false success.
Evidence: [evidence/slice-1/WALKTHROUGH.md](evidence/slice-1/WALKTHROUGH.md).

### 2. Maintain recurring findings without double counting
Type: Behavior
Status: done
Proof: Identical rereview remained byte-identical; new evidence enriched one
existing row; a distinct representative execution added one matching row;
uncertain symptoms became a separate issue; human notes, unrelated entries, and
ambiguous-file bytes were preserved.
Evidence: [evidence/slice-2/WALKTHROUGH.md](evidence/slice-2/WALKTHROUGH.md).

## Proof ownership

| Promise | Evidence |
| --- | --- |
| Canonical readable log, qualified evidence, skip/no-finding/context/write boundaries | Slice 1 walkthrough and generated files |
| Rereview deduplication and evidence enrichment | Slice 2 starting, identical-rereview, and maintained files |
| Distinct recurrence, conservative matching, stable IDs | Slice 2 maintained log and representative records |
| Human notes, unrelated evidence, and ambiguous content preserved | Slice 2 preservation checks and malformed-file digest |
| Cross-tool testing and acceptance | Explicitly excluded; no completion gate |

## Delivery

- Slice 1 commit: `edb22ec`.
- Codex CI observer used `ci.yml` / `CI` for branch
  `codex/quick-036-record-retrospective-process-findings`. Coverage became
  unavailable after the first push when `gh run list` could not connect to
  `api.github.com`; the observer finished, its process exited, and cell 27 was
  reaped. Pending CI is unobserved; no polling substitute was used.
