# Product backlog

## Near-future direction

Make the revised Open Dough installation and update workflow work in a real
client, beginning with Donut. A retained adoption followed by a useful newer
release update is the highest-priority outcome. Clients run `dough-update`,
then review and commit the changed files.

Extract and improve shared guidance in Open Dough. Replace the few known
borrowed copies once, handling their actual differences directly. Thereafter,
maintain released Open Dough versions; do not build a permanent local-guidance
matching, reconciliation, or recovery product.

## Queue

1. [Release the standalone client installation and update workflow](seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update) — SEED-001 Story 7. Deliver the smaller payload, descriptive source-only recognition, remembered source/version, ordinary updates and explicit forced replacement; publish the verified result.
2. [Adopt the simplified release once in Donut and use it](seeds/SEED-006-extend-adr-guidance-adoption.md#finish-donut-adr-adoption) — SEED-006 Story 3. Prepare the actual integrations, retain context, replace the borrowed original once, and use the installed guidance on real work.
3. [Use a meaningful newer release through Donut's ordinary updater](seeds/SEED-006-extend-adr-guidance-adoption.md#preserve-donut-adr-adoption-on-update) — SEED-006 Story 4. Do this as soon as a useful newer release exists; it takes priority over further extraction.
4. [Release story refinement and use it on a real backlog story](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-refinement) — SEED-004 Story 6. If item 3 has no useful release yet, do this next to supply one, then return immediately to item 3.
5. [Release story decomposition and use it on real product work](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-decomposition) — SEED-004 Story 7. Reuse oversized-plan feedback as part of this practice.
6. [Replace borrowed guidance once in the remaining known client projects](seeds/SEED-004-extract-and-adopt-project-guidance.md#adopt-known-client-projects) — SEED-004 Story 8. After the Donut path works, handle the owner's roughly three or four other projects one at a time, with a named project and useful practice for each pass.

## Next-item readiness

Refine SEED-001 Story 7 against the actual installer/updater. The client contract
is recorded in [Proposed ADR 0004](../docs/adrs/0004-client-installation-and-update.md)
and follows the owner's explicit direction; ADR acceptance remains a separate
human-owned decision. [Accepted ADR 0003](../docs/adrs/0003-tagged-release-versioning-accepted.md)
continues to govern releases. Configuration has no real use case yet and is not
part of the implementation queue.

The earlier Donut task assessment is complete. Its temporary Codex installation
was subsequently removed, so inspect current Donut state before planning writes.
Do not count that assessment as a retained adoption or a successful new update.
No current source simplification, new release, or revised native delivery is
claimed by this backlog review. Codex, Cursor, and Claude Code each need their
own affected discovery, invocation/application, behavior, install/update, and
coexistence evidence. A native check in one application does not prove another.

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

This order follows the owner's latest direction: the successful real-client
path takes priority over more extraction. This commit changes planning and ADR
proposals, not releases, installed guidance, or client files.

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
