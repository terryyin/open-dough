---
id: SEED-270
status: active
planted: 2026-11-08
scope: story
---

# Highlight the destination of a story link

<a id="highlight-linked-story-card"></a>

### Highlight the destination of a story link

**Identity:** SEED-270#highlight-linked-story-card
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** When a developer follows a story link in the dashboard or opens a
direct story URL, they can immediately tell which card the link brought into
view, even among several similar cards.

**Examples.**

- A link brings a story card into view. As the card comes into view, it gets
  a brief, noticeable visual cue, such as a soft glow or background pulse.
  The cue works whether the destination card is already selected or not.
- Following a link to the same card again shows the cue again, even when the
  card is already in view. The cue fades back to the card's normal appearance.
  Existing selection, detail opening, scrolling, and keyboard focus follow the
  [dashboard navigation behavior](../../docs/dashboard-navigation.md).
- With reduced motion enabled, the destination gets a brief static highlight.
