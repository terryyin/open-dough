# Visit consumers of every completed selected story and settle on its last publication

**Identity:** SEED-154#harden-supplier-visit-trigger-and-settlement

**Source:** [Correction story](../../seeds/SEED-154-supplier-integration-consumer-reconciliation.md#harden-supplier-visit-trigger-and-settlement),
from the execution retrospective of
SEED-154#reconcile-current-consumers-after-supplier-integration
(story and completed plan recoverable at `75c6949cfeb43b7ba8a6ec57e5e62e6c06eddcf5:.planning/seeds/SEED-154-supplier-integration-consumer-reconciliation.md`
and `75c6949cfeb43b7ba8a6ec57e5e62e6c06eddcf5:.planning/slice-plans/359-reconcile-current-supplier-consumers/PLAN.md`,
both slices done, Story obligations G1–G7). Reviewed commits `cc9f858f`
(slice 1) and `a8c05e46` (slice 2); Take `46e43c29`.

## Goal and scope

A developer completing any selected story through Story Branch wrap-up, Trunk
closure or a selected-work landing gets the current-consumer visit without the
agent first judging that consumers exist. Trunk completion and retirement cannot
skip the last consumer publication's CI completion. Guidance names one
completion target, and the small cleanup findings below are resolved.

Preserve the original story's promises and exclusions: no satisfaction inferred
from a Done entry, no dashboard grammar change, no reverse registry, no consumer
execution, no condition-text matching, and a bounded visit. Generic landing,
`integrate` without `--supplier-identity` and unfinished increments keep no
supplier meaning. Preserve observer ownership, restart, landing-context and
retirement behavior and the G1–G7 dispositions. Exclude fixing this
repository's unrelated discovery problems (see learnings), release and client
rollout. No new story dependency is needed. This plan authorizes no execution.

## Current findings (verified at `a8c05e46` in this checkout)

1. **The visit depends on the agent judging "supplier".** Every entry point
   gates `--supplier-identity` on the selected work being "a completed
   supplier": `src/skills/dough-story-wrap-up/references/story-branch-integration.md`
   (line 29), `src/skills/dough-execute-plan/references/wrap-up-closure-publication.md`
   (76, 172), `src/skills/dough-execute-plan/references/preserve-published-history.md`
   (36), `src/skills/dough-land/SKILL.md` (161, 169) and
   `src/skills/dough-land/references/publish-reviewed-checkout.md` (56–58).
   The shared procedure defines completion, not having consumers, but a caller
   can read "supplier" as "known to have consumers" and omit the flag, which
   reproduces the original failure. Wrap-up SKILL.md (141) now only says to
   "retain recoverable completion evidence".
2. **An early `--visit-settled` skips the consumer publication.**
   `trunk-closure-visit.mjs` accepts any SHA with acceptedSha ⊑ settled ⊑
   tracking; `trunk-closure.mjs` completes it and retires with `contained`
   `[beforeCleanup, acceptedSha, completed]`.
3. **Stale completion-target wording.** `story-branch-integration.md` (3–6)
   says shared completion runs "on the accepted integrated SHA" and
   `ci-monitor.md` (88) says "the final accepted closure or integrated SHA",
   while `wrap-up-closure-publication.md` (178–180) completes the last consumer
   publication.
4. **Files over the 250-line refactor limit:** `src/skills/dough-story-wrap-up/SKILL.md`
   (260), `src/skills/dough-land/SKILL.md` (254),
   `tests/support/supplier-land-visit.test.mjs` (255).
5. **Standalone `visit-consumers` prints a stack trace on a raw Git failure**:
   `product-backlog.mjs` (237–247) rethrows any non-`BacklogError`; only
   `visitSelectedSupplier` wraps it as a stopped visit, yet guidance routes
   every repeated visit through the standalone command.
6. **Static import cycle** `history-preserving-publication.mjs` ↔
   `supplier-integration.mjs` (line 30 imports `integrateSelectedSupplier` for
   CLI dispatch), giving the generic Git publisher supplier meaning that plan
   359's PFE warned against.

## Current decisions and existing solutions

- **One trigger rule, in the shared procedure.** Every completed selected work
  item with a recorded identity is a potential supplier. "Completed" keeps the
  procedure's existing meaning (all planned slices done, or a planless outcome
  evidenced from its instruction), so planless selected work is already
  included and needs no new product decision. Work without a recorded identity
  (context-only or one-shot execution) has no canonical home and takes no visit.
  Discovery, not the agent, decides whether consumers exist; zero consumers is
  the ordinary result. Entry points link to that rule instead of restating a
  supplier condition.
