# Simplify the project header and use a dropdown on narrow screens

**Source:** [Selected story](../../seeds/SEED-198-responsive-project-header.md#responsive-project-header)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-198#responsive-project-header

## Goal and scope

The project name identifies the project; at narrow widths it is also the one
project selector. Delete the title's source-information disclosure
(`dashboard/src/SourceStatus.tsx`) and everything that exists only for it, keep
the wide-screen tab-shaped choices, and replace the tabs at narrow widths with a
dropdown opened from the title. Scope, accepted consequence, deferred promises,
and key examples are in the source story.

**Exclusions:** Showing the read result visibly elsewhere; selector search or
grouping; rearranging Sessions, System settings, or the product mark beyond
what the compact header needs to fit; server or API changes (the disclosure
has none of its own).

## Existing solutions and decisive premises

PFE: reuse `ProjectSelect`'s selection callback, `useProjects`, the page-wide
arrow navigation in `dashboard/src/projectKeyboardNavigation.ts`, the banner's
`keepHeight` measurement, the existing native `<select>` pattern
(`LaunchHostModel.tsx`, `StoryReviewRunChoice.tsx`), and the `parts(page)`
locator map in `dashboard/tests/dashboardParts.ts`. Follow
[dashboard test guidance](../../../dashboard/tests/README.md). No Accepted ADR
constrains the header; ADR 0008's "source evidence" is the story-level domain
concept, not this panel.

Settled in this preparation checkout
(`claude/simplify-the-project-header-and-use-a-dropdown-o` at `9982f6f5`):

- `SourceStatus` renders only already-read `source` and `work` props; no API
  call, endpoint, or server processing serves it alone.
- Journeys use the panel's region (`parts(page).source`, about 150 assertions in
  ~65 files) mainly as evidence of the read revision and its retrieval `<time>`,
  and `parts(page).sourceEvidence` to open it.
- Surviving boundaries carry that evidence: the always-mounted read status
  (`PublishedReadStatus.tsx`) announces `shortRevision` (first 7 characters) and
  a retrieval `<time>` after a successful read; the failure alert
  (`PublishedReadFailure.tsx`) names the retained retrieval `<time>` and, after
  membership, the short revision. Fixture revisions (`"d0".repeat(20)` style
  and literal SHAs) differ within 7 characters, so short-form assertions still
  distinguish them.
- While a read is held or only a standing rate limit is shown, the status names
  no revision; those journey moments assert the shown snapshot by Board content
  or the status's "still the snapshot retrieved earlier" sentence instead.
- `isArrowOperatedControl` already exempts `<select>`, `listbox`, `menu`, and
  `combobox` targets from page-wide project cycling; its focus fallback targets
  the checked project radio, which is hidden at narrow widths after this story.

## Outside-in proof

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Journeys prove which revision was read through the surviving read status or failure alert, with product unchanged (story example 6) | Slice 1 | Every changed spec passes in focused runs (`npx playwright test --config dashboard/playwright.config.ts <files> --reporter=list`); `grep` finds no `parts(page).source` revision/time reads outside the header journey |
| Wide screen: plain level-1 title, tabs switch projects (example 1); disclosure and its exclusive support are gone | Slice 2 | `dashboard-header.spec.ts` wide journey; typecheck and build; full dashboard suite green |
| Narrow screen: title is the dropdown selector by touch and keyboard, Escape keeps the project, resize keeps selection, arrow cycling focuses the shown control (examples 2–5) | Slice 3 | `dashboard-header-compact.spec.ts` phone-width journeys (touch context and keyboard), plus resize; full dashboard suite and `npm test` green |

## Ordered slices

### 1. Published-read evidence at the surviving read status
Type: Structure
Status: done
Proof: focused runs of each changed spec pass; product code unchanged.

Change: add `parts(page)` accessors for the read status's announced revision and
retrieval time (and use the existing `problem` alert after failures), then move
every journey assertion and `retrievedAt` read that uses the source panel only
as read evidence to those accessors, asserting `shortRevision` forms. Leave the
header journey's disclosure-specific assertions for slice 2 to delete.
Enables slice 2 by leaving the disclosure without surviving-behavior consumers.

Accepted proof (reuse): `parts(page).readRevision` / `retrievedAt` re-export
product `shortRevision`; focused Playwright on changed specs (101) plus helper
consumers and accessible-board(+scroll) after split; residual source
revision/time reads only in `dashboard-header.spec.ts`; no `dashboard/src`
product edits.

### 2. Plain project title on wide screens
Type: Behavior
Status: done
Proof: wide-screen header journey (example 1); typecheck; build; full
`npm run test:dashboard`.

