# Get fast proof of Intent CI status and cue contrast

**Identity:** SEED-413#speed-intent-proof-and-timing
**Source:** [Get fast proof of Intent CI status and cue contrast](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-proof-and-timing)
**Source review:** [source-review.md](source-review.md)
**Split:** Terry authorized splitting at delivered Slice 3 on 2026-11-21; former Slices 4–6 moved to `SEED-413#speed-intent-timing-history-proof` ([plan 759](../759-speed-intent-timing-history-proof/PLAN.md), Slices 1–5) and former Slices 7–10 moved to `SEED-413#speed-intent-attempt-and-summary-proof` ([plan 760](../760-speed-intent-attempt-and-summary-proof/PLAN.md), provisional Slices 1–5).

## Execution context

- **Mode:** Story Branch Mode (`story-branch`)
- **Owned workspace:** `/Users/terryyin/git/open-dough/.worktrees/get-fast-proof-of-intent-evidence-and-timing-his` (branch `cursor/get-fast-proof-of-intent-evidence-and-timing-his`, starting revision `81b22bafd01bb5a13574f4f5acd89c62106b2914`, created for `SEED-413#speed-intent-proof-and-timing`)
- **Integration checkout:** `/Users/terryyin/git/open-dough`
- **Target selection:** remote `origin`, trunk `main`
- **Publisher / agent:** `dashboard-territory.local-open-dough` / `Rio-chan`
- **Retained published revisions:** claim `58b829487ba83a8a0752eabfeb37391e4169a596` on `origin/main` and `origin/cursor/get-fast-proof-of-intent-evidence-and-timing-his` (`pendingCi: unobserved` for trunk claim published before observer arming)

## Goal and scope

Dashboard maintainers get fast Vitest feedback on the CI status and cue
contrast shown at Intent's homepage, perspective tabs, and side-panel story
selection. Move the 15 legacy cases across the 7 CI status and dark-contrast
files in `dashboard/frontend-tests/intent/` (`intent-ci-status-freshness`,
`intent-ci-status-execution-time`, `intent-ci-status-sort`,
`intent-ci-status-homepage`, `intent-ci-status-kept`,
`intent-ci-status-side-panel`, and `intent-ci-cues-dark-contrast`), wire
`IntentCiReadSourceOnPage` across status, kept-status, proof, history, and
comparison reads, and expose Node-free `aCiProofEntry`, `aCiProofEvidence`,
and `aComparedStory` on `pageMakeMe.mjs`. Timing history belongs to
`SEED-413#speed-intent-timing-history-proof` (`plan 759`), attempt and Summary
proof belongs to `SEED-413#speed-intent-attempt-and-summary-proof` (`plan 760`),
CI comparison belongs to `SEED-413#speed-intent-ci-comparison-proof`, and
source/story reading belongs to `SEED-413#speed-intent-source-and-story-reading`.

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Reuse `mountComponent`, page-loadable history and proof MakeMe builders,
  and the Node-free entry builders behind `aCiProof` on `pageMakeMe.mjs`.
  Preserve literal, diagnostic test titles and share one fixture for multiple
  independent results of one action where that keeps its purpose clear.
- Reuse `IntentCiEvidenceProvider` and its judgment/attempt proof owners
  for status changes and live proof selection. Supply typed `PublishedSource`,
  `PublishedWork`, active identity and the required typed CI status, kept
  status, proof, history, and comparison read collaborators with real
  authenticated defaults via `IntentCiReadSourceOnPage`.
- Retain the observation owner for each retired title and record two-worker
  before/after elapsed time including preparation, engine/destination counts,
  consolidation/retention rationale, and remaining slow cases.

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

