# Update Open Dough to the latest release only when needed

Status: implementation delivered for leaves 1–16, 2026-09-06 — **native
acceptance 17–34 and released self-use 35–42 remain pending**.
Focused installer checks and `npm test` / `npm run lint` passed. Helper
boundary, no-write observation, and failure seams were settled in this file
during execution rather than by a separate refinement pass.

Source: [SEED-001, Story 5](../../seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed).
Previous outcome: [Story 4](../004-versioned-updates/PLAN.md).
Following outcome: [Story 6](../006-show-update-changelog/PLAN.md).

## Execution outcome so far

Shared callable helper: `src/install/open-dough-release.sh`. Clone any
checkout that contains that script, then `pin-latest` / `apply` resolve latest
with `git ls-remote` against the supplied URL so default-branch HEAD cannot
win. `apply` fetches the pinned commit once, compares the selected record, and
calls `install.sh` only for install, upgrade, unknown, or explicit `--force`.
`OPEN_DOUGH_TRACE` plus a destination write-guard (mode bits and mtime) prove
equal-version and newer-installed no-ops. `OPEN_DOUGH_INSTALL_FAULT=copy|verify`
injects failure after replacement starts. Genuine `v0.1.0` files bootstrapped
with `--force` receive the candidate latest record.

| Leaves | Status | Proof |
| --- | --- | --- |
| 1–3 | done | `tests/install.sh`, `tests/install-omits-internal.sh` |
| 4–7 | done | `tests/install-latest-release.sh` |
| 8–16 | done | `tests/update-when-needed.sh` |
| 17–34 | pending | native Codex 0.153.4, Cursor, and Claude Code 2.1.263 sessions |
| 35–42 | pending | maintainer-chosen version, publication, Open Dough self-use |

## Goal and scope

A developer installs the latest released Open Dough guidance for the selected
tool, updates an older or unknown installation directly to latest, and avoids
rewriting an already-current installation. Demonstrate the outcome natively in
Codex, Cursor, and Claude Code with all integrations present, then use the real
released improvement in Open Dough itself.

