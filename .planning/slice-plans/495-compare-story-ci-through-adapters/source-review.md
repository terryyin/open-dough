# Independent source review

Launch: `/root/source_review`, a fresh general-purpose reviewer with
`fork_turns: none`. Input: the selected seed's Beneficiary, Goal, Scope,
Deferred promises and Key examples, as included in the launch message.
The reviewer received no plan, product, proof or implementation context and
returned the numbered commitments, qualifications and journeys below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Enable a developer reviewing a Taken or Done story in a project configured with `ciAdapter` to use Intent’s story CI comparison to assess changes in CI proof and time. | slice 4 | |
| C02 | Show the Baseline build. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter merge and fast-forward fixture’s Baseline row and baseline slot |
| C03 | Show the Branch or Provisional build, as applicable under the existing comparison rules. | slice 3 | |
| C04 | Show the Landed build when the story has landed and a qualifying attempt is available. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter merge and fast-forward fixture’s Landed row and landed slot |
| C05 | Find endpoint builds among the attempts returned by the adapter’s existing `discover` operation. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter fixture’s discover requests and returned build identities |
| C06 | Match attempts to endpoint revisions by full `sha`. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter fixture supplies uppercase full branch SHA and asserts canonical full revision on the wire |
| C07 | Keep the existing endpoint and first-parent ancestry rules. | slice 3 | |
| C08 | Resolve Baseline at or before the story start. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge and fast-forward fixture’s Baseline ancestor and revision assertions |
| C09 | Resolve Branch or Provisional at the tip or a later story-side ancestor under the existing rules. | slice 3 | |
| C10 | Resolve Landed exactly at the landing revision in Story Branch Mode. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge fixture supplies a distinct later completion build and asserts the exact landing merge |
| C11 | Resolve Landed by the completion walk in Trunk Mode. | slice 3 | |
| C12 | Call `discover` for the configured target branch, following the CI status tab’s existing behavior. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter fixture’s recorded main discovery request |
| C13 | Also call `discover` for the story’s branch when it is known. | slice 3 | |
| C14 | Count an attempt for its exact revision regardless of the branch it was validated for. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: fast-forward fixture supplies the exact SHA only for an attempt validated on ci/another-branch and asserts Branch and Landed |
| C15 | For a revision, select by newest `time` within the same check and context, subject to the completed-attempt preference. | slice 3 | |
| C16 | A completed `success` takes precedence over a later `incomplete` attempt at that revision. | slice 3 | |
| C17 | A completed `failure` takes precedence over a later `incomplete` attempt at that revision. | slice 3 | |
| C18 | Treat `pending` as running. | slice 3 | |
| C19 | Show each displayed build’s revision. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: all fixture build rows show the revision and the comparison response names its full SHA |
| C20 | Show its revision subject. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: all fixture build rows show the subject read from the real commit |
| C21 | Indicate whether the build is exact or from an ancestor. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: fixture asserts ancestor wording for Baseline and Branch at the merge and exact wording for Landed and fast-forward |
| C22 | Show its adapter `url` when supplied. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: all fixture build rows have the adapter URL as the run link |
| C23 | Show its `runId` as text. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter fixture asserts opaque text and numeric source run IDs rendered and returned as text |
| C24 | Show its `attemptId` as text. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter fixture asserts opaque text and numeric source attempt IDs rendered and returned as text |
| C25 | Show its outcome. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: adapter fixture asserts passed on each rendered endpoint and pass in each slot |
| C26 | Measure wall time from `startedAt` to `completedAt` when both are present, as the CI status tab does. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge and fast-forward wall-time values and wire timestamp assertions, including after the SEED-256 integration |
| C27 | When either timestamp is absent, say the build’s wall time is not recorded. | slice 3 | |
| C28 | Omit the wall-time difference for a build whose wall time is not recorded. | slice 3 | |
| C29 | Read proof for each completed build through the existing adapter `proof` operation. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge expects exactly three proof requests for the three completed endpoints |
| C30 | Pass the endpoint build’s `runId` to `proof`. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: recorded proof requests compare each attempt's runId as text, including the numeric fixture ID |
| C31 | Pass its `attemptId` to `proof`. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: recorded proof requests compare each attemptId as text |
| C32 | Pass its full revision to `proof`. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: recorded proof requests compare full endpoint revision, including canonical lower case |
| C33 | Pass the branch whose `discover` response listed the attempt to `proof`. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: proof request compares setup.branch for the Branch attempt validated on ci/another-branch |
| C34 | Apply the existing proof validity rules. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: fast-forward invalid Baseline summary gives adapter validation reason |
| C35 | Apply the existing `attemptId` ambiguity rules. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: fast-forward retains an older answered duplicate before newest selection, shows Branch and Landed ambiguity and sends only Baseline proof |
| C36 | Compare proof counts as for GitHub Actions. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: comparison entry row shows 5 to 8 +3 tests |
| C37 | Handle reported `durationMs` as for GitHub Actions. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: comparison entry row shows 3 s to 5 s +2 s |
| C38 | When no returned attempt covers a qualifying revision, show the existing endpoint-specific “No completed CI build was found …” wording. This covers both never-built and no-longer-retained revisions. | slice 3 | |
| C39 | When `discover` fails, make the endpoints unavailable with the adapter’s reason, following CI status behavior. | slice 3 | |
| C40 | When `discover` times out, make the endpoints unavailable with the adapter’s reason, following CI status behavior. | slice 3 | |
| C41 | Keep the build visible when its proof summary is missing. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge Landed identity and missing-summary reason coexist |
| C42 | Show the proof read’s own reason when its summary is missing. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge entry Landed gap contains no summary retained for this attempt |
| C43 | Keep the build visible when its proof summary is invalid. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: fast-forward Baseline row keeps revision, link, passed state and wall time alongside invalid-proof reason |
| C44 | Show the proof read’s own reason when its summary is invalid. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: fast-forward empty entry area displays the validator's Baseline reason |
| C45 | Preserve GitHub Actions comparisons. | slice 3 | |
| C46 | Preserve the CI status tab. | slice 3 | |
| E01 | Done Pygardon story SEED-20261076 started at `305165fa4`, branch side `eee4fa149`, landed by merge at `b450e5058`. Baseline is `36191bf8b`, the nearest built ancestor of the start, validated for `main`. | slice 4 | |
| E02 | Same landing-merge story. Branch is `90038b500`, the nearest built story-side ancestor of the branch-side end, validated for `cursor/publish-pygardon-ci-proof-for-intent`. | slice 4 | |
| E03 | Same landing-merge story. Landed is exactly `b450e5058`, validated for `main`. | slice 4 | |
| E04 | Same story, where proof summaries are kept. Show the proof counts for each available summary, such as `tests` with 6,402 checks. | slice 4 | |
| E05 | Pygardon summaries in this example carry no `durationMs`. Omit the proof-duration difference. | slice 4 | |
| E06 | Done Pygardon story SEED-20261075 started at `5e8976e65` and fast-forwarded to `16b339eb8`. Baseline is the ancestor `b450e5058`. | slice 4 | |
| E07 | The passing attempt at `16b339eb8` was validated for `cursor/receive-jobs-status-changes-as-they-happen`. Branch is exactly `16b339eb8`. | slice 4 | |
| E08 | Same fast-forward and branch-validated attempt. Landed is also exactly `16b339eb8`. | slice 4 | |
| E09 | Taken Story Branch story in an adapter fixture. The tip has a `pending` attempt and the previous story-side commit has a completed `success`. Branch shows the previous commit’s ancestor build. | slice 3 | |
| E10 | The completed ancestor attempt started at 10:00:00 and completed at 10:06:30. Branch shows a wall time of 6 min 30 s in the same form as a GitHub build. | slice 3 | |
| E11 | The later tip attempt is `pending`. The comparison indicates that a later attempt is still running. | slice 3 | |
| E12 | The story is still Taken and has yet to land. Landed says the story has not landed yet. | slice 3 | |
| E13 | The CI service pruned attempts for the story start and its 30 first-parent ancestors in the supplied example. Baseline uses “No completed CI build was found at or before the story’s start …”. The count of 30 describes the example. | slice 3 | |
| E14 | Same expired-baseline example. Branch keeps its build. | slice 3 | |
| E15 | Same expired-baseline example. Landed keeps its build. | slice 3 | |
| E16 | The landed build exists and `proof` returns `{"unavailable": "no summary retained for this attempt"}`. Landed keeps its revision visible. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge Landed revision assertion after selecting fixture with unavailable proof |
| E17 | Same proof response. Landed keeps its outcome visible. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge Landed passed state assertion |
| E18 | Same proof response. Landed keeps its wall time visible. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge Landed 4 min wall-time assertion beside missing proof |
| E19 | Same proof response. Landed shows “no summary retained for this attempt” where its counts would appear. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge Landed entry cell names no summary retained for this attempt |
| E20 | At one landing revision, a `failure` at 09:00 is followed by a retry `success` at 09:20. Landed uses the 09:20 success. | slice 3 | |
| D01 | The comparison uses existing adapter operations. Pygardon’s `discover` was observed to return all retained attempts across branches. | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: request log proves comparison uses existing discover and proof operations only; the plan's Pygardon discovery premise establishes retained cross-branch attempts |
| D02 | A separate lookup for attempts the CI service has pruned is deferred. | slice 3 | |
| D03 | Treat expiry as a named gap. Reconsider historical lookup only if retention proves too short in use. | slice 3 | |
| D04 | SEED-256 owns time without runner waits for adapter builds. | slice 3 | |
| D05 | SEED-256’s unavailable-with-reason rule covers attempts without a job graph. | slice 3 | |
| D06 | SEED-254 owns ancestor proof for skipped builds. Its behavior applies to adapter builds through the shared comparison answer when both are present. | slice 3 | |
| D07 | SEED-255 owns comparison cues and wording. Its behavior applies to adapter builds through the shared comparison answer when both are present. | slice 3 | |
| D08 | Pygardon’s `discover` currently omits `startedAt`. Its SEED-20261079#show-ci-attempt-wall-time owns adding it. | slice 4 | |
| D09 | Pygardon’s `discover` currently omits `completedAt`. The same Pygardon story owns adding it. | slice 4 | |
| D10 | Until that story lands, live Pygardon builds show wall time as “not recorded”. | slice 4 | |
| D11 | Prove adapter wall-time behavior with an adapter fixture. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts: merge and fast-forward Playwright adapter fixtures assert each endpoint wall time |
