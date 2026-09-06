# Keep a recorded Open Dough installation current only when needed

Status: unfinished. Shared update behavior is implemented, with Codex, Cursor,
and Claude Code older-to-latest and equal-version evidence recorded.
Retrospective corrections R1, R1b, R2, R3, and R4 plus remaining native
newer-preserved decisions are planned below. Fresh installation, unversioned
migration, release publication, and released self-use have moved to their own
story plans.

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
| 21. Cursor equal-version native invocation | done | Cursor 3.19.13 / `2026.09.02-c22c1a3` session `3f1369da-b786-4dfb-9d1c-8006739b23aa`; fixture with Codex+Cursor+Claude at `0.1.10`; git-bootstrap `v0.1.10` `657f803f936afb39e5a33d57b3f6a8de881c2e8d`; `apply-skip-equal`; write guard and sentinels |
| 22. Claude Code equal-version native invocation | done | Claude Code 2.1.263 session `d96a0228-7b0d-48e0-8dd7-ee998e0fc347` |
| 23. Codex older-version native invocation | done | Codex CLI 0.144.1 session `01a075b0-54b3-7742-bae8-dc67be70f8b4`; fixture with Codex+Cursor+Claude at `0.1.2`; git-bootstrap `v0.1.10` `f59a15fd34a55a7c0a18284f755284b7187220f8`; one `install` trace; only Codex `SKILL.md`/`VERSION` changed |
| 24. Cursor older-version native invocation | done | Cursor 3.19.13 / `dd066f332fcea7382764400fde902f61920648d0` session `5df9a8c4-e88d-4cac-9c64-34a9d81081ef`; fixture with Codex+Cursor+Claude at `0.1.2`; git-bootstrap `v0.1.10` `651357c054702313661886a259e22cbb46b109de`; one `install` trace; only Cursor `SKILL.md`/`VERSION` changed |
| 29. Codex newer-version native invocation | done | Codex CLI 0.144.1 session `01a075c2-cb89-71d3-84f3-a4a651e36a73`; fixture with Codex+Cursor+Claude at `0.2.0`; git-bootstrap `v0.1.10` `a6afbc7590264c7b6a9b28bdd4069b3979494a6f`; `apply-newer` only; all target hashes and timestamps unchanged |

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
Status: done
Behavior: Release resolution or fetch fails after `apply` creates its temporary
work root → operation exits truthfully → all operation-owned temporary paths are
removed and the target remains untouched.
Proof: `bash tests/apply-temp-cleanup.sh` runs `apply` with a dedicated
`TMPDIR` against missing-URL and invalid-highest fixtures; nonzero output, no
target writes, and no child paths remaining.

### R4. Compare every accepted numeric version correctly
Type: Behavior
Status: done
Behavior: Two versions accepted by the release contract contain leading-zero or
large numeric components → compare or resolve latest → numeric ordering is
correct without shell-arithmetic diagnostics or overflow.
Proof: `bash tests/compare-versions.sh` includes `0.08.0` versus `0.9.0`
and components beyond signed 64-bit range; `resolve-url` selects `v0.9.0`.

### 21. Confirm current-version behavior in Cursor
Type: Behavior
Status: done
Behavior: Cursor records latest → a fresh Cursor `/dough-update` invocation →
reports current with no installer call or selected-file writes.
Proof: Cursor 3.19.13 (`2026.09.02-c22c1a3`) session
`3f1369da-b786-4dfb-9d1c-8006739b23aa`. Running host identified as Cursor;
selected `/tmp/open-dough-slice21/target project/.cursor/skills/dough-update`
(Codex and Claude copies present and unused). `git ls-remote --tags` on
`/tmp/open-dough-slice21/fixture.git` selected peeled `v0.1.10`
`657f803f936afb39e5a33d57b3f6a8de881c2e8d`; inspected that snapshot's helper,
installer, and skill; ran `apply --checkout` with `--platform cursor`.
Output: `Installed: 0.1.10` and already current. Trace:
`apply-skip-equal` only, no `install` line. Cursor `SKILL.md`/`VERSION`
mtimes unchanged under a write guard; local skill edit preserved; Codex and
Claude `0.1.10` records and sentinels unchanged.

