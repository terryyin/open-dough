# Prove usage import through the typed importer instead of its command

**Identity:** SEED-413#prove-usage-import-through-typed-importer
**Source:** [typed importer story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-usage-import-through-typed-importer)

## Goal and scope

Give maintainers faster feedback on usage import and recovery. The 54
backend `usage-history/` specs outside the Token Index family share the
usage `home` and `root` fixture module or the usage-import command
wrapper. 45 of them start `node dashboard/server/importUsageHistory.ts`
for every import and every read. The claim has 250 direct wrapper call
sites. Call the typed
importer and the typed store read in this process, keep a few command
cases for what only the command owns, and move the fixture module and
the family to Node Vitest. The [Token Index migration](https://github.com/terryyin/open-dough/blob/d7b4d03df1826e7098dcc160ee1618812e954a72/.planning/slice-plans/811-renovate-usage-token-index-proof/PLAN.md) is complete. Reducing
case count beyond command duplicates stays with the
[later families](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply the [campaign criteria](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).
- The typed entries already exist and need no production change:
  `importUsageHistory(options: UsageImportOptions)` in
  `dashboard/server/usageImport.ts` takes `home`, `store`, `since`,
  `responses`, `codexRoots` and `claudeRoots`; `readUsageHistory(store)`
  in `dashboard/server/usageHistory.ts` returns the stored history. The
  command (`dashboard/server/importUsageHistory.ts`, 57 lines) only parses
  arguments, resolves defaults and prints.
- State each import's options as one MakeMe value under
  [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md): a builder
  for `UsageImportOptions` that carries the family's fixed `since`, the
  response file beside the private home and the native roots a case
  names. Cases pass its value to the importer; no wrapper function is
  added to test support.
- A case that reads the responses of the latest import reads the response
  file with the production `UsageResponses` type. Slice 1 settles whether
  a production reader exists to reuse or the cases parse the document.
- Command-owned behavior keeps command cases: default roots and store
  from `--home`, the `read` output, the exit status and message of a
  refused or failed run, and failures injected into the command's process
  (`failing`, `importFailure`, `nodeProcess`). Nine specs hold these.
  Keep one case per distinct command behavior and move every other
  import or read in those files to the typed entries.
- Move the engine last, in one slice: the fixture module
  (`dashboard/test-support/usage-history/retainedUsageTest.ts`) changes
  its base to Vitest together with every importer. A spec selected for
  Vitest imports `expect` from `vitest` directly, since the runner's
  engine predicate reads the spec's own imports. Three Token Index specs
  (`token-index-cohort`, `token-index-eligibility`,
  `token-index-estimate-family`) take `test` from this module; if plan 811
  has not moved them by then, change their engine import in the same
  slice and tell that plan's owner.
- `dashboard/test-support/usage-history/importHarness.ts` loses
  `runImport`, `readImported` and `responsesFile` only when no backend
  spec, support module or E2E journey imports them. Four usage support
  modules and two `e2e/configuration/` journeys import the harness today;
  trace them with the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  before removing an export.

## Decisive premises and baseline

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The family runs on Vitest unchanged apart from the engine import | Slice 6 | At `4283cb8d4`, 24 November 2026, Node 24.21.0, load average about 27: scratch rewrite with the fixture module on a Vitest base, `npx vitest run`, `--maxWorkers 4` | 46 of 48 direct non-Token-Index files and 128 cases passed, 209 s summed; `claude-completion-replay` and `recovered-corroboration` failed; the three Token Index importers passed |
| The maintained runner selects a spec that takes `test` from the fixture module once it imports `expect` from `vitest` | Slice 6's `npm run test:dashboard:backend` | Same revision: scratch rewrite of `agent-effort-compare-overlap`, run through the runner with `--workers=2` | Listed under Vitest; 2 cases passed |
| Command starts are a material share of case time | Slices 1–5's speed aim | The same trial: 202 wrapper calls in the passing files; files without wrapper calls summed 68 s, files with them 141 s, about 0.7 s per call under that load. A lone `read` start took 0.12 s on the quieter machine | Unsettled: the per-call share was read under heavy load. Slice 1 is the probe |
| The typed importer returns what the command prints | Slices 1–5's assertions on the import result | Read of `importUsageHistory.ts`: `console.log(JSON.stringify(result))` of the importer's return | Settled by reading; slice 1 observes it on real cases |

## Slices

Stems are files in `dashboard/backend-tests/usage-history/`. Run each
slice's files through the maintained backend command before and after,
with a proof record, and record per-case times.

### 1. Recovered assignments import through the typed importer

Type: Behavior
Status: done
Proof: the six files pass with no command start, and their summed case time is compared with the same run before the change

Probe. Convert `recovered-assignment-legacy`, `-replay`, `-mixed`,
`-retained`, `-rescanned` and `-evidence` (38 wrapper calls). Add the
MakeMe import-options builder. Behavior: transcripts under a private root
and a private store → the importer is called with the built options → the
import result and `readUsageHistory` return the tasks, contributions and
gaps the cases assert today.

If summed case time for these files does not fall by at least a quarter
on matched conditions, stop before slice 2 and replan: the remaining
value is then the typed entry alone, and the story's speed goal needs a
different cause.

Proof result: all eight cases passed before and after. The six files replaced
38 command wrapper calls with typed imports and store reads. Summed case time
fell from 10,932 ms to 1,168 ms (89.3%). Runner time fell from 10,724 ms to
2,518 ms. Both runs used Node 24.21.0, the maintained backend command with two
workers, and `caffeinate -s -i` on AC power. Natural one-minute load was
9.48–8.54 before and 6.36–6.36 after on 16 cores. The checkout's Git evidence
directory contains `slice-1-{before,after}.json` and the per-case comparison
in `slice-1-implementation.md`. Dashboard typecheck and five named Distribution
MakeMe checks passed. Independent refactoring left the candidate as tested.

The production response module supplies a writer and the `UsageResponses`
type. Cases parse the artifact where they observe it. The options include the
CLI's default private Claude roots when its equivalent command supplied none,
preserving unavailable-root gaps in whole-store comparisons.

### 2. Recovery, repeated checks and historical tasks use the typed importer

Type: Behavior
Status: done
Proof: the nine files pass with no command start

Convert `recovered-corroboration`, `recovered-gaps`, `recovered-tasks`,
`recovered-boundaries`, `repeated-checks`, `repeated-checks-evidence`,
`historical-task-context`, `historical-task-references` and
`historical-tasks`. A second import of unchanged transcripts leaves the
stored totals unchanged, observed through the typed read.

Proof result: all 15 cases passed on the maintained backend runner before
and after with two workers. The nine specs replaced 49 usage command calls.
The unchanged-record replay checks typed store equality, file bytes and
inode, mtime and hash evidence. Summed case time fell from 25,345 ms to
10,965 ms and runner time from 15,447 ms to 6,986 ms. The immediate
baseline load was unrecorded. The checkout's Git evidence directory keeps
`slice-2-{before,after}.json` and the named observations and per-case
comparison in `slice-2-implementation.md`. Dashboard typecheck passed.
The change touched only the nine subject specs and reused the established
MakeMe options and typed observations. No independent refactor was needed.

### 3. Codex imports, reports and effort selection use the typed importer

Type: Behavior
Status: done
Proof: the fourteen files pass with no command start

Convert `codex-coverage`, `codex-usage`, `import-report`,
`import-report-window`, `import-responses`, `usage-check-freshness`,
`usage-writer-consistency`, `session-contribution-growth`,
`returned-outcome`, `agent-effort-compare-groups`,
`agent-effort-compare-overlap`, `agent-effort-unknown-counters`,
`agent-effort-unknown-stored-worker` and `agent-effort-selection`. Where a
case asserts the printed report, assert the importer's returned summary.

Proof result: all 31 cases passed across the same 14 specs and 49 usage
command calls were replaced. Report assertions now observe the typed return.
The separate effort CLI retains its argument, output and refusal coverage.
The writer-consistency case still starts Refresh and import together and
observes stable totals and bytes after both finish. Its mounted chart proof
and the mounted freshness specs belong to G1 in slice 6. Summed case time
fell from 36,248 ms to 17,742 ms and runner time from 20,876 ms to 11,183 ms.
With Node 24.21.0 and two workers, natural one-minute load was 9.66–10.62
before and 8.39–9.28 after. The checkout's Git evidence directory keeps
`slice-3-{before,after}.json` and the per-case table and observations in
`slice-3-implementation.md`. Dashboard typecheck passed. The 14 subject
specs reuse the established inputs with no independent refactor candidate.

### 4. Claude transcripts import through the typed importer

Type: Behavior
Status: done
Proof: the eight files pass with no command start

Convert `claude-lineage-size`, `claude-usage-split`, `native-reader-gaps`,
`claude-completion`, `native-line-separators`, `claude-usage`,
`claude-nested-workers` and `claude-completion-replay`, passing the
Claude roots as options.

Proof result: all 18 cases passed across the same eight specs, with 35 usage
command calls replaced. The long-lineage case calls the typed importer in a
same-process Node worker, verifies its 128 MiB old-generation limit and exit,
then checks the stored requests, tokens and response provenance. Summed case
time fell from 23,557 ms to 7,177 ms and runner time from 14,048 ms to 5,866 ms.
With Node 24.21.0 and two workers, natural one-minute load was 8.85–9.59
before and 8.35–9.25 after. The checkout's Git evidence directory keeps
`slice-4-before.json`, `slice-4-after-confirmed.json` and the observations
and per-case comparison in `slice-4-implementation.md`. Dashboard typecheck
passed. The test-local worker is the only bounded-heap caller of this kind.
Changes stayed in the subject specs and needed no independent refactor.

### 5. Command cases keep only what the command owns

Type: Behavior
Status: done
Proof: the nine files pass; each remaining command start names the command behavior it observes

Resolve `usage-history-write-failures`, `usage-reconciliation`,
`earlier-stores`, `earlier-store-conversion`, `session-contributions`,
`recovered-assignment-publication`, `retained-usage`, `claude-coverage`
and `usage-persistence`. Keep a command case for each distinct default,
output, exit status and injected failure; an injected failure leaves the
store's earlier bytes, observed by reading the file. Move every other
import and read to the typed entries. Confirm one retained failure case
fails when the command's error handling is removed in a scratch edit.

Proof result: 21 baseline cases and 22 candidate cases passed across the
same nine specs. The added case owns `--home` defaults for live and archived
Codex, Claude and the store, plus printed import and read output. The retained
CLI starts cover those outputs, the rename and page-removal diagnostics and
two truly concurrent writers. An isolated process also guards operational
reads and writes against usage scans. Typed imports with scoped rename
faults preserve distinct earlier-store and assignment recovery observations.
The catch-removal scratch edit failed the retained rename case on its exact
stderr assertion. That worktree was retired.

Summed case time fell from 29,628 ms to 5,386 ms before independent
refactoring and runner time from 16,568 ms to 4,307 ms. The refactor kept
all nine specs within 250 lines after formatting and passed the 13 cases in
its four edited specs. Dashboard typecheck passed. The Git evidence directory
keeps `slice-5-implementation.md`, `slice-5-refactor.md`, the associated
timing records and `slice-5-scratch-mutation.diff`.

### 6. The usage family runs on Vitest

Type: Behavior
Status: done
Proof: the runner lists all 54 files under the Node engine and their cases pass under the default timeout

Change the fixture module's base and the importers' engine imports in one
commit, with the three Token Index importers if they still need it. A
spec that still needs a server or exceeds the default timeout after
slices 1–5 is named and replanned, since the module cannot serve both
engines.

G1 covers the six additional specs still using the mounted Token Index
fixture. The existing refresh and chart entries are `refreshUsageHistory`,
`refreshUsage` for the real dashboard writer boundary, and `readTokenIndex`
or `tokenIndexAnswer` for chart selection and values. Select by the assertion
each case makes, preserving the overlapping writer case, persisted check
ordering, archive restoration and paged conversion. Once all six callers
use typed entries and private fixtures, remove the unused HTTP fixture and
Playwright bindings from `tokenIndexHarness.ts` in the same migration.

Proof result: all 54 original specs and the same 151 cases passed under
Node Vitest with the default timeout. Both early scratch failure paths
passed. The six G1 specs preserve separate typed observations of checked-time
ordering, chart filtering and points, archive recovery, paged conversion,
store bytes and writer overlap. The mounted fixture has no remaining
callers. The checkout's Git evidence directory keeps `slice-6-before.json`,
`slice-6-after.json`, `slice-6-case-times.tsv` and the observations in
`slice-6-implementation.md`. Dashboard typecheck passed. Independent
refactoring grouped the same import bindings in two specs.
The formatter exposed 26 Vitest asymmetric matcher assignments typed as
`any`. The repair kept the same matchers with `unknown` assertions and
passed the 30 affected cases under Node. See `slice-6-matcher-repair.md`.

From the immediate Playwright baseline, summed case time fell from 72,065 ms
to 66,359 ms and runner time rose from 39,730 ms to 42,938 ms. Both runs used
the same two workers and locked Node on the same Mac. One-minute load was
11.15–12.66 before and 13.61 at the candidate's end. The candidate's initial
load was unrecorded. Slice 7 compares the completed family to the original
150-case baseline.

### 7. The family reports its times and the wrapper loses its unused entries

Type: Behavior
Status: done
Proof: one full-family run on the baseline's conditions, with typecheck, lint and the two E2E usage journeys green

Compare the family before and after: file and case counts, command
starts, summed case time, elapsed time and every case against the
~100 ms aim. Explain each retained slow case. Remove harness exports the
consumer trace shows unused and run `e2e/configuration/system-settings-usage*`
if the harness changed. Update the
[later families' recount](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).

The consumer trace identified `system-settings-usage-tools.spec.ts` calling
`runImport` with a Claude root to arrange the initial store. Account for
that call before removing the export and verify the existing chart, detail
and Refresh journey with the same evidence.

Proof result: [measurements](MEASUREMENTS.md) pairs all 150 original cases
with the completed candidate and records the extra consolidated CLI case.
All 151 cases passed across the original 54 files on Node Vitest. Runner
time fell from 88.701 s to 36.389 s and summed case time from 171.138 s to
57.236 s. Candidate natural load was lower. Separate passing runs counted
288 Usage CLI starts before and six after. Forty-six candidate cases ran
at or below 100 ms. The table records the work retained by each slower
case. The later-family recount leaves 348 Playwright backend specs and
records all 73 Usage History specs on Node.

The E2E setup now uses the typed importer, and all three cases across both
Usage E2E specs passed. The generic `runImport`, `readImported` and
`responsesFile` exports have no remaining source references. Independent
refactoring gave the retained CLI fault adapter the same fixture response
path and cutoff the fault checks use. Both fault cases passed again, and
Dashboard typecheck passed. Guarded delivery runs the full lint gate after
selective formatting. Git evidence keeps the exact commands and results
in `slice-7-implementation.md`, `slice-7-refactor.md` and the run records.

## Concern evidence

Refinement was not needed: slices 1–5 apply one change, the typed entry,
to disjoint file groups with their own runner proof, and slices 6 and 7
each own one outcome. Remaining concern, bounded by the slice 1 probe:
the share of case time that command starts cost was read under heavy
load, so the speed gain is unsettled until that slice measures it.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for the measured runs in slices 1
  and 7. Keep the default timeout and apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run each slice's files with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:dashboard:backend -- <files> --workers=2`
  and capture `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`. Run Dashboard
  typecheck and lint. The Distribution suite is a local gate for the
  slice that adds the MakeMe builder, because distributed consumers load
  `Distribution/tests/support/makeMe.mjs`: run `scripts/test.sh` on the
  MakeMe support tests that slice touches.

## Execution context

- Story Branch Mode. The established `Sola-chan` workspace is on
  `codex/prove-usage-import-through-the-typed-importer-in` at the published
  claim `04b96eb9d673e08e36ef33ad2cc08e13c42ed729`, which was accepted on
  `origin/main` and used as the remote execution branch's starting point.
  Readiness changed since review. The current source and plan still agree on
  the typed importer, retained command coverage and Vitest outcome. The three
  Token Index fixture importers had already moved to Vitest at the claim.
- Codex observes GitHub Actions `ci.yml` on the remote execution branch.
  Coordinator `seed413-f763c576`, mailbox `/tmp/dough-ci-501/watch-vtN9oF`,
  PID `20113`, shell session `8533`, cell `g172:11`.
  Slice 2 superseded the cancelled slice 1 push run `45401287967` when
  run `45402593213` started on the same branch and workflow.
- The guard captured `family-before.json` at the claim before any edits. All
  54 files and 150 cases passed. Summed case time was 171,138 ms and runner
  time was 88,701 ms. Natural one-minute load was 7.60–15.61 on 16 cores.

## Story obligations

### G1. Migrate the six mounted Usage specs to Node Vitest

Reported: slice 2 — "`repeated-checks` and `repeated-checks-evidence` still use the Token Index Playwright fixture for Refresh and chart. Inspection identified the same fixture in `usage-check-freshness`, `usage-writer-consistency`, `native-reader-gaps` and `earlier-store-conversion`. The retained usage fixture switch alone leaves all six on Playwright."
Story clause: "Move the fixture module and all 54 specs to Node Vitest in the same story."
Disposition: proved by slice 6: `slice-6-after.json` selects all six and the G1 section of `slice-6-implementation.md` identifies their typed Refresh, chart and persistence observations.
