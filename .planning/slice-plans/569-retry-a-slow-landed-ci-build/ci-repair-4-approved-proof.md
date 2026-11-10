# Approved thirteen-shard CI repair proof

## Implemented outcome

Continued the same owned CI repair 4 after Terry explicitly approved thirteen dashboard shards on 2026-11-11. Applied the exact stored eight-path proposal from `.planning/slice-plans/569-retry-a-slow-landed-ci-build/thirteen-shards-proposal.json` on current published base `2b88d2d64de658e805d08aabe90277a4f209f0b7`, branch `codex/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`, in the selected execution checkout. Verified both recorded and computed patch SHA256 equal `80311b9fbb9995010c9be6d47222329b518060915716a4d4da08f3830ef9e627`, ran `git apply --check /tmp/seed285-ci-repair4-approved.patch`, then applied it. Actual eight after-images equal the previously proved candidate byte for byte.

Added a seven-line provenance note to `docs/maintainer/dashboard-weight-timings.md`: Terry's 2026-11-11 thirteen-shard authorization supersedes the earlier twelve-count constraint, with links to current shard guide/workflow. Removing only this added paragraph reproduces the complete historical document byte for byte, including all October measurements, its rejected allocation and former twelve-way constraint. No historical result was rewritten.

The dashboard matrix and all three dashboard summary declarations now use thirteen. Existing dynamic job names, split variables and fragment totals take `strategy.job-total`, so they follow the same matrix. Current shard guide and test-root READMEs agree. Actual-workflow action replays and exact-once allocation assertions agree with thirteen. The independent synthetic wrong-revision frontend case intentionally retains its explicit twelve-part input; it does not read the workflow count.

All 977 Playwright spec files, their test definitions, native project identities, private fixture lifetimes, CPU-derived worker setting (four in retained hosted evidence), 320-second shard deadline and six-minute job limit are preserved. No duration list was refreshed. No new optimization was attempted; the rejected Zod prototype remains restored and external.

## Actual owned paths

| Path | Changed boundary | Lines |
| --- | --- | ---: |
| `.github/workflows/ci.yml` | Thirteen matrix jobs and matching dashboard proof-part declarations | 250 |
| `dashboard/backend-tests/README.md` | Current shared CI count | 32 |
| `dashboard/frontend-tests/README.md` | Current shared CI count | 24 |
| `dashboard/tests/shards.md` | Current count, preview and complete-run artifact instructions | 111 |
| `docs/maintainer/dashboard-weight-timings.md` | Dated human authorization, preserving earlier evidence | 151 |
| `tests/support/ci-proof-actions.test.mjs` | Actual-workflow missing-part expectations through thirteen | 140 |
| `tests/support/ci-proof-frontend-report-support.mjs` | Expected totals for actual dashboard producer replay | 31 |
| `tests/support/ci-proof-frontend-report.test.mjs` | Present-zero and missing actual-producer report totals | 231 |
| `tests/support/dashboard-test-files.test.mjs` | Thirteen-way actual spec/native-project allocation proof | 220 |

Diff is nine files, 24 insertions and 17 deletions, all <=250 lines. No other writer's paths were touched. No commit, push, format, lint, planning/DearDough edit, stash operation or observer command was performed. The planning proposal record remains coordinator-owned, including its old pending status.

## Fresh actual-checkout proof

Host before proof: macOS, AC 100%, load 1.51/1.40/1.51, 67% free memory, fully awake; bounded sleep-log read shows no new sleep since the retained 2026-11-07 wake. No named competing local native/browser workload appeared. Node 24.21.0 and existing package/lock/setup remain unchanged. Maintained macOS guard was `caffeinate -s -i` on AC. Only four named native checks ran; no browser or full suite was launched.

```sh
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_TIMES=/tmp/seed285-ci-repair4-approved-native-times.txt OPEN_DOUGH_TEST_OUTCOMES=/tmp/seed285-ci-repair4-approved-native-outcomes.txt caffeinate -s -i npm test -- tests/support/dashboard-test-files.test.mjs tests/support/ci-proof-declaration.test.mjs tests/support/ci-proof-actions.test.mjs tests/support/ci-proof-frontend-report.test.mjs
```

