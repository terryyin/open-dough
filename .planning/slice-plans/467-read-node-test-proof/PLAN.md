# Read Node script-test proof

**Identity:** SEED-192#read-node-test-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-node-test-proof)
**Source review:** [source commitments](source-review.md)
in SEED-192, refined 2026-11-04 under Terry's instruction to use what the
Cucumber, pytest and Vitest proof stories taught, keep the architecture
cohesive and add no duplicate.
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/read-node-script-test-proof`, agent philip-chan), continuing
the refinement in the same session.

## Goal and boundaries

An Open Dough or Doughnut developer selecting a `node --test` file in Intent
sees each test's last successful committed proof beside its JavaScript
source, named by its suite path, and a location or folder summary gives the
Gherkin summary's figures in test words. Each project records that proof
deliberately through a project-owned `node --test` reporter that follows a
published Open Dough `node:test` proof reference and is declared with
`runner: "node:test"`, `proof` and `proofGeneration` on its Node Intent
locations: Open Dough's `src/skills`, Doughnut's `scripts` and `infra`. The
snapshot is the Vitest proof format without `project`, so the dashboard
gains a runner registration, not a Node-shaped parser or row rule. The
story's ten key examples are the evaluation; Terry judges the first
experience against `node --test` output plus an editor.

Included: the reference; Open Dough's recorder, its loading by
`scripts/test.sh`, its declaration and first snapshot; the dashboard's
runner registration, words, explanations and documentation; Doughnut's
recorder, declaration and first snapshot in a subordinate workspace; one
real reading of both. Excluded, as the story records: `tests/support` and
`dashboard/tests` proof, a shared payload recorder, per-subtest rows, rows
for loop-generated names, run wall time, CI comparison, a full-suite
refresh of either project.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout, including in the subordinate Doughnut workspace under that
project's own rules. Local full suites follow `tests/local-test-resources.md`:
Bash 5 on PATH, and on AC power `caffeinate -s -i` around the run
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **Reader: reuse, register.** The proof kind registry
  (`dashboard/src/proofKinds.ts`) resolves a `typescript` or `javascript`
  location's kind by its declared `runner` through `runnerProofKinds`,
  registered for `vitest` only; a kind contributes `parseFile`, `rowsOf`
  and `words`, and every other rule lives in the case model
  (`dashboard/src/proofCases.ts`). A `node:test` kind reuses
  `parseVitestProofFile` (`dashboard/src/vitestProof.ts`) and `vitestRowsOf`
  (`dashboard/src/vitestCases.ts`) with Node's words; `t.test(` is a member
  call the row rule already skips, `describe`/`suite` nesting is already the
  name path, and a snapshot without `project` already parses. No parser,
  scanner, reduction, summary or fixture is copied. Renaming the Vitest-named
  modules to runner-neutral names is deferred: plan 465 (Taken) edits
  `vitestCases.ts` and `scriptTokens.ts` now, and a rename would collide.
- **Explanations: generalize the rule.** `unrecordedReferenceOf` names the
  Vitest reference for every `typescript`/`javascript` location without
  proof; it becomes "the declared runner's reference when Intent reads that
  runner, otherwise every runner reference", rendered by `NotRecorded` in
  `dashboard/src/IntentProofProblem.tsx` as "follow `a` or `b`".
  `RunnerProblem` already lists `proofRunners`, so it names `node:test`
  once registered. The other-kinds sentence is built from `proofFamilies`.
- **Recorder in Open Dough: new, minimal, beside the failures reporter.**
  `tests/support/node-test-failures-reporter.mjs` already reads
  `test:start`, `test:fail` and `nesting` into a suite path; the recorder is
  a sibling module `tests/support/node-test-proof-reporter.mjs` with its own
  minimal store (atomic `latest.json`, lock without a `.json` extension,
  order by `file` then `test`), the project's first store. `scripts/test.sh`
  loads it as a second `--test-reporter` with `--test-reporter-destination=stdout`
  on both; it yields nothing, so the quiet-pass rule holds. The option
  `RECORD_NODE_TEST_PROOF=1` reaches jobs unchanged (only `OPEN_DOUGH_TEST_*`
  is unset).
- **Recorder in Doughnut: third producer of its store.** Doughnut's
  `e2e_test/config/proofStore.mjs` already serves its Cucumber recorder and
  Vitest reporter; the Node reporter is a JavaScript module beside them
  reusing it, so Doughnut keeps one store. Its ordinary `pnpm test:*` scripts
  pass no reporter, so the declared recording command loads the recorder
  (explicit flags or `NODE_OPTIONS`, Doughnut's choice; `NODE_OPTIONS`
  reaches child processes, which the reference says).
- **Reference: beside the others, same discipline, shared format.**
  `src/skills/dough-test-optimization/references/node-test-proof.md` keeps
  the Vitest reference's recording discipline and states the snapshot format
  by its own fields as the Vitest format without `project`, with the Node
  rules the story records (reporter loading and destinations, main-process
  events, subtests fold into their test, `skip`/`todo`/cancelled/excluded
  keep proof, every other `test:fail` clears, `attempts` 1, covered
  locations, concurrency under a multi-process wrapper, the observed Node
  version).

Accepted decisions: Proof stays a repository record read as a published
fact and `runner` stays project-owned configuration
([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
one Proof concept and identity rule across runners
([ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md));
reuse before new machinery, with safe stopping points
([ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md));
the reference is written for the executing agent in the recording project
([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)).
No ADR conflict; no North Star topic is needed.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| A `node --test` reporter in the main process receives every file's events with `details.type`, `duration_ms`, `nesting`, `file`, `skip` and `todo`; a subtest's result precedes its parent's and the parent's duration includes it; two reporters need destinations and may share `stdout`; `NODE_OPTIONS` carries `--test-reporter` | Throwaway event-dumping reporter over a sample file (parent with subtests, `describe` with `it`/`it.skip`/`it.todo`, failing, todo-failing, timeout, name pattern) under Node 24.21.0 in the job's temporary directory, 2026-11-04 | True on Node 24: `test:pass`/`test:fail` carry `details.type` `test`/`suite`, `duration_ms` (parent 23 ms over 2.7 ms of children), `line`/`column`; skip and todo arrive as `test:pass` with the flag, a failing todo as `test:fail` with `todo: true` and exit 0; timeout `testTimeoutFailure`; parent of a failed subtest `subtestsFailed`; excluded tests emit nothing; `ERR_INVALID_ARG_VALUE` without destinations; both reporters to `stdout` work; `node -e` under `NODE_OPTIONS` unaffected | Doughnut runs Node 26.13+, which no local toolchain provides: slice 5's first fixture test observes the shape there (early probe) |
| `scripts/test.sh` hands the option to jobs, loads a second reporter beside the failures reporter, and a silent recorder passes the quiet-pass rule | Scratch edit of the `run_job` line adding a probe reporter with destinations; `PATH=/opt/homebrew/bin:$PATH RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh` on two real `src/skills` files, Bash 5.3.20, 2026-11-04; edit reverted | True: exit 0, no failure report; the probe saw `RECORD_NODE_TEST_PROOF=1`, 2 and 3 `test:pass` results with absolute file paths and the checkout as cwd | — |
| A `node:test` snapshot in the Vitest format parses and attaches to a real Open Dough file's rows | Scratch script: `vitestRowsOf` over `src/skills/dough-story-refinement/scripts/dough-land-rerun.test.mjs`, a snapshot built from its three names without `project`, `parseVitestProofFile`, `latestProofOf`, `observedRowsOf`, 2026-11-04 | True: 3 parsed, 3 of 3 rows observed, at lines 26, 122, 163 | — |
| Intent reads no `node:test` proof today and names Vitest's reference for every `javascript` location without proof | Same scratch script: `proofKindOf("javascript", "node:test")`, `runnerProblemOf`, `unrecordedReferenceOf("javascript", undefined)` | True: undefined, `"unsupported"`, `vitest-proof.md`; slice 3 changes all three | — |
| Both projects' test names fit the source rule | `vitestRowsOf` over Open Dough's 394 and Doughnut's 78 `*.test.mjs` files at `34b253d91` and `6e53933393` | True: 1,479 of 1,574 and 368 of 386 listed; every miss is a loop-generated template-literal name; parents of subtests are loops without own assertions | — |
| Doughnut's store serves a third producer and its publication route holds | `git show origin/main:e2e_test/config/proofStore.mjs` header ("for each runner whose recorder supplies a proof format"); plan 460's retained slice 2 and 4 evidence (`./scripts/run.sh bash scripts/worktree_setup.sh`, `pnpm format:changed`, push to `main`) at `f08c51e4ce`–`6e53933393` | Presence: the store's contract and the route are recorded, not re-run | Slice 4 re-confirms the route from Doughnut's AGENTS.md; slice 5's fixture test is the first run of the store with Node results |
| Plans 465 and 466 touch files this story edits | Plan headers: 465 edits `dashboard/src/scriptTokens.ts`, `vitestCases.ts` and the Vitest journeys; 466 edits `scripts/test.sh` (admission gate) and `scripts/local-test-suite.mjs` | True, disjoint hunks: this story adds to `scripts/test.sh`'s `run_job` line, registers in `proofKinds.ts`, edits `IntentProofProblem.tsx`, docs and the absent journeys' wording, and adds files | At Take, fetch trunk; while either is unlanded, edit the current files and expect a rebase; never duplicate their repairs |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| Reference usable by the recording agent | 1, 2 and 5 | AGENTS.md behavior review walking examples 1–5 against the reference text; slices 2 and 5 implement from the reference alone and report every gap they had to fill, fixed in the reference in the same slice |
| 1 focused recording, option off, normal run and CI unchanged | 2 | Recorder tests through `bash scripts/test.sh`: option off leaves no file, a run with it writes `latest.json`, output and exit identical with and without; then the real run of example 1 commits `tests/proof/latest.json`; a full `bash scripts/test.sh` afterwards leaves it byte-identical |
| 2 subtests fold | 2 | Recorder test: a parent with passing subtests records one observation with Node's duration; a parent with one failing subtest records nothing and clears its earlier observation; subtests never appear |
| 3 skip, todo, exclusion, interruption keep; timeout and failure clear | 2 | Recorder tests on substitute files, including a `--test-name-pattern` run and a killed run with completed updates kept |
| 4 concurrent jobs share one snapshot | 2 | Recorder test: four substitute files recorded through `scripts/test.sh` (four job slots) land every pass in one `latest.json`; no `.json` lock remains |
| 5 Doughnut recording | 5 | Doughnut reporter tests through `pnpm test:node-test-proof` (or the script Doughnut names) inside `lint:all`; the real focused run writes `scripts/proof/latest.json` and `infra/proof/latest.json`; `pnpm test:log-utils` without the option changes nothing |
| 6 file Proof, 7 folder summary, 8 declaration problems, 9 explanations | 3 | New Playwright journey on an Open Dough-like `javascript` location fixture with `runner: "node:test"`: Test case header and test words, rows by suite path in definition order, a loop-generated name absent, a stale observation unlisted, the undeclared-runner wording naming `vitest` or `node:test`, a Cucumber-shaped snapshot malformed with Retry, a location without `proof` naming the Node reference when it declares the runner and both references when it declares none, the other-kinds sentence; kind-independent rules are not re-proved |
| 10 Cucumber, pytest and Vitest unchanged | 3 | The focused Gherkin, pytest and Vitest Intent journeys stay green on unchanged fixtures, with only the absence wording expectations updated |
| 6–7 on real proof, root summary cost | 6 | Intent on project Doughnut at the revision that published slice 5, and on Open Dough at the revision Intent reads for it; the `src/skills` root summary opened once with its time and request count recorded |

Local gates: `PATH=/opt/homebrew/bin:$PATH bash tests/payload-declaration-links.sh`
for slice 1; `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/node-test-proof-reporter.test.mjs tests/support/node-test-failures-reporter.test.mjs`
plus the runner's own checks that exercise `scripts/test.sh` jobs
(`bash scripts/test.sh tests/test-runner-failure-report.sh` and the peer
`tests/test-runner-*.sh` the consumer trace lists) for slice 2; the focused
Playwright journeys named per slice
(`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`),
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/support/intent-vitest-proof.test.mjs <new unit test>`
and `npm run --silent typecheck:dashboard` for slice 3; `npm run --silent format`
before each commit; in the Doughnut workspace, its own test command for the
reporter tests and `pnpm format:changed`. Run the whole dashboard suite once
before publishing slice 3, since the shared explanation component every
Intent absence journey renders changes (`tests/local-test-resources.md`,
with the sleep guard named above). Hosted CI runs the full suites after
publication and its failures stay owned under the policy above.

## Ordered slices

### 1. The `node:test` proof reference tells a project how to record
Type: Behavior
Status: done
Proof: `src/skills/dough-test-optimization/references/node-test-proof.md`
exists with the contract the story records (option, reporter loading with
destinations or `NODE_OPTIONS` and its reach into children, main-process
events, a case as a test whose enclosing results are suites or the file,
subtests folding with Node's result and duration, `attempts` 1, keep rules
for `skip`, `todo`, excluded, cancelled and unreached tests, clear rules for
every other `test:fail`, `file` from the repository root for covered
locations only, `test` as the suite path, the snapshot format stated as the
Vitest format's fields without `project`, one snapshot per directory,
atomic refresh serialized against concurrent recording processes, commit
discipline, `runner: "node:test"` declaration with an example, a reading
section stating the row rule and that loop-generated names and subtests have
no rows, and the Node version observed); the SKILL.md links it beside the
other three; `install.sh` declares it; an AGENTS.md behavior review walks
examples 1–5 against the text and is recorded here;
`tests/payload-declaration-links.sh` and `npm run --silent format` clean.
Behavior: An agent in Open Dough or Doughnut asked to record `node:test`
proof → reads the installed reference and can configure the option, write
the reporter, load it and declare the location without asking Open Dough
anything else.

**Slice 1 AGENTS.md behavior review (2026-11-05, reference text only;
Status remains planned):** Walked story key examples 1–5 against
`references/node-test-proof.md`.

1. **Invocation context** — The skill description still selects test
   optimization; the SKILL body now names Node test proof beside Cucumber,
   pytest, Vitest and Playwright so an agent asked to record `node:test`
   proof follows that reference. The reference itself opens with explicit
   recording only, option off in every profile including CI, and normal
   runs leaving proof untouched — matching examples 1 and 5's "without the
   option changes nothing" and example 1's CI/full-suite unchanged clause.
2. **Required context** — Configure once requires resolving covered
   locations, `proof` and the recording command from
   `.planning/open-dough.json`, and stops usefully when they are missing
   (configure from the existing invocation or name the missing input).
   Declaration example uses `runner: "node:test"`, `proof` and
   `proofGeneration` with `RECORD_NODE_TEST_PROOF=1`. Example 1's Open Dough
   command shape and example 5's Doughnut per-location proof directories are
   covered by that declaration rule plus "each into its location's proof
   directory"; Doughnut's choice of flags vs `NODE_OPTIONS` is stated under
   reporter loading.
3. **Useful outcome against examples 1–5** —
   - Ex.1: option, silent recorder, covered locations only, `file` from
     `git rev-parse --show-toplevel`, `test` as suite path, `attempts: 1`,
     `commit` at run start, `fileBlob`, one `latest.json`, commit discipline
     — all stated; agent can configure, write the reporter, load it and
     declare without further Open Dough questions.
   - Ex.2: case definition, subtests fold with Node's result and
     `duration_ms`, subtests record nothing, `subtestsFailed` clears —
     stated under Record from the reporter's events.
   - Ex.3: `skip`/`todo`/excluded/`--test-only`/cancelled/unreached keep;
     every other `test:fail` including timeouts clears — stated; failing
     `todo` called out as keep.
   - Ex.4: atomic refresh and serialization against concurrent recording
     processes, lock without `.json`, wrapper such as `scripts/test.sh`
     named as load-bearing — stated under Refresh the snapshot.
   - Ex.5: same contract; loading via recording command alone or
     `NODE_OPTIONS` reaching children; Node 24.21.0 observed with note that
     Doughnut may run 26+ — stated.
4. **Conflict-aware stop** — No conflicting path invented; recorder
   implementation remains slice 2 / 5. Reading section states row rule,
   loop-generated names and subtests have no rows (examples 6–7 territory,
   present so the recording agent does not invent per-subtest rows).

### 2. Open Dough records skill-script proof on explicit request
Type: Behavior
Status: done
Proof: `tests/support/node-test-proof-reporter.test.mjs` runs substitute
files in child `node --test` processes through `scripts/test.sh` and the
reporter as the failures reporter's test does: option off leaves no file;
a `describe` path; a parent with passing subtests as one observation with
Node's duration and no subtest rows; a parent with one failing subtest
cleared; `skip`, `todo`, a `--test-name-pattern` exclusion and a killed run
keeping proof; a timeout and an assertion failure clearing only themselves;
four files recorded at once landing every pass in one `latest.json` with no
`.json` lock left; an outside-Git no-op; a file outside the covered
location not recorded; stdout, stderr and exit identical with and without
the option. `scripts/test.sh` loads the recorder beside the failures
reporter with a destination each; the runner's own checks that exercise jobs
stay green; `.planning/open-dough.json` declares `runner: "node:test"`,
`proof: "tests/proof"` and `proofGeneration.command`
`RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh <files>` on `src/skills`;
then the real run of example 1 writes `tests/proof/latest.json` with the two
files' tests (`attempts: 1`, `commit` at run start, `fileBlob` matching
`git hash-object`), committed as the first snapshot; the same command
without the option and a later focused normal run change nothing there.
Behavior: `src/skills` declares the runner, proof directory and recording
command → an explicit recording run through `scripts/test.sh` maintains the
snapshot under the reference's rules; every ordinary job and CI loads the
recorder with recording off and behaves as before, including the quiet-pass
rule. Any rule the reference left unclear is reported back and fixed in the
reference in this slice.

