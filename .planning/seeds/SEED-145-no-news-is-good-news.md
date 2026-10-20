---
id: SEED-145
status: active
planted: 2026-10-20
planted_during: Maintainer review of noisy completed Doughnut and Open Dough sessions
trigger_when: Successful preparation, execution, review, or closure still interrupts the developer without a required decision or action
scope: unknown
---

# SEED-145: No news is good news across preparation and completion

## Why This Matters

For developers using Open Dough, work that succeeds according to its plan and
the project's rules should finish without a message to read or acknowledge.
Routine recaps and reminders obscure the exceptional results that need human
attention and make completed work look unfinished.

Two completed Claude Code sessions exposed this problem on 2026-10-20:

- Doughnut's `SEED-079#story-1`, session
  `31d67e46-0112-42fb-b3dd-11a9358492f5`, landed at `3f971a4`.
- Open Dough's `SEED-144#recognize-opendough-by-its-icon`, session
  `7040b8e6-24ed-4ad8-901d-ced809146892`, landed at `8061b89`.

Both passed target CI and verified removal of the worktree, local branch, and
remote execution branch. Their completion reports nevertheless recapped success,
listed finding IDs or already managed follow-ups, and left the sessions awaiting
acknowledgement. The read-only report also described each retired workspace as
missing. Investigation verified successful cleanup in both cases; these examples
do not establish a failed retirement or premature loss of the terminal.

The earlier campaign delivered quiet Land/Wrap Up completion in
`SEED-008#installed-story-branch-integration` (plan 220), and reduced refinement
reporting in `SEED-085#quiet-refinement-outcomes` (plan 223). The refinement work
explicitly deferred slice-planning and slice-plan-refinement reporting. Later
closure guidance made recorded finding IDs into reminders and required a
completion/landing statement after retirement. This campaign revisits the actual
end-to-end behavior rather than merely repeating the earlier silence instruction.

## Alternatives and Decision

Terry selected four stories in the order below. Manually marking each session
done or ignoring success recaps leaves the interruption cost with the developer.
Suppressing every message would also conceal genuine exceptions and decisions.
The selected rule is to keep routine success quiet, preserve the evidence, and
make outstanding developer attention unmistakable.

Shared boundaries:

- Successful routine completion produces no visible success recap, slice summary,
  no-findings report, completion banner, or acknowledgement request. Machine
  receipts, proof, findings, plans, and recovery evidence remain available in
  their existing operational or maintained homes. Silence is never proof of
  success and never relaxes a required gate.
- A recorded process finding, recovery SHA, routine cleanup result, or follow-up
  already settled under the project's rules is not by itself a reason to demand
  attention. An unresolved improvement, suggested improvement, exception, or
  required developer action is a reason to demand attention.
- A choice is settled only when evidence and existing delegated authority support
  its disposition. Confidence that a choice is obvious cannot replace a
  human-owned product, constraint, architectural, or authorization decision.
- Cover direct and dashboard-started use on Codex, Cursor, and Claude Code as
  applicable, with shared behavior and the smallest necessary host adaptation.
  Explicit requests for details or a review stop still receive the information
  needed for that requested action. Do not quietly override an explicit stop,
  retain-for-review choice, or omitted review preference.

## Story Decomposition

<a id="continue-execution-into-wrap-up"></a>

### 4. Continue successful execution into wrap-up when no human judgment remains

