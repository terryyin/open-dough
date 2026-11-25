# Pinned Codex worker setup timeout

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Round 1

- Published candidate `f91d4ab58a788ab8b21a8c58710c11302af0c05a` failed [CI attempt 1, E2E shard 3/6](https://github.com/terryyin/open-dough/actions/runs/45584782344/job/139103491094).
- `production-watcher-updates.spec.ts:44` timed out at 180 seconds during setup of `pinnedWatcherCodex`, before the scenario's deployment and assertions. The job restored a 41 MB npm cache, and locked npm and Chromium setup both passed before Playwright started. The worker calls `npm exec` for the pinned Codex package outside both the package lock and the job's explicit prerequisite setup. The job log does not contain that subprocess's output.
- The slice 2 diff from `d7513707b` changes Board fixture support and observation specs. The failing fixture, its watcher consumer and CI setup are byte-identical across those commits. This is attribution only. Slice 3 work stays parked under the coordinator's saved record and is absent from this checkout.
- First experiment, once: resolve the exact pinned package with `npm exec --prefer-offline` against a new private cache, selecting the Linux x64 package as CI does. Keep npm timing/debug evidence in the execution evidence directory. This can identify a cold source cost or a source/retry failure. The host is Darwin arm64 on AC with Node 24.21.0 and npm 11.19.0, load about 18 with other processes active. It can sample Linux package bytes and npm installation but cannot run Linux Codex or reproduce the CI runner's network conditions.
- Cold Linux package acquisition passed once in 11.1 seconds. Registry metadata answered in under one second and the Linux tarball downloaded and expanded in 8.3 seconds. The cold tarball was 166 MiB and its install occupied 458 MiB, compared with the entire 41 MB cache restored by the failed shard. This size excludes a warm Linux tarball in that restore. Logs `ci-watcher-codex-cold-linux.log` and `ci-45584782344-e2e-3.log` are under the checkout's Git evidence directory. No matching natural reproduction on this host.
- `375faaaf6` documented the same cold download overflowing a 30-second hook on [run 43540718509](https://github.com/terryyin/open-dough/actions/runs/43540718509). The current fixture waits on npm's default 300-second fetch timeout and two retries, while the project's explicit setup uses 20-second fetches without retry under a shared wall deadline. The exact trigger of the original registry stall is unobserved.
- Second experiment, once, different kind: run only the failing browser case with the Codex-only `npm exec` request sent to a deliberately stalled loopback registry and a private empty npm cache. Keep ordinary npm commands and all scenario inputs as before. Hypothesis: the worker times out at its ordinary 180-second limit while that acquisition is still outstanding. Cap the entire local experiment at 215 seconds and kill its process group on finish. This tests the timing and ownership mechanism without attributing the hosted stall to a particular network operator.
- The injected stall reproduced the exact `pinnedWatcherCodex` 180-second Playwright timeout in the one selected case. The registry recorded a request for the exact package metadata and held it throughout the fixture wait. The application scenario never began. The process group was reaped when the focused run exited 1. Evidence `ci-watcher-codex-stalled-registry.log` and its run record hold the command, wall duration, and matching signature. The later CI diagnostic `ci-45584782344-1-closed.json` confirms this was the sole failing job.
- The supported repair keeps the 166 MiB acquisition out of the CI worker. The watcher shard alone should prepare the exact executable under the existing native setup deadline, use cache reuse for the pinned package, and hand the worker a locally checked executable path. A local on-demand run should retain acquisition through a bounded command. Prove the watcher workflow with the registry stall still armed after preparation, and prove that setup refuses a failed prerequisite within its acquisition deadline. The evidence confirms the unbounded acquisition mechanism, while the reason for the hosted registry delay remains unknown.
- Round 1 ended after 3.8 active minutes. The separate repair clock started at zero. A cold Darwin acquisition through the new native setup stage completed within the existing 45-second source allowance; its log records the installed launcher and completion.

## Repair verification

- Repeat the exact watcher case once in CI mode using the freshly prepared launcher and the same Codex-only loopback stall. Passing requires the native journey's assertions to run and no request to the stalled registry. This distinguishes preparation from a worker that still tries the network.
- Run the watcher update file once locally without a prepared launcher to cover the retained entry path. Use one worker on the AC-powered host.
- Run the native setup harness once and check owning-shard selection for all six current E2E shares. The maintained harness supplies a stalled npm process to the new stage and requires its setup command to fail before dependent checks can begin.
- Simulate a CI cache restore once by copying only `_cacache` from the cold Darwin acquisition into a fresh cache root and acquiring with npm offline. This tests that the one-shard cache contains all the source bytes a later job needs, independently of an extracted `_npx` directory.

The prepared browser case passed in 26.4 seconds with no registry request.
All ten watcher cases passed on the on-demand path with `CI=true`, preserving
the local CI-container invocation. Native setup failure guards, prepared-path
refusal in a GitHub Actions worker, cold and restored-cache installation,
Dashboard typecheck, 28 workflow contracts, and 16 Dashboard Backend cases
passed. The selector found the watcher only in E2E 3/6 across all 11 browser
shards. GitHub Actions publication must still observe the Linux hosted run.
