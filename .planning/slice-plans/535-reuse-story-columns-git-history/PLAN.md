# Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
**Source:** [Refined story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories)

## Goal and boundaries

Reduce feedback time for the attention and other dashboard journeys that
build the same story-columns prefix in separate workers. Preserve their
real Git and dashboard proof, the declared completion facts, and the
independence of every mutable repository the harness returns. The seed
owns the three examples. Defer cross-run persistence and sharing for
additional repository families.

## Current decisions

- Extend the [shared materializer](../../../tests/support/repository-fixture.mjs)
  and reuse the dashboard's
  [run artifact owner](../../../dashboard/tests/support/runArtifacts.ts)
  for lifecycle and single-flight preparation. Register the one observed
  prefix. Keep the declaration in the
  [story-columns fixture](../../../dashboard/tests/launchJourney.ts), with
  the same MakeMe revision facts and each worker's own completion value.
  The owner publishes only a completed snapshot. The materializer matches
  the prefix and the relevant layout and Git facts, owns the copy and
  appends the suffix in that copy. Apply the current origin path repair and
  ordinary local build path where appropriate. Preserve the current
  unpublished-workspace boundary and the declared identities and dates.
- A snapshot is a source of immutable Git data. Materialized checkouts and
  origins use their own objects and mutable state, including a private
  origin URL. Keep ownership inside one run and use the existing owner
  shutdown and cleanup. Git's alternate object lookup depends on the
  donor's lifetime. Writable hardlinks make a peer's object files mutable
  through another fixture's path.
