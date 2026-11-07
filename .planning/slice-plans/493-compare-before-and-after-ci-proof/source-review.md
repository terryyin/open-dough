# Source review: SEED-255#compare-before-and-after-ci-proof

Launch: fresh general-purpose reviewer at slice 1 acceptance, no conversation
inheritance, instructed to use only the selected story source in the prompt,
read no other project files and change nothing, and to return numbered
commitments, qualifications, journey examples and exclusions without slice
ownership.

Input: the story section of
`.planning/seeds/SEED-255-compare-before-and-after-ci-proof.md` from
**Beneficiary** through the Architecture / North Star closing paragraph,
unchanged since planning.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Identity is SEED-255#compare-before-and-after-ci-proof | slice 3 | |
| 2 | Beneficiary is a developer reviewing how a selected story changed test counts and execution time | slice 3 | |
| 3.1 | With a done or Taken story selected, scan the overall CI change on the Intent homepage | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts active title + overall counts/timing on `.intent-ci-comparison-active` / `.intent-ci-comparison-overall-*`; IntentCiComparison ActiveComparisonSummary |
| 3.2 | Find which test entries and files account for observed differences from cues in the entry table and the location tree | slice 3 | |
| 3.3 | Read every cued difference as text | slice 3 | |
| 4 | Serves judging whether a story changed CI proof as intended | slice 3 | |
| 5 | Differences remain observations between named builds and are not attributed to the story | slice 1 | observed: dashboard/src/storyCiComparisonWording.ts `observedNotAttributed`; IntentCiComparison still presents that framing with named Baseline/Branch/Landed builds |
| 6 | Compare Baseline with Landed when landed has a proof summary; otherwise with Branch (provisional tip for Taken Story Branch or Trunk Mode) | slice 1 | observed: dashboard/src/storyCiComparisonWording.ts `activeComparisonOf`; intent-ci-comparison.spec.ts Landed title; intent-ci-comparison-landing-gaps.spec.ts Branch title; intent-ci-comparison-taken.spec.ts Branch and Provisional titles |
| 7.1 | Homepage names the active comparison | slice 1 | observed: `.intent-ci-comparison-active` in intent-ci-comparison.spec.ts, landing-gaps, taken |
| 7.2 | Homepage names both builds with revision, run, attempt | slice 1 | observed: intent-ci-comparison.spec.ts identity cells and run 101/102/103 links |
| 7.3 | Homepage names whether each build is exact or an ancestor | slice 1 | observed: intent-ci-comparison.spec.ts ancestor / exact revision wording |
| 8 | Overall summary, entry table cues, tree cues, and percentages all use this one comparison | slice 3 | |
| 9 | The table keeps each endpoint's own measurements | slice 1 | observed: EndpointRow still shows each endpoint's wall/identity; entry cells via scopeComparisonCellsOf keep Baseline/Branch/Landed columns |
| 10.1 | Overall summary shows Baseline and active values and signed differences for overall test count | slice 1 | observed: overallCountsWords + intent-ci-comparison.spec.ts `.intent-ci-comparison-overall-counts` `2,090 → 2,092 tests (+2); 5 → 8 checks (+3)` |
| 10.2 | Overall summary shows Baseline and active values and signed differences for the CI timing measure the comparison uses | slice 1 | observed: wallTimeChangeWords; intent-ci-comparison.spec.ts `.intent-ci-comparison-overall-timing` `3 min → 4 min (+1 min, +33%)` |
| 11 | Count sums entries' counted results and keeps units apart (tests and checks never added together) | slice 1 | observed: tests/support/intent-scope-comparison-wording.test.mjs overall counts `2,080 → 2,082 tests (+2); 492 checks (no change)` |
| 12 | Says "partial" with the reason when an entry or part is missing at either build | slice 1 | observed: intent-scope-comparison-wording.test.mjs `Overall count partial: …`; entries gaps keep partial duration wording |
| 13 | Gives no difference when neither build has a usable total | slice 1 | observed: tests/support/intent-scope-comparison-wording.test.mjs `No overall count: neither compared build has a usable total.` |
| 14 | Each before value, after value, and difference reads as separate text, replacing run-together text | slice 1 | observed: measuredCountsChangeWords / durationChangeWords; intent-ci-comparison.spec.ts and summary expected rows use `12 → 10`-style cells |
| 15 | A duration difference adds a percentage only when the baseline is a measured non-zero duration | slice 1 | observed: intent-scope-comparison-wording.test.mjs durationPercentageWords(0, …) undefined; zero baseline `0 s → 2 s (+2 s)` |
| 16 | A measured zero, a missing measurement, and partial proof stay distinct in words and cues | slice 2 | observed: ciScopeComparisonCues countCueOf/durationCueOf + wording cells; module intent-scope-comparison-cues.test.mjs distinct none reasons for zero/partial/gap |
| 17.1 | Change cues appear on the overall summary | slice 2 | observed: IntentCiComparison ActiveComparisonSummary data-ci-cue attrs; intent-ci-comparison.spec.ts overall cues |
| 17.2 | Change cues appear on each entry row | slice 2 | observed: CiProofTable entry rows with cue classes; intent-ci-comparison.spec.ts expectCiComparisonCues |
| 17.3 | Change cues appear on each location header whose entry has a comparison | slice 3 | |
| 17.4 | Change cues appear on each file row in the location tree | slice 3 | |
| 18.1 | Count cue border green for fewer | slice 2 | observed: countCueOf fewer + intent-ci-cues.css intent-ci-cue-count-fewer-*; module −2 of 12 light |
| 18.2 | Count cue border red for more | slice 2 | observed: countCueOf more + css more-*; Playwright entry more cues |
| 18.3 | Count cue none when unchanged | slice 2 | observed: countCueOf unchanged → none reason unchanged; module test |
| 19 | Any count change shows | slice 2 | observed: module any change shows (12→10 light); Playwright entry count cues |
| 20 | Count change is strong at ≥50% of the baseline count | slice 2 | observed: countStrength ≥50% strong; module 10→15 strong; overall checks 5→8 more-strong in comparison spec |
| 21.1 | Duration tint green for faster | slice 2 | observed: durationCueOf faster + css faster-*; Summary/Proof faster cues |
| 21.2 | Duration tint red for slower | slice 2 | observed: durationCueOf slower + css slower-*; comparison spec slower-strong/light |
| 22 | No duration tint under 10% of baseline or under 1 s | slice 2 | observed: module 10s→10.7s and 1.4s→1.1s below threshold none |
| 23 | Duration cue strong at ≥50% | slice 2 | observed: module 8s→12s slower strong; Summary slower-strong |
| 24 | Measured zero baseline: no percentage and at most light tint | slice 2 | observed: module 0→2s slower light; durationPercentageWords already no % |
| 25 | No tint without comparable measured duration at both builds | slice 2 | observed: durationCueOf absent/explained/status → none; module partial/status cases |
| 26 | Added/removed file or entry, gap endpoint, or partial timing takes no cue on that measure; text explains why | slice 2 | observed: module added/removed/partial none with reason; summary file specs assert none+reason |
| 27.1 | Every cued difference visible as text in the overall summary | slice 2 | observed: overall summary still shows before→after text beside cues; intent-ci-comparison.spec.ts |
| 27.2 | Every cued difference visible as text in the entry table | slice 2 | observed: entry table cells keep readable text with cues; intent-ci-comparison.spec.ts |
| 27.3 | Every cued difference visible as text in a file's Proof | slice 2 | observed: IntentFileProof rows with cues + text; intent-summary-story-comparison-file.spec.ts |
| 27.4 | Every cued difference visible as text in its folder's or location's summary row | slice 2 | observed: IntentScopeComparisonTable Summary rows with cues + text; intent-summary-story-comparison.spec.ts |
| 28 | Each cued tree row and location header carries the same words in its accessible name | slice 3 | |
| 29 | No meaning is only in color or only on hover | slice 3 | |
| 30 | Selected file/location and keyboard focus stay recognizable and distinct from both cues | slice 3 | |
| 31 | Distinct selection outline beside inset count edge and duration fill; replaces selection background that would hide the tint | slice 3 | |
| 32 | No cues and no comparison wording without a selected story with a comparison | slice 2 | observed: intent-ci-status-story.spec.ts no cue attrs without comparison |
| 33 | Cues compare observed builds only (ADR 0008) | slice 2 | observed: cues from observed comparison endpoints only; ADR framing retained; comparisonAfterSideOf from active endpoint |
| 34.1 | Deferred: control to switch active comparison between Branch and Landed | | X1 |
| 34.2 | Deferred: cues on folder rows in the tree; folders keep summary rows | | X2 |
| 34.3 | Deferred: ranked list of largest contributors | | X3 |
| 34.4 | Deferred: which build or timing measure each endpoint supplies stays with SEED-254 / SEED-256 | | X4 |
| 34.5 | This story shows whatever build and overall timing measure the comparison supplies | slice 1 | observed: ActiveComparisonSummary uses wallTimeChangeWords on the comparison's CI wall time; SEED-256 still planned so wall time is the supplied measure |
| 34.6 | Until SEED-256 lands, that measure is CI wall time | slice 1 | observed: storyCiComparisonWording wallTimeChangeWords; docs/dashboard-development-intent-ci-comparison.md names CI wall time |
| 35.1 | Key example: done story with Landed proof; summary names Baseline and Landed | slice 1 | observed: intent-ci-comparison.spec.ts `.intent-ci-comparison-active` `Baseline compared with Landed` |
| 35.2 | Key example: entry/location show light green border, strong red tint, and `12 → 10 tests (−2)` with `8 s → 12 s (+4 s, +50%)` | slice 3 |  |
| 35.3 | Key example: cues stay visible and selection remains distinct when location selected or focused | slice 3 | |
| 36.1 | Key example: cancelled Landed; summary says Baseline with Branch and why Landed is not used | slice 1 | observed: intent-ci-comparison-landing-gaps.spec.ts active title Branch + `Landed is not used:` cancelled |
| 36.2 | Key example: cues follow Branch | slice 2 | observed: comparisonAfterSideOf(Branch\|Provisional)=branch; IntentCiComparison/Summary/Proof pass afterSide from activeComparisonOf |
| 37.1 | Key example: file 6 tests 25% faster; tree row no border, light green tint | slice 3 | |
| 37.2 | Key example: accessible name and Proof say `6 tests (no change)` and `4 s → 3 s (−1 s, −25%)` | slice 3 |  |
| 38 | Key example: 7% slower same count; text shows difference; no cue | slice 2 | observed: module +7% below threshold none; Summary renamed small % no tint case |
| 39 | Key example: no Baseline duration; timing text says why; no tint | slice 2 | observed: module partial baseline duration none reason partial; summary gap rows |
| 40 | Key example: 1,098+982 tests and 492 checks give overall `2,080 tests and 492 checks`, never one mixed number | slice 1 | observed: wording module test overall `2,080 → 2,082 tests (+2); 492 checks (no change)` keeps units apart |
| 41.1 | Homepage top-down: active comparison and its two builds | slice 1 | observed: IntentCiComparison ActiveComparisonSummary then endpoint table |
| 41.2 | Homepage top-down: the overall summary | slice 1 | observed: overall counts and timing paragraphs above the entry table |
| 41.3 | Homepage top-down: then the entry table | slice 1 | observed: EntryComparison after the endpoint table in IntentCiComparison |
| 42 | Tree shows same cues on file rows and location headers so a developer can find a cued file and confirm numbers in Proof | slice 3 | |
| 43 | Location and folder summaries show cues on child rows as the homepage table does | slice 2 | observed: Summary child rows use scopeComparisonCellsOf cues; intent-summary-story-comparison.spec.ts |
| 44 | Classify each scope's count and duration change once from Intent's single evidence owner and comparison-endpoint read | slice 2 | observed: ciScopeComparisonCues.ts single classifier consumed via scopeComparisonCellsOf / overall*CueOf; no new CI read |
| 45 | Classification gives direction, strength, or no-cue with a reason | slice 2 | observed: CountCue/DurationCue kinds border\|tint\|none with direction/strength or reason |
| 46 | Summary, table, tree, location headers, and Proof all consume that classification | slice 3 | |
| 47 | The tree gains no CI read of its own | slice 3 | |
| 48 | Cue meanings stay consistent; drilling and selection ask CI nothing again | slice 3 | |
| 49 | Build on existing Intent proof views (endpoint builds and per-entry differences) by adding readable percentages and overall test count | slice 1 | observed: IntentCiComparison keeps endpoint builds; adds overall summary and before→after (Δ[, %]) wording |
| 50 | Build on North Star rule that text carries every status shown by color | slice 3 | |
