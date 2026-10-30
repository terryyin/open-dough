---
id: SEED-189
status: active
planted: 2026-10-30
scope: reveal omitted unchanged lines in dashboard review diffs
---

# SEED-189: Expand dashboard diff context

<a id="expand-dashboard-diff-context"></a>

### Load more diff context from the line-number gutter

**Identity:** SEED-189#expand-dashboard-diff-context
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/416-expand-dashboard-diff-context/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"140adf33e6a37c5a1bff083c2a826b384576b6a12595d0eaec7cb9c40810ca66","plan":"3297850b905191efcb918be0764b6e941e6cc5ae8fbb5b11bd920b886b6e883d"}}
```

**Beneficiary:** A developer reviewing a story's changed files in the
dashboard Side panel story review.

**Goal:** Read the unchanged code surrounding a change without leaving the
review, using directional load-more controls in the line-number gutter like
the GitHub diff controls in the source screenshot.

**Scope:**

- Required behavior: Where unchanged lines are omitted before, between, or
  after diff hunks, show directional gutter controls. Each activation reveals
  **20** more preceding or following context lines at that boundary from the
  same file revisions as the comparison (`baseline`/`from` and `tree`, with
  rename `oldPath` when present). Repeated activation continues until that
  gap is exhausted. Overlapping expansions show each context line once. Old
  and new line numbers, change markers, and code order stay correct.
  Insertions above the reading position keep the current place usable.
  Controls work with pointer, keyboard, and touch. When additional context
  cannot be read, the existing diff stays readable and the failure is visible
  with a way to retry.
- Scope limits: Do not change the initial hunk context Git already prints;
  do not add a one-click “load entire remaining gap” or “load whole file”
  action; do not match GitHub styling beyond the directional gutter
  interaction; do not add side-by-side diffs, word-level diffs, or persist
  expansion state across files or sessions.
- Deferred promises: Whole-gap or whole-file expand in one action; different
  chunk sizes; changing default `-U` for the first paint.
- Boundary assumptions: The review already admits one file under a concrete
  `baseline`/`from` and `tree` (and optional `oldPath`). Omitted ranges are
  filled from those revisions’ file text, not by inventing a larger printed
  unified diff as the product model.

**Key examples / evaluation:**

- A hunk starts at line 54 with earlier unchanged lines omitted: an upward
  gutter control reveals the 20 preceding lines immediately above it (or
  fewer when fewer remain).
- Two hunks end at line 61 and start at line 124: a downward control after
  the first hunk and an upward control before the second each reveal 20
  lines from their end of the omitted gap. Repeated expansion eventually
  closes the gap without duplicate lines; when fewer than 20 remain, only
  those lines appear and that control becomes unavailable.
- Unchanged lines remain after the final hunk: its downward gutter control
  reveals following lines in the same 20-line steps. No expansion is offered
  beyond the beginning or end of the file.
- The comparison contains additions or removals: expanding unchanged context
  preserves old/new numbering and existing added/removed styling.
- The developer has scrolled so a hunk is mid-viewport, then expands upward
  above that hunk: the previously focused lines stay in view (reading
  position remains usable).
- Context for a gap cannot be read: the printed diff remains as before; the
  failure is visible at that control with a way to retry.

**Architecture:**

- Relevant Accepted decision:
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  story review is Side panel content; the dashboard observes Git and keeps
  derived display rebuildable; viewport and similar presentation state are
  disposable.
- Direction: Keep the existing printed unified diff as the first paint.
  Expose revision-consistent file text for the same admitted comparison
  identity the file diff already uses, and let the Side panel splice
  unchanged lines into omitted gaps. Expansion windows are presentation
  state in that panel, not durable project state. Do not treat a larger
  `git diff -U…` reprint as the expansion model: it cannot give independent
  directional control per gap while preserving reading position cleanly.
- No conflict with Accepted ADRs. ADR 0007 / 0009 remain Proposed and do not
  bind this story.

**Plan:** [Plan 416](../slice-plans/416-expand-dashboard-diff-context/PLAN.md).

**Priority and authority:** Queue first at Terry's request. This request adds
and publishes the story; implementation awaits a later execution instruction.

**Source:** Terry's 2026-10-30 request and attached GitHub diff screenshot,
showing directional expansion buttons in the line-number gutter.

**Refinement notes (explore / borrow / clarify / UX / architecture):**

- Compared options against the same goal: (1) only raise default `-U` —
  simpler, but no load-more interaction; (2) re-fetch a larger printed
  unified diff per expand — reuses today’s `printed` shape, but couples gaps
  and fights scroll preservation; (3) **recommended** — read file text at the
  comparison trees and splice 20-line windows at each omitted boundary.
- Borrowed mechanism: GitHub PR unified-diff gutter expanders (~20 lines per
  activation from the compared file). Mapped: omitted gap → fold region;
  up/down controls → near-boundary windows; comparison trees → file text.
  Analogy limit: GitHub’s whole-file / chrome and dual-pane behavior are out
  of scope; an analogy is not proof the splice works until execution checks it.
- User: developer in Side panel story review, reading around a change without
  leaving the panel. Interaction choice with system consequence: splice from
  revision file text (not reprint a larger diff) so each gap expands
  independently and reading position stays usable, while the system must
  serve that file text under the same admission as today’s file diff.
