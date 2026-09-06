# Adopt released ADR awareness without redundant local guidance

## Source and readiness

- Selected outcome: [SEED-004, Story 4](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install), backlog item four.
- Worktree: `codex/adopt-adr-awareness`, based on story refinement `1f76b9b`.
- Planning method: borrowed Donut's `slice-planning` skill, `planning.mdc`, and
  `problem-decomposition.mdc`; checked the `slice-plan-refinement` trigger gate.
- Status: planned; no implementation, native verification, release, or Donut
  migration has been performed by this plan-writing pass.
- **Refinement recommended: slices 3 and 23.** Their context transfer and actual
  shared-caller cleanup have low sizing confidence. Each has one final outcome,
  but the current Donut starting state may expose another implementation beat.
  Refine those leaves in this plan before executing them; do not repeat story
  questions already answered. Other leaves have bounded paths and named proofs.

## Goal and scope

A developer obtains released Open Dough through the existing safe install or
update flow, authorizes replacement of one equivalent ADR-awareness practice,
and ends with the redundant original removed, its callers repaired, and working
shared ADR guidance in Codex, Cursor, and Claude Code. Preserve local ADR context,
human decision authority, automatic architecture-triggered application, and
unrelated instructions. A suggestion, successful file copy, or one tool's use
does not complete adoption.

Fresh installation is the main path. An existing installation may reach the
same one-time cleanup through the existing updater or authorized legacy
reinstall. A current version must not conceal pending local cleanup; ordinary
updates after adoption must preserve the result. The renamed-equivalent example
remains within ADR awareness and does not introduce general migration support.

Exclude new extraction, arbitrary skill/rule migration, recurring recognition
of new matches, local-policy merging, rollback machinery, home-level scanning,
new installer/release APIs, and wider documentation restructuring. Open Dough
self-use is independent and can wait. Borrowing the planning skill does not
install it into Open Dough or distribute its internal acceptance guard.

## Current decisions and execution context

1. Keep the existing three-file public payload and numeric `VERSION` record.
   Put the bounded adoption instructions beside the identifying characteristics
   in `src/skills/dough-adr-awareness/RECOGNITION.md`. Add short, explicit entry
   links from the installation guide and `src/skills/dough-update/SKILL.md`.
   There is no new skill name or public file to discover. The ordinary
   `dough-adr-awareness/SKILL.md` continues to own ADR-checking behavior.
2. The installing/updating agent performs optional assessment and authorized
   cleanup after verified installation or a usable current installation. The
   installer and release helpers continue writing only their declared payload
   and version record. Their `--force` flag never authorizes local-skill deletion.
   Follow only the inspected release's adoption instructions, not an untagged
   checkout or a test prompt containing the implementation algorithm.
3. An assessment request changes nothing. An install/update request without
   cleanup authorization preserves local guidance. When replacement is already
   authorized, explain its scope and proceed without requesting it again.
   Equal-version update keeps installed files/record unwritten; separately
   authorized cleanup may change only the assessed local practice and callers.
4. Transfer required existing adopter context before deleting its only source.
   Use the existing local architecture guidance as the home where appropriate;
   do not invent status precedence, human approvals, or exceptions. Necessary
   context transfer is included; an uncovered local behavioral policy blocks
   that removal and returns to the story's stated boundary.
5. Repair actual references, including references inside mixed documents and
   native discovery links. Keep local ADR decisions, statuses, and history;
   mechanical skill-link changes in their documentation are permitted. Select
   each running tool's native installation through the existing mapping, not
   by guessing from directories or redirecting every tool to Codex's copy.
6. A shared original stays available until every affected integration has a
   usable replacement. Stage installations independently and remove the shared
   original once. Preserve other tools' payload bytes and unrelated guidance;
   the authorized migration may repair shared local callers and the obsolete
   original link. Do not treat that bounded cleanup as cross-tool updating.
7. Development uses disposable targets and controlled tagged sources. The
   existing `tests/helpers/release-fixture.bash` provides release construction;
   `tests/support/dough-adr-awareness-delivery-to-use.sh` provides useful native
   assertions. Reuse host invocation/isolation patterns from its three wrappers
   within current permissions, without widening access to real projects.
   Extend only the support needed by the immediate scenario, not a new harness.
