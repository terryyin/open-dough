# Source review — SEED-334#focus-detailed-dashboard-ui-checks

Launch: fresh general-purpose subagent (no conversation inheritance, fork or
resume) started by the execution coordinator on 2026-11-15 before slice 1
delegation. Input: only the selected story's Goal, Scope (including Scope
limits and Required restrictions) and Key examples, copied verbatim from
`.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#focus-detailed-dashboard-ui-checks`
at `5466753331360774a0bb0e1376babe8477c17acc` (seed lines 20–116); no plan,
product, proof or slice scope. Instructions: use only these inputs, read no
project files, change nothing, number every commitment, split compound items.
The returned numbered commitments and exclusions are recorded below as
returned.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers get detailed feedback from unit tests for one service. | slice 13 |  |
| 2 | Developers get confidence in representative product workflows from end-to-end tests. | slice 13 |  |
| 3 | After the interim **Dashboard Integrated UI Test** group is dissolved, only those two dashboard test layers remain: unit tests and E2E tests. | slice 13 |  |
| 4 | The interim **Dashboard Integrated UI Test** group is dissolved. | slice 13 |  |
| 5 | Every distinct behavior that group still proves keeps a home that catches the same regressions. | slice 13 |  |
| 6 | No third live proof entry remains. | slice 13 |  |
| 7 | E2E: promote only the few remaining representative workflows whose observable outcome still requires the real dashboard frontend and backend together. | slice 12 |  |
| 8 | E2E: prefer an existing E2E workflow when it already proves that outcome. | slice 12 |  |
| 9 | Unit: move most of the remaining interim checks into Dashboard Frontend Test or Dashboard Backend Test. | slice 12 |  |
| 10 | "Unit" here means those service-level Playwright groups. A unit case: | slice 12 |  |
| 10a.1 | exercises one service at its highest practical entry point (built UI with controlled answers, or a backend boundary), or at a lower entry point when the behavior is clear and the dependency stable; | slice 12 |  |
| 10a.2 | runs the service's real code and in-boundary collaborators; | slice 12 |  |
| 10a.3 | stays independent of other live services; | slice 12 |  |
| 10a.4 | mocks only a service boundary the case needs (for example a substitute backend answer for a frontend case). | slice 12 |  |
| 11 | Split mixed specs when their assertions belong at different boundaries. | slice 12 |  |
| 12 | Placement: use the migration inventory at `125c45649fa587c78ed7445deff35db87604489d` (`migration-purpose.json`, `migration-conversion-batches.json`, `migration-trunk-merge.json` under `.planning/slice-plans/608-product-wide-end-to-end-tests/`) as the starting classification and batch order. | slice 12 |  |
| 13 | Decide each case by its behavior, including the few specs added since that inventory. | slice 12 |  |
| 14 | Convert by these inventory batches: | slice 12 |  |
| 14a.1 | configuration; | slice 1 | observed: git status: dashboard/tests/configuration/ removed; homes dashboard/frontend-tests/configuration/ and e2e/configuration/ |
| 14a.2 | launch dialog and start; | slice 5 |  |
| 14a.3 | sessions and terminals; | slice 9 |  |
| 14a.4 | story review; | slice 10 |  |
| 14a.5 | Intent CI/proof/history; | slice 11 |  |
| 14a.6 | board, navigation, stories and observation; | slice 12 |  |
| 14a.7 | the pending server-boundary-through-a-page case. | slice 11 |  |
| 15 | Retirement: when every distinct interim behavior has a home, remove: | slice 13 |  |
| 15a.1 | the **Dashboard Integrated UI Test** entry from current Intent and CI proof configuration; | slice 13 |  |
| 15a.2 | its `npm run test:dashboard:integrated` command; | slice 13 |  |
| 15a.3 | its Playwright configuration; | slice 13 |  |
| 15a.4 | its CI producer and shards; | slice 13 |  |
| 15a.5 | current tooling and placement guidance that still name the interim group. | slice 13 |  |
| 16 | Update the browser-group roster, or its hard-coded callers if SEED-334#keep-one-browser-test-group-roster has not yet landed, so the remaining three groups stay coherent. | slice 13 |  |
| 17 | Retain shared helpers and fixtures under `dashboard/tests/` that E2E, Frontend, or Backend still use. | slice 13 |  |
| 18 | Preservation: historical proof stays readable at the revision that produced it. | slice 13 |  |
| 19 | Intent must not invent continuity for the removed scope. | slice 13 |  |
| 20 | Compare representative converted cases with their previous versions, so the simpler placement keeps the assertions that catch regressions (ADR 0010). | slice 12 |  |
| 21 | Coordination: this story owns interim placement into E2E / Frontend / Backend, including the move of the sessions batch. | slice 8 |  |
| 22 | Align touched files with queued SEED-300 page-object work rather than migrating a spec that work is rewriting in place. | slice 12 |  |
| 23 | Safe stopping point: each migrated batch preserves its distinct checks. | slice 12 |  |
| 24 | Each migrated batch removes the interim specs it replaces. | slice 12 |  |
| 25 | The story is complete when the interim entry and its runner are retired. | slice 13 |  |
| 26 | Required restriction: do not drop a distinct regression assertion when relocating a case. | slice 12 |  |
| 27 | Required restriction: do not mock inside a service except at the boundary the unit case needs. | slice 12 |  |
| 28 | Required restriction: do not fabricate Intent comparisons for the retired group (ADR 0008). | slice 13 |  |
| 29 | Required restriction: do not leave dead links for the retired group (ADR 0008). | slice 13 |  |
| KE1 | Example: `dashboard/tests/configuration/` still holds interim specs classified for Frontend or split conversion, and the configuration batch is converted. | slice 1 | observed: slice 1 converted all 11 dashboard/tests/configuration specs (mapping in slice 1 acceptance) |
| KE1.1 | Each distinct check runs under `npm run test:dashboard:frontend` and/or `npm run test:e2e`, as its assertions require. | slice 1 | observed: frontend.playwright.config.ts frontend-tests/configuration/ 15 passed; unfiltered Frontend 176 passed; e2e configuration/ 6 files 15 passed |
| KE1.2 | Those interim files are gone. | slice 1 | observed: dashboard/tests/configuration/*.spec.ts deleted (11 files) |
| KE1.3 | Their duration-list rows are gone. | slice 1 | observed: dashboard/integrated.longest-first(-project): 11 configuration rows removed; browser-group-shards and dashboard-test-files tests pass |
| KE1.4 | A representative Frontend case still fails the same way as its prior integrated version when the asserted UI rule is broken. | slice 1 | observed: AddProjectDialog.tsx aria-describedby break: interim project-add-refusal and frontend-tests/configuration/project-add-dialog.spec.ts both fail toHaveAttribute aria-invalid Expected "true" Received "false"; both pass restored |
| KE2 | Example: a mixed launch or session spec asserts both a real frontend–backend workflow outcome and detailed UI against answers the page alone can own, and the case is split. | slice 2 | observed: interim tests/launches/agent-launch-ad-hoc.spec.ts (split/small) split in slice 2 |
| KE2.1 | The workflow portion lives in E2E, or joins an existing E2E journey. | slice 2 | observed: e2e/launches/agent-launch-ad-hoc.spec.ts: fake-claude argv/cwd, kept record, Pygardon folder |
| KE2.2 | The UI portion lives in Frontend with controlled substitutes. | slice 2 | observed: dashboard/frontend-tests/launches/agent-launch-ad-hoc.spec.ts on frontendLaunchSubstitutes (placement, held/failed read, dialog focus) |
| KE2.3 | Neither side keeps the other's dependencies. | slice 2 | observed: grep: no dashboardServer/fake-gh/fake-claude/FakeGitHub import in frontend-tests/launches; no frontend substitute import in e2e/launches |
| KE3 | Example: every interim behavior already has a home and `dashboard/tests/**/*.spec.ts` holds no product cases, and the group is retired. | slice 13 |  |
| KE3.1 | Intent and CI no longer list **Dashboard Integrated UI Test**. | slice 13 |  |
| KE3.2 | `test:dashboard:integrated` and its Playwright config and producer are gone. | slice 13 |  |
| KE3.3 | Placement guidance describes three groups. | slice 13 |  |
| KE3.4 | Shared helpers under `dashboard/tests/support/` remain importable. | slice 13 |  |
| KE3.5 | An old integrated proof artifact from a prior revision stays readable without looking like current proof. | slice 13 |  |
| KE4 | Example: a new interim spec exists that the inventory never named (today: `tests/sessions/recently-done-returned-sessions.spec.ts` and `tests/review/story-review-diff-line-follow-up.spec.ts`), and its batch is converted. | slice 10 |  |
| KE4.1 | Placement follows the case's observable boundary, not a missing inventory row. | slice 10 |  |
| KE4.2 | The interim copy is removed. | slice 10 |  |
| X1 | No new browser test group. | slice 13 |  |
| X2 | No permanent renaming of the interim tier. | slice 13 |  |
| X3 | No speed or shard-count goal beyond what retirement naturally changes. | slice 13 |  |
| X4 | No Intent E2E naming or tagged-install proof; SEED-334#observe-tagged-install-and-read-e2e-proof owns that. | slice 13 |  |
| X5 | No wholesale re-inventory before conversion. | slice 12 |  |
| X6 | No product behavior change. | slice 13 |  |
| X7 | Later simplification inside the E2E / Frontend / Backend homes belongs to SEED-341#simplify-remaining-session-tests, not to this story. | slice 8 |  |
| X8 | Do not migrate a spec that queued SEED-300 page-object work is rewriting in place. | slice 12 |  |
| X9 | This story does not own the single browser-group roster (SEED-334#keep-one-browser-test-group-roster). It updates that roster or its hard-coded callers, depending on whether that story has landed. | slice 13 |  |
