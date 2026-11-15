# Source review — SEED-334#focus-detailed-dashboard-ui-checks

Launch: fresh general-purpose subagent (no conversation inheritance, fork or
resume) started by the execution coordinator on 2026-11-15 after Terry
amended the story to the delivered configuration, launch and session
lifecycle batches and moved the rest to
SEED-334#finish-dissolving-integrated-ui-test. Input: only the amended
story's Goal, Scope (including Scope limits and Required restrictions) and
Key examples from `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md#focus-detailed-dashboard-ui-checks`;
no plan, product, proof or slice scope. Instructions: use only these inputs,
read no project files, change nothing, number every commitment, split
compound items. It replaces the review of the original story text; the
returned commitments and exclusions are recorded below as returned.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers get detailed feedback from unit tests for one service for the dashboard's configuration, launch, and session lifecycle checks. | slice 6 | observed: unfiltered Dashboard Frontend Test 269 passed with dashboard/frontend-tests/{configuration,launches,sessions}/ (slice 6 accepted proof) |
| 2 | Developers get confidence in representative product workflows from end-to-end tests for those same checks. | slice 6 | observed: e2e/configuration, e2e/launches and e2e/sessions journeys moved or joined in slices 1–6, focused E2E runs passed per slice |
| 3 | The interim **Dashboard Integrated UI Test** group no longer holds those batches. | slice 6 | observed: dashboard/tests/configuration/ and dashboard/tests/launches/ are gone and the 11 session lifecycle and done-terminal specs are gone from dashboard/tests/sessions/ at 64e07ab2c |
| 4 | Every distinct behavior those batches proved keeps a home that catches the same regressions. | slice 6 | observed: per-interim-test mapping tables and scratch-break comparisons in slices 1–6 accepted proof; G1 and G2 dispositions |
| 5 | The batches in scope are the following (5a.1–5a.3): | slice 6 | observed: slices 1–6 cover 5a.1–5a.3 |
| 5a.1 | The configuration batch. | slice 1 | observed: slice 1 accepted proof (dashboard/tests/configuration/ removed) |
| 5a.2 | The launch dialog and start batch. | slice 5 | observed: slices 2–5 accepted proof (dashboard/tests/launches/ removed by slice 5) |
| 5a.3 | The session lifecycle and done-terminal part of the sessions batch, made up of 5b.1–5b.8: | slice 6 | observed: slice 6 accepted proof |
| 5b.1 | `agent-launch-ad-hoc-sessions` | slice 6 | observed: dashboard/frontend-tests/sessions/agent-launch-ad-hoc-sessions.spec.ts and e2e/sessions/agent-launch-ad-hoc-sessions.spec.ts |
| 5b.2 | `agent-launch-retained-history` | slice 6 | observed: dashboard/frontend-tests/sessions/agent-launch-retained-history.spec.ts and e2e/sessions/agent-launch-retained-history.spec.ts |
| 5b.3 | `agent-launch-sessions-unanswered` | slice 6 | observed: dashboard/frontend-tests/sessions/agent-launch-sessions-unanswered.spec.ts |
| 5b.4 | `agent-launch-story-card-delete` and its problems | slice 6 | observed: dashboard/frontend-tests/sessions/agent-launch-story-card-delete{,-problems}.spec.ts |
| 5b.5 | `agent-launch-story-card-done` | slice 6 | observed: dashboard/frontend-tests/sessions/agent-launch-story-card-done.spec.ts and e2e/sessions/agent-launch-story-card-done.spec.ts |
| 5b.6 | `agent-terminal-done` with its pending and question cases | slice 6 | observed: dashboard/frontend-tests/sessions/agent-terminal-done{,-pending,-question}.spec.ts and e2e/sessions/agent-terminal-done{,-pending}.spec.ts |
| 5b.7 | `compact-session-entry` | slice 6 | observed: dashboard/frontend-tests/sessions/compact-session-entry{,-cursor}.spec.ts |
| 5b.8 | `session-unread-report-message` | slice 6 | observed: dashboard/frontend-tests/sessions/session-unread-report-message.spec.ts and e2e/sessions/session-unread-report-message.spec.ts |
| 6 | Promote to E2E only the few remaining representative workflows whose observable outcome still requires the real dashboard frontend and backend together. | slice 6 | observed: slices 1–6 mapping tables place only argv, stored records, native calls and server refusals in E2E |
| 7 | Prefer an existing E2E workflow when it already proves that outcome. | slice 6 | observed: joined journeys e2e/launches/agent-launch-ad-hoc-attachments.spec.ts, session-instruction-voice{,-provider-failures}.spec.ts, e2e/configuration/project-remove.spec.ts, system-settings-openai.spec.ts; slice 5 reused existing E2E proof |
| 8 | Move the majority of these interim checks into Dashboard Frontend Test or Dashboard Backend Test. | slice 6 | observed: Dashboard Frontend Test grew from 161 to 269 cases across slices 1–6 |
| 9 | "Unit" here means those service-level Playwright groups. A unit case does the following (9a.1–9a.4): | slice 6 | observed: 9a.1–9a.4 rows |
| 9a.1 | Exercises one service at its highest practical entry point (built UI with controlled answers, or a backend boundary), or at a lower entry point when the behavior is clear and the dependency stable. | slice 6 | observed: converted Frontend specs run the built app through dashboard/tests/support/frontendApp.ts |
| 9a.2 | Runs the service's real code and in-boundary collaborators. | slice 6 | observed: frontendApp.ts serves the run's production frontend build |
| 9a.3 | Stays independent of other live services. | slice 6 | observed: grep shows no dashboardServer, fake-gh, fake-claude or FakeGitHub import under dashboard/frontend-tests/{configuration,launches,sessions} |
| 9a.4 | Mocks only a service boundary the case needs (for example a substitute backend answer for a frontend case). | slice 6 | observed: substitutes in dashboard/tests/support/frontend*Substitutes.ts answer only HTTP and WebSocket routes |
| 10 | Split mixed specs when their assertions belong at different boundaries. | slice 6 | observed: split cases listed in slices 1–6 mapping tables (e.g. agent-launch-ad-hoc, voice lifecycle and overflow, agent-terminal-done) |
| 11 | Use the migration inventory at `125c45649fa587c78ed7445deff35db87604489d` (`.planning/slice-plans/608-product-wide-end-to-end-tests/migration-purpose.json`, `migration-conversion-batches.json`, and `migration-trunk-merge.json`) as the starting classification. | slice 6 | observed: every slice brief started from migration-purpose.json at 125c45649 and reported each spec's class |
| 12 | Decide each case by its behavior. Qualification: the inventory is only a starting point. | slice 6 | observed: mapping tables record per-case placement, including inventory redundancy hints kept when no other proof asserted the check |
| 13 | Compare representative converted cases with their previous versions so the simpler placement keeps the assertions that catch regressions (ADR 0010). | slice 6 | observed: scratch-break comparisons recorded under each of slices 1–6 accepted proof |
| 14 | This story owns interim placement of its batches into E2E / Frontend / Backend. | slice 6 | observed: slices 1–6 placed every spec of the batches |
| 15 | Align touched files with queued SEED-300 page-object work rather than migrating a spec that work is rewriting in place. | slice 6 | observed: SEED-300 is queued and unrefined; its audit links were relinked to the new homes in .planning/seeds/SEED-300-dashboard-test-page-objects.md |
| 16a | Safe stopping point: each migrated batch preserves its distinct checks. | slice 6 | observed: each slice delivered as its own published increment with passing focused proof |
| 16b | Safe stopping point: each migrated batch removes the interim specs it replaces. | slice 6 | observed: each slice removed its interim specs and their dashboard/integrated.longest-first* rows |
| 17 | Required restriction: do not drop a distinct regression assertion when relocating a case. | slice 6 | observed: mapping tables; G1 and G2 dispositions in the plan |
| 18 | Required restriction: do not mock inside a service except at the boundary the unit case needs. | slice 6 | observed: same as 9a.3 and 9a.4 |
| 19 | Key example 1. Pre-condition: `dashboard/tests/configuration/` still holds interim specs classified for Frontend or split conversion. Trigger: the configuration batch is converted. Results 19.1–19.4: | slice 1 | observed: slice 1 converted all 11 dashboard/tests/configuration specs |
| 19.1 | Each distinct check runs under `npm run test:dashboard:frontend` and/or `npm run test:e2e`, as its assertions require. | slice 1 | observed: frontend.playwright.config.ts frontend-tests/configuration/ 15 passed; e2e configuration journeys passed (slice 1) |
| 19.2 | Those interim files are gone. | slice 1 | observed: dashboard/tests/configuration/*.spec.ts deleted (11 files) |
| 19.3 | Their duration-list rows are gone. | slice 1 | observed: dashboard/integrated.longest-first(-project): 11 configuration rows removed; browser-group-shards and dashboard-test-files tests pass |
| 19.4 | A representative Frontend case still fails the same way as its prior integrated version when the asserted UI rule is broken. | slice 1 | observed: AddProjectDialog.tsx aria-describedby break failed interim project-add-refusal and frontend-tests/configuration/project-add-dialog.spec.ts with the same aria-invalid message; both pass restored |
| 20 | Key example 2. Pre-condition: a mixed launch or session spec asserts both a real frontend–backend workflow outcome and detailed UI against answers the page alone can own. Trigger: the case is split. Results 20.1–20.3: | slice 2 | observed: interim tests/launches/agent-launch-ad-hoc.spec.ts (split/small) split in slice 2 |
| 20.1 | The workflow portion lives in E2E, or joins an existing E2E journey. | slice 2 | observed: e2e/launches/agent-launch-ad-hoc.spec.ts: fake-claude argv/cwd, kept record, Pygardon folder |
| 20.2 | The UI portion lives in Frontend with controlled substitutes. | slice 2 | observed: dashboard/frontend-tests/launches/agent-launch-ad-hoc.spec.ts on frontendLaunchSubstitutes (placement, held/failed read, dialog focus) |
| 20.3 | Neither side keeps the other's dependencies. | slice 2 | observed: grep: no dashboardServer/fake-gh/fake-claude/FakeGitHub import in frontend-tests/launches; no frontend substitute import in e2e/launches |
| X1 | SEED-341#simplify-remaining-session-tests owns later simplification inside the E2E / Frontend / Backend homes. That simplification is not this story's work. | slice 6 | observed: slice 6 placed session specs without redesigning their scenarios |
| X2 | The other interim batches belong to SEED-334#finish-dissolving-integrated-ui-test. So does retiring the interim entry and its runner. | slice 6 | observed: plan 632 and the queued SEED-334#finish-dissolving-integrated-ui-test entry first in .planning/PRODUCT-BACKLOG.md Backlog list |
| X3 | Only the session lifecycle and done-terminal part of the sessions batch is in scope. The source says "part of the sessions batch", so the rest of that batch is out of scope by implication. | slice 6 | observed: the other dashboard/tests/sessions specs remain for plan 632 |
| X4 | No new browser test group. | slice 6 | observed: frontend, backend, e2e and integrated Playwright configurations unchanged in number |
| X5 | No permanent renaming of the interim tier. | slice 6 | observed: Dashboard Integrated UI Test entry and npm script unchanged |
| X6 | No speed goal. | slice 6 | observed: no speed claim in the plan or deliveries |
| X7 | No shard-count goal. | slice 6 | observed: CI shard counts unchanged |
| X8 | No wholesale re-inventory before conversion. | slice 6 | observed: conversion started from the existing inventory |
| X9 | No product behavior change. | slice 6 | observed: no dashboard/src change since 546675333; dashboard/server gained only DOUGH_REVISION_OBSERVATION_TRACE-gated stderr trace lines (CI repair 79e027f72) |