### 23. Advance Codex directly to latest
Type: Behavior
Status: done
Behavior: Codex records an older release → native `$dough-update` → selected
Codex installation advances once to latest and other copies remain unchanged.
Proof: Codex CLI 0.144.1 session
`01a075b0-54b3-7742-bae8-dc67be70f8b4` ran from
`/tmp/open-dough-slice23-proof.8n3lxr/target project` with exact write access
to its protected Codex skill destination. The running host identified as Codex
and selected `.agents/skills/dough-update`, while Cursor and Claude copies were
also present. Native `$dough-update` listed fixture tags, chose peeled
`v0.1.10` commit `f59a15fd34a55a7c0a18284f755284b7187220f8`, inspected
that detached snapshot's helper, installer, skill, sourced modules, and
changelog, then ran `apply --checkout --platform codex`. Output reported source,
tag, commit, `Installed: 0.1.2`, `Outcome: updated from 0.1.2 to 0.1.10`, and
the fresh-session instruction. `OPEN_DOUGH_TRACE` contains one `apply-upgrade`
and exactly one `install` line. The installed skill matches the tagged bytes and
records `0.1.10`; Git shows only Codex `SKILL.md` and `VERSION` changed. Cursor
and Claude remain at `0.1.2`, and their hashes plus all project sentinels match
the before snapshot. Operation-owned bootstrap directories were removed after
verification; the named fixture remains available with its trace and hashes.

### 24. Advance Cursor directly to latest
Type: Behavior
Status: done
Behavior: Cursor records an older release → native `/dough-update` → selected
Cursor installation advances once to latest.
Proof: Cursor 3.19.13 (`dd066f332fcea7382764400fde902f61920648d0`) session
`5df9a8c4-e88d-4cac-9c64-34a9d81081ef` ran from
`/tmp/open-dough-slice24-proof.kWF5YX/target project` with write access only
to the selected Cursor skill destination. The running host identified as Cursor
and selected `.cursor/skills/dough-update`, while Codex and Claude copies were
also present. Native `/dough-update` listed fixture tags, chose peeled
`v0.1.10` commit `651357c054702313661886a259e22cbb46b109de`, inspected
that detached snapshot's helper, installer, skill, sourced modules, and
changelog, then ran `apply --checkout --platform cursor`. Output reported source,
tag, commit, `Installed: 0.1.2`, `Outcome: updated from 0.1.2 to 0.1.10`, and
the fresh-session instruction. `OPEN_DOUGH_TRACE` contains one `apply-upgrade`
and exactly one `install` line. The installed skill matches the tagged bytes and
records `0.1.10`; Git shows only Cursor `SKILL.md` and `VERSION` changed. Codex
and Claude remain at `0.1.2`, and their hashes plus all project sentinels match
the before snapshot. Operation-owned bootstrap directories were removed after
verification; the named fixture remains available with its trace and hashes.

