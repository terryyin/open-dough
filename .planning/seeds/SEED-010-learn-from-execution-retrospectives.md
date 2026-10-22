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

<a id="prioritize-responses-with-delegated-authority"></a>

### 10. Evaluate one real feedback cycle

**Identity:** SEED-010#prioritize-responses-with-delegated-authority
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/342-evaluate-one-real-feedback-cycle/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bf90dae578e459c2d59ee9c9ae1ab0d3324841bfec40657fb8474f19944c6ad9","plan":"f891ea0b80a8d12212db2d0ee36b65e2bb9b62f6e438ea5f213065fd21241580"}}
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

- **Observed run.** The observed run is the first combined cycle after the
  2026-10-21 review: the one the watch list's due block makes due on
  2026-10-22, whether the dashboard starts it under Story 9's standing
  authorization or the maintainer starts it by hand. That run is also Story
  9's own developer-run observation; this story reads its records and runs no
  cycle of its own. Its evidence is the launch record and completion receipt
  on this machine, the native session record, the cycle's commits in each
  maintained project, and the maintainer's prompts. When the run's result
  already exists before this story's execution begins, the decision basis is
  recorded as set afterwards and the judgment is labelled exploratory; when
  it does not, the basis is recorded first and the judgment waits for the
  run. Once the basis names that run, a later run is not substituted.