- Keep test facts visible through MakeMe and retain the existing test
  boundaries under [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
  Evaluate the net gain and upkeep under
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Options and evidence

- The current per-process template is the simpler baseline. It shares
  identical requests and their in-flight build in one worker. The installed
  [StartOrigin](../../../dashboard/tests/support/startOriginPreparation.ts)
  already uses run-owned packed origins and builds later revisions in its
  own copies. Reuse that lifecycle and its isolation precedent. At
  `f78f3e0e6`, the 22 StartOrigin cases took 45–46 s, the three Start
  refusal cases took 4 s and the 16 readiness and admission cases took 20 s,
  with two workers under load 3.9–5.8. Those are historical comparisons.
- One final push on the existing path was a simpler experimental alternative.
  In three paired scratch runs it reduced cold setup by 162–188 ms per worker
  and preserved named commits, refs, ancestry and trees under fixed dates.
  It shortened the remote-tracking reflog and still built the common prefix
  in each worker. Keep it as a comparison, with the existing construction
  path as the production baseline for this slice.
- A run-owned prefix borrows immutable image layers. The common prefix is
  the base and the suffix belongs to a private materialization. Use that
  mechanism here because equal whole-description keys can miss the shared
  work when completion timestamps differ. A new general store and object
  packing have their own setup and maintenance costs. The measured
  prefix prototype makes the narrower experiment possible with the
  existing owner and copy discipline.

## Decisive premises

| Premise | Consuming operation and observation | Result |
| --- | --- | --- |
| The attention shape has a shareable prefix even when the completion differs. | At `e84a5ff74`, macOS, Node 24.21 and Apple Git 2.50.1, two fresh Node workers used the actual `storyColumnsRepository` with different completion times and a fixed Git author and committer time for exact comparison. The existing `startRunArtifacts` and `requestRunArtifact` prepared and supplied the queued, preparing, and taken prefix once. Each worker copied it, repointed its origin, then used `commitDeclaredRevision` and pushed its suffix. | Each worker's named SHAs, refs, parent graph, trees, and clean checkout matched its full-build control. The final SHAs differed between workers. This settles the Git and owner path. The prototype did not exercise the Playwright setup hook or claim end-to-end improvement. |
| Copying must leave the fixture readable after its source goes away. | In an isolated MakeMe origin at `e84a5ff74`, rename the donor after `git clone --shared` and after `git clone --reference … --dissociate`, then run `git cat-file -e HEAD^{commit}` in each copy. | The shared clone exited 128 and the independent copy read the commit. Keep the existing independent copy discipline. |
| The ordinary dashboard route reaches the story-columns consumers with two local workers. | At `e84a5ff74`, run the three-case selection below with the native setup check and default workers. Run `npm test -- tests/support/repository-fixture.test.mjs` on the same checkout. | Dashboard proof recorded all three passing, 13.62 s runner time and 14.04 s shell wall. The repository fixture check passed. This is a baseline under shared machine load, not a benchmark for the change. |

The prefix prototype took 2.07 s wall for separate builds, 1.56 s for the
cold shared route and 0.53 s for two fresh workers using the warm prefix,
including verification. A separate three-pair probe of the same Git shape
measured 1.46/1.20, 1.34/1.49 and 1.62/1.63 s unshared/shared. A cold shared
build can serialize workers that otherwise build independently. The
end-to-end gain is the slice's acceptance criterion and remains to be proven.

## Proof and delivery gates

- Re-establish a comparable baseline in the execution checkout, then use
  the same ordinary selection before and after:
  `npm run test:dashboard -- dashboard/tests/sessions/agent-launch-attention.spec.ts dashboard/tests/sessions/agent-launch-recent-sessions.spec.ts`.
  Keep Node, Git, browser, environment and worker settings comparable.
  Record the three verdicts, elapsed time and construction phase. Use the
  two-worker run for feedback time. Observe cold run preparation, fresh
  worker requests to a prepared prefix, and same-worker reuse separately,
  using observable requests and results. Repeat the paired measurements
  enough to distinguish a gain from machine-load noise. Use the existing
  artifact trace to account for the one build and wait time. A faster
  warm copy or reduced Git work alone does not accept the slice. If the
  ordinary selection shows no worthwhile gain, preserve the baseline and
  return the observed cost to the coordinator.
- Follow the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for any changed common behavior. Run
  `npm test -- tests/support/repository-fixture.test.mjs`,
  `npm run typecheck:dashboard` and
  `npm run test:dashboard -- dashboard/backend-tests/launches/start-origin-isolation.spec.ts`
  to cover the shared harness and run owner. Run the dashboard suite before
  landing because its global setup owns this artifact for every selection.
  Keep native evidence fixtures on their existing route.
- Local gate: use the [native prerequisites](../../../tests/native-setup.md),
  Homebrew Bash 5 first on macOS, and the
  [test automation](../../../AGENTS.md#test-automation) and
  [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written in every delegation and repair handoff. Start fully awake
  and guard long macOS runs on AC power with `caffeinate -s -i`. On battery
  follow the lid-open, `caffeinate -i`, and sleep-log guidance in
  [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
  Keep the normal timeout and unchanged dashboard assertions. Hosted CI and
  publication follow the selected execution mode.

## Slices

### 1. Dashboard workers reuse the same Git prefix with private repositories
Type: Behavior
Status: planned
Proof: Seed examples 1–3 through the actual materializer and run artifact request. Observe one build for overlapping workers, exact named history under controlled Git dates, different completion facts, private refs/config/index/objects after a peer writes or cleans up, and a usable copy after donor removal. Exercise the ordinary local build and a failed registered build followed by a fresh run. The named dashboard selection keeps all verdicts and shows a repeatable elapsed-time improvement.

Two workers ask for the same declared story-columns prefix with different
completion facts → the run prepares that prefix once and the builder
materializes two independently mutable histories → each journey reads its
own completion and finishes sooner on the affected selection. Add focused
proof only where the existing repository and dashboard checks cannot
distinguish duplicate builds, leaked state or an incomplete snapshot.
Keep the slice together through the timing comparison, since the owner,
copy and suffix costs jointly determine whether to retain it.

## Concern evidence

Slice-plan refinement was not needed. One behavior owns the only new
preparation route, its isolation and the elapsed-time acceptance test.
Cold serialization is a measured risk with a stop condition in the proof,
and no separate implementation premise remains unresolved.
