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

- Execution resumed 2026-09-09 at the human's direction directly in
  `/Users/terryyin/git/open-dough` on `main`, without a worktree. This supersedes
  the earlier execution location and push destination for remaining slices.
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
Status: done

Behavior: Given a verified older release with no registered hooks or with exact
manually registered fragments, ordinary no-URL update installs the new release
and reconciles registrations without disturbing unrelated settings.

Proof: Extend `bash tests/execution-payload-update.sh` using tagged disposable
sources, the real apply helper and remembered SOURCE. Assert both installed roots,
new version, hook entries and unrelated settings. Keep existing payload-conflict
refusal and force-restore checks green; add a host-conflict case before replacement.
Use the previous tagged fragments as data if a release changes managed entries;
accept only unmodified known entries, not arbitrary local variants.

Evidence (2026-09-09):
- Hook registration gated on fragment presence so older fixtures without
  dough-execute-plan still install; upgrades register/adopt hooks.
- `proof: command: bash tests/execution-payload-update.sh` — pass.
- Public-payload and omit-internal enumerations include host settings files.
- Portable installer-module copy avoids `compgen` for `*.mjs`.

Boundary: All helper/fixture inventories and updater inspection guidance needed
for this journey ship in this slice. No hand-copy bootstrap represented as ordinary
update. Existing release tags and historical fixture semantics stay immutable.

### 4. Repair missing registrations at the current version
Type: Behavior
Status: done

Behavior: Given verified current skill roots with a missing hook file or entry,
ordinary update restores only missing registration; a complete current install
remains unwritten and conflicting settings are reported without writes.

Proof: Extend `bash tests/update-skip-verified.sh` with intact and missing-entry
cases, checking payload/record timestamps and bytes, settings state and result
messages. Re-run a repaired target to prove a full no-op. Retain
`bash tests/update-refuses-unverifiable.sh` coverage for the managed baseline gate.

Evidence (2026-09-09):
- Equal-version path uses hook completeness (`status`/`repair`/`complete`).
- Missing entry/file repairs settings only; intact install stays `apply-skip-equal`.
- Conflict refuses without writes.
- `proof: command: bash tests/update-skip-verified.sh` — pass.
- `proof: command: bash tests/update-refuses-unverifiable.sh` — pass.

Boundary: Replace the apply helper's roots-only early return with a completeness
check; do not bypass source/version verification or invent a new repair command.

### 5. Use observation without changing host configuration
Type: Behavior
Status: done

Behavior: Given installed registration, execute-plan probes readiness and starts
and stops its observer while leaving settings unchanged. Missing readiness is
reported and the plan continues without a monitoring promise or settings rewrite.

Proof: Representative skill walkthrough of ready and unavailable cases against
`src/skills/dough-execute-plan/references/runtime-setup.md` and
`ci-notify-hosts.md`; align `docs/installation-and-updates.md` and directly affected
updater instructions. Use the existing hook/lifecycle tests for empty-event output
and retained registration; do not write prose-exact tests. Native proof is owned
by Slices 6 and 7. Record which walkthrough assertions require that live proof.

Evidence (2026-09-09):
- Guidance: execute-plan confirms install/update registration, probes readiness,
  starts/stops the mailbox observer, and must not rewrite host settings.
  Missing readiness is explicit unavailable coverage (continue without a
  monitoring promise). Shutdown retains hook registration.
- Aligned `docs/installation-and-updates.md` and `dough-update/SKILL.md` so
  registration stays an install/update concern; observation verifies only.
- Shared lifecycle wording in `ci-monitor.md` matches verify/retain semantics.
- Focused reuse: `node --test` on `ci-host-hook.test.mjs`,
  `ci-cursor-lifecycle.test.mjs`, and `ci-claude-lifecycle.test.mjs` (empty-event
  quiet output; readiness/start/reuse/stop without unregistering hooks).
- Delivered in commit `4dfe340`.

Boundary: No new event delivery semantics, polling, automatic unregistration or
runtime redesign. Source edits only; installed copies change through release.

Walkthrough assertions:

