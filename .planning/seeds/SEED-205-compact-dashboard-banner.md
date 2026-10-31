---
id: SEED-205
status: active
planted: 2026-10-31
planted_during: Terry's request to capture dashboard banner improvements at the top of the backlog
trigger_when: The dashboard banner shows a separate product mark, sessions toggle, and project title
scope: one story for a compact single-line dashboard banner
---

# SEED-205: Keep the dashboard banner compact

## Why This Matters

The dashboard banner currently shows the Open Dough mark as a passive image,
a separate sessions sidebar toggle beside it, and the selected project's name
as a heading even though the project selector already shows it. Terry asked
to make the mark itself the sidebar toggle and drop the repeated project
title, so the banner fits on one line on every screen. In the same pass he
asked to pack two further small improvements: Development and Intent
perspective choices should show expressive SVG marks that read as those
meanings in this product, and a successful Start session should stop saying
"Ad hoc session started" in the project actions row (that success line has
already cost phone layout). Queue this story first.

## Alternatives and Decision

Compared against the same goal: a compact, readable banner and quiet
successful ad-hoc start, without losing Sessions control, perspective meaning,
or failure feedback.

- **Keep the separate panel toggle and text-only perspectives; only drop the
  heading.** Simplest existing path. Frees some width but still spends a
  control on a second Sessions affordance and leaves Development/Intent as
  bare words with no product-shaped cue. Rejected: misses Terry's mark-as-
  toggle and perspective-mark requests.
- **Brand mark as navigation drawer (borrowed).** Many apps let the top-left
  brand or workspace mark open the left nav. Maps cleanly here: the Open Dough
  mark → Sessions sidebar toggle, with the same name, ⌘B, expanded state,
  attention count, and background effect the panel button already has. Limit:
  elsewhere the mark often also means "home"; this product has no home
  destination for the mark, so the toggle can own it. Views without a sidebar
  (unconfigured project banner, System settings) keep a passive mark so the
  control never appears to do nothing.
- **Mode pictograms (borrowed).** Camera modes and IDE perspective switchers
  use glyphs so a mode is recognizable before its label is read. Maps to
  Development and Intent as perspective marks. Limit: first recognition is
  not free; the glyphs must encode *this* product's meanings (ongoing story
  work vs Purpose beside Proof), stay distinct from each other, and keep the
  existing accessible names. Stock Lucide metaphors (generic code brackets,
  target, layers) are a weaker candidate: faster to ship, less obvious for
  Open Dough's Development/Intent pair.
- **Recommended:** adopt the brand-as-nav mapping for the mark, ship two
  custom SVG perspective marks whose metaphors match the project's
  Development and Intent accounts, drop the duplicate project heading, and
  remove the successful ad-hoc start announcement (and its empty layout
  slot) while leaving startup progress and launch problem answers as they
  are. Structure remains deferred; its metaphor may be noted only as a
  deferred design cue, not an offered control or shipped asset.

## Selected Stories

<a id="logo-sidebar-toggle"></a>

### Use the Open Dough mark as the sidebar toggle and drop the repeated project title

**Identity:** SEED-205#logo-sidebar-toggle
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/430-logo-sidebar-toggle/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b11e0e06687b9f80d76898e3ef70e6de244357e1f205a04142fc61ffd19db478","plan":"2b9a2ae11f79fa0a04e5899f38044c75c8b4527b9054b1cb8daef03bbc05248a"}}
```

**Beneficiary:** A developer using the dashboard on any screen width.

**Goal:** The dashboard banner fits on one line on desktop and phone widths,
with no duplicated project name and no separate sidebar toggle beside the
product mark; Development and Intent are recognizable at a glance from
expressive marks; a successful ad-hoc Start session does not spend action-row
space on a success message.

**Scope:**

- The Open Dough mark at the start of the dashboard banner becomes the
  sessions sidebar toggle, replacing the separate panel icon button. It keeps
  the toggle's accessible name, keyboard shortcut (⌘B), expanded state,
  attention count, and the current background effect of the toggle.
- The banner no longer shows the selected project's title heading; the
  project selector remains the place that names the selected project.
- Views that show the mark without a sidebar (the banner shown while no
  project is configured, System settings) keep the mark consistent with the
  dashboard without offering a toggle that does nothing.
- The Development and Intent perspective choices each show a custom SVG mark
  that expresses that perspective's meaning in this product (see UI). Visible
  labels stay with the marks so the pair remains nameable while it is still
  new. Accessible names remain "Development" and "Intent". Structure is not
  offered and no Structure mark is shipped.
- After Start session successfully starts an ad-hoc session, the project
  actions row no longer shows "Ad hoc session started" and reserves no empty
  slot for that success line. Startup progress ("Starting a session…") and
  launch problem answers beside the button stay as they are.

**Deferred promises:**

- Offering a Structure perspective choice or shipping a Structure mark.
- Replacing perspective text labels with icon-only choices on narrow widths.
- Changing how Recently done or the Sessions sidebar name a started ad-hoc
  session (those surfaces may still say the session started).

**Key examples:**

- On a phone-width screen with a long project name selected, the banner shows
  the mark-as-toggle, perspective selector (with Development and Intent marks
  and labels), project selector, and settings gear on one line with no
  horizontal page scroll and no separate panel toggle or project title
  heading.
- Clicking or tapping the mark, or pressing ⌘B, opens and closes the sessions
  sidebar; the mark shows the same background effect the old toggle showed.
- Sessions that need attention still show their count on the toggle.
- Choosing Intent then Development still switches perspectives; each choice
  shows its mark, and the marks are visually distinct enough that the two
  perspectives are not confused for each other at a glance.
- Starting an ad-hoc session that succeeds opens the terminal as today and
  leaves no "Ad hoc session started" (or empty success log) in the project
  actions row; a launch that fails or may not have started still shows its
  problem answer beside Start session.

**UI:**

Perspective marks (custom SVG, same stroke weight language as other frame
icons):

- **Development** — ongoing shaping of the product through stories and
  sessions: a small board of two or three story-card shapes in progress (not
  a generic code bracket or hammer). Reads as work in flight on the board
  the developer already uses.
- **Intent** — maintained Purpose beside observed Proof: a short document
  shape paired with a clear verification mark (not a lone target or eye).
  Reads as "what it should do" with evidence, matching Intent's Purpose/Proof
  account.
- **Structure** (design cue only, not shipped) — nested or connected boxes for
  implementation organization. Recorded so a later Structure story can reuse
  the metaphor without inventing a third unrelated glyph language.

The mark-as-toggle keeps the Sessions tooltip and ⌘B hint the panel button
already shows, so the former passive image is discoverable as a control.
