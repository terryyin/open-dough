# Get fast proof of Intent evidence and timing history

**Identity:** SEED-413#speed-intent-proof-and-timing
**Source:** [Get fast proof of Intent evidence and timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing)
**Source review:** [source-review.md](source-review.md)

## Execution context

- **Mode:** Story Branch Mode (`story-branch`)
- **Owned workspace:** `/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-intent-evidence-and-timing-his` (branch `cursor/get-fast-proof-of-intent-evidence-and-timing-his`, starting revision `81b22bafd01bb5a13574f4f5acd89c62106b2914`, created for `SEED-413#speed-intent-proof-and-timing`)
- **Integration checkout:** `/Users/terryyin/git/open-dough`
- **Target selection:** remote `origin`, trunk `main`
- **Publisher / agent:** `dashboard-territory.local-open-dough` / `Rio-chan`
- **Retained published revisions:** claim `58b829487ba83a8a0752eabfeb37391e4169a596` on `origin/main` and `origin/cursor/get-fast-proof-of-intent-evidence-and-timing-his` (`pendingCi: unobserved` for trunk claim published before observer arming)
- **CI observer:** GitHub Actions (`terryyin/open-dough`, branch `cursor/get-fast-proof-of-intent-evidence-and-timing-his`, selector `ci.yml`, display name `CI`, mailbox `/tmp/dough-ci-501/watch-6mIHcl`)

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
was removed. This substantiates the typed view route for slices 6–9.
Lifecycle slices exercise real read/selection owners with typed replies.

At the same base,
`caffeinate -s -i npm run --silent test:dashboard:frontend -- intent-ci-comparison-relative-scale.spec.ts intent-summary-story-comparison-rows.spec.ts --workers=2 --reporter=line`
passed 10 Playwright cases. Six were the legacy Summary and file rows,
including exact build messages, independent cues, unchanged meaning,
and owning-merge evidence. The normal runner's listing identified 95
legacy titles in this story's scope. Obtain the whole family baseline at
the execution revision before replacing its cases.

