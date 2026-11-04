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

On 2026-11-04, Terry directed that refactoring stays whole-product in scope:
proportionality for records-only increments and small repairs governs only
whether a fresh pass is triggered, and a triggered pass still examines the
implicated concepts across the entire product, not the story's own change.

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

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/458-proportionate-refactor-for-records-and-repairs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f6b0ef58a021a518f92253694f3053935d49061e7777fdc0f99c378a9f7550fd","plan":"0983f0d993fb61a1d2a065c1ae1ccf90ff48277e4e65a60282360717331b0ee4"}}
```

**Goal:** A coordinator delivering an increment that changes only planning or
execution records, or an owned repair that stays within the concepts a slice's
accepted refactor return already traced, follows one explicit rule: a recorded
coordinator disposition naming that scope replaces the fresh full refactor
agent for that delivery. Every other delivery keeps the independent pass, and
the pass, once triggered, examines the implicated concepts across the whole
product as it does today. Coordinators neither pay a no-op agent turn on a
change with nothing to refactor nor skip the pass without an authorizing
record, so the passes that find real residue keep running.

**Evidence:** [ODF-141](../../docs/maintainer/findings/ODF-141.md) retains
no-op fresh passes across Open Dough, Pygardon, Doughnut and Clipboard
(about 48–80k subagent tokens or 2–12 reported minutes per pass where
recorded), including plan-only slices and every retained owned CI repair.
Other passes in the same executions made useful edits, and one records-only
pass (Open Dough plan 200 slice 4) corrected wrong code citations in a new
seed. [ODF-276](../../docs/maintainer/findings/ODF-276.md) and Clipboard
SEED-001#copy-files skipped the pass for records-only slices and small
repairs with no authorizing rule. Current delivery guidance (execute-plan
wrap-up step 1, the CI repair sequence, one-shot execution and bug fixing)
requires the fresh agent unconditionally; no script enforces the
`## REFACTOR COMPLETE` marker, so the requirement and its exception are prose.

**Scope:**

- *Required behavior — the disposition rule.* Before the fresh-agent step of
  delivery, the coordinator classifies the uncommitted change once. A
  *records-only* change touches only planning, execution, finding or research
  records (plans, seeds, backlog, source reviews, agent records, DearDough
  entries, maintainer findings): the coordinator records the disposition
  `records-only` and delivers without an agent. An *already-traced repair* is
  an owned CI repair or small change whose every changed concept lies within
  the representations the slice's accepted refactor return traced (its
  reported changed paths and consumer-trace record) and that adds no
  representation, helper, dependency or path outside that return: the
  coordinator records the disposition naming that accepted return and
  delivers without an agent. Any other change, and any case the coordinator
  cannot classify with confidence, gets the fresh full pass as today.
- *Required behavior — the disposition is a record.* The disposition is
  retained where the delivery's accepted proof is retained: beside the slice
  in the plan for planned execution, in the delivery boundary kept in the
  conversation for quick execution. It names the classification and, for a
  repair, the accepted return it relies on. The delivery check that today
  requires `## REFACTOR COMPLETE` accepts that disposition in its place for
  these two cases only; a missing disposition and a missing marker both still
  prevent commit.
- *Required behavior — dispositions feed the next pass.* The next fresh
  pass's handoff lists the dispositions recorded since the last fresh pass,
  and that pass includes those changes in its discovery. The execution
  retrospective's residue assessment over the aggregate commits stays the
  whole-product check for dispositions after the last pass.
- *Required behavior — one rule for every delivery path.* Slice delivery,
  owned CI repair, one-shot execution and bug fixing follow this one rule
  through the shared wrap-up; no path keeps a separate unconditional
  requirement or a separate exception.
- *Required restriction — whole-product reach (Terry, 2026-11-04).*
  Proportionality governs only whether a pass is triggered. A triggered pass
  examines and may edit the implicated concepts wherever they live in the
  product, under ADR 0002's whole-product focus and the refactor skill's
  existing discovery and cross-subsystem gate; the rule never limits a pass
  to the story's files, the slice's files or the repair's file.
- *Required restriction — uncertainty keeps the pass.* The fresh pass is the
  only independent review of a change's product residue, and about half of
  the retained small code passes made useful edits. A classification the
  coordinator cannot support from the return it names is not a waiver.
- *Scope limits.* Do not change the refactor checks, file-size policy, the
  cross-subsystem gate, proof acceptance, or the retrospective. Add no token
  or duration measurement tooling and no new script; the evaluation reports
  avoided turns from retained records with their limits. Independent review
  of records-only text for citation correctness stays with the coordinator's
  acceptance review against the source, not with this rule.

**Key examples:**

- Plan-only waiver slice (Doughnut plan 080 slices 1–2; Open Dough plan 427
  slice 1): the diff touches only `PLAN.md` → delivery records `records-only`
  → no agent is spawned, the commit and publication proceed.
- A slice's accepted refactor return traced one spec and its helper; CI
  fails on a few-line change inside one function of that spec, the shape of
  the Clipboard SEED-001#portable-text repairs → the repair's changed concept
  lies within that return → delivery records the disposition naming that
  return and commits without an agent.
- A CI repair adds a new helper, or edits a probe script the accepted return
  never traced → not already-traced → the fresh full pass runs, and it may
  edit the helper's concept wherever it is represented across the product.
- A slice adds a product module → the fresh full pass runs as today.
- A records-only increment whose new seed text cites code locations (Open
  Dough plan 200 slice 4) → `records-only` disposition, no agent; the
  coordinator's acceptance review against the source owns the citations.
- Two already-traced repairs were recorded since slice 4's pass; slice 5
  changes product code → slice 5's refactor handoff lists both dispositions
  → the fresh pass traces the repaired concepts along with slice 5's change.
- The coordinator cannot tell whether a repair's changed concept was traced by
  the return it would name → the fresh full pass runs.

**Explored alternatives:** A fresh agent with an early-return triage keeps
independence but still pays the context reading that makes up the cost
(about 50k tokens before the first edit decision). A coordinator-run check
without a fresh agent loses the independent reading that found the retained
residue. Deferring every small change to the next slice's pass is kept only
as the dispositions-feed-the-next-pass behavior above, so no change goes
permanently unreviewed. Changing nothing keeps paying the no-op turns.

**Evaluation:** Replay retained no-op cases (Doughnut plan 080 slices 1–2,
Clipboard SEED-001#portable-text repairs, Pygardon plan 482 slices 6–8) and at
least one retained pass that found real residue (Pygardon plan 431 slice 2's
extracted generation, or Open Dough plan 200 slice 4 as the records-only
trade-off), confirming the rule still requires that pass or names the
trade-off. Report agent turns and
tokens avoided in replay with their limits. At closure, record the actual
response revision and first containing release (or explicitly unreleased
status) at ODF-141 and ODF-276; later ordinary use remains a separate
observation.


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