### 3. Intent reads `node:test` proof for a location that declares the runner
Type: Behavior
Status: done
Proof: `proofKinds.ts` registers `node:test` in `runnerProofKinds` with
`parseVitestProofFile`, `vitestRowsOf` and Node's words (Test case; tests;
test cases; family "Node test files"; reference
`dough-test-optimization/references/node-test-proof.md`); a unit test
through `bash scripts/test.sh` pins the registration for `javascript` and
`typescript`, the runner problem answers, and the reference rule (declared
runner's reference, else every runner's, none for kinds Intent reads no
proof for); `NotRecorded` renders one reference or "`a` or `b`"; new
`dashboard/tests/intent-node-test-proof.spec.ts` with a fixture module
(Open Dough-like `src/skills` location with `runner: "node:test"`, a file
with a `describe` suite, a top-level test, a loop-generated name, a test
with subtests, a stale observation) asserts the Node-specific parts of
examples 6–9 only; the Gherkin, pytest and Vitest absence journeys' wording
expectations are updated and the rest of those journeys unchanged;
`docs/dashboard-development-intent.md` adds `node:test` beside Vitest in
the sentences plan 460 restated; `npm run --silent typecheck:dashboard`
clean; the whole dashboard suite before publication.
Behavior: A `javascript` or `typescript` location declares
`runner: "node:test"`, `proof` and `proofGeneration` → Intent reads the
snapshot at the revision, a selected test file's Proof lists its tests in
definition order by suite path with _No successful proof_ rows, the count
line counts test cases, a location or folder summary gives the Gherkin
figures with test words, and the explanations name the Node reference and
the `runner` setting; a location of those kinds without `proof` names its
declared runner's reference or, declaring none, the Vitest and Node
references.