8. Add adoption scenarios under capability-named `tests/` paths, for example
   `tests/adr-adoption-<host>.sh --native <scenario>`. These are planned entry
   points, not existing commands. Their default shell checks must distinguish
   fixture validation from native execution; a skipped native run is not a pass.
   Capture file bytes, existence, and symlink targets: the existing file-only
   snapshot cannot prove discovery-link preservation or removal.
9. Keep Open Dough source/test changes in this worktree. The safe-install task
   owns installer mechanics and the pin/inspect guide corrections. Integrate its
   accepted changes before the fresh-install leaves; preserve its commands and
   add only the optional adoption handoff. Do not edit its worktree or duplicate
   its plan. No change to the backlog order is needed.

### Dependency gates

- **Controlled development:** slices 1–8 can proceed while safe installation is
  unfinished. Test setup mounts the candidate's exact tagged payload into a
  disposable already-installed target; that setup is not fresh-install evidence.
- **Before slice 9:** SEED-001 Story 5a's accepted safe-install changes and
  required evidence must be integrated. Its current plan in `codex/safe-install`
  is marked as needing reconciliation. Do not use its old clone-then-run guide
  or infer readiness from this branch's historical plan.
- **Before slice 20:** slices 1–19 and their applicable native checks pass on the
  integrated candidate; required checks pass; a release containing that exact
  behavior is available from the supplied URL. Use Story 5d's existing release
  workflow, with the maintainer's version and publication authorization. Verify
  an independent fetch's tag, commit, metadata, and payload. Do not invent a
  version, move an existing public tag, or make release creation a second plan
  here. If the base release ships first, publish the accepted adoption changes
  through the same workflow afterward. A GitHub Release object is unnecessary.
- **Before real removal (23):** each affected tool's published replacement has
  been natively discovered and used in Donut; target drift and ownership of
  touched files have been checked. Actual replacement authorization must exist.
  This request authorizes planning only, so no Donut writes happen now.

## Outside-in proof and ownership

The first native scenario establishes a shared rubric. Later platform leaves
reuse it without placing expected implementation steps in the user prompt.
Each platform run records its tool version, actual entry and source URL/tag/
commit, selected paths, transcript, and decisive file/symlink observations.

| Promise / refined example | Owning slices | Observable evidence |
| --- | --- | --- |
| Explain equivalence and affected callers; assessment makes no changes | 2 | Native response covers the practice, retained context, and exact proposed edits; target snapshot unchanged. |
| Authorized cleanup removes only redundant ADR guidance | 3, 8, 11, 14, 23 | Original absent, callers resolve to replacement, mixed instructions/context retained, no unrelated writes. |
| Renamed guidance is matched by behavior, not provenance | 8 | Different project/name/path still produces one justified ADR replacement. |
| Current installed version does not hide unperformed cleanup | 2–3 | Native updater reports current with no installer/payload/record writes, then separately assesses or performs the requested cleanup. |
| Preserve original on uncovered behavior, missing context, or ambiguity | 6 | A native refusal names the concrete gap and leaves original and callers unchanged. |
| Preserve shared original until all affected tools are ready | 7, 20–23 | Missing integration leaves cleanup pending; final migration follows three native readiness observations and repairs the Claude link. |
| Correct first-install handoff; failed install never removes original | 9–11, 14 | Agent follows the accepted pinned guide; verified install permits cleanup; installer failure leaves original intact with a truthful partial-state report. |
| Plain installation is not authorization to remove local guidance | 9a | Successful native install-only request leaves original, local context, and callers untouched. |
| Native explicit ADR use after removal | 4, 12, 15; 24–26 | Fresh sessions discover only the replacement, select current ADRs, cite material decisions, and preserve human authority. |
| Automatic architecture-triggered use after removal | 5, 13, 16; 27–29 | Fresh sessions given architecture-shaped work without an ADR/skill hint apply the retained rule and shared behavior. |
| Local context and ADR status interpretation survive | 3–5, 12–16, 23–29 | Retained context remains reachable; Donut ADR 0001 stays Accepted despite its filename; Proposed ADR 0002 is not binding. |
| Ordinary updates preserve cleanup; current update stays unwritten | 17–19; 30–32 | Older fixture updates preserve repaired callers; real current-version calls make no installer/payload/record writes and recreate no original. |
| Safe release contract, selected-host payload, coexistence, and omissions | Existing Story 5a/5b evidence where valid; 9–19, 20–32 | Inspected source identity agrees, exact payload/record verified, unrelated and other-host copies preserved, internal skills/guard absent. |
| One shared adoption workflow with usable entry links | 2–3, 9, 11, 14, 17–19 | Native users reach shipped recognition instructions through install/updater; no copied migration algorithm in adapters or prompts. |
| Installation and cleanup outcomes reported separately; no false rollback | 6–7, 10, 23 | Transcript distinguishes installed/pending/incomplete state and actual changed paths without claiming unobserved success or recovery. |

