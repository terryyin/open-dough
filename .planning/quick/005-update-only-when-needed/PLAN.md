# Keep a recorded Open Dough installation current only when needed

Status: unfinished. Shared update behavior is implemented, with Codex and
Claude Code equal-version evidence recorded. Retrospective corrections R1,
R1b, R2, R3, and R4 plus remaining native update decisions are planned below.
Fresh installation, unversioned migration, release publication, and released
self-use have moved to their own story plans.

Source: [SEED-001, Story 5b](../../seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed).
Fresh installation: [Story 5a](../008-install-latest-release/PLAN.md).
Unversioned installations: [Story 5c](../009-establish-unversioned-installation/PLAN.md).
Release and self-use: [Story 5d](../010-publish-version-aware-updater/PLAN.md)
and [Story 5e](../011-adopt-version-aware-updater/PLAN.md).
Following outcome: [Story 6](../006-show-update-changelog/PLAN.md).

## Goal and scope

As a developer whose selected tool has a valid recorded Open Dough version, I
can invoke `dough-update` against a supplied repository and receive one truthful
decision: advance an older installation directly to latest, leave an equal
installation completely unwritten, or preserve a newer installation without a
downgrade. The output identifies the source, release, selected tool/path, prior
version, and outcome.

Use the highest numeric release tag from the supplied URL and one pinned commit
for validation and application. Validation, comparison, fetch, or replacement
failure must not claim success or advance the record. The operation must execute
only release code that the agent has pinned and inspected, and it must clean up
temporary release work on success or failure.

Include malformed-record and requested-version refusal, truthful partial-copy
or verification failure, selected-tool coexistence, and native behavior in
Codex, Cursor, and Claude Code. Manual reading of release notes is sufficient.

Exclude fresh installation, missing records, the genuine legacy transition,
release publication, Open Dough self-adoption, automatic changelog presentation,
prereleases, rollback, automatic downgrade, source persistence, global setup,
cross-tool synchronization, and local-edit merging or backup. Those are sibling
stories or later work.

## Delivered implementation and evidence

Execution commit `178f1b09461f1dda40404fe4eb01443e7a0e7e35`
implemented the shared release helper, installed records, comparison decisions,
failure reporting, docs, and focused shell tests. Commit
`c26c503e42928e8927041e798cf7f6186d8da784` recorded the native evidence below.
Planning-only commit `344f2b5` created the earlier provisional plan and is
provenance, not product code.

| Original leaf | Status | Retained proof |
| --- | --- | --- |
| 8. Equal version performs no writes | done | `tests/update-when-needed.sh`; invocation trace plus destination write guard |
| 9. Older advances directly to latest | done | `tests/update-when-needed.sh`; one installer invocation and verified latest record |
| 11. Newer is preserved | done | `tests/update-when-needed.sh`; no installer call or destination writes |
| 12. Malformed record is refused | done | `tests/update-when-needed.sh`; no repair or installer call |
| 13. Requested version is refused | done | `tests/update-when-needed.sh`; latest-only interface remains explicit |
| 14–15. Replacement and verification failures stay truthful | done | `tests/update-when-needed.sh`; old record retained and recovery explained |
| 20. Codex equal-version native invocation | done | Codex 0.153.4 session `01a0756a-6ec7-7d92-8f1a-3938020d2f33` |
| 21. Cursor equal-version native invocation | partial | CLI/write-guard proof exists; a fresh Cursor fixture session is still missing |
| 22. Claude Code equal-version native invocation | done | Claude Code 2.1.263 session `d96a0228-7b0d-48e0-8dd7-ee998e0fc347` |

Focused retrospective checks reran `bash tests/install-latest-release.sh` and
`bash tests/update-when-needed.sh`; both passed on 2026-09-06. Separate probes
showed that `0.08.0` is misordered against `0.9.0` and that a failed `apply`
leaves its `mktemp` work root behind. Existing passing evidence does not cover
those cases or the pinned-code execution boundary.

## Outside-in proof ownership

| Promise | Owning leaves |
| --- | --- |
| Only inspected code from one pinned latest release can execute | R1, R1b, R2; native rows 20–25 and 29–31 rechecked when invalidated |
| Failed setup removes operation-owned temporary work | R3 |
| Numeric comparison matches the accepted version domain | R4 |
| Equal means no installer invocation or installed-file writes | delivered 8; native 20–22 |
| Older advances once to latest; newer never downgrades | delivered 9 and 11; native 23–25 and 29–31 |
| Malformed/requested inputs and application failures stay truthful | delivered 12–15; focused regression after R1–R4 |
| Native discovery, selected host/path, and coexistence | 20–25 and 29–31, separately for all three tools |

## Ordered remaining slices

Completed slice identifiers above remain unchanged. Corrective slices are
inserted after the delivered implementation and before unfinished native proof.

### R1. Share platform destinations and requested-version refusal
Type: Structure
Status: done
Internal change: Move the Codex/Cursor/Claude write destinations and the
latest-only requested-version refusal into one sourced module used by
`install.sh` and `src/install/open-dough-release.sh`. Keep flags, messages, and
write paths unchanged.
Enables: R1b, which can split the helper without leaving a second copy of those
rules in the installer.
Proof: `bash tests/install.sh`, `bash tests/install-omits-internal.sh`,
`bash tests/install-latest-release.sh`, and `bash tests/update-when-needed.sh`
stayed green; both production callers source `src/install/open-dough-platform.sh`.

