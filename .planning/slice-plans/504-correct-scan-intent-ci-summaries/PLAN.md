# Correct Intent CI label announcements and summary sort fallback

**Identity:** SEED-259#correct-scan-intent-ci-summaries
**Source:** [Correct Intent CI label announcements and summary sort fallback](../../seeds/SEED-259-scan-intent-ci-summaries.md#correct-scan-intent-ci-summaries)
**Source review:** [Source-only review](source-review.md)

Provenance: execution retrospective of
Scan CI summaries in dashboard Intent (SEED-259#scan-intent-ci-summaries:
`5b4cd8959bc7:.planning/seeds/SEED-259-scan-intent-ci-summaries.md#scan-intent-ci-summaries`
and `5b4cd8959bc7:.planning/slice-plans/499-scan-intent-ci-summaries/PLAN.md`),
base `8ecd81f56`, reviewed commits `0ffcc27` (slice 1), `d146a05` (slice 2),
`68e5f52` (CI repair), `e12188a` (slice 3), `523034a` (slice 4) and
`b1126e5` (slice 5).

## Current findings

Each was checked against the code at `b1126e511` on 2026-11-07.

- **F1, evidence labels announce their meaning only through `aria-label`
  (slice 5).** `EvidenceLabels` (`dashboard/src/CiEvidenceLabels.tsx:55-67`)
  puts `aria-label={name}` and `title={full}` on a plain, non-focusable
  `<li>`. The visible words are the short form only (`abc1234`, `main`), and
  the icon is `aria-hidden`, so "Revision", "Branch" and the like exist only
  in `aria-label`, and the full words only as `title`. Screen readers in browse
  mode read list item content and commonly ignore `aria-label` on a list item;
  a `title` description on a static element is rarely announced. The specs
  pass because `dashboard/tests/ciEvidenceLabelsPage.ts` reads the computed
  name and description. Story promise at stake: each label has an accessible
  name, and the full words stay available to assistive technology.
- **F2, a story comparison's reading state clears the Summary sort (slice
  3).** When the story identity changes, `useIntentCiComparison.ts:38-44`
  resets the shown answer. `comparisonFrom` (`IntentScopeEvidence.tsx:66-85`)
  then returns `none` with `checking`, and `IntentScopeProof.tsx:97-110`
  renders the children with one-run unavailable cells. Those cells lack
  **Baseline**, **Branch**, **Landed** and **Change**, so the effect in
  `CiProofTable.tsx:142-150` calls `onSort(undefined)` and erases the chosen
  sort before the comparison arrives. The effect also erases a sort when a
  single-run table legitimately lacks the column. Story clause at stake: the
  sort is kept while drilling down, and a column the next table lacks falls
  back to default order. That is a fallback, not a loss.
- **F4, two builders for a part without a file breakdown (slices 1 and
  5).** The timing gap (`ciProofTiming.ts:58-66,138`) says "part 2 of 3 has no
  file breakdown". The outside-row label (`IntentScopeSingleProofTable.tsx:71-78`)
  builds its own `Part 2 no breakdown` and says "Part 2 of 3 published no file
  breakdown". This breaks one term per fact.
- **F5, comparison Summaries leave the outside row and an unbroken entry
  unexplained.** `IntentScopeComparisonTable.tsx:174-207` pins **Not in the
  rows above** but shows no labels saying what it holds. When the entry has no
  file breakdown, it shows no **No file breakdown** label. A single-run
  Summary shows both (`IntentScopeSingleProofTable.tsx:38-90,139-151`), and
  the story's labelled facts apply to "a summary".
- **F3, duplicated row builders.** `childRow` is built three times
  (`IntentScopeProof.tsx:75`, `IntentScopeSingleProofTable.tsx:108`,
  `IntentScopeComparisonTable.tsx:167`), and the outside row twice. This is
  carried only as the Structure slice 3 needs.
- **Size.** `dashboard/backend-tests/observation/authenticated-read-revision-stream.spec.ts`
  is 256 lines, over the 250-line refactor limit. The CI repair `68e5f52`
  grew it.

Dropped: none. Every finding holds at `b1126e511`.

## Goal and scope

A developer reviewing Intent CI evidence, including with a screen reader:

- hears what each evidence label means and its full words from the label's
  own content;
- keeps a chosen Summary sort through a story comparison's reading state; and
- reads the same no-breakdown and **Not in the rows above** explanations in
  comparison Summaries as in single-run ones.

Preserved promises and constraints are
SEED-259#scan-intent-ci-summaries's
scope, required restrictions and scope limits:

