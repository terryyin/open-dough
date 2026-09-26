---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Authorized product work would start outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

Developers cannot coordinate product work they cannot see. Bug fixing and test
optimization can start from a direct request without appearing alongside queued
stories. The problem is the missing admission into shared work tracking, rather
than a distinct kind of execution or completion.

## Alternatives and Direction

For developers coordinating concurrent product work, independently accepted work
that currently bypasses the queue should become visible with ordinary story
ownership and closure, while an explicit `--one-shot` option keeps genuinely
trivial work proportionate.

Doing nothing retains the visibility gap. Manually assembling a seed, claim and
profile with existing tools is the strongest smaller alternative, but leaves
each entry workflow responsible for remembering and publishing a consistent
claim. A rule to "remember the backlog" alone does not establish that boundary.
Use shared admission and the ordinary lifecycle, with one explicit exception for
one-shot work. These alternatives are the decomposition's rationale, not claims
that a manual experiment has already been performed.

The first story tests whether minimal story admission makes real emergent work
visible without forcing a plan. The second tests whether the trivial-work
exception can remain cheap without hiding work that grows. Research and necessary
cross-layer changes belong within these outcomes, not in separate infrastructure,
dashboard or research stories.

## Story Decomposition

<a id="track-ad-hoc-work"></a>

### 1. Track ad hoc work in the product backlog

