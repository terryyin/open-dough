# Give the frame's look checks one rule each

**Identity:** SEED-091#frame-look-checks-one-rule
**Source:** [correction story](../../seeds/SEED-091-dashboard-ui-renovation.md#frame-look-checks-one-rule),
a retrospective correction of
SEED-091#dashboard-frame-renovation ([story](https://github.com/terryyin/open-dough/blob/3c6e5e1002217db658f05c280b6362f3f08d2968/.planning/seeds/SEED-091-dashboard-ui-renovation.md#dashboard-frame-renovation),
[plan](https://github.com/terryyin/open-dough/blob/3c6e5e1002217db658f05c280b6362f3f08d2968/.planning/slice-plans/230-dashboard-frame-renovation/PLAN.md), at `3c6e5e10`).
**Prepared:** 2026-10-03 by the execution retrospective. Planning only; this
plan authorizes neither implementation nor publication.

## Provenance

The frame renovation ran from `1e2a057c` (claim `bb9cda47`) through
`fdcc45f6`, `11a34922`, `7af19c72`, `aeb9c33d`, `a6405bfb`, `b6509b22`, and
`a25a762f`. Its contract and accepted proof stay as recorded in its plan.

## Current findings

1. **One rule, three copies, two recognizers.** "The colour behind an element"
   is walked up the parent chain in three places in `dashboard/tests`:
   `expectReadableContrast` (`accessibleReading.ts`, older),
   `expectControlContrast` (`accessibleReading.ts`, added in `11a34922`), and
   the focus-outline check in `expectFrameIconControl` (`frameIconControl.ts`,
   added in `fdcc45f6`). Two copies recognise "nothing painted" only as
   `rgba(0, 0, 0, 0)` or `transparent`; `expectControlContrast` recognises any
   colour with zero alpha. A change to that rule needs three coordinated edits.
2. **Two divergent area checks.** `expectReadableAndRecognisable` exists in
   `system-settings-look.spec.ts` (`11a34922`) and `frame-launch-look.spec.ts`
   (`b6509b22`). They differ in which elements count as text and controls,
   whether hidden ones are skipped, whether a disabled control is exempt from
   control contrast, and whether an empty area fails. The queued story-card
   renovation ([plan 231](../231-story-card-information-radiator/PLAN.md) on
   `main`) will need the same check for cards and has no shared one to reuse.

## Outcome and boundaries

A maintainer finds one background rule and one area check in
`accessibleReading.ts`, used by every caller above. Each look spec still checks
what it checks today.

Preserved promises and constraints:

- No product (`dashboard/src`) change.
- No contrast threshold lowers and no checked element drops out of a check
  while it is checkable: the settings page's password field stays exempt only
  from text contrast, and an area with no controls still fails where it fails
  today.
- The rule for a disabled control: exempt from control contrast (WCAG 1.4.11
  exempts inactive components). This changes nothing observable in the
  settings checks, which run while nothing is busy (see premises).

Excluded: the race-shape work of SEED-093 on shared test support, the story
cards, and any new look assertion.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The three background walks are the only copies | Slice 1 | On `main` at `5f1a0e98`: `grep -n "parentElement" dashboard/tests/*.ts` | Three background walks: `accessibleReading.ts:101`, `:124`, `frameIconControl.ts:80`. The other walks follow other rules: `pageLayout.ts:11` and `:166` (layout and clipping ancestors), `accessibleReading.ts:42` (`politeRegionsOfferedThenMarked`) and `agent-launch-card-delete-problems.spec.ts:151` (whether a region is rendered and not hidden) |
| The two area checks are the only copies | Slice 1 | On `main`: `grep -rn "expectReadableAndRecognisable" dashboard/tests` | Defined only in `system-settings-look.spec.ts:26` and `frame-launch-look.spec.ts:38` |
| Settings controls are not disabled when the settings look checks run | Slice 1 (disabled exemption) | On `main`, read `OpenAISettings.tsx` (`disabled={busy}`), `AddProjectDialog.tsx` and `RemoveProject.tsx` (`fieldset disabled={submitting}`), and the new `TerminalThemeSettings.tsx` (theme `select` disabled while reading or saving; Retry exists only after a failed save). `system-settings-look.spec.ts`'s `openSettings` waits for the theme choice to be enabled before checking the "Terminal theme" region with the others | Confirmed by reading: nothing is busy, reading, or saving when the checks run, and no Retry is present. `system-settings-look` and `frame-launch-look` pass on `main` at `5f1a0e98` (6 tests), the settings check applying control contrast to every control with no disabled exemption |
| The proof list covers every caller of the changed checks | Slice 1 proof | On `main`: `grep -ln "expectReadableContrast\|expectControlContrast\|expectFrameIconControl"` across `dashboard/tests`, following `storyDependencyAccessible.ts` and `storyReadinessAccessible.ts` to their specs | The 12 specs listed in Slice 1's proof; `agent-terminal-keyboard.spec.ts` imports only `tooltipOf`. `read-failure-refresh.spec.ts` was removed in `2387fedc` |

## Ordered slices

### 1. One background rule and one area check
Type: Structure
Status: done

Move the background walk into one function in `accessibleReading.ts` with one
"nothing painted" recogniser, used by `expectReadableContrast`,
`expectControlContrast`, and `expectFrameIconControl`. Move one
`expectReadableAndRecognisable(area, …)` into `accessibleReading.ts`, taking
the text and control selectors each caller checks today, skipping hidden
elements, exempting disabled controls from control contrast and password
fields from text contrast, and failing an area with no controls when the
caller says it has some. Both look specs import it.

Proof: `npm run typecheck:dashboard`; under the clean environment,
`npx playwright test --config dashboard/playwright.config.ts --reporter=line`
over `system-settings-look`, `frame-launch-look`, `frame-overview-look`,
`frame-sessions-look`, `backlog-preparing`, `preparation-legend`,
`story-readiness-accessible`, `story-dependencies`, `dashboard-header`,
`agent-terminal-maximize`, `project-configuration`, and `system-settings`
green. One deliberate local probe, reverted before
commit, lowers a frame button's edge colour and shows the shared area check
still fails in both look specs.

Accepted proof: `npm run typecheck:dashboard` clean; the Playwright command
above selected 51 tests in 18 files (substring matching also selects the
`system-settings-*` and `project-configuration-boundary` specs), every named
spec among them, all passed. The probe set `.frame-button`'s border to
`var(--panel)` in `dashboard/src/frame-controls.css`: the shared area check
failed with "control contrast of Cancel" in `system-settings-look` (Add project
dialog) and "control contrast of Record" in both `frame-launch-look` area
checks, then was reverted. Locations: `painted`, `colorBehind`, and
`expectReadableAndRecognisable` in `accessibleReading.ts`; `settingsArea`
(`hasControls: true`) and `launchDialog` (`hasControls: false`) in the two
look specs.

Learnings: the background walk runs as one `evaluate` that returns every
background up the chain, and Node picks the first painted one, so no function
crosses into the browser. The two older walks now also treat zero-alpha
colours other than `rgba(0, 0, 0, 0)` as unpainted.

## Execution complete

Product advice: no change. The queued story-card renovation
([plan 231](../231-story-card-information-radiator/PLAN.md)) can now pass its
card selectors to the shared `expectReadableAndRecognisable` instead of copying
an area check.

## Current decisions

- Run npm and Playwright without the inherited `NODE_ENV=production` and
  `npm_*` variables, as the frame renovation's plan records.
- The pre-commit hook runs `npm run lint -- --staged`. Hosted CI runs the rest
  after publication.
