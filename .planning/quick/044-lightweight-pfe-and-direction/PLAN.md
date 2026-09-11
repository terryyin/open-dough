# Guide a simple implementation with PFE and optional architectural direction

## Source, scope, and authority

Source: [SEED-004 Story 18](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#guide-implementation-from-generic-to-specific).
Status: executing; Slices 1–2 done, Slices 3–6 planned.

Execution identity:

- Originating checkout: `/Users/terryyin/git/open-dough` on `main`.
- Execution checkout: `/private/tmp/open-dough-044.y5Xpot` on
  `codex/044-lightweight-pfe-direction`.
- Integration target: `main`.

CI observer: repository `terryyin/open-dough`, branch
`codex/044-lightweight-pfe-direction`, workflow selector `ci.yml`, workflow name
`CI`, coordinator `root`, Codex cell `23`, session `12095`, directory
`/tmp/dough-ci-501/watch-uHB7eu`, PID `90841`; status watching.

Deliver only the refined three-change package: clear simple-rule guidance, a
small PFE skill, and optional architectural direction connected to planning,
execution, and ordinary closure. Story 19's broader review work is excluded.
This plan is warranted because a new skill and several workflow boundaries need
separate proof; this is not a single local wording edit. Planning and conditional
plan refinement are authorized, not execution, commits, pushes, or publication.
The story stays first in Backlog list; Taken stays unchanged until execution.

No architecture-review programme, mandatory per-story document, history/tracking
registry, confidence scoring, monitoring, subagent requirement, partial closure,
early termination, general permission redesign, or future extension points.
No product implementation, released installation update, or hand-edited managed
copies. Source review does not establish native acceptance or release readiness.

## Decisions for this implementation

- Author shared behavior under `src/skills/`. Use `dough-pfe` for the small new
  skill and a focused `references/architectural-thinking.md` in
  `dough-slice-planning`. Existing callers link to these sources, not duplicate
  their procedures. Recognition remains maintainer-only.
- PFE owns finding and assessing solutions. Architectural thinking owns topic
  direction and planner judgment. Execution owns trigger/stop/resume; story
  wrap-up owns normal retirement. Do not change retrospective methodology.
- Use the executing project's existing North Star location. If none exists and
  a consequential statement is warranted, the planner may choose one shared
  `NORTH-STAR.md` under its established planning root and state that location in
  the plan. Do not create it for an ordinary plan, require a new configuration
  setting, or hard-code Open Dough's `.planning/` into runtime guidance. Topics
  are short headings/paragraphs; plans refer to them without a reference registry.
- Resolve revision through coordinator/planner judgment and existing handoffs.
  No new approval gate: the planner considers consequences and can revise
  direction; human-owned domain/ADR decisions retain their existing authority.
  The executing role cannot silently revise direction to justify its own work.
- Align only concrete contradictions that would block the story's examples.
  Existing broad human-stop wording must distinguish unresolved consequential
  choices from understood plan-authorized work. In post-change refactoring,
  recognize specifically planned domain-coherent work without broadly authorizing
  unrelated cross-subsystem cleanup. Leave other gates and reviews intact.
- New source files remain Proposed guidance until reviewed promotion. Do not
  change installer declarations merely to finish this source story. Before any
  release, promotion must include the PFE skill and new reference with their
  callers as one complete dependency set; no broken installed links are allowed.

Internal constraints: [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
for durable decision authority; [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for sufficient simplicity/domain meaning; [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
for complete released payloads and standalone use;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for evidence;
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for one reader-facing source. These are maintainer planning context, not runtime
links to insert into the published skills. Keep cache/token rationale internal.

## Proof and execution context

The external boundary for this source story is the action/report an executing
agent is instructed to produce. Apply AGENTS.md's representative behavior review
at each slice: invocation, required project context, and useful outcome. Walk the
named case against the complete linked instructions; record the result and
limitations in the affected recognition record or this active plan. These are
manual authoring walkthroughs, not native agent runs or proof of host behavior.
No new runner or automated prose assessor is needed.

Each slice owns its behavior and proof together. Run `git diff --check` and
check affected YAML frontmatter and relative runtime links after editing. Do
not require exact wording. Run existing `bash tests/story-payload-update.sh` and
`bash tests/execution-payload-update.sh` once after caller changes as applicable
regression checks; they do not prove the new behavior or install undeclared
files. No production-code tests are needed for the basket illustration.

Outstanding fresh-use acceptance on Codex, Cursor, and Claude Code is owned by
[SEED-010 Story 2](../../seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).
It must distinguish existing integration proof from these new behavior promises,
select representative cases by risk, and include complete promoted dependencies
before release. No native sessions or release work are authorized by this plan.

When execution is requested, follow dough-execute-plan for independent refactoring,
proof, delivery, and CI handling; resolve its actual host, hook, and push context
then. Preserve pre-existing work. No numeric slice target or hard limit is
supplied; no time guarantee or invented sizing policy applies.

## Ordered slices

### 1. Implement the understood rule without fixture restrictions
Type: Behavior
Status: done
Proof: Walk the basket-total case and its explicit-limit variant. The guidance
selects summing prices, accepts naturally handled baskets, retains a stated
maximum-item rule, and adds no future discount framework.

Delivered proof: the authoring walkthrough is recorded in
`src/skills/dough-story-refinement/RECOGNITION.md`; `git diff --check` and
`bash tests/story-payload-update.sh` passed. The independent refactor pass found
the change already clean, and `npm run format` passed after installing the
lockfile-defined worktree dependencies.

Behavior: Given narrow acceptance examples, when implementing the outcome, the
agent chooses a simple domain rule without inventing rejection conditions.
Replace the README/Notes/Relationship example in the shared planning reference;
clarify the existing implementation/decomposition instructions only where needed
so the same distinction reaches execution. Preserve real constraints and the
existing disputed-contract stop. A later example extends the rule rather than
adding another example-specific handler. Include no new process.
Safe stop: the clearer example and rule are useful independently of PFE.

### 2. Find and use a suitable existing solution
Type: Behavior
Status: done
Proof: Walk one basket-total lookup with an existing solution elsewhere in the
product; vary direct fit, modularization needed across a process boundary,
similar-looking code with different meaning, and unresolved domain meaning.
The result is a justified use/change choice or an evidenced developer question.

Delivered proof: `src/skills/dough-pfe/RECOGNITION.md` records all four
authoring-walkthrough variants. The Skill Creator validator, YAML/frontmatter
check, relative-link check, and whitespace checks passed. The independent
refactor pass found the small self-contained skill already clean, and
`npm run format` passed.

Behavior: Given a responsibility to implement, invoking dough-pfe finds suitable
existing product knowledge and a domain-correct way to use it, or makes the gap
clear. Write the small skill with explicit project context and broad search
reach. Preserve the original purpose when exposing a part through modularization.
Do not demand repeated searches after evidence is sufficient. Give no blanket
permission to override project decisions. Record concise authoring evidence.
Safe stop: PFE can be invoked directly; automatic caller integration follows.

### 3. Plan with existing solutions and only warranted direction
Type: Behavior
Status: planned
Proof: Walk planning with established structure/no new topic, then with a
consequential topic (existing or new). PFE informs the selected solution; the
plan refers to supported direction, and the ordinary case creates no North Star
file/report. Missing indispensable domain/ADR input stops only the affected path.

Behavior: Given an understood story, slice planning produces a sufficient plan
informed by PFE and relevant architecture, with optional short topic direction.
Add the focused reference and link it from planning (and plan refinement only
where the same decision is being reconsidered). Preserve same-agent planning
and planning-only authority. Let the planner judge affected stories before a
revision, without an automatic approval gate. Include necessary Structure
slices in current work without investing in hypothetical later stories.
Safe stop: planning and direct PFE are useful; no execution trigger is claimed yet.

### 4. Revisit the find-and-use decision only when evidence changes
Type: Behavior
Status: planned
Proof: Walk execution with a still-valid planned responsibility, an unforeseen
responsibility, and a candidate invalidated by new evidence. Only the latter
two trigger PFE; necessary current structural work enters the remaining plan,
and unresolved domain meaning reaches the developer.

Behavior: During execution, the agent carries forward valid findings and uses
PFE at the two agreed triggers, rather than automatically on each slice.
Connect the execution caller to the skill and pass relevant plan context through
existing delegation. Align any directly blocking stop/refactor wording for
specifically understood planned work, preserving unrelated cleanup boundaries.
Safe stop: execution can resolve discovered solution needs; North Star revision
handling is completed in the next slice, with existing human stops retained.

### 5. Resolve conflicting direction without closing the story
Type: Behavior
Status: planned
Proof: Walk an executor discovering evidence contrary to a recorded topic.
It stops the affected path and cites evidence. Coordinator/planner judgment
produces a selected direction and consistent remaining plan before resumption;
the active story, proof, backlog entry, and worktree remain intact. A conflict
with an Accepted ADR uses the project's human decision path.

Behavior: Given a needed direction revision, execution surfaces the conflict
instead of silently changing the North Star or continuing against it.
Connect the existing execution stop/handoff to coordinator application and
planner reconsideration. Do not require retrospective or wrap-up as a new
mandatory mid-story ceremony. Preserve independent progress where safe.
Safe stop: planning-to-execution direction has a complete correction path.

### 6. Retire direction that no longer serves remaining work
Type: Behavior
Status: planned
Proof: Walk ordinary story closure with a realized topic, a topic still needed
by another story, and indispensable architectural context needing a durable
home. Remove only disposable direction and affected references; preserve the
still-needed topic and resolve durable decision ownership before deleting it.

Behavior: At ordinary wrap-up, selected fulfilled or no-longer-needed direction
is retired while remaining work retains its necessary context.
Add the minimal closure hook and link to shared topic/lifecycle instructions.
No passive monitor, reference registry, partial wrap-up, broad review redesign,
or archive is introduced. Review the complete first-story journey and affected
payload regression checks; leave outstanding native proof with its named owner.
Safe stop: all three promised changes work without Story 19.

## Coverage and assessment

| Story promise | Owner |
| --- | --- |
| Simple rule, no fixture restrictions, real limits preserved | Slice 1 |
| Whole-product PFE, domain fit, necessary modularization, meaningful stop | Slice 2 |
| Upfront PFE, optional topics, planner judgment, same-agent planning | Slice 3 |
| Execution triggers, valid finding carry-forward, current structural work | Slice 4 |
| Direction alignment, stop/update/resume, open work preserved | Slice 5 |
| Ordinary retirement, shared-topic and durable-context preservation | Slice 6 |
| Reader perspective, no internal dependencies, no extra records | Every slice's authoring review |

Construction separated topic planning, mid-execution correction, and retirement
because they have different observable boundaries. Six Behavior slices remain;
there are no preparatory slices or test-only slices. Each has one proof loop
with variants of the same outcome. The cumulative design uses one PFE source
and one architectural-thinking source; it does not add separate procedures for
each example. No remaining slice-construction concern was identified in this
assessment. This is not execution authorization or native acceptance.

Execution uncertainties to resolve within the named owners: Slice 4 must verify
which existing authorization wording actually blocks the representative case;
Slice 6 must preserve any direction other work still needs without inventing
tracking infrastructure. Neither requires broadening into Story 19.