## Ordered slices

All statuses start planned. A leaf targets roughly five minutes of edits and
focused verification, with medium confidence unless stated otherwise. Native
process runtime may dominate a single focused proof; record the measured reason
if it crosses ten minutes. This is not an exemption for multiple edit cycles.
At five minutes inspect hidden work; at ten minutes stop non-exempt work and
refine the remaining leaf. Every boundary keeps existing checks green.

### 1. Prepare one disposable ADR assessment target
Type: Structure
Status: planned
Proof: Validate one Donut-derived fixture with the original skill, minimum live
callers/context, current tagged payload, and a file/symlink snapshot; run existing
payload-install checks unchanged. No native adoption claim yet.

Structure: Extend the existing fixture support only enough for slice 2's native
read-only assessment. Keep Donut-specific data in tests and real projects untouched.

### 2. Explain a proposed ADR replacement without changing the project
Type: Behavior
Status: planned
Proof: One fresh Codex invocation of the installed updater requests an assessment
at the current fixture version. Observe a coverage/caller/context explanation,
no installer call, and an unchanged complete target snapshot.

Behavior: Equivalent original plus current installed payload → ask for assessment
→ receive a bounded replacement proposal without writes. Add the shared record's
assessment instructions and the updater's conditional link in this leaf.

### 3. Replace one authorized local ADR practice in Codex
Type: Behavior
Status: planned
Proof: On a single-integration copy of slice 2's target, native Codex receives
replacement authorization in its initial request. Observe original removal,
coherent caller repair, retained required context, and unchanged installed
payload/record, ADR decisions, and unrelated files. It must not ask again.

Behavior: Equivalent original and usable current replacement → authorize cleanup
→ one complete local replacement. Include all refusal gates before enabling
destructive behavior; later refusal leaves verify them. Sizing confidence: low;
refine the concrete context-transfer path before execution.

### 4. Use the Codex replacement explicitly after cleanup
Type: Behavior
Status: planned
Proof: One fresh Codex session after slice 3 invokes `$dough-adr-awareness` for a
relevant ADR check, selects and cites current records, and changes no decisions
or implementation. Original skill and fallback paths are absent.

Behavior: Completed replacement → explicit native invocation → effective shared
ADR checking with retained adopter context.

### 5. Apply ADR guidance automatically in Codex
Type: Behavior
Status: planned
Proof: A separate fresh Codex session receives an architecture-shaped request
with no ADR or skill-name hint. Observe the repaired local trigger reach shared
guidance, cite the constraining ADR, and stop conflicting implementation.

Behavior: Architecture-shaped work after cleanup → ordinary work request → the
required ADR practice applies without a manual skill invocation.

### 6. Keep local guidance when replacement coverage is unresolved
Type: Behavior
Status: planned
Proof: A native Codex refusal scenario supplies a local ADR practice with a
useful requirement the shared guidance cannot satisfy. Observe a specific gap
and unchanged original/callers. Use missing-context or ambiguous-match data
only to exercise the same eligibility boundary, not a new merging policy.

Behavior: No sound equivalence decision → request replacement → preserve working
local guidance and report cleanup pending. Plain assessment/install permission
must not be promoted into removal authorization.

### 7. Keep a shared original while another tool still needs it
Type: Behavior
Status: planned
Proof: A mixed-tool fixture has Codex's replacement but Claude's original-skill
symlink still depends on the shared source and lacks a usable replacement.
Native cleanup reports the missing integration and preserves source/link/callers.

Behavior: One affected integration is not ready → authorize ADR adoption → keep
the shared original available and report the remaining cleanup prerequisite.

### 8. Replace a renamed equivalent inside mixed local guidance
Type: Behavior
Status: planned
Proof: One native Codex adoption uses a different project name and original
skill name/path with equivalent ADR behavior, plus a mixed document containing
build instructions. Observe justified replacement with build instructions intact.

