# Prepare Donut to use released ADR guidance

## Source

[SEED-006, Story 2](../../seeds/SEED-006-extend-adr-guidance-adoption.md#prepare-donut-adr-adoption).
Status: planned, not executed.

## Goal and scope

Make the published replacement independently usable in Donut's Codex, Cursor,
and Claude Code installations while retaining the original guidance and its
discovery link. This is a readiness journey, not cleanup.

Before mutation, require an independently fetched release containing Plan 013's
behavior and recheck Donut for drift and concurrent changes. Preserve every
unrelated change. Exclude caller retargeting, original removal, automatic-use
proof, update preservation, and generic failure handling.

## Outside-in proof

| Promise | Slice |
| --- | --- |
| Current Donut boundary is known without writes | 1 |
| Codex can use installed shared guidance with retained context | 2 |
| Cursor can use its own installed shared guidance | 3 |
| Claude Code can use its own installed shared guidance | 4 |
| Original and callers remain available throughout | 1-4 |

## Ordered slices

### 1. Reassess Donut without changing it
Type: Behavior
Status: planned
Proof: Native assessment records source/tag/commit, current local guidance,
required context, textual callers, discovery links, and unrelated working-tree
changes; the complete target snapshot is unchanged.

Behavior: Published behavior plus current Donut -> request assessment -> exact
readiness scope or a named blocker with no writes.

### 2. Prepare Donut's Codex integration
Type: Behavior
Status: planned
Proof: Native Codex installs or updates from the inspected release, retains the
assessed context, and explicitly uses its installed shared skill while the
original and all callers remain intact.

Behavior: Assessed Donut -> authorize Codex preparation -> Codex is independently
ready without relying on the original's contents.

### 3. Prepare Donut's Cursor integration
Type: Behavior
Status: planned
Proof: Native Cursor installs or updates its own root and explicitly uses the
shared skill with retained context; Codex, Claude, original, and callers remain
unchanged.

Behavior: Codex-ready Donut -> authorize Cursor preparation -> Cursor is ready
without cross-root redirection.

### 4. Prepare Donut's Claude Code integration
Type: Behavior
Status: planned
Proof: Native Claude Code installs or updates its own root and explicitly uses
the shared skill while the original source/link and repaired-nothing-yet caller
graph remain valid.

Behavior: Two-tool-ready Donut -> authorize Claude preparation -> all affected
integrations are ready and the original is still available.

## Decisions

- A missing context value or target drift stops only the affected slice and
  leaves the original available.
- Each native run records tool version, entry, source/tag/commit, selected root,
  changed paths, and preservation evidence.
- This plan needs review for current release/Donut state before execution and is
  intentionally not executed.
