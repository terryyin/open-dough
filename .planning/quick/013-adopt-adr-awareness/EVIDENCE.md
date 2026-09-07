# Plan 013 resolution evidence — 2026-09-06

- Source: [SEED-004, Story 4](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install).
- Status: complete at `2926cea`; CI run `34036359908` passed.
- Outcome: one native Codex session assessed an already-installed Open Dough
  replacement, retained required adopter context, repaired every assessed
  caller, and removed only the redundant original after one authorization.

The completed execution plan was removed after acceptance. This record retains
the replacement evidence and the useful learning.

## Goal and scope

The completed story tested one concrete replacement in a disposable
Donut-derived Codex target. It used the exact tagged `v0.1.0` payload, first
assessed without writes, retained context before cleanup, reused the explicit
authorization, repaired an exhaustive caller checklist, and preserved ADR
records, unrelated guidance, and other-tool sentinels.

It did not prove fresh installation, publication, real Donut mutation, Cursor or
Claude Code replacement, post-cleanup ADR use, ambiguous/shared originals,
failed installation or rollback, or later-update preservation. Those boundaries
were handled or kept pending in
[SEED-006](../../seeds/SEED-006-extend-adr-guidance-adoption.md).

## Retained evidence

| Observation | Tool and identity | Boundary not proved |
| --- | --- | --- |
| Read-only assessment explained equivalence, context, and callers while the complete target snapshot stayed unchanged. | `codex-cli 0.144.1`; fixture release `v0.1.0`; commits `3db4cb1`, `db7184e`, and native-copy repair `fe006f6`. | No authorization, installation, or other native tool. |
| Authorized preparation changed only `.cursor/rules/architecture-decisions.mdc` and verified every original-only context value while leaving cleanup pending. | Native Codex; commit `00bb1d0` after the overrun split at `0fd66e8`. | No caller repair, original removal, or post-cleanup use. |
| Cleanup repaired `.cursor/agent-map.md`, both affected Cursor rules, and `docs/adrs/README.md`, then removed only the original skill and empty directory. Payload, version, retained context, ADRs, unrelated guidance, and other-host guidance stayed unchanged. | Native Codex; fixture commit `0962d86ffb6ff29cd7382fb3489df83920f57705`; delivery `2926cea`. | No release, live Donut edit, post-cleanup use, other-tool replacement, or later update. |

The enduring lesson is that adopter context must survive a one-time replacement
before its only source is removed. Native execution found two important misses:
required trigger facts were initially omitted, and a mixed ADR-index caller was
excluded by a search that skipped `docs/adrs/**`. The accepted cleanup therefore
verified each retained fact and each caller individually.

The adoption fixture and procedural harness used for these observations were
retired when reusable replacement behavior was removed. The commits, tool
version, fixture identity, changed paths, preserved boundaries, and CI result
above are historical evidence, not a current reproduction claim. Current
post-cleanup use and context behavior remain reproducible through
`tests/dough-adr-awareness-codex-use.sh` and
`tests/dough-adr-awareness-context.sh`; their later direct fixture does not
retroactively prove this replacement procedure.
