# 0005 — Cross-tool validation through native acceptance stories

**Status:** Accepted

**Date:** 2026-09-07

**Decision makers:** Terry Yin

**Consulted:** Terry Yin.

## Context

Open Dough must work in Codex, Cursor, and Claude Code. Use representative native
checks and reusable evidence to limit validation cost.

## Decision

### 1. Test Open Dough's responsibilities

- Test our installation, tool integration, and intended skill behavior. Do not
  test general agent competence or build a conformance suite for vendor skill
  systems.
- Use representative skills to verify each shared integration mechanism on all
  three tools. Cover discovery, invocation/application, and an intended outcome;
  include installation, updating, and coexistence where affected.
- Reuse each tool's integration evidence for skills using the same mechanism.
  Add integration cases only for materially different mechanisms or invalidated
  evidence, such as a new discovery path or activation mode. Do not create a
  separate integration suite for every skill.
- Test each skill's own behavioral requirements. Shared integration evidence
  does not prove another skill's behavior. Define shared cases once; select
  native runs by unresolved risks, without requiring every case on every tool.
- Record evidence or justified reuse for each affected requirement on each tool.
  Do not infer one tool's success from another's. Leave missing proof pending.

### 2. Keep deterministic checks in CI

- Maintain one shared behavioral source with minimal platform adapters.
- Run real installer/update operations, policy/error cases, payload/reference
  checks, and preservation/coexistence checks without agent credentials.
- Test maintained runner and assessment logic with substitute processes and
  recorded good/bad outputs. Test shared logic once and adapter differences per
  tool; do not repeat every scenario and counterexample across all tools.
- Treat runtime-consumed Markdown as product content. Check intended behavior,
  allow equivalent phrasing, and test prose assessors with paraphrases. Use exact
  matching only for explicit contracts such as payload bytes or required markers.
- Do not count static checks, file copying, transcript replay, or direct model
  API calls as native behavioral evidence.

### 3. Track native acceptance separately

- Let implementation stories finish when their functional and inexpensive test
  criteria pass. Track outstanding native requirements in linked acceptance
  stories; do not mark them passed with implementation completion.
- Give each acceptance story an outcome, covered work or feasibility question,
  required tools, representative cases, reusable evidence, and completion criteria.
- Resolve feasibility questions before dependent implementation. Combine native
  acceptance for completed work where practical, and complete it before releasing
  affected behavior.
- Assign each affected requirement to an acceptance story or justified reusable
  proof. Keep integration coverage separate from skill behavior coverage. Do not
  require a full tool-by-skill-by-scenario matrix.

### 4. Run and assess only the checks needed

- Automate repeatable setup, execution, cleanup, and reporting. Use isolated
  fixtures and fresh sessions where prior context could hide discovery failures.
- Use the native tool interface and prompts that do not supply expected answers.
  Require loading/invocation evidence and the intended outcome. Do not accept
  self-report or exit 0 as sufficient proof.
- Automate reliable state and behavior checks; test assessors against
  counterexamples. Where prose cannot be assessed reliably with a small check,
  review it against explicit expectations and record the supporting evidence.
  Leave unresolved outcomes inconclusive.
- Bound execution and retries. Retain failures; do not rerun until green.
- Keep update followed by fresh use as one journey unless separate execution
  serves a concrete need. Add selection, dependency tracking, or review machinery
  only when needed to run or maintain the chosen checks.

### 5. Retain and reuse evidence

- Save the requirement, result, candidate, tool/runtime, relevant inputs, and
  decisive evidence. For shared integration proof, identify the mechanism and
  representative skill.
- Review saved evidence before running new sessions. Record why reuse applies
  to the current guidance, adapters, helpers, fixtures, and runtime conditions.
  A documented review is sufficient; an automated reassessment interface is
  optional.
- Preserve original evidence and record later judgments with reasons.
  Distinguish reused proof from fresh execution.
- Revalidate requirements whose evidence is invalidated or insufficient. An
  instruction edit may invalidate behavior proof while leaving installation
  and discovery proof applicable. Check the effect on all three tools.

## Consequences

Release affected behavior only when required native checks pass or have justified
reusable evidence. Keep missing validation pending. Store execution details and
reuse decisions in acceptance stories or evidence records, not in this ADR.

## Related

- [Acceptance guard](../../AGENTS.md)
- [ADR 0000 — Human decision ownership](./0000-use-adrs-accepted.md)
- [ADR 0003 — Immutable release identity](./0003-tagged-release-versioning-accepted.md)
- [Research and sources](../../.planning/research/cross-tool-validation.md)
- [SEED-007 — Test migration and native acceptance stories](../../.planning/seeds/SEED-007-cross-tool-validation.md)
