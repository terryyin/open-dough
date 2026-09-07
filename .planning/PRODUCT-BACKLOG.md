# Product backlog

## Near-future direction

Open Dough self-adoption and the disposable post-cleanup proof are complete.
Next, use released ADR guidance on one real Donut task in one tool, then extract
story refinement before finishing the wider migration. Let that actual use
inform further adoption; keep generic migration work tied to observed need.

## Queue

1. [Use released ADR guidance on one real Donut task](seeds/SEED-006-extend-adr-guidance-adoption.md#prepare-donut-adr-adoption) — SEED-006 Story 2; one tool, original retained; awaiting story review (ineligible public `v0.2.0` and selected Donut login task gone)
2. [Refine one real backlog story with an extracted Open Dough skill](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-refinement) — SEED-004 Story 6
3. [Prepare Donut's remaining ADR integrations](seeds/SEED-006-extend-adr-guidance-adoption.md#prepare-remaining-donut-adr-integrations) — SEED-006 Story 2b; use first-task learning, original retained
4. [Finish Donut's ADR-guidance replacement](seeds/SEED-006-extend-adr-guidance-adoption.md#finish-donut-adr-adoption) — SEED-006 Story 3; only after all affected tools are ready
5. [Decompose product work with an extracted Open Dough skill](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-decomposition) — SEED-004
6. [Keep Donut's ADR adoption intact during a newer-release update](seeds/SEED-006-extend-adr-guidance-adoption.md#preserve-donut-adr-adoption-on-update) — SEED-006 Story 4; pull only when a real newer release is available and wanted

## Next-item readiness

The missing proof is useful application to an existing real Donut task; neither
the disposable fixture nor Open Dough self-use establishes it. Story 2 execution
stopped for review on 2026-09-07: public latest remains `v0.2.0` without the
required replacement and context-fix behavior, and Donut's selected
login-recovery plan/seed are gone. Do not install into live Donut or substitute
another task from this plan. The owner still needs to supply the next release
version through the existing process and select a replacement real task before
slices 2-3 can start. Local `v0.2.0` fixture tags and uncommitted working source
do not count. Completion still requires a useful task assessment and its
concrete effect on the task's next step, not installation or an invocation
marker alone.

## Deferred — promote on observed need

These entries are outside the active queue until their named trigger appears.

- [Replace equivalent local guidance when updating Open Dough](seeds/SEED-004-extract-and-adopt-project-guidance.md#replace-equivalent-guidance-on-update) — when another concrete match or recurring manual cleanup justifies one bounded replacement.
- [Adopt shared guidance while preserving useful local differences](seeds/SEED-004-extract-and-adopt-project-guidance.md#preserve-local-behavior-during-replacement) — when a real useful local difference blocks adoption; preserve it and report the gap meanwhile.
- [See the relevant changelog while updating Open Dough](seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog) — when manually reading release notes obstructs an actual update.
- [Extract reusable plan execution with its CI monitor and supporting scripts](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor) — when repeated borrowing or a selected skill makes the complete execution/monitoring flow necessary.

## Ordering decision — accepted 2026-09-07

The owner selected the order above: first real Donut use, one practical planning
extraction, then remaining readiness and separately authorized cleanup. Removal
is not a prerequisite for learning. If the first task shows no benefit, revisit
the remaining adoption priority rather than treating migration as inevitable.

Plan 015 now covers only the first real task and has completed its planning
review; Story 2b has no execution plan yet. Plans 016–017 still need just-in-time
planning review under their revised scopes.
No-op updates remain valid behavior but cannot complete the newer-update story.
These backlog changes authorize no release or live Donut work in this pass.

## Recently done

- [Prove a completed Codex ADR replacement is usable](seeds/SEED-006-extend-adr-guidance-adoption.md#prove-codex-use-after-replacement) — completed 2026-09-07; explicit and automatic use work after cleanup. The narrow shared-skill context clarification passed native positive/real-disagreement checks in all three tools; source fix verified but not released. Spent Plan 014 removed; [acceptance evidence and learning](quick/014-prove-codex-adr-use/EVIDENCE.md) retained. No Donut migration began.

- [Adopt and reuse released guidance in Open Dough](seeds/SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater) — completed 2026-09-06; Codex, Cursor, and Claude Code independently adopted public v0.2.0, used the installed ADR-awareness against Open Dough's current Accepted decisions, and proved current-version updates make no writes; the no-op checks were repeated after main advanced the local updater and preserved that newer project-local behavior.

- [Complete one authorized ADR-guidance replacement in Codex](seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install) — SEED-004

- [Publish extracted guidance and the version-aware updater](seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater) — completed 2026-09-06; annotated `v0.2.0` publishes the accepted safe installer, version-aware updater, and ADR-awareness payload; a fresh HTTPS repository matched the exact tag object, peeled commit, complete tree, metadata, and preserved `v0.1.0`; the spent plan was dropped after acceptance.

- [Install the latest released Open Dough guidance safely](seeds/SEED-001-install-and-update-open-dough.md#install-latest-release) — completed 2026-09-06; the README-linked flow selects and inspects the pinned numeric release before direct installation; focused success/stale-selection checks and separate native installations in Codex, Cursor, and Claude Code passed, with payload/version verification, guidance preservation, and temporary-checkout cleanup; the spent plan was dropped after acceptance.

- [Turn a supplied project practice into usable public guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance) — completed 2026-09-06; source-selectable internal extraction produced evaluated `dough-adr-awareness` guidance, with native extraction, install/update, fresh use, alternate-layout behavior, and coexistence verified independently in Codex, Cursor, and Claude Code.

- [Keep a recorded Open Dough installation current only when needed](seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed) — completed 2026-09-06; older, equal, and newer recorded versions each produce the correct native outcome in Codex, Cursor, and Claude Code, executing only the inspected pinned release; retrospective corrections for pinned-code execution, temporary-work cleanup, and numeric comparison are folded in; the detailed slice plan was dropped after acceptance.

- [Create an identifiable Open Dough release with the internal skill](seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version) — completed 2026-09-06; `release-version` prepares/finalizes `VERSION` and `CHANGELOG.md` with immutable `vMAJOR.MINOR.PATCH` tags; native Codex, Cursor, and Claude Code proof recorded; `v0.1.0` published; installer still omits the internal skill and acceptance guard.

- [Use and update Open Dough guidance in Cursor and Claude Code projects](seeds/SEED-001-install-and-update-open-dough.md#cursor-project-installation) — completed 2026-09-06; Cursor and Claude Code install/update, repeat protection, forced replacement, and native reuse of a pushed shared improvement (including unchanged-content reapplication) verified separately in both tools alongside existing Codex use.

- [Apply the latest shared guidance to Open Dough's Codex installation](seeds/SEED-001-install-and-update-open-dough.md#update-after-source-change) — completed 2026-09-06; supplied-URL update, GitHub self-use, fresh-session wording, and unchanged-content reapplication verified.

- [Install Open Dough's update placeholder from a supplied URL for Codex](seeds/SEED-001-install-and-update-open-dough.md#install-from-github) — completed 2026-09-06; GitHub self-install, Codex invocation, repeat protection, and forced replacement verified.
