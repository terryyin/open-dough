# Show CI time without runner waits for custom adapters

**Identity:** SEED-266#show-ci-time-without-runner-waits-for-adapters

**Source:** [Show CI time without runner waits for custom adapters](../../seeds/SEED-266-ci-job-timing-from-adapters.md#show-ci-time-without-runner-waits-for-adapters)

## Goal and boundaries

Developers comparing CI builds in Intent see CI time without runner waits for
builds read through a custom CI adapter, from an optional per-attempt job
graph the adapter reports through a new `jobs` operation. The seed's scope and
key examples are the source; this plan adds no promise.

Exclusions, from the seed: no metric in the **CI status** tab, none for
running endpoints, no change to which comparison answers are remembered (a
timing reason stays part of a final answer, as for GitHub Actions), and
adapters need not implement `jobs`. GitHub Actions keeps its workflow-file
and job-API calculation.

## Current decisions

- **A separate `jobs` operation, documented beside `proof`.** The observer
  polls `discover` often; a job graph can cost a provider extra queries per
  attempt, and only the comparison needs it, for the endpoint attempts it
  selected. So the graph is asked per selected attempt like `proof`, with the
  same request shape, run limits (20 s, 64 KiB stdout) and failure wording.
  The contract goes in a new section of
  `src/skills/dough-execute-plan/manuals/custom-ci-proof.md` (the manual for
  dashboard-only adapter reads), linked from `custom-ci.md`. No new payload
  file, so `install.sh`'s `managed_files` is unchanged.
- **One longest-chain rule for both providers.** The chain calculation in
  `dashboard/server/ciTimeWithoutRunnerWaits.ts` is separated from the GitHub
  workflow matching: GitHub maps workflow jobs and reported rows to
  `{ id, durationMs, needs }` nodes (keeping its matrix maximum and
  skipped-after-failure rules), and the adapter graph is validated into the
  same nodes. Both feed one function that returns the longest chain or the
  unresolved-dependency reason. Validation reasons for adapter graphs live
  beside that function.
- **The adapter runner gains `readCommandJobs`** in
  `src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs`, mirroring
  `readCommandProof`: it returns `{ jobs }` (an array, unchecked beyond
  being an array) or `{ unavailable }` (bounded like proof's reason), and
  throws otherwise. The dashboard validates the graph.
- **`adapterRevisionLookup.timeWithoutRunnerWaitsOf`** asks `jobs` on the
  build's `runBranch` with `runId` and `attemptId` as strings and the full
  revision. An `adapterAttempt.ambiguous` build (slice 1) asks nothing and
  gets a reason naming the shared `attemptId`, in the words Intent uses for
  an ambiguous proof read. A failed read reuses `ciAdapterProof.ts`'s
  `failureOf` wording (move it to a shared module rather than copying it).
  Reasons start "The CI adapter …" so the existing endpoint cell wording
  ("Unavailable. <reason>") reads naturally.

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| Seed example 1: one 90 s job beside longer wall time | Slice 1 | `dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts`: an endpoint whose fixture `jobs` answer is one 90 000 ms job shows `1 min 30 s` (the cell's existing words) in `.intent-ci-comparison-without-waits` while its wall time cell shows the longer `startedAt`→`completedAt` span. |
| Seed example 2: 30 s then parallel 40 s / 60 s gives 90 s, from the selected attempt | Slice 1 | Same spec: another endpoint answers that three-job graph and shows 90 s. One endpoint revision gets a second, older attempt with its own `attemptId`; the fixture answers `jobs` by `attemptId`, and the recorded `jobs` requests name only the selected attempts, each with its listing branch. The fast-forward case's existing ambiguous Branch attempt (two attempts sharing `attemptId` `2`) shows the ambiguity reason and gets no `jobs` request. A backend spec in `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts` checks the graph calculation directly. |
| Seed example 3: before → after words and cue | Slice 1 | Same spec: Baseline 90 s and Landed 75 s give the overall summary's before → after words with the 15 s, 17% decrease and the faster duration cue attribute, as the GitHub comparison specs assert them. |
| GitHub Actions calculation unchanged | Slice 1 | The existing backend spec `ci-time-without-runner-waits.spec.ts` and the GitHub comparison spec `intent-ci-comparison.spec.ts` pass unchanged. |
| Seed example 4 and the unavailable reasons | Slice 2 | Backend spec cases for each invalid graph (no jobs, duplicate or empty id, missing, negative or non-finite duration, unknown `needs`, cycle) give their reasons. A `ci-command-adapter` node test covers `readCommandJobs`'s accepted and refused answers. The adapter comparison spec covers an adapter exiting 2 with `unsupported CI adapter operation` and an `unavailable` answer: each endpoint shows "Unavailable." with the reason while its wall time and proof stay shown. |
| Contract documented | Slices 1–2 | `custom-ci-proof.md` documents the `jobs` request, both answers, the job fields, skipped jobs as 0 and matrix instances as jobs (slice 1), and the unavailable cases (slice 2). `docs/dashboard-development-intent-ci-comparison.md` says adapter builds use the reported graph. |

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slices 1–2: the timing hook can name the selected attempt and listing branch | 2026-11-08 at `1dc56cc93`: scratch edit (reverted) made `adapterRevisionLookup.timeWithoutRunnerWaitsOf` return `JSON.stringify([build.runBranch, build.adapterAttempt, revision])` as its reason; ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-ci-comparison-adapter.spec.ts --reporter=list` | Both cases failed at the Baseline cell showing `["main",{"runId":"before|opaque","attemptId":"a-base+#"},"04f3edb"]`: the hook receives the listing branch and the adapter attempt's identity. The ambiguity flag rides on the same `adapterAttempt` object (`baseCiAdapterAttempts.ts` `asAdapterAttempts`). |
| Slice 1 proof route and its discrimination | Same run | The spec runs locally in this worktree (after `node scripts/setup-native.mjs npm` and `browser`) and its `.intent-ci-comparison-without-waits` assertion fails when the reason changes. It currently asserts "Unavailable. The CI adapter does not report a job graph." — the only consumer of that literal (`git grep`). |
| Slices 1–2: fixture adapter answers new operations | Read `dashboard/tests/intentCiAdapterProofProject.ts` | The fixture answers any non-`proof` operation with `{ attempts: … }`, so other adapter specs (`intent-ci-comparison-adapter-gaps`, `-taken`, `intent-ci-proof-adapter*`, `intent-ci-status-wall-time`) would get an invalid `jobs` answer. None asserts the without-waits cell, so their verdicts do not depend on it; slice 1 still gives the fixture a `jobs` answer (default `unavailable`) and a `jobsRequests()` reader so no spec relies on an accidental answer. |

## Local gates

Follow the [test automation rules](../../../AGENTS.md#test-automation) and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Arrange data through MakeMe where a domain builder exists, never sleep, never
use `test.slow()`, and keep default timeouts. For longer runs on awake macOS
with AC power, use `caffeinate -s -i` with Homebrew Bash first on `PATH`; on
battery follow the lid-open procedure.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)

Each slice runs, with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset:

- `bash scripts/test.sh` on the `ci-command-adapter*.test.mjs` files;
- `npx playwright test --config dashboard/playwright.config.ts` on
  `dashboard/backend-tests/intent/ci-time-without-runner-waits.spec.ts` and
  every `dashboard/tests/intent/intent-ci-comparison*.spec.ts`,
  `intent-ci-proof-adapter*.spec.ts` and `intent-ci-status-wall-time.spec.ts`
  (the comparison read and the adapter fixture they share change);
- `npm run typecheck:dashboard`.

Hosted CI runs the full suites after publication; no full local suite is
required because the change stays inside the comparison read, the adapter
runner and its fixture.

## Slices

### 1. An adapter's job graph gives the endpoint's CI time without runner waits

Type: Behavior

Status: planned

Proof: seed examples 1–3 and the unchanged GitHub calculation, as mapped above.

Behavior: a done adapter story whose endpoint attempts answer `jobs` with a
valid graph → the developer opens its CI comparison → each endpoint shows the
graph's longest chain as CI time without runner waits beside its unchanged
wall time, and the overall summary and cues compare those times. An
ambiguous attempt asks no adapter and says why, since the selected attempt
cannot be named. Includes
the shared longest-chain rule, `readCommandJobs`, the lookup wiring, the
fixture's `jobs` answers and request reader, and the contract section with
the Intent doc sentence.

### 2. Unavailable job graphs explain themselves without hiding the build

Type: Behavior

Status: planned

Proof: seed example 4 and the unavailable reasons, as mapped above.

Behavior: an adapter that lacks `jobs`, fails, answers `unavailable`, or
answers a graph that cannot support the calculation → the comparison shows
"Unavailable." with the specific reason for that endpoint and keeps wall time
and proof. Includes the graph validation, shared failure wording, and the
contract's unavailable cases.

## Plan concerns

Slice-plan refinement was not needed: two Behavior slices with independent
proof loops (valid graph versus each unavailable path), each with its own
spec cases, and slice 1's interim behavior is ordinary (any invalid graph
falls through to the single unresolved-dependency or generic reason until
slice 2 names it). No slice-specific concern remains.

Accepted interim behavior: until slice 2, an adapter graph that slice 2
would reject may show a less specific reason. Slice 2 replaces it.
