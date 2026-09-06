# Turn a supplied project practice into usable public guidance

## Source

- [SEED-004, Story 1](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance)
- [Product backlog](../../PRODUCT-BACKLOG.md): first of the four newly queued
  stories, after the existing release/update stories.
- Planned with Donut's `slice-planning` skill on 2026-09-06.
- Status: refined; ready for execution. No feature implementation or native
  verification has been performed.

## Goal and scope

Give the Open Dough maintainer an internal skill that learns one supplied project
skill or rule, adapts it into reusable public guidance, preserves the behavior
that made it useful, and retains characteristics for recognition in any project.
The selected public result must be installable and usable in Codex, Cursor, and
Claude Code. This plan covers Story 1 only.

The user selected Doughnut's `adr-awareness` skill at
`/Users/terryyin/git/doughnut/.agents/skills/adr-awareness/SKILL.md` as the concrete
extraction example, producing `dough-adr-awareness`. The internal extraction skill
still accepts a source location at invocation; this example is not a hardcoded
source-project dependency.

The source skill reads `docs/adrs/`, uses the local ADR index and status metadata,
follows supersession links, cites relevant Accepted decisions, and flags conflicts.
It preserves human ownership of acceptance and exceptions, and limits proposal
authoring to requested draft help. Generalize the project-specific ADR location,
layout assumptions, and technology examples while keeping those behaviors.
Do not copy Doughnut's architectural decisions into public instructions or turn
ADR awareness into a new approval process.

Use controlled source-context copies and an unrelated adopter fixture. Do not
remove or replace guidance in the real Donut checkout. The first concrete public
output is a skill. Rule inputs must still be inspected for scope and application
requirements; never turn an automatically applied rule into an on-demand skill
and claim equivalence. A rule that needs unsupported delivery remains unresolved.
A general public-rule installer is not assumed necessary for this selected skill
example. If a standalone rule becomes the selected deliverable, revisit its
native application and distribution leaves before execution.

Exclude whole-project extraction, bulk migration, matching engines, local-file
replacement, conflict reconciliation in adopting projects, release publication,
new version semantics, global installation, and automatic contribution upstream.
Retaining recognition information is included; acting on it belongs to Stories
2–4. Unverified candidates must not be reported or distributed as proven results.

## Execution context and current decisions

- Baseline incorporated: planning commit `aaaf7ec` was continued on
  `codex/generalize-project-guidance`, first merged with `main` at `6af6445`,
  then synchronized after slice 4 with `main` at `15ab9cd`. The completed
  internal `release-version` skill, native host adaptations, release metadata,
  and installer-exclusion proof are present and must remain internal.
- `install.sh` currently copies only `src/skills/dough-update/SKILL.md` into the
  selected tool's skill directory. `tests/install.sh` exercises all three
  platforms, ordinary-repeat protection, forced replacement, and preservation.
- `src/skills/dough-update/SKILL.md` explicitly refuses installers writing outside
  that single file. Merely adding another payload to the installer would break
  native update. Expand the shared write contract together with its public
  documentation and installed updater adaptations; do not relax it to arbitrary
  project writes.
