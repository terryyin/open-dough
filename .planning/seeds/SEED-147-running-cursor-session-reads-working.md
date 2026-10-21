---
id: SEED-147
status: active
planted: 2026-10-21
planted_during: A running Cursor execution session stayed Ready for review
trigger_when: A held Cursor screen shows the live stop hint while the dashboard reads Ready for review
scope: small
---

# SEED-147: A running Cursor session reads Working

## Why This Matters

A developer watching a Cursor session needs Working to mean the agent is
still running. Ready for review is the idle follow-up prompt. On the current
Cursor screen the live `ctrl+c to stop` hint sits on the composer line, and a
footer of task, model, path, and branch is painted underneath. The classifier
looks only at the last six non-empty lines, so that hint falls outside the
window, the follow-up arrow is still on screen, and a running session reads
Ready for review and notifies.

## Selected Stories

<a id="running-cursor-session-reads-working"></a>

### 1. A running Cursor session reads Working

**Identity:** SEED-147#running-cursor-session-reads-working
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A held Cursor screen that shows the live `ctrl+c to stop` hint reads
as working, including when that hint is on the composer line and a footer
below it would otherwise hide the hint from the last six non-empty lines.

**Scope:** The held-screen classifier only. An idle follow-up prompt, with no
live stop hint in the current status region, stays the follow-up prompt.
History that merely says Running or Working does not prove work. Question
screens and trust screens stay as they are. Alert rearming stays as it is;
it follows the corrected reading.

**Key examples:** The composer line `→ Add a follow-up` carrying
`ctrl+c to stop`, with a footer of task, model, wrapped path, and branch
below it, is working. The same shape with `→ Plan, search, build anything`
is working. A finished screen whose history mentions Running, and whose
composer line has no live stop hint, stays at the follow-up prompt. A stop
hint already inside the last six non-empty lines stays working.
