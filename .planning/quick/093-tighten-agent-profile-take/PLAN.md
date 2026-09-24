# Keep agent authorship safe for bare repositories and tighten agent profile Take

Status: planned.

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/093-tighten-agent-profile-take/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8e5fb4c76560a3ac2b1089905b1d5e0b0586a84044630dc360d51b6b6320a965"}}
```

## Source and provenance

Execution retrospective of `SEED-021#identify-taken-work-owner` (closed; story
section recoverable at
`ab179bea1e2854fa3c6cbf87b631ebef90d0c3d8:.planning/seeds/SEED-021-observe-published-story-progress.md`
and plan at
`ab179bea1e2854fa3c6cbf87b631ebef90d0c3d8:.planning/quick/091-identify-taken-work-owner/PLAN.md`).
Current behavior is described in
[project visibility requirements](../../../docs/project-visibility-requirements.md#agent-profiles-and-rotating-names).
Reviewed commits on
`claude/091-identify-taken-work-owner`: `567f9b2`, `78cbf28`, `c355207`,
`8c7ba14`, `ff33cb8` (CI repair), `a4bd897`; claim `920996f` is provenance.
That story's promises stand. This correction changes no profile format, name
list, rotation rule, or dashboard wording.

## Beneficiary and outcome

Developers whose repository is a bare repository with linked worktrees can
Take work without every checkout breaking. Developers starting parallel Takes get a name chosen against the same trunk
their claim is built on, so a rival publishing between startup's fetches
reselects instead of stopping. Maintainers change a host, mode, or profile
path in one place, and dashboard journeys stop passing silently through a
profile-read failure.

## Current findings

- `configureAgentAuthorship` in `workspace-publication-select.mjs` always runs
  `git config extensions.worktreeConfig true`. Reproduced: in a bare clone with
  a linked worktree, that plus a `--worktree` value makes `git status` fail
  with "fatal: this operation must be run in a work tree" in every worktree,
  because Git then expects `core.bare` in `config.worktree`. The first Take in
  such a repository would leave every checkout broken until someone removes the
  setting by hand. Normal clones are unaffected.
- `execution-start-operation.mjs` calls `selectClaimAgent` on the first
  fetch's `ref`; `selectOwnedWorkspace` then fetches again and bases the
  workspace on newer trunk. A rival that publishes the same name in between
  makes `commitWorkspaceClaim` stop `setup-failed` ("X-chan already holds …")
  after the workspace exists; the "most recent" name also comes from the older
  trunk. Untested.
- Host and mode vocabularies are declared three times:
  `product-backlog-agent-profile.mjs` (`agentHosts`; modes not exported),
  `execution-start-request.mjs` (mode list), and
  `dashboard/src/takenOwner.ts` (zod enums). Profile path spelling is rebuilt
  in `workspace-publication-startup-test-fixtures.mjs` (`assertPublishedAgent`)
  and hard-coded in `dashboard/tests/catalogProjectRecords.ts`.
- Dashboard fakes (`committedOrigin.ts`, the `publishMovingOrigin` path in
  `publishedOrigin.ts`, and helpers used by auto-refresh, story-readiness, and
  refresh specs) answer the new `.planning/agents` listing with
  `noConnection`, so those journeys render "Agent profiles could not be read."
  on every Taken card without asserting it.
- The `agents=profiles` refusals in `dashboard/server/requestedRead.ts`
  (combined with `path` or `since`, or a non-sha revision) have no case in
  `authenticated-read-refusal.spec.ts`.
- Rotation rules are fully covered by unit cases in
  `tests/support/product-backlog-agent-profile.test.mjs`, yet
  `workspace-publication-startup-agent.test.mjs` also runs three real-CLI
  rotation cases (about 9 s); "a released most recent name is not reused" is
  covered again by the release journey in
  `workspace-publication-startup-agent-release.test.mjs`. The legacy
  no-profile resume case lives apart from the recovery suite it extends.

## Scope

Included: a bare-layout fallback for workspace authorship; selection against the workspace's base trunk with reselection at
claim time; one exported home for hosts, modes, and profile paths used by the
startup, the dashboard, and test helpers; truthful dashboard fixture answers
for the agents listing; the missing refusal cases; the rotation and legacy
resume test consolidation named above.

Excluded: rewriting a repository's `core.bare` or `core.worktree` placement;
native host acceptance (decided below); reselection for a retained
resume whose replay meets its own name held elsewhere (accepted, safe gap in
plan 091); a crash between the backlog write and profile deletion in
`complete`.

## Preserved promises and constraints

- Every SEED-021 story 4 key example and the startup, race, resume, release,
  and dashboard behaviors accepted in plan 091.
- Take still publishes nothing when every name is held; the lost-race
  reselection and ordinary rebase replay stay as proved by
  `workspace-publication-startup-race.test.mjs`.
- The dashboard still reads only allowlisted profile files at the pinned
  revision, and a project without `agents/` still loads.

## Human decisions

- **Bare repositories (decided 2026-09-24).** Terry accepted the
  recommendation: keep worktree-config authorship for ordinary repositories;
  when the shared config sets `core.bare=true` or `core.worktree`, leave
  `extensions.worktreeConfig` untouched, author only the Take commit as the
  agent, and say so in the receipt. Do not move those settings for the
  developer, and do not refuse the Take.
- **Native acceptance (decided 2026-09-24).** No real Claude Code, Codex, or
  Cursor workspace has yet shown agent authorship, `--host`/`--model`
  reporting, or wrap-up through `complete` (ADR 0005 §3). Terry chose to watch
  real use instead of queuing an acceptance story.

## Current decisions

- Detect the bare layout from the repository's shared config before enabling
  `extensions.worktreeConfig`; the receipt names that workspace authorship was
  not configured.
- Select the agent from the base revision `selectOwnedWorkspace` used, and let
  `commitWorkspaceClaim`'s "already holds" condition reselect through the same
  `nextAgentName` rule rather than stop.
- The shared profile module exports the mode list; other code derives from it.
- Slice 2's rival arrives through a `reference-transaction` hook installed in
  the test's integration checkout (see Infrastructure proof); no product test
  seam is added.

## Infrastructure proof

Assumption: a test can make remote trunk advance between startup's two fetches
without a product seam. Both fetches run in the integration checkout
(`execution-start-operation.mjs` source fetch, then `selectOwnedWorkspace` in
`workspace-publication-select.mjs`), so a `reference-transaction` hook there
can publish a rival commit once, after the first fetch commits
`refs/remotes/origin/main`.

Command (Git 2.50.1, throwaway repositories under the job temp directory): a
hook that, on `committed` with a `refs/remotes/origin/main` line and no marker
file, touches the marker and pushes an empty `rival` commit from a separate
clone; then `git fetch origin` twice in the integration clone.

Result: `first=bump second=rival`. The first fetch saw the pre-hook tip; the
second saw the rival commit. The hook fired once.

## Slices

### 1. A bare repository with worktrees keeps working after a Take

Type: Behavior
Status: done
Proof: new case in `workspace-publication-startup-agent.test.mjs` running the
real `execution-start.mjs` from a linked worktree of a bare clone of the
queued trunk: the Take publishes with the Take commit authored by the agent;
the receipt says workspace authorship was not configured; afterwards
`git status` succeeds in the workspace and the other worktree, and
`extensions.worktreeConfig` is not set. The existing agent-author case still
shows workspace authorship in an ordinary clone. Rerun the startup agent,
resume, race, and claim suites.

Behavior: bare repository with linked worktrees → Take → the claim publishes
with an agent-authored Take commit, every checkout still works, and the
receipt names the authorship gap.

Accepted proof: from `src/skills/dough-execute-plan/scripts`, `node --test
workspace-publication-startup-agent.test.mjs
workspace-publication-startup-agent-resume.test.mjs
workspace-publication-startup-agent-release.test.mjs
workspace-publication-startup-race.test.mjs
workspace-publication-startup-recovery.test.mjs workspace-publication.test.mjs
workspace-publication-race.test.mjs` → 41/41. Observations: "Take from a bare
repository's linked worktree authors only the Take commit and leaves every
checkout working" (`workspaceAuthorship: "not-configured"`, agent-authored
Take on remote `main`, `git status` in both checkouts,
`extensions.worktreeConfig` unset); the ordinary agent-author case asserts
`"configured"`. `tests/install-public-payload.sh` passes with the new
`workspace-agent-authorship.mjs` in the payload. The `core.worktree` branch of
the detection is untested.

