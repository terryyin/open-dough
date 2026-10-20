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

The maintained [shared-feedback skill](../../.agents/skills/collect-client-feedback/SKILL.md)
and [combined feedback cycle](../../.agents/skills/maintain-feedback-cycle/SKILL.md)
own explicit maintenance-cycle selection. Reassess this candidate
against those behaviors: only a remaining need for recurring
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

<a id="format-owned-changes"></a>

### 12. Format only the owned change during delivery

**Identity:** SEED-010#format-owned-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/325-format-owned-changes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"23fdc4ef4387f00ba97a6332455fa7255c0090b1b7ae2101737a499f12916cba","plan":"55da46366012b474cb85cac0ca3aa00671a26f26ed0dc0ea2db1f7e03f9a7114"}}
```

**Goal:** An Open Dough contributor, or the agent coordinating a slice delivery,
formats and rechecks only the files the current change touched. A Markdown-only
or planning-only delivery finishes its formatting step in seconds, and a code
change waits only for its own files. This keeps the per-slice transaction cost
low enough for small deliveries, as [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
asks, and closes the DD-309 response loop with measured evidence rather than an
extrapolated saving.

**Evidence:** [Project-owned DD-309](../../docs/maintainer/project-test-findings.md#dd-309)
records seven executions; one reports about 5–10 minutes per slice under heavy
load, while later executions establish repeated scope cost without an unloaded
timing estimate.

**Investigation (2026-10-20, this worktree at `37e50618`):**

- Fact: `npm run format` runs `scripts/lint.mjs --fix`, which lists every
  tracked and untracked non-ignored path (`git ls-files --cached --others
  --exclude-standard -z`) and passes the eligible ones to ESLint, Prettier,
  ShellCheck and shfmt; `--fix --staged` is refused. Source: `scripts/lint.mjs`.
- Fact: that listing holds 3,459 paths here, of which 2,329 are script files,
  136 JSON and 270 shell by extension; shell files are checked one process pair
  at a time. Source: `git ls-files` counts in this worktree.
- Fact: Markdown is in no formatter selection, and `.planning/` is ignored by
  both ESLint and Prettier, so a Markdown-only or planning-only change can never
  produce a formatter edit; today it still pays the whole-tree run. Source:
  `scripts/lint.mjs`, `eslint.ignores.mjs`, `.prettierignore`.
- Fact: the delivery workflow asks the coordinator to run "this project's
  selective formatting command directly once; let it select affected
  components, including a planning-only no-op", and the hook pointer and
  developer docs name `npm run format`. Source:
  `src/skills/dough-execute-plan/references/wrap-up.md` step 4,
  `.githooks/pre-commit`, `docs/installation-platforms-and-update-safety.md`.
- Observed: on this clean worktree, `npm run format` took 98.7 s wall
  (114 s user) at load average 11–13 with another worktree's whole-tree
  Prettier check running concurrently, and changed no file. The hook's
  selective check with nothing staged (`npm run lint -- --staged`) took 0.15 s
  and needed no tool. Unloaded duration remains unmeasured; the saving on a
  loaded host is the whole run minus the owned files' share.
- Hypothesis left open for execution's evaluation: how long the selective
  command takes on representative code changes. It is bounded above by the
  full run and is measured, not extrapolated, in the Evaluation below.
- Boundary assumption: Git cannot tell which dirty file belongs to which
  writer. "Owned change" therefore means every path whose content differs from
  `HEAD`, staged or unstaged, plus untracked non-ignored files. In a checkout
  that also holds another writer's unformatted eligible edits, they are
  selected too, as the full-tree command already does today; narrowing to an
  explicit path list is deferred, not rejected.

**Scope:**

- `npm run format` selects the change set: tracked files whose index or
  working-tree content differs from `HEAD`, plus untracked files Git does not
  ignore. Deleted paths are skipped, filenames containing spaces survive the
  NUL-separated listing, and the existing ESLint and Prettier ignore lists drop
  files before any tool runs, so a change touching only ignored or ineligible
  files runs no tool, succeeds in a worktree without `node_modules`, and still
  exits 0. After the fixes, the same selection is checked again, exactly as the
  full run does today, and remaining findings fail the command.
- Full-tree formatting stays available under an explicit option on the same
  entry; `npm run lint` and CI stay full-tree check-only; the pre-commit hook
  stays `lint --staged` check-only with its `npm run format` pointer.
- The developer documentation describes the selection so that the delivery
  workflow's "selective formatting command" resolves to this entry without
  changing released guidance or installed copies.
- Deferred promises: Markdown formatting, which no tool performs today; an
  explicit path-list argument; a measured unloaded speedup claim; changes to
  shared or released guidance, installed skill copies, or unrelated files.

**Key examples:**

1. A clean worktree holds an edited seed under `.planning/` and a new Markdown
   doc under `docs/`. `npm run format` lists both paths, drops both before any
   tool is chosen, runs no ESLint, Prettier, ShellCheck or shfmt, prints no
   unrelated path, and exits 0 within seconds, including in a worktree without
   `node_modules`.
2. One tracked script is edited with formatting drift and one new eligible test
   file is untracked; everything else is unchanged. `npm run format` rewrites
   exactly those two files, prints no unrelated path, and leaves every other
   file byte-identical. Running it again changes nothing.
3. A tracked shell script is deleted in the working tree and a new
   `fixtures/with space.mjs` is added. `npm run format` skips the deleted path
   without an error and formats the file whose name contains a space.
4. A changed script still has an ESLint finding no fix resolves. `npm run
   format` reports "Format failed" with that finding and exits 1, as today.
5. A developer stages an unformatted eligible file and commits. The hook
   refuses the commit with the finding and the `npm run format` pointer, and
   changes neither the file nor the index.
6. The explicit full-tree option formats and rechecks every tracked and
   untracked eligible file, as `npm run format` does today, and `npm run lint`
   in CI still checks the whole tree.

**Evaluation:** On bounded representative changes (Markdown-only, one changed
script plus one new eligible file, one shell script), compare the paths listed
and bytes changed with the pre-change command, and report actual wall time with
the load average for both, without extrapolating a speedup. Preserve lint and
format confidence through the existing lint and hook tests plus focused tests of
the selection. On completion update DD-309 with the actual response, the
repository revision, any containing release and the outcome evidence; queueing
alone resolves nothing.

**Effort hypothesis:** S — a selection change in one script, its tests, a
documentation paragraph and the DD-309 update; no sibling story is a
prerequisite.

## Ordering and Scope Reduction

Queue the next five outcomes in this order: Story 4 (response effectiveness),
Story 6 (preparation evidence), Story 7 (unreviewed execution/completion paths),
Story 8 (later product consequences), and Story 9
(automatic due maintenance). Story numbers and recorded identities remain stable;
the product backlog is the authority for current queue order and membership.

The remaining stories evaluate broader response effectiveness and tradeoffs. The two
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

## Open Decisions

These are refinement inputs, not reasons to invent implementation or delay the
requested queue update:

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
