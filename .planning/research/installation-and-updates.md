# Installation and update exploration

Explored 2026-09-06 against the local OpenGSD checkout `../gsd-core`, commit
`0be5bf865a6ca8ca6cee5fa9344c35b19d8623ee` (package version `1.12.0`, clean
working tree). Findings below come from reading source and tests; no installer
was executed. GSD findings are reference material; the Open Dough direction below reflects the
owner's subsequent clarification. This is not an accepted ADR or execution plan.

## How OpenGSD works

| Concern | Observed mechanism | Useful direction for Open Dough |
| --- | --- | --- |
| Initial entry point | The npm package exposes `bin/install.js`; the usual command is `npx @opengsd/gsd-core@latest`, with runtime and local/global selection. | Use the supplied source URL and an explicit target project. The usual source is default-branch latest; npm distribution and published releases are unnecessary. |
| Platform adaptation | The installer transforms canonical commands, skills, agents, and references using runtime descriptors. Local config roots include `.codex`, `.cursor`, and `.claude`. | Share lifecycle content and adapt its discovery files for each supported tool. Treat GSD layouts as examples to verify, not Open Dough's decided mappings. |
| Installed identity | `VERSION` comes from `package.json`. A runtime marker and `gsd-file-manifest.json` identify the install; the manifest records package version, separate manifest schema version, runtime, scope, mode, and file hashes. | Version identity and update detection belong to a later story. Do not require GSD-style version metadata for the first installation or update. |
| Update | The update workflow resolves the existing installation, queries npm for the latest version, shows changes, then invokes the installer again for the same runtime/scope. Selected profiles can survive reinstall. | Fetch and apply the latest default-branch content using the installation logic for the same project and selected platforms. No installed-version comparison initially. |
| Local modifications | Before replacement, `saveLocalPatches` compares installed files with manifest SHA-256 hashes and backs up changed files. The workflow separately backs up user-added files in managed directories. | Keep this as reference for later discussion. Stop-and-report behavior and other policies for edits to installed copies are not selected. |
| Reapply and retirement | Reapplication uses Git history or pristine snapshots for a three-way comparison, with a two-way fallback. Installer migrations handle moved or retired artifacts. | Retirement and merge policy are deferred. Neither migrations nor GSD-style backups are prerequisites for the initial unchanged-copy update example. |

The version check and installation targeting are implemented in deterministic
helpers rather than left to an agent to invent commands. This is a useful
separation: a skill can explain or invoke an update, while code owns which
source and destination are used.

## Limits of copying GSD's installer

GSD's `--local` does not establish the stronger boundary requested here.
`writeNonClaudeDefaults()` writes `~/.gsd/defaults.json`; its ordinary finish
call is not conditional on global scope, and Codex also calls it before agent
configuration generation. The update workflow clears caches in home-level
locations as well as project locations. Copying the local branch unchanged
would therefore carry shared machine state into Open Dough.

GSD's installer also imports compiled CommonJS modules from `gsd-core/bin/lib`.
Its package declares build hooks (`prepare`/`prepack`) and its documentation
describes generated hooks. A source archive is not automatically the same as a
ready-to-run distribution. Open Dough needs a usable payload at the supplied URL. A self-contained
installer can avoid requiring compilation or a release-publication step.

GSD's MIT license permits reuse subject to its notice terms. If code is copied,
retain the relevant copyright and permission notice. No GSD code was copied
during this exploration.

## Open Dough direction

The owner chose default-branch latest, supplied-URL installation, and a simple
initial update on 2026-09-06. These choices replace the earlier release-based
proposal and its prerequisite version records.

1. Install content addressed by the URL the user supplies. Normally that URL
   points to the latest default-branch content (`main` for Open Dough). Do not
   silently redirect an explicit source URL to a different revision or release.
2. Identify the target repository explicitly and install guidance only there.
   Do not write shared skills, rules, defaults, hooks, or launchers into
   home-level agent configuration. Temporary fetching is separate from installed
   guidance; the fetch mechanism remains an implementation choice.
