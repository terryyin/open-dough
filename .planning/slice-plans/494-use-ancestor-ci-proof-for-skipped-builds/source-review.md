# Source review — SEED-254#use-ancestor-ci-proof-for-skipped-builds

Launch: fresh general-purpose reviewer with no conversation inheritance after
trunk amendment absorbed 2026-11-07 (adapter wording). Only Goal, Scope,
Deferred promises/exclusions, and Examples from the amended
`.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds`
(no plan, return, product, or proof).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | When CI skipped the build of a story's Baseline, Branch, or Landed revision, the comparison can still use proof from an earlier build in that revision's own history. | slice 3 | observed: walk + Landed equivalent deliver ancestor proof use |
| C2 | The reviewer sees that the requested revision was skipped and which build the proof came from. | slice 1 | observed: intent-ci-comparison-skipped.spec.ts Skipped + Summary evidence (slice 1 proof) |
| C3 | Each comparison endpoint shows its requested revision's own status separately from the build whose proof it uses. | slice 1 | observed: IntentCiComparison + IntentScopeComparisonTable SlotSha status beside build |
| C4a | The requested revision's own status is its own build. | slice 1 | observed: requestedStatus optional when exact timed build at requested revision |
| C4b | The requested revision's own status is Cancelled. | slice 1 | observed: skipped.spec Cancelled baseline |
| C4c | The requested revision's own status is Skipped. | slice 1 | observed: skipped.spec Skipped planning-only |
| C4d | The requested revision's own status is No build with an unknown reason. | slice 1 | observed: skipped.spec No build code start; gaps unreadable workflow |
| C5a | Skipped means a confirmed skip: the provider reports skipped. | slice 1 | observed: requested-revision-ci-status.test.mjs provider skipped |
| C5b | Skipped means a confirmed skip: every change from the nearest ancestor with a build to the requested revision is excluded by the workflow's path rule at that revision. | slice 1 | observed: skipped.spec paths-ignore planning-only |
| C6 | A missing run alone is not a skip. | slice 1 | observed: code start No build not Skipped |
| C7a | A delete or rename of a path CI does not ignore leaves the reason unknown. | slice 1 | observed: noBuildReasonPhrase non-ignored-delete/rename |
| C7b | A mixed or unreadable diff leaves the reason unknown. | slice 1 | observed: noBuildReasonPhrase mixed-paths/unreadable-diff |
| C7c | An unreadable workflow policy leaves the reason unknown. | slice 1 | observed: noBuildReasonPhrase unsupported-workflow-policy/unreadable-revision; gaps.spec |
| C7d | No ancestor build within the readable history leaves the reason unknown. | slice 1 | observed: noBuildReasonPhrase no-ancestor-basis |
| C8 | When confirmation is prevented, the endpoint says which of the C7 factors prevented confirmation. | slice 1 | observed: No build explanations name the specific reason phrase |
| C9 | The walk on the endpoint's existing first-parent lineage and within its existing bounds uses the nearest build with usable proof. | slice 3 | observed: nearestRevisionBuild proofUsable within bounds |
| C10a | That walk continues past skipped revisions. | slice 3 | observed: skipped.spec walk past skipped start |
| C10b | That walk continues past revisions without a build. | slice 3 | observed: laterWithoutResult walk past unbuilt |
| C10c | That walk continues past builds whose proof is absent, expired, unreadable, invalid, or mismatched. | slice 3 | observed: walk past proofless parent to grandparent |
| C11a | The label names the source revision. | slice 3 | observed: grandparent shortSha in identity |
| C11b | The label names the run. | slice 3 | observed: run 100 |
| C11c | The label names the attempt. | slice 3 | observed: run 100 #1 |
| C11d | The label names the count of revisions passed over. | slice 3 | observed: ancestor: 2 later revisions |
| C12 | A revision that already falls back to an ancestor today (whether cancelled or unexplained) keeps that fallback. | slice 1 | observed: Cancelled/No build keep ancestor build (skipped.spec) |
| C13 | Such a revision now also shows its own status. | slice 1 | observed: Cancelled/Skipped/No build status shown with fallback |
| C14 | A confirmed-skipped landing uses the proof of its equivalent build only: the nearest ancestor build from which every change to the landing is CI-ignored. | slice 2 | observed: skipped.spec planning-only Landed equivalent build run 201 |
| C15a | If that equivalent build has no usable proof, Landed shows Skipped. | slice 2 | observed: skipped.spec without-proof Landed Skipped |
| C15b | If that equivalent build has no usable proof, Landed shows why that build's proof is unavailable. | slice 2 | observed: equivalent build published no CI proof summary |
| C15c | If that equivalent build has no usable proof, Landed walks no further. | slice 2 | observed: without-proof no older build/run |
| C16 | A cancelled or unexplained landing keeps today's exact-only result and explanation. | slice 2 | observed: landing-gaps cancelled exact-only |
| C17 | Landed never shows proof from before the story's code. | slice 2 | observed: no olderBaseline on Landed skip/no-proof/code cases |
| C18 | Proof at the requested revision itself stays authoritative whenever it exists. | slice 3 | observed: intent-ci-comparison.spec exact proof unchanged |
| C19 | This story covers GitHub Actions comparisons. | slice 1 | observed: GHA run listings + ci.yml workflow path only |
| C20 | Adapter projects use Intent's shared story comparison and its endpoint rules. |  | G1 |
| C21 | The live CI status judgment of a Taken story's branch head, including its running-ancestor proof, is unchanged. | slice 1 | observed: no live Taken CI judgment edits; taken.spec green |
| C22 | Keep GitHub requests accurate for the comparison's per-revision run and proof reads, including the extra proof reads this walk adds. | slice 3 | observed: GITHUB-REQUESTS.md comparison section |
| X1 | Deferred: Proof for a cancelled landing from a later trunk build — its own story. |  | G2 |
| X2 | Deferred: Telling skipped intermediate revisions apart from unexplained ones inside the "revisions passed over" count. |  | G3 |
| E1 | Docs-only landing: Landed Skipped at merge; uses parent's proof labelled with parent's revision, run, attempt. | slice 2 | observed: planning-only Landed Skipped + parent proof equivalent |
| E2 | Landing equivalent without proof: Landed Skipped + no CI proof summary; does not use an older build. | slice 2 | observed: without-proof Landed Skipped + no summary; no older |
| E3 | Skipped baseline: Skipped at start; grandparent proof; count 2. Same for skipped final branch revision. | slice 3 | observed: skipped.spec proofless parent → grandparent count 2 |
| E4 | Cancelled landing: Cancelled with today's explanation; no proof. | slice 2 | observed: landing-gaps cancelled landing |
| E5 | Cancelled baseline: Cancelled there and uses nearest ancestor's proof. | slice 1 | observed: skipped.spec Cancelled baseline + ancestor build |
| E6 | Unexplained Landed absence: No build; path rule does not account; no ancestor proof. | slice 2 | observed: code landing No build; no ancestor |