### 4. A subordinate Doughnut workspace is prepared
Type: Structure
Status: done
Proof: `git worktree add` from fetched Doughnut trunk; `./scripts/run.sh bash scripts/worktree_setup.sh`
exit 0; `./scripts/run.sh node --version` prints Doughnut's Node (26.13 or
later); `./scripts/run.sh pnpm test:log-utils` passes; Doughnut's
publication route is confirmed from its AGENTS.md; the default checkout
`~/git/doughnut` stays untouched.
Internal change: the subordinate workspace this execution owns, at a
recorded base, with a prepared environment. Enables slice 5.

**Slice 4 workspace (2026-11-05):**
- path: `/Users/terryyin/git/doughnut/.worktrees/SEED-192-read-node-test-proof`
- branch: `open-dough/SEED-192-read-node-test-proof` tracking `origin/main`
- base: `af1bfe6496314f1e26d503aa28b4967493bc7dac`
- Node via `./scripts/run.sh node --version`: v26.13.0
- `worktree_setup.sh` exit 0; `pnpm test:log-utils` 6 pass
- Publication route (AGENTS.md Execution wrap-up): format:changed → commit → push
- Default checkout `~/git/doughnut` left at `236047591a…`, porcelain clean

### 5. Doughnut records script-test proof on explicit request
Type: Behavior
Status: planned
Proof: First, as the early probe, a fixture test runs Doughnut's Node with a
throwaway reporter over a sample file and records the event shape here; a
difference from the Node 24 observations changes the reference (slice 1)
before the recorder is written. Then Doughnut reporter tests (option off,
suite path, subtests folding, failure clearing only itself, `skip` and
`todo`, interrupted refresh, outside-Git no-op, a file outside `scripts`
and `infra` not recorded, unchanged output and exit) run through the
`pnpm test:*` script Doughnut adds inside `lint:all`, as `test:vitest-proof`
is; `biome` clean; `.planning/open-dough.json` declares `runner: "node:test"`,
`proof` (`scripts/proof`, `infra/proof`) and the real recording command on
both locations; then the real focused run of example 5 writes
`scripts/proof/latest.json` and `infra/proof/latest.json`, inspected for
example 1's fields; `pnpm test:log-utils` without the option changes
nothing. The reporter, its tests, the declarations and the first snapshots
are committed and published under Doughnut's rules; reference gaps are fixed
as in slice 2.
Behavior: Doughnut's `scripts` and `infra` locations declare the runner,
proof directories and recording command → an explicit recording run
maintains each location's snapshot through Doughnut's existing store; the
ordinary `pnpm test:*` scripts, `lint:all` and CI behave as before.

