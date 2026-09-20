# 0007 — Software development lifecycles

**Status:** Proposed

**Date:** 2026-09-13

**Decision makers:** Terry Yin

**Consulted:** Terry Yin supplied the lifecycle direction; further advice pending.

## Context

Agents need clear workspace and integration boundaries from story preparation
through wrap-up. This proposal defines those boundaries for Story Branch Mode;
skills supply the procedures.

## Decision

### Story Branch Mode

1. Keep the shared backlog and published preparation records on `main`.
   Write seeds, stories, and plans in an owned workspace, even for tiny
   corrections. Reuse a suitable story, plan, session, or host workspace.
   Reading and discussion require none. Follow the
   [workspace procedure](../../src/skills/dough-story-refinement/references/preparation-workspace.md).
2. Leave drafts in that workspace for review without reserving the shared
   integration checkout. Publish only on an explicit keep instruction; honor
   no-publish and discard instructions through the
   [disposition procedure](../../src/skills/dough-story-refinement/references/preparation-disposition.md).
   A pause or continued discussion is no disposition decision.
3. At execution startup, move the story to **Taken** on `main`, then create its
   feature branch and worktree. Manage these resources for the developer.
   Run implementation and retrospective in that branch without integrating
   with `main` until wrap-up.
4. At wrap-up, finalize closure in the story branch and merge the completed
   change, findings, and learning into `main`. Use that learning for subsequent
   decomposition and backlog decisions.
5. Execute related stories sequentially from the preceding integrated result.
   Run independent stories in parallel only by deliberate choice.

```mermaid
flowchart TD
    A["main: manage shared backlog"] --> B["Owned workspace: decompose and refine story"]
    B --> P["Owned workspace: slice planning and refinement"]
    P -->|Resplit needed| R["Owned workspace: resplit story and map plans"]
    R --> B
    P -->|Explicit keep instruction| K["Reconcile and publish retained preparation to main"]
    K --> A
    K --> C["main: move story to Taken"]
    C --> D["Story branch: execute slices and retrospective"]
    D --> I["Wrap-up: close story and merge change, findings, and learning to main"]
    I --> A

```

## Artifacts

- **Product backlog:** shared priorities and queued or taken work.
- **Stories:** goals, scope, and key examples for valuable outcomes.
- **Slice plans:** executable slices, proof, progress, and learning.
- **Architecture North Star:** temporary architectural direction for upcoming work.
- **DearDough.md:** retrospective findings about the development process.

## Consequences

Story isolation reduces coordination interruptions but delays integration
feedback; sequential related work limits that cost. This differs from
[ADR 0002, principle 2](./0002-software-development-lifecycle-principles-accepted.md),
which requires continuous integration into a shared trunk. Until a human
resolves that conflict through acceptance with reconciliation or an explicit
exception, follow ADR 0002. This proposal does not supersede it.

Procedures remain in the skills, following
[ADR 0006](./0006-write-skills-for-executing-agents-accepted.md).
