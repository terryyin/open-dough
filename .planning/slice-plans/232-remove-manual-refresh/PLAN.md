# Remove the dashboard's manual refresh

**Identity:** SEED-092#remove-manual-refresh
**Source:** [refined story](../../seeds/SEED-092-remove-dashboard-manual-refresh.md#remove-manual-refresh).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace. This instruction authorizes neither implementation nor publication.

## Goal and boundaries

A developer uses a simpler dashboard that keeps itself up to date without a
manual Refresh or Retry control. The product carries no code, wording, or
documentation that only served that control.

Included scope is the story's scope. Material exclusions:

- No new automatic recovery. A failed first read (nothing shown yet) and a
  record detail that failed at an unchanged revision recover by reloading the
  page.
- Automatic revision checks, their pace, rate-limit waits, and visibility
  behavior are unchanged.
- Other Retry or Refresh controls with their own purpose stay: the story
  review's Refresh (`StoryReviewAction.tsx`, `AGENT-LAUNCH.md` "until Refresh
  takes a new one"), Retry model choices, Retry report, and OpenAI Retry status.
- No redesign of the source status or the banner.

## Direction and PFE

PFE: nothing is added. The work deletes one control and reuses existing
recovery paths and test helpers.

- The fresh-read operation behind the button, `refresh` from
  `usePublishedObservation`, keeps a live caller: launch reconciliation's
  `readAfresh` (`ConfiguredDashboard.tsx:79` → `launchAttempts.ts:197` →
  `startupReconciliation.ts:214`). Keep the operation; only the button's wiring
  goes. The post-change refactor may rename it to match its remaining purpose.
- Becoming dead with the button: `SourceStatus`'s `reading`, `failed`, and
  `onRefresh` props and the matching `DashboardBanner` props and
  `ConfiguredDashboard` arguments; `.refresh` rules in `banner.css`; the
  read-control branch of `projectKeyboardNavigation.ts` (`isReadControl`,
  `focusReadControl`, the `"refresh"` `FocusAfterSwitch` case); and comments
  in `publishedObservation.ts` and `SourceStatus.tsx` that describe the control.
- Tests trigger reads through existing journeys, not a new product seam:
  - **Scheduled check**, when the journey depends on in-page state such as
    focus, an open disclosure, launch state, or a shown snapshot beside a
    failure: pause the page clock before opening (`pausePageClockAt`) and use
    `passTimeUntilChecked` from `tests/autoRefreshJourney.ts`, with `502` for a
    failed check. This needs the published revision to change, or the check to
    fail.
  - **Reload** (`page.reload()`), when nothing in-page matters, or a read at an
    unchanged revision is needed (first-read failure recovery, a detail gap at
    the same revision).
  - A step that only proved what the button itself did (its name, tab order,
    `aria-disabled` while reading, focus kept on it) is deleted, not migrated.

Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favours small, inexpensive change. No Accepted ADR conflicts. The design notes in
`docs/dashboard-navigation.md` and `docs/dashboard-ux-ui-north-star.md`
describe the control. Slice 2 updates them to the new behavior. They are not
ADRs.

**Coordination with plan 230.** [Plan 230](../230-dashboard-frame-renovation/PLAN.md)
(Taken) restyles Refresh/Retry with a Lucide icon and checks it in
`read-failure*.spec.ts` and `dashboard-header.spec.ts`. Whichever lands second
reconciles: if 230 lands first, slice 2 also removes its icon use and its
icon-control assertions on the read control; if this lands first, 230 drops
the Refresh rows. Neither changes this story's scope.

## Key examples and proof

| Promise (source example) | Owning slice | Observable proof |
| --- | --- | --- |
| Opening the dashboard shows the source status with no Refresh button; newly published progress still appears automatically | 2 | `dashboard-header.spec.ts` asserts no button named Refresh or Retry in the banner. `expectSnapshotButtons` counts four fixed buttons, not five. `auto-refresh.spec.ts` stays green |
| With a snapshot shown, a failed check: the alert says automatic checks continue (or when they resume after a rate limit), offers no Retry, and the next successful check clears it | 2 | `auto-refresh-recovery.spec.ts` and `auto-refresh-rate-limit.spec.ts` assert the reworded text and no Retry button, then recover through `passTimeUntilChecked` |
| First read fails because `gh` is not logged in: the message says run `gh auth login`, then reload the page; reloading after logging in shows the work | 2 | `authenticated-project-overview.spec.ts`, `authenticated-read-boundary.spec.ts`, and `project-read-recovery.spec.ts` assert the new message, then restore access and `page.reload()` to see the published work |
| No prop, handler, style, test, or document remains whose only purpose was the control; launch reconciliation still triggers its fresh reads | 2 (removal), 1 (tests no longer need it) | The `rg` sweep below finds nothing; `npm run typecheck:dashboard` and lint pass; `responsive-session-reconciliation*.spec.ts` stays green, which exercises `readAfresh` |
| Tests that used the control only to make the page read again still prove their own promises | 1 | Each migrated spec green, with its original assertions kept |

**Removal sweep** (slice 2, recorded with its result):
`rg -n 'aria-label="(Refresh|Retry)"|name: "(Refresh|Retry)"|press(ing)? (Refresh|Retry)|onRefresh|isReadControl|focusReadControl|\.refresh\b|readControl' dashboard docs`
Expected: only the story review's own Refresh and other purpose-specific
Retry controls remain.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Automatic checks show newly published work and recover from a failed check without the button, and specs already prove that | Slices 1, 2 (replacement trigger, example 1–2) | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/auto-refresh.spec.ts dashboard/tests/auto-refresh-recovery.spec.ts dashboard/tests/project-keyboard-navigation-focus.spec.ts` in this worktree, with a clean environment (see Current decisions) | Passed (quiet reporter, exit 0) |
| A scheduled check driven by `pausePageClockAt` + `passTimeUntilChecked` replaces a Refresh press in a test that keeps in-page state (an open direction disclosure), including a failed check (`502`) and its recovery; `page.reload()` re-reads | Slice 1 (migration rule) | A throwaway spec, since deleted: open at A with the direction expanded, push B, `passTimeUntilChecked` → B shown, disclosure still open; `answerWith("main", unexplainedFailure)` + `passTimeUntilChecked(page, 502)` → alert shown, body still open; restore + check → alert gone; `page.reload()` → B | Passed |
| Hiding and showing the page without a paused clock is **not** a reliable test trigger: a second reveal sent no check | Slice 1 (excluded trigger) | Same throwaway spec without `pausePageClockAt`: the first reveal read B, but the second sent no heads check within 2 s | Observed. Do not use visibility toggling as the migration trigger |
| The fresh read keeps a live caller after the button goes | Slice 2 (keep, not delete, `refresh`) | `git grep -n readAfresh dashboard/src` → `ConfiguredDashboard.tsx:79`, `launchAttempts.ts:197`, `startupReconciliation.ts:113,198-214` | Confirmed |
| The control's accessible names are also matched in product code outside `SourceStatus` | Slice 2 | `git grep -n '"Refresh"\|"Retry"' dashboard/src` → `projectKeyboardNavigation.ts:127,141` | Confirmed: that branch goes with the button |
| About 33 test files press or assert the control; the story review's two specs use their own Refresh | Slice 1 sizing | `grep -rnE "(refresh\|retry)\)?\.(click\|press\|focus)\(" dashboard/tests` plus the `parts()` destructuring sweep | ~70 presses across ~33 files. `story-review-refresh.spec.ts` and `story-review-nothing.spec.ts` are excluded (own control) |
| Press-Retry wording lives in server messages and their spec expectations | Slice 2 | `git grep -n "press Retry\|pressing Retry"` → `server/readFailureMessage.ts:38-49` and 7 spec files; `PublishedReadFailure.tsx:42-48` | Confirmed |

## Ordered slices

### 1. Tests read published changes without pressing the control
Type: Structure
Status: done
Proof: Every migrated spec green with its original assertions; the control still exists and is still pressed only by specs that test the control itself (`refresh.spec.ts`, `read-failure-refresh.spec.ts`, `refresh-focus.spec.ts`, the control-specific steps of keyboard and header specs).

Internal change: in each spec or journey helper that presses Refresh/Retry
only to make the page read again (for example `direction-disclosure.spec.ts`,
`story-readiness-gaps.spec.ts` with `storyReadiness*.ts`,
`responsive-session-reconciliation*.spec.ts`, `story-dependencies.spec.ts`,
`backlog-preparing.spec.ts`, `queuedPlan*.ts`, `taken-*.spec.ts`,
`agent-roster-avatar.spec.ts`, `agent-launch-*.spec.ts`), replace the press
with the trigger the migration rule above selects. Add one shared helper only
if three or more specs repeat the same reload-and-wait or check-and-wait
sequence. Product behavior is unchanged.

Enables slice 2: removing the button then deletes only control-specific
tests and assertions.

Split point: if the migration overruns, split by spec family (story readiness,
sessions and launches, the rest) and keep each family green on its own.

Accepted proof: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts`
on every changed spec and every spec importing a changed helper (50 files,
96 passed), `--repeat-each=3` on the check-based specs (90 passed), and after
the refactor every spec importing `autoRefreshJourney.ts`,
`storyReadinessRefresh.ts`, or `storyReadinessAccessible.ts` (44 passed);
typecheck and lint pass. No shared helper was needed beyond `pausePageClock`,
which the refactor extracted into `autoRefreshJourney.ts`. The planned slice 2
change to `auto-refresh-recovery.spec.ts` (same-revision detail gap now
reloads) was done here.

### 2. The dashboard has no manual read control, and says how it recovers
Type: Behavior
Status: done
Proof: All rows of the proof table owned by slice 2; the removal sweep; `npm run typecheck:dashboard`; lint; the full dashboard Playwright suite once (see Current decisions).

Behavior: the dashboard is open → the developer looks at the banner and
meets read failures → no Refresh or Retry button anywhere in the source
status. Failure text says how the page recovers: automatic checks when a
snapshot is shown, otherwise reloading the page. Published progress still
arrives through scheduled checks.

Includes:

- Product: remove the button and its props from `SourceStatus.tsx`,
  `DashboardBanner.tsx`, and `ConfiguredDashboard.tsx`; the `.refresh` rules in
  `banner.css`; the read-control branch of `projectKeyboardNavigation.ts`; and
  stale comments in `publishedObservation.ts`.
- Wording (`server/readFailureMessage.ts`, `src/PublishedReadFailure.tsx`):
  "…, then press Retry." becomes "…, then reload the page." "Wait before
  pressing Retry." becomes "Wait before reloading the page." The failure alert
  keeps "As GitHub asked, automatic checks wait until <time>." and "Automatic
  checks continue every 15 seconds while this page is visible.", without the
  Retry sentence. With nothing shown, the alert says "Reload the page to read
  again."
- Tests: delete `refresh.spec.ts`, `read-failure-refresh.spec.ts`, and
  `refresh-focus.spec.ts`, after confirming that each remaining step only
  proved the control. Move any step that proves something else, such as an
  unchanged-revision check changing nothing, to a scheduled check instead.
  Remove `refresh`/`retry` from `parts()`, `readControl` from
  `expectSnapshotButtons`, and the Retry expectation from
  `expectProblemAndNoSnapshot`. Update keyboard and tab-order counts. Change
  "manual Refresh reads it at the same revision" in
  `auto-refresh-recovery.spec.ts` to a reload. Update every spec expecting the
  old wording.
- Documentation: `dashboard/README.md` (banner description, read and failure
  sections, the same-revision detail gap, the GitHub requests intro),
  `dashboard/GITHUB-REQUESTS.md` ("each load" without "each Refresh"),
  `dashboard/AGENT-LAUNCH.md:120` (drop "Refresh," from the list of controls
  still working), `docs/dashboard-navigation.md` (remove the manual-refresh
  guidance), and `docs/dashboard-ux-ui-north-star.md:179` (initial access
  failure: explain, then direct a reload). Leave its general "offer Retry
  where another retrieval may help" principle; other controls still follow
  it.

Accepted proof:

- Removal sweep result: only the story review's Refresh
  (`story-review-refresh.spec.ts`, `story-review-nothing.spec.ts`), the terminal
  theme's Retry (`terminal-theme-boundary.spec.ts`,
  `system-settings-terminal-theme.spec.ts`), the new no-Retry assertions
  (`auto-refresh-recovery`, `auto-refresh-rate-limit`,
  `authenticated-project-overview`), and the unrelated
  `savedSessionServices.refresh()` remain.