- **Definition of improvement.** Trial
  [Proposed ADR 0010](../../docs/adrs/0010-definition-of-improvement.md) as this
  evaluation's decision basis. Before judging the cycle, state the beneficiary,
  intended gain, baseline and comparison limits, result worth keeping, quality
  and authority constraints, costs that could outweigh the benefit, and any
  later exposure needed. Set criteria before a future run where possible;
  assessment of existing results remains exploratory. Use existing decisions
  and ask the maintainer to settle consequential unresolved tradeoffs. Record
  later criteria changes openly. This bounded trial does not accept the ADR or
  make it binding guidance elsewhere.
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
  already covered it, and what value the intervention added. Trial ADR 0010's
  valuable-intervention and missed-intervention rates, with proposed targets
  above 80% and below 5% respectively, using the
  [assessment method](../../docs/maintainer/empirical-process-control-research.md#assess-human-intervention-quality).
  Review both stopped and autonomously handled decisions; count a valuable
  opportunity missed by the process even if a person later noticed and rescued
  it. Reserved human ownership can add value without changing the AI's proposed
  outcome. Report distinct event counts, evidence, severity, review coverage,
  pending or uncertain classifications, and repeated interruption costs. A small
  or unexercised cycle cannot establish sustained target attainment; do not
  manufacture events or prolong the cycle to obtain favorable rates.
- **Coverage and delivery.** Retain each project's assessed, unavailable or
  unfinished status and the final publication/reporting evidence. In particular,
  resolve the disposition of the recurring Terry Talks and Lizard source gaps
  within existing authority, or leave the exact owner decision needed. Missing
  findings do not prove a healthy project or a passed watch. Repeated reports,
  aliases and rereviews do not become new findings or new backlog items.

**Deferred promises:** This delivery does not run, repeat or schedule a
maintenance cycle; implement, release or roll out any response the cycle
selects; accept, revise or reject ADR 0010, which stays with the advice
process; add a ledger, measurement platform, token counter, scoring rule or
dashboard view; change the maintenance skills, their selection limits or
their authority; write to any client repository; or retire, reopen or re-rank
a finding beyond the dispositions existing authority already allows. Sustained
target attainment, a general productivity rate and a matched comparison with
the manual cycles are not claimed from one run.

**Key examples:**

1. The due block on trunk reads `reviewAfter` 2026-10-22 and no cycle has
   completed since the 2026-10-21 review → this story's execution writes the
   decision basis in the research report → the basis names the observed run,
   its beneficiary (the maintainer and the maintained projects' developers),
   the intended gain (worthwhile product and process decisions at acceptable
   cost with useful intervention), the comparison (the October 20 cycle at
   `327b6fa2`–`a2be7e50` and the October 21 cycle at `77f9c3f6`–`c361dbb8`
   as qualified context, not a control), the result worth keeping, the
   quality and authority constraints, the costs that could outweigh the
   benefit, and the later exposure needed, dated before any result of that
   run is read.
2. The observed run completed and published before this story's execution
   began → the same write → the basis records the date it was set and that
   the result preceded it, the judgment is labelled exploratory, and nothing
   else about the method changes.
3. The observed run's report selected two shared responses and one
   project-owned Pygardon story, declined one candidate, and recorded one
   no-change → the evaluation traces the selections → each selected, declined
   and no-change candidate links to its finding evidence, distinct-execution
   frequency, current relevance, product direction and any existing covering
   story; the trace states whether a project-owned product improvement was
   considered without a further human request, which the October 21 cycle
   needed; the justified no-change counts as a valid decision; the evaluation
   creates no story or finding of its own.
4. The observed run reviewed the Open Dough, Pygardon and Doughnut logs and
   found no ordinary named-gap acceptance since the 0.3.67 successor was
   adopted → the evaluation follows ODF-139 → the finding's record gains that
   exposure limit and the next discriminating observation; no effectiveness is
   claimed and its watch does not pass. Where such an acceptance exists, the
   record gains the original story, actual disposition, correction rounds,
   intervention and available burden instead.
5. The launch record, completion receipt, Claude Code session record and the
   cycle's commits exist for the observed run → the evaluation records cost →
   one table gives input, cache-creation, cache-read and output tokens where
   the host record states them, wall-clock time from launch to the last
   accepted publication, active human effort from the prompts the maintainer
   wrote, and the publication and correction work; every unmeasured quantity
   reads unknown; this evaluation's own preparation and execution burden is
   listed beside it.
6. The observed run stopped twice for the maintainer, both with an assessable
   outcome, one of which exercised reserved authority and one of which was
   routine approval already delegated; it handled four consequential
   decisions without stopping, one of which needed the maintainer; a third
   prompt repeated the first stop's reminder → the intervention assessment →
   six distinct events, each with the decision, why a person was or was not
   needed, whether existing authority covered it and the value the actual
   intervention added; valuable-intervention rate 1/2 and missed-intervention
   rate 1/2, each with its named events; the repeated prompt adds no event
   and is recorded as interruption cost; no target-met claim. A run with no
   assessable stops reports the valuable-intervention rate as not assessable,
   never as 100%.
7. Terry Talks and Lizard have no `DearDough.md` and no Open Dough
   configuration file, and the observed run reports them unavailable → the
   evaluation resolves coverage → either a disposition within existing
   authority, such as recording them as not yet maintained with the reason
   and the owner who can change it, or the exact owner decision needed; no
   watch passes on their silence, and repeated reports, aliases and rereviews
   add no finding or backlog item.
8. The basis, traces, follow-through, cost, intervention and coverage records
   are all written → the maintainer reads the follow-up → one evidence-linked
   judgment (retain, adjust, simplify, revert or inconclusive) with the run's
   useful decisions, missed opportunities, quality consequences, cost and
   human burden; a bounded next observation only where the evidence supports
   it; and a separate recommendation on ADR 0010 (accept, revise and trial
   further, or reject) that leaves acceptance to Terry. A second review of
   the same run yields the same follow-up and adds no occurrence, story or
   finding.

**Evaluation:** Produce one evidence-linked retain, adjust, simplify, revert or
inconclusive judgment about this cycle, explaining its useful decisions,
missed opportunities, quality consequences, observed cost and human burden.
Judge selections against the original evidence and product direction rather than
the cycle's own completion claims. Record a bounded next observation or proposed
correction only where the evidence supports it. Keep the assessment in the
maintained research report and link existing finding owners; use current cycle
records and Git history rather than a new permanent ledger. One cycle establishes
a bounded judgment, not sustained effectiveness or a general productivity rate.

Separately assess whether ADR 0010's definition helped make a useful decision at
proportionate cost. At this story's conclusion, recommend acceptance, revision
and further trial, or rejection through the existing human advice process.
Acceptance remains a human decision; story completion does not accept the ADR.
Review need not wait for every delayed response outcome, provided pending
evidence and the limits of any improvement claim remain explicit.

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


<a id="trace-changed-behavior-to-existing-consumers"></a>

### 12. Reach every existing consumer of a changed behavior before publication

**Identity:** SEED-010#trace-changed-behavior-to-existing-consumers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/343-trace-changed-behavior-to-consumers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e1173c41ceed97e869d1fb00e4c39a993da0f8ab857ed7ae799414fe7a9fa32e","plan":"2a96bda44af7322db19155dde5fae0bf15f6656de459819da7467947c5a17e32"}}
```

**Goal:** An executing agent finds the existing tests, stand-ins and journeys
that consume a slice's changed behavior before it accepts and publishes the
slice, so developers stop receiving owned CI failures from consumers the slice
never ran.

**Selection (2026-10-22 feedback cycle):** Selected first for
[ODF-150](../../docs/maintainer/findings/ODF-150.md). Three more distinct
executions reached CI with an untraced consumer after the 0.3.57 and 0.3.61
responses: Open Dough plan 334 (an existing runner stand-in), the shared-host
proof execution on 0.3.67 (a guidance test under `src/` missed by a `tests/`
search; two failed published revisions) and Doughnut SEED-081#story-2 (seven E2E
journeys whose preconditions the changed UI path altered). Each cost a CI failure
and a repair cycle. Two guidance-only responses have not stopped the mechanism,
so wording alone is not the expected response.

**Scope:** The three misses share one cause, observed on 2026-10-22 by
replaying each slice at its recorded parent commit: the trace was performed
from something the agent already held and reported only in prose, so
acceptance could not tell a bounded search from a whole-checkout trace. Plan
334 traced from its own new stand-in; the shared-host execution searched the
`tests/` directory; the Doughnut slice traced the unchanged transport API. In
each replay one deterministic search from the changed behavior reaches the
missed consumer: the changed file's basename across the whole checkout lists
the eight guidance tests under `src/skills/dough-execute-plan/scripts/` that
read `ci-monitor.md`; the changed runner modules' exported identifiers across
test support list eleven files importing them, including
`cursorRunnerHeldReads.ts`; the recall card's retired observation (“I should
see ordinary recall” and the page-object methods that observe the card) leads
through step definitions to the features whose journeys reach the changed
no-question state.

This story delivers a consumer-trace record and the script that produces its
search. For every slice whose change alters an operation, contract, message,
value, default, rendered output or shared text, the implementation return
carries the record: each changed effect; the search terms and whole-checkout
scope actually searched; each located consumer by kind (production caller,
test, test support or stand-in, journey or feature, guidance reader) with its
disposition (proof run, proof reused, or excluded with the reason the effect
does not reach it); and kinds with no match named as such. The coordinator
accepts and publishes only with that record and after the record's unexcluded
consumers have proof; a return without it for such a change goes back for the
trace. The installed script performs the mechanical search so its scope cannot
be narrowed by hand: given the checkout, the change (diff base or changed
files) and the agent's effect terms, it searches every tracked and untracked
non-ignored file for the changed files' paths and basenames, identifiers
declared or exported in changed hunks together with the changed modules'
import paths, retired literals from removed lines, and the supplied terms for
retired behavior and altered preconditions; it prints the record skeleton
grouped by kind with explicit empty kinds. Delegation and acceptance guidance
name the record and the script; the shared trace text in
[own executable proof](../../src/skills/dough-story-refinement/references/executable-proof.md)
keeps its effect-first rule and gains the record as its evidence form.

Proof replays the three recorded slices: plan 334 at `79a1f1ec~1` and the
shared-host slice at `37eed762~1` in this repository, and Doughnut
SEED-081#story-2 at `07606012~1` in the maintainer's local Doughnut checkout;
each replay's record names the missed consumer. Proof stays proportionate to
the five-minute slice target: the record evidences a trace, and running the
listed consumers' proof keeps the existing focused-check rules; the story
requires no whole-suite run in place of a trace. Boundary assumption: a
script-backed record is the non-wording response the selection asks for.

Deferred: a mechanical gate in the publication path that refuses an increment
without a record file; term derivation beyond paths, identifiers, removed
literals and supplied terms, such as route or render analysis; paid native host
runs, which stay manual; and the decline measurement, which accrues at ODF-150
through ordinary later executions.

**Key examples:**

1. A slice shortens the pause clause of `ci-monitor.md` in
   `src/skills/dough-execute-plan/references/` → the agent runs the trace
   script for the change with no extra terms → the record lists, under
   guidance readers, the eight test files under
   `src/skills/dough-execute-plan/scripts/` that read `ci-monitor.md`,
   including `shared-checkout-writers-guidance.test.mjs`, with a disposition
   for each; a return whose record was built from a `tests/`-only search does
   not exist, because the script searched the whole checkout.
2. A slice makes the Cursor runner address and wire answers require current
   build proof and adds its own stand-in `cursorRunnerProof.ts` → the trace
   script runs from the changed modules `runnerPaths.ts`, `runnerClient.ts`
   and `runnerProtocol.ts` → the record lists eleven test-support files that
   import them under stand-ins, including `cursorRunnerHeldReads.ts`; the
   agent runs or reuses proof for each or excludes it with the reason; the
   coordinator refuses to accept a record that lists them with no disposition.
3. A Doughnut slice makes the recall card wait for an explicit Self-review
   choice instead of showing ordinary recall when no question loads, and the
   recall API is unchanged → the agent supplies the retired observation
   “ordinary recall” and the altered precondition “no question loads” as
   effect terms → the record lists the step definitions and page-object
   methods that observe the recall card and, through them, the recall features
   whose journeys reach that state (`daily_probe`, `spaced_repetition`,
   `browse_answer_and_notes_while_recalling`), each run or excluded before
   publication; a record that names only the API consumer is incomplete.
4. A slice renames a helper used only inside one file, with no shared
   contract, text, value, default or rendered output → the trace script finds
   no consumer outside the changed file → the record says so and the slice
   keeps its focused proof.
5. A delegated agent returns an effect-changing slice with proof commands but
   no consumer-trace record → the coordinator returns the slice for the trace
   → nothing is accepted or published until the record and the proof of its
   unexcluded consumers arrive.

**Evaluation:** Replay the three recorded slices' inputs. The changed procedure
names the missed consumer before acceptance in each, or records why a trace
from the changed behavior could not reach it. Ordinary later executions show
whether owned consumer-miss CI failures decline; record the finding's next
eligible uses rather than treating delivery as resolution. Completion records
the actual response and its containing release at ODF-150.

**Value / learning:** Removes the most frequent demonstrated cause of owned CI
repair cycles across the maintained projects, and tests whether a non-wording
response changes behavior where two wording responses did not.

<a id="bound-startup-guidance-retrieval"></a>

### 13. Retrieve startup guidance within the response budget

**Identity:** SEED-010#bound-startup-guidance-retrieval
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** An executing agent obtains the guidance passages it needs at startup
without truncated tool results, so it stops re-reading references before its
first delegation.

**Selection (2026-10-22 feedback cycle):** Selected second for
[ODF-264](../../docs/maintainer/findings/ODF-264.md). Six more distinct
executions on 2026-10-21 alone (three Open Dough, one Doughnut, two Pygardon,
all Codex) batched whole references or plans, received outputs of 10,000 to
30,000 tokens with truncation and repeated retrieval, although targeted-retrieval
guidance already applies. No product failure is attributed; the cost is
repeated reading on almost every Codex startup and is not yet measured.

**Scope:** Establish which startup reads each execution actually needs and why
agents batch them, then change what the guidance asks for or provides at startup
so required passages arrive within one bounded response. Measure the repeated
retrieval it removes. Preserve required context; do not hide passages an
execution needs or move the cost into later failures.

**Evaluation:** Compare truncation warnings and repeated startup reads in
ordinary executions before and after the response, per host, against the
retained occurrences. A response that leaves a required passage unread is a
failure even when truncation disappears. Completion records the actual response
and its containing release at ODF-264.

**Value / learning:** Reduces a recurring resource cost of every execution and
tests whether guidance shape, rather than another instruction, changes agent
reading behavior.

**Effort uncertainty:** Host differences may dominate; refinement may limit the
first response to Codex, where every retained occurrence on 2026-10-21 ran.

<a id="skip-feedback-from-projects-without-process-retrospective"></a>

### 14. Skip feedback collection from projects with process retrospective off

**Identity:** SEED-010#skip-feedback-from-projects-without-process-retrospective
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"82e4ed1c960893924adeda82549633ef10889bb217033b85022d5b20df2e9c89"}}
```

**Goal:** The maintainer gets complete feedback coverage, and watched responses
can retire, when some maintained projects never record process findings because
their process retrospective is off.

**Selection (2026-10-22):** Terry selected this first after the 2026-10-22 cycle
reported incomplete coverage again. Terry Talks and Lizard have no
`.planning/open-dough.json`, so their process retrospective is off and they will
never produce a `DearDough.md`. Every cycle has counted them as missing logs,
which blocked retirement of ODF-156, ODF-200, ODF-201 and ODF-202.

**Scope:** In [collect-client-feedback](../../.agents/skills/collect-client-feedback/SKILL.md),
its [retention and watch](../../.agents/skills/collect-client-feedback/references/retention-and-watch.md)
rules and [maintain-feedback-cycle](../../.agents/skills/maintain-feedback-cycle/SKILL.md),
resolve each discovered project's process-retrospective setting the way
[dough-execution-retrospective](../../src/skills/dough-execution-retrospective/SKILL.md#select-reviews)
does: `<project-root>/.planning/open-dough.json` with `skipProcessRetrospective:
false` enables it; a missing file or key, or `true`, means off. A project with
it off is out of scope for shared collection and for the watch's source-set
coverage, and the report names it as skipped with that reason, not as a missing
log. The project-local phase still runs for it when it has a project findings
record. A project with it on and no readable `DearDough.md` remains a coverage
gap. An unreadable or malformed configuration stays a gap rather than a skip.
Do not create or edit a project's configuration, and keep the production
inventory unchanged.

**Evaluation:** Walk the 2026-10-22 production set: Terry Talks and Lizard are
reported as skipped because process retrospective is off, Open Dough, Doughnut
and Pygardon remain collected, and coverage counts as complete for watch
retirement. A project with the setting on but no log, and one with malformed
JSON, still report a coverage gap. Existing `tests/support/feedback-review.test.mjs`
keeps passing.

**Approach:** Planless; changes are limited to the three internal maintainer
guidance files above and need no product code.

<a id="reuse-native-proof-after-attribution"></a>

### 15. Stop asking for native checks once their question is answered

**Identity:** SEED-010#reuse-native-proof-after-attribution
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** The developer is asked for interactive native checks only while they
still answer an open question, so native acceptance does not exhaust them.

**Selection (2026-10-22 feedback cycle):** The strongest unselected alternative
for [ODF-324](../../docs/maintainer/findings/ODF-324.md), queued at Terry's
request. In SEED-144#branded-alert-click-automation (plan 330) the developer
stopped participating ("I had enough of this. Please complete this without
me.") after many Notification Center clicks and authentication rounds, and the
coordinator still asked for a four-click replay for a message-only change.
Related ODF-262 and ODF-307 also record human rounds spent on native proof; a
shared cause is not established.

**Scope:** Change how native acceptance plans and reuses interactive developer
checks: plan them around the consequential unknown, account early for the tools'
focus and authentication limits, and reuse native proof already sufficient when
only text or another unaffected detail changes. Keep real native checks where
the behavior they observe changes.

**Evaluation:** Replaying plan 330's inputs, the message-only correction reuses
the earlier native baseline with a regression check for the new text instead of
asking for another replay. Count developer rounds in later native executions
against the retained occurrence. Completion records the actual response and its
containing release at ODF-324.

**Value / learning:** Protects the developer's attention, the scarcest resource
in native acceptance.

<a id="correct-feedback-maintenance-session-status"></a>

### 16. Show feedback maintenance's real outcome after quiet and interrupted runs

**Identity:** SEED-010#correct-feedback-maintenance-session-status
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/344-correct-feedback-maintenance-session-status/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f572aed7b567cf25876149a9c9d49547ec4cef980d3955eb19f78524ce1e1843","plan":"d910e52bcce5274c1c5632a275a945a0bcdb15b9715762468d6c6ca2b759a544"}}
```

**Goal:** The maintainer sees the actual outcome of each automatic feedback
maintenance session on this machine's dashboard: a cycle that completed
quietly does not read as "did not complete", and an automatic start the
dashboard stopped running before it settled does not read as running forever
or block later due dates. This restores Story 9's quiet completion and its
one-launch-per-due-date rule, so only the decisions that need a person reach
one.

**Scope:** A bounded retrospective correction of
[Story 9](https://github.com/terryyin/open-dough/blob/1a70db5cbd98b0a052f8f3e0f11785014d944db5/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#run-due-feedback-maintenance), from its execution retrospective.
A quiet done session is not shown as incomplete on the strength of a watch-list
read taken before it started; an unsettled automatic attempt that no process
on this machine runs counts as ended, serves its due date, and leaves later
due dates free to launch. Adds no feature promise and no GitHub request.
Findings, proof, and decisions are in the
[plan](../slice-plans/344-correct-feedback-maintenance-session-status/PLAN.md).

## Ordering and Scope Reduction

Queue Story 16's correction of automatic due maintenance first and Story 10's
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
