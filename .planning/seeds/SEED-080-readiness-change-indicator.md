---
id: SEED-080
status: active
planted: 2026-10-02
planted_during: Terry's review of the stale readiness gate on SEED-072
scope: story
---

# SEED-080: Show changes since readiness review without blocking execution

## Why This Matters

A developer should know when story or plan content has changed since its last
readiness review without a content hash mismatch alone withdrawing the recorded
readiness judgment or preventing an authorized execution.

## Story

<a id="readiness-change-indicator"></a>

### Show changes since readiness review without blocking execution

**Identity:** SEED-080#readiness-change-indicator
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Developers see the last assessed readiness and a separate indication
of subsequent content changes, and can start a previously ready story despite
that indication.

**Scope:** Preserve the recorded readiness judgment when its document or plan
digest differs from current content. Show an independent "Changed since
readiness review" indicator instead of replacing readiness with "Needs
reassessment". Align dashboard presentation, execution startup and preparation
guidance: a hash mismatch alone neither mutes Start execution as unready nor
refuses execution. A genuine recorded not-ready judgment remains distinct;
this story does not remove its existing handling or other execution safeguards.
The author of a scope change remains responsible for aligning the plan and
reviewing readiness; a fresh assessment clears the change indication.

**Key examples:**

- A ready story's breadcrumb becomes a historical reference: keep Ready visible,
  add the change indication, and allow normal authorized execution startup.
- A ready story's scope or plan changes without a new assessment: show the last
  Ready judgment alongside the change indication. The indication informs the
  developer and executing agent without automatically declaring the work unready.
- A story recorded not-ready changes: retain its not-ready judgment and reasons,
  with a separate change indication; do not infer readiness from the edit.
- A new readiness assessment covers the current story and plan: show that
  assessment and remove the change indication until content changes again.

**Evidence:** At `afc13b70`, `dashboard/src/launchWorkflow.ts` derives "Not
marked Ready for execution" from the effective assessment; `StartLaunch.tsx`
applies muted styling through `start-launch-noted` (the readiness note alone
does not disable clicking). The installed execution source
`.agents/skills/dough-execute-plan/scripts/execution-source.mjs` refuses any
assessment status other than `ready`, including `needs-reassessment`.
`src/skills/dough-execute-plan/scripts/workspace-publication-startup-source-cases.mjs`
explicitly expects stale readiness to refuse startup before a Take or workspace.
The installed preparation guidance says readiness is not a mandatory Take gate,
so behavior and guidance must be made consistent with this decision. Changes to
reusable guidance belong in `src/skills/`, not hand-edited installed copies.

**Capture:** Terry selected this behavior on 2026-10-02 and requested first
priority in the product backlog. SEED-072's current stale assessment was caused
by a shared breadcrumb edit in merge `98be0f24`; its plan digest was unchanged.
Refreshing SEED-072's readiness now is a workaround, not implementation of this
story.

**Deferred:** No implementation or execution plan is included in this capture.
Existing authorization, ownership, plan selection and native-start safeguards
remain in force. Broader readiness policy changes are outside this story.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Durable startup reconciliation](SEED-072-responsive-session-start-reconciliation.md#durable-startup-reconciliation).