- `dashboard-header.spec.ts` asserts no banner button named Refresh or Retry
  at all four viewports; `expectSnapshotButtons` counts four fixed buttons.
- `auto-refresh-recovery.spec.ts` and `auto-refresh-rate-limit.spec.ts` assert
  the reworded alert and no Retry, then recover through `passTimeUntilChecked`.
- `authenticated-project-overview.spec.ts` and `project-read-recovery.spec.ts`
  assert the reload message, then restore access and `page.reload()`.
- Non-control steps of the deleted specs moved to scheduled checks:
  `auto-refresh-recovery.spec.ts` (a duplicate-listing backlog keeps A whole),
  `accessible-overview-keyboard.spec.ts` (reading/result/failure announcements),
  and `story-readiness-accessible.spec.ts` (the next read withdraws the
  "no longer listed" notice).
- The refactor renamed the observation's `refresh` to `readAfresh` and split
  the detail-gap tests into `auto-refresh-detail-recovery.spec.ts`.
- Typecheck and lint pass. Focused specs green, including
  `responsive-session-reconciliation*` (12 passed after the refactor). The full
  `npm run test:dashboard` ran 946 passed, 24 failed at load average ~60 on
  16 cores: Vite startup, socket hang-up, and timeout failures, mostly in specs
  this change does not touch. All 14 failing files reran green (41 passed)
  under the same load. Hosted CI holds the authoritative full-suite result.

