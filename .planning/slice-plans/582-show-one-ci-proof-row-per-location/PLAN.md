# Show one CI proof row per location

**Identity:** SEED-304#show-one-ci-proof-row-per-location

**Source:** [Refined story](../../seeds/SEED-304-ci-proof-one-row-per-location.md#show-one-ci-proof-row-per-location)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer reads each declared location once in the CI status Proof table,
with its result types' own counts, times, and genuine gaps clearly associated.
Use the published summary's totals across shards. Preserve a file failure even
when cases pass or the failed file ran no cases. Deployment must make this work
for an existing summary without rerunning its project's CI.

Keep Entry, Counts, and Test execution time. Align labeled result-type lines
inside each row's cells, with accessible labels and gap explanations. Complete
zero-result reports introduce no false timing gap. Keep single-type and legacy
summaries readable. Folder Summaries, file Proof, story comparisons, collectors,
summary format, and CI wall time history compatibility are outside this outcome.

## Existing solutions and architecture

- PFE: [IntentCiProof](../../../dashboard/src/IntentCiProof.tsx) currently flattens
  each entry's evidence into separate rows. Change that presentation boundary.
  Reuse [entryEvidenceOf and unit names](../../../dashboard/src/ciProofUnits.ts),
  [ciProofCellsOf](../../../dashboard/src/ciProofWording.ts), and
  [entryTimingOf](../../../dashboard/src/ciProofTiming.ts). Counts, parts, and
  timing remain owned by each unit. The collector already sums each unit's shards.
- Extend the existing [Proof table](../../../dashboard/src/CiProofTable.tsx),
  [figures](../../../dashboard/src/CiProofFigures.tsx), and
  [sorting](../../../dashboard/src/ciProofSort.ts) only as needed for grouped
  entry figures. Reuse their semantic headers, keyboard controls, and contained
  overflow. Keep the other callers' single-unit and comparison behavior intact;
  do not create a second summary reader or parallel timing classifier.
- Follow Accepted [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [North Star: observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  published evidence remains authoritative, and the existing local authenticated
  reader supplies it. This display change establishes no new architecture or
  temporary direction. The ADR index has no applicable supersession or conflict.
- The [production watcher](../../../dashboard/COMMANDS.md) deploys qualifying
  published `origin/main` revisions. Execute in **Trunk Mode (`--trunk`)** so
  deployment follows ordinary increments without a separate branch landing
  checkpoint. This dashboard change needs no tagged guidance release under
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
- Update the lasting Proof description in
  [CI status](../../../docs/dashboard-development-intent-ci-status.md) and the
  affected source intent comments with the delivered behavior.

## Decisive premises observed

Observations below used this owned checkout at `f46231269` on 2026-11-11.
Scratch product edits were reverted; only preparation records are retained.

| Premise and consuming operation | Form, profile, and observation | Result and remainder |
| --- | --- | --- |
| Existing published summaries carry both result types and shard totals the table needs. | Downloaded artifact `ci-proof-summary-attempt-1` (13771090947) from [Doughnut run 42828209530](https://github.com/nerds-odd-e/doughnut/actions/runs/42828209530), attempt 1, revision `35366d2509bd7568d8ac4813245f62f80687d142`. Passed its JSON through `ciProofSchema.parse({kind: "summary", summary})`, then each selected entry's evidence through the actual `ciProofCellsOf` with `node --input-type=module` in this checkout. | `frontend/tests`: 2,542 cases, 64,995.5 ms, two present shards; file evidence has two present zero-result shards. `scripts`: 450 cases, 98,861.103353 ms; 22 files, 34,203.487 ms, thirteen empty file reports plus the Bash report. Both scripts times are measured with no gaps. No collector change is needed for these examples. |
| The proposed proof route reaches the current UI and its sorting. | Ran `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-proof-units.spec.ts dashboard/tests/intent/intent-ci-status-sort.spec.ts --workers=1` against the normal built app and synthetic published GitHub artifacts. | Passed. Current UI shows two rows per mixed-unit location; single-unit sorting works. The new one-row assertions must replace only CI status's old row contract. |
| Existing mixed-unit coverage detects lost evidence at the entry rendering boundary. | Temporarily changed `entryEvidenceOf(entry).map(...)` in `IntentCiProof.tsx` to use `.slice(0, 1).map(...)`; ran the preceding command with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed304-scratch-proof.json`. | Units journey failed at its CI status row assertion: expected four rows, received two. Sorting case passed. Restored the file and observed a strict pass with the command below. The new regression must assert every type's contents as well as one row, so dropping a type cannot satisfy it. |
| Real published application changes qualify for normal production deployment. | Ran the normal Playwright entry below, including `production-qualification.spec.ts`, which publishes fixture Git trees and executes the actual qualification operation against their selected CI policy. | All six selected cases passed. Application paths qualify; planning-only paths do not. Live production activation and its reading of the existing run remain slice 2 acceptance, not a claim established by this fixture. |

Restored-baseline command (strict record at `/tmp/seed304-baseline-proof.json`):

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed304-baseline-proof.json caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-proof-units.spec.ts dashboard/tests/intent/intent-ci-status-sort.spec.ts dashboard/backend-tests/runtime/production-qualification.spec.ts --workers=1
```

Result: six selected cases, strict passed, 28.685 seconds, finished
`2026-11-11T00:58:12.929Z`. Literal summary observation after downloading and
extracting the artifact to `/tmp/seed304-ci-proof-summary.json`:

```sh
node --input-type=module <<'JS'
import { readFileSync } from 'node:fs';
import { ciProofSchema } from './dashboard/src/ciProof.ts';
import { ciProofCellsOf } from './dashboard/src/ciProofWording.ts';
const summary = JSON.parse(readFileSync('/tmp/seed304-ci-proof-summary.json', 'utf8'));
ciProofSchema.parse({ kind: 'summary', summary });
for (const entry of summary.entries.filter(e => ['frontend/tests', 'scripts'].includes(e.path)))
  console.log(entry.path, entry.evidence.map(e => ({ unit: e.unit, cells: ciProofCellsOf(e) })));
JS
```

The downloaded artifact is an observation, not a permanent test dependency.
Express its decisive facts in shared MakeMe data; do not require this run's
artifact to remain downloadable for automated tests.

## Outside-in proof ownership

| Promise / source example | Owner and observable proof |
| --- | --- |
| One `frontend/tests` row; 2,542 cases across shards; explicit zero file failures; a file failure before any cases remains visible | Slice 1: built-browser CI status regression using the shared summary/collector fixtures and MakeMe. Assert one path row, both typed result groups, shard totals, and the failed-file variant beside passing cases. |
| One `scripts` row, 450 cases and 22 files, their separate measured times, thirteen empty reports causing no false gap | Slice 1: same browser boundary with representative summary facts, plus focused timing classification proof where a rule changes. Assert labeled times around 1 min 39 s and 34.2 s; no combined count or time. |
| Missing/ambiguous or untimed evidence remains with its type; measured evidence in another type stays measured | Slice 1: mixed-unit browser case and focused wording/timing tests. Assert the unit label on the gap and its accessible explanation. Complete zero-result evidence is distinguished from missing evidence. |
| Whole-row sorting, accessible labels, single-type and legacy reading | Slice 1: extend sorting and accessibility journeys with mixed units; preserve legacy GitHub/adapter cases and the Summary/file steps of the units journey. |
| Deployment changes the view of an already published summary, without new project CI | Slice 2: observe the new production revision and the same existing summary's single-row results through the normal authenticated reading path. Retain run/attempt/revision and deployment evidence. |

## Ordered slices

### 1. Read all result types in one location row
Type: Behavior

Status: done

Pre-condition: the judged attempt has a published summary with one or several
result types per location, including empty reports and genuine gaps.
Trigger: open CI status Proof or activate a table sort header.
Result: each location appears once, with all its own result types' counts,
time, and gaps labeled and aligned; sorting moves the entire row.

Change the existing entry presentation and shared table support cohesively.
Keep the unit's figures and timing classification intact. For numeric sorting,
compare each unit's figures in the established case, file, legacy order, using
the next unit only to break a tie. An unavailable figure follows an available
one in either direction at that unit; ties retain declaration order. Keep the
existing failure tie-break within counts. Never sum different units to create
a count, time, or sort key. Entry still sorts by path. Other table callers keep
their existing sorting. State this behavior in the maintained CI status prose.

Proof: update `dashboard/tests/intent/intent-ci-proof-units.spec.ts` so only
its homepage expectations change, and add focused grouped-entry examples using
shared MakeMe builders. Extend `intent-ci-status-sort.spec.ts` and
`intent-ci-proof-accessibility.spec.ts` to cover multiple labeled lines, the
full gap descriptions, keyboard sorting, and the existing narrow/zoomed reading
boundary. Keep `intent-ci-proof-legacy-results.spec.ts` and
`intent-ci-proof-adapter.spec.ts` green. Run focused timing/sort rules if changed.
All promises in the first four proof-map rows belong to this slice, including
implementation, lasting intent prose, regression proof, and local refactoring.

### 2. Read an existing run through the deployed dashboard
Type: Behavior

Status: done

Pre-condition: slice 1 has passing proof and is published to `origin/main`.
Trigger: the ordinary watcher activates a qualifying revision containing it,
then the developer opens the existing run's Proof in production.
Result: the existing summary now yields one row per location with the same
typed counts, measured times, and genuine gaps, without publishing new CI proof
or rerunning Doughnut's CI.

Use the existing production watcher and authenticated project reader. Observe
its selected/active revision before claiming deployment. Read the already
published run (the observed Doughnut run while available, or another retained
published mixed-unit summary with recorded identity and equivalent facts).
Confirm the deployed table shows one row per path and both types' values.
Record what the deployment and reading actually observed; local fixture success
alone does not complete this slice. If the source artifact expired, that is
missing input for this observation, not a reason to rerun project CI or invent
zeros. Resolve an available existing published summary before completing it.
If production is unavailable or requires developer credentials, stop this path
with the exact missing observation and owner; keep slice 1's accepted proof.

## Execution complete

Product advice: Outcome matches the story — one Proof row per location with
labeled per-type counts, times, and gaps; whole-row sort; live production
reading of Doughnut run 42828209530 attempt 1 on deployed revision
28cf896d…. Aligns with near-future direction for readable CI proof beside
intent. Presentation stayed at the homepage Proof boundary. Reasoned no
backlog change: lasting prose is in docs/dashboard-development-intent-ci-status.md;
SEED-305 already covers wall-time history compatibility. No product defects
or suite-cleanup corrections planned. Tip CI on a06716541… remained pending
at review time.

## Execution gates and boundaries

- Follow [AGENTS.md: failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  as written for every failure, including attribution to base and final CI.
  Active SEED-287/SEED-303 executions may own exact test repairs: establish that
  ownership before touching their uncommitted work; otherwise repair failures.
- Use shared MakeMe for domain arrangements under
  [test data architecture](../../../tests/README.md#test-data-architecture).
  No wall-clock sleeps, `test.slow()`, or suite-level timeout overrides.
- Local gate: check native prerequisites; run the mapped focused browser cases
  with `--workers=1`, affected timing/sort Node checks, dashboard typecheck, and
  changed-file lint. Follow the
  [maintained macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
  begin fully awake; on AC run long checks under `caffeinate -s -i`; on battery,
  plug in or use the documented lid-open `caffeinate -i` procedure and inspect
  sleep logs. Full suites share the repository's admission when required.
- Planning observation host: local macOS, AC, load 6.44/9.29/9.81, about 1 GiB
  free pages plus inactive memory; browser/editor work was active. Chose three
  named spec files, one worker, no full suite. Reconsider before expensive
  execution proof using fresh load, memory, and competing-work evidence.
- After edits, use the installed consumer trace with `--base HEAD` and terms
  for grouped location rows, Counts, Test execution time, and missing parts.
  Trace shared helpers into their caller journeys; disposition each consumer
  as run, reused evidence, or excluded with a boundary reason. Add neighboring
  checks reached by the actual diff; no blanket full-suite local gate is added.
- Run post-change refactoring, then the appropriate proof and commit/delivery
  gates. Expected implementation files inspected above are 109–231 lines;
  `docs/dashboard-development-intent-ci-status.md` is 239 lines. None currently
  requires an oversized-file reorganization. Keep edited files within the
  maintained 250-line check, extracting cohesive presentation or test support
  when necessary. Do not reorganize unrelated modules for this story.
- Published product increments retain the execution workflow's final CI duty.
  Wrap-up assimilates lasting intent, closes this story, and removes spent
  preparation records only after both slices' proof settles.

## Current decisions and concern review

- One entry remains the owner of its result types. Group presentation without
  merging their measurements or adding another acquisition path.
- No prerequisite agreement with SEED-305 is needed: history compatibility
  addresses persistence, while this story consumes existing summary entries.
- Slice sizing is two bounded outside-in proof loops: grouped reading and live
  delivery of that reading. No numeric slice time limit was supplied.
- Slice-plan refinement was not needed: the two boundaries have distinct
  acceptance observations, and implementation plus proof of the grouped row
  remain together. No remaining slice-specific design or proof concern was
  identified. Live activation is an acceptance operation, not assumed evidence.

## Story obligations

### G1. Do not redesign folder Summaries
Reported: slice 1 — "This increment does not redesign folder Summaries."
Story clause: "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Disposition: excluded "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Commitment: 16

### G2. Do not redesign file Proof
Reported: slice 1 — "This increment does not redesign file Proof."
Story clause: "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Disposition: excluded "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Commitment: 17

### G3. Do not redesign story comparison tables
Reported: slice 1 — "This increment does not redesign story comparison tables."
Story clause: "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Disposition: excluded "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Commitment: 18

### G4. Do not redesign collectors
Reported: slice 1 — "This increment does not redesign collectors."
Story clause: "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Disposition: excluded "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Commitment: 19

### G5. Do not redesign the summary format
Reported: slice 1 — "This increment does not redesign the summary format."
Story clause: "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Disposition: excluded "This increment does not redesign folder Summaries, file Proof, story comparison tables, collectors, or the summary format."
Commitment: 20

### G6. CI wall time history is SEED-305
Reported: slice 1 — "CI wall time history compatibility is the separate SEED-305 story."
Story clause: "CI wall time history compatibility is the separate SEED-305 story."
Disposition: excluded "CI wall time history compatibility is the separate SEED-305 story."
Commitment: 21

### G7. Doughnut run observation is context only
Reported: slice 1 — "Observed in Doughnut CI run 42828209530."
Story clause: "A developer reading Intent's CI status can see the full result for a test location without scanning repeated paths."
Disposition: no user cost "A developer reading Intent's CI status can see the full result for a test location without scanning repeated paths.": observational run identity anchors examples; it is not itself a product promise.
Commitment: 30

## Learnings

- The scripts false-gap concern is already handled by the existing timing
  classifier for the observed summary. Preserve and expose that result; do not
  introduce collector or schema changes to solve the repeated-path display.
- Fixed-width side-by-side unit labels overflowed the zoomed reading pane;
  stacked label-above-value lines kept alignment without sideways scroll.
- Slice 1 proof for grouped locations and multi-unit sort lives in
  `intent-ci-proof-grouped-location.spec.ts` and
  `intent-ci-proof-grouped-sort.test.mjs` after the post-change file-size split.

## Accepted proof (slice 1)

- Browser: `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-proof-units.spec.ts dashboard/tests/intent/intent-ci-proof-grouped-location.spec.ts dashboard/tests/intent/intent-ci-status-sort.spec.ts dashboard/tests/intent/intent-ci-proof-accessibility.spec.ts dashboard/tests/intent/intent-ci-proof-legacy-results.spec.ts dashboard/tests/intent/intent-ci-proof-adapter.spec.ts --workers=1` — pass after refactor.
- Node sort: `caffeinate -s -i node --test tests/support/intent-ci-proof-sort.test.mjs tests/support/intent-ci-proof-grouped-sort.test.mjs tests/support/intent-ci-comparison-sort.test.mjs tests/support/intent-ci-comparison-signed-sort.test.mjs` — pass (14).
- Neighbors reused: `intent-ci-status-execution-time.spec.ts`, `intent-ci-proof.spec.ts`.
- `npm run typecheck:dashboard` — pass.

## Accepted proof (slice 2)

Live production observation 2026-11-11 at `http://127.0.0.1:4173/`:

- Selected/running deployment `28cf896d38d64aaff6af0f7c3954704ff360f169` (merge of slice 1); deployment dir `~/.open-dough/dashboard/deployments/28cf896d38d6-d70RLh` HEAD matches.
- Doughnut Intent CI status: run `42828209530` attempt 1, revision `35366d2509bd7568d8ac4813245f62f80687d142`. No Doughnut CI rerun; artifact readable.
- Proof table four paths once each: `frontend/tests` 2542 cases / no test files / 1 min 5 s / No timings; `scripts` 450 cases / 22 files / 1 min 39 s / 34.2 s; single-type `e2e_test/features` and `backend/src/test/java` still readable.
