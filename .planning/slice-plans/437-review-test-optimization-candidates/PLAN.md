# Review test optimization candidates and accepted slow tests

**Identity:** SEED-192#review-test-optimization-candidates
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#review-test-optimization-candidates).
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

In Intent, a developer reads the selected project's published Test
Optimization Candidates record. Pending candidates and accepted necessary costs
appear in labelled groups with every recorded field. From an entry's
Locations, the developer opens the tests it names in the Intent Purpose reader,
positioned at an identified case when the record identifies one unambiguously,
and returns to that entry. A reference that cannot be opened stays as recorded
text with a specific reason: not published, outside configured Intent
locations, or names several files. Prose that names no file claims no gap. The
record is read at the same revision as the Intent locations. Absent,
unreadable, mismatched, and empty records each have their own explanation.

Exclusions (from the story): any change to the candidate-record format or the
dough-test-optimization skill, tree badges, runtime Proof, editing entries,
changing any project's Intent configuration, and story scope. Other recorded
sections (Profile-only exclusions, Transferred obligations, Latest pass) follow
the same rendering rule under their own headings, without separate
verification promises. Never present them as accepted costs.

## Existing solutions and decisions

PFE:

- **Pinned reads.** Reuse the authenticated read boundary
  (`dashboard/server/performedRead.ts`, `dashboard/src/authenticatedRead.ts`).
  `file-at` today admits only backlog-reachable paths or files that configured
  Intent locations select (`performedRead.ts`, `pathReachableFromRevision` /
  `pathSelectedByIntentLocations`). The record needs its own admitted read: one
  fixed path, a pinned revision, and distinct absent and unreadable outcomes,
  modelled on `intent=locations` (`server/intentLocationsRead.ts`,
  `src/authenticatedIntentRead.ts`). Never admit a client-supplied path.
- **Record format.** The owner is
  `src/skills/dough-test-optimization/references/candidate-record.md`: the
  exact heading, five sections in order, `###` slug entries with labelled
  fields, and `None.` for an empty section. The parser follows it and treats any
  other shape as mismatched. It shows no partial guess. Name the record path
  once, matching the format's `.planning/TEST-OPTIMIZATION-CANDIDATES.md`.
- **Selection.** `IntentBrowser.tsx` keeps `selectedPath` in local state. The
  record view needs the same selection, so slice 1 lifts it, with an optional
  case, to one Intent workspace owner. `IntentLocation.files`, the configured
  files at the revision, is the inventory the matcher compares against.
- **Recorded links.** Evidence and other recorded Markdown links reuse
  `resolveSourceLink` (`dashboard/src/sourceLink.ts`). It resolves a link
  relative to its containing file (the record) into a pinned snapshot or an
  explanation that it cannot be used. A link that resolves to a configured
  Intent file selects it in Intent instead.
- **Source reader.** `IntentSourceLines` / `SourceLines.tsx` render
  line-numbered whole files without line targets. Case positioning adds a
  target line to that reader, so no second reader is needed.
- **Fixtures.** Extend the Intent journey fixtures
  (`dashboard/tests/intentCodeBrowseFixtures.ts`, `publishFiles`,
  `intentPerspectivePage.ts`) with records shaped like the real ones
  summarised in the story's observed facts.

Accepted decisions:
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
treats the record as a published repository fact read at a named revision, and
the selection as disposable page state.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps
Purpose distinct, so the record view is not Proof.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
favors reuse. No North Star topic is needed: the shared Intent selection is
the delivered browser's own concept, generalised.

## Domain rule

One rule turns each recorded reference into a target, as a pure function. Its
inputs are the recorded text, the record's path, and the configured files at
the revision. Its outputs:

- **file**, optionally with a case: a full repository path, a Markdown link
  resolved relative to the record, or a bare filename that matches exactly one
  configured file;
- **several**: every full path a bare filename matches;
- **outside configured locations**: published at the revision, but not under a
  configured location;
- **not published**; or
- **not a file reference**: prose, a glob, a symbol, or a `sha:path` reference.

Pattern recognition (backticks, Markdown links, `path:line`, `path::name`)
feeds this one rule. Examples exercise the rule and are not a list of
recognizers.

## Outside-in proof

| Story example | Observable signal |
| --- | --- |
| 1 groups, fields, link, return | Playwright Intent journey on an Open Dough-shaped fixture record: labelled Pending / Accepted groups and entry fields; selecting a full-path location shows that file in Purpose and selected in the tree; going back shows the same entry |
| 2 multi-file family | the same journey: four links in one entry; after opening one, the others remain available |
| 3 ambiguous bare name | two full-path choices; nothing selected until one is chosen |
| 4 outside configured / case | a Pygardon-shaped fixture explains "outside configured Intent locations"; a variant fixture that configures `tests/` opens the file at the `::name` case |
| 5 prose / bare unique | no gap text for prose; a bare `.feature` name opens the unique file |
| 6 moved test | "not published at this revision"; nothing opened |
| 7 record states | absent, unreadable (with retry), mismatched, and both-`None.` explanations; location browsing still works |

