---
id: SEED-296
status: active
planted: 2026-11-10
scope: story
---

# Prove the destination cue restarts on repeated activation

<a id="prove-repeat-destination-cue-restarts"></a>

### Prove the destination cue restarts on repeated activation

**Identity:** SEED-296#prove-repeat-destination-cue-restarts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/579-prove-repeat-destination-cue-restarts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c343060923172185472e546de620b3834b1f5dd2156a6d6a125bd1ec5a333655","plan":"cf0c6724ac25e60a89ad3ac6c18e2565f46edd90be29012cb307a5e838ccb465"}}
```

**Goal:** Maintainers can detect a regression that leaves the destination cue
fading from its first activation when a developer follows the same story
reference again. The maintained browser proof observes a fresh animation on the
already selected, in-view card, protecting the developer's arrival signal.

**Scope:** Strengthen the existing repeated dependency-reference journey with a
deterministic assertion of the animation restarting from its beginning. Control
page time for cue lifetime and arrange a known fading animation state without
wall-clock waits. Preserve the journey's selection, inspection, focus, scrolling,
and cue-ending checks. Demonstrate that the strengthened assertion fails when
the layout read between removing and reapplying the cue class is removed, and
passes with the current behavior restored.

This increment adds regression proof. Changes to cue styling, duration,
navigation behavior, or new motion preferences are outside its delivery scope;
existing normal-motion and reduced-motion checks retain their promises.

**Key examples:**

- An unselected supplier card is reached through its dependency reference → the
  card is inspected, focused, brought into view, and cued without becoming
  selected; the cue ends without changing selection.
- The supplier is selected, inspected, and in view, with its first cue partway
  through fading → the developer activates the same reference again → a fresh
  cue starts at full opacity with animation progress reset, while selection,
  inspection, and focus remain intact. Advancing controlled page time ends the
  repeated cue and leaves the selection intact.
- The layout read that makes a repeated cue restart is removed in a disposable
  fault → the maintained restart assertion fails even though the cue class and
  animation name remain present → restoring that read makes the journey pass.

**Evidence:** The Intent Coverage probe removed the layout read between
removing and reapplying the cue class. The existing test still passed because
the class and animation name were present, while a separate observation saw
the original animation continue.
[Intent Coverage report](https://github.com/terryyin/open-dough/blob/18c410129ed042b249610097b8a6c34e33663c37/.planning/done/SEED-270_highlight-linked-story-card.json)
