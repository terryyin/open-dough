# Source review

Launch: fresh general-purpose reviewer on 2026-11-18, no conversation
inheritance, fork or resume, during this execution before the first
implementation delegation. Input: only the refined story section
`SEED-340#keep-one-time-test-preparation-out-of-case-budgets` (heading through
"Current repair and remaining protection", state JSON removed) as one scratch
file; instructed to read nothing else, change nothing, and number independently
observable promises under the source-only rules.

Unnumbered context returned: priority note; worker-scoped-per-host as example
mechanism and the unused-host run-elapsed trade-off as a design weight; no
shorter-run promise; exclusions (timeouts, `test.slow()`, wall-clock waits,
fewer checks, product changes); SEED-334 group inventory and commands;
SEED-391 reconciliation ordering and its retained proof; the 2026-11-17 Intent
Coverage finding as proof strengthening only; the retry timeout diagnosis.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | One-time preparation (queued origin, app build, server bundle) happens outside every case's 30 s budget for every `preparationPage` consumer, whichever host, across E2E, Integrated and Backend; fresh run starting with `side-panel-content-replacement` spends no fixture time on origin, build or bundle inside its budget (Goal; Scope 1; Scope trailing; Example 1) | slice 1 | observed: dashboard/backend-tests/runtime/test-preparation-budget.spec.ts (per group setup: gate holds both queued clones before any case, each case's origin step starts after both complete; fault without queuedOriginsReady times out at 30 s) + e2e side-panel-content-replacement trace: app/bundle/both origins prepared once before cases |
| 2 | Same verdict whether a case runs first or later in a worker; first cases keep a wide margin at one-minute load 30–50 with default timeouts; side-panel first at load about 40 passes well under 30 s (Goal; Example 1) | slice 5 | |
| 3 | One cohesive mechanism rather than per-spec opt-ins; consumers get preparation without opting in per spec (Scope 1) | slice 1 | observed: dashboard/tests/support/preparationPage.ts origin takes worker queuedOriginsReady; queuedClaude/CodexPreviewTest are aliases; 28 wrapper-consumer E2E cases + 6 named E2E pass |
| 4 | Claude-hosted and Codex-hosted preparation specs share a worker → each gets its host's prepared origin without either paying the other's preparation inside its budget (Scope 1; Example 2) | slice 1 | observed: dashboard/backend-tests/runtime/test-preparation-budget.spec.ts: claude, codex, claude cases in one worker get distinct origins, Claude/Codex trees differ, no private ref leaks |
| 5 | A spec overriding `originRepository` with later declared revisions → its correct host's shared installed base is prepared outside the case budget (Scope 1; Example 5) | slice 1 | observed: dashboard/backend-tests/runtime/test-preparation-budget.spec.ts override case (withRevision changed review) starts after both bases completed, tree equals Claude layout |
| 5.1 | For such a spec, its private copy retains those revisions and can be changed independently (Example 5) | slice 1 | observed: dashboard/backend-tests/runtime/test-preparation-budget.spec.ts override revisions = base + changed review, main is last, private ref absent from peers |
| 6 | Preserve the existing common app/server repair: normal shared app/server preparation stays in the common worker owner (Scope 2; Current repair ¶1) | slice 1 | observed: dashboard/tests/support/serverInputWorkerFixtures.ts dashboardServerInputsReady unchanged by mode; backend launches trace: zero app requests, one bundle; e2e trace: app+bundle once |
| 7 | The five custom session/terminal server profiles left unchanged get their preparation outside case budgets (Scope 2; Current repair ¶1) | slice 3 | |
| 8 | Boundary-only needs its bundle and no app: a fresh boundary-only run prepares its server bundle outside case time with zero app requests in the artifact log; preserve that behavior (Scope 2; Example 6; Current repair ¶2) | slice 2 | observed: dashboard/backend-tests/runtime/test-preparation-boundary.spec.ts: fresh backend-setup boundary run, server-bundle completes before the case's dashboard fixture step, artifact trace has no app entries |
| 8.1 | A focused infrastructure assertion for server-bundle preparation with zero app requests, failing when common preparation is faulted to request an app in boundary mode (Current repair ¶2) | slice 2 | observed: dashboard/backend-tests/runtime/test-preparation-boundary.spec.ts app-entries assertion: red with prepareServerInputs faulted to request app in boundary mode (inner run still passed), green restored |
| 8.2 | Keep `review/story-review-state-admission.spec.ts` product assertions intact (Current repair ¶2) | slice 2 | observed: review/story-review-state-admission.spec.ts unchanged, 3/3 in focused backend run |
| 9 | Development must not acquire a preview build through an inherited fixture default; a development-only custom server does not request an unused preview app (Scope 2; Example 6) | slice 3 | |
| 10 | Keep shared inputs immutable (Scope 3) | slice 5 | |
| 10.1 | Keep each case's writable origin, checkout, HOME, server and vendor answers private (Scope 3) | slice 5 | |
| 11 | `intent-done-source-selection` runs first at load 30–50 in `test:dashboard:frontend` → its app build is outside the case budget (Scope 4; Example 3; Scope trailing) | slice 4 | |
| 11.1 | The Done-source case keeps its frontend service-answer proof boundary rather than restoring the old Git arrangement (Scope 4) | slice 4 | |
| 11.2 | Switching between its two Done publications keeps held comparison/locations reads from displaying the previous story's source (Example 3) | slice 4 | |
| 11.3 | Real CLI Done selection remains in `intent-done-default-answer-selection` (Example 3) | slice 4 | |
| 12 | `intent-ci-comparison-retry` (`e2e/intent/intent-ci-comparison-retry.spec.ts:30`) runs first at load 30–50 → complete failed-Baseline → Check again recovery → remembered answer on another check and reselection journey passes with wide margin at default timeout (Scope 4; Example 4; Current repair ¶3) | slice 5 | |
| 12.1 | Its arrangement is reduced without dropping the behavior it proves; real completion, planning-only predecessor chain and later trunk remain valid proof inputs (Scope 4; Example 4) | slice 5 | |
| 13 | Any other first case whose own arrangement still nears the budget once preparation is out gets its arrangement reduced without dropping the behavior it proves (Scope 4) | slice 5 | |
