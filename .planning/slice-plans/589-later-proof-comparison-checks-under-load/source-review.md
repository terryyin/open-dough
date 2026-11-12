# Source review

Launch: a fresh general-purpose reviewer without conversation inheritance, on 12 November 2026, before the first delegation.
Input: only the story section of `SEED-326#pass-later-proof-comparison-checks-under-load` (title, identity, Goal, Scope, scope limits, observations, required restrictions, key examples), as one extracted file with SHA-256 `04a27c76fcf2d7dfa339d122f56e2fce8884fef16614d84b77b44ca2919e4c38`. No plan, product, proof or slice scope was supplied. O ids are the story's dated observations.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Goal: maintainers get a fast passing verdict from the "later" pending-proof checks of the Intent CI comparison while the machine is under moderately high CPU load. | slice 3 | |
| G2 | Goal qualification: that verdict comes with the default case timeout. | slice 3 | |
| G3 | Goal qualification: that verdict comes with wide margin. | slice 3 | |
| G4 | Goal (stated reason): each promise is proven once at the cheapest boundary that can prove it. | slice 2 | observed: dashboard/tests/intent-ci-comparison-proof.md#later-pending-proof-coverage-map: one owning check per promise; later head-ended real-server case removed |
| G5 | Goal (stated reason): no case pays one load-sensitive process start per walked revision. | slice 2 | observed: scratch github.calls counts: equivalent recovers 33 (14 runs), both provider-wait cases 20 (8 runs); baseline later 120 (101) |
| S1.1 | Testing approach: everything past the walk limit is proven by in-process rule checks that arrange history as supplied facts. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts: history supplied by representedFinalityFacts(later, 30); head-for-bound fault fails its pending assertion |
| S1.2 | Testing approach: those in-process checks include the judgment the landed history collection shares with comparison memory (`landedSlotResolution` in `dashboard/server/landedCiResolution.ts`). | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts calls landedSlotResolution as landingResolution composes it |
| S1.3 | Testing approach: no real-server case builds history past the 30-revision walk. | slice 2 | observed: dashboard/tests/support/pendingLandedComparison.ts: laterRevisionsAfterCompletion and commitTrunkChanges removed |
| S1.4 | Testing approach: a real-server case that then adds nothing a cheaper check lacks is removed, not shortened. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts: later malformed-listing case removed; head-ended variant caught no fault alone |
| S2.0 | Coverage kept, each promise owned by a named maintained check (applies to every S2 item below). | slice 2 | observed: dashboard/tests/intent-ci-comparison-proof.md#later-pending-proof-coverage-map |
| S2.1a | Coverage kept: unanswered proof keeps a later-provenance landing pending when the end is past the walk limit. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts pending toEqual; faults dropping the walk's unavailable build and reporting head for bound each fail it |
| S2.1b | Coverage kept: unanswered proof keeps a later-provenance landing pending after the landing hour has passed. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts clock at receipt + 3 h; faults ignoring proofUnanswered and dropping pending after the landing hour each fail it |
| S2.2 | Coverage kept: real malformed listing bytes reach that pending state through the default parsers. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts equivalent malformed case, pending-gap poll; fails when the unreadable listing loses its unanswered mark |
| S2.3a | Coverage kept: the public landed history shows the pending gap waiting for proof. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts equivalent case public gap waitsFor proof run 201; landed-ci-history-pending-proof.spec.ts; later: ci-comparison-finality-later-judgment.spec.ts |
| S2.3b | Coverage kept: the public landed history then shows the measured point with `later` provenance once proof answers. |  | G1 |
| S2.4 | Coverage kept: final answers reuse the proof without another `gh` call. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts equivalent case final toEqual(recovered) and unchanged calls.length; fails when the reader ignores its kept answer; later memory in ci-comparison-finality-unanswered and ci-comparison-memory-later |
| S2.5a | Coverage kept: a provider-directed wait holds a later-provenance read. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts later provider-wait case first read unavailable |
| S2.5b | Coverage kept: repeats (during the provider-directed wait) ask nothing. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts later provider-wait case: fault asking during a standing wait fails its first read; calls.length repeat assertion |
| S2.5c | Coverage kept: the read recovers after the controlled request-owner clock ends the wait. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts later provider-wait case recovered build; fails when the wait outlasts the owner clock |
| S2.5d | Coverage kept: the hold, the silent repeats and the recovery happen under the same owner process. | slice 2 | observed: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts later provider-wait case standingOwnerPid equals ownerPid; no fault run against it |
| S3.1 | Evidence: a coverage map from each promise above (the Coverage kept list) to its owning check. | slice 2 | observed: dashboard/tests/intent-ci-comparison-proof.md#later-pending-proof-coverage-map |
| S3.2 | Evidence: one fault control per promise that makes that check fail. | slice 2 | observed: dashboard/tests/intent-ci-comparison-proof.md#later-pending-proof-coverage-map fault column; scratch faults recorded in the plan |
| S4.1 | Promised load profile: a one-minute load average of 30–50 on the maintainer's 16-core machine. | slice 3 | |
| S4.2 | Promised load profile: with the file run on two workers. | slice 3 | |
| S4.3 | Load profile qualification: this is the profile proposed for SEED-324; Terry named "moderately high CPU load" without a figure. | slice 3 | |
| S5 | Speed target, stated relative to load: in one run of the file, each remaining "later" case body takes at most 1.5 times its "equivalent" sibling, which builds no later revisions. | slice 2 | observed: one run at load 4.9–5.0, one worker: later provider wait 3.2 s against equivalent 2.9 s, ratio 1.10 |
| S6.1 | Resolve the live candidate `later-comparison-walk-gh-starts` in the test optimization candidates (TEST-OPTIMIZATION-CANDIDATES.md) with the outcome. | slice 2 | observed: .planning/TEST-OPTIMIZATION-CANDIDATES.md: candidate removed as fixed |
| S6.2 | Bring the proof guide (dashboard/tests/intent-ci-comparison-proof.md) in line with the changed connection. | slice 2 | observed: dashboard/tests/intent-ci-comparison-proof.md#later-pending-proof-coverage-map and the Landed recovery connections row |
| S7.1 | Use shared MakeMe for domain data. | slice 2 | observed: unchanged makeMe.aLaunchRecord / makeMe.aCiRun arrangements in dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts and its support |
| S7.2 | Use existing external-provider fixtures. | slice 2 | observed: existing fake GitHub, rateLimitedAnswer and listingReuseWithOwnerClock fixtures |
| X1 | Scope limit: the product's sequential revision lookups in `dashboard/server/laterTrunkBuild.ts` stay as they are. | slice 2 | observed: diff holds no product file; laterTrunkBuild.ts unchanged |
| X2.1 | Scope limit: a cheaper synthetic `gh` start for the whole suite is outside this story. | slice 2 | observed: fake gh untouched |
| X2.2 | Scope limit: the 2.2 s shared landing fixture is outside this story. | slice 2 | observed: publishUnbuiltStoryLanding untouched |
| X3.1 | Scope limit: the "equivalent" cases change only where the shared setup requires it. | slice 2 | observed: git diff -w: equivalent malformed case only de-looped; provider-wait equivalent only its setup call |
| X3.2 | Scope limit: the SEED-324 checks change only where the shared setup requires it. | slice 2 | observed: SEED-324 checks not in the diff |
| O1 | Observation: with no extra later revisions the provider-wait "later" case passes unchanged; a held wait never reaches the rest of the walk. | slice 2 | observed: later provider-wait case passes with no extra revisions, first read unavailable |
| O2 | Observation: with no extra later revisions the line-31 "later" case fails: its history gap waits for a later build, not for proof of run 201. That join exists only past the walk limit. | slice 2 | observed: scratch head-ended later variant shows a later-build gap with no run |
| O3.1 | Observation: called in process with a completion plus 30 supplied revisions and a malformed listing, the shared judgment answers pending, waiting for proof of run 201 attempt 1, in 3 ms with 32 in-process lookups. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts pending for run 201 attempt 1 in 5 ms, no process start |
| O3.2 | Observation: with unanswered proof ignored in that judgment, it and all six finality rule cases fail. | slice 1 | observed: proofUnanswered-ignored fault: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts and all six ci-comparison-finality-unanswered.spec.ts cases fail |
| R1 | Keep the default case timeout. | slice 2 | observed: diff adds no timeout, slow, sleep, retry or skip |
| R2.1 | No timeout overrides to absorb load. | slice 2 | observed: diff adds no timeout, slow, sleep, retry or skip |
| R2.2 | No `test.slow()` to absorb load. | slice 2 | observed: diff adds no timeout, slow, sleep, retry or skip |
| R2.3 | No sleeps to absorb load. | slice 2 | observed: diff adds no timeout, slow, sleep, retry or skip |
| R2.4 | No retries to absorb load. | slice 2 | observed: diff adds no timeout, slow, sleep, retry or skip |
| R2.5 | No skips to absorb load. | slice 2 | observed: diff adds no timeout, slow, sleep, retry or skip |
| R3 | The walk limit stays a product constant with no test-only setting. | slice 2 | observed: walk limit untouched; no test-only setting |
| R4 | A flaky check is failing under the project's failing and flaky test policy until it is stable locally and in CI. | slice 3 | |
| E1 | One worker, any host load → run the file → each remaining "later" case body takes at most 1.5 times its "equivalent" sibling in the same run. | slice 2 | observed: same run: ratio 1.10 |
| E2 | The file runs → no case's recorded `gh` calls include a lookup per walked revision. | slice 2 | observed: same counts: no case makes a call per walked revision |
| E3 | A later-provenance landing with a completion plus 30 following revisions and a malformed listing → the in-process judgment check → pending, waiting for proof of run 201 attempt 1, with no process start. | slice 1 | observed: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts pending toEqual waitsFor proof run 201 attempt 1 |
| E4.1 | Load average 30–50, two workers → run the file three times in a row → every case passes each time. | slice 3 | |
| E4.2 | Load average 30–50, two workers → run the file three times in a row → the slowest case body stays under 10 s, a third of the 30 s default. | slice 3 | |
| E5.1 | The change is published → hosted CI passes the file's remaining cases and the rule checks with unchanged verdicts. | slice 3 | |
| E5.2 | The change is published → the file's recorded time falls from about 38 s. | slice 3 | |
| E6 | Fault control: the malformed listing is treated as an answered, final absence → the check owning "real malformed bytes reach pending" fails. | slice 2 | observed: ciProofArtifact.ts unreadable-listing without unansweredAs: equivalent malformed case fails its pending-gap poll |
| E7.1 | Fault control: the walk treats an end past the limit as awaiting a later build → the in-process rule check fails. | slice 1 | observed: head-for-bound fault in laterTrunkBuild.ts: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts receives pending later-build and fails; only this case catches it |
| E7.2 | Fault control: the walk drops pending once the landing hour passes → the in-process rule check fails. | slice 1 | observed: landing-hour fault in stillAwaited: dashboard/backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts receives final none and fails |
| E8 | Fault control: a final read asks GitHub again → the reuse check fails. | slice 2 | observed: comparison reader ignoring its kept answer: equivalent malformed case fails final toEqual(recovered) |
| E9.1 | Fault control: the owner clock's end of a provider wait no longer releases the read → the provider-wait check fails. | slice 2 | observed: heldBack outlasting the owner clock: later provider-wait case fails its recovered build |
| E9.2 | Fault control: a repeat read during the wait asks again → the provider-wait check fails. | slice 2 | observed: refusal ignored during a standing wait: later provider-wait case fails its first read (unavailable expected) |
