---
id: SEED-010
status: active
planted: 2026-09-09
planted_during: Execution retrospective extraction follow-up
trigger_when: Improve empirical process control in Open Dough and selected client projects
scope: large
---

# SEED-010: Improve products and processes through observed outcomes

## Goal

For developers using Open Dough and its maintainer, turn observed experience
into better product outcomes and a more effective development process. Connect
an observed need, an explicit improvement hypothesis, a bounded response, actual
use, and an evidence-based decision to retain, revise, or abandon that response.
Work in Open Dough and selected client projects, progressing toward an autonomous
feedback loop with Jidoka-style human intervention for consequential decisions.

## Why This Matters

Retrospectives, local findings, reconciliation, triage, and response watches
already exist. The maintainer still has to initiate and connect much of this
work. A changed instruction or completed story does not establish improvement;
missing review or lack of relevant use can look like absence of problems.

The [research report](../../docs/maintainer/empirical-process-control-research.md)
identifies three immediate learning needs: establish whether responses help,
observe work beyond successful plan execution, and evaluate quality and later
changeability alongside resource cost. Existing architecture and test reviews
are useful starting points, but their existence does not establish later benefit.

The product goal remains ADR 0002's ability to deliver the highest user value
first and change direction at low cost. Token consumption is a cost measure,
not the definition of improvement. Human effort, correctness, test confidence,
future maintenance, and the cost of the feedback mechanism matter too.

## Human-Owned Decisions

On 2026-10-19, Terry directed that the report's recommendations become prioritized
improvement stories, reusing existing candidates, and explicitly authorized
changing the product backlog's near-future direction to empirical process
control in Open Dough and its client projects. The longer-term outcome is an
autonomous feedback loop with Jidoka-style human intervention. This request
selects preparation and backlog changes for review; it does not start the stories
or grant a standing authority to act in other projects.

Later in the same discussion, Terry selected the recurring project-findings
workflow as the first queued story: provide a shared skill invoked only by an
explicit user request, distinguish project-owned improvements from shared
Open Dough responsibilities, select one to three supported local priorities,
and commit and synchronize the maintenance result with origin. The supplied
ad hoc prompt is historical input, not an instruction to run that workflow now.
Review its available sessions in Open Dough, Pygardon, and Doughnut before
shaping the story. This backlog change remains a draft for review.

Terry subsequently included ongoing cleanup of the project-owned findings:
merge redundant records of the same problem, compact recurrence, follow prior
fixes, remove findings after a sufficient period without recurrence, and
resurface a problem when a claimed fix fails. Keep this in the first story's
repeated explicit maintenance invocation. Observation must include relevant
use of the fix; elapsed time without that exposure is not evidence of success.

The ordering and cuts below incorporate that first-story selection.
They extend the initial retrospective-focused delivery scope. The following
initial delivery decisions remain context for the capabilities already present.

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
- Product review is on by default; process review runs only when the project
  sets `skipProcessRetrospective: false` or the request asks to include it.
  `--skip-process` skips process review and its recording; `--skip-product`
  skips product review and its backlog suggestions or changes. Both may be
  supplied together; neither skips code and design review.
- Product review may suggest or directly apply backlog changes: reprioritize,
  propose new stories, remove stories from the queue, or update canonical story
  details. Apply changes within the user's established authority and project
  workflow; distinguish applied changes from proposals and unresolved decisions.

## Original Alternatives and Decision

The following rationale describes the initial selection before logging shipped.
Broader acceptance obligations are tracked separately below.

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

## Current Alternatives and Scope

Continuing the copied project-triage prompt and manually invoked runbook preserves today's useful behavior,
but leaves initiation dependent on memory and does not resolve incomplete
observation or establish the effects of a response. That is the strongest smaller
alternative: reuse its existing operations and evidence. Repeated project-triage
sessions also show mistaken ownership, unnecessary stories, and extra prompts
to publish the result. A shared explicitly invoked skill should carry this
already-used workflow through a reliable, visible result; later stories assess
responses and exchange shared-guidance feedback.

