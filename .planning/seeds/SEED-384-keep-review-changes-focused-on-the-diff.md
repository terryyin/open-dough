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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/702-keep-review-toolbar-truthful-while-reading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d690dae7ee982a9812db67420439347b4aceb385630d0f9f42d1d5d9086daa73","plan":"31fd6811b14b8fe1b7f478b89c992610e5e3dc67ac217af0d63850794cf3af7f"}}
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

#### Key examples

- A developer opens a Done story while its first read is pending. They see
  the reading status, with no comparison name or details button. A published
  answer brings **Published completion** and its eye. If the first read fails,
  the problem stays visible and Refresh can try again. During a refresh that
  still shows a previous answer, its name and details remain available.
- A Done story opens on the newer of two captured runs. The developer can
  read its diff before opening the details. Choosing the older run shows its
  facts and diff, Refresh keeps that choice, and Escape from the picker
  returns focus to the eye.
- On a short landscape touch screen, the developer reveals workspace details
  while a status is present. They can reach both within the existing height
  budget and still read the selected file's diff.
