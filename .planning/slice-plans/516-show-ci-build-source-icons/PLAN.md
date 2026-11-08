# Show CI build sources with compact icons

**Identity:** SEED-265#show-ci-build-source-icons

**Source:** [Show CI build sources with compact icons](../../seeds/SEED-265-show-ci-build-source-icons.md#show-ci-build-source-icons)
**Source review:** [source-review.md](./source-review.md)

## Goal and boundaries

A developer scanning Intent's CI timing comparison can tell at a glance whether
each endpoint's timing came from a build at the requested revision or from an
ancestor build. Routine Build cells show compact source icons with accessible
labels for that distinction, keep timing columns on the selected builds, and
drop commit subjects, run and attempt IDs, and routine skip explanations from
the default row. Failed or cancelled runs, missing proof, and unexplained
absences keep a short visible explanation. Equivalent-build and later-trunk-build
selections stay concise wording under the same decluttering rule without new
icons. Selection and ancestor-walk rules, Summary comparison labels, entry
timing rows, and wall / without-waits columns stay as they are. Pygardon
per-file pytest timing is out of scope. The seed owns examples and exclusions.

## Current decisions

- **PFE.** The Build cell responsibility already lives in
  [`BuildIdentity` / `EndpointIdentity`](../../../dashboard/src/IntentCiComparisonEndpoints.tsx)
  and [`selectionWords`](../../../dashboard/src/storyCiComparisonWording.ts).
  Change that presentation rather than adding a parallel identity renderer.
  Reuse Intent's existing Lucide [`Icon`](../../../dashboard/src/Icon.tsx) plus
  visually-hidden / hover accessible wording pattern from
  [`CiEvidenceLabels`](../../../dashboard/src/CiEvidenceLabels.tsx); do not turn
  the Build cell into a full multi-label evidence strip.
- **Source cues.** Exact and ancestor selections each get one compact icon whose
  accessible name states the same distinction (including ancestor detail such as
  later revisions without a build when that remains useful for assistive tech).
  Equivalent and later keep short accessible words without run or attempt IDs
  in the default cell.
- **Declutter.** Routine Build cells stop showing commit subjects, run / attempt
  links and IDs, and routine Skipped explanations. Exceptional explanations
  (failed build, cancelled, missing proof, unexplained absence) remain visible
  as they do today.
- **Product intent.** Update
  [Intent CI timing comparison](../../../docs/dashboard-development-intent-ci-comparison.md)
  (and the matching Build-identity sentence in
  [Development and Intent](../../../docs/dashboard-development-intent.md) if it
  still describes the dense identity string) so lasting presentation matches
  delivery. No ADR change:
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
  keeps observation without ownership;
  [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps product-intent
  detail in the Intent docs.
- **Local verification.** Focused dashboard Playwright under
  `caffeinate -s -i` on AC power
  ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)),
  targeting the comparison identity specs this presentation owns.

## Outside-in proof

| Seed example | Owner | Required observation |
| --- | --- | --- |
| 1. Planning-only Baseline/Branch ancestor vs Landed exact | Slice 1 | With `publishSkippedPlanningBaseline` (or the story's equivalent planning-only comparison fixture), select the done story's CI timing comparison. Baseline and Branch Build cells expose ancestor-source accessible cues without run/attempt IDs or the routine Skipped explanation in the default cell; Landed exposes the exact-source cue the same way; wall / without-waits cells still show those builds' measurements. |
| 2. Every endpoint exact | Slice 1 | A comparison whose endpoints each have a build at the requested revision shows the exact-source accessible cue in each routine Build cell, without run/attempt IDs in the default cell. |
| 3. Failed selected build | Slice 1 | A failed build keeps a short visible failure explanation in the Build cell beside the source cue. |
| 4. Landed equivalent after confirmed skip | Slice 1 | `publishSkippedPlanningLanding` (or equivalent): Landed names the equivalent selection in concise accessible words without run/attempt IDs; no equivalent icon is required. |

## Decisive premises

Observed on 2026-11-08 in this preparation workspace at `cdb5f2d67` (assignment
base), macOS on AC, Node 24.21.0, after `npm ci`.

| Consuming operation | Form and observation | Result |
| --- | --- | --- |
| Slice 1 changes Build presentation through `selectionWords` / `BuildIdentity` | Scratch replaced the exact `selectionWords` string with `SCRATCH_EXACT_GONE`, then `caffeinate -s -i npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-ci-comparison.spec.ts -g "code landed before completion" --reporter=line`. Reverted the scratch afterward. | Failed expecting `"exact revision"`; received Build cell `… · SCRATCH_EXACT_GONE`. The comparison identity journey reads that wording, so presentation changes must update those assertions and related run-link expectations. |
| Slice 1's skipped / equivalent journeys are listed Playwright routes | `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts --list --reporter=list` | Seven tests listed under `[chromium]`, including planning-only Baseline skip and Landed equivalent-build cases. |

## Ordered slices

### 1. Compact Build source cues for exact and ancestor
Type: Behavior
Status: done
Proof: Seed examples 1–4 through the Intent CI timing comparison panel as in Outside-in proof; update the comparison identity specs that currently require `"exact revision"`, `"ancestor:"`, run links, and dense Skipped prose so they assert the compact cues and decluttering instead.

Behavior: A done story with a CI timing comparison is selected → each routine Build cell shows a compact exact or ancestor source icon with an accessible label for that distinction (or concise accessible words for equivalent / later), omits commit subjects, run/attempt IDs, and routine skip explanations from the default cell, keeps short exceptional explanations when present, and leaves timing columns on the selected builds' measurements.

Accepted proof (reuse):
- `caffeinate -s -i npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-ci-comparison-skipped.spec.ts --reporter=line` — planning-only Baseline+Branch ancestor, Landed exact, equivalent wording, declutter, walls (7 passed).
- `caffeinate -s -i npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-ci-comparison.spec.ts --reporter=line` — exact/ancestor cues and timings.
- Related identity surface (gaps, fast-forward, landing-gaps, cancelled*, retry, adapter*) passed after assertion updates; landing-gaps failed-build beside source cue; refactor retested adapter*, landing-gaps, retry after helper consolidation.
- Source review commitments 1–8e observed in `source-review.md`.

Learnings:
- `publishSkippedPlanningBaseline` needed a planning-only Branch tip over a built ancestor so example 1's Branch-as-ancestor holds without changing selection/walk rules.
- Recovery journeys assert source-cue presence, not exact selection — Baseline after walk is often ancestor.

## Concern evidence

- Slice-plan refinement: not needed — one Behavior slice owns one presentation outcome with mapped proof and no independent second outcome or Structure prerequisite.
- Remaining slice-specific concerns: none identified.
- Post-change refactor: consolidated Build-cue assertions into `expectCiComparisonSourceCue`; split CI status product intent into `docs/dashboard-development-intent-ci-status.md`.
