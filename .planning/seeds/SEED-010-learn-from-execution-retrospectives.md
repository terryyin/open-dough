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

<a id="source-review-record-lifecycle"></a>

### Keep the source-review record consistent through its lifecycle

**Identity:** SEED-010#source-review-record-lifecycle
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/356-source-review-record-lifecycle/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2ea326d0d15692156a0b718859b2680f6a911c9653de10d8aa0e43d68f9ed29e","plan":"a41401a80ca592e80dbb7942b65857bf2c334ebbf4c6cb5b6e5c71de40c853bb"}}
```

**Goal:** A coordinator using the linked source-review record gets one
consistent rule for when to link, allocate and observe commitments, and a gate
that refuses a skipped or mislinked record, so the comparison delivered by
SEED-010#accept-source-promises-after-plan-drift cannot be bypassed by omission
or blocked before its first acceptance.

**Scope:** Retrospective correction of plan 354; the
[correction plan](../slice-plans/356-source-review-record-lifecycle/PLAN.md)
holds the findings, preserved promises and proof. No new feature promise.

<a id="refresh-human-amendments-before-completion"></a>

### Keep human amendments visible before Story Branch completion

**Identity:** SEED-010#refresh-human-amendments-before-completion
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/355-refresh-human-amendments-before-completion/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"959458c1ff27279e69f3f1970333d1bae78a7c4516bbf30a78d6f3558338919d","plan":"f4844b9aa047685cd32706ef605b3c476bd4ec488fe5974c16ba564db452e8df"}}
```

Refined 2026-10-25 from [ODF-354](../../docs/maintainer/findings/ODF-354.md)
(Pygardon plan 411: the owner amended the Taken story and its plan on `main`
at `4e5551fb6` while execution ran on its story branch; nothing compared the
branch's copy with trunk until closure integration conflicted, after which a
closure commit was reverted and a semantic merge and three more slices
followed) and the current Story Branch contract: the Take publishes the claim
on trunk and an execution branch at that Take
([Take or admit work](../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work));
every increment pushes only to the remote execution branch
([publish an execution increment](../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-an-execution-increment-or-repair));
slice acceptance, the story-obligations checks and the execution-complete
record read the branch's copy of the story section and plan; wrap-up deletes
that copy; and trunk is read again only at
[Story Branch integration](../../src/skills/dough-story-wrap-up/references/story-branch-integration.md).
A fresh source-only review of the stale branch copy cannot see the amendment.

**Goal:** A developer who amends a Taken story section or its plan on trunk
during Story Branch execution has the amended text in front of the execution
coordinator at the next slice delivery, before the execution-complete record
and before wrap-up deletes the copy, while it is still cheap to absorb. A clean
amendment becomes the source the remaining work is accepted against; a
conflicting one is named and left with the human while independent delivered
work stays. The human's amendment is a Jidoka-style intervention that
execution notices in time, not a merge surprise at closure.

**Scope:**

Required behavior:

