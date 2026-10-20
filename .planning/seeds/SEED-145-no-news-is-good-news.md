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

<a id="quiet-preparation-chain"></a>

### 2. Finish the chained preparation journey silently when no developer action remains

**Identity:** SEED-145#quiet-preparation-chain
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/332-quiet-preparation-chain/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"91613c03d198c6e5467aadc7b791289fc4ce002d599d4e0ba78aeb4491a4df21","plan":"b9c03de0b33cf65adb43017fb35cbe41543f545f3aa159e4366a9c2b416f8726"}}
```

**For / why:** A developer preparing a story should not receive successive
success reports from three skills that already form one automatic journey.

**Goal:** Story Refinement, Slice Planning, and Slice-plan Refinement complete
their authorized preparation quietly when no developer decision or action is
needed, including when they run as one chain. The developer can trust ordinary
preparation to finish without reading or acknowledging successive success reports.

**Scope — required behavior:**

- Apply one attention judgment across the three skills and their shared
  preparation journey. Continue authorized refinement, planning, any necessary
  plan refinement, and landing without intermediate ready announcements,
  no-concern reports, slice or next-step recaps, or success-only final banners.
  Give no success response where the host permits it; otherwise use its minimum
  native response without a product-mandated recap.
- Keep evaluating each story independently, reviewing slice boundaries and
  proof, and recording refinement, approach, plan association, readiness and its
  reasons through their current owners. Quietness changes communication, not
  those judgments, records, or the criteria that justify them.
- Preserve direct invocations of each skill, the automatic chain, existing
  one-shot dispositions, explicit `--refine-only`, `--retain`, no-publish,
  and requested-detail boundaries. A retained result or review stop supplies
  its location and the concrete next action needed to continue. A refine-only
  stop does not silently plan or land. Do not introduce a new acknowledgement
  or approval when the invocation already authorizes continuing.
- Surface an unresolved goal, scope or constraint choice, missing required
  context, resplit recommendation, blocked write/recording, or failed landing
  with the expected response, consequence, and responsible person when known.
  A recorded assessment alone does not decide whether attention is needed:
  `not-ready` reasons bounded by an authorized early probe can still form a
  completed preparation, while an unresolved human-owned decision cannot.
- At a completed landing, use the existing closure attention rule and supplied
  dashboard reporting operation. Quiet success sends `completed` without a
  message and waits for its receipt; a retained or stopped preparation uses
  the exact attention message and its existing `unfinished` disposition.
  Direct use without launch context makes no dashboard contact. Retry failed
  reporting without repeating accepted Git publication or retirement.
- Preserve assignment ownership, release staging, publication/refresh/retirement
  gates, and same-session execution handoff. Preparation grants no Take or
  execution authority; a separately authorized handoff continues without a
  premature session-completion report.

**Key examples:**

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| A clear queued story has an established preparation and no open question | Refine it with ordinary continuation | The same workspace carries the refined story, plan, any necessary plan refinement, recorded assessment and assignment release through authorized landing; no intermediate or final routine success report or acknowledgement task |
| A queued story already has a refined seed, or an existing plan needs in-scope boundary changes | Invoke Slice Planning or Slice-plan Refinement directly | The selected plan and assessment are updated and their authorized disposition completes under the same quiet rule; no compulsory plan summary, no-concerns statement or success marker |
| A one-shot refinement explicitly selects automatic landing and reaches its existing ready outcome | Its own refinement journey finishes | It lands quietly through that journey; it does not acquire ordinary chained planning or a new approval |
| The developer selects refine-only, retain-for-review, no-publish, or one-shot review | The selected boundary is reached | Preserve that boundary and give the retained result's location and required next action; Preparing remains visible when an assignment exists, and no omitted keep or execution authority is invented |
| A scope decision, missing input, required resplit response, blocked recording, or failed publication prevents completion | Preparation reaches the affected operation | Identify what is needed, who can supply it and what resumes; retain the draft and assignment under existing recovery rules instead of claiming quiet completion |
| A plan has recorded concerns whose next observations are fully assigned to authorized early probes, with no response needed now | Preparation records its assessment and finishes its authorized landing | Keep the concerns and assessment in the plan and canonical record; their existence alone does not create an attention message or authorize execution |
| A dashboard-started preparation has landed and its required cleanup has settled | Final reporting | Submit quiet `completed` and receive the matching receipt; silence, process exit and markers establish no success. A reporting failure retries only that submission |
| A separate execution instruction arrives while preparation is unlanded | The existing same-session handoff applies | Preserve its readiness/authority checks, land and claim in the same workspace, and leave completion reporting to the continuing workflow |
| The developer explicitly requests the plan or architecture findings | Preparation reaches the requested reporting point | Supply the requested information even when the work otherwise succeeds quietly |

**Architecture:** The consequential concern is ownership of attention across
composed skills. Keep the preparation journey as the owner of preparation
continuation and disposition, and reuse the existing
[completion-attention rule](../../src/skills/dough-land/references/completion-attention.md)
for settled closure. Align the three skill entry points and their linked
options/disposition text; a final-only suppression would leave intermediate
reports active. Reuse the existing outcome/message/receipt protocol instead of
adding a dashboard message filter, attention schema or preparation status.
Readiness, queued/Taken membership, publication evidence and local session Done
remain distinct facts, as required by
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and the existing
[North Star: agent launch](../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one shared behavioral owner and project-relative runtime instructions;
[ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md) preserves human
decision ownership. Author changes in `src/skills/` under
[ADR 0003 — Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md);
leave installed managed copies to a released update.
[Maintainer guidance](../../AGENTS.md) and
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
require representative behavior review and truthful separation of deterministic
checks from native evidence. No Accepted ADR conflict, new ADR or new North Star
topic is needed.

**Deferred promises:** Execution/retrospective reporting, prominent attention
styling, and automatic execution-to-wrap-up continuation remain with stories
3–4. This story commits to no dashboard redesign, new protocol, release rollout,
or installation/discovery change. Story 1 owns general Land/Wrap Up quiet
closure; reuse and reconcile its shared rule without imposing a blocking
dependency merely because the files overlap.

**Rejection constraints:** Existing missing-context, human decision, ownership,
publication and execution-authority rules remain binding. Quietness never
justifies bypassing them, treating a missing receipt as success, or overriding
an explicit stop. The examples add no new rejection policy.

**Plan:** [Quiet preparation chain](../slice-plans/332-quiet-preparation-chain/PLAN.md).

**Value / learning:** Make the preparation chain one quiet outcome rather than
several reporting events, without hiding the questions that genuinely block it.

**Safe stopping point:** Preparation becomes quieter without changing execution
authority or requiring automatic execution. Shared closure behavior can be reused
from story 1; shared files alone create no blocking dependency.

<a id="quiet-execution-and-retrospective"></a>

### 3. Keep retrospective and execution completion quiet and make required attention unmistakable

**Identity:** SEED-145#quiet-execution-and-retrospective
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A developer should notice a real finding or required response
immediately instead of searching through successful slice and review summaries.

**Goal:** Execution Retrospective and Execute Plan's completion handoff produce
no routine success report, while findings, improvements, and other outstanding
actions needing developer attention are conspicuous and easy to recognize.

**Scope:** Cover standalone and automatically invoked retrospective reporting,
the end of planned execution, and their combined final handoff. Preserve judged
proof, execution-complete records, process findings, correction plans, product
advice, and applicable CI/shutdown receipts. Remove successful slice summaries,
no-findings reports, routine advice/no-change recaps, and success-only banners.
Use a consistent, prominent developer-attention marker, building on the existing
`DEVELOPER ATTENTION REQUIRED` framing. State the issue, consequence, expected
action or decision, and relevant record links without burying them in successes.

**Evaluation:** An execution and final retrospective with no outstanding attention
need finish without a success summary. An improvement plan or product suggestion
whose adoption needs judgment, an unresolved finding, a failed required check,
or missing required evidence produces a loud marked message with an actionable
response. Merely recording a finding or completing a disposition under existing
rules does not create a new human task. Multiple reviews do not produce duplicate
attention reports or conceal an unresolved item behind a later success.

**Value / learning:** Restore a useful signal: visible exceptional completion
messages mean the developer has something to attend to.

**Safe stopping point:** Quiet handoff and unmistakable exceptions are useful even
while execution still stops before wrap-up. This story does not itself authorize
automatic closure or execution of a suggested improvement.

<a id="continue-execution-into-wrap-up"></a>

### 4. Continue successful execution into wrap-up when no human judgment remains

**Identity:** SEED-145#continue-execution-into-wrap-up
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A developer should not have to return just to instruct wrap-up
after execution and retrospective have already settled every required choice.

**Goal:** Successful plan execution proceeds into Story Wrap Up in the same
authorized journey when no human judgment remains, including when the final
retrospective produced findings whose dispositions are already decisive.

**Scope:** Replace the mandatory execution-to-wrap-up handoff with continuation
under the existing project's authority and closure rules. Evaluate improvement
plans, process findings, and product advice together; their presence alone does
not require a pause. Apply already authorized dispositions, then continue into
wrap-up without a routine execution summary or a confirmation question. Final
quiet completion occurs only after wrap-up's actual integration, CI/shutdown,
history cleanup, branch/worktree retirement, and reporting duties settle.

**Evaluation:**

- No findings and all required execution/review gates passed -> invoke wrap-up
  automatically and finish quietly after its gates pass.
- A valid retrospective correction must be queued under the existing rule,
  process findings must be recorded, and product advice has an evidence-backed
  disposition within delegated authority -> apply those dispositions and finish
  wrap-up without asking merely because findings exist. Do not execute the
  queued correction as part of this continuation.
- Whether to adopt an improvement or product suggestion is unclear, or a
  constraint, ownership, permission, or product choice requires human judgment
  -> stop with the prominent developer-attention message. Preserve the workspace,
  terminal continuation, proof, and context needed to answer and resume; do not
  retire resources needed by unfinished work.
- A required CI, publication, or retirement step fails or remains unconfirmed ->
  preserve its recovery path, report the real exception, and claim no successful
  closure. A skipped optional review alone creates no new decision requirement.

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
These queued stories are not marked refined, ready, or Taken by their selection.

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
