# Make Intent location, source and candidate test setup map directly to the domain

**Identity:** SEED-261#map-intent-and-ci-proof-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-intent-and-ci-proof-test-data)
**Source review:** [source-review.md](source-review.md)

## Goal and boundaries

Maintainers can read, at a case's setup, which Intent locations a project
declares, which published files each location selects at a revision, and
which Test Optimization Candidates the project records. Valid synthetic
settings, answered locations, and candidate records come from MakeMe across
the dashboard roots and Node support tests, with the same outcomes and
independent expectations. Malformed, ignored, mismatched, and authored inputs
whose exact form is under proof stay literal. Real server reads, published
file serving, Git worktrees, fake GitHub answers and injected faults keep
their current boundaries. GitHub Actions runs, CI adapter attempts and
coverage, and CI proof data belong to the sibling stories; in a mixed case
this story converts only the Intent facts. Contracts and UI behavior do not
change.

## Current decisions

- **Declared locations and settings.** Build declarations with the existing
  `makeMe.anIntentLocation` and `makeMe.intentSettings`
  ([builder](../../../tests/support/intentLocationTestData.mjs)), typed
  against `DeclaredLocation` in
  [Intent location settings](../../../dashboard/server/intentLocationsSettings.ts).
  No production encoder exists for `.planning/open-dough.json`; tests keep the
  built value and encode it as JSON in one harness place at the file boundary,
  used by the Intent publishing helper
  ([publishIntentProject](../../../dashboard/tests/publishIntentProject.ts))
  and the direct settings writers. A case that proves malformed or empty
  settings writes those bytes literally. An entry whose malformed or
  contradictory form the reader's rules are proved on (a non-string label,
  unsafe or empty include patterns, malformed source entries, a `kind` beside
  `sources`) stays a literal entry, beside MakeMe-built entries when the same
  document also declares valid locations.
  Kinds the product reports as unsupported, such as `java`, and labels the
  reader trims are valid declarations stated through the builder.
- **Answered locations.** Extend the same location builder to state the files
  a location selects at a revision and its problem, returning the answered
  `IntentLocation` of the same module, rather than spreading `files` onto a
  declaration. Type the frontend service substitute's `locations` and
  `candidates` answers against the read answers instead of `unknown`. Derive a
  candidates inventory with the product's
  [`inventoryFromIntentLocations`](../../../dashboard/src/intentCandidatesLocationMatch.ts).
- **Candidate records.** Extend
  [`aTestOptimizationCandidatesRecord`](../../../tests/support/testOptimizationCandidatesTestData.mjs)
  with entries in the accepted section and entries stating every
  `CandidateEntry` field a case relies on, keeping the existing
  `pending(slug, locations)` caller working. Remove
  [`candidateRecordEntry`](../../../dashboard/tests/intentCandidatesRecordEntry.ts).
  Agents author the record from the
  [format reference](../../../src/skills/dough-test-optimization/references/candidate-record.md),
  so the builder keeps rendering its published labels and section order. Add
  the profile-only and transferred sections only with a consumer.
- **MakeMe closure.** Builder modules import no dashboard module at runtime;
  types come from JSDoc imports. The native evidence identity copies only
  `tests/` and `src/`, and CI failed once when this builder imported
  dashboard code (repaired in `5d1c5fe43`).
  [`tests/native-evidence-identity.sh`](../../../tests/native-evidence-identity.sh)
  checks the closure.
