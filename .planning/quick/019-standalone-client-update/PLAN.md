# Release the standalone client installation and update workflow

Status: not for execution — reconsider the underlying story first.
Keep this plan as historical input. Update it only if it remains relevant after
story reconsideration, through deferred
[SEED-007 Story 4](../../seeds/SEED-007-cross-tool-validation.md#separate-native-acceptance).
This reconciliation does not block the test/infrastructure stories.
[SEED-007 Story 3](../../seeds/SEED-007-cross-tool-validation.md#accept-standalone-client-workflow)
will refine native acceptance against the current product story and candidate;
the native leaves below are not its fixed scope or an executable second matrix.
[Accepted ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
and this status supersede the older readiness notes below.

## Source

- [SEED-001 Story 7](../../seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update),
  first in the product backlog. Its E1–E7 examples are the acceptance boundary.
- Owner request: recheck dramatically changed scope despite historical refinement,
  then plan and refine slices if no story question remains. No scope blocker found.
- Inspected clean source: `d32a9c5a3c788a1ae23d871173a6eff5fed9a32f`.
- Borrowed without installing Donut's
  [story-refinement](../../../../doughnut/.agents/skills/story-refinement/SKILL.md),
  [slice-planning](../../../../doughnut/.agents/skills/slice-planning/SKILL.md),
  [slice-plan-refinement](../../../../doughnut/.agents/skills/slice-plan-refinement/SKILL.md),
  [planning](../../../../doughnut/.cursor/rules/planning.mdc), and
  [problem-decomposition](../../../../doughnut/.cursor/rules/problem-decomposition.mdc)
  at `f2a15382e10c4c4cbe8272256a1d5bbecfe6576e`.
- [Accepted ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
  preserves human decision ownership. [Accepted ADR 0003 — Tagged release
  versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  requires maintainer-chosen numeric versions and immutable tags, with no branch
  fallback. [ADR 0004](../../../docs/adrs/0004-client-installation-and-update.md)
  is Proposed; the owner's recorded direction supplies scope. No conflict,
  exception, metadata disagreement, or ADR status change was identified.

## Goal and scope

Finish and release the existing client workflow so a client can install, use
guidance standalone, and receive a newer verified payload by invoking the native
updater without repeating its source URL. Self-adopt the published release in
Open Dough, then hand off to Donut adoption. Keep the story's E1–E7 examples in
its home; the proof map below assigns their remaining work.

Change only the existing installation record, updater decisions/instructions,
their necessary documentation and tests, and the release/self-use outcome.
Current payload: `dough-update/SKILL.md` and `dough-adr-awareness/SKILL.md`.
No new everyday support script is needed; release helpers stay temporary source
maintenance code. The shared behavior and existing native roots remain intact.

Excluded: Plan 018's remaining tooling/archive cleanup, new configuration,
generic manifests or payload-history discovery, arbitrary old-layout migration,
local-practice matching/replacement, merging or rollback machinery, packages,
new extractions, automatic changelog display, Donut/client edits, or a second
public release manufactured for an update demonstration.

### Prior-plan reconciliation

| Existing ownership | Disposition here |
| --- | --- |
| Completed Plans 004 and 011; deleted spent install/update/publication plans | Historical outcomes, not unfinished Story 7 leaves. Preserve them; their old edit-tolerant semantics do not prove the new contract. |
| Plan 018: 2b–2d removal of reusable adoption, 3b–3c two-skill delivery/use | Already recorded done; source agrees. No duplicate implementation. Source-only recognition remains descriptive; align evidence wording/links only where current docs would misstate delivery. |
| Plan 018: 4a–4g fixed retirement, truthful failure, legacy/native transitions | Preserve completed evidence at its revision. Reuse fixed retirement code; new records and update decisions require new affected transition proof. |
| Plan 018: 4d equal-version edited payload reported current | Keep the historical no-write observation. Replace the success expectation for edited content in leaf 6; do not erase the old evidence. |
| Plan 018: tooling/archive leaves 6–7 | Separate hardening work, not a gate for this release. Its Story 7 overlap/handoff is updated in place; ongoing execution retains its own statuses there. |
| Remaining Story 7 contract | No whole-story execution plan existed. This plan owns the remainder; completed cleanup is not moved or reset. |

## Execution context and current decisions

- Extend `install.sh`, `src/install/open-dough-release*.sh`, and
  `src/skills/dough-update/SKILL.md`. Update `README.md` and
  `docs/installation-and-updates.md` with each changed supported behavior.
  Do not edit tracked native copies to simulate a release; self-adopt later.
- Retain numeric `dough-update/VERSION`; add a small single-line
  `dough-update/SOURCE` beside it, per native installation. This is installation
  metadata, not configuration. Pass the supplied source through direct install
  and `apply`; never infer it from a target remote or temporary checkout path.
  Validate the new path using existing containment conventions. No permanent
  commit, checksum, fetched source, or recognition record is added.
- The updater selects its host/root before reading SOURCE. An explicit URL can
  initialize/bootstrap an installation; ordinary updates use the saved source.
  A conflicting supplied URL is refused without writes rather than silently
  changing provenance. Explicit forced replacement may use a supplied source
  and records that source after verification. No source-switching feature/UI.
- For recorded installations under this contract, fetch the exact recorded tag
  from the saved source as comparison data; verify tag/version/content before
  comparing the two fixed managed skill files. Do not execute the old installer
  or infer ownership from every file present under `src/skills/` (recognition
  still exists there). Missing/unverifiable data is a refusal. Use latest's
  inspected helpers for the operation, preserving pin/recheck/cleanup ownership.
- Existing releases v0.2.0/v0.2.1 lack SOURCE. They take the already-supported
  inspected forced bootstrap, not an ordinary history-reconstruction path.
  Missing VERSION/SOURCE on a partly existing installation is not a fresh install.
  Fresh means no managed installation; existing collisions retain refusal.
- Check integrity before a successful equal/current report or ordinary upgrade.
  Never downgrade a newer record. If its exact baseline cannot be fetched,
  report unverifiable without writes, rather than silently certifying it.
- Force skips old-content integrity, not latest-source inspection, payload
  validation, containment, or final verification. Retire only the existing fixed
  recognition path; preserve extra sidecars and all unrelated files. No future
  generic retirement framework is needed for these two fixed skills.
- Verify payload before recording success. Keep VERSION as the final success
  marker; a metadata-write failure must fail visibly. No whole-install atomicity
  or rollback guarantee is introduced. Updater/helper execution never commits
  or pushes client changes.

## Outside-in proof

| Promise / example | Owning leaves | Observable proof |
| --- | --- | --- |
| E1: complete native installation with remembered source | 1–2, 9a/10a/11a | Exact two-file payload plus VERSION/SOURCE; no recognition, internal skills/guard, or maintenance tree; offline installed guidance use. |
| E2: plain invocation reaches a real newer payload at saved source | 3–5, 9b/10b/11b | Source differs from target remote; fresh native invocation has no URL/force; changed payload and record match newer tagged fixture, client diff uncommitted. |
| E3: clean equal/no-write and newer/no-downgrade | 6; 15a/15b/15c for native current reuse | Shell matrix proves version policy across layouts; published native reuse proves the applicable real outcome. No installer trace or target content/mtime changes on skips; unverifiable newer record is not certified. |
| E4: edited, missing, malformed, or unavailable baseline refuses | 4–6; representative native edited-equal in 9c/10c/11c | Complete shell matrix plus each host's native obedience to refusal; non-success outcome with unchanged target snapshot. |
| E5: authorized force replaces complete payload | 2, 7, 9d/10d/11d | Latest verified content/source/version, fixed recognition absent, other roots/sentinels retained; faults never report success. |
| E6: bounded old-updater transition | 8, 9b/10b/11b | Old contract refusal is preserved; inspected forced bootstrap records source, fresh session performs ordinary no-URL update. |
| E7: publish then self-adopt | 12–13, 14a–15c | Published object/commit/tree verified independently; real native roots adopt it and fresh invocations use saved source. |
| Temporary maintenance, pinning, latest-only, truthful failures | 1–8, native leaves | Existing pin/stale-selection/failure tests extended only for new record/baseline paths; cleanup on success and failure, no branch fallback or persistent maintenance. |
| Shared behavior, containment, coexistence, human-owned commits | 1–8 and every native/self-use leaf | Same source installed in three layouts; full target/source/other-root sentinels and Git status show only selected allowed changes. |

Use existing shell boundary tests: `tests/install-*-public-payload.sh`,
`tests/install-repeat-force-public-payload.sh`, `tests/install-omits-internal.sh`,
`tests/update-when-needed.sh`, `tests/install-latest-release.sh`,
`tests/pin-and-inspect.sh`, `tests/apply-temp-cleanup.sh`, and the existing real
copy/retirement failure checks. Keep the fixture helpers small. The current
update fixture invents an older record not present among its tags; replace that
setup with an actual committed/tagged baseline, not an integrity bypass.

The cross-tool test migration is owned by
[SEED-007](../../seeds/SEED-007-cross-tool-validation.md) under Accepted ADR 0005.
Its infrastructure stories are separate from the client implementation; its
native acceptance story owns the prepublication matrix inventoried here.

## Ordered slices

Each leaf includes its focused check, affected caller/docs alignment, and local
cleanup. Target about five minutes; reassess at five and stop/refine at ten
unless a single focused test or external wait explains the overrun. Timing is
a hypothesis. No slice ends with red CI or advertises the whole story complete.

### 1. A fresh installation remembers its supplied source

Type: Behavior
Status: planned
Proof: Extend direct installer and pinned-install fixtures across the three
platform arguments: exact payload and VERSION/SOURCE, internal omission,
repeat/topology refusal, source preserved through `apply` and direct install.

Behavior: Clean target → inspected install with a supplied source → verified
complete installation records that source and version in only its native root.
Carry the URL through the existing installer call and align installation docs
and shared fixture assertions together. Reject missing/invalid source before
writes; treat it as inert data. Size: medium; one source-record path.

### 2. A failed replacement never reports a completed installation

Type: Behavior
Status: planned
Proof: Extend real copy/retirement and verification-fault cases to SOURCE;
exercise a record-write failure. Observe nonzero result and no success report;
payload failures leave previous records unchanged, metadata failure identifies
incomplete state. No unrelated path changes.

Behavior: Replacement or recording fails → run install/apply → truthful failed
outcome with no falsely advanced success claim. Reuse existing fault seams;
add only a narrow record-write case. Size: high; bounded failure contract.

### 3. An ordinary invocation uses the installation's saved source

Type: Behavior
Status: planned
Proof: Extend release fixture with a different target remote and an actual
newer payload; no-URL helper invocation uses SOURCE and updates it correctly.
Conflicting explicit URL refuses without writes; missing source requests the
bounded bootstrap. Native discovery proof belongs to 9b/10b/11b.

Behavior: Recorded unedited client → invoke updater without URL → select latest
from the saved Open Dough source and leave its update for review.
Change helper resolution, installed instructions, and updater docs together;
keep explicit URL bootstrap. Interim: leaves 4–6 add integrity guarantees before
this candidate can be released. Size: medium; one source-selection branch.

### 4. An edited older installation refuses ordinary replacement

Type: Behavior
Status: planned
Proof: In `tests/update-when-needed.sh`, install an actual tagged baseline,
edit one managed file, then select a newer release. Refusal leaves target and
records byte/mtime-identical; the unedited control upgrades to latest.

Behavior: Verifiable older installation → ordinary update → compare the two
managed files against its exact saved-source tag; replace only when unchanged.
Fetch baseline as data in owned temporary storage, using existing resolver
patterns and fixed paths. Keep fixture baseline and ordinary-success assertions
aligned in the same change. Size: medium; one compare-before-replace proof loop.

### 5. An unverifiable installation refuses without guessing

Type: Behavior
Status: planned
Proof: Focused variations of the same ordinary-update refusal: missing managed
file, missing/malformed VERSION/SOURCE, missing tag, unreachable baseline, or
tag/metadata mismatch. No target writes and temporary content cleaned.

Behavior: Existing installation lacks a trustworthy comparison → ordinary update
→ unsupported-baseline report, no automatic overwrite or fresh-install fallback.
Reuse leaf 4's preflight; retain malformed/latest selection errors. Size: high;
one refusal policy with data variations, no new fallback machinery.

### 6. Version skips do not certify edited content

Type: Behavior
Status: planned
Proof: Replace the old edited-equal success expectation in
`tests/update-when-needed.sh`: clean equal succeeds unwritten; edited equal
refuses unwritten; newer is never downgraded and unverifiable newer is reported
unsupported. Assert no installer trace and unchanged contents/mtimes.

Behavior: Equal/newer recorded installation → ordinary update → report only
verified state while preserving the selected installation without writes.
Reuse baseline validation before success reports. Size: high; one skip policy.

### 7. Explicit force replaces the selected installation with latest

Type: Behavior
Status: planned
Proof: Extend repeat/force and update tests for edited/missing/equal/newer records,
including absent baseline and supplied bootstrap source. Verify exact complete
latest payload, SOURCE/VERSION, fixed recognition retirement, and coexistence.
Keep latest fetch/inspection/topology failure cases unwritten.

Behavior: User explicitly authorizes force → use inspected latest → replace
selected managed content regardless of old integrity/version, without merging.
Align instruction wording and allowed write paths (including retirement) with
the real installer. Size: high; existing force branch with new record semantics.

### 8. The documented bootstrap reaches the revised contract once

Type: Behavior
Status: planned
Proof: Extend the existing deterministic delivery transition with genuine old
payloads, supplied-source inspected force, then fresh candidate updater use.
Verify source record and retired recognition; preserve old-updater refusal.

Behavior: Known legacy installation → follow documented inspected bootstrap →
revised installed updater can use its saved source in a fresh session.
Align `tests/support/dough-adr-awareness-release-transition.sh`, its shared
delivery harness, and README/installation instructions. Replace interim
retirement wording; source recognition's historical evaluation must link to
evidence without suggesting current installation. Size: medium; one transition.

### 9a. Codex uses a fresh installation with Open Dough unavailable

Type: Behavior
Status: planned
Proof: Fresh disposable Codex install → native discovery and explicit/architecture-
triggered ADR use → local guidance works with maintenance source inaccessible.
Record correct authority/conflict behavior and unchanged unrelated snapshots.
Reuse the applicable per-host discovery/application and ADR-behavior evidence
for unchanged boundaries. Run only the missing fresh-install/source-unavailable
proof; do not repeat the clear/conflict/automatic matrix when its boundary is
unchanged. Use the existing installed-use harness. Size high; native runtime
exception only.

Behavior: Fresh Codex installation → use ADR guidance natively with source
unavailable → correct local-only guidance behavior and preserved project state.

### 9b. Codex updates a bootstrapped installation through its saved source

Type: Behavior
Status: planned
Proof: Adapt `tests/dough-adr-awareness-codex-delivery-to-use.sh --native` to
the changed installation/update contract: legacy bootstrap → fresh
`$dough-update` with no URL or force → actual newer
fixture payload installed and available to fresh ADR use, uncommitted diff,
correct root/source record, cleanup and coexistence. Size medium; one native
delivery-to-use journey, external runtime may exceed ten minutes.

Behavior: Legacy Codex root after inspected bootstrap → fresh no-URL update →
newer saved-source payload is usable in the selected native installation.

### 9c. Codex reports ordinary update integrity without writing

Type: Behavior
Status: planned
Proof: One native `$dough-update` on an edited-equal installation → helper's
refusal is obeyed, complete snapshots unchanged, no inferred client remote or
automatic force. Leaves 4–6's shell fixtures cover clean-equal, missing-file,
unverifiable, and newer variations in every platform layout; do not multiply
those by native sessions. Use the existing native wrapper for this case and
record its evidence. Size high; one case, native runtime exception.

Behavior: Prepared Codex installation → ordinary native update → truthful
refusal without writes or attempts to bypass the helper's integrity decision.

### 9d. Codex honors an explicit forced update

Type: Behavior
Status: planned
Proof: Native explicit force on edited installation → exact latest complete
replacement and records, fixed obsolete file absent, unrelated roots intact,
no merge or automatic commit. Use the existing native wrapper. Size high;
one replacement proof, native runtime exception.

Behavior: Edited Codex installation → explicitly force update → verified latest
selected payload and record replace it without touching unrelated content.

### 10a. Cursor uses a fresh installation with Open Dough unavailable

Type: Behavior
Status: planned
Proof: Repeat 9a independently in Cursor's `.cursor/skills/` root, including
native discovery and explicit/architecture-triggered use. No Codex inference.
Size high; same one-use proof, native runtime exception.

Behavior: Fresh Cursor installation → native ADR use with source unavailable →
correct standalone guidance behavior.

### 10b. Cursor updates a bootstrapped installation through its saved source

Type: Behavior
Status: planned
Proof: `tests/dough-adr-awareness-cursor-delivery-to-use.sh --native` with 9b's
revised assertions; fresh `/dough-update` supplies no URL/force. Capture Cursor's
own transition/use and coexistence. Size medium; native runtime exception.

Behavior: Bootstrapped Cursor installation → fresh no-URL update → newer
saved-source payload is usable in Cursor's selected root.

### 10c. Cursor reports ordinary update integrity without writing

Type: Behavior
Status: planned
Proof: Run 9c's single edited-equal refusal independently via Cursor's native updater;
observe its own outcomes and unchanged snapshots. Size high; native runtime exception.

Behavior: Prepared Cursor installation → ordinary native update → truthful
refusal without writes or attempts to bypass the helper's integrity decision.

### 10d. Cursor honors an explicit forced update

Type: Behavior
Status: planned
Proof: Run 9d independently via Cursor; exact latest selected-root replacement
and preserved other roots. Size high; native runtime exception.

Behavior: Edited Cursor installation → explicitly force update → verified latest
selected installation, unrelated content preserved.

### 11a. Claude Code uses a fresh installation with Open Dough unavailable

Type: Behavior
Status: planned
Proof: Repeat 9a independently in `.claude/skills/`, with native discovery and
explicit/architecture-triggered ADR use. Size high; native runtime exception.

Behavior: Fresh Claude installation → native ADR use with source unavailable →
correct standalone guidance behavior.

### 11b. Claude Code updates a bootstrapped installation through its saved source

Type: Behavior
Status: planned
Proof: `tests/dough-adr-awareness-claude-delivery-to-use.sh --native` with 9b's
revised assertions; fresh `/dough-update` supplies no URL/force. Capture Claude's
own transition/use and coexistence. Size medium; native runtime exception.

Behavior: Bootstrapped Claude installation → fresh no-URL update → newer
saved-source payload is usable in Claude's selected root.

### 11c. Claude Code reports ordinary update integrity without writing

Type: Behavior
Status: planned
Proof: Run 9c's single edited-equal refusal independently via Claude's native updater;
observe its own outcomes and unchanged snapshots. Size high; native runtime exception.

Behavior: Prepared Claude installation → ordinary native update → truthful
refusal without writes or attempts to bypass the helper's integrity decision.

### 11d. Claude Code honors an explicit forced update

Type: Behavior
Status: planned
Proof: Run 9d independently via Claude; exact latest selected-root replacement
and preserved other roots. Size high; native runtime exception.

Behavior: Edited Claude installation → explicitly force update → verified latest
selected installation, unrelated content preserved.

### 12. Prepare the verified candidate as an identifiable release

Type: Behavior
Status: planned
Proof: With all affected native observations present, run `npm test` and
`npm run lint` once for the shared-helper/fixture changes; inspect the scoped
candidate diff. Maintainer-supplied higher version and accurate dated notes
produce reviewable VERSION/CHANGELOG through the existing release skill.

Behavior: Verified complete candidate and maintainer-selected version → prepare
release → metadata identifies exactly the delivered contract, preserving earlier
notes. Read the release skill at execution; do not guess the version or mark ADR
0004 Accepted. Size high for metadata; integrated checks are an external runtime
exception. Native test default skips are never proof.

### 13. Publish and independently verify the release

Type: Behavior
Status: planned
Proof: Under execution authorization, finalize the committed candidate using
the existing release skill, then publish its immutable annotated tag with
ordinary Git. Fresh fetch from the public source matches tag object, peeled
commit, tree, VERSION and notes; prior tags unchanged.

Behavior: Verified prepared release → finalize/publish → an independent client
can fetch its exact released content. No release service or second fixture-only
public release. Size high; Git/network wait exception. Publication is not
performed by a client's updater or implied by this planning request.

### 14a. Self-adopt the published guidance in Codex

Type: Behavior
Status: planned
Proof: Inspect current Open Dough Codex installation, then use the published
client flow (explicit inspected bootstrap if required). A fresh session uses
the installed ADR guidance; exact published payload/record and correct native
use, other roots/source preserved. Review the resulting client diff.

Behavior: Published release available → adopt and use in Open Dough's real
Codex root → retained working client installation with reviewable changes.
Record the actual source/tag/revision and authorization for any needed force;
no source-to-native copying shortcut. Size medium; native runtime exception.

### 15a. Reuse the saved-source updater in Open Dough's Codex installation

Type: Behavior
Status: planned
Proof: Fresh `$dough-update` without a URL after 14a uses recorded SOURCE and
proves clean-current no-write with payload/record mtimes and other roots intact.
If a meaningful newer release appeared meanwhile, record the real ordinary
update instead of faking an equal result. Size high; native runtime exception.

Behavior: Retained Codex adoption → plain native update → correct release
decision from its saved source, without borrowing working-tree helper code.

### 14b. Self-adopt the published guidance in Cursor

Type: Behavior
Status: planned
Proof: Repeat 14a independently in Open Dough's Cursor root with fresh native
ADR use. Preserve Codex adoption and Claude/source state.
Size medium; native runtime exception.

Behavior: Published release → adopt and use in real Cursor root → retained
usable guidance, with a verified selected-root diff.

### 15b. Reuse the saved-source updater in Open Dough's Cursor installation

Type: Behavior
Status: planned
Proof: Repeat 15a's decision/snapshot proof independently via Cursor's fresh
`/dough-update`. Size high; native runtime exception.

Behavior: Retained Cursor adoption → plain native update → correct decision
from its own saved source and installation.

### 14c. Self-adopt the published guidance in Claude Code

Type: Behavior
Status: planned
Proof: Repeat 14a independently in Open Dough's Claude root with fresh native
ADR use. Preserve both earlier adoptions and source state.
Size medium; native runtime exception.

Behavior: Published release → adopt and use in real Claude root → retained
usable guidance, with a verified selected-root diff.

### 15c. Reuse the saved-source updater in Open Dough's Claude installation

Type: Behavior
Status: planned
Proof: Repeat 15a's decision/snapshot proof independently via Claude's fresh
`/dough-update`. Size high; native runtime exception. Once accepted, hand off to
SEED-006 Story 3; no Donut mutation occurs in this plan.

Behavior: Retained Claude adoption → plain native update → correct decision
from its own saved source and installation.

## Native acceptance and evidence

Every native observation records tool version, candidate or published revision,
entry point, loaded installed paths, result/transcript, and before/after
snapshots. The adopter fixture must be outside the Open Dough source checkout;
ordinary use cannot borrow source recognition/helpers or a removed original.

| Platform | Reusable historical evidence | Revised contract |
| --- | --- | --- |
| Codex | Plan 018 done leaves 2b/3c/4e; commits `8694740`, `f840f18`, `fc68552` describe rejection, fresh ADR use, legacy transition. | Pending: 9a–9d, 14a/15a. No new native run in this planning task. |
| Cursor | Plan 018 done leaves 2c/3c/4f; commits `0273138`, `f840f18`, `dd2b506`. | Pending: 10a–10d, 14b/15b. |
| Claude Code | Plan 018 done leaves 2d/3c/4g; commits `4af505c`, `f840f18`, `95b89fb`. | Pending: 11a–11d, 14c/15c. |

These are historical records, not rerun results. Plan 018's older aggregate
table lags its done leaf statuses; no new evidence is inferred from that table.
Payload/source records and decision changes invalidate old updater-transition
proof for final acceptance; unchanged ADR decisions/context behavior can be
reused. Native failure or unavailable tools leave acceptance pending; fixture
copying and another platform's success never substitute.

## Refinement and learnings

- The initial candidate breakdown had source persistence/update, baseline policy,
  force/bootstrap, native delivery, and release/self-use groups. Refinement
  separated record failure (2), baseline failure (5), skip semantics (6), force
  (7), bootstrap (8), and each native host/policy boundary (9–11). Promise
  ownership was repointed above; no completed work was reset.
- A second pass over this PLAN classified combined self-adoption/current-update
  leaves 14a–14c as **Refine**: installation/use and updater reuse have separable
  proof loops. Replaced them in place with 14a/15a, 14b/15b, and 14c/15c; complete
  one platform before the next. Other leaves are **Ready** as bounded behavior
  or policy variations, with the runtime exceptions below. No **Escalate** leaf.
- Native install/use, update/use, ordinary refusal, and forced replacement have
  separate proof boundaries. The shared wrappers are reused; do not build a new
  native testing framework. Product edits/tests remain target-sized; only focused
  native runs, integrated checks, and publication waits have runtime exceptions.
- Keep the reduced representative native refusal checks and unchanged-evidence
  reuse. The broader runner redesign, stage selection, unattended execution,
  evidence-management options, and GSD/CI research moved to SEED-007 at the
  owner's request. They are not additional obligations of this story.
- The existing synthetic older fixture is not a released baseline. Fix that
  specific setup rather than weakening comparison or creating historical-layout
  machinery. The real old clients use the bounded bootstrap.
- SOURCE's path is an implementation choice, not a new configuration concept.
  The recorded direction resolves story understanding; the actual release
  number remains an operational input before leaf 12, required by ADR 0003.
- No release, client installation, native invocation, or automated test pass is
  claimed by this documentation work. Implementation can start at leaf 1 when
  requested. Reassess the story after a second non-exempt ten-minute overrun;
  rename/split does not reset that learning threshold.

Readiness: **native ownership and release sequencing require migration** through
SEED-007 Story 4 before this plan resumes those portions. Retain implementation
work that remains applicable; do not execute the old native matrix in parallel
with the dedicated acceptance story.
Affected native acceptance remains pending, and release preparation needs the
maintainer's version input. Story sizing hypothesis: L (about 2–4 hours of development), medium
confidence, with native/external wait time recorded separately. The bounded
existing helpers and fixed two-file payload support this estimate; do not answer
an overrun by adding generic machinery or moving Donut work into this story.
