# Finish Donut's ADR-guidance replacement

## Source

[SEED-006, Story 3](../../seeds/SEED-006-extend-adr-guidance-adoption.md#finish-donut-adr-adoption).
Status: planned, not executed.

## Goal and scope

After Plan 015 proves all three Donut integrations ready, repair the live caller
graph, remove the redundant original and obsolete link, and show that explicit
and automatic ADR behavior still works independently in Codex, Cursor, and
Claude Code.

Exclude installation, release publication, update preservation, general
migration, and automatic failure recovery. Reinspect exact assessed paths before
any deletion and preserve concurrent work.

## Outside-in proof

| Promise | Slice |
| --- | --- |
| Every live caller is repaired before deletion | 1 |
| Only the unreferenced original and obsolete link are removed | 2 |
| Explicit post-removal use works in all tools | 3, 5, 7 |
| Automatic architecture application works in all tools | 4, 6, 8 |

## Ordered slices

### 1. Retarget Donut's assessed callers
Type: Structure
Status: planned
Proof: Every assessed textual caller resolves to the applicable installed shared
skill. Trigger text, retained context, ADR records, payload bytes, original, and
obsolete link remain unchanged.

Structure: Repair only the verified caller checklist immediately enabling slice
2's retirement.

### 2. Retire Donut's redundant original
Type: Behavior
Status: planned
Proof: Recheck Plan 015 readiness and the repaired graph, then remove only the
original skill and obsolete discovery link. Remaining graph/context/payload and
unrelated working changes are unchanged.

Behavior: All tools ready plus callers repaired -> reuse removal authorization ->
no redundant original or dangling link remains.

### 3. Verify explicit ADR use in Codex
Type: Behavior
Status: planned
Proof: Fresh native Codex invokes the installed shared skill after removal,
cites applicable records, and preserves human authority without edits.

Behavior: Migrated Donut -> explicit Codex ADR check -> effective shared guidance.

### 4. Verify automatic ADR use in Codex
Type: Behavior
Status: planned
Proof: A read-only architecture request without ADR hints reaches the shared
guidance and applicable current ADRs.

Behavior: Architecture-shaped Donut request -> ordinary Codex handling -> ADR
guidance applies automatically.

### 5. Verify explicit ADR use in Cursor
Type: Behavior
Status: planned
Proof: Fresh native Cursor independently discovers and invokes its installed
shared skill after removal.

Behavior: Migrated Donut -> explicit Cursor ADR check -> effective shared guidance.

### 6. Verify automatic ADR use in Cursor
Type: Behavior
Status: planned
Proof: Native Cursor handles the same read-only architecture request through its
repaired automatic rule, without old-name fallback.

Behavior: Architecture-shaped Donut request -> ordinary Cursor handling -> ADR
guidance applies automatically.

### 7. Verify explicit ADR use in Claude Code
Type: Behavior
Status: planned
Proof: Fresh native Claude Code discovers and invokes its installed shared skill
without the old discovery link.

Behavior: Migrated Donut -> explicit Claude ADR check -> effective shared guidance.

### 8. Verify automatic ADR use in Claude Code
Type: Behavior
Status: planned
Proof: Native Claude Code handles the read-only architecture request through
remaining repository guidance and cites the applicable ADR.

Behavior: Architecture-shaped Donut request -> ordinary Claude Code handling ->
ADR guidance applies automatically.

## Decisions

- ADR 0001 remains Accepted despite its filename; Proposed ADR 0002 is not
  binding. No ADR content or status is rewritten.
- Any drift, failed readiness claim, or new caller stops deletion and preserves
  working guidance.
- Native runs are independent evidence; one tool's success cannot prove another.
- The eight leaves require refinement if this story is selected; this plan is
  intentionally not executed.