## Current decisions

- **Clean environment for local commands.** This session inherits
  `NODE_ENV=production`, so `npm ci` skips devDependencies (vite, Playwright).
  Run `npm ci --include=dev`, or unset `NODE_ENV`, before local checks, as plan
  230 also records.
- **Local gates.** The pre-commit hook runs `npm run lint -- --staged`. Run
  `npm run typecheck:dashboard` and each slice's focused specs. Slice 2 deletes
  shared test parts (`parts().refresh`, `readControl`) that many specs import,
  so run the full dashboard suite (`npm run test:dashboard`) once at the end of
  slice 2. Hosted CI runs the rest after publication.
- **Assertions keep their promise.** A migrated test keeps every assertion
  about what the page shows. Only a press of the control, or an assertion about
  the control itself, may change.

## Learnings

- Control-only steps left for slice 2: `refresh.spec.ts`,
  `refresh-focus.spec.ts`, `read-failure-refresh.spec.ts`; the keyboard specs
  that focus the read control as the arrow-key starting point
  (`project-keyboard-navigation*.spec.ts`); `dashboard-header.spec.ts` icon
  test; the last Retry step of `read-failure.spec.ts`; the manual Retry steps of
  `auto-refresh-rate-limit.spec.ts`; `responsiveStart.ts` `expectOthersWork`;
  and `refresh`/`retry` visibility assertions in `storyReadinessRefresh.ts`
  (`expectFailedCheckKeepsPriorRevision`), `storyReadinessAccessible.ts`,
  `accessible-overview`, `project-read-recovery`, `auto-refresh-recovery`,
  `auto-refresh`, `project-read-isolation`, and `parts()` helpers.
- The removal sweep's `name: "(Refresh|Retry)"` also matches the terminal
  theme's own Retry (`terminal-theme-boundary.spec.ts`,
  `system-settings-terminal-theme.spec.ts`); that purpose-specific control stays.
- A scheduled check at an unchanged revision reads nothing; tests needing a
  same-revision read reload instead.
- `passTimeUntilAsked` gives up after 60 s of page time, so a longer directed
  rate-limit wait needs `checksAskedWhilePassing` first.
- Coordination with plan 230: this story is landing first, so 230 drops its
  Refresh/Retry icon rows.
