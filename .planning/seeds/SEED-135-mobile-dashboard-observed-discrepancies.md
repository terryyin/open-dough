---
id: SEED-135
status: active
planted: 2026-10-13
planted_during: One-hour observation of the completed mobile dashboard story
trigger_when: A developer starts a session or confirms unfinished work from a phone browser
scope: small
---

# SEED-135: Mobile dashboard observation findings

The completed SEED-133 mobile dashboard story promises touch access without
compromising desktop operation. Its one-hour follow-up observation found the
two independent discrepancies below. Terry requested that both become the first
queued product stories on 2026-10-13; this queues their repairs and does not
start implementation.

The [manual-testing report](../../dashboard/tests/manual/2026-10-13-mobile-dashboard/README.md)
retains conditions, reproduction steps, measurements, and screenshots. The
original mission record is also recoverable at
`50064a7dd0459a32c177c1d79621029f449dc2d5:.planning/seeds/SEED-134-mobile-dashboard-manual-testing.md`.

These stories concern browser presentation and touch reachability. Physical
iOS keyboards, Safari-specific acceptance, remote connectivity, and new native
host capabilities remain outside the completed story's accepted boundary.

## Stories

<a id="read-direction-after-phone-session-start"></a>

### Keep the direction disclosure readable after starting a session on a phone

