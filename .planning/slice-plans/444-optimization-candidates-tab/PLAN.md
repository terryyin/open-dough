# Review optimization candidates in a separate Intent tab

**Identity:** SEED-216#optimization-candidates-tab
**Source:** [selected story](../../seeds/SEED-216-optimization-candidates-tab.md#optimization-candidates-tab).

## Goal and scope

On the selected project's Intent page, a tab strip below the banner and above
Intent content chooses **Intent** (default) or **Optimization Candidates**.
Intent keeps the file browser with Purpose and Proof. Optimization Candidates
shows the existing Test Optimization Candidates report across the content area
without the file browser. The locations-column **Test Optimization Candidates**
control is removed. Opening a location from the report switches to the Intent
tab and shows Purpose (and Proof) as today, with return-to-entry when choosing
Optimization Candidates again.

Exclusions, from the story: URL deep-link for the tab choice; candidates record
format, read API, or report sections; a banner-level perspective beside
Development and Intent; Purpose/Proof layout redesign; banner redesign.

## Existing solutions and decisions

PFE:

- **Candidates report (reuse).** `IntentCandidatesRecord`,
  `authenticatedIntentCandidatesRead`, and the pinned
  `.planning/TEST-OPTIMIZATION-CANDIDATES.md` read stay the report body. No new
  server route.
- **View state (change, lift).** Today's `ReadingView` (`candidates` | `purpose`)
  and return-entry slug live in `IntentBrowser` with default `candidates` and a
  left-column button. Replace that with Intent-local tab state (**Intent** |
  **Optimization Candidates**), default Intent, owned above the browser so the
  candidates tab can omit the locations column.
- **Segmented control (reuse pattern).** Banner `PerspectiveSelect` /
  `project-select.css` radiogroup treatment for look and keyboard; Intent-only
  strip, not a third perspective. `projectKeyboardNavigation` already leaves
  `role="tablist"` alone if a true tablist is used.
- **Cross-open (extend).** `openFromRecord` already sets Purpose selection and
  return slug; point it at the Intent tab instead of a local `view`.

No North Star topic is added; the story follows the request's Intent-local
placement without changing
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
perspective set. Maintained documentation to update with behavior:
[Development and Intent](../../../docs/dashboard-development-intent.md).

## Domain rule

Intent has one reading mode at a time: **Intent** (locations + Purpose/Proof)
or **Optimization Candidates** (full-width report). Entering Intent selects
Intent mode. Choosing a location from the report selects Intent mode and that
file; choosing Optimization Candidates again restores the report and its
return entry. The report content and read path are unchanged.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Existing Intent candidates journeys pass here (baseline to extend) | Playwright Intent candidates journeys | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-test-optimization-candidates.spec.ts dashboard/tests/intent-test-optimization-candidates-states.spec.ts dashboard/tests/intent-test-optimization-candidates-open.spec.ts dashboard/tests/intent-test-optimization-candidates-case.spec.ts` in this workspace after `node scripts/setup-native.mjs npm` and `browser` | 8 passed (2026-11-02) |
| Which journeys rely on the locations-column candidates control and default-candidates view | Intent journeys after a scratch edit removing the left-column button and defaulting `ReadingView` to `purpose`; edit reverted | Same runner on `dashboard/tests/intent-*.spec.ts` and `dashboard/tests/development-intent*.spec.ts` | 10 failed, 21 passed: all four `intent-test-optimization-candidates*.spec.ts` files; `intent-gherkin-browse.spec.ts` (expects candidates default); `intent-selection-reads.spec.ts` (expects candidates control / default). Those are this slice's to rewrite for Intent default, the tab strip, and open-from-report via the Optimization Candidates tab |
| Helpers address the control as `button` named "Test Optimization Candidates" with `aria-pressed` | `dashboard/tests/intentPerspectivePage.ts`, candidates specs | Read | Located; slice updates helpers and specs to the tab control and Intent default while keeping the report region name |

No other premise is decisive: the report read path and open-into-Purpose
behavior are exercised by the baseline journeys above.

## Outside-in proof

Rewrite and extend the existing Intent candidates Playwright journeys (and the
two Intent browse/selection journeys that assumed candidates-as-default) so
they enter Intent on the Intent tab, choose **Optimization Candidates** for the
report, assert the file browser is absent there, and keep open-from-report plus
return-to-entry through the tab. Run each focused set with `--reporter=list`,
unsetting `NO_COLOR`/`FORCE_COLOR`, then all `dashboard/tests/intent-*.spec.ts`
and `development-intent*.spec.ts` before delivery.

## Ordered slices

### 1. Choose Intent or Optimization Candidates under the banner
Type: Behavior
Status: planned
Proof: rewritten candidates and default-view journeys above; Development /
Intent frame journeys unchanged.

Behavior: Enter Intent → **Intent** is selected; locations and Purpose/Proof
layout are available; the locations-column **Test Optimization Candidates**
control is absent → choose **Optimization Candidates** → the existing report
fills the Intent content area without the file browser → return to **Intent**
→ browser and Purpose/Proof again → from the report, open a location → Intent
tab selected with that file's Purpose (and Proof); choose Optimization
Candidates again → report focused on that entry. Update
[Development and Intent](../../../docs/dashboard-development-intent.md) for the
tab strip, Intent default, and removal of the locations-column control.

## Concern evidence

Refinement: not needed; one Behavior owns one proof loop, the domain rule is
one reading-mode switch, and the only Structure (lift view state above the
browser, reuse radiogroup pattern) belongs inside that Behavior.

Remaining slice-specific concerns: none identified in this review.
