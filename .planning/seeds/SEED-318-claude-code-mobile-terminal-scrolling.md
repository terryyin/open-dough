---
id: SEED-318
status: active
planted: 2026-11-12
planted_during: Terry reported that the Claude Code terminal in the Dashboard cannot be scrolled by touch on iPhone or iPad
trigger_when: Developers select the Claude Code mobile terminal scrolling bug for refinement
scope: story
---

# SEED-318 — Claude Code mobile terminal scrolling

<a id="restore-claude-code-touch-scrolling-on-iphone-and-ipad"></a>

### Restore touch scrolling in the Claude Code terminal on iPhone and iPad

**Identity:** SEED-318#restore-claude-code-touch-scrolling-on-iphone-and-ipad
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reading a live Claude Code session in the Dashboard on an iPhone
or iPad can drag a finger vertically inside the terminal to read earlier
output and return to the latest output.

#### Reported behavior

Dragging vertically inside the Claude Code terminal leaves the output in
place. Terry suspects another gesture handler may be consuming the drag.

#### Acceptance example

On both an iPhone and an iPad, open a live Claude Code terminal with more
output than fits on screen. Drag down to reveal earlier conversation lines,
then drag up to return to the latest lines. The drag scrolls the terminal
output while leaving the Dashboard page position and any typed draft intact.

#### Related work

SEED-316 implemented application-owned touch scrolling in `19442de20` and
verified it with a Chromium touch viewport. Check that change against the
reported behavior on physical iPhone and iPad devices. Use the existing
change if it satisfies the acceptance example and repair any behavior that
still fails.
