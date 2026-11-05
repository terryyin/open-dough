---
id: SEED-237
status: active
planted: 2026-11-05
planted_during: Terry Yin's request for a Paste button on the dashboard's mobile keyboard
trigger_when: A developer wants to paste from their device into a dashboard session on mobile
scope: story
---

# SEED-237 — Paste from the mobile keyboard

<a id="paste-from-the-mobile-keyboard"></a>

### Paste from the mobile keyboard

**Identity:** SEED-237#paste-from-the-mobile-keyboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer using the dashboard on a phone can tap **Paste** on the virtual
keyboard below the session to paste the device's current clipboard contents
into that session. Preserve the content type wherever the receiving tool
supports it.

- Copy text on the phone and tap **Paste**. The text reaches the current
  session.
- Copy an image on the phone and tap **Paste** in a session whose tool
  supports image paste, such as Clocko. The tool receives a usable image.