**Identity:** SEED-028#track-ad-hoc-work
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/110-track-ad-hoc-work/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f81b9e02a2bdacc3571b7c6c529ada831bf9a72cc0bb7d6b78b313ea833663ac","plan":"4553e17a2e17b3f2a8db158c745845153e1c8bf15260bc302851dbda2b4b8fa0"}}
```

**Goal:** Developers can see newly accepted product work in Taken and inspect
its purpose, owner, and execution context even when it did not originate in
the backlog, so coordination covers the work actually being done.

**Scope:** Admit authorized emergent product work into the ordinary story
lifecycle when the mission is accepted, before undertaking its work. This includes
independent investigation, profiling, exploratory testing, direct maintenance,
and newly accepted retrospective corrections, as well as bug repairs.

#### Decisions from the 2026-09-26 refinement

- When a developer or agent receives an unlisted task and decides to undertake
  it, first create or reuse its canonical story and add it directly to Taken.
  It need not wait in the queued list. Existing work must not gain a duplicate
  story or claim, and unrelated queue priorities stay unchanged.
- Put the story in a suitable existing seed, or create a seed when none fits.
  Keep the record proportionate: purpose, bounded scope, known expectations,
  stable identity, and the ordinary preparation facts. Creating a story does
  not itself require an executable plan or broad decomposition exercise.
- Publish the seed/story changes, Taken entry, and assigned agent/execution
  facts together in one admission commit on origin/main before the mission starts.
  Attempt the existing safe fast-forward refresh of the default main checkout;
  a deferred local refresh does not undo successful remote publication.
- Reuse the normal authoritative locations: the story records its goal and
  planned/planless approach; the agent profile records assignment, execution
  mode and branch context. Do not copy every fact into the seed merely because
  the admission commit publishes them together.
- Once admitted, use ordinary execution, delivery, retrospective and wrap-up.
  Originating outside the queue creates no second ongoing lifecycle.
- Completion removes the backlog entry and performs ordinary spent-story,
  seed, plan and agent-profile cleanup, preserving unfinished sibling stories
  and enduring product knowledge. A completed-story catalog, tombstones and
  historical dashboard are outside this story. Existing Git recovery remains.
- Test automation was an erroneous example in the original capture and is
  removed from the requested examples; this is not a prohibition on tracking
  any independently authorized work merely because it changes tests.

- Independent investigations enter Taken when the mission is accepted, before
  profiling, diagnosis or exploration; an implementation decision is not required.
  Clarification to identify the requested outcome is not a separate mission.
  Work within an existing story reuses that ownership. Preparation of an already
  queued story retains the existing Preparing assignment.
- New retrospective corrections have a minimal canonical story in a suitable
  seed, linked to their correction plan. Preserve the plan's evidence without
  duplicating the work item. Existing plan-homed work keeps its recorded identity
  and compatibility; this story does not automatically migrate it.
- Taken records responsibility, not execution readiness. Admission may retain
  an unselected approach and unresolved implementation questions. Authorized
  investigation can proceed; subsequent implementation still needs its normal
  scope, approach, proof and authority. A later plan attaches to the same story.
  Explicit planless authority remains necessary; no placeholder plan is required.
- An investigation can complete with a supported no-change conclusion. Apply
  ordinary closure to its accepted outcome. Incomplete work remains Taken;
  returning work to the queue or abandoning it requires the existing explicit
  disposition, not automatic cleanup on an inconclusive result.

#### Key examples

1. An accepted bug investigation has no existing story. Before diagnosis, its
   minimal story in a suitable seed, Taken entry and agent profile appear
   together on remote main. The dashboard can show purpose and ownership.
2. An optimization request has an existing relevant seed but no story for this
   outcome. Add one story there and publish admission before profiling. Later
   planning and implementation keep that identity and the measured workflow.
3. The requested fix is already part of an active story. Continue under that
   identity and ownership instead of adding another entry for its test, refactor
   or CI repair steps. A separately authorized outcome needs its own assessment.
4. A small admitted task is explicitly authorized to proceed without slice
   planning. It has a canonical story and Taken claim but needs no invented plan.
5. Admission reaches origin/main while the default checkout has pending edits.
   Report the deferred refresh and preserve those edits; the shared claim remains
   published. A failed or uncertain remote admission stops dependent execution.
6. Completion, including a supported no-change investigation, uses normal
   wrap-up. Remove the spent story and temporary plan, preserve unfinished
   siblings, and remove the Taken entry and assignment.
7. A new retrospective correction is accepted. Its minimal seed story links
   the correction plan and is the only queued/Taken entry. An existing plan-homed
   correction retains its identity and remains usable without migration.

#### Entry-path coverage

The common boundary is an independently accepted product-work mission. The
following source-backed cases establish coverage without a task-type registry:

| Entry path | Current evidence | Refinement consequence |
| --- | --- | --- |
| Bug fixing | `src/skills/dough-bug-fixing/SKILL.md` routes bounded fixes into contextual planless execution; larger/inconclusive reports enter the backlog. | Admit at acceptance of an independent diagnosis/repair mission; retain supported no-change outcomes and existing-story ownership. |
| Test optimization | `src/skills/dough-test-optimization/SKILL.md` profiles, creates a plan and invokes execution; profile-only and resolve-only modes also exist. | Admit before profiling, including independently requested profile-only or resolve-only missions. Attach a later plan to the same story. |
| Direct contextual execution | `src/skills/dough-execute-plan/SKILL.md` accepts sufficient instructions with no story, plan or queue entry. | A general bypass that must converge on admission, including direct maintenance requests, rather than enumerating task labels. |
| Retrospective corrections | `src/skills/dough-execution-retrospective/SKILL.md` can produce a bounded correction plan whose canonical home is the plan, without a seed; execution is separately authorized. | New corrections use a seed story linked to their plan; preserve existing identities. Review alone does not authorize correction execution. |
| Refactoring and CI repair within active work | `dough-post-change-refactor` returns to its caller; execution publication includes owned CI repairs. | Reuse the owning story. Do not generate child backlog entries for every process step. Standalone requests still need classification. |
| Manual testing and other observation/preparation | `dough-manual-testing` can run a standalone exploratory mission; preparing queued work already publishes a Preparing assignment. | Independent observation missions enter Taken; preparation of an existing queued story remains Preparing. Nested steps retain their owner. |

Apply the same boundary to standalone reviews and maintenance requests. Do not
create entries for ordinary conversation, recommendations not accepted for work,
or supporting steps in an active story. Source guidance owns implementation;
installed copies are updated only through a released payload.

#### Architecture and current dashboard behavior

The dashboard derives work from published backlog links, canonical documents,
plans and agent profiles. `dashboard/src/storyPurpose.ts` uses the shared purpose
reader. `src/skills/dough-product-backlog/scripts/product-backlog-home-reader.mjs`
supports an anchored seed story or a whole-document home such as a correction
plan. Therefore a seed is the ordinary story home, but not currently the only
supported home. No new dashboard-specific ad hoc record is needed.

Reuse admission/startup, identity, publication, safe default-checkout refresh,
and closure behavior across queued and emergent stories. Keep planned versus
planless execution distinct from trunk versus story-branch delivery and from
whether work originally appeared in the queue.

[ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)
places each story in one seed.
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one authoritative representation per fact, published-record dashboard
views, and reuse of cohesive solutions. These support a shared admission path
and ordinary downstream lifecycle. Dashboard and Git ADRs 0008 and 0009 remain
Proposed; they are not binding decisions.

#### Shared solution assessment

Inspection of the existing startup identifies a specific entry assumption:
`execution-source.mjs` reads an already published queued canonical home and
requires a ready assessment; `workspace-publication-select.mjs` commits a claim
from a clean fetched-trunk workspace using `takeEntry`, which refuses an absent
entry. Contextual work bypasses this queued-start contract. Generalize admission
at those existing domain owners rather than building an ad hoc executor or
publishing a temporary queued state first.

Keep story identity, Taken membership, assignment, preparation, plan and
publication as separate existing concepts. Admission must not invent readiness
or planless authority to satisfy today's startup preconditions. Preserve the
existing remote acceptance, competing claims, interrupted publication and
safe-refresh contracts. Agent reselection currently rebuilds an isolated claim;
the generalized path must retain newly admitted canonical content as well.

Existing real-Git startup fixtures and source/race/recovery cases provide the
outside-in boundary, but currently pre-create the queued source. New admission
proof must start without that entry and observe the canonical story, claim and
assignment in the same accepted remote commit. Dashboard shared readers should
consume that actual result; fixtures that pre-create it would not prove admission.
Closure should exercise the same resulting identity through existing wrap-up.
No new storage engine, service, registry or dashboard lifecycle is needed.

Direction is recorded in
[One admission path for accepted work](../NORTH-STAR.md#one-admission-path-for-accepted-work).
The developer confirmed both remaining scope choices: independent investigation
is tracked on acceptance and new corrections are seed-backed. No unresolved
product decision blocks planning. One-shot eligibility and escalation remain
in the second story.

**Plan:** [Track accepted work through the shared lifecycle](../quick/110-track-ad-hoc-work/PLAN.md).

**Evaluation:** A developer sees a formerly unlisted bug fix or optimization in
Taken with useful story details and ownership before execution; it then completes
through ordinary closure without a second lifecycle or duplicate record.

**Depends on:** Existing publication, identity, dashboard and closure contracts;
no new prerequisite story. The existing optimization-continuation story owns
whether a created optimization plan continues into implementation or is queued.
This story admits the accepted investigation earlier and keeps one identity
through that handoff; it does not expand implementation authority.

**Effort hypothesis:** The larger of these two stories, with the main risk in
claim recovery and alignment of callers, rather than new domain concepts. No project S/M/L band
definitions were found, so a numeric or band estimate is deliberately unset.

**Safe stopping point:** Independently accepted emergent work can join Taken
with coherent details and complete through the ordinary lifecycle, without
requiring a one-shot option or completed-story archive.

<a id="one-shot-work"></a>

### 2. Complete trivial work with --one-shot and track it if it grows

**Identity:** SEED-028#one-shot-work
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/112-one-shot-work/PLAN.md","assessment":"not-ready","reasons":["Shared admission is still Taken; inspect its delivered retained-work continuation interface and bind the escalation proof before execution."],"basis":{"document":"ce36d6d44c965d602d1479d6b3a251eb381a26521a087deb082b1691dd0433de","plan":"59863aaa03a9ac8413cd14e3804953ddb5b6beb6d2ea652fdb075e8891b57d5f"}}
```

