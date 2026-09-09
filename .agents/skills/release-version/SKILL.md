---
name: release-version
description: Prepare or finalize an Open Dough source release with VERSION, CHANGELOG.md, and a matching Git tag. Use when the user asks to release-version, prepare or finalize a release, write VERSION or CHANGELOG, or create a version tag.
---

# Release an Open Dough version

Use Git and Markdown only. Do not add helper scripts, dependencies, registries,
or CI jobs. This skill is internal to the Open Dough repository.

Follow [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
for the Proposed → Promoted → Released lifecycle. Release the Promoted client
payload declared by `install.sh` and `src/install/open-dough-release-version.sh`;
check that those declarations agree and include required runtime dependencies.
Confirm the applicable behavior and delivery reviews cover the intended changes.
Do not add Proposed guidance to the payload as an incidental release step.

1. Capture the requested numeric `MAJOR.MINOR.PATCH` and the human-readable
   change description. Ask for any missing piece before writing files. Treat
   `prepare` as metadata-only review. Treat `finalize` as commit-plus-tag of
   intended metadata. If the user asks to release without naming prepare or
   finalize, ask which stopping point they want.

2. List tags with `git tag --list 'v*'`. The prior release is the highest
   numeric tagged version. A `VERSION` file or `CHANGELOG.md` entry is
   preparation, not a release, and must not be treated as an existing tag.
   With no `v*` tags there is no prior release; the first release is `0.1.0`.

3. Compare the requested version to the prior tagged release before writing
   any new release metadata:
   - If `vMAJOR.MINOR.PATCH` already exists, refuse. Release tags are
     immutable. Do not force-tag, move a tag, or rewrite that version's notes.
   - If a prior tagged release exists and the requested version is not
     numerically greater, refuse and explain the ordering problem. An unused
     older tag name is still a refusal.
   - The same version may be finalized from its prepared `VERSION` and
     `CHANGELOG.md` when that tag does not yet exist.
   Stop on refusal without creating, editing, or deleting `VERSION`,
   `CHANGELOG.md`, commits, or tags.

4. When the request includes finalization, run
   `bash scripts/check-self-installation.sh` from the repository root (or
   with the repository path) before writing `VERSION` or `CHANGELOG.md`,
   staging, committing, or tagging. If the check fails, stop without
   creating, editing, or deleting `VERSION`, `CHANGELOG.md`, commits, or
   tags. Cite the check failure. Skip this check for preparation-only.

5. For preparation, write `VERSION` containing only the requested version
   followed by a newline. In `CHANGELOG.md`, insert a newest-first heading
   `## MAJOR.MINOR.PATCH - YYYY-MM-DD` using today's date, then the supplied
   change description. Preserve every previous changelog entry unchanged.
   Create `CHANGELOG.md` when it does not exist. Do not create a Git tag. Do
   not commit unless the user also asked to finalize. Do not stage, commit,
   reset, or otherwise alter unrelated working-tree changes.

6. For finalization, the Promoted client payload must already be committed.
   Stage and commit only `VERSION` and `CHANGELOG.md` when those files differ
   from HEAD. Create an annotated tag `vMAJOR.MINOR.PATCH` on that metadata
   commit, or on HEAD if the metadata is already committed. Never use
   `--force` on tags. Never include unrelated staged or unstaged files. Never
   reset unrelated work. Do not push.

7. Report the actual local result. For preparation, name the written `VERSION`
   and changelog heading and say the notes are ready for review; do not claim
   a tag or a release. For finalization, name the commit and local tag; do not
   claim it is Released from a remote source until the tag is available there.
   Do not claim version-aware updates or automatic
   changelog presentation during install or update.
