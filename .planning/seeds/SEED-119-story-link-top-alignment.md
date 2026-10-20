---
id: SEED-119
status: active
planted: 2026-10-20
---

# Story link reading position

<a id="align-story-top"></a>

### Align linked stories with the top of the visible view

**Identity:** SEED-119#align-story-top
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Confirm the reported story-link scrolling discrepancy and, if reproduced, make a bounded repair so readers start at the top of the destination story.

**Scope:** One planless bug repair, authorized as a quick fix with confirmation before implementation, followed by wrap-up. Preserve navigation, focus, column reveal, and user cancellation. No replanning; implementation has a ten-minute hard limit.

**Known expectations:** Following a link to an offscreen story aligns the story block's top with the top of the usable visible view, below pinned framing. The reported behavior instead places the destination around its middle. Confirm the mismatch with a failing browser regression before changing product code; report an evidenced no-change if it already behaves correctly.

**Uncertainty:** Exact scroll alignment and affected paths need confirmation through existing story-navigation browser journeys.
