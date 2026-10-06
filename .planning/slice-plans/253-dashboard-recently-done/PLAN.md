# Dashboard shows recently done stories with their sessions

**Identity:** SEED-107#recently-done
**Source:** [refined story](../../seeds/SEED-107-dashboard-recently-done.md#recently-done).
**Prepared:** 2026-10-06. Planning only, in the established preparation workspace.

## Goal and boundaries

Completing a story publishes a short done record beside the product backlog,
and the dashboard's Recent sessions column becomes Recently done: one
newest-first list of recently done stories, each with this machine's sessions
for it inside its card, together with the sessions that belong to no done
story.

Scope, deferred promises, boundary assumptions, and key examples are those of
the source story. Material exclusions: a link from a done card to its seed or
plan, the developer's avatar, done records for work without a backlog entry,
and reconstructing earlier completions.

## Direction and PFE

Follow the [North Star](../../NORTH-STAR.md#done-stories-as-published-records)
topic “Done stories as published records”: one JSON file per done story beside
the backlog, written and pruned by `complete`, format and window owned by the
backlog scripts, read-only for the dashboard. It also follows “One backlog
interpretation, separate observation and presentation”: the dashboard imports
the shared reader and adds no second grammar. Accepted ADRs apply as follows:

- [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md): one meaning
  and owner per fact. A done record is a story fact; a session's Done mark
  stays local evidence.
- [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
  [0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  a new script file is declared in the installed payload.
- [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  the guidance change is written once for the executing agent.

PFE findings and choices:

- **Writing the record.** Change `complete` (`product-backlog.mjs`,
  `product-backlog-complete.mjs`). It already holds the removed entry's
  identity and title and reads the execution agent profile before deleting
  it. Add no separate command or wrap-up step.
- **Record format.** Add one small pure module beside
  `product-backlog-agent-profile.mjs` that owns the done record's directory,
  file name from the work identity, render, parse, and the 30-day window. It
  has no filesystem, Git, or Node-only import, as the profile module has none,
  so the dashboard imports it. No existing module has this meaning.
- **Developer name.** `complete` reads the workspace's configured `user.name`
  through the backlog's own Git helper (`product-backlog-git-repository.mjs`).
  The developer-credit helper in `dough-execute-plan` writes commit trailers
  and the backlog scripts import nothing from that skill; do not add that
  dependency. A workspace with no usable name writes the record without one.
- **Published read.** Extend the local read boundary the way agent profiles
  are read: a directory listing at the pinned revision decides which records
  exist, and only files the shared module names as done records are read
  (`reachablePaths.ts`, `requestedRead.ts`, `performedRead.ts`,
  `authenticatedProfileRead.ts`). No new boundary or cache.
- **Presentation.** Change `RecentSessions.tsx` into the Recently done list.
  Reuse `SessionEntry`/`SessionList`, `projectSessionsOf`, and
  `launchSubject(...).identity` for attachment, and `HumanCredit`'s plain-name
  form and the agent/host presentation Taken cards use. A done card is new;
  its sessions are the existing entries.
- **Navigation.** `recentSessionsEntry` and `deletedEntryHome`
  (`pageSessions.ts`) locate entries by the column's class and the session
  attribute; keep one locator for an entry wherever it sits in the list.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| `complete` holds the title, identity, and execution profile when it removes them (slice 1) | Read `product-backlog.mjs` `complete`: `completeEntry` returns the removed `entry`; `releaseAgentProfiles` parses each profile (`agent`, `host`, `model`) before `rmSync`. |
| `complete` is proved through the real CLI in a scratch project (slice 1) | `node --test tests/support/product-backlog-complete-profile.test.mjs tests/support/product-backlog-complete.test.mjs` → 10 pass, 0 fail. |
| The developer is the workspace's configured `user.name`, distinct from the agent author (slice 1) | `agent-commits.md`: the agent is `author.name` in the worktree config and the developer is the configured committer. `git log --diff-filter=D -- .planning/agents`: closure commits show the agent as author and `Terry Yin` as committer. |
| New payload scripts are declared by name (slice 1) | `install.sh` lists each `dough-product-backlog/scripts/*.mjs` file individually (lines 34–38 name the profile and complete modules). |
| Guidance now says closure leaves no record (slice 1) | `record-preparation.md` “Wrap-up cleanup”: “create no substitute readiness or progress record”. `dough-story-wrap-up/SKILL.md`: “The current snapshot must be free of that history”. Both are reworded in slice 1. |
| The dashboard reads a directory of JSON files beside the backlog at the backlog's revision (slice 3) | `readAgentProfilesAt` (`agents=profiles`) and `listedAgentProfilePaths` in `reachablePaths.ts`; `publishedWorkRead.ts` reads them at the snapshot revision. |
| Journeys can publish extra files beside the backlog and drive sessions (slices 3–4) | `takenAgentProfileRecords.ts` publishes profile texts through the fake GitHub; `npx playwright test dashboard/tests/agent-launch-recent-sessions.spec.ts dashboard/tests/backlog-preparing.spec.ts` in this workspace, after `npm ci` with `NODE_ENV` unset → exit 0, both journeys pass. |
| A session record names its story's work identity (slice 4) | `storyLaunchRequestSchema` carries `identity` and `title`; `cardSessionsOf` matches `launchSubject(record.request).identity`. Ad hoc requests carry none. |
| Renaming the column reaches many specs (slice 2 sizing) | `grep -rl "Recent sessions" dashboard/tests` → 30 files; `dashboard/*.md` and `docs/*.md` name it in 7 documents. |
| Next free plan number | `origin/main` history ends at 251; another preparation workspace holds `252-story-review-action-layout-after-sessions`. Allocated 253. |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| `complete` writes the record with the closure; fields; no agent without a profile | 1 | CLI tests in a scratch Git project |
| Records older than 30 days are removed by `complete` | 1 | CLI test with a controlled completion time |
| Guidance, requirements, ADR 0008 describe the record | 1 | Behavior review and reading |
| Column named Recently done everywhere | 2 | Renamed journeys and documents |
| Done card facts; one list by completion and launch time | 3 | Journey |
| No records publishes sessions as today; unreadable records are said | 3 | Journey |
| Dashboard leaves out a record older than 30 days | 3, 4 | Journey; slice 4 adds the session's return |
| Sessions inside the done card, open or done; none elsewhere | 4 | Journey |
| Sidebar navigation and delete focus | 4 | Existing navigation and delete journeys, extended |

## Ordered slices

### 1. Completing work publishes its done record
Type: Behavior
Status: done
Proof: Focused node tests through the real backlog CLI in a scratch Git
project (extend `tests/support/product-backlog-complete*.test.mjs`): a Taken
entry with an execution profile leaves one record with identity, title,
completion time, developer, agent, host, and model, beside the removed entry
and profile; a queued entry without a profile leaves a record with no agent or
host; a record completed 31 days before is removed by the next `complete` and
one from 29 days before stays; an identity containing `#` and `.` gets a
stable, readable file name; a repeated `complete` for an absent identity
writes nothing. The existing complete tests stay green. A behavior review
under AGENTS.md walks one wrap-up through the changed guidance.

Behavior: A developer's agent wraps up a Taken story. `complete` removes the
entry, releases the profile, and writes the story's done record in the same
change; its report names the record and any removed expired ones. Committing
the closure publishes them together (key examples 1 and 7, and the first half
of example 6).

Deliver together:

- the done-record module and its declaration in `install.sh`;
- `complete`'s write, prune, report, and usage text;
- `dough-product-backlog/SKILL.md` “Remove completed items”,
  `record-preparation.md` “Wrap-up cleanup”, and the wrap-up skill's deletion
  section, describing the record as committed with the closure and kept;
- the [requirements](../../../docs/project-visibility-requirements.md#recently-finished-stories):
  the record beside agent profiles, and the retained completed-work question
  answered;
- ADR 0008: one sentence under durable project state, and “recently finished
  story views” removed from its open-design list, as the story bounds it.

Accepted proof: `node --test tests/support/product-backlog-complete-profile.test.mjs
tests/support/product-backlog-complete.test.mjs
tests/support/product-backlog-complete-done-record.test.mjs` → 18 pass; the
eight `dough-execute-plan` and `dough-story-refinement` script tests that run
`complete` → 24 pass; `tests/product-backlog-payload-update.sh` → exit 0.
Records live in `.planning/done/<identity with # as _>.json`; the module is
`product-backlog-done-record.mjs`.

### 2. The column is named Recently done
Type: Behavior
Status: done
Proof: The existing Recent sessions journeys pass with the heading and
describing text asserted under the new name, and
`grep -rn "Recent sessions" dashboard docs` finds no remaining name for the
column.

Behavior: A developer opens the dashboard and reads the third column as
Recently done; it lists sessions exactly as before (key example 8). Interim:
the column holds no done stories until slice 3.

Deliver together: the heading, its describing text, element names, the specs
and `dashboard/tests/README.md`, and every dashboard and `docs/` document
naming the column. This slice changes no behavior beyond the name, so the 30
spec files change mechanically and apart from the new read.

Accepted proof: full dashboard suite 1084 passed with the one failure a
pre-existing flake (`session-unread-report.spec.ts:64`, 3 of 20 at baseline)
fixed in its test → 30 of 30; `npm run typecheck:dashboard` passes; `grep -rn
"Recent sessions" dashboard docs` finds none. Names: `RecentlyDone.tsx`, class
`recently-done`, locator `recentlyDoneEntry`, page part `recentlyDone`; spec
file names keep `recent`. `published-work.spec.ts` exempts this column from
its no-completion-words check.

### 3. Recently done lists done stories among the sessions
Type: Behavior
Status: planned
Proof: A new Playwright journey with the fake GitHub publishing done records
rendered by the shared module and the synthetic `claude` supplying sessions:
a done card shows title, completion time,
developer, and agent with host; a card whose record names no agent shows
none; a done story at 10:00 sits between an ad hoc session launched at 11:00
and a queued story's session launched at 09:00; a record completed 31 days
before is not shown; a revision with no record directory lists sessions
exactly as before; a failed record read says so in the column and still lists
sessions.

Behavior: A developer opens the dashboard for a project with published done
records (key examples 3 and 4). Interim: a done story's sessions still show
as separate entries in the same list until slice 4 moves them inside the
card.

Deliver together: the boundary's done-record read at the pinned revision; the
snapshot's done stories and their read failure; the done card; the merged
ordering; the 30-day display rule from the shared module.

### 4. A done story's card holds its sessions
Type: Behavior
Status: planned
Proof: Playwright journeys: a done story with one open and one done session
shows both inside its card, newest first, with their states and actions, and
neither as a separate entry; a session launched yesterday for a story done
last week stays inside the card and does not move it; on a machine with no
sessions for the story the card shows none; once the record is older than 30
days the open session is its own entry again. The Sessions sidebar navigation
journey opens a session inside a done card and reveals it; the delete journeys
move the keyboard to the neighbouring entry, including the last session inside
a card.

Behavior: A developer returns to a finished story's conversations from its
done card (key examples 2, 5, and the second half of 6).

Deliver together: attachment by work identity within the selected project;
the entry locator and deleted-entry home for entries inside a card; the
[session history](../../../dashboard/AGENT-LAUNCH-HISTORY.md) and dashboard
README describing the list as built.

## Current decisions

- The record's file name derives from the work identity alone, so completing
  the same identity again replaces its record.
- The completion time is the time `complete` runs, in UTC ISO form.
- The 30-day window is one exported value of the done-record module, used by
  `complete` and by the dashboard's display rule. It is not the dashboard's
  `launchRetentionDays`.
- SEED-106 may rename or reframe the same column first; execution uses the
  name and layout then on trunk.
- Work dropped rather than finished is removed with `complete --dropped`,
  which releases the profile and writes no done record, so Recently done shows
  finished work only. The wrap-up drop path and backlog guidance use it.
- `DOUGH_BACKLOG_COMPLETION_TIME` (ISO) stands in for `complete`'s clock in
  tests; journeys can render records with the shared module directly.
- Local proof is the focused tests named per slice. The repository pre-commit
  hook and hosted CI run the wider checks.

## Learnings

- The dashboard's published read wait bound runs on the page clock; a
  journey that advances page time must first await the startup read, or
  cards stay locked.
- Adding a file to `complete`'s change reaches tests that assert a closure
  commit's exact paths or a clean status (`dough-execute-plan` one-shot and
  agent-release tests); they change with the contract.
- A fresh worktree has no `node_modules`; the journeys fail with `spawn
  .../node_modules/.bin/vite ENOENT` until `env -u NODE_ENV npm ci` runs there.
