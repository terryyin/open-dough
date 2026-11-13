# Read CI history at a glance

**Identity:** SEED-331#read-ci-history-at-a-glance
**Source:** [Story](../../seeds/SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance)
**Source review:** [source review](source-review.md)

## Goal and scope

A developer reviewing a Done story in Dashboard Intent, or test timing in
Project Intent, reads CI history from one chart and a few figures: how the
landing compares with recent builds, which builds failed or have no usable
timing, and how test execution time moved for an entry, folder, or file. The
story's Views, History design and response, Scope limits, and Key examples
are the source; this plan does not restate them.

Included: the shared chart's failed row, unavailable marks and per-mark
readouts; the Done CI wall-time reference placed between the endpoint
comparison and the by-entry table; history above the table in entry and
folder Summaries and above file Proof, with a Test cases/Test file choice;
one compact readout replacing evidence lists and methodology paragraphs in
those views; a slim selected and scoped history response that the current
reader requests explicitly; the three maintained docs the story names, plus
[scope reference](../../../docs/dashboard-development-intent-scope-reference.md)
which describes the same scope history.

Excluded: Project Intent's top-level CI status history keeps its lists and
richer response; the story CI follow-up reading keeps its saved reference
membership list. Measurement eligibility, retention, cohort selection,
reference math and the follow-up ledger stay unchanged. Browsing acquires no
CI evidence. The [mockup](../../seeds/SEED-331-read-ci-history-at-a-glance/ci-history-mockups.html)
is illustrative; its sample values are not fixtures.

## Architecture and existing solutions

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
history stays a derived local read of retained evidence. No North Star topic
governs this presentation and none is added; the story's Architecture section
is the direction.

PFE at `4a4799bf5b791ae5cae6600791840858f5d33a4b`:

| Responsibility | Existing owner and decision |
| --- | --- |
| Dated chart | Extend `IntentCiHistoryChart.tsx` / `IntentCiHistoryPlot.tsx` (226 lines) and `ciHistoryChart.ts`. Segments already break the line; the selected point and dashed reference exist; readouts are SVG `<title>` only and gaps draw nothing except a selected-gap annotation. Add gap marks (failed row, hollow unavailable) and an inspectable readout once, for every series. If the plot passes 250 lines, split mark drawing from axis/scale layout along that seam in slice 1. |
| Compact readout | Change `IntentCiPriorBuildReference.tsx`'s metrics into the compact order (selected, prior average and count, signed elapsed and percentage). Reuse `storyCiRelativeChange.ts` direction and the `--ci-cue-faster`/`--ci-cue-slower` tokens in `intent-ci-cues.css` rather than new colors, keeping CI cue wording consistent. `IntentCiFollowUp.tsx` also renders these metrics and keeps `PriorBuildReferenceEvidenceList`. |
| Evidence lists | Stop composing `PriorBuildReferenceEvidence` (Done) and `PriorBuildReferenceEvidenceList` (scope wrapper `IntentScopePriorBuildReference.tsx`) and the scope `Builds and evidence` list (`IntentScopeTimingHistoryEvidence.tsx` list use). Keep the list module for the follow-up reading; delete code only the removed views used. |
| History lifecycle | Reuse `useIntentCiEndpointHistory.ts` (retain last success on failure, discard on endpoint change) for both Done and scope history. The Done reference's hook owner stays mounted in `IntentCiComparison.tsx` across reading/failed/unavailable/shown states; only its rendering moves between the endpoints and the entry table. |
| Slim response | Server `intentCiHistoryRead.ts` (182) with `ciScopeHistory.ts` and `ciWallTimeReference.ts`; client `authenticatedIntentCiHistoryRead.ts`. Reuse the `gap-reasons=timing-basis` pattern in `ciHistoryGapVocabulary.ts`: an explicit reader capability parameter selects the slim projection, so a page opened before deployment keeps the response it parses. Reuse the frozen reader under `dashboard/tests/support/previousCiHistoryReader/` and extend it with the current Done and scoped schemas before changing them. |

Expected test files at or near 250 lines: `intent-project-scope-timing-history.spec.ts`
250, `intent-scope-collected-file-timing-history.spec.ts` 249,
`intent-scope-collected-timing-history.spec.ts` 248,
`intent-scope-prior-build-average.spec.ts` 248, `intent-story-dark-appearance.spec.ts`
246, `retainedAnswersJourney.ts` 250 (only if reached). Slice 3 owns them:
replace membership assertions with chart/readout assertions through a shared
page-object reading, and add new specs instead of growing these files.

