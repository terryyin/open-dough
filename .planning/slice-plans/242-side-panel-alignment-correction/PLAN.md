# Side panel alignment correction

**Identity:** SEED-091#side-panel-review-reopen-and-close-alignment
**Source:** [correction story](../../seeds/SEED-091-dashboard-ui-renovation.md#side-panel-review-reopen-and-close-alignment).
**Prepared:** 2026-10-03 by the execution retrospective of
SEED-091#review-and-terminal-share-side-panel. Planning only; this plan
authorizes no implementation or publication.

## Provenance

Original contract: SEED-091#review-and-terminal-share-side-panel, at
`3775c64d:.planning/seeds/SEED-091-dashboard-ui-renovation.md`, and its plan
`b4ec4e42:.planning/slice-plans/240-review-terminal-side-panel/PLAN.md`.
Reviewed commits: `2c64ac94` (slice 1), `48e7e820` (slice 2), `d02ade82` (CI
test repair), `594045a2` (slice 3).

## Current findings

1. **Same-story activation is silent, and docs promise a fresh read.**
   `dashboard/src/pageSidePanel.ts` `openReview` keeps the shown review when the
   same story's Review changes control is activated again. `StoryReviewPanel`
   focuses only on mount, so keyboard users get no feedback. The maintained
   contract (`dashboard/AGENT-LAUNCH.md`, "Each opening … reads a fresh
   snapshot") and the `PageFrame.tsx` key comment ("each opening of one, reads
   anew") contradict the implemented rule. No spec covers this path.
2. **Two owners for the panel Close shortcut.** `PanelControls.tsx` owns
   Command+Shift+Escape for review and terminal; `SessionResultPanel.tsx`
   registers its own with a hand-written title, while `pageShortcuts.ts` names
   only `PanelControls.tsx`.
3. **Proof cost without value.** `story-panel-replacement.spec.ts` "the
   review's and the terminal's headers share one look" compares computed
   styles of one shared class (passes by construction), writes unasserted
   screenshots, and repeats control checks from `story-panel-switching.spec.ts`.
   `side-panel-width-kept.spec.ts` runs six reload-and-attach rounds for one
   numeric validation.
4. **North Star omission.** `docs/dashboard-ux-ui-north-star.md` says selection
   connects "one terminal or retained report", so it does not show that the side
   panel is now multi-purpose. Terry decided (2026-10-04) that the North Star
   states the panel holds one item at a time — a terminal, a retained report,
   or a story's review — without describing the review itself, which belongs to
   the review contract.

## Preserved promises and constraints

Fixed snapshot until Refresh; fresh snapshot on any opening after Close or
replacement; a pending read never answers another story; one exclusive panel
selection; reviews take no session mark; dialog and System settings shortcut
suppression; plain Escape stays terminal input; width rule and persistence
unchanged; the final report's chrome redesign stays deferred.

## Decision

Activating Review changes for the review already shown moves keyboard focus to
that review and keeps its snapshot (Refresh is the explicit re-read). This
follows the story's fixed-snapshot rule and the accessibility direction; it
adds no feature promise.

## Proof ownership

| Finding | Observable proof |
| --- | --- |
| 1 | Add a step to `story-panel-replacement.spec.ts` (or the review refresh journey): with Story A's review shown and focus moved to the dashboard, activate Review changes on Story A again; the review body receives focus, the same file selection remains, and the review read count is unchanged. Docs/comment state the rule. |
| 2 | Existing report journeys (`session-workspace-retirement.spec.ts`, report close/keyboard steps) still close the report by Command+Shift+Escape with focus return and dialog suppression, after the report uses the shared definition. |
| 3 | Remove the header-look test; keep the switching journey's frame-icon-control and maximize-room assertions. Reduce malformed-width rounds to two representative values plus one non-numeric, keeping the "other preferences untouched" and "next choice kept" observations. |
| 4 | Documentation only: the North Star names the side panel as one multi-purpose region holding a single item at a time (terminal, retained report, or story review), with review details left to the story review contract (`dashboard/AGENT-LAUNCH-REVIEW.md`). |

## Ordered slices

### 1. Align same-review opening, report close shortcut, and proof
Type: Behavior
Status: done
Proof: the table above, run with
`env -u NODE_ENV -u npm_config_local_prefix -u npm_package_json ./node_modules/.bin/playwright test --config dashboard/playwright.config.ts --reporter=line --workers=2`
over
`story-panel-replacement`, `story-panel-switching`, `story-review-refresh`,
`side-panel-width-kept`, `session-workspace-retirement`, `agent-terminal-keyboard`
and `system-settings`, plus `npm run typecheck:dashboard`.

Behavior: Story A's review is shown and the keyboard is elsewhere → the
developer activates Review changes on Story A → focus moves into the shown
review without another read. The final report closes through the same shortcut
definition as other panel content. Maintained docs and comments describe these
rules, and redundant tests are removed or trimmed.

Safe stopping point: the whole correction delivered.

Delivered 2026-10-04 (execution checkout
`.worktrees/align-the-side-panel-s-same-review-opening-repor`, base `e6e56dd7`).
Accepted proof: the slice's focused Playwright command passed, 32 passed, and
`npm run typecheck:dashboard` passed.

- Finding 1: `story-panel-replacement.spec.ts` step "Review changes for the
  review shown takes the keyboard to it and keeps its snapshot" checks that
  `.story-review-body` is focused, the selected file stays `aria-pressed`, its
  diff stays visible, `reviewReads` is unchanged, and one panel item remains.
  The step fails when `openReview` keeps the old `current`.
- Finding 2: `SessionResultPanel` uses `usePanelCloseShortcut` and
  `closeShortcutLabel` from `PanelControls.tsx`.
  `session-workspace-retirement.spec.ts` still closes the report by
  Meta+Shift+Escape and returns the keyboard. No test presses that shortcut
  inside a dialog while a report is shown; dialog suppression for the report
  rests on the shared `useCommandShortcut` path, which `agent-terminal-keyboard`
  observes for the terminal.
- Finding 3: the header-look test is removed, and the malformed widths are now
  `wide`, `0` and `Infinity`.
- Finding 4: the North Star names the side panel as one region that holds a
  single item at a time.

Learning: re-opening a terminal still keeps its current panel state. Only a
review takes the new request, so focus moves to it.

Refactor: the story review contract moved to `dashboard/AGENT-LAUNCH-REVIEW.md`,
and `AGENT-LAUNCH.md#story-review` now points there. The adapters' readings
paragraph merged into `AGENT-LAUNCH-HISTORY.md`, keeping `AGENT-LAUNCH.md`
under the file-size limit.

## Current decisions and remaining concerns

None remaining. One slice is proportionate: each finding is small, and they
share the panel's opening/closing contract and proof homes.

## Execution complete

Product advice: no change to priorities. The correction is delivered with no
remaining outcome findings. The next queued review work is
SEED-088#review-files-as-folder-tree. Put new story-review contract text in
`dashboard/AGENT-LAUNCH-REVIEW.md`; `AGENT-LAUNCH.md` is 247 lines against
its 250-line limit.
