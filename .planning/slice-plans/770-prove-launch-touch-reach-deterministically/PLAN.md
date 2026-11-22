# Prove launch touch reach deterministically, without dispatched taps

**Identity:** SEED-413#repair-refinement-touch-tap-hang
**Source:** [Prove launch touch reach deterministically, without dispatched taps](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#repair-refinement-touch-tap-hang)

## Goal and scope

Dashboard maintainers get launch touch proof that gives the same result on
every run, locally and on hosted amd64, in well under a second per case.
The proof stops dispatching native touch through
`commands.tapMountedControl` (Playwright `locator.tap`). It checks touch
reach with the browser's own hit test at the control's centre, then
activates the control through the DOM. This all runs in headless Chromium
with the touch context, coarse pointer and phone viewports.

Included: `ad-hoc-refinement-touch.spec.ts`, the two taps in
`ad-hoc-start-session-answer.spec.ts`, the touch page-object helper in
`launch-layout-page.ts`, the `openRefinement` touch flag, and the
`tapMountedControl` runner command with its 5 s bound in
`dashboard/frontend.vitest.config.mts`. Excluded: other hosted flakes
(`intent-ci-status-side-panel.spec.ts:73`,
`mounted-instruction-voice-overflow.spec.ts:43`), new E2E cases and
production changes.

## Key examples and proof

| Given and trigger | Observer and expected result | Slice |
| --- | --- | --- |
| A phone-portrait refinement dialog with draft, Codex then Claude, Sonnet, Standard and Explore is rotated to landscape, then 300 px, then portrait. | The same dialog, instruction and model nodes remain. They hold the exact draft, Sonnet and "Refinement options Explore (1)". Cancel, Start and the folder note are fully in view; Start is not called. | 1 |
| At 300 px the caret is inside the draft and a line is inserted. | The draft holds the line at the caret, and later sizes keep it. | 1 |
| A control's centre is covered by another element (scratch break check). | The touch check fails, naming the control. | 1 |
| The Start session direction toggle is touched open and closed. | The direction content opens beneath and closes, the row's parts do not move and no sideways scroll appears. | 2 |
| Both specs run 50 times on hosted amd64. | 50 of 50 pass with no retry; the per-case times are recorded. | 2 |

## Current decisions

- The touch page object owns one helper: it scrolls the control into the
  nearest view, requires `document.elementFromPoint` at the control's
  centre to lie inside the control (or its label, for a radio or
  checkbox), and returns the element to activate. Activation is in-page:
  `click()`, a select `value` plus a bubbling `change`, or caret insertion
  through `document.execCommand("insertText")`. No CDP input command remains
  in either spec. Viewport changes stay `page.viewport` (emulation, not
  input).
- Name each retired observation and the retained case that carries it. The
  final Cancel's no-send and focus return →
  `ad-hoc-launch-dialog.spec.ts` refinement case (lines 76–79). The Codex
  dialog naming stays in this case through the select `change`. Native
  picker suppression (`keepPickerClosed`) has nothing left to guard.
- Removing the runner command changes shared frontend configuration, so
  Slice 2 needs whole frontend group proof.
- Coordination: `claude/get-launch-unit-proof-in-about-eight-seconds`
  (Maria-chan, SEED-413#make-launch-proof-orthogonal) edits
  `launch-layout-page.ts` and leaves both specs' taps unchanged. Before each
  slice, check `git log origin/main` for those files and rebase onto any
  landed change.

## Decisive premises observed

Observed in the preparation worktree at `2125be1ac` on 2026-11-22: macOS on
AC, Node 24.21.0, `npm ci`, load 37–48,
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <path> --workers=1`.

| Consuming operation | Observed form and result | Limit |
| --- | --- | --- |
| Baseline of the current case | 3 runs: case 6.58–7.36 s, command 19.84–21.82 s wall. | High load; Slice 1 retakes the pair. |
| In-page touch check and DOM activation for the refinement case | A scratch spec (deleted) used hit test + `click()`, select `change`, `execCommand("insertText")` and node-identity checks, and repeated the case 20 times per run. 2 runs: 40 of 40 passed, 0.15–0.82 s per case (most about 0.3 s), with the same observations. React accepted every activation. | Local macOS only; hosted stability is Slice 2's proof. |
| Same check for the Start session direction toggle | A temporary edit (reverted) replaced both `tap(directionToggle())` calls with hit test + `click()`. 2 runs: all 4 cases passed; the touch case took 411 and 516 ms. | Same. |
| Touch-specific code on the touched controls | `grep` of `dashboard/src` for `touchstart`, `pointerType`, `ontouch` and `touch-action` finds none in launch components. Coarse-pointer CSS (`launch-dialog.css:148`, `agent-launch.css:190`) follows the touch context, not dispatched taps. | A future touch handler needs its own native case. |

## Slices

### 1. The refinement touch case runs deterministically in-page

Type: Behavior
Status: planned

Add the touch helper to `launch-layout-page.ts` beside
`controlsAreReachable`. Rewrite the case to arrange the choices through it,
assert node identity and values at each size, insert at the caret at
300 px, and keep the in-view, reach and no-sideways-scroll checks. Remove
`setChoiceAfterTap`, `labelOf` and the final Cancel (mapped above). Drop the
`openRefinement` touch flag; the case opens through the helper.

Proof: the spec passes in 5 consecutive local runs. Paired before/after
timing of the spec under similar load. A scratch break check (reverted)
covers Explore's label with an element and must fail naming it. A second
(reverted) remounts the dialog on resize and must fail on node identity.
Record the mapping.

### 2. Start session touch uses the same check and the native tap retires

Type: Behavior
Status: planned

Replace both `tap(directionToggle())` calls with the helper. Delete `tap`,
the `BrowserCommands` declaration, and the `tapMountedControl` command and
its comment in `frontend.vitest.config.mts`. Confirm with `grep` that
nothing references them.

Proof: both specs and the launches selection pass at two workers. The whole
frontend group passes (shared configuration). Dashboard typecheck passes. A
temporary probe workflow in a separate file (not `ci.yml`) runs both specs
50 times on hosted amd64 on this branch: 50 of 50 pass with no retry.
Record its run ID and per-case times here. Delete the probe file before the
slice's final publication.

## Concern evidence

Slice-plan refinement was not needed: two small Behaviors, each one touch
consumer with its own proof, with retirement following the last consumer.
This review found no remaining slice-specific concern.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md). Keep
  default timeouts and omit `test.slow()`.
- Run focused proof on AC power under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard:frontend -- <paths> --workers=2`.
  Run the whole frontend group the same way, under Homebrew bash 5, in
  Slice 2 only. Run dashboard typecheck after edits.
