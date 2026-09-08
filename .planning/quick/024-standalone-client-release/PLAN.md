# Deliver the standalone client update workflow

**Source:** [SEED-001 Story 7](../../seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update).
**Status:** Planned; implement slices 1–7 first, then hand off to parked Quick 023.
Slices 8–12 wait for its acceptance. No implementation, native execution, or
publication performed by this planning task.

## Goal and scope

Deliver remembered-source, verified updates of the existing two-skill payload,
then release and self-adopt the accepted result. Clients receive reviewable,
uncommitted changes. Borrow Donut's slice-planning skill and planning/decomposition
rules without installing or distributing them.

[ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
puts candidate native proof in [SEED-007 Story 3](../../seeds/SEED-007-cross-tool-validation.md#accept-standalone-client-workflow),
with [Quick 023](../023-accept-standalone-client/PLAN.md) as its conditional plan.
[ADR 0003 — Tagged release versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
requires a maintainer-chosen version and immutable release identity.
ADR 0000 preserves human decision ownership; ADR 0004 remains Proposed.
No conflict or exception is required.

Excluded: Donut changes, extraction, configuration, generic migration/recovery,
new test infrastructure, native scenario matrices, and old-plan reconciliation.
Quick 019 is historical input, not a second execution plan. Completed payload
cleanup and recognition retirement remain delivered, subject to evidence reuse.

## Execution sequence after the acceptance delay

2026-09-08: The owner reports the other quick plan is delayed until this story
is delivered. Current repository records identify the parked acceptance plan as
**Quick 023**; Quick 022 is recorded as spent and removed after its cheap checks
landed. Apply the recorded Quick 023 handoff here; do not reopen Quick 022 or
assume its existing test support is unavailable.

1. Execute this plan's slices **1–7** to deliver functional implementation,
   completed cheap checks, and one named candidate. Quick 023 need not run in
   parallel and supplies no prerequisite for these implementation slices.
2. At slice **7**, pause this plan and resume **Quick 023** against that candidate.
   Here, “delivered before acceptance” means the implementation handoff, not a
   published release or completion of the entire release story.
3. After applicable native acceptance, resume slices **8–12** for release and
   self-use. Publishing first would create a circular dependency and contradict
   ADR 0005; acceptance is not postponed until after publication.

If acceptance finds a defect, make only the required scoped correction, rerun
invalidated cheap checks, and hand off the new candidate revision. Preserve
applicable evidence and revalidate only affected native requirements. No second
acceptance suite or added implementation scope is needed.

## Current decisions and execution context

- Edit shared product sources under `src/skills/` and `src/install/`, plus
  `install.sh` and affected tests/docs. The project-local installed updater is
  older than the distributable source; do not edit it as the product source.
- Store a single source value in `dough-update/SOURCE` beside `VERSION` in the
  selected native root. This is an implementation choice, not configuration.
  Capture supplied local source paths as absolute paths before changing directory.
- Ordinary invocation reads the selected root's source before pinning a release.
  Missing/unusable records on an existing installation refuse; clean first
  installation and explicit legacy bootstrap take a supplied source. Never infer
  the client's remote. Preserve latest-only selection and inspect-before-execute.
- Keep fixed managed paths. Fetch the recorded baseline as data, never execute
  its helper. Use existing temporary-work and release-resolution support.
- Source inspection found URL-required instructions, VERSION-only installation,
  overwrite of unknown/older installations, and edited-equal success expectations.
  Existing fixture helpers, snapshot checks, failure injection, and force paths
  provide the proof entry points. No preceding Structure slice is needed.
- Each behavior includes its changed prose/docs and focused tests; do not leave
  contradictory success expectations for a later cleanup slice. Keep commits
  green and preserve unrelated work.

## Outside-in proof and ownership

| Story promise | Owner and observable proof |
| --- | --- |
| Complete install with remembered source/version | 1–1b: actual install, exact records/payload, preserved native roots; failed records uncertified. |
| Verified ordinary update from remembered source | 2: real A→B tagged transition; different client remote ignored; edited A refused. |
| Unverifiable installation refuses unwritten | 3: record/baseline failure snapshots and temporary cleanup. |
| Equal/newer versions remain truthful and unwritten | 4: clean/edited/version-boundary observations. |
| Explicit force and truthful failure | 5: exact latest replacement or non-success with truthful records. |
| Known legacy bootstrap | 6: supplied-source transition establishes the new contract. |
| Pinning, fixed retirement, containment, preservation, cleanup, uncommitted changes | 1–6 retain existing relevant regression checks and assert these at each affected operation. |
| Candidate discovery, invocation/application, integration and skill behavior | 7 hands off to SEED-007 Story 3; proof or justified reuse for each tool. |
| Identifiable public release | 8–9: metadata, immutable tag, independent fetch. |
| Retained real Open Dough installation and useful self-use | 10–12: each tool's actual installed-release observation. |

Shared deterministic cases run once; check actual platform destination differences
without replaying every policy on each tool. Static checks are not native proof.

## Ordered slices

### 1. A fresh installation remembers its release source
Type: Behavior
Status: done
Proof: Extend `tests/install-latest-release.sh`: supplied-source `apply` and
direct `install.sh --source` produce the exact payload plus `SOURCE` then
`VERSION` in the selected root. Capture a local source as an absolute path
before changing directory. Align README and `docs/installation-and-updates.md`.
Existing successful `install.sh` callers pass an explicit source so a green
install is never VERSION-only.

Behavior: Clean client → inspected tagged installation from supplied source →
complete verified records of where that release came from. Pass `--source`
through `apply` into `install.sh`. After payload verification, write `SOURCE`
then `VERSION` (VERSION last). Preserve containment and unrelated roots.

### 1b. Failed installation records are not certified as remembered
Type: Behavior
Status: done
Proof: Extend `tests/install-reports-real-copy-failure.sh` and the existing
verify-fault installer path: copy, payload-verification, and record-write
failures report incomplete state, leave no certified SOURCE/VERSION pair, and
do not advance a previous successful record.

Behavior: Replacement starts or records cannot be completed → refuse success.
Never certify a mismatched SOURCE/VERSION pair.

### 2. An ordinary update verifies and replaces a clean older release
Type: Behavior
Status: done
Proof: Extend `tests/update-when-needed.sh` using genuine tagged A and B from
`tests/helpers/release-fixture.bash`: clean A advances to B from saved SOURCE
with no URL on the ordinary helper invocation.

Behavior: Recorded older installation → ordinary update without a URL → compare
fixed managed files against recorded A, then install inspected latest B only
when unchanged. Update the shared skill to read the saved source and obey the
helper. Do not substitute the client remote or a working-tree helper. Replace
synthetic older fixture assumptions only where this proof needs an actual
baseline.

### 3. An unverifiable installation refuses ordinary replacement
Type: Behavior
Status: done
Proof: `tests/update-refuses-unverifiable.sh` covers the same ordinary no-URL
refusal for edited/missing managed files, missing/malformed SOURCE or VERSION,
unavailable tag/source, and baseline metadata mismatch. Target contents/mtimes
remain unchanged and owned temporary content is removed. Clean A→B remains in
`tests/update-when-needed.sh`.

Behavior: Existing installation cannot establish its recorded baseline → ordinary
update → actionable refusal without guessing a source, forcing, or treating it
as a clean first install. Extend slice 2's preflight; no fallback machinery.

### 4. A version skip reports only verified state
Type: Behavior
Status: done
Proof: `tests/update-skip-verified.sh`: clean equal is current and unwritten,
edited equal refuses, `--url` newer is preserved without downgrade, and
ordinary unverifiable newer is unsupported. Assert no installer invocation or
target writes. Remaining A→B / `--url` coverage stays in
`tests/update-when-needed.sh`.

Behavior: Equal/newer installation → ordinary update → truthful verified result
with no downgrade. Reuse the same preflight rather than a second comparison path.

### 5. Explicit force restores the complete latest installation
Type: Behavior
Status: planned — depends on 1–4
Proof: Extend existing force tests so edited, incomplete, equal, and newer
inputs produce the exact latest payload plus `SOURCE` then `VERSION`.
Selection/validation failure still writes nothing, and replacement failure still
cannot report success or advance records — reuse
`tests/update-reports-replacement-failure.sh` and the real copy/record-failure
tests; do not rebuild them. Align skill allowed write paths with SOURCE.

Behavior: Explicit `--force` with recorded SOURCE when present, otherwise a
supplied `--url` → inspected latest replacement → complete selected
installation, recognition retirement, unrelated guidance preserved, no merge or
automatic commit.

### 6. A known legacy installation reaches the remembered-source contract
Type: Behavior
Status: planned — depends on 5
Proof: Extend the deterministic transition in
`tests/support/dough-adr-awareness-release-transition.sh` using an actual old
payload: inspected supplied-source force establishes the revised payload/records.
Check subsequent ordinary helper resolution from the recorded source.

Behavior: Known old installation lacks the contract → documented one-time
supplied-source `--force` bootstrap → installation ready for a later ordinary
no-URL helper call from the SOURCE that force wrote. Align README bootstrap
instructions. Native loading and no-URL skill behavior remain with the
acceptance story; a deterministic transition does not prove them.

### 7. The acceptance task receives one testable candidate
Type: Behavior
Status: planned — depends on 1–6
Proof: `npm test` and `npm run lint` pass for the integrated candidate; record its
revision, changed inputs, exact contract, focused results, and evidence references
in this plan and link the handoff from SEED-007 Story 3.

Behavior: Functional work and cheap checks complete → freeze and identify the
candidate → Quick 023 can select its unresolved native checks. Do not assume HEAD
is a candidate before this handoff. Record implementation complete separately from
native pending. The acceptance task owns fixture suitability and any required
ordinary update→fresh-use proof. Pause here and resume parked Quick 023; keep
release slices blocked until its verdict. Coordinate candidate changes so the
acceptance task tests named inputs rather than a moving checkout.

### 8. The accepted candidate has reviewable release metadata
Type: Behavior
Status: blocked — candidate acceptance and maintainer version required
Proof: Read the existing release-version skill at execution; prepare VERSION and
accurate CHANGELOG for the supplied higher version. Compare prepared release
inputs with accepted candidate inputs and identify any invalidated proof.

Behavior: Candidate accepted in SEED-007 Story 3 and version supplied → prepare
release → reviewable metadata identifies the delivered workflow. Revalidate only
invalidated requirements before publication; no automatic version choice.

### 9. An independent client can fetch the exact published release
Type: Behavior
Status: blocked — depends on 8 and complete applicable acceptance
Proof: Finalize/publish through the existing release process; a fresh fetch
matches tag object, peeled commit, tree and release metadata. Earlier tags remain
unchanged. Retain decisive identities here.

Behavior: Accepted prepared revision → immutable tagged publication → verified
release available for client adoption. No extra release service or synthetic
second public version. This planning request performs no publication.

### 10. Open Dough retains useful Codex adoption
Type: Behavior
Status: blocked — depends on 9
Proof: Inspect the current Codex installation; use the published client flow,
with explicit inspected bootstrap if needed, then fresh native ADR use. Record
published payload/records, installed-skill loading and useful outcome, preserved
other roots/context, and the reviewable client diff.

Behavior: Published release → actual Codex adoption and fresh use → retained
working standalone installation. Reuse applicable candidate proof; do not rerun
a full candidate suite or manufacture a newer release for this observation.

### 11. Open Dough retains useful Cursor adoption
Type: Behavior
Status: blocked — depends on 9; run after 10 to avoid shared-checkout writes
Proof: The same adoption/use observation through Cursor's own native interface,
with its own loaded paths and result; preserve earlier adoption and other roots.

Behavior: Published release → actual Cursor adoption and fresh use → retained
working installation. Candidate evidence reuse requires a Cursor-specific reason.

### 12. Open Dough retains useful Claude Code adoption
Type: Behavior
Status: blocked — depends on 9; run after 11
Proof: The same adoption/use observation through Claude Code's native interface,
with its own loading and useful result. Preserve the other installations.

Behavior: Published release → actual Claude Code adoption and fresh use → retained
working installation. Record completion and hand off to Donut's separate adoption
story only after all required rows below are supported.

## Native evidence and completion

| Platform | Candidate acceptance owner | Released self-use owner | Current verdict |
| --- | --- | --- | --- |
| Codex | SEED-007 Story 3 / Quick 023 | Slice 10 | Pending both; no new native evidence. |
| Cursor | SEED-007 Story 3 / Quick 023 | Slice 11 | Pending both; no new native evidence. |
| Claude Code | SEED-007 Story 3 / Quick 023 | Slice 12 | Pending both; no new native evidence. |

Keep integration and updater/ADR skill behavior coverage distinct. Retain
candidate, tool/runtime, relevant inputs, loading evidence, outcome and reasons
for reuse. Start applicability review from Quick 014 as directed by Quick 023.
Missing proof remains pending; failures stay visible. Final story completion
requires accepted release inputs, verified publication, and all three self-use
observations. No per-platform native policy matrix is introduced here.

## Sizing and learnings

Target about five minutes of active work per leaf including focused verification;
reassess at five and stop at ten unless a recorded focused-test/external-wait
exception explains the duration. Preserve attempt-owned WIP and evidence safely.
A second non-exempt overrun requires the borrowed decomposition rule's story-level
reassessment; renaming leaves does not reset that threshold.

**Refined 2026-09-08 before execution:** split remembered-source success (1)
from uncertified failure records (1b), and moved the edited-A refusal control
into slice 3 so slice 2 is one clean A→B proof loop. **Refined 2026-09-08
before slices 5–6:** keep force success as one leaf (complete latest payload
plus SOURCE/VERSION for edited/incomplete/equal/newer; known SOURCE when
present, else supplied `--url`). Do not rebuild selection or replacement-failure
coverage already owned by slice 1b tests. Keep slice 6 as the genuine
old-payload bootstrap plus a following ordinary no-URL apply from the SOURCE
that force wrote.
Slices 8–12 remain conditional; inspect actual release and installation state
before execution. Integrated tests, Git/network waits, and one bounded native
adoption→use journey can exceed active-work targets; keep that runtime separate
rather than splitting update from fresh use.

**Slice 1:** `install.sh --source` is required at parse. Local directory sources
are stored as `pwd -P` using the original working directory before later `cd`.
`apply` threads its existing `--url` into that write. SOURCE is written after
payload verification and before VERSION. Direct install and apply both record
the same absolute local fixture path.

**Slice 1b:** VERSION write is the success certificate. A failed VERSION write
restores the previous SOURCE or removes SOURCE on a fresh install. Synthetic
`record` faults are not enough; prove with a real `chmod a-w` on VERSION.
Replacement-failure apply cases live in `tests/update-reports-replacement-failure.sh`.

Slice 1 delivered remembered SOURCE/VERSION on successful install. Remaining
leaves still inherit the inspected gaps: edited-equal success and unknown-install
overwrite must change with later behavior. The installed local updater is not
the candidate source. Quick 019's native matrix and repeated post-adoption no-op
checks add no hidden requirements.

**Slice 2:** Ordinary `apply` without `--url` reads `dough-update/SOURCE`, pins
latest from that source, fetches tagged A as data (never executing A's helper),
compares the two managed files, then installs inspected B only when they match.
`--url` callers skip that baseline preflight so existing supplied-URL tests stay
green; slice 3 extends the no-URL preflight only. Genuine A is fixture tag
`v0.1.1` via `checkout_tagged_release`; B is `v0.1.10`. A decoy client `origin`
is ignored. Git fixture construction exceeded the five-minute target; focused
tests themselves were short. One proof loop; not a second overrun.

**Slice 3:** Ordinary no-URL apply refuses when SOURCE/VERSION/baseline cannot
be established: missing SOURCE is not `Usage`, missing VERSION is not unknown
overwrite, and edited/missing payload, unavailable tag/source, and mismatched
tagged metadata share one preserved-installation Outcome. `--url` still skips
that preflight. Apply lives in `src/install/open-dough-release-apply.sh` and is
on the inspect list. Git-fixture data variations exceeded the five-minute
target; focused tests were short. Not a second non-exempt overrun.

**Slice 4:** Ordinary equal/newer reuse the same recorded-tag preflight. Clean
equal is current and unwritten; edited equal refuses; a VERSION newer than
source whose tag is absent is unsupported with no downgrade. `--url` still
skips preflight, which is how a supplied-URL newer remains preserved. Edited-equal
success was removed from `tests/update-when-needed.sh`. A true newer tag cannot
exist in the same SOURCE as a lower latest (ADR 0003), so ordinary newer is
unverifiable rather than a second comparison path.