Increasing retrospective frequency alone would collect more opinions without
necessarily improving comparison, exposure evidence, or follow-through. A broad
telemetry platform or self-modifying guidance system would commit to mechanisms
before their decisions and value are understood. Start with the selected local
findings-to-backlog workflow, then assess response outcomes, fill observed
coverage gaps, and automate demonstrated workflows under separate authority.

Each story must produce an evaluable outcome even if later stories are cancelled.
Observation and measurement belong inside the decision they enable; no dashboard,
common event store, token-accounting platform, or permanent transcript archive is
a prerequisite. Start from actual work, reuse available host evidence and current
skills, and measure additional collection/review burden when judging benefit.

Release independently useful guidance changes when their required behavior review
and affected native acceptance are satisfied. The pending lifecycle obligations
below remain pending; this decomposition does not waive or silently absorb them.
An observation story may conclude that existing behavior suffices, with supported
acceptance evidence and no new runtime mechanism.

For every improvement, distinguish observation, causal hypothesis, response,
release/adoption, relevant exposure, and outcome. Compare sufficiently similar
conditions and preserve uncertainty. Quality requirements and human-owned
objectives cannot be weakened to improve a cost metric. An automated action
must operate within the owning project's explicit authority and stop only the
affected path when a consequential decision remains unresolved.

Effort bands remain unassigned because this repository supplies no S/M/L
calibration. Each story records its main effort uncertainty without inventing
numeric estimates. These are unrefined stories with no selected execution
approach, not slice plans or readiness assessments.

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

The retrospective owns direction alignment across all three reviews, its
implementation/product review defaults, opt-in process review, and the two skip
options. Process recording respects `--skip-process` and does not run
independently of that selection. Skipped reviews do not block or suppress the
other focuses.

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

<a id="pending-lifecycle-validation-obligations"></a>

## Separately pending lifecycle validation obligations

These obligations remain pending under the recorded release exceptions. This
section preserves their scope without creating another selected story or
assigning backlog priority. A future human selection can establish an
appropriate acceptance story.

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
Assess applicable evidence from 0.3.11 and ordinary released use before fresh
runs. Missing proof remains pending. Release exceptions do not mark these
obligations passed.

<a id="observe-retrospective-response-effectiveness"></a>

### 4. Observe whether a retrospective response helped

**Identity:** SEED-010#observe-retrospective-response-effectiveness
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The developer and maintainer can decide whether to retain, revise,
abandon, or continue observing one recorded response using relevant later evidence.

**Scope:** Reuse the finding and watch workflow for one response. State the
hypothesized mechanism, expected useful effect, comparison, relevant exposure,
quality/cost guardrails, and later observation needed. Include successful use,
recurrence, no relevant exposure, and uncertainty. Distinguish operational
retirement from confidence in effectiveness. General log recategorization,
cleanup automation, and a new measurement service are outside this outcome.

**Evaluation:** The maintainer can explain a response decision from linked
observations and its introduced effort, including later corrections where
relevant. An unexercised response remains unproven. ODF-139 is a suggested first
case: verify its current evidence before selection; its recorded watch being due
does not establish success. Assess disposition of reported gaps independently
and do not equate that with detecting unreported gaps.

**Value / learning:** Test whether existing records can close one useful learning
loop before generalizing the machinery. This includes whether recording and
assessment earn their own cost.

**Effort uncertainty:** Availability and comparability of later evidence;
observation delay is distinct from implementation effort.

**Prerequisites:** An attributable response and relevant work or controlled
representative cases. Existing local records suffice; no sibling story is a
blocking prerequisite.

**Safe stopping point:** One justified response decision or an explicit
inconclusive result remains useful without automation or another project.

<a id="exchange-retrospective-findings-with-another-project"></a>

### 5. Exchange retrospective findings with another project

**Identity:** SEED-010#exchange-retrospective-findings-with-another-project
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer in one selected client project can connect a supplied
finding to an Open Dough response, the revision actually used, and a locally
assessable later outcome.

