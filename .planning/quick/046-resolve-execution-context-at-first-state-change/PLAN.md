# Resolve execution context at its first state change

## Source and correction boundary

Execution retrospective of
[Quick 045](../045-focused-recoverable-execution-context/PLAN.md), implementing
[SEED-004 Story 21](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#focused-recoverable-execution-context).
Review date: 2026-09-14. The execution-ready plan is recoverable at claim commit
`7e1d202`; the contiguous implementation boundary is `0f3af21`, `dd2190c`,
`531e82c`, and `b0b32e1`. All four original slices are done. This is one bounded
follow-up correction of pre-slice execution-context resolution, not a reopening
of those completed slices.

Beneficiary: a developer and coordinating agent executing planned work in Story
Branch Mode. The bounded outcome is that each pre-slice state change resolves
its governing context before it acts and from the selected execution checkout:
the commit-hook contract is resolved before the Taken-only claim commit, and a
CI observer is launched from the installed runtime belonging to the selected
execution checkout.

Include the main execution startup/claim guidance, runtime setup and Codex
observer adapter guidance, and focused deterministic proof at the existing
runtime-test seam. Exclude changing hook behavior, CI worker or mailbox logic,
host settings, Story Branch Mode, agent responsibilities, release/adoption,
installed-copy synchronization, a native host campaign, or a new context/state
registry. Preserve the Taken-only claim, asynchronous CI, exact observer
identity, coordinator-owned delivery, independent refactoring, and all Quick
045 product outcomes.

## Retrospective findings

**R1 — P1: hook resolution can occur after the first commit it governs.**
`src/skills/dough-execute-plan/SKILL.md:64-80` now resolves context at the first
boundary that needs it, but lists the selective formatting command, commit-hook
contract, and authorized push destination as delivery-time context. The same
skill's Taken transition at lines 103-132 commits the backlog-only claim before
worktree setup, delegation, or delivery. Quick 045's execution-ready plan at
lines 140-142 explicitly required resolving the hook contract before committing
under `dough-execute-plan`. The resulting guidance therefore permits a
Taken-only commit before an active hook's behavior is known. Quick 045 happened
to find no active hook and produced a clean claim commit, so no repository
corruption was observed; with an active mutating or failing hook, the index or
claim transition could be changed before the coordinator establishes the safe
contract.

**R2 — P1: observer launch can bind to the origin checkout instead of the
selected execution checkout.**
`src/skills/dough-execute-plan/references/runtime-setup.md:9-15` says to resolve
the installed skill directory from the skill that was loaded, independently of
the working directory, and the runtime derives checkout identity four levels
above that module. The main skill at lines 148-177 requires observation to bind
to the selected execution worktree, while
`references/ci-notify-codex.md:18-20` combines an absolute resolved runtime path
with the selected checkout as `workdir`. During Quick 045, the coordinator used
the origin checkout's loaded installed path with the execution worktree as
`workdir`. The observer request consequently recorded
`/Users/terryyin/git/open-dough/` instead of
`/private/tmp/open-dough-045.DZNCJt/worktree`. Execution reconciliation caught
the mismatch, stopped the exact zero-event observer, and rearmed from the
worktree's installed path. Existing deployment-layout proof confirms that the
runtime derives its root correctly from whichever installed path is invoked;
it does not prove selection between simultaneous origin and execution checkout
runtimes. Without reconciliation, readiness and repair decisions could concern
the wrong checkout.

Aggregate review found no additional consequential duplication, dead
restriction, accumulated workaround, or product-scope drift. Slice-level
independent refactoring was completed. Focused runtime proof passed during this
review:

`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs`

This pass preserves the existing runtime behavior but does not cover either
context-selection defect. No broad suite or native host campaign was run.

## Existing solution, architecture, and decisions

PFE responsibility: resolve state-changing execution context from its existing
authoritative owner. Extend current owners rather than add a workflow, registry,
or checkout identity artifact.

| Existing owner | Evidence and decision |
| --- | --- |
| `src/skills/dough-execute-plan/SKILL.md` | Already owns startup context, the Taken transition, checkout selection, and observer launch. Move the hook contract to the claim-commit boundary and make the selected-checkout runtime invariant explicit here. |
| `src/skills/dough-execute-plan/references/runtime-setup.md` | Already owns installed runtime discovery and checkout-derived identity. Clarify that the runtime path for checkout-bound work comes from that selected checkout, not merely whichever copy supplied the initially loaded prose. |
| `src/skills/dough-execute-plan/references/ci-notify-codex.md` | Already owns the Codex launch recipe. Require the resolved runtime path and selected working directory to identify the same checkout before launch. |
| `src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs` | Already proves installed-layout root derivation. Extend its fixture or add adjacent focused proof for two simultaneous checkout roots rather than create a separate test lifecycle. |
| `src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs` | Preserves the Codex observer lifecycle contract; keep it green if adapter guidance or fixtures change. |

Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports low coordination cost, safe stopping, and inexpensive changes of
direction. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires authoritative homes and precise roles when multiple locations exist.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) places the
two-checkout runtime invariant at deterministic proof while retaining a
representative behavior review for ordinary guidance.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) keeps
these corrections in `src/skills/`; release and adoption remain separate. No
ADR conflict, exception, or new architectural direction is proposed.

