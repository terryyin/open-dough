---
id: SEED-010
status: active
planted: 2026-09-09
planted_during: Execution retrospective extraction follow-up
trigger_when: Resolve remaining released lifecycle acceptance
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

The released retrospective reviews implementation, product, and process, and
records supported process findings in `DearDough.md`. The remaining work is to
establish missing acceptance evidence for released behavior; it does not require
rebuilding the retrospective.

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

## Original Alternatives and Decision

The following rationale describes the initial selection before logging shipped.
Story 2 retains the original released-local-use outcome. Broader acceptance
obligations are tracked separately below.

Deferring preserved the then chat-only process but postpones learning before
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
larger release. Story 2 owns useful local adoption of released logging; broader
acceptance obligations are tracked separately below. Keep required quality and
release checks, but choose the smallest representative proof that resolves the
actual risks. Existing release exceptions remain recorded in `CHANGELOG.md`.

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
or an Open Dough process message. Process learning belongs in `DearDough.md`
through the released recording behavior. One observation can support both product
and process learning, but each conclusion must explain its relevance to that
destination.

Story 6 owns direction alignment across all three reviews, default-on review
selection, and the two skip options. Story 1's
writing must respect `--skip-process`; recording must not run independently of
that selection. Skipped reviews do not block or suppress the other focuses.

`DearDough.md` is the agreed filename; the released retrospective defines its
location and recording format. There is one canonical log per project, not a
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

<a id="continue-plan-execution-into-retrospective"></a>

### 6. Continue completed plan execution into its retrospective

**Status:** Refined on 2026-09-14; selected for backlog. Planning and execution
are not authorized by this refinement.

**Goal:** A developer completing planned execution receives the existing
execution retrospective in the same continuation, without another prompt to
start it. Retained execution context identifies what to review and reduces
avoidable recovery. This advances the backlog's coherent story lifecycle;
it does not promise fewer defects or a cheaper retrospective.

**Why needed / why now:** The current execution skill explicitly stops before
retrospective entry even though it retains the completed plan and evidence.
The retrospective already accepts the current execution conversation, so this
is a missing transition between existing capabilities. The selected near-future
direction makes that transition timely; no measured prompt cost, missed-review
rate, or deadline establishes greater urgency. The strongest smaller alternative
is to retain manual invocation with a useful completion summary. That remains
adequate when the developer wants to choose review timing, but does not deliver
the selected uninterrupted transition. Automatic review can cost substantially
more than the saved prompt; preserve existing review preferences and explicit
instructions to stop after execution instead of adding mandatory review work.

**Scope — required behavior:**

- After all planned slices satisfy existing proof and delivery obligations and
  required CI-observer shutdown succeeds, invoke the existing retrospective for
  that execution without another confirmation. A plan marked done alone is
  insufficient. Handle delivered CI failures under the existing execution rules
  before taking this transition. Pending CI remains explicitly unobserved;
  waiting for green CI, deployment, or merge is not a new completion gate.
- Retain and supply the source story or bounded-correction contract, original
  plan and approved changes, attributable commits, decisions, proof, delivery
  state, CI limitations, and execution checkout/branch identity. Reuse available
  context and references; do not require a new handoff artifact or copy whole
  transcripts. Retrospective still validates attribution and fills real gaps.
- Continue in the established execution project and checkout, including an
  explicitly selected current-branch execution. A bounded correction needs its
  contract, not a fabricated feature-story seed. A quick attempt subsequently
  completed through an ordinary remaining-work plan retains both parts as one
  execution, following the retrospective's existing recovery contract.
- Preserve retrospective review selection, explicit review instructions, and
  project preferences. The existing review owns its permitted process-log writes
  and correction planning; this transition adds no authority to implement its
  findings or change the backlog. Explicit user instructions to omit or defer
  the retrospective take precedence over automatic continuation.
- Distinguish completed execution from retrospective completion or a review
  blocked on missing context. A retrospective stop must retain the completed
  execution and identify the missing input; do not rerun implementation or
  claim review completion. On recovery, use retained context to continue an
  unfinished review or recognize one already completed, rather than launching
  another merely because the plan is done. Ambiguous review state needs recovery,
  not a guessed completion or duplicate run.

**Rejection constraints:** Incomplete execution, failed required delivery or
observer shutdown, cancellation, and stops for human judgment do not trigger
automatic retrospective entry. These preserve the selected completed-execution
boundary and the execution skill's existing finish/stop contract. They do not
remove the retrospective's ability to review unfinished work when separately
requested. An unresolved review-selection preference follows the retrospective's
existing rules for continuing independently supported reviews.

**Deferred promises:** No automatic retrospective after a wholly planless quick
execution; no new skip flag or preference, review content, CI waiting or repair
policy, observer lifetime extension, scheduler, host hook, durable deduplication
registry, or cross-session automation. No automatic correction execution,
recursive review/correction loop, story wrap-up, backlog removal, merge, branch
cleanup, release, or managed-copy update. These exclusions bound delivery
commitments; they do not restrict separately authorized existing workflows.