Behavior: Renamed equivalent ADR practice → authorized adoption → matching and
cleanup succeed on behavior rather than identity, within the same scope.

### 9. Finish fresh installation with the optional ADR cleanup
Type: Behavior
Status: planned
Proof: After the safe-install gate, a native Codex agent starts from the
README-linked guide in a fresh disposable adopter and receives one install-and-
replace request. The inspected numeric release installs, the shared adoption
instructions are reached, and authorized cleanup completes without requiring a
second update. Source identity, payload, record, and preservation assertions pass.

Behavior: Fresh adopter with equivalent local ADR guidance → install and replace
→ installed shared guidance takes over. Add only the short shared-guide handoff;
do not rewrite installer mechanics or the accepted pin/inspect sequence.
Include the candidate README and linked guide in the tagged fixture; the existing
payload-only release builder does not yet copy those documentation entry points.

### 9a. Preserve local guidance on an installation-only request
Type: Behavior
Status: planned
Proof: One fresh native Codex install request supplies no cleanup authorization.
The released payload installs successfully while the original skill, discovery
links, local context, and callers remain byte-identical. Any suggested replacement
stays a suggestion; successful installation must not be reported as migration.

Behavior: Fresh adopter with local ADR guidance → request installation only →
receive Open Dough without unauthorized local-guidance removal.

### 10. Preserve the original when installation does not succeed
Type: Behavior
Status: planned
Proof: Repeat the install-and-replace entry with the existing deterministic
copy-failure hook. Native output names possible incomplete installation, retains
the last successful record or its absence, and leaves the original/callers intact.

Behavior: Installation fails before cleanup eligibility → installation/adoption
request → no local removal and no migration-success or rollback claim. Reuse
Story 5a's separate fetch/validation/containment proofs where unchanged.

### 11. Complete the fresh adoption journey natively in Cursor
Type: Behavior
Status: planned
Proof: One native Cursor install-and-replace run repeats slice 9's rubric with
its native root and a single affected integration. Shared instructions perform
the cleanup; companion guidance and other payload sentinels remain unchanged.

Behavior: Fresh Cursor adopter → authorized installation/adoption → one complete
replacement through the shared workflow. Keep host adaptations minimal.

### 12. Use the Cursor replacement explicitly
Type: Behavior
Status: planned
Proof: One fresh Cursor session after slice 11 discovers and invokes
`/dough-adr-awareness`; apply slice 4's ADR rubric with the original absent.

Behavior: Completed Cursor replacement → explicit invocation → retained local
ADR behavior through the native shared skill.

### 13. Apply ADR guidance automatically in Cursor
Type: Behavior
Status: planned
Proof: A fresh Cursor session receives slice 5's architecture request without
an ADR/skill hint; the repaired automatic rule reaches shared guidance.

Behavior: Architecture-shaped work → native automatic rule application → current
ADRs constrain the work after original removal.

### 14. Complete the fresh adoption journey natively in Claude Code
Type: Behavior
Status: planned
Proof: One native Claude Code install-and-replace run repeats slice 9's rubric,
including its original discovery symlink and a single affected integration.
The source and obsolete link are removed coherently, with other guidance intact.

Behavior: Fresh Claude adopter → authorized installation/adoption → one complete
replacement through the shared workflow and native root.

### 15. Use the Claude Code replacement explicitly
Type: Behavior
Status: planned
Proof: One fresh Claude Code session after slice 14 discovers and invokes
`/dough-adr-awareness`; apply slice 4's rubric without the old source or symlink.

Behavior: Completed Claude replacement → explicit invocation → effective shared
ADR checking through native discovery.

### 16. Apply ADR guidance automatically in Claude Code
Type: Behavior
Status: planned
Proof: A fresh Claude Code session follows its retained repository guidance
for slice 5's architecture request, without a supplied ADR/skill hint.

Behavior: Architecture-shaped work → native guidance application → current ADRs
constrain work without relying on the removed original.

### 17. Preserve a Codex adoption through an ordinary newer release update
Type: Behavior
Status: planned
Proof: Publish only in the fixture a harmless higher numeric release containing
the same accepted adoption behavior. Native Codex invokes ordinary `$dough-update`
from the cleaned target; payload advances while context/callers remain unchanged
and no original is recreated. No new cleanup is requested or performed.