- **Explicit flag, no script default.** Callers pass the selected identity as
  `--supplier-identity` (Story Branch `integrate`, Trunk `finish`) or
  `supplierIdentity` (Land APIs). Trunk `finish` does not derive it from
  `--identity`: that flag is a retirement creation-record input passed only
  where Dough Land's retirement says, and coupling them would give retirement
  input supplier meaning. Generic `integrate` stays supplier-free.
- **Zero-consumer Trunk finish completes in one call.** When the visit is
  `visited` with no consumers and no problems, `finish` continues to complete
  `acceptedSha` and retire in the same invocation, printing the visit. Any
  consumer, any discovery problem or a stopped visit keeps today's
  `step: "visit"` handoff.
- **Settlement names this closure's last registered publication.** Reuse the
  observer revision records `trunk-closure-settlement.mjs` already reads
  (`observers.directories.flatMap(listRegisteredRevisions)`). Refuse
  `--visit-settled S` with `step: "visit"` and resources kept when a revision
  registered on this closure's own observers is on tracking and strictly
  descends from S. Completion then always reaches the last consumer
  publication. A registered revision is the discriminator: a target
  fast-forward by another writer is not registered and does not block
  `acceptedSha`.
- **Cycle direction:** keep the generic publisher free of a static supplier
  import, for example by a dynamic import in its CLI `--supplier-identity`
  branch, or by moving the shared constant so `supplier-integration.mjs` does
  not import the CLI module's dependency on it. A new runtime file must be added
  to the existing `install.sh` payload declaration and its install check.
- **Visit error shape:** classify a raw Git failure inside
  `visitCurrentConsumers` as the same stopped visit `visitSelectedSupplier`
  returns today (`status: "stopped"`, `reason: "error"`, the error text and a
  recovery). Input refusals (`BacklogError`, for example a non-full revision)
  stay refusals. `visitSelectedSupplier` then has no separate wrapper to keep.

Applicable direction: [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one domain solution, no extra machinery),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[maintainer guidance](../../../AGENTS.md) (author runtime only under
`src/skills/`; do not hand-edit installed copies),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(executing-agent wording, one shared source) and
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(mechanical regression is distinct from guidance use; apply the AGENTS.md
behavior review). No North Star topic or ADR change is needed.

## Preparation observations

Observed in `/Users/terryyin/git/open-dough/.worktrees/reconcile-current-dependent-stories-after-suppli`
at `a8c05e46` on 2026-10-27. Scratch specs ran under
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh tests/support/zz-scratch-premise.test.mjs`
against the real Trunk closure fixtures (bare remotes, installed `finish` and
`deliver` CLIs) and were deleted afterwards; `git status` then showed only the
pre-existing `DearDough.md` change. Each run passed; the runner's exit 1 was its
quiet-pass rule for printed output.

1. **Zero-consumer finish stops today (slice 1 discriminates).** Completed
   supplier fixture, then `finish --supplier-identity SEED-A#a` (a selected
   story nobody depends on): `{"step":"visit","status":"visited","consumers":[],"problems":[]}`.
   The current code makes a second call necessary even for a clean empty visit.
2. **An early `--visit-settled` retires today (slice 1 discriminates).** Racing
   late consumer journey; consumer changes published through `deliver` as
   `consumerSha`; then `finish --final <acceptedSha> --visit-settled <acceptedSha>`
   with CI released only for the before-cleanup and accepted SHAs:
   `{"ok":true,"step":"done","requested":<acceptedSha>,"worktreeExists":false}`
   with the branch removed. The consumer publication's completion was skipped.
3. **The consumer publication is registered on this closure's observer.**
   Same journey: `listRegisteredRevisions(result.observation.directory)` held
   the before-cleanup SHA, `acceptedSha` and `consumerSha`, and
   `delivered.observation.directory` was the same directory. The settlement
   rule's discriminator reaches the data it needs. (The branch tip also equalled
   `consumerSha`, but a tip rule would refuse `acceptedSha` after a visit that
   fast-forwarded over another writer's commits, so it was not selected.)
