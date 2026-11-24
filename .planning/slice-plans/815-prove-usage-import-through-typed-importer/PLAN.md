# Prove usage import through the typed importer instead of its command

**Identity:** SEED-413#prove-usage-import-through-typed-importer
**Source:** [typed importer story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-usage-import-through-typed-importer)

## Goal and scope

Give maintainers faster feedback on usage import and recovery. The 54
backend `usage-history/` specs outside the Token Index family share the
usage `home` and `root` fixture module or the usage-import command
wrapper. 45 of them start `node dashboard/server/importUsageHistory.ts`
for every import and every read, 364 call sites in all. Call the typed
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

## Slices and outside-in proof

Stems are files in `dashboard/backend-tests/usage-history/`. Run each
slice's files through the maintained backend command before and after,
with a proof record, and record per-case times.

### 1. Recovered assignments import through the typed importer

Type: Behavior
Status: planned
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

### 2. Recovery, repeated checks and historical tasks use the typed importer

Type: Behavior
Status: planned
Proof: the nine files pass with no command start

Convert `recovered-corroboration`, `recovered-gaps`, `recovered-tasks`,
`recovered-boundaries`, `repeated-checks`, `repeated-checks-evidence`,
`historical-task-context`, `historical-task-references` and
`historical-tasks`. A second import of unchanged transcripts leaves the
stored totals unchanged, observed through the typed read.

### 3. Codex imports, reports and effort selection use the typed importer

Type: Behavior
Status: planned
Proof: the fourteen files pass with no command start

Convert `codex-coverage`, `codex-usage`, `import-report`,
`import-report-window`, `import-responses`, `usage-check-freshness`,
`usage-writer-consistency`, `session-contribution-growth`,
`returned-outcome`, `agent-effort-compare-groups`,
`agent-effort-compare-overlap`, `agent-effort-unknown-counters`,
`agent-effort-unknown-stored-worker` and `agent-effort-selection`. Where a
case asserts the printed report, assert the importer's returned summary.

### 4. Claude transcripts import through the typed importer

Type: Behavior
Status: planned
Proof: the eight files pass with no command start

Convert `claude-lineage-size`, `claude-usage-split`, `native-reader-gaps`,
`claude-completion`, `native-line-separators`, `claude-usage`,
`claude-nested-workers` and `claude-completion-replay`, passing the
Claude roots as options.

### 5. Command cases keep only what the command owns

Type: Behavior
Status: planned
Proof: the nine files pass; each remaining command start names the command behavior it observes

Resolve `usage-history-write-failures`, `usage-reconciliation`,
`earlier-stores`, `earlier-store-conversion`, `session-contributions`,
`recovered-assignment-publication`, `retained-usage`, `claude-coverage`
and `usage-persistence`. Keep a command case for each distinct default,
output, exit status and injected failure; an injected failure leaves the
store's earlier bytes, observed by reading the file. Move every other
import and read to the typed entries. Confirm one retained failure case
fails when the command's error handling is removed in a scratch edit.

### 6. The usage family runs on Vitest

Type: Behavior
Status: planned
Proof: the runner lists all 54 files under the Node engine and their cases pass under the default timeout

Change the fixture module's base and the importers' engine imports in one
commit, with the three Token Index importers if they still need it. A
spec that still needs a server or exceeds the default timeout after
slices 1–5 is named and replanned, since the module cannot serve both
engines.

### 7. The family reports its times and the wrapper loses its unused entries

Type: Behavior
Status: planned
Proof: one full-family run on the baseline's conditions, with typecheck, lint and the two E2E usage journeys green

Compare the family before and after: file and case counts, command
starts, summed case time, elapsed time and every case against the
~100 ms aim. Explain each retained slow case. Remove harness exports the
consumer trace shows unused and run `e2e/configuration/system-settings-usage*`
if the harness changed. Update the
[later families' recount](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).

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
