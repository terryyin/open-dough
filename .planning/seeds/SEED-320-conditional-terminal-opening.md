---
id: SEED-320
status: active
planted: 2026-11-12
planted_during: Terry requested background launches when an ad hoc session or follow-up has a custom instruction
trigger_when: Developers select conditional terminal opening for refinement
scope: story
---

# SEED-320 — Conditional terminal opening for Dashboard sessions

<a id="open-terminal-only-without-a-custom-instruction"></a>

### Open the terminal only when no custom instruction is supplied

**Identity:** SEED-320#open-terminal-only-without-a-custom-instruction
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer starting an ad hoc session or a follow-up in the Dashboard can
submit an instruction and keep working in the current view while it runs.
Leaving the instruction field blank opens the terminal when the session starts
so the developer can interact with it immediately.

#### Acceptance examples

For sessions that offer a Dashboard terminal, exercise both **Start session**
from a project and **Follow up** from Recently done.

- With a blank or whitespace-only instruction field, the terminal panel opens
  automatically once the session starts. A follow-up still receives its
  recorded context when the instruction field is blank.
- With a custom instruction, the session starts and processes it in the
  background. The Dashboard keeps the current view, including any panel already
  open. The developer can open the new session's terminal from its session
  entry.
