# Dashboard frontend browser connection

The [frontend job](https://github.com/terryyin/open-dough/actions/runs/46023777435/job/140589800675)
failed on attempt 1 at published revision `003a5f4d0`. It reported 272 of
332 files and 819 passing cases before the Vitest orchestrator socket
closed while `createTesters` was pending. The named Intent file registered
no case. The subsequent proof-artifact failure reports the interrupted
suite. The edited browser stream spec lives in the separate E2E group.

The incomplete job log is retained in the worktree Git evidence directory
as `ci-46023777435-frontend.log`. The closure and missing-case sequence is
at lines 1095–1130. This matches earlier occurrences on different files,
documented in the plan 885 history at `2734e2295`. That observation does
not identify what closed the connection. Trunk removed the former
investigation at `818c17745`. No active repair owner has been identified.

The parked slice 4 changes were absent from that CI revision and are
retained by the repair stash for this checkout.

## Round 1

Hypothesis: a full local run can reproduce the same closure and show
whether Chromium exits or navigates before Vitest loses its socket. Run
one instrumented local frontend suite using the repository's locked
runner with its worker selection and assertions. Retain the order of
browser and Vitest events, the terminal result, and the local host
conditions. A passing run supplies no cause or repair evidence.

The local run at `003a5f4d0` completed all 332 files with 954 passing
cases and one expected failure in 118.73 seconds. It used the locked
Node 24.21.0 runner on an AC-powered Mac ARM64 with 16 logical CPUs,
48 GiB RAM, 128 GiB free disk, and starting load averages around
4.0, 4.4, and 5.4. No competing test run was observed. The command used
the full suite and four workers, matching the worker profile used for the
previous hosted-equivalent comparison. The failed Ubuntu 24.04 job log
does not report its CPU count. The only uncommitted file at launch was this
diagnosis record.

The checkout's Git evidence directory holds
`ci-46023777435-browser-round1.log.run.json` with the exact command
(`caffeinate -s -i env … npm run test:dashboard:frontend -- --workers=4`),
exit 0, and `DEBUG=vitest:browser*,pw:browser,vite:hmr`. The log and the
completed proof record use the same basename. At log lines 11561–11593,
test completion preceded browser provider teardown, then orchestrator
socket closes, then both Chromium exits with code 0 and no signal. No
unexpected orchestrator disconnect, heartbeat termination, or failed
assertion appeared. The signature reproduced in zero of one local runs.
This describes normal teardown on this Mac. It leaves the hosted closer
unidentified and the CI repair open. No temporary source or workflow
edit was made. The clock reported about two active minutes in round 1.

The next distinct experiment is a single hosted capture at the same worker
and deadline settings. Reuse the archived provider lifecycle instrumentation
from `5c4e1a2b6` and correlate it with server WebSocket upgrade and close
events for the Vitest orchestrator and Vite HMR connections, recording
timestamps, the socket identity and close code, and Chromium exit status.
The missing evidence is the first event before the unexpected close. A
browser exit, a top-level page navigation after HMR loss, and a socket-only
close have different event orders. Stop after that attempt and remove the
capture. No plain rerun can establish that ordering.

## Round 2

Run the full hosted Dashboard frontend job once on the story branch.
If the disconnect recurs, test which event first preceded the Vitest
orchestrator's socket close. A Chromium exit or disconnect before teardown
supports a browser process cause. A Vite HMR close followed by another
main-frame navigation supports a reload. An isolated API socket close
without either leaves the browser and HMR explanations unconfirmed.
An unrelated failure or a completed run ends the experiment without
attributing the original disconnect.

The temporary capture changes `.github/workflows/ci.yml` and
`dashboard/frontend.vitest.config.mts`. To enable it, the commit subject
must begin with `Diagnose the hosted frontend browser disconnect`. Its
push must target `refs/heads/codex/follow-published-progress-from-local-git`.
The workflow leaves the usual runner command, suite, workers, and deadlines
in use. The locked runner logs Chromium process exits and Vitest Browser
API/pool chronology via `DEBUG`. Its temporary provider listeners record
the orchestrator's main-frame navigations, connection identity, page
closure or crash, browser disconnect, and normal provider teardown.
The Vite server records HMR connection identities and close codes through
its WebSocket event interface. The capture itself emits no raw URLs,
query strings, or WebSocket payloads. The installed Vitest API logger
reports its own connection IDs. Playwright's page socket event does not
expose a close code, so use its event and the Vitest log together.

The local instrument check on the AC-powered Mac ran the existing
`intent-project-scope-history-source-identity.spec.ts` with one worker and
the diagnostic environment. It passed both cases and logged the
orchestrator navigation and connection, two HMR connects, provider
teardown, the HMR close codes (1001), the corresponding Vitest API
disconnect, and a normal Chromium exit. This establishes the capture
path, not a reproduction. The exact command, log and exit record are
`ci-browser-round2-sanity.log.run.json`, `ci-browser-round2-sanity.log`
and `ci-browser-round2-sanity.exit` in the worktree Git evidence directory.
Dashboard typecheck passed separately. YAML parsing, comparison with the
prior workflow after removing the diagnostic environment and shell
guard, and `bash -n` for the suite step passed. No spec was edited.

Remove both temporary source changes after the one hosted diagnostic
job, whichever result it reports. Retain this diagnosis record and the
parked slice separately.

The [instrumented hosted frontend job](https://github.com/terryyin/open-dough/actions/runs/46026014984/job/140597489259)
at `d469bbf9b` passed all 332 files in 170.65 seconds. It recorded 954
passing cases and one expected failure. The final event sequence was
normal provider teardown, HMR close code 1001, page closure, and browser
disconnect. The unexpected failure reproduced in zero of one hosted
captures. The log is `ci-browser-round2-hosted-frontend.log` in the
worktree evidence directory.

The same run's Distribution shares 2 and 3 failed the workflow-shape
checks in `ci-browser-groups.test.mjs` and `ci-container-workflow.sh`.
Both expect the standalone frontend job's single-line suite command. The
temporary capture changed that line. Cleanup restores both instrumented
files byte for byte to `003a5f4d0`. Run these two checks once with the
locked repository runner to verify that restoring that command resolves
both failures. The initial local invocation used macOS Bash 3.2 and
stopped before running either check. Use the installed Homebrew Bash 5
for the one corrected invocation.

Both named checks passed with Bash 5 through the repository runner.
The run record is `ci-browser-round2-cleanup-bash5.log.run.json`.
`git diff --exit-code 003a5f4d0 -- .github/workflows/ci.yml dashboard/frontend.vitest.config.mts`
also verified the exact restoration.

The instruments observed normal teardown on both hosts. Neither attempt
captured an unexpected socket close, and the original run has no event
that precedes that close. Repeating those experiments would add no new
discriminator. The runner failure remains open. The worktree and partial
slice 4 are retained for its resolution.

Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