### 25. Advance Claude Code directly to latest
Type: Behavior
Status: done
Behavior: Claude Code records an older release → native `/dough-update` →
selected Claude installation advances once to latest.
Proof: Claude Code 2.1.263 session `d499afb6-fdee-4b55-a359-ee9599be7c63` ran
`claude -p` from `/tmp/open-dough-slice25-proof.SOsXTX/target project` with
tool access limited to `Bash Edit Write Read` (no permission bypass). The
running host identified as Claude Code and selected
`.claude/skills/dough-update`, while Codex and Cursor copies were also
present. Native `/dough-update <fixture-url>` listed fixture tags, chose
peeled `v0.1.10` commit `ac929f41ff79c9d5284317712f7042fdcb2937d4`, inspected
that detached snapshot's helper, installer, skill, sourced modules, and
changelog, then ran `apply --checkout --platform claude`. Output reported
source, tag, commit, previous version `0.1.2`, and outcome "Updated to
0.1.10. Only `SKILL.md` and `VERSION` under that skill directory were
modified," plus the fresh-session instruction. `OPEN_DOUGH_TRACE` contains
exactly one `apply-upgrade` and one `install` line, both under
`.claude/skills/dough-update`. Before/after `sha256sum` over every installed
`SKILL.md`/`VERSION`/sentinel file shows only the Claude Code `SKILL.md` and
`VERSION` changed; Git status in the target confirms the same two paths.
Codex and Cursor remain at `0.1.2`; `.agents/skills/unrelated`,
`.cursor/skills/other-cursor-skill`, `.claude/skills/other-skill`, and
`keep this file.txt` are byte-identical before and after. No operation-owned
bootstrap directory remained under `/tmp` or `/var/folders` after the run.
Fixture built via `tests/helpers/release-fixture.bash`
(`build_latest_fixture` + old-tag `install.sh` seeding at `0.1.2` for all
three platforms); the named fixture, target, and traces remain available at
`/tmp/open-dough-slice25-proof.SOsXTX`.

### 29. Preserve a newer Codex installation
Type: Behavior
Status: done
Behavior: Codex records a version newer than source latest → native update → no
downgrade, installer call, or selected-file write.
Proof: Codex CLI 0.144.1 session
`01a075c2-cb89-71d3-84f3-a4a651e36a73` ran from
`/tmp/open-dough-slice29-proof.IAU7zl/target project` with Codex, Cursor, and
Claude installations all recording `0.2.0`; the Codex files were read-only and
contained a local-edit sentinel. The native `$dough-update` invocation
identified Codex, selected `.agents/skills/dough-update`, listed fixture tags,
selected peeled `v0.1.10` commit
`a6afbc7590264c7b6a9b28bdd4069b3979494a6f`, and inspected that detached
snapshot's helper, installer, skill, sourced modules, and changelog before
running `apply --checkout --platform codex`. Output reported `Installed:
0.2.0` and `Outcome: installed 0.2.0 is newer than source 0.1.10; no downgrade
or target writes.` `OPEN_DOUGH_TRACE` contains only one `apply-newer` line and
no `install` line. Independent before/after hashes, mtimes, and target Git
status prove no selected, coexistence, sentinel, or unrelated project file
changed; Cursor and Claude remain at `0.2.0`. The session removed its pinned
bootstrap checkout. `bash tests/update-when-needed.sh` and
`bash tests/pin-and-inspect.sh` also passed after the native run; the named
fixture, target, trace, and hashes remain available under
`/tmp/open-dough-slice29-proof.IAU7zl`.

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

R1–R4 are done. Slice 21 rechecked Cursor equal-version after the pin-and-inspect
skill change, slice 23 proves the native Codex older-to-latest journey, slice 24
proves the matching Cursor upgrade, and slice 25 now proves the matching Claude
Code upgrade. Codex and Claude equal-version rows 20 and 22 were not re-run;
slice 29 now proves the Codex newer-version no-downgrade path, while
newer-preserved rows 30–31 remain.

Slice 25 note: the native session ran via `claude -p` with
`--allowedTools "Bash Edit Write Read"` rather than a permission-bypass mode —
the auto-mode classifier blocks nested sessions started with
`--dangerously-skip-permissions`/`bypassPermissions`. The scoped-tools form
still exercises genuine native discovery and produced identical trace/hash
evidence to the bypass-mode runs used for slices 23–24, so it is accepted as
equivalent proof.

Refinement learning: `apply --checkout` currently calls `pin-latest`, which
replaces the inspected tree. R2 must verify `HEAD` against `resolve-url` and
leave the inspected files in place. Default-branch `git clone` plus helper
execution is the leak to forbid in the skill, not in Story 5a's README install
snippet.

Retrospective learning from `178f1b0` plus `c26c503`: combining fresh install,
recorded update, unversioned migration, release publication, and self-use hid a
security boundary and left a 519-line helper. Those outcomes now have separate
story homes; shared implementation evidence remains cited rather than copied.
