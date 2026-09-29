# Launch refinement in a Claude Code background session

## Source and authority

- **Identity:** SEED-052#launch-claude-refinement-background.
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#launch-claude-refinement-background),
  refined with Terry on 2026-09-29. It is the second story of the SEED-052
  launch chain, after the delivered
  [execution launch](../../../dashboard/AGENT-LAUNCH.md).
- **Authority:** Terry asked to complete the refinement and write a slice
  plan. He stressed that this story and the delivered execution launch must
  become one unified solution working toward one cohesive North Star.
  Planning only: no Take, execution, or publication beyond the preparation
  workflow.
- **Workspace:** `.worktrees/prep-launch-claude-refinement-background` (branch
  `claude/prep-launch-claude-refinement-background`), announced as agent
  Eimi-chan at `d73022eb`.

## Outcome and boundaries

The developer looking at a project's backlog starts refinement of any queued
story there, through the same launch boundary, dialog, and Started as
execution. The card shows a local refinement **Started** until origin shows
the story **Preparing** or it leaves the Backlog.

Included:
- **Start refinement** beside **Start execution** on every Backlog card, and
  neither on Taken;
- the `/dough-story-refinement <identity>` instruction, with the optional
  developer instruction;
- one session name rule, `<project> · <workflow> · <title>`, for both
  workflows;
- Started naming its workflow, with each action giving way only to its own
  Started;
- settlement on a published preparation assignment;
- a note on Start refinement when the card already shows Preparing;
- documentation of both workflows.

Excluded:
- session access after settlement (stories 2 and 3);
- a skill chooser, planning-only or other workflows;
- scripted preparation;
- other hosts;
- moving the browser's Claude Code wording behind the host (story 7).

## Key examples

1. A queued, unrefined story with the instruction "Focus on the empty-state
   wording": a session named `Open Dough · Refinement · <title>` starts in
   `~/git/open-dough` on `/dough-story-refinement <identity>`, a blank line,
   and the instruction. The card shows a refinement Started and still offers
   Start execution.
2. Origin then publishes a preparation assignment for the story: the card
   shows Preparing, no refinement Started, and Start refinement notes that the
   story is being prepared.
3. Execution and then refinement are started on one story. The card shows
   both Started records, each naming its workflow. When origin shows the Take,
   both are gone.
4. An untrusted folder: the card explains the failure beside Start
   refinement; Start execution is unaffected.
5. Escape in the refinement dialog sends nothing.

## Architecture and domain model

### Established direction

- [North Star: agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment),
  revised by this plan (see below). Its growth path for this story was:
  "`preparation` for refinement later" and "awaits publication until the
  published snapshot shows the assignment its activity asks for".
