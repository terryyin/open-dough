# Remove internal extraction and speculative recognition

## Source and execution context

- Source: [SEED-014, Story 1](../../seeds/SEED-014-remove-extraction-and-speculative-recognition.md#remove-extraction-and-speculative-recognition).
- Status: in execution. Slice proof below is required work until accepted.
- Authority: `/dough-execute-plan 33` on 2026-09-15. Publication and other-project
  adoption remain outside this story.
- Home: `.planning/quick/033-remove-extraction-and-speculative-recognition/PLAN.md`.
- Execution identity:
  - originating checkout: `/Users/terryyin/git/open-dough` on `main`
    (claim `1ba03d0`)
  - execution checkout: `/Users/terryyin/git/open-dough-worktrees/033-remove-extraction-and-speculative-recognition`
    on `quick/033-remove-extraction-and-speculative-recognition`
  - integration target: `main`
- Follow the installed `dough-execute-plan` workflow: accept focused proof,
  independently refactor, and deliver coherent slices with CI repair.
- No numeric slice target, hard limit, or S/M/L definitions were supplied.
  Size by one outcome and proof loop, including cleanup. Reassess a slice before
  delivery if a new consumer or fixture dependency makes it multi-outcome.

## Goal and boundaries

Maintainers work with current shared guidance and developers receive ordinary
installation/update fidelity checks, with the finished extraction workflow and
speculative local-duplicate machinery completely removed from the current product.

Delete dedicated code, records, tests, fixtures, helpers, assertions, and current
historical accounts. In mixed material, keep the useful behavior and remove the
obsolete portions and their dependencies. Never invert obsolete assertions or
replace them with absence checks, tombstones, migration notices, or explanatory
negations. Delete existing checks whose sole purpose is proving those features
are excluded or retired. Retain genuine refusal assertions for current behavior,
such as detecting an edited managed installation.

Keep useful extracted skills, immutable Git history/tags, installation records,
ordinary/forced update policy, unrelated guidance, project configuration, and
native integration. Publication, other-project adoption, new recognition or
provenance systems, and unrelated test-runner redesign remain outside this plan.
Author released guidance in `src/skills`; internal extraction tooling is authored
in `.agents/skills`. Use the normal release process for managed installed copies.
Review terms by meaning: ordinary conflict recognition and project-supplied
records are not automatically the removed Open Dough feature.

The final current-tree cleanup includes affected ADRs, CHANGELOG entries,
DearDough material, older planning/evidence, and incoming references. Preserve
unrelated active stories and promises when editing mixed documents. The selected
story and this plan remain through execution review, then are deleted at wrap-up;
they are not enduring records of the removed feature.

## Existing solution and architectural decisions

PFE question: how does the product establish that installed guidance matches its
Open Dough revision, and does that require recognition?

| Inspected solution | Responsibility and decision |
| --- | --- |
| `src/install/open-dough-release-version.sh: managed_payload_unchanged` | Compares managed content against the supplied tagged checkout and its declared payload. Reuse this fidelity authority; retain historical payload-selection and collision safety required by current updates. |
| `src/install/open-dough-release-apply.sh: recorded_baseline_unchanged` | Fetches the recorded release and calls that comparison before ordinary updates. Preserve its stop-without-writes policy. |
| `scripts/check-self-installation.sh` and `tests/self-installation-baseline.sh` | Reuse the same comparison for this repository's installation; tests already exercise matching content, drift, and source-only development. |
| `src/skills/*/RECOGNITION.md`, execution `EXTRACTION.md` and `SOURCE-CHECKSUMS.json` | Describe original practices, extraction, or review history. They do not establish installed-release fidelity. Remove records and their actual consumers; no replacement representation is justified by inspection. |
| `install.sh` recognition-path preflight, unlink, and postcondition | Special retirement of one historical file. Remove together with its dedicated scenarios while keeping payload-copy and verification behavior. |
| Delivery-to-use support and release fixtures | Replay an old recognition-bearing payload before ordinary update/use. Replace that preparation with existing current-payload tagged-fixture construction; keep the useful update/use outcome. |

This is one model: declared released content plus SOURCE/VERSION identifies an
installation. Practice matching is unrelated to that responsibility. Reuse
`tests/helpers/release-fixture.bash` instead of adding a second fixture framework,
checksum registry, metadata format, or compatibility recognizer. A newly found
consumer must demonstrate a current functional need before retaining machinery.

Relevant Accepted decisions:

- [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
  especially §5–6: tagged baseline, update safety, whole payload, configuration,
  and native boundaries continue to apply.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): keep
  immutable release identity and current promotion/release behavior.
- [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  retain consistent current vocabulary and one shared runtime behavioral source.
- Recognition/extraction passages in these ADRs and ADR 0004 §3 are cleanup
  targets under the user's explicit direction recorded in the seed. That same
  direction governs the targeted historical-retention exception to
  [ADR 0000 §5](../../../docs/adrs/0000-use-adrs-accepted.md). Rewrite affected
  passages around remaining decisions, without replacement historical notices.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): run real
  deterministic install/update checks across supported layouts, distinguish
  those from native use evidence, and remove spent evidence at wrap-up.

No North Star file was found or warranted. The backlog's existing lifecycle
consolidation direction remains unchanged.

## Ordered slices

### 1. Maintain shared guidance directly
Type: Behavior
Status: done

Behavior: Given a maintainer following this repository's guidance to author or
review a shared skill, the current instructions lead directly to authoring and
behavior review using the maintained skill source.

Change: Delete `.agents/skills/extract-guidance/` and its dedicated fixtures.
Remove actual discovery pointers, callers, extraction instructions, and internal
skill-list entries; an extraction Claude pointer was not present at inspection.
Clean extraction-specific provenance files and references, including execution
`EXTRACTION.md` and `SOURCE-CHECKSUMS.json`. Keep shared skills and their current
behavior. Align README, AGENTS, affected release prose, and mixed planning links
as part of this removal; review existing queued extraction-shaped stories without
cancelling their independently useful outcomes.

Proof loop: Walk one representative authoring task through the remaining
instructions and confirm a concrete useful skill can be reviewed directly.
Inspect the diff for deleted dedicated tests/assertions and usable remaining
links. Run `bash tests/install-omits-internal.sh` and
`bash tests/execution-payload-update.sh` after removing only the obsolete entries,
setup, and assertions. Their current payload and coexistence proof must pass.

Safe stop: maintainers have coherent direct authoring guidance and installation
tests remain green. Recognition-dependent assessment continues until Slice 3.
Sizing: bounded direct-authoring outcome; medium confidence because historical
references are dispersed. Do not turn that search into a new permanent audit.

### 2. Exercise ordinary update followed by useful ADR guidance
Type: Behavior
Status: planned

Behavior: Given a disposable project with a verified older declared payload and
recorded SOURCE, the delivery fixture updates from that source and exercises the
improved ADR skill against the fixture project's own decisions.

Change: In delivery-to-use support, replace the recognition-bearing legacy
bootstrap with two tagged current-contract fixture releases using existing
builders. Keep an observable skill improvement between them. Delete the obsolete
legacy-refusal case, dedicated assessor/tests, setup, inventory entries, prompts,
and historical reporting where they belong solely to that removed transition.
Update all actual callers, including selected-case support and wrapper docs.
Keep independent current-baseline refusal tests; do not rebrand the retired
scenario under a generic name. Remove recognition-source preconditions and
retirement assertions from this journey in the same change.

Proof loop: Inspect setup so it installs only the older baseline; the real update
operation must establish the newer payload and records. Run:

```sh
bash tests/dough-adr-awareness-codex-delivery-to-use.sh
bash tests/dough-adr-awareness-cursor-delivery-to-use.sh
bash tests/dough-adr-awareness-claude-delivery-to-use.sh
bash tests/native-case-selection.sh
bash tests/native-delivery-updated-use.sh
bash tests/native-delivery-updated-use-adapters.sh
```

Keep the combined ordinary-update/fresh-use assertions and current runner
assessment tests. Delete only obsolete case expectations from shared tests.
Native acceptance is handled by the evidence rule below; these commands alone
do not prove a real native session used the skill.

Safe stop: all three wrappers and the selected combined journey use current
fixtures coherently. The installer may still perform its existing retirement
step until Slice 4; this slice neither requires nor asserts it.
Sizing: medium confidence. Fixture construction and native-case callers are one
cohesive journey; keep this slice unfinished until the whole journey is green.

### 3. Assess shared skills through their current behavior
Type: Behavior
Status: planned

Behavior: Given a maintainer reviewing a shared skill, its current instructions,
project context, and maintained behavior examples supply the review, including
the ADR skill's conflict and human-ownership behavior.

Change: Remove `src/skills/*/RECOGNITION.md` and the remaining practice-matching
metadata and preparation. Remove source-record requirements from tests, helpers,
source-copy fixture arguments, digests, prompts, and reports. In shared tests,
retain current ADR and payload assertions while deleting obsolete assertions and
setup. Align affected source skill references, authoring/release guidance, ADR
vocabulary, and current historical material; do not move recognition content to
another file. Slice 2 has already removed the delivery fixture's dependency on
the old source records.

Proof loop: Walk one ADR conflict review through the maintained instructions:
the skill uses the project's current authority, cites the conflict, stops the
conflicting implementation, and leaves the decision to the human. Then run:

```sh
bash tests/adr-awareness-codex-alternate-layout.sh
bash tests/dough-adr-awareness-context.sh
bash tests/install-omits-internal.sh
bash tests/story-payload-update.sh
bash tests/retrospective-reference-payload.sh
bash tests/pin-and-inspect.sh
```

Inspect shared support callers so removed source-copy parameters cannot leave
another maintained test attempting to read deleted files. This is removal of
the metadata dependency, not rewriting unrelated skill behavior.

Safe stop: current skill review and installation proof work with the maintained
behavioral source. All dedicated practice-matching records and their consumers
are removed; the final installer special case is owned by Slice 4.
Sizing: medium confidence; repeated records are one removal rule, not separate
slices or platform-specific implementations.

### 4. Install and verify the declared release payload
Type: Behavior
Status: planned

Behavior: Given matching, changed, or missing managed installed content, ordinary
installation/update establishes or preserves the declared release payload under
the existing fidelity policy; explicit force retains its current replacement
behavior.

Change: Delete recognition-specific preflight, unlink, and verification branches
from `install.sh`. Delete `tests/install-reports-real-retirement-failure.sh` and
dedicated retirement collision cases, fixtures, and assertions in mixed tests.
Remove obsolete retirement claims from installation documentation and helpers.
Keep byte comparison, copy/verification-failure handling, record certification,
configuration/coexistence, and managed-path collision safety. Reuse the existing
baseline implementation; no fidelity rewrite is required without evidence.

Proof loop: Exercise real operations against disposable targets using:

```sh
bash tests/install-repeat-force-public-payload.sh
bash tests/install-reports-real-copy-failure.sh
bash tests/update-force-restores-latest.sh
bash tests/update-reports-replacement-failure.sh
bash tests/update-skip-verified.sh
bash tests/update-refuses-unverifiable.sh
bash tests/self-installation-baseline.sh
bash tests/install-all-tools.sh
```

Inspect observations: matching content passes, edited/missing managed content
stops ordinary update before writes, explicit force installs the complete latest
payload, and failed replacement retains the last certified records. Preserve
existing configuration and unrelated-file assertions; add only genuinely missing
proof of a current promised outcome. No removed-path absence assertion is valid.

Safe stop: the complete simplified installation contract passes, and the story's
product cleanup can be reviewed. Run the final checks below before completion.
Sizing: medium-high confidence; removal is localized and existing integration
tests own the retained behavior.

## Verification, review, and closure

| Promise | Owner and observable proof |
| --- | --- |
| Direct authoring; internal extraction fully removed | Slice 1 walkthrough and current-tree diff/link review |
| Useful ordinary update then fresh skill use retained | Slice 2 journey and native evidence assessment |
| Recognition records and matching preparation removed | Slice 3 behavior walkthrough and current-source fixture checks |
| Installed fidelity and safe update policy preserved | Slice 4 matching/drift/missing, force, and failure observations |
| Obsolete tests/assertions deleted, never inverted | Each owning slice's diff review; final semantic review |
| Current documents describe remaining behavior | Each owning slice; final review of mixed docs/ADRs/planning |
| Temporary story, plan, and evidence leave the current tree | Ordinary retrospective/wrap-up after execution, using Git for recovery |

Native evidence: assess applicable Codex, Cursor, and Claude evidence under
ADR 0005 against the changed fixture and preserved installed behavior. Reuse
unchanged integration evidence with an explicit applicability judgment; do not
reuse proof of the removed historical transition. If current update/use proof is
invalidated, keep that requirement pending and obtain the affected host's existing
combined selected journey through its wrapper's `--native --case delivery/updated-use`
entry point, or link it to the existing SEED-007 acceptance work before declaring
source-only completion. No new per-skill/per-host matrix or release is implied.

Final verification during execution: `npm run lint`, `npm test`, and
`git diff --check`. Inspect every failure before dropping a case. The runner
auto-discovers shell tests; deletion normally needs no explicit runner change.
The self-installation check compares installed copies to their recorded tag,
so source-only changes do not require hand-synchronizing managed installations.

Review the complete current tree, including ignored planning and installed
guidance, for actual dependencies or accounts of the removed feature. A temporary
search for `extract-guidance`, `RECOGNITION.md`, `EXTRACTION.md`,
`SOURCE-CHECKSUMS.json`, and related concepts is a review aid, never a committed
absence test. Inspect meanings and links; preserve unrelated uses of common
words. If a remaining actual dependency conflicts with the selected outcome,
resolve that concrete conflict rather than silently leaving it out of scope.
No completion claim while required removals or retained-behavior proof are missing.

Retain this plan and the seed for execution review. Wrap-up deletes spent story,
plan, and evidence and removes the backlog entry; preserve unfinished sibling
work. Enduring content explains only the remaining product.

## Construction assessment

The legacy delivery bootstrap is a separable prerequisite to deleting source
records; it has its own slice before that deletion. Installer retirement is
removed only after maintained fixtures stop depending on it. Each slice includes
its tests, documentation, and local cleanup rather than handing those to a later
testing or documentation slice.

Four Behavior slices exercise one model: author current guidance, assess it by
behavior, and compare installations to declared releases. No Structure slice,
new representation, or numeric sizing exception is needed. No further
slice-specific decomposition concern was identified in this assessment. Native
evidence applicability remains an explicit execution-time verification question.

## Slice-refinement assessment

Reviewed in place after construction under `dough-slice-plan-refinement`.
Reassessment retained the smallest solution: delete the obsolete responsibilities
and reuse tagged-payload comparison. The four slices are Ready: each has one
cohesive outcome and proof loop, the fixture prerequisite precedes record
deletion, and later outcomes do not need earlier removal targets. No slices
were replaced in this pass; resulting count is four, with no sizing exceptions
or resplit recommendation. Ready for direct execution when separately authorized.
Native proof remains subject to the explicit evidence rule above.

## Learnings and accepted proof

- Removing `extract-guidance` from `internal_skill_names` also drops its
  source-existence and installed-omit checks. That is deletion of obsolete
  coupling, not a new absence assertion.

### Slice 1 accepted proof

- Direct authoring: remaining `AGENTS.md` Layout and Behavior review, plus
  ADR 0003 Proposed as drafting under `src/skills/`, walk through
  `src/skills/dough-pfe/SKILL.md` without an extraction step. Setup: none.
- Payload omit of remaining internals:
  `bash tests/install-omits-internal.sh` pass. Setup: disposable target with
  unrelated sentinels; `install.sh --platform` codex, cursor, then claude.
  Observations: remaining `internal_skill_names`, `assert_public_payload`,
  `assert_internal_absent`, `expect_files`.
- Ordinary execution-payload update:
  `bash tests/execution-payload-update.sh` pass. Setup: tagged 0.1.1 then
  0.1.2 fixtures; older install then apply from remembered SOURCE. Observations:
  upgraded payload and runtime entrypoints; remaining `RECOGNITION.md`
  omission; collision/edit/--force and host-hook refusal.
