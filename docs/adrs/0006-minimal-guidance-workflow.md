# 0006 — Minimal guidance and useful outcomes

**Status:** Proposed

**Date:** 2026-09-08

**Decision makers:** Terry Yin

**Consulted:** Terry Yin through the backlog, refinement, and planning discussion;
further advice open.

## Context

Open Dough is a personal project. Its maintainer benefits from useful shared
skills, short instructions, and straightforward updates. Manual review and
project-specific fixes suit its scale. Every maintained artifact consumes time.

## Decision

1. Choose the smallest useful outcome for a real task. Consider manual work
   first. Add automation when a current, repeated need makes it worthwhile.
2. Keep shared behavior in one source and use the established Codex, Cursor,
   and Claude Code layout conventions. Review skill naming, frontmatter,
   references, triggers, and intended behavior through one concise guideline.
3. Extract an ordinary project practice directly into unreleased `src/skills/`.
   Preserve useful behavior and make adopter context explicit. Review the
   resulting skill manually. Tagging and publication are separate actions.
4. Validate useful behavior with a representative example. Use existing focused
   checks for executable functionality and manual review for guidance. Select
   a native session when a concrete task or observed issue benefits from it.
   Judge its functional outcome. Routine discovery follows the shared conventions.
5. Write instructions and acceptance examples as positive descriptions of the
   intended workflow. Keep tests that exercise current functionality. Keep each
   story focused on one evaluable outcome and each plan on the next useful work.
6. Delete obsolete process, code, tests, fixtures, evidence, and documentation,
   including supporting historical explanations and archived copies. Keep
   current decisions and the rationale needed to use them. Apply this retention
   rule to planning and ADR material as well as implementation.
7. Retain immutable release identity and the maintainer's version choice under
   [ADR 0003](./0003-tagged-release-versioning-accepted.md). Clients review the
   actual installed changes and address project-specific situations manually.

## Effect on current decisions

Upon acceptance, this decision replaces
[ADR 0005](./0005-cross-tool-validation-accepted.md) and changes
[ADR 0000](./0000-use-adrs-accepted.md)'s retention rule to the current-use rule
above. Align the ADR index and active guidance with the accepted text, and
remove obsolete material. Humans continue to own architectural decisions.

## Consequences

The maintainer spends less time maintaining process and more time improving
skills. Review remains small and task-specific. Unusual cases may require a
manual fix when first encountered. Skills continue to target all three tools
through shared conventions and useful behavior.