At `58b829487ba83a8a0752eabfeb37391e4169a596` on 21 November 2026 (macOS on AC under `caffeinate -s -i`, `--workers=2`, load 6.34–7.46), the settled pre-change baselines were captured with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`:
- Whole 44-file / 95-case legacy Playwright family (`open-dough/evidence/baseline-legacy-95.proof.json`): 95 passed `chromium` cases in 36,187 ms (36.19 s) elapsed including preparation.
- Status + dark-contrast 7-file / 15-case legacy subset (`open-dough/evidence/baseline-slice1-status.proof.json`): 15 passed `chromium` cases in 13,532 ms (13.53 s) elapsed including preparation.
- Existing 3-file / 5-case Vitest Project CI wall-time history (`open-dough/evidence/baseline-vitest-wall-time-history.proof.json`): 5 passed `mounted-chromium` cases in 3,437 ms (3.44 s) elapsed including preparation.

The same runner with selectors `intent-project-scope-history-recovery.spec.ts`,
`intent-ci-comparison-check-again.spec.ts` and
`intent-ci-comparison-selection.spec.ts`, at two workers with its line
reporter, passed seven cases. The two project history cases observed a
failed and empty history preserving live Scope Proof, a measured zero
and separate partial-unit gaps. Slice 4 reaches those outcomes over the
typed history source.

| Promise | Owning proof |
| --- | --- |
| Status shows the selected attempt and correct freshness/proof | Slices 1–2. Exercise real selection and typed status/proof reads, including a failure with retained evidence, homepage/side-panel selection and accessible cues. |
| Project and Done checks keep their actual timing evidence, including independent failure and recovery | Slices 3–5. Observe history, gaps, retry, request keys and the unchanged live proof through the views. |
| Proof numbers and gaps stay truthful across the homepage, Summary and file | Slices 6–8. Exact rendered words/cues, direct aggregate rules, path selection and no extra live CI read. |
| Sorting, relative scale and the reading place remain usable | Slice 9. Native controls, kept presentation on drill-down/return and visible ordering. |
| The run has fewer repeated cases and costs less where equivalent proof permits | Slice 9. Terminal listing, proof destinations, counts, elapsed and leftover runtime. |

## Learnings

- **Original Slice 1 active-time overrun and split (`15.5` active minutes at stop, `17.0` paused on `slice-clock.mjs`, `storyOverruns: 1`):** Original Slice 1 bundled wiring the 5-collaborator `IntentCiReadSourceOnPage` seam + `pageMakeMe.mjs` extensions with 7 spec files (15 cases, 1,240 lines) across four distinct mount boundaries (`IntentCiEvidenceProvider`, `JudgedBranch`/`IntentCiProof`, `IntentPageProviders`+`ProjectIntentReading`, and `usePageSidePanel`+`IntentPerspective`). Unfinished attempt-owned edits were reverted cleanly (parked in `open-dough/evidence/slice-1-overrun-parked/`) and Original Slice 1 was split in place into Slice 1 (seam + 4 standalone freshness/execution-time/sort/contrast files) and Slice 2 (3 homepage/kept/side-panel selection files + status-family speedup comparison), renumbering former Slices 2–8 to Slices 3–9 (9 slices total, within the 10-slice execution split limit).
- **Standalone `IntentCiEvidenceProvider` place boundary:** `IntentCiEvidenceProvider` calls `useObservedTrunkEndpoint` -> `useKeptReading("ciObservedTrunkEndpoint")` (`dashboard/src/IntentCiEvidence.tsx:57`) and therefore requires `<IntentReadingProvider project={source.id}><IntentReadingPlaceOfItsOwn project={source.id}>...</IntentReadingPlaceOfItsOwn></IntentReadingProvider>` when mounted outside `ProjectIntentReading` / `IntentPerspective`.
- **Typed CI read collaborators (`IntentCiReadSourceOnPage`):** Mounting `IntentCiEvidenceProvider` activates `readKeptIntentCiStatus` + `readIntentCiStatus` (`useIntentCiJudgment`), `readIntentCiProof` (`useIntentCiShownProof`), `readIntentCiHistory` on trunk rounds (`useIntentCiHistory`), and `readIntentCiComparison` + endpoint proofs on Taken Story Branch selections (`useIntentCiComparison` / `useIntentCiComparisonEntries`). Supplying all 5 on `IntentCiReadSourceOnPage` with real authenticated defaults — and optional defaulted parameters on `createCiProofReading`, `createCiComparisonReading`, and `createCiComparisonProofs` — keeps `dashboard/backend-tests/support/ciComparisonClient.ts` and `dashboard/backend-tests/intent/ci-comparison-client-identity.spec.ts` untouched.
- **Node-free builders and contrast helpers:** `CiProofEntryBuilder`, `CiProofEvidenceBuilder`, and `ComparedStoryBuilder` have zero `node:*` imports and work directly on `Distribution/tests/support/pageMakeMe.mjs`. `dashboard/test-support/composedColours.ts` works directly in Vitest Browser Mode with `cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] })`.
- **Named sibling coordination (`SEED-413#speed-intent-source-recovery-and-late-styling-cases` landed on `main` at `4d8152c42`):** That sibling modified `intent-browser-page.ts`, `intent-candidates-page.ts`, `intent-file-reading-page.ts`, and `intent-revision-*`. Keep new colocated CI status/history/proof page objects in their own files under `dashboard/frontend-tests/intent/` rather than editing those source-reading page objects.

## Slices

### 1. CI status reader replaces held evidence, keeps usable status on failure, and renders execution timing and dark contrast

Type: Behavior
Status: planned

