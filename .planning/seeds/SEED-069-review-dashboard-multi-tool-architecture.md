---
id: SEED-069
status: active
planted: 2026-10-01
planted_during: Terry's request to review dashboard architecture before expanding AI IDE support
trigger_when: Codex dashboard support is mostly implemented, before adding Cursor or further tools
scope: story
---

# SEED-069: Review dashboard architecture for multiple AI IDE tools

## Why This Matters

Developers should be able to use their preferred AI IDE tool from the dashboard
without each new integration making the shared workflows harder to maintain.
With Claude Code available and Codex support mostly implemented, there is enough
implementation experience to review the architecture again before adding Cursor
and further tools.

## Story

<a id="review-dashboard-multi-tool-architecture"></a>

### Review dashboard architecture before adding more AI IDE tools

**Identity:** SEED-069#review-dashboard-multi-tool-architecture
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** The dashboard maintainer can expand AI IDE support with clear
  shared responsibilities and tool-specific boundaries, preserving the developer's
  established workflow and session experience.
- **Goal:** Review the architecture using the implemented Claude Code and Codex
  integrations, identify places to improve, and establish which improvements
  should precede Cursor or subsequent integrations.
- **Evaluation:** Produce a review grounded in current code and behavior that
  explains shared versus tool-specific responsibilities, identifies concrete
  duplication or coupling with its consequences, and recommends prioritized
  improvements or an evidence-backed decision to retain the current design.
  The maintainer can decide what to address before tool expansion.
- **Scope:** Review dashboard launch and preparation handoff, workspace context,
  conversation identity and persistence, native session observation and lifecycle,
  continuation and terminal interaction, and failure/retry recovery. Assess how
  another tool would fit those boundaries without assuming identical native
  capabilities or adding abstractions solely for hypothetical tools.
- **Key examples:** Trace an established workflow through Claude Code and Codex
  to explain what is shared and why native behavior differs. Assess where adding
  Cursor would duplicate orchestration or require changes outside its native
  integration, and cite the responsible code. For each concern, state its impact
  and a bounded improvement; distinguish confirmed findings from questions that
  require independent Cursor evidence.
- **Timing and ordering:** Start once Codex support is mostly implemented, using
  the then-current implementation and recording any unfinished Codex behavior
  that limits the review. This story is first in the queued backlog, ahead of
  Cursor support; it does not interrupt the currently Taken Codex work.
- **Boundary:** This story captures an architecture review and recommendations.
  Implementing improvements and adding Cursor remain separately selected work.
  Consult current Accepted ADRs during the review; architectural decisions and
  exceptions remain human-owned.
- **Effort hypothesis:** Unestimated; refine the review's extent against the
  implemented Codex support before planning.

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: review the architecture once Codex
  support is mostly implemented, find improvements before adding tools such as
  Cursor, and put the review at the top of the product backlog.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Codex dashboard support](SEED-052-start-agent-work-from-dashboard.md#use-codex-from-dashboard).
- [Cursor dashboard support](SEED-052-start-agent-work-from-dashboard.md#use-cursor-from-dashboard).
- [Dashboard behavior](../../dashboard/README.md).
- [ADR catalog](../../docs/adrs/README.md).