### R1b. Split release resolution from update application
Type: Structure
Status: done
Internal change: Split the remaining helper so version validation, numeric
compare, `resolve-url`, `fetch-release`, and `pin-latest` live in sourced
module(s), while `apply` and the public command dispatcher stay in
`src/install/open-dough-release.sh`. Keep the existing command names and flags.
Every helper module is at most 250 lines.
Enables: R2, which can verify an already-pinned checkout with the same
resolver instead of a second algorithm.
Proof: The same four focused tests still passed through the public commands;
`wc -l` on each `src/install/open-dough-*.sh` module is ≤250.

### R2. Execute only the inspected pinned release
Type: Behavior
Status: done
Behavior: A developer invokes `dough-update` with a supplied URL → the agent
uses only Git to list tags and fetch the peeled commit of the highest numeric
`vMAJOR.MINOR.PATCH` tag into a fresh work directory (no default-branch clone
and no working-tree helper) → inspects that snapshot's helper, installer, and
skill → runs
`bash <snapshot>/src/install/open-dough-release.sh apply --url <url>
--target <project> --platform <tool> --checkout <snapshot>` → apply resolves
latest, requires `HEAD` to equal that commit, and does not fetch or check out
replacement files after inspection → the recorded update decision runs from
that same commit.
Proof: `bash tests/pin-and-inspect.sh` — default-branch helper/installer write
a leak file; the git bootstrap of tagged latest performs the install with no
leak; `apply --checkout` on an unpinned clone refuses and does not replace
inspected files. README install's clone-then-`pin-latest` flow stays Story 5a.

### R3. Remove temporary release work after failed setup
Type: Behavior
Status: planned
Behavior: Release resolution or fetch fails after `apply` creates its temporary
work root → operation exits truthfully → all operation-owned temporary paths are
removed and the target remains untouched.
Proof: Run `apply` with a dedicated `TMPDIR` against fetch and invalid-release
fixtures; assert nonzero output, no target writes, and no child paths remaining.

### R4. Compare every accepted numeric version correctly
Type: Behavior
Status: planned
Behavior: Two versions accepted by the release contract contain leading-zero or
large numeric components → compare or resolve latest → numeric ordering is
correct without shell-arithmetic diagnostics or overflow.
Proof: Focused comparison and tag-selection examples include `0.08.0` versus
`0.9.0` and components beyond signed 64-bit range. Compare the numeric strings
accepted by ADR 0003 without machine-integer conversion.

### 21. Confirm current-version behavior in Cursor
Type: Behavior
Status: partial
Behavior: Cursor records latest → a fresh Cursor `/dough-update` invocation →
reports current with no installer call or selected-file writes.
Proof: Finish the existing fixture journey in a fresh Cursor window with all
three integrations present; record tool version, discovery path, invocation,
tag/commit, trace, write guard, and preserved sentinels.

### 23. Advance Codex directly to latest
Type: Behavior
Status: planned
Behavior: Codex records an older release → native `$dough-update` → selected
Codex installation advances once to latest and other copies remain unchanged.
Proof: One installer invocation, latest bytes/record, source/tag/commit output,
fresh-session instruction, and before/after coexistence evidence.

### 24. Advance Cursor directly to latest
Type: Behavior
Status: planned
Behavior: Cursor records an older release → native `/dough-update` → selected
Cursor installation advances once to latest.
Proof: Independent Cursor observation equivalent to 23.

### 25. Advance Claude Code directly to latest
Type: Behavior
Status: planned
Behavior: Claude Code records an older release → native `/dough-update` →
selected Claude installation advances once to latest.
Proof: Independent Claude Code observation equivalent to 23.

### 29. Preserve a newer Codex installation
Type: Behavior
Status: planned
Behavior: Codex records a version newer than source latest → native update → no
downgrade, installer call, or selected-file write.
Proof: Native refusal output plus invocation/write observation and coexistence.

### 30. Preserve a newer Cursor installation
Type: Behavior
Status: planned
Behavior: Cursor records a version newer than source latest → native update →
no downgrade or selected-file write.
Proof: Independent Cursor observation equivalent to 29.

### 31. Preserve a newer Claude Code installation
Type: Behavior
Status: planned
Behavior: Claude Code records a version newer than source latest → native
update → no downgrade or selected-file write.
Proof: Independent Claude Code observation equivalent to 29.

## Readiness and learning

R1–R2 now have one execution path: share destinations/refusal, split
resolve from apply, then Git-bootstrap the latest tag and refuse
post-inspection checkout replacement. R3–R4 and native leaves each have one
proof loop. After R2, equal-version native rows 20–22 are invalidated by the
skill bootstrap change; rerun only proof whose covered seam moved, including
the platform-specific native rows required by the repository acceptance guard.

Refinement learning: `apply --checkout` currently calls `pin-latest`, which
replaces the inspected tree. R2 must verify `HEAD` against `resolve-url` and
leave the inspected files in place. Default-branch `git clone` plus helper
execution is the leak to forbid in the skill, not in Story 5a's README install
snippet.

Retrospective learning from `178f1b0` plus `c26c503`: combining fresh install,
recorded update, unversioned migration, release publication, and self-use hid a
security boundary and left a 519-line helper. Those outcomes now have separate
story homes; shared implementation evidence remains cited rather than copied.
