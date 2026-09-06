# Product backlog

- [Adopt and reuse released guidance in Open Dough](seeds/SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater) — SEED-001
- [Start using Open Dough without leaving overlapping local guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install) — SEED-004
- [Refine stories with an extracted Open Dough skill](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-refinement) — SEED-004
- [Decompose product work with an extracted Open Dough skill](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-story-decomposition) — SEED-004
- [Replace equivalent local guidance when updating Open Dough](seeds/SEED-004-extract-and-adopt-project-guidance.md#replace-equivalent-guidance-on-update) — SEED-004
- [Adopt shared guidance while preserving useful local differences](seeds/SEED-004-extract-and-adopt-project-guidance.md#preserve-local-behavior-during-replacement) — SEED-004
- [See the relevant changelog while updating Open Dough](seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog) — SEED-001
- [Extract reusable plan execution with its CI monitor and supporting scripts](seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor) — SEED-004

## Recently done

- [Publish extracted guidance and the version-aware updater](seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater) — completed 2026-09-06; annotated `v0.2.0` publishes the accepted safe installer, version-aware updater, and ADR-awareness payload; a fresh HTTPS repository matched the exact tag object, peeled commit, complete tree, metadata, and preserved `v0.1.0`.

- [Install the latest released Open Dough guidance safely](seeds/SEED-001-install-and-update-open-dough.md#install-latest-release) — completed 2026-09-06; the README-linked flow selects and inspects the pinned numeric release before direct installation; focused success/stale-selection checks and separate native installations in Codex, Cursor, and Claude Code passed, with payload/version verification, guidance preservation, and temporary-checkout cleanup; the spent plan was dropped after acceptance.

- [Turn a supplied project practice into usable public guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance) — completed 2026-09-06; source-selectable internal extraction produced evaluated `dough-adr-awareness` guidance, with native extraction, install/update, fresh use, alternate-layout behavior, and coexistence verified independently in Codex, Cursor, and Claude Code.

- [Keep a recorded Open Dough installation current only when needed](seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed) — completed 2026-09-06; older, equal, and newer recorded versions each produce the correct native outcome in Codex, Cursor, and Claude Code, executing only the inspected pinned release; retrospective corrections for pinned-code execution, temporary-work cleanup, and numeric comparison are folded in; the detailed slice plan was dropped after acceptance.

- [Create an identifiable Open Dough release with the internal skill](seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version) — completed 2026-09-06; `release-version` prepares/finalizes `VERSION` and `CHANGELOG.md` with immutable `vMAJOR.MINOR.PATCH` tags; native Codex, Cursor, and Claude Code proof recorded; `v0.1.0` published; installer still omits the internal skill and acceptance guard.

- [Use and update Open Dough guidance in Cursor and Claude Code projects](seeds/SEED-001-install-and-update-open-dough.md#cursor-project-installation) — completed 2026-09-06; Cursor and Claude Code install/update, repeat protection, forced replacement, and native reuse of a pushed shared improvement (including unchanged-content reapplication) verified separately in both tools alongside existing Codex use.

- [Apply the latest shared guidance to Open Dough's Codex installation](seeds/SEED-001-install-and-update-open-dough.md#update-after-source-change) — completed 2026-09-06; supplied-URL update, GitHub self-use, fresh-session wording, and unchanged-content reapplication verified.

- [Install Open Dough's update placeholder from a supplied URL for Codex](seeds/SEED-001-install-and-update-open-dough.md#install-from-github) — completed 2026-09-06; GitHub self-install, Codex invocation, repeat protection, and forced replacement verified.