Behavior: wide screen with configured projects → page loads and Doughnut's tab
is chosen → the banner's level-1 heading is the plain project name (no
disclosure) and changes to Doughnut with Doughnut's work. Delete
`SourceStatus.tsx`, its banner placement, `.source`/`.source-evidence`/
`.source-note` styles, the banner's disclosure-only `focusin` re-measure if it
serves nothing else, the `sourceEvidence`/`source` locators and their
disclosure tests and helpers (including `dashboardPage.ts`'s pre-read
revision check) without negated replacements, and update the read-status
comment and `shortRevision`'s comment that cite the source evidence. Update
[navigation documentation](../../../docs/dashboard-navigation.md) to drop the
disclosure and its metadata promise.

Accepted proof (reuse): plain `h1.project-title`; header journey + typecheck +
build + touched-spec batch green; full suite 1732 passed with residuals that
also fail on clean HEAD (`production-watcher-failures` leftover deployments)
or pass on focused retry (session/sidebar flakes).

Accepted proof (reuse): plain `h1.project-title`; header journey + typecheck +
build + touched-spec batch green; full suite 1732 passed with residuals that
also fail on clean HEAD (`production-watcher-failures` leftover deployments)
or pass on focused retry (session/sidebar flakes).

### 3. Compact project selector on narrow screens
Type: Behavior
Status: done
Proof: phone-width header journeys for examples 2–5; full
`npm run test:dashboard` and `npm test`.

Behavior: phone width with five configured projects → the header shows the
current project's name as one dropdown-styled title control and no tab list →
touch or keyboard opens the configured projects with the current one indicated,
choosing one uses the existing selection (title and Board update), Escape
leaves the project and focus on the control, widening shows the plain title
with the matching tab and narrowing restores the dropdown, and page-wide arrow
cycling's focus fallback lands on whichever project control is shown. Choose
the breakpoint where the tabs stop fitting the banner. Update navigation
documentation for the responsive selector and touch/keyboard use.

Accepted proof (reuse): listbox-styled compact title at ≤400px;
`dashboard-header-compact.spec.ts` examples 2–5 + related phone callers
(`chooseProject` / `expectProjectChoice` / `shownProjectControl`);
typecheck/build; focused touched suite green. Full dashboard 1740/1750 with
residual `production-watcher-updates` ECONNREFUSED infra flake; `npm test`
green when observer env does not pollute managed-delivery gap tests.

## Story obligations

### G1. Deferred: making the read result visible elsewhere
Reported: slice 1 — "Deferred: making the read result visible elsewhere"
Story clause: "Making the read result visible elsewhere"
Disposition: excluded "Making the read result visible elsewhere"
Commitment: X2

### G2. Deferred: project search or grouping in the selector
Reported: slice 1 — "Deferred: project search or grouping in the selector"
Story clause: "project search or grouping in the selector"
Disposition: excluded "project search or grouping in the selector"
Commitment: X3

### G3. Deferred: moving other banner controls beyond compact fit
Reported: slice 1 — "Deferred: moving other banner controls beyond compact fit"
Story clause: "moving other banner controls (Sessions, System settings, product mark) beyond what the compact layout needs to fit"
Disposition: excluded "moving other banner controls (Sessions, System settings, product mark) beyond what the compact layout needs to fit"
Commitment: X4

## Current decisions

- CI repair after slice 1: Recently done fixtures now use clock-relative
  `retainedDoneAt()` so Done marks stay inside the 30-day launch retention
  window (calendar-fixed 2026-10-01 dates had aged out).

- A native `<select>` presented as the title is the default candidate for the
  compact selector: it gives the platform touch picker and keyboard behavior and
  is already exempt from page-wide arrow cycling. Execution may choose another
  accessible pattern if the title presentation needs it; the story's examples,
  not the component, are the promise.
- Removed disclosure tests are deleted, not converted into absence assertions.

## Concern evidence

Slice-plan refinement was not needed: three slices each own one proof loop,
slice 1 is preparation that slice 2 immediately consumes, and no boundary
fragments one result. This review identified no remaining slice-specific
concern. Slice 1 touches many journey files; its sizing is mechanical
replacement through one accessor, and journeys whose moment names no revision
use the settled Board-content fallback above.

## Execution complete

Product advice: Reasoned no-change. Deferred promises stay deferred. Near-future
Intent/Proof frame is orthogonal; SEED-199 already covers the next mobile
header/sessions step. No backlog edit.

CI disposition: run 41189249981 on `a2fe577f` failed only `dashboard (3/12)` at
Install npm dependencies with `npm source stalled: acquisition deadline
exceeded`; the other 15 jobs succeeded. Affirmative infrastructure evidence —
ignored without a product repair. Slice 3 product tip `c5927db4` was fully green.
CI repair on `eb1ee3e3` (run 41189798727): `test (2/3)` and `dashboard (4/12)` were npm acquisition stalls (infrastructure); `test (3/3)` missed `child-ready` within the 1s interrupt poll — wait widened to 5s in `tests/native-setup.sh`.
CI disposition: run 41190556182 on repair tip `d0c5bb86` failed only `dashboard (1/12)` and `test (3/3)` at Install npm dependencies with the same acquisition-stall message; ignored without a further product repair.