### 6. Intent shows both projects' published `node:test` proof
Type: Behavior
Status: planned
Proof: A throwaway dev server from this checkout (private HOME with a
Doughnut and Open Dough project list, `GH_TOKEN`, a private
`DOUGH_GITHUB_REQUEST_OWNER_ROOT`, a `gh` wrapper counting calls) opens
project Doughnut at the revision that published slice 5:
`scripts/log-utils.test.mjs` shows example 6's cells and `scripts` and
`infra` show folder summaries; then project Open Dough at the revision
Intent reads for it: `src/skills/dough-story-refinement/scripts/dough-land-rerun.test.mjs`
shows its three rows, `src/skills/dough-story-refinement/scripts` shows
example 7's lines, and the `src/skills` root summary (287 files) is opened
once from cold with its time and GitHub request count recorded as a
learning (the Vitest baseline is about 7.5 requests a second, linear in
files). When Intent reads Open Dough only at trunk and slices 2–3 are not
yet landed there, record that limit and the fixture-proved reading of slice
3, and leave the Open Dough observation to Terry's evaluation after the
landing. Screenshots stay outside the repository for Terry's evaluation,
which is the story's acceptance.
Behavior: Both published snapshots → Intent reads them as examples 6–7
describe on real source; nothing is fabricated for the demonstration.

