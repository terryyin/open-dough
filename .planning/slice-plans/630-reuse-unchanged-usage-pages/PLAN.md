# Keep usage task facts and freshness consistent across writers

**Identity:** SEED-357#reuse-unchanged-usage-pages-on-repeated-writes
**Source:** [correction story](../../seeds/SEED-357-dashboard-task-token-usage.md#reuse-unchanged-usage-pages-on-repeated-writes)

**Source review:** [source-only review](source-review.md)

## Source and provenance

Bounded retrospective correction of View token usage for dashboard-launched Codex tasks
(SEED-357#view-token-usage-for-dashboard-launched-tasks). Recover its story and plan 627 at
`103b321ea58cb461e91669658db184b24ba48ee3`, paths `.planning/seeds/SEED-357-dashboard-task-token-usage.md` and
`.planning/slice-plans/627-view-codex-task-token-usage/PLAN.md`. Execution was `81146589..8c8d35d4`; all five
slices passed branch CI. The earlier version of this plan, including the original page and tier findings, is
recoverable at `63964802b3ddb17133af0e05ee5325b5f0284ec5` at this plan's path.

## Goal and scope

For Terry, an import and Refresh agree on a launch task's workflow and leave unchanged evidence unchanged, while
Usage accurately shows when its history was checked and whether Refresh is still running.

Included: launch workflow precedence, normalization of previously stored skill spellings on launch tasks,
recovered-only workflow preservation, recovered fixture workflows, Checked after a later import, and checking
through filter changes and the Refresh's selected-cohort reread or failure.

Exclusions: storage representation, page reclamation, tier reconciliation, writer latency and budget measurement
belong to Keep usage history within a small disk budget. No tariff, import CLI or chart redesign. Its
session-contribution history replaces this plan's former page-stability slice; no page-file proof remains.

### Prerequisite and consuming contract

The small-history supplier is delivered (accepted at `03a69f1988ebab8c596a20dec52a333cc10ab48e`; dependency
`satisfied`). Its canonical `usage-history-v2` document of tasks, sessions and gaps replaces each read session's
contribution and leaves the document's bytes, inode and mtime unchanged when nothing in it changes. This plan
consumes that outcome through `writeUsageHistory(batch)`, the importer and the Token index boundary;
response-level `readImported` assertions are not part of this correction's proof. Proving alternating-writer
stability on that document is this story's work.

## Current findings

1. Import recovers a skill name after loading the launch catalog, and `mergeUsageTask` lets incoming workflow win. Refresh restores the launch's workflow id. The retrospective saw 370 affected Codex launch tasks; this is a pre-conversion count, not a claim about a later store.
2. `lastUsageCheck` prefers `usage-check.json` even when a later import changed the history. Checked therefore understates the evidence in the chart.
3. The cohort fetch's `.finally` in `SystemSettingsUsage` clears `checking`, even when Refresh is still pending.
4. The former `usageFixtureStore.finishedTask` gave recovered Refinement tasks `dough-execute-plan`. Shared `aUsageTaskHistory` now records the workflow's skill; the backend cohort case observes recovered Refinement.

## Preserved promises and genuine constraints

- Refresh reads changed rollouts with its existing cutoff and counts usage once;
  overlapping import and Refresh do not change totals for unchanged evidence.
- Launch workflow cohorts continue to accept workflow ids and recovered skill
  names. Launch evidence decides the launch's workflow; recovered evidence may
  fill a missing one. Recovered-only tasks retain their skill and attribution.
- A failed Refresh retains the chart and last successful check time beside a
  readable error; it ends checking. A filter change may load its chosen cohort.
- No database or new workflow authority, under
  [Accepted ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Local history remains under the supplier's atomic document replacement/lock.

## Existing solutions and direction

PFE: change the existing owners, rather than introducing parallel facts. `launchCatalog`, `canonicalUsageTasks`
and `mergeUsageTask` already reconcile launch and recovered tasks. Follow the launch precedence used for
`launchedAt` for workflow, including the missing-value fallback. `taskClaims` already maps workflow spellings
for conflict detection; `launchWorkflowOf` maps them for cohorts. Keep these responsibilities and correct the
comment if needed.

`launchWorkflows[workflow].skill` owns the fixture mapping. Intent's checked instants describe remote proof
retrieval, not usage imports, so they are not a replacement for `usageCheck.ts`. Compare the history
modification time with the check record's modification time to detect a later writer; otherwise return the
recorded Refresh start time. Comparing the history time only with that start would misidentify Refresh's own
later store write. Keep legacy check records, no-store fallback and the rollout cutoff behavior.

`SystemSettingsUsage` owns both fetch lifecycles. Keep Refresh pending distinct from a cohort read settling, and
clear checking only once Refresh and its current-cohort reread settle, or Refresh fails. Other Intent retrieval
states have different lifecycles; no shared refresh framework is warranted.

The ADR index and `.planning/NORTH-STAR.md` were read. No temporary topic governs this local correction and no
new consequential direction is needed.

## Key examples and outside-in proof ownership

| Final-state promise / example | Slice | Observation |
| --- | --- | --- |
| Execution and Refinement launches also recovered from directives → import, Refresh, import, Refresh → launch workflows and totals persist | 1 | stored tasks, byte-identical small history after the initial write, boundary cohort points |
| Existing launch stored with a skill workflow → first write normalizes it → subsequent writers leave bytes unchanged | 1 | inspect history tasks and bytes, plus Token index totals |
| Launch has no workflow → recovered skill fills it; recovered-only Refinement keeps its skill | 1 | imported tasks and Refinement cohort; recovered Refinement in the backend cohort case |
| Refresh at t1 → import adds a finished task at t2 → Checked reflects t2 → unchanged Refresh at t3 shows t3 | 2 | boundary `checkedAt` and tasks, history/check record times |
| No store, import before any Refresh, legacy check record and failed Refresh | 2 | null, history write time, own Refresh start time, retained successful time/error respectively |
| Held Refresh → choose Refinement and settle that cohort → still checking → release and settle its reread | 3 | chosen cohort content, checking note and disabled Refresh, then checked state |
| Held Refresh fails after a filter change | 3 | selected chart/check time retained, readable error and enabled Refresh |

Backend unit proofs start at the importer command and real usage HTTP boundary in
`dashboard/backend-tests/usage-history/`. Frontend unit proof mounts the real Usage page with backend responses
substituted at the service boundary. Reuse `systemSettingsUsagePage.ts` for browser operations. Existing E2E
Usage journeys in `e2e/configuration/system-settings-usage.spec.ts` remain the integrated proof; the backend
cohort case owns the recovered-refinement variation.

## Decisive premises and observations

Rechecked on 2026-11-15 at `c9225e89644060f33c86b25523f5c66044935a99`, after the supplier landed, by reading the
delivered sources: `mergeUsageTask` still lets incoming workflow win (`usageTaskReconciliation.ts`, `workflow:
incoming.workflow ?? old.workflow`) while `canonicalUsageTasks` now indexes records but merges through it
unchanged; `lastUsageCheck` still prefers the record; `usageRefresh.ts` still writes the history before
`recordUsageCheck`, and an unchanged write leaves the document's mtime as it was, so a record newer than the
document marks Refresh's own check; `SystemSettingsUsage`'s cohort `.finally` still clears `checking`. The
Claude corroboration assertion expecting `dough-execute-plan` moved to the second `expect` block of its first
case. The runtime observations below predate the supplier; none depended on paged storage.

Originally observed on 2026-11-15 at `63964802b3ddb17133af0e05ee5325b5f0284ec5` in this owned checkout, Node
24.21.0. Commands used one worker under `caffeinate -s -i` on AC; host load before launch was 28.92/23.59/16.37,
about 12,905 free and 35,204 speculative 16 KB pages. No full suite or real-store scan was launched. All scratch
edits were reverted before record writes.

Literal runner prefix for these observations: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u
GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test`; all appended `--workers=1
--reporter=list`.

| Consuming operation / premise | Form, result and limits |
| --- | --- |
| Slice 1: both writers disagree on workflow | Backend config, scratch `dashboard/backend-tests/usage-history/preparation-writer-consistency.spec.ts`; reused `token-index-refresh`'s boundary server, MakeMe launch/rollout and `runImport`. Rollout cwd was the configured project, with `$dough-execute-plan SEED-7#first`. Import → Refresh → import → Refresh stored `dough-execute-plan`, `execution`, `dough-execute-plan`, `execution`. Passed symptom observation in 12.4 s (runner 29.6 s). This is task reconciliation, unchanged by the supplier's storage unit; no v2 byte proof is claimed here. |
| Slice 1: precedence consumers | Scratch launch-first precedence in `mergeUsageTask`; backend config and `dashboard/backend-tests/usage-history`. 56 passed, 1 failed in 2.1 min. Sole failure: `recovered-corroboration.spec.ts`'s first case expected `dough-execute-plan`, received `execution` for a Claude executing launch. Slice 1 intentionally updates it, preserving its attribution and source-removal assertions. Other failures are not excused. |
| Slice 2: later import is in chart but hidden from Checked | Same backend scratch: second finished launch imported after Refresh `2026-11-15T04:18:04.322Z`; history mtime `04:18:06.510Z`, chart had 2 tasks but `checkedAt` stayed `04:18:04.322Z`. Record is still written after the history by `refreshUsageHistory`; the supplier retains that order. A single document's mtime serves the same write-order comparison as the current manifest. |
| Slice 3: filter read prematurely clears checking | Frontend config, scratch `dashboard/frontend-tests/preparation-usage-checking.spec.ts`: real Usage page, routed Token index answers and held refresh POST. After checking was observed, selected Refinement and observed its changed average (`2,450` vs `1,450`), then `showsChecked` passed while POST was held. 1 passed, 5.7 s (runner 9.6 s). Release completed the request. |
| Slice 1: fixture mapping and its observing consumer | Read `finishedTask`, `launchWorkflows` and all five `system-settings-usage*.spec.ts` setups/assertions. Execution recovered fixtures occur in trend/detail journeys; the cohort journey's Refinement fixtures are all launch tasks. None currently observes recovered Refinement. Slice 1 adds that missing discriminating case and verifies failure with the old mapping. |

Supplier publication, not this observation, establishes the v2 storage contract. That contract is now evidenced.
Its format changes storage below the inspected task merge and HTTP/UI contracts; the alternating-writer success
test is slice 1's delivery proof, not a claimed preparation result.

## Ordered slices

### 1. Launch and recovered tasks keep the right workflow across writers
Type: Behavior
Status: done
Proof: new sibling `usage-writer-consistency.spec.ts` imports Execution and
Refinement launches whose rollouts recover their corresponding skills. Run
import, Refresh, import, Refresh, including one rollout aged before the cutoff;
assert launch workflows, unchanged totals and identical history bytes after
the initial import. Add an existing launch stored with its old skill spelling:
one write normalizes it, later writes are byte-identical. Cover a launch with
no workflow and a recovered-only task. Observe cohort membership through the
HTTP boundary, not fixture-supplied normalization. Run the usage-history family.
Update the identified Claude assertion, keeping all its other promises.

Behavior: unchanged native evidence → either writer writes → launch workflow wins when present, recovered
evidence fills its absence, and recovered-only tasks keep their skills. The shared
`aUsageTaskHistory.recovered()` fixture now preserves each workflow's skill; `token-index-cohort.spec.ts`
observes recovered Refinement through persistence and cohort selection. Retain that discriminating case and run
the consolidated Usage E2E spec. Reuse `dashboard/tests/usage-history/tokenIndexHarness.ts` for project setup,
stored usage and HTTP operations; share remaining rollout setup only when needed. Update `USAGE-HISTORY.md` with
workflow precedence and alternating stability.

### 2. Checked reflects an import published after the last Refresh
Type: Behavior
Status: done
Proof: new backend `usage-check-freshness.spec.ts` uses the shared boundary and
import harness: import → Refresh → import a second finished launch → chart
contains it and `checkedAt` equals the later history mtime → unchanged Refresh
reports its own start time. Also cover no history, import without a record,
legacy `{checkedAt}` records, and the existing failed-Refresh preservation case.
Run the usage-history family and the Usage refresh E2E journey (which already
observes the shown instant through `showsCheckedAt`).

Behavior: a valid check record and a later history write → read Usage → Checked reflects the later write;
otherwise it reflects that Refresh's recorded start. Keep `refreshCutoff` unchanged, including its timestamp
granularity allowance. Update `usageCheck.ts`'s header and the freshness text in `USAGE-HISTORY.md`.

### 3. Checking survives a filter change until Refresh settles
Type: Behavior
Status: done
Proof: new frontend `system-settings-usage-checking.spec.ts` holds the Refresh
POST, changes Launch workflow, and waits for distinct selected-cohort content.
`showsChecking` still holds. Release success, hold its selected-cohort reread,
and keep checking until that answer settles; then `showsChecked`. A failure
variant retains that cohort's chart/check time and shows its error while
ending checking. Confirm discrimination against the old cohort `.finally`.
Run this spec, frontend `system-settings-usage.spec.ts`, and the refresh E2E
journey. No sleeps, timeout increases or `test.slow()`.

Behavior: Refresh in progress → cohort changes/read completions → those reads cannot finish Refresh's checking
state. Success settles the current cohort's reread before enabling Refresh; failure ends checking beside its
readable error.

## Current decisions, verification and concern review

- Story Branch Mode; no slice acts from trunk. Safe stopping points are the
  three independently proved corrections; no intermediate CI-breaking delivery.
- Every test source selects MakeMe. Browser sources select page objects;
  backend sources do not. Resolve actual new paths with the installed selector
  before authoring. Keep expected bytes/times and held transport outside builders.
- Before acceptance, run the installed consumer trace with the changed effect
  terms `workflow`, `checkedAt` and `Checking Codex rollouts for new usage`;
  inspect enclosing assertions and disposition every consumer. The families
  above are the minimum owned proof, not a limit on newly affected consumers.
- Local gate: each slice's focused specs and consumers above, `npm run lint`
  and `npm run typecheck:dashboard` for the shared test helpers and changed TS
  contracts. Runner form is the observed prefix above with `--config
  dashboard/backend.playwright.config.ts`, `dashboard/frontend.playwright.config.ts`
  or `e2e/playwright.config.ts` and the named paths. A fresh checkout first runs
  `node scripts/setup-native.mjs npm` and `browser`.
- Long local gates follow the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC `caffeinate -s -i`; on battery plug in, or run fully awake with lid open
  under `caffeinate -i` and read the sleep log afterwards. Choose concurrency
  from current host headroom; the scratch observations used one worker.
- [Failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written to local tests and owned CI repair. Hosted CI runs full
  suites after publication; no whole local suite is required by this plan.
- Expected edited files fit 250 lines at `c9225e89`: task reconciliation 138,
  check 82, Usage component 133, corroboration spec 182, Refresh spec 135,
  `tokenIndexHarness.ts` 186 and Usage page object 201.
- Cumulative design: task precedence stays in reconciliation, write freshness
  in its existing reader, and pending UI work in the component. Each slice has
  one proof loop; none recreates the supplier's response or paging machinery.
- Refinement: not needed; the stale storage slice was removed during planning
  and the three remaining Behavior slices each own one bounded correction.
- Remaining slice-specific concerns: none identified. The supplier dependency
  is satisfied. No numeric
  slice limit is supplied; implementation, focused proof and cleanup fit one
  cohesive loop per slice under the shared sizing rules.

## Execution context

Established Story Branch execution in this linked worktree:
`/Users/terryyin/git/open-dough/.worktrees/keep-usage-task-facts-and-freshness-consistent-a`, branch
`codex/keep-usage-task-facts-and-freshness-consistent-a`, reused at `95578800875568e449ea9394db88b1bb49d9e409`; starting revision
`689e125384e403c461df8d4eba5482fadec1ed1f`. Publisher `dashboard-territory.local-open-dough`, agent `viktor-chan`. Originating and execution checkout
are this worktree; optional integration/default checkout is `/Users/terryyin/git/open-dough`. Remote `origin`, authorized trunk `refs/heads/main`;
increments target the named story branch. Claim accepted on trunk and branch at `95578800875568e449ea9394db88b1bb49d9e409`; claim trunk CI is
unobserved. Replanning authority unchanged; no explicit no-replan restriction. Three slices fit the eight-slice cap, each 15 active minutes.

Checkout setup: Node 24.21.0; `node scripts/setup-native.mjs npm`, `browser` and `check` passed here against current package-lock. Chromium
158.0.8127.18. Selective formatter is `npm run format`; check-only pre-commit owns staged lint and dashboard typecheck. No generated skills/artifacts
are implicated.

CI observer: GitHub Actions `ci.yml` (verified workflow 351271804, name CI), repository `terryyin/open-dough`, target the story branch above,
coordinator `seed357-consistency`, directory `/tmp/dough-ci-501/watch-z2Qww5`, PID 57934, stream session 71145, yielded cell `g363:13`, launched from
this exact checkout. Host is Codex. Integrated-state completion follows the checked-in declaration.

Expensive-proof decision: local host on AC, load 6.27/5.24/6.69 at setup; run only focused planned families serially with one worker under `caffeinate
-s -i`; do not run a whole local suite. No competing proof is owned by this coordinator. Implementation/refactor owners must recheck headroom before
heavy launches; reconsider for host contention or unexpectedly slow proof.

## Story obligations

### G1. Observe the selected cohort check time distinctly
Reported: slice 3 — "Acceptance found the failure fixture uses the same check time for Execution and Refinement, so it cannot distinguish preservation of the selected cohort time."
Story clause: "shows its failure beside the previous chart and check time"
Disposition: proved by slice 3: system-settings-usage-checking.spec.ts failure now supplies selectedCheck09:30 distinct from Execution09:00 and showsCheckedAt(selectedCheck) before and after POST failure; 2 cases passed 4.0s
Commitment: 6l
