# Simplify usage-history backend tests with MakeMe builders

**Identity:** SEED-362#simplify-usage-history-backend-tests
**Source:** [selected story](../../seeds/SEED-362-simplify-usage-history-backend-tests.md#simplify-usage-history-backend-tests)

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
Status: planned
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
Status: planned
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