**Scope:** Reuse the existing multi-project runbook and any valid ordinary-use
evidence. Establish which part of this exchange already works before adding
behavior. Preserve source identities and uncertain cause matches, return a
traceable response, and keep the relevant observation under the originating
project's control. A response may be a justified no-change or request for
specific evidence, not necessarily a guidance edit.

**Evaluation:** One authorized exchange reaches a useful local response decision.
When a change is supplied, its release and actual adoption are distinguishable
from later effectiveness. Missing or private evidence remains unavailable;
similar symptoms are not merged as one cause. Repeated exchange does not create
a duplicate occurrence or response. Supplied evidence may prove existing
behavior sufficient; do not build another transport solely to finish this story.

**Value / learning:** Learn whether feedback crosses the project boundary with
enough context to improve an actual decision and return useful learning.

**Effort uncertainty:** Evidence provenance and the missing portion of the
existing exchange, rather than transport scale.

**Prerequisites:** One willing, explicitly selected project and a bounded
finding. Manual exchange is sufficient; no automated collector is required.

**Safe stopping point:** One complete, human-directed exchange is useful without
ongoing access, scheduled pickup, automatic remote writes, or universal telemetry.

<a id="learn-from-preparation-history"></a>

### 6. Learn directly from preparation history

**Identity:** SEED-010#learn-from-preparation-history
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can identify a useful process improvement from actual
problem framing, decomposition, refinement, or planning history, rather than
reconstructing those decisions only from the final execution plan.

**Scope:** Start with one representative preparation journey and the decisions
that mattered to its result. Preserve direct evidence, uncertainty known at the
time, and the distinction between an avoidable preparation problem and a sound
decision invalidated by later learning. A stopped or abandoned preparation attempt
is eligible evidence. Reuse the existing review and finding behavior; do not
require a full retrospective after every preparation step.

**Evaluation:** The developer receives a supported finding, useful practice, or
reasoned no-change conclusion attributable to preparation. A missing-history
case limits the conclusion; an intentionally omitted activity is not mistaken
for an unobserved one. Compare the value of the finding with the extra capture
and review effort.

**Value / learning:** Test whether direct preparation evidence changes a decision
that downstream inspection alone would miss or misattribute.

**Effort uncertainty:** Host access to the relevant conversation and the minimum
context needed for fair assessment.

**Prerequisites:** Authorized access to an actual preparation record. This can
be assessed using existing reviews; no story-level block is recorded.

**Safe stopping point:** One useful preparation review is available without
changing execution, completion, or cross-project collection.

<a id="learn-from-unreviewed-execution-paths"></a>

### 7. Learn from an execution or completion path that escapes review

**Identity:** SEED-010#learn-from-unreviewed-execution-paths
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can learn from one selected execution or completion path
that currently escapes review, without treating the absence of a retrospective
finding as success.

**Scope:** Extend the use of current process review beyond the automatic
successful-plan path. Select one consequential missing path first: for example,
an execution stopping before normal retrospective, a planless completion, or a
completion journey through wrap-up or landing. Observe that path's final
applicable outcome, including failures after an optional own-run review when
that is the selected gap. Reuse existing review flags and history where sufficient.
Distinguish no finding, no review, missing history, and no relevant exposure.
This story concerns the work record and supported learning; preparation's
internal decisions belong to Story 6.

**Evaluation:** The developer obtains a supported improvement decision or
reasoned no-change result for the selected path. Within that sample, a failed
or cancelled attempt cannot disappear from the assessed population, and a
review before final publication cannot claim to have observed the subsequent
result. Re-review does not double-count occurrences or resurrect completed work.
Other missing paths remain explicit later selection candidates; completing this
story does not establish full lifecycle coverage.

**Value / learning:** Reduce success-only selection and expose costs or defects
that occur at the boundaries of execution and closure.

**Effort uncertainty:** Recoverable history at early exits and the cost of
proportionate coverage; do not solve it by mandatory full reviews at every event.

