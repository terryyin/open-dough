# 0005 — Cross-tool validation through native acceptance stories

**Status:** Accepted

**Date:** 2026-09-07

**Decision makers:** Terry Yin

**Consulted:** Terry Yin.

## Context

Open Dough must work natively in Codex, Cursor, and Claude Code. Model-backed
validation is expensive; preserve independent native evidence while minimizing
execution through broad inexpensive tests and deliberate backlog planning.

## Decision

### 1. Run broad inexpensive coverage in CI

Maintain one shared behavioral source with minimal platform adapters. Run real
installer/update operations, policy/error matrices, payload/reference checks,
and preservation/coexistence assertions in credential-free CI. Test runner
failures, evidence selection, and assessors with substitute agent processes and
recorded good/bad outputs. Keep the full cheap suite until measurements justify
selection or sharding. Treat runtime-consumed Markdown as product content.

Do not count static validation, file copying, transcript replay, or direct model
API calls as native behavioral evidence.

### 2. Plan native acceptance as dedicated backlog stories

Exclude native behavioral acceptance from most implementation stories' criteria.
Let those stories finish when their stated functional and inexpensive automated
criteria pass. Track outstanding native claims in linked, dedicated product
backlog stories; implementation completion does not imply native acceptance.

Use native acceptance stories to validate several completed stories together,
or to prove a specific feasibility question before detailed implementation.
Give each one a named outcome, covered stories or hypothesis, required platforms,
representative cases, applicable prior evidence, and explicit completion criteria.
Prioritize feasibility stories before dependent implementation and consolidated
acceptance stories before releasing the affected behavior.

Assign every affected native claim to an acceptance story or justified reusable
proof. Cover discovery, invocation/application, and intended behavior separately
in Codex, Cursor, and Claude Code; include installation, updating, and coexistence
where affected. A limited proof of concept establishes only its stated scope.
Choose cases by distinct unresolved risks, not every deterministic variation.

### 3. Automate execution and assessment with minimal human intervention

Automate setup, native execution, assessment, cleanup, and reporting. Use isolated
fixtures and fresh sessions where prior context could hide discovery failures.
Test through the actual native interface with prompts that do not supply the
expected answer. Require native loading/invocation evidence and the intended
behavioral outcome; self-report or exit 0 alone is insufficient.

Validate automated assessors against counterexamples. Use human judgment for
unresolved outcomes; keep them inconclusive until resolved. Bound retries and
retain failures rather than rerunning until green.

### 4. Retain and reuse relevant evidence

Record each claim's result, tested candidate, platform/runtime, relevant test
inputs, and decisive evidence. Reuse proof when relevant guidance, adapters,
helpers, fixtures, and runtime conditions remain applicable. Reassess saved
artifacts before spending on new sessions. Revalidate affected claims when inputs
change or evidence is insufficient; shared changes can affect all three hosts.
Keep missing validation pending and distinguish reused proof from fresh execution.

## Consequences

- Implementation stories can finish before native validation; linked acceptance
  stories keep the remaining obligations visible at backlog level.
- Release affected behavior only after its required native claims pass or have
  justified reusable evidence. Missing or skipped validation remains pending.
- Maintain selection mappings and automated assessors as tested assets; retain
  research and execution details outside this ADR.

## Related

- [Acceptance guard](../../AGENTS.md)
- [ADR 0000 — Human decision ownership](./0000-use-adrs-accepted.md)
- [ADR 0003 — Immutable release identity](./0003-tagged-release-versioning-accepted.md)
- [Research and sources](../../.planning/research/cross-tool-validation.md)
- [SEED-007 — Test migration and native acceptance stories](../../.planning/seeds/SEED-007-cross-tool-validation.md)
