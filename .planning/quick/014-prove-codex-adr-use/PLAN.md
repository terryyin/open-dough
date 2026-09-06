# Prove a completed Codex ADR replacement is usable

## Source

[SEED-006, Story 1](../../seeds/SEED-006-extend-adr-guidance-adoption.md#prove-codex-use-after-replacement).
Status: planned, not executed.

## Goal and scope

Prove the narrow replacement completed by Plan 013 actually supplies explicit
and architecture-triggered ADR behavior in a fresh native Codex session after
the original is absent. Reuse the disposable cleanup target and existing
protected native runner.

Exclude fresh installation, releases, Cursor, Claude Code, real Donut changes,
failure automation, and later updates.

## Outside-in proof

| Promise | Slice | Observation |
| --- | --- | --- |
| Explicit shared-skill use works after removal | 1 | Native Codex discovers/invokes the installed shared skill and cites the applicable current ADR. |
| Automatic architecture guidance survives removal | 2 | A request with no ADR or skill hint loads the retained rule and reaches the shared guidance. |

## Ordered slices

### 1. Use the shared ADR skill explicitly after cleanup
Type: Behavior
Status: planned
Proof: One fresh native Codex session starts from Plan 013's cleaned fixture,
invokes `$dough-adr-awareness`, cites the applicable Accepted ADR, preserves
human authority, and makes no target changes. The original is absent.

Behavior: Completed Codex replacement -> explicit shared-skill invocation ->
effective ADR guidance without fallback to the original.

### 2. Apply shared ADR guidance automatically after cleanup
Type: Behavior
Status: planned
Proof: A second fresh Codex session receives one architecture-shaped request
without an ADR or skill hint. The retained architecture rule reaches the shared
skill and cites the constraining ADR without editing the target.

Behavior: Architecture request after replacement -> ordinary Codex handling ->
shared ADR guidance applies automatically.

## Decisions

- Record Codex version, fixture tag/commit, actual native entry, and decisive
  loading evidence. Installed files alone are not use evidence.
- One external native wait per slice is an allowed sizing exception; repeated
  non-converging retries trigger story review.
- This plan is ready for direct execution but is intentionally not executed.
