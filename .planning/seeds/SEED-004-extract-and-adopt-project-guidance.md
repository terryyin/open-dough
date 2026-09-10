---
id: SEED-004
status: active
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: A real task benefits from reusable project guidance
scope: medium
---

# SEED-004: Extract useful guidance and use it on real work

## Goal

Turn one useful project practice into shared guidance, then use it on an actual
task. Keep source review and project-specific fixes manual. Shared skill behavior
follows the established Codex, Cursor, and Claude Code conventions.

## Stories

<a id="execute-simple-story-as-one-quick-slice"></a>

### 15. Execute a simple story as one quick slice

**Status:** Refined on 2026-09-11; selected for backlog.

**Goal:** A developer can execute a simple, direct story without first writing a
slice plan, using the ordinary execution procedure to produce a committed change.

**Scope:** The entry point is execute-plan invoked for the canonical story with
an explicit instruction to skip slice planning. Assume the coordinating human or
agent has already made that decision; selecting quick execution and coordinator
orchestration are outside this story. Treat the story as one slice and use the
normal execute-plan procedure, including its existing refactoring and delivery
rules, without duplicating that procedure or introducing a separate quick
lifecycle. The normal successful example ends with a commit; this does not
replace the existing push and CI rules.

Create no plan or substitute execution-record artifact on the successful quick
path. The same conversation, or execution chat history supplied to a later
review, provides execution details. Include retrospective support for a plan
that never existed: use the story, conversation, and related changes to establish
intent, completion, and review scope without fabricating a historical plan.
Missing substantive evidence still limits the affected review.

If execution reveals that the story is no longer simple or the slice is taking
too long, stop the quick path and use the established planning/refinement
workflow for the remaining work. Continue ordinary plan execution while
preserving completed work and proof, backlog state, and the connection to the
original execution. Apply existing work-ownership and human-decision rules.

**Boundaries:** No changes to story refinement, coordinator selection policy,
automatic complexity classification, numeric time thresholds, concurrent quick
slices, release, or adoption. Ordinary planned execution retains its executable
plan requirement. Wrap-up behavior is owned by the linked dependency; this story
does not add a closure workflow or require retrospective invocation by execution.

**Key examples:**

- Given an understood simple story and an explicit invocation to execute that
  story without slice planning, execute-plan treats it as one slice, follows its
  ordinary procedure, and produces a commit. No slice plan or substitute
  execution-record artifact is created.
- Given that completed execution in the current chat, or its chat history supplied
  to retrospective, retrospective reviews the story and related implementation
  using that evidence even though no plan file ever existed. It does not require
  historical-plan recovery or manufacture one. A missing commit attribution or
  missing proof is reported as that concrete evidence gap.
- Given a quick execution that becomes too complex or takes too long, the agent
  safely stops the quick attempt and plans/refines the remaining work through
  the existing workflow. Execution resumes from that plan without repeating
  completed work, losing proof, duplicating the Taken entry, or treating the
  continuation as unrelated work.
- Given ordinary execute-plan invocation without the explicit instruction to
  skip slice planning, existing executable-plan requirements remain in force.

**Value / learning:** Remove planning overhead for direct work while retaining
ordinary execution quality and recovery when the initial simplicity judgment
proves wrong.

