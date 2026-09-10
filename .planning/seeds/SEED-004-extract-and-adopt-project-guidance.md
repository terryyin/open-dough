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

**Status:** Refined; not execution-planned.

**Goal:** A human or coordinating agent requesting a slice plan receives a
useful plan and concrete remaining concerns without unintended execution or a
planner-issued workflow decision. This repairs an observed problem in an
existing SDLC skill while the broader skill set is being completed.

**Scope:** Make the slice-planning boundary explicit: finish after writing and
reporting the plan unless the triggering human or parent-agent instruction
explicitly also requests execution. Do not automatically invoke execution or
treat a readiness assessment as authorization. An explicit plan-and-execute
request permits the authorized execution handoff without another confirmation.

The planner still applies decomposition, proof-ownership, and sizing guidance,
fixes obvious defects while constructing the plan, and reports remaining
slice-specific concerns with their reasons. Replace the planner's directional
readiness verdict with that evidence, including a narrow statement when no
concerns were identified. The coordinator chooses the next action under the
human's instructions and project policy; refinement owns resolving concerns
when invoked. Align directly referenced guidance where needed so it does not
reinstate the planner's execution-readiness verdict or automatic handoff.

Exclude mandatory refinement after every plan, a new coordinator skill or
orchestration framework, changes to story scope or slice budgets, and a
redesign of the refinement skill's own assessment. Release, installation, and
client adoption remain separate work. This story's refinement does not
authorize editing the skills, generating an executable plan, or execution.

**Key examples:**

- Given a human asks only for a slice plan and the planner identifies no
  remaining concerns, when planning finishes, then it reports the plan and
  that limited finding and stops; it neither implements nor invokes execution.
- Given a parent agent delegates only slice planning as part of a larger
  implementation task, when the planner finishes, then it returns the plan
  and concerns to that parent; the parent's broader task is not an explicit
  execution request to the delegated planner.
- Given the triggering human or parent instruction explicitly asks to plan
  and execute, when the plan is written, then the authorized workflow can
  continue into execution without asking for the same authorization again,
  subject to applicable project gates and unresolved concerns.
- Given a slice has an obvious separable second outcome, when constructing
  the plan, then the planner corrects it rather than knowingly passing the
  defect to a later refinement step.
- Given a remaining integration assumption makes Slice 5's sizing uncertain,
  when reporting the plan, then the planner identifies Slice 5, the assumption,
  and its consequence; it does not prescribe refinement or certify execution
  readiness. The coordinator chooses refinement, evidence gathering, or other
  applicable next action.
- Given all slices appear cohesive and plausibly within the project target,
  when reporting, then the planner can say no refinement concerns were
  identified in its assessment; it does not claim no further refinement is
  required or use that finding as permission to execute.

**Evaluation:** Representative planning-only, parent-delegated, and explicitly
plan-and-execute uses preserve the authorization boundary. Reports retain
useful concern evidence without choosing the coordinator's next action.
Review the shared guidance against these examples under the repository's
skill-authoring behavior review; this is not a new per-tool delivery exercise.

**Effort:** S, medium confidence; a bounded guidance change, with directly
referenced wording checked for contradictory handoff instructions.

**Depends on:** No new product prerequisite. Follows the WIP cleanup in the
backlog as explicitly requested.

**Open decisions:** None currently blocking story understanding. Exact output
wording can be settled during implementation within these boundaries.

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
backlog position relative to the other existing items. Story 6 remains the next
extraction reuse opportunity. Story 7 surfaces for a real oversized problem; Story 8
surfaces for its named client/task needs.

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