**Goal:** Developers can explicitly request a genuinely trivial change without
publishing a Taken claim, while work that grows becomes visible through ordinary
story admission before further execution.

**Scope:** Provide `--one-shot` as an explicit option at the applicable work-entry
workflows, using one shared meaning. Attempt one coherent, verifiable result and
publish that result to remote main with ordinary reconciliation and verification.
Successful one-shot work leaves no Taken claim history or temporary seed, plan
or assignment for that attempt. For a queued story, its result commit also removes
the entry and spent source/plan while preserving unfinished siblings. Its result
commit and enduring product changes remain. This is distinct from planless execution and is not another
branching mode.

When the attempt proves too large or uncertain to finish coherently in one go,
preserve attributable edits and proof, create or reuse its canonical story, and
publish ordinary Taken admission before continuing. Use the first story's
publication, refresh, ownership and closure behavior. Do not first publish an
incomplete result merely to maintain the one-shot label. No forced reset or
reversion of unrelated work is allowed.

Delivering to main does not require modifying the shared default checkout.
Use the ordinary safe workspace and remote-publication contract; attempt safe
local refresh after successful publication. The option does not bypass tests,
required review, publication authority or unresolved architectural decisions.

**Evaluation / key examples:**

- An explicit `--one-shot` request yields one complete, verified small change:
  remote main contains the result and no Taken announcement or spent planning
  artifact was published for the attempt.
