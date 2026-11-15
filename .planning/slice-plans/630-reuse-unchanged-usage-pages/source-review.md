# Source-only review

Fresh reviewer: `/root/source_review`, launched with `fork_turns: none` through
`collaboration.spawn_agent` during this execution. Input: only the selected
correction’s Goal, Scope, supplier exclusions, key examples and genuine
constraints, reproduced in the launch message; no plan, product, proof or slice
scope. Reviewer read no project files and changed nothing. The returned numbered
commitments are retained below; repeated formulations were consolidated.

Qualifications: recovered evidence is fallback only for missing launch workflow.
Byte stability applies after initial normalization and to unchanged evidence.
The fallback examples preserve their source alternatives; their exact values are
not all specified by the story. Success and failure are alternative Refresh
outcomes. The failure journey retains the selected chart and time. “May load”
permits chosen-cohort loading without requiring a fresh read for every change.
Journey examples illustrate promises rather than limit their supported cases.
7a–7b are consumed supplier guarantees, 7c–7g are supplier-owned exclusions,
and 7h–7k explicitly preserve existing scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | A launch task has one consistent workflow regardless of whether import or Refresh wrote it last. | slice 1 | observed: usage-writer-consistency.spec.ts alternating writers: taskFacts after each writer |
| 1b | The importer stores the launch record’s workflow. | slice 1 | observed: usage-writer-consistency.spec.ts initial runImport taskFacts expectation |
| 1c | Refresh stores the launch record’s workflow. | slice 1 | observed: usage-writer-consistency.spec.ts usage.refresh followed by exact history bytes and taskFacts |
| 1d | Launch evidence decides a launch task’s workflow. | slice 1 | observed: usage-writer-consistency.spec.ts launch records plus conflicting recovered skill directives, expected execution/refinement |
| 1e | Recovered evidence fills a missing launch workflow. | slice 1 | observed: usage-writer-consistency.spec.ts missing launch workflow after runImport |
| 1f | Recovered-only tasks retain their recovered skill. | slice 1 | observed: usage-writer-consistency.spec.ts recovered-only Refinement workflow and HTTP task membership |
| 1g | Workflow cohorts accept workflow IDs. | slice 1 | observed: usage-writer-consistency.spec.ts HTTP execution/refinement cohort identities |
| 1h | Workflow cohorts also accept recovered skill names. | slice 1 | observed: usage-writer-consistency.spec.ts recovered Refinement HTTP cohort; token-index-cohort.spec.ts persisted recovered fixture |
| 1i | Recovered tasks in the usage fixture record the skill of their own workflow. | slice 1 | observed: token-index-cohort.spec.ts recovered-refinement in refinement cohort, backed by usageTaskHistoryTestData workflow mapping |
| 2a | After one normalizing write, alternating import and Refresh over unchanged evidence leave the small history’s bytes unchanged. | slice 1 | observed: usage-writer-consistency.spec.ts initial/normalized exact Buffer equality after alternating writers |
| 2b | Under those same conditions, task totals remain unchanged. | slice 1 | observed: usage-writer-consistency.spec.ts per-task output totals plus byte-identical history after every write |
| 2c | Overlapping import and Refresh leave totals unchanged when the evidence is unchanged. | slice 1 | observed: usage-writer-consistency.spec.ts overlapping refresh/import invocation preserves bytes/totals; usage-history-write-failures.spec.ts shared-lock cross-process writers |
| 2d | Refresh continues counting usage once. | slice 1 | observed: token-index-refresh.spec.ts changed roots/older workers and repeats; repeated-checks-evidence.spec.ts response increments |
| 2e | Refresh retains its existing rollout cutoff. | slice 1 | observed: usage-writer-consistency.spec.ts aged rollout after first Refresh; token-index-refresh.spec.ts cutoff and older workers |
| 3a | “Checked” reflects an offline import that wrote after the last Refresh. | slice 2 | observed: usage-check-freshness.spec.ts later import: chart.checkedAt equals history mtime and both task identities present |
| 3b | A subsequent unchanged Refresh displays that Refresh’s own check time. | slice 2 | observed: usage-check-freshness.spec.ts unchanged Refresh: chart.checkedAt equals returned Refresh start, history bytes unchanged |
| 3c | The named fallback cases preserve the applicable fallback or previous successful time. | slice 2 | observed: usage-check-freshness.spec.ts null/import/legacy boundaries; token-index-refresh.spec.ts failed Refresh preserves check-record and summary bytes |
| 4a | Changing a filter while Refresh is running keeps the checking indication active while Refresh remains unsettled. | slice 3 |  |
| 4b | The checking indication also persists until the selected-cohort reread settles. | slice 3 |  |
| 4c | If Refresh fails, the prior chart remains available. | slice 3 |  |
| 4d | If Refresh fails, the last successful check time remains available. | slice 3 |  |
| 4e | The failure appears as a readable error beside that chart and check time. | slice 3 |  |
| 4f | Failed Refresh ends the checking indication. | slice 3 |  |
| 4g | Refresh is enabled after the failure, as stated in the failure journey. | slice 3 |  |
| 4h | A filter change may load the chosen cohort. | slice 3 |  |
| 5a | Local history remains under the existing atomic document replacement mechanism. | slice 3 |  |
| 5b | Local history remains under the existing lock. | slice 3 |  |
| 5c | The correction introduces no database. | slice 3 |  |
| 5d | The correction introduces no new workflow authority. | slice 3 |  |
| 6a | Execution and Refinement launches recovered from directives → import → Refresh → import → Refresh: launch workflows persist. | slice 1 | observed: usage-writer-consistency.spec.ts alternating Execution/Refinement taskFacts expectations |
| 6b | The same journey preserves totals. | slice 1 | observed: usage-writer-consistency.spec.ts per-task output totals and unchanged history bytes |
| 6c | An existing launch stored with a skill workflow → first write normalizes it → subsequent alternating writers leave bytes unchanged. | slice 1 | observed: usage-writer-consistency.spec.ts exact legacy skill spelling, normalizing import then byte-identical writes |
| 6d | A launch with a missing workflow → recovered skill fills the missing value. | slice 1 | observed: usage-writer-consistency.spec.ts missing-workflow launch keeps recovered skill |
| 6e | A recovered-only Refinement task retains its skill. | slice 1 | observed: usage-writer-consistency.spec.ts recovered-only Refinement task and cohort membership |
| 6f | Refresh at t1 → import adds a finished task at t2 → “Checked” reflects t2. | slice 2 | observed: usage-check-freshness.spec.ts first Refresh then second finished launch import, HTTP tasks and later checkedAt |
| 6g | Continuing that journey with an unchanged Refresh at t3 → “Checked” displays t3. | slice 2 | observed: usage-check-freshness.spec.ts subsequent unchanged Refresh own checkedAt, exact history bytes retained |
| 6h | No store, import before any Refresh, a legacy check record, and failed Refresh exercise fallback/previous-successful-time behavior. | slice 2 | observed: usage-check-freshness.spec.ts fallback case and token-index-refresh.spec.ts unreadable-store failure; E2E Refresh shows prior successful check time |
| 6i | Hold Refresh → choose Refinement → settle the cohort load: checking remains active. | slice 3 |  |
| 6j | Release that Refresh → settle its selected-cohort reread: this supplies the remaining settlement boundary for checking. | slice 3 |  |
| 6k | Hold Refresh → change filter → Refresh fails: retain the selected chart. | slice 3 |  |
| 6l | In that failure journey, retain the selected check time. | slice 3 |  |
| 6m | In that failure journey, show a readable error. | slice 3 |  |
| 6n | In that failure journey, leave Refresh enabled. | slice 3 |  |
| 7a | The canonical session-contribution document. | slice 1 | observed: session-contributions.spec.ts one canonical document, consumed by writer-consistency readUsageHistory |
| 7b | Unchanged writes by the same writer. | slice 1 | observed: repeated-checks.spec.ts unchanged same-writer history remains identical; alternating-writer spec consumes same guarantee |
| 7c | Page stability. | slice 3 |  |
| 7d | Tier-on-reread reconciliation. | slice 3 |  |
| 7e | Conversion. | slice 3 |  |
| 7f | Disk reclamation. | slice 3 |  |
| 7g | Writer latency. | slice 3 |  |
| 7h | No tariff change. | slice 3 |  |
| 7i | No import CLI change. | slice 3 |  |
| 7j | No chart change. | slice 3 |  |
| 7k | No storage-format change. | slice 3 |  |

