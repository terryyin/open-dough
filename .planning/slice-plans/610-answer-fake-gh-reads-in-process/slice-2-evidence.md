# Slice 2 implementation handoff

Code is quiescent after focused verification. All edits are uncommitted. Coordinator owns the active plan/source review/execution evidence and all loaded/full/hosted acceptance gates. No formatting, hook-owned lint, refactor, commit, push or done mark was performed.

## Changed paths

- dashboard/backend-tests/configuration/project-add-boundary.spec.ts
- dashboard/backend-tests/observation/authenticated-read-done-catalog-refusal.spec.ts
- dashboard/backend-tests/observation/authenticated-read-plugin-hooks.spec.ts
- dashboard/backend-tests/observation/authenticated-read-shared-failures.spec.ts
- dashboard/backend-tests/observation/authenticated-read-shared-listing-failures.spec.ts
- dashboard/backend-tests/observation/authenticated-read-shared-listing.spec.ts
- dashboard/backend-tests/observation/authenticated-read-shared-waiters.spec.ts
- dashboard/backend-tests/observation/authenticated-read-subprocess-lifecycle.spec.ts
- dashboard/backend-tests/observation/authenticated-read-turns.spec.ts
- dashboard/backend-tests/observation/listingTimeoutBoundary.ts
- dashboard/backend-tests/support/fakeGhClient.ts
- dashboard/backend-tests/support/fakeGhInProcess.ts
- dashboard/tests/README.md
- dashboard/tests/observation/authenticated-read-owner-failures.spec.ts
- dashboard/tests/support/dashboardServer.ts
- dashboard/tests/support/endFakeGhLeftover.proof.mjs
- dashboard/tests/support/fakeGh.ts
- dashboard/tests/support/fakeGitHub.ts
- dashboard/tests/support/listingReuseWithOwnerClock.ts
- dashboard/tests/support/projectAddMachine.ts
- dashboard/tests/support/projectAdditionFixture.ts
- dashboard/tests/support/sharedReads.ts
- dashboard/tests/support/sharedRequestOwner.ts
- dashboard/tests/writing-journeys.md
- dashboard/backend-tests/runtime/fake-gh-in-process-modes.spec.ts
- dashboard/backend-tests/runtime/fake-gh-in-process-scopes.spec.ts
- dashboard/tests/support/dashboardServerEnvironment.ts

## Outcome

`installFakeGh` defaults to in-process. Physical call PID/signal/orphan/control cases select CLI explicitly, without changing observations. Server environment composition moved to `dashboardServerEnvironment.ts`, preserving caller NODE_OPTIONS with fake preload. The existing clock owner gets the scoped explicit preload through its native spawn, alongside its Date preload. Shared-owner and clock helpers expose their existing installation to independent poisoning; shared diagnostics may name the actual installed entry. The test poison helper was extracted inside existing `fakeGhInProcess.ts` and its fixture now exercises the default.

Documentation names which boundaries stay real and when CLI is required. Production startup/transport, native timeout rules, runners, GitHub answerers and framing remain unchanged.

## Focused proof

1. `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice2-rollout-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-in-process-modes.spec.ts backend-tests/runtime/fake-gh-in-process-scopes.spec.ts --workers=2`
Terminal exit 0, strict passed, 6 cases, 23.451 s. Each mode crosses real server startup with default selection, a custom preload marker, poisoned API executable, real authenticated boundary and existing GitHub answers. Scope cases observe distinct simultaneous revisions, same machine restart, deliberately shared owner and explicit clock owner.

2. `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice2-native-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-client.spec.ts backend-tests/runtime/fake-gh-client-lifecycle.spec.ts backend-tests/observation/authenticated-read-turns.spec.ts backend-tests/observation/authenticated-read-shared-failures.spec.ts backend-tests/observation/authenticated-read-shared-listing.spec.ts backend-tests/observation/authenticated-read-shared-listing-failures.spec.ts backend-tests/observation/authenticated-read-shared-waiters.spec.ts backend-tests/observation/authenticated-read-done-catalog-refusal.spec.ts backend-tests/observation/authenticated-read-subprocess-lifecycle.spec.ts backend-tests/observation/authenticated-read-plugin-hooks.spec.ts backend-tests/configuration/project-add-boundary.spec.ts backend-tests/observation/shared-request-owner.spec.ts tests/observation/authenticated-read-owner-failures.spec.ts --workers=2`
Terminal exit 0, strict passed, 65 cases, 102.359 s. Actual PIDs, signals, held native calls, owner failures/replacement, curl cleanup, request bounds and shared-owner/provider observations stay intact. Setup changed only to choose CLI where physical calls are observed. Other cases exercise the fast default. This was before changing shared helper's diagnostic entry to a defaulted argument; existing calls retain the same entry and behavior.

