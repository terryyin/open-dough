# Keep the selected story when the Side panel closes

**Identity:** SEED-275#preserve-story-on-panel-close

**Source:** [Keep the selected story when the Side panel closes](../../seeds/SEED-275-story-intent-tabs.md#preserve-story-on-panel-close)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer can dismiss a review, terminal, or final report and continue with
the story selected at dismissal. Apply ADR 0008's selection rule to every Side
panel dismissal, including **Mark as done** and deletion that close the panel.
Keep keyboard return to the opening control when it is still available, else
the existing fallback. Align dashboard navigation and Intent guidance with
that behavior. Opening a session attached to no story still clears the
selection.

## Architecture

PFE: change the existing Side panel owner in `dashboard/src/pageSidePanel.ts`.
`empty()` clears the panel and today also clears the selected story; Close,
**Mark as done**, and deletion that close the panel all go through it.
Removing that clear preserves the selection at dismissal. Opening content
still selects its story, and a session attached to no story still clears via
`selectStoryOf`. Keyboard return stays in `keyboardReturn.ts`. ADR 0008
already states the preserve rule; no new ADR or North Star topic.

## Outside-in proof

| Promise | Owner | Observable check |
| --- | --- | --- |
| Closing Review changes from Intent keeps story, tab, file, reading, and returns focus to the header button | 1 | Rewrite `intent-story-review-return.spec.ts`: after keyboard open and close from the header, Intent still has the story, **Changed tests** reading, and focus on the opener. |
| Selection at dismissal wins over the panel's story | 1 | In `intent-ci-status-side-panel.spec.ts`, with A's report open, select B, close: B stays selected and Intent shows B. |
| Terminal close / Mark as done / delete close the panel without clearing selection; Shown-in marks leave | 1 | Adjust `sessions-sidebar-navigation.spec.ts`, `agent-terminal-done.spec.ts`, and `agent-terminal-delete.spec.ts`: panel and marks go; selected story stays. |
| Ad hoc / no-story session still clears | 1 | Existing clear-on-open steps in `intent-ci-status-side-panel.spec.ts` and `story-card-selection.spec.ts` stay green. |
| Guidance matches ADR 0008 | 1 | `docs/dashboard-navigation.md` and Intent-facing comments that still say close clears selection describe preserve instead. |

## Slices

### 1. Preserve the selected story on every Side panel dismissal

Type: Behavior
Status: done
Proof: the table above; typecheck and the touched Intent, navigation, and
session specs.

`empty()` stops clearing selection. Close, **Mark as done**, and deletion that
close the panel preserve the selection at dismissal. Intent reading and
keyboard return to an available opener stay. Navigation and Intent guidance
match. Opening a no-story session still clears.

Accepted proof: typecheck; focused intent/sessions specs plus
`navigation/story-card-selection.spec.ts` (9 passed); whole `intent`,
`sessions`, `review`, and `navigation` directories (619/620, the one load flake
repaired below); touch specs 71/71, every `focusByTouch` user ×5 85/85, all
`showColumn` users 143/143. Commitments observed in
[source-review.md](source-review.md).

Learnings:

- Removing clear-on-close reached more consumers than the premise named:
  `session-workspace-retirement*.spec.ts`, `development-intent-frame-sessions`,
  and `intent-story-changes-marked`, where a re-select workaround now toggled
  the story off. Running `review` and `navigation` found them.
- Local-only failures repaired under the failing-test policy: phone
  `story-review-touch` timed out on slow CDP touch moves (`scrollByTouch` now
  uses 4 moves per plain stroke); terminal touch Paste and readiness taps hit
  `.xterm-screen` because xterm keeps stale rows until its ResizeObserver
  refits and long macOS temp paths shrank the box enough to overflow the
  toolbar (`.terminal-screen` now `overflow: clip`; `focusByTouch` waits for
  the refit); `showColumn` treated a not-yet-started slide as settled (it now
  waits for the row's `--leftmost` to change and `data-sliding` to clear).
- Refactor: Intent reading-pane scroll helpers shared in
  `dashboard/tests/intentPerspectivePage.ts`.

## Execution complete

Product advice: no change. The delivered behavior matches ADR 0008's
existing selection rule and the story; nothing in the queue's direction is
affected. The local-only `overflow: clip` terminal fix is a small product
correction with no visible change once xterm refits.

## Proof and delivery gates

Run the focused specs named above and the whole `dashboard/tests/intent` and
`dashboard/tests/sessions` directories once before delivery when those suites
are the smallest maintained consumers of the change, along with typecheck and
lint. **Local gate.** On AC power, start fully awake under `caffeinate -s -i`
for long runs. On battery, start fully awake with the lid open under
`caffeinate -i` and inspect the sleep log. Follow
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
and [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests).

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Close, Mark as done, and delete that close the panel all clear selection only through `empty()` | Slice 1 removes `selection.clear()` from `empty()` | Read `pageSidePanel.ts` `empty`, `close`, `markSessionDone`, and `deleteSessionRecord` at `9f66f2099` | Confirmed: `close` and the delete path that closes call `empty()`; Mark as done closes through `close`. |
| Named specs assert clear-on-close and fail when `empty()` stops clearing | Slice 1 updates those consumers | Scratch: remove `selection.clear()` from `empty()`, run `caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-status-side-panel.spec.ts tests/intent/intent-story-review-return.spec.ts tests/intent/intent-story-changes.spec.ts tests/sessions/sessions-sidebar-navigation.spec.ts tests/sessions/agent-terminal-done.spec.ts --workers=4 --reporter=line` at `9f66f2099` with that edit; revert before any record write | 5 failed on preserved selection where they expected clear: `intent-ci-status-side-panel` (close step), `intent-story-review-return`, `intent-story-changes` (close step), `agent-terminal-done` (Mark as done), `sessions-sidebar-navigation` (close step). 2 Mark as done cases that do not assert clear-on-close passed. `agent-terminal-delete.spec.ts:82` asserts clear after delete closes the panel; same `empty()` path, not re-run. |
| Keyboard return already focuses an available opener | Slice 1 keeps return; Intent example needs the opener focused | Read `keyboardReturn.ts` at `9f66f2099`: when `returning.control` still has client rects, it focuses that control | Confirmed. With selection preserved, Intent no longer falls to Project Intent, so the header opener remains the return. |

## Current decisions

- Preserve the selection present at dismissal, not the story that opened the
  panel.
- Do not change which openings select or clear; only dismissals stop clearing.

## Preparation review

Refinement was not needed: one Behavior slice owns one selection rule and one
proof loop. No slice-specific concern remains.
