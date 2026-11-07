# Source review — SEED-251#group-dashboard-backend-tests

Launch: fresh general-purpose reviewer (`29dfd990-8332-481c-9fec-3b873e6187a1`), source-only.
Input: Goal, Scope (required / required restrictions / scope limits), key examples, and failure-policy clause from
`.planning/seeds/SEED-251-group-dashboard-backend-tests.md#group-dashboard-backend-tests`.
No plan, return, product, or proof supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Opening Dashboard Backend Test reveals a concise, complete set of service feature groups. | slice 1 | observed: dashboard/backend-tests/{configuration,intent,launches,observation,review,runtime,sessions,terminals}/ (8 folders) + README inventory; Intent browse via intent-code-browse focused proof |
| 2 | The behavior each test protects is easy to find. | slice 1 | observed: dashboard/backend-tests/README.md and dashboard/tests/feature-groups.md Backend feature groups tables name each group responsibility |
| 3 | Coverage is not lost. | slice 1 | observed: playwright --list before/after 2088/2088 basename+title missing=0 added=0; 268 nested specs once |
| 4 | The shared dashboard CI route is not slowed. | target CI |  |
| 5 | Analyze the existing backend suite before choosing groups. | slice 1 | observed: implementation analysis preceding eight-folder membership (slice return inventory) |
| 6 | Reuse the browser suite's domain vocabulary where it still names the protected service behavior accurately. | slice 1 | observed: reused browser vocabulary folders where accurate; omitted stories/ and navigation/ |
| 7 | Prefer fewer groups than the browser suite's ten for the narrower service scope. | slice 1 | observed: eight groups < browser ten |
| 8 | Place every backend `*.spec.ts` under exactly one feature folder. | slice 1 | observed: find: 0 flat *.spec.ts; 268 under feature folders |
| 9 | Place every backend case-definition module under exactly one feature folder. | slice 1 | observed: seven case modules under launches/ and observation/ only |
| 10 | Shared fixtures and support that several features reuse may remain shared outside those folders. | slice 1 | observed: shared fixtures remain under dashboard/tests/ (no move into feature folders) |
| 11 | Update imports so each moved path remains truthful. | slice 1 | observed: nested imports resolve via ../../tests\|server; typecheck:dashboard pass |
| 12 | Update discovery so each moved path remains truthful. | slice 1 | observed: tests/support/dashboard-test-files.test.mjs + test-shares.test.mjs: twelve shards match every dashboard spec once |
| 13 | Update Intent/proof path attribution so each moved path remains truthful. | slice 1 | observed: Intent/proof path attribution updated; intent-code-browse proves feature-folder browse |
| 14 | Update duration records so each moved path remains truthful. | slice 1 | observed: dashboard/longest-first* labels use backend-tests/<feature>/…; preview 743/743 recorded |
| 15 | Update maintained documentation so each moved path remains truthful. | slice 1 | observed: dashboard/backend-tests/README.md + dashboard/tests/feature-groups.md Backend section |
| 16 | Keep the independent Dashboard Backend Test entry. | slice 1 | observed: Dashboard Backend Test entry retained (backend-tests/ root + Intent entry) |
| 17 | Keep its sibling directory. | slice 1 | observed: dashboard/backend-tests/ sibling directory retained |
| 18 | Keep the shared Playwright run. | slice 1 | observed: unchanged npm run test:dashboard / playwright config roots |
| 19 | Keep the shared build. | slice 1 | observed: unchanged shared build path (no CI/build redesign) |
| 20 | Keep the shared setup. | slice 1 | observed: unchanged shared setup |
| 21 | Keep the existing twelve-shard parallelism. | slice 1 | observed: preview --split-count 12 still twelve shares; 743 jobs |
| 22 | At most ten feature groups. | slice 1 | observed: eight groups ≤ ten |
| 23 | Each group name expresses one defining domain concept. | slice 1 | observed: folder names: configuration launches sessions terminals review intent observation runtime — one concept each |
| 24 | Each group name is without "and". | slice 1 | observed: no group name contains and |
| 25 | Each group name is without a list of concerns. | slice 1 | observed: no group name is a list of concerns |
| 26 | Preserve every existing case. | slice 1 | observed: discovery identity missing=0 for original cases |
| 27 | Preserve every existing case's assertions. | slice 1 | observed: no assertion edits claimed; typecheck + representative relocated specs pass |
| 28 | Execute each case once after regrouping. | slice 1 | observed: harness: twelve CI shards match every actual dashboard spec exactly once |
| 29 | Complete CI must still pass without increased wall time against a comparable successful baseline. | target CI |  |
| 30 | Does not change product runtime behavior beyond Intent's folder browse of this entry. | slice 1 | observed: diff limited to tests/docs/duration/Intent browse attribution; no product runtime beyond Intent folder browse |
| 31 | Does not redesign the shared runner. | slice 1 | observed: no shared runner redesign in diff |
| 32 | Does not redesign shard count. | slice 1 | observed: shard count remains 12 |
| 33 | Does not redesign deadlines. | slice 1 | observed: deadlines unchanged |
| 34 | Does not redesign retries. | slice 1 | observed: retries unchanged |
| 35 | Does not add CI jobs. | slice 1 | observed: no new CI jobs |
| 36 | Does not add CI builds. | slice 1 | observed: no new CI builds |
| 37 | Does not regroup the browser suite. | slice 1 | observed: dashboard/tests feature folders not regrouped |
| 38 | Does not create the frontend-test entry. | slice 1 | observed: no frontend-test entry created |
| 39 | Exact group inventory and membership are chosen during execution from the analysis above; refinement does not freeze folder names. | slice 1 | observed: eight-folder inventory chosen at execution; plan did not freeze names |
| 40 | Open Dashboard Backend Test in Intent → browse the chosen feature folders and reach every existing backend test under its owning feature. | slice 1 | observed: intent-code-browse focused proof: feature folders reachable under Dashboard Backend Test |
| 41 | A test spans several implementation modules → classify it by the behavior its assertions protect, using a single feature owner (choose the feature whose behavior the test proves, not an older filename prefix). | slice 1 | observed: membership by protected behavior (e.g. agent-launch-done* → sessions; agent-terminal* interactive → terminals) |
| 42 | A backend case-definition module supports one feature's specs → it lives in that feature folder; a truly shared fixture stays outside the groups. | slice 1 | observed: case modules colocated with owning feature; multi-feature fixtures stay in dashboard/tests/ |
| 43 | Run the existing CI validation after regrouping → every existing case still executes once, with proof and duration history attributed to its moved path, and wall time is no worse than a comparable successful baseline. | target CI |  |
| 44 | The failing-and-flaky-tests policy in AGENTS.md applies as written. | slice 1 | observed: failure policy carried and applied; no waived flaky/failing disposition |