## Slice 1 acceptance

Source triggers (conflicting launch/recovered workflows, an old stored spelling,
missing workflow and recovered-only Refinement) match the inspected native/launch
setup and taskFacts, exact Buffer and HTTP cohort assertions in
`usage-writer-consistency.spec.ts`. Setup does not normalize the expected output.
The original merge failed the new first case; the correction passed. Existing
Claude attribution/source-removal and recovered Refinement fixture proof survive.
No source gap; slice 2 owns Checked and slice 3 owns pending UI behavior.

Commands (all terminal passes, this exact checkout, one worker on AC):
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/usage-writer-consistency.spec.ts dashboard/backend-tests/usage-history/recovered-corroboration.spec.ts dashboard/backend-tests/usage-history/token-index-cohort.spec.ts --workers=1 --reporter=list` — 5 passed, 6.0s.
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --workers=1 --reporter=list` — 72 passed, 1.3m.
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config e2e/playwright.config.ts e2e/configuration/system-settings-usage.spec.ts --workers=1 --reporter=list` — 2 passed, 7.7s; real-store cohort/trend/detail and Refresh success/failure observations inspected.

Consumer trace: `/tmp/seed357-slice1-consumer-trace.md`, effect `workflow`,
base `95578800875568e449ea9394db88b1bb49d9e409`. Every listed row disposed;
usage production/persistence/support consumers run through the 72-case family,
UI consumers through the 2-case E2E; substituted frontend answers cannot observe
persistence precedence, and other workflow/planning references are outside the
effect. No pending affected consumer remains. Freshness unchanged at pinned
trunk `47f39abba0ac074666902542284c0bdaa807480d`; named supplier accepted at
03a69f1988 is already an ancestor of this branch, and incoming commits change
only unrelated planning records. Approximate implementation active time 11m.

Refactor 1: independent `/root/refactor1` returned `## REFACTOR COMPLETE`;
workflow expression simplified with equivalent launch/fallback semantics, plan
findings restored as distinct entries. Same focused 5-case command above passed
again (9.7s); family/E2E inspected boundaries unchanged and reused. Trace:
`/tmp/seed357-refactor1-consumer-trace.md`, all rows disposed. No gap.
Final freshness unchanged at `10f91707c45b6661bf42e37f1337d7e7bc2e6a4c`;
only an unrelated Take arrived since the earlier sibling check.