## Current decisions

- Each project owns its reporter; Open Dough ships the reference and the
  reader. Open Dough's own recorder lives in `tests/support` as this
  project's recorder, not in the payload. A shared payload recorder stays
  Terry's later choice, now measurable against three project-owned stores.
- The `runner` value is `node:test`; the snapshot format is the Vitest
  format without `project`, so one parser and one row rule serve both
  runners. The Vitest-named modules keep their names until plan 465 lands;
  a runner-neutral rename is a later refactor, not this story's.
- A case is a test whose enclosing results are suites or the file; a test's
  subtests fold into it with Node's result and duration. `attempts` is 1.
- `skip`, `todo`, excluded, cancelled and unreached tests keep proof; every
  other `test:fail` clears.
- Open Dough's proof directory is `tests/proof`; Doughnut's are
  `scripts/proof` and `infra/proof`. Both projects' first snapshots are
  focused selections; full refreshes are Terry's deliberate runs.
- Words: Test case, tests, test cases, "Node test files". A `javascript`
  or `typescript` location without proof names its declared runner's
  reference, else every runner's.
- Slices 1–3 depend on nothing beyond trunk at `34b253d91`; at Take, fetch
  trunk and, while plan 465 or 466 is unlanded, edit the current
  `scripts/test.sh` and absence journeys and expect a rebase rather than
  duplicating their work. Slices 1–3 are a safe stopping point with Open
  Dough's own proof readable; slice 5 is another.

## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, the
one Structure slice sits immediately before the Behavior it enables, and
the sequence registers a runner in one case model rather than a Node-shaped
copy. No slice-specific concern remains. Interim behavior: between slices 2
and 3, Open Dough publishes a `node:test` snapshot Intent cannot yet read,
and its `src/skills` location shows the honest `runner` explanation
("`node:test` is not a runner Intent reads proof for") until slice 3
replaces it, so this needs no replacing slice. The Node 26 event shape is
bounded by slice 5's first fixture test, whose failure changes the reference
before the Doughnut recorder; the plan 465 and 466 overlap is bounded by the
Take-time check in Current decisions.

## Story obligations

### X1. tests/support and dashboard/tests carry no proof commitment
Reported: slice 1 — "Open Dough's tests/support tests and dashboard/tests (Playwright) carry no proof commitment."
Story clause: "Open Dough's `tests/support` tests and `dashboard/tests` (Playwright) carry no proof commitment"
Disposition: excluded "Open Dough's `tests/support` tests and `dashboard/tests` (Playwright) carry no proof commitment"
Commitment: X1

### X2. No shared payload recorder
Reported: slice 1 — "No shared payload recorder."
Story clause: "No shared payload recorder"
Disposition: excluded "No shared payload recorder"
Commitment: X2

