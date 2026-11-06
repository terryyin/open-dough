# Source review

**Plan:** [PLAN.md](PLAN.md)

Launch: a fresh general-purpose reviewer (no conversation inheritance) on
2026-11-06 during slice 1 acceptance
([Source-only story review](02be1970-f3a6-42f5-8d49-14be66baf33a)). Input: only
the selected story's Goal, Scope (required behavior and scope limits), and Key
examples, copied from
[the seed](../../seeds/SEED-244-story-ci-timing-changes.md#compare-story-ci-timing-changes).
Instructions: use only that input, read no other files, change nothing; return
numbered commitments, qualifications, trigger/journey examples and exclusions,
splitting compound items.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a selected story (especially a done one) can see on Intent’s CI status homepage how CI wall time and each Intent entry’s cumulative test execution time changed from the CI build before the story started. | slice 3 | observed: dashboard/tests/intent-ci-comparison.spec.ts + intent-ci-comparison-taken.spec.ts: selected done and Taken stories show wall and entry timing changes from pre-story baseline on Intent CI homepage |
| 2 | For Story Branch Mode, the developer can tell the change observed at the final story-branch build apart from the change observed after integration into trunk. | slice 3 | observed: dashboard/tests/intent-ci-comparison-taken.spec.ts Story Branch: provisional Branch vs Landed not-yet-landed; done path separates final branch vs landed (slices 1–2) |
| 3 | The result shows timing changes the story’s builds observed; it does not claim the story caused them. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: panel contains observedNotAttributed framing |
| 4 | When a story is selected, Intent’s CI status homepage shows a timing comparison for it. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: heading CI timing changes for <identity> |
| 5 | That comparison includes CI wall time, then one row per CI entry in the homepage entry table introduced by SEED-243. | slice 2 | G4 |
| 6.1 | Each comparable figure shows its before value | slice 2 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: baseline cells show before values (4 min) |
| 6.2 | Each comparable figure shows its after value | slice 2 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: branch/landed cells show after values (4 min 30 s, 5 min) |
| 6.3 | Each comparable figure shows the signed difference (positive = longer, negative = shorter) | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: Branch +20 s and Landed +1 min |
| 7 | A selected done story gets this comparison where the homepage today only explains that the story has no branch to judge. | slice 1 | observed: dashboard/tests/intent-ci-status-story-gaps.spec.ts migrated done-story gap; comparison heading replaces no-branch explanation |
| 8 | With no story selected, the homepage is unchanged. | slice 1 | observed: dashboard/tests/intent-ci-status*.spec.ts no-selection homepage unchanged (consumer suite green in implementation return) |
| 9 | The story starts at its first published execution claim on trunk — the claim commit that storyPublishedEvidence.ts and storyCompletedCommits.ts already recover. | slice 1 | observed: dashboard/server/storyPublishedEndpoints.ts storyStart from claim octopus base; fixture precedeClaimWithPlanning |
| 10 | The baseline is the newest first-parent trunk revision at or before that claim’s parent that has a completed CI attempt. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: baseline measured ancestor with wall 3 min |
| 11 | The baseline is fixed to the story and never moves to whatever trunk build is current. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path after advanceCompletedTrunk+branch delete: figures unchanged |
| 12 | When the baseline is an ancestor rather than the claim’s parent itself, the homepage says how many later revisions before the story start had no completed build. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: ancestor: N later revision(s) without a build |
| 13 | For a done story, the final branch revision is the story-side parent of the story’s newest landing merge on trunk. | slice 1 | observed: dashboard/tests/support/storyCiComparisonFixture.ts branchSide from completion parents[2]; happy-path identity |
| 14 | Published evidence already recovers that merge as an owning merge. | slice 1 | observed: dashboard/server/storyPublishedEndpoints.ts landingOf owning merge; Review still via storyReviewPublished.ts |
| 15.1 | That merge is the completion itself when the wrap-up landed with the story. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: Landed identity is completion SHA (wrap-up landing) |
| 15.2 | That merge is an earlier merge when the story’s code landed first and the story completed later through direct trunk commits. | slice 1 | G1 |
| 16 | The branch result is the newest completed attempt at that revision. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts SEED-236/happy path: Branch uses completed attempt at resolved revision |
| 17 | When that revision has no build, the newest first-parent ancestor on the branch side with a build is used, provided it is not older than the story’s start, and it is labelled as an ancestor. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts SEED-236: Branch labelled ancestor of merge branch-side within story-start bound |
| 18 | For a Taken story, the latest completed build of its branch is shown as provisional, not final. | slice 3 | observed: dashboard/tests/intent-ci-comparison-taken.spec.ts: provisional · label on latest completed branch/trunk tip |
| 19 | A Trunk Mode story’s branch result is marked not applicable. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts Trunk Mode: Branch identity contains not applicable |
| 20 | The landed result is the newest completed attempt at the story’s completion revision on the configured trunk. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path / SEED-236: Landed identity is completion revision |
| 21 | When that revision has no build because only CI-ignored paths changed (as in a Trunk Mode wrap-up commit), the newest first-parent ancestor with a build is used, provided it is not older than the story’s start, and it is labelled as an ancestor. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts Trunk Mode: Landed identity is implementation ancestor with ancestor: |
| 22 | A later trunk build never stands in for the landed result. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts SEED-236: later trunk run 399 / 10 min absent from panel |
| 23 | A story not yet completed has no landed result yet, and the homepage says so. | slice 3 | observed: dashboard/tests/intent-ci-comparison-taken.spec.ts: Landed says story has not landed yet |
| 24 | For each revision, use the newest run and its newest completed attempt, whether it passed or failed. | slice 1 | observed: tests/support/dashboard-ci-revision-nearest.test.mjs selectRevisionAttempt; intent-ci-comparison failed-landed labelled failed |
| 25 | Running and cancelled attempts give no timing. | slice 1 | observed: tests/support/dashboard-ci-revision-nearest.test.mjs cancelled→completed; intent-ci-comparison running landed gives no wall timing |
| 26 | A failed endpoint’s figures are labelled as coming from a failed build. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts failed landed: identity contains failed build |
| 27 | Endpoints come from published history: the done record, the claims, and the landing merge. | slice 1 | observed: dashboard/server/storyPublishedEndpoints.ts facts from done/claims/landing; comparison read uses them |
| 28 | Those endpoints stay the same after the story branch and agent profile are removed. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path after branch delete: still shows story endpoints |
| 29 | Later trunk commits never replace those endpoints. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path / SEED-236: later trunk does not replace endpoints |
| 30.1 | Name each endpoint once with its revision | slice 1 | observed: dashboard/src/IntentCiComparison.tsx BuildIdentity shortSha(revision); journeys assert SHAs |
| 30.2 | Name each endpoint once with its run | slice 1 | observed: dashboard/src/IntentCiComparison.tsx LinkedRun run N; journeys assert run ids |
| 30.3 | Name each endpoint once with its attempt | slice 1 | observed: dashboard/src/IntentCiComparison.tsx run N #attempt; journeys assert #1 |
| 30.4 | Name each endpoint once with its state | slice 1 | observed: dashboard/src/IntentCiComparison.tsx state passed/failed/running in identity |
| 30.5 | Name each endpoint once with a link where available | slice 1 | G2 |
| 30.6 | Name each endpoint once with whether it is the exact revision or a measured ancestor | slice 1 | observed: dashboard/src/IntentCiComparison.tsx selectionWords exact/ancestor; journeys assert labels |
| 31 | Keep elapsed CI wall time (the attempt’s start to completion) distinct from cumulative entry test execution time. | slice 2 | observed: dashboard/src/IntentCiComparison.tsx wall table distinct from CiProofTable entry execution times |
| 32 | Show the underlying values beside every difference. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts walls 3 min / 3 min 20 s / 4 min beside +20 s / +1 min |
| 33 | Comparison durations and differences use whole seconds (e.g. 3 min 20 s, +20 s) so a small change is not rounded away. | slice 1 | observed: dashboard/src/ciProofTimeWords.ts wholeSecondWords/Difference; comparison journey shows 3 min 20 s and +20 s |
| 34 | Elsewhere the homepage keeps its existing formatting. | slice 1 | observed: dashboard/tests/intent-ci-status*.spec.ts / intent-ci-proof*.spec.ts whole-minute formatting unchanged (consumer return) |
| 35.1 | Honest gap: no completed build, or a running build — own explanation; never zero or no change | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts running and missing landed journeys: explanations, wall — not zero |
| 35.2 | Honest gap: an expired or unavailable proof summary | slice 2 | observed: dashboard/tests/intent-ci-comparison-entries.spec.ts expired entry proofs: wall kept; entry gap explanation |
| 35.3 | Honest gap: a summary with no entry durations | slice 2 | observed: dashboard/tests/intent-ci-comparison-entries.spec.ts summary without durations: explained, never zero |
| 35.4 | Honest gap: a part whose duration is missing, which leaves the total partial | slice 2 | observed: dashboard/tests/intent-ci-comparison-entries.spec.ts part without duration: partial explanation |
| 35.5 | Honest gap: an entry present at only one endpoint, shown as added or removed with no invented difference | slice 2 | observed: dashboard/tests/intent-ci-comparison.spec.ts added entry marked added; unit removed entry marked |
| 35.6 | Honest gap: an unrecoverable story history, using the published review’s existing explanations | slice 1 | G3 |
| 36 | When only one comparison is available, it stays readable and the other explains its gap. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts running landed: branch +20 s still readable beside Landed running |
| 37 | Wall time comes from the CI run itself, so it can stay available after the entry summaries have expired. | slice 2 | observed: dashboard/tests/intent-ci-comparison-entries.spec.ts expired proofs: wall times remain while entries explain expiry |
| 38 | The comparison says that each difference compares two single builds and does not establish the story as its cause. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: observedNotAttributed framing text |
| 39 | No variance band. | slice 1 | G5 |
| 40 | No durable copies of timing evidence into done records. | slice 1 | G6 |
| 41.1 | Folder/file differences belong to SEED-245 | slice 1 | G7 |
| 41.2 | Comparison is not added to Review changes | slice 1 | G8 |
| 41.3 | Comparison is not added to story cards | slice 1 | G9 |
| 42 | No new CI contract (ciAdapter not extended). | slice 1 | G10 |
| E1 | Done Story Branch story: baseline 3 min, branch 3 min 20 s, landing 4 min → Branch +20 s and Landed +1 min against named baseline; names all three builds. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: named builds, +20 s, +1 min |
| E2 | Mixed entry changes: entry 4 min → 4 min 30 s → 5 min with +30 s and +1 min; faster entry shows a negative difference. | slice 2 | observed: dashboard/tests/intent-ci-comparison.spec.ts mixed entries +30 s / +1 min and negative diffs |
| E3 | Measured ancestor (SEED-242): claim and parent have no build; baseline ancestor 4 first-parent revisions before claim parent, marked with count 4; final branch and landing builds named. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path: baseline ancestor count from planning-only commits |
| E4 | Done story after cleanup: branch gone, newer trunk; selecting the done story still compares its own builds. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts happy path fixture advances trunk and deletes branch before selection |
| E5 | Landed build still running, new entry: branch comparison shown; Landed says still running; entry added by the story shows as added with no invented baseline. | slice 2 | observed: dashboard/tests/intent-ci-comparison-gaps.spec.ts running landed with added entry (implementation return) |
| E6 | Expired proof: wall time still shows; entry rows explain proof expired without differences. | slice 2 | observed: dashboard/tests/intent-ci-comparison-entries.spec.ts expired entry proofs keep wall times and explain entry gap |
| E7 | Trunk Mode done story: completion has no build; Landed uses last built trunk revision as ancestor; Branch not applicable. | slice 1 | observed: dashboard/tests/intent-ci-comparison.spec.ts Trunk Mode: Branch not applicable; Landed ancestor |
| E8 | Code landed before completion (SEED-236): Branch uses ancestor of landing merge’s branch side; Landed uses completion build; neither replaced by later trunk. | slice 1 | G1 |
| E9 | Taken Story Branch story: live CI status kept; provisional comparison against the same pre-story baseline; latest completed branch build labelled provisional; Landed says not landed yet; new branch head re-reads. | slice 3 | observed: dashboard/tests/intent-ci-comparison-taken.spec.ts: live CI status kept; provisional comparison; Landed not landed; new branch head re-reads; Trunk Mode provisional + Branch N/A |