Local gates: focused specs through the test runner while iterating
(`bash scripts/test.sh <paths>` or the Playwright command below). This changes
the shared authenticated read boundary, so before publishing, run the full
`npm test` and the whole dashboard suite on the final state. Apply the
repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as
written.

## Ordered slices

### 1. One Intent selection shared by the workspace
Type: Structure
Status: done
Proof: existing Intent journeys pass unchanged:
`intent-code-browse.spec.ts`, `intent-gherkin-browse.spec.ts`,
`intent-gherkin-unusable.spec.ts`, and `development-intent-frame*.spec.ts`.

Move the selected file, plus an optional case target, from `IntentBrowser`'s
local state to one owner for the project's Intent workspace. The owner still
resets on source or revision identity. The location tree and Purpose read and
set it through that owner. Enables slice 2's record view, which drives the same
selection in slice 3.

### 2. Read the candidate record in Intent
Type: Behavior
Status: done
Proof: new Playwright Intent journey(s) with fixture records for examples 1
(groups and fields) and 7 (all four record states). A server boundary case
shows that the record read names only a pinned revision and admits no other
path.

Pre-condition: a project with Intent locations, and a published record (or
none) at the observed revision. Trigger: the developer opens the record view in
Intent. Result: the view names the revision and shows Pending candidates and
Accepted necessary costs in record order, with slug and every recorded field.
Other sections appear under their own headings. Recorded text keeps its
wording, and Markdown links resolve through `resolveSourceLink` to pinned
snapshots. Absent, unreadable (retry), mismatched, and empty records each
explain themselves, and the location tree stays usable. Placement and control
treatment within Intent are design details here, keyboard-operable and usable
at narrow width.

### 3. Open recorded test locations from an entry
Type: Behavior
Status: done
Proof: Playwright journeys for examples 1 (open and return), 2, 3, 4 (outside
configured), 5, and 6. Boundary cases cover the pure matching rule over the
real-record shapes (backticked full path, bare unique, bare ambiguous,
Markdown link relative to `.planning/`, glob, symbol, `sha:path`, prose).

Pre-condition: the record view from slice 2. Trigger: the developer selects a
location reference in an entry. Result: a **file** target becomes the shared
Intent selection, so Purpose shows it and the tree marks it. Returning shows the
originating entry without rereading the record. **Several** lists each full
path as its own choice, **outside configured** and **not published** show their
reasons, and **not a file reference** stays plain text. Evidence links that
resolve to a configured Intent file select it in the same way.

### 4. Open a test at its recorded case
Type: Behavior
Status: planned
Proof: Playwright journey for example 4's configured variant (`::name`), plus a
Gherkin fixture whose entry names a scenario exactly once and another with
`path:line`. The target line is shown and identified in Purpose. A case name
that appears twice opens at the file start, with the recorded case text kept
beside the link.

Pre-condition: a file target whose reference identifies a case. Trigger:
selecting it. Result: Purpose shows the file positioned at that case's line. An
unidentifiable case falls back to the file start.

### 5. Evaluate on the real records
Type: Behavior
Status: planned
Proof: developer-operated observation of the running dashboard against Open
Dough, Doughnut, and Pygardon at their current published revisions. Terry
evaluates the Open Dough review against reading the record and tests in an
editor. Record each project's revision, which entries link and which explain
gaps, and Terry's judgment in this plan's Learnings.

Pre-condition: slices 2–4 are delivered and the developer's dashboard is
connected through their own `gh`. Trigger: open each project's record in Intent.
Result: the outcomes the story's observed facts predict (Open Dough fully
linked except the ambiguous name, Doughnut mostly prose, Pygardon "outside
configured"), or a recorded discrepancy that changes the plan.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A focused Intent Playwright journey runs in this worktree | Every slice's proof | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-code-browse.spec.ts --reporter=list` after `node scripts/setup-native.mjs npm` and `browser` (2026-11-01) | `1 passed (7.7s)` |
| The real records' Locations shapes are as the story's facts state | Slice 3's matching rule and fixtures | Read-only script over each project's record, its `.planning/open-dough.json` Intent locations, and `git ls-files` (Open Dough local main, Doughnut `69c994a896`, Pygardon `e72b32b0a`), 2026-11-01 | Recorded in the story's "Facts observed during refinement" |
| The configured file inventory is available to the page as `IntentLocation.files` | Slice 3's matching input | The same passing journey lists tree rows built from `location.files` | Tree rows observed in the passing journey |