Result: terminal exit 0. The maintained runner explicitly records all four selected files as passed. Per-file retained times: dashboard-test-files 0.6s, frontend-report 0.5s, actions 0.2s, declaration 0.1s (parallel file timings, not a wall-time claim). Log `/tmp/seed285-ci-repair4-approved-native-proof.log`; outcomes/timings are the absolute paths in the command.

Observed assertions and setup:

- `tests/support/dashboard-test-files.test.mjs`, “the thirteen CI shards match every actual dashboard spec exactly once…”: discovers actual specs, passes each real thirteen-way match and rejects duplicates/omissions; preview names an unrecorded spec in its actual receiving shard. “native projects queue production chains first…” proves the same complementary deployment/ordinary partition, with exactly one match per file. Existing scratch-directory cases preserve malformed-input, recorded/new duration, unsharded and empty-share semantics. Setup is the unchanged actual discovery/weights plus existing exact-input scratch helpers.
- `tests/support/ci-proof-declaration.test.mjs`, “the declared parts and units equal the matrix lengths…”: parses this actual workflow and compares summary expectations with actual matrix lengths and producer report units, in Intent location order. “every producer keeps its part's attempt-named fragments…” proves dynamic `strategy.job-total` wiring. Setup is existing `ci-proof-action-fixtures.mjs` reading actual workflow/action files and project Intent configuration.
- `tests/support/ci-proof-actions.test.mjs`, “Open Dough's CI publishes…”: executes the real fragment and summary action shell blocks against existing shared record fixtures; observes dashboard cases and Node files in separate units, all unreported parts 2–13 named missing, exact per-file outcomes/durations and valid combined summary. The failed/missing synthetic runner stays missing; no assertion was removed or weakened.
- `tests/support/ci-proof-frontend-report.test.mjs`: actual producer replay observes frontend pass/fail/other rows and their own times, excludes other roots from the frontend report, preserves combined summary, gives part 2 of 13 as present-zero and part 3 of 13 missing after an unfinished producer, and retains wrong-revision/wrong-attempt discrimination. Setup remains existing shared `makeMe.aDashboardProofRecord` / `aCiProofFragment` data and real action scripts.

