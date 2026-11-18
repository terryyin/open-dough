---
id: SEED-384
status: active
planted: 2026-11-16
planted_during: Request to simplify Review changes and remember the file sidebar width
trigger_when: selected from the product backlog
scope: story
---

# SEED-384 — Keep Review changes focused on the diff

<a id="keep-review-toolbar-truthful-while-reading"></a>

### Keep the Review changes toolbar truthful while it reads

**Identity:** SEED-384#keep-review-toolbar-truthful-while-reading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/702-keep-review-toolbar-truthful-while-reading/PLAN.md"}
```

Correction from the execution retrospective of Keep Review changes focused
on the diff (`a53f0d5dff97:.planning/seeds/SEED-384-keep-review-changes-focused-on-the-diff.md`);
its [plan](../slice-plans/702-keep-review-toolbar-truthful-while-reading/PLAN.md)
holds the findings, provenance and proof.

#### Goal

A developer opening **Review changes** for a completed story, a published
completion or an ad hoc session's landing never sees the toolbar name a
comparison that is not shown or an eye that reveals nothing, and on a short
touch screen the revealed details and status leave the diff its room.

#### Scope

- Before the review's first answer, and when it cannot be read, the toolbar
  names no comparison it cannot yet show, and the eye is offered only when the
  details hold something.
- On touch input, the revealed details and the review's status share the one
  height budget the status had before the details existed.
- The two-run landed opening is proved collapsed at the layer that owns it,
  and the end-to-end runs journey keeps only what needs real launches.
