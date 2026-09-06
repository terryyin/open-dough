# Complete one authorized ADR-guidance replacement in Codex

## Source and completion

- Source: [SEED-004, Story 4](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install).
- Outcome: one native Codex session can assess an already-installed Open Dough
  ADR replacement, retain required local context, repair the assessed callers,
  and remove the redundant original after one explicit authorization.
- Status: complete through slice 4a at `2926cea`; CI run `34036359908` passed.
- Execution started from refinement `400f530` on
  `codex/adopt-adr-awareness-execution`.

## Goal and scope

For an Open Dough maintainer evaluating the first concrete adoption case, prove
that a developer with current installed Open Dough guidance and one equivalent
local ADR-awareness practice can complete a bounded replacement in native Codex.
The result preserves required ADR context, repairs every assessed caller, and
removes only the redundant original.

Included:

- a disposable Donut-derived target with exact tagged payload and concrete
  original guidance, callers, ADR records, unrelated guidance, and other-host
  sentinels;
- read-only assessment before authorization;
- reuse of one replacement authorization without a second prompt;
- context retention before cleanup; and
- exhaustive caller repair plus original removal for the single ready Codex
  integration.

Excluded from this completed story:

- fresh installation, release publication, and real Donut mutation;
- Cursor and Claude Code adoption behavior;
- explicit or automatic ADR use after cleanup;
- renamed, ambiguous, shared-original, failed-install, and rollback cases; and
- later-update preservation.

Those outcomes are smaller follow-up stories in
[SEED-006](../../seeds/SEED-006-extend-adr-guidance-adoption.md). Open Dough's
own released-guidance adoption remains in SEED-001 and is not duplicated here.
Missing Cursor and Claude Code evidence remains pending; this plan does not
claim their adoption behavior is complete.

## Outside-in proof ownership

| Promise | Owning slice | Observable proof |
| --- | --- | --- |
| Exact tagged candidate and protected adopter topology | 1 | Fixture snapshot includes files, absence, bytes, and symlink targets. |
| Assessment explains equivalence and changes nothing | 2 | Fresh native Codex reads the installed workflow; full target snapshot is unchanged. |
| Original-only context is identified before cleanup | 3 | Fixture assertions trace each required value only to the original. |
| Authorized preparation retains every required value | 4 | Fresh native Codex changes only the architecture context home; original and callers remain. |
| Cleanup repairs the complete caller checklist and removes only the original | 4a | Fresh native Codex leaves every caller resolving; exact changed paths are callers plus original. |

## Current decisions

1. Shared behavior remains in the three-file public payload. The updater links
   to the recognition record; installer helpers still write only their declared
   payload and `VERSION`.
2. Assessment is read-only. Installation, update, `--force`, and assessment do
   not imply local-guidance deletion authorization.
3. Required adopter context is retained before its only source is removed. A
   missing value blocks cleanup.
4. Cleanup uses the assessment's explicit path checklist, searches hidden and
   ignored paths plus symlinks, and verifies every caller individually.
5. One ready Codex integration is the boundary. Shared-source and cross-tool
   cleanup belongs to later stories.

## Ordered slices

### 1. Prepare one disposable ADR assessment target
Type: Structure
Status: done
Proof: The fixture contains the exact tagged current Codex payload, original
skill and callers/context, protected coexistence data, and a complete topology
snapshot.

Structure: Provide the bounded target needed by slice 2 without changing public
behavior. Commit: `3db4cb1`.

### 2. Explain a proposed ADR replacement without changing the project
Type: Behavior
Status: done
Proof: Fresh `codex-cli 0.144.1` invoked the installed `$dough-update` from
fixture release `v0.1.0`, explained coverage/context/callers, classified the ADR
statuses correctly, and left the target snapshot unchanged.

Behavior: Equivalent original plus current payload -> request assessment ->
receive a bounded proposal with no writes. Commits: `db7184e`, with native-copy
consistency repaired by `fe006f6` after CI caught the mismatch.

### 3. Prepare bounded context retention
Type: Structure
Status: done
Proof: Every trigger and exception-trail value is traceable only to the original;
the fixture does not prefill retained context or perform cleanup.

Structure: Add the retention contract and assertions immediately enabling slice
4. Commit: `f19e3ce`.

### 4. Retain required context during authorized preparation
Type: Behavior
Status: done
Proof: Fresh `codex-cli 0.144.1` reused the supplied authorization and changed
only `.cursor/rules/architecture-decisions.mdc`; all required values were
verified individually and cleanup remained pending.

Behavior: Current payload plus authorized replacement -> retain and verify
original-only context -> leave original and callers intact for cleanup. The
overrun split was recorded by `0fd66e8`; delivery commit: `00bb1d0`.

### 4a. Repair callers and remove the redundant original
Type: Behavior
Status: done
Proof: Fresh `codex-cli 0.144.1` invoked fixture release `v0.1.0` at
`0962d86ffb6ff29cd7382fb3489df83920f57705`. It repaired
`.cursor/agent-map.md`, both affected Cursor rules, and `docs/adrs/README.md`,
then removed only `.agents/skills/adr-awareness/SKILL.md` and its empty
directory. Payload, `VERSION`, retained context, ADR records/statuses/decisions,
unrelated guidance, and other-host guidance were unchanged; no install or fetch
ran.

Behavior: Verified retained context plus one ready integration -> complete the
authorized caller repair/removal -> no redundant original or dangling caller
remains. Commit: `2926cea`.

## Verification and learnings

- `npm run format` and `npm run lint` passed at both final slice boundaries.
- Focused fixture, payload, shell-syntax, native preparation, and native cleanup
  proofs passed. All non-plan files remain below 250 lines.
- CI exposed one real native-copy synchronization defect; the focused payload
  comparison reproduced it before `fe006f6` fixed all tracked native copies.
- Native execution exposed two boundary mistakes before acceptance: required
  trigger facts were initially omitted, and a mixed ADR-index caller was missed
  by a search that excluded `docs/adrs/**`. The completed workflow now requires
  individual fact verification and an explicit exhaustive caller checklist.
- The original 40-slice plan crossed several independent user outcomes. This
  completed plan stops at the first usable learning boundary; the remainder is
  decomposed in SEED-006 and is not executed by this change.