No new domain test arrangement, sleep, test.slow, retry or timeout allowance was introduced. Failure policy remains [AGENTS.md#failing-and-flaky-tests](../../../AGENTS.md#failing-and-flaky-tests) as written.

### Preview and exact-once proof

```sh
node scripts/test-shares.mjs preview --split-count 13 --spec-dir dashboard
node /tmp/seed285-ci-repair4-approved-selection.mjs
```

Both terminal exit 0. Preview: `/tmp/seed285-ci-repair4-approved-preview.txt`; **977 specs, 960 recorded, 17 unrecorded at 9.6 seconds**, predicted job-seconds 948.3–957.9 per shard. These predictions do not establish hosted wall time or an observed performance gain.

Selection script/result `/tmp/seed285-ci-repair4-approved-selection.{mjs,json}` iterates the unchanged actual `dashboardTestProjects` for every twelve- and thirteen-way split, matches every discovered path, rejects duplicated or omitted files, compares sorted `(native project,file)` identities, and runs `git diff --exit-code` on all 977 spec paths against the published base. Result:

- Every spec exactly once at both counts.
- Identical native projects: 3 deployment specs and 974 ordinary specs.
- Every Playwright spec byte-identical to published base; therefore all of their test cases and assertions remain present.

`git diff --check` passes. Workflow worker/setup/deadline/trigger sections and product/TypeScript source are unchanged; only the approved matrix and declaration lines differ.

## Consumer trace and proof preservation

Reviewed the prior 26-consumer proposal trace, including count-bearing current docs and real producer replays. Fresh installed trace includes all nine actual changed paths plus effect terms, using:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base 2b88d2d64de658e805d08aabe90277a4f209f0b7 --term OPEN_DOUGH_DASHBOARD_SPLIT --term strategy.job-total --term missingAfterFirst --term shardCount --term 'thirteen CI shards' --term 'dashboard/tests=13:case' --term 'Part 2 of 13: present zero' --term 'Part 3 of 13: missing'
```

Full trace/dispositions: `/tmp/seed285-ci-repair4-approved-consumers.md`; machine-readable every-path dispositions: `/tmp/seed285-ci-repair4-approved-consumer-dispositions.json`. Every one of 233 located consumers has a disposition. Generic derived `README.md` / `ci.yml` names account for the broad remainder, rather than new count consumers. In particular:

- Actual fragment action, workflow parser/producer replay and dashboard allocation paths have fresh native/selection proof above. Changed files carry their observing assertions in the owned-path/proof sections.
- Split-clearing harnesses (`dashboard-repeat`, concurrent runs, proofRecordRun, local fixture environment) remove inherited values and do not consume a matrix total; presence-only full-suite admission retains independent synthetic 1/2 inputs.
- Production qualification and CI applicability read unchanged workflow names and push path policies, not the matrix or proof totals. Containers use unchanged OS/Node commands and deliberately unsharded dashboard execution. Acquisition/lint/deadline probes consume unchanged sections.
- Generic skill guidance already uses `strategy.job-total` or arbitrary i/n; installed copies are untouched. Other fixture/workflow names and historical measurements remain their own independent data.
- Planning/proposal/evidence records are retained and coordinator-owned; authorization status updates were not folded into this source change.
- The one new provenance boundary is the historical timing note; all historical bytes were independently checked as preserved after removing only the authorized addition.

The **85 cache/renderer cases**, **4 real reader/phone journeys**, and **dashboard typecheck** from the earlier combined-head return remain valid and were not repeated. Comparison `ed662ce8..2b88d2d` changes only four plan/evidence/proposal records; this actual patch changes no product TypeScript, renderer fixture, shared server/runtime, Playwright spec, dependency or worker configuration. Count changes are independently proved by the renewed actual native gate and selection check, and do not change those unsharded feature observations. Prior full details and literal commands remain `/tmp/seed285-ci-repair4-return.md`.

The coordinator supplied that twelve-way CI run 42855274347 on published 2b88d2 completed success. I did not read/poll it or treat it as disposing of the earlier shard deadline. The original failure remains accounted for as **216 = 209 passed + 7 deadline-skipped**, without an extra case assertion failure; thirteen is the expressly authorized capacity repair. The original Vite cache failure is separately repaired by accepted main cache isolation and retained affected proof.

## Handoff and gaps

All owned commands are terminal, including native gate exit 0 and handles 95395 / 2855. No owned browser, native benchmark or watch remains running. Nine uncommitted source/doc/test paths are left in place for independent refactor/review; no new metadata is written. Existing unowned stash and observer were untouched. Current source HEAD remains 2b88d2d64de658e805d08aabe90277a4f209f0b7.

No applicable thirteen-way hosted CI has run from this uncommitted change, and no wall-time improvement is claimed. Coordinator owns independent review, guarded publication, applicable CI completion and any delivered repair, then wrap-up. Incoming main's separately reported six-line dashboard-test-files change remains a later integration/reproof responsibility; this agent did not reconcile unrelated current-main changes.

IMPLEMENTATION COMPLETE


## Coordinator acceptance

Terry's explicit yes authorizes this count change. Root inspected the actual
nine-path diff and exact proposal/history preservation. Four native checks and
977-file exact-once/native-project observations are accepted; no case was removed.
Fresh independent return `/tmp/seed285-refactor-ci13-return.md` ends REFACTOR COMPLETE:
none — already clean, no edits/tests,278 consumers with dispositions. Its extended
trace retains every original233 consumer and follows the collector/report graph.
The existing85/4/typecheck proof remains valid. Original product advice stays
no change; CI allocation changes no delivered follow-up promise or ADR boundary.
Final thirteen-way hosted CI is owed to the coordinator's completion operation.
