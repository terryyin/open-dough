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

## Execution context

Maki-chan resumed the published Take for publisher
`dashboard-territory.local-open-dough` in Story Branch Mode from
`/Users/terryyin/git/open-dough/.worktrees/prove-each-adapter-proof-reason-below-the-e2e-jo`.
The launch started at `49148297c960c48f30305b84b3417a49ba7f83f2` and accepted
the Take `91610ce0dc8c11e5296cd16a03d8ab30f96c4ece` on `origin/main` and
`origin/codex/prove-each-adapter-proof-reason-below-the-e2e-jo`. Work remains
in the linked checkout, with `origin/main` as the integration target. A
checkout-local `npm ci` and the focused Playwright listing with
`--reporter=list` verified the locked setup and seven-case baseline roster.

The Codex CI observer watches the published story branch via `ci.yml` (CI),
coordinator `adapter-proof-798`, directory `/tmp/dough-ci-501/watch-x4xTeu`,
stream session `30882`, PID `46004`, yielded cell `g3:7`. After the tool host
restarted, the prior observer was stopped with zero unread events and slice 2
was registered on the replacement without another push. The Take on trunk
predates story-branch observation.

The story branch accepted slice 1 at `f742e02fbbffc4a2d263694f284880b3ea0d9afb`
and registered it on this observer.

CI found that Distribution shard 2 exhausted its run deadline. The
[diagnosis](diagnosis-distribution-shard-2-deadline.md) records the timing
replay, the one-pattern move of 15 Git publication files, and proof that all
657 files remain selected exactly once with the same deadlines. The repair
was accepted on the story branch at `58a596796738df2e96cf327efc2d501342dd0a14`
and registered before the parked slice 2 work was restored.

All three Distribution jobs succeeded in the
[repair run](https://github.com/terryyin/open-dough/actions/runs/45300253934),
including both shares that moved checks. The next push superseded that workflow
under its same-branch concurrency setting. Slice 2 was accepted and registered
at `87eb8d1e4aef59f2abec1f4ef7b28a99544c816d`.

## Slices

### 1. Missing adapter proof and recovery use one composed workflow

Type: Structure
Status: done

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

**Accepted observations.** On Node 24.21.0 and Bash 5 with the AC sleep guard:

- `caffeinate -s -i npm test -- Distribution/tests/support/dashboard-ci-adapter-proof.test.mjs`
  passed. The temporary configured adapter and typed Intent attempt yielded the
  exact subprocess exit and envelope lines. Existing timeout and JSON cases still ran.
- `caffeinate -s -i npm run --silent test:dashboard:backend -- intent/ci-proof-memory-adapter-gaps.spec.ts --workers=2 --reporter=line`
  passed six cases. `ciAdapterProofReader` rejects all six inputs with their exact
  lines, and the five typed replies each recover and remember a valid summary.
- `caffeinate -s -i npm run --silent test:dashboard:frontend -- intent/intent-ci-proof-adapter-states.spec.ts --workers=2 --reporter=line`
  passed both cases. The mounted homepage distinguishes the border treatments and
  checks the refreshed time, proof subject, rows and verdict.
- `caffeinate -s -i npm run --silent test:e2e -- e2e/intent/intent-ci-proof-adapter --workers=2 --reporter=line`
  passed six cases. The configured adapter receives two requests for the same
  text-normalized attempt, with a visible absence followed by counts after Check
  again. Scratch breaks failed at the intended wording, styling and recovery
  assertions. `slice1-implementation.md` in the worktree's Git evidence directory
  indexes the focused runs, discriminating breaks and affected consumers.
  The same six scenarios passed after the independent review split the Given
  steps. The review found a live backend consumer of the adapter fixture's
  stderr option and retained that option.

### 2. The retry's verdict and remembered proof have unit coverage

Type: Structure
Status: done

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

**Accepted observations.** Under the same guarded local setup:

- `caffeinate -s -i npm run --silent test:dashboard:backend -- intent/ci-adapter-retry-judgment.spec.ts intent/ci-proof-memory-adapter.spec.ts --workers=2 --reporter=line`
  passed six cases. `judgeCommandAdapter` uses timed MakeMe replies from
  real discovery and names attempt 2. The memory reader returns different
  summaries for the two attempts and calls the command only for their two
  initial subjects. Scratch changes selecting the older judgment and omitting
  attempt IDs from the memory key failed at those assertions.
- `caffeinate -s -i npm run --silent test:dashboard:frontend -- intent/intent-ci-proof-adapter-states.spec.ts --workers=2 --reporter=line`
  passed three cases. The mounted retry judgment renders the verdict and
  count row for attempt 2 and gives the proof reader only that subject.
- `caffeinate -s -i npm run --silent test:e2e -- e2e/intent/intent-ci-proof-adapter --workers=2 --reporter=line`
  passed the five remaining browser cases after the retry case was removed.
  `slice2-implementation.md` in the Git evidence directory indexes the runs
  and the consumer trace.
- Independent review removed the unused `failed` adapter fixture example.
  The eight affected E2E cases across five files passed after the change.
  `slice2-refactor.md` indexes the exact selection, consumer trace and result.

### 3. Ambiguous attempts have unit coverage and the reasons spec is retired

Type: Structure
Status: done

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

**Accepted observations.** Under the guarded local setup:

- `caffeinate -s -i npm test -- Distribution/tests/support/dashboard-story-branch-ci-adapter.test.mjs Distribution/tests/support/dashboard-ci-adapter-proof.test.mjs`
  passed. The real discovery case marks the attempt ambiguous for both
  competing checks and an older same-check run omitted from the verdict. The
  configured adapter fixture still emits the precise command failure lines.
- `caffeinate -s -i npm run --silent test:dashboard:frontend -- intent/intent-ci-proof-adapter-states.spec.ts --workers=2 --reporter=line`
  passed four cases. The mounted ambiguity case waits for the new checked time
  and asserts the same verdict and explanation, zero proof reads and no rows.
  The refresh-only scratch break issued one proof request and failed the final
  zero-read assertion. The original production bytes were restored.
- The configured runner listed four cases in
  `e2e/intent/intent-ci-proof-adapter.spec.ts`, against seven across two files
  at the baseline. `caffeinate -s -i npm run --silent test:e2e -- e2e/intent/intent-ci-proof-adapter --workers=2 --reporter=line`
  passed all four at the default timeout in 7.8 s of Playwright time. The
  final run and preparation baseline lack matched load and per-case timings,
  so the roster reduction is the comparable observation.
- The retargeted live headers and their four Distribution files, GitHub
  reasons E2E, and backend wording owners passed their focused selections.
  `slice3-implementation.md` in the Git evidence directory indexes commands,
  production observations, and the trace. Historical references remain in Git.
- The independent refactor removed the retired case's unused fixture override.
  Seven affected E2E cases passed after re-establishing proof following the
  tool host restart, including all four retained adapter proof cases.

## Execution complete

Product advice: no change. The retained E2E workflow proves real adapter
recovery with the same verdict and attempt. Individual command, reader,
retry, ambiguity and presentation checks exercise their direct owners. The
seven-to-four browser roster reduction is observed at the default timeout.
The old and new wall times lack comparable load evidence. The existing
Dashboard unit renovation priorities still fit this result.

The review attributes the three slices to `f742e02fb`, `87eb8d1e4` and
`b9b2a1868`, and the separately tested Distribution shard repair to
`58a596796`. `91610ce0d` records the Take. The aggregate change leaves
Dashboard production paths untouched. The review found no correction to queue.
The process review recorded the late lint and type findings under ODF-329 in
`DearDough.md`. The final story-branch CI remained pending at review.

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
