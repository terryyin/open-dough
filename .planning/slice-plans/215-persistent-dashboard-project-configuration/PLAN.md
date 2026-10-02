# Persist dashboard project configuration

**Identity:** SEED-083#persistent-dashboard-project-configuration
**Source:** [Refined story](../../seeds/SEED-083-persistent-dashboard-project-configuration.md#persistent-dashboard-project-configuration).
**Authority:** Terry invoked `dough-execute-plan` on 2026-10-02 with the established published start below, authorizing execution and story-branch delivery.
## Execution identity

- Story: `SEED-083#persistent-dashboard-project-configuration`; publisher `dashboard-territory.local-open-dough`; agent `DavidKo-chan`.
- Owned execution checkout: `/Users/terryyin/git/open-dough/.worktrees/persist-dashboard-project-configuration`, branch `codex/persist-dashboard-project-configuration`, reused from the established start. Story Branch Mode.
- Originating checkout is this execution checkout; integration checkout: `/Users/terryyin/git/open-dough` (not mutated by increment delivery).
- Starting revision: `8e83ed742bfbcf9b31a3ec9a7b12f34dc278dd89`; published claim and initial candidate: `db6b0da9a8e1707048b8a5134daf9381f9fe7567` on `origin/refs/heads/main` and the remote execution branch. Claim CI is unobserved.
- Increment destination: `origin/refs/heads/codex/persist-dashboard-project-configuration`; eventual integration target: `origin/refs/heads/main`.
- Setup: exact Node `24.21.0` from `/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin`, locked npm and Chromium setup, native prerequisite check and dashboard typecheck passed in this checkout. Commands prepend that Node directory and `/opt/homebrew/bin` to `PATH`.
- CI: GitHub Actions, verified `ci.yml` push workflow; Codex coordinator `/root`, yielded cell `23`, stream session `55308`, PID `12079`, mailbox `/tmp/dough-ci-501/watch-CkhcLI`, bound to this execution checkout and remote execution branch. Managed increment delivery reuses this observer and registers accepted revisions.
- No numeric slice budget or exceptions are configured; judge boundedness by the selected coherent outcome and proof loop. Existing planning authority is retained for remaining-work refinement.
- Check-only commit hook: `.githooks/pre-commit` runs `npm run --silent lint -- --staged`; coordinator owns `npm run format`, which selects the repository's lintable file kinds and ignores. No generation trigger applies to dashboard source edits.
- Relevant Accepted ADRs: 0001 (domain names) and 0002 (cohesive single representations). ADR 0008 is Proposed; no Accepted decision conflicts with this work.


## Goal and boundaries

The developer adds and removes the projects each dashboard environment shows, using a GitHub URL and a local checkout path. Each environment's list stays on this machine across restarts, with no source edits. Production (the built dashboard) starts with today's four projects, and development (the live dev server) starts empty. Every repository, ref, and local-folder use reads the configured project.

Excluded, as the story defers them: editing a project in place, choosing a non-default ref or backlog path, isolating launch/session records per environment, cloning, AI-tool trust setup, and sharing configuration between machines.

## Existing solutions and direction

PFE across `dashboard/src` and `dashboard/server` found one catalog owner to replace, not a second one to add:

- `dashboard/src/publishedSource.ts` holds the four projects (`catalog`, `defaultSource`, `sourceById`, `adjacentSource`). Browser and server both import its values. The server imports them in `authenticatedRead.ts`, `sessionAdmission.ts`, `agentLaunches.ts`, `launchCatalog.ts`, `sessionAlerts.ts`, and `savedSessionServices.ts`. The browser imports them in `ProjectSelect.tsx`, `projectKeyboardNavigation.ts`, `publishedObservation.ts`, `dashboardRoute.ts`, `SidebarEntry.tsx`, and `TerminalSplit.tsx`. About 40 more files import only the `PublishedSource` type, which stays.
- `dashboard/server/projectFolders.ts` derives every local folder as `~/git/<id>`. Its callers are `agentLaunches.ts`, `agentLaunchAdmission.ts`, `launchRun.ts`, and `launchCatalog.ts`. The folder becomes a configured project fact. `shown` keeps the `~` form for display.
- `dashboard/server/localBoundaryPlugin.ts` is the one seam that knows whether a boundary runs under the dev server (`configureServer`) or a built preview (`configurePreviewServer`). The environment comes from there: dev means development, and preview means production. That is why this story does not wait for SEED-082's watcher, which also serves production through preview.
- Machine-local stores already live under `~/.open-dough/dashboard/`, resolved through `HOME` (`launchRecordDocument.ts`, `startStore.ts`, `launchAttemptStore.ts`). The project configuration follows the same placement and the same atomic-write discipline: one file per environment, `projects-production.json` and `projects-development.json`. The harness's temporary `HOME` isolates them in tests.
- `server/ghRead.ts` / `ghRevision.ts` run `gh api` through the existing boundary. The add check reuses them to read `repos/<owner>/<repo>` (`.default_branch`). The fake GitHub (`tests/support/fakeGitHub.ts`) gains that answer.
- The launch dialog's modal pattern (focus, Cancel/Escape, linked field feedback) is reused for Add project and Remove project.

Direction: one server-owned project configuration per environment, held by a single module that every server consumer and the browser read through. The browser gets the list from a loopback endpoint on the existing local boundary and changes it only through add and remove requests. The [product North Star](../../NORTH-STAR.md) and the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) currently forbid project registration. Slice 3 revises both with Terry's 2026-10-02 decision. Neither is an ADR. The only dashboard ADR, ADR 0008, is Proposed and binds nothing. No Accepted ADR (0000–0006) is affected.

