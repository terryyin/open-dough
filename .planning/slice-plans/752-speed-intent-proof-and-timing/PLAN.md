# Get fast proof of Intent evidence and timing history

**Identity:** SEED-413#speed-intent-proof-and-timing
**Source:** [Get fast proof of Intent evidence and timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing)

## Goal and scope

Dashboard maintainers get fast Vitest feedback on the CI status and
proof shown at the homepage, entry, folder and file, and on how the
independent timing histories recover and stay with their source. Move 95
legacy cases in `dashboard/frontend-tests/intent/` from the status,
history, proof and Summary families named below. The comparison story owns
`intent-ci-comparison-*`. The source-reading story owns cases about
location discovery, file and story selection, navigation and recovery
outside these proof and timing families.

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Reuse `mountComponent`, page-loadable history and proof MakeMe builders,
  and the node-free entry builders behind `aCiProof`. Add the latter to
  `pageMakeMe` if needed for a case. Preserve literal, diagnostic test
  titles and share one fixture for multiple independent results of one
  action where that keeps its purpose clear.
- Reuse `IntentCiEvidenceProvider` and its judgment/attempt proof owners
  for status changes and live proof selection. Supply typed `PublishedSource`,
  `PublishedWork`, active identity and the required typed CI status, kept
  status and proof read collaborators with the real authenticated defaults.
  Reuse the comparison story's proof seam when available. Keep a narrow
  boundary on the existing owner when starting independently.
- For history use the production `IntentCiHistoryPanel`, `IntentCiHistory`
  and `IntentScopeTimingHistory` with the existing read state. In cases
  that observe the read, pass the actual endpoint (source, revision and
  observation time), selected scope and reading place into the production
  hooks. Use the existing signatures of `readIntentCiHistory`,
  `readIntentCiDoneWallTimeHistory` and `readIntentCiScopeHistory` as the
  typed sources, with `AbortSignal`. Keep the endpoint-key,
  `useIntentCiEndpointHistory` and `useKeptReading` logic intact. History
  has its own refresh and displays beside the live proof.
- For output use `IntentCiProof`, `IntentScopeProofView`,
  `IntentFileProofView` and `ciScopeComparison` with typed evidence, file
  inventory, overlay paths and actual callbacks. Mount the production
  reading place and its sorting/preference state when the selection,
  drill-down or retention is the result. A case asserting an existing
  single or compared answer's presentation can give the held answer
  directly. Keep native keyboard, narrow/zoom layout, contrast and
  accessible labels in Chromium.
- Retain the observation owner for each retired title. Move equivalent
  loop-started mount cases onto one reading or direct production rule
  check only when all independent words, behaviors and risks still have
  proof. Record before/after elapsed and counts from comparable rosters,
  including any proof moved to E2E. Collect the baseline in Slice 1 using
  the original focused legacy selection and its normal reporter with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under
