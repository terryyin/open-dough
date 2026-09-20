# Publish shared backlog claims before isolated execution

Status: in progress. Slice 1 done; slices 2-4 remain planned. Execution
started 2026-09-20 in Story Branch Mode on branch
`claude/064-publish-shared-backlog-claims`.
Work identity: SEED-008#publish-shared-backlog-claims

## Source, goal, and scope

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#publish-shared-backlog-claims).
The developer authorized planning and refinement on 2026-09-20 after selecting
a simple solution continuous with the workspace and same-machine queue stories.
This is the single active plan; keep the story queued until execution starts.
Number 064 follows allocated 063, including recoverable completed plans.

A developer starting Story Branch or Trunk Mode publishes the owned Taken claim
to the authorized integration target before isolated implementation. Other
developers and the remote dashboard can then see the selection; another task
does not inherit the normal claim-publication obligation.

Include prerequisites before mutation, one shared publication procedure,
workspace creation from the published claim, recoverable failure and resume,
and truthful publication/CI reporting. Preserve Trunk Mode increment/closure
delivery, Story Branch implementation delivery, and direct-current-branch
authority. Do not invent a claim for contextual work absent from the backlog.

Exclude owner allocation, distributed exclusivity, locks/queues, automatic
takeover/cancellation, planning-workspace lifecycle, dashboard changes, new
observer machinery, and background-mode redesign. No implementation or changes
to installed managed copies are part of this planning turn.

## Architecture and existing solutions

Follow [the shared North Star](../../NORTH-STAR.md#shared-work-publication-with-replaceable-workspace-coordination).
Use domain names directly: work identity, Taken membership, execution identity,
execution workspace, integration turn, publication target/revision, CI coverage.
Taken membership is not execution ownership; a local commit is not publication;
publication is not CI coverage. Keep these distinctions in existing context,
not a new record type, state framework, service, or schema.

PFE assessment from inspected production callers and proof:

| Responsibility | Existing owner and decision |
| --- | --- |
| Work selection and identity | Keep dough-product-backlog's take, identity, and reconciliation behavior. Its take operation assumes the caller owns the selection; it is not an ownership allocator. |
| Mode and workspace | Change execute-plan startup and execution-location guidance where claims precede workspace creation. Retain one execution identity in the plan/conversation. |
| Integration turn | Reuse explicit declared-owner coordination in publication Preconditions; extend its call boundary to precede the claim edit. No lock implementation. |
| Publication | Modularize the existing trunk-publication guidance in place so its candidate/recovery sequence has one owner reusable by both modes' claims. Keep mode-specific entry conditions and destinations in their callers. No new script or second publication algorithm. |
| Observation | Reuse ci-monitor/runtime-setup and current adapters. Their observer is bound to a target branch. Preserve Trunk Mode claim registration and Story Branch implementation observation; report uncovered trunk claims honestly. |

Inspection anchors under src/skills/dough-execute-plan:
SKILL.md startup, Take queued work, and recovery; references/execution-location.md;
references/trunk-publication.md candidate, retry, conflict and resume sections;
references/ci-monitor.md, runtime-setup.md and wrap-up.md. Also inspect affected
closure callers in src/skills/dough-story-wrap-up/SKILL.md when modularizing.
Do not rename a public reference merely to improve its label; preserve anchors
or update every caller and payload declaration if a justified relocation occurs.

The current publication reference assumes an execution branch in its final
agreement check even though a claim precedes workspace creation. Express that
check over the resources that actually exist: confirmed claim target/revision
before setup, then execution workspace based on that revision. For existing
increment delivery, preserve its stronger execution-branch agreement. This is
one publication rule with different lifecycle preconditions, not a special
case per execution mode.

Relevant Accepted decisions:
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) for domain names;
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for cohesion, recoverability and minimal structure;
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for one runtime behavioral home and executing-project perspective;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
and [AGENTS.md](../../../AGENTS.md) for useful behavior review and truthful proof.
The ADR index and relevant records agree; 0007/0008 remain Proposed.

## Current decisions

- Resolve publication authority, destination, and a coordinated integration turn
  before mutation in both isolated modes. Missing prerequisites leave the queue
  unchanged. Do not widen direct-current-branch authority.
- Hold the manual turn through inspection, claim edit/commit, and publication.
  A failure preserves exact remaining state and needs deliberate recovery or
  handoff before another writer proceeds; no automatic release or timeout.
- Reuse bounded publication retry and domain-aware backlog reconciliation.
  Never force-push, publish unrelated local commits, or manufacture an empty
  replacement claim after a successful or uncertain earlier publication.
- A retained claim candidate contained in freshly fetched target history is
  published, including publication by its authorized owner. Missing execution
  identity is unresolved even when Taken membership exists.
- Retain the claim's target and confirmed candidate separately from later
  implementation delivery in existing execution context. No extra ledger.
- Do not register a trunk claim with a story-branch observer. A matching existing
  observer may supply coverage only with verified ownership and receipts; do
  not commandeer another execution's observer. Otherwise report the claim
  unobserved and keep ordinary story-branch coverage. No mandatory second
  observer, branch switching, or new cross-target repair authority.