**Prerequisites:** Selected actual histories and their final outcome when known.
Existing skills can supply them independently of Story 6 or an automated collector.

**Safe stopping point:** A truthful assessment of the selected path remains useful even
when other lifecycle phases and projects have no additional instrumentation.

<a id="evaluate-later-product-consequences"></a>

### 8. Evaluate an improvement against its later product consequences

**Identity:** SEED-010#evaluate-later-product-consequences
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer can judge a selected improvement by useful product behavior
and later changeability, including whether an apparent efficiency gain creates
unacceptable defects, test weakness, or maintenance effort.

**Scope:** Choose one evidenced quality or changeability claim and a relevant
later use or modification. Compare the intended benefit with actual acceptance,
correction work, human effort, and resource use available from the record.
Use architecture scenarios and test effectiveness as diagnostics where they
matter to that claim. Existing test-efficiency work may supply evidence; this
story does not duplicate its optimization or invent a complexity/functionality
ratio, global architecture score, or mandatory token counter.

**Evaluation:** The developer can retain, adapt, or reject the selected approach
using an independent outcome check and the relevant later consequence. A faster
or cheaper initial run with materially worse correctness or next-change cost
cannot be declared an improvement merely from its initial metric. Missing or
not-yet-observable consequences remain pending, not successful.

**Value / learning:** Establish a concrete way to include future product burden
in improvement decisions. Story 4 owns response-effectiveness closure, including
all quality and later-effect checks its own decision needs. This story addresses
a distinct product-quality/changeability claim or a further later-use assessment;
it is not deferred acceptance for Story 4.

**Effort uncertainty:** Obtaining a comparable later change and a useful
independent assessment of the specific quality claim.

**Prerequisites:** A selected improvement and a relevant product use/change.
Existing delivered work is sufficient; no sibling implementation must finish first.

**Safe stopping point:** One consequential product decision is supported without
a quality dashboard, general scoring system, or autonomous feedback workflow.

<a id="run-due-feedback-maintenance"></a>

### 9. Receive due feedback assessments without manual triggering

**Identity:** SEED-010#run-due-feedback-maintenance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The maintainer and developers in explicitly selected projects receive
a useful due feedback assessment without remembering to initiate and connect
collection, reconciliation, and response-watch checks themselves.

**Scope:** Automate the existing bounded maintenance workflow within a supplied
standing authorization. Collect the permitted evidence, reconcile without
duplicating identities, check response release/adoption and relevant exposure,
and surface the next supported decision. Evaluate delayed effects when due;
absence of relevant use remains unexercised. Reuse the manual workflow and its
records. Triage selection and implementation authority are not enlarged by a
trigger; Stories 10 and 11 address those later outcomes.

**Evaluation:** A selected due assessment runs and yields a supported result,
meaningful uncertainty, or a prepared request for the human decision that is
actually needed. Repeated triggers, partial failure, and resumption do not create
duplicate findings or dispositions. Inaccessible projects remain explicit gaps.
Unchanged or non-actionable states do not generate repeated interruptions.
Compare human effort, missed assessments, false alerts, and operating cost with
the existing manually initiated workflow.

**Value / learning:** Remove routine initiation and handoff burden while learning
whether unattended maintenance provides reliable, useful feedback.

**Effort uncertainty:** Reliable observation/triggering in the selected environment
and the evidence needed for safe resumption, not a general scheduling platform.

**Prerequisites:** Selected sources, an explicit operating authorization, and an
observable due condition. Existing runbook behavior can supply the workflow;
queue order does not create a blocking dependency on every earlier story.

**Safe stopping point:** Feedback assessments arrive within existing authority
while response selection, execution, and broader rollout remain human-directed.

<a id="prioritize-responses-with-delegated-authority"></a>

### 10. Prioritize feedback responses within delegated authority

**Identity:** SEED-010#prioritize-responses-with-delegated-authority
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A maintainer can delegate recurring triage and queue decisions within
an explicit policy, receiving prepared Jidoka decisions only when that policy
cannot resolve a consequential choice.

