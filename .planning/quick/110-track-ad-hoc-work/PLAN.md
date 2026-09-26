# Track accepted work through the shared lifecycle

## Source

**Identity:** SEED-028#track-ad-hoc-work

[Refined story](../../seeds/SEED-028-track-ad-hoc-work.md#track-ad-hoc-work).
The developer authorized refinement and planning, confirmed that independent
investigations enter Taken on acceptance, and selected seed stories for new
retrospective corrections. Implementation is not authorized by this plan.

## Goal and scope

A developer sees independently accepted product work in Taken, with its purpose,
owner and honest preparation state, before the mission starts. Work received
outside the queue joins the same lifecycle as queued work and completes through
ordinary closure. A minimal story is sufficient; admission does not require
an executable plan or an implementation-ready assessment.

Include bug diagnosis/repair, test profiling/optimization, standalone exploratory
testing and reviews, direct contextual maintenance, and new retrospective
corrections. Reuse an existing story for its supporting work. Preparing an
existing queued story retains Preparing. Clarifying a request and recommending
unaccepted work are not new accepted missions.

Publish newly required canonical content, Taken membership and assignment in
one remote-trunk admission commit. No intermediate published queued item is
needed. Reuse suitable seeds; preserve sibling stories and unrelated queue order.
A planned admission includes its referenced plan in the same accepted snapshot
when it is not already published. Later investigation-to-implementation planning
keeps the same identity and ownership. Missing authority or ambiguous ownership
stops dependent work without discarding edits.

Excluded: `--one-shot` and its eligibility/escalation implementation (story 2),
a completed-story archive, automatic migration of existing plan-homed work,
new execution modes, a task-type registry, a second publication system, and a
new default-checkout coordination mechanism. Existing startup modes and their
publication destinations remain supported; do not infer execution mode for this
plan from the mode exercised by a fixture.

## Context and architecture

Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) for one
canonical story home and [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for separate facts, direct domain mapping and cohesion. Follow
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for proof
reuse and cross-tool evidence, [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [AGENTS.md](../../../AGENTS.md) for reusable agent-facing guidance.
Proposed ADRs 0007–0009 supply recorded direction, not acceptance or an exception
to ADR 0002. This plan changes neither their status nor branching policy.

Use [One admission path for accepted work](../../NORTH-STAR.md#one-admission-path-for-accepted-work).
Keep it while this story or one-shot escalation needs it; ordinary wrap-up owns
retirement. No additional ADR or architecture report is needed.

### Existing solutions and their intended use

| Responsibility | Existing owner / change |
| --- | --- |
| Story identity, canonical home, preparation and queue membership | `src/skills/dough-product-backlog/scripts/`; extend admission through the existing document/store operations and shared readers. Keep identity allocation in the established seed/anchor convention. |
| Assignment, workspace, atomic claim publication and recovery | `execution-start-operation.mjs`, `execution-source.mjs`, `workspace-publication-select.mjs`, `workspace-publication-push.mjs`, `execution-start-agent.mjs`; generalize the existing queued-source assumption, preserving one orchestration and publisher. |
| Readiness | Shared story-state reader/recorder; admission records supplied facts and does not forge ready or planless authority. Execution consumes actual preparation and current authorization at its own boundary. |
| Published views | Dashboard shared canonical/purpose/state/profile readers; consume the admitted snapshot without new ad hoc badges, state grammar or origin flags. |
| Completion | Existing backlog completion and story-wrap-up, including publication and resource cleanup; preserve unfinished siblings and enduring knowledge. |
| Entry workflows | Shared admission instructions called by bug fixing, test optimization, manual testing, direct execution and independently requested reviews. Supporting refactor/CI/retrospective steps inherit their active story. |

Inspection found that `readPublishedExecutionSource` requires a queued published
source and ready assessment, `takeEntry` refuses absent entries, and claim
construction requires a clean workspace. These are entry assumptions to revise
at their existing owners. Do not weaken ordinary source validation globally or
stage every dirty file. Carry only the selected canonical draft and declared
related plan into the isolated admission candidate. Source conflicts preserve
both versions for a human decision; sibling edits can reconcile normally.

Admission and implementation startup are distinct responsibilities even when a
ready task performs them consecutively. An accepted investigation may remain
unselected/not-ready while its authorized investigation proceeds. When its plan
and assessment later become sufficient, ordinary execution resumes the same
Taken story and assignment without a second claim or an obsolete source-basis
refusal. This requires deliberate treatment of source evolution, not accepting
arbitrary source edits as a resume.

## Outside-in proof and verification

Use existing disposable real-Git fixtures with local bare remotes; no production
remote or new storage experiment is needed. The existing startup fixtures
pre-create queued sources, so new cases must begin with no published entry for
the mission. Observe actual accepted commits rather than pre-seeding success.
Reuse the real CLI entry point; focused domain tests supplement its evidence.

Relevant existing proof locations inspected:

- `src/skills/dough-execute-plan/scripts/workspace-publication-startup-source-cases.mjs`
  covers source refusal and the legacy plan-homed correction; startup journey,
  race, agent-reselection and recovery files own real Git acceptance and refresh.
- `tests/support/product-backlog-*.test.mjs` and `story-state*.test.mjs` own
  membership, canonical identity and preparation interpretation.
- `dashboard/tests/taken-agent-profile.spec.ts` and `story-readiness*.spec.ts`
  exercise published-content views; feed actual admission-produced documents
  through the established published-origin fixture for the new journey.
- `src/skills/dough-story-wrap-up/scripts/closure-*.test.mjs` and the native
  closure fixture/assessor files own remote closure and retained resources.
- `tests/git-publication-native.sh` supplies installed fresh-agent journeys;
  its default substitute mode proves harness behavior, not native skill use.

Add a focused `workspace-publication-admission.test.mjs` beside startup tests
for the new remote journey; split by behavior only if size warrants it. Planned
command: `node --test src/skills/dough-execute-plan/scripts/workspace-publication-admission.test.mjs`.
This file is to be created, not existing proof. Prefer extending existing proof
owners for recovery and closure instead of copying their fixtures.

At each slice, run its focused commands after edits and independent post-change
refactoring under the execution skill. Keep the normal delivery, CI observation,
retrospective and wrap-up gates. Run `git diff --check` and applicable lint; widen
verification only for affected consumers. Native guidance proof is risk-selected:
review invocation, required context and useful outcome for each changed skill;
reuse established Codex/Cursor/Claude integration evidence where unchanged.
A fresh native run must demonstrate the selected workflow, not merely a
successful exit. Record new behavior evidence or justified reuse per affected
tool. Native gaps remain explicit and block release; do not call substitutes
native proof. No installation, update or coexistence redesign is in scope;
if payload declarations change, use their existing functional checks.

## Ordered slices

### 1. Admit an unlisted mission with useful published details
Type: Behavior
Status: done

Behavior: An authorized mission with a selected existing/new seed story has no
backlog entry → shared admission publishes its canonical content, Taken entry
and assigned agent in one remote-trunk commit → the dashboard shows its purpose,
owner, mode and honest preparation state. Both planned work and explicitly
planless work can use this path; an investigation can be Taken with approach
unselected. No fictitious plan or ready assessment is created.

Extend the existing backlog/startup owners, CLI and shared caller instructions
together. Include minimal content validation, an explicit owned-content boundary,
and preservation of source/sibling edits. Reuse existing Taken ownership when
continuing work; refuse another owner's claim. Keep queued startup compatible.
Attempt existing safe default-checkout refresh and report deferred refresh
separately. On failed/uncertain publication, do not start dependent work.

Proof: New admission CLI journey inspects the parent and accepted commit: parent
has no entry; accepted tree contains all linked canonical files and assignment;
no prior published queue-only state exists. Cover new seed and existing-seed
sibling preservation, planned/planless/unselected facts, dirty-default refresh
deferral and authority/source refusals without unrelated writes. Feed the accepted
snapshot through the dashboard boundary and assert Taken purpose/owner plus
unselected readiness. Run the new admission command above, existing startup
source/agent tests and
`npm run test:dashboard -- dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/story-readiness.spec.ts`
with the added representative case in its suitable existing owner.

Safe stop: Explicit admission works and publishes honest ownership; specialist
entry workflows still await slice 3. Do not claim all callers are integrated.

Accepted proof: `execution-start.mjs start --admit --identity --link --title`
runs through the single `startExecution` orchestration and publisher, with the
queued/admission source choice held in `execution-start-source.mjs` and
admission reconciliation in `execution-admission-source.mjs`; guidance lives in
`src/skills/dough-execute-plan/references/admit-accepted-work.md`. Passing:
`node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission-refusal.test.mjs`
(52), `node --test tests/support/product-backlog-take.test.mjs tests/support/product-backlog-add*.test.mjs tests/support/story-state*.test.mjs`
(20), `npm run test:dashboard -- dashboard/tests/taken-agent-profile.spec.ts dashboard/tests/story-readiness.spec.ts`
(3, including the admitted-investigation Taken case) and the payload shell
checks under a modern bash.

### 2. Recover admission without losing its story or duplicating ownership
Type: Behavior
Status: done

Behavior: Concurrent trunk movement, agent-name collision or interrupted claim
publication occurs → the same admission retries or resumes → remote trunk has
one canonical identity and one owned Taken claim with all admitted content intact.

Extend existing recovery and agent-reselection paths, including the claim rebuild
that currently recreates only membership/profile. Preserve the accepted candidate
and provenance after ambiguous push results. A conflicting story identity or
rival owner stops with recoverable evidence; unrelated remote progress survives.
Do not build a second recovery protocol or a persistence registry.

Proof: Extend real-Git startup recovery/race/reselection tests with an initially
unlisted story. Observe accepted remote ancestry, canonical text, profile identity
and receipt across pre-push interruption, accepted-but-unconfirmed response and
name collision. Two attempts for the same identity produce one owner, never two
stories. Run:
`node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-recovery.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-race.test.mjs`.
Keep the new admission journey green.

Safe stop: Admission is resumable under the existing publication contract; no
unfinished source or another writer's work is discarded.

Accepted proof: recovery rebuilds an isolated admission candidate by
reconciling it per section onto current trunk (resume publishes the preserved
candidate, never later drafts), through the existing `reselectClaimAgent`
rebuild and publisher recheck. Admission recovery/race cases live in
`workspace-publication-startup-admission-recovery.test.mjs` (kept separate to
hold file size) and the name collision in the agent-race file. Passing:
`node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission-refusal.test.mjs`
(58).

### 3. Track an investigation through its ordinary continuation
Type: Behavior
Status: planned

Behavior: A developer accepts an independent bug investigation, optimization,
exploratory test, review or contextual maintenance mission → the entry workflow
admits it before substantive work → any authorized implementation attaches its
plan/preparation to the same story and continues under the same ownership.
A supported no-change result is a completed mission; uncertainty alone is not
completion. Work inside an existing story retains its owner.

Update the participating skill sources and linked contracts to call the shared
admission boundary. Remove contradictory instructions that prohibit stories for
contextual or no-change work. Keep clarification separate from substantive
investigation, Preparing for existing queued-story preparation, and permission
to investigate separate from permission to implement. Preserve bug-reproduction,
optimization-measurement and testing-only constraints. The existing optimization
continuation story still owns automatic handoff decisions; do not duplicate it.
Align source validation and resume with a legitimately updated plan/readiness
under the same Taken identity; do not treat it as interrupted claim replay.

Proof: Extend the admission CLI journey from unselected Taken to recorded planned
preparation and ordinary execution continuation, observing one claim/profile and
no new story. Countercase: implementation is not authorized by investigation or
Taken alone. Walk bug diagnosis with no defect, profile-only optimization,
standalone exploratory testing and nested CI/refactor cases through the changed
skills, checking invocation/context/outcome. Add representative installed native
journeys to the existing publication harness for admission before investigation
and same-story continuation; assess actual first substantive action and published
claim ordering. Keep unchanged queued-start and story-state tests green:
`node --test tests/support/story-state.test.mjs tests/support/story-state-assessment.test.mjs`
and the admission test. Native command selection follows the existing harness;
planned new cases are `publication/admission-investigation` and
`publication/admission-continuation`. Add these to the existing harness rather
than treating them as available today; invoke with
`bash tests/git-publication-native.sh --native codex --case publication/admission-investigation`
and select other host/case runs only for missing behavior evidence.

Safe stop: Accepted mission entry and implementation continuation share one
identity. Completion is retained for ordinary closure in slice 5.

### 4. Give new retrospective corrections one seed-backed story
Type: Behavior
Status: planned

Behavior: A retrospective produces a new bounded correction → its retained
canonical work item is a minimal story in a suitable seed linked to the correction
plan → queueing or accepting it for execution uses that same story once.
An existing plan-homed correction continues under its established identity.

Align retrospective, planning/refinement, backlog and wrap-up follow-up guidance
at the canonical-home owner. The story holds purpose/scope; the plan retains
findings, provenance, proof and execution detail. A recommendation alone grants
no correction execution. Do not first allocate a plan identity and then replace
it with a seed identity for new work; preserve pre-existing records without
automatic migration. Keep the correction's evidence and existing scope rather
than inventing a feature promise.

Proof: A representative retrospective-to-follow-up journey creates one linked
story/plan, then queues or admits the story without a duplicate plan entry.
Replay preserves identity and evidence. Keep the existing self-homed correction
startup case as explicit legacy compatibility, and extend backlog home/identity
and plan-reader proof for new story-backed corrections. Run:
`node --test tests/support/product-backlog-home-reader.test.mjs tests/support/product-backlog-identity.test.mjs tests/support/product-backlog-plan-reader.test.mjs`
and affected startup cases through their test entry points. Review the full
retrospective→wrap-up→execution handoff; verify the behavioral guidance via a
representative fresh native journey when existing evidence does not cover it.
The planned harness case is `publication/admission-correction`, invoked through
`bash tests/git-publication-native.sh --native claude --case publication/admission-correction`;
reuse shared integration evidence and record remaining tool-specific proof.

Safe stop: New corrections have the same domain home as stories; existing work
remains executable and recoverable under its original identity.

### 5. Close admitted work through the ordinary lifecycle
Type: Behavior
Status: planned

Behavior: The accepted mission's outcome is complete, including an evidenced
no-change investigation → ordinary wrap-up publishes closure → Taken entry,
assignment and spent story/plan artifacts disappear, while unfinished siblings,
enduring product knowledge and result commits remain.

Use ordinary completion and wrap-up owners for both new missions and new
correction stories. Preserve Taken on incomplete work, failure or pause. Apply
existing explicit return/cancellation rules rather than automatically queueing or
discarding unfinished investigation. A seed is deleted only when no remaining
story needs it. No tombstone, completed catalog or ad hoc cleanup path is added.

Proof: Start with actual admission output, complete a bounded result and a
no-change mission, then exercise ordinary closure and inspect the remote tree.
Include a temporary plan plus an unfinished sibling and a new correction story.
Repeat closure/recovery without deleting another assignment or losing a sibling.
Extend existing closure CLI/publication tests and the existing native closure
journey rather than faking completion by manually editing the final backlog.
Run:
`node --test src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication-resume.test.mjs src/skills/dough-story-wrap-up/scripts/closure-resource-cleanup.test.mjs`
and `node --test tests/support/product-backlog-complete.test.mjs`.
Complete the focused admission-to-dashboard-to-closure acceptance observation;
reuse earlier slice proof, adding only missing boundary evidence.

Safe stop: All admitted work has one complete lifecycle; the separately queued
one-shot story can later invoke admission on escalation.

## Promise coverage and current decisions

| Promise | Owner / decisive observation |
| --- | --- |
| Atomic story + Taken + assignment, suitable seed and useful dashboard details | 1: actual remote commit and rendered published snapshot |
| Honest preparation and no forced plan | 1, 3: unselected Taken, later same-story plan, no fabricated authority |
| Safe refresh and unrelated-work preservation | 1: dirty default checkout; 2: concurrent remote work |
| Exactly one claim and recoverable failure | 2: interrupted/racing real-Git admission |
| Bug, optimization, standalone observation/review and direct work use admission | 3: caller walkthroughs and representative native ordering evidence |
| Existing-story supporting work does not duplicate tracking | 1, 3: ownership reuse and nested workflow cases |
| New seed-backed corrections; existing identity compatibility | 4: follow-up journey and legacy correction regression |
| Normal cleanup including no-change and unfinished siblings | 5: actual admitted identity through remote closure |
| Cross-tool usable guidance | Each changed caller's behavior review and selected native evidence/reuse under ADR 0005 |

No new numeric slice budget is imposed: none was supplied for this story.
The bug skill's bounded repair limit remains its own behavior. Size slices by
one coherent observable transition, including focused proof and local cleanup;
reassess through the existing oversized-slice procedure if evidence disproves
boundedness. The common model is acceptance → Taken ownership → authorized work
→ ordinary closure; preparation is a separate fact throughout.

## Plan review

Five Behavior slices. Keep normal admission and recovery separate because their
failure observations and recovery risks are independently evaluable. Keep
investigation continuation separate from correction-home alignment because they
change different caller promises. Closure owns final lifecycle evidence rather
than scattering duplicate cleanup logic across callers. No speculative Structure
slice, new lifecycle abstraction or per-skill admission implementation is needed.
The first slice includes its required shared structural changes and dashboard
proof; these are not independent preparation deliverables.

This review found no remaining scope or architecture question requiring a
human answer. Each boundary has a proof owner and an honest stopping point;
no resplit or sizing exception is proposed. Runtime test and native evidence are
planned, not already passed. Reassess when implementation exposes contrary facts.

## Learnings

- Slice 1: owned admission content is the selected story's section (or a new
  seed whole) plus the declared plan, reconciled per section onto fetched trunk;
  a line-level three-way merge falsely conflicted on adjacent appended stories.
  Local sibling edits in the same seed stay unpublished.
- Slice 1: admission requires a recorded Goal and preparation facts (written
  first through `record-state`) and publishes them as recorded, with no
  assessment. Retained-admission resume currently re-reads the source, finds
  the identity Taken and returns `existing` without admission content, and an
  agent-name collision replays by rebase instead of the reselection rebuild;
  both are slice 2 obligations.
- Slice 2: ordinary line-based rebase replay is unsafe for admitted seeds (it
  conflicts on adjacent appended stories and leaves the workspace mid-rebase),
  so every admission retry rebuilds from its candidate's own parent. Untested:
  a second lost race after a rebuild, and a name collision during a resumed
  admission.