- The workspace and queue stories replace the temporary location/coordination
  guidance. Their seed reminders link this contract; preserve those links and
  the North Star until the successors no longer need it.

## Proof boundaries and commands

Primary product proof is the conventional guidance behavior review required by
AGENTS.md: invocation context, required inputs, and a useful observable outcome.
Walk each owning example from its actual startup/resume caller through the final
source instructions. Record decisive passages, expected action/state, conflicting
instructions removed, and remaining limits in this plan during execution.
Do not build exact-wording assertions or a new agent test framework.

Existing supporting commands, run during implementation when affected:

    node --test src/skills/dough-execute-plan/scripts/trunk-publication-local-main.test.mjs
    node --test src/skills/dough-execute-plan/scripts/ci-target-branch-worktree.test.mjs
    PATH="/opt/homebrew/bin:$PATH" bash tests/execution-payload-update.sh

The first suite exercises real Git increment agreement, unrelated local history,
and rejected push/rewrite preservation by issuing Git directly; it does not
execute guidance and currently starts with an execution worktree already made.
The second invokes the real mailbox launcher/register route and host bridge but
supplies the claim SHA/target as setup; it does not prove startup chooses them.
The third performs real tagged install/update in both skill roots and executes
installed runtime; it proves delivery/preservation, not agent interpretation.
Use those exact boundaries when accepting results.

For the new claim-before-workspace and interrupted-claim examples, use a bounded
disposable bare origin, integration checkout, and independent reading clone.
Start without a claim or execution worktree for the happy path. Apply the
reviewed instructions, observe origin's backlog and exact revision before
workspace creation, then verify setup uses that revision. For failure/resume,
preserve and compare refs, backlog/index state and retained candidate. Record
literal commands and results during execution. A manual Git walkthrough proves
the mechanism; pair it with guidance review rather than calling it native-agent
acceptance. Do not manufacture a production runtime solely to make prose testable.

No new host activation/integration mechanism is selected. Judge this conventional
skill edit by AGENTS.md's behavior review on the shared guidance, including the
Codex/Cursor/Claude runtime perspective; do not infer fresh native results. If a
material host-specific mechanism emerges, stop that dependent expansion and
resolve its evidence under ADR 0005 rather than silently adding a test matrix.

## Ordered slices

