# Restore Purpose and Proof tabs for individual Intent files

**Identity:** SEED-247#restore-file-purpose-and-proof
**Source:** [selected story](../../seeds/SEED-247-restore-file-purpose-and-proof.md#restore-file-purpose-and-proof)
**Prepared:** 2026-11-06. This is preparation only; execution needs its own instruction.

## Goal and boundaries

Selecting an individual Intent file offers Purpose and Proof tabs. Purpose is
the file's source or the selected story's source diff. Proof is that file's
published CI runtime evidence — the judged run's results and execution time
without a story, or the story's baseline / branch / landed comparison with
signed timing differences when a story is selected — without stacking that
comparison above Purpose.

Included:

- Purpose/Proof tabs on file selection (shared `IntentTabs` pattern);
- Purpose as today's source reader and story diff, with no CI comparison above it;
- Proof from Intent's existing CI evidence owner for that file path (summary or
  comparison), including gap wording;
- keeping the chosen tab across file selections in the same Intent visit;
- Optimization Candidates opens still landing on Purpose on the case;
- Intent reading guidance update for the file reading pane.

Excluded:

- side-by-side Purpose/Proof layout or remembered split;
- local proof readers, location `proof` / `runner` settings, or running tests
  from Intent;
- changing location/folder Summaries, the Intent / Optimization Candidates
  strip, or homepage **CI status → Proof**;
- durable remembered Proof tab across reloads.

Naturally supported inputs need no artificial rejection.

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

After the slice, also run `dashboard/tests/intent-summary-story-comparison-file.spec.ts`,
`intent-summary-ci-proof*.spec.ts`, `intent-ci-status*.spec.ts`,
`intent-home-activation.spec.ts`, `intent-story-*.spec.ts`, and
`intent-test-optimization-candidates.spec.ts` (or their current names), including
boundary variants that assert Purpose regions or file reading. CI runs a full
repository suite, but that alone does not make it a local gate.

For long runs, follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):

- start fully awake;
- on AC power, use `caffeinate -s -i`;
- on battery, plug in, or keep the lid open under `caffeinate -i` and
  inspect the sleep log afterwards.

Execution owns the published CI result through its applicable final result.

## Existing solutions and architecture

- **Reuse the historical Purpose/Proof tab shell.** Before SEED-238,
  `IntentFileReading` composed `IntentTabs` with Purpose and Proof panels and
  kept the chosen tab across files. Restore that shell only (no side-by-side,
  no local `IntentProof`). Keep the chosen tab with Intent's disposable reading
  place (`useKeptReading` in `pageIntentReading.tsx`), matching the mode strip.
- **Reuse Intent's one CI evidence owner.** `IntentCiEvidence` /
  `scopeEvidenceOf` already supply `summary`, `comparison`, or `none` for
  Summaries and today's stacked `IntentFileComparison`. Proof reads those
  figures for the selected file path; selecting Proof asks CI nothing again.
- **One file Proof presentation.** Extend or rename `IntentFileComparison` into
  the Proof panel body: for `summary`, one `CiProofTable` row from the existing
  scope rules (`scopeFiguresOf` / `ciScopeCellsOf` / gap wording); for
  `comparison`, today's comparison row and naming; for `none`, the same
  absence line Summaries use. Do not add a second evidence path.
- **Purpose stays the source/diff reader.** Move the stacked comparison out of
  `IntentFileReading`'s Purpose section into the Proof panel.
