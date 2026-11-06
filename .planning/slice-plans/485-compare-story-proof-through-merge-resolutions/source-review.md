# Source review: SEED-248#compare-story-proof-through-merge-resolutions

**Launch:** fresh general-purpose reviewer (agent `74be59f4-eff2-44cd-9e33-9846161050f1`), no conversation inheritance; instructed to use only supplied story Goal, Scope, key examples and exclusions; read no other project files; change nothing.

**Input:** seed section Compare story proof through merge resolutions — Beneficiary, Goal, Required behavior, Key examples / evaluation 1–9, Scope boundaries / exclusions, and the architecture note as commitment context only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Selecting a done Story Branch Mode story shows three independently identified CI proofs: Baseline A, Branch B, and Landed C. | slice 1 | observed: intent-ci-comparison.spec.ts owning/non-owning variants: three identity slots baseline/branchSide/completion |
| 2 | Selecting a done Story Branch Mode story shows both comparisons against the same pre-story baseline: B versus A and C versus A. | slice 1 | observed: intent-ci-comparison.spec.ts: +20 s on branch wall, +1 min on landed wall vs baseline |
| 3 | Commitments 1 and 2 hold even when merge edits prevent an exclusive attribution of the story's code diff. | slice 1 | observed: intent-ci-comparison.spec.ts own-conflict-extra and non-owning-story-file: A/B/C + walls while Review refuses |
| 4 | Baseline A is the last relevant completed CI build before the story's first published execution claim. | slice 1 | observed: intent-ci-comparison.spec.ts baseline identity nth(0) + ancestor laterWithoutBuild; lookupBaselineBuild path unchanged |
| 5 | For Baseline A, the story-start boundary and measured build stay fixed to this story. | slice 1 | observed: intent-ci-comparison.spec.ts story-start bound via completedStoryClaimEvidence.storyStart; baseline fixed per setup |
| 6 | Branch B is the build for the final published story-branch revision immediately before its integration into the configured trunk (`main` here). | slice 1 | observed: intent-ci-comparison.spec.ts branch identity nth(1) shortSha(setup.branchSide) |
| 7 | Branch B is recovered from the story-side parent of the landing merge. | slice 2 |  |
| 8 | Landed C is the build at that integration merge on trunk, including its merge-resolution edits. | slice 1 | observed: intent-ci-comparison.spec.ts landed identity nth(2) at completion/merge with resolution variants still naming that build |
| 9 | A later commit that marks the story done must not replace the merge build as C. | slice 2 |  |
| 10 | A later commit that repairs CI must not replace the merge build as C. | slice 2 |  |
| 11 | A later commit that advances unrelated work must not replace the merge build as C. | slice 2 |  |
| 12 | A failed merge build remains identifiable as failed. | slice 2 |  |
| 13 | Where there is no branch-side build, the applicable existing Trunk Mode comparison is preserved. | slice 1 | observed: intent-ci-comparison-gaps.spec.ts Trunk Mode done story: Branch N/A, Landed ancestor when needed |
| 14 | Show each available proof's observed results at the existing comparison scopes. | slice 1 | observed: intent-ci-comparison + intent-summary-story-comparison + -file: observed results at homepage/entry/folder/file |
| 15 | Show each available proof's counts at the existing comparison scopes. | slice 1 | observed: intent-summary-story-comparison.spec.ts and -file: folder/file count columns on same A/B/C |
| 16 | Show each available proof's durations at the existing comparison scopes. | slice 1 | observed: intent-ci-comparison.spec.ts walls 3 min / 3 min 20 s / 4 min; summary specs duration columns |
| 17 | The existing comparison scopes are: homepage; entry; folder; and file comparisons. | slice 1 | observed: homepage intent-ci-comparison; entry rows; folder intent-summary-story-comparison; file intent-summary-story-comparison-file |
| 18 | Show B versus A and C versus A separately. | slice 1 | observed: intent-ci-comparison.spec.ts separate +20 s (B vs A) and +1 min (C vs A) walls |
| 19 | Include the measured values wherever supported by that proof. | slice 1 | observed: intent-ci-comparison.spec.ts measured wall texts on each slot |
| 20 | Include the signed differences wherever supported by that proof. | slice 1 | observed: intent-ci-comparison.spec.ts signed +20 s and +1 min; summary signed diffs |
| 21 | Identify each build by revision. | slice 1 | observed: intent-ci-comparison.spec.ts shortSha on each identity |
| 22 | Identify each build by run/attempt. | slice 1 | observed: intent-ci-comparison.spec.ts run 101/102/103 #1 links |
| 23 | Identify each build by state. | slice 1 | observed: intent-ci-comparison-gaps.spec.ts failed/running/missing landed state labels |
| 24 | Identify each build by available link. | slice 1 | observed: intent-ci-comparison.spec.ts href https://ci.invalid/runs/101\|102\|103 |
| 25 | Keep CI wall time distinct from cumulative test execution time. | slice 1 | observed: intent-ci-comparison-entries + homepage: wall vs cumulative execution columns distinct |
| 26 | Retain useful duration precision. | slice 1 | observed: intent-ci-comparison.spec.ts 3 min 20 s precision retained |
| 27 | Label any supported measured-ancestor fallback with the actual measured revision. | slice 1 | observed: intent-ci-comparison.spec.ts baseline ancestor label; gaps Trunk Mode Landed ancestor label |
| 28 | A fallback must not silently turn B into C. | slice 1 | observed: intent-ci-comparison.spec.ts distinct branchSide vs completion SHAs; no silent B→C |
| 29 | A fallback must not substitute a later completion build for C. | slice 2 |  |
| 30 | Recover build identities independently of the ability to assign individual code edits exclusively to this story. | slice 1 | observed: storyPublishedEndpoints uses completedStoryClaimEvidence; comparison journeys name builds under attribution refusal |
| 31 | A merge-resolution attribution warning in Review changes must not suppress otherwise recoverable CI proof. | slice 1 | observed: intent-ci-comparison resolution variants show CI panel; Review conflict specs return unavailable |
| 32 | A merge-resolution attribution warning in Review changes must not suppress either valid proof comparison. | slice 1 | observed: intent-ci-comparison + summary + file resolution variants retain B vs A and C vs A |
| 33 | Keep source-diff attribution truthful where it remains ambiguous. | slice 1 | observed: story-review-completed-conflicts.spec.ts own-conflict-extra and non-owning-story-file quoted refusals unchanged |
| 34 | Treat a missing or ambiguous build identity as an explicit gap in the affected endpoint or figure. | slice 1 | observed: intent-ci-comparison.spec.ts / gaps: unrecoverable and missing identities explain gaps |
| 35 | Treat a missing build as an explicit gap in the affected endpoint or figure. | slice 1 | observed: intent-ci-comparison-gaps.spec.ts missing landed build explains without inventing zero |
| 36 | Treat a running attempt as an explicit gap in the affected endpoint or figure. | slice 1 | observed: intent-ci-comparison-gaps.spec.ts running landed build leaves branch comparison readable |
| 37 | Treat an expired summary as an explicit gap in the affected endpoint or figure. | slice 1 | observed: intent-ci-comparison-entries.spec.ts expired entry proofs keep walls and explain entry gap |
| 38 | Treat partial proof as an explicit gap in the affected endpoint or figure. | slice 1 | observed: intent-ci-comparison-entries.spec.ts summary without durations leaves totals explained |
| 39 | Keep other recoverable proofs readable when some proofs or identities have gaps. | slice 1 | observed: gaps/entries: recoverable A/B remain while C or entry figures gap |
| 40 | Keep other recoverable comparisons readable when some proofs or identities have gaps. | slice 1 | observed: gaps.spec.ts running C: B versus A readable |
| 41 | Missing proof never becomes zero. | slice 1 | observed: gaps.spec.ts missing landed never invents zero |
| 42 | Missing proof never becomes no change. | slice 1 | observed: entries.spec.ts missing durations never become no change / zero totals |
| 43 | Keep the comparisons tied to published history after branch/profile cleanup. | slice 1 | observed: intent-ci-comparison.spec.ts persistence after branch/profile cleanup journey |
| 44 | Keep the comparisons tied to published history after later trunk advances, including a later story's fast-forward that changes which revisions trunk's first-parent line passes through. | slice 3 |  |
| 45 | Frame comparison differences as observations between builds. | slice 1 | observed: IntentCiComparison + IntentScopeComparisonTable framing via observedNotAttributed |
| 46 | Comparison differences do not establish that the story caused every difference. | slice 1 | observed: storyCiComparisonWording.observedNotAttributed: observations between builds, never attributed to the story |
| 47 | Identify the landing by the story's own history. | slice 3 |  |
| 48 | Do not identify the landing by parent position. | slice 3 |  |
| 49 | Do not identify the landing by trunk's current first-parent line. | slice 3 |  |
| 50 | A trunk-first landing merge supplies C. | slice 2 |  |
| 51 | A trunk-first landing merge supplies B from its story-side parent. | slice 2 |  |
| 52 | A fast-forward landing has no integration merge: B and C both name the final story revision that trunk accepted. | slice 3 |  |
| 53 | A merge of trunk into the story branch is a branch revision, never the landing. | slice 3 |  |
| 54 | The trunk-side parent of a merge of trunk into the story branch is never B. | slice 3 |  |
| 55 | C has no measured-ancestor fallback across the landing merge. | slice 2 |  |
| 56 | C's trunk-side parent lacks the story and is not a measured-ancestor fallback for C. | slice 2 |  |
| 57 | C's story-side parent is B and is not a measured-ancestor fallback for C. | slice 2 |  |
| 58 | A missing merge build is C's explicit gap. | slice 2 |  |
| 59 | A cancelled merge build is C's explicit gap. | slice 2 |  |
| 60 | A running merge build is C's explicit gap. | slice 2 |  |
| 61 | Branch B keeps its existing story-side ancestor fallback. | slice 3 |  |
| 62 | The Trunk Mode landed fallback is unchanged. | slice 3 |  |
| 63 | Endpoint recovery for a done story is a responsibility separate from completed-story code attribution. | slice 1 | observed: storyPublishedEndpoints → completedStoryClaimEvidence (claim beside facts); storyReviewPublished → completedStoryAttribution on that claim |
| 64 | Review changes keeps requiring attribution. | slice 1 | observed: story-review-completed-conflicts + driver: unavailable with attribution messages |
| 65 | CI comparison depends only on endpoint recovery. | slice 1 | observed: intentCiComparisonResolve / publishedStoryEndpoints without resolutions; file comparison follows CI evidence |
| 66 | Endpoints stay derived from published Git and CI evidence under ADR 0008. | slice 1 | observed: publishedStoryEndpoints from published Git/CI evidence only; no landing-context input |
| 67 | Local landing context cannot supply endpoints. | slice 1 | observed: storyPublishedEndpoints.ts has no landing-context parameter or import |
| E1 | Merge resolutions with three proofs: baseline 180 s, branch 200 s, merge 240 s; resolved edits prevent safe attribution; selecting names all three and shows B versus A +20 s and C versus A +60 s; entry rows retain both comparisons. | slice 1 | observed: intent-ci-comparison.spec.ts own-conflict-extra: three builds, +20 s, +1 min, entry rows |
| E2 | Reported refusal path: another merge resolves a story file; quoted attribution warning; when A, B and C recover, Intent still shows proof comparisons; source-diff limitation explained separately. | slice 1 | observed: intent-ci-comparison.spec.ts non-owning-story-file + Review conflicts quoted message; Intent still shows comparisons |
| E3 | Completion after integration: Landed names M not D; B remains M's story-side parent; failed M identifiable. | slice 2 |  |
| E4 | One unavailable proof: A and B readable while C running or summary expired; B versus A readable; C explains its gap; wall time usable without summary. | slice 1 | observed: intent-ci-comparison-gaps.spec.ts running landed + entries expired summary journeys |
| E5 | Summary consumers: entry, folder or file with retained proof at all three builds uses same A, B and C as homepage including counts and signed execution-time differences; code-attribution refusal alone does not remove the proof comparison. | slice 1 | observed: intent-summary-story-comparison.spec.ts and -file resolution variants: same A/B/C; refusal does not remove proof comparison |
| E6 | Fast-forward landing: B and C name tip T; main-side parent of branch's merge never B. | slice 3 |  |
| E7 | Later fast-forward moves first-parent history: earlier story still names M as C and M's story-side as B; A unchanged. | slice 3 |  |
| E8 | Cancelled merge build: C explains cancelled; no figures from trunk-side parent; B versus A readable. | slice 2 |  |
| E9 | Cleanup and missing identities: after branch/profile delete and trunk advance, same three builds remain; one unrecoverable endpoint gap keeps other proofs. | slice 1 | observed: intent-ci-comparison.spec.ts cleanup/persistence + unrecoverable endpoint gap journeys |
| X1 | No new proof generation is required. | slice 1 | observed: diff introduces no new proof generation |
| X2 | No stored timing copies are required. | slice 1 | observed: diff introduces no stored timing copies |
| X3 | No CI-provider contract change is required. | slice 1 | observed: diff introduces no CI-provider contract change |
| X4 | No causal performance claim is required. | slice 1 | observed: diff introduces no causal performance claim |
| X5 | No new file-tab design is required. | slice 1 | observed: IntentFileComparison compact reuse only; no new file-tab design |
| X6 | This story does not relax source-diff attribution requirements. | slice 1 | observed: Review attribution refusals retained in conflicts/driver specs |
| X7 | This story does not change the no-story-selected CI judgment. | slice 1 | observed: no-story-selected CI judgment path unchanged (IntentFileComparison judged without comparison returns null) |
| X8 | Shared consumers do not establish a blocking dependency on another queued story. | slice 1 | observed: no new blocking dependency on another queued story |
| X9 | Local landing context cannot supply endpoints. | slice 1 | observed: no local landing context used for endpoints |
| X10 | Adding landing revisions to done records is outside this story. | slice 1 | observed: no landing revisions added to done records |
| X11 | Scope is correct endpoint recovery, proof availability, and their existing consumers only. | slice 1 | observed: changes limited to endpoint recovery, proof availability, existing consumers |

## Qualifications retained

Q1–Q11 as returned by the source-only reviewer (apply when observing the matching commitment).