The current refusal of the record path by `file-at` is not decisive: slice 2
adds its own admitted read either way. Slice 5's real-record outcome is an
acceptance observation that only the developer can make. It stops nothing
earlier.

## Current decisions

- The record read is its own pinned read of one fixed path, not a widening of
  `file-at`.
- Never select a guessed file: **several** and unmatched references select
  nothing.
- Selection lives in one Intent workspace owner, shared by the tree and the
  record view.

## Learnings

Slice 1: Intent selection ownership lives in `intentWorkspaceSelection.ts`
(`path` + optional `caseTarget`); `IntentPerspective` remounts the provider on
`source.id:work.revision`. Existing Intent journeys (12) passed after the move.
Optional `caseTarget` is unused until later slices.

Slice 2: Candidates read is its own pinned admitted kind
(`intent=test-optimization-candidates`) of fixed path
`.planning/TEST-OPTIMIZATION-CANDIDATES.md`. Default Intent reading view is the
record; selecting a tree file switches to Purpose. `publishes()` falls back to
backlog for unnamed paths, so true absent needs an explicit 404/`unanswered`.
Ambient `CURSOR_CONVERSATION_ID` can attach managed-delivery observation in
tests that intend an unavailable bridge — clear it for that case. Concurrent
dashboard runs must drop `FORCE_COLOR`/`NO_COLOR` so a coloured coordinator
shell cannot fail the silent-local contract.

Slice 3: Location matching is one pure function over recorded text, the record
path, and `IntentLocation.files` plus location roots. Record view stays mounted
so return does not reread; `data-candidates-reads` observes that.

## Concern evidence

Refinement was not needed. The slices follow one model (record → recorded
reference → target → shared selection). Each Behavior has its own proof loop,
and Structure precedes the Behavior it enables. This review found no remaining
slice-specific concern.

## Story obligations

### G-D61. Layout and control treatment are design details
Reported: slice 1 — "Layout, placement of the record view within Intent, and control treatment are planning and design details."
Story clause: "Layout, placement of the record view within Intent, and control treatment are planning and design details."
Disposition: excluded "Layout, placement of the record view within Intent, and control treatment are planning and design details."
Commitment: 61

### G-D1. Structured location syntax deferred
Reported: slice 1 — "A structured location syntax in the candidate-record format, and any change to the dough-test-optimization skill."
Story clause: "A structured location syntax in the candidate-record format, and any change to the dough-test-optimization skill."
Disposition: excluded "A structured location syntax in the candidate-record format, and any change to the dough-test-optimization skill."
Commitment: D1

### G-D2. dough-test-optimization skill change deferred
Reported: slice 1 — "A structured location syntax in the candidate-record format, and any change to the dough-test-optimization skill."
Story clause: "A structured location syntax in the candidate-record format, and any change to the dough-test-optimization skill."
Disposition: excluded "A structured location syntax in the candidate-record format, and any change to the dough-test-optimization skill."
Commitment: D2

### G-D3. Tree badges deferred
Reported: slice 1 — "Badges or marks for candidates in the location tree, and runtime Proof, profiling, or automated assessment."
Story clause: "Badges or marks for candidates in the location tree, and runtime Proof, profiling, or automated assessment."
Disposition: excluded "Badges or marks for candidates in the location tree, and runtime Proof, profiling, or automated assessment."
Commitment: D3

### G-D4. Runtime Proof deferred
Reported: slice 1 — "Badges or marks for candidates in the location tree, and runtime Proof, profiling, or automated assessment."
Story clause: "Badges or marks for candidates in the location tree, and runtime Proof, profiling, or automated assessment."
Disposition: excluded "Badges or marks for candidates in the location tree, and runtime Proof, profiling, or automated assessment."
Commitment: D4

### G-D5. Editing entries deferred
Reported: slice 1 — "Editing, moving, or deciding entries. Those belong to the dough-test-optimization workflow."
Story clause: "Editing, moving, or deciding entries. Those belong to the dough-test-optimization workflow."
Disposition: excluded "Editing, moving, or deciding entries. Those belong to the dough-test-optimization workflow."
Commitment: D5

### G-D6. Changing Intent location configuration deferred
Reported: slice 1 — "Changing any project's Intent location configuration, including Pygardon's `tests/`."
Story clause: "Changing any project's Intent location configuration, including Pygardon's `tests/`."
Disposition: excluded "Changing any project's Intent location configuration, including Pygardon's `tests/`."
Commitment: D6

### G-D7. Story-scoped filtering deferred
Reported: slice 1 — "Story-scoped filtering of entries."
Story clause: "Story-scoped filtering of entries."
Disposition: excluded "Story-scoped filtering of entries."
Commitment: D7
