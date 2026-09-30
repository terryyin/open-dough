---
id: SEED-060
status: active
planted: 2026-09-30
planted_during: Maintainer request for an alternative agent character collection
trigger_when: A developer wants to use the Odd-e nerds agent names and avatars
scope: story
---

# SEED-060: Odd-e nerds agent collection

## Why This Matters

A developer can choose an alternative set of recognizable agent characters
through configuration while retaining the current collection as the default.

## Story

<a id="odd-e-nerds-agent-collection"></a>

### Select the Odd-e nerds agent names and avatars through configuration

**Identity:** SEED-060#odd-e-nerds-agent-collection
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who wants the Odd-e nerds characters can select
  that collection of agent names and matching avatars through configuration.
- **Evaluation:** With no collection selection configured, agents use the
  current collection. With the alternative collection selected, agents use
  the Odd-e nerds names and matching avatars.
- **Boundary:** Introduce one alternative collection with names and avatars.
  The character roster, avatar sources and appearance, configuration location
  and syntax, and behavior for existing agent assignments need refinement.
  This capture does not select an implementation or create avatar assets.
- **Open wording:** The spoken request described the configuration as having
  "nodes"; confirm whether this means selecting "nerds" before choosing a
  configuration key or value. The intended default and alternative behavior
  above is clear independently of that wording.
- **Depends on:** No queued prerequisite identified.
- **Capture:** Terry requested this new story on 2026-09-30, continuing the
  sequence of top-of-backlog captures on main.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