Behavior: Completed adoption and newer release → ordinary update → preserved
adoption with existing version/update semantics.

### 18. Preserve a Cursor adoption through an ordinary newer release update
Type: Behavior
Status: planned
Proof: Repeat slice 17's single update scenario natively in Cursor. Only its
selected payload/record advances; repaired callers and other integrations remain.

Behavior: Completed Cursor adoption → ordinary newer update → preserved adoption.

### 19. Preserve a Claude adoption through an ordinary newer release update
Type: Behavior
Status: planned
Proof: Repeat slice 17's single update scenario natively in Claude Code; verify
the removed original discovery link is not recreated and callers remain usable.

Behavior: Completed Claude adoption → ordinary newer update → preserved adoption.

### 20. Make the published replacement usable in Donut's Codex installation
Type: Behavior
Status: planned
Proof: After the release gate, inspect current Donut and its relevant working
changes. Use the published safe install/update route for Codex, keeping the
original. A fresh native explicit shared-skill check proves the selected release
is usable with Donut's retained context; record source and target evidence.

Behavior: Real Donut before shared cleanup → stage Codex's published replacement
→ Codex is ready while existing guidance remains available.

### 21. Make the published replacement usable in Donut's Cursor installation
Type: Behavior
Status: planned
Proof: Repeat slice 20's native readiness journey for Cursor, preserving Codex's
installed bytes and the still-required original/callers. Record independent proof.

Behavior: Real Donut during staged adoption → stage Cursor's replacement → Cursor
is ready without breaking another integration.

### 22. Make the published replacement usable in Donut's Claude installation
Type: Behavior
Status: planned
Proof: Repeat slice 20's readiness journey for Claude Code. Preserve other
payloads and the original discovery link until shared cleanup is ready.

Behavior: Real Donut during staged adoption → stage Claude's replacement → every
affected tool now has native readiness evidence for the published shared practice.

### 23. Remove Donut's shared original and repair its live callers once
Type: Behavior
Status: planned
Proof: Recheck target drift, required context, references, and removal authority.
Run the released adoption workflow in one selected native tool. Observe original
and obsolete symlink removal, coherent caller repair, and preserved ADR semantics,
unrelated work, and installed payload bytes. Report actual changed paths.

Behavior: All affected tools have ready replacements → authorized shared cleanup
→ one coherent Donut migration. Known callers are the two Cursor rules,
`.cursor/agent-map.md`, story-refinement, ADR README/ADR 0000, and the Claude link;
discover changes since refinement. Sizing confidence: low; refine against the
actual target before execution. Never use an unreviewed global text replacement.

### 24. Verify explicit ADR use in Donut's Codex after removal
Type: Behavior
Status: planned
Proof: Fresh native Codex explicitly invokes the installed shared skill after
slice 23. Observe real ADR selection/citations, ADR 0001's Accepted status despite
its filename, Proposed ADR 0002 excluded as binding, and human authority retained.

Behavior: Migrated Donut → explicit Codex ADR check → effective released guidance.

### 25. Verify explicit ADR use in Donut's Cursor after removal
Type: Behavior
Status: planned
Proof: Repeat slice 24's real-project rubric in a fresh native Cursor session;
record discovery and invocation independently, not a manual read of the file.

Behavior: Migrated Donut → explicit Cursor ADR check → effective released guidance.

### 26. Verify explicit ADR use in Donut's Claude Code after removal
Type: Behavior
Status: planned
Proof: Repeat slice 24's real-project rubric in a fresh native Claude Code
session without the old discovery link; record independent native evidence.

Behavior: Migrated Donut → explicit Claude ADR check → effective released guidance.

### 27. Verify automatic ADR application in Donut's Codex
Type: Behavior
Status: planned
Proof: In a fresh Codex session, request assessment of a concrete architecture
change without mentioning ADRs or a skill. Observe the repaired trigger load
relevant current ADRs. Choose a read-only assessment, not product implementation.

Behavior: Architecture-shaped Donut request → automatic Codex application → the
shared practice still governs work after original removal.

### 28. Verify automatic ADR application in Donut's Cursor
Type: Behavior
Status: planned
Proof: Repeat slice 27's single architecture-trigger scenario in fresh native
Cursor with its real repaired automatic rule and independent evidence.

Behavior: Architecture-shaped Donut request → automatic Cursor application →
effective shared ADR guidance.

