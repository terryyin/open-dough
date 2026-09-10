---
id: SEED-010
status: active
planted: 2026-09-09
planted_during: Execution retrospective extraction follow-up
trigger_when: Before promoting execution retrospective guidance or after its first representative use
scope: large
---

# SEED-010: Learn across execution retrospectives

## Goal

For a developer using Open Dough and the Open Dough maintainer, learning from
execution should improve both the product being developed and the process used
to develop it. Product learning informs the executing project’s direction,
stories, and priorities; durable, countable process observations inform Open
Dough guidance and later reveal whether it helped. Start in Open Dough itself,
which is also a project using the public skills.

## Why This Matters

Repeated corrections, wasted work, and token-heavy activity can recur without
being recognized. Choices in requirements, decomposition, or planning can lead
to later rework; reviewing only the immediate result misses those connections.
The retrospective can itself spend excessive effort recovering, reviewing, and
explaining evidence. Its own behavior belongs within the feedback scope.

The current Proposed retrospective already reviews process from a real record,
including waste, rule-induced churn, disproved assumptions, and useful practices.
It does not explicitly assess token-heavy low-value work or qualify causal
reasoning, and normally leaves findings in the conversation without an artifact.
Extend that foundation; do not rebuild the retrospective as a separate workflow.

Product insights, experiences, ideas, and inspirations from development can also
be lost when a retrospective focuses only on implementation quality and process.
Those insights should inform what the project builds next and challenge backlog
assumptions against its established near-future direction.

## Human-Owned Decisions

- Beneficiaries are the developer and Open Dough maintainer. Open Dough itself
  is the first representative project; no other repository is needed initially.
- The first process increment preserves the existing retrospective and adds generation
  and writing of `DearDough.md`, with a defined format, one entry per issue,
  occurrence history, and straightforward recurrence counting.
- Consider wasted work, repeated correction, inefficient token use, and
  induction or deduction from observed events, such as a plan leading to rework.
  These are examples, not an exhaustive category list.
- Record both potentially general problems and one-time or story-specific costs.
  Their distinction is currently uncertain; observe before introducing filters.
- Include feedback on the retrospective itself. Useful practices may also be
  recorded when supported; the log is not restricted to failures.
- Initially within the process feedback loop, everything except generating and writing the log is manual.
  Asking Open Dough to read findings and improve guidance needs no internal
  skill in the first increment. An internal consumer is a later increment;
  interaction with other projects comes later still.
- The behavior is intended for the public release, not an Open Dough-only fork.
  This decomposition neither implements nor releases it.

- On 2026-09-10, the user added product review as the top-priority story. The
  retrospective has three focuses: code and design review leading to corrective
  planning when needed; process review recording experience for Open Dough;
  and product review informing the executing project's product backlog.
- Process and product review are on by default. `--skip-process` skips process
  review and its recording; `--skip-product` skips product review and its backlog
  suggestions or changes. Both may be supplied together; neither skips code and
  design review.
- Product review may suggest or directly apply backlog changes: reprioritize,
  propose new stories, remove stories from the queue, or update canonical story
  details. Apply changes within the user's established authority and project
  workflow; distinguish applied changes from proposals and unresolved decisions.

- Refinement on 2026-09-10: a retrospective invocation alone produces product
  recommendations; apply backlog edits when session or project authority already
  permits maintenance, without asking again. Skip options do not grant authority.
- The near-future direction is a high-priority consideration in all three
  enabled reviews, not only product review. Question alignment and digression,
  and route needed corrections through each review's existing authority and
  destination. This cross-review behavior is explicitly included in Story 6.
- Inspect the queue and other stories only when relevant to the execution or a
  supported finding. An isolated urgent bug fix need not trigger queue analysis.
- The remaining refinement assumptions are accepted, including completing all
  enabled reviews after correction planning and reconciling the read-only rule
  with authorized product edits. WIP cleanup is not the representative execution.

- The user accepted **implementation review** as the name for the first focus
  (features, bugs, code, and design), and Quick 031 as the representative candidate.
- Token efficiency is a focus of process review, not a blanket optimization rule
  or a numerical target for every activity. Consider concise skill instructions
  and context organized for easy consumption, including avoidable rereading,
  duplication, and reconstruction. Preserve the information needed for sound
  decisions; shorter text alone does not establish a better process.

- Final Story 6 refinement: the user accepted the bounded new-idea and
  process-efficiency recommendations. Near-future direction adjustment is
  entirely excluded: do not propose or apply a replacement or revision of it.
  Review alignment against the existing direction and correct the work or its
  proposed priorities within existing authority. Execution planning is authorized.

## Alternatives and Decision

