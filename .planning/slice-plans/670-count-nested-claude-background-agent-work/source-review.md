# Source review

Reviewer: a fresh general-purpose agent (Sonnet) on 2026-11-16. It was given
only the selected story's text: Goal, Scope, deferred promises, Key examples,
Evidence, and Alternatives. It received no plan, code, or proof, and it read no
files. It returned the ids below. Its unnumbered context covered the goal
rationale, today's baseline, deferred promises, evidence figures, rejected
alternatives, shared-ancestor and cycle handling (unchanged), the import-based
evaluation, and the ADR and proof method.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A response in any worker transcript climbs to its launch through each worker's own recorded agent result, in the root or another worker's transcript, at any depth (Scope 1; Goal; Key example "Second-level agent": a3c1825c… joins via aef2d680…'s result, all 846 second-level responses counted) | slice 1 | observed: claude-nested-workers.spec.ts joined and forked cases; real-store import assigns all 846 second-level responses (SEED-334 3,545 responses, no unassigned entry) |
| 2 | After one import, SEED-334's launch Claude Code total matches its 74.03M transcript cost (Goal; Key example "Second-level agent") | slice 1 | observed: real-store import 2026-11-16, SEED-334 Claude Code Usage index 74.03M (56.33M before) |
| 3 | A worker whose agent result is missing keeps explained gaps: responses unassigned with `unresolved-native-task-lineage`, worker named by `unjoined-worker-evidence` (Scope 2; Key example "Missing join") | slice 1 | observed: claude-nested-workers.spec.ts "leaves a nested worker without a recorded agent result unassigned and explained" (taskId null, observation gap unresolved-native-task-lineage, import gaps include unjoined-worker-evidence) |
| 4 | A first-level agent started by the coordinator joins through the root transcript as today; its figures do not change (Key example "First-level agent") | slice 1 | observed: claude-usage.spec.ts first test and claude-coverage.spec.ts pass unchanged; real-store import changed no launch without nested workers through this change (per-session old/new climb replay identical) |
| 5 | Import and Refresh apply the same lineage rule (Scope 3) | slice 1 | observed: usageImport.ts:186 and usageRefresh.ts:169 both call claudeAssociation → claudeAncestry; no host-specific branch |
| 6 | An existing usage store gains the newly joined responses when it next imports the affected sessions (Scope 3; "after one import") | slice 1 | observed: real-store import 2026-11-16 raised SEED-334 from 2,699 to 3,545 responses (56.33M → 74.03M) with no launch dropped or shrunk |
| 7 | Refresh rereads only sessions whose files changed since its check, as today (Scope 3) | slice 1 | observed: usageRefresh.ts unchanged; usage-check-freshness.spec.ts passes |
