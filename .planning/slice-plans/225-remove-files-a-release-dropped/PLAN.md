# Remove installed files that a newer release no longer declares

**Identity:** SEED-001#remove-files-a-release-dropped
**Source:** [refined story](../../seeds/SEED-001-install-and-update-open-dough.md#remove-files-a-release-dropped).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace.

## Goal and boundaries

After `dough-update` installs a newer release, the installed skill roots hold
only the files that release declares plus the project's own files. A leftover
is an installed file at a path that some release up to the new one declared
and the new release does not, found through the release history at the
recorded source. An ordinary update removes unedited leftovers, refuses edited
ones without writes, and the explicit force replacement removes all of them.
The update result lists removed files.

Material exclusions, from the story:

- The already-current path (recorded release equals latest) removes nothing.
- Paths no release declared stay untouched, including `dough-update/SOURCE`
  and `VERSION`.
- No manifest, checksum record, or new configuration.

## Direction and PFE

[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
decision 5 governs: immutable release tags supply comparison content, ordinary
updates stop without writes on changed managed content, explicit force
overwrites edits, and no permanent checksum records are kept. Decision 3: the
updater fetches maintenance material from the pinned source and discards the
temporary copy. The history fetch below follows both.

Reuse, from `src/install/`:

- `read_managed_files_declaration` (`open-dough-release-version.sh`) reads each
  historical release's declaration from its `install.sh`.
- `git_url`, the `ls-remote` tag listing, and `is_release_version` /
  `compare_versions` (`open-dough-release-resolve.sh`,
  `open-dough-release-version.sh`) select release tags up to the new version.
- `all_roots_verified_for_release` (`open-dough-release-baseline.sh`) is the
  ordinary path's pre-write verification; the edited-leftover refusal joins it.
- `apply_release` (`open-dough-release-apply.sh`) owns the ordinary
  (`apply-reconcile`) and force (`apply-force`) paths and the apply work root
  that is cleared afterwards.

Gap: nothing reads release history; the release fetch is one commit at depth 1.
Add one module, sourced by `open-dough-release.sh`, that fetches the release
tags' trees into the apply work root and computes leftovers per root. Removal
runs in the apply module after the installer succeeds, so a failed install
leaves leftovers in place; `install.sh` stays unchanged.

The leftover rule is one common rule for both examples: a path in the union of
parsed declarations of release tags up to the new version, absent from the new
declaration, present in an installed root. Unedited means `git hash-object` of
the installed file equals the blob at that path in some release tag that
declared it. A file stranded before the recorded release (example 1) and one
dropped by the new release fall out of the same rule; no separate recognizer.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Update fetches only the new release commit, so history must be fetched separately | Slice 1 history fetch | `src/install/open-dough-release-resolve.sh:121` `git fetch --quiet --depth 1 <url> <commit>` | Confirmed: no tags or history available |
| A blob-free depth-1 fetch of all `v*` tags from the recorded source yields each release's tree blob ids, and file contents fetch lazily | Slice 1 history fetch and unedited test | `git init -q h; git -C h fetch -q --filter=blob:none --depth 1 https://github.com/terryyin/open-dough 'refs/tags/v*:refs/tags/v*'` then `git -C h rev-parse v0.3.46:src/skills/dough-story-wrap-up/scripts/closure-publication.mjs`, `git -C h show v0.3.40:install.sh` | 0.93 s, 736 KB, 60 tags; blob id `20465417…` equals `git hash-object .claude/skills/dough-story-wrap-up/scripts/closure-publication.mjs`; `install.sh` read lazily |
| The same fetch works against a local fixture path (tests) | Slice 1 and 2 proof | Same fetch with this checkout's path | rc 0, 63 tags; stderr warns "filtering not recognized by server, ignoring" and "promisor remote name cannot begin with '/'" — keep that stderr out of update output |
| This repository's six stranded files are unedited copies of a declaring release | Example 1 | For each file, compare `git show <tag>:src/skills/<path>` with the installed copy across all tags | All six match (last declared: four in v0.3.46, one in v0.3.45, `workspace-publication.mjs` in v0.3.32); none is declared by v0.3.55 |
| Some early tags have no parseable declaration | Slice 1 history union | `read_managed_files_declaration` on each tag's `install.sh` | Fails for v0.1.0 (no array), v0.2.3, v0.2.4 (one-line array). Their files (`dough-update/SKILL.md`, `dough-adr-awareness/SKILL.md`) are still declared now, so an unparsed tag contributes nothing and must not abort the update |
| Ordinary verification ignores leftovers today, so an edited leftover passes silently | Slice 2 refusal | `managed_payload_unchanged` (`open-dough-release-version.sh:44-60`) iterates only the current declaration | Confirmed |
| Force replaces without baseline verification | Slice 2 force removal | `apply_release` force branch (`open-dough-release-apply.sh:167-176`) | Confirmed: removal must be added to this branch too |
| `dough-update` runs `apply` from the fetched new-release snapshot, so the first update to the release that ships this already removes leftovers | Example 1 in this repository | `src/skills/dough-update/SKILL.md:82` `bash <snapshot>/src/install/open-dough-release.sh apply …` | Confirmed |

## Outside-in proof

Run checks through the runner (`tests/README.md`): Bash 5 first on `PATH`.

- New `tests/update-removes-dropped-files.sh`, built on
  `tests/helpers/release-fixture.bash`. Its fixture source has three tags:
  0.1.0 declares two extra files, A and B; 0.1.1 drops A and still declares B;
  0.1.2 drops B. The target is recorded at 0.1.1 and still holds A with 0.1.0
  bytes, which mirrors example 1's stranded files. It also holds B and a
  project-owned `.claude/skills/own-skill/SKILL.md`, plus a project file
  beside a leftover in a skill directory.
- Existing update and install checks
  (`tests/update-*.sh`, `tests/install*.sh`, `tests/*-payload-update.sh`) stay
  green; they share `apply_release` and the fixture helper.

Example 1 in this repository is demonstrated by the fixture until this ships
in a release; the first `dough-update` to that release removes the six files
here, after which this repository's installed copies are updated as usual.

## Slices

### 1. Ordinary update removes unedited leftovers and lists them
Type: Behavior
Status: done
Proof: `bash scripts/test.sh tests/update-removes-dropped-files.sh` (ordinary
case) plus `bash scripts/test.sh tests/update-*.sh tests/install*.sh
tests/*-payload-update.sh`

Behavior: target recorded at 0.1.1 holding unedited leftovers A (stranded,
0.1.0 bytes) and B (declared by 0.1.1) in both `.agents/skills/` and
`.claude/skills/`, plus project-owned files → ordinary `open-dough-release.sh
apply` → 0.1.2 installed; A and B absent from both roots; the output lists
each removed file per root; directories left empty are gone; the project
skill, the project file beside a leftover, and `dough-update/SOURCE`/`VERSION`
are unchanged.

Includes the release-history module (tag selection up to the new version,
blob-free fetch into the apply work root with fetch stderr kept out of update
output, unparsed tags contributing nothing) and removal after a successful
install in the ordinary path. Check whether `dough-update/SKILL.md` already
relays the apply output as the reported result; change its wording only if the
removed-file list would otherwise be dropped.

Accepted proof: `tests/update-removes-dropped-files.sh` (fixture tags 0.0.9
with an unreadable declaration, 0.1.0, 0.1.1, 0.1.2; `removed_listing` per
platform equals A and B, empty directory gone, directory with a project file
kept, payload bytes and VERSION at 0.1.2, `assert_project_files_kept`, no fetch
noise) and the update/install/payload-update set, all green. Leftover logic
lives in `src/install/open-dough-release-leftovers.sh`
(`find_release_leftovers` writes `<work root>/leftovers-<platform>` with
`unedited|edited<TAB>path` before writes; `remove_found_leftovers` runs after
the installer). `dough-update/SKILL.md` steps 5d and 7 now permit and report
the removal.

### 2. Edited leftovers stop an ordinary update; force removes them
Type: Behavior
Status: planned
Proof: `bash scripts/test.sh tests/update-removes-dropped-files.sh` (edited
case)

Behavior: the same target with leftover B edited → ordinary apply → it names B,
refuses before writes, and points to the explicit force replacement; a path
snapshot of the target is unchanged. Rerunning with `--force` → 0.1.2 installed
and A and B removed from both roots and listed. Project-owned files are
unchanged in both runs.

## Current decisions

- History comes from release tags at the recorded source, compared by blob id;
  no installed manifest or checksum record (ADR 0004 decision 5).
- An unparsed historical declaration contributes no paths.
- Removal happens only after the installer succeeds.

## Learnings

- A failed release-history fetch refuses the ordinary update before writes,
  like the existing baseline-fetch failure (ADR 0004 decision 5).
- Reading each release's `install.sh` lazily from a blob-free GitHub fetch cost
  about 23 s for 60 tags; one batched blob fetch avoids that.
- Release-tag listing is shared through `list_release_tags`
  (`open-dough-release-resolve.sh`).
- Against the real source, this repository's installed roots report exactly the
  six stranded files as unedited leftovers (example 1).