- [North Star: one narrow loopback read boundary](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  process responsibility stays in the local Vite boundary; browser modules
  import no Node code.
- [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  (Proposed): a *developer assignment* is an undertaking to prepare or
  execute; Preparing derives from an active preparation assignment. Launch
  records stay machine-local evidence. No Accepted ADR is affected.

### Revised direction: a launch starts a workflow

The first story modeled a launch as requesting an **activity**. That was
enough while execution was the only launch, because each activity then had
one workflow. The `preparation` activity already hosts refinement, slice
planning, and plan refinement, so the activity alone cannot say which skill
to run. The North Star topic now says that a launch starts a **workflow**, and
each workflow names:
- its skill, and
- the activity whose assignment settles it.

That keeps one table as the single place a workflow is defined. The boundary,
host, settlement, and card read it, and nothing else spells a workflow. Only
the two delivered workflows are entered. Planning-only and other workflows
are added by the story that delivers them.

### Domain model

Unchanged concepts from plan 144's domain model (`git show 7362e0bf:.planning/slice-plans/144-launch-claude-execution/PLAN.md`)
(project, project folder, work item, host, host session, launch result,
session access) keep their homes. This story changes or adds only these:

| Concept | Meaning | Home |
| --- | --- | --- |
| Launch workflow | What the developer launches: `execution` or `refinement`. Each has a display name (Execution, Refinement), the skill it runs (`dough-execute-plan`, `dough-story-refinement`), and the activity whose assignment it asks for (`execution`, `preparation`). | `launchWorkflows` table in `src/agentLaunch.ts` |
| Agent launch request | Project, work item, **workflow** (replacing `activity`), host, optional instruction. | `src/agentLaunch.ts` |
| Launch record | Unchanged shape; its request now names the workflow. Records live only in server memory, so nothing migrates. | `server/agentLaunches.ts` |
| Assignment shown | Whether a backlog entry shows an assignment of an activity: preparation means its `preparing` is present. An execution assignment moves the entry to Taken, so no backlog entry shows one. | `src/agentLaunch.ts` |
| Awaiting publication | One rule for every workflow: the item is still in the backlog and does not show an assignment of the workflow's activity. | `launchAwaitsPublication` in `src/agentLaunch.ts` |
| Card launch | Per workflow: the latest awaiting record for (identity, workflow) shows Started; otherwise the workflow's action. A launch attempt is keyed by (project, identity, workflow). | `CardLaunches` in `src/CardLaunches.tsx` (moved out of `WorkStages.tsx` in slice 1); `useAgentLaunches` in `src/agentLaunches.ts` |
| Launch action and dialog | One component for any workflow, worded from the table. It takes the workflow's card note: execution's "Not marked Ready for execution", refinement's "Being prepared". | `src/StartLaunch.tsx` (from `StartExecution.tsx`) |
| Started | Names its workflow ("Refinement started in Claude Code"). | `src/LaunchStarted.tsx` |
| Claude Code invocation | `/<skill> <identity>`, then the instruction; name `<project> · <workflow> · <title>`. The slash syntax stays host-specific. | `server/claudeCode.ts` |

The card note is the one per-workflow difference in presentation. Each
workflow's note is a pure function of the entry in the same table: execution
reuses `readyBadge`, refinement reads `preparing`. The action and dialog stay
one component.

### Existing solutions (PFE)

| Candidate | Finding | Choice |
| --- | --- | --- |
| Execution launch model (`src/agentLaunch.ts`, `server/agentLaunches.ts`, `server/agentLaunchPlugin.ts`, `server/claudeCode.ts`) | Request, record, result, confirmation, failure categories, and records GET are workflow-neutral. Execution is hard-coded only at the instruction (`claudeCode.ts:28`), the name (`claudeSessionName`), the admission (`agentLaunchPlugin.ts:81`), and the settlement comment. | Change in place: generalise over the workflow table. |
| `useAgentLaunches` (`src/agentLaunches.ts`) | `startExecution` and `attemptOf(identity)` key one attempt per card. | Generalise to `start(work, workflow, instruction)` and `attemptOf(identity, workflow)`. |
| `StartExecution.tsx` | Action, dialog, focus return, answer rendering, and the not-ready note; only its words and note are execution's. | Rename to `StartLaunch.tsx`, parameterised by workflow; no second component. |
| `LaunchStarted.tsx` | Workflow-neutral apart from its heading. | Reuse; its heading names the workflow. |
| `entry.preparing` (`src/publishedWork.ts:50-52`) | Backlog entries already carry their published preparation assignment. | Reuse for settlement and the refinement note; no new reader. |
| `readyBadge` (`src/storyPreparation.ts`) | The readiness judgment behind execution's note. | Keep as execution's note. |
| Launch test support (`tests/agentLaunchBoundary.ts`, `tests/launchJourney.ts`, fake `claude`) | Raw-HTTP boundary requests; a committed-origin journey that already publishes a preparation assignment and then a Take through the production scripts. | Reuse; the request body names `workflow`. |

## Observed premises

Observed in `.worktrees/prep-launch-claude-refinement-background` (base
`023e15b3`) on 2026-09-29:

| Premise | Literal observation and result | Consequence |
| --- | --- | --- |
| The launch specs are green before any change. | From the default checkout, whose `dashboard/` is identical to `origin/main` (`git diff --stat HEAD origin/main -- dashboard` empty): `npx playwright test --config dashboard/playwright.config.ts --reporter=line agent-launch` gave 70 passed in 8.0 s. | Starting boundary for slice 1's unchanged-behavior proof. |
| Execution is hard-coded in exactly the places listed under PFE. | `grep` of `dashboard/src` and `dashboard/server`: `claudeCode.ts:28` `/dough-execute-plan`; `agentLaunchPlugin.ts:81` refuses `activity !== "execution"`; `agentLaunches.ts:94` `startExecution`; `WorkStages.tsx:27-53` `CardLaunch` renders `StartExecution` with `latestRecordOf(records, identity)`; `agentLaunch.ts:70-83` settles on backlog membership only. | Slice 1's change list is complete. |
| Backlog entries expose their published preparation assignment. | `publishedWork.ts:50-52`: `readonly preparing?: Preparing` on queued entries; `WorkStages.tsx:91` renders it. | Settlement and the note need no new read. |
| Tests pin the execution-only request and card. | `agent-launch-refusal.spec.ts:68-80` refuses `activity: "preparation"` and `"review"`; `agentLaunchBoundary.ts:18` sends `activity: "execution"`; `agent-launch-boundary.spec.ts:64-101` and `agent-launch-card.spec.ts:169` expect `Open Dough · <title>`; `accessible-overview-keyboard.spec.ts:40,57-58` counts two Start execution tab stops. | Slice 1 renames the request field. Slice 2 turns the preparation refusal into acceptance, updates names, and adds two Start refinement tab stops. |
| The settlement journey can publish Preparing before a Take. | `launchJourney.ts:73-91` announces preparation of Story B through the production `preparation-assignment` fixture, then takes it. | Slice 3 reuses it. |
| The refinement skill is installed in the Open Dough project folder. | `.claude/skills/dough-story-refinement/SKILL.md` exists in this repository's installed copy. | `/dough-story-refinement` resolves in the launched session. Other catalog projects rely on their own installation, the same assumption as execution. |
| A Claude Code background session can end its turn with a question and continue after the developer answers. | This preparation session is itself a Claude Code background job. It ended its first turn awaiting a keep decision; Terry's reply resumed it in the same session. | The interview-through-attach journey needs no paid probe. |
| Plan number. | `git ls-tree --name-only origin/main .planning/slice-plans/` ends at 147. | This plan is 148. |

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Execution launch, card, and settlement behave as before the generalisation. | 1: the existing `agent-launch-*` specs, with the request field renamed. |
| A same-origin refinement request starts a session on `/dough-story-refinement <identity>` plus instruction, in the project folder, named `<project> · Refinement · <title>`; execution is named `<project> · Execution · <title>`. | 2: boundary spec over raw HTTP in dev and preview, reading the fake `claude` argv and cwd. |
| An unknown workflow or a host other than Claude Code is refused before any process. | 2: refusal spec, with zero fake-`claude` calls. |
| Every Backlog card offers both actions and Taken none; the refinement dialog sends its instruction; Started names its workflow; each action gives way only to its own Started; a failure stays with its action; Escape sends nothing. | 2: card journey with fake `claude`; keyboard tab-stop spec. |
| A refinement Started survives reloads, settles when origin shows Preparing, and Start refinement then carries its note. An execution Started stays beside Preparing, and both go on the Take. | 3: settlement journey advancing the committed origin through a preparation announcement and a Take. |

## Ordered slices

### 1. Launches name the workflow they start
Type: Structure
Status: done
Accepted proof: the focused command gave 76 passed (the 70 baseline
`agent-launch` tests plus `accessible-overview`), rerun after the refactor
moved card launches into `CardLaunches.tsx`; typecheck and lint clean; the
whole `npm run test:dashboard` gave 226 passed before the refactor. The
`LaunchStarted` heading was left unchanged, so execution reads as today;
slice 2 names the workflow there with the card spec's expectation.
Proof: `npx playwright test --config dashboard/playwright.config.ts
--reporter=line agent-launch accessible-overview` stays green, with only the
request field renamed in test support; `npm run typecheck:dashboard`; the
whole `npm run test:dashboard`.

Internal change, with external behavior unchanged:
- `src/agentLaunch.ts`: add the `launchWorkflows` table, holding only
  `execution` (display name, skill, activity). The request's `activity`
  becomes `workflow`. `launchAwaitsPublication` becomes the one rule over the
  workflow's activity through *assignment shown*. `latestRecordOf` takes the
  workflow.
- `server/claudeCode.ts`: the instruction comes from the workflow's skill.
  Execution's session name stays `<project> · <title>` until slice 2 changes
  the rule for both workflows.
- `server/agentLaunchPlugin.ts`: admits the workflows in the table and host
  `claude`. The refusal text names the workflow.
- `src/agentLaunches.ts`: `start(work, workflow, instruction)`, with attempts
  keyed by (project, identity, workflow).
- `StartExecution.tsx` becomes `StartLaunch.tsx`, worded from the workflow
  and taking its note. The CSS class names follow (`start-launch-*`).
- `LaunchStarted.tsx` takes the workflow for its heading; execution's reads
  as today.
- `CardLaunch` renders one launch per table workflow.

Enables slice 2: adding refinement becomes one table entry plus its note,
with no second code path.

### 2. Start refinement from a Backlog card and see its launch result
Type: Behavior
Status: done
Accepted proof: after the refactor, the focused command widened to
`agent-launch accessible-overview read-failure` gave 91 passed, and the whole
`npm run test:dashboard` gave 229 passed; typecheck and lint clean. The card
journey is split into `agent-launch-card.spec.ts` (offering, dialogs,
Started) and `agent-launch-card-problems.spec.ts` (failed and uncertain
answers), opened through `tests/launchCardPage.ts`. Button and tab-stop
totals derive from `cardLaunchActions` in `tests/dashboardPage.ts`. Started's
region is named for its workflow ("Refinement started").
Proof: `npx playwright test --config dashboard/playwright.config.ts
--reporter=line agent-launch accessible-overview`; `npm run
typecheck:dashboard`; the whole `npm run test:dashboard`.

Behavior: A committed origin has a ready story, a not-refined story, and a
Taken story.
- Every Backlog card offers **Start refinement** after **Start execution**.
  The Taken card offers neither.
- The refinement dialog is headed "Start refinement in Claude Code". Its hint
  names `/dough-story-refinement <identity>`.
- Starting with an instruction sends the request to the boundary. The fake
  `claude` records the refinement instruction, a blank line, the instruction,
  `cwd` in the Open Dough folder, and the name `Open Dough · Refinement ·
  <title>`.
- The card shows "Refinement started in Claude Code" with the session id and
  `claude attach <id>`, and still offers Start execution. Starting execution
  as well shows both Started records.
- A folder-not-found answer shows beside Start refinement and leaves Start
  execution without an answer. Escape sends nothing.

Changes:
- Add the `refinement` workflow to `launchWorkflows`.
- Change the session name rule to `<project> · <workflow> · <title>` for
  both workflows.
- Update the specs that pin execution-only behavior:
  - boundary spec: refinement cases and the new execution name;
  - refusal spec: accepts refinement, still refuses an unknown workflow and
    `codex`;
  - card spec: refinement cases;
  - keyboard spec: two more tab stops.
- `dashboard/AGENT-LAUNCH.md` and the README launch sentence cover both
  workflows. The UX/UI North Star's Start execution / Started row becomes
  one row for the launch actions, reviewed for consistent wording.

### 3. A refinement's Started settles when the story shows Preparing
Type: Behavior
Status: done
Accepted proof: `agent-launch accessible-overview read-failure` gave 91
passed and the whole `npm run test:dashboard` 229 passed; after the refactor
the settlement spec gave 1 passed; typecheck and lint clean. Its test
"Started survives reloads and project switches; Preparing ends a refinement
Started and notes Start refinement, leaving the execution Started; the Take
or leaving the backlog ends every Started" also has a step proving that a
refinement launched on a story already Preparing settles at once. Forcing the
refinement note to `undefined` failed that spec. The note reuses
`showsAssignment`, the settlement predicate.
Proof: `npx playwright test --config dashboard/playwright.config.ts
--reporter=line agent-launch`; `npm run typecheck:dashboard`; the whole
`npm run test:dashboard`.

Behavior: Refinement and execution were both launched on queued Story B, and
origin has published nothing for it.
- Reloading the page, or selecting another project and back, keeps both
  Started records.
- Origin publishes a preparation assignment for Story B. The card shows
  Preparing and the execution Started. The refinement Started is gone, and
  Start refinement carries the note "Being prepared", described to assistive
  technology like execution's not-ready note.
- Origin publishes the Take. No Started remains anywhere.

Changes:
- The refinement workflow's note in the table.
- Extend `agent-launch-settlement.spec.ts` on `launchJourney.ts`.
- `AGENT-LAUNCH.md` and the UX/UI North Star state the refinement settlement
  and note. They also state that a refinement launched on a card already
  Preparing settles at once, with its session reached through
  `claude agents`.

## Execution complete

Product advice: Both main workflows now start from the dashboard through one
workflow table. At wrap-up:
- Record in story 2's *Known from launch* that a refinement Started settles on
  Preparing, and one launched on a card already Preparing shows no Started at
  all, so its session is reachable only through `claude agents`. This raises
  story 2's value.
- Narrow story 4 to what 1a leaves: the state-aware skill chooser and answering
  in the embedded terminal (story 3). Its launch is delivered.
- Story 6's dependency on 1a is met.
- When ADR 0008 is next reviewed, it can adopt *launch workflow* beside
  *developer assignment*, as the North Star topic now does.
No backlog reordering is supported by this execution.

## Current decisions

- One workflow table in `src/agentLaunch.ts`. No per-workflow copy of the
  action, dialog, Started, boundary admission, or settlement.
- One settlement rule for every workflow: awaiting while queued and not
  showing an assignment of the workflow's activity.
- The request names the workflow, not the activity. The records are in
  memory only, so the rename needs no compatibility path.
- The slash invocation and session name stay in the Claude Code host module.
  The browser's hint keeps spelling `/skill identity` until the second host
  (story 7), as the first story's product advice records.
- Verification: focused Playwright specs per slice, then `npm run
  typecheck:dashboard` and the whole `npm run test:dashboard` before each
  slice returns. This follows plan 144's accepted practice for dashboard
  changes. No paid run is needed.
- Use independent post-change refactoring and ordinary managed delivery when
  execution is later authorized.

## Learnings

- *Preparation shown* means `entry.preparing?.status === "recorded"`, not
  that `preparing` is present: once profiles are read every queued entry
  carries `preparing` as `unavailable`, `not-recorded`, or `recorded`, and only
  `recorded` renders Preparing. Slice 1's `showsAssignment` uses that rule.
- The table also carries a `verb` ("execute") so the dialog sentence stays
  word for word; slice 2 adds refinement's verb.
- `latestRecordOf` carries a temporary `eslint-disable-next-line` while
  execution is the only workflow; slice 2 removes it once lint reports it
  unused.
- A card with more than one action made hand-counted Tab and button totals
  in five specs drift; they now derive from `cardLaunchActions`, so a later
  workflow changes one test-support constant.
- The workflow note takes only `preparation` today; slice 3 widens it to
  `preparing` for refinement's note.

## Concern review

No blocking slice-specific concern was identified in this review.
- Slice 1 is Structure with one proof loop: the existing specs must stay
  green. It enables exactly slice 2's table entry.
- Slice 2 owns the launch journey.
- Slice 3 owns the settlement journey that the slice 1 rule makes
  observable. Between slices 2 and 3, a refinement Started already settles by
  that rule; slice 3 adds the note and the proof.
- The examples exercise one model: every workflow difference is a table
  field, and no special-case recognizer is added.
