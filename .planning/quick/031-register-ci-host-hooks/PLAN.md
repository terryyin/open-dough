# Register and release reproducible CI host hooks

## Source and scope

[SEED-001 Story 8](../../seeds/SEED-001-install-and-update-open-dough.md#register-ci-host-hooks-consistently).

Install/update registers the existing Cursor and Claude Code bridges as portable
project configuration, preserving other settings. Execute-plan verifies readiness
and manages the observer without writing host settings. Publish the resulting
release and adopt it through Open Dough's ordinary updater.

Exclude observer/repair redesign, plugins, global configuration, platform-selection
options, automatic hook removal, idle wakeups, performance/conformance frameworks,
and the separately queued installed-skill perspective and planning-boundary fixes.
Do not pull those stories into this plan merely because they share source files.

## Execution context

- Execution authorized 2026-09-09 in worktree
  `/Users/terryyin/git/open-dough-wt-031-ci-hooks` on branch
  `execute/031-register-ci-host-hooks` (from `main` @ `b63b9da`). Merge to
  `main` and drop the worktree/branch after all slices complete.
- Use `planned`, `in-progress`, `done`. Keep this one plan updated during execution;
  retain unfinished proof and relevant evidence. At completion, update the seed
  and backlog and remove spent planning detail under the existing lifecycle.
- Per the human's explicit direction, numeric slice budgets and changes to timing
  policy are outside scope. Assess cohesion, independent outcomes, and proof loops;
  do not claim an execution-time guarantee or import fixture timing limits.
- Follow dough-execute-plan's proof, independent refactor, selective formatting,
  owned-file commit/push, and CI repair workflow. Authorized push destination:
  `origin/execute/031-register-ci-host-hooks` until final merge to `main`.
  Focused commands below are intended execution checks. Use `npm run format`
  selectively; `npm test` and `npm run lint` remain repository checks/CI, not
  repeated per slice.
- Main checkout retains unrelated dirty work (Quick 030 removal, seed/backlog
  edits, skill perspective edits). Do not restore or stage those incidentally
  from this worktree.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): new
  maintainer-selected numeric version, matching metadata and immutable remote tag.
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): focused
  native acceptance and justified evidence reuse before release.
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one shared behavioral source, minimal host adaptation.

## Current decisions and evidence

1. Keep the two existing hook fragments authoritative. Merge supported JSON
   entries, not whole settings files. No home settings, permissions, trust flags,
   or local preferences are changed. New helper code must travel with the fetched
   installer; extend its inspection and fixture copying if needed. Use the existing
   Node runtime, with an explicit availability check before target mutation, rather
   than adding a dependency or general settings service.
2. Identify Open Dough entries by native event and its exact managed command.
   Adopt exact existing fragment entries, including previously manual registration.
   Preserve unrelated entries and matcher siblings. A changed managed handler,
   unsupported structure, ambiguous wrapper, malformed JSON, or unsafe destination
   produces a named conflict; do not append a second active handler to bypass it.
   Match supported known fragments rather than inventing a general shell parser.
   `--force` for managed skill payloads does not authorize replacing shared settings.
3. Preflight both settings destinations and existing payload checks before writing.
   Prepare merged results before application; leave unchanged files unwritten.
   Never report complete registration if a write fails. Keep recovery within the
   existing installation failure model; do not build a transactional storage layer.
4. Missing entries are repairable. Modified managed entries require a reported
   conflict. Complete equal-version installations remain a no-write operation.
   Hook completeness is a separate semantic check; unrelated settings must not be
   subjected to managed-payload byte comparison or release checksums.
5. Retain hook registration on shutdown. Existing Node/mailbox runtime, ownership,
   notification timing and Codex yielded-cell requirements stay unchanged. Missing
   readiness means explicitly unavailable coverage, not host reconfiguration.
6. Existing code evidence: `install.sh` preflights both skill roots; the apply helper
   skips all installer work for equal versions. `tests/execution-payload-update.sh`
   currently requires entire settings files to remain byte-identical: replace that
   obsolete assertion with managed-entry checks plus unrelated-value preservation.
   Update `tests/helpers/release-fixture.bash` if new installer support files would
   otherwise be omitted from its current `src/install/*.sh` copy.
