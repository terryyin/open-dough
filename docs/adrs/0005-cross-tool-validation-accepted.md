# 0005 — Cross-tool validation through native acceptance stories

**Status:** Accepted

**Date:** 2026-09-10

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
  three tools. Cover intended skill behavior and a useful outcome; include
  installation, updating, and coexistence where those stories require it.
- Reuse each tool's integration evidence for skills using the same mechanism.
  Add integration cases only for materially different mechanisms or invalidated
  evidence, such as a new activation mode. Do not create a separate integration
  suite for every skill.
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
  fixtures and fresh sessions where prior context could hide failures.
- Use the native tool interface and prompts that do not supply expected answers.
  Require evidence the skill was used and produced the intended outcome. Do not
  accept self-report or exit 0 as sufficient proof.
- Automate reliable state and behavior checks; test assessors against
  counterexamples. Where prose cannot be assessed reliably with a small check,
  review it against explicit expectations and record the supporting evidence.
  Judge the current result now. An inconclusive result does not satisfy
  acceptance; resolve required proof before accepting the work.
- Bound execution and retries. Keep failures available during current assessment;
  do not rerun until green or retain failure records after story wrap-up.
- Keep update followed by fresh use as one journey unless separate execution
  serves a concrete need. Add selection, dependency tracking, or review machinery
  only when needed to run or maintain the chosen checks.
- Everyday skill authoring follows the shared guideline in `AGENTS.md`. Review a
  conventional skill change by its useful behavior; do not treat a routine
  per-tool discovery recheck as the default maintenance gate.

### 5. Assess now and delete spent evidence

- During active work, collect the requirement, result, candidate, tool/runtime,
  relevant inputs, and decisive evidence needed to judge that work. For shared
  integration proof, identify the mechanism and representative skill.
- Make the required judgment while the work is active. Decide whether the
  evidence supports acceptance or what remains unresolved; do not postpone
  judgment or keep a record for someone to judge later.
- Before running new sessions, assess applicable evidence already available
  during active work or recovered from Git. Establish why reuse applies to the
  current guidance, adapters, helpers, fixtures, and runtime conditions.
  Distinguish reused proof from fresh execution. Recovery and reuse are driven
  by the current decision, not a requirement to maintain an evidence archive.
- Revalidate requirements whose evidence is invalidated or insufficient. An
  instruction edit may invalidate behavior proof while leaving installation
  proof applicable. Check the effect on all three tools when those requirements
  remain in scope.
- At story wrap-up, delete the spent plan, completed story, execution records,
  original proof and evidence, assessment and reuse records, and impact history
  from the current repository snapshot. Leave no archive, completion summary,
  tombstone, or later-judgment record. Ensure history is recoverable in Git;
  future contributors recover what they need and make their own judgments when
  a real decision arises.
- Assimilate lasting knowledge into maintained code, tests, and documentation
  describing current behavior and decisions without execution history or
  retrospective judgments. Keep maintained test fixtures that verify current
  behavior; delete historical run artifacts.
- Delete obsolete process instructions and commentary about removed maintenance
  gates from current guidance. Do not archive removed process as enduring
  policy history.

## Consequences

Release affected behavior only when required native checks pass or have justified
reusable evidence. Missing validation remains active unfinished work, not an
accepted result awaiting later judgment. Evidence and assessment records serve
the current decision and are deleted at wrap-up; Git supplies historical
recovery. The current repository contains the maintained product and its
guidance, not an archive of execution or judgments.
Author conventional skills with the shared `AGENTS.md` guideline and a
representative behavior review.

## Related

- [Maintainer guidance](../../AGENTS.md)
- [ADR 0000 — Human decision ownership](./0000-use-adrs-accepted.md)
- [ADR 0003 — Immutable release identity](./0003-tagged-release-versioning-accepted.md)
- [SEED-007 — Standalone update in Claude Code](../../.planning/seeds/SEED-007-cross-tool-validation.md)
