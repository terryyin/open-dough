# Keep plan execution context focused and recoverable

## Source and authority

[SEED-004 Story 21](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#focused-recoverable-execution-context).
On 2026-09-14 Terry accepted the proposed goal, scope, and preservation of the
coordinator's proof-acceptance and delivery responsibilities, and requested
slice planning and refinement if needed. This invocation authorizes planning,
not execution. The story remains first in **Backlog list**.

## Goal and boundaries

Reduce repeated or irrelevant material accumulated by the coordinator during
multi-slice execution while preserving sound decisions, interruption recovery,
and evidence-supported replanning. Include initial loading, implementation and
refactor handoffs, ordinary continuation, recovery, and changed assumptions.

Preserve required project context, proof quality, independent refactoring,
coordinator delivery, human decision authority, Story Branch Mode, and the
quick path's prohibition on a substitute state artifact. A summary alone must
not establish unproved behavior. Required investigation may grow context.

Exclude changing agent responsibilities, automatic compaction/reset policies,
token ceilings, a new memory/checkpoint service, permanent accounting machinery,
host/tool-catalog changes, retrospective or story-wrap-up optimization, release,
and installation/adoption. No promise of lower total multi-agent token usage,
faster execution, zero compactions, or a numerical improvement percentage.

## Existing solution and decisions

PFE responsibility: select and retain sufficient execution evidence without
duplicating its raw representations. The selected outcome is to change existing
owners, not create another workflow or context store.

| Existing owner | Evidence and decision |
| --- | --- |
| `src/skills/dough-execute-plan/SKILL.md` | Owns required context, execution identity, next-slice loop, and resume checks. Clarify relevant initial loading and reuse here. |
| `src/skills/dough-execute-plan/references/disposable-research.md` | Already requests isolated investigation, distilled conclusions, and bounded excerpts. Extend/use this existing policy for retrieval; avoid a competing context guide. |
| `src/skills/dough-execute-plan/references/delegation.md` | Owns fresh implementation handoffs, exact proof commands, ownership, and relevant context. Strengthen evidence selection at this boundary. |
| `src/skills/dough-execute-plan/references/wrap-up.md` | Owns acceptance, independent refactor, valid-proof reuse, plan updates, and delivery. Preserve those duties and make changed evidence explicit. |
| `src/skills/dough-post-change-refactor/SKILL.md` | Already reports edits and invalidated proof. Align its return only where the coordinator needs missing information. |
| `src/skills/dough-story-refinement/references/planning.md` | Owns the canonical plan's decisions, proof, useful learnings, and replacement of obsolete detail. Reuse it for recovery and replanning. |
| `src/skills/dough-execute-plan/references/execution-decisions.md` | Owns failed proof, oversized attempts, reassessment, and human decision stops. Preserve these decision paths. |
| `src/skills/dough-execute-plan/references/ci-monitor.md` and adapters | Already preserve observer/repair identity and pause/resume writers; successful CI can remain silent. Reuse, without changing scripts or observation behavior. |

The historical traces establish repeated broad reads and overlapping recovery
reads; they do not establish that the child transcripts are merged into the
parent. Do not target encrypted reasoning or introduce host-specific remedies
based on that unsupported explanation.

Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports low coordination cost and inexpensive changes of direction, and leaves
agent duty allocation to workflow guidance. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one authoritative home, conditional detail, and preserved invariants.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps edits in source and release/adoption separate.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and
[AGENTS.md](../../../AGENTS.md) distinguish representative behavior review from
native integration acceptance. No new architectural direction or North Star
topic is needed; none currently governs this story. No ADR exception is proposed.

## Proof and comparison

Use Doughnut **Execute plan 118**, task
`01a09a7b-c104-73b2-9d67-345fd7abc7bc`, as the ordinary three-slice baseline.
The research task `01a09dc1-bb0b-7153-8168-d8b9ffbcc4f3` records its execution-only
measurements: 34,806 initial input tokens, 74,709 at first delegation, 109,310
at completion; about 270,000 characters of coordinator tool output and 5,600
characters of plan-edit commands. Initial truncated references were reread;
two successive backend reviews returned about 28,000 and 15,000 characters.
Do not recover the whole historical transcript merely to repeat this baseline.

For behavior review, use one bounded representative three-slice execution
walkthrough based on that case: initial guidance selection, implementation and
refactor evidence, next-slice selection, and retained plan state. Supply relevant
and irrelevant references, an implementation report with traceable assertion
locations, and a refactor report identifying changed boundaries. The walkthrough
must name concrete reads, retained facts, and acceptance decisions under the
changed guidance; a textual claim that the guidance is shorter is insufficient.

Extend this same scenario for recovery and changed assumptions in slices 3–4.
These are labelled representative variations, not invented events in Doughnut's
history. Inspect actual guidance and evidence needs against the scenario. Keep
only a concise result table and consequential gaps in this plan, with evidence
locations when needed. No harness, mandatory transcript archive, or additional
test-management lifecycle is required. A source-guidance walkthrough is not
native acceptance or a controlled claim about live model performance.

Comparison must show which previously repeated reads are now unnecessary and
why all needed decisions remain supported. A smaller prompt is not a pass if a
required assertion, ownership fact, or recovery decision is missing. Use actual
token measurements only if available; separate initial host input, compaction,
and later lifecycle work. A real subsequent execution can strengthen the result,
but this conventional guidance change does not require a new cross-host campaign.

| Promise | Owning slice and observation |
| --- | --- |
| Relevant startup context, no routine overlapping recovery batches | 1: selected reads plus missing-context case |
| Evidence-efficient handoffs and proof acceptance | 2: changed/unchanged refactor boundary and contradictory proof |
| Safe interruption recovery and ordinary continuation | 3: next safe action from retained state and actual work |
| Sound replanning and necessary investigation | 4: changed assumption revises affected future work and preserves valid proof |
| No quotas or weakened authority/quality gates | Preserved in every slice; integrated review in 4 |

## Execution constraints and gates

Execution identity (established 2026-09-14): originating checkout
`/Users/terryyin/git/open-dough` on `main`; execution checkout
`/private/tmp/open-dough-045.DZNCJt/worktree` on
`codex/045-focused-recoverable-execution-context`; integration target `main`;
claim commit `7e1d202155633c26a3a1c5619cadf115edd03747`.

CI observer (rearmed 2026-09-14 after the first observer's request root exposed
an originating-checkout binding mismatch): Codex cell `37`, session `30189`,
directory `/tmp/dough-ci-501/watch-iJdUlr`, PID `71307`; repository
`terryyin/open-dough`; branch `codex/045-focused-recoverable-execution-context`;
workflow selector `ci.yml`, display name `CI`; canonical request root and
execution checkout `/private/tmp/open-dough-045.DZNCJt/worktree`. The stopped
observer was cell `24`, directory `/tmp/dough-ci-501/watch-ISN12H`, PID `34512`;
its terminal result recorded `pendingCi: unobserved`, zero recorded/delivered/
unread events, and its PID is gone.

No numeric slice target, hard limit, or repeated-overrun threshold is supplied
by current repository guidance. Size by one coherent behavior and proof loop;
do not invent minutes. If implementation exposes independent outcomes or a
missing contract, refine the remaining plan under existing escalation rules.

The current 2026-09-14 `dough-execute-plan 45` invocation authorizes execution.
The story is claimed in **Taken** and the Story Branch Mode identity above is
active. Implementation and fresh independent refactoring are delegated by that
workflow; the coordinator retains acceptance, formatting, staging, commit, and
push. The CI observer above is active for the first and later slice pushes.

Public edits belong in `src/skills/`; do not hand-synchronize `.agents/skills/`
or `.claude/skills/`. Keep the shared host-neutral behavior and current reference
paths. Existing files are preferred; a new runtime reference is not planned.

Per changed guidance, apply the AGENTS behavior review: invocation context,
required context, and useful outcome. Run `git diff --check` for owned changes.
The repository commands are `npm run format` and `npm run lint`; formatting is
coordinator-owned. At planning time no configured `core.hooksPath` or active
pre-commit script was found. Resolve that delivery contract before committing
under execute-plan; do not silently assume lint runs in a hook.

The existing `bash tests/execution-payload-update.sh` tests installation/update
and runtime dependencies, not semantic compliance with this prose. Run it only
if those boundaries change. Likewise use `bash tests/story-payload-update.sh`
only for changed story-payload boundaries. No installer, runtime scripts,
generated artifacts, or declaration changes are expected. Do not add tests that
merely search for wording or run the full installer suite for ordinary prose.

## Slices

### 1. Start with sufficient relevant context
Type: Behavior
Status: done
Depends on: none

Behavior: Given an authorized plan and project guidance, entering execution
obtains the context needed for the first delegation without repeated broad
reference batches; missing required context still produces the existing stop.

Change: Clarify when essential execution references and conditional project,
refactor, CI, and investigation detail are needed. Reuse already-read applicable
instructions; obtain missing or truncated passages by targeted retrieval.
Retain the main skill's required-context checks. Use the existing disposable
research reference for bounded retrieval rather than duplicating its procedure.
Primary owners: main execution skill and disposable-research reference.

Proof: Walk the startup part of the representative case, identifying each read
and the decision it enables. Show how the truncated/missing passage is recovered
without rereading unrelated material, and how a genuinely missing prerequisite
still stops delegation. Review linked instructions for contradictions.

Sizing: One startup selection policy and proof loop; moderate confidence because
mandatory and conditional references must remain consistent. Stop before expanding
into a repository-wide skill rewrite. Safe boundary: startup improves with all
existing downstream execution duties intact.

Outcome (2026-09-14): `dough-execute-plan` now selects authoritative guidance
at the boundary that needs it, reuses still-valid reads, and routes missing or
truncated passages through the existing disposable-research owner. The
independent refactor removed a duplicate recovery procedure from the main skill.

| Representative startup variation | Concrete read and decision | Result |
| --- | --- | --- |
| Ordinary first delegation | Main skill execution-source, boundary-context, delegation, and common decision passages; current plan/story | Required authority, slice, ownership, commands, and stops are available without full wrap-up, CI, refactor, or unrelated lifecycle reads. |
| Truncated delegation pause rule | Targeted delegation pause passage plus only its linked CI pause contract; retrieval policy in `references/disposable-research.md` | The complete decision and source are retained; overlapping full-reference batches are unnecessary. |
| Missing execution location or slice command/runtime | Main skill required-context stop plus the relevant delegation requirement | Delegation stops; later-only delivery context may wait for its owning boundary but is not waived. |

Source inspection covered `src/skills/dough-execute-plan/SKILL.md` startup and
boundary-selection rules and `references/disposable-research.md` targeted
recovery/stop rules. Linked delegation, wrap-up, CI pause, refactor, planning
proof, and missing-context instructions were consistent. `npm run format` and
`git diff --check` passed. This is representative guidance proof, not native
performance or measured token-reduction evidence.

### 2. Accept delegated work from sufficient, targeted evidence
Type: Behavior
Status: done
Depends on: 1

Behavior: Given implementation and refactor returns, the coordinator can accept
or return the slice using its promises and sufficient evidence without routinely
loading the whole raw implementation trace or rereading unchanged full diffs.

Change: Align the existing handoff and acceptance contracts around outcome,
changed paths/boundaries, exact proof and observation locations, gaps, and
consequential learnings. Distinguish a reference to proof from proof actually
inspected and accepted. Reuse valid inspection only while its boundary remains
unchanged; targeted underlying setup/assertion inspection remains available and
required when insufficient or contradictory evidence demands it. Align the
refactor return with those needs without changing refactor or delivery ownership.
Primary owners: delegation, wrap-up, and refactor completion reporting.

Proof: Walk one slice from implementation return through refactor acceptance.
Exercise unchanged proof, a refactor-invalidated boundary, and a claimed pass
whose setup supplies the promised behavior. Explain the necessary reads and
acceptance or returned gap for each; do not turn a compact report into trust
without evidence. Compare the reads with the baseline's repeated broad reviews.

Sizing: One acceptance decision loop; moderate confidence. Producer and consumer
instructions must change together to avoid a temporarily unsupported handoff.
Safe boundary: evidence selection improves while every delivery gate remains.

Outcome (2026-09-14): delegation now returns a targeted evidence index with
changed boundaries, literal commands, setup and observation locations, gaps,
and consequential learning. Wrap-up inspects those locations before acceptance,
and refactoring reports which accepted boundaries changed. The independent
refactor found this producer/consumer contract already cohesive.

| Representative acceptance variation | Inspected evidence | Decision |
| --- | --- | --- |
| Sufficient proof, unchanged by refactor | Delegation return fields, actual changed boundary, setup/assertion locations, and accepted result; refactor reports the same boundary unchanged | Accept once, then reuse the inspection without rereading the raw trace, full output, or unchanged diff. |
| Refactor changes the covered boundary | Refactor's changed paths/boundary and replacement setup/observation locations | Reinspect the newly affected locations and accept the rerun or replacement proof only if it still establishes the promise. |
| Passing assertion whose setup supplies the promised state | Reported setup plus assertion and actual implementation boundary | Return the promise as unproved; the command and compact report do not substitute for product behavior. |

Source inspection covered `references/delegation.md`'s targeted return contract,
`references/wrap-up.md`'s acceptance and refactor-consumption rules, and
`dough-post-change-refactor/SKILL.md`'s proof-effect report. `npm run format` and
`git diff --check` passed. No semantic harness or native run was added; the
representative walkthrough is the applicable conventional guidance review.

### 3. Continue or resume from trustworthy execution state
Type: Behavior
Status: done
Depends on: 2

Behavior: Given continuous work or interruption at an execution boundary, the
coordinator identifies the next safe action from current retained state and
actual work, without reconstructing all prior guidance and operational output.

Change: Clarify the existing plan/conversation division: preserve active
decisions, literal proof with its boundary, execution identity, owned unfinished
work, observer identity when present, and delivery progress needed for recovery.
Ordinary continuation reuses current valid knowledge; interruption or evidence
of change triggers relevant reconciliation. Account for the plan being updated
before a commit or push finishes: plan status alone cannot prove delivery.
Use existing plan and Git/agent/observer evidence; introduce no checkpoint file
or quick-path plan. Primary owners: execution loop/resume, wrap-up plan update,
and canonical planning lifecycle, with existing CI recovery referenced.

Proof: In the same scenario, inspect alternative interruption points after
implementation, refactor, plan edit, and commit-before-push. Each returns the
actual next safe action, preserves unrelated work, and retains valid proof.
A missing/contradictory identity returns the existing recovery decision rather
than a guessed branch or completion. Also show normal next-slice continuation
does not perform a full recovery reread without a change signal.

Sizing: One reconciliation rule with boundary examples; moderate confidence.
Do not build a delivery state machine or rewrite observer behavior. Safe
boundary: normal execution and recovery share sufficient existing state.

Outcome (2026-09-14): the executable plan now owns durable execution identity,
decisions, consequential learnings, and reusable accepted proof; the execution
conversation owns live returns, unfinished ownership, delivery boundary, and
observer identity. The coordinator reconciles only state signalled as changed
against actual Git, agent, and observer evidence. The independent refactor kept
plan-status semantics solely in planning guidance and recovery behavior in the
execution skill.

| Interruption or continuation point | Evidence and next safe action |
| --- | --- |
| Implementation before refactor | Owned unstaged paths plus the indexed proof locations require acceptance, then fresh refactoring; unrelated work is preserved. |
| Refactor before plan edit | Refactor marker and proof effects determine targeted reinspection, then remaining generator/format/plan duties. |
| Plan edit before commit | Working tree/index show that `done` is still uncommitted; stage only owned changes and commit. |
| Commit before push | HEAD-versus-upstream evidence identifies a local delivery commit; push it without repeating unchanged implementation or proof. |
| Ordinary next slice | Matching pushed HEAD, retained valid proof, and current plan select the next dependency-ready slice without a full recovery reread. |
| Missing or contradictory identity | Preserve resources and request the existing human recovery decision; never guess a checkout or completion. |

The observer setup supplied a real changed-state variation: its first request
root named the originating checkout despite the retained execution identity.
The coordinator stopped that exact observer (zero recorded/delivered/unread,
`pendingCi: unobserved`, PID gone) and rearmed the plan-recorded observer with
the canonical execution root. No implementation work or unrelated state was
reconstructed. Source inspection covered the main recovery rule, wrap-up's live
delivery handoff, and planning's durable/live state division. `npm run format`
and `git diff --check` passed; no new checkpoint, status machine, or CI behavior
was introduced.

### 4. Replan from consequential learning without losing valid work
Type: Behavior
Status: planned
Depends on: 3

Behavior: Given evidence invalidating an assumption, the coordinator obtains the
necessary detail, explains the changed decision, and updates affected remaining
slices while preserving compatible completed work and proof.

Change: Connect bounded investigation to the existing reassessment/refinement
handoff. Retain the observation, affected assumption, consequences, selected
decision, and unresolved limits that future work needs; leave raw diagnostics
at their evidence location. Refresh only invalidated knowledge. Necessary
investigation is not forbidden by size, and scope/ADR disputes retain existing
human stops. Primary owners: execution decisions and active-plan refinement;
reuse the retrieval and evidence rules established in earlier slices.

Proof: Extend the three-slice scenario: after the first delivered slice,
contrary evidence invalidates a later assumption. Walk the investigation,
decision, replacement of affected remaining detail, and continuation. Confirm
the first slice's compatible proof remains valid, the changed assumption is
recoverable after interruption, and a disputed scope/ADR variant stops only
its affected path. Finish the integrated comparison table for startup, handoff,
recovery, and replanning; identify eliminated redundant reads and preserved
decision inputs. Record uncertainty rather than claim measured native savings.

Sizing: One changed-assumption decision loop; moderate confidence. Earlier slices
provide the same retrieval, evidence, and retained-state rules; no new mechanism
is added for this case. Safe boundary: all selected story examples are covered.

## Cumulative assessment and remaining concerns

The common rule is to obtain and retain evidence according to the current
decision and its validity, with authoritative recoverable state in the existing
homes. The four slices apply that rule to entry, acceptance, recovery, and
changed assumptions. None creates a per-host mechanism or another state store.

Recovery and replanning were considered as one slice; their distinct postconditions
and proof loops justify separate slices 3 and 4. Handoff production and acceptance
stay together in slice 2 because splitting them would leave an incoherent contract.
There are four Behavior slices and no preparatory Structure or testing-only slice.
No additional slice-specific refinement concern was identified in this assessment.

Evidence limitation: representative behavior review can establish the intended
read/reuse decisions and preserved recovery contract, but cannot by itself prove
a live token-reduction percentage. No such percentage is promised. The missing
commit-hook contract is an eventual delivery-context item, not authority to skip
lint or begin execution. Reassess if implementation reveals a genuine new boundary.
