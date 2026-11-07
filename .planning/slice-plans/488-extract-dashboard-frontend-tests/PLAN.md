# Extract Dashboard Frontend Test as a separate entry

**Identity:** SEED-252#extract-dashboard-frontend-tests
**Source:** [Extract Dashboard Frontend Test as a separate entry](../../seeds/SEED-252-extract-dashboard-frontend-tests.md#extract-dashboard-frontend-tests)

## Goal and scope

Expose **Dashboard Frontend Test** as a separate Intent entry backed by
`dashboard/frontend-tests/`, beside `dashboard/tests/` and
`dashboard/backend-tests/`. Extract DOM-only specs and frontend specs that
verify UI recovery, status formatting, polling, or refusal feedback through
synthetic backend-service responses into `dashboard/frontend-tests/`, removing
incidental backend setup so those tests run without starting the real dashboard
backend service (`startDashboardServer`, `localBoundaries`, `fake-gh`,
`fake-claude`, `fake-codex`, or `FakeGitHub`). Split mixed files where frontend
cases coexist with genuine service-integration cases so both remain protected
and each case executes once. Keep `dashboard/frontend-tests/` flat when ten or
fewer files are extracted, or organize it into at most ten single-concept
feature groups using the existing feature vocabulary when more than ten files
are extracted. Do not change product runtime behavior beyond configuring and
browsing the new Intent location, redesign the shared Playwright runner or
twelve-shard CI schedule, or regroup `dashboard/backend-tests/`
([SEED-251](../../seeds/SEED-251-group-dashboard-backend-tests.md#group-dashboard-backend-tests)).

## Existing solution and decisions

- Reuse the multi-root discovery and CI proof architecture established in
  `dashboard/tests/support/testFiles.mjs`, `dashboard/tsconfig.node.json`,
  `eslint.config.mjs`, `.planning/open-dough.json`, `.github/workflows/ci.yml`,
  and `src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs`, which
  already partitions a single Playwright proof record across multiple configured
  dashboard entries by most-specific repository path.
- For DOM-only frontend tests (`page.setContent(...)`), import `test` and
  `expect` from `dashboard/tests/support/pageTest.ts` rather than
  `dashboard/tests/dashboardTest.ts`, avoiding `dashboardTest.ts`'s
  `baseURL -> dashboard -> github` fixture chain while preserving worker-scoped
  fixture compatibility (`launchJourney` registration hash and `page` teardown
  route draining).
- For frontend UI tests that exercise the built React app with synthetic backend
  responses, serve the run's existing prebuilt static bundle
  (`builtDashboardDir` from `dashboard/tests/support/dashboardBuild.ts`,
  prepared once by `globalSetup.ts`) with explicit route/WebSocket substitutes
  for the backend endpoints the page touches, without spawning `vite preview`,
  `boundaryServer`, `fake-gh`, `fake-claude`, `fake-codex`, or `FakeGitHub`.
- Keep shared helpers and fixtures in `dashboard/tests/` so `dashboard/tests/`,
  `dashboard/frontend-tests/`, and `dashboard/backend-tests/` share one support
  tree without duplication.
- Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) for
  domain vocabulary (when grouping is needed) and
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for dashboard boundaries. No ADR exception or North Star topic is warranted.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| Full dashboard discovery and case inventory are clean in this checkout | `npx playwright test --config dashboard/playwright.config.ts --list --reporter=json` in `/Users/terryyin/git/open-dough/.worktrees/extract-dashboard-frontend-test-as-a-separate-en` at `5bc745babd4009593e7e3b6e522db165318a16f9` | 743 root suites (475 under `tests/<feature>/`, 268 under `backend-tests/`), 2088 registered cases, zero discovery errors. Compare before/after JSON inventories so every original case identity is preserved once. |
| Twelve-shard allocation preview is balanced at baseline | `node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard` at `5bc745babd4009593e7e3b6e522db165318a16f9` | 743 jobs, 743 recorded, 0 unrecorded; 886.2–886.4 predicted job-seconds per share. Migrate duration labels in `dashboard/longest-first*` when moving or splitting specs so unrecorded count stays zero (or bounded for newly split files) and shards stay balanced. |
| Discovery, share deal, and CI proof collector unit checks pass in this checkout | `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs tests/support/ci-proof-declaration.test.mjs tests/support/dashboard-test-files.test.mjs` and `npm run --silent typecheck:dashboard` at `5bc745babd4009593e7e3b6e522db165318a16f9` | Both exited 0 (`scripts/test.sh` requires Homebrew Bash 5 on `PATH` on macOS). `fragmentFromPlaywrightRecord` already partitions arbitrary `--entry` lists by `owningEntry`. |
| A comparable successful CI baseline exists on `main` | `gh run list --workflow=ci.yml --branch=main --status=success --limit=3 --json databaseId,headSha,createdAt,updatedAt` | Run `42269123525` at `328b316e931db00f7f2f8427b6bf0050ab27e5cc` (296 s workflow wall, `2026-11-06T18:16:02Z`–`18:20:58Z`) and run `42318533230` at `626ecc24b28c398eaa4543e19936a415c526c0e9` (`2026-11-07T00:29:32Z`–`00:36:34Z`). Compare final published CI on the twelve Ubuntu shards. |
| Audit separates genuine frontend-only and mocked-backend cases from real-service journeys | Inspection of `setContent`, `page.route`, `routeWebSocket`, and fixture usage across all 475 specs in `dashboard/tests/` at `5bc745babd4009593e7e3b6e522db165318a16f9` | DOM-only: `runtime/touch-reading-observation.spec.ts` (1 case), `runtime/control-reachability-observation.spec.ts` (6 cases), and the 4 DOM geometry cases of `runtime/observation-measurements.spec.ts` (its 5th case tests `expectHeldGroups` against `githubFor(page).calls` and stays in `dashboard/tests/`). Mocked-backend / client-only UI cases: `intent/intent-candidates-read-recovery.spec.ts` cases 2 & 3 (case 1 tests real `readTimeoutMs: 3_000` and stays), `terminals/agent-terminal-touch-paste-image.spec.ts` case 2 (case 1 tests real attachment disk write and stays), `launches/startup-host-words.spec.ts` (both cases), `launches/agent-launch-creation-gates.spec.ts` case 3 (cases 1 & 2 test real creation store and stay), `sessions/sessions-sidebar-host-status.spec.ts` cases 4 & 5 (cases 1, 2, 3, 6 test real host/session reads and stay), `sessions/cursor-runner-sessions-demand.spec.ts` (1 case), `sessions/cursor-runner-sessions.spec.ts` case 7 (`feedback`; cases 1–6 test real Cursor runner and stay), and `launches/agent-launch-ad-hoc-attachments-refusal.spec.ts` (client-side picker validation, 1 case). Image stubs (`nerds-cartoon-portrait`, `agent-roster-collection`, `agent-terminal-avatar`), transport failures inside real-service journeys, and `route.fetch()` holds remain in `dashboard/tests/`. |

## Outside-in proof and ownership

- **Slice 1** owns the `dashboard/frontend-tests/` Intent entry (`Dashboard Frontend Test`), runner discovery, TypeScript/ESLint inclusion, CI proof fragment/summary wiring across `dashboard/tests`, `dashboard/frontend-tests`, and `dashboard/backend-tests`, Intent code-browse coverage of the new entry, and extraction of the DOM-only frontend specs (`touch-reading-observation.spec.ts`, `control-reachability-observation.spec.ts`, and the 4 DOM geometry cases split from `observation-measurements.spec.ts`) running on `pageTest.ts` without starting `dashboardServer` or `FakeGitHub`.
- **Slice 2** owns the lightweight frontend-only app fixture (serving `builtDashboardDir` with explicit service substitutes and no backend server), extraction and mixed-file splitting of the mocked-backend frontend test cases (`intent-candidates-read-recovery`, `agent-terminal-touch-paste-image`, `startup-host-words`, `agent-launch-creation-gates`, `sessions-sidebar-host-status`, `cursor-runner-sessions-demand`, `cursor-runner-sessions`, `agent-launch-ad-hoc-attachments-refusal`, and any remaining audited synthetic-response cases), applying the ten-file flat-versus-grouped rule, migrating duration records, updating maintained documentation (`dashboard/frontend-tests/README.md`, `dashboard/tests/README.md`, `dashboard/tests/feature-groups.md`, `dashboard/tests/shards.md`, `dashboard/backend-tests/README.md`, `tests/README.md`), and verifying complete CI execution and wall time.
- **Local gates**: selective lint/format (`npm run lint`), `npm run --silent typecheck:dashboard`, `PATH="/opt/homebrew/bin:$PATH" npm test -- src/skills/dough-test-optimization/scripts/ci-proof-*.test.mjs tests/support/ci-proof-declaration.test.mjs tests/support/dashboard-test-files.test.mjs tests/support/test-shares.test.mjs`, full Playwright `--list --reporter=json` case-identity comparison, `node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard`, and focused execution of every extracted, split, and path-sensitive spec under the maintained macOS sleep guard ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos): fully awake on observed AC with `caffeinate -s -i`, or the lid-open `caffeinate -i` procedure on battery with sleep-log inspection). Full hosted CI owns exhaustive 12-shard execution.
- **Failure policy**: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) applies as written.

