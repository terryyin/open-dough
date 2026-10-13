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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and outcome:** A developer using a phone browser can read and
expand Near-future direction alongside the project actions and the successful
Start session answer.

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

#### Scope and key examples

- At 390×844 and 430×932, after a successful Start session, the collapsed
  direction label remains readable in ordinary words, its disclosure remains
  reachable by touch, and the result and project actions remain readable.
- Expand and collapse the direction while the result is visible; both the
  direction text and the project actions remain usable without sideways page
  scrolling. Changing between phone portrait and landscape retains access.
- Preserve truthful launch feedback, including success and recovery answers;
  hiding or deleting the result is not a resolution of this discrepancy.
- Tablet and desktop retain their existing disclosure, project actions, launch
  feedback, keyboard access, and surrounding work-stage reading.

The repair changes presentation rather than session-start authority or native
launch semantics. Its proof must include the post-launch result state that
the original mobile tests did not expose.

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