### 2. A name published between startup's fetches is reselected, not a stop

Type: Behavior
Status: planned
Proof: new case in `workspace-publication-startup-agent.test.mjs` with the
real `execution-start.mjs`: after startup's source fetch and before the claim
commit, a rival profile for the name that would have been chosen reaches
remote trunk through the `reference-transaction` hook above; the
receipt names the next rotation name and remote trunk holds both profiles.
Rerun the startup agent, race, claim, and recovery suites.

Behavior: rival publishes the selected name after startup's first fetch →
Take → the claim uses the next name on the workspace's base trunk and
publishes.

### 3. One home for agent hosts, modes, and profile paths

Type: Structure
Status: planned
Proof: `npm run typecheck:dashboard`; `npm run test:dashboard --
taken-agent-profile`; `node --test` on the startup agent and profile unit
suites; `git grep` shows no other literal host or mode list or
`.planning/agents` spelling outside the shared module, fixtures that assert
the concept, and docs.

Structure: `takenOwner.ts` enums, `execution-start-request.mjs`, and test
helpers derive from the shared module's exports. Directly owned retrospective
correction; enables no new behavior.

### 4. Dashboard journeys and startup tests prove profiles truthfully and cheaply

Type: Structure
Status: planned
Proof: full `npm run test:dashboard`; new refusal cases in
`authenticated-read-refusal.spec.ts` for `agents=profiles` with `path`, with
`since`, and with a non-sha revision; published-work, auto-refresh, and
story-readiness journeys assert that no "Agent profiles could not be read."
text appears; `node --test --test-concurrency=1` on the startup agent,
release, resume, and recovery suites shows the removed cases' behavior still
covered (seed example, all-held refusal, release journey, legacy resume in
the recovery suite) with lower runtime.

Structure: fakes answer the agents listing like a project without profiles
unless a spec publishes them; drop the duplicated real-CLI rotation cases
whose rules the unit suite owns, keeping the seed example and refusal; move
the legacy no-profile resume case into the recovery suite. Directly owned
retrospective correction.

## Learnings

- `git clone --bare` records no remote-tracking fetch refspec; the bare-layout
  case works only where the developer configured `remote.origin.fetch`, as a
  bare-plus-worktrees setup normally does.
- A new module under `src/skills/dough-execute-plan/scripts/` must be listed in
  the `install.sh` payload, or the installed-CLI startup test fails.
- The released startup passes a correction's own plan as `--plan`, which the
  backlog Take refuses; this execution's claim was committed by hand in the
  startup's format and confirmed through a startup resume.
