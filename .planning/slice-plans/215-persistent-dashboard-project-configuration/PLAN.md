# Persist dashboard project configuration

**Identity:** SEED-083#persistent-dashboard-project-configuration
**Source:** [Refined story](../../seeds/SEED-083-persistent-dashboard-project-configuration.md#persistent-dashboard-project-configuration).
**Authority:** Terry asked on 2026-10-02 for refinement and then a slice plan. This is preparation only: it does not authorize Take, implementation, or publishing the draft.
**Preparation:** Workspace `/Users/terryyin/git/open-dough/.worktrees/persist-dashboard-project-configuration` on `claude/persist-dashboard-project-configuration`, Preparing assignment `Jane-chan` (`ea47aef3`). Remote target `origin/main`; integration checkout `/Users/terryyin/git/open-dough`.

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
Status: planned
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

Behavior: In either environment, Add project opens a modal with GitHub URL and Local path, prefilled `~/git/<repo>`. Add with a readable repository and a folder whose `origin` names it → the server derives id and name from the repository name and the ref from `.default_branch`, appends the project atomically, and the page selects it and reads its backlog. Launches run in the configured folder, the project survives restart, and the other environment's list is unchanged. Cancel/Escape saves nothing and returns focus. Update both North Stars and the dashboard README to replace "no project registration" with configured projects (Terry, 2026-10-02), keeping their other rules.

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