| Case | Assertion from guidance | Slice 5 proof | Needs Slice 6/7 live |
| --- | --- | --- | --- |
| Ready | Probe yields `CI_OBSERVER` receipt; host hook adds separate `CI_MONITOR_READY` | Lifecycle + host-hook tests (scripted hook replay) | Yes — real Cursor/Claude session after installer/update registration |
| Ready | After ready, `start` once; attachment context; reuse across pushes; no second launch | Lifecycle tests | Yes — native attachment after real hooks |
| Ready | Observer start/stop leave `.cursor/hooks.json` / `.claude/settings.json` unchanged | Guidance only (no settings write path in observe) | Yes — settings snapshots before/after native run |
| Ready | Shutdown retains installed hook registration (no unregister) | Guidance + stop stops mailbox only (lifecycle) | Yes — post-shutdown settings still contain managed entries |
| Unavailable | Missing `CI_MONITOR_READY` → report once, continue without monitoring promise | Guidance walkthrough | Yes — unavailable-hook setup without trust/policy override |
| Unavailable | Do not merge fragments or rewrite host settings to "fix" readiness | Guidance walkthrough | Yes — settings unchanged in unavailable case |
| Empty event | Pending/success boundaries add no model context | `ci-host-hook` + lifecycle empty `{}` assertions | No (scripted) unless native delivery regression appears |

Boundary: No new event delivery semantics, polling, automatic unregistration or
runtime redesign. Source edits only; installed copies change through release.

### 6. Use installer-created hooks in Cursor
Type: Behavior
Status: done

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

Evidence (2026-09-09):
- Fixture root `/private/tmp/dough-031-native.95TOnc`; disposable candidate `0.3.4`
  tagged only in that source repo. Literal install:
  `bash …/source/install.sh --target <target> --source …/source --platform cursor`
  registered both hosts; unrelated `unrelatedCursor`/`unrelatedClaude` preserved.
  Fresh clone `cursor-checkout` used for native sessions (no manual fragment copy).
- `cursor agent --version`: `2026.09.08-6caf4ff`.
- Ready: probe receipt + separate `CI_MONITOR_READY`; both `.cursor/hooks.json` and
  `.claude/settings.json` present (Claude entries retained for compatibility
  coexistence). Settings unchanged after session.
- Failure: controlled `gh` job `acceptance-4ed6fb00ed2a5823`; mailbox
  `/tmp/dough-ci-501/watch-rD8VRq` stopped with `deliveredThrough: 1`, `unread: 0`.
  Settings snapshots unchanged after shutdown.
- Unavailable: skills present without managed hook entries; probe receipt only;
  agent reported unavailable coverage once; settings unchanged (no merge/rewrite).
- Retained under `.planning/quick/031-register-ci-host-hooks/evidence/`.

Boundary: No new acceptance runner or notification implementation. Preserve failed
attempts. If the actual compatibility payload invalidates the guard, fix only that
registration/coexistence defect, rerun affected proof, and revise this plan if a
broader observer change would be needed. Native credentials/policy restrictions
leave acceptance pending rather than passed.

### 7. Use update-created hooks in Claude Code
Type: Behavior
Status: done

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

Evidence (2026-09-09):
- Disposable source imported published `v0.3.3` then tagged candidate `0.3.4` with
  hook registration. Older install left empty hook maps; ordinary
  `open-dough-release.sh apply --target … --platform claude` (no URL) upgraded to
  0.3.4 and registered both hosts while preserving unrelated settings. Fresh clone
  `claude-checkout` used for native sessions.
- `claude --version`: `2.1.265 (Claude Code)`.
- Ready: Bash probe receipt + separate PostToolUse `CI_MONITOR_READY`; settings
  unchanged.
- Failure attempt 1 (default permissions): readiness ok; observer `start` declined —
  retained under `evidence/claude/failure-attempt1-*`.
- Failure attempt 2 (`bypassPermissions`): job `acceptance-b8118306c1d27163`;
  mailbox `/tmp/dough-ci-501/watch-f5gUCA` stopped with `deliveredThrough: 1`,
  `unread: 0`; settings unchanged.