At `58b829487ba83a8a0752eabfeb37391e4169a596` on 21 November 2026 (macOS on AC under `caffeinate -s -i`, `--workers=2`, load 6.34–7.46), the settled pre-change baselines were captured with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`:
- Whole 44-file / 95-case pre-split legacy Playwright family (`open-dough/evidence/baseline-legacy-95.proof.json`): 95 passed `chromium` cases in 36,187 ms (36.19 s) elapsed including preparation.
- Status + dark-contrast 7-file / 15-case legacy subset (`open-dough/evidence/baseline-slice1-status.proof.json`): 15 passed `chromium` cases in 13,532 ms (13.53 s) elapsed including preparation.
- Existing 3-file / 5-case Vitest Project CI wall-time history (`open-dough/evidence/baseline-vitest-wall-time-history.proof.json`, carried forward to `plan 759`): 5 passed `mounted-chromium` cases in 3,437 ms (3.44 s) elapsed including preparation.

| Promise | Owning proof |
| --- | --- |
| Status reader replaces warm kept evidence, retains cold usable evidence on failure, and rejects stale trunk answers | Slice 1 (`intent-ci-status-freshness.spec.ts` over `IntentCiEvidenceProvider` + `IntentCiReadSourceOnPage`). |
| Execution timing, missing/untimed shard words, Proof sorting, and dark-surface cues stay truthful and accessible | Slice 1 (`intent-ci-status-execution-time.spec.ts`, `intent-ci-status-sort.spec.ts`, `intent-ci-cues-dark-contrast.spec.ts`). |
| Homepage tabs, location recovery, perspective toggles, and trunk-head changes choose and retain CI status without redundant reads | Slice 2 (`intent-ci-status-homepage.spec.ts`, `intent-ci-status-kept.spec.ts` over `IntentPageProviders` + `IntentPerspective`). |
| Side-panel story selection and ad hoc session transitions choose the intended CI status and the 7-file suite runs faster on Vitest | Slice 3 (`intent-ci-status-side-panel.spec.ts` over `usePageStorySelection` + `usePageSidePanel` + `IntentPerspective`; `8,315 ms` vs `13,532 ms` baseline). |

### Case-disposition ledger and two-worker timing comparison

- **Disposition across all 15 legacy cases (`7` files, `0` legacy Playwright cases remaining on owned files, `0` cases promoted to E2E):**
  - `intent-ci-status-freshness.spec.ts` (`3` legacy `chromium` -> `3` Vitest `mounted-chromium`): kept as 3 separately named cases because warm kept replacement, cold-load failed refresh retention, and late-trunk race suppression require incompatible reader histories and promise timings.
  - `intent-ci-status-execution-time.spec.ts` (`4` legacy `chromium` -> `4` Vitest `mounted-chromium`): kept as 4 separately named cases (`6.8–150.5 ms`) for distinct shard-duration failure diagnosis (complete/empty shard sum vs wall time, legacy summary without durations, missing shard explanation, untimed vs `0 ms` shard).
  - `intent-ci-status-sort.spec.ts` (`2` legacy `chromium` -> `2` Vitest `mounted-chromium`): kept as 2 separately named cases (`506–639 ms`) separating single-unit keyboard/click column sort from multi-unit row sorting without type summation.
  - `intent-ci-cues-dark-contrast.spec.ts` (`1` legacy `chromium` -> `1` Vitest `mounted-chromium`): already consolidated to 1 `20 ms` case checking every composed CI cue variant on dark surfaces.
  - `intent-ci-status-homepage.spec.ts` (`2` legacy `chromium` -> `2` Vitest `mounted-chromium`): kept as 2 cases separating homepage/tab/not-configured navigation (`1,461.6 ms`) from locations load/fail/recover independence (`344.7 ms`).
  - `intent-ci-status-kept.spec.ts` (`2` legacy `chromium` -> `2` Vitest `mounted-chromium`): kept as 2 cases separating perspective/project selection memory (`792.7 ms`) from trunk-head revision vs time-only/other-branch re-query rules (`497.4 ms`).
  - `intent-ci-status-side-panel.spec.ts` (`1` legacy `chromium` -> `1` Vitest `mounted-chromium`): already sequences Taken final-report switching, card-toggle close retention, and ad hoc terminal clearing in 1 case (`2,777.7 ms`).
- **Two-worker before/after comparison (`caffeinate -s -i`, `--workers=2`, elapsed including preparation):**
  - **Before (`baseline-slice1-status.proof.json`):** `15` passed `chromium` Playwright cases (`0` Vitest, `0` E2E) in **`13,532 ms` (`13.53 s`)**.
  - **After (`slice3-status-7files.proof.json`):** `15` passed `mounted-chromium` Vitest cases (`0` pure-logic Vitest, `0` legacy Playwright, `0` promoted to E2E) in **`8,315 ms` (`8.32 s`, `7,330 ms` runner duration)** — **`-5,217 ms` (`-38.6%`, `1.63x` faster)**.
  - **Remaining cost / slow cases:** 13 of 15 cases finish in `6.8–792.7 ms`; only `intent-ci-status-homepage.spec.ts` case 1 (`1,461.6 ms`) and `intent-ci-status-side-panel.spec.ts` (`2,777.7 ms`) exceed `1 s` because each drives multiple interactive perspective/side-panel transitions in real Chromium.
  - **Shared `test-support` audit:** Grep across `e2e/` and remaining `dashboard/frontend-tests/` confirmed every `dashboard/test-support/` helper formerly imported by these 7 files (`intentCiStatusPage.ts`, `intentCiStoryBoard.ts`, `intentCiStoryRecords.ts`, `frontendCiStatusAnswers.ts`, `frontendCiRunProofAnswers.ts`, `frontendFinalReportSubstitutes.ts`, `expectCiComparisonCues.ts`, `expectSortedColumns.ts`) still has live consumers in `e2e/intent/` or the remaining legacy frontend specs; cohort-end spent-support removal moves with `plan 759` and `plan 760`.

## Learnings

- **Original Slice 1 (`storyOverruns: 1`) and Slice 2 (`storyOverruns: 2`) active-time overruns and in-place splits:** Original Slice 1 bundled the 5-collaborator `IntentCiReadSourceOnPage` seam + `pageMakeMe.mjs` extensions with 7 spec files across 4 mount boundaries, and Slice 2 bundled `IntentPerspective` (`homepage`/`kept`) with `usePageSidePanel` (`side-panel`). Splitting by mount owner let Slices 1, 2, and 3 each finish cleanly within budget.
- **Standalone `IntentCiEvidenceProvider` place boundary and `IntentCiReadSourceOnPage` reconciliation (`6b1afcd88`):** `IntentCiEvidenceProvider` requires `<IntentReadingProvider project={source.id}><IntentReadingPlaceOfItsOwn project={source.id}>...</IntentReadingPlaceOfItsOwn></IntentReadingProvider>` when mounted outside `ProjectIntentReading` / `IntentPerspective`. Keeping `readHistory?: typeof readIntentCiHistory | undefined` optional on `IntentCiReadSource` (with fallback `readHistory = readIntentCiHistory` in `useIntentCiHistory.ts`) reconciled cleanly with `SEED-413#speed-intent-ci-comparison-proof` (`0ed001fd1`) while leaving `dashboard/backend-tests/support/ciComparisonClient.ts` untouched.
- **Slice 4 active-time overrun (`15.2` active minutes, `storyOverruns: 3`) and authorized story split at delivered Slice 3:** Slice 4 bundled 3 history surfaces across 8 test files + seam + 5 helpers (`20` files) while the plan was already at the 10-slice execution cap. Unfinished Slice 4 edits were reverted cleanly, and Terry authorized narrowing `SEED-413#speed-intent-proof-and-timing` to its delivered 7-file / 15-case status and dark-contrast outcome while splitting the remaining 80 legacy cases into `SEED-413#speed-intent-timing-history-proof` (`plan 759`, 5 slices) and `SEED-413#speed-intent-attempt-and-summary-proof` (`plan 760`, 5 provisional slices).

