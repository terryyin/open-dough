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

The shared [project-findings maintenance contract](../../src/skills/dough-triage-project-findings/SKILL.md)
provides explicitly invoked local maintenance, repair observation, priority selection,
and commit/sync. The remaining stories compose or evaluate that capability.

The ordering and cuts below preserve the remaining evaluation and autonomous-feedback selections.
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
numeric estimates. Each story's preparation block records its own refinement,
selected approach, and assessment; the decomposition alone establishes none.

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

<a id="run-due-feedback-maintenance"></a>

### 9. Receive due feedback assessments without manual triggering

**Identity:** SEED-010#run-due-feedback-maintenance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/341-run-due-feedback-maintenance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e11ebc799bf4894a288c3a0a8baa748d383eb482bdc92476f8ac0490fffbde91","plan":"a4c62ef0f8bfe3a6fa0cbcb414d4ee4dc62381f425e5f6f284477d215599527d"}}
```

**Goal:** The maintainer receives each due feedback assessment, the result of
the existing combined project and shared feedback maintenance cycle, from
this machine's dashboard without remembering to start it, so collection,
reconciliation, and response-watch checks keep happening on time and only
the decisions that need a person reach one.

**Scope:** Give the dashboard a standing authorization for feedback
maintenance and let it start the cycle when the cycle is due.

- *Standing authorization.* The dashboard's system settings on this machine
  carry one feedback-maintenance setting: off by default, and when on, the
  host the session runs on with an optional model, from the hosts and models
  the launch dialog already offers. Only this setting lets the dashboard start
  a session no developer asked for. It is machine-local, like the project list
  and launch records, and is never written by a session.
- *Due condition.* The maintenance cycle records, in the near-term watch list
  on Open Dough's trunk, when its last review completed and when the next
  review is due, in a machine-readable block beside the list's existing review
  line. The cycle sets the due date from the existing seven-calendar-day watch
  policy, or sooner when a retained finding's review date falls earlier. The
  dashboard reads that block through its existing authenticated published read
  of Open Dough and treats the cycle as due once the local date reaches the
  recorded due date. An unreadable or absent block is not due; the read problem
  shows as published reads already do.
- *Automatic launch.* When the cycle is due, the authorization is on, no
  feedback-maintenance session is open on this machine, and no automatic launch
  has served that due date, the dashboard starts one unattached session in Open
  Dough's configured local folder on the authorized host, with the
  maintain-feedback-cycle invocation as its first input and the ordinary
  dashboard reporting context. The launch is a launch record like any other,
  labeled as feedback maintenance and recording the due date it serves: it is
  listed under Open Dough in Sessions, can be attached to, stopped, marked
  done, or deleted, and shares every launch gate and host boundary with
  developer-started sessions.
- *Result.* The cycle's own completion report is the assessment. A report with
  nothing requiring attention marks the session done quietly, and the advanced
  due date on trunk ends the due state. A report with an attention message, a
  prepared decision, an explicit coverage gap, or unfinished delivery, raises
  the existing unread-report notification once and keeps the session listed
  until the developer marks it done.
- *One automatic launch per due date.* A served due date is not launched
  again on this machine, whether the session is still open, ended quietly, or
  ended failed, stopped, uncertain, or without advancing the due date. In that
  last case the cycle is still due: the dashboard shows that beside Open
  Dough's Start session, and the developer starts the cycle by hand, marks the
  record done, or attaches to the session. The cycle's own rerun rule means
  such a manual rerun reuses accepted work and creates no duplicate findings,
  stories, or publications.
- *Unchanged workflow.* The maintenance cycle keeps its phases, inventory
  discovery, selection limit of two supported responses, delivery, and
  reporting. Triage selection and implementation authority stay as they are;
  Stories 10 and 11 address those later outcomes. The cycle's existing
  behavior when a project is inaccessible or a decision is needed is the
  Jidoka stop; this story only delivers it.

**Deferred promises:** No general scheduler, cron, or launch daemon; no
automatic launch of any other workflow or story; no automatic retry or
relaunch for a served due date; no cross-machine coordination (a second
machine running a production dashboard with the setting on could launch its
own cycle, and the cycle's idempotence bounds the harm); no per-project due
dates, since one cycle covers the maintained set; no launch while the
dashboard is not running, so a missed day launches when the dashboard next
observes the due date; and no paid native run in automated tests, so the
automatic launch and quiet completion are proved with the dashboard's fake
hosts, and one manual native run observes the real cycle. The host setting
follows the shared launch path for every registered host; this story verifies
it natively on Claude Code only. The evaluation of human effort, missed
assessments, false alerts, and operating cost against the manual workflow
accrues over the following weeks of use and is recorded in the watch list and
finding records, not delivered here.

**Key examples:**

1. The setting is on for Claude Code, the watch list on Open Dough's trunk
   records the next review due on 2026-10-28, the local date is 2026-10-29,
   and no feedback-maintenance session is open → the dashboard's next
   observation of Open Dough → one session starts in Open Dough's local folder
   with the maintain-feedback-cycle invocation and reporting context; the
   Sessions sidebar lists it under Open Dough as feedback maintenance; no
   notification is sent for the start.
2. That cycle completes, advances the watch list's due date to 2026-11-05 on
   trunk, and reports completed with no message → the dashboard receives the
   report → the session is marked done quietly, no notification is sent, and
   the next observation reads the new due date and is not due.
3. The cycle finds Terry Talks has no findings record and selects one shared
   response that needs the maintainer's decision, and reports completed with
   that message → the dashboard receives the report → one notification carries
   the message, the session stays listed until marked done, and no second
   session starts while it is open.
4. The dashboard restarts, or polls again, while the automatically started
   session is still open, or the setting is turned off meanwhile → the next
   observation → nothing new starts; the running session continues as the
   machine's session.
5. The automatically started session ends failed, is stopped, or ends without
   the due date advancing → the next observation → no second automatic launch
   for that due date; Open Dough's project row shows that feedback
   maintenance is due since 2026-10-28 and its automatic session did not
   complete; the developer's ordinary Start session with the invocation runs
   the cycle, which reuses accepted work and republishes nothing already
   accepted.
6. The setting is off, or on but the local date is before the recorded due
   date, or Open Dough's published read fails or its watch list has no due
   block → the observation → nothing starts, nothing is notified, and the
   read failure, when there is one, shows where published read failures
   already show.

**UI:** System settings gains a Feedback maintenance section beside OpenAI and
terminal theme: an on/off switch, the host, and the optional model, with a
line stating the recorded next due date and the last automatic launch's
outcome. Open Dough's project row, where Start session lives, states when
feedback maintenance is due and not served, or served by a session that did
not complete. Nothing is added to backlog cards.

**Architecture:** Model the automatic launch in the existing launch
vocabulary: an unattached launch whose requester is the machine's standing
authorization and which records the due date it serves, under the same host
boundary, launch gates, launch records, and completion reporting. The due date
is durable project state published on Open Dough's trunk and read like other
records; the authorization and launch records stay machine-local
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)).
The local server observing one published date selects no scheduler or daemon
and needs no ADR exception.

**Evaluation:** A due cycle starts on this machine without the maintainer and
yields the cycle's supported result, explicit uncertainty, or the decision it
needs. Repeated observations, restarts, partial failure, and manual reruns
create no duplicate sessions, findings, or dispositions. Inaccessible projects
remain explicit gaps in the cycle's report. Unchanged and quiet results raise
no notification. The later comparison of human effort, missed assessments,
false alerts, and operating cost with the manual workflow uses the watch
list's review dates and launch records.

**Value / learning:** Remove the initiation and handoff burden of the weekly
cycle while learning whether an unattended cycle gives reliable, useful
feedback and how often it needs the maintainer.

**Effort uncertainty:** Reading one published date and starting an unattached
launch without a developer request inside the dashboard's existing polling,
admission, and record discipline, and bounding spend to one launch per due
date; not a general scheduling platform.

**Prerequisites:** The combined maintenance cycle and its dashboard completion
reporting, both delivered; the production project list naming Open Dough with
a local folder; and the maintainer turning the setting on. Queue order does
not create a blocking dependency on Story 8.

**Safe stopping point:** Feedback assessments arrive on this machine within
the standing authorization while response selection, execution, and broader
rollout remain human-directed.

<a id="prioritize-responses-with-delegated-authority"></a>

### 10. Evaluate one real feedback cycle

**Identity:** SEED-010#prioritize-responses-with-delegated-authority
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The maintainer can decide whether the delivered feedback cycle makes
worthwhile product and process decisions at an acceptable cost, with useful
Jidoka-style human intervention, from one observed cycle in ordinary use.

**Selection:** On 2026-10-22, Terry narrowed this existing candidate to evaluating
one real cycle and selected it as the next queued story. Its identity stays
unchanged; broader autonomous correction remains Story 11's later candidate,
now queued behind the selected ODF-142 correction subject to reassessment.

**Scope:** Observe one authorized run of the existing
[combined feedback cycle](../../.agents/skills/maintain-feedback-cycle/SKILL.md),
from its actual project inputs through local and shared decisions, publication
and final reporting. Establish the selected run, project set, guidance revisions,
authority and evaluation questions before judging its result. Prefer the next
ordinary cycle; Story 9's first real automatic cycle can supply the same evidence
when available, without repeating maintenance solely for this evaluation.

- **Product and process value.** Check whether the cycle considers worthwhile
  project-owned product improvements as well as tooling and shared process
  responses. Trace selected and consequential declined or missed candidates to
  their evidence, importance, distinct frequency, product direction and existing
  work. The October 21 cycle needed a further human request before selecting
  Doughnut recall recovery and Pygardon stopped-refresh detection; use that as a
  question to test, not a requirement to generate more stories. Source-backed
  risks remain distinct from observed incidents. Preserve the existing selection
  limits and count justified no-change, defer and evidence requests as valid.
- **Previous responses.** Follow at least one relevant earlier response through
  adoption and available eligible use. Prefer the
  [ODF-139 successor's next observation](../../docs/maintainer/findings/ODF-139.md)
  when that opportunity occurs; a delivered project-product response is another
  useful candidate. Assess actual outcomes and counterevidence, not completion
  or silence alone. If no eligible exposure exists, record that limit and the
  next discriminating observation rather than manufacture a success or prolong
  this story indefinitely. This cycle does not implement its new selections.
- **Cost.** Record available agent usage, elapsed time, active human effort,
  repeated reading/review, correction and publication work across the cycle.
  Include this evaluation's own burden. Distinguish cached input, elapsed wait
  and active work; missing measurements remain unknown. Use the October 20–21
  manually initiated cycles as qualified context where comparable evidence
  exists, not as a matched control or a basis for invented savings.
- **Human intervention.** For actual requests, retries and corrective prompts,
  identify the decision, why a person was needed, whether existing authority
  already covered it, and whether it changed the outcome. Also inspect for
  consequential decisions that should have stopped but did not. Distinguish a
  necessary ownership or product choice from avoidable routine handoffs. A
  missing example remains unexercised; do not manufacture a conflict to fill it.
- **Coverage and delivery.** Retain each project's assessed, unavailable or
  unfinished status and the final publication/reporting evidence. In particular,
  resolve the disposition of the recurring Terry Talks and Lizard source gaps
  within existing authority, or leave the exact owner decision needed. Missing
  findings do not prove a healthy project or a passed watch. Repeated reports,
  aliases and rereviews do not become new findings or new backlog items.

**Evaluation:** Produce one evidence-linked retain, adjust, simplify or
inconclusive judgment about this cycle, explaining its useful decisions,
missed opportunities, quality consequences, observed cost and human burden.
Judge selections against the original evidence and product direction rather than
the cycle's own completion claims. Record a bounded next observation or proposed
correction only where the evidence supports it. Keep the assessment in the
maintained research report and link existing finding owners; use current cycle
records and Git history rather than a new permanent ledger. One cycle establishes
a bounded judgment, not sustained effectiveness or a general productivity rate.

**Value / learning:** Identify which part of the delivered loop is worth keeping
or simplifying before delegating a complete correction. Product quality and
changeability balance time, token and human-effort costs.

**Effort uncertainty:** Recovering attributable decisions and marginal costs
from one ordinary run; observation should stay proportionate to the decision.

**Prerequisites:** The delivered maintenance skills, current product direction,
the selected project's evidence and existing authority for the chosen cycle.
An explicitly initiated cycle is sufficient; automatic initiation and Story 9's
completion are not blocking dependencies. Narrowing and queueing this story does
not invoke maintenance or grant implementation, release or rollout authority.

**Safe stopping point:** One real cycle has a defensible judgment and any
unresolved exposure or owner decisions are explicit. No new ranking engine,
telemetry platform, standing decision authority or autonomous implementation is
part of this story. The existing phase owners retain maintenance and selection.

<a id="complete-delegated-feedback-correction"></a>

### 11. Complete a bounded feedback correction with Jidoka intervention

**Identity:** SEED-010#complete-delegated-feedback-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The maintainer can delegate one low-risk class of feedback correction
through implementation, validation, authorized delivery/adoption, and subsequent
assessment without manually connecting every skill or approving routine steps.

**Refinement reminder / selection (2026-10-22):** Terry queued this as a later
candidate after Story 10 and the ODF-142 correction. Reevaluate whether the story
is necessary during refinement, using Story 10's findings, current delivered
capabilities and any remaining manual burden. Queuing it is not a commitment to
build another automation layer. If existing workflows suffice or benefit does
not justify cost, recommend no implementation, deferral or a smaller response and
obtain the resulting backlog decision before execution. If it remains worthwhile,
identify one concrete correction and the bounded authority and evaluation needed.

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
the broadest candidate. Reassess necessity and narrow the correction class during refinement;
if it still spans independent outcomes, resplit instead of treating it as one plan.

**Prerequisites:** A selected correction, valid existing delivery capabilities,
and explicit authority for each consequential action. A manually selected
response can be used; autonomous triage is not a hard prerequisite.

**Safe stopping point:** One bounded autonomous correction works without generic
self-modification, automatic changes to goals/ADRs, or rollout to every project.


## Ordering and Scope Reduction

Keep Story 9 (automatic due maintenance) in progress and queue Story 10's
one-cycle evaluation next, followed by the
[ODF-142 correction](SEED-008-worktree-branch-trunk-sync.md#normalize-delivery-commit-identities)
and Story 11 as a later candidate requiring necessity reassessment at refinement.
Story numbers and recorded identities remain stable;
the product backlog is the authority for current queue order and membership.

The maintained research report retains the preparation,
[completion-tail](../../docs/maintainer/empirical-process-control-research.md#landing-history-follow-up)
and [later product-consequence](../../docs/maintainer/empirical-process-control-research.md#later-product-consequences-follow-up)
assessments, so cost reduction does not become the sole objective.
Later unattended initiation builds on the existing explicit workflows.
Manual mechanisms remain usable throughout; no story is blocked merely because
an earlier priority has not completed.

Story 11 is queued later for a complete autonomous correction loop, with its
necessity explicitly open for refinement. Use Story 10's evidence to decide
whether the trial is still worthwhile; its correction class and authority still
need explicit bounds. Evaluating the current cycle creates no commitment to
unrestricted self-improvement.

If scope shrinks, defer autonomous selection and correction first, then unattended
maintenance, then wider project participation. Preserve the selected local
triage workflow, meaningful response evaluation, and product-quality feedback.
Within observation work, select the
highest-value missing path first; broader coverage is not valuable by itself.

## Open Decisions

These are refinement inputs, not reasons to invent implementation or delay the
requested queue update:

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
- [Runbook automation follow-up](../../docs/maintainer/empirical-process-control-research.md#runbook-automation-follow-up)
  — recurring internal maintenance, priority corrections, and publication gaps;
  basis for the selected second and third stories.
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
  consumption and cross-project exchange. Story 4 retains its anchor and identity;
  the 19 October request selects and extends its next use.