4. **Standalone visit Git failure (slice 3 discriminates).** Read-only:
   `node src/skills/dough-product-backlog/scripts/product-backlog.mjs visit-consumers --supplier-identity SEED-999#none --accepted-revision <HEAD SHA> --remote nope-remote --target refs/heads/main`
   exited 1 with an uncaught `Error: Command failed: git fetch --quiet nope-remote refs/heads/main`
   stack trace from `product-backlog-git-repository.mjs:73`. A non-full
   revision instead printed the refusal "accepted-revision must be a full Git
   revision. Nothing was written." Note: this checkout's *installed*
   `.claude/skills/dough-product-backlog` copy predates `visit-consumers`
   ("Unknown operation"); proofs use the source tree.
5. **Discovery for an unknown identity is clean in principle but not in this
   repository.** `discover-consumers --supplier-identity SEED-999#none` here
   returned `consumers: []` with three unrelated `problems` (backlog anchors in
   SEED-001, SEED-010 and SEED-028 with no `### ` heading). In this repository
   a zero-consumer Trunk finish will therefore still stop for the agent's
   judgment of those gaps; that is the correct incomplete-discovery behavior.
6. **Story Branch and Land need no mechanical change for zero consumers.**
   `integrateSelectedSupplier` and `publishSelectedSupplier` return the receipt
   with `visit` and leave continuation to the caller; no second call exists
   there. Their late-consumer journeys (`supplier-integration-visit.test.mjs`,
   `supplier-land-visit.test.mjs`) were accepted proof in plan 359.
7. **Guidance tests already read the affected wording.**
   `ci-completion-lifecycle-guidance.test.mjs` (249 lines) asserts
   `accepted integrated SHA[\s\S]+trunk observer[\s\S]+combined receipt` in
   `wrap-up-closure-publication.md` and the wrap-up retirement wording;
   `dough-land-guidance.test.mjs` and `observer-owner-guidance.test.mjs` read
   the Land and closure guidance. New guidance assertions go in a new file so
   the existing one stays within the limit.

## Outside-in proof

| Promise / boundary | Owner | Required observation |
| --- | --- | --- |
| Clean zero-consumer Trunk finish completes `acceptedSha` and retires in one call | Slice 1 | Installed `finish --supplier-identity` for a completed selected story with no consumers returns `ok: true` with the printed visit, `completion.requestedSha === acceptedSha`, and the worktree and branch removed; with a discovery problem it still stops at `step: "visit"`. Fails on current code (observation 1). |
| An earlier `--visit-settled` cannot skip a consumer publication | Slice 1 | After a consumer `deliver`, `--visit-settled <acceptedSha>` stops at `step: "visit"` naming the later registered SHA, nothing completed or retired; `--visit-settled <consumerSha>` completes it and retires. Fails on current code (observation 2). Existing journey, G5 and G6 cases stay green. |
| Every completion entry point visits for any completed selected work; one completion target | Slice 2 | New guidance test fails on today's "completed supplier" gating and stale target wording, passes after; a Story Branch `integrate --supplier-identity` regression whose supplier branch had no consumer still visits the late trunk consumer; the AGENTS.md behavior walk below. |
| Standalone visit reports a Git failure as a stopped visit | Slice 3 | CLI `visit-consumers` with an unreachable remote prints stopped-visit JSON, exit 1, no stack trace; input refusals unchanged; the integrate path's stop shape unchanged. |
| Generic publisher carries no supplier dependency; test files within limit | Slice 4 | No static import from `history-preserving-publication.mjs` to `supplier-integration.mjs`; generic `integrate` and `--supplier-identity` integrate, Land and payload-install suites stay green. |

## Ordered slices

### 1. Trunk finish settles the visit on its last registered publication

Type: Behavior
Status: done
Proof: New cases beside the Trunk visit journey (a new file or the 119-line
`tests/support/supplier-trunk-closure-visit-recovery.test.mjs`; keep each file
under 250 lines) through the installed `finish` and `deliver` CLIs, plus the
existing `supplier-trunk-closure-visit*.test.mjs` and
`src/skills/dough-story-wrap-up/scripts/trunk-closure*.test.mjs` suites.

