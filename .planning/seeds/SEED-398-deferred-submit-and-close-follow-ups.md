---
id: SEED-398
status: active
planted: 2026-11-18
planted_during: Wrap-up of SEED-385#submit-and-close-the-dashboard-terminal deferred promises
trigger_when: selected from the product backlog
scope: story
---

# SEED-398 — Deferred submit-and-close follow-ups

Retained from SEED-385#submit-and-close-the-dashboard-terminal after Command+Enter
submit-and-close on a ready focused terminal shipped.

<a id="deferred-submit-and-close-follow-ups"></a>

### Deferred submit-and-close follow-ups

**Identity:** SEED-398#deferred-submit-and-close-follow-ups

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can discover and use submit-and-close without relying only on the
Command+Enter chord while terminal input is focused, and can choose whether
closing waits for leave-ready or happens immediately after Enter.

#### Scope

Deferred from SEED-385#submit-and-close-the-dashboard-terminal:

- A visible Submit-and-close control in the Side panel terminal.
- Binding the same submit-and-close gesture outside terminal-input focus.
- Treating "send Enter and Close immediately" as the primary path (instead of
  wait-for-leave-ready then Close).

#### Notes

Command+Enter while focused on a ready terminal already submits one Enter,
rereads sessions, and closes after leave-ready, with confirmation-unavailable
feedback when confirmation never arrives. These items remain for discoverability
and an alternate close timing.