**Key examples:**

1. A feature plan's slices are delivered and its observer closes with CI still
   pending → execution finishes → one retrospective begins in the execution
   checkout using that story, plan, attributable commits, and proof; pending CI
   is reported as unobserved, and the plan, branch, and Taken entry remain.
2. A bounded-correction plan completes on an explicitly selected current branch
   → the handoff occurs → review uses the correction contract and that checkout,
   without requesting a feature-story seed or creating a worktree.
3. The last slice is marked done but push fails, a delivered CI failure remains
   unresolved, or observer shutdown is unconfirmed → execution stops → no
   automatic review. The same applies to cancellation or a human-decision stop.
4. Successful planned execution has an explicit `--skip-product` instruction
   for its retrospective and the project preference skips process review → the
   retrospective performs implementation review under its existing rules,
   without process-log access or product suggestions. An explicit instruction
   to stop after execution instead prevents automatic entry entirely.
5. Execution completes but retained commit attribution is ambiguous → review
   names the missing evidence and stops the affected path → execution remains
   complete; no correction is implemented and no wrap-up begins. Resuming with
   sufficient evidence continues that review; a retained completed review is
   not automatically repeated.
6. A quick attempt becomes an ordinary remaining-work plan and finishes → one
   retrospective covers both attributable parts. A wholly planless quick
   completion retains its existing finish behavior.

**Evaluation:** Walk a representative completed planned execution through the
actual handoff into useful retrospective output, plus focused boundary examples
above. A completion message merely recommending a retrospective is insufficient.
Review the shared guidance under the repository's behavior-review rules; use
the smallest necessary evidence for changed behavior, without rebuilding the
separately pending lifecycle-validation campaign or treating one host's result
as certification of all hosts.

**Effort hypothesis:** Small, with moderate confidence. The receiving capability
and context already exist; the work should primarily clarify shared guidance.
The risk is contradictory finish, recovery, or review-authority instructions,
not a missing orchestration system. Reassess size if implementation appears to
require new runtime machinery rather than expanding this story to justify it.

**Dependencies / safe stopping point:** Existing execution completion and
retrospective contracts are sufficient; Story 2's released logging-use evidence
is not a prerequisite. The transition is useful independently while wrap-up
remains separately invoked. The broader Story Branch Mode ADR is still Proposed;
this story neither accepts it nor resolves its trunk-integration conflict.

