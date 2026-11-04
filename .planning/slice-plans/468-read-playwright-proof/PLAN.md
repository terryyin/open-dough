# Read Open Dough dashboard Playwright proof

**Identity:** SEED-192#read-playwright-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-playwright-proof)
in SEED-192, refined 2026-11-04 under Terry's instruction to use what the
Cucumber, pytest, Vitest and Node proof stories taught, keep the
architecture cohesive and add no duplicate.
**Source review:** [source-review.md](source-review.md)
**Direction / premises / outside-in proof:** [direction-and-proof.md](direction-and-proof.md)
**Accepted proof records:** [accepted-proof.md](accepted-proof.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/read-open-dough-dashboard-playwright-proof`, agent
yusuke-chan), continuing the refinement in the same session.

## Goal and boundaries

An Open Dough developer selecting a spec file under `dashboard/tests` in
Intent sees each Playwright test's last successful committed proof beside
its TypeScript source, named by its `test.describe` path as the quiet
reporter names it, and a location or folder summary gives the Gherkin
summary's figures in test words. Open Dough records that proof deliberately:
the suite's own quiet reporter maintains the snapshot under a published
Open Dough `playwright` proof reference, through one proof store module
shared with the `node:test` recorder plan 467 introduces, declared with
`runner: "playwright"`, `proof` and `proofGeneration` on `dashboard/tests`.
The snapshot is the Vitest proof format, `project` included, so the
dashboard gains a runner registration and one call form in the shared row
rule, not a Playwright-shaped parser or reader. The story's ten key
examples are the evaluation; Terry judges the first experience against the
quiet reporter's output plus an editor.

Included: the reference; the store module (when plan 467 has not landed
it), the snapshot producer in the quiet reporter, its option, declaration
and first snapshot; the row rule's member call form and Playwright
modifiers; the dashboard's runner registration, words, explanations and
documentation; one real reading. Excluded, as the story records: proof for
`src/skills` and `tests`, other projects' adoption, rows for loop-generated
or helper-defined tests, consolidation of the five references' shared
discipline, run wall time, CI comparison, trace retention, a full-suite
refresh.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow `tests/local-test-resources.md`: Bash
5 on PATH, and on AC power `caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Ordered slices

### 1. The `playwright` proof reference tells a project how to record
Type: Behavior
Status: done
Accepted proof: [accepted-proof.md](accepted-proof.md#slice-1).
Proof: `src/skills/dough-test-optimization/references/playwright-proof.md`
exists with the contract the story records (option, configured reporter
and the `--reporter` warning, runner-process events, final attempt rule,
strict pass as proof, keep rules for skipped, fixme, body skip, unselected,
interrupted and unreached tests, clear rules for failed, timed out,
`test.fail` and printed-output results, `attempts` and summed
`durationMs`, repetitions and other executions folding as the Vitest
reference folds them, `file` from the file suite for covered locations
only, `test` as the title path with anonymous describes adding nothing,
`project` when more than one configured project selects the file, the
snapshot format stated as the Vitest format's fields with `project`, one
snapshot per directory, atomic refresh serialized against concurrent
recording runs, commit discipline, `runner: "playwright"` declaration with
an example, a reading section stating the row rule with the member form
and that loop-generated and helper-defined tests have no rows, and the
Playwright version observed); the SKILL.md links it beside the other
references; `install.sh` declares it; an AGENTS.md behavior review walks
examples 1–5 against the text and is recorded here;
`tests/payload-declaration-links.sh` and `npm run --silent format` clean.
Behavior: An agent in a project with a Playwright suite asked to record
`playwright` proof → reads the installed reference and can configure the
option, write or extend the reporter, and declare the location without
asking Open Dough anything else.

### 2. Open Dough records dashboard proof on explicit request
Type: Behavior
Status: done
Accepted proof: [accepted-proof.md](accepted-proof.md#slice-2).
Proof: `tests/support/proofStore.mjs` (with `proofObservationOrder.mjs` and
`proofDirectoryRefresh.mjs`) with `tests/support/proof-store.test.mjs` and
`tests/support/proof-store-refresh.test.mjs` through `bash scripts/test.sh`
(atomic refresh, lock, order, fold of repeated identities, clear, outside-Git
no-op, covered locations, concurrent writers losing nothing), unless plan 467
landed the module, in which case its tests are reused and only missing rules
are added;
`dashboard/tests/support/proofSnapshot.ts` fed by `quietReporter.ts` and
optioned by `playwright.config.ts`; new `dashboard/tests/boundary/proof-snapshot-*.spec.ts`
through `proofRecordRun.ts`'s nested-run route with a temporary Git
checkout as the working directory: option off leaves no file; a describe
path recorded as the title path; `--retries=1` folding to `attempts: 2`
with the summed duration; `--repeat-each=2` as one observation; a test
failing twice cleared; `skipped`, `fixme`, a body `skip()`, `--grep` and
`--project` exclusion and a killed run keeping proof; a timeout, an
assertion failure, a `test.fail` test and a printed-output pass clearing
only themselves; a two-project fixture recording `project` and a
disjoint-project fixture recording none; a helper-defined test recorded
under the spec's file; two concurrent recording runs landing every pass in
one `latest.json` with no `.json` lock left; an outside-Git no-op; stdout,
stderr and exit identical with and without the option; `proofRecordRun.ts`
strips `RECORD_PLAYWRIGHT_PROOF`, and the existing run-record and
quiet-reporter specs pass with the option set for the outer run while
`dashboard/tests/proof` stays unchanged. `.planning/open-dough.json`
declares `runner: "playwright"`, `proof: "dashboard/tests/proof"` and
`proofGeneration.command`
`RECORD_PLAYWRIGHT_PROOF=1 npm run --silent test:dashboard -- <files>` on
`dashboard/tests`; then the real run of example 1 writes
`dashboard/tests/proof/latest.json` with the two files' tests
(`attempts: 1`, no `project`, `commit` at run start, `fileBlob` matching
`git hash-object`), committed as the first snapshot; the same command
without the option, `--list` and a later focused normal run change nothing
there; `dashboard/tests/README.md` and `proof-record.md` distinguish the
run record from committed Proof; the whole dashboard suite before
publication.
Behavior: `dashboard/tests` declares the runner, proof directory and
recording command → an explicit recording run of `npm run test:dashboard`
maintains the snapshot under the reference's rules; every ordinary, CI and
nested-config run loads the reporter with recording off and behaves as
before, including the strict quiet-pass rule and the run record. Any rule
the reference left unclear is reported back and fixed in the reference in
this slice.

### 3. Intent reads `playwright` proof and names `test.describe` paths
Type: Behavior
Status: done
Accepted proof: [accepted-proof.md](accepted-proof.md#slice-3).
Proof: `vitestCases.ts` reads a family name as a member of `test` with the
line of the `test` token, with `serial`, `parallel`, `fixme` and `fail`
in the modifier set; a unit test through `bash scripts/test.sh` pins
`test.describe`, `test.describe.serial`, `test.describe.configure` (no
case), anonymous `test.describe(fn)`, `test.fixme`, `test.fail`, `test.it`,
`test.use` and hooks naming nothing, and that every Vitest and Node fixture
file in `tests/support` lists the same rows as before; `proofKinds.ts`
registers `playwright` in `runnerProofKinds` with `parseVitestProofFile`,
`vitestRowsOf` and Playwright's words (Test case; tests; test cases;
family "Playwright tests"; reference
`dough-test-optimization/references/playwright-proof.md`); the runner
problem and unrecorded-reference answers name `playwright` (the
generalized rule written here when plan 467 has not landed); new
`dashboard/tests/intent-playwright-proof.spec.ts` with a fixture module
(Open Dough-like `dashboard/tests` location with `runner: "playwright"`, a
spec with a named describe, a serial describe, a top-level test, a
loop-generated name, a stale observation, a snapshot holding a
helper-defined case) asserts the Playwright-specific parts of examples 6–9
only; the Gherkin, pytest, Vitest and Node absence journeys' wording
expectations are updated and the rest of those journeys unchanged;
`docs/dashboard-development-intent.md` adds `playwright` beside Vitest and
Node; `npm run --silent typecheck:dashboard` clean; the whole dashboard
suite before publication.
Behavior: A `typescript` or `javascript` location declares
`runner: "playwright"`, `proof` and `proofGeneration` → Intent reads the
snapshot at the revision, a selected spec file's Proof lists its tests in
definition order by describe path with _No successful proof_ rows, the
count line counts listed test cases, a location or folder summary gives
the Gherkin figures with test words, and the explanations name the
Playwright reference and the `runner` setting; Vitest and Node files list
the same rows as before.

### 4. Intent shows the dashboard's published proof
Type: Behavior
Status: done
Accepted proof: [accepted-proof.md](accepted-proof.md#slice-4).
Proof: Intent on project Open Dough at a revision that holds slice 2's
snapshot and slice 3's reader: `accessible-board-touch.spec.ts` shows its
three `touch reading > …` rows with proof, `agent-completion-quiet.spec.ts`
shows its source with a count line over listed rows only, the `boundary`
folder summary gives its figures, and the `dashboard/tests` root summary
(720 listed files) opens once with its read time and request count recorded
here as a learning; Terry's evaluation notes against the quiet reporter's
output plus an editor are recorded in the execution-complete record.
Behavior: The snapshot and the reader are published → a developer opening
Intent on Open Dough reads real dashboard Proof beside its spec files.

## Current decisions

- The quiet reporter owns the snapshot producer as its second consumer of
  the events it already receives; no second reporter. The run record keeps
  its contract and its CI use under plan 463.
- Open Dough keeps one proof store, `tests/support/proofStore.mjs`, shared
  by the `node:test` recorder (plan 467) and the snapshot producer; the
  second plan to execute imports or extracts it rather than copying it. A
  shared payload recorder stays Terry's later choice.
- The `runner` value is `playwright`; the snapshot format is the Vitest
  format with `project`, recorded only when more than one configured
  project selects the file; Open Dough's observations carry none.
- Proof is a final attempt's plain pass under the strict rule; `attempts`
  is the final retry index plus one; `durationMs` sums the attempts.
- The row rule's member form covers `test.<family name>` with the four
  Playwright modifiers; loop-generated and helper-defined tests have no
  rows and stay in the snapshot; summaries count listed rows only. Listing
  template-literal names and consolidating the references' shared
  discipline are deferred for Terry, as the story records.
- Open Dough's proof directory is `dashboard/tests/proof`; the first
  snapshot is the focused selection of example 1; a full refresh is
  Terry's deliberate run.
- Words: Test case, tests, test cases, "Playwright tests".
- Slices 1–3 depend on nothing beyond trunk at `0363ca1f1`; at Take, fetch
  trunk and, while plan 465, 466 or 467 is unlanded, edit the current
  files and expect a rebase rather than duplicating their work. Slice 2 is
  a safe stopping point with a readable snapshot committed and the reader
  explaining `playwright` as an unread runner until slice 3; slice 3 is
  another.

Concern evidence: [direction-and-proof.md](direction-and-proof.md#concern-evidence).

## Story obligations

### E1. No Playwright commitment on src/skills or tests
Reported: slice 1 — "Open Dough's `src/skills` and `tests` locations carry no Playwright commitment"
Story clause: "Open Dough's `src/skills` and `tests` locations carry no Playwright commitment"
Disposition: excluded "Open Dough's `src/skills` and `tests` locations carry no Playwright commitment"
Commitment: E1

### E2. No other-project Playwright proof adoption
Reported: slice 1 — "no other project adopts this reference here"
Story clause: "no other project adopts this reference here"
Disposition: excluded "no other project adopts this reference here"
Commitment: E2

### E3. Deferred template-literal and helper-defined rows
Reported: slice 1 — "a test or describe named by a template literal with substitutions, and a test defined in a helper module, has no row"
Story clause: "a test or describe named by a template literal with substitutions, and a test defined in a helper module, has no row"
Disposition: excluded "Deferred promise, not a rejection: a test or describe named by a template literal with substitutions, and a test defined in a helper module, has no row"
Commitment: E3

### E4. Deferred shared-discipline consolidation
Reported: slice 1 — "leaves one consolidation of the shared discipline into a reference the runner pages link to as a separate candidate once both land"
Story clause: "leaves one consolidation of the shared discipline into a reference the runner pages link to as a separate candidate once both land"
Disposition: excluded "leaves one consolidation of the shared discipline into a reference the runner pages link to as a separate candidate once both land"
Commitment: E4

### E5. Excluded evaluation topics
Reported: slice 1 — "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no trace or attachment retention, no runtime context beyond what the format carries."
Story clause: "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no trace or attachment retention, no runtime context beyond what the format carries."
Disposition: excluded "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no trace or attachment retention, no runtime context beyond what the format carries."
Commitment: E5

## Execution complete

Product advice: Reasoned no-change to backlog priorities. Assimilate Intent
locations learning (cold ~4830 ms / cached ~35 ms, 1 locations round-trip,
720 listed files; full 720-file Purpose/Proof sweep timed out past the MCP
bound) and that Terry's quiet-reporter-plus-editor judgment remains after
trunk carries the tip. Full-suite refresh stays Terry's deliberate run.
Deferred residue (Vitest-named modules, template-literal/helper rows,
reference consolidation) remains with SEED-233 / later Terry queueing; no
product correction plan from this retrospective.
