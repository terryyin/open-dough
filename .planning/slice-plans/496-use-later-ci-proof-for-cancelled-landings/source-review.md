# Source review: Use a later trunk build's CI proof for cancelled landings

Launch: a fresh general-purpose sub-agent with no conversation inheritance,
started by the execution coordinator at slice 1 acceptance (2026-11-07). Input:
only the story's Beneficiary, Goal, Scope, Scope limits, Deferred promises,
Considered and Examples text from
[the seed section](../../seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-later-ci-proof-for-cancelled-landings),
with instructions to read no project files, change nothing, and return
numbered commitments, examples and exclusions without slicing or acceptance.
No plan, return, product or proof was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Landed can show later-build proof for a Story Branch Mode landing whose own push run was cancelled and that has no usable proof of its own | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts next-push test: Cancelled at merge, later run 304 used |
| 1a | The landing revision is the landing merge | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts next-push and chain tests: landing merge's cancelled run walks forward |
| 1b | For a fast-forward landing, the landing revision is the story tip | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts fast-forward test: Cancelled at story tip, next trunk build used |
| 2 | Proof at the landing itself stays authoritative | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs rerun/timed-out test: landing's own usable build stays exact, no forward listing |
| 2a | Including proof from a rerun attempt at the landing | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs rerun/timed-out test: rerun attempt 2 success stays exact |
| 3 | Walk forward from the landing along trunk's first-parent history | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs laterTrunkChain test: first-parent only, side commit never listed |
| 3a | Use the nearest later build with usable proof | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs pass-over test picks nearest usable +4; dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts chain test uses run 399 not 304/305 |
| 3b | Every revision on the walk contains the landing | slice 1 | observed: dashboard/server/laterTrunkBuild.ts laterTrunkChain uses --ancestry-path landing..head |
| 4a | The walk passes over cancelled builds | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts chain test: cancelled runs 304/305 passed over, no artifact reads; tests/support/dashboard-later-trunk-build.test.mjs pass-over test +1 |
| 4b | The walk passes over revisions without a build | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs pass-over test: unbuilt +2 passed over |
| 4c | The walk passes over builds whose proof is absent | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs pass-over test: proofless +3 passed over |
| 4d | The walk passes over builds whose proof has expired | slice 1 | observed: laterTrunkBuild.ts passes walkingProofUsable (baseCiRevisionLookup.ts): only proof.kind summary is usable, as the Baseline walk |
| 4e | The walk passes over builds whose proof is unreadable | slice 1 | observed: laterTrunkBuild.ts passes walkingProofUsable (baseCiRevisionLookup.ts): only proof.kind summary is usable, as the Baseline walk |
| 4f | The walk passes over builds whose proof is invalid | slice 1 | observed: laterTrunkBuild.ts passes walkingProofUsable (baseCiRevisionLookup.ts): only proof.kind summary is usable, as the Baseline walk |
| 4g | The walk passes over builds whose proof is mismatched | slice 1 | observed: laterTrunkBuild.ts passes walkingProofUsable (baseCiRevisionLookup.ts): only proof.kind summary is usable, as the Baseline walk |
| 4h | Proof usability follows the same rule as the Baseline walk | slice 1 | observed: baseCiRevisionLookup.ts lookupResultBuild passes walkingProofUsable(exact), the Baseline walk's rule |
| 5a | The walk stops at a running build | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs 'says where it stopped' test: running build stops the walk |
| 5b | The walk stops at the trunk head the dashboard has read | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs 'says where it stopped' test: empty chain ends at head |
| 5c | The walk stops after 30 revisions | slice 1 | observed: tests/support/dashboard-later-trunk-build.test.mjs laterTrunkChain test and 'says where it stopped' bound case; tests/support/dashboard-later-trunk-landed.test.mjs 31-revision trunk |
| 6 | Landed keeps Cancelled as the landing's status | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts all four journeys assert Cancelled at <landing>. |
| 7a | Landed names the later build's revision | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts identity asserts later short sha and run N #attempt |
| 7b | Landed names the later build's run | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts identity asserts later short sha and run N #attempt |
| 7c | Landed names the later build's attempt | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts identity asserts later short sha and run N #attempt |
| 7d | Landed names the later build's conclusion | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts identity asserts passed / failed conclusion |
| 7e | Landed names how many later trunk revisions it includes beyond the landing | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts identity asserts includes 1 / 3 later trunk revisions |
| 8 | The label says the build is later than the landing | slice 1 | observed: storyCiComparisonWording.ts laterTrunkBuildWords: later trunk build; asserted in dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts |
| 8a | It never reads as a skip's equivalent build | slice 1 | observed: storyCiComparisonWording.ts selection later is distinct from equivalent build wording |
| 9a | No usable proof found: Landed keeps today's cancelled explanation | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts gap journeys: Landed text starts with the existing cancelled explanation (laterTrunkCancelledSlot uses exact.cancelledExplanation) |
| 9b-i | Adds why: no later trunk build yet | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts head journey: 'No later trunk build has finished yet.' |
| 9b-ii | Adds why: a later build is still running | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts running journey: 'A later trunk build at <sha> (run N #a) is still running' |
| 9b-iii | Adds why: the nearest later build's proof is unavailable, with the reason | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts no-proof journey: nearest later build (run 399 #1) 'published no CI proof summary'; other reasons via ciProofAbsenceWording.ts laterBuildUnavailableLine, tests/support/dashboard-later-trunk-landed.test.mjs |
| 9c | No usable proof found: Landed shows no figures | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts gap journeys: Landed wall '—', no figures, Landed is not used |
| 10 | A failed later build with usable proof is used as the proof source | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts failed-later test uses the failed run; tests/support/dashboard-later-trunk-build.test.mjs failed test |
| 10a | Its conclusion (failed) is shown beside the source | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts failed-later test asserts failed beside the source |
| 11a | GITHUB-REQUESTS.md stays accurate for the forward walk's run listings | slice 1 | observed: dashboard/GITHUB-REQUESTS.md comparison section: runs listed once per later first-parent revision walked; dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts runListingsAt asserts |
| 11b | GITHUB-REQUESTS.md stays accurate for the forward walk's proof reads | slice 1 | observed: dashboard/GITHUB-REQUESTS.md comparison section: artifact read per passed/failed later build considered; dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts artifact listing asserts |
| E1 | Next push passed: Cancelled at the landing, uses the next revision's passing run and attempt, includes 1 later trunk revision | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts next-push test (1 later revision, run 304 #1) |
| E2 | Cancelled chain: passes cancelled later builds, uses the first passing one and counts its later trunk revisions | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts chain test (two cancelled, third passes, 3 later revisions); count follows revisions as in E2 |
| E3 | Later build failed: Cancelled, uses the failed run with proof labelled failed, includes 1 later trunk revision | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing.spec.ts failed-later test (labelled failed, 1 later revision) |
| E4 | No later proof in reach: Cancelled, names the nearest later build and that it published no CI proof summary, no figures | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts 'whose only later trunk build published no proof names that build without figures' |
| E5 | Newest landing (read trunk head or next build running): Cancelled, says no later trunk build has finished yet | slice 2 | observed: dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts head journey (waits, then uses run 403 after a later push) and running journey |
| X1 | Timed-out landings keep their exact-only result | slice 1 | observed: tests/support/dashboard-later-trunk-landed.test.mjs rerun/timed-out test: timed-out gives exact-only explanation, no forward listing |
| X2 | Trunk Mode Landed keeps its ancestor walk | slice 1 | observed: intent-ci-comparison.spec.ts, -gaps, -fast-forward, -taken, -skipped green (47 passed); forward walk gated on Story Branch exact.laterTrunkHead |
| X3 | Baseline keeps its existing walk | slice 1 | observed: intent-ci-comparison.spec.ts, -gaps, -fast-forward, -taken, -skipped green (47 passed); forward walk gated on Story Branch exact.laterTrunkHead |
| X4 | Branch keeps its existing walk | slice 1 | observed: intent-ci-comparison.spec.ts, -gaps, -fast-forward, -taken, -skipped green (47 passed); forward walk gated on Story Branch exact.laterTrunkHead |
| X5 | Only GitHub Actions comparisons are covered | slice 1 | observed: baseCiRevisionLookup.ts cancelled branch requires adapterAttempt undefined; adapter specs green |
| X6 | Deferred: later-build proof for a code landing with no run whose absence is unexplained | slice 1 | observed: laterTrunkBuild walk entered only for a cancelled conclusion; no-run landings unchanged |
| X7 | Deferred: telling which included later revisions CI ignores | slice 1 | observed: no CI-ignored classification added; label counts all included revisions |
| X8 | Considered, not adopted: stopping superseded trunk push runs from being cancelled in CI | slice 1 | observed: .github/workflows/ci.yml unchanged |
