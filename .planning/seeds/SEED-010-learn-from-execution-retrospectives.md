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

**Status:** Selected for backlog; unrefined. The existing anchor is preserved.

**For / why:** A developer can revisit evidence-backed process observations and
recognize repetition after the execution conversation is gone.

**Scope:** Extend the public retrospective to produce its concise conversational
result and write the canonical local log. Define enough format and identity rules
to group an issue's distinct occurrences and count them. Include supported
process findings about execution and the retrospective itself, including useful
practices. Record both special costs and potentially general costs without
premature filtering. Preserve existing product-review and correction-planning
boundaries; process feedback does not become a product correction plan.

**Evaluation:** In Open Dough, review a real execution record and inspect the
resulting log. A developer can find the issue, decisive evidence, occurrence,
and any qualified causal or cost inference. A distinct execution repeating the
issue increases its occurrence count; reviewing the original again does not.
If no second real occurrence is available, use a bounded representative case
for the counting behavior and label it as such. A supported one-off cost is
retained, and unsupported generalization is not presented as fact. The review's
own observable waste can be recorded without launching another review.

**Value / learning:** Determine whether durable local observations make repetition
recognizable without turning recording into another source of avoidable work.
The smallest first use needs no internal consumer or cross-repository access.

**Effort hypothesis:** Band pending project S/M/L definitions. Main uncertainty
is reliable issue matching and economical evidence review, not file writing.

**Depends on:** No product prerequisite. Build on the Proposed retrospective.

**Safe stopping point:** Open Dough can manually read and act on a useful local
log even if all later stories are cancelled. Do not claim source completion
means public availability; Story 2 owns release acceptance. Existing evidence
and unrelated project content are preserved.

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

<a id="act-on-local-retrospective-mail"></a>

### 3. Help the maintainer act on DearDough.md findings

**Status:** Selected for backlog; unrefined.

**For / why:** The Open Dough maintainer can turn accumulated local observations
into an explicit, traceable decision without repeatedly reconstructing context.

**Scope:** Introduce an internal skill to consume Open Dough's own log, recognize
recurrence and uncertainty, discuss a useful response, and record the human's
disposition against the finding. Support action, request for evidence, deliberate
deferral, or a reasoned decision to retain current behavior. Do not assume every
cost is general or every finding deserves new guidance. Link resulting work to
the finding; do not autonomously implement or release guidance.

**Evaluation:** Given accumulated local observations, the maintainer can assess
why an issue deserves attention, accept or revise a proposed response, and later
recover that decision without rereading whole executions. One ambiguous
story-specific cost can remain unresolved without being lost or generalized.

**Value / learning:** Reduce repeated interpretation work and test whether
assisted consumption produces better decisions than reading the log manually.
Reconsider automation if manual consumption already suffices.

**Effort hypothesis:** Band pending project definitions. Uncertainty is the
amount of judgment assistance useful after representative manual consumption.

**Depends on:** Story 1's usable log. Story 2 is ordered earlier for public value,
not because a release technically enables internal reading.

**Safe stopping point:** Recorded decisions and linked follow-up work remain
useful with manual effectiveness checks. Findings are not deleted merely because
a response exists, and installed guidance remains governed by releases.

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
Story 3 is helpful but not required; manual response recording is sufficient.

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

**Status:** Refined on 2026-09-10; selected as the top-priority product backlog
story. Scope and authority decisions are settled.
**Plan:** [Quick 034](../quick/034-retrospective-product-learning/PLAN.md); all
slices planned, no implementation performed.

**Goal:** The developer or product owner of the executing project can use
what development revealed to decide what to build next and keep product direction,
priorities, and story details consistent with that learning.

**Scope:** Add product review to the retrospective alongside implementation
review (features, bugs, code, and design) and process review. Summarize
consequential learning, experience, ideas, and
inspirations from developing and executing the plan. Connect them to the current
established near-future direction, including evidence
that supports keeping the current course. Distinguish observed learning from
new hypotheses or inspirations that still need exploration.