7. Reuse candidate evidence only after checking applicability against source/runtime:
   [Quick 027](../027-execution-native-acceptance/README.md) records real native
   notification and shutdown for all hosts, including the desktop Codex bridge.
   Its manually registered hooks do not prove the new installer journey. Keep
   Codex/runtime proof reusable when unchanged; new Cursor/Claude installation
   integration proof remains required. No new native runner framework.
8. Research supports the existing project settings locations:
   [Cursor hooks](https://cursor.com/docs/hooks),
   [Claude hooks](https://code.claude.com/docs/en/hooks), and
   [Cursor compatibility](https://cursor.com/docs/reference/third-party-hooks).
   Cursor can load both configurations; the existing Claude adapter's Cursor guard
   must work through the actual compatibility boundary. Documentation and local
   helper execution alone are not a passing native result.

## Ordered slices

### 1. Install hooks into an unconfigured project
Type: Behavior
Status: done

Behavior: Given valid installation inputs and absent/empty hook maps, installation
from any supported invoking tool leaves both native hook registrations alongside
the existing skill roots, with portable commands and a reviewable change report.

Proof: Extend `bash tests/install-all-tools.sh` through the real installer for all
three invoking hints, including a path with spaces. Assert exact required entries,
existing unrelated top-level values, payload bytes, and no Git commit. Align
existing fixture expectations that necessarily change. Repeat installation must
not duplicate entries. Preflight malformed/unsafe inputs before any writes.

Evidence (2026-09-09):
- Helper: `src/install/open-dough-register-hooks.{mjs,sh}` preflight/apply from
  authoritative fragments; interim nonempty-map `unsupported-existing-hooks`.
- `proof: command: bash tests/install-all-tools.sh` — pass (platforms + spaces
  path, idempotent repeat, refuse malformed/unsafe/nonempty before writes).
- Fixture copy includes `src/install/*.mjs`; `execution-payload-update.sh`
  asserts managed entries + sentinel preservation.

Boundary: Until Slice 2 supports nonempty maps, refuse them before mutation with a
clear unsupported-existing-hooks diagnostic. Do not silently omit registration,
replace settings, or label this interim restriction as the completed story.
This is an unreleased, CI-safe first result, not a separate public release.

### 2. Install beside existing project hooks safely
Type: Behavior
Status: done

Behavior: Given existing host hooks, installation produces one Open Dough
registration per required event while preserving unrelated settings, or reports a
specific conflict without changing the target when a safe merge is unavailable.

Proof: Add `bash tests/install-ci-host-hooks.sh` as a focused real-installer journey.
Cover unrelated event handlers/matcher siblings, exact prior manual registration,
repeated invocation, malformed JSON, edited managed timeout/command, and an unsafe
settings path. Compare full target state for refusals; verify unrelated values
and absence of duplicate managed commands for success. A conflict in either host
must prevent changes in both; include `--force` to prove it cannot clobber settings.

Evidence (2026-09-09):
- Merge policy in `open-dough-register-hooks-merge.mjs`; entrypoint unchanged contract.
- `proof: command: bash tests/install-ci-host-hooks.sh` — pass.
- `proof: command: bash tests/install-all-tools.sh` — pass after nonempty refusal removed.

Boundary: Removes Slice 1's temporary nonempty-map refusal. Keep all policy in the
small merge/preflight path; no generalized ownership registry or JSON schema suite.

### 3. Acquire registrations through an ordinary release update
Type: Behavior
Status: planned

Behavior: Given a verified older release with no registered hooks or with exact
manually registered fragments, ordinary no-URL update installs the new release
and reconciles registrations without disturbing unrelated settings.

Proof: Extend `bash tests/execution-payload-update.sh` using tagged disposable
sources, the real apply helper and remembered SOURCE. Assert both installed roots,
new version, hook entries and unrelated settings. Keep existing payload-conflict
refusal and force-restore checks green; add a host-conflict case before replacement.
Use the previous tagged fragments as data if a release changes managed entries;
accept only unmodified known entries, not arbitrary local variants.

Boundary: All helper/fixture inventories and updater inspection guidance needed
for this journey ship in this slice. No hand-copy bootstrap represented as ordinary
update. Existing release tags and historical fixture semantics stay immutable.

### 4. Repair missing registrations at the current version
Type: Behavior
Status: planned

Behavior: Given verified current skill roots with a missing hook file or entry,
ordinary update restores only missing registration; a complete current install
remains unwritten and conflicting settings are reported without writes.

Proof: Extend `bash tests/update-skip-verified.sh` with intact and missing-entry
cases, checking payload/record timestamps and bytes, settings state and result
messages. Re-run a repaired target to prove a full no-op. Retain
`bash tests/update-refuses-unverifiable.sh` coverage for the managed baseline gate.

Boundary: Replace the apply helper's roots-only early return with a completeness
check; do not bypass source/version verification or invent a new repair command.

### 5. Use observation without changing host configuration
Type: Behavior
Status: planned

Behavior: Given installed registration, execute-plan probes readiness and starts
and stops its observer while leaving settings unchanged. Missing readiness is
reported and the plan continues without a monitoring promise or settings rewrite.

Proof: Representative skill walkthrough of ready and unavailable cases against
`src/skills/dough-execute-plan/references/runtime-setup.md` and
`ci-notify-hosts.md`; align `docs/installation-and-updates.md` and directly affected
updater instructions. Use the existing hook/lifecycle tests for empty-event output
and retained registration; do not write prose-exact tests. Native proof is owned
by Slices 6 and 7. Record which walkthrough assertions require that live proof.

Boundary: No new event delivery semantics, polling, automatic unregistration or
runtime redesign. Source edits only; installed copies change through release.

### 6. Use installer-created hooks in Cursor
Type: Behavior
Status: planned

Behavior: Given a fresh candidate installation committed into a disposable project,
a fresh Cursor checkout/session receives readiness and a controlled CI failure
through its native hooks without manual configuration, including with Claude
compatibility enabled; shutdown leaves the tracked settings unchanged.

Proof: Reuse Quick 027's controlled `gh` approach with a new unpredictable failure
label. Record `cursor agent --version`, candidate, literal installer command,
receipt plus separate readiness context, one delivered failure, mailbox shutdown
and settings snapshots. Use a fresh checkout of the fixture's committed install.
Observe native delivery with third-party compatibility enabled to exercise the
existing Claude adapter guard. Include an unavailable-hook setup without overriding
host trust/policy: confirm the agent reports missing coverage and preserves settings.

Boundary: No new acceptance runner or notification implementation. Preserve failed
attempts. If the actual compatibility payload invalidates the guard, fix only that
registration/coexistence defect, rerun affected proof, and revise this plan if a
broader observer change would be needed. Native credentials/policy restrictions
leave acceptance pending rather than passed.

### 7. Use update-created hooks in Claude Code
Type: Behavior
Status: planned

Behavior: Given a disposable project updated from a verified older release through
its remembered source, a fresh Claude Code session receives readiness and a
controlled failure without manual hook registration; shutdown retains the settings.

Proof: Use the real ordinary updater against a tagged disposable candidate, then
commit the fixture update and start fresh native use from that checkout. Record
`claude --version`, candidate and literal update command, native Bash receipt plus
separate hook readiness context, unpredictable failure label reaching the owning
coordinator, exact observer shutdown and unchanged settings snapshots. Reuse the
controlled failure setup from Slice 6; do not repeat its merge/refusal matrix.
Record applicability of Quick 027's Codex notification/shutdown proof to the current
unchanged adapter and layout. If invalidated, run only the unresolved Codex case
through its actual yielded-cell interface before release.

Boundary: This owns hook-update integration. Link separately owned SEED-007 updater
acceptance when the same run supplies useful evidence; do not claim its distinct
ADR-guidance use outcome passed merely because the hook worked. Unavailable sessions
or failed delivery remain pending. There is no generic CLI claim for Codex.

### 8. Publish a fetchable release containing hook registration
Type: Behavior
Status: planned

Behavior: Given applicable acceptance and release checks pass, the maintainer's
new numeric version is published as an immutable tag with matching metadata and
complete intended payload, available to the ordinary release resolver.

Proof: Follow the existing release-version workflow, including
`bash scripts/check-self-installation.sh` before finalization. Confirm payload
review/declaration agreement and repository CI (`npm test`, `npm run lint`). Write
the supplied VERSION and changelog, finalize the annotated tag, and publish the
release commit and tag through the authorized release workflow. Verify the exact
remote tag/commit and complete payload using a fresh fetch. Record actual commands,
version and commit in this plan during execution. Local tag creation alone fails
the published-release postcondition.

Boundary: Coordinate this publication with SEED-001 Story 7 rather than scheduling
another release for the same candidate. Its separately owned Claude updater
acceptance must be resolved if affected content is selected. Do not silently include
other Proposed guidance. Ask for the new numeric version at release time; do not
reuse a prior release's version. The release skill does not push tags; this story's
publication step must explicitly perform and verify the authorized push. Never
force or move a tag. Existing installed copies remain at their valid earlier tag
until Slice 9; do not hand-synchronize them to make the release gate pass.

### 9. Adopt the published release in Open Dough
Type: Behavior
Status: planned

Behavior: Given the new release is remotely available, Open Dough's ordinary update
from remembered SOURCE installs it and its host registrations; committing those
changes makes the setup reproducible in subsequent checkouts.

Proof: Use the installed dough-update workflow without a supplied source override
or hand-copy shortcut. Verify both VERSION records, payload baseline with
`bash scripts/check-self-installation.sh`, exact required hook entries and
preservation of unrelated settings. Review and commit only the resulting owned
installation/configuration changes. A second ordinary update is a no-op. Verify
the committed files are present in a fresh checkout; reuse Slices 6/7's native
integration proof unless adoption exposes a material difference.

Boundary: Adoption is complete only after the ordinary update and configuration
commit, not upon tag publication. Update the story/backlog completion after this
proof, preserving unrelated order and pending sibling outcomes. A pre-existing
settings conflict is reported and resolved by its owner, never overridden as an
incidental release step.

## Proof ownership

| Story promise | Owning slices |
| --- | --- |
| Both hosts registered regardless of invoking tool; portable tracked configuration | 1, 6, 7, 9 |
| Existing settings preserved, duplicate-free merge and no-write conflict refusal | 2 |
| New-release update from remembered source | 3 |
| Current-version repair and complete-install no-op | 4 |
| Execute-plan verifies rather than configures; retained hooks and unavailable coverage | 5, 6, 7 |
| Native Cursor delivery and compatibility coexistence | 6 |
| Native Claude delivery; unchanged Codex adapter evidence | 7 |
| Published release | 8 |
| Ordinary self-update and committed configuration | 9 |

## Refinement result and remaining concerns

The initial combined native-acceptance slice became Slices 6 and 7, each owning
one host journey. The initial combined release/adoption slice became Slices 8
and 9, separating a remotely fetchable release from a working self-installation.
The result is nine Behavior slices, all planned. No Structure-only preparation
or additional story is needed. Scope is unchanged; no resplit recommendation.

Each slice has one cohesive outside-in proof boundary. Numeric sizing and timing
policy are explicitly excluded by human direction; no time guarantee is claimed.
No remaining decomposition concern requires another refinement pass. Execution
is still not authorized by this planning result.

Release version selection remains deferred to Slice 8 and does not block planning.
Native-session availability and source/runtime applicability of saved evidence
remain acceptance risks, with explicit proof owners in Slices 6 and 7. The existing
standalone-updater acceptance is a conditional release dependency, separately owned;
release must not silently waive it. No other open product decision was identified.

## Execution evidence

CI observer: mailbox `/tmp/dough-ci-501/watch-AMvjtz`, workflow `ci.yml` / `CI`,
branch `execute/031-register-ci-host-hooks`. Host bridge readiness unavailable in
this worktree (no `.cursor/hooks.json`); continuing without promised native
notification coverage. Check mailbox/gh for failures after pushes.

### Slice 1
Delivered commit `7e11605`. Focused proof `bash tests/install-all-tools.sh` pass.

### Slice 2
Merge-aware registration; focused proofs
`bash tests/install-ci-host-hooks.sh` and `bash tests/install-all-tools.sh` pass.