## Slices

### 1. CI status reader replaces held evidence, keeps usable status on failure, and renders execution timing and dark contrast

Type: Behavior
Status: done

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
readable on dark surfaces. Accepted at `--workers=2`: `npm run typecheck:dashboard`
passed; 4 migrated Vitest files (`intent-ci-status-freshness`, `intent-ci-status-execution-time`,
`intent-ci-status-sort`, `intent-ci-cues-dark-contrast`) passed 10 `mounted-chromium`
cases in 9.02s (`0` legacy Playwright cases remain on those 4 files); untouched
consumers (`ci-comparison-client-identity`, `ci-comparison-client-reading`,
`intent-ci-wall-time-history`, `intent-ci-status-homepage`, `intent-ci-comparison-strict-mode`)
passed unchanged.

### 2. Homepage and trunk head changes choose and retain the intended CI status

Type: Behavior
Status: done

Move `intent-ci-status-homepage` and `intent-ci-status-kept` (2 files, 4 legacy
cases) reusing `IntentCiReadSourceOnPage` and `IntentPageProviders` +
`IntentPerspective` (`IntentReadRecovery`, `IntentReadSourceOnPage`, and
`ReviewSourceOnPage`).

**Proof.** CI status fills Intent's homepage with nothing selected, activating
the CI status tab by click/Enter/Space returns home from an entry/folder/file
with the tree open, not-configured projects show CI status beside the
explanation, CI status stays readable without rereading CI while locations
load/fail/recover, Optimization Candidates stays kept across perspective toggle
while project switches start on CI status, and a new trunk head asks again while
time-only or other-branch movement asks for none. Accepted at `--workers=2`:
`npm run typecheck:dashboard` and `npm run format` passed; 2 migrated Vitest
files (`intent-ci-status-homepage`, `intent-ci-status-kept`) with colocated
`intent-ci-perspective-mount.ts` passed 4 `mounted-chromium` cases in 3.46s
(`4,330 ms` elapsed including preparation; `0` legacy Playwright cases remain
on those 2 files).

