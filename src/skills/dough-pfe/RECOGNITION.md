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
