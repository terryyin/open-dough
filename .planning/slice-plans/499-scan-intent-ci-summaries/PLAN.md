# Scan CI summaries in dashboard Intent

**Identity:** SEED-259#scan-intent-ci-summaries
**Source:** [Scan CI summaries in dashboard Intent](../../seeds/SEED-259-scan-intent-ci-summaries.md#scan-intent-ci-summaries)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer reviewing test evidence in dashboard Intent finds the rows they
care about and reads counts, execution times and gaps at a glance: every
Intent CI figures table sorts by its columns, an entry or folder summary
shows its own figures above a breakdown of its children, timing gaps read as
short labels, and evidence identity reads as grouped labels instead of
sentences.

Included scope, required restrictions and scope limits are the seed's. In
short, excluded: new figures (partial lower bounds, a CI status totals row,
filters), any change to what CI evidence is read, judged or compared,
persisting the sort choice, Optimization Candidates and file Purpose. The
story comparison endpoint table (`IntentCiComparisonEndpoints.tsx`, one row
per Baseline, Branch and Landed identity) is not a figures table and is not
made sortable; its wording follows the shortened identity labels only where
it shares them.

Assumptions: icons come from the Lucide set the frame already uses
(`dashboard/src/Icon.tsx`), hidden from assistive technology with the name
carried by the label beside or around them.

## Outside-in proof and ownership

| Promise (seed) | Owner | Proof |
| --- | --- | --- |
| Timing gaps as short labels; measured zero, partial and unavailable stay distinct; full explanation to assistive technology and hover (key example 4) | Slice 1 | Unit proof of the one timing classification (labels and explanations for complete, zero, partial part, untimed results, missing part, no durations, no CI result); the CI status and summary gap specs read the labels in cells and the explanation as the cell's accessible description |
| Column sorting on every Intent CI figures table; keyboard; `aria-sort` and visible direction; unmeasured rows after measured in either direction; ties and initial order unchanged (key example 1) | Slice 2 | New Playwright spec on CI status Proof and the CI status story comparison: activate **Test execution time** and **Counts** by click and by Enter/Space, read row order and `aria-sort`; unit proof of the comparator (unmeasured last both ways, stable ties, failed-first count tie) |
| Overall figures above the breakdown; outside row last under any sort; sort kept while drilling down; missing column falls back (key example 2) | Slice 3 | Summary specs: the scope's figures group above the table, the table holds children and **Not in the rows above** only, sort by **Counts** descending keeps the outside row last, activating a child keeps the sort; switching to a story comparison with a column the single-run table lacks returns default order |
| **Change** column in story comparisons, sortable, unchanged rows last (key example 3) | Slice 4 | Story comparison summary spec: change kinds in their own column, names without trailing change words, sorting **Change** groups changed rows first; **Landed** sort puts endpoint-gap rows last |
| Evidence and comparison identity as grouped short labels with named icons, keeping the facts that change how figures read (key example 5) | Slice 5 | Summary, CI status Proof and file Proof specs read the grouped labels (run and attempt link, revision, branch, ancestor, wall time, tree-revision gap, previously retrieved, observed-not-attributed, breakdown absent) by accessible name; no evidence sentence remains |
| One term per fact across CI status, summaries, file Proof and Intent's documentation | Each slice | Each slice updates [Intent](../../../docs/dashboard-development-intent.md) and [CI timing comparison](../../../docs/dashboard-development-intent-ci-comparison.md) for what it changes; slice 5 rereads both documents against the shipped wording |

Consumers to update with the changed rendered output (located by searching
retired literals such as `partial: `, `has no duration`, `without a duration`,
`CI evidence:`, `This evidence is of`, `CI timing comparison for`,
`Child breakdown unavailable` and the summary's first-row reads):
`dashboard/tests/intent/intent-ci-proof*.spec.ts`,
`intent-ci-status-execution-time.spec.ts`, `intent-ci-comparison*.spec.ts`,
`intent-summary-*.spec.ts`, `intent-file-purpose-proof.spec.ts`, the helpers
`dashboard/tests/intentCiProofPage.ts`, `intentSummaryCiProofFixtures.ts`,
`support/storyCiComparisonEntryProofs.ts`, and the unit tests
`tests/support/intent-scope-proof.test.mjs` and
`tests/support/dashboard-ci-comparison-entries.test.mjs`. Each slice runs the
consumer-trace script on its change and gives every listed consumer a
disposition.

Local gates: at each slice boundary, the Intent CI and summary family
(`dashboard/tests/intent/*.spec.ts` whose name contains `ci` or `summary`,
37 specs, 95 tests, about 3.5 minutes here) plus the two unit tests above
through `bash scripts/test.sh`, `npm run typecheck:dashboard` and `npm run lint`. The
family is the suite covering the changed surface, so it replaces hand-picked
consumers. Run Playwright as
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`
with `/opt/homebrew/bin` first on `PATH`, under the maintained macOS sleep
guard ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection. The whole dashboard suite runs
once before landing, because the shared table and wording reach every Intent
journey.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Every Intent CI figures table renders through `CiProofTable` | Slices 2–4 sort in one owner | 2026-11-07 at `7aca698a3`: `grep` of `CiProofTable` and `<table` in `dashboard/src` | CI status Proof (`IntentCiProof.tsx`), CI status comparison (`IntentCiComparison.tsx`), summary single-run (`IntentScopeSingleProofTable.tsx`) and comparison (`IntentScopeComparisonTable.tsx`, also unavailable-evidence rows in `IntentScopeProof.tsx`) all render `CiProofTable`; the only other table is the endpoint identity table, excluded above |
| Cells carry words only, so sorting needs values beside them | Slice 1 adds them, slice 2 consumes | Same revision: `CiProofCells` (`ciProofWording.ts`) and `ComparisonEntryCells` (`storyCiComparisonEntries.ts`) are strings | Confirmed; slice 1's timing classification returns the measured value with its label, and slice 2 adds count and gap values |
| Partial timing wording has two producers | Slice 1 | Same revision: `entryTimingOf`/`scopeExecutionTime` in `ciProofWording.ts` and the timing classifier in `ciScopeComparisonTiming.ts` each build `partial: …` phrases | Confirmed; slice 1 gives them one owner |
| The Intent CI family runs green locally in this workspace as the proof route | Every slice's gate | 2026-11-07 21:00, this worktree at `7aca698a3` after `node scripts/setup-native.mjs npm`, `browser`, `check`: the command in Local gates over the 37 family specs; `bash scripts/test.sh tests/support/intent-scope-proof.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs` | 95 passed in 3.4 min (load 2–5); unit tests quiet pass, exit 0 |

No premise is left open.

## Current decisions

- Sorting lives in `CiProofTable.tsx`: callers give rows whose cells carry
  sort values beside their words and may mark a row pinned last; the table
  owns the sort state's rendering, headers, `aria-sort` and the comparator.
  The summary's sort choice is held with Intent's in-memory reading place so
  it survives drilling down and Development and back; CI status keeps its
  own.
- One timing classification (measured with milliseconds, partial with named
  gaps, unavailable with its reason) produces the short label, the full
  explanation and the sort value, for single-run cells and comparison
  endpoints alike.
- A cell's full explanation is its accessible description and hover text;
  the short label is what the cell shows.

## Ordered slices

### 1. Timing gaps read as short labels
Type: Behavior
Status: done
Proof: as mapped above for key example 4.

Behavior: an entry or scope whose timing is partial, missing a part, or
without durations → CI status Proof, a summary, or a story comparison shows
it → the cell reads `Part 2 untimed`, `Part 3 missing`, `4 tests untimed` or
`No timings` (several gaps joined compactly), measured zero reads `0 ms`,
and the full explanation is the cell's accessible description and hover.
Gives the two partial-phrase producers one owner whose result also carries
the measured value later sorting uses.

Also repairs a known gate defect (see Learnings): the family spec
`intent-story-ci-cues.spec.ts` writes screenshots into the retired plan 493
directory; it writes them under its Playwright output path instead, so a
gate run leaves the checkout clean.

Accepted proof (2026-11-07): family gate (37 specs) 96 passed in 3.6 min, plus
`intent-file-purpose-proof`, `intent-entry-folder-summaries(-folders)`,
`intent-reading-place`, `intent-story-changes-moves` 6 passed; units
`intent-ci-proof-timing`, `intent-scope-proof`, `dashboard-ci-comparison-entries`,
`intent-scope-comparison-cues`, `intent-scope-comparison-wording` pass;
typecheck passes. After the refactor pass, units, typecheck and
`intent-summary-ci-proof-gaps.spec.ts` reran green. Refactor disposition:
`## REFACTOR COMPLETE` (one import home for `partsWithoutBreakdown`,
`unitCount` private, timing assertions moved into the timing unit test).

### 2. Sort any Intent CI figures table by its columns
Type: Behavior
Status: done
Proof: as mapped above for key example 1.

Behavior: CI status Proof or a CI status story comparison with several
entries → activate a column header by click, Enter or Space → rows reorder
by that column's value, unmeasured rows after measured ones in either
direction, ties in default order; the header shows its direction and
`aria-sort`; activating again reverses. Interim: summary tables keep plain
headers until slice 3 gives them sorting with their own row moved out.

Accepted proof (2026-11-07): new `intent-ci-status-sort.spec.ts` and
`intent-ci-comparison-sort.spec.ts` (helper `expectSortedColumns.ts`), unit
`intent-ci-proof-sort.test.mjs` (9 tests); family gate (39 specs) 98 passed in
3.6 min after `intent-ci-proof.spec.ts`'s keyboard-path assertion was updated
for the header buttons; typecheck passes. Refactor disposition:
`## REFACTOR COMPLETE` (`isComparisonCells` has one home in
`storyCiComparisonEntries.ts`).
CI repair (run 42379612785/1 on `d146a05`): the sort header's flex row made
each header its longest word plus the arrow, scrolling the 320 px zoom pane
26 px sideways in Linux fonts; the arrow now wraps like a word, and the zoom
spec forces Verdana to reproduce Linux widths locally (failed 25 px before,
passes after; family 98 passed). The backend
`authenticated-read-revision-stream.spec.ts` count raced the 80 ms test pace
against a slow backlog read; listings are now held in turn (reproduced, then
140 passed at `--repeat-each=20`). Refactor: `## REFACTOR COMPLETE`, no edits.

### 3. A summary shows its own figures above a sortable breakdown
Type: Behavior
Status: done
Proof: as mapped above for key example 2.

Behavior: select an entry or folder → its own counts, time (or comparison
times) and parts appear as a labelled group above the table, which holds
only children and **Not in the rows above** → sorting reorders children and
keeps the outside row last; activating a child opens its summary in the
same layout with the same sort; a sort column the next table lacks falls
back to default order. Unavailable evidence keeps the rows for drilling down
with the group showing the unavailable reason.

Accepted proof (2026-11-07): new `intent-summary-ci-proof-sort.spec.ts` and
`intent-summary-story-comparison-sort.spec.ts`; updated summary specs read the
scope's own figures from the group (`intentScopeProofPage.ts`); gate (41
family specs plus file Purpose, entry/folder summaries, reading place and
story changes) 106 passed in 4.2 min, rerun green after the refactor; units
and typecheck pass. Key example 2 runs on the fixture tree (`dashboard/tests`
and `folder/`), and Counts keep their existing words; the example's
`20 tests · 1 failed` is illustrative. Refactor disposition:
`## REFACTOR COMPLETE` (`CiProofFigures.tsx` is the one owner of column
headers and figure words for table rows and the group; `timingCellIn` is the
one column-to-timing map).

