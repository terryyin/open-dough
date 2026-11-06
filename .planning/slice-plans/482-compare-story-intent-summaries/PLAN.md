# Compare a story's Intent entry, folder, and file summaries

**Identity:** SEED-245#compare-story-intent-entry-folder-and-file-summaries
**Source:** [selected story](../../seeds/SEED-245-story-intent-summary-differences.md#compare-story-intent-entry-folder-and-file-summaries)
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-06. This is preparation only; execution needs its own instruction.

## Goal and boundaries

When a story is selected, an entry's or folder's Summary and a test file's
reading compare execution time and counted results at each scope. They use
the same baseline, branch and landed builds that the homepage comparison of
[SEED-244](../../seeds/SEED-244-story-ci-timing-changes.md#compare-story-ci-timing-changes)
names. Rows the story changed are marked, and gaps are explained per scope
and endpoint. The source owns scope, examples and deferred promises; this
plan organizes their execution.

Included:

- the scope comparison rule, built on the existing scope rule, for every
  endpoint;
- comparison columns in entry and folder Summaries, with change markers,
  added, removed and renamed rows, and the observed-not-attributed statement;
- counted-results differences at every compared scope, the homepage's entry
  rows included;
- a compact file summary above a test file's Purpose.

Excluded:

- new CI reads, adapter contract changes or stored copies;
- a variance band;
- file figures without a selected story;
- Review changes and card surfaces;
- sorting or filtering by difference.

Naturally supported inputs need no artificial rejection.

**Prerequisite.** The story's recorded dependency on SEED-244 blocks its
start until SEED-244's endpoints, their read and the homepage comparison rows
are published on `main`. Execution starts from that published code, not
from plan 481's intended design.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this plan, its execution, delegation, verification and
repair handoffs.

**Local gate:** after slice-local cleanup and refactoring, run:

- the slice's proof;
- `npm run lint`;
- `npm run typecheck:dashboard`.

Use `bash scripts/test.sh <paths>` for named repository checks. For browser
proof, use `npm run test:dashboard -- <specs> --workers=2`, with Homebrew
Bash 5 first on PATH and `env -u NO_COLOR -u FORCE_COLOR` for direct
Playwright runs. A fresh worktree needs `npm ci` and the native setup first.

Summaries and the homepage share one CI evidence owner. After each slice,
also run all `dashboard/tests/intent-summary-ci-proof*.spec.ts`,
`intent-ci-status*.spec.ts`, `intent-ci-proof*.spec.ts` and
`intent-story-*.spec.ts`, including their boundary variants, together with
SEED-244's comparison specs. The consumer table below explains why. CI runs
a full repository suite, but that alone does not make it a local gate.

For long runs, follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):

- start fully awake;
- on AC power, use `caffeinate -s -i`;
- on battery, plug in, or keep the lid open under `caffeinate -i` and
  inspect the sleep log afterwards.

Execution owns the published CI result through its applicable final result.

## Existing solutions and architecture

- **Endpoints and proofs are SEED-244's.** Its story CI comparison gives
  the baseline, branch and landed slots, each a build identity with its
  selection rule or a gap. Its homepage reads each endpoint's proof summary
  through `intent=ci-proof` with the full revision. This plan adds no read.
  If SEED-244's delivered code holds those proofs only inside the homepage
  component, slice 1 first moves them into Intent's one CI evidence owner
  (`IntentCiEvidence.tsx`). Summaries then read them as they read the judged
  proof today, and drilling asks CI nothing again.
- **One scope comparison rule.** For a scope path and each endpoint's
  summary, take the endpoint's figures by the existing rules in
  `ciScopeProof.ts`, `owningEntryOf`, `scopeFiguresOf` and `outsideOf`.
  Use the entry's own figures (`ciProofCellsOf`) at entry scope, as
  `IntentScopeProof.tsx` does. Then classify the result:
  - **no breakdown:** the owning entry has no file breakdown at that
    endpoint (`hasFileBreakdown`);
  - **absent:** a breakdown exists, but no file at the scope has a result
    (`files: 0`);
  - **partial:** the figures are untimed or missing parts;
  - **measured:** a complete value.

  A rename uses its old path at the baseline. The old path comes from the
  story overlay's `ReviewedFile`, which `IntentSelectionReading.tsx`
  already holds in `treeFiles`. A signed difference exists only between two
  measured values. SEED-244's homepage entry rows are this rule at entry
  scope. Where SEED-244 implemented its own per-entry difference, merge it
  into this rule rather than keep two.
- **Presentation reuses the Summary table.** `CiProofTable.tsx` and
  `ciProofWording.ts` gain the comparison cells and the change-kind marker.
  Use the Summary's precise duration words (`ciProofTimeWords.ts`) for
  values and differences. The homepage keeps its whole-second comparison
  wording. Name the compared builds once, using the homepage's endpoint
  naming, and reuse its observed-not-attributed sentence.
- **Late answers.** The selected story's comparison is keyed by story
  identity and endpoint attempts, as SEED-244's homepage is. A Summary never
  renders figures for another story or another attempt.
- **Applicable decisions.**
  - [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
    a derived view, with evidence gaps never shown as results, and the
    Selected story scoping the reading.
  - [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md):
    observed CI results stay distinct from procedures.
  - No conflict.

## Decisive premises and retained observations

Observed on 2026-11-06 in this owned preparation workspace at
`a3b24e5d4316b587aeb5d6c7a4d6027b7c4e78c3`, Node from `.node-version`. The
reads were unpaid and against the real `terryyin/open-dough` repository. No
product edits were made.

| Premise and consuming operation | Form/profile and observed result | Remainder |
| --- | --- | --- |
| Current summaries carry per-file durations for every entry; slices 1 and 3 | Downloaded `ci-proof-summary-attempt-1` (artifact 13445331009) of run 42089732004 at `ab65cea84`, the summary the existing proof read parses. Every file in all three entries has `durationMs`: 744, 190 and 296 files. File sums equal each entry's `durationMs` (8,960,322, 955,800 and 1,057,200 ms). Four files record a measured `0`. | None |
| The existing scope rule gives folder and file figures from an endpoint's summary; slices 1 and 3 | Bundled the actual `dashboard/src/ciScopeProof.ts` with `npx esbuild` and ran `owningEntryOf` and `scopeFiguresOf` on that summary. `dashboard/tests/support` gave 2 files and 81,891 ms. `accessible-board-keyboard.spec.ts` gave 2 passed and 15,432 ms. `src/skills/dough-bug-fixing` gave 1,400 ms. | None |
| Old summaries lack breakdowns, and the scope rule alone cannot tell that apart from an absent path; slice 1's classification and example 5 | The same bundled rule on artifact 13369710729 (2026-11-04, `1b37ad486`) answered `files: 0` with no duration for every scope, including each entry's own path. Its entries have no `files` and no `durationMs`, and its parts have neither `breakdown` nor `durationMs`. The no-breakdown class must therefore come from `hasFileBreakdown`, as `IntentScopeProof.tsx` does now. | None; these summaries expire on 2026-12-04, so the browser proof uses fixtures. |
| Renames and change kinds are available where Summaries render; slice 1 | `intentStoryOverlay.ts` gives each changed tree file its `kind` and `ReviewedFile` (with `oldPath` for renames). `IntentSelectionReading.tsx` receives that map as `treeFiles` but passes `IntentSummary` only paths. | Threading it through is slice 1 work, not an unknown. |
| SEED-244's endpoints, proofs and homepage rows exist in the form this plan consumes; slices 1 and 2 | Not observable: SEED-244's branch `cursor/compare-a-story-s-ci-and-entry-timing-changes` holds no commit beyond `main`, as checked on 2026-11-06. | Bounded by the recorded dependency, which blocks the start until they are published. Slice 1's first step reads the delivered code and applies the evidence-owner rule above. |

## Outside-in proof and consumers

| Source promise / examples | Owning slice and observation |
| --- | --- |
| Entry and folder comparison of execution time, markers, renames, gaps, cleanup and replacement (1, 3, 4, 5, 6) | Slice 1: a new browser journey, `intent-summary-story-comparison*.spec.ts`, builds on SEED-244's done-story-plus-CI fixture. Its three summaries have file breakdowns made with the summary specs' existing helpers. Select the story, select `dashboard/tests`, then a nested folder. Each row shows baseline, branch and landed with signed precise differences. A sub-second change shows in ms. Changed rows are marked. An added file has no baseline, a removed file no result, and a renamed file names its old baseline path in another entry. A later-trunk file is not in the compared builds. Variants: a baseline without a breakdown, where the entry is compared and folders explained; a running landed build; Trunk Mode with Branch not applicable; deleting the branch and advancing trunk leaves the figures unchanged; selecting another story replaces them. With no story selected, the existing Summary specs stay green. |
| Counted-results differences, homepage included (1) | Slice 2: the same journey asserts 2,090 → 2,092 **+2** tests in the entry Summary and on the homepage's entry row, and count differences in folder and file rows. An absent or no-breakdown endpoint shows no count difference. |
| File summary (2, 4) | Slice 3: open a changed test file. A compact summary above its diff shows 10 s → 14 s **+4 s** and its counts, and the diff is unchanged beneath it. An added file shows added, and an unchanged file shows its source with the summary. With no story selected, the file reading has no summary (existing file-reading specs). |
| Observed, not attributed; provisional | Slices 1 and 3 assert the statement. A Taken-story variant in slice 1 shows the provisional label from SEED-244's endpoints. |

Before accepting each change, run the installed consumer-trace command
against its diff. Give each consumer a disposition: run, reused, or excluded
with the reason the effect cannot reach it. Carry these known effects:

| Consumer/effect | Required treatment |
| --- | --- |
| `intent-summary-ci-proof*.spec.ts`, `IntentScopeProof.tsx` | Without a selected story, the Summary's table, wording and outside row stay unchanged. |
| SEED-244's homepage comparison specs, `intent-ci-status*.spec.ts` | Merging the per-entry difference into the shared rule keeps the homepage's figures, whole-second wording and gaps. Slice 2 adds only the count differences. |
| `intent-story-*.spec.ts`, `IntentFileReading.tsx`, `intentStoryOverlay.ts` | The tree, overlay, "Selected story only" and diff Purpose stay unchanged. The file summary sits above them. |
| Intent's evidence owner and its read counts | Selecting, drilling and returning home make no additional CI or proof read. Assert with the existing read-count fixtures. |

## Slices

### 1. Compare execution time in a selected story's entry and folder Summaries
Type: Behavior
Status: done
Proof: the new Summary comparison journey and its variants; the consumer
specs above; the local gate.

**Behavior:** a story is selected, and an entry or folder is selected →
the Summary names the compared builds and the statement. Its own row, each
immediate child and the outside row show baseline, branch and landed
execution time with signed precise differences. Changed rows are marked, and
added, removed, renamed, absent, no-breakdown, partial and unavailable
endpoints are explained per row.

First read SEED-244's delivered comparison, and move its endpoint proofs
into the evidence owner if they are not already there. Add the scope
comparison rule beside `ciScopeProof.ts`, and merge SEED-244's per-entry
difference into it. Thread the overlay's changed files into the Summary.
Update the Summary description in `docs/dashboard-development-intent.md`.

**Safe stop:** entry and folder Summaries compare execution time for a
selected story; counts stay as they are for the homepage's chosen build.

### 2. Compare counted results at every compared scope
Type: Behavior
Status: planned
Proof: the slice-1 journey extended with count assertions on the Summary
and the homepage entry rows; SEED-244's homepage specs; the local gate.

**Behavior:** a story is selected → each compared Summary row and each
homepage entry row shows its counted results at each endpoint with signed
differences. Outcome counts and parts completeness stay for the homepage's
chosen build. An endpoint without a measured count shows its gap, not a
difference.

Add counts to the same scope comparison rule. No second rule is needed.

**Safe stop:** entry and folder outcome complete.

### 3. Summarize a selected story's comparison for a test file
Type: Behavior
Status: planned
Proof: the file-level journey; the file-reading and story-diff consumer
specs; the local gate.

**Behavior:** a story is selected and a test file is opened → a compact
summary above its Purpose shows the file's execution time and counted
results at each endpoint, with differences, change kind and gaps, and the
statement. The source or diff below it is unchanged. Without a story, the
file reading is unchanged.

Apply the same scope comparison at file scope. Update the file-reading
description in `docs/dashboard-development-intent.md`.

**Safe stop:** the story is complete.

## Story obligations

### G1. No new evidence beyond SEED-244
Reported: slice 1 — "No new CI read, adapter contract or stored copy beyond SEED-244's."
Story clause: "No new CI read, adapter contract or stored copy beyond SEED-244's."
Disposition: excluded "No new CI read, adapter contract or stored copy beyond SEED-244's."

### G2. Proof-summary retention
Reported: slice 1 — "Availability follows the provider's retention; this repository keeps proof summaries for 30 days."
Story clause: "Availability follows the provider's retention; this repository keeps proof summaries for 30 days."
Disposition: excluded "Availability follows the provider's retention; this repository keeps proof summaries for 30 days."

### G3. No variance band
Reported: slice 1 — "No variance band or significance judgment, as in SEED-244."
Story clause: "No variance band or significance judgment, as in SEED-244."
Disposition: excluded "No variance band or significance judgment, as in SEED-244."

### G4. No file figures without a story
Reported: slice 1 — "A test file's CI figures without a selected story are not part of this story."
Story clause: "A test file's CI figures without a selected story, and comparisons in Review changes or story cards, are not part of this story."
Disposition: excluded "A test file's CI figures without a selected story, and comparisons in Review changes or story cards, are not part of this story."

### G5. No Review or card comparisons
Reported: slice 1 — "Comparisons in Review changes or story cards are not part of this story."
Story clause: "A test file's CI figures without a selected story, and comparisons in Review changes or story cards, are not part of this story."
Disposition: excluded "A test file's CI figures without a selected story, and comparisons in Review changes or story cards, are not part of this story."

### G6. No sorting or filtering by difference
Reported: slice 1 — "No sorting or filtering by difference. Rows keep the tree's order."
Story clause: "No sorting or filtering by difference. Rows keep the tree's order."
Disposition: excluded "No sorting or filtering by difference. Rows keep the tree's order."

## Current decisions and readiness review

- **Product decisions are in the source:** same endpoints as the homepage,
  precise Summary durations, the gap classes, change markers, counts on the
  homepage's entry rows too, and no file figures without a story.
- **No decision waits on a person.** No paid observation or native host run
  is required. The only start blocker is the recorded SEED-244 dependency.
  This preparation does not select an execution mode, Take the story, or
  start it.

The common model is one scope comparison: a path's figures at each of the
story's endpoints, classified as measured, partial, absent, no breakdown or
unavailable. Entry, folder, file, homepage row, time and counts are all
uses of it, and none needs a separate recognizer.

Slice-plan refinement was not needed. Each slice owns one observable outcome
and one proof loop:

- slice 1 needs the rule, evidence wiring and Summary columns to show
  anything at all;
- slice 2 adds a second figure to the same rule across two surfaces;
- slice 3 adds a differently placed surface.

No numeric slice target or hard limit was supplied. Slice 1 is the largest,
because it carries the evidence wiring and the rule. Its size depends on how
SEED-244 delivered its proofs, which the dependency bounds and slice 1's
first step reads. This review found no remaining slice-specific concern.
