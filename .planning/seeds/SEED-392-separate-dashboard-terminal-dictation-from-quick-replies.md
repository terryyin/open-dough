---
id: SEED-392
status: active
planted: 2026-11-17
planted_during: Request for a standalone dashboard terminal dictation button and more quick replies
trigger_when: selected from the product backlog
scope: story
---

# SEED-392 — Separate dashboard terminal dictation from quick replies

<a id="separate-dashboard-terminal-dictation-from-quick-replies"></a>

### Separate dashboard terminal dictation from quick replies

**Identity:** SEED-392#separate-dashboard-terminal-dictation-from-quick-replies

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer using the dashboard terminal can start dictation directly with a
microphone icon button and choose from more quick replies in the **Prompts**
menu.

#### Acceptance examples

- On desktop and mobile, the terminal header has a standalone microphone icon
  button with an accessible name. It starts dictation directly and becomes a
  stop control while recording. **Prompts** remains separately available.
- **Prompts** offers only quick replies. It keeps `OK` and `as recommended` and
  adds `Try again`, `Resume`, and `Please explain`.
- Choosing a reply inserts that phrase into the current terminal, preserves
  existing input, and returns focus to the terminal so the developer can edit
  the text or submit it with Enter. Dictation continues to use the existing
  transcript insertion and recovery behavior.

See the [current terminal input behavior](../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md)
for prompt insertion and dictation recovery.