Wire `IntentCiReadSourceOnPage` (with real authenticated defaults for status,
kept status, proof, history, and comparison reads) and expose Node-free
`aCiProofEntry`, `aCiProofEvidence`, and `aComparedStory` on `pageMakeMe.mjs`.
Move `intent-ci-status-freshness`, `intent-ci-status-execution-time`,
`intent-ci-status-sort`, and `intent-ci-cues-dark-contrast` (4 files, 10
legacy cases) through `IntentCiEvidenceProvider` + `IntentCiStatus` (wrapped
in `IntentReadingProvider` + `IntentReadingPlaceOfItsOwn`) for lifecycle
freshness/races, or the smallest judgment/proof/summary view for fixed
evidence, native sorting, and dark-surface contrast. First check a typed reply
through the real status reader and observe it replacing a held result.

**Proof.** Warm kept answers show as previously retrieved with a spinner until
the fresh answer replaces them, cold failed refreshes retain the usable
reading, late trunk answers do not overwrite a switched story branch's kept
answer, execution timing and missing/untimed shard words stay specific, Proof
sorts by click/Enter/Space without summing units, and composed CI cues stay
readable on dark surfaces.

### 2. Homepage, trunk head changes, and Side panel story selection choose the intended CI status

Type: Behavior
Status: planned

Move `intent-ci-status-homepage`, `intent-ci-status-kept`, and
`intent-ci-status-side-panel` (3 files, 5 legacy cases) reusing
`IntentCiReadSourceOnPage` and the smallest owning homepage/perspective views
(`ProjectIntentReading` / `IntentPerspective` with `usePageStorySelection` and
`usePageSidePanel`). Measure the complete migrated 7-file status and dark
contrast selection against the settled 15-case baseline (`13,532 ms`).

**Proof.** CI status fills Intent's homepage with nothing selected, remains
readable without rereading CI while locations load/fail/recover, asks again on
a new trunk head while ignoring time-only or other-branch movement, follows
Side panel story selection and ad hoc clearing to `main`, and gives faster
Vitest feedback than the legacy status baseline.

### 3. Project and Done history give an honest compact reading

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

### 4. Project scope history follows the correct source, revision and place

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

### 5. Collected timing keeps its units, provenance and gaps

Type: Behavior
Status: planned

Move `intent-scope-timing-history-*` with a typed history answer and real
scope history control where the case acts on it. Exercise chart layout and
membership in Chromium. Use existing pure timing functions for distinct
segment, unit and provenance calculations.

**Proof.** The chosen build explains absent, partial and unavailable timing.
Separate case/file readings, interrupted segments, dates and provenance
remain visible, and history can recover beside usable live proof.

### 6. Homepage and Summary use the same named attempt's proof

Type: Behavior
Status: planned

Move `intent-ci-proof*` and `intent-summary-ci-proof*`. Compose the typed
attempt proof and kept evidence. Use the production homepage and Scope
views for sorting and labels and a production controller for carryover.

**Proof.** Grouped locations, surviving per-part figures, exact gap and
freshness words, and correct row membership remain readable. A file outside
the tree counts exactly once. Accessible group/row names and fit at the
existing viewport and zoom conditions protect the rendered result.

### 7. Compared Summary rows disclose fallback, gaps and outside evidence

Type: Behavior
Status: planned

Move `intent-summary-story-comparison-{fallback,gaps,outside,rows}`.
Use one typed overlay and the real scope aggregation for an equivalent
set of rows. Preserve separate coverage for endpoint choice, owning merge,
missing units and unavailable provenance.

**Proof.** Selected and ancestor builds are distinguishable. Outside
rows and fallback counts come from their real endpoint, and each count,
time and change cue retains its visible and accessible meaning.

### 8. Drill-down gives a file the correct evidence and actions

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

### 9. Sorting and relative figures stay with the reader and all proof runs faster

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

Refined in place after Original Slice 1's active-time overrun (`storyOverruns: 1`):
split Original Slice 1 into Slice 1 (typed CI read seam + 4 standalone
status/proof/contrast specs) and Slice 2 (3 homepage/kept/side-panel selection
specs + status-family timing proof), renumbering former Slices 2–8 to Slices
3–9. Each slice exercises one bounded mount seam within the 15-minute active
budget.
