# Keep Donut's ADR adoption intact during updates

## Source

[SEED-006, Story 4](../../seeds/SEED-006-extend-adr-guidance-adoption.md#preserve-donut-adr-adoption-on-update).
Status: planned, not executed.

## Goal and scope

Show that an ordinary Open Dough update after completed Donut migration preserves
retained context and repaired callers and never recreates the retired original.
Reuse existing updater evidence where unchanged.

Exclude discovery of new matches, another cleanup pass, rollback machinery, and
generic adopters.

## Outside-in proof

| Promise | Slice |
| --- | --- |
| Codex update preserves adoption | 1 |
| Cursor update preserves adoption | 2 |
| Claude Code update preserves adoption and old link absence | 3 |

## Ordered slices

### 1. Preserve Donut adoption through a Codex update
Type: Behavior
Status: planned
Proof: Native `$dough-update` reports current without writes or applies one
inspected newer release only to the Codex payload/record. Context/callers remain
unchanged and the original is not recreated.

Behavior: Migrated Donut -> ordinary Codex update -> truthful update outcome with
adoption preserved.

### 2. Preserve Donut adoption through a Cursor update
Type: Behavior
Status: planned
Proof: Native Cursor repeats the same observation for its selected root while
all other roots and repaired local guidance remain unchanged.

Behavior: Migrated Donut -> ordinary Cursor update -> adoption preserved.

### 3. Preserve Donut adoption through a Claude Code update
Type: Behavior
Status: planned
Proof: Native Claude Code repeats the update observation and confirms the retired
original link remains absent.

Behavior: Migrated Donut -> ordinary Claude update -> adoption preserved.

## Decisions

- Current-version behavior must remain no-write; a newer release uses only the
  existing inspected pinned-release workflow.
- Record source/tag/commit, tool version, selected paths, and exact local
  preservation evidence per platform.
- This plan is ready for direct execution after Plan 016 but is intentionally
  not executed.
