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

On 2026-10-22, Terry dropped the later candidate for delegating a complete
bounded correction. Story 10's one-cycle evaluation showed the existing
dashboard-started cycle, preparation, execution and wrap-up already connect the
loop with no missed or repeated stop, and the one remaining manual step, release
and client rollout, is reserved under ADR 0005 while native acceptance is pending.

Later on 2026-10-22, Terry selected two narrow follow-ups: ODF-323's retry-safe
selected-slice status update first, then connecting evidence collected during
feedback maintenance to earlier responses' open observation requests. This
selection queues the stories; it does not start implementation or revive the
dropped autonomous-correction candidate.

On 2026-10-24, Terry requested one delivered client product improvement with
enough actual-use evidence for a narrow assessment, first in the backlog.
The selected case is Doughnut's note-details disclosure and the owner's
post-deployment request to restore visible properties and footer timestamps.
This queues an assessment in Open Dough; it does not reopen that product decision.

The shared [project-findings maintenance contract](../../src/skills/dough-triage-project-findings/SKILL.md)
provides explicitly invoked local maintenance, repair observation, priority selection,
and commit/sync. Later stories compose or evaluate that capability.

The ordering and cuts below record the selected follow-ups, completed evaluation
and dropped autonomous-correction candidate.
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

<a id="proportionate-refactor-for-records-and-repairs"></a>

### 20. Proportion the fresh refactor pass for records-only increments and small repairs

**Identity:** SEED-010#proportionate-refactor-for-records-and-repairs

**Beneficiary and outcome:** A coordinator delivering an increment that
changes only planning or execution records, or a few-line CI repair inside
code its slice's accepted refactor already reviewed, follows one explicit
rule: a recorded coordinator disposition naming that scope replaces a fresh
full refactor agent. Product-changing work keeps the independent pass.
Coordinators neither pay a no-op agent turn nor skip the pass silently.

**Evidence:** [ODF-141](../../docs/maintainer/findings/ODF-141.md) retains
no-op fresh passes across all four earlier projects; this cycle adds three
Pygardon, two Doughnut and two Clipboard executions (about 50–60k subagent
tokens or 4–12 reported minutes per pass where recorded). Clipboard
SEED-001#copy-files skipped the pass for small repairs without an authorizing
rule, as did the three executions at
[ODF-276](../../docs/maintainer/findings/ODF-276.md). Other passes in the
same executions made useful edits; that benefit must be kept.

**Bounded scope:** Change only the delivery and refactor guidance, and any
delivery check that requires the pass, for records-only increments and small
repairs within already-reviewed code. Keep the full pass for new or moved
product responsibility, changes outside the reviewed scope and any uncertain
case. Do not change refactor criteria or file-size policy.

**Key examples:** A plan-only waiver slice records the disposition. A
three-line test-fixture CI repair in a file the slice's refactor reviewed
records the disposition naming that review. A new product module gets the
full pass. A small repair in another subsystem gets the full pass.