- no new figures;
- no change to what CI evidence is read, judged or compared, or when;
- the sort choice is not put on the URL or in storage; and
- Optimization Candidates and file Purpose are unchanged. File Proof changes
  only through the shared evidence identity and timing labels.

The visible short labels and hover stay as shipped. One term per fact holds
across CI status, Summaries, file Proof and Intent's documentation.

Excluded:

- New label kinds beyond the comparison Summary's outside-row and
  no-breakdown labels.
- Per-endpoint no-breakdown labels in a comparison. Each endpoint's gap
  already reads in its cells with the full explanation.
- The file-level `test.setTimeout` in the revision stream spec.
  [SEED-260#restore-default-test-timeouts](../../seeds/SEED-260-restore-default-test-timeouts.md#restore-default-test-timeouts)
  owns it.

## Outside-in proof and ownership

| Promise | Owner | Proof |
| --- | --- | --- |
| Each evidence label's meaning and its full words come from the label's own content. The visible short words, icon and hover stay. Hidden words do not widen a strip (F1) | Slice 1 | `ciEvidenceLabelsPage.ts` reads each label by its text content: hidden prefix plus visible words, then full words. It no longer uses `aria-label` or the `title` description. One strip per surface (CI status Proof, Summary evidence, story comparison identity, Summary notes) is checked with `toMatchAriaSnapshot`, and every label is asserted to have no `aria-label`. The zoom specs keep the Verdana override and whole-word checks green |
| A Summary sort survives a story comparison's reading state and a table that lacks the column. That table shows default order without `aria-sort`, and the sort applies again when a table with the column returns (F2) | Slice 2 | `intent-summary-story-comparison-sort.spec.ts`: sort **Landed** descending, move to Story B's single-run Summary (default order, no `aria-sort`), then back to Story A's comparison: the rows read **Landed** descending again. This fails today because Story B's table and the reading state both clear the sort. The existing step, where **Test execution time** gives way in the comparison, stays |
| One builder and one wording for a part without a file breakdown. Comparison Summaries label what **Not in the rows above** holds and an entry without a file breakdown, as single-run Summaries do (F4, F5, F3) | Slice 3 | `intent-summary-ci-proof-gaps.spec.ts` reads the outside label's full words in the timing gap's wording. A comparison Summary spec reads the outside strip's labels. It uses a new proofs variant beside `breakdownProofs` (`dashboard/tests/support/intentSummaryStoryComparisonProofs.ts`, served through `setup.serveProofs`) whose primary endpoint holds a file the tree does not list or an unplaced result, because no comparison fixture has an outside row today. A primary entry without a file breakdown shows **No file breakdown**. Units `intent-ci-proof-timing` and `intent-scope-proof` keep one phrase |
| The revision stream boundary spec is within 250 lines and behaves the same (Size) | Slice 4 | `wc -l` at or under 250. `authenticated-read-revision-stream.spec.ts` passes, and so does `--repeat-each=5` of its listing-count test |
| Intent's documentation matches the label content and outside-row wording | Slices 1 and 3 | Reread [Intent](../../../docs/dashboard-development-intent.md) and [CI timing comparison](../../../docs/dashboard-development-intent-ci-comparison.md) where they describe label names, full words, hover and the outside row |

Consumers: the 17 specs and helpers importing `ciEvidenceLabelsPage.ts`
(`grep -rln ciEvidenceLabelsPage dashboard/tests`), most of which read labels
only through its helpers. Slice 1 runs the consumer-trace script on its change
and gives every consumer a disposition.

Local gates: at each of slices 1–3, run the Intent CI and summary family
(`dashboard/tests/intent/*.spec.ts` whose name contains `ci` or `summary`, 41
specs), plus `intent-file-purpose-proof`, `intent-entry-folder-summaries`,
`intent-entry-folder-summaries-folders`, `intent-reading-place` and
`intent-story-changes-moves`. This is plan 499's gate, and it covers every
surface the labels and sort reach. Also run, through `bash scripts/test.sh`, the
units `tests/support/intent-ci-proof-timing.test.mjs`,
`tests/support/intent-scope-proof.test.mjs`,
`tests/support/dashboard-ci-comparison-entries.test.mjs` and
`tests/support/intent-ci-proof-sort.test.mjs`, then `npm run
typecheck:dashboard` and `npm run lint`. Slice 4 runs its one backend spec,
typecheck and lint.

Run Playwright as
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`
with `/opt/homebrew/bin` first on `PATH`, under the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection. The whole dashboard suite runs
once before landing, because the shared label strip and table reach every
Intent journey.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Label meaning and full words live only in `aria-label` and `title` | Slice 1 | 2026-11-07 at `b1126e511`: read `CiEvidenceLabels.tsx:53-69` and `ciEvidenceLabelsPage.ts:22-56` | Confirmed. The `li` carries `aria-label={name}` and `title={full}`. The visible span shows `shown ?? name`, and the helpers read the computed name and description |
| Visually hidden text takes no width in a label | Slice 1 | Same revision: `.visually-hidden` in `dashboard/src/styles.css:157-166` is absolute, 1 px and clipped, and `.intent-evidence-label` is `inline-flex` (`ci-evidence-labels.css`). Absolute children leave flex layout and gaps. Playwright already reads names from this class, as with the table captions `scopeTable` finds | Confirmed. The zoom specs' Verdana fit checks stay the observed guard |
| A story identity change renders one-run cells before the comparison arrives, and the effect then clears the sort | Slice 2 | Same revision: `useIntentCiComparison.ts:38-44` resets `shown` on a new key. `IntentScopeEvidence.tsx:66-71,80-85` returns `none`/`checking`, and `IntentScopeProof.tsx:97-110` renders `ciUnavailableCellsOf("checking")` cells through `CiProofTable`, whose effect at `CiProofTable.tsx:142-150` calls `onSort(undefined)` for a lacked column | Confirmed. The sort spec's existing step already moves Story A → Story B → Story A, which the new assertion uses |
| The comparison Summary's outside row comes from the primary endpoint's entry | Slice 3 | Same revision: `IntentScopeComparisonTable.tsx:149-192`, where `primaryProofOf(landed, branch, baseline)`, `owningEntryOf` and `outsideOf(entry, path, children)` decide the pinned row | Confirmed. The outside labels and the no-breakdown label read from the same entry. No comparison fixture yields an outside row (`grep` of `rows above` and `outside` in `summaryComparisonExpectedRows.ts` and the comparison specs finds none). `setup.serveProofs` (`storyCiComparisonFixture.ts:218`) already serves custom proofs, as `noBreakdownBaselineProofs` does, so slice 3 adds a variant there |
| The family gate runs green in this workspace | Every slice's gate | Plan 499 slice 5's accepted proof at `b1126e5`, 2026-11-07: gate 106 passed, rerun 106 passed after the refactor, units and typecheck pass | Retained observation at the head this plan starts from |

No premise is left open.

## Current decisions

- **Label content.** A label's content is its icon (hidden from assistive
  technology), a visually hidden prefix where the visible words leave out
  what the label is (for example "Revision" before `abc1234`), the visible
  short words, and its full words as visually hidden text after them. The
  `aria-label` goes. `title` stays for hover, on the label's inner content.
  A label whose visible words are its whole name, such as **Completed
  ancestor**, gets no prefix. `EvidenceLabel` holds `prefix` and `words`
  in place of `name` and `shown`, so no words are stored twice.
- **Fallback without loss.** `CiProofTable` falls back to default order at
  render time when it lacks the sorted column. It writes no state and shows no
  `aria-sort`. The kept sort applies again when a table with that column
  returns. Activating any header replaces it as today. This holds for CI
  status's own sort too.
- **One no-breakdown wording.** `ciProofTiming.ts` exports the one
  no-breakdown gap: label `Part N no breakdown`, explanation "part N of M has
  no file breakdown". The outside strip, the timing cell and
  `ciProofWording.ts`'s parts phrase all use it.
- **Shared outside strip.** The outside-row strip and the **No file
  breakdown** label move from `IntentScopeSingleProofTable.tsx` into one
  module, beside a shared child-row and outside-row builder. Both Summary
  tables and the unavailable rows in `IntentScopeProof.tsx` use it. In a
  comparison they read from the primary endpoint's entry. The no-breakdown
  label's full words name that endpoint ("The Landed CI proof summary does
  not break tests down by file").
- **Screen reader check.** No developer screen-reader round is planned.
  Browse mode reads list item content, and the proof observes that content
  and the aria snapshot directly. See the refinement review for the optional
  check a human may request.

## Ordered slices

### 1. Evidence labels carry their meaning in their content
Type: Behavior
Status: done
Proof: as mapped above for F1. Accepted 2026-11-08: the gate's 47 spec files
passed (111 passed, 0 flaky), the four units passed quietly through
`bash scripts/test.sh`, and `npm run typecheck:dashboard` and `npm run lint`
passed. Aria snapshots are in `intent-ci-proof-ancestor`,
`intent-summary-ci-proof`, `intent-summary-story-comparison` and
`intent-summary-ci-proof-gaps`.
Learning: `title` on the `<li>` became the list item's accessible name. The
hover `title` now sits on an inner `.intent-evidence-label-content` span that
carries the pill's padding, so hover still covers the label. `EvidenceLabel`
is `{prefix?, words, full?, announced?}`; `announced` puts `role="alert"` on
a failure's full words.

Behavior: CI status Proof, a Summary, a file's Proof or a story comparison
shows evidence labels → a screen reader reading the strip in browse mode
hears each label from its content, such as "Revision abc1234", "Branch main"
or "Completed ancestor, the completed ancestor of the running result", with
no `aria-label` on the label. The visible words, icons, run link and hover are
unchanged, and the strips still fit at 200% zoom in Verdana. The test helpers
read labels by content, and the Intent documentation's description of label
names and full words matches.

### 2. A Summary sort falls back without being lost
Type: Behavior
Status: done
Proof: as mapped above for F2. Accepted 2026-11-08: the new kept-sort step
in `intent-summary-story-comparison-sort.spec.ts` failed before the change
(`aria-sort` empty) and passes after it. The gate's 47 spec files passed (111
passed, 0 flaky), the four units passed quietly, and `npm run
typecheck:dashboard` and `npm run lint` passed.

Behavior: a story comparison Summary sorted by **Landed** descending → the
developer selects a story whose Summary lacks **Landed**, or the comparison
is read again → that table shows default order with no `aria-sort` →
returning to a comparison Summary shows **Landed** descending again. The
`useEffect` in `CiProofTable.tsx` that clears the sort is removed. The
plan 499 learning "slice 3 clears that sort" no longer describes the code.

### 3. Comparison Summaries explain the outside row and an unbroken entry
Type: Behavior
Status: done
Proof: as mapped above for F4, F5 and F3. Accepted 2026-11-08: the new
`intent-summary-story-comparison-outside.spec.ts` (fixture
`outsideLandedProofs`) and the changed `intent-summary-ci-proof-gaps.spec.ts`
step failed before the change and pass after it. The gate's 48 spec files
passed (112 passed, 0 flaky). Seven units passed quietly, including the
comparison cues, wording and sort units the trace added. `npm run
typecheck:dashboard` and `npm run lint` passed.
Learning: `IntentScopeSummaryRows.tsx` holds `childRowsOf`, `outsideRowOf`,
`OutsideExplanation` and `NoBreakdownLabel`. `primaryEndpointOf` names the
comparison's primary endpoint. The new fixture yields no **Unplaced results**
case; the single-run spec covers that label through the shared builder.

Behavior: a comparison Summary with **Not in the rows above** → the labels
after the table say what it holds (files not in the tree, unplaced results,
parts without a file breakdown), as a single-run Summary does. A comparison
whose primary entry has no file breakdown shows **No file breakdown**, and
every part without a breakdown reads with the one wording "part N of M has no
file breakdown". This also gives childRow and the outside row one builder,
because both tables now share the outside strip.

### 4. The revision stream boundary spec fits the size limit
Type: Structure
Status: done
Proof: as mapped above for Size. Accepted 2026-11-08: the spec is 236 lines.
`answeringInstead` and `settledWithin` live in `revisionStreamBoundary.ts`,
and the one `gatewayTimeout` lives in `revisionCheckBoundary.ts`, shared with
the two failure specs. The three specs passed (14 passed). The listing-count
test passed with `--repeat-each=5` after the refactor, and `npm run
typecheck:dashboard` and `npm run lint` passed.

Change: move one helper or fixture block of
`authenticated-read-revision-stream.spec.ts`, for example the 504 and
rate-limited answer setup, into `revisionStreamBoundary.ts` or a neighbouring
support module. No test changes behavior. This directly owns the size miss
from plan 499's CI repair, and no later Behavior depends on it.

## Refinement review

Slice-plan refinement was not needed. Each Behavior slice owns one finding's
outcome and its proof loop. Slice 3 joins F4, F5 and F3 because they share
one strip and one wording owner. Slice 4 is an independent small Structure
correction that keeps its own proof. No remaining slice-specific concern was
identified.

Optional human check (not blocking): a developer-operated VoiceOver pass
over one CI status evidence strip after slice 1. It would confirm by ear
what the content and aria-snapshot proof already observes.
