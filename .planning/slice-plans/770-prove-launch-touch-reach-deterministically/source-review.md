# Source review

Launch: a fresh general-purpose reviewer (no conversation inheritance) in the
execution coordinator session on 2026-11-22. Input: only the story's Goal,
Scope (including Direction and Scope limits) and Key examples from
[the seed section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#repair-refinement-touch-tap-hang),
with instructions to read no files, change nothing, and number independently
observable promises. Returned verbatim below.

Unnumbered context returned: the red-shard reason (Goal); the hit test as the
target a touch dispatch resolves to (Direction); a future touch handler needs
its own native case (Direction limit, not a check here); Scope 3 retirements
are conditional on no remaining use; the two other hosted flakes stay separate
work; Cancel's focus return and no-send and Codex's dialog naming are proved
elsewhere; Key example 1's setup order is an example sequence; the 7 s
baseline and "under the same load" describe measurement.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Native touch dispatch (`tap` → `commands.tapMountedControl` → Playwright `locator.tap`) no longer runs in `ad-hoc-refinement-touch.spec.ts` or `ad-hoc-start-session-answer.spec.ts`; a deterministic in-page touch check takes its place. (Scope 1; Goal; Direction) | slice 2 | observed: git grep finds no tapMountedControl, BrowserCommands or tap helper; both specs use touch() from launch-layout-page.ts with DOM activation (s2-launches.log, s2-group.log) |
| C2 | Touch reaches each launch control: the browser's own hit test at the control's centre lands on that control. (Scope 1; Goal; Direction) | slice 1 | observed: dashboard/frontend-tests/launches/launch-layout-page.ts touch(): elementFromPoint at centre inside the control or its label, used for every touched control in dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts; final-run1..5 pass |
| C3 | Rejection: when another element covers a launch control at its centre, the touch check fails and names the control. (Key example 3) | slice 1 | observed: scratch overlay on Explore's label failed with 'touch reaches Explore' (evidence break-cover2.log, reverted) |
| C4 | A touch-reached control is activated through a DOM click and the click's effect follows. (Scope 1) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts: touch(...).click() on launcher, Standard (toBeChecked), options and Explore (toBeChecked) |
| C5 | A touch-reached select is activated through a select `change` event, and the choice takes effect (Claude, Sonnet, Standard, Explore). (Scope 1; Key example 1) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts chooseByTouch: Codex names the dialog 'Start refinement in Codex', then Claude, then Sonnet (toHaveValue sonnet) |
| C6 | At 300 px height, with the caret inside the draft, a line inserted there appears at the caret, and later sizes keep it. (Scope 1; Scope 2; Key example 2) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts phone.short branch: insertAtCaret at the set caret, toHaveValue(draft) there and at the later portrait size |
| C7 | The proof still runs in headless Chromium with the touch context, coarse pointer and phone viewports. (Scope 1) | slice 1 | observed: dashboard/frontend.vitest.config.mts headless chromium with hasTouch (coarse pointer) unchanged; phone viewports via resizeLaunchViewport |
| C8 | The same dialog, instruction and model nodes survive each viewport change (portrait → landscape → 300 px → portrait). (Scope 2; Key example 1) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts per-view === identity check of dialog, instruction and model; remount-on-resize scratch failed on it (break-remount3.log, reverted) |
| C9 | After the sequence, the instruction holds the exact draft, the model is Sonnet, and the options show "Refinement options Explore (1)". (Scope 2; Goal; Key example 1) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts per-view toHaveValue(draft), model sonnet and 'Refinement options Explore (1)' across landscape, short, portrait |
| C10 | At restricted height (and through the rotation sequence), Cancel, Start and the folder note stay fully in view. (Scope 2; Key example 1) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts per-view toBeInViewport ratio 1 for Cancel, Start and the folder note |
| C11 | At restricted height, every control stays reachable. (Scope 2) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts per-view controlsAreReachable(dialog) plus touch(instruction) focus |
| C12 | At restricted height there is no sideways scroll. (Scope 2) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts per-view noSidewaysScroll(dialog) |
| C13 | Start is never called during the rotation and restricted-height refinement journey. (Key example 1) | slice 1 | observed: dashboard/frontend-tests/launches/ad-hoc-refinement-touch.spec.ts per-view expect(start).not.toHaveBeenCalled() |
| C14 | The Start session answer's direction toggle opens and closes from a touch-reached activation. (Key example 4) | slice 2 | observed: dashboard/frontend-tests/launches/ad-hoc-start-session-answer.spec.ts directionOpensBeneath: (await touch(directionToggle())).click() opens (content visible) then closes (not visible); passes in s2-launches.log and s2-group.log |
| C15 | Toggling the direction does not move the row's parts. (Key example 4) | slice 2 | observed: dashboard/frontend-tests/launches/ad-hoc-start-session-answer.spec.ts directionOpensBeneath: parts.map(box) equals closed after each click and noSidewaysScroll(row()); passes |
| C16 | The spent `tap` helper is retired. (Scope 3) | slice 2 | observed: dashboard/frontend-tests/launches/launch-layout-page.ts: tap, BrowserCommands declaration and commands import deleted; typecheck passes (s2-typecheck.log) |
| C17 | The `openRefinement` touch flag is retired. (Scope 3) | slice 1 | observed: dashboard/frontend-tests/launches/refinement-launch-page.ts openRefinement takes an open callback; touch flag gone; ad-hoc-launch-dialog.spec.ts default click passes (consumers.log) |
| C18 | The `tapMountedControl` runner command and its 5 s diagnostic bound are retired. (Scope 3) | slice 2 | observed: dashboard/frontend.vitest.config.mts: tapMountedControl command, comment and 5 s bound deleted; whole frontend group 453 tests pass (s2-group.log) |
| C19 | The proof gives the same result on every run, locally and on hosted CI; 50 consecutive runs pass on hosted amd64 with no retry. (Goal; Key example 5) | slice 2 | observed: Touch probe run 44998661869 on 6bbed190: 5 ubuntu-24.04 jobs x 10 runs, 50/50 passed, 250 case results all passed, no retry configured; CI run 44998661783 success |
| C20 | Each case finishes well under a second; locally the refinement case drops from about 7 s to about 0.3 s under the same load. (Goal; Direction; Key example 5) |  | G1 |