### 4. Story comparisons show change kind as a sortable column
Type: Behavior
Status: done
Proof: as mapped above for key example 3.

Behavior: a selected Done or Taken story's summary or CI status comparison
→ a **Change** column shows added, modified, removed or renamed, names
carry no trailing change words, the row cues stay → sorting **Change**
brings changed rows first by kind with unchanged rows last.

Accepted proof (2026-11-07): summary story comparison specs read headers
`Scope, Change, Counts, Baseline, Branch, Landed, Parts` and names without
change words; `intent-summary-story-comparison-sort.spec.ts` sorts Change
both ways (unchanged last) and Landed (gaps last) and checks the table fits
its box at 200% zoom in Verdana; unit `intent-ci-comparison-sort.test.mjs`;
gate 106 passed in 4.1 min; comparison specs, units, typecheck and lint
rerun green after the refactor. The CI status comparison names bare entries,
so it has no Change column; file Proof keeps its trailing change word (G1).
Refactor disposition: `## REFACTOR COMPLETE` (`changeIn` beside
`timingCellIn`; comparison sort units split out).

### 5. Evidence identity reads as grouped labels
Type: Behavior
Status: done
Proof: as mapped above for key example 5, plus the documentation reread.

Behavior: CI status Proof, a summary or a file's Proof with single-run or
comparison evidence → the attempt and run (linked), revision, branch,
completed-ancestor mark and CI wall time, or the Baseline, Branch and Landed
revisions with status words and the provisional mark, read as grouped short
labels with named icons; the tree-revision gap, previously retrieved
judgment, failed refresh, observed-not-attributed framing, absent child
breakdown and outside-row contents stay visible as short labels with their
full words available to assistive technology. Intent's documentation
matches the shipped wording.

