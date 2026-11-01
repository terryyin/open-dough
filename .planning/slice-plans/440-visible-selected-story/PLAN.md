# Make selected stories easier to see

**Identity:** SEED-215#visible-selected-story
**Source:** [selected story](../../seeds/SEED-215-visible-selected-story.md#visible-selected-story)
**Source review:** [independent commitments](source-review.md)

## Goal and scope

Tint selected story cards with the existing accent-soft fill. Inspection and the
session shown in the Side panel each keep the tint active; neither changes how
selection works. Preserve borders, outlines, startup marks, readable text, and
ordinary fills for unselected cards. No other interface changes.

## Current decisions

- Reuse `--accent-soft` from `dashboard/src/styles.css` and the existing
  `story-card-selected` / `story-card.in-side-panel` state classes. One shared
  fill rule in `story-cards.css` owns the visual change. No new state or token.
- Existing solution evidence: `StoryCard.tsx` emits these two independent
  classes; `story-detail.css` owns the inspection border; `agent-launch.css`
  owns the session outline. Neither needs to move.
- Follow the restrained accent and contrast requirements in
  [visual direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction).
- One bounded Behavior slice; implement in this worktree. No replanning or
  scope expansion needed. Source review and independent refactoring precede delivery.
- Failure policy: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests), as written.

## Ordered slices

### 1. Recognize the selected story at a glance

Type: Behavior
Status: done

Behavior: Inspect a card or show its session → its fill becomes pale blue;
unselected neighbors keep the ordinary fill. Clear either state while the other
is active → keep the tint. Clear both → restore the ordinary fill. Startup
marks and readable text coexist with the tint.

Proof: Observe computed styles from the actual stylesheets in Chromium for
inspection, session display, both together, cleared selection, neighboring cards,
and startup. Check normal/quiet/accent text contrast and retained borders and
outlines. Use the existing `sessions-sidebar-navigation.spec.ts` journey to
verify actual session selection, movement, and clearing, and a focused inspection
journey if existing style checks require it. Run a production build. Add no
duplicate browser matrix or permanent test for a simple CSS fill.

## Premises and proof ownership

Build readiness is established in this worktree by `npm ci --no-audit --no-fund`
and `npm run build:dashboard` (passed). Selection-state composition and tint
discrimination are directly observed within slice 1 before acceptance; no later
slice depends on them. Proof is one Chromium instance and one existing focused
journey file, with one worker; other worktrees share the host, so no full local
suite is launched for this CSS change.

## Concern assessment

Refinement not needed: one cohesive visual outcome and one proof owner.
No remaining slice-specific concerns identified.

## Execution context

Created workspace: `/Users/terryyin/git/open-dough/.worktrees/visible-selected-story`.
Branch: `codex/visible-selected-story`, Story Branch Mode.
Originating/integration checkout: `/Users/terryyin/git/open-dough`.
Starting revision: `4d018be569ac30122461f3076e35d9d14308099c`.
Admission: `2b4f612158bacf07a8d855b3980246daafeac9da` on `origin/main`.
Increment target: `origin/refs/heads/codex/visible-selected-story`.
CI: GitHub Actions `ci.yml`, workflow `CI` (351271804).
Observer: coordinator `selection-01a1961c`, `/tmp/dough-ci-501/watch-yNb0Tc`,
PID 58875, session 76670, yielded cell `g6:5`; admission trunk CI unobserved.
After interruption, prior observer files were absent and its PID was no longer
running; no product increment had been published. Remote branch and local HEAD
both remained the admission. The same worktree retains the original creation
record. Re-established focused proof before accepting the resumed refactor.

## Accepted proof

- `node /tmp/verify-selected-story-highlight.mjs` passed. One Chromium page
  loads the actual `styles.css`, `story-cards.css`, `story-detail.css`, and
  `agent-launch.css`. A representative card and neighbor supply only markup;
  product CSS supplies colors. Computed-style assertions cover ordinary,
  inspected, session shown, combined, either selection removed, both cleared,
  startup composition, and an unselected neighbor. Removing only the new rule
  restores the prior ordinary fill, establishing discrimination. Selected fill
  is `rgb(230, 238, 248)`, ordinary `rgb(246, 246, 243)`; borders and 3px outline
  remain accent. Startup keeps dashed top / solid left. Contrast: normal text
  14.43:1, quiet text 6.41:1, accent 5.52:1. Coordinator inspected screenshot.
- `env -u NO_COLOR npm run test:dashboard -- sessions-sidebar-navigation.spec.ts --workers=1`
  passed. Existing published-origin and synthetic native-session setup in
  `sessionNavigationJourney.ts` reaches actual sidebar choices; the spec's
  select/move/close steps observe outline movement, current entry, session
  attachment, class clearing, and returned focus.
- `env -u NO_COLOR npm run test:dashboard -- accessible-board-keyboard.spec.ts --grep 'accessible Board is read by keyboard' --workers=1`
  passed. `publishMovingOrigin` supplies published story inputs; the selected
  test's Enter/Inspect/link/Hide sequence observes detail opening, pinned link,
  closing, and restored card focus. One test was selected, not the whole file.
- `npm run build:dashboard` and `git diff --check` passed.
- Consumer trace command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/visible-selected-story --base HEAD --path dashboard/src/story-cards.css --term story-card-selected --term in-side-panel`.
  Actual rendering/build/journeys cover `StoryCard.tsx`, `main.tsx`,
  `story-detail.css`, `agent-launch.css`, and sidebar navigation. SessionEntry
  and sidebar entry selectors cannot match the new card-only rule. Remaining
  responsive startup, workspace retirement, and panel switching tests assert
  unchanged class/lifecycle behavior; the equivalent CSS states are observed
  by the probe. Column-frame and planning matches are comment/guidance only.
  All fourteen located consumers have a disposition; no uncovered promise.
- First sidebar journey attempt failed only because inherited `NO_COLOR=1`
  conflicts with Playwright's `FORCE_COLOR`, causing Node output that the quiet
  reporter correctly refuses. Removing that conflicting shell input repairs
  the test environment; both focused journeys then passed. Diagnostics were
  moved outside this checkout; no permanent tests were added.

## Recovery and independent refactor

Fresh agent `selection_refactor_finish` returned `## REFACTOR COMPLETE` after
the interrupted prior review. CSS was already cohesive. It compressed only
neighboring navigation prose, preserving every promise and keeping that file
at 250 lines. `git diff --check` passed. `node /tmp/selected-story-recovery-probe.mjs`
re-established the same nine rendered states, discrimination, and contrast;
observations are `/tmp/selected-story-recovery-observations.json`. Both literal
focused Playwright commands above passed again against the actual resumed
checkout. Coordinator's resumed production build passed too. No new tests or
production changes were introduced by refactoring. The documentation consumer
trace found no production consumers; the sole boundary test only deletes the
same documentation path, and guidance readers retain its path and anchors.

## Execution complete

Product advice: no change. Independent retrospective found no implementation,
test, architecture, or product correction needed. It recorded one process
recurrence under existing ODF-264 in DearDough.md; no process improvement is
executed as part of this story.
