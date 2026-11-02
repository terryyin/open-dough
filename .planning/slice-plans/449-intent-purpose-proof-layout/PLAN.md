# Read Purpose and Proof in tabs or remembered split panels

**Identity:** SEED-222#intent-purpose-proof-layout
**Source:** [selected story](../../seeds/SEED-222-intent-purpose-proof-layout.md#intent-purpose-proof-layout).
**Source review:** [source-review.md](source-review.md)

## Goal and scope

With a file (or nothing) selected in Intent, the reading area offers
**Purpose** and **Proof** tabs, Purpose chosen when Intent opens, and a
**Side by side** toggle beside them. Off, the chosen tab fills the reading
area and stays chosen across file selections. On, both show as two
independently scrolling panels, stacking Purpose above Proof where the
reading area is too narrow. The browser keeps the toggle as one browser-wide
disposable preference across perspective switches, reloads, later visits and
projects; without one, or where storage is refused, Intent starts with tabs
and a choice lasts for the page. Layout and tab changes never change the
selection, case position, Intent reading tab or selected story, and read
nothing again. Opening a recorded file from **Optimization Candidates** shows
Purpose positioned on its case.

Exclusions, from the story: keeping the chosen tab beyond the Intent reader's
lifetime, layouts for a location or folder Summary (unchanged, no tabs or
toggle), panel resizing, collapsing the tree, linked scrolling, per-project
choice.

Assumption: [Show CI status in an Intent tab](447-intent-ci-status-tab/PLAN.md)
(Taken) edits the same strip (`IntentModeTabs.tsx`) and reader
(`IntentBrowser.tsx`), adding a third reading tab and moving the reading mode
to a page-level per-project owner. Whichever lands second rebases onto the
other; this plan neither depends on nor blocks it. Plan 441's story-scoped
Purpose (a changed file's diff) renders inside the same Purpose panel.

## Existing solutions and decisions

PFE:

- **Kept preference.** `dashboard/src/keptPreference.ts` (`readKept`/`keep`)
  already keeps browser-wide view preferences (board position, sessions
  sidebar open and sizes) under `open-dough.*` keys and degrades to
  page-only when storage is refused, as ADR 0008's disposable browser
  storage allows. Reuse it with one new key; no new storage owner.
- **Tablist.** `dashboard/src/IntentModeTabs.tsx` holds the only Intent
  tablist: roving tabindex, `aria-controls`, and arrow/Home/End handling that
  `preventDefault`s so page-wide project cycling never sees the key. Extract
  that behavior into one shared Intent tablist component used by both the
  reading strip and Purpose/Proof, rather than a second copy (slice 1).
- **Reader.** `IntentBrowser.tsx` renders Purpose and Proof as stacked
  sections in `.intent-reading` (one scroll, `intent-perspective.css`). The
  file read, proof and case target already live outside the sections, so
  both layouts render the same answered read; no extra read is needed.
- **Refusing-storage journeys.** `board-kept.spec.ts` and
  `cursor-sessions-sidebar-size-unkept.spec.ts` show the established
  `Object.defineProperty(window, "localStorage", …)` pattern for example 6.

Architecture follows the seed's
[Architecture](../../seeds/SEED-222-intent-purpose-proof-layout.md#intent-purpose-proof-layout)
and the North Star's
[Purpose and Proof layouts](../../../docs/dashboard-ux-ui-north-star.md#purpose-and-proof-layouts):
the toggle is a browser-kept preference, the chosen tab is Intent reader page
state, and neither joins `intentWorkspaceSelection.ts`. No new North Star
topic is needed.

## Domain rule

One reader layout: `tabs` or `side-by-side`, read once from the kept
preference (absent or unusable → `tabs`) and kept on each toggle. In `tabs`,
exactly one of Purpose/Proof is shown (the chosen tab, `purpose` initially);
in `side-by-side`, both. Narrow stacking is presentation of `side-by-side`
(CSS by the reading area's width), not a third layout. Opening from the
candidates record sets the chosen tab to `purpose`. The rule applies only when
the selection scope is `file` or `none`; Summary is unchanged.

## Outside-in proof

| Example | Slice | Signal |
| --- | --- | --- |
| 1 tabs, Proof stays chosen across files | 2 | new `dashboard/tests/intent-purpose-proof-tabs.spec.ts`: Purpose chosen and visible, Proof hidden; choose Proof (click and ArrowRight) shows that file's proof; select another file: Proof still chosen with the new proof; keyboard keys do not change project |
| 8 candidates open shows Purpose | 2 | same spec: on Proof, open a recorded file from Optimization Candidates → Purpose chosen, case line positioned |
| 7 tab switch keeps selection, reads nothing | 2 | same spec: count file reads (route counter) across tab switches; selection mark and case position unchanged |
| 2 side by side, independent scroll, follows selection | 3 | new `dashboard/tests/intent-purpose-proof-side-by-side.spec.ts`: toggle pressed, both regions visible beside each other (bounding boxes); scrolling Purpose leaves Proof's box/scrollTop; select another file → both update |
| 4 narrow stacks | 3 | same spec at a narrow viewport: Purpose box above Proof, toggle still pressed; widen → side by side |
| 7 layout switch keeps selection, reads nothing | 3 | same spec: read counter and selection unchanged across toggles; off restores the previously chosen tab |
| 3 remembered across perspective and reload | 4 | new `dashboard/tests/intent-purpose-proof-kept.spec.ts`: on → Development → Intent still on; reload still on; off + reload → tabs with Purpose |
| 5 browser-wide across projects | 4 | same spec: on in one project, switch project → on |
| 6 no kept choice / storage refused | 4 | same spec: fresh context → tabs; refusing-storage context → tabs, on lasts until reload, no error |

## Ordered slices

### 1. One shared Intent tablist
Type: Structure
Status: done
Proof: existing reading-strip journeys unchanged —
`intent-test-optimization-candidates*.spec.ts` (keyboard strip,
open/return) and `development-intent-frame-keyboard.spec.ts`.

Internal change: extract `IntentModeTabs`' tablist rendering and keyboard
handling (roving tabindex, arrow/Home/End, `preventDefault`, focus of the
reached tab, tab/panel ids) into one Intent tablist component taking its
options, label and id prefix; the reading strip becomes its first user with
unchanged markup and behavior. Enables slice 2's Purpose/Proof tabs.

Accepted (2026-11-02): `dashboard/src/IntentTabs.tsx` (`IntentTabs`,
`IntentTabOption`, `intentTabId`, `intentTabPanelId`) renders only the
tablist; the caller owns its wrapper and tabpanels. `IntentModeTabs.tsx`
keeps `IntentMode`/`IntentModeTabs`; `IntentBrowser.tsx` uses the shared id
helpers. Proof: all 22 `*intent*`/`development-intent*` specs, 43 passed, plus
dashboard typecheck. Learning for slice 2: the shared classes are still
`intent-mode-tabs`/`intent-mode-tab`; rename them (e.g. `intent-tabs`) when
Purpose/Proof becomes the second user, in `IntentTabs.tsx`,
`project-select.css` and `intent-perspective.css` (no test selects them), and
give Purpose/Proof an `idPrefix` distinct from the strip's.

### 2. Purpose and Proof tabs
Type: Behavior
Status: planned
Proof: `dashboard/tests/intent-purpose-proof-tabs.spec.ts` (examples 1, 7
for tabs, 8); the 19 consumer tests in 8 specs the decisive premise names,
updated to choose **Proof** before reading it (one helper in
`dashboard/tests/intentPerspectivePage.ts`), green.

Pre-condition: Intent open with a file or nothing selected. Trigger: choose
tabs; select files; open from Optimization Candidates. Result: Purpose and
Proof as tabs of the shared tablist (Purpose first, chosen on mount) with
their tabpanels each holding the existing labelled section, so
`region "Purpose"`/`"Proof"` queries still find them when shown; the
unchosen panel is hidden; the chosen tab survives file selection; a candidates
open chooses Purpose. Location/folder Summary unchanged. Interim: until slice
3 there is no way to see both at once (accepted; slice 3 replaces it).
Docs: `docs/dashboard-development-intent.md` Intent section — Purpose and
Proof tabs replace "beside Purpose and Proof" wording.

### 3. Side by side panels
Type: Behavior
Status: planned
Proof: `dashboard/tests/intent-purpose-proof-side-by-side.spec.ts`
(examples 2, 4, 7 for layouts).

Pre-condition: tabs shown for a file. Trigger: press **Side by side**
(a keyboard-operable button with `aria-pressed`, beside the tabs); scroll;
select another file; narrow and widen; press again. Result: the tablist is
replaced by both labelled sections side by side, each scrolling on its own
(the reading area stops scrolling as one in this layout); case positioning
scrolls the Purpose panel; too narrow for two columns, they stack Purpose
above Proof with the toggle still pressed (container width, so the existing
52rem tree breakpoint and a wide tree both stack correctly); pressing again
restores tabs with the previously chosen tab. Choice lasts for the page in
this slice (interim, replaced by slice 4).

### 4. Remember Side by side in this browser
Type: Behavior
Status: planned
Proof: `dashboard/tests/intent-purpose-proof-kept.spec.ts` (examples 3, 5,
6).

Pre-condition: a layout choice. Trigger: switch to Development and back,
reload, switch project, open in a fresh or storage-refusing browser. Result:
the layout reads from and keeps to one browser-wide `keptPreference.ts` key
(e.g. `open-dough.intent.layout`); absent, unusable or refused → tabs, with a
choice lasting for the page and no error. Docs: Intent section says the
layout is kept in this browser like the dashboard's other view preferences;
remove "Purpose/Proof layout switching are not offered yet"; remove the North
Star's "Purpose and Proof layouts" section and repair its references
(`docs/dashboard-design-review.md` wording if it cites the open choice).

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Which existing journeys read Proof while Purpose is the shown tab (slice 2 sizing and consumers) | Every Intent and Development↔Intent journey | Scratch edit in `IntentBrowser.tsx` adding `hidden` to the Proof section (the tabs default), then `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list --workers=4` on all 25 `dashboard/tests/*intent*.spec.ts` and `development-intent*.spec.ts`, then revert (2026-11-02, at `54b644e6`) | 19 failed, 24 passed: `intent-cucumber-proof` (6), `intent-cucumber-proof-absent` (5), `intent-selection-reads` (3), `intent-entry-folder-proof`, `intent-entry-folder-summaries-folders`, `intent-gherkin-browse`, `intent-test-optimization-candidates-open`, `intent-test-optimization-candidates` (1 each). Each reads Proof via `getByRole("region", { name: "Proof" })`; slice 2 owns updating them through one "choose Proof" helper. No other consumer depends on both being visible |
| The file read, proof and case target are independent of the Purpose/Proof sections, so layout or tab changes read nothing | Examples 7 | `IntentBrowser.tsx`: the read effect depends only on `source`, `revision`, `selectedPath`, `scope`, `fileRetry`; sections render `text`/`selectedLocation.proof` | Settled by the effect's dependency list (a render-only change cannot trigger it); slices 2–3 still assert it with a read counter |
| Kept preferences are browser-wide and survive refused storage | Slice 4 | `keptPreference.ts` keys carry no project; `npx playwright test … dashboard/tests/board-kept.spec.ts` (2026-11-02, at `54b644e6`): 4 passed, including its refused-storage case at line 143 | True; reuse as is |

## Local gates

- Focused proof per slice as listed, run with
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`,
  with `/opt/homebrew/bin` first on `PATH`.
- Slices 1 and 2 change the Intent strip and reader every Intent journey
  loads; before publishing either, run all `dashboard/tests/*intent*.spec.ts`
  and `development-intent*.spec.ts` plus `npm run lint` and the dashboard
  typecheck. Before the final publication run the full `npm test` and the
  whole dashboard suite on the final state (project practice for shared
  runtime-path changes).
- Failing and flaky tests follow this project's policy as written in
  [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests);
  carry it, by link or verbatim, into every delegation and repair handoff.

## Current decisions

- Refinement (2026-11-02, seed): one browser-wide choice; narrow screens
  stack rather than fall back to tabs; persistence through
  `keptPreference.ts`; toggle named **Side by side**.

## Concern evidence

Slice-plan refinement was not needed: each slice has one proof loop, the
Structure slice sits directly before the Behavior it enables, and the domain
rule is one layout value with one chosen tab. This review found no remaining
slice-specific concern. Coordination with plan 447 is an ordinary rebase on
shared files, not a dependency.
