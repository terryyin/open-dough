## 0.2.4 - 2026-09-08

Codex and Cursor now share the same `.agents/skills/` folder, avoiding a duplicate installed payload while Claude Code continues to use `.claude/skills/`. Installation and updates still serve all three tools together through the two physical skill roots.

## 0.2.3 - 2026-09-08

Install and update Open Dough across Codex, Cursor, and Claude Code together.

## 0.2.2 - 2026-09-08

Standalone installations remember their release source and version. Ordinary updates use that source without a URL and verify the installed baseline before replacement; unverifiable installations refuse without writes, and verified current versions remain unchanged. Explicit force restores the complete latest payload, including a one-time supplied-source bootstrap for legacy installations. Client changes remain reviewable and uncommitted.

Released for maintainer manual trials under an explicit acceptance exception: Cursor's candidate update and fresh-use journey passed; Codex installed-skill loading remains inconclusive, and Claude Code verification remains pending after test-launcher permission failures. Cross-platform native acceptance is not complete.

## 0.2.1 - 2026-09-07

ADR-awareness now requires only context needed for the current request and does not invent disagreement or supersession policies when those situations are absent. dough-update can assess whether installed ADR guidance could replace a local practice, retain required adopter context, and switch callers after authorized replacement. Automatic changelog presentation during install or update remains future work.

## 0.2.0 - 2026-09-06

Safe installation now selects and inspects the pinned latest numeric release. Recorded updates advance older installations, leave equal versions unchanged, and preserve newer versions. The public payload now includes ADR-awareness and its recognition record for Codex, Cursor, and Claude Code. Local-guidance replacement and automatic changelog presentation remain future work.

## 0.1.0 - 2026-09-06

Installer and dough-update install and refresh project-local Open Dough guidance from a supplied repository URL for Codex, Cursor, and Claude Code. Updates clone the default branch and unconditionally reinstall the fetched skill. Maintainers can prepare and tag source releases with the internal release-version skill (canonical .agents/skills/release-version/SKILL.md, plus a thin Claude Code discovery pointer only). The installer does not distribute that internal skill or the repository AGENTS.md acceptance guard. This release does not add version-aware updates or automatic changelog display during install or update.
