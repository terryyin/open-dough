# Start refinement with mechanical preparation already handled

## Source and authority

- **Identity:** SEED-052#script-refinement-preparation
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#script-refinement-preparation)
  (Goal, Scope, Deferred, Key examples).
- **Authority:** Terry asked on 2026-09-30 to complete refinement and make a
  slice plan, with both refinement recommendations accepted (Preparing published
  at Start; a kept start is resumed). Planning only; this plan grants no
  implementation, Take, or publication.
- **Preparation:** Owned workspace `.worktrees/start-refinement-with-mechanical-preparation`
  (branch `claude/start-refinement-with-mechanical-preparation`), Preparing
  assignment published by `chaifeng-chan`.

## Goal and scope

Pressing **Start refinement** on a Backlog card, in a project whose installed
refinement skill ships the preparation start and its formatter, runs
`preparation-assignment.mjs start` before `claude --bg`, in a new
`.worktrees/<slug>` on `claude/<slug>`. Origin then shows the story Preparing;
the session opens in that workspace with an **Established preparation** block
the installed skill's own formatter wrote, and the refinement skill skips its
own workspace and `start` steps when it sees the block. The dialog says Start
publishes the announcement; the card reads "Preparing refinement…" until origin
shows it. A stop refuses the launch with its reason; an uncertain start or a
`claude` refusal after the announcement keeps the start, and Start again resumes
it with one assignment. Other projects and direct CLI refinement are unchanged.
Preparation stays distinct from Taken.

Deferred: dashboard keep/abandon/discard, automating refinement judgments,
slice-planning launches, launching over a story another agent prepares without a
kept start, refinement options (SEED-061, plan 185).

## Direction and existing solutions

