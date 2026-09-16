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

<a id="guide-useful-manual-testing"></a>

### 20. Guide a useful manual and exploratory test session

**Status:** Refined; planned. [Slice plan](../quick/051-guide-manual-exploration/PLAN.md).

**Goal:** A developer requesting manual testing, or executing an authorized plan
that requires it, gets budgeted exploration from an external observer's
perspective and only actionable findings or material uncertainty.

**Scope:** Evolve `dough-manual-testing` into one concise, tool-independent skill
for externally observable behavior across web, CLI, API, desktop, or combined
flows. Run only on explicit request or an authorized plan requirement. Accept a
bounded feature, story set, recent deliveries, or change range. Recover promises,
examples, and constraints from current project records or Git history, including
deleted stories; account for later decisions rather than treating implementation
narration as the oracle. Surface unresolved expectations.

Before testing, identify coverage areas, journeys, and exploration questions;
allocate the available time proportionally to importance and risk, including
preparation and a reserve for surprises and confirmation. Establish breadth,
then investigate suspicious observations deeply enough to learn; consciously
adjust coverage when reallocating time. Reuse sufficient automated proof and
focus on missing procedural or judgment-based observations.

Use the project's available test/E2E environment. Choose the cheapest reliable
route to each starting state: existing setup facilities, whole or partial E2E
journeys, or a temporary preparation harness/test case. A temporary feature-file
scenario containing only necessary setup is explicitly allowed. Verify that the
resulting state and required application/session remain available for external
exploration; do not assume every runner permits takeover. Reuse compatible
prepared states, permit zero setup, preserve isolation and necessary cleanup,
and remove attempt-owned temporary artifacts. Missing suitable automation is a
possible improvement finding, not automatic authority for permanent test changes.
Leave project-specific customization and tool-operation recipes out of scope.

Report **Good.** when the agreed scope is completed without actionable findings.
Otherwise report only actionable discrepancies, worthwhile improvements, unresolved
expectations, and material coverage limitations, with just enough expected/actual
behavior and evidence to enable action. Filter speculation and incidental comments;
never imply blocked or materially incomplete coverage passed. Do not require a
success transcript, completion marker, or persistent UAT document. Testing permits
temporary preparation, not unrequested diagnosis, product repairs, permanent test
changes, or fix planning.

**Instruction constraint:** Replace existing prose rather than accumulating rules.
The current source is 397 whitespace-delimited words including frontmatter. Aim
for the same size or shorter, with no substantial net growth; justify any small
increase by necessary behavior. Count required linked instructions too. Keep the
skill self-contained unless a reference materially improves use, and follow
[AGENTS.md](../../AGENTS.md) and Accepted ADRs, especially 0002 and 0006.

**Key examples:**

- Given a request to test recent deliveries whose stories were deleted, recover
  their expectations and subsequent decisions from Git, then produce a bounded
  coverage/time plan before acting, including non-web surfaces when relevant.
- Given expensive setup already expressed in an E2E scenario, run a temporary
  setup-only scenario through existing infrastructure, confirm the application
  and prepared state are usable, explore from there, and clean up temporary work.
  If the runner tears down required state, choose another supported route or
  report the precise limitation rather than claiming takeover succeeded.
- Given several planned areas and one suspicious observation, establish breadth
  and allocate depth deliberately; reuse sufficient automated proof and compatible
  prepared states instead of repeating setup and deterministic checks.
- Given completed coverage with no actionable result, say **Good.**; given a
  discrepancy, uncertainty, or material gap, report only what supports action.
  An idea outside current promises is an improvement, not a failed acceptance.

**Evaluation:** Walk the guidance against the examples above, including a non-web
mission and unavailable prerequisites. Use it on one real Donut flow to observe
that temporary preparation leaves a usable starting state, bounded exploration
happens, and the final report is appropriately sparse. Keep project setup local;
record actual evidence separately from the sparse user-facing testing report.
Check final instruction weight and meaningful behavior, not exact prose matching.

**Depends on:** No product prerequisite. Existing Open Dough guidance and Donut's
local manual-testing/E2E facilities are reuse inputs. Real-flow proof requires an
available Donut test environment and observation capability; unavailable proof
remains pending rather than being replaced by a walkthrough.

**Deferred:** Project-specific customization, reusable runner/adaptor tooling,
permanent setup facilities, automatic repairs or test improvements, persistent
UAT tracking, stakeholder sign-off, release gates, cross-story verification-debt
audits, promotion, release, and installation/adoption.

<a id="proudly-found-elsewhere-design"></a>

### 19. Strengthen architectural review after using the lightweight guidance

**Status:** Decomposed; deferred and not refined.

**Goal:** A developer gets useful architectural corrections and maintained
direction from normal review after the initial PFE and North Star guidance has
been used, without accumulating duplicate review work or stale instructions.

**Scope candidate:** Carry the remaining broader architecture-review work here:
review PFE use, whole-product domain cohesion, and North Star alignment in
post-change refactoring and execution retrospective; propose evidence-backed
corrections or direction updates; refine lifecycle handling where actual use
shows the minimal flow insufficient. Consider broader refactoring-authorization
alignment only for a demonstrated obstacle. Basic planning, execution stops,
coordinator updates, and ordinary retirement are already delivered by the
lightweight guidance. Do not assume every candidate extension is worth
implementing.

**Evaluation:** From actual use of the lightweight guidance, identify a concrete
missed architectural issue or unnecessary process step; refine this story around
a review result or simplification the developer can evaluate. Existing review
that already supplies the outcome is evidence to drop that extension.
**Depends on:** Evidence from using the delivered lightweight guidance. Its
completed source contract and plan are recoverable at
`7f672bf:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
`7f672bf:.planning/quick/044-lightweight-pfe-and-direction/PLAN.md`.
**Safe stopping point:** Any selected review improvement delivers its own useful
correction or reduced burden; no further process rollout is required.
**Effort hypothesis:** Uncertain until a concrete review gap is observed; no
S/M/L estimate without repository definitions and a refined outcome.
**Deferred decisions:** Which remaining extensions are justified, their concrete
examples, and the final bounded delivery scope. Tracking machinery, mandatory
per-story documents, partial wrap-up, and early termination remain excluded.

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
guidance when describing Open Dough's consumers.

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
**Depends on:** The source practice. Author the shared skill under `src/skills/`
using [AGENTS.md](../../AGENTS.md). Select when an actual problem needs
decomposition.

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
Story 14 is done. Story 15 is selected. Shared small-work execution lives in
dough-execute-plan. Bug triage and backlog routing live in dough-bug-fixing
without duplicating that path. Story 6 remains a later extraction reuse opportunity
after higher-priority queued work.
Story 7 surfaces for a real oversized problem; Story 8 surfaces for its named
client/task needs.

## Delivered capabilities

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
