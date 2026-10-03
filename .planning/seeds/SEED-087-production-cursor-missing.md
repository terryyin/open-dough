---
id: SEED-087
status: active
planted: 2026-10-03
planted_during: Production Cursor startup discrepancy
trigger_when: Cursor is missing from production session startup
scope: bounded repair
---

# Production Cursor startup discrepancy

<a id="production-cursor-missing"></a>

### Restore Cursor in production session startup

**Identity:** SEED-087#production-cursor-missing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Make Cursor available in the production dashboard's session-start host picker.

**Expected:** Production offers Cursor alongside Claude Code and Codex.

**Actual:** Terry reports Cursor still missing from production, although release 0.3.55 includes its launch support.

**Scope:** Diagnose the served revision and production watcher; restore the existing released behavior. Any code repair requires confirmed reproduction and related verification within a ten-minute bounded attempt. Changing production to follow main remains the separate SEED-086 story.

**Uncertainty:** The production revision, watcher state, and reason for the missing option are not yet observed.