## Ordered slices

### 1. Expose Dashboard Frontend Test and extract DOM-only specs
Type: Behavior
Status: planned
Proof: `.planning/open-dough.json`, `dashboard/tests/support/testFiles.mjs`,
`dashboard/tsconfig.node.json`, `eslint.config.mjs`, and `.github/workflows/ci.yml`
include `dashboard/frontend-tests` (`Dashboard Frontend Test`); `touch-reading-observation.spec.ts`,
`control-reachability-observation.spec.ts`, and the 4 DOM geometry cases of
`observation-measurements.spec.ts` run from `dashboard/frontend-tests/` on
`pageTest.ts` without starting `dashboardServer` or `FakeGitHub`, while the
held-group `githubFor(page)` case stays in
`dashboard/tests/runtime/observation-measurements.spec.ts`; `intent-code-browse.spec.ts`
browses `Dashboard Frontend Test`; discovery, CI proof collector, typecheck,
lint, and focused Playwright runs pass with all 2088 case identities preserved
once.

Behavior: A developer opening Intent sees **Dashboard Frontend Test** backed by
`dashboard/frontend-tests/` beside the existing entries, and DOM-only frontend
specs execute there under the shared runner and CI proof pipeline without
starting the dashboard backend service.

### 2. Extract mocked-backend frontend specs with explicit service substitutes
Type: Behavior
Status: planned
Proof: Extracted frontend UI specs (`intent-candidates-read-recovery`,
`agent-terminal-touch-paste-image`, `startup-host-words`,
`agent-launch-creation-gates`, `sessions-sidebar-host-status`,
`cursor-runner-sessions-demand`, `cursor-runner-sessions`,
`agent-launch-ad-hoc-attachments-refusal`, and any remaining Pure-UI cases from
the audit) run in `dashboard/frontend-tests/` against the prebuilt frontend with
explicit route/WebSocket service substitutes and without starting
`dashboardServer`, `fake-gh`, `fake-claude`, `fake-codex`, or `FakeGitHub`;
real-service sibling cases remain in `dashboard/tests/` and pass;
`dashboard/frontend-tests/` is kept flat if `<= 10` files or organized into at
most ten single-concept feature folders if `> 10` files; full `--list`
comparison preserves every original case once; `longest-first*` duration labels
and maintained docs are updated; final published CI passes across all twelve
shards without increased wall time against the comparable baseline.

Behavior: Frontend tests that verify UI recovery, formatting, polling, or
refusal feedback with synthetic backend responses run in **Dashboard Frontend
Test** using explicit service substitutes and no real backend service, while
integrated service journeys remain in `dashboard/tests/` and the entry is
flat or feature-grouped according to its file count.

## Refinement review

Refinement was not needed: the two Behavior slices separate DOM-only entry
wiring from mocked-backend UI fixture extraction, each with one cohesive proof
loop and no remaining slice-specific concern.

## Current decisions

- Keep shared test support in `dashboard/tests/`; do not duplicate helpers
  across `dashboard/tests/`, `dashboard/frontend-tests/`, and
  `dashboard/backend-tests/`.
- Do not split files merely to cross the ten-file grouping threshold; count the
  actual extracted spec files presented in Intent and apply flat (`<= 10`) or
  concise feature folders (`> 10`, at most ten single-concept groups from the
  existing feature vocabulary) accordingly.