Deferring preserves today's chat-only process but postpones learning before
retrospective promotion. Merely making the chat report shorter does not retain
occurrences or expose repetition. Manually copying selected findings into issues
is a useful consumption workflow, but relying on it for capture loses observations
and consistent occurrence history. A central collector adds cross-project scope
before local evidence establishes what is useful.

Select automatic local recording with manual reading and response. This is the
smallest change that preserves findings without depending on memory or repeated
copying. Learn first whether a human can recognize recurrence and choose a useful
response from the log. Introduce consumption assistance only after this works.

For product learning, the smaller alternative is a summary left in the
conversation. It preserves ideas briefly but leaves priorities and story details
stale. Connect consequential learning to concrete backlog suggestions or changes
in the same retrospective, without requiring process-mailbox machinery.

## Scope and Release Guideline

Keep every story narrowly focused on the smallest useful improvement to the
retrospective skill. The immediate goal is to make that improvement usable and
publish it in a release as soon as possible. During refinement, retain only the
behavior and proof necessary for that story's observable outcome; defer broader
capabilities, optional automation, and speculative generalization to later work.
Do not expand a story to complete the whole learning loop.

Release each independently useful improvement when its required review and
acceptance are satisfied. Do not wait for sibling stories merely to bundle a
larger release. Story 2's acceptance scope follows the improvement ready to ship;
product review and process logging need not be completed together. Keep required
quality and release checks, but choose the smallest representative proof that
resolves the actual risks.

For process review across this seed, examine the cost of consuming instructions
and context as well as producing output. Findings should explain how organization
or concision helps or hinders the work, using available evidence. This includes
the retrospective's own process. Do not add mandatory token accounting, context
infrastructure, or automatic guidance rewrites to demonstrate efficiency.

## Shared Boundaries

The three focuses have distinct destinations. Code and design findings retain
the existing correction-planning rules: amend an unfinished plan or produce a
follow-up plan for a completed execution when bounded unresolved corrections
warrant it. Product learning belongs in the executing project's direction,
backlog, and canonical stories; it is not automatically an implementation defect
or an Open Dough process message. Process learning belongs in `DearDough.md` once
Story 1 supplies recording. One observation can support both product and process
learning, but each conclusion must explain its relevance to that destination.

Story 6 owns direction alignment across all three reviews, default-on review
selection, and the two skip options. Story 1's
writing must respect `--skip-process`; recording must not run independently of
that selection. Skipped reviews do not block or suppress the other focuses.

`DearDough.md` is the agreed filename; its canonical location and exact format
belong to Story 1 refinement. There is one canonical log per project, not a
copy per conversation. Evidence should be linked, not copied wholesale.

Findings need a stable local identity and distinct occurrences. Reviewing the
same execution again must not inflate recurrence. Similar symptoms are not proof
of a shared cause; uncertain relationships remain explicit. Do not require a
cross-project naming system for local counting.

Record observations separately from inferences, with confidence, unknowns, and
counterevidence where consequential. A causal explanation can span relevant
lifecycle steps but must not manufacture missing events. Token counts are facts
only when available; otherwise cite observable repeated work and qualify the
cost inference. Neither brevity nor skipped necessary investigation proves
improvement. Do not force a finding when evidence supports none, or recursively
launch retrospectives to review the current retrospective.

Public guidance addresses the agent in the executing project under
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Open Dough maintenance remains internal. Guidance changes follow
[ADR 0003 — Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md);
a response never silently edits installed managed guidance. Behavior review and
native delivery evidence remain distinct under
[ADR 0005 — Cross-tool validation through native acceptance stories](../../docs/adrs/0005-cross-tool-validation-accepted.md).
No architectural exception or new ADR is proposed here.

## Stories

<a id="turn-retrospectives-into-learning-loop"></a>

### 1. Preserve recurring retrospective findings in DearDough.md

**Status:** Source complete on 2026-09-10.
**Plan:** [Quick 036](../quick/036-record-retrospective-process-findings/PLAN.md).

**Goal:** A developer can revisit supported process findings after a retrospective
conversation ends and recognize which issues occurred in distinct executions.
This adds durable feedback to the existing lifecycle guidance with minimal overhead.

**Scope:** Extend the existing retrospective to keep its concise response and
write process findings to one local `DearDough.md`. Process review already owns
observation quality, direction alignment, and token-efficiency considerations;
reuse those rules. Record useful practices, one-off costs, potentially general
costs, and supported observations about the retrospective itself. Use stable issue
and execution identities, preserve interpretable human content, and avoid
double-counting a rereview. Keep uncertain matches separate and refuse ambiguous
or unsuccessful writes without suppressing other reviews. Keep product learning
and implementation corrections in their existing destinations. Exclude
release/adoption, cross-tool testing and acceptance, consumers, remote exchange,
automatic guidance edits, token measurement, migration, pruning, locking
infrastructure, causal inference engines, automatic merging, and direction
changes; Story 2 retains release and adoption.

