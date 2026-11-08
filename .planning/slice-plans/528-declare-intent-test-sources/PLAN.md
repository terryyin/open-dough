# Let projects declare which tests Intent shows

**Identity:** SEED-274#declare-intent-test-sources

**Source:** [Let projects declare which tests Intent shows](../../seeds/SEED-274-declare-intent-test-sources.md#declare-intent-test-sources)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

A developer declares an Intent location's files as `sources` entries, each
with `include` patterns and an optional `syntax` hint, in
`.planning/open-dough.json`. One location can then hold Donut's Bash `.test`
and Node `.test.mjs` files. The tree, `file-at` admission, a selected story's
changed tests and the reading pane's syntax all follow one rule. Existing
`kind`/`include` declarations keep their behavior. New grammars, migrating
existing declarations, exclude patterns and per-entry grouping stay out.

## Current decisions

- One domain model: a location is a list of source entries. Each entry has
  patterns, an optional hint and, only for the existing form, its kind's
  extension filter. A `kind`/`include` declaration becomes one entry with that
  kind's extensions, its patterns (or any path) and the kind as hint. An
  unknown `kind` keeps the `unsupported-kind` answer. A `sources` entry has no
  extension filter. A path belongs to the first entry, in declaration order,
  whose filter and pattern match; that entry's hint is the file's syntax.
  [intentLocationSelection.ts](../../../dashboard/src/intentLocationSelection.ts)
  owns this rule for the server listing, `file-at` admission, the story
  overlay, and the reading pane, which stops reading `location.kind` in
  [IntentBrowser.tsx](../../../dashboard/src/IntentBrowser.tsx).
- Hints reuse the kind names `sourceLanguage` already maps in
  [sourceHighlight.ts](../../../dashboard/src/sourceHighlight.ts). Any other
  hint, or none, renders plain text without a problem.
- A `sources` location answers with its declared entries and no `kind`. The
  client schema in
  [authenticatedIntentRead.ts](../../../dashboard/src/authenticatedIntentRead.ts)
  accepts either form. A malformed `sources` list drops that location, as a
  malformed `include` does today. When `sources` is present it alone selects.
- The location header, accessible name and empty explanation name a `sources`
  location's patterns (each pattern as `<code>`, with no kind label); the
  existing form keeps its wording.
- Proof is unchanged: CI summaries stay keyed by location path and file paths
  ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
  The setting is project-owned for a demonstrated need
  ([ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)).
- Arrange new settings and locations through a shared MakeMe builder
  ([test data architecture](../../../tests/README.md#test-data-architecture)),
  typed against `DeclaredLocation`. Keep the existing `doughnutSettings`
  legacy JavaScript journey; add the Donut `sources` case beside it.
- Delivery reaches Donut by landing on `main`: the production dashboard serves
  origin's published `main` ([COMMANDS.md](../../../dashboard/COMMANDS.md)).

## Outside-in proof

| Promise | Slice | Observable check |
| --- | --- | --- |
| Existing declarations behave as before | 1 | The existing listing, admission, problem and overlay backend specs and both code-browse journeys stay green unchanged. They cover Gherkin without `include`, TypeScript/TSX, JavaScript, Python and shell styling, and `unsupported-kind`. |
| One location lists and opens Bash `.test` and Node `.test.mjs` with their hints | 2 | Doughnut-style journey: `scripts` with `**/*.test` (`shell`) and `**/*.test.mjs` (`javascript`) lists `scripts/test/worktree_setup.sh.test` and `scripts/ci/ci-proof-outcomes.test.mjs` in one tree. Each opens at its path with `expectKeywordAndStringColours`; a helper `.mjs` stays out. |
| No hint or an unknown hint opens plain text; first matching entry wins | 2 | Backend locations read: a `**/*.check` entry with no hint lists `checks/a.check` but not `checks/notes.md`, and `file-at` admits the first and refuses the second. Focused unit proof of hint resolution: `.test.mjs` before `.test*` resolves `javascript` and `y.test` resolves `shell`; `java` and absent hints resolve to no language. The journey's plain-text file renders with no coloured token span. |
| A selected story's added matching file appears; a neighbor stays outside | 2 | Overlay backend spec: an added `checks/b.check` sits in the `sources` location as added; an added `checks/notes.md` counts once outside. |
| CI summary for `scripts` shows results at those paths | 2 | A published CI summary for `scripts` (the `publishStoryCi` route `intent-ci-proof-ancestor.spec.ts` uses) gives the location's summary counts for both files. |
| Contract documented | 2 | `dashboard/PROJECT-CONFIGURATION.md` and `docs/dashboard-development-intent.md` describe `sources`, `syntax`, plain-text fallback and first-match order beside the existing form. |

## Decisive premises

Observed on 2026-11-08 in the preparation worktree at `30ce335dd` (seed edit
only), Node 24.21.0, dashboard Chromium profile, with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.

| Consuming operation | Observation and result |
| --- | --- |
| Server listing and client story overlay select through the shared rule | `npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/backend-tests/intent/authenticated-read-intent-locations.spec.ts dashboard/backend-tests/intent/intent-story-overlay.spec.ts`: baseline 8 passed. With `locationSelectsRelativePath` scratch-forced to `false`, the gherkin listing case and three overlay cases failed. The scratch edit was reverted. |
| `file-at` admission selects through the same rule | Same command with `-g "admits file-at"` and the same scratch edit: expected 200, received 404. Reverted. |
| The doughnut/openDough code-browse journeys run here as the e2e proof route | `npx playwright test ... dashboard/tests/intent/intent-code-browse.spec.ts` passed in 5.9 s after `node scripts/setup-native.mjs npm` and `browser`. |
| Only `IntentBrowser` passes a location's kind to the reading pane; CI proof never reads `kind` | `grep` of `location.kind`, `.include` and `extensionsOf` across `dashboard/src` and `dashboard/server`: consumers are `IntentBrowser.tsx:163`, `IntentLocationGroup.tsx`, `intentLocationExplanation.ts`, the selection module and the server reader. Slice 2's journey observes the reading-pane outcome. |

Not decisive, observed by slice 2: Shiki colours a file by the hint alone
(`sourceLanguage` ignores the path except for `.tsx`), so a `.test` file with
`shell` is coloured as shell.

**Local gate.** Run the affected backend specs, both code-browse journeys,
the CI-proof journey extended in slice 2, lint and dashboard typecheck. Run
each slice's focused set under `caffeinate -s -i` on AC power, or the
lid-open `caffeinate -i` procedure on battery with the sleep log read
afterwards ([machine sleep on
macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Failures follow [failing and flaky
tests](../../../AGENTS.md#failing-and-flaky-tests).

## Slices

### 1. Express location selection as source entries

Type: Structure
Status: done
Proof: Existing declarations row; consumer-trace record for the changed
selection module.

Internal change: `intentLocationSelection.ts` turns a declared location into
source entries and answers the matching entry (selection plus hint) for a
path. The server listing, `file-at` admission, story overlay and reading pane
use it; `IntentBrowser` takes the selected file's hint from it. External
behavior is unchanged. Enables slice 2.

Accepted proof: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/backend-tests/intent/ dashboard/tests/intent/intent-code-browse.spec.ts`
(65 passed, specs unchanged) and the same prefix on `dashboard/tests/intent/`
(173 passed, rerun after refactor); dashboard typecheck and lint clean.
`intentLocationSelection.ts` now exports `SourceEntry`, `sourceEntriesOf`,
`matchingSourceEntry` and `sourceEntryOfRepositoryPath`; a `sources` entry is
an entry without `extensions`. Refactor: the reading-pane value is
`syntaxHint` from `IntentBrowser` through `sourceLanguage(hint, path)`.

### 2. Declare a location's files by sources and syntax hints

Type: Behavior
Status: planned
Proof: Rows 2–6 of the outside-in table, plus row 1 still green.

A project publishing `sources` entries sees each matching file in one
location's tree, opens it at its path with its hint's styling or as plain
text, and sees a selected story's added matching files there. Includes
settings parsing, the answer and client schema, header and explanation
wording, the MakeMe builder and the documentation.

## Story obligations

### G1. A file selection the rule does not select gets no syntax
Reported: slice 1 — "a file-scope selection under a location that the rule does not select now gets no language, where it used to get the location's kind."
Story clause: "The same selection serves the tree, opening a file (`file-at` admission), and placing a selected story's changed tests"
Disposition: no user cost "A developer can tell Intent which test files to show by publishing configuration in their project.": the tree never lists such a path, `file-at` refuses it, and a kept or URL selection naming it reads as missing, so no source text renders with either language (slice 1 return; admission refusal observed by `authenticated-read-intent-selection.spec.ts` "admits file-at for a selected path and refuses an unmatched file inside a pattern location").

## Preparation review

Slice-plan refinement was not needed. The Structure slice isolates the
legacy-preserving model change before the one new behavior, and every new
promise consumes that one rule in a single proof loop. No slice-specific
concerns remain.