## Observed premises

Observed on 2026-10-02 in this workspace at `ea47aef3` (fetched `origin/main` at `3a68f0c7` touches none of the files below except `.planning/NORTH-STAR.md`, so execution rereads that before editing).

| Premise consumed by | Observation and result |
| --- | --- |
| Slice 3 derives the ref from the default branch through `gh` | `gh api repos/<r> --jq .default_branch` returned `main` for terryyin/open-dough, nerds-odd-e/doughnut, and terryyin/pygardon, and `master` for terryyin/terry-talks. These match today's hardcoded refs. |
| Slice 2 seeding keeps today's folders; slice 3's origin check accepts real checkouts | `git -C ~/git/<id> remote get-url origin` returned `git@github.com:<owner>/<repo>.git` for all four. The origin check must accept the SSH form as well as HTTPS. |
| Slices 1–2 choose the environment per server mode | `server/localBoundaryPlugin.ts` installs each boundary through `configureServer` (dev) or `configurePreviewServer` (preview), never both in one process. |
| Slice 2 keeps existing sessions | `~/.open-dough/dashboard/agent-launches.json` is keyed by project id (`open-dough`, `doughnut`, `pygardon`, `terry-talks`). Seeding the same ids keeps each record's project. |
| Every slice's proof runs isolated | `tests/support/dashboardServer.ts`/`fakeClaude.ts` start each server with a temporary `HOME` holding only `git/<folder>` directories a test chooses. 48 specs run in preview mode and 16 in dev mode (`grep 'mode: "dev"'`). The dev-mode specs name catalog projects, so slice 2's empty development start needs a harness option that writes their configuration. |
| Slice 3 proves the launch folder | `tests/support/fakeClaude.ts` records each start's `cwd`. |
| SEED-082 does not collide | `git diff --stat origin/main...codex/separate-dashboard-development-and-production-en` touches only release-runner files and its plan. Execution rechecks `vite.config.mts`, `localBoundaryPlugin.ts`, and `package.json` against trunk before slice 1. |

