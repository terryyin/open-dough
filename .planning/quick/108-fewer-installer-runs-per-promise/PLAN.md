# Prove each installation promise with fewer installer runs

## Source

**Identity:** SEED-037#fewer-installer-runs-per-promise

[Refined story](../../seeds/SEED-037-quiet-stable-fast-tests.md#fewer-installer-runs-per-promise),
refined and planned on 2026-09-26 from trunk `b34db51`, and refined again the
same day when the maintainer restored the whole duplicated payload-update
family to scope. The maintainer kept its queue position behind the Taken
story 2; preparation grants no Take or execution.

## Goal and scope

Each shared installation and update protection is proved once by its owner,
a declaration-level check proves which files those owners cover, and each of
the four payload-update checks proves only what its own payload adds, built on
one shared upgrade fixture. Agents publishing to trunk and developers running
the tests get the same confidence from about two thirds fewer installer and
updater runs in those checks, and new payload files no longer invite another
copy of a protection proof.

### Included

- A links-only declaration check that runs no installer, replacing the three
  installed link-walking loops.
- The one unowned protection case, repeat install refusing a removed managed
  file without writes and `--force` restoring it, added to `tests/install.sh`;
  then removal of every payload-update copy of the edited or removed file
  protection.
- The story check's per-platform collision case as the single owner of
  "ordinary update refuses an unrelated file at a newly managed path"; the
  execution and retrospective copies removed.
- One shared helper that builds the older and newer releases for every
  payload-update check.

### Material exclusions

- Requiring every file under a skill source directory to be declared; the
  check is links-only.
- Fewer per-platform runs, and cheaper individual installer runs (story 2).
- Installer and update checks outside the payload-update family, except where
  they are an owner above.
- Any change to installer or updater behavior; retries, skips, or loosened
  assertions.

### Assumptions

- The installer protects every declared path through the same walk of
  `managed_files` (`src/install/open-dough-install-payload.sh`), so a protection
  proved for one declared file holds for any other, including files under
  `references/` and `scripts/`.
- `assert_payload` (`tests/helpers/release-fixture.bash`) compares every
  declared file byte for byte with its source in each installed root, so a
  link that resolves between declared source files resolves after installation.
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
- **Collision owner (PFE).** `tests/install-refuses-unsafe-topology.sh` covers
  fresh-install unsafe layouts (symlinked roots, a file where a skill directory
  belongs), not an ordinary update meeting a project file at a path the new
  release starts managing. The story check's per-platform case is the most
  complete existing observation of that update case, so it stays the owner.
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
- **Upgrade fixture (PFE).** Each of the four checks repeats the same sequence
  with `release-fixture.bash` primitives: `write_candidate_payload` for the
  older label, a `sed` over `install.sh` and
  `src/install/open-dough-release-version.sh` deleting the withheld paths,
  removal of those sources, `commit_all`, `tag_release` 0.1.1,
  `checkout_tagged_release` into `older`, then `write_candidate_payload`,
  `commit_all`, and `tag_release` 0.1.2 for the newer label. The helper lives
  beside those primitives in `tests/helpers/release-fixture.bash` and takes
  the two labels and the withheld paths; the retrospective check withholds a
  declaration line while keeping its source file, so the helper separates
  "withhold the declaration" from "remove the source".
- **Script declaration keeps its owner.** The backlog matrix also touched three
  `.mjs` scripts, which a links-only check does not see. Their declaration
  stays proved by `product-backlog-payload-update.sh`'s offline run of the
  installed backlog and story-state scripts, which fails on an undeclared
  import; that runtime proof is not removed.
- ADR 0004's single payload declaration is the rule the declaration check
  follows, and the architectural North Star's one-owner cohesion is the reason
  each protection keeps exactly one owner; no ADR or North Star change is
  needed.

## Outside-in proof

**Baseline.** The start revision is this plan's Take revision. Installer and
updater runs are counted from each check's code, because `OPEN_DOUGH_TRACE`
records only successful writes. At `b87f639`: `story-payload-update.sh` 33
(3 platforms × 3, plus 24), `product-backlog-payload-update.sh` 30 (3 × 2,
plus 24), `execution-payload-update.sh` 16 (3 older installs, collision
refusal, upgrade, 8 in the edit loop, the manual-registration upgrade, and 2
conflict refusals), and `retrospective-reference-payload.sh` 18 (3 × fresh
install, older install, collision refusal, upgrade, and 2 missing-reference
refusals): 97 in all. Recount at the Take revision before editing. Job-seconds
are compared relatively: three paired runs of the four checks alternating the
start revision and the candidate under the same load, comparing medians.

| Key example (seed) | Slice | Observation |
| --- | --- | --- |
| 1. Edited declared file | 2 | Existing owners named in the removal commit pass unchanged |
| 2. Removed declared file | 2 | `tests/install.sh`: repeat install refuses a removed managed file, snapshot unchanged; `--force` restores |
| 3. New file forgotten in the declaration | 1 | The declaration check fails on a copy with an undeclared link target and names the linking file and target |
| 4. New file declared | 1 | The same copy with the target declared passes; trunk passes |
| 5. Unrelated file at a new managed path | 3 | `story-payload-update.sh` still refuses it on all three platforms; the execution and retrospective copies are gone |
| 6. Payload-specific promise stays | 2, 3, 4 | Each payload-update check passes with its own payload promises unchanged |
| 7. New payload-update check | 4 | All four checks build their releases through the shared helper; none repeats the sequence |
| 8. Run count | 4 | Counts 33 → 9, 30 → 6, 16 → 7, 18 → 9 (97 → 31); paired job-seconds recorded in Learnings |

## Current decisions

- Links-only declaration check; no requirement that every source file be
  declared (maintainer, 2026-09-26).
- Whole duplicated payload-update family in scope, no duplicate left
  (maintainer, 2026-09-26, replacing the earlier two-matrices-only decision).
- The new owner case goes in `tests/install.sh`, next to the existing
  repeat-install edited-file case.
- The story check's per-platform case owns update-time collision refusal.

## Ordered slices

### 1. A link to an undeclared file fails without running the installer

Type: Behavior
Status: done
Proof:
- New `tests/payload-declaration-links.sh` passes on the repository.
- The same check, pointed at a temporary copy of `install.sh` and
  `src/skills/` in which one declared Markdown file links to an undeclared
  file, fails and names the linking file and the undeclared target; after the
  target is added to that copy's `managed_files`, it passes.
- A line with two links, the first undeclared, still fails (guards the
  last-link-only extraction).
- The check invokes neither `install.sh` nor the updater.
- The installed link-walking loops in `story-payload-update.sh`,
  `execution-payload-update.sh` (`assert_installed_contract_links`), and
  `retrospective-reference-payload.sh` (the link part of
  `assert_reference_links`; its `cmp` stays) are removed, and all three checks
  pass.

Behavior: a declared managed file links to a file the payload does not
declare → the declaration check fails, naming both, with no installer run; a
declared target passes; and no payload-update check walks installed links any
more.

Accepted proof: `/opt/homebrew/bin/bash tests/payload-declaration-links.sh`
(`check_declared_links` on the repository; `expect_undeclared` requires the
exact `FAIL: declared dough-update/SKILL.md links to undeclared
references/forgotten.md` and, for the two-link line, `references/other.md`;
the copy's `install.sh` starts with an exit-1 tripwire), plus
`story-payload-update.sh`, `execution-payload-update.sh`, and
`retrospective-reference-payload.sh` passing without their link loops
(`assert_reference_links` is now `assert_reference_delivered`, keeping `cmp`).

### 2. One owner for an edited or removed declared file

Type: Behavior
Status: done
Proof:
- Before editing, confirm the start-revision counts above.
- `tests/install.sh`: after an installation, removing a managed file (for
  example a `references/` file of an installed skill) makes repeat install
  fail with the `edited, partial, or unverifiable` message and `--force`
  guidance, `snapshot_path_state` unchanged and the file still absent; `--force`
  then restores it.
- Remove the Cursor-only matrices from `story-payload-update.sh` and
  `product-backlog-payload-update.sh` (updating the backlog check's header
  comment), the edit loop from `execution-payload-update.sh`, and the
  per-platform missing-reference refusals from
  `retrospective-reference-payload.sh`. The commit message names each removed
  promise's owner: ordinary-update refusal → `update-refuses-unverifiable.sh`;
  repeat-install refusal → `install.sh`; force restore →
  `update-force-restores-latest.sh`; file coverage →
  `payload-declaration-links.sh`; backlog script declaration → the backlog
  check's offline runtime proof.
- The four payload-update checks and the owners pass.

Behavior: a developer edits or removes a declared file → ordinary update and
repeat install refuse without writes and `--force` restores, each proved by
one named owner; no payload-update check re-proves it.

Accepted proof: start-revision counts confirmed at `c7112a5` (33, 30, 16, 18;
97). `/opt/homebrew/bin/bash tests/install.sh` removes
`dough-story-refinement/references/planning.md` and, through
`assert_repeat_install_refused`, requires the refusal message and `--force`
guidance, an unchanged `snapshot_path_state`, and the file still absent; then
`--force` restores it byte for byte (mutants failed as expected). The owners
(`update-refuses-unverifiable.sh`, `update-force-restores-latest.sh`,
`payload-declaration-links.sh`) and the four payload-update checks pass.
Counts after this slice: 9, 6, 8, 12 (35).

### 3. One owner for an unrelated file at a newly managed path

Type: Behavior
Status: done
Proof:
- `story-payload-update.sh` keeps its per-platform case: an unrelated local
  file at a newly managed reference path makes ordinary update fail with the
  snapshot unchanged, and the update succeeds once it is removed.
- The collision cases in `execution-payload-update.sh` (`ci-mailbox.mjs`) and
  `retrospective-reference-payload.sh` (per platform) are removed, and the
  commit names the story check as the owner.
- Both edited checks pass with their upgrade and payload promises unchanged.

Behavior: a project already has its own file where a new release starts
managing one → ordinary update refuses without writes on each platform, proved
only by the story check.

Accepted proof: `story-payload-update.sh`'s per-platform loop writes local
guidance at `dough-story-refinement/references/planning.md`, requires
`apply` to fail with `snapshot_path_state` unchanged, and succeeds after
removal. `execution-payload-update.sh` and `retrospective-reference-payload.sh`
pass without their collision cases; a mutation of the updater's absent-path
check fails the story check, and a mutation of the undeclared-history clause
still fails the retrospective upgrade. Counts: 9, 6, 7, 9 (31).

### 4. Every payload-update check builds its releases from one fixture helper

Type: Behavior
Status: planned
Proof:
- A helper in `tests/helpers/release-fixture.bash` builds the older and newer
  tagged releases from the two payload labels, the declaration lines to
  withhold, and the sources to remove, leaving `older` checked out as today.
- `story-payload-update.sh`, `product-backlog-payload-update.sh`,
  `execution-payload-update.sh`, and `retrospective-reference-payload.sh` use
  it; none keeps its own `sed` over `install.sh` and
  `open-dough-release-version.sh` or its own tag sequence, and all four pass
  unchanged in what they assert.
- Record the after counts (9, 6, 7, 9; 31 in all against 97) and the paired
  job-seconds of the four checks in Learnings; the complete local suite passes
  silently.

Behavior: a test author adds a payload-update check → one helper call builds
its older and newer releases, and the check contains only its payload's own
promises; the four checks together run about two thirds fewer installer and
updater runs.

## Promise ownership

- Declaration check, failure naming, no installer run, link loops removed:
  slice 1.
- Removed-file repeat-install refusal and restore; edited or removed file
  copies removed with owners named: slice 2.
- Update-time collision refusal owned once: slice 3.
- Shared upgrade fixture, run counts, paired job-seconds, silent suite:
  slice 4.
- Payload-specific promises of each check kept: slices 2–4, each keeping its
  edited checks green.
- Deferred promises have no slice.

## Preparation review

- Four slices, each one proof loop and one owned promise; slice 1 lands first
  so the declaration owner exists before slice 2 removes the protection copies,
  and slice 4 runs last so the helper is extracted from the already-reduced
  checks and the final counts are measured once.
- A trunk probe of the links-only rule found 450 relative links across 164
  declared files and no undeclared target, so slice 1 starts green.
- Slice 4's two irregular callers need no special case: the retrospective
  check withholds a declaration line and removes no source, and the backlog
  check removes a directory and a single file, both of which a list of
  declaration patterns plus a list of source paths (`rm -rf`) express.

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
- **Scope restored.** The first plan removed only the two 24-run matrices and
  deferred the execution edit loop, the retrospective refusals, the duplicated
  collision cases, the three installed link loops, and the shared fixture. The
  maintainer restored them on 2026-09-26: the story includes what its goal
  needs and leaves no duplicate. The run target moved from 48 removed runs in
  two checks to 97 → 31 across four.
- **Declaration reader location.** `read_managed_files_declaration` lives in
  `src/install/open-dough-release-version.sh`; `public-payload-fixture.bash`
  only calls it. The declaration check sources the former.
- **Link count.** 53 of the 164 declared files are Markdown, with 394 relative
  links after skipping anchors and schemes; none is undeclared. A mutation back
  to last-link-only extraction fails only the two-link case, which is what
  guards that defect.
- **Slice 1 CI repair.** CI run 36215060849 failed on `c7112a5`:
  `tests/story-payload-assertions.sh` injected a missing story link and
  expected `story-payload-update.sh`'s removed link loop to report it. The
  test now drives `payload-declaration-links.sh` through `scripts/test.sh`
  and is renamed `tests/payload-declaration-links-suite-failure.sh`. Removing
  an assertion needs a search for tests that mutate against it.