Read the project's near-future direction for every enabled review. Inspect the
queue and other canonical stories only when relevant to the execution, a finding,
or a proposed change. Recommend or directly
apply justified priority changes, new story proposals, removal from the queue,
and changes to story details. Use the project's story and backlog workflows to
keep one canonical story definition and valid references. Explain each change
through its product value or learning opportunity; do not require every review
to produce a change. Preserve unrelated work and make applied changes, proposals,
and unresolved choices explicit. Do not propose or apply changes to near-future
direction; assess the work and priorities against its existing text.
A review authorized to maintain the backlog can apply compatible item changes
without inventing another approval gate. New product ideas do not authorize
implementation or silently rewrite the completed execution's original contract.

Treat near-future direction as a high-priority lens across all enabled reviews:

- Implementation review questions whether delivered features, bug fixes, code,
  and design advance the direction or represent justified exceptions. Correct
  defects within the original contract through existing correction planning;
  surface direction-driven scope changes for a human decision.
- Process review questions whether the way work was selected, planned, executed,
  and reviewed served the direction or caused avoidable digression. Explain
  supported corrective process recommendations without automatically editing
  guidance or adding them to an implementation correction plan. Include token
  efficiency as a process focus: concise instructions and context organized for
  easy consumption, with evidence of avoidable repetition or recovery effort.
  This includes the retrospective itself and does not require token metrics.
- Product review questions whether learned needs and proposed priorities advance
  the direction, and recommends or applies authorized product corrections.

Question apparent alignment as well as digression; do not merely assert that the
work fits. A justified urgent fix can take priority without changing direction.
Distinguish the original approved execution contract from today's direction:
a later change in direction does not retroactively make approved work a defect.
An unsupported deviation needs a corrective recommendation or authorized change,
not only a label. A needed decision outside existing authority remains explicit.
With product review skipped, implementation and enabled process review still
consider direction, but do not produce product backlog proposals or edits.

Make process and product review default-on. Support `--skip-process` and
`--skip-product` independently and together. Process recording, when available,
is included in the process skip. Product suggestions and backlog writes are
included in the product skip. Implementation review and its existing conditional
correction-planning behavior continue in all four combinations.

**Material exclusions:** No process-log format or writing, internal mailbox
consumer, cross-project collection, new retrospective workflow, automatic
implementation, or release/adoption work. Removing a story from the queue does
not delete its canonical definition or cancel active execution. A direction
proposal does not authorize the broad WIP cleanup performed under SEED-009.
No standalone product report or full-backlog audit is required. Proposing or
applying a near-future direction adjustment is entirely outside this story.

**Authority boundary:** Follow the executing project's established authority.
Preserve near-future direction exactly; no adjustment proposal belongs in this
retrospective. Existing
priority instructions also prevail. Within authorization to maintain the backlog,
compatible item maintenance may change order, queue membership, and canonical
story detail without another approval step. A new story needs a beneficiary and
evaluable outcome; an unresolved idea goes through decomposition before queueing.
A disputed goal or scope change remains a proposal for human discussion. Preserve
active-plan consistency through the project's workflow; do not silently rewrite
an executing or completed story's contract. This refinement authorizes none of
those retrospective backlog mutations itself.

**Agreed review behavior:**

- A bare retrospective invocation enables product analysis and concrete
  recommendations. Backlog writes require authority established in the session
  or project workflow; the skip flags select reviews and do not grant authority.
  When authority is absent, return a reviewable proposal without a mandatory
  approval ceremony.
- Resolve near-future direction for all enabled reviews. Inspect the queue and
  other stories only when the execution or its learning makes them relevant;
  avoid reconstructing the entire product history.
- If direction is absent, state that alignment cannot be assessed against an
  established direction; do not invent one. Continue supported review against
  the execution contract. If backlog or story conventions cannot be resolved,
  report the missing context and keep product conclusions provisional. Continue the enabled reviews
  whose context is available; do not invent a backlog or seed location.
- Complete all enabled review focuses even when implementation review creates or
  amends a correction plan. The existing stop-after-planning rule should prevent
  further planning refinement or execution, without suppressing product or
  process review. Likewise, the existing read-only rule needs a narrow allowance
  for authorized backlog and canonical-story maintenance.
- Product observations can come from the recovered story and execution result.
  Claims about developer experience or process need the actual conversation or
  transcript. Missing evidence means an explicit limitation, not confirmation
  that the current priorities are correct.