### 1. Refuse an isolated claim before mutation when publication is unauthorized
Type: Behavior
Status: done
Proof: story example 2 through the actual startup caller; absent destination,
authority or integration turn leaves backlog/index/refs unchanged and starts no
implementation. A valid preflight continues under the existing mode contract.
Accepted proof: `src/skills/dough-execute-plan/SKILL.md`'s "Take queued work"
section now gates the existing Backlog-list-to-Taken mutation behind a new
paragraph (Story Branch/Trunk only) requiring resolved claim-publication
authority, destination, and an exclusive integration turn under
[trunk publication's Preconditions](../../../src/skills/dough-execute-plan/references/trunk-publication.md#preconditions)
before that mutation call is reached; missing any of the three leaves the
move (and thus the queue, index, and refs) unchanged and reaches no
implementation. Current-branch and no-claim contextual paths are explicitly
untouched. Reviewed by inspecting the literal diff and tracing both the
refusal and continuation paths through the edited prose; no test suite
applies to this documentation-only slice.
Learning: the post-change refactor pass found this edit pushes
`src/skills/dough-execute-plan/SKILL.md` from 250 to 260 lines, over this
project's 250-line refactor-check threshold. Splitting it now would mean
doing slice 2's modularization early; the overrun is intentionally carried
forward and must be resolved by slice 2's extraction of shared publication
mechanics into `references/trunk-publication.md`.

Resolve claim publication authority and destination before taking queued work
in either isolated mode. Require the declared integration turn and existing
ownership/cleanliness/hook checks before mutation. Preserve existing permission
when supplied; do not add a repetitive approval prompt. Direct-current-branch
work retains its existing contract, and contextual work without a queued item
gets no invented claim. Review both refusal and continuation paths from the
caller; no Git mechanism or ownership allocator is added. This slice alone
prevents taking work whose publication lacks required authority/context; it does
not yet promise the new Story Branch publication timing.
Hypothesis: one pre-mutation decision and proof loop, medium-high confidence;
required context already exists but is currently requested later in Story Branch.

### 2. Share publication mechanics without changing mode behavior
Type: Structure
Status: planned
Proof: existing Trunk Mode claim/increment/closure caller walkthrough plus the
publication Git suite; preserve destinations, retry, conflict and recovery behavior.

Keep candidate publication and recovery in one authoritative reference with
mode-neutral mechanics and explicit call preconditions. Align existing callers
without activating Story Branch claim publication yet. Preserve current mode
choices and direct-current-branch behavior. Resolve the claim's pre-workspace
verification using actual existing resources. This structure immediately enables
slice 3's second caller; do not extract a general integration framework.
Hypothesis: one bounded responsibility clarification, medium confidence; most
mechanics already exist. Stop if reuse requires a new execution engine.

### 3. Publish an isolated execution's claim before work starts
Type: Behavior
Status: planned
Proof: story examples 1, 3–4 and 6 through startup guidance review and the disposable
claim-before-workspace walkthrough; corroborate unchanged runtime/delivery boundaries.

Given selected queued work in Story Branch or Trunk Mode with slice 1 preflight
satisfied, startup records only its owned claim, publishes through the common
procedure, and creates the workspace from the confirmed candidate before
implementation. Preserve slice 1 refusal; persistent publication failure
preserves the claim and blocks implementation pending manual recovery/handoff. Include remote advance and
unrelated-local-work cases through existing reconciliation/refusal behavior.
Align CI target reporting and setup: retain trunk coverage in Trunk Mode, retain
story-branch coverage for implementation, and explicitly report an uncovered
Story Branch trunk claim. Preserve later delivery modes and contextual no-claim
work. Keep happy-path and failed publication as outcomes of one startup
publication boundary. Hypothesis: one claim-to-published-start journey, medium
confidence; existing publication mechanics supply the retry/refusal behavior.
Do not ship successful publication with its failure/coverage reporting unfinished.

### 4. Resume from the claim's observed publication state
Type: Behavior
Status: planned
Proof: story example 5 plus failure/ownership boundaries in examples 3–4, reviewed
from resume; disposable remote state establishes the actual publication result.

Given a retained claim and an interrupted startup or stale local-only report,
fetch the authorized target and resume at the first unfulfilled obligation.
Already-published candidate/retained rewrite, including an ancestor of newer
trunk or an owner-published claim, updates the report without duplicate commit
or push. Unpublished claims reuse the common publication procedure; absent or
ambiguous execution identity stops. Setup failure reuses the claim and any
verified workspace; it does not allocate a new claim or nested worktree. Keep
publication evidence distinct from missing CI receipts and preserve existing
Trunk increment recovery. Hypothesis: one state-reconciliation rule, medium
confidence; existing resume table already supplies most cases.

## Promise ownership

| Promise | Owning slice and observation |
| --- | --- |
| Shared mechanics preserve existing publication/increment/closure contracts | 2: caller review and existing real-Git assertions |
| Missing startup authority/destination/turn leaves queue unchanged | 1: preflight refusal walkthrough |
| Claim is on origin before isolated implementation/workspace startup | 3: independent clone and retained candidate; startup instruction order |
| Reconcile remote advances; preserve unrelated work and direct-current authority | 3: remote-advance/refusal and mode-boundary review |
| Persistent failure preserves state; deliberate turn recovery before other writers | 3: rejected/unavailable publication walkthrough |
| Actual target/revision, asynchronous and honest CI coverage | 3: observer boundary review plus existing runtime test |
| Resume recognizes published, unpublished, rewritten, or uncertain claims honestly | 4: fetched-history and retained-identity walkthrough |
| No duplicate claim/push/workspace; ambiguous ownership is not resume authority | 4: count/history/resources and explicit stop review |
| Temporary policy remains replaceable under one domain model | 1–4: cumulative review against North Star and both seed reminders |
| Shared changed guidance is delivered, existing runtime/preservation holds | 1–4: affected payload check; no installed copies edited |

## Execution gates and lifecycle

Use dough-execute-plan's implementation/proof acceptance, independent post-change
refactor, scoped formatting, commit/delivery and asynchronous CI contracts when
execution is separately authorized. Resolve its execution mode, checkout, push
destination and actual hook state then; this planning worktree is not implicitly
the execution checkout. No numeric target, hard limit or timing exception was
supplied. Size by one cohesive outcome/proof loop including cleanup; reassess
before expanding scope or duplicating publication policy.

Run focused checks for changed boundaries, then required repository checks
(npm run lint and npm test with Bash 4+ on PATH) at final delivery preparation.
Preserve accepted proof between slices; rerun only invalidated/missing evidence.
Do not run unrelated dashboard browser tests for guidance-only changes.
Keep this plan and story through retrospective and wrap-up. Wrap-up owns cleanup;
the North Star remains while its successor stories still depend on it.

## Planning assessment and remaining evidence

No product commands or native sessions were run during planning. Supporting
test setup/assertions and guidance callers were inspected; all slices remain
planned. No novel infrastructure assumption requires a feasibility experiment.
Refinement split the initial publication-start slice's pre-mutation refusal into
slice 1. The initial Structure/startup/resume slices are now slices 2–4; no
completed evidence or scope was removed. Four slices result, with no sizing
exceptions. Slice 2 immediately enables slice 3; slices 1, 3 and 4 each have
one externally observable decision boundary and associated proof loop.

Cumulative assessment: all examples use the same owned claim, publication
sequence, retained candidate and fetched remote evidence. Mode affects target
selection and later delivery, not a duplicate claim algorithm. Location and
manual turns remain replaceable policies. No further slice-specific design or
sizing concern was identified after this refinement. CI coverage on two targets
is an explicit delivery limitation, not an unplanned observer requirement.
The assessed plan is ready for direct execution under the refinement skill's
classification; that classification does not authorize execution. Actual proof,
source/caller revalidation, hook context and push authority remain execution-time
obligations, not completed results.
