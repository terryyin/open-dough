# Derive the install payload from the shipped directory

**Identity:** SEED-423#derive-the-install-payload-from-the-shipped-directory
**Source:** [Derive the install payload from the shipped directory](../../seeds/SEED-423-shrink-the-installed-distribution.md#derive-the-install-payload-from-the-shipped-directory)

## Goal and scope

Maintain one shipped directory, `Distribution/src/skills/`, and install its
complete tagged file set into both native skill roots. A change to the reviewed
directory alone changes the next release's client payload. Refuse detectable
misplaced or unsafe content before it ships. Preserve ordinary update and
explicit force behavior across the transition, including same-tag legacy
declarations, dropped-file ownership, and protection of project-owned files.
Release tagging and client rollout are outside this plan.

## Current decisions

- [ADR 0003, Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  defines directory-based promotion with maintainer review.
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  governs pinned tagged content, baseline refusal, complete replacement, and
  coexistence. [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  supports deterministic installer and updater checks in the two existing
  physical roots. Install output still populates the existing host integrations.
- One inventory model. Paths for a directory-format release come from the
  shipped tree. Derive paths from the source tree for direct installs and
  from Git when scanning partial-clone release history for blob IDs.
  On the pinned update route verify the candidate inventory and bytes
  against the inspected tag before using the checkout. The tag's installer
  identifies the format as data.
  A format indication carries no file names. An unreadable legacy declaration
  retains its existing handling. An invalid directory-format source fails
  verification. Use the legacy reader only for list-format tags, including
  grouped declarations and the earlier source-root layout. Never infer legacy
  membership from source presence or run an old installer to read its list.
- Reuse the existing per-path copy, byte comparison, collision guards, and
  baseline/reconciliation operations in `Distribution/src/install/`. The
  current declaration parser knows membership only for list-format releases.
  The history reader already gets paths and blob IDs with `git ls-tree`;
  extend its selection at that boundary while retaining partial-clone behavior.
  Keep one decision about which files belong to a release per source format.
- [Plan 794](../794-update-from-the-previous-release-without-legacy/PLAN.md)
  also touches historical source layout, update eligibility, and the list
  fragment's location. Use the current names and eligibility at execution.
  This story changes payload membership and does not extend the supported
  upgrade window. Its transition proof uses the immediately previous tag.
- Validation rejects identifiable non-payload artifacts and unsafe entries
  with their paths. Existing fixtures moved out of the shipped tree support a
  check for test-only directories or files. Reject symlinks and entries that
  cannot safely round-trip through path comparisons. Reuse shipped reference
  and dependency checks for local paths they can resolve. Maintainer review
  decides whether an otherwise valid file belongs in the payload.
- Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  The existing release data builder can describe both formats. Run the real
  release and installer entry points with local tagged repositories and inspect
  installed bytes and write state. Keep the Distribution checks at their
  current shell and Node boundaries under
  [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

## Premises observed during preparation

Observations ran in the owned preparation checkout at `76aac85a8` on
2026-11-23 with Node 24.21.0 and Homebrew Bash on macOS AC power.

| Consuming operation | Observation and consequence |
| --- | --- |
| The root installer selects what reaches each native root | Added `Distribution/src/skills/dough-update/payload-preparation-probe.txt` and ran `/opt/homebrew/bin/bash install.sh --target <temporary-project> --source <preparation-checkout> --platform codex`. Both roots installed `dough-update/SKILL.md` but neither installed the new file. The scratch file and target were removed. Slice 7's independent positive assertion must fail with the current selection. |
| Local tagged fixtures can exercise source resolution, legacy comparison, and clean update | `caffeinate -s -i bash scripts/test.sh` with `Distribution/tests/installation/` paths `install-latest-release.sh`, `update-adds-new-payload-skill.sh`, `update-refuses-unverifiable.sh` and `update-skip-verified.sh` passed. These cover numeric tagged selection, a list-era predecessor missing newly managed paths, refusal without writes, and an equal-version no-write outcome. A directory-era tag is new proof owned by slices 3 and 5. |
| History classifies dropped files from the same tag's data | The same runner passed `Distribution/tests/installation/update-removes-dropped-files.sh`. The ordinary, edited and force cases read same-tag declaration fragments, protect adjacent project content, and remove the expected files in both roots. Slice 4 owns the analogous directory-tag case. |
| Current protection and link proofs reach their boundaries | The same runner passed `Distribution/tests/installation/install-omits-internal.sh`, `install-refuses-unsafe-topology.sh` and `payload-declaration-links.sh`. The checker detects undeclared linked targets with a counterexample. Slices 1 and 7 retain that proof purpose using the shipped directory. |
| Real entry points and fixture setup support the transition | The same runner passed `Distribution/tests/installation/` paths `install-public-payload.sh`, `pin-and-inspect.sh`, `update-from-pre-distribution.sh`, `self-installation-baseline.sh`, `dough-update-guidance-payload.sh`, and `retrospective-reference-payload.sh`, plus `Distribution/tests/support/repository-release.test.mjs`. Pinned apply of a clean tag reaches both roots, self-installation reads the tag as data, and legacy fixtures reach the updater boundary. Slice 5 owns the new pinned checkout drift proof. |

## Proof and local gates

Use `bash scripts/test.sh <paths>` with Bash 5 on PATH and run the focused
checks below from the execution checkout. For a long or full run on awake
macOS with AC power, use `caffeinate -s -i`. On battery, start fully awake
with the lid open under `caffeinate -i` and inspect the sleep log after the run.
Follow [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the project's test selectors when changing tests, and the
[maintainer skill-authoring guidance](../../../.agents/skills/author-open-dough-skills/SKILL.md)
when changing skill text.

The [consumer trace](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
searched `managed_files`, `read_managed_files_declaration`,
`open-dough-execution-payload.sh` and `releaseDeclarationFiles`. It reaches the
installer, baseline and history readers, release fixtures, source inspection,
self-installation, installed-entry checks, and the evaluation fixtures that
construct or copy release sources. Trace the actual diff at each slice and run
the reached checks. The broad installation check in slice 7 is justified by the
release data and byte-assertion helpers shared by install and update journeys.
Current implementation guidance follows the cutover. Historical findings,
past fixtures, and already installed copies describe the versions that
produced them.

| Final promise | Owner and observing boundary |
| --- | --- |
| Detectable fixture material, unsafe source entries, and missing local dependencies fail verification | Slice 1 at the release preflight and slice 7 at the current install boundary, with path diagnostics and a valid runtime-file control |
| A tagged shipped file is installed in both roots with the tagged bytes, while Proposed files remain outside both | Slice 5 at pinned `apply` for local checkout drift, and slice 7 at direct install and pinned `apply` for installed membership |
| Older declaration formats continue to verify; equal and altered baselines have their existing outcomes | Slice 2 at the tagged fixture boundary, slice 3 at `compare-payload` and `apply`, and slice 7 at the end-to-end format transition |
| Retired files use tagged membership and byte identity; ordinary refusal, explicit force, and unrelated files retain their outcomes | Slice 4 at ordinary and forced `apply` in both roots and slice 7 on a list-to-directory update |

## Slices

### 1. Refuse invalid contents of the shipped directory
Type: Behavior
Status: done
Estimated active work: 10–14 minutes.

Given an otherwise valid source with a misplaced test fixture or unsafe
entry under `Distribution/src/skills/`, its maintained release preflight
fails with the path. Put this check on the current-source payload check and
have release finalization run it alongside its self-installation baseline
check. Keep historical metadata validation separate. A valid
runtime supporting file and a draft outside the tree remain valid. Preserve
the linked-file check for missed dependencies; switch its membership input
at cutover in slice 7. Keep the current installer list until slice 7.

Proof. Exercise the actual preflight used for release finalization with a
synthetic misplaced fixture, a symlink and a valid control. Verify
`payload-declaration-links.sh` still refuses the missing target it creates.

Delivered: `refuse_invalid_shipped_entries` in
`Distribution/src/install/open-dough-install-payload.sh` is the shipped-directory
check; `scripts/check-release-source.sh` runs it at release finalization and
`Distribution/tests/installation/release-source-preflight.sh` proves it. The
installer does not call it yet; slice 7 wires it into install.

### 2. Make list-era test releases independent of current installer syntax
Type: Structure
Status: done
Estimated active work: 10–14 minutes.

Enable slice 3's mixed-format proof. Isolate historical installer declaration data
in the existing MakeMe release data builder. Its fixture input distinguishes
list-era selection from files omitted from the source tree, so cases can
represent a file present in a tag but withheld from that tag's payload. Keep
the real installer and updater behavior in test runs. Attach historical
declarations to the fixtures that need them, including a genuine grouped
declaration and an inline one. Avoid dependencies on the live fragment
path or the formatting of the current launcher for historical fixtures.

Proof. Run `repository-release.test.mjs`, `payload-declaration-links.sh`,
`retrospective-reference-payload.sh`, and `update-adds-new-payload-skill.sh`.
The history fixtures still distinguish present-on-source from installed, and
the installer and updater see the same selected paths. Recheck fixture
apparatus consumers found on the diff.

Delivered: the release builder in `Distribution/tests/support/releaseTestData.mjs`
writes its own list-era launcher, `declaration: "grouped"` (default) or
`"inline"`, and `declaredPayload(root)` reads any tree with its own reader.
The grouped-versus-inline case in `repository-release.test.mjs` targets only the
builder; retire or narrow it once slice 3's proof uses `inline`.

### 3. Compare the installed baseline using its tag's payload format
Type: Behavior
Status: planned
Estimated active work: 10–14 minutes.

Given the release recorded in an installed root, the read-only comparison
uses that tag's own membership and bytes to distinguish already delivered
files from new incoming paths. Recognize a
directory-format tag from its installer as data. Keep old inline and grouped
declarations readable, including legacy source roots. Preserve absence
checks for paths newly managed by the current release and verification of
both installed roots before any ordinary write. Keep current-source
installation on its list until slice 7.

Proof. Drive `open-dough-release.sh compare-payload` with equal and modified
installed bytes against each tagged format. Include a list-era source file
withheld from the payload and a current managed file whose membership in a
marked predecessor is established by its directory entry alone.
Drive the no-write and collision cases through the maintained `apply` entry
point in `update-skip-verified.sh` and `update-refuses-unverifiable.sh`.

### 4. Reconcile files dropped by releases of either format
Type: Behavior
Status: planned
Estimated active work: 11–15 minutes.

Given a retired managed path present in either native root, read the same-tag
path and blob from the directory tree or historical list. Compare with the
incoming payload inventory. Ordinary update removes only unchanged managed
leftovers and refuses before writes when it finds edited ones. Explicit force
retains its current recovery behavior. Preserve unrelated files alongside
removed content. Reuse history's shallow, blob-filtered fetch and batch
legacy declarations only where they are needed.

Proof. Extend `update-removes-dropped-files.sh` with one earlier
directory-format tag supplying a tracked leftover and a list-era tag
containing a withheld file. Observe removal and refusal/force at the
`apply` boundary in both roots, and preservation of the withheld and
project-owned files.

### 5. Keep local snapshot drift out of a pinned directory release
Type: Behavior
Status: planned
Estimated active work: 9–13 minutes.

Given a pinned directory-format checkout with the expected HEAD, reject
extra files or changed bytes under the shipped directory before ordinary
or forced apply reaches its first target write. Check the tag's tree
against the inspected checkout, including untracked entries, so the
filesystem enumeration can safely serve clean snapshots. Keep direct
working-tree installation available for existing local developer usage.
Use a marked fixture while the production installer still ships its list.

Proof. Extend the pinned `apply --checkout` route in `pin-and-inspect.sh`
with an untracked candidate path and edited managed bytes. Observe refusal
and an unchanged target, then run with the clean tag and observe successful
apply. Keep the current higher-tag refusal.

### 6. Share the current inventory across install, update, and release fixtures
Type: Structure
Status: planned
Estimated active work: 10–14 minutes.

Enable slice 7's single cutover. Route the current installer, candidate
comparison, and dropped-file selection through the inventory interface
from slices 3 and 4. The production current format stays list-based here.
Use the format-neutral inventory in maintained fixture setup and remove
current-source copies or assumptions about the specific append fragment.
Keep path and byte expectations independent of the installer in the tests
that own selection. Retain dedicated list-era test data from slice 2.

Proof. Run `install-public-payload.sh`, `dough-update-guidance-payload.sh`,
`pin-and-inspect.sh`, `self-installation-baseline.sh`, and the shared release
builder and installed entry checks. Inspect the same install paths and
installed bytes as before. Run any additional reached consumers identified
in the trace.

### 7. Install the payload from the shipped directory
Type: Behavior
Status: planned
Estimated active work: 11–15 minutes after slices 2–6.

Given the latest tagged directory release, enumerate and validate the shipped
tree once per source boundary for installation and use the same selection for
copy, comparison, and release checks. Switch the current format and retire
the production lists. Keep old tag parsing available to
slices 3 and 4. Use the new rule in the shipped updater's pinned inspection
instructions and maintainer release and promotion guidance. Keep review
explicit for Proposed content and keep the current installer and published
guidance compatible while earlier slices are in progress.

Proof. Add a real tagged list-to-directory case at `apply` with a new
required file named only by its directory entry, a Proposed control outside
the tree, and a dropped legacy file. Assert exact tagged bytes, the removal,
and untouched project data in both roots. Repeat at equal version and refuse
an invalid source before writing. Ensure the pinned inspection and direct
install cases name the new helpers. Run the maintained installation group
and reached fixture consumers, including `repository-release.test.mjs`, the
installed entry check, and release-source evaluation cases whose inputs
changed.

## Plan review

Slice-plan refinement moved inventory wiring and pinned-checkout protection out
of the cutover. Each format reads membership from one source. The existing
installer list is interim through slice 6 and is removed in slice 7. The plan review found
no remaining slice-specific concern.
