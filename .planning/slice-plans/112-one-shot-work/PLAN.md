# Complete one-shot work or admit its continuation

## Source

**Identity:** SEED-028#one-shot-work

[Refined story](../../seeds/SEED-028-track-ad-hoc-work.md#one-shot-work).
The developer accepted queued-story eligibility and automatic escalation with
continuation inside the original authorization. This request authorizes refinement
and planning, not implementation or publication of the preparation draft.

## Goal and scope

An explicitly requested, genuinely trivial outcome can be completed, verified and
published to remote trunk without a Taken announcement or lasting temporary
planning records. Both unlisted requests and queued stories are eligible. If the
attempt grows, preserve owned edits and valid proof, publish ordinary admission,
and continue within the original scope and authority.

One-shot is a tracking policy, distinct from planless execution and branching
mode. Use it at independently invoked work-entry workflows: direct contextual
work, bug investigation/repair, profiling/optimization, exploratory testing and
standalone review. Supporting work inherits its existing story. Already-Taken
work keeps its ordinary lifecycle; the option never erases published history.
Preparation-only requests retain existing keep/disposition rules. The option does
not grant permission to implement findings, publish drafts or expand scope.

Eligibility: one understood coherent outcome, no known need for multiple slices
or unresolved domain/architecture decisions, and a credible focused verification
path. An ordinary test/fix loop or short diagnosis may fit. Known larger work goes
straight to normal admission; newly discovered complexity, separate outcomes or
failure to converge triggers escalation before further substantive work. No
universal time, line-count or file-count limit is added. Honor project limits and
explicit stop/no-replan instructions; they limit continuation without authorizing
oversized untracked work.

Successful changed work publishes the complete result and applicable spent-record
cleanup together. A supported no-change result requires no empty commit; queued
work still publishes its ordinary completion cleanup if records must change.
Verification, required review, CI ownership, publication recovery and safe workspace
retirement remain normal obligations. Local main need not be edited directly.

Excluded: a one-shot registry or dashboard state, hidden claims, another publisher
or execution engine, extra branch modes, completed-story history, migration of
existing identities, configurable size thresholds, and redesign of ordinary CI,
default-checkout coordination or preparation publishing.

## Dependency and execution gate

[Shared admission](../../../src/skills/dough-execute-plan/references/admit-accepted-work.md)
is Taken, with its implementation not yet established on the inspected published
revision `2f7ed7c`. Before executing this plan, verify its delivered canonical
story admission, atomic claim publication, source evolution and recovery behavior.
Inspect the actual delivered interface and adapt references in this same plan.
Do not implement a substitute admission protocol or assume the planned API exists.

This story owns transferring an already-started unclaimed attempt, including
uncommitted edits, into that admission. Admission must publish only its canonical
tracking content, not unfinished product edits. Preserve the existing checkout
when supported; if the delivered contract requires a separate publication
workspace, use its existing mechanism and retain the owned implementation edits
and identity without creating two execution lifecycles. An unresolved ownership
or interface mismatch blocks that handoff until this plan is aligned.

New plans use the established `.planning/slice-plans/` convention. Existing
artifact links continue to name their actual locations; folder migration is not
part of this story.

## Architecture and existing solutions

Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
one identity, direct domain mapping and one owner per responsibility. Follow
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for evidence
reuse and native behavior proof, and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
plus [AGENTS.md](../../../AGENTS.md) for agent-facing shared guidance. Proposed
ADR 0007 records the one-shot direction but changes no ADR acceptance status.

Use [One admission path for accepted work](../../NORTH-STAR.md#one-admission-path-for-accepted-work).
Its one-shot paragraph records the consequential choice: reuse ordinary execution,
publication and cleanup, and transfer growing work into the same admission path.
No new ADR or architecture layer is needed.

| Responsibility | Reuse/change decision |
| --- | --- |
| Explicit selection and a bounded attempt | Extend `dough-execute-plan` and its shared entry/decision guidance; callers pass one meaning rather than implementing their own policies. |
| Workspace ownership and setup | Reuse execution-location and exploration-workspace selection, ordinary verified base and runtime setup. Do not require access to a dirty shared default checkout. |
| Result publication and recovery | Reuse `execution-increment-publication.mjs`, `publication-resume.mjs`, applicable-candidate proof and safe-refresh owners. One-shot supplies its complete candidate and actual target. |
| Owned work transfer on growth | Change the existing oversized-slice handoff to use delivered admission, preserving source, edits and proof; do not reuse its current no-story continuation unchanged. |
| Queued completion | Reuse backlog completion, canonical-home cleanup and ordinary wrap-up knowledge assimilation; compose them into the same result candidate. |
| Completion/CI and resource retirement | Reuse finish-or-stop and closure resource gates. Acceptance, verdict and cleanup remain separate facts; no false success on an unconfirmed push. |

Code inspection shows contextual planless work already selects a workspace
without a claim, ordinary result publication accepts a validated owned suffix,
and wrap-up can close planless work. Oversized execution preserves compatible
proof but currently treats replanning permission separately and can continue
without a story. These owners need policy alignment, not parallel abstractions.

For queued work, optimistic ownership checks must use freshly fetched trunk and
repeat after reconciliation/rejected push. A concurrent Taken or Preparing owner,
changed story scope, or competing removal cannot be overwritten by stale cleanup.
Preserve the local candidate and stop for the established ownership/conflict
resolution. Do not solve this by publishing a hidden one-shot assignment.

## Outside-in proof

Start with disposable Git repositories and local bare remotes. Drive the actual
public workflow boundary; observe remote commit contents/history, backlog and
assignment records, checkout preservation, CI receipt and resource state. Never
seed a successful claim or cleanup when that is what the case must prove.

Inspected existing owners:

- `src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs`
  and reconciliation tests prove candidate publication; `publication-resume.test.mjs`
  and racing-suffix tests prove exact accepted-revision recovery.
- `current-branch-publication.test.mjs` covers the explicitly selected checkout
  variant; it is not the default one-shot route.
- `tests/support/product-backlog-complete.test.mjs` and shared identity/home tests
  own membership and canonical interpretation.
- `src/skills/dough-story-wrap-up/scripts/closure-resource-cleanup.test.mjs`
  and closure publication/resume tests own retention and retirement boundaries.
- `tests/git-publication-native.sh` supplies installed fresh-agent journeys and
  substitute-process assessor checks. Its default run is harness proof, not
  native behavioral evidence.

Add focused one-shot journeys at the existing publication test boundary. Proposed
new file: `src/skills/dough-execute-plan/scripts/one-shot.test.mjs`; this is a
planned file, not existing evidence. Command after implementation:
`node --test src/skills/dough-execute-plan/scripts/one-shot.test.mjs`.
Assertions must observe the policy's complete caller behavior, not only invoke a
publisher directly and infer the skill chose it correctly.

For changed Markdown, walk invocation, required context and useful outcome under
AGENTS.md. Use one shared native scenario per distinct unresolved behavior, with
risk-selected host runs and justified reuse for Codex, Cursor and Claude Code.
Proposed native cases below extend the existing harness; they do not exist yet.
Counterexample assessment must reject transcripts that merely claim completion
or publish tracking accidentally. Static text checks are not behavior proof.
Record any missing native evidence honestly and satisfy it before release; no
new acceptance-story inventory or routine per-skill discovery matrix is needed.

## Ordered slices

### 1. Finish an explicit one-shot request with only its complete result
Type: Behavior
Status: planned

Behavior: An unlisted, eligible request explicitly selects one-shot → the shared
execution path performs one coherent attempt → the verified complete result
reaches remote trunk without a story, plan, assignment or Taken commit, and its
owned resources retire after normal completion gates. A supported no-change
outcome completes without a manufactured empty commit.

Wire explicit selection, eligibility and successful completion through the
existing planless path, including shared caller references and normal setup,
focused verification/refactoring, CI and cleanup. Ordinary planless work without
the flag retains the admission story's tracking behavior. Publish to the authorized
trunk; resolve contradictory explicit branch/target instructions before mutation.
Do not infer one-shot because a task appears small. Do not auto-publish a
preparation-only draft. Growth must stop substantive work pending the handoff
implemented in slice 3; do not release the complete feature before that slice.

Proof: New one-shot journey starts with no matching backlog item, runs a small
real change, and observes only the complete result on remote trunk and clean
retirement. Include no-change, ineligible-at-entry normal admission and a missing
publication-authority refusal with preserved work. Inspect all accepted history
for absence of attempt-created tracking, not only the final tree. Extend the
existing completion boundary so a failed required check cannot report success.
Run the one-shot test plus applicable publication and resource-cleanup tests.
Fresh native case `publication/one-shot-result` must demonstrate explicit flag
use and actual result/cleanup; ordinary contextual work remains a countercase.

Safe stop: The successful outcome is usable in the bounded proof fixture. Until
slice 3, unsupported growth safely stops with edits preserved; this interim stop
is not the completed user contract.

### 2. Complete a queued story without an intermediate Taken state
Type: Behavior
Status: planned

Behavior: An eligible queued story explicitly selects one-shot → its result and
ordinary spent-record cleanup publish in one candidate → the queue entry and its
spent source/plan disappear while unfinished siblings and unrelated order remain.
Existing Taken work retains its ordinary ownership and history.

Reuse the canonical story identity and existing completion/cleanup responsibilities.
Keep lasting product knowledge before source removal. Check current queued content
and ownership before the attempt and at publication/reconciliation. A competing
claim/preparation assignment or changed scope stops stale completion rather than
removing another agent's work. No extra one-shot status or assignment is published.

Proof: Extend the one-shot journey with a queued story, a temporary plan and an
unfinished sibling. Observe result plus cleanup in the same accepted commit and
no Taken transition in its history. A remote writer taking the story before push
must preserve that claim and the one-shot candidate; unrelated remote queue changes
must survive reconciliation. Include already-Taken invocation and a no-change
queued conclusion. Run the one-shot test and
`node --test tests/support/product-backlog-complete.test.mjs`
plus affected closure/publication reconciliation tests. Native case
`publication/one-shot-queued` verifies that the caller actually composes completion
rather than publishing result and cleanup as separate intermediate states.

Safe stop: Queued success and ownership races are covered; automatic growth still
awaits the next slice.

### 3. Admit a growing attempt and continue without losing its work
Type: Behavior
Status: planned

Behavior: An unlisted or queued attempt discovers work beyond a coherent one-shot
completion → it stops untracked substantive work, preserves owned edits and valid
proof, publishes ordinary Taken admission → it plans when needed and continues
under the same outcome and original authorization.

Use the first story's delivered admission interface. For unlisted work create or
reuse a suitable seed story; for queued work keep its identity. The admission
commit includes only canonical tracking and necessary preparation facts, never
unfinished implementation edits. Transfer current scope, failed sizing assumption,
completed proof and pending changes into normal continuation without inventing
completed slices or replaying valid work. Reuse existing workspace/ownership
mechanisms; no second identity or special executor is introduced.

Automatic continuation is authorized within scope by the option. An explicit
stop/no-replan instruction limits continuation; scope expansion, disputed decisions
or ambiguous ownership follows the normal human-decision path. Missing permission
must not result in continued oversized untracked work. Existing Taken work never
gets another claim. Failed or uncertain admission preserves work and stops dependent
continuation until the existing recovery confirms acceptance.

Proof: New journey modifies a real file and establishes focused proof before the
size decision, then invokes admission. Inspect remote claim content (no unfinished
product edits), retained local bytes/proof, one identity/profile and subsequent
ordinary planned execution. Cover both unlisted and queued sources, admission
interruption/resume, and explicit no-replan or out-of-scope stops. Reuse delivered
admission fixtures rather than precreating a success state. Run the one-shot test
and affected admission recovery tests identified from the dependency's delivered
version. Native case `publication/one-shot-escalation` observes admission before
further substantive edits and continued work without an unnecessary approval stop.

Safe stop: The complete one-shot growth contract is present; successful and growing
attempts share normal downstream publication and completion.

### 4. Recover result delivery without inventing an oversized task
Type: Behavior
Status: planned

Behavior: A complete one-shot candidate encounters a push interruption, concurrent
unrelated remote update, or delayed required CI verdict → normal delivery/verification
recovery settles the actual candidate → completion and cleanup reflect real remote
acceptance and verification, with no duplicate result or fabricated tracking claim.

Keep transport failure distinct from changed product scope. Revalidate when replay
changes the candidate, register the actual accepted revision with the ordinary
observer, and retain resources until normal shutdown/cleanup gates pass. A failed
check that reveals larger corrective work re-enters the growth decision from
slice 3; neither a waiting verdict nor one focused repair alone implies growth.
For queued work, recovery repeats its ownership checks. Preserve conflicting
candidates for resolution instead of retrying indefinitely or forcing publication.

Proof: Extend one-shot journeys using existing publication/CI fixtures for lost
push response, rejected push followed by revalidation, pending/failing verdict and
interrupted retirement. Assert accepted ancestry, exact candidate attribution,
no repeated commit, honest completion and preservation until safe cleanup. Run
`node --test src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication-reconciliation.test.mjs`
and affected closure-resource/completion tests alongside the one-shot test.
Reuse sufficient native recovery evidence where the unchanged caller contract
supports it; add `publication/one-shot-recovery` only for an uncovered behavior.

Safe stop: Result completion, tracked escalation and failed delivery each have one
honest outcome with recoverable work and ordinary cleanup.

## Proof coverage and execution checks

| Promise | Slice / observation |
| --- | --- |
| Explicit selection; one shared meaning; no implicit quick bypass | 1: actual entry and ordinary-contextual countercase |
| Verified unlisted result or no-change without tracking artifacts/history | 1: remote commit history, check verdict and cleanup |
| Queued result and spent-record removal together, siblings preserved | 2: accepted candidate and unchanged sibling records |
| Existing/concurrent owners and scope changes preserved | 2, 4: fresh remote ownership and retry checks |
| Preserved edits/proof plus atomic ordinary admission on growth | 3: real attempted edits through delivered admission |
| Automatic scoped continuation; no added authority | 3: normal continuation and explicit-limits countercases |
| Recovery/CI distinct from complexity; no duplicate publication | 4: actual accepted SHA, verdict and retirement evidence |
| Safe default refresh and unrelated local-work preservation | 1, 4: ordinary maintenance receipt and unchanged dirty checkout |
| Applicable skills work across hosts | Per-slice behavior review and native evidence/reuse under ADR 0005 |

Every slice carries its caller guidance, necessary shared structural changes and
focused proof. Author product guidance only in `src/skills/`; do not hand-edit
installed copies. If payload files are added, update declarations and reuse the
existing payload install/update checks. New host discovery mechanisms, product
storage or installation redesign are unnecessary.

Follow ordinary execute-plan post-change refactoring, focused testing, delivery,
CI and retrospective gates when execution is authorized. No new time budget or
sizing exception is supplied. Reassess a nonconvergent slice through the existing
oversized-slice procedure, including its proof and cleanup cost. Do not split by
technical layer or add general infrastructure for hypothetical uses.

## Slice review and readiness

Four Behavior slices retained. Result plus cleanup stay together in each success
journey; recovery has its own failure proof loop. Queued work is a separate useful
variation because canonical cleanup and competing ownership differ from unlisted
work. Escalation remains one transfer of owned work rather than separate seed,
claim and implementation-preparation slices. No speculative Structure slice or
story resplit is proposed. The interim growth stop in slices 1–2 is explicitly
replaced by slice 3 and cannot be reported as completed one-shot behavior.

No unanswered product choice remains. Execution readiness is not yet established:
shared admission is still being implemented and its final continuation interface
must be inspected before this plan's handoff proof can bind to it. Once delivered,
align this plan with the actual interface and reassess; do not mark ready merely
because all slices are written. No runtime or native tests have run for this plan.

## Learnings

No execution learning; implementation has not started.
