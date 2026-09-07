## 0.2.1 - 2026-09-07

ADR-awareness now requires only context needed for the current request and does not invent disagreement or supersession policies when those situations are absent. dough-update can assess whether installed ADR guidance could replace a local practice, retain required adopter context, and switch callers after authorized replacement. Automatic changelog presentation during install or update remains future work.

## 0.2.0 - 2026-09-06

Safe installation now selects and inspects the pinned latest numeric release. Recorded updates advance older installations, leave equal versions unchanged, and preserve newer versions. The public payload now includes ADR-awareness and its recognition record for Codex, Cursor, and Claude Code. Local-guidance replacement and automatic changelog presentation remain future work.

## 0.1.0 - 2026-09-06

Installer and dough-update install and refresh project-local Open Dough guidance from a supplied repository URL for Codex, Cursor, and Claude Code. Updates clone the default branch and unconditionally reinstall the fetched skill. Maintainers can prepare and tag source releases with the internal release-version skill (canonical .agents/skills/release-version/SKILL.md, plus a thin Claude Code discovery pointer only). The installer does not distribute that internal skill or the repository AGENTS.md acceptance guard. This release does not add version-aware updates or automatic changelog display during install or update.