<a id="use-released-retrospective-log"></a>

### 2. Use released retrospective logging in Open Dough

**Status:** Selected for backlog; acceptance and adoption story, unrefined.

**For / why:** A developer receives usable logging through the ordinary public
Open Dough release, and the maintainer knows the same shared behavior can be
used in Codex, Cursor, and Claude Code.

**Scope:** Own outstanding native acceptance and release/adoption for the
retrospective improvement ready to ship from Story 1 or Story 6. Validate only
the affected behavior; include product-to-backlog outcomes and the four
review-selection combinations when Story 6 ships. Do not wait for both stories
to finish or bundle their release as a prerequisite. Cover local log creation, repeat-occurrence handling, qualified findings,
and project-context resolution. Review reusable integration evidence separately
from new behavior proof. Select representative native cases by unresolved risk;
do not multiply every case across all tools. Record evidence or justified reuse
for each affected requirement on each tool. Use the released skill in Open Dough
through its normal update process, with no manually synchronized managed copies.

Native logging acceptance also covers execution guidance-release provenance
(including unknown, unreleased, and modified states) and mixed local/internal
codes: preserve adopted identities and allocate new local codes without reading
the internal catalog. Earlier logging proof does not establish these behaviors.

Also own pending native acceptance for the lifecycle guidance:
refinement/planning distinctions and cumulative design, refactoring and human
plan-conflict handoffs, whole-product architecture correction planning, and
whole-suite test review. Assess these changed behavioral requirements on Codex,
Cursor, and Claude Code; select representative fresh cases for missing proof
and document any justified reuse. Shared integration evidence is separate;
source authoring walkthroughs do not satisfy native acceptance. Release and
adoption remain separately authorized work.

**Evaluation:** Native evidence identifies the candidate, tool, inputs, decisive
log result, and limitations. Required Codex, Cursor, and Claude Code proof is
passed or justifiably reused before release; missing proof stays pending. After
an authorized immutable release and normal adoption, a real Open Dough review
writes its own `DearDough.md` using the installed public guidance. A maintainer
can read that file directly and respond manually.

**Value / learning:** Establish that local success survives ordinary public
installation and fresh use, without depending on an internal maintainer workflow.

**Effort hypothesis:** Band pending project definitions. Uncertainty depends on
available reusable native proof and the ordinary release/adoption journey.

**Depends on:** The completed improvement being released from Story 1 or Story 6,
not both. Release version and authorization follow the existing
release workflow; this seed does not choose a version or authorize release.

**Safe stopping point:** Released local logging remains useful to any project;
Open Dough can consume its own log manually indefinitely. No registry, remote
access, or internal consumer is required.

<a id="observe-retrospective-response-effectiveness"></a>

### 4. Observe whether a retrospective response helped

**Status:** Candidate; not queued.

**For / why:** The developer and maintainer can decide whether to retain, revise,
or abandon a response using later execution evidence.

**Scope:** Associate a manually or internally recorded response with later
relevant observations. Distinguish an opportunity for recurrence from lack of
exposure. Use accumulated evidence to distinguish one-time, requirement-specific,
and general costs, without treating those classifications as certain or permanent.
Define when resolved-and-observed history is eligible for cleanup while retaining
traceability. Include whether retrospective recording itself earns its cost.

**Evaluation:** A later comparable execution supports improvement, recurrence,
or an inconclusive result. An execution without the relevant conditions cannot
establish success. The maintainer can explain the next decision from linked
observations and retain a finding whose classification remains uncertain.

**Value / learning:** Close the learning loop and prevent ineffective guidance
or expensive feedback routines from persisting merely because they were adopted.

**Effort hypothesis:** Band pending project definitions. Evidence availability
is the main uncertainty; elapsed observation time is not implementation effort.

**Depends on:** Story 1 and a recorded response with a later relevant execution.
Manual response recording is sufficient; internal naming is optional.

**Safe stopping point:** Local evidence supports a meaningful response decision
without any other project participating. Silence is not success; history is not
removed merely upon acknowledgment.

<a id="exchange-retrospective-findings-with-another-project"></a>

### 5. Exchange retrospective findings with another project

**Status:** Candidate; not queued.

**For / why:** Another project's developer can obtain an Open Dough response,
and the maintainer can recognize related findings across project boundaries.

**Scope:** Begin with one explicitly selected project and a human-directed
exchange. Preserve originating identities and local evidence while relating
similar findings and returning a response the developer can associate with
later observations. Keep sensitive evidence in its owning project and make
any disclosure or remote access explicit. Do not require a registry, scheduled
pickup, automatic remote writes, or universal telemetry for this increment.