**Key examples:**

- Given execution reveals a simpler way to meet the user's need, product review
  explains that learning and proposes or applies a higher priority for the
  smaller outcome and removal or revision of the now-unnecessary queued story.
- Given development inspires an adjacent capability without validating demand,
  product review labels it as a hypothesis and proposes exploration or a new
  candidate story rather than presenting the idea as an established requirement.
- Given learning reveals digression from near-future direction, review proposes
  or applies an authorized correction to the work or priorities against that
  direction; it neither proposes a new direction nor edits the existing one.
- Given an ordinary retrospective invocation, all three focuses are considered.
  With either skip option only that focus is omitted; with both options only
  implementation review remains. `--skip-process` causes no `DearDough.md` write;
  `--skip-product` causes no product backlog suggestions or edits.
- Given sufficient evidence supports no product change, review states why the
  reviewed direction and relevant priorities remain appropriate, without claiming
  to validate uninspected queue items. Missing execution evidence limits the
  conclusions rather than prompting invented learning.
- Given only a retrospective request with no backlog-maintenance authority,
  when evidence suggests a priority change, return the exact affected story,
  proposed change, and rationale; leave the queue unchanged. With established
  maintenance authority, apply the compatible change and report it as applied.
- Given the backlog is missing or two seed locations remain ambiguous, when
  product review reaches a proposed story edit, identify the missing input and
  leave files unchanged; the independently supported implementation and process
  reviews still complete.
- Given implementation review needs a bounded correction plan and product review
  identifies a separate opportunity, when both are enabled, report both with
  their distinct destinations; creating the correction plan neither queues the
  opportunity automatically nor ends the other enabled reviews.
- Given an isolated urgent bug fix with no connection to other queued stories,
  assess its justification against direction in each enabled review and inspect
  its own contract and evidence; do not inspect the queue or unrelated stories.
- Given an implementation addition and an expensive review routine appear
  unrelated to direction, question both. Route a supported contract defect to
  correction planning and supported process waste to a process recommendation;
  ask for a scope decision if removing approved behavior would change the story.
  With `--skip-product`, these reviews still run without backlog suggestions.
