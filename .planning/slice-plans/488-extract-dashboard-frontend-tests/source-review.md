# Source review — SEED-252#extract-dashboard-frontend-tests

## Launch and input

- Reviewer: fresh general-purpose agent (no conversation inheritance; no plan,
  return, product, or proof).
- Input: Goal, Scope (required / required restrictions / scope limits), Key
  examples, and Failure policy from
  `.planning/seeds/SEED-252-extract-dashboard-frontend-tests.md#extract-dashboard-frontend-tests`
  only.
- Instruction: use only those inputs; read no other project files; change
  nothing; number every commitment; separate compound list items; preserve
  alternatives without turning examples into rejection rules.

## Comparison notes (slice 1 acceptance)

| Id | Trigger / setup | Source-expected result | Actual observation | Owner |
| --- | --- | --- | --- | --- |
| 9 | Intent / open-dough entries | `dashboard/frontend-tests` labelled Dashboard Frontend Test | `.planning/open-dough.json` entry present between tests and backend-tests | slice 1 |
| 10a.1–10a.4 | Discovery / TS / ESLint / CI proof / Intent browse | New root included | `testFiles.mjs`, `tsconfig.node.json`, `eslint.config.mjs`, `ci.yml`, Intent browse case | slice 1 |
| E1 | Synthetic DOM reachability / layout specs | Run under frontend-tests without dashboard backend or fake GitHub | Frontend specs import `pageTest.ts` and use `setContent`; no `dashboardTest` / FakeGitHub | slice 1 |
| E3a.1 | Mixed `observation-measurements.spec.ts` | DOM cases → frontend-tests; held-group real-service case stays | Frontend file has 4 geometry cases; `dashboard/tests/runtime/…` keeps `githubFor` held-group case | slice 1 |
| R9–R11 | After adding frontend entry | Backend entry, shared Playwright build, twelve-shard schedule kept | `open-dough.json` still has backend-tests; `ci.yml` still one proof matrix with 12 shards and three dashboard entries | slice 1 |

