# Land unpublished preparation before starting execution from fresh remote main

**Identity:** SEED-128#publish-dirty-preparation-before-execution
**Source:** [refined story](../../seeds/SEED-128-automatic-preparation-handoffs.md#publish-dirty-preparation-before-execution).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/land-unpublished-preparation-before-starting-exe`
on `claude/land-unpublished-preparation-before-starting-exe`, under the
preparation assignment for `d.kanai-chan` (announced at `75364849`, `start`
returned `continued` for this plan at fetched `48ec2ca9`). Publication target:
`origin/main`; integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

A coordinator who instructs execution inside the active preparation session,
while its owned workspace still holds unlanded preparation, gets the
preparation landed on remote main and execution started in that same
workspace and branch through the ordinary installed start, fast-forwarded to
fetched trunk. In Story Branch Mode the branch becomes the story branch; in
Trunk Mode it stays the temporary execution branch. No second worktree,
branch, landing, or Take is created.

In scope, from the story: the trigger (an execution instruction for the
prepared story in the session holding its Preparing assignment, with
unlanded preparation in the workspace); resolving the start before landing,
including the source rule and a recorded `ready` assessment; the shared keep
sequence as its fourth keep source, "execution handoff", with no retirement
and no completion report of its own; the start with the preparation workspace
path and branch; recovery that repeats neither an accepted landing nor a
claim; preserved identity, plan, mode, checkout, and reporting context; the
creation record as the one ownership fact; the ADR 0009 and ADR 0007 step 3
alignment; and no script change.

Material exclusions, from the story: retaining the worktree after the
journey's automatic landing; the dashboard starting execution for a story
with an open session; one-shot execution from a preparation session and the
one-shot refinement journey; the refinement launch record's lifecycle;
carrying an unlanded draft into execution without landing.

Assumptions: the sibling SEED-128#land-planning-without-coordinator-questions
delivers the journey's "Land at the end of preparation" section and
disposition's three keep sources (observed on its story branch, see below);
this plan's guidance extends that text, so its integration into main precedes
slice 2 (pre-Take check under Current decisions). The execution instruction's
own authority covers the claim's publication; the announcement's
`--push-authorized` covers the landing.

## Published baseline and integration context

Origin was fetched at `48ec2ca9` by this plan's `start` (`continued`); the
workspace is at `75364849` plus the refined seed, and was reconciled onto
`5ba84efa` at landing, which already holds the sibling's wrap-up. The highest plan directory is `290`; `291` was free immediately
before this write. The installed copies under `.claude/skills/` and
`.agents/skills/` are a released payload and are not edited (AGENTS.md);
`src/skills/` is the source. The installed refinement skill in this
workspace predates the preparation journey, so this session ends at the
retained draft, as it says.

North Star "Remote history and optional local refresh" governs: execution
identity and workspace are owned by execution-location guidance, fresh
workspaces and queued selection use fetched remote history, and the Taken
claim is published before isolated implementation starts. The handoff follows
it: the preparation lands on trunk, then the ordinary start publishes the
Take from the reused workspace at fetched trunk. No topic is added or
revised. Accepted ADR 0002 (one representation per conceptual solution;
continuous integration before dependent work) and ADR 0006 (write for
executing agents) shape the slices; Proposed ADRs 0007 and 0009 are aligned
in slice 3 and keep their status.

## Existing solutions and selected approach

| Need | Finding |
| --- | --- |
| Land a retained preparation with its assignment ended | **Reuse** [Keep and publish the retained result](../../../src/skills/dough-story-refinement/references/preparation-disposition.md#keep-and-publish-the-retained-result) with `release` staging, exactly as the journey default does (sibling's slice 2). The handoff is a fourth keep source in "Decide what happens"; the sequence is not copied. |
| Keep the worktree through the landing | **Reuse** Dough Land's [retirement gate](../../../src/skills/dough-land/references/worktree-retirement.md): "A calling skill may add its own gate... retirement then waits". The handoff's gate is wrap-up's; Dough Land's retire step does not run. |
| Start execution in an existing worktree | **Reuse** `selectOwnedWorkspace` in `workspace-publication-select.mjs`: an existing path is reused under `fastForwardToFetchedTrunk` (clean, on the named branch, at or behind trunk). `publishStoryBranch` pushes the branch at the Take when the remote lacks it. Observed end to end below. |
| Ownership for later retirement | **Reuse** the creation record `refs/worktree/dough/created-for/<identity>` that preparation `start` writes through the same selection; `retirement-checks.mjs` `ownershipHold` retires on a matching identity. |
| A recorded `ready` assessment before the start | **Reuse** the preparation recorder's assessment step; `execution-source.mjs` refuses `source-refused: published preparation is <status>` for anything but `ready` (observed). |
| Guidance proof | **Reuse** the `node --test` guidance tests under `src/skills/dough-story-refinement/scripts/` (`preparation-landing-guidance.test.mjs` is the model) and `src/skills/dough-execute-plan/scripts/established-start-guidance.test.mjs` for the execute-plan pointer. |
| Mechanics proof | **Reuse** `preparation-assignment-land.test.mjs`'s fixtures (`startPreparation` with `--branch`, `releasePreparation`, `landWorktree`) and `execution-start.mjs` through `exec`; the chain was run as a scratch test (below) and becomes slice 1's retained test. |
| Room in the execute-plan skill | **Gap.** `src/skills/dough-execute-plan/SKILL.md` is at the 250-line limit (`refactor-checks.md:123-128`); slice 2 adds its pointer sentence and tightens wording in the same file to stay at or under the limit. |

## Current decisions

- One landing sequence, four keep sources. "Decide what happens to the
  written result" lists the execution handoff after one-shot `--auto-land`:
  condition, the execution instruction in the session holding the story's
  Preparing workspace with unlanded preparation; candidate check, `release`
  staging; retirement, none, the workspace continues; final operation, none,
  execution's finish or wrap-up reports. The journey's new section names the
  handoff once; the three preparation skills and the execute-plan skill link
  to it.
- Resolve before landing. The handoff first resolves the execution source
  and authority under the execute-plan skill's "Establish execution context",
  the mode, the publication preconditions, the start's inputs, and a recorded
  `ready` assessment on the result (planning's own, or planless under an
  explicit skip-planning instruction through the recorder's planless
  authority). Any stop here retains the draft and assignment and lands
  nothing, because the start would refuse the landed result.
- The start is the ordinary installed `execution-start.mjs start` with the
  preparation workspace path and branch; its receipt is retained as the
  execution identity exactly as "Take or admit work" says. No established
  start block, no new command, no formatter change.
- Pre-Take check for slices 2 and 3: fetched `origin/main` must contain the
  sibling's journey section "## Land at the end of preparation" and the
  "Three sources supply a keep instruction" list. If it does not, slice 1
  may proceed; slices 2 and 3 wait for the sibling's integration rather than
  editing the pre-sibling text (ADR 0007 step 5: related stories run
  sequentially from the integrated result).
- Guidance changes are proved by guidance tests written to discriminate: a
  scratch removal of the pinned sentence fails the test before the edit is
  reverted. The ADR change has no test; its proof is a read against the
  journey's words plus `node scripts/lint.mjs`.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A landed preparation worktree is accepted by the execution start as its workspace, with the branch published as the story branch | Slices 1 and 2 | Scratch test in this workspace (`src/skills/dough-story-refinement/scripts/scratch-handoff.test.mjs`, deleted after the run, Node v24.5.0): `createPreparationTrunk`, `startPreparation` with `--branch claude/story-c` into a new path (`announced`, `selection.created: true`, worktree refs `created-for/SEED-C#c` and `preparation-assignment`), refine, plan, record `planned` then `ready`, `release` (`release-staged`), `landWorktree` with `createdForWork: false` (`stopped: null`; cleanup `preserved`, reason `created for other work: SEED-C#c`; worktree HEAD equals `refs/heads/main` on origin; `refs/heads/claude/story-c` absent on origin). Then `execution-start.mjs start --integration <integration> --workspace <same path> --branch claude/story-c --identity SEED-C#c --publisher-id publisher-c --mode story-branch --remote origin --target main --push-authorized --workspace-authorized --host claude`: `{"ok":true,"status":"published","created":false,"agent":"Akiho-chan","plan":"slice-plans/C/PLAN.md","changedSinceReview":false,"maintenance":{"result":"advanced"}}` with `startingRevision` equal to the landed tip, `refs/heads/main` and `refs/heads/claude/story-c` on origin both at `publishedSha`, the story under `## Taken`, the `created-for` ref unchanged, and a clean worktree. | Confirmed; no script change. |
| The start refuses a published preparation that is not `ready` | Decision "Resolve before landing"; slice 2 | Same scratch chain before recording the assessment: `{"ok":false,"status":"source-refused","implemented":false,"error":"published preparation is absent"}`; `execution-source.mjs:184-186` refuses every status but `ready`. | Confirmed: the handoff needs a recorded `ready` assessment before it lands. |
| The sibling delivers the text slice 2 extends | Slice 2 and 3 base | `origin/claude/automatically-land-completed-slice-planning-when` at `f67d8ca0`: plan 290 slices 1 to 4 `done` with an execution-complete record; its `preparation-journey.md` carries "## Land at the end of preparation" and "## Report once at the end"; its `preparation-disposition.md` lists "Three sources supply a keep instruction"; `preparation-landing-guidance.test.mjs` pins them. Not on `origin/main` at `48ec2ca9`; at this plan's landing, `origin/main` `5ba84efa` contains its wrap-up merge (`c02ee939`). | Confirmed and integrated; the pre-Take check reads the same from main. |
| The execute-plan skill has no room | Slice 2 | `wc -l src/skills/dough-execute-plan/SKILL.md` = 250; limit `refactor-checks.md:123-128`. | Confirmed. |
| Execution start never reads the preparation assignment record | Slice 1 | `preparationAssignmentRef` is defined in `workspace-publication-ownership.mjs:16` and read only by `preparation-assignment-ownership.mjs`; the scratch start succeeded with the record present. | Confirmed. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| Story Branch Mode handoff: one landing commit, `published` with `created: false`, branch published at the Take, first slice in the same worktree (1) | 1, 2 | Slice 1's chain test asserts the receipts, refs, Taken entry, and clean worktree; slice 2's guidance test pins the section that teaches it. |
| Trunk Mode handoff keeps the temporary branch and publishes the first increment to main (2) | 1, 2 | Slice 1's chain test, trunk variant: `created: false`, no remote branch, Take on main. |
| Open coordinator question: report, land nothing, claim nothing (3) | 2 | Guidance test pins the resolve-before-landing stop and the open-question link. |
| Refine-only result with skip-planning lands and starts planless; without it the source rule stops first (4) | 2 | Guidance test pins "resolve the start before landing", the source-rule link, and the recorded `ready` requirement with its planless authority. |
| `story-left-queue`: nothing committed or pushed, `choices` listed, no start (5) | 2 | Guidance test pins the keep-sequence stop handling; `preparation-assignment-land.test.mjs` and `preparation-assignment-landing-retry.test.mjs` already prove the receipts. |
| Landing accepted, start refused: rerun lands nothing twice and the same start answers `published` or `resumed` (6) | 2 | Guidance test pins the recovery paragraph; the existing start tests prove `existing` and `resumed` for a repeated start with the same workspace, branch, and publisher. |
| Unreverted scratch edit stops before any commit (7) | 2 | Guidance test pins the validation link. |
| Worktree already retired: the ordinary start creates a workspace (8) | 2 | Guidance test pins the trigger's boundary sentence. |
| Four keep sources, no retirement, no completion report for the handoff (Architecture) | 2 | Guidance test pins disposition's list and the journey section's two differences. |
| ADR 0009 and ADR 0007 step 3 name the reused workspace (scope) | 3 | Read against the journey section; `node scripts/lint.mjs` passes. |
| Execute-plan skill at or under 250 lines (scope) | 2 | `wc -l` after the edit. |

## Ordered slices

### 1. A landed preparation worktree continues as the execution workspace
Type: Behavior
Status: done
Proof: `node --test src/skills/dough-story-refinement/scripts/preparation-handoff-execution.test.mjs`
passes: for Story Branch Mode, the chain observed above ends `published`,
`created: false`, `startingRevision` at the landed tip, the branch on origin
at `publishedSha`, the story Taken, the `created-for` ref present, and the
worktree clean; for Trunk Mode, the same except no remote branch. A scratch
change of the start's `--workspace` to a new path with a new branch makes
both modes' `created: false` assertion fail before it is reverted.

Accepted 2026-10-10 on Node v24.21.0: 2 tests pass; the whole
`node --test` suite (1064 tests) passes with the fixture's shared `linkC`.
Learning for slice 2's recovery wording: a start that names the preparation
branch with a different workspace path is refused `setup-failed` ("a branch
named ... already exists") while that branch is checked out in the
preparation worktree; it creates no second worktree.

Behavior: A preparation worktree that `start` created at fetched trunk, with
a refined story and a `ready` plan and its release staged → `landWorktree`
without retirement, then `execution-start.mjs start` with the same path and
branch → the landing is one commit on origin's main, the worktree sits at
that tip, the start reuses it, publishes the Take, and in Story Branch Mode
publishes the branch at the Take. The test lives beside
`preparation-assignment-land.test.mjs`, reuses its fixtures and
`dough-land-test-fixtures.mjs`, and runs `execution-start.mjs` through
`exec`; production scripts are unchanged.

### 2. The execution handoff lands the retained preparation and starts execution in the same worktree
Type: Behavior
Status: done
Proof: `node --test src/skills/dough-story-refinement/scripts/preparation-handoff-guidance.test.mjs src/skills/dough-story-refinement/scripts/preparation-landing-guidance.test.mjs src/skills/dough-execute-plan/scripts/established-start-guidance.test.mjs`
passes with the new test pinning the journey's handoff section, disposition's
four keep sources, and the execute-plan pointer, and the landing test updated
from three sources to four; a scratch removal of the section's "no
retirement" sentence fails the new test before the edit is reverted;
`wc -l src/skills/dough-execute-plan/SKILL.md` ≤ 250.

Accepted 2026-10-10 on Node v24.21.0: the three files pass (30 tests), the
"No retirement" removal failed `the handoff's landing retires nothing`, and
`node --test "src/skills/**/*.test.mjs"` passes (780 tests). The execute-plan
skill is at exactly 250 lines; the three preparation skills each gained one
link sentence beside their session-end sentence. Guidance tests pin wording;
no native host run observed an agent performing the handoff.

Behavior: An execution instruction for the prepared story, with its mode,
reaches the session holding that story's Preparing assignment while the
workspace holds unlanded preparation → the agent resolves the start first
(source and authority, mode, publication preconditions, start inputs, a
recorded `ready` assessment, planless only under explicit skip-planning
authority), enters the keep sequence with `release` staged, lands through
Dough Land without its retire step and without a completion report, runs
`execution-start.mjs start` with the preparation workspace path and branch,
retains the receipt as its execution identity, and continues at
checkout-bound setup and the first slice. A stop before landing retains the
draft and assignment; a landing stop or refused start follows the recovery
paragraph (rerun `release` and the landing, then the same start); nothing
unlanded and an already retired worktree mean the ordinary start.
`preparation-journey.md`: new section "## Hand off to execution in the same
session" after "Land at the end of preparation", naming the trigger and its
boundary, resolve-before-landing, the keep-sequence entry with its two
differences, the start, identity continuation, recovery, and the retirement
and reporting owners (wrap-up, execution's finish).
`preparation-disposition.md`: "Decide what happens" lists four keep sources,
the fourth being the execution handoff with candidate check `release`
staging. `src/skills/dough-execute-plan/SKILL.md` "Take or admit work": one
sentence sending a session that holds the story's Preparing workspace with
unlanded preparation to the journey's handoff section before the start
command, with wording tightened elsewhere in the file to stay within 250
lines. `established-preparation.md`: the continuation sentence names the
handoff as one way the session may end.

### 3. ADR 0009 and ADR 0007 name the reused preparation workspace
Type: Behavior
Status: done
Proof: a read of the changed lines against the journey's handoff section;
`node scripts/lint.mjs` passes; ADR statuses unchanged.

Accepted 2026-10-10: each ADR clause matches a sentence of the journey's
handoff section; `npm run --silent lint` exits 0 (bare `node scripts/lint.mjs`
needs `node_modules/.bin` on `PATH`); both ADRs stay Proposed.

Behavior: ADR 0009 "Owned workspaces and branch modes" → one sentence after
"Start a fresh preparation or execution workspace from freshly fetched remote
trunk": a preparation workspace whose result has landed may continue as the
execution workspace when the start reuses it at fetched trunk, and in Story
Branch Mode its branch becomes the story branch. ADR 0007 Story Branch Mode
step 3 → "then create its feature branch and worktree, or continue the
preparation workspace and branch when the session hands off to execution",
with the flowchart edge "Execution startup" unchanged. Both stay Proposed.

## Execution complete

Product advice: no backlog change. The review found no defect, residue, or
correction to plan. Two points for wrap-up:

- The story's scope says the handoff is the keep sequence's "third entry" and
  "one landing concept with three entries"; the delivered guidance lists four
  keep sources, because the sibling story added the journey default first.
  Assimilate the delivered count, not the story's.
- No agent has yet performed the handoff in a native host session. The chain
  is proved by `preparation-handoff-execution.test.mjs` and the guidance by
  wording tests; a native run costs money and stays a manual observation.

## Considered and excluded

- A refinement option such as `--execute`: the trigger is the execution
  instruction itself; an option would add a second way to say it.
- A handoff script or a change to `execution-start.mjs`: the chain works with
  the existing commands, observed above.
- A dashboard change for a story with an open session: excluded by the story.
- Carrying the draft into execution without landing (`--carry` style):
  rejected in the story, since the start reads the preparation from trunk.
- Pinning the handoff in `established-start-guidance.test.mjs` beyond the
  pointer sentence: the handoff's start is the ordinary one, so its
  continuation needs no new reference.