Follow accepted [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
latest is the highest numeric release tag from the supplied URL. One resolved
commit supplies the installer, payload, source version, and dated release entry.
An invalid highest release cannot cause a lower-release or branch fallback.

Include independent installed records, ordinary repeat protection, explicit
forced reinstall, no downgrade during routine update, genuine legacy bootstrap,
truthful failure, and selected-tool/source identity in output. Preserve other
installations and records, unrelated project work, source and home guidance.
Internal skills and the repository acceptance guard remain undistributed.

Exclude automatic changelog presentation (Story 6), requested-version updates,
prereleases, automatic rollback, local-edit detection/merging/backup, source
persistence, global setup, synchronization, notifications, additional guidance,
and release automation. Manual reading of the tagged changelog is sufficient.
No new architectural decision is needed: ADR 0003 leaves record placement and
helper layout to implementation; no Accepted ADR is changed by this plan.

## Execution context and current decisions

- `install.sh` currently copies one shared `src/skills/dough-update/SKILL.md`
  into one selected directory. Extend that boundary instead of adding a second
  installer. Keep Bash and Git sufficient for adopters; Node is development-only.
- Use a plain numeric `VERSION` beside each installed `dough-update/SKILL.md`.
  A missing record means unknown; malformed content is an error. This is a
  local implementation choice, not a new release contract or source registry.
  Source `VERSION` and installed records have distinct roles.
- Keep host recognition and conversation in the shared skill. Use small shared
  Bash operations for release resolution/comparison/application where needed;
  introduce each within its first consuming Behavior. Do not maintain separate
  release selection algorithms in README, the skill, and the installer.
  Settled callable boundary: `src/install/open-dough-release.sh` (`pin-latest`,
  `fetch-release`, `apply`). No generic updater service or standalone detector.
  Equal-version no-write proof uses `OPEN_DOUGH_TRACE` plus destination
  write-guards. Copy/verify faults use `OPEN_DOUGH_INSTALL_FAULT` at the
  installer boundary only.
- Resolve/fetch once per operation and retain that commit through validation,
  comparison, and installation. Do not refetch latest between decision and copy.
  Inspect fetched executable content before running it. Temporary source writes
  are allowed on a no-op; selected installed files and records must not be touched.
- Preserve `--target`, `--platform codex|cursor|claude`, and explicit `--force`
  semantics. Routine update compares before any forced installer call. Force
  is an explicit repair/bootstrap operation, not the default equal-version path.
- `tests/install.sh` exercises real CLI installation with paths containing
  spaces, repeats, force, unsupported platforms, and sentinels. Extend these
  checks; do not replace them with mocks of the algorithm.
  `tests/install-omits-internal.sh` enumerates all installed output and currently
  allows `SKILL.md` plus `VERSION`; expected records were updated with the
  installed version file.
- `scripts/test.sh` discovers every shell test. Add focused capability-named
  fixture checks as behaviors arrive. Keep changed shell lint-clean with the
  existing ShellCheck/shfmt settings. Run focused checks per leaf; run the full
  suite and lint once at release readiness, or sooner if a new concern warrants it.
- Update each affected README instruction and assertion in its owning behavior
  leaf, including Codex/Cursor/Claude installation, updater, bootstrap, and
  distribution sections. Never leave default-branch instructions promising the
  new behavior after switching those entry points to releases.
- Shipped `v0.1.0` is a genuine unversioned-installer/old-skill baseline. Use its
  actual files for bootstrap evidence. Candidate fixture releases must contain
  the candidate implementation; do not assume tagging a version manufactures
  version-aware behavior in the old payload.

## Outside-in proof and promise ownership

Use disposable local Git repositories containing tagged committed payloads and
notes. Fixture `0.1.2`/`0.1.10` releases are private test data, never public tags.
Create fixture setup within the first behavior that consumes it; no preparation
slice precedes usable behavior. CLI checks run outside the source directory.

For each installer outcome, exercise all three platform flags with all three
copies/records and unrelated sentinels present where applicable. Observe only
the selected destination changing. Native rows below additionally prove host
selection and skill application; CLI success cannot substitute for those rows.

| Contract / observation | Owning leaves |
| --- | --- |
| Verified released payload and per-tool record; record written only after verification | 1; failure boundaries 14–15 |
| Repeat warning/no writes and explicit force replacing only selected copy | 2–3, including all platform flags |
| Supplied URL wins over target remote; numeric latest wins over tag date and branch; one tag/commit through operation | 4; native install 17–19 |
| Fetch failure, no numeric tags, invalid highest metadata, no fallback | 5–7 |
| Equal version: no installer invocation or target writes, even with untagged or local text differences | 8; native 20–22 and 40–42 |
| Older skips intermediate releases and installs latest once | 9; native 23–25 |
| Missing record bootstraps once without inferring another installation's version | 10; native 26–28; equality proof reused only after that successful transition |
| Newer installed version preserved | 11; native 29–31 |
| Malformed record is rejected, not treated as unknown | 12 |
| Requested-version update rejected, latest-only interface | 13 |
| Copy/verification failure never advances record or claims success; partial state and recovery explained | 14–15 |
| Genuine old skill transitions by explicit forced bootstrap, followed by fresh native reuse | 16; native 32–34, then corresponding 20–22 proof against the bootstrapped result |
| Native discovery, correct running host/path, invocation with all integrations present | 17–34, separately for each tool |
| Source/tool/path, old or unknown version, resolved tag/commit, truthful outcome, fresh-session instruction | Each success/refusal leaf owns its output; native transcripts 17–34 |
| Preserve other copies/records, source, unrelated work, and home guidance; omit all internal skills and guard | 1–3 fixture enumeration/sentinels; every mutating native row compares before/after scope |
| One shared behavior and minimal native adaptation | Changes to shared source in 4, 8–16; separate discovery evidence 17–19 |
| Documentation follows delivered behavior; manual notes only | Owning leaves 1, 4, 8–16; documented commands are used in 17–34 |
| Actual later release, unchanged earlier tag, fresh-fetch identity | 35–36 |
| Released self-use for each actual installation and fresh-session no-op | 37–42 |

No-write proof requires evidence of no installer call and no write to installed
files/records, including rewriting identical bytes. Use an invocation trace and
an observable write guard/event trace at the target boundary; final byte equality
or `git diff` alone does not suffice. Select the smallest working mechanism in
leaf 8 and reuse it in native no-op observations. Do not claim a trace of one
helper proves an agent did not write the target by another route.

Failure proof must exercise a real failed copy or verification through the
production entry, with fault injection at that boundary only. Assert exit/output,
record preservation, and reported partial-state recovery. Avoid broad corruption
suites, mocking the whole installer, or building a rollback framework.

## Ordered implementation leaves

Every numbered leaf is Type **Behavior**, Status **planned**. Each includes its
implementation, focused verification, relevant documentation, and local cleanup.
No separate Structure slice is justified by the current small installer.
Target about five minutes per leaf; estimates are hypotheses, not guarantees.
Stop-safe means a passing focused check and truthful documented supported scope;
no leaf ends with active failing tests or a claim that unobserved native behavior
works. A broader multi-beat check stays excluded as WIP until green.

### 1. Record a successfully installed tagged snapshot
Type: Behavior
Status: planned
Behavior: An empty selected target and an already-resolved valid tagged candidate
checkout → run the existing installer → verified payload and its numeric installed
record describe the same snapshot.
Proof: Real installer fixture across the three platform flags, byte comparison,
record check, complete output enumeration, and preserved sentinels. Extend both
existing installation tests in this leaf. Source metadata is checked before copy;
record creation follows successful verification.
Sizing: about five minutes, medium confidence. Supplied-URL latest selection is
not yet delivered; manual validated checkout is the useful interim entry until 4.

### 2. Preserve an existing installation on ordinary reinstall
Type: Behavior
Status: planned
Behavior: Selected guidance/record already exist → ordinary installation → warn
and stop without changing either.
Proof: Existing repeat test extended to the record, including local skill edits
and all three platform flags; observe no target writes.
Sizing: about five minutes, high confidence; retains an existing behavior.

### 3. Replace the selected installation when force is explicit
Type: Behavior
Status: planned
Behavior: Existing selected copy contains edits → explicit force with a validated
release → only that payload and record become the verified release.
Proof: Existing forced-replacement fixture extended to records and other-tool
sentinels; full output enumeration still excludes internal guidance.
Sizing: about five minutes, medium confidence; depends on 1–2.

### 4. Install numeric latest from the supplied repository
Type: Behavior
Status: planned
Behavior: Empty selected target, supplied repository with valid `0.1.2` and
`0.1.10`, reverse tag dates, and divergent branch HEAD → documented install →
installs and records only the `0.1.10` tagged snapshot.
Proof: Invoke the real documented entry against the fixture URL, with a different
target remote; assert selected payload, record, reported URL/tag/commit, and
preserved target scope. Move a source branch after resolution to show the
operation continues using the pinned commit.
Sizing: refinement recommended. The shared resolver's callable boundary and
bootstrap access from an uninstalled project are not yet settled. Keep source
resolution inside this usable install outcome, not a detector-only feature.

### 5. Leave the installation untouched when fetching fails
Type: Behavior
Status: planned
Behavior: Supplied source cannot be fetched → install/update → actionable fetch
failure before any target write.
Proof: Real entry against a missing local fixture remote; invocation/write trace
and preserved payload/record; no fallback to the target project's remote.
Sizing: about five minutes, medium confidence; depends on 4.

### 6. Refuse a source without numeric releases
Type: Behavior
Status: planned
Behavior: Fetchable repository contains branch content but no supported numeric
release tag → install/update → report no release and preserve target.
Proof: Real entry against a branch-only fixture; an unrelated or prerelease tag
does not qualify; assert no fallback installation.
Sizing: about five minutes, medium confidence; depends on 4.

### 7. Refuse an invalid highest release
Type: Behavior
Status: planned
Behavior: Highest numeric tag has mismatched source version or lacks its dated
release entry → install/update → reject that release before target mutation.
Proof: Focused metadata fixture variations through the same real entry, retaining
a lower valid release to prove it is not silently selected. Validate only the
chosen entry; Story 6 owns skipped-note range presentation.
Sizing: about five minutes, medium confidence; depends on 4. Extend the validation
already used by 1 rather than adding a competing metadata reader.

### 8. Leave a current installation unwritten
Type: Behavior
Status: planned
Behavior: Version-aware selected copy records latest → invoke update → report
current without installer invocation or any installed-file/record writes.
Proof: Real update entry with changed untagged source and a harmless local skill
text edit; observe installer calls and writes, not merely final hashes. Tie the
shared skill to this entry and preserve host/URL capture.
Sizing: refinement recommended. The skill-to-shell boundary and portable no-write
observation need a concrete sizing pass; neither can be replaced with a unit
comparison test. Depends on 4–7.

### 9. Advance an older installation directly to latest
Type: Behavior
Status: planned
Behavior: Candidate updater records `0.1.0`; released fixture latest is `0.1.2`
with `0.1.1` present → update → apply latest once and record verified `0.1.2`.
Proof: Real update entry, one installer invocation, latest bytes/record, old/new
output, preserved other copies. No intermediate install or inline-notes dependency.
Sizing: about five minutes, medium confidence; depends on 3 and 8.

### 10. Establish a version for an unknown installation
Type: Behavior
Status: planned
Behavior: Candidate version-aware skill lacks its selected record → update →
explain unknown and apply/record latest once.
Proof: Real update entry with different records in other platform directories;
assert neither is borrowed. Reuse 8's equal-version proof on the resulting state
rather than building another no-op implementation.
Sizing: about five minutes, medium confidence; depends on 9.

### 11. Preserve an installation newer than the source
Type: Behavior
Status: planned
Behavior: Selected record is `0.2.0`, source latest `0.1.2` → routine update →
explain newer installed state and perform no downgrade or target writes.
Proof: Real entry with call/write observation; source identity and both versions
remain visible in the refusal output.
Sizing: about five minutes, medium confidence; depends on 8.

### 12. Reject a malformed installed record
Type: Behavior
Status: planned
Behavior: Selected VERSION exists but is not a numeric release version → routine
update → explain invalid record and preserve target instead of treating it as unknown.
Proof: One focused malformed-record fixture through the update entry, checking
no installer invocation or record repair. Missing-record behavior remains 10.
Sizing: about five minutes, medium confidence; depends on 10.

### 13. Reject a requested-version update
Type: Behavior
Status: planned
Behavior: Caller requests a specific update version → skill/entry → explain
latest-only support before applying anything.
Proof: Focused unsupported CLI-input check plus one native skill request in the
first available tool; no silent ignoring or branch/version selection. Apply the
same shared wording in all three entries; host discovery remains 17–19.
Sizing: about five minutes, medium confidence; depends on 8.

### 14. Report a failed replacement without advancing the record
Type: Behavior
Status: planned
Behavior: Applying an eligible release fails after replacement starts → update →
report failure and possible partial files, retain the last successful record,
and name explicit forced reinstall as recovery.
Proof: A real copy failure injected at the application boundary; capture nonzero
result, unchanged old record, and absence of success wording. No rollback promise.
Sizing: refinement recommended. Pin down a deterministic partial-copy failure
without broad filesystem fault machinery. Depends on 9.

### 15. Refuse success when installed payload verification fails
Type: Behavior
Status: planned
Behavior: Copy returns but installed bytes fail verification → update → report
failed verification/possible partial state without writing a new record.
Proof: Focused verification-boundary fault through the real application entry;
assert record preservation and forced-reinstall recovery explanation.
Sizing: refinement recommended. Reuse 1's verification and 14's truthful failure
path; choose a small fault seam rather than adding a second installer.

### 16. Bootstrap the genuine legacy installation explicitly
Type: Behavior
Status: planned
Behavior: Actual skill/installer files from `v0.1.0` are installed without a
record → follow the documented explicit forced-reinstall journey → latest
candidate released payload and its first record are installed for that tool.
Proof: Exercise the README bootstrap instructions on the genuine baseline;
report unknown, not assumed `0.1.0`. Old skill write restrictions remain visible
in the fixture. Fresh native discovery and invocation are separate leaves below.
Sizing: refinement recommended. Confirm how the shared release resolver is
available before the new updater exists and align with 4; do not assume the old
skill can rewrite its contract. Depends on 3–15.

## Ordered native acceptance leaves

Each table row is an independent Behavior leaf with Status **planned**, not a
platform-sized batch. Execute in numeric order. Source behavior must be available
before its native row. Fixture preparation reuses the preceding focused checks.
Perform a fix only within the outcome being observed; if native evidence changes
the remaining implementation, update its affected leaves and rerun invalidated
proof. Do not repeat unaffected evidence.

For each row, record tool/version, selected discovery path, actual invocation,
fixture URL/tag/commit, before/after target state, and session/transcript reference.
Run with all integrations present; compare other copies/records, source, project
sentinels, and home guidance. A text claim by the tool is insufficient without
observing the installed result. All evidence is currently **pending**.

| Leaf / capability | Type | Status | Behavior: pre-condition → trigger → result | Outside-in proof |
| --- | --- | --- | --- | --- |
| 17. Discover a fresh Codex installation | Behavior | planned | No Codex copy → documented install → latest candidate skill is natively discoverable | Actual Codex skill discovery identifies `.agents/skills/dough-update`; selected record matches pinned release; inspect preservation. |
| 18. Discover a fresh Cursor installation | Behavior | planned | No Cursor copy → documented install → latest candidate skill is natively discoverable | Actual Cursor discovery selects `.cursor/skills/dough-update` with `.agents` also present; inspect record and preservation. |
| 19. Discover a fresh Claude Code installation | Behavior | planned | No Claude copy → documented install → latest candidate skill is natively discoverable | Actual Claude Code discovery selects `.claude/skills/dough-update`; inspect record and preservation. |
| 20. Keep Codex current without writes | Behavior | planned | Codex records latest → fresh-session `$dough-update` → current/no writes | Native invocation trace plus target write observation from 8; verify source/tool/version output. |
| 21. Keep Cursor current without writes | Behavior | planned | Cursor records latest → fresh-session `/dough-update` → current/no writes | Same independent observation for Cursor, including correct selected path. |
| 22. Keep Claude Code current without writes | Behavior | planned | Claude records latest → fresh-session `/dough-update` → current/no writes | Same independent observation for Claude Code. |
| 23. Advance Codex to latest once | Behavior | planned | Codex older → `$dough-update` → latest installed directly | One native update; selected latest bytes/record and one installer call; other copies unchanged. |
| 24. Advance Cursor to latest once | Behavior | planned | Cursor older → `/dough-update` → latest installed directly | Independent Cursor observation of the same transition. |
| 25. Advance Claude Code to latest once | Behavior | planned | Claude older → `/dough-update` → latest installed directly | Independent Claude Code observation of the same transition. |
| 26. Establish Codex's unknown version | Behavior | planned | Candidate Codex skill has no record → `$dough-update` → latest recorded with unknown baseline stated | Native transition; do not infer another copy's record. Reuse 20 on resulting state. |
| 27. Establish Cursor's unknown version | Behavior | planned | Candidate Cursor skill has no record → `/dough-update` → latest recorded | Independent Cursor transition; reuse 21 on resulting state. |
| 28. Establish Claude Code's unknown version | Behavior | planned | Candidate Claude skill has no record → `/dough-update` → latest recorded | Independent Claude Code transition; reuse 22 on resulting state. |
| 29. Preserve a newer Codex installation | Behavior | planned | Codex newer than source → `$dough-update` → no downgrade | Native refusal and call/write observation; selected record unchanged. |
| 30. Preserve a newer Cursor installation | Behavior | planned | Cursor newer than source → `/dough-update` → no downgrade | Independent Cursor refusal and preservation observation. |
| 31. Preserve a newer Claude Code installation | Behavior | planned | Claude newer than source → `/dough-update` → no downgrade | Independent Claude Code refusal and preservation observation. |
| 32. Bootstrap legacy Codex | Behavior | planned | Genuine legacy Codex → explicit documented forced bootstrap → candidate latest installed/recorded | Native installation session uses supplied release and selected path; retain result for fresh-session 20. |
| 33. Bootstrap legacy Cursor | Behavior | planned | Genuine legacy Cursor → explicit documented forced bootstrap → candidate latest installed/recorded | Independent Cursor session; retain result for fresh-session 21. |
| 34. Bootstrap legacy Claude Code | Behavior | planned | Genuine legacy Claude → explicit documented forced bootstrap → candidate latest installed/recorded | Independent Claude Code session; retain result for fresh-session 22. |

Sizing: 17–31 target about five minutes of active work each, medium confidence,
assuming the native tools and reusable fixtures are available. A single native
session may take longer to run; record that external runtime separately rather
than promising a completion time. Leaves 32–34 inherit the unresolved bootstrap
boundary from 16 and need refinement. Access failures leave the relevant row
pending; a platform flag passed to Bash never closes native acceptance.

## Ordered released self-use leaves

### 35. Identify the delivered updater as a new release
Type: Behavior
Status: planned
Behavior: Candidate behavior and native acceptance have passed → prepare/finalize
a maintainer-chosen version greater than existing releases → immutable local tag
identifies committed updater, matching VERSION, and truthful dated notes.
Proof: Existing internal release workflow; inspect tag peel/metadata/payload and
unchanged `v0.1.0`. Run `npm test` and `npm run lint` before tagging; exclude
unrelated work from commits. Notes explicitly leave inline changelog for Story 6.
Sizing: about five minutes active work, medium confidence, using the completed
release skill; test runtime may explain longer elapsed time. The real version is
not selected by this planning task. Depends on 1–34 and all required evidence.

### 36. Make that exact release available from the supplied repository
Type: Behavior
Status: planned
Behavior: Identified local release is ready for publication → ordinary authorized
Git publication → fresh fetch resolves the same tag/commit, metadata, and payload.
Proof: Fresh independent fetch; compare tag peel, VERSION, notes, and payload;
no force-push or artificial public fixture tags.
Sizing: about five minutes active work, medium confidence; network wait is an
external runtime. Depends on 35. This plan itself performs no publication.

Each following row is an independent Behavior leaf, Status **planned**. Use the
actual Open Dough project and its supplied repository URL, preserving its work
and other installed integrations. Existing unversioned copies use explicit
bootstrap; a then-version-aware older copy uses the normal update path.

| Leaf / capability | Type | Status | Behavior: pre-condition → trigger → result | Outside-in proof |
| --- | --- | --- | --- | --- |
| 37. Adopt the real release in Codex | Behavior | planned | Actual Codex copy → authorized bootstrap/update → published release installed | Native session, real source/tag/commit, selected bytes/record, unchanged other installations and source. |
| 38. Adopt the real release in Cursor | Behavior | planned | Actual Cursor copy → authorized bootstrap/update → published release installed | Independent Cursor session with real identity and preservation evidence. |
| 39. Adopt the real release in Claude Code | Behavior | planned | Actual Claude copy → authorized bootstrap/update → published release installed | Independent Claude Code session with real identity and preservation evidence. |
| 40. Reuse the released Codex updater | Behavior | planned | 37 complete → fresh-session `$dough-update` → current/no writes | Discovery plus native invocation using 20's observation method on the actual release. |
| 41. Reuse the released Cursor updater | Behavior | planned | 38 complete → fresh-session `/dough-update` → current/no writes | Independent discovery/invocation and no-write observation as in 21. |
| 42. Reuse the released Claude Code updater | Behavior | planned | 39 complete → fresh-session `/dough-update` → current/no writes | Independent discovery/invocation and no-write observation as in 22. |

Sizing: about five minutes active work per row, medium confidence once fixture
journeys have passed; record native runtime separately. All six rows are pending.
Only after their evidence passes may the story move to Recently done.

## Readiness, inherited proof, and learnings

**Refinement recommended: 4, 8, 14–16, 32–34.** Each named leaf has one intended
outcome, but its concrete integration or observation path still has low sizing
confidence and could exceed Donut's ten-minute hard limit. Refine those paths in
this same file before execution; do not hide the uncertainty behind an estimate
or convert it into helper-only product stories. Other leaves have an initial
single-proof-loop sizing hypothesis; no execution-time guarantee is made.

The earlier M / 1–2 hour story estimate is not supported by this breakdown.
Native evidence and release self-use add substantial elapsed work. Reassess after
refinement; do not silently drop platforms or fold Story 6 into this delivery.
During execution, reassess at five minutes and refine at ten unless one focused
check's runtime alone explains the overrun. Keep updates/evidence in this PLAN.

The original aggregate-plan mapping remains in the seed. Its install/record
obligations now map to 1–7 and 17–19; update decisions to 8–13 and 20–31; failure
to 14–15; legacy to 16 and 32–34; later-release/self-use to 35–42. Changelog-text
obligations stay exclusively in Story 6. No completed evidence was removed.

Prior tests establish where to extend repeat/force/coexistence checks, not proof
of the changed record contract. Prior native unconditional updates and Story 4's
release workflow do not prove version-aware application. Reuse release-tool
behavior only while that internal skill remains unchanged; gather fresh release
identity and updater evidence for this story.

Key learning retained: shipped old skills constrain writes to SKILL.md, and the
initial source release did not record installed versions. The separate missing-
record and genuine-legacy journeys are both necessary. All product and native
evidence in this plan remains pending; planning checks establish document
consistency only.
