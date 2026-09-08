# 0000 — Use Architectural Decision Records (ADRs)

**Status:** Accepted

**Date:** 2026-09-06

**Decision makers:** Terry Yin

## Context

Open Dough is a new project defining a shared software development lifecycle
and its integrations with AI development tools. Its architectural choices need
a durable home where contributors and agents can find both the current
direction and the reasons behind it.

The project owner has chosen to adopt ADRs using the advice process followed
in Doughnut. Delivery plans serve a different purpose from lasting decisions.

## Decision

1. Record cross-cutting, hard-to-reverse, or frequently revisited architectural
   choices as numbered Markdown files under `docs/adrs/`.
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

## Consequences

- Architectural reasoning remains discoverable as the project grows.
- Humans retain decision authority while agents help preserve continuity.
- Contributors maintain statuses, links, and the index when decisions change.
- Proposed records remain open for discussion without becoming binding guidance.

## Related

- [ADR playbook and index](./README.md)
