---
id: SEED-083
status: active
planted: 2026-10-02
planted_during: Terry's request to replace hardcoded dashboard project information
scope: story
---

# SEED-083: Persist dashboard project configuration

## Why This Matters

A developer needs to add projects to the dashboard without changing hardcoded
project information. Each project needs its GitHub repository URL and the local
path containing its checkout, retained across dashboard restarts.

## Story

<a id="persistent-dashboard-project-configuration"></a>

### Persist dashboard project configuration

**Identity:** SEED-083#persistent-dashboard-project-configuration
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/215-persistent-dashboard-project-configuration/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a56a7374e0daa8d9eb973337e975a2a8ed1ab9fbc8ef7290f021c95cc38ff18e","plan":"22e3f4659dced2c4010baded3166b28fea4273818066a90a69d15ed700c7d9b6"}}
```

**Goal:** A developer adds real projects to the production dashboard by
supplying each project's GitHub URL and local checkout path, removes ones they no
longer want, and those projects stay configured across restarts without
source-code edits. The development dashboard keeps its own project list, so
manual testing works on toy projects instead of acting on real ones.

**Scope:**

- Replace the hardcoded project catalog with a project configuration held on
  this machine, one per environment: production (the built dashboard) and
  development (the live development server). Neither environment shows or acts
  on the other's projects.
- **Add project** in the dashboard takes a GitHub repository URL and a local
  checkout path, validates them, saves the project, and selects it.
- **Remove project** takes a project off that environment's list. Its checkout,
  repository, and local launch/session records are untouched.
- Every dashboard operation that needs a project's repository, ref, or local
  folder uses the configured values: published reads, the read boundary's
  allowed projects, launches, sessions, and workspace creation.
- First start without a configuration: production starts with the four current
  projects (Open Dough, Doughnut, Pygardon, Terry Talks) with their current
  names, refs, and `~/git/<id>` folders. Development starts empty. After that
  first start, only the saved configuration counts, and no project list remains
  in source.
- An empty list shows an explanation and **Add project**, not a failed read.
- Update the UX/UI North Star and the product North Star, which currently forbid
  project registration, to describe configured projects.

**Decisions** (Terry agreed on 2026-10-02 to the add form, per-environment
lists, seeding production, and add plus remove; the details below are this
refinement's choices):

- The form asks for the GitHub URL (`https://github.com/<owner>/<repo>`, with or
  without `.git`, or `git@github.com:<owner>/<repo>.git`) and the local path,
  which is prefilled as `~/git/<repo>` and can be changed. `~` expands to the
  home folder.
- The dashboard derives the rest: the project id and name come from the
  repository name, the ref is the repository's default branch at add time, and
  the backlog path stays `.planning/PRODUCT-BACKLOG.md`.
- Add is refused, with the reason beside the field and the entered values kept,
  when: the URL is not a GitHub repository URL; the repository cannot be read
  with the developer's `gh` access; the path is not an existing folder; the
  folder is not a Git checkout whose `origin` names that repository; or the
  repository or its id is already in this environment's list. The id
  refusal is justified because launch and session records are keyed by project
  id, so a duplicate would merge two projects' sessions.
- A repository without a published backlog may still be added; it shows the
  existing missing-backlog read result.
- Remove asks for confirmation naming the project and stating that nothing on
  disk or on GitHub changes. A removed project's sessions leave the Recent
  sessions list and the Sessions sidebar. Adding the same repository again
  brings them back, because the id is the same.
- A configured folder that later disappears is reported by the existing launch
  check, which names the configured path. The dashboard does not edit or drop
  the entry on its own.
- A configuration file that cannot be read is reported with its path. The
  dashboard does not replace it or reseed it, because that would lose the
  developer's projects.

**Key examples:**

1. Production, Open Dough selected; the developer opens Add project, enters
   `https://github.com/terryyin/sample-app` and `~/git/sample-app` (an existing
   checkout of it); the project is saved and selected, its published backlog
   is read from its default branch, and Start session runs in
   `~/git/sample-app`.
2. Production restarts; Sample App is still in the project choices with the same
   URL, ref, and folder, without re-entry.
3. The developer enters a path whose `origin` is `terryyin/other-app`; Add is
   refused, the message names both repositories, and nothing is saved.
4. Production's first start after this change, with no configuration: the four
   current projects appear exactly as before, and their existing sessions are
   still listed.
5. The developer opens the development dashboard for the first time; it shows
   no projects, only an explanation and Add project. They add a toy repository
   there; it appears in development only, and production's list is unchanged.
6. The developer removes Terry Talks in production after confirming; it leaves
   the project choices, its checkout and session records stay on disk, and
   another project is selected.

**Boundary and deferred promises:**

- Editing a configured project in place is deferred: remove and add it again.
  Choosing a non-default ref or backlog path is deferred.
- Moving or isolating local launch/session records per environment stays
  deferred, as in SEED-082. Development's toy projects keep their records in
  the same machine-wide store, and a project shows only in the environment that
  configures it.
- Cloning repositories, setting up AI tools to trust project paths, and sharing
  configuration between machines are outside this story.

**UI:** Add project and Remove project sit with the project choices in the
pinned banner. Add opens a modal dialog with the two fields, Add and Cancel;
Cancel and Escape save nothing and return focus to Add project. A refused add
keeps the dialog open with the reason linked to its field. The project list keeps
today's tab-shaped choices and arrow-key switching.

**Architecture:** The catalog moves from a module that browser and server both
import (`dashboard/src/publishedSource.ts`) to one project configuration owned
by the local dashboard server. The browser receives the list from the server
and changes it only through Add and Remove. The read boundary, launch admission,
and project folders (`dashboard/server/projectFolders.ts`, now the fixed
`~/git/<id>`) take their projects from the server's configuration, so there is
one owner and no second list. The configured local folder becomes a project
fact, still held on this machine and never part of what the browser reads from
GitHub. The configuration is machine-local settings, not project state: the
North Star rule that the observed repository is the authority on project state
still holds. Which configuration file a server uses follows from whether it is
the development server or the built (preview/production) server, so this story
does not depend on SEED-082's watcher landing first. Proposed ADR 0008 informs
this design but does not bind it, and no Accepted ADR is affected.

**Plan:** [Persist dashboard project configuration](../slice-plans/215-persistent-dashboard-project-configuration/PLAN.md).

**Capture:** Terry requested this as the second queued backlog story on
2026-10-02, authorizing capture, commit, and synchronization on main. This record
captures intended behavior; implementation and slice planning remain pending.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