Behavior: Given an accepted final closure for a completed selected story, a
clean visit with no consumers completes `acceptedSha` and retires in that same
`finish`; after consumer publications on this closure's observer, a
`--visit-settled` earlier than the last registered one is refused with
resources kept, and naming it completes that publication before retirement.

- Change `trunk-closure-visit.mjs` and its `finish` call site only; pass this
  closure's observer directories from settlement rather than rediscovering
  observers differently. Keep `contained` covering the completed SHA.
- Update `wrap-up-closure-publication.md`'s `finish` paragraph and result-table
  `step: "visit"` row for the one-call empty visit and the refusal.
- Scratch-disable each rule and observe its new case fail before accepting.

Safe stopping point: Trunk settlement is safe; guidance gating still unchanged.

Accepted proof (2026-10-27): `tests/support/supplier-trunk-closure-visit-settlement.test.mjs`
(clean visit completes `final` and retires in one call; a discovery problem
still stops at `step: "visit"`; `--visit-settled <acceptedSha>` refused naming
`consumerSha`, then `consumerSha` completes past another writer's unregistered
commit), with `supplier-trunk-closure-visit*.test.mjs`, all 13
`trunk-closure*.test.mjs`, `ci-completion-lifecycle-guidance` and
`observer-owner-guidance` green through the runner. Each rule's scratch-disable
failed its case. `settleFinalClosure` now returns `observerDirectories`; the
gating sentence in `wrap-up-closure-publication.md` stays for slice 2.
Learning: the changed closure scripts and guidance are inputs to the paid
native closure evidence identities, which stay manual-only.

### 2. Every completed selected story takes the visit under one completion target

Type: Behavior
Status: done
Proof: A new guidance test (for example
`src/skills/dough-execute-plan/scripts/supplier-visit-guidance.test.mjs`) over
the entry points and the shared procedure; a Story Branch regression in
`tests/support/supplier-integration-visit.test.mjs` (196 lines, or a sibling
file) whose supplier branch has no consumer before the late trunk consumer;
`ci-completion-lifecycle-guidance.test.mjs`, `dough-land-guidance.test.mjs`,
`observer-owner-guidance.test.mjs`; and the behavior review below.

Behavior: Given a completed selected work item with a recorded identity and no
consumer visible on its branch, an agent following Story Branch wrap-up, Trunk
closure or the selected-work Land path passes that identity, receives the
visit, judges the late trunk consumer, and completes the last accepted
publication.

- State the trigger rule once in
  `src/skills/dough-product-backlog/references/supplier-dependencies.md`
  (240 lines; stay within 250) and replace the "completed supplier" conditions
  at every entry point in finding 1 with a link to it. Restore wrap-up
  SKILL.md's pointer to the current-consumer visit.
- Correct finding 3's wording in `story-branch-integration.md` and
  `ci-monitor.md` to the final accepted SHA: the integrated or closure SHA, or
  the last consumer publication. Update any existing assertion that reads the
  replaced phrase rather than weakening it.
- Bring `src/skills/dough-story-wrap-up/SKILL.md` and
  `src/skills/dough-land/SKILL.md` to 250 lines or fewer while editing them,
  moving detail to their existing references without behavior change.
- Run the installed `consumer-trace.mjs` against the diff with the changed
  phrases as extra terms; disposition every meaningful consumer.
- Behavior review (AGENTS.md): walk a completed selected story whose branch
  shows no consumers through each entry point to the late consumer's judgment
  and the completion target; include a decision-needed consumer that is cited,
  stops its path and stays with a human. Record the walk in this plan.

Safe stopping point: the original failure cannot recur through a judgment that
the work "is a supplier".

Accepted proof (2026-10-27): the rule is `supplier-dependencies.md#which-completed-work-takes-the-visit`;
`supplier-visit-guidance.test.mjs` failed all five cases at `25ffa738` and
passes now (one rule, every entry point links it with no "completed supplier"
gate, explicit identity, wrap-up pointer, final-accepted-SHA target, moved
Story Branch retirement gate). `supplier-integration-late-consumer.test.mjs`
shows a branch whose own discovery is empty still visits and resolves the late
trunk consumer through `integrate --supplier-identity`. Existing guidance and
visit journeys stay green. Detail moved, not dropped: Story Branch retirement
to `story-branch-integration.md#retire-story-branch-resources`, follow-up
provenance to `follow-up-disposition.md`.

