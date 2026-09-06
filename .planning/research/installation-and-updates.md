# Installation and update exploration

Explored 2026-09-06 against the local OpenGSD checkout `../gsd-core`, commit
`0be5bf865a6ca8ca6cee5fa9344c35b19d8623ee` (package version `1.12.0`, clean
working tree). Findings below come from reading source and tests; no installer
was executed. This is design input, not an accepted ADR or an execution plan.

## How OpenGSD works

| Concern | Observed mechanism | Useful direction for Open Dough |
| --- | --- | --- |
| Initial entry point | The npm package exposes `bin/install.js`; the usual command is `npx @opengsd/gsd-core@latest`, with runtime and local/global selection. | A GitHub entry point can fetch a release and invoke a small installer with an explicit target project. npm distribution is unnecessary. |
| Platform adaptation | The installer transforms canonical commands, skills, agents, and references using runtime descriptors. Local config roots include `.codex`, `.cursor`, and `.claude`. | Share lifecycle content and adapt its discovery files for each supported tool. Treat GSD layouts as examples to verify, not Open Dough's decided mappings. |
| Installed identity | `VERSION` comes from `package.json`. A runtime marker and `gsd-file-manifest.json` identify the install; the manifest records package version, separate manifest schema version, runtime, scope, mode, and file hashes. | Record source repository, installed release and exact revision, selected platforms, manifest schema, and managed file hashes in the project. Version identity belongs in the first usable install. |
| Update | The update workflow resolves the existing installation, queries npm for the latest version, shows changes, then invokes the installer again for the same runtime/scope. Selected profiles can survive reinstall. | Resolve GitHub latest once, fetch that exact revision, and reuse installation logic against the same project and selected platforms. |
| Local modifications | Before replacement, `saveLocalPatches` compares installed files with manifest SHA-256 hashes and backs up changed files. The workflow separately backs up user-added files in managed directories. | Distinguish owned files from project additions. For the initial updater, report conflicting edits and stop before replacement; automatic merging can wait. |
| Reapply and retirement | Reapplication uses Git history or pristine snapshots for a three-way comparison, with a two-way fallback. Installer migrations handle moved or retired artifacts. | Remove only previously managed, unchanged files that the new release retires. Avoid directory-wide wiping. Add merge machinery only when a concrete customization requires it. |

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
ready-to-run distribution. Open Dough should either ship a self-contained
installer with no compilation requirement or publish a complete built asset.

GSD's MIT license permits reuse subject to its notice terms. If code is copied,
retain the relevant copyright and permission notice. No GSD code was copied
during this exploration.

## Proposed Open Dough approach

1. Start from the canonical GitHub URL in the project README. Resolve the latest
   published release to an exact revision, then fetch its complete payload into
   temporary staging. Latest default-branch commit remains an alternative
   pending the owner's choice of what “latest” means.
2. Invoke the fetched installer with the target repository explicitly identified.
   Offer only project installation. Do not write shared skills, rules, defaults,
   hooks, or launchers into home-level agent configuration. Temporary download
   staging is separate from installed guidance.
3. Keep distributable source separate from installed output. In Open Dough
   itself, the repository is both producer and consumer, but installing must
   never overwrite source content or copy generated output back into source.
4. Install the minimum useful skill and rules for one platform, with all required
   references. Preserve project documents and existing user-owned guidance.
   Record provenance and owned-file hashes; expose a clear installed version.
5. On update, read the project's record, resolve latest again, compare the
   incoming payload with the previous managed set and the actual files, and
   preflight conflicts. Reuse the install path to add, replace, or retire only
   owned files. Refuse a collision with an unowned file or a changed installed
   file, naming the path and leaving the existing install usable.
6. Stage and validate before applying changes. Report success and advance the
   installed version only after the update succeeds; a failed fetch must leave
   the existing installation intact. Present the resulting ordinary Git diff.
   A repeat update to identical content should produce no new diff.

This proposal uses versions to identify what is installed, not to offer version
selection or pinning. One product release version plus the exact source revision
is enough initially; individual skills do not need independent version numbers.
The install-record schema version is a separate compatibility concern.

No installer language, command syntax, directory mapping, or release automation
is selected by this note. A GitHub release asset and a self-contained script in
a tagged source snapshot are both feasible delivery options. A package registry
and global installation are unnecessary for either option.

## Self-use demonstration

The proposed release-based journey is:

1. Publish release A containing a usable minimal skill and its rules.
2. Install from Open Dough's GitHub URL into the Open Dough repository; review
   and commit the installed output separately from the distributable source.
3. Edit that skill's **source** in the repository and publish release B.
4. Run the project's update. It fetches B from GitHub, updates the installed
   copy and recorded identity, and preserves the edited source and other files.
5. Start a fresh agent session and demonstrate the changed skill behavior.

An uncommitted source edit cannot arrive through GitHub. Under the proposed
release model, a pushed change also needs a new release before an update sees
it. Under a default-branch model, pushing a new commit would suffice, but the
record must distinguish commits even if a human-readable version is unchanged.

Editing an **installed** copy is a different case: it is a local customization,
not a new product release. The proposed initial policy preserves it by refusing
to overwrite it and asking the maintainer to resolve the named conflict.

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
