# Remove local proof from Open Dough

**Identity:** SEED-238#remove-local-proof
**Source:** [selected story](../../seeds/SEED-238-remove-local-proof.md#remove-local-proof)
**Source review:** [source-review.md](source-review.md)

**Prepared:** 2026-11-05. Planning only, in the story's established workspace
`claude/remove-local-proof-from-open-dough`.

## Goal and boundaries

An Open Dough developer maintains a smaller repository and published payload
with CI as the only source of published execution observations. The story
section holds the goal, scope, preserved behavior and key examples; this plan
does not repeat them.

- **Included:** deleting the dashboard's local proof reading and views, the
  location `runner`, `proof` and `proofGeneration` settings, the local
  recorders and committed stores, the five runner proof references and their
  payload entries, and local-proof planning, documentation and finding
  material; rewriting surviving specs and docs to describe the result.
- **Excluded:** Donut, Pygardon and Lizard; any CI detail or history addition;
  hand edits to `.agents/skills/` or `.claude/skills/`; a permanent removal
  checker; the release itself.

**Failure policy:** this project's
[failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) policy
applies as written, by link, to every slice, delegation and repair.

**Local gate:**

- Fresh worktree: run `setup-native.mjs npm` and `browser` before the first
  dashboard spec, and compare `node -v` with `.node-version`.
- Focused checks per slice run through `bash scripts/test.sh <paths>` and the
  dashboard runner (`npm run --silent test:dashboard -- <specs>
  --reporter=list` into a log), with Homebrew Bash first on `PATH` and
  `NO_COLOR`, `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset
  (`env -u …`); the last breaks fixture clones and
  `tests/update-removes-dropped-files.sh` in this worktree. Each slice also
  runs `npm run lint` and, for dashboard changes, `npm run typecheck:dashboard`.
- Once before landing: the whole `npm test` and `npm run test:dashboard`,
  because the change crosses shared paths every suite loads
  (`scripts/test-run-job.bash`, `dashboard/tests/support/quietReporter.ts`,
  `dashboard/playwright.config.ts`, `install.sh`). Run each under the
  [machine sleep](../../../tests/local-test-resources.md#machine-sleep-on-macos)
  guard, `caffeinate -s -i`, on AC power. Hosted CI then owns its run on the
  published revision, including the `ci-proof` job.

## Direction and PFE

- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  leaves proof storage open; CI proof stays the observed-result source. No
  ADR changes.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  governs the remaining `dough-test-optimization` wording.
- Reuse, not new tooling: payload retirement is the existing update behavior
  (`tests/update-removes-dropped-files.sh`); the sweep uses `git grep`.
- Shared seams kept: `scripts/test.sh` writes `OPEN_DOUGH_TEST_OUTCOMES`
  independently of the local recorder; `quietReporter.ts` instantiates
  `ProofRecord` (CI run record) and `ProofSnapshot` (local store) from
  separate options. Only `ProofSnapshot`, the `snapshot` option and the
  Node proof reporter go.
- Case-target opening (`dashboard/src/intentCaseTargetLine.ts`, used by
  optimization candidates) imports nothing from proof modules and stays.
- Located by reading, not decisive: `IntentFileReading.tsx` uses
  `proofKindOf` only for the Proof panel; the runner case parsers and proof
  modules are imported only by `proofKinds.ts` and their unit tests;
  `location.runner` is read only to choose a proof kind. A surviving import
  that slice 2's typecheck finds keeps that module, which changes neither
  slice order nor proof.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result | Remainder |
| --- | --- | --- | --- | --- |
| CI's Node share outcomes and fragments do not need the local Node recorder | Slice 3 | This workspace at `299e90a4b`, 2026-11-05: scratch removal of the `node_proof_reporter` reporter line in `scripts/test-run-job.bash`; `OPEN_DOUGH_TEST_OUTCOMES=<tmp>/out.txt RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs` (Homebrew Bash), then `ci-proof-summary.mjs fragment --outcomes <tmp>/out.txt --entry tests --entry src/skills --part 1 --of 1 --attempt 1 --revision HEAD`; reverted | Exit 0; outcomes `passed	<file>`; `tests/proof` unchanged; fragments `tests-1.json` and `src-skills-1.json` written (`passed: 1`) | none |
| CI's dashboard fragments are produced with the local snapshot off | Slice 3 | CI run 41988665536 at `b985825d9` (main, 2026-11-05, success): every dashboard shard uploaded `ci-proof-fragments-dashboard-<n>-attempt-1` and the run uploaded `ci-proof-summary-attempt-1`; `ci.yml` sets no `RECORD_PLAYWRIGHT_PROOF`. `dashboard/tests/support`, `playwright.config.ts`, `scripts`, the CI proof scripts and `.github` are unchanged from `b985825d9` to `299e90a4b` | Run record path alone feeds CI's Playwright fragments | none |
| Released update removes payload files the new release no longer declares, on both skill roots | Slice 4 | `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES bash scripts/test.sh tests/update-removes-dropped-files.sh`, this workspace, 2026-11-05 | Passed (Codex/Cursor `.agents/skills` and Claude `.claude/skills` headings asserted by the test) | Without the env unset, the fixture clone fails with "bad pack header" |

## Outside-in proof

| Promise (story example) | Owning slice | Observation |
| --- | --- | --- |
| 1. Folder summaries show no proof summary, cost, slowest or generation prompt | 1 | Rewritten `intent-entry-folder-summaries*.spec.ts`, `intent-summary-drill-down.spec.ts` |
| 1. File reading shows Purpose with case targeting; the read has no `proof` field | 2 | Rewritten `intent-purpose-proof-*` specs (as Purpose reading specs), `intent-code-browse*.spec.ts`, `intent-gherkin-*.spec.ts`, `intent-test-optimization-candidates*.spec.ts`, `boundary/authenticated-read-intent-locations*.spec.ts` |
| 1. CI status → Proof unchanged | 2, final | `intent-ci-proof*.spec.ts`, `intent-ci-status*.spec.ts` |
| 2. Old `proof` / `proofGeneration` / `runner` keys are unrecognized, not specially read | 2 | `authenticated-read-intent-locations-problems.spec.ts` keeps its generic unknown-key behavior; no schema or doc names them |
| 3. `RECORD_*` set changes nothing and writes no store | 3 | Scratch run of one Node test and one dashboard spec with each opt-in set: exit and output as without; no `tests/proof` or `dashboard/tests/proof` created |
| 4. CI outcomes, run record and summary still produced | 3, final | `bash scripts/test.sh` CI proof script tests; `proof-record*.spec.ts` boundary specs; the fragment command on a fresh outcomes file and run record; hosted CI's `ci-proof` job on the published revision |
| 5. Update retires the five pages on all hosts, keeps `ci-proof-summary.md` | 4 | `tests/update-removes-dropped-files.sh`, payload/install tests naming the manifest, `install.sh` manifest read |
| 6. Sweep classifies verification vocabulary and CI uses | 5 | The recorded sweep table in this plan |

## Slices

### 1. Folder summaries show no local proof
Type: Behavior
Status: done
Proof: rewritten folder-summary specs above; `npm run typecheck:dashboard`; `npm run lint`
Accepted: all 52 `dashboard/tests/intent-*.spec.ts` (121 passed) and
`bash scripts/test.sh tests/support/intent-proof-runner.test.mjs
tests/support/intent-pytest-cases.test.mjs tests/support/dashboard-test-files.test.mjs
tests/support/intent-vitest-cases.test.mjs`; refactor reran the summary,
drill-down, candidates-open and pytest-proof specs (9 passed); typecheck and
lint clean.

Behavior: a location or folder is selected in Intent → its summary shows
location explanation and file counts, with no last-successful-proof line,
coverage, summed cost, slowest cases, absence advice or generation prompt.
Deletes `IntentProofSummary`, `IntentSummarySlowest`,
`intentSummaryCoverage`, `intentSummaryProofCost` and the proof columns of
`IntentSummaryChildren`, removes the summary's uses of `IntentProofAbsence`
and `IntentProofGeneration`, and deletes their dedicated specs, fixtures,
pages and unit tests (`intent-summary-proof-cost`, `intent-summary-slowest`,
`*-proof-summary`, `intent-entry-folder-proof`). `IntentProofAbsence`,
`IntentProofGeneration` and `proofCountLine` stay for the file reading's
Proof panel, which still works (interim, removed by slice 2).

### 2. Intent reads only Purpose for local test source
Type: Behavior
Status: planned
Proof: rewritten Purpose reading specs and surviving Intent specs above; boundary authenticated-read specs; `npm run typecheck:dashboard`; `npm run lint`

Behavior: a test file is opened, directly or from a candidate's case → Purpose
shows the source positioned on the case, with no Proof panel, Purpose/Proof
tabs or side-by-side layout; the locations read carries no `proof`,
`proofGeneration`, `runner` or runner problem, and settings parsing no longer
knows those keys. Deletes `intentProofRead.ts`, `proofKinds.ts`,
`proofCases.ts`, the runner case parsers and proof modules, `IntentProof*`,
`ProofObservationCells`, `proofCountLine`, the `*-proof-absent` specs, `intent-proof.css`, `proofGeneration.ts`, their
specs, fixtures and unit tests; removes the keys from
`.planning/open-dough.json`; rewrites `dashboard/PROJECT-CONFIGURATION.md` and
`docs/dashboard-development-intent.md` to the resulting product.

Slice 1 learnings: `.intent-open-link` already moved to
`intent-perspective.css`, so `intent-proof.css` (imported by `IntentProof.tsx`
and `IntentPerspective.tsx`) can go whole. `intentEntryFolderSummariesFixtures.ts`
still carries `pygardonProofFiles` and a `proof:` setting used by the folders
spec's file-Proof step and `intent-proof-generation.spec.ts`; these go here.
`intentProofAbsenceText.ts`, `proofDurationWords.ts`, `IntentProofProblem.tsx`
remain for file Proof only.

### 3. Local runs record no proof
Type: Behavior
Status: planned
Proof: scratch opt-in runs (example 3); `proof-record*.spec.ts`; fragment command on fresh outputs (example 4); `bash scripts/test.sh` on the CI proof script tests; `npm run lint`

Behavior: a developer runs a Node test or dashboard spec, with or without
`RECORD_NODE_TEST_PROOF` / `RECORD_PLAYWRIGHT_PROOF` → identical output and
exit, no store written; CI's outcomes file and run record are produced as
before. Deletes the Node proof reporter and its wiring, `proofStore`,
`proofDirectoryRefresh` and their tests and fixtures, `ProofSnapshot` and
the `snapshot` reporter option with `proof-snapshot-*` specs, and the
committed `tests/proof` and `dashboard/tests/proof`. Rewrites
`dashboard/tests/proof-record.md` and test READMEs to describe the run record
as CI's input; removes deleted files' lines from `tests/longest-first` and
`dashboard/tests/longest-first`.

### 4. Published guidance no longer teaches local proof recording
Type: Behavior
Status: planned
Proof: `tests/update-removes-dropped-files.sh`; payload/install tests that list the manifest; changed guidance tests (`overdue-delegated-verification-guidance.test.mjs`); `npm run lint`

Behavior: a project installs or updates to a release from this source →
`dough-test-optimization` carries `ci-proof-summary.md` and its other
references but no runner proof pages, and no shipped skill links or
describes local proof recording. Deletes the five references and their
`install.sh` entries; edits `dough-test-optimization/SKILL.md`,
`dough-slice-planning/SKILL.md`,
`dough-execute-plan/references/overdue-delegated-verification.md` and its
test, `ci-proof-summary.md` and `ci-proof-fragments.mjs` to describe the
surviving behavior directly, under ADR 0006.

### 5. Planning and maintainer records describe the product without local proof
Type: Behavior
Status: planned
Proof: the sweep table recorded in this plan; `npm run lint`; backlog recorder `read-state` on SEED-192 and SEED-238 entries

Behavior: a maintainer reads the backlog, seeds, docs and findings → no
local proof story, narrative or live finding remains. Drops
`SEED-233#consolidate-proof-recording-guidance` and
`SEED-192#read-shell-check-proof` completely with their backlog lines, and
SEED-192's local-proof-only prose; removes findings whose subject is local
proof from `DearDough.md`, `ProjectFindings.md`,
`docs/maintainer/project-test-findings.md` and `docs/maintainer/findings/`,
and local-proof text in `tests/native-*.md` and
`docs/maintainer/dashboard-touch-family-timings.md`. Then runs the one-time
`git grep` sweep over the product and `src/skills` payload and records each
remaining hit's classification here (verification vocabulary, CI consumer,
or preserved history below).

