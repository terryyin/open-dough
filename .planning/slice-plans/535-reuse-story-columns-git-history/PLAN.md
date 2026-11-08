# Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
**Source:** [Refined story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#reuse-immutable-git-histories)
**Source review:** [source-review.md](source-review.md)

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
- Execution reassessment (slice 1, 2026-11-08): with the owner building the
  prefix on the first worker request, both cold workers asked within 3 ms,
  waited the whole single-flight build (0.55–0.99 s) and then paid copy and
  suffix, so the selection was time-neutral (after2 9.81–10.25 s against
  before3 9.84–10.87 s). The plan's foreseen cold serialization. Global setup
  now requests the prefix as soon as the owner starts, so its 0.53–0.60 s
  build overlaps the app build and the workers' start and every worker finds
  it ready. That keeps the owner's lifetime, single-flight and cleanup and the
  materializer's match-and-copy; only when the build begins changed. A
  frontend-only selection that never asks for the history showed no
  measurable wall cost (2.13–2.35 s against 2.05–2.26 s). The lazy variant is
  retained as evidence only.
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
  `npm test -- tests/support/repository-fixture.test.mjs tests/support/repository-snapshot.test.mjs tests/support/repository-snapshot-isolation.test.mjs`,
  `npm run typecheck:dashboard`,
  `npm run test:dashboard -- dashboard/backend-tests/runtime/story-columns-prefix.spec.ts`
  and
  `npm run test:dashboard -- dashboard/backend-tests/launches/start-origin-isolation.spec.ts dashboard/backend-tests/launches/start-origin-demand.spec.ts dashboard/backend-tests/runtime/dashboard-artifact-demand.spec.ts`
  to cover the shared harness and run owner; all passed at the delivered
  state, as did the consumer trace over `materializeRepository`,
  `storyColumnsRepository` and `publishStoryColumnsJourney` consumers. Run the dashboard suite before
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

## Measurement record

Execution checkout, macOS, Node 24.21.0, Apple Git, Playwright 1.63.0 with
the default two workers; external machine load throughout, recorded as the
one-minute load average before each run. Every run of the selection
`agent-launch-attention.spec.ts` + `agent-launch-recent-sessions.spec.ts`
(3 cases) passed all 3 cases. Wall time is the shell's; the quiet reporter's
runner time is 0.35–0.45 s less.

| Label | Revision and preparation | Wall s per run | Load | Worker Git span s |
| --- | --- | --- | --- | --- |
| before | b6b829317, per-worker build | 14.79, 12.06, 10.53 | 12.9 | 1.14, 1.27, 1.06 |
| after | lazy owner build on first request | 12.21, 14.36, 11.80 | 12.9–15.6 | 1.23, 1.74, 1.01 |
| before2 | b6b829317 clean worktree | 15.25, 11.17, 10.56 | 10.6–11.1 | 1.07, 1.03, 1.03 |
| before3 | b6b829317 clean worktree | 10.87, 9.84, 10.20 | 8.7–9.0 | 0.98, 0.92, 1.04 |
| after2 | lazy owner build | 9.81, 9.95, 10.25 | 8.8–9.6 | 0.97, 0.95, 1.02 |
| before4 | b6b829317 clean worktree | 10.22, 10.06, 10.96 | 6.7–7.1 | 0.97, 0.96, 0.95 |
| eager | owner build at run start | 9.45, 9.20, 9.52 | 6.7–7.2 | 0.41, 0.46, 0.42 |
| lazy (interleaved) | same checkout, lazy | 10.03, 9.75, 10.21 | 7.0–7.8 | |
| eager (interleaved) | same checkout, eager | 9.14, 9.38, 9.42 | 7.6–8.0 | |

- Cold prefix build (artifact trace start→complete): 0.53–0.60 s lazy, 0.53–0.56 s
  eager, complete at 0.55 s while the first worker requests at 1.47–1.51 s.
- Worker wait for the prefix: lazy, both workers the full build (0.60/0.60,
  0.99/0.97, 0.55/0.55 s); eager, none.
- Warm copy plus suffix commit in a fresh process: 158–188 ms; cold full build
  597–732 ms; owner prepare 449–487 ms (scratch, load ≈7).
- Worker Git span (server bundle complete → that worker's dashboard-server
  request) brackets the fixture construction: 0.92–1.07 s per-worker build,
  0.41–0.46 s with the eager prefix.
- Frontend-only selection `agent-launch-creation-gates.spec.ts`, interleaved:
  lazy 2.26, 2.05, 2.20 s; eager 2.13, 2.28, 2.35 s.
- Comparison context from `f78f3e0e6`: the 22 StartOrigin cases took 45–46 s
  and the 16 readiness and admission cases 20 s with two workers.

Reading: the eager prefix was faster in all six paired runs, by about 0.7 s
(7%) on this 9–10 s selection, matching the 0.5–0.6 s removed from each
worker's critical path. The lazy prefix is neutral here because the third
case reuses a worker whose journey is memoized, so no fresh worker ever
meets a warm prefix. CI shards with more workers, and later fresh local
workers, gain the copy-only path either way.

## Slices

### 1. Dashboard workers reuse the same Git prefix with private repositories
Type: Behavior
Status: done
Proof: Seed examples 1–3 through the actual materializer and run artifact request. Observe one build for overlapping workers, exact named history under controlled Git dates, different completion facts, private refs/config/index/objects after a peer writes or cleans up, and a usable copy after donor removal. Exercise the ordinary local build and a failed registered build followed by a fresh run. The named dashboard selection keeps all verdicts and shows a repeatable elapsed-time improvement.

Two workers ask for the same declared story-columns prefix with different
completion facts → the run prepares that prefix once and the builder
materializes two independently mutable histories → each journey reads its
own completion and finishes sooner on the affected selection. Add focused
proof only where the existing repository and dashboard checks cannot
distinguish duplicate builds, leaked state or an incomplete snapshot.
Keep the slice together through the timing comparison, since the owner,
copy and suffix costs jointly determine whether to retain it.

## Execution complete

Product advice: the run-start prefix holds for the story-columns family at
about 7% of the two-worker attention and recent-sessions selection; keep
cross-run reuse and other families deferred until measured. The launch
journey that `pageTest.ts` supplies to about 108 specs is identical in every
worker and is the natural next family to measure with the same owner
mechanism. Local feedback on this story was dominated by the whole-suite gate,
43 min of runner time plus about 50 min of admission wait behind another
suite, against a 0.7 s gain per selection, and its three failures were
load-induced timeouts that passed in isolation. Observe the 12-shard hosted
times for `08d208fd0` against its predecessor before extending the mechanism.

## Learnings

- Full dashboard suite before publication (2026-11-08, this checkout, two
  workers, runner 2604 s, load 5–11 with another suite admitted earlier):
  2241 of 2244 cases passed. The three failures were 30 s timeouts in
  `production-watcher-updates.spec.ts` (activation of a real build) and
  `production-watcher-failures.spec.ts` (watcher exit), and one Claude
  attachment that had not exited when `agent-launch-ad-hoc.spec.ts` closed
  its server, which the run teardown then ended. None of those specs reaches
  the changed modules beyond the unchanged ordinary materializer route, and
  the artifact trace shows the prefix prepared once per run. Each failed spec
  then passed in isolation at load 7–10: watcher-updates 3 of 3, watcher-
  failures 2 of 2, ad-hoc 2 of 2. Cause attributed to machine load, as
  [DD-445](../../../docs/maintainer/project-test-findings.md#dd-445) records
  for the same watcher cases; the 12-shard hosted run is the verdict for
  the published revision and any failure there is this execution's repair.

- `git status` refreshes the index it reads, so hash comparisons of a peer
  copy are taken after any status read of it.
- The owner's snapshot build must not consult registered prefixes, or the
  owner would request its own in-flight key.
- In this selection the third test runs in a reused worker, so a two-worker
  run structurally cannot reward a lazy single-flight build.

## Concern evidence

Slice-plan refinement was not needed. One behavior owns the only new
preparation route, its isolation and the elapsed-time acceptance test.
Cold serialization is a measured risk with a stop condition in the proof,
and no separate implementation premise remains unresolved.
