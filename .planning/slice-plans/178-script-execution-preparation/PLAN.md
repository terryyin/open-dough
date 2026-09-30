# Start execution with mechanical preparation already handled

## Source and authority

- **Identity:** SEED-052#script-execution-preparation
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#script-execution-preparation)
  (Goal, Scope, Deferred, Key examples, Architecture, UI; Terry, 2026-09-30).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication beyond landing the preparation.

## Goal and scope

A developer pressing **Start execution** on a Backlog card gets a session that
begins at the plan: the dashboard server has already run the project's installed
`execution-start.mjs` (fetch, workspace, published Take), and the session starts
in that workspace with the established start in its instruction. Included: the
seed's Scope (host `claude`, Story Branch Mode, `<project folder>/.worktrees/<slug>`
on `claude/<slug>`, chosen model recorded in the claim, refusal, interrupted and
resumable start, Taken-card retry, shared progress, duplicate refusal, graceful
fallback for a project whose installed skill cannot continue from a start).
Excluded (seed Deferred): refinement, Codex/Cursor, Trunk Mode, dashboard-side
readiness setup, cleanup of an abandoned workspace, changing a resumed start's
model.

## Direction followed

- [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  each domain concept below is one module or table row named for it; no
  parallel vocabulary. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  the skill text is written for the executing agent.
- Architectural North Star topic
  [A start establishes claim and workspace before the session](../../NORTH-STAR.md#a-start-establishes-claim-and-workspace-before-the-session)
  (written for this plan); UI decisions in the
  [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) row "Start (claim and workspace)".
- **PFE (reuse, do not rebuild):** `execution-start.mjs` already fetches, selects
  or reuses the workspace, names the agent, publishes the Take and Story Branch,
  reports `recovery` on every stop, and answers `existing` for the same publisher.
  The dashboard reuses it as a subprocess and reimplements nothing. Reuse the launch
  table, `launchClaude`, launch record schema, card and `LaunchProblemAnswer`.
  Gaps: the workspace choice, a typed result reader, the start record, progress,
  the skill's ability to continue from an established start.

## Domain model (from the North Star topic)

Workflow `start` kind → **Start** (`server/executionStart.ts`) using a **Workspace
choice** (`server/claudeWorkspace.ts`, host-owned, pure) → **Established start**
(shared type, formatted for the session by one function shipped with the skill) →
**Start record** (`server/startStore.ts`, write-ahead, local) → **Start progress**
(`AgentLaunches`, in memory) → session through the existing `launchClaude`.

## Decisive premises

| Premise | Consuming slice | Observation | Result |
| --- | --- | --- | --- |
| The script the dashboard runs exists in a project's installed skill | 2 | `ls .claude/skills/dough-execute-plan/scripts/execution-start.mjs` (repo root, 2026-09-30) | present |
| Same publisher and identity retried without SHAs answers `existing` | 7, 9 | read `execution-start-operation.mjs` (`selectedSource.existing && !request.retained` → `existingClaim`) and `execution-start-source.mjs` `existingClaim` | yes, with `publishedSha`, no agent or workspace echoed |
| Every script stop carries `recovery` (workspace, branch, startingRevision, candidateSha, identity, publisherId) | 7 | read `execution-start-recovery.mjs`, `execution-start-operation.mjs` | yes; a *killed* script yields none, so the dashboard never aborts a running start |
| `.worktrees/` is git-ignored in this repository | 2 | `git check-ignore -v .worktrees/x` | `.gitignore:24` |
| Claude Code's listing carries each session's `cwd` | 2 | `claude agents --json --all`, keys | `cwd, id, kind, name, pid, sessionId, startedAt, state, status` |
| The fake `claude` records argv and cwd | 2 | read `dashboard/tests/support/fakeClaude.ts` (`ClaudeCall`) | yes |
| New script files ship with the skill directory (no manifest to edit) | 1 | `grep -rln execution-start-receipt` outside skill copies | **wrong**: `install.sh` `managed_files` declares each shipped reference and script; CI (`tests/payload-declaration-links.sh`) failed until `established-start.md` and `established-start.mjs` were declared. Later slices that add skill files declare them there |
| Highest plan number | plan path | `ls .planning/slice-plans` | 177 |
| `claude --bg` from a dashboard-created worktree runs normally, attaches by short id from the project folder, and trust of the project folder covers `.worktrees/` | 2 | ~/.claude.json trusts only the project folder and sessions already run in worktrees under it; real proof needs a paid, manual launch | **observed 2026-09-30**: the start ran for real against a scratch origin and published the Take (host claude, model sonnet); real `claude --bg` in a `.worktrees/<slug>` workspace of a trusted project launched (`claude agents` cwd = the workspace, state done), and the agent reported the established start and its workspace, running no Take. Two limits: a workspace of a project that is not itself trusted is refused ("Workspace not trusted", reported as `folder-not-trusted`), so trust comes from the project, not the parent folder; `claude attach` needs a terminal and was not exercised (the dashboard's terminal attaches by the same short id) |
| A fresh rerun with the same publisher in a workspace that holds an unpublished own claim commit (result lost) stops safely or resumes | 8 | temporary `node --test` in the skill scripts dir using `createQueuedTrunk`, `interruptFirstPush`, `startProcess` twice with no resume flags (file removed afterwards) | stops with `setup-failed` (`existing workspace cannot continue ... unpublished-commits`), origin holds 0 claims, no duplicate: a rerun must pass `--starting-revision` (the claim commit's parent) and `--candidate-sha` (workspace HEAD), which the script validates against the claim trailers |

## Outside-in proof

Skill guidance and formatter: `src/skills/dough-execute-plan/scripts/*-guidance.test.mjs`
pattern (run the one file with `node --test`). Dashboard: Playwright specs in the
launch family (`dashboard/tests/agent-launch-*.spec.ts`) using the fake `claude` and
a new fixture `dashboard/tests/support/startOrigin.ts` that makes a real bare origin
with a queued story, a project folder under the fake HOME, and a copy of the source
skill directories (`src/skills/dough-execute-plan`, `dough-product-backlog`,
`dough-story-refinement`) as the folder's installed `.claude/skills`, so the real
script runs; run only the focused files locally (`npx playwright test --config
dashboard/playwright.config.ts <file>`; the whole suite is CI's). Each Behavior slice
also updates `dashboard/AGENT-LAUNCH.md` for what it delivers.

| Promise | Slice | Observable proof |
| --- | --- | --- |
| Agent continues from an established start without a second Take | 1 | guidance test on the skill text and formatter output; behavior walk below |
| Start runs before `claude --bg`, session in the workspace, claim names host and chosen model, record keeps the start | 2 | boundary spec: origin holds the Taken profile (host claude, model opus or none), fake claude cwd is the workspace, argv instruction carries the formatted start; manual real launch |
| Dialog states the push, card shows phase words, entry shows the workspace | 3 | page spec |
| Old installed skill launches as today | 4 | spec: folder without `established-start.mjs`: no start, cwd is the project folder |
| Refused starts launch nothing and say why (other owner, not queued, no script, wrong origin) | 5 | spec per reason: no fake `claude` call, card text |
| Interrupted or uncertain start is kept and Start resumes it, one claim | 7, 8 | spec: slow origin hook, then resume; origin has one claim |
| Taken card offers Start while a start is kept without a session | 9 | spec: failed first launch, reload, Taken card offers Start, second launch in same workspace |
| Any page shows a running start's phase | 10 | spec: two pages, one start held open |
| A second start of the story is refused | 11 | spec: two parallel raw requests, one claim |

## Slices

### 1. Agent continues from an established start
Type: Behavior
Status: done
Proof: guidance test in `src/skills/dough-execute-plan/scripts/` asserts `SKILL.md`
"Take or admit work" and the new reference say a supplied established start replaces
the start command and lists its fields, and asserts `established-start.mjs`
`formatEstablishedStart` output (fixed field order, optional agent). Behavior walk:
task supplies the block → agent skips the command, retains `publishedSha`, continues
at project-command setup in that workspace; absent block → unchanged.

Behavior: pre-condition: `dough-execute-plan` is invoked with an instruction
carrying an established start (identity, publisher ID, workspace, branch, mode,
remote, target, `publishedSha`, optional agent/plan/`startingRevision`/`candidateSha`)
→ trigger: the Take step → postcondition: no `execution-start.mjs` call, no second
claim, agent works in the named workspace. Edits only `src/skills/dough-execute-plan/`
(a new `scripts/established-start.mjs` formatter, a short `references/established-start.md`,
one pointer in `SKILL.md`); installed copies update only from a release.

### 2. Start execution establishes the start, then opens the session in its workspace
Type: Behavior
Status: done
Proof: boundary spec `agent-launch-start.spec.ts` over raw HTTP (Opus and Default) against
the real script and a real bare origin, asserting origin's Taken profile, the fake `claude`
argv and cwd, and the kept record; focused unit proof of the workspace choice (slug from
the title, collision suffix, `claude/` branch) and of the script-result reader; then
**manual probe, paid, developer-run**: one real Start execution on a scratch story: the
session appears in `claude agents` with `cwd` = the workspace, `claude attach` works from
the dashboard's terminal, the agent starts at the plan without a Take. A failed probe stops
slices 3-11 and changes the plan.

Behavior: pre-condition: queued story, project folder with the installed skill, `origin` =
the catalog repository → trigger: an execution launch request → postcondition: origin shows
the Taken profile naming host `claude` (and the chosen model, none on Default), the
workspace exists under `.worktrees/`, `claude --bg` ran with that cwd and the instruction
`/<skill> <identity>` plus the formatted established start, and the launch record keeps the
start. The start wait never aborts a running start; when it expires the answer is "Launch
uncertain" (interim: slice 7 replaces it with a kept, resumable start). A remote that is not
the catalog repository starts nothing (slice 5 words it).

### 3. The page says what Start now does
Type: Behavior
Status: done
Proof: page spec (`agent-launch-start-card.spec.ts`): the dialog description says Start also
publishes the Take to the project's trunk on origin and creates a workspace under
`.worktrees/`; while the request is pending the card reads "Preparing execution…" (interim: slice 10
adds the second phase, "Starting execution in Claude Code…", from the server); the session entry reads "Workspace <folder>"; the existing card
specs stay green.

Behavior: pre-condition: slice 2's boundary → trigger: the developer opens the execution
dialog and presses Start → postcondition: the words of the UX North Star row appear, and
nothing is shown as Taken or assigned until origin shows it. The refinement dialog and Start
session are unchanged.

### 4. A project whose installed skill cannot continue from a start launches as today
Type: Behavior
Status: planned
Proof: spec: project folder whose installed `dough-execute-plan` lacks
`scripts/established-start.mjs` → no Take, no workspace, `claude --bg` in the project
folder with `/<skill> <identity>` only, and no extra dialog sentence; a folder with it
still takes slice 2's path.

Behavior: pre-condition: installed skill predates the established-start handoff →
trigger: Start → postcondition: the launch is exactly today's, so no claim is published
that the agent could not continue. The capability check lives in `executionStart.ts`.

### 5. A start that cannot be established launches nothing
Type: Behavior
Status: planned
Proof: one spec per reason, asserting no `claude` call and the card's "Launch failed:"
text: story Taken by another agent (owner named), story not queued, installed script
missing, `origin` not the catalog repository. Script `status` values map to one reason
table in `executionStart.ts` (unit proof of the mapping for the script's remaining
stops).

Behavior: pre-condition: as slice 2 but the start is refused → trigger: Start →
postcondition: no session, the card says why and names the owner when another agent holds it.

### 6. Share the machine's JSON store discipline
Type: Structure
Status: planned
Proof: existing `agent-launch-records.spec.ts`, `agent-launch-session-listing.spec.ts`
and done/delete specs stay green unchanged.

Structure: move the read-fresh, atomic-replace, unreadable-file-aside discipline out of
`launchRecordStore.ts` into one helper both stores use. Enables slice 7's start store
without a second copy of the rules. No external change.

### 7. An uncertain start is kept and resumed
Type: Behavior
Status: planned
Proof: spec: origin `pre-receive` hook slower than the shortened start wait
(`DOUGH_START_TIMEOUT_MS`) → "Launch uncertain" naming workspace and branch, the script
left to finish; hook removed, Start again → one claim on origin, the session opens in the
same workspace; a script stop that carries `recovery` resumes with its SHAs.

Behavior: pre-condition: a start whose result is uncertain or stopped after a claim commit
→ trigger: the developer presses Start again → postcondition: the start record (written
before the script ran, updated with its result or `recovery`) is resumed with the same
publisher, workspace and branch; the answer is `existing`/`resumed`, never a second claim
or workspace.

### 8. A start lost with the server is resumed from its workspace
Type: Behavior
Status: planned
Proof: spec: stop the server after the claim commit and before the push (hook), restart on
the same machine state, press Start → the retry derives `--candidate-sha` from the
workspace HEAD and `--starting-revision` from its parent (observed premise above), one claim
on origin, session in the same workspace; a workspace that is not the isolated claim stops
with the script's own reason on the card.

Behavior: pre-condition: a stored start with no recorded result and no running process →
trigger: Start → postcondition: resumed or stopped safely, never a duplicate claim.

### 9. A published claim without a session offers Start on its Taken card
Type: Behavior
Status: planned
Proof: spec: fake `claude` refuses the first launch → "Launch failed: … Taken by <Agent>;
no session started. Workspace <folder>."; after a reload and refresh the Taken card offers
**Start execution** with "Started here, no session yet" (and no other Taken card does);
Start opens the session in the same workspace and the offer disappears.

Behavior: pre-condition: kept start record without a launch record, origin shows Taken →
trigger: Start on that Taken card → postcondition: session in the kept workspace, record
keeps the start, the start record is removed.

### 10. Every page shows a running start's phase
Type: Behavior
Status: planned
Proof: spec: hold the start open (slow hook); a second page for the project shows
"Preparing execution…" on the card, then "Starting execution in Claude Code…", and after
the launch the session; the machine answer's `starts` names project, identity, phase.

Behavior: pre-condition: a start running in this server → trigger: any page reads the
machine's sessions → postcondition: the card shows the phase; a stored start with no
running process reads as interrupted (slice 7's wording), never running.

### 11. A second start of the same story is refused
Type: Behavior
Status: planned
Proof: spec: two parallel launch requests for one identity over raw HTTP → one claim on
origin, one workspace, the second answered "Launch failed: already starting"; a story
Taken by another agent stays slice 5's refusal.

Behavior: pre-condition: a start running for project and identity → trigger: another
launch of it → postcondition: refused before any process; no duplicate claim or workspace.

## Considered and excluded

A dashboard-side project-command readiness step, killing a slow script, a host interface
ahead of Codex, storing starts in the launch file, streaming phases per git step, and a
model picker on retry.

## Concerns

- Slice 2 is the largest (fixture, four modules, manual probe); its page words are slice 3.
  If it still overruns, split the workspace choice and result reader into a preceding
  Structure slice.
- Slices 2-6 can leave a published claim without a resumable start (an uncertain push, a
  refused session, a lost server). Do not stop the story between slice 2 and slice 9;
  slice 9 is the first safe stopping point after the core. Slices 10 and 11 (shared phase
  words, in-server duplicate refusal) add no safety the script's origin ownership check
  does not already give; they are the natural cut if the story is split.
- A project whose `.worktrees/` is not git-ignored reports the integration checkout as not
  refreshed; the start still succeeds.