## Proof mapping and execution constraints

| Corrected promise | Owning slice and outside-in observation |
| --- | --- |
| A commit-hook contract governs the first commit, including the Taken-only claim | 1: representative active-hook and no-hook startup walkthrough |
| CI observation identifies the selected execution checkout even when an origin checkout also exists | 2: deterministic two-checkout fixture plus missing/mismatched-runtime stop |
| Existing claim, delivery, observer, and recovery behavior remains intact | Both slices: focused existing proof and linked-guidance review |

At execution time, claim the queued correction through the normal workflow and
establish fresh branch, worktree, observer, and push identities. Do not reuse
Quick 045's stopped observer. Public edits belong only in `src/skills/`; do not
hand-synchronize `.agents/skills/` or `.claude/skills/`. Apply the AGENTS
behavior review for invocation context, required context, and useful outcome.
Run `git diff --check`, the focused commands owned by each slice, and selective
formatting/lint only where affected. Do not add tests that merely search prose
for wording. No numeric slice budget or timing target is supplied or invented.

## Ordered slices

### 1. Resolve the claim commit contract before taking work
Type: Behavior
Status: planned
Depends on: none

Behavior: Given a queued story or bounded correction, the coordinator resolves
the applicable commit-hook and selective-formatting contract before creating the
Taken-only claim commit. A missing, mutating, failing, or disputed hook prevents
an unsafe claim commit through the existing stop/decision path; an absent or
understood check-only hook permits the backlog-only transition without pulling
later push or CI context forward unnecessarily.

Change: Align startup-context timing and the Taken transition in the main
execution skill. Name the claim commit as the first commit boundary governed by
the hook contract while preserving lazy resolution for context first needed by
later delivery. Do not change hooks, add hook automation, combine the claim with
implementation, or require the push destination before it is needed.

Proof: Walk representative queued-work entry with (1) no active hook, (2) an
understood check-only hook, and (3) an unknown or mutating hook. Identify the
exact context resolved before backlog mutation and before commit, show that the
third case stops without claiming completion, and confirm the staged claim
contains only the selected backlog move. Review the linked delivery guidance for
contradiction. Run `git diff --check`; no semantic wording-matching test is
required for this conventional guidance boundary.

Safe stopping point: the first commit has a resolved governing contract and all
later execution responsibilities remain unchanged. Stop for human judgment if
safe hook handling would require behavior outside the existing execution scope.

### 2. Bind the CI observer runtime to the selected execution checkout
Type: Behavior
Status: planned
Depends on: none

Behavior: Given distinct origin and execution checkouts that both contain an
installed execution runtime, launching CI observation for the selected execution
worktree derives request root, branch, and mailbox identity from that worktree,
not from the checkout whose prose was initially loaded. A missing or mismatched
selected-checkout runtime stops before launch with a recoverable diagnosis.

Change: Align the main execution skill, runtime setup, and Codex adapter around
one invariant: checkout-bound runtime paths and `workdir` name the same selected
execution checkout. Preserve the runtime's existing path-derived identity and
exact shutdown/rearm protocol. Extend the existing deployment-layout test seam
for simultaneous origin and execution roots; add no registry, environment-wide
search, or alternate identity source.

Proof: Construct a deterministic fixture with separate origin and execution
roots, each containing an installed runtime. Select the execution root, launch
through the documented resolution seam, and assert the written request's
canonical root equals the execution checkout and differs from origin. Exercise
a missing or deliberately mismatched selected runtime and observe refusal before
an observer is armed. Then run:

`node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs`

Safe stopping point: deterministic proof distinguishes the two checkouts and
the existing lifecycle remains green. Native CI observation is not required
unless implementation changes a host/runtime boundary beyond this plan.

## Cumulative assessment and remaining concerns

Both slices apply one rule—resolve context from its authoritative location
before the first state change it governs—to distinct observable boundaries.
They share no new mechanism and retain existing recovery and delivery owners.
The existing two-checkout runtime fixture seam and representative hook cases
make each proof loop independently executable. No slice-specific concern
currently requires further refinement; newly discovered hook automation or
runtime identity redesign returns for scope judgment instead of expanding this
correction.
