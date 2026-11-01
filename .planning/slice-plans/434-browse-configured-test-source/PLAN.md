# Browse the other configured test sources

**Identity:** SEED-192#browse-configured-test-source
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#browse-configured-test-source).
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Intent locations gain the `typescript`, `javascript`, `python`, and `shell`
kinds and an optional `include` list of path patterns. A location lists only
files of its kind that match, reads only what it lists, says what it selects,
and styles each kind. Real locations are published for Open Dough, Doughnut, and
Pygardon. Gherkin locations without `include` behave as they do today. Excluded
from this plan: support files shown beside tests, exclude patterns, filtering,
runner-config detection, case outline, and Proof (see the story's deferred
promises).

## Existing solutions and decisions

PFE:

- `dashboard/server/intentLocationsRead.ts` already lists each location with
  one recursive tree read and filters by the kind's extension. The selection
  becomes that filter: kind extensions plus optional include patterns. Listing
  adds no GitHub call.
- `pathSelectedByIntentLocations` (`intentLocationSelection.ts`), used by
  `performedRead.ts` for `file-at` admission, applies the same selection as
  listing, so that one function answers "does this location list this path"
  for both. Do not keep two rules.
- Pattern matching uses Node's built-in `path.posix.matchesGlob` (no new
  dependency). It runs only on the server; the browser shows the patterns as
  text.
- `dashboard/src/sourceHighlight.ts` loads Gherkin on demand through Shiki 4.5.0
  with the JavaScript regex engine. Extend it to one lazily loaded grammar per
  language: `typescript`, `tsx` (for `.tsx` files within the `typescript` kind),
  `javascript`, `python`, and `shellscript` for the `shell` kind. Unknown
  languages keep the plain-text fallback.
