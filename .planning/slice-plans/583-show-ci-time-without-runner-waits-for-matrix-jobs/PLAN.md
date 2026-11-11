# Show CI time without runner waits for matrix jobs

**Identity:** SEED-306#show-ci-time-without-runner-waits-for-matrix-jobs
**Source:** [Refined story](../../seeds/SEED-306-ci-time-without-runner-waits-for-matrix-jobs.md#show-ci-time-without-runner-waits-for-matrix-jobs)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/show-ci-time-without-runner-waits-for-matrix-job`,
branch `cursor/show-ci-time-without-runner-waits-for-matrix-job`, starting
revision `61c042f00c77deb427fec26af5bf7b21d7067f1c`. This plan authorizes no
execution.

## Goal and scope

A developer comparing story builds in Project Intent can read CI time without
runner waits when GitHub Actions jobs use an explicit static display name and a
matrix. Match reported attempt names that GitHub derives from those jobs —
including a short parenthesized matrix suffix and a long truncated label that
still uniquely identifies the workflow job — and feed those durations into the
existing longest-dependency-chain estimate from retained workflow YAML and
attempt rows.

Out of scope: wall-time measurement or display changes; changing the chain rule
beyond job matching; custom CI adapters (SEED-266); comparison UI redesign;
matching when a truncated or ambiguous label cannot identify exactly one
workflow job; requiring client workflows to embed matrix values in `name:`
expressions.

## Architecture and reuse

PFE: the responsibility is “bind each GitHub Actions attempt job name to its
workflow job definition so CI time without runner waits can count matrix
instances under an explicit static display name.”

Existing owners:

- Job definition reader and name matcher:
  [`dashboard/server/ciWorkflowJobs.ts`](../../../dashboard/server/ciWorkflowJobs.ts)
  (`readWorkflowJobs`, `workflowJobNameMatcher`)
- Chain estimate:
  [`dashboard/server/ciTimeWithoutRunnerWaits.ts`](../../../dashboard/server/ciTimeWithoutRunnerWaits.ts)
  (`timeWithoutRunnerWaits` already keeps the longest instance per definition)

Reuse and change the matcher. Unnamed jobs already accept `id` or `id (…)`
matrix forms. Expression-bearing `name:` values already pattern-match. A static
`name:` currently exact-matches only, which rejects GitHub's
`Display name (matrix…)` and truncated `Display name (…` labels. Do not add a
second timing path or a parallel job graph.

Selected solution: extend the static-name arm of `workflowJobNameMatcher` so a
display name also accepts its matrix-instance forms the way an unnamed job
accepts matrix forms of its id, including truncated labels that still uniquely
identify that definition among the workflow's jobs. Keep zero- and multi-match
failures as unavailable estimates. Preserve expression-aware and unnamed
matching.

No consequential product architecture choice. No new North Star topic.
Accepted ADRs are not implicated beyond ordinary dashboard CI-timing ownership.

Common rule: one matcher decides whether a reported attempt name is an instance
of a workflow job's declared label; matrix suffixes and unique truncations of a
static display name are instances of that label, not separate definitions.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Static-name matrix instance such as `Backend Unit tests (1)` enters the chain | 1: focused `timeWithoutRunnerWaits` check — matched duration contributes; estimate is available |
| Uniquely identifying truncated long matrix label enters the chain; parallel shards keep longest-instance semantics | 1: same focused boundary — truncated label matches; with 40 s / 60 s shards and a 30 s dependent proof job, estimate is 90 s |
| Zero or ambiguous matches stay unavailable with explanation; wall time remains a separate display concern | 1: existing and extended focused rejection cases at the same function |
| Expression-named and unnamed matrix matching stay intact | 1: retain existing fixture / focused coverage (`comparisonWorkflow` expression and unnamed matrix paths already green) |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Current static-name matcher rejects `Backend Unit tests (1)` and truncated `End-to-End tests with Database (…` labels against a Doughnut-like workflow with those bare display names | Slice 1 matcher / `timeWithoutRunnerWaits` | Ran `timeWithoutRunnerWaits` in this workspace with those reported names | Settled: reason `Job “Backend Unit tests (1)” does not match a workflow job definition.` |
| Expression-named matrix jobs already match and pick the longest instance | Slice 1 preserve path | Same runner: workflow `Frontend Unit Tests (${{ matrix.shard }}/2)` with instances 40 s and 60 s plus 30 s proof → `{ milliseconds: 90000 }` | Settled: expression path already yields 90 s |
| Unnamed / expression comparison fixture matrix names already match and produce an estimate | Slice 1 preserve path | `timeWithoutRunnerWaits(comparisonWorkflow, observedBaselineJobs, false)` → `{ milliseconds: 295000 }`; sample names bind to `lint` / `test` / `dashboard` | Settled: existing fixture path remains the regression anchor |
| Focused proof home is `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts`; it already asserts exact-one-match rejection wording | Slice 1 proof placement | Read that file's “must match exactly one workflow definition” cases | Settled: extend that focused file; no browser journey required for the matching promise |
| Expected edit files are under the 250-line file-size check | Slice 1 size / no Structure | `wc -l`: `ciWorkflowJobs.ts` 178, `ciTimeWithoutRunnerWaits.ts` 168 | Settled: no cohesive reorganization Structure required for size |

## Ordered slices

### 1. Match static-name matrix attempt labels for CI time without runner waits
Type: Behavior  
Status: planned  
Proof: Focused Node checks in `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts` (and matcher coverage colocated there or in the same boundary): (a) `Backend Unit tests (1)` against a static-named matrix job yields a numeric estimate that includes that duration; (b) a uniquely identifying truncated long E2E matrix label with 40 s and 60 s parallel shards plus a 30 s dependent proof job yields 90 s; (c) zero- and multi-match cases still return the existing unavailable reasons; (d) existing expression/unnamed fixture timing cases stay green. On macOS start long runs fully awake; on AC use `caffeinate -s -i`.

Behavior: Retained workflow with static display-name matrix jobs and attempt rows whose GitHub-derived names carry matrix suffixes or unique truncation → Intent computes CI time without runner waits → those instances bind to their definitions, the longest instance per definition feeds the dependency chain, and ambiguous or empty matches remain explained unavailable estimates.

## Current decisions

- Change `workflowJobNameMatcher`'s static-name arm; leave chain aggregation in
  `timeWithoutRunnerWaits` as the longest instance per definition.
- Treat truncated labels as matches only when they still resolve to exactly one
  workflow job under the same uniqueness rule already enforced after matching.
- Do not require `strategy:` to be present in the YAML reader for this fix:
  GitHub's reported name shape is sufficient when it uniquely identifies the
  static display name's matrix instance.

## Learnings

None yet.

## Plan concern assessment

Slice-plan refinement was not needed: one Behavior owns one proof loop at the
existing job-name matching boundary, with no independent second outcome, no
preparatory Structure, and no unresolved sizing concern. No remaining
slice-specific concerns.

## Execution notes

- Local gates: focused `ci-time-without-runner-waits` specs; dashboard
  typecheck and changed-file lint when those files change. Follow the
  [maintained macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
  begin fully awake; on AC run long checks under `caffeinate -s -i`; on battery,
  plug in or use the documented lid-open `caffeinate -i` procedure and inspect
  sleep logs.
- No numeric slice target or hard limit is supplied; judge boundedness by one
  Behavior, one proof loop, and the settled premises above.
- Follow [AGENTS.md: failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  as written. Use shared MakeMe for domain arrangements under
  [test data architecture](../../../tests/README.md#test-data-architecture).
  No wall-clock sleeps, `test.slow()`, or suite-level timeout overrides.
- After edits, use the installed consumer trace with `--base HEAD` for matcher
  and timing-call sites; disposition each consumer as run, reused evidence, or
  excluded with a boundary reason.
- Run post-change refactoring, then the appropriate proof and commit/delivery
  gates. Expected implementation files inspected above are 168–178 lines.
