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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer who follows a story reference again while the destination card is
already selected, in view, and fading from its first cue sees a fresh cue.
Keep a maintained browser assertion that observes the animation restart under
a controlled page clock and preserves the existing selection and focus checks.

The Intent Coverage probe removed the layout read between removing and
reapplying the cue class. The existing test still passed because the class and
animation name were present, while a separate observation saw the original
animation continue. The strengthened assertion should fail on that fault and
pass on the restored behavior.
[Intent Coverage report](https://github.com/terryyin/open-dough/blob/18c410129ed042b249610097b8a6c34e33663c37/.planning/done/SEED-270_highlight-linked-story-card.json)