- One freshness check of two records, the selected story section and the
  active plan: it fetches the authorized remote trunk and compares trunk's
  current text of those records with the execution branch's copy, using the
  Take's published revision as the common base. Existing Git (fetch and a
  three-way comparison) and the existing canonical records (the seed section
  by its anchor, the plan by the Taken entry's link) are its only inputs.
- Three results: `unchanged` (trunk's two records equal the base),
  `amended` (trunk changed them and the change applies cleanly over the
  branch's own plan edits) and `conflict` (trunk's change and the branch's
  edits touch the same text, or the amendment removes or rewrites a slice the
  branch already marked done). Every result names the records compared and
  the trunk revision read; a changed result carries the changed text.
- In Story Branch Mode the check gates three existing boundaries: the slice's
  plan update and story-obligations check in
  [Deliver the change](../../src/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change)
  step 5, the
  [execution-complete record](../../src/skills/dough-execute-plan/references/finish-or-stop.md#record-execution-completion),
  and wrap-up's
  [deletion of spent history](../../src/skills/dough-story-wrap-up/SKILL.md#delete-spent-history-including-shared-records).
  Each slice boundary is included because ODF-354's cost came from
  discovering the amendment after the slices it affected were accepted.
- On `amended`, the coordinator reads the changed text, absorbs it into the
  branch's copy of the same two records as part of that increment's commit,
  preserving the author's text word for word, and applies the amended source
  through the existing acceptance rules: a new or changed promise is a
  returned commitment or receives a named remaining slice, an amended
  exclusion settles an obligation with its quote, and an added slice becomes
  remaining work under
  [plan refinement](../../src/skills/dough-story-refinement/references/planning.md#refine-the-active-plan).
  The gate accepts the boundary only once the branch copy matches trunk's
  text for those records.
- On `conflict`, the coordinator names the conflict with both texts and the
  trunk revision, delivers nothing that depends on it, and stops at the safe
  delivery boundary under
  [human judgment](../../src/skills/dough-execute-plan/references/execution-decisions.md#stop-for-human-judgment)
  with `awaiting story review`; independently delivered slices and their
  accepted proof stay, and nothing is written to trunk.
- A controlled replay of the ODF-354 shape (story and plan amended on trunk
  after the Take), a plan-only amendment, an unchanged source under unrelated
  trunk advance, and a conflicting amendment, credential-free first and then
  representative native rounds, developer-run, under ADR 0005.
- Completion records at ODF-354 the response revision, the containing release
  (pending unless evidenced), the replay outcomes per host with their limits,
  the added burden per boundary (one fetch and one comparison), the first
  ordinary-use criterion (the first Story Branch execution after adoption
  whose selected story section or plan is amended on remote trunk after its
  Take), and the avoided late repair it is judged against under ADR 0010,
  with no effectiveness or saving claim.

Rejection constraints:

- The check never overwrites. The branch copy changes only by a clean
  application of trunk's text, the check writes nothing to trunk, and a
  conflict is resolved by a person.
  [Accept proof](../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
  records that the source and human amendments outrank plan and return, and
  [planning](../../src/skills/dough-story-refinement/references/planning.md)
  that a plan does not decide story scope; an automatic resolution would
  decide scope.
- The check compares the selected story section and the active plan only and
  merges no other trunk content into the execution branch. Story Branch Mode
  publishes increments to the execution branch and integrates once at closure
  ([publish an execution increment](../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-an-execution-increment-or-repair)),
  so a whole-trunk merge would change the mode.
- No second authority store. Trunk's canonical home stays the authority; the
  branch copy and the plan's existing obligation records hold the absorbed
  amendment.
  [Record preparation facts](../../src/skills/dough-product-backlog/references/record-preparation.md)
  forbids a parallel state file and
  [story obligations](../../src/skills/dough-execute-plan/references/story-obligations.md)
  a second promise registry.
- The developer's default checkout, its branch and working tree, is not
  touched: the check reads fetched remote refs, as
  [preserve pending local work](../../src/skills/dough-execute-plan/references/maintain-default-checkout.md#preserve-pending-local-work)
  requires.

Deferred promises, not built or verified here: Trunk Mode, whose increment
publication rebases the owned suffix onto fetched trunk so an amendment
arrives at the next increment, and whose own gap, if any, is a separate
observation; amendments the developer has not published to remote trunk
(uncommitted edits or commits on a local branch); amendments to other records
(sibling stories, ADRs, `DearDough.md`, product code); notifying the developer
when they amend; a semantic drift detector beyond the textual comparison and
the existing acceptance rules; rerunning the source-only review for process
alone; release or cross-project rollout; any compliance or rate claim.

Boundary assumptions: the executing coordinator reads and judges the result;
the Take's published revision is the base; amendments are commits on the
remote trunk; the story section is addressable by its anchor and the plan by
the Taken entry's link; one fetch and comparison per boundary is a
proportionate burden under ADR 0010; native rounds are paid and developer-run.

**Key examples:**

1. *Story and plan amended after the Take (ODF-354 replay).* A Taken Story
   Branch is delivering slice 3; the developer commits on trunk a new
   Decision-binding promise and example 11 in the story section and a new
   slice 9 in the plan → slice 3's delivery reaches the freshness gate →
   `amended` with the changed text; the coordinator absorbs it into the
   branch copy, dispositions the new promise as receiving slice 9, or as a
   return when slice 3's output already owes it, and continues; the
   execution-complete record later requires slice 9 done.
2. *Plan-only amendment.* The developer tightens slice 6's proof wording on
   trunk while slice 4 is in progress and the branch has marked slices 1–3
   done → the gate at slice 4 → `amended`; the base-to-trunk change applies
   over the branch's status edits; slice 6 carries the new proof; no story
   text changed and no obligation is created.
3. *Unchanged source under unrelated trunk advance.* Trunk gained two other
   stories' closures, a release and an edit to a sibling story in the same
   seed → the gate → `unchanged` for the selected section and plan; nothing
   is merged; delivery continues with only the fetch and comparison added.
4. *Conflict.* The developer rewrote slice 2's behavior on trunk after the
   branch marked slice 2 done and recorded its proof → the gate → `conflict`
   naming slice 2, both texts and the trunk revision; the coordinator stops
   at the delivery boundary with `awaiting story review`; delivered slices
   stay; the developer decides whether to keep the delivered behavior, reopen
   slice 2 or amend again; after the decision the gate reruns and passes.
5. *Late amendment before the execution-complete record.* Every slice is
   done; the developer amended the story on trunk during the last slice's
   CI wait → the execution-complete gate → `amended`; the record is not
   written until the amendment is absorbed and its promise has a disposition,
   which may reopen remaining work; wrap-up then finds `unchanged` and
   deletes.
6. *Amendment between completion and deletion.* The developer amends the
   plan on trunk after the execution-complete record is published → wrap-up's
   deletion gate → `amended`; wrap-up deletes nothing, the coordinator
   absorbs the amendment and settles its promises under execution's rules,
   including moving the execution-complete record when work reopens, then
   re-enters wrap-up, which finds `unchanged`; closure neither reverts nor
   merges by hand.
7. *Baseline comparison.* Under the current guidance the ODF-354 replay is
   run once on the observed host: it reproduces integration conflicts in the
   seed and plan at closure, or records non-reproduction, which stops the
   dependent remedy and reassesses the plan.
8. *Completion record.* ODF-354 gains the assessment, the response revision,
   the replay outcomes per host with limits, the burden per boundary, the
   release state and the first-use criterion; it claims no effectiveness.

**Architecture:** No new concept. The start already reads the selected
published source from fetched trunk and refuses a resumed claim whose source
changed since its retained basis
([execution-start-source](../../src/skills/dough-execute-plan/scripts/execution-start-source.mjs));
the change gives that comparison a boundary command with the base above and
extends the existing delivery, completion and deletion gates to its result.
Published guidance and script edits live in `src/skills/dough-execute-plan/`
and `src/skills/dough-story-wrap-up/` under [AGENTS.md](../../AGENTS.md); ADR
0003 (release lifecycle), ADR 0005 (native proof per tool), ADR 0006
(executing-agent audience) and ADR 0010 (improvement judged against a stated
baseline) apply; no ADR exception or North Star topic is needed.

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