Accepted proof (2026-11-07): `CiEvidenceLabels.tsx` renders every identity
strip (CI status Proof, Summary and file Proof evidence, story comparison
identity, Summary notes); specs read each label by accessible name and its
full words as description through `dashboard/tests/ciEvidenceLabelsPage.ts`;
the zoom specs add the strips to the Verdana override and whole-word checks;
gate 106 passed, rerun 106 passed after the refactor; units, typecheck pass;
retired evidence sentences are gone from `dashboard/src` and docs. Both
Intent docs reread against slices 1–5. Summaries still show no CI wall time
(it would be a new figure there). Refactor disposition:
`## REFACTOR COMPLETE` (label builders owned by `CiEvidenceLabels.tsx`;
`IntentScopeEvidenceLabels.tsx` and `storyCiComparisonSlotWords.ts` split
out to keep files within 250 lines).

## Execution complete

Product advice:
- Correction: [SEED-259#correct-scan-intent-ci-summaries](../504-correct-scan-intent-ci-summaries/PLAN.md)
  (evidence labels carry their meaning and full words in content rather than
  `aria-label`/`title` on list items; a sort survives a transient table
  without its column; one no-breakdown wording; comparison Summaries label
  the outside row and a missing file breakdown; revision stream spec within
  250 lines). Planned and ready, not queued.
- Next product step: SEED-258's Branch and Landed distinction in precise CI
  summaries should reuse `CiProofFigures.tsx`, `ciProofTiming.ts` and the
  sort owner rather than new phrasing.
- Future label work should prefer visible or visually hidden text over
  names on static elements, and keep shared sort state from being cleared
  by transient loading tables.
- SEED-260#restore-default-test-timeouts should cover the touched comparison
  specs that still set file-level timeouts or `test.slow()`.

## Story obligations

### G1. File Proof keeps its trailing change word
Reported: slice 4 — "File Proof keeps its trailing change word (the decision above)."
Story clause: "In a story comparison the story's change kind (added, modified, removed, renamed) moves from trailing words on the name into a short **Change** column"
Disposition: excluded "A selected file's Proof changes only as far as it shares the evidence identity and timing labels."

## Learnings

- 2026-11-07, premise run of the family: `dashboard/tests/intent/intent-story-ci-cues.spec.ts`
  (via `tests/support/captureTreeCiCueScreenshots.ts`) wrote four
  `tree-ci-cues-*.png` files into `.planning/slice-plans/493-compare-before-and-after-ci-proof/screenshots/`,
  a plan wrap-up already removed. The untracked files were deleted after the
  observation; slice 1 owns the repair.

- 2026-11-07, slice 1: `dashboard/src/ciProofTiming.ts` owns timing.
  `TimingCell { text, explanation?, ms? }` carries `ms` only when measured
  (for a comparison after-cell, the after value), so slice 2 sorts on `ms`
  and every cell without it falls after measured rows; `CiTiming.kind`
  separates partial from not recorded. A part without a file breakdown reads
  `Part N no breakdown`. Slice 3's overall group reuses `timingCellOf`.
  Specs touched here still carry pre-existing file-level `test.setTimeout`
  and `test.slow()`; SEED-260#restore-default-test-timeouts owns removing them.

- 2026-11-07, slice 2: `dashboard/src/ciProofSort.ts` owns the comparator;
  `CiProofTable` sorts only when a caller passes the controlled
  `sorting={ sort, onSort }`, rows carry `name` and may be `pinned`. Slice 3
  holds a `ColumnSort` in Intent's reading place and marks the outside row
  pinned; a column the table lacks yields no values, so rows keep their order,
  but no header then carries `aria-sort`, so slice 3 clears that sort. Header
  buttons add keyboard stops: summary zoom/keyboard assertions change when
  summaries opt in. Slice 4 adds a `change` column key with unchanged rows
  valueless. Counts puts failed first among equal totals in both directions.

- 2026-11-07, slice 3: the summary's own figures are `ScopeFigures`
  (`IntentScopeFigures.tsx`, group `CI proof of <path>`) above the table
  `CI proof of the immediate folders and files of <path>`; the sort is held
  by `useKeptReading("summaryCiSort")`; a sort by a column the table lacks is
  cleared in `CiProofTable`. Slice 4 adds Change's header and words in
  `CiProofFigures.tsx` and its value in `ciProofSort.valueOf`; child change
  words now come from `ChildName`'s marker and the
  `summaryComparison*ExpectedRows.ts` names. Slice 5's evidence lines sit
  above the group; new label strips join the zoom specs' Verdana override.

- 2026-11-07, slice 4: the summary comparison table has about 7 px of slack
  at 200% zoom in Verdana; slice 5's label strips sit outside
  `.intent-ci-proof-box` or join the zoom-fit steps. Evidence lines live in
  `ComparisonNamed` (`IntentScopeComparisonTable.tsx`), shared with file
  Proof.

## Refinement review

Slice-plan refinement was not needed: each slice owns one key example's
outcome and proof loop, the structure each needs (timing owner, sort values,
pinned row) sits inside the slice that first uses it, and the five share one
table and one timing model rather than accumulating special cases. No
remaining slice-specific concern was identified.
