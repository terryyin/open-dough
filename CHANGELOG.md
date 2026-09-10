## 0.3.5 - 2026-09-10

Planning guidance now infers plan numbers and treats numeric timing limits as optional.

## 0.3.4 - 2026-09-09

CI host hooks: install and update portable Cursor and Claude Code observation hooks, merge them safely beside existing settings, repair missing registrations on repeat use, and preserve semantically complete configuration without rewrites.

This release uses a maintainer-approved one-release exception: Cursor's Claude-compatibility invocation and SEED-007's native Claude updated-use check remain explicitly pending rather than being reported as passing.

## 0.3.3 - 2026-09-09

Execution-related skills: add `dough-execute-plan` and `dough-post-change-refactor` to the client payload, including execution references, asynchronous CI observation scripts, and host hook fragments.

## 0.3.2 - 2026-09-08

Publish three story-refinement workflow skills in the installable client payload: `dough-resplit-story`, `dough-slice-planning`, and `dough-slice-plan-refinement`.

## 0.3.1 - 2026-09-08

Add story-related skills: `dough-story-decomposition` and `dough-story-refinement`, including their supporting references, to installation and updates for Codex, Cursor, and Claude Code.

## 0.3.0 - 2026-09-08

Fix update.

## 0.2.5 - 2026-09-08

Promote `dough-product-backlog` into the installable public payload for Codex, Cursor, and Claude Code. Install and update verification now includes the product-backlog skill alongside the updater and ADR-awareness guidance.

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