**Identity:** SEED-135#read-direction-after-phone-session-start
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/302-keep-direction-readable-after-phone-session-start/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9875e7dcebace2c53ec3c3abe320492a4c1cc6c71223aee19447c6c87da693a8","plan":"05a20193192322329fafac6dbda08a513885b2fe30efc83e3bf596b441688925"}}
```

**Goal:** A developer working from a phone browser starts a session from the
project row, closes the opened terminal, and still reads the row as whole
words: the launch answer in full, the collapsed Near-future direction label,
and Start session with the badge legend help. Expanding the direction then
works as it does before a launch. This keeps the completed mobile dashboard
story's promise of touch access without compromising desktop operation.

#### Observed discrepancy

Finding M1 (P2): after an isolated ad hoc Claude session starts and its terminal
is closed, the visible “Ad hoc session started” answer squeezes the collapsed
Near-future direction heading to 13.27 pixels wide and 469.69 pixels tall at
390×844 and 430×932. The heading wraps almost letter by letter and pushes the
work stages down. At 768×1024 it is a readable 180.06×26.09 pixels; reloading
the phone page clears the transient answer and restores readability.

Reproduce by opening the dashboard at 390×844 with touch input, starting an
isolated session with a typed instruction, closing its automatically opened
terminal, and reading the project action row while its success answer remains.
See [M1 evidence](../../dashboard/tests/manual/2026-10-13-mobile-dashboard/README.md#m1).

The row gives the direction's heading the remaining width after Start session,
the help, and whatever answer stands beside them. The success answer has no
width bound, and the progress and problem answers are bounded wider than a
phone, so any visible answer leaves the heading almost no width at phone
widths. The same rule therefore covers every answer state, not only success.

#### Scope

Required behavior:

- At phone widths, portrait and landscape, every launch answer shown beside
  Start session reads in full, in ordinary words, while the collapsed direction
  label also reads in ordinary words. Neither takes the other's room; one may
  take more lines instead. This covers the success answer, the “Starting a
  session…” progress answer, and Launch failed or Launch uncertain answers with
  their explanations.
- The answer stays next to Start session, the control that produced it, so the
  developer can tell what it answers. It may continue beneath Start session on
  a phone where the row cannot hold it beside; it does not move between the
  direction label and its opened text, and it does not move the badge legend
  help out of reach.
- The direction disclosure stays reachable by touch with the answer visible,
  and the opened direction text reads beneath the row as before. Expanding and
  collapsing it with the answer visible causes no sideways page scrolling, and
  the work stages below remain readable and move down by no more than the
  answer's own height.
- Rotating between phone portrait and landscape with the answer visible keeps
  the answer, label, Start session, and help readable and reachable.
- Launch feedback stays truthful and whole. An answer is not cut short,
  hidden, or cleared earlier than today to make room; its explanation is what
  a developer recovers from. Clearing on the next Start session opening and on
  reload stays as it is.
- Tablet and desktop keep their current row: the answer beside Start session,
  the direction and legend help opposite it, keyboard access, and surrounding
  work-stage reading.

Unchanged by this story:

- Session-start authority, native launch semantics, and the wording and
  screen-reader announcement of the answers.
- The direction's content, its collapsed start, and that opening it makes no
  source request.
- The sibling final-report confirmation story in this seed.

Interaction choices considered from the phone user's side, decided for the
required behavior above: an answer that stays beside Start session on one
phone row would have to shorten either itself or the label, and a shortened
problem explanation hides what the developer must recover from, so the answer
keeps its whole text and may take lines beneath Start session instead. A label
wrapped at its own word boundaries stays readable; letter wrapping does not.

#### Key examples

- Phone portrait at 390×844, direction collapsed, no answer shown → the
  developer starts an isolated ad hoc session with a typed instruction and
  closes the opened terminal → “Ad hoc session started” reads whole beside or
  beneath Start session, the direction label reads “Near-future direction” in
  whole words, the help control is reachable, and the Backlog heading follows
  the row by about the answer's height. The same holds at 430×932.
- The same state → the developer taps the direction label → its published
  text opens beneath the row, the answer remains readable next to Start
  session, nothing scrolls sideways; tapping the label again collapses it and
  the row reads as before.
- Phone portrait with a Launch failed answer whose explanation is longer than
  the row (for example a host that could not be started) → the developer reads
  the row → the whole explanation reads in ordinary words across as many lines
  as it needs, next to Start session, and the direction label still reads in
  whole words.
- Phone portrait with the success answer visible → the developer rotates to
  844×390 and back → the answer, label, Start session, and help stay readable
  and reachable in both orientations.
- Tablet at 768×1024 after the same launch → the answer reads beside Start
  session on the row, the direction label keeps its current single-line
  reading, and keyboard users open the direction with Enter or Space as today.

Proof must include the post-launch answer state at phone viewports that the
original mobile tests did not expose, in portrait and landscape, with the
direction expanded and collapsed, and at least one problem answer.

<a id="reach-final-report-done-choices-on-short-phone"></a>

### Keep final-report Done confirmation choices reachable at short phone height

**Identity:** SEED-135#reach-final-report-done-choices-on-short-phone
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and outcome:** A developer reading a saved final report on a
phone with constrained visible height can choose Mark as done or Keep open by
touch without activating the dashboard beneath the report.

#### Observed discrepancy

Finding M2 (P2): opening Mark as done for an unfinished report at 390×320
clips Keep open: the button ends at y233.66 while the panel ends at y224.
At 390×240 both confirmation choices disappear. Ordinary touch scrolling moves
the panel away without exposing the choices; the intended Keep open point
hits the underlying Open Dough source-evidence disclosure. Restoring 390×844
exposes both buttons. Both choices and keyboard dismissal are reachable on
desktop at 1440×900.

Reproduce with a disposable isolated session: submit an unfinished completion
report, remove only its clean saved workspace, reload, open Read final report,
reduce the visible viewport to 390×320 or 390×240, and tap Mark as done. Try
ordinary touch scrolling to reach Keep open. See
[M2 evidence](../../dashboard/tests/manual/2026-10-13-mobile-dashboard/README.md#m2).

#### Scope and key examples

- At 390×320 and 390×240, both confirmation choices can be brought fully into
  view and activated by ordinary touch interaction. A touch intended for a
  confirmation choice cannot activate a control beneath the report panel.
- Keep open dismisses the confirmation and leaves the session's existing
  read, done, and native stop state unchanged. The report remains available.
- Mark as done follows the existing explicit unfinished-work confirmation,
  recording and native stop/rename behavior. No workspace is recreated or
  substituted to make the confirmation reachable.
- Enlarging or rotating the phone while confirming retains access to the
  report and its choices. Tablet and desktop retain report reading, both
  choices, Escape dismissal, and existing keyboard shortcuts.

The repair concerns the existing final-report panel and confirmation layout;
it adds no completion authority, reporting protocol, or host capability.
