# Continue successful execution into wrap-up

**Source:** [SEED-145#continue-execution-into-wrap-up](../../seeds/SEED-145-no-news-is-good-news.md#continue-execution-into-wrap-up)
**Identity:** SEED-145#continue-execution-into-wrap-up

## Goal and scope

After successful planned execution, continue into Story Wrap Up in the same
authorized journey when existing rules or explicit human direction settle all
remaining choices. Close the selected work without another instruction, a
routine execution recap or a confirmation question. Preserve real decisions,
explicit stops and failed or unconfirmed required operations as recoverable
attention boundaries.

Cover reviewed and explicitly skipped planned completion, including a quick
attempt that continued into planned execution, with the established execution
mode, workspace, identity, target, proof and reporting context. Valid corrections
use wrap-up's existing default queue disposition; product changes use existing
authority. Closure still owns assimilation, recovery commits, history cleanup,
backlog completion, integration/publication, applicable CI/shutdown and retirement.

Do not execute follow-ups, adopt suggestions without authority, change review
preferences, broaden wholly planless execution, override explicit background-CI
or review/retain stops, or redesign dashboard state and publication mechanics.
Local-only/no-push authority remains effective. Release and rollout are outside
this implementation story; native acceptance remains separate.

## Architecture and reuse

Follow [maintainer guidance](../../../AGENTS.md), Accepted
[ADR 0000 — human decision ownership](../../../docs/adrs/0000-use-adrs-accepted.md),
[ADR 0002 — lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0003 — release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005 — native acceptance](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
and [ADR 0006 — executing-agent guidance](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Their index and in-file statuses agree; this plan requires no exception.
The existing [agent-launch direction](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
separates session disposition from published work state. Preserve it; no new
North Star topic or architectural mechanism is needed.

PFE decision: change the existing execution continuation boundary and invoke the
existing closure owner. Keep one representation of each responsibility.

| Responsibility | Existing owner and use |
| --- | --- |
| Planned completion and onward transition | [Finish or stop](../../../src/skills/dough-execute-plan/references/finish-or-stop.md) owns selected review, completion-record publication and the execution completion operation. Replace its blanket no-wrap-up instruction with the conditional continuation. |
| Closure and required context | [Story Wrap Up](../../../src/skills/dough-story-wrap-up/SKILL.md) already consumes the selected work, proof, recorded product advice and execution identity. Admit the execution workflow's authorized invocation alongside an explicit coordinator invocation. |
| Correction disposition | [Follow-up disposition](../../../src/skills/dough-story-wrap-up/references/follow-up-disposition.md) validates and queues the canonical correction first without further approval; explicit human direction alone authorizes dropping it. Recognize that disposition before continuing, then let wrap-up apply it. |
| Product choices and review records | Wrap-up applies only authorized compatible changes. Retrospective retains its review/recording role and cannot mutate the backlog merely because continuation is possible. |
| Attention and reporting | [Completion attention](../../../src/skills/dough-land/references/completion-attention.md) and [dashboard completion](../../../src/skills/dough-land/references/dashboard-completion.md) already separate settled findings from open decisions and final reporting from execution handoff. Quiet output and a reporting receipt themselves grant no closure authority. |
| Publication, observation and retirement | Existing Trunk Mode closure and Story Branch integration own their respective final revisions, CI/shutdown receipts and resource gates. Reuse them without retargeting an execution observer or treating branch CI as trunk-integration proof. |

The earlier quiet-execution story owns response selection and obsolete banner
consumers. Its plan is recoverable as
`53c9758d:.planning/slice-plans/332-quiet-execution-and-retrospective/PLAN.md`.
This story consumes that behavior and owns the onward transition. Reconcile the
shared completion prose and checks against current trunk during execution.
Shared files do not justify a blocking story dependency under ADR 0002; there is
no new dependency agreement or duplicated attention implementation.

## Outside-in proof ownership

All promises belong to the single Behavior slice below. Guidance checks protect
instruction contracts; they are not observations of a native agent obeying them.

| Source examples / promise | Observable proof |
| --- | --- |
| 1, 4: reviewed or explicitly skipped planned execution continues without another instruction | Walk both branches through delivered slices → selected review/skip → published completion record → applicable completion receipt → same-context wrap-up. A focused continuation check must fail if the onward transition is removed or replaced by an unconditional stop. |
| 2: findings with settled dispositions do not force a pause | Walk a valid correction plus recorded finding plus explicitly authorized reorder. Wrap-up queues one canonical correction first, applies the compatible change and preserves active follow-up records without executing it. Existing default queue authority must not become an extra approval requirement. |
| 3, 4, 7: unresolved decisions and explicit stops remain effective | Walk missing correction input, an unapproved product suggestion, a human-owned constraint, an explicit retain/review stop, and pending background CI. Preserve the workspace/active records and the prominent issue/action response; no affected deletion or completion claim occurs. |
| 5: required operation failure stays recoverable | Preserve existing closure failure/gate proof. Walk execution success followed by closure publication/CI/shutdown/retirement failure; distinguish accepted earlier work from the first unfinished operation and do not report successful closure. |
| 6: quiet continuation reaches the final reporting owner | Trace supplied context from execution to wrap-up and its surviving reporting command. No quiet handoff submission; actual closure and required retirement precede final quiet submission and matching receipt. Direct use contacts no dashboard. Stop paths keep the exact-message attention receipt contract. |
| Preserved boundaries and cross-host behavior | AGENTS representative behavior review covers invocation, required project context and useful outcomes. Separate linked native acceptance observes actual continuation and genuine stops on affected Codex, Cursor and Claude Code paths with evidence or justified reuse per requirement. |

## Ordered slices

### 1. Continue settled planned execution through its existing closure workflow
Type: Behavior
Status: planned
Proof: Representative guidance walks and a discriminating continuation contract
check cover eligible and stopped branches; existing closure/reporting controls
preserve the applicable publication, CI/shutdown, retirement and receipt gates.
Linked native acceptance owns agent follow-through.

Behavior: Given delivered planned work whose selected review and required
execution-completion duties are settled, completing execution invokes Story Wrap
Up in the same session when established authority settles the remaining choices.
Wrap-up performs its existing dispositions and closure duties, then completes
quietly. A real decision, explicit stop, missing input or unfinished required
operation preserves the resources needed to resume and reports the exact action.

- Change the reviewed and skipped completion branches and the blanket retention
  instruction in `src/skills/dough-execute-plan/references/finish-or-stop.md`.
  Keep completion-record publication and the applicable completion operation
  before continuation. Change execution/closure descriptions or linked wording
  only where needed to make this invocation and authority coherent.
- Keep the continuation judgment with execution and closure duties with
  `dough-story-wrap-up`. Carry current identity, mode, target, proof, review and
  reporting context forward. Require no second worktree, Take, review or
  confirmation. Missing required context stops the affected path usefully.
- Judge whether correction and product dispositions are supported by the
  existing rules or explicit instruction. Do not require queueing before the
  workflow that owns it, duplicate that rule, or infer adoption/drop authority
  from confidence, silence, a ready badge or successful CI.
- Preserve explicit review/retain/stop instructions, selected review omissions,
  wholly planless completion and the explicit background alternative. Requested
  details remain available without inventing a new stop. Preserve local-only
  authority and distinguish local closure from remote publication.
- Reuse the earlier story's quiet/attention contract. On eligible continuation,
  execute no final execution response or quiet dashboard report between
  workflows. Wrap-up owns final completion after all applicable gates. When a
  genuine stop remains, preserve the workspace and terminal continuation and
  use the current attention/receipt handling.
- Review whole-journey recovery: no repeated accepted publication, completed
  review or duplicate correction queue entry. A later closure failure remains
  unfinished despite successful execution; retirement cannot erase resources
  still needed by an unresolved choice.
- Extend focused instruction checks beside Execute Plan to discriminate eligible
  continuation from blanket stop and unconditional closure. Preserve checks for
  record/review ordering, reporter nonauthority and closure gates; avoid brittle
  whole-paragraph matching. Run a scratch removal of the new transition to
  demonstrate the new proof fails, then restore it.
- Follow changed guidance into its tests and native fixtures. The existing
  `execution-review` fixture explicitly prohibits wrap-up: retain it as a stop
  control, not positive continuation proof. Add only the proof support needed
  for this new journey; do not rewrite prior observations to claim new behavior.

Focused local checks, through [the project runner](../../../tests/README.md):

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- \
  src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs \
  src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs \
  src/skills/dough-land/scripts/completion-attention-guidance.test.mjs \
  tests/payload-declaration-links.sh
```

Include any new continuation guidance suite in that command. Run the complete
focused closure/reporting suite if its runtime contracts change; existing
`trunk-closure-completion-gate.test.mjs` and Story Branch closure cases protect
retirement gates. The dashboard's `agent-completion-execution.spec.ts` observes
installed reporting, stored receipt and retained terminal, not the agent's
choice to continue. Reuse unchanged runtime proof only for what it observes.
Do not add a full-suite local gate merely because hosted CI runs it.

Before implementation closure, link outstanding behavior to a separate native
acceptance story under ADR 0005, reusing an applicable active home or recording
an unqueued candidate through the existing story workflow. That acceptance
requires a positive planned execution with no separate wrap-up instruction,
explicit review skip, settled findings, a genuine decision stop, and a required
closure failure. Observe actual review/record ordering, correction preservation,
published closure, applicable CI/shutdown, retirement and final dashboard receipt
where supplied. Include Trunk and Story Branch mode risks and direct versus
dashboard use; record evidence or justified reuse for each affected requirement
on each host. Existing explicit-no-wrap-up native cases remain stop controls.
No paid native run is implicit in implementation. Functional completion may
precede linked native acceptance; affected release waits for acceptance or a
human-owned exception.

Safe stopping point: the selected planned journey can close without a manual
round trip, while real decisions and failed duties remain resumable. Queued
corrections retain their own later execution.

Sizing: one continuation decision and its observable closure outcome, including
consumer checks and cleanup. Splitting permission, invocation and closure proof
would fragment this result. Existing closure operations require no Structure
slice. No numeric slice target or hard limit was supplied.

## Current decisions

- This preparation authorizes no execution, Take, release or rollout. The slice
  remains planned and the story queued.
- Edit guidance in `src/skills/`; do not hand-edit installed managed copies.
  Review descriptions, examples and references from the executing project's
  perspective and keep payload links complete.
- Follow installed execution's proof, independent refactoring, commit and delivery
  gates when execution is authorized. Use the selective formatter before staging,
  check staged whitespace and preserve the staged lint/conditional typecheck hook.
- No human-owned scope or architectural decision remains for this approach.
  The final continuation decision during actual execution still depends on that
  execution's evidence and authority.

## Decisive premises and observations

Observed on 2026-10-20 in
`/Users/terryyin/git/open-dough/.worktrees/continue-successful-execution-into-wrap-up-when`
at `53c9758dbcb121537c5dc9211e726ee15a581176`.

1. The current guidance's normal planned completion ends before wrap-up.
   A representative branch walk through `finish-or-stop.md` reaches its explicit
   `do not invoke it here` instruction after review/record/CI duties. The
   wrap-up entry says the coordinator invokes it. This is the instruction
   contract to change, not evidence of failed closure machinery.
2. Existing focused proof does not discriminate that transition. Ran:

   ```sh
   PATH="/opt/homebrew/bin:$PATH" npm test -- \
     src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs \
     src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs \
     src/skills/dough-land/scripts/completion-attention-guidance.test.mjs
   ```

   Baseline exited 0. In this owned checkout, replaced only
   `worktree for story wrap-up; do not invoke it here.` with
   `worktree until automatically continuing into story wrap-up when all required choices are settled.`
   and reran the identical command: exit 0 again. Restored the original bytes
   before any record write. The assumed coverage is false; the slice therefore
   owns new discriminating continuation proof.
3. Following a valid correction into `follow-up-disposition.md` reaches explicit
   default queue authority with no further approval. Following product advice
   into wrap-up reaches authorized-compatible changes and a missing-input stop.
   These existing guidance decisions support continuation without creating
   backlog authority in retrospective or execution.
4. The native `ci_completion_prompt` in
   `tests/support/ci-completion-native-fixture.sh` expressly forbids story
   wrap-up. Its successful result cannot establish positive continuation.
   Native positive behavior is not claimed by this preparation or its static
   checks; the linked acceptance above owns it. No unobserved runtime mechanism
   is assumed to have changed.

## Learnings

Queueing a valid correction before invoking wrap-up would invert ownership and
create an unnecessary stop. Recognize existing authority at the continuation
boundary, then let the workflow that owns the disposition apply it.
