# Announce the chosen value of a compact dropdown

**Identity:** SEED-418#announce-compact-dropdown-choice

**Source:** [Announce the chosen value of a compact dropdown](../../seeds/SEED-418-review-published-session-changes.md#announce-compact-dropdown-choice)

## Provenance

Retrospective correction of SEED-418#review-scope-dropdown (Choose review
scope from a compact dropdown), executed in plan 878
(`c287e9b66:.planning/slice-plans/878-choose-review-scope-from-a-compact-dropdown/PLAN.md`)
on branch `claude/choose-review-scope-from-a-compact-dropdown`: `94d967754`
(shared compact select behind Project), `0c7a1f771` (Intent's **Review
scope** dropdown), `392ecc8c4` (ad hoc titles). The finding is inherited
from the Project dropdown and was raised as product advice in plan 878's
**Execution complete**. Terry chose this correction and queues it ahead of
SEED-418#show-selected-session-in-review-home (plan 877).

## Current findings

Read at `c287e9b66`.

1. `CompactSelect.tsx` renders the closed control as a `<button>` with
   `aria-label={name}` (line 140). For a button, `aria-label` replaces the
   name computed from its contents, so the closed control's accessible
   name is exactly "Project" or "Review scope". The chosen project, the
   chosen scope's title and the ad hoc icon's name "Ad hoc"
   (`IntentScopeSelect.tsx:18`) are not announced. The open list's options
   expose them, for example "Ad hoc <title>".
2. Readers locate the closed control as `getByRole("button", { name:
   "Project" | "Review scope", exact: true })`. The consumer trace at
   `c287e9b66` with terms `compact-select-button`, `projectCompact`,
   `"Review scope"` and `name: "Project"` found these button readers:
   `dashboard/test-support/dashboardParts.ts:16` (`projectCompact`, used by
   `projectChoice.ts` and its E2E and mounted callers),
   `dashboard/test-support/reviewChangesComparison.ts:155`,
   `dashboard/frontend-tests/intent/intent-story-compare-page.ts:45`,
   `dashboard/frontend-tests/navigation/dashboard-header-reading.ts:22`,
   `development-intent-frame.spec.ts:70`,
   `development-intent-frame-sessions.spec.ts:70`,
   `accessible-board-touch.spec.ts:72`,
   `configuration/dashboard-system-appearance.spec.ts:219` and
   `sessions/recently-done-sessions-select-mount.spec.ts:119`. The
   `radiogroup` and `listbox` readers named "Project" (the wide-banner
   radio fallback in `ProjectSelect.tsx:36` and the open lists) are
   unaffected. `pageLayout.ts` and `projectKeyboardNavigation.ts` reach the
   control by class, which stays.

## Preserved promises and constraints

- Everything SEED-418#review-scope-dropdown delivered: touch and keyboard
  opening, highlight without commit, Enter/Space/click commit, Escape and
  outside pointer keeping the choice and returning focus, phone-width fit,
  choosing by the existing session key, the ad hoc icon and own title,
  **Title unavailable** with the close time.
- Project selection: page-wide arrows (`projectKeyboardNavigation.ts`),
  the wide-banner radio fallback, banner sizing, the `data-project-id`
  attribute and the existing classes.
- Both controls keep their names "Project" and "Review scope"; only the
  role changes and the chosen value becomes announced.

## Current decisions

- Use the WAI-ARIA select-only combobox pattern by adding
  `role="combobox"` to the existing `<button>` in `CompactSelect.tsx`,
  keeping its `aria-label`, `aria-haspopup="listbox"`, `aria-expanded` and
  `aria-controls`. The native button keeps keyboard and touch activation,
  so no interaction code changes. Do not change the open listbox.
- Locate the closed control as `getByRole("combobox", { name, exact:
  true })` in each reader above. Page objects keep owning where the
  control lives (`dashboardParts.ts`, `reviewChangesComparison.ts`,
  `intent-story-compare-page.ts`, `dashboard-header-reading.ts`); update
  inline spec locators in place or route them through the existing part
  when the spec already imports it.