**Evaluation:** Replay retained no-op cases (Doughnut plan 080 slices 1–2,
Clipboard SEED-001#portable-text repairs, Pygardon plan 482 slices 6–8) and at
least one retained pass that found real residue, confirming the rule still
requires that pass. Report agent turns and tokens avoided in replay with their
limits. At closure, record the actual response revision and first containing
release (or explicitly unreleased status) at ODF-141 and ODF-276; later
ordinary use remains a separate observation. **Queued, not refined or
implemented.**


<a id="pending-lifecycle-validation-obligations"></a>

<a id="prove-planning-premises-at-their-use"></a>

### 21. Prove decisive planning premises where the slice uses them

**Identity:** SEED-010#prove-planning-premises-at-their-use

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/458-prove-planning-premises-at-their-use/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"df66d731ff5e01ecc7785708c191daae1002422875e2cf2bbf1236a312bda2e7","plan":"1d899eedec59aa92beef89f57790bc6faa4f3721fb4ba63a6da58152fda5d309"}}
```

**Goal.** A developer reviewing readiness can see, for each decisive
premise, the consuming operation and the exact form (command, flags,
input identity, profile, checkout) that settled it, and which inputs or host
conditions remain unverified. The executing agent can reuse that result or
see the remaining boundary before starting work, instead of discovering at
the first slice that the planner observed a proxy for the operation the
slice actually runs.

**Evidence.** [ODF-074](../../docs/maintainer/findings/ODF-074.md) retains
three post-response cases on 0.3.82 and 0.3.83, which contain the 0.3.58
consuming-operation rule. Doughnut plan (SEED-100#story-2) observed
`python3 -c "import pandas"` while prescribing `python3 -I`, which disables
the user site holding pandas, and defined a time measure from a field the
real export shows is generated days ahead. Pygardon plan 485 verified the
terminal manifest's hash and factor files but not that the dataset was still
published in the production profile; the first launch failed with
`DatasetNotFoundError` and cost about 15 minutes. Open Dough plan 456
slice 6 promised "the shown done sessions" with no premise row for how the
Board selects them; the implementer stopped before writing code. In each
case the observation that settled the premise, or the absence of one, did
not match the form or profile the slice consumed.

**Scope.** Strengthen the existing premise review in slice planning's
[settle decisive premises](../../src/skills/dough-slice-planning/references/settle-decisive-premises.md),
its readiness criteria, and the execution brief, without a new observation
format or a mechanical recorder check:

- *Match the observation to the use.* A premise about a command, its flags
  or interpreter mode, a named input, or the profile or environment that
  consumes it is settled by an observation in that same form and profile.
  An observation in a different form, such as `python3 -c` for a slice that
  runs `python3 -I`, a companion file for the profile's own published
  inputs, or a development checkout for a deployed profile, is a proxy. A
  proxy settles the premise only when the plan records why the difference
  cannot change the outcome; otherwise the premise stays open and the row
  names the unverified difference as an input or host condition.
- *Record the boundary where readiness is read.* Each premise row names the
  consuming operation, the form and profile observed, when or at which
  revision, the result, and any unverified remainder. An unverified
  remainder that can change a slice's outcome is a `not-ready` reason naming
  it, unless an early probe slice bounds it as today.
- *Reuse a matching observation.* A retained observation that already
  reached the exact form in the consumed profile, such as a retained proof
  record, an earlier plan's premise row, or a dated host listing, settles
  the premise by citation with its time or revision and result, when nothing
  that changes the result has changed since. No re-run is required for that.
- *Derive selection premises from the slice's wording.* A promised outcome
  that names a selected set or restriction, such as "the shown done
  sessions", carries a premise about how the product selects it; derivation
  reads the selecting code before the slice is sized.
- *Carry the boundary into execution.* The delegation brief for a slice
  carries that slice's premise rows and their unverified remainder; the
  executing agent reuses a settled result or checks the remainder in the
  exact form before dependent work, and returns a false premise through
  execution reassessment.

Preserved constraints: the smallest safe observation rule, scratch
observations only in the owned workspace with a revert before recording,
and paid, credentialed, owner-held, or state-changing steps staying in early
probe slices. No new requirement to run full suites or native probes; a
read-only query of the consuming profile is an observation, an experiment on
a shared or production system is not.

Scope limits: the owner-held handoff problem stays under ODF-252; the
recorder keeps storing the agent's judgment without parsing premise rows;
plans already recorded `ready` are not reassessed; Pygardon and Doughnut
logs are not edited, the replay uses the evidence retained at ODF-074.

**Key examples.**

1. *Command form.* A slice prescribes `python3 -I analyze.py`; the planner
   ran `python3 -c "import pandas"` and it succeeded. The row stays open:
   `-I` changes module resolution, so the proxy's result does not carry.
   Running `python3 -I -c "import pandas"` in the owned workspace settles it
   with that command's result; a failure changes the plan before slice 1.
2. *Consuming profile.* A slice launches search containers in the production
   profile with dataset `eab666f4…`; the planner verified the manifest's hash
   and factor files on the host. The row names "published in the production
   profile" as unverified; a read-only listing of that profile's published
   datasets, cited with its retrieval time, settles it. The listing already
   retrieved that morning showed the dataset absent, so the plan changes
   before kickoff instead of the launch failing.
3. *Reused observation.* A slice's proof is a focused command already run at
   the current revision in this checkout and recorded in a retained proof
   record or an earlier plan's premise row with its result. The planner cites
   that record and its revision; the premise is settled without a re-run.
   When the checkout has moved past that revision on the paths the command
   runs through, the citation no longer settles it.
4. *Readiness view.* A developer reads the plan's premise table before Take
   and sees, per row, operation, observed form and profile, time or revision,
   result, and unverified remainder. A row whose remainder can change the
   outcome and has no bounding probe slice shows in the recorded
   `not-ready` reasons by name.
5. *Selection premise.* A slice promises a regular answer holding "the shown
   done sessions". Derivation reads the browser code that selects those
   sessions; the row records what it consults. Where the selection is wider
   than the slice assumed, the plan splits before execution rather than at
   the implementer's stop.
6. *Honest boundary.* The exact form is a native host run or a credentialed
   production launch. The planner observes its unpaid parts, records the
   remainder as an early probe slice whose failure stops dependents, and the
   plan can still be `ready`; no full suite or native probe is required.
7. *Executing agent.* The brief for slice 2 carries its premise rows, one
   with an unverified host condition. The implementer checks that condition
   in the prescribed form first; when it is false, the slice returns under
   execution reassessment before dependent work rather than after a failed
   run.

**Evaluation.** Replay examples 1 and 2 from the retained ODF-074 evidence
and example 3 from a retained observation in this repository against the
revised text, showing that the proxy import and the companion manifest check
leave their premises open with the difference named, while the retained
observation settles its premise by citation. Record review effort, the
actual response commits and first containing release or explicitly
unreleased status, and what remains to observe at ODF-074; later ordinary
use remains a separate observation.

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

## Ordering and Scope Reduction

Story 10's [one-cycle evaluation](../../docs/maintainer/empirical-process-control-research.md#feedback-cycle-evaluation-follow-up) and the
[ODF-142 correction](../../docs/maintainer/findings/ODF-142.md) are complete.
Story 17 (ODF-323 retry safety) and Story 18 (connecting collected evidence to
open response observations) are complete. The next selected work is the
Doughnut note-details assessment above: one delivered product change with
actual beneficiary feedback and an attributable correction.
Story numbers and recorded identities remain stable;
the product backlog is the authority for current queue order and membership.

The maintained research report retains the preparation,
[completion-tail](../../docs/maintainer/empirical-process-control-research.md#landing-history-follow-up)
and [later product-consequence](../../docs/maintainer/empirical-process-control-research.md#later-product-consequences-follow-up)
assessments, so cost reduction does not become the sole objective.
Later unattended initiation builds on the existing explicit workflows.
Manual mechanisms remain usable throughout; no story is blocked merely because
an earlier priority has not completed.

No story for a complete autonomous correction loop is queued. A later
candidate needs an observed manual connection worth removing, an explicit
correction class and authority bounds. Evaluating the current cycle creates no
commitment to unrestricted self-improvement.

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
