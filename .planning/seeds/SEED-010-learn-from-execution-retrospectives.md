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
shaping the story. That research and first-story draft were subsequently landed
at Terry's request before continuing this preparation.

Terry subsequently included ongoing cleanup of the project-owned findings:
merge redundant records of the same problem, compact recurrence, follow prior
fixes, remove findings after a sufficient period without recurrence, and
resurface a problem when a claimed fix fails. Keep this in the first story's
repeated explicit maintenance invocation. Observation must include relevant
use of the fix; elapsed time without that exposure is not evidence of success.

Terry then selected two following outcomes: convert the recurring shared-feedback
runbook into an internal skill with client cleanup and publication included, then
compose the local and shared feedback cycles into one internal skill. Reuse
Story 5 for the second item and add Story 13 for the third. This request authorizes
landing these planning changes, not executing the proposed maintenance skills.

The ordering and cuts below incorporate those first three selections.
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

### 5. Collect client feedback and prioritize Open Dough improvements

**Identity:** SEED-010#exchange-retrospective-findings-with-another-project
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/317-collect-client-feedback/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0b82bb2299edd5f8940fa0c8aeece54a1abb6a282b07e6fa80c025b0c29fb767","plan":"fa26846639121e42debd1a65ddfbb8575f56d3618572fe3c549d18d410679d9e"}}
```

**Goal:** The maintainer explicitly invokes one internal Open Dough skill to
collect shared-guidance feedback, return concise and correctly identified client
logs, and publish the highest-value Open Dough backlog responses without adding
separate cleanup or commit/sync instructions.

**Scope:** Convert the existing [runbook](../../docs/maintainer/retrospective-findings-runbook.md)
into an internal skill, reusing its reconciliation, maintenance, watch, triage,
and backlog operations with one authoritative workflow. Include the bounded
improvements supported by the [runbook histories](../../docs/maintainer/empirical-process-control-research.md#runbook-automation-follow-up).
Resolve the maintained client set and each project's actual repository and
origin target, including Open Dough; do not assume a permanently fixed list of
three paths. This is a finite user-invoked cycle, not scheduled operation or
implementation of the resulting stories.

Collect shared findings, preserve missing evidence in the authoritative Open
Dough finding records, reconcile identities, and apply verified ODF mappings
and former-code traceability back to client `DearDough.md` files. Follow the
current catalog index and linked finding files rather than a literal fixed
number of documents. Consolidate redundant records of the same problem and
compact repeated narrative without losing distinct occurrences or provenance.
Local-only findings remain with the owning project; uncertain attribution stays
explicit. Reuse existing evidence and procedures instead of a new data platform.

Remove confirmed fixes according to the current release/adoption and relevant-use
watch rules, and resurface supported failures. Unreleased, unused, and
unknown-version cases cannot pass that watch. Remove extremely low-value findings
with no worthwhile intended response under the invocation's cleanup authority;
record a concise reason recoverably, not a false resolution or permanent noise
list. Severe one-offs and unresolved consequential cases remain. Preserve live
story relationships and do not silently cancel queued or Taken work.

Challenge the ranking before changing the queue: compare demonstrated impact,
distinct execution frequency, current relevance, confidence, and response effort.
Do not favor an easy fix, a vivid hypothetical consequence, or an already
implemented correction merely because its evidence is convenient. Retain the
runbook's top-two selection, allowing fewer when justified. Reuse and place
covering queued stories first; show Taken responses as ongoing and select the
next supported unqueued problem. Link stories and findings reciprocally and
preserve direction and other queue order. New stories are queued, not resolved.

The invocation includes committing, integrating through each project's ordinary
safe delivery path, and synchronizing changed client records and Open Dough's
own records/backlog with their intended origin targets. Preserve unrelated and
concurrent work. Retain evidence before shortening its source; verify accepted
publication separately for each repository. A partial run keeps completed work
and names unfinished writes or syncs; resume without duplicate collection,
stories, or commits. No new product fixes or releases are authorized by cleanup.

**Evaluation:** One invocation produces traceable, compact client logs, justified
leading Open Dough responses, and confirmed publication in each changed project.
A repeat adds no duplicate occurrence or story. Exercise the historical failure
cases: misleading priority, an implemented fix needing only adoption/proof,
uncertain recurrence, unjustified noise, and client-only publication that leaves
Open Dough unpublished. These are bounded workflow corrections; broader empirical
control design remains in later stories.

**Value / learning:** Replace the repeated runbook-plus-extra-instructions ritual
with a complete useful maintenance cycle. Keep response, release, adoption, and
later outcome distinguishable without claiming queued work already helped.

**Effort uncertainty:** Correct source compaction and cross-repository delivery
under concurrent activity. Reuse current operations and client discovery.

**Prerequisites:** Accessible selected project records and their ordinary delivery
conventions. Manual local classification already suffices; Story 12 is not a hard
start prerequisite for this independently useful internal cycle.

**Safe stopping point:** One explicit cycle is useful without the combined skill,
unattended triggers, or autonomous implementation.

#### Key examples

1. **One complete invocation.** The production dashboard lists projects using
   `main` and `master`, including Open Dough. The maintainer invokes the internal
   feedback skill → it resolves the current repositories and their delivery
   conventions, retains shared evidence in the linked Open Dough finding files,
   applies verified names and former-code aliases to source logs, selects up to
   two supported Open Dough priorities, and confirms the maintenance commits on
   every changed project's intended origin target. It reports a missing source
   log as a coverage gap, not an empty successful review; independent projects
   continue. Reading or authoring the skill alone starts no maintenance.
2. **Repeat without invented recurrence.** Two reports describe the same
   project/execution under old and adopted names; another execution reports the
   same mechanism → retain both distinct executions once, compact redundant
   narrative, and preserve their provenance. Repeating the same invocation adds
   no occurrence, story, or empty commit. The same `DD-NNN` in another project
   is independently identified. Similar symptoms with uncertain causes remain
   explicitly distinct; a local-only problem stays with its owning project.
3. **Rank the response still needed.** A frequent, evidenced costly problem
   competes with an easy cosmetic repair and a vivid but unobserved risk → rank
   demonstrated impact, distinct executions, relevance, confidence, and effort,
   and explain the choice. Reuse a covering queued story; show a covering Taken
   story as ongoing and select the next supported problem. An implemented fix
   needing adoption or proof does not become another implementation story. Zero
   or one actionable problem yields zero or one selection. Preserve direction,
   Taken work, other queue order, and reciprocal finding/story links.
4. **A watch needs exposure.** A response is verified in a tagged release and
   adopted guidance, with relevant execution evidence and seven calendar days
   since the supported watch start → after checking the maintained source set
   and resolving consequential contrary reports, retire the eligible finding
   from active/watch/source records with Git recovery. A released but unused
   fix, unknown execution version, missing source review, or unresolved report
   cannot satisfy that watch. A supported same-mechanism failure resurfaces the
   response and evidence; a later corrective release needs its own watch start.
5. **Pruning is a disposition, not a fix.** A redundant administrative finding
   has negligible observed harm and no worthwhile response → remove it with a
   concise recoverable reason after retaining needed evidence. A severe one-off,
   uncertain consequential case, or live queued/Taken relationship survives
   unless its actual resolution is established. Preserve meaningful differences
   between occurrences when compacting text; no permanent noise archive is added.
6. **Partial publication is resumable.** Open Dough has retained the evidence,
   one client's maintenance commit is accepted, and another client's target
   races or is unavailable → retain completed results and the unfinished
   candidate, report each repository's exact boundary, and continue independent
   safe work. Resume from observed Git state without repeating an accepted push,
   duplicating stories, or consuming unrelated edits. If clients publish but
   Open Dough does not, the overall cycle remains incomplete. Remote acceptance
   and any deferred local-checkout refresh are separate facts.

#### Alternatives and selected direction

The existing runbook is the simpler baseline: it already handles reconciliation,
watching, and top-two triage, but still requires copied instructions and excludes
commit/push. Merely renaming it leaves the selected outcome incomplete. A single
self-contained skill could absorb all procedures, but would take over identity,
adoption, and backlog behavior from their current owners. A composing internal
skill can instead pass explicit context and invocation authority to those owners,
while owning collection, cleanup/watch policy, ordering, and complete delivery.
Use that direction within the already selected scope; turn the runbook into a
pointer so it cannot retain a competing workflow. A machine-driven synchronizer
would add execution/state machinery while still needing evidence judgments;
there is no observed need for that infrastructure in this finite cycle.

Borrow the acknowledged handoff from registered delivery: the source log is the
sender, the authoritative finding record is the recipient, the qualified
project/execution is the item identity, and a retained evidence locator plus
per-repository accepted commit is the receipt. Preserve recoverable evidence
before shortening a source and resume only unfinished deliveries. Adapt this
without a new receipt database; use existing records, Git, and the run's report.
The analogy cannot establish common cause, a correct ranking, or effectiveness;
those still require the finding and watch evidence. Nor does it make several
repositories one atomic transaction.

#### Investigation and Architecture

Observed during refinement on 2026-10-19:

- The [runbook histories](../../docs/maintainer/empirical-process-control-research.md#runbook-automation-follow-up)
  document corrected rankings, duplicate implementation proposals, and omitted
  Open Dough publication. These are historical reports, not fresh effectiveness
  tests. The current runbook explicitly excludes commit/push.
- The [catalog](../../docs/maintainer/finding-names.md) now delegates authoritative
  content to linked finding files. Collection must follow those links; a fixed
  five-document rewrite would miss the current evidence owners.
- Reading the production configuration through its established location and
  inspecting each configured checkout found five repositories: Open Dough,
  Doughnut, Pygardon, Terry Talks, and Lizard. The last two use `master` and had no
  `DearDough.md`; Terry Talks also had unrelated edits. Origins matched configured
  identities. This is a dated observation, not a fixed future project list or
  authority to run maintenance during preparation.
- Existing publication/resume/refresh checks passed against isolated local Git
  origins in this preparation checkout. Disabling candidate publication made the
  targeted acceptance case fail; restoring it restores the mechanism. The plan
  retains the commands and limits. No client record or production target was
  changed by these observations.

The consequential responsibility is orchestration across separate owners and
repositories. Keep reconciliation, name adoption, triage, and backlog writes in
their maintained skills; adapt any stale catalog navigation there when necessary,
preserving their standalone authority boundaries. The new internal skill supplies
the explicit collection/cleanup/selection/publication authority. It neither
imports local-only improvements into Open Dough nor depends on Story 12 finishing.
Publication belongs to each project's safe delivery path; a whole-checkout landing
requires a result containing only this cycle's work. Do not impose Open Dough's
internal catalog or watch interval on the shared local-maintenance skill.

[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports reuse, one owner per concept, and proportionate machinery;
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) keeps this
maintainer skill outside the released payload and distinguishes release from
adoption; [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires useful behavior evidence without a routine discovery matrix;
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one behavioral source and explicit target roles. No Accepted ADR
conflict or exception was found. The dashboard North Star's machine-local
configuration remains discovery input, not a new authority for repository state.

Whether an agent reliably composes these instructions through complete delivery
remains unobserved. A bounded native first-use probe in isolated repositories is
the cheapest conclusive observation and belongs to execution with its existing
paid-run authority. Later response effectiveness remains uncertain until relevant
use; this story promises a traceable maintenance result, not proven long-term
improvement. No new goal, scope, or architectural decision is required here.

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

Stories 5 and 13 already own explicit maintenance-cycle selection. Reassess this
candidate against their delivered behavior: only a remaining need for recurring
selection under a standing policy, with evaluated decision quality and human
intervention, warrants further work. Do not build another ranking engine or
duplicate their supported dispositions.

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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/316-triage-project-findings/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"86aa4a595910516465c6e4721981f702c395aca96ed7ca8c8b4dcec6b734d0e1","plan":"cb799343b4314418e22b639e0e4cac395a8a422706c05bd9afdd99fc2f74e527"}}
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

The shared skill runs only on explicit user invocation, including a user-invoked
combined cycle that expressly names this phase and its project set (Story 13).
Its ordinary invocation
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
shared-guidance maintenance cycle across project boundaries; this story owns the
current project's local improvement queue. Story 13 composes both after explicit
user invocation. Stories 9–11 may reuse operations
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

#### Key examples

These examples refine the supplied outcome; fictional identifiers and observation
windows below are illustrative, not global defaults.

1. **Ownership precedes the queue.** A project's finding blames its CI observer,
   but the relevant observer is unchanged from the reported Open Dough release
   and the failed responsibility belongs to shared guidance. Explicit triage
   retains or returns that facet to `DearDough.md`, explains the responsibility,
   and creates no local workaround story. A documented local adapter violating
   a sound shared contract instead belongs in the project's existing findings
   file and is eligible for a local story. The Doughnut reversal and Pygardon
   adapter distinction in the reviewed sessions supply both sides.
2. **Mixed ownership and duplicate reports.** One execution contains a local
   test-results collision and a general coordination failure; the collision
   was copied into two records. Triage preserves the two supported facets and
   their relationship, moves the local evidence once, and counts that execution
   once for each supported conclusion, never twice in a combined priority's
   frequency. A similar timeout with a different or unknown cause stays distinct.
3. **Choose useful work without moving existing work.** Three actionable local
   problems include one already Taken, one already queued, and one uncovered
   severe one-off. Triage reports both active responses where they stand, adds
   only the uncovered evaluable story at the front with reciprocal links, and
   preserves other relative order and direction. A run containing only covered,
   resolved, shared, or unsupported problems creates zero stories. A lower-impact
   repeated problem need not outrank the severe one-off.
4. **Correct stale assessment without inventing success.** A finding still says
   discovery has a one-second timeout, but the adopted source now gives discovery
   five seconds and bounded retries; a completed response is linked. Triage
   corrects the current assessment and preserves the original occurrences. It
   does not queue that same remedy again or infer general effectiveness without
   relevant later observations. Diagnostic operations with a different timeout
   are not evidence that discovery remains unchanged.
5. **Watch exposure, then retire.** A project's established criterion requires
   seven days and relevant runs of its adopted repair. A later invocation finds
   eight days and attributable relevant use with no recurrence: it removes the
   active finding, preserving the decision and recovery locator in the project's
   existing convention or Git history. Eight days with no use, unknown adoption,
   missing history, or unresolved contrary evidence leaves the finding open.
   Reinvoking with the same evidence neither restarts the window nor adds an
   occurrence. A confirmed repair with sufficient direct outcome evidence may
   already justify removal without inventing a new watch.
6. **A failed fix stays recoverable.** A matching failure under the adopted repair
   occurs during observation or after retirement. Triage restores the prior
   lineage, links the failed response and new occurrence, and reevaluates priority.
   It reuses an active response or creates a bounded follow-up after completed
   work, as appropriate. An old branch without the repair is historical exposure,
   not a failed fix; a different cause with the same symptom keeps its own identity.
7. **Finish the maintenance invocation.** With an established project, record
   conventions, and origin target, one explicit invocation commits and publishes
   only its maintenance result through the existing delivery workflow. Verify
   remote containment separately from the intended checkout's refresh. Dirty
   unrelated work survives; a conflict or failed refresh reports the exact
   unfinished part and retained result. Repetition with unchanged evidence makes
   no empty commit. Reading the findings during another task triggers none of it.
   A user-invoked combined cycle that expressly names this phase and its project
   set supplies the same authority; its child needs no repeated publication
   permission. This skill still maintains only its established target project.
8. **Missing context stops the dependent action.** If responsibility or a required
   record location cannot be established, name the evidence or project decision
   needed, preserve the affected record, and continue supported independent work.
   A missing publication target prevents sync, not an invented default or a claim
   of successful publication. Existing alternate filenames remain authoritative.

#### Alternatives and selected direction

| Candidate | Fit with the supplied outcome | Consequence |
| --- | --- | --- |
| Keep the copied prompt and existing project records | Smallest existing solution; demonstrated useful results | Leaves initiation, ownership checks, repeat cleanup, and publication dependent on repeated instruction; does not deliver the selected shared skill |
| Expand `dough-maintain-findings` or publish internal ODF triage | Reuses a familiar entry point | Their meanings differ: approved code adoption versus maintainer catalog triage. Widening either would confuse existing invocation authority and impose unnecessary catalog inputs |
| Add `dough-triage-project-findings`, composed with existing backlog and delivery procedures | One explicit current-project maintenance journey, with existing records as its evidence | Selected design; adds only the missing orchestration and local finding lifecycle, with no new collector or status service |

The borrowed mechanism is a repair case followed through observation: finding
lineage identifies the problem, the response names the intervention, adoption
marks when exposure can begin, and a defined observation criterion supports
closure or reopening. Adapt it to compact Markdown and existing Git recovery,
not a new case-management database. Its consequential limit is that unlike a
controlled repair trial, agent work has uneven exposure and changing conditions;
an elapsed watch or lack of reports cannot prove causation or universal success.
This mechanism supports the selected skill; the analogy itself is no evidence
of improvement.

#### Investigation and architectural direction

Preparation on 2026-10-19 reused the report's review of 17 accessible sessions
and their source identities; it did not rerun those sessions. Targeted read-only
checks corroborated Doughnut's ownership reversal at `2381cf9e60` and Pygardon's
completed response at `5911d5e76`. Pygardon's current discovery source has a
5,000 ms deadline with up to three reads, while its findings still include the
older one-second assessment. These observations establish a stale assessment,
not repair effectiveness. No other project's records were changed.

PFE found reusable responsibilities in the public retrospective's evidence
format, `dough-product-backlog`'s canonical stories/queue, the owned-workspace
lifecycle, and Dough Land's publication/refresh/retirement. Internal ODF
reconciliation and the three-project maintainer runbook remain internal: their
identity namespace, fixed project list, one-week policy, and permission model
are not prerequisites of this skill. The existing project findings and recovery
history demonstrate local lineage and facet-level separation without a new store.

The consequential architectural choice is where responsibility lives. Author
the shared entry point under `src/skills/dough-triage-project-findings/`; keep
classification, compaction, response observation, and selection together as the
current-project maintenance responsibility. Link to existing owners for story
identity, backlog edits, and delivery rather than cloning their algorithms.
Resolve and validate the maintenance-only workspace before invoking landing,
because Dough Land publishes the whole reviewed checkout. Carry explicit
invocation authority to that handoff; do not introduce a second routine keep
question or silently include unrelated work. No classifier service, scheduler,
configuration schema, permanent evidence archive, or new ADR is needed.

This follows [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one coherent responsibility and proportionate process),
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
(source/payload/release distinctions, local standalone runtime),
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
(behavior review, affected native evidence, and bounded retention), and
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(executing-project perspective and one behavioral source). The current index
and these records agree; no conflict or exception was found. Existing North Star
topics concern dashboard ownership, not a new finding registry to extend.

The design hypothesis is that this composed skill reduces classification
reversals, unnecessary stories, repeated reading, and publication prompts. The
cheapest future evaluation is matched representative invocations against the
copied-prompt baseline, judging actual record and Git outcomes and effort. The
preparation's local publication/update observations settle reuse of those
mechanisms only; they do not establish that an agent follows the new skill or
that repeated real use improves outcomes. Broader causal evaluation remains
Story 4's distinct outcome. Release/tag creation and rollout remain separate
instructions; implementation must retain any outstanding native proof explicitly.

<a id="run-combined-project-and-shared-feedback-cycle"></a>

### 13. Run project and Open Dough feedback maintenance in one invocation

**Identity:** SEED-010#run-combined-project-and-shared-feedback-cycle
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The maintainer invokes one internal Open Dough skill that first handles
each project's own retrospective findings, then collects shared feedback and
publishes Open Dough priorities, without manually connecting the two workflows.

**Scope:** Provide the orchestration for Stories 12 and 5. Resolve the current
client inventory, including Open Dough itself, using the established production
dashboard discovery convention rather than a remembered repository list. The
explicit invocation authorizes both named maintenance phases and their ordinary
commit/integration/sync outcomes for that project set; children do not require
the user to repeat that authorization.

First run Story 12's local classification, cleanup, repair follow-up, and local
backlog selection across the projects. Then run Story 5's shared-feedback cycle
against the resulting records. Reuse those behaviors as their authoritative
owners, without a second copy of their rules. Preserve local stories when the
shared cycle subsequently places Open Dough's top shared responses first.
Synchronize the second phase's later client edits as well as the first phase's
results and Open Dough's final records.

Keep per-project phase and delivery outcomes clear. An unavailable or failed
local pass is a gap, not proof that its remaining log is all shared feedback.
Continue independent supported work and qualify the incomplete scope. A rerun
resumes unfinished boundaries without undoing delivered work or double-counting
findings and stories. Consequential attribution, intent, or delivery conflicts
receive a focused Jidoka decision with evidence; routine authorized steps proceed.

**Evaluation:** One explicit invocation traverses local maintenance across the
configured set before shared collection and yields the appropriate project and
Open Dough backlog updates with per-repository publication evidence. A blocked
project and a resumed partial run remain truthful and do not duplicate output.
The user no longer supplies each phase or publication prompt separately.

**Value / learning:** Establish the working automation structure for empirical
process control now. Reuse the bounded fixes to known workflow problems; defer
new measurement systems, better causal inference, and further decision-policy
design to their later stories. This skill executes a finite maintenance cycle;
Story 9 still owns initiation when due without a fresh user trigger, and no
resulting improvement story is implemented by this wrapper.

**Effort uncertainty:** Carrying project context, explicit authority, phase order,
and partial delivery state through the existing operations.

**Prerequisites:** Both constituent maintenance behaviors must be available for
the selected projects before the combined outcome can be demonstrated. Reuse
their maintained contracts; do not create an alternative implementation here.

**Safe stopping point:** The combined human-invoked cycle is useful even if
scheduled operation and autonomous correction remain deferred.

## Ordering and Scope Reduction

Queue the next eight outcomes in this order: Story 12 (explicit project-findings
triage), Story 5 (internal shared-feedback cycle), Story 13 (combined cycle),
Story 4 (response effectiveness),
Story 6 (preparation evidence), Story 7 (unreviewed execution/completion paths),
Story 8 (later product consequences), and Story 9
(automatic due maintenance). Story numbers and recorded identities remain stable;
the product backlog is the authority for current queue order and membership.

The first story continues the existing manual workflow at Terry's explicit
priority and addresses the ownership and publication mistakes observed in its
history, including ongoing cleanup and fix follow-up in subsequent invocations.
The next two replace the repeatedly invoked internal runbook and connect both
cycles, as Terry requested. Further stories evaluate broader response
effectiveness and tradeoffs. The two
observation stories address direct evidence gaps without requiring a new
telemetry system. Product consequences prevent cost reduction from becoming the sole
objective. Later unattended initiation builds on these explicit workflows.
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
The previously Taken CI story completed on trunk during preparation. Its removal
was preserved in the first landing; this direction does not requeue completed work.

## Open Decisions

These are refinement inputs, not reasons to invent implementation or delay the
requested queue update:

- Story 12 now records its selected entry point, ownership/delivery cases, and
  project-appropriate observation examples. Its remaining implementation and
  proof belong to its associated plan; no universal watch window is prescribed.
- Select the first current response, comparable observations, worthwhile benefit,
  cost guardrails, and relevant later-exposure window. ODF-139 is a candidate,
  not a new resolution or an instruction to harvest another project's history.
- Select representative preparation/completion histories and one product-quality
  claim; preserve gaps when the necessary evidence is unavailable.
- Select the first client and permitted evidence for the exchange. Later automated
  operation needs explicit sources, actions, notification boundaries, and authority.
- Refine the internal skill names and representative partial-run/delivery cases.
  Reuse current runbook watch and top-two rules; redesigning empirical control
  policy is not a prerequisite for the requested automation structure.
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
  consumption and cross-project exchange. Existing Stories 4 and 5 retain their
  anchors and identity; the 19 October request selects and extends their next use.
