# Adopt and reuse the released updater in Open Dough

**Status: NOT FOR DIRECT EXECUTION.** This plan contains self-use work moved
from the oversized Story 5 plan. Refine Story 5e first, update this plan against
the actual published release and current installations, then run Donut's
slice-plan-refinement skill before refinement execution or product execution.
Do not execute these fragments as-is.

Source: [SEED-001, Story 5e](../../seeds/SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater).
Release prerequisite: [Story 5d](../010-publish-version-aware-updater/PLAN.md).

## Candidate story boundary

The Open Dough maintainer can adopt the real published version-aware updater in
this repository's Codex, Cursor, and Claude Code installations, then use each
installed skill in a fresh native session and observe a current/no-write result.
This is real-project self-use and coexistence evidence, not publication or new
updater behavior.

## Moved fragments

| Original leaves | Status | Retained outcome |
| --- | --- | --- |
| 37–39. Adopt the real release | planned | Each actual selected installation reaches the published bytes/record while the other installations, source, and unrelated work stay unchanged |
| 40–42. Reuse the released updater | planned | Fresh native invocation in each tool discovers its own entry and reports current without writes |

## Questions for story and slice refinement

- Which current installations need explicit legacy bootstrap versus ordinary
  recorded update when the actual release is known?
- What before/after evidence is safe to collect in the real repository without
  conflating fixture acceptance with self-use?

## Required acceptance after refinement

Record actual source URL, published tag/commit, selected paths and records,
native tool versions, invocations, and preservation evidence separately for
Codex, Cursor, and Claude Code. Another platform's success and file copying are
not substitutes for native discovery and behavior.
