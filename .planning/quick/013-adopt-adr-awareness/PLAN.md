# Adopt released ADR awareness without redundant local guidance

## Source and readiness

- Selected outcome: [SEED-004, Story 4](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#reconcile-guidance-on-install), backlog item four.
- Worktree: `codex/adopt-adr-awareness`, based on story refinement `1f76b9b`.
- Planning method: borrowed Donut's `slice-planning`, then
  `slice-plan-refinement`, with its planning and decomposition rules.
- Status: **ready for direct execution from slice 1**, subject to the named
  dependency gates. Refined in place on 2026-09-06 from plan commit `fa1176d`.
  No product implementation, native verification, release, or Donut migration
  was performed. There were no completed slices or execution overruns to alter.
- All 40 remaining leaves have one bounded proof loop. Their five-minute sizing
  is a hypothesis, not a runtime guarantee. Current scope and story order remain
  unchanged; first-install and real-adoption gates still apply.

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

- **Controlled development:** slices 1–9 can proceed while safe installation is
  unfinished. Test setup mounts the candidate's exact tagged payload into a
  disposable already-installed target; that setup is not fresh-install evidence.
- **Before slice 10:** integrate SEED-001 Story 5a's accepted safe-install changes
  and required evidence. Its `codex/safe-install` plan is now ready for execution
  but not executed; plan readiness is not acceptance. Do not use the old
  clone-then-run guide or infer readiness from this branch's historical plan.
- **Before slice 22:** slices 1–21 and applicable checks have passed on the
  integrated candidate; a release containing that behavior is available from
  the supplied URL. Reuse Story 5d's release workflow and the maintainer's version
  and publication authorization. Verify an independent fetch's tag, commit,
  metadata, and payload. Do not invent a version, move an existing tag, or create
  another release plan here. If the base release ships first, release accepted
  adoption changes through the same workflow afterward. A GitHub Release object
  is unnecessary. Reuse still-valid evidence; do not rerun all native cases
  merely to attach them to a new tag.
- **Before real removal (31):** slices 27–29 have proved each affected tool can
  use the published replacement from retained context without the original as
  a context source. Slice 30 has repaired live callers. Check the same assessed
  paths for drift and reuse existing replacement authorization. A changed target
  invalidates only affected assessment/readiness claims; keep the original while
  those are unresolved. This request is refinement only, so no Donut writes occur.

## Outside-in proof and ownership

The first native scenario establishes a shared rubric. Later platform leaves
reuse it without placing expected implementation steps in the user prompt.
Each platform run records its tool version, actual entry and source URL/tag/
commit, selected paths, transcript, and decisive file/symlink observations.

| Promise / refined example | Owning slices | Observable evidence |
| --- | --- | --- |
| Explain equivalence and callers; assessment changes nothing | 2, 22 | Native coverage/context/affected-path explanation; target snapshot unchanged. |
| Retain context before removing its only source | 3–4, 26–29 | Context moved out of the original; native shared use resolves it without reading the original. |
| Authorized cleanup removes only redundant ADR guidance and repairs callers | 4, 9, 13, 16; 30–31 | Original absent, callers resolve, local facts/mixed instructions retained, no unrelated writes. |
| Match a renamed equivalent by behavior | 9 | Different project/name/path still yields one justified ADR replacement. |
| Current version does not conceal pending cleanup | 2, 4 | Native current-version result makes no installer/payload/record writes; authorized local cleanup is separate. |
| Unresolved equivalence, context, or local policy preserves the original | 2, 7, 22 | Same eligibility guard requires sound coverage; the focused uncovered-policy case refuses with unchanged original/callers. No general merging behavior is added. |
| Keep shared original until every affected tool is ready | 8, 23–31 | Missing integration retains source/link; three independent readiness observations precede removal. |
| Follow the accepted fresh-install flow into optional cleanup | 10, 13, 16 | Native one-request installation/adoption uses the inspected release and finishes without a second update. |
| Plain installation does not authorize deletion | 11 | Successful install-only request leaves original, links, context, and callers unchanged. |
| Failed installation never starts local removal | 12 | Copy failure reports incomplete install/unchanged successful record; original/callers remain intact. |
| Explicit ADR use after removal works in all three tools | 5, 14, 17; 32–34 | Fresh native discovery/invocation, current-record citations, retained human authority, no original fallback. |
| Automatic ADR application survives in all three tools | 6, 15, 18; 35–37 | Architecture requests without ADR/skill hints reach shared guidance through retained native triggers. |
| Preserve Donut's status interpretation and local decisions | 22, 26–29, 32–37 | ADR 0001 remains Accepted despite its filename; Proposed ADR 0002 is not binding; no rewritten decisions/statuses. |
| Later updates preserve adoption and current updates remain unwritten | 19–21; 38–40 | Newer fixture release preserves repaired callers; real current-version calls make no installer/payload/record writes or recreated original. |
| Safe release contract, selected-host writes, coexistence, and omissions | Valid Story 5a/5b evidence; 10–21, 23–40 | Inspected identity/payload/record agree; unrelated and other-host installations survive; internal skills/guard remain absent. |
| One reachable shared adoption workflow, minimal native adaptation | 2–4, 10, 13, 16, 19–21 | Guide/updater links reach shipped recognition instructions; fixture prompts/adapters do not contain the migration algorithm. |
| Truthful installed/pending/incomplete outcomes, without invented rollback | 7–8, 12, 22, 26, 30–31 | Reports distinguish installation, preparation, removal, and remaining native verification; actual changed paths are recorded. |

## Refinement decisions

The identifiers in this table refer only to the original plan at `fa1176d`;
all references elsewhere use the new ordered identifiers. All old leaves were
planned, so no completed evidence or resume history was discarded.

| Original leaves | Classification | Revised leaves / reason |
| --- | --- | --- |
| 1–2, 4–19 including 9a, 24–32 | Ready | Retained their one-scenario outcomes and reindexed references. Original 6 is explicitly one representative eligibility refusal, not an open-ended native matrix. |
| 3 | Refine | 3 prepares the bounded context-retention instructions/assertions as immediately enabling Structure; 4 proves their application and one caller-switch/removal outcome on a single-integration fixture. |
| 20 | Refine | 23 installs the published Codex payload; 27 separately proves native use after retained context exists. |
| 21 | Refine | 24 installs for Cursor; 28 independently proves native readiness. |
| 22 | Refine | 25 installs for Claude; 29 independently proves native readiness. |
| 23 | Refine | 22 assesses actual drift/coverage, 26 retains context, 30 repairs the caller graph, and 31 removes only the now-unreferenced original and link. |

No story-level escalation applies: the user outcome, exclusions, and required
native evidence have not changed. The added boundaries separate inspection,
context retention, caller preparation, and removal without a new public staging
API. Reuse the released workflow's steps and original authorization. Intermediate
states retain the original and report adoption as pending; they are not completion.

### Concrete context and caller boundary

Read-only reinspection still found Donut at
`43f0dbe0d47840e31f4773723cfed2d663e56bc8`, with unrelated planning edits.
The affected guidance remains the same six caller files and one Claude symlink.
These facts bound the proposed edits; they are not native equivalence evidence.

| Context to retain | Existing source / bounded treatment |
| --- | --- |
| ADR store, index, lifecycle, and optional draft template | Keep references to Donut's `docs/adrs/README.md` and template; leave their process and record statuses intact. |
| Architecture-shaped trigger areas | Original skill's cross-cutting stack, persistence, API, auth, packaging/layout, and shared backend/frontend/CLI/MCP/E2E areas; retain these facts in the existing architecture rule. |
| Exception trail and human authority | Original permits a PR/commit message or a note pointing to the ADR/exception; preserve those choices rather than importing the fixture's changelog convention. |
| Status and planning precedence | Use actual index/record values and documented local rules; do not invent a new authority hierarchy. A real unresolved discrepancy blocks readiness. |

For Donut, `.cursor/rules/architecture-decisions.mdc` is already reached by
Cursor, `AGENTS.md`, and `CLAUDE.md`, so it is the bounded home for missing
local facts. Keep public recognition instructions adopter-relative. Original
content remains until the dependent use/removal leaves finish; do not copy
the entire old behavioral skill into a second local instruction block.

The caller graph is `.cursor/rules/{general,architecture-decisions}.mdc`,
`.cursor/agent-map.md`, `.agents/skills/story-refinement/SKILL.md`,
`docs/adrs/{README.md,0000-use-adrs-accepted.md}`, and the obsolete
`.claude/skills/adr-awareness` link. Treat that link and its original target as
one retirement unit. Retarget the six text callers coherently; do not slice
by filename or leave a partial graph with dangling links. No other target edits
are assumed. Newly discovered differences trigger focused re-assessment.

## Ordered slices

All statuses are planned. Each remaining leaf is classified Ready after the
replacements above. Allow roughly five minutes including edits, the named
focused proof, slice-local cleanup, and required checks; confidence is medium
unless stated otherwise. A single native process may take longer: record its
actual runtime as the reason if it crosses ten minutes. No exception is claimed
in advance, and this never excuses multiple edit or proof loops.

At five minutes inspect hidden work; at ten minutes stop non-exempt work and
refine that remaining leaf. Native leaves contain one session/scenario each.
The fresh install-and-cleanup cases are one contiguous adoption request, not an
additional fresh-use tour. No time budget guarantees service latency.

The only Structure leaves are 1 → 2, 3 → 4, 26 → 27, and 30 → 31. Their original
behavior stays available at each stop, and each prepares only the next Behavior.
Keep interim cleanup pending; final completion still requires all mapped proof.

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

### 3. Prepare bounded context retention for the first replacement
Type: Structure
Status: planned
Proof: Check the existing single-integration fixture still exposes its missing
trigger/exception facts only in the original skill, with expected retained values
traceable to that source. Original, callers, and assessment behavior stay
unchanged; keep focused payload/fixture checks green. Do not prefill the target's
retained context or perform cleanup in test setup: slice 4 must observe the
released workflow transfer those facts itself.

Structure: Add only the context-retention portion of the shared adoption
instructions and bounded assertions for the immediate next Behavior (4). The
existing local architecture rule is the fact home; retain trigger areas and
exception-trail facts, not a second behavioral copy. Removal is not enabled by
this preparatory leaf and no public command is added. Sizing: about five minutes,
medium confidence; one small instruction block with one fixture-validation loop.

### 4. Complete the first authorized local ADR replacement
Type: Behavior
Status: planned
Proof: Native Codex receives replacement authorization once on slice 3's
single-integration fixture. Observe one coherent switch of its bounded caller
set and removal of the redundant original. Missing context is transferred from
that original to the local rule by the native workflow; expected retained values
must match the source. Installed payload/record, ADR decisions, and unrelated
files stay unchanged. Do not ask again.

Behavior: Retained context and an equivalent ready replacement → authorize
cleanup → the shared practice takes over with no dangling callers. Complete the
existing adoption instructions with the caller switch/removal; eligibility and
authorization gates apply before any destructive step. Native ADR use is slice
5, not a second loop here. Sizing: about five minutes, medium confidence; no
context design, additional platform, or generalized rewrite engine remains.

### 5. Use the Codex replacement explicitly after cleanup
Type: Behavior
Status: planned
Proof: One fresh Codex session after slice 4 invokes `$dough-adr-awareness` for a
relevant ADR check, selects and cites current records, and changes no decisions
or implementation. Original skill and fallback paths are absent.

Behavior: Completed replacement → explicit native invocation → effective shared
ADR checking with retained adopter context.

### 6. Apply ADR guidance automatically in Codex
Type: Behavior
Status: planned
Proof: A separate fresh Codex session receives an architecture-shaped request
with no ADR or skill-name hint. Observe the repaired local trigger reach shared
guidance, cite the constraining ADR, and stop conflicting implementation.

Behavior: Architecture-shaped work after cleanup → ordinary work request → the
required ADR practice applies without a manual skill invocation.

### 7. Keep local guidance when replacement coverage is unresolved
Type: Behavior
Status: planned
Proof: A native Codex refusal scenario supplies a local ADR practice with a
useful requirement the shared guidance cannot satisfy. Observe a specific gap
and unchanged original/callers. This leaf uses one representative uncovered
requirement, with the same eligibility gate for missing context or ambiguity;
do not add unrelated variants or a merging policy to this proof loop.

Behavior: No sound equivalence decision → request replacement → preserve working
local guidance and report cleanup pending. Plain assessment/install permission
must not be promoted into removal authorization.

### 8. Keep a shared original while another tool still needs it
Type: Behavior
Status: planned
Proof: A mixed-tool fixture has Codex's replacement but Claude's original-skill
symlink still depends on the shared source and lacks a usable replacement.
Native cleanup reports the missing integration and preserves source/link/callers.

Behavior: One affected integration is not ready → authorize ADR adoption → keep
the shared original available and report the remaining cleanup prerequisite.

### 9. Replace a renamed equivalent inside mixed local guidance
Type: Behavior
Status: planned
Proof: One native Codex adoption uses a different project name and original
skill name/path with equivalent ADR behavior, plus a mixed document containing
build instructions. Observe justified replacement with build instructions intact.

Behavior: Renamed equivalent ADR practice → authorized adoption → matching and
cleanup succeed on behavior rather than identity, within the same scope.

### 10. Finish fresh installation with the optional ADR cleanup
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

### 11. Preserve local guidance on an installation-only request
Type: Behavior
Status: planned
Proof: One fresh native Codex install request supplies no cleanup authorization.
The released payload installs successfully while the original skill, discovery
links, local context, and callers remain byte-identical. Any suggested replacement
stays a suggestion; successful installation must not be reported as migration.

Behavior: Fresh adopter with local ADR guidance → request installation only →
receive Open Dough without unauthorized local-guidance removal.

### 12. Preserve the original when installation does not succeed
Type: Behavior
Status: planned
Proof: Repeat the install-and-replace entry with the existing deterministic
copy-failure hook. Native output names possible incomplete installation, retains
the last successful record or its absence, and leaves the original/callers intact.

Behavior: Installation fails before cleanup eligibility → installation/adoption
request → no local removal and no migration-success or rollback claim. Reuse
Story 5a's separate fetch/validation/containment proofs where unchanged.

### 13. Complete the fresh adoption journey natively in Cursor
Type: Behavior
Status: planned
Proof: One native Cursor install-and-replace run repeats slice 10's rubric with
its native root and a single affected integration. Shared instructions perform
the cleanup; companion guidance and other payload sentinels remain unchanged.

Behavior: Fresh Cursor adopter → authorized installation/adoption → one complete
replacement through the shared workflow. Keep host adaptations minimal.

### 14. Use the Cursor replacement explicitly
Type: Behavior
Status: planned
Proof: One fresh Cursor session after slice 13 discovers and invokes
`/dough-adr-awareness`; apply slice 5's ADR rubric with the original absent.

Behavior: Completed Cursor replacement → explicit invocation → retained local
ADR behavior through the native shared skill.

### 15. Apply ADR guidance automatically in Cursor
Type: Behavior
Status: planned
Proof: A fresh Cursor session receives slice 6's architecture request without
an ADR/skill hint; the repaired automatic rule reaches shared guidance.

Behavior: Architecture-shaped work → native automatic rule application → current
ADRs constrain the work after original removal.

### 16. Complete the fresh adoption journey natively in Claude Code
Type: Behavior
Status: planned
Proof: One native Claude Code install-and-replace run repeats slice 10's rubric,
including its original discovery symlink and a single affected integration.
The source and obsolete link are removed coherently, with other guidance intact.

Behavior: Fresh Claude adopter → authorized installation/adoption → one complete
replacement through the shared workflow and native root.

### 17. Use the Claude Code replacement explicitly
Type: Behavior
Status: planned
Proof: One fresh Claude Code session after slice 16 discovers and invokes
`/dough-adr-awareness`; apply slice 5's rubric without the old source or symlink.

Behavior: Completed Claude replacement → explicit invocation → effective shared
ADR checking through native discovery.

### 18. Apply ADR guidance automatically in Claude Code
Type: Behavior
Status: planned
Proof: A fresh Claude Code session follows its retained repository guidance
for slice 6's architecture request, without a supplied ADR/skill hint.

Behavior: Architecture-shaped work → native guidance application → current ADRs
constrain work without relying on the removed original.

### 19. Preserve a Codex adoption through an ordinary newer release update
Type: Behavior
Status: planned
Proof: Publish only in the fixture a harmless higher numeric release containing
the same accepted adoption behavior. Native Codex invokes ordinary `$dough-update`
from the cleaned target; payload advances while context/callers remain unchanged
and no original is recreated. No new cleanup is requested or performed.

Behavior: Completed adoption and newer release → ordinary update → preserved
adoption with existing version/update semantics.

### 20. Preserve a Cursor adoption through an ordinary newer release update
Type: Behavior
Status: planned
Proof: Repeat slice 19's single update scenario natively in Cursor. Only its
selected payload/record advances; repaired callers and other integrations remain.

Behavior: Completed Cursor adoption → ordinary newer update → preserved adoption.

### 21. Preserve a Claude adoption through an ordinary newer release update
Type: Behavior
Status: planned
Proof: Repeat slice 19's single update scenario natively in Claude Code; verify
the removed original discovery link is not recreated and callers remain usable.

Behavior: Completed Claude adoption → ordinary newer update → preserved adoption.

### 22. Assess the current Donut replacement boundary
Type: Behavior
Status: planned
Proof: After the release gate, one native assessment using the inspected
release's recognition workflow compares current Donut guidance with the shared
practice. Record coverage, required retained facts, exact callers/link target,
and relevant working-tree changes in this plan; the target snapshot is unchanged.

Behavior: Published adoption behavior and current Donut → assess without writes
→ one concrete migration scope, or a named gap with the original preserved.
Recheck the known six text callers and Claude link; unrelated planning changes
do not block them. Sizing: about five minutes, medium confidence; no mutation,
native readiness tour, or policy reconciliation in this leaf.

### 23. Install the published payload for Donut's Codex
Type: Behavior
Status: planned
Proof: A native Codex installation/update request follows the published safe
route and keeps local guidance. Observe inspected source/tag/commit, selected
payload/record verification, and unchanged original, callers, and other copies.

Behavior: Assessed Donut → install its Codex payload → selected released files
are available while cleanup remains pending. Fresh shared-skill use belongs to
27. Choose the existing install/update/reinstall route from the actual starting
state and existing authorization; do not implement migration mechanics here.

### 24. Install the published payload for Donut's Cursor
Type: Behavior
Status: planned
Proof: One native Cursor installation/update request repeats slice 23's
receipt/preservation rubric for its own root; Codex and the original stay intact.

Behavior: Assessed Donut → install its Cursor payload → Cursor's released files
are available. No second session or readiness claim in this leaf; that is 28.

### 25. Install the published payload for Donut's Claude Code
Type: Behavior
Status: planned
Proof: One native Claude installation/update request repeats slice 23's rubric,
preserving other copies, the original source, and its still-required symlink.

Behavior: Assessed Donut → install its Claude payload → Claude's released files
are available. Native readiness is the separate outcome in 29.

### 26. Retain Donut's original-only context before shared use
Type: Structure
Status: planned
Proof: Compare the exact context facts identified in 22 with their retained
values in the existing architecture rule. Original/link, caller destinations,
ADR decisions/statuses, and unrelated work are unchanged. Existing original
behavior remains backed by its unchanged source and caller graph.

Structure: Apply only the released workflow's context-retention step, enabling
the immediate next Behavior (27). Reuse the existing architecture-rule home and
facts in the context table; do not invent a new local policy or copy the whole
old skill. Report cleanup pending and keep the original. Sizing: about five
minutes, medium confidence; one assessed fact block, no new implementation.

### 27. Prove Codex can use Donut's retained context
Type: Behavior
Status: planned
Proof: One fresh native Codex session explicitly invokes its installed
shared ADR skill. Observe relevant current-record citations and resolution of
required context from the retained local rule/index, without consulting the
original skill for missing facts. Record actual native loading evidence; a
success phrase or installed-file comparison alone is insufficient.

Behavior: Published payload and retained local context → explicit shared use
→ Codex is ready without relying on the original's contents. Keep the
original/link and old callers in place for other integrations. If evidence shows
a missing context value, stop this leaf and repair only that known retention gap;
do not remove the original or broaden into local-policy merging.

### 28. Prove Cursor can use Donut's retained context
Type: Behavior
Status: planned
Proof: One fresh native Cursor session explicitly invokes its installed
shared ADR skill. Observe relevant current-record citations and resolution of
required context from the retained local rule/index, without consulting the
original skill for missing facts. Record actual native loading evidence; a
success phrase or installed-file comparison alone is insufficient.

Behavior: Published payload and retained local context → explicit shared use
→ Cursor is ready without relying on the original's contents. Keep the
original/link and old callers in place for other integrations. If evidence shows
a missing context value, stop this leaf and repair only that known retention gap;
do not remove the original or broaden into local-policy merging.

### 29. Prove Claude can use Donut's retained context
Type: Behavior
Status: planned
Proof: One fresh native Claude Code session explicitly invokes its installed
shared ADR skill. Observe relevant current-record citations and resolution of
required context from the retained local rule/index, without consulting the
original skill for missing facts. Record actual native loading evidence; a
success phrase or installed-file comparison alone is insufficient.

Behavior: Published payload and retained local context → explicit shared use
→ Claude Code is ready without relying on the original's contents. Keep the
original/link and old callers in place for other integrations. If evidence shows
a missing context value, stop this leaf and repair only that known retention gap;
do not remove the original or broaden into local-policy merging.

### 30. Retarget Donut's live callers while retaining the original
Type: Structure
Status: planned
Proof: Compare the assessed six-file caller graph with the edited graph. Each
reference resolves to the applicable native shared skill; existing trigger text,
retained context, ADR decisions/statuses, payload bytes, and unrelated work are
unchanged. Original and Claude link remain valid. Reuse 27–29's unchanged
shared-use evidence; final automatic-application proof remains 35–37.

Structure: Apply the released workflow's mechanical caller-repair step for the
immediate removal Behavior (31). Edit the known graph coherently, including ADR
documentation pointers, without broad textual substitution. Sizing: about five
minutes, medium confidence; exact references were assessed in 22 and all three
replacement destinations have native readiness evidence. Additional substantive
callers or changed policy require focused re-assessment before deletion.

### 31. Retire Donut's unreferenced original and obsolete discovery link
Type: Behavior
Status: planned
Proof: Recheck the assessed paths for drift, 27–29's readiness evidence, and
30's caller graph. Using the released adoption workflow and existing removal
authorization, remove only the original skill and its obsolete Claude link as
one unit. Their absence and unchanged remaining graph/context/payload snapshots
prove bounded cleanup; report final native verification as still pending.

Behavior: All affected tools ready and callers repaired → complete authorized
retirement → no redundant original or dangling discovery link remains. This leaf
does not reassess the whole repository, rewrite context/callers, or run the
three-tool use tour. Sizing: about five minutes, high confidence within the
assessed boundary. Drift stops removal without discarding working guidance.

### 32. Verify explicit ADR use in Donut's Codex after removal
Type: Behavior
Status: planned
Proof: Fresh native Codex explicitly invokes the installed shared skill after
slice 31. Observe real ADR selection/citations, ADR 0001's Accepted status despite
its filename, Proposed ADR 0002 excluded as binding, and human authority retained.

Behavior: Migrated Donut → explicit Codex ADR check → effective released guidance.

### 33. Verify explicit ADR use in Donut's Cursor after removal
Type: Behavior
Status: planned
Proof: Repeat slice 32's real-project rubric in a fresh native Cursor session;
record discovery and invocation independently, not a manual read of the file.

Behavior: Migrated Donut → explicit Cursor ADR check → effective released guidance.

### 34. Verify explicit ADR use in Donut's Claude Code after removal
Type: Behavior
Status: planned
Proof: Repeat slice 32's real-project rubric in a fresh native Claude Code
session without the old discovery link; record independent native evidence.

Behavior: Migrated Donut → explicit Claude ADR check → effective released guidance.

### 35. Verify automatic ADR application in Donut's Codex
Type: Behavior
Status: planned
Proof: In a fresh Codex session, request assessment of a concrete architecture
change without mentioning ADRs or a skill. Observe the repaired trigger load
relevant current ADRs. Choose a read-only assessment, not product implementation.

Behavior: Architecture-shaped Donut request → automatic Codex application → the
shared practice still governs work after original removal.

### 36. Verify automatic ADR application in Donut's Cursor
Type: Behavior
Status: planned
Proof: Repeat slice 35's single architecture-trigger scenario in fresh native
Cursor with its real repaired automatic rule and independent evidence.

Behavior: Architecture-shaped Donut request → automatic Cursor application →
effective shared ADR guidance.

### 37. Verify automatic ADR application in Donut's Claude Code
Type: Behavior
Status: planned
Proof: Repeat slice 35's scenario in fresh native Claude Code; demonstrate the
repository guidance reaches the replacement without the obsolete original link.

Behavior: Architecture-shaped Donut request → automatic Claude application →
effective shared ADR guidance.

### 38. Keep Donut's Codex adoption unchanged on a current-version update
Type: Behavior
Status: planned
Proof: Fresh native `$dough-update <published-url>` with no cleanup request
reports current. Observe no installer call or installed-file/record writes,
unchanged caller/context snapshots, and no recreated original.

Behavior: Current adopted Donut → ordinary Codex update → truthful no-write result.

### 39. Keep Donut's Cursor adoption unchanged on a current-version update
Type: Behavior
Status: planned
Proof: Repeat slice 38's current-version observation in native Cursor; verify
its own selected payload and all repaired local guidance remain unchanged.

Behavior: Current adopted Donut → ordinary Cursor update → truthful no-write result.

### 40. Keep Donut's Claude adoption unchanged on a current-version update
Type: Behavior
Status: planned
Proof: Repeat slice 38's current-version observation in native Claude Code,
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
| Codex | Quick 007 slices 5–6 and 12: controlled equivalence and installed use; completed updater and safe-install evidence within valid boundaries. | 2–12, 19, 22–23, 26–27, 30–32, 35, 38. | Pending native adoption verification. |
| Cursor | Quick 007 slice 14: installed native ADR use and coexistence; completed updater and safe-install evidence within valid boundaries. | 13–15, 20, 24, 28, 33, 36, 39; shared-removal result 31. | Pending native adoption verification. |
| Claude Code | Quick 007 slice 16: installed native ADR use and coexistence; completed updater and safe-install evidence within valid boundaries. | 16–18, 21, 25, 29, 34, 37, 40; shared-removal result 31. | Pending native adoption verification. |

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

- Refinement separated context preparation from removal and separated installation
  receipts from native readiness. The native readiness checks now follow actual
  context retention, so they cannot be accepted merely because the original was
  still available to supply missing facts. Full native loading evidence is needed.
- The safe-install sibling plan is now ready to execute but still has no recorded
  execution in the inspected worktree. Its dependency remains pending; its revised
  plan status does not authorize or prove real adoption.
