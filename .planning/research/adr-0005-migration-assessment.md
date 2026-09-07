# ADR 0005 migration assessment — 2026-09-07

**Keep SEED-007. Both test/plan migration and small infrastructure changes are
needed.** Extend the existing shell harnesses; no new test platform, approval
workflow, CI service, or agent SDK is justified.

Terry Yin accepted [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
in this conversation. The ADR was renamed and its index aligned. ADR 0000
governs this human-directed status change; ADR 0003's release identity is
unchanged. The internal acceptance guard remains compatible: pending native
claims move to dedicated stories rather than disappearing.

## Evidence and disposition

| Area inspected | Finding against ADR 0005 | Disposition / story |
| --- | --- | --- |
| [CI](../../.github/workflows/ci.yml), [test runner](../../scripts/test.sh), installer/update tests | Default tests exercise real fixtures without native model calls and explicitly report pending native checks. Earlier research measured 26 scripts passing in 15.88 seconds. | Keep broad CI. Add runner/assessor counterexamples through Stories 1–2; do not rebuild CI or claim its pass is native acceptance. |
| [Quick 019](../quick/019-standalone-client-update/PLAN.md), [SEED-001 Story 7](../seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update) | Leaves 9a–11d embed twelve host/scenario entries; each can contain multiple sessions. Proof mapping and release/self-use are intertwined. “Separate exploration” is now stale. | Story 4 rehomes generic validation into Story 3 and updates the proof map. Keep implementation leaves 1–8 and release integrity checks. Mark native/release sequencing as needing alignment now. |
| [SEED-004 Stories 5–7](../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor) | Extraction, release, useful use, and a generic three-platform test matrix share criteria. These are not yet executable plans. | Story 4 separates implementation/native ownership when refining these upcoming outcomes. Do not run new-skill acceptance against nonexistent candidates or force all future work into the current updater batch. |
| [SEED-006 Stories 3–4](../seeds/SEED-006-extend-adr-guidance-adoption.md#finish-donut-adr-adoption), [SEED-004 Story 8](../seeds/SEED-004-extract-and-adopt-project-guidance.md#adopt-known-client-projects) | Useful native use in a retained real client is the delivered outcome, not merely a regression check. | Retain actual adoption/update/use and per-host evidence. Remove only duplicated general conformance checks during Story 4. ADR 0005 exempts most, not all, implementation stories from native criteria. |
| Completed plans and [Plan 014 evidence](../quick/014-prove-codex-adr-use/EVIDENCE.md) | Existing independent observations include loading and state evidence. Some strengthened assertions were already applied to old transcripts without rerunning. | Preserve historical outcomes. Assess relevance before reuse; do not reopen completed stories or reinterpret older semantics as proof of the changed updater. |
| Three [delivery wrappers](../../tests/dough-adr-awareness-codex-delivery-to-use.sh) and [shared support](../../tests/support/dough-adr-awareness-delivery-to-use.sh) | Native mode chains refusal/update/use; it lacks independent case selection. Temporary success evidence is removed. Cursor's delivery wrapper records editor rather than agent version. | Story 1 lets a selected case run, survive cleanup, and be reused/reassessed without replaying the whole chain. Keep real update-to-use provenance where claimed. |
| [Context checks](../../tests/dough-adr-awareness-context.sh) | Already select platform and scenario and capture structured events, but delete temporary evidence on every exit. The clear-case prompt states the expected policy outcome. | Reuse the existing selection/event approach in Story 1; repair coached prompts and assessors in Story 2. |
| Delivery prompts and assertions | Prompts disclose contract mismatch, desired refusal, or ADR disagreement. Output-pattern assertions alone do not prove independent interpretation. Some wrappers retain only final prose. | Story 2 moves expected facts to assertions, captures actual native activation, and checks state plus semantic outcome. Add adversarial assessor fixtures in CI. |
| [Native Codex support](../../tests/support/native-codex.sh) and inline Cursor/Claude runners | Launch automation exists. No common bounded supervision/result-retention contract or dedicated substitute-process regression suite was found in the inspected tests. Codex's isolation is macOS-specific. | Story 1 adds only the supervision/retention needed for current local runs; Story 3 independently verifies actual host behavior. Cross-OS infrastructure is not required by this migration. |

## Scope of the change

Plan migration is needed; no need to replace all existing tests. Keep deterministic
installer coverage, native CLI entry points, reusable fixtures, and good native
loading/state assertions. Add case selection, consistent evidence retention and
reassessment, bounded failure handling, neutral prompts, and tests for incorrect
assessments. A small case inventory and local artifacts are sufficient initially;
a database, automatic semantic impact engine, and scheduling service are not.

The release/self-adoption distinction matters. Prepublication validation can run
against a pinned candidate and local tagged fixtures. Publication verifies the
released object matches that candidate. Actual self-adoption and Donut use occur
after publication and remain real client outcomes; do not create a circular
dependency requiring the public release in order to authorize that same release.
New problems found during client use require affected follow-up evidence.

## Proposed sequence and acceptance ownership

1. [Story 1: run a selected check without losing other results](../seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks) — improve the existing runner independently of old plans.
2. [Story 2: make native results trustworthy](../seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts) — migrate prompts/assessors and test bad evidence cheaply.
3. [Story 3: validate the standalone updater candidate natively](../seeds/SEED-007-cross-tool-validation.md#accept-standalone-client-workflow) — refine against the reconsidered product outcome and actual candidate.
4. [Story 4: reconcile retained plans](../seeds/SEED-007-cross-tool-validation.md#separate-native-acceptance) — last, after reconsidering their underlying stories; retire plans that no longer apply.

Owner correction: existing slice plans will not be executed as written. Their
reconciliation is not a prerequisite for test or infrastructure work. Native
acceptance still requires a current story and candidate, but not an updated old
slice plan. Earlier plan-specific findings above identify historical migration
input; they do not authorize resuming Quick 019. No extra generic native
proof-of-concept run is needed without a concrete unresolved host limitation.

| Platform | Existing evidence reviewed | Current migration acceptance |
| --- | --- | --- |
| Codex | Plan 014 native observations; current JSONL runner and loading/state checks | Pending in Story 3 for changed native claims; no new run |
| Cursor | Plan 014 native observations; current stream-JSON context checks and delivery wrapper | Pending in Story 3 for changed native claims; no new run |
| Claude Code | Plan 014 native observations; current Skill-event checks and failure-retaining delivery wrapper | Pending in Story 3 for changed native claims; no new run |

This assessment is source inspection, not new runtime qualification. It does not
execute the migration, publish a release, or provision credentials. Detailed
research remains in [the research report](cross-tool-validation.md); the seed
now holds actionable stories rather than a second architecture document.
