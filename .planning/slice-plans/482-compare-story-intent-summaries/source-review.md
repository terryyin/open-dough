# Source review — SEED-245#compare-story-intent-entry-folder-and-file-summaries

**Launch / input.** Fresh general-purpose reviewer; source-only. Supplied only the
selected story's Goal, Scope, key examples and exclusions from
`.planning/seeds/SEED-245-story-intent-summary-differences.md#compare-story-intent-entry-folder-and-file-summaries`.
No plan, return, product, proof, or suspected omission.

**Returned commitments.** Agent `543d65fc-a81b-4de2-93b1-c5245501def2` (2026-11-06).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: drill entry→folders→files; see execution time and proof counts across homepage builds | slice 3 | |
| 1a | Builds are baseline, branch result, landed result | slice 1 | observed: IntentScopeProof ComparisonNamed + ciScopeComparison endpoints |
| 1b | Rows show where change sits and which rows the story changed | slice 1 | observed: change markers + row diffs in intent-summary-story-comparison.spec.ts |
| 1c | Shows observed build changes; does not claim the story caused them | slice 1 | observed: observedNotAttributed framing in Summary |
| 2 | Every figure from SEED-244 CI comparison endpoints | slice 1 | observed: IntentCiEvidence comparison + no new read |
| 2a | Endpoints: baseline, branch result, landed result | slice 1 | observed: ComparisonNamed / CiProofTable Baseline·Branch·Landed |
| 2b | Each endpoint: build identity, selection rule, failed-build label, N/A / not-yet / running / unavailable | slice 1 | observed: SlotSha + gap variants (running, Trunk N/A, Taken not-landed) |
| 2c | Scope figures from each endpoint's own proof summary | slice 1 | observed: scopeEndpointTimingOf per endpoint |
| 2d | Never mix one endpoint's total with another's file figures | slice 1 | observed: per-endpoint scopeComparisonCellsOf |
| 2e | Never use a build the homepage does not name | slice 1 | observed: shared IntentCiEvidence comparison answer |
| 2f | Taken comparison labelled provisional | slice 1 | observed: intent-summary-story-comparison-gaps Taken provisional |
| 3 | Selected entry/folder Summary compares own, children, Not in the rows above | slice 1 | observed: ComparisonTable rows + outside row when breakdown |
| 3a | Each row: baseline / branch / landed execution time with signed diffs | slice 1 | observed: entryComparisonRows / folder / nested journeys |
| 3b | Same columns and order as homepage | slice 1 | observed: comparisonScopeColumns |
| 3c | Drilling keeps selected story and endpoints | slice 1 | observed: drillComparisonChild in main journey |
| 3d | No story selected → Summary unchanged | slice 1 | observed: intent-summary-ci-proof*.spec.ts consumers |
| 4 | Compared rows show counted results at each endpoint with signed differences | slice 2 | observed: summaryComparisonExpectedRows count cells + intent-summary-story-comparison.spec.ts |
| 4a | Outcome counts and parts completeness for homepage's chosen build | slice 2 | observed: Parts column still chosen-build completeness beside count diffs |
| 4b | Homepage entry rows show the same count differences | slice 2 | observed: intent-ci-comparison.spec.ts entry rows 2,090 → 2,092 +2 |
| 5 | Selected test file: compact comparison above Purpose | slice 3 | |
| 5a | Source or diff reading stays primary and unchanged | slice 3 | |
| 5b | No story → file reading unchanged | slice 3 | |
| 6 | Changed rows carry tree change kind (added/modified/removed/renamed) | slice 1 | observed: markers in entryComparisonRows |
| 6a | Unchanged rows still show observed difference | slice 1 | observed: root.spec.ts / nested c.spec.ts rows |
| 7a | Added file: no baseline, shown added, no difference | slice 1 | observed: added.spec.ts row |
| 7b | Removed file: no result, shown removed | slice 1 | observed: gone.spec.ts row |
| 7c | Renamed: baseline from old path (even other entry), names path | slice 1 | observed: renamed.spec.ts was tests/old.sh |
| 7d | Folder figures sum whatever each endpoint holds under the path | slice 1 | observed: folder/ nested sums |
| 8a | Summary precise durations for values and differences | slice 1 | observed: +70 ms / +4.0 s precise words |
| 8b | Homepage keeps whole-second precision | slice 1 | observed: intent-ci-comparison*.spec.ts consumers |
| 9 | Value only where measured; missing never zero or no change | slice 1 | observed: gap wording / not in compared builds |
| 9a | No/expired/running summary: homepage explanation once for Summary | slice 1 | observed: running Landed cells + SlotSha |
| 9b | No file breakdown / no durations: folders/files unavailable; entry totals still compare | slice 1 | observed: noBreakdownEntryRows |
| 9c | Partial value: show lack; no signed diff from complete | slice 1 | observed: ciScopeComparison partial timing (consumer / unit path) |
| 9d | Path in neither build: not in the compared builds | slice 1 | observed: later.spec.ts row |
| 9e | Gap at one scope/endpoint does not hide others | slice 1 | observed: running Landed leaves branch readable |
| 10a | After branch delete and later trunk: same comparison | slice 1 | observed: publishSummaryComparisonStory already cleans up; main journey |
| 10b | Selecting another story replaces comparison at every scope | slice 1 | observed: gaps replace journey |
| 10c | Earlier selection's answer never renders | slice 1 | observed: replace journey drops SEED-A#a |
| 11 | Each Summary and file summary carries observed-not-attributed | slice 3 | |
| E1 | Entry drill-down timing + counts + markers example | slice 1 | observed: timing/markers in main journey (counts owed by 4 / slice 2) |
| E2 | File-level precise diffs example | slice 1 | observed: nested a.spec.ts / c.spec.ts Summary rows (file summary owed by 5 / slice 3) |
| E3 | Branch and landed apart; Trunk Mode Branch N/A | slice 1 | observed: main + trunkEntryRows |
| E4 | Added / removed / renamed / later-trunk | slice 1 | observed: entryComparisonRows |
| E5 | No-breakdown baseline; running landed | slice 1 | observed: noBreakdown + running gaps |
| E6 | After cleanup; selecting another story | slice 1 | observed: main + replace |
| X1 | No new CI read / adapter / stored copy beyond SEED-244 |  | G1 |
| X1a | Availability follows provider retention; 30-day summaries |  | G2 |
| X2 | No variance band or significance judgment |  | G3 |
| X3 | No file CI figures without a selected story |  | G4 |
| X4 | No comparisons in Review changes or story cards |  | G5 |
| X5 | No sorting or filtering by difference |  | G6 |
