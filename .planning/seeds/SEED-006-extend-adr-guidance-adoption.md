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

- **Status:** Completed 2026-09-07. Public `v0.2.1` was installed for Codex on
  live Donut and used on its current note-deletion plan.

#### Goal

As the Donut maintainer, use released `dough-adr-awareness` in Codex to establish
whether the planned isolated note-deletion publication fits Donut's current
ADRs, so the real task can proceed with a supported approach or a precise
decision to resolve. Learn whether shared guidance helps ordinary work before
investing in migration.

#### Scope

- Use independently inspected public release `v0.2.1` through the installed
  Codex skill on Donut's then-current isolated note-deletion Plan 045.
- Check the plan against current Accepted ADR 0004 and ADR 0006 while keeping
  ADR 0002 non-binding, then record the supported approach and concrete next
  step without implementing or replanning the deletion.
- Preserve the original skill, callers, other native integrations, ADR policy,
  and unrelated work. Exclude cleanup, other-tool preparation, automatic-use
  proof, generic migration/recovery, new shared behavior, and publication.

#### Evidence pointers

[Plan 015 evidence](../quick/015-prepare-donut-adr-adoption/EVIDENCE.md) records the inspected
release identity, native Codex discovery/invocation, exact writes, and
preservation. It observed that Accepted ADR 0004 and ADR 0006 support the
isolated-deletion approach, ADR 0002 remains Proposed, and Plan 045's existing
fixture-deadlock scope decision remains next.

[Story 1's evidence](../quick/014-prove-codex-adr-use/EVIDENCE.md) covers the
unchanged request-scoped context behavior in Codex, Cursor, and Claude Code.
Story 2 itself proved only the live Codex release/task use; it did not prove a
retained current installation, Cursor or Claude Code adoption, replacement
cleanup, or a newer-release update. Those remain in Stories 3 and 4.

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
