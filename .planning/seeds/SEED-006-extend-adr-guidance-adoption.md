---
id: SEED-006
status: dormant
planted: 2026-09-06
planted_during: Scope correction after first native Codex ADR replacement
trigger_when: Continue beyond the first bounded ADR-guidance replacement
scope: large
---

# SEED-006: Extend ADR-guidance adoption after the first successful replacement

## Why This Matters

For the Open Dough maintainer, the first bounded Codex replacement now works,
but the original plan mixed that learning with post-cleanup use, generic edge
cases, fresh installation, release updates, and a live three-tool Donut
migration. Those are independently valuable outcomes and should not be paid for
before they are needed.

The near-term purpose is practical: make the released guidance usable in Open
Dough through SEED-001 and in Donut through a few explicit follow-up stories.
Manual repair is an acceptable fallback for failure and ambiguity cases.

## Alternatives and Decision

| Option | Decision |
| --- | --- |
| Keep the original 40-slice plan | Rejected: it hides several outcomes and creates unsafe pressure to finish edge cases before the first useful adoption. |
| Stop after the first native Codex cleanup and repair failures manually | Selected baseline: the completed result remains useful even if every follow-up is cancelled. |
| Continue only the next real adopter journey | Revised 2026-09-07: one real Donut task first; story-refinement extraction before remaining readiness and separate cleanup. |
| Generalize every install/update/error case now | Deferred until a concrete failure or another adopter makes it valuable. |

## Story Decomposition

<a id="prove-codex-use-after-replacement"></a>

### 1. Prove a completed Codex ADR replacement is usable

- **Status:** Completed 2026-09-07; spent Plan 014 removed. The
  [acceptance evidence and learning](../quick/014-prove-codex-adr-use/EVIDENCE.md)
  remain available alongside repeatable native checks.
- **Outcome:** Explicit and automatic Codex use work after the original is
  removed. Advice follows Accepted ADR 0001, keeps Proposed ADR 0002 non-binding,
  and leaves the entire adopter unchanged.
- **Learning:** Require only context needed for the current request. The
  owner-authorized shared-skill clarification passed independent positive and
  real-status-disagreement checks in Codex, Cursor, and Claude Code. No adopter
  policy was invented to obtain a passing test.
- **Delivery boundary:** Shared source is verified but not released. Live Donut
  preparation, replacement, and later-update preservation remain separate.

<a id="prepare-donut-adr-adoption"></a>

### 2. Use released ADR guidance on one real Donut task

**Status:** Awaiting story review after 2026-09-07 execution. Slice 1 of
[Plan 015](../quick/015-prepare-donut-adr-adoption/PLAN.md) completed an
ineligible public-release decision; slices 2-3 did not start. The selected
Donut login-recovery task (SEED-014 Story 1 / Plan 047) was completed and
removed, so substituting another task would change this story's boundary.
Public latest remains `v0.2.0`, which still lacks Plan 013 replacement
behavior and Plan 014's request-scoped context fix. Execution stays stopped
until the owner supplies the next release version and a replacement real task.

#### Goal

As the Donut maintainer, use released `dough-adr-awareness` in Codex to establish
whether the planned login-recovery response fits Donut's current ADRs, so the
real task can proceed with a supported approach or a precise decision to resolve.
Learn whether shared guidance helps ordinary work before investing in migration.

#### Scope

