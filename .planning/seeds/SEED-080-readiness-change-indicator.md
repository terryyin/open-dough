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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/209-readiness-change-indicator/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c8a7905781e3e530008c56cad823a971dba60bdba7f8aaf1ae9576494facd988","plan":"b3dc7111ec9964a6138c05c5f1138af6e89fbea6345239cc75f5d3939258564d"}}
```

**Goal:** Developers can distinguish the last readiness judgment from changes
made after that review, so incidental edits do not prevent them from starting
previously ready work. Developers and executing agents remain informed when
the reviewed content differs from the current story or plan.

**Scope:**

- Preserve the recorded Ready or Not ready judgment and its reasons when the
  reviewed document or plan digest differs from current content. Treat that
  difference as a separate change indication, not a replacement assessment.
  Use the existing reviewed-content basis; this story does not narrow which
  content contributes to that basis.
- Show "Changed since readiness review" alongside the last assessment wherever
  the dashboard presents readiness, including story cards and details. A
  changed Ready story keeps its Ready presentation; the change alone does not
  give Start execution the unready note or muted styling.
- Normal authorized execution startup accepts a changed story whose recorded
  assessment is Ready, and makes the change indication available to the
  executing agent. The mismatch alone causes no startup refusal or additional
  confirmation step. Genuine recorded Not ready, absent or invalid preparation,
  authorization, ownership, plan selection and native-start safeguards retain
  their existing handling.
- Align preparation and execution guidance with the separate judgment and
  change indication. The author of a scope change remains responsible for
  aligning the story and plan and reviewing readiness. Editing, Take, resume,
  or ordinary delivery updates do not automatically renew the judgment or
  rewrite its reviewed basis.
- A fresh assessment of current content replaces the prior judgment and clears
  the change indication. A matching reviewed basis has no change indication;
  an absent assessment supplies neither a judgment nor a review basis from
  which to claim a change.

**Key examples:**

- **Incidental change:** A Ready story's shared breadcrumb changes while its
  plan is unchanged → the developer views the card and details and starts
  execution → Ready remains visible with "Changed since readiness review";
  Start has its normal Ready presentation, startup succeeds under the existing
  safeguards, and the executing agent receives the change indication.
- **Substantive change:** A Ready story's scope or plan changes without a new
  assessment → readiness is read and authorized execution starts → the last
  Ready judgment and change indication remain separate; startup is not refused
  solely because content changed. The author still owns alignment and review.
- **Not ready remains Not ready:** A story has a Not ready judgment with a
  blocking reason → its content changes → the dashboard retains that judgment
  and reason alongside the change indication; execution retains its existing
  Not ready handling. The edit does not confer Ready.
- **New review:** A changed story and its plan are reviewed → a fresh Ready or
  Not ready assessment is recorded against current content → the dashboard and
  execution reader use the new judgment, with no change indication until the
  reviewed basis differs again.
- **No difference:** A recorded assessment's basis still matches → readiness
  is read → its judgment appears without the change indication.
- **No prior review:** A story has no recorded assessment → its content changes
  and readiness is read → it remains unassessed, without a fabricated Ready
  judgment or "Changed since readiness review" indication; existing startup
  handling for absent assessment remains.

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

**Deferred promises:** No content diff viewer, semantic classification of edits,
automatic reassessment, revised digest coverage, or broader readiness policy
change is promised. These exclusions add no requirement to reject naturally
supported behavior. Preparation does not authorize implementation.

**Plan:** [Readiness change indicator](../slice-plans/209-readiness-change-indicator/PLAN.md).

**Open decisions:** None for this bounded outcome. Terry selected planned
execution on 2026-10-02; execution itself remains separately authorized.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Durable startup reconciliation](SEED-072-responsive-session-start-reconciliation.md#durable-startup-reconciliation).
