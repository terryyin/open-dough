---
id: SEED-298
status: active
planted: 2026-11-10
scope: story
---

# Insert common prompts in the dashboard terminal

<a id="insert-common-prompts-in-the-dashboard-terminal"></a>

### Insert common prompts in the dashboard terminal

**Identity:** SEED-298#insert-common-prompts-in-the-dashboard-terminal
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer replying to an agent can open the **Prompts** menu in the terminal
header on desktop and mobile. The menu takes the existing dictation button's
place among the session actions. It offers `OK`, `as recommended`, and
**Dictate into terminal**.

- Selecting either preset closes the menu and inserts the text into the active
  terminal input. The developer can edit it and press Enter when ready to send.
- Selecting **Dictate into terminal** closes the menu and starts dictation.
  While recording, **Stop recording** replaces the **Prompts** button in the
  same slot. When recording ends, the **Prompts** button returns and the
  [existing dictation flow](../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md#dictation)
  handles the transcript.