## Decisive premises and preparation observations

Observed in this owned worktree at `4a4799bf5` on 2026-11-13, after
`node scripts/setup-native.mjs npm|browser|check` (all exit 0), Node 24.21.0,
Homebrew Bash first on `PATH`, AC power, 16 cores, load 31–41.

| Premise and consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The proof route reaches Done reference, scope file history, scope units (frontend), reader compatibility (backend) and follow-up journeys (all slices). | Baseline command below, `--workers=2`: 5 passed, 2 failed (next row). | — |
| Done reference journeys are stable (slice 2). | Same run failed `intent-ci-done-prior-build.spec.ts:40` at line 156 (alert said "The local authenticated read could not be reached…" instead of "The collected CI history could not be read" after a broken history file) and `intent-ci-done-reference-lifecycle.spec.ts:12` at line 79 (entry table not visible within 5 s after Check again). Both passed rerun alone at `--workers=1`, load 35. | **Flaky defect, owned by slice 2** under the failure policy below: diagnose and repair before or with that slice's rewrite of these specs; a rerun is not the fix. |
| Retaining the last successful history on a failed refresh exists (Examples 3–4). | `intent-ci-done-prior-build.spec.ts` lines 150–160 assert the alert and the retained "4 prior builds used" with the comparison still shown; passed in the rerun. | Retention must survive the move of the reference's rendering (slice 2). |
| Failed and other typed gaps reach Done history readers (slices 1–2). | `ci-history-reader-compatibility.spec.ts` passed: it records every `finalGapReasons` value, including `failed`, through the real local boundary for the current project and Done readers. | Scoped gap readings are proved by the scope gap specs slice 3 runs. |
| Scope history carries both units with separate references (slice 3). | `frontend-tests/intent-scope-timing-history-units.spec.ts` passed. | The unit switch is new behavior. |
| A page opened before deployment parses only the current rich shape (slice 4). | Client Zod schemas require `reference.evidence` for Done and `references[].reference.evidence` for scoped reads (`ciPriorBuildReference.ts`, `ciScopeHistory.ts`). The frozen reader covers only the project/Done `landedCiHistory` shape and gap words. | Slice 4 freezes the current Done and scoped readers first and proves they still parse the default response. |

