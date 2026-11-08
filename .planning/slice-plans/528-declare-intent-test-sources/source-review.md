# Source review

Launch: fresh general-purpose sub-agent (no conversation inheritance) on
2026-11-08 by the executing coordinator, before the first implementation
delegation. Input: only the story section `SEED-274#declare-intent-test-sources`
(Goal, Scope, Architecture, Examples, deferred and considered items) from
`.planning/seeds/SEED-274-declare-intent-test-sources.md` at `03ae1e0cc`, with
the instruction to read no other files, change nothing, and return numbered
commitments, exclusions and examples. The table below is its return as given.

Exclusions returned: new grammars; migrating existing declarations; exclude
patterns; per-entry labels or grouping; reinterpreting `kind` as a hint
(considered, not chosen); repeating a location path per kind (considered, not
chosen); Intent does not run tests.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer can tell Intent which test files to show by publishing configuration in their project. | slice 2 | |
| 2 | One location can group different kinds of test source. | slice 2 | |
| 3 | A new filename convention needs only a configuration change (Open Dough does not have to learn a project's naming). | slice 2 | |
| 4 | Donut (`scripts/` holds Bash `.test` files beside Node `.test.mjs` files) can read all of its tests in Intent without Open Dough learning Donut's naming. | slice 2 | |
| 5 | A location in `.planning/open-dough.json` may declare its files as a list of source entries instead of a `kind`. | slice 2 | |
| 5a.1 | Each source entry has a non-empty `include` list of patterns. | slice 2 | |
| 5a.2 | Patterns are relative to the location and follow the existing `*`/`**` rules. | slice 2 | |
| 5a.3 | Each source entry may carry an optional `syntax` hint. | slice 2 | |
| 6 | A file belongs to the location when any entry's pattern matches it. | slice 2 | |
| 7 | No extension filter applies to source-entry locations. | slice 2 | |
| 8 | A file takes the hint of the first entry, in declaration order, whose pattern matches it. | slice 2 | |
| 9 | Hints use the existing kind names: | slice 2 | |
| 9.1 | `gherkin` | slice 2 | |
| 9.2 | `typescript`, with `.tsx` still highlighted as TSX | slice 2 | |
| 9.3 | `javascript` | slice 2 | |
| 9.4 | `python` | slice 2 | |
| 9.5 | `shell` | slice 2 | |
| 10a | A file whose entry has no hint opens as plain text and stays listed. | slice 2 | |
| 10b | A file whose hint Intent has no grammar for opens as plain text and stays listed. | slice 2 | |
| 11 | The same selection serves: | slice 2 | |
| 11.1 | the tree; | slice 2 | |
| 11.2 | opening a file (`file-at` admission); | slice 2 | |
| 11.3 | placing a selected story's changed tests. | slice 2 | |
| 12a | A story's added matching file appears. | slice 2 | |
| 12b | A story's non-matching neighbor stays out. | slice 2 | |
| 13 | Existing `kind`/`include` declarations keep their current behavior. | slice 1 | observed: slice 1: dashboard/backend-tests/intent/ (65 passed, specs unchanged) and dashboard/tests/intent/ (173 passed): gherkin without include, TS/TSX, JS, Python, shell listing, admission, overlay and styling |
| 14 | An unknown `kind` still gets the `unsupported-kind` explanation. | slice 1 | observed: slice 1: authenticated-read-intent-locations.spec.ts "marks empty, missing, and unsupported locations while listing usable ones"; intent-gherkin-unusable.spec.ts:27 |
| 15 | Document the contract where the existing one is documented: | slice 2 | |
| 15.1 | `dashboard/PROJECT-CONFIGURATION.md`; | slice 2 | |
| 15.2 | Intent guidance. | slice 2 | |
| 16 | Land it on `main` (the production dashboard serves published `main`, the Intent reader Donut uses). | landing | |
| 17 | Unchanged boundary: Intent reads the published configuration and source at its reading revision. | slice 2 | |
| 18 | Unchanged boundary: the project runs its tests and supplies Proof through the existing CI summary contract, keyed by location path and file paths (a published CI summary for a source-entry location still shows group and file results at those paths). | slice 2 | |
| 19 | Architecture: the shared selection rule in `dashboard/src/intentLocationSelection.ts` (server listing, `file-at` admission, story overlay) is the one place that answers both whether a location selects a path and which hint that path takes. | slice 2 | |
| 20 | Architecture: the location answer carries its declared source entries so the reading pane resolves a file's syntax by that same rule rather than from the location's `kind`. | slice 2 | |
| 21 | Settings stay project-owned and read at the reading revision; Proof stays the project's published CI summary (consistent with ADR 0001 and ADR 0008; no Accepted ADR conflict). | slice 2 | |