### 3. Side panel story selection chooses the intended CI status and status proof runs faster

Type: Behavior
Status: done

Move `intent-ci-status-side-panel` (1 file, 1 legacy case) over
`usePageStorySelection`, `usePageSidePanel`, and `IntentPerspective`. Measure
the complete migrated 7-file status and dark-contrast selection against the
settled 15-case baseline (`13,532 ms`).

**Proof.** Reading a Taken story's final report selects it and judges its
branch, switching to another story's report moves the judged branch there,
toggling a card keeps selection when closing the panel, showing an ad hoc
session clears selection to `main`, closing that session's terminal keeps
project scope, and the 7-file status suite gives faster Vitest feedback than
the legacy status baseline. Accepted at `--workers=2`: `npm run typecheck:dashboard`
and `npm run format` passed; `intent-ci-status-side-panel.spec.ts` with
colocated `intent-ci-side-panel-mount.ts` passed 1 `mounted-chromium` case (`0`
legacy Playwright cases remain across all 7 status + dark-contrast files);
complete 7-file / 15-case status + dark-contrast Vitest selection passed in
`8,315 ms` (`8.32 s`) elapsed including preparation vs `13,532 ms` (`13.53 s`)
settled legacy baseline (`-5,217 ms` / `-38.6%`).

## Execution complete

Product advice: no change — the remaining 80 legacy Intent timing-history and Summary/attempt-proof cases are already split and queued first as `SEED-413#speed-intent-timing-history-proof` (ready) and `SEED-413#speed-intent-attempt-and-summary-proof` (awaiting story refinement), preserving near-future direction and campaign priorities.

## Plan review

Narrowed at delivered Slice 3 on Terry's authorization (`dough-resplit-story`
`#split-at-a-delivered-slice-boundary`): Slices 1–3 are `done` with independent
proof and `-38.6%` faster two-worker feedback (`8,315 ms` vs `13,532 ms`), while
former Slices 4–6 (`31` legacy cases across `19` files + `3` Vitest `act`
retirements) moved to `759-speed-intent-timing-history-proof/PLAN.md` and former
Slices 7–10 (`49` legacy cases across `18` files + cohort-end spent-support
cleanup) moved to `760-speed-intent-attempt-and-summary-proof/PLAN.md`.