**Identity:** SEED-145#continue-execution-into-wrap-up
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/333-continue-execution-into-wrap-up/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"deeb8530304a01981a95d3f8218947ae8b24b95427d14741409f37ffbba9a747","plan":"d4709f21e24f7f1e4efca25c00b5e142f11936ae5e238874d27fc7e6beb2a7d4"}}
```

**For / why:** A developer should not have to return just to instruct wrap-up
after execution and retrospective have already settled every required choice.

**Goal:** Successful planned execution proceeds into Story Wrap Up in the same
authorized journey when no human judgment remains, including when retrospective
findings have dispositions settled by existing rules or explicit human direction.
The developer need not return merely to request closure.

**Scope:** Replace the mandatory planned execution-to-wrap-up handoff with
conditional continuation for the selected work, including a quick attempt that
continued into planned execution. After required implementation, proof, delivery,
selected review and execution-completion duties settle, determine whether closure
can proceed under the established authority and project rules. When it can,
invoke Story Wrap Up in the same session and workspace with the retained story,
plan, proof, review results, execution identity, publication target and dashboard
context. Do not ask for another wrap-up instruction or emit a routine execution
summary between the two workflows.

Evaluate process findings, retrospective correction plans and product advice
together. A recorded finding or valid correction is not by itself an unresolved
choice: apply its existing authorized disposition through the owning workflow.
In particular, wrap-up queues a valid correction first by default, preserves its
active records and leaves its execution for later. Compatible product changes
need existing delegated authority or explicit human direction; an evidence-backed
recommendation alone cannot supply that authority. Do not require queueing before
invoking the workflow that owns it, duplicate its disposition rules, or infer
permission to drop a finding.

Retain the existing closure responsibilities: assimilation of lasting knowledge,
follow-up disposition, authorized product decisions, recoverable cleanup,
publication/integration, applicable CI and shutdown, assignment completion and
safe resource retirement. Preserve the selected mode and publication authority;
local-only or no-push instructions stay effective. Final quiet completion occurs
only after all duties applicable to that closure actually settle, including the
final supplied dashboard report and matching receipt. Direct use makes no
dashboard contact. A quiet execution boundary submits no premature completion
report; execution success alone does not mark the story or session Done.

A human-owned product, constraint, ownership or permission decision; missing
required context; explicit review/retain/stop instruction; unfinished required
review; or failed/unconfirmed required operation stops the dependent continuation
or closure. Use the shared prominent `DEVELOPER ATTENTION REQUIRED` response with
the specific issue, consequence, expected response or recovery action and relevant
evidence. Preserve the workspace, resumable session, proof and active records
needed for resolution. Recovery continues from the first unfinished operation
without repeating accepted publication, completed review or settled dispositions.
An explicitly skipped optional review alone creates no new question. Requested
details remain available and do not by themselves impose a review stop.

**Deferred promises:** Do not execute queued corrections, adopt unapproved product
suggestions, broaden automatic retrospective selection, or change wholly planless
execution's separate completion journey. Preserve the explicitly selected
background-CI handoff while its required completion remains pending. This story
consumes the earlier quiet/attention behavior; it adds no dashboard session model,
new publication/CI mechanism or release/rollout. Native behavioral acceptance is
tracked separately under ADR 0005.

**Key examples:**

1. All planned slices are delivered, the selected retrospective finds no open
   choice, and applicable execution completion/CI/shutdown gates pass → invoke
   wrap-up immediately with the same execution context. After its closure gates
   pass, finish quietly without an intermediate recap or confirmation.
2. The retrospective produced a valid bounded correction, a recorded process
   finding and a product reorder already authorized by the developer → continue;
   wrap-up queues the correction first once, applies the compatible reorder,
   preserves the finding and active follow-up, and closes only the selected
   predecessor. Do not execute the correction or pause merely because it exists.
3. Correction input is incomplete, product advice needs an adoption decision,
   or cleanup conflicts with a human-owned architectural constraint → identify
   the missing field or decision and stop before the affected disposition or
   deletion. Keep the active context available; a later green CI result does not
   settle the choice.
4. The developer explicitly skips the automatic retrospective and every other
   duty passes → record the skip and continue into wrap-up. An explicit request
   to stop for review or retain the workspace instead keeps that stop effective;
   no automatic closure overrides it.
5. A required execution or closure check fails, publication is unconfirmed,
   shutdown is missing, or retirement is held → report the actual unfinished
   step and preserve its recovery path. Resume that step once resolved, without
   treating an accepted earlier publication as failed or repeating it.
6. A dashboard-started execution has no outstanding attention → submit nothing
   at the execution handoff, carry the supplied launch/reporting context through
   wrap-up, and submit quiet completion only as its final operation after
   required closure and retirement. A direct invocation follows the same closure
   rules without dashboard contact. A genuine stop uses the existing exact-message
   reporting and receipt contract and preserves resumability.
7. Wholly planless execution, an expressly retained review boundary, or the
   supported explicit background-CI alternative reaches its existing handoff →
   preserve that journey and its resources. Automatic planned continuation
   cannot turn a pending receipt or absent permission into successful closure.

**Value / learning:** Remove the remaining manual completion round trip without
treating agent confidence as human authorization.

**Safe stopping point:** The completed journey closes only the selected work.
Human judgment, explicit review stops, missing authority, and required recovery
remain effective stops; queued improvements keep their own later execution.

## Ordering and Scope Reduction

These are the top four queued stories in the exact order Terry requested on
2026-10-20. Preserve existing Taken work, near-future direction, and the relative
order of all previous backlog entries. Each story is independently evaluable;
queue order is not a technical blocking dependency. Story 4 consumes the settled
quiet/attention behavior of the earlier work in the intended delivery sequence.
If investment is reduced, defer automatic continuation first and retain the
quiet completed steps and conspicuous unresolved exceptions already delivered.

**Effort hypotheses:** Unassigned. The project has no defined S/M/L bands; no
estimates or executable slice plans are invented by this queueing request.
Refinement can resolve sizing and any actual prerequisite with evidence.

## Open Decisions

No story-selection or priority decision remains from the supplied instruction.
Detailed behavior and implementation planning remain for each story's refinement.
Selection alone does not mark a queued story refined, ready, or Taken; each
story's preparation records carry those separate facts.

## When to Surface

Start with the next queued work, or when a developer must read a routine success
report, acknowledge already settled findings, or manually request wrap-up despite
having no decision left to make.

## Breadcrumbs

- Terry's 2026-10-20 review of the two supplied completed sessions and explicit
  instruction to queue these four stories, directly on main and synchronized
  with origin.
- Previous closure campaign: `b69852ae`, `4ef5e2e7`, closed by `9bc2cc7f`;
  previous refinement campaign: `4a18ccbe`, `5a5d9768`, closed by `c4199492`.
  Reminder expansion: `1be19216`; retired-session response: `3ea6f507`.
- [Shared completion attention](../../src/skills/dough-land/references/completion-attention.md),
  [preparation journey](../../src/skills/dough-story-refinement/references/preparation-journey.md),
  [execution completion](../../src/skills/dough-execute-plan/references/finish-or-stop.md),
  and [retrospective](../../src/skills/dough-execution-retrospective/SKILL.md).
- Preserve the completed
  [execution-terminal-until-wrap-up outcome](../done/SEED-142_keep-execution-terminal-until-wrap-up.json)
  for a session that genuinely awaits judgment.
- [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) and
  [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  preserve human decision ownership; this campaign does not change their status.
- [Maintainer guidance](../../AGENTS.md) and
  [product backlog](../PRODUCT-BACKLOG.md).
