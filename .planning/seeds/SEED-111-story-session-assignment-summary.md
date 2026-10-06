---
id: SEED-111
status: active
planted: 2026-10-06
scope: story
---

# Story session assignment summary

<a id="story-session-assignment-summary"></a>

### Story sessions avoid repeating the card's assignment header

**Identity:** SEED-111#story-session-assignment-summary
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Simplify a story card's session information so the assignment already
shown in its header is not repeated in the session entry.

**Scope:** Investigate and reproduce the supplied dashboard screenshot, then
attempt one bounded planless repair through dough-bug-fixing with no replanning
and a ten-minute implementation limit. Preserve useful session-specific facts
and attribution that differs from the card's current assignment. Preserve
session reports and actions.

**Expected versus observed:** The supplied Preparing story card shows its
agent, credited human, tool, and model in the header, then repeats that same
tuple under Session assignment in its refinement session entry. The expected
card presents that assignment once while keeping distinct session information
available.

**Key examples:**

- A session with the same assignment as its story header omits the duplicate
  assignment line while retaining its report, workspace, and session actions.
- A session whose attribution differs from the current story header still
  exposes its own attribution.
- Session views outside a story card retain their necessary attribution.

**Remaining uncertainty:** Locate the shared session presentation and existing
browser journey, establish how the story header and saved session attribution
are compared, and confirm the bounded repair at that observable boundary.
