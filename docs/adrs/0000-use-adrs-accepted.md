# 0000 — Use Architectural Decision Records (ADRs)

**Status:** Accepted

## Context

Open Dough is a new project defining a shared software development lifecycle
and its integrations with AI development tools. Its architectural choices need
a durable home where contributors and agents can find both the current
direction and the reasons behind it.

These ADRs govern Open Dough internally; they may inform published
guidance but are not imposed on projects using it.

## Decision

1. Record high-level architectural preferences with product-wide impact—what
   general-purpose problem-solving agents and people across tasks need and code
   alone cannot express—as human-controlled Markdown files under `docs/adrs/`.
   Cost of reversal or repeated discussion can justify recording such a choice,
   but does not make a design for one product intent an ADR. When part of an ADR
   is specific to one area and not needed by general problem solvers across
   tasks, keep that extended part in `docs/`, also controlled and changed only
   with human permission.
2. Follow the human advice process and naming conventions in the
   [ADR README](./README.md). Decision makers consult affected and interested
   people, make the decision, and communicate the outcome.
3. Use Proposed, Accepted, Rejected, and Superseded statuses. Humans own status
   decisions; agents may help draft requested proposals and maintain records.
4. Contributors and agents follow relevant Accepted ADRs. Agents cite them
   when relevant and surface conflicts. Deviations require an explicit
   human-owned exception or a superseding ADR.
5. Preserve rejected and superseded decisions as history, maintain the index,
   and keep delivery prioritization separate from architectural acceptance.
   Remove obsolete process instructions from current guidance rather than
   retaining them as explanatory archive; decision records stay.
6. Automated tests document enduring behavior, code documents enduring
   architecture, and configuration documents operational setup. Aside from
   human-controlled ADRs and their human-permitted extensions in `docs/`, any
   other enduring document is rare and requires human permission. (In Open
   Dough, shipped guidance under `Distribution/src/` is product code, not
   documentation.) Unimplemented design or architectural direction may live in a
   North Star topic, which cannot override Accepted ADRs. The topic is a
   temporary decision cache: current code and upcoming stories or requirements
   constrain choices that matter, and unconstrained choices do not depend on
   preserving it. Once implemented, delete the topic completely and leave no
   copy.

## Consequences

- Architectural reasoning remains discoverable as the project grows.
- Humans retain decision authority while agents help preserve continuity.
- Contributors maintain statuses, links, and the index when decisions change.
- Proposed records remain open for discussion without becoming binding guidance.
