# Compare before-and-after CI proof in Intent

**Identity:** SEED-255#compare-before-and-after-ci-proof
**Source:** [Compare before-and-after CI proof in Intent](../../seeds/SEED-255-compare-before-and-after-ci-proof.md#compare-before-and-after-ci-proof)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

With a done or Taken story selected, a developer scans the overall CI change
on Intent's **CI status** homepage, then finds the entries and files that
account for it from cues in the entry table, the scope summaries and the
location tree, with every cued difference readable as text. The seed's
Scope, Deferred promises and Key examples are the source; this plan adds no
promise.

Included: the active comparison (Landed with proof, else Branch or the
provisional tip), an overall summary with test count (units kept apart) and
the comparison's timing measure, readable `before → after (Δ)` text with
percentages where the baseline is a measured non-zero duration, count
borders and duration tints with the seed's thresholds on the homepage
summary and entry rows, scope summary rows, file **Proof**, location headers
and tree file rows, accessible text equivalents, and selection and focus
that stay distinct from both cues.

Excluded (seed deferred promises): a Branch/Landed switch, folder-row cues
in the tree, a ranked contributor list, and which build or timing measure
each endpoint supplies (SEED-254 and SEED-256).

## Existing solution and decisions

- PFE: the comparison already exists end to end. `IntentCiComparison.tsx`
  shows each endpoint's build identity (exact or ancestor) and CI wall time
  with a signed difference; `storyCiComparisonEntries.ts` and
  `ciScopeComparison.ts` (with `ciScopeComparisonCounts.ts` and
  `ciScopeComparisonTiming.ts`) word the entry, summary and file rows from
  Intent's one evidence owner (`IntentCiEvidence.tsx`), which wraps the
  whole Intent body including the location tree (`IntentPerspective.tsx`
  → `IntentBrowser.tsx` → `IntentLocationGroup.tsx`). Reuse and change
  these; add one classification beside the counts and timing classifiers
  and no new CI read.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  cues and wording present observed builds, keeping the existing
  "observed builds; differences are not attributed to the story" framing.
- [Dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md):
  text carries every status shown by color, no essential meaning only on
  hover, 4.5:1 text and 3:1 control and focus contrast, and warning or error
  styling stays reserved for evidence or retrieval problems. The red
  "slower" or "more" cue therefore uses its own tokens, not the error
  styling.
- Existing tree styles the cues must stay distinct from
  (`change-kinds.css`, `story-review-files.css`): a location holding story
  changes carries an inset `--ready` leading edge, a folder holding changes
  has a `--ready` 12% background, a selected row or location header takes an
  `--accent` 12% fill, and change kinds style the file name.
- No North Star topic is needed: the classification is local to Intent's
  existing comparison.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| Real CI proof summaries carry per-file counts and durations that reach the file and folder comparison rows | Production dashboard `http://127.0.0.1:4173`, project open-dough, done story SEED-010#review-source-promises-before-first-slice selected in Intent, folder `src/skills/dough-execute-plan/scripts` Summary and `agent-commit.test.mjs` **Proof**, 2026-11-07 (headless Chromium script in the job temp directory) | Each file row showed count and baseline/branch durations at 100 ms precision (e.g. `5.0 s` → `4.0 s -1.0 s`, `1.4 s` → `1.1 s -300 ms`). Landed was a cancelled build, so Branch carried the comparison. |
| Run-to-run timing noise between single builds on unchanged work | Same observation: entry and file rows of a story that changed none of those tests | Entries moved −10% to +1% (`tests` 15 min 55 s → 14 min 17 s); second-long files moved 100–300 ms (14–21%), 4–16 s files under 10%. Supports the seed's 10% and 1 s no-tint floor. |
| Current text is run together | Same observation | Counts read `1,098 → 1,098 0 tests` and `1 → 1 0 checks`; wall time `13 min 27 s +8 min 28 s`. Slice 1 replaces these. |
| The location tree can consume the shared evidence without a new read | `IntentCiEvidenceProvider` wraps `bodyOf()` in `IntentPerspective.tsx`, which renders `IntentBrowser` holding both `IntentLocationGroup` (tree) and `IntentSelectionReading`; the live folder Summary above, a sibling consumer under the same provider, showed comparison rows | Settled for the tree as another consumer of the same context; no proxy difference (same provider, same render). |
| The existing comparison specs run and pass at baseline in this worktree | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent/intent-ci-comparison.spec.ts dashboard/tests/intent/intent-ci-comparison-entries.spec.ts dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts` at `588f8b7c8` | See the result recorded below the table. |
| Consumers of the changed wording | `grep -rlE` for the counts/time text forms and for `scopeComparisonCellsOf`, `countsCellText`, `afterCellText`, `wallTimeDifferenceWords` at `588f8b7c8` | Specs and support: `intent-ci-comparison.spec.ts`, `intent-ci-comparison-entries.spec.ts`, `intent-ci-comparison-gaps.spec.ts`, `intent-ci-comparison-landing-gaps.spec.ts`, `intent-ci-comparison-taken.spec.ts`, `intent-ci-comparison-fast-forward.spec.ts`, `intent-summary-story-comparison.spec.ts`, `intent-summary-story-comparison-gaps.spec.ts`, `intent-summary-story-comparison-file.spec.ts`, `tests/support/summaryComparisonExpectedRows.ts`, `summaryComparisonGapExpectedRows.ts`, `expectCiComparisonEntryRows.ts`. Production: `IntentCiComparison.tsx`, `IntentFileProof.tsx`, `IntentScopeComparisonTable.tsx`, `IntentScopeProof.tsx`, `storyCiComparisonEntries.ts`, `storyCiComparisonWording.ts`. Slice 1 re-runs this search after its change. |

Baseline spec run: exited 0, 10 passed in 35.5 s, after `npm ci` and
`node scripts/setup-native.mjs browser` in this worktree on Node 24.21.0
(matching `.node-version`).

## Outside-in proof and ownership

| Promise (seed) | Owner | Proof |
| --- | --- | --- |
| Active comparison named; Landed with proof else Branch/provisional; same in summary, table, tree | Slice 1 (summary, table), slice 3 (tree) | `intent-ci-comparison.spec.ts` (clean landing → Landed), `intent-ci-comparison-landing-gaps.spec.ts` (cancelled landing → Branch with the reason), `intent-ci-comparison-taken.spec.ts` (provisional) |
| Overall summary: test count with units apart, timing measure, signed differences, partial and gap wording | Slice 1 | `intent-ci-comparison.spec.ts`, `intent-ci-comparison-gaps.spec.ts`, `intent-ci-comparison-entries.spec.ts`; module test of the overall sum |
| Readable `before → after (Δ)` with percentage only for a measured non-zero baseline; measured zero, missing and partial distinct | Slice 1 | module tests beside `tests/support/intent-scope-proof.test.mjs`; the comparison and summary specs above |
| Count border and duration tint thresholds (any count change; strong at ≥50%; no tint under 10% or 1 s; zero baseline light only; no cue for added, removed, gap or partial) | Slice 2 | module test of the classifier with the seed's key examples |
| Cues on overall summary, entry rows, summary rows, file **Proof** | Slice 2 | `intent-ci-comparison.spec.ts`, `intent-summary-story-comparison.spec.ts`, `intent-summary-story-comparison-file.spec.ts` assert the cue state and its text |
| Cues and accessible names on tree file rows and location headers; selection and focus distinct; no color-only or hover-only meaning | Slice 3 | new `dashboard/tests/intent/intent-story-ci-cues.spec.ts`; recorded screenshot review in light and dark themes |
| No cues or comparison wording without a selected story with a comparison | Slices 2 and 3 | `intent-ci-status-story.spec.ts` and the new tree spec's no-story case |
| Product documentation | Each slice | `docs/dashboard-development-intent.md` updated for what the slice shows |

Local gates: `npm run lint`, `npm run --silent typecheck:dashboard`, focused
module tests through `bash scripts/test.sh <paths>`, and focused Playwright
runs of each slice's named specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, under
the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection). Before landing, run every
`dashboard/tests/intent/intent-ci-*` and `intent-summary-*` spec once,
because slice 1 changes shared wording those journeys read.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Ordered slices

### 1. Read the active comparison and every difference as separate text
Type: Behavior
Status: done
Proof: module tests for the readable cell words, percentage rule and the
overall sum with units kept apart; the comparison, entries, gaps,
landing-gaps, taken, fast-forward and summary comparison specs updated to
the new wording; typecheck and lint.

Behavior: A done story whose landed build has proof → the homepage names
"Baseline compared with Landed" with both builds' revision, run, attempt
and exact-or-ancestor selection, then an overall summary such as
`2,080 → 2,082 tests (+2)` and `492 checks (no change)` and the timing
measure as `4 min 59 s → 5 min 30 s (+31 s, +10%)`, then the entry table
whose cells read `12 → 10 tests (−2)` and `8 s → 12 s (+4 s, +50%)`.
A cancelled landing → the summary says Baseline compared with Branch and
why Landed is not used. A measured zero baseline gives an absolute
difference with no percentage; a missing measurement or partial entry says
so and the overall count says partial with its reason. Summary rows and
file **Proof** use the same words. Table columns keep each endpoint's own
values.

### 2. Classify each change once and cue it in the summary, table and Proof
Type: Behavior
Status: planned
Proof: module test of the classifier on the seed's examples (−2 of 12 →
light green border; +4 s of 8 s → strong red tint; −1 s of 4 s → light
green tint; +7% → no tint; −300 ms of 1.4 s → no tint; zero baseline +2 s →
light tint; added, removed, gap and partial → no cue with reason);
`intent-ci-comparison.spec.ts`, `intent-summary-story-comparison.spec.ts`
and `intent-summary-story-comparison-file.spec.ts` assert each cued row's
cue state and its text; `intent-ci-status-story.spec.ts` keeps no cue
without a comparison; typecheck and lint.

Behavior: A done story with the seed's first example entry → its homepage
row and the overall summary show a light green count border and a strong
red duration tint, and the same row inside a location Summary and that
file's **Proof** show the same cues; a row with only a 7% change has text
and no tint. One classification from the shared evidence feeds every
surface; colors use their own tokens with the North Star contrast, and
dark theme keeps the same meanings.

### 3. Cue tree files and location headers with distinct selection and focus
Type: Behavior
Status: planned
Proof: new `dashboard/tests/intent/intent-story-ci-cues.spec.ts`: a cued
file row and location header expose the cue state and an accessible name
with the same words as **Proof**; selecting and keyboard-focusing a cued
file keeps the cues and shows a selection outline and focus ring distinct
from them; a location with story changes keeps its change mark beside a
count cue; no story selected shows no cues. A screenshot review of light
and dark themes at desktop and phone widths is recorded in this plan's
Learnings. Typecheck and lint; the intent story-changes specs that assert
selection or change styling stay green.

Behavior: A done story whose comparison has a file running 25% faster with
the same count → its tree row has a light green tint and no border, its
accessible name says `6 tests (no change)` and `4 s → 3 s (−1 s, −25%)`,
and selecting it shows a selection outline instead of the accent fill
while the tint stays visible; its location header carries its entry's cue
without hiding the story change mark. The tree reads no CI of its own.

## Refinement review

Refinement was not needed: the three Behavior slices separate wording and
the overall summary, the shared classification and its reading-pane cues,
and the tree's cues with selection and focus, each with outside-in proof;
none repeats another's domain rule.

No remaining slice-specific concern was identified in this review.

## Current decisions

- Timing measure: slice 1 uses the measure the comparison supplies for
  timing differences. If
  [plan 492](../492-compare-ci-time-without-runner-waits/PLAN.md) (SEED-256)
  has landed, the overall summary's difference and cue use its estimate
  without runner waits and keep wall time as context; otherwise CI wall
  time. Both plans touch `IntentCiComparison.tsx` and
  `storyCiComparisonWording.ts`; whichever executes second rebases onto the
  other's landed wording. At slice 1 delivery SEED-256 was still planned, so
  the overall timing difference uses CI wall time.
- Thresholds are the seed's, from the noise observed above: any count
  change shows, strong at ≥50% of the baseline count; no duration tint under
  10% or 1 s, strong at ≥50%; a zero baseline gets at most the light tint.
- Execute in Story Branch Mode or Trunk Mode as started; no trunk-only step.

## Learnings

- Folder `10.3 s → 14.4 s` is **+39%** from summed milliseconds (10340→14410),
  not +40% from display rounding; percentage uses measured ms, not rounded
  display words.
- Intent CI comparison product docs exceeded the 250-line file-size check;
  comparison wording lives in
  [dashboard-development-intent-ci-comparison.md](../../../docs/dashboard-development-intent-ci-comparison.md).
- Accepted slice 1 proof: module
  `tests/support/intent-scope-comparison-wording.test.mjs` (cell words,
  percentage rule, overall units, neither-build total); Playwright
  `intent-ci-comparison*.spec.ts` including Taken Branch/Provisional active
  titles, and `intent-summary-story-comparison*.spec.ts` for shared
  Summary/Proof cells; typecheck.

## Story obligations

### X1. Switch control between Branch and Landed
Reported: slice 1 — "Deferred: A control to switch the active comparison between Branch and Landed."
Story clause: "A control to switch the active comparison between Branch and Landed."
Disposition: excluded "A control to switch the active comparison between Branch and Landed."
Commitment: 34.1

### X2. Folder-row cues in the tree
Reported: slice 1 — "Deferred: Cues on folder rows in the tree; folders keep their summary rows."
Story clause: "Cues on folder rows in the tree; folders keep their summary rows."
Disposition: excluded "Cues on folder rows in the tree; folders keep their summary rows."
Commitment: 34.2

### X3. Ranked contributor list
Reported: slice 1 — "Deferred: A ranked list of the largest contributors."
Story clause: "A ranked list of the largest contributors."
Disposition: excluded "A ranked list of the largest contributors."
Commitment: 34.3

### X4. Endpoint build and timing-measure ownership
Reported: slice 1 — "Deferred: Which build or timing measure each endpoint supplies stays with its own stories."
Story clause: "Which build or timing measure each endpoint supplies stays with its own stories"
Disposition: excluded "Which build or timing measure each endpoint supplies stays with its own stories"
Commitment: 34.4