- Representative execution candidate: [register CI observation host hooks](SEED-001-install-and-update-open-dough.md#register-ci-host-hooks-consistently)
  (SEED-001, Story 8; Quick 031) delivered install/update behavior in v0.3.4.
  Review whether reproducible setup advances usable lifecycle guidance, whether
  the execution process served that outcome, and whether supported learning
  warrants a product recommendation. Recover the plan and related commits before
  drawing conclusions; this is a candidate, not completed acceptance evidence.

**Evaluation:** Use one real execution and the executing project's current
backlog. The product owner can trace a consequential observation or inspiration
to a concrete backlog recommendation or authorized change, assess the rationale,
and distinguish evidence from hypotheses. Check valid story references and the
separation between product decisions, corrective planning, and process feedback.
Verify direction is considered in every enabled focus, including when product
review is skipped, and the isolated urgent-fix case avoids unrelated queue
investigation. Use representative cases for the four review-selection
combinations; no skipped focus performs its review or writes its destination. Conduct the normal skill
behavior review. At the human's direction on 2026-09-10, cross-tool verification
is skipped for this story: no per-host runs, coverage matrix, or evidence-reuse
audit is a completion requirement. Keep the focused local behavior review.
Story 2 retains release acceptance/adoption ownership.

**Accepted naming and representative candidate:**

- Use **implementation review**, **process review**, and **product review** as
  the three focus names. The first includes features, bugs, code, and design.
  The user accepted these names during refinement.
- The user accepted Quick 031's completed feature execution as the candidate.
  Its seed records release/adoption, and Git history contains feature commits
  for initial registration, settings merging, update registration, and repair.
  Confirm the recovered evidence supports a useful review during acceptance;
  do not require a backlog mutation or manufacture an insight. Use bounded cases
  for authority, missing context, direction alignment, and skip-option boundaries.

**Settled scope boundaries:**

- Identify new hypotheses and propose concrete exploration when beneficiary or
  outcome is unresolved; do not run full discovery or decomposition within the
  retrospective. Authorized maintenance of understood stories remains included.
- Keep near-future direction unchanged. Question alignment and digression of
  work against it; neither propose nor apply direction adjustments.
- Review process efficiency through evidence-backed observations and actionable
  recommendations. Exclude token instrumentation, automatic context
  reorganization, and guidance rewrites. DearDough.md writing remains Story 1.

The four selection results are already decided: ordinary invocation considers
all three focuses; `--skip-process` leaves implementation and product;
`--skip-product` leaves implementation and process; both leave implementation only.
No further decision on these defaults or on DearDough.md is needed for this story.

**Value / learning:** Test whether explicit product reflection changes or
confirms what is worth building next, beyond checking whether the plan was
implemented well. This is the user's highest priority and works before durable
process logging or internal mailbox consumption exists.

**Effort hypothesis:** Band pending project S/M/L definitions. Main uncertainty
is turning execution learning into appropriately bounded product decisions while
preserving project authority and keeping the retrospective economical.

**Depends on:** No new product prerequisite. Extend the existing retrospective
and use the executing project's backlog/story conventions. Process review can
remain conversational until Story 1 adds its durable destination.

**Safe stopping point:** A project can improve its product decisions from each
retrospective even if later process stories are cancelled. Existing code/design
and process review remain usable; unsupported ideas stay proposals and no
implementation follows automatically. Public release still needs its acceptance
and ordinary release workflow.

## Ordering and Scope Reduction

Place Story 6 first in the product backlog by explicit user direction. Keep
Stories 1, 2, and 3 selected and preserve the relative order of all existing
backlog entries, including the workflow-boundary fix. Story numbers are stable
references, not priority ranks. Within the process feedback work, local capture
gives the earliest value and learning; public
release/adoption advances reusable lifecycle coverage before adding maintainer
convenience. Internal consumption follows observations from manual use.

Keep Stories 4 and 5 as unqueued candidates. Prefer local effectiveness evidence
to expansion across projects. Drop cross-project exchange first, automated
consumption next if manual reading suffices, and automated effectiveness support
if manual observation suffices. Preserve local recording and public usability.
Bring Story 4 forward if a real response and comparable later execution provide
an immediate learning opportunity; do not wait for an internal skill solely for
workflow completeness.

These are outcome boundaries, not slices or an executable plan. Story 6 is
refined with accepted authority and direction-alignment scope; the other
selected stories still need refinement before slice planning. No estimate distribution
is claimed: repository S/M/L definitions were not found, so bands remain pending
rather than carrying forward the original oversized story's unsupported L label.

## Open Decisions

No unresolved product choice prevents the selected order. Project S/M/L effort
bands must be supplied before comparative estimates are assigned. Story 1
refinement must settle the canonical `DearDough.md` location, minimal format,
occurrence boundary, and conservative issue-matching rules. Later evidence will
inform filtering, response dispositions, retention, and cross-project identity;
these are not prerequisites for choosing the local process increment. Story 6
now records representative examples, accepted default authority, and direction
alignment across all three reviews. Its candidate execution still needs evidence
recovery during acceptance; that is not an unresolved product decision.

## When to Surface

Story 6 has an executable plan (Quick 034); execute when requested.
Refine Story 1 before adding process logging;
complete the applicable acceptance before promoting or releasing changes. Revisit internal
consumption after local manual use; surface effectiveness tracking after a
response has a relevant follow-up execution. Surface cross-project exchange only
when another project's finding offers additional learning.

## Breadcrumbs

- Proposed skill:
  [`dough-execution-retrospective`](../../src/skills/dough-execution-retrospective/SKILL.md)
- User direction on 2026-09-09 initially captured one oversized story, then
  authorized this decomposition and selection of top-value backlog stories.
- Clarifications: `DearDough.md`; public local writing first; Open Dough as its
  own first consuming project; manual reading and improvement initially;
  internal consumption later; other projects later still; retain both special
  and general costs while learning; review the retrospective's own process.
- User direction on 2026-09-10: add product review as a separate perspective
  for the executing project, make it the top backlog priority, and make process
  and product review default-on with `--skip-process` and `--skip-product`.