**Evaluation:** One selected project supplies an intentionally bounded finding;
Open Dough relates it to local evidence without conflating uncertain causes and
returns a traceable response. The originating developer records that response.
Unavailable private evidence is a limitation, not a reason to copy transcripts
or infer facts. Later effectiveness remains observable locally.

**Value / learning:** Test whether cross-project recurrence changes a maintenance
decision before investing in broad discovery or transport automation.

**Effort hypothesis:** Band pending project definitions. Uncertainty concerns
identity relationships and a useful, explicitly authorized evidence exchange.

**Depends on:** Story 1's stable local findings and a willing second project.
Neither an internal consumer nor automated effectiveness tracking is required.

**Safe stopping point:** A single manual exchange delivers a useful response.
Projects retain control of their evidence; no ongoing access is implied.

<a id="turn-execution-learning-into-product-backlog-decisions"></a>

### 6. Turn execution learning into product backlog decisions

**Status:** Source complete 2026-09-10. Proposed skill in
`src/skills/dough-execution-retrospective/`; not released. Story 2 owns
release/adoption.
**Plan:** [Quick 034](../quick/034-retrospective-product-learning/PLAN.md);
all six slices done. Local behavior evidence is in that plan's `evidence/`
and the skill's `RECOGNITION.md`.

**Goal:** The developer or product owner of the executing project can use
what development revealed to decide what to build next and keep product direction,
priorities, and story details consistent with that learning.

**Scope:** Add product review to the retrospective alongside implementation
review and process review. Connect supported learning to the established
near-future direction. Recommend or apply authorized backlog maintenance;
do not implement findings or change direction. Process and product review are
default-on with independent `--skip-process` and `--skip-product`. Complete
all enabled reviews even after implementation correction planning.

**Material exclusions:** No process-log format or writing, internal mailbox
consumer, cross-project collection, new retrospective workflow, automatic
implementation, or release/adoption work. Removing a story from the queue does
not delete its canonical definition or cancel active execution. Proposing or
applying a near-future direction adjustment is entirely outside this story.
Cross-tool verification was skipped for this story at the human's direction.

## Ordering and Scope Reduction

Story 6 source work is complete. Keep Stories 1 and 2 selected and preserve
the relative order of remaining backlog entries, including the workflow-boundary
fix. Story numbers are stable
references, not priority ranks. Within the process feedback work, local capture
gives the earliest value and learning; public
release/adoption advances reusable lifecycle coverage before adding maintainer
convenience.

Keep Stories 4 and 5 as unqueued candidates. Prefer local effectiveness evidence
to expansion across projects. Drop cross-project exchange first, automated
consumption next if manual reading suffices, and automated effectiveness support
if manual observation suffices. Preserve local recording and public usability.
Bring Story 4 forward if a real response and comparable later execution provide
an immediate learning opportunity; do not wait for an internal skill solely for
workflow completeness.

These are outcome boundaries, not slices or an executable plan. Stories 1
and 6 are source complete; Story 2 remains unrefined. No estimate distribution
is claimed: repository S/M/L definitions were not found, so bands remain pending
rather than carrying forward the original oversized story's unsupported L label.

## Open Decisions

No unresolved product choice prevents the selected order. Project S/M/L effort
bands must be supplied before comparative estimates are assigned. Story 1
now defines the local Markdown location, minimal format, occurrence identity,
and conservative matching in its refined section. Later evidence will
inform filtering, response dispositions, retention, and cross-project exchange;
these are not prerequisites for choosing the local process increment. Story 6
source work is complete; release/adoption remains Story 2.

## When to Surface

Story 6 source work is complete (Quick 034); Story 2 owns release/adoption.
Story 1 has Quick 036 for process logging. Complete the applicable Story 2
acceptance before promoting or releasing public retrospective changes. Revisit
internal consumption after local manual use; surface effectiveness tracking
after a response has a relevant follow-up execution. Surface cross-project
exchange only when another project's finding offers additional learning.

## Breadcrumbs

- Proposed skill:
  [`dough-execution-retrospective`](../../src/skills/dough-execution-retrospective/SKILL.md)
- Internal maintainer follow-up of recorded findings:
  [`triage-retrospective-findings`](../../.agents/skills/triage-retrospective-findings/SKILL.md)
- User direction on 2026-09-09 initially captured one oversized story, then
  authorized this decomposition and selection of top-value backlog stories.
- Clarifications: `DearDough.md`; public local writing first; Open Dough as its
  own first consuming project; manual reading and improvement initially;
  internal consumption later; other projects later still; retain both special
  and general costs while learning; review the retrospective's own process.
- User direction on 2026-09-10: add product review as a separate perspective
  for the executing project, make it the top backlog priority, and make process
  and product review default-on with `--skip-process` and `--skip-product`.