Preparation stopped before commit on unsafe JSON typing in the new test.
Coordinator repair uses the already-imported module's UsageHistory type at parse;
no runtime/observation change. Already traced within refactor 1's accepted paths;
accepted proof reused. Formatting/hook own renewed static validation.

## Slice 2 acceptance

Slice 1 accepted on remote story branch at `6343cc5b8ea6416488914b4567d48e785feed53b`, suffix base `95578800875568e449ea9394db88b1bb49d9e409`.
Slice 2 triggers/expected results match the inspected real importer and HTTP
assertions in `usage-check-freshness.spec.ts`: null, first import mtime, legacy
record, later finished-task import mtime, then unchanged Refresh's own start.
Controlled file times distinguish record publication from Refresh start; setup
never supplies the computed HTTP checkedAt. The old reader failed the new test.
`token-index-refresh.spec.ts` preserves summary/check-record bytes on failure;
restoring saved timestamps accompanies test fixture restoration, preserving
rather than weakening the failed-Refresh promise. Cutoff unchanged by inspection.
No source gap; pending UI promises remain with slice 3.

Terminal proof commands, same one-worker AC decision (load 8.33/7.00/6.79):
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/usage-check-freshness.spec.ts dashboard/backend-tests/usage-history/token-index-refresh.spec.ts --workers=1 --reporter=list` — 4 passed, 9.7s.
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --workers=1 --reporter=list` — 74 passed, 1.7m.
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config e2e/playwright.config.ts e2e/configuration/system-settings-usage.spec.ts --grep 'Refresh keeps' --workers=1 --reporter=list` — selected exactly the Refresh success/failure journey, 1 passed, 8.6s; showsCheckedAt observes import, successful Refresh and retained failed-Refresh time.

Trace `/tmp/seed357-slice2-consumer-trace.md`, terms checkedAt/showsCheckedAt,
base 6343cc5b8ea6416488914b4567d48e785feed53b: all 108 rows disposed. Usage
reader/Refresh/HTTP/support/family consumers now run; UI/page-object effects run
through that E2E. Intent/CI timestamps and substituted filesystem answers are
outside this freshness selection. No pending affected gate. Freshness unchanged
at `244fc7bc67e454a3d43dfc7849f9b65edb805ec9`; supplier already included,
incoming changes only unrelated preparation/agent avatars. Active time about 10m.

Refactor 2: independent `/root/refactor2` returned `## REFACTOR COMPLETE`,
none — already clean; no tests rerun, accepted proof and consumer dispositions
unchanged. Final freshness unchanged at baffb006077e01d09f7393ac7bbda0ee20c48923;
only unrelated preparation/Take records arrived since the earlier sibling check.
