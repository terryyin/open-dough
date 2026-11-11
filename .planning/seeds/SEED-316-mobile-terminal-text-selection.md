---
id: SEED-316
status: active
planted: 2026-11-11
planted_during: Terry reported that Dashboard terminal text cannot be selected on mobile
trigger_when: Developers select mobile terminal text selection for refinement
scope: story
---

# SEED-316 — Mobile terminal text selection

<a id="select-and-copy-terminal-text-on-mobile"></a>

### Select and copy text in the Dashboard terminal on mobile

**Identity:** SEED-316#select-and-copy-terminal-text-on-mobile

#### Goal

Developers using the Dashboard on a mobile device can select a portion of
terminal output, copy it to the device clipboard, and paste it elsewhere.

#### Reported behavior

Terry reported that dragging vertically in the mobile terminal scrolls its output
and that he could not select the text. How scrolling and selection interact
needs to be confirmed during refinement.

#### Key examples to refine

- On a phone, select part of the terminal output with touch, copy it, and paste
  it into another text field. The pasted text matches the selected range.
- A vertical swipe still scrolls the terminal during ordinary browsing. After
  copying, the developer can resume scrolling through the output.