## Outside-in proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| Existing behavior unchanged while the catalog moves to the server | Slice 1: existing project-selection, keyboard, read-boundary, and launch specs stay green in preview and dev |
| Production first start keeps the four projects and their sessions; restart keeps the saved list (examples 2, 4) | Slice 2: a preview server in an empty temporary HOME shows the four projects and a pre-existing launch record, and writes `projects-production.json`. A second server on a configuration holding other projects shows those projects instead. |
| Development starts empty with an explanation and Add project (example 5, first half) | Slice 2: a dev server in an empty HOME shows the empty-state explanation, and the read boundary refuses `open-dough` |
| An unreadable configuration is reported, not replaced | Slice 2: a malformed file leaves the page explaining the file problem, and the file is byte-identical afterwards |
| Add saves, selects, reads from the default branch, launches in the configured folder, and survives restart (examples 1, 2) | Slice 3: a preview journey adds a fake-GitHub repository with a real `git init` checkout. Observe the selection, the read at the default-branch commit, the Start session `cwd`, and the project after a server restart. |
| Add in development does not reach production (example 5, second half) | Slice 3: dev and preview servers share one temporary HOME. Adding in dev leaves the preview list unchanged. |
| Each refusal names its reason, keeps the input, and saves nothing (example 3) | Slice 4: a journey for the origin mismatch naming both repositories, plus focused unit proof for URL forms, unreadable repository, missing folder, non-checkout folder, and duplicate repository or id |
| Remove confirms, drops the project, keeps disk and records, hides its sessions, and re-add restores them (example 6) | Slice 5: a preview journey removes a project with a record, checks the folder and record file are unchanged and its sessions are hidden, then re-adds it and sees them again |

Focused commands, once the named specs exist:
`npm run test:dashboard -- dashboard/tests/<spec>.ts --workers=1`
`npm run typecheck:dashboard` after each slice

Slice 1 also runs the existing specs that import catalog values (`grep -rl "publishedSource\|catalog" dashboard/tests`), because it changes the contract they rely on. Slice 2 runs every dev-mode spec. This repository requires no broader local suite. CI runs the full dashboard suite after publication.

## Ordered slices

### 1. One server-held project list feeds browser and server
Type: Structure
Status: done
Proof: Existing preview and dev specs that select, read, or launch catalog projects stay green unchanged. `npm run typecheck:dashboard` passes.

Structure: Add a server module that owns the project list for its environment, still built from today's four projects, including each folder (`~/git/<id>`). Route `authenticatedRead`, `sessionAdmission`, `agentLaunches`, `launchCatalog`, `sessionAlerts`, `savedSessionServices`, and `projectFolders` through it. Add a loopback endpoint on the existing local boundary that returns the list. The browser loads it before its first published read, and `ProjectSelect`, keyboard navigation, routing, the sidebar, and the terminal split take projects from that loaded list instead of module constants. `publishedSource.ts` keeps only the `PublishedSource` type, extended with the folder on the server side only, so the browser never receives a local path it does not display. This enables slice 2 to swap the list's source for the saved configuration.

Safe stop: the dashboard behaves exactly as today.

### 2. Each environment keeps its own saved project list
Type: Behavior
Status: planned
Proof: New `project-configuration.spec.ts` (preview and dev) covers the four rows for slice 2 in the proof table. The harness gains a configuration option. By default it writes the four-project development configuration, so the 16 existing dev-mode specs pass unchanged. The empty-start case opts out.

Behavior: Server start in an environment with no configuration file → production writes `projects-production.json` with the four projects and shows them, and development shows "No projects configured" with an Add project action, which is inert until slice 3. A server started on an existing file shows exactly the saved projects in saved order. The first project is the default selection. An unknown `?project=` keeps today's normalization. A malformed or unreadable file shows an explanation naming the file and leaves it unchanged. The hardcoded list leaves source. README and `AGENT-LAUNCH.md` describe the saved configuration instead of the fixed catalog and `~/git/<id>`.

Safe stop: production behaves as before. Development is usable only after a configuration is supplied, and slice 3 supplies the way to create one.

### 3. Add project saves a validated project and selects it
Type: Behavior
Status: planned
Proof: New `project-add.spec.ts` covers both slice 3 rows in the proof table. Focused unit proof covers URL parsing (HTTPS with and without `.git`, SSH) and id and name derivation.