Behavior review walk: SEED-B#b, completed with nothing depending on it when
its branch was cut; SEED-A#late lands on trunk waiting on B. Story Branch
wrap-up links the rule, runs `integrate --supplier-identity SEED-B#b` "even when
its branch shows no consumer", judges SEED-A#late from `visit`, publishes on the
trunk observer and completes the last consumer publication, then retires with
`--contained` for it. Trunk closure passes `--supplier-identity` (never from
`--identity`), gets `step: "visit"`, delivers and reruns with
`--visit-settled <consumerSha>`; an empty clean visit finishes in one call.
Selected-work Land uses the visit forms with `supplierIdentity`; a generic
landing or `--keep-worktree` increment takes none. A decision-needed consumer
records its question, cites any conflicting Accepted ADR, stops that path and
is retained in active context for a human before completion. Context-only or
one-shot work has no identity and takes no visit.

### 3. Standalone visit reports a Git failure as a stopped visit

Type: Behavior
Status: done
Proof: A CLI case through `product-backlog.mjs visit-consumers` with an
unreachable remote in the visit fixture's repositories (for example extending
`tests/support/supplier-integration-visit.test.mjs` or its revisit sibling
within the line limit), plus the existing supplier-integration and
supplier-dependency suites.

Behavior: Given a raw Git failure during `visit-consumers`, the command prints
the stopped-visit JSON with the error and recovery and exits 1 without a stack
trace; input refusals and the integrate/Land/Trunk stop shapes stay the same.

- Classify the failure in `visitCurrentConsumers`; drop the duplicate wrapper in
  `visitSelectedSupplier` once equivalent. Observation 4 is the failing case.

Safe stopping point: every visit path reports failures the same way.

Accepted proof (2026-10-27): `supplier-integration-visit.test.mjs` drives the
real `visit-consumers` CLI at `nope-remote` (exit 1, `stopped`/`error` with the
fetch error and recovery, no stack lines, HEAD unchanged) and a non-full
revision (refusal text, empty stdout); it failed with the classification
scratch-disabled. All 15 `tests/support/supplier-*.test.mjs` and
`supplier-visit-guidance` stay green. `visitSelectedSupplier` keeps no wrapper,
so a `BacklogError` from caller input now throws there; every caller passes a
supplied identity and an accepted full SHA.

### 4. Remove the generic publisher's supplier import and split the oversized test

Type: Structure
Status: planned
Proof: Preserved behavior through `tests/support/supplier-integration-visit.test.mjs`,
`supplier-integration-revisit.test.mjs`, `supplier-land-visit.test.mjs` (and its
split sibling), `src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs`,
the Land suites (`dough-land.test.mjs`, `queued-closure-check`) and, if a
runtime file is added, the payload-install test.

Structure: removes finding 6's static cycle so the generic Git publisher has no
supplier dependency, and splits `tests/support/supplier-land-visit.test.mjs`
under 250 lines (finding 4). External behavior of generic and supplier
`integrate`, Land and installation is unchanged. This is a retrospective
correction slice; it enables no further Behavior.

Safe stopping point: correction complete.

## Verification and execution gates

Focused proof uses the repository runner, never bare `node --test`:
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh <paths>`
with each slice's literal paths. Do not run whole suites locally merely because
hosted CI runs them; host load is high. Broaden only for consumers the
consumer trace names or a changed shared fixture. Use the installed Execute Plan
workflow for post-change refactoring, owned commits and publication and CI
repair. Proof must use the source tree under `src/skills/`, since this
checkout's installed backlog copy predates `visit-consumers`.

## Learnings and concern review

This repository's own discovery reports three unrelated broken backlog homes
(observation 5), so its own zero-consumer Trunk finishes will still stop at the
visit until those records are repaired; that repair is separate product-record
work, not this correction.

Slice-plan refinement was not needed: each slice owns one entry-point outcome
and proof loop (Trunk settlement, guidance trigger and target, CLI error shape,
structural cleanup), file-size cleanup rides with the slice already editing
that file, and no speculative structure is added. No remaining slice-specific
concern was identified. Decisive premises for slices 1, 3 and the settlement
discriminator were observed above; slice 2's guidance assertions are written to
fail on the current text. No human decision is required: the trigger rule uses
the shared procedure's existing completion definition, including planless work.
