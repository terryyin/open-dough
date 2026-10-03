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

**Observed resolution (2026-10-03):** The process listening on 127.0.0.1:4173 runs release v0.3.55, started at 08:34:33 SGT. Both localhost:4173 and 127.0.0.1:4173 serve index-CIxKVklK.js. A fresh browser page at 127.0.0.1:4173 offers Claude Code, Codex, and Cursor in Start session. Selecting Cursor updates the dialog to Cursor and loads its native model catalog. No session was launched. No application edit or server restart was required. The originally reported page's loaded revision is unknown; a fresh production view was opened for Terry. Continuous deployment from main stays in SEED-086.
