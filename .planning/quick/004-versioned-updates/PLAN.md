# Create an identifiable Open Dough release with the internal skill

Status: complete — 2026-09-06. Published annotated `v0.1.0` on
`53b6da2` (`VERSION` / `CHANGELOG.md` only). Stories 5–6 were not executed.

Source: [SEED-001, Story 4](../../seeds/SEED-001-install-and-update-open-dough.md#release-tagged-version).

## Goal and scope

The Open Dough maintainer uses one internal skill to prepare and tag a chosen
release with matching source version, dated changelog, and committed payload.
The skill works natively in Codex, Cursor, and Claude Code. Ordinary Git
publication lets another reader fetch and identify that release.

The outcome remains useful if later updater and presentation stories are
cancelled. This story has no installer changes, installed-version records,
version comparisons during update, legacy migration, or automatic changelog
presentation. Current installed copies and public `dough-update` remain
intact. Release notes describe only delivered behavior, including the existing
unconditional updater.

Exclude automatic bump selection, per-skill versions, prereleases, signing,
rollback, release services/pipelines, new global configuration, unrelated skill
distribution, and broad release-management tooling. The internal skill and the
repository acceptance guard are not distributed to adopting projects.

Canonical skill: `.agents/skills/release-version/SKILL.md`. Cursor loads that
path natively. Claude Code needs a thin
`.claude/skills/release-version/SKILL.md` pointer.

## Native evidence

| Platform | Discovery and invocation | Release behavior and coexistence |
| --- | --- | --- |
| Codex | Done — `$release-version` loaded `.agents/skills/release-version/SKILL.md`; CLI 0.153.4 sessions prepare `01a074f8-f035-7752-b631-355e0401ee92`, finalize `01a07502-cbb1-7f21-a713-7e9d86de3613`, later prepare `01a07506-e535-7de3-9bfd-60838e5533f1`, refuse existing `01a0750b-5dba-7e22-9c7c-9b8a4b686c88`, refuse older unused `01a0750f-d6a4-7911-a7e2-0ede4c930bc6` | Done — fixture prepare/finalize/history/refusals; sentinels and home guidance unchanged |
| Cursor | Done — `/release-version` loaded `.agents/skills/release-version/SKILL.md`; `agent` 2026.04.13-a9d7fb5 session `1bd99d48-723d-4d9d-b280-ffe3328ab543`. No `.cursor/skills/release-version` | Done — fixture `v0.1.1`; 0.1.0 notes preserved; sentinels and home guidance unchanged |
| Claude Code | Done — `/release-version` selected `.claude/skills/release-version/SKILL.md` then followed canonical `.agents` skill; CLI 2.1.263 session `b26a6196-a048-4d0f-b302-691e5661cb83`. First invoke without the thin entry was unknown-command | Done — fixture `v0.1.1`; 0.1.0 notes preserved; sentinels and home guidance unchanged |

Real maintainer self-use: done — 8 (Cursor `agent` session `d1f30913-e572-49b6-9d8e-19b91ea09b63`; local then published annotated `v0.1.0` peel `53b6da2`, tag object `9bfbe47`; notes do not claim Stories 5–6).
Published release identity: done — 9 (`git push origin refs/tags/v0.1.0` with no force; fresh clone matched peel, `VERSION`, and dated notes).
Adopter output exclusion: done — `bash tests/install-omits-internal.sh` and `bash tests/install.sh`.

## Learnings

- Use ChatGPT.app Codex 0.153.4, not PATH `codex` 0.144.1.
- Cursor discovers `.agents/skills`; Claude Code does not — keep the thin Claude pointer, not a second procedure.
- Prepare needs workspace file writes; finalize/tag needs a sandbox that can write `.git`.
- Do not treat unused older versions as allowed; numeric order against the highest `v*` tag is the prior release.
- Stories 5–6 still own version-aware install/update and changelog presentation.
