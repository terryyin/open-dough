# Prove Optimization Candidates in mounted frontend tests

**Identity:** SEED-413#mount-optimization-candidates-frontend-proof
**Source:** [Prove Optimization Candidates in mounted frontend tests](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-optimization-candidates-frontend-proof)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Give dashboard developers fast Chromium feedback for how Project Intent reads,
presents, and opens the published Optimization Candidates record. Move the
12 cases in these six `dashboard/frontend-tests/intent/` specs off the built app:

- `intent-test-optimization-candidates.spec.ts`
- `intent-test-optimization-candidates-live.spec.ts`
- `intent-test-optimization-candidates-states.spec.ts`
- `intent-test-optimization-candidates-open.spec.ts`
- `intent-test-optimization-candidates-case.spec.ts`
- `intent-candidates-read-recovery.spec.ts`

The revision cases already use Vitest and keep their stale-answer and **Show
latest** proof. Keep the existing [GitHub timeout and boundary recovery
E2E](../../../e2e/intent/intent-candidates-read-recovery.spec.ts). General
locations recovery, Gherkin settings, CI views, and runner retirement stay in
the [later frontend families](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-frontend-unit-test-families).

## Key examples and proof

| Reader’s action or condition | Observable proof and owner |
| --- | --- |
| Enters Project Intent, opens the candidate record and goes back to CI status | The default selection, location and Purpose visibility, record width, revision, keyboard tab focus and retained file selection pass at `ProjectIntentReading` (slice 1). |
| Reads a published finding, profile-only mechanism or live candidate | Real Markdown rendering shows each label and field in order, with its revision link and no older pass preamble. The live form shows its five facts and its own empty state (slices 1–2). |
| Switches between projects with absent, empty, mismatched and unreadable records | Each condition has the appropriate wording, Retry is available for an unreadable record, and sources are still browsable. One project's record cannot show in another project's reading (slice 3). |
| Opens a recorded source, then returns | A full path or evidence link opens the pinned file in Purpose and reveals the tree. The original entry regains focus without another candidates read (slice 4). |
| Opens a recorded case or encounters a path that cannot uniquely be opened | `:line` and unique `::name` select the actual source line, duplicate case names open at the start, and absent, outside and ambiguous paths keep their distinct behavior (slice 5). |
| A transient read then hits a standing rate limit, or the boundary replies with terminal failure | The typed record reader follows the shared clock, waits until the standing limit ends, and shows its recovered record. A refusal or malformed reply never triggers an automatic reread and recovers on manual Retry. The authenticated client alone proves the wire classification (slice 6). |

## Current decisions