- **Applicable decisions.**
  - [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
    Product intent contains Purpose and Proof; the dashboard observes published
    evidence; presentation state is disposable.
  - [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md):
    Purpose and Proof remain distinct; observed results stay distinct from
    procedures.
  - No conflict with SEED-238's removal of local proof. No new North Star topic;
    update `docs/dashboard-development-intent.md` for the delivered file reading.

## Decisive premises and retained observations

Observed on 2026-11-06 in this owned preparation workspace (unpaid, no product
edits).

| Premise and consuming operation | Form/profile and observed result | Remainder |
| --- | --- | --- |
| File selection today shows Purpose only, with optional stacked story comparison | `IntentFileReading.tsx` renders Purpose; when `story !== undefined` it mounts `IntentFileComparison` above that section. `intent-summary-story-comparison-file.spec.ts` asserts a "File summary" region above Purpose | None |
| SEED-238 removed tabs with local proof; CI Summaries remain | Commit `6644e55c7` deleted Purpose/Proof tabs and local proof modules. `IntentScopeProof` / homepage Proof still read CI via `IntentCiEvidence` | None |
| File-scope figures and comparison cells already exist for this path | `IntentFileComparison` uses `scopeComparisonCellsOf` at file path. `ciScopeProof.ts` `scopeFiguresOf` / Summary child rows supply single-proof cells for the same paths | None |
| Nested `IntentTabs` and kept reading state are already product patterns | `IntentModeTabs` uses `IntentTabs`; `pageIntentReading` keeps disposable reading keys across Intent remounts. Historical `ce6777a29` Purpose/Proof tablist is the prior file-reading form | None |

## Outside-in proof and consumers

| Source promise / examples | Owning slice and observation |
| --- | --- |
| No-story Purpose source and Proof CI results / gaps (1, 4) | Slice 1: browser journey selects a file with no story; Purpose shows source; Proof tab shows that file's judged-run counts and time, or names the gap without zeroing or borrowing |
| Story Purpose diff without stacked comparison; Proof comparison and signed timing (2, 3) | Slice 1: extend or replace `intent-summary-story-comparison-file.spec.ts` — open a changed file under a done story; Purpose holds the diff with no File summary above it; Proof holds the comparison row (10 s → 14 s **+4 s** style) and the observed-not-attributed statement |
| Folder/location Summaries unchanged (5) | Slice 1: existing `intent-summary-ci-proof*.spec.ts` and story-comparison Summary specs stay green |
| Tab kept across files; candidates open Purpose on the case (6) | Slice 1: choose Proof, select another file → Proof remains selected with that file's evidence; Optimization Candidates entry opens Purpose on the case (`intent-test-optimization-candidates.spec.ts`) |

Before accepting the change, run the installed consumer-trace command against
its diff. Give each consumer a disposition: run, reused, or excluded with the
reason the effect cannot reach it. Carry these known effects:

| Consumer/effect | Required treatment |
| --- | --- |
| `intent-summary-story-comparison-file.spec.ts`, `IntentFileComparison.tsx` | Comparison moves into the Proof tab; update assertions from "above Purpose" to Proof panel |
| `intent-summary-ci-proof*.spec.ts`, `IntentScopeProof.tsx` | Entry/folder Summaries unchanged without and with a story |
| `intent-story-*.spec.ts`, Purpose regions, story diffs | Purpose remains source or story diff; no stacked summary |
| `intent-home-activation.spec.ts`, `intent-ci-status*.spec.ts` | Homepage and empty selection unchanged |
| `intent-test-optimization-candidates.spec.ts` | Opening a case still lands on Purpose |
| Intent CI evidence owner and read counts | Selecting Proof, switching tabs, and changing files make no additional CI or proof read |

## Slices

### 1. Offer Purpose and Proof tabs for a selected Intent file
Type: Behavior
Status: planned
Proof: the file Purpose/Proof browser journeys above (no-story Proof, story
Proof comparison, tab persistence, candidates → Purpose); the consumer specs
in the table; the local gate.

**Behavior:** a configured Intent file is selected → the reading pane offers
Purpose and Proof tabs (Purpose first on a fresh reading). Purpose shows the
published source or the selected story's source diff, with no CI comparison
stacked above it. Proof shows that file's published CI evidence from Intent's
existing evidence owner: judged-run results and execution time without a story,
or baseline / branch / landed comparison with signed timing differences, change
markers, and the observed-not-attributed qualification when a story comparison
is available. Missing measurements explain the gap without treating absence as
zero or borrowing another file's figures. The chosen tab is kept across file
selections in the same Intent visit; an Optimization Candidates open chooses
Purpose positioned on the case. Location and folder Summaries, the mode strip,
and homepage CI status → Proof stay as they are.

Restore the Purpose/Proof tab shell in `IntentFileReading` (reuse `IntentTabs`;
keep tab choice with the reading place). Generalize the current file comparison
body into the Proof panel for both `summary` and `comparison` evidence kinds.
Update `docs/dashboard-development-intent.md` so file reading describes Purpose
and Proof tabs rather than a stacked comparison above Purpose.

**Safe stop:** individual files restore Purpose/Proof from published CI; folders
and the homepage remain unchanged; local proof stays removed.

## Concern evidence and readiness

- Slice-plan refinement: not needed — one Behavior slice owns one cohesive file
  reading outcome, reuses existing tab and CI evidence solutions, and maps each
  key example to that slice's proof without independent second outcomes or
  hidden preparation.
- Remaining slice-specific concerns: none identified.

## Current decisions

- Proof is published CI observation only (SEED-238 stands).
- Side-by-side Purpose/Proof layout remains deferred.
- No numeric slice target or hard limit is established here; the slice is
  bounded by one proof loop and the Behavior gate above.
