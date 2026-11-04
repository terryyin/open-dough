# Source review: Summarize CI proof in Intent

**Launch:** 2026-11-04, a fresh general-purpose sub-agent (no conversation inheritance, fork or resume) launched by the execution coordinator before slice 1 acceptance.

**Input:** only the selected story's text from `.planning/seeds/SEED-230-summarize-ci-proof-in-intent.md#summarize-ci-proof-in-intent`, Goal through Architecture (Goal, Scope, Required restrictions, Considered and deferred, Key examples, UI, Architecture), with instructions to read no other file, change nothing, and return numbered commitments, qualifications, examples, restrictions and exclusions. No plan, return, product or proof was supplied. The return below keeps the reviewer's ids and source text.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer reviewing a project in Intent's **CI status** tab can see, for the CI run whose result the tab shows, which of the project's configured Intent entries that run proved | slice 2 | |
| G2 | (same view shows) with what outcome counts | slice 2 | |
| G3 | (G1–G2 are visible) without opening CI logs or downloading artifacts | slice 2 | |
| G4 | A failed run then points to the entry that failed | slice 2 | |
| G5 | a passing run shows what it actually covered | slice 2 | |
| G6 | This adds CI observations beside the existing deliberate Proof workflow | slice 4 | |
| G7 | it does not change retained Proof | slice 4 | |
| G8 | it does not change … the CI verdict | slice 3 | |
| S1 | *Proof entries* are the project's configured Intent locations (`.planning/open-dough.json` `intent.locations`), named by their `path`. | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs 'the declared parts equal the matrix lengths … in Intent location order' (reads .planning/open-dough.json intent.locations paths) |
| S2.1 | A project's CI declares which of those entries it proves | slice 1 | observed: .github/workflows/ci.yml ci-proof job `expect:` input; tests/support/ci-proof-declaration.test.mjs 'the declared parts equal the matrix lengths' |
| S2.2 | (A project's CI declares) how many parts (single job, or one part per matrix job or shard) each expects | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs 'the declared parts equal the matrix lengths of the jobs that write each entry' (12, 3, 3) |
| S3.1 | Each CI producer writes one fragment per entry and part | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs 'every producer keeps its part's attempt-named fragments whenever its suite ran' |
| S3.2 | (fragments written) from runner reports where they give the outcomes | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs 'a Playwright proof record counts tests…' and 'an outcomes file counts each check toward the entry whose path contains it' |
| S3.3 | A job that runs several entries, such as Open Dough's `npm test` share, which runs both `tests` and `src/skills` checks, writes a fragment for each. | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs 'an outcomes file counts each check toward the entry whose path contains it'; ci.yml test job fragments step entries: tests src/skills |
| S3.4 | Parallel workers inside a job are merged by the runner or written as separate fragments. | slice 1 | observed: Playwright runner merges workers into one proof record per shard; ci.yml dashboard job one fragment per shard |
| S3.5 | Producers keep their job's failure semantics | slice 1 | observed: ci.yml: suite steps unchanged; fragment steps only add if: !cancelled() && steps.suite.outcome != 'skipped'; no continue-on-error |
| S3.6 | (Producers) still publish after test failures | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs 'every producer keeps its part's attempt-named fragments whenever its suite ran' (after-failure if) |
| S4.1 | After the proof jobs settle, including after failures, one collector checks the fragments of the current run attempt against the declared entries and parts. | slice 1 | observed: tests/support/ci-proof-declaration.test.mjs 'the ci-proof job runs after both proof jobs however they ended'; src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'the declaration is the expectation…' |
| S4.2 | It then uploads one versioned, compact summary artifact |  | G1 |
| S4.3.1 | (summary) naming the repository | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total…' deep-equal summary repository |
| S4.3.2 | (summary naming the) workflow run | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total…' runId |
| S4.3.3 | (summary naming the) attempt | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total…' runAttempt |
| S4.3.4 | (summary naming the) tested revision | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total…' revision |
| S4.4.1 | For each entry it names the runner's counted unit, such as Playwright tests or `npm test` checks | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total…' unit tests/checks |
| S4.4.2 | (For each entry it names) the passed, failed and other counts | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total…' passed/failed/other |
| S4.4.3 | (For each entry it names) parts that are missing or ambiguous | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'a missing part is a gap, a duplicated part is ambiguous, and neither is counted (example 2)' |
| S5.1 | The tab shows that summary for the same repository, workflow run, attempt and tested revision as its displayed result. | slice 2 | |
| S5.2 | For a running result, it shows the summary for the completed ancestor's run that the tab already shows. | slice 3 | |
| S5.3.1 | It names the tested revision | slice 2 | |
| S5.3.2 | (It names) the run with its link | slice 2 | |
| S5.3.3 | (It names) the attempt | slice 2 | |
| S5.4 | A missing or ambiguous part is shown as a gap | slice 2 | |
| S5.5 | (a missing or ambiguous part) is not counted as passed | slice 2 | |
| S5.6 | (a missing or ambiguous part) is not filled from another attempt | slice 3 | |
| S6.1 | The verdict and proof stay independent | slice 3 | |
| S6.2 | the verdict appears and reads the same whether proof is available, missing or still being read | slice 3 | |
| S6.3 | proof counts never restate … it (the verdict) | slice 3 | |
| S6.4 | proof counts never … override it (the verdict) | slice 3 | |
| S7.1 | When no proof can be shown, the tab gives one reason | slice 3 | |
| S7.2.1 | reason: no summary in the run | slice 3 | |
| S7.2.2 | reason: expired | slice 3 | |
| S7.2.3 | reason: unreadable | slice 3 | |
| S7.2.4 | reason: invalid | slice 3 | |
| S7.2.5 | reason: for another run, attempt or revision | slice 3 | |
| S7.3 | The same applies when the project's CI is read through a `ciAdapter` rather than GitHub Actions | slice 3 | |
| S7.4 | The same applies … when no completed run is shown. | slice 3 | |
| S8.1 | Pilot on Open Dough itself: `dashboard/tests` across 12 Playwright shards |  | G1 |
| S8.2 | (Pilot) plus `tests` and `src/skills` across the 3 `npm test` shares |  | G1 |
| S9.1 | Ship one standalone recipe with Open Dough's installed guidance. | slice 4 | |
| S9.2.1 | (recipe) must show how to map a project's test commands to entries | slice 4 | |
| S9.2.2 | (must show how to) write single-job or uniquely named parallel fragments | slice 4 | |
| S9.2.3 | (must show how to) declare the expected parts | slice 4 | |
| S9.2.4 | (must show how to) run the collector after failures | slice 4 | |
| S9.2.5 | (must show how to) choose artifact retention | slice 4 | |
| S9.2.6 | (must show how to) grant the dashboard's read access (the developer's `gh` with Actions read on the repository) | slice 4 | |
| S9.3 | The project adopts it by editing its own CI. | slice 4 | |
| S10.1 | Document the added GitHub requests in GITHUB-REQUESTS.md. | slice 3 | |
| S10.2 | Summaries are immutable per attempt, so the dashboard process may remember a read summary by run and attempt. | slice 3 | |
| R1 | The summary is used only when its repository, run, attempt and tested revision match the displayed result. | slice 3 | |
| R1a | Otherwise another run's counts would appear as this run's proof (ADR 0008: distinguish missing, outdated and conflicting evidence from a negative result). | slice 3 | |
| R2 | Fragments from an earlier attempt are not counted toward a later one, for the same reason. | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'an earlier attempt's or another revision's fragment is excluded, never filling a part (example 2)' |
| X1 | (deferred) Per-test names and failure detail in the dashboard are outside this story | slice 4 | |
| X2 | (deferred) CI providers other than GitHub Actions | slice 4 | |
| X3 | (deferred) proof in the Intent location or folder views | slice 4 | |
| X4 | (deferred) comparing CI counts with retained Proof | slice 4 | |
| X5 | (rejected) having the dashboard aggregate the raw per-job artifacts (27 artifacts of up to 0.7 MB each per Open Dough run, and no independent list of expected parts) | slice 4 | |
| X6 | (rejected) publishing through check runs or third-party test-report actions (needs `checks: write`, and the summary would have to be parsed back out of rendered text) | slice 4 | |
| X7 | (rejected) committing CI results to the repository (conflicts with deliberate Proof) | slice 4 | |
| E1 | Trigger: Two `dashboard/tests` shards report 12 passes, and 7 passes plus 1 failure. `tests` reports 5 passing checks in one share. The run failed. | slice 2 | |
| E1.1 | Expected: The tab shows **Failed** at the run's revision as today | slice 2 | |
| E1.2 | Expected: below it Proof for that run | slice 2 | |
| E1.3 | Expected: `dashboard/tests` with 19 passed and 1 failed tests | slice 2 | |
| E1.4 | Expected: `tests` with 5 passed checks | slice 2 | |
| E1.5 | Expected: each with every declared part present | slice 2 | |
| E1.6 | Expected: No part overwrites or double-counts another. | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'two dashboard shards and one tests share total without overwriting or double counting (example 1)' |
| E2 | Trigger: Shard 4 is cancelled, or only failed jobs are rerun as attempt 2. | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'a missing part is a gap…' (cancelled shard) and 'an earlier attempt's … fragment is excluded' (attempt-2 rerun) |
| E2.1 | Expected: The attempt-2 summary shows `dashboard/tests` with its present parts' counts and "part 4 of 12 missing" | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'a missing part is a gap…'; 'the command line writes fragments per entry and one summary from them' stdout 'part 2 of 2 missing' |
| E2.2 | Expected: does not total it as a full run | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'a missing part is a gap, a duplicated part is ambiguous, and neither is counted (example 2)' |
| E2.3 | Expected: or use attempt 1's fragment | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'an earlier attempt's or another revision's fragment is excluded, never filling a part (example 2)' |
| E3 | Trigger: Two fragments for the same part | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'a missing part is a gap, a duplicated part is ambiguous…' |
| E3.1 | Expected: make that part ambiguous, and its counts are not used. | slice 1 | observed: src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs 'a missing part is a gap, a duplicated part is ambiguous, and neither is counted (example 2)' |
| E4 | Trigger: A story branch is running. | slice 3 | |
| E4.1 | Expected: The tab shows its completed ancestor's passing trunk run | slice 3 | |
| E4.2 | Expected: Proof names that ancestor's revision and run, not the running commit. | slice 3 | |
| E5 | Trigger: The project has no collector, the summary has expired, GitHub refuses the read, or the summary names another attempt or revision. | slice 3 | |
| E5.1 | Expected: The tab still shows the verdict exactly as before | slice 3 | |
| E5.2 | Expected: under Proof one line explains why proof is unavailable for this run. | slice 3 | |
| U1 | Proof follows the existing judgment as its own labelled part of the tab. | slice 2 | |
| U2 | It names the run (revision, link and attempt) once | slice 2 | |
| U3 | then gives one row per declared entry in configuration order | slice 2 | |
| U4.1 | Each row shows the location path | slice 2 | |
| U4.2 | (Each row shows) counts with their unit | slice 2 | |
| U4.3 | (Each row shows) any gap | slice 2 | |
| U4.4 | (Each row) needs no colour to be understood | slice 2 | |
| U5.1 | While the summary is being read, the verdict is already shown | slice 3 | |
| U5.2 | (While the summary is being read,) Proof says it is checking | slice 3 | |
| U6 | **Check again** refreshes both. | slice 3 | |
| A1 | The CI-side responsibility is new | slice 4 | |
| A2 | the project's producers and collector are written from the installed recipe into the project's own workflow | slice 4 | |
| A3 | (recipe/CI side) standalone under ADR 0004 | slice 4 | |
| A4 | written for the agent working in that project under ADR 0006 | slice 4 | |
| A5 | The dashboard stays an observer under ADR 0008. | slice 3 | |
| A6 | It reads the summary through the authenticated read boundary. | slice 2 | |
| A7 | The GitHub Actions judgment must therefore carry the shown run's id, attempt and head SHA, which today carries only its URL. | slice 2 | |
| A8 | Proof is a separate read keyed by that run | slice 2 | |
| A9 | so a slow or failed artifact read never delays or alters the verdict | slice 3 | |
| A10 | GitHub delivers artifacts as zip archives, so the server must extract one small file. | slice 2 | |
