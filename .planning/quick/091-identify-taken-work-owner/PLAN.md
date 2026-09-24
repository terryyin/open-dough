# See who owns Taken work and where it is being executed

Status: planned.

## Source

**Identity:** SEED-021#identify-taken-work-owner

Story 4 in
[SEED-021](../../seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner),
refined with Terry on 2026-09-24. The seed owns goal, scope, key examples, and
deferred promises; this plan does not restate them beyond what slices need.

## Goal and scope

At Take, scripts assign a rotating agent name, publish that agent's own profile
file (`.planning/agents/agent-<lowercase name>.json`) in the Take commit with
the agent as Git author, keep that authorship for the agent's later commits in
its owned workspace, release the profile when the Taken entry is completed, and
the dashboard shows each Taken story's profile.

Excluded (see seed deferred promises): script-supported cancellation, recalling
an agent later, configurable name lists, updating host or model after Take, and
following branch slice contents (story 3).

Assumptions:

- The Take commit is still the only commit in a new workspace when a lost race
  replays it, so reselecting a name may rebuild that commit on the new trunk.
- Integration commits made outside the owned workspace (for example in the
  default checkout) keep their usual author; the promise covers commits the
  agent makes in its owned workspace.

## Current decisions

- **One shared profile module.** A pure module under
  `src/skills/dough-product-backlog/scripts/` owns the name rotation, the
  agent identity and email spelling, and profile rendering and validation.
  Startup, completion, and the dashboard all use it, following the North Star
  topic
  [One backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  no second dashboard grammar.
- **Rotation cursor from Git.** The next name follows the profile most recently
  added under `.planning/agents/` on fetched remote trunk (first-parent
  history), skipping held names. No state file.
- **Authorship through worktree config.** Startup sets
  `extensions.worktreeConfig=true` on the repository and
  `git config --worktree author.name/author.email` in the owned workspace; the
  Take commit uses the same identity. Proven before planning (below). Enabling
  the extension is a lasting repository setting; it does not change the default
  checkout's authorship. Terry is unsure about this setting and accepted it as
  a trial: if slice 1 or 4 shows it misbehaving in a real host workspace
  (Claude Code, Codex, or Cursor), stop and bring the evidence back rather
  than working around it; the recorded fallback is authoring only the
  script-made Take commit.
- **Host and model come from the agent.** `execution-start` takes
  `--host claude|codex|cursor` (the vocabulary execution delivery already uses)
  and `--model <text>`. Either may be omitted; the profile then leaves that
  field unrecorded rather than guessing.
- **Release through `product-backlog complete`.** Completing a Taken entry
  removes the profile whose identity matches, in the same change. Wrap-up
  guidance uses that command instead of hand-editing the backlog.
- **Dashboard reads a directory listing.** The read boundary admits
  `.planning/agents/` at the pinned revision (GitHub contents listing, then
  each profile's raw file), extending `server/reachablePaths.ts` and the fake
  GitHub accordingly.

## Infrastructure proof

Assumption: worktree-only `author.*` config makes the agent the author of
ordinary `git commit` in that worktree, the human stays the committer, the
main checkout is unaffected, and rebase preserves the author.

Command (Git 2.50.1, throwaway repository under the job temp directory):
`git config extensions.worktreeConfig true; git -C ../ws config --worktree
author.name agent-Yui; … author.email agent-yui@example.org; git -C ../ws
commit --allow-empty -m slice; git commit --allow-empty -m trunk-other; git -C
../ws rebase main`.

Result: `ws: author=agent-Yui <agent-yui@example.org> committer=Human`;
`main: author=Human committer=Human`; `after rebase: author=agent-Yui
committer=Human`; `core.repositoryformatversion` stayed 0.

## Promise ownership

| Promise (seed scope) | Slice | Observation |
| --- | --- | --- |
| Take publishes one profile file with name, email, identity, mode, branch, host, model | 1 | Startup CLI test reads the published profile on the bare remote |
| Take commit and later workspace commits authored by the agent, committer the human; default checkout unaffected | 1 | `git log --format` on remote and workspace commits |
| Rotation follows most recent profile, starts at Yui, skips held, wraps, all-held refusal publishes nothing | 2 | Pure-module unit cases plus one startup CLI skip case and one refusal case |
| Lost race never yields two active profiles with one name | 3 | Race test with `holdFirstPush` ends with two distinct profiles |
| Resume keeps profile and authorship | 4 | Recovery test: resumed receipt names the agent; new workspace commit keeps author |
| Completion removes the profile; next Take does not reuse the released name | 5 | `tests/product-backlog.sh` case and a startup case after `complete` |
| Guidance passes host and model; wrap-up uses `complete` | 1, 5 | Guidance text in `dough-execute-plan` and `dough-story-wrap-up`; behavior review walk |
| Dashboard shows profile facts; missing shown not recorded; unreadable shown unreadable; branch not claimed on trunk | 6 | Playwright spec against fake GitHub |

## Slices

### 1. Take publishes an agent profile authored by the agent

Type: Behavior
Status: done
Accepted proof: `node --test` on
`src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent.test.mjs`
(profile facts, agent author on remote/workspace, human author in the
integration checkout, Story Branch origin branch, rival holding another name
keeps ours), `workspace-publication-startup-race.test.mjs` (same-name races end
with `agent-yui.json` and `agent-akiho.json`, each Take authored by its
profile's agent), `workspace-publication.test.mjs`,
`workspace-publication-startup-recovery.test.mjs`,
`workspace-publication-race.test.mjs`, and
`tests/support/product-backlog-agent-profile.test.mjs`; `tests/product-backlog.sh`,
`tests/execution-payload-update.sh`, `tests/install-public-payload.sh`, and
`tests/product-backlog-payload-update.sh` under Bash 4+. Selection is still
first-free (`execution-start-agent.mjs`); slice 2 replaces it there.
Proof: new case in
`src/skills/dough-execute-plan/scripts/workspace-publication-startup-claim-cases.mjs`
running the real `execution-start.mjs` against `createQueuedTrunk`;
`node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-race.test.mjs`
(and the file that loads the claim cases).

Behavior: a queued story on a trunk with no profiles → `execution-start` in
Trunk Mode with `--host claude --model <m>` → remote trunk's Take commit adds
`.planning/agents/agent-yui.json` with the recorded facts, is authored by
`agent-Yui <agent-yui@example.org>` and committed by the configured user; the
receipt names the agent; a later commit made in the workspace has the same
author while a commit in the integration checkout does not. A Story Branch
Mode start records its origin branch.

Includes the shared profile module (selection of the first name not held on
fetched trunk; the full rotation rule follows in slice 2), `commitWorkspaceClaim`
staging the profile and passing the author, worktree config, receipt field, and
the `dough-execute-plan` Take guidance for `--host`/`--model`.

Also includes former slice 3's race reselection (see there): two starts from
one base select the same first name, so without reselection the existing
startup race tests stop on the profile's add/add conflict and slice 1 cannot
be delivered CI-safe. Proof additionally covers slice 3's two race cases.

### 2. Rotation skips held names, wraps, and refuses when all are held

Type: Behavior
Status: done
Accepted proof: `tests/support/product-backlog-agent-profile.test.mjs`
(rotation, skip, wrap, released most-recent name, all held);
`workspace-publication-startup-agent.test.mjs` startup cases (seed example
gives `agent-Yuma`; held successor gives `agent-Sola`; released most-recent
`agent-Yui` gives `agent-Akiho`; all 29 held refuses with remote trunk and
backlog unchanged); race, claim, recovery, and low-level race suites green.
Proof: unit tests for the profile module (next after most recent, skip held,
wrap after Rina, all held); startup CLI case where `agent-Akiho` is held and
most recent is `agent-Yui` → new claim is `agent-Yuma`; startup CLI case with
all 29 profiles present → refusal naming the reason and remote trunk unchanged.

Behavior: trunk with existing profiles and profile history → Take → the
selected name follows the seed's rotation rule, or the Take is refused with
nothing published.

### 3. A lost race reselects instead of sharing a name

Type: Behavior
Status: merged into slice 1
Proof: race case in
`workspace-publication-startup-race.test.mjs` using `holdFirstPush`: two
starts select the same name; the loser replays and publishes a different
profile; remote trunk holds two distinct profiles and two Taken entries. A
second race case where the winner took a different name keeps the loser's
original name through the existing rebase replay.

Behavior: another claim published the selected name first → the startup replay
→ the claim is rebuilt on new trunk with the next available name and published;
when the name is still free, the existing replay is unchanged.

Seam: `publishClaimSha` in `workspace-publication-push.mjs` already calls the
startup-supplied `recheckSource` before `replaySuffix`. Add a sibling
startup-supplied reselection that, when the fetched trunk holds the selected
profile, resets the workspace to that trunk and recreates the claim through
`commitWorkspaceClaim` with the next name. Without it, the rebase stops on the
profile's add/add conflict as `replay-failed`, which is safe but unpublished.

### 4. Resume keeps the profile and authorship

Type: Behavior
Status: done
Accepted proof: `workspace-publication-startup-agent-resume.test.mjs`
(interrupted resume names `agent-Akiho` with only its profile published and
restores unset worktree author; owned published claim resumes naming the
agent and restores `extensions.worktreeConfig`; a claim without a profile
resumes without an agent); parser cases in
`tests/support/product-backlog-agent-profile.test.mjs`; whole
`tests/execution-ci-runtime.sh` green before refactor. A retained resume whose
replay meets its own name now held elsewhere still stops as `replay-failed`
(untested, safe).
Proof: case in `workspace-publication-startup-recovery.test.mjs`: interrupted
and owned resumes return receipts naming the original agent; a commit made in
the reused workspace after resume has the agent author, including when the
workspace config was missing and is restored from the published profile.

Behavior: an interrupted or already-published claim → `execution-start`
resume → no new profile or name is chosen, and workspace authorship matches
the published profile.

### 5. Completion releases the profile

Type: Behavior
Status: done
Accepted proof: `tests/support/product-backlog-complete-profile.test.mjs`
through `tests/product-backlog.sh` (matching profile removed, other and
unreadable profiles kept, no-profile and no-directory completions succeed);
`workspace-publication-startup-agent-release.test.mjs` (real `complete` then
publish deletes `agents/agent-akiho.json`; next Take is `agent-Yuma`);
wrap-up guidance and payload-update suites green. Known gap: a crash between
the backlog write and the profile deletion leaves the profile for manual
removal.
Proof: `tests/product-backlog.sh` case: `complete` on a Taken entry removes
its matching profile and leaves other profiles; completing an entry without a
profile still succeeds. Startup CLI case: after completing `agent-Akiho`'s
story, the next Take gets the name after the most recent profile, not
`agent-Akiho`.

Behavior: a Taken entry with a profile → `product-backlog complete` → the
entry and its profile are removed together, and the name becomes available
under the rotation. Update `dough-story-wrap-up` closure guidance to complete
the Taken entry with that command.

### 6. Dashboard shows who owns each Taken story

Type: Behavior
Status: planned
Proof: new `dashboard/tests/taken-agent-profile.spec.ts` via
`npm run test:dashboard -- taken-agent-profile`, with the fake GitHub serving
a `.planning/agents/` listing: a Trunk Mode profile shows
"agent-Akiho · Trunk Mode · Claude Code · <model>"; a Story Branch Mode
profile shows its branch labelled as branch context; a Taken entry without a
profile shows "owner not recorded"; a malformed profile shows as unreadable.
`npm run typecheck:dashboard`.

Behavior: published Taken entries with and without profiles → dashboard
load or refresh → each Taken card shows the recorded facts or explicit gaps.
Reads profiles through the shared module; extends the read boundary allowlist
and fake GitHub for the directory listing.

## Learnings

- CI observation (GitHub `ci.yml`, workflow name `CI`) for the story branch:
  observer `/tmp/dough-ci-501/watch-IsEPZU`, started through the host launcher
  because managed delivery needs `--session-json` with the Claude Code
  `session_id` to verify the bridge.

- Slice 1 alone broke two existing startup race tests ("real startup
  commands replay distinct claims from one base without losing either",
  "distinct claims also converge when the other execution wins the first
  push"): both starts chose `agent-Yui` and the loser stopped as
  `replay-failed` on the profile's add/add conflict. Race reselection moved
  into slice 1; slice 2 must keep those race cases green when it replaces
  first-free selection with the rotation rule.
- A new `dough-product-backlog` script used by the installed startup must be
  listed in `install.sh` `managed_files`; the installed-startup test catches
  the omission.
