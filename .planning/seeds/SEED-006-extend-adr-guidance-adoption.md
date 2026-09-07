---
id: SEED-006
status: dormant
planted: 2026-09-06
planted_during: Scope correction after first native Codex ADR replacement
trigger_when: Deliver the revised installation and update workflow in Donut
scope: medium
---

# SEED-006: Complete Donut's one-time adoption and ordinary update

## Why This Matters

A useful assessment was demonstrated in Donut, but a durable installation that
survives a meaningful release update has not been established. The owner now
prioritizes that complete client path over further extraction. Adoption is a
one-time project change; it does not require a permanent migration capability.

The earlier Codex installation was temporary and subsequently removed according
to the adoption discussion. Its task conclusion remains useful evidence, but
it does not prove the current installation exists. Reinspect the live state
before planning writes; do not assume an integration is still ready.

## Constraints

- Use the simplified released contract from
  [SEED-001 Story 7](SEED-001-install-and-update-open-dough.md#standalone-client-update),
  consistent with the owner's direction and
  [Proposed ADR 0004](../../docs/adrs/0004-client-installation-and-update.md).
- The same shared guidance must work in Codex, Cursor, and Claude Code. Treat
  each native observation independently and leave missing evidence pending.
- Handle actual caller/context differences manually in Donut. Shared changes
  belong in Open Dough before release; do not patch installed guidance or add
  a reusable replacement procedure to `RECOGNITION.md` or `dough-update`.
- Preserve human ADR authority, unrelated project work, and usable original
  guidance until its affected integrations have a working replacement.
- This backlog review authorizes no Donut edits or release publication.

## Completed work

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

**Status:** Completed 2026-09-07. Public `v0.2.1` was installed for Codex on
live Donut. Native `$dough-adr-awareness` assessed Plan 045: Accepted ADR 0004
and ADR 0006 confirm the isolated-deletion approach; ADR 0002 stays Proposed;
Plan 045's next step remains the existing fixture-deadlock scope decision.
[Plan 015](../quick/015-prepare-donut-adr-adoption/PLAN.md) records release
identity, native use, exact Codex writes, and preservation.

#### Goal

As the Donut maintainer, use released `dough-adr-awareness` in Codex to establish
whether the planned isolated note-deletion publication fits Donut's current
ADRs, so the real task can proceed with a supported approach or a precise
decision to resolve. Learn whether shared guidance helps ordinary work before
investing in migration.

#### Scope

- **Selected task:** Donut [SEED-009 Story 5 — Delete a note locally without
  transferring its private data](../../../doughnut/.planning/seeds/SEED-009-git-backed-local-notebook-workflow.md#story-5),
  currently #1 on Donut's product backlog. Its existing
  [Plan 045](../../../doughnut/.planning/quick/045-publish-local-note-deletion/PLAN.md)
  is assessment input and the destination for the useful conclusion.
- **One question:** Does the planned isolated single-note deletion — complete-diff
  isolation before mutation, soft-delete that leaves authored links, keeping the
  notebook or folder container without manufacturing a README, and rolling back
  on publication failure — respect current notebook-format and failure-handling
  guidance? Which relevant constraint confirms the approach, calls for a
  correction, or requires a human decision before deletion work proceeds?
- Reassess only the live task, relevant ADRs, required local context, and paths
  affected by the selected Codex integration. Install/update that integration
  from an independently inspected public release, then explicitly invoke its
  installed shared skill in a fresh native Codex session. Retain only context
  needed for this question without creating architectural policy.
- Plan 045 already cites Donut's Accepted ADR 0004, **OKF-compatible notebook
  Markdown**, and ADR 0006, **Failure handling**, and treats ADR 0002 as
  Proposed. Recheck current status and relevant decisions at execution. A
  supported confirmation is useful; a design change is not required to
  demonstrate value.
- Record a concise, reviewed conclusion in Plan 045: what is confirmed or needs
  correction, why, and its concrete effect on the next deletion step. Record
  release/tag/commit, native discovery and invocation, exact changed paths,
  and preservation evidence in Open Dough's Plan 015.
- Preserve the original skill, discovery links, callers, other-tool integrations,
  ADR policies/statuses, and unrelated concurrent work. Assessment must use the
  shared skill without loading the original alongside it. A small assessment
  entry is the only deletion-task change in this story.

**Excluded:** Implementing, verifying, or replanning the deletion story;
repairing Donut fixture deadlocks; assessing later SEED-009 stories; auditing
other Donut work; retargeting callers; removing the original; automatic-use
proof; other-tool preparation; generic migration or recovery; new shared-skill
behavior; further release publication or infrastructure. The remaining one-time adoption is Story 3; a meaningful later update is Story 4.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| The inspected release is installed for Codex and the deletion plan is current | Explicitly use its shared ADR skill on the selected question | Advice cites current relevant decisions and explains whether isolation, soft-delete, container preservation, and failure rollback fit them. Plan 045 records the supported approach and next step; an ADR list or invocation marker alone is insufficient. |
| The existing deletion approach already fits the ADRs | Review the assessment against the plan and records | Record why it can proceed and which constraints the next step must preserve. No unnecessary design change or implementation is added to prove usefulness. |
| A real task choice conflicts with an unambiguous Accepted ADR | Assess that choice | Cite the incompatible choice and record the specific human decision needed before dependent deletion work. Do not resolve the decision or change the ADR on the human's behalf. |
| The release is unavailable, required context/status is unresolved, or the shared skill cannot work independently | Attempt the affected preparation or assessment | Preserve effective guidance, record the precise gap, and leave acceptance pending. Do not substitute a fixture, load the original to obtain success, invent policy, or expand into a repair project. |

#### Readiness and acceptance

- **Prerequisite:** Completed Story 1 and inspected public `v0.2.1`, which
  contains Plan 013's verified replacement behavior and Story 1's
  request-scoped context fix. Local fixture tags still do not count.
- **Done:** Independent native Codex use produces a reviewed answer to the
  selected question in Plan 045; Plan 015 records release identity, native
  discovery/invocation, exact changes, and coexistence. A concrete task/ADR
  decision can be a useful result; an unresolved delivery or skill/context gap
  cannot.
- **Stop / learn:** Record ineffective advice or a blocking gap and reconsider
  remaining adoption priority. Do not add a second task, another tool, or a
  shared-source fix to make this story pass. If the task has moved on, revisit
  selection with Donut's product backlog before dependent planning rather than
  assess a stale plan.
- **Effort hypothesis:** S–M, medium confidence for one installation-to-assessment
  pass against the published release; gap repairs excluded.

| Platform | Prior evidence reusable only where unchanged | Pending live evidence |
| --- | --- | --- |
| Codex | Story 1's native discovery, explicit/automatic use, context behavior, coexistence, and linked unchanged delivery coverage | Completed in Plan 015 for the selected release and task; current installation persistence must be rechecked |
| Cursor | Story 1's independent native discovery/invocation, context behavior, coexistence, and linked unchanged delivery coverage | Donut adoption in Story 3; no inference from Codex |
| Claude Code | Story 1's independent native discovery/invocation, context behavior, coexistence, and linked unchanged delivery coverage | Donut adoption in Story 3; no inference from Codex |

See [Story 1's per-platform evidence](../quick/014-prove-codex-adr-use/EVIDENCE.md).
Any later shared rule/skill change requires separate scope and independent
native discovery, invocation/application, intended behavior, affected
installation/update, and coexistence acceptance in all three tools.

Open Dough constraints remain [ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md)
(human decision ownership) and [ADR 0003 — Tagged release versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(inspected public version, no branch/fixture substitute). This refinement makes
no new architectural decision or exception.

## Remaining stories

<a id="finish-donut-adr-adoption"></a>

### 3. Adopt the simplified release once in Donut and use it

- **Status:** Revised 2026-09-07; not executed. Refine from live state; old
  platform-preparation and cleanup fragments are not execution plans.
- **Goal:** Donut uses the released shared ADR guidance through its actual
  native integrations, with required local context preserved and redundant
  borrowed guidance removed in a reviewable project change.
- **Scope:** Inspect the current installation, original, context, and callers.
  Install the complete published payload in each affected native integration;
  use explicit force for the known initial transition if necessary. Verify
  readiness, repair the actual callers, and remove the unneeded original once.
  Keep the shared behavior unchanged; handle this project's specifics directly.
- **Useful outcome:** Apply the installed guidance to an existing live Donut
  task. Reuse Plan 045's assessment where still valid, or select the current
  relevant task rather than manufacturing work or repeating a stale question.
  Leave changes and the concise useful conclusion for Donut's owner to review
  and commit. A task assessment does not authorize implementation of that task.
- **Acceptance:** Codex, Cursor, and Claude Code each independently discover and
  explicitly invoke their installed skill; architecture-shaped work reaches it
  automatically where required. Native behavior follows current Donut ADRs and
  human authority without loading the removed original or borrowing source
  files. Required context, all repaired callers, and unrelated guidance survive.
  Record actual release, affected paths, useful result, and per-tool evidence.
- **Completion boundary:** The resulting installation and context are retained
  as project changes for review, rather than removed as temporary test files.
  A plain updater invocation resolves its remembered source and reports current
  without writes. This is not proof of a newer-release update.
- **Dependencies:** SEED-001 Story 7's published, verified release. Readiness
  work is part of this one adoption outcome; planning extraction is not required.
- **Excluded:** Generic matching, local-edit merging, automated recovery,
  configuration without an actual need, and migrating the other client projects.

<a id="preserve-donut-adr-adoption-on-update"></a>

### 4. Use a meaningful newer release through Donut's ordinary updater

- **Status:** Revised 2026-09-07; unplanned. Highest next priority once Story 3
  is done and a genuinely useful newer release exists.
- **Goal:** Run `dough-update` in Donut, receive a wanted shared improvement,
  use it successfully, and leave the changes for client review and commit.
- **Scope:** Select an actual wanted release, normally the released
  story-refinement skill from SEED-004 Story 6 if no earlier improvement exists.
  Invoke the updater with no source URL, then use the newly installed or updated
  guidance on an existing Donut task. Observe each affected native integration.
- **Acceptance:** Record old/new release identities, actual complete payload and
  record changes, native discovery/invocation or application, useful work, and
  coexistence separately in Codex, Cursor, and Claude Code. The adopted ADR
  context and callers remain valid; the retired original and recognition file
  stay absent. Leave reviewable changes without automatic commit/push.
- **Completion boundary:** This must include real payload writes and use of the
  improvement. A same-version no-op, a fixture, or a version-only public release
  cannot complete the story. If an appropriate release is already available,
  do this before further extraction; otherwise the next useful extraction
  supplies it. Do not wait on a monitoring service or invent a change.
- **Dependencies:** Story 3 and a useful newer release under ADR 0003.
- **Excluded:** Another cleanup pass, new-match discovery, patched client-skill
  support, rollback machinery, or a generic migration system.

## Evidence and next action

Completed Stories 1 and 2 remain historical evidence. The revised Stories 3 and
4 are pending in Codex, Cursor, and Claude Code; file equality or another host's
success is insufficient. Use existing native checks only where their inputs and
behavior remain unchanged. Replan the next selected story against actual Donut
state and the inspected release before execution.

The [product backlog](../PRODUCT-BACKLOG.md) controls priority. This seed ends
with one retained adoption and one useful ordinary update in Donut. Other known
projects use the separately scoped one-time adoption story in SEED-004.
