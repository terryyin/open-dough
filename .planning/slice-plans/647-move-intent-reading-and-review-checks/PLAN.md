# Move Intent reading and review checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-intent-reading-and-review-checks
**Source:** [Move Intent reading and review checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-intent-reading-and-review-checks)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Preserved scope and mapping

Maps original plan 633 slices 3–4 at `f03e959480b2a04a7194b072cf71aa9da55ee1a9`;
all 37 non-CI Intent specs / 5,547 lines retain every distinct assertion.
CI conversion stays in [plan 633](../633-retire-dashboard-integrated-ui-test/PLAN.md);
navigation/retirement stays in [plan 648](../648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md).
Reuse their service-boundary direction and the preceding conversion's
one-new-answer-family-per-slice sizing lesson. Conversion can start independently;
reuse CI families already delivered, without making shared code a blocking start.

## Provisional slices

### 1. Preserve selected-story presentation and changes
Type: Behavior
Status: provisional
Proof: `intent-story-*`: gaps/changes-only, CI cues, coverage, appearance,
review return, summary title and narrow views; preserve source, focus and counts.

### 2. Preserve done review and source selection
Type: Behavior
Status: provisional
Proof: `intent-done-*` and `intent-ci-done-*`: review modes, landed/reopened
source selection, glance/reference lifecycle, project refresh reading/proof.

### 3. Preserve revision notices and update boundaries
Type: Behavior
Status: provisional
Proof: `intent-revision-*`: planning-only, settings updates, held/failed/latest
answers and cross-project stale-answer exclusion; retain real SSE connections.

### 4. Preserve source, Gherkin and Purpose reading
Type: Behavior
Status: provisional
Proof: `intent-code-browse-java`, `intent-entry-folder-summaries*`,
`intent-gherkin-*`, `intent-purpose-case`, `intent-source-target-recovery`:
actual source/line/reading position, layout, refused settings and recovery.

### 5. Preserve Intent activation, reuse and reading place
Type: Behavior
Status: provisional
Proof: `intent-home-activation`, `intent-project-visit*`, `intent-read-*`,
`intent-reading-place`, `intent-selection-reads`, `intent-sidebar-toggle`;
retain focus, selection, counts, held reads and retry. Reconcile current cases;
no Intent spec remains after this and the CI outcome land.

## Refinement inputs

Each batch accounts for old-to-new assertion homes and paired scratch
discrimination before deleting interim specs/timing rows. Confirm family costs
and 15-active-minute fit during story refinement, then realign these slices.
Apply [AGENTS.md](../../../AGENTS.md#test-automation), the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written, and the maintained macOS [sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; battery requires plugging in or
an open lid under `caffeinate -i` and a sleep-log check afterwards.
Focused maintained homes plus affected support consumers own proof; no whole
group is a local gate solely because CI runs it. No proof or readiness claimed.