- Under [AGENTS.md](../../../AGENTS.md), apply
  [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and
  [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md)
  to changed tests and page objects.

## Ordered slices

### 1. The closed compact dropdown announces its chosen value

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

A developer using a screen reader reaches the closed **Project** and
**Review scope** controls as comboboxes named by their label whose value is
the chosen project or scope; an ad hoc scope's value begins with "Ad hoc".
Add `role="combobox"` in `CompactSelect.tsx` and update the readers listed
in finding 2.

Proof: In the mounted narrow ad hoc case of
`dashboard/frontend-tests/intent/intent-session-scope-titles.spec.ts`,
observe through the review page object that the closed **Review scope**
combobox's accessible snapshot shows the "Ad hoc" image and the chosen
title (for example `toMatchAriaSnapshot`), before and after a touch choice.
In `dashboard/frontend-tests/navigation/dashboard-header-compact.spec.ts`,
observe the closed **Project** combobox showing the chosen project after a
commit and after Escape. The existing behavior cases in those files and in
the readers above prove the preserved promises once their locators use
the combobox role. Replay the E2E journeys that drive either compact
control through the changed page objects.

Accepted proof: `intent-session-scope-titles.spec.ts` snapshots the closed
**Review scope** as `combobox "Review scope": /Execution — .+/` before the
tap (the starting scope is a published session, so it carries no "Ad hoc"
image) and as `combobox "Review scope"` holding `img "Ad hoc"` and the
chosen title after the touch choice. `dashboard-header-compact.spec.ts`
snapshots `combobox "Project": Open Dough` after Escape and `combobox
"Project": Pygardon` after Enter. Local gate on AC power under
`caffeinate`: the plan's frontend pattern passed 485 tests in 200 files;
14 E2E journeys passed 25/25 under the strict reporter (the plan's five,
side-panel-content-switching and -replacement, backlog-preparing,
preparation-legend, cursor-sessions-sidebar-layout and -resize-lasting,
sessions-sidebar-touch, recently-done-sessions-select-ad-hoc and
-ad-hoc-development); typecheck passed. The refactor routed the five specs'
inline closed-control locators through `compactProject` and added
`showsChosenProject` to `dashboard-header-reading.ts`; those five specs
reran and passed (12 tests). Learning: Vitest browser
`toMatchAriaInlineSnapshot` accepts regex values for locale-formatted text.

## Execution complete

Product advice: no change. Both closed compact dropdowns now announce
their chosen value; SEED-418#show-selected-session-in-review-home (plan
877) remains the next queued work.

## Decisive premises

| Premise | Consuming operation and observation |
| --- | --- |
| A `<button role="combobox" aria-label=…>` keeps its label as the accessible name and exposes its contents, including a nested `role="img"` name, as the value. | At `c287e9b66`, Node 24.21.0 with the worktree's Playwright 1.65.0 Chromium, a scratch page held `<button type="button" role="combobox" aria-label="Review scope" aria-haspopup="listbox" aria-expanded="false"><span role="img" aria-label="Ad hoc">*</span> Fix the long title</button>`. `ariaSnapshot()` gave `combobox "Review scope"` with children `img "Ad hoc"` and `text: Fix the long title`; `getByRole("combobox", { name: "Review scope", exact: true })` matched one element; CDP `Accessibility.getFullAXTree` reported name "Review scope" and value "Ad hoc Fix the long title". The same held with `aria-labelledby` pointing at a hidden label. |

## Proof ownership and local gate

| Observable promise | Slice |
| --- | --- |
| Closed **Review scope** announces the chosen scope and its ad hoc identity | 1, mounted narrow ad hoc case |
| Closed **Project** announces the chosen project, kept through Escape | 1, mounted compact header case |
| Preserved dropdown, Project and Intent scope behavior | 1, existing readers on the combobox role |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run the installed consumer trace again on the actual diff (`--base HEAD`
plus the terms in finding 2) and give every located consumer a
disposition. On fully awake macOS on AC power, run:

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard:frontend -- '(intent/|navigation/|configuration/(dashboard-system-appearance|project-hide-selection|system-settings-navigation)\.spec\.ts$|sessions/recently-done-sessions-select-mount\.spec\.ts$)'
OPEN_DOUGH_E2E_PROOF_RECORD=<tmp> caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- "${compact_select_e2e:?}"
npm run typecheck:dashboard
```

Set `compact_select_e2e` to the E2E journeys the trace shows reaching the
closed control, at least `intent/intent-session-scope`,
`intent/intent-published-range-source`,
`sessions/recently-done-published-sessions`,
`configuration/project-hide` and `configuration/project-hide-sessions`,
and the narrow banner journeys plan 878 replayed.

## Plan review

Slice-plan refinement was not needed: one Behavior slice changes one
attribute shared by both dropdowns and the locators that read it, with its
own proof loop. No slice-specific concerns remain.
