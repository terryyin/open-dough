# Turn a supplied project practice into usable public guidance

## Source

- [SEED-004, Story 1](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#generalize-project-guidance)
- [Product backlog](../../PRODUCT-BACKLOG.md): first of the four newly queued
  stories, after the existing release/update stories.
- Planned with Donut's `slice-planning` skill on 2026-09-06.
- Status: planned; **refinement recommended for slices 1, 2, 6, and 8**.
  No feature implementation or native verification has been performed.

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

- Baseline inspected: worktree branch `codex/extract-skills-rules` at `344f2b5`.
  Parallel `main` has advanced. Recheck installer/updater contracts before their
  leaves; incorporate relevant completed changes without reverting other work.
- `install.sh` currently copies only `src/skills/dough-update/SKILL.md` into the
  selected tool's skill directory. `tests/install.sh` exercises all three
  platforms, ordinary-repeat protection, forced replacement, and preservation.
- `src/skills/dough-update/SKILL.md` explicitly refuses installers writing outside
  that single file. Merely adding another payload to the installer would break
  native update. Expand the shared write contract together with its public
  documentation and installed updater adaptations; do not relax it to arbitrary
  project writes.
- [Accepted ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  governs tagged releases. This work changes eligible payload, not release
  selection. Use the current completed release/update implementation at execution;
  never reintroduce default-branch fetching over a delivered tagged-release flow.
  Prove delivery with disposable source repositories and fixture tags where
  required; publishing a real release is outside this request.
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
| One supplied source becomes a public candidate plus useful recognition characteristics | 1; repeated in 10 and 12 | Native extractor produces a `dough-` candidate and descriptive record; source is unchanged and an unrelated-project equivalent fits the characteristics. |
| Required source context survives generalization | 2, 4 | Source-context substitution preserves accepted-status selection, supersession, conflict reporting, and human decision ownership without unresolved source-project dependencies. |
| An unresolved dependency or rule-application gap is reported honestly | 3 | Explains missing behavior and withholds suitability; no unverified candidate enters installable payload. |
| Another project can use the result with its own conventions | 5, 9, 11, 13 | Uses the supplied alternate ADR location and local status conventions without requiring Doughnut's layout or origin. |
| Install only eligible public guidance and supporting records | 6 | Real installer fixture compares payload and confirms internal skill/guard exclusion and selected-platform preservation. |
| Reinstall protection and explicit replacement remain truthful | 7 | Existing installation is preserved on ordinary repeat; authorized force replaces only the eligible selected payload. |
| Native update delivers a changed public skill | 8, 9, 11, 13 | Updater accepts the bounded payload, fetches from supplied source under the established release policy, and fresh use demonstrates the changed behavior. |
| Shared source, native discovery, invocation, and coexistence on all tools | 1, 6–13 | Separate evidence per tool; unrelated guidance and other tools' installations remain usable. |
| No actual project migration, source mutation, or release-policy regression | 1–3, 6–13 | Disposable targets, source/target diffs and focused existing regression checks; no deletion or migration claims. |

## Ordered slices

### 1. Obtain a reusable candidate from one supplied skill
Type: Behavior
Status: planned
Proof: In a disposable Open Dough checkout, discover and invoke `extract-guidance`
natively in Codex on one small self-contained source fixture. Inspect the candidate,
its recognition record, and the unchanged source in one extraction run.

Behavior: A maintainer supplies one skill path → invokes the internal skill →
receives a public `dough-` candidate with project assumptions identified and enough
behavioral characteristics to recognize equivalents beyond the source project.

Implement the minimal usable internal skill and its discovery with this outcome.
Keep validation status explicit; a drafted candidate is not yet a proven substitute.
The descriptive record belongs to this result, not a separate metadata-only slice.

### 2. Preserve required context when adapting Doughnut's ADR-awareness skill
Type: Behavior
Status: planned
Proof: One native Codex extraction of the real Doughnut skill with its referenced
ADR context produces a candidate whose dependency assessment explains how
each required behavior is supplied without inaccessible source-project references.

Behavior: The supplied skill depends on source-project guidance → extract it with
that context → obtain a candidate that retains necessary ADR-awareness semantics
through self-contained guidance or explicit adopter context.

Inspect only required references. Do not recursively extract sibling skills or
turn the result into a complete ADR-authoring suite. Proposed destination for this
concrete candidate is `dough-adr-awareness`.

### 3. Withhold suitability when essential behavior cannot be preserved
Type: Behavior
Status: planned
Proof: Invoke the extractor on a bounded fixture whose required context is absent;
its output names the gap and keeps the candidate out of installable payload.
Include a rule-application example in the same focused rejection scenario.

Behavior: A supplied rule requires automatic application that the candidate's
available delivery cannot preserve → assess extraction → report the unresolved
application gap rather than silently dropping it or declaring equivalence.

Keep partial work reviewable and the source untouched. An unsupported rule is not
proof of working public-rule distribution.

### 4. Use the generalized skill in the original project context
Type: Behavior
Status: planned
Proof: Compare the original and generalized skill on the same small ADR-aware change
request in separate disposable source-context sessions in Codex. Observe relevant
Accepted citations, supersession handling, conflict reporting, and no unauthorized
status change or implementation work.

Behavior: A candidate is available → substitute it for the original in a controlled
source context → obtain an equally effective ADR assessment without depending on the
original skill being loaded alongside it.

Adjust the candidate if the comparison exposes a gap; do not record success until
that gap is resolved. Never remove the original from the real project.

### 5. Apply ADR guidance in an unrelated project's own layout
Type: Behavior
Status: planned
Proof: A fresh native Codex session uses the candidate in a disposable project
with a supplied ADR home at `architecture/decisions/` and a local index/status
convention; inspect the cited decision and absence of imposed Doughnut directories.

Behavior: An unrelated project supplies its own ADR context → invokes the
candidate → receives the same useful ADR assessment using its own decision records.

After slices 4–5 establish usefulness, include the candidate in the disposable
source payload for installation and remaining native checks. Public acceptance
still awaits all three platforms; no release is made by this plan. Preserve record clues that support renamed equivalents and exclude
lookalikes with different behavior; no actual matching or removal engine is added.

### 6. Install the evaluated public skill with its supporting material
Type: Behavior
Status: planned
Proof: Extend the existing shell installer fixture to install the eligible public
payload into each selected platform directory, compare required resources and
recognition records, and check unrelated/other-platform sentinels and exclusions.

Behavior: An evaluated public skill is in the fixture source payload → run installation for
one selected platform → obtain all material needed to use it, alongside the
updater, without distributing internal skills or the acceptance guard.

Use the smallest explicit public payload boundary needed for these skills. Reject
missing required source material before reporting success. Do not copy arbitrary
repository content or treat an unresolved extraction draft as public payload.

### 7. Preserve existing guidance on repeat installation
Type: Behavior
Status: planned
Proof: One focused installer scenario edits the installed public skill, observes
ordinary-repeat rejection with no partial payload change, then applies explicit
force and compares the resulting selected payload and preserved sentinels.

Behavior: The selected public payload already exists → repeat installation →
preserve it unless replacement was explicitly requested, in which case replace
only the declared managed payload and report the actual result.

This is the existing installer's repeat/force contract applied to expanded public
payload, not reconciliation of unrelated local originals. Cover a collision at
the new skill as well as the updater so no early writes precede a later conflict.

### 8. Let the updater refresh the expanded public payload
Type: Behavior
Status: planned
Proof: A disposable source contains a bounded public-skill improvement → invoke
the updated updater in Codex → observe allowed payload writes and verified source
identity; existing version selection/failure tests remain applicable.

Behavior: An adopter requests an update from a supplied source → the updater
validates and installs eligible public guidance → the selected installed payload
matches that source under the established release/update policy.

Update the single-file write restriction, affected usage text, and payload checks
coherently. Retain failures without success claims, preservation of other tools,
and all completed version behavior. If an older updater refuses the expanded
installer, document explicit bootstrap using the existing installer contract;
do not claim an old updater can perform a migration it actively rejects.

### 9. Use an installed improvement natively in Codex
Type: Behavior
Status: planned
Proof: In a disposable Codex adopter, install the public skill, update it from the
fixture source to a known small behavior improvement, then start a fresh session
and invoke it. Observe that improvement in the alternate-layout ADR assessment.

Behavior: Codex has the previous public skill → update and invoke the installed
replacement → use the changed ADR-awareness behavior with supporting context intact.

This is one delivery-to-use proof, not file comparison alone. Record discovery,
invocation, actual behavior, and coexistence with another installed integration.

### 10. Extract guidance natively in Cursor
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

### 11. Use an installed improvement natively in Cursor
Type: Behavior
Status: planned
Proof: Repeat the bounded public delivery-to-use scenario from slice 9 in Cursor,
with source-context and alternate-layout requests evaluated by the same ADR-awareness rubric.
Record the selected installation and unchanged other-platform guidance.

Behavior: Cursor has the previous public skill → update and invoke the installed
replacement → use the changed ADR-awareness behavior with local context intact.

### 12. Extract guidance natively in Claude Code
Type: Behavior
Status: planned
Proof: Discover and invoke the shared internal skill in a fresh Claude Code
checkout with existing guidance present; apply the focused extraction acceptance
scenario using the selected ADR-awareness source and inspect its actual candidate,
recognition record, and suitability assessment.

Behavior: A maintainer supplies a source in Claude Code → invokes the internal
skill → receives the same reusable candidate and honest suitability assessment
through Claude Code's native discovery path.

### 13. Use an installed improvement natively in Claude Code
Type: Behavior
Status: planned
Proof: Repeat the bounded public delivery-to-use scenario from slice 9 in Claude
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
| Codex | Pending: 1–3 | Pending: 4 | Pending: 5, 9 | Pending: 6–9 |
| Cursor | Pending: 10 | Pending: 11 | Pending: 11 | Pending: 6–8, 11 |
| Claude Code | Pending: 12 | Pending: 13 | Pending: 13 | Pending: 6–8, 13 |

## Readiness and learnings

**Refinement recommended: slices 1, 2, 6, and 8.** The generic extraction prompt's
first native proof, the source ADR conventions, expanded public payload boundary,
and integration with advancing release work have low sizing confidence. These
are named remaining uncertainties, not permission to bundle the entire story
into one implementation task. The other leaves have bounded demonstration or
focused regression paths; native test runtime may exceed the five-minute target.
Read the refinement trigger gate only; no slice-plan-refinement has been run.

Planning observations that affect execution:

- The selected Doughnut skill depends on local ADR status and authority conventions;
  changing a path alone would not prove preservation of its decision behavior.
- Both installer and updater enforce a single-skill payload today; distribution
  cannot be completed by editing the installer alone.
- Parallel release work may change the fetched-source boundary before execution.
  Recheck that boundary and amend the affected leaves without changing ADR 0003.
- The user explicitly selected Doughnut's `adr-awareness` skill as the first
  extraction example. Its public form is `dough-adr-awareness`; the internal skill
  remains source-selectable. Standalone public-rule distribution is outside this
  concrete delivery; do not claim it is demonstrated by a skill-only installer.