3. `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-slice2-installed-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/fake-gh-in-process-scopes.spec.ts --grep 'two dashboards' --workers=2`
Terminal exit 0, strict passed, 1 case, 8.861 s. Final scope candidate invokes `.agents/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs` as a separate real process with the dashboards' owner environment. Both dashboards receive the expected revision; installed workflow diagnostic returns CI_WORKFLOW/id7001, one real owner stands, same fake records workflow arrival, and API poison stays unlaunched. Existing shared helper callers retain their prior source-entry default; unchanged 65-case observations are reused.

4. `npm run typecheck:dashboard && git diff --check`: final terminal exit 0. No live write-capable commands remain.

## Inspected observations

`fake-gh-in-process-modes.spec.ts`: independent caller preload file, 200/expected revision through rawRequest, actual fake arrivals, no API poison or PID, zero unanswered after close. `fake-gh-in-process-scopes.spec.ts`: independent first/second revisions before/after restart; actual installed diagnostic result and recorded workflow; real owner PID remains standing across controlled Date advance; no poisoned execution. Existing physical specs retain every process/PID/SIGTERM/SIGINT assertion.

## Remaining coordinator-owned proof

Three named natural-load repetitions with CPU evidence, full admitted dashboard suite, final published CI/all13 shards and baseline timing comparison remain required and unperformed. Consumer trace is being completed read-only after this quiescent code handoff; no default consumer is excluded merely because its callsite is unchanged. There is no claim of slice completion or loaded acceptance.

## Resource basis

This actual AC macOS host at rollout launch had natural load14.02/15.03/18.87. Before the 65-case native selection: 28.94/20.01/20.27, 36% free memory, active node work in other worktrees and FSEvents CPU contention. Two local workers with caffeinate -s -i were chosen for focused proof only. No burners, full-suite or repetitions were launched. Other owners/processes were preserved.

## Coordinator expensive-proof decision

Source freshness returned unchanged at trunk/base `9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec`; there are no incoming named sibling changes. Code quiescence established by implementation owner before launch.

At 2026-11-13 10:53 local, actual macOS host was awake on AC, natural load 56.36–58.74, CPU 59.11% idle, memory 43% free. That is outside the required CPU-bound natural-load 30–50 profile, so its three-repetition acceptance is deferred. Coordinator owns it when conditions qualify; no burners or relaxed assertions/timeouts are authorized.

Full required dashboard proof may proceed with two workers, maintained admission and `caffeinate -s -i`, because the observed host has spare CPU and memory and the proof is independently necessary. Known competing full owner: SEED-334 PID 82169, `run-and-observe-product-wide-end-to-end-tests`, started 10:44 local. Root owns queued full command session 15123, no duplicate launch. Literal command:

```sh
env -u NODE_ENV -u npm_config_local_prefix -u CI -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-full/proof.json OPEN_DOUGH_DASHBOARD_TIMES=/tmp/seed332-full/times.txt caffeinate -s -i node /tmp/seed332-repeat-suite.mjs --workers=2 > /tmp/seed332-full.log 2>&1
```

The temporary wrapper invokes `npm run --silent test:dashboard -- --workers=2`, retains a unique proof-record destination and CPU/memory/load/power snapshots before/after, and preserves the strict command exit. It changes no runner or test configuration. Worker override alone still takes full-suite admission. Reconsider before another long attempt if failures, changed contention or competing work invalidates this basis. No full result is established yet.

## Interim source comparison

Inspected default transport/server environment/modes/scopes helpers and the entire native-selection/documentation diff. Current observed source rows cover default API execution, real server activation, separate/restarted/shared scope and preserved native physical observations. Full consumer coverage, loaded profile/results and hosted timing rows remain unobserved with their coordinator-owned gates. Consumer trace: `/tmp/seed332-slice2-consumers.md`; 574 pending full-suite consumers are listed in `/tmp/seed332-slice2-consumers-pending.json`. No default consumer is excluded merely because its callsite is unchanged. New thirteen-shard preview passed: 1026 jobs, 956 recorded, 70 unrecorded; shares predict978.9–988.4 job-seconds; full output `/tmp/seed332-shard-preview-slice2.txt`.

## Reordered verification at natural-load window

At 11:14–11:15 local, natural load moved to38.37–39.33, AC power and41% free memory. Before proof, coordinator chose to cancel only its queued Playwright PID50671 (verified descendant of own wrapper48557) using SIGINT, while admission still named SEED-334 PID82169. Session15123 reached terminal exit1 before selection; no proof JSON was created, only `/tmp/seed332-full/proof-48557.json.host.json`. This was an intentional pre-admission cancellation to sequence owned heavy work, not a failed test or full verdict. Other owner82169 remains admitted. The required full suite will be requeued after named repetitions.