- Codex: Quick 027 notification/shutdown remains applicable — no diff vs `v0.3.3`
  for `ci-notify-codex.md`, `ci-mailbox.mjs`, `ci-observer-stream.mjs`
  (`evidence/codex-applicability.md`). No SEED-007 ADR-guidance claim from this run.

Boundary: This owns hook-update integration. Link separately owned SEED-007 updater
acceptance when the same run supplies useful evidence; do not claim its distinct
ADR-guidance use outcome passed merely because the hook worked. Unavailable sessions
or failed delivery remain pending. There is no generic CLI claim for Codex.

### 8. Refuse dangling hook destinations before installation writes
Type: Behavior
Status: done

Behavior: Given a dangling symlink at either host settings file or its parent,
install/update reports `unsafe-hooks-destination` before changing either payload,
either host settings file, or the symlink target.

Proof: Extend `bash tests/install-ci-host-hooks.sh` through the real installer
with a dangling file link in each host and a dangling parent link. Capture the
whole target and outside destination before invocation, including `--force`;
assert named refusal and no changes. Retain the existing valid-symlink refusal
and normal missing-file success cases. The shared preflight must inspect the
link itself even when its referent does not exist (retrospective R1).

Evidence (2026-09-09):
- Destination preflight uses link-aware `lstatSync`, including dangling links,
  before payload-root inspection; no target or outside path is mutated.
- Real-installer coverage includes dangling Cursor/Claude settings links,
  dangling host parent, valid symlink, missing-file success, ordinary and
  `--force` invocation, and full target/outside snapshots.
- `proof: command: bash tests/install-ci-host-hooks.sh` — pass.
- Independent refactor renamed the internal mode to `preflight-destinations`;
  focused proof remained green. `npm run format` passed without further edits.

Boundary: Correct destination inspection in the existing helper; no transactional
storage layer or general filesystem-hardening project.

### 9. Adopt only unambiguous managed hook registrations
Type: Behavior
Status: planned

Behavior: Given existing handlers for an Open Dough native event, installation
adopts one matching effective registration or reports a named conflict without
writes when managed command edits, duplicate registrations, or changed Claude
wrapper scope make adoption unsafe. Unrelated handlers and matcher siblings survive.

Proof: Extend `bash tests/install-ci-host-hooks.sh` with a known managed script
command plus a local argument, duplicate exact managed entries, and a Claude
managed handler inside `matcher: "Read"`. Each must refuse without mutation,
including explicit force; exact manual registration and unrelated matcher
siblings must still succeed. Assert behavior through the real installer and
reuse this merge-policy matrix for update (retrospective R2).

Boundary: Recognize bounded variants of the known managed script commands; do
not invent a general shell parser or silently rewrite user matcher scope. Treat
ambiguous duplicate ownership as a conflict rather than silently deleting entries.

### 10. Keep semantically complete registrations unwritten
Type: Behavior
Status: planned

Behavior: Given complete hook registration with different JSON whitespace or
object-key order, ordinary equal-version update reports a full no-op, preserving
settings bytes and timestamps and all managed payload records.

Proof: Extend `bash tests/update-skip-verified.sh` with compact JSON, reordered
handler keys, and unrelated settings serialized differently. Capture settings
bytes/mtimes as well as payload state. Assert the existing no-write outcome and
absence of repair/installer invocation; missing registration still repairs.
Use structural object equality with array order preserved for managed-entry
comparison and decide completeness from the merge's semantic change, not from
pretty-printed document bytes (retrospective R3).

Boundary: Settings are shared configuration, not canonicalized release payload.
Do not impose formatter ownership on unrelated settings or add prose-exact tests.

### 11. Reconcile hook completeness on repeat installation
Type: Behavior
Status: planned

Behavior: Given current payload roots, repeating ordinary installation repairs
missing host registration without rewriting payload files, or refuses conflicting
settings without writes; a complete installation remains wholly unwritten.

