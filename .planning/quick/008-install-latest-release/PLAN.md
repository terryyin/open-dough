# Install the latest released Open Dough guidance safely

**Status: REFINED — ready for execution, not executed in this refinement.**
Updated in place on 2026-09-06 using Donut's `slice-plan-refinement` skill.

Source: [SEED-001, Story 5a](../../seeds/SEED-001-install-and-update-open-dough.md#install-latest-release).
Reused behavior: [completed Story 5b](../../seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed).
Contract: [Accepted ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).

## Goal and scope

A developer installs the highest numeric released `dough-update` from their
supplied repository URL into the captured target project for the running tool,
then discovers and invokes it in a fresh native session. Only inspected pinned
repository code executes. Installed payload and version agree; ordinary repeat
installation stops, while explicit force replaces the selected copy.

Include release identity and truthful failure reporting, temporary-work cleanup,
README discoverability, and preservation of other tools, unrelated project
content, distributable source, home guidance, internal skills, and the guard.
Reuse Story 5b's same-release no-op as the first-use demonstration.

Exclude migration/unknown-baseline updating, publication, Open Dough self-adoption,
inline release notes, extra skills/rules, global installation, requested versions,
rollback, local-edit merging, and cross-tool synchronization. Other stories keep
those outcomes. Fixture releases may contain the current implementation; they
are not a claim that the updater has been publicly released.

## Current decisions

- Install and update have different existing-file policies. Do not route an
  ordinary installation through `apply`: it can upgrade an existing record or
  force replacement of an unknown installation. Preserve `install.sh`'s repeat
  guard and explicit `--force`; leave Story 5b's `apply` semantics unchanged.
- Reuse the Git-first bootstrap described in `src/skills/dough-update/SKILL.md`:
  list tags without executing repository code, compare decimal components as
  strings, use the peeled commit for annotated tags, fetch that commit, and
  confirm detached HEAD. No branch helper runs to select its own release.
- Inspect the pinned installer, source skill, and executable dependencies:
  `open-dough-release.sh`, `open-dough-release-resolve.sh`,
  `open-dough-release-version.sh`, and `open-dough-platform.sh`. Inspection must
  cover the actual call chain, not just an entry script that sources other code.
- After inspection, use that snapshot's existing `resolve-url` and
  `validate-checkout` commands to check the selected tag/commit/version against
  HEAD and source metadata. Stop on mismatch; do not repin. Then invoke that
  same snapshot's `install.sh` with the captured target and selected platform.
  No second repository resolver, new installer API, or update-policy change is
  needed. The installing agent reports source/tag/commit alongside the actual
  installer result and verifies installed bytes and version.
- Keep temporary-directory ownership in the installing workflow, including
  cleanup across the separate pin, inspect, and execute steps. An `apply`
  cleanup test does not prove cleanup for this direct-installer journey.
- Consolidate public installation instructions into one shared guide linked
  from README, with a small platform path/invocation table. Move existing update
  documentation with its links intact; do not rewrite its delivered behavior.
  Resolve the inherited 394-line README finding without producing another
  oversized guide: keep ordinary documentation files at or below 250 lines.
- Tests execute the documented boundary with controlled local tagged sources;
  native sessions establish that agents actually follow it. Do not call a test's
  hard-coded `v0.1.10` lookup proof of generic latest selection.

## Preserved completed work and proof limits

These are the original leaf identifiers, not a new execution sequence. Completed
status is retained for unchanged behavior; no tests were rerun during refinement.

| Original leaves | Retained status | Evidence and limits |
| --- | --- | --- |
| 1–3: record, repeat guard, force | done | `tests/install.sh` and `tests/install-omits-internal.sh` cover the direct installer for all three platform destinations and omission of internal material. Keep this policy and reuse these checks when changing its caller. |
| 4–7: numeric latest and validation | done | `tests/install-latest-release.sh` covers supplied URL, numeric latest, payload and validation failures. Its clone-then-pin loop is helper evidence only; it does not prove the new pre-execution inspection boundary. |
| 17: fresh Codex discovery | done, historical | Codex 0.153.4 session `01a07569-9c9e-7412-bcae-87049e00f575`. Does not prove the corrected installation instructions. |
| 18: fresh Cursor discovery | partial | CLI install and an in-session file read exist. Fresh fixture discovery remains unproven. |
| 19: fresh Claude Code discovery | done, historical | Claude Code 2.1.263 session `e2c8f582-0545-44b3-8037-b1f1b8a397d4`. Does not prove the corrected installation instructions. |

Story 5b's pinned execution, numeric comparison, and native no-op proof remain
available for unchanged updater behavior. `tests/pin-and-inspect.sh` supplies a
poisoned-branch fixture and mismatch signal; `tests/update-when-needed.sh`
supplies copy/verification fault hooks and no-op observations. Neither currently
proves the complete documented fresh-install journey. Its deleted Quick 005
plan is replaced here by the live Story 5b link.

## Outside-in proof and ownership

| Final promise / story example | Owning remaining leaves | Observable proof |
| --- | --- | --- |
| Find one shared install guide from README; retain all tool and update links | 1–2 | Working relative links, bounded document size, one common install procedure and platform table; native agents reach it from README. |
| Highest numeric supplied-URL release, inspected dependencies, exact pinned execution and verified record | 2; native 6–8 | Divergent/poisoned branch never executes; numeric `0.1.10` beats `0.1.9` regardless of date; inspected and executed commit agree; payload bytes/record and reported identity agree. |
| Ordinary repeat never updates or overwrites | retained 1–3; native 9, 11, 13 | An older recorded installation with a local marker remains unchanged after an ordinary install request; no force/update path is used. |
| Explicit force replaces only selected copy and record | retained 1–3; native 10, 12, 14 | Native explicit reinstall restores latest payload and record while preserving coexisting copies and unrelated material. |
| Fetch/no-tag/invalid-highest/missing-payload refusal without fallback | 3 | Nonzero failure, no successful outcome, untouched target and released-source identity; no lower/branch installer runs. |
| Selection changes after inspection | 4 | Old snapshot is not replaced or installed, target is untouched, mismatch explained. |
| Failed copy/verification never records success or promises rollback | 5 | Absent fresh record or unchanged prior successful record, incomplete-files warning and explicit reinstall guidance. |
| Temporary work cleaned on success and failure | 2–5; native 6–14 for their own runs | Operation-owned temporary paths disappear at their workflow boundary; success, prewrite rejection, partial failure, and repeat rejection covered. |
| Native discovery and invocation; same-release update stays unwritten | 6–8 | Fresh host session discovers the installed skill and invokes it; trace plus write-sensitive observations show no installer call or file/record writes. |
| Selected host/project; coexistence; no source/home/internal/guard writes | retained 1–3; 2 and 6–14 | Exact managed-file enumeration and before/after snapshots; other installations and sentinel content unchanged, including on rejected operations. |
| Latest only; no unversioned branch or requested-version path | 2–3; retained installer checks | Guide refuses a requested version before fetching/writing; numeric release failures never fall back. |

## Ordered remaining slices

Each leaf has one proof loop and a green stopping point. Sizing includes edits,
focused verification, cleanup, and recording the observation here. The target
is about five minutes; ten minutes is the non-exempt hard limit. These are
hypotheses, not elapsed-time claims. Do not rerun unchanged native evidence
merely because a later independent platform leaf completes.

### 1. Put the shared installation guide behind the README entry point
Type: Structure
Status: planned
Proof: Follow README's install/update links for all three tools; compare moved
instructions with their originals, check relative links and document lengths.

Structure: Move the existing detailed instructions into bounded documentation
under `docs/`, preserving their meaning and leaving a concise README entry.
This immediately enables leaf 2 to correct one shared installation procedure.
Do not add separate platform workflows or silently change update behavior.
Sizing: about five minutes, medium confidence; mechanical move/link repair only.

### 2. Install the inspected latest snapshot through the shared guide
Type: Behavior
Status: planned
Proof: One focused fresh-install fixture run follows the guide's actual sequence:
numeric latest, detached inspected commit, zero poisoned-branch execution,
selected payload/record match, complete source/tag/commit/path report, only managed
writes, and operation-owned temporary directory removed. Reuse the existing
fixture builder and pin-and-inspect test; correct the fixture's bootstrap proof
rather than creating a parallel installer implementation.

Behavior: No selected installation, divergent default branch and numeric tags →
follow README's shared guide → install only the inspected latest tagged payload.
Replace clone-then-execute snippets for every platform with the common pin,
inspect, revalidate, direct-install procedure in Current decisions. Preserve
repeat/force instructions and refuse requested versions. Align the relevant
install test caller with this final route; retain helper-only coverage as such.
Sizing: about five minutes, medium confidence; existing commands/fixtures are
sufficient, no new product API. Split on hidden executable-wrapper work.

### 3. Leave the target untouched when no usable latest release is available
Type: Behavior
Status: planned
Proof: One parameterized prewrite-rejection loop through the guide boundary:
unreachable source, no numeric tag, inconsistent highest metadata, or missing
highest payload → failure, no target writes/fallback, and cleaned temporary work.
Reuse existing invalid-source fixtures, adding only absent coverage.

Behavior: Latest cannot be fetched or validated → request installation → stop
before target writes and report why. Repair the shared instructions or boundary
only if the focused observation fails; do not build new release policy.
Sizing: about five minutes, medium confidence; same rejection assertion with
fixture data variations, not separate native sessions or a new framework.

### 4. Stop when the inspected snapshot ceases to be latest
Type: Behavior
Status: planned
Proof: Pin/inspect a fixture release, publish a higher tag only in that fixture,
then continue the documented revalidation step. Observe mismatch, unchanged
snapshot HEAD/bytes, no installer call or target writes, and temporary cleanup.

Behavior: Latest changes after inspection → continue installation → stop without
repinning or running replacement code. Extend the existing mismatch fixture;
keep public tags and Story 5b semantics untouched.
Sizing: about five minutes, high confidence; one race boundary and one proof.

### 5. Keep the version truthful after an incomplete installation
Type: Behavior
Status: planned
Proof: One parameterized failed-write loop using existing copy/verify fault
hooks, for fresh installation and explicit reinstall. Require incomplete-files
report, absent fresh record or unchanged previous successful record, no success
claim, explicit reinstall guidance, preserved unrelated files, and temp cleanup.

Behavior: Copy or verification fails after writes start → finish the install
attempt → report incomplete installation without recording success. Reuse the
installer's existing error behavior; cover the fresh-record gap and installing
workflow cleanup rather than implementing rollback.
Sizing: about five minutes, medium confidence; existing fault hooks and assertions
with starting-state variations. Split if fault handling needs multiple fixes.

### 6. Discover and use a fresh Cursor installation
Type: Behavior
Status: planned
Proof: One native Cursor adoption scenario under the protocol below, recording
a fresh fixture-window/session identifier and actual `/dough-update` invocation.

Behavior: No selected copy, other hosts' copies present → install from README,
then invoke in a fresh Cursor session → use the verified release and observe the
same-release no-op. File reading alone cannot close original leaf 18.
Sizing: about five minutes active work, medium confidence; native wait rule below.

### 7. Discover and use a fresh Codex installation
Type: Behavior
Status: planned
Proof: One native Codex adoption scenario under the protocol below; record the
fresh session identifier and actual `$dough-update` invocation.

Behavior: No selected copy, other hosts' copies present → install from README,
then invoke in a fresh Codex session → use the verified release and observe the
same-release no-op. Retain original leaf 17 as historical evidence.
Sizing: about five minutes active work, medium confidence; native wait rule below.

### 8. Discover and use a fresh Claude Code installation
Type: Behavior
Status: planned
Proof: One native Claude Code adoption scenario under the protocol below; record
the fresh session identifier and actual `/dough-update` invocation.

Behavior: No selected copy, other hosts' copies present → install from README,
then invoke in a fresh Claude Code session → use the verified release and observe
the same-release no-op. Retain original leaf 19 as historical evidence.
Sizing: about five minutes active work, medium confidence; native wait rule below.

### 9. Preserve an existing Cursor copy on ordinary installation
Type: Behavior
Status: planned
Proof: Native Cursor ordinary-install scenario under the repeat protocol below.

Behavior: Selected copy has an older record and a local marker → ask to install
without force → stop with overwrite explanation and preserve selected files.
Sizing: about five minutes active work, high confidence; native wait rule below.

### 10. Explicitly reinstall the selected Cursor copy
Type: Behavior
Status: planned
Proof: Native Cursor force scenario under the reinstall protocol below.

Behavior: Existing selected copy and explicit overwrite authorization → install
with force → replace only Cursor's payload and record with verified latest.
Sizing: about five minutes active work, high confidence; native wait rule below.

### 11. Preserve an existing Codex copy on ordinary installation
Type: Behavior
Status: planned
Proof: Native Codex ordinary-install scenario under the repeat protocol below.

Behavior: Selected copy has an older record and a local marker → ask to install
without force → stop with overwrite explanation and preserve selected files.
Sizing: about five minutes active work, high confidence; native wait rule below.

### 12. Explicitly reinstall the selected Codex copy
Type: Behavior
Status: planned
Proof: Native Codex force scenario under the reinstall protocol below.

Behavior: Existing selected copy and explicit overwrite authorization → install
with force → replace only Codex's payload and record with verified latest.
Sizing: about five minutes active work, high confidence; native wait rule below.

### 13. Preserve an existing Claude Code copy on ordinary installation
Type: Behavior
Status: planned
Proof: Native Claude Code ordinary-install scenario under the repeat protocol below.

Behavior: Selected copy has an older record and a local marker → ask to install
without force → stop with overwrite explanation and preserve selected files.
Sizing: about five minutes active work, high confidence; native wait rule below.

### 14. Explicitly reinstall the selected Claude Code copy
Type: Behavior
Status: planned
Proof: Native Claude Code force scenario under the reinstall protocol below.

Behavior: Existing selected copy and explicit overwrite authorization → install
with force → replace only Claude Code's payload and record with verified latest.
Sizing: about five minutes active work, high confidence; native wait rule below.

## Native proof protocols and evidence to record

Use separate disposable target projects with spaces in their paths and controlled
releases of the candidate code. Include other tools' installed copies/records,
unrelated guidance, project sentinels, and source/home baselines. Start from the
README and the supplied URL; avoid giving the agent a bypass command that would
hide whether the public instructions work. Do not install in Open Dough itself.

**Adoption (6–8):** Record host/version, supplied URL, tag/peeled commit, command
and inspection transcript, selected target, installed byte/record comparison,
managed-file diff and temporary cleanup. The transcript must show no fetched
repository code before inspection. Open a genuinely fresh native session and
observe discovery and invocation. For the same-release update, use installer
tracing and write-sensitive evidence (timestamps with sufficient resolution or
file-write observation), plus byte comparison. A clean diff alone is insufficient.
The install-to-first-use chain is one adoption scenario; if installation fails,
fix it and rerun that host before claiming the chain is complete.

**Repeat (9, 11, 13):** In a disposable existing installation, prepare a valid
older record and local payload marker. An ordinary installation request must
stop, preserve files/record and other guidance, and explain force. Observe the
actual native command path: `apply` advancing the record is a failure. Record
no writes, no implicit force, truthful output, and temporary cleanup.

**Reinstall (10, 12, 14):** Use that host's preserved target with explicit force
authorization in the fixture prompt. Observe pin/inspection/revalidation and
selected replacement, compare payload/record to latest, and verify other copies,
source/home guidance and internal omissions. Record the true outcome and cleanup.

| Platform | Adoption | Repeat | Explicit reinstall | Current evidence |
| --- | --- | --- | --- | --- |
| Cursor | 6 | 9 | 10 | Pending corrected journey and fresh native discovery. |
| Codex | 7 | 11 | 12 | Pending corrected journey; original discovery proof retained above. |
| Claude Code | 8 | 13 | 14 | Pending corrected journey; original discovery proof retained above. |

Native wait rule: target about five minutes including verification when the host
responds promptly. A single focused native scenario may take longer due to host
startup or model/tool response waits. Record actual elapsed time and the specific
external wait at the threshold; that is the only anticipated sizing exception.
Do not use it to excuse implementation/debugging overrun. If a host is unavailable,
leave its leaf pending and continue independent ready leaves; copying files or
passing another host never substitutes for native proof.

## Refinement review and execution controls

| Prior fragment / trigger | Classification | Resolution |
| --- | --- | --- |
| Completed installer and release leaves 1–7 | Ready for reuse within unchanged boundary | Preserve evidence; new caller/failure proof belongs to 2–5. |
| Unsafe README bootstrap plus oversized guide | Refine | One immediately enabling documentation Structure (1), then common fresh-install Behavior (2); separate rejection policies in 3–5. |
| Missing current native flow and partial Cursor discovery | Refine | One adoption loop per host (6–8), Cursor first to resolve the least-proven assumption. |
| Repeat/force could accidentally inherit update semantics | Refine | Preserve direct installer policy, then one native transition per leaf (9–14); do not hide repeat and force in an oversized platform checklist. |
| Parent story or sibling order | No escalation | Scope unchanged; existing implementation and fixtures make approximately 70 minutes of active remaining work plausible, with native waits recorded separately. |

All 14 remaining leaves are Ready as sizing hypotheses after this refinement.
There are no unowned promises or planned product changes outside Story 5a.
Five-minute review: split hidden preparation or independent outcomes before
continuing. Ten-minute non-exempt overrun: safely park only attempt-owned WIP,
record elapsed time/evidence and the disproved assumption, then refine this plan.
After a second non-exempt overrun in this story, reassess the story boundary under
Donut's Learning escalation; renaming leaves does not reset that count.

For changed code, run the focused proof and applicable repository lint checks;
keep tests with their behavior and finish green. Native evidence-only leaves
record observations here and need no unrelated code churn or broad test reruns.
Any future execution workflow's cleanup/refactor/commit gates still apply.
This request authorizes plan refinement only; no implementation, product test
execution, commit, push, release, or installation was performed in this pass.

## Learnings that changed the plan

- README still has 394 lines and three clone-then-run examples. A generic warning
  to inspect after calling a branch helper cannot satisfy the story boundary.
- `apply --checkout` protects the inspected snapshot but retains update semantics;
  the existing direct installer is the appropriate ordinary-repeat boundary.
- The helper imports three scripts before dispatch. Those executable dependencies
  belong to inspection of the pinned snapshot.
- Existing pin-and-inspect proof hard-codes one tag and exercises `apply`;
  validation/cleanup tests mostly cover updater-owned work. Reuse their fixtures
  and assertions, but collect installation-specific observations in leaves 2–5.
- Prior native discovery remains useful historical evidence. Changed public
  instructions require new native journey proof; Cursor's fresh discovery gap
  remains explicit until leaf 6 succeeds.
