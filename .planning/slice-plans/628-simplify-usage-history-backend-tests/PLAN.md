# Simplify usage-history backend tests with MakeMe builders

**Identity:** SEED-362#simplify-usage-history-backend-tests
**Source:** [selected story](../../seeds/SEED-362-simplify-usage-history-backend-tests.md#simplify-usage-history-backend-tests)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer reading a usage-history backend test sees only the native session
facts that case proves. Codex rollouts and Claude transcripts come from MakeMe
builders. Cases stop importing the harness `at`. Overlapping cases collapse
without losing a distinct behavior check. The story's Goal, Scope and Key
examples are the contract; this plan does not restate them.

Exclusions: dashboard product code; other backend families; paid native-host
helpers under `Distribution/tests/support/native-codex-session*.mjs`; any paid
native rerun.

## Existing solutions and direction

- **MakeMe entry and convention.** Builders join `Distribution/tests/support/makeMe.mjs`
  through a domain module, like `launchMakeMe.mjs` does, typed with `@ts-check`
  and JSDoc type-only imports, as `usageHistoryTestData.mjs` already does for
  `UsageTask`. They import no dashboard runtime module
  ([test data architecture](../../../Distribution/tests/test-data-architecture.md)).
  Adding modules to makeMe's import closure changes native evidence identity,
  as every builder change does; `native-evidence-identity.sh` must stay green.
- **Harness boundary.** `dashboard/tests/usage-history/importHarness.ts` keeps
  the filesystem, process and import window (`--since 2026-09-16T00:00:00+08:00`).
  It gains a writer for a built session; `nativeFile` stays for layout under
  proof. `retainedUsageTest.ts`'s `launch`, `meta`, `context` and `response`
  helpers become builder operations. `historicalReferenceHarness.ts` keeps Git
  and configuration and its `recordHistoricalTask` rows come from the Codex
  builder.
- **Timestamps.** The builders' incidental default stays
  `2026-11-14T10:00:00.000Z`, inside the window, the value the baseline passes
  with. The usage-history launch helper keeps an in-window `launchedAt`
  because `aLaunchRecord`'s default (2026-01-01) falls before the window.
- No North Star topic or ADR is involved.

## Decisive premises and observations

| Consuming operation / premise | Observation and limits |
| --- | --- |
| The family's focused proof route runs green in this workspace and form | At `75912ec19` in this workspace, with the integration checkout's matching `node_modules` symlinked: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list` → 47 passed in 77 s, load average 14–20. |
| Starting size the final count compares against | Same revision: 28 specs, 4,481 lines (`cat … \| wc -l`), 47 tests as Playwright lists them, 74 `nativeFile(` calls, 18 specs importing `at`; 237 helper lines under `dashboard/tests/usage-history/`. |
| No other test family builds these native rows or references the family's files | `git grep` at `75912ec19` for `token_usage_record`, `session_meta`, `ephemeral_5m` and the family paths: only this family, its helpers, server modules and the paid native-codex helpers. No CI, runner list or document names a family spec file, so regrouping files needs no wiring. |
| Builders may type against production shapes without runtime imports | `usageHistoryTestData.mjs` typedef-imports `UsageTask` from `dashboard/server/usageRecords.ts`; `dashboard/tsconfig.node.json` includes `tests` and `backend-tests`, so specs pull the builder modules into `npm run typecheck:dashboard`. |

## Outside-in proof ownership

Every slice proves the story's examples on its own group of specs:

1. **Inventory before change.** Before editing, list in this plan each starting
   test of the group with its distinct behaviors, as its assertions observe
   them, and the surviving test that keeps each one. A behavior is distinct
   when no other test observes the same product rule under an equivalent
   setup.
2. **Moved assertions still discriminate.** When a behavior's surviving
   assertion sits on materially different setup from the case that proved it,
   break that product rule in a scratch edit in this workspace, run the
   surviving test, record its failure, and revert.
3. **Family green.** The whole family passes with the focused command above. It
   runs within focused time, so each slice runs the whole family, not only its
   group.
4. **Concision is observable.** The group's specs import no `at`, use
   `nativeFile` only for layout under proof, and the slice records the group's
   before and after lines and tests.

Assertions that only restate builder output are not added
([test automation](../../../AGENTS.md#test-automation)).

| Story promise | Owning slice and proof |
| --- | --- |
| Codex own response example; damaged evidence stays visible | Slice 1 inventory, family green, spec reading |
| Claude streaming and worker join example | Slice 2 inventory, family green, spec reading |
| Time under assertion stays explicit | Slice 1 (`earlier` response) and slice 2 (`lastAt`) |
| Consolidation keeps behavior | Each slice's inventory and scratch-break records |
| Builder construction boundary, helpers and guide updated | Slices 1–2 builders; slice 5 harness, comment and guide |
| Measured result: fewer tests and lines, no `at` import, `nativeFile` only for layout | Slice 5 final count and grep |

## Ordered slices

### 1. Codex import and persistence cases read as their facts
Type: Behavior
Status: done
Proof: inventory and scratch-break records for the group; family green; the
group's specs import no `at` and build rollouts through `makeMe`.

Behavior: the Codex specs (`codex-usage`, `codex-coverage`, `retained-usage`,
`usage-reconciliation`, `usage-persistence`, `usage-snapshots`,
`usage-snapshot-failures`; 1,175 lines, 16 tests) build rows by hand → a
Codex rollout builder supplies session meta, turn context, response rows and
in-window timestamps, the launch helper moves onto builder defaults, and
overlapping cases merge → a developer reading a case sees the session, turns,
responses and counters it asserts. Truncated or unsupported rows and the
`.zst` archive layout stay literal.

### 2. Claude import cases read as their facts
Type: Behavior
Status: done
Proof: as slice 1 for its group; the transcript builder supplies the
launch-input, attachment and `uuid`/`parentUuid` chain.

Behavior: the Claude specs (`claude-usage`, `claude-coverage`,
`claude-completion`, `claude-completion-replay`, `claude-lineage-size`,
`returned-outcome`; 1,117 lines, 11 tests) build `user`/`assistant` role rows
by hand → a Claude transcript builder supplies role rows, reporting context
from the launch, worker sidechains and defaults → each case names its streamed
usage, workers, completion evidence or returned outcome. The `subagents/`
directory layout stays visible where it is under proof. The long-chain memory
case keeps its own test.

### 3. Recovered-assignment cases read as their facts
Type: Behavior
Status: planned
Proof: as slice 1 for its group.

Behavior: the six `recovered-assignment-*` specs (589 lines, 8 tests) build
Codex rows and launches by hand → they use the slice 1 builder, and cases
proving the same eligibility rule merge → each case states the wrapper,
genuine input, retained launch or publication failure it proves.

### 4. Recovered and historical task cases read as their facts
Type: Behavior
Status: planned
Proof: as slice 1 for its group.

Behavior: `recovered-tasks`, `recovered-boundaries`,
`recovered-corroboration`, `recovered-gaps` and the three `historical-*`
specs (1,314 lines, 10 tests) build rows and historical tasks by hand →
`recordHistoricalTask` and the cases use the builders, and overlapping
replay or source-removal checks merge → each case states the repository,
revision, reference or project join it proves.

### 5. The family is measurably shorter and documents its builders
Type: Behavior
Status: planned
Proof: final counts against the starting size; `git grep` shows no `at`
import from the harness and `nativeFile` only in layout cases; family green;
the guide names the builders.

Behavior: `import-report` and `import-report-window` (286 lines, 2 tests) and
any family spec trunk gained since Take, such as SEED-357's, still use the
harness default → they move to the builders, the harness stops exporting
`at`, `usageHistoryTestData.mjs`'s comment and the test data architecture
guide describe the native-session builders → the family has fewer tests and
lines than 47 and 4,481, recorded in this plan.

## Current decisions

- Default incidental time is `2026-11-14T10:00:00.000Z`; cases state a time
  only when they assert it or place it outside the window.
- Each consolidated spec stays within the 250-line file-size check, grouped by
  concern. No family file is over the limit today (largest: 250 lines).
- SEED-357 is Taken and may add specs to this family. Slice 5 merges trunk
  first and migrates whatever family specs trunk holds; specs that land later
  follow the builders already on trunk.
- No local whole suite is required. Hosted CI runs the full suites after
  publication.

## Story obligations

### G1. Harness still exports at for unmigrated family
Reported: slice 1 — "Temporary: harness still exports at (aliased to usageHistoryDefaultAt) for family specs not yet on builder defaults."
Story clause: "Its default timestamp is no longer exported to cases."
Disposition: interim until slices 3, 4, 5
Commitment: 11

### G2. Temporary meta/context/response helpers remain
Reported: slice 1 — "Temporary row helpers meta/context/response remain for family specs not yet on makeMe.aCodexRollout; Codex-group cases call the builder."
Story clause: "Codex rollouts and Claude transcripts, with their user, assistant, worker and session-meta rows, come from MakeMe builders whose defaults keep the data valid, including in-window timestamps."
Disposition: interim until slices 3, 4, 5

## Slice 1 inventory (Codex group)

Starting size for this group (before edits): 7 specs, 1,175 lines, 16 tests
as Playwright lists them (including the parameterized page/manifest pair as
two). Grouping after migration: keep `codex-usage` and `codex-coverage`
separate (a single merged file exceeded the 250-line check), plus
`retained-usage`, `usage-reconciliation`, `usage-persistence` (isolation only),
`usage-snapshots`, `usage-snapshot-failures` (publication + concurrency, with
the former persistence atomic-fail case folded in).

| Starting test | Distinct behaviors (as assertions observe) | Surviving test |
| --- | --- | --- |
| `codex-usage`: attributes own responses and explicit descendants across compressed archives and successive task turns once | Own response charged with uncached/cache-read/write/output components; successive root turns charged separately; out-of-window response excluded (`2026-09-15T15:59:59.000Z`); explicit worker + grandchild descendants charged via parent chain and `root_turn_id`; `.zst` archive measurement source; unrelated turn responses stay observed; ambiguous worker → `unresolved-task-association`; root measurement source path; import idempotence on this archive setup | `codex-usage`: same title; idempotence kept here (archive setup is not equivalent to retained-usage) |
| `codex-coverage`: keeps independent responses through damaged files and reports unsupported, missing and incomplete native evidence | Truncated JSONL → `malformed-native-row`; unsupported `token_count` event not charged; spawn without worker file → `missing-worker-evidence`; incomplete child meta-only → `incomplete-worker-evidence`; bad `.zst` → `native-source-unreadable`; absent root → `native-source-unavailable`; `last_token_usage` only → `unsupported-response-counters` and null output; partial path response counted with `missing-session-metadata`; valid damaged-file responses still sum | `codex-coverage`: same title |
| `codex-coverage`: refuses contradictory parent lineage instead of charging a worker to a task | Contradictory spawn vs `parent_thread_id` → `contradictory-lineage`, null association, task uncharged | `codex-coverage`: same title |
| `retained-usage`: persists operational and retained launches, disjoint counters and changed observed settings across fresh reads and reruns | Operational + retained launches both become tasks; requested model/effort; disjoint token components including reasoning; changed observed model/effort across `turn_context`; duplicate response rows count once; partial coverage / `missing-token-components`; `taskUsage` aggregation; import idempotence; history survives native-root removal | `retained-usage`: same title |
| `retained-usage`: keeps unavailable usage unknown and fills the gap when native response evidence becomes available | `no-attributable-response-usage` and null output with meta-only; gap clears and `output: 0` counts once evidence appears | `retained-usage`: same title |
| `usage-reconciliation`: enriches partial measurements, reconciles a collector replay and retains conflicting facts without increasing totals | Partial → enriched counters on reimport; collector replay restores requested settings without raising totals; contradictory measurements null conflicting components and keep both reports | `usage-reconciliation`: same title |
| `usage-reconciliation`: keeps conflicting observed settings and lineage evidence without selecting a winner or double charging | Conflicting models → undefined model, kept effort, `contradictory-observed-settings`; same `response_id` on different turns → null association + `contradictory-lineage`; single observation | `usage-reconciliation`: same title |
| `usage-persistence`: preserves prior readable history on failed persistence and retries once | Injected `usage.json` rename failure exits 1 with stderr; prior history unchanged; retry adds the new response once; second rerun stays put | `usage-snapshot-failures`: `${failure}` publication failure… (manifest case covers rename of `usage.json`; page case remains distinct). Scratch-break required if setup drift is material. |
| `usage-persistence`: ordinary operational reads and writes never open native usage or imported history | Launch store read/replace never touches `launch-history` usage paths or `.codex/` | `usage-persistence`: same title (sole remaining case in that file) |
| `usage-snapshots`: legacy v1 facts migrate without losing evidence and survive removal of native inputs | v1 document migrates retained title/gap; new import adds alongside; prior observations/associations intact; survives native removal | `usage-snapshots`: same title |
| `usage-snapshots`: actual import and fresh export retain all records when whole-history strings exceed the codec budget | 300 responses import/export under bounded `JSON.stringify`; associations intact; source file/line present; rerun equal | `usage-snapshots`: same title |
| `usage-snapshots`: an earlier paged snapshot and reordered gap replay retain one equivalent coverage fact | Old paged wire migrates one gap; reordered write collapses to one equivalent fact | `usage-snapshots`: same title |
| `usage-snapshot-failures`: page/manifest publication failure keeps the previous snapshot readable and retry retains each response once | Injected page or manifest rename failure; prior readable; broken orphan pages ignored; retry keeps each response once | `usage-snapshot-failures`: same titles (plus folded persistence atomic-fail observations on the manifest path) |
| `usage-snapshot-failures`: a reader holding the earlier manifest stays coherent while another process publishes | Held-open snapshot still shows prior responses while a concurrent import publishes newer ones | `usage-snapshot-failures`: same title |
| `usage-snapshot-failures`: cross-process writers reconcile accepted updates after waiting for the shared publication lock | Two imports under lock wait both land; one task id; both responses | `usage-snapshot-failures`: same title |

Scratch-break records (when a moved assertion sits on materially different setup) live under
`.planning/slice-plans/628-simplify-usage-history-backend-tests/slice-1-scratch-breaks.md`.

### Slice 1 concision (Codex group)

| Metric | Before | After |
| --- | --- | --- |
| Spec files | 7 | 7 (`codex-usage` / `codex-coverage` kept separate for the 250-line check) |
| Lines (`wc -l`) | 1,175 | 1,187 (Prettier wrap on builder chains; net readability via builders) |
| Tests (Playwright list) | 16 | 15 (persistence atomic-fail folded into snapshot-failures) |
| `at` imports in group | via helpers | none |
| `nativeFile(` in group | many | 3, all layout under proof (`.zst` archive path, partial path, empty broken file) |

Family after slice 1 focused run: **46 passed** (was 47).

## Slice 2 inventory (Claude group)

Inventory and concision for this group live in
[slice-2-inventory.md](./slice-2-inventory.md).

## Verification, sizing and concern review

- Local gate per slice: the family command in the premise table; `npm run lint`;
  `npm run typecheck:dashboard`; and, when a builder module changes,
  `bash scripts/test.sh Distribution/tests/native-evidence-identity.sh`. A
  fresh worktree needs `node scripts/setup-native.mjs npm` first. Long local runs
  follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  `caffeinate -s -i` on AC power.
- Failing and flaky tests follow the project's
  [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests),
  carried as written: a failing or flaky test is a defect to fix, a failure
  reproduced on trunk is attribution, not an exemption, and CI failing on a
  revision this execution published is this execution's to repair.
- Sizing: each slice is one group of 2–7 specs, one builder concern and one
  proof loop of about 80 s. Slices 1 and 2 also create a builder.
- Slice-plan refinement was not needed: the slices already split by builder
  and concern, each with one proof loop, and no plan concern remains.
- Remaining concerns: none identified in this review.
