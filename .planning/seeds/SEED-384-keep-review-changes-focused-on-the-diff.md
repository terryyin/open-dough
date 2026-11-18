---
id: SEED-384
status: active
planted: 2026-11-16
planted_during: Request to simplify Review changes and remember the file sidebar width
trigger_when: selected from the product backlog
scope: story
---

# SEED-384 — Keep Review changes focused on the diff

**Temporary design reference.** Keep the [interactive Review changes mockup](../mockups/review-changes.html)
while the stories below build on the Review changes toolbar, so reviewers can
compare the compact and revealed layouts and try the sidebar interactions. It
shows Landed runs and Published completion. Remove it during the wrap-up of
whichever of these stories is delivered last, after the delivered UI is
verified.

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

<a id="resize-and-remember-the-review-file-sidebar"></a>

### Resize and remember the Review changes file sidebar

**Identity:** SEED-384#resize-and-remember-the-review-file-sidebar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

Split from Keep Review changes focused on the diff
during refinement, to be delivered after it.

#### Goal

A developer reviewing changes gives the file sidebar enough room for the paths
they need to read, once, and finds that width again in every later review in
the same browser.

#### Scope

Required behavior:

- A divider between the file sidebar and the diff, shown while both sit side
  by side. Dragging it changes their widths. It takes keyboard focus, and Left
  and Right move it in the arrow's direction; it says the sidebar's current
  width and bounds as the dashboard's other resize dividers do.
- Both panes stay usable: neither becomes narrower than its usable minimum,
  whatever is dragged or preferred.
- One preferred width serves every review, for any story or session, across
  closing and reopening and a page reload, kept as a disposable preference in
  this browser like the side panel's width
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  optional browser storage is disposable). Until the reviewer chooses, or
  where the browser keeps none or an unusable one, the sidebar takes today's
  default width.
- A limit the room sets never changes the preference: a narrower panel shows
  the sidebar as wide as the diff's minimum allows, and more room recovers the
  preferred width. Where the panel is too narrow for both panes side by side,
  files sit above the diff as today and no width divider is offered.
- Hiding and showing the sidebar restores it at the preferred width.

Scope limits:

- A height divider for the narrow, stacked layout.
- Intent's locations column keeps its own width.
- Sharing the preference across browsers or machines.

#### Key examples

- **Drag.** Review open side by side at the default width, long paths cut off
  → drag the divider right → the sidebar widens and the diff narrows by the
  same amount → close the review, open another story's review → the sidebar
  has the dragged width.
- **Reload.** After that choice → reload the page and open **Review changes**
  → the same width.
- **Keyboard.** Focus the divider → Right → the sidebar is one step wider and
  the divider says the new width; Left returns it.
- **Bounds.** Drag far right → the sidebar stops where the diff reaches its
  minimum; drag far left → the sidebar stops at its own minimum.
- **Temporary limit.** A wide preferred width, then the side panel is narrowed
  until the room cannot give it → the sidebar is narrower, both panes usable →
  the panel is widened again → the preferred width returns, without the
  reviewer choosing again.
- **Narrow panel.** The review body is too narrow for both panes → files sit
  above the diff and there is no width divider → widened, the divider returns
  with the preferred width.
- **No choice yet.** A browser that keeps no preference → the sidebar has
  today's default width.

#### Architecture

Reuse the dashboard's one resize mechanism: the shared resize divider, the
shared room calculation, and kept browser preferences that the side panel and
Sessions sidebar already use. The divider gains the case of an area on its
leading side, where Right grows the area. No server state.
