# Keep usage history within a small disk budget

**Identity:** SEED-357#keep-usage-history-within-a-small-disk-budget
**Source:** [story](../../seeds/SEED-357-dashboard-task-token-usage.md#keep-usage-history-within-a-small-disk-budget)
**Source review:** [source review](source-review.md)

## Goal and scope

The usage history under `~/.open-dough/dashboard/launch-history/` keeps tasks,
coverage gaps and one contribution per native session, and no per-response
row. For Terry's present evidence it takes at most 25 MB (19.4 MB of tasks and
gaps as they are, at most 5 MB of contributions), a new task adds under 10 KB,
and a check that finds nothing new leaves its bytes unchanged. Usage shows the
same tasks, Token index values, filters, coverage and "Outcome unknown" detail
for the same native evidence.

Included: the import's responses file, session contributions as the stored
unit, conversion of a paged or legacy store with removal of `usage.json.pages`,
a Refresh and an import that write nothing over unchanged evidence, the
`dashboard/USAGE-HISTORY.md` description, and the one-time removal of
`import-reports/2026-11-15/` from Terry's machine.

Exclusions, as the story's scope limits record them: keeping responses that
belong to no task, compacting task provenance, an import-report writer or
cleaner in the dashboard, and the launch workflow, "Checked" time and checking
indication of
[the sibling story](../../seeds/SEED-357-dashboard-task-token-usage.md#reuse-unchanged-usage-pages-on-repeated-writes).
An import and a Refresh in turn may still rewrite a launch task's workflow
until that story; this plan asserts unchanged bytes for the same writer
repeated.

Assumption: the first Refresh or import on Terry's machine reads the 1.6 GB of
referenced pages once. That one-time cost is accepted.

## Existing solutions and direction

- **The per-task aggregate exists.** `deriveUsageTaskSummary`
  (`dashboard/server/usageTaskSummary.ts`) already sums each task's uniquely
  associated responses by model, effort, tier and root or worker, with
  `TaskGaps` (`usageTaskGaps.ts`) for coverage. Its grouping moves one step
  earlier, to the write, and gains the session as a key. The summary file, its
  digest check (`usageTaskSummaryCache.ts`) and its separate process stay.
- **The write API stays.** `writeUsageHistory(batch)` keeps accepting tasks,
  response observations, associations and gaps (`usageRecords.ts`
  `UsageBatch`). The importer, Refresh, 13 backend specs and
  `e2e/configuration/usageFixtureStore.ts` keep calling it unchanged. What it
  stores changes.
- **Reading stays.** `codexUsage`, `claudeUsage`, the lineage modules,
  `reconcileObservation` and `reconcileMeasurements` still produce one
  reconciled observation per response in memory for the sessions read.
- **Task reconciliation stays.** `canonicalUsageTasks`, the alias map and
  `hasUsageAssignment` in `usageSnapshotReconciliation.ts` keep deciding which
  task a response's candidates resolve to. They apply to a contribution's
  candidate tasks as they applied to an association's.
- **Replaced.** `usageSnapshot.ts`, `usageSnapshotBatch.ts`,
  `usageSnapshotPublication.ts`, `usageReportSnapshot.ts` and the partition
  merge in `usageSnapshotReconciliation.ts` (about 580 lines) give way to one
  document read and one atomic replacement under the same `<file>.lock`
  (`machineJsonLock.ts`, `replaceDurableJson`). The paged and legacy readers
  remain only as the conversion's input.
- **ADR 0008** holds: a machine-local document, no database. No North Star
  topic governs usage storage and none is warranted: the change stays inside
  the usage-history responsibility.

### Domain model

- **Response** (in memory only): one reconciled `UsageObservation` with its
  resolved `UsageAssociation`.
- **Session contribution** (stored): for one `(host, sessionId)`, a list of
  entries keyed by the sorted candidate task ids its responses named, model,
  effort and tier. Each entry holds the response count, the four token
  subtotals, the count of responses missing each category, the count of
  responses not fully measured, and the latest activity. Responses with no
  candidate task are not kept. Responses with contradictory lineage keep their
  candidates and are marked unresolved, so they count for no task and still
  show "unresolved task association" on each candidate.
- **Resolution** (on read): an entry belongs to a task when exactly one of its
  candidates is an eligible task after aliasing, the rule
  `eligibleUsageAssociation` applies today. A task's totals are the sum of its
  entries. An entry is root usage when its session is the task's session.
- **Replacement** (on write): every session with a response in the batch has
  its contribution replaced. Sessions absent from the batch keep theirs.
- **History document**: `{ format: "usage-history-v2", tasks, sessions, gaps }`
  in `usage.json`, serialized in one canonical order so equal content gives
  equal bytes.

## Decisive premises and observations

Observed on 2026-11-15 in this worktree at `74fb59ca2`, Node 24.21.0, machine
load about 5. Real-store reads were read-only scripts over
`~/.open-dough/dashboard/launch-history/usage.json` and its referenced pages.
Scratch edits were reverted before these records were written.

| Consuming operation / premise | Observation and limits |
| --- | --- |
| Slices 2–3: Usage's numbers need no stored response | `deriveUsageTaskSummary` reads from each response only `settings.model`, `effort`, `serviceTier`, `sessionId`, the four `tokens`, `coverage`, and `lastAt ?? at`; `TaskGaps` reads `taskId`, `candidates`, `sessionId` and `coverage`. `tokenIndexCohort.ts` and `tokenIndexTask.ts` read only the summary. Read of the code, not a run; slice 2's preserved proof is the run. |
| Slice 3: contributions fit 5 MB | Building them from the real store (514,444 observations, 9,719 sessions) gave 6,129 sessions with a task or candidate, 6,211 entries and 4,376,549 bytes of JSON including each session's file list, which the history will not keep. 226,050 responses had no task. Entries were keyed by resolved task, not candidate set; 50 responses had candidates without a task, so the candidate key changes the size negligibly. |
| Slice 3: tasks and gaps fit the rest | Real store: 2,925 tasks, 16,596,758 bytes of values; 12,922 gaps, 2,784,811 bytes. |
| Slice 3: a response in several files stays inside one session | Real store: 301 observations have measurements from more than one file, all Claude, each within one `sessionId`. No Codex response had two files. |
| Slice 1: reader specs can observe responses from the import's scan | Scratch: `collectUsageHistory` wrote its observations and associations beside the store, and `readImported` (`dashboard/tests/usage-history/importHarness.ts`) overlaid them on the `read` output. `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`: 45 passed, 12 failed in 38.9 s. The scratch dump skipped the writer's eligibility and alias resolution, so slice 1 applies that resolution before writing the file. |
| Slice 3: which tests depend on stored response rows | The 12 failures of that run: `claude-completion-replay` (2), `historical-task-references` (1), `recovered-assignment-evidence` (2), `recovered-assignment-legacy` (2), `recovered-assignment-replay` (1), `recovered-corroboration` (1), `token-index-refresh` (1, Refresh wrote no scan), `usage-snapshot-failures` cross-process writers (1), `usage-snapshots` codec budget (1, the scratch's own whole-scan string). The `usage-snapshot-failures` publication cases and the other `usage-snapshots` cases passed in the scratch but assert pages and are rewritten too. |
| Slice 3: batch writers send whole sessions | `grep -c writeUsageHistory`: each token-index spec and the e2e fixture store writes one batch per store. The specs that write a second, partial batch for a stored session (`usage-reconciliation`, `claude-completion-replay`) are in the rewrite set above. Not run under replacement; slice 3's family run is the observation. |
| Slice 4: conversion reads the real store in bounded time | The read-only measuring script parsed every referenced page raw in 17.9 s wall. A proxy for the conversion's read: it skips schema validation, as `unvalidatedValues` does, which the conversion uses for the same reason. |
| Slice 5: seeing that no rollout changed is fast | `find ~/.codex/sessions ~/.codex/archived_sessions -type f` listed 13,304 files in 0.13 s. A proxy for `nativeUsageFiles` plus `stat`. Unverified: the time `launchCatalog` and reading the history take inside Refresh; slice 5's real-clone observation measures the whole Refresh. |

## Outside-in proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| An import can write the responses it read | 1 | usage-history family reads responses from that file |
| Same tasks, Token index values, filters, coverage, "Outcome unknown" | 2, 3 | `token-index*.spec.ts`, `e2e/configuration/system-settings-usage*.spec.ts` unchanged |
| No per-response row stored; counted once across rereads, writers and files | 3 | new contribution spec; rewritten replay specs |
| Evidence removed keeps totals; moved rollout counted once | 3 | new contribution spec |
| Worker and second task; conflicting measurements | 3 | existing `codex-usage`, `codex-coverage`, `usage-reconciliation` cases at totals level |
| Withdrawn and regained assignment without native files | 3 | `recovered-assignment-*` at task level |
| Growth under 10 KB per task | 3 | new contribution spec |
| Importer result and `read` | 3 | `import-report*.spec.ts`, `usage-snapshots.spec.ts` |
| Conversion carries everything and removes `usage.json.pages` | 4 | new conversion spec; real-clone observation |
| Failed or interrupted conversion keeps the earlier history | 4 | conversion spec with injected failure |
| 25 MB budget on the real evidence | 4 | real-clone observation |
| Nothing new writes nothing; under 2 s | 5 | new repeated-check spec; real-clone observation |
| New responses add exactly | 5 | repeated-check spec |
| `USAGE-HISTORY.md` describes the history | 3, 4, 5 | each slice updates its part |
| `import-reports/2026-11-15/` removed, receipt updated | 4 | listing after removal; receipt diff |

Test placement follows the existing layout: backend variants in sibling specs
under `dashboard/backend-tests/usage-history/`, resolved through
[`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md). No frontend or
journey spec is added: the page's observable output does not change.

## Ordered slices

### 1. An import writes the responses it read to a named file
Type: Behavior
Status: done
Proof: `runImport` in `dashboard/tests/usage-history/importHarness.ts` names a
responses file and `readImported` returns tasks and gaps from `read` with
observations and associations from that file. The 45 tests the scratch showed
independent of stored rows pass on it with their assertions unchanged. The 12
that depend on stored rows keep reading them through a harness function named
for the stored rows, which slice 3 removes. One new case: after an import with
`--responses <file>`, the file holds each response once with its measurements
and the task the store resolved for it, including a response whose task was
withdrawn by a rejected assignment. Run the whole
`dashboard/backend-tests/usage-history` family.

Behavior: native evidence and launch records → `import --responses <file>` →
the file holds the scan's reconciled observations and their associations as
the writer resolves them (aliases, eligibility, contradictory lineage), and
the store is written as before. Move that resolution out of the partition
merge in `usageSnapshotReconciliation.ts` into one function both the writer
and the responses file use. Document the option in `dashboard/USAGE-HISTORY.md`.

### 2. The task summary derives from session contributions
Type: Structure
Status: done
Proof: `token-index.spec.ts`, `token-index-cohort.spec.ts`,
`token-index-detail.spec.ts`, `token-index-eligibility.spec.ts` and
`token-index-refresh.spec.ts` pass unchanged, and so do
`e2e/configuration/system-settings-usage*.spec.ts`.

Internal change: a contribution module builds session contributions from
observations and resolved associations, and resolves them to per-task usage
and coverage under the domain model above. `deriveUsageTaskSummary` reads the
paged store as today and produces its summary through that module, with
`TaskGaps` fed from contributions. External behavior is unchanged. It enables
slice 3, which stores what this slice computes.

### 3. The history stores session contributions and no response rows
Type: Behavior
Status: planned
Proof: new sibling spec for session contributions through the importer and
`read`: (a) after an import, `usage.json` is one `usage-history-v2` document
with no `usage.json.pages`, and no response id appears in it; (b) import
twice, then write the same sessions again through `writeUsageHistory`: every
task total is unchanged; (c) delete a task's rollout and import: the task
keeps its totals; (d) move a rollout from the live root to the archived root
and import: counted once; (e) a 400-response rollout for one new task grows
the document by under 10 KB. Rewrite at totals level, keeping each promise:
`claude-completion-replay` (terminal output settles progressive snapshots; a
reread with terminal evidence replaces the session's contribution; source
removal keeps it), `usage-reconciliation` (enrichment and conflicts give
unknown counters and their gap in the task's coverage, never a sum),
`recovered-assignment-evidence`, `-legacy`, `-replay` (a rejected assignment
withdraws the task's usage, a later genuine one restores it, both without the
native rows; a legacy or paged store is the starting point),
`recovered-corroboration` and `historical-task-references` (task facts after
source removal; response assertions move to the responses file),
`usage-snapshot-failures` (a failed replacement keeps the previous history
readable; cross-process writers both land under the lock) and
`usage-snapshots` (a legacy v1 and a paged store are read as the starting
history; `read` prints the document; the codec-budget case keeps its bound on
any single serialized string where one still applies, else is removed with
the paging it guarded). `import-report.spec.ts` and
`import-report-window.spec.ts` pass with response populations taken from the
scan. Run the whole usage-history family and
`e2e/configuration/system-settings-usage*.spec.ts`.

Behavior: any stored history (none, legacy v1, paged) and a batch → write →
tasks reconciled as today, gaps kept once, each batch session's contribution
replaced, others kept, one document replaced atomically under the lock, and
only when its bytes differ. `readUsageHistory` and `read` return the
document. `deriveUsageTaskSummary` reads it. The import result's task and gap
counts come from the history and its response populations from the scan. The
harness's stored-rows function goes. Delete the paged writer modules listed
under Replaced except the readers conversion needs. This slice leaves an
existing `usage.json.pages` directory on disk; slice 4 removes it. Update
`dashboard/USAGE-HISTORY.md`: the stored records, the writer contract ("pass
every response of each session read") and the removed per-response promises.

### 4. The first write shrinks an existing store to the budget
Type: Behavior
Status: planned
Proof: new conversion spec. A paged store written by the fixture pages of
`usage-snapshots.spec.ts`, with one extra unreferenced page file → a write →
tasks, gaps and task totals equal the paged store's, and `usage.json.pages`
is gone. With the page removal failing (the injection style of
`usage-snapshot-failures.spec.ts`), the new document is readable and complete
and the next write removes the directory. With the document replacement
failing, the paged store still reads as before. Real-clone observation,
following plan 630's method: APFS-clone
`~/.open-dough/dashboard/launch-history` into a scratch home, save the
derived summary's tasks, run this slice's Refresh against the clone with the
real `~/.codex` read in place, and compare: the same task ids and the same
usage groups per task, except tasks the Refresh itself changed; document size
at most 25 MB; no `usage.json.pages`. Record sizes and duration in Learnings.
The real store is not touched by the observation.

Behavior: a paged store with referenced and unreferenced pages → the first
Refresh or import → the history is the small document and the page directory
is removed after the document is durable; an interruption between the two
leaves a readable history and a directory the next write removes. Then, once
branch CI has passed, remove `~/.open-dough/dashboard/launch-history/import-reports/2026-11-15/`
from Terry's machine and change the
[recovery receipt](../../../docs/maintainer/usage-history-recovery-2026-11-15.md)
to say that evidence was removed with this story. Update the backup and
conversion paragraphs of `dashboard/USAGE-HISTORY.md`.

### 5. A check that finds nothing new writes nothing
Type: Behavior
Status: planned
Proof: new sibling spec for repeated checks, reusing the Refresh helpers of
`token-index-refresh.spec.ts` (248 lines; move `configureOpenDough`,
`finished`, `rootRows` and `usageServer` to a shared usage-history support
module rather than extending it). (a) Import, Refresh, Refresh: `usage.json`
bytes are identical after each Refresh and the chart's `checkedAt` moves.
(b) Import twice: identical bytes. (c) A finished task's rollout gains three
responses → Refresh: its totals rise by exactly those; Refresh again and
import: no value changes. (d) A session read from two files, one changed →
Refresh: each response counted once. Real-clone observation on the slice 4
clone: a second Refresh with no new rollout activity leaves the document's
digest unchanged and completes in under 2 s; record the time in Learnings. If
it exceeds 2 s, record where the time goes and return the figure to the
story before closing the slice.

Behavior: a converted history and no rollout activity since the last check →
Refresh → no store write, only the check record. Refresh reads every file of
a changed session, so the session's contribution is whole when replaced.
Update the Refresh sentence of `dashboard/USAGE-HISTORY.md`.

## Current decisions

- Execute in Story Branch Mode. No slice acts from trunk. The removal in
  slice 4 acts on Terry's machine, not on trunk, and waits for branch CI.
- The derived `usage-task-summary.json` and its process stay. Parsing the
  whole history per chart request on the server's event loop is the cost they
  avoid.
- Contributions keep candidate task ids, not a resolved task, so assignment
  corrections keep working without native files.
- A session contribution is replaced only when the batch holds a response of
  that session. A session read that now yields no response keeps its stored
  contribution, the same as a session whose files are gone.
- "Unchanged" is observed as document bytes.

## Learnings

- Execution: Story Branch Mode on `claude/keep-usage-history-within-a-small-disk-budget`,
  claim `5a97baeb3` accepted on `origin/main`.
- Slice 1 (accepted 2026-11-15; usage-history family 58 passed, the five
  `system-settings-usage*` e2e specs 5 passed, lint and typecheck clean):
  - Shared resolution: `usageResponseResolution(known)` in
    `dashboard/server/usageResponseResolution.ts` returns `{ tasks, alias,
    resolve }`; `resolve(association, observation)` applies alias, eligibility
    and contradictory lineage. The writer and the importer both call it.
  - Responses file: `UsageResponses = { observations, associations }` keyed by
    response id, written by `writeUsageResponses` (`usageResponsesFile.ts`)
    after the store write succeeds. The harness path is `responsesFile(home)`.
  - The stored-rows harness function is `readStoredRows(home)`. Its callers are
    11 tests in eight specs plus one line of `import-responses.spec.ts`; slice
    3 removes it. The split was 46 unchanged and 11 switched: the
    `usage-snapshots` codec-budget case passes on the responses file.
  - `readImported` returns no responses before the first successful import.
  - The file's associations come from this scan alone. A response charged by
    an earlier import and since rejected has its old candidate in the stored
    row and none in the file; both carry no task. Slice 3's contributions
    take candidates from the batch, so check that case there.
  - `dashboard/USAGE-HISTORY.md` is at 250 lines, and its options paragraph is
    wrapped at 100 columns to stay there. Slice 3 removes the paged-store text
    and returns that paragraph to the file's 80-column wrap.
- Slice 2 (accepted 2026-11-15; family 58 passed, five usage e2e specs passed
  on the final files, lint and typecheck clean; base and new
  `deriveUsageTaskSummary` gave a byte-identical summary over the real store,
  513 tasks, read-only):
  - Module `dashboard/server/usageContributions.ts`: `collectContributions()`
    returns `{ sessions, add(observation, association) }`;
    `resolveContributions(sessions, tasks)` yields `{ sessionId, entry, taskId,
    candidates }` and needs every task record of the history, not only the
    dashboard's. `SessionContributions` is keyed by `sessionKey` and is plain
    JSON, storable as the document's `sessions`.
  - An entry is `{ candidates, unresolved?, model, effort, tier, responses,
    tokens, missing, unmeasured, lastAt }`. Contradictory lineage is part of
    the entry key and sets `unresolved: true`.
  - For slice 3: a session whose batch responses all lack candidates builds no
    contribution, so delete the stored key of every batch session before
    merging. `add` stores candidates as given; alias them before `add` for
    stable bytes. Sessions and entries are in first-seen order; sort them when
    serializing. `storedContributions` in `usageTaskSummary.ts` is the last
    paged-store coupling in the summary. `resolve` can take
    `Pick<UsageAssociation, "taskId" | "candidates" | "gaps">`, which removes
    the placeholder association in `resolveContributions`.
  - `usageTokenCategories` in `usageRecords.ts` is the one list of the four
    token categories.

## Verification, sizing and concern review

- Local gate per slice: the touched specs and their consumers with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config <config> <paths> --reporter=list`.
  - Every slice: `dashboard/backend.playwright.config.ts` with the whole
    `dashboard/backend-tests/usage-history` family (57 tests, 39 s observed),
    because each slice changes the writer, the harness or the summary that
    every usage-history spec consumes.
  - Slices 2–5: also `e2e/playwright.config.ts` with
    `e2e/configuration/system-settings-usage*.spec.ts`, whose fixture store
    writes through `writeUsageHistory`.
  - Every slice: `npm run lint` and `npm run typecheck:dashboard`.
  - A fresh worktree needs `node scripts/setup-native.mjs npm` and `browser`
    first.
  - No whole local suite is required. Hosted CI runs the full suites after
    publication.
- Long local runs follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC use `caffeinate -s -i`; on battery plug in, or run awake with the lid
  open under `caffeinate -i` and read the sleep log afterwards.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written, including local/CI differences and owned CI repair.
- File size: no expected edit touches a file over 250 lines. The largest are
  `token-index.spec.ts` (249) and `token-index-refresh.spec.ts` (248), which
  are not extended, and `usageSnapshotReconciliation.ts` (220), which shrinks.
  New proof goes in new sibling specs.
- Cumulative design: one model, the session contribution, is computed in
  slice 2, stored in slice 3, produced from an old store in slice 4 and left
  untouched by an idle check in slice 5. Slice 1 gives responses their one
  remaining observation point. No slice adds a second stored representation.
- Refinement: not needed. Five slices, each with one outcome and one proof
  loop; slice 2 is the only preparation and directly precedes the Behavior it
  enables.
- Sizing: slice 3 is the largest, because nine specs change their observation
  from response rows to task totals in the same change that removes the rows.
  They share one proof loop, the family run. If it overruns, the split is by
  spec group after the store change is green for the new contribution spec:
  the recovered-assignment group, then the snapshot and failure group.
- Remaining slice-specific concerns: none identified beyond that sizing note.
  The under-2-s figure in slice 5 is that slice's proof on the real clone, not
  a premise other slices depend on.
