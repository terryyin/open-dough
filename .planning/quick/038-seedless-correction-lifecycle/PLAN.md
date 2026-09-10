# Carry bounded corrections through delivery without a seed

## Outcome and authority

Status: in progress. Planning and predecessor wrap-up were authorized first;
Terry Yin authorized direct execution on 2026-09-10.

A developer can carry one understood retrospective correction from its plan
through execution, refinement when needed, and closure without creating or
recovering a seed solely to satisfy a workflow gate. The plan owns its bounded
outcome, preserved behavior, proof, and decisions. An existing seed may supply
context but is not mandatory for a correction.

Human decision: follow-up plans do not need a seed. Queue this correction by a
direct link to this plan, preserving unrelated backlog order and direction.

## Current evidence and scope

`src/skills/dough-slice-planning/SKILL.md` already accepts bounded retrospective
findings as planning input without inventing a feature story. Its execution
consumer, `src/skills/dough-execute-plan/SKILL.md`, still requires the selected
story in its seed. `src/skills/dough-story-wrap-up/SKILL.md` also requires a
canonical story for a follow-up queue entry, recreating the unwanted prerequisite.
Align these consumers and directly affected refinement, lifecycle, and backlog
references with one shared correction-input contract.

Keep ordinary feature-story refinement unchanged. Preserve meaningful missing
context checks, human-owned product constraints, proof ownership, execution
authority, independent refactoring, CI handling, and recoverable cleanup. A
complete correction plan is sufficient input; an underspecified one is not.
Do not silently substitute the original story's implementation footprint for the
correction's supported scope.

Exclude CI investigation/repair (assigned to another agent), duplicate-test
consolidation, unrelated product work, new artifacts or workflow stages, payload
promotion, release/version changes, and edits to installed skill copies.

Source changes follow Accepted ADRs
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Author shared source under `src/skills/`; reuse existing acceptance/adoption work
for any outstanding native behavioral proof before release. Do not count manual
walkthroughs as native acceptance or duplicate valid shared integration proof.

## Proof and execution conventions

Use one representative correction plan: consolidate an evidenced shared validation
rule while preserving the existing public behavior. Supply its bounded outcome,
current findings, preservation examples, decisions, and project tooling, but no
seed. Trace actual candidate instructions to the next authorized action. Vary
missing proof, an explicit conflicting product constraint, and a normal feature
story whose scope is unresolved. Record concrete observations and limits in this
plan; do not create exact-prose tests or a new harness.

Use the repository's guidance-authoring review: invocation, required context,
and useful outcome. Check changed frontmatter, Markdown links/anchors, and
`git diff --check`. Markdown is outside the existing formatter's targets; do not
format the whole repository. Run relevant existing functional checks only if
changed guidance invalidates their boundary; inspect consumers before declaring
proof reusable. Apply the current execution skill's delivery contract on later
authorized execution. No numeric slice budget or file limit was supplied.

## Ordered slices

### Accept the correction plan as execution and refinement context
Type: Behavior
Status: done
Proof: Walk the seedless correction through execution entry and the existing
refinement path, then apply the missing-proof and conflicting-constraint variants.

Behavior: Given an authorized bounded correction plan with complete context and
no seed, execution can select its next slice and refinement can assess its
remaining work without asking for or creating a seed. Missing correction outcome
or proof stops that path with the actual missing input named; a genuine product
constraint conflict remains human-owned.

Keep the authoritative input distinction in the existing planning lifecycle
reference. Reconcile `dough-execute-plan`, `dough-slice-planning`, and
`dough-slice-plan-refinement` descriptions, entry gates, and relevant delegation
or decision callers. Trace direct links for contradictions rather than creating
a parallel correction workflow. Ordinary unresolved feature stories still route
to story refinement. Planning-only authorization still stops before execution.

Safe stop: all execution/refinement consumers accept the same correction context.
Concern: remaining story-only wording can silently reintroduce the requirement;
verify the full entry-to-delegation path, not just the initial paragraph.

Execution evidence (2026-09-10): the shared planning contract, execution entry,
delegation, execution decisions, slice refinement, planning handoff, and delivery
handoff now distinguish a feature story from a bounded correction. Representative
walkthroughs confirmed that complete seedless corrections proceed, missing
outcome or proof names the absent field, product-constraint conflicts remain
human-owned, ordinary unresolved stories still route to refinement, and
planning-only authority still stops. `git diff --check` passed. Independent
post-change refactoring consolidated the correction-input field list behind its
authoritative planning reference and repaired two affected inbound anchors.
`npm run format` passed without changing the Markdown sources.

CI observer: Codex yielded-cell adapter, coordinator `root-038`, repository
`terryyin/open-dough`, branch `main`, workflow `ci.yml` / `CI`, cell `14`, session
`3685`, mailbox `/tmp/dough-ci-501/watch-tpoZNj`, PID `78613`.

### Preserve and close seedless corrections through the existing lifecycle
Type: Behavior
Status: planned
Proof: Walk completed predecessor closure with a seedless follow-up, repeat the
queue operation, and later close that correction after its own review; vary an
unfinished correction and an existing canonical story.

Behavior: Given a completed reviewed execution and an understood seedless
follow-up, wrap-up queues the existing plan first without creating a seed and
preserves it while deleting predecessor history. Repetition creates no duplicate
entry. After the correction's own execution and retrospective complete, wrap-up
can close it using plan identity and Git recovery without demanding a seed.
An unfinished plan remains intact; existing canonical stories retain their homes.

Reconcile `dough-story-wrap-up`, `dough-product-backlog`, and directly affected
lifecycle references. Use one canonical active home: the correction plan, or an
existing story when supplied. Preserve unrelated queue order, near-future
direction, human text, and still-needed acceptance work. Never recreate spent
history or relax recovery-before-deletion. Missing beneficiary, bounded outcome,
or completion evidence remains a useful stop rather than a fabricated record.

Safe stop: a correction needs no seed at any lifecycle handoff and cleanup still
preserves active work and recoverability.
Concern: queue navigation and deletion ownership must identify a plan directly
without treating every missing seed as permission to close unrelated work.

## Proof ownership

| Promise | Owning observation |
| --- | --- |
| Complete correction can execute/refine without a seed | First slice: seedless entry-to-delegation walkthrough |
| Real missing context and human constraints still stop | First slice: missing-proof/constraint variants |
| No new feature promise or unrequested execution | First slice: ordinary-story and planning-only variants |
| Seedless follow-up retained and queued once | Second slice: predecessor closure and repetition |
| Seedless correction itself can close with recovery | Second slice: completed/unfinished closure variants |
| Existing story homes, unrelated queue and evidence preserved | Second slice: existing-story and preservation variants |

No product behavior has been verified during this planning turn. The two
remaining concerns above concern reference consistency and cleanup ownership;
no infrastructure experiment or additional feature scope is needed.