- **Direction.** Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  for published settings and records, and the
  [test data architecture](../../../tests/README.md#test-data-architecture).
  The existing builders and product readers suffice; no North Star topic is
  needed.
- **Coordination.** Completed
  [SEED-282](https://github.com/terryyin/open-dough/blob/79714ba4e401efc9e826cd9bb95918c3589f6cfa/.planning/seeds/SEED-282-unify-intent-view-and-ci-proof.md#unify-intent-view-and-ci-proof)
  rewrites Intent journeys that consume these fixtures, such as the CI status
  home page, home activation, project visit and the candidates journey, and
  Taken [SEED-281](../../seeds/SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#distinguish-test-cases-and-files-in-ci-proof)
  may change the CI half of `intent-ci-proof-ancestor.spec.ts`. Fetch trunk
  before each slice and reconcile normally; keep consumer edits to the setup
  they arrange. This is no dependency.
- Execute in Story Branch Mode. No slice acts from trunk.

## Preparation evidence

Observed on 2026-11-09 at `7611641b3` in the assigned worktree with Node
24.21.0, Homebrew Bash 5 and locked Chromium 153.0.8010.12, after
`node scripts/setup-native.mjs npm`, `browser` and `check`. The machine was on
AC under `caffeinate -s -i` with 16 cores, load about 6.5, and two other
worktrees running Playwright. Dashboard commands ran as
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard --
<paths> --workers=2 --reporter=list`. Every scratch edit was reverted with
`git checkout` before this plan was written.

| Premise and consuming boundary | Observation |
| --- | --- |
| The focused Intent selections run in this worktree. | `backend-tests/intent/authenticated-read-intent-(locations\|selection\|candidates).spec.ts`, `backend-tests/intent/intent-story-overlay.spec.ts`, `tests/intent/intent-gherkin-unusable.spec.ts`, `tests/intent/intent-test-optimization-candidates-case.spec.ts` and `frontend-tests/intent-candidates-read-recovery.spec.ts`: 24 passed in 15.8 s. |
| Settings built with MakeMe drive the locations read and browse as before, and the journey catches a wrong stated fact. | Scratch: `mixedSettings` in `dashboard/tests/intentGherkinUnusableFixtures.ts` rebuilt as compact `JSON.stringify(makeMe.intentSettings.withLocations(…).please())` from five `makeMe.anIntentLocation` declarations, including `.ofKind("java")` and `.ofKind("javascript", ["**/*.test.mjs"])`. `tests/intent/intent-gherkin-unusable.spec.ts`, the journey that reads them: passed. Stating `typescript` instead of `java` made the unusable journey fail at its unsupported-location step (expected `0 files`, received `1 file`). |
| An inventory derived from answered locations gives the matcher's results, and the matcher test catches a missing file. | Scratch: `tests/support/intent-candidates-location-match.test.mjs` derived `inventory` with `inventoryFromIntentLocations` from two MakeMe declarations spread with their files. `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/intent-candidates-location-match.test.mjs`: exit 0. Omitting `dashboard/tests/agent-launch-second-server.spec.ts` from the answered files failed two tests. |
| The extended record builder renders the hand-written records byte for byte. | Scratch: `pendingEntry` and `acceptedEntry` plus an accepted section in `TestOptimizationCandidatesRecordBuilder`. A scratch module parsed each fixture record with `parseTestOptimizationCandidates` and rebuilt it from the parsed entries: `node --experimental-transform-types --disable-warning=ExperimentalWarning dashboard/tests/zz-scratch-candidates-records.mts` reported all six identical (Open Dough with 2 pending and 3 accepted, Open Dough `path:line`, empty, Pygardon with 1 accepted, Doughnut with 2 pending, Doughnut case position with 2 pending). |
| The candidates journeys catch a wrong record fact. | Scratch: the Doughnut case record's unique scenario location changed to `::shared scenario`. `tests/intent/intent-test-optimization-candidates-case.spec.ts`: 1 failed (expected `::unique cold path`), 2 passed. |
| Frontend journeys consume the substitute's locations answer, and a builder-made answered location parses there. | Scratch: the `locations` answer in `dashboard/tests/support/frontendServiceState.ts` built from `makeMe.anIntentLocation` spread with its file. `frontend-tests`: 23 passed in 10.4 s. A malformed answer (`files: 42`) failed both `intent-candidates-read-recovery.spec.ts` cases; 21 passed. |
| The closure guard catches a builder that imports dashboard code at runtime. | `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/native-evidence-identity.sh`: exit 0 in 11.7 s. With a scratch runtime `import "../../dashboard/src/testOptimizationCandidatesPath.ts"` in the candidates builder module: `FAIL: tests/native-evidence-identity.sh`. |

## Proof and delivery gates

Compare each converted case with its predecessor at the consuming boundary:
the case-driving facts stay visible at the call site or in the named fixture,
the expected values stay independent, and the same fault still fails. Review
the result for removed duplicate construction against [ADR 0010, Definition of
improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
At each implementation diff run the installed
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with `--base HEAD` and the changed exports as terms, such as
`openDoughSettings`, `doughnutSettings`, `pygardonSettings`,
`exclusiveSettings`, `mixedSettings`, `intentSettings`, `intentLocations`,
`publishIntentProject`, `candidateRecordEntry` and the record constants.
Give every listed consumer a disposition. The changed Intent fixtures reach
`dashboard/tests/intent`, the Recently done selection journeys in
`dashboard/tests/sessions/recently-done-sessions-select*.spec.ts`, the story
comparison fixtures through `intentStoryWorktree.ts`, and every frontend
journey through `frontendServiceState.ts`.

Local gate. Follow [test automation](../../../AGENTS.md#test-automation) and
carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into each delegation and repair handoff. Follow
[native setup](../../../tests/native-setup.md), put Homebrew Bash 5 first on
`PATH`, and run Playwright with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset. Run focused Node checks through
`bash scripts/test.sh <paths>`. Each slice runs `npm run typecheck:dashboard`,
`npm run lint`, its named selections, and
`bash scripts/test.sh tests/native-evidence-identity.sh` when a MakeMe module
changes. Before delivery of the last slice, run the affected consumer suites
once on the final state:
`npm run test:dashboard -- tests/intent tests/sessions/recently-done-sessions-select backend-tests/intent frontend-tests --workers=2`.
No whole local suite is required: the change is test setup, and its consumers
are those suites plus the checks above. Hosted CI runs the whole suites after
publication, and its failures stay owned under the same policy. Before an
expensive run, inspect load, memory and competing runs, and reduce
concurrency rather than coverage. On fully awake macOS with AC power, wrap
long runs in `caffeinate -s -i`. On battery, plug in or start fully awake
with the lid open under `caffeinate -i` and read the sleep log after the run,
following [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

## Slices

### 1. Published Intent settings come from the shared location builder
Type: Behavior
Status: done
Proof: Source examples 1 and 2. Run `backend-tests/intent/authenticated-read-intent-(locations|locations-problems|selection|candidates)\.spec\.ts$` and `tests/intent` with the gate above, plus `tests/sessions/recently-done-sessions-select`. The locations read and Intent browse list the same locations, files and problems; a changed stated kind or path fails the journey that shows it.

A project publishes Intent settings stated through MakeMe → the server reads
them at the published revision → Intent lists the same locations, files and
`no-matching-files` or `unsupported-kind` problems as before. Convert the
settings in the Intent code browse, Gherkin browse and unusable, jobs
feature, locations boundary, entry folder summaries, candidates other-project
and story worktree fixtures, the settings written inline in
`intent-code-browse.spec.ts` and `intent-ci-proof-ancestor.spec.ts`, and the
valid declarations in the backend locations, selection and candidates read
specs. Encode the value in one place at the file boundary and route the
publishing helper and direct writers, such as the CI status and home
activation journeys and the read boundary recovery journey, through it.
Keep `{not json`, `{}`, unreadable settings, a `label` of `42`, and the
malformed source declarations literal in the cases that prove them. The CI
setup in mixed journeys stays for its sibling story.

Accepted: settings encode once through `intentSettingsText`
(`dashboard/tests/support/intentSettingsFile.ts`); `publishIntentProject`
also takes the literal text a case proves. Slice 1 was re-applied over trunk
`889985084` after completed SEED-282 changed the CI status home page, home
activation and code browse journeys (the code browse helper it extracted
replaced the refactor pass's local helpers). On that state typecheck and lint
passed and `tests/intent tests/sessions/recently-done-sessions-select
frontend-tests --workers=2` ran 301 passed, 2 failed at load 11–15: both
`intent-ci-comparison-retry.spec.ts` cases (:75, :204), which reach no changed
file and passed 18/18 alone at one worker. An earlier run timed out
`intent-ci-comparison-cancelled-landing-gaps.spec.ts:130` (12/12 alone). Those
load-sensitive specs are an owned repair before execution completes.

### 2. Answered locations come from the same location builder
Type: Behavior
Status: done
Proof: Source example 4. Run `backend-tests/intent/intent-story-overlay\.spec\.ts$`, `frontend-tests`, and `bash scripts/test.sh tests/support/intent-candidates-location-match.test.mjs tests/native-evidence-identity.sh`. Overlay placement, frontend Intent reads and matcher results are unchanged; omitting a selected file still fails the matcher.

A test arranges a location answer → the location builder states the files it
selects and its problem → the story overlay, the frontend service substitute
and the recorded-location matcher see the same answered locations as before.
Replace the literal `IntentLocation[]` and spread `files` in the overlay
spec, type the substitute's locations and candidates answers against the read
answers and build its locations answer, and derive the matcher's three
inventories from answered locations through
`inventoryFromIntentLocations`. Recorded reference strings stay literal.

Accepted: `makeMe.anIntentLocation…selecting(...files)` returns the answered
location, typed `IntentLocation & { files: string[] }` because the browser's
parsed location has mutable `files`. No arranged answer states a problem
(problems appear only as independent expectations), so the builder adds no
problem method yet. The two read answers are named `IntentLocationsAnswer`
and `IntentCandidatesAnswer` beside their reads (types only). Overlay and
`frontend-tests` ran 28 passed; the matcher and closure checks exited 0.

### 3. Optimization Candidates records come from the record builder
Type: Behavior
Status: planned
Proof: Source example 3. Run `tests/intent/intent-(test-optimization-candidates[^/]*|purpose-case|candidates-read-recovery)\.spec\.ts$`, `backend-tests/intent/authenticated-read-intent-candidates\.spec\.ts$`, `frontend-tests/intent-candidates-read-recovery\.spec\.ts$`, `tests/intent/intent-project-visit\.spec\.ts$` and `bash scripts/test.sh tests/native-evidence-identity.sh`. Then run the consumer suites named in the gate once on the final state. The rendered records match their predecessors byte for byte, and a changed recorded location fails the journey that opens it.

A project publishes a candidates record built through MakeMe → Intent reads
the same Markdown → Optimization Candidates shows the same entries, opens the
same files and positions Purpose as before. Extend the record builder,
replace the hand-written records in the Intent candidates, other-project and
case-position fixtures and in the backend candidates read spec, and remove
`candidateRecordEntry`. Keep the mismatched record and the frontend's
refused, `null` and `42` answers literal. Empty records still show their four
sections with `None.`.

## Readiness review

Plan refinement was not needed: each slice has one consuming boundary and
proof loop (published settings through the locations read, arranged answers
through their consumers, and published records through Optimization
Candidates), and each extends a builder together with its real callers. One
rule holds across them: MakeMe returns the product's settings, answer and
record values, and the harness writes them at the file or transport boundary.
The observations above settled the premises the slices depend on. This review
found no remaining slice-specific concern.