- `IntentLocationTree.tsx` holds the Gherkin-specific wording ("No .feature
  files…", "Feature files under…"). Generalize it once, per kind and selection;
  do not add a second component.
- `declaredLocations` in `intentLocationsSettings.ts` stays lenient. A malformed
  `include` (not a list of non-empty safe relative strings) drops that entry, as
  it already drops a bad path or kind. It does not invent "match everything".

Applicable Accepted decisions are ADR 0001, 0002, and 0008, as cited in the
story; no conflict. No North Star topic is needed. The selection rule is an
ordinary extension of the published settings contract and is documented in
`dashboard/PROJECT-CONFIGURATION.md`.

## Outside-in proof

| Story promise / example | Slice | Observable proof |
| --- | --- | --- |
| Ex 1 spec among helpers, Ex 2 colocated, Ex 3 Python, Ex 4 Node/shell (listing) | 1 | New `dashboard/tests/intent-code-browse.spec.ts` with a fake published origin. Listed rows include matched files and omit named helpers and product files. Selecting a file shows its exact text and revision. |
| Location shows path, kind, and patterns | 1 | Same journey: heading text names the patterns. |
| Ex 5 Gherkin without include unchanged | 1 | `intent-gherkin-browse.spec.ts` and `intent-gherkin-unusable.spec.ts` stay green. The unsupported-kind example moves from `typescript` to an unsupported kind such as `java`. |
| Ex 6 no match names path and patterns | 1 | `intent-gherkin-unusable.spec.ts` extended (or the new journey): a pattern location with no match says so, and other locations browse. Retired "No .feature files…" literals are updated to the general wording. |
| Ex 7 selection bounds reading | 1 | `dashboard/tests/boundary/authenticated-read-intent-selection.spec.ts`: `file-at` for an unmatched file inside a pattern location is refused with the outside-locations refusal; a matched file is admitted. Discrimination: the test fails with folder-only admission in a scratch edit. |
| Styling per kind (TS, TSX, JS, Python, shell) | 2 | The journey from slice 1 observes kind-specific token colours, as the Gherkin journey does with `colourOf`, on a `.ts`, a `.tsx`, a `.py`, a `.mjs`, and a `.sh` file. Copied text equals the source. |
| Real configurations in the three projects; Terry's usefulness judgment | 3 | Real-project observation through the running dashboard against published trunks (revisions retained), then Terry's evaluation. |

Local proof per slice: the named specs, run through
`env -u NO_COLOR -u FORCE_COLOR npx playwright test <specs> --reporter=list`
from `dashboard/`, plus the typecheck and staged lint hook. Execution runs the
consumer-trace script for the changed answer shape, wording, and admission rule,
and runs every listed Intent and authenticated-read consumer. The whole
dashboard suite runs on the final state before publishing slice 1, because
slice 1 changes the shared `file-at` admission path that every published read
uses. Hosted CI covers the rest.

## Ordered slices

### 1. List and read selected code test files
Type: Behavior
Status: done
Proof: `intent-code-browse.spec.ts` (Ex 1–4, headings), the updated
`intent-gherkin-unusable.spec.ts` (Ex 6, unsupported kind), the unchanged
`intent-gherkin-browse.spec.ts` (Ex 5),
`boundary/authenticated-read-intent-locations.spec.ts` (empty/unsupported),
and `boundary/authenticated-read-intent-selection.spec.ts` (Ex 7,
discriminating), plus the consumer-trace record. Full dashboard Playwright
suite: 1846 passed before refactor; focused Intent/admission specs and
typecheck repassed after selection extract and `no-matching-files` rename.

Behavior: A project publishes locations of kind `typescript`, `javascript`,
`python`, or `shell`, optionally with `include` patterns → Intent lists, under
each location's heading (path, kind, patterns), only the files of its kind that
match, nested as today. Selecting one shows its exact text and the observed
revision, unstyled where no grammar is loaded yet. An unmatched file inside the
folder is neither listed nor readable through `file-at`. A location with no
matching file names its path and selection. `PROJECT-CONFIGURATION.md` and the
Intent description in `dashboard/README.md` describe kinds and `include`.

Interim: code kinds render as plain text until slice 2 replaces it.

### 2. Style each code kind
Type: Behavior
Status: done
Proof: `intent-code-browse.spec.ts` observes distinct keyword vs string colours
via `expectKeywordAndStringColours` for `.ts`, `.tsx`, `.mjs`, `.py`, and `.sh`;
`intent-gherkin-browse.spec.ts` unchanged. Grammar-load failure still leaves
exact plain text. typecheck:dashboard passed after refactor (`sourceLanguage`).

Behavior: Selecting a TypeScript, TSX, JavaScript, Python, or shell file →
its lines are styled with that language's grammar, loaded on first use only,
with `.tsx` files using TSX. Gherkin styling is unchanged.

### 3. Publish code test locations in the three projects
Type: Behavior
Status: planned
Proof: Real-project observation through the dashboard at the published
revisions, retained under `dashboard/test-results/` (gitignored) and summarized
here, then Terry's evaluation.

Behavior: Open Dough's `.planning/open-dough.json` (in this change) and
Doughnut's and Pygardon's trunks publish the story's locations → in Intent,
the story's examples 1–4 hold on the real trees: specs listed without helpers,
colocated Pygardon specs without product files, `test_*.py` without support
modules, and Node/shell checks. Before committing, check each pattern against
the project's current trunk listing. Doughnut and Pygardon receive settings-only
commits made in fresh worktrees of those projects and pushed to their trunks
without force. Ask Terry to confirm before pushing them; that outward step is
not pre-authorized by this plan. Open Dough's own setting lands with this story.
Consumers that read Open Dough's real `.planning/open-dough.json` are checked
with the consumer trace.

## Current decisions

- Terry (2026-11-01): a location's selection leaves out the files it does not
  match; support files are not shown marked beside tests.
- One selection function serves listing and `file-at` admission
  (`intentLocationSelection.ts`: `locationSelects*` / `pathSelectedBy*`).
- `include` patterns are relative to the location path, use `*` (within one
  folder) and `**` (across folders) as `path.posix.matchesGlob` defines them,
  and only narrow files that already have the kind's extensions.
- Empty-location wire problem is `no-matching-files` (was `no-features`).

## Learnings and preparation review

Decisive premises, settled 2026-11-01 in this workspace's scratch directory:

- **Pattern semantics.** Consuming operation: the planned server-side selection.
  Observation: `node -e` calling `path.posix.matchesGlob` on Node v24.21.0 (the
  pinned `.node-version`). Result: `pages/AspyPage.devices.spec.tsx` and
  top-level `AspyPage.spec.tsx` match `**/*.spec.tsx`. `a/AutoX.spec.helpers.tsx`
  does not. `support/x.sh` does not match `*.sh`, while `compare-versions.sh`
  does. `a/b/test_x.py` matches `**/test_*.py`. Nothing was written to stderr
  (no experimental warning that would break quiet-pass specs).
- **Grammars under the JavaScript engine.** Consuming operation: `codeToTokens`
  as `sourceHighlight.ts` calls it. Observation: a scratch script loading the
  installed Shiki 4.5.0 core, JavaScript regex engine, github-light, and the
  `typescript`, `tsx`, `python`, `javascript`, and `shellscript` grammars
  (from a sibling worktree's identical `node_modules`), then tokenizing real
  files. Result: every grammar loaded and tokenized, with 6–8 distinct colours
  per file. A 267-line spec took 422 ms on first use, TSX 793 ms (including
  grammar compile), and Python 44 ms. `shellscript` registers the alias `shell`.
  First-use latency is acceptable for one selected file. Execution observes it
  in the journey and does not budget it.
- **Real layouts.** Observation: `git ls-tree` of each project's `origin/main`
  on 2026-11-01. Open Dough `dashboard/tests` has 627 `*.spec.ts` files beside
  `.ts` helpers. Doughnut `frontend/tests` has `*.spec.ts` plus
  `*TestSupport.ts` helpers, and `scripts` has `*.test.mjs` beside
  `*-fixtures.mjs`. Pygardon `frontend/src` mixes `.spec.tsx` (119), `.test.tsx`
  (56), `.test.ts` (20), and `.spec.ts` (2), plus `*.spec.helpers.tsx`, with 436
  product files. Pygardon `tests` has 1,277 `test_*.py` files and about 460
  support modules, mostly in one flat folder. Slice 3 rechecks these at
  publication.

Consumers found while planning: `intent-gherkin-unusable.spec.ts` uses
`typescript` as its unsupported kind and asserts the "No .feature files…"
wording. `authenticated-read-intent-locations.spec.ts` asserts the
`no-matching-files` problem code (renamed from `no-features`).
`authenticatedIntentRead.ts` validates that enum. Execution's consumer trace
extends this list.

Concern evidence: slice-plan refinement was not needed. Each slice has one
proof loop; slice 1 keeps selection, admission, and wording together because
they are one rule observed through one journey. No remaining slice-specific
concern.

## Story obligations

### G1. Code kinds render without kind styling
Reported: slice 1 — "Interim: code kinds render as plain text until slice 2 replaces it."
Story clause: "Selecting a listed file shows its exact text with line numbers and styling for its kind, as Gherkin does today."
Disposition: proved by slice 2: intent-code-browse.spec.ts colourOf per kind; sourceHighlight.ts lazy grammars

### X1. Support files beside matched tests
Reported: slice 1 — "Showing support files beside matched tests"
Story clause: "Showing support files beside matched tests"
Disposition: excluded "Showing support files beside matched tests"
Commitment: X1

### X2. Exclude patterns
Reported: slice 1 — "exclude patterns"
Story clause: "exclude patterns"
Disposition: excluded "exclude patterns"
Commitment: X2

### X3. Filter or search over long lists
Reported: slice 1 — "a filter or search over long lists"
Story clause: "a filter or search over long lists"
Disposition: excluded "a filter or search over long lists"
Commitment: X3

### X4. Runner-own selection
Reported: slice 1 — "reading the runner's own selection (Playwright `testDir`, Vitest `include`, pytest `testpaths`) instead of configured patterns"
Story clause: "reading the runner's own selection (Playwright `testDir`, Vitest `include`, pytest `testpaths`) instead of configured patterns"
Disposition: excluded "reading the runner's own selection (Playwright `testDir`, Vitest `include`, pytest `testpaths`) instead of configured patterns"
Commitment: X4

### X5. Doughnut CLI and Java locations
Reported: slice 1 — "Doughnut's CLI Vitest, CLI Python, and Java/JUnit locations"
Story clause: "Doughnut's CLI Vitest, CLI Python, and Java/JUnit locations"
Disposition: excluded "Doughnut's CLI Vitest, CLI Python, and Java/JUnit locations"
Commitment: X5

### X6. Case or scenario outline
Reported: slice 1 — "Case or scenario outline"
Story clause: "Case or scenario outline"
Disposition: excluded "Case or scenario outline"
Commitment: X6

### X7. AST parsing
Reported: slice 1 — "AST parsing"
Story clause: "AST parsing"
Disposition: excluded "AST parsing"
Commitment: X7

### X8. Test execution
Reported: slice 1 — "test execution"
Story clause: "test execution"
Disposition: excluded "test execution"
Commitment: X8

### X9. Proof collection
Reported: slice 1 — "any Proof collection"
Story clause: "any Proof collection"
Disposition: excluded "any Proof collection"
Commitment: X9
