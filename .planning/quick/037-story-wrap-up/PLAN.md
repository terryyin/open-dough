# Story Wrap-Up

## Source and outcome

[SEED-011 — Story Wrap-Up](../../seeds/SEED-011-story-wrap-up.md#story-wrap-up).
Status: in progress. Slices 1–2 are done.

A developer closes one completed story after retrospective: relevant product
changes are applied, existing follow-up work is first in the queue, lasting
knowledge is assimilated, and spent story/plan history is deleted from the
current snapshot and recoverable through Git.

## Scope and decisions

Implement one manually invoked `dough-story-wrap-up` skill in shared public
source. Align execution, retrospective, product-backlog maintenance, and shared
planning/refinement cleanup instructions with the same ownership. Current human
instructions supersede the former finished-list/completion-record requirement.
Retrospective output and additional human input may be empty; do not invent
findings, records, or a requirement for another conversation.

Use current maintained code, tests, documentation, and architectural decisions
for lasting knowledge. Delete spent plan/story identity, execution/impact
history, original evidence, assessment records, and related occurrences in
shared logs. Do not replace them with summaries, archives, tombstones, or
judgments for later readers. An active follow-up describes its own remaining
work. Preserve unrelated active content and product/version identity.

Excluded: bulk historical cleanup, whole-repository reorganization, unrelated
refactoring, discovery/decomposition, creation or execution of follow-up plans,
new automation, record schemas, cleanup engines, audit ledgers, history viewers,
Git rewriting, new host runners, and general release/adoption work. This plan
consumes follow-up plans produced by the existing retrospective. Actual cleanup
of this story belongs after its own execution and retrospective, not to the
implementation slices below.

Applicable Accepted decisions:

- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  judge active work now; delete spent proof and assessment records at wrap-up.
  Git recovery replaces current-snapshot history. Missing required acceptance
  remains unfinished work; deletion is not a waiver of proof.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  concise guidance for the executing project's agent, one behavioral home, and
  minimal host adaptation. Do not export Open Dough maintainer vocabulary.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  author under `src/skills/`, keep installed managed copies untouched, and
  distinguish a reviewed candidate from a selected payload and immutable release.

The retention decision is already updated by the human; no additional ADR
change is planned. No numeric slice target, hard limit, or overrun threshold
was supplied. Size each slice by one observable outcome and one proof loop,
including its focused review and cleanup; make no execution-time guarantee.

## Outside-in proof and delivery gates

The stable behavior boundary is an agent invoking the candidate skill in an
isolated Git project with supplied project conventions. Build one small fixture
with recognizable spent-story/plan markers, a committed baseline, a maintained
product test and document, and unrelated sentinel content. Extend that same
case with a sibling story, shared process log, follow-up plan, and product advice
only in the slices that own those variations. Keep proofs outside the target
snapshot so the evaluator does not itself preserve history there.

For conventional authoring, use the `AGENTS.md` representative behavior review:
check invocation context, required inputs, and the useful result. Inspect actual
fixture files and Git recovery; a prose promise or deletion command alone is
insufficient. In the temporary target, verify absence with `git status --short`
and `rg --hidden --glob '!.git/**'` for its spent markers, inspect untracked as
well as tracked files, validate remaining Markdown links, and compare unrelated
content with the baseline. Use `git show <before-cleanup-commit>:<spent-path>`
to prove recovery. These placeholders are filled with the fixture's actual
commit and paths during execution. No fixture or product behavior is run by
this planning turn.

Keep only evidence needed for the current assessment while execution and review
remain active. At this story's later wrap-up, delete its plan, seed section,
walkthrough/run artifacts, and related assessment records under ADR 0005.
Maintained behavior fixtures and tests must describe product behavior without
embedding this story's identity or completed execution history.

Each slice owns its behavior changes, directly affected reference/check updates,
and proof. Run `git diff --check` and inspect changed frontmatter and local
links. Do not add exact-prose tests or a new generic assessor. Shell fixture
assertions may check actual absence, preservation, priority, and recovery.
Installation checks belong to the final slice; they do not prove agent behavior.

On separately authorized execution, use `dough-execute-plan` for independent
post-change refactoring, selective formatting, active-plan updates, owned
commit/push, and asynchronous CI repair. Resolve actual hook/push context before
delivery: `npm run format` currently formats repository-wide supported files,
not a selective Markdown formatter. Do not use it to modify unrelated files;
Markdown-only slices need the focused checks above. CI is `.github/workflows/ci.yml`
and runs `npm run lint` / `npm test`. Run focused applicable checks once locally;
let CI own broad repetition unless failures justify more. Keep this plan and
review inputs until retrospective and Story Wrap-Up complete.

## Ordered slices

### Close a completed story without follow-up
Type: Behavior
Status: done
Proof: One isolated single-story closure, with incomplete-plan,
incomplete-retrospective, and uncommitted-history boundary variations.
Evidence: [evidence/slice-1/WALKTHROUGH.md](evidence/slice-1/WALKTHROUGH.md).

Behavior: Given completed execution and retrospective with no actionable output,
when wrap-up is invoked, the current project contains maintained product knowledge
and no spent story/plan history, while Git can recover the removed material.

Author the minimal entrypoint, required-context resolution, completion check,
knowledge assimilation, deletion, link repair, and truthful outcome response.
Use the selected project's Git conventions to preserve the last needed version
before deletion. If required context, ownership, or recovery cannot be resolved,
leave affected material intact and identify the gap; do not claim closure.
Retain product tests and documents without execution narration or judgments.
The initial case has a standalone seed and no shared log or product changes;
explicitly leave unsupported cases intact until the next slices add them.

Safe stopping point: the simple case is usable in source; incomplete work is
preserved. This is not a complete or releasable implementation of the story.
Sizing: one local closure result, no new runtime or storage mechanism. The Git
recovery variation is the highest-risk input within this proof loop.

### Remove spent material from shared records without losing active work
Type: Behavior
Status: done
Proof: The closure fixture with a shared seed, mixed `DearDough.md` issue
occurrences, an old finished entry, an incoming reference, and unrelated sentinels.
Evidence: [evidence/slice-2/WALKTHROUGH.md](evidence/slice-2/WALKTHROUGH.md).

Behavior: Given completed-story material mixed with unrelated active content,
when wrap-up runs, only the spent material and its historical references disappear;
active content remains coherent and unchanged except for necessary link repair.

Extend deletion to related occurrences, assessment/recognition records, and
completion/impact history wherever the selected story's references identify them.
Remove a now-empty issue/container or seed; preserve unrelated human text and
sibling stories. Resolve ambiguous attribution before deleting that portion.
Assimilate current knowledge rather than preserve the removed story's identity.
Rerun closure on the cleaned fixture: no recreated history, duplicate edits, or
false claim that already-absent artifacts prove a different story complete.

Safe stopping point: closure handles shared content; unsupported follow-up or
product actions still keep their required inputs intact.
Sizing: one selective-cleanup outcome with content variants, no log migration
or recurrence-model redesign.

### Put an existing follow-up plan first
Type: Behavior
Status: planned
Proof: The fixture with one existing corrective plan, exercised with an existing
canonical follow-up story and with only enough supplied context to create its home.

Behavior: Given a completed retrospective supplying a follow-up plan, when wrap-up
runs, that plan's active story is first in the queue and self-contained, while
the original spent history is gone.

Resolve or create the one canonical story reference using the supplied outcome;
link the existing plan and remove historical references to the old execution.
Do not replan or execute it. Preserve its contents needed for future execution,
unrelated queue order, and near-future direction. Repeated invocation must not
duplicate the story or queue entry. Missing beneficiary/outcome prevents guessing
that addition; retain only the needed active-work context and report the gap.

Safe stopping point: the corrective-follow-up case works; additional product
advice remains a stated unsupported action until the next slice.
Sizing: one queue outcome using existing plan/story conventions.

### Apply product-review decisions with optional human input
Type: Behavior
Status: planned
Proof: One relevant-backlog decision scenario, varying advice alone, a human
correction, a supported new-story addition, and a genuinely unresolved choice.

Behavior: Given retrospective product advice and optional human input, when
wrap-up runs, the relevant backlog and canonical stories reflect the authorized
compatible decisions, and unresolved choices are reported without invented scope.

Reuse backlog maintenance conventions. Support relevant reorder, queue membership,
understood story addition, and canonical-detail changes; explicit human input
wins over advice. Keep existing follow-up work first unless a later explicit
human instruction changes that priority. Preserve unrelated content and direction.
A skipped/empty product review or absent extra input introduces no mandatory
question. Keep unresolved necessary context with active work without recreating
the closed story's history. Do not launch discovery or another review.

Safe stopping point: the standalone wrap-up behavior is complete; lifecycle
callers still need alignment before delivering a coherent public candidate.
Sizing: one product-decision application boundary, existing maintenance behavior,
no new prioritization or discovery mechanism.

### Keep execution, retrospective, and closure in one consistent sequence
Type: Behavior
Status: planned
Proof: One execution → retrospective → wrap-up journey using the candidate
sources; inspect the target at each handoff and final state.

Behavior: Given the same selected story passing through the participating skills,
the plan and review evidence survive execution and retrospective, and only wrap-up
performs routine closure/backlog actions and deletes the spent history.

Align `src/skills/dough-execute-plan/SKILL.md`,
`src/skills/dough-story-refinement/references/planning.md`,
`src/skills/dough-execution-retrospective/SKILL.md`, and
`src/skills/dough-product-backlog/SKILL.md` with the new skill. Inspect their
linked cleanup, report, and example guidance; change only actual contradictions.
The retrospective's process-write preservation rule applies while reviewing;
wrap-up owns later removal of related occurrences. Keep implementation/process/
product review substance, skip options, correction planning, and per-slice
refactoring/delivery intact. Keep standalone authorized backlog maintenance.
Update directly affected checks and current maintainer descriptions together.
Do not rewrite unrelated historical records as part of this consistency edit.

Safe stopping point: all source guidance implements the same lifecycle; public
delivery readiness is still owned by the next slice.
Sizing: one observable lifecycle handoff across named sources, no CI/runtime
redesign. If an additional independent mechanism is discovered, refine only this
slice before implementing it; do not expand the story.

### Use the coherent candidate through ordinary installation
Type: Behavior
Status: planned
Proof: One candidate-install → fresh native use journey with the preceding
closure case; applicable Codex, Cursor, and Claude Code requirements have fresh
proof or justified reuse judged against the candidate before release readiness.

Behavior: Given the reviewed candidate installed using existing mechanisms,
a developer can invoke Story Wrap-Up and receive the same coherent closure
behavior with every required runtime reference available.

Prepare the smallest complete candidate payload: new skill, affected existing
revisions, and required retrospective dependencies. The retrospective is currently
outside both payload declarations. Its current runtime links resolve to already
declared refactor, slice-planning, and backlog guidance; the expected added files
are its `SKILL.md` and the new wrap-up `SKILL.md`. Recheck only if implementation
adds a runtime reference. Do not silently depend on an undeclared file or
bundle unrelated Proposed capabilities. Keep `install.sh` managed files,
`src/install/open-dough-release-version.sh`, and
`tests/helpers/public-payload-fixture.bash`
consistent when preparing the candidate. Maintainer selection still owns promotion.

Extend existing installation/payload assertions for these files rather than
creating a new installer or host harness. Relevant commands are
`bash tests/install-all-tools.sh`, `bash tests/story-payload-update.sh`,
`bash tests/install-omits-internal.sh`, and
`bash tests/install-refuses-unsafe-topology.sh`; add other existing checks only
when the actual dependency delta affects their contract. Native use must prove
behavior; file presence and shell checks prove only installation properties.
Reuse established native integration proof when justified, recovering it from
Git if needed. Select fresh cases by changed behavior and remaining risk; do not
multiply all variants across all hosts. Leave missing native proof unfinished,
with its concrete requirement, rather than claim release readiness.

Safe stopping point: candidate checks and required native judgments are complete
for the next authorized release. This plan selects no version, creates no release
tag, and does not update this repository's installed managed copies. Any pending
acceptance dependency remains explicit active work under ADR 0005.
Sizing: existing installation mechanism with two expected new runtime files,
no new infrastructure. Use one install/fresh-use proof loop; required host
coverage may reuse valid integration proof. Unavailable native access leaves
acceptance pending rather than triggering tooling development.

## Proof ownership

| Final-state promise | Owner and observation |
| --- | --- |
| Completed execution and retrospective required; optional empty output | Close a completed story: observed completion/refusal boundary |
| Delete plan/story/proof/evidence; no archive, tombstone, or judgment ledger | Close a completed story: actual target snapshot and Git recovery |
| Assimilate lasting knowledge; retain maintained tests/docs | Close a completed story: usable product content without spent markers |
| Shared occurrences, siblings, unrelated content, empty containers, link repair | Remove spent material from shared records: snapshot and preserved sentinels |
| Repeated wrap-up neither recreates history nor duplicates work | Shared records and follow-up slices: second invocation diff |
| Existing follow-up first, canonical reference, active plan preserved | Put an existing follow-up plan first: queue and plan inspection |
| Relevant reorder/removal/addition/story edits, human precedence, unresolved choices | Apply product-review decisions: resulting queue/stories and response |
| Plan retained through execution/retrospective; wrap-up owns closure | Consistent sequence: intermediate and final snapshots |
| Other skill descriptions/references agree; standalone backlog and review behavior retained | Consistent sequence: handoff walkthrough and focused caller review |
| Same shared runtime source, complete payload, applicable host evidence | Ordinary installation: payload assertions and fresh use or justified reuse |
| No unrelated cleanup, direction change, follow-up execution, or installed-copy edits | All slices: owned diff and fixture preservation review |

## Assessment and remaining concerns

Six Behavior slices; no speculative Structure slice or new infrastructure is
needed. Each has one outcome and proof loop, with focused input variants.
Construction already separates shared cleanup, follow-up insertion, and product
advice from the simple closure. No separate slice-refinement pass is currently
needed; no numeric sizing exception is claimed.

The final slice must judge which native proof is reusable; its expected payload
dependency closure has been inspected during planning. No unresolved storage or
new-integration assumption requires an experiment. Native access and prior
proof validity remain execution-time acceptance concerns, not passed checks.
If implementation reveals multiple mechanisms or unbounded work, refine the
affected slice in this same plan. Do not drop scope or waive checks to meet a
deadline. Slices 1–2 are done. Remaining slices stay planned.

## Learnings

Standalone closure commits recovery with the project's Git conventions, then
deletes working-tree copies. Empty plan roots are spent containers. Shared-log
cleanup removes spent-only issues and spent occurrences, preserves ambiguous
issues, and does not recreate history on a second invocation. Follow-up and
product-review advice remain intact until later slices.
