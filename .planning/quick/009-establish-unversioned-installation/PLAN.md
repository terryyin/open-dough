# Establish a known release for an unversioned Open Dough installation

**Status: NOT FOR DIRECT EXECUTION.** This plan contains work moved from the
oversized Story 5 plan. Refine Story 5c first, update this plan against the
refined boundary and the corrected shared updater, then run Donut's
slice-plan-refinement skill before refinement execution or product execution.
Do not execute these fragments as-is.

Source: [SEED-001, Story 5c](../../seeds/SEED-001-install-and-update-open-dough.md#establish-unversioned-installation).
Recorded-version behavior: [Story 5b](../005-update-only-when-needed/PLAN.md).

## Candidate story boundary

A developer whose selected Open Dough installation has no trustworthy installed
record can deliberately establish the latest released, version-aware updater and
then receive an ordinary current/no-write result in a fresh native session.

The story has two starting conditions that need refinement: a version-aware
skill with a missing record, and the genuine shipped legacy skill whose contract
cannot write the new record. It must not infer a version from another tool or
from the existence of source tag `v0.1.0`.

## Moved evidence and fragments

| Original leaves | Status | Evidence or remaining work |
| --- | --- | --- |
| 10. Missing record becomes known | done | `tests/update-when-needed.sh` proves one selected installation only |
| 16. Genuine legacy forced bootstrap | done | `tests/update-when-needed.sh` uses actual `v0.1.0` files |
| 26–28. Missing-record native journeys | planned | Independent Codex, Cursor, and Claude Code transitions |
| 32–34. Genuine legacy native journeys | planned | Explicit bootstrap and fresh-session reuse in each tool |

The earlier equal-version native evidence can be reused only after a successful
transition and only where later shared-code corrections leave it valid.

## Questions for story and slice refinement

- Are missing-record recovery and genuine legacy bootstrap one outcome with two
  preconditions, or should the automatic and explicit journeys be separate?
- What wording makes the destructive forced-reinstall boundary clear without
  implying that the old skill can authorize new writes?
- Which proof establishes that no other tool's record was borrowed?

## Required acceptance after refinement

Map each retained precondition to its own observable transition and focused
proof. Record native discovery, invocation, selected path, before/after record,
fresh-session reuse, and coexistence separately in Codex, Cursor, and Claude
Code. Do not treat a Bash platform flag as native acceptance.
