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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/525-highlight-linked-story-card/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"28e11bead8dfe8d6fb5b71b75e73e9da319e1ce69b0896c670c7997fd7e61689","plan":"d94fc359384cb9a36c3c16e21bbb7d030c79dc23efd26a5bd1b240c1ca3631e7"}}
```

**Goal.** When a developer follows a story link in the dashboard or opens a
direct story URL, they can immediately tell which card the link brought into
view, even among several similar cards.

**Scope.**

- Required behavior: each successful card reveal from a story reference or
  direct story destination shows a brief, noticeable **destination cue** on
  that card. The cue works whether the destination is already the selected
  story or not. Following the same destination again shows the cue again,
  including when the card is already in view. With reduced motion enabled,
  the destination gets a brief static cue instead of motion. Existing
  selection, detail opening, scrolling, and keyboard focus follow
  [dashboard navigation](../../docs/dashboard-navigation.md).
- Required restriction: the destination cue is not the selected story's
  [Highlight](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
  Reveal keeps leaving the selected story as navigation already does; it does
  not select the destination to mark arrival.
- Scope limits: exact glow, pulse, or color treatment beyond “brief and
  noticeable”; a spoken live-region announcement beyond focusing the card;
  amending ADR 0008's UI vocabulary table; cues for non-story destinations.

**Key examples.**

- Pre-condition: several similar Backlog cards are on the Board, none selected.
  Trigger: the developer follows a dependency story reference to one of them.
  Result: that card comes into view with the keyboard on it, and it shows a
  brief destination cue that then returns to the card's normal appearance. No
  other card is cued; the selected story stays none.
- Pre-condition: the destination card is already the selected story and already
  in view, so its Highlight is already showing.
  Trigger: the developer follows a link or opens a direct story URL to that
  same identity again.
  Result: the destination cue plays again on that card. The Highlight remains
  the selection mark; selection, open detail, and Side panel content stay as
  they were.
- Pre-condition: reduced motion is enabled, and a Recently done story reference
  resolves to a done card that must be revealed.
  Trigger: the developer follows that reference.
  Result: the done card comes into view with a brief static destination cue
  (no motion), then returns to normal. Selection is unchanged.

**Alternatives considered.**

- Reuse Highlight by selecting the destination on every reveal. Rejected for
  this story: dependency and Done references already leave the selected story
  alone, Intent reads selection, and a second follow to an already-selected
  card would show no change.
- Rely on keyboard focus alone after reveal. Rejected: after a pointer
  activation, programmatic focus on the destination card does not match
  `:focus-visible` in Chromium (observed locally), so pointer users can get
  scroll and focus with no visible focus ring among similar cards.
- Persistent “last arrived” mark until the next navigation. Deferred: the
  purpose needs an immediate arrival signal, not a lasting second selection
  mark.

**Borrow.** Find-in-page and fragment `:target` flashes map cleanly: one
arrival → one brief mark on the found element, repeatable on the next find.
The analogy breaks where those mechanisms often coincide with selection; here
Highlight stays selection-only and the destination cue must compose with it.

**Architecture.** Attach the cue to the shared card reveal path that story
references and direct story URLs already share, so one rule covers those
arrivals without a parallel navigation stack. Name the cue distinctly from
Highlight in navigation guidance, code, and tests
([ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-ui-vocabulary),
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)).
Do not overload Highlight. Adding the name to ADR 0008's vocabulary table is
a human vocabulary maintenance step outside this story's delivery.