**Scope:** Start with one class of findings and a bounded maintenance cycle.
Use severity, distinct relevant occurrences, confidence, direction, existing
work, expected benefit, and introduced burden to select or decline a response.
Reuse canonical stories and existing triage/backlog operations. Count successful
no-change, defer, and evidence-request decisions as valid outcomes. This story
ends at a supported disposition or queued evaluable story; it does not execute it.

**Evaluation:** Routine cases get one consistent disposition without manual
skill-by-skill triggering. Existing queued or Taken responses are reused.
Consequential ambiguity that the policy cannot resolve, conflicting goals or
priorities, and choices outside authority produce a concise evidence-backed
human decision while independent work can continue. Other uncertainty can remain
explicit, be deferred, or lead to a bounded evidence request under the policy.
The loop cannot flood the backlog, silently cancel active work, or prefer finding
count over demonstrated benefit.

**Value / learning:** Remove manual response generation where delegation improves
the decision, while testing which tradeoffs still benefit from human judgment.

**Effort uncertainty:** Defining and validating one useful delegation envelope;
a universal numerical priority formula is not required.

**Prerequisites:** A human-supplied decision policy, bounded findings, and current
product direction. Manual intake can supply these; automatic collection is not
a hard prerequisite.

**Safe stopping point:** One delegated triage cycle is useful without autonomous
implementation, release, or client updates. Retain as a later candidate until
the evidence and authority for a trial are supplied.

<a id="complete-delegated-feedback-correction"></a>

### 11. Complete a bounded feedback correction with Jidoka intervention

**Identity:** SEED-010#complete-delegated-feedback-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The maintainer can delegate one low-risk class of feedback correction
through implementation, validation, authorized delivery/adoption, and subsequent
assessment without manually connecting every skill or approving routine steps.

**Scope:** Start with one selected correction, one project/release path, and a
human-supplied authority envelope with explicit outcome and quality constraints.
Reuse existing execution, delivery, release/update, and observation workflows.
Retain a way to withdraw the change within that authority. The system must not
weaken its own evaluator or assume that delivery proves benefit. A later result
can support retention, revision, withdrawal, or continued observation.

**Evaluation:** A routine case reaches an attributable later response assessment.
A case with conflicting intent, an Accepted ADR conflict, exceeded scope, or
unacceptable quality consequences stops the affected action with evidence,
options, and the exact human decision needed. Safe independent work continues.
Measure missed necessary stops, avoidable interruptions, total cost, and later
quality alongside completion. No granted authority means no autonomous action.

**Value / learning:** Demonstrate a complete autonomous correction loop with
selective, informed human intervention before widening its scope.

**Effort uncertainty:** Cross-boundary authority and evidence continuity make this
the broadest candidate. Narrow the correction class and refine it before queueing;
if it still spans independent outcomes, resplit instead of treating it as one plan.

**Prerequisites:** A selected correction, valid existing delivery capabilities,
and explicit authority for each consequential action. A manually selected
response can be used; autonomous triage is not a hard prerequisite.

**Safe stopping point:** One bounded autonomous correction works without generic
self-modification, automatic changes to goals/ADRs, or rollout to every project.

<a id="triage-project-owned-retrospective-findings"></a>

### 12. Turn project-owned retrospective findings into prioritized improvements

**Identity:** SEED-010#triage-project-owned-retrospective-findings
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer in the current project, including Open Dough itself, can
explicitly invoke one shared skill to turn existing retrospective findings into
a concise project-owned findings record and up to three justified leading
backlog stories. Repeated invocations follow prior fixes, retire supported
resolutions, and resurface recurrences, with each changed maintenance result
committed and synchronized to origin.
The developer no longer needs to paste the recurring prompt or separately ask
for routine publication of that result.

