# Reconcile current consumers after supplier integration

**Identity:** SEED-154#reconcile-current-consumers-after-supplier-integration

**Source:** [Selected story](../../seeds/SEED-154-supplier-integration-consumer-reconciliation.md#reconcile-current-consumers-after-supplier-integration)

## Goal and scope

After a completed supplier reaches the authorized integration target, visit
every consumer in the current integrated project and publish justified
resolutions, or explicitly retain the unresolved work, evidence and next action.
A prepared consumer must not remain blocked merely because it was added on
trunk after its supplier branch started.

Cover Story Branch wrap-up, Trunk Mode closure and a landing with retained
selected-completed-supplier context. Include queued, Taken, prepared unqueued,
sibling and canonical-correction homes through the existing discovery reader.
Preserve unrelated dependencies, consumer intent, slice status, queue order and
readiness judgments, except the shared procedure's separately justified bounded
reconciliation, agreement correction and spent-reason reassessment.

Exclude consumer implementation, dashboard grammar/UI changes, a reverse
dependency registry, continuous monitoring, generic inference of completion from
Done/missing history, a Pygardon instance change, and release/client rollout.
No new story dependency is needed. This plan authorizes no execution by itself.

## Current decisions and existing solutions

The common rule is **preserve supplier proof → accept integration → establish a
current owned checkout → discover and judge current consumers → publish owned
outcomes → complete observation and retire**. A pre-cleanup scan preserves useful
context but cannot establish the integrated visit's coverage.

PFE findings:

- [The supplier procedure](../../../src/skills/dough-product-backlog/references/supplier-dependencies.md)
  already owns semantic judgment, guarded correction, unresolved dispositions,
  evidence, replay and publication. Change that source and link callers to its
  complete post-integration visit, rather than directly to its write stage.
- `product-backlog-dependency-consumers.mjs` already discovers live canonical
  homes; `product-backlog-dependency-resolution.mjs` and its supporting modules
  already validate historical supplier identity, completed proof, target
  ancestry and agreement basis. Reuse them. Neither a fresh list nor a tool
  receipt judges whether a prose condition is fulfilled.
- `history-preserving-publication.mjs` preserves published history but returns
  to the supplied branch. It is a generic Git publisher, not a supplier
  workflow. Compose it at the selected supplier's closure boundary; do not make
  every generic publication imply supplier completion.
- `trunk-closure.mjs` owns publication, CI completion and retirement in one
  call. It needs a visit handoff before that call can remove the workspace.
  Preserve its owner-specific observer, accepted SHA and restart behavior.
- The shared dependency reader owns blockers. `dashboard/src/storyDependencies.ts`
  consumes that interpretation; changing dashboard semantics cannot repair a
  waiting canonical agreement.

Use a narrow command-backed integration/visit handoff in the existing supplier
and closure tooling. It establishes the owned checkout's relation to the fetched
target and calls the existing discovery implementation, returning its observed
revision, agreements/bases and problems for agent judgment. The Story Branch
completion entry point must invoke it after accepted integration. Keep its
operational return in existing active context, not a new persistent registry.
Do not automate fulfillment or encode a second dependency state machine.

The handoff must preserve local changes and stop usefully on a dirty or divergent
checkout instead of resetting or silently switching away from them. A clean
restored supplier branch can fast-forward to the fetched target containing the
accepted integration. The optional default checkout is never the source of
integration truth or a required mutation destination.

After consumer publication reconciliation changes the observed inventory,
agreement or relevant intent, rediscover and rejudge the affected records.
Preserve unchanged satisfied evidence byte for byte. Keep ordinary bounded
publication retries; report persistent contention rather than adding a polling
loop or claiming a permanently closed set of future consumers.

Applicable direction:

- [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  reuse one domain solution and reconcile during integration; choose no more
  machinery than the current completion handoff needs.
- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [maintainer guidance](../../../AGENTS.md): author runtime changes only
  under `src/skills/`; add any new runtime dependency to the existing payload
  declaration and its functional checks. Do not hand-edit installed copies.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one shared behavioral source, project-relative context, direct instructions.
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  distinguish mechanical regression from actual guidance use; apply the
  representative behavior review in AGENTS.md. This introduces no new host
  activation mechanism and no routine per-host discovery matrix.
- [North Star: one backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keep repository records authoritative. No North Star amendment or new ADR is
  needed; no conflict with the current Accepted decisions was identified.

## Preparation observations

Inspected and observed in the preparation checkout
`/Users/terryyin/git/open-dough/.worktrees/reconcile-current-dependent-stories-after-suppli`
at `b297660797696272e744caf74682ba8e140c2556` on 2026-10-27. All Git writes below
were confined to disposable local fixture repositories with bare remotes. No
source edit or live-project dependency write was retained.

1. **The ordinary resolver supports this outcome once the checkout is current.**
   Command: `node --test tests/support/supplier-dependency-completion.test.mjs`.
   All three tests passed (about 6.7 seconds). Inspected setup creates consumers
   before completion; assertions reach real CLI resolution, startup eligibility,
   historical proof recovery, unchanged replay, stale agreement refusal and
   discovery problems. This is reusable command behavior evidence, not proof of
   late-consumer discovery by wrap-up.
2. **Accepted Story Branch publication does not make its restored checkout
   current.** A disposable stdin probe, run with `node --input-type=module`,
   composed the existing `createQueuedTrunk`, `draftLateStory`,
   `publishHistoryPreservingCandidate`, `run`, `resolveConsumer` and
   `readDependencies` fixtures/APIs. Its setup and decisive observations:
   - Publish A's waiting agreement on B, then branch the supplier workspace.
   - Commit B's completed plan as evidence, run `complete`, delete B's source
     and plan, and publish the supplier branch's closure tip.
   - On trunk, add the prepared unqueued sibling `SEED-A#late` and its waiting
     agreement on B, then publish it.
   - Run `discover-consumers --supplier-identity SEED-B#b` in the supplier
     workspace: only `SEED-A#a` is returned.
   - Run the real history-preserving integration API with that closure tip and
     branch. It returns `published`; HEAD returns to the old closure tip.
     Repeating the same discovery still returns only `SEED-A#a`.
   - Run `git merge --ff-only <acceptedSha>` there. Discovery now returns both
     identities with no problems. Resolve the late agreement through the real
     CLI with the distinct evidence/integration revisions and publish it:
     its blockers fall from one to zero. Replay leaves `git diff --stat` empty.
   The paired observation discriminates checkout freshness: discovery before
   the fast-forward demonstrably misses the late consumer. It proves the
   failure mechanism and the existing remedy primitives, not a new automated
   completion path. The probe was removed with its fixture.
3. **Existing integration checks do not prove the missing workflow step.**
   `closure-story-integration.test.mjs` explicitly identifies itself as Git
   mechanics; `closure-dependency-test-fixtures.mjs` invokes resolution itself
   against prearranged consumers. Those tests cannot supply the new discovery
   call or hard-code the new consumer on the completion path's behalf.
4. **The Trunk command combines publication and retirement without an agent
   visit between them.** Command: `node --test --test-name-pattern='^finish publishes the final closure' src/skills/dough-story-wrap-up/scripts/trunk-closure.test.mjs`.
   The selected installed-CLI journey passed in about 2.1 seconds: accepted
   publication, its coordinator's CI receipt and confirmed shutdown, default
   refresh, and removal of both workspace and branch occur in one invocation.
   Its fixture has no late consumer; it proves the existing lifecycle to
   preserve, not supplier coverage. Slice 2 owns the new visit interruption
   point and the missing consumer scenario.

The seed's preserved Pygardon evidence remains the historical symptom and
provenance. This local reproduction establishes a possible failure path; it
does not recover the original agent's command trace. No paid or owner-operated
probe is needed for the selected implementation approach.

## Outside-in proof and consumer trace

| Promise / boundary | Owner | Required observation |
| --- | --- | --- |
| Consumer added on trunk after supplier branching is visited after integration (examples 1, 6) | Slice 1 | Real completion entry point returns/discovers both current agreements from the integrated checkout; subsequent owned resolution reaches remote trunk and the shared reader reports no supplier blocker. Omitting the fresh visit or checkout advance fails this regression. |
| Existing resolved consumer, late consumer and historical proof survive cleanup/replay (examples 2, 5) | Slice 1 | Both distinct revisions are valid; old satisfied bytes and preparation facts are unchanged; replay adds neither a commit nor evidence receipt. |
| Each current home kind remains discoverable | Slice 1 | Reuse the canonical-home discovery cases; include the concurrently added prepared unqueued sibling in the integration journey and retain queued, Taken and correction coverage. |
| Unfulfilled conditions, human decisions, broken homes and changed agreements remain explicit (examples 3, 4) | Slice 1 | Waiting/decision-needed records retain the precise missing behavior/question and recovery action; discovery problems retain context; stale writes refuse and require rejudgment. One unresolved consumer does not prevent an independent resolution. |
| Trunk Mode and selected-supplier Land share the same current visit | Slice 2 | Their actual owning path reaches discovery after target reconciliation, including a consumer introduced by a racing writer, while the workspace/observer still exist. |
| Visit/publication precedes successful completion and retirement | Both | Recorded operation order and final remote content show the visit and owned publications before completion/shutdown and retirement; unresolved work is explicitly retained before any permissible cleanup. No early receipt covers a later consumer publication. |
| Local default-checkout changes, unrelated dependencies, consumer scope/status/order and readiness remain intact | Both | Capture before/after state; use existing refusal/reconciliation/readiness tests for unchanged contracts and add assertions at the changed closure boundary. Generic landing/increment does not acquire supplier completion. |

Trace the changed closure handoff through `story-branch-integration.md`,
`wrap-up-closure-publication.md`, wrap-up and Land SKILL.md, the installed CLI
entry points, closure fixtures, completion/observer tests, retirement and payload
declarations. At implementation, run the installed `consumer-trace.mjs` against
the actual diff with the changed command names and retired early-completion
behavior as extra terms; disposition every meaningful consumer before accepting
proof. Do not alter generic publication or dashboard contracts merely to make
the fixture convenient.

## Ordered slices

### 1. Visit the current integrated consumers during Story Branch completion

Type: Behavior
Status: done
Proof: A bare-remote Story Branch completion regression with a late trunk
consumer, plus the shared supplier resolution/refusal/replay suite and the
representative guidance walk described below.

Behavior: Given a completed, recoverable supplier on a published story branch
and consumers added or changed on trunk, accepting integration leads the owning
completion path to establish a current owned checkout and discover all current
agreements. Agent judgments can then publish directly justified outcomes while
retaining unresolved work, before final completion and retirement.

- Compose the existing publisher and canonical discovery at the supplier
  completion boundary. The production handoff must perform the fresh discovery;
  the test may supply semantic judgments but must not manually inject the
  expected consumer list or perform the missing discovery for production.
- Preserve evidence before cleanup and the accepted integration separately.
  Make checkout freshness an observed precondition; exercise the restored-old-
  branch case, an unrelated dirty default checkout, and a useful stop when the
  owned workspace cannot safely advance.
- Amend the shared supplier procedure and Story Branch continuation together.
  Remove the early completion/retirement ordering in the linked closure
  publication procedure for this path. Keep the trunk observer available for
  the final consumer publication and complete that final accepted revision.
- Include a publication advance that adds or changes an agreement, guarded
  refusal/rejudgment, incomplete discovery, independent unresolved outcomes,
  historical recovery, and unchanged satisfied replay in this same visit model.
  Reuse existing resolver policy; do not implement condition text matching.
- Keep any new runtime files in the existing installer payload declarations
  and exercise the relevant real payload installation check.

Safe stopping point: Story Branch supplier completion has a coherent visit and
published outcomes. Trunk Mode still uses its prior path until slice 2; this is
an explicitly incomplete story, not a claim of complete cross-mode coverage.
One proof loop owns integration through the consumer result, with edge cases at
the shared operation. No separate preparatory Structure slice is justified.

Accepted proof: `product-backlog.mjs visit-consumers` (`visitCurrentConsumers`,
using `product-backlog-accepted-integration.mjs`) and
`history-preserving-publication.mjs integrate --supplier-identity`
(`supplier-integration.mjs`). Observed by
`tests/support/supplier-integration-visit.test.mjs` (late-consumer journey with
order `[integrate-and-visit, publish-consumers, retire]`; generic integrate
without `visit`; local-changes, ahead, divergent and accepted-not-on-target
stops) and `tests/support/supplier-integration-revisit.test.mjs` (racing writer,
stale refusal, waiting and decision-needed), plus the supplier, closure-story,
payload and install suites, via
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh <paths>`.
Scratch omission of the fast-forward or of the CLI's visit call fails the journey.

Learnings for slice 2: `update-dependency` refuses to author an agreement once
the supplier home is cleaned up on trunk, so a racing-writer fixture must author
before the cleanup lands. Trunk closure and Land can reuse `visit-consumers`
and `integrateSelectedSupplier` directly. A raw Git failure in standalone
`visit-consumers` (e.g. fetch) currently escapes as a stack trace; the integrate
path wraps it as a stopped visit.

### 2. Finish Trunk Mode and selected-supplier landing after the current visit

Type: Behavior
Status: done
Proof: Installed Trunk closure CLI and selected-supplier landing journeys using
the same visit operation, plus existing closure owner/completion/retirement cases.

Behavior: Given accepted supplier publication in Trunk Mode or a selected-
supplier landing, current consumer reconciliation and owned publication finish,
or unresolved work is explicitly retained, before final completion and resource
retirement. Generic landing and unfinished increments keep their existing meaning.

- Reuse slice 1's visit operation and shared guidance. Separate the Trunk
  command's publication/visit handoff from its final completion/retirement so
  `finish` cannot retire first and leave the agent to scan afterwards. Preserve
  the accepted-publication receipt, existing observer ownership and restart
  behavior; a resumed visit must not repeat an accepted integration.
- Route selected-supplier Land through that same current visit after accepted
  publication, without imposing a CI observer on ordinary Land. Preserve the
  no-supplier/no-completed-outcome path and existing completion ownership.
- Observe a consumer arriving with target reconciliation before final closure,
  successful follow-on resolution publication, and a retained unresolved/gap
  case. Assert the workspace remains available through the visit and publication;
  then apply the existing CI/shutdown and ownership gates for retirement.
- Keep the first launch landing capture attached only to its first trunk
  publication; later consumer publications add no second landing context.
  Test resume after accepted publication and before/after consumer publication.
- Complete the representative behavior review across both paths and their
  linked references. Preserve instructions to report unresolved decisions,
  missing evidence and publication stops using existing active context.

Accepted proof: `trunk-closure.mjs finish --supplier-identity` stops at
`step: "visit"` (`trunk-closure-visit.mjs`) until `--visit-settled` names the
last accepted SHA, then completes that SHA and retires; selected-supplier Land
uses `publishSelectedSupplier` or `integrateSelectedSupplier`
(`supplier-integration.mjs`, shared `visitSelectedSupplier`). Observed by
`tests/support/supplier-trunk-closure-visit.test.mjs`,
`supplier-trunk-closure-visit-recovery.test.mjs` and
`supplier-land-visit.test.mjs`, plus the trunk-closure, closure-story,
supplier, Land and payload suites. Scratch omission of each path's visit fails
its journey. Land reconciliation rewrites the preserved outcome commit, so its
accepted rewrite is the supplier evidence revision.

Safe stopping point: Both slices' promises are fulfilled; unresolved consumer
conditions remain honest dispositions rather than failures silently converted
to satisfaction. Existing CI/retirement stops still preserve recoverable work.

## Verification and execution gates

Use the installed Execute Plan workflow for independent post-change refactoring,
owned commits/publication and asynchronous CI repair. This repository's
`skipProcessRetrospective: false` applies at its ordinary execution retrospective;
planning does not start that review or execution.

Focused baseline command: `node --test tests/support/supplier-dependency-completion.test.mjs`.
During implementation use the repository runner with the affected supplier
tests, new completion journey, and affected closure tests, for example
`OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh <affected-test-paths>` after selecting
literal paths from the consumer trace. Include affected callers outside that
suite, the existing dependency/startup boundary if its contract changes, and
the actual payload-install test for added runtime files. The runner selection
must reach the new production handoff; direct resolver tests alone are insufficient.
Use a scratch omission of the new discovery/checkout advance to observe the new
journey fail, restore it, and observe it pass before accepting that proof.

AGENTS.md requires the skill behavior review: walk a representative selected
supplier from invocation/context through accepted integration, current discovery,
per-consumer judgment, published outcomes and retirement. Record the observed
checkout/revisions and consumer result; an agent's summary or static link check
is insufficient. Include a conflicting/unknown consumer condition and verify
that it is cited, its conflicting path stops, and the decision remains human-
owned. Runtime wording must guide the executing project on all three hosts;
make no new host-discovery or release-validation claim from these checks.

No whole-suite local gate follows merely from hosted CI. Broaden checks only
for changed shared consumers or this project's required hooks. Inspect current
host load before a larger closure suite; the cheap preparation suite does not
establish its cost or the host's future headroom. No numeric slice limit is
supplied; each slice is bounded by one cohesive completion path and proof loop.

## Learnings and concern review

The important new learning is the distinction between an accepted integration
receipt and the checkout restored by the publisher. It rules out a prose-only
reminder to scan that same old branch and dictates the current-checkout handoff.
The existing resolver already supplies the required guarded writes and replay.

Slice-plan refinement was not needed: the two slices separate the Story Branch
and Trunk/Land completion entry points while reusing one visit rule; proof and
edge handling stay with their behavior, and no speculative structure is added.
No remaining slice-specific concern was identified in this review. Decisive
current-state premises were observed or the contrary assumption was removed;
new behavior still requires the discriminating proof owned above. No human
decision is required before execution can be selected.

## Story obligations

### G1. Story Branch CI completion order is guidance-owned
Reported: slice 1 — "The CI completion and shutdown order rests on guidance only; it is not executed in any test."
Story clause: "The owning completion path must reach fresh discovery before completing its visit and retiring resources"
Disposition: proved by slice 1: `integrate --supplier-identity` prints the visit with its receipt, so discovery precedes any completion the agent can invoke (`supplier-integration-visit.test.mjs` test 1 order `[integrate-and-visit, publish-consumers, retire]` with real `retireWorktree`); Story Branch Mode has no combined completion command, and `wrap-up-closure-publication.md` orders completion once for the final accepted SHA, read by `ci-completion-lifecycle-guidance.test.mjs`.

### G2. Fixture consumer publication is a plain push
Reported: slice 1 — "Consumer publication was a plain push with a single `pull --rebase` retry, not managed `deliver`."
Story clause: "Use the existing guarded resolution and publication path"
Disposition: proved by slice 1: guarded `resolve-dependency` runs through the real CLI in tests 1–2 (stale write refused in test 2); guidance routes the publication through the unchanged common sequence in `trunk-publication.md#publish-the-candidate`, which keeps its own suites.

### G3. A stopped visit leaves the integrate exit code at 0
Reported: slice 1 — "The integrate CLI still exits 0 when the integration is accepted but the visit stopped; the stop is reported in `visit.status`."
Story clause: "explicitly retain unresolved work, evidence, discovery gaps, and next actions in the existing active context"
Disposition: proved by slice 1: the accepted receipt is genuinely accepted, and the stop object with `reason`, `checkout.changes` and `recovery` is the same one `visit-consumers` returns (test 3 stop cases); `supplier-dependencies.md#visit-current-consumers-after-integration` directs keeping resources and reporting the unfinished visit.

### G4. A checkout ahead of the target is visited as it is
Reported: slice 1 — "The `ahead` relation is accepted, meaning discovery also reads unpublished local commits"
Story clause: "Establish that the checkout used for discovery and consumer writes contains the accepted supplier integration and the fetched target's current content."
Disposition: proved by slice 1: `ahead` is accepted only when the fetched target is an ancestor of HEAD, so the checkout contains both; test 3 asserts `relation: "ahead"` and the divergent stop.

### G5. Trunk visit stop after the worktree is gone
Reported: slice 2 — "`finish --supplier-identity` after the worktree is gone and without `--visit-settled` stops with a \"worktree absent\" recovery. This is untested."
Story clause: "Completion reports and retains the affected work; it cannot claim complete coverage from the earlier successful scan."
Disposition: proved by slice 2: `tests/support/supplier-trunk-closure-visit-recovery.test.mjs` "finish for a selected supplier whose worktree is gone before the visit settled…" observes `step: "visit"`, the absent-worktree reason and unfinished-visit recovery, no push, no completion and no retirement.

### G6. Settled consumer SHA whose observer ended
Reported: slice 2 — "A settled SHA whose only coverage is an *ended* observer is not specially handled; the existing `step: \"observation\"` path applies."
Story clause: "Finish the current-consumer visit and publish its owned resolutions before successful wrap-up/resource retirement"
Disposition: proved by slice 2: `supplier-trunk-closure-visit-recovery.test.mjs` "a settled consumer publication whose observer ended stops at observation until deliver establishes this coordinator's own…" observes the observation stop with resources kept, then the documented `deliver` recovery and a rerun completing the consumer SHA before retirement.

### G7. Land's published-prefix supplier form
Reported: slice 2 — "The `integrateSelectedSupplier` API with Land's `onFetchedTarget` callback is not separately tested (the CLI path is covered by slice 1)."
Story clause: "keep supplier-resolution behavior coherent with Trunk Mode and selected-supplier landing"
Disposition: proved by slice 2: `integrateSelectedSupplier` passes its whole request, including `onFetchedTarget`, unchanged to `publishHistoryPreservingCandidate` and then calls the same `visitSelectedSupplier`; slice 1's `supplier-integration-visit.test.mjs` journey covers that function, and the unchanged callback keeps its existing Land suites (`queued-closure-check`, `dough-land.test.mjs`), rerun in slice 2.
