# Product backlog

## Near-future direction

Prioritize SEED-007's four test migration and native acceptance stories under
[Accepted ADR 0005](../docs/adrs/0005-cross-tool-validation-accepted.md). Improve
the tests first in plan order **20 → 22 → 21**. Use representative per-tool
integration evidence and shared skill behavior checks. Reconsider underlying
stories before reconciling other retained plans.

Then make the revised installation/update workflow work in a real client,
beginning with Donut. Clients run `dough-update`, then review and commit changes.

Extract and improve shared guidance in Open Dough. Replace the few known
borrowed copies once, handling their actual differences directly. Thereafter,
maintain released Open Dough versions; do not build a permanent local-guidance
matching, reconciliation, or recovery product.

## Queue

1. [Run one needed native check without replaying or losing the others](seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks) — SEED-007 Story 1. Plans 20 then 22: keep completed runner safeguards and add one retained update→fresh-use journey; no offline reassessment interface.
2. [Detect native behavior failures instead of rewarding the expected words](seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts) — SEED-007 Story 2. Plan 21 after 22: neutral prompts, shared activation/state checks, and documented review for uncertain prose; no per-case/per-tool assessment matrix.
3. [Establish that the standalone client candidate works in all three tools](seeds/SEED-007-cross-tool-validation.md#accept-standalone-client-workflow) — SEED-007 Story 3. review per-tool proof against the actual candidate; run only unresolved representative integration and skill behavior checks.
4. [Reconcile retained plans after reconsidering their stories](seeds/SEED-007-cross-tool-validation.md#separate-native-acceptance) — SEED-007 Story 4. last; update only plans that remain relevant after story reconsideration. Other retained plans require revision before execution.
5. [Release the standalone client installation and update workflow](seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update) — SEED-001 Story 7. Finish remembered source/version and verified ordinary/forced updates; publish and self-use the smaller payload already implemented in source. Reconsider this story before planning execution; [Quick 019](quick/019-standalone-client-update/PLAN.md) will not be run as written. Reconcile any retained plan later in [SEED-007 Story 4](seeds/SEED-007-cross-tool-validation.md#separate-native-acceptance).
6. [Adopt the simplified release once in Donut and use it](seeds/SEED-006-extend-adr-guidance-adoption.md#finish-donut-adr-adoption) — SEED-006 Story 3. Prepare the actual integrations, retain context, replace the borrowed original once, and use the installed guidance on real work.
7. [Use a meaningful newer release through Donut's ordinary updater](seeds/SEED-006-extend-adr-guidance-adoption.md#preserve-donut-adr-adoption-on-update) — SEED-006 Story 4. Do this as soon as a useful newer release exists; it takes priority over further extraction.
8. [Release story refinement and use it on a real backlog story](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-refinement) — SEED-004 Story 6. If item 7 has no useful release yet, do this next to supply one, then return immediately to item 7.
9. [Release story decomposition and use it on real product work](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-decomposition) — SEED-004 Story 7. Reuse oversized-plan feedback as part of this practice.
10. [Replace borrowed guidance once in the remaining known client projects](seeds/SEED-004-extract-and-adopt-project-guidance.md#adopt-known-client-projects) — SEED-004 Story 8. After the Donut path works, handle the owner's roughly three or four other projects one at a time, with a named project and useful practice for each pass.

Priority does not remove dependencies: item 3 needs a current candidate from
the reconsidered product story. Item 4 stays last among the four migration
stories and updates only plans retained after story reconsideration. Use [SEED-007](seeds/SEED-007-cross-tool-validation.md) for current scope and
pending evidence. The earlier migration assessment is background only.

## Next-item readiness

Execute these plans in order:

1. [Plan 20](quick/020-select-and-retain-native-checks/PLAN.md): leaves 1–5 are
   done. Finish its own runner checkpoint; it no longer waits for plan 22.
2. [Plan 22](quick/022-retain-native-evidence-for-verdicts/PLAN.md): leaf 1 is
   done. Add the shared update→fresh-use journey and small adapter checks. This
   completes [Story 1](seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks).
3. [Plan 21](quick/021-trust-native-verdicts/PLAN.md): four planned leaves repair
   shared activation, ADR behavior, combined update/use, and legacy-refusal
   checks. Use the retained evidence; document review instead of building a prose
   grading or reassessment system. This delivers
   [Story 2](seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts).

Seven leaves remain across these plans, including plan 20's final checkpoint.
Completed evidence is retained. Native acceptance stays in Story 3; no native
run, client work, or release is part of these implementation plans.

### Later client-work readiness

Reconsider SEED-001 Story 7 before preparing any new execution plan.
[Quick 019](quick/019-standalone-client-update/PLAN.md) is historical planning
input and will not be run as written. Its eventual reconciliation belongs to
[SEED-007 Story 4](seeds/SEED-007-cross-tool-validation.md#separate-native-acceptance),
after story reconsideration; it does not block test/infrastructure improvements.
Quick 018's completed overlapping cleanup is retained, not planned again; its
remaining tooling/archive cleanup is not a prerequisite. The client contract
follows the owner's explicit direction recorded in
[Proposed ADR 0004](../docs/adrs/0004-client-installation-and-update.md); ADR
acceptance remains human-owned. [Accepted ADR 0003](../docs/adrs/0003-tagged-release-versioning-accepted.md)
governs releases, including the maintainer's version choice before preparation.
Configuration remains outside the queue. This refinement does not execute the plan.

The earlier Donut task assessment is complete. Its temporary Codex installation
was subsequently removed, so inspect current Donut state before planning writes.
Do not count that assessment as a retained adoption or a successful new update.
Current source cleanup is recorded in Quick 018; this refinement claims no new
release or revised version/source/integrity delivery. Record fresh or justified
reused evidence for affected discovery, invocation/application, behavior, and
install/update/coexistence requirements per tool. Reuse representative integration
proof for unchanged mechanisms; do not repeat it for every skill. One tool's
success does not prove another's behavior.

## Deferred — promote on observed need

- [See the relevant changelog while updating](seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog) — when manually reading release notes obstructs an actual update. Notes remain source material, not installed history.
- [Extract plan execution with its required CI support](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor) — when a real execution task or repeated borrowing needs the complete script-supported flow.

## Parked ideas

- [Shared-branch collaboration experiment](seeds/SEED-002-trunk-based-multi-agent-collaboration.md) — when actual interdependent parallel work exposes a coordination problem. No agent mailbox or coordination infrastructure before that experiment.
- [Learn from client retrospective feedback](seeds/SEED-005-dear-do-retrospective-feedback-mailbox.md) — when useful version-specific reports arise from installed client use. Begin with existing project records and voluntary reporting; no installed mailbox or listener by default.

## Review coverage — 2026-09-07

Reviewed every seed and every unfinished story, plus the three unexecuted
changelog/adoption/update plans. Completed delivery evidence is retained.
The surviving work is grouped below; removed scopes and obsolete plan fragments
are deleted rather than retained as cancelled work.

| Area | Result |
| --- | --- |
| Installation/update | New Story 7 closes the gap between the proposed contract and current delivery; changelog presentation stays deferred. |
| Donut adoption | One-time preparation, caller repair, and useful native use form one outcome; a real newer-release update is prioritized immediately afterward. |
| Extraction | Story refinement and decomposition remain useful; release and ordinary self-update are part of their outcomes. Complex execution support stays deferred. |
| Other existing clients | A finite adoption story handles named projects individually, with shared changes made before release. |
| Oversized plans | The useful feedback is included in story decomposition, without a separate seed or feature. |
| Collaboration and feedback | Retained as parked ideas with concrete triggers and no new default client machinery. |

SEED-007 Stories 1–4 now lead the queue. The real-client path follows and
retains its priority over further extraction.

## Recently done

- [Use released ADR guidance on one real Donut task](seeds/SEED-006-extend-adr-guidance-adoption.md#prepare-donut-adr-adoption) — SEED-006 Story 2

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