**Evidence:**
[execution finish/stop](../../src/skills/dough-execute-plan/SKILL.md#finish-or-stop),
[review selection and recovery](../../src/skills/dough-execution-retrospective/SKILL.md),
and [backlog direction](../PRODUCT-BACKLOG.md#near-future-direction).

**Open decisions:** None identified as blocking this bounded refinement. The
small-effort estimate and the value of eliminating manual entry remain hypotheses
to assess in representative use, not established performance claims.

<a id="use-released-retrospective-log"></a>

### 2. Use released retrospective logging in Open Dough

**Status:** Selected for backlog; unrefined.

**For / why:** An Open Dough developer can revisit findings from real execution
after the conversation ends, and the maintainer can judge whether the released
logging is useful for recognizing recurrence and choosing a response.

**Current context:** Retrospective logging is released and Open Dough has real
findings in `DearDough.md`. Assess existing use before deciding what remains;
do not repeat adoption merely to create a new run.

**Scope:** Establish use of the released retrospective in Open Dough through its
ordinary update process, without manually synchronized managed copies. Review a
real execution, retain supported findings in `DearDough.md`, and let the
maintainer read them and decide on a response manually. Check enough attribution,
qualified reasoning, and occurrence handling to make that use trustworthy.
Recognize distinct recurrence without counting a rereview as a new occurrence.
Preserve project review preferences and existing log content. Do not force a
finding when the execution supplies none.

**Evaluation:** Existing evidence or a fresh representative use identifies the
installed release and real execution, shows useful findings in the local log,
and lets the maintainer explain what was learned and a possible response. If a
second real occurrence is unavailable, a bounded representative case can establish
counting behavior when clearly labelled. Report the limits of the evidence;
ordinary local use does not certify all lifecycle behavior on all tools.

**Value / learning:** Determine whether durable retrospective findings help the
maintainer notice repetition and choose useful action without excessive recording
or reconstruction effort. This story establishes usable feedback; Story 4 owns
whether a later response actually improved subsequent execution.

**Dependencies:** Released logging and its required reference are available.
Refinement will assess the remaining adoption and useful-use evidence, including
applicable proof reuse under ADR 0005. The broader obligations below are not the
completion criteria for this local-use outcome and remain explicitly pending.

**Safe stopping point:** Open Dough can use and read its own released log without
an internal consumer, remote exchange, or a broader validation campaign. No new
logging feature or guidance rewrite is required unless a concrete defect warrants
separately authorized correction.

**Boundaries:** Keep this story unrefined. It does not authorize execution,
release, a new validation framework, or certification of the whole lifecycle.

<a id="pending-lifecycle-validation-obligations"></a>

## Separately pending lifecycle validation obligations

These obligations accumulated under Story 2 but do not define its original
retrospective-use outcome. They remain pending under the recorded release
exceptions. This section preserves their scope without creating another selected
story or assigning backlog priority. A future human selection can establish an
appropriate acceptance story; this correction does not reinstate the cancelled
split or cancel any validation requirement.

- Retrospective findings remain useful and correctly attributed: local recording,
  recurrence without duplicate counting, qualified findings, project context,
  execution-release provenance, and preservation of adopted finding identities.
- Review selection and bounded logging behave as configured: independent process
  and product selection, preserved project preferences after update, bounded
  recording and replacement, and authorized product-to-backlog outcomes.
- Quick, planned, and oversized executions preserve attributable work and proof:
  entry authority, **Taken** handling, refactoring and delivery, remaining-work
  conversion, planless retrospective recovery, and ordinary planned recovery.
- Wrap-up closes supported execution contexts, handles absent retrospective
  advice, preserves active work and recoverability, and retires only disposable
  implementation direction.
- Planning and implementation guidance produces useful decisions: refinement and
  planning boundaries, cumulative design, whole-product correction and test
  review, simple domain rules, PFE reuse and changed assumptions, optional
  architectural thinking, and human resolution of conflicting direction.


Use representative native cases and justified reuse under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Separate shared
integration proof from skill behavior; one tool's success does not prove another's.
Assess applicable evidence from 0.3.11 and ordinary Story 2 use before fresh runs.
Missing proof remains pending. Release exceptions and local-use completion do
not mark these obligations passed. Historical references assigning broader
acceptance to Story 2 resolve to this section for the outstanding obligations.

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

**Future maintenance direction:** Extend the public `dough-maintain-findings`
skill only on explicit request to support recategorization and cleanup.
Distinguish a fix applied but pending observation for recurrence, a problem
confirmed gone from relevant evidence, and a finding eligible for removal from
the active log. Applying a fix alone does not establish disappearance. Define
evidence and retention rules when this work is selected; these operations remain
unqueued future scope.

**Evaluation:** A later comparable execution supports improvement, recurrence,
or an inconclusive result. An execution without the relevant conditions cannot
establish success. The maintainer can explain the next decision from linked
observations and retain a finding whose classification remains uncertain.

**Value / learning:** Close the learning loop and prevent ineffective guidance
or expensive feedback routines from persisting merely because they were adopted.

**Effort hypothesis:** Band pending project definitions. Evidence availability
is the main uncertainty; elapsed observation time is not implementation effort.

**Depends on:** Released retrospective logging and a recorded response with a
later relevant execution.
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

**Depends on:** Stable local findings and a willing second project.
Neither an internal consumer nor automated effectiveness tracking is required.

**Safe stopping point:** A single manual exchange delivers a useful response.
Projects retain control of their evidence; no ongoing access is implied.

## Ordering and Scope Reduction

Story 6 is the next queued work, followed by Story 2. Preserve unrelated backlog
order. Story numbers are stable identities, not priority ranks.

Keep Stories 4 and 5 as unqueued candidates. Prefer local effectiveness evidence
to expansion across projects. Drop cross-project exchange first, automated
consumption next if manual reading suffices, and automated effectiveness support
if manual observation suffices. Preserve local recording and public usability.
Bring Story 4 forward if a real response and comparable later execution provide
an immediate learning opportunity; do not wait for an internal skill solely for
workflow completeness.

These are outcome boundaries, not slices or an executable plan. Story 2 remains
unrefined. Detailed remaining case selection and effort assessment belong to
later refinement.

## Open Decisions

Story 6 preserves existing completion and review stop rules; no new mandatory
human decision between successful execution and retrospective entry was found.
Story 2 will assess
whether existing adoption and real-use evidence already meets its original
outcome. Broader validation has no newly assigned story or priority. No change
to the near-future direction is authorized.

## When to Surface

Story 6 is refined for a later authorized planning or execution selection before
Story 2's released logging use in Open Dough. Surface the separately pending validation obligations
when selecting acceptance work or assessing an affected release. Surface
effectiveness tracking when a response has a relevant follow-up execution;
surface cross-project exchange only when another project's finding offers
additional learning.

## Breadcrumbs

- Released skill source:
  [`dough-execution-retrospective`](../../src/skills/dough-execution-retrospective/SKILL.md)
- Internal maintainer follow-up of recorded findings:
  [`triage-retrospective-findings`](../../.agents/skills/triage-retrospective-findings/SKILL.md)
- User direction on 2026-09-09 initially captured one oversized story, then
  authorized this decomposition and selection of top-value backlog stories.
- Clarifications: `DearDough.md`; public local writing first; Open Dough as its
  own first consuming project; manual reading and improvement initially;
  internal consumption later; other projects later still; retain both special
  and general costs while learning; review the retrospective's own process.
