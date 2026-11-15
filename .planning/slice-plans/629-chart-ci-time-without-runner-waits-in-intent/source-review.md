# Source-only review

**Launch:** Fresh general-purpose agent (`7e99bc9d-03a1-4157-9641-45ca6167d1e2`), no conversation inheritance; instructed to use only the selected story Goal, Scope, Key examples and exclusions, read no other project files, change nothing.

**Input:** SEED-364#chart-ci-time-without-runner-waits Goal, Scope, Key examples and Scope limits only (no plan, product, proof, or slice scope).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reading the history chart in Project Intent’s CI status can see whether CI execution is getting faster or slower independently of the time jobs spend waiting for runners. | slice 4 |  |
| 2 | Use the existing **CI time without runner waits** from the CI timing comparison throughout the CI history section. | slice 4 |  |
| 3 | The measure uses the longest dependency chain of job durations, accounting for parallel work and excluding runner waits both before and between jobs. | slice 1 | observed: landed-ci-history-time-without-runner-waits.spec.ts: two dependent jobs → 5 min via timeWithoutRunnerWaitsOf |
| 4 | Use that measure for the following surfaces: | slice 4 |  |
| 4.1 | chart points and their readouts | slice 4 |  |
| 4.2 | **Latest measured build** | slice 4 |  |
| 4.3 | the selected landing’s time | slice 4 |  |
| 4.4 | the times in **Builds and evidence** | slice 4 |  |
| 5 | Calculate from the same measure: | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 5.1 | the **Prior-build average** | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 5.2 | its sample count and evidence | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 5.3 | the elapsed and percentage change against that average | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 6 | Label the history and its chart to identify the measure. | slice 4 |  |
| 7 | Retain the measure for the build attempt the history point represents. | slice 1 | observed: landedCiRetainedProof/collection keep timeWithoutRunnerWaits on kept build |
| 8 | When the retained evidence cannot supply a measurement, show a gap with its reason. | slice 2 | observed: landed-ci-history-measure-gaps.spec.ts: final gap with reason + build; pending when unanswered |
| 9 | When the retained evidence cannot supply a measurement, exclude that build from the chart’s prior-build average. | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 10 | Background collection obtains the measure once for each build attempt it retains, as the comparison calculates it for that attempt. | slice 1 | observed: spec: one jobs read per build (41/1/1, 42/1/1); second pass none |
| 11 | Background collection keeps with that build either a time or the reason there is none. | slice 1 | observed: keepLandedCiCollectedEvidence keeps CiTimeWithoutRunnerWaits time-or-reason on build |
| 12 | It supplies the same for builds the history already holds, from their same recorded attempt, so the chart keeps its existing points where CI still answers. | slice 2 | observed: measure-gaps.spec: prepared history without measure becomes points after one pass from same attempt |
| 13 | A read CI leaves unanswered is asked again at a later pass. | slice 2 | observed: measure-gaps.spec: unanswered pending re-asked on second pass only |
| 14 | Reading the history still asks CI nothing. | slice 1 | observed: spec: reader history after restart adds no github calls |
| 15 | The following stay as they are: | slice 1 | observed: collection/window paths unchanged; landed-ci-history-collection.spec.ts green |
| 15.1 | which landings and builds the history holds | slice 1 | observed: landings/builds retention unchanged (collection green) |
| 15.2 | how a build stands for its landings | slice 1 | observed: provenance/selection unchanged (collection green) |
| 15.3 | the 20-build window | slice 1 | observed: 20-build window unchanged (measuredBuildOf/window untouched) |
| 15.4 | failed and pending gaps | slice 1 | observed: failed/pending gap reasons unchanged in historyEntries gapOf |
| 15.5 | the reference’s median and 15% rule with its five-build minimum | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 16 | A prior build is eligible when it meets the existing rule and has the measure. | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 17 | A build without the measure is a gap that names the build and the reason the measure is unavailable. | slice 2 | observed: measure-gaps.spec: final gap names build and reason |
| 18 | for example a custom CI adapter that supplies no job graph | slice 2 | observed: measure-gaps.spec: adapter no job graph final gap |
| 19 | Scope limits — these keep wall time: | slice 4 |  |
| 19.1 | the selected Done story’s **CI wall time history** | slice 4 |  |
| 19.2 | the automatic CI follow-up rule and its saved references | slice 3 | observed: ci-prior-build-reference.test.mjs + ci-project-measure-reference.spec.ts; Done/follow-up wall specs green |
| 19.3 | Proof’s **CI wall time** | slice 1 | observed: Proof CI wall time paths untouched; no Proof surface edits |
| 20 | The history shows one measure; it offers no switch between the two. | slice 4 |  |
| 21 | A two-minute job runs before a three-minute dependent job. The first waits 30 seconds for a runner and the second waits a minute. The chart shows **5 min** for the build. | slice 4 |  |
| 22 | Longer runner waits alone leave that value at **5 min**. | slice 1 | observed: spec: short and long runner waits both read 5 min when measure named |
| 23 | Five eligible prior builds each measured **5 min** without runner waits. The latest landing measures **4 min**. Its plotted point and build readouts show **4 min**, the chart’s reference line and the prior-build readout show **5 min** using five builds, and the UI shows **−1 min (−20%)** against that average. | slice 4 |  |
| 24 | A retained build has wall time and lacks the evidence needed to calculate time without runner waits. Its chart mark explains that the measure is unavailable. The average uses the eligible builds with the measure. | slice 4 |  |
