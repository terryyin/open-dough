# Product backlog

## Near-future direction

Bootstrap Open Dough so it can install its own skills and rules into this
repository. Then use those installed skills and rules to develop Open Dough
itself, learning from real work before extending adoption to other projects.

## Unfinished stories

1. [Update Open Dough to the latest release only when needed](seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed) — SEED-001
2. [See the relevant changelog while updating Open Dough](seeds/SEED-001-install-and-update-open-dough.md#show-update-changelog) — SEED-001
3. [Replace equivalent local guidance when updating Open Dough](seeds/SEED-004-extract-and-adopt-project-guidance.md#replace-equivalent-guidance-on-update) — SEED-004
4. [Adopt shared guidance while preserving useful local differences](seeds/SEED-004-extract-and-adopt-project-guidance.md#preserve-local-behavior-during-replacement) — SEED-004
5. [Start using Open Dough without leaving overlapping local guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install) — SEED-004

## Recently done

- [Turn a supplied project practice into usable public guidance](seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance) — completed 2026-09-06; source-selectable internal extraction produced evaluated `dough-adr-awareness` guidance, with native extraction, install/update, fresh use, alternate-layout behavior, and coexistence verified independently in Codex, Cursor, and Claude Code.

- [Create an identifiable Open Dough release with the internal skill](seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version) — completed 2026-09-06; `release-version` prepares/finalizes `VERSION` and `CHANGELOG.md` with immutable `vMAJOR.MINOR.PATCH` tags; native Codex, Cursor, and Claude Code proof recorded; `v0.1.0` published; installer still omits the internal skill and acceptance guard.

- [Use and update Open Dough guidance in Cursor and Claude Code projects](seeds/SEED-001-install-and-update-open-dough.md#cursor-project-installation) — completed 2026-09-06; Cursor and Claude Code install/update, repeat protection, forced replacement, and native reuse of a pushed shared improvement (including unchanged-content reapplication) verified separately in both tools alongside existing Codex use.

- [Apply the latest shared guidance to Open Dough's Codex installation](seeds/SEED-001-install-and-update-open-dough.md#update-after-source-change) — completed 2026-09-06; supplied-URL update, GitHub self-use, fresh-session wording, and unchanged-content reapplication verified.

- [Install Open Dough's update placeholder from a supplied URL for Codex](seeds/SEED-001-install-and-update-open-dough.md#install-from-github) — completed 2026-09-06; GitHub self-install, Codex invocation, repeat protection, and forced replacement verified.
