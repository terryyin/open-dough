---
id: SEED-316
status: active
planted: 2026-11-11
planted_during: Terry reported that Dashboard terminal text cannot be selected on mobile
trigger_when: Developers select mobile terminal text selection for refinement
scope: story
---

# SEED-316 — Mobile terminal text selection

<a id="prove-swipe-under-button-event-tracking"></a>

### Prove the phone swipe under button-event pointer tracking

**Identity:** SEED-316#prove-swipe-under-button-event-tracking
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/596-prove-swipe-under-button-event-tracking/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2cfe45b17aa1aac450442e0727cfc99ea1b48f47d0f551ee4347690942b60e3b","plan":"47fb445d24482d424836dba691751618ebe1b7e8f1bb44b1b05fd703c3e6c163"}}
```

#### Goal

A maintainer who changes how a one-finger swipe decides between the terminal's
scrollback and the session's application is told by a maintained test when the
swipe stops scrolling an application that asks for button-event or drag pointer
tracking, as tmux and vim do. Today only any-motion tracking, which Claude Code
reports, is protected.

#### Scope

- Maintained proof that a one-finger swipe gives wheel input to an application
  on the alternate screen under each pointer tracking that includes the wheel:
  xterm `vt200` (`?1000h`), `drag` (`?1002h`) and `any` (`?1003h`).
- No product behavior changes. The swipe already works under all three.
- Adds no promise about a product intent.

Plan: [Prove the phone swipe under button-event pointer tracking](../slice-plans/596-prove-swipe-under-button-event-tracking/PLAN.md)
