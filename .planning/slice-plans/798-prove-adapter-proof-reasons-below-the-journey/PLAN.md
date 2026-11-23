# Prove each adapter proof reason below the E2E journey

**Identity:** SEED-413#hold-adapter-proof-reasons-in-default-timeout
**Source:** [Prove each adapter proof reason below the E2E journey](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#hold-adapter-proof-reasons-in-default-timeout)

## Goal and scope

Use one whole-dashboard workflow for reading and recovering missing adapter
proof. Reuse the first case in `e2e/intent/intent-ci-proof-adapter.spec.ts` and
retire the three journeys in `intent-ci-proof-adapter-reasons.spec.ts` as their
unit proof is established. The selected E2E collection goes from seven cases
across both files to four in the retained file. Product behavior and wording
stay the same. The other three journeys in the retained file are outside this
correction.

## Current decisions

- Use the existing command, server, and UI boundaries. Follow [Make production
  code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use direct production handlers and the established typed page mount, with
  retrying observations after reader actions. Add no test-support wrappers.
  Keep `node:test` for the existing Distribution command fixture and switch
  the two scoped Dashboard proof-memory specs to direct Vitest imports as
  each is edited.
- Apply [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for fast feedback, [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for truthful evidence distinct from the verdict, and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  for the preserved proof and comparable E2E selection. The high-level journey
  observes the reader's result across the built dashboard, authenticated reads,
  and the configured adapter. The unit cases carry the individual failure,
  selection, and presentation rules.
- Reuse `readIntentCiProof` / `readCiAdapterProof` and `adapterUnavailableLine`
  in the existing Distribution subprocess-backed proof test, and
  `ciAdapterProofReader` with the existing configured adapter fixture for the
  typed cases. `judgeCommandAdapter` owns the selection rule. Reuse
  `mountIntentCiPage`, `inertCiReads`, `intentCiStatus`, and `intentCiProof` for
  rendered UI. Reuse `openAdapterProof` and the existing Intent status and proof
  page objects in E2E. Keep the Check again locator with the status page owner.
- Keep the source-level MakeMe selection on the named tests and the page-object
  selection on E2E. Recheck intended paths with the installed selector before
  editing. Preserve all unrelated coverage. The scenario answers what the
  adapter can supply and uses the real selection, rendering, or reader that
  owns each rule.

## Outside-in proof

| Slice | Trigger and observable result | Proof owner |
| --- | --- | --- |
| 1 | A passing attempt's adapter says proof is pending. The reader sees the reason and the verdict with no counts. Check again shows proof counts for the same attempt and verdict once the summary exists. | First scenario in `e2e/intent/intent-ci-proof-adapter.spec.ts`, real Dashboard and configured synthetic CI adapter. Use a numeric discovery ID and its text proof ID to preserve the existing route observation in the same journey. |
| 1 | The adapter exits nonzero or returns the wrong envelope. The Dashboard explains the specific command failure. | `Distribution/tests/support/dashboard-ci-adapter-proof.test.mjs`, through `readIntentCiProof` with a typed adapter subject and local project lookup. The real configured subprocess supplies exit/stderr or a literal envelope. This path also preserves adapter source selection over GitHub Actions. Retain the existing timeout and invalid JSON cases. |
| 1 | The adapter supplies no summary, schema 3, a different repository, attempt, or revision, or too much output. The exact reason survives the proof read and wording. The reader sees a neutral ordinary absence or an oversized problem cue. | `dashboard/backend-tests/intent/ci-proof-memory-adapter-gaps.spec.ts`, with typed command replies or the runner's output-limit error. `dashboard/frontend-tests/intent/intent-ci-proof-adapter-states.spec.ts`, with typed CI status and proof replies, observes the unchanged verdict, attempt, exact reason, absent rows and computed border treatment. |
| 1 | Check again rereads status and requests proof for the newly checked judgment, even when it names the same attempt. | The same mounted unit spec, using successive `checkedAt` values with captured typed `readStatus` and `readProof` calls. Wait for the resulting rows before checking the calls. The adapter proof-memory spec owns exact command arguments. |
| 2 | An older failed attempt and a later successful retry share a pipeline and revision. The newer verdict names the retry, the rendered proof request addresses it, and its valid summary is reused when the reader refreshes. | `dashboard/backend-tests/intent/ci-adapter-retry-judgment.spec.ts` calls `judgeCommandAdapter` with real discovery and timed MakeMe replies. The mounted session verifies the retry's subject, verdict and rows. The existing `ci-proof-memory-adapter.spec.ts` proves the reader keeps a valid summary with no second command and distinguishes attempts of a run. |
| 3 | Another discovered attempt shares the ID at the revision, whether from a different check or a same-check run omitted from the verdict. Intent reports ambiguity with no counts and no proof request, including after Check again. | Reuse both real discovery assertions in `Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs`. In the mounted unit spec, supply the typed ambiguous judgment before and after refresh. Observe the current verdict, ambiguity line, absent rows and zero `readProof` calls. |

## Baseline and decisive premises

Observed in the owned macOS workspace on 2026-11-24 from `fe21e4639`, with
Node 24.21.0 and locked dependencies. Scratch changes were reverted.

| Consuming operation | Observed form and result |
| --- | --- |
| Existing E2E collection | `npm run --silent test:e2e -- e2e/intent/intent-ci-proof-adapter.spec.ts e2e/intent/intent-ci-proof-adapter-reasons.spec.ts --workers=2 --reporter=line` passed all 7 cases in 19.6 s of Playwright time. A previous run during plan 793, slice 4 at `4cc546a9c` plus the slice change, hit 33.7 s and 39.7 s for the eight-round case at load around 50. Private Dashboard setup occupied about 26 s. The earlier case passed in 11.2 s at load 25. This preparation observed the current journey and roster, with no timing claim at that historical load. |
| Combined journey through the real adapter | A scratch first case in `intent-ci-proof-adapter.spec.ts`, selected with `--grep 'proof is read through'`, observed the missing reason, unchanged verdict and no rows, then rows for the same numeric attempt and verdict after Check again (1 passed in 6.5 s). Leaving the proof unavailable after Check again failed at the proof-table assertion. |
| Dashboard unit seams and runners | The two existing `ci-proof-memory-adapter*.spec.ts` files passed all 9 cases after a scratch switch to direct Vitest imports via `npm run --silent test:dashboard:backend -- intent/ci-proof-memory-adapter.spec.ts intent/ci-proof-memory-adapter-gaps.spec.ts --workers=2 --reporter=line`. A scratch mounted `intent-ci-proof-adapter-states.spec.ts` passed under the frontend group command, proving numeric-to-text proof identity and a size-limit problem with no counts, plus the ambiguity line with zero proof reads. `makeMe.aCiProof.tooLarge(...)` supplies the size-limit shape. |
| Full command failure lines | A Node 24 smoke read called `readIntentCiProof` with a typed adapter subject and a temporary configured project. The real subprocess returned exit 2 with `unknown operation: proof`, then `{ attempts: [] }` on a separate read. `adapterUnavailableLine` emitted the same literal lines as the E2E assertions. |
| Discovery and command boundaries | A scratch `ci-adapter-retry-judgment.spec.ts` passed through the backend group with both attempts' discovery `time` set, using `passedWithoutTimes` for the retry. Dropping the newer retry's ordering timestamp left the older failed verdict. The focused Distribution runner passed `dashboard-story-branch-ci-adapter.test.mjs`, `dashboard-ci-adapter-proof.test.mjs`, `ci-proof-read-adapter.test.mjs`, and `ci-command-adapter-proof.test.mjs`, including same-check and different-check ambiguity, proof runner replies, and reported reasons. |

## Slices

### 1. Missing adapter proof and recovery use one composed workflow

Type: Structure
Status: planned

Prove each command or reader reason and the mounted presentation and refresh
before removing the eight-round matrix. Add the two real failing command
inputs through the existing Distribution proof fixture. In the backend gaps
spec, assert exact lines and preserve the existing invalid-answer retry and
memory assertions. In the mounted spec, isolate the status and proof replies
and observe both border treatments, absent rows and refresh. Consolidate the
meaningful reader workflow into the existing first adapter success journey.
The retry and ambiguity cases remain in place until their owning slices.

**Proof.** Run the scoped Distribution, backend, mounted frontend, and retained
E2E selections. Confirm the reason checks discriminate using scratch changes
at each moved rejection branch and the mounted UI flags. Preserve the E2E
journey's failure signal when Check again cannot recover the proof.

### 2. The retry's verdict and remembered proof have unit coverage

Type: Structure
Status: planned

Prove newest retry selection directly through `judgeCommandAdapter`. At the
mounted homepage, supply the resulting typed retry judgment and observe the
requested proof subject and displayed verdict and counts. Retain the already
observed reader memory assertions in plain Vitest and cover same-pipeline
attempts independently. Remove the retry case from the dedicated E2E file.

**Proof.** The judgment case discriminates older failed and newer successful
attempts. The mounted check observes only the retry's proof request and row.
The reader returns the retry's remembered counts on another read of that
attempt and does not invoke the external command again. Run the focused backend
and frontend groups and the remaining scoped E2E cases.

### 3. Ambiguous attempts have unit coverage and the reasons spec is retired

Type: Structure
Status: planned

Pair the existing discovery proof of both ambiguity shapes with one mounted UI
case. Use real refresh and wait for its fresh judgment before asserting that
no proof was requested and the passing verdict and explanation still show with
no counts. Delete the dedicated E2E file and update live test-header references
that point to it. Historical evidence remains recoverable through Git.

**Proof.** Run the discovery and mounted cases. Check that the mounted test
fails in scratch if the ambiguous request is allowed. Trace the retired file's
consumers and update their references. List and run the retained E2E selection
with four cases at the default timeout. Record the selected counts before and
after and compare measured wall and case time only under comparable conditions.

## Local gate and delivery

On macOS start awake on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
On battery start awake with the lid open, use `caffeinate -i`, and review the
sleep log. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep the default timeout and never use `test.slow()`.

Use `npm test -- <named Distribution paths>` with Bash 5 on `PATH`,
`npm run test:dashboard:backend -- <named specs> --workers=2 --reporter=line`,
and the equivalent `test:dashboard:frontend` command. Run
`npm run test:e2e -- e2e/intent/intent-ci-proof-adapter --workers=2 --reporter=line`
for the scoped roster during the migration. Use `--list` to verify the retained
roster. Run the tests behind any changed consumers identified by the shared
consumer trace. Complete the normal post-change refactor, staged lint and
Dashboard typecheck commit gates, and publication gates.

## Plan review

Separate slice-plan refinement was unnecessary. Each slice removes one
independent browser proof loop after its replacement proof is in place. The
three slices reuse the same proof and judgment owners. No slice-specific
concern remains in the reviewed scope.
