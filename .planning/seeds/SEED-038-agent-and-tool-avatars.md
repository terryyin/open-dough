---
id: SEED-038
status: active
planted: 2026-09-25
planted_during: Product backlog capture requested by the maintainer
trigger_when: Improving how the dashboard presents recorded agents and tools
scope: unknown
---

# SEED-038: Recognize agents and tools in the dashboard

## Why This Matters

For a developer scanning Taken work in the Open Dough dashboard, agent names
and host tool names appear as text in each recorded owner summary. Avatars for
both could make those identities easier to spot and distinguish across stories.
This is a lower-priority presentation improvement; the current text remains a
usable way to identify them.

## Alternatives and Decision

Keeping text alone is the simpler choice and already conveys the recorded
facts. Pursue avatars as an optional visual aid because the maintainer wants
agents and tools to be recognizable at a glance. The avatars must represent
identity only: they must not imply that an agent is present, online, or active,
in keeping with the [dashboard visual direction](../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction).

## Story Decomposition

<a id="recognize-agents-and-tools-by-avatar"></a>

### 1. Recognize agents and tools by avatar

**Identity:** SEED-038#recognize-agents-and-tools-by-avatar
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued on 2026-09-25; not refined or planned.

- **For / why:** A developer reviewing Taken work can recognize the recorded
  agent and its host tool quickly while still reading their names.
- **Evaluation:** When a Taken story has a readable agent profile with an agent
  name and host tool, its dashboard presentation shows an avatar for each
  identity alongside the existing labels. Different agents and tools are
  distinguishable. Missing or unreadable profile facts retain the existing
  explicit text; an avatar never invents an owner, tool, or live status.
- **Value / learning:** Test whether visual identities improve scanning when
  several agents or tools appear across Taken stories.
- **Effort hypothesis:** Unestimated; refine asset and identity choices before
  sizing.
- **Depends on:** Existing recorded agent and host tool facts. No new product
  prerequisite is established during capture.
- **Safe stopping point:** The dashboard remains understandable through text,
  and avatars do not suggest agent activity.

## Open Decisions for Refinement

- Where should agent and tool avatars appear, and how should they behave when
  a host tool is not recorded?
- How are agent avatars chosen or supplied, and what visual identities should
  represent Codex, Cursor, and Claude Code?
- How can the visual aid remain accessible and avoid suggesting live presence?

## Ordering and When to Surface

Keep this story near the lower-priority end of the product backlog, after the
currently queued work. Revisit when dashboard identity presentation is being
improved; capture does not authorize implementation.

## Breadcrumbs

- Maintainer request on 2026-09-25 to add avatars for agents and tools.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard owner presentation](../../dashboard/src/TakenOwnerFacts.tsx).
