---
id: SEED-410
status: active
planted: 2026-11-19
planted_during: Developer note on SEED-385 review changes — remove redundant dashboard-navigation.md
trigger_when: accepted for planless execution from the contextual fix instruction
scope: one story
---

# SEED-410 — Remove redundant dashboard navigation doc

<a id="remove-redundant-dashboard-navigation-doc"></a>

### Remove redundant dashboard navigation doc

**Identity:** SEED-410#remove-redundant-dashboard-navigation-doc

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Maintainers no longer keep a `docs/dashboard-navigation.md` that
restates dashboard behavior already expressed in product code and tests.

**Scope:**

- Delete `docs/dashboard-navigation.md`.
- Remove or simplify inbound references so nothing links to the deleted file;
  leave referencing documents otherwise out of scope beyond that cleanup.
- Update any test fixture that assumes the file still exists on main.

**Expectations:** The deleted guidance is redundant with implemented dashboard
behavior and tests; no unique product requirement is retired with the file.
Child docs that were “part of” that guidance keep their substance and point at
the UX/UI North Star (or stand alone) instead of the removed parent.