### X3. Non-literal names have no row
Reported: slice 1 — "Tests whose names are not literals have no row."
Story clause: "Tests whose names are not literals have no row"
Disposition: excluded "Tests whose names are not literals have no row"
Commitment: X3

### X4. Subtests have no rows of their own
Reported: slice 1 — "A test's subtests have no rows of their own."
Story clause: "a test's subtests have no rows of their own"
Disposition: excluded "a test's subtests have no rows of their own"
Commitment: X4

### X5. Stale observations are not listed
Reported: slice 1 — "Observations whose identity the published file no longer defines are not listed."
Story clause: "Observations whose identity the published file no longer defines are not listed"
Disposition: excluded "Observations whose identity the published file no longer defines are not listed"
Commitment: X5

### X6. No wall time, CI comparison, folder cost, staleness, or extra runtime context
Reported: slice 1 — "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no runtime context beyond what the format carries."
Story clause: "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no runtime context beyond what the format carries"
Disposition: excluded "No run wall time, no CI comparison, no per-folder run cost, no staleness rule, no runtime context beyond what the format carries"
Commitment: X6

### X7. Full-suite refresh is Terry's deliberate run
Reported: slice 1 — "A full-suite proof refresh of either project is Terry's deliberate run after the recorders land; the story commits focused selections first."
Story clause: "A full-suite proof refresh of either project is Terry's deliberate run after the recorders land; the story commits focused selections first"
Disposition: excluded "A full-suite proof refresh of either project is Terry's deliberate run after the recorders land; the story commits focused selections first"
Commitment: X7
