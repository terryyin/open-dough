---
id: SEED-385
status: active
planted: 2026-11-16
planted_during: Request to submit a dashboard terminal prompt with Command+Enter and close after confirmation
trigger_when: selected from the product backlog
scope: story
---

# SEED-385 — Submit and close the dashboard terminal

<a id="submit-and-close-the-dashboard-terminal"></a>

### Submit and close the dashboard terminal

**Identity:** SEED-385#submit-and-close-the-dashboard-terminal

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer on macOS can submit a prompt from a focused dashboard terminal
with **Command+Enter** and return to the dashboard once the agent has accepted
the prompt. The submitted work continues after the panel closes.

#### Acceptance examples

- With a prompt ready in a focused, connected terminal, Command+Enter sends
  one ordinary Enter to that session. The panel stays open until a signal from
  that same session confirms acceptance of this submission. Then the panel
  closes and focus returns as it does for the existing Close action.
- If the terminal disconnects or the submission cannot be confirmed, the panel
  stays open and shows that confirmation is unavailable.
- Plain Enter keeps its current behavior. Command+Enter acts on the terminal
  only while its input has focus.

During refinement, verify what signals acceptance on each supported agent host
and that its accepted work continues after panel closure. The current
[terminal lifecycle](../../dashboard/AGENT-LAUNCH-TERMINALS.md#embedded-terminals-and-local-record-actions)
treats closing the attachment differently by host.
