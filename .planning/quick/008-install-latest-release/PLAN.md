# Install the latest released Open Dough guidance safely

**Status: NOT FOR DIRECT EXECUTION.** This plan contains work moved from the
oversized Story 5 plan. Refine Story 5a first, update this plan to match that
refinement and the current shared implementation, then run Donut's
slice-plan-refinement skill before refinement execution or product execution.
Do not execute these fragments as-is.

Source: [SEED-001, Story 5a](../../seeds/SEED-001-install-and-update-open-dough.md#install-latest-release).
Related recorded-update plan: [Story 5b](../005-update-only-when-needed/PLAN.md).

## Candidate story boundary

A developer with no selected Open Dough installation can install the highest
numeric released updater from a supplied repository, verify its payload and
record, and discover it in the running tool. The journey must not execute
uninspected default-branch repository code. Ordinary repeat protection and an
explicit forced reinstall remain part of the installation interaction.

Updating an already recorded installation, establishing a version for an
unversioned copy, publishing the updater, and adopting it in Open Dough are
separate stories.

## Moved evidence and fragments

| Original leaves | Status | Evidence or remaining work |
| --- | --- | --- |
| 1–3. Install record, repeat protection, explicit force | done | `tests/install.sh`, `tests/install-omits-internal.sh` |
| 4–7. Numeric latest and source/release validation | done | `tests/install-latest-release.sh` |
| 17. Fresh Codex discovery | done | Codex 0.153.4 session `01a07569-9c9e-7412-bcae-87049e00f575` |
| 18. Fresh Cursor discovery | partial | CLI install and in-session file read exist; fresh fixture window is missing |
| 19. Fresh Claude Code discovery | done | Claude Code 2.1.263 session `e2c8f582-0545-44b3-8037-b1f1b8a397d4` |

Retrospective findings to carry into refinement:

- The current README install flow executes the cloned default-branch helper to
  pin latest before the promised inspection. Align installation with Story 5b's
  corrected pin-and-inspect boundary rather than creating a second resolver.
- `README.md` is 394 lines after this execution and exceeds Donut's 250-line
  refactoring limit. Move the detailed platform install/update guide behind a
  concise README entry point while preserving discoverable instructions and all
  Codex, Cursor, and Claude Code acceptance obligations.

## Questions for story and slice refinement

- What is the smallest user-visible trust signal for “the exact release I
  inspected is the release whose installer ran”?
- Should ordinary repeat and explicit repair remain one install story, or is
  repair an exception that can safely follow later?
- Which native observations remain valid after the shared pinning flow and docs
  are corrected?

## Required acceptance after refinement

Refinement must map safe supplied-URL selection, payload/record verification,
repeat/force behavior, selected-tool preservation, and native discovery to
stop-safe leaves. Native proof is required separately for Codex, Cursor, and
Claude Code; CLI installation alone does not close a platform row.