- Reuse [`ProjectIntentReading`](../../../dashboard/src/ProjectIntentReading.tsx)
  and the [revision fixture](../../../dashboard/frontend-tests/intent/intent-revision-fixtures.ts)
  wherever mode, locations, tree or Purpose participate. Allow a fixture's
  published project and initial mode to be supplied when a case needs them,
  preserving existing callers. Render `IntentCandidatesRecord` with the real
  read-recovery provider for record-only cases. Use the existing adjacent
  candidate, browser and file-reading controls. Follow the
  [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  by keeping the shown revision, published proof and test-source selection with
  their existing production owners.
- Use page MakeMe for published work, locations, files and record text.
  `IntentReadSourceOnPage` can supply the existing typed read functions.
  The candidates panel owns whether its record mounts and stays mounted.
  Count candidate requests at that input and assert a real source read at
  the selected revision. For recovery, keep `IntentReadRecovery` and
  `useLimitRecovery` on one clock. Drive the real resume deadline and restore
  fake timers. The client adapter's explicit HTTP inputs are the only wire
  substitutes in the family.
- Confirm the remaining consumers of `frontendIntentCandidates.ts`,
  `putFrontendCandidates`, and candidate publication and locator helpers
  across `dashboard`, `e2e` and `Distribution` before removal. In particular,
  `intent-ci-status-kept.spec.ts` also prepares candidates, and the E2E timeout
  uses `intentReadRecoveryPage.ts`. Remove exports only when the last reader
  moves. Retire or split migrated cases in the same slice that proves them.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| Use the existing mounted Project Intent entry to open a candidate and go back | In the preparation checkout at `382995572`, `caffeinate -s -i npm run --silent test:dashboard:frontend -- intent-candidates-planning-probe sessions-sidebar-planning-probe --workers=2` rendered a configured MakeMe Gherkin feature at revision `97` repeated 20 times. Clicking the candidate opened its source at that revision, selected the file and, after the tab returned, the same record was visible with one candidate read. The case passed in 821 ms. The scratch files were removed. |
| Exercise the current clock in a mounted record | The same Chromium run injected a transient `ReadProblem`, a limited `ReadProblem` with the real standing deadline, then a present record. The production recovery provider and `useLimitRecovery` asked again after 15 seconds, stayed on two reads just before the deadline, and displayed the recovered candidate on the third read after it. Passed in 114 ms. An earlier timing assertion measured from the advance instead of the recorded deadline and crossed the boundary early. Use the actual deadline in slice 6. |
| Preserve today's cases and revision ownership | At `382995572` on November 20, the retained frontend group selection of these six specs and the four open Sessions specs passed 17/17 first attempts at two workers on AC. Candidates accounted for 12 cases and 30.346 summed case seconds. The mixed selection's 29.66 s wall time includes preparation and is diagnostic on a busy machine. The separate existing mounted revision spec passed 3/3 at two workers, including both departed and late old reads. |

## Ordered slices

### 1. The named revision’s finding record reads across the full Intent view

Type: Structure
Status: done

Move the legacy finding-record cases to the typed Project Intent fixture.
Keep tab activation and keyboard behavior, width and hidden locations,
group and field order, pinned evidence links and literal `sha:path` text,
the profile-only mechanism and suppressed pass summary. Use
`IntentModeProvider` and `useIntentModeChoice` inside the real story selection
provider for the default-mode assertion. Preserve the opening-through-dashboard
boundary in the existing E2E journey.

**Proof.** Run the finding-record and mounted revision specs. Observe both
default and switched view, focus and retained Purpose on return, tabpanel
geometry against the reading width, and the ordered fields and pinned link.
A scratch record-read-on-mount change should fail the initial-view assertion.

### 2. A live record shows its own facts and empty state

Type: Structure
Status: planned

Move `intent-test-optimization-candidates-live` to mounted Chromium. Render
the real live sections from MakeMe records. Keep source opening at the
Project Intent owner and keep the live empty state separate from a missing
publication.

**Proof.** Observe the five facts, source reaching Purpose, and the no-live-
candidates explanation with the live entry removed. Run the live and
finding-record specs together.

### 3. Record problems keep their own explanation and leave locations usable

Type: Structure
Status: planned

Move `intent-test-optimization-candidates-states` with typed locations and
candidate answers for each project. Exercise the actual project-reading
provider on switch and retain the outside-in indication that source browsing
still works after a record failure.

**Proof.** Observe absent, empty, mismatched and unreadable states, including
empty-content guards, the unreadable Retry and configured source content.
Run the states and revision specs. Swapping the result for a different
project must fail the visible project or record expectation.

### 4. Opening a candidate reveals the file and returning keeps the entry

Type: Structure
Status: planned

Move the full path, nested folder, multi-link entry, evidence link, and
return behavior from `intent-test-optimization-candidates-open`. Use the
typed `readFile` to observe the pinned target. Move the path-explanation
cases in the next slice and keep this legacy file until its last case moves.

**Proof.** Check real source text, selected file and opened ancestor groups,
the other links still available, and focus on the returning candidate after
the tab switch. Count candidate reads across the return. Run replacements
and the existing mounted revision spec.

### 5. A recorded case targets its source line or explains an unresolved path

Type: Structure
Status: planned

Move `intent-test-optimization-candidates-case` and the remaining `-open`
examples. Keep Pygardon `::name`, a uniquely named Gherkin scenario,
explicit `:line` and duplicate-name fallback. Preserve choices for ambiguous
bare names, missing publication and paths outside configured locations,
and the unique feature and prose distinction.

**Proof.** The target line is marked and in view for the three resolvable
case forms. Duplicate names show file start without a target. Unresolved
paths explain the right reason and do not open the wrong source. Select an
offered full path from the ambiguous case and see that file. Run both
case and open selections before removing the retired Playwright cases.

### 6. Candidate Retry respects the shared wait and terminal replies

Type: Structure
Status: planned

Move `intent-candidates-read-recovery` to the typed record and real shared
recovery clock. Separately exercise `readIntentCandidatesAt` through the
existing authenticated client, with a 403 and malformed JSON shape carrying
`recovery: "transient"`. Confirm the client's typed terminal failure and
retain the UI's manual retry for it. Keep the composed timeout E2E as the
owner of the actual service journey. Audit and remove unused arrangements.

**Proof.** Observe two reads while the limit stands, the third after the
deadline, and the pending record again. On terminal outcomes, advance past
the old retry windows, observe no spontaneous read, then click Retry and see
the answer. Run the candidate family, revision specs and the focused E2E
timeout journey. Check the final frontend listing for the moved spec
engines, and compare timing and retired setup with the base.

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [test-entry selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  before edits. The frontend sources select MakeMe and the local mounted
  control convention. Keep default test timeouts and act as soon as the
  page allows, without `actSettled`, React `act`, or
  `IS_REACT_ACT_ENVIRONMENT`.
- On AC power, run tests with `caffeinate -s -i`, as described in
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run `npm run typecheck:dashboard` and `npm run lint` to validate the typed
  fixture and changed sources. Run scoped frontend selections per slice.
  The family gate is `npm run test:dashboard:frontend -- intent-test-optimization-candidates intent-candidates-read-recovery intent-candidates-revision --workers=2`.
  Also run the existing Intent revision specs when changing their fixture,
  and `npm run test:e2e -- e2e/intent/intent-candidates-read-recovery.spec.ts --workers=2`
  for the retained boundary in slice 6.
- Under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  compare equivalent family selections excluding the unchanged revision
  specs at the execution base and candidate. Compare median elapsed time
  over three warm, interleaved two-worker runs under comparable load on AC.
  Record case selection, removed setup and any measurement limits. The
  family should retain its protection with less repeated setup and faster
  feedback. The full-suite goal is measured by the parent campaign.

## Plan review

Slice-plan refinement was unnecessary. Six slices each preserve one behavior
group at its current owner. Formats share the record reader and opening shares
one file-selection path. Recovery remains with the existing clock and adapter.
The proof route was exercised at the mounted and legacy boundaries. This review
found no remaining slice-specific concern.
