# Source review

Launched 23 November 2026 as a fresh general-purpose agent with no conversation
inheritance. Its only input was the story's Goal and Scope from
[the seed section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-revision-detour-proof-residue)
and the plan's complete `## Correction input`, without slicing. It was told to
read no other files and change nothing, and to number independently observable
promises.

Unnumbered context it returned: correction origin and provenance commits;
SEED-341 owns the attention-timeout work; the Done record's Intent Coverage fault
is the reason for id 2; Recent stories and Candidates reader cases are already
focused; reassess the read-reuse port if ownership changes; the other legacy
cases, observation-driven cases and production shell stay with the published
observation story.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Each touched Intent test shows at one level of abstraction which regression it catches (Goal). Ids 2–5 cover the specific cases; this id covers any other touched Intent test. | slice 8 | |
| 2 | Focus the long CI activation case: the 100-line `intent-home-activation-scope.spec.ts:106` body no longer bundles three read sources plus a machine claim with story branch activation, project trunk activation, reciprocal focus and story-file restoration in one case (Scope; Correction input item 1). | slice 2 | |
| 3 | Focus the touched 122-line homepage case at `intent-ci-status-homepage.spec.ts:57`, which now mixes landing, three activation inputs, a Development detour and missing configuration (Correction input item 1; Scope). | slice 6 | |
| 4 | Focus the reading-place case at `intent-reading-place.spec.ts:161` so the tab detours and the perspective detour are no longer combined in one case (Scope; Correction input item 1). | slice 5 | |
| 5 | Focus the revision transition cases (revision apply, planning-only, update boundaries, update outcomes) so their preparation no longer interleaves with their transition proof (Scope; Correction input item 1). | slice 8 | |
| 6 | After focusing, the cases still make observable the story branch activation, project trunk activation, reciprocal focus and story-file reading restoration, including the activation-from-Changes path the earlier Intent Coverage fault never reached (Scope "Keep the story branch, focus, reading restoration … observable"; Correction input item 1). | slice 2 | |
| 7 | Timed reads stay observable: the Candidates backoff sequence stays intact because "the observed timing … is their proof" (Scope; Correction input item 1). | slice 1 | observed: dashboard/frontend-tests/intent/intent-candidates-read-recovery.spec.ts "candidates wait for the standing GitHub limit after their shorter backoff is due" unchanged by slice 1 |
| 8 | Recovery stays observable: the pinned-source recovery sequence stays intact because the recovery order is its proof (Scope; Correction input item 1). | slice 8 | |
| 9 | The pending-revision CI activation case in `intent-home-activation.spec.ts` is ported from the Playwright harness to plain Vitest (Scope; Correction input item 2). | slice 7 | |
| 10 | The selected-story read-reuse spec keeps its no-read and reuse assertions through its port owner, plan 763 Slice 1 (`796e1197e`), or that plan's landed successor; this story does no duplicate port (Scope; Correction input item 2). | slice 7 | |
| 11 | The E2E arrow-key URL step in `e2e/intent/intent-project-visit-ci.spec.ts` is removed; it overclaims routing (Scope; Correction input item 3). | slice 3 | |
| 12 | A Vitest observation proves that the `IntentTabs` arrow keys reach the page already handled (prevented), so the page keyboard listener skips them (Scope; Correction input item 3). | slice 3 | |
| 13 | The Recent stories URL step is break-checked (Scope; Correction input item 3). | slice 4 | |
| 14 | The story-tab click and the selected-state wait, duplicated across the activation and detour specs, live in one shared place (Scope; Correction input item 4). | slice 2 | |
| 15 | The navigation-button lookup, rediscovered separately by the activation and Recent stories specs, is unified (Scope; Correction input item 4). | slice 2 | |
| 16 | The CI helpers have one way to open folders instead of two (Scope; Correction input item 4). | slice 6 | |
| 17 | Each case isolates the Candidates reader answer memo; the six reader cases no longer avoid interference only through unrelated revision literals (Scope; Correction input item 4). | slice 1 | observed: dashboard/frontend-tests/intent/intent-candidates-reader-reuse.spec.ts transportAnswering onTestFinished(forgetAnswers), six cases on one revision; evidence s1-reader (pass) and s1-noreset (absent, another-revision, unreadable, invalid fail) |
| 18 | Equivalent two-worker selections of the touched tests are compared, with preparation included, to show the feedback is fast (Scope; Goal). | slice 8 | |
| 19 | The delivered proof stays intact: the original story's promises still hold as written after the correction (Goal; story header). | slice 8 | |