Proof: Extend `bash tests/install-all-tools.sh` with install → remove a managed
entry/file → repeat install → repeat again. Verify exact registration, untouched
payload bytes/mtimes, and final full no-op. Include one malformed/conflicting
settings case with current roots to prove the preflight is not skipped. Reuse
Slice 9's detailed policy cases rather than duplicating them (retrospective R4).

Boundary: Decouple host completeness from payload replacement in `install.sh`;
retain source/baseline checks and fragment-free historical release behavior.
Reuse the existing registration helper rather than adding another merge policy.

### 12. Publish a fetchable release containing hook registration
Type: Behavior
Status: planned

Behavior: Given applicable acceptance and release checks pass, the maintainer's
new numeric version is published as an immutable tag with matching metadata and
complete intended payload, available to the ordinary release resolver.

Proof: First close retrospective R5's unresolved Slice 6 compatibility condition:
review retained native evidence for an explicit active Claude-compatibility
setting and actual compatibility hook invocation/payload. File presence and
one native Cursor delivery are insufficient. If retained evidence cannot establish
this, run only the missing native Cursor coexistence case with compatibility
explicitly active, record the actual compatibility boundary/guard evidence,
one native failure delivery, exact shutdown, and unchanged settings. Preserve
prior attempts; do not relabel them as proof of this condition. This remains a
release prerequisite under ADR 0005, not an observer redesign.

After Slices 8–11 and the compatibility condition pass, follow the existing
release-version workflow, including
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
until Slice 13; do not hand-synchronize them to make the release gate pass.

### 13. Adopt the published release in Open Dough
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
| Both hosts registered regardless of invoking tool; portable tracked configuration | 1, 6, 7, 11, 13 |
| Existing settings preserved, duplicate-free merge and no-write conflict refusal | 2, 8, 9 |
| New-release update from remembered source | 3 |
| Current-version repair and complete-install no-op | 4, 10, 11 |
| Execute-plan verifies rather than configures; retained hooks and unavailable coverage | 5, 6, 7 |
| Native Cursor delivery and compatibility coexistence | 6; unresolved compatibility evidence closed before publication in 12 |
| Native Claude delivery; unchanged Codex adapter evidence | 7 |
| Published release | 12 |
| Ordinary self-update and committed configuration | 13 |

## Remaining work after execution retrospective

Slices 1–7 retain their completed statuses and original evidence. The retrospective
adds corrective Behavior Slices 8–11; release and adoption are now Slices 12–13.
The source story and its exclusions are unchanged. Each correction owns one
observable refusal, adoption, no-op, or repair outcome and a focused proof boundary.
Numeric sizing and timing policy remain excluded by the recorded human direction;
no execution-time guarantee or additional refinement pass is claimed.

Slice 6's native Cursor delivery evidence remains useful, but compatibility
activation/invocation is not established by the retained artifacts; Slice 12
must close that specific acceptance gap before publication. Claude and Codex
proof may be reused where unchanged. The separate standalone-updater acceptance
remains a conditional release dependency. Release version selection stays deferred
to Slice 12. Retrospective planning does not authorize executing the corrections.

## Execution retrospective (2026-09-09)

Reviewed SEED-001 Story 8 from the original plan at `b63b9da`, followed by the
execution context recorded in `7e11605`. The delivered aggregate boundary is
`git diff b63b9da 1e7ea5a`; its commits are contiguous and all relate to this
execution. Current `HEAD` (`e1bb809`, merge only) has the same tree as `1e7ea5a`;
there are no later fixes to the findings below. The pre-existing perspective
change `3520b99` and backlog work `b63b9da` are excluded from the product diff.
Planning edits and native evidence are provenance, not product-quality defects.