the [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, focused path selections and
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types.
Trace reached consumers, including representative existing E2E proof,
history and adapter journeys when a shared contract changes. Keep proof
costs and changed-owner checks in the slice's verification.

## Decisive premises and proof

At `42a660a17` on 21 November 2026, macOS on AC with Node 24.21.0 and the
locked install, the scratch
`caffeinate -s -i npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/intent/zz-preparation-413-evidence.spec.ts --workers=2`
mounted `IntentScopeProofView` over typed comparison evidence, inventory
and explicit sort and preference. The file row was visible and clicking the
file sent its exact path to the selected-scope callback. The scratch file
was removed. This substantiates the typed view route for slices 5–8.
Lifecycle slices exercise real read/selection owners with typed replies.

At the same base,
`caffeinate -s -i npm run --silent test:dashboard:frontend -- intent-ci-comparison-relative-scale.spec.ts intent-summary-story-comparison-rows.spec.ts --workers=2 --reporter=line`
passed 10 Playwright cases. Six were the legacy Summary and file rows,
including exact build messages, independent cues, unchanged meaning,
and owning-merge evidence. The normal runner's listing identified 95
legacy titles in this story's scope. Obtain the whole family baseline at
the execution revision before replacing its cases.

The same runner with selectors `intent-project-scope-history-recovery.spec.ts`,
`intent-ci-comparison-check-again.spec.ts` and
`intent-ci-comparison-selection.spec.ts`, at two workers with its line
reporter, passed seven cases. The two project history cases observed a
failed and empty history preserving live Scope Proof, a measured zero
and separate partial-unit gaps. Slice 3 reaches those outcomes over the
typed history source.

| Promise | Owning proof |
| --- | --- |
| Status shows the selected attempt and correct freshness/proof | Slice 1. Exercise real selection and typed status/proof reads, including a failure with retained evidence and accessible cues. |
| Project and Done checks keep their actual timing evidence, including independent failure and recovery | Slices 2–4. Observe history, gaps, retry, request keys and the unchanged live proof through the views. |
| Proof numbers and gaps stay truthful across the homepage, Summary and file | Slices 5–7. Exact rendered words/cues, direct aggregate rules, path selection and no extra live CI read. |
| Sorting, relative scale and the reading place remain usable | Slice 8. Native controls, kept presentation on drill-down/return and visible ordering. |
| The run has fewer repeated cases and costs less where equivalent proof permits | Slice 8. Terminal listing, proof destinations, counts, elapsed and leftover runtime. |

## Slices

### 1. CI status follows the chosen run and shows when evidence is kept

Type: Behavior
Status: planned

Capture the legacy family baseline. Move `intent-ci-status-*` and
`intent-ci-cues-dark-contrast` through the smallest judgment view for fixed
evidence or the real status and proof owner for selection/refusal. First
check a typed reply through the real status reader and observe it replacing a
held result. Use current run changes and withheld fetch expectations only in
the lifecycle cases that claim them.

**Proof.** Observed attempt, evidence, timing and stale/retained words stay
specific. Refresh retains the usable reading beside a failure, the selected
project/story receives the intended judgment, and mounted contrast and
controls protect the actual UI.

### 2. Project and Done history give an honest compact reading

Type: Behavior
Status: planned

Move `intent-ci-compact-readout`, `intent-ci-done-glance`,
`intent-ci-done-reference-lifecycle` and the project/CI history chart-mark
specs. Narrow `JudgedBranch`'s presentation input to what it reads while
the history owner keeps its refresh round. Put gap rows, run links,
history-only keyboard order and narrow overflow in the history-only mount.
Keep the panel-level keyboard path from Check again to Builds and evidence.
Replace existing act-settle mechanics in the touched Project CI history cases.

**Proof.** The history presents measured, absent and previously retrieved
facts accurately. A failed or pending history can still show its prior
figures. Preserve actual build/date marks, compact wording and keyboard
order at each boundary.

### 3. Project scope history follows the correct source, revision and place

Type: Behavior
Status: planned

Move `intent-project-scope-glance`, `intent-project-scope-history-*` and
`intent-scope-glance`. Exercise the history owner against typed replies
recording the selected source, endpoint, scope and abort. Start with one held
source switch and observe a new request and its content before migrating the
remaining isolation cases. Build the common fixture from the real reading
place and the case's facts.

**Proof.** Project switches, source identity, revision changes, remount and
retained readings distinguish each relevant key without leaking results.
Refresh and Retry preserve and replace the appropriate reading.

### 4. Collected timing keeps its units, provenance and gaps

Type: Behavior
Status: planned

Move `intent-scope-timing-history-*` with a typed history answer and real
scope history control where the case acts on it. Exercise chart layout and
membership in Chromium. Use existing pure timing functions for distinct
segment, unit and provenance calculations.

**Proof.** The chosen build explains absent, partial and unavailable timing.
Separate case/file readings, interrupted segments, dates and provenance
remain visible, and history can recover beside usable live proof.

### 5. Homepage and Summary use the same named attempt's proof

Type: Behavior
Status: planned

Move `intent-ci-proof*` and `intent-summary-ci-proof*`. Compose the typed
attempt proof and kept evidence. Use the production homepage and Scope
views for sorting and labels and a production controller for carryover.

**Proof.** Grouped locations, surviving per-part figures, exact gap and
freshness words, and correct row membership remain readable. A file outside
the tree counts exactly once. Accessible group/row names and fit at the
existing viewport and zoom conditions protect the rendered result.

### 6. Compared Summary rows disclose fallback, gaps and outside evidence

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-{fallback,gaps,outside,rows}`.
Use one typed overlay and the real scope aggregation for an equivalent
set of rows. Preserve separate coverage for endpoint choice, owning merge,
missing units and unavailable provenance.

**Proof.** Selected and ancestor builds are distinguishable. Outside
rows and fallback counts come from their real endpoint, and each count,
time and change cue retains its visible and accessible meaning.

### 7. Drill-down gives a file the correct evidence and actions

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-{file,file-proof-counts,presentation-bindings}`.
Use the production selection callbacks and file proof boundary, carrying
the actual overlay or rename and path data. Keep a mounted check wherever
native controls or binding to the real file selection is the proof.

**Proof.** The real selected file receives its own case/file counts and
timing, renamed paths select the intended endpoints, and empty or partial
evidence keeps its distinct reason. Drilling into Proof reuses the same
attempt without another live proof read where the original case checks it.

### 8. Sorting and relative figures stay with the reader and all proof runs faster

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-{column-sort,relative,signed-sort,sort}`
with the production reading place and table. Compare the complete story
selection with its baseline, count consolidated and retained cases and
remove support whose last consumer migrated.

**Proof.** Native sorting and Show % expose the expected signed order,
accessible direction, per-scope scaling and retained preference across
drill-down and return. Verify the comparison's ownership ledger, Vitest
selection, elapsed time and case counts across both evidence destinations.

## Plan review

Refinement pass unnecessary after review of the eight proof boundaries, the
independent history and live proof lifecycle, and visible scope transitions.
Each slice moves one related set of reader observations. Early typed
reply and source-switch checks bound the changed reading seams before their
larger groups move. No remaining slice-specific scope or proof concern was
identified.
