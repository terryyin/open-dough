# Source review

Launch: a fresh general-purpose subagent, without conversation inheritance,
fork or resume, on 2026-11-19 before slice 1's delegation. Input: only the
selected story's Goal, Scope, Key examples, Scope limits and Architecture text
from
[SEED-412](../../seeds/SEED-412-keep-dashboard-tests-off-the-developers-real-cursor-runner.md#keep-dashboard-tests-off-the-developers-real-cursor-runner),
with the standard source-only promise instructions. No plan, product or proof.

Unnumbered context returned: the goal's motivation (tests beside the live
Dashboard and Cursor); the story does not change which tests run live or mounted; the guard
covers only the runners' Node TCP and browser traffic, not a kernel sandbox
for file paths or native helpers; the home and guard are run-level test
infrastructure; ADR 0008 places production machine-local state.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | Test-owned home for the Playwright runs: "Every dashboard test process starts with a test-owned home: the Playwright main process and workers of the backend, frontend and E2E runs" (Scope bullet 1). Architecture: "Runner entry points establish them before test code loads", so it also applies to `homedir()` calls made when a module loads. | slice 5 | |
| 1b | Test-owned home for the Vitest mounted run's Node side (Scope bullet 1). | slice 6 | |
| 1c | Test-owned home for "every server or helper they start" (Scope bullet 1). Architecture: entry points "pass them to children". Scope limits: "Non-Node helpers such as `git` and shell fakes inherit the test-owned home"; "Unix-domain sockets use the test-owned home and temporary directories." | slice 6 | |
| 2 | "Code that calls `homedir()` without choosing a home gets that test-owned home, never the real one" (Scope bullet 1). Key example 2: no real runner is running → the comparison renderer starts and closes → "no runner process starts under the real home." | slice 6 | |
| 3 | "Specs and fixtures that already choose their own home keep it" (Scope bullet 1). Key example 7: a spec sets `process.env.HOME` to its own temporary home → "it keeps that home, and the canary sees nothing." | slice 2 | |
| 4 | The default home holds a canary Cursor runner address. "Any contact with it fails the run and is recorded with its method, path, process and test" (Scope bullet 2; Goal: "fails the run with a named cause"). Key example 3: `readCursorRunnerSessions()` with no home → reads the canary address → run fails with `GET /sessions`, the worker and the spec's title. | slice 2 | |
| 5 | Canary contact outside a case fails the run and is recorded with "the active runner phase". This "includes global setup, fixture teardown and the time between the last test and run shutdown" (Scope bullet 2). Architecture: "The run owns the canary and the final verdict through child and browser shutdown." | slice 2 | |
| 6 | Key example 1: the developer's real runner is live with pending launch handoffs → a whole Dashboard Backend Test run, including the comparison renderer spec → "the real runner receives nothing and its handoffs remain." | slice 2 | |
| 7 | "The comparison renderer compiles without mounting the dashboard's local boundaries" (Scope bullet 4). | slice 1 | observed: dashboard/backend-tests/runtime/comparison-renderer-vite-cache.spec.ts "a comparison renderer leaves the runner and the machine home alone" (zero runner requests, only the address file in the scratch home); createComparisonRenderer uses configFile false with the React plugin only |
| 8 | Node-side network guard: covers "Node runner processes, workers and their Node children". A connection can reach only "a live listener owned by that run at the destination address and port" (Scope bullet 3; Goal: "Node TCP connections … reach only the run's own listeners"). Key example 4, worker side: a spec opens `http://127.0.0.1:4173/` from the worker → the connection is refused. | slice 3 | |
| 9 | Browser-side network guard: covers "pages opened by the Playwright and Vitest browser runs" with the same rule that only the run's own live listeners are reachable (Scope bullet 3; Goal: "browser requests reach only the run's own listeners"). Key example 4, test-page side: `http://127.0.0.1:4173/` from a test page is refused. Key example 5: a run-owned server redirects a test page to an unrelated local service → "the destination receives nothing and the run reports the refusal." | slice 7 | |
| 10 | "A refused connection fails the run even if the caller catches the error" (Scope bullet 3; Goal: "An accidental attempt to use … an unrelated listener fails the run"). | slice 7 | |
| 11 | The refusal report "names the destination, process and test, or the active runner phase outside a case" (Scope bullet 3). Key example 4: the refusal names `127.0.0.1:4173` and the spec. | slice 7 | |
| 12 | Run-owned listeners stay reachable. Key example 6: a spec starts a fake GitHub and a dashboard server that reads it → both listeners belong to the run → "every request proceeds as today." Architecture: "The listener register tracks bound endpoints for one run and registers fixture listeners automatically." | slice 4 | |
| 13 | "The fix lives at the starts: run config, global setup and shared fixtures. Individual specs do not opt in" (Scope bullet 5). | slice 7 | |
| 14 | Key example 8: "Whole backend, frontend (Playwright and Vitest mounted) and E2E runs end with zero canary contacts and zero guard refusals." | slice 7 | |
| 15 | "Playwright uses an explicit browser cache path resolved before `HOME` changes" (Architecture). Playwright's browsers are still found once the home is test-owned. | slice 5 | |
| 16 | Production is unchanged: the story "does not change how the production Dashboard finds the real runner or any other machine-local state" (Scope limits). Architecture: "Production continues to resolve its machine-local operational state under its own home as described in ADR 0008." | slice 7 | |