| Included commit | Reason |
| --- | --- |
| `7e11605` | Slice 1 hook registration and installer proof |
| `34c59f4` | Slice 2 shared-settings merge policy and proof |
| `a56e7ab` | Repair installer fixture/module and Node dependencies |
| `5ed978d` | Slice 3 ordinary release-update integration and proof |
| `17470ce` | Slice 4 equal-version registration repair and proof |
| `d545318` | Repair affected force-update proof and updater guidance |
| `4dfe340` | Slice 5 readiness-only observation guidance and walkthrough |
| `2b09e3f` | Force-update assertion diagnostics and execution evidence |
| `672fc1a` | Capture force-apply failure diagnostics |
| `f2c96bf` | Trace force-update proof failure |
| `7318812` | Correct force-proof hook-message distinction and apply handling |
| `dc6e1bb` | Repair invalid-release refusal and apply temporary cleanup |
| `26a4eb7` | Slice 6 installer-created Cursor native acceptance evidence |
| `1e7ea5a` | Slice 7 update-created Claude native acceptance and Codex reuse |

### Findings and retained proof

- **R1 — P1, unsafe destination writes.** In
  `src/install/open-dough-register-hooks.mjs:isSafePath` (lines 62–80),
  `existsSync` skips a dangling symlink before `lstatSync`. A disposable real
  `bash install.sh --target <fixture> --source <repository>` returned 0 and
  created a file outside its target through `.cursor/hooks.json` pointing to
  a nonexistent sibling file. Preflight/apply independently reproduced this.
  Slice 8 owns refusal before any target or outside write.
- **R2 — P2, unsafe adoption of managed entries.** In
  `open-dough-register-hooks-merge.mjs`, `classifyManagedCommand` treats an
  edited command as unrelated, `foundExact` does not reject duplicates, and
  `mergeClaudeEvent` ignores managed wrapper scope. Direct `mergeDocument`
  checks showed a known Cursor command plus ` --local` retained alongside a
  newly appended exact handler; two exact handlers retained; and a Claude
  PostToolUse handler restricted to `matcher: "Read"` adopted unchanged.
  The latter omits the required Bash readiness boundary. The existing test
  comment says timeout/command conflict, but its fixture only changes timeout.
  Slice 9 owns the complete adoption/refusal decision.
- **R3 — P2, serialization mistaken for semantic change.** `deepEqual` compares
  `JSON.stringify` output and `planHost` compares original bytes to pretty JSON.
  Reordering only `timeout` and `command` produced `conflicting-managed-hooks`;
  compact complete settings returned `repair` from the CLI status mode.
  Equal-version apply therefore either refuses equivalent settings or rewrites
  already complete shared files. Slice 10 owns semantic no-op proof.
- **R4 — P2, repeat install skips missing registration.** `install.sh` lines
  200–205 and 232 guard all hook work with `needs_payload_writes`. A disposable
  real install → delete `.cursor/hooks.json` → repeat install returned 0 with
  both roots “already current” and left the settings file missing. This breaks
  the story's installation-completeness promise even though updater repair
  exists. Slice 11 owns the direct installer journey.
- **R5 — P2, compatibility acceptance is not established.** Cursor's retained
  `native-result.json`/`failure-result.json`, prompts, settings snapshots, and
  native result describe both settings files being present and successful
  native delivery. They do not establish active Claude compatibility or an
  actual invocation/payload exercising `ci-host-hook.mjs`'s `cursor_version`
  guard. This is an evidence gap, not a demonstrated runtime failure. Under
  ADR 0005 and original Slice 6 proof, close only that condition before release
  in Slice 12; preserve the already demonstrated native outcomes.

Focused review checks used Node imports/CLI and disposable real installer targets;
all temporary fixtures were removed. No broad suite or native host session was
run, and no implementation changed. Findings remain at current HEAD. Reviewed
aggregate refactoring smells, interim nonempty-map refusal removal, fixture
inventories, guidance, and CI-repair residue: no additional consequential
standalone refactor or story-scope change is justified. Retained force-apply
diagnostics still explain real failures; historical fragment-free fixture support
has a caller. No repository file-size limit was found; none was imported.