### 29. Verify automatic ADR application in Donut's Claude Code
Type: Behavior
Status: planned
Proof: Repeat slice 27's scenario in fresh native Claude Code; demonstrate the
repository guidance reaches the replacement without the obsolete original link.

Behavior: Architecture-shaped Donut request → automatic Claude application →
effective shared ADR guidance.

### 30. Keep Donut's Codex adoption unchanged on a current-version update
Type: Behavior
Status: planned
Proof: Fresh native `$dough-update <published-url>` with no cleanup request
reports current. Observe no installer call or installed-file/record writes,
unchanged caller/context snapshots, and no recreated original.

Behavior: Current adopted Donut → ordinary Codex update → truthful no-write result.

### 31. Keep Donut's Cursor adoption unchanged on a current-version update
Type: Behavior
Status: planned
Proof: Repeat slice 30's current-version observation in native Cursor; verify
its own selected payload and all repaired local guidance remain unchanged.

Behavior: Current adopted Donut → ordinary Cursor update → truthful no-write result.

### 32. Keep Donut's Claude adoption unchanged on a current-version update
Type: Behavior
Status: planned
Proof: Repeat slice 30's current-version observation in native Claude Code,
including unchanged caller references and continued absence of the obsolete link.

Behavior: Current adopted Donut → ordinary Claude update → truthful no-write result.

## Verification and stopping rules

- Per changed behavior, run its focused native scenario and appropriate shell
  checks; preserve meaningful assertions rather than asserting prose structure.
  Use `bash tests/install.sh`, public-payload/omission checks, and
  `bash tests/update-when-needed.sh` when their boundaries are touched.
  Run `npm run lint` for executable test/helper edits; planning-only Markdown is
  excluded by repository formatting configuration. Run required repository checks
  on the integrated release candidate; do not rerun every native case after an
  independent platform leaf unless changed behavior invalidates its evidence.
- Use existing workflow safeguards for actual execution, adapting tooling to
  Open Dough. Donut's Nix, application tests, and formatting commands are not
  commands for this repository. Actual Donut edits follow its current guidance
  and preserve concurrent work. Do not mutate another task's checkout blindly.
- Tests may snapshot disposable targets; real Donut adoption must track only
  intended changes and reuse the developer's existing authorization. The first
  tool ready is not permission to remove a source still needed by another.
- A new context/policy gap stops the affected removal and is recorded here;
  do not expand into general reconciliation. After a second non-exempt overrun,
  reassess story versus leaf under the borrowed decomposition rule.
- Keep this plan as the single resume/evidence home. Record completed leaf
  observations and remaining gates here; no separate refinement report or
  `.planning/STATE.md` progress mirror. Close the story only after all required
  platform and real-adoption outcomes are observed.

## Per-platform evidence and current learnings

| Platform | Reusable prior proof, only where unchanged | Planned new evidence | Current status |
| --- | --- | --- | --- |
| Codex | Quick 007 slices 5–6 and 12: controlled equivalence and installed use; completed updater and safe-install evidence within valid boundaries. | 2–10 including 9a, 17, 20, 23–24, 27, 30. | Pending native adoption verification. |
| Cursor | Quick 007 slice 14: installed native ADR use and coexistence; completed updater and safe-install evidence within valid boundaries. | 11–13, 18, 21, 25, 28, 31; shared-removal result 23. | Pending native adoption verification. |
| Claude Code | Quick 007 slice 16: installed native ADR use and coexistence; completed updater and safe-install evidence within valid boundaries. | 14–16, 19, 22, 26, 29, 32; shared-removal result 23. | Pending native adoption verification. |

- Donut refinement baseline: `43f0dbe0d47840e31f4773723cfed2d663e56bc8`.
  Its `.claude/skills/adr-awareness` symlink targets the shared `.agents` original;
  simple file-only snapshots miss this relationship. Current state must be read
  again at real adoption because Donut has concurrent work.
- The original contains local context not all present in its callers. Removing
  its text without transferring that context would fail the selected outcome.
- `RECOGNITION.md` is already in all three native payloads, so this plan needs
  no fourth public file or new installer catalogue. Its instructions must be
  reachable through the real release's guide/updater, not just a fixture prompt.
- Native CLI executables were found during planning. Authentication, current
  tool versions, discovery, and the new behavior have not been verified in this
  pass. Existing wrappers' default fixture checks are not native evidence.