- Investigation reveals a larger change or additional coordinated steps:
  publish the ordinary story and Taken claim before continuing, keeping valid
  work and evidence rather than restarting or creating duplicate identities.
- An ordinary Taken story is planless: it stays tracked. `--one-shot` does not
  erase existing claims or their history, and completing quickly alone does not
  silently select the option.

**Depends on:** [Track ad hoc work in the product backlog](#track-ad-hoc-work)
for safe escalation into ordinary admission. Existing workspace/publication
contracts apply; exclusive access to the default checkout is not required when
an owned workspace can publish safely.

**Safe stopping point:** Trivial requests can finish without tracking ceremony,
and every oversized attempt has an honest tracked continuation. No further
story or completed-work archive is needed.

**Effort hypothesis:** Smaller than shared admission, but with meaningful recovery
and escalation risk; low confidence until eligibility and applicable entry
workflows are refined. S/M/L remains unset because project bands are undefined.

#### One coherent attempt

Use `--one-shot` explicitly for an independently requested outcome that the agent
can reasonably complete and verify in one bounded attempt. Keep its meaning shared
across direct contextual work and the mission entry workflows covered by admission
(bug work, optimization, observation and reviews), rather than adding a per-skill
meaning. The option selects tracking behavior; ordinary task authority, validation,
workspace ownership and remote publication still apply.

Eligibility rule: understood outcome and expected result, no known need
for a multi-slice plan or unresolved product/architecture choice, and a credible
focused verification path. No universal time, file-count or lines-changed threshold
is proposed. Brief diagnosis and a normal test/fix loop can belong to one coherent
attempt. Repeated failure to converge, discovery of separate outcomes or need for
substantial investigation is evidence to leave the one-shot path. Existing
project-specific limits still apply.

A supported no-change finding can complete the request without manufacturing an
empty commit. Successful changed work publishes its complete result and performs
normal verification/CI and resource-cleanup obligations. No plan, completion note,
assignment or claim is manufactured solely to satisfy a workflow. A transport
failure or delayed CI verdict alone is publication/verification recovery, not
proof the product task has become larger. Preserve the owned result and recover
publication without duplicating it; report completion only on actual evidence.

Existing Taken work retains its identity, owner and lifecycle. The flag must not
remove another agent's claim or rewrite published history. A branch flag cannot
silently redirect a successful one-shot result away from the authorized trunk;
contradictory explicit delivery instructions need resolution before work starts.
Default to the existing safe owned-workspace mechanism; do not add a direct-main
editing prerequisite or a new workspace manager.

#### Existing solutions and the remaining gap

`dough-execute-plan` already supports contextual planless execution, focused proof,
ordinary publication, completion/CI handling and wrap-up. Its oversized-slice
procedure preserves compatible work and proof, but currently treats replanning
permission independently and can continue without a canonical story. One-shot
escalation must converge on the admission story's ordinary canonical home and
claim instead of creating another continuation mechanism.

The current shared admission work is Taken, not delivered. Its published plan
owns atomic story/claim publication and ordinary continuation; this story owns
the transition from an already-started unclaimed attempt, including preserved
edits and proof. Inspect the delivered admission boundary before implementation;
do not invent its API or duplicate it while it is still being built.

The current contextual path creates a workspace without a claim and the common
publication helpers already handle remote reconciliation and safe local refresh.
Reuse these responsibilities. One-shot success must leave no published temporary
tracking, so validate the result plus cleanup before the result is published.
Keep any necessary interrupted-attempt recovery with existing workspace/conversation
state rather than adding a one-shot registry or dashboard state.

#### Agreed boundaries

- Both unlisted requests and queued stories may use `--one-shot`. A queued
  story finishes with its result and ordinary spent-record cleanup in the same
  commit, without an intermediate Taken claim. Already-Taken work keeps its
  current owner and lifecycle; do not remove or conceal its history.
- Escalation automatically admits the work and continues within the original
  authorization, including ordinary planning when needed. Ask only when the
  scope, authority, disputed constraint or ownership requires a human decision.
  An explicit stop or `--no-replan` instruction still limits continuation; it
  cannot authorize silently continuing oversized untracked work.
- Recheck queued ownership against freshly fetched trunk before publishing or
  escalating. Another agent's intervening claim or preparation assignment is
  competing ownership; preserve local work and stop that publication rather
  than deleting the other's record. This supplies safe optimistic coordination
  without inventing a hidden one-shot claim.
- Eligibility is judged from an understood, coherent outcome and credible
  verification path. An agent that already knows the work is larger enters
  normal admission before starting. A short diagnosis/test/fix loop can remain
  one attempt; failure to converge or discovery of multiple outcomes triggers
  escalation. Verification and delivery recovery alone do not establish growth.
- Use the common option at independently invoked mission entry workflows, with
  shared semantics. It grants no additional action permission. Preparation-only
  requests keep their existing publication/disposition contract; the flag does
  not automatically land a draft or implement a recommendation.

**Additional key examples:** A queued tiny change publishes its result and
removes only its own spent story; a concurrent Taken claim stops that cleanup;
an oversized unlisted attempt publishes a new minimal story and claim while
preserving local edits, then plans/continues within scope; a delayed CI verdict
retains ordinary verification ownership without fabricating a backlog entry.

**Plan:** [Complete one-shot work or admit its continuation](../slice-plans/112-one-shot-work/PLAN.md).

No product question remains from this refinement. The first story's published
implementation remains an execution dependency; reconcile the admission
interface and retained-work continuation against that delivered version before
execution. Planning does not assume it has already landed.

## Ordering and Scope Reduction

Queue these two stories in this order at the original story's current position:
shared admission first, then one-shot execution with escalation. Preserve unrelated
queue order and existing Taken assignments. Admission directly advances the
backlog's shared-progress visibility direction and supplies the second story's
fallback. Drop or defer one-shot first if scope must shrink; admission remains a
complete useful outcome on its own.

The original story keeps its identity and its ordinary-lifecycle outcome. Only
one new story is introduced. Completed-story retention, historical dashboards,
new lifecycle categories and separate per-process tracking implementations remain
outside both stories. Research into qualifying processes is part of refining
the first story, not an additional queued research deliverable.

The agreed name is `--one-shot` (2026-09-26). Architecture direction is recorded
in [Proposed ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md).
Decomposition and backlog placement authorize neither executable planning nor
implementation. Surface the first story when accepted work would bypass shared
tracking; surface the second when tracking overhead overwhelms a trivial request.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing test optimization continuation](SEED-004-extract-and-adopt-project-guidance.md#continue-test-optimization-plans).