**Scope:** Continue the workflow demonstrated in the
[reviewed project sessions](../../docs/maintainer/empirical-process-control-research.md#project-findings-workflow-follow-up).
Start from `DearDough.md` and the project's existing retrospective findings
record. Resolve the target project, record location, backlog conventions, and
published guidance from the established project context. Do not infer the target
from a copied project name, require an Open Dough maintainer catalog, or replace
an existing local record merely to standardize its filename.

The shared skill runs only on explicit user invocation. Its ordinary invocation
covers this bounded maintenance and its commit/sync outcome; merely encountering
findings, finishing a retrospective, or starting a session does not trigger it.
It queues improvement work without implementing those improvements, changing
published skills, or running a multi-project collection cycle.

**Ownership and evidence:** Determine the failed responsibility and proposed
remedy from the observed mechanism, the published/installed revision involved,
project-owned code/configuration/rules, and any local adaptation. A problem
occurring in a project, mentioning CI, or being fixable by a local workaround
does not establish project ownership. Pygardon's CI implementation may need a
local repair to satisfy a sound shared contract; an incorrect platform
assumption in Open Dough's observer may instead need a shared correction.
Check both the finding and each selected story against that distinction.

Move supported local findings to the project record and remove their moved
content from `DearDough.md`, preserving identities, provenance, and occurrence
evidence. Separate local and shared facets when supported; retain the shared
facet and cross-reference it without counting the same execution twice. Leave
unresolved attribution explicit rather than forcing a binary choice. Correct a
previous misclassification in either direction. A consequential choice that
evidence cannot resolve calls for a focused human decision; independent supported
maintenance can continue.

**Compaction:** Merge redundant records only when evidence establishes the same
problem and responsibility; similar wording, symptoms, or remedies are not
enough. Preserve a canonical finding identity, former-code traceability, and
working story/evidence links. Group related but distinct problems without
merging their identities or asserting a common cause.

Compact repeated narrative into one current explanation and a recurrence
summary that retains distinct-execution counts, the relevant dates/revisions,
and concise evidence or recovery references. The same event copied into two
records counts once; separate occurrences remain separate evidence even when
their prose is combined. Preserve materially different conditions, severity,
uncertainty, counterevidence, and before/after-fix distinctions. Repeated use
should reduce redundant reading without erasing what supports the decision;
no permanent duplicate archive or arbitrary line-count target is required.

**Repair follow-up and retirement:** For a claimed fix, retain the problem and
response link, the revision actually adopted, what effect is expected, and a
proportionate observation criterion: a relevant period and opportunities for
the problem to recur. Reuse a suitable project criterion or establish a
reasoned one before judging the result; do not invent a universal number of
days or restart the window merely because the skill ran again. A later explicit
invocation checks the accumulated evidence and decides whether to keep watching,
retire the finding, or resurface the problem. This requires no background
monitor, scheduled invocation, or blocking wait within the skill.

Remove confirmed-resolved problems from the active project record using
applicable repair and outcome evidence. Also retire a watched finding when
the stated observation criterion is met with relevant use of the adopted fix
and no observed recurrence; qualify that as supported retirement, not proof
that the problem can never return. Keep only the concise decision and recovery
reference needed by project conventions or version history, rather than a
growing resolved section in the active findings file. A completed story,
elapsed time, absence of reports, or missing history alone is insufficient.
Unexercised, incomplete, or inconclusive observations remain concise and open.

When the same problem recurs during observation or after retirement, restore
its finding lineage and link the new occurrence to the earlier fix and
retirement decision. Reassess what that evidence invalidates without rewriting
the original observations or completion history. Distinguish actual recurrence
under the adopted fix from an old branch, an unapplied upstream fix, partial
repair, or a different problem with a similar symptom. Resurfacing restores
eligibility for prioritization; it does not automatically create a duplicate
story or make every recurrence the highest priority.

**Selection:** Weigh distinct relevant occurrences, impact, current relevance,
confidence, expected benefit, effort, and product direction. A severe one-off
can outrank frequent minor friction.

Select one to three supported project-owned improvements needing new backlog
work and add their stories first, in justified order, with reciprocal finding
links. Fewer, including zero, is valid when evidence does not justify more.
For a problem already covered by a queued or Taken story, report that existing
response and leave its membership and position unchanged, as Terry's supplied
workflow requests; do not count it as another new story. Preserve unrelated
queue order and Taken work. When completed work has a supported
recurrence or uncovered remainder, link that evidence and prior response in an
evaluable follow-up without rewriting the earlier completion as if it never
happened. Do not manufacture work to meet a quota.

**Delivery:** Each invoked maintenance run ends by committing its changed
findings and backlog records and synchronizing them with the project's intended
origin target through existing delivery procedures. Preserve concurrent changes
and unrelated work; an unchanged repeat needs no empty commit. Verify remote
acceptance and the intended checkout's state, and report any unfinished sync
or verification truthfully. Publishing metadata does not authorize repairing
unrelated CI failures, changing host resources, or implementing the queued
stories. Missing authority or an unresolved consequential conflict stops only
the affected action, with the decision needed and recoverable work identified.

**Evaluation:** In representative actual project contexts, the developer can
review the ownership reasons, retained and removed evidence, selected stories
and their positions, and confirmed origin result from one explicit invocation.
Use the historical reversals as counterexamples: unchanged shared CI-observer
code must not produce a falsely local repair story; a documented local adapter
failure must not be exported as a generic shared defect. An existing active
response is reused, and a demonstrated recurrence remains actionable. A repeat
run adds no duplicate evidence or story. Redundant records of one event merge
without inflating frequency, while a merely similar problem remains distinct.
A watched fix with sufficient relevant use and no recurrence leaves the active
record; the same elapsed period with no exposure does not. A later recurrence
restores the prior lineage and evidence, including after retirement. The
developer can explain each merge, retirement, and resurfacing from the compact
record and its recoverable sources. Compare classification corrections,
unnecessary stories, repeated investigation, human prompts, and total effort
with the copied-prompt workflow; unchanged or inconclusive outcomes can be valid.

**Value / learning:** Improve the workflow Terry already performs and test
whether responsibility-based triage gives better local decisions with less
manual coordination and whether evidence-preserving cleanup reduces repeated
reading without hiding failed fixes. This is useful independently of telemetry, scheduled
collection, or autonomous implementation.

**Relationship to existing candidates:** This story owns the minimum repair
follow-up needed to keep project findings concise and actionable across explicit
runs; it does not defer that requirement to Story 4. Reuse Story 4's evidence
discipline without treating non-recurrence as proof of causation or overall
benefit. Story 4 can evaluate broader response effectiveness, comparisons,
quality, cost, and delayed tradeoffs beyond this bounded retirement decision.
Story 5 owns a
shared-guidance response crossing project boundaries; this story owns the
current project's local improvement queue. Stories 9–11 may reuse operations
and learning, but scheduled or delegated use needs its own authority and cannot
silently bypass this skill's explicit-invocation boundary.

**Effort uncertainty:** Reliable mixed-ownership assessment, enough exposure
evidence for proportionate retirement, and fit with existing delivery behavior
across hosts. Keep one current-project maintenance journey across invocations;
do not turn it into a collector, classifier service, or generic scheduler.

**Prerequisites:** Current project evidence and its existing backlog/delivery
conventions. The first run needs no sibling story or new measurement platform.
Apply the shared behavior and affected native-acceptance boundaries above.

**Safe stopping point:** One supported local triage result is delivered and its
uncertainties and outstanding fix observations remain concise and recoverable,
even if every later automation story is deferred.

## Ordering and Scope Reduction

Queue the next seven outcomes in this order: Story 12 (explicit project-findings
triage), Story 4 (response effectiveness),
Story 6 (preparation evidence), Story 7 (unreviewed execution/completion paths),
Story 8 (later product consequences), Story 5 (client exchange), and Story 9
(automatic due maintenance). Story numbers and recorded identities remain stable;
the product backlog is the authority for current queue order and membership.

The first story continues the existing manual workflow at Terry's explicit
priority and addresses the ownership and publication mistakes observed in its
history, including ongoing cleanup and fix follow-up in subsequent invocations.
The next story evaluates broader response effectiveness and tradeoffs. The two
observation stories address direct evidence gaps without requiring a new
telemetry system. Product consequences prevent cost reduction from becoming the sole
objective. Client exchange then tests the response across the project boundary;
automating maintenance reduces initiation burden once the decisions are useful.
Manual mechanisms remain usable throughout; no story is blocked merely because
an earlier priority has not completed.

Stories 10 and 11 remain later candidates. They keep delegated response selection
and a complete autonomous correction loop visible without turning the current
queue into a commitment to every possible capability. Their first trial needs a
concrete delegated policy and bounded scope, not an assumption of unrestricted
self-improvement.

If scope shrinks, defer autonomous selection and correction first, then unattended
maintenance, then wider project participation. Preserve the selected local
triage workflow, meaningful response evaluation, and product-quality feedback.
Within observation work, select the
highest-value missing path first; broader coverage is not valuable by itself.
The currently Taken CI story keeps its existing claim and scope; changing direction
does not cancel it or requeue completed dashboard/readiness work.

## Open Decisions

These are refinement inputs, not reasons to invent implementation or delay the
requested queue update:

- Refine the shared skill's name and representative ownership/delivery cases.
  Include project-appropriate fix-observation and retirement examples without
  prescribing a universal time window. Explicit invocation, exact-duplicate
  compaction, repair follow-up, one-to-three supported priorities, and commit/sync are
  supplied requirements, not open permission questions for this decomposition.
- Select the first current response, comparable observations, worthwhile benefit,
  cost guardrails, and relevant later-exposure window. ODF-139 is a candidate,
  not a new resolution or an instruction to harvest another project's history.
- Select representative preparation/completion histories and one product-quality
  claim; preserve gaps when the necessary evidence is unavailable.
- Select the first client and permitted evidence for the exchange. Later automated
  operation needs explicit sources, actions, notification boundaries, and authority.
- For later autonomous candidates, establish the correction class, policy, quality
  evaluation, budget, and stop/reversal rules before execution.
- Establish S/M/L calibration only if effort bands are needed. No numeric or
  comparative band is asserted here.

The pending lifecycle/native acceptance obligations above remain separately
visible. Relevant proof may be reused or supplied by a selected story, but missing
proof is not marked complete by this decomposition.

## When to Surface

Use this seed when selecting work under the empirical-process-control direction.
Revisit the next priority when a response has relevant new evidence, a review gap
hides a consequential decision, or manual maintenance demonstrably delays learning.
Advance autonomous candidates when a bounded decision or correction can be
explicitly delegated and independently evaluated.

## Breadcrumbs

- [Empirical process control research](../../docs/maintainer/empirical-process-control-research.md)
  — 17 October 2026 evidence snapshot and recommended learning sequence.
- [Project-findings workflow follow-up](../../docs/maintainer/empirical-process-control-research.md#project-findings-workflow-follow-up)
  — 19 October review of the existing client sessions and ownership corrections;
  basis for the explicitly selected first story.
- [Current product backlog](../PRODUCT-BACKLOG.md) — 19 October direction change
  and selected ordering authorized by Terry; existing Taken work preserved.
- [Retrospective finding maintenance](../../docs/maintainer/retrospective-findings-runbook.md)
  and [response watch list](../../docs/maintainer/near-term-watch-list.md) — existing
  workflow and candidate effectiveness evidence.
- [Test optimization](../../src/skills/dough-test-optimization/SKILL.md) — existing
  comparable-baseline, hypothesize, measure, retain-or-undo protocol to reuse.
- [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  — value, changeability, empiricism, and proportionate guidance burden.
- [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), and
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  — release identity, native proof/retention, and runtime audience boundaries.
- Original 9 September decomposition selected local recording before manual
  consumption and cross-project exchange. Existing Stories 4 and 5 retain their
  anchors and identity; the 19 October request selects and extends their next use.
