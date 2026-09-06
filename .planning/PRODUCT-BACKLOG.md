# Product backlog

## Near-future direction

Bootstrap Open Dough so it can install its own skills and rules into this
repository. Then use those installed skills and rules to develop Open Dough
itself, learning from real work before extending adoption to other projects.

## Unfinished stories

1. [Install the latest released Open Dough guidance safely](seeds/SEED-001-install-and-update-open-dough.md#install-latest-release) — SEED-001
2. [Establish a known release for an unversioned installation](seeds/SEED-001-install-and-update-open-dough.md#establish-unversioned-installation) — SEED-001
3. [Publish the version-aware Open Dough updater](seeds/SEED-001-install-and-update-open-dough.md#publish-version-aware-updater) — SEED-001
4. [Adopt and reuse the released updater in Open Dough](seeds/SEED-001-install-and-update-open-dough.md#adopt-version-aware-updater) — SEED-001
5. [See the relevant changelog while updating Open Dough](seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog) — SEED-001
6. [Turn a supplied project practice into usable public guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance) — SEED-004
7. [Replace equivalent local guidance when updating Open Dough](seeds/SEED-004-extract-and-adopt-project-guidance.md#replace-equivalent-guidance-on-update) — SEED-004
8. [Adopt shared guidance while preserving useful local differences](seeds/SEED-004-extract-and-adopt-project-guidance.md#preserve-local-behavior-during-replacement) — SEED-004
9. [Start using Open Dough without leaving overlapping local guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install) — SEED-004

## Recently done

- [Keep a recorded Open Dough installation current only when needed](seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed) — completed 2026-09-06; older, equal, and newer recorded versions each produce the correct native outcome in Codex, Cursor, and Claude Code, executing only the inspected pinned release; retrospective corrections for pinned-code execution, temporary-work cleanup, and numeric comparison are folded in; the detailed slice plan was dropped after acceptance.

- [Create an identifiable Open Dough release with the internal skill](seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version) — completed 2026-09-06; `release-version` prepares/finalizes `VERSION` and `CHANGELOG.md` with immutable `vMAJOR.MINOR.PATCH` tags; native Codex, Cursor, and Claude Code proof recorded; `v0.1.0` published; installer still omits the internal skill and acceptance guard.

- [Use and update Open Dough guidance in Cursor and Claude Code projects](seeds/SEED-001-install-and-update-open-dough.md#cursor-project-installation) — completed 2026-09-06; Cursor and Claude Code install/update, repeat protection, forced replacement, and native reuse of a pushed shared improvement (including unchanged-content reapplication) verified separately in both tools alongside existing Codex use.

- [Apply the latest shared guidance to Open Dough's Codex installation](seeds/SEED-001-install-and-update-open-dough.md#update-after-source-change) — completed 2026-09-06; supplied-URL update, GitHub self-use, fresh-session wording, and unchanged-content reapplication verified.

- [Install Open Dough's update placeholder from a supplied URL for Codex](seeds/SEED-001-install-and-update-open-dough.md#install-from-github) — completed 2026-09-06; GitHub self-install, Codex invocation, repeat protection, and forced replacement verified.
