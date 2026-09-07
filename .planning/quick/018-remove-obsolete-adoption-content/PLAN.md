# Remove obsolete adoption content and unused maintenance machinery

## Source

- Owner request, 2026-09-07: scan the repository aggressively after the client
  architecture change; plan hardening outside the product backlog. **Do not execute.**
- Inspected baseline: `3953e81c83be03acab88289d4f6bafaeb061fb2e`, clean `main`.
- Borrowed, without installation, Donut's
  [slice-planning](../../../../doughnut/.agents/skills/slice-planning/SKILL.md),
  [planning](../../../../doughnut/.cursor/rules/planning.mdc), and
  [problem-decomposition](../../../../doughnut/.cursor/rules/problem-decomposition.mdc)
  at checkout `1da341877949d6ccae4539834d82c6a20ea0d0fb`.
  Refined slices 1–4 in place with Donut's `slice-plan-refinement` at checkout
  `6e983e55a91069cf61d9030e693a499ab3d3f02e` on 2026-09-07; no story boundary
  changed.
- [Accepted ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) preserves
  human decision ownership and ADR history.
  [Accepted ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  requires immutable tagged releases and excludes default-branch fallback.
  [ADR 0004](../../../docs/adrs/0004-client-installation-and-update.md) remains
  **Proposed**; the owner's explicit direction supplies this plan's scope.
  No conflict with the Accepted decisions was found; no ADR status changes.

## Goal and scope

Open Dough maintainers should carry only machinery needed for the supported
client lifecycle: remove the reusable local-guidance replacement workflow,
its otherwise-unused test infrastructure, and demonstrably unused tooling.
Retain ordinary installation, updating, and standalone ADR use.

This is a bounded hardening phase, not the complete implementation of ADR 0004.
No new backlog item or seed is needed. Overlapping removal work belongs to
[SEED-001 Story 7](../../seeds/SEED-001-install-and-update-open-dough.md#standalone-client-update);
record actual completion there during execution without claiming that story done.

Excluded: source-URL records, ordinary edit detection, configuration, packages,
generic retirement/migration frameworks, client matching or reconciliation,
new extractions, Donut/client edits, release publication, and live self-updating.
Those needed for the supported future lifecycle retain their existing backlog
owners. This plan makes no claim to complete the revised update contract.

## Removal analysis

The scan covered tracked source, shell entry points and test discovery, native
skill copies/adapters, fixtures, dependencies/configuration, documentation,
seeds, and completed plans. A lack of textual callers alone does not make a
test or native skill dead: `scripts/test.sh` discovers tests and the tools
discover their native skill roots.

| Content | Evidence and disposition | Owner |
| --- | --- | --- |
| Reusable assessment, preparation, caller repair, and original removal | `src/skills/dough-update/SKILL.md` routes these requests to recognition; source `RECOGNITION.md` lines 81–195 implement them. Remove this capability and those procedures completely. Keep a short descriptive source recognition record. | 2b–2d |
| Adoption-only tests and helpers | Remove `tests/adr-adoption-codex.sh`, `tests/adr-adoption-fixture.sh`, and `tests/support/adr-adoption-codex-{preparation,cleanup}.sh`. Remove the old adoption fixture tree and builders once active consumers have moved. | 1a–1b, 2b |
| Live tests hidden behind adoption names | `dough-adr-awareness-context.sh` and `adr-adoption-codex-use.sh` call `prepare_donut_adr_codex_use_target`, which reconstructs a migration through assessment/preparation/cleanup helpers. Preserve clear/conflicting-status and explicit/automatic use; construct their installed starting state directly. Rehome useful assertions and remove unused snapshot-diff helpers. | 1a–1b |
| Recognition in the client payload | `install.sh` declares/copies it; release fixtures, payload assertions, and all three native delivery harnesses expect it. Remove this delivery contract and obsolete installed-copy assertions together. Source recognition remains available for maintainer extraction/evaluation. | 3a–3c, 4a–4g |
| Source-to-live-copy equality checks | `tests/dough-update-codex-expanded-payload.sh` compares source with three tracked installed updaters. This wrongly prevents source evolution between releases. Prove source delivery in disposable tagged fixtures; retain installed release identity checks against their recorded release. | 2a |
| Unused helper CLI commands | Repository-wide caller search finds `source-version` and `read-record` only in `open-dough-release.sh` dispatch/help. Remove these two exposed wrappers. Their underlying functions are live: validation calls `read_version_file`, and apply calls `read_record`. | 5 |
| TypeScript-only tooling | No tracked TypeScript files or typecheck command. ESLint's TypeScript override has no matching inputs; it is the only consumer of `tsconfig.json`. Remove that config, the override/import, and direct `typescript`, `typescript-eslint`, and `@types/node` dependencies; regenerate the lockfile. Retain working JavaScript and shell linting. | 6 |
| Superseded planning instructions | `.planning/research/installation-and-updates.md` recommends branch-head installs and no releases; Accepted ADR 0003 supersedes these recommendations. Remove the note and duplicated initial-loop alternatives from SEED-001. Collapse completed migration procedure detail in Plan 013 and spent SEED-006 Story 2 refinement while retaining their evidence. | 7 |

Retain deliberately:

- Release selection, pin/inspect, numeric comparison, temporary cleanup,
  destination confinement, copy-failure handling, and their regression tests.
  Lower risk from unsupported edits does not make these safeguards dead.
- Active `fetch-release`, `pin-latest`, `destination`, and `compare` commands:
  tests call them. Keep the optional fetch/apply path covered by
  `tests/apply-temp-cleanup.sh`; it is not unused migration machinery.
- `src/skills/dough-adr-awareness/SKILL.md`, the descriptive recognition record,
  internal extraction/release skills, and source-context/alternate-layout
  fixtures. Internal extraction drafts are not draft public releases.
- Native `dough-*` installations in `.agents`, `.cursor`, and `.claude`:
  they are active released copies, not redundant source files to delete by hand.
  Their old recognition/procedures retire through the later released update.
  The short Claude `release-version` file is an intentional discovery adapter.
- ADRs, changelog/tag history, retained native evidence, resolved failure
  findings, and the recent agnix evaluation. Age, repetition, or a parked story
  alone is not evidence of dead content. No broad deletion of completed plans.
- Existing legacy bootstrap and unknown-record behavior until the supported
  transition replaces them. Removing them now would strand earlier installs.

## Outside-in proof

| Promise / example | Owning slice and observation |
| --- | --- |
| A client with local ADR context can use installed guidance without a migration rehearsal | 1a: direct fixture retains explicit/automatic Codex use; 1b: the same direct context produces the required clear/conflict result in all three tools. |
| Asking the updater to replace local guidance does not start an adoption workflow | 2b–2d: Codex, Cursor, and Claude Code each decline unsupported replacement without changing local guidance or fetching migration support; 2a first permits unreleased candidate proof without changing released copies. |
| A fresh client contains working guidance and its version, with no recognition record | 3b: all three install entry points and byte/coexistence checks; 3c: native Codex 0.144.1, Cursor 2026.09.02-c22c1a3, and Claude Code 2.1.263 each loaded and applied the clean installed skill with unchanged source/target snapshots. 3a first makes the shared fixture boundary payload-size-neutral. |
| Updating an earlier payload removes its obsolete recognition only in the selected installation | 4a: safe forced retirement; 4b: honest removal failure; 4c: ordinary newer-release retirement; 4d: equal-version no-write; 4e–4g: independent Codex, Cursor, and Claude Code legacy-to-new delivery/use transitions. |
| Removing unused commands does not remove version-aware installation/update | 5: existing validation/version/update/cleanup checks pass; removed commands are absent from dispatch/help. |
| Maintainers can install and run checks without the unused TypeScript toolchain | 6: clean locked dependency install and existing lint command succeed; active JS/shell checks remain configured. |
| Current direction is discoverable without obsolete execution instructions | 7: historical procedure removed, current story/ADR links resolve, retained evidence remains accessible with its original scope/status. |
| No broader architecture or client mutation is smuggled into cleanup | Every slice: scoped diff; unchanged ADR statuses, release metadata/tags, live installed copies, and outside-repository files. Story 7 remains incomplete. |

## Ordered slices

All leaves are unexecuted. Aim for about five minutes of editing plus focused
verification; reassess after five and stop/refine after ten minutes unless the
remaining time is one recorded native-test or external-wait exception. These
are sizing hypotheses. Each stopping point must retain green applicable checks;
do not commit a red test or leave documentation advertising a removed behavior.

### 1a. Use installed ADR guidance directly in Codex

Type: Behavior
Status: done
Proof: A rehomed installed-use test builds a direct fixture and passes its
non-native snapshot check plus `--native explicit` and `--native automatic`.
The candidate source and complete target stay unchanged, the Accepted session
decision is cited, and command evidence contains no installer, updater, or
migration-support fetch.

Behavior: A Codex client already has correct local ADR context and installed
`dough-adr-awareness` → the client invokes it explicitly or through automatic
discovery → the Accepted local decision is applied without a migration rehearsal.

Create the minimal already-correct fixture under `tests/fixtures/adr-awareness/`
and rehome the useful use/proof support under ADR-use names. Compare its snapshot
with the old reconstructed post-cleanup target once; do not retain a permanent
conversion layer.
Size: high confidence; native command runtime is an execution-time exception,
not hidden editing work.

### 1b. Respect clear and conflicting ADR status from the direct fixture

Type: Behavior
Status: done
Proof: `tests/dough-adr-awareness-context.sh` uses the direct fixture and passes
its non-native check. For Codex, Cursor, and Claude Code, `clear` completes with
the local decision while `conflict` names both authorities and stops for human
resolution. Source/target snapshots remain unchanged and no maintenance fetch
appears.

Behavior: A client has installed ADR guidance and local status authorities →
it assesses the same architecture question → it returns the result mandated by
those authorities: completion when they agree, or a human-owned stop when they
conflict.

Move the context test off `prepare_donut_adr_codex_use_target`; retain one
platform-neutral direct fixture and only the small platform-root adaptation.
After this leaf, no retained ADR-use proof may depend on preparation or cleanup.
Size: high confidence; the six native observations may exceed ten minutes only
because the focused external tools run serially.

### 2a. Prove unreleased candidates without equating them to released copies

Type: Structure
Status: done
Proof: The adjusted expanded-payload fixture installs and verifies the candidate
source in a disposable tagged repository; existing installed-release identity
checks still validate their recorded release. No tracked native skill copy or
VERSION changes.

Internal change: Remove source-to-live-copy equality from
`tests/dough-update-codex-expanded-payload.sh` and keep source identity, pinned
revision, selected-platform confinement, byte verification, and coexistence
against the disposable candidate. This immediately enables source capability
removal in 2b while released copies remain historically truthful.
Size: high confidence; one focused harness boundary.

### 2b. Decline local-guidance replacement in Codex

Type: Behavior
Status: done
Proof: A bounded native Codex request discovers and invokes the candidate
`dough-update`, reports replacement as unsupported, performs no adoption fetch,
and leaves the arbitrary local practice and all snapshots unchanged. Ordinary
release update remains named as available; retained 1a/1b and updater checks
stay green.

Behavior: Codex has candidate Open Dough plus unrelated local guidance → ask
`dough-update` to assess or replace that guidance → no reusable adoption
workflow is offered and the local guidance remains intact.

Remove the updater route and assessment/preparation/caller-repair/removal prose.
Keep a short boundary sending one-time adoption to project work and preserve the
recognition purpose, triggers, distinguishing behavior, adopter context,
exclusion clues, and concise validation evidence. Delete adoption-only tests,
fixture builders, and support after the 1a/1b consumer moves are complete.
Size: medium confidence; one source boundary and one native proof. Native tool
runtime is the only stated hard-limit exception.

### 2c. Decline local-guidance replacement in Cursor

Type: Behavior
Status: done
Proof: Extend the bounded rejection harness only for Cursor. Native discovery
and invocation show the same unsupported boundary, no migration-support fetch,
and byte-identical target/source snapshots.

Behavior: Cursor has the candidate updater plus unrelated local guidance →
request assessment or replacement → the guidance is preserved and no adoption
operation starts.
Size: high confidence; platform evidence only, with native runtime exempt.

### 2d. Decline local-guidance replacement in Claude Code

Type: Behavior
Status: done
Proof: Extend the bounded rejection harness only for Claude Code. Native
discovery and invocation show the same unsupported boundary, no migration
support fetch, and byte-identical target/source snapshots.

Behavior: Claude Code has the candidate updater plus unrelated local guidance
→ request assessment or replacement → the guidance is preserved and no
adoption operation starts.
Size: high confidence; platform evidence only, with native runtime exempt.

### 3a. Make shared payload fixtures independent of payload width

Type: Structure
Status: done
Proof: Current three-file public installs remain green in the three
`tests/install-*-public-payload.sh` entry points, `tests/install-omits-internal.sh`,
and affected release/repeat/failure fixture checks.

Internal change: Make the existing shared test helpers take their expected
managed-file list from the scenario rather than separately hard-code
recognition copies and incomplete-source construction. Keep the current
three-file expectation in this leaf. This immediately enables the two-file
public contract in 3b without leaving platform tests stale.
Size: medium confidence; test-only preparation bounded to current consumers.

### 3b. Install the two-skill public payload on every platform

Type: Behavior
Status: done
Proof: The three public-payload entry points, `tests/install-omits-internal.sh`,
and affected repeat/copy/verification-failure checks show that clean Codex,
Cursor, and Claude Code targets receive the two skills and VERSION, but no
recognition file. Incomplete sources still fail before writes; unrelated
guidance and other platform roots remain unchanged.

Behavior: A clean target project → install the candidate payload for a selected
native tool → both skills and VERSION are present, recognition is absent, and
unrelated guidance/other installations survive.

Change the installer declaration, updater write/inspection contract,
release-fixture assertions, README, and installation guide together so no
stopping point advertises the retired three-file payload. Source recognition
remains available to maintainer extraction/evaluation. A recognition file from
an earlier installation may still remain until slice 4; state that interim
boundary and do not claim complete retirement. Do not introduce a manifest or
new package/configuration concept.
Size: medium confidence after 3a; one shared payload contract and focused matrix.

### 3c. Use a fresh two-skill installation natively

Type: Behavior
Status: done
Proof: Against clean disposable targets installed by 3b, Codex, Cursor, and
Claude Code each discover and invoke `dough-adr-awareness`, demonstrate the
existing skill improvement, and leave source/target snapshots unchanged.
Assertions confirm recognition is absent and no fallback reads source
recognition. Capture tool version, candidate revision, entry point, installed
paths, and native loading/application separately for each tool.

Behavior: A client has a fresh two-skill Open Dough installation → invoke ADR
awareness in its native tool → the installed guidance works without recognition.

Reuse the rehomed direct-context boundary from slice 1. Keep the existing
update-to-use harnesses for 4e–4g; replace recognition-based improvement markers
there only when those transition leaves execute.
Size: high confidence; the three focused native runs may exceed ten minutes
only through external tool runtime.

### 4a. Retire the fixed recognition path during forced replacement

Type: Behavior
Status: done
Proof: An explicit forced install over a fixed earlier payload removes exactly
the selected platform's `dough-adr-awareness/RECOGNITION.md`, verifies the final
two-skill payload, then records the new version. Missing recognition is a clean
no-op. Complete snapshots prove project files, local sidecars, unrelated
guidance, and other platform installations survive. Directory or symlink
objects at the retired path are refused before writes.

Behavior: A selected installation contains the known obsolete recognition file
→ force-replace it with the candidate payload → that file alone is retired and
the verified selected installation records success.

Use the fixed path inside the already-confined managed skill directory; never
search and recursively delete matches or a skill root. Keep refusal checks with
the behavior as boundary examples. No registry, reconciliation, rollback, or
matching engine.
Size: medium confidence; one installer success path plus topology boundaries.

### 4b. Report recognition retirement failure without false success

Type: Behavior
Status: done
Proof: Inject a real unlink failure at the fixed retired file. The installer
reports partial replacement, records neither success nor a new VERSION, and
preserves unrelated/other-platform snapshots. Existing copy and verification
fault cases remain truthful.

Behavior: A replacement cannot remove the known obsolete recognition file →
run replacement → the operation fails visibly and does not record a successful
new installation.

Add only the narrow fault seam needed for deterministic proof; no atomicity or
rollback guarantee is introduced.
Size: high confidence; one error path and focused test.

### 4c. Retire recognition on an ordinary newer-release update

Type: Behavior
Status: planned
Proof: Extend `tests/update-when-needed.sh` with a fixed earlier two-skill-plus-
recognition payload. Applying a newer candidate removes recognition only from
the selected installation, verifies the final payload, records the new version,
and preserves sentinels and other platform roots.

Behavior: An installed older Open Dough release includes recognition → apply a
newer candidate through the release helper → the selected installation reaches
the verified two-skill payload without recognition.
Size: high confidence; one existing ordinary-update branch.

### 4d. Leave equal-version installations completely unwritten

Type: Behavior
Status: planned
Proof: The equal-version case in `tests/update-when-needed.sh` contains an
edited managed file and obsolete recognition, makes all selected paths
read-only, and confirms no installer invocation, removal, mtime change, or
VERSION write. Newer-version and malformed-record no-write checks remain green.

Behavior: An installation records the same version as the selected release →
run ordinary update → no managed file, including obsolete recognition, is
touched without explicit force or a newer release.
Size: high confidence; one no-write policy branch.

### 4e. Transition a legacy Codex installation to native use

Type: Behavior
Status: planned
Proof: The Codex delivery-to-use harness starts from a genuine earlier
three-file payload. Its old updater refuses the smaller candidate without
mutation; the explicit inspected bootstrap installs the candidate; a fresh
Codex session performs an ordinary newer-release update and then uses the
improved ADR skill. Final snapshots contain no recognition and preserve all
coexisting content.

Behavior: Codex has a legacy three-file Open Dough installation → follow the
supported inspected transition and start a fresh session → the current
two-skill updater and ADR guidance update and work natively.
Size: high confidence in harness edits; native sessions are a focused runtime
exception and may exceed ten minutes.

### 4f. Transition a legacy Cursor installation to native use

Type: Behavior
Status: planned
Proof: Apply the 4e transition boundary independently in the Cursor
delivery-to-use harness, including old-updater refusal, inspected bootstrap,
fresh-session ordinary update, native skill improvement, absent recognition,
and complete coexistence snapshots.

Behavior: Cursor has a legacy three-file Open Dough installation → follow the
supported inspected transition and start a fresh session → the current
two-skill updater and ADR guidance update and work natively.
Size: high confidence; platform-local harness plus native runtime exception.

### 4g. Transition a legacy Claude Code installation to native use

Type: Behavior
Status: planned
Proof: Apply the 4e transition boundary independently in the Claude Code
delivery-to-use harness, including old-updater refusal, inspected bootstrap,
fresh-session ordinary update, native skill improvement, absent recognition,
and complete coexistence snapshots.

Behavior: Claude Code has a legacy three-file Open Dough installation → follow
the supported inspected transition and start a fresh session → the current
two-skill updater and ADR guidance update and work natively.
Size: high confidence; platform-local harness plus native runtime exception.

### 5. Remove unused version-inspection command wrappers

Type: Behavior
Status: planned
Proof: Repeat the caller search; remove only `source-version` and `read-record`
dispatch/help. Run `tests/compare-versions.sh`, `tests/install-latest-release.sh`,
`tests/update-when-needed.sh`, and `tests/apply-temp-cleanup.sh`. Existing
validation and installed-record behavior remain green; unknown commands still
follow the normal usage error path. No new test suite for deleted wrappers.

Behavior: Maintainer runs the release helper's supported install/update commands
→ the same release/version outcomes occur through a smaller command surface.
Keep `read_version_file` and `read_record` functions and all their live callers.
Size: high confidence, one small dispatch cleanup.

### 6. Check the codebase without an unused TypeScript toolchain

Type: Behavior
Status: planned
Proof: Regenerate the lockfile using the existing npm workflow, perform a clean
`npm ci`, and run `npm run lint`. Review that JS strictness and shell discovery,
formatting, warnings-as-errors, and CI entry points remain intact. Dependency
inspection confirms removed direct packages; accept dependencies still needed
transitively by retained tools. No package upgrades or new linter tests.

Behavior: Maintainer installs development dependencies and runs lint → current
JavaScript, JSON, and shell checks work without the unused TypeScript setup.
Remove the TS configuration/import/override and direct packages together;
trim TypeScript-only globs and contributor claims. Retain active lint scripts
and general generated-output ignores.
Size: high confidence; dependency installation may be an external wait.

### 7. Remove superseded planning instructions without losing evidence

Type: Behavior
Status: planned
Proof: Read SEED-001's current contract and completed-story summaries; all
remaining links resolve and no initial-loop proposal reads as current guidance.
Retained Plan 013/SEED-006 evidence still identifies what was observed, in which
tool, and what was not proved. Search for links to removed research and retired
test paths; repoint current reproduction instructions to retained tests, and
label historical evidence whose old harness was retired.

Behavior: Maintainer follows current installation/adoption planning references
→ current scope and usable evidence are available without obsolete execution steps.

Delete `.planning/research/installation-and-updates.md` and its seed reference.
Remove SEED-001's duplicated historical initial-loop constraints and alternatives;
its completed stories already preserve their Goal/Scope and outcome links.
Reduce Plan 013 to historical outcome/evidence and the lesson that adopter
context must survive one-time replacement; remove its spent procedural leaves
and obsolete generic-adoption follow-ups. Reduce completed SEED-006 Story 2's
spent examples/readiness to Goal/Scope plus evidence pointers. Preserve anchors,
completion facts, current unfinished stories, and backlog ordering. Update
Story 7's gap summary only for removals actually completed by this plan.
Size: medium confidence; bounded document review, no broad archive rewrite.

## Current decisions

- Remove obsolete behavior together with its callers and tests. Preserve
  regression coverage of still-supported outcomes before discarding fixtures.
- A fixed obsolete Open Dough file is release retirement, not adoption of an
  arbitrary client practice. The latter remains one-time external project work.
- Local native copies remain at their real released versions. Source cleanup
  becomes available there through Story 7's later release/self-use work. Until
  then, those copies still contain the old behavior; do not claim otherwise.
- Use disposable local tagged fixtures for candidate proofs, never move a
  published tag. Do not infer a new release from modified source VERSION.
- No configuration file, new package mechanism, or new permanent domain concept
  is introduced. Keep the repository acceptance guard internal.

### Native acceptance and evidence

| Platform | Required evidence for changed boundaries | Current status |
| --- | --- | --- |
| Codex | 1a explicit/automatic installed use; 1b clear/conflict context; 2b candidate updater rejection; 3c fresh two-skill use; 4e `tests/dough-adr-awareness-codex-delivery-to-use.sh --native` legacy transition. | 1a/1b/2b passed natively; later leaves pending. |
| Cursor | 1b clear/conflict context; 2c candidate updater rejection; 3c fresh two-skill use; 4f `tests/dough-adr-awareness-cursor-delivery-to-use.sh --native` legacy transition. | 1b/2c passed natively; later leaves pending. |
| Claude Code | 1b clear/conflict context; 2d candidate updater rejection; 3c fresh two-skill use; 4g `tests/dough-adr-awareness-claude-delivery-to-use.sh --native` legacy transition. | 1b/2d passed natively; later leaves pending. |

For each tool, capture tool version, candidate source revision, entry point,
observed native loading/application, update/use result, and before/after
snapshots showing coexistence. Ordinary ADR use must read only local guidance,
with no source fetch or fallback to a removed original. The delivery scenario
must distinguish initial install, actual newer-payload update, and subsequent
use. Unsupported adoption gets its own bounded request, not a full migration
test framework. Native failures stay pending; static fixture success is not
native acceptance. Reuse evidence only for unchanged boundaries; old
three-file delivery and adoption results do not prove these changes.

Keep focused checks at each slice boundary. Once integrated, run `npm test`
and `npm run lint` once because shared fixture removal affects test discovery
and several consumers; do not interpret optional native tests' default skip
messages as native verification. Integrated checks remain pending.

## Learnings and readiness

- The main dead content is still reachable: adoption prose, harnesses, and
  installed recognition reinforce one another. This needs capability removal,
  not deletion based solely on file names or reference counts.
- Active ADR context/use tests depend on historical migration simulation;
  deleting the whole adoption tree first would erase useful regression proof.
- Source/native-copy equality checks prevent legitimate unreleased source work.
  Candidate install proof and actual installed-release identity are distinct.
- Slices 1–4 were refined into direct-fixture, source-boundary, platform-proof,
  payload-contract, retirement-policy, and native-transition leaves. Each has
  one conditional Behavior or one immediately enabling Structure proof loop.
  The only stated hard-limit exceptions are focused native-tool runtime; editing,
  cleanup, and deterministic checks remain within each leaf's sizing hypothesis.
- Slices 1a–1b replaced migration reconstruction with a byte-equivalent direct
  fixture; 2a decoupled candidate proof from released-copy identity; 2b removed
  reusable adoption; 2b–2d passed all native rejection proofs; 3a centralized
  the fixture list; 3b installed only the two skills; 3c passed native use on all
  three tools; 4a added confined forced retirement; 4b proved honest unlink failure. Execution resumes at 4c. Reassess after five minutes and follow Learning
  escalation for any non-exempt ten-minute overrun; do not add a new plan layer.
- Execution observer: `terryyin/open-dough` `main`, coordinator `/root`, checkout
  `/Users/terryyin/git/open-dough`, Codex cell `158`; rearmed before the 3c push.
- No client update, release, ADR status, tagged metadata, or tracked native-copy
  change has been performed.
