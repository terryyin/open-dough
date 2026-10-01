---
id: SEED-079
status: active
planted: 2026-10-02
scope: story
---

# SEED-079: Repair session header controls and avatar preview

<a id="session-header-polish-repair"></a>

### Repair session header controls and avatar preview

**Identity:** SEED-079#session-header-polish-repair
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planless"}
```

**Goal:** Resolve the reported discrepancies in the delivered session panel:
compact restrained SVG controls including Mark as done, a somewhat smaller
agent avatar beside the title and session ID, and an enlarged hover preview
that fits the available space and opens below when above cannot fit.

**For / why:** Developers interacting with an agent can identify the session
and use quiet, accessible controls without an oversized avatar or clipped preview.

**Known expectations:** Accessible labels/tooltips, subtle default button chrome,
quiet hover surface, consistent sizing/spacing, proportionate actual agent avatar
with no human identity. Preserve maximize/restore to the existing left/right
split, Close hiding while the session runs, separate Mark as done semantics,
Command+Escape for Close, and plain Escape for terminal applications.

**Reported actual:** Mark as done is text, buttons look overly prominent, the
avatar takes too much space, and its enlarged hover preview clips at the upper edge.

**Scope and uncertainty:** Only terminal/session panel presentation and avatar
preview placement. Inspect current delivered code and confirm failing regression
proof before repair. The mock supplies styling direction only; its surrounding
UI, top/bottom split and robot placeholder are excluded. Use a ten-minute bounded
planless repair with no replanning, then wrap up directly. Browser coverage and
actual preview geometry require verification rather than assumptions.
