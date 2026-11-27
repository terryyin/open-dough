# Choose review scope from a compact dropdown

**Identity:** SEED-418#review-scope-dropdown

**Source:** [Choose review scope from a compact dropdown](../../seeds/SEED-418-review-published-session-changes.md#review-scope-dropdown)

## Goal and scope

Let a developer recognize and change the active Intent review scope with a
compact, accessible picker on a narrow screen. Show the retained ad hoc title
when available and the close time with **Title unavailable** when the
published record is all the machine has. One choice continues to drive the
review comparison.

The [supplier plan at preparation](https://github.com/terryyin/open-dough/blob/dd230d27180104830d0509a039cb68478d59d1ca/.planning/slice-plans/876-open-session-changes-in-intent/PLAN.md) owns
delivery of the Intent session list, selection, entry points and comparison.
The seed's dependency agreement governs the start. Use the supplier's landed
implementation and proof when executing. The dropdown delivers single-session
and whole-story selection. Combined comparisons, ad hoc details on Intent
Home and review status are separate stories.

## Current decisions

- Use the existing Project dropdown's distinction between a highlighted
  option and a committed choice. A responsive radio/dropdown pair would
  introduce two interaction paths for the same choice. Returning to session
  cards would interrupt review. The useful part of an IDE quick switcher is
  the ability to inspect choices before committing one. This picker offers
  a bounded set from the current story, so search is outside the increment.
- Share the compact dropdown's keyboard and pointer behavior from
  `ProjectSelect.tsx`. Keep project sizing, banner styling and page-wide
  arrows with Project selection. The new Intent control has its own slot and
  long-title layout. Expose stable option identities, accessible names and
  rendered labels at that seam. A plain text option cannot carry the
  requested named ad hoc icon. Keep review and project domain logic with
  their owners.
- Reuse the supplier's deduplicated session entries and scope action. An
  ad hoc name comes from `launchSubject(retained.request).title` when the
  retained launch provides a title. The published-only option uses its
  workflow and close time. Supply its existing session identity to the scope
  action even if another option looks the same. There is one session join,
  one review selection and one comparison path. The developer chose to
  keep titles local.
- [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  governs Intent's shared scope and the boundary between published and
  machine-local facts. [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-ui-vocabulary)
  carries those Dashboard terms into the picker and its proof.
  [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  calls for one active scope and comparison across Intent surfaces.
- Mount production components at typed review and listing boundaries under
  [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Preserve the supplier's real second-machine route through its E2E proof.

## Decisive premises

| Premise | Consuming operation and observation |
| --- | --- |
| The Project dropdown supplies a reusable confirm-or-dismiss interaction. | At `10a0f8498`, with Chromium in the owned checkout, `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT npm run test:dashboard:frontend -- '(navigation/dashboard-header-compact\|review/published-session-subject)\.spec\.ts$' --workers=1` passed 11 cases. The Project cases observed touch switching at phone width, Escape preserving the choice and focus, Enter applying the highlighted project, and page-wide navigation. The long-label Intent layout and its selection are new proof. |
| The picker can use a retained title while still identifying the published session. | At `dd230d271`, Node 24.21.0, passed a synthetic completed ad hoc launch with a distinct title and reporting reference through `sessionListing`, `launchSubject` and `reportingReferenceOf`. Parsed the checkout's `ebda0c29-0d23-4fe9-a0f2-650e7dc4a552.json` with `publishedRecordFromText`. The local listing preserved the exact title and matched UUID. The parsed published input provided workflow and close time and carried no title. The supplier owns exposing this association in the Intent list. See also [Intent Home's retained-launch observation](https://github.com/terryyin/open-dough/blob/dd230d27180104830d0509a039cb68478d59d1ca/.planning/slice-plans/877-show-selected-ad-hoc-session-on-intent-home/PLAN.md#decisive-premises). |

The same mounted runner on `dd230d271` passed 21 cases in six files with
one Chromium worker. The Project header and Development/Intent frame
observed layout and project switching. The Intent Done comparison cases
observed landed-run switching and whole-story comparison, and the published
session cases observed UUID-addressed listing and comparison.

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT npm run test:dashboard:frontend -- '(navigation/(dashboard-header(-compact)?|development-intent-frame(-sessions)?)|intent/intent-story-compare-done|review/published-session-subject)\.spec\.ts$' --workers=1
```

## Ordered slices

### 1. Share the existing compact selection behavior

Type: Structure
Status: done
Estimate: 12–15 active minutes.

Separate the compact Project dropdown's listbox, highlighting, commit and
dismiss interactions from its project catalog adapter in
`dashboard/src/ProjectSelect.tsx` (247 lines at `dd230d271`). Move those
mechanics cohesively. Preserve the Project root and button classes, project
ID attribute, named roles, focus, committed value and radio fallback so
banner styles and `projectKeyboardNavigation.ts` keep working. Shared
selection is the seam immediately used by slice 2. Keep changed files
within the installed [file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).

Proof: Keep the existing mounted Project header and frame checks green. They
observe the resize and touch path, keyboard cancellation and confirmation,
page-wide arrows and the project switch while reading Intent. Trace the
production selectors and banner layout through `pageLayout.ts`,
`dashboardParts.ts` and their enclosing test readers. Run affected E2E
project-hide and narrow banner journeys for any changed contracts they read.

Delivered: `dashboard/src/CompactSelect.tsx` is the shared generic select
(`{ id, label: string }` options, `onCommit(option)`); `ProjectSelect.tsx`
passes its projects through. Project DOM is unchanged. Slice 3 widens the
option label to a rendered node with its own accessible name. Proof: the
local-gate navigation run plus `project-keyboard-navigation.spec.ts`, 14
passed, and the dashboard typecheck. The consumer trace found no changed
contract for the E2E project-hide or narrow banner journeys. CI repair:
`intent-story-compare-done.spec.ts` now waits for the location reads that
follow the shown review (raced in CI run 45980462617).

### 2. Choose the story or session from the compact Intent picker

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

When a story opens at **Whole story**, or a session card opens Intent with
its session selected, the compact picker identifies that choice and exposes
the supplier's available scopes. A developer can open it by touch or
keyboard, read the list within the available width, dismiss without changing
the comparison, or confirm a choice and see its comparison in place.
Keep the selected scope in the supplier's state. This slice uses the
supplier's existing names until slice 3 delivers ad hoc labels.

Proof: Extend the supplier's mounted Intent session-scope checks in
`dashboard/frontend-tests/intent/`. Use the production picker and actual
scope state. Supply the supplier's typed story and completed-session
entries, and story and published-session comparison answers with distinct
files at the existing dashboard reads. From the session-card entry,
observe the selected label and session file, Escape returning focus and
preserving both, then confirmation switching to the whole-story file and
label together. At phone width verify the picker and opened list fit the
available space and a touch selection visibly applies the chosen
comparison. Update the supplier's actual scope page object and replay its
E2E journey through the dropdown.

Delivered: `IntentScopeSelect.tsx` ("Review scope") replaces the Sessions
radio group. The shared dropdown look moved to `compact-select.css`, and
`banner.css` keeps Project's own rules. The mounted board frame has no Files
tree, so mounted cases tell comparisons apart by summary name and file count.
The E2E journey observes file names. Proof: the whole `intent/` mounted group
plus the navigation gate (365 passed); E2E intent-session-scope,
intent-published-range-source, recently-done-published-sessions and the
side-panel content journeys; the Project banner, sidebar and project-hide
E2E readers; typecheck.

### 3. Identify an ad hoc session by its own title

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

An ad hoc option with a retained title shows that title and a simple icon
with an accessible name. In the open list, display long titles in full so
the reviewer can choose the intended follow-up. The closed control fits
and communicates the selected title. When the retained title is absent,
show **Title unavailable** and the published close time if present. Both
forms select the option's existing identity and comparison.

Proof: Extend the narrow mounted Intent journey with several long retained
titles and distinct comparison answers. Match the complete open-option
title and accessible ad hoc identity. Select the intended title by touch
and observe its own closed label and file, including when another title has
the same opening words. In the supplier's published-only case with no
retained launch, verify the missing-title label and close time, select the
option, and observe its recorded comparison. Adapt reached supplier
assertions that relied on the former ad hoc name.

Delivered: `SessionScope` carries `adHoc`. The session join labels an ad hoc
session with its retained launch title, or **Title unavailable — close
time** when only the published record is present. A compact option's
`label` is a rendered node, and Intent prefixes ad hoc labels with an
`img` named "Ad hoc". A retained launch always carries a non-empty title,
which its request schema requires. Proof:
`intent-session-scope-titles.spec.ts` (long titles sharing opening words,
touch at phone width, published-only title unavailable), the `intent/`
mounted group plus navigation (367 passed), and the reached E2E journeys.

## Proof ownership and local gate

| Observable promise | Owning slice |
| --- | --- |
| Existing Project behavior survives sharing selection mechanics | 1, existing compact Project and enclosing frame readers |
| Whole-story default, preselected session, and in-place selection at phone width | 2, mounted Intent and supplier E2E entry paths |
| Focus and comparison survive dismissal and a committed choice changes comparison | 2, mounted keyboard journey |
| Long ad hoc titles readable before choosing, selected title fits and ad hoc identity is accessible | 3, mounted narrow touch journey |
| Missing local title is explicit, close time identifies the option and its comparison remains usable | 3, published-only journey without retained launch |

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and the MakeMe and page-object selection under [AGENTS.md](../../../AGENTS.md).
Use the installed consumer trace with the old picker roles, labels and
selectors as terms. Review the affected Project banner and page-wide
navigation readers, supplier scope and comparison readers, and Intent
layout and proof readers that observe those controls. Keep evidence for
the final commands and results with the plan.

Run on fully awake macOS on AC power. Set `intent_scope_specs` and
`intent_scope_e2e` to the focused file patterns traced from the supplier's
landed code and the actual diff. Include the narrow Project journeys in
`intent_scope_e2e` when the change reaches their assertions.

```sh
caffeinate -s -i npm run test:dashboard:frontend -- 'navigation/(dashboard-header(-compact)?|development-intent-frame(-sessions)?)\.spec\.ts$'
caffeinate -s -i npm run test:dashboard:frontend -- "${intent_scope_specs:?}"
caffeinate -s -i npm run test:e2e -- "${intent_scope_e2e:?}"
npm run typecheck:dashboard
```

## Plan review

Slice-plan refinement was unnecessary. The Structure slice preserves
Project behavior at the seam the next slice uses. The first Behavior
delivers a usable picker with the supplier's names. The second adds the
ad hoc title and missing-title behavior through that same list and
selection. No slice-specific concerns remain.

## Execution complete

Local gate at `392ecc8c4`: the `intent/` and navigation mounted groups, with
`project-keyboard-navigation`, passed 372 tests. These E2E journeys exited
0: intent-session-scope, intent-published-range-source,
recently-done-published-sessions, side-panel-content-switching and
side-panel-content-replacement; backlog-preparing and preparation-legend;
cursor-sessions-sidebar-layout and cursor-sessions-sidebar-resize-lasting;
sessions-sidebar-touch, project-hide-sessions and project-hide. The
dashboard typecheck passed.

Product advice:
- The closed compact dropdown names only its control ("Project", "Review
  scope"). Its button `aria-label` overrides the chosen value and the ad hoc
  icon, so screen readers don't hear the current scope. This was inherited
  from the Project dropdown. A select-only combobox pattern in
  `CompactSelect` would fix both, but it changes the established Project
  name that several specs read. This needs a developer decision on a small
  SEED-418 correction ahead of 877.
- Plan 883 still describes the Sessions radio group. Refresh it against the
  dropdown and `intent-session-review-mount.ts` when it is next prepared.
- Plan 877 should reuse `SessionScope.adHoc`, the title derivation in
  `followUpSessions.ts` and the exact **Title unavailable** wording.
- Process review is deferred into wrap-up after the Intent Coverage check.