Behavior: In either environment, Add project opens a modal with GitHub URL and Local path, prefilled `~/git/<repo>`. Add with a readable repository and a folder whose `origin` names it → the server derives id and name from the repository name and the ref from `.default_branch`, appends the project atomically, and the page selects it and reads its backlog. Launches run in the configured folder, the project survives restart, and the other environment's list is unchanged. Cancel/Escape saves nothing and returns focus. Replace `launchWorkflow.ts:workspaceWords`’s reconstructed `~/git/<id>` with the server-projected displayed workspace fact so custom-folder launch explanations agree with the actual cwd. Update both North Stars and the dashboard README to replace "no project registration" with configured projects (Terry, 2026-10-02), keeping their other rules.

### 4. Add project refuses an invalid project with its reason
Type: Behavior
Status: planned
Proof: A journey in `project-add.spec.ts` for the origin mismatch (both repositories named, dialog open, values kept, file unchanged), plus focused server unit proof for each other refusal.

Behavior: Add with a non-GitHub URL, a repository `gh` cannot read, a missing folder, a folder that is not a Git checkout, a checkout whose `origin` names another repository, or a repository or id already configured → the dialog stays open with the reason linked to its field, the entered values stay, and nothing is saved. The duplicate-id refusal is justified because records are keyed by id.

### 5. Remove project takes it off the list and keeps everything else
Type: Behavior
Status: planned
Proof: New `project-remove.spec.ts` covers the slice 5 row in the proof table, including the keyboard path and focus after the confirm dialog closes.

Behavior: Remove project on the selected project opens a confirmation naming it and stating that nothing on disk or on GitHub changes. Confirm → the project leaves the list and the saved file, the next project (or the empty state) is selected, and its sessions leave Recent sessions and the Sessions sidebar. Its folder and launch records stay unchanged. Adding the same repository again shows its sessions again. Cancel changes nothing.

## Current decisions

