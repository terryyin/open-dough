---
id: SEED-006
status: active
planted: 2026-09-06
planted_during: Scope correction after first native Codex ADR replacement
trigger_when: The standalone client release is available for Donut
scope: medium
---

# SEED-006: Use and update shared guidance in Donut

## Goal

Donut benefits from released Open Dough guidance and receives useful improvements
through ordinary updates. Handle its actual context and callers manually.
Inspect the live installation when starting each story.

## Stories

<a id="finish-donut-adr-adoption"></a>

### 3. Adopt the simplified release once in Donut and use it

**Status:** Unplanned.
**Goal:** Use released shared ADR guidance on an existing Donut task.
**Scope:** Install the released payload, retain Donut's required context, repair
its actual callers, and delete redundant borrowed guidance. Follow the established
Codex, Cursor, and Claude Code layout conventions. Leave a reviewable project change.
**Evaluation:** On one real architecture-related task, the installed guidance
uses Donut's current decisions and gives the owner an actionable conclusion.
The installed files and required local context are ready for ordinary use.
**Effort:** M, medium confidence; assumes manual project-specific edits.
**Depends on:** The standalone client release in SEED-001 Story 7.

<a id="preserve-donut-adr-adoption-on-update"></a>

### 4. Use a meaningful newer release through Donut's ordinary updater

**Status:** Waiting for adoption and a wanted newer release.
**Goal:** Receive a useful shared improvement and use it on real Donut work.
**Scope:** Invoke `dough-update` using the remembered source, review the changed
payload and version, and apply the improvement to an existing task. Keep Donut's
required context and callers usable.
**Evaluation:** Donut receives the actual newer payload and the owner can judge
its benefit on the task. Review and commit the client changes in the normal way.
**Effort:** S, medium confidence; assumes the released updater works.
**Depends on:** Story 3 and a useful newer release. Do this as soon as both exist;
SEED-004 Story 6 can supply the improvement when needed.

## Delivered capabilities

<a id="prove-codex-use-after-replacement"></a>

### 1. Prove a completed Codex ADR replacement is usable

**Status:** Complete.
**Goal and scope:** Apply shared ADR guidance with the adopter's own decision context.

<a id="prepare-donut-adr-adoption"></a>

### 2. Use released ADR guidance on one real Donut task

**Status:** Complete.
**Goal and scope:** Assess a Donut task against its current architecture decisions.