## Current decisions

- Story Branch Mode; no trunk step. The release that retires installed copies
  is separate work.
- The location `runner` key goes with `proof`: it only selects a proof kind.
- Kept as history, not product description: `.planning/done/` records,
  `CHANGELOG.md` entries, and plan 472's premise row about
  `dashboard/tests/proof/latest.json` at `7c71049b`. Incidental evidence
  mentions inside findings about other subjects stay.
- The CI run record keeps its `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` name and
  contract; renaming it is not part of this removal.

## Concern evidence

- Slice-plan refinement was not needed: each slice owns one observable result
  with its own proof loop, ordered so no slice deletes something a later
  slice's surviving consumer still reads (summaries, then reading and
  settings, then recorders and stores, then the guidance the dashboard text
  linked, then records and the sweep).
- No remaining slice-specific concern was identified. Slice 1's interim file
  Proof panel is an accepted trade-off replaced by slice 2.

## Story obligations

### G1. Summary children lose per-file case counts
Reported: slice 1 — "children now show a file count per folder and only a name for files"
Story clause: "everything that exists only to produce, consume, test or explain it"
Disposition: no user cost "everything that exists only to produce, consume, test or explain it": the per-child scenario/test counts were parsed through `proofKinds.rowsOf` and the runner case parsers, which only proof kinds import (plan "Direction and PFE"); the summary keeps path, file counts, location explanation and child drill-down, and Purpose still opens each file's source (`intent-summary-drill-down.spec.ts` 16.1/16.2, 121 Intent specs passing in slice 1).