Coordinator now owns `bash /tmp/seed332-run-loaded.sh`, which invokes the planned `bash scripts/dashboard-repeat.sh 3` with all20 expanded spec paths from `/tmp/seed332-loaded-specs.txt`, default two workers and unchanged deadlines, under caffeinate-s-i. The temporary suite wrapper allocates a unique `/tmp/seed332-loaded/proof-<pid>.json` for each repetition and retains natural-load, top CPU, process CPU/nice, memory and power before/after. No burners. CPU contention qualification and case durations will be assessed from actual records; no passing result is claimed before terminal observation. Existing freshness/no-incoming-sibling settlement still applies to unchanged code.

## First loaded repetition failure

Session64111 reached terminal exit1. The first repetition selected33 cases;31passed and2timed out (strict failed), runner326.252s and outer332s. Script natural load40.10→30.18; wrapper snapshots were40.10 before and29.15 after, AC both,37→40%free memory, CPU idle49.54→50.43%, FSEvents105–112%of one CPU. No burners. These observations do not establish CPU-bound profile acceptance, and the strict failures remain defects regardless of attribution. Sleep log has no sleep/wake event in the03:15–03:21UTC run window (last event2026-11-07).

- G1/N01: current-source origin preparation timed out at30007ms.
- G2/N04: Done default answer selection timed out at34040ms near final intentDiff visibility assertion.

Proof `/tmp/seed332-loaded/proof-24289.json`, host `/tmp/seed332-loaded/proof-24289.json.host.json`, artifacts `dashboard/test-results/2026-11-13T03-15-26.944Z-25999`. Temporary wrapper marker `/tmp/seed332-loaded-stop` withheld repetitions2/3 (exit77,no tests); no passing repetition or retry settles either defect. `/root/slice2` owns diagnosis/correction within existing story scope, returning a consequential scope conflict rather than redesigning the runner. No source writes or proof commands were live at its correction handoff. Full gate remains unperformed and will be requeued after correction.

## Human-judgment stop and recovery

The one bounded /tmp instrumentation replay completed2/2 at quieter load12.59 and proves zero OS gh-api executions, including installed execution-start/owner paths. It does not dispose G1/G2. See [full diagnosis](loaded-diagnosis.md) for exact command, trace observations, source helper proposal and exclusions. No maintained source changed during diagnosis and no live test/implementation commands remain.

Terry’s required scope question is pending: extend SEED332 to targeted preparation/Git fixture optimization while retaining every journey/assertion/30s budget, or preserve transport-only unfinished result. No dependent change is authorized by silence. Resume only after that decision; a story amendment needs source review/allocation before further delegation.

Observer `/tmp/dough-ci-501/watch-xHjBHF` explicitly stopped for this human-judgment stop; receipt terminal.status=stopped, coverage=ended, pendingCi=unobserved, unread0. Yielded stream g330:10 ended. No CI success is claimed. On authorized resume retain the exact checkout/branch/claim and accepted92613de41, recover stopped observer identity and rearm as the adapter permits; no second claim. Full attempt15123 was canceled before admission; loaded attempt64111 failed first repetition and withheld the rest; diagnostic72545 ended. All worktree changes and retained artifacts stay intact.

## Scope authorization and resumed identity

Terry answered yes to targeted fixture/Git optimizations, preserving every journey, assertion and30s budget, on2026-11-13. The canonical scope now includes that work; the goal and all exclusion limits remain. G1/G2 stay open. Resume reuses this checkout/branch/agent and published92613de41 without another claim. Accepted trunk4f7214879 was merged through installed backlog adapter into local258e5cfda7284036755718c436644f45c31eb854; both published histories are preserved and no push has occurred. Only owned README edits were retained in /tmp and cleanly reapplied after merge. All other rollout changes remain uncommitted. Incoming SEED300 Board work includes fakeCLI signal/auth fixes, settled page-turn notes and browser arguments; their affected proof must be renewed before accepting delivery. No SEED334 orSEED324 product landing was found in this incoming range.

## Interrupted full attempt and daemon recovery

Root full command69641 was deliberately ended after eight genuine failures were recorded: two production-watcher timeouts and six CI-adapter restart failures. Pre-stop snapshot `/tmp/seed332-full-corrected-before-repair.json` separates those from operator-cancelled attempts. Final `/tmp/seed332-full-corrected/proof-36001.json` has phasecompleted, runnerinterrupted/strictfailed, and wrapper exit1; this is no passing full gate. Retained directory `dashboard/test-results/2026-11-13T04-12-30.674Z-36703`; full log `/tmp/seed332-full-corrected.log`. No source was edited during the full run.