Slice 2 remains owner of mocked-backend extraction (E2), remaining mixed splits
(E3a.2–E3a.6), organization by file count (8 / E4), maintained docs (10a.6),
full duration refresh (10a.5), goal completion (I.3–I.10), and CI wall time
(`target CI` for R12).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| I.1 | Story identity is `SEED-252#extract-dashboard-frontend-tests`. | slice 1 | observed: seed header Identity SEED-252#extract-dashboard-frontend-tests |
| I.2 | Beneficiary is a developer reviewing frontend behavior and its automated protection independently of backend service behavior. | slice 2 | |
| I.3 | Goal: Opening Intent reveals **Dashboard Frontend Test** as a separate entry. | slice 2 | |
| I.4 | That entry is backed by `dashboard/frontend-tests/`. | slice 2 | |
| I.5 | That entry sits beside `dashboard/tests/` and `dashboard/backend-tests/`. | slice 2 | |
| I.6 | Its tests exercise DOM and frontend UI behavior with explicit service substitutes. | slice 2 | |
| I.7 | Those tests do so without starting the real dashboard backend service. | slice 2 | |
| I.8 | Integrated journey coverage is preserved. | slice 2 | |
| I.9 | Backend boundary coverage is preserved. | slice 2 | |
| I.10 | Shared CI wall time is preserved. | slice 2 | |
| 1 | Audit the existing dashboard test suite and its shared fixtures. | slice 1 | observed: PLAN.md Premises and baseline audit row separating DOM-only vs mocked vs real-service cases |
| 2 | Separate DOM-only tests and frontend tests that exercise UI behavior through synthetic backend-service responses from journeys that prove real frontend/backend service integration. | slice 2 | |
| 3 | Extract frontend-only and mocked-backend frontend cases into `dashboard/frontend-tests/`. | slice 2 | |
| 4 | Remove incidental backend setup from those extracted tests. | slice 2 | |
| 4a.1 | Incidental setup includes starting `dashboardServer` (example of what to remove). | slice 2 | |
| 4a.2 | Incidental setup includes fake `gh`/host processes (example of what to remove). | slice 2 | |
| 4a.3 | Incidental setup includes git-published origin fixtures (example of what to remove). | slice 2 | |
| 5 | Replace removed incidental backend setup with explicit frontend service substitutes where the UI reads or posts to an endpoint. | slice 2 | |
| 6 | Split mixed spec files so frontend cases move to `dashboard/frontend-tests/`. | slice 2 | |
| 7 | Genuine service-integration cases remain in `dashboard/tests/`. | slice 2 | |
| 8 | Organize `dashboard/frontend-tests/` according to the extracted file count presented in Intent. | slice 2 | |
| 8a | Keep `dashboard/frontend-tests/` flat when ten or fewer files are extracted. | slice 2 | |
| 8b | When more than ten files are extracted, organize into concise frontend feature groups using the existing feature vocabulary. | slice 2 | |
| 9 | Expose `dashboard/frontend-tests` in `.planning/open-dough.json` with label `Dashboard Frontend Test`. | slice 1 | observed: .planning/open-dough.json path dashboard/frontend-tests label Dashboard Frontend Test |
| 10a.1 | Update test discovery. | slice 1 | observed: dashboard/tests/support/testFiles.mjs returns tests, frontend-tests, backend-tests |
| 10a.2 | Update TypeScript/ESLint configuration. | slice 1 | observed: dashboard/tsconfig.node.json include frontend-tests; eslint.config.mjs globs dashboard/frontend-tests |
| 10a.3 | Update Intent browse coverage. | slice 1 | observed: dashboard/tests/intent/intent-code-browse.spec.ts asserts Expand Dashboard Frontend Test and heading text |
| 10a.4 | Update CI proof fragment/summary declarations. | slice 1 | observed: .github/workflows/ci.yml entries and expect include dashboard/frontend-tests; ci-proof unit tests cover three-root partition |
| 10a.5 | Update duration records (`dashboard/longest-first*`). | slice 2 | |
| 10a.6 | Update maintained documentation. | slice 2 | |
| R1 | Do not extract a test merely because it stubs an image, injects a transport failure, or intercepts a request while still fetching and verifying real backend service behavior. | slice 2 | |
| R1q | Justification/qualification: genuine service-integration protection must remain in the integrated dashboard suite rather than being misclassified or weakened. | slice 2 | |
| R2 | Preserve every existing case and its assertions. | slice 2 | |
| R3 | Execute each case once across the shared Playwright run. | slice 2 | |
| R4 | Do not split files merely to cross the ten-file grouping threshold. | slice 2 | |
| R4q | Justification/qualification: extraction must not drop, duplicate, or artificially fragment test protection. | slice 2 | |
| R5 | When grouping is triggered (more than ten extracted files), use at most ten groups. | slice 2 | |
| R6 | When grouping is triggered, each group has one defining domain name (without "and" or a list of concerns). | slice 2 | |
| R7 | When grouping is triggered, place every frontend test in exactly one group. | slice 2 | |
| R8 | Shared fixtures may remain shared (qualification on R7 / grouping). | slice 2 | |
| R5q | Justification/qualification: Intent browsing stays scannable and consistent with the existing domain vocabulary. | slice 2 | |
| R9 | Keep the independent Dashboard Backend Test entry. | slice 1 | observed: .planning/open-dough.json still declares dashboard/backend-tests beside frontend-tests |
| R10 | Keep the single shared Playwright build. | slice 1 | observed: .github/workflows/ci.yml single Playwright proof job; no extra build job added |
| R11 | Keep the twelve-shard CI schedule. | slice 1 | observed: .github/workflows/ci.yml twelve-shard matrix retained with frontend-tests=12 expect |
| R12 | Keep CI wall time no worse than a comparable successful baseline. | target CI | |
| R12q | Justification/qualification: separating the frontend entry must not add shared setup overhead or slow CI feedback. | slice 2 | |
| X1 | Does not change product runtime behavior beyond configuring and browsing the new Intent location. | slice 1 | observed: diff touches Intent config/browse and tests only; no product runtime module behavior change beyond Intent location |
| X2 | Does not redesign the shared Playwright runner. | slice 1 | observed: dashboard/playwright.config.ts unchanged in this slice diff |
| X3 | Does not redesign shard count. | slice 1 | observed: ci.yml split-count / shard matrix remains 12 |
| X4 | Does not redesign deadlines. | slice 1 | observed: no deadline redesign in this slice diff |
| X5 | Does not redesign retries. | slice 1 | observed: no retry redesign in this slice diff |
| X6 | Does not add CI jobs or builds. | slice 1 | observed: ci.yml adds frontend-tests to existing proof entries; no new jobs or builds |
| X7 | Does not regroup `dashboard/backend-tests/`. | slice 1 | observed: dashboard/backend-tests/ layout untouched in this slice diff |
| E1 | A test creates synthetic DOM and checks control reachability or layout arrangement → it runs in **Dashboard Frontend Test** (`dashboard/frontend-tests/`) without starting the dashboard backend or fake GitHub. | slice 1 | observed: dashboard/frontend-tests/{touch-reading,control-reachability,observation-measurements}.spec.ts import pageTest and use setContent; focused Playwright 11 frontend cases passed without dashboardServer/FakeGitHub |
| E2 | A test verifies UI recovery, status formatting, polling, or refusal feedback using synthetic backend responses → it runs in **Dashboard Frontend Test** against the built frontend with explicit service substitutes and no real backend server. | slice 2 | |
| E2a.1 | Illustrative synthetic-response topic: candidates recovery from synthetic rate-limit/malformed answers. | slice 2 | |
| E2a.2 | Illustrative synthetic-response topic: phone Paste 413 attachment refusal. | slice 2 | |
| E2a.3 | Illustrative synthetic-response topic: synthetic host-status figures. | slice 2 | |
| E2a.4 | Illustrative synthetic-response topic: synthetic startup/runner responses. | slice 2 | |
| E3 | A file mixes frontend-only or synthetic-response cases with real-service assertions → the frontend cases move to `dashboard/frontend-tests/` and the real-service cases stay in `dashboard/tests/`, with each case executing once. | slice 2 | |
| E3a.1 | Illustrative mixed file: `observation-measurements.spec.ts`. | slice 1 | observed: frontend-tests/observation-measurements.spec.ts holds 4 DOM geometry cases; tests/runtime/observation-measurements.spec.ts retains githubFor held-group case; both passed focused |
| E3a.2 | Illustrative mixed file: `intent-candidates-read-recovery.spec.ts`. | slice 2 | |
| E3a.3 | Illustrative mixed file: `agent-terminal-touch-paste-image.spec.ts`. | slice 2 | |
| E3a.4 | Illustrative mixed file: `agent-launch-creation-gates.spec.ts`. | slice 2 | |
| E3a.5 | Illustrative mixed file: `sessions-sidebar-host-status.spec.ts`. | slice 2 | |
| E3a.6 | Illustrative mixed file: `cursor-runner-sessions.spec.ts`. | slice 2 | |
| E4a | Alternative: extracted inventory contains ten or fewer test files → keep `dashboard/frontend-tests/` flat. | slice 2 | |
| E4b | Alternative: audit extracts more than ten test files → organize them into at most ten single-concept frontend feature groups during this story. | slice 2 | |
| P1 | Failing and flaky tests policy applies as written. | slice 2 | |