3. Keep distributable source separate from installed output. In Open Dough
   itself, the repository is both producer and consumer; installation and update
   must preserve the source and unrelated project work.
4. First install a discoverable update placeholder for Codex. It reports that
   updating is not implemented yet. Repeat installation warns or stops; an
   explicit override reinstalls the supplied payload over its installed files
   without migration. The refined contract lives in
   [Story 1](../seeds/SEED-001-install-and-update-open-dough.md#install-from-github).
5. Once real updating is implemented in Story 2, fetch and apply the latest
   default-branch content using the same installation behavior. Do this without
   reading an installed version, comparing versions, or deciding that an update
   is unnecessary. The first demonstration uses unchanged installed copies.
6. Add Cursor and Claude Code support together after the Codex loop works.
   Version identity and update detection come afterward as a separate story.

A version-check skill or helper may become useful later, but it is unnecessary
for applying latest. GitHub release publication, semantic-version increments,
per-skill versions, and update-availability checks are not initial requirements.
Supported URL forms, installer language, command syntax, and destination layout
remain for refinement.

Conflict behavior for the automatic updater remains unresolved. The owner has
authorized overwriting installed files on an explicitly insisted reinstall.
GSD's backups, hash comparisons, and three-way merges remain reference ideas;
they are not required for that simple reinstall behavior.

## Self-use demonstration

1. Push the installer and update placeholder to Open Dough's default branch.
2. Install from the supplied GitHub URL into the Open Dough repository; review
   the installed files separately from the distributable source.
3. Invoke the placeholder and observe its not-implemented response. It does not
   download or change anything.
4. After implementing real updating in Story 2, push the source and explicitly
   force reinstall to obtain it. The placeholder cannot perform this transition.
5. Make a further skill **source** change and push it to `main`. Run the real
   update command. It fetches and applies latest without checking
   whether a newer version exists. Source and unrelated project files survive.
6. Start a fresh Codex session and demonstrate the changed skill behavior.
7. Running update again still fetches and applies latest; a version detector
   is not part of this flow.

An uncommitted or unpushed source edit cannot arrive through GitHub. Pushing to
the default branch is enough; no tag or release is needed.

Editing an **installed** copy is a separate customization case. Forced reinstall
overwrites it as explicitly requested. Its treatment during automatic updating
will be discussed later; the initial update demonstration excludes such edits.

## Evidence pointers

All GSD links are to the inspected sibling checkout; the revision above fixes
the context of this exploration.

- [Installer](../../../gsd-core/bin/install.js): `pkg` near line 533;
  `fileHash` at 9775; `writeManifest` at 9835; `saveLocalPatches` at 10168;
  installation at 10421; version write at 11501;
  `writeNonClaudeDefaults` at 6993 and calls near 12164 and 13090.
- [Package/build contract](../../../gsd-core/package.json)
- [Update workflow](../../../gsd-core/gsd-core/workflows/update.md)
- [Latest-version helper](../../../gsd-core/gsd-core/bin/check-latest-version.cjs)
- [Update target resolution](../../../gsd-core/src/update-context.cts)
- [Install scope](../../../gsd-core/src/install-scope.cts)
- [Codex descriptor](../../../gsd-core/capabilities/codex/capability.json),
  [Cursor descriptor](../../../gsd-core/capabilities/cursor/capability.json),
  [Claude Code descriptor](../../../gsd-core/capabilities/claude/capability.json)
- [Reapply workflow](../../../gsd-core/gsd-core/workflows/reapply-patches.md)
- [Manual source update](../../../gsd-core/docs/manual-update.md)
- [Write confinement tests](../../../gsd-core/tests/install-write-confinement.test.cjs)
- [Profile preservation tests](../../../gsd-core/tests/install-update-marker.test.cjs)
- [GSD license](../../../gsd-core/LICENSE)