Daemon recovery verified local258e5cfda, same branch/agent, all expected pending source changes, and remote execution branch92613de41. No unexpected commit or surviving seed332/Playwright verification command was found; former delegated agents are absent. Watcher diagnosis `/tmp/seed332-watcher-failure-diagnosis.md` confirms its investigation was read-only; the authorized scratch phase replay had not started. Root full runner36703 is absent. Old CI owner was matched through installed codexStreamOwner/root/repo/branch/mode and explicitly stopped; watch-wwVP4F receipt stopped, ended coverage, unobserved CI, unread0. A new yielded stream must be armed before publication. No prior publication, test command or claim was repeated.

Current pending producer trace is `/tmp/seed332-slice2-consumers-clarified.md`, with710 remaining full consumers (`...-clarified-pending.json`):700dashboard and10 genuinely reached installed runtime paths;24 incidental source matches were excluded and7 source consumers reuse accepted proof. G1 correction proof `/tmp/seed332-origin-correction-proof.json` passed4/4; post-change diagnostic `/tmp/seed332-process-diag-after-proof.json` passed2/2 and counted15 fewer Git processes/3 fewer full repository copies. All original loaded and full obligations remain open.

Recovered CI stream is now live: coordinatorseed332-philip, `/tmp/dough-ci-501/watch-krwnGv`, PID99984, session52985, yieldedcellg4:11. Root recoverytypecheck95155 passed, Node24.21.0 and lockeddependenciesunchanged. Formerwatch-wwVP4F/PID3933 is stopped and absent. Newstreamobserves the executionbranch; it carries no claimofCI success forunpublishedlocal258e5cfda orpendingrollout.

## Required loaded selection

The active plan delegates its current loaded gate here. The following selection preserves the original journeys through accepted relocations; historical partial observations above waive none of them.

- Loaded selection: `backend-tests/launches/start-origin-isolation.spec.ts`;
  under `tests/intent/`, `intent-summary-story-comparison-sort.spec.ts`,
  `intent-story-changes-landed-run.spec.ts`,
  `intent-ci-comparison-drilldown-relative.spec.ts` (G10 receiving failure),
  `intent-done-default-answer-selection.spec.ts`,
  `intent-scope-collected-file-timing-gaps.spec.ts`,
  `intent-scope-collected-file-timing-history.spec.ts`,
  `intent-scope-collected-timing-history.spec.ts`,
  `intent-scope-prior-build-states.spec.ts`,
  `intent-scope-glance.spec.ts` (SEED-331 replaced the source's
  `intent-scope-prior-build-average.spec.ts` with it at `92574ccd3`, keeping
  its collected-artifact, raw-prior and authenticated-read journey; after
  merging trunk, prove that spec's commitment through it, since Playwright
  silently skips a deleted path among others),
  `intent-project-scope-timing-refresh.spec.ts`,
  `recently-done-ci-automatic-repeat.spec.ts`, and the four
  `intent-ci-follow-up{,-proof,-return,-custom}.spec.ts` files;
  under `backend-tests/intent/`, `landed-ci-automatic-repeat.spec.ts`,
  `landed-ci-repeat-{accepted-request,eligible-receipt,verdict,reconciliation,admission}.spec.ts`,
  all three `landed-ci-adapter-repeat*.spec.ts` files and
  `landed-ci-server-lifetime.spec.ts` and `landed-ci-collector-lifetime.spec.ts`. The original failed20-file batch did
  not observe this available adapter family; include the composed candidate.
  The separately approved history/collector candidates are composed with focused proof;
  supplier-only eligibility/retained-reading work remains outside the offered candidates.
  Run `bash scripts/dashboard-repeat.sh 3 <expanded spec paths>` with local
  two-worker defaults and `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<absolute path>`.
  Count three consecutive passing natural-load 30–50 runs, recording load and
  CPU contention before/after; out-of-profile runs remain diagnostic evidence.
  Failures are repaired, not retried until green. Do not start burners as a
  substitute for acceptance or remove work owned by another session.

Accepted main7fb423492 moved the refused/uncertain automatic-repeat cases to
landed-ci-repeat-eligible-receipt.spec.ts. The current selection therefore has
27files and retains the same expected67cases; see supplier-reconciliation-evidence.md.
Use `/tmp/seed332-after-seed324-loaded-specs.txt` while retained. Historical26-file
manifests and pre-7fb prepared commands are evidence only; never rerun them as
the current selection. Actual discovery must confirm the moved cases are included.
