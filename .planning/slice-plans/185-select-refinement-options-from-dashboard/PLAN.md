# Select refinement options when launching from the dashboard

## Source and authority

- **Identity:** SEED-061#select-refinement-options-from-dashboard
- **Source:** [refined story](../../seeds/SEED-061-refinement-options-from-dashboard.md#select-refinement-options-from-dashboard)
  (Goal, Scope, Key examples, UI, Architecture).
- **Authority:** Terry requested upfront design and a slice plan on 2026-09-30.
  Planning only; this plan grants no implementation, Take, or publication.
- **Preparation:** Owned workspace `.worktrees/select-refinement-options-from-dashboard`
  (branch `claude/select-refinement-options-from-dashboard`), Preparing assignment
  published by `YeongSheng-chan`.

## Goal and scope

A developer starting refinement from a Backlog card chooses among the options the
target project's installed refinement skill defines, and the session starts as
that command with those flags. One definition file serves the agent, the launch
boundary, and the dialogue; exclusivity is a property of a group in that file
and is proven with a test definition. Deferred: other commands, remembered
selections, other hosts, and the options' reasoning techniques.

## Direction and existing solutions

Follows the [Architectural North Star](../../NORTH-STAR.md#command-options-one-definition-three-consumers)
and the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md#refinement-options-in-the-launch-dialog),
Accepted ADR 0002 and ADR 0006. No Accepted ADR conflicts; no ADR is proposed
(dashboard and one skill file only).

**PFE outcome: reuse and extend.**

- `src/skills/dough-story-refinement/references/refinement-options.json` is the
  existing authority for flags, labels and instructions; it gains `summary`
  (per option) and optional `groups`. No second option list.
- `launchWorkflows` (`src/agentLaunch.ts`) is the one workflow table; the
  refinement row names its definition file.
- `claudeInstruction` (`server/claudeLaunch.ts`) already builds
  `/<skill> <identity>`; it appends flags there.
- The machine sessions read already carries per-project installed-skill facts
  (`establishing`); definitions join it instead of a new endpoint.
- The `--model` path (request field, boundary refusal, record, entries) is the
  template for the selection path; slices mirror it.
- `execution-start` hard-codes `.claude/skills/<skill>/scripts`; slice 1 gives the
  installed-skill location one owner that both readers use.
- Gap: no shared option model exists; `src/commandOptions.ts` is new.

The definition may gain a separate `focuses` list (plan 184); the reader treats
`options` and `focuses` as one flat selectable list and never names a technique.

## Decisive premises observed during planning

Observed 2026-09-30 in the owned workspace.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Nothing but docs reads the definition | Slices 2-4 | `grep -rln refinement-options` → `install.sh` (payload), `SKILL.md`, docs and plans only; no `dashboard/` or script hit | Confirmed; the new reader duplicates no parser. |
| The shipped definition has keys `command, default, selection, options`; each option has `flag, label, instruction` and no `summary`/`groups` | Slices 2-4 | `python3` load: 6 options (explore, borrow, challenge, clarify, investigate, stress-test) | Confirmed; `summary` is new content (slice 4). |
| A launch's instruction is `/<skill> <identity>`, then established start, then the developer's text | Slice 2 | Read `claudeInstruction`, `server/claudeLaunch.ts:98-113` | Confirmed. |
| The sessions answer is read on every poll and carries `establishing` | Slice 4 | Read `server/agentLaunchPlugin.ts:118-125`, `establishingProjects` `server/agentLaunches.ts:222`, `src/agentLaunches.ts:140-215` | Confirmed; a sibling field follows the same path. |
| Tests can put an installed skill into a fake project folder | Slices 2-6 | `tests/support/startOrigin.ts:133` copies `src/skills/<skill>` to `<project>/.claude/skills/<skill>`; `tests/agent-launch-start.spec.ts:191-200` asserts `establishing` for it | Confirmed; fixtures copy the refinement skill and may overwrite its definition. |
| Boundary tests run the whole request against a synthetic `claude` in dev and preview | Slices 2-3, 6 | Read `tests/agent-launch-model-boundary.spec.ts` (`server.claudeLaunchCalls()`, `argv`, refusal cases) | Confirmed; the selection path copies its shape. |
| The refinement dialog states the command as “Sent after /{skill} {identity}.” | Slice 4 | Read `src/StartLaunch.tsx:125-140` | Confirmed; the live command line edits this hint. |
| Next plan number | Placement | `.planning/slice-plans/` locally and `origin/main`: max 184 | 185 chosen. |

No premise needs a paid or credentialed observation.

## Outside-in proof

Stable boundary: the launch boundary over HTTP (`/__agent-launch`) in dev and
preview, and the launch dialog in the existing launch journey
(`tests/launchJourney.ts`, `launchCardPage.ts`) against the synthetic `claude`.
The real `claude` and paid runs are never reached. Fixtures copy the refinement
skill into the fake project's `.claude/skills` and, where a case needs it,
replace its definition with a test definition.

| Promise | Owner | Observable check |
| --- | --- | --- |
| Selected flags reach the session exactly as a direct invocation | Slice 2 | Boundary: `options: ["--borrow","--explore"]` → `--bg` argv instruction `/dough-story-refinement <id> --explore --borrow` then the developer text; record keeps them |
| No selection is today's launch | Slices 2, 4 | Boundary and dialog: same argv as before; existing refinement specs unchanged |
| Unknown flag, or a flag the project's definition lacks, is refused naming it, before `claude` | Slice 2 | Boundary: 4xx with the flag in the text; `claudeLaunchCalls()` unchanged |
| Options for a project with no/invalid definition, or for a workflow without a definition, are refused with why | Slice 2 | Boundary: fixture without the file; execution request with `options` |
| Exclusive group: one member with outside options accepted; two refused naming group and members | Slice 3 | Boundary with a test definition `{A,B}` exclusive and `C` free |
| A malformed definition (flag in two groups, unknown member, duplicate flag, wrong `command`) is unavailable, not partially honored | Slice 3 | Boundary with each malformed test definition: `options` refused |
| The dialogue offers exactly the installed definition, with label, flag and summary, and no second list | Slice 4 | Dialog spec against the copied real definition; then a definition with an added option shows it with no code change |
| Selecting options sends the same launch as the direct command; the live command line shows it | Slice 4 | Dialog: select Explore + Borrow → hint text and `--bg` argv |
| Shipped definition is valid and explained | Slice 4 | Drift check parses the real file with the shared schema: every option has a `summary` |
| Exclusive group is radios with a “No <group>” choice; free options stay checkboxes | Slice 5 | Dialog with the test definition |
| No definition / reading / invalid definition are said, Start still works; refusal keeps the selection | Slice 5 | Dialog specs with fixtures; boundary refusal shown as “Launch failed:” with the selection kept |
| Sessions say what options were requested | Slice 6 | Card and Recent sessions entries: “Options: --explore --borrow (requested)”, nothing without options |

Focused runs (Playwright, per file; no full-suite local gate):

```sh
npx playwright test --config dashboard/playwright.config.ts \
  dashboard/tests/agent-launch-options-boundary.spec.ts \
  dashboard/tests/agent-launch-options-groups.spec.ts \
  dashboard/tests/agent-launch-options.spec.ts
```

plus the unchanged specs each slice's change can reach (`agent-launch-start.spec.ts`,
`agent-launch-start-refusal.spec.ts` in slice 1; `agent-launch-model*.spec.ts` in
slices 2-6). Hosted CI runs the rest. Each slice follows the established
[proof acceptance, post-change refactoring, and delivery contract](../../../src/skills/dough-execute-plan/references/wrap-up.md).

## Slices

### 1. One owner for a project's installed skill files
Type: Structure
Status: done
Proof: `agent-launch-start.spec.ts` and `agent-launch-start-refusal.spec.ts`
pass unchanged. Accepted: 7 of 7 passed via
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-start-refusal.spec.ts`
from the workspace root; `npm run typecheck:dashboard` passed.

Structure: `server/executionStart.ts` builds `.claude/skills/dough-execute-plan/scripts`
itself. Add one `installedSkillPath(project, skill, ...segments)` (Claude Code's
skill root, owned by the Claude host module's convention) and use it there,
enabling slice 2 to read a definition without a second hard-coded root.

### 2. Launch a refinement with selected composable options
Type: Behavior
Status: done
Proof: new `tests/agent-launch-options-boundary.spec.ts`, dev and preview, per
the table (selected flags in definition order, no selection unchanged, unknown or
missing flag, no/invalid definition, options on a workflow without a definition,
record keeps flags). Accepted: `agent-launch-options-boundary.spec.ts` 30 of 30
(dev and preview) and 148 of 148 with the start, model and launch boundary specs;
`npm run typecheck:dashboard` passed.

Behavior: A launch request for the refinement workflow carrying `options` →
the boundary reads the project's installed definition, validates the flags, and
starts `claude --bg` with `/dough-story-refinement <identity> <flags in
definition order>` then the developer's text; otherwise it refuses with the
option named before any `claude` runs.

Adds `src/commandOptions.ts` (pure): the definition schema (`command`, `options`,
optional `focuses`, flags unique, each entry `flag`, `label`, `instruction`),
`selectionProblems` (unknown flag), canonical order. Adds `options` to the
request and launch record schemas, an `options` file name to the refinement row
of `launchWorkflows`, a server reader returning the definition or a reason
(missing, unreadable, invalid, wrong command), and validation in admission with
one wording for each refusal.

### 3. Honor exclusive groups
Type: Behavior
Status: planned
Proof: new `tests/agent-launch-options-groups.spec.ts` with test definitions
placed over the copied real one; the per-slice check in the table; slice 2's
spec unchanged.

Behavior: A definition declaring a group with `selection: "exclusive"` and flags
{A, B} → `A + C` launches, `A + B` is refused naming the group and both flags,
and a malformed group makes the definition unavailable.

Extends the schema with `groups` (`id`, `label`, `selection: "exclusive"`,
`flags`, each flag in at most one group, members must exist) and
`selectionProblems` with the exclusive conflict. Adds one sentence to the
refinement `SKILL.md` where it loads the definition: options listed in the same
group are exclusive; if a request names more than one, stop and report the
conflict. Ships no group in the real definition.

### 4. Choose options in the refinement dialog
Type: Behavior
Status: planned
Proof: new `tests/agent-launch-options.spec.ts` (copied real definition, then
added option), the drift check on the real file, and `agent-launch-model.spec.ts`
plus the existing refinement dialog specs unchanged.

Behavior: Backlog card, project definition available → **Start refinement**
opens with an Options group, one checkbox per option (label, flag, summary),
selecting Explore + Borrow updates “Sent after /dough-story-refinement <id>
--explore --borrow.” and Start launches those flags; nothing selected is
today's dialog and launch.

Adds `summary` to each option in the real definition (its shipped content,
authored in `src/skills/`) and requires it in the schema. The sessions read
carries each project's definition availability beside `establishing`;
`LaunchDialog` renders it and hands `options` back in `LaunchChoices`. Other
dialogs render no group.

### 5. Exclusive groups and unavailable definitions in the dialog
Type: Behavior
Status: planned
Proof: extend `tests/agent-launch-options.spec.ts` with the test definition and
the no-definition, reading, and refusal cases in the table.

Behavior: A group is a fieldset of radios with a “No <group label>” choice while
free options stay checkboxes; a project without a usable definition shows one
quiet line and Start launches default refinement; a refused launch shows
“Launch failed:” with the option and keeps the selection.

### 6. Show requested options on sessions
Type: Behavior
Status: planned
Proof: new `tests/agent-launch-options-entries.spec.ts` after
`agent-launch-model-entries.spec.ts`.

Behavior: A session launched with Explore + Borrow → its card and Recent
sessions entries read “Options: --explore --borrow (requested)” beside the model
line; a launch without options shows nothing. The record keeps the flags, so the
words need no definition and stay true if the definition later changes; they are
spelled once beside `modelWords` in `launchSubject`.

### 7. Assimilate the design
Type: Structure
Status: planned
Proof: docs read against the built behavior; relative links resolve.

Structure: move the lasting launch rules into `dashboard/AGENT-LAUNCH.md`
(options, boundary refusal, definition source, Options dialog text) and the
terminology row of the UX/UI North Star; delete the “Command options” topic
from `.planning/NORTH-STAR.md` and the “Refinement options in the launch
dialog” section from the UX/UI North Star; drop the seed's links to them.
Wrap-up owns the seed and this plan.

## Considered and excluded

Other commands' options, remembered selections, order-sensitive selection, a
shipped exclusive refinement group, and a generic plugin or registry.

## Learnings and decisions

- `summary` is required in the schema so an option added elsewhere without one
  fails the drift check; plan 184's focus entries then need a `summary`.
- Slice 1 placed `installedSkillPath` in `dashboard/server/claudeWorkspace.ts`,
  beside the host's other on-disk conventions. Fixture builders in
  `dashboard/tests/support` keep the literal `.claude/skills` layout so a wrong
  production root cannot mirror into them; slice 2's fixtures do the same.
- Playwright specs run from the workspace root: fixtures copy `src/skills`
  relative to the current directory, and a run from `dashboard/` leaves a
  linted `dashboard/dashboard/dist`.
- Slice 2 keeps the record's flags in definition order (admission rewrites the
  request) and reads options and `focuses` as one flat list. No test sends
  flags in an order that differs from a differently ordered definition.
