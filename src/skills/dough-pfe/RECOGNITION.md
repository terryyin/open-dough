# Recognition: dough-pfe

Review: ready for maintainer review

## Purpose

Find and use suitable existing product solutions before adding or relocating an
implementation responsibility, preserving whole-product domain cohesion.

## Triggers

An agent is responsible for implementing or relocating product behavior and
needs to decide whether the product already contains a suitable conceptual
solution. Direct PFE or Proudly Found Elsewhere requests also invoke it.

## Distinguishing behavior

- Searches across the whole product and relevant process boundaries using
  domain concepts, behavior, callers, tests, documentation, data flow, and
  ownership rather than only names or code shape.
- Judges fit by responsibility, purpose, rules, invariants, and lifecycle.
- Chooses justified direct reuse, change, purpose-preserving modularization, or
  an explicit gap, then stops searching when evidence is sufficient.
- Stops for the developer when domain meaning or an unauthorized consequential
  choice remains unresolved, while preserving project and ADR authority.

## Required project context

The implementation responsibility and its purpose; the selected story or plan;
current product behavior and boundaries; domain language; applicable project
decisions; and project navigation needed to search the whole product.

## Differences that rule out replacement

Guidance is not equivalent if it searches only the assigned component, treats
similar code as proof of shared meaning, requires repeated or exhaustive search,
forces unrelated responsibilities together, changes the original purpose while
modularizing, or lets an agent silently settle unresolved domain or
architectural choices.

## Authoring walkthrough

Story 44 Slice 2 used one basket-total responsibility with four variants:

- **Direct fit:** An existing product operation already owns summing the prices
  of basket items under the same rules and lifecycle. The skill follows domain
  concepts and callers to it, selects direct reuse, cites the shared meaning,
  and stops searching because the evidence establishes the fit.
- **Process-boundary modularization:** The same total is embedded in another
  process whose orchestration must remain intact. The skill searches across
  that boundary and selects exposing the cohesive calculation for both callers,
  including the necessary current structural change while preserving the
  original process's purpose and behavior.
- **Similar code, different meaning:** Another routine also adds monetary
  values but calculates an accounting settlement with different ownership,
  rules, and lifecycle. The skill rejects reuse despite its similar shape,
  records the domain mismatch, and makes the basket-total gap explicit.
- **Unresolved domain meaning:** Evidence does not establish whether discounts
  belong to basket pricing or a later checkout process. The skill stops the
  affected choice and gives the developer both interpretations, their evidence,
  and the ownership decision needed to continue; it neither forces reuse nor
  overrides project direction.

In each variant, invocation and required context are explicit and the outcome is
a justified use/change decision or a focused developer question. This is a
manual source walkthrough, not a native Codex, Cursor, or Claude Code run, and
does not establish promotion or release readiness.