Baseline command:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard -- --workers=2 --reporter=list dashboard/tests/intent/intent-ci-done-prior-build.spec.ts dashboard/tests/intent/intent-ci-done-reference-lifecycle.spec.ts dashboard/tests/intent/intent-scope-collected-file-timing-history.spec.ts dashboard/frontend-tests/intent-scope-timing-history-units.spec.ts dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts dashboard/tests/intent/intent-ci-follow-up.spec.ts
```

## Outside-in proof and consumer trace

| Source promise | Owner | Observable proof |
| --- | --- | --- |
| Example 1 marks: failed × on a lower row, hollow unavailable mark, diamond, dashed average, broken line, measured zero on the axis, one-line readout by pointer, keyboard and touch | 1 | New frontend spec on scope timing history (Done and Project contexts): each mark kind present and distinguishable by accessible name and shape; Tab reaches marks in date order and shows the readout; tap shows it on a touch viewport; light and dark. Disabling the readout or gap marks fails it. |
| Example 1 numbers and composition: 8m 04s vs six builds at 8m 24s → −20 s, −4 %, chart between endpoints and entry table, no unrelated newer landing | 2 | New `dashboard/tests/intent` Done-glance spec with a real retained history fixture; asserts DOM order (comparison endpoints → reference → entry table), readout text and colour token by direction, and the absence of the evidence list and methodology paragraphs. |
| Example 2: entry → folder → file; history before the child table in both Summaries; file unit switch changes value, average and scale together; keyboard, touch, light/dark | 3 | New scope-glance spec through the real story drill-down plus a Project Intent Summary; unit switch asserted on readout and chart label/scale; reuse the dark-appearance and touch page objects. |
| Example 3: failed or unusable selected build, fewer than five priors, measured zero, zero average (elapsed only), later trunk build provenance | 2 (wall time), 3 (scope) | Focused frontend specs on the compact readout and scope chart states; the Done spec keeps one later-provenance case end to end. |
| Example 4: history refresh failure leaves comparison/Proof usable, retry, last success retained | 2 (Done), 3 (scope) | Rewritten Done reference lifecycle and prior-build specs (now stable) and existing project scope history recovery/refresh specs, updated for the new layout. |
| Example 4: slim selected and scoped responses; follow-up keeps membership; previous reader unaffected | 4 | Backend spec through the real local boundary: the capability returns chart data without per-build membership, median or filtering detail; the default response still parses with the frozen previous Done and scoped readers; `intent-ci-follow-up.spec.ts` still observes Included/Excluded/Selected. |

Known consumers: membership readings in `priorBuildReferencePage.ts`,
`intentScopeHistoryPage.ts`, `intentCiHistoryPage.ts` (top-level, unchanged)
and `support/ciFollowUpReadingPage.ts` (unchanged); Done specs
`intent-ci-done-*`; scope specs `intent-scope-*`, `intent-project-scope-*`
under `dashboard/tests/intent` and `dashboard/frontend-tests`;
`intent-story-dark-appearance.spec.ts`; top-level chart specs
`intent-ci-wall-time-history*.spec.ts` (shared chart); response consumers in
`dashboard/backend-tests/intent/*ci*` and `tests/support/*ci*history*`;
fixtures `support/collectedScopeHistory.ts`, `support/landedCiHistory.ts`.
Each slice runs the installed consumer-trace script on its diff with
`--base HEAD` and these terms, dispositions every consumer, and adds reached
ones to its gate: slice 1 `--term 'Test execution time for' --term 'CI wall time by build date'`;
slice 2 `--term 'Done CI wall time reference' --term 'Builds and reference evidence' --term 'Refresh history'`;
slice 3 `--term 'Test execution time history' --term 'Builds and evidence' --term 'Test execution history evidence'`;
slice 4 `--term 'intent=ci-history' --term 'evidence' --term 'medianMs'`.

## Ordered slices

### 1. Read each build's status and timing from the history chart
Type: Behavior
Status: done
Proof: New chart-marks frontend spec; existing scope segments/units/reading
frontend specs, top-level `intent-ci-wall-time-history*.spec.ts`, and
`intent-story-dark-appearance.spec.ts`.

Behavior: Given retained scope timing history with a failed build, an
unavailable timing, a measured zero and a selected endpoint, viewing a scope
history chart shows the duration plot with a diamond and dashed average, a
separate lower row with a red × for the failed build and a hollow mark for the
unavailable one, and each mark gives a short date and timing or status readout
by pointer, keyboard focus and touch.

Implement once in the shared chart so every series gains it; the top-level
CI status chart changes only as a consequence. Keep axis labels readable in
the chart's narrowest supported width.

Accepted proof: `dashboard/frontend-tests/intent-ci-history-chart-marks.spec.ts`
(Done scope chart, pointer, keyboard, touch) and
`intent-project-ci-history-chart-marks.spec.ts` (Project Intent, light/dark,
narrowest width) through `tests/support/scopeHistoryMarksScenario.ts` and the
`tests/ciHistoryChartPage.ts` page object; 33-file history spec set 48 passed
after the refactor pass at `--workers=2`; scope history server tests and
typecheck pass. Commitment observations are in the source review.

### 2. Compare a Done landing with recent builds at a glance
Type: Behavior
Status: planned
Proof: New Done-glance spec; rewritten `intent-ci-done-prior-build`,
`intent-ci-done-prior-provenance`, `intent-ci-done-prior-states`,
`intent-ci-done-reference-lifecycle`, `intent-ci-done-endpoint-readiness`,
`intent-ci-prior-build-average`, `intent-ci-prior-build-states`; unchanged
`intent-ci-follow-up.spec.ts`; compact readout frontend states.

Behavior: Given a Done story with retained wall-time history, its CI
comparison shows the wall-time chart and compact readout below the endpoints
and above the by-entry table, with status labels and later-build provenance,
a labelled refresh icon and a short retry on failure, and no Builds and
reference evidence list or methodology paragraph.

First diagnose and repair the two flaky Done specs recorded above (fresh
cause, not a rerun), then rewrite them for the new layout. Keep the history
hook mounted across comparison states. Update
`docs/dashboard-development-intent-ci-reference.md` and the applicable part of
`docs/dashboard-development-intent-ci-comparison.md`.

### 3. Read test execution history before the test table
Type: Behavior
Status: planned
Proof: New scope-glance spec; rewritten scope Summary/Proof history specs in
`dashboard/tests/intent` and `dashboard/frontend-tests` listed above.

Behavior: Given retained scope history, entry and folder Summaries and file
Proof in both story and Project Intent contexts show history and its compact
readout above the table or comparison, with immediate children still opening
their views; file Proof offers Test cases and Test file choices that change
value, average and scale together; Builds and evidence and membership rows
are gone.

Update `docs/dashboard-development-intent-scope-reference.md`. Own the
reorganization of the near-limit specs named above.

### 4. Send only the history the glance views read
Type: Behavior
Status: planned
Proof: New backend slim-response spec; extended
`ci-history-reader-compatibility.spec.ts` with frozen Done and scoped readers;
`tests/support/dashboard-ci-scope-history-read.test.mjs`;
`intent-ci-follow-up.spec.ts`; slices 2–3 glance specs.

Behavior: Given retained history, a selected or scoped read that names the
glance capability answers dated measurements, typed gaps with reasons,
segments, the selected endpoint and provenance, and compact reference figures,
without per-build membership, median, filtering detail or duplicated run and
landing metadata. Without the capability, the response is unchanged.

Freeze the current Done and scoped reader schemas under
`previousCiHistoryReader/` before changing the client schema. Update
frontend-test response fixtures to the slim shape. The follow-up ledger keeps
its stored membership.

## Gates and delivery

- Follow [the failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written for every slice, delegation brief and repair handoff. The two
  baseline flakes above are this story's to repair in slice 2; base/main
  attribution is no exemption, and published CI failures stay owned through
  the applicable final CI. Preserve another active execution's exact owned
  repair.
- Before test edits, resolve paths through the installed MakeMe and
  page-object skills; `.planning/open-dough.json` selects both for
  `dashboard/tests` and `dashboard/frontend-tests`, MakeMe only for
  `dashboard/backend-tests`. Extend the existing history page objects.
- Never sleep in tests, use `test.slow()`, or raise suite, file, group or hook
  timeouts.
- Local gate per slice: its proof plus consumer-trace additions,
  `npm run typecheck:dashboard`, and `npm run --silent format` / staged lint.
  Run with Homebrew Bash first on `PATH` and `env -u NO_COLOR -u FORCE_COLOR
  -u GIT_ALTERNATE_OBJECT_DIRECTORIES`. Start long runs fully awake on AC
  under the maintained [`caffeinate -s -i` guard](../../../tests/local-test-resources.md#machine-sleep-on-macos);
  on battery, plug in or use `caffeinate -i` awake with the lid open and
  inspect the sleep log afterwards.
- Before an expensive run, inspect the host: preparation saw load 31–41 on 16
  cores with flakes at `--workers=2`. Do not lower workers to hide a flake;
  repair it.
- Post-change refactor each slice, then commit and deliver through the
  established execution path; hosted CI (`ci.yml`, push) is the integrated
  completion check.

## Plan review

Slice-plan refinement was not needed: each slice is one externally observable
outcome with its own proof loop. The chart marks are useful alone on the
existing scope charts; Done and scope views are separate surfaces with
separate specs but share slice 1's chart and slice 2's compact readout rather
than duplicating either; the slim response is an independent API outcome that
follows the views that stop needing the lists. No numeric slice target or hard
limit is supplied, and no slice acts from trunk. Remaining slice-specific
concern: none beyond the two baseline flakes, which slice 2 owns as a repair
under the failure policy; they bound no premise of the approach.

## Current decisions

- One chart and one compact readout serve all glance views; no per-view copy.
- The follow-up reading keeps membership; top-level CI status history keeps
  its lists and rich response.
- The slim response is opt-in by explicit reader capability; the default
  response is unchanged for pages opened before deployment.
- Reuse existing CI faster/slower cue tokens for green/amber.

## Learnings

The fresh worktree needed `setup-native.mjs npm|browser|check`; all succeeded
on the first attempt.

- Slice 1: the chart model is one ordered `builds` list of points and gaps
  (`ciHistoryChart.ts`); `gapStatus` there is the single home of the mark
  words "Failed build" and "No timing · <reason>". Slices 2–3 reuse those
  words for compact status labels. Scope gaps are recognised as failed by
  the shared `failedBuildReason` string; slice 4's typed gap statuses may
  replace that match. Every mark is a Tab stop in history order.
- During one slice-1 run an external load spike (55–63 on 16 cores) timed out
  10 collector-backed `dashboard/tests/intent` journeys at unrelated setup
  steps; all passed at load below 35 and in the post-refactor run at load ~5.
  Hosted CI shards are the verdict; a CI failure there stays owned.
