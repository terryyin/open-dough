---
id: SEED-373
status: active
planted: 2026-11-15
trigger_when: selected from the product backlog
scope: story
---

# SEED-373 — Swipe between story board columns on mobile

<a id="swipe-between-story-board-columns"></a>

### Swipe between story board columns on mobile

**Identity:** SEED-373#swipe-between-story-board-columns
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/640-swipe-between-story-board-columns/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0f0b0bde5348bbfb0d981f1346be22ae71085636a7f51ac1559e2652f9d8ade0","plan":"4a96593a80ae8026636a069f038c27751ac0a82f4ac7d4a530d84a370c94d182"}}
```

#### Goal

A developer using the dashboard on a phone can swipe horizontally across the
story board in Development to move between the Backlog, Taken, and Recently done
columns, leaving more room for reading stories instead of wide navigation buttons.

#### Scope

- A deliberate horizontal finger swipe across the Board moves the view one
  column: left toward Recently done, right toward Backlog. It stops at the first
  and last columns rather than wrapping or exposing empty space.
- On mobile, the left/right controls become much, much thinner, taking markedly
  less horizontal room than today's 44px per side. Their main purpose is to
  indicate hidden columns; they still work when tapped and from the keyboard.
  Keep direction apparent and destination names available to assistive technology.
- Preserve vertical Board reading, ordinary card taps/actions, story selection
  and open detail, and navigation that reveals focused work. A swipe must not
  accidentally activate the card or action under the finger. An unfinished or
  cancelled gesture must not move a column. These safeguards keep browsing from
  inadvertently selecting or starting work.
- Swiping and controls share the same view: switching input method or rotating
  the phone must not return to a different column unexpectedly. Preserve existing
  reduced-motion behavior and desktop navigation.
- A smooth slide between columns is a nice-to-have. Animation smoothness needs
  no automated test. Following the finger continuously is not a delivery promise.

This increment does not redesign the Board, reorder stories, change column
membership, add drag-and-drop, or change gestures in terminals or the Side panel.

#### Key examples

- Given Backlog shown on a phone, swipe left → Taken is shown; swipe left again
  → Recently done. Swipe right twice → Taken, then Backlog. An outward swipe at
  either end leaves that end column shown.
- Given a long Backlog, move a finger vertically to read → the Board scrolls
  without changing columns. Tap Inspect → its ordinary detail opens. Swipe
  horizontally from a card → the view changes without selecting the card,
  opening detail, or launching work.
- Given Taken shown with columns hidden on both sides, the indicators are much
  thinner than the current controls and leave more width for the story. Tap the
  indicator toward Recently done → that column shows. Swipe right → Taken shows
  again; the indicators describe the new neighboring destinations.
- Given a chosen column and an open story detail, rotate the phone and return
  to portrait → the column choice and detail survive as with existing paging.
  With reduced motion requested, a swipe changes columns without requiring a slide.

#### UI

The developer reads one column, sees a subtle direction cue for work beyond
each available side, and swipes across the reading area to reach it. A boundary
has no cue suggesting work beyond that end. The named column heading confirms
arrival. The thin indicators remain an alternative for taps and keyboard use;
swiping avoids requiring a precise tap on them.

The developer explicitly requested the narrower functioning indicators on
2026-11-15. This changes the Column paging control's existing 44px touch-width
expectation in the navigation guidance; other controls retain their touch-size
requirements. No exact width or new visual arrangement is prescribed here.