Learning: normal-shaped hook fixtures did not exercise effective wrapper scope,
command edits, dangling links, serialization equivalence, or repeat-install
completeness. Preserve these outside-in boundaries in the owning corrective
slices instead of accepting successful happy-path registration as complete proof.
The external skill's project-specific `.cursor/agent-map.md` and rules are absent
here; this plan, AGENTS.md, and installed Dough planning/refactor guidance supplied
the applicable repository context. Process retrospective was explicitly skipped.
This is an in-place plan update; corrective changes have not been executed,
committed, or pushed. Release/adoption being pending is not itself a finding.

## Execution evidence

CI observer: mailbox `/tmp/dough-ci-501/watch-AMvjtz`, workflow `ci.yml` / `CI`,
branch `execute/031-register-ci-host-hooks`. Host bridge readiness unavailable in
this worktree (no `.cursor/hooks.json`); continuing without promised native
notification coverage. Check mailbox/gh for failures after pushes.

Resumed observer: Codex yielded cell `14`, mailbox
`/tmp/dough-ci-501/watch-96olSi`, workflow `ci.yml` / `CI`, branch `main`,
coordinator `root`, checkout `/Users/terryyin/git/open-dough`. Reuse through all
remaining pushes and stop it at completion or a decision stop.

### Slice 1
Delivered commit `7e11605`. Focused proof `bash tests/install-all-tools.sh` pass.

### Slice 2
Merge-aware registration; focused proofs
`bash tests/install-ci-host-hooks.sh` and `bash tests/install-all-tools.sh` pass.
Delivered commit `34c59f4`.

### CI repair (after Slice 1/2)
Failure on `7e11605` run 34319873573 (test job): Node missing from
restricted-PATH native-runner fixture; delivery fixture omitted install `*.mjs`.
Repair at HEAD keeps Node required for real installs; fixtures updated.
Focused proofs: `bash tests/native-runner-failures.sh`,
`bash tests/native-delivery-updated-use-adapters.sh`, `bash tests/install.sh`.

Failure on `a56e7ab` run 34320901077: public-payload/omit enumerations omitted
host settings; older execution-payload fixtures lacked hook fragments; installer
`*.mjs` copy used non-portable `compgen`. Fixed with Slice 3 delivery.

### Slice 3
Ordinary remembered-SOURCE upgrade registers/adopts hooks; host-conflict refusal
before replacement. Focused proof `bash tests/execution-payload-update.sh` pass.

### Slice 4
Equal-version repair for missing hook entries; intact install no-op; conflict
refusal. Focused proofs `bash tests/update-skip-verified.sh` and
`bash tests/update-refuses-unverifiable.sh` pass.

### Slice 5
Execute-plan verifies readiness and manages observer without writing settings;
unavailable coverage continues without a monitoring promise. Source guidance
updated; walkthrough assertions and Slice 6/7 live-proof ownership recorded in
this slice. Focused reuse: `node --test` on `ci-host-hook.test.mjs`,
`ci-cursor-lifecycle.test.mjs`, `ci-claude-lifecycle.test.mjs` — 20 pass.
Delivered in commit `4dfe340`.

### CI repair (after Slice 5)
Failure on `7318812` run 34325989974 (`tests/apply-temp-cleanup.sh`): invalid
highest release could still surface resolved output after checkout cleanup, then
`set -e` aborted before removing a `local` apply `work_root`, leaking TMPDIR on
bash 5. Fixed fail-closed `fetch_resolved_release` and non-local apply work-root
cleanup. Focused proof `bash tests/apply-temp-cleanup.sh` pass (also
`update-force-restores-latest.sh`, `update-skip-verified.sh`).

### Slice 6
Installer-created Cursor hooks: native readiness, controlled failure delivery, and
unavailable coverage without settings rewrite. Evidence retained under
`.planning/quick/031-register-ci-host-hooks/evidence/cursor/`.

### Slice 7
Update-created Claude hooks: ordinary remembered-SOURCE upgrade registered hosts;
native readiness and controlled failure delivery (attempt 1 permission stop retained;
attempt 2 delivered). Codex Quick 027 proof reused as applicable.

### Slice 8
Dangling host settings files and parents now fail as
`unsafe-hooks-destination` before installer writes, including with `--force`.
Focused proof `bash tests/install-ci-host-hooks.sh` passed.
