# Prove each installation promise with fewer installer runs

## Source

**Identity:** SEED-037#fewer-installer-runs-per-promise

[Refined story](../../seeds/SEED-037-quiet-stable-fast-tests.md#fewer-installer-runs-per-promise),
refined and planned on 2026-09-26 from trunk `b34db51`. The maintainer kept
its queue position behind the Taken story 2; preparation grants no Take or
execution.

## Goal and scope

The installation and update protection of a declared file is proved once by
its owners and a declaration-level check, instead of by the two identical
24-run Cursor-only matrices in `story-payload-update.sh` and
`product-backlog-payload-update.sh`. Agents publishing to trunk and developers
running the tests get the same confidence from less test work, and new payload
files no longer invite another copy of the matrix.

### Included

- A links-only declaration check that runs no installer: every relative
  Markdown link in a declared managed file resolves to a declared managed file.
- The one unowned protection case, repeat install refusing a removed managed
  file without writes and `--force` restoring it, added to `tests/install.sh`.
- Removal of both matrices, with each removed promise naming its owner.

### Material exclusions

- The execution check's edit loop, the retrospective check's missing-reference
  refusals, per-platform collision refusals, the three installed link-walking
  loops, and a shared helper for the payload-update checks' remaining common
  assertions (deferred in the story).
- Requiring every file under a skill source directory to be declared; the
  check is links-only.
- Fewer per-platform runs, and cheaper individual installer runs (story 2).
- Any change to installer or updater behavior; retries, skips, or loosened
  assertions.

### Assumptions

- The installer protects every declared path through the same walk of
  `managed_files` (`src/install/open-dough-install-payload.sh`), so a protection
  proved for one declared file holds for any other, including files under
  `references/` and `scripts/`.
- `scripts/test.sh` discovers any new `tests/*.sh` outside `tests/support/`,
  and CI's ShellCheck lint covers it.

## Context and architecture

- **Existing owners (PFE).** `tests/update-refuses-unverifiable.sh` proves an
  ordinary update refuses an edited (`dough-update/SKILL.md`) and a missing
  (`dough-adr-awareness/SKILL.md`) managed file with the installation
  unchanged. `tests/update-force-restores-latest.sh` proves `--force` restores
  an edited and an incomplete installation. `tests/install.sh` proves repeat
  install refuses an edited managed file with the message
  `existing managed installation is edited, partial, or unverifiable` and
  `--force` restores. No check proves repeat install refuses a removed file.
  Reuse, and extend `tests/install.sh` only.
- **Declaration source (PFE).** `read_managed_files_declaration` in
  `tests/helpers/public-payload-fixture.bash` already reads `install.sh`'s
  `managed_files` for tests; the declaration check reuses it rather than
  parsing `install.sh` again. `snapshot_path_state`
  (`tests/helpers/path-state-snapshot.bash`) supplies the "without writes"
  observation.
- **Link extraction.** The existing installed link loops use
  `sed -nE 's/.*\]\(([^)]+)\).*/\1/p'`, which keeps only the last link on a
  line. The new check extracts every link on a line (for example
  `grep -oE '\]\([^) ]+\)'`), strips the anchor, skips anchor-only and
  `scheme://` links, and normalizes the path relative to the linking file.
- **Script declaration keeps its owner.** The backlog matrix also touched three
  `.mjs` scripts, which a links-only check does not see. Their declaration
  stays proved by `product-backlog-payload-update.sh`'s offline run of the
  installed backlog and story-state scripts, which fails on an undeclared
  import; that runtime proof is not removed.
- ADR 0004's single payload declaration is the rule the declaration check
  follows; no ADR or North Star change is needed.

## Outside-in proof

**Baseline.** The start revision is this plan's Take revision. Installer and
updater runs are counted from each check's code, because `OPEN_DOUGH_TRACE`
records only successful writes: `story-payload-update.sh` 33 (3 platforms × 3,
plus 24) and `product-backlog-payload-update.sh` 30 (3 × 2, plus 24). Job
seconds are compared relatively: three paired runs of the two checks
alternating the start revision and the candidate under the same load,
comparing medians.

| Key example (seed) | Slice | Observation |
| --- | --- | --- |
| 1. Edited declared file | 2 | Existing owners named in the removal commit pass unchanged |
| 2. Removed declared file | 2 | `tests/install.sh`: repeat install refuses a removed managed file, snapshot unchanged; `--force` restores |
| 3. New file forgotten in the declaration | 1 | The declaration check fails on a copy with an undeclared link target and names the linking file and target |
| 4. New file declared | 1 | The same copy with the target declared passes; trunk passes |
| 5. Upgrade path stays | 2 | `story-payload-update.sh` and `product-backlog-payload-update.sh` pass on all three platforms, including collision refusal and the offline backlog runtime proof |
| 6. Run count | 2 | Counts 33 → 9 and 30 → 6; paired job-seconds recorded in Learnings |

## Current decisions

- Links-only declaration check; no requirement that every source file be
  declared (maintainer, 2026-09-26).
- Minimal scope: only the two matrices are removed (maintainer, 2026-09-26).
- The new owner case goes in `tests/install.sh`, next to the existing
  repeat-install edited-file case.

## Ordered slices

### 1. A link to an undeclared file fails without running the installer

Type: Behavior
Status: planned
Proof:
- New `tests/payload-declaration-links.sh` passes on the repository.
- The same check, pointed at a temporary copy of `install.sh` and
  `src/skills/` in which one declared Markdown file links to an undeclared
  file, fails and names the linking file and the undeclared target; after the
  target is added to that copy's `managed_files`, it passes.
- A line with two links, the first undeclared, still fails (guards the
  last-link-only extraction).
- The check invokes neither `install.sh` nor the updater.

Behavior: a declared managed file links to a file the payload does not
declare → the declaration check fails, naming both, with no installer run; a
declared target passes.

### 2. One owner per protection replaces the two matrices

Type: Behavior
Status: planned
Proof:
- Before editing, confirm the start-revision counts above.
- `tests/install.sh`: after an installation, removing a managed file (for
  example a `references/` file of an installed skill) makes repeat install
  fail with the `edited, partial, or unverifiable` message and `--force`
  guidance, `snapshot_path_state` unchanged and the file still absent; `--force`
  then restores it.
- Remove the Cursor-only matrices from `story-payload-update.sh` and
  `product-backlog-payload-update.sh`, and update the backlog check's header
  comment. The commit message names each removed promise's owner:
  ordinary-update refusal → `update-refuses-unverifiable.sh`; repeat-install
  refusal → `install.sh`; force restore → `update-force-restores-latest.sh`;
  file coverage → `payload-declaration-links.sh`; backlog script declaration →
  the backlog check's offline runtime proof.
- Both payload-update checks and the four owners pass; the complete local
  suite passes silently.
- Record the after counts (9 and 6) and the paired job-seconds of the two
  checks in Learnings.

Behavior: a developer runs the installer and update checks → each shared
protection is proved by one named owner, the two payload-update checks run 48
fewer installer and updater runs, and every upgrade-path promise they own
still passes.

## Promise ownership

- Declaration check, failure naming, no installer run: slice 1.
- Removed-file repeat-install refusal and restore: slice 2.
- Matrices removed, owners named, run counts and paired job-seconds: slice 2.
- Upgrade path and backlog runtime proof kept: slice 2.
- Deferred promises have no slice.

## Preparation review

- Two slices, each one proof loop; slice 1 is independent and lands first so
  the declaration owner exists before slice 2 removes the matrices.
- A trunk probe of the links-only rule found 450 relative links across 164
  declared files and no undeclared target, so slice 1 starts green.

## Learnings

- **Seed correction.** The seed first said removed-file refusal had no owner;
  PFE found ordinary-update refusal and force restore of a missing file
  already owned, leaving only repeat-install refusal of a removed file.
- **Removed-file refusal probe.** On `b34db51`, a Cursor installation with
  `dough-story-refinement/references/planning.md` removed made repeat
  `install.sh` exit 1 with `claude: existing managed installation is edited,
  partial, or unverifiable. Use --force to explicitly reinstall.`, leaving the
  file absent; `--force` exited 0 and restored it. Slice 2's owner case
  observes existing behavior and needs no installer change.