**Depends on:**
[SEED-010 Story 7 — Wrap up work on the coordinator's retrospective decision](SEED-010-learn-from-execution-retrospectives.md#prove-retrospective-completion-without-redundant-plan-ceremony)
for closure from available execution context. That dependency owns wrap-up;
coordinator sequencing is not part of this story's implementation.

**Open decisions:** None for this refinement.

<a id="show-stories-as-taken-during-execution"></a>

### 14. Show queued work as taken when plan execution starts

**Status:** Done on 2026-09-10. Implemented directly at human direction without
a slice plan, reviewed in an execution retrospective, and closed through an
explicit one-off exception. New native acceptance was explicitly skipped.

**Goal:** A developer can distinguish a backlog item whose plan is being
executed from work that remains available in the queue.

**Scope:** Add a **Taken** section immediately above **Backlog list** in the
product-backlog layout and retain the section when it is empty. For a story or
bounded correction selected from the queue, execute-plan first resolves the
plan and confirms current execution authorization, then makes moving the
existing entry from **Backlog list** to **Taken** its first project-state
change. Preserve the entry's exact canonical link and identity, preserve the
order of entries already in **Taken**, append the moved entry, and never list it
in both sections. If it is already in **Taken**, resume without duplicating or
reordering it.

Refinement, initial slice planning, slice-plan refinement, and an unfulfilled
intent to execute do not change backlog placement. A context or authorization
failure before execution starts leaves the entry in the queue. After execution
starts, pauses and failures leave it in **Taken**; successful execution also
leaves it there for the existing retrospective and story-wrap-up lifecycle,
which removes completed work. Returning cancelled work to the queue remains an
explicit product-backlog maintenance decision. Executing work that was not
selected from the backlog does not fabricate a backlog entry.

Behavioral source changes are limited to `dough-product-backlog`,
`dough-execute-plan`, the minimum `dough-story-wrap-up` wording needed to remove
a completed **Taken** entry, and directly affected checks. It does not add a
general status model, owner metadata, timestamps, concurrency or locking,
automatic assignment, cancellation policy, finished history, release, or
adoption.

**Key examples:**

- Given the highest-priority entry is refined and then slice-planned, it remains
  first under **Backlog list** and **Taken** is unchanged.
- Given that queued entry and an authorized executable plan, starting execution
  moves the unchanged entry to **Taken** before implementation is delegated.
  This story's first execution performs the same
  transition as the bootstrap case.
- Given execution later pauses, fails, completes, or resumes, the entry remains
  once under **Taken**. Story wrap-up removes it after its existing completion
  conditions are met; only explicit backlog maintenance returns cancelled work
  to the queue.

**Completion:** Updated the shared product-backlog layout and transition,
execute-plan's first project-state change, and story-wrap-up's active-entry
removal. Recorded representative source walkthroughs for first execution,
pre-authorization failure, resume, non-backlog execution, and wrap-up. The
focused guidance, story-payload, and execution-payload checks passed; release
and adoption remain excluded. Commit `519bb4a` contains the implementation.
The retrospective recorded its process findings in `DearDough.md`; the human
authorized this story's planless execution as a one-off closure and directed
that its canonical story and **Recently done** entry remain.

<a id="plan-without-numbering-or-budget-prompts"></a>

### 13. Receive a slice plan without numbering or budget prompts

**Status:** Complete, 2026-09-10.

**Goal:** A developer requesting a plan receives it immediately when the story
and project planning location are known, without supplying a plan number or
inventing a numeric timing policy.

**Scope:** Reuse an existing active plan for the selected story. For a new plan,
use the next available number under the project's established numbering and
location convention, preserving padding and avoiding overwrite. A missing numeric
slice budget does not block planning: use cohesive slices with one observable
outcome and proof loop, report concrete uncertainty without a timing guarantee,
and honor any existing explicit limits. Align only directly contradictory shared
planning guidance. Exclude automatic execution, allocation tooling, new timing
defaults, unrelated feature promotion, and manual edits to installed copies.

**Completion:** Published `v0.3.5` from the reviewed bounded payload, then
updated this repository through its ordinary recorded-source updater. Both
native roots record `0.3.5`, the post-update self-installation check passed,
and a fresh installed Codex session created plan 033 without a supplied number
or numeric timing policy and without implementing the generated plan.


<a id="write-installed-skills-from-this-project"></a>

### 12. Write installed skills from this project's perspective

**Status:** Complete in source, 2026-09-09; implemented directly at human direction. Not yet released.

**Goal:** An agent using an installed Open Dough skill understands that its
instructions apply to this project, without maintainer-facing language implying
that it must locate or serve a separate client project.

**Scope:** Review externally distributed skills and their runtime references
under `src/skills/` for language written from Open Dough's internal maintainer
perspective. Fix “client project” and similar audience or location mistakes to
address the executing agent in this project. Check meaning in context rather
than doing only a literal phrase replacement: project guidance, paths,
decisions, and workflow context must resolve in the project where the skill is
being used. Keep an explicit distinction between this project and the Open
Dough source repository where the task actually needs both, such as updating.

Preserve useful behavior and required context; this is an audience/perspective
repair, not removal of checks for genuinely missing inputs or a redesign of
planning and execution policy. Apply the same review to related headings,
examples, and linked runtime instructions so the confusion does not survive
outside `SKILL.md`. “Client project” remains appropriate in internal maintainer
guidance and recognition records when describing Open Dough's consumers.

Edit the shared distributable sources only. Do not hand-edit installed managed
copies in `.agents/skills/` or `.claude/skills/`. Exclude a global repository
terminology rewrite, automatic wording lint, new per-tool adapters, release,
and installation/adoption work.

**Key examples:**

- Given an installed skill says “resolve context from the client project,”
  when it is revised, the agent is directed to this project's guidance and
  paths; it is not asked to identify another client repository.
- Given a runtime reference describes project-owned ADRs or slice budgets,
  when it is reviewed, its wording uses the executing project's perspective
  while retaining any necessary missing-context behavior.
- Given similar maintainer-facing wording appears without the exact phrase
  “client project,” the review corrects the misleading audience or location
  assumption as well.
- Given the updater distinguishes the installed project from the Open Dough
  source, the corrected instructions preserve both roles explicitly. Internal
  maintainer records can still refer to client projects.

**Evaluation:** Review the distributed runtime guidance for the perspective
problem and walk representative corrected uses under the existing `AGENTS.md`
behavior review and
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
The executing project is unambiguous, source/target distinctions remain correct,
and required behavior survives. Reuse the established cross-tool delivery
mechanism; no new discovery matrix is required for wording changes.

**Depends on:** No new product prerequisite. This is separate from Story 11's
planning authorization boundary and SEED-001's hook registration work.
**Completion:** Clarified ADR 0006 and the maintainer authoring guideline;
restored the historical ADR 0001 as a focused Proposed vocabulary draft. Reviewed
all 23 runtime Markdown files and corrected perspective in all ten skills and
affected references. Kept maintainer records and installed managed copies intact.

Manual behavior walkthroughs confirmed that a selected story uses this project's
plan destination and slice limits, ADR checking reads this project's catalog and
still stops on a real conflict, and the updater captures this project (or an
explicit target) separately from the fetched Open Dough release source. Runtime
examples and references retain required missing-context checks. This is a manual
content review, not a new native-host acceptance run; shared delivery mechanisms
are unchanged under ADR 0005.

Validation passed: skill frontmatter for all ten skills, relative file links in
all 23 runtime Markdown files, `git diff --check`, and the existing
`dough-update-guidance-payload.sh`, `story-payload-update.sh`, and
`execution-payload-update.sh` checks. The updater wording check accepts equivalent
payload phrasing. No slice plan, release, or installation/adoption was performed.

<a id="keep-slice-planning-bounded"></a>

### 11. Keep slice planning within the requested workflow

**Status:** Complete in source, 2026-09-10; implemented via
[Quick 035](../quick/035-bounded-slice-planning/PLAN.md). Not released. Native
acceptance excluded by scope.

**Goal:** A human or coordinating agent requesting a slice plan receives a
useful plan and concrete remaining concerns without unintended execution or a
planner-issued workflow decision.

**Scope:** Finish after writing and reporting the plan unless the triggering
human or parent-agent instruction explicitly also requests execution. Do not
treat readiness or concern evidence as authorization. Report remaining
slice-specific concerns or a limited no-concerns finding without prescribing
the next workflow. Correct obvious construction defects; preserve decomposition,
proof ownership, and sizing. Exclude mandatory refinement, coordinator tooling,
budget redesign, refinement's own assessment redesign, cross-tool acceptance,
release, installation, and hand-edits of installed managed copies.

**Completion:** Updated `src/skills/dough-slice-planning/` so planning-only and
parent-delegated planning stop after the plan, explicit plan-and-execute may
continue without re-approval, and reports carry concern evidence instead of
`ready for direct execution` / `refinement recommended`. Local AGENTS.md
behavior walkthroughs are recorded in recognition; linked references needed no
edits.

<a id="extract-story-refinement"></a>

### 6. Extract story refinement and improve one real story

**Status:** Unplanned.
**Goal:** Refine an actual Open Dough story using reusable shared guidance.
**Scope:** Extract Donut's story-refinement practice and its needed guidance into
the source skills. Apply it to one selected story in its existing seed.
**Evaluation:** The story has a useful goal, small scope, and concrete examples
that the owner can review. Include the skill in the next useful release.
**Effort:** M, medium confidence; assumes the supplied practice is self-contained
with its directly referenced guidance.
**Depends on:** The source practice and Story 9's direct extraction workflow.

<a id="extract-story-decomposition"></a>

### 7. Extract story decomposition and simplify one real problem

**Status:** Unplanned.
**Goal:** Split one oversized Open Dough problem into useful, ordered stories.
**Scope:** Extract Donut's decomposition practice and its needed guidance, then
use it on one actual problem. Keep the smallest worthwhile outcomes in their
seed and queue the useful next story.
**Evaluation:** Each selected story delivers something the owner can judge and
has a rough effort estimate. Manual work is considered when choosing scope.
Include the skill in the next useful release.
**Effort:** M, medium confidence; assumes one bounded problem.
**Depends on:** The source practice and Story 9. Select when an actual problem
needs decomposition.

<a id="adopt-known-client-projects"></a>

### 8. Adopt shared guidance in one other client project

**Status:** Deferred until another named client wants the guidance.
**Goal:** That client uses a released shared practice on an existing task.
**Scope:** Choose one project and practice, install the release, retain required
local context, fix callers manually, and delete redundant borrowed guidance.
**Evaluation:** The installed practice helps complete the chosen task and the
owner can review the resulting project changes.
**Effort:** M, low confidence; the actual project determines the work.
**Depends on:** A named client, wanted practice, and available release.

<a id="extract-plan-execution-with-ci-monitor"></a>

### 5. Extract plan execution for one real task through CI

**Status:** Complete.
**Goal:** Finish the self-installation drift prevention plan using shared
execution guidance and obtain actionable evidence from Open Dough's real CI.
**Scope:** Make `src/skills/` the explicit source for client-payload edits, add a
deterministic self-installation baseline check, and gate release finalization on
that check. Execute with one CI observer and repair a delivered legacy CI defect.
Manual post-release self-update/commit and the separate historical regression
fixture remain maintainer-owned follow-ups.

## Ordering

Story 9 is complete. Story 5 is complete. Story 12 is complete in source.
Story 11 retains its separate outcome and
backlog position relative to the other existing items. Story 14 is done. Story
15 is selected after its SEED-010 Story 7 prerequisite. Story 6 remains the next
extraction reuse opportunity after higher-priority queued work. Story 7 surfaces
for a real oversized problem; Story 8 surfaces for its named client/task needs.

## Delivered capabilities

<a id="extract-directly-with-guidelines"></a>

### 9. Extract a project skill directly into unreleased source

**Status:** Complete.
**Goal and scope:** One extraction request yields a reviewable shared skill under
`src/skills/` with concise recognition; generalization and review stay manual.
Publication, client delivery, and particular Donut extractions remain separate.

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

**Status:** Complete.
**Goal and scope:** Generalize one practice while retaining its useful behavior.

<a id="reconcile-guidance-on-install"></a>

### 4. Complete one authorized ADR-guidance replacement in Codex

**Status:** Complete.
**Goal and scope:** Replace a borrowed practice while retaining required client project context.

<a id="maintain-skills-without-discovery-rechecks"></a>

### 10. Maintain skills with a minimal shared guideline

**Status:** Complete.
**Goal and scope:** Add or edit skills with a short shared guideline and manual
behavior review; keep surrounding process small.