- **Selected task:** Donut [SEED-014 Story 1 — Return to Donut without browser
  history blocking login or an unexplained error](../../../doughnut/.planning/seeds/SEED-014-reliable-login-with-browser-history.md#story-1).
  Its existing [Plan 047](../../../doughnut/.planning/quick/047-reliable-login-with-browser-history/PLAN.md)
  is assessment input and the destination for the useful conclusion.
- **One question:** Does the planned self-contained server response for an
  oversized login request, including its homepage link, respect the current
  routing boundary and failure-handling guidance? Which relevant constraint
  confirms the approach, calls for a correction, or requires a human decision
  before the recovery work proceeds?
- Reassess only the live task, relevant ADRs, required local context, and paths
  affected by the selected Codex integration. Install/update that integration
  from an independently inspected public release, then explicitly invoke its
  installed shared skill in a fresh native Codex session. Retain only context
  needed for this question without creating architectural policy.
- The existing plan already cites Donut's Accepted ADR 0005, **Web routes**,
  and ADR 0006, **Failure handling**. Recheck current status and relevant
  decisions at execution. A supported confirmation is useful; a design change
  is not required to demonstrate value.
- Record a concise, reviewed conclusion in Plan 047: what is confirmed or needs
  correction, why, and its concrete effect on the next recovery step. Record
  release/tag/commit, native discovery and invocation, exact changed paths,
  and preservation evidence in Open Dough's Plan 015.
- Preserve the original skill, discovery links, callers, other-tool integrations,
  ADR policies/statuses, and unrelated concurrent work. Assessment must use the
  shared skill without loading the original alongside it. A small assessment
  entry is the only login-task change in this story.

**Excluded:** Implementing or replanning the login story; assessing its entire
search-history migration; auditing other Donut work; retargeting callers;
removing the original; automatic-use proof; other-tool preparation; generic
migration or recovery; new shared-skill behavior; release publication or
infrastructure. Remaining tools stay in Story 2b, cleanup in Story 3, and
later-update preservation in Story 4.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| The inspected release is installed for Codex and the recovery plan is current | Explicitly use its shared ADR skill on the selected question | Advice cites current relevant decisions and explains whether the response, homepage link, and failure visibility fit them. Plan 047 records the supported approach and next step; an ADR list or invocation marker alone is insufficient. |
| The existing recovery approach already fits the ADRs | Review the assessment against the plan and records | Record why it can proceed and which constraints the next step must preserve. No unnecessary design change or implementation is added to prove usefulness. |
| A real task choice conflicts with an unambiguous Accepted ADR | Assess that choice | Cite the incompatible choice and record the specific human decision needed before dependent recovery work. Do not resolve the decision or change the ADR on the human's behalf. |
| The release is unavailable, required context/status is unresolved, or the shared skill cannot work independently | Attempt the affected preparation or assessment | Preserve effective guidance, record the precise gap, and leave acceptance pending. Do not substitute a fixture, load the original to obtain success, invent policy, or expand into a repair project. |

#### Readiness and acceptance

- **Prerequisite:** Completed Story 1 and an inspected public release containing
  Plan 013's verified replacement behavior and Story 1's request-scoped context
  fix. Publication remains pending in the existing records; local fixture tags
  do not count. The maintainer supplies the version through the existing release
  process. Publication is a separate prerequisite, not an adoption deliverable.
- **Done:** Independent native Codex use produces a reviewed answer to the
  selected question in Plan 047; Plan 015 records release identity, native
  discovery/invocation, exact changes, and coexistence. A concrete task/ADR
  decision can be a useful result; an unresolved delivery or skill/context gap
  cannot. No live acceptance evidence was produced by this refinement.
- **Stop / learn:** Record ineffective advice or a blocking gap and reconsider
  remaining adoption priority. Do not add a second task, another tool, or a
  shared-source fix to make this story pass. If the task has moved on, revisit
  selection before dependent planning rather than assess a stale plan.
- **Effort hypothesis:** S–M, medium confidence for one installation-to-assessment
  pass after release availability; publication waits and gap repairs excluded.

| Platform | Prior evidence reusable only where unchanged | Pending live evidence |
| --- | --- | --- |
| Codex | Story 1's native discovery, explicit/automatic use, context behavior, coexistence, and linked unchanged delivery coverage | Selected-release installation/update, discovery, explicit use, useful login assessment, and coexistence in this story |
| Cursor | Story 1's independent native discovery/invocation, context behavior, coexistence, and linked unchanged delivery coverage | Donut readiness in Story 2b; no inference from Codex |
| Claude Code | Story 1's independent native discovery/invocation, context behavior, coexistence, and linked unchanged delivery coverage | Donut readiness in Story 2b; no inference from Codex |

See [Story 1's per-platform evidence](../quick/014-prove-codex-adr-use/EVIDENCE.md).
Any later shared rule/skill change requires separate scope and independent
native discovery, invocation/application, intended behavior, affected
installation/update, and coexistence acceptance in all three tools.

Open Dough constraints remain [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md)
(human decision ownership) and [ADR 0003 — Tagged release versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(inspected public version, no branch/fixture substitute). This refinement makes
no new architectural decision or exception.

<a id="prepare-remaining-donut-adr-integrations"></a>

### 2b. Prepare Donut's remaining ADR integrations

- **Status:** Split from former Story 2 on 2026-09-07; not executed or planned.
  Ordered after story-refinement extraction in the product backlog.
- **Goal:** Make the shared ADR guidance independently usable in each remaining
  affected Donut tool, using the first task's evidence and retained context.
- **Scope:** Reassess drift and prepare only integrations not yet ready; normally
  Cursor and Claude Code after a Codex first task. Install/update each selected
  native root from the inspected release and demonstrate explicit native use
  on the same real task or another existing relevant task. Reuse earlier proof
  only where unchanged. Keep the original, its links, and all callers intact.
- **Acceptance:** Each remaining tool discovers/invokes its own installed shared
  skill, uses Donut's current ADR context without original fallback, and produces
  applicable advice. Record per-tool release, paths, changes, and coexistence.
  An unavailable or ineffective tool stays pending; another host cannot prove it.
- **Excluded:** Caller repair, removal, automatic-use proof, update preservation,
  generic conflict recovery, and new shared features. Those are separate work.
- **Effort hypothesis:** M, low confidence until the remaining hosts are known.
- **Depends on:** Story 2's useful real task result and a still-valid release.
  Story-refinement extraction is a priority choice, not a technical dependency.
  Reconsider whether further migration is valuable before starting.

<a id="finish-donut-adr-adoption"></a>

### 3. Finish Donut's ADR-guidance replacement

- **Status:** Scope aligned 2026-09-07; not executed.
  [Plan 016](../quick/016-finish-donut-adr-adoption/PLAN.md) needs planning review
  against Stories 2 and 2b before execution.
- **Goal:** As the Donut maintainer, remove the redundant original after all
  three tools are ready, with every caller repaired and ADR behavior still
  effective.
- **Scope:** Reinspect the assessed paths, retarget callers, remove the original
  and obsolete discovery link, then verify explicit and automatic use in each
  tool. Do not add generic migration or failure recovery.
- **Key examples:** All affected tools use their released skill after removal,
  follow Donut's current authoritative ADR statuses and constraints, keep Proposed
  decisions non-binding, and preserve unrelated work. Recheck live records; do
  not substitute the historical fixture's ADR numbers or statuses.
- **Effort hypothesis:** L, low confidence; six independent native observations
  follow one bounded live cleanup.
- **Depends on:** Stories 2 and 2b: every affected live tool is independently
  ready and the first task demonstrated useful behavior. Revalidate readiness
  and caller inventory before removal; cleanup remains separately authorized.

<a id="preserve-donut-adr-adoption-on-update"></a>

### 4. Keep Donut's ADR adoption intact during a newer-release update

- **Status:** Conditional follow-up; not executed. The revised
  [Plan 017 scope record](../quick/017-preserve-donut-adr-adoption/PLAN.md) needs
  planning review when a real newer release is available and wanted.
- **Goal:** As the Donut maintainer, receive a wanted shared-guidance improvement
  without recreating the retired original or breaking repaired callers.
- **Scope:** After completed replacement, perform one ordinary update to an
  inspected, genuinely newer public release in each affected native tool. Verify
  actual payload/version writes, continued ADR use, retained context/callers,
  original/link absence, and preservation of unrelated and other-tool guidance.
- **Acceptance:** Record the old/new release identities, intended improvement,
  actual changes, and native update-to-use evidence per host. A current-version
  no-op or a version-only fixture bump cannot establish preservation through
  meaningful payload writes. Missing native evidence remains pending.
- **Excluded:** Creating a release solely for this check, recurring discovery of
  new matches, generic rollback or migration, and another cleanup pass. Reuse
  existing no-op/update-contract evidence wherever unchanged.
- **Effort hypothesis:** M, medium confidence once a suitable release exists.
- **Depends on:** Story 3 and an actual wanted newer release. Until both hold,
  this is conditional future work and does not delay planning-skill extraction.

<a id="generalize-fresh-adr-adoption"></a>

### 5. Generalize fresh-install ADR adoption beyond Donut

- **Status:** Candidate, unqueued, and unplanned.
- **Goal:** Let a new adopter combine installation and optional ADR cleanup in
  one successful journey across Codex, Cursor, and Claude Code.
- **Scope:** The old generic fresh-install and post-install update cases. It does
  not block Open Dough or Donut adoption.
- **Effort hypothesis:** L, low confidence.
- **Depends on:** A concrete third adopter or repeated manual cost.

<a id="automate-adr-adoption-exceptions"></a>

### 6. Handle ambiguous and failed ADR replacements automatically

- **Status:** Candidate, unqueued, and unplanned.
- **Goal:** Preserve effective guidance automatically when equivalence,
  installation, shared-source readiness, or renamed mixed guidance is uncertain.
- **Scope:** The old refusal, failed-install, shared-original, and renamed-match
  cases. Manual diagnosis and repair remain the accepted current fallback.
- **Effort hypothesis:** L, low confidence.
- **Depends on:** A real failure whose repeated cost justifies automation.

## Mapping from the former 40-slice plan

| Former slices | New home |
| --- | --- |
| 1-4a | Completed Plan 013 / SEED-004 Story 4 |
| 5-6 | Completed Story 1 / retained acceptance evidence (Plan 014 removed) |
| 7-9 and 11-12 | Story 6, unplanned |
| 10 and 13-21 | Story 5, unplanned |
| 22-29 | Story 2 / revised Plan 015 for first-task use; Story 2b for remaining hosts, unplanned |
| 30-37 | Story 3 / Plan 016 |
| 38-40 | Story 4 / Plan 017 |

## Ordering and Scope Reduction

Story 1 closed the disposable post-cleanup-use uncertainty. Story 2 now seeks
one real Donut task result in one tool, retaining the original. The next selected
outcome is story-refinement extraction in SEED-004, followed by Story 2b's
remaining readiness and Story 3's separately authorized cleanup. The backlog
then places story decomposition ahead of the conditional newer-update Story 4.
Stories 5 and 6 remain unqueued until concrete experience makes them valuable.

Open Dough self-adoption stays in SEED-001. No story here duplicates or gates
that work. Native Cursor and Claude Code behavior introduced by future changes
must still be verified independently under the repository acceptance guard;
missing evidence remains pending rather than inferred from Codex.

## Open Decisions

Ordering and scope were accepted on 2026-09-07. During Story 2 refinement, the
owner selected Donut's login-recovery story in Codex, limited to its recovery
response's fit with routing and failure-handling ADRs. The required public
release identity remains unresolved and is supplied through the existing
human-owned release process. This refinement authorizes no execution, release
publication, or mutation of Donut.

## When to Surface

Story 1 is complete. Story 2 is refined around the selected login-recovery
assessment; Plan 015 is slice-planned and refined. Execute live installation only
after inspecting a published release with the verified replacement behavior
and context fix.
Surface Story 2b after first-task learning and when its backlog priority is
reached; Story 3 after all live readiness evidence; Story 4 only for a wanted
newer release. Surface candidate stories only after their named trigger.

## Breadcrumbs

- Completed source plan: `.planning/quick/013-adopt-adr-awareness/PLAN.md`.
- Owner scope correction, 2026-09-06: prefer one or two practical adopter
  successes; manually repair failure cases; split the 40-slice remainder.
- Existing Open Dough self-adoption home:
  `SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater`.
