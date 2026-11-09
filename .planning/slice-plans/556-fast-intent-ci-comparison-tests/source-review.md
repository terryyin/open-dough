# Source review — fast Intent CI comparison tests

Launch: Fresh `/root/source_review` with `fork_turns: none`.

Input: The coordinator supplied the original source Goal, Scope, qualifications,
key examples and exclusions for `SEED-286#fast-intent-ci-comparison-tests`.
No project files were read during the source-only review. The retained source
text below is the reviewer's actual returned commitments, qualifications,
trigger/journey examples and exclusions, accepted unchanged by the coordinator.
Slice and lifecycle allocations and execution observations were subsequently
supplied by the coordinator.

Original return note: “Source-only inventory; no project files read or changed.
These are promises and qualifications, without assigning slices or acceptance
ownership.”

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | Every comparison rule produces a trustworthy result. | slice 5 | |
| C002 | Every rule-focused test takes less than 1,000 ms. | slice 5 | |
| C003 | The performance promise applies in any environment. | slice 5 | |
| C004 | Each test arranges only the minimal domain data explaining its case. | slice 5 | |
| C005 | A reader can understand the rule from its setup alone. | slice 5 | |
| C006 | No test in the family relies on a raised timeout. | slice 5 | |
| C007 | Every distinct comparison rule retains deterministic proof. | slice 5 | |
| C008 | Proof uses the cheapest boundary that still exercises real behavior. | slice 5 | |
| C009 | Proof covers Done endpoints. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-endpoints.spec.ts: Done Story Branch and Done Trunk exact endpoint assertions; slice1-family.json strict 88/88 |
| C010 | Proof covers Taken endpoints. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts nearer-proofless Taken Baseline; dashboard/backend-tests/intent/ci-comparison-taken.spec.ts provisional/adapter cases |
| C011 | Proof covers Story Branch Mode. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-endpoints.spec.ts: Story Branch start, branchSide and landing revision/run/attempt assertions |
| C012 | Proof covers Trunk Mode. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-endpoints.spec.ts Done Trunk; ci-comparison-taken.spec.ts Taken Trunk Branch N/A, bounded completion and provisional assertions |
| C013 | Proof covers merge ownership. | slice 1 | observed: ci-comparison-published-endpoints.spec.ts: real claim/profile/first-parent/owning/foreign rules over canonical raw facts; actual reader connection in ci-comparison-history-integration.spec.ts; six intended fault controls caught |
| C014 | Proof covers fast-forward ownership. | slice 1 | observed: ci-comparison-published-endpoints.spec.ts: independently expected story-first own tip and branch side; wrong side fault caught; retained full-reader later-history composition |
| C015 | Proof covers skipped builds. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts real workflow/diff classifier and provider skipped provenance; requested-revision-ci-status.test.mjs real Git proof |
| C016 | Proof covers equivalent builds. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts confirmed skipped landing selects nearest equivalent revision and run |
| C017 | Proof covers cancelled builds. | slice 2 | observed: ci-comparison-cancelled.spec.ts cancelled merge/fast-forward provenance; ci-comparison-exact-landing.spec.ts completed attempt1 beneath cancelled attempt2 |
| C018 | Proof covers later builds. | slice 2 | observed: dashboard/backend-tests/intent/ci-comparison-cancelled.spec.ts: nearest usable later revision/run/attempt, exact query/proof lists and farther unread assertions |
| C019 | Proof covers proof gaps. | slice 2 | observed: ci-comparison-proof-gaps.spec.ts Baseline/Branch/equivalent restrictions and bounds; ci-comparison-cancelled-awaiting.spec.ts nearest unusable proof wording |
| C020 | Proof covers timing gaps. | slice 2 | observed: ci-comparison-timing-gaps.spec.ts absent wall bounds/invalid chain and opaque identity without numeric proof metadata; real timing backend owner passed |
| C021 | Proof covers adapter attempts. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-taken.spec.ts opaque attempt/branch/times/graph and running-tip ancestor; retained adapter browser discovery/proof/jobs/no-Actions wiring |
| C022 | Proof covers retry behavior. | slice 3 | observed: ci-comparison-memory-recovery.spec.ts and mounted retry/gaps cases recover actual repeated reads; retained retry integrations passed in slice3-family.json. |
| C023 | Proof covers remembered answers. | slice 3 | observed: Seven comparison-memory and eighteen proof-memory cases count actual repeated read/validation acquisition; default singleton Node owners and actual final API accounting passed. |
| C024 | Proof covers comparison wording. | slice 4 | |
| C025 | Proof covers comparison counts. | slice 4 | |
| C026 | Proof covers comparison sorting. | slice 4 | |
| C027 | Proof covers relative marks. | slice 4 | |
| C028 | Proof covers navigation through Summary. | slice 4 | |
| C029 | Proof covers navigation through file Proof. | slice 4 | |
| C030 | Comparison remains visible while other Intent reads are held. | slice 3 | observed: intent-ci-comparison-locations.spec.ts held locations preserves one header and comparison; both Summary-file variants open Changed tests while comparison is held; strict72/72. |
| C031 | Comparison remains visible while other Intent reads fail. | slice 3 | observed: intent-ci-comparison-locations.spec.ts failed locations leaves comparison visible and exposes Changed tests Retry; strict72/72. |
| C032 | Actual assertions are inventoried before migration. | slice 5 | |
| C033 | Resolution rules use browser-free server/domain tests. | slice 1 | observed: ci-comparison-{endpoints,selection,taken,published-endpoints}.spec.ts: fourteen in-process real rule cases at 0–15 ms in current ordinary 90-case profile; four history rules have zero observed subprocess acquisition |
| C034 | Read-lifecycle rules use browser-free server/domain tests. | slice 3 | observed: Browser-free ci-comparison-memory-*.spec.ts and ci-proof-memory-*.spec.ts exercise real read/cache/ZIP/schema/identity rules with external acquisition counters; 25/25 at 0–4 ms. |
| C035 | Presentation uses frontend tests against prepared service answers. | slice 4 | |
| C036 | Real UI actions use frontend tests against prepared service answers. | slice 4 | |
| C037 | Explanatory history, attempts, proof, or records are arranged through the shared MakeMe API. | slice 5 | |
| C038 | Final-answer memory has no time-to-live. | slice 3 | observed: ci-comparison-memory-final.spec.ts returns the kept answer with zero further acquisition when supplied timing/build facts change; no elapsed wait or TTL. |
| C039 | Finality is proved directly. | slice 3 | observed: Memory final/fresh/later cases keep completed timing reasons and final gaps, but reacquire unavailable/running/Taken/awaiting-later answers with exact counter deltas. |
| C040 | Request counts are proved directly. | slice 3 | observed: Comparison memory counts endpoint/context/verify/run/proof/jobs separately; retained real retry distinguishes +1 comparison API/+3 proof API and another +3 on reselect from unchanged upstream. |
| C041 | A small set of real Git journeys is retained. | slice 1 | observed: execution-evidence.md Slice 1 accepted proof: named core real Git integration owners retained; temporary UI predecessors owned by G1 |
| C042 | A small set of real CI-provider journeys is retained. | slice 1 | observed: execution-evidence.md Slice 1 accepted proof: clean GitHub plus merged adapter integration owners, strict family 88/88 |
| C043 | A small set of authenticated-read journeys is retained. | slice 1 | observed: intent-ci-comparison.spec.ts and intent-ci-comparison-adapter.spec.ts: actual authenticated read to rendered comparison, strict family 88/88 |
| C044 | Retained journeys are explicitly mapped. | slice 1 | observed: execution-evidence.md Slice 1 accepted proof core integration mapping and endpoint-proof-map.md ownership/composition map |
| C045 | Retained journeys prove connections between boundaries. | slice 1 | observed: raw-history-family-after.json strict90/90 plus actual-default-consumers strict38/38: Git/provider/artifact/authenticated/rendered connections and actual raw-history acquisition remain covered |
| C046 | Setup becomes cheaper without sharing mutable state. | slice 5 | |
| C047 | Setup becomes cheaper without relying on APFS-only copying. | slice 5 | |
| C048 | Both cases in `dashboard/tests/review/story-review-one-shot-choice-refresh.spec.ts` replace incidental launches with directly arranged stored launch/landing records. | slice 5 | |
| C049 | Chosen-run behavior is preserved. | slice 5 | |
| C050 | Replaced-session behavior is preserved. | slice 5 | |
| C051 | Deleted-run behavior is preserved. | slice 5 | |
| C052 | Expired-run behavior is preserved. | slice 5 | |
| C053 | Legacy-gap behavior is preserved. | slice 5 | |
| C054 | An actual launch/capture integration journey is retained. | slice 5 | |
| C055 | The per-test performance measurement includes arrangement. | slice 5 | |
| C056 | The per-test performance measurement includes actions. | slice 5 | |
| C057 | The per-test performance measurement includes assertions. | slice 5 | |
| C058 | The per-test performance measurement includes cleanup. | slice 5 | |
| C059 | Shared runner setup is measured separately. | slice 5 | |
| C060 | Shared build setup is measured separately. | slice 5 | |
| C061 | Shared worker setup is measured separately. | slice 5 | |
| C062 | Retained wiring is measured separately. | slice 5 | |
| C063 | Normal local selection is compared before and after. | slice 5 | |
| C064 | The comparison includes every replacement test. | slice 5 | |
| C065 | The comparison accounts for host load. | slice 5 | |
| C066 | The comparison accounts for concurrency. | slice 5 | |
| C067 | Portable tests are verified in CI. | target CI | |
| C068 | Loaded observations contribute to performance evidence. | slice 5 | |
| C069 | Every distinct rule’s behavioral proof is preserved. | slice 5 | |
| C070 | Independently stated expectations are preserved. | slice 5 | |
| Q001 | At preparation, the matching family contains 73 cases in 25 files; this is an inventory snapshot. | slice 5 | |
| Q002 | Consolidation is allowed when surviving proof detects the same fault. | slice 5 | |
| Q003 | A smaller case count is not the outcome. | slice 5 | |
| Q004 | Controlled clocks are used only when elapsed time is relevant. | slice 5 | |
| Q005 | A warm server is an experiment requiring measurements and isolation proof. | slice 5 | |
| Q006 | A history snapshot is an experiment requiring measurements and isolation proof. | slice 5 | |
| Q007 | Moving work into a shared hook does not demonstrate reduced total feedback. | slice 5 | |
| Q008 | One fast run does not establish environment independence. | slice 5 | |
| Q009 | Recording optimization candidates does not satisfy the story. | slice 5 | |
| J001 | Given a nearer completed build without usable proof and an older usable build, Baseline chooses the older build. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts Baseline passes nearer proofless build and chooses independently expected older usable revision/run |
| J002 | Under that same history, Baseline names the chosen build’s provenance. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts older Baseline selection ancestor/count and proof-read provenance [2,1,3] |
| J003 | The result walk never crosses the story-start bound. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts result never borrows start build; intended scratch guard-removal failure in slice1-bound-negative-applied.json |
| J004 | That example uses minimal history without commits. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts nearer-proofless case uses MakeMe description/repositoryHistoryReads without materializing Git |
| J005 | That example uses minimal history without `gh`. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-selection.spec.ts nearer-proofless case supplies external lookup/proof facts without gh |
| J006 | Given a cancelled landing and later trunk revisions with missing/unusable proof, resolution chooses the nearest later usable completed build. | slice 2 | observed: dashboard/backend-tests/intent/ci-comparison-cancelled.spec.ts: cancelled/unbuilt/proofless/invalid chain selects independently named nearest usable build and count5 |
| J007 | A running/read head stops the search. | slice 2 | observed: ci-comparison-cancelled-awaiting.spec.ts running/read-head stop reason and absence of farther acquisition |
| J008 | That stopped search remains refreshable. | slice 2 | observed: ci-comparison-cancelled-awaiting.spec.ts awaitingLaterBuild/nonfinal observations for running/head/unusable results |
| J009 | A timed-out landing uses exact-only resolution. | slice 2 | observed: ci-comparison-exact-landing.spec.ts timed-out landing remains exact-only despite older/later usable proof |
| J010 | An unexplained landing uses exact-only resolution. | slice 2 | observed: ci-comparison-exact-landing.spec.ts unexplained code landing retains exact no-build gap/status, excludes older/later proof |
| J011 | For transiently unavailable comparison data, Check again disables during the read. | slice 3 | observed: intent-ci-comparison-mounted-retry.spec.ts HTTP failure case holds the next read, observes disabled Check again, then recovers three endpoints. |
| J012 | For transiently unavailable endpoint proof, Check again disables during the read. | slice 3 | observed: Mounted retry Landed-proof failure case holds comparison retry and observes disabled Check again, then second Landed proof read switches Branch to Landed without changing busy semantics. |
| J013 | The display recovers after the transient unavailable read. | slice 3 | observed: Mounted HTTP/whole-answer/proof recovery cases plus retained actual Baseline and shallow-history integrations recover the displayed result. |
| J014 | A final Done answer is reused without a provider request. | slice 3 | observed: Real final Done memory cases observe zero new acquisition; retained retry Check again/reselect adds only API reads and keeps upstream unchanged. |
| J015 | Valid proof is reused without a provider request. | slice 3 | observed: ci-proof-memory-github*.spec.ts and adapter*.spec.ts reuse valid summaries; maintained public default-singleton Node owners and actual retry upstream counts passed. |
| J016 | Taken answers are read fresh. | slice 3 | observed: ci-comparison-memory-fresh.spec.ts reads Taken evidence again; mounted-head case ignores same-tip update and follows changed tip with one additional comparison read. |
| J017 | Running answers are read fresh. | slice 3 | observed: ci-comparison-memory-fresh.spec.ts running Done answer becomes completed before it is kept; exact real read/provider counter deltas asserted. |
| J018 | Unavailable answers are read fresh. | slice 3 | observed: ci-comparison-memory-recovery.spec.ts whole/slot gaps are read again; mounted failed controls remain usable over held repeated reads. |
| J019 | With prepared comparison/proof answers, comparison retains endpoints and fallback. | slice 4 | |
| J020 | With those answers, Summary retains endpoints and fallback. | slice 4 | |
| J021 | With those answers, file Proof retains endpoints and fallback. | slice 4 | |
| J022 | Signed timing is retained. | slice 4 | |
| J023 | Measured zero is retained. | slice 4 | |
| J024 | Gaps are retained. | slice 4 | |
| J025 | Counts are retained. | slice 4 | |
| J026 | Sorting is retained. | slice 4 | |
| J027 | Show % meaning is retained. | slice 4 | |
| J028 | Drilling into those views causes no extra CI reads. | slice 4 | |
| J029 | Held Changed tests cannot hide comparison. | slice 3 | observed: Retained locations-held journey keeps comparison while Changed tests loads and after it settles, without another comparison read. |
| J030 | Failed Changed tests cannot hide comparison. | slice 3 | observed: Retained locations-failed journey keeps comparison while Changed tests shows failure/Retry and later recovers the exact completion revision. |
| J031 | With stored captured/legacy runs, Refresh retains the selected run after native-session replacement. | slice 5 | |
| J032 | Deleting the chosen run selects the newest remaining capture. | slice 5 | |
| J033 | Expiration selects the next run. | slice 5 | |
| J034 | Expiration then reaches the legacy evidence gap. | slice 5 | |
| J035 | These stored-run arrangements require no native launch. | slice 5 | |
| J036 | A separate actual launch/capture journey proves the production connection. | slice 5 | |
| X001 | No comparison semantics changes. | slice 5 | |
| X002 | No timing-history features. | slice 5 | |
| X003 | No whole-dashboard optimization. | slice 5 | |
| X004 | No general test framework. | slice 5 | |
| X005 | No general mocking framework. | slice 5 | |
| X006 | One test per current file is not required. | slice 5 | |
| X007 | One test per current helper is not required. | slice 5 | |
| X008 | Scope covers the selected comparison family and named review-refresh cases. | slice 5 | |
| X009 | No `test.setTimeout` to meet the target. | slice 5 | |
| X010 | No `test.slow()` to meet the target. | slice 5 | |
| X011 | No wall-clock waits to meet the target. | slice 5 | |
| X012 | No test retries to meet the target. | slice 5 | |
| X013 | No skips to meet the target. | slice 5 | |
| X014 | No platform exceptions to meet the target. | slice 5 | |
| X015 | No retained test gains a raised timeout. | slice 5 | |
