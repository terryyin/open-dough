# Review a selected story in Intent tabs

**Identity:** SEED-275#story-intent-tabs

**Source:** [Review a selected story in Intent tabs](../../seeds/SEED-275-story-intent-tabs.md#story-intent-tabs)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

Let a developer see the selected story's CI evidence first, inspect changed
tests and saved coverage in their own panes, and visit Project Intent without
losing the story's reading place. Use the [approved mockup](../../seeds/SEED-275-story-intent-tabs/intent-story-tabs.html)
as the visual target and the seed for evidence states and cases absent from
the sample. The accepted SEED-271 delivery supplies the file toggle, kept
reading state, and outside-locations action. Coverage production and
formatting, evidence acquisition rules, and new persistence are outside
this increment.

## Current decisions

- [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  governs the single page-owned Selected story and the boundary between
  published evidence and disposable UI state. Story tabs and Project Intent
  are views of that page, with separate kept reading places so browsing a
  project test cannot replace the story file or its Proof tab. A change of
  Selected story opens CI comparison. A trip to Project Intent and back
  restores the current story tab. Retain the page's existing selection and
  cross-perspective semantics.
- Reuse [Intent's CI evidence owner](../../../dashboard/src/IntentCiEvidence.tsx).
  Change what the view targets and when the evidence is shown. The story CI
  destination and Changed tests Proof share story evidence. Project Intent
  uses the trunk target and its project reading revision, with the current
  update notice behavior. Keep the candidate-to-file transition in Project
  Intent and restore focus to the entry on return. Reuse project test
  browsing in the CI status workspace, with CI visible again when the
  project reading selection is cleared.
- Keep source change comparison and CI evidence separate. The existing
  story overlay, **Selected story only**, changed-file recovery, and
  **Review changes** use the existing change comparison. CI is available
  independently of a location read. The compact outside count requires a
  known comparison and location inventory. Preserve Purpose and Proof as
  defined in [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts).
- Use the [done-record detail reader](../../../dashboard/src/doneDetails.ts)
  and saved coverage value. Only a successfully read record with an absent
  assessment supports the older-completion message. A pending or unsuccessful
  read has its own state and available recovery. Keep stored text literal.
- Use the same comparable timings to derive the visible signed change, its
  numeric sort value, and the relative value when the baseline is positive.
  Scope this presentation to story CI comparison. Preserve measured timing
  and existing gaps in the build table, file Proof, and folder summaries.
  Baseline and Counts keep their current sort semantics. In Branch and
  Landed, non-comparable rows follow measured deltas in either direction.
  Use one symmetric relative scale across the summary and comparison cells
  that can expand to fit larger changes. The percentage toggle changes labels,
  with no change to data, order, or scale.

## Outside-in proof

| Promise | Owner | Observable check |
| --- | --- | --- |
| Direct CI comparison and one story header | 1 | Select a completed story normally and hold the authenticated location read. The title appears once, CI evidence arrives in the default panel before the location read is released, and choosing another story opens its own CI tab. Preserve endpoint identities and measured times, counts, attribution, provisional and unavailable states, and Check again recovery. |
| Changed tests keeps the reading place | 1 | Open an actual test and Proof, hide the tree, switch story tabs and return, then show the tree. Check header, full reader width, selected test, Proof, expanded folders, filter and scroll. Activate the file Proof link to CI. Verify **Review changes** opens the existing comparison for the outside count and returns focus when closed. Exercise location/read gaps, narrow width, and keyboard activation. |
| Project CI, project test browsing, and candidate return | 2 | From Changed tests Proof, use **Project Intent**. Show trunk CI while the story stays selected. Open an optimization candidate whose file also has a story diff. Observe the project-published text and the candidate return/focus without needless rereads. Back to the story restores tab, Proof, selection and scroll. Clear the story and see project CI, including with no configured locations. Browse a project file and return to CI by keyboard. |
| Saved Intent coverage is readable and accurately qualified | 3 | Select a published completion and open the tab. Assert full literal report text, saved unavailable reason, and a distinct legacy message for a successfully read record without assessment. Hold or fail its record read and exercise available retry. A still-active story explains wrap-up. |
| Signed time changes and ordering | 4 | The normal comparison journey shows Baseline measured time, one signed delta per comparable summary metric and endpoint cell, a measured time for an Added row, and existing unavailable text for missing evidence. Assert Branch and Landed ordering with data for which absolute time, elapsed delta, and relative change imply different orders. Exercise zero and missing timings, provisional evidence, both sort directions, and unchanged build and file/folder proof readings. |
| Relative timing is legible across entries and display modes | 5 | Compare the mockup and real UI in desktop and narrow light/dark views. Check visible zero, direction and proportional lengths for relative changes, including an outlier beyond the sample, zero change, and a zero or absent baseline. **Show %** starts off and toggles the numeric labels together without changing scale or sort. Confirm changed-test sidebar shown/hidden and coverage views in the same review. |

## Slices

### 1. Open a selected story at CI comparison

Type: Behavior
Status: done
Proof: Direct CI and Changed tests rows above. Extend completed, Taken, retry,
story-title, sidebar, reading-place, outside-change and story CI cue journeys.
Exercise the real card, tabs, tree, and Review changes controls.

A developer selecting a story sees a single persistent header and the
existing comparison immediately when its evidence arrives. Changed tests is
a separate tab with its file browser, existing change states and actions,
and a direct way back to CI from file Proof. Switching tabs preserves the
reader and sidebar. Keep currently readable coverage report/reason reachable
in the coverage tab. Slice 3 fills out its reading states. The current
project and candidate navigation remains usable until slice 2 replaces it.

Accepted proof: the whole `dashboard/tests/intent` family after the
refactor (257 passed), the side-panel and review focus consumers (221
passed), typecheck and ESLint. Held and failed location reads are in
`intent-ci-comparison-locations.spec.ts`; the Review changes keyboard return
is in `intent-story-review-return.spec.ts`; narrow keyboard views are in
`intent-story-views-narrow.spec.ts`; source-review rows carry the rest.

Learnings for remaining slices: closing Review changes clears the Selected
story under ADR 0008, so `storyCardHome` now skips hidden cards and the
hidden Board and returns the keyboard to Intent's chosen mode tab
(`data-intent-home`). The story view lives in `IntentStoryView.tsx`, and the
location reading in `useShownIntentLocations.tsx`. Optimization Candidates still
renders inside `IntentBrowser`, which needs settled locations, and the mode
bar still holds Intent and Optimization Candidates for slice 2 to replace.
A Taken story's CI heading still repeats its title; slice 5 reviews it
against the mockup.

### 2. Visit project evidence and return to the story

Type: Behavior
Status: done
Proof: Project Intent row above. Extend the project CI homepage, candidate
open/return, and reading-place journeys through the real scope controls.

A developer opening Project Intent sees project CI and can reach an
optimization candidate and its project test. Returning to the candidate and
to the story restores the respective places and focus. The same project
workspace is the landing with no selected story. Preserve the existing
project file browser, CI return, published revision/update recovery, and
direct candidate links.

Accepted proof: the integrated Intent, navigation and sessions set after
the refactor (275 passed), the MakeMe node tests, typecheck and ESLint.
`intent-project-visit.spec.ts` observes the visit, candidate return,
project-published text and new-selection rules; source-review rows carry
the rest.

Learnings for remaining slices: Intent shows either the story view or
Project Intent (`useIntentScope` in `intentStoryTabs.tsx`). Each has its
own reading place keys. The selection object is the key: every selection act
opens CI comparison, and a clear lands on Project Intent's CI status. Story CI
renders through `IntentCiStatus` under the story's evidence provider; Project
Intent shows trunk judgment only, so slices 4 and 5 change the story path.
After the first Project Intent visit, trunk CI is followed while Intent is
open (`dashboard/GITHUB-REQUESTS.md`). Coverage is `IntentStoryCoverage`
inside `IntentStoryView`.

CI repair (run 42484570480 on `9f1baac`): the candidates MakeMe builder
must not import dashboard code at runtime, because
`tests/native-evidence-identity.sh` hashes makeMe's import closure from
an isolated copy of `tests/` and `src/`. Separately,
`agent-launch-change-wait.spec.ts` removed its origin before a released
push finished. It now waits for the start, and `holdPushes`' hook ends
when its origin is removed. Proof: the identity test failed and then
passed; forced-race and unreleased-hold reproductions failed and then
passed; all 24 `holdPushes` specs passed (58 tests).

### 3. Read the saved assessment and its availability

Type: Behavior
Status: done
Proof: Coverage row above, extending the existing published completion
journey through the actual Intent coverage tab and done-record reader.

A developer opening the coverage tab can read the full stored assessment or
understand its status. An active story, a legacy completion, a saved
unavailable reason, and an unsettled record read remain distinct. Use the
existing detail recovery for a failed read.

Accepted proof: `tests/intent` plus `development-intent-frame-sessions`
(261 passed), the refactor's coverage spec and the Recently done wording
consumers (28 passed), typecheck and lint. `intent-story-coverage.spec.ts`
observes the report, Unavailable, older completion, held, failed and Retry
states; `intent-story-summary-title.spec.ts` observes the wrap-up text.
The pane is `IntentStoryCoverage.tsx`. Its states are new targets for slice
5's visual review.

### 4. Read and sort signed CI timing changes

Type: Behavior
Status: done
Proof: Signed time changes row above. Extend entry comparison and sort
journeys. Run shared timing, sort, and file/folder comparison consumers.

A developer comparing story CI builds sees the elapsed change once in each
comparable summary metric and entry cell, can look up measured build times,
and can order entries by the change shown in Branch or Landed. Keep measured
Added values and meaningful gaps. This slice can stop with readable signed
changes. Slice 5 adds relative bars and optional percentages.

Accepted proof: `tests/intent` (260 passed); 13 CI support node tests;
`tests/native-evidence-identity.sh`; the refactor's five comparison specs
(21 passed); typecheck and ESLint. `intent-ci-comparison-sort.spec.ts`
uses data where absolute time, elapsed change and relative change each imply
a different order. `dashboard-ci-comparison-entries.test.mjs` observes the
measured zero baseline.

Decision: the build table shows only measured times. The story asks for
one signed delta in the summary and entry cells, and the mockup shows
plain build values, so the old change suffix was removed.

Learnings for slice 5: entry cells carry `changeMs` and the Baseline cell's
`ms`. Derive the relative value from them only for a positive baseline. The
summary's signed changes come from `storyCiComparisonWording.ts` and render
in `IntentCiComparisonSummary.tsx`. Review the summary's "Counts" label, the
mockup's "Tests and checks", the "vs baseline" notes, "Added"
capitalization, and the metrics grid at narrow width and in dark mode.

### 5. Compare the size of relative timing changes

Type: Behavior
Status: done
Proof: Relative timing row above. Use the built dashboard at desktop and
narrow widths in both themes. Assert behavior and bar geometry independently
of screenshots, and compare the integrated views with the mockup.

A developer scanning CI can compare relative change against a common zero
and scale, read signed elapsed time without relying on color, and choose
whether to see the numeric percentages. Keep the controls reachable at
narrow widths and by keyboard.

Accepted proof: `tests/intent` plus navigation and sessions consumers
(273 passed); story-review files-toggle specs (14 passed); traced layout
consumers (23 passed); CI support node tests; typecheck and lint; and the
refactor's comparison specs (67 passed). `intent-ci-comparison-relative.spec.ts`
asserts zero tick, direction, shared scale, outlier widening, absent and zero
baselines, Show % and kept state. The coordinator compared desktop and narrow
light screenshots with the mockup.

Decisions: Terry deferred the dark-theme comparison to
SEED-277#dashboard-dark-theme because the dashboard has no dark theme. Bars
use the existing faster and slower CI cue colors, and "Counts" and lowercase
"added" stay consistent with the file and folder proof wording.

## Proof and delivery gates

Arrange domain data through [MakeMe](../../../tests/README.md#test-data-architecture),
with decisive values visible in the test. Use the existing published
completion, origin and CI host fixtures for browser proof. Use held requests
or controlled time for gaps and recovery. Keep the default test timeout.
Trace consumers of replaced mode actions, test helpers, summary text, and
shared timing cells before editing their assertions. In particular, the
old Intent-home action and location Summary consumers do not depend on the
new story tab labels. Keep their selection, focus, proof and sorting outcomes
under the new entry points. Keep the shared test reader and per-file syntax
behavior covered. Run the affected Intent suite at the integrated boundary
because the common page entry, mode controls, and shared timing surfaces
have consumers throughout it. Also run the affected cross-perspective
navigation and selection journeys, lint, and dashboard typecheck. Reconcile
lasting guidance in [Development and Intent](../../../docs/dashboard-development-intent.md)
and the [Dashboard UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md)
as each behavior lands.

**Local gate.** Run focused Chromium proof and the affected consumers at
each slice. On AC power, start fully awake under `caffeinate -s -i` for long
runs. On battery start fully awake with the lid open under `caffeinate -i`
and inspect the sleep log. Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
and [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
through local proof, delegation, delivery, and applicable CI.

## Decisive premises

Observed on 2026-11-08 in this preparation worktree at `ceb5fa8d2`,
using Node 24.21.0 and the dashboard Chromium profile with the existing
synthetic GitHub and published completion fixtures.

| Consuming operation | Observation and consequence |
| --- | --- |
| Selected story CI compares published endpoints and can share its proof with Changed tests | The focused Chromium run showed measured and sourced endpoints, incomplete entry evidence, exact and ancestor labels, provisional branch and trunk states, and Check again recovery. File and tree proof showed shared CI cues. Keep this evidence path for both tabs. |
| Initial CI waits for the location reader today | The temporary `intent-held-locations-preparation.spec.ts` held the authenticated location read after a normal published done-story selection. The locations message appeared and the comparison was absent. Releasing the read showed “Baseline compared with Landed.” The probe passed and was removed. Slice 1 must reverse that ordering and verify that the earlier mount preserves recovery and read reuse. |
| The project browser and candidate return already run through the normal Intent entry point | The focused Chromium run showed project trunk CI with and without locations, keyboard return from a file or summary, and the candidate's opened Purpose, tree mark, and return without rereading. Story reading, including scroll, was restored across perspectives but scoped to its project. The current shared reader writes the same file selection for candidate opens and story files. Slice 2 proves the new isolation with the same file visible through both scopes. |
| Published completions already carry saved coverage through the dashboard reader | In Chromium, a real fixture completion produced literal saved text and an unavailable reason in Intent. The shared done-detail reader has distinct reading, successful and unsuccessful states. The current lens collapses non-success to an absent record. Slice 3 carries those states through and proves legacy absence only from a successful read. |
| Shared timing data already distinguishes unavailable, added, and measured values | The support command passed all 11 tests. Current endpoint sorting used measured elapsed durations and left gaps last. The same model distinguished missing durations from measured zero and only computed a percentage for a positive baseline. Keep the existing generic sort for its other consumers and prove numeric delta order on this comparison surface. |

The focused Chromium run passed 37 tests.

```sh
caffeinate -s -i npm run test:dashboard -- \
  tests/intent/intent-ci-comparison.spec.ts \
  tests/intent/intent-ci-comparison-sort.spec.ts \
  tests/intent/intent-ci-comparison-entries.spec.ts \
  tests/intent/intent-ci-comparison-retry.spec.ts \
  tests/intent/intent-ci-comparison-taken.spec.ts \
  tests/intent/intent-story-coverage.spec.ts \
  tests/intent/intent-story-completed.spec.ts \
  tests/intent/intent-sidebar-toggle.spec.ts \
  tests/intent/intent-reading-place.spec.ts \
  tests/intent/intent-story-ci-cues.spec.ts \
  tests/intent/intent-test-optimization-candidates-open.spec.ts \
  tests/intent/intent-ci-status-homepage.spec.ts \
  tests/intent/intent-read-recovery.spec.ts \
  tests/navigation/development-intent-frame-sessions.spec.ts \
  --workers=2 --reporter=line
caffeinate -s -i npm run test:dashboard -- \
  tests/intent/intent-held-locations-preparation.spec.ts --workers=1 --reporter=line
node --test tests/support/intent-ci-comparison-sort.test.mjs \
  tests/support/dashboard-ci-comparison-entries.test.mjs \
  tests/support/intent-scope-comparison-wording.test.mjs
```

## Preparation review

Slice-plan refinement was unnecessary. Each slice delivers an observable
reading outcome with its own proof. The story destinations reuse one evidence
model, Project Intent isolates the context that actually differs, and the
relative scale extends the same timing values as the signed display. The
two interim states have named replacements. No slice-specific concern
remains after reviewing the observed baseline and final proof ownership.


## Story obligations

### G1. Dark theme comparison has no dashboard dark theme
Reported: slice 5 — "the dashboard has no dark theme; only the CI cue colours change for prefers-color-scheme: dark"
Story clause: "Compare the implementation against the mockup in the light theme at desktop and narrow widths"
Disposition: owner changed "Terry deferred the dark comparison on 2026-11-08"
Commitment: V1

## Execution complete

Product advice: no change to the near-future direction. CI-first story review
with relative timing and literal saved coverage directly serves "make a story's
intent reviewable in context". The review left one candidate for Terry's
judgment. Under ADR 0008, closing **Review changes** opened from the story
header clears the Selected story, which cuts against "without losing their
place". It follows existing approved semantics, so it is a possible future
story, not a correction. The retrospective's bounded correction is
[SEED-275#align-story-tabs-records](../537-align-story-tabs-records/PLAN.md).
The dark-theme comparison is queued as SEED-277#dashboard-dark-theme.
