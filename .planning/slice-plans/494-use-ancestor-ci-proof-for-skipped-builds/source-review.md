# Source review — SEED-254#use-ancestor-ci-proof-for-skipped-builds

Launch: fresh general-purpose reviewer with no conversation inheritance; only
Goal, Scope, Deferred promises/exclusions, and Examples from
`.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds`
(no plan, return, product, or proof). Returned 2026-11-07.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When CI skipped the build of a story’s Baseline, Branch, or Landed revision, the comparison may use proof from an earlier build in that revision’s own history. | slice 3 | observed: skipped.spec walks past proofless parent to grandparent run 100 proof; Landed equivalent from slice 2; Branch/Trunk walk via nearestRevisionBuild proofUsable |
| 2 | The reviewer sees that the requested revision was skipped and which build the proof came from. | slice 1 | observed: intent-ci-comparison-skipped.spec.ts: Baseline Skipped wording + ancestor run 101; Summary .intent-summary-evidence same Skipped text |
| 3 | Each comparison endpoint shows its requested revision’s own status separately from the build whose proof it uses. | slice 1 | observed: IntentCiComparison EndpointIdentity prefixes requestedStatusWords; IntentScopeComparisonTable SlotSha same beside build SHA; skipped.spec asserts both |
| 4.1 | The requested revision’s own status is its own build. | slice 1 | observed: requestedStatus optional when requested revision supplies the timed build (storyCiComparison.ts); EndpointIdentity shows BuildIdentity alone without status prefix |
| 4.2 | The requested revision’s own status is Cancelled. | slice 1 | observed: skipped.spec Cancelled baseline; requested-revision-ci-status.test.mjs cancelled conclusion |
| 4.3 | The requested revision’s own status is Skipped. | slice 1 | observed: skipped.spec Skipped planning-only baseline; requestedRevisionCiStatus path-confirmed and provider skipped |
| 4.4 | The requested revision’s own status is No build with an unknown reason. | slice 1 | observed: skipped.spec No build code start; gaps.spec No build unreadable-workflow wording |
| 5.1 | Skipped means a confirmed skip: the provider reports skipped. | slice 1 | observed: requested-revision-ci-status.test.mjs provider skipped conclusion → kind skipped |
| 5.2 | Skipped means a confirmed skip: every change from the nearest ancestor with a build to the requested revision is excluded by the workflow’s path rule at that revision. | slice 1 | observed: skipped.spec planning-only paths-ignore; classifyPathChangesViaRunGit ignored-only not_required |
| 6 | A missing run alone is not a skip. | slice 1 | observed: skipped.spec code start with no run → No build not Skipped; requestedRevisionCiStatus required verdict |
| 7.1 | A delete or rename of a path CI does not ignore leaves the reason unknown; the endpoint says which prevented confirmation. | slice 1 | observed: noBuildReasonPhrase non-ignored-delete and non-ignored-rename phrases in requested-revision-ci-status.test.mjs |
| 7.2 | A mixed or unreadable diff leaves the reason unknown; the endpoint says which prevented confirmation. | slice 1 | observed: noBuildReasonPhrase mixed-paths and unreadable-diff phrases in requested-revision-ci-status.test.mjs |
| 7.3 | An unreadable workflow policy leaves the reason unknown; the endpoint says which prevented confirmation. | slice 1 | observed: noBuildReasonPhrase unsupported-workflow-policy and unreadable-revision; gaps.spec unreadable workflow No build |
| 7.4 | No ancestor build within the readable history leaves the reason unknown; the endpoint says which prevented confirmation. | slice 1 | observed: noBuildReasonPhrase no-ancestor-basis in requested-revision-ci-status.test.mjs |
| 8 | The walk uses the endpoint’s existing first-parent lineage and stays within its existing bounds. | slice 3 | observed: nearestRevisionBuild keeps existing first-parent revisions and boundExclusive; Baseline bound 30; GITHUB-REQUESTS.md documents bounds |
| 9 | The walk uses the nearest build with usable proof. | slice 3 | observed: nearestRevisionBuild + proofUsable selects nearest timed build with usable proof; skipped.spec run 100 not 101 |
| 10.1 | The walk continues past skipped revisions. | slice 3 | observed: skipped.spec Skipped start walked to grandparent; laterWithoutResult count 2 |
| 10.2 | The walk continues past revisions without a build. | slice 3 | observed: existing walk past revisions without build retained; laterWithoutResult counting |
| 10.3 | The walk continues past builds whose proof is absent, expired, unreadable, invalid, or mismatched. | slice 3 | observed: skipped.spec past proofless parent (proof none) to grandparent; dashboard-ci-revision-nearest.test.mjs proofUsable gate |
| 11.1 | The label names the source revision. | slice 3 | observed: skipped.spec baseline identity contains grandparent shortSha |
| 11.2 | The label names the run. | slice 3 | observed: skipped.spec run 100 |
| 11.3 | The label names the attempt. | slice 3 | observed: skipped.spec run 100 #1 |
| 11.4 | The label names the count of revisions passed over. | slice 3 | observed: skipped.spec ancestor: 2 later revisions (G3 deferred breakdown of skipped vs unexplained inside count) |
| 12 | A revision that already falls back to an ancestor today (cancelled or unexplained) keeps that fallback and now also shows its own status. | slice 1 | observed: skipped.spec Cancelled at start keeps ancestor build run 101 and wall time; unexplained No build keeps ancestor in code-start and gaps specs |
| 13 | A confirmed-skipped landing uses the proof of its equivalent build only: the nearest ancestor build from which every change to the landing is CI-ignored. | slice 2 | observed: skipped.spec planning-only Landed: Skipped + trunkSide run 201 #1 equivalent build + entry figures from parent proof; not olderBaseline |
| 14.1 | If that equivalent build has no usable proof, Landed shows Skipped. | slice 2 | observed: skipped.spec without-proof Landed: Skipped at merge |
| 14.2 | If that equivalent build has no usable proof, Landed shows why that build’s proof is unavailable. | slice 2 | observed: skipped.spec without-proof: The equivalent build at trunkSide published no CI proof summary |
| 14.3 | If that equivalent build has no usable proof, Landed walks no further. | slice 2 | observed: skipped.spec without-proof: no run 201/101, no olderBaseline SHA, wall — |
| 15 | A cancelled or unexplained landing keeps today’s exact-only result and explanation. | slice 2 | observed: landing-gaps.spec cancelled landing exact-only wording unchanged (re-run green) |
| 16 | Landed never shows proof from before the story’s code. | slice 2 | observed: without-proof and code-landing cases name no olderBaseline; planning-only uses only parent equivalent |
| 17 | Proof at the requested revision itself stays authoritative whenever it exists. | slice 3 | observed: intent-ci-comparison.spec.ts exact proof unchanged (agent reported green); exact selection still preferred when requested revision has usable proof |
| 18 | Applies to GitHub Actions comparisons only. | slice 1 | observed: comparison path uses GitHub Actions run listings and ci.yml workflow file only (requestedRevisionCiStatus + baseCiGithubRevisionLookup) |
| 19 | Adapter projects get story comparison in SEED-257, which applies these endpoint rules there. |  | G1 |
| 20 | The live CI status judgment of a Taken story’s branch head, including its running-ancestor proof, is unchanged. | slice 1 | observed: git diff base..worktree touches no live Taken-branch CI judgment modules; intent-ci-comparison-taken.spec.ts stays green |
| 21 | Keep GitHub requests accurate for the comparison’s per-revision run and proof reads, including the extra proof reads this walk adds. | slice 3 | observed: dashboard/GITHUB-REQUESTS.md CI timing comparison section: per-revision head_sha listings + proof reads including walk extras |
| 22 | Deferred: Proof for a cancelled landing from a later trunk build — its own story. |  | G2 |
| 23 | Excluded / deferred: Telling skipped intermediate revisions apart from unexplained ones inside the “revisions passed over” count. |  | G3 |
| 24 | Docs-only landing: Landed shows Skipped at the merge and uses the parent’s proof, labelled with the parent’s revision, run, and attempt. | slice 2 | observed: skipped.spec planning-only Landed docs/planning merge → Skipped + parent proof labelled equivalent build |
| 25 | Landing equivalent build without proof: Landed shows Skipped and that the parent’s build at `<rev>` published no CI proof summary; it does not use an older build. | slice 2 | observed: skipped.spec without-proof Landed → Skipped + no CI proof summary; no older build |
| 26 | Skipped baseline: Baseline shows Skipped at the start commit and uses the grandparent’s proof, counting two revisions passed over. Same rule for a skipped final branch revision on the story branch. | slice 3 | observed: skipped.spec Baseline Skipped at start, grandparent proof run 100, ancestor count 2; skip status names proofless parent as nearest built ancestor |
| 27.1 | Cancelled landing: Landed shows Cancelled with today’s explanation and no proof. | slice 2 | observed: landing-gaps.spec cancelled landing merge keeps today explanation and no proof |
| 27.2 | Baseline revision with a cancelled run shows Cancelled there and uses its nearest ancestor’s proof. | slice 1 | observed: skipped.spec Cancelled at start + ancestor build run 101 retained |
| 28 | Unexplained absence: Landed shows No build, explains that CI’s path rule does not account for the absence, and uses no ancestor proof. | slice 2 | observed: skipped.spec code landing No build path reason; no trunkSide/run 201/equivalent build; wall — |