No Accepted ADR conflicts (dashboard server and one skill; ADR 0006 governs the
block's wording: written for the agent working in the project). No ADR proposed.

**PFE outcome: reuse and generalize; do not fork.**

- `preparation-assignment.mjs start` already creates the workspace at fetched
  trunk (`--branch`), announces, and answers `continued` on rerun in the same
  workspace. The dashboard spells its arguments once, as `executionStart.ts`
  does for `execution-start.mjs`.
- Reuse unchanged: `claudeWorkspace` (slug, `.worktrees`, `claude/` branch),
  `takenSlugs`, `StartProgress`, `machineJsonStore`, the launch-wait race in
  `agentLaunches.ts started()`, `claudeInstruction`, `launchClaude` started in
  the workspace, `publishedWithoutSession`, the `Launch failed:` wording path.
- Differences from execution that stay refinement-specific: no publisher ID,
  mode, or plan; `continued` carries no `publishedSha`; resume is a plain rerun
  in the kept workspace (no `--starting-revision`/`--candidate-sha`); stops have
  their own statuses (`agent-unavailable`, `not-queued`,
  `workspace-selection-failed`, `workspace-not-isolated`,
  `workspace-assigned-elsewhere`, `developer-identity-refused`, `unpublished`).
- Coordination with [plan 185](../185-select-refinement-options-from-dashboard/PLAN.md):
  it also edits `claudeInstruction` and adds a sibling per-project installed-skill
  fact to the sessions answer. Independent; whichever executes second rebases
  onto the other's shape rather than duplicating the installed-skill lookup.

## Decisive premises observed during planning

Observed 2026-09-30 in the owned workspace.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The real start creates the workspace and announces from a queued story | Slice 3 | Ran `preparation-assignment.mjs start --workspace .worktrees/… --branch claude/… --identity SEED-052#script-refinement-preparation --remote origin --target main --push-authorized --host claude --model sonnet` for this very story | `status: announced`, `agent`, `publishedSha`, `workspace`, `selection.created: true`; a real observation, not a fixture. |
| `continued` carries no `publishedSha` | Slices 1, 3, 7 | Read `preparation-assignment-start.mjs:128-136` (`continued` returns assignment fields, `workspace`, `fetched`) vs `:232-246` (`announced` adds `publishedSha`) | Confirmed; the formatter and schema treat `publishedSha` as optional. |
| A rerun in an existing workspace resumes without SHAs | Slice 7 | Read `preparation-assignment-trunk.mjs:46` (`existsSync(workspace)` → ok) and `:118-145` (`held` → `continued`); `unpublished` keeps the workspace and `candidateSha`, and its docs say rerun `start` in the same workspace settles it | Confirmed by reading; slice 7 proves it through the real script. |
| The card already shows Preparing from origin | Slices 3-5 | `tests/agent-launch-card-sessions.spec.ts:120-128` asserts "Preparing" and "Being prepared" for a queued story with a preparation profile | Confirmed. |
| Fixtures can run the installed skill for real over a bare origin | Slices 3-8 | `tests/support/startOrigin.ts` copies `dough-story-refinement` (with its scripts) beside `dough-execute-plan` and queues one story; `takenByAnotherAgent` and `heldStart.ts` exist | Confirmed; slice 3 needs no new fixture kind. Installed set already includes the refinement skill. |
| New skill files must be listed for the installer | Slice 1 | `install.sh:124-132` lists `dough-story-refinement` references and scripts one by one; `:157,:201` list execution's established-start pair | Confirmed; slice 1 adds the pair there. |
| The execution start's mechanics are reusable without change to the store key | Slice 2 | Read `startStore.ts` (keyed by project id and identity, one file), `agentLaunches.ts started()` (`request.workflow !== "execution"` gate) | Confirmed; a story's execution and refinement starts would collide on the key, so slice 2 separates them by workflow. |

Not observed, bounded by slice proof: that a real `claude` follows the block
without repeating setup. It needs a paid host run and is manual only; slice 1's
proof is the guidance test, and the manual observation is left to the developer.

## Outside-in proof

Stable boundary: `/__agent-launch` over HTTP against the real installed
`preparation-assignment.mjs` and a real bare origin (`tests/support/startOrigin.ts`)
with the synthetic `claude` (`server.claudeLaunchCalls()`), and the launch dialog
and card in the existing launch journey. The real `claude` is never run.

| Promise | Owner | Observable check |
| --- | --- | --- |
| Agent continues from the block without its own setup | Slice 1 | Node test: reference and `SKILL.md` name the skip of workspace selection and `start`, keep the named workspace, and leave the no-block path intact; formatter lists fields in order, omitting unknown ones |
| Start refinement announces and opens the session in the workspace with the block; the record keeps the start | Slices 3-4 | Boundary: origin holds one preparation profile (host `claude`, chosen model or none), no Taken profile; `argv` cwd is the workspace; instruction is `/dough-story-refinement <id>`, blank line, block, developer text; record has `start` |
| A project without the start or formatter launches as today | Slice 3 | Boundary: no workspace, no profile, instruction unchanged |
| Dialog states the publication; card reads "Preparing refinement…" then "Starting refinement in Claude Code…" | Slice 5 | Page with a held start; `establishingPreparation` answer for the project |
| A stop refuses with its reason and launches nothing | Slice 6 | Boundary: not-queued, all names held, workspace failure; `claudeLaunchCalls()` empty; no workspace when the script made none |
| Uncertain start or `claude` refusal keeps the start; Start again resumes | Slice 7 | Boundary twice: same workspace and branch, `continued`, one preparation profile on origin |
| Card offers the resume and says it publishes nothing again | Slice 8 | Page: kept start listed; dialog names the workspace |
| Execution launches are unchanged | Slice 2 | Existing `agent-launch-start*.spec.ts`, `execution-start-result.spec.ts`, `claude-workspace.spec.ts` pass unchanged |

Local proof runs only the specs of the touched behavior (`npx playwright test
--config dashboard/playwright.config.ts <files>` and `node --test` on the skill
tests); the full suite is hosted CI's gate. Slice 1 also runs the installer's
own list check, because the payload lists are read by distributed consumers.

## Ordered slices

### 1. Skill continues from an established preparation
Type: Behavior
Status: done
Proof: `node --test src/skills/dough-story-refinement/scripts/established-preparation-guidance.test.mjs` plus the existing install-list test.
Accepted: the guidance test passed (4 tests: skip links, reference content, formatter order, optional omission); `tests/payload-declaration-links.sh` and `tests/install-public-payload.sh` (run with Homebrew bash; system bash lacks `local -A`) exited 0. No test lists individual payload files.

Behavior: an instruction carrying an **Established preparation** block
(identity, workspace, branch, remote, target, agent, and `publishedSha`,
integration checkout when known) → the refinement skill works in the named
workspace, makes no second announcement or workspace, and keeps the fields for
its later `release`/`abandon`; without the block it prepares itself as today.
Adds `scripts/established-preparation.mjs` (`formatEstablishedPreparation`, omits
unknown optional fields), `references/established-preparation.md` (the agent's
view; no maintainer vocabulary), a link from `SKILL.md` and from
`preparation-workspace.md`'s select step, and the `install.sh` entries. A later
skill in the same session still runs `start`, which answers `continued`.

### 2. Start is a per-workflow operation
Type: Structure — enables slice 3.
Status: done
Proof: existing execution start specs pass unchanged (listed above).
Accepted: `npx playwright test --config dashboard/playwright.config.ts agent-launch-start claude-workspace execution-start-result start-store` passed 36 unmodified specs; `npm run typecheck:dashboard` exit 0.

Extract from `agentLaunches.ts` the wait-and-classify around a running start
into a workflow-keyed seam (`establishes(project)`, `begin(...)`, its
refusal/uncertain wording), with execution as its only user; parametrize
`startStore` by workflow so a story's execution and refinement starts are kept
apart (execution keeps `execution-starts.json`; refinement gets its own file);
make `RunningStart` carry its workflow. No behavior differs.

### 3. Start refinement establishes the preparation and opens the session in it
Type: Behavior
Status: done
Proof: new boundary spec `agent-launch-preparation-start.spec.ts` over the real script, including the no-start case; existing refinement launch specs unchanged.
Accepted: `agent-launch-preparation-start.spec.ts` (3 passed: Preparing published and session in workspace with block, with and without a model; project without the formatter launches as before); regression `agent-launch claude-workspace execution-start-result start-store` 234 passed; `npm run typecheck:dashboard` clean.

Behavior: queued story in an establishing project → Start refinement runs the
installed start (`--integration`, new `.worktrees/<slug>`, `claude/<slug>`,
`--remote origin --target`, `--push-authorized`, `--host claude`, `--model` only
when chosen) → origin holds the Preparing profile and no Taken profile → the
session starts in the workspace with the formatted block. `preparationStart.ts`
is the only place its arguments are spelled; a reader of its result sits beside
`startResult.ts`. A project whose skill lacks the start or formatter launches as
today.

### 4. The launch record keeps the established preparation
Type: Behavior
Status: done
Proof: extends the slice 3 spec: the record read back through the sessions answer; a page spec for the entry's "Workspace" line.
Accepted: `agent-launch-preparation-start.spec.ts` (record keeps `preparation` with no publisherId/mode/plan; `establishingPreparation` lists the project, empty without the formatter) and new `agent-launch-preparation-workspace.spec.ts` (Workspace line on card and Recent sessions); regression 235 passed; typecheck clean.

Behavior: a launch whose start was established → its record keeps the
established preparation (its own schema: no publisher ID, mode, or plan;
optional `publishedSha`), the session's entry says "Workspace
~/git/<project>/.worktrees/<slug>" on the card and in Recent sessions, and the
sessions answer carries `establishingPreparation`, the projects whose installed
skill ships the start and formatter. Updates the `AGENT-LAUNCH.md` refinement
paragraph.

### 5. Dialog and card say what Start refinement does
Type: Behavior
Status: done
Proof: page spec with `installHeldStart` (as `agent-launch-start-phases.spec.ts`).
Accepted: new `agent-launch-preparation-phases.spec.ts` (dialog sentence, "Preparing refinement…" then "Starting refinement in Claude Code…", story in Backlog, from a page that did not launch); the non-establishing refinement dialog keeps today's words in `agent-launch-start-card.spec.ts`; regression 236 passed; typecheck and lint clean. `workflow` added to the wire `RunningStart`; the two phase/duplicate specs' `toEqual` gained `workflow: "execution"`.

Behavior: an establishing project → the refinement dialog adds "Start also
publishes this story's Preparing announcement to the project's trunk on origin
and creates a workspace under the project folder's .worktrees/; pressing Start
authorizes that push."; while pending the card reads "Preparing refinement…",
then "Starting refinement in Claude Code…"; the story stays in Backlog until
origin shows the assignment, from any page. Other projects keep today's words.
`launchWorkflows.refinement.establishes` and the phase words are spelled there.

### 6. A stopped preparation start refuses the launch with its reason
Type: Behavior
Status: done
Proof: boundary specs for `not-queued`, `agent-unavailable` (all names held, listing them), `workspace-selection-failed`; a reader spec for the rest of the status table.
Accepted: `agent-launch-preparation-stops.spec.ts` (not-queued, agent-unavailable listing every holder, workspace-selection-failed: answer wording, no `claude` launch, no running start, no profile, and no workspace, branch, or worktree left) and `preparation-start-result.spec.ts` (every status in the table, `continued` without `publishedSha`); typecheck and lint clean; regression 242 passed. A stop that made no assignment removes the workspace and branch this launch created (key example 2); `unpublished` and unreadable results are left for slice 7.

Behavior: the start stops → "Launch failed:" plus the reason worded by one
table in the preparation result reader, `Nothing was launched.`; a stop that made
no assignment removes the kept start; the progress phase clears.

### 7. A kept preparation start resumes on the next Start
Type: Behavior
Status: done
Proof: boundary specs for a start that outlasts the wait (`DOUGH_START_TIMEOUT_MS`), an `unpublished` stop, and a `claude` refusal after `announced`; each ends with a second Start and one preparation profile.
Accepted: `agent-launch-preparation-resume.spec.ts` (timeout, `unpublished` stop via a rejecting pre-receive hook, `claude` refusal after the announcement: each keeps the start, names the workspace, and a second Start reruns in the same workspace and branch with one preparation profile, one workspace, and no kept start; 15/15 at `--repeat-each=5`); `agent-launch-preparation-stops.spec.ts` asserts no kept start after a stop; regression 246 passed; typecheck and lint clean. `continued` without `publishedSha` is established. `keptStarts` still lists execution starts only (slice 8).

Behavior: the start is kept before the script runs; timeout, `unpublished`, or a
`claude` refusal keep it → answers say "The start was kept and goes on in
workspace … pressing Start again resumes it." (a refusal after the announcement
names the agent and workspace: "Preparing as <Agent>; no session started.
Workspace …") → Start again reruns in the same workspace and branch, the script
answers `continued`, the session opens there, and the kept start is removed.

### 8. The card offers the resume of a kept preparation start
Type: Behavior
Status: done
Proof: page spec: a kept start listed by the sessions answer.
Accepted: new `agent-launch-preparation-kept.spec.ts` (a Backlog card with a kept refinement start and no session: dialog names the workspace and says the Preparing announcement is already published, without the establishing sentence; another card keeps it; Start opens the session in the same workspace, the offer goes, one preparation profile on origin); regression 247 passed after the last edit; typecheck and lint clean. Wire `KeptStart` carries `workflow`.

Behavior: a Backlog card whose story has a kept refinement start and no session →
Start refinement's dialog names the workspace and says the announcement is
already published, so Start publishes no second one; starting removes the
offer. `keptStarts` carries the workflow.

## Current decisions

- Preparing is published at Start, not at the first seed write (Terry,
  2026-09-30).
- A kept start with no session is resumed by the next Start refinement (Terry,
  2026-09-30).
- Refinement kept starts live in their own store file, keyed by project and
  story, not mixed with execution's.
- No dashboard action ends a preparation assignment.

## Learnings

- Slice 8: a Taken card with a kept refinement start offers no resume (Backlog cards only, as planned). `server/agentLaunches.ts` (393), `src/agentLaunches.ts` (418) and `src/agentLaunch.ts` (490) are long-standing oversized files; not split here.
- Slice 7: a kept `unpublished` start whose hook still rejects stays kept on the next Start (no spec). `agent-launch-start-taken.spec.ts:53` failed once under load ("server could not be reached") and passed on rerun, like `agent-launch-card-delete.spec.ts:51`: local load flakes on existing specs, CI green. Slice 8 makes `keptStarts` carry the workflow.
- Slice 6: `preparationStart.ts` turns an established result without `publishedSha` (a `continued` answer) into a stop; slice 7's resume must treat it as established and carry `publishedSha` optionally (the record schema already allows it). The cleanup's failure wording has no test.
- `agent-launch-card-delete.spec.ts:51` failed a second time locally under a full parallel selection (slice 6); still passes isolated and CI is green on every published revision. Open finding for a separate story, not this one's scope.
- `@typescript-eslint/no-unused-vars` rejects `_`-prefixed callback parameters here. A Playwright/build run once left git-ignored `dashboard/dashboard/dist`, which ESLint lints locally; removed.
- Slice 5: the running-start answer now carries `workflow`, so slices 6-8 read it instead of re-deriving it.
- Slice 4: the page-side `launchRecordsSchema` does not yet read `establishingPreparation` (zod strips it); slice 5 adds it with the initial state and builders in `dashboard/src/agentLaunches.ts`. `AGENT-LAUNCH.md`'s refinement paragraph needs extending by slices 5-7.
- CI lint (`no-unsafe-member-access`) failed slice 3's spec; repaired in a9623112. Run `node scripts/lint.mjs` on the tree before committing, since the local commit hook did not catch it.
- Slice 3 left placeholders for later slices: `EstablishedStart` still carries `publisherId` and `mode` (slice 4's own schema removes them), refusals use one generic wording (slice 6), nothing is written to `refinement-starts.json` yet (slice 7), and `establishingProjects()`/`keptStarts()` stay execution-only (slices 4, 5, 8). Shared start mechanics now live in `dashboard/server/startLaunch.ts`.
- `agent-launch-card-delete.spec.ts:51` failed once in a 234-spec parallel run; it does not touch start code and passed 24 of 24 isolated repeats and the later full run. Unexplained one-off; not reproduced.
- `tests/*.sh` payload checks need a newer bash than macOS system bash.
- `established-preparation.mjs` has no caller until slice 3.
- Slice 2 kept the wire `RunningStart` without `workflow` (two existing specs assert it exactly); `AgentLaunches.runningStarts()` strips it. Slice 3 adds it to `runningStartSchema` with those expectations only if the page needs it, and widens `StartsWorkflow` (store file `${workflow}-starts.json`).
