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

<a id="reach-final-report-done-choices-on-short-phone"></a>

### Keep final-report Done confirmation choices reachable at short phone height

**Identity:** SEED-135#reach-final-report-done-choices-on-short-phone
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/303-reach-final-report-done-choices-on-short-phone/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"844508cdf82c4ca9d6604738ad10bbd4c86a93f7370ae0ea2df6651b382d9b62","plan":"137765b27524efea5aee1b183d9d588ba99e8755055d7d0cf8c46aaccf6da11b"}}
```

**Goal:** A developer reading a saved final report on a phone with constrained
visible height can choose Mark as done or Keep open by touch without activating
the dashboard beneath the report. This preserves useful touch access to
unfinished work without compromising desktop operation.

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

#### Scope

Required behavior:

- At short phone heights, including 390×320 and 390×240, the developer can
  read the unfinished-work question and bring each confirmation choice fully
  into view and activate it with ordinary touch interaction. Scrolling is
  allowed; neither enlarging the viewport nor using a keyboard is required.
  Wrapped session titles and identifiers must not consume the choices' access.
- A choice remains within the report's usable interaction area when touched;
  a touch intended for it cannot activate dashboard content beneath the panel.
  Both choices keep the existing comfortable touch targets.
- Keep open dismisses the question, leaves the report available, and preserves
  the existing read, done, and native stop state. It returns keyboard focus to
  the originating Mark as done control as today.
- Mark as done still requires the existing explicit unfinished-work
  confirmation and uses the existing recording, native stop/rename, and failure
  feedback. No workspace is recreated or substituted to make it reachable.
- Enlarging or rotating the phone during confirmation retains the selected
  report and access to its question and choices. Report content and Close
  remain reachable; the developer can return to reading after Keep open.
- Tablet and desktop retain report reading, both choices, Escape dismissal of
  the question, and the existing panel-close keyboard shortcut.

Deferred promises and unchanged boundaries: new completion authority, reporting
protocols, native host capabilities, changes to session action semantics, and
redesign of unrelated panels or the sibling launch-answer story. Physical iOS
keyboards, Safari-specific acceptance, and remote connectivity keep the shared
seed's boundary. These viewport examples are not limits on supported sizes.

#### Key examples

- A saved unfinished report has a missing workspace and a title/identifier
  that wraps across several header lines → at 390×320 or 390×240 the developer
  taps Mark as done, then scrolls by touch as needed → the question can be
  read and both choices can each be shown whole and touched within the report,
  without operating the page below it.
- In that confirmation → the developer touches Keep open → the question
  closes, the same report remains readable, and the session's read/done state
  and native stop state remain as before the choice.
- In that confirmation → the developer touches Mark as done → the existing
  explicit Done operation runs for that session, with its existing result or
  failure feedback; the missing workspace remains missing.
- With confirmation open at 390×240 → the developer enlarges to 390×844 or
  rotates to 844×390 and back → the same report and pending choice remain
  available; neither resize confirms nor cancels it.
- At 768×1024 and 1440×900 → the developer opens the question, uses Keep open
  or Escape, then closes the panel with its existing keyboard shortcut → the
  question and report remain readable, dismissal preserves session state,
  and keyboard focus follows the existing controls.

The interaction does not require both buttons to remain fixed onscreen at
once: ordinary touch scrolling may expose each whole choice. The essential
relationship is that the question and answers remain reachable within the
report, with the existing explicit action boundary. No interaction choice here
adds or moves a system responsibility, so no new Architecture section or ADR
proposal is needed. Planning will select the presentation against these examples.