- [Accepted ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  governs tagged releases. Release `v0.1.0` has now been published, but
  version-aware install/update selection is still not implemented: the updater
  fetches the supplied repository's default branch. This story changes only the
  eligible payload and must not claim or pre-empt the pending tagged-selection
  stories. Publishing another release remains outside this request.
- Proposed internal name: `extract-guidance`. Use one internal behavioral source
  and minimal discovery adaptations, following the internal-skill convention
  present at execution. Do not place it in the distributed public payload.
- Keep each public skill self-contained under its source directory, with only
  supporting resources it actually needs. A compact companion Markdown record
  is sufficient for recognition; no database or similarity framework is needed.
  Record original name/relative-path clues, purpose, triggers, distinguishing behavior,
  and differences that would rule out replacement. Project identity is optional
  provenance, never a matching requirement. Exclude secrets and irrelevant local
  machine paths from distributable records.
- New native conventions must be checked in the relevant tool during execution.
  Available `codex`, `cursor`, and `claude` commands were located; this is not
  evidence of authentication, discovery, or successful invocation.

## Outside-in proof

Use comparable original/generalized runs on the same bounded ADR-aware change request;
judge behavior, not identical wording. Record inputs and decisive output evidence
in this plan. For public use, start fresh native sessions that have the installed
public guidance but cannot silently fall back to the original Doughnut skill.

| Promise / example | Owning slices | Observation |
| --- | --- | --- |
| One supplied source becomes a public candidate plus useful recognition characteristics | 1, 3; repeated in 13 and 15 | Native extractor produces a `dough-` candidate and descriptive record; source is unchanged and an unrelated-project equivalent fits the characteristics. |
| Required source context survives generalization | 2, 3, 5 | Dependency assessment and source-context substitution preserve accepted-status selection, supersession, conflict reporting, and human decision ownership without inaccessible source-project references. |
| An unresolved dependency or rule-application gap is reported honestly | 4 | Explains missing behavior and withholds suitability; no unverified candidate enters installable payload. |
| Another project can use the result with its own conventions | 6, 12, 14, 16 | Uses the supplied alternate ADR location and local status conventions without requiring Doughnut's layout or origin. |
| Install only eligible public guidance and supporting records | 7–9 | Selected-platform installer fixtures compare the complete payload and confirm internal skill/guard exclusion plus other-platform preservation. |
| Reinstall protection and explicit replacement remain truthful | 10 | Existing installation is preserved on ordinary repeat; authorized force replaces only the eligible selected payload. |
| Native update delivers a changed public skill | 11, 12, 14, 16 | Updater accepts the bounded payload, fetches from the supplied source under the current source-selection contract, and fresh use demonstrates the changed behavior. |
| Shared source, native discovery, invocation, and coexistence on all tools | 1, 7–16 | Separate evidence per tool; unrelated guidance and other tools' installations remain usable. |
| No actual project migration, source mutation, release-policy regression, or internal-guidance distribution | 1–4, 7–16 | Disposable targets, source/target diffs and focused existing regression checks; no deletion, migration, or premature tagged-update claims. |

## Ordered slices

### 1. Obtain a reusable candidate from one supplied skill
Type: Behavior
Status: done
Proof: In a disposable Open Dough checkout, discover and invoke `extract-guidance`
natively in Codex on one small self-contained source fixture. Inspect the candidate,
its recognition record, and the unchanged source in one extraction run.

Evidence: Codex 0.144.1 discovered `$extract-guidance` in a fresh disposable
checkout and produced `dough-acme-change-readiness/{SKILL,RECOGNITION}.md` with
`draft — unverified substitute`; the source SHA-256 remained
`2a1b947789e94a743e08424e07ad7fc93c1ee055e96c0be820660b562356f983`.
`bash tests/install-omits-internal.sh` proved the internal skill stays out of all
three installer outputs.

Behavior: A maintainer supplies one skill path → invokes the internal skill →
receives a public `dough-` candidate with project assumptions identified and enough
behavioral characteristics to recognize equivalents beyond the source project.

Implement the minimal usable internal skill and its discovery with this outcome.
Keep validation status explicit; a drafted candidate is not yet a proven substitute.
The descriptive record belongs to this result, not a separate metadata-only slice.

Sizing exception: the leaf has one extraction outcome and proof loop; a fresh
native Codex process may itself exceed five minutes, which decomposition cannot
reduce without replacing the required native observation.

### 2. Assess the context Doughnut's ADR-awareness behavior requires
Type: Behavior
Status: done
Proof: One native Codex extraction of the real Doughnut skill with its referenced
ADR context produces a dependency assessment that identifies the source index,
status/supersession conventions, conflict policy, and human decision boundary.

Evidence: A fresh Codex process inspected byte-identical controlled copies of the
source and directly required context and produced one bounded assessment; all 12
pre/post SHA-256 values matched. It identified index plus in-file status as the
current-decision signals, treated a conflicting filename convention as hygiene
to explain, kept proposal templates conditional on adopter context, and
left Cursor automatic-application parity to its native leaf.

Behavior: The supplied skill depends on source-project guidance → extract it with
that context → obtain a bounded assessment of what the reusable result must
self-contain and what the adopter must supply.

Inspect only required references. Do not recursively extract sibling skills or
turn the result into a complete ADR-authoring suite.

### 3. Produce a self-contained dough-adr-awareness candidate
Type: Behavior
Status: done
Proof: Using the assessment from slice 2, one native Codex extraction writes the
candidate and recognition record; inspection maps every required behavior to
self-contained guidance or explicit adopter context and finds no inaccessible
Doughnut reference.

Evidence: Native Codex produced the draft under
`.planning/extracted-guidance/dough-adr-awareness/`. The 157-line skill and
90-line recognition record map current-status authority, supersession, citations,
conflict stops, explicit exceptions, human lifecycle ownership, conditional
templates, and failure boundaries; forbidden-reference inspection found no
absolute machine paths, Doughnut ADR location, project decisions, or domain terms.
The inspected source checksum remained unchanged.

Behavior: The required context has been assessed → complete extraction → obtain
`dough-adr-awareness` with Accepted-decision selection, supersession following,
citation, conflict reporting, and human-owned exceptions intact.

### 4. Withhold suitability when essential behavior cannot be preserved
Type: Behavior
Status: done
Proof: Invoke the extractor on a bounded fixture whose required context is absent;
its output names the gap and keeps the candidate out of installable payload.
Include a rule-application example in the same focused rejection scenario.

Evidence: Native Codex initially exposed that the extractor still drafted an
unusable candidate; after the focused correction, a fresh run produced only
`ASSESSMENT.md`, labeled `suitability unresolved — no candidate produced`, and
separately named the absent required policy and the automatic-rule/on-demand-skill
delivery gap. No `SKILL.md`, `RECOGNITION.md`, or `src/` output existed, and the
source SHA-256 remained
`e43f2553b7899d0a3875ade17fb370df348eb4d538cc5b31de04a1d4b2c407c6`.

Behavior: A supplied rule requires automatic application that the candidate's
available delivery cannot preserve → assess extraction → report the unresolved
application gap rather than silently dropping it or declaring equivalence.

Keep partial work reviewable and the source untouched. An unsupported rule is not
proof of working public-rule distribution.

### 5. Use the generalized skill in the original project context
Type: Behavior
Status: done
Proof: Compare the original and generalized skill on the same small ADR-aware change
request in separate disposable source-context sessions in Codex. Observe relevant
Accepted citations, supersession handling, conflict reporting, and no unauthorized
status change or implementation work.

Evidence: Two fresh isolated Codex sessions, each containing exactly one of the
original or generalized skills, cited current ADR-0002 and its path, followed
ADR-0001→0002 supersession, stopped the conflicting Redis request, preserved
human lifecycle/exception ownership, and changed neither ADRs nor implementation.
Pre/post project and source digests matched. The reusable native fixture takes the
original source through explicit `ADR_AWARENESS_ORIGINAL_SKILL` input and embeds no
developer-local path.

Behavior: A candidate is available → substitute it for the original in a controlled
source context → obtain an equally effective ADR assessment without depending on the
original skill being loaded alongside it.

Adjust the candidate if the comparison exposes a gap; do not record success until
that gap is resolved. Never remove the original from the real project.

### 6. Apply ADR guidance in an unrelated project's own layout
Type: Behavior
Status: done
Proof: A fresh native Codex session uses the candidate in a disposable project
with a supplied ADR home at `architecture/decisions/` and a local index/status
convention; inspect the cited decision and absence of imposed Doughnut directories.

Evidence: A fresh Codex session with only the generalized skill used the fixture's
`architecture/decisions/` home, `Adopted`/`Replaced` lifecycle, and local exception
trail; followed ARC-07→ARC-12, cited the current record, stopped the telemetry
conflict, preserved human ownership, and imposed neither `docs/adrs/` nor source
project identity. The adopter tree plus candidate/recognition digests were
byte-identical before and after.

Behavior: An unrelated project supplies its own ADR context → invokes the
candidate → receives the same useful ADR assessment using its own decision records.

After slices 5–6 establish usefulness, include the candidate in the disposable
source payload for installation and remaining native checks. Public acceptance
still awaits all three platforms; no release is made by this plan. Preserve record clues that support renamed equivalents and exclude
lookalikes with different behavior; no actual matching or removal engine is added.

### 7. Install the evaluated public payload for Codex
Type: Behavior
Status: done
Proof: A focused installer fixture installs Codex's complete public payload,
compares the updater, ADR skill, and recognition record, and confirms internal
skills, the acceptance guard, unrelated files, and other-platform copies are absent
or unchanged as appropriate.

Evidence: The Codex installer now preflights the complete declared source before
writing, then installs `dough-update/SKILL.md` and the evaluated
`dough-adr-awareness/{SKILL,RECOGNITION}.md` under `.agents/skills/`. Focused
fixtures proved incomplete-source rejection before writes and preservation of
internal `extract-guidance`/`release-version`, the repository guard, unrelated
project content, and Cursor/Claude installations.

Behavior: An evaluated public skill is in the fixture source payload → run installation for
one selected platform → obtain all material needed to use it, alongside the
updater, without distributing internal skills or the acceptance guard.

Use the smallest explicit public payload boundary needed for these skills. Reject
missing required source material before reporting success. Do not copy arbitrary
repository content or treat an unresolved extraction draft as public payload.

### 8. Install the evaluated public payload for Cursor
Type: Behavior
Status: done
Proof: The same focused installer fixture selects Cursor, compares its complete
public payload, and confirms Codex, Claude Code, unrelated guidance, and internal
Open Dough material are unchanged or absent as appropriate.

Evidence: Cursor now selects the same complete public payload declaration as
Codex and installs it only under `.cursor/skills/`. A parameterized fixture proved
all three files match shared source, incomplete source stops before writes, and
Codex, Claude, internal, guard, and unrelated material remain unchanged.

Behavior: An evaluated public payload is available → select Cursor installation →
obtain the same shared guidance through Cursor's native skill directory only.

### 9. Install the evaluated public payload for Claude Code
Type: Behavior
Status: done
Proof: The same focused installer fixture selects Claude Code, compares its
complete public payload, and confirms Codex, Cursor, unrelated guidance, and
internal Open Dough material are unchanged or absent as appropriate.

Evidence: Claude Code now selects the one shared three-file public payload and
installs it only under `.claude/skills/`. The same parameterized fixture proved
source completeness before writes, exact installed content, and preservation of
Codex, Cursor, internal, guard, and unrelated material. Cross-platform installer
branches now vary only by native destination root.

Behavior: An evaluated public payload is available → select Claude Code installation
→ obtain the same shared guidance through Claude Code's native skill directory only.

### 10. Preserve existing guidance on repeat installation
Type: Behavior
Status: done
Proof: One focused installer scenario edits the installed public skill, observes
ordinary-repeat rejection with no partial payload change, then applies explicit
force and compares the resulting selected payload and preserved sentinels.

Evidence: A Cursor fixture proved a collision at the later ADR skill stops before
the earlier updater is written; with all three managed files locally edited,
ordinary repeat left the complete tree digest unchanged. Explicit `--force`
restored exactly the declared payload while preserving sidecars, unrelated project
guidance, and Codex/Claude copies.

Behavior: The selected public payload already exists → repeat installation →
preserve it unless replacement was explicitly requested, in which case replace
only the declared managed payload and report the actual result.

This is the existing installer's repeat/force contract applied to expanded public
payload, not reconciliation of unrelated local originals. Cover a collision at
the new skill as well as the updater so no early writes precede a later conflict.

### 11. Let the updater refresh the expanded public payload
Type: Behavior
Status: done
Proof: A disposable source contains a bounded public-skill improvement → invoke
the updated updater in Codex → observe allowed payload writes and verified source
identity; existing source-selection and failure tests remain applicable, and the
change does not claim version-aware selection.

Evidence: Native Codex used the updated tracked skill to clone a disposable source,
reported its origin and exact commit, validated the three-file allowlist, refreshed
the selected payload, and byte-verified it. Source, unrelated project content, and
Cursor/Claude copies retained their digests. The instructions and split installation
guide explicitly retain default-branch selection, distinguish it from published
`v0.1.0`, and document the truthful one-time bootstrap for older single-file updaters.

Behavior: An adopter requests an update from a supplied source → the updater
validates and installs eligible public guidance → the selected installed payload
matches that source under the current supplied-source update contract without
changing release selection.

Update the single-file write restriction, affected usage text, and payload checks
coherently. Retain failures without success claims, preservation of other tools,
and all completed behavior. If an older updater refuses the expanded
installer, document explicit bootstrap using the existing installer contract;
do not claim an old updater can perform a migration it actively rejects.

### 12. Use an installed improvement natively in Codex
Type: Behavior
Status: planned
Proof: In a disposable Codex adopter, install the public skill, update it from the
fixture source to a known small behavior improvement, then start a fresh session
and invoke it. Observe that improvement in the alternate-layout ADR assessment.

Behavior: Codex has the previous public skill → update and invoke the installed
replacement → use the changed ADR-awareness behavior with supporting context intact.

This is one delivery-to-use proof, not file comparison alone. Record discovery,
invocation, actual behavior, and coexistence with another installed integration.

### 13. Extract guidance natively in Cursor
Type: Behavior
Status: planned
Proof: Discover and invoke the shared internal skill in a fresh Cursor checkout
with existing guidance present; apply the focused extraction acceptance scenario
using the selected ADR-awareness source and inspect its actual candidate,
recognition record, and suitability assessment.

Behavior: A maintainer supplies a source in Cursor → invokes the internal skill →
receives the same reusable candidate and honest suitability assessment through
Cursor's native discovery path.

Use only minimal host adaptation; keep shared instructions in one source.

### 14. Use an installed improvement natively in Cursor
Type: Behavior
Status: planned
Proof: Repeat the bounded public delivery-to-use scenario from slice 12 in Cursor,
with source-context and alternate-layout requests evaluated by the same ADR-awareness rubric.
Record the selected installation and unchanged other-platform guidance.

Behavior: Cursor has the previous public skill → update and invoke the installed
replacement → use the changed ADR-awareness behavior with local context intact.

### 15. Extract guidance natively in Claude Code
Type: Behavior
Status: planned
Proof: Discover and invoke the shared internal skill in a fresh Claude Code
checkout with existing guidance present; apply the focused extraction acceptance
scenario using the selected ADR-awareness source and inspect its actual candidate,
recognition record, and suitability assessment.

Behavior: A maintainer supplies a source in Claude Code → invokes the internal
skill → receives the same reusable candidate and honest suitability assessment
through Claude Code's native discovery path.

### 16. Use an installed improvement natively in Claude Code
Type: Behavior
Status: planned
Proof: Repeat the bounded public delivery-to-use scenario from slice 12 in Claude
Code, with source-context and alternate-layout requests evaluated by the same
rubric. Record the selected installation and unchanged other-platform guidance.

Behavior: Claude Code has the previous public skill → update and invoke the
installed replacement → use the changed ADR-awareness behavior with local context intact.

## Verification and stopping rules

Use `bash tests/install.sh` for installer changes and add focused shell checks
under `tests/` only where new packaging behavior needs them. `bash scripts/test.sh`
is the repository-wide shell runner. Use `npm run lint` for touched executable
files. Native demonstrations prove instruction behavior; string assertions and
file copying alone do not. Run checks appropriate to changed scope and broaden
only for new concerns. A partial candidate remains visibly unverified until the
substitution proof succeeds, and no slice ends on committed failing tests.

The slice target is about five minutes, including focused verification. This is
not an execution-time guarantee. At five minutes, inspect hidden outcomes; at ten,
preserve progress and use slice-plan-refinement unless a focused test's runtime
alone accounts for the duration. An unavailable native tool leaves its evidence
pending rather than being replaced by another tool's success.

| Platform | Internal extraction | Original-context equivalence | Unrelated-project use | Installation/update/coexistence |
| --- | --- | --- | --- | --- |
| Codex | Pending: 1–4 | Pending: 5 | Pending: 6, 12 | Pending: 7, 10–12 |
| Cursor | Pending: 13 | Pending: 14 | Pending: 14 | Pending: 8, 10–11, 14 |
| Claude Code | Pending: 15 | Pending: 16 | Pending: 16 | Pending: 9–11, 16 |

## Readiness and learnings

Refinement completed on 2026-09-06. Original slice 2 became dependency assessment
and candidate-production leaves; original slice 6 became one selected-platform
installation leaf per host; original slice 8 was narrowed to the current updater's
expanded-payload behavior, with delivery-to-use proof left to the existing native
host leaves. Original slice 1 remains one cohesive behavior with an explicit native
process runtime exception. Every remaining leaf has one proof loop.

Planning observations that affect execution:

- The selected Doughnut skill depends on local ADR status and authority conventions;
  changing a path alone would not prove preservation of its decision behavior.
- Both installer and updater enforce a single-skill payload today; distribution
  cannot be completed by editing the installer alone.
- Incorporated release work adds internal `release-version`, thin native host
  adaptations, published `v0.1.0` metadata, and explicit installer-exclusion
  evidence, but not tagged install/update selection. Preserve that internal/public
  boundary and ADR 0003's version-selection contract.
- The user explicitly selected Doughnut's `adr-awareness` skill as the first
  extraction example. Its public form is `dough-adr-awareness`; the internal skill
  remains source-selectable. Standalone public-rule distribution is outside this
  concrete delivery; do not claim it is demonstrated by a skill-only installer.