- Environment equals server mode: dev means development, and built preview (including SEED-082's production watcher) means production. A preview started by hand from a checkout also uses the production list.
- Files: `~/.open-dough/dashboard/projects-<environment>.json`, written atomically (temporary file then rename) and serialized within one server. Only a missing file triggers production seeding. An existing empty list stays empty.
- Seeded projects keep their current names and refs and are not validated at seeding. Validation applies to Add only.
- The browser receives project ids, names, repositories, and refs. Local paths appear only in the add and remove dialogs and in launch explanations, in their displayed `~` form.

## Considered and excluded

- A hand-edited configuration with no UI: replaced by Terry's choice of Add and Remove in the dashboard.
- Editing in place, custom ref or backlog path, per-environment record isolation, toy-project fixtures shipped with development, and a project-registration service or database: excluded or deferred by the story.

## Accepted execution proof

All commands run in the execution checkout with `PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH`. Color variables are cleared because inherited `NO_COLOR` conflicted with Playwright's `FORCE_COLOR` and violated the quiet reporter.

### Slice 1

- Promise/boundary: unchanged selection, pinned published reads and refresh, routes, keyboard navigation, session sidebar and launch admission/cwd in dev and preview, now supplied by the server list.
- Inspected setup: `dashboardServer.ts` runs real Vite with isolated HOME and fake GitHub/hosts; fixtures supply published records and starting folders, never the loaded list response or browser work.
- Inspected observations: `authenticated-project-overview.spec.ts` iterates all four repositories and verifies selected backlog, pinned gh calls and refresh in both modes; `agent-launch-boundary.spec.ts` verifies actual host cwd and admission; `agent-roster.spec.ts` verifies exact awaited normalized URL and history; project-keyboard specs verify wrapping/focus/eligibility; `session-sidebar.spec.ts` verifies cross-project labels and navigation. `project-configuration-boundary.spec.ts` verifies four ordered ids, exact public fields without local paths, no-store, local-origin/Host/method refusals and no subprocess calls in both modes.
- `env -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard` — pass.
- `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/authenticated-read-subprocess-lifecycle.spec.ts dashboard/tests/project-keyboard-navigation.spec.ts dashboard/tests/authenticated-read-boundary.spec.ts dashboard/tests/agent-launch-start-refusal.spec.ts dashboard/tests/agent-launch-session-listing.spec.ts dashboard/tests/project-keyboard-navigation-focus.spec.ts dashboard/tests/project-keyboard-navigation-eligibility.spec.ts dashboard/tests/session-result-admission.spec.ts dashboard/tests/authenticated-project-overview.spec.ts dashboard/tests/authenticated-read-refusal.spec.ts dashboard/tests/authenticated-read-revision-check.spec.ts dashboard/tests/authenticated-read-containment.spec.ts dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-codex-model-boundary.spec.ts dashboard/tests/session-sidebar.spec.ts dashboard/tests/agent-launch-preparation-store-failure.spec.ts dashboard/tests/agent-roster.spec.ts dashboard/tests/agent-launch-boundary.spec.ts dashboard/tests/project-configuration-boundary.spec.ts --workers=1` — pass; all 20 selected specs.
- `git diff --check` — pass.
- Learning: asynchronous initial project loading requires the roster test to await the same exact normalized URL. The fixed-folder workspace explanation remains accurate for this slice and is assigned to slice 3 before custom-folder support.

- Independent refactor: `App.tsx` delegates fetch/state to `projectList.tsx:useProjectConfiguration` and status/failure/notice DOM to `PublishedReadStatus.tsx`; every formatted changed dashboard file is at most 250 lines. Server/admission/route/keyboard/sidebar/terminal implementations and earlier observations remain unchanged.
- Refactor proof: `env -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard` and `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/authenticated-project-overview.spec.ts dashboard/tests/accessible-overview-keyboard.spec.ts dashboard/tests/refresh-focus.spec.ts --workers=1` — pass. Inspected setup remains real server/published-origin fixtures; overview observes loaded list and all four project reads, accessible overview observes persistent live regions, reading/success/failure and retained focus, refresh-focus observes disappearing-work notice and its clearing.

- Formatting repairs: explicit public-field projection, `writeHead` for the refusal status, and an explicit test-source guard replaced three mechanical lint violations. `env -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard` and `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/project-configuration-boundary.spec.ts dashboard/tests/agent-launch-preparation-store-failure.spec.ts --workers=1` — pass; exact public field/refusal assertions and unchanged preparation recording assertions inspect the affected boundaries.

### CI repair during slice 2 pause

- Registered slice-1 SHA `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`, run `36978735074`, attempt `1`, failed in `startup-host-words.spec.ts:45`: context teardown disposed an unfinished intercepted API response. The startup fixture now drains handlers with `page.unrouteAll({ behavior: "wait" })` in `afterEach`; product behavior and startup assertions are unchanged.
- Inspected disposable setup/observation: a real 200 launch-boundary response held between `route.fetch` and `response.json`; closing context before release reproduced the exact disposed-response error. Draining handlers before context close leaves the response readable. Green diagnostic retained outside the checkout at `/tmp/open-dough-ci-route-lifecycle-proof.ts`; no temporary spec is shipped.
- Red: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/ci-route-lifecycle.spec.ts --workers=1` — exit 1, exact disposed-response error.
- Green: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/ci-route-lifecycle.spec.ts dashboard/tests/startup-host-words.spec.ts --workers=1` — pass, diagnostic plus both unchanged host/mode/control journeys. `env -u NO_COLOR -u FORCE_COLOR npm run typecheck:dashboard` and `git diff --check` — pass.
- Independent refactor: none, already clean; supplied proof unchanged, no additional tests. Slice 2 remains planned and paused until unfinished work is restored.
- Separate CI failure: `agent-session-cursor.spec.ts:117` expects only attach/stop while unchanged pre-story `hostOperations()` also projects `launchedSessions: false`. Source and assertion both predate this execution; known other Cursor execution checkout owns the integration. Proposed assertion alignment awaits explicit authority; no change made on that path.
